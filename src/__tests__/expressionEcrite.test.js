import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpressionEcriteDetail from '../components/ExpressionEcriteDetail';
import ExpressionsEcrites from '../components/ExpressionsEcrites';
import * as api from '../lib/api/elevesApi';
import { lireComparaison } from '../lib/storage/diffDictee';

/**
 * L'EXPRESSION ÉCRITE — Camara, le 18/09/2026 : « faut archiver comme les
 * autres ».
 *
 * LE TROISIÈME DE LA FAMILLE, et les trois se distinguent par ce qu'ils
 * gardent : la compréhension orale garde ce qu'il a ENTENDU, l'expression
 * orale ce qu'il a DIT, celle-ci ce qu'il a ÉCRIT. C'est la seule où son
 * orthographe se voit.
 *
 * CE QUE CES TESTS PROTÈGENT
 * -------------------------
 * 1. LA COPIE N'EST JAMAIS NETTOYÉE. C'est LE point de tout l'exercice : le
 *    texte s'affiche avec ses fautes, parce que c'est lui qui montrera le
 *    chemin parcouru dans six mois — et parce que la correction d'à côté
 *    parlerait sinon de fautes devenues invisibles.
 * 2. LES RÉUSSITES SONT SÉPARÉES DES REPRISES. La consigne impose au
 *    professeur de commencer par ce qui est réussi ; l'écran ne doit pas
 *    défaire ça en les noyant au milieu des fautes.
 * 3. LE GENRE EST ÉCRIT, PAS SEULEMENT COLORÉ — orthographe, grammaire,
 *    vocabulaire, construction : c'est la grille de l'examen, et c'est en la
 *    voyant revenir que l'enfant repère ce qui coince chez lui.
 * 4. NI LE TEXTE NI LA CORRECTION NE VOYAGENT DANS LA LISTE : trente textes
 *    feraient transiter trente rédactions pour afficher trente titres.
 * 5. UN TEXTE SANS CORRECTION LE DIT. Le filet de rattrapage en produit —
 *    il sauve la copie, pas les reprises — et une page à moitié vide sans
 *    explication laisserait l'enfant croire à une panne.
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

/** SA COPIE, AVEC SES FAUTES : « I go », « frend ». Elles doivent survivre. */
const COPIE = 'Last weekend I go to the park with my frend.\nWe play football.';

const CORRECTIONS = [
  { genre: 'reussi', texte: 'Tes deux phrases tiennent debout du début à la fin.' },
  { genre: 'grammaire', texte: 'Tu as écrit « I go ». Au passé, on dit « I went ».' },
  { genre: 'orthographe', texte: '« frend » s’écrit « friend », avec un i.' },
];

const LIGNE = {
  id: 31,
  titre: 'Raconter son week-end',
  langue: 'en',
  consigne: 'Écris cinq phrases sur ton week-end.',
  nombreMots: 14,
  nombreReprises: 2,
  profPrenom: 'Marine',
  profCouleur: '#149e93',
  dateCreation: '2026-09-18T14:30:00Z',
  dateConsultation: null,
  texte: '',
  corrections: [],
};

const DETAIL = {
  ...LIGNE,
  texte: COPIE,
  corrections: CORRECTIONS,
  remarque: 'Il ose des phrases longues.',
};

describe('Le texte et sa correction', () => {
  test('la copie s’affiche avec ses fautes, jamais corrigée', () => {
    render(<ExpressionEcriteDetail texte={DETAIL} />);

    // LE CŒUR DU SUJET. Si un jour quelqu'un « améliore » l'affichage en
    // appliquant la correction au texte, c'est ici que ça casse.
    expect(screen.getByText(/I go to the park with my frend/)).toBeInTheDocument();
    expect(screen.queryByText(/I went to the park with my friend/)).not.toBeInTheDocument();
  });

  test('la consigne est rappelée', () => {
    render(<ExpressionEcriteDetail texte={DETAIL} />);

    expect(screen.getByText('Écris cinq phrases sur ton week-end.')).toBeInTheDocument();
  });

  test('les réussites sont dans leur propre bloc, avant les reprises', () => {
    render(<ExpressionEcriteDetail texte={DETAIL} />);

    const reussi = screen.getByRole('region', { name: /réussi/i });

    expect(within(reussi).getByText(/tiennent debout/)).toBeInTheDocument();
    expect(within(reussi).queryByText(/I went/)).not.toBeInTheDocument();

    // L'ORDRE COMPTE : « ce qui est réussi » d'abord, « à retravailler »
    // ensuite. Un enfant qui reçoit dix corrections et aucun compliment
    // n'écrira plus.
    const titres = screen.getAllByRole('heading').map((t) => t.textContent);

    expect(titres[0]).toContain('réussi');
    expect(titres[1]).toContain('retravailler');
  });

  test('chaque reprise porte son genre en toutes lettres', () => {
    render(<ExpressionEcriteDetail texte={DETAIL} />);

    expect(screen.getByText(/Grammaire/)).toBeInTheDocument();
    expect(screen.getByText(/Orthographe/)).toBeInTheDocument();

    // « Réussi » n'est pas une étiquette de reprise : son bloc porte déjà son
    // titre, et le répéter sur chaque ligne l'alourdirait.
    expect(screen.queryByText(/^Réussi$/)).not.toBeInTheDocument();
  });

  test('un genre inconnu s’affiche quand même, sous son propre nom', () => {
    // La base ne devrait en contenir que cinq, mais une ligne écrite par une
    // version future ne doit pas disparaître de l'écran sans un mot.
    render(<ExpressionEcriteDetail texte={{
      ...DETAIL, corrections: [{ genre: 'ponctuation', texte: 'Il manque un point.' }],
    }}
    />);

    expect(screen.getByText(/ponctuation/)).toBeInTheDocument();
    expect(screen.getByText('Il manque un point.')).toBeInTheDocument();
  });

  test('un texte sans correction le dit', () => {
    render(<ExpressionEcriteDetail texte={{ ...DETAIL, corrections: [] }} />);

    expect(screen.getByText(/correction de ce texte n’a pas été enregistrée/))
      .toBeInTheDocument();
  });
});

describe('La liste des textes écrits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getExpressionsEcrites.mockResolvedValue({ data: [LIGNE] });
    api.getExpressionEcrite.mockResolvedValue({ data: DETAIL });
    api.marquerExpressionEcriteVue.mockResolvedValue({});
  });

  test('la liste ne porte ni le texte ni la correction', async () => {
    render(<ExpressionsEcrites />);

    expect(await screen.findByText('Raconter son week-end')).toBeInTheDocument();

    // Ce qui tient en une ligne voyage — la longueur, ce qui reste à revoir.
    expect(screen.getByText(/14 mots/)).toBeInTheDocument();
    expect(screen.getByText(/2 points à revoir/)).toBeInTheDocument();

    // La rédaction, non : elle est demandée à l'ouverture, et à ce
    // moment-là seulement.
    expect(screen.queryByText(/I go to the park/)).not.toBeInTheDocument();
    expect(api.getExpressionEcrite).not.toHaveBeenCalled();
  });

  test('ouvrir un texte va chercher sa copie, puis éteint la pastille', async () => {
    render(<ExpressionsEcrites />);

    await userEvent.click(await screen.findByText('Raconter son week-end'));

    expect(api.getExpressionEcrite).toHaveBeenCalledWith('1', 31);
    expect(await screen.findByText(/I go to the park with my frend/)).toBeInTheDocument();

    // APRÈS L'OUVERTURE, JAMAIS AVANT : une lecture qui échoue ne doit pas
    // faire disparaître le « à consulter » d'un texte que l'enfant n'a pas vu.
    expect(api.marquerExpressionEcriteVue).toHaveBeenCalledWith('1', 31);
  });

  test('une ouverture qui échoue laisse la pastille allumée', async () => {
    api.getExpressionEcrite.mockRejectedValue(new Error('coupure'));

    render(<ExpressionsEcrites />);

    await userEvent.click(await screen.findByText('Raconter son week-end'));

    expect(await screen.findByText(/n’a pas pu être ouvert/)).toBeInTheDocument();
    expect(api.marquerExpressionEcriteVue).not.toHaveBeenCalled();

    // La ligne reste marquée « pas encore ouverte » : c'est cette classe qui
    // porte la pastille.
    expect(screen.getByRole('button', { name: /Raconter son week-end/ }))
      .toHaveClass('expr-ligne--nouvelle');
  });

  test('sans texte, l’écran explique ce qui viendra ici', async () => {
    api.getExpressionsEcrites.mockResolvedValue({ data: [] });

    render(<ExpressionsEcrites />);

    expect(await screen.findByText(/Pas encore de texte ici/)).toBeInTheDocument();
  });
});

/**
 * LE TABLEAU DE LA CORRECTION NE DOIT PAS ÊTRE PRIS POUR UNE DICTÉE.
 *
 * La consigne impose au professeur un format — « La consigne », « Ton texte »,
 * « Ce qui est réussi », « À revoir », « À réécrire ». S'il employait « La
 * dictée » et « Ta copie », l'écran déclencherait la comparaison automatique de
 * la dictée : il chercherait les écarts entre un texte modèle et une copie, or
 * ici il n'y a PAS de texte modèle. Les badges se poseraient au hasard sur la
 * rédaction de l'enfant.
 */
describe('Le tableau d’une correction de texte écrit', () => {
  const TABLEAU = [
    'La consigne',
    'Écris cinq phrases sur ton week-end.',
    '',
    'Ton texte',
    'Last weekend I go to the park with my frend.',
    '',
    'Ce qui est réussi',
    'Ta phrase tient debout du début à la fin.',
    '',
    'À revoir',
    'Grammaire — I go → I went',
    'Orthographe — frend → friend',
    '',
    'À réécrire',
    'Last weekend I ___ to the park with my ___ .',
  ].join('\n');

  test('n’est jamais lu comme une comparaison de dictée', () => {
    expect(lireComparaison(TABLEAU)).toBeNull();
  });

  test('le tableau d’une vraie dictée, lui, l’est toujours', () => {
    // Le contre-exemple : sans lui, le test du dessus passerait même si
    // `lireComparaison` cessait de reconnaître quoi que ce soit.
    const dictee = [
      'La dictée', 'Les enfants sont partis.',
      'Ta copie', 'Les enfant son parti.',
    ].join('\n');

    expect(lireComparaison(dictee)).not.toBeNull();
  });
});

/**
 * UNE COPIE RESTÉE EN PHOTO — Camara, le 18/09/2026 : « comme ça on perdra
 * rien et le prof pourra quand même refaire la transcription si elle a pas été
 * faite. »
 *
 * CE QUI SE PASSAIT AVANT. Un texte écrit sur cahier n'existe que dans une
 * photo, et une photo appartient à la conversation : ses octets s'effacent au
 * bout de quelques jours. Si le professeur partait sans la recopier, le travail
 * de l'enfant disparaissait sans trace. Pas « à refaire » : perdu.
 *
 * LA LIGNE NAÎT DONC SANS TEXTE, avec sa photo. `transcrit: false` est le seul
 * mot de tout l'écran qui distingue « pas encore recopié » de « il n'a rien
 * écrit » — deux choses très différentes à dire à un enfant.
 */
describe('Un texte pas encore recopié', () => {
  const EN_ATTENTE = {
    ...LIGNE, texte: null, corrections: [], transcrit: false, aPhoto: true,
  };

  test('sa photo s’affiche à la place du texte', () => {
    render(<ExpressionEcriteDetail texte={EN_ATTENTE} photo="blob:sa-page" />);

    expect(screen.getByAltText(/page de cahier/i)).toHaveAttribute('src', 'blob:sa-page');
  });

  test('l’écran dit pourquoi il n’y a rien à lire', () => {
    render(<ExpressionEcriteDetail texte={EN_ATTENTE} photo="blob:sa-page" />);

    expect(screen.getByText(/pas encore eu le temps de recopier/)).toBeInTheDocument();

    // UNE SEULE EXPLICATION, PAS DEUX. Le message « la correction n'a pas été
    // enregistrée » dirait la même chose en moins bien, et deux phrases pour un
    // seul fait donneraient l'impression que deux choses ont échoué.
    expect(screen.queryByText(/correction de ce texte n’a pas été enregistrée/))
      .not.toBeInTheDocument();
  });

  test('une photo déjà purgée le dit aussi, sans casser l’écran', () => {
    render(<ExpressionEcriteDetail texte={EN_ATTENTE} photo={null} />);

    expect(screen.getByText(/n’est plus disponible/)).toBeInTheDocument();
    expect(screen.getByText(/pas encore eu le temps de recopier/)).toBeInTheDocument();
  });

  test('la liste annonce « à recopier » plutôt que « 0 mots »', async () => {
    // « 0 mots » laisserait croire que l'enfant n'a rien écrit, alors que sa
    // page est là.
    api.getExpressionsEcrites.mockResolvedValue({
      data: [{ ...EN_ATTENTE, nombreMots: 0, nombreReprises: 0 }],
    });

    render(<ExpressionsEcrites />);

    expect(await screen.findByText(/À recopier par ton professeur/)).toBeInTheDocument();
    expect(screen.queryByText(/0 mots/)).not.toBeInTheDocument();
  });

  test('ouvrir un texte déjà recopié ne télécharge aucune photo', async () => {
    api.getExpressionsEcrites.mockResolvedValue({ data: [LIGNE] });
    api.getExpressionEcrite.mockResolvedValue({
      data: { ...DETAIL, transcrit: true, aPhoto: false },
    });

    render(<ExpressionsEcrites />);
    await userEvent.click(await screen.findByText('Raconter son week-end'));

    // La page de cahier pèse des mégaoctets : elle ne part que quand elle sert.
    expect(api.chargerPhotoExpressionEcrite).not.toHaveBeenCalled();
  });
});
