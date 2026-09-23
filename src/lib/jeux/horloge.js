/**
 * L'HORLOGE — le sixième jeu de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CP_MES_TEMPS — « Se repérer dans le temps et lire l'heure entière »
 *
 * CE QUI EST DIFFICILE AU CP, ET CE QUE LE JEU VISE. Lire « 7 heures » quand
 * la petite aiguille montre le 7, ce n'est pas lire un nombre : c'est savoir
 * LAQUELLE des deux aiguilles donne l'heure. L'erreur classique est de lire
 * la grande — l'enfant voit un 12 et dit « 12 heures ». La seconde, à
 * l'inverse, est de régler une heure juste en laissant la grande aiguille
 * n'importe où.
 *
 * DEUX MOITIÉS DE PARTIE, DEUX SENS :
 *
 *   1. LIRE (4 manches). Une horloge montre une heure juste, l'enfant choisit
 *      parmi quatre heures écrites. L'une des fausses est TOUJOURS « 12 heures »,
 *      ce que lit l'enfant qui regarde la grande aiguille : c'est le piège du
 *      jeu, pas un hasard.
 *
 *   2. RÉGLER (4 manches). L'enfant entend « Mets l'horloge sur 7 heures ». Il
 *      choisit une aiguille, puis le nombre où la poser, et annonce qu'il a
 *      fini. Les deux aiguilles partent d'une position fausse : il faut
 *      déplacer la petite ET ramener la grande sur le 12.
 *
 * L'ERREUR SE NOMME, comme dans les cinq autres jeux : « c'est plus tard »,
 * « tu as inversé les aiguilles », « à une heure juste, la grande aiguille est
 * sur le 12 ». Jamais « raté ».
 *
 * AU CE1, LA DEMI-HEURE — Camara, le 21/09/2026 : les jeux de CP qui s'y
 * prêtent gagnent un niveau CE1. Compétence :
 *   MATH_CE1_MES_HEURE — « Lire l'heure et la demi-heure »
 *
 * UNE HEURE EST UN NOMBRE, ET LA DEMIE EN EST LA MOITIÉ : 3,5 veut dire
 * « 3 heures et demie ». Ainsi le CP ne change pas d'un chiffre — ses heures
 * restent entières, ses voix enregistrées restent justes —, « plus tôt » et
 * « plus tard » se comparent toujours d'un simple « < », et la petite
 * aiguille se dessine d'elle-même ENTRE le 3 et le 4, comme sur une vraie
 * horloge.
 *
 * LES DEUX PIÈGES DE LA DEMI-HEURE, proposés exprès à la lecture :
 *   - lire « 3 heures » en oubliant la grande aiguille sur le 6 ;
 *   - lire « 4 heures et demie » parce que la petite est déjà près du 4 —
 *     on lit le nombre qu'elle vient de PASSER.
 */

export const MANCHES = 8;
export const MANCHES_LECTURE = 4;

/** Une heure entière ou une demie : 3 ou 3,5. */
export const estDemie = (moment) => moment % 1 !== 0;
const heureDe = (moment) => Math.floor(moment);

/** Au-delà de 12 h 30, on revient à 1 h : le cadran fait le tour. */
function tour(moment) {
  if (moment >= 13) return moment - 12;
  if (moment < 1) return moment + 12;
  return moment;
}

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * LES QUATRE HEURES PROPOSÉES À LA LECTURE : la bonne, « 12 heures » (le piège
 * des aiguilles), et deux voisines.
 *
 * Les voisines restent entre 1 et 11, sans faire le tour du cadran : ainsi
 * « plus tôt » et « plus tard » ont un sens simple pour un enfant de six ans.
 */
export function propositions(heure, tirer) {
  const voisines = [heure - 1, heure + 1, heure - 2, heure + 2]
    .filter((h) => h >= 1 && h <= 11 && h !== heure);

  const liste = [heure, 12, voisines[0], voisines[1]];
  for (let i = liste.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/**
 * LES QUATRE HEURES PROPOSÉES AU CE1 : la bonne et ses pièges.
 *
 *   - pour une demie (3 h 30) : l'heure sans la demie (3 h), la demie
 *     suivante (4 h 30 — la petite est près du 4), et une voisine ;
 *   - pour une heure juste (3 h) : sa demie (3 h 30 — la grande n'est pas
 *     sur le 6), « 12 heures » (le piège du CP, toujours vrai), une voisine.
 */
export function propositionsCE1(moment, tirer) {
  const pieges = estDemie(moment)
    ? [heureDe(moment), tour(moment + 1), tour(moment - 1), tour(moment + 2)]
    : [moment + 0.5, 12, tour(moment - 1), tour(moment + 1)];

  const liste = [moment];
  pieges.forEach((x) => { if (liste.length < 4 && !liste.includes(x)) liste.push(x); });
  for (let i = liste.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/**
 * LA SÉRIE D'UNE PARTIE.
 *
 * À LA LECTURE, JAMAIS 12 HEURES : les deux aiguilles s'y superposent, et le
 * piège « tu as lu la grande aiguille » n'aurait plus de sens.
 *
 * AU RÉGLAGE, LES AIGUILLES PARTENT D'UNE POSITION FAUSSE : la petite ailleurs
 * que sur l'heure demandée, la grande ailleurs que sur le 12. Laisser l'une ou
 * l'autre en place donnerait la moitié de la réponse.
 *
 * Jamais la même heure deux fois d'affilée, même règle que les autres jeux.
 */
export function serie(graine = Date.now(), manches = MANCHES, niveau = 'CP') {
  const tirer = suite(graine);
  const ce1 = niveau === 'CE1';
  const liste = [];

  // AU CE1, TROIS DEMIES SUR QUATRE dans chaque moitié : c'est la nouveauté
  // de l'année, et une heure juste de temps en temps garde le piège inverse.
  // La place de l'heure juste est tirée, pour ne pas devenir une habitude.
  const placeJuste = ce1 ? [Math.floor(tirer() * 4), Math.floor(tirer() * 4)] : [];

  for (let i = 0; i < manches; i += 1) {
    const lecture = i < MANCHES_LECTURE;
    const demie = ce1 && (i % 4) !== placeJuste[lecture ? 0 : 1];
    const maximum = lecture && !demie ? 11 : 12;

    let heure;
    do {
      heure = 1 + Math.floor(tirer() * maximum);
    } while (liste.length > 0 && heureDe(liste[liste.length - 1].heure) === heure);
    const moment = demie ? heure + 0.5 : heure;

    if (lecture) {
      liste.push({
        mode: 'lecture',
        heure: moment,
        choix: ce1 ? propositionsCE1(moment, tirer) : propositions(heure, tirer),
      });
    } else {
      let petite;
      do { petite = 1 + Math.floor(tirer() * 12); } while (petite === heure);
      // La grande part ailleurs que sur le 12 — et, au CE1, ailleurs que sur
      // le 6 : l'une ou l'autre serait déjà la moitié de la réponse.
      let grande;
      do { grande = 1 + Math.floor(tirer() * 11); } while (ce1 && grande === 6);
      liste.push({ mode: 'reglage', heure: moment, depart: { petite, grande } });
    }
  }

  return liste;
}

/** Ce que vaut une heure lue, choisie parmi les propositions. */
export function verdictLecture(choix, heure) {
  if (choix === heure) return 'juste';
  if (estDemie(heure) && choix === heureDe(heure)) return 'demie';
  if (estDemie(heure) && choix === tour(heure + 1)) return 'entre';
  if (!estDemie(heure) && choix === heure + 0.5) return 'pleine';
  if (choix === 12) return 'aiguilles';
  return choix < heure ? 'plus-tard' : 'plus-tot';
}

/**
 * Ce que vaut une horloge réglée, annoncée par l'enfant.
 *
 * L'ORDRE COMPTE : les aiguilles inversées passent avant tout le reste, parce
 * que c'est l'erreur de fond — l'enfant ne sait pas laquelle donne l'heure.
 */
export function verdictReglage({ petite, grande }, moment) {
  const heure = heureDe(moment);
  const place = estDemie(moment) ? 6 : 12;
  if (petite === heure && grande === place) return 'juste';
  if (heure !== place && grande === heure && petite === place) return 'inversees';
  if (petite === heure) return estDemie(moment) ? 'grande-demie' : 'grande';
  return 'petite';
}

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export function consigneReglage(heure) {
  return `Mets l’horloge sur ${ecrire(heure)}.`;
}

export const PHRASES = {
  consigneLecture: 'Quelle heure est-il ?',
  aiguilles: 'Attention : l’heure se lit sur la petite aiguille.',
  plusTard: 'C’est plus tard que ça.',
  plusTot: 'C’est plus tôt que ça.',
  inversees: 'Tu as inversé les aiguilles. La petite montre l’heure.',
  grande: 'À une heure juste, la grande aiguille est sur le 12.',
  petite: 'La petite aiguille n’est pas sur la bonne heure.',
  indice: 'Choisis d’abord une aiguille, puis touche un nombre.',
  demie: 'La grande aiguille est sur le 6 : c’est « et demie ».',
  entre: 'Entre deux nombres, la petite aiguille montre celui qu’elle vient de passer.',
  pleine: 'La grande aiguille est sur le 12 : c’est une heure juste.',
  grandeDemie: 'Pour « et demie », la grande aiguille est sur le 6.',
};

/** L'écriture d'une heure, sur un bouton de réponse. */
export function ecrire(heure) {
  const h = heureDe(heure);
  return `${h} heure${h > 1 ? 's' : ''}${estDemie(heure) ? ' et demie' : ''}`;
}

/** Les douze heures en toutes lettres. « UNE heure », jamais « un heure ». */
const EN_LETTRES = ['', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six',
  'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];

/**
 * L'HEURE TELLE QU'ON LA DIT, en toutes lettres — Camara, le 22/09/2026 :
 * « il faut que la prof lise l'heure de manière naturelle, u-neur, neu-veur,
 * pas neuf… heure ».
 *
 * LA CAUSE ÉTAIT LE CHIFFRE. Ce qu'on envoyait à la synthèse, c'était
 * « 9 heures ? » : devant un chiffre, elle annonce un nombre, s'arrête, puis
 * lit le mot suivant — et le traitement du son conserve ce silence comme un
 * vrai blanc. Écrit « neuf heures », c'est un groupe de mots français, et la
 * liaison se fait d'elle-même : neu-veur, deu-zeur, si-zeur, hui-teur.
 *
 * ÇA NE CHANGE QUE LA VOIX. L'écran garde ses chiffres — `ecrire` — parce
 * qu'un CP apprend justement à relier le 9 de l'horloge au mot qu'il entend.
 */
export function dire(heure) {
  const h = heureDe(heure);
  return `${EN_LETTRES[h]} heure${h > 1 ? 's' : ''}${estDemie(heure) ? ' et demie' : ''}`;
}

/** La consigne de réglage, dite : « Mets l'horloge sur neuf heures. » */
export function consigneReglageDite(heure) {
  return `Mets l’horloge sur ${dire(heure)}.`;
}
