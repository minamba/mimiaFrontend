import axios from 'axios';
import { authService } from '../storage/authService';
import { fermerSessionEleve, jetonEleve } from '../storage/sessionEleve';
import { enTeteBillet, signalerAffluence } from '../affluence/salleDAttente';

export const API_BASE_URL = process.env.REACT_APP_API_URL ?? '';

const httpClient = axios.create({ baseURL: API_BASE_URL });

/**
 * L'en-tête d'authentification d'une requête, ou null s'il n'y a personne.
 *
 * LA SESSION ENFANT PASSE AVANT CELLE DU PARENT.
 *
 * Les deux peuvent coexister dans le même navigateur : un parent qui se
 * connecte pour régler quelque chose sur l'ordinateur de son fils laisse sa
 * propre session derrière lui. Si le jeton parent l'emportait, l'enfant
 * travaillerait ensuite dans le compte de son père sans le savoir — et le
 * serveur n'aurait aucun moyen de s'en apercevoir.
 *
 * Le jeton enfant gagne donc, et le parent se déconnecte de cet appareil
 * quand il a fini.
 *
 * EXPORTÉ parce que la synthèse vocale n'appelle pas le serveur par axios :
 * elle lit la réponse AU FIL DE L'EAU, ce qu'aucun `responseType` d'axios ne
 * sait faire dans un navigateur. Elle passe donc par `fetch` — et doit
 * s'authentifier de la même façon, sinon la règle ci-dessus vaudrait partout
 * sauf là, c'est-à-dire précisément là où un enfant travaille.
 */
export async function enTeteAuth() {
  const eleve = jetonEleve();
  if (eleve) return `Eleve ${eleve}`;

  const token = await authService.getAccessToken();
  return token ? `Bearer ${token}` : null;
}

// Le jeton est ajouté à chaque requête plutôt qu'une fois au démarrage :
// il est renouvelé silencieusement en arrière-plan, donc le lire une seule
// fois enverrait un jeton périmé au bout de 30 minutes.
httpClient.interceptors.request.use(async (config) => {
  const entete = await enTeteAuth();
  if (entete) config.headers.Authorization = entete;

  // LE BILLET DE LA SALLE D'ATTENTE, quand il y en a un. Il n'existe que si le
  // serveur a déjà refusé une requête faute de place : hors jour d'affluence,
  // cette ligne ne fait rien et n'envoie rien.
  const billet = enTeteBillet();
  if (billet) config.headers['X-Billet'] = billet;

  return config;
});

/**
 * Une session enfant expirée ou révoquée ferme l'écran, proprement.
 *
 * Le parent a suspendu l'accès, ou régénéré le code : le serveur répond 401 et
 * l'enfant se retrouverait devant une page qui ne charge plus, sans rien
 * comprendre. On efface la session pour qu'il retombe sur l'écran du code, qui
 * lui dira quoi faire.
 */
/**
 * UN COMPTE BANNI EST COUPÉ NET, y compris en pleine séance.
 *
 * Le serveur d’identité ferme les portes, mais quelqu’un déjà entré garderait
 * son jeton jusqu’à son expiration. L’API refuse donc chaque requête d’un
 * banni avec un 403 portant le code `BANNI` — et ce code existe précisément
 * pour être distingué ici : un 403 ordinaire signale un droit manquant sur un
 * écran d’administration, et fermer la session dans ce cas-là serait absurde.
 */
const BANNI = 'BANNI';

/**
 * LE SERVEUR EST PLEIN, ET CE N'EST PAS UNE PANNE.
 *
 * Un 503 ordinaire veut dire « quelque chose ne va pas ». Celui-ci veut dire
 * « votre tour viendra », et le code le distingue : le premier mérite un
 * message d'erreur, le second une file d'attente et un rang.
 */
const AFFLUENCE = 'AFFLUENCE';

httpClient.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    const reponse = erreur?.response;

    // TROP DE MONDE : on prend son rang et on laisse l'écran d'attente
    // s'afficher. L'erreur continue d'être rejetée — l'appel qui l'a
    // provoquée a bel et bien échoué, et l'écran qui l'attendait doit le
    // savoir plutôt que de tourner indéfiniment.
    if (reponse?.status === 503 && reponse?.data?.code === AFFLUENCE) {
      signalerAffluence(reponse.data);
      return Promise.reject(erreur);
    }

    if (reponse?.status === 403 && reponse?.data?.code === BANNI) {
      // La session de l’enfant s’efface d’abord : sans ça, il retomberait sur
      // l’écran du code avec un jeton mort et se ferait refuser en boucle.
      if (jetonEleve()) fermerSessionEleve();

      // RECHARGEMENT COMPLET plutôt qu’une navigation interne. Ce qui reste en
      // mémoire — le magasin Redux, les écrans ouverts — a été construit pour
      // quelqu’un qui avait le droit d’être là. On repart de zéro.
      window.location.assign('/');

      return Promise.reject(erreur);
    }

    if (reponse?.status === 401 && jetonEleve()) {
      fermerSessionEleve();
      window.location.assign('/');
    }

    return Promise.reject(erreur);
  },
);

export default httpClient;
