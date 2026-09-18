import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpressionOraleDetail from '../components/ExpressionOraleDetail';
import ExpressionsOrales from '../components/ExpressionsOrales';
import * as api from '../lib/api/elevesApi';

/**
 * L'EXPRESSION ORALE — Camara, le 18/09/2026.
 *
 * « L'élève et le prof qui parlent dans la langue de la matière pour voir
 * comment l'élève s'exprime », archivé « comme dans une messagerie classique…
 * rangé par jour et par discussion… avec le nom du prof et de l'élève en badge
 * pour comprendre qui a dit quoi ».
 *
 * CE QUE CES TESTS PROTÈGENT
 * -------------------------
 * 1. ON NE LA CONFOND PAS AVEC LA COMPRÉHENSION ORALE. Camara a dû me le
 *    préciser deux fois pendant la construction, tant les deux mots se
 *    ressemblent : là-bas l'élève ÉCOUTE et explique en français, ici il PARLE
 *    dans la langue. Deux écrans, deux routes, deux tables.
 * 2. L'ÉCHANGE NE VOYAGE PAS DANS LA LISTE. Trente conversations feraient
 *    transiter trente discussions entières pour afficher trente titres — il
 *    est demandé à l'ouverture, et à ce moment-là seulement.
 * 3. LA PASTILLE S'ÉTEINT APRÈS L'OUVERTURE, jamais avant : une lecture qui
 *    échoue ne doit pas faire disparaître le « à consulter » d'une
 *    conversation que l'enfant n'a pas vue.
 */

jest.mock('../lib/api/elevesApi');

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '1', matiereId: '7' }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => () => {},
  useSelector: (selecteur) => selecteur({
    referentiel: {
      matieres: [{
        id: 7, libelle: 'Anglais', profPrenom: 'Marine', profCouleur: '#149e93', profAvatar: 'marine',
      }],
    },
    eleves: { liste: [{ id: 1, prenom: 'Bilal' }] },
  }),
}));

jest.mock('../lib/actions/referentielActions', () => ({ chargerReferentiel: () => ({ type: 't' }) }));
jest.mock('../lib/actions/elevesActions', () => ({ chargerEleves: () => ({ type: 't' }) }));

const ECHANGE = [
  { qui: 'eleve', texte: 'Hello, I would like a pizza please.' },
  { qui: 'professeur', texte: 'Of course! Which one would you like?' },
  { qui: 'professeur', texte: 'We have four today.' },
  { qui: 'eleve', texte: 'The one with mushrooms.' },
];

const LIGNE = {
  id: 12,
  titre: 'Commander au restaurant',
  langue: 'en',
  nombreTours: 4,
  profPrenom: 'Marine',
  profCouleur: '#149e93',
  dateCreation: '2026-09-18T14:30:00Z',
  dateConsultation: null,
  echange: [],
};

const DETAIL = { ...LIGNE, echange: ECHANGE, remarque: 'Il ose des phrases complètes.' };

beforeEach(() => {
  jest.clearAllMocks();
  api.getExpressionsOrales.mockResolvedValue({ data: [LIGNE] });
  api.getExpressionOrale.mockResolvedValue({ data: DETAIL });
  api.marquerExpressionOraleVue.mockResolvedValue({});
});

describe('La conversation, relue comme une messagerie', () => {
  const afficher = (props = {}) => render(
    <ExpressionOraleDetail conversation={DETAIL} prenomEleve="Bilal" {...props} />,
  );

  test('tous les tours sont là, dans l’ordre', () => {
    afficher();

    ECHANGE.forEach((t) => expect(screen.getByText(t.texte)).toBeInTheDocument());
  });

  test('chaque côté porte son nom en badge', () => {
    afficher();

    // getAllByText : Bilal reprend la parole après Marine, il a donc DEUX
    // pastilles — une par prise de parole. C'est exactement ce que vérifie le
    // test suivant.
    expect(screen.getAllByText('Bilal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marine').length).toBeGreaterThan(0);
  });

  /**
   * LE NOM NE SE RÉPÈTE PAS SUR CHAQUE BULLE. Trois bulles d'affilée du même
   * professeur portant trois fois son prénom, c'est ce qui fait qu'on ne le lit
   * plus. Ici « Marine » parle deux fois de suite : une seule pastille.
   */
  test('le nom n’apparaît qu’au changement d’interlocuteur', () => {
    afficher();

    expect(screen.getAllByText('Marine')).toHaveLength(1);
    expect(screen.getAllByText('Bilal')).toHaveLength(2);
  });

  test('le retour du professeur est hors du fil', () => {
    afficher();

    expect(screen.getByText(/ose des phrases complètes/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ce que marine en retient/i }))
      .toBeInTheDocument();
  });

  test('un échange illisible ne fait pas tomber l’écran', () => {
    afficher({ conversation: { ...DETAIL, echange: [], remarque: null } });

    expect(screen.getByText(/n’a pas pu être relue/)).toBeInTheDocument();
  });
});

describe('La liste des conversations', () => {
  test('rangée par jour, avec le titre et le nombre de messages', async () => {
    render(<ExpressionsOrales />);

    expect(await screen.findByText('Commander au restaurant')).toBeInTheDocument();
    expect(screen.getByText(/4 messages/)).toBeInTheDocument();
  });

  test('l’échange n’est PAS chargé avec la liste', async () => {
    render(<ExpressionsOrales />);
    await screen.findByText('Commander au restaurant');

    expect(api.getExpressionOrale).not.toHaveBeenCalled();
  });

  test('cliquer ouvre la conversation et éteint la pastille', async () => {
    render(<ExpressionsOrales />);

    await userEvent.click(await screen.findByRole('button', { name: /commander au restaurant/i }));

    const fenetre = await screen.findByRole('dialog');

    expect(within(fenetre).getByText('Of course! Which one would you like?')).toBeInTheDocument();
    expect(api.marquerExpressionOraleVue).toHaveBeenCalledWith('1', 12);
  });

  test('une conversation déjà vue n’est pas remarquée une seconde fois', async () => {
    api.getExpressionsOrales.mockResolvedValue({
      data: [{ ...LIGNE, dateConsultation: '2026-09-18T15:00:00Z' }],
    });

    render(<ExpressionsOrales />);
    await userEvent.click(await screen.findByRole('button', { name: /commander au restaurant/i }));
    await screen.findByRole('dialog');

    expect(api.marquerExpressionOraleVue).not.toHaveBeenCalled();
  });

  test('sans conversation, l’écran explique au lieu de rester vide', async () => {
    api.getExpressionsOrales.mockResolvedValue({ data: [] });

    render(<ExpressionsOrales />);

    expect(await screen.findByText(/pas encore de conversation/i)).toBeInTheDocument();
    expect(screen.getByText(/il dira toujours oui/i)).toBeInTheDocument();
  });
});
