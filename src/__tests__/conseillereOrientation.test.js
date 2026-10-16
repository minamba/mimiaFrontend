/**
 * LA CONSEILLÈRE D'ORIENTATION — Camara, le 11/10/2026 : un interrupteur dans
 * Admin › Modes « comme les professeurs de langue », l'état de l'import de
 * l'offre des lycées, et le choix de l'établissement de l'enfant par le parent.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModeConseillere from '../components/ModeConseillere';
import ChoixEtablissement from '../components/ChoixEtablissement';
import { LigneEnfant } from '../components/MonProfil';
import { getImportOrientation, lancerImportOrientation } from '../lib/api/adminApi';
import { chercherEtablissements, definirEtablissement } from '../lib/api/elevesApi';

jest.mock('../lib/api/adminApi', () => ({
  getImportOrientation: jest.fn(),
  lancerImportOrientation: jest.fn(),
}));

// MonProfil (la carte de l'enfant) importe la navigation et le store.
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir({ eleves: { liste: [] }, referentiel: { niveaux: [], academies: [] }, profil: {} }),
}));

jest.mock('../lib/api/elevesApi', () => ({
  chercherEtablissements: jest.fn(),
  definirEtablissement: jest.fn(),
  getElevesArchives: jest.fn(() => Promise.resolve({ data: [] })),
  restaurerEleve: jest.fn(),
}));

const ETAT_IMPORT = {
  enCours: false,
  lycees: 5647,
  passages: [{ date: '2026-10-11T12:00:00', reussi: true, message: '5647 lycées mis à jour.' }],
};

describe('la carte de la conseillère dans Admin › Modes', () => {
  beforeEach(() => {
    getImportOrientation.mockResolvedValue({ data: ETAT_IMPORT });
    lancerImportOrientation.mockResolvedValue({});
  });

  it('ne s’affiche pas tant que sa matière n’existe pas', () => {
    render(<ModeConseillere conseillere={{ existe: false, actif: false }} lus onBasculer={jest.fn()} />);
    expect(screen.queryByText('La conseillère d’orientation')).toBeNull();
  });

  it('montre son interrupteur et l’état de l’offre des lycées', async () => {
    const onBasculer = jest.fn();
    render(<ModeConseillere conseillere={{ existe: true, actif: false }} lus onBasculer={onBasculer} />);

    const bascule = screen.getByRole('switch', { name: 'La conseillère d’orientation' });
    expect(bascule).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(bascule);
    expect(onBasculer).toHaveBeenCalled();

    expect(await screen.findByText(/5\s647 lycées en base\./)).toBeInTheDocument();
  });

  it('lance l’import à la demande, en forçant le téléchargement', async () => {
    render(<ModeConseillere conseillere={{ existe: true, actif: true }} lus onBasculer={jest.fn()} />);
    await screen.findByText(/lycées en base/);
    await userEvent.click(screen.getByRole('button', { name: 'Importer maintenant' }));
    expect(lancerImportOrientation).toHaveBeenCalledWith(true);
    expect(await screen.findByText('Import en cours…')).toBeInTheDocument();
  });

  it('signale un dernier import en échec, sans rien effacer', async () => {
    getImportOrientation.mockResolvedValue({
      data: { ...ETAT_IMPORT, passages: [{ date: '2026-10-11T12:00:00', reussi: false, message: 'Le jeu a changé de format.' }] },
    });
    render(<ModeConseillere conseillere={{ existe: true, actif: true }} lus onBasculer={jest.fn()} />);
    expect(await screen.findByText(/Le dernier import a échoué/)).toBeInTheDocument();
  });
});

describe('le choix de l’établissement de l’enfant', () => {
  beforeEach(() => {
    chercherEtablissements.mockResolvedValue({
      data: [{ uai: '0772296C', nom: 'Lycée polyvalent de la Mare Carrée', type: 'Lycée', commune: 'Moissy-Cramayel', statut: 'Public' }],
    });
    definirEtablissement.mockResolvedValue({ data: {} });
  });

  it('cherche dans l’annuaire et retient le choix, sans rien enregistrer', async () => {
    const onChange = jest.fn();
    render(<ChoixEtablissement id="etab" valeur={null} onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Collège ou lycée (facultatif)'), 'mare carrée');
    await userEvent.click(await screen.findByRole('button', { name: /Lycée polyvalent de la Mare Carrée/ }));

    expect(chercherEtablissements).toHaveBeenLastCalledWith('mare carrée');
    expect(onChange).toHaveBeenCalledWith({ uai: '0772296C', nom: 'Lycée polyvalent de la Mare Carrée', commune: 'Moissy-Cramayel' });
    expect(definirEtablissement).not.toHaveBeenCalled();
  });

  it('ne cherche rien avant trois lettres', async () => {
    render(<ChoixEtablissement id="etab" valeur={null} onChange={jest.fn()} />);
    await userEvent.type(screen.getByLabelText('Collège ou lycée (facultatif)'), 'ma');
    await new Promise((r) => { setTimeout(r, 400); });
    expect(chercherEtablissements).not.toHaveBeenCalled();
  });
});

describe('dans la carte de l’enfant : le champ est au-dessus d’Enregistrer, et part avec lui', () => {
  const ELEVE = {
    id: 24, prenom: 'Lina', nom: 'Doe', age: 15, niveauScolaireId: 10, sexe: 1,
    niveauCycle: 'Lycee', niveauLibelle: '2de', specialites: [], langues: [],
  };
  const NIVEAUX = [{ id: 10, libelle: '2de', cycle: 'Lycée', groupe: 'Lycée', selectionnable: true }];

  beforeEach(() => {
    chercherEtablissements.mockResolvedValue({
      data: [{ uai: '0772296C', nom: 'Lycée polyvalent de la Mare Carrée', type: 'Lycée', commune: 'Moissy-Cramayel' }],
    });
    definirEtablissement.mockResolvedValue({ data: {} });
  });

  it('choisir puis enregistrer envoie l’établissement', async () => {
    const onEnregistrer = jest.fn();
    const onEtablissement = jest.fn();
    render(
      <ul>
        <LigneEnfant
          eleve={ELEVE} niveaux={NIVEAUX} academies={[]}
          onEnregistrer={onEnregistrer} onVoirFiche={jest.fn()} onRetirer={jest.fn()}
          onEtablissement={onEtablissement} saving={false}
        />
      </ul>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    // Le champ précède le bouton dans le formulaire.
    const champ = screen.getByLabelText('Collège ou lycée (facultatif)');
    const bouton = screen.getByRole('button', { name: 'Enregistrer' });
    // eslint-disable-next-line no-bitwise
    expect(champ.compareDocumentPosition(bouton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await userEvent.type(champ, 'mare carrée');
    await userEvent.click(await screen.findByRole('button', { name: /Lycée polyvalent de la Mare Carrée/ }));
    expect(definirEtablissement).not.toHaveBeenCalled();

    await userEvent.click(bouton);
    expect(onEnregistrer).toHaveBeenCalled();
    await waitFor(() => expect(definirEtablissement).toHaveBeenCalledWith(24, '0772296C'));
    await waitFor(() => expect(onEtablissement).toHaveBeenCalled());
  });

  it('enregistrer sans toucher au champ n’envoie rien de plus', async () => {
    render(
      <ul>
        <LigneEnfant
          eleve={{ ...ELEVE, etablissementUai: '0772296C', etablissementLibelle: 'Lycée polyvalent de la Mare Carrée', etablissementCommune: 'Moissy-Cramayel' }}
          niveaux={NIVEAUX} academies={[]}
          onEnregistrer={jest.fn()} onVoirFiche={jest.fn()} onRetirer={jest.fn()} saving={false}
        />
      </ul>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(screen.getByText('Lycée polyvalent de la Mare Carrée')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(definirEtablissement).not.toHaveBeenCalled();
  });
});
