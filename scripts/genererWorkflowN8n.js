/**
 * Génère le workflow N8N d'import des planches, à partir du VRAI catalogue.
 *
 * POURQUOI UN GÉNÉRATEUR ET NON UN FICHIER ÉCRIT À LA MAIN
 * -------------------------------------------------------
 * Le workflow doit porter la liste des figures à chercher — cent quarante-neuf
 * lignes. Recopiées à la main, elles divergeraient du catalogue dès la première
 * figure ajoutée, et l'agent chercherait indéfiniment une clé qui n'existe plus
 * pendant qu'une autre resterait vide sans que personne le sache.
 *
 * Ici, la liste est LUE dans `planchesCatalogue.js` et `schemasSvt.js`. Un test
 * vérifie ensuite que le JSON produit est bien à jour — voir
 * `src/__tests__/workflowN8n.test.js`.
 *
 * Lancement :  node scripts/genererWorkflowN8n.js
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, 'n8n', 'mimia-import-planches.json');

// ---------------------------------------------------------------------------
// Lecture du catalogue
// ---------------------------------------------------------------------------

/**
 * Les emplacements vides, lus dans le module ES.
 *
 * Le fichier est du JavaScript de navigateur ; on en retire le mot-clé
 * `export` pour l'évaluer ici. C'est plus sûr qu'une expression régulière sur
 * les données elles-mêmes, qui casserait au premier commentaire contenant une
 * accolade.
 */
function lireEmplacements() {
  const source = fs
    .readFileSync(path.join(RACINE, 'src/lib/storage/planchesCatalogue.js'), 'utf8')
    .replace(/export const/g, 'const');

  // eslint-disable-next-line no-new-func
  return new Function(`${source}\nreturn EMPLACEMENTS;`)();
}

/**
 * Les figures de SVT pour lesquelles une planche vaut mieux que le dessin.
 *
 * Les trente et une autres sont déjà justes au trait : les faire chercher à
 * l'agent gaspillerait des requêtes pour remplacer du bon par de l'incertain.
 */
function lireSvtRecommandees() {
  const source = fs.readFileSync(path.join(RACINE, 'src/lib/storage/schemasSvt.js'), 'utf8');

  const recommandees = new Set(
    (source.match(/PLANCHES_RECOMMANDEES = new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? '')
      .split('\n')
      .map((l) => l.match(/'([a-z0-9-]+)'/)?.[1])
      .filter(Boolean),
  );

  const figures = [];
  const forme = /'([a-z0-9-]+)':\s*\{\s*titre:\s*'([^']*)',\s*niveau:\s*'([^']*)'/g;

  let trouve;
  while ((trouve = forme.exec(source)) !== null) {
    const [, cle, titre, niveau] = trouve;
    if (recommandees.has(cle)) figures.push({ cle, titre, niveau });
  }

  return figures;
}

// ---------------------------------------------------------------------------
// La requête de recherche
// ---------------------------------------------------------------------------

const MATIERES = {
  svt: 'SVT',
  pc: 'PHYSIQUE_CHIMIE',
  math: 'MATHS',
  fr: 'FRANCAIS',
  hg: 'HISTOIRE_GEO',
  an: 'ANGLAIS',
  sc: 'SCIENCES',
};

/**
 * Les mots vides du français. Ils ne portent aucun sens et coûtent cher : la
 * recherche de Commons exige que TOUS les mots soient présents.
 */
const VIDES = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'a', 'au', 'aux',
  'et', 'en', 'leur', 'leurs', 'ses', 'son', 'sa', 'sur', 'dans', 'avec',
  'pour', 'par', 'ou', 'se', 'qui', 'que',
]);

function motsUtiles(titre) {
  return titre
    // Ce qui suit les deux-points est une précision pour l'administration —
    // « Un séisme : foyer, épicentre, ondes ». Dans une recherche, ces mots
    // deviennent des critères supplémentaires et écartent tous les résultats.
    .split(/\s*:\s*/)[0]
    .replace(/[’']/g, ' ')
    .split(/\s+/)
    .filter((m) => m && !VIDES.has(m.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')))
    .slice(0, 4);
}

/**
 * Ce qu'on tape dans Wikimedia Commons pour trouver la figure.
 *
 * DEUX ERREURS PAYÉES POUR ARRIVER À CETTE FORME
 * ---------------------------------------------
 * 1. J'AJOUTAIS UN MOT QUALIFIANT — « schéma », « carte », « anatomie » —
 *    censé orienter vers les planches. La recherche de Commons exige que TOUS
 *    les mots soient présents : chaque mot ajouté divisait les résultats.
 *    « Appareil digestif » rend vingt images ; « appareil digestif schéma
 *    anatomie » rend dix résultats et ZÉRO image — dix livres d'anatomie du
 *    XIXᵉ siècle numérisés, dont l'OCR contient ces mots-là. Sur les dix
 *    premières figures d'un tour, aucune n'a survécu au filtre de format.
 *
 * 2. JE GARDAIS LES MOTS VIDES. « parties d'une plante à fleurs » impose six
 *    mots dont quatre sans intérêt, et ne rend rien. Réduit à « parties plante
 *    fleurs », il rend seize images.
 *
 * D'où : trois mots pleins, pas de qualificatif, et les PDF écartés côté
 * serveur — c'est ce qui remonte les vieux livres numérisés. Le tri de
 * pertinence est le travail du juge, pas celui de la requête.
 *
 * Le repli à deux mots sert aux notions rares : « double circulation
 * sanguine » ne rend rien, « double circulation » rend vingt images.
 */
function requetes(titre) {
  const mots = motsUtiles(titre);

  return {
    recherche: `${mots.slice(0, 3).join(' ')} -filemime:pdf`,
    rechercheCourte: `${mots.slice(0, 2).join(' ')} -filemime:pdf`,
  };
}

function catalogueComplet() {
  return [...lireSvtRecommandees(), ...lireEmplacements()].map(({ cle, titre, niveau }) => ({
    cle,
    titre,
    niveau,
    matiereCode: MATIERES[cle.split('-')[0]] ?? 'AUTRE',
    ...requetes(titre),
  }));
}

// ---------------------------------------------------------------------------
// Le workflow
// ---------------------------------------------------------------------------

const REGLAGES = `
/**
 * LES SEULS RÉGLAGES À TOUCHER.
 *
 * MATIERE   — le préfixe de la matière à traiter, ou '' pour TOUTES.
 *             svt, pc, math, fr, hg, an, sc
 *
 * LIMITE    — combien de planches importer par exécution.
 *
 *             CE N'EST PAS UN PLAFOND TOTAL, C'EST UNE TAILLE DE BOUCHÉE.
 *             À chaque exécution, l'agent demande à l'API ce qui est déjà en
 *             base et ne traite que le reste. Vingt par tour, relancé jusqu'à
 *             ce qu'il ne rende plus rien, remplit le catalogue entier — et
 *             chaque tour est un point de reprise : une coupure ne fait perdre
 *             que le tour en cours.
 *
 *             Le déclencheur horaire ci-dessous automatise exactement ça.
 *
 * API       — l'adresse de l'API Mimia, VUE DEPUIS LE CONTENEUR N8N.
 *             Dev, l'API tournant sur la machine : http://host.docker.internal:5066
 *             Prod, N8N sur le même réseau Docker : http://schoolia-api:8080
 *             (le port 8080 est celui de l'intérieur du conteneur, pas le 5066
 *             publié sur l'hôte).
 *
 * CLE_AGENT — le secret partagé, envoyé en en-tête X-Import-Key. Il doit valoir
 *             exactement 'Planches:CleAgent' de l'appsettings de l'API.
 *
 *             LAISSÉ VIDE VOLONTAIREMENT : ce fichier est versionné et circule.
 *             Tu le renseignes ici après l'import dans N8N, jamais dans le
 *             dépôt. Sans clé côté API, l'en-tête ne vaut rien de toute façon.
 */
const MATIERE = '';
const LIMITE = 20;
const API = 'http://host.docker.internal:5066';
const CLE_AGENT = '';
`.trim();

const CODE_REGLAGES = `${REGLAGES}

if (!CLE_AGENT) {
  throw new Error(
    "CLE_AGENT est vide : renseigne-la dans le nœud « Réglages ». "
    + "Elle doit valoir 'Planches:CleAgent' de l'appsettings de l'API.");
}

// Le champ s'appelle cleAgent, et surtout pas cle : plus bas dans le flux,
// « cle » désigne la clé d'une FIGURE (svt-respiratoire). Deux sens pour un
// même nom finirait par envoyer un identifiant de planche en guise de secret.
return [{ json: { api: API, matiere: MATIERE, limite: LIMITE, cleAgent: CLE_AGENT } }];`;

const CODE_MANQUANTES = (catalogue) => `/**
 * Ce qu'il reste à importer.
 *
 * Le catalogue vient du dépôt — il est RECOPIÉ ici par
 * \`scripts/genererWorkflowN8n.js\`, jamais édité à la main. Le modifier ici
 * ferait chercher à l'agent des clés que l'application ne connaît pas : la
 * planche s'enregistrerait en base et ne s'afficherait jamais au tableau.
 */
const CATALOGUE = ${JSON.stringify(catalogue, null, 2)};

const reglages = $('Réglages').first().json;

// Les planches déjà en base. L'API rend un tableau ; N8N en fait un élément
// par ligne, et une base vide donne un unique élément sans clé.
const dejaLa = new Set(
  $input.all().map((e) => e.json?.cle).filter(Boolean),
);

const manquantes = CATALOGUE
  .filter((f) => !dejaLa.has(f.cle))
  .filter((f) => !reglages.matiere || f.cle.startsWith(reglages.matiere + '-'));

// ON TIRE AU HASARD, ON NE PREND PAS LES VINGT PREMIÈRES.
//
// Prendre le début du catalogue paraissait naturel. Mais une figure que
// Commons n'a pas, ou que le juge refuse, RESTE manquante — et elle repasse en
// tête au tour suivant, puis au suivant. L'agent rejouait donc les mêmes
// échecs indéfiniment et n'atteignait jamais la fin de la liste : après une
// heure, les mathématiques, le français et l'anglais étaient encore à zéro sur
// zéro, pendant que sciences et physique-chimie tournaient en boucle sur leurs
// invendus.
//
// Un tirage aléatoire donne à chaque emplacement la même chance à chaque tour.
// Les figures introuvables coûtent toujours leur recherche, mais elles ne
// bloquent plus le reste du catalogue derrière elles.
for (let i = manquantes.length - 1; i > 0; i -= 1) {
  const j = Math.floor(Math.random() * (i + 1));
  [manquantes[i], manquantes[j]] = [manquantes[j], manquantes[i]];
}

return manquantes
  .slice(0, reglages.limite)
  .map((f) => ({ json: { ...f, api: reglages.api } }));`;

const CODE_FILTRER = `/**
 * Les candidats acceptables pour chaque figure.
 *
 * TROIS FILTRES, ET AUCUN N'EST FACULTATIF
 * ---------------------------------------
 * 1. LA LICENCE. Une image « tous droits réservés » ne peut pas être montrée
 *    à un élève, même dans un cadre scolaire. On n'accepte que le domaine
 *    public et les licences Creative Commons, et on relève les trois mentions
 *    que CC BY impose — auteur, source, licence — parce que l'obligation nous
 *    incombe dès l'affichage.
 * 2. LE FORMAT. L'API refuse ce qui n'est pas image : un PDF ou un TIFF
 *    partirait pour rien.
 * 3. LA TAILLE. Cinq mégaoctets maximum. Au-delà, on prend la version réduite
 *    à 1600 pixels que Commons génère — largement suffisant pour un tableau.
 *
 * Mieux vaut ne rien rapporter qu'une planche douteuse : une clé sans planche
 * laisse le professeur dessiner, ce qui est le comportement d'avant.
 */
const ACCEPTES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const TAILLE_MAX = 5 * 1024 * 1024;

const libre = (licence) =>
  /^(cc|public domain|cc0|pd)/i.test((licence || '').trim());

/**
 * LA LANGUE DE LA PLANCHE.
 *
 * Nos élèves sont français. Une coupe de l'appareil respiratoire légendée en
 * allemand ne leur apprend rien — pire, elle les met en échec sur des mots
 * qu'ils n'ont aucune raison de connaître. C'est ce qui est arrivé au premier
 * essai : un planisphère céleste allemand est entré en base.
 *
 * POURQUOI CE FILTRE EST TIMIDE, ET POURQUOI C'EST VOLONTAIRE
 * ----------------------------------------------------------
 * On ne lit ici que le TITRE et la DESCRIPTION du fichier, pas les mots écrits
 * sur l'image. Les deux se contredisent souvent :
 *
 * - Beaucoup de planches de Commons sont MULTILINGUES — la coupe respiratoire
 *   importée à la main en est une, avec dix langues dont le français. Notre
 *   lecteur y prend la branche française. Les écarter serait absurde.
 * - Une carte muette n'a aucun mot dessus. Sa langue n'existe pas.
 *
 * On n'écarte donc QUE le cas franc : des marqueurs d'une autre langue, et
 * aucun marqueur français. Le reste part au juge, qui voit le même texte et
 * tranche avec du discernement.
 */
// AUCUN PETIT MOT DANS CETTE LISTE, ET C'EST UNE LEÇON PAYÉE.
//
// La première version y mettait « le, la, les, des, du ». Résultat : « Der
// Sternenhimmel zu jeder Stunde DES Jahres » passait pour du français — « des »
// est un mot allemand — et « Mapa DE España » aussi. Les articles courts sont
// communs à la moitié des langues d'Europe ; ils ne prouvent rien.
//
// Ne restent donc que des mots pleins, et les accents propres au français.
const MARQUEURS_FR = /\\b(cartes?|sch[ée]mas?|coupe|plan|frise|fran[çc]ais(e)?|france|appareil|cycle|circuit|mol[ée]cule|planisph[èe]re|repr[ée]sentation|muette)\\b|[éèêàçùœ]/i;

// Les tréma allemands et le tilde espagnol sont ici, et pas parmi les accents
// français : ce sont des signaux d'une AUTRE langue, pas du bruit.
const MARQUEURS_AUTRES = /\\b(der|die|das|und|von|karte|deutschland|zeichnung|the|of|and|with|map|diagram|drawing|mapa|espa|mappa|carta|kaart)\\b|[üäößñ]/i;

/**
 * Vrai seulement dans le cas franc : ça parle une autre langue, et rien
 * n'indique le français. Le doute profite au candidat.
 */
const langueSuspecte = (texte) => {
  const t = String(texte || '');
  if (MARQUEURS_FR.test(t)) return false;
  return MARQUEURS_AUTRES.test(t);
};

// LE CODE DE LANGUE DANS LE NOM DU FICHIER.
//
// Commons nomme ses variantes traduites en suffixant le code de la langue :
// « Human_male_reproductive_system_en.svg », « Plant_cell_structure-nb.svg ».
// C'est le signal le plus fiable qui existe, et je ne l'utilisais pas — ces
// deux planches-là sont arrivées en base, l'une légendée en anglais, l'autre
// en norvégien, et il a fallu les lire pour s'en apercevoir.
//
// « fr » est évidemment accepté ; c'est même une excellente nouvelle.
const SUFFIXE_LANGUE =
  /[-_](en|de|es|it|nl|nb|no|sv|da|fi|pl|pt|ru|zh|ja|ko|cs|hu|tr|ar|he|uk|ro|el|ca|eu|gl|id|vi|th|hi|fa|bn)\\.(svg|png|jpe?g|gif|webp)\$/i;

const nommeDansUneAutreLangue = (titre) => SUFFIXE_LANGUE.test(String(titre || ''));

// Commons rend l'auteur en HTML — un lien vers sa page utilisateur, SUIVI des
// liens d'interface du wiki. Retirer les balises sans plus laissait
// « Lvcvlvs ( d · contributions ) » : le nom, puis deux boutons de navigation
// qui n'ont rien à faire sous une planche affichée à un élève.
const enTexte = (html) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\\s+/g, ' ')
    .replace(/\\s*\\(\\s*(d|discussion|talk|c|contribs?|contributions)\\s*([·|]\\s*[^)]*)?\\)/gi, '')
    .trim()
    .slice(0, 200);

// LA RECHERCHE EST FAITE ICI, ET NON PAR UN NŒUD HTTP.
//
// Parce qu'elle a besoin d'un REPLI : trois mots ne rendent parfois rien —
// « double circulation sanguine » — là où deux en rendent vingt. Un nœud HTTP
// ne sait faire qu'un seul appel par élément ; ce nœud en fait deux si le
// premier revient bredouille.
//
// Bénéfice de bord : une figure entre, une figure sort, et l'appariement ne
// peut plus glisser.
// \`this.helpers\` est capturé ICI, au premier niveau du nœud.
//
// Une fonction fléchée hérite du \`this\` de sa portée, et dans le bac à sable
// de N8N ce \`this\` n'est pas celui du nœud : \`this.helpers\` y valait
// \`undefined\`. Chaque recherche levait une exception, avalée par le
// try/catch, et le tour se terminait TOUT VERT avec zéro planche importée —
// vingt figures cherchées, vingt listes de candidats vides, vingt refus du
// juge. Rien ne le signalait.
const helpers = this.helpers;

async function chercher(requete) {
  const parametres = [
    ['action', 'query'],
    ['format', 'json'],
    ['generator', 'search'],
    ['gsrsearch', requete],
    ['gsrnamespace', '6'],
    ['gsrlimit', '20'],
    ['prop', 'imageinfo'],
    ['iiprop', 'url|size|mime|extmetadata'],
    ['iiurlwidth', '1600'],
    ['iiextmetadatalanguage', 'fr'],
  ]
    .map(([c, v]) => encodeURIComponent(c) + '=' + encodeURIComponent(v))
    .join('&');

  const reponse = await helpers.httpRequest({
    method: 'GET',
    url: 'https://commons.wikimedia.org/w/api.php?' + parametres,
    headers: {
      // Wikimedia exige un agent identifiable et bloque les anonymes.
      'User-Agent': 'Mimia-Planches/1.0 (https://mimia.fr; contact@mimia.fr)',
    },
    json: true,
  });

  return Object.values(reponse?.query?.pages ?? {});
}

// UN ÉLÉMENT ENTRE, UN ÉLÉMENT SORT. TOUJOURS.
//
// La première version ne rendait que les figures ayant trouvé quelque chose,
// et appariait les résultats sur le nombre d'éléments DÉJÀ retenus. Dès qu'une
// figure ne trouvait rien, tout glissait d'un cran : la frise chronologique a
// reçu la carte du relief, le relief a reçu celle des fleuves, et les fleuves
// une carte des résultats de l'élection présidentielle de 2022.
//
// Rien ne le signalait — chaque planche était sous licence libre, au bon
// format, et l'API les a toutes acceptées. C'est en lisant les noms de fichier
// stockés qu'on l'a vu.
//
// D'où la règle : on garde la position, on ne compacte jamais. Les figures
// bredouilles ressortent avec une liste vide et sont écartées plus loin.
const sortie = [];

for (const element of $input.all()) {
  const figure = element.json ?? {};

  // Trois mots d'abord, deux en repli. On s'arrête dès qu'un candidat passe
  // les filtres — inutile de solliciter Commons une seconde fois.
  let pages = [];
  let panne = null;

  try {
    pages = await chercher(figure.recherche);
  } catch (e) {
    // ON GARDE LA RAISON, ON NE L'AVALE PAS.
    //
    // La version précédente remplaçait l'erreur par une liste vide. Le tour
    // passait au vert de bout en bout sans importer une seule planche, et rien
    // — ni le rapport, ni N8N — ne disait pourquoi. Une heure perdue à
    // chercher un problème de pertinence là où l'appel réseau ne partait même
    // pas.
    panne = String(e && e.message ? e.message : e).slice(0, 200);
  }

  const retenir = (resultats) => {
    const trouves = [];

  for (const page of resultats) {
    const info = (page.imageinfo ?? [])[0];
    if (!info) continue;

    const meta = info.extmetadata ?? {};
    const licence = meta.LicenseShortName?.value;

    if (!libre(licence)) continue;
    if (meta.Restrictions?.value) continue;
    if (!ACCEPTES.includes(info.mime)) continue;

    // L'original s'il tient dans la limite, sinon la réduction de Commons.
    const tropLourd = (info.size ?? 0) > TAILLE_MAX;
    const url = tropLourd ? info.thumburl : info.url;
    const mime = tropLourd ? 'image/jpeg' : info.mime;

    if (!url) continue;

    const titre = String(page.title || '').replace(/^File:/, '');
    const description = enTexte(meta.ImageDescription?.value).slice(0, 300);

    // Un suffixe de langue dans le nom du fichier ne laisse aucun doute.
    if (nommeDansUneAutreLangue(titre)) continue;

    // Le seul cas franc : ça parle une autre langue et rien n'indique le
    // français. Le doute profite au candidat — le juge tranchera.
    if (langueSuspecte(titre + ' ' + description)) continue;

    trouves.push({
      url,
      mime,
      titreCommons: titre,
      // La description de Commons, en clair : c'est elle qui distingue un
      // planisphère céleste d'un planisphère terrestre.
      description,
      auteur: enTexte(meta.Artist?.value) || 'Wikimedia Commons',
      source: info.descriptionurl || page.title,
      licence: licence.trim(),
      // Un SVG passe devant : notre lecteur de légendes y lit le texte
      // directement, sans appeler le moindre modèle.
      svg: info.mime === 'image/svg+xml',
    });
  }

    return trouves;
  };

  let candidats = retenir(pages);

  // LE REPLI À DEUX MOTS.
  //
  // « double circulation sanguine » ne rend rien, « double circulation » rend
  // vingt images. Les notions rares portent des noms longs, et chaque mot de
  // plus est une condition de plus.
  if (candidats.length === 0 && figure.rechercheCourte) {
    try {
      candidats = retenir(await chercher(figure.rechercheCourte));
      panne = null;
    } catch (e) {
      panne = String(e && e.message ? e.message : e).slice(0, 200);
    }
  }

  // Les SVG d'abord, puis l'ordre de pertinence de Commons.
  candidats.sort((a, b) => (b.svg ? 1 : 0) - (a.svg ? 1 : 0));

  sortie.push({ json: { ...figure, candidats: candidats.slice(0, 8), panne } });
}

return sortie;`;

const CODE_RETENIR = `/**
 * Applique le choix du juge, et n'invente rien s'il a dit non.
 *
 * Le juge répond par un indice dans la liste des candidats, ou par null. Un
 * null n'est PAS un échec : c'est une figure qui restera dessinée à main levée
 * plutôt que remplacée par une carte fausse. C'est le bon résultat.
 */
const lots = $('Chercher et filtrer').all();

const sortie = [];

$input.all().forEach((element, index) => {
  const lot = lots[index]?.json ?? {};
  const candidats = lot.candidats ?? [];

  const brut = element.json?.message?.content
    ?? element.json?.content
    ?? element.json?.text
    ?? '';

  let choix = null;
  try {
    const propre = String(brut).replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
    choix = JSON.parse((propre.match(/\\{[\\s\\S]*\\}/) || [propre])[0]);
  } catch (e) {
    // Une réponse illisible vaut un refus : on ne devine pas à la place du
    // juge, on laisse la figure vide.
    choix = null;
  }

  const i = choix?.choix;

  if (typeof i !== 'number' || i < 0 || i >= candidats.length) return;

  sortie.push({
    json: {
      cle: lot.cle,
      matiereCode: lot.matiereCode,
      titre: lot.titre,
      api: lot.api,
      raison: choix.raison ?? '',
      ...candidats[i],
    },
  });
});

return sortie;`;

const CONSIGNE_JUGE = `Tu choisis une planche pour un cours en France.

FIGURE DEMANDÉE : {{ $json.titre }}
NIVEAU : {{ $json.niveau }}
IDENTIFIANT : {{ $json.cle }}

CANDIDATS (Wikimedia Commons) :
{{ JSON.stringify($json.candidats.map((c, i) => ({ i, titre: c.titreCommons, description: c.description })), null, 1) }}

Réponds par l'indice du SEUL candidat qui est vraiment la figure demandée, ou
par null s'il n'y en a aucun.

LA PLANCHE DOIT ÊTRE LISIBLE PAR UN ÉLÈVE FRANÇAIS.

Ses légendes doivent être EN FRANÇAIS. Un schéma légendé en allemand, en
anglais ou en espagnol met l'élève en échec sur des mots qu'il n'a aucune
raison de connaître.

Deux exceptions, et seulement deux :
- La planche est MULTILINGUE et le français en fait partie (Commons en compte
  beaucoup). Elle convient : c'est la version française qui s'affichera.
- La planche ne porte AUCUN mot — une carte muette, une silhouette à légender.
  Elle convient aussi ; c'est même souvent l'exercice recherché.

REFUSE, ET C'EST LE CAS LE PLUS FRÉQUENT :
- Le mot juste, le mauvais sens. « Planisphère » désigne aussi une carte du
  CIEL : une carte des constellations n'est pas une carte du monde.
- Le bon pays, le mauvais sujet. Une carte des résultats d'une élection n'est
  pas une carte des fleuves, même si les deux montrent la France découpée.
- Le bon sujet, le mauvais objet. Une photographie d'un fleuve n'est pas une
  carte des fleuves ; un tableau représentant une bataille n'est pas une carte
  des fronts.
- Une gravure ancienne, une carte d'époque, un document d'archive. Un élève
  doit voir la géographie d'aujourd'hui, pas celle de 1780 — sauf si la figure
  demandée est justement historique.
- Un blason, un drapeau, une couverture, une capture d'écran, un logo.

Mieux vaut null qu'un à-peu-près : sans planche, le professeur dessine, ce qui
marche déjà. Avec une mauvaise planche, il enseigne du faux sans le savoir.

Réponds STRICTEMENT par un objet JSON, sans texte ni balises :
{"choix": 0, "raison": "en six mots"}
ou
{"choix": null, "raison": "en six mots"}`;

const CODE_RAPPORT = `/**
 * Ce que l'exécution a fait, en clair.
 *
 * Le rapport dit surtout ce qu'il faut aller VÉRIFIER : l'agent choisit sur
 * une licence et un format, jamais sur l'exactitude scientifique. C'est
 * l'écran Schémas qui montre les légendes réellement extraites de chaque
 * planche — c'est là que se fait la relecture.
 */
const demandes = $('Retenir la planche').all();

const reussies = [];
const echouees = [];

$input.all().forEach((e, i) => {
  const demandee = demandes[i]?.json ?? {};

  // L'API rend la planche enregistrée : sa clé prouve que la ligne existe.
  // Sans clé, l'appel a échoué — le nœud est en « continuer malgré l'erreur »
  // pour que les suivantes passent, donc c'est ICI qu'on s'en aperçoit.
  if (e.json?.cle) {
    reussies.push({
      cle: e.json.cle,
      auteur: e.json.auteur ?? '',
      licence: e.json.licence ?? '',
      source: e.json.source ?? '',
    });
  } else {
    echouees.push({
      cle: demandee.cle ?? '?',
      raison: e.json?.error?.message ?? e.json?.message ?? 'refus de l’API',
    });
  }
});

// CE QUE LA RECHERCHE N'A PAS TROUVÉ, ET POURQUOI.
//
// Un tour peut se terminer tout en vert sans rien importer. Sans ce bloc, le
// rapport disait « 0 importées » et rien d'autre — impossible de distinguer
// « le juge a tout refusé » de « l'appel réseau ne partait pas ».
const cherchees = $('Chercher et filtrer').all().map((e) => e.json ?? {});

const pannes = cherchees.filter((f) => f.panne)
  .map((f) => ({ cle: f.cle, panne: f.panne }));

const sansCandidat = cherchees
  .filter((f) => !f.panne && (f.candidats ?? []).length === 0)
  .map((f) => f.cle);

return [{
  json: {
    importees: reussies.length,
    echouees: echouees.length,
    planches: reussies,
    echecs: echouees,

    // Une recherche en panne n'est PAS un refus du juge : c'est un incident à
    // corriger, et il doit se voir du premier coup d'œil.
    recherchesEnPanne: pannes,
    aucunCandidatTrouve: sansCandidat,
    refuseesParLeJuge: Math.max(
      0,
      cherchees.length - pannes.length - sansCandidat.length - reussies.length - echouees.length,
    ),
    aFaire: 'Ouvrir Administration › Schémas et relire les légendes extraites '
          + 'de chaque planche avant de la laisser en production. L’agent a '
          + 'vérifié la licence et le format, jamais l’exactitude.',
  },
}];`;

function noeud(nom, type, typeVersion, position, parameters, extra = {}) {
  return {
    parameters,
    id: nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: nom,
    type,
    typeVersion,
    position,
    ...extra,
  };
}

function construire(catalogue) {
  const nodes = [
    noeud('Déclencher', 'n8n-nodes-base.manualTrigger', 1, [-460, 220], {}),

    // LE TOUR AUTOMATIQUE.
    //
    // Toutes les quatre minutes, vingt planches de plus. Rien à surveiller : le
    // nœud « Ce qui manque » interroge l'API à chaque tour et ne traite que ce
    // qui n'y est pas encore. Quand le catalogue est plein, il ne rend plus
    // rien et les tours suivants ne coûtent qu'un GET.
    //
    // POURQUOI PAR BOUCHÉES ET NON TOUT D'UN COUP
    // ------------------------------------------
    // Cent quarante-sept planches en une exécution, c'est cent quarante-sept
    // fichiers en mémoire — plusieurs centaines de mégaoctets — et une seule
    // coupure qui fait tout perdre. Par vingt, chaque tour est un point de
    // reprise, et Wikimedia n'est jamais sollicité en rafale.
    //
    // Ce déclencheur ne part QUE si tu actives le workflow. Tant qu'il est
    // inactif, seul le bouton « Test workflow » déclenche un tour.
    noeud('Toutes les 4 minutes', 'n8n-nodes-base.scheduleTrigger', 1.2, [-460, 400], {
      rule: { interval: [{ field: 'cronExpression', expression: '*/4 * * * *' }] },
    }),

    noeud('Réglages', 'n8n-nodes-base.code', 2, [-260, 300], {
      jsCode: CODE_REGLAGES,
    }),

    noeud('Planches déjà en base', 'n8n-nodes-base.httpRequest', 4.2, [-60, 300], {
      method: 'GET',
      url: '={{ $json.api }}/planches',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'X-Import-Key', value: '={{ $json.cleAgent }}' },
        ],
      },
      options: {
        allowUnauthorizedCerts: true,
      },
    }),

    noeud('Ce qui manque', 'n8n-nodes-base.code', 2, [160, 300], {
      jsCode: CODE_MANQUANTES(catalogue),
    }),

    noeud('Chercher et filtrer', 'n8n-nodes-base.code', 2, [600, 300], {
      jsCode: CODE_FILTRER,
    }),

    // LE JUGE.
    //
    // Le filtre précédent ne sait rien du SENS : il vérifie une licence, un
    // format, un poids. C'est ce qui a laissé passer une carte du ciel pour
    // « planisphère » et une carte électorale pour « fleuves de France ».
    //
    // Aucun réglage de mots-clés ne rattrape ça — « planisphère » est le mot
    // juste dans les deux cas. Il faut quelqu'un qui lise le titre et la
    // description et dise « non, ce n'est pas ça ». Un appel par figure,
    // quelques centimes pour cent cinquante planches.
    noeud('Choisir avec l’IA', '@n8n/n8n-nodes-langchain.openAi', 1.8, [820, 300], {
      modelId: {
        __rl: true,
        value: 'gpt-4o-mini',
        mode: 'list',
        cachedResultName: 'gpt-4o-mini',
      },
      messages: {
        values: [{ content: `=${CONSIGNE_JUGE}`, role: 'user' }],
      },
      options: {},
    },
    {
      credentials: { openAiApi: { id: 'Ipb1yeVASy8eEvI8', name: 'OpenAi account' } },
      onError: 'continueRegularOutput',
    }),

    noeud('Retenir la planche', 'n8n-nodes-base.code', 2, [1040, 300], {
      jsCode: CODE_RETENIR,
    }),

    noeud('Télécharger', 'n8n-nodes-base.httpRequest', 4.2, [1260, 300], {
      method: 'GET',
      url: '={{ $json.url }}',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          {
            name: 'User-Agent',
            value: 'Mimia-Planches/1.0 (https://mimia.fr; contact@mimia.fr)',
          },
        ],
      },
      options: {
        response: { response: { responseFormat: 'file', outputPropertyName: 'fichier' } },
        batching: { batch: { batchSize: 1, batchInterval: 1000 } },
        timeout: 30000,
      },
    },
    // Un fichier retiré de Commons, un serveur lent : sans ça, un
    // téléchargement raté interromprait les dix-neuf planches suivantes.
    { onError: 'continueRegularOutput' }),

    noeud('Importer dans Mimia', 'n8n-nodes-base.httpRequest', 4.2, [1480, 300], {
      method: 'POST',
      url: "={{ $('Retenir la planche').item.json.api }}/planches",
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'X-Import-Key', value: "={{ $('Réglages').first().json.cleAgent }}" },
        ],
      },
      contentType: 'multipart-form-data',
      sendBody: true,
      bodyParameters: {
        parameters: [
          { name: 'cle', value: "={{ $('Retenir la planche').item.json.cle }}" },
          { name: 'matiereCode', value: "={{ $('Retenir la planche').item.json.matiereCode }}" },
          { name: 'auteur', value: "={{ $('Retenir la planche').item.json.auteur }}" },
          { name: 'source', value: "={{ $('Retenir la planche').item.json.source }}" },
          { name: 'licence', value: "={{ $('Retenir la planche').item.json.licence }}" },
          { parameterType: 'formBinaryData', name: 'fichier', inputDataFieldName: 'fichier' },
        ],
      },
      options: {
        allowUnauthorizedCerts: true,
      },
    },
    // Une planche refusée — format inattendu, poids limite — ne doit pas
    // interrompre les quatre suivantes. Le rapport dira laquelle est passée.
    { onError: 'continueRegularOutput' }),

    noeud('Rapport', 'n8n-nodes-base.code', 2, [1700, 300], {
      jsCode: CODE_RAPPORT,
    }),
  ];

  const enchainement = [
    'Déclencher',
    'Réglages',
    'Planches déjà en base',
    'Ce qui manque',
    'Chercher et filtrer',
    'Choisir avec l’IA',
    'Retenir la planche',
    'Télécharger',
    'Importer dans Mimia',
    'Rapport',
  ];

  const connections = {};

  // Les deux déclencheurs entrent au même endroit : le bouton pour un tour
  // d'essai, l'horloge pour vider le catalogue toute seule.
  connections['Toutes les 4 minutes'] = {
    main: [[{ node: 'Réglages', type: 'main', index: 0 }]],
  };

  for (let i = 0; i < enchainement.length - 1; i += 1) {
    connections[enchainement[i]] = {
      main: [[{ node: enchainement[i + 1], type: 'main', index: 0 }]],
    };
  }

  return {
    name: 'Mimia — import des planches',
    nodes,
    connections,
    // `binaryMode: separate` écrit les fichiers téléchargés sur disque au lieu
    // de les garder en mémoire. Vingt planches par tour, dont certaines de
    // cinq mégaoctets, tiendraient en RAM ; le catalogue entier, non.
    settings: { executionOrder: 'v1', binaryMode: 'separate' },

    // Inactif à l'import : c'est TOI qui décides quand l'horloge démarre.
    active: false,
    pinData: {},
  };
}

// ---------------------------------------------------------------------------

/**
 * La clé d'agent, lue là où elle vit déjà : l'appsettings de l'API.
 *
 * POURQUOI PAS EN DUR DANS LE GÉNÉRATEUR
 * -------------------------------------
 * Ce fichier est versionné. Une clé écrite ici partirait sur GitHub au premier
 * commit — précisément ce qu'on s'interdit pour les appsettings.
 *
 * Elle est donc lue dans `appsettings.Development.json`, qui est hors git et
 * qui est déjà la source de vérité côté API. Un seul endroit à changer si la
 * clé tourne, et aucune recopie à faire à la main.
 */
function lireCleAgent() {
  const chemins = [
    'C:/Users/daryu/source/repos/SchoolWebApp/SchoolWebApp/appsettings.Development.json',
    'C:/Users/daryu/source/repos/SchoolWebApp/SchoolWebApp/appsettings.json',
  ];

  for (const chemin of chemins) {
    try {
      const cle = JSON.parse(fs.readFileSync(chemin, 'utf8'))?.Planches?.CleAgent;
      if (cle) return cle;
    } catch (e) {
      // Dépôt du front cloné seul : on produit le fichier sans clé, c'est tout.
    }
  }

  return null;
}

const catalogue = catalogueComplet();
const workflow = construire(catalogue);

fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
fs.writeFileSync(SORTIE, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');

console.log(`${catalogue.length} figures écrites dans ${path.relative(RACINE, SORTIE)}`);

/**
 * DEUX FICHIERS, ET C'EST LA SEULE FAÇON D'AVOIR LES DEUX.
 *
 * Celui du dessus est versionné, sans clé : c'est lui que lisent les tests de
 * dérive, et il peut circuler sans risque.
 *
 * Celui-ci porte la clé et n'existe que sur cette machine — `.gitignore` le
 * couvre. C'est CELUI-LÀ qu'on importe dans N8N : plus rien à retaper après
 * chaque régénération.
 */
const cle = lireCleAgent();

if (cle) {
  const prêt = path.join(path.dirname(SORTIE), 'mimia-import-planches.local.json');

  const avecCle = JSON.parse(JSON.stringify(workflow));
  const reglages = avecCle.nodes.find((n) => n.name === 'Réglages');

  reglages.parameters.jsCode = reglages.parameters.jsCode.replace(
    "const CLE_AGENT = '';",
    `const CLE_AGENT = '${cle}';`,
  );

  fs.writeFileSync(prêt, `${JSON.stringify(avecCle, null, 2)}\n`, 'utf8');

  console.log(`Prêt à importer (clé incluse, hors git) : ${path.relative(RACINE, prêt)}`);
} else {
  console.log('Clé d’agent introuvable dans les appsettings : fichier sans clé uniquement.');
}

const parMatiere = {};
for (const f of catalogue) {
  const p = f.cle.split('-')[0];
  parMatiere[p] = (parMatiere[p] ?? 0) + 1;
}
console.log(parMatiere);
