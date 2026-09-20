import { render, screen } from '@testing-library/react';
import ExpressionEcriteDetail from '../components/ExpressionEcriteDetail';

const base = {
  id: 7,
  titre: 'Une peur',
  consigne: 'Raconte un moment où tu as eu très peur.',
  texte: 'Je suis donc partie voir mes amis.\nJ\'allais depassé l\'heure.',
  transcrit: true,
  corrections: [
    { genre: 'reussi', texte: 'La fin tient debout.' },
    { genre: 'grammaire', texte: 'partie → parti' },
  ],
  remarque: null,
};

describe('ExpressionEcriteDetail — les badges dans l’archive', () => {
  it('rend le texte surligné avec ses badges numérotés, comme au tableau', () => {
    render(<ExpressionEcriteDetail texte={{
      ...base,
      texteSurligne: 'Je suis donc ==partie== voir mes amis.\nJ\'allais ==depassé== l\'heure.',
    }} />);

    const badges = screen.getAllByText(/^[12]$/).filter((e) => e.className.includes('compare__badge'));
    expect(badges.map((b) => b.textContent)).toEqual(['1', '2']);
    expect(screen.getByText('partie')).toHaveClass('compare__mot');
  });

  it('sans texte surligné, le texte nu — les archives d’avant', () => {
    render(<ExpressionEcriteDetail texte={{ ...base, texteSurligne: null }} />);

    expect(screen.getByText(/Je suis donc partie voir mes amis/)).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});
