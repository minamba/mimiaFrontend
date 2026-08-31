/**
 * L'ÉPELLATION DES CHOIX ENTRE HOMOPHONES, POSÉE PAR L'APPLICATION.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * « Est-ce qu'on écrit avait ou avaient ? », prononcée à voix haute, est
 * littéralement « est-ce qu'on écrit X ou X ? ». L'élève au casque, les yeux
 * sur sa copie, n'a aucun moyen de savoir ce qu'on lui demande de choisir.
 *
 * La consigne du professeur le lui dit. Il a épelé dans son EXPLICATION —
 * « "avait" se termine par a-i-t, "avaient" par a-i-e-n-t » — puis a posé la
 * question sans épeler. Or c'est la question qui décide : c'est là que l'élève
 * doit entendre la différence.
 *
 * On ne le lui redemande donc pas une neuvième fois. Le cas est MÉCANIQUE :
 * deux formes du même verbe, séparées par « ou », dans une question. Le code
 * sait le reconnaître, et il sait quoi ajouter.
 *
 * POURQUOI LE MOTIF EST AUSSI ÉTROIT
 * ----------------------------------
 * Repérer « avait » et « avaient » dans la même phrase ne suffirait pas : un
 * professeur de français construit des exemples qui contiennent les deux —
 * « il avait un chien et ils avaient un chat ». Épeler là serait absurde.
 *
 * C'est le « ou » qui fait la différence : il n'apparaît entre deux formes du
 * même verbe que pour proposer un choix. C'est la signature de la question,
 * pas celle de l'exemple.
 */

/** Comment se prononce chaque terminaison, une fois épelée. */
const EPELLATIONS = {
  ait: 'a-i-t',
  aient: 'a-i-e-n-t',
  é: 'e accent aigu',
  er: 'e-r',
  ez: 'e-z',
  i: 'i',
  ie: 'i-e',
  is: 'i-s',
  ies: 'i-e-s',
};

/**
 * Les familles de terminaisons qui se prononcent pareil.
 *
 * Chaque famille est un ensemble de fins interchangeables à l'oreille sur un
 * MÊME radical. C'est une règle, pas une liste de mots : « avait/avaient » la
 * vérifie comme « chantait/chantaient » ou « finissait/finissaient », sans
 * qu'aucun verbe n'ait à être énuméré.
 */
const FAMILLES = [
  ['aient', 'ait'],
  ['ez', 'er', 'é'],
  ['ies', 'ie', 'is', 'i'],
];

/** La terminaison de cette famille que porte ce mot, ou null. */
function terminaison(mot, famille) {
  // Les plus longues d'abord : « aient » avant « ait », sinon « avaient »
  // serait lu comme un radical « avai » suivi de « ent ».
  return famille.find((fin) => mot.length > fin.length && mot.endsWith(fin)) ?? null;
}

/**
 * Ajoute l'épellation aux deux termes d'un choix entre homophones.
 *
 * Ne touche à rien d'autre : une phrase sans « ou » entre deux formes du même
 * radical ressort telle quelle.
 */
export function epelerLesChoix(texte) {
  if (!texte || !texte.includes(' ou ')) return texte;

  // Deux mots séparés par « ou », avec la ponctuation et les guillemets que le
  // professeur met autour de ses formes.
  const motif = /([a-zà-öø-ÿ]+)(["'»”]?\s*,?\s+ou\s+["'«“]?)([a-zà-öø-ÿ]+)/gi;

  return texte.replace(motif, (tout, gauche, milieu, droite) => {
    for (const famille of FAMILLES) {
      const finG = terminaison(gauche.toLowerCase(), famille);
      const finD = terminaison(droite.toLowerCase(), famille);
      if (!finG || !finD || finG === finD) continue;

      // Le MÊME radical, sinon ce ne sont pas deux orthographes du même mot
      // mais deux mots différents — « il chantait ou dansait » n'a rien
      // d'ambigu à l'oreille.
      const radicalG = gauche.slice(0, gauche.length - finG.length).toLowerCase();
      const radicalD = droite.slice(0, droite.length - finD.length).toLowerCase();
      if (radicalG !== radicalD) continue;

      // DÉJÀ ÉPELÉ : on ne le fait pas deux fois. Le professeur qui suit sa
      // consigne s'entendrait sinon dire « avait, a-i-t, a-i-t ».
      if (tout.includes('-')) continue;

      return `${gauche}, ${EPELLATIONS[finG]},${milieu}${droite}, ${EPELLATIONS[finD]}`;
    }

    return tout;
  });
}

export default epelerLesChoix;
