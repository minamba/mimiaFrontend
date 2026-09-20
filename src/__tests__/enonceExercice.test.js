/**
 * L'ÉNONCÉ SEUL, POUR SE FAIRE EXPLIQUER UN EXERCICE — Camara, le 20/09/2026.
 *
 * Trois choses s'y jouent, et aucune ne se voit à la compilation :
 *  1. la fenêtre s'ouvre sur la balise du professeur et se referme dès que
 *     l'énoncé est arrivé — sinon elle s'empile sous l'exercice suivant ;
 *  2. le marqueur qui part avec l'énoncé EXIGE la question « sur quel exercice
 *     as-tu bloqué ? » : une consigne relue mille tokens plus loin ne suffit
 *     pas, c'est la leçon de la dictée ;
 *  3. ce marqueur ne doit réveiller AUCUN exercice de langue côté serveur.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnonceExercice from '../components/EnonceExercice';
import {
  choixAvecCopieActif, etatEnonce, MARQUEUR, marquerAvecCopie, marquerEnonce,
  marquerRetourChoix, porteUnEnonce, retirerMarqueurAvecCopie, retirerMarqueurEnonce,
} from '../lib/storage/enonceExercice';

// La fenêtre est ouverte, ou pas : les tests d'ouverture ne regardent que ça.
const enonceAttendu = (messages) => Boolean(etatEnonce(messages));

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

describe('la fenêtre s’ouvre et se referme', () => {
  it('s’ouvre sur la balise du professeur', () => {
    expect(enonceAttendu([
      eleve('je bloque sur un exercice'),
      prof('Bien sûr, envoie-moi l’énoncé. [ENONCE_EXERCICE]'),
    ])).toBe(true);
  });

  it('reste fermée sans balise', () => {
    expect(enonceAttendu([prof('On regarde les fractions ?')])).toBe(false);
    expect(enonceAttendu([])).toBe(false);
  });

  it('se referme dès que l’énoncé est arrivé', () => {
    expect(enonceAttendu([
      prof('[ENONCE_EXERCICE]'),
      eleve(marquerEnonce('')),
    ])).toBe(false);
  });

  // Le défaut de la carte de vitesse, resté trois exercices à l'écran : un
  // enfant qui tape sa demande au lieu de cliquer ne doit pas la traîner.
  it('se referme quand le professeur ouvre autre chose', () => {
    expect(enonceAttendu([
      prof('[ENONCE_EXERCICE]'),
      eleve('finalement non'),
      prof('On fait une dictée alors. [DICTEE]'),
    ])).toBe(false);
  });

  it('mais le tableau et les répliques dans la langue ne la referment pas', () => {
    expect(enonceAttendu([
      prof('[ENONCE_EXERCICE]'),
      eleve('deux secondes'),
      prof('[ARDOISE]Je t’attends[/ARDOISE] [ES]Vale[/ES]'),
    ])).toBe(true);
  });

  it('la fin de la séance la referme', () => {
    expect(enonceAttendu([
      prof('[ENONCE_EXERCICE]'),
      prof('À bientôt ! [FIN_SEANCE]'),
    ])).toBe(false);
  });

  // Une fenêtre d'hier ne rouvre pas aujourd'hui : on s'arrête à la première
  // réponse trouvée en remontant.
  it('un énoncé envoyé plus tôt ne rouvre rien', () => {
    expect(enonceAttendu([
      prof('[ENONCE_EXERCICE]'),
      eleve(marquerEnonce('')),
      prof('L’exercice 3 demande de factoriser.'),
      eleve('merci !'),
    ])).toBe(false);
  });
});

describe('le marqueur qui part avec l’énoncé', () => {
  it('exige la question avant toute explication', () => {
    expect(MARQUEUR).toMatch(/sur quel exercice/i);
    expect(MARQUEUR).toMatch(/AVANT D'EXPLIQUER/);
  });

  it('dit aussi qu’il n’y a pas de copie à réclamer', () => {
    expect(MARQUEUR).toMatch(/ne lui en demande pas/i);
  });

  it('se reconnaît, et se retire de l’affichage', () => {
    const message = marquerEnonce('voilà le sujet');

    expect(porteUnEnonce(message)).toBe(true);
    expect(retirerMarqueurEnonce(message)).toBe('voilà le sujet');
    expect(retirerMarqueurEnonce(marquerEnonce(''))).toBe('');
  });

  /**
   * LE PIÈGE MESURÉ LE 19/09/2026 : tout texte accroché au message de l'élève
   * traverse le détecteur d'exercices de langue côté serveur. Un seul de ces
   * mots, et des milliers de jetons de consignes se rechargent pour rien.
   */
  it('ne réveille aucun exercice de langue', () => {
    const interdits = [
      /dict[ée]e/i, /dictation/i,
      /conversation/i, /expression\s+orale/i, /speaking/i,
      /expression\s+[ée]crite/i, /texte\s+[ée]crit/i, /r[ée]daction/i, /r[ée]dige/i,
      /compr[ée]hension\s+orale/i, /exercice\s+d.[ée]coute/i, /listening/i,
    ];

    interdits.forEach((mot) => expect(MARQUEUR).not.toMatch(mot));
  });
});

describe('la carte', () => {
  it('porte les trois boutons quand une caméra est branchée', () => {
    render(<EnonceExercice choix="seul" cameraDispo onFichier={jest.fn()} onPhoto={jest.fn()} />);

    expect(screen.getByText(/Importer l’énoncé/)).toBeInTheDocument();
    expect(screen.getByText(/Prendre en photo/)).toBeInTheDocument();
    expect(screen.getByText(/Scanner l’énoncé/)).toBeInTheDocument();
  });

  // Proposer un geste impossible est pire que de ne pas le proposer.
  it('sans caméra, le bouton photo disparaît', () => {
    render(<EnonceExercice choix="seul" onFichier={jest.fn()} />);

    expect(screen.queryByText(/Prendre en photo/)).not.toBeInTheDocument();
    expect(screen.getByText(/Importer l’énoncé/)).toBeInTheDocument();
    expect(screen.getByText(/Scanner l’énoncé/)).toBeInTheDocument();
  });

  it('ne parle jamais de copie : il n’en a pas', () => {
    render(<EnonceExercice choix="seul" cameraDispo onFichier={jest.fn()} onPhoto={jest.fn()} />);

    expect(screen.queryByText(/copie/i)).not.toBeInTheDocument();
  });

  it('« Prendre en photo » ouvre la caméra de la séance', async () => {
    const onPhoto = jest.fn();
    render(<EnonceExercice choix="seul" cameraDispo onFichier={jest.fn()} onPhoto={onPhoto} />);

    await userEvent.click(screen.getByRole('button', { name: /Prendre en photo/ }));
    expect(onPhoto).toHaveBeenCalled();
  });

  it('annonce que le professeur demandera ensuite l’exercice', () => {
    render(<EnonceExercice choix="seul" onFichier={jest.fn()} />);

    expect(screen.getByText(/sur quel exercice tu bloques/i)).toBeInTheDocument();
  });

  // Sur ordinateur, « Scanner » passe par le téléphone : c'est un bouton.
  it('sur ordinateur, le scan est un bouton qui ouvre le téléphone', async () => {
    const onScanner = jest.fn();
    render(<EnonceExercice choix="seul" onFichier={jest.fn()} onScanner={onScanner} />);

    await userEvent.click(screen.getByRole('button', { name: /Scanner l’énoncé/ }));
    expect(onScanner).toHaveBeenCalled();
  });
});

/**
 * LA SÉANCE DU 20/09/2026, TELLE QU'ELLE S'EST PASSÉE.
 *
 * L'élève : « Non, en fait, je voudrais juste t'envoyer l'énoncé. Y a pas de
 * copie. » Le professeur : « D'accord, pas de souci — envoie-moi juste
 * l'énoncé. [COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE] ». L'écran a reposé
 * « L'énoncé et ta copie sont-ils séparés ? ».
 */
describe('quand le professeur écrit les deux balises', () => {
  it('l’énoncé l’emporte sur la demande de copie', () => {
    expect(enonceAttendu([
      eleve('Non, en fait, je voudrais juste t’envoyer l’énoncé. Y a pas de copie.'),
      prof('D’accord — envoie-moi juste l’énoncé. [ENONCE_EXERCICE] '
        + '[COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
    ])).toBe(true);
  });

  // Mais une demande de copie POSTÉRIEURE, elle, referme : le professeur est
  // peut-être passé à un autre contrôle.
  it('une demande de copie plus tardive referme la fenêtre', () => {
    expect(enonceAttendu([
      prof('[ENONCE_EXERCICE]'),
      eleve('finalement j’ai retrouvé ma copie'),
      prof('Parfait, montre-moi tout. [COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
    ])).toBe(false);
  });
});

/**
 * LA FENÊTRE DE CHOIX — Camara, le 20/09/2026 : « je veux qu'une fenêtre de
 * choix apparaisse, juste l'énoncé ou ta copie et l'énoncé ».
 *
 * Posée par l'écran et non par le professeur : un clic tranche sans ambiguïté
 * là où une phrase se comprend de travers, et il ne coûte aucun tour.
 */
describe('la fenêtre de choix', () => {
  it('s’affiche avant les boutons d’envoi', () => {
    render(<EnonceExercice onChoisir={jest.fn()} onFichier={jest.fn()} />);

    expect(screen.getByText('Qu’est-ce que tu veux m’envoyer ?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Juste l’énoncé' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ta copie et l’énoncé' })).toBeInTheDocument();
    expect(screen.queryByText(/Importer l’énoncé/)).not.toBeInTheDocument();
  });

  it('« Juste l’énoncé » ne part pas au professeur', async () => {
    const onChoisir = jest.fn();
    render(<EnonceExercice onChoisir={onChoisir} onFichier={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Juste l’énoncé' }));
    expect(onChoisir).toHaveBeenCalledWith(false);
  });

  it('« Ta copie et l’énoncé » demande l’autre chemin', async () => {
    const onChoisir = jest.fn();
    render(<EnonceExercice onChoisir={onChoisir} onFichier={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ta copie et l’énoncé' }));
    expect(onChoisir).toHaveBeenCalledWith(true);
  });

  it('la balise peut porter le numéro du contrôle', () => {
    const etat = etatEnonce([
      prof('[ENONCE_EXERCICE] controle: 5 [/ENONCE_EXERCICE]'),
    ]);

    expect(etat.controleId).toBe(5);
    expect(etatEnonce([prof('[ENONCE_EXERCICE]')]).controleId).toBeNull();
  });
});

describe('le choix « ta copie et l’énoncé »', () => {
  // Seul le professeur peut ouvrir le workflow de la copie : le clic doit
  // donc lui parvenir, avec le fait qui garantit la balise.
  it('part comme une phrase d’élève, avec la balise à écrire', () => {
    const message = marquerAvecCopie(5);

    expect(message).toMatch(/Je veux t’envoyer l’énoncé et ma copie/);
    expect(message).toMatch(/\[COPIE_CONTROLE\] controle: 5/);
    expect(retirerMarqueurAvecCopie(message)).toBe('Je veux t’envoyer l’énoncé et ma copie.');
  });

  it('sans numéro de contrôle, la balise reste nue', () => {
    expect(marquerAvecCopie()).toMatch(/\[COPIE_CONTROLE\] dans ta réponse/);
  });

  it('il referme la fenêtre de l’énoncé', () => {
    expect(etatEnonce([
      prof('[ENONCE_EXERCICE] controle: 5 [/ENONCE_EXERCICE]'),
      eleve(marquerAvecCopie(5)),
    ])).toBeNull();
  });
});

/**
 * LA BOUCLE DU 20/09/2026, telle qu'elle est en base.
 *
 * Le professeur écrivait [ENONCE_EXERCICE] ET [COPIE_CONTROLE] dans chacune de
 * ses quatre réponses. L'énoncé l'emportait par règle fixe, la fenêtre de
 * choix se réaffichait à l'identique, et cliquer « Ta copie et l'énoncé » ne
 * menait jamais nulle part.
 */
describe('après le clic « Ta copie et l’énoncé »', () => {
  const sequence = [
    eleve('je voudrais t’envoyer l’énoncé du contrôle sur lequel j’ai bloqué'),
    prof('D’accord. [ENONCE_EXERCICE] controle: 5 [/ENONCE_EXERCICE]'),
    eleve(marquerAvecCopie(5)),
    prof('D’accord, envoie-moi l’énoncé quand tu veux. '
      + '[ENONCE_EXERCICE] [COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
  ];

  it('la fenêtre de l’énoncé ne se rouvre pas, même s’il réécrit la balise', () => {
    expect(etatEnonce(sequence)).toBeNull();
  });

  it('le marqueur le lui interdit explicitement', () => {
    expect(marquerAvecCopie(5)).toMatch(/N'ÉCRIS PAS \[ENONCE_EXERCICE\]/);
  });

  // L'autre cas garde son arbitrage : l'enfant n'a PAS demandé les deux, le
  // professeur réclame la copie par réflexe, l'énoncé gagne.
  it('mais sans ce clic, l’énoncé l’emporte toujours', () => {
    expect(etatEnonce([
      eleve('Y a pas de copie, je veux juste t’envoyer l’énoncé.'),
      prof('D’accord. [ENONCE_EXERCICE] [COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
    ])).not.toBeNull();
  });
});

/**
 * REVENIR SUR SON CHOIX — Camara, le 20/09/2026 : « si l'enfant s'est trompé
 * sur son choix, faudrait lui permettre de revenir en arrière ».
 *
 * Les deux chemins ne coûtent pas la même chose, et c'est assumé : « Juste
 * l'énoncé » n'a jamais quitté le navigateur, « Ta copie et l'énoncé » a déjà
 * ouvert une fenêtre chez le professeur.
 */
describe('le retour en arrière', () => {
  it('depuis les trois boutons, il repose la question sans rien envoyer', async () => {
    const onChoisir = jest.fn();
    render(<EnonceExercice choix="seul" onChoisir={onChoisir} onFichier={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Ce n’est pas ce que je voulais/ }));
    expect(onChoisir).toHaveBeenCalledWith(null);
  });

  it('le retour depuis la copie referme la réclamation chez le professeur', () => {
    const message = marquerRetourChoix();

    expect(message).toMatch(/Finalement, je veux juste t’envoyer l’énoncé/);
    expect(message).toMatch(/N’écris PLUS \[COPIE_CONTROLE\]/);
    expect(message).toMatch(/Écris \[ENONCE_EXERCICE\]/);
    expect(retirerMarqueurAvecCopie(message))
      .toBe('Finalement, je veux juste t’envoyer l’énoncé.');
  });

  describe('le bouton de retour sur la fenêtre de copie', () => {
    it('s’affiche quand l’enfant y est arrivé par un choix', () => {
      expect(choixAvecCopieActif([
        prof('[ENONCE_EXERCICE] controle: 5 [/ENONCE_EXERCICE]'),
        eleve(marquerAvecCopie(5)),
        prof('[COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
      ])).toBe(true);
    });

    // Un bilan ordinaire : le professeur propose lui-même de regarder la
    // copie, l'enfant n'a fait aucun choix, il n'y a rien sur quoi revenir.
    it('ne s’affiche pas dans un bilan ordinaire', () => {
      expect(choixAvecCopieActif([
        prof('Tu as ta copie ? [COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
        eleve('oui'),
      ])).toBe(false);
    });

    it('disparaît une fois le retour demandé', () => {
      expect(choixAvecCopieActif([
        eleve(marquerAvecCopie(5)),
        prof('[COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
        eleve(marquerRetourChoix()),
      ])).toBe(false);
    });

    it('et la fenêtre du choix se rouvre après le retour', () => {
      expect(etatEnonce([
        eleve(marquerAvecCopie(5)),
        prof('[COPIE_CONTROLE] controle: 5 [/COPIE_CONTROLE]'),
        eleve(marquerRetourChoix()),
        prof('Pas de souci. [ENONCE_EXERCICE] controle: 5 [/ENONCE_EXERCICE]'),
      ])).not.toBeNull();
    });
  });
});
