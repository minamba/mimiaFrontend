/**
 * LES BESOINS PARTICULIERS — dyslexie, dyscalculie, TDAH (Camara, le 11/10/2026).
 *
 * Le parent coche, sa coche vaut accord. Ce fichier tient ce que l'écran en
 * fait : rien quand le module est éteint, la lecture aérée pour la dyslexie, le
 * calme pour le TDAH, « Conseillé pour toi » sans jamais imposer, et la
 * politique de confidentialité qui le dit.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { affichageDe, useAffichageEleve } from '../lib/besoins';
import ChoixBesoins from '../components/ChoixBesoins';
import { ChoixDuree } from '../components/OuvertureSeance';
import FormulaireEleve from '../components/FormulaireEleve';
import Confidentialite from '../components/Confidentialite';

let mockModule = true;
let mockSession = null;
let mockEnvoi = null;

jest.mock('../lib/storage/modeTest', () => ({
  ...jest.requireActual('../lib/storage/modeTest'),
  useBesoinsParticuliers: () => mockModule,
}));

jest.mock('../lib/storage/sessionEleve', () => ({
  ...jest.requireActual('../lib/storage/sessionEleve'),
  sessionEleve: () => mockSession,
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => () => {},
}));

jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({
    eleves: { liste: [], loading: false, error: null, submitting: false, success: false },
    auth: { estAdmin: false },
    referentiel: { niveaux: [{ id: 1, libelle: 'CM1', lv2Possible: false }], academies: [], loading: false },
  }),
  useDispatch: () => () => {},
}));

jest.mock('../lib/actions/elevesActions', () => ({
  chargerEleves: () => ({ type: 'test/charger' }),
  submitEleve: (eleve) => { mockEnvoi = eleve; return { type: 'test/submit' }; },
  resetEleve: () => ({ type: 'test/reset' }),
}));

jest.mock('../lib/actions/referentielActions', () => ({
  chargerReferentiel: () => ({ type: 'test/referentiel' }),
}));

jest.mock('../lib/api/abonnementApi', () => ({
  getCapaciteEnfants: () => Promise.resolve({
    data: { actuels: 0, maximum: 3, peutAjouter: true, droitRetire: false },
  }),
}));

beforeEach(() => {
  mockModule = true;
  mockSession = null;
  mockEnvoi = null;
});

describe('ce que les cases changent à l’écran', () => {
  const eleve = (besoins, ecranAdapte = true) => ({ besoinsParticuliers: besoins, ecranAdapte });

  test('la dyslexie aère la lecture, le TDAH apaise', () => {
    expect(affichageDe(eleve(['DYSLEXIE']), true)).toEqual({ lectureAeree: true, calme: false });
    expect(affichageDe(eleve(['TDAH']), true)).toEqual({ lectureAeree: false, calme: true });
  });

  test('la dyscalculie ne change que le professeur, pas l’écran', () => {
    expect(affichageDe(eleve(['DYSCALCULIE']), true)).toEqual({ lectureAeree: false, calme: false });
  });

  test('rien quand le module est éteint, ni quand le parent a coupé l’écran adapté', () => {
    expect(affichageDe(eleve(['DYSLEXIE', 'TDAH']), false)).toEqual({ lectureAeree: false, calme: false });
    expect(affichageDe(eleve(['DYSLEXIE', 'TDAH'], false), true)).toEqual({ lectureAeree: false, calme: false });
  });

  test('l’enfant connecté porte son affichage sur la page, et le retire en partant', () => {
    mockSession = { jeton: 'j', eleveId: 7, affichage: { lectureAeree: true, calme: true } };
    const { result, unmount } = renderHook(() => useAffichageEleve('7'));

    expect(result.current).toEqual({ lectureAeree: true, calme: true });
    expect(document.documentElement.dataset.lecture).toBe('aeree');
    expect(document.documentElement.dataset.calme).toBe('oui');

    unmount();
    expect(document.documentElement.dataset.lecture).toBeUndefined();
    expect(document.documentElement.dataset.calme).toBeUndefined();
  });

  test('la session d’un autre enfant ne s’applique pas', () => {
    mockSession = { jeton: 'j', eleveId: 8, affichage: { lectureAeree: true, calme: true } };
    const { result } = renderHook(() => useAffichageEleve('7'));
    expect(result.current).toEqual({ lectureAeree: false, calme: false });
  });
});

describe('les cases dans le profil', () => {
  test('repliées d’abord ; cocher envoie la case, avec l’écran adapté allumé', () => {
    const onChange = jest.fn();
    render(<ChoixBesoins valeur={{ besoins: [], ecranAdapte: true }} onChange={onChange} />);

    expect(screen.queryByLabelText(/^Dyscalculie/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Besoins particuliers/ }));
    fireEvent.click(screen.getByLabelText(/^Dyscalculie/));

    expect(onChange).toHaveBeenCalledWith({ besoins: ['DYSCALCULIE'], ecranAdapte: true });
    expect(screen.getByText(/En cochant, tu acceptes/)).toBeInTheDocument();
  });

  test('ouvertes quand une case est cochée ; l’écran adapté ne se propose qu’alors', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <ChoixBesoins valeur={{ besoins: ['TDAH'], ecranAdapte: true }} onChange={onChange} />,
    );

    expect(screen.getByLabelText(/TDAH/)).toBeChecked();
    fireEvent.click(screen.getByLabelText(/Adapter aussi l’affichage/));
    expect(onChange).toHaveBeenCalledWith({ besoins: ['TDAH'], ecranAdapte: false });

    rerender(<ChoixBesoins valeur={{ besoins: [], ecranAdapte: true }} onChange={onChange} />);
    expect(screen.queryByLabelText(/Adapter aussi l’affichage/)).not.toBeInTheDocument();
  });
});

describe('le formulaire d’ajout d’un enfant', () => {
  const remplirEtCreer = async () => {
    await screen.findByLabelText('Prénom');
    fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Lina' } });
    fireEvent.change(screen.getByLabelText('Nom de famille'), { target: { value: 'Diallo' } });
    fireEvent.change(screen.getByLabelText('Classe'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Créer le profil' }));
  };

  test('module allumé : les cases partent avec le profil', async () => {
    render(<FormulaireEleve />);
    fireEvent.click(await screen.findByRole('button', { name: /Besoins particuliers/ }));
    fireEvent.click(screen.getByLabelText(/Dyslexie/));
    await remplirEtCreer();

    expect(mockEnvoi).toMatchObject({ besoinsParticuliers: ['DYSLEXIE'], ecranAdapte: true });
  });

  test('module éteint : ni rubrique, ni champ envoyé', async () => {
    mockModule = false;
    render(<FormulaireEleve />);
    await remplirEtCreer();

    expect(screen.queryByRole('button', { name: /Besoins particuliers/ })).not.toBeInTheDocument();
    expect(mockEnvoi).not.toHaveProperty('besoinsParticuliers');
    expect(mockEnvoi).not.toHaveProperty('ecranAdapte');
  });
});

describe('« Conseillé pour toi »', () => {
  test('sur la séance courte quand l’élève a besoin de calme, sans retirer les autres', () => {
    render(<ChoixDuree matiere={{ profPrenom: 'Nora' }} onValider={() => {}} onAnnuler={() => {}} calme />);

    expect(screen.getAllByText('Conseillé pour toi')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /Conseillé pour toi/ })).toHaveTextContent('15');
    expect(screen.getAllByRole('button').length).toBeGreaterThan(2);
  });

  test('nulle part sinon', () => {
    render(<ChoixDuree matiere={{ profPrenom: 'Nora' }} onValider={() => {}} onAnnuler={() => {}} />);
    expect(screen.queryByText('Conseillé pour toi')).not.toBeInTheDocument();
  });
});

describe('la politique de confidentialité', () => {
  test('dit ce qui est fait des besoins particuliers, et sur quelle base', () => {
    render(<Confidentialite />);

    expect(screen.getByRole('heading', { name: 'Les besoins particuliers de votre enfant' })).toBeInTheDocument();
    expect(screen.getByText(/Cocher vaut accord explicite/)).toBeInTheDocument();
    expect(screen.getByText(/consentement explicite du parent/)).toBeInTheDocument();
    expect(screen.getByText('Besoins particuliers et date de votre accord')).toBeInTheDocument();
  });
});
