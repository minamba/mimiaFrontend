import { render, screen } from '@testing-library/react';
import * as python from '../lib/jeux/lycee/python-variable';
import { pasAPas } from '../lib/jeux/pythonPasAPas';
import { QuestionPython } from '../components/jeux/scenes/UsinePython';

describe('l’usine Python rejoue le programme', () => {
  it('sur 300 parties, ce qu’elle affiche à la fin est la bonne réponse', () => {
    for (let g = 1; g <= 300; g += 1) {
      python.serie(g * 7919 + 3, 'SECONDE').forEach((m) => {
        const { etapes, sorties } = pasAPas(m.question);
        expect(etapes.length).toBeGreaterThan(0);
        expect(sorties.join(' ')).toBe(String(m.bonne));
      });
    }
  });

  it('allume des lignes qui existent', () => {
    const m = python.serie(42, 'SECONDE')[0];
    const lignes = m.question.split('\n').length;
    pasAPas(m.question).etapes.forEach((e) => expect(e.ligne).toBeLessThan(lignes));
  });

  it('montre le programme avant la réponse, sans rien dévoiler de son déroulé', () => {
    const m = python.serie(42, 'SECONDE')[0];
    render(<QuestionPython m={m} termine={false} />);
    expect(screen.getByLabelText('Le programme')).toBeInTheDocument();
    expect(screen.queryByLabelText('Les variables')).not.toBeInTheDocument();
  });

  it('une fois la réponse donnée, l’usine tourne', () => {
    const m = python.serie(42, 'SECONDE')[0];
    render(<QuestionPython m={m} termine />);
    expect(screen.getByLabelText('Les variables')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('un programme illisible ne casse rien', () => {
    expect(pasAPas('ceci n’est pas du python')).toEqual({ etapes: [], sorties: [] });
  });
});
