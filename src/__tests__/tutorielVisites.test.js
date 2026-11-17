/* eslint-disable testing-library/no-node-access -- le tutoriel vise les éléments par leur repère. */
/**
 * LA VISITE DES PORTES — Camara, le 08/11/2026 : « rentre dans chacun des boutons et
 * montre ce qu'il faut ». Trois points ne doivent pas céder : chaque étape trouve ce
 * qu'elle éclaire, aucune n'appelle le serveur, et « Précédent » retrouve le bon écran.
 */
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import Tutoriel from '../components/tutoriel/Tutoriel';
import VisiteDemonstration from '../components/tutoriel/VisiteDemonstration';
import { ETAPES, apresLaPartie, partieDe } from '../lib/tutoriel/etapes';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({}),
  useNavigate: () => () => {},
  useLocation: () => ({ hash: '', pathname: '/' }),
  useSearchParams: () => [new URLSearchParams()],
}));

jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => null,
  fermerSessionEleve: () => {},
  jetonEleve: () => null,
}));

const VISITES = ETAPES.filter((e) => e.scene && e.scene !== 'cours');
const titre = (texte) => screen.findByText(texte, { selector: '.tuto__titre' }, { timeout: 4000 });

beforeEach(() => {
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.getBoundingClientRect = () => ({
    top: 100, bottom: 200, left: 10, right: 110, width: 100, height: 100,
  });
});

describe('les étapes des visites', () => {
  test('les cinq portes ont leur visite', () => {
    expect([...new Set(VISITES.map((e) => e.scene))]).toEqual(['carte', 'calendrier', 'fiches', 'podcasts', 'jeux']);
    VISITES.forEach((e) => {
      expect(e.si).toBe(`[data-tuto="${e.scene}"]`);
      expect(e.optionnelle).toBe(true);
    });
  });

  test('ce que Camara a demandé est bien montré', () => {
    const ids = ETAPES.map((e) => e.id);
    [
      'cal-coche', 'cal-evaluation', 'cal-controle', 'cal-jour', 'cal-ajouter', 'cal-dictee', 'cal-cours',
      'jeux-frise', 'jeux-defi',
      'fiches-mode', 'fiches-import', 'fiches-libre', 'fiches-feuille',
      'carte-question', 'carte-reponse', 'quiz',
      // Les podcasts (Camara, le 16/11/2026).
      'podcasts', 'podcasts-mode', 'podcasts-episodes', 'podcasts-lecteur', 'podcasts-tout',
    ].forEach((id) => expect(ids).toContain(id));
  });

  test('le parent est vouvoyé dans toutes les bulles', () => {
    VISITES.forEach((e) => {
      expect(`${e.titre} ${e.texte}`).not.toMatch(/(?<!\p{L})(tu|ton|ta|tes|toi)(?!\p{L})/iu);
    });
  });

  test('le bouton de la bulle garde un libellé court : les boutons ne bougent pas', () => {
    const libelles = new Set(ETAPES.map((e) => e.suivant ?? 'Suivant'));
    expect([...libelles].sort()).toEqual(['Commencer', 'Entrer', 'Suivant', 'Terminer']);
  });

  test('les identifiants ne se répètent pas', () => {
    const ids = ETAPES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test.each(VISITES.map((e) => [e.id, e]))('%s : sa cible est à l’écran', (_id, etape) => {
    // Les escape games commencent au collège : au primaire, leur étape se saute.
    render(<VisiteDemonstration scene={etape.scene} vue={etape.vue} classe="TROISIEME" />);
    expect(document.querySelector(etape.cible)).toBeInTheDocument();
  });

  test.each(['CP', 'CE2', 'TROISIEME', 'PREMIERE_STMG', 'TERMINALE'])('les écrans tiennent en %s', (classe) => {
    VISITES.forEach((e) => {
      const { unmount } = render(<VisiteDemonstration scene={e.scene} vue={e.vue} classe={classe} />);
      expect(document.querySelector('[data-tuto-visite]')).toBeInTheDocument();
      unmount();
    });
  });

  test('au CP, le défi n’existe pas : le choix du mode n’est pas montré', () => {
    render(<VisiteDemonstration scene="jeux" vue="modes" classe="CP" />);
    expect(document.querySelector('[data-tuto="demo-jeux-defi"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-tuto="demo-jeux-frise"]')).toBeInTheDocument();
  });

  test('aucun écran n’appelle le serveur', () => {
    const fetch = jest.fn();
    global.fetch = fetch;
    const envoi = jest.spyOn(XMLHttpRequest.prototype, 'send');

    VISITES.forEach((e) => {
      const { unmount } = render(<VisiteDemonstration scene={e.scene} vue={e.vue} classe="CM1" />);
      unmount();
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(envoi).not.toHaveBeenCalled();
    envoi.mockRestore();
  });

  test('aucun lien ne quitte la page du tutoriel', () => {
    VISITES.forEach((e) => {
      const { unmount } = render(<VisiteDemonstration scene={e.scene} vue={e.vue} classe="CM1" />);
      expect(document.querySelector('.tuto-visite a')).not.toBeInTheDocument();
      unmount();
    });
  });

  test('le mot « exemple » reste à l’écran', () => {
    render(<VisiteDemonstration scene="calendrier" classe="CM1" />);
    expect(screen.getByText(/un exemple, pas les données de votre enfant/)).toBeInTheDocument();
  });
});

describe('« Passer l’étape »', () => {
  const rang = (id) => ETAPES.findIndex((e) => e.id === id);
  const idApres = (id) => ETAPES[apresLaPartie(rang(id))]?.id;

  test('il saute la porte et toute sa visite, depuis n’importe où', () => {
    expect(idApres('carte')).toBe('calendrier');
    expect(idApres('carte-etats')).toBe('calendrier');
    expect(idApres('calendrier')).toBe('fiches');
    expect(idApres('cal-coche')).toBe('fiches');
    expect(idApres('cal-cours')).toBe('fiches');
    expect(idApres('jeux-frise')).toBe('conseillere');
    expect(idApres('jeux-defi')).toBe('conseillere');
    expect(idApres('quiz')).toBe('podcasts');
    expect(idApres('podcasts')).toBe('jeux');
    expect(idApres('podcasts-lecteur')).toBe('jeux');
  });

  test('il saute tout le cours, du professeur à la sortie', () => {
    expect(idApres('professeur')).toBe('controles');
    expect(idApres('casque-choix')).toBe('controles');
    expect(idApres('tableau')).toBe('controles');
    expect(idApres('quitter')).toBe('controles');
  });

  test('une bulle seule n’a rien à sauter : « Suivant » suffit', () => {
    ['bienvenue', 'micro', 'conseillere', 'controles', 'examen', 'bouton'].forEach((id) => {
      expect(partieDe(rang(id))).toBeNull();
      expect(apresLaPartie(rang(id))).toBeNull();
    });
  });

  test('dans la bulle : présent dans une partie, absent ailleurs', async () => {
    render(
      <>
        <a href="/x" data-tuto="carte">carte</a>
        <a href="/x" data-tuto="calendrier">calendrier</a>
        <VisiteDemonstration scene="carte" classe="CM1" />
        <Tutoriel onFin={() => {}} />
      </>,
    );
    const bouton = () => screen.queryByRole('button', { name: 'Passer l’étape' });

    expect(bouton()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }));
    await titre('D’abord, le micro');
    expect(bouton()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await titre('Ma carte');

    fireEvent.click(screen.getByRole('button', { name: 'Entrer' }));
    await titre('Le chiffre à regarder');
    fireEvent.click(bouton());
    await titre('Mon calendrier');

    // « Précédent » ramène là où on a sauté, pas au début de la partie.
    fireEvent.click(screen.getByRole('button', { name: 'Précédent' }));
    expect(await titre('Le chiffre à regarder')).toBeInTheDocument();
  }, 20000);
});

describe('le tutoriel et ses visites', () => {
  // Une page qui n'a que cette porte, et l'écran qu'il demande.
  function Page({ porte, onScene }) {
    return (
      <>
        <a href="/x" data-tuto={porte}>{porte}</a>
        <Tutoriel onScene={onScene} onFin={() => {}} />
      </>
    );
  }

  test('une porte absente : toute sa visite se saute, sans écran de démonstration', async () => {
    const onScene = jest.fn();
    render(<Page porte="carte" onScene={onScene} />);

    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }));
    await titre('D’abord, le micro');
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await titre('Ma carte');
    fireEvent.click(screen.getByRole('button', { name: 'Entrer' }));

    await waitFor(() => expect(onScene).toHaveBeenCalledWith('carte', null));
    const scenes = () => onScene.mock.calls.map(([nom]) => nom);
    expect(scenes()).not.toContain('calendrier');
    expect(scenes()).not.toContain('jeux');
    expect(scenes()).not.toContain('fiches');
  }, 20000);

  test('entrer, puis « Précédent » : l’écran suit, dans les deux sens', async () => {
    const onScene = jest.fn();

    function AvecEcran() {
      return (
        <>
          <a href="/x" data-tuto="carte">carte</a>
          <VisiteDemonstration scene="carte" classe="CM1" />
          <Tutoriel onScene={onScene} onFin={() => {}} />
        </>
      );
    }

    render(<AvecEcran />);
    fireEvent.click(screen.getByRole('button', { name: 'Commencer' }));
    await titre('D’abord, le micro');
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await titre('Ma carte');
    fireEvent.click(screen.getByRole('button', { name: 'Entrer' }));

    await titre('Le chiffre à regarder');
    expect(onScene).toHaveBeenLastCalledWith('carte', null);

    fireEvent.click(screen.getByRole('button', { name: 'Précédent' }));
    await titre('Ma carte');
    expect(onScene).toHaveBeenLastCalledWith(null, null);
  }, 20000);
});
