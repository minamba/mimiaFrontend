import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreationEnfantAdmin from '../components/CreationEnfantAdmin';
import { creerEnfantPourParent, definirEtablissementEnfantAdmin } from '../lib/api/adminApi';
import { chercherEtablissements } from '../lib/api/elevesApi';

/*
 * CRÉER UN ENFANT POUR UN PARENT — Camara, le 16/10/2026 : depuis la ligne du
 * parent, une fenêtre de création ; l'enfant est rattaché à CE parent.
 */
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir({
    referentiel: {
      niveaux: [
        { id: 3, code: 'CM1', libelle: 'CM1', cycle: 'Primaire', lv2Possible: false, ordre: 4 },
        { id: 9, code: 'TROISIEME', libelle: '3e', cycle: 'Collège', lv2Possible: false, ordre: 9 },
      ],
      academies: [],
    },
  }),
}));
jest.mock('../lib/api/adminApi', () => ({ creerEnfantPourParent: jest.fn(), definirEtablissementEnfantAdmin: jest.fn() }));
jest.mock('../lib/api/elevesApi', () => ({ chercherEtablissements: jest.fn() }));
// Le module des besoins particuliers : éteint par défaut, allumé par un test.
let mockBesoins = false;
jest.mock('../lib/storage/modeTest', () => ({
  ...jest.requireActual('../lib/storage/modeTest'),
  useBesoinsParticuliers: () => mockBesoins,
}));

const parent = { id: 12, prenom: 'Hilda', nom: 'Camara', mail: 'hilda@example.fr' };

const remplir = () => {
  fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Syan' } });
  fireEvent.change(screen.getByLabelText('Âge'), { target: { value: '9' } });
  fireEvent.click(screen.getByLabelText('Un garçon'));
  fireEvent.change(screen.getByLabelText('Classe'), { target: { value: '3' } });
};

describe('la création d’un enfant par l’administration', () => {
  beforeEach(() => creerEnfantPourParent.mockReset());

  it('crée le profil pour le parent choisi, son nom de famille proposé', async () => {
    creerEnfantPourParent.mockResolvedValue({ data: { eleve: { id: 99, prenom: 'Syan' }, horsFormule: false } });
    const onCree = jest.fn();
    const onFermer = jest.fn();
    render(<CreationEnfantAdmin parent={parent} onCree={onCree} onFermer={onFermer} />);

    expect(screen.getByRole('dialog', { name: 'Créer un enfant' })).toBeInTheDocument();
    expect(screen.getByText('Rattaché à Hilda Camara')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom')).toHaveValue('Camara');

    remplir();
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));

    await waitFor(() => expect(onCree).toHaveBeenCalledWith({ eleve: { id: 99, prenom: 'Syan' }, horsFormule: false }));
    expect(creerEnfantPourParent).toHaveBeenCalledWith(12, expect.objectContaining({
      prenom: 'Syan', nom: 'Camara', age: 9, sexe: 2, niveauScolaireId: 3, academieId: null,
    }));
    // Les besoins particuliers ne partent jamais : seul le parent peut les cocher.
    expect(creerEnfantPourParent.mock.calls[0][1]).not.toHaveProperty('besoinsParticuliers');
    expect(onFermer).toHaveBeenCalled();
  });

  it('un refus du serveur s’affiche dans la fenêtre, qui reste ouverte', async () => {
    creerEnfantPourParent.mockRejectedValue({ response: { data: { message: 'La formule Solo de ce parent couvre 1 enfant, déjà tous enregistrés.' } } });
    const onFermer = jest.fn();
    render(<CreationEnfantAdmin parent={parent} onFermer={onFermer} />);

    remplir();
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('La formule Solo de ce parent couvre 1 enfant');
    expect(onFermer).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Créer le profil' })).toBeEnabled();
  });

  it('un refus de validation dit quels champs, et un serveur muet se dit aussi', async () => {
    creerEnfantPourParent.mockRejectedValueOnce({ response: { status: 400, data: { errors: { Age: ['L\'âge doit être compris entre 5 et 25 ans.'] } } } });
    render(<CreationEnfantAdmin parent={parent} onFermer={() => {}} />);
    remplir();
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('L\'âge doit être compris entre 5 et 25 ans.');

    creerEnfantPourParent.mockRejectedValueOnce(new Error('Network Error'));
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));
    expect(await screen.findByText(/Le serveur ne répond pas/)).toBeInTheDocument();
  });
});

// L'ÉTABLISSEMENT À PARTIR DE LA 3e, EN DEUX TEMPS — Camara, le 20/10/2026.
describe('l’établissement, à partir de la 3e', () => {
  beforeEach(() => {
    creerEnfantPourParent.mockReset();
    definirEtablissementEnfantAdmin.mockReset();
    chercherEtablissements.mockResolvedValue({
      data: [{ uai: '0772296C', nom: 'Collège de la Mare Carrée', type: 'Collège', commune: 'Moissy-Cramayel' }],
    });
  });

  it('absent en CM1, présent en 3e ; le profil d’abord, l’établissement ensuite avec l’identifiant reçu', async () => {
    creerEnfantPourParent.mockResolvedValue({ data: { eleve: { id: 99, prenom: 'Syan' }, horsFormule: false } });
    definirEtablissementEnfantAdmin.mockResolvedValue({ data: {} });
    const onCree = jest.fn();
    render(<CreationEnfantAdmin parent={parent} onCree={onCree} onFermer={jest.fn()} />);

    remplir();
    expect(screen.queryByLabelText('Collège ou lycée (facultatif)')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Classe'), { target: { value: '9' } });
    const champ = screen.getByLabelText('Collège ou lycée (facultatif)');
    fireEvent.change(champ, { target: { value: 'mare carrée' } });
    fireEvent.click(await screen.findByRole('button', { name: /Mare Carrée/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));
    await waitFor(() => expect(onCree).toHaveBeenCalled());

    // Le profil part sans le code : sa route ne le connaît pas.
    expect(creerEnfantPourParent.mock.calls[0][1]).not.toHaveProperty('etablissementUai');
    expect(definirEtablissementEnfantAdmin).toHaveBeenCalledWith(99, '0772296C');
  });

  it('sans établissement choisi, un seul appel', async () => {
    creerEnfantPourParent.mockResolvedValue({ data: { eleve: { id: 100 } } });
    render(<CreationEnfantAdmin parent={parent} onCree={jest.fn()} onFermer={jest.fn()} />);

    remplir();
    fireEvent.change(screen.getByLabelText('Classe'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));

    await waitFor(() => expect(creerEnfantPourParent).toHaveBeenCalled());
    expect(definirEtablissementEnfantAdmin).not.toHaveBeenCalled();
  });
});

// LES BESOINS PARTICULIERS DEPUIS L'ADMINISTRATION — Camara, le 20/10/2026.
describe('les besoins particuliers', () => {
  beforeEach(() => creerEnfantPourParent.mockReset());
  afterEach(() => { mockBesoins = false; });

  it('module allumé : le panneau est là, avec le rappel de l’accord, et les cases partent', async () => {
    mockBesoins = true;
    creerEnfantPourParent.mockResolvedValue({ data: { eleve: { id: 101 } } });
    render(<CreationEnfantAdmin parent={parent} onCree={jest.fn()} onFermer={jest.fn()} />);

    expect(screen.getByText(/c’est lui qui donne son accord/)).toBeInTheDocument();
    remplir();
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));

    await waitFor(() => expect(creerEnfantPourParent).toHaveBeenCalled());
    expect(creerEnfantPourParent.mock.calls[0][1]).toMatchObject({ besoinsParticuliers: [], ecranAdapte: true });
  });

  it('module éteint : rien à l’écran, rien d’envoyé', async () => {
    creerEnfantPourParent.mockResolvedValue({ data: { eleve: { id: 102 } } });
    render(<CreationEnfantAdmin parent={parent} onCree={jest.fn()} onFermer={jest.fn()} />);

    expect(screen.queryByText(/c’est lui qui donne son accord/)).not.toBeInTheDocument();
    remplir();
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));

    await waitFor(() => expect(creerEnfantPourParent).toHaveBeenCalled());
    expect(creerEnfantPourParent.mock.calls[0][1]).not.toHaveProperty('besoinsParticuliers');
  });
});
