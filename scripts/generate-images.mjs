/**
 * Genera ilustraciones SVG livianas (2–5 KB) para cada destino.
 * Son imágenes DEMO/ilustrativas propias (sin derechos de terceros).
 * Cuando tengas fotos reales, colócalas en public/img/ (formato .webp
 * recomendado, 1200x800) o súbelas desde el panel /admin.
 *
 * Uso: node scripts/generate-images.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../public/img/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 800;

const PALETTES = {
  day: { sky: ['#5ec8e5', '#bfe9f3'], sun: '#fff4c2', sea: ['#1aa6b7', '#0e7c86'], sand: '#f3dca6', far: '#7fb7a4', near: '#2f6f5e', sil: '#1d4d5a', win: '#fdf6d8' },
  sunset: { sky: ['#f9a45c', '#fde0b6'], sun: '#ffe08a', sea: ['#ee8a5e', '#9c4f6b'], sand: '#f0c48f', far: '#c77b7b', near: '#6e3d5a', sil: '#4a2748', win: '#ffd88a' },
  dusk: { sky: ['#2b3a67', '#b56576'], sun: '#fbe7c6', sea: ['#3d5a80', '#293241'], sand: '#c9a27e', far: '#51557e', near: '#2c2f4f', sil: '#1b1d33', win: '#ffd37a' },
};

const clouds = (c = '#ffffff', o = 0.8) => `
<g fill="${c}" opacity="${o}">
<ellipse cx="220" cy="150" rx="90" ry="26"/><ellipse cx="270" cy="132" rx="60" ry="30"/>
<ellipse cx="880" cy="110" rx="110" ry="24"/><ellipse cx="940" cy="94" rx="60" ry="26"/>
</g>`;

const sky = (p, sunX = 900, sunY = 260, r = 70) => `
<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
<linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sea[0]}"/><stop offset="1" stop-color="${p.sea[1]}"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#s)"/>
<circle cx="${sunX}" cy="${sunY}" r="${r}" fill="${p.sun}" opacity=".95"/>`;

const sea = (y = 500) => `
<rect y="${y}" width="${W}" height="${H - y}" fill="url(#w)"/>
<g stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round">
<path d="M80 ${y + 40}h120M420 ${y + 70}h160M820 ${y + 35}h140M260 ${y + 120}h180M700 ${y + 150}h200"/>
</g>`;

const sand = (p, y = 650) =>
  `<path d="M0 ${y} Q300 ${y - 40} 600 ${y - 10} T1200 ${y - 30} V800 H0Z" fill="${p.sand}"/>`;

const palm = (x, y, s = 1, c = '#1f4d3a') => `
<g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
<path d="M0 0 C10 -120 30 -220 60 -300 L72 -296 C46 -214 28 -120 18 0Z"/>
<path d="M66 -300 C10 -330 -60 -320 -110 -280 C-50 -300 10 -300 60 -290Z"/>
<path d="M66 -300 C120 -340 190 -330 230 -290 C170 -310 110 -305 70 -292Z"/>
<path d="M66 -300 C40 -360 -10 -390 -60 -380 C-10 -370 30 -340 62 -296Z"/>
<path d="M66 -300 C110 -370 170 -380 210 -360 C160 -355 110 -330 72 -294Z"/>
<path d="M66 -300 C60 -250 20 -200 -20 -180 C20 -220 45 -260 60 -296Z"/>
</g>`;

const mountains = (p, base = 520) => `
<path d="M0 ${base} L160 ${base - 180} L300 ${base - 60} L470 ${base - 240} L640 ${base - 50} L820 ${base - 210} L1000 ${base - 70} L1200 ${base - 190} V${base + 40} H0Z" fill="${p.far}"/>
<path d="M0 ${base + 30} L220 ${base - 70} L400 ${base + 10} L620 ${base - 110} L860 ${base + 20} L1060 ${base - 90} L1200 ${base} V${base + 80} H0Z" fill="${p.near}"/>`;

const skyline = (p, base = 600, seed = 1) => {
  let out = `<g fill="${p.sil}">`;
  let x = 0;
  let i = seed;
  const wins = [];
  while (x < W) {
    i = (i * 9301 + 49297) % 233280;
    const w = 50 + (i % 70);
    const h = 80 + (i % 190);
    out += `<rect x="${x}" y="${base - h}" width="${w - 6}" height="${h}"/>`;
    for (let wy = base - h + 16; wy < base - 20; wy += 28) {
      if ((wy + x) % 3 === 0) wins.push(`<rect x="${x + 10}" y="${wy}" width="8" height="10"/>`);
    }
    x += w;
  }
  return `${out}</g><g fill="${p.win}" opacity=".7">${wins.join('')}</g>`;
};

const LANDMARKS = {
  eiffel: (p) => `
<g fill="${p.sil}" transform="translate(600 640)">
<path d="M-8 -470 L8 -470 L14 -400 L22 -300 L-22 -300 L-14 -400Z"/>
<path d="M-40 -300 H40 L52 -210 H-52Z"/>
<path d="M-60 -210 H60 L130 0 H70 C50 -80 -50 -80 -70 0 H-130Z"/>
<rect x="-3" y="-500" width="6" height="36"/>
</g>`,
  colonial: (p) => `
<g fill="${p.sil}">
<rect x="0" y="520" width="1200" height="120"/>
<path d="M0 520 h1200 v-12 h-1200z" opacity=".6"/>
<rect x="520" y="300" width="120" height="240"/><path d="M510 300 L580 230 L650 300Z"/>
<rect x="566" y="190" width="28" height="44"/><circle cx="580" cy="340" r="26" fill="${p.win}"/>
<rect x="200" y="400" width="200" height="140"/><path d="M190 400 h220 l-20 -30 h-180z"/>
<rect x="780" y="380" width="260" height="160"/><path d="M800 380 q110 -110 220 0z"/>
</g>
<g fill="${p.win}" opacity=".85">
<rect x="230" y="430" width="24" height="36" rx="12"/><rect x="290" y="430" width="24" height="36" rx="12"/><rect x="350" y="430" width="24" height="36" rx="12"/>
<rect x="820" y="420" width="24" height="40" rx="12"/><rect x="890" y="420" width="24" height="40" rx="12"/><rect x="960" y="420" width="24" height="40" rx="12"/>
</g>`,
  pyramid: (p) => `
<g fill="${p.sil}" transform="translate(860 560)">
<path d="M-200 0 H200 L180 -40 H-180Z"/><path d="M-170 -40 H170 L150 -80 H-150Z"/>
<path d="M-140 -80 H140 L120 -120 H-120Z"/><path d="M-110 -120 H110 L90 -160 H-90Z"/>
<rect x="-40" y="-210" width="80" height="50"/><path d="M-18 0 H18 L10 -160 H-10Z" fill="${p.win}" opacity=".4"/>
</g>`,
  dome: (p) => `
<g fill="${p.sil}">
<rect x="420" y="380" width="360" height="220"/>
<path d="M500 380 q100 -170 200 0z"/><rect x="592" y="195" width="16" height="30"/>
<rect x="380" y="360" width="440" height="24"/>
</g>
<g fill="${p.win}" opacity=".75">
<rect x="450" y="420" width="30" height="50" rx="15"/><rect x="520" y="420" width="30" height="50" rx="15"/>
<rect x="650" y="420" width="30" height="50" rx="15"/><rect x="720" y="420" width="30" height="50" rx="15"/>
<rect x="585" y="470" width="30" height="130" rx="15"/>
</g>`,
  cablecar: (p) => `
<path d="M0 260 L1200 430" stroke="${p.sil}" stroke-width="3"/>
<g fill="${p.sil}" transform="translate(700 350)"><rect x="-3" y="0" width="6" height="30"/><rect x="-36" y="28" width="72" height="50" rx="10"/></g>
<g fill="${p.win}" transform="translate(700 350)"><rect x="-26" y="38" width="20" height="18"/><rect x="6" y="38" width="20" height="18"/></g>`,
  island: (p) => `
<ellipse cx="820" cy="505" rx="170" ry="26" fill="${p.sand}"/>
${palm(780, 505, 0.55, p.near)}${palm(860, 505, 0.45, p.near)}`,
  hammock: (p) => `
<path d="M300 560 Q420 640 540 560" stroke="${p.sil}" stroke-width="10" fill="none"/>`,
};

// Definición de escenas por destino
const SCENES = {
  cartagena: (p) => sky(p, 900, 230) + clouds() + sea(560) + LANDMARKS.colonial(p) + sand(p, 700),
  'san-andres': (p) =>
    sky(p, 300, 200) +
    clouds() +
    sea(470) +
    `<g opacity=".55"><rect y="560" width="1200" height="30" fill="#7ee0d6"/><rect y="610" width="1200" height="40" fill="#2cb7c9"/><rect y="670" width="1200" height="50" fill="#1b6fa8"/></g>` +
    LANDMARKS.island(p) +
    sand(p, 740) +
    palm(120, 800, 0.9, p.near),
  'santa-marta': (p) => sky(p, 950, 220) + clouds() + mountains(p, 470) + sea(530) + sand(p, 690) + palm(1040, 800, 0.8, p.near),
  medellin: (p) => sky(p, 250, 200) + clouds() + mountains(p, 430) + skyline(p, 660, 7) + LANDMARKS.cablecar(p) + `<rect y="660" width="1200" height="140" fill="${p.near}"/>`,
  cancun: (p) => sky(p, 300, 230) + clouds() + sea(520) + LANDMARKS.pyramid(p) + sand(p, 690) + palm(120, 800, 0.85, p.near),
  'punta-cana': (p) => sky(p, 620, 260, 90) + clouds() + sea(500) + sand(p, 640) + palm(200, 780, 1, p.near) + palm(980, 790, 1.1, p.near) + LANDMARKS.hammock(p),
  madrid: (p) => sky(p, 950, 200) + clouds() + skyline(p, 620, 3) + LANDMARKS.dome(p) + `<rect y="600" width="1200" height="200" fill="${p.near}"/>`,
  paris: (p) => sky(p, 280, 220) + clouds() + skyline(p, 660, 11) + LANDMARKS.eiffel(p) + `<rect y="640" width="1200" height="160" fill="${p.near}"/><path d="M0 700 h1200" stroke="${p.sea[0]}" stroke-width="30" opacity=".6"/>`,
  amazonas: (p) =>
    sky(p, 900, 200) + clouds() +
    `<path d="M0 420 Q150 300 300 400 T600 380 T900 400 T1200 360 V800 H0Z" fill="${p.far}"/>` +
    `<path d="M0 520 Q200 430 400 500 T800 480 T1200 470 V800 H0Z" fill="${p.near}"/>` +
    `<path d="M0 640 C300 600 500 700 700 640 S1100 600 1200 650 V800 H0Z" fill="${p.sea[1]}" opacity=".85"/>` +
    `<g fill="${p.sil}"><path d="M560 640 q60 -18 120 0 l-10 14 h-100z"/><rect x="598" y="618" width="4" height="22"/></g>` +
    palm(80, 800, 0.9, p.near) + palm(1120, 800, 0.8, p.near),
  guajira: (p) =>
    sky(p, 950, 230) + clouds() + sea(470) +
    `<path d="M0 560 Q250 470 520 540 T1200 520 V800 H0Z" fill="${p.sand}"/>` +
    `<path d="M0 650 Q300 590 640 640 T1200 620 V800 H0Z" fill="${p.sand}" opacity=".75"/>` +
    `<g fill="${p.sil}"><path d="M300 610 v-50 h6 v50z M303 560 l-40 50 h80z" opacity=".8"/><circle cx="820" cy="600" r="6"/><path d="M790 640 q30 -40 60 0z"/></g>`,
  covenas: (p) =>
    sky(p, 300, 220) + clouds() + sea(480) +
    `<g fill="${p.sil}"><rect x="640" y="520" width="480" height="10"/>${[660, 740, 820, 900, 980, 1060].map((x) => `<rect x="${x}" y="530" width="8" height="60"/>`).join('')}<path d="M1060 520 v-40 h60 v40z"/></g>` +
    sand(p, 680) + palm(160, 800, 0.95, p.near),
  girardot: (p) =>
    sky(p, 950, 220) + clouds() + mountains(p, 470) +
    `<rect y="540" width="1200" height="260" fill="${p.near}"/>` +
    `<rect x="160" y="600" width="620" height="120" rx="60" fill="${p.sea[0]}"/><rect x="190" y="620" width="560" height="80" rx="40" fill="${p.sea[1]}" opacity=".5"/>` +
    palm(90, 800, 0.9, p.sil) + palm(960, 790, 1, p.sil),
  guatape: (p) =>
    sky(p, 300, 200) + clouds() +
    `<path d="M0 520 Q300 460 600 510 T1200 490 V800 H0Z" fill="${p.far}"/>` +
    `<path d="M0 560 H1200 V800 H0Z" fill="${p.sea[0]}"/>` +
    `<path d="M520 560 C520 330 560 230 640 230 C720 230 760 330 760 560Z" fill="${p.sil}"/>` +
    `<path d="M600 250 L570 540" stroke="${p.win}" stroke-width="4" opacity=".6" stroke-dasharray="10 8"/>` +
    `<path d="M0 620 Q200 590 400 630 T800 610 T1200 630 V800 H0Z" fill="${p.near}"/>`,
  'santo-domingo': (p) => sky(p, 950, 220) + clouds() + sea(560) + LANDMARKS.colonial(p) + palm(1100, 780, 0.8, p.near),
  panama: (p) =>
    sky(p, 250, 200) + clouds() + sea(560) + skyline(p, 560, 5) +
    `<g stroke="${p.sil}" stroke-width="4" fill="none"><path d="M0 640 H1200"/><path d="M200 640 L300 590 L400 640 M800 640 L900 590 L1000 640"/></g>` +
    sand(p, 720),
  europa: (p) => sky(p, 950, 200) + clouds() + skyline(p, 640, 9) + LANDMARKS.dome(p) + `<rect y="620" width="1200" height="180" fill="${p.near}"/>`,
  hero: (p) => sky(p, 860, 300, 110) + clouds() + mountains(p, 480) + sea(540) + sand(p, 690) + palm(150, 800, 1.1, p.near) + palm(1080, 800, 0.9, p.near) +
    `<g fill="#ffffff" transform="translate(760 160) rotate(-8)"><path d="M0 0 L120 -8 L140 -2 L120 6Z"/><path d="M60 -3 L30 -40 L45 -40 L85 -4Z"/><path d="M62 2 L36 36 L50 36 L86 3Z"/></g>`,
};

const VARIANTS = ['day', 'sunset', 'dusk'];

const svg = (body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img"><title>${title} (ilustración)</title>${body}</svg>\n`;

const NAMES = {
  cartagena: 'Cartagena', 'san-andres': 'San Andrés', 'santa-marta': 'Santa Marta', medellin: 'Medellín',
  cancun: 'Cancún', 'punta-cana': 'Punta Cana', madrid: 'Madrid', paris: 'París', hero: 'Viajes Waira',
  amazonas: 'Amazonas', guajira: 'La Guajira', covenas: 'Coveñas', girardot: 'Girardot', guatape: 'Guatapé',
  'santo-domingo': 'Santo Domingo', panama: 'Panamá', europa: 'Europa',
};

let count = 0;
for (const [id, scene] of Object.entries(SCENES)) {
  VARIANTS.forEach((v, idx) => {
    const name = idx === 0 ? `${id}.svg` : `${id}-${idx + 1}.svg`;
    writeFileSync(new URL(name, OUT), svg(scene(PALETTES[v]), NAMES[id]));
    count++;
  });
}
console.log(`✔ ${count} ilustraciones generadas en public/img/`);
