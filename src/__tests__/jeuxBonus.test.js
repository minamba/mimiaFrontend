/**
 * LES JEUX BONUS — Camara, le 09/10/2026 : devine le mot, les mots cachés,
 * devine la phrase, les paires, les opérations à trous ; du CP à la
 * terminale, un chrono selon le mode. Les moteurs d'abord (réponse unique,
 * mots bien placés, accents), puis le branchement et une partie à l'écran.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as operations from '../lib/jeux/bonus/operations.js';
import * as motsCaches from '../lib/jeux/bonus/motsCaches.js';
import * as paires from '../lib/jeux/bonus/paires.js';
import {
  cases, erreursDe, estTrouve, serieMots, seriePhrases,
} from '../lib/jeux/bonus/devinettes.js';
import { enCapitales } from '../lib/jeux/bonus/reglages.js';
import { CATALOGUE_BONUS } from '../lib/jeux/bonus/catalogue.js';
import { jeuxDeLaClasse, parMatiere } from '../lib/jeux/catalogue';
import { CLASSES_DU_CATALOGUE } from '../lib/jeux/frise';
import { ECRANS_BONUS } from '../components/jeux/bonus';
import { FournirJeu } from '../lib/jeux/contexteJeu';
import { DEFI, TRANQUILLE } from '../lib/jeux/coeurs';
import * as puzzle from '../lib/jeux/bonus/puzzle.js';
import * as morpion from '../lib/jeux/bonus/morpion.js';
import * as drapeaux from '../lib/jeux/bonus/drapeaux.js';
import * as mdp from '../lib/jeux/bonus/motDePasse.js';
import { SOSIES } from '../lib/jeux/bonus/donnees/drapeaux.js';
import { IMAGES_DRAPEAUX } from '../lib/jeux/bonus/drapeauxImages.js';
import * as echecs from '../lib/jeux/bonus/echecs.js';
import * as planetes from '../lib/jeux/bonus/planetes.js';
import * as motSecret from '../lib/jeux/bonus/motSecret.js';
import { enCapitales as nu } from '../lib/jeux/bonus/reglages.js';

const ANNEES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME', 'SECONDE', 'PREMIERE', 'TERMINALE'];
const GRAINES = Array.from({ length: 25 }, (_, i) => i * 7919 + 3);

describe('les opérations à trous', () => {
  it.each(ANNEES)('%s : chaque calcul n’a qu’une combinaison de signes juste', (annee) => {
    const permis = operations.signesDe(annee);
    GRAINES.forEach((g) => {
      const calculs = operations.serie(g, annee);
      expect(calculs.length).toBeGreaterThanOrEqual(5);
      calculs.forEach((c) => {
        expect(operations.juste(c, c.signes)).toBe(true);
        const combos = c.signes.length === 1 ? permis.map((s) => [s]) : permis.flatMap((s) => permis.map((t) => [s, t]));
        expect(combos.filter((k) => operations.juste(c, k))).toHaveLength(1);
        c.signes.forEach((s) => expect(permis).toContain(s));
      });
    });
  });

  it('les signes suivent l’année, et les priorités comptent', () => {
    expect(operations.signesDe('CP')).toEqual(['+', '-']);
    expect(operations.signesDe('CE2')).toContain('×');
    expect(operations.signesDe('CE2')).not.toContain('÷');
    expect(operations.signesDe('CM1')).toContain('÷');
    expect(operations.evaluer([8, 3, 2], ['+', '×'])).toBe(14);
    expect(operations.evaluer([8, 3, 2], ['×', '+'])).toBe(26);
    expect(operations.evaluer([9, 2], ['÷'])).toBeNull();
    expect(operations.ecrireNombre(-3, false)).toBe('(−3)');
  });
});

describe('les mots cachés', () => {
  it.each(ANNEES)('%s : chaque mot est bien dans la grille, à sa place', (annee) => {
    GRAINES.forEach((g) => {
      const p = motsCaches.serie(g, annee);
      expect(p.mots.length).toBeGreaterThanOrEqual(4);
      p.mots.forEach((m) => {
        const lu = m.cases.map(([l, c]) => p.grille[l][c]).join('');
        expect(lu).toBe(m.lettres);
        expect(motsCaches.motTrace(p, m.cases)).toBe(m);
        expect(motsCaches.motTrace(p, [...m.cases].reverse())).toBe(m);
      });
      p.grille.forEach((ligne) => ligne.forEach((x) => expect(x).toMatch(/^[A-Z]$/)));
    });
  });

  it('un tracé biais se range sur la ligne droite la plus proche', () => {
    expect(motsCaches.trace([0, 0], [0, 3])).toEqual([[0, 0], [0, 1], [0, 2], [0, 3]]);
    expect(motsCaches.trace([0, 0], [3, 3])).toEqual([[0, 0], [1, 1], [2, 2], [3, 3]]);
    expect(motsCaches.trace([2, 2], [2, 2])).toEqual([[2, 2]]);
  });
});

describe('devine le mot, devine la phrase', () => {
  it('une lettre couvre ses accents, et « œ » vaut deux cases', () => {
    expect(enCapitales('Ébène cœur')).toBe('EBENE COEUR');
    expect(cases('cœur').map((c) => c.lettre)).toEqual(['C', 'O', 'E', 'U', 'R']);
    expect(estTrouve('été', ['E', 'T'])).toBe(true);
    expect(erreursDe('chat', ['C', 'Z', 'Y'])).toBe(2);
    expect(cases('l’eau').find((c) => c.car === '’').lettre).toBeNull();
  });

  it.each(ANNEES)('%s : cinq mots et trois phrases, chacun avec son indice', (annee) => {
    const mots = serieMots(5, annee);
    const phrases = seriePhrases(5, annee);
    expect(mots).toHaveLength(5);
    expect(phrases).toHaveLength(3);
    [...mots, ...phrases].forEach((x) => {
      expect(x.texte.length).toBeGreaterThan(1);
      expect(x.indice.length).toBeGreaterThan(5);
    });
  });
});

describe('les paires', () => {
  it.each(ANNEES)('%s : chaque carte a exactement une partenaire', (annee) => {
    GRAINES.forEach((g) => {
      const p = paires.serie(g, annee);
      expect(p.cartes.length).toBe(paires.nombreDePaires(annee) * 2);
      p.cartes.forEach((a) => {
        expect(p.cartes.filter((b) => paires.vontEnsemble(a, b))).toHaveLength(1);
        expect(a.emoji || a.texte).toBeTruthy();
      });
      // Deux cartes de paires différentes ne montrent jamais la même face.
      const faces = p.cartes.map((c) => `${c.paire}:${c.emoji ?? c.texte}`);
      const parFace = {};
      p.cartes.forEach((c) => { const f = c.emoji ?? c.texte; parFace[f] = (parFace[f] ?? new Set()).add(c.paire); });
      Object.values(parFace).forEach((s) => expect(s.size).toBe(1));
      expect(faces.length).toBe(p.cartes.length);
    });
  });

  it('des images jumelles au CP et au CE1, des paires qui apprennent ensuite', () => {
    expect(paires.serie(1, 'CP').jumelles).toBe(true);
    expect(paires.serie(1, 'CE1').jumelles).toBe(true);
    expect(paires.serie(1, 'CE2').jumelles).toBe(false);
  });
});

describe('le puzzle', () => {
  it.each(ANNEES)('%s : plus de pièces avec l’année, aucune à sa place au départ', (annee) => {
    const { colonnes, lignes } = puzzle.grilleDe(annee);
    GRAINES.forEach((g) => {
      const p = puzzle.serie(g, annee, ['a.webp', 'b.webp']);
      expect(p.ordre).toHaveLength(colonnes * lignes);
      expect([...p.ordre].sort((a, b) => a - b)).toEqual(Array.from({ length: colonnes * lignes }, (_, i) => i));
      expect(puzzle.bienPlacees(p.ordre)).toBe(0);
    });
  });
  it('de 4 pièces au CP à 30 en terminale', () => {
    const n = (a) => { const { colonnes, lignes } = puzzle.grilleDe(a); return colonnes * lignes; };
    expect(n('CP')).toBe(4);
    expect(n('TERMINALE')).toBe(30);
    ANNEES.slice(1).forEach((a, i) => expect(n(a)).toBeGreaterThanOrEqual(n(ANNEES[i])));
  });
});

describe('le morpion', () => {
  it('l’ordinateur imbattable ne perd jamais, quoi que joue l’enfant', () => {
    // Toutes les parties possibles de l'enfant contre l'ordinateur de force 3.
    const issues = [];
    const explorer = (g, tourEnfant) => {
      const fin = morpion.issue(g);
      if (fin) { issues.push(fin.gagnant); return; }
      if (tourEnfant) {
        g.forEach((v, i) => { if (!v) explorer(g.map((x, k) => (k === i ? morpion.ENFANT : x)), false); });
      } else {
        const c = morpion.coupOrdi(g, 3);
        explorer(g.map((x, k) => (k === c ? morpion.ORDI : x)), true);
      }
    };
    explorer(Array(9).fill(null), true);
    explorer(Array(9).fill(null), false);
    expect(issues.length).toBeGreaterThan(100);
    expect(issues).not.toContain(morpion.ENFANT);
  });
  it('l’ordinateur attentif gagne quand il peut, et bloque quand il doit', () => {
    const O = morpion.ORDI; const X = morpion.ENFANT;
    expect(morpion.coupOrdi([O, O, null, X, X, null, null, null, null], 1)).toBe(2);
    expect(morpion.coupOrdi([X, X, null, O, null, null, null, null, null], 1)).toBe(2);
  });
  it('plus fort avec l’année, et d’un cran en défi', () => {
    expect(morpion.forceDe('CP')).toBe(0);
    expect(morpion.forceDe('CM1')).toBe(1);
    expect(morpion.forceDe('TROISIEME')).toBe(2);
    expect(morpion.forceDe('TERMINALE')).toBe(3);
    expect(morpion.forceDe('CP', true)).toBe(1);
  });
});

describe('le défi des drapeaux', () => {
  it.each(ANNEES)('%s : dix drapeaux, la bonne réponse parmi les choix, jamais deux sosies ensemble', (annee) => {
    GRAINES.forEach((g) => {
      const manches = drapeaux.serie(g, annee);
      expect(manches).toHaveLength(drapeaux.MANCHES);
      expect(new Set(manches.map((m) => m.pays.code)).size).toBe(drapeaux.MANCHES);
      manches.forEach((m) => {
        const codes = m.choix.map((p) => p.code);
        expect(codes).toContain(m.pays.code);
        expect(new Set(codes).size).toBe(codes.length);
        expect(codes.length).toBe(['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(annee) ? 3 : 4);
        SOSIES.forEach((groupe) => expect(codes.filter((c) => groupe.includes(c)).length).toBeLessThanOrEqual(1));
        codes.forEach((c) => expect(IMAGES_DRAPEAUX[c]).toBeTruthy());
        expect(m.pays.niveau).toBeLessThanOrEqual(drapeaux.niveauMax(annee));
      });
    });
  });
  it('moins de temps en grandissant, et en défi', () => {
    expect(drapeaux.secondesParDrapeau('CP')).toBeGreaterThan(drapeaux.secondesParDrapeau('TERMINALE'));
    expect(drapeaux.secondesParDrapeau('CM1', true)).toBeLessThan(drapeaux.secondesParDrapeau('CM1'));
  });
});

describe('le mot de passe', () => {
  it.each(ANNEES)('%s : trois niveaux de quatre mots, trois indices chacun', (annee) => {
    const manches = mdp.serie(7, annee);
    expect(manches).toHaveLength(12);
    manches.forEach((m) => {
      expect(m.indices).toHaveLength(3);
      // Au CP et au CE1, trois mots à choisir dont le bon ; ensuite, on écrit.
      const attendu = mdp.parChoix(annee) ? 3 : 0;
      expect(m.choix?.length ?? 0).toBe(attendu);
      expect(attendu === 0 || m.choix.includes(m.mot)).toBe(true);
    });
    expect(new Set(manches.map((m) => m.niveau))).toEqual(new Set([1, 2, 3]));
  });
  it('les accents et les majuscules ne comptent pas, et chaque indice ouvert coûte un point', () => {
    expect(mdp.estLeMot(' ECOLE ', 'école')).toBe(true);
    expect(mdp.estLeMot('ecoles', 'école')).toBe(false);
    expect([1, 2, 3].map(mdp.points)).toEqual([3, 2, 1]);
  });
});

describe('les échecs', () => {
  it('la difficulté conseillée suit l’année', () => {
    expect(echecs.difficulteConseillee('CP')).toBe('debutant');
    expect(echecs.difficulteConseillee('CM2')).toBe('facile');
    expect(echecs.difficulteConseillee('QUATRIEME')).toBe('moyen');
    expect(echecs.difficulteConseillee('TERMINALE')).toBe('fort');
  });

  it('une partie neuve : 32 pièces, rien de pris, les blancs commencent', () => {
    const p = echecs.nouvellePartie();
    const etat = p.exportJson();
    expect(Object.keys(etat.pieces)).toHaveLength(32);
    expect(etat.turn).toBe('white');
    expect(echecs.piecesPrises(etat.pieces)).toEqual({ blanches: [], noires: [] });
    expect(echecs.CASES[0]).toBe('A8');
    expect(echecs.CASES[63]).toBe('H1');
  });

  it.each(echecs.DIFFICULTES.map((d) => d.cle))('%s : l’ordinateur joue un coup légal des noirs', (cle) => {
    const p = echecs.nouvellePartie();
    p.move('E2', 'E4');
    const legaux = p.moves();
    const coup = echecs.coupOrdi(p, cle);
    const [de, vers] = Object.entries(coup)[0];
    expect(legaux[de]).toContain(vers);
    expect(p.exportJson().turn).toBe('white');
  });

  it('une pièce prise se range chez celui qui l’a prise', () => {
    const p = echecs.nouvellePartie();
    ['E2', 'E4', 'D7', 'D5', 'E4', 'D5'].reduce((_, c, i, t) => (i % 2 ? p.move(t[i - 1], c) : null), null);
    expect(echecs.piecesPrises(p.exportJson().pieces).noires).toEqual(['p']);
  });
});

describe('les planètes', () => {
  it('l’ordre depuis le Soleil, et l’ordre des tailles', () => {
    expect(planetes.ordreAttendu('distance')).toEqual(['mercure', 'venus', 'terre', 'mars', 'jupiter', 'saturne', 'uranus', 'neptune']);
    expect(planetes.ordreAttendu('taille').slice(0, 2)).toEqual(['jupiter', 'saturne']);
    expect(planetes.ordreAttendu('taille')[7]).toBe('mercure');
    expect(planetes.aSaPlace('distance', 'terre', 2)).toBe(true);
    expect(planetes.aSaPlace('distance', 'terre', 3)).toBe(false);
  });

  it('de plus en plus difficile : la manche des tailles, puis sans indice, puis sans les noms', () => {
    expect(planetes.reglageDe('CP')).toEqual({ manches: ['distance'], indices: true, noms: true });
    expect(planetes.reglageDe('CM1').manches).toEqual(['distance', 'taille']);
    expect(planetes.reglageDe('SIXIEME').indices).toBe(false);
    expect(planetes.reglageDe('QUATRIEME').noms).toBe(false);
  });
});

describe('le mot secret', () => {
  it.each(ANNEES)('%s : dix lettres dans l’ordre de l’alphabet, chaque mot commence par sa lettre', (annee) => {
    GRAINES.forEach((g) => {
      const manches = motSecret.serie(g, annee);
      expect(manches).toHaveLength(motSecret.MANCHES);
      const lettres = manches.map((m) => m.lettre);
      expect([...lettres].sort()).toEqual(lettres);
      expect(new Set(lettres).size).toBe(lettres.length);
      manches.forEach((m) => {
        expect(nu(m.mot)[0]).toBe(m.lettre);
        expect(m.definition.length).toBeGreaterThan(5);
        const attendus = motSecret.parChoix(annee) ? 3 : 0;
        expect(m.choix?.length ?? 0).toBe(attendus);
        expect(attendus === 0 || m.choix.includes(m.mot)).toBe(true);
      });
    });
  });

  it('les accents ne comptent pas, et le temps baisse en défi', () => {
    expect(motSecret.estLeMot('ECOLE', 'école')).toBe(true);
    expect(motSecret.secondesParMot('CM1', true)).toBeLessThan(motSecret.secondesParMot('CM1'));
  });
});

describe('le rayon bonus', () => {
  it('dix-sept jeux (douze, puis cinq d’histoire-géo le 10/10/2026), de toutes les classes, sans compétence, dans leur section à part et en dernier', () => {
    expect(CATALOGUE_BONUS).toHaveLength(17);
    CLASSES_DU_CATALOGUE.forEach((classe) => {
      const sections = parMatiere(jeuxDeLaClasse(classe));
      const derniere = sections[sections.length - 1];
      expect(derniere.matiereCode).toBe('BONUS');
      expect(derniere.jeux.map((j) => j.cle).sort()).toEqual(CATALOGUE_BONUS.map((j) => j.cle).sort());
    });
    CATALOGUE_BONUS.forEach((j) => {
      expect(j.competences).toEqual([]);
      expect(ECRANS_BONUS[j.cle]).toBeTruthy();
    });
  });
});

describe('à l’écran', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const jouer = (cle, mode, niveau = 'CM1', terminerDefi = jest.fn()) => {
    const Ecran = ECRANS_BONUS[cle];
    render(
      <FournirJeu value={{
        jeuCle: cle, niveau, mode, coeursMax: 0, rejouerPartie: jest.fn(), terminerDefi,
      }}
      >
        <Ecran onQuitter={jest.fn()} niveau={niveau} />
      </FournirJeu>,
    );
    return terminerDefi;
  };

  it.each(CATALOGUE_BONUS.map((j) => j.cle))('%s s’ouvre, avec son chrono', (cle) => {
    jouer(cle, TRANQUILLE);
    // Le chrono de la partie vient en premier ; drapeaux et mot de passe en ont un par question.
    expect(screen.getAllByRole('timer')[0]).toHaveTextContent('0:00');
    act(() => { jest.advanceTimersByTime(5000); });
    expect(screen.getAllByRole('timer')[0]).toHaveTextContent('0:05');
  });

  it('en défi, à zéro, la page reçoit la fin, avec ce qui a été trouvé', () => {
    const terminerDefi = jouer('bonus-paires', DEFI);
    act(() => { jest.advanceTimersByTime(10 * 60 * 1000); });
    expect(terminerDefi).toHaveBeenCalledTimes(1);
    expect(terminerDefi).toHaveBeenCalledWith(expect.objectContaining({ raison: 'temps', reussies: 0, unite: 'paire trouvée' }));
  });

  it('les échecs : on choisit sa difficulté, puis on joue e2-e4', () => {
    jouer('bonus-echecs', TRANQUILLE);
    fireEvent.click(screen.getByRole('button', { name: /Débutant/ }));
    fireEvent.click(screen.getByRole('button', { name: 'E2 : pion blanc' }));
    fireEvent.click(screen.getByRole('button', { name: 'E4' }));
    expect(screen.getByRole('button', { name: 'E4 : pion blanc' })).toBeInTheDocument();
  });

  it('la section bonus dit qu’elle n’est pas liée aux notions de cours', () => {
    expect(CATALOGUE_BONUS.every((j) => j.competences.length === 0)).toBe(true);
  });

  it('devine le mot : une lettre du clavier se propose', () => {
    jouer('bonus-devine-le-mot', TRANQUILLE);
    fireEvent.keyDown(window, { key: 'e' });
    expect(screen.getByRole('button', { name: 'E' })).toBeDisabled();
  });
});

describe('le morpion à grandes grilles (10/10/2026)', () => {
  const O = morpion.ORDI;
  const X = morpion.ENFANT;
  const vide = (t) => Array(t * t).fill(null);

  it('aligne 4 sur 5 × 5 : lignes, colonnes et diagonales', () => {
    const p = { taille: 5, aligner: 4 };
    const g = vide(5);
    [6, 12, 18, 24].forEach((i) => { g[i] = X; });
    expect(morpion.issue(g, p)).toEqual({ gagnant: X, ligne: [6, 12, 18, 24] });
    const h = vide(5);
    [1, 2, 3].forEach((i) => { h[i] = X; });
    expect(morpion.issue(h, p)).toBeNull();
  });

  it('l’ordinateur gagne s’il peut, et bloque quatre en ligne', () => {
    const p = { taille: 7, aligner: 4 };
    const g = vide(7);
    [0, 1, 2].forEach((i) => { g[i] = O; });
    [14, 15].forEach((i) => { g[i] = X; });
    expect(morpion.coupOrdi(g, 3, () => 0.9, p)).toBe(3);
    const h = vide(7);
    [21, 22, 23].forEach((i) => { h[i] = X; });
    h[0] = O;
    expect([20, 24]).toContain(morpion.coupOrdi(h, 2, () => 0.9, p));
  });

  it('en Expert, il ne laisse jamais gagner un joueur qui joue au hasard en 30 parties', () => {
    const p = { taille: 7, aligner: 4 };
    let graine = 7;
    const hasard = () => { graine = (graine * 16807) % 2147483647; return graine / 2147483647; };
    for (let n = 0; n < 30; n += 1) {
      let g = vide(7);
      let tour = X;
      while (!morpion.issue(g, p)) {
        const libres = g.map((v, i) => (v ? null : i)).filter((i) => i !== null);
        const coup = tour === X ? libres[Math.floor(hasard() * libres.length)] : morpion.coupOrdi(g, 3, hasard, p);
        const signe = tour;
        g = g.map((v, i) => (i === coup ? signe : v));
        tour = tour === X ? O : X;
      }
      expect(morpion.issue(g, p).gagnant).not.toBe(X);
    }
  });

  it('la difficulté conseillée suit la classe', () => {
    expect(morpion.difficulteConseillee('CP')).toBe('facile');
    expect(morpion.difficulteConseillee('CM1')).toBe('moyen');
    expect(morpion.difficulteConseillee('QUATRIEME')).toBe('difficile');
    expect(morpion.difficulteConseillee('TERMINALE')).toBe('expert');
  });
});
