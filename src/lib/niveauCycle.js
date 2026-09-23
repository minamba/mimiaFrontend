/**
 * LE CYCLE D'UNE CLASSE, DÉDUIT DE SON LIBELLÉ — un filet, jamais la source.
 *
 * Camara, le 21/09/2026 : le bouton des jeux n'apparaissait pas dans la vue
 * de l'enfant, alors qu'il apparaissait chez le parent et que tout le reste
 * était juste — le réglage en base, la réponse de l'API, le cycle de l'élève.
 *
 * LA CAUSE ÉTAIT LA SESSION. Le cycle y est écrit AU MOMENT DE LA CONNEXION ;
 * un enfant déjà connecté quand ce champ est apparu garde une session qui ne
 * le porte pas, et rien à l'écran ne l'explique. Le parent, lui, lit la liste
 * de ses enfants à chaque visite : il l'a toujours.
 *
 * POURQUOI PAS UN APPEL AU SERVEUR. C'était ma première correction, et elle
 * était dangereuse : l'intercepteur ferme la session de l'enfant sur un 401.
 * Une route qui refuserait ce jeton n'aurait pas seulement raté le
 * rattrapage — elle aurait DÉCONNECTÉ l'enfant en pleine page. Un filet ne
 * doit jamais pouvoir casser ce qu'il rattrape.
 *
 * POURQUOI C'EST SÛR ICI. La liste des classes est fermée et vient de notre
 * propre semeur : cinq libellés au primaire qui sont leur propre code, quatre
 * au collège en « 6e » à « 3e » plus la prépa-métiers, et tout le lycée qui
 * commence par Seconde, Première ou Terminale. Les vingt-six lignes de
 * `NiveauScolaire` sont couvertes, et les tests les énumèrent.
 *
 * ET ÇA RESTE UN FILET : dès qu'une session porte son cycle, c'est lui qui
 * vaut. Cette fonction ne sert qu'aux sessions ouvertes avant le 21/09/2026.
 */

const PRIMAIRE = /^(CP|CE1|CE2|CM1|CM2)$/i;
const COLLEGE = /^[3-6]e\b/i;
const LYCEE = /^(seconde|premi[eè]re|terminale)/i;

/** « Primaire », « College », « Lycee » — ou null si le libellé n'apprend rien. */
export function cycleDuNiveau(libelle) {
  const texte = (libelle ?? '').trim();
  if (!texte) return null;

  if (PRIMAIRE.test(texte)) return 'Primaire';
  if (COLLEGE.test(texte)) return 'College';
  if (LYCEE.test(texte)) return 'Lycee';

  return null;
}
