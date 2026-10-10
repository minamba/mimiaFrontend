import { render, screen } from '@testing-library/react';
import { enDuel, gainDe } from '../components/jeux/JeuDeChoix';
import FinDePartie from '../components/jeux/FinDePartie';

describe('la cagnotte des jeux question-réponse', () => {
  it('10 points du premier coup, multipliés par la série, ×3 au plus', () => {
    expect(gainDe(true, 1)).toBe(10);
    expect(gainDe(true, 2)).toBe(20);
    expect(gainDe(true, 3)).toBe(30);
    expect(gainDe(true, 7)).toBe(30);
  });

  it('5 points au deuxième essai', () => {
    expect(gainDe(false, 0)).toBe(5);
  });
});

describe('le coffre de fin', () => {
  const fin = (props) => render(
    <FinDePartie score={7} total={8} mot="Bravo" onRejouer={() => {}} onQuitter={() => {}} {...props} />,
  );

  it('montre la cagnotte et la meilleure série', () => {
    fin({ points: 140, meilleureSerie: 4 });
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText(/meilleure série : 4/)).toBeInTheDocument();
  });

  it('reste absent des jeux qui ne comptent pas de points', () => {
    fin({});
    expect(screen.queryByText(/points/)).not.toBeInTheDocument();
  });
});

describe('vrai ou faux en buzzers', () => {
  it('reconnaît un duel oui / non et met toujours le oui à gauche', () => {
    const choix = [{ cle: 'f', libelle: 'Fausse' }, { cle: 'v', libelle: 'Vraie' }];
    expect(enDuel(choix).map((c) => c.cle)).toEqual(['v', 'f']);
    expect(enDuel([{ cle: 'o', libelle: 'Oui, c’est proportionnel' }, { cle: 'n', libelle: 'Non' }])).not.toBeNull();
  });
  it('laisse les autres choix tels quels', () => {
    expect(enDuel([{ cle: 'a', libelle: 'Chiasme' }, { cle: 'b', libelle: 'Hyperbole' }])).toBeNull();
    expect(enDuel([{ cle: 'a', libelle: 'Vrai' }, { cle: 'b', libelle: 'Faux' }, { cle: 'c', libelle: 'On ne sait pas' }])).toBeNull();
  });
});
