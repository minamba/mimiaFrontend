/**
 * LES JEUX DE FRANÇAIS DE SECONDE — le lot d'Adrien : figures de style,
 * versification, mouvements littéraires, genres et registres, la phrase et
 * ses effets, argumenter, le vocabulaire de l'analyse.
 * Même épreuve que le collège : soixante parties par module et par classe,
 * une bonne réponse parmi des choix distincts, une méthode pour chaque
 * erreur ; puis l'exactitude, vérifiée sur pièces (le compte des syllabes,
 * le siècle recalculé depuis l'année, la richesse des rimes recomptée…).
 */

import * as figures from '../lib/jeux/lycee/figures-de-style-lycee';
import * as versification from '../lib/jeux/lycee/versification';
import * as mouvements from '../lib/jeux/lycee/mouvements-litteraires';
import * as registres from '../lib/jeux/lycee/genres-et-registres';
import * as phrase from '../lib/jeux/lycee/phrase-et-effets';
import * as argumenter from '../lib/jeux/lycee/argumenter';
import * as vocabulaire from '../lib/jeux/lycee/vocabulaire-analyse';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes de français de seconde, recopiés de competences-lycee.txt : code → classe (colonne NIVEAU). */
const COMPETENCES = {
  FR_2DE_LECT_ROMAN: 'SECONDE',
  FR_2DE_LECT_THEATRE: 'SECONDE',
  FR_2DE_LECT_POESIE: 'SECONDE',
  FR_2DE_LECT_ARGUMENTATION: 'SECONDE',
  FR_2DE_LECT_MOUVEMENT: 'SECONDE',
  FR_2DE_LECT_PROCEDES: 'SECONDE',
  FR_2DE_METH_LINEAIRE: 'SECONDE',
  FR_2DE_METH_PROBLEMATIQUE: 'SECONDE',
  FR_2DE_METH_PLAN: 'SECONDE',
  FR_2DE_METH_CITATION: 'SECONDE',
  FR_2DE_ECR_COMMENTAIRE: 'SECONDE',
  FR_2DE_ECR_DISSERTATION: 'SECONDE',
  FR_2DE_ECR_INTRODUCTION: 'SECONDE',
  FR_2DE_ECR_TRANSITION: 'SECONDE',
  FR_2DE_LANG_SYNTAXE: 'SECONDE',
  FR_2DE_LANG_INTERROGATION: 'SECONDE',
  FR_2DE_LANG_NEGATION: 'SECONDE',
  FR_2DE_LANG_LEXIQUE: 'SECONDE',
  FR_2DE_ORAL_LECTURE: 'SECONDE',
  FR_2DE_LECT_POESIE_ANCIENNE: 'SECONDE',
  FR_2DE_LECT_PRESSE: 'SECONDE',
};

/** [clé de la famille, module]. */
const JEUX = [
  ['figures-de-style-lycee', figures],
  ['versification', versification],
  ['mouvements-litteraires', mouvements],
  ['genres-et-registres', registres],
  ['phrase-et-effets', phrase],
  ['argumenter', argumenter],
  ['vocabulaire-analyse', vocabulaire],
];

/** Chaque (module, classe) couvert. */
const PARTIES = JEUX.flatMap(([cle, module]) => module.CLASSES.map((classe) => [`${cle} (${classe})`, module, classe]));

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));

describe.each(JEUX)('%s', (cle, module) => {
  it('se présente : famille, matière, la seconde, ses compétences officielles', () => {
    expect(module.FAMILLE).toEqual({ cle, titre: expect.any(String), matiereCode: 'FRANCAIS' });
    expect(module.FAMILLE.titre.trim()).not.toBe('');
    expect(module.CLASSES).toEqual(['SECONDE']);
    expect(module.MANCHES).toBe(8);
    expect(module.ESCAPE).toBeUndefined();
    module.CLASSES.forEach((c) => {
      const p = module.PAR_CLASSE[c];
      expect(p.titre.trim()).not.toBe('');
      expect(p.accroche.trim()).not.toBe('');
      expect(p.accroche.length).toBeLessThanOrEqual(45);
      expect(p.competences.length).toBeGreaterThan(0);
      p.competences.forEach((code) => expect(COMPETENCES[code]).toBe(c));
    });
  });

  it('ses phrases sont fixes : clés en kebab-case, aucun chiffre, jamais « raté » ni « faux »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof texte).toBe('string');
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
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
      expect(m.aide).toBeTruthy();
      expect(module.PHRASES[m.aide]).toBeTruthy();
      Object.values(m.pieges).forEach((p) => expect(module.PHRASES[p]).toBeTruthy());
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
    const ecarts = Object.entries(parSorte).filter(([k, vus]) => vus.size < 3 * maxParPartie[k]).map(([k]) => k);
    expect(ecarts).toEqual([]);
  });

  it('dans une partie, la même question ne revient pas deux fois', () => {
    graines.forEach((g) => {
      const questions = module.serie(g, classe).map((m) => m.question);
      expect(new Set(questions).size).toBe(questions.length);
    });
  });
});

describe('l’exactitude, pièce par pièce', () => {
  const sansGuillemets = (q) => q.match(/« ([\s\S]*?) »/)[1];

  it('les figures : chaque figure a sa définition, ses deux voisines, et au moins trois exemples', () => {
    const noms = Object.keys(figures.FIGURES);
    expect(Object.keys(figures.DEFINITIONS).sort()).toEqual([...noms].sort());
    expect(Object.keys(figures.CONFUSIONS).sort()).toEqual([...noms].sort());
    const ecarts = [];
    noms.forEach((f) => {
      const voisines = figures.CONFUSIONS[f];
      if (voisines.length !== 2 || voisines.includes(f) || voisines.some((v) => !noms.includes(v))) ecarts.push(f);
      if (figures.EXEMPLES.filter(([, , x]) => x === f).length < 3) ecarts.push(`${f} : moins de trois exemples`);
    });
    expect(ecarts).toEqual([]);
    const phrases = figures.EXEMPLES.map(([p]) => p);
    expect(new Set(phrases).size).toBe(phrases.length);
  });

  it('les figures : une comparaison a son outil, une métaphore n’en a pas, une litote a sa négation', () => {
    const outil = /\b(comme|tel|telle|tels|pareil|pareille|semblable|ressembl)/i;
    const ecarts = [];
    figures.EXEMPLES.forEach(([p, , f]) => {
      if (f === 'comparaison' && !outil.test(p)) ecarts.push(p);
      if (['metaphore', 'personnification', 'allegorie', 'metonymie'].includes(f) && outil.test(p)) ecarts.push(p);
      if (f === 'litote' && !/\bn[e’]|\bne\b/.test(p)) ecarts.push(p);
      if (f === 'euphemisme' && /\bne\b|\bn’/.test(p)) ecarts.push(p);
    });
    expect(ecarts).toEqual([]);
  });

  it('les figures : l’effet porte sur une phrase de la banque, de la même figure, jamais montrée deux fois', () => {
    const ecarts = [];
    figures.EFFETS.forEach(([p, source, f, bonne, faux]) => {
      const e = figures.EXEMPLES.find(([x]) => x === p);
      if (!e || e[1] !== source || e[2] !== f) ecarts.push(p);
      if (faux.includes(bonne) || new Set(faux).size !== 2) ecarts.push(p);
    });
    graines.forEach((g) => {
      const serie = figures.serie(g);
      const effets = serie.filter((m) => m.consigne === 'effet').map((m) => sansGuillemets(m.question));
      serie.filter((m) => m.consigne === 'figure').forEach((m) => {
        if (effets.includes(sansGuillemets(m.question))) ecarts.push(`${g} : ${m.question}`);
      });
    });
    expect(ecarts).toEqual([]);
    toutes(figures, 'SECONDE').filter((m) => m.consigne === 'figure').forEach((m) => {
      const e = figures.EXEMPLES.find(([p]) => p === sansGuillemets(m.question));
      expect(m.bonne).toBe(e[2]);
    });
    toutes(figures, 'SECONDE').filter((m) => m.consigne === 'definition').forEach((m) => {
      expect(figures.DEFINITIONS[m.bonne]).toBe(m.question);
    });
  });

  it('la versification : le bon compte est celui du vers, le mètre suit le compte, jamais le même vers deux fois', () => {
    const parVers = new Map(versification.VERS.map(([v, , n]) => [v, n]));
    const compte = (m) => parVers.get(sansGuillemets(m.question));
    const ecarts = [];
    versification.VERS.forEach(([v, , n, faux]) => {
      if (faux.length !== 2 || faux.some(([f]) => f === n) || faux[0][0] === faux[1][0]) ecarts.push(v);
    });
    graines.forEach((g) => {
      const serie = versification.serie(g);
      const vers = serie.filter((m) => ['compter', 'metre'].includes(m.consigne)).map((m) => m.question);
      if (new Set(vers).size !== vers.length) ecarts.push(`graine ${g}`);
      serie.filter((m) => m.consigne === 'compter').forEach((m) => { if (Number(m.bonne) !== compte(m)) ecarts.push(m.question); });
      serie.filter((m) => m.consigne === 'metre').forEach((m) => { if (m.bonne !== versification.METRES[compte(m)]) ecarts.push(m.question); });
    });
    expect(ecarts).toEqual([]);
  });

  it('la versification : un quatrain a quatre vers, chaque disposition au moins trois quatrains', () => {
    versification.QUATRAINS.forEach(([q, , d]) => {
      expect(q.split('\n')).toHaveLength(4);
      expect(Object.keys(versification.DISPOSITIONS)).toContain(d);
    });
    Object.keys(versification.DISPOSITIONS).forEach((d) => {
      expect(versification.QUATRAINS.filter(([, , x]) => x === d).length).toBeGreaterThanOrEqual(3);
    });
  });

  it('la versification : la richesse se recompte depuis les sons communs', () => {
    expect(versification.richesse(['i'])).toBe('pauvre');
    expect(versification.richesse(['t', 'é'])).toBe('suffisante');
    expect(versification.richesse(['v', 'a', 'l'])).toBe('riche');
    toutes(versification, 'SECONDE').filter((m) => m.consigne === 'richesse').forEach((m) => {
      const [, a, b] = m.question.match(/« (.*) » \/ « (.*) »/);
      const r = versification.RIMES.find(([x, y]) => x === a && y === b);
      expect(m.bonne).toBe(versification.richesse(r[2]));
    });
    Object.keys(versification.RICHESSES).forEach((r) => {
      expect(versification.RIMES.filter(([, , s]) => versification.richesse(s) === r).length).toBeGreaterThanOrEqual(3);
    });
  });

  it('la versification : un rejet ouvre le vers suivant, un contre-rejet ferme le premier vers', () => {
    const ecarts = [];
    versification.DEBORDEMENTS.forEach(([deuxVers, , groupe, sorte]) => {
      const [premier, second] = deuxVers.split('\n');
      if (sorte === 'rejet' && !second.startsWith(groupe)) ecarts.push(groupe);
      if (sorte === 'contre-rejet' && !premier.endsWith(groupe)) ecarts.push(groupe);
    });
    expect(ecarts).toEqual([]);
  });

  it('les mouvements : le siècle est recalculé depuis l’année, un auteur n’a qu’un mouvement', () => {
    expect(mouvements.siecleDe(1677)).toBe(17);
    expect(mouvements.siecleDe(1700)).toBe(17);
    expect(mouvements.siecleDe(1701)).toBe(18);
    expect(mouvements.siecleDe(1942)).toBe(20);
    const parQuestion = new Map(mouvements.DATES);
    toutes(mouvements, 'SECONDE').filter((m) => m.consigne === 'siecle').forEach((m) => {
      expect(m.bonne).toBe(mouvements.siecleEcrit(mouvements.siecleDe(parQuestion.get(m.question))));
      m.choix.forEach((c) => expect(c.libelle).toMatch(/^X[VIX]*e siècle$/));
    });
    const noms = mouvements.AUTEURS.map(([n]) => n);
    expect(new Set(noms).size).toBe(noms.length);
    Object.keys(mouvements.MOUVEMENTS).forEach((mvt) => {
      expect(mouvements.AUTEURS.filter(([, x]) => x === mvt).length).toBeGreaterThanOrEqual(2);
      expect(mouvements.CONFUSIONS[mvt]).not.toContain(mvt);
    });
    const parAuteur = new Map(mouvements.AUTEURS);
    toutes(mouvements, 'SECONDE').filter((m) => m.consigne === 'auteur').forEach((m) => {
      const nom = m.question.match(/rattache-t-on (.*) \?$/)[1];
      expect(m.bonne).toBe(parAuteur.get(nom));
    });
  });

  it('genres et registres : chaque registre a au moins trois extraits, un indice et une visée', () => {
    Object.keys(registres.REGISTRES).forEach((r) => {
      expect(registres.EXTRAITS.filter(([, x]) => x === r).length).toBeGreaterThanOrEqual(3);
      expect(registres.INDICES[r]).toBeTruthy();
      expect(registres.VISEES[r]).toBeTruthy();
      expect(registres.CONFUSIONS[r]).not.toContain(r);
    });
    toutes(registres, 'SECONDE').filter((m) => m.consigne === 'indice').forEach((m) => {
      m.choix.forEach((c) => expect(c.libelle).toBe(registres.INDICES[c.cle]));
      expect(m.question).toContain(registres.REGISTRES[m.bonne][1]);
    });
    toutes(registres, 'SECONDE').filter((m) => m.consigne === 'visee').forEach((m) => {
      m.choix.forEach((c) => expect(c.libelle).toBe(registres.VISEES[c.cle]));
      expect(m.question).toContain(registres.REGISTRES[m.bonne][1]);
    });
  });

  it('la phrase et ses effets : chaque exemple a la forme de son procédé', () => {
    const membres = (p) => p.replace(/[.!?]$/, '').split(', ').length;
    const ecarts = [];
    phrase.EXEMPLES.forEach(([p, procede]) => {
      if (procede === 'asyndete' && (membres(p) === 3 || /\b(et|mais|car|donc|or)\b/.test(p))) ecarts.push(p);
      if (procede === 'rythme-ternaire' && !/ et /.test(p)) ecarts.push(p);
      if (procede === 'mise-en-relief' && !/c’est/i.test(p)) ecarts.push(p);
      if (procede === 'interrogation-rhetorique' && (!p.endsWith('?') || /c’est|est-ce/i.test(p))) ecarts.push(p);
      if (procede !== 'interrogation-rhetorique' && p.endsWith('?')) ecarts.push(p);
    });
    const exemples = phrase.EXEMPLES.map(([p]) => p);
    phrase.EFFETS.forEach(([p, procede]) => {
      if (exemples.includes(p) || !phrase.PROCEDES[procede]) ecarts.push(p);
    });
    phrase.INTERROGATIONS.forEach(([p, forme]) => {
      if ((forme === 'indirecte') === p.endsWith('?')) ecarts.push(p);
    });
    expect(ecarts).toEqual([]);
  });

  it('argumenter : le connecteur est dans la phrase, et aucun connecteur écarté n’exprime le bon lien', () => {
    const ecarts = [];
    argumenter.LIENS.forEach(([p, connecteur, relation]) => {
      connecteur.split('…').map((x) => x.trim()).forEach((x) => { if (!p.includes(x)) ecarts.push(p); });
      if (!argumenter.RELATIONS[relation]) ecarts.push(p);
    });
    argumenter.TROUS.forEach(([p, [, lien], faux]) => {
      if (!p.includes('…')) ecarts.push(p);
      faux.forEach(([, r]) => { if (r === lien) ecarts.push(p); });
    });
    expect(ecarts).toEqual([]);
    toutes(argumenter, 'SECONDE').filter((m) => m.consigne === 'relation').forEach((m) => {
      const visee = m.question.match(/^« (.*) »\n→ (.*)$/);
      const lien = argumenter.LIENS.find(([p, c]) => p === visee[1] && c === visee[2]);
      expect(m.bonne).toBe(lien[2]);
    });
  });

  it('le vocabulaire : « sans doute » n’est jamais une certitude, la focalisation propose ses trois choix', () => {
    const ecarts = vocabulaire.MODALISATIONS.filter(([p, m]) => (
      (/sans aucun doute/.test(p) && m !== 'certitude') || (/sans doute/i.test(p) && !/sans aucun doute/.test(p) && m !== 'doute')
    ));
    expect(ecarts).toEqual([]);
    toutes(vocabulaire, 'SECONDE').filter((m) => m.consigne === 'focalisation').forEach((m) => {
      expect(m.choix.map((c) => c.cle).sort()).toEqual(['externe', 'interne', 'zero']);
    });
    Object.keys(vocabulaire.FOCALISATIONS).forEach((f) => {
      expect(vocabulaire.RECITS.filter(([, x]) => x === f).length).toBeGreaterThanOrEqual(3);
    });
  });
});
