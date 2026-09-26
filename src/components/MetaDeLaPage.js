import useMetaPage from '../lib/seo/useMetaPage';

/**
 * Le porteur du hook des métadonnées.
 *
 * IL NE REND RIEN, et c'est tout son intérêt : `useLocation` exige d'être
 * appelé SOUS le routeur, alors que l'application monte `BrowserRouter` dans
 * le même composant qui décrit les routes. Un composant vide glissé à
 * l'intérieur résout la contrainte sans découper le fichier des routes.
 */
export default function MetaDeLaPage() {
  useMetaPage();
  return null;
}
