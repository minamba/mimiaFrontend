/**
 * ARRIVER SUR « MES JEUX » PAR LA CARTE DU PROFESSEUR — Camara, le 23/09/2026.
 *
 * `?classe=CE1&jeu=course-des-tables` doit ouvrir le jeu directement, à cette
 * classe. Et les mêmes gardes que la frise valent ici : une classe au-dessus
 * de la sienne ne s'ouvre pas, un jeu inconnu non plus — la page s'ouvre alors
 * comme d'habitude, sans erreur.
 */

import { render, screen } from '@testing-library/react';
import JeuxEleve from '../components/JeuxEleve';

const ETAT = { eleves: { liste: [] } };

let mockRecherche = '';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '24' }),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(mockRecherche)],
}));

// Un enfant de CE2, connecté avec son code.
jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 24, prenom: 'Lina', niveau: 'CE2', niveauCode: 'CE2', cycle: 'Primaire' }),
}));

// Les jeux parlent : on fait taire la voix, ce n'est pas elle qu'on teste.
jest.mock('../lib/jeux/voix/useVoixJeu', () => () => ({
  dire: () => {}, couper: () => {}, muet: false, basculerMuet: () => {}, relire: () => {},
}));

describe('le lien vers un jeu précis', () => {
  it('ouvre le jeu demandé, à la classe demandée, quand elle est ouverte', () => {
    mockRecherche = 'classe=CE1&jeu=course-des-tables';
    render(<JeuxEleve />);

    // Le jeu remplace la grille : son bouton de sortie est là, la frise non.
    expect(screen.getByRole('button', { name: /Revenir aux jeux/ })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /Choisir une classe/ })).not.toBeInTheDocument();
  });

  it('ignore une classe au-dessus de la sienne : la page s’ouvre normalement', () => {
    mockRecherche = 'classe=CM2&jeu=coffre-des-centaines';
    render(<JeuxEleve />);

    expect(screen.getByRole('navigation', { name: /Choisir une classe/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revenir aux jeux/ })).not.toBeInTheDocument();
  });

  it('ignore un jeu qui n’existe pas à cette classe', () => {
    mockRecherche = 'classe=CE1&jeu=le-robot';
    render(<JeuxEleve />);

    expect(screen.getByRole('navigation', { name: /Choisir une classe/ })).toBeInTheDocument();
  });

  it('sans paramètres, rien ne change', () => {
    mockRecherche = '';
    render(<JeuxEleve />);

    expect(screen.getByRole('navigation', { name: /Choisir une classe/ })).toBeInTheDocument();
  });
});
