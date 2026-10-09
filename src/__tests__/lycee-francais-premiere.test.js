/**
 * LES JEUX DE FRANÇAIS DE 1re — le bac de français d'Adrien, voies générale
 * et technologique : la question de grammaire, la dissertation,
 * l'explication linéaire, procédés et effets, la culture littéraire.
 * Même épreuve que le collège : soixante parties par module et par classe,
 * puis l'exactitude, vérifiée sur pièces.
 */

import * as grammaire from '../lib/jeux/lycee/question-de-grammaire';
import * as dissertation from '../lib/jeux/lycee/dissertation';
import * as lineaire from '../lib/jeux/lycee/explication-lineaire';
import * as procedes from '../lib/jeux/lycee/procedes-et-effets';
import * as culture from '../lib/jeux/lycee/culture-litteraire';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes utiles, recopiés de competences-lycee.txt (hors du dépôt), avec la classe de leur colonne NIVEAU. */
const COMPETENCES = {
  FR_1RE_LECT_PARCOURS: 'PREMIERE',
  FR_1RE_METH_LINEAIRE: 'PREMIERE',
  FR_1RE_METH_GRAMMAIRE: 'PREMIERE',
  FR_1RE_ECR_COMMENTAIRE: 'PREMIERE',
  FR_1RE_ECR_DISSERTATION: 'PREMIERE',
  FR_1RE_ECR_PROBLEMATISER: 'PREMIERE',
  FR_1RE_ECR_EXEMPLES: 'PREMIERE',
  FR_1RE_LANG_SUBORDINATION: 'PREMIERE',
  FR_1RE_LANG_INTERROGATION: 'PREMIERE',
  FR_1RE_LANG_NEGATION: 'PREMIERE',
  FR_1TEC_LANG_CIRCONSTANCIELLES: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_INTERROGATION: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_NEGATION: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_CONTEXTE: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_COMMENTAIRE: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_ETAYER_ESSAI: 'PREMIERE_TECHNO',
  FR_1TEC_METH_LINEAIRE: 'PREMIERE_TECHNO',
  FR_1TEC_METH_GRAMMAIRE: 'PREMIERE_TECHNO',
};

/** [clé de la famille, module, classes attendues]. */
const JEUX = [
  ['question-de-grammaire', grammaire, ['PREMIERE', 'PREMIERE_TECHNO']],
  ['dissertation', dissertation, ['PREMIERE']],
  ['explication-lineaire', lineaire, ['PREMIERE', 'PREMIERE_TECHNO']],
  ['procedes-et-effets', procedes, ['PREMIERE', 'PREMIERE_TECHNO']],
  ['culture-litteraire', culture, ['PREMIERE', 'PREMIERE_TECHNO']],
];

const PARTIES = JEUX.flatMap(([cle, module]) => module.CLASSES.map((classe) => [`${cle} (${classe})`, module, classe]));

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));

describe.each(JEUX)('%s', (cle, module, classes) => {
  it('se présente : famille, matière, ses classes, ses compétences officielles de la bonne classe', () => {
    expect(module.FAMILLE).toEqual({ cle, titre: expect.any(String), matiereCode: 'FRANCAIS' });
    expect(module.FAMILLE.titre.trim()).not.toBe('');
    expect(module.CLASSES).toEqual(classes);
    expect(module.MANCHES).toBe(8);
    expect(module.ESCAPE).toBeUndefined();
    module.CLASSES.forEach((c) => {
      const p = module.PAR_CLASSE[c];
      expect(p.titre.trim()).not.toBe('');
      expect(p.accroche.trim()).not.toBe('');
      expect(p.accroche.length).toBeLessThanOrEqual(45);
      expect(p.competences.length).toBeGreaterThan(0);
      p.competences.forEach((code) => expect([code, COMPETENCES[code]]).toEqual([code, c]));
    });
  });

  it('ses phrases sont fixes : clés en kebab-case, aucun chiffre, jamais « raté » ni « faux »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof texte).toBe('string');
      expect(texte.trim()).not.toBe('');
      expect([k, texte]).not.toEqual([k, expect.stringMatching(/\d/)]);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
      // Typographie française : une espace avant « ? ! : ; ».
      expect([k, texte]).not.toEqual([k, expect.stringMatching(/[^\s ][?!:;]/)]);
    });
  });

  it('le mot de la fin est le commun', () => {
    expect(module.bilan(8)).toBe('Sans une seule erreur. Bravo !');
    expect(module.bilan(1)).toBe('Tu y arrives. On recommence ?');
  });
});

describe.each(PARTIES)('%s', (_, module, classe) => {
  it('chaque partie a ses huit manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, classe);
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(String(m.bonne));
        const libelles = m.choix.map((c) => String(c.libelle));
        expect(new Set(libelles).size).toBe(libelles.length);
        libelles.forEach((l) => expect(l.trim()).not.toBe(''));
        expect(String(m.question).trim()).not.toBe('');
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    toutes(module, classe).forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(module.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
      expect(module.PHRASES[m.aide]).toBeTruthy();
      Object.values(m.pieges).forEach((p) => expect([p, Boolean(module.PHRASES[p])]).toEqual([p, true]));
      expect(module.verdict(m, m.bonne)).toBe('juste');
      m.choix.filter((c) => String(c.cle) !== String(m.bonne)).forEach((c) => {
        const s = module.verdict(m, c.cle);
        expect(module.PHRASES[s]).toBeTruthy();
        expect(module.PHRASES[s]).not.toMatch(/raté/i);
      });
      expect(module.PHRASES[module.verdict(m, 'une-cle-inconnue')]).toBeTruthy();
    });
  });

  it('une bonne réponse n’est jamais aussi un piège, et chaque piège est un vrai choix', () => {
    toutes(module, classe).forEach((m) => {
      expect(m.pieges[m.bonne]).toBeUndefined();
      const cles = m.choix.map((c) => String(c.cle));
      Object.keys(m.pieges).forEach((k) => expect(cles).toContain(k));
    });
  });

  it('la même graine redonne la même partie, une autre graine en donne une autre', () => {
    expect(module.serie(77, classe)).toEqual(module.serie(77, classe));
    expect(module.serie(1758000104729, classe)).toEqual(module.serie(1758000104729, classe));
    expect(module.serie(77, classe)).not.toEqual(module.serie(78, classe));
  });

  it('plusieurs sortes de manches, et des banques au moins trois fois plus larges que les manches', () => {
    const parSorte = {};
    const maxParPartie = {};
    graines.forEach((g) => {
      const compte = {};
      module.serie(g, classe).forEach((m) => {
        compte[m.consigne] = (compte[m.consigne] ?? 0) + 1;
        parSorte[m.consigne] = parSorte[m.consigne] ?? new Set();
        parSorte[m.consigne].add(`${m.question}|${m.bonne}`);
      });
      Object.entries(compte).forEach(([k, n]) => { maxParPartie[k] = Math.max(maxParPartie[k] ?? 0, n); });
    });
    expect(Object.keys(parSorte).length).toBeGreaterThanOrEqual(3);
    const etroites = Object.entries(parSorte).filter(([k, vus]) => vus.size < 3 * maxParPartie[k]).map(([k]) => k);
    expect(etroites).toEqual([]);
  });
});

describe('l’exactitude, pièce par pièce', () => {
  const de = (module, classe, consigne) => toutes(module, classe).filter((m) => m.consigne === consigne);

  it('grammaire : une phrase par subordonnée entre crochets, et la bonne nature tirée de la banque', () => {
    const ecarts = [];
    grammaire.NATURES_1RE.forEach(([p]) => { if ((p.match(/\[/g) ?? []).length !== 1) ecarts.push(p); });
    grammaire.FONCTIONS_1RE.forEach(([p, bonne, autres]) => {
      if ((p.match(/\[/g) ?? []).length !== 1) ecarts.push(p);
      // Une relative : jamais « complément du nom » à côté de « complément de l'antécédent ».
      if (bonne === 'cant' && autres.some(([c]) => c === 'cdn')) ecarts.push(p);
    });
    grammaire.SENS_1TEC.forEach(([p, bonne, a, b]) => { if (new Set([bonne, a, b]).size !== 3) ecarts.push(p); });
    expect(ecarts).toEqual([]);
    const natures = new Map(grammaire.NATURES_1RE.map(([p, n]) => [p, n]));
    de(grammaire, 'PREMIERE', 'nature-sub').forEach((m) => {
      expect(m.bonne).toBe(natures.get(m.question.split('\n')[0]));
    });
  });

  it('grammaire : « que » n’apparaît qu’une fois dans sa phrase', () => {
    const ecarts = grammaire.QUE_1RE.filter(([p]) => (p.match(/\bque\b|\bqu’/gi) ?? []).length !== 1).map(([p]) => p);
    expect(ecarts).toEqual([]);
  });

  it('grammaire : directe si et seulement si la phrase finit par un point d’interrogation ; « si » pour la totale indirecte', () => {
    const ecarts = grammaire.INTERRO_TYPES.filter(([p, type]) => (type[0] === 'd') !== p.endsWith('?')
      || (type === 'it' && !/\bsi\b/.test(p))).map(([p]) => p);
    expect(ecarts).toEqual([]);
  });

  it('grammaire : la marque de l’interrogation se lit sur la phrase', () => {
    const ecarts = grammaire.MARQUES_1RE.filter(([p, marque]) => (marque === 'estceque') !== p.startsWith('Est-ce que')
      || (marque === 'intonation') !== !p.includes('-')
      || (marque === 'complexe') !== /-t?-?(il|elle)\b/.test(p)).map(([p]) => p);
    expect(ecarts).toEqual([]);
  });

  it('grammaire : la question rapportée n’a ni inversion, ni « est-ce que », ni point d’interrogation', () => {
    const ecarts = grammaire.INDIRECTES.filter(([, bonne, faux]) => /\?|est-ce|-je\b/.test(bonne)
      || faux.some(([f]) => f === bonne)).map(([d]) => d);
    expect(ecarts).toEqual([]);
  });

  it('grammaire : chaque phrase de valeur négative a son « ne », la restriction son « que »', () => {
    // « \b » ne connaît pas les lettres accentuées (« scène ») : on cherche « ne » entre deux blancs.
    const ne = /(^|\s)(ne\s|n’)/i;
    const ecarts = grammaire.NEGATIONS_TYPES.filter(([p, v]) => !ne.test(p)
      || (v === 'restriction') !== /(^|\s)n(e\s|’)[^.]*\squ(e\s|’)/.test(p)).map(([p]) => p);
    expect(ecarts).toEqual([]);
    const moyens = grammaire.NEGATIONS_MOYENS.filter(([p, v]) => (v === 'phrase') !== ne.test(p)).map(([p]) => p);
    expect(moyens).toEqual([]);
  });

  it('grammaire : le préfixe s’assimile — il devant l, ir devant r, im devant m, b, p', () => {
    const ecarts = grammaire.PREFIXES.filter(([mot, bonne]) => {
      const attendu = { l: 'il', r: 'ir', m: 'im', b: 'im', p: 'im' }[mot[0]];
      return attendu ? bonne !== `${attendu}${mot}` : !bonne.endsWith(mot);
    }).map(([mot]) => mot);
    expect(ecarts).toEqual([]);
  });

  it('grammaire : après « bien que », « pour que », « à condition que », jamais l’indicatif comme bonne réponse', () => {
    const subjonctifs = { soit: 1, lises: 1, finisses: 1, ait: 1, fasse: 1, comprenne: 1 };
    const ecarts = grammaire.MODES_1TEC.filter(([p, bonne]) => /bien qu|quoiqu|pour que|afin que|à condition que|pourvu qu/i.test(p)
      !== Boolean(subjonctifs[bonne])).map(([p]) => p);
    expect(ecarts).toEqual([]);
  });

  it('dissertation : la lettre juste désigne le bon plan', () => {
    const bons = new Map(dissertation.PLANS_SUJETS.map(([s, bon]) => [s, bon]));
    graines.forEach((g) => dissertation.serie(g).filter((m) => m.consigne === 'plan-au-sujet').forEach((m) => {
      const sujet = m.question.match(/^Sujet : « (.*) »/)[1];
      const ligne = m.question.split('\n').find((l) => l.startsWith(`${m.bonne}. `));
      expect(ligne).toBe(`${m.bonne}. ${bons.get(sujet)}`);
    }));
  });

  it('dissertation : un plan dialectique s’oppose, un plan thématique jamais', () => {
    const opposition = /\b(Mais|Pourtant|Cependant)\b/;
    const ecarts = dissertation.PLANS_TYPES.filter(([plan, type]) => (type === 'dialectique') !== opposition.test(plan)).map(([p]) => p);
    expect(ecarts).toEqual([]);
  });

  it('explication linéaire : le tournant est une phrase du texte, les leurres aussi, et chaque mouvement colle au tournant', () => {
    const ecarts = [];
    lineaire.TEXTES.forEach(({ phrases, tournant, leurres }, i) => {
      [tournant, ...leurres].forEach((k) => { if (k < 1 || k > phrases.length) ecarts.push(i); });
      if (new Set([tournant, ...leurres]).size !== 3) ecarts.push(i);
    });
    lineaire.ROLES.forEach(([i, debut, fin]) => {
      const { phrases, tournant } = lineaire.TEXTES[i];
      const premier = debut === 1 && fin === tournant - 1;
      const second = debut === tournant && fin === phrases.length;
      if (!premier && !second) ecarts.push(`role ${i} ${debut}-${fin}`);
    });
    expect(ecarts).toEqual([]);
  });

  it('explication linéaire : le texte d’un tournant ne revient jamais dans la même partie', () => {
    ['PREMIERE', 'PREMIERE_TECHNO'].forEach((classe) => graines.forEach((g) => {
      const serie = lineaire.serie(g, classe);
      const tournants = serie.filter((m) => m.consigne === 'bascule').map((m) => m.question);
      const autres = serie.filter((m) => m.consigne !== 'bascule' && m.consigne !== 'methode').map((m) => m.question.split('\n\n')[0]);
      expect(autres.filter((q) => tournants.includes(q))).toEqual([]);
    }));
  });

  it('procédés : en voie technologique, ni chiasme ni prétérition', () => {
    const vus = de(procedes, 'PREMIERE_TECHNO', 'procede').map((m) => m.bonne)
      .concat(de(procedes, 'PREMIERE_TECHNO', 'effet').map((m) => m.question));
    expect(vus.filter((v) => v === 'chiasme' || v === 'preterition' || /Chiasme/.test(v))).toEqual([]);
  });

  it('procédés : la comparaison a son outil, la métaphore n’en a pas', () => {
    const outil = /\b(comme|pareil|pareille|tel|telle|semblable)\b/i;
    const ecarts = procedes.IDENTIFIER.filter(([e, p]) => (p === 'comparaison' && !outil.test(e))
      || (p === 'metaphore' && outil.test(e))).map(([e]) => e);
    expect(ecarts).toEqual([]);
  });

  it('procédés : l’effet passe-partout n’est jamais le bon', () => {
    const ecarts = procedes.EFFETS.filter(([, , bon, contre]) => procedes.PASSE_PARTOUT.includes(bon) || bon === contre);
    expect(ecarts).toEqual([]);
  });

  it('culture : l’auteur, l’œuvre, le siècle et le genre sont ceux de la banque', () => {
    const parTitre = new Map(culture.OEUVRES.map((o) => [o[0], o]));
    const ecarts = [];
    ['PREMIERE', 'PREMIERE_TECHNO'].forEach((classe) => toutes(culture, classe).forEach((m) => {
      if (m.consigne === 'auteur') {
        const o = parTitre.get(m.question.match(/^« (.*) »/)[1]);
        if (o[1] !== m.bonne) ecarts.push(m.question);
        Object.keys(m.pieges).forEach((a) => {
          const attendu = culture.SIECLE_DE[a] === o[2] ? 'auteur-meme-siecle' : 'auteur-autre-siecle';
          if (m.pieges[a] !== attendu || a === o[1]) ecarts.push(`${m.question} ${a}`);
        });
      }
      if (m.consigne === 'oeuvre') {
        if (parTitre.get(m.bonne)[1] !== m.question) ecarts.push(m.question);
        Object.keys(m.pieges).forEach((t) => { if (parTitre.get(t)[1] === m.question) ecarts.push(t); });
      }
      if (m.consigne === 'siecle' || m.consigne === 'genre') {
        const o = parTitre.get(m.question.match(/^« (.*) », de /)[1]);
        const attendu = m.consigne === 'siecle' ? culture.SIECLES[o[2]] : o[3];
        if (m.bonne !== attendu) ecarts.push(m.question);
      }
    }));
    expect(ecarts).toEqual([]);
  });

  it('culture : chaque date sûre tombe dans le siècle annoncé', () => {
    const ecarts = culture.OEUVRES.filter(([, , s, , annee]) => annee && culture.siecleDe(annee) !== s).map(([t]) => t);
    expect(ecarts).toEqual([]);
    expect(culture.siecleDe(1857)).toBe(19);
    expect(culture.siecleDe(1800)).toBe(18);
    expect(culture.siecleDe(1801)).toBe(19);
  });

  it('culture : les mouvements proposés à côté du bon sont d’un autre siècle', () => {
    const ecarts = [];
    ['PREMIERE', 'PREMIERE_TECHNO'].forEach((classe) => de(culture, classe, 'mouvement').forEach((m) => {
      const siecle = culture.MOUVEMENTS[m.bonne][1];
      Object.keys(m.pieges).forEach((k) => { if (culture.MOUVEMENTS[k][1] === siecle) ecarts.push(`${m.question} ${k}`); });
    }));
    expect(ecarts).toEqual([]);
  });

  it('culture : chaque œuvre n’a qu’un auteur, et chaque titre n’apparaît qu’une fois', () => {
    const titres = culture.OEUVRES.map(([t]) => t);
    expect(new Set(titres).size).toBe(titres.length);
    const genres = Object.keys(culture.GENRES);
    expect(culture.OEUVRES.filter(([, , , g]) => g && !genres.includes(g))).toEqual([]);
  });
});
