/**
 * LE MODE DÉFI ET SES CŒURS — Camara, le 25/09/2026 : « mettre des vies sous
 * forme de cœurs… à chaque erreur l'enfant perd une vie ».
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 *   1. LE CP N'A PAS DE DÉFI, et l'écran du choix ne s'affiche même pas. À six
 *      ans, l'erreur est le matériau du cours et non un accident ; et un écran
 *      à une seule porte n'est pas un choix, c'est un obstacle.
 *
 *   2. RIEN NE CHANGE EN MODE TRANQUILLE. C'est la garantie qui compte le
 *      plus : les cœurs ont été posés dans vingt-trois jeux, et aucun enfant
 *      qui n'en veut pas ne doit en voir la trace.
 *
 *   3. LES CŒURS SE DÉDUISENT, ils ne se comptent pas. Une manche passée sans
 *      être réussie du premier coup vaut un cœur. C'est ce calcul qui a permis
 *      de ne toucher la logique d'aucun jeu — s'il change, les cœurs se
 *      décrochent de ce que l'enfant a vraiment fait.
 *
 *   4. À ZÉRO CŒUR, LE JEU S'ARRÊTE ET DEUX PORTES RESTENT OUVERTES — refaire
 *      le défi, ou redescendre en tranquille. La seconde est la sortie de
 *      secours de celui qui s'est surestimé : sans elle, il ne lui reste qu'à
 *      quitter les jeux.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Coeurs from '../components/jeux/Coeurs';
import ChoixDuMode from '../components/jeux/ChoixDuMode';
import FinDuDefi from '../components/jeux/FinDuDefi';
import { FournirJeu } from '../lib/jeux/contexteJeu';
import {
  DEFI, TRANQUILLE, COEURS_DEPART, coeursDeLaClasse, coeursRestants, defiPossible,
  suivreCoeurs,
} from '../lib/jeux/coeurs';
import { oublierRecords, enregistrer } from '../lib/jeux/record';

jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ eleveId: 'enfant-1' }),
}));

beforeEach(() => { oublierRecords(); });

const enJeu = (mode, coeursMax, props) => render(
  <FournirJeu value={{ jeuCle: 'horloge', niveau: 'CE1', mode, coeursMax, rejouerPartie: props?.rejouerPartie ?? (() => {}), terminerDefi: props?.terminerDefi }}>
    <Coeurs manche={props.manche} duPremierCoup={props.duPremierCoup} />
  </FournirJeu>,
);

describe('combien de cœurs, et pour qui', () => {
  test('le CP n’a pas de défi du tout', () => {
    expect(coeursDeLaClasse('CP')).toBe(0);
    expect(defiPossible('CP')).toBe(false);
  });

  test('le défi durcit en grandissant', () => {
    expect(coeursDeLaClasse('CE1')).toBe(5);
    expect(coeursDeLaClasse('CE2')).toBe(5);
    expect(coeursDeLaClasse('CM1')).toBe(4);
    expect(coeursDeLaClasse('CM2')).toBe(4);
    expect(coeursDeLaClasse('SIXIEME')).toBe(3);
    expect(coeursDeLaClasse('TERMINALE')).toBe(3);
  });

  test('une classe inconnue n’ouvre pas le défi', () => {
    expect(coeursDeLaClasse('')).toBe(0);
    expect(coeursDeLaClasse(null)).toBe(0);
  });
});

describe('le calcul des cœurs', () => {
  test('aucune erreur, aucun cœur perdu', () => {
    expect(coeursRestants(4, 4, 5)).toBe(5);
  });

  test('chaque manche ratée coûte un cœur', () => {
    expect(coeursRestants(4, 2, 5)).toBe(3);
  });

  test('on ne descend jamais sous zéro', () => {
    expect(coeursRestants(9, 0, 3)).toBe(0);
  });

  test('la manche en cours ne compte pas encore', () => {
    // On est à la manche 3 (index 3) avec 3 réussites : rien n'est perdu,
    // la quatrième n'est pas jouée.
    expect(coeursRestants(3, 3, 5)).toBe(5);
  });
});

describe('deux bonnes réponses d’affilée rendent un cœur', () => {
  // Joue une partie comme les jeux la jouent : la réussite est comptée à la
  // réponse (« J »), la manche n'avance qu'au « Continuer » ; une faute
  // (« F ») n'avance que la manche. Rend le nombre de cœurs perdus.
  const jouer = (reponses, max = 4) => {
    let e = COEURS_DEPART;
    let manche = 0;
    let reussies = 0;
    for (const r of reponses) {
      if (r === 'J') {
        reussies += 1;
        e = suivreCoeurs(e, manche, reussies, max);
      }
      manche += 1;
      e = suivreCoeurs(e, manche, reussies, max);
    }
    return e.perdus;
  };

  test('une faute coûte un cœur', () => {
    expect(jouer('F')).toBe(1);
  });

  test('une seule bonne réponse ne suffit pas', () => {
    expect(jouer('FJ')).toBe(1);
  });

  test('la deuxième d’affilée le rend', () => {
    expect(jouer('FJJ')).toBe(0);
  });

  test('une faute remet la série à zéro', () => {
    // F, J, F : deux perdus, la série repart ; J, J : un de rendu.
    expect(jouer('FJFJJ')).toBe(1);
  });

  test('on ne dépasse jamais le nombre de départ', () => {
    expect(jouer('JJJJ')).toBe(0);
    expect(jouer('FJJJJJJ')).toBe(0);
  });

  test('les réussites faites avec tous ses cœurs ne s’épargnent pas', () => {
    // Quatre réussites avant l'erreur ne la rachètent pas d'avance.
    expect(jouer('JJJJF')).toBe(1);
  });

  test('le cœur rendu l’est dès la réponse, sans attendre « Continuer »', () => {
    let e = suivreCoeurs(COEURS_DEPART, 1, 0, 4); // manche 0 ratée
    e = suivreCoeurs(e, 1, 1, 4);                 // bonne réponse
    e = suivreCoeurs(e, 2, 1, 4);                 // question suivante
    e = suivreCoeurs(e, 2, 2, 4);                 // seconde bonne réponse
    expect(e.perdus).toBe(0);
  });

  test('une nouvelle partie repart de zéro', () => {
    let e = suivreCoeurs(COEURS_DEPART, 1, 0, 4);
    e = suivreCoeurs(e, 2, 0, 4);
    expect(e.perdus).toBe(2);
    expect(suivreCoeurs(e, 0, 0, 4).perdus).toBe(0);
  });
});

describe('ce que l’enfant voit', () => {
  test('en mode tranquille, aucune trace des cœurs', () => {
    const { container } = enJeu(TRANQUILLE, 0, { manche: 3, duPremierCoup: 1 });

    expect(container.querySelector('.coeurs')).toBeNull();
    expect(container.querySelector('.coeurs-fin')).toBeNull();
  });

  test('en défi, les cœurs pleins et les cœurs perdus', () => {
    const { container } = enJeu(DEFI, 5, { manche: 4, duPremierCoup: 2 });

    const barre = container.querySelector('.coeurs');
    expect(barre).toHaveAttribute('aria-label', '3 cœurs sur 5');
    expect(container.querySelectorAll('.coeurs__un')).toHaveLength(5);
    expect(container.querySelectorAll('.coeurs__un.est-perdu')).toHaveLength(2);
  });

  test('un cœur perdu ne se rallume pas sur la bonne réponse suivante', () => {
    // Le bug du 26/09 : la réussite est comptée DÈS la réponse, la manche
    // n'avance qu'au « Continuer ». Entre les deux, le cœur noir repassait rose.
    const avec = (manche, duPremierCoup) => (
      <FournirJeu value={{ jeuCle: 'horloge', niveau: 'CE1', mode: DEFI, coeursMax: 4, rejouerPartie: () => {} }}>
        <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      </FournirJeu>
    );
    const perdus = (c) => c.querySelectorAll('.coeurs__un.est-perdu').length;

    const { container, rerender } = render(avec(1, 0)); // manche 1 ratée
    expect(perdus(container)).toBe(1);

    rerender(avec(1, 1)); // bonne réponse, avant « Continuer »
    expect(perdus(container)).toBe(1);

    rerender(avec(2, 1)); // question suivante
    expect(perdus(container)).toBe(1);

    rerender(avec(0, 0)); // nouvelle partie : tout redevient rose
    expect(perdus(container)).toBe(0);
  });

  test('le dernier cœur se signale', () => {
    const { container } = enJeu(DEFI, 3, { manche: 2, duPremierCoup: 0 });

    expect(container.querySelector('.coeurs--dernier')).not.toBeNull();
  });

  test('à zéro, la barre prévient la page au lieu de couvrir le jeu', () => {
    // Le voile d'avant laissait le jeu vivant dessous : il passait à la
    // question suivante et la faisait lire (Camara, 26/09). C'est la page qui
    // démonte le jeu — la barre ne fait que la prévenir.
    const terminerDefi = jest.fn();
    const { container } = enJeu(DEFI, 3, { manche: 7, duPremierCoup: 4, terminerDefi });

    expect(terminerDefi).toHaveBeenCalledWith({ reussies: 4, questions: 7 });
    expect(container).toBeEmptyDOMElement();
  });
});

describe('la fin du défi', () => {
  const fin = (props) => render(
    <FinDuDefi
      coeursMax={3}
      reussies={4}
      questions={7}
      onRefaire={() => {}}
      onTranquille={() => {}}
      onQuitter={() => {}}
      {...props}
    />,
  );

  test('elle annonce ce qui a été réussi, jamais ce qui a été raté', () => {
    fin();

    expect(screen.getByText(/le défi s.arrête ici/i, { selector: '.choix-mode__question-texte' })).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // NI « PERDU », NI « RATÉ » : l'enfant a choisi lui-même un mode
    // difficile, le lui reprocher serait le dernier moyen de l'y ramener.
    expect(screen.queryByText(/perdu|raté/i)).not.toBeInTheDocument();
  });

  test('les deux portes sont proposées', async () => {
    const onRefaire = jest.fn();
    const onTranquille = jest.fn();
    fin({ onRefaire, onTranquille });

    await userEvent.click(screen.getByRole('button', { name: /refaire le défi/i }));
    expect(onRefaire).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /jouer tranquillement/i }));
    expect(onTranquille).toHaveBeenCalled();
  });
});

describe('l’écran du choix', () => {
  test('au CP, il se choisit tout seul et ne s’affiche pas', () => {
    const onChoisir = jest.fn();
    const { container } = render(
      <ChoixDuMode classe="CP" jeuCle="boite-de-dix" niveau="CP" onChoisir={onChoisir} onQuitter={() => {}} />,
    );

    expect(onChoisir).toHaveBeenCalledWith(TRANQUILLE);
    expect(container.querySelector('.choix-mode__portes')).toBeNull();
  });

  test('ailleurs, les deux portes — et le nombre de cœurs reste dit', () => {
    render(
      <ChoixDuMode classe="CE1" jeuCle="horloge" niveau="CE1" onChoisir={() => {}} onQuitter={() => {}} />,
    );

    expect(screen.getByRole('button', { name: /tranquillement/i })).toBeInTheDocument();

    // LES CARTES N'ONT PLUS UN MOT depuis le 26/09 : leur titre est dessiné
    // dedans. Ce qui se voit à l'œil doit donc s'entendre autrement, sinon
    // l'écran devient « bouton, bouton » pour qui ne voit pas les images —
    // et le nombre de cœurs, qui dépend de la classe, disparaîtrait avec.
    expect(
      screen.getByRole('button', { name: /défi.*5 cœurs/i }),
    ).toBeInTheDocument();
  });

  test('le record est rappelé avant de jouer, pas seulement après', () => {
    enregistrer('enfant-1', 'horloge', 'CE1', 8, 10);

    render(
      <ChoixDuMode classe="CE1" jeuCle="horloge" niveau="CE1" onChoisir={() => {}} onQuitter={() => {}} />,
    );

    expect(screen.getByText(/ton meilleur à ce jeu/i)).toBeInTheDocument();
    expect(screen.getByText('8 sur 10')).toBeInTheDocument();
  });

  test('choisir un mode le remonte à la page', async () => {
    const onChoisir = jest.fn();
    render(
      <ChoixDuMode classe="CM1" jeuCle="horloge" niveau="CM1" onChoisir={onChoisir} onQuitter={() => {}} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /défi/i }));
    expect(onChoisir).toHaveBeenCalledWith(DEFI);
  });
});
