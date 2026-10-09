/**
 * LES ESCAPE GAMES DE MATHS ET DE FRANÇAIS DU COLLÈGE — Nora et Adrien, de la
 * 6e à la 3e. Même épreuve que les jeux du CM2 : soixante parties par classe,
 * une bonne réponse parmi des choix distincts, une méthode pour chaque erreur ;
 * puis ce qui fait un escape game (six cadenas dans l'ordre du récit, le code
 * qui se construit) ; enfin l'exactitude : chaque réponse de maths RECALCULÉE
 * depuis la question affichée, et chaque phrase de français relue (la bonne
 * réponse n'est jamais aussi un piège).
 */

import * as escapeMaths from '../lib/jeux/college/escape-maths';
import * as escapeFrancais from '../lib/jeux/college/escape-francais';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes de maths et de français du collège, recopiés de competences-college.txt (hors du dépôt). */
const COMPETENCES = new Set([
  'MATH_6E_ALG_INCONNUE', 'MATH_6E_ALG_MOTIFS', 'MATH_6E_ALGO_DEPLACEMENT', 'MATH_6E_GEO_VOCABULAIRE',
  'MATH_6E_GEO_PERPENDICULAIRE', 'MATH_6E_GEO_PARALLELE', 'MATH_6E_GEO_CERCLE', 'MATH_6E_GEO_TRIANGLES',
  'MATH_6E_GEO_QUADRILATERES', 'MATH_6E_GEO_SYMETRIE', 'MATH_6E_GEO_CONSTRUCTION', 'MATH_6E_GEO_SOLIDES',
  'MATH_6E_PROP_RECONNAITRE', 'MATH_6E_PROP_COEFF', 'MATH_6E_PROP_POURCENT', 'MATH_6E_PROP_ECHELLE',
  'MATH_6E_DATA_TABLEAU', 'MATH_6E_DATA_GRAPHIQUE', 'MATH_6E_MES_LONGUEUR', 'MATH_6E_MES_MASSE',
  'MATH_6E_MES_DUREE', 'MATH_6E_MES_PERIMETRE', 'MATH_6E_MES_AIRE', 'MATH_6E_MES_VOLUME',
  'MATH_6E_MES_ANGLE', 'MATH_6E_MES_DISTANCE', 'MATH_6E_NUM_ENTIERS', 'MATH_6E_NUM_DECIMAUX',
  'MATH_6E_NUM_DEMI_DROITE', 'MATH_6E_NUM_ARRONDI', 'MATH_6E_CALC_ADD', 'MATH_6E_CALC_MULT',
  'MATH_6E_CALC_DIV_EUCL', 'MATH_6E_CALC_DIV_DEC', 'MATH_6E_CALC_MENTAL', 'MATH_6E_CALC_PRIORITES',
  'MATH_6E_DIVISIBILITE', 'MATH_6E_FRAC_SENS', 'MATH_6E_FRAC_REPERER', 'MATH_6E_FRAC_EGALES',
  'MATH_6E_FRAC_COMPARER', 'MATH_6E_FRAC_ADD', 'MATH_6E_FRAC_QUANTITE', 'MATH_6E_FRAC_QUOTIENT',
  'MATH_5E_ALGO_BOUCLE', 'MATH_5E_GEO_SYM_CENTRALE', 'MATH_5E_GEO_ANGLES', 'MATH_5E_GEO_TRI_ANGLES',
  'MATH_5E_GEO_TRI_INEG', 'MATH_5E_GEO_PARALLELO', 'MATH_5E_GEO_SOLIDES', 'MATH_5E_GEO_REPERAGE',
  'MATH_5E_PROP_QUATRIEME', 'MATH_5E_PROP_POURCENT', 'MATH_5E_PROP_ECHELLE', 'MATH_5E_STAT_EFFECTIFS',
  'MATH_5E_STAT_MOYENNE', 'MATH_5E_PROBA_INTRO', 'MATH_5E_FONC_NOTION', 'MATH_5E_MES_AIRE_PARAL',
  'MATH_5E_MES_AIRE_DISQUE', 'MATH_5E_MES_VOLUME', 'MATH_5E_MES_CONVERSION', 'MATH_5E_MES_DUREE',
  'MATH_5E_FRAC_ADD', 'MATH_5E_FRAC_MULT', 'MATH_5E_REL_SENS', 'MATH_5E_REL_ADD',
  'MATH_5E_PRIORITES', 'MATH_5E_LITT_EXPRESSION', 'MATH_5E_LITT_SUBSTITUER', 'MATH_5E_DIVISIBILITE',
  'MATH_5E_PUISSANCES', 'MATH_4E_ALGO_CONDITION', 'MATH_4E_PYTHAGORE', 'MATH_4E_PYTHAGORE_REC',
  'MATH_4E_MILIEUX', 'MATH_4E_THALES_INTRO', 'MATH_4E_COSINUS', 'MATH_4E_TRANSLATION',
  'MATH_4E_GEO_SOLIDES', 'MATH_4E_PROP_VITESSE', 'MATH_4E_PROP_POURCENT', 'MATH_4E_STAT_MOY_POND',
  'MATH_4E_STAT_MEDIANE', 'MATH_4E_PROBA_CALCUL', 'MATH_4E_MES_VOLUME', 'MATH_4E_MES_COMPOSEES',
  'MATH_4E_PUISSANCES', 'MATH_4E_PUISS_DIX', 'MATH_4E_FRAC_OPERATIONS', 'MATH_4E_REL_MULT',
  'MATH_4E_LITT_DEVELOPPER', 'MATH_4E_LITT_FACTORISER', 'MATH_4E_EQUATION', 'MATH_4E_PROB_EQUATION',
  'MATH_3E_ALGO_FONCTION', 'MATH_3E_THALES', 'MATH_3E_THALES_REC', 'MATH_3E_TRIGO',
  'MATH_3E_ROTATION', 'MATH_3E_HOMOTHETIE', 'MATH_3E_REPERAGE', 'MATH_3E_VECTEURS',
  'MATH_3E_FONC_NOTION', 'MATH_3E_FONC_LINEAIRE', 'MATH_3E_FONC_AFFINE', 'MATH_3E_FONC_GRAPHIQUE',
  'MATH_3E_STAT_QUARTILES', 'MATH_3E_PROBA_DEUX', 'MATH_3E_AGRANDISSEMENT', 'MATH_3E_MES_SPHERE',
  'MATH_3E_MES_COMPOSEES', 'MATH_3E_ARITH_DIVISEURS', 'MATH_3E_ARITH_PREMIERS', 'MATH_3E_FRAC_IRRED',
  'MATH_3E_RACINE', 'MATH_3E_PUISSANCES', 'MATH_3E_LITT_REMARQUABLE', 'MATH_3E_LITT_FACTORISER',
  'MATH_3E_EQ_PRODUIT', 'MATH_3E_EQ_PROBLEME',
  'FR_6E_ECR_RECIT', 'FR_6E_ECR_DIALOGUE', 'FR_6E_ECR_DESCRIPTION', 'FR_6E_ECR_REECRIRE',
  'FR_6E_ECR_REFLEXIF', 'FR_6E_ECR_MAIN', 'FR_6E_LANG_CLASSES', 'FR_6E_LANG_FONCTIONS',
  'FR_6E_LANG_INDICATIF', 'FR_6E_LANG_VALEURS', 'FR_6E_LANG_PP', 'FR_6E_LANG_HOMOPHONES',
  'FR_6E_LANG_FORMATION', 'FR_6E_LANG_PHRASE', 'FR_6E_LANG_VOC_RELATIONS', 'FR_6E_LANG_VOC_ORTHO',
  'FR_6E_LECT_OEUVRE', 'FR_6E_LECT_SCHEMA', 'FR_6E_LECT_MYTHE', 'FR_6E_LECT_NARRATEUR',
  'FR_6E_LECT_IMAGE', 'FR_6E_LECT_DISCOURS', 'FR_6E_LECT_FLUENCE', 'FR_6E_ORAL_VOIX_HAUTE',
  'FR_6E_ORAL_RACONTER', 'FR_6E_ORAL_ECOUTER', 'FR_5E_ECR_SUITE', 'FR_5E_ECR_THEATRE',
  'FR_5E_ECR_ARGUMENTER', 'FR_5E_ECR_BROUILLON', 'FR_5E_ECR_REFLEXIF', 'FR_5E_ECR_EVALUER',
  'FR_5E_LANG_PROPOSITIONS', 'FR_5E_LANG_RELATIVE', 'FR_5E_LANG_CONJONCTIVE', 'FR_5E_LANG_SUBJONCTIF',
  'FR_5E_LANG_CONDITIONNEL', 'FR_5E_LANG_VOIX', 'FR_5E_LANG_ACCORDS', 'FR_5E_LANG_LEXIQUE',
  'FR_5E_LANG_VOC_RELATIONS', 'FR_5E_LANG_ORTHOGRAPHE', 'FR_5E_LECT_CHEVALERIE', 'FR_5E_LECT_THEATRE',
  'FR_5E_LECT_COMIQUE', 'FR_5E_LECT_VOYAGE', 'FR_5E_LECT_FIGURES', 'FR_5E_ORAL_THEATRE',
  'FR_5E_ORAL_EXPOSE', 'FR_5E_ORAL_ECOUTER', 'FR_4E_ECR_NOUVELLE', 'FR_4E_ECR_ARGUMENTATION',
  'FR_4E_ECR_COMMENTER', 'FR_4E_ECR_PORTRAIT', 'FR_4E_ECR_EVALUER', 'FR_4E_LANG_DISCOURS',
  'FR_4E_LANG_CONCORDANCE', 'FR_4E_LANG_CIRCONSTANCIELLE', 'FR_4E_LANG_INTERROGATIVE', 'FR_4E_LANG_NEGATION',
  'FR_4E_LANG_PP_PRONOMINAL', 'FR_4E_LANG_CONNOTATION', 'FR_4E_LANG_VOC_RELATIONS', 'FR_4E_LECT_REALISME',
  'FR_4E_LECT_FANTASTIQUE', 'FR_4E_LECT_POESIE', 'FR_4E_LECT_PRESSE', 'FR_4E_LECT_REGISTRE',
  'FR_4E_ORAL_DEBAT', 'FR_4E_ORAL_RECITER', 'FR_4E_ORAL_ECOUTER', 'FR_3E_ECR_SUJET_REFLEXION',
  'FR_3E_ECR_SUJET_IMAGINATION', 'FR_3E_ECR_DICTEE', 'FR_3E_ECR_REFORMULER', 'FR_3E_ECR_EVALUER',
  'FR_3E_LANG_ANALYSE', 'FR_3E_LANG_MODES', 'FR_3E_LANG_HYPOTHESE', 'FR_3E_LANG_MODALISATION',
  'FR_3E_LANG_ORTHO', 'FR_3E_LANG_LEXIQUE', 'FR_3E_LANG_VOC_RELATIONS', 'FR_3E_LECT_AUTOBIO',
  'FR_3E_LECT_GUERRE', 'FR_3E_LECT_ENGAGEMENT', 'FR_3E_LECT_ROMAN', 'FR_3E_LECT_IMPLICITE',
  'FR_3E_ORAL_EXPOSE', 'FR_3E_ORAL_LECTURE', 'FR_3E_ORAL_ECOUTER',
]);

const PREFIXES = {
  SIXIEME: ['_6E_', '6e'], CINQUIEME: ['_5E_', '5e'], QUATRIEME: ['_4E_', '4e'], TROISIEME: ['_3E_', '3e'],
};

const JEUX = [
  ['escape-maths', escapeMaths, 'MATHS', /^MATH_/],
  ['escape-francais', escapeFrancais, 'FRANCAIS', /^FR_/],
];

describe.each(JEUX)('%s', (cle, jeu, matiere, prefixeMatiere) => {
  it('se décrit : famille, escape game, six cadenas, quatre classes du collège', () => {
    expect(jeu.FAMILLE).toEqual({ cle, titre: expect.any(String), matiereCode: matiere });
    expect(jeu.ESCAPE).toBe(true);
    expect(jeu.MANCHES).toBe(6);
    expect(jeu.CLASSES).toEqual(['SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME']);
    expect(jeu.bilan(6)).toBe('Sans une seule erreur. Bravo !');
    expect(jeu.bilan(1)).toBe('Tu y arrives. On recommence ?');
  });

  it('chaque phrase est fixe : aucun chiffre, une clé en kebab-case, jamais « raté » ni « faux »', () => {
    Object.entries(jeu.PHRASES).forEach(([c, texte]) => {
      expect(c).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
    });
  });

  describe.each(jeu.CLASSES.map((n) => [n]))('%s', (niveau) => {
    const [suffixe, court] = PREFIXES[niveau];

    it('la classe a son titre, son accroche, son décor, sa fin, et des compétences officielles de la classe', () => {
      const c = jeu.PAR_CLASSE[niveau];
      expect(c.titre.trim()).not.toBe('');
      expect(c.accroche.trim()).not.toBe('');
      expect(c.accroche.length).toBeLessThanOrEqual(45);
      expect(c.intro.trim()).not.toBe('');
      expect(c.fin.trim()).not.toBe('');
      expect(c.competences.length).toBeGreaterThan(0);
      c.competences.forEach((code) => {
        expect(COMPETENCES.has(code)).toBe(true);
        expect(code).toMatch(prefixeMatiere);
        expect(code).toContain(suffixe);
      });
    });

    it('chaque partie a six étapes, et chaque étape sa bonne réponse parmi des choix différents', () => {
      graines.forEach((g) => {
        const serie = jeu.serie(g, niveau);
        expect(serie).toHaveLength(jeu.MANCHES);
        serie.forEach((m) => {
          const cles = m.choix.map((x) => String(x.cle));
          expect(new Set(cles).size).toBe(cles.length);
          expect(cles.length).toBeGreaterThanOrEqual(2);
          expect(cles.length).toBeLessThanOrEqual(4);
          expect(cles).toContain(String(m.bonne));
          m.choix.forEach((x) => expect(String(x.libelle).trim()).not.toBe(''));
          expect(m.question.trim()).not.toBe('');
        });
      });
    });

    it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
      graines.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
        expect(jeu.PHRASES[m.consigne]).toBeTruthy();
        expect(jeu.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
        expect(m.aide === undefined || Boolean(jeu.PHRASES[m.aide])).toBe(true);
        Object.values(m.pieges).forEach((p) => expect(jeu.PHRASES[p]).toBeTruthy());
        expect(jeu.verdict(m, m.bonne)).toBe('juste');
        m.choix.filter((x) => String(x.cle) !== String(m.bonne)).forEach((x) => {
          const s = jeu.verdict(m, x.cle);
          expect(jeu.PHRASES[s]).toBeTruthy();
          expect(jeu.PHRASES[s]).not.toMatch(/raté/i);
        });
        expect(jeu.PHRASES[jeu.verdict(m, 'une-cle-inconnue')]).toBeTruthy();
      }));
    });

    it('les six étapes suivent le récit : consignes dans l’ordre, code qui se construit', () => {
      graines.forEach((g) => {
        const serie = jeu.serie(g, niveau);
        const pieces = [];
        serie.forEach((m, i) => {
          expect(m.consigne).toBe(`${court}-etape-${i + 1}`);
          expect(m.recit.trim()).not.toBe('');
          expect(m.cadenas.total).toBe(6);
          expect(m.cadenas.avant).toEqual(pieces);
          expect(m.cadenas.piece).toMatch(/^[0-9A-Z]$/);
          pieces.push(m.cadenas.piece);
        });
      });
    });

    it('la même graine redonne la même partie', () => {
      expect(jeu.serie(77, niveau)).toEqual(jeu.serie(77, niveau));
      expect(jeu.serie(1758000104729, niveau)).toEqual(jeu.serie(1758000104729, niveau));
    });
  });
});

// ------------------------------------------------------ l'exactitude des maths

const EXPOSANTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const nombre = (s) => Number(String(s).replace('−', '-'));
/** Les nombres de la question, avec leur signe moins quand il est collé. */
const nombres = (q) => (q.match(/−?\d+/g) || []).map(nombre);
const racine = (n) => {
  const r = Math.round(Math.sqrt(n));
  expect(r * r).toBe(n);
  return r;
};

/** La réponse recalculée depuis la question affichée, étape par étape. */
const RECALCUL = {
  '6e-etape-1': ([a, b, c]) => a + b * c,
  '6e-etape-2': ([n, d, q]) => (n * q) / d,
  '6e-etape-3': ([total, k]) => total % k,
  '6e-etape-4': ([L, l]) => 2 * (L + l),
  '6e-etape-5': ([b, h]) => (b * h) / 2,
  '6e-etape-6': ([p, q]) => (p * q) / 100,
  '5e-etape-1': ([a, b]) => a + b,
  '5e-etape-2': ([a, b, c, d]) => a * (b + c) - d,
  '5e-etape-3': ([k, m, p]) => m * k + p,
  '5e-etape-4': ([a, b]) => 180 - a - b,
  '5e-etape-5': (v) => v.reduce((s, x) => s + x, 0) / v.length,
  '5e-etape-6': ([volume, duree, autre]) => (volume / duree) * autre,
  '4e-etape-1': (_, q) => {
    const [, b1, e1, b2, e2] = q.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) × (\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = /);
    expect(b1).toBe(b2);
    const lire = (e) => Number(e.split('').map((c) => EXPOSANTS.indexOf(c)).join(''));
    return lire(e1) + lire(e2);
  },
  '4e-etape-2': ([x, y]) => x * y,
  '4e-etape-3': ([a, b, c]) => (c - b) / a,
  '4e-etape-4': ([a, b]) => racine(a * a + b * b),
  '4e-etape-5': ([d, t], q) => (/min/.test(q) ? (d * 60) / t : d / t),
  '4e-etape-6': ([r, b]) => (r * 100) / (r + b),
  '3e-etape-1': ([a, b, c, d]) => {
    const x = (d + b) / (a - c);
    expect(a * x - b).toBe(c * x + d);
    return x;
  },
  '3e-etape-2': ([am, ab, bc]) => (bc * am) / ab,
  '3e-etape-3': ([a, b, k]) => a * k + b,
  '3e-etape-4': ([r, t]) => (r * r * 100) / (t * t),
  '3e-etape-5': (v) => [...v].sort((x, y) => x - y)[3],
  '3e-etape-6': ([c, a]) => racine(c * c - a * a),
};

/** La valeur d'un choix : un entier, ou une racine non simplifiée. */
const valeur = (cle) => (String(cle).startsWith('√') ? Math.sqrt(Number(cle.slice(1))) : nombre(cle));

describe('escape-maths : chaque réponse recalculée depuis la question', () => {
  describe.each(escapeMaths.CLASSES.map((n) => [n]))('%s', (niveau) => {
    it('la bonne réponse est le vrai résultat, la pièce son chiffre des unités, et aucun autre choix n’est juste', () => {
      graines.forEach((g) => escapeMaths.serie(g, niveau).forEach((m) => {
        const juste = RECALCUL[m.consigne](nombres(m.question), m.question);
        expect(Number.isInteger(juste)).toBe(true);
        expect(nombre(m.bonne)).toBe(juste);
        expect(m.cadenas.piece).toBe(String(Math.abs(juste) % 10));
        m.choix.filter((x) => x.cle !== m.bonne).forEach((x) => expect(valeur(x.cle)).not.toBe(juste));
        Object.keys(m.pieges).forEach((p) => {
          expect(p).not.toBe(m.bonne);
          expect(valeur(p)).not.toBe(juste);
        });
      }));
    });
  });

  it('les pièges qui font le jeu apparaissent vraiment', () => {
    const toutes = (niveau) => graines.flatMap((g) => escapeMaths.serie(g, niveau));
    const vus = new Set(['SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME']
      .flatMap((n) => toutes(n).flatMap((m) => Object.values(m.pieges))));
    ['priorites-gauche-droite', 'reste-pas-quotient', 'perimetre-aire', 'aire-triangle-moitie',
      'relatifs-ajouter-distances', 'substituer-coller', 'angles-trois-cent-soixante', 'moyenne-diviser',
      'proportion-ajouter', 'puissances-multiplier-exposants', 'relatifs-regle-des-signes',
      'pythagore-somme', 'pythagore-racine', 'vitesse-minutes', 'proba-sur-le-total',
      'thales-rapport-inverse', 'fonction-image-antecedent', 'proba-un-tirage', 'mediane-ranger',
      'pythagore-hypotenuse', 'pythagore-difference'].forEach((p) => expect(vus).toContain(p));
  });
});

// --------------------------------------------------- l'exactitude du français

describe('escape-francais : des banques relues', () => {
  it('chaque phrase de chaque banque : une seule bonne réponse, jamais aussi un piège, et chaque piège a sa phrase', () => {
    Object.entries(escapeFrancais.BANQUES).forEach(([, etapes]) => {
      expect(etapes).toHaveLength(6);
      etapes.forEach((banque) => {
        expect(banque.length).toBeGreaterThanOrEqual(2);
        banque.forEach(({ question, bonne, pieges }) => {
          expect(question.trim()).not.toBe('');
          expect(Object.keys(pieges).length).toBeGreaterThanOrEqual(1);
          expect(Object.keys(pieges).length).toBeLessThanOrEqual(3);
          expect(Object.keys(pieges)).not.toContain(bonne);
          Object.values(pieges).forEach((p) => expect(escapeFrancais.PHRASES[p]).toBeTruthy());
        });
      });
    });
  });

  it('les six lettres forment le mot de la classe, que la fin affiche', () => {
    escapeFrancais.CLASSES.forEach((niveau) => {
      const mot = escapeFrancais.MOTS[niveau];
      expect(mot).toHaveLength(6);
      expect(escapeFrancais.PAR_CLASSE[niveau].fin).toContain(mot);
      graines.forEach((g) => {
        const serie = escapeFrancais.serie(g, niveau);
        expect(serie.map((m) => m.cadenas.piece).join('')).toBe(mot);
        serie.forEach((m) => {
          expect(Object.keys(m.pieges)).not.toContain(m.bonne);
          expect(m.choix.map((x) => x.cle).sort()).toEqual([m.bonne, ...Object.keys(m.pieges)].sort());
        });
      });
    });
  });

  it('chaque phrase de chaque banque finit par sortir', () => {
    escapeFrancais.CLASSES.forEach((niveau) => {
      const vues = new Set(graines.flatMap((g) => escapeFrancais.serie(g, niveau).map((m) => m.question)));
      escapeFrancais.BANQUES[niveau].flat().forEach(({ question }) => expect(vues).toContain(question));
    });
  });
});
