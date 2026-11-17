/**
 * LA FIGURE DE GÉOMÉTRIE, CONSTRUITE PAR L'ÉCRAN — Camara, le 11/11/2026. Une élève de 6e dicte son programme de
 * construction ; le professeur le « trace » au tableau en caractères, et deux tracés sont faux. Un modèle de langue
 * qui invente des coordonnées ne fait pas de perpendiculaire juste.
 *
 * LE PROFESSEUR NOMME, L'ÉCRAN CALCULE. Il écrit, dans son tableau :
 *
 *   [ARDOISE]
 *   [FIGURE]
 *   point A
 *   point B
 *   droite (AB)
 *   point C
 *   perpendiculaire à (AB) passant par C : (d)
 *   parallèle à (AB) passant par C : (d')
 *   [/FIGURE]
 *   [/ARDOISE]
 *
 * et chaque ligne devient un objet calculé au millimètre : la perpendiculaire est à 90°, avec son angle droit codé.
 * Le dessin produit est un SVG ordinaire, qui passe ensuite par le MÊME assainisseur et le même composant que tout
 * schéma du tableau (agrandir, zoomer, montrer du doigt) — voir `schemaSvg.js`.
 *
 * TOLÉRANT : une ligne incomprise est ignorée (et comptée dans `ignorees`), jamais bloquante. Un point utilisé sans
 * avoir été placé est placé d'office, à une position qui n'aligne pas trois points par hasard.
 *
 * Les unités sont des centimètres : « segment [AB] de 5 cm » mesure bien deux fois « 2,5 cm » à l'écran.
 */

export const OUVERTURE_FIGURE = '[FIGURE]';
export const FERMETURE_FIGURE = '[/FIGURE]';

const ECHELLE = 40; // pixels SVG par centimètre
const MARGE = 1.3; // en cm, autour de la figure
const DEMI_COTE_ANGLE_DROIT = 0.32; // cm

/** Places d'office : jamais trois alignées, réparties pour une figure lisible. */
const PLACES = [
  [0, 0], [6, 0.8], [2.3, 4.4], [7.2, 4.6], [-0.8, 3.2], [4.4, -1.6], [9, 1.6], [4.6, 6.6],
  [-2, 0.9], [8.4, -1], [1.2, 6.2], [10, 4.4],
];

// ------------------------------------------------------------------ calculs

const vec = (a, b) => ({ x: b.x - a.x, y: b.y - a.y });
const norme = (v) => Math.hypot(v.x, v.y);
const unitaire = (v) => { const n = norme(v) || 1; return { x: v.x / n, y: v.y / n }; };
const plus = (a, v, k = 1) => ({ x: a.x + v.x * k, y: a.y + v.y * k });
const normale = (v) => ({ x: -v.y, y: v.x });

/** Intersection de deux droites (point + direction), ou null si parallèles. */
function intersection(l1, l2) {
  const det = l1.d.x * l2.d.y - l1.d.y * l2.d.x;
  if (Math.abs(det) < 1e-9) return null;
  const w = vec(l1.p, l2.p);
  const t = (w.x * l2.d.y - w.y * l2.d.x) / det;
  return plus(l1.p, l1.d, t);
}

/** Projeté orthogonal d'un point sur une droite. */
function projete(point, ligne) {
  const d = unitaire(ligne.d);
  const t = (point.x - ligne.p.x) * d.x + (point.y - ligne.p.y) * d.y;
  return plus(ligne.p, d, t);
}

/** Les deux points d'intersection de deux cercles, celui « au-dessus » d'abord. */
function intersectionCercles(c1, r1, c2, r2) {
  const d = norme(vec(c1, c2));
  if (d < 1e-9 || d > r1 + r2 + 1e-9 || d < Math.abs(r1 - r2) - 1e-9) return null;
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const u = unitaire(vec(c1, c2));
  const base = plus(c1, u, a);
  const n = normale(u);
  return [plus(base, n, h), plus(base, n, -h)];
}

// ------------------------------------------------------------------ lecture

/** Minuscule, sans accents, apostrophes et espaces normalisés : les mots-clés se lisent en toute graphie. */
function normaliser(ligne) {
  return ligne
    .replace(/[’‘`]/g, "'")
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const sansAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const NOM_POINT = String.raw`[A-Z][0-9]*'*`;
const NOM_POINT_RE = new RegExp(`^${NOM_POINT}$`);
const NOMBRE = String.raw`-?\d+(?:[.,]\d+)?`;
const nombre = (s) => Number(String(s).replace(',', '.'));

/** « (AB) », « [AB] », « [AB) », « (d) », « (d') », « (d1) » → { genre, a, b, nom }. */
function lireLigne(texte) {
  const t = texte.trim();
  let m = t.match(new RegExp(`^\\((${NOM_POINT})(${NOM_POINT})\\)$`));
  if (m) return { genre: 'droite', a: m[1], b: m[2], cle: `(${m[1]}${m[2]})` };
  m = t.match(new RegExp(`^\\[(${NOM_POINT})(${NOM_POINT})\\]$`));
  if (m) return { genre: 'segment', a: m[1], b: m[2], cle: `[${m[1]}${m[2]}]` };
  m = t.match(new RegExp(`^\\[(${NOM_POINT})(${NOM_POINT})\\)$`));
  if (m) return { genre: 'demi', a: m[1], b: m[2], cle: `[${m[1]}${m[2]})` };
  m = t.match(/^\(([a-zA-ZΔ∆][0-9]*'*)\)$/);
  if (m) return { genre: 'nommee', nom: m[1], cle: `(${m[1]})` };
  return null;
}

/** Le nom donné au résultat : « : (d) », « → H », « nommée (d') », « appelée I ». */
function lireResultat(ligne) {
  const m = ligne.match(/(?:\s*(?::|→|->|=>)\s*|\s+(?:nommee|nommée|appelee|appelée|notee|notée)\s+)(\([^)]+\)|\[[^\]]+[\])]|[A-Z][0-9]*'*)\s*$/);
  if (!m) return { reste: ligne, nom: null };
  return { reste: ligne.slice(0, m.index).trim(), nom: m[1] };
}

/**
 * LE PROFESSEUR N'ÉCRIT PAS TOUJOURS LA SYNTAXE EXACTE — Camara, le 11/11/2026 : « mets le garde-fou directement ».
 * Avant de lire une ligne, on la ramène à la forme attendue : « 1. Trace la droite AB » → « droite (AB) »,
 * « (d) ⊥ (AB) passant par C » → « perpendiculaire à (AB) passant par C : (d) », « I est le milieu de [AB] » →
 * « milieu de [AB] : I ». Ce qui reste incompris est renvoyé au professeur (voir `lignesIncomprises`).
 */
const P = String.raw`[A-Z][0-9]*'*`;
const NOM_DROITE = String.raw`\((?:[A-Z][0-9]*'*){2}\)|\([a-zA-ZΔ∆][0-9]*'*\)`;
const REFERENCE = String.raw`(?:\((?:[A-Z][0-9]*'*){2}\)|\[(?:[A-Z][0-9]*'*){2}[\])]|\([a-zA-ZΔ∆][0-9]*'*\))`;

export function simplifierLigne(ligne) {
  let s = normaliser(ligne);

  // Puces et numéros : « 1. », « 2) », « - », « • ».
  s = s.replace(/^(?:\d+\s*[.)]|[-•*–])\s+/, '');
  // Un point final ou un deux-points de fin n'apporte rien.
  s = s.replace(/[.;]\s*$/, '');

  // Verbes et articles de tête, deux fois (« on trace la », « place le »).
  for (let i = 0; i < 2; i += 1) {
    s = s
      .replace(/^(?:on\s+)?(?:place[rsz]?|trace[rsz]?|construi[st]?|construire|dessine[rsz]?|marque[rsz]?|soi(?:t|ent)|cr[ée]e[rsz]?|ajoute[rsz]?)\s+/i, '')
      .replace(/^(?:les|le|la|un|une|des)\s+/i, '')
      .replace(/^l'\s*/i, '');
  }

  // « droite passant par A et B » → « droite (AB) ».
  s = s.replace(new RegExp(`^droite\\s+(?:passant|qui passe)\\s+par\\s+(${P})\\s+et\\s+(${P})`), 'droite ($1$2)');
  // Noms sans parenthèses ni crochets.
  s = s
    .replace(new RegExp(`^droite\\s+(${P})(${P})(?=\\s|$|:)`), 'droite ($1$2)')
    .replace(new RegExp(`^demi-droite\\s+(${P})(${P})(?=\\s|$|:)`), 'demi-droite [$1$2)')
    .replace(new RegExp(`^segment\\s+(${P})(${P})(?=\\s|$|:)`), 'segment [$1$2]');

  // Une référence seule : « (AB) » est une droite, « [AB] » un segment, « [AB) » une demi-droite.
  if (new RegExp(`^\\((${P})(${P})\\)(\\s*:.*)?$`).test(s)) s = `droite ${s}`;
  else if (new RegExp(`^\\[(${P})(${P})\\](\\s*(?:=|de|mesurant).*)?$`).test(s)) s = `segment ${s}`;
  else if (new RegExp(`^\\[(${P})(${P})\\)$`).test(s)) s = `demi-droite ${s}`;

  // « AB = 5 cm » → « segment [AB] de 5 cm ».
  s = s.replace(new RegExp(`^(${P})(${P})\\s*=\\s*(${NOMBRE})\\s*(?:cm)?$`), 'segment [$1$2] de $3 cm');

  // « A(2;3) » seul → « point A (2;3) ».
  if (new RegExp(`^${P}\\s*\\(\\s*${NOMBRE}\\s*[;,]`).test(s)) s = `point ${s}`;

  // Les symboles : « (d) ⊥ (AB) passant par C », « (d) // (AB) passant par C ».
  s = s.replace(new RegExp(`^(${NOM_DROITE})\\s*(?:⊥|perpendiculaire\\s+(?:à|a))\\s*(${REFERENCE})\\s+(.*)$`, 'i'), 'perpendiculaire à $2 $3 : $1');
  s = s.replace(new RegExp(`^(${NOM_DROITE})\\s*(?://|∥|parall[eè]le\\s+(?:à|a))\\s*(${REFERENCE})\\s+(.*)$`, 'i'), 'parallèle à $2 $3 : $1');
  // « (d) et (AB) se coupent en H » — AVANT la règle « en C » ci-dessous, qui en ferait « passant par H ».
  s = s.replace(new RegExp(`^(${REFERENCE})\\s+et\\s+(${REFERENCE})\\s+se coupent\\s+(?:en|au point)\\s+(${P})$`), 'intersection de $1 et $2 : $3');

  // « en C », « issue de C », « qui passe par C » → « passant par C ».
  if (/^(?:perpendiculaire|parall[eè]le)/i.test(s)) {
    s = s.replace(new RegExp(`\\s+(?:en|issue de|issue du point|qui passe par|passant par le point)\\s+(${P})(?=\\s*(?::|$))`), ' passant par $1');
  }

  // « I est le milieu de [AB] », « I milieu de [AB] » → « milieu de [AB] : I ».
  s = s.replace(new RegExp(`^(${P})\\s+(?:est\\s+)?(?:le\\s+)?milieu\\s+(?:de|du segment)\\s+(\\[${P}${P}\\])$`), 'milieu de $2 : $1');
  // « H = intersection de … », « H intersection de … ».
  s = s.replace(new RegExp(`^(${P})\\s*(?:=|est)?\\s*(?:le\\s+)?(?:point d'intersection|intersection)\\s+(.*)$`), "intersection $2 : $1");
  // « M' symétrique de M par rapport à (d) » ou « M' est le symétrique de … ».
  s = s.replace(new RegExp(`^(${P})\\s+(?:est\\s+)?(?:le\\s+)?(sym[ée]trique\\s+de\\s+.*)$`), '$2 : $1');

  // « cercle de centre O, de rayon 3 » : la virgule avant un complément tombe.
  s = s.replace(/,\s*(?=(?:de|et|passant)\b)/g, ' ');
  // « cercle C de centre … » / « cercle (C) de centre … ».
  s = s.replace(/^cercle\s+\(?[A-Za-z][0-9]*'*\)?\s+(?=de centre)/i, 'cercle ');
  // « de rayon 3 » sans unité, « rayon = 3 ».
  s = s.replace(/rayon\s*=\s*/i, 'rayon ');

  return s;
}

// ------------------------------------------------------------------ la figure

export function construireFigure(source) {
  const points = new Map();
  const lignes = new Map(); // cle → { p, d, genre, a, b, nom, dessinee }
  const cercles = [];
  const anglesDroits = [];
  const codages = []; // milieux : deux petits traits
  const ignorees = [];
  let rangPlace = 0;

  const placer = (nom) => {
    if (points.has(nom)) return points.get(nom);
    // Une place libre, loin des points déjà posés.
    let place;
    while (rangPlace < PLACES.length * 3) {
      const [x, y] = PLACES[rangPlace % PLACES.length];
      const decalage = Math.floor(rangPlace / PLACES.length) * 0.7;
      rangPlace += 1;
      const candidat = { x: x + decalage, y: y + decalage };
      if ([...points.values()].every((p) => norme(vec(p, candidat)) > 1.2)) { place = candidat; break; }
    }
    const p = place ?? { x: rangPlace, y: rangPlace * 0.5 };
    points.set(nom, p);
    return p;
  };

  const definir = (nom, p) => { points.set(nom, p); return p; };

  /** Une droite connue par sa clé ou par deux points ; null si on ne peut pas la situer. */
  const trouverLigne = (texte) => {
    const lue = lireLigne(texte);
    if (!lue) return null;
    if (lignes.has(lue.cle)) return lignes.get(lue.cle);
    if (lue.genre === 'nommee') return null;
    // (AB) cherché alors que [AB] ou [AB) existe, ou l'inverse : c'est la même droite support.
    for (const ligne of lignes.values()) {
      if (ligne.a && ((ligne.a === lue.a && ligne.b === lue.b) || (ligne.a === lue.b && ligne.b === lue.a))) return ligne;
    }
    const a = placer(lue.a);
    const b = placer(lue.b);
    return { p: a, d: unitaire(vec(a, b)), genre: lue.genre, a: lue.a, b: lue.b, dessinee: false };
  };

  const ajouterLigne = (lue, objet) => {
    const ligne = { ...objet, dessinee: true };
    lignes.set(lue.cle, ligne);
    return ligne;
  };

  const nommerLigne = (nom, ligne) => {
    const lue = nom ? lireLigne(nom) : null;
    if (lue?.genre === 'nommee') {
      ligne.nom = lue.nom;
      lignes.set(lue.cle, ligne);
    }
  };

  // La ligne d'origine est gardée pour le signalement : le serveur vérifie qu'elle est bien dans le message du
  // professeur avant de la lui renvoyer.
  const lignesSource = String(source ?? '')
    .replace(OUVERTURE_FIGURE, '')
    .replace(FERMETURE_FIGURE, '')
    .split('\n')
    .map((original) => ({ original: original.trim(), simple: simplifierLigne(original) }))
    .filter(({ simple }) => Boolean(simple));

  for (const { original, simple: brute } of lignesSource) {
    const ignorer = () => ignorees.push(original);
    const { reste: ligneSansNom, nom } = lireResultat(brute);
    const cle = sansAccents(ligneSansNom.toLowerCase());
    let m;

    // point A ; point A (2 ; 3) ; point A(2, 3)
    if ((m = ligneSansNom.match(new RegExp(`^points?\\s+(${NOM_POINT})\\s*\\(\\s*(${NOMBRE})\\s*[;,]\\s*(${NOMBRE})\\s*\\)$`, 'i')))) {
      definir(m[1], { x: nombre(m[2]), y: nombre(m[3]) });
      continue;
    }

    // point E sur (d) / sur [AB]
    if ((m = ligneSansNom.match(new RegExp(`^points?\\s+(${NOM_POINT})\\s+sur\\s+(.+)$`, 'i')))) {
      const ligne = trouverLigne(m[2]);
      if (!ligne) { ignorer(); continue; }
      if (!points.has(m[1])) {
        const surSegment = ligne.genre === 'segment' && ligne.a && ligne.b;
        const p = surSegment
          ? plus(points.get(ligne.a), vec(points.get(ligne.a), points.get(ligne.b)), 0.35)
          : plus(ligne.p, unitaire(ligne.d), 2.2 + (points.size % 3) * 0.8);
        definir(m[1], p);
      }
      continue;
    }

    // milieu de [AB] : I ; point I milieu de [AB]
    m = ligneSansNom.match(new RegExp(`^(?:points?\\s+(${NOM_POINT})\\s+)?milieu\\s+(?:de|du segment)\\s+\\[(${NOM_POINT})(${NOM_POINT})\\]$`, 'i'));
    if (m) {
      const nomMilieu = m[1] ?? (nom && NOM_POINT_RE.test(nom) ? nom : null);
      if (!nomMilieu) { ignorer(); continue; }
      const a = placer(m[2]);
      const b = placer(m[3]);
      const i = definir(nomMilieu, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      codages.push({ a, b: i }, { a: i, b });
      continue;
    }

    // points A, B, C (plusieurs d'un coup)
    if ((m = ligneSansNom.match(new RegExp(`^points?\\s+((?:${NOM_POINT}\\s*(?:,|et)?\\s*)+)(?:non alignes|non alignés)?$`, 'i')))) {
      m[1].split(/\s*(?:,|et|\s)\s*/).filter((n) => NOM_POINT_RE.test(n)).forEach(placer);
      continue;
    }

    // segment [AB] de 5 cm ; [AB] = 5 cm ; segment [AB]
    m = ligneSansNom.match(new RegExp(`^(?:segment\\s+)?\\[(${NOM_POINT})(${NOM_POINT})\\](?:\\s*(?:de|=|mesurant)\\s*(${NOMBRE})\\s*(?:cm)?)?$`, 'i'));
    if (m && (/^segment/i.test(ligneSansNom) || m[3])) {
      const a = placer(m[1]);
      if (m[3] && !points.has(m[2])) definir(m[2], plus(a, { x: 1, y: 0 }, nombre(m[3])));
      const b = placer(m[2]);
      ajouterLigne({ cle: `[${m[1]}${m[2]}]` }, { p: a, d: unitaire(vec(a, b)), genre: 'segment', a: m[1], b: m[2] });
      continue;
    }

    // droite (AB) ; demi-droite [AB)
    if ((m = ligneSansNom.match(/^(droite|demi-droite)\s+(.+)$/i))) {
      const lue = lireLigne(m[2]);
      if (!lue || !lue.a) { ignorer(); continue; }
      const a = placer(lue.a);
      const b = placer(lue.b);
      const ligne = ajouterLigne(lue, { p: a, d: unitaire(vec(a, b)), genre: lue.genre, a: lue.a, b: lue.b });
      nommerLigne(nom, ligne);
      continue;
    }

    // perpendiculaire / parallèle à (AB) passant par C : (d)
    m = cle.match(/^(?:la |une )?(?:droite )?(perpendiculaire|parallele)\s+(?:a|au segment|a la droite)?\s*(.+?)\s+(?:passant par|qui passe par|par)\s+([A-Z][0-9]*'*)$/i);
    if (m) {
      // Les noms gardent leur casse : on les relit dans la ligne d'origine.
      const origine = ligneSansNom.match(/(\([^)]+\)|\[[^\]]+[\])])\s+(?:passant par|qui passe par|par)\s+([A-Z][0-9]*'*)\s*$/i);
      const base = origine ? trouverLigne(origine[1]) : null;
      if (!base) { ignorer(); continue; }
      const par = placer(origine[2]);
      const perpendiculaire = m[1] === 'perpendiculaire';
      const d = perpendiculaire ? normale(unitaire(base.d)) : unitaire(base.d);
      const ligne = { p: par, d, genre: 'droite', dessinee: true };
      const cleLigne = `#${lignes.size}`;
      lignes.set(cleLigne, ligne);
      nommerLigne(nom, ligne);

      if (perpendiculaire) {
        const pied = projete(par, base);
        anglesDroits.push({ sommet: pied, u: unitaire(base.d), v: d, versPoint: par });
      }
      continue;
    }

    // intersection de (d) et (AB) : H ; H intersection de …
    m = ligneSansNom.match(new RegExp(`^(?:(${NOM_POINT})\\s+)?(?:point d'intersection|intersection)\\s+(?:de|des droites)\\s+(.+?)\\s+et\\s+(.+)$`, 'i'));
    if (m) {
      const nomPoint = m[1] ?? (nom && NOM_POINT_RE.test(nom) ? nom : null);
      const l1 = trouverLigne(m[2]);
      const l2 = trouverLigne(m[3]);
      const p = l1 && l2 ? intersection(l1, l2) : null;
      if (!nomPoint || !p) { ignorer(); continue; }
      definir(nomPoint, p);
      continue;
    }

    // cercle de centre O et de rayon 3 cm ; cercle de centre O passant par A
    m = ligneSansNom.match(new RegExp(`^cercle\\s+(?:\\(\\w+\\)\\s+)?de centre\\s+(${NOM_POINT})\\s+(?:et\\s+)?(?:de rayon\\s+(${NOMBRE})\\s*(?:cm)?|passant par\\s+(${NOM_POINT}))$`, 'i'));
    if (m) {
      const centre = placer(m[1]);
      const rayon = m[2] ? nombre(m[2]) : norme(vec(centre, placer(m[3])));
      if (rayon > 0) cercles.push({ centre, rayon }); else ignorer();
      continue;
    }

    // symétrique de A par rapport à (d) : A' ; … par rapport à O : A'
    m = ligneSansNom.match(new RegExp(`^(?:(${NOM_POINT})\\s+)?symetrique\\s+de\\s+(${NOM_POINT})\\s+par rapport (?:a|à)\\s+(.+)$`, 'i'))
      ?? sansAccents(ligneSansNom).match(new RegExp(`^(?:(${NOM_POINT})\\s+)?symetrique\\s+de\\s+(${NOM_POINT})\\s+par rapport a\\s+(.+)$`, 'i'));
    if (m) {
      const image = m[1] ?? (nom && NOM_POINT_RE.test(nom) ? nom : null);
      const source = placer(m[2]);
      const cible = m[3].trim();
      if (!image) { ignorer(); continue; }
      if (NOM_POINT_RE.test(cible)) {
        const o = placer(cible);
        definir(image, { x: 2 * o.x - source.x, y: 2 * o.y - source.y });
      } else {
        const axe = trouverLigne(cible);
        if (!axe) { ignorer(); continue; }
        const h = projete(source, axe);
        definir(image, { x: 2 * h.x - source.x, y: 2 * h.y - source.y });
      }
      continue;
    }

    // triangle ABC [rectangle en A | isocèle en A | équilatéral] [de côtés AB = 5, BC = 4, AC = 3]
    m = ligneSansNom.match(new RegExp(`^triangle\\s+(${NOM_POINT})(${NOM_POINT})(${NOM_POINT})(.*)$`, 'i'));
    if (m) {
      const [, n1, n2, n3, suite] = m;
      const s = sansAccents(suite.toLowerCase());
      const longueurs = {};
      for (const [, x, y, v] of suite.matchAll(new RegExp(`(${NOM_POINT})(${NOM_POINT})\\s*=\\s*(${NOMBRE})`, 'g'))) {
        longueurs[[x, y].sort().join('')] = nombre(v);
      }
      const lg = (x, y) => longueurs[[x, y].sort().join('')];

      if (!points.has(n1) && !points.has(n2) && !points.has(n3)) {
        const a = definir(n1, placer(n1));
        const rect = s.match(/rectangle en ([a-z][0-9]*'*)/i);
        const iso = s.match(/isocele en ([a-z][0-9]*'*)/i);
        if (s.includes('equilateral')) {
          const c = lg(n1, n2) ?? 4.5;
          definir(n2, plus(a, { x: 1, y: 0 }, c));
          definir(n3, plus(a, { x: 0.5, y: Math.sqrt(3) / 2 }, c));
        } else if (lg(n1, n2) && lg(n2, n3) && lg(n1, n3)) {
          const b = definir(n2, plus(a, { x: 1, y: 0 }, lg(n1, n2)));
          const sol = intersectionCercles(a, lg(n1, n3), b, lg(n2, n3));
          if (!sol) { ignorer(); continue; }
          definir(n3, sol[0].y >= a.y ? sol[0] : sol[1]);
        } else if (rect) {
          const sommet = [n1, n2, n3].find((n) => n.toLowerCase() === rect[1].toLowerCase()) ?? n1;
          const autres = [n1, n2, n3].filter((n) => n !== sommet);
          const o = sommet === n1 ? a : definir(sommet, a);
          if (sommet !== n1) points.delete(n1);
          definir(autres[0], plus(o, { x: 1, y: 0 }, lg(sommet, autres[0]) ?? 4.5));
          definir(autres[1], plus(o, { x: 0, y: 1 }, lg(sommet, autres[1]) ?? 3));
          anglesDroits.push({ sommet: o, u: { x: 1, y: 0 }, v: { x: 0, y: 1 } });
        } else if (iso) {
          const sommet = [n1, n2, n3].find((n) => n.toLowerCase() === iso[1].toLowerCase()) ?? n1;
          const autres = [n1, n2, n3].filter((n) => n !== sommet);
          const base = 4.5;
          const cote = lg(sommet, autres[0]) ?? lg(sommet, autres[1]) ?? 4;
          const h = Math.sqrt(Math.max(0.5, cote * cote - (base / 2) ** 2));
          points.delete(n1);
          const b = definir(autres[0], { x: 0, y: 0 });
          definir(autres[1], plus(b, { x: 1, y: 0 }, base));
          definir(sommet, { x: base / 2, y: h });
        } else {
          placer(n2);
          placer(n3);
        }
      } else {
        [n1, n2, n3].forEach(placer);
      }

      [[n1, n2], [n2, n3], [n1, n3]].forEach(([x, y]) => {
        const a = points.get(x);
        const b = points.get(y);
        ajouterLigne({ cle: `[${x}${y}]` }, { p: a, d: unitaire(vec(a, b)), genre: 'segment', a: x, b: y });
      });
      continue;
    }

    // rectangle ABCD de longueur 5 et de largeur 3 ; carré ABCD de côté 4
    m = sansAccents(ligneSansNom).match(new RegExp(`^(rectangle|carre)\\s+(${NOM_POINT})(${NOM_POINT})(${NOM_POINT})(${NOM_POINT})(.*)$`, 'i'));
    if (m) {
      const [, forme, n1, n2, n3, n4, suite] = m;
      const valeurs = [...suite.matchAll(new RegExp(NOMBRE, 'g'))].map((v) => nombre(v[0]));
      const longueur = valeurs[0] ?? (forme.toLowerCase() === 'carre' ? 4 : 5);
      const largeur = forme.toLowerCase() === 'carre' ? longueur : (valeurs[1] ?? 3);
      const a = placer(n1);
      const b = definir(n2, plus(a, { x: 1, y: 0 }, longueur));
      const c = definir(n3, plus(b, { x: 0, y: 1 }, largeur));
      const d = definir(n4, plus(a, { x: 0, y: 1 }, largeur));
      [[n1, n2], [n2, n3], [n3, n4], [n4, n1]].forEach(([x, y]) => {
        ajouterLigne({ cle: `[${x}${y}]` }, { p: points.get(x), d: unitaire(vec(points.get(x), points.get(y))), genre: 'segment', a: x, b: y });
      });
      [[a, b, d], [b, c, a], [c, d, b], [d, a, c]].forEach(([s, u, v]) => {
        anglesDroits.push({ sommet: s, u: unitaire(vec(s, u)), v: unitaire(vec(s, v)) });
      });
      continue;
    }

    // polygone ABCDE
    if ((m = ligneSansNom.match(/^(?:polygone|quadrilatere|quadrilatère)\s+([A-Z][0-9]*'*(?:[A-Z][0-9]*'*){2,})$/i))) {
      const noms = m[1].match(new RegExp(NOM_POINT, 'g'));
      noms.forEach(placer);
      noms.forEach((x, i) => {
        const y = noms[(i + 1) % noms.length];
        ajouterLigne({ cle: `[${x}${y}]` }, { p: points.get(x), d: unitaire(vec(points.get(x), points.get(y))), genre: 'segment', a: x, b: y });
      });
      continue;
    }

    ignorer();
  }

  return { points, lignes, cercles, anglesDroits, codages, ignorees };
}

// ------------------------------------------------------------------ dessin

const arrondi = (n) => Math.round(n * 10) / 10;

/** Le segment visible d'une droite dans le cadre [xmin, xmax] × [ymin, ymax]. */
function couperAuCadre(p, d, cadre, depuis = -Infinity) {
  const ts = [];
  if (Math.abs(d.x) > 1e-9) ts.push((cadre.xmin - p.x) / d.x, (cadre.xmax - p.x) / d.x);
  if (Math.abs(d.y) > 1e-9) ts.push((cadre.ymin - p.y) / d.y, (cadre.ymax - p.y) / d.y);
  const dedans = ts
    .map((t) => ({ t, q: plus(p, d, t) }))
    .filter(({ q }) => q.x >= cadre.xmin - 1e-6 && q.x <= cadre.xmax + 1e-6 && q.y >= cadre.ymin - 1e-6 && q.y <= cadre.ymax + 1e-6)
    .map(({ t }) => t)
    .sort((a, b) => a - b);
  if (dedans.length < 2) return null;
  const t0 = Math.max(dedans[0], depuis);
  const t1 = dedans[dedans.length - 1];
  return t1 > t0 ? [plus(p, d, t0), plus(p, d, t1)] : null;
}

/** Le SVG de la figure. `null` si rien n'a pu être construit. */
export function svgDeFigure(source) {
  const figure = construireFigure(source);
  const { points, lignes, cercles, anglesDroits, codages } = figure;

  const tous = [...points.values()];
  cercles.forEach(({ centre, rayon }) => {
    tous.push({ x: centre.x - rayon, y: centre.y - rayon }, { x: centre.x + rayon, y: centre.y + rayon });
  });
  if (tous.length === 0) return null;

  let xmin = Math.min(...tous.map((p) => p.x)) - MARGE;
  let xmax = Math.max(...tous.map((p) => p.x)) + MARGE;
  let ymin = Math.min(...tous.map((p) => p.y)) - MARGE;
  let ymax = Math.max(...tous.map((p) => p.y)) + MARGE;
  // Un cadre jamais minuscule : un point seul ne remplit pas le tableau.
  if (xmax - xmin < 6) { const c = (xmin + xmax) / 2; xmin = c - 3; xmax = c + 3; }
  if (ymax - ymin < 4.5) { const c = (ymin + ymax) / 2; ymin = c - 2.25; ymax = c + 2.25; }
  const cadre = { xmin, xmax, ymin, ymax };

  // Repère mathématique (y vers le haut) → SVG (y vers le bas).
  const X = (x) => arrondi((x - xmin) * ECHELLE);
  const Y = (y) => arrondi((ymax - y) * ECHELLE);
  const largeur = arrondi((xmax - xmin) * ECHELLE);
  const hauteur = arrondi((ymax - ymin) * ECHELLE);

  // UNE GRANDE FIGURE NE REND PAS SES NOMS ILLISIBLES : le tableau la réduit pour la faire tenir, alors traits,
  // croix et noms grossissent avec elle. Réglé pour une figure d'une dizaine de centimètres.
  const f = Math.max(1, (xmax - xmin) / 11, (ymax - ymin) / 8.5);
  const taille = arrondi(15 * f);
  const trait = arrondi(2 * f);
  const fin = arrondi(1.5 * f);

  const traits = [];
  const textes = [];
  const dejaDessinees = new Set();
  const traces = []; // les traits visibles, pour ranger les noms à l'écart
  const etiquettes = []; // les noms déjà posés

  const lignesAPlacer = [];
  for (const ligne of lignes.values()) {
    if (!ligne.dessinee || dejaDessinees.has(ligne)) continue;
    dejaDessinees.add(ligne);

    let bout;
    if (ligne.genre === 'segment') {
      bout = [points.get(ligne.a), points.get(ligne.b)];
    } else if (ligne.genre === 'demi') {
      bout = couperAuCadre(points.get(ligne.a), unitaire(vec(points.get(ligne.a), points.get(ligne.b))), cadre, 0);
    } else {
      bout = couperAuCadre(ligne.p, ligne.d, cadre);
    }
    if (!bout) continue;
    const [p, q] = bout;
    traces.push([p, q]);
    traits.push(`<line x1="${X(p.x)}" y1="${Y(p.y)}" x2="${X(q.x)}" y2="${Y(q.y)}" stroke="currentColor" stroke-width="${trait}" stroke-linecap="round"/>`);
    if (ligne.nom) lignesAPlacer.push({ nom: ligne.nom, p, q });
  }

  cercles.forEach(({ centre, rayon }) => {
    traits.push(`<circle cx="${X(centre.x)}" cy="${Y(centre.y)}" r="${arrondi(rayon * ECHELLE)}" fill="none" stroke="currentColor" stroke-width="${trait}"/>`);
  });

  /** Distance d'un point à un segment. */
  const auSegment = (m, [p, q]) => {
    const v = vec(p, q);
    const l2 = v.x * v.x + v.y * v.y || 1;
    const t = Math.max(0, Math.min(1, ((m.x - p.x) * v.x + (m.y - p.y) * v.y) / l2));
    return norme(vec(m, plus(p, v, t)));
  };

  /**
   * LA PLACE LA PLUS LIBRE pour un nom : parmi les candidats, celle qui est le plus loin des points, des traits et
   * des noms déjà posés. Un nom de droite tombait sur le nom d'un point (« (d)C »).
   */
  const placeLibre = (candidats, sauf) => {
    const autresPoints = [...points.values()].filter((p) => p !== sauf);
    let meilleur = candidats[0];
    let score = -Infinity;
    candidats.forEach((c) => {
      const s = Math.min(
        ...autresPoints.map((p) => norme(vec(c, p)) * 0.8),
        ...traces.map((t) => auSegment(c, t) * 1.6),
        ...etiquettes.map((e) => norme(vec(c, e)) * 0.7),
        // Rester dans le cadre.
        (c.x - cadre.xmin), (cadre.xmax - c.x), (c.y - cadre.ymin), (cadre.ymax - c.y),
        99,
      );
      if (s > score) { score = s; meilleur = c; }
    });
    etiquettes.push(meilleur);
    return meilleur;
  };

  // Les points d'abord : leur nom est le plus important.
  const croix = 0.13 * f;
  const directions = Array.from({ length: 12 }, (_, i) => ({ x: Math.cos((i * Math.PI) / 6), y: Math.sin((i * Math.PI) / 6) }));
  for (const [nom, p] of points) {
    traits.push(`<path d="M${X(p.x - croix)} ${Y(p.y - croix)}L${X(p.x + croix)} ${Y(p.y + croix)}M${X(p.x - croix)} ${Y(p.y + croix)}L${X(p.x + croix)} ${Y(p.y - croix)}" stroke="currentColor" stroke-width="${trait}" stroke-linecap="round"/>`);
    const ou = placeLibre(directions.map((d) => plus(p, d, 0.48 * f)), p);
    textes.push(`<text x="${X(ou.x)}" y="${Y(ou.y)}" font-size="${arrondi(taille * 1.13)}" font-weight="600" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke="none">${nom}</text>`);
  }

  // Puis les droites : leur nom près d'un bout, d'un côté ou de l'autre, là où il y a de la place.
  lignesAPlacer.forEach(({ nom, p, q }) => {
    const u = unitaire(vec(p, q));
    const n = normale(u);
    const candidats = [];
    [[q, -1], [p, 1]].forEach(([bout, sens]) => {
      [0.7, 1.4].forEach((recul) => {
        [1, -1].forEach((cote) => candidats.push(plus(plus(bout, u, sens * recul * f), n, cote * 0.4 * f)));
      });
    });
    const ou = placeLibre(candidats, null);
    textes.push(`<text x="${X(ou.x)}" y="${Y(ou.y)}" font-size="${taille}" font-style="italic" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke="none">(${nom})</text>`);
  });

  // L'angle droit codé : un petit carré dans le bon quart, du côté du point qui a servi à tracer.
  anglesDroits.forEach(({ sommet, u, v, versPoint }) => {
    const uu = u;
    let vv = v;
    if (versPoint && norme(vec(sommet, versPoint)) > 1e-6) {
      const w = vec(sommet, versPoint);
      if (w.x * vv.x + w.y * vv.y < 0) vv = { x: -vv.x, y: -vv.y };
    }
    const k = DEMI_COTE_ANGLE_DROIT * f;
    const a = plus(sommet, uu, k);
    const b = plus(plus(sommet, uu, k), vv, k);
    const c = plus(sommet, vv, k);
    traits.push(`<polyline points="${X(a.x)},${Y(a.y)} ${X(b.x)},${Y(b.y)} ${X(c.x)},${Y(c.y)}" fill="none" stroke="currentColor" stroke-width="${fin}"/>`);
  });

  // Les milieux : deux petits traits identiques sur chaque moitié.
  codages.forEach(({ a, b }) => {
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const n = normale(unitaire(vec(a, b)));
    const p = plus(m, n, 0.18 * f);
    const q = plus(m, n, -0.18 * f);
    traits.push(`<line x1="${X(p.x)}" y1="${Y(p.y)}" x2="${X(q.x)}" y2="${Y(q.y)}" stroke="currentColor" stroke-width="${fin}"/>`);
  });

  return `<svg viewBox="0 0 ${largeur} ${hauteur}" fill="none" stroke="currentColor">${traits.join('')}${textes.join('')}</svg>`;
}

/**
 * LES LIGNES QUE L'ÉCRAN N'A PAS SU DESSINER, dans un message du professeur — renvoyées au tour suivant pour qu'il
 * récrive sa figure (voir `chatSaga`, et côté serveur `LecteurFigure`). Telles qu'il les a écrites, 8 au plus.
 */
export function lignesIncomprises(texte) {
  if (!texte || !texte.includes(OUVERTURE_FIGURE)) return [];
  const blocs = [...String(texte).matchAll(/\[FIGURE\]([\s\S]*?)(?:\[\/FIGURE\]|$)/g)].map((m) => m[1]);
  return blocs.flatMap((bloc) => construireFigure(bloc).ignorees).filter(Boolean).slice(0, 8);
}

/** Ce contenu d'ardoise est-il une figure à construire ? */
export function estUneFigure(contenu) {
  return typeof contenu === 'string' && contenu.trimStart().startsWith(OUVERTURE_FIGURE);
}

/**
 * UNE FIGURE POSÉE HORS DU TABLEAU Y EST RANGÉE. La consigne demande [FIGURE] dans un [ARDOISE] ; s'il l'oublie,
 * le bloc s'afficherait en clair dans la bulle et la voix lirait « point A, point B… ». On l'enveloppe donc d'un
 * [ARDOISE], ouvert ou fermé comme lui (pendant le flux, la fermeture n'est pas encore arrivée).
 */
export function envelopperFigures(texte) {
  if (!texte || !texte.includes(OUVERTURE_FIGURE)) return texte;

  let sortie = '';
  let reste = texte;

  for (;;) {
    const debut = reste.indexOf(OUVERTURE_FIGURE);
    if (debut === -1) { sortie += reste; break; }

    const avant = reste.slice(0, debut);
    const deja = sortie + avant;
    const ardoiseOuverte = deja.lastIndexOf('[ARDOISE]') > deja.lastIndexOf('[/ARDOISE]');

    const apres = reste.slice(debut);
    const fin = apres.indexOf(FERMETURE_FIGURE);
    const bloc = fin === -1 ? apres : apres.slice(0, fin + FERMETURE_FIGURE.length);

    if (ardoiseOuverte) {
      sortie += avant + bloc;
    } else {
      sortie += `${avant}[ARDOISE]${bloc}${fin === -1 ? '' : '[/ARDOISE]'}`;
    }

    if (fin === -1) break;
    reste = apres.slice(fin + FERMETURE_FIGURE.length);
  }

  return sortie;
}
