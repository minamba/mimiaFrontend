/**
 * « J'ai contrôle vendredi en maths à 11h sur le théorème de Thalès. »
 *
 * Lit une phrase dite au micro et en tire les quatre champs du formulaire :
 * matière, date, heure, sujet.
 *
 * POURQUOI C'EST DU CODE ET NON UN APPEL AU MODÈLE
 * ------------------------------------------------
 * Tout ce qu'il y a à comprendre ici est fermé : sept jours de la semaine,
 * douze mois, une liste de matières que l'enfant a déjà sur son compte, et une
 * arithmétique de calendrier. Rien de tout cela ne se devine — ça se calcule.
 *
 * Un appel au modèle coûterait une seconde d'attente à chaque phrase, une
 * facture à chaque ajout de contrôle, et rendrait « vendredi prochain »
 * imprévisible d'une fois sur l'autre. Ici, la même phrase donne toujours la
 * même date, et chaque règle se vérifie par un test.
 *
 * LA MATIÈRE VIENT D'UNE LISTE FERMÉE, JAMAIS DU TEXTE. On rapproche ce qui a
 * été dit des matières réellement ouvertes sur le compte de l'enfant. Un mot
 * qu'on ne reconnaît pas ne crée rien et ne sélectionne rien : le champ reste
 * vide et l'enfant choisit.
 */

const normaliser = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    // LE TRAIT D'UNION COMPTE AUTANT QUE L'APOSTROPHE, et l'oublier coûtait
    // « après-demain » : le motif s'écrit en mots séparés et ne s'y retrouvait
    // pas. Les deux côtés du rapprochement passent par ici, donc
    // « histoire-géographie » reste comparable à lui-même.
    .replace(/['’\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

/** Lundi = 1 … dimanche = 0, comme `Date.getDay()`. */
const JOURS = {
  dimanche: 0, lundi: 1, mardi: 2, mercredi: 3,
  jeudi: 4, vendredi: 5, samedi: 6,
};

const MOIS = {
  janvier: 0, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, aout: 7, septembre: 8, octobre: 9, novembre: 10, decembre: 11,
};

/**
 * Les mots qui repoussent d'une semaine.
 *
 * « prochain » est traité à part de « la semaine prochaine » : le premier veut
 * dire « la prochaine fois que ce jour arrive », le second « ce jour-là, dans
 * la semaine qui suit ». Sur un samedi, les deux tombent au même endroit ; un
 * mardi, non — « vendredi prochain » est dans trois jours, « vendredi de la
 * semaine prochaine » dans dix.
 */
const SEMAINE_PROCHAINE = /\b(?:de la |la )?semaine (?:prochaine|d apres|qui vient)\b/;
const PROCHAIN = /\bprochain\b/;

const aMinuit = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const ajouterJours = (date, jours) => {
  const copie = aMinuit(date);
  copie.setDate(copie.getDate() + jours);
  return copie;
};

/** Le lundi de la semaine qui contient cette date. */
const lundiDeLaSemaine = (date) => {
  const jour = date.getDay();
  // Dimanche (0) appartient à la semaine qui commence six jours plus tôt.
  return ajouterJours(date, jour === 0 ? -6 : 1 - jour);
};

/**
 * LA DATE, DÉDUITE DE CE QUI A ÉTÉ DIT ET DU JOUR OÙ ON EST.
 *
 * Les règles, dans l'ordre où elles sont essayées :
 *
 * 1. « aujourd'hui », « demain », « après-demain » — sans ambiguïté ;
 * 2. un jour chiffré (« le 14 septembre », « 14/09 ») — on croit ce qui est
 *    dit, et on bascule sur l'année suivante si la date est déjà passée ;
 * 3. un jour de la semaine (« vendredi ») — la PROCHAINE fois qu'il arrive.
 *
 * POUR LE POINT 3, LE CAS QUI DÉCIDE DE TOUT. « J'ai contrôle vendredi » dit
 * un mardi désigne le vendredi de cette semaine ; dit un samedi, il ne peut
 * désigner que celui d'après — c'est l'exemple donné par Camara. Prendre « la
 * prochaine occurrence » couvre les deux d'un coup, sans avoir à raisonner sur
 * les semaines.
 *
 * Dit LE JOUR MÊME, « vendredi » veut dire aujourd'hui : un enfant qui prévient
 * le matin d'un contrôle de l'après-midi ne dit pas « vendredi prochain ».
 * `prochain` lève cette exception, et repousse alors d'une semaine entière.
 */
export function deduireDate(texte, maintenant = new Date()) {
  // NORMALISÉ ICI ET NON PAR L'APPELANT. Ces fonctions sont exportées pour
  // être testables une par une ; exiger un texte déjà nettoyé en ferait des
  // pièges, qui rendraient `null` sur « aujourd'hui » et « après-demain »
  // sans rien signaler. La normalisation ne coûte rien et elle est idempotente.
  const propre = normaliser(texte);
  const aujourdhui = aMinuit(maintenant);

  if (/\baujourd hui\b/.test(propre)) return aujourdhui;
  if (/\bapres demain\b/.test(propre)) return ajouterJours(aujourdhui, 2);
  if (/\bdemain\b/.test(propre)) return ajouterJours(aujourdhui, 1);

  const dansNJours = propre.match(/\bdans (\d{1,2}) jours?\b/);
  if (dansNJours) return ajouterJours(aujourdhui, Number(dansNJours[1]));

  // « le 14 septembre », « 14 septembre »
  const avecMois = propre.match(
    new RegExp(`\\b(\\d{1,2})\\s+(${Object.keys(MOIS).join('|')})\\b`),
  );

  if (avecMois) {
    return dateExplicite(
      aujourdhui, Number(avecMois[1]), MOIS[avecMois[2]],
    );
  }

  // « 14/09 » — l'année dite est ignorée : un contrôle se prend à quelques
  // semaines, jamais à plusieurs années.
  //
  // La barre seulement, et pas le tiret : la normalisation vient de le
  // remplacer par une espace (voir `normaliser`), donc « 14-09 » n'arrive
  // jamais jusqu'ici. Le laisser dans le motif ferait croire qu'il est géré.
  const numerique = propre.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (numerique) {
    return dateExplicite(
      aujourdhui, Number(numerique[1]), Number(numerique[2]) - 1,
    );
  }

  const nomJour = Object.keys(JOURS).find(
    (jour) => new RegExp(`\\b${jour}\\b`).test(propre),
  );

  if (!nomJour) return null;

  const cible = JOURS[nomJour];
  let ecart = (cible - aujourdhui.getDay() + 7) % 7;

  if (SEMAINE_PROCHAINE.test(propre)) {
    // Ancré sur le lundi de la semaine suivante, et non sur « +7 » : dit un
    // samedi, « mardi de la semaine prochaine » doit tomber dans trois jours,
    // pas dans dix.
    const lundiProchain = ajouterJours(lundiDeLaSemaine(aujourdhui), 7);
    const depuisLundi = (cible + 6) % 7; // lundi = 0 … dimanche = 6
    return ajouterJours(lundiProchain, depuisLundi);
  }

  // « vendredi prochain » un vendredi : la semaine d'après, pas aujourd'hui.
  if (ecart === 0 && PROCHAIN.test(propre)) ecart = 7;

  return ajouterJours(aujourdhui, ecart);
}

/**
 * Une date dont le jour et le mois sont dits. L'année n'est jamais dite : on
 * prend celle en cours, et la suivante si c'est déjà passé — « le 3 janvier »
 * annoncé en décembre parle de l'année d'après.
 */
function dateExplicite(aujourdhui, jour, mois) {
  if (!(jour >= 1 && jour <= 31) || !(mois >= 0 && mois <= 11)) return null;

  const candidate = new Date(aujourdhui.getFullYear(), mois, jour);
  if (candidate.getMonth() !== mois) return null; // 31 février

  return candidate < aujourdhui
    ? new Date(aujourdhui.getFullYear() + 1, mois, jour)
    : candidate;
}

/**
 * L'HEURE, seulement si elle est dite.
 *
 * « à 11h », « 11h30 », « à 11 heures », « 14 h 15 ». On ne devine pas une
 * heure absente : un contrôle sans créneau connu reste sans créneau, le champ
 * est facultatif exprès.
 */
export function deduireHeure(texte) {
  const propre = normaliser(texte);
  const forme = propre.match(/\b(\d{1,2})\s*(?:h|heures?)\s*(\d{1,2})?\b/);
  if (!forme) return null;

  const heures = Number(forme[1]);
  const minutes = Number(forme[2] ?? 0);

  if (heures > 23 || minutes > 59) return null;

  return `${String(heures).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Les mots par lesquels un enfant nomme une matière.
 *
 * FERMÉE ET VOLONTAIREMENT COURTE : chaque entrée doit être un mot qu'aucune
 * autre matière ne pourrait revendiquer. Le rapprochement se fait ensuite
 * contre les matières RÉELLEMENT ouvertes sur le compte — cette table ne crée
 * rien, elle ne fait que traduire.
 */
const SYNONYMES = [
  [/\bmaths?\b|\bmathematiques?\b|\bmathe?\b/, 'MATHS'],
  [/\bfrancais\b|\bfrancai\b/, 'FRANCAIS'],
  [/\banglais\b/, 'ANGLAIS'],
  [/\bespagnol\b/, 'ESPAGNOL'],
  [/\ballemand\b/, 'ALLEMAND'],
  [/\bitalien\b/, 'ITALIEN'],
  [/\bchinois\b/, 'CHINOIS'],
  [/\bsvt\b|\bbio\b|\bbiologie\b|\bsciences de la vie\b/, 'SVT'],
  [/\bphysique\b|\bchimie\b|\bphysique chimie\b/, 'PHYSIQUE_CHIMIE'],
  [/\bhistoire\b|\bgeo\b|\bgeographie\b|\bhistoire geo\b/, 'HISTOIRE_GEO'],
  [/\bphilo\b|\bphilosophie\b/, 'PHILOSOPHIE'],
  [/\bsciences?\b|\btechnologie\b/, 'SCIENCES'],
];

/**
 * LA MATIÈRE, RAPPROCHÉE D'UNE LISTE FERMÉE.
 *
 * Deux chemins, dans cet ordre : le code de la matière quand un synonyme le
 * donne, puis le libellé dit tel quel. Aucun rapprochement approximatif — un
 * contrôle rangé dans la mauvaise matière ne se voit pas, alors qu'un champ
 * laissé vide se remplit en un clic.
 */
export function deduireMatiere(texte, matieres) {
  const propre = normaliser(texte);
  if (!Array.isArray(matieres) || matieres.length === 0) return null;

  for (const [motif, code] of SYNONYMES) {
    if (!motif.test(propre)) continue;

    const trouvee = matieres.find((m) => m.code === code);
    if (trouvee) return trouvee.id;
  }

  // Le libellé prononcé en entier : « histoire-géographie », « sciences et
  // technologie ». Le plus long d'abord, pour que « sciences et technologie »
  // l'emporte sur « sciences ».
  const parLibelle = [...matieres]
    .filter((m) => m.libelle)
    .sort((a, b) => b.libelle.length - a.libelle.length)
    .find((m) => propre.includes(normaliser(m.libelle)));

  return parLibelle ? parLibelle.id : null;
}

/**
 * LE SUJET : ce qui suit « sur », « à propos de », « portant sur ».
 *
 * ON NE PREND PAS « TOUT LE RESTE », et c'est un choix. Une phrase dont on a
 * retiré la date, l'heure et la matière laisse des miettes — « j'ai contrôle
 * en à le » — qui iraient s'écrire dans le champ sujet et qu'il faudrait
 * effacer à la main. Mieux vaut un sujet vide qu'un sujet à nettoyer.
 */
export function deduireSujet(texte) {
  const forme = texte.match(
    /\b(?:sur|à propos de|a propos de|portant sur|ça porte sur|ca porte sur)\s+(.+)$/i,
  );

  if (!forme) return null;

  const sujet = forme[1]
    .replace(/[.!?]+\s*$/, '')
    .trim();

  return sujet.length > 0 ? sujet : null;
}

/**
 * Lit une phrase entière et rend les champs qu'on a pu en tirer.
 *
 * Chaque champ est indépendant : une phrase qui ne donne que la date remplit
 * la date et laisse le reste. On ne renvoie JAMAIS une valeur par défaut —
 * `null` veut dire « il n'a rien dit là-dessus », et l'écran laisse alors le
 * champ tel qu'il était.
 */
export function lireEnonce(texte, matieres = [], maintenant = new Date()) {
  const propre = normaliser(texte);

  if (!propre) return { matiereId: null, date: null, heure: null, sujet: null };

  const date = deduireDate(propre, maintenant);

  return {
    matiereId: deduireMatiere(propre, matieres),
    date: date ? formatISO(date) : null,
    heure: deduireHeure(propre),
    sujet: deduireSujet(texte.trim()),
  };
}

/** `YYYY-MM-DD` en heure locale — `toISOString` décalerait d'un jour. */
export function formatISO(date) {
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${mois}-${jour}`;
}
