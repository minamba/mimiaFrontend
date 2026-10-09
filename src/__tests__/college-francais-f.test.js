/**
 * LES JEUX DE FRANÇAIS DU COLLÈGE (lot F) — la roue des verbes, le mot
 * juste, simple ou complexe, le tri des subordonnées, actif ou passif, les
 * accords. Même épreuve que les jeux du CM2 : soixante parties par module et
 * par classe, puis l'exactitude des banques.
 */

import * as roue from '../lib/jeux/college/roue-des-verbes-college.js';
import * as motJuste from '../lib/jeux/college/le-mot-juste.js';
import * as simpleComplexe from '../lib/jeux/college/simple-ou-complexe.js';
import * as subordonnees from '../lib/jeux/college/tri-des-subordonnees.js';
import * as voix from '../lib/jeux/college/actif-ou-passif.js';
import * as accords from '../lib/jeux/college/les-accords-college.js';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les compétences de français du référentiel (competences-college.txt), mot pour mot. */
const COMPETENCES = new Set([
  'FR_6E_LANG_CLASSES', 'FR_6E_LANG_FONCTIONS', 'FR_6E_LANG_INDICATIF', 'FR_6E_LANG_VALEURS',
  'FR_6E_LANG_PP', 'FR_6E_LANG_HOMOPHONES', 'FR_6E_LANG_FORMATION', 'FR_6E_LANG_PHRASE',
  'FR_6E_LANG_VOC_RELATIONS', 'FR_6E_LANG_VOC_ORTHO',
  'FR_5E_LANG_PROPOSITIONS', 'FR_5E_LANG_RELATIVE', 'FR_5E_LANG_CONJONCTIVE', 'FR_5E_LANG_SUBJONCTIF',
  'FR_5E_LANG_CONDITIONNEL', 'FR_5E_LANG_VOIX', 'FR_5E_LANG_ACCORDS', 'FR_5E_LANG_LEXIQUE',
  'FR_5E_LANG_VOC_RELATIONS', 'FR_5E_LANG_ORTHOGRAPHE',
  'FR_4E_LANG_DISCOURS', 'FR_4E_LANG_CONCORDANCE', 'FR_4E_LANG_CIRCONSTANCIELLE',
  'FR_4E_LANG_INTERROGATIVE', 'FR_4E_LANG_NEGATION', 'FR_4E_LANG_PP_PRONOMINAL',
  'FR_4E_LANG_CONNOTATION', 'FR_4E_LANG_VOC_RELATIONS',
  'FR_3E_LANG_ANALYSE', 'FR_3E_LANG_MODES', 'FR_3E_LANG_HYPOTHESE', 'FR_3E_LANG_MODALISATION',
  'FR_3E_LANG_ORTHO', 'FR_3E_LANG_LEXIQUE', 'FR_3E_LANG_VOC_RELATIONS',
]);
const PREFIXE = {
  SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_',
};

const MODULES = [
  ['la roue des verbes', roue, 'roue-des-verbes-college'],
  ['le mot juste', motJuste, 'le-mot-juste'],
  ['simple ou complexe', simpleComplexe, 'simple-ou-complexe'],
  ['le tri des subordonnées', subordonnees, 'tri-des-subordonnees'],
  ['actif ou passif', voix, 'actif-ou-passif'],
  ['les accords', accords, 'les-accords-college'],
];

/** [nom, module, classe] pour chaque classe de chaque module. */
const PARTIES = MODULES.flatMap(([nom, module]) => module.CLASSES.map((classe) => [`${nom} — ${classe}`, module, classe]));

describe.each(MODULES)('%s : le module', (_, module, cle) => {
  it('se décrit : famille, classes, manches', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'FRANCAIS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.MANCHES).toBe(8);
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    expect(module.CLASSES.length).toBeGreaterThan(0);
    expect(module.bilan(8)).toBeTruthy();
  });

  it('chaque classe a son titre, son accroche courte et des compétences du référentiel', () => {
    module.CLASSES.forEach((classe) => {
      const c = module.PAR_CLASSE[classe];
      expect(PREFIXE[classe]).toBeTruthy();
      expect(c.titre).toBeTruthy();
      expect(c.accroche).toBeTruthy();
      expect(c.accroche.length).toBeLessThanOrEqual(45);
      expect(c.competences.length).toBeGreaterThan(0);
      c.competences.forEach((code) => {
        expect(COMPETENCES.has(code)).toBe(true);
        expect(code).toContain(PREFIXE[classe]);
      });
    });
  });

  it('ce qui se dit est fixe : clés en kebab-case, aucun chiffre, jamais « raté »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof texte).toBe('string');
      expect(texte.length).toBeGreaterThan(0);
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|faux !/i);
    });
  });
});

describe.each(PARTIES)('%s', (_, module, classe) => {
  it('chaque partie a ses manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, classe);
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(String(m.bonne));
        m.choix.forEach((c) => expect(c.libelle).toBeTruthy());
        expect(m.question).toBeTruthy();
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(m.aide === undefined || Boolean(module.PHRASES[m.aide])).toBe(true);
      expect(module.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
      Object.values(m.pieges ?? {}).forEach((p) => expect(module.PHRASES[p]).toBeTruthy());
      expect(module.verdict(m, m.bonne)).toBe('juste');
      m.choix.filter((c) => String(c.cle) !== String(m.bonne)).forEach((c) => {
        const s = module.verdict(m, c.cle);
        expect(module.PHRASES[s]).toBeTruthy();
        expect(module.PHRASES[s]).not.toMatch(/raté/i);
      });
    }));
  });

  it('la bonne réponse n’est jamais aussi un piège', () => {
    graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      expect(Object.keys(m.pieges ?? {})).not.toContain(String(m.bonne));
      Object.keys(m.pieges ?? {}).forEach((k) => expect(m.choix.map((c) => String(c.cle))).toContain(k));
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, classe)).toEqual(module.serie(77, classe));
    expect(module.serie(1758000123456, classe)).toEqual(module.serie(1758000123456, classe));
  });

  it('une partie ne pose pas deux fois la même question', () => {
    graines.forEach((g) => {
      const questions = module.serie(g, classe).map((m) => `${m.consigne}|${m.question}|${m.bonne}`);
      expect(new Set(questions).size).toBe(questions.length);
    });
  });

  it('les parties varient d’une graine à l’autre', () => {
    const premieres = new Set(graines.map((g) => module.serie(g, classe)[0].question));
    expect(premieres.size).toBeGreaterThan(5);
  });
});

describe('l’exactitude des banques', () => {
  /** Une entrée [question, bonne, [faux, piège], …] : la bonne n'est jamais parmi les faux. */
  const banqueSaine = (banque) => banque.forEach(([, bonne, ...faux]) => {
    const libelles = faux.map(([f]) => f);
    expect(libelles).not.toContain(bonne);
    expect(new Set(libelles).size).toBe(libelles.length);
  });

  it('les banques à pièges nommés ne confondent jamais bonne réponse et piège', () => {
    [
      roue.CONJUGUER_6E, roue.COMPOSES_6E, roue.SUBJONCTIF_5E, roue.FUTUR_CONDITIONNEL_5E,
      roue.AVANT_4E, roue.APRES_4E, roue.PENDANT_4E, roue.CHOISIR_MODE_3E,
      motJuste.FORMATION_6E, motJuste.PASSE_PARTOUT_3E, motJuste.VERBE_PRECIS_3E,
      simpleComplexe.INVERSIONS_4E, simpleComplexe.NEGATIONS_4E,
      voix.TRANSFORMER, accords.VERBES, accords.ADJECTIFS,
    ].forEach(banqueSaine);
  });

  it('les banques à étiquettes : la bonne étiquette diffère des deux voisines', () => {
    [roue.QUEL_TEMPS_6E, roue.QUEL_MODE_3E, roue.VALEUR_3E, subordonnees.SENS_4E, subordonnees.NATURES_3E].forEach((banque) => {
      banque.forEach(([, bonne, a, b]) => expect(new Set([bonne, a, b]).size).toBe(3));
    });
    [motJuste.SYNONYMES_6E, motJuste.POLYSEMIE_6E].forEach((banque) => {
      banque.forEach(([, , bonne, a, b]) => expect(new Set([bonne, a, b]).size).toBe(3));
    });
    motJuste.SENTIMENTS_5E.forEach(([, bonne, a, b]) => expect(new Set([bonne, a, b]).size).toBe(3));
    motJuste.GRADATION_5E.forEach((t) => expect(new Set(t).size).toBe(3));
    motJuste.DENOTATIONS_4E.forEach(([, d, c, i]) => expect(new Set([d, c, i]).size).toBe(3));
    motJuste.HYPERONYMES_3E.forEach(([, bonne, a, b]) => expect(new Set([bonne, a, b]).size).toBe(3));
    subordonnees.ANTECEDENTS_5E.forEach(([phrase, bonne, dedans, autre]) => {
      expect(new Set([bonne, dedans, autre]).size).toBe(3);
      // L'antécédent est hors des crochets, le mot « dedans » à l'intérieur.
      const [avant, reste] = phrase.split('[');
      const [relative] = reste.split(']');
      expect(avant).toContain(bonne);
      expect(relative).toContain(dedans);
    });
    subordonnees.SUBORDONNANTS_4E.forEach(([, , bonne, a, b]) => expect(new Set([bonne, a, b]).size).toBe(3));
    subordonnees.VERBE_COMPLETE_5E.forEach(([phrase, principal, sien]) => {
      const [avant, reste] = phrase.split('[');
      expect(avant).toContain(principal);
      expect(reste).toContain(sien);
    });
    simpleComplexe.RELIER_5E.forEach((t) => expect(new Set(t).size).toBe(3));
    voix.AGENTS.forEach(([phrase, agent, sujet, cc]) => {
      expect(new Set([agent, sujet, cc]).size).toBe(3);
      [agent, sujet, cc].forEach((g) => expect(phrase.toLowerCase()).toContain(g.toLowerCase()));
      expect(agent).toMatch(/^(par|de) /);
    });
  });

  it('chaque question montre ce qu’elle demande : les points de suspension ou les crochets', () => {
    [roue.SUBJONCTIF_5E, roue.FUTUR_CONDITIONNEL_5E, roue.AVANT_4E, roue.APRES_4E, roue.PENDANT_4E,
      roue.CHOISIR_MODE_3E, accords.VERBES, accords.ADJECTIFS].forEach((banque) => {
      banque.forEach(([question]) => expect(question).toContain('…'));
    });
    [roue.QUEL_MODE_3E, roue.VALEUR_3E, motJuste.VERBE_PRECIS_3E, motJuste.PASSE_PARTOUT_3E,
      subordonnees.SENS_4E, subordonnees.NATURES_3E, subordonnees.NATURES_4E,
      subordonnees.RELATIVE_CONJONCTIVE_5E, subordonnees.ANTECEDENTS_5E, simpleComplexe.MOTS_5E].forEach((banque) => {
      banque.forEach(([question]) => expect(question).toMatch(/\[[^\]]+\]/));
    });
  });

  it('simple ou complexe : les phrases simples ne mettent qu’un verbe conjugué en jeu, les complexes plusieurs', () => {
    // Les deux listes ne se recoupent pas, et le compte des verbes reste entre un et quatre.
    const simples = simpleComplexe.SIMPLES_6E.map(([p]) => p);
    simpleComplexe.COMPLEXES_6E.forEach((p) => expect(simples).not.toContain(p));
    simpleComplexe.COMPTER_6E.forEach(([, n]) => expect([1, 2, 3]).toContain(n));
    subordonnees.PROPOSITIONS_3E.forEach(([, n]) => expect(n).toBeGreaterThanOrEqual(2));
    // « laquelle est complexe ? » a toujours de quoi tirer deux manches de phrases courtes.
    expect(simpleComplexe.SIMPLES_6E.filter(([p]) => p.length <= 45).length).toBeGreaterThanOrEqual(6);
    expect(simpleComplexe.COMPLEXES_6E.filter((p) => p.length <= 45).length).toBeGreaterThanOrEqual(5);
  });

  it('le compte des verbes : la bonne réponse est le nombre écrit dans la banque, et les choix l’encadrent', () => {
    graines.forEach((g) => {
      simpleComplexe.serie(g, 'SIXIEME').filter((m) => m.consigne === 'compter-6e').forEach((m) => {
        const [, n] = simpleComplexe.COMPTER_6E.find(([p]) => p === m.question);
        expect(m.bonne).toBe(String(n));
      });
      subordonnees.serie(g, 'TROISIEME').filter((m) => m.consigne === 'propositions-3e').forEach((m) => {
        const [, n] = subordonnees.PROPOSITIONS_3E.find(([p]) => p === m.question);
        expect(m.bonne).toBe(String(n));
        expect(m.choix.map((c) => c.cle)).toEqual([String(n - 1), String(n), String(n + 1)]);
      });
    });
  });

  it('les accords : leur devant un verbe, leurs devant un nom pluriel', () => {
    accords.LEUR.forEach(([, bonne, raison]) => {
      expect(bonne).toBe(raison === 'pluriel' ? 'leurs' : 'leur');
    });
  });

  it('actif ou passif : la voix passive garde « par » ou « de » et l’auxiliaire être', () => {
    voix.TRANSFORMER.forEach(([, passive]) => {
      expect(passive).toMatch(/ (est|sont|était|étaient|sera|seront|fut|a été|ont été) /);
      expect(passive).toMatch(/ par /);
    });
  });
});
