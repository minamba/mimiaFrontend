/**
 * LES JEUX DE FRANÇAIS DU LYCÉE, VOIES TECHNOLOGIQUE ET PROFESSIONNELLE —
 * le lot d'Adrien : l'essai et la contraction de texte (1re techno) ; le débat
 * d'idées, l'écrit professionnel et le groupement de textes (terminale pro).
 *
 * Même épreuve qu'au collège : soixante parties par module et par classe,
 * une bonne réponse parmi des choix distincts, une méthode pour chaque erreur,
 * des banques assez larges. Puis l'exactitude, pièce par pièce : ce qui se
 * calcule est RECALCULÉ ici depuis la question affichée (la longueur d'une
 * contraction), ce qui se lit est vérifié sur les banques (une phrase
 * recopiée l'est vraiment, un avis ajouté dit « je », une bonne réponse n'est
 * jamais un piège).
 */

import * as essai from '../lib/jeux/lycee/essai';
import * as contraction from '../lib/jeux/lycee/contraction';
import * as debat from '../lib/jeux/lycee/debat-idees';
import * as ecrit from '../lib/jeux/lycee/ecrit-professionnel';
import * as groupement from '../lib/jeux/lycee/groupement-textes';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes de français de 1re techno et de terminale pro, recopiés de competences-lycee.txt avec leur classe. */
const CLASSE_DU_CODE = {
  FR_1TEC_LANG_CIRCONSTANCIELLES: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_INTERROGATION: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_NEGATION: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_LEXIQUE: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_ACQUIS_SECONDE: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_RELATIONS_LOGIQUES: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_REFORMULER: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_OEUVRES: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_POESIE: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_IDEES: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_ROMAN: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_THEATRE: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_CONTEXTE: 'PREMIERE_TECHNO',
  FR_1TEC_LECT_CURSIVE: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_APPROPRIATION: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_COMMENTAIRE: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_CONTRACTION: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_COMPTER_MOTS: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_ESSAI: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_ETAYER_ESSAI: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_LANGUE: 'PREMIERE_TECHNO',
  FR_1TEC_ORAL_LECTURE: 'PREMIERE_TECHNO',
  FR_1TEC_METH_LINEAIRE: 'PREMIERE_TECHNO',
  FR_1TEC_METH_GRAMMAIRE: 'PREMIERE_TECHNO',
  FR_1TEC_ORAL_OEUVRE_CHOISIE: 'PREMIERE_TECHNO',
  FR_TPRO_LECT_OEUVRE: 'TERMINALE_PRO',
  FR_TPRO_LECT_GROUPEMENT: 'TERMINALE_PRO',
  FR_TPRO_LECT_FORMES: 'TERMINALE_PRO',
  FR_TPRO_LECT_METIER: 'TERMINALE_PRO',
  FR_TPRO_ECR_REFLEXIF: 'TERMINALE_PRO',
  FR_TPRO_ECR_HIERARCHISER: 'TERMINALE_PRO',
  FR_TPRO_ECR_NUANCER: 'TERMINALE_PRO',
  FR_TPRO_ECR_COMPTE_RENDU: 'TERMINALE_PRO',
  FR_TPRO_ECR_PROFESSIONNEL: 'TERMINALE_PRO',
  FR_TPRO_ORAL_DEBAT: 'TERMINALE_PRO',
  FR_TPRO_ORAL_REAGIR: 'TERMINALE_PRO',
  FR_TPRO_ORAL_PRESENTER: 'TERMINALE_PRO',
  FR_TPRO_METH_CONVAINCRE: 'TERMINALE_PRO',
  FR_TPRO_METH_POINTS_VUE: 'TERMINALE_PRO',
};

/** [clé de la famille, module, classes attendues]. */
const JEUX = [
  ['essai', essai, ['PREMIERE_TECHNO']],
  ['contraction', contraction, ['PREMIERE_TECHNO']],
  ['debat-idees', debat, ['TERMINALE_PRO']],
  ['ecrit-professionnel', ecrit, ['TERMINALE_PRO']],
  ['groupement-textes', groupement, ['TERMINALE_PRO']],
];

/** Chaque (module, classe) couvert. */
const PARTIES = JEUX.flatMap(([cle, module]) => module.CLASSES.map((classe) => [`${cle} (${classe})`, module, classe]));

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));

describe.each(JEUX)('%s', (cle, module, classes) => {
  it('se présente : famille, matière, ses classes, ses compétences officielles de la bonne classe', () => {
    expect(module.FAMILLE).toEqual({ cle, titre: expect.any(String), matiereCode: 'FRANCAIS' });
    expect(module.FAMILLE.titre.trim()).not.toBe('');
    expect(module.CLASSES).toEqual(classes);
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    expect(module.MANCHES).toBe(8);
    expect(module.ESCAPE).toBeUndefined();
    const ecarts = [];
    module.CLASSES.forEach((c) => {
      const p = module.PAR_CLASSE[c];
      if (!p.titre || !p.titre.trim()) ecarts.push(`${c} : pas de titre`);
      if (!p.accroche || !p.accroche.trim() || p.accroche.length > 45) ecarts.push(`${c} : accroche « ${p.accroche} »`);
      if (!p.competences || p.competences.length === 0) ecarts.push(`${c} : aucune compétence`);
      (p.competences ?? []).forEach((code) => {
        if (CLASSE_DU_CODE[code] !== c) ecarts.push(`${c} : ${code} (classe ${CLASSE_DU_CODE[code]})`);
      });
    });
    expect(ecarts).toEqual([]);
  });

  it('ses phrases sont fixes : clés en kebab-case, aucun chiffre, jamais « raté » ni « faux », typographie française', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof texte).toBe('string');
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
      // Une espace avant « ? ! : ; ».
      expect(texte).not.toMatch(/\S[?!:;]/);
    });
  });

  it('le mot de la fin est le commun', () => {
    expect(module.bilan(module.MANCHES)).toBe('Sans une seule erreur. Bravo !');
    expect(module.bilan(0)).toBe('Tu y arrives. On recommence ?');
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
        m.choix.forEach((c) => {
          expect(String(c.libelle).trim()).not.toBe('');
          expect(String(c.libelle)).not.toMatch(/\b(null|undefined|NaN|Infinity)\b/);
        });
        expect(String(m.question).trim()).not.toBe('');
        expect(m.question).not.toMatch(/\b(null|undefined|NaN|Infinity)\b/);
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    toutes(module, classe).forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(module.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
      expect(m.aide === undefined || Boolean(module.PHRASES[m.aide])).toBe(true);
      Object.values(m.pieges ?? {}).forEach((p) => expect(module.PHRASES[p]).toBeTruthy());
      expect(module.verdict(m, m.bonne)).toBe('juste');
      m.choix.filter((c) => String(c.cle) !== String(m.bonne)).forEach((c) => {
        const s = module.verdict(m, c.cle);
        expect(module.PHRASES[s]).toBeTruthy();
        expect(module.PHRASES[s]).not.toMatch(/raté/i);
      });
      // Une clé que la partie ne propose pas tombe sur la règle de la consigne.
      expect(module.verdict(m, '§')).toBe(`${m.consigne}-regle`);
    });
  });

  it('une bonne réponse n’est jamais aussi un piège, et chaque piège est un vrai choix', () => {
    const ecarts = [];
    toutes(module, classe).forEach((m) => {
      const pieges = m.pieges ?? {};
      if (pieges[m.bonne] !== undefined) ecarts.push(`${m.consigne} : la bonne réponse « ${m.bonne} » est un piège`);
      const cles = m.choix.map((c) => String(c.cle));
      Object.keys(pieges).forEach((k) => { if (!cles.includes(k)) ecarts.push(`${m.consigne} : piège « ${k} » hors des choix`); });
      const libelles = m.choix.map((c) => String(c.libelle));
      if (new Set(libelles).size !== libelles.length) ecarts.push(`${m.consigne} : deux libellés identiques`);
    });
    expect(ecarts).toEqual([]);
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
    const etroites = Object.entries(parSorte)
      .filter(([k, vus]) => vus.size < 3 * maxParPartie[k])
      .map(([k, vus]) => `${k} : ${vus.size} pour ${maxParPartie[k]} par partie`);
    expect(etroites).toEqual([]);
  });

  it('une partie ne pose jamais deux fois la même question', () => {
    const ecarts = [];
    graines.forEach((g) => {
      const vues = module.serie(g, classe).map((m) => `${m.consigne}|${m.question}`);
      if (new Set(vues).size !== vues.length) ecarts.push(g);
    });
    expect(ecarts).toEqual([]);
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude, pièce par pièce.                                            */

const PREMIERE_PERSONNE = /(^|[^\p{L}])((je|moi|mon|ma|personnellement)(?=[^\p{L}]|$)|j’)/iu;

describe('l’essai : chaque rôle, chaque connecteur, chaque question', () => {
  const manches = toutes(essai, 'PREMIERE_TECHNO');

  it('le rôle attendu est celui de la phrase désignée dans le petit essai', () => {
    const ecarts = [];
    manches.filter((m) => m.consigne === 'role').forEach((m) => {
      const designee = m.question.match(/→ « (.*) »$/)[1];
      const texte = essai.ESSAIS.find((t) => m.question.startsWith(t.join(' ')));
      const i = texte.indexOf(designee);
      if (i < 0 || essai.ORDRE[i] !== m.bonne) ecarts.push(designee);
    });
    expect(ecarts).toEqual([]);
  });

  it('chaque petit essai a ses cinq rôles, et ses marques : la concession, puis la réfutation', () => {
    essai.ESSAIS.forEach((t) => {
      expect(t).toHaveLength(5);
      expect(t[3]).toMatch(/^(Certes|On objectera|On dira)/);
      expect(t[4]).toMatch(/^(Mais|Pourtant)/);
    });
    expect(essai.ORDRE).toEqual(['these', 'argument', 'exemple', 'contre', 'refutation']);
  });

  it('le bon connecteur est unique, et chaque connecteur écarté nomme sa relation', () => {
    const relations = ['lien-cause', 'lien-consequence', 'lien-opposition', 'lien-concession', 'lien-but', 'lien-condition'];
    essai.CONNECTEURS.forEach(([phrase, bon, faux]) => {
      expect(phrase).toContain('…');
      faux.forEach(([f, r]) => {
        expect(f.toLowerCase()).not.toBe(bon.toLowerCase());
        expect(relations).toContain(r);
      });
    });
  });

  it('la question posée se discute ; les pièges sont un fait, une question trop vaste, une question à côté', () => {
    essai.QUESTIONS.forEach((q) => {
      expect(new Set(q).size).toBe(5);
      q.slice(1).forEach((x) => expect(x).toMatch(/ \?$/));
    });
    manches.filter((m) => m.consigne === 'question').forEach((m) => {
      const q = essai.QUESTIONS.find(([texte]) => texte === m.question);
      expect(m.bonne).toBe(q[1]);
    });
  });
});

describe('la contraction : la phrase fidèle, le mouvement, la longueur recalculée', () => {
  const manches = toutes(contraction, 'PREMIERE_TECHNO');
  const texteDe = (m) => contraction.TEXTES.find((t) => t.texte === m.question);

  it('aucun texte ne dit « je » ; la phrase recopiée l’est mot pour mot ; la bonne ne recopie pas', () => {
    contraction.TEXTES.forEach((t) => {
      expect(t.texte).not.toMatch(PREMIERE_PERSONNE);
      expect(t.texte).toContain(t.recopie);
      expect(t.texte).not.toContain(t.bonne);
      expect(t.bonne.split(' ').length).toBeLessThan(t.texte.split(' ').length / 2);
    });
  });

  it('seul l’avis ajouté dit « je » ; seule l’énonciation changée parle de l’auteur', () => {
    contraction.TEXTES.forEach((t) => {
      expect(t.opinion).toMatch(PREMIERE_PERSONNE);
      [t.bonne, t.recopie, t.trahison, t.enonciation].forEach((p) => expect(p).not.toMatch(PREMIERE_PERSONNE));
      expect(t.enonciation).toMatch(/auteur/i);
      [t.bonne, t.recopie, t.trahison, t.opinion].forEach((p) => expect(p).not.toMatch(/auteur/i));
    });
  });

  it('la contraction fidèle proposée est toujours la bonne du texte affiché', () => {
    const ecarts = [];
    manches.filter((m) => m.consigne === 'fidele').forEach((m) => {
      const t = texteDe(m);
      if (!t || m.bonne !== t.bonne) ecarts.push(m.question.slice(0, 40));
      Object.entries(m.pieges).forEach(([choix, phrase]) => {
        const defaut = Object.keys(contraction.DEFAUTS).find((d) => t[d] === choix);
        if (contraction.DEFAUTS[defaut] !== phrase) ecarts.push(choix);
      });
    });
    expect(ecarts).toEqual([]);
  });

  it('le mouvement : le bon plan suit le texte ; l’étape absente n’y est pas ; l’ordre inversé diffère', () => {
    contraction.TEXTES.forEach((t) => {
      expect(new Set(t.mouvement).size).toBe(t.mouvement.length);
      expect(t.mouvement).not.toContain(t.absente);
    });
    const ecarts = [];
    manches.filter((m) => m.consigne === 'mouvement').forEach((m) => {
      const t = texteDe(m);
      if (m.bonne !== t.mouvement.join(' → ')) ecarts.push(m.bonne);
      Object.keys(m.pieges).forEach((p) => { if (p === m.bonne) ecarts.push(p); });
    });
    expect(ecarts).toEqual([]);
  });

  it('la fourchette : le quart, plus ou moins un dixième du quart, recalculé depuis la question', () => {
    const ecarts = [];
    manches.filter((m) => m.consigne === 'fourchette').forEach((m) => {
      const n = Number(m.question.match(/compte (\d+) mots/)[1]);
      const quart = n / 4;
      // Le quart et son dixième sont entiers : on les écrit tels quels.
      const attendu = `De ${quart - quart / 10} à ${quart + quart / 10} mots`;
      if (m.bonne !== attendu || /[.,]/.test(m.bonne)) ecarts.push(`${m.bonne} au lieu de ${attendu}`);
      const [min, max] = m.bonne.match(/\d+/g).map(Number);
      Object.keys(m.pieges).forEach((p) => {
        const [a, b] = p.match(/\d+/g).map(Number);
        if (a === min && b === max) ecarts.push(p);
      });
    });
    expect(ecarts).toEqual([]);
  });

  it('la bonne longueur : recalculée, et jamais à moins de trois mots d’une borne', () => {
    const ecarts = [];
    manches.filter((m) => m.consigne === 'longueur').forEach((m) => {
      const [n, mots] = m.question.match(/\d+/g).map(Number);
      const quart = n / 4;
      const min = quart - quart / 10;
      const max = quart + quart / 10;
      let attendu = 'dans';
      if (mots > max) attendu = 'longue';
      if (mots < min) attendu = 'courte';
      if (m.bonne !== attendu) ecarts.push(m.question);
      if (Math.min(Math.abs(mots - min), Math.abs(mots - max)) < 3) ecarts.push(`trop près d’une borne : ${m.question}`);
    });
    expect(ecarts).toEqual([]);
  });
});

describe('le débat d’idées : chaque procédé, chaque argument', () => {
  const manches = toutes(debat, 'TERMINALE_PRO');

  it('l’argument fallacieux : le procédé attendu est celui de la banque, deux exemples au moins par procédé', () => {
    Object.keys(debat.SOPHISMES).forEach((s) => {
      expect(debat.FALLACIEUX.filter(([, p]) => p === s).length).toBeGreaterThanOrEqual(2);
    });
    const ecarts = [];
    manches.filter((m) => m.consigne === 'fallacieux').forEach((m) => {
      const [, procede] = debat.FALLACIEUX.find(([p]) => `« ${p} »` === m.question);
      if (m.bonne !== procede) ecarts.push(m.question);
    });
    expect(ecarts).toEqual([]);
  });

  it('un argument donne sa raison ; une simple opinion n’en donne aucune', () => {
    debat.ARGUMENTS.forEach((p) => expect(p).toMatch(/\b(car|puisqu|parce qu)|: /));
    debat.OPINIONS.forEach((p) => expect(p).not.toMatch(/\b(car|puisqu|parce qu)/));
    const ecarts = [];
    manches.filter((m) => m.consigne === 'argument-ou-opinion').forEach((m) => {
      const phrase = m.question.slice(2, -2);
      const attendu = debat.ARGUMENTS.includes(phrase) ? 'argument' : 'opinion';
      if (!debat.ARGUMENTS.includes(phrase) && !debat.OPINIONS.includes(phrase)) ecarts.push(phrase);
      if (m.bonne !== attendu) ecarts.push(phrase);
    });
    expect(ecarts).toEqual([]);
  });

  it('la nuance garde la position ; la généralisation, elle, dit « toujours », « tous » ou « jamais »', () => {
    debat.NUANCES.forEach(([, nuance, absolu]) => {
      expect(nuance).not.toMatch(/\b(toujours|tous|jamais|aucun|toute)\b/i);
      expect(absolu).toMatch(/\b(toujours|tous|jamais|aucun|aucune|toute|seul|sans aucune)\b/i);
    });
  });

  it('la réfutation polie n’attaque personne : elle ne dit jamais « tu dis ça parce que »', () => {
    debat.REFUTATIONS.forEach(([, bonne, attaque]) => {
      expect(bonne).not.toMatch(/!/);
      expect(bonne).not.toMatch(/tu dis ça|tu n’as jamais|toi, tu/i);
      expect(attaque).toMatch(/\btu\b|\btoi\b|\btes\b/i);
    });
  });
});

describe('l’écrit professionnel : vouvoiement, reprise de la formule d’appel', () => {
  const manches = toutes(ecrit, 'TERMINALE_PRO');

  it('la formule de politesse reprend exactement la formule d’appel citée ; le piège de reprise, non', () => {
    const ecarts = [];
    ecrit.POLITESSES.forEach(([question, bonne, faux]) => {
      const appel = question.match(/« (.+), »/);
      if (!appel) return;
      const reprise = `, ${appel[1]}, l’expression`;
      if (!bonne.includes(reprise)) ecarts.push(bonne);
      faux.filter(([, k]) => k === 'politesse-reprise').forEach(([f]) => { if (f.includes(reprise)) ecarts.push(f); });
    });
    expect(ecarts).toEqual([]);
  });

  it('les bonnes réponses ne tutoient jamais ; les phrases au bon registre vouvoient', () => {
    const tutoie = /(^|[^\p{L}])((tu|toi|te|ton|ta|tes)(?=[^\p{L}]|$)|t’)/iu;
    ecrit.REGISTRES.forEach(([, bonne, familier, abrege]) => {
      expect(bonne).toMatch(/\b(vous|votre)\b/i);
      expect(bonne).not.toMatch(tutoie);
      [familier, abrege].forEach((p) => expect(p).not.toMatch(/\b(vous|votre)\b/i));
    });
    [...ecrit.APPELS, ...ecrit.POLITESSES, ...ecrit.OBJETS].forEach(([, bonne]) => {
      expect(bonne).not.toMatch(tutoie);
      expect(bonne).not.toMatch(/\b(salut|coucou|bisous|ciao|bye)\b/i);
    });
  });

  it('à un destinataire inconnu, toujours « Madame, Monsieur, »', () => {
    ecrit.APPELS.filter(([s]) => /ne connais pas|ignores qui|adresse de contact|spontanée/.test(s))
      .forEach(([, bonne]) => expect(bonne).toBe('Madame, Monsieur,'));
    ecrit.APPELS.filter(([s]) => /Mme /.test(s)).forEach(([, bonne]) => expect(bonne).toMatch(/Madame/));
    ecrit.APPELS.filter(([s]) => /M\. /.test(s)).forEach(([, bonne]) => expect(bonne).toMatch(/Monsieur/));
  });

  it('ce qu’on n’écrit pas : la bonne réponse n’est jamais un élément attendu', () => {
    const attendus = new Set(ecrit.A_EVITER.flatMap(([, a]) => a));
    ecrit.A_EVITER.forEach(([mauvais]) => expect(attendus.has(mauvais)).toBe(false));
    manches.filter((m) => m.consigne === 'a-eviter').forEach((m) => {
      Object.values(m.pieges).forEach((p) => expect(p).toBe('a-eviter-attendu'));
    });
  });
});

describe('le groupement de textes : regards et rapprochements recalculés', () => {
  const manches = toutes(groupement, 'TERMINALE_PRO');
  const documents = groupement.GROUPEMENTS.flatMap((g) => g.documents);
  const regardDe = (ligne) => {
    const texte = ligne.replace(/^Document [ABC] — /, '');
    return documents.find(([d]) => d === texte)[1];
  };

  it('chaque groupement : trois documents, des thèmes distincts, un document qui informe le dit', () => {
    groupement.GROUPEMENTS.forEach((g) => {
      expect(g.documents).toHaveLength(3);
      expect(new Set([g.theme, g.etroit, g.vaste]).size).toBe(3);
      g.documents.forEach(([texte, regard]) => {
        expect(Object.keys(groupement.REGARDS)).toContain(regard);
        expect(/sans (prendre parti|prendre position|commentaire|les commenter|donner d’avis)/.test(texte)).toBe(regard === 'neutre');
      });
      expect(g.documents.filter(([, r]) => r === 'neutre').length).toBeLessThanOrEqual(1);
    });
    expect(new Set(documents.map(([d]) => d)).size).toBe(documents.length);
  });

  it('le regard attendu est celui du document affiché', () => {
    const ecarts = [];
    manches.filter((m) => m.consigne === 'regard').forEach((m) => {
      if (regardDe(m.question.split('\n')[0]) !== m.bonne) ecarts.push(m.question);
    });
    expect(ecarts).toEqual([]);
  });

  it('le rapprochement est recalculé depuis les deux regards', () => {
    const ecarts = [];
    manches.filter((m) => m.consigne === 'rapprocher').forEach((m) => {
      const [a, b] = m.question.split('\n').slice(0, 2).map(regardDe);
      let attendu = a === b ? 'accord' : 'opposition';
      if (a === 'neutre' || b === 'neutre') attendu = 'informe';
      if (m.bonne !== attendu) ecarts.push(m.question);
    });
    expect(ecarts).toEqual([]);
    // Les trois relations existent dans la banque.
    const vues = new Set(manches.filter((m) => m.consigne === 'rapprocher').map((m) => m.bonne));
    expect([...vues].sort()).toEqual(['accord', 'informe', 'opposition']);
  });

  it('le thème attendu est celui du groupement affiché', () => {
    manches.filter((m) => m.consigne === 'theme').forEach((m) => {
      const g = groupement.GROUPEMENTS.find((x) => m.question.includes(x.documents[0][0]));
      expect(m.bonne).toBe(g.theme);
    });
  });
});
