import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DroitsAdmin from '../components/DroitsAdmin';

import * as api from '../lib/api/adminApi';

/**
 * LES DROITS D'UN ADMINISTRATEUR — Camara, le 17/09/2026.
 *
 * « En tant que super admin, je veux pouvoir gérer les droits des
 * administrateurs… ceux qui sont cochés seront visibles, ceux qui ne sont pas
 * cochés seront invisibles », et « de base quand le super admin passe un
 * utilisateur en admin, tout est décoché ».
 *
 * CE QUE CES TESTS PROTÈGENT
 * -------------------------
 * 1. La liste des sections vient DU SERVEUR. La tenir aussi dans l'écran aurait
 *    fini par en laisser une de côté — et une section oubliée ici serait
 *    invisible pour toujours, cochée nulle part donc accordée à personne.
 * 2. Rien n'est enregistré avant le bouton. Un droit qui se poserait à chaque
 *    clic de case laisserait un état intermédiaire RÉEL : trois sections
 *    ouvertes pendant qu'on hésite sur la quatrième.
 * 3. Un compte sans aucune section est un état voulu, pas une panne — mais qui
 *    referme la fenêtre sans rien cocher doit savoir ce qu'il vient de laisser.
 */

jest.mock('../lib/api/adminApi');

const PARENT = { id: 12, prenom: 'Nora', nom: 'Belkacem', mail: 'nora@exemple.fr' };

const TOUTES = ['stats', 'parents', 'idees', 'signalements'];

beforeEach(() => {
  jest.clearAllMocks();
  api.getOngletsAdmin.mockResolvedValue({ data: { toutes: TOUTES, accordes: ['idees'] } });
  api.definirOngletsAdmin.mockResolvedValue({});
});

const ouvrir = async (props = {}) => {
  render(<DroitsAdmin parent={PARENT} onFermer={() => {}} {...props} />);
  await screen.findByLabelText('Idées');
};

describe('La fenêtre des droits', () => {
  test('les sections viennent du serveur, pas de l’écran', async () => {
    await ouvrir();

    expect(screen.getByLabelText('Statistiques')).toBeInTheDocument();
    expect(screen.getByLabelText('Parents')).toBeInTheDocument();
    expect(screen.getByLabelText('Signalements')).toBeInTheDocument();
  });

  test('ce qui est déjà accordé arrive coché', async () => {
    await ouvrir();

    expect(screen.getByLabelText('Idées')).toBeChecked();
    expect(screen.getByLabelText('Statistiques')).not.toBeChecked();
  });

  test('cocher n’enregistre rien : seul le bouton enregistre', async () => {
    await ouvrir();

    await userEvent.click(screen.getByLabelText('Statistiques'));

    expect(api.definirOngletsAdmin).not.toHaveBeenCalled();
  });

  test('le bouton envoie exactement les cases cochées', async () => {
    await ouvrir();

    await userEvent.click(screen.getByLabelText('Statistiques'));
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => expect(api.definirOngletsAdmin).toHaveBeenCalled());

    const [id, onglets] = api.definirOngletsAdmin.mock.calls[0];

    expect(id).toBe(PARENT.id);
    expect([...onglets].sort()).toEqual(['idees', 'stats']);
  });

  test('décocher retire le droit', async () => {
    await ouvrir();

    await userEvent.click(screen.getByLabelText('Idées'));
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => expect(api.definirOngletsAdmin).toHaveBeenCalledWith(PARENT.id, []));
  });

  test('un compte sans aucune section le dit', async () => {
    api.getOngletsAdmin.mockResolvedValue({ data: { toutes: TOUTES, accordes: [] } });

    render(<DroitsAdmin parent={PARENT} onFermer={() => {}} />);

    expect(await screen.findByText(/son tableau de bord sera vide/i)).toBeInTheDocument();
  });

  test('la fenêtre se referme après l’enregistrement', async () => {
    const fermer = jest.fn();
    await ouvrir({ onFermer: fermer });

    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    await waitFor(() => expect(fermer).toHaveBeenCalled());
  });

  test('un échec laisse la fenêtre ouverte et le dit', async () => {
    api.definirOngletsAdmin.mockRejectedValue(new Error('réseau'));

    const fermer = jest.fn();
    await ouvrir({ onFermer: fermer });

    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(await screen.findByText(/n’ont pas pu être enregistrés/i)).toBeInTheDocument();
    expect(fermer).not.toHaveBeenCalled();
  });
});
