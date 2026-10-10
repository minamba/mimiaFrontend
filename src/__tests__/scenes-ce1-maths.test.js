/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   le décor, la mascotte et la fête sont cachés aux lecteurs d'écran
   (`aria-hidden`) : ils ne se trouvent que par leur classe. */
import { fireEvent, render, screen } from '@testing-library/react';
import CoffreDesCentaines from '../components/jeux/CoffreDesCentaines';
import CourseDesTables from '../components/jeux/CourseDesTables';
import PartsDePizza from '../components/jeux/PartsDePizza';
import MachineADix from '../components/jeux/MachineADix';
import PartageBonbons from '../components/jeux/PartageBonbons';
import MetreRuban from '../components/jeux/MetreRuban';
import * as coffre from '../lib/jeux/coffreDesCentaines';
import * as course from '../lib/jeux/courseDesTables';
import * as pizza from '../lib/jeux/partsDePizza';
import * as machine from '../lib/jeux/machineADix';
import * as partage from '../lib/jeux/partageBonbons';
import * as ruban from '../lib/jeux/metreRuban';
import { ChoixPartage, QuestionPartage } from '../components/jeux/scenes/ce1-maths/ScenePartage';
import {
  ChoixRuban, QuestionRuban, egalite, texteRuban,
} from '../components/jeux/scenes/ce1-maths/SceneRuban';

/**
 * LES SCÈNES DU GROUPE « CE1-MATHS » (09/10/2026) — le coffre des centaines,
 * la course des tables, les parts de pizza, la machine à dix (écrans
 * propres), le partage des bonbons et le mètre ruban (sur `JeuDeChoix`).
 *
 * Les écrans propres : à chaque classe, une partie entière jouée sans faute
 * — chaque manche se dessine, le décor et la mascotte sont là, la mascotte
 * attend, la fête part à chaque réussite et jamais avant ; une erreur fait
 * encourager la mascotte. Les écrans sur `JeuDeChoix` : vingt-cinq parties,
 * chaque manche, avant et après la réponse, la question entière à l'écran,
 * rien de partagé ni de converti d'avance, et des réponses qui restent des
 * boutons à leur libellé.
 */

const graines = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);
const net = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();
const UNE = {
  bloc: 'un bloc', plaque: 'une plaque', barre: 'une barre', cube: 'un cube',
};

afterEach(() => { jest.restoreAllMocks(); });

const clic = (nom) => fireEvent.click(screen.getByRole('button', { name: nom }));

/**
 * [nom, écran, préfixe, classes, série, jouer la bonne réponse, un mauvais choix (ou rien)].
 * `jouer` reçoit la manche et la classe.
 */
const ECRANS = [
  ['le coffre des centaines', CoffreDesCentaines, 'sc-coffre-des-centaines', ['CE1', 'CE2'], coffre.serie,
    (m, niveau) => {
      if (m.mode === 'lire') {
        clic(String(m.nombre));
        return;
      }
      const d = coffre.decomposer(m.nombre);
      coffre.colonnes(niveau).forEach(({ cle, piece }) => {
        for (let k = 0; k < d[cle]; k += 1) clic(`Ajouter ${UNE[piece]}`);
      });
      fireEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    },
    (m) => (m.mode === 'lire' ? String(m.choix.find((n) => n !== m.nombre)) : null)],
  ['la course des tables', CourseDesTables, 'sc-course-des-tables', ['CE1', 'CE2'], course.serie,
    (m) => clic(String(m.a * m.b)),
    (m) => String(m.choix.find((r) => r !== m.a * m.b))],
  ['les parts de pizza', PartsDePizza, 'sc-parts-de-pizza', ['CE1', 'CE2'], pizza.serie,
    (m) => { const b = pizza.reponse(m); clic(`${b.n} sur ${b.d}`); },
    (m) => { const b = pizza.reponse(m); const f = m.choix.find((c) => pizza.cle(c) !== pizza.cle(b)); return `${f.n} sur ${f.d}`; }],
  ['la machine à dix', MachineADix, 'sc-machine-a-dix', ['CE1', 'CE2'], machine.serie,
    (m) => clic(String(machine.reponse(m))),
    (m) => String(m.choix.find((n) => n !== machine.reponse(m)))],
];

const CAS_ECRANS = ECRANS.flatMap(([nom, Ecran, prefixe, classes, serie, jouer, faux]) => classes.map((niveau) => [nom, niveau, Ecran, prefixe, serie, jouer, faux]));

describe.each(CAS_ECRANS)('%s (%s), écran propre', (_, niveau, Ecran, prefixe, serie, jouer, faux) => {
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('une partie entière : chaque manche se dessine, le décor et la mascotte sont là, la fête part à chaque réussite', () => {
    const { container } = render(<Ecran onQuitter={jest.fn()} matiereCode="MATHS" niveau={niveau} />);
    const manches = serie(2024, niveau);
    expect(container.querySelector(`.${prefixe}`)).not.toBeNull();
    manches.forEach((m) => {
      expect(container.querySelector(`.${prefixe}__decor`)).not.toBeNull();
      expect(container.querySelector(`.${prefixe}__mascotte.est-attend`)).not.toBeNull();
      // Jamais de fête avant la réponse.
      expect(container.querySelector(`.${prefixe}__fete`)).toBeNull();
      jouer(m, niveau);
      expect(container.querySelector(`.${prefixe}__fete`)).not.toBeNull();
      expect(container.querySelector(`.${prefixe}__mascotte.est-bravo`)).not.toBeNull();
      expect(container.querySelector(`.${prefixe}.est-gagne`)).not.toBeNull();
      clic('Continuer');
    });
    // La partie est finie : l'écran de fin est là.
    expect(screen.getByRole('button', { name: 'Rejouer' })).toBeInTheDocument();
  });

  it('une erreur fait encourager la mascotte, sans fête', () => {
    const { container } = render(<Ecran onQuitter={jest.fn()} matiereCode="MATHS" niveau={niveau} />);
    const manches = serie(2024, niveau);
    // La première manche où l'on peut se tromper d'un clic (le coffre construit d'abord).
    const i = manches.findIndex((m) => faux(m) !== null);
    manches.slice(0, i).forEach((m) => { jouer(m, niveau); clic('Continuer'); });
    clic(faux(manches[i]));
    expect(container.querySelector(`.${prefixe}__mascotte.est-encourage`)).not.toBeNull();
    expect(container.querySelector(`.${prefixe}__bulle`)).not.toBeNull();
    expect(container.querySelector(`.${prefixe}__fete`)).toBeNull();
  });
});

describe('le coffre qui se construit : la mascotte encourage aussi une construction fausse', () => {
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('un coffre vide d’une colonne est nommé, la mascotte encourage', () => {
    const { container } = render(<CoffreDesCentaines onQuitter={jest.fn()} matiereCode="MATHS" niveau="CE1" />);
    clic('Ajouter un cube');
    fireEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.querySelector('.sc-coffre-des-centaines__mascotte.est-encourage')).not.toBeNull();
  });
});

/** [nom, série, scène, réponses, réponses-boutons, le texte de la question attendu]. */
const SCENES = [
  ['le partage des bonbons', (g) => partage.serie(g),
    (m, t, e) => <QuestionPartage m={m} termine={t} extra={e} />,
    (m) => m.choix.map((c) => ({ cle: c.cle, libelle: partage.ecrire(c) })),
    ChoixPartage,
    (m) => `${m.bonbons} bonbons pour ${m.amis} amis.`,
    'sc-partage-des-bonbons'],
  ['le mètre ruban', (g) => ruban.serie(g),
    (m, t, e) => <QuestionRuban m={m} termine={t} extra={e} />,
    (m) => m.choix.map((n) => ({ cle: n, libelle: `${ruban.ecrire(n)} ${m.unite}` })),
    ChoixRuban,
    (m, t) => texteRuban(m, t),
    'sc-metre-ruban'],
];

describe.each(SCENES)('%s, scène sur JeuDeChoix', (_, serie, question, choixDe, Choix, texte, prefixe) => {
  const manches = graines.flatMap((g) => serie(g));

  it('chaque manche se dessine avant et après la réponse, la question entière à l’écran', () => {
    manches.forEach((m) => {
      [false, true].forEach((termine) => {
        const { container, unmount } = render(<>{question(m, termine, termine ? { trouve: true } : {})}</>);
        expect(container).not.toBeEmptyDOMElement();
        expect(net(container.textContent)).toContain(net(texte(m, termine)));
        expect(container.querySelector(`.${prefixe}__mascotte`)).not.toBeNull();
        expect(container.querySelector(`.${prefixe}__mascotte.est-${termine ? 'bravo' : 'attend'}`)).not.toBeNull();
        expect(Boolean(container.querySelector(`.${prefixe}__fete`))).toBe(termine);
        unmount();
      });
    });
  });

  it('rien n’est donné avant la réponse', () => {
    manches.forEach((m) => {
      const { container, unmount } = render(<>{question(m, false, {})}</>);
      expect(container.querySelector('.sc-partage-des-bonbons__tombe')).toBeNull();
      expect(container.querySelector('.sc-metre-ruban__egalite')).toBeNull();
      unmount();
    });
  });

  it('une faute fait encourager la mascotte', () => {
    const m = manches[0];
    const { container } = render(<>{question(m, false, { derniereFaute: choixDe(m)[0].cle })}</>);
    expect(container.querySelector(`.${prefixe}__mascotte.est-encourage`)).not.toBeNull();
  });

  it('chaque réponse est un bouton à son libellé, qui répond au clic ; une réponse fausse ne se clique plus', () => {
    manches.forEach((m) => {
      const choix = choixDe(m);
      const choisir = jest.fn();
      const { unmount } = render(<Choix m={m} choix={choix} fautes={[]} choisir={choisir} objet={null} />);
      expect(screen.getAllByRole('button')).toHaveLength(choix.length);
      choix.forEach(({ cle, libelle }) => {
        fireEvent.click(screen.getByRole('button', { name: libelle }));
        expect(choisir).toHaveBeenLastCalledWith(cle);
      });
      unmount();
    });
    const m = manches[0];
    const choix = choixDe(m);
    render(<Choix m={m} choix={choix} fautes={[choix[0].cle]} choisir={jest.fn()} objet={null} />);
    expect(screen.getByRole('button', { name: choix[0].libelle })).toBeDisabled();
  });
});

describe('le mètre ruban : l’égalité à retenir', () => {
  it('chaque relation a la sienne', () => {
    expect(egalite({ relation: 'm-cm' })).toBe('1 m = 100 cm');
    expect(egalite({ relation: 'cm-mm' })).toBe('1 cm = 10 mm');
    expect(egalite({ relation: 'km-m' })).toBe('1 km = 1 000 m');
    expect(egalite({ relation: 'inconnue' })).toBeNull();
  });

  it('une question inattendue ne casse rien', () => {
    const { container } = render(<QuestionRuban m={{ question: 'drôle de question' }} termine />);
    expect(container.textContent).toContain('drôle de question');
  });
});

describe('les deux écrans sur JeuDeChoix, en entier', () => {
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('le partage : un sachet faux fait encourager l’ourson, le bon fait la fête et partage les bonbons', () => {
    const { container } = render(<PartageBonbons onQuitter={jest.fn()} matiereCode="MATHS" />);
    const m = partage.serie(2024)[0];
    const bonne = partage.ecrire(m.bonne);
    const fausse = m.choix.map(partage.ecrire).find((l) => l !== bonne);
    expect(container.querySelector('.sc-partage-des-bonbons__sachets')).not.toBeNull();
    clic(fausse);
    expect(container.querySelector('.sc-partage-des-bonbons__mascotte.est-encourage')).not.toBeNull();
    clic(bonne);
    expect(container.querySelector('.sc-partage-des-bonbons__mascotte.est-bravo')).not.toBeNull();
    expect(container.querySelector('.sc-partage-des-bonbons__fete')).not.toBeNull();
    expect(container.querySelectorAll('.sc-partage-des-bonbons__assiette .sc-partage-des-bonbons__tombe')).toHaveLength(m.amis * m.bonne.q);
  });

  it('le mètre ruban : la bonne planche fait la fête et montre l’égalité à retenir', () => {
    const { container } = render(<MetreRuban onQuitter={jest.fn()} matiereCode="MATHS" niveau="CE2" />);
    const m = ruban.serie(2024)[0];
    expect(container.querySelector('.sc-metre-ruban__planches')).not.toBeNull();
    clic(`${ruban.ecrire(m.bonne)} ${m.unite}`);
    expect(container.querySelector('.sc-metre-ruban__mascotte.est-bravo')).not.toBeNull();
    expect(container.querySelector('.sc-metre-ruban__fete')).not.toBeNull();
    expect(container.querySelector('.sc-metre-ruban__egalite').textContent).toBe(egalite(m));
  });
});
