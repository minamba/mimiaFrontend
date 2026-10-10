import { avecVisuel, classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireNombre, lireNombre, nombresDe,
} from './outils';

/**
 * LE POTAGER CLOS — « Le tour du jardin », 6e, 5e et 3e (09/10/2026). La
 * couverture : un potager clos de murets de pierre, des carrés de terre
 * bordés de briques, une fontaine, un jeune jardinier à l'arrosoir et au
 * chapeau de paille. La scène :
 *   - LA QUESTION : la figure de la question (son dessin coté, gardé tel
 *     quel) posée dans une plate-bande, la question sur une pancarte de bois ;
 *     la fontaine jaillit, des papillons passent, l'arrosoir se balance ;
 *   - LES RÉPONSES : des étiquettes de semis en bois (`objets`) ;
 *   - APRÈS LA RÉPONSE : le carnet du jardinier s'ouvre — la formule, puis
 *     les nombres, ligne à ligne. Pour un périmètre, la clôture se pose tout
 *     autour ; pour l'aire d'un rectangle, les carrés de terre se plantent un
 *     à un ; l'arrosoir verse sur le résultat.
 */
const P = 'sc-tour-du-jardin-college';

const e = (x) => ecrireNombre(Math.round(x * 1000) / 1000);
const pi = (x) => `${e(x)}π`;

/** L'arrondi demandé par la question. */
function arrondir(q, x) {
  if (/au dixième/.test(q)) return `≈ ${e(Math.round(x * 10) / 10)}`;
  if (/à l’unité/.test(q)) return `≈ ${e(Math.round(x))}`;
  return `≈ ${e(x)}`;
}

const AIRES = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'];
const VOLUMES = ['m³', 'dm³', 'cm³', 'mm³'];
const LITRES = { L: 'dm³', mL: 'cm³', cL: null, dL: null };

/** Les étapes d'une manche, et ce qui s'anime avec elles : { lignes, cloture?, carres? }. */
function calcul(m) {
  const q = m.question;
  const n = nombresDe(q);
  let r;
  // ---- périmètres
  if ((r = /^Rectangle de (\S+) cm sur (\S+) cm\. Périmètre/.exec(q))) {
    const [L, l] = [lireNombre(r[1]), lireNombre(r[2])];
    return { cloture: true, lignes: ['P = 2 × (longueur + largeur)', `P = 2 × (${e(L)} + ${e(l)}) = ${e(2 * (L + l))} cm`] };
  }
  if ((r = /^Carré de côté (\S+) cm\. (Périmètre|Aire)/.exec(q))) {
    const c = lireNombre(r[1]);
    return r[2] === 'Aire'
      ? { carres: [c, c], lignes: ['A = côté × côté', `A = ${e(c)} × ${e(c)} = ${e(c * c)} cm²`] }
      : { cloture: true, lignes: ['P = 4 × côté', `P = 4 × ${e(c)} = ${e(4 * c)} cm`] };
  }
  if (/^Triangle de côtés/.test(q) && /Périmètre/.test(q) && n.length >= 3) {
    return { cloture: true, lignes: ['P = la somme des trois côtés', `P = ${n.slice(0, 3).map(e).join(' + ')} = ${e(n[0] + n[1] + n[2])} cm`] };
  }
  // ---- aires
  if ((r = /^Rectangle de (\S+) cm sur (\S+) cm\. Aire/.exec(q))) {
    const [L, l] = [lireNombre(r[1]), lireNombre(r[2])];
    return { carres: [L, l], lignes: ['A = longueur × largeur', `A = ${e(L)} × ${e(l)} = ${e(L * l)} cm²`] };
  }
  if ((r = /^Triangle rectangle : les côtés de l’angle droit mesurent (\S+) cm et (\S+) cm/.exec(q))) {
    const [a, b] = [lireNombre(r[1]), lireNombre(r[2])];
    return { lignes: ['Un demi-rectangle : A = côté × côté ÷ 2', `A = ${e(a)} × ${e(b)} ÷ 2 = ${e((a * b) / 2)} cm²`] };
  }
  if ((r = /^Triangle : base (\S+) cm,.*?hauteur (\S+) cm\. Aire/.exec(q))) {
    const [b, h] = [lireNombre(r[1]), lireNombre(r[2])];
    return { lignes: ['A = base × hauteur ÷ 2 (l’autre côté ne sert pas)', `A = ${e(b)} × ${e(h)} ÷ 2 = ${e((b * h) / 2)} cm²`] };
  }
  if ((r = /^Parallélogramme : base (\S+) cm,.*?hauteur (\S+) cm\. Aire/.exec(q))) {
    const [b, h] = [lireNombre(r[1]), lireNombre(r[2])];
    return { lignes: ['A = base × hauteur (le côté oblique ne sert pas)', `A = ${e(b)} × ${e(h)} = ${e(b * h)} cm²`] };
  }
  // ---- cercles et disques
  if ((r = /^(Cercle|Disque) de (rayon|diamètre) (\S+) cm\. (Périmètre|Aire)/.exec(q))) {
    const v = lireNombre(r[3]);
    const rayon = r[2] === 'rayon' ? v : v / 2;
    const lignes = r[2] === 'diamètre' ? [`Le rayon : ${e(v)} ÷ 2 = ${e(rayon)} cm`] : [];
    if (r[4] === 'Périmètre') {
      lignes.push(`P = 2 × π × r = 2 × π × ${e(rayon)} = ${pi(2 * rayon)}`);
      if (!/π \?/.test(q)) lignes.push(`${pi(2 * rayon)} ${arrondir(q, 2 * Math.PI * rayon)}`);
      return { cloture: true, lignes };
    }
    lignes.push(`A = π × r² = π × ${e(rayon)}² = ${pi(rayon * rayon)}`);
    if (!/π \?/.test(q)) lignes.push(`${pi(rayon * rayon)} ${arrondir(q, Math.PI * rayon * rayon)}`);
    return { lignes };
  }
  // ---- volumes
  if (/^Pavé droit/.test(q) && n.length >= 3) {
    return { lignes: ['V = longueur × largeur × hauteur', `V = ${n.slice(0, 3).map(e).join(' × ')} = ${e(n[0] * n[1] * n[2])} cm³`] };
  }
  if ((r = /^Prisme droit : sa base est un triangle rectangle de côtés (\S+) cm et (\S+) cm.*?hauteur (\S+) cm/.exec(q))) {
    const [a, b, h] = [lireNombre(r[1]), lireNombre(r[2]), lireNombre(r[3])];
    const base = (a * b) / 2;
    return { lignes: ['V = aire de la base × hauteur', `Base : ${e(a)} × ${e(b)} ÷ 2 = ${e(base)} cm²`, `V = ${e(base)} × ${e(h)} = ${e(base * h)} cm³`] };
  }
  if ((r = /^Cylindre : rayon (\S+) cm, hauteur (\S+) cm/.exec(q))) {
    const [ra, h] = [lireNombre(r[1]), lireNombre(r[2])];
    return { lignes: ['V = π × r² × h', `V = π × ${e(ra)}² × ${e(h)} = ${pi(ra * ra * h)}`, `${pi(ra * ra * h)} ${arrondir(q, Math.PI * ra * ra * h)}`] };
  }
  if ((r = /^(Boule|Sphère) de (rayon|diamètre) (\S+) cm\. (Volume|Aire)/.exec(q))) {
    const v = lireNombre(r[3]);
    const ra = r[2] === 'rayon' ? v : v / 2;
    const lignes = r[2] === 'diamètre' ? [`Le rayon : ${e(v)} ÷ 2 = ${e(ra)} cm`] : [];
    const exact = r[4] === 'Volume' ? (4 / 3) * ra ** 3 : 4 * ra * ra;
    const formule = r[4] === 'Volume' ? `V = 4/3 × π × r³ = 4/3 × π × ${e(ra)}³` : `A = 4 × π × r² = 4 × π × ${e(ra)}²`;
    // Un coefficient de π qui ne tombe pas juste ne s'écrit pas : on passe directement à l'arrondi.
    if (!Number.isInteger(Math.round(exact * 1e6) / 1e6)) {
      lignes.push(`${formule} ${arrondir(q, Math.PI * exact)}`);
      return { lignes };
    }
    lignes.push(`${formule} = ${pi(exact)}`);
    if (!/π \?/.test(q)) lignes.push(`${pi(exact)} ${arrondir(q, Math.PI * exact)}`);
    return { lignes };
  }
  // ---- grandeurs composées
  if ((r = /^(\S+) m\/s = \? km\/h/.exec(q))) {
    const v = lireNombre(r[1]);
    return { lignes: [`En 1 h = 3 600 s : ${e(v)} × 3 600 = ${e(v * 3600)} m`, `${e(v * 3600)} m = ${e(v * 3.6)} km, en une heure`] };
  }
  if ((r = /^(\S+) km\/h = \? m\/s/.exec(q))) {
    const v = lireNombre(r[1]);
    return { lignes: [`${e(v)} km = ${e(v * 1000)} m, en 3 600 s`, `${e(v * 1000)} ÷ 3 600 = ${e(v / 3.6)} m/s`] };
  }
  if ((r = /débite (\S+) L\/s\. Combien de m³ par heure/.exec(q))) {
    const v = lireNombre(r[1]);
    return { lignes: [`En 1 h = 3 600 s : ${e(v)} × 3 600 = ${e(v * 3600)} L`, `1 m³ = 1 000 L : ${e(v * 3600)} L = ${e((v * 3600) / 1000)} m³`] };
  }
  // ---- conversions d'aires et de volumes
  if ((r = /^([\d\s  ]+(?:,\d+)?)\s*(\S+)\s*=\s*\?\s*(\S+)/.exec(q))) {
    const v = lireNombre(r[1]);
    const de = LITRES[r[2]] ?? r[2];
    const a = LITRES[r[3]] ?? r[3];
    const echelle = AIRES.includes(de) && AIRES.includes(a) ? [AIRES, 100] : [VOLUMES, 1000];
    const [liste, pas] = echelle;
    const i = liste.indexOf(de);
    const j = liste.indexOf(a);
    if (v === null || i < 0 || j < 0) return null;
    const facteur = pas ** Math.abs(j - i);
    const lignes = [];
    if (de !== r[2] || a !== r[3]) lignes.push('1 L = 1 dm³');
    lignes.push(`1 ${liste[Math.min(i, j)]} = ${e(facteur)} ${liste[Math.max(i, j)]} (${pas === 100 ? 'deux' : 'trois'} rangs par unité)`);
    lignes.push(j > i ? `${e(v)} × ${e(facteur)} = ${e(v * facteur)}` : `${e(v)} ÷ ${e(facteur)} = ${e(v / facteur)}`);
    return { lignes };
  }
  return null;
}

/** Les carrés de terre qui se plantent un à un (petits rectangles seulement). */
function Carres({ L, l }) {
  if (!Number.isInteger(L) || !Number.isInteger(l) || L > 14 || l > 14 || L * l > 160) return null;
  return (
    <span className={`${P}__carres`} style={{ '--cols': L }} aria-hidden="true">
      {Array.from({ length: L * l }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`${P}__carre`} style={{ '--d': `${(0.2 + i * (2 / (L * l))).toFixed(2)}s` }} />
      ))}
    </span>
  );
}

function contenu(m) {
  const c = calcul(m);
  if (!c) return null;
  return (
    <div className={`${P}__carnet${c.cloture ? ' avec-cloture' : ''}`}>
      {c.cloture && <span className={`${P}__cloture`} aria-hidden="true" />}
      {c.carres && <Carres L={c.carres[0]} l={c.carres[1]} />}
      <Etapes p={P} lignes={c.lignes} depart={c.carres ? 2.4 : 0.6} pas={0.8} />
      <span className={`${P}__arrosoir-verse`} aria-hidden="true" />
    </div>
  );
}

/** Le décor : le muret, la fontaine qui jaillit, deux papillons, l'arrosoir qui se balance. */
function Potager() {
  return (
    <div className={`${P}__potager`} aria-hidden="true">
      <span className={`${P}__muret`} />
      <span className={`${P}__fontaine`}>
        <span className={`${P}__jet`} />
        <span className={`${P}__jet ${P}__jet--2`} />
      </span>
      <span className={`${P}__papillon`} />
      <span className={`${P}__papillon ${P}__papillon--2`} />
      <span className={`${P}__arrosoir`} />
    </div>
  );
}

export function QuestionTourDuJardin({ m, termine }) {
  const c = termine ? calcul(m) : null;
  const retard = c ? (c.carres ? 2.4 : 0.6) + c.lignes.length * 0.8 : 1;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {!termine && <Potager />}
      {avecVisuel(m, (
        <div className={`${P}__pancarte`}>
          <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
        </div>
      ))}
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={retard} />}
    </div>
  );
}
