/**
 * LA NOTATION MATHÉMATIQUE, DITE À VOIX HAUTE.
 *
 * Ces règles ont une histoire : elles n'existaient qu'à moitié, et le défaut
 * ne s'entendait pas — parce que `gpt-4o-mini-tts` DEVINAIT. Il lisait « 3 × BC »
 * comme « trois fois BC » de lui-même, et « BC = 6,7 » avec son égalité, sans
 * qu'aucune règle ne le lui demande.
 *
 * Le jour où la voix de secours a pris le relais, `tts-1` a lu ce qu'on lui
 * donnait : « trois BC », et le signe égal purement absent. Ce n'est pas le
 * secours qui était fautif — c'est le principal qui masquait le trou.
 *
 * D'où ces tests. Ils ne protègent pas une fonction : ils protègent une règle
 * de conduite. Une lecture correcte ne doit jamais dépendre de ce qu'un modèle
 * veut bien comprendre, parce que le jour où l'on en change, tout ce qu'on lui
 * avait délégué tombe d'un coup.
 *
 * Les cas négatifs comptent autant que les positifs : la moitié du travail est
 * de NE PAS transformer « peut-être » en « peut moins être ».
 */

import { voixService } from '../lib/storage/voixService';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

/**
 * `prononcable` n'est pas exportée : on l'atteint par le seul chemin qui la
 * traverse, la mise en file. Le lecteur retient le texte préparé dans sa file
 * sans rien jouer tant qu'aucun contexte audio n'existe.
 */
function preparer(texte) {
  const lecteur = voixService.creerLecteur();

  // `demarrer` est neutralisé : sans ça, la boucle de lecture retire la
  // première phrase de la file dans la foulée, et on lirait une file déjà
  // entamée. On ne teste pas la lecture ici, seulement le texte préparé.
  lecteur.demarrer = () => {};
  lecteur.dire(texte);

  return lecteur.file.map((p) => p.texte).join(' ');
}

// ------------------------------------------------------- la multiplication

test('« 3 × BC » se dit « 3 fois BC »', () => {
  expect(preparer('On a 3 × BC dans le triangle.')).toContain('3 fois BC');
});

test('« 3BC » collé se dit aussi « 3 fois BC »', () => {
  expect(preparer('Donc 3BC vaut 12.')).toContain('3 fois BC');
});

test('« 3D » reste « 3D » : une seule majuscule n’est pas un produit', () => {
  const dit = preparer('Une figure en 3D.');

  expect(dit).toContain('3D');
  expect(dit).not.toContain('3 fois D');
});

// ------------------------------------------------------------- les signes

test('le signe égal est prononcé', () => {
  expect(preparer('On trouve BC = 6,7 centimètres.')).toContain('BC égale 6,7');
});

test('les comparateurs sont prononcés', () => {
  expect(preparer('Si x < 5 alors c’est bon.')).toContain('x inférieur à 5');
});

test('le pourcentage est prononcé', () => {
  expect(preparer('Il reste 20 % du travail.')).toContain('20 pour cent');
});

// -------------------------------------------- ce qu'il ne faut PAS toucher

test('un mot composé garde son tiret', () => {
  const dit = preparer('C’est peut-être vrai, mais rez-de-chaussée aussi.');

  expect(dit).toContain('peut-être');
  expect(dit).not.toContain('peut moins être');
});

test('une date n’est pas une division', () => {
  expect(preparer('Rendez-vous le 12/03/2026.')).toContain('12/03/2026');
});

test('une fraction, elle, est bien dite « sur »', () => {
  expect(preparer('Calcule 10/5 pour voir.')).toContain('10 sur 5');
});
