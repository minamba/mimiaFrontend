/**
 * L'IMPORT D'UN DOSSIER DE SCHÉMAS — Camara, le 20/10/2026 : « un dossier
 * schémas, dedans les différentes classes, dedans les matières, et à
 * l'intérieur les schémas ; pour chaque schéma sa version muette qui finit
 * par -muette ».
 *
 * Ce module ne fait qu'ANALYSER la sélection : il range les fichiers en
 * paires (légendée + muette), les rattache aux emplacements du catalogue, et
 * dit ce qui ne va pas. L'envoi est fait par l'écran (`ImportDossierPlanches`).
 *
 * CE QUI EST PRIS : les images posées directement dans un dossier de matière.
 * CE QUI EST IGNORÉ : les sous-dossiers `sources` et `controles` (fabrication,
 * rapports), les licences et tout ce qui n'est pas une image.
 *
 * LES CRÉDITS : un schéma qui a un `sources/<clé>/CREDITS.txt` repose sur des
 * données de tiers (cartes) — il part avec ce crédit. Les autres sont des
 * figures produites par nous (« maison »).
 */
const IMAGES = /\.(png|svg|jpe?g|webp|gif)$/i;
const IGNORES = new Set(['sources', 'controles', 'contrôles']);

const TYPES = {
  png: 'image/png',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/** Le chemin du fichier dans le dossier choisi, découpé. */
const morceaux = (fichier) => (fichier.webkitRelativePath || fichier.name).split('/').filter(Boolean);

/** Le type d'une image, même quand le navigateur ne le donne pas. */
export function typeImage(fichier) {
  const extension = fichier.name.split('.').pop().toLowerCase();
  return fichier.type || TYPES[extension] || 'application/octet-stream';
}

/**
 * Les licences citées dans un CREDITS.txt, en une ligne courte (le champ en
 * base tient 120 caractères) : « CC BY-SA 2.5, CC BY-SA 3.0, GPL-3.0 ».
 */
export function licencesCitees(texte) {
  const trouvees = (texte ?? '').match(
    /CC BY(?:-NC)?(?:-SA)?(?:-ND)? \d\.\d|CC0(?: \d\.\d)?|GPL-?\d(?:\.\d)?|Licence Ouverte(?: \d\.\d)?|ODbL(?: \d\.\d)?|domaine public/gi,
  ) ?? [];
  // Écrites toujours de la même façon, quelle que soit la casse du fichier.
  const canonique = (l) => {
    const bas = l.toLowerCase();
    if (bas.startsWith('odbl')) return l.replace(/odbl/i, 'ODbL');
    if (bas === 'domaine public') return 'domaine public';
    if (bas.startsWith('licence ouverte')) return l.replace(/licence ouverte/i, 'Licence Ouverte');
    return l.toUpperCase().replace('CC0', 'CC0');
  };
  const uniques = [...new Map(trouvees.map((l) => [l.toLowerCase(), canonique(l)])).values()];
  const ligne = uniques.join(', ');
  return ligne.length > 120 ? `${ligne.slice(0, 117)}…` : ligne;
}

/**
 * `fichiers` : la sélection du dossier (FileList ou tableau).
 * `figures` : le catalogue, [{ cle, titre, niveau }].
 * `matiereDeLaCle` : la matière d'une clé, { code, libelle }.
 *
 * Rend { paires, inconnus, incompletes, ignores } :
 * - `paires` : [{ cle, titre, niveau, matiere, classe, legende, muette, credits }]
 *   — rattachées au catalogue, dans l'ordre des classes puis des clés ;
 * - `inconnus` : [{ cle, chemin }] — aucun emplacement à ce nom ;
 * - `incompletes` : [{ cle, manque: 'legende'|'muette' }] — une moitié seulement ;
 * - `ignores` : le nombre de fichiers laissés de côté.
 */
export function analyserDossier(fichiers, figures, matiereDeLaCle) {
  const parCle = new Map(figures.map((f) => [f.cle, f]));
  const trouvees = new Map();
  const credits = new Map();
  let ignores = 0;

  for (const fichier of Array.from(fichiers ?? [])) {
    const chemin = morceaux(fichier);
    const nom = chemin[chemin.length - 1];

    // Les crédits : …/sources/<clé>/CREDITS.txt.
    if (/^credits\.txt$/i.test(nom) && chemin.length >= 3 && chemin[chemin.length - 3].toLowerCase() === 'sources') {
      credits.set(chemin[chemin.length - 2].toLowerCase(), fichier);
      continue;
    }

    const dansUnDossierIgnore = chemin.slice(0, -1).some((d) => IGNORES.has(d.toLowerCase()));
    if (!IMAGES.test(nom) || dansUnDossierIgnore || chemin.length < 3) {
      ignores += 1;
      continue;
    }

    const base = nom.replace(/\.[^.]+$/, '').toLowerCase();
    const muette = /-muette$/.test(base);
    const cle = muette ? base.replace(/-muette$/, '') : base;

    const paire = trouvees.get(cle) ?? {
      cle,
      classe: chemin[chemin.length - 3],
      dossierMatiere: chemin[chemin.length - 2],
      chemin: chemin.slice(0, -1).join('/'),
      legende: null,
      muette: null,
    };
    if (muette) paire.muette = fichier;
    else paire.legende = fichier;
    trouvees.set(cle, paire);
  }

  const paires = [];
  const inconnus = [];
  const incompletes = [];

  for (const paire of trouvees.values()) {
    const figure = parCle.get(paire.cle);
    if (!figure) {
      inconnus.push({ cle: paire.cle, chemin: paire.chemin });
      continue;
    }
    if (!paire.legende) {
      incompletes.push({ cle: paire.cle, manque: 'legende' });
      continue;
    }
    if (!paire.muette) incompletes.push({ cle: paire.cle, manque: 'muette' });

    paires.push({
      ...paire,
      titre: figure.titre,
      niveau: figure.niveau,
      matiere: matiereDeLaCle(paire.cle),
      credits: credits.get(paire.cle) ?? null,
    });
  }

  paires.sort((a, b) => a.chemin.localeCompare(b.chemin, 'fr') || a.cle.localeCompare(b.cle, 'fr'));
  inconnus.sort((a, b) => a.chemin.localeCompare(b.chemin, 'fr'));

  return { paires, inconnus, incompletes, ignores };
}

/**
 * DÉJÀ À JOUR ? Une planche importée de la même taille est sautée : relancer
 * l'import après une coupure reprend donc où il s'était arrêté, sans tout
 * renvoyer. (Le serveur, lui, ne relit jamais une image identique.)
 */
export function dejaAJour(importee, fichier) {
  return Boolean(importee && fichier && Number(importee.taille) === fichier.size);
}
