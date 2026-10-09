/**
 * LES JEUX DE FRANÇAIS DU COLLÈGE, LOT E — Adrien, de la 6e à la 3e.
 * Neuf modules : le détective des classes, COD ou COI, décor ou action, les
 * homophones, le schéma narratif, dieux et héros, le participe passé, qui
 * parle, qui raconte. Même épreuve que les jeux du CM2 : soixante parties
 * par module ET par classe, puis les pièges qui font chaque jeu.
 */

import * as detective from '../lib/jeux/college/detective-des-classes.js';
import * as codOuCoi from '../lib/jeux/college/cod-ou-coi.js';
import * as decor from '../lib/jeux/college/decor-ou-action.js';
import * as homophones from '../lib/jeux/college/homophones-college.js';
import * as schema from '../lib/jeux/college/schema-narratif.js';
import * as dieux from '../lib/jeux/college/dieux-et-heros.js';
import * as participe from '../lib/jeux/college/participe-passe-college.js';
import * as quiParle from '../lib/jeux/college/qui-parle.js';
import * as quiRaconte from '../lib/jeux/college/qui-raconte-college.js';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes du référentiel (competences-college.txt, lu le 06/10/2026) dont ce lot se sert. */
const CODES = new Set([
  'FR_6E_LANG_CLASSES',
  'FR_6E_LANG_FONCTIONS',
  'FR_6E_LANG_VALEURS',
  'FR_6E_LANG_PP',
  'FR_6E_LANG_HOMOPHONES',
  'FR_6E_LECT_SCHEMA',
  'FR_6E_LECT_MYTHE',
  'FR_6E_LECT_NARRATEUR',
  'FR_6E_LECT_DISCOURS',
  'FR_4E_LANG_DISCOURS',
  'FR_4E_LANG_PP_PRONOMINAL',
  'FR_3E_LECT_AUTOBIO',
]);

const PREFIXE = {
  SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_',
};

/** [nom, module, clé attendue]. */
const JEUX = [
  ['le détective des classes', detective, 'detective-des-classes'],
  ['COD ou COI', codOuCoi, 'cod-ou-coi'],
  ['décor ou action', decor, 'decor-ou-action'],
  ['les homophones', homophones, 'homophones-college'],
  ['le schéma narratif', schema, 'schema-narratif'],
  ['dieux et héros', dieux, 'dieux-et-heros'],
  ['le participe passé', participe, 'participe-passe-college'],
  ['qui parle', quiParle, 'qui-parle'],
  ['qui raconte', quiRaconte, 'qui-raconte-college'],
];

/** Chaque module, avec chacune de ses classes. */
const PARTIES = JEUX.flatMap(([nom, module]) => module.CLASSES.map((niveau) => [`${nom} (${niveau})`, module, niveau]));

describe.each(JEUX)('%s : le module', (_, module, cle) => {
  it('se décrit : famille, classes, compétences du référentiel', () => {
    expect(module.FAMILLE).toEqual({ cle, titre: expect.any(String), matiereCode: 'FRANCAIS' });
    expect(module.FAMILLE.titre.trim()).not.toBe('');
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    expect(module.CLASSES.length).toBeGreaterThan(0);
    expect(module.MANCHES).toBe(8);
    module.CLASSES.forEach((niveau) => {
      const { titre, accroche, competences } = module.PAR_CLASSE[niveau];
      expect(PREFIXE[niveau]).toBeTruthy();
      expect(titre.trim()).not.toBe('');
      expect(accroche.trim()).not.toBe('');
      expect(accroche.length).toBeLessThanOrEqual(45);
      expect(competences.length).toBeGreaterThan(0);
      competences.forEach((c) => {
        expect(CODES.has(c)).toBe(true);
        expect(c).toContain(PREFIXE[niveau]);
      });
    });
  });

  it('ses phrases sont fixes : clés en kebab-case, aucun chiffre, jamais « raté »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(typeof texte).toBe('string');
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté/i);
      // Typographie française : une espace avant ? ! : et ;
      expect(texte).not.toMatch(/[^\s  ][?!:;]/);
    });
  });

  it('ses banques sont larges : au moins trois phrases par manche tirée, huit manches en tout', () => {
    module.CLASSES.forEach((niveau) => {
      const sortes = module.SORTES[niveau];
      expect(sortes.length).toBeGreaterThanOrEqual(2);
      expect(sortes.reduce((n, s) => n + s.nombre, 0)).toBe(module.MANCHES);
      sortes.forEach((s) => expect(s.banque.length).toBeGreaterThanOrEqual(3 * s.nombre));
    });
  });

  it('le bilan est celui de tous les jeux', () => {
    expect(module.bilan(8)).toBe('Sans une seule erreur. Bravo !');
    expect(module.bilan(0)).toBe('Tu y arrives. On recommence ?');
  });
});

describe.each(PARTIES)('%s : soixante parties', (_, module, niveau) => {
  const toutes = graines.map((g) => module.serie(g, niveau));

  it('chaque partie a ses manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    toutes.forEach((serie) => {
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(String(m.bonne));
        m.choix.forEach((c) => expect(String(c.libelle).trim()).not.toBe(''));
        expect(String(m.question).trim()).not.toBe('');
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    toutes.flat().forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(module.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
      expect(module.PHRASES[m.aide ?? m.consigne]).toBeTruthy();
      expect(module.verdict(m, m.bonne)).toBe('juste');
      m.choix.filter((c) => String(c.cle) !== String(m.bonne)).forEach((c) => {
        const s = module.verdict(m, c.cle);
        expect(module.PHRASES[s]).toBeTruthy();
        expect(module.PHRASES[s]).not.toMatch(/raté/i);
      });
    });
  });

  it('la bonne réponse n’est jamais un piège, et chaque choix faux a son piège nommé', () => {
    toutes.flat().forEach((m) => {
      const pieges = Object.keys(m.pieges);
      expect(pieges).not.toContain(String(m.bonne));
      const cles = m.choix.map((c) => String(c.cle));
      pieges.forEach((p) => expect(cles).toContain(p));
      cles.filter((c) => c !== String(m.bonne)).forEach((c) => expect(pieges).toContain(c));
      Object.values(m.pieges).forEach((p) => expect(module.PHRASES[p]).toBeTruthy());
    });
  });

  it('les manches d’une partie ne se répètent pas', () => {
    toutes.forEach((serie) => {
      const questions = serie.map((m) => `${m.question}|${m.choix.map((c) => c.libelle).sort().join('|')}`);
      expect(new Set(questions).size).toBe(questions.length);
    });
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, niveau)).toEqual(module.serie(77, niveau));
    expect(module.serie(1758000123456, niveau)).toEqual(module.serie(1758000123456, niveau));
  });
});

describe('les pièges qui font chaque jeu', () => {
  const toutes = (module, niveau = 'SIXIEME') => graines.flatMap((g) => module.serie(g, niveau));

  it('le détective et COD ou COI : un seul mot ou groupe entre crochets', () => {
    [...toutes(detective), ...toutes(codOuCoi)].forEach((m) => {
      expect(m.question.match(/\[/g)).toHaveLength(1);
      expect(m.question.match(/\]/g)).toHaveLength(1);
    });
  });

  it('le détective : « le » devant un verbe est un pronom, devant un nom un déterminant', () => {
    toutes(detective).filter((m) => m.pieges.determinant === 'le-pronom').forEach((m) => expect(m.bonne).toBe('pronom'));
    toutes(detective).filter((m) => m.pieges.pronom === 'le-determinant').forEach((m) => expect(m.bonne).toBe('determinant'));
  });

  it('les homophones : un seul trou, la majuscule en début de phrase seulement', () => {
    toutes(homophones).forEach((m) => {
      expect(m.question.match(/___/g)).toHaveLength(1);
      const debut = m.question.startsWith('___');
      m.choix.forEach((c) => {
        const premiere = c.cle[0];
        expect(premiere === premiere.toUpperCase()).toBe(debut);
      });
    });
  });

  it('décor ou action : deux formes différentes, et la paire inverse toujours proposée', () => {
    toutes(decor).forEach((m) => {
      const libelles = m.choix.map((c) => c.libelle);
      expect(new Set(libelles).size).toBe(libelles.length);
    });
    toutes(decor).filter((m) => m.consigne === 'deux-plans').forEach((m) => {
      const inverse = m.bonne === 'imp-ps' ? 'ps-imp' : 'imp-ps';
      expect(m.pieges[inverse]).toBe('deux-plans-inverses');
    });
  });

  it('le schéma narratif : la phrase du premier moment est bien la plus tôt, celle du dernier la plus tardive', () => {
    const rang = (cle) => schema.ETAPES.indexOf(cle);
    const rangs = (m) => m.choix.map((c) => rang(c.cle));
    toutes(schema).filter((m) => m.consigne === 'ordre-premier').forEach((m) => expect(rang(m.bonne)).toBe(Math.min(...rangs(m))));
    toutes(schema).filter((m) => m.consigne === 'ordre-dernier').forEach((m) => expect(rang(m.bonne)).toBe(Math.max(...rangs(m))));
  });

  it('le schéma narratif : jamais deux fois la même histoire dans une partie', () => {
    graines.forEach((g) => {
      const ordres = schema.serie(g).filter((m) => m.consigne.startsWith('ordre-'));
      expect(ordres).toHaveLength(4);
      const histoires = ordres.map((m) => m.choix.map((c) => c.libelle).join('|'));
      expect(new Set(histoires).size).toBe(4);
    });
  });

  it('le participe passé : l’invariable est la forme courte, l’accord ajoute des marques', () => {
    const invariables = ['avoir-sujet', 'avoir-cod-apres', 'pronominal-cod-apres', 'pronominal-coi'];
    const oublis = ['etre-oubli', 'avoir-cod-avant', 'pronominal-sujet'];
    const manches = [...toutes(participe, 'SIXIEME'), ...toutes(participe, 'QUATRIEME')];
    // La forme de base (masculin singulier) est la plus courte ; les autres la prolongent par e, s ou es.
    const base = (m) => m.choix.map((c) => c.cle).sort((a, b) => a.length - b.length)[0];
    manches.forEach((m) => {
      m.choix.filter((c) => c.cle !== base(m)).forEach((c) => expect(c.cle).toMatch(new RegExp(`^${base(m)}(e|s|es)$`)));
    });
    // Invariable : la bonne réponse est la forme de base.
    manches.filter((m) => Object.values(m.pieges).some((e) => invariables.includes(e)))
      .forEach((m) => expect(m.bonne).toBe(base(m)));
    // Accord oublié : la forme de base est le piège, la bonne réponse est accordée.
    manches.filter((m) => Object.values(m.pieges).some((e) => oublis.includes(e))).forEach((m) => {
      const oubli = Object.keys(m.pieges).find((k) => oublis.includes(m.pieges[k]));
      expect(oubli).toBe(base(m));
      expect(m.bonne).not.toBe(base(m));
    });
  });

  it('qui parle (6e) : le narrateur n’est jamais celui qui parle', () => {
    toutes(quiParle).filter((m) => m.consigne === 'qui-dit').forEach((m) => {
      expect(m.bonne).not.toBe('Le narrateur');
      expect(m.question).toMatch(/Qui dit : « .+ » \?$/);
    });
  });

  it('qui parle (4e) : la bonne transposition n’a ni guillemets, ni inversion, ni point d’exclamation', () => {
    toutes(quiParle, 'QUATRIEME').forEach((m) => expect(m.bonne).not.toMatch(/[«»!?]/));
    toutes(quiParle, 'QUATRIEME').filter((m) => m.consigne === 'vers-indirect')
      .forEach((m) => expect(m.bonne).toMatch(/^(que |qu’|si |s’|où |d’|de )/));
  });

  it('qui raconte (6e) : le « je » d’un dialogue ne fait pas un narrateur personnage', () => {
    toutes(quiRaconte).filter((m) => m.consigne === 'qui-raconte').forEach((m) => {
      const horsGuillemets = m.question.replace(/«[^»]*»/g, '');
      const dit = /\b(je|nous|moi|mon|mes)\b|j’|m’/i.test(horsGuillemets);
      expect(m.bonne).toBe(dit ? 'personnage' : 'exterieur');
    });
  });

  it('qui raconte (3e) : « autobiographie » n’est jamais proposée face à un journal ou des mémoires', () => {
    toutes(quiRaconte, 'TROISIEME')
      .filter((m) => m.consigne === 'quel-genre' && (m.bonne === 'journal' || m.bonne === 'memoires'))
      .forEach((m) => expect(m.choix.map((c) => c.cle)).not.toContain('autobiographie'));
  });
});
