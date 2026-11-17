/**
 * « TOUS LES AVANTAGES DE …, PLUS : » (14/11/2026) : chaque formule ne liste que ce qu'elle ajoute à la précédente.
 */
import { differences, phraseDEcart } from '../components/Tarifs';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });

const starter = { libelle: 'Starter', nombreEnfantsMax: 1, heuresPot: 4.5, heuresPlafondEnfant: 4.5 };
const solo = { libelle: 'Solo', nombreEnfantsMax: 1, heuresPot: 9, heuresPlafondEnfant: 9 };
const duo = { libelle: 'Duo', nombreEnfantsMax: 2, heuresPot: 16, heuresPlafondEnfant: 10 };
const famille = { libelle: 'Famille', nombreEnfantsMax: 4, heuresPot: 24, heuresPlafondEnfant: 10 };

const texte = (l) => (typeof l === 'string' ? l : [l.barre ?? l.plein, l.total, l.fort].filter(Boolean).join(' · '));

// LES HEURES EN PLUS, PUIS LE TOTAL (Camara, le 15/11/2026) : « les 4 h du Starter + 5 h, le total entre parenthèses ».
test('Solo après Starter : les heures en plus, et le total entre parenthèses', () => {
  const l = differences(solo, starter).map(texte);
  expect(l).toHaveLength(1);
  expect(l[0]).toBe('+ 4,5 h par mois · 9 h au total');
  expect(differences({ ...solo, heuresPot: 9 }, { ...starter, heuresPot: 4 }).map(texte)[0])
    .toBe('+ 5 h par mois · 9 h au total');
});

test('Duo après Solo : enfants, heures à partager, plafond', () => {
  const l = differences(duo, solo).map(texte);
  expect(l[0]).toBe("Jusqu'à 2 enfants");
  expect(l[1]).toBe('+ 7 h par mois · 16 h au total');
  expect(l[2]).toBe('10 h max. par enfant');
});

test('Famille après Duo : le plafond identique n’est pas répété', () => {
  const l = differences(famille, duo).map(texte);
  expect(l).toHaveLength(2);
  expect(l[0]).toBe("Jusqu'à 4 enfants");
  expect(l.join(' ')).not.toMatch(/max\./);
});

test('en promotion, les heures en plus restent (non barrées) et le premier mois s’affiche dessous', () => {
  const [ligne] = differences(solo, { ...starter, heuresPot: 4 }, 3);
  expect(ligne.barre).toBeUndefined();
  expect(ligne.plein).toBe('+ 5 h par mois');
  expect(ligne.total).toBe('9 h au total');
  expect(ligne.fort).toBe('12 h le 1er mois (3 h offertes)');
});

test('la phrase d’écart ne se dit que quand les heures doublent à enfants égaux', () => {
  expect(phraseDEcart(solo, starter)).toMatch(/^Deux fois plus d’heures/);
  expect(phraseDEcart(duo, solo)).toBeNull();
  expect(phraseDEcart(famille, duo)).toBeNull();
  expect(phraseDEcart(starter, null)).toBeNull();
});

test('la conseillère apparaît dans Solo quand Starter ne l’a pas, et seulement si le module est allumé', () => {
  const starterSans = { ...starter, avecConseillere: false };
  const soloAvec = { ...solo, avecConseillere: true };
  expect(differences(soloAvec, starterSans, 0, { orientation: true }).map(texte))
    .toContain('Une conseillère d’orientation dès la 3e');
  expect(differences(soloAvec, starterSans, 0, { orientation: false }).map(texte))
    .not.toContain('Une conseillère d’orientation dès la 3e');
  // Duo après Solo : déjà incluse, pas répétée.
  expect(differences({ ...duo, avecConseillere: true }, soloAvec, 0, { orientation: true }).map(texte).join(' '))
    .not.toMatch(/conseillère/);
});

// « DANS LA PARTIE SOLO, AJOUTE L'ACCÈS AUX PODCASTS » (Camara, le 15/11/2026) : ni Starter ni l'essai n'en ont.
test('les podcasts apparaissent dans Solo, pas plus loin, et seulement si le module est allumé', () => {
  const starterSans = { ...starter, avecPodcasts: false };
  const soloAvec = { ...solo, avecPodcasts: true };
  expect(differences(soloAvec, starterSans, 0, { podcasts: true }).map(texte)).toContain('Accès aux podcasts de ses cours');
  expect(differences(soloAvec, starterSans, 0, { podcasts: false }).map(texte).join(' ')).not.toMatch(/podcasts/);
  expect(differences({ ...duo, avecPodcasts: true }, soloAvec, 0, { podcasts: true }).map(texte).join(' ')).not.toMatch(/podcasts/);
  // Une API qui ne dit rien : rien d'annoncé.
  expect(differences(solo, starter, 0, { podcasts: true }).map(texte).join(' ')).not.toMatch(/podcasts/);
});
