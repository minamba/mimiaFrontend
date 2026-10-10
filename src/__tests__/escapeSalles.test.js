/**
 * LA SALLE À FOUILLER DES ESCAPE GAMES — Camara, le 09/10/2026. Chaque
 * histoire a ses six objets repérés sur son décor et sa porte ; on fouille un
 * objet après l'autre, l'inventaire se remplit, et la partie finit en passant
 * la porte.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MODULES_COLLEGE } from '../lib/jeux/college/index.js';
import { MODULES_LYCEE } from '../lib/jeux/lycee/index.js';
import { REPERES_ESCAPE } from '../lib/jeux/reperesEscape.js';
import { ECRANS_COLLEGE } from '../components/jeux/JeuxCollege';

const HISTOIRES = [...MODULES_COLLEGE, ...MODULES_LYCEE]
  .filter((m) => m.ESCAPE)
  .flatMap((m) => m.CLASSES.map((c) => `${m.FAMILLE.cle}|${c}`));

describe('les repères des salles', () => {
  it('couvrent chaque histoire, et rien d’autre', () => {
    expect(Object.keys(REPERES_ESCAPE).sort()).toEqual([...HISTOIRES].sort());
  });

  it.each(HISTOIRES)('%s : six objets nommés et une porte, dans le décor', (id) => {
    const { objets, porte } = REPERES_ESCAPE[id];
    expect(objets).toHaveLength(6);
    [...objets, porte].forEach((o) => {
      expect(o.x).toBeGreaterThanOrEqual(5);
      expect(o.x).toBeLessThanOrEqual(95);
      expect(o.y).toBeGreaterThanOrEqual(5);
      expect(o.y).toBeLessThanOrEqual(95);
      expect(o.nom.trim().length).toBeGreaterThan(2);
    });
    // Deux objets ne se recouvrent pas : on doit pouvoir cliquer l'un sans l'autre.
    objets.forEach((a, i) => objets.slice(i + 1).forEach((b) => {
      expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(6);
    }));
  });
});

describe('une partie dans la salle', () => {
  afterEach(() => jest.restoreAllMocks());

  it('mission, six objets fouillés dans l’ordre, inventaire plein, puis la porte', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const module = MODULES_COLLEGE.find((m) => m.FAMILLE.cle === 'escape-histoire-geo');
    const serie = module.serie(2024, 'TROISIEME');
    const Jeu = ECRANS_COLLEGE['escape-histoire-geo'];
    render(<Jeu onQuitter={jest.fn()} matiereCode="HISTOIRE_GEO" niveau="TROISIEME" />);

    // Pendant la mission, on ne fouille rien.
    expect(screen.getByRole('button', { name: /^Fouiller / })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Commencer l’enquête' }));

    const { objets } = REPERES_ESCAPE['escape-histoire-geo|TROISIEME'];
    for (let i = 0; i < 6; i += 1) {
      // Un seul objet à fouiller : celui du cadenas en cours.
      expect(screen.getAllByRole('button', { name: /^Fouiller / })).toHaveLength(1);
      await userEvent.click(screen.getByRole('button', { name: `Fouiller ${objets[i].nom}` }));
      const fiche = screen.getByRole('dialog');
      await userEvent.click(within(fiche).getByRole('button', { name: String(serie[i].bonne) }));
      expect(screen.getByLabelText(`Inventaire : ${i + 1} pièce${i ? 's' : ''} sur 6`)).toBeInTheDocument();
      await userEvent.click(within(fiche).getByRole('button', { name: 'Continuer' }));
      expect(screen.queryByRole('dialog')).toBeNull();
    }

    // Les six cadenas ouverts : la porte s'ouvre, et le mot du code apparaît.
    expect(screen.getByText(module.PAR_CLASSE.TROISIEME.fin)).toBeInTheDocument();
    const sorties = screen.getAllByRole('button', { name: /^Sortir par / });
    expect(sorties.length).toBeGreaterThan(0);
    await userEvent.click(sorties[0]);
    expect(screen.getByRole('button', { name: /Rejouer/ })).toBeInTheDocument();
  });
});

describe('ce que la salle lit', () => {
  // eslint-disable-next-line global-require
  const { sansRang, repliquesEscape } = require('../lib/jeux/escapeTextes');
  // eslint-disable-next-line global-require
  const { toutesLesRepliques } = require('../lib/jeux/voix/repliques');
  const cles = new Set(Object.values(toutesLesRepliques()).flat().map((r) => r.cle));

  it('le récit perd son rang en tête, déjà dit par la consigne', () => {
    expect(sansRang('Premier connecteur : sur l’écran, une dépêche.')).toBe('Sur l’écran, une dépêche.');
    expect(sansRang('Dernière salle, près de la sortie : un immense globe.')).toBe('Un immense globe.');
    expect(sansRang('Le deuxième verrou porte un démenti : x.')).toBe('Le deuxième verrou porte un démenti : x.');
    expect(sansRang('La première page de la chronique parle.')).toBe('La première page de la chronique parle.');
  });

  it('l’intro, l’annonce et chaque récit fixe sont dans l’inventaire des voix', () => {
    const module = MODULES_COLLEGE.find((m) => m.FAMILLE.cle === 'escape-histoire-geo');
    module.CLASSES.forEach((c) => {
      expect(cles.has(repliquesEscape.intro('escape-histoire-geo', module, c).cle)).toBe(true);
      for (let g = 1; g <= 40; g += 1) {
        module.serie(g, c).forEach((m) => expect(cles.has(repliquesEscape.recit('escape-histoire-geo', m.recit).cle)).toBe(true));
      }
    });
    expect(cles.has(repliquesEscape.annonce('escape-histoire-geo', 5, true).cle)).toBe(true);
    expect(cles.has(repliquesEscape.annonce('escape-histoire-geo', 7, false).cle)).toBe(true);
  });
});
