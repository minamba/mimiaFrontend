import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import RolesAdmin from '../components/RolesAdmin';
import { getRoles, creerRole, modifierRole, definirCopieMinamba } from '../lib/api/adminApi';

/*
 * L'ONGLET « RÔLES » — Camara, le 17/10/2026 : créer des rôles qui portent des
 * droits, puis les attribuer aux comptes parents.
 */
jest.mock('../lib/api/adminApi', () => ({
  getRoles: jest.fn(),
  creerRole: jest.fn(),
  modifierRole: jest.fn(),
  supprimerRole: jest.fn(),
  definirCopieMinamba: jest.fn(),
}));

const COURRIELS = [{ code: 'test_pret', libelle: 'Signalement admin traité : prêt à être testé' }];

const roles = [
  { id: 1, nom: 'Utilisateur', code: 'utilisateur', onglets: [], nombreComptes: 9, ouvreAdministration: false },
  { id: 2, nom: 'Administrateur', code: 'administrateur', onglets: ['parents', 'idees'], nombreComptes: 1, ouvreAdministration: true },
  { id: 3, nom: 'Super-admin', code: 'super_admin', onglets: [], nombreComptes: 0, ouvreAdministration: false },
  { id: 4, nom: 'Commercial', code: null, onglets: ['stats'], nombreComptes: 2, ouvreAdministration: true },
];

describe('l’onglet Rôles', () => {
  beforeEach(() => {
    getRoles.mockResolvedValue({ data: { roles, onglets: ['stats', 'parents', 'idees', 'cout'] } });
    creerRole.mockResolvedValue({ data: {} });
  });

  it('montre les rôles et leurs règles : système non modifiable, créé supprimable', async () => {
    render(<RolesAdmin />);
    const cartes = await screen.findAllByRole('listitem');
    expect(cartes).toHaveLength(4);

    const [utilisateur, administrateur, superAdmin, commercial] = cartes;
    expect(within(utilisateur).queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(within(superAdmin).getByText('Tous les onglets, toujours. Ne s’attribue pas.')).toBeInTheDocument();
    expect(within(administrateur).getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
    expect(within(administrateur).queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument();
    expect(within(commercial).getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
    expect(within(commercial).getByText('Statistiques')).toBeInTheDocument();
  });

  it('crée un rôle avec ses onglets cochés', async () => {
    const onChange = jest.fn();
    render(<RolesAdmin onChange={onChange} />);
    fireEvent.click(await screen.findByRole('button', { name: '+ Nouveau rôle' }));

    fireEvent.change(screen.getByLabelText('Nom du rôle'), { target: { value: 'Partenaire' } });
    fireEvent.click(screen.getByLabelText('Statistiques'));
    fireEvent.click(screen.getByLabelText('Idées'));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(creerRole).toHaveBeenCalledWith('Partenaire', ['stats', 'idees'], []));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });
});

/*
 * LES COURRIELS PORTÉS PAR LES RÔLES — Camara, le 06/11/2026 : « j'affecte les mails à un type d'utilisateur
 * et tous ces utilisateurs recevront le mail », et une case à part pour minamba.camara@mimia.fr.
 */
describe('les courriels de signalement dans l’onglet Rôles', () => {
  beforeEach(() => {
    getRoles.mockResolvedValue({
      data: {
        roles: [
          ...roles.slice(0, 3),
          { ...roles[3], nom: 'Testeuse', courriels: ['test_pret'] },
        ],
        onglets: ['stats', 'parents', 'idees', 'cout'],
        courriels: COURRIELS,
        adresseMinamba: 'minamba.camara@mimia.fr',
        copieMinamba: false,
      },
    });
    modifierRole.mockResolvedValue({ data: {} });
    creerRole.mockResolvedValue({ data: {} });
    definirCopieMinamba.mockResolvedValue({});
  });

  it('la carte du rôle dit ce qu’il reçoit, et la modification garde la case cochée', async () => {
    render(<RolesAdmin />);
    const cartes = await screen.findAllByRole('listitem');
    const testeuse = cartes[3];
    expect(within(testeuse).getByText('Reçoit : Signalement admin traité : prêt à être testé')).toBeInTheDocument();

    fireEvent.click(within(testeuse).getByRole('button', { name: 'Modifier' }));
    const caseCourriel = screen.getByLabelText('Signalement admin traité : prêt à être testé');
    expect(caseCourriel).toBeChecked();

    fireEvent.click(caseCourriel);
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await waitFor(() => expect(modifierRole).toHaveBeenCalledWith(4, 'Testeuse', ['stats'], []));
  });

  it('un nouveau rôle peut recevoir le courriel', async () => {
    render(<RolesAdmin />);
    fireEvent.click(await screen.findByRole('button', { name: '+ Nouveau rôle' }));
    fireEvent.change(screen.getByLabelText('Nom du rôle'), { target: { value: 'Testeurs' } });
    fireEvent.click(screen.getByLabelText('Signalement admin traité : prêt à être testé'));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(creerRole).toHaveBeenCalledWith('Testeurs', [], ['test_pret']));
  });

  it('la case de minamba.camara@mimia.fr se coche et se décoche', async () => {
    render(<RolesAdmin />);
    const copie = await screen.findByLabelText('Envoyer aussi à minamba.camara@mimia.fr');
    expect(copie).not.toBeChecked();

    fireEvent.click(copie);
    await waitFor(() => expect(definirCopieMinamba).toHaveBeenCalledWith(true));
    await waitFor(() => expect(copie).toBeChecked());

    fireEvent.click(copie);
    await waitFor(() => expect(definirCopieMinamba).toHaveBeenLastCalledWith(false));
    await waitFor(() => expect(copie).not.toBeChecked());
  });
});
