import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ORIGINE, estNonIndexee, normaliser, pageDuChemin,
} from './pages';

/**
 * LES MÉTADONNÉES, REFAITES À CHAQUE CHANGEMENT DE PAGE.
 *
 * Camara, le 23/09/2026. Voir `pages.js` pour le défaut que ça corrige : toutes
 * les pages se déclaraient « page d'accueil » à Google, canonique comprise.
 *
 * SANS BIBLIOTHÈQUE. `react-helmet` et ses cousins pèsent une dépendance, un
 * fournisseur à poser autour de l'application et une API à apprendre, pour ce
 * que font quarante lignes de manipulation du DOM. Le projet écrit ce qu'il
 * peut écrire.
 *
 * ON MODIFIE, ON N'AJOUTE PAS. Chaque balise est cherchée avant d'être créée :
 * une page visitée trois fois ne doit pas laisser trois descriptions dans
 * l'en-tête — et c'est exactement ce qui arrive quand on se contente
 * d'`appendChild`. Un test le vérifie.
 *
 * CE QUE ÇA NE FAIT PAS, ET IL FAUT LE SAVOIR. Google exécute le JavaScript :
 * il verra ces balises. Les robots des réseaux sociaux — Facebook, WhatsApp,
 * LinkedIn, iMessage — ne l'exécutent PAS : ils liront toujours celles
 * d'`index.html`, donc celles de l'accueil. C'est acceptable tant qu'on
 * partage la page d'accueil ; le jour où ça ne l'est plus, la réponse est le
 * pré-rendu, pas une rustine ici.
 */

/** Trouve une balise, ou la crée avec les attributs qui l'identifient. */
function baliseMeta(selecteur, attributs) {
  let balise = document.head.querySelector(selecteur);

  if (!balise) {
    balise = document.createElement('meta');
    Object.entries(attributs).forEach(([nom, valeur]) => balise.setAttribute(nom, valeur));
    document.head.appendChild(balise);
  }

  return balise;
}

function poserMeta(selecteur, attributs, contenu) {
  baliseMeta(selecteur, attributs).setAttribute('content', contenu);
}

function poserCanonique(adresse) {
  let lien = document.head.querySelector('link[rel="canonical"]');

  if (!lien) {
    lien = document.createElement('link');
    lien.setAttribute('rel', 'canonical');
    document.head.appendChild(lien);
  }

  lien.setAttribute('href', adresse);
}

/**
 * Applique les métadonnées du chemin donné. Exportée à part du hook pour être
 * testable sans monter de routeur.
 */
export function appliquerMeta(chemin) {
  const cible = normaliser(chemin);
  const page = pageDuChemin(cible);
  const cachee = estNonIndexee(cible);

  // Une page sans fiche garde le titre du site : mieux vaut le nom de la
  // marque qu'un onglet vide ou le titre de la page d'avant.
  const titre = page?.titre ?? 'Mimia — le professeur particulier de vos enfants';
  const description = page?.description
    ?? "Un professeur par IA pour chaque enfant, du CP à la Terminale.";

  document.title = titre;
  poserMeta('meta[name="description"]', { name: 'description' }, description);

  // LA CANONIQUE SUIT LE CHEMIN, et ne le porte que pour une page indexable :
  // désigner une adresse canonique pour une page qu'on demande d'ignorer, ce
  // sont deux consignes contradictoires données au même robot.
  poserCanonique(cachee ? ORIGINE : `${ORIGINE}${cible === '/' ? '/' : cible}`);

  // Le partage : ce que montrent les réseaux quand quelqu'un colle le lien.
  // Inutile pour un robot qui n'exécute rien, utile pour ceux qui le font.
  poserMeta('meta[property="og:url"]', { property: 'og:url' }, `${ORIGINE}${cible === '/' ? '/' : cible}`);
  poserMeta('meta[property="og:title"]', { property: 'og:title' }, titre);
  poserMeta('meta[property="og:description"]', { property: 'og:description' }, description);
  poserMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, titre);
  poserMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);

  // `noindex` SE RETIRE AUSSI. Posé une fois et jamais enlevé, il suivrait le
  // visiteur de l'espace connecté vers la page des tarifs et la ferait
  // disparaître de l'index — un défaut invisible à l'écran, et durable.
  const robots = document.head.querySelector('meta[name="robots"]');

  if (cachee) {
    poserMeta('meta[name="robots"]', { name: 'robots' }, 'noindex, nofollow');
  } else if (robots) {
    robots.remove();
  }
}

/** Pose les métadonnées de la route courante. À appeler sous le routeur. */
export default function useMetaPage() {
  const { pathname } = useLocation();

  useEffect(() => {
    appliquerMeta(pathname);
  }, [pathname]);
}
