/* eslint-disable testing-library/no-container, testing-library/no-node-access -- classes de mise en page, sans rôle accessible à interroger */
/**
 * LA VUE ILLUSTRÉE AUSSI POUR LE PARENT — Camara, le 16/11/2026 : « pour la vue parent, quand il rentre dans le cours
 * d'un enfant, je veux la même vue que pour la vue enfant, je parle des nouveautés visuelles ».
 *
 * CE QUI SE TESTE ICI
 * 1. `vueIllustree` : vraie pour l'enfant connecté, et pour quiconque dans l'espace d'un enfant (/eleves/<id>/…) ;
 *    fausse dans l'espace parent, l'administration et ailleurs.
 * 2. Le parent, sans session d'enfant, sur /eleves/7/… : le calendrier et « Ma carte » prennent la vue illustrée.
 * 3. Le parent dans son espace (/espace-parent/…) : rien ne change.
 */
import { render, screen } from '@testing-library/react';
import { vueIllustree } from '../lib/vueIllustree';
import CalendrierEleve from '../components/CalendrierEleve';
import Progression from '../components/Progression';
import { getProgression } from '../lib/api/elevesApi';

let mockEnfant = null;
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => mockEnfant }));
jest.mock('react-router-dom', () => ({
  useParams: () => ({ eleveId: '7' }),
  useNavigate: () => jest.fn(),
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));
jest.mock('../lib/api/elevesApi', () => ({ getProgression: jest.fn(), getCalendrier: jest.fn() }));
jest.mock('../components/CalendrierContenu', () => ({ CalendrierContenu: () => null }));

const aller = (chemin) => window.history.pushState({}, '', chemin);

beforeEach(() => {
  mockEnfant = null;
  getProgression.mockResolvedValue({
    data: { acquises: 0, total: 0, acquisesAutresAnnees: 0, nouvelles: [], niveau: '3e', matieres: [] },
  });
});

afterAll(() => aller('/'));

describe('vueIllustree', () => {
  it('l’enfant connecté : toujours', () => {
    mockEnfant = { eleveId: 7 };
    expect(vueIllustree('/tarifs')).toBe(true);
  });

  it('le parent : dans l’espace d’un enfant seulement', () => {
    expect(vueIllustree('/eleves/7/matieres')).toBe(true);
    expect(vueIllustree('/eleves/7/calendrier')).toBe(true);
    expect(vueIllustree('/eleves/7')).toBe(true);
    expect(vueIllustree('/eleves')).toBe(false);
    expect(vueIllustree('/espace-parent/fiches')).toBe(false);
    expect(vueIllustree('/admin')).toBe(false);
    expect(vueIllustree('/')).toBe(false);
  });
});

describe('le parent dans l’espace de son enfant', () => {
  it('le calendrier prend la vue illustrée', () => {
    aller('/eleves/7/calendrier');
    const { container } = render(<CalendrierEleve />);
    expect(container.querySelector('.page-decor-enfant.cal-illu')).not.toBeNull();
    expect(container.querySelector('.cal-illu__banniere')).not.toBeNull();
  });

  it('« Ma carte » aussi', async () => {
    aller('/eleves/7/progression');
    const { container } = render(<Progression />);
    await screen.findByRole('heading', { name: 'Ma carte' });
    expect(container.querySelector('.page-decor-enfant.carte-illustree')).not.toBeNull();
  });
});

describe('hors de l’espace d’un enfant, rien ne change', () => {
  it('le calendrier garde l’ancienne vue', () => {
    aller('/espace-parent/fiches');
    const { container } = render(<CalendrierEleve />);
    expect(container.querySelector('.cal-illu')).toBeNull();
    expect(container.querySelector('.bandeau-page')).not.toBeNull();
  });
});
