/**
 * LA FENÊTRE « MODIFIER » D'UN ENFANT — Camara, le 16/10/2026 : une popup avec
 * un formulaire moderne, propre et pas monochrome, au lieu du formulaire qui se
 * dépliait sous la carte.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LigneEnfant } from '../components/MonProfil';

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

const ELEVE = {
  id: 7, prenom: 'Ahmed', nom: 'Camara', age: 7, niveauScolaireId: 2, sexe: 0,
  niveauCycle: 'Primaire', niveauLibelle: 'CE1', specialites: [], langues: [],
};
const NIVEAUX = [{ id: 2, libelle: 'CE1', cycle: 'Primaire', groupe: 'Primaire', selectionnable: true }];

const afficher = (onEnregistrer = jest.fn()) => render(
  <ul>
    <LigneEnfant
      eleve={ELEVE} niveaux={NIVEAUX} academies={[]}
      onEnregistrer={onEnregistrer} onVoirFiche={jest.fn()} onRetirer={jest.fn()} saving={false}
    />
  </ul>,
);

describe('la fenêtre « Modifier » d’un enfant', () => {
  it('s’ouvre en fenêtre, titrée au prénom, avec ses sections colorées', async () => {
    afficher();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));

    expect(screen.getByRole('dialog', { name: 'Modifier le profil de Ahmed' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Identité' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Scolarité' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Où il étudie' })).toBeInTheDocument();
    expect(screen.getByLabelText('Prénom')).toHaveFocus();
  });

  it('Échap ferme, et une saisie abandonnée ne revient pas', async () => {
    afficher();
    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    await userEvent.clear(screen.getByLabelText('Prénom'));
    await userEvent.type(screen.getByLabelText('Prénom'), 'Zorro');

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(screen.getByLabelText('Prénom')).toHaveValue('Ahmed');
  });

  it('la croix et « Annuler » ferment sans rien envoyer', async () => {
    const onEnregistrer = jest.fn();
    afficher(onEnregistrer);

    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onEnregistrer).not.toHaveBeenCalled();
  });

  it('« Enregistrer » envoie le profil modifié et ferme la fenêtre', async () => {
    const onEnregistrer = jest.fn();
    afficher(onEnregistrer);

    await userEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    await userEvent.clear(screen.getByLabelText('Âge'));
    await userEvent.type(screen.getByLabelText('Âge'), '8');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(onEnregistrer).toHaveBeenCalledWith(expect.objectContaining({ id: 7, prenom: 'Ahmed', age: 8 }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
