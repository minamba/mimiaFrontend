/**
 * LE BANDEAU DE COOKIES, ET CE QU'IL AUTORISE — Camara, le 23/09/2026.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Trois règles qui ne se voient pas à l'écran, et qui coûtent cher le jour où
 * elles cèdent :
 *
 *   1. CLARITY NE SE CHARGE QUE SUR UN « OUI » EXPLICITE. Ne pas avoir répondu
 *      n'est pas accepter. Un script posé d'avance « en veille » dépose déjà
 *      ses cookies — c'est exactement ce que la règle interdit.
 *
 *   2. RIEN NE SE MESURE DANS L'ESPACE CONNECTÉ. Ce n'est pas une précaution
 *      de forme : Clarity enregistrerait le fil de discussion d'un enfant, son
 *      tableau, ses copies et son prénom. Le jour où quelqu'un déplace le
 *      bandeau « pour qu'il se voie partout », ce test doit tomber.
 *
 *   3. REFUSER EST AUSSI FACILE QU'ACCEPTER. Deux boutons de même taille, le
 *      refus atteint en premier au clavier. C'est la règle de la CNIL, et elle
 *      se perd au premier « on met Accepter en avant ».
 *
 * `clarity.js` est simulé : sans identifiant (`REACT_APP_CLARITY_ID`), le vrai
 * module se tait, ce qui rendrait ces tests verts sans rien prouver.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BandeauCookies from '../components/BandeauCookies';
import {
  ACCEPTE, REFUSE, consentement, definirConsentement, oublierConsentement,
} from '../lib/storage/consentement';

const mockCharger = jest.fn();
const mockRefuser = jest.fn();
let mockConfigure = true;
let mockChemin = '/';

// Convention de la maison : le routeur est simulé, pas monté.
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockChemin }),
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

jest.mock('../lib/analytics/clarity', () => ({
  clarityConfigure: () => mockConfigure,
  chargerClarity: (...args) => mockCharger(...args),
  refuserClarity: (...args) => mockRefuser(...args),
}));

function afficher(chemin = '/') {
  mockChemin = chemin;
  return render(<BandeauCookies />);
}

beforeEach(() => {
  localStorage.clear();
  mockCharger.mockClear();
  mockRefuser.mockClear();
  mockConfigure = true;
});

describe('le choix, dans le stockage local', () => {
  test('n’existe pas tant que le visiteur n’a pas répondu', () => {
    expect(consentement()).toBeNull();
  });

  test('survit au rechargement de la page', () => {
    definirConsentement(ACCEPTE);
    expect(consentement()).toBe(ACCEPTE);

    definirConsentement(REFUSE);
    expect(consentement()).toBe(REFUSE);
  });

  test('se rouvre, pour revenir sur un accord donné plus tôt', () => {
    definirConsentement(ACCEPTE);
    oublierConsentement();
    expect(consentement()).toBeNull();
  });

  test('ignore une valeur inconnue plutôt que de la croire', () => {
    // Un stockage bricolé à la main, ou une ancienne clé : dans le doute, on
    // repose la question. Supposer un accord qu'on ne comprend pas, jamais.
    localStorage.setItem('mimia-consentement', 'peut-etre');
    expect(consentement()).toBeNull();
  });
});

describe('le bandeau', () => {
  test('demande son avis au visiteur qui n’a pas encore répondu', () => {
    afficher('/');

    expect(screen.getByRole('button', { name: /accepter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refuser/i })).toBeInTheDocument();
  });

  test('ne charge RIEN tant que personne n’a répondu', () => {
    afficher('/');
    expect(mockCharger).not.toHaveBeenCalled();
  });

  test('offre le refus aussi visiblement que l’accord', () => {
    afficher('/');

    const boutons = screen.getAllByRole('button');
    expect(boutons).toHaveLength(2);

    // Le refus vient EN PREMIER dans le document : il est donc atteint en
    // premier au clavier, et les deux portent la même classe de gabarit.
    expect(boutons[0]).toHaveTextContent(/refuser/i);
    boutons.forEach((bouton) => expect(bouton).toHaveClass('cookies__bouton'));
  });

  test('charge la mesure une fois, et une seule, après « Accepter »', async () => {
    afficher('/');

    await userEvent.click(screen.getByRole('button', { name: /accepter/i }));

    expect(consentement()).toBe(ACCEPTE);
    expect(mockCharger).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /accepter/i })).not.toBeInTheDocument();
  });

  test('ne charge jamais rien après « Refuser », et efface ce qui traînait', async () => {
    afficher('/');

    await userEvent.click(screen.getByRole('button', { name: /refuser/i }));

    expect(consentement()).toBe(REFUSE);
    expect(mockCharger).not.toHaveBeenCalled();
    expect(mockRefuser).toHaveBeenCalled();
  });

  test('se tait, mais charge, pour le visiteur qui avait déjà accepté', () => {
    definirConsentement(ACCEPTE);
    afficher('/tarifs');

    // Sans ça, Clarity ne tournerait qu'à la visite où la question a été
    // posée : une fois dans la vie du visiteur.
    expect(mockCharger).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('se tait, et ne charge pas, pour celui qui avait refusé', () => {
    definirConsentement(REFUSE);
    afficher('/');

    expect(mockCharger).not.toHaveBeenCalled();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('n’existe pas dans l’espace connecté — ni la question, ni la mesure', () => {
    ['/eleves', '/eleves/12/matieres/3/chat', '/profil', '/admin'].forEach((chemin) => {
      localStorage.clear();
      mockCharger.mockClear();

      const { unmount } = afficher(chemin);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(mockCharger).not.toHaveBeenCalled();

      unmount();
    });
  });

  test('ne charge pas non plus dans l’espace connecté pour qui a accepté dehors', () => {
    definirConsentement(ACCEPTE);
    afficher('/eleves/12/matieres/3/chat');

    expect(mockCharger).not.toHaveBeenCalled();
  });

  test('ne demande rien en production tant que le projet Clarity n’existe pas', () => {
    // `REACT_APP_CLARITY_ID` vide : poser la question sans rien derrière
    // serait absurde. En développement c'est l'inverse — le bandeau s'affiche
    // pour être jugé, et rien ne se charge ; ce cas-là n'est pas simulable
    // ici, `NODE_ENV` vaut « test » sous Jest.
    mockConfigure = false;
    afficher('/');

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
