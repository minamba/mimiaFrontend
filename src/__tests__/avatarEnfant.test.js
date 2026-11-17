import { render } from '@testing-library/react';
import {
  trancheDeClasse, anneeDeClasse, lireCatalogue, avatarsDeLaClasse, avatarParDefaut, avatarEnfant, imageDeLAvatar,
} from '../lib/avatarEnfant';
import ChoixAvatar from '../components/ChoixAvatar';

/**
 * L'AVATAR D'UN ENFANT (16/11/2026) : le catalogue se lit dans le nom des fichiers, le choix se fait dans la
 * tranche d'âge de la classe, et sans choix l'enfant garde l'avatar par défaut.
 */
const catalogue = lireCatalogue(
  [
    './avatar-cp-ce1-asie-garcon-courts.png',
    './avatar-cp-ce1-afrique-fille-tresses.webp',
    './avatar-lycee-europe-fille-longs.png',
    './avatar-defaut-cp-ce1-garcon.png',
    './provisoire-cp-ce1-garcon.webp',
    './avatar-mauvais-nom.png',
  ],
  (cle) => `img:${cle}`,
);

test('les classes se rangent dans leur tranche, par leur code comme par leur libellé', () => {
  expect(trancheDeClasse('CP')).toBe('cp-ce1');
  expect(trancheDeClasse('CM1')).toBe('ce2-cm2');
  expect(trancheDeClasse('SIXIEME')).toBe('6e-5e');
  expect(trancheDeClasse('5e')).toBe('6e-5e');
  expect(trancheDeClasse('TROISIEME_PREPA')).toBe('4e-3e');
  expect(trancheDeClasse('SECONDE_PRO')).toBe('lycee');
  expect(trancheDeClasse('TERMINALE_STMG')).toBe('lycee');
  expect(trancheDeClasse('')).toBeNull();
});

test('le catalogue ne retient que les fichiers bien nommés', () => {
  expect(catalogue.avatars.map((a) => a.code)).toEqual([
    'cp-ce1-asie-garcon-courts',
    'cp-ce1-afrique-fille-tresses',
    'lycee-europe-fille-longs',
  ]);
  expect(catalogue.defauts['cp-ce1-garcon']).toBe('img:./avatar-defaut-cp-ce1-garcon.png');
});

test('les avatars proposés suivent la classe et le sexe', () => {
  expect(avatarsDeLaClasse('CE1', 2, catalogue).map((a) => a.code)).toEqual(['cp-ce1-asie-garcon-courts']);
  expect(avatarsDeLaClasse('CE1', 1, catalogue).map((a) => a.code)).toEqual(['cp-ce1-afrique-fille-tresses']);
  // Sexe pas encore choisi : toute la tranche.
  expect(avatarsDeLaClasse('CP', '', catalogue)).toHaveLength(2);
  expect(avatarsDeLaClasse('QUATRIEME', 2, catalogue)).toEqual([]);
});

test("l'avatar choisi s'affiche ; sinon celui par défaut, puis le portrait provisoire", () => {
  expect(avatarEnfant({ avatar: 'lycee-europe-fille-longs', niveauCode: 'TERMINALE', sexe: 1 }, catalogue))
    .toBe('img:./avatar-lycee-europe-fille-longs.png');
  expect(avatarEnfant({ avatar: null, niveauCode: 'CP', sexe: 2 }, catalogue))
    .toBe('img:./avatar-defaut-cp-ce1-garcon.png');
  // Un code disparu du catalogue retombe sur le défaut.
  expect(imageDeLAvatar('cp-ce1-latino-garcon-longs', catalogue)).toBeNull();
  expect(avatarParDefaut('CP', 1, catalogue)).toBeTruthy();
  // Sexe non précisé : rien (l'écran montre l'initiale).
  expect(avatarEnfant({ niveauCode: 'CP', sexe: 0 }, catalogue)).toBeNull();
});

test('les avatars par classe (« avatar-cp-… », cheveux « tres-courts ») se lisent et se proposent à leur classe', () => {
  const parClasse = lireCatalogue(
    [
      './avatar-cp-afrique-garcon-tres-courts.webp',
      './avatar-terminale-afrique-garcon-tres-courts.webp',
      './avatar-cp-ce1-asie-garcon-courts.webp',
    ],
    (cle) => `img:${cle}`,
  );
  expect(parClasse.avatars.map((a) => a.code)).toEqual([
    'cp-afrique-garcon-tres-courts',
    'terminale-afrique-garcon-tres-courts',
    'cp-ce1-asie-garcon-courts',
  ]);
  // Un CP voit l'avatar de sa classe ET ceux de sa tranche ; un CE1, seulement ceux de la tranche.
  expect(avatarsDeLaClasse('CP', 2, parClasse).map((a) => a.code)).toEqual([
    'cp-afrique-garcon-tres-courts',
    'cp-ce1-asie-garcon-courts',
  ]);
  expect(avatarsDeLaClasse('CE1', 2, parClasse).map((a) => a.code)).toEqual(['cp-ce1-asie-garcon-courts']);
  expect(avatarsDeLaClasse('TERMINALE_PRO', 2, parClasse).map((a) => a.code)).toEqual(['terminale-afrique-garcon-tres-courts']);
  expect(avatarsDeLaClasse('Terminale professionnelle', 1, parClasse)).toEqual([]);
  expect(anneeDeClasse('SIXIEME')).toBe('6e');
  expect(anneeDeClasse('1re générale')).toBe('premiere');
  expect(anneeDeClasse('SECONDE_PRO')).toBe('seconde');
});

test("sans avatars dans le dossier, le choix ne s'affiche pas", () => {
  const { container } = render(<ChoixAvatar classe="CP" sexe="2" valeur="" onChange={() => {}} />);
  expect(container.firstChild).toBeNull();
});
