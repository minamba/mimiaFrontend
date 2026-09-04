import httpClient, { API_BASE_URL } from './httpClient';

/**
 * Les bandeaux promotionnels de la page d'accueil.
 *
 * LES OCTETS NE PASSENT PAS PAR AXIOS. Une image se charge par la balise
 * `<img>`, qui sait déjà décoder, mettre en cache, revalider et choisir entre
 * deux sources selon la largeur de l'écran. La ramener en JavaScript pour la
 * réinjecter en `blob:` reviendrait à réécrire tout ça, en moins bien, et à
 * perdre le cache du navigateur au premier changement de page.
 *
 * D'où deux choses ici : des appels JSON pour les métadonnées, et une
 * fabrique d'ADRESSES pour les visuels.
 */

/**
 * Le bandeau affiché, ou `null`.
 *
 * Le serveur rend 204 quand il n'y a pas de promotion en cours — l'état le
 * plus fréquent du site. `data` vaut alors la chaîne vide, d'où le test sur
 * l'identifiant plutôt que sur la présence d'un corps.
 */
export const getPromoActive = () =>
  httpClient.get('/promos/actif').then(({ data }) => (data?.id ? data : null));

/**
 * L'adresse d'un visuel.
 *
 * `v` PORTE LA VERSION DU BANDEAU, et ce n'est pas une précaution vague : sans
 * elle, remplacer un visuel laisserait l'ancien affiché chez tous ceux qui
 * l'ont déjà vu. Le serveur revalide bien par étiquette, mais l'adresse
 * change aussi — ceinture et bretelles pour la seule image du site qu'on
 * remplace en pleine campagne.
 */
export const urlImagePromo = (id, { mobile = false, version } = {}) => {
  const parametres = new URLSearchParams();

  if (mobile) parametres.set('format', 'mobile');
  if (version) parametres.set('v', String(version));

  const suite = parametres.toString();

  return `${API_BASE_URL}/promos/${id}/image${suite ? `?${suite}` : ''}`;
};

// ------------------------------------------------------------ administration

export const getPromos = () => httpClient.get('/promos');

/**
 * Crée ou remplace un bandeau.
 *
 * `FormData` ET NON DU JSON : deux fichiers accompagnent trois champs de
 * texte. Les encoder en base64 dans un corps JSON gonflerait la charge d'un
 * tiers et obligerait le serveur à les décoder à la main.
 *
 * LES FICHIERS ABSENTS NE SONT PAS ENVOYÉS DU TOUT — pas envoyés vides. Côté
 * serveur, absent veut dire « ne touche pas à celui-là » : c'est ce qui
 * permet de corriger une faute dans le texte sans retéléverser deux images.
 */
function corps({ titre, texteAlternatif, lien, imageLarge, imageMobile }) {
  const donnees = new FormData();

  donnees.append('titre', titre ?? '');
  donnees.append('texteAlternatif', texteAlternatif ?? '');
  donnees.append('lien', lien ?? '');

  if (imageLarge) donnees.append('imageLarge', imageLarge);
  if (imageMobile) donnees.append('imageMobile', imageMobile);

  return donnees;
}

export const creerPromo = (promo) => httpClient.post('/promos', corps(promo));

export const modifierPromo = (id, promo) => httpClient.put(`/promos/${id}`, corps(promo));

/** Affiche ce bandeau — ce qui éteint tous les autres — ou le retire. */
export const afficherPromo = (id, actif) =>
  httpClient.put(`/promos/${id}/affichage`, { actif });

export const supprimerPromo = (id) => httpClient.delete(`/promos/${id}`);
