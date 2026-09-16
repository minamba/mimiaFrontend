/**
 * LA PAGE NE DÉFILE PLUS DERRIÈRE UNE FENÊTRE OUVERTE.
 *
 * Voulu par Camara le 15/09/2026 : « n'importe quelle popup ouverte sur le
 * site, on bloque le scroll ». Sur téléphone surtout, un doigt qui glisse sur
 * une fenêtre faisait défiler la page en dessous, et on perdait sa place.
 *
 * UNE SURVEILLANCE DU DOCUMENT, PAS UNE LIGNE PAR FENÊTRE
 * ------------------------------------------------------
 * Il y a une trentaine de fenêtres dans l'application, et d'autres viendront.
 * Demander à chacune de verrouiller la page, c'est la garantie qu'une
 * l'oubliera. On observe donc le document : dès qu'une fenêtre y apparaît, la
 * page se fige ; quand la dernière disparaît, elle se libère.
 *
 * POURQUOI `position: fixed` ET PAS SEULEMENT `overflow: hidden`
 * ------------------------------------------------------------
 * Sur iPhone, Safari ignore `overflow: hidden` sur la page pour le défilement
 * au doigt. Figer le corps en position fixe, décalé de la hauteur déjà
 * défilée, est la seule parade fiable ; on rend ensuite la position exacte à
 * la fermeture, pour que la page ne remonte pas en haut.
 */

/**
 * Tout ce qui recouvre la page. `aria-modal` attrape aussi les fenêtres
 * futures, pourvu qu'elles se déclarent correctement.
 */
export const SELECTEUR_FENETRES = [
  '.modale',
  '.scan-mobile',
  '.visionneuse',
  '.planche-apercu',
  '.tableau-plein',
  '.sortie-eleve',
  '[aria-modal="true"]',
].join(', ');

export const CLASSE_BLOQUEE = 'defilement-bloque';

export function installerVerrouDefilement(doc = document) {
  const racine = doc.documentElement;
  const corps = doc.body;
  const fenetre = doc.defaultView;

  let bloque = false;
  let position = 0;
  let attente = null;

  const bloquer = () => {
    position = fenetre.scrollY || 0;
    racine.classList.add(CLASSE_BLOQUEE);
    corps.style.position = 'fixed';
    corps.style.top = `-${position}px`;
    corps.style.left = '0';
    corps.style.right = '0';
    corps.style.width = '100%';
    bloque = true;
  };

  const liberer = () => {
    racine.classList.remove(CLASSE_BLOQUEE);
    corps.style.position = '';
    corps.style.top = '';
    corps.style.left = '';
    corps.style.right = '';
    corps.style.width = '';
    bloque = false;

    // La page revient là où on l'avait laissée, pas en haut.
    try {
      fenetre.scrollTo(0, position);
    } catch {
      // Environnement sans défilement (tests) : rien à rendre.
    }
  };

  const verifier = () => {
    attente = null;
    const ouverte = Boolean(doc.querySelector(SELECTEUR_FENETRES));

    if (ouverte && !bloque) bloquer();
    else if (!ouverte && bloque) liberer();
  };

  // Regroupé sur la frame suivante : ouvrir une fenêtre ajoute des dizaines de
  // nœuds d'un coup, une seule vérification suffit.
  const planifier = () => {
    if (attente !== null) return;
    attente = (fenetre.requestAnimationFrame ?? ((f) => setTimeout(f, 0)))(verifier);
  };

  const observateur = new fenetre.MutationObserver(planifier);
  observateur.observe(corps, { childList: true, subtree: true });

  verifier();

  return () => {
    observateur.disconnect();
    if (bloque) liberer();
  };
}
