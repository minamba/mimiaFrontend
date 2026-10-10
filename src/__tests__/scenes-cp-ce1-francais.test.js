/**
 * LES UNIVERS DES JEUX DE LECTURE DU CP ET DU CE1 (09/10/2026) — chaque écran
 * garde sa règle (ses propres tests le vérifient) ; ici, ce qu'on lui a
 * ajouté : il se rend à chacune de ses classes, son décor et sa mascotte
 * sont là, la réussite lance la fête (et la mascotte la fête), l'erreur fait
 * encourager. Pour la roue, qui passe par `JeuDeChoix`, le contrat des scènes :
 * la question entière à l'écran, avant et après la réponse, et un bouton par
 * ticket qui appelle `choisir`.
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte, ses classes, ses attributs. */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PecheAuxSons from '../components/jeux/PecheAuxSons';
import AtelierDesSyllabes from '../components/jeux/AtelierDesSyllabes';
import MotsEclair from '../components/jeux/MotsEclair';
import UnOuDes from '../components/jeux/UnOuDes';
import DetectiveDuVerbe from '../components/jeux/DetectiveDuVerbe';
import PhraseQuiDitNon from '../components/jeux/PhraseQuiDitNon';
import RoueDesVerbes from '../components/jeux/RoueDesVerbes';
import { SceneRoue, TicketsForains, terminaison } from '../components/jeux/scenes/cp-ce1-francais/Roue';
import { PhraseQuiDitNonEcrite } from '../components/jeux/scenes/cp-ce1-francais/Non';
import * as peche from '../lib/jeux/pecheAuxSons';
import * as syllabes from '../lib/jeux/atelierDesSyllabes';
import * as eclair from '../lib/jeux/motsEclair';
import * as unOuDes from '../lib/jeux/unOuDes';
import * as detective from '../lib/jeux/detectiveDuVerbe';
import * as negation from '../lib/jeux/phraseQuiDitNon';
import * as roue from '../lib/jeux/roueDesVerbes';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const GRAINE = 2024;
const normaliser = (t) => String(t).replace(/\s+/g, ' ').trim();

afterEach(() => { jest.restoreAllMocks(); });
beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

const ECRANS = [
  ['peche-aux-sons', PecheAuxSons, 'tortue'],
  ['atelier-syllabes', AtelierDesSyllabes, 'note'],
  ['mots-eclair', MotsEclair, 'eclair'],
  ['un-ou-des', UnOuDes, 'nounours'],
  ['detective-du-verbe', DetectiveDuVerbe, 'loupe'],
  ['phrase-qui-dit-non', PhraseQuiDitNon, 'chat'],
  ['roue-des-verbes', RoueDesVerbes, 'ampoule'],
];

/** Les classes où l'écran est À NOUS : le CP et le CE1 (et le CE2 de la roue). */
const NOS_CLASSES = {
  'peche-aux-sons': ['CP'],
  'atelier-syllabes': ['CP'],
  'mots-eclair': ['CP'],
  'un-ou-des': ['CP'],
  'detective-du-verbe': ['CE1'],
  'phrase-qui-dit-non': ['CE1'],
  'roue-des-verbes': ['CE1', 'CE2'],
};

const mascotte = (c) => c.querySelector('[data-mascotte]');
const fete = (c) => c.querySelector('.sc-cp-ce1-francais__fete');

describe('chaque écran, à chacune de ses classes', () => {
  ECRANS.forEach(([cle, Ecran, nom]) => {
    const niveaux = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].filter((n) => jeuxDeLaClasse(n).some((j) => j.cle === cle));

    it(`${cle} : se rend sans erreur à ${niveaux.join(', ')}`, () => {
      expect(niveaux.length).toBeGreaterThan(0);
      niveaux.forEach((niveau) => {
        const { unmount } = render(<Ecran niveau={niveau} onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
        expect(screen.getByRole('button', { name: /Revenir aux jeux/ })).toBeInTheDocument();
        unmount();
      });
    });

    it(`${cle} : le décor et la mascotte (${nom}) sont là, sans fête avant la réussite`, () => {
      NOS_CLASSES[cle].forEach((niveau) => {
        const { container, unmount } = render(<Ecran niveau={niveau} onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
        expect(container.querySelector('.sc-cp-ce1-francais')).not.toBeNull();
        expect(container.querySelector('.sc-cp-ce1-francais__decor, .sc-roue-des-verbes__roue')).not.toBeNull();
        expect(mascotte(container)).toHaveAttribute('data-mascotte', nom);
        expect(mascotte(container)).toHaveAttribute('data-humeur', 'attente');
        expect(mascotte(container)).toHaveAttribute('aria-hidden', 'true');
        expect(fete(container)).toBeNull();
        unmount();
      });
    });
  });
});

describe('la réussite lance la fête', () => {
  it('la pêche aux sons : le coffre s’ouvre, la tortue fête', async () => {
    const { container } = render(<PecheAuxSons onQuitter={jest.fn()} />);
    const m = peche.serie(GRAINE)[0];
    const intrus = m.poissons.find((p) => !p.cible);

    await userEvent.click(screen.getByRole('button', { name: peche.mot(intrus.mot).mot }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'encourage');
    expect(fete(container)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: `${peche.mot(intrus.mot).mot}, pêché` }));
    for (const p of m.poissons.filter((x) => x.cible)) {
      await userEvent.click(screen.getByRole('button', { name: peche.mot(p.mot).mot }));
    }
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(fete(container)).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
    expect(container.querySelector('.sc-peche-aux-sons__coffre.est-ouvert')).not.toBeNull();
    // Une seule zone de statut : la fête et la mascotte ne parlent pas.
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('l’atelier des syllabes : le train chante, Do fête', async () => {
    const { container } = render(<AtelierDesSyllabes onQuitter={jest.fn()} />);
    const m = syllabes.serie(GRAINE)[0];
    for (const s of syllabes.mot(m.mot).syllabes) {
      await userEvent.click(screen.getAllByRole('button', { name: s })[0]);
    }
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
    expect(fete(container)).not.toBeNull();
    expect(container.querySelector('.sc-atelier-syllabes.est-fete')).not.toBeNull();
    expect(container.querySelector('.sc-atelier-syllabes__xylo.est-joue')).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
  });

  describe('les mots éclair', () => {
    // Les minuteries simulées remplacent `Date` : la graine se refixe après elles.
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(Date, 'now').mockReturnValue(GRAINE);
    });
    afterEach(() => { jest.useRealTimers(); });

    it('l’éclair illumine la pièce sans écrire un mot de plus ; la bonne carte lance la fête', () => {
      const { container } = render(<MotsEclair onQuitter={jest.fn()} />);
      const m = eclair.serie(GRAINE)[0];
      // Aucun mot dans le décor : le mot éclair ne se lit nulle part avant l'éclair.
      expect(screen.queryByText(m.mot)).not.toBeInTheDocument();
      expect(container.querySelector('.sc-cp-ce1-francais__decor').textContent).toBe('');

      userEvent.click(screen.getByRole('button', { name: /Montre le mot/ }));
      expect(container.querySelector('.sc-mots-eclair__flash')).not.toBeNull();
      expect(mascotte(container)).toHaveAttribute('data-humeur', 'eclair');
      act(() => { jest.advanceTimersByTime(eclair.dureeEclair(0)); });

      const fausse = m.cartes.find((c) => c !== m.mot);
      userEvent.click(screen.getByRole('button', { name: fausse }));
      expect(mascotte(container)).toHaveAttribute('data-humeur', 'encourage');
      userEvent.click(screen.getByRole('button', { name: m.mot }));
      expect(fete(container)).not.toBeNull();
      expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
    });
  });

  it('un ou des ? : les jouets sautent, le nounours fête', async () => {
    const { container } = render(<UnOuDes onQuitter={jest.fn()} />);
    const m = unOuDes.serie(GRAINE)[0];
    const [petit, forme] = unOuDes.etiquette(m).split(' ');
    await userEvent.click(screen.getByRole('button', { name: petit }));
    await userEvent.click(screen.getByRole('button', { name: forme }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(fete(container)).not.toBeNull();
    expect(container.querySelector('.sc-un-ou-des.est-fete')).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
    expect(container.querySelector('.sc-cp-ce1-francais__decor').textContent).toBe('');
  });

  it('le détective : le verbe trouvé réjouit la loupe, l’affaire résolue fait tomber le tampon', async () => {
    const { container } = render(<DetectiveDuVerbe onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const p = detective.phrase(detective.serie(GRAINE)[0]);

    await userEvent.click(screen.getByRole('button', { name: p.mots[p.verbe] }));
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
    expect(container.querySelector('.sc-detective-du-verbe__tampon')).toBeNull();

    const pasLeSujet = p.mots.findIndex((_, i) => i !== p.verbe && !p.sujet.includes(i));
    await userEvent.click(screen.getAllByRole('button', { name: p.mots[pasLeSujet] })[0]);
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'encourage');

    await userEvent.click(screen.getAllByRole('button', { name: p.mots[p.sujet[0]] })[0]);
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
    expect(container.querySelector('.sc-detective-du-verbe__tampon')).not.toBeNull();
    expect(fete(container)).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
  });

  it('la phrase qui dit non : « ne » et « pas » s’allument, le chat lève le panneau', async () => {
    const { container } = render(<PhraseQuiDitNon onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const p = negation.phrase(negation.serie(GRAINE)[0]);
    const f = negation.formeDuNe(p);

    await userEvent.click(screen.getByRole('button', { name: f }));
    await userEvent.click(screen.getAllByRole('button', { name: `Poser ${f} ici` })[p.verbe]);
    await userEvent.click(screen.getAllByRole('button', { name: 'Poser pas ici' })[p.verbe]);
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));

    expect(fete(container)).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
    const finale = container.querySelector('.non__finale');
    expect(finale.textContent).toBe(negation.negative(p));
    expect([...finale.querySelectorAll('.sc-phrase-qui-dit-non__rouge')].map((e) => e.textContent)).toEqual([f, 'pas']);
  });

  it('la roue : la bonne forme lance la fête et allume la terminaison ; la mauvaise fait encourager', async () => {
    const { container } = render(<RoueDesVerbes onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const m = roue.serie(GRAINE)[0];
    const bonne = roue.forme(m.verbe, m.pronom);
    const faux = m.choix.find((c) => c !== bonne);

    await userEvent.click(screen.getByRole('button', { name: faux }));
    expect(screen.getByRole('button', { name: faux })).toBeDisabled();
    expect(screen.getByRole('button', { name: faux })).toHaveClass('est-faux');
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'encourage');

    await userEvent.click(screen.getByRole('button', { name: bonne }));
    expect(fete(container)).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
    expect(container.querySelector('.sc-roue-des-verbes__roue.est-gagnee')).not.toBeNull();
    expect(container.querySelector('.roue__phrase').textContent).toBe(roue.avecPronom(m.pronom, bonne));
  });
});

describe('la roue des verbes, contrat des scènes (JeuDeChoix)', () => {
  ['CE1', 'CE2'].forEach((niveau) => {
    it(`${niveau} : 25 graines, chaque manche — la question entière, avant et après ; rien ne trahit la réponse`, () => {
      for (let g = 0; g < 25; g += 1) {
        roue.serie(g * 7919 + 13, niveau).forEach((m) => {
          const bonne = roue.forme(m.verbe, m.pronom, m.temps);
          const attendus = [m.verbe, m.pronom];
          if (m.temps) attendus.push(roue.TEMPS.find((t) => t.cle === m.temps).moment);

          let view = render(<>{<SceneRoue m={m} termine={false} extra={{}} />}</>);
          const texteAvant = normaliser(view.container.textContent);
          attendus.forEach((t) => expect(texteAvant).toContain(normaliser(t)));
          expect(view.container.querySelector('.sc-roue-des-verbes__fin')).toBeNull();
          expect(view.container.querySelector('.roue__phrase').textContent).toBe(`${m.pronom} …`);
          view.unmount();

          view = render(<>{<SceneRoue m={m} termine extra={{ trouve: true }} />}</>);
          const texteApres = normaliser(view.container.textContent);
          attendus.forEach((t) => expect(texteApres).toContain(normaliser(t)));
          expect(view.container.querySelector('.roue__phrase').textContent).toBe(roue.avecPronom(m.pronom, bonne));
          view.unmount();

          const choisir = jest.fn();
          const choix = m.choix.map((f) => ({ cle: f, libelle: f }));
          view = render(<TicketsForains choix={choix} fautes={[]} choisir={choisir} />);
          expect(screen.getAllByRole('button')).toHaveLength(choix.length);
          choix.forEach(({ cle, libelle }) => {
            userEvent.click(screen.getByRole('button', { name: libelle }));
            expect(choisir).toHaveBeenLastCalledWith(cle);
          });
          view.unmount();
        });
      }
    });
  });

  it('un ticket faux est barré et ne se reclique pas', () => {
    const choisir = jest.fn();
    render(<TicketsForains choix={[{ cle: 'a', libelle: 'chante' }, { cle: 'b', libelle: 'chantes' }]} fautes={['b']} choisir={choisir} />);
    expect(screen.getByRole('button', { name: 'chantes' })).toBeDisabled();
    userEvent.click(screen.getByRole('button', { name: 'chantes' }));
    expect(choisir).not.toHaveBeenCalled();
  });

  it('la terminaison : radical et fin, l’infinitif au futur, rien pour être et avoir', () => {
    expect(terminaison('chanter', 'chantons', 'present')).toEqual(['chant', 'ons']);
    expect(terminaison('chanter', 'chantaient', 'imparfait')).toEqual(['chant', 'aient']);
    expect(terminaison('chanter', 'chanterai', 'futur')).toEqual(['chanter', 'ai']);
    expect(terminaison('être', 'sommes', 'present')).toBeNull();
    expect(terminaison('avoir', 'aurai', 'futur')).toBeNull();
  });
});

describe('la phrase négative habillée', () => {
  it('garde le texte mot pour mot et n’allume que « ne », « n’ » et « pas »', () => {
    negation.PHRASES_JEU.forEach((p) => {
      const texte = negation.negative(p);
      const { container, unmount } = render(<p><PhraseQuiDitNonEcrite texte={texte} /></p>);
      expect(container.textContent).toBe(texte);
      const rouges = [...container.querySelectorAll('.sc-phrase-qui-dit-non__rouge')].map((e) => e.textContent);
      expect(rouges).toEqual([negation.formeDuNe(p), 'pas']);
      unmount();
    });
  });
});
