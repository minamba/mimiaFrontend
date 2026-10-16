/**
 * LES FICHES DE RÉVISION DE L'ÉLÈVE — le rendu des six types (Camara, le
 * 14/10/2026).
 *
 * CE QUI SE TESTE ICI
 * -------------------
 * 1. Le texte d'une fiche vient d'un modèle : AUCUNE balise n'y devient du
 *    HTML. Un « <img onerror> » reste du texte affiché.
 * 2. Les quatre marques (gras, italique, fraction, blanc) sont lues.
 * 3. Les questions/réponses cachent la réponse : c'est tout l'intérêt de la
 *    fiche — chercher avant de lire.
 * 4. Chaque fiche d'exemple s'affiche sans erreur, et une brique inconnue
 *    est ignorée au lieu de casser la page.
 * 5. Les types réservés aux plus grands ne sont pas proposés au CP.
 */
import { render, screen, within, fireEvent } from '@testing-library/react';
import RenduFiche from '../components/mesFiches/RenduFiche';
import { decouperTexte, texteNu } from '../lib/mesFiches/texteFiche';
import { EXEMPLES_FICHES } from '../lib/mesFiches/exemples';
import { TYPES_FICHES, typesPourLeRang } from '../lib/mesFiches/typesFiches';

const INSECABLE = String.fromCharCode(0xa0);
const INSECABLE_FINE = String.fromCharCode(0x202f);

const fiche = (blocs, autres = {}) => ({
  id: 'essai', type: 'classique', matiere: 'Français', titre: 'Essai', blocs, ...autres,
});

describe('le texte d’une fiche', () => {
  it('lit le gras, l’italique, les fractions et les blancs', () => {
    const morceaux = decouperTexte('Un **mot** et *un exemple* : {AM/AB} puis [[à remplir]].');

    expect(morceaux.map((m) => m.type)).toEqual(
      ['texte', 'gras', 'texte', 'italique', 'texte', 'fraction', 'texte', 'blanc', 'texte'],
    );
    expect(morceaux.find((m) => m.type === 'fraction')).toMatchObject({ haut: 'AM', bas: 'AB' });
  });

  it('garde une égalité de fractions d’un seul tenant', () => {
    const morceaux = decouperTexte('donc {AM/AB} = {AN/AC} = {MN/BC}.');
    const formule = morceaux.find((m) => m.type === 'formule');

    expect(formule.morceaux.filter((m) => m.type === 'fraction')).toHaveLength(3);
    expect(texteNu('{AM/AB} ≠ {AN/AC}')).toBe('AM sur AB ≠ AN sur AC');
  });

  it('garde les fractions à l’intérieur du gras', () => {
    const [gras] = decouperTexte('**AN = {3 × 7/5}**');
    expect(gras.morceaux.some((m) => m.type === 'fraction')).toBe(true);
  });

  it('applique la typographie française : rien ne reste seul en début de ligne', () => {
    expect(texteNu('en « papillon » !'))
      .toBe(`en «${INSECABLE}papillon${INSECABLE}»${INSECABLE_FINE}!`);
  });

  it('rend un texte nu lisible à voix haute', () => {
    expect(texteNu('**Thalès** : {AM/AB}')).toBe(`Thalès${INSECABLE_FINE}: AM sur AB`);
  });

  it('n’injecte jamais de HTML : une balise reste du texte', () => {
    render(
      <RenduFiche fiche={fiche([{ type: 'paragraphe', texte: '<img src=x onerror="alert(1)"> **gras**' }])} />,
    );

    // La seule image est le logo Mimia de l'impression : la balise du texte n'en a créé aucune.
    expect(screen.getAllByRole('img')).toEqual([screen.getByRole('img', { name: 'Mimia' })]);
    expect(screen.getByText(/<img src=x onerror/)).toBeInTheDocument();
  });
});

describe('les questions à retourner', () => {
  const questions = fiche([{
    type: 'questions',
    titre: 'Les questions',
    questions: [
      { question: 'Qu’est-ce qu’un oxymore ?', reponse: 'Deux mots contraires côte à côte.' },
      { question: 'Qu’est-ce qu’une antithèse ?', reponse: 'Deux idées opposées.' },
    ],
  }], { type: 'questions' });

  it('cache la réponse jusqu’au clic', () => {
    render(<RenduFiche fiche={questions} />);

    const reponse = screen.getByText('Deux mots contraires côte à côte.');
    expect(reponse).not.toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /oxymore/ }));
    expect(reponse).toBeVisible();
    expect(screen.getByText(/1 \/ 2 découverte/)).toBeInTheDocument();
  });

  it('« Tout afficher » découvre toutes les réponses, et se retourne', () => {
    render(<RenduFiche fiche={questions} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tout afficher' }));
    expect(screen.getByText('Deux idées opposées.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tout cacher' })).toBeInTheDocument();
  });
});

describe('les six types', () => {
  it.each(EXEMPLES_FICHES.map((f) => [f.id, f]))('la fiche %s s’affiche', (_, exemple) => {
    render(<RenduFiche fiche={exemple} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(texteNu(exemple.titre).replace(/\s+/g, ' '));
  });

  it.each(['Français', 'Mathématiques'])('couvre les six types en %s', (matiere) => {
    const types = new Set(EXEMPLES_FICHES.filter((f) => f.matiere === matiere).map((f) => f.type));
    expect([...types].sort()).toEqual(TYPES_FICHES.map((t) => t.code).sort());
  });

  it('ignore une brique inconnue au lieu de casser la fiche', () => {
    render(<RenduFiche fiche={fiche([{ type: 'inconnue' }, { type: 'paragraphe', texte: 'Toujours là.' }])} />);
    expect(screen.getByText('Toujours là.')).toBeInTheDocument();
  });

  it('signale un exemple qui n’était pas dans le cours', () => {
    render(<RenduFiche fiche={EXEMPLES_FICHES.find((f) => f.id === 'fr-classique')} />);
    expect(screen.getByText('exemple ajouté')).toBeInTheDocument();
  });

  it('la carte visuelle place toutes ses bulles et le dit par sa classe', () => {
    render(<RenduFiche fiche={EXEMPLES_FICHES.find((f) => f.id === 'fr-visuelle')} />);
    const carte = screen.getByRole('group', { name: /Carte mentale/ });

    expect(carte).toHaveClass('fdr-carte--6');
    ['Hyperbole', 'Gradation', 'Anaphore', 'Énumération', 'Litote', 'Euphémisme'].forEach((nom) => {
      expect(within(carte).getByText(nom)).toBeInTheDocument();
    });
  });

  it('l’arbre express garde chaque mot-clé dans sa famille', () => {
    render(<RenduFiche fiche={EXEMPLES_FICHES.find((f) => f.id === 'fr-express')} />);
    const arbre = screen.getByRole('group', { name: /Arbre/ });

    expect(within(arbre).getAllByRole('listitem', { name: /^figures de/ })).toHaveLength(5);
    expect(within(within(arbre).getByRole('listitem', { name: /opposition/ })).getByText('Oxymore')).toBeInTheDocument();
  });
});

describe('les types proposés selon la classe', () => {
  it('au CP, ni fiche méthode ni fiche de contrôle', () => {
    expect(typesPourLeRang(1).map((t) => t.code)).toEqual(['classique', 'express', 'visuelle', 'questions']);
  });

  it('dès le CE2, les six', () => {
    expect(typesPourLeRang(3)).toHaveLength(6);
  });
});
