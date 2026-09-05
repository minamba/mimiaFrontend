/**
 * L'OFFRE DE LANCEMENT : CE QUI EST PROMIS DOIT ÊTRE DONNÉ.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Une promotion vit à deux endroits qui ne se voient pas : la page qui la
 * PROMET, et le webhook de paiement qui la TIENT. Le jour où les deux ne
 * répondent plus la même chose, un parent paie en lisant « 3 h offertes » et
 * ne les reçoit pas. C'est la panne la plus coûteuse d'un site marchand :
 * invisible côté serveur — aucune erreur, aucun journal — et parfaitement
 * visible côté client, qui écrit au support.
 *
 * La parade tient à une règle : `active` et `bandeau` sont calculés PAR LE
 * SERVEUR, échéance comprise, et le navigateur ne fait que les afficher. Deux
 * horloges qui jugeraient séparément la même promotion divergeraient
 * forcément — et celle du visiteur, il suffit de la reculer.
 *
 * D'où des tests qui portent sur le refus d'afficher, plus que sur
 * l'affichage :
 *
 *   1. Rien ne s'affiche quand le serveur dit non. Y compris — surtout —
 *      quand une date de fin traîne encore dans les réglages.
 *
 *   2. Le compte à rebours disparaît à zéro. Il ne montre pas « 0 j 0 h », qui
 *      donnerait à croire que l'offre court encore.
 *
 *   3. Une échéance illisible ne fait pas tomber la page d'accueil. Le réglage
 *      est saisi à la main ; une chaîne cassée ne doit coûter qu'un compte à
 *      rebours absent.
 *
 *   4. Le décompte se coupe SANS couper l'offre. Ce sont deux décisions, et
 *      les confondre reviendrait à devoir éteindre une promotion en cours pour
 *      cesser de la crier.
 */

import { render, screen } from '@testing-library/react';
import CompteARebours from '../components/CompteARebours';

let mockOffre;

jest.mock('../lib/storage/modeTest', () => ({
  useOffreLancement: () => mockOffre,
}));

// React Router v7 expose ses sous-chemins d’une façon que le résolveur de Jest
// fourni par CRA ne sait pas suivre : importer le vrai module fait échouer la
// suite AVANT le premier test. Le composant ne se sert que de `Link` — on le
// remplace par l’ancre qu’il produit, et le test reste sur ce qu’il doit
// prouver. Même parade que dans `rideauMaintenance`.
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

/**
 * Une échéance à tant de jours et d'heures d'ici.
 *
 * LA DEMI-HEURE EN PLUS N'EST PAS DÉCORATIVE. Le composant tronque vers le
 * bas : viser 3 j 5 h pile donne 3 j 4 h 59 min le temps que l'horloge
 * avance d'une microseconde entre la construction et la lecture, et le test
 * échoue une fois sur deux sans qu'on comprenne pourquoi. On vise le milieu
 * de l'heure, là où aucun arrondi ne peut basculer.
 */
const dansDesJours = (jours, heures = 0) =>
  new Date(
    Date.now() + jours * 86_400_000 + heures * 3_600_000 + 30 * 60_000,
  ).toISOString();

/** Une offre en cours, telle que le serveur la rend. */
const vivante = (fin, reste = {}) => ({
  active: true,
  texte: 'OFFRE LANCEMENT',
  bandeau: true,

  // LE NOMBRE D HEURES VIENT DU SERVEUR, qui le lit dans le pack regle en
  // administration. Zero veut dire que le pack est introuvable — le compte a
  // rebours ne doit alors rien annoncer.
  heures: 3,

  // Les formules concernees, et leur ecriture pour un humain. Les deux
  // viennent du serveur : lui seul connait les libelles.
  formules: ['SOLO'],
  formulesTexte: 'Solo',

  fin,
  ...reste,
});

const dessiner = () => render(<CompteARebours />);

beforeEach(() => {
  mockOffre = { active: false, texte: '', fin: null, bandeau: false, heures: 0 };
});

// ------------------------------------------------- ce que le serveur décide

test('offre éteinte : rien ne s’affiche, même avec une date de fin valide', () => {
  // LE CAS QUI COMPTE. Éteindre l'interrupteur n'efface pas l'échéance — c'est
  // même l'intérêt, on la garde pour la campagne suivante. Si le navigateur
  // jugeait sur la seule présence d'une date, l'offre resterait annoncée après
  // avoir été coupée.
  mockOffre = {
    active: false, texte: 'OFFRE LANCEMENT', bandeau: false, heures: 3, fin: dansDesJours(10),
  };

  const { container } = dessiner();

  expect(container).toBeEmptyDOMElement();
});

test('offre vivante mais sans échéance : pas de compte à rebours inventé', () => {
  mockOffre = vivante(null);

  const { container } = dessiner();

  expect(container).toBeEmptyDOMElement();
});

test('échéance dépassée : le compteur disparaît au lieu d’afficher zéro', () => {
  mockOffre = vivante(dansDesJours(-1));

  const { container } = dessiner();

  expect(container).toBeEmptyDOMElement();
});

test('échéance illisible : la page d’accueil tient debout', () => {
  mockOffre = vivante('la semaine prochaine');

  const { container } = dessiner();

  expect(container).toBeEmptyDOMElement();
});

// -------------------------------------- couper le décompte sans couper l'offre

test('le décompte se masque sans éteindre l’offre', () => {
  // DEUX DÉCISIONS DISTINCTES. L'offre engage — elle change la carte Solo et
  // crédite des heures. Le décompte n'est qu'une vitrine. Les confondre
  // obligerait à arrêter une promotion en cours pour cesser de la crier.
  //
  // Les premiers jours d'une campagne, « il reste 26 jours » ne presse
  // personne : on garde l'offre et on allume le décompte à la fin.
  mockOffre = vivante(dansDesJours(20), { bandeau: false });

  const { container } = dessiner();

  expect(container).toBeEmptyDOMElement();
});

// ------------------------------------------------------------- le décompte

test('le décompte montre les jours et les heures restantes', () => {
  mockOffre = vivante(dansDesJours(3, 5));

  dessiner();

  expect(screen.getByText('3')).toBeInTheDocument();
  expect(screen.getByText('jours')).toBeInTheDocument();
  expect(screen.getByText('05')).toBeInTheDocument();
});

test('le décompte dit CE QU’IL décompte', () => {
  // Deux nombres sans légende ne veulent rien dire : « 26 JOURS 19 HEURES »
  // pouvait aussi bien être une durée de cours qu'un délai de livraison. Le
  // défaut était invisible en relecture de code — il ne se voit qu'à l'écran,
  // et seulement quand on regarde le bloc sans savoir ce qu'il est.
  mockOffre = vivante(dansDesJours(5));

  dessiner();

  expect(screen.getByText(/Fin de l’offre dans/)).toBeInTheDocument();
});

test('le dernier jour, la légende change de ton', () => {
  mockOffre = vivante(dansDesJours(0, 4));

  dessiner();

  // L'urgence n'est signalée qu'au moment où elle est réelle. Annoncée
  // pendant les trois semaines qui précèdent, elle apprend à ne plus se voir.
  expect(screen.getByText(/Dernier jour/)).toBeInTheDocument();
});

test('les minutes n’apparaissent qu’au dernier jour', () => {
  mockOffre = vivante(dansDesJours(3, 5));

  const { unmount } = dessiner();

  // À trois jours, « min » n'ajoute rien à « il reste 3 jours ».
  expect(screen.queryByText('min')).not.toBeInTheDocument();
  unmount();

  // À quelques heures, c'est exactement ce qu'on vient regarder.
  mockOffre = vivante(dansDesJours(0, 4));
  dessiner();

  expect(screen.getByText('min')).toBeInTheDocument();
});

test('la mention affichée est celle réglée en administration', () => {
  // Elle est paramétrable : un « OFFRE LANCEMENT » écrit en dur ici et là-bas
  // se contredirait à la première campagne renommée.
  mockOffre = vivante(dansDesJours(5), { texte: 'RENTRÉE 2026' });

  dessiner();

  expect(screen.getByText('RENTRÉE 2026')).toBeInTheDocument();
});

test('le décompte mène à la page des tarifs', () => {
  mockOffre = vivante(dansDesJours(5));

  dessiner();

  // Une promotion qu'on annonce sans dire où la prendre laisse le visiteur
  // chercher dans la barre de navigation — et beaucoup renoncent là.
  expect(screen.getByRole('link')).toHaveAttribute('href', '/tarifs');
});

// ------------------------------------------------- ce qui est offert

test('le nombre d’heures offertes vient du serveur, pas du code', () => {
  // ÉCRIT EN DUR, IL AURAIT MENTI AU PREMIER CHANGEMENT D'OFFRE. Le pack est
  // choisi dans l'administration ; passer de trois à dix heures ne doit
  // demander aucune retouche du navigateur — et surtout, la page ne doit pas
  // continuer d'annoncer trois heures pendant que le webhook en crédite dix.
  mockOffre = vivante(dansDesJours(5), { heures: 10 });

  dessiner();

  expect(screen.getByText(/10 h de cours offertes/)).toBeInTheDocument();
});

test('sans pack résolu, le décompte ne promet rien', () => {
  // `heures: 0` veut dire que le code réglé ne désigne aucun pack actif —
  // supprimé, désactivé, mal saisi. Le serveur éteint déjà l'offre dans ce
  // cas ; cette garde-ci est la seconde, du côté du navigateur. Annoncer des
  // heures que le webhook serait incapable de créditer est la panne que tout
  // ce dispositif existe pour empêcher.
  mockOffre = vivante(dansDesJours(5), { heures: 0 });

  const { container } = dessiner();

  expect(container).toBeEmptyDOMElement();
});

test('les formules concernées sont nommées, pas devinées', () => {
  // « Solo » écrit en dur ici aurait continué d'annoncer Solo le jour où la
  // campagne porte sur Duo. Le libellé est composé par le serveur, seul à
  // connaître le catalogue.
  mockOffre = vivante(dansDesJours(5), {
    formules: ['SOLO', 'DUO'],
    formulesTexte: 'Solo et Duo',
  });

  dessiner();

  expect(screen.getByText(/la formule Solo et Duo/)).toBeInTheDocument();
});
