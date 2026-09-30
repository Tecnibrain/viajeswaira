#!/usr/bin/env bash
# ============================================================
#  Configura Cloudflare automáticamente para viajeswaira.com
#  (se ejecuta desde GitHub Actions: workflow "Configurar dominio")
#
#  Hace, de forma idempotente (se puede ejecutar varias veces):
#   1. Verifica el token de API.
#   2. Crea el proyecto de Cloudflare Pages si no existe.
#   3. Agrega viajeswaira.com como zona (plan Free) si no existe,
#      copiando los registros MX/TXT actuales (correo) si los hay.
#   4. Crea los registros DNS CNAME @ y www -> <proyecto>.pages.dev (Proxied).
#   5. Conecta viajeswaira.com y www.viajeswaira.com al proyecto Pages.
#   6. Activa HTTPS: SSL Full (strict), Always Use HTTPS, TLS 1.2+.
#   7. Crea la redirección 301 www -> viajeswaira.com.
#   8. Muestra los NAMESERVERS que hay que poner en Namecheap.
#
#  Requiere: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (secretos).
#  No contiene ni imprime ninguna clave.
# ============================================================
set -uo pipefail

API="https://api.cloudflare.com/client/v4"
DOMAIN="${DOMAIN:-viajeswaira.com}"
PROJECT="${PROJECT_NAME:-viajeswaira}"
PROD_BRANCH="${PRODUCTION_BRANCH:-main}"
ACC="${CLOUDFLARE_ACCOUNT_ID:?Falta el secreto CLOUDFLARE_ACCOUNT_ID}"
: "${CLOUDFLARE_API_TOKEN:?Falta el secreto CLOUDFLARE_API_TOKEN}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/null}"
WARNINGS=0

cf() { # cf METHOD PATH [JSON]
  local args=(-sS -X "$1" "$API$2" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json")
  [ -n "${3:-}" ] && args+=(--data "$3")
  curl "${args[@]}" || echo '{"success":false,"errors":[{"message":"error de red"}]}'
}
ok() { jq -e '.success == true' >/dev/null 2>&1 <<<"$1"; }
errs() { jq -r '[.errors[]? | "\(.code // "") \(.message)"] | join("; ")' <<<"$1" 2>/dev/null; }
say() { echo "$*"; echo "$*" >>"$SUMMARY"; }
warn() { WARNINGS=$((WARNINGS + 1)); echo "::warning::$*"; echo "- ⚠️ $*" >>"$SUMMARY"; }
die() { echo "::error::$*"; echo "- ❌ $*" >>"$SUMMARY"; exit 1; }

say "## Configuración de Cloudflare para $DOMAIN"
say ""

# 1. Token -----------------------------------------------------------
r=$(cf GET "/accounts/$ACC/tokens/verify")
ok "$r" || r=$(cf GET "/user/tokens/verify")
ok "$r" || die "El token de API no es válido: $(errs "$r")"
say "- ✅ Token de API válido"

# 2. Proyecto Pages ---------------------------------------------------
r=$(cf GET "/accounts/$ACC/pages/projects/$PROJECT")
if ! ok "$r"; then
  r=$(cf POST "/accounts/$ACC/pages/projects" "$(jq -nc --arg n "$PROJECT" --arg b "$PROD_BRANCH" '{name:$n, production_branch:$b}')")
  ok "$r" || die "No se pudo crear el proyecto Pages '$PROJECT': $(errs "$r"). Revisa el permiso 'Cloudflare Pages: Edit'."
  say "- ✅ Proyecto Pages '$PROJECT' creado"
else
  say "- ✅ Proyecto Pages '$PROJECT' ya existe"
fi
SUB=$(jq -r '.result.subdomain' <<<"$r")
say "- 🌐 URL temporal: https://$SUB"

# 3. Zona (dominio) ---------------------------------------------------
r=$(cf GET "/zones?name=$DOMAIN&account.id=$ACC")
ZID=$(jq -r '.result[0].id // empty' <<<"$r")
if [ -z "$ZID" ]; then
  r=$(cf POST "/zones" "$(jq -nc --arg d "$DOMAIN" --arg a "$ACC" '{name:$d, account:{id:$a}, type:"full"}')")
  ok "$r" || die "No se pudo agregar $DOMAIN a Cloudflare: $(errs "$r"). Revisa el permiso 'Zone: Edit' (All zones from account)."
  ZID=$(jq -r '.result.id' <<<"$r")
  say "- ✅ Dominio $DOMAIN agregado a Cloudflare (plan Free)"
  # Copiar registros de correo existentes (MX y TXT de la raíz) para no romper el email
  if command -v dig >/dev/null; then
    while read -r prio host; do
      [ -z "$host" ] && continue
      host="${host%.}"
      case "$host" in *registrar-servers.com|*namecheap.com) continue ;; esac
      cf POST "/zones/$ZID/dns_records" "$(jq -nc --arg d "$DOMAIN" --arg h "$host" --argjson p "$prio" '{type:"MX",name:$d,content:$h,priority:$p,ttl:1}')" >/dev/null
      say "- ✅ Copiado registro MX → $host"
    done < <(dig +short MX "$DOMAIN" 2>/dev/null)
    while read -r txt; do
      [ -z "$txt" ] && continue
      val=$(sed -E 's/" "//g; s/^"//; s/"$//' <<<"$txt")
      cf POST "/zones/$ZID/dns_records" "$(jq -nc --arg d "$DOMAIN" --arg v "$val" '{type:"TXT",name:$d,content:$v,ttl:1}')" >/dev/null
      say "- ✅ Copiado registro TXT (${val:0:40}…)"
    done < <(dig +short TXT "$DOMAIN" 2>/dev/null)
  fi
else
  say "- ✅ Dominio $DOMAIN ya está en Cloudflare"
fi

# 4. Registros DNS ----------------------------------------------------
upsert_cname() { # nombre completo
  local name="$1" rec id type content
  rec=$(cf GET "/zones/$ZID/dns_records?name=$name")
  # borrar A/AAAA/CNAME que no apunten al proyecto (p. ej. parking de Namecheap)
  while read -r id type content; do
    [ -z "$id" ] && continue
    if [ "$type" = "CNAME" ] && [ "$content" = "$SUB" ]; then continue; fi
    cf DELETE "/zones/$ZID/dns_records/$id" >/dev/null
    say "- 🧹 Eliminado registro $type $name → $content"
  done < <(jq -r '.result[]? | select(.type=="A" or .type=="AAAA" or .type=="CNAME") | "\(.id) \(.type) \(.content)"' <<<"$rec")
  if jq -e --arg s "$SUB" '[.result[]? | select(.type=="CNAME" and .content==$s)] | length > 0' >/dev/null <<<"$rec"; then
    say "- ✅ DNS: CNAME $name → $SUB (ya existía)"
  else
    local r2
    r2=$(cf POST "/zones/$ZID/dns_records" "$(jq -nc --arg n "$name" --arg s "$SUB" '{type:"CNAME",name:$n,content:$s,proxied:true,ttl:1}')")
    ok "$r2" && say "- ✅ DNS: CNAME $name → $SUB (Proxied, TTL Auto)" || warn "No se pudo crear CNAME $name: $(errs "$r2")"
  fi
}
upsert_cname "$DOMAIN"
upsert_cname "www.$DOMAIN"

# 5. Dominios personalizados en Pages --------------------------------
for d in "$DOMAIN" "www.$DOMAIN"; do
  r=$(cf POST "/accounts/$ACC/pages/projects/$PROJECT/domains" "$(jq -nc --arg n "$d" '{name:$n}')")
  if ok "$r"; then say "- ✅ $d conectado al proyecto Pages"
  elif errs "$r" | grep -qi "already"; then say "- ✅ $d ya estaba conectado al proyecto Pages"
  else warn "No se pudo conectar $d a Pages: $(errs "$r")"; fi
done

# 6. HTTPS ------------------------------------------------------------
setting() { # id valor-json
  local r2
  r2=$(cf PATCH "/zones/$ZID/settings/$1" "{\"value\":$2}")
  ok "$r2" && say "- ✅ SSL/TLS: $1 = $2" || warn "No se pudo ajustar $1: $(errs "$r2") (permiso 'Zone Settings: Edit')"
}
setting ssl '"strict"'
setting always_use_https '"on"'
setting automatic_https_rewrites '"on"'
setting min_tls_version '"1.2"'

# 7. Redirección www -> raíz -----------------------------------------
rules=$(jq -nc --arg d "$DOMAIN" '{rules:[{
  description:"www a dominio raiz",
  expression:("(http.host eq \"www." + $d + "\")"),
  action:"redirect",
  action_parameters:{from_value:{status_code:301, preserve_query_string:true,
    target_url:{expression:("concat(\"https://" + $d + "\", http.request.uri.path)")}}}
}]}')
r=$(cf PUT "/zones/$ZID/rulesets/phases/http_request_dynamic_redirect/entrypoint" "$rules")
ok "$r" && say "- ✅ Redirección 301 www.$DOMAIN → $DOMAIN" \
  || warn "No se pudo crear la redirección www: $(errs "$r") (permiso 'Single Redirect: Edit'; se puede crear a mano, ver GUIA_PUBLICACION.md Paso 9)"

# 8. Estado final -----------------------------------------------------
z=$(cf GET "/zones/$ZID")
STATUS=$(jq -r '.result.status' <<<"$z")
say ""
say "### Estado del dominio: \`$STATUS\`"
if [ "$STATUS" != "active" ]; then
  say ""
  say "### 👉 ÚNICO PASO MANUAL: pon estos nameservers en Namecheap"
  say "Namecheap → Domain List → **Manage** (viajeswaira.com) → pestaña **Domain** → **NAMESERVERS** → **Custom DNS**:"
  say ""
  jq -r '.result.name_servers[]' <<<"$z" | nl -w1 -s'. ' | sed 's/^/    Nameserver /' | tee -a "$SUMMARY"
  say ""
  say "Guarda con el ✓ verde. Antes, en la pestaña **Advanced DNS**, desactiva **DNSSEC** si está activo."
  say "Cuando Cloudflare active el dominio (minutos a 24 h), vuelve a ejecutar este workflow para comprobarlo."
fi
say ""
say "### Dominios en Pages"
cf GET "/accounts/$ACC/pages/projects/$PROJECT/domains" | jq -r '.result[]? | "- \(.name): \(.status)"' | tee -a "$SUMMARY"
[ "$WARNINGS" -gt 0 ] && echo "Terminado con $WARNINGS advertencia(s)." || echo "Terminado sin advertencias."
exit 0
