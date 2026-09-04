/**
 * LA BARRE D'ONGLETS REPLIABLE.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Ce composant porte la navigation de toute l'administration — huit sections
 * au premier niveau, quatre sous l'onglet Mails. S'il se casse, l'écran n'est
 * pas dégradé : il devient inatteignable.
 *
 * Le pli lui-même est du CSS, et ces tests ne le voient pas : jsdom n'applique
 * aucune requête média. Ce qu'ils vérifient, c'est l'ÉTAT que le CSS consomme,
 * et les trois façons de refermer. Sur un téléphone, un menu qui ne se referme
 * pas recouvre le contenu qu'on venait lire, et il faut viser le déclencheur
 * pour s'en sortir.
 *
 * L'ÉTAT EST LU SUR `aria-expanded` PLUTÔT QUE SUR LA CLASSE. Les deux sortent
 * du même booléen, mais l'attribut est le contrat : c'est lui que lit un
 * lecteur d'écran, et il ne peut pas être renommé par inadvertance en
 * retouchant une feuille de style. Un seul test descend jusqu'à la classe,
 * parce que le repli en dépend nommément.
 *
 * LE LIBELLÉ DU DÉCLENCHEUR EST TESTÉ AUSSI, et ce n'est pas cosmétique : une
 * barre d'onglets sert autant à se situer qu'à naviguer. Réduite à trois
 * barres muettes, elle dit où aller mais plus où l'on est.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Onglets from '../components/Onglets';

const SECTIONS = [
  { cle: 'stats', libelle: 'Statistiques' },
  { cle: 'parents', libelle: 'Parents (11)' },
  { cle: 'modes', libelle: 'Modes' },
];

function dessiner(actif = 'stats', onChoisir = jest.fn()) {
  const view = render(
    <Onglets items={SECTIONS} actif={actif} onChoisir={onChoisir} etiquette="Sections" />,
  );

  return { ...view, onChoisir };
}

/**
 * Le déclencheur, atteint par son étiquette et non par `expanded`.
 *
 * `getByRole('button', { expanded: false })` LÈVE au lieu de rendre `null`
 * quand rien ne correspond : un repli derrière `??` ne s'exécuterait jamais,
 * et le helper casserait dès que le menu est ouvert.
 */
const declencheur = () => screen.getByLabelText(/^Sections —/);

const estOuvert = () => declencheur().getAttribute('aria-expanded') === 'true';

// ------------------------------------------------------------ se situer

test('le déclencheur porte le nom de la section courante', () => {
  dessiner('parents');

  // Assertion portée SUR LE DÉCLENCHEUR et non sur la page : les deux formes
  // — repliée et dépliée — sont toujours rendues, c'est le CSS qui en cache
  // une. Le libellé existe donc deux fois dans le DOM.
  expect(declencheur()).toHaveTextContent('Parents (11)');
});

test('une section inconnue retombe sur la première plutôt que sur du vide', () => {
  // Peut arriver après un renommage de clé : mieux vaut un libellé faux
  // qu'un déclencheur muet, qui se lit comme un bouton cassé.
  dessiner('section-disparue');

  expect(screen.getByLabelText(/Sections — Statistiques/)).toBeInTheDocument();
});

// ------------------------------------------------------- ouvrir et fermer

test('le menu est replié au départ', () => {
  dessiner();

  expect(estOuvert()).toBe(false);
});

test('le déclencheur ouvre puis referme', () => {
  dessiner();

  fireEvent.click(declencheur());
  expect(estOuvert()).toBe(true);

  fireEvent.click(declencheur());
  expect(estOuvert()).toBe(false);
});

test('choisir une section referme le menu', () => {
  const { onChoisir } = dessiner();

  fireEvent.click(declencheur());
  fireEvent.click(screen.getByRole('tab', { name: 'Modes' }));

  expect(onChoisir).toHaveBeenCalledWith('modes');
  expect(estOuvert()).toBe(false);
});

test('Échap referme', () => {
  dessiner();

  fireEvent.click(declencheur());
  fireEvent.keyDown(document, { key: 'Escape' });

  expect(estOuvert()).toBe(false);
});

test('un clic ailleurs referme', () => {
  dessiner();

  fireEvent.click(declencheur());
  fireEvent.mouseDown(document.body);

  expect(estOuvert()).toBe(false);
});

test('l’ouverture pose la classe dont dépend le repli', () => {
  // LE SEUL TEST QUI DESCEND JUSQU'À LA CLASSE, et il le fait exprès : c'est
  // `.onglets--ouvert` que la requête média interroge pour déplier le panneau.
  // Renommée sans le savoir, la barre resterait fermée sur tous les
  // téléphones — et rien d'autre ici ne le signalerait.
  const { container } = dessiner();

  fireEvent.click(declencheur());

  // eslint-disable-next-line testing-library/no-node-access -- une classe n'a ni rôle ni texte : aucune requête de Testing Library ne l'atteint.
  expect(container.firstChild).toHaveClass('onglets--ouvert');
});

// ------------------------------------------------------- l'accessibilité

test('la section courante est annoncée comme sélectionnée', () => {
  dessiner('modes');

  // `aria-selected` et non la seule classe : un lecteur d'écran ne lit pas
  // les couleurs, et c'est le seul signal qui lui dit où il est.
  expect(screen.getByRole('tab', { name: 'Modes' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'Statistiques' })).toHaveAttribute('aria-selected', 'false');
});
