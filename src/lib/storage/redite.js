/**
 * LA MÊME PHRASE, TRANSCRITE DEUX FOIS — relevé par Camara le 19/09/2026, en
 * pleine expression écrite : « le prof hallucine en me disant "tu viens de me
 * redire telle chose" alors que j'ai rien dit, ça s'est déclenché tout seul ».
 *
 * LE PROFESSEUR N'HALLUCINAIT PAS : l'élève avait bien « redit ». En base, le
 * même soir :
 *   01:40:16  « Porte, c'est féminin, du coup, encastré, c'est E E… »
 *   01:40:43  « porte c'est féminin, du coup encastré c'est E E… »
 *   01:45:11  « J'ai vu qu'en dessous… un bouton. J'ai vu qu'en dessus… un bouton. »
 *   01:45:28  « J'ai vu qu'en dessous de la peinture se cachait un bouton. »
 * Une seule fois prononcé, deux fois transcrit. C'est le risque accepté le
 * 13/09 par la mémoire tampon du micro : un tour dont le verdict se perd est
 * renvoyé, et peut revenir deux fois — préférable à une phrase perdue. Mais le
 * double, lui, ne doit pas partir.
 *
 * CE N'EST PAS UN ÉCHO — voir `echo.js`, qui compare à ce qu'a dit le
 * PROFESSEUR. Ici, on compare à ce qu'a déjà dit l'ÉLÈVE.
 *
 * ON REFUSE D'AJOUTER, ON N'EFFACE JAMAIS : la règle du 13/09 tient — ce qui
 * est dans le champ reste. Le doublon n'y entre simplement pas.
 */

/** En dessous, une redite peut être voulue : « oui », « j'ai gratté ». */
const MOTS_MINIMUM = 4;

/** Part des mots du fragment déjà présents pour parler de redite. */
const RECOUVREMENT = 0.85;

/**
 * Au-delà, ce n'est plus un renvoi du micro : l'élève a pu vouloir redire.
 * Les doubles relevés arrivaient en 17 et 27 secondes.
 */
const FENETRE_MS = 60000;

/**
 * Le professeur a DEMANDÉ de répéter : la redite est la réponse attendue, elle
 * part. Sans cette exception, « tu peux répéter ? » n'aurait jamais de suite.
 */
const DEMANDE_DE_REPETER = /r[ée]p[èée]te|redi[st]|redire|encore une fois|pas (bien )?(compris|entendu|saisi)|j'ai mal entendu/i;

const normaliser = (texte) =>
  (texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** Les mots du fragment sont-ils, pour l'essentiel, déjà dans `deja` ? */
function contenuDans(fragment, deja) {
  const mots = normaliser(fragment);
  if (mots.length < MOTS_MINIMUM) return false;

  const presents = new Set(normaliser(deja));
  if (presents.size === 0) return false;

  const communs = mots.filter((mot) => presents.has(mot)).length;
  return communs / mots.length >= RECOUVREMENT;
}

/**
 * @param fragment     la phrase que le micro vient de rendre
 * @param assemble     ce qui attend déjà dans le champ, pas encore envoyé
 * @param dernierEnvoi le dernier message de l'élève : { texte, le } (Date.now())
 * @param demandeProf  la dernière intervention du professeur
 * @param maintenant   pour les tests
 */
export function estUneRedite(fragment, {
  assemble = '', dernierEnvoi = null, demandeProf = '', maintenant = Date.now(),
} = {}) {
  // Déjà dans le champ : la même phrase rendue deux fois pendant le tour.
  if (assemble && contenuDans(fragment, assemble)) return true;

  if (!dernierEnvoi?.texte || !dernierEnvoi.le) return false;
  if (maintenant - dernierEnvoi.le > FENETRE_MS) return false;
  if (DEMANDE_DE_REPETER.test(demandeProf ?? '')) return false;

  return contenuDans(fragment, dernierEnvoi.texte);
}
