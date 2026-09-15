/**
 * LA COMMANDE VOCALE « PHOTO », RECONNUE SANS AMBIGUÏTÉ.
 *
 * Un enfant peut dire « photo » au milieu d'une phrase qui n'a rien à voir —
 * « il y a une photo dans mon livre », « je préfère la deuxième photo » —
 * sans vouloir déclencher quoi que ce soit. La reconnaître partout ferait
 * partir une capture au milieu d'une explication, avec la caméra qui prend
 * n'importe quoi à cet instant-là.
 *
 * La commande n'est donc reconnue QUE si l'énoncé entier est court et ne
 * contient rien d'autre que ce mot, seul ou entouré d'une poignée de mots
 * d'usage : « photo », « prends la photo », « une photo s'il te plaît ».
 * Une phrase plus longue, ou qui contient un mot hors de cette liste, est un
 * tour de parole ordinaire — jamais une commande.
 */
const MOTS_AUTORISES = new Set([
  'photo', 'la', 'une', 'prends', 'prend', 'stp', 'plait', 's', 'il', 'te', 'vous',
]);

function normaliser(texte) {
  return (texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .trim();
}

/** L'énoncé est-il la commande « Photo », et rien d'autre ? */
export function estCommandePhoto(texte) {
  const nettoye = normaliser(texte);
  if (!nettoye) return false;

  const mots = nettoye.split(/\s+/).filter(Boolean);
  if (mots.length === 0 || mots.length > 5) return false;
  if (!mots.includes('photo')) return false;

  return mots.every((mot) => MOTS_AUTORISES.has(mot));
}
