/**
 * Nommer et lancer l'impression d'un document.
 *
 * Le navigateur ne propose aucune API pour choisir le nom du PDF : il reprend
 * le titre de la page. On le remplace donc le temps de l'impression, puis on
 * le restaure — sans quoi l'onglet garderait « Mimia--Bilal_Mathematiques… »
 * comme titre pour le reste de la session.
 */

/**
 * Rend un fragment utilisable dans un nom de fichier : accents décomposés puis
 * retirés, espaces en tirets, et surtout aucun des caractères que Windows
 * refuse (\ / : * ? " < > |). Un nom invalide ferait échouer l'enregistrement
 * sans message clair.
 */
const morceau = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/** `2026-08-01` : le tri alphabétique du dossier devient chronologique. */
const jour = (valeur) => {
  const date = valeur ? new Date(valeur) : new Date();
  if (Number.isNaN(date.getTime())) return '';

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

/**
 * `Mimia--Bilal-Camara_Mathematiques_2026-08-01`
 *
 * @param suffixe distingue les documents d'une même journée et d'une même
 *   matière — sans lui, la copie et le rapport du même cours porteraient le
 *   même nom et le second écraserait le premier.
 */
export function nomDocument({ prenom, nom, matiere, date, suffixe }) {
  const parties = [
    morceau([prenom, nom].filter(Boolean).join(' ')),
    morceau(matiere),
    jour(date),
    morceau(suffixe),
  ].filter(Boolean);

  return `Mimia--${parties.join('_')}`;
}

/**
 * Masque tout ce qui n'est pas la feuille, en remontant sa chaîne d'ancêtres
 * et en cachant leurs autres enfants.
 *
 * L'approche habituelle — `visibility: hidden` sur tout le corps, puis la
 * feuille remise en `position: absolute` — a un défaut rédhibitoire : un
 * élément hors flux n'est pas garanti de se paginer, et le navigateur coupe
 * tout ce qui dépasse de la première page. C'est ce qui tronquait la copie
 * juste avant l'observation du professeur.
 *
 * Ici la feuille reste dans le flux normal du document. La pagination redevient
 * celle d'une page ordinaire, donc elle fonctionne.
 *
 * @returns la fonction qui rétablit l'affichage.
 */
function isolerPourImpression(feuille) {
  if (!feuille) return () => {};

  const masques = [];

  for (let noeud = feuille; noeud?.parentElement; noeud = noeud.parentElement) {
    for (const frere of noeud.parentElement.children) {
      if (frere === noeud) continue;
      masques.push([frere, frere.style.display]);
      frere.style.display = 'none';
    }
  }

  return () => masques.forEach(([element, valeur]) => {
    element.style.display = valeur;
  });
}

/**
 * Imprime en donnant au PDF le nom demandé, puis rend à la page son titre et
 * son affichage.
 *
 * @param selecteur ce qu'il faut imprimer. Le reste de la page est masqué le
 *   temps de l'impression.
 */
export function imprimerSous(nomFichier, selecteur = '.modale--controle') {
  const titreOrigine = document.title;
  const rendreVisible = isolerPourImpression(document.querySelector(selecteur));

  const restaurer = () => {
    document.title = titreOrigine;
    rendreVisible();
    window.removeEventListener('afterprint', restaurer);
  };

  // `afterprint` plutôt qu'une restauration juste après window.print() :
  // l'appel est bloquant sur certains navigateurs et pas sur d'autres, et
  // rendre le titre trop tôt donnerait « Mimia — le professeur… » au fichier.
  window.addEventListener('afterprint', restaurer);
  document.title = nomFichier;

  window.print();

  // Filet de sécurité : si le navigateur n'émet jamais l'événement, le titre
  // reviendrait quand même au bout de quelques secondes.
  setTimeout(restaurer, 5000);
}
