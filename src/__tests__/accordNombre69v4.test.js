/**
 * SIGNALEMENT #69 v4 (23/11/2026) — accord avec le nombre, suite des retours d'Omar sur a02d8f6.
 *
 * Points 2 et 3 d'Omar, montés sur les VRAIS composants :
 *  - ExpressionsEcrites : « 14 mots » écrivait « 1 mots » pour un texte d'un mot ;
 *  - ExpressionsOrales : « · 3 messages » écrivait « · 1 messages ».
 * Point 5 (recherche élargie `${n} <nom>s` et `.concat(X," <nom>s")`) : les jumeaux trouvés, chacun avec n = 0, 1, 2 :
 *  - durée de séance (1 minute existe), notions d'un cours, catégorie d'un seul cours, « … et 1 autre » (compétences,
 *    schémas), chrono et points de « Me tester », heures utilisées / rechargées / offertes, minuteurs et sommes des jeux,
 *    « lieux trouvés » (et non « lieus »), statistiques d'administration.
 * (Le point 4, espace insécable du forfait, est dans accordNombre69v3.test.js.)
 */

/* eslint-disable testing-library/no-node-access, testing-library/no-container */
import { fireEvent, render, screen } from '@testing-library/react';
import { accord, nombreEt, plurielDesMots, secondesRestantes } from '../lib/accord';
import ExpressionsEcrites, { resume } from '../components/ExpressionsEcrites';
import ExpressionsOrales from '../components/ExpressionsOrales';
import ImportDossierPlanches from '../components/ImportDossierPlanches';
import { accordDuree, heures } from '../components/Quota';
import { premierMois } from '../components/Tarifs';
import { libelleDureeSeance } from '../components/Chat';
import { suiteSuppressionCategorie } from '../components/mesFiches/GestionCategories';
import { BoiteAOeufs } from '../components/jeux/Oeufs';
import { alveoles } from '../lib/jeux/boiteDeDix';
import * as api from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi');
jest.mock('../lib/api/adminApi', () => ({ importerPlanche: jest.fn() }));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '1', matiereId: '7' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ hash: '', pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock('react-redux', () => ({
  useDispatch: () => () => {},
  useSelector: (selecteur) => selecteur({
    auth: { authentifie: false },
    referentiel: {
      matieres: [{ id: 7, libelle: 'Anglais', profPrenom: 'Marine', profCouleur: '#149e93', profAvatar: 'marine' }],
    },
    eleves: { liste: [{ id: 1, prenom: 'Bilal' }] },
  }),
}));

jest.mock('../lib/actions/referentielActions', () => ({ chargerReferentiel: () => ({ type: 't' }) }));
jest.mock('../lib/actions/elevesActions', () => ({ chargerEleves: () => ({ type: 't' }) }));

/* ------------------------------------------------------------------------------------------------------------------
 * L'outil commun : le pluriel commence à 2
 * ---------------------------------------------------------------------------------------------------------------- */
describe('outil commun lib/accord', () => {
  test('0, 1 et 1,5 au singulier ; 2 au pluriel', () => {
    expect(accord(0, 'mot')).toBe('mot');
    expect(accord(1, 'mot')).toBe('mot');
    expect(accord(1.5, 'heure')).toBe('heure');
    expect(accord(2, 'mot')).toBe('mots');
    expect(accord(2, 'jeton audio facturé', 'jetons audio facturés')).toBe('jetons audio facturés');
    expect(nombreEt(1, 'minute')).toBe('1 minute');
    expect(nombreEt(2, 'minute')).toBe('2 minutes');
    expect(nombreEt(1, 'euro')).toBe('1 euro');
    expect(nombreEt(3, 'case')).toBe('3 cases');
  });

  test('minuteur des jeux : « 1 seconde » dans la dernière seconde', () => {
    expect(secondesRestantes(900)).toBe('1 seconde');
    expect(secondesRestantes(1000)).toBe('1 seconde');
    expect(secondesRestantes(1001)).toBe('2 secondes');
    expect(secondesRestantes(0)).toBe('0 seconde');
  });

  test('unités des jeux bonus : « lieux trouvés », jamais « lieus trouvés »', () => {
    expect(plurielDesMots('lieu trouvé')).toBe('lieux trouvés');
    expect(plurielDesMots('mot trouvé')).toBe('mots trouvés');
    expect(plurielDesMots('partie gagnée')).toBe('parties gagnées');
    expect(plurielDesMots('dossier résolu')).toBe('dossiers résolus');
    expect(plurielDesMots('pièce placée')).toBe('pièces placées');
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * Point 2 d'Omar : ExpressionsEcrites, « 1 mots »
 * ---------------------------------------------------------------------------------------------------------------- */
describe('expression écrite : le nombre de mots', () => {
  const TEXTE = (nombreMots) => ({ transcrit: true, nombreMots, nombreReprises: 0 });

  test('n = 0, 1, 2 dans le résumé', () => {
    expect(resume(TEXTE(0))).toBe('');
    expect(resume(TEXTE(1))).toBe('1 mot');
    expect(resume(TEXTE(2))).toBe('2 mots');
  });

  test('vraie liste : un texte d\'un seul mot affiche « 1 mot »', async () => {
    api.getExpressionsEcrites.mockResolvedValue({
      data: [{ id: 5, titre: 'Un mot', dateCreation: '2026-11-20T10:00:00Z', transcrit: true, nombreMots: 1, nombreReprises: 0 }],
    });
    render(<ExpressionsEcrites />);
    expect(await screen.findByText('Un mot')).toBeInTheDocument();
    expect(screen.getByText(/\b1 mot\b/)).toBeInTheDocument();
    expect(screen.queryByText(/\b1 mots\b/)).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * Point 3 d'Omar : ExpressionsOrales, « · 1 messages »
 * ---------------------------------------------------------------------------------------------------------------- */
describe('expression orale : le nombre de messages', () => {
  const liste = async (nombreTours) => {
    api.getExpressionsOrales.mockResolvedValue({
      data: [{ id: 9, titre: 'Ma conversation', dateCreation: '2026-11-20T10:00:00Z', nombreTours }],
    });
    const { container } = render(<ExpressionsOrales />);
    await screen.findByText('Ma conversation');
    return container.querySelector('.expr-ligne__detail').textContent;
  };

  test('1 message', async () => {
    const detail = await liste(1);
    expect(detail).toMatch(/ · 1 message$/);
  });

  test('2 messages', async () => {
    expect(await liste(2)).toMatch(/ · 2 messages$/);
  });

  test('0 : rien n\'est compté', async () => {
    expect(await liste(0)).not.toMatch(/message/);
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * Point 5 : les jumeaux trouvés par la recherche élargie
 * ---------------------------------------------------------------------------------------------------------------- */
describe('jumeaux de la recherche élargie', () => {
  test('séance : la durée de 1 minute (DUREES_VALIDES) se dit au singulier', () => {
    expect(libelleDureeSeance(1)).toBe('1 minute');
    expect(libelleDureeSeance(25)).toBe('25 minutes');
  });

  test('catégorie d\'un seul cours supprimée : « Son cours et ses fiches restent »', () => {
    expect(suiteSuppressionCategorie(0)).toBe('');
    expect(suiteSuppressionCategorie(1)).toBe('\n\nSon cours et ses fiches restent, « sans catégorie ».');
    expect(suiteSuppressionCategorie(2)).toBe('\n\nSes 2 cours et leurs fiches restent, « sans catégorie ».');
  });

  test('forfait : « 1 h utilisée », « 45 min utilisées », « 0 h utilisées » (inchangé)', () => {
    expect(`${heures(60)} ${accordDuree(60, 'utilisée')}`).toBe('1 h utilisée');
    expect(`${heures(90)} ${accordDuree(90, 'utilisée')}`).toBe('1 h 30 utilisée');
    expect(`${heures(1)} ${accordDuree(1, 'rechargée')}`).toBe('1 min rechargée');
    expect(`${heures(45)} ${accordDuree(45, 'utilisée')}`).toBe('45 min utilisées');
    expect(`${heures(120)} ${accordDuree(120, 'utilisée')}`).toBe('2 h utilisées');
    expect(`${heures(0)} ${accordDuree(0, 'utilisée')}`).toBe('0 h utilisées');
  });

  test('tarifs, offre de lancement : « (1 h offerte) », « (3 h offertes) »', () => {
    expect(premierMois(8, 1)).toBe('9 h le 1er mois (1 h offerte)');
    expect(premierMois(8, 1.5)).toBe('9,5 h le 1er mois (1,5 h offerte)');
    expect(premierMois(8, 3)).toBe('11 h le 1er mois (3 h offertes)');
    expect(premierMois(8, 0.5)).toBe('8,5 h le 1er mois (30 minutes offertes)');
  });

  test('jeu « La boîte de 10 » (trouvé par la recherche dans le bundle) : « Boîte de dix, 1 œuf »', () => {
    const boite = (depart) => {
      const { unmount } = render(<BoiteAOeufs cases={alveoles(depart, 0)} />);
      const nom = screen.getByRole('img').getAttribute('aria-label');
      unmount();
      return nom;
    };
    expect(boite(1)).toBe('Boîte de dix, 1 œuf');
    expect(boite(2)).toBe('Boîte de dix, 2 œufs');
    expect(boite(0)).toBe('Boîte de dix, 0 œuf');
  });

  describe('administration, import de schémas : « … et 1 autre »', () => {
    const fichier = (chemin) => {
      const f = new File(['x'], chemin.split('/').pop(), { type: 'image/png' });
      Object.defineProperty(f, 'webkitRelativePath', { value: chemin });
      return f;
    };
    const bilan = (nombre) => {
      render(<ImportDossierPlanches figures={[]} matiereDeLaCle={() => ({ code: 'SVT' })} importees={[]} onTermine={jest.fn()} />);
      const fichiers = Array.from({ length: nombre }, (_, i) => fichier(`schemas/5e/SVT/inconnu-${i + 1}.png`));
      fireEvent.change(screen.getByTestId('dossier-planches'), { target: { files: fichiers } });
      return screen.getByText(/sans emplacement au catalogue/).closest('li').textContent;
    };

    test('13 inconnus : « … et 1 autre »', () => {
      const texte = bilan(13);
      expect(texte).toMatch(/ … et 1 autre$/);
      expect(texte).not.toMatch(/1 autres/);
    });

    test('14 inconnus : « … et 2 autres »', () => {
      expect(bilan(14)).toMatch(/ … et 2 autres$/);
    });

    test('12 inconnus : pas de « … et »', () => {
      expect(bilan(12)).not.toMatch(/ … et /);
    });
  });
});
