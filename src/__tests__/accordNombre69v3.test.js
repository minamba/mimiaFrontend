/**
 * SIGNALEMENT #69 v3 (23/11/2026) — accord avec le nombre, suite des retours d'Omar sur 3ee7251.
 *
 * 1. Page des tarifs : le bandeau de l'essai écrivait « à utiliser dans les ${joursValidite} jours », donc
 *    « dans les 1 jours » si le réglage valait 1. Le serveur fixe la fin à début + 1 jour (`AddDays`) : « sous 24 heures ».
 *    Monté sur le VRAI composant `Tarifs`, avec n = 0, 1, 2 et 7.
 * 2. Recherche des jumeaux :
 *    - nombre CALCULÉ suivi d'une unité au pluriel :
 *      liste des enfants, « Il y a ${Math.floor(jours / 7)} semaines » = « Il y a 1 semaines » de 7 à 13 jours ;
 *      jauge de la séance (lecteur d'écran), « Il reste ${Math.ceil(restant / 60)} minutes » = « Il reste 1 minutes » ;
 *    - « leurs » dans un composant qui connaît le nombre :
 *      forfait en résiliation, « vos enfants gardent leurs cours » avec un seul enfant ;
 *      administration, import de schémas, « 1 sans leur paire ».
 *
 * (La modale de suppression du compte, point 1 d'Omar, est testée dans accordNombre69v2.test.js.)
 */

import { fireEvent, render, screen } from '@testing-library/react';
import Tarifs from '../components/Tarifs';
import Quota from '../components/Quota';
import ImportDossierPlanches from '../components/ImportDossierPlanches';
import { derniereFois } from '../components/ListeEleves';
import { libelleTempsRestant } from '../components/Chat';
import { getMonQuota, getOffres } from '../lib/api/abonnementApi';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir({ auth: { authentifie: false } }),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ hash: '', pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock('../lib/api/abonnementApi', () => ({
  getOffres: jest.fn(),
  getMonQuota: jest.fn(),
  souscrire: jest.fn(),
}));

jest.mock('../lib/api/adminApi', () => ({ importerPlanche: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  // Tarifs lit l'abonnement en cours ; visiteur non connecté = rien.
  getMonQuota.mockResolvedValue({ status: 204, data: null });
});

jest.mock('../lib/storage/modeTest', () => {
  const reel = jest.requireActual('../lib/storage/modeTest');
  return {
    ...reel,
    useEssaisOuverts: () => true,
    useOffreLancement: () => ({ active: false, heures: 0, formules: [] }),
    useFichesRevision: () => false,
    useDesJeuxOuverts: () => false,
    useConseillereOrientation: () => false,
    usePodcasts: () => false,
  };
});

const ESSAI = { code: 'ESSAI', libelle: 'Essai', estEssai: true, heuresPot: 0.5, nombreEnfantsMax: 1, prix: 0 };
const SOLO = { code: 'SOLO', libelle: 'Solo', estEssai: false, heuresPot: 9, nombreEnfantsMax: 1, heuresPlafondEnfant: 9, prix: 49 };

const ouvrirTarifs = async (joursValidite) => {
  getOffres.mockResolvedValue({ data: { formules: [{ ...ESSAI, joursValidite }, SOLO], recharges: [] } });
  render(<Tarifs />);
  return screen.findByText(/à utiliser/);
};

/* ------------------------------------------------------------------------------------------------------------------
 * 1. Le bandeau de l'essai (Tarifs.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('tarifs : le délai de l’essai', () => {
  test('un jour : « sous 24 heures », jamais « dans les 1 jours »', async () => {
    const phrase = await ouvrirTarifs(1);
    expect(phrase).toHaveTextContent('à utiliser sous 24 heures, sans carte bancaire.');
    expect(screen.queryByText(/les 1 jours?/)).not.toBeInTheDocument();
  });

  test('deux jours : « dans les 2 jours »', async () => {
    const phrase = await ouvrirTarifs(2);
    expect(phrase).toHaveTextContent('à utiliser dans les 2 jours, sans carte bancaire.');
  });

  test('sept jours : « dans les 7 jours »', async () => {
    const phrase = await ouvrirTarifs(7);
    expect(phrase).toHaveTextContent('à utiliser dans les 7 jours, sans carte bancaire.');
  });

  test('aucun délai (réglage actuel, 0) : « sans date limite »', async () => {
    const phrase = await ouvrirTarifs(0);
    expect(phrase).toHaveTextContent('à utiliser quand vous voulez, sans date limite et sans carte bancaire.');
    expect(screen.queryByText(/les 0 jours?/)).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 2. Liste des enfants : « Travaillé il y a … » (ListeEleves.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('liste des enfants : l’ancienneté du dernier travail', () => {
  const ilYa = (jours) => new Date(Date.now() - jours * 86400000 - 3600000).toISOString();

  test('7 et 13 jours : « Il y a 1 semaine », jamais « 1 semaines »', () => {
    expect(derniereFois(ilYa(7)).texte).toBe('Il y a 1 semaine');
    expect(derniereFois(ilYa(13)).texte).toBe('Il y a 1 semaine');
  });

  test('14 jours : « Il y a 2 semaines »', () => {
    expect(derniereFois(ilYa(14)).texte).toBe('Il y a 2 semaines');
  });

  test('les autres paliers ne bougent pas', () => {
    expect(derniereFois(ilYa(0)).texte).toBe("Travaillé aujourd'hui");
    expect(derniereFois(ilYa(1)).texte).toBe('Travaillé hier');
    expect(derniereFois(ilYa(2)).texte).toBe('Il y a 2 jours');
    expect(derniereFois(ilYa(7)).etat).toBe('tiede');
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 2 bis. Forfait, résiliation demandée : « vos enfants gardent leurs cours » avec un seul enfant (Quota.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('forfait : la résiliation demandée', () => {
  const ENFANT = (id) => ({ eleveId: id, prenom: `Enfant ${id}`, partConsommee: 0, minutesConsommees: 0, minutesPlafond: 600 });
  const ouvrirForfait = async (nombreEnfants) => {
    getMonQuota.mockResolvedValue({
      status: 200,
      data: {
        offreLibelle: 'Solo',
        offreCode: 'SOLO',
        minutesAllouees: 540,
        minutesConsommees: 60,
        minutesRestantes: 480,
        minutesRecharge: 0,
        partConsommee: 0.1,
        periodeFin: '2026-12-20T00:00:00Z',
        finPrevue: '2026-12-20T00:00:00Z',
        resiliationDemandee: true,
        nombreEnfantsMax: 4,
        enfants: Array.from({ length: nombreEnfants }, (_, i) => ENFANT(i + 1)),
      },
    });
    getOffres.mockResolvedValue({ data: { formules: [], recharges: [] } });
    render(<Quota />);
    return (await screen.findByText(/rien ne change/)).textContent;
  };

  test('un enfant : « votre enfant garde ses cours », jamais « leurs »', async () => {
    const texte = await ouvrirForfait(1);
    // Espace insécable avant « : », comme en ligne (&nbsp;) : \u00a0 écrit en clair (#69 v4).
    expect(texte).toContain("D'ici là, rien ne change\u00a0: votre enfant garde ses cours et vos heures restantes.");
    expect(texte).not.toContain('rien ne change :');
    expect(texte).not.toMatch(/\bleurs?\b/);
  });

  test('deux enfants : « vos enfants gardent leurs cours »', async () => {
    const texte = await ouvrirForfait(2);
    // Espace insécable avant « : », comme en ligne (&nbsp;) : \u00a0 écrit en clair (#69 v4).
    expect(texte).toContain("D'ici là, rien ne change\u00a0: vos enfants gardent leurs cours et vos heures restantes.");
    expect(texte).not.toContain('rien ne change :');
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 2 ter. Administration, import d'un dossier de schémas : « 1 sans leur paire » (ImportDossierPlanches.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('administration : schémas sans leur paire', () => {
  const FIGURES = [
    { cle: 'svt-respiratoire', titre: 'Appareil respiratoire', niveau: '5e' },
    { cle: 'svt-digestif', titre: 'Appareil digestif', niveau: '5e' },
  ];
  const fichier = (chemin) => {
    const f = new File(['x'], chemin.split('/').pop(), { type: 'image/png' });
    Object.defineProperty(f, 'webkitRelativePath', { value: chemin });
    return f;
  };
  const bilan = (fichiers) => {
    render(<ImportDossierPlanches figures={FIGURES} matiereDeLaCle={() => ({ code: 'SVT' })} importees={[]} onTermine={jest.fn()} />);
    fireEvent.change(screen.getByTestId('dossier-planches'), { target: { files: fichiers } });
    return screen.getByText(/sans (leur|sa) paire/).closest('li').textContent;
  };

  test('un seul schéma incomplet : « 1 sans sa paire »', () => {
    expect(bilan([fichier('schemas/5e/SVT/svt-respiratoire.png')])).toMatch(/^1 sans sa paire : svt-respiratoire/);
  });

  test('deux schémas incomplets : « 2 sans leur paire »', () => {
    expect(bilan([fichier('schemas/5e/SVT/svt-respiratoire.png'), fichier('schemas/5e/SVT/svt-digestif-muette.png')]))
      .toMatch(/^2 sans leur paire : /);
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 3. Jauge de la séance, annoncée au lecteur d'écran (Chat.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('séance : le temps restant annoncé', () => {
  test('dernière minute : « Il reste 1 minute de séance », jamais « 1 minutes »', () => {
    expect(libelleTempsRestant(60)).toBe('Il reste 1 minute de séance');
    expect(libelleTempsRestant(1)).toBe('Il reste 1 minute de séance');
  });

  test('deux minutes : « Il reste 2 minutes de séance » (61 s arrondies au-dessus, comme avant)', () => {
    expect(libelleTempsRestant(61)).toBe('Il reste 2 minutes de séance');
    expect(libelleTempsRestant(120)).toBe('Il reste 2 minutes de séance');
  });
});
