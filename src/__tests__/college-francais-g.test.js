/**
 * LES JEUX DE FRANÇAIS DU COLLÈGE — le lot d'Adrien : figures de style,
 * théâtre, comique, chevalerie (5e) ; poésie, registres, presse (4e) ;
 * hypothèse, modalisation, orthographe, argumentation, implicite (3e).
 * Même épreuve que le CM2 : soixante parties par module et par classe, puis
 * les règles qui font chaque jeu, vérifiées sur pièces.
 */

import * as image from '../lib/jeux/college/comme-une-image-college';
import * as theatre from '../lib/jeux/college/poeme-theatre-college';
import * as rire from '../lib/jeux/college/pourquoi-on-rit';
import * as chevalier from '../lib/jeux/college/le-chevalier';
import * as syllabes from '../lib/jeux/college/compteur-de-syllabes';
import * as registre from '../lib/jeux/college/quel-registre';
import * as presse from '../lib/jeux/college/info-ou-opinion';
import * as hypothese from '../lib/jeux/college/si-j-etais';
import * as modalisation from '../lib/jeux/college/sur-ou-pas-sur';
import * as fautes from '../lib/jeux/college/chasse-aux-fautes';
import * as engagement from '../lib/jeux/college/these-argument-exemple';
import * as implicite from '../lib/jeux/college/ce-qui-n-est-pas-dit';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes de français du collège, recopiés de competences-college.txt. */
const COMPETENCES = [
  'FR_5E_ECR_SUITE', 'FR_5E_ECR_THEATRE', 'FR_5E_ECR_ARGUMENTER', 'FR_5E_ECR_BROUILLON', 'FR_5E_ECR_REFLEXIF', 'FR_5E_ECR_EVALUER',
  'FR_5E_LANG_PROPOSITIONS', 'FR_5E_LANG_RELATIVE', 'FR_5E_LANG_CONJONCTIVE', 'FR_5E_LANG_SUBJONCTIF', 'FR_5E_LANG_CONDITIONNEL',
  'FR_5E_LANG_VOIX', 'FR_5E_LANG_ACCORDS', 'FR_5E_LANG_LEXIQUE', 'FR_5E_LANG_VOC_RELATIONS', 'FR_5E_LANG_ORTHOGRAPHE',
  'FR_5E_LECT_CHEVALERIE', 'FR_5E_LECT_THEATRE', 'FR_5E_LECT_COMIQUE', 'FR_5E_LECT_VOYAGE', 'FR_5E_LECT_FIGURES',
  'FR_5E_ORAL_THEATRE', 'FR_5E_ORAL_EXPOSE', 'FR_5E_ORAL_ECOUTER',
  'FR_4E_ECR_NOUVELLE', 'FR_4E_ECR_ARGUMENTATION', 'FR_4E_ECR_COMMENTER', 'FR_4E_ECR_PORTRAIT', 'FR_4E_ECR_EVALUER',
  'FR_4E_LANG_DISCOURS', 'FR_4E_LANG_CONCORDANCE', 'FR_4E_LANG_CIRCONSTANCIELLE', 'FR_4E_LANG_INTERROGATIVE', 'FR_4E_LANG_NEGATION',
  'FR_4E_LANG_PP_PRONOMINAL', 'FR_4E_LANG_CONNOTATION', 'FR_4E_LANG_VOC_RELATIONS',
  'FR_4E_LECT_REALISME', 'FR_4E_LECT_FANTASTIQUE', 'FR_4E_LECT_POESIE', 'FR_4E_LECT_PRESSE', 'FR_4E_LECT_REGISTRE',
  'FR_4E_ORAL_DEBAT', 'FR_4E_ORAL_RECITER', 'FR_4E_ORAL_ECOUTER',
  'FR_3E_ECR_SUJET_REFLEXION', 'FR_3E_ECR_SUJET_IMAGINATION', 'FR_3E_ECR_DICTEE', 'FR_3E_ECR_REFORMULER', 'FR_3E_ECR_EVALUER',
  'FR_3E_LANG_ANALYSE', 'FR_3E_LANG_MODES', 'FR_3E_LANG_HYPOTHESE', 'FR_3E_LANG_MODALISATION', 'FR_3E_LANG_ORTHO',
  'FR_3E_LANG_LEXIQUE', 'FR_3E_LANG_VOC_RELATIONS',
  'FR_3E_LECT_AUTOBIO', 'FR_3E_LECT_GUERRE', 'FR_3E_LECT_ENGAGEMENT', 'FR_3E_LECT_ROMAN', 'FR_3E_LECT_IMPLICITE',
  'FR_3E_ORAL_EXPOSE', 'FR_3E_ORAL_LECTURE', 'FR_3E_ORAL_ECOUTER',
];

const PREFIXES = { SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_' };

/** [clé de la famille, module, classe attendue]. */
const JEUX = [
  ['comme-une-image-college', image, 'CINQUIEME'],
  ['poeme-theatre-college', theatre, 'CINQUIEME'],
  ['pourquoi-on-rit', rire, 'CINQUIEME'],
  ['le-chevalier', chevalier, 'CINQUIEME'],
  ['compteur-de-syllabes', syllabes, 'QUATRIEME'],
  ['quel-registre', registre, 'QUATRIEME'],
  ['info-ou-opinion', presse, 'QUATRIEME'],
  ['si-j-etais', hypothese, 'TROISIEME'],
  ['sur-ou-pas-sur', modalisation, 'TROISIEME'],
  ['chasse-aux-fautes', fautes, 'TROISIEME'],
  ['these-argument-exemple', engagement, 'TROISIEME'],
  ['ce-qui-n-est-pas-dit', implicite, 'TROISIEME'],
];

/** Chaque (module, classe) couvert. */
const PARTIES = JEUX.flatMap(([cle, module]) => module.CLASSES.map((classe) => [`${cle} (${classe})`, module, classe]));

describe.each(JEUX)('%s', (cle, module, classe) => {
  it('se présente : famille, matière, une seule classe, ses compétences officielles', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'FRANCAIS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.CLASSES).toEqual([classe]);
    expect(module.MANCHES).toBe(8);
    expect(module.ESCAPE).toBeUndefined();
    module.CLASSES.forEach((c) => {
      const p = module.PAR_CLASSE[c];
      expect(p.titre).toBeTruthy();
      expect(p.accroche).toBeTruthy();
      expect(p.accroche.length).toBeLessThanOrEqual(45);
      expect(p.competences.length).toBeGreaterThan(0);
      p.competences.forEach((code) => {
        expect(COMPETENCES).toContain(code);
        expect(code).toContain(PREFIXES[c]);
      });
    });
  });

  it('ses phrases sont fixes : clés en kebab-case, aucun chiffre, jamais « raté »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof texte).toBe('string');
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté/i);
    });
  });

  it('le mot de la fin est le commun', () => {
    expect(module.bilan(module.MANCHES)).toBe('Sans une seule erreur. Bravo !');
    expect(module.bilan(0)).toBeTruthy();
  });
});

describe.each(PARTIES)('%s', (_, module, classe) => {
  const toutes = () => graines.flatMap((g) => module.serie(g, classe));

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
        m.choix.forEach((c) => expect(String(c.libelle).trim()).not.toBe(''));
        expect(String(m.question).trim()).not.toBe('');
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    toutes().forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(module.PHRASES[m.aide ?? m.consigne]).toBeTruthy();
      expect(module.verdict(m, m.bonne)).toBe('juste');
      m.choix.filter((c) => String(c.cle) !== String(m.bonne)).forEach((c) => {
        const s = module.verdict(m, c.cle);
        expect(module.PHRASES[s]).toBeTruthy();
        expect(module.PHRASES[s]).not.toMatch(/raté/i);
      });
    });
  });

  it('une bonne réponse n’est jamais aussi un piège, et chaque piège est un vrai choix', () => {
    toutes().forEach((m) => {
      const pieges = m.pieges ?? {};
      expect(pieges[m.bonne]).toBeUndefined();
      const cles = m.choix.map((c) => String(c.cle));
      Object.keys(pieges).forEach((k) => expect(cles).toContain(k));
    });
  });

  it('la même graine redonne la même partie, une autre graine en donne une autre', () => {
    expect(module.serie(77, classe)).toEqual(module.serie(77, classe));
    expect(module.serie(1758000104729, classe)).toEqual(module.serie(1758000104729, classe));
    expect(module.serie(77, classe)).not.toEqual(module.serie(78, classe));
  });

  it('plusieurs sortes de manches, et des banques assez larges pour varier', () => {
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
    expect(Object.keys(parSorte).length).toBeGreaterThanOrEqual(2);
    Object.entries(parSorte).forEach(([k, vus]) => {
      expect(vus.size).toBeGreaterThanOrEqual(3 * maxParPartie[k]);
    });
  });
});

describe('l’exactitude, pièce par pièce', () => {
  const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));
  const sans = (s) => s.toLowerCase().normalize('NFC');

  it('les mots à désigner sont bien dans la phrase affichée', () => {
    [
      [image, 'CINQUIEME', ['outil', 'compare']],
      [presse, 'QUATRIEME', ['mot-qui-juge']],
      [modalisation, 'TROISIEME', ['mot-qui-nuance']],
      [fautes, 'TROISIEME', ['trouver']],
      [implicite, 'TROISIEME', ['mot-qui-sous-entend']],
    ].forEach(([module, classe, sortes]) => {
      toutes(module, classe).filter((m) => sortes.includes(m.consigne)).forEach((m) => {
        m.choix.forEach((c) => expect(sans(m.question)).toContain(sans(c.libelle)));
      });
    });
  });

  it('comme une image : une comparaison a son outil, une métaphore n’en a pas', () => {
    const outils = /\b(comme|tel|telle|tels|pareil|pareille|semblable|ressembl)/i;
    image.PHRASES_FIGUREES.forEach(([p, figure]) => {
      expect(outils.test(p)).toBe(figure === 'comparaison');
    });
    image.IMAGES.filter(([, , outil]) => outil).forEach(([p, , outil]) => expect(p.toLowerCase()).toContain(outil));
    image.IMAGES.filter(([, , outil]) => !outil).forEach(([p]) => expect(outils.test(p)).toBe(false));
  });

  it('le compteur : le bon compte est celui du vers, et le nom suit le compte', () => {
    const parVers = new Map(syllabes.VERS.map(([v, , n]) => [v, n]));
    const compte = (m) => parVers.get(m.question.match(/« (.*) »/)[1]);
    const manches = toutes(syllabes, 'QUATRIEME');
    manches.filter((m) => m.consigne === 'compter').forEach((m) => expect(Number(m.bonne)).toBe(compte(m)));
    manches.filter((m) => m.consigne === 'nommer').forEach((m) => expect(m.bonne).toBe(syllabes.NOMS[compte(m)]));
    syllabes.VERS.forEach(([, , n, faux]) => faux.forEach(([f]) => expect(f).not.toBe(n)));
    expect(syllabes.NOMS).toEqual({ 8: 'octosyllabe', 10: 'decasyllabe', 12: 'alexandrin' });
  });

  it('le compteur : un quatrain a quatre vers, et chaque disposition a ses trois quatrains au moins', () => {
    syllabes.QUATRAINS.forEach(([q, d]) => {
      expect(q.split('\n')).toHaveLength(4);
      expect(Object.keys(syllabes.DISPOSITIONS)).toContain(d);
    });
    Object.keys(syllabes.DISPOSITIONS).forEach((d) => {
      expect(syllabes.QUATRAINS.filter(([, x]) => x === d).length).toBeGreaterThanOrEqual(3);
    });
  });

  it('si j’étais… : jamais de conditionnel après « si » dans une bonne réponse', () => {
    const conditionnels = hypothese.HYPOTHESES.flatMap((h) => h.si[3]);
    const manches = toutes(hypothese, 'TROISIEME');
    manches.filter((m) => m.consigne === 'apres-si').forEach((m) => expect(conditionnels).not.toContain(m.bonne));
    manches.filter((m) => m.consigne === 'correcte').forEach((m) => {
      // La bonne phrase est un système 2 ou 3 entier, jamais un mélange.
      const h = hypothese.HYPOTHESES.find((x) => [1, 2].some((s) => m.bonne === hypothese.phrase(x, x.si[2][s], x.pr[1][s])));
      expect(h).toBeTruthy();
      h.si[3].forEach((c) => expect(m.bonne.startsWith(hypothese.subordonnee(h, c))).toBe(false));
      const fautive = Object.keys(m.pieges).find((k) => m.pieges[k] === 'si-jamais-conditionnel');
      expect(h.si[3].some((c) => fautive.startsWith(hypothese.subordonnee(h, c)))).toBe(true);
    });
  });

  it('si j’étais… : la principale suit le temps de la subordonnée', () => {
    toutes(hypothese, 'TROISIEME').filter((m) => m.consigne === 'principale').forEach((m) => {
      const h = hypothese.HYPOTHESES.find((x) => x.si[2].some((v) => m.question.startsWith(`${hypothese.subordonnee(x, v)},`)));
      expect(h).toBeTruthy();
      const s = h.si[2].findIndex((v) => m.question.startsWith(`${hypothese.subordonnee(h, v)},`));
      expect(m.bonne).toBe(h.pr[1][s]);
    });
    const h = hypothese.HYPOTHESES[0];
    expect(hypothese.phrase(h, 'venais', 'irions')).toBe('Si tu venais, nous irions au cinéma.');
  });

  it('la chasse aux fautes : une seule phrase juste, chaque fautive a sa faute nommée', () => {
    toutes(fautes, 'TROISIEME').filter((m) => m.consigne === 'sans-faute').forEach((m) => {
      const t = fautes.TRIPLETS.find(([juste]) => juste === m.bonne);
      expect(t).toBeTruthy();
      expect(Object.keys(m.pieges)).toHaveLength(2);
    });
    fautes.FAUTES.forEach(([p, fautif, correction]) => {
      expect(p).toContain(fautif);
      expect(fautif).not.toBe(correction);
    });
  });

  it('thèse, argument, exemple : le rôle désigné est celui de la phrase dans le texte', () => {
    toutes(engagement, 'TROISIEME').filter((m) => m.consigne === 'role').forEach((m) => {
      const visee = m.question.match(/→ « (.*) »$/)[1];
      const texte = engagement.TEXTES.find((t) => t.includes(visee));
      expect(['these', 'argument', 'exemple'][texte.indexOf(visee)]).toBe(m.bonne);
    });
  });

  it('sûr ou pas sûr : « sans doute » n’est jamais une certitude', () => {
    const nuances = modalisation.PHRASES_NUANCEES;
    nuances.filter(([p]) => /sans doute/.test(p)).forEach(([, nuance]) => expect(nuance).toBe('doute'));
    nuances.filter(([p]) => /sans aucun doute/.test(p)).forEach(([, nuance]) => expect(nuance).toBe('certitude'));
    toutes(modalisation, 'TROISIEME').filter((m) => m.consigne === 'plus-sure' || m.consigne === 'moins-sure').forEach((m) => {
      const e = modalisation.ECHELLES.find((t) => t.includes(m.bonne));
      expect(e.indexOf(m.bonne)).toBe(m.consigne === 'plus-sure' ? 0 : 2);
    });
  });

  it('ironique ou sincère : chaque partie montre un cas de chaque', () => {
    graines.forEach((g) => {
      const tons = implicite.serie(g, 'TROISIEME').filter((m) => m.consigne === 'ironie').map((m) => m.bonne).sort();
      expect(tons).toEqual(['ironique', 'sincere']);
    });
  });
});
