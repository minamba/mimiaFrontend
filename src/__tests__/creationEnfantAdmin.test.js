import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreationEnfantAdmin from '../components/CreationEnfantAdmin';
import { creerEnfantPourParent } from '../lib/api/adminApi';

/*
 * CRÉER UN ENFANT POUR UN PARENT — Camara, le 16/10/2026 : depuis la ligne du
 * parent, une fenêtre de création ; l'enfant est rattaché à CE parent.
 */
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir({
    referentiel: { niveaux: [{ id: 3, code: 'CM1', libelle: 'CM1', cycle: 'Primaire', lv2Possible: false }], academies: [] },
  }),
}));
jest.mock('../lib/api/adminApi', () => ({ creerEnfantPourParent: jest.fn() }));

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
