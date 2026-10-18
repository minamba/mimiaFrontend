/**
 * MES FICHES DE RÉVISION — les trois pages du module (Camara, le 14/10/2026).
 *
 * CE QUI SE TESTE ICI
 * -------------------
 * 1. L'espace range les cours PAR MATIÈRE, la matière du cours le plus récent
 *    d'abord — c'est la demande de Camara.
 * 2. La création ne propose que les types de la classe (pas de fiche méthode
 *    au CP), ne laisse rien importer avant d'avoir choisi matière et type, et
 *    ne crée le brouillon qu'à la première page.
 * 3. Le cours lu propose ses notions TOUTES COCHÉES ; l'enfant décoche, et
 *    seules les notions gardées sont demandées.
 * 4. Une fois prêtes, les fiches se lisent une à une, avec des flèches.
 * 5. LE QUOTA EN COURS IMPORTÉS (16/10/2026) : vingt par mois — un cours
 *    découpé en sept fiches compte pour un —, puis les crédits de la
 *    famille. On n'achète PAS ici (16/10/2026) : le parent est envoyé vers
 *    « Mon forfait », l'enfant est invité à le demander à ses parents, et
 *    plus aucun bouton « Créer » quand il ne reste rien. Toutes les notions
 *    se cochent (elles ne font qu'un cours), et le cours fini n'est pas
 *    gardé.
 */
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import MesFiches, { grouperParMatiere } from '../components/mesFiches/MesFiches';
import NouveauCours from '../components/mesFiches/NouveauCours';
import CoursFiches from '../components/mesFiches/CoursFiches';
import * as api from '../lib/api/mesFichesApi';
import { getMatieresEleve } from '../lib/api/elevesApi';

jest.mock('../lib/api/mesFichesApi');

let mockParams = {};
// La page de création lit `?complement=` (16/10/2026).
let mockRecherche = new URLSearchParams();
const mockNaviguer = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => mockParams,
  useNavigate: () => mockNaviguer,
  useSearchParams: () => [mockRecherche],
}));
jest.mock('../lib/api/elevesApi', () => ({ getMatieresEleve: jest.fn() }));
// LE FORFAIT DE LA FAMILLE (16/10/2026) : ouvert par défaut ; un test le ferme.
let mockAcces = { ouvert: true, motif: null };
jest.mock('../lib/hooks/useAccesForfait', () => ({
  __esModule: true,
  ...jest.requireActual('../lib/hooks/useAccesForfait'),
  default: () => mockAcces,
}));


let mockNiveau = 'CP';
jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({ eleves: { liste: [{ id: 7, prenom: 'Lina', niveauCode: mockNiveau }] } }),
  useDispatch: () => jest.fn(),
}));
let mockEnfant = null;
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => mockEnfant }));
jest.mock('../components/PieceJointe', () => ({
  TYPES_ACCEPTES: 'image/png,application/pdf',
  reduire: (f) => Promise.resolve(f),
}));
jest.mock('../components/ScanMobileModale', () => () => null);

const ouvrir = (params, element) => {
  mockParams = params;
  return render(element);
};

const PACKS = [
  { code: 'FICHES10', libelle: '10 fiches de révision', fiches: 10, prixCentimes: 599 },
  { code: 'FICHES20', libelle: '20 fiches de révision', fiches: 20, prixCentimes: 999 },
];

const quota = (utilisees, credits = 0) => ({
  utilisees,
  maximum: 20,
  restantes: Math.max(0, 20 - utilisees),
  credits,
  disponibles: Math.max(0, 20 - utilisees) + credits,
  remiseLe: '2026-11-01T00:00:00Z',
  packs: PACKS,
});

const enSessionEnfant = () => { mockEnfant = { eleveId: 7, prenom: 'Lina', niveauCode: mockNiveau }; };

beforeEach(() => {
  jest.clearAllMocks();
  mockNiveau = 'CP';
  mockEnfant = null;
  mockAcces = { ouvert: true, motif: null };
  api.getQuota.mockResolvedValue({ data: quota(0) });
  getMatieresEleve.mockResolvedValue({
    data: [
      { id: 1, code: 'MATHS', libelle: 'Mathématiques', active: true },
      { id: 2, code: 'FRANCAIS', libelle: 'Français', active: true },
      { id: 3, code: 'ORIENTATION', libelle: 'Orientation', active: true },
      { id: 4, code: 'ANGLAIS', libelle: 'Anglais', active: false },
    ],
  });
});

describe('l’espace : par matière, du plus récent au plus ancien', () => {
  it('la matière du cours le plus récent passe en premier', () => {
    // Le serveur rend les cours du plus récent au plus ancien.
    const groupes = grouperParMatiere([
      { id: 9, matiereId: 2, matiereLibelle: 'Français' },
      { id: 8, matiereId: 1, matiereLibelle: 'Mathématiques' },
      { id: 5, matiereId: 2, matiereLibelle: 'Français' },
    ]);

    expect(groupes.map((g) => g.libelle)).toEqual(['Français', 'Mathématiques']);
    expect(groupes[0].cours.map((c) => c.id)).toEqual([9, 5]);
  });

  it('affiche chaque cours avec ses types de fiches', async () => {
    api.getMesFiches.mockResolvedValue({
      data: {
        actif: true,
        cours: [{
          id: 9, matiereId: 1, matiereLibelle: 'Mathématiques', titre: 'Le théorème de Thalès', etat: 'pret',
          dateCreation: '2026-10-14T10:00:00Z',
          fiches: [{ id: 1, type: 'visuelle' }, { id: 2, type: 'visuelle' }, { id: 3, type: 'express' }],
        }],
      },
    });

    ouvrir({ eleveId: '7' }, <MesFiches />);

    expect(await screen.findByText('Le théorème de Thalès')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mathématiques/ })).toBeInTheDocument();
    expect(screen.getByText('Fiche visuelle · 2')).toBeInTheDocument();
    expect(screen.getByText('Fiche express')).toBeInTheDocument();
  });

  it('sans aucune fiche, un seul bouton pour créer : celui de l’encadré', async () => {
    api.getMesFiches.mockResolvedValue({ data: { actif: true, cours: [] } });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    expect(await screen.findByRole('link', { name: 'Créer ma première fiche' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '+ Créer une fiche' })).not.toBeInTheDocument();
  });

  it('la jauge du mois compte des cours, et les crédits de la famille', async () => {
    enSessionEnfant();
    api.getMesFiches.mockResolvedValue({ data: { actif: true, cours: [], quota: quota(4, 10) } });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    // Une seule barre de 20 + 10 crédits : seul le vert avance tant que le mois n'est pas plein.
    const jauge = await screen.findByRole('progressbar', { name: 'Cours importés ce mois-ci' });
    expect(jauge).toHaveAttribute('aria-valuenow', '4');
    expect(jauge).toHaveAttribute('aria-valuemax', '30');
    expect(screen.getByText(/Tu peux encore importer 16 cours ce mois-ci\. Un cours compte pour un/)).toBeInTheDocument();
    expect(screen.getByText(/Ta famille a aussi 10 crédits/)).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    expect(jauge.querySelector('.mf-quota__credits')).toBeNull();
  });

  it('le mois plein, le doré avance collé au vert avec les crédits pris', async () => {
    enSessionEnfant();
    api.getMesFiches.mockResolvedValue({ data: { actif: true, cours: [], quota: { ...quota(20, 7), creditsPris: 3 } } });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    const jauge = await screen.findByRole('progressbar', { name: 'Cours importés ce mois-ci' });
    expect(jauge).toHaveAttribute('aria-valuemax', '30');
    expect(jauge).toHaveAttribute('aria-valuenow', '23');
    expect(jauge).toHaveAttribute('aria-valuetext', '20 sur 20, et 3 crédits pris sur 10');
    // eslint-disable-next-line testing-library/no-node-access
    expect(jauge.querySelector('.mf-quota__plein').style.width).toMatch(/^66\.6/);
    // eslint-disable-next-line testing-library/no-node-access
    expect(jauge.querySelector('.mf-quota__credits').style.width).toBe('10%');
  });

  it('plus rien : l’enfant est invité à demander à ses parents, et aucun bouton pour créer', async () => {
    enSessionEnfant();
    api.getMesFiches.mockResolvedValue({ data: { actif: true, cours: [], quota: quota(20) } });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    expect(await screen.findByText(/Demande à tes parents d’acheter des crédits/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Créer/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mon forfait/ })).not.toBeInTheDocument();
  });

  it('plus rien, avec des cours : pas non plus de « + Créer une fiche »', async () => {
    enSessionEnfant();
    api.getMesFiches.mockResolvedValue({
      data: {
        actif: true,
        quota: quota(20),
        cours: [{ id: 1, matiereId: 1, matiereLibelle: 'Mathématiques', matiereCode: 'MATHS', titre: 'Thalès', etat: 'pret', dateCreation: '2026-10-14T10:00:00Z', fiches: [] }],
      },
    });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    expect(await screen.findByText('Thalès')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Créer/ })).not.toBeInTheDocument();
  });

  describe('supprimer un cours depuis sa carte', () => {
    const thales = {
      id: 1, matiereId: 1, matiereLibelle: 'Mathématiques', matiereCode: 'MATHS', titre: 'Thalès', etat: 'pret',
      dateCreation: '2026-10-14T10:00:00Z',
      fiches: [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id, type: 'visuelle', dateCreation: '2026-10-14T10:01:00Z' })),
    };
    let confirmer;

    beforeEach(() => {
      api.getMesFiches.mockResolvedValue({ data: { actif: true, quota: quota(1), cours: [thales] } });
      confirmer = jest.spyOn(window, 'confirm');
    });

    afterEach(() => confirmer.mockRestore());

    it('le cours et ses 7 fiches partent d’un coup, après confirmation', async () => {
      confirmer.mockReturnValue(true);
      api.supprimerCours.mockResolvedValue({});
      ouvrir({ eleveId: '7' }, <MesFiches />);

      fireEvent.click(await screen.findByRole('button', { name: 'Supprimer le cours « Thalès » et ses fiches' }));

      expect(confirmer).toHaveBeenCalledWith(expect.stringContaining('Supprimer « Thalès » et ses 7 fiches ?'));
      expect(confirmer).toHaveBeenCalledWith(expect.stringContaining('Il restera compté dans tes cours du mois.'));
      await waitFor(() => expect(api.supprimerCours).toHaveBeenCalledWith('7', 1));
      await waitFor(() => expect(screen.queryByText('Thalès')).not.toBeInTheDocument());
    });

    it('annulé, rien ne part', async () => {
      confirmer.mockReturnValue(false);
      ouvrir({ eleveId: '7' }, <MesFiches />);

      fireEvent.click(await screen.findByRole('button', { name: /Supprimer le cours « Thalès »/ }));

      expect(api.supprimerCours).not.toHaveBeenCalled();
      expect(screen.getByText('Thalès')).toBeInTheDocument();
    });

    it('le bouton n’ouvre pas le cours : il est hors du lien', async () => {
      ouvrir({ eleveId: '7' }, <MesFiches />);

      const bouton = await screen.findByRole('button', { name: /Supprimer le cours « Thalès »/ });
      const carte = screen.getAllByRole('link', { name: /Thalès/ }).find((l) => !/Compléter/.test(l.getAttribute('aria-label') ?? ''));
      expect(carte).not.toContainElement(bouton);
    });

    it('un cours prêt se complète depuis sa carte', async () => {
      ouvrir({ eleveId: '7' }, <MesFiches />);

      const completer = await screen.findByRole('link', { name: 'Compléter le cours « Thalès »' });
      expect(completer).toHaveAttribute('href', expect.stringMatching(/\/eleves\/7\/mes-fiches\/nouvelle\?complement=\d+$/));
    });
  });

  it('sans vrai forfait, la page dit pourquoi et ne propose rien d’autre', async () => {
    enSessionEnfant();
    api.getMesFiches.mockResolvedValue({ data: { actif: true, forfait: false, cours: [], quota: quota(0) } });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    expect(await screen.findByText('Les fiches de révision sont réservées aux familles abonnées.')).toBeInTheDocument();
    expect(screen.getByText(/Demande à tes parents d’en choisir un/)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Créer/ })).not.toBeInTheDocument();
  });

  it('le parent n’achète pas ici : il est envoyé vers Mon forfait', async () => {
    api.getMesFiches.mockResolvedValue({ data: { actif: true, cours: [], quota: quota(20) } });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    expect(await screen.findByText(/Ses 20 cours du mois sont utilisés et la famille n’a plus de crédit/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mon forfait/ })).toHaveAttribute('href', '/profil?onglet=forfait');
    expect(screen.queryByRole('button', { name: /Payer/ })).not.toBeInTheDocument();
  });

  it('éteint, n’offre pas de créer', async () => {
    api.getMesFiches.mockResolvedValue({ data: { actif: false, cours: [] } });
    ouvrir({ eleveId: '7' }, <MesFiches />);

    expect(await screen.findByText(/pas encore ouvertes/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Créer/ })).not.toBeInTheDocument();
  });
});

describe('la création', () => {
  const ouvrirCreation = () => ouvrir({ eleveId: '7' }, <NouveauCours />);

  it('ses matières ouvertes seulement, sans la conseillère', async () => {
    ouvrirCreation();

    expect(await screen.findByRole('radio', { name: 'Mathématiques' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Orientation' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Anglais' })).not.toBeInTheDocument();
  });

  it('guide pas à pas : le type s’ouvre après la matière, le cours après le type', async () => {
    ouvrirCreation();
    await screen.findByRole('radio', { name: 'Mathématiques' });

    // Au départ, seule la matière se choisit ; la raison des autres est écrite.
    expect(screen.getByText('Touche la matière de ton cours.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Fiche visuelle/ })).toBeDisabled();
    expect(screen.getByText('Choisis d’abord ta matière.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Mathématiques' }));
    expect(screen.getByRole('radio', { name: /Fiche visuelle/ })).toBeEnabled();
    expect(screen.getByText('Choisis d’abord ton type de fiche.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Fiche visuelle/ }));
    expect(screen.getByRole('radio', { name: /Fiche visuelle/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText(/Choisis d’abord/)).not.toBeInTheDocument();
  });

  it('montre à quoi ressemble chaque type, en grand, et laisse le choisir de là', async () => {
    ouvrirCreation();
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));

    fireEvent.click(screen.getByRole('button', { name: 'Voir un exemple de Fiche visuelle' }));

    const fenetre = screen.getByRole('dialog', { name: /Exemple : Fiche visuelle/ });
    // La matière choisie est les maths : l'exemple est celui de Thalès.
    expect(within(fenetre).getByText(/cours de mathématiques/)).toBeInTheDocument();

    fireEvent.click(within(fenetre).getByRole('button', { name: 'Choisir cette fiche' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Fiche visuelle/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('l’aperçu se regarde même avant d’avoir choisi sa matière, sans pouvoir choisir', async () => {
    ouvrirCreation();
    await screen.findByRole('radio', { name: 'Mathématiques' });

    fireEvent.click(screen.getByRole('button', { name: 'Voir un exemple de Fiche express' }));
    const fenetre = screen.getByRole('dialog', { name: /Exemple : Fiche express/ });

    expect(within(fenetre).queryByRole('button', { name: 'Choisir cette fiche' })).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('au CP, ni fiche méthode ni fiche de contrôle', async () => {
    ouvrirCreation();
    await screen.findByRole('radio', { name: 'Mathématiques' });

    expect(screen.getByRole('radio', { name: /Fiche classique/ })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /Fiche méthode/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /spéciale contrôle/ })).not.toBeInTheDocument();
  });

  it('en 3e, les six', async () => {
    mockNiveau = 'TROISIEME';
    ouvrirCreation();
    await screen.findByRole('radio', { name: 'Mathématiques' });

    expect(screen.getByRole('radio', { name: /Fiche méthode/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /spéciale contrôle/ })).toBeInTheDocument();
  });

  it('prévient qu’un cours de plus de 10 pages comptera pour 2', async () => {
    api.creerCours.mockResolvedValue({ data: { id: 42 } });
    api.ajouterPage.mockResolvedValue({ data: { id: 5, nomFichier: 'chapitre.pdf', nombrePages: 14 } });

    ouvrirCreation();
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));
    fireEvent.click(screen.getByRole('radio', { name: /Fiche visuelle/ }));

    const fichier = new File(['x'], 'chapitre.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText(/Importer mon cours/), { target: { files: [fichier] } });

    expect(await screen.findByText(/Ton cours fait 14 pages : il comptera pour 2 cours/)).toBeInTheDocument();
  });

  it('crée le brouillon à la première page, puis envoie le cours', async () => {
    api.creerCours.mockResolvedValue({ data: { id: 42 } });
    api.ajouterPage.mockResolvedValue({ data: { id: 5, nomFichier: 'page1.png', nombrePages: 1 } });
    api.envoyerCours.mockResolvedValue({});

    ouvrirCreation();
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));

    // Sans type, l'envoi d'un cours n'est pas encore possible.
    expect(screen.getByRole('button', { name: 'Créer ma fiche' })).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: /Fiche visuelle/ }));

    const fichier = new File(['x'], 'page1.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText(/Importer mon cours/), { target: { files: [fichier] } });

    expect(await screen.findByText('page1.png')).toBeInTheDocument();
    expect(api.creerCours).toHaveBeenCalledWith('7', 1, 'visuelle', null);
    expect(api.ajouterPage).toHaveBeenCalledWith('7', 42, fichier);

    fireEvent.click(screen.getByRole('button', { name: 'Créer ma fiche' }));
    await waitFor(() => expect(api.envoyerCours).toHaveBeenCalledWith('7', 42));
    await waitFor(() => expect(mockNaviguer).toHaveBeenCalledWith('/eleves/7/mes-fiches/cours/42'));
  });

  it('le type et la matière se changent après l’import, les pages restent', async () => {
    api.creerCours.mockResolvedValue({ data: { id: 42 } });
    api.ajouterPage.mockResolvedValue({ data: { id: 5, nomFichier: 'page1.png', nombrePages: 1 } });
    api.modifierCours.mockResolvedValue({});

    ouvrirCreation();
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));
    fireEvent.click(screen.getByRole('radio', { name: /Fiche visuelle/ }));
    fireEvent.change(screen.getByLabelText(/Importer mon cours/), {
      target: { files: [new File(['x'], 'page1.png', { type: 'image/png' })] },
    });
    expect(await screen.findByText('page1.png')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Fiche classique/ }));
    await waitFor(() => expect(api.modifierCours).toHaveBeenCalledWith('7', 42, 1, 'classique'));
    await waitFor(() => expect(screen.getByRole('radio', { name: /Fiche classique/ })).toHaveAttribute('aria-checked', 'true'));

    fireEvent.click(screen.getByRole('radio', { name: 'Français' }));
    await waitFor(() => expect(api.modifierCours).toHaveBeenCalledWith('7', 42, 2, 'classique'));
    expect(screen.getByText('page1.png')).toBeInTheDocument();
  });

  describe('annuler', () => {
    let confirmer;
    beforeEach(() => { confirmer = jest.spyOn(window, 'confirm'); });
    afterEach(() => confirmer.mockRestore());

    it('sans page, ramène tout de suite aux fiches', async () => {
      ouvrirCreation();
      fireEvent.click(await screen.findByRole('button', { name: 'Annuler' }));

      expect(confirmer).not.toHaveBeenCalled();
      await waitFor(() => expect(mockNaviguer).toHaveBeenCalledWith('/eleves/7/mes-fiches'));
    });

    it('avec des pages, demande, efface le brouillon et ramène aux fiches', async () => {
      confirmer.mockReturnValue(true);
      api.creerCours.mockResolvedValue({ data: { id: 42 } });
      api.ajouterPage.mockResolvedValue({ data: { id: 5, nomFichier: 'page1.png', nombrePages: 1 } });
      api.supprimerCours.mockResolvedValue({});

      ouvrirCreation();
      fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));
      fireEvent.click(screen.getByRole('radio', { name: /Fiche visuelle/ }));
      fireEvent.change(screen.getByLabelText(/Importer mon cours/), {
        target: { files: [new File(['x'], 'page1.png', { type: 'image/png' })] },
      });
      expect(await screen.findByText('page1.png')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

      expect(confirmer).toHaveBeenCalledWith(expect.stringContaining('Abandonner ce cours'));
      await waitFor(() => expect(api.supprimerCours).toHaveBeenCalledWith('7', 42));
      await waitFor(() => expect(mockNaviguer).toHaveBeenCalledWith('/eleves/7/mes-fiches'));
    });
  });

  it('sans vrai forfait, la page de création n’offre aucune étape', async () => {
    mockAcces = { ouvert: false, motif: 'essai' };
    ouvrirCreation();

    expect(await screen.findByText('Les fiches de révision sont réservées aux familles abonnées.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voir les formules' })).toHaveAttribute('href', '/tarifs');
    expect(screen.queryByRole('radio', { name: 'Mathématiques' })).not.toBeInTheDocument();
  });

  it('sans fiche du mois ni réserve, la page de création n’offre aucune étape', async () => {
    enSessionEnfant();
    api.getQuota.mockResolvedValue({ data: quota(20) });
    ouvrirCreation();

    expect(await screen.findByText(/Tu as utilisé tes 20 cours de ce mois-ci/)).toBeInTheDocument();
    expect(screen.getByText(/tes cours reviennent le 1 novembre/)).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Mathématiques' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Créer ma fiche' })).not.toBeInTheDocument();
  });

  it('le mois épuisé mais la réserve pleine, on importe encore', async () => {
    enSessionEnfant();
    api.getQuota.mockResolvedValue({ data: quota(20, 5) });
    ouvrirCreation();

    expect(await screen.findByText(/Ta famille a encore 5 crédits/)).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));
    fireEvent.click(screen.getByRole('radio', { name: /Fiche classique/ }));

    expect(screen.getByLabelText(/Importer mon cours/)).toBeEnabled();
  });

  it('dit pourquoi une page est refusée', async () => {
    api.creerCours.mockResolvedValue({ data: { id: 42 } });
    api.ajouterPage.mockRejectedValue({ response: { data: { message: 'Ce PDF fait 30 pages, c’est trop pour un cours.' } } });

    ouvrirCreation();
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));
    fireEvent.click(screen.getByRole('radio', { name: /Fiche classique/ }));
    fireEvent.change(screen.getByLabelText(/Importer mon cours/), {
      target: { files: [new File(['x'], 'manuel.pdf', { type: 'application/pdf' })] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/30 pages/);
  });
});

describe('un cours', () => {
  const ouvrirCours = () => ouvrir({ eleveId: '7', coursId: '42' }, <CoursFiches />);

  const coursLu = {
    id: 42, matiereLibelle: 'Mathématiques', matiereCode: 'MATHS', titre: 'Le théorème de Thalès',
    etat: 'notions', type: 'visuelle', pagesDisponibles: true, dateCreation: '2026-10-14T10:00:00Z',
    notions: [
      { titre: 'La configuration', resume: 'Deux sécantes, deux parallèles.' },
      { titre: 'Le théorème', resume: 'Calculer une longueur.' },
      { titre: 'La réciproque', resume: 'Prouver le parallélisme.' },
    ],
    notionsDemandees: [], fiches: [],
  };

  it('pendant la lecture, le dit', async () => {
    api.getCours.mockResolvedValue({ data: { ...coursLu, etat: 'a_lire', notions: [] } });
    ouvrirCours();

    expect(await screen.findByText('Je lis ton cours…')).toBeInTheDocument();
  });

  it('toutes les notions sont cochées ; seules celles gardées sont demandées', async () => {
    api.getCours.mockResolvedValue({ data: coursLu });
    api.demanderFiches.mockResolvedValue({});
    ouvrirCours();

    expect(await screen.findByText('Ton cours contient 3 notions')).toBeInTheDocument();
    const cases = screen.getAllByRole('checkbox');
    expect(cases.every((c) => c.checked)).toBe(true);

    fireEvent.click(screen.getByRole('checkbox', { name: /La réciproque/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Créer mes 2 fiches' }));

    await waitFor(() => expect(api.demanderFiches).toHaveBeenCalledWith('7', '42', 'visuelle', [1, 2]));
  });

  it('toutes les notions se cochent, même avec un seul cours restant : elles ne font qu’un cours', async () => {
    api.getCours.mockResolvedValue({ data: coursLu });
    api.getQuota.mockResolvedValue({ data: quota(19) });
    api.demanderFiches.mockResolvedValue({});
    ouvrirCours();

    expect(await screen.findByText(/ne comptent que pour un seul cours/)).toBeInTheDocument();
    const cases = screen.getAllByRole('checkbox');
    expect(cases.every((c) => c.checked && !c.disabled)).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Créer mes 3 fiches' }));
    await waitFor(() => expect(api.demanderFiches).toHaveBeenCalledWith('7', '42', 'visuelle', [1, 2, 3]));
  });

  it('cours fini et plus rien : pas de bouton pour importer, le message à la place', async () => {
    enSessionEnfant();
    api.getCours.mockResolvedValue({ data: { ...coursLu, etat: 'pret', pagesDisponibles: false } });
    api.getQuota.mockResolvedValue({ data: quota(20) });
    ouvrirCours();

    expect(await screen.findByText(/Demande à tes parents d’acheter des crédits/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Importer un autre cours' })).not.toBeInTheDocument();
  });

  it('un cours prêt se complète : les fiches des nouvelles pages s’ajoutent à la suite', async () => {
    api.getCours.mockResolvedValue({ data: { ...coursLu, id: 42, etat: 'pret', pagesDisponibles: false } });
    ouvrirCours();

    expect(await screen.findByRole('heading', { name: 'Tu as la suite de ce cours ?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compléter ce cours' })).toHaveAttribute('href', '/eleves/7/mes-fiches/nouvelle?complement=42');
    expect(screen.queryByRole('link', { name: 'Importer un autre cours' })).not.toBeInTheDocument();
  });

  it('pendant la préparation du complément, le cours le dit et ne propose pas d’en recommencer un', async () => {
    api.getCours.mockResolvedValue({
      data: { ...coursLu, id: 42, etat: 'pret', pagesDisponibles: false, complement: { id: 50, etat: 'notions', remarque: null } },
    });
    ouvrirCours();

    const liens = await screen.findAllByRole('link', { name: 'Choisir mes notions' });
    liens.forEach((l) => expect(l).toHaveAttribute('href', '/eleves/7/mes-fiches/cours/50'));
    expect(screen.queryByRole('link', { name: 'Compléter ce cours' })).not.toBeInTheDocument();
  });

  it('le complément se suit au milieu de l’écran, se réduit, puis annonce les fiches prêtes', async () => {
    jest.useFakeTimers();
    try {
      const enRoute = { ...coursLu, id: 42, etat: 'pret', pagesDisponibles: false, complement: { id: 50, etat: 'a_generer', remarque: null } };
      api.getCours.mockResolvedValue({ data: enRoute });
      ouvrirCours();

      const fenetre = await screen.findByRole('dialog');
      expect(fenetre).toHaveTextContent('Tes nouvelles fiches sont en préparation');

      fireEvent.click(within(fenetre).getByRole('button', { name: 'Continuer à réviser' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /se préparent/ })).toBeInTheDocument();

      // Le complément a fini : il n'est plus rendu, la fenêtre l'annonce.
      api.getCours.mockResolvedValue({ data: { ...enRoute, complement: null } });
      await act(async () => { jest.advanceTimersByTime(3000); });
      expect(await screen.findByRole('dialog')).toHaveTextContent('Tes nouvelles fiches sont prêtes');
      fireEvent.click(screen.getByRole('button', { name: 'Voir mes fiches' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('le complément : les notions déjà dans le cours sont signalées, et la demande ramène au cours', async () => {
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        id: 50,
        complementDe: 42,
        complementDeTitre: 'Thalès',
        notions: [
          { titre: 'La configuration', resume: null, rang: 1 },
          { titre: 'La réciproque', resume: null, rang: null },
        ],
      },
    });
    api.demanderFiches.mockResolvedValue({});
    ouvrirCours();

    expect(await screen.findByRole('heading', { name: 'Compléter « Thalès »' })).toBeInTheDocument();
    expect(screen.getAllByText(/Déjà dans ton cours/)).toHaveLength(1);
    expect(screen.getByRole('link', { name: '← Mon cours' })).toHaveAttribute('href', '/eleves/7/mes-fiches/cours/42');

    fireEvent.click(screen.getByRole('button', { name: /Créer mes 2 fiches/ }));
    await waitFor(() => expect(mockNaviguer).toHaveBeenCalledWith('/eleves/7/mes-fiches/cours/42'));
  });

  it('les fiches prêtes se lisent une à une', async () => {
    const carte = (centre) => [{ type: 'carte', centre, branches: [{ titre: 'Idée', texte: 'Une phrase.' }] }];
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        etat: 'pret',
        fiches: [
          { id: 2, type: 'visuelle', titre: 'Le théorème', notionRang: 2, notionTotal: 3, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Théorème') },
          { id: 1, type: 'visuelle', titre: 'La configuration', notionRang: 1, notionTotal: 3, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Configuration') },
        ],
      },
    });
    ouvrirCours();

    // Rangées par notion : la première d'abord, quel que soit l'ordre reçu.
    expect(await screen.findByRole('heading', { level: 2, name: 'La configuration' })).toBeInTheDocument();
    expect(screen.getByText('Fiche 1 sur 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Suivante' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Le théorème' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suivante' })).toBeDisabled();

    // Un point par fiche : on revient directement à la première.
    fireEvent.click(screen.getByRole('button', { name: 'Aller à la fiche 1' }));
    expect(screen.getByRole('heading', { level: 2, name: 'La configuration' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aller à la fiche 1' })).toHaveAttribute('aria-current', 'true');

    // Le sommaire à gauche : chaque notion y est un bouton, la regardée est marquée.
    const sommaire = screen.getByRole('navigation', { name: 'Les fiches de ce cours' });
    fireEvent.click(within(sommaire).getByRole('button', { name: /Le théorème/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Le théorème' })).toBeInTheDocument();
    expect(within(sommaire).getByRole('button', { name: /Le théorème/ })).toHaveAttribute('aria-current', 'true');
    expect(within(sommaire).getByRole('button', { name: /La configuration/ })).not.toHaveAttribute('aria-current');
  });

  it('après l’impression d’une fiche, la page revient entière', async () => {
    const carte = (centre) => [{ type: 'carte', centre, branches: [{ titre: 'Idée', texte: 'Une phrase.' }] }];
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        etat: 'pret',
        fiches: [
          { id: 1, type: 'visuelle', titre: 'La configuration', notionRang: 1, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Configuration') },
          { id: 2, type: 'visuelle', titre: 'Le théorème', notionRang: 2, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Théorème') },
        ],
      },
    });
    // Chrome tel qu'il se comporte : « avant », « après » dès l'aperçu prêt, puis
    // un nouvel aperçu (« avant ») qui remet la page en mode impression sans « après ».
    const imprimer = jest.spyOn(window, 'print').mockImplementation(() => {
      window.dispatchEvent(new Event('beforeprint'));
      window.dispatchEvent(new Event('afterprint'));
      window.dispatchEvent(new Event('beforeprint'));
    });
    ouvrirCours();
    await screen.findByRole('heading', { level: 2, name: 'La configuration' });

    fireEvent.click(screen.getByRole('button', { name: /Imprimer ou enregistrer en PDF/ }));

    // Chrome signale la fin fenêtre encore ouverte : rien ne bouge tant qu'on
    // n'a pas touché la page (la fenêtre est alors fermée).
    expect(screen.queryByText('Votre fiche est prête en PDF')).not.toBeInTheDocument();
    await act(async () => { await new Promise((ok) => { setTimeout(ok, 350); }); });
    fireEvent.keyDown(window, { key: 'Shift' });

    expect(await screen.findByText('Votre fiche est prête en PDF')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suivante' })).toBeVisible();
    expect(screen.getByText('Fiche 1 sur 2')).toBeVisible();
    expect(document.documentElement).not.toHaveClass('fdr-impression');
    imprimer.mockRestore();
  });

  it('toutes les fiches du menu partent dans un seul PDF, une par page', async () => {
    const carte = (centre) => [{ type: 'carte', centre, branches: [{ titre: 'Idée', texte: 'Une phrase.' }] }];
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        etat: 'pret',
        fiches: [
          { id: 1, type: 'visuelle', titre: 'La configuration', notionRang: 1, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Configuration') },
          { id: 2, type: 'visuelle', titre: 'Le théorème', notionRang: 2, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Théorème') },
        ],
      },
    });
    const imprimer = jest.spyOn(window, 'print').mockImplementation(() => {});
    ouvrirCours();
    await screen.findByRole('heading', { level: 2, name: 'La configuration' });

    // Le bouton d'une fiche reste là ; le nouveau compte les fiches du menu.
    expect(screen.getByRole('button', { name: /Imprimer ou enregistrer en PDF/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toutes les fiches en PDF (2)' }));

    // Le lot attend ses images (au plus 4 s) : en test, elles ne se chargent jamais.
    await waitFor(() => expect(imprimer).toHaveBeenCalled(), { timeout: 6000 });
    // eslint-disable-next-line testing-library/no-node-access
    const lot = document.querySelectorAll('.fdr-lot .fdr-feuille');
    expect(lot).toHaveLength(2);

    // Après l'impression, le lot disparaît.
    act(() => { window.dispatchEvent(new Event('afterprint')); });
    // Le lot reste tant que la fenêtre est ouverte ; au premier geste, il part
    // et un message dit où trouver le fichier.
    // eslint-disable-next-line testing-library/no-node-access
    expect(document.querySelector('.fdr-lot')).not.toBeNull();
    await act(async () => { await new Promise((ok) => { setTimeout(ok, 350); }); });
    fireEvent.keyDown(window, { key: 'Shift' });
    expect(await screen.findByText('Vos 2 fiches sont prêtes en PDF')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    await waitFor(() => expect(document.querySelector('.fdr-lot')).toBeNull());
    imprimer.mockRestore();
  }, 10000);

  it('sur téléphone, on glisse la fiche du doigt pour passer à la voisine', async () => {
    window.localStorage.removeItem('mimia.fiches.glissement-compris');
    const carte = (centre) => [{ type: 'carte', centre, branches: [{ titre: 'Idée', texte: 'Une phrase.' }] }];
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        etat: 'pret',
        fiches: [
          { id: 1, type: 'visuelle', titre: 'La configuration', notionRang: 1, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Configuration') },
          { id: 2, type: 'visuelle', titre: 'Le théorème', notionRang: 2, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Théorème') },
        ],
      },
    });
    ouvrirCours();
    const titre = await screen.findByRole('heading', { level: 2, name: 'La configuration' });
    expect(screen.getByText(/Glisse la fiche du doigt/)).toBeInTheDocument();

    const glisser = (cible, de, a, dy = 0) => {
      fireEvent.touchStart(cible, { touches: [{ clientX: de, clientY: 300 }] });
      fireEvent.touchEnd(cible, { touches: [], changedTouches: [{ clientX: a, clientY: 300 + dy }] });
    };

    // Un geste surtout vertical, c'est la lecture qui défile : rien ne change.
    glisser(titre, 300, 220, 200);
    expect(screen.getByRole('heading', { level: 2, name: 'La configuration' })).toBeInTheDocument();
    // Trop court : un tremblement du doigt.
    glisser(titre, 300, 270);
    expect(screen.getByText('Fiche 1 sur 2')).toBeInTheDocument();

    // Vers la gauche : la suivante ; l'astuce a servi, elle s'efface.
    glisser(titre, 300, 120);
    expect(screen.getByRole('heading', { level: 2, name: 'Le théorème' })).toBeInTheDocument();
    expect(screen.queryByText(/Glisse la fiche du doigt/)).not.toBeInTheDocument();
    expect(window.localStorage.getItem('mimia.fiches.glissement-compris')).toBe('1');

    // Au bout, vers la gauche : rien ; vers la droite : la précédente.
    glisser(screen.getByRole('heading', { level: 2, name: 'Le théorème' }), 300, 120);
    expect(screen.getByText('Fiche 2 sur 2')).toBeInTheDocument();
    glisser(screen.getByRole('heading', { level: 2, name: 'Le théorème' }), 100, 300);
    expect(screen.getByRole('heading', { level: 2, name: 'La configuration' })).toBeInTheDocument();
  });

  it('sur téléphone, le bouton « menu » ouvre les notions et on y choisit sa fiche', async () => {
    const carte = (centre) => [{ type: 'carte', centre, branches: [{ titre: 'Idée', texte: 'Une phrase.' }] }];
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        etat: 'pret',
        fiches: [
          { id: 1, type: 'visuelle', titre: 'La configuration', notionRang: 1, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Configuration') },
          { id: 2, type: 'visuelle', titre: 'Le théorème', notionRang: 2, notionTotal: 2, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Théorème') },
        ],
      },
    });
    ouvrirCours();
    await screen.findByRole('heading', { level: 2, name: 'La configuration' });

    fireEvent.click(screen.getByRole('button', { name: 'Les notions du cours' }));
    const menu = screen.getByRole('dialog', { name: 'Les notions' });
    expect(within(menu).getByText('Fiche 1 sur 2')).toBeInTheDocument();
    expect(within(menu).getByRole('button', { name: /La configuration/ })).toHaveAttribute('aria-current', 'true');
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(within(menu).getByRole('button', { name: /Le théorème/ }));
    expect(screen.queryByRole('dialog', { name: 'Les notions' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Le théorème' })).toBeInTheDocument();
    expect(document.body.style.overflow).not.toBe('hidden');

    // Échap le referme aussi.
    fireEvent.click(screen.getByRole('button', { name: 'Les notions du cours' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Les notions' })).not.toBeInTheDocument();
  });

  it('une seule fiche : pas de bouton des notions', async () => {
    const carte = (centre) => [{ type: 'carte', centre, branches: [{ titre: 'Idée', texte: 'Une phrase.' }] }];
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        etat: 'pret',
        fiches: [{ id: 1, type: 'visuelle', titre: 'La configuration', notionRang: 1, notionTotal: 1, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Configuration') }],
      },
    });
    ouvrirCours();
    await screen.findByRole('heading', { level: 2, name: 'La configuration' });
    expect(screen.queryByRole('button', { name: 'Les notions du cours' })).not.toBeInTheDocument();
  });

  it('« Agrandir » ouvre la fiche en grand, on y zoome, et on la referme', async () => {
    const carte = (centre) => [{ type: 'carte', centre, branches: [{ titre: 'Idée', texte: 'Une phrase.' }] }];
    api.getCours.mockResolvedValue({
      data: {
        ...coursLu,
        etat: 'pret',
        fiches: [{ id: 1, type: 'visuelle', titre: 'La configuration', notionRang: 1, notionTotal: 1, dateCreation: '2026-10-14T10:01:00Z', blocs: carte('Configuration') }],
      },
    });
    ouvrirCours();

    fireEvent.click(await screen.findByRole('button', { name: /Agrandir/ }));
    const visionneuse = screen.getByRole('dialog', { name: /La fiche en grand/ });
    expect(visionneuse).toHaveTextContent('100 %');
    expect(document.documentElement).toHaveClass('fdr-grand');

    fireEvent.click(screen.getByRole('button', { name: 'Zoomer' }));
    expect(visionneuse).toHaveTextContent('125 %');
    fireEvent.click(screen.getByRole('button', { name: 'Dézoomer' }));
    expect(visionneuse).toHaveTextContent('100 %');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /La fiche en grand/ })).not.toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('fdr-grand');
  });
});

describe('une famille administratrice', () => {
  // Camara, le 16/10/2026 : ni la taille du document ni le nombre de notions
  // ne sont limités pour un admin. Les plafonds viennent du serveur, avec la jauge.
  it('voit les plafonds que le serveur lui donne, pas ceux de tout le monde', async () => {
    api.getQuota.mockResolvedValue({
      data: {
        ...quota(0),
        limites: { sansLimite: true, pagesMax: 100, piecesMax: 100, tailleFichierMax: 20971520, notionsMax: 40 },
      },
    });
    ouvrir({ eleveId: '7' }, <NouveauCours />);
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));
    fireEvent.click(screen.getByRole('radio', { name: /Fiche visuelle/ }));

    expect(await screen.findByText(/photos ou PDF, 100 pages au plus/)).toBeInTheDocument();
  });

  it('sans réponse du serveur, garde les plafonds de tout le monde', async () => {
    ouvrir({ eleveId: '7' }, <NouveauCours />);
    fireEvent.click(await screen.findByRole('radio', { name: 'Mathématiques' }));
    fireEvent.click(screen.getByRole('radio', { name: /Fiche visuelle/ }));

    expect(await screen.findByText(/photos ou PDF, 20 pages au plus/)).toBeInTheDocument();
  });
});
