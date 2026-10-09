/**
 * L'ESCAPE GAME D'HISTOIRE-GÉOGRAPHIE DU COLLÈGE — avec Salim. Quatre
 * histoires (6e → 3e), six cadenas chacune : la mécanique du contrat, puis
 * l'exactitude (chaque bonne réponse est le repère attendu, jamais un piège).
 */

import * as escapeHG from '../lib/jeux/college/escape-histoire-geo';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes HISTOIRE_GEO de competences-college.txt (hors dépôt : copiés en dur). */
const COMPETENCES = new Set([
  'HG_6E_EMC_COLLEGE', 'HG_6E_EMC_IDENTITE', 'HG_6E_GEO_METROPOLES', 'HG_6E_GEO_RURAL', 'HG_6E_GEO_LITTORAL',
  'HG_6E_GEO_REPARTITION', 'HG_6E_GEO_PLANETE', 'HG_6E_HIST_PREHISTOIRE', 'HG_6E_HIST_ORIENT', 'HG_6E_HIST_GRECE',
  'HG_6E_HIST_ROME', 'HG_6E_HIST_MONOTHEISMES', 'HG_6E_HIST_EMPIRES', 'HG_6E_METH_DOCUMENT', 'HG_6E_METH_PRELEVER',
  'HG_6E_METH_FRISE', 'HG_6E_METH_CARTE', 'HG_6E_METH_REDIGER',
  'HG_5E_EMC_EGALITE', 'HG_5E_EMC_SOLIDARITE', 'HG_5E_GEO_DEMOGRAPHIE', 'HG_5E_GEO_RESSOURCES', 'HG_5E_GEO_CLIMAT',
  'HG_5E_GEO_RISQUE', 'HG_5E_GEO_INEGALITES', 'HG_5E_HIST_ISLAM', 'HG_5E_HIST_FEODALITE', 'HG_5E_HIST_ETAT',
  'HG_5E_HIST_VILLES', 'HG_5E_HIST_DECOUVERTES', 'HG_5E_HIST_REFORMES', 'HG_5E_HIST_ABSOLUTISME', 'HG_5E_HIST_BYZANCE',
  'HG_5E_HIST_EMPIRES_XVI', 'HG_5E_METH_CONFRONTER', 'HG_5E_METH_DEVELOPPE', 'HG_5E_METH_CROQUIS', 'HG_5E_METH_CRITIQUE',
  'HG_4E_EMC_LIBERTES', 'HG_4E_EMC_INFORMATION', 'HG_4E_GEO_URBANISATION', 'HG_4E_GEO_MIGRATIONS', 'HG_4E_GEO_TOURISME',
  'HG_4E_GEO_MARITIME', 'HG_4E_GEO_FIRMES', 'HG_4E_GEO_ETATS_UNIS', 'HG_4E_GEO_AFRIQUE', 'HG_4E_HIST_LUMIERES',
  'HG_4E_HIST_COMMERCE', 'HG_4E_HIST_REVOLUTION', 'HG_4E_HIST_INDUSTRIE', 'HG_4E_HIST_COLONISATION',
  'HG_4E_HIST_REPUBLIQUE', 'HG_4E_HIST_VOTER', 'HG_4E_HIST_FEMMES_XIX', 'HG_4E_METH_ANALYSE', 'HG_4E_METH_STATISTIQUE',
  'HG_4E_METH_PLAN', 'HG_4E_METH_CROQUIS',
  'HG_3E_EMC_CITOYENNETE', 'HG_3E_EMC_DEFENSE', 'HG_3E_GEO_AIRES', 'HG_3E_GEO_PRODUCTIF', 'HG_3E_GEO_FAIBLE_DENSITE',
  'HG_3E_GEO_UE', 'HG_3E_GEO_ULTRAMARINS', 'HG_3E_GEO_AMENAGEMENT', 'HG_3E_HIST_1GM', 'HG_3E_HIST_TOTALITAIRES',
  'HG_3E_HIST_2GM', 'HG_3E_HIST_FRANCE_40', 'HG_3E_HIST_GUERRE_FROIDE', 'HG_3E_HIST_DECOLONISATION',
  'HG_3E_HIST_VE_REPUBLIQUE', 'HG_3E_HIST_FEMMES', 'HG_3E_HIST_PROJET_EUROPEEN', 'HG_3E_HIST_APRES_1989',
  'HG_3E_HIST_REFONDER', 'HG_3E_METH_DEVELOPPE', 'HG_3E_METH_DOCUMENT', 'HG_3E_METH_CARTE',
]);

const MARQUE = {
  SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_',
};
const PREFIXE = {
  SIXIEME: '6e', CINQUIEME: '5e', QUATRIEME: '4e', TROISIEME: '3e',
};

/**
 * L'exactitude, écrite ici indépendamment du module : pour chaque étape, la
 * réponse attendue. Si le module se trompait de libellé, le test tomberait.
 */
const REPONSES = {
  SIXIEME: [
    ['L’agriculture et l’élevage', 'Lascaux', 'Des chasseurs-cueilleurs', 'La sédentarisation'],
    ['Les hiéroglyphes', 'Le pharaon', 'Le Nil', 'La Mésopotamie'],
    ['Les citoyens seulement', 'L’Acropole', 'Zeus', 'Homère'],
    ['753 av. J.-C.', 'Auguste', 'Jules César', 'Le forum'],
    ['Le christianisme', 'La Bible', 'Constantin', 'Croire en un seul dieu'],
    ['L’Asie', 'Une métropole', 'Le littoral', 'Il y fait trop sec'],
  ],
  CINQUIEME: [
    ['La Mecque', 'Le Coran', 'L’Hégire', 'Les califes'],
    ['800', 'Constantinople', 'Sainte-Sophie', 'Aix-la-Chapelle'],
    ['Un vassal', 'Un fief', 'Un serf', 'Les corvées'],
    ['Les bourgeois', 'Le gothique', 'Les foires', 'Les corporations'],
    ['Philippe Auguste', 'Hugues Capet', 'Louis IX', 'La guerre de Cent Ans'],
    ['Christophe Colomb', 'Vasco de Gama', 'Hernán Cortés', 'La caravelle'],
  ],
  QUATRIEME: [
    ['Le commerce triangulaire', 'Les plantations', 'Le sucre', '1848'],
    ['Montesquieu', 'L’Encyclopédie', 'Voltaire', 'Rousseau'],
    ['14 juillet 1789', 'La Déclaration des droits de l’homme et du citoyen', '1792', 'Napoléon Bonaparte'],
    ['La machine à vapeur', 'Les ouvriers', 'Le chemin de fer', 'Le Royaume-Uni'],
    ['Le suffrage universel masculin', 'Le Second Empire', 'Le suffrage censitaire', 'La IIIe République'],
    ['Jules Ferry', 'La laïcité', 'Alfred Dreyfus', 'La Marseillaise'],
  ],
  TROISIEME: [
    ['Verdun', '1918', 'Les poilus', 'Une guerre totale'],
    ['Staline', 'Hitler', 'Un régime totalitaire', 'Mussolini'],
    ['Charles de Gaulle', 'Philippe Pétain', 'Jean Moulin', '6 juin 1944'],
    ['La Sécurité sociale', '1945', 'La IVe République', 'Le programme du Conseil national de la Résistance'],
    ['Le traité de Rome', 'L’euro', 'Le traité de Maastricht', 'La France et l’Allemagne'],
    ['1989', 'Le rideau de fer', '1991', 'La crise de Cuba'],
  ],
};
const MOTS = {
  SIXIEME: 'TEMPLE', CINQUIEME: 'VOYAGE', QUATRIEME: 'NATION', TROISIEME: 'EUROPE',
};

/** Les seuls nombres que les phrases ont le droit de dire : des repères fixes. */
const REPERES = new Set([
  '3300', '753', '52', '476', '622', '800', '987', '1515', '1214', '1492',
  '4', '14', '26', '1789', '1848', '1945', '1870', '1880', '1881', '1882',
  '1916', '1942', '1943', '1815', '1933', '1922', '18', '1940', '1936', '1914',
  '1957', '1919', '1992', '9', '1961', '1980', '1989', '1991',
  // Les variantes du 09/10/2026.
  '1521', '1794', '1802', '1804', '1958', '1792', '1799', '1793', '1905', '1906', '11', '1918',
  '1944', '6', '8', '1946', '1947', '2002', '1962', '1948', '1949',
]);

const CAS = escapeHG.CLASSES.map((c) => [c]);

describe('le contrat du module', () => {
  it('est un escape game de six cadenas, en histoire-géographie, pour les quatre classes', () => {
    expect(escapeHG.ESCAPE).toBe(true);
    expect(escapeHG.MANCHES).toBe(6);
    expect(escapeHG.FAMILLE).toEqual(expect.objectContaining({ cle: 'escape-histoire-geo', matiereCode: 'HISTOIRE_GEO' }));
    expect(escapeHG.CLASSES).toEqual(['SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME']);
    expect(escapeHG.bilan(6)).toBe('Sans une seule erreur. Bravo !');
  });

  it('aucune phrase ne dit un nombre tiré au hasard : seulement des repères fixes', () => {
    Object.values(escapeHG.PHRASES).forEach((p) => {
      (p.match(/\d+/g) ?? []).forEach((n) => expect(REPERES.has(n)).toBe(true));
    });
  });

  it('les clés de phrases sont en kebab-case ASCII', () => {
    Object.keys(escapeHG.PHRASES).forEach((k) => expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });
});

describe.each(CAS)('%s', (niveau) => {
  it('chaque partie a ses six étapes, et chaque étape sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = escapeHG.serie(g, niveau);
      expect(serie).toHaveLength(escapeHG.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles).toContain(String(m.bonne));
        m.choix.forEach((c) => expect(String(c.libelle).length).toBeGreaterThan(0));
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => escapeHG.serie(g, niveau).forEach((m) => {
      expect(escapeHG.PHRASES[m.consigne]).toBeTruthy();
      expect(escapeHG.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
      expect(escapeHG.PHRASES[m.aide]).toBeTruthy();
      expect(escapeHG.verdict(m, m.bonne)).toBe('juste');
      m.choix.filter((c) => String(c.cle) !== String(m.bonne)).forEach((c) => {
        const s = escapeHG.verdict(m, c.cle);
        expect(escapeHG.PHRASES[s]).toBeTruthy();
        expect(escapeHG.PHRASES[s]).not.toMatch(/raté/i);
      });
      expect(escapeHG.PHRASES[escapeHG.verdict(m, '???')]).toBeTruthy();
    }));
  });

  it('chaque cadenas tire ses quatre questions : une partie ne ressemble pas à la précédente', () => {
    const vues = Array.from({ length: 6 }, () => new Set());
    graines.forEach((g) => escapeHG.serie(g, niveau).forEach((m, i) => vues[i].add(m.question)));
    vues.forEach((v) => expect(v.size).toBe(4));
  });

  it('la même graine redonne la même partie', () => {
    expect(escapeHG.serie(77, niveau)).toEqual(escapeHG.serie(77, niveau));
    expect(escapeHG.serie(1758000104729, niveau)).toEqual(escapeHG.serie(1758000104729, niveau));
  });

  it('les six étapes suivent le récit, et le cadenas accumule les pièces', () => {
    graines.forEach((g) => {
      const serie = escapeHG.serie(g, niveau);
      const pieces = serie.map((m) => m.cadenas.piece);
      serie.forEach((m, i) => {
        expect(m.consigne).toMatch(new RegExp(`^${PREFIXE[niveau]}-etape-${i + 1}(-[bcd])?$`));
        expect(m.recit.trim().length).toBeGreaterThan(0);
        expect(m.cadenas.total).toBe(6);
        expect(m.cadenas.avant).toEqual(pieces.slice(0, i));
        expect(m.cadenas.piece).toMatch(/^[A-Z0-9]$/);
      });
      expect(pieces.join('')).toBe(MOTS[niveau]);
      expect(escapeHG.PAR_CLASSE[niveau].fin).toContain(MOTS[niveau]);
    });
  });

  it('PAR_CLASSE : titre, accroche courte, intro, fin, compétences officielles de la classe', () => {
    const p = escapeHG.PAR_CLASSE[niveau];
    expect(p.titre.trim()).toBeTruthy();
    expect(p.accroche.trim()).toBeTruthy();
    expect(p.accroche.length).toBeLessThanOrEqual(45);
    expect(p.intro.trim()).toBeTruthy();
    expect(p.fin.trim()).toBeTruthy();
    expect(p.competences.length).toBeGreaterThan(0);
    p.competences.forEach((c) => {
      expect(COMPETENCES.has(c)).toBe(true);
      expect(c).toContain(MARQUE[niveau]);
    });
    escapeHG.serie(5, niveau).forEach((m) => expect(p.competences).toContain(m.competence));
  });

  it('exactitude : chaque bonne réponse est le repère attendu, et jamais aussi un piège', () => {
    graines.forEach((g) => escapeHG.serie(g, niveau).forEach((m, i) => {
      expect(REPONSES[niveau][i]).toContain(m.bonne);
      expect(Object.keys(m.pieges)).not.toContain(m.bonne);
      // Chaque choix faux a son piège nommé : aucun ne tombe sur le repli.
      m.choix.filter((c) => c.cle !== m.bonne).forEach((c) => expect(m.pieges[c.cle]).toBeTruthy());
    }));
  });
});

describe('les repères qu’on ne doit jamais trahir', () => {
  // La première variante de l'étape, celle des repères d'origine : on cherche une graine qui la tire.
  const etape = (niveau, i) => {
    for (let g = 1; g < 500; g += 1) {
      const m = escapeHG.serie(g, niveau)[i];
      if (!/-[bcd]$/.test(m.consigne)) return m;
    }
    throw new Error('variante d’origine jamais tirée');
  };

  it('les dates : la bonne est la plus ancienne quand on cherche un début', () => {
    // Rome : 753 av. J.-C. avant 52 av. J.-C. et 476 apr. J.-C.
    const rome = etape('SIXIEME', 3);
    const an = (l) => (l.includes('av.') ? -1 : 1) * Number(l.match(/\d+/)[0]);
    rome.choix.forEach((c) => expect(an(rome.bonne)).toBeLessThanOrEqual(an(c.cle)));
    // Charlemagne : 800, avant 987 et 1515.
    const charlemagne = etape('CINQUIEME', 1);
    charlemagne.choix.forEach((c) => expect(Number(charlemagne.bonne)).toBeLessThanOrEqual(Number(c.cle)));
    // La Bastille : le 14 juillet, avant le 4 et le 26 août.
    expect(etape('QUATRIEME', 2).bonne).toBe('14 juillet 1789');
  });

  it('le mur de Berlin tombe entre sa construction et la fin de l’URSS', () => {
    const mur = etape('TROISIEME', 5);
    const annees = mur.choix.map((c) => Number(c.cle)).sort((a, b) => a - b);
    expect(annees).toEqual([1961, 1989, 1991]);
    expect(Number(mur.bonne)).toBe(annees[1]);
  });

  it('les questions qui donnent une date la répètent dans le récit ou la phrase, sans contradiction', () => {
    expect(etape('CINQUIEME', 4).recit).toContain('1214');
    expect(etape('CINQUIEME', 4).question).toContain('1214');
    expect(escapeHG.PHRASES['5e-etape-5-aide']).toContain('1214');
    expect(etape('TROISIEME', 4).recit).toContain('1957');
    expect(etape('TROISIEME', 0).recit).toContain('1916');
  });
});
