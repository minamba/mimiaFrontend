/**
 * DÉTECTIVE DE L'HISTOIRE (10/10/2026) : « L'image qui ment » et « Mythe ou
 * Histoire ». Les données d'abord (chaque intrus a sa zone, son indice et son
 * explication ; chaque mot clé est dans son explication), les tirages par
 * classe, puis une partie à l'écran.
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   le tampon et les cercles sont cachés aux lecteurs d'écran (`aria-hidden`),
   et la scène tirée se lit sur son titre : ils ne se trouvent que par leur classe. */
import {
  act, fireEvent, render, screen, within,
} from '@testing-library/react';
import * as iqm from '../lib/jeux/bonus/histoire/imageQuiMent.js';
import * as moh from '../lib/jeux/bonus/histoire/mytheOuHistoire.js';
import { lireDossier, rangerScene } from '../lib/jeux/bonus/histoire/dossierEnquete.js';
import { rangDe } from '../lib/jeux/bonus/reglages.js';
import { IMAGES_HISTOIRE_GEO } from '../lib/jeux/imagesHistoireGeo';
import { ECRANS, APERCUS } from '../components/jeux/bonus/histoire';
import { FournirJeu } from '../lib/jeux/contexteJeu';
import { DEFI, TRANQUILLE } from '../lib/jeux/coeurs';

const ANNEES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME', 'SECONDE', 'PREMIERE', 'TERMINALE'];
const GRAINES = Array.from({ length: 25 }, (_, i) => i * 7919 + 3);
const CLE_SURE = /^[a-zA-Z0-9-]+$/;

describe('l’image qui ment : les scènes', () => {
  it('vingt-quatre scènes, chacune avec son image, son indice et son explication', () => {
    expect(iqm.SCENES).toHaveLength(24);
    expect(new Set(iqm.SCENES.map((s) => s.id)).size).toBe(24);
    iqm.SCENES.forEach((s) => {
      expect(IMAGES_HISTOIRE_GEO['image-qui-ment'][s.id]).toBeTruthy();
      expect(iqm.PHRASES[iqm.cleIndice(s)]?.length).toBeGreaterThan(10);
      expect(iqm.PHRASES[iqm.cleExplication(s)]?.length).toBeGreaterThan(40);
      expect(Boolean(s.leurres)).toBe(Boolean(iqm.PHRASES[iqm.cleLeurre(s)]));
      (s.aussi ?? []).forEach((a) => expect(iqm.PHRASES[iqm.cleAussi(s, a)]?.length).toBeGreaterThan(20));
      expect([1, 2, 3]).toContain(s.niveau);
      expect(s.titre && s.epoque && s.intrus.nom).toBeTruthy();
    });
  });

  it('toutes les phrases de Salim ont un texte et une clé de fichier sûre', () => {
    Object.entries(iqm.PHRASES).forEach(([cle, texte]) => {
      expect(cle).toMatch(CLE_SURE);
      expect(typeof texte).toBe('string');
      expect(texte.trim().length).toBeGreaterThan(5);
    });
  });

  it('chaque zone est dans l’image, et un leurre ne mord jamais sur l’intrus', () => {
    iqm.SCENES.forEach((s) => {
      const zones = [s.intrus, ...(s.aussi ?? []), ...(s.leurres ?? [])];
      zones.forEach((z) => {
        expect(z.x).toBeGreaterThan(0);
        expect(z.x).toBeLessThan(100);
        expect(z.y).toBeGreaterThan(0);
        expect(z.y).toBeLessThan(100);
        expect(z.r).toBeGreaterThanOrEqual(2.5);
      });
      (s.leurres ?? []).forEach((l) => {
        const d = Math.hypot(l.x - s.intrus.x, (l.y - s.intrus.y) * iqm.RAPPORT);
        expect(d).toBeGreaterThan(s.intrus.r * 1.4 + l.r);
      });
    });
  });

  it.each(ANNEES)('%s : l’intrus, le second objet et le leurre se reconnaissent ; loin, c’est une erreur', (annee) => {
    iqm.SCENES.forEach((s) => {
      expect(iqm.toucher(s, s.intrus.x, s.intrus.y, annee)).toEqual({ sorte: 'intrus', autre: null });
      // Au bord de la zone, encore juste.
      expect(iqm.toucher(s, s.intrus.x + s.intrus.r * 0.95, s.intrus.y, annee).sorte).toBe('intrus');
      (s.aussi ?? []).forEach((a) => expect(iqm.toucher(s, a.x, a.y, annee)).toEqual({ sorte: 'intrus', autre: a }));
      (s.leurres ?? []).forEach((l) => expect(iqm.toucher(s, l.x, l.y, annee).sorte).toBe('leurre'));
      const loin = { x: s.intrus.x > 50 ? 2 : 98, y: s.intrus.y > 50 ? 2 : 98 };
      expect(iqm.toucher(s, loin.x, loin.y, annee).sorte).not.toBe('intrus');
    });
  });

  it('plus de loupes et une zone plus large pour les petits', () => {
    expect(iqm.loupesDe('CP')).toBeGreaterThan(iqm.loupesDe('TERMINALE'));
    expect(iqm.marge('CP')).toBeGreaterThan(iqm.marge('TERMINALE'));
    expect(iqm.points({ trouve: true })).toBe(100);
    expect(iqm.points({ trouve: true, loupesPerdues: 1, indice: true })).toBe(50);
    expect(iqm.points({ trouve: true, loupesPerdues: 9 })).toBe(20);
    expect(iqm.points({ trouve: false })).toBe(10);
  });

  it.each(ANNEES)('%s : cinq scènes différentes, au dosage de l’année, les plus faciles d’abord', (annee) => {
    GRAINES.forEach((g) => {
      const scenes = iqm.serie(g, annee);
      expect(scenes).toHaveLength(iqm.SCENES_PAR_PARTIE);
      expect(new Set(scenes.map((s) => s.id)).size).toBe(scenes.length);
      const dosage = iqm.dosage(annee);
      [1, 2, 3].forEach((n) => expect(scenes.filter((s) => s.niveau === n)).toHaveLength(dosage[n - 1]));
      scenes.slice(1).forEach((s, i) => expect(s.niveau).toBeGreaterThanOrEqual(scenes[i].niveau));
    });
    // Au primaire, rien que des scènes faciles.
    expect(iqm.serie(1, annee).every((s) => s.niveau === 1)).toBe(rangDe(annee) <= 3);
  });

  it('les scènes pas encore dans le dossier passent devant', () => {
    const faciles = iqm.SCENES.filter((s) => s.niveau === 1).map((s) => s.id);
    const vues = faciles.slice(0, 6);
    GRAINES.forEach((g) => {
      const scenes = iqm.serie(g, 'CP', vues);
      scenes.forEach((s) => expect(vues).not.toContain(s.id));
    });
    // Tout vu : la partie se fait quand même.
    expect(iqm.serie(5, 'CP', iqm.SCENES.map((s) => s.id))).toHaveLength(5);
  });
});

describe('mythe ou histoire : les affirmations', () => {
  it('trente affirmations, chacune avec son image, son verdict et son mot clé dans l’explication', () => {
    expect(moh.AFFIRMATIONS).toHaveLength(30);
    expect(new Set(moh.AFFIRMATIONS.map((a) => a.id)).size).toBe(30);
    moh.AFFIRMATIONS.forEach((a) => {
      expect(IMAGES_HISTOIRE_GEO['mythe-ou-histoire'][a.id]).toBeTruthy();
      expect([moh.HISTOIRE, moh.MYTHE]).toContain(a.verdict);
      expect(a.explication).toContain(a.motCle);
      const m = moh.decouper(a);
      expect(m.avant + m.mot + m.apres).toBe(a.explication);
      expect(m.mot).toBe(a.motCle);
      expect(moh.PHRASES[`affirmation-${a.id}`]).toBe(a.affirmation);
      expect(moh.PHRASES[`explication-${a.id}`]).toBe(a.explication);
    });
    // Le verdict du cahier : treize vrais, dix-sept mythes.
    expect(moh.AFFIRMATIONS.filter((a) => a.verdict === moh.HISTOIRE)).toHaveLength(13);
    Object.keys(moh.PHRASES).forEach((cle) => expect(cle).toMatch(CLE_SURE));
  });

  it.each(ANNEES)('%s : dix affirmations différentes, au moins trois de chaque verdict, au niveau de l’année', (annee) => {
    const [, n2, n3] = moh.dosage(annee);
    GRAINES.forEach((g) => {
      const manches = moh.serie(g, annee);
      expect(manches).toHaveLength(moh.MANCHES);
      expect(new Set(manches.map((a) => a.id)).size).toBe(moh.MANCHES);
      expect(manches.filter((a) => a.verdict === moh.HISTOIRE).length).toBeGreaterThanOrEqual(moh.MINIMUM_PAR_VERDICT);
      expect(manches.filter((a) => a.verdict === moh.MYTHE).length).toBeGreaterThanOrEqual(moh.MINIMUM_PAR_VERDICT);
      const plafond = n3 ? 3 : n2 ? 2 : 1; // eslint-disable-line no-nested-ternary
      expect(Math.max(...manches.map((a) => a.niveau))).toBeLessThanOrEqual(plafond);
    });
  });

  it('un temps par affirmation en défi seulement, plus court en grandissant', () => {
    expect(moh.secondesParAffirmation('CM1')).toBeNull();
    expect(moh.secondesParAffirmation('CP', true)).toBeGreaterThan(moh.secondesParAffirmation('TERMINALE', true));
    expect(moh.estJuste(moh.AFFIRMATIONS[0], moh.MYTHE)).toBe(true);
  });
});

describe('le dossier d’enquête', () => {
  beforeEach(() => window.localStorage.clear());

  it('range les scènes résolues, par enfant, et garde l’étoile gagnée', () => {
    rangerScene(7, '01-lascaux', true);
    rangerScene(7, '01-lascaux', false);
    rangerScene(7, '04-forum', false);
    expect(lireDossier(7)['01-lascaux'].trouve).toBe(true);
    expect(lireDossier(7)['04-forum'].trouve).toBe(false);
    expect(lireDossier(8)).toEqual({});
  });

  it('sans stockage, rien ne casse', () => {
    const lire = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqué'); });
    const ecrire = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqué'); });
    expect(lireDossier(1)).toEqual({});
    expect(() => rangerScene(1, '01-lascaux', true)).not.toThrow();
    lire.mockRestore();
    ecrire.mockRestore();
  });
});

describe('à l’écran', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });
  afterEach(() => jest.useRealTimers());

  const jouer = (cle, mode = TRANQUILLE, niveau = 'CM1') => {
    const Ecran = ECRANS[cle];
    return render(
      <FournirJeu value={{
        jeuCle: cle, niveau, mode, coeursMax: 0, rejouerPartie: jest.fn(), terminerDefi: jest.fn(),
      }}
      >
        <Ecran onQuitter={jest.fn()} niveau={niveau} />
      </FournirJeu>,
    );
  };

  it('les deux jeux s’enregistrent, avec leur aperçu', () => {
    expect(Object.keys(ECRANS).sort()).toEqual(['bonus-image-qui-ment', 'bonus-mythe-ou-histoire']);
    expect(Object.keys(APERCUS).sort()).toEqual(Object.keys(ECRANS).sort());
  });

  /** La scène affichée, d'après son titre. */
  const sceneAffichee = () => {
    const titre = document.querySelector('.hg-loupe__titre-scene').textContent;
    return iqm.SCENES.find((s) => s.titre === titre);
  };

  /** Promène la loupe au clavier jusqu'en (x, y), depuis le centre, et accuse. */
  const accuserAuClavier = (x, y) => {
    const scene = screen.getByRole('application');
    fireEvent.focus(scene);
    const pas = (v) => Math.round((v - 50) / 2);
    const [dx, dy] = [pas(x), pas(y)];
    for (let i = 0; i < Math.abs(dx); i += 1) fireEvent.keyDown(scene, { key: dx > 0 ? 'ArrowRight' : 'ArrowLeft' });
    for (let i = 0; i < Math.abs(dy); i += 1) fireEvent.keyDown(scene, { key: dy > 0 ? 'ArrowDown' : 'ArrowUp' });
    fireEvent.keyDown(scene, { key: 'Enter' });
  };

  it('l’image qui ment : accuser l’intrus le fait entourer, tamponner, et Salim explique', () => {
    const { container } = jouer('bonus-image-qui-ment');
    const scene = sceneAffichee();
    accuserAuClavier(scene.intrus.x, scene.intrus.y);
    expect(screen.getByRole('status')).toHaveTextContent('Bien vu, détective');
    expect(container.querySelector('.hg-histoire-tampon')).toHaveTextContent('ANACHRONISME');
    expect(container.querySelectorAll('.hg-loupe__cercle').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(iqm.PHRASES[iqm.cleExplication(scene)])).toBeInTheDocument();
    expect(lireDossier(undefined)[scene.id].trouve).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /Scène suivante/ }));
    expect(screen.getByText('Scène 2 sur 5')).toBeInTheDocument();
  });

  it('l’image qui ment : une fausse accusation coûte une loupe ; l’indice et « montre-moi » aident', () => {
    jouer('bonus-image-qui-ment');
    const scene = sceneAffichee();
    const loin = { x: scene.intrus.x > 50 ? 4 : 96, y: scene.intrus.y > 50 ? 4 : 96 };
    accuserAuClavier(loin.x, loin.y);
    // Un leurre ne coûte rien ; ailleurs, une loupe de moins.
    const statut = screen.getByRole('status').textContent;
    expect(statut === '' || /Plus que|sauve/.test(statut)).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /Un indice/ }));
    expect(screen.getByText(iqm.PHRASES[iqm.cleIndice(scene)])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Un indice/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /montre-moi/ }));
    expect(screen.getByRole('status')).toHaveTextContent(`Voici l’intrus : ${scene.intrus.nom}`);
    expect(lireDossier(undefined)[scene.id].trouve).toBe(false);
  });

  it('l’image qui ment : cinq scènes montrées mènent à la fin, et le dossier les garde', () => {
    jouer('bonus-image-qui-ment');
    for (let i = 0; i < 5; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: /montre-moi/ }));
      fireEvent.click(screen.getByRole('button', { name: /Scène suivante|Fin de l’enquête/ }));
    }
    expect(screen.getByRole('button', { name: 'Rejouer' })).toBeInTheDocument();
    expect(Object.keys(lireDossier(undefined))).toHaveLength(5);
  });

  it('l’image qui ment : le dossier d’enquête s’ouvre et se referme', () => {
    rangerScene(undefined, '04-forum', true);
    jouer('bonus-image-qui-ment');
    fireEvent.click(screen.getByRole('button', { name: 'Mon dossier d’enquête : 1 scène sur 24' }));
    const dossier = screen.getByRole('dialog', { name: 'Mon dossier d’enquête' });
    expect(within(dossier).getByText('Le forum de Rome')).toBeInTheDocument();
    expect(within(dossier).getAllByText('Scène pas encore résolue')).toHaveLength(23);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  /** L'affirmation affichée, d'après son texte. */
  const affirmationAffichee = () => {
    const texte = document.querySelector('.hg-mythe__affirmation').textContent;
    return moh.AFFIRMATIONS.find((a) => a.affirmation === texte);
  };

  it('mythe ou histoire : la bonne réponse, le tampon, et le mot clé surligné', () => {
    const { container } = jouer('bonus-mythe-ou-histoire');
    const a = affirmationAffichee();
    fireEvent.click(screen.getByRole('button', { name: a.verdict === moh.HISTOIRE ? /Histoire/ : /Mythe/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Bien vu !');
    expect(container.querySelector('.hg-histoire-tampon')).toHaveTextContent(a.verdict === moh.HISTOIRE ? 'VRAI' : 'MYTHE');
    expect(container.querySelector('mark')).toHaveTextContent(a.motCle);
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Affirmation suivante/ }));
    expect(screen.getByText('Affirmation 2 sur 10')).toBeInTheDocument();
  });

  it('mythe ou histoire : la mauvaise réponse dit « Raté » et donne quand même l’explication', () => {
    jouer('bonus-mythe-ou-histoire');
    const a = affirmationAffichee();
    fireEvent.click(screen.getByRole('button', { name: a.verdict === moh.HISTOIRE ? /Mythe/ : /Histoire/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Raté !');
    expect(screen.getByText(a.motCle)).toBeInTheDocument();
    expect(screen.getByText('0 / 10')).toBeInTheDocument();
  });

  it('mythe ou histoire en défi : un temps par affirmation, puis « Trop tard ! »', () => {
    jouer('bonus-mythe-ou-histoire', DEFI);
    const minuteurs = screen.getAllByRole('timer');
    expect(minuteurs).toHaveLength(2);
    expect(minuteurs[1]).toHaveTextContent(String(moh.secondesParAffirmation('CM1', true)));
    act(() => { jest.advanceTimersByTime(moh.secondesParAffirmation('CM1', true) * 1000 + 300); });
    expect(screen.getByRole('status')).toHaveTextContent('Trop tard !');
    expect(screen.getAllByRole('timer')).toHaveLength(1);
  });

  it('mythe ou histoire en tranquille : pas de minuteur par affirmation', () => {
    jouer('bonus-mythe-ou-histoire');
    expect(screen.getAllByRole('timer')).toHaveLength(1);
  });
});
