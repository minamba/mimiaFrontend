/**
 * L'ESCAPE GAME D'ANGLAIS DU COLLÈGE — Marine, de la 6e à la 3e. Même épreuve
 * que les jeux du CM2 : soixante parties par classe, une bonne réponse parmi
 * des choix distincts, une méthode pour chaque erreur, puis ce qui fait un
 * escape game (six cadenas dans l'ordre du récit, le code qui se construit)
 * et l'exactitude des tours de la 5e, dont les hauteurs sont tirées.
 */

import * as escapeAnglais from '../lib/jeux/college/escape-anglais';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes d'anglais du collège, recopiés de competences-college.txt (hors du dépôt). */
const COMPETENCES = new Set([
  'AN_6E_COMP_ECRIT', 'AN_6E_CULT_ROYAUME', 'AN_6E_CULT_IMAGINAIRE', 'AN_6E_ECR_TEXTE',
  'AN_6E_ORAL_CONTINU', 'AN_6E_ORAL_DIALOGUER', 'AN_6E_GRAM_PRESENT', 'AN_6E_GRAM_PRETERIT',
  'AN_6E_GRAM_AUXILIAIRE', 'AN_6E_GRAM_POSSESSION', 'AN_6E_GRAM_MODAUX', 'AN_6E_GRAM_AGE',
  'AN_6E_GRAM_GN', 'AN_6E_GRAM_PRONOMS', 'AN_6E_LEX_DESCRIPTION', 'AN_6E_LEX_FAUX_AMIS',
  'AN_6E_CECRL', 'AN_6E_PHONO_TERMINAISON',
  'AN_5E_COMP_ORAL', 'AN_5E_COMP_ECRIT', 'AN_5E_CULT_ETATS_UNIS', 'AN_5E_CULT_ROYAUME_UNI',
  'AN_5E_ECR_RECIT', 'AN_5E_ECR_LETTRE', 'AN_5E_ORAL_CONTINU', 'AN_5E_ORAL_OPINION',
  'AN_5E_GRAM_FUTUR', 'AN_5E_GRAM_COMPARATIF', 'AN_5E_GRAM_QUANTITE', 'AN_5E_GRAM_PRETERIT_ING',
  'AN_5E_GRAM_IMPERATIF', 'AN_5E_GRAM_PREPOSITIONS', 'AN_5E_LEX_VOYAGE', 'AN_5E_CECRL',
  'AN_5E_PHONO_ACCENT',
  'AN_4E_COMP_ORAL', 'AN_4E_COMP_ECRIT', 'AN_4E_CULT_HISTOIRE', 'AN_4E_CULT_IRLANDE',
  'AN_4E_CULT_SPORT', 'AN_4E_ECR_ARTICLE', 'AN_4E_ECR_ARGUMENTER', 'AN_4E_ORAL_CONTINU',
  'AN_4E_ORAL_DEBAT', 'AN_4E_GRAM_PRESENT_PERFECT', 'AN_4E_GRAM_SINCE_FOR', 'AN_4E_GRAM_RELATIVES',
  'AN_4E_GRAM_MODAUX', 'AN_4E_GRAM_PASSIF', 'AN_4E_GRAM_PREPOSITIONS', 'AN_4E_LEX_MEDIAS',
  'AN_4E_LEX_CONNECTEURS', 'AN_4E_LEX_DERIVATION', 'AN_4E_CECRL', 'AN_4E_PHONO_ACCENT',
  'AN_3E_COMP_ORAL', 'AN_3E_COMP_ECRIT', 'AN_3E_CULT_DIVERSITE', 'AN_3E_CULT_ETATS_UNIS',
  'AN_3E_CULT_ENGAGEMENT', 'AN_3E_ECR_TEXTE', 'AN_3E_ECR_RELIRE', 'AN_3E_ORAL_EXPOSE',
  'AN_3E_ORAL_INTERAGIR', 'AN_3E_GRAM_TEMPS', 'AN_3E_GRAM_CONDITIONNEL', 'AN_3E_GRAM_DISCOURS',
  'AN_3E_GRAM_PASSIF', 'AN_3E_GRAM_INFINITIF', 'AN_3E_GRAM_GN', 'AN_3E_GRAM_PREPOSITIONS',
  'AN_3E_LEX_SOCIETE', 'AN_3E_CECRL', 'AN_3E_PHONO_MOTS',
]);

const PREFIXES = {
  SIXIEME: ['_6E_', '6e'], CINQUIEME: ['_5E_', '5e'], QUATRIEME: ['_4E_', '4e'], TROISIEME: ['_3E_', '3e'],
};

const jeu = escapeAnglais;
const CAS = jeu.CLASSES.map((niveau) => [niveau]);

describe('le module', () => {
  it('se décrit : famille, escape game, six cadenas, quatre classes du collège', () => {
    expect(jeu.FAMILLE).toEqual({ cle: 'escape-anglais', titre: expect.any(String), matiereCode: 'ANGLAIS' });
    expect(jeu.ESCAPE).toBe(true);
    expect(jeu.MANCHES).toBe(6);
    expect(jeu.CLASSES).toEqual(['SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME']);
    expect(jeu.bilan(6)).toBe('Sans une seule erreur. Bravo !');
  });

  it('chaque phrase est fixe : aucun chiffre, une clé en kebab-case, jamais « raté » ni « faux »', () => {
    Object.entries(jeu.PHRASES).forEach(([cle, texte]) => {
      expect(cle).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
    });
  });

  it('les phrases dites sont en français, typographie française devant ? ! : ;', () => {
    Object.values(jeu.PHRASES).forEach((texte) => {
      expect(texte).not.toMatch(/\S[?!:;]/);
    });
  });
});

describe.each(CAS)('%s', (niveau) => {
  const [suffixe, prefixe] = PREFIXES[niveau];

  it('PAR_CLASSE : titre, accroche courte, intro, fin, compétences toutes réelles et de la classe', () => {
    const c = jeu.PAR_CLASSE[niveau];
    expect(c.titre.trim()).not.toBe('');
    expect(c.accroche.trim()).not.toBe('');
    expect(c.accroche.length).toBeLessThanOrEqual(45);
    expect(c.intro.trim()).not.toBe('');
    expect(c.fin.trim()).not.toBe('');
    expect(c.competences.length).toBeGreaterThan(0);
    c.competences.forEach((code) => {
      expect(COMPETENCES.has(code)).toBe(true);
      expect(code).toContain(suffixe);
    });
  });

  it('chaque partie a ses six étapes, et chaque étape sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = jeu.serie(g, niveau);
      expect(serie).toHaveLength(jeu.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(String(m.bonne));
        m.choix.forEach((c) => expect(String(c.libelle).trim()).not.toBe(''));
        expect(m.question.trim()).not.toBe('');
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
      expect(jeu.PHRASES[m.consigne]).toBeTruthy();
      expect(m.aide === undefined || Boolean(jeu.PHRASES[m.aide])).toBe(true);
      m.choix.forEach((c) => {
        const s = jeu.verdict(m, c.cle);
        const juste = String(c.cle) === String(m.bonne);
        expect(s === 'juste').toBe(juste);
        expect(juste || Boolean(jeu.PHRASES[s])).toBe(true);
        expect(juste || !/raté/i.test(jeu.PHRASES[s])).toBe(true);
      });
    }));
  });

  it('chaque choix faux a son piège nommé, et la bonne réponse n’est jamais un piège', () => {
    graines.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
      expect(m.pieges[m.bonne]).toBeUndefined();
      m.choix.filter((c) => c.cle !== m.bonne).forEach((c) => {
        expect(m.pieges[c.cle]).toBeTruthy();
      });
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(jeu.serie(77, niveau)).toEqual(jeu.serie(77, niveau));
    expect(jeu.serie(1758000104729, niveau)).toEqual(jeu.serie(1758000104729, niveau));
  });

  it('escape : six étapes dans l’ordre du récit, et le code se construit pièce par pièce', () => {
    graines.forEach((g) => {
      const serie = jeu.serie(g, niveau);
      const pieces = [];
      serie.forEach((m, i) => {
        expect(m.consigne).toBe(`${prefixe}-etape-${i + 1}`);
        expect(m.recit.trim()).not.toBe('');
        expect(m.cadenas.total).toBe(6);
        expect(m.cadenas.avant).toEqual(pieces);
        expect(m.cadenas.piece).toMatch(/^[A-Z0-9]$/);
        pieces.push(m.cadenas.piece);
      });
    });
  });

  it('le code final est le même à chaque partie de la classe', () => {
    const code = (g) => jeu.serie(g, niveau).map((m) => m.cadenas.piece).join('');
    graines.forEach((g) => expect(code(g)).toBe(code(1)));
  });
});

describe('l’exactitude', () => {
  const toutes = (niveau) => graines.flatMap((g) => jeu.serie(g, niveau));

  it('5e, les tours : la bonne phrase dit ce que montrent les hauteurs, les pièges non', () => {
    const tours = toutes('CINQUIEME').filter((m) => m.consigne === '5e-etape-5');
    expect(tours).toHaveLength(graines.length);
    let comparatifs = 0;
    let superlatifs = 0;
    tours.forEach((m) => {
      const [nord, est, ouest] = m.recit.match(/\d+/g).map(Number);
      expect(new Set([nord, est, ouest]).size).toBe(3);
      const h = { North: nord, East: est, West: ouest };
      const vraie = (phrase) => {
        const comp = phrase.match(/^The (\w+) Tower is (taller|shorter) than the (\w+) Tower\.$/);
        if (comp) return comp[2] === 'taller' ? h[comp[1]] > h[comp[3]] : h[comp[1]] < h[comp[3]];
        const sup = phrase.match(/^The (\w+) Tower is the (tallest|shortest)\.$/);
        if (sup) {
          const valeurs = Object.values(h);
          return h[sup[1]] === (sup[2] === 'tallest' ? Math.max(...valeurs) : Math.min(...valeurs));
        }
        return false; // « more tall », « most tall » : faux par la grammaire
      };
      const phrase = (cle) => (m.question.includes('___') ? m.question.replace('___', cle) : cle);
      if (m.question.includes('___')) comparatifs += 1; else superlatifs += 1;
      expect(vraie(phrase(m.bonne))).toBe(true);
      Object.keys(m.pieges).forEach((cle) => expect(vraie(phrase(cle))).toBe(false));
    });
    expect(comparatifs).toBeGreaterThan(0);
    expect(superlatifs).toBeGreaterThan(0);
  });

  it('les pièges de grammaire sont bien ceux qu’on nomme', () => {
    const FORMES = {
      'modal-sans-to': /\bto\b/,
      'age-avec-have': /^ha(ve|s)$/,
      'passif-participe': /^(was|will be|are being) (paint|stole|saw|build|repair|send)$/,
      'say-tell': /told that|said them/,
    };
    jeu.CLASSES.forEach((niveau) => toutes(niveau).forEach((m) => {
      Object.entries(m.pieges)
        .filter(([, nom]) => FORMES[nom])
        .forEach(([cle, nom]) => expect(cle).toMatch(FORMES[nom]));
    }));
  });

  it('chaque étape varie d’une partie à l’autre', () => {
    jeu.CLASSES.forEach((niveau) => {
      for (let i = 0; i < jeu.MANCHES; i += 1) {
        const questions = new Set(graines.map((g) => jeu.serie(g, niveau)[i].question + jeu.serie(g, niveau)[i].recit));
        expect(questions.size).toBeGreaterThan(1);
      }
    });
  });
});
