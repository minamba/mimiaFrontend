/**
 * CE QUE CHAQUE PAGE PUBLIQUE DIT AUX MOTEURS DE RECHERCHE.
 *
 * Camara, le 23/09/2026 : « il faut faire le max pour que je remonte dans les
 * résultats ».
 *
 * LE DÉFAUT QU'ON CORRIGE. Le site est une application à page unique : ses
 * métadonnées sont écrites une seule fois, dans `public/index.html`. Un titre,
 * une description — et surtout une balise canonique figée sur
 * `https://mimia.fr/`. Résultat : la page des tarifs, celle des avis, les
 * pages légales s'annonçaient TOUTES à Google comme étant la page d'accueil,
 * et la canonique lui disait explicitement de n'en garder qu'une. Aucune ne
 * pouvait ressortir sur la recherche qui lui correspond.
 *
 * UNE TABLE, ET PAS DES CHAÎNES DISPERSÉES DANS LES COMPOSANTS. Trois raisons :
 * on relit d'un coup d'œil ce que le site raconte de lui-même ; le plan du
 * site se génère depuis la même source, donc il ne peut pas diverger ; et un
 * test peut vérifier qu'aucune page n'a le titre d'une autre.
 *
 * ÉCRIRE UN TITRE, C'EST ÉCRIRE UNE ANNONCE. Google en affiche environ
 * soixante caractères et la description cent soixante ; au-delà il coupe. Le
 * nom de la marque vient EN DERNIER — au début, il mange la place de ce qui
 * distingue la page, et le lecteur l'a déjà lu dans l'adresse.
 */

/** L'adresse publique du site. Les canoniques s'y rapportent toutes. */
export const ORIGINE = 'https://mimia.fr';

/**
 * Les pages qu'on veut voir indexées. L'ordre est celui du plan du site :
 * de la plus importante à la plus accessoire.
 *
 * `priorite` et `frequence` ne servent qu'au `sitemap.xml`. Google les traite
 * comme des indications, jamais comme des ordres — on les renseigne parce
 * qu'elles ne coûtent rien, pas en espérant un effet.
 */
export const PAGES = [
  {
    chemin: '/',
    titre: 'Mimia — le professeur particulier de vos enfants',
    description:
      "Un professeur par IA pour chaque enfant, du CP à la Terminale. Il ne donne jamais la réponse : il cherche où ça bloque, et reprend depuis là.",
    priorite: '1.0',
    frequence: 'weekly',
  },
  {
    chemin: '/tarifs',
    titre: 'Tarifs — un abonnement pour toute la fratrie | Mimia',
    description:
      "Un mois de cours particuliers pour le prix d'une heure. Un seul abonnement pour tous vos enfants, sans engagement, avec des heures à se partager.",
    priorite: '0.9',
    frequence: 'weekly',
  },
  {
    chemin: '/avis',
    titre: 'Avis des familles sur Mimia',
    description:
      "Ce que les parents disent de Mimia après plusieurs semaines : ce qui a changé pour leur enfant, ce qui les a surpris, ce qu'ils en attendaient.",
    priorite: '0.8',
    frequence: 'weekly',
  },
  {
    chemin: '/contact',
    titre: 'Nous écrire | Mimia',
    description:
      "Une question sur les cours, l'abonnement ou le compte de votre enfant ? Écrivez-nous, une personne vous répond.",
    priorite: '0.5',
    frequence: 'monthly',
  },
  {
    chemin: '/confidentialite',
    titre: 'Confidentialité et RGPD | Mimia',
    description:
      "Mimia est utilisé par des enfants. Ce que nous collectons, pourquoi, combien de temps nous le gardons, et comment tout effacer.",
    priorite: '0.4',
    frequence: 'monthly',
  },
  {
    chemin: '/cgv',
    titre: "Conditions de vente et d'utilisation | Mimia",
    description:
      "L'abonnement, les heures incluses, la pause, la résiliation, et les limites de l'intelligence artificielle — dites en clair.",
    priorite: '0.3',
    frequence: 'monthly',
  },
  {
    chemin: '/mentions-legales',
    titre: 'Mentions légales | Mimia',
    description:
      "L'éditeur du site, son hébergeur, la propriété intellectuelle et les moyens de nous signaler un contenu.",
    priorite: '0.3',
    frequence: 'yearly',
  },
];

/**
 * LES PAGES QUI NE DOIVENT JAMAIS ÊTRE INDEXÉES, par le début de leur chemin.
 *
 * Trois familles, et chacune pour sa raison :
 *   — l'espace connecté (`/eleves`, `/profil`, `/admin`) : les données d'un
 *     enfant n'ont rien à faire dans un index, même si l'accès reste protégé ;
 *   — les pages de passage (`/callback`, `/silent-renew`, `/scan`) : elles ne
 *     veulent rien dire hors de leur flux, et `/scan` porte un jeton ;
 *   — les pages d'un lien de courriel (`/desabonnement`, `/donner-mon-avis`) :
 *     elles n'ont de sens que pour qui a reçu le courriel.
 *
 * `/code` EN FAIT PARTIE, et ce n'est pas évident : c'est une page publique,
 * mais elle s'adresse à un enfant qui a déjà son code. La voir arriver dans
 * une recherche n'aiderait personne, et elle n'a rien à vendre.
 */
export const NON_INDEXEES = [
  '/eleves',
  '/profil',
  '/admin',
  '/code',
  '/scan',
  '/callback',
  '/silent-renew',
  '/desabonnement',
  '/donner-mon-avis',
];

/** Le chemin, sans sa barre finale ni ses paramètres. « / » reste « / ». */
export function normaliser(chemin) {
  const propre = (chemin || '/').split('?')[0].split('#')[0];
  return propre.length > 1 ? propre.replace(/\/+$/, '') : '/';
}

/** La fiche d'une page, ou `null` si ce chemin n'en a pas. */
export function pageDuChemin(chemin) {
  const cible = normaliser(chemin);
  return PAGES.find((p) => p.chemin === cible) ?? null;
}

/** Cette adresse doit-elle porter `noindex` ? */
export function estNonIndexee(chemin) {
  const cible = normaliser(chemin);

  // Une page connue est indexable par définition : c'est la liste qui décide.
  if (PAGES.some((p) => p.chemin === cible)) return false;

  // Tout le reste l'est aussi — y compris les adresses inventées, qui rendent
  // la page « introuvable » : une page d'erreur indexée est une page de moins
  // qui compte, et autant d'adresses fantaisistes dans l'index.
  return true;
}

/** Le préfixe privé qui couvre ce chemin, pour expliquer une décision. */
export function prefixePrive(chemin) {
  const cible = normaliser(chemin);
  return NON_INDEXEES.find((p) => cible === p || cible.startsWith(`${p}/`)) ?? null;
}
