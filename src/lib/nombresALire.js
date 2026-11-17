/**
 * LA LECTURE DES NOMBRES AU TABLEAU — Camara, le 12/11/2026 : « tu peux tout construire sur la même base que l'exercice
 * des syllabes et des mots ». Le serveur choisit le nombre (LectureDesNombres.cs) et l'écrit dans une balise
 * « [LECTURE_IMAGE:nombre]cible[/LECTURE_IMAGE] » ; la cible est une écriture simple : « 73 », « 3,25 », « -5 », « 3/4 »,
 * « 10^-3 », « (-2)^2 », « 2,5x10^4 », « 3rac2 ».
 *
 * L'IMAGE : `images-mots/nombres/<clé>.webp` (dossier de données déjà servi, aucun montage de plus). La clé est celle du
 * PDF « Mimia - Nombres a illustrer » (nb-73, nb-3v25, nb-m5, fr-3-4, pu-10-m3, sci-2v5-4, rac-3-2…).
 *
 * SANS IMAGE, LE NOMBRE S'ÉCRIT : tant que l'image n'est pas déposée (ou ne se charge pas), le tableau écrit le nombre
 * en grand, fraction et exposant compris. L'exercice marche donc avant les images.
 */

const s = (t) => t.replace('-', 'm').replace('+', 'p').replace(',', 'v');

/** Le nom de l'image d'une cible, comme dans le PDF ; null pour une écriture inconnue. */
export function cleDuNombre(cible) {
  const c = String(cible ?? '').trim();
  let m;
  if ((m = c.match(/^([+-]?)(\d+(?:,\d+)?)$/))) return `nb-${s(m[1])}${m[2].replace(',', 'v')}`;
  if ((m = c.match(/^(-?)(\d+)\/(\d+)$/))) return `fr-${m[1] ? 'm' : ''}${m[2]}-${m[3]}`;
  if ((m = c.match(/^\(-(\d+)\)\^(-?\d+)$/))) return `pu-pm${m[1]}-${s(m[2])}`;
  if ((m = c.match(/^(-?)(\d+)\^(-?\d+)$/))) return `pu-${m[1] ? 'm' : ''}${m[2]}-${s(m[3])}`;
  if ((m = c.match(/^(\d+(?:,\d+)?)x10\^(-?\d+)$/))) return `sci-${m[1].replace(',', 'v')}-${s(m[2])}`;
  if ((m = c.match(/^(-?)(\d*)rac(\d+)$/))) return `rac-${m[1] ? 'm' : ''}${m[2] ? `${m[2]}-` : ''}${m[3]}`;
  return null;
}

export const imageDuNombre = (cible) => {
  const cle = cleDuNombre(cible);
  return cle ? `${process.env.REACT_APP_API_URL ?? ''}/images-mots/nombres/${cle}.webp` : null;
};

/** « 12345 » → « 12 345 » (espace fine insécable), « -5 » → « −5 », « 3,25 » inchangé. */
export function ecrireNombre(texte) {
  const t = String(texte ?? '');
  const m = t.match(/^([+-]?)(\d+)(,\d+)?$/);
  if (!m) return t.replace('-', '−');
  const entier = m[2].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${m[1] === '-' ? '−' : m[1]}${entier}${m[3] ?? ''}`;
}

/**
 * LES MORCEAUX À DESSINER, pour le composant du tableau :
 *  { genre: 'nombre', texte } | { genre: 'fraction', signe, num, den } | { genre: 'puissance', base, exposant }
 *  | { genre: 'scientifique', mantisse, exposant } | { genre: 'racine', signe, coef, sous }.
 */
export function formeDuNombre(cible) {
  const c = String(cible ?? '').trim();
  let m;
  if ((m = c.match(/^(-?)(\d+)\/(\d+)$/))) return { genre: 'fraction', signe: m[1] ? '−' : '', num: m[2], den: m[3] };
  if ((m = c.match(/^(\(-\d+\)|-?\d+)\^(-?\d+)$/))) return { genre: 'puissance', base: m[1].replace('-', '−'), exposant: m[2].replace('-', '−') };
  if ((m = c.match(/^(\d+(?:,\d+)?)x10\^(-?\d+)$/))) return { genre: 'scientifique', mantisse: m[1], exposant: m[2].replace('-', '−') };
  if ((m = c.match(/^(-?)(\d*)rac(\d+)$/))) return { genre: 'racine', signe: m[1] ? '−' : '', coef: m[2], sous: m[3] };
  return { genre: 'nombre', texte: ecrireNombre(c) };
}

/** Le nombre dit en clair pour un lecteur d'écran (sans donner sa lecture : « fraction 3 sur 4 »). */
export function libelleDuNombre(cible) {
  const f = formeDuNombre(cible);
  if (f.genre === 'fraction') return `fraction ${f.signe}${f.num} sur ${f.den}`;
  if (f.genre === 'puissance') return `${f.base} exposant ${f.exposant}`;
  if (f.genre === 'scientifique') return `${f.mantisse} fois 10 exposant ${f.exposant}`;
  if (f.genre === 'racine') return `${f.signe}${f.coef} racine de ${f.sous}`;
  return f.texte;
}
