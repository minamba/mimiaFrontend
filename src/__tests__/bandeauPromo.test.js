/**
 * LE BANDEAU PROMOTIONNEL DE LA PAGE D'ACCUEIL.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Ce composant est le seul à s'insérer AVANT le héros de la page d'accueil,
 * c'est-à-dire au-dessus de tout ce qui vend le produit. Trois façons de
 * l'abîmer, et aucune ne se voit tant qu'on ne l'a pas provoquée :
 *
 *   1. IL OCCUPE LA PLACE QUAND IL N'Y A RIEN À MONTRER. « Aucune promotion »
 *      est l'état ORDINAIRE du site — la promotion est l'exception. Un cadre
 *      vide, une hauteur réservée ou un fond gris en attente repousseraient le
 *      titre sous la ligne de flottaison tous les jours, pour l'exception.
 *
 *   2. IL SURVIT À SA PROPRE PANNE. Une promotion est un ornement commercial :
 *      API muette, réseau coupé, image supprimée en base — la page d'accueil
 *      doit s'afficher sans elle, sans message d'erreur et sans texte
 *      alternatif nu en haut de l'écran, qui se lirait comme un site cassé.
 *
 *   3. IL CHARGE LA MAUVAISE IMAGE SUR TÉLÉPHONE. C'est la raison d'être des
 *      deux fichiers : un visuel de 1920 × 320 ramené à la largeur d'un
 *      téléphone fait 65 pixels de haut, et la promotion ne sert plus à rien
 *      là où se fait la moitié du trafic. La bascule tient à une balise
 *      `<source>` que rien ne signale si elle disparaît — la page reste jolie
 *      sur l'écran du développeur.
 */

import { render, screen, waitFor } from '@testing-library/react';
import BandeauPromo from '../components/BandeauPromo';

let mockPromo;
let mockErreur;

jest.mock('../lib/api/promosApi', () => ({
  getPromoActive: () => (mockErreur ? Promise.reject(mockErreur) : Promise.resolve(mockPromo)),

  // La vraie fabrique d'adresses est trop simple pour mériter d'être feinte
  // en profondeur : on garde sa forme, pour pouvoir la lire dans les attributs.
  urlImagePromo: (id, { mobile = false, version } = {}) =>
    `/promos/${id}/image${mobile ? '?format=mobile' : '?'}&v=${version}`,
}));

const PROMO = {
  id: 7,
  texteAlternatif: 'Rentrée : -20 % sur tous les forfaits.',
  lien: '/tarifs',
  avecImageMobile: true,
  version: 638000,
};

beforeEach(() => {
  mockPromo = null;
  mockErreur = null;
});

// ------------------------------------------- il ne prend pas la place pour rien

test('sans promotion en cours, il ne rend RIEN', async () => {
  const { container } = render(<BandeauPromo />);

  // Attendu explicitement : un composant qui rendrait un cadre vide le temps
  // du chargement passerait un `expect` synchrone sans qu'on le voie.
  await waitFor(() => expect(container).toBeEmptyDOMElement());
});

test('une API en panne laisse la page d’accueil intacte', async () => {
  mockErreur = new Error('réseau coupé');

  const { container } = render(<BandeauPromo />);

  await waitFor(() => expect(container).toBeEmptyDOMElement());
});

// ------------------------------------------------------------- les deux images

test('la version téléphone est proposée quand elle existe', async () => {
  mockPromo = PROMO;

  const { container } = render(<BandeauPromo />);

  await screen.findByRole('img');

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- `<source>` n'a aucun rôle d'accessibilité : il ne décrit rien, il dit au navigateur quel fichier prendre. Aucune requête de Testing Library ne l'atteint.
  const source = container.querySelector('source');

  expect(source).toBeInTheDocument();
  expect(source).toHaveAttribute('media', '(max-width: 640px)');
  expect(source.getAttribute('srcSet') ?? source.getAttribute('srcset'))
    .toContain('format=mobile');
});

test('sans version téléphone, aucune source mobile n’est déclarée', async () => {
  // Le serveur retomberait de lui-même sur l'image large, mais autant ne pas
  // demander un fichier qu'on sait absent.
  mockPromo = { ...PROMO, avecImageMobile: false };

  const { container } = render(<BandeauPromo />);

  await screen.findByRole('img');

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- même raison : `<source>` est invisible pour l'arbre d'accessibilité.
  expect(container.querySelector('source')).not.toBeInTheDocument();
});

// --------------------------------------------------------------- le clic

test('le texte alternatif porte l’offre, pas le nom du fichier', async () => {
  mockPromo = PROMO;

  render(<BandeauPromo />);

  // Toute la promotion est DANS l'image. Sans ce texte, un visiteur aveugle
  // n'a rigoureusement rien — pas une offre dégradée, rien.
  expect(await screen.findByAltText('Rentrée : -20 % sur tous les forfaits.'))
    .toBeInTheDocument();
});

test('un bandeau sans lien n’est pas cliquable', async () => {
  mockPromo = { ...PROMO, lien: null };

  render(<BandeauPromo />);

  await screen.findByRole('img');

  // Un cadre qui réagit au survol et ne mène nulle part est plus frustrant
  // qu'une image inerte.
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

test('un lien externe s’ouvre sans donner la main sur notre page', async () => {
  mockPromo = { ...PROMO, lien: 'https://exemple.fr/offre' };

  render(<BandeauPromo />);

  await screen.findByRole('img');

  const lien = screen.getByRole('link');

  expect(lien).toHaveAttribute('target', '_blank');

  // Sans `noopener`, la page ouverte garde une poignée sur la nôtre par
  // `window.opener` et peut la rediriger.
  expect(lien.getAttribute('rel')).toContain('noopener');
});

test('un lien interne reste dans l’onglet', async () => {
  mockPromo = PROMO;

  render(<BandeauPromo />);

  await screen.findByRole('img');

  expect(screen.getByRole('link')).not.toHaveAttribute('target');
});

// ------------------------------------------------- vidéo et pleine largeur
//
// TOUS ASYNCHRONES, comme les précédents : le composant ne rend rien tant que
// la promotion n'est pas revenue du serveur. Une assertion synchrone y trouve
// un conteneur vide et échoue sans rapport avec ce qu'elle teste.

test('une vidéo est rendue dans une balise vidéo, jamais dans une image', async () => {
  // LES DEUX BALISES NE SE REMPLACENT PAS. Une vidéo posée dans un `<img>` ne
  // montre rigoureusement rien — pas une image cassée avec son texte de
  // remplacement : rien. Le défaut ne se voit qu'en téléversant une vraie
  // vidéo, c'est-à-dire jamais pendant un remaniement.
  mockPromo = { ...PROMO, estVideo: true };

  const { container } = render(<BandeauPromo />);

  const video = await waitFor(() => {
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- une balise vidéo sans commandes n'expose aucun rôle : aucune requête de Testing Library ne l'atteint.
    const trouve = container.querySelector('video');
    expect(trouve).toBeInTheDocument();

    return trouve;
  });

  // `muted` ET `playsInline` NE SONT PAS COSMÉTIQUES : sans le premier, aucun
  // navigateur ne lance la lecture automatique et le bandeau reste figé sur sa
  // première image ; sans le second, l'iPhone ouvre la vidéo en plein écran
  // par-dessus le site.
  expect(video.muted).toBe(true);
  expect(video.hasAttribute('playsinline')).toBe(true);
  expect(video.loop).toBe(true);
});

test('une image reste une image', async () => {
  mockPromo = { ...PROMO, estVideo: false };

  const { container } = render(<BandeauPromo />);

  await screen.findByRole('img');

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- symétrique du test précédent : on vérifie qu'aucune balise vidéo n'est posée.
  expect(container.querySelector('video')).not.toBeInTheDocument();
});

test('la pleine largeur pose la classe dont dépend la mise en page', async () => {
  // C'est `.promo--pleine` que la feuille de style interroge pour relâcher la
  // largeur et retirer l'arrondi. Renommée sans le savoir, le bandeau
  // resterait une bulle alors que l'administration affiche « toute la
  // largeur » — et rien d'autre ici ne le signalerait.
  mockPromo = { ...PROMO, pleineLargeur: true };

  const { container } = render(<BandeauPromo />);

  await screen.findByRole('img');

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- une classe n'a ni rôle ni texte.
  expect(container.firstChild).toHaveClass('promo--pleine');
});

test('sans le drapeau, le bandeau reste une bulle', async () => {
  mockPromo = { ...PROMO, pleineLargeur: false };

  const { container } = render(<BandeauPromo />);

  await screen.findByRole('img');

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- idem.
  expect(container.firstChild).not.toHaveClass('promo--pleine');
});
