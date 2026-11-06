/**
 * LA VOIX DE REPLI RESPECTE LE GENRE DU PROFESSEUR — signalement de production du
 * 03/11/2026 : Adrien a parlé d'une voix d'homme, puis d'une voix de femme.
 */
import { voixPourProfesseur } from '../lib/storage/voixService';

const v = (name, lang = 'fr-FR') => ({ name, lang });
const WINDOWS = [v('Microsoft Denise Online (Natural)'), v('Microsoft Henri Online (Natural)'), v('Microsoft Paul'), v('Google français')];

test('un professeur prend une voix d’homme, même si une voix de femme vient d’abord', () => {
  expect(voixPourProfesseur(WINDOWS, 'adrien')).toEqual({ voix: WINDOWS[1], plusGrave: false });
});

test('une professeure prend une voix de femme', () => {
  expect(voixPourProfesseur(WINDOWS, 'nora')).toEqual({ voix: WINDOWS[0], plusGrave: false });
});

test('un homme sans voix d’homme sur l’appareil : la voix est baissée', () => {
  const seule = [v('Google français')];
  expect(voixPourProfesseur(seule, 'adrien')).toEqual({ voix: seule[0], plusGrave: true });
});

test('une professeure sans voix de femme sur l’appareil garde ce qu’il y a, sans la changer', () => {
  const seule = [v('Thomas')];
  expect(voixPourProfesseur(seule, 'marine')).toEqual({ voix: seule[0], plusGrave: false });
});

test('sans voix française, rien', () => {
  expect(voixPourProfesseur([v('Samantha', 'en-US')], 'adrien')).toEqual({ voix: null, plusGrave: false });
  expect(voixPourProfesseur([], 'adrien')).toEqual({ voix: null, plusGrave: false });
});
