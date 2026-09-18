import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupportEvaluation from '../components/SupportEvaluation';
import {
  demandeSupport, marquerSupport, retirerMarqueurSupport, supportChoisi, copieRendue,
  CAHIER, ORDINATEUR,
} from '../lib/storage/supportEvaluation';

/**
 * SUR QUOI L'ÉLÈVE COMPOSE SON ÉVALUATION — Camara, le 18/09/2026.
 *
 * Il s'agit de l'évaluation que le PROFESSEUR fait passer en séance, pas du
 * contrôle passé à l'école dont on regarde la copie après coup. Les deux mots
 * se ressemblent et les mécaniques n'ont rien de commun : mélanger les deux
 * ferait réclamer une photo de devoir au milieu d'une interrogation.
 *
 * CE QUE CES TESTS PROTÈGENT
 * -------------------------
 * 1. LE MARQUEUR NE S'AFFICHE JAMAIS. Il est écrit POUR LE PROFESSEUR ;
 *    l'élève a cliqué sur un bouton, il n'a pas récité un état technique. Le
 *    motif de retrait a déjà dû être repris une fois sur le marqueur de
 *    pointage, faute d'être testé.
 * 2. UNE SÉANCE PEUT PORTER DEUX ÉVALUATIONS. Le support de la première
 *    n'engage pas la seconde, et une question posée après une réponse doit
 *    rouvrir le choix.
 * 3. « J'AI FINI » NE VAUT PAS UNE COPIE. C'est exactement l'erreur de la
 *    première dictée au cahier, où le professeur a corrigé une page qu'il
 *    n'avait jamais vue — et c'est ce qui décide du rappel des deux minutes.
 */

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu, piecesJointes) => ({ role: 'user', contenu, piecesJointes });

describe('La balise', () => {
  test('elle est reconnue', () => {
    expect(demandeSupport('Je te conseille ton cahier. [SUPPORT_EVALUATION]')).toBe(true);
  });

  test('un message ordinaire ne la déclenche pas', () => {
    expect(demandeSupport('On commence le contrôle ?')).toBe(false);
    expect(demandeSupport(undefined)).toBe(false);
  });
});

describe('Le fait envoyé au professeur', () => {
  test('le cahier dit ce qui en découle : tableau entier et photo', () => {
    const texte = marquerSupport('', CAHIER);

    expect(texte).toMatch(/ÉVALUATION AU CAHIER/);
    expect(texte).toMatch(/sujet ENTIER au tableau/);
    expect(texte).toMatch(/PHOTO/);
  });

  test('l’ordinateur interdit explicitement de réclamer une photo', () => {
    const texte = marquerSupport('', ORDINATEUR);

    expect(texte).toMatch(/ÉVALUATION À L’ORDINATEUR/);
    expect(texte).toMatch(/JAMAIS de photo/);
  });

  test('il porte une phrase d’élève lisible, pas seulement le marqueur', () => {
    expect(marquerSupport('', CAHIER)).toMatch(/^Je prends mon cahier\./);
  });
});

describe('Ce que l’élève voit dans sa bulle', () => {
  test('le marqueur est retiré', () => {
    expect(retirerMarqueurSupport(marquerSupport('', CAHIER))).toBe('Je prends mon cahier.');
  });

  test('la balise du professeur aussi', () => {
    expect(retirerMarqueurSupport('Prends ton cahier. [SUPPORT_EVALUATION]'))
      .toBe('Prends ton cahier.');
  });

  test('un message sans rien n’est pas abîmé', () => {
    expect(retirerMarqueurSupport('Bonjour !')).toBe('Bonjour !');
  });
});

describe('Le support de l’évaluation en cours', () => {
  test('jamais demandé : undefined, et aucune carte', () => {
    expect(supportChoisi([prof('On révise.')])).toBeUndefined();
  });

  test('demandé sans réponse : null, c’est le moment de la carte', () => {
    expect(supportChoisi([prof('Je conseille le cahier. [SUPPORT_EVALUATION]')])).toBeNull();
  });

  test('répondu : le support choisi', () => {
    const fil = [
      prof('[SUPPORT_EVALUATION]'),
      eleve(marquerSupport('', CAHIER)),
    ];

    expect(supportChoisi(fil)).toBe(CAHIER);
  });

  /**
   * LE CAS QUI COMPTE : deux évaluations dans la même séance. Sans l'arrêt à la
   * première balise rencontrée en remontant, la seconde aurait hérité du
   * support de la première, et la carte ne serait jamais réapparue.
   */
  test('une seconde évaluation rouvre le choix', () => {
    const fil = [
      prof('[SUPPORT_EVALUATION]'),
      eleve(marquerSupport('', CAHIER)),
      prof('Bravo. On en refait une ? [SUPPORT_EVALUATION]'),
    ];

    expect(supportChoisi(fil)).toBeNull();
  });

  test('et sa réponse à elle l’emporte', () => {
    const fil = [
      prof('[SUPPORT_EVALUATION]'),
      eleve(marquerSupport('', CAHIER)),
      prof('On en refait une ? [SUPPORT_EVALUATION]'),
      eleve(marquerSupport('', ORDINATEUR)),
    ];

    expect(supportChoisi(fil)).toBe(ORDINATEUR);
  });
});

describe('La copie est-elle arrivée ?', () => {
  const debut = [prof('[SUPPORT_EVALUATION]'), eleve(marquerSupport('', CAHIER))];

  test('rien envoyé : non', () => {
    expect(copieRendue(debut)).toBe(false);
  });

  test('« j’ai fini » ne vaut PAS une copie', () => {
    expect(copieRendue([...debut, eleve('J’ai fini !')])).toBe(false);
  });

  test('une pièce jointe, oui', () => {
    expect(copieRendue([...debut, eleve('Voilà.', [{ id: 1 }])])).toBe(true);
  });

  /**
   * Une photo envoyée AVANT le début de cette évaluation — un exercice de la
   * première demi-heure — ne doit pas faire croire que la copie est rendue.
   */
  test('une pièce d’avant l’évaluation ne compte pas', () => {
    const fil = [eleve('Regarde mon exercice.', [{ id: 1 }]), ...debut];

    expect(copieRendue(fil)).toBe(false);
  });
});

describe('La carte', () => {
  test('les deux supports sont proposés, avec ce qu’ils impliquent', () => {
    render(<SupportEvaluation onChoisir={() => {}} />);

    expect(screen.getByText(/sur quoi veux-tu composer/i)).toBeInTheDocument();
    expect(screen.getByText(/tu m’envoies la photo de ta copie/i)).toBeInTheDocument();
    expect(screen.getByText(/les questions une par une/i)).toBeInTheDocument();
  });

  test('le clic rend le support choisi', async () => {
    const choisir = jest.fn();
    render(<SupportEvaluation onChoisir={choisir} />);

    await userEvent.click(screen.getByRole('button', { name: /mon cahier/i }));

    expect(choisir).toHaveBeenCalledWith(CAHIER);
  });

  test('pendant que le professeur écrit, on ne peut pas choisir', async () => {
    const choisir = jest.fn();
    render(<SupportEvaluation onChoisir={choisir} disabled />);

    await userEvent.click(screen.getByRole('button', { name: /l’ordinateur/i }));

    expect(choisir).not.toHaveBeenCalled();
  });
});
