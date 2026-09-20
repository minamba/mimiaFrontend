import { render, screen } from '@testing-library/react';
import { lireSurlignes, sansSurlignes } from '../lib/storage/surlignesTableau';
import { ContenuTableau } from '../components/ComparaisonDictee';

/**
 * LES MOTS SURLIGNÉS PAR LE PROFESSEUR — Camara, le 18/09/2026, en pleine
 * correction d'une expression écrite : « j'aimerais que le professeur surligne
 * les mots problématiques ».
 *
 * LA DICTÉE AVAIT SES SURLIGNÉS, MAIS ILS VENAIENT D'UNE COMPARAISON avec le
 * texte dicté. Une rédaction n'a pas de texte modèle : rien ne permet à
 * l'écran de deviner que « partie » est fautif dans « on est partie » et juste
 * dans « je suis partie ». C'est au professeur de le désigner, en l'encadrant :
 * `==partie==`.
 *
 * CE QUE CES TESTS PROTÈGENT
 * -------------------------
 * 1. LE MOT RESTE CELUI DE L'ENFANT. Surligner ne corrige pas.
 * 2. UN `==` ORPHELIN NE MANGE PAS LE RESTE DU TABLEAU. Un modèle en oublie un
 *    tôt ou tard ; sans borne, tout ce qui suit se retrouverait surligné.
 * 3. LA DICTÉE GARDE SES PROPRES BADGES. Deux sources de numéros sur un même
 *    tableau se contrediraient.
 */

describe('Le découpage', () => {
  test('rien de surligné : le tableau s’affiche tel quel', () => {
    expect(lireSurlignes('La consigne\nRaconte ta sortie.')).toBeNull();
    expect(lireSurlignes(undefined)).toBeNull();
  });

  test('chaque mot encadré devient une faute numérotée, dans l’ordre', () => {
    const lu = lireSurlignes('je suis partie au cinéma ==vec== mes amis\non est ==partie== regarder');

    expect(lu.erreurs).toBe(2);

    const mots = lu.segments.filter((s) => s.type === 'mot');
    expect(mots.map((m) => [m.texte, m.erreur])).toEqual([['vec', 1], ['partie', 2]]);
  });

  test('le mot surligné reste celui de l’enfant, fautes comprises', () => {
    // LE CŒUR DU SUJET : surligner n'est pas corriger.
    const lu = lireSurlignes('au ==resaurant== manger');

    expect(lu.segments.find((s) => s.type === 'mot').texte).toBe('resaurant');
  });

  test('le texte autour est rendu intact, retours à la ligne compris', () => {
    const lu = lireSurlignes('Ton texte\nje ==vec== toi\nfin');
    const recolle = lu.segments.map((s) => s.texte).join('');

    expect(recolle).toBe('Ton texte\nje vec toi\nfin');
  });

  test('un `==` orphelin ne surligne pas tout le reste du tableau', () => {
    // Un surligné ne franchit jamais une ligne : le `==` oublié en ligne 1 ne
    // va pas chercher sa fermeture trois lignes plus bas.
    const lu = lireSurlignes('on est ==partie regarder\nle film\nun ==mot== ici');

    const mots = lu.segments.filter((s) => s.type === 'mot').map((s) => s.texte);
    expect(mots).toEqual(['mot']);
  });

  test('deux lectures à la suite rendent le même résultat', () => {
    // Le motif est global : un `lastIndex` qui traînerait ferait lire le
    // second tableau à moitié.
    const tableau = 'un ==mot== ici';

    expect(lireSurlignes(tableau).erreurs).toBe(1);
    expect(lireSurlignes(tableau).erreurs).toBe(1);
  });
});

describe('Pour l’archive', () => {
  test('les marques disparaissent, le mot reste', () => {
    expect(sansSurlignes('Last weekend I ==go== to the park with my ==frend==.'))
      .toBe('Last weekend I go to the park with my frend.');
  });
});

describe('Au tableau', () => {
  test('le mot est surligné et numéroté', () => {
    const { container } = render(
      <ContenuTableau contenu={'Ton texte\non est ==partie== regarder le film'} />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const surligne = container.querySelector('mark');
    expect(surligne).toHaveTextContent('partie');
    expect(screen.getByText('1')).toBeInTheDocument();

    // Et les signes égal ne s'affichent jamais.
    expect(screen.queryByText(/==/)).not.toBeInTheDocument();
  });

  test('une correction de dictée garde ses propres badges', () => {
    // Des `==` qui traîneraient dans une dictée ne doivent pas ajouter une
    // seconde numérotation par-dessus celle de la comparaison.
    render(
      <ContenuTableau
        contenu={'La dictée\nLes enfants sont partis.\n\nTa copie\nLes enfant sont partis.'}
      />,
    );

    expect(screen.getByText('enfant')).toBeInTheDocument();
  });
});
