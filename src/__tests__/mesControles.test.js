/**
 * LA SECTION « MES CONTRÔLES » DE L'ACCUEIL.
 *
 * Deux choses s'y jouent, et aucune ne se voit à la compilation :
 *
 * 1. LE POURCENTAGE EST ÉCRIT, pas seulement dessiné. Une largeur de barre ne
 *    se lit pas à voix haute et ne se compare pas d'une carte à l'autre.
 * 2. QUAND LE PROGRAMME EST INCONNU, AUCUN « 0 % » N'APPARAÎT. Zéro serait un
 *    reproche adressé à un enfant qui n'a rien manqué : c'est le professeur
 *    qui n'a pas encore posé le programme.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MesControles, { ControleCarte } from '../components/MesControles';

// Le composant ne se sert que de `Link` : on le remplace par l'ancre qu'il
// produit, comme dans `offreLancement`.
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

const CONTROLE = {
  id: 42,
  matiereId: 1,
  matiereLibelle: 'Mathématiques',
  sujet: 'Les fractions',
  dateControle: '2026-09-20T00:00:00',
  joursRestants: 3,
  nombrePreparations: 0,
  preparation: { pourcent: 60, perimetreConnu: true, total: 4, acquises: 2, notions: [] },
};

test('rien ne s’affiche tant que les contrôles ne sont pas chargés', () => {
  const { container } = render(<MesControles eleveId="9" controles={null} />);

  // Ni la liste, ni « Pas encore de contrôle » : annoncer l'absence pendant
  // le chargement ferait clignoter un message faux à chaque ouverture.
  expect(container).toBeEmptyDOMElement();
});

test('sans contrôle, la section invite à en ajouter un', () => {
  render(<MesControles eleveId="9" controles={[]} />);

  expect(screen.getByText(/Pas encore de contrôle prévu/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Ajouter un contrôle/ })).toBeInTheDocument();
});

/**
 * LE BOUTON D'AJOUT RESTE QUAND LA LISTE SE REMPLIT — voulu par Camara le
 * 13/09/2026. Il n'existait que dans l'état vide, c'est-à-dire exactement
 * quand on n'en a besoin qu'une fois : en ajouter un deuxième obligeait à
 * passer par la page dédiée.
 */
test('le bouton d’ajout est permanent dès qu’il y a des contrôles', async () => {
  const onAjouter = jest.fn();

  render(<MesControles eleveId="9" controles={[CONTROLE]} onAjouter={onAjouter} />);

  const bouton = screen.getByRole('button', { name: /Ajouter un contrôle/ });
  await userEvent.click(bouton);

  expect(onAjouter).toHaveBeenCalled();
});

test('mais il n’est pas doublé dans l’état vide, où la carte en porte déjà un', () => {
  render(<MesControles eleveId="9" controles={[]} onAjouter={jest.fn()} />);

  expect(screen.getAllByRole('button', { name: /Ajouter un contrôle/ })).toHaveLength(1);
});

/**
 * « VOIR LES CONTRÔLES PASSÉS » — Camara, le 20/09/2026 : le même bouton à
 * côté de l'ajout, dans une autre couleur. Il mène à la page dédiée OUVERTE
 * SUR SON ONGLET : arriver sur « À venir » laisserait l'enfant chercher.
 */
describe('le bouton des contrôles passés', () => {
  const lien = () => screen.getByRole('link', { name: /Voir les contrôles passés/ });

  test('accompagne l’ajout quand la liste est remplie', () => {
    render(<MesControles eleveId="9" controles={[CONTROLE]} onAjouter={jest.fn()} />);

    expect(lien()).toHaveAttribute('href', '/eleves/9/controles?onglet=passes');
  });

  // Il s'affiche MÊME SANS HISTORIQUE : un bouton qui apparaît et disparaît
  // selon ce qu'il y a derrière ne se laisse jamais trouver, et la page
  // dédiée explique l'absence en une phrase.
  test('s’affiche aussi dans l’état vide', () => {
    render(<MesControles eleveId="9" controles={[]} onAjouter={jest.fn()} />);

    expect(lien()).toBeInTheDocument();
  });

  test('porte la même forme que l’ajout, avec sa propre teinte', () => {
    render(<MesControles eleveId="9" controles={[CONTROLE]} onAjouter={jest.fn()} />);

    expect(lien()).toHaveClass('btn-controle', 'btn-controle--passes');
  });
});

test('une carte porte la matière, le délai et le pourcentage EN TEXTE', () => {
  render(<MesControles eleveId="9" controles={[CONTROLE]} />);

  expect(screen.getByText('Mathématiques')).toBeInTheDocument();
  expect(screen.getByText('dans 3 jours')).toBeInTheDocument();

  // Le chiffre lui-même, pas seulement la largeur de la barre.
  expect(screen.getByText('60 %')).toBeInTheDocument();
});

test('le bouton dit « Commencer » puis « Continuer » selon ce qui a déjà été fait', () => {
  const { rerender } = render(<MesControles eleveId="9" controles={[CONTROLE]} />);
  expect(screen.getByRole('button', { name: 'Commencer à réviser' })).toBeInTheDocument();

  rerender(
    <MesControles eleveId="9" controles={[{ ...CONTROLE, nombrePreparations: 2 }]} />,
  );
  expect(screen.getByRole('button', { name: 'Continuer la préparation' })).toBeInTheDocument();
});

/**
 * LA BARRE EST TOUJOURS LÀ, MÊME À ZÉRO — décision de Camara du 13/09/2026,
 * qui renverse le choix précédent (« pas de 0 %, ce serait un reproche »).
 * À l'usage, ne rien afficher était pire : l'enfant ne voyait rien, et la
 * mécanique avait l'air en panne. Le programme inconnu se dit EN PLUS de la
 * barre, pas à sa place.
 */
test('sans programme connu, la barre s’affiche quand même à 0 %', () => {
  const sansPerimetre = {
    ...CONTROLE,
    preparation: { pourcent: 0, perimetreConnu: false, total: 0, acquises: 0, notions: [] },
  };

  render(<MesControles eleveId="9" controles={[sansPerimetre]} />);

  expect(screen.getByText('0 %')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  expect(screen.getByText(/On ne sait pas encore ce qu’il y a dessus/)).toBeInTheDocument();
});

test('« demain » et « aujourd’hui » se disent en toutes lettres', () => {
  const { rerender } = render(
    <MesControles eleveId="9" controles={[{ ...CONTROLE, joursRestants: 1 }]} />,
  );
  expect(screen.getByText('demain')).toBeInTheDocument();

  rerender(<MesControles eleveId="9" controles={[{ ...CONTROLE, joursRestants: 0 }]} />);
  expect(screen.getByText("aujourd'hui")).toBeInTheDocument();
});

/**
 * LA PASTILLE « PRÊT », SUR LA CARTE — voulue par Camara le 13/09/2026.
 *
 * C'EST LE VERDICT DU PROFESSEUR QUI DÉCIDE, PAS LE POURCENTAGE. C'est toute
 * la raison d'être de cette pastille : la barre mesure ce qui est acquis, elle
 * ignore ce que le contrôle demandera. Un enfant à 20 % peut être déclaré prêt
 * si les deux notions qui tomberont sont tenues — ces tests verrouillent
 * précisément qu'aucun seuil ne s'est glissé dans l'écran.
 */
describe('la pastille de préparation', () => {
  test('affiche le verdict du professeur, quel que soit le pourcentage', () => {
    render(
      <MesControles
        eleveId="9"
        controles={[{
          ...CONTROLE,
          preparation: { ...CONTROLE.preparation, pourcent: 20, pretStatut: 'pret' },
        }]}
      />,
    );

    expect(screen.getByText('Prêt pour le contrôle')).toBeInTheDocument();
  });

  test('un pourcentage élevé ne rend PAS prêt à lui seul', () => {
    render(
      <MesControles
        eleveId="9"
        controles={[{
          ...CONTROLE,
          preparation: { ...CONTROLE.preparation, pourcent: 95, pretStatut: 'pas-pret' },
        }]}
      />,
    );

    expect(screen.getByText('Pas encore prêt')).toBeInTheDocument();
    expect(screen.queryByText('Prêt pour le contrôle')).not.toBeInTheDocument();
  });

  test('sans statut envoyé par le serveur, aucune pastille n’est inventée', () => {
    const { container } = render(<MesControles eleveId="9" controles={[CONTROLE]} />);

    expect(container.querySelector('.pastille-pret')).toBeNull();
  });

  /**
   * La carte est montée ici DIRECTEMENT, et non via `MesControles` : la
   * section d'accueil ne montre que les contrôles à venir, c'est
   * `ControlesEleve` qui rend les passés. Un premier jet passait `passe` à
   * `MesControles`, qui n'a pas cette prop — le test mesurait donc autre chose
   * que ce qu'il annonçait.
   */
  test('un contrôle passé n’affiche pas de pastille : on vient lire la note', () => {
    const { container } = render(
      <ControleCarte
        passe
        controle={{
          ...CONTROLE,
          joursRestants: -2,
          note: 14,
          preparation: { ...CONTROLE.preparation, pretStatut: 'pret' },
        }}
      />,
    );

    // Le verdict de préparation n'a plus d'objet une fois le contrôle passé :
    // ce que l'enfant vient chercher là, c'est sa note.
    expect(container.querySelector('.pastille-pret')).toBeNull();
    expect(screen.getByText('14/20')).toBeInTheDocument();
  });
});
