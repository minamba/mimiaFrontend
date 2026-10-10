/**
 * LES SCÈNES DES JEUX DE FRANÇAIS DU CE1 ET DU CE2 SUR `JeuDeChoix`
 * (09/10/2026) — voir `components/jeux/scenes/ce2-francais/`. Pour chaque
 * jeu, chaque classe, vingt-cinq parties : la scène se dessine avant et après
 * la réponse sans erreur, le texte de la question reste à l'écran, la
 * mascotte est là, aucune réponse n'est donnée avant la fin, et chaque
 * réponse reste un bouton qui porte son libellé et appelle `choisir(cle)`.
 * Puis, à l'écran entier : la bonne réponse fait la fête, l'erreur fait
 * encourager la mascotte.
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte, ses classes, sa mascotte. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sceneDe } from '../components/jeux/scenes/ce2-francais';
import { indiceDe } from '../components/jeux/scenes/ce2-francais/Loupe';
import { racineCommune } from '../components/jeux/scenes/ce2-francais/Panneaux';
import { humeurDe } from '../components/jeux/scenes/ce2-francais/outils';
import OuQuandComment from '../components/jeux/OuQuandComment';
import SujetEloigne from '../components/jeux/SujetEloigne';
import AOuA from '../components/jeux/AOuA';
import TypesDePhrases from '../components/jeux/TypesDePhrases';
import ContrairesEtJumeaux from '../components/jeux/ContrairesEtJumeaux';
import * as oqc from '../lib/jeux/ouQuandComment';
import * as se from '../lib/jeux/sujetEloigne';
import * as aOuA from '../lib/jeux/aOuA';
import * as types from '../lib/jeux/typesDePhrases';
import * as cj from '../lib/jeux/contrairesEtJumeaux';

const normaliser = (t) => String(t).replace(/\s+/g, ' ').trim();

/** La phrase d'« où, quand, comment », telle que l'écran l'a toujours écrite. */
const phraseOqc = (p) => `${p.avant}${p.avant ? ' ' : ''}${p.groupe}${p.apres.startsWith(',') || p.apres === '.' ? '' : ' '}${p.apres}`;

/**
 * Chaque jeu : ses classes, sa série, ses choix (comme la règle de l'écran),
 * les morceaux de texte qui doivent rester à l'écran, la bonne réponse, la
 * réponse écrite une fois la manche finie (s'il y en a une), la classe de sa
 * mascotte.
 */
const JEUX = [
  {
    cle: 'ou-quand-comment',
    niveaux: ['CE2'],
    serie: (g) => oqc.serie(g),
    choix: () => oqc.QUESTIONS.map(({ cle, libelle }) => ({ cle, libelle })),
    textes: (p) => [phraseOqc(p)],
    bonne: (p) => p.type,
    mascotte: '.sc-ou-quand-comment__lanterne',
  },
  {
    cle: 'sujet-qui-s-eloigne',
    niveaux: ['CE2'],
    serie: (g) => se.serie(g),
    choix: (p) => p.choix.map((f) => ({ cle: f, libelle: f })),
    textes: (p) => [p.avant, p.apres],
    bonne: (p) => p.bon,
    affichee: (p) => p.bon,
    mascotte: '.sc-sujet-qui-s-eloigne__coureur',
  },
  {
    cle: 'a-ou-a',
    niveaux: ['CE1', 'CE2'],
    serie: (g, niveau) => aOuA.serie(g, niveau),
    choix: (p) => aOuA.paire(p).map((mot) => ({ cle: mot, libelle: mot })),
    textes: (p) => [p.avant, p.apres],
    bonne: (p) => p.bon,
    affichee: (p) => p.bon,
    mascotte: { CE1: '.sc-a-ou-a__lampe', CE2: '.sc-a-ou-a__soleil' },
  },
  {
    cle: 'types-de-phrases',
    niveaux: ['CE1'],
    serie: (g) => types.serie(g),
    choix: () => types.TYPES.map(({ cle, libelle }) => ({ cle, libelle })),
    textes: (p) => [p.texte],
    bonne: (p) => p.type,
    affichee: (p) => types.signe(p),
    mascotte: '.sc-types-de-phrases__loupe',
  },
  {
    cle: 'contraires-et-jumeaux',
    niveaux: ['CE1', 'CE2'],
    serie: (g, niveau) => cj.serie(g, niveau),
    choix: (m) => m.choix.map((mot) => ({ cle: mot, libelle: mot })),
    textes: (m) => [m.mot],
    bonne: (m) => cj.reponse(m),
    affichee: (m) => cj.reponse(m),
    mascotte: '.sc-contraires-et-jumeaux__oiseau',
  },
];

const CAS = JEUX.flatMap((j) => j.niveaux.map((niveau) => [j.cle, niveau, j]));
const GRAINES = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);

describe.each(CAS)('%s (%s)', (cle, niveau, jeu) => {
  const scene = sceneDe(cle, niveau);
  const mascotte = typeof jeu.mascotte === 'string' ? jeu.mascotte : jeu.mascotte[niveau];

  it('a une question et des réponses à sa façon', () => {
    expect(typeof scene.question).toBe('function');
    expect(typeof scene.choix).toBe('function');
  });

  it('se dessine avant et après la réponse, à chaque manche, sans perdre le texte ni donner la réponse', () => {
    GRAINES.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
      let view = render(<>{scene.question(m, false, {})}</>);
      const texteAvant = normaliser(view.container.textContent);
      jeu.textes(m).forEach((t) => expect(texteAvant).toContain(normaliser(t)));
      expect(view.container.querySelector(mascotte)).not.toBeNull();
      // Rien ne s'annonce : pas de rôle « status » dans la scène (c'est celui de l'écran).
      expect(view.container.querySelector('[role="status"]')).toBeNull();
      // Avant la réponse, ni fête, ni explication.
      expect(view.container.querySelector('.sc-ce2-francais__fete')).toBeNull();
      expect(view.container.querySelector('.est-termine')).toBeNull();
      view.unmount();

      view = render(<>{scene.question(m, true, { trouve: true })}</>);
      const texteApres = normaliser(view.container.textContent);
      jeu.textes(m).forEach((t) => expect(texteApres).toContain(normaliser(t)));
      expect(texteApres).toContain(normaliser(jeu.affichee?.(m) ?? ''));
      expect(view.container.querySelector('.sc-ce2-francais__fete')).not.toBeNull();
      expect(view.container.querySelector(mascotte).className).toContain('est-bravo');
      view.unmount();

      // Montrée après deux erreurs : pas de fête, la mascotte explique.
      view = render(<>{scene.question(m, true, { montrer: true })}</>);
      expect(view.container.querySelector('.sc-ce2-francais__fete')).toBeNull();
      expect(view.container.querySelector(mascotte).className).toContain('est-montre');
      view.unmount();

      // Après une faute : la mascotte encourage.
      const faute = jeu.choix(m).find((c) => c.cle !== jeu.bonne(m));
      view = render(<>{scene.question(m, false, { derniereFaute: faute.cle })}</>);
      expect(view.container.querySelector(mascotte).className).toContain('est-courage');
      view.unmount();
    }));
  });

  it('chaque réponse est un bouton à son nom, qui appelle choisir(cle) ; la fausse est barrée', async () => {
    const m = jeu.serie(GRAINES[3], niveau)[0];
    const choix = jeu.choix(m);
    const choisir = jest.fn();
    const { unmount } = render(<>{scene.choix({
      m, choix, fautes: [], choisir, objet: 'bulle',
    })}</>);
    const boutons = screen.getAllByRole('button');
    expect(boutons).toHaveLength(choix.length);
    // eslint-disable-next-line no-restricted-syntax
    for (const { cle: c, libelle } of choix) {
      const bouton = screen.getByRole('button', { name: libelle });
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click(bouton);
      expect(choisir).toHaveBeenLastCalledWith(c);
    }
    unmount();

    render(<>{scene.choix({
      m, choix, fautes: [choix[0].cle], choisir: jest.fn(), objet: 'bulle',
    })}</>);
    expect(screen.getByRole('button', { name: choix[0].libelle })).toBeDisabled();
    expect(screen.getByRole('button', { name: choix[0].libelle }).className).toContain('est-fausse');
    expect(screen.getByRole('button', { name: choix[1].libelle })).toBeEnabled();
  });
});

describe('les briques', () => {
  it('l’humeur de la mascotte suit la manche', () => {
    expect(humeurDe(false, {})).toBe('attend');
    expect(humeurDe(false, { derniereFaute: 'x' })).toBe('courage');
    expect(humeurDe(true, { trouve: true })).toBe('bravo');
    expect(humeurDe(true, { montrer: true })).toBe('montre');
  });

  it('la loupe trouve un indice dans chaque phrase du jeu', () => {
    types.PHRASES_JEU.forEach((p) => {
      const i = indiceDe(p);
      expect(i).not.toBeNull();
      expect(i.fin).toBeGreaterThan(i.debut);
    });
    expect(indiceDe({ texte: 'Aimes-tu les pommes', type: 'question' }).dit).toBe('le sujet derrière le verbe');
    expect(indiceDe({ texte: 'Quel âge as-tu', type: 'question' }).dit).toBe('un mot qui interroge');
    expect(indiceDe({ texte: 'Range ta chambre', type: 'ordre' })).toEqual({ debut: 0, fin: 5, dit: 'personne devant le verbe' });
    expect(indiceDe({ texte: '', type: 'question' })).toBeNull();
  });

  it('la famille de mots montre le morceau qu’elle partage', () => {
    expect(racineCommune('dent', 'dentiste')).toEqual({ i: 0, j: 0, n: 4 });
    expect(racineCommune('froid', 'refroidir')).toEqual({ i: 0, j: 2, n: 5 });
    expect(racineCommune('mer', 'marin')).toBeNull();
  });
});

describe('à l’écran entier', () => {
  afterEach(() => { jest.restoreAllMocks(); });
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  const ECRANS = [
    ['où, quand, comment', 'CE2', OuQuandComment, () => oqc.serie(2024)[0], (p) => oqc.QUESTIONS.find((q) => q.cle === p.type).libelle, (p) => oqc.QUESTIONS.find((q) => q.cle !== p.type).libelle, '.sc-ou-quand-comment__lanterne'],
    ['le sujet qui s’éloigne', 'CE2', SujetEloigne, () => se.serie(2024)[0], (p) => p.bon, (p) => p.proche, '.sc-sujet-qui-s-eloigne__coureur'],
    ['a ou à', 'CE1', AOuA, () => aOuA.serie(2024, 'CE1')[0], (p) => p.bon, (p) => aOuA.paire(p).find((x) => x !== p.bon), '.sc-a-ou-a__lampe'],
    ['son ou sont', 'CE2', AOuA, () => aOuA.serie(2024, 'CE2')[0], (p) => p.bon, (p) => aOuA.paire(p).find((x) => x !== p.bon), '.sc-a-ou-a__soleil'],
    ['raconte, question ou ordre', 'CE1', TypesDePhrases, () => types.serie(2024)[0], (p) => types.TYPES.find((t) => t.cle === p.type).libelle, (p) => types.TYPES.find((t) => t.cle !== p.type).libelle, '.sc-types-de-phrases__loupe'],
    ['contraires et jumeaux', 'CE1', ContrairesEtJumeaux, () => cj.serie(2024, 'CE1')[0], (m) => cj.reponse(m), (m) => m.choix.find((c) => c !== cj.reponse(m)), '.sc-contraires-et-jumeaux__oiseau'],
    ['familles de mots', 'CE2', ContrairesEtJumeaux, () => cj.serie(2024, 'CE2')[0], (m) => cj.reponse(m), (m) => m.choix.find((c) => c !== cj.reponse(m)), '.sc-contraires-et-jumeaux__oiseau'],
  ];

  it.each(ECRANS)('%s (%s) : l’erreur fait encourager, la bonne réponse fait la fête', async (_, niveau, Jeu, premiere, bon, faux, mascotte) => {
    const { container } = render(<Jeu onQuitter={jest.fn()} matiereCode="FRANCAIS" niveau={niveau} />);
    const m = premiere();
    expect(container.querySelector(mascotte).className).toContain('est-attend');
    await userEvent.click(screen.getByRole('button', { name: faux(m) }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.querySelector(mascotte).className).toContain('est-courage');
    await userEvent.click(screen.getByRole('button', { name: bon(m) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
    expect(container.querySelector(mascotte).className).toContain('est-bravo');
    expect(container.querySelector('.sc-ce2-francais__fete')).not.toBeNull();
  });
});
