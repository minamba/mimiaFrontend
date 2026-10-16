/**
 * LA SALLE À FOUILLER DES ESCAPE GAMES — Camara, le 09/10/2026. Chaque
 * histoire a ses six objets repérés sur son décor et sa porte ; on fouille un
 * objet après l'autre, l'inventaire se remplit, et la partie finit en passant
 * la porte.
 *
 * TROIS SALLES (11/10/2026) : chaque histoire se joue dans trois salles de
 * deux cadenas ; le passage d'une salle ne s'ouvre qu'une fois ses deux
 * cadenas ouverts, et la sortie est le passage de la troisième.
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

const dansLeDecor = (o) => {
  expect(o.x).toBeGreaterThanOrEqual(5);
  expect(o.x).toBeLessThanOrEqual(95);
  expect(o.y).toBeGreaterThanOrEqual(5);
  expect(o.y).toBeLessThanOrEqual(95);
  expect(o.nom.trim().length).toBeGreaterThan(2);
};

// Deux points ne se recouvrent pas : on doit pouvoir cliquer l'un sans l'autre.
const sansRecouvrement = (points) => points.forEach((a, i) => points.slice(i + 1).forEach((b) => {
  expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(6);
}));

describe('les repères des salles', () => {
  it('couvrent chaque histoire, et rien d’autre', () => {
    expect(Object.keys(REPERES_ESCAPE).sort()).toEqual([...HISTOIRES].sort());
  });

  it.each(HISTOIRES)('%s : six objets nommés et une porte, dans le décor', (id) => {
    const { objets, porte } = REPERES_ESCAPE[id];
    expect(objets).toHaveLength(6);
    [...objets, porte].forEach(dansLeDecor);
    sansRecouvrement(objets);
  });

  it.each(HISTOIRES)('%s : trois salles nommées, deux objets et un passage chacune, dans le décor', (id) => {
    const { salles } = REPERES_ESCAPE[id];
    expect(salles).toHaveLength(3);
    salles.forEach((salle) => {
      expect(salle.nom.trim().length).toBeGreaterThan(2);
      expect(salle.objets).toHaveLength(2);
      const points = [...salle.objets, salle.passage];
      points.forEach(dansLeDecor);
      // Ni les deux objets entre eux, ni un objet et le passage.
      sansRecouvrement(points);
    });
  });

  // UN PASSAGE NOMME LA SALLE OÙ IL MÈNE — Camara, le 11/10/2026 : « le balcon
  // et son escalier vers le quai » menait au bureau du chef de gare.
  it.each(HISTOIRES)('%s : chaque passage annonce la salle suivante', (id) => {
    const { salles } = REPERES_ESCAPE[id];
    const mots = (t) => t.toLowerCase().split(/[^a-zàâäçéèêëîïôöûüœ0-9]+/)
      .filter((m) => m.length >= 4 && !['salle', 'porte', 'grand', 'grande', 'petit', 'petite', 'avec', 'dans'].includes(m));
    [0, 1].forEach((i) => {
      const nom = salles[i].passage.nom.toLowerCase();
      expect(mots(salles[i + 1].nom).some((m) => nom.includes(m.slice(0, 6)))).toBe(true);
    });
  });

  // Le passage de la salle 1 reprenait l'ancienne porte de sortie : « l'entrée
  // de l'entrepôt » ouvrait sur une ruelle enneigée (Camara, 11/10/2026).
  it('Enquête à New York : on entre dans la ruelle par la fenêtre brisée du musée', () => {
    const [musee, ruelle] = REPERES_ESCAPE['escape-anglais|QUATRIEME'].salles;
    expect(musee.objets.map((o) => o.nom)).toEqual(['le cadre vide', 'la lampe torche du gardien']);
    expect(musee.passage.nom).toMatch(/fenêtre brisée/);
    expect(ruelle.nom).toBe('La ruelle enneigée');
  });
});

describe('les images des trois salles', () => {
  // eslint-disable-next-line global-require
  const { IMAGES_SECONDAIRE } = require('../lib/jeux/imagesSecondaire');

  // Une salle 1 à part remplace le fond quand celui-ci ne montre pas le début de l'histoire.
  // New York, puis les 12 salles 1 régénérées après la revue du 11/10/2026.
  const SALLE1_A_PART = [
    'escape-anglais|QUATRIEME', 'escape-anglais|TROISIEME', 'escape-anglais-lycee|PREMIERE',
    'escape-francais|CINQUIEME', 'escape-francais-lycee|PREMIERE',
    'escape-histoire-geo|CINQUIEME', 'escape-histoire-geo|QUATRIEME', 'escape-histoire-geo|TROISIEME',
    'escape-sciences|SIXIEME', 'escape-physique-chimie-lycee|PREMIERE', 'escape-physique-chimie-lycee|PREMIERE_TECHNO',
    'escape-physique-chimie-lycee|TERMINALE', 'escape-physique-chimie-lycee|TERMINALE_TECHNO',
  ];

  it.each(HISTOIRES)('%s : trois images distinctes, la première étant le fond ou sa salle 1 à part', (id) => {
    const { fond, salles } = IMAGES_SECONDAIRE[id] ?? {};
    expect(salles).toHaveLength(3);
    expect(new Set(salles).size).toBe(3);
    expect(salles[0] === fond).toBe(!SALLE1_A_PART.includes(id));
  });
});

describe('une partie dans les trois salles', () => {
  afterEach(() => jest.restoreAllMocks());

  it('mission, deux objets fouillés par salle dans l’ordre, un passage entre chaque, puis la sortie', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const module = MODULES_COLLEGE.find((m) => m.FAMILLE.cle === 'escape-histoire-geo');
    const serie = module.serie(2024, 'TROISIEME');
    const Jeu = ECRANS_COLLEGE['escape-histoire-geo'];
    render(<Jeu onQuitter={jest.fn()} matiereCode="HISTOIRE_GEO" niveau="TROISIEME" />);

    // Pendant la mission, on ne fouille rien.
    expect(screen.getByRole('button', { name: /^Fouiller / })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Commencer l’enquête' }));

    const { salles } = REPERES_ESCAPE['escape-histoire-geo|TROISIEME'];
    const objets = salles.flatMap((s) => s.objets);

    const dansLaSalle = (salle) => {
      expect(screen.getByText(`Salle ${salle + 1}/3`)).toBeInTheDocument();
      expect(screen.getByText(salles[salle].nom)).toBeInTheDocument();
      // Seuls les deux objets de la salle sont là, et un seul se fouille : celui du cadenas en cours.
      expect(screen.getAllByRole('button', { name: /^Fouiller |cadenas ouvert$|pas encore$/ })).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: /^Fouiller / })).toHaveLength(1);
    };
    const fouiller = async (i) => {
      await userEvent.click(screen.getByRole('button', { name: `Fouiller ${objets[i].nom}` }));
      const fiche = screen.getByRole('dialog');
      await userEvent.click(within(fiche).getByRole('button', { name: String(serie[i].bonne) }));
      expect(screen.getByLabelText(`Inventaire : ${i + 1} pièce${i ? 's' : ''} sur 6`)).toBeInTheDocument();
      await userEvent.click(within(fiche).getByRole('button', { name: 'Continuer' }));
      expect(screen.queryByRole('dialog')).toBeNull();
    };

    // Salles 1 et 2 : deux cadenas, puis le passage.
    for (let salle = 0; salle < 2; salle += 1) {
      const { passage } = salles[salle];
      dansLaSalle(salle);
      // Le passage reste fermé tant que les deux cadenas de la salle ne sont pas ouverts.
      expect(screen.getByRole('button', { name: `${passage.nom} : ouvre d'abord les deux cadenas de cette salle` })).toBeDisabled();
      await fouiller(salle * 2);
      dansLaSalle(salle);
      await fouiller(salle * 2 + 1);
      // Les deux cadenas ouverts : le passage s'éclaire, et rien d'autre ne se fouille ici.
      expect(screen.queryByRole('button', { name: /^Fouiller / })).toBeNull();
      const bouton = screen.getByRole('button', { name: `Passer par ${passage.nom} vers la salle suivante` });
      expect(bouton).toBeEnabled();
      await userEvent.click(bouton);
      // L'inventaire suit dans la salle suivante.
      expect(screen.getByLabelText(`Inventaire : ${salle * 2 + 2} pièces sur 6`)).toBeInTheDocument();
    }

    // Salle 3 : les deux derniers cadenas, puis la sortie.
    dansLaSalle(2);
    expect(screen.getByRole('button', { name: `${salles[2].passage.nom} : fermée par six cadenas` })).toBeDisabled();
    await fouiller(4);
    dansLaSalle(2);
    await fouiller(5);

    // Les six cadenas ouverts : la sortie de la salle 3 s'ouvre, et le mot du code apparaît.
    expect(screen.getByText(module.PAR_CLASSE.TROISIEME.fin)).toBeInTheDocument();
    const sorties = screen.getAllByRole('button', { name: `Sortir par ${salles[2].passage.nom}` });
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
