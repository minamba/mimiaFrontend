/**
 * LES UNIVERS DES TROIS JEUX DE GRAMMAIRE DU CE2 (09/10/2026) — voir
 * `components/jeux/scenes/ce2-francais-b/`. Chaque écran garde sa règle (ses
 * propres tests le vérifient, dans `extensionsCE2.test.js`) ; ici, ce qu'on
 * lui a ajouté : le décor et la mascotte sont là, rien ne trahit la réponse
 * avant la fin, la réussite lance la fête et l'explication animée, l'erreur
 * fait encourager, l'aide fait expliquer. Pour « transforme la phrase », qui
 * passe par `JeuDeChoix`, le contrat des scènes : la question entière à
 * l'écran avant et après la réponse, et un bouton par nuage qui appelle
 * `choisir(cle)`. Vingt-cinq graines, chaque manche.
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte, ses classes, ses attributs. */

import {
  fireEvent, render, screen, within,
} from '@testing-library/react';
import UnOuDes from '../components/jeux/UnOuDes';
import DetectiveDuVerbe from '../components/jeux/DetectiveDuVerbe';
import PhraseQuiDitNon from '../components/jeux/PhraseQuiDitNon';
import { changement, ExplicationAccord, pairesDu } from '../components/jeux/scenes/ce2-francais-b/Tonnelle';
import { epingles, motNu } from '../components/jeux/scenes/ce2-francais-b/Enquete';
import scene, {
  bonneTransformation, morceauxTransformes, phraseDeDepart,
} from '../components/jeux/scenes/ce2-francais-b/Lac';
import * as accords from '../lib/jeux/accordsCE2';
import * as detective from '../lib/jeux/detectiveDuVerbe';
import * as negation from '../lib/jeux/phraseQuiDitNon';

const GRAINES = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);
const normaliser = (t) => String(t).replace(/\s+/g, ' ').trim();

const mascotte = (c) => c.querySelector('[data-mascotte]');
const fete = (c) => c.querySelector('.sc-ce2-francais-b__fete');

afterEach(() => { jest.restoreAllMocks(); });

// ------------------------------------------------------------ féminin et pluriel

describe('féminin et pluriel (un-ou-des, CE2) : la tonnelle fleurie', () => {
  it('la fin effacée et la fin écrite de chaque mot', () => {
    expect(changement('cheval', 'chevaux')).toEqual({ racine: 'cheva', ote: 'l', ajoute: 'ux' });
    expect(changement('boulanger', 'boulangère')).toEqual({ racine: 'boulang', ote: 'er', ajoute: 'ère' });
    expect(changement('souris', 'souris')).toEqual({ racine: 'souris', ote: '', ajoute: '' });
    expect(changement('un', 'des')).toEqual({ racine: '', ote: 'un', ajoute: 'des' });
    // Jamais d'erreur, même sans données.
    expect(pairesDu(undefined)).toEqual([]);
    expect(pairesDu({ depart: 'un chat', det: 'des', nom: 'chats', adj: 'gris' })).toEqual([]);
  });

  it('chaque groupe s’explique : le mot de départ, le mot d’arrivée, rien de perdu', () => {
    accords.GROUPES.forEach((g) => {
      const { container, unmount } = render(<ExplicationAccord g={g} />);
      const paires = container.querySelectorAll('.sc-un-ou-des-ce2__paire');
      expect(paires).toHaveLength(3);
      const depart = g.depart.split(' ');
      [g.det, g.nom, g.adj].forEach((apres, i) => {
        expect(paires[i].querySelector('.sc-un-ou-des-ce2__avant').textContent).toBe(depart[i]);
        expect(paires[i].querySelector('.sc-un-ou-des-ce2__apres').textContent).toBe(apres);
      });
      unmount();
    });
  });

  it('25 parties, chaque manche : décor, Fleurette ; rien avant l’annonce ; la fête et l’explication à la bonne étiquette', () => {
    GRAINES.forEach((graine) => {
      jest.spyOn(Date, 'now').mockReturnValue(graine);
      const { container, unmount } = render(<UnOuDes niveau="CE2" onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
      expect(container.querySelector('.sc-un-ou-des-ce2__decor')).not.toBeNull();
      accords.serie(graine).forEach((m) => {
        const g = accords.groupe(m.groupe);
        // Le départ reste à l'écran, sur le tableau.
        expect(normaliser(container.querySelector('.sc-un-ou-des-ce2__tableau').textContent)).toContain(g.depart);
        expect(mascotte(container)).toHaveAttribute('data-mascotte', 'fleurette');
        expect(mascotte(container)).toHaveAttribute('data-humeur', 'attente');
        expect(mascotte(container)).toHaveAttribute('data-sens', g.sens);
        expect(mascotte(container)).toHaveAttribute('aria-hidden', 'true');
        expect(fete(container)).toBeNull();
        expect(container.querySelector('.sc-un-ou-des-ce2__explication')).toBeNull();

        fireEvent.click(within(screen.getByRole('list', { name: 'Le nom' })).getByRole('button', { name: g.nom }));
        fireEvent.click(within(screen.getByRole('list', { name: 'L’adjectif' })).getByRole('button', { name: g.adj }));
        // Les deux choix posés, rien n'est encore jugé : toujours ni fête ni explication.
        expect(fete(container)).toBeNull();
        expect(container.querySelector('.sc-un-ou-des-ce2__explication')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));

        expect(fete(container)).not.toBeNull();
        expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
        expect(container.querySelector('.sc-un-ou-des-ce2.est-fete')).not.toBeNull();
        const apres = [...container.querySelectorAll('.sc-un-ou-des-ce2__apres')].map((e) => e.textContent);
        expect(apres).toEqual([g.det, g.nom, g.adj]);
        expect(screen.getAllByRole('status')).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: 'Continuer' }));
      });
      unmount();
      jest.restoreAllMocks();
    });
  });

  it('l’erreur fait encourager ; l’aide (trois erreurs) fait expliquer, sans fête', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const { container } = render(<UnOuDes niveau="CE2" onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const m = accords.serie(2024)[0];
    const g = accords.groupe(m.groupe);
    const fauxNom = m.noms.find((n) => n !== g.nom);

    fireEvent.click(within(screen.getByRole('list', { name: 'Le nom' })).getByRole('button', { name: fauxNom }));
    fireEvent.click(within(screen.getByRole('list', { name: 'L’adjectif' })).getByRole('button', { name: g.adj }));
    for (let i = 1; i < accords.ESSAIS_AVANT_AIDE; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
      expect(mascotte(container)).toHaveAttribute('data-humeur', 'encourage');
      expect(fete(container)).toBeNull();
      // Reposer le même choix efface le verdict : on peut annoncer de nouveau.
      fireEvent.click(within(screen.getByRole('list', { name: 'Le nom' })).getByRole('button', { name: fauxNom }));
    }
    fireEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'montre');
    expect(fete(container)).toBeNull();
    expect(container.querySelector('.sc-un-ou-des-ce2__explication')).not.toBeNull();
  });
});

// ------------------------------------------------------------ le détective des classes

describe('le détective des classes (detective-du-verbe, CE2) : le tableau de liège', () => {
  it('épingle chaque mot sur la fiche de sa classe, le bon seulement à la fin', () => {
    const p = { mots: ['Ils', 'jouent', 'dans', 'le', 'jardin.'], classes: ['pronom', 'verbe', 'autre', 'determinant', 'nom'] };
    const avant = epingles(p, 'nom', [0, 2]);
    expect(avant.pronom.map((x) => x.mot)).toEqual(['Ils']);
    expect(avant.nom).toEqual([]);
    // « dans » n'est d'aucune classe : épinglé nulle part.
    expect(Object.values(avant).flat()).toHaveLength(1);
    expect(epingles(p, 'nom', [0], 4).nom).toEqual([{ i: 4, mot: 'jardin', bon: true }]);
    expect(epingles(p, 'determinant', [0, 1], null, true).determinant.map((x) => x.mot)).toEqual(['le']);
    expect(motNu('dort.')).toBe('dort');
    expect(epingles(undefined, 'nom')).toEqual({
      nom: [], verbe: [], determinant: [], adjectif: [], pronom: [],
    });
  });

  it('25 parties, chaque manche : la fiche recherchée, le mot faux classé, la fête au bon mot', () => {
    GRAINES.forEach((graine) => {
      jest.spyOn(Date, 'now').mockReturnValue(graine);
      const { container, unmount } = render(<DetectiveDuVerbe niveau="CE2" onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
      expect(container.querySelector('.sc-detective-du-verbe-ce2__decor')).not.toBeNull();
      detective.serieCE2(graine).forEach(({ phrase, cible }) => {
        const p = detective.PHRASES_CE2[phrase];
        const fiche = (c) => container.querySelector(`.sc-detective-du-verbe-ce2__fiche[data-classe="${c}"]`);
        expect(container.querySelectorAll('.sc-detective-du-verbe-ce2__fiche')).toHaveLength(5);
        expect(fiche(cible)).toHaveClass('est-recherchee');
        expect(container.querySelectorAll('.est-recherchee')).toHaveLength(1);
        expect(container.querySelector('.sc-detective-du-verbe-ce2__piece')).toBeNull();
        expect(mascotte(container)).toHaveAttribute('data-mascotte', 'tasse');
        expect(mascotte(container)).toHaveAttribute('data-humeur', 'attente');
        expect(fete(container)).toBeNull();

        // Un mot faux d'une des cinq classes (« dans » ne s'épingle nulle part : voir plus haut).
        const faux = p.classes.findIndex((c) => c !== cible && c !== 'autre');
        fireEvent.click(screen.getAllByRole('button', { name: p.mots[faux] })[0]);
        expect(mascotte(container)).toHaveAttribute('data-humeur', 'encourage');
        expect(fete(container)).toBeNull();
        expect(fiche(p.classes[faux]).textContent).toContain(motNu(p.mots[faux]));
        // Avant la fin, la fiche recherchée reste vide.
        expect(fiche(cible).querySelector('.est-bon')).toBeNull();

        const bon = p.classes.indexOf(cible);
        fireEvent.click(screen.getAllByRole('button', { name: p.mots[bon] })[0]);
        expect(fete(container)).not.toBeNull();
        expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
        expect(fiche(cible).querySelector('.est-bon').textContent).toBe(motNu(p.mots[bon]));
        expect(fiche(cible).querySelector('.sc-detective-du-verbe-ce2__tampon')).not.toBeNull();
        expect(screen.getAllByRole('status')).toHaveLength(1);
        expect(screen.getByRole('status')).toHaveTextContent(detective.PHRASES_CLASSES.definition[cible]);
        fireEvent.click(screen.getByRole('button', { name: 'Continuer' }));
      });
      unmount();
      jest.restoreAllMocks();
    });
  });

  it('montré après deux erreurs : la tasse explique, tous les mots de la classe épinglés, sans fête', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const { container } = render(<DetectiveDuVerbe niveau="CE2" onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const { phrase, cible } = detective.serieCE2(2024)[0];
    const p = detective.PHRASES_CE2[phrase];
    const faux = p.classes.map((c, i) => (c !== cible ? i : -1)).filter((i) => i >= 0).slice(0, 2);
    faux.forEach((i) => fireEvent.click(screen.getAllByRole('button', { name: p.mots[i] })[0]));
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'montre');
    expect(fete(container)).toBeNull();
    const attendus = p.mots.filter((_, i) => p.classes[i] === cible).map(motNu);
    const fiche = container.querySelector(`.sc-detective-du-verbe-ce2__fiche[data-classe="${cible}"]`);
    expect([...fiche.querySelectorAll('.est-bon')].map((e) => e.textContent)).toEqual(attendus);
  });
});

// ------------------------------------------------------------ transforme la phrase

describe('transforme la phrase (phrase-qui-dit-non, CE2) : le tableau au bord du lac', () => {
  /** Ce qui doit s'allumer, au moins, selon la forme. */
  const ATTENDUS = { negative: ['pas'], interrogative: ['Est-ce', '?'], exclamative: ['Comme', '!'] };

  it('ce qui change s’allume, et la phrase reste entière', () => {
    negation.PHRASES_JEU.forEach((p) => negation.FORMES.forEach((f) => {
      negation.propositions(p, f).forEach(({ texte }) => {
        expect(morceauxTransformes(texte, p.mots).map((x) => x.t).join('')).toBe(texte);
      });
      const bonne = negation.propositions(p, f)[0].texte;
      const ajouts = morceauxTransformes(bonne, p.mots).filter((x) => x.ajout).map((x) => x.t);
      expect(ajouts).toEqual(expect.arrayContaining(ATTENDUS[f]));
      // « ne » ou « n’ » s'allume aussi à la forme négative.
      expect(f !== 'negative' || ajouts.some((a) => /^n(e|’)$/.test(a))).toBe(true);
      // Les mots de la phrase de départ ne s'allument jamais.
      const connus = p.mots.map((m) => m.toLowerCase().replace(/[.!?]/g, ''));
      expect(ajouts.filter((a) => connus.includes(a.toLowerCase()))).toEqual([]);
    }));
    expect(morceauxTransformes(undefined)).toEqual([{ t: '' }]);
  });

  it('25 graines, chaque manche — la question entière avant et après ; rien ne trahit la réponse ; la fête et la phrase écrite à la fin', () => {
    GRAINES.forEach((g) => negation.serieCE2(g).forEach((m) => {
      const depart = phraseDeDepart(m);
      const bonne = bonneTransformation(m);
      expect(depart).toBe(negation.phrase(m.phrase).mots.join(' '));

      let view = render(<>{scene.question(m, false, {})}</>);
      expect(normaliser(view.container.textContent)).toContain(normaliser(depart));
      expect(view.container.querySelector('.sc-phrase-qui-dit-non-ce2__seau')).not.toBeNull();
      expect(view.container.querySelector('[data-mascotte="seau"]')).toHaveAttribute('data-humeur', 'attente');
      expect(view.container.querySelector('[role="status"]')).toBeNull();
      expect(fete(view.container)).toBeNull();
      expect(view.container.querySelector('.sc-phrase-qui-dit-non-ce2__ecrite')).toBeNull();
      expect(view.container.querySelector('.est-termine')).toBeNull();
      expect(normaliser(view.container.textContent)).not.toContain(normaliser(bonne));
      view.unmount();

      view = render(<>{scene.question(m, true, { trouve: true })}</>);
      expect(normaliser(view.container.textContent)).toContain(normaliser(depart));
      expect(view.container.querySelector('.sc-phrase-qui-dit-non-ce2__ecrite').textContent).toBe(bonne);
      expect(view.container.querySelectorAll('.sc-phrase-qui-dit-non-ce2__ajout').length).toBeGreaterThan(0);
      expect(fete(view.container)).not.toBeNull();
      expect(view.container.querySelector('[data-mascotte="seau"]')).toHaveAttribute('data-humeur', 'bravo');
      view.unmount();

      view = render(<>{scene.question(m, true, { montrer: true })}</>);
      expect(fete(view.container)).toBeNull();
      expect(view.container.querySelector('[data-mascotte="seau"]')).toHaveAttribute('data-humeur', 'montre');
      view.unmount();

      const faute = m.choix.find((c) => c.faute).texte;
      view = render(<>{scene.question(m, false, { derniereFaute: faute })}</>);
      expect(view.container.querySelector('[data-mascotte="seau"]')).toHaveAttribute('data-humeur', 'encourage');
      view.unmount();

      const choisir = jest.fn();
      const choix = m.choix.map((c) => ({ cle: c.texte, libelle: c.texte }));
      view = render(<>{scene.choix({ m, choix, fautes: [], choisir })}</>);
      expect(screen.getAllByRole('button')).toHaveLength(choix.length);
      choix.forEach(({ cle, libelle }) => {
        fireEvent.click(screen.getByRole('button', { name: libelle }));
        expect(choisir).toHaveBeenLastCalledWith(cle);
      });
      view.unmount();

      view = render(<>{scene.choix({ m, choix, fautes: [faute], choisir: jest.fn() })}</>);
      expect(screen.getByRole('button', { name: faute })).toBeDisabled();
      expect(screen.getByRole('button', { name: faute })).toHaveClass('est-fausse');
      view.unmount();
    }));
  });

  it('à l’écran : le décor et le seau ; la mauvaise fait encourager, la bonne fait la fête', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const { container } = render(<PhraseQuiDitNon niveau="CE2" onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const m = negation.serieCE2(2024)[0];
    expect(container.querySelector('.sc-phrase-qui-dit-non-ce2.jeu')).not.toBeNull();
    expect(container.querySelector('.sc-phrase-qui-dit-non-ce2__decor')).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-mascotte', 'seau');
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'attente');

    const faux = m.choix.find((c) => c.faute);
    fireEvent.click(screen.getByRole('button', { name: faux.texte }));
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'encourage');
    expect(fete(container)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: bonneTransformation(m) }));
    expect(fete(container)).not.toBeNull();
    expect(mascotte(container)).toHaveAttribute('data-humeur', 'bravo');
    expect(container.querySelector('.sc-phrase-qui-dit-non-ce2__ecrite').textContent).toBe(bonneTransformation(m));
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});
