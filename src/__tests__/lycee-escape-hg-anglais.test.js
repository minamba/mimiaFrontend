/**
 * LES ESCAPE GAMES D'HISTOIRE-GÉOGRAPHIE ET D'ANGLAIS DU LYCÉE — Salim et
 * Marine, de la 2de à la terminale, dans les trois voies (une histoire par
 * classe, celle de son illustration). Le contrat d'un escape game (six
 * cadenas dans l'ordre du récit, le code qui se construit pièce par pièce),
 * celui de tout jeu (une bonne réponse parmi des choix distincts, une méthode
 * pour chaque erreur, des phrases fixes), puis l'exactitude : chaque bonne
 * réponse, recopiée ici, et jamais aussi un piège.
 */

import * as escapeHG from '../lib/jeux/lycee/escape-histoire-geo-lycee';
import * as escapeAnglais from '../lib/jeux/lycee/escape-anglais-lycee';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const CLASSES_DU_LYCEE = [
  'SECONDE', 'SECONDE_PRO',
  'PREMIERE', 'PREMIERE_TECHNO', 'PREMIERE_PRO',
  'TERMINALE', 'TERMINALE_TECHNO', 'TERMINALE_PRO',
];

/**
 * Les codes utiles de competences-lycee.txt (hors dépôt : copiés en dur),
 * avec leur classe telle que la donne la colonne NIVEAU.
 */
const COMPETENCES = {
  HG_2DE_HIST_MEDITERRANEE: 'SECONDE',
  HG_2DE_HIST_MEDIEVALE: 'SECONDE',
  HG_2DE_HIST_XVE_XVIE: 'SECONDE',
  HG_2DE_HIST_ABSOLUTISME: 'SECONDE',
  HG_2DE_HIST_LUMIERES: 'SECONDE',
  HG_2DE_HIST_SOCIETE_ORDRES: 'SECONDE',
  HG_2DE_GEO_TRANSITIONS: 'SECONDE',
  HG_2DE_GEO_DEVELOPPEMENT: 'SECONDE',
  HG_2DE_GEO_MOBILITES: 'SECONDE',
  HG_2DE_GEO_RESSOURCES: 'SECONDE',
  HG_2DE_GEO_ENERGIE: 'SECONDE',
  HG_1RE_HIST_REVOLUTION_NATION: 'PREMIERE',
  HG_1RE_HIST_RESTAURATION: 'PREMIERE',
  HG_1RE_HIST_AGE_DEMOCRATIQUE: 'PREMIERE',
  HG_1RE_HIST_NOUVEAUX_ETATS: 'PREMIERE',
  HG_1RE_HIST_REPUBLIQUE: 'PREMIERE',
  HG_1RE_HIST_EMBRASEMENT: 'PREMIERE',
  HG_1RE_HIST_SORTIR_GUERRE: 'PREMIERE',
  HG_1RE_HIST_INDUSTRIE: 'PREMIERE',
  HG_1RE_HIST_COLONIAL: 'PREMIERE',
  HG_1RE_HIST_1GM: 'PREMIERE',
  HG_1RE_GEO_METROPOLISATION: 'PREMIERE',
  HG_1RE_GEO_PRODUCTIFS: 'PREMIERE',
  HG_1RE_GEO_UE: 'PREMIERE',
  HG_1TEC_HIST_REVOLUTION: 'PREMIERE_TECHNO',
  HG_1TEC_HIST_NAPOLEON_VIENNE: 'PREMIERE_TECHNO',
  HG_1TEC_HIST_1848: 'PREMIERE_TECHNO',
  HG_1TEC_HIST_SECOND_EMPIRE: 'PREMIERE_TECHNO',
  HG_1TEC_HIST_PROJET_REPUBLICAIN: 'PREMIERE_TECHNO',
  HG_1TEC_HIST_DREYFUS: 'PREMIERE_TECHNO',
  HG_1TEC_GEO_ESPACES_PRODUCTIFS: 'PREMIERE_TECHNO',
  HG_TLE_HIST_CRISE_1929: 'TERMINALE',
  HG_TLE_HIST_2GM: 'TERMINALE',
  HG_TLE_HIST_1945: 'TERMINALE',
  HG_TLE_HIST_GUERRE_FROIDE: 'TERMINALE',
  HG_TLE_HIST_DECOLONISATION: 'TERMINALE',
  HG_TLE_HIST_FRANCE: 'TERMINALE',
  HG_TLE_HIST_FRANCE_1974: 'TERMINALE',
  HG_TLE_HIST_CONSTRUCTION_EU: 'TERMINALE',
  HG_TLE_HIST_MUTATIONS: 'TERMINALE',
  HG_TLE_GEO_MERS: 'TERMINALE',
  HG_TLE_GEO_DYNAMIQUES: 'TERMINALE',
  HG_TLE_GEO_ENVIRONNEMENT: 'TERMINALE',
  HG_TTEC_HIST_TOTALITARISMES: 'TERMINALE_TECHNO',
  HG_TTEC_HIST_FRANCE_1940: 'TERMINALE_TECHNO',
  HG_TTEC_HIST_ORDRE_1945: 'TERMINALE_TECHNO',
  HG_TTEC_HIST_GUERRE_FROIDE: 'TERMINALE_TECHNO',
  HG_TTEC_HIST_FIN_EMPIRE: 'TERMINALE_TECHNO',
  HG_TTEC_HIST_DECOLONISATION: 'TERMINALE_TECHNO',
  HG_TTEC_HIST_PROJET_EUROPEEN: 'TERMINALE_TECHNO',
  HG_TTEC_GEO_INTEGRATION: 'TERMINALE_TECHNO',
  HG_TTEC_GEO_CENTRES_DECISION: 'TERMINALE_TECHNO',
  AN_2DE_GRAM_TEMPS: 'SECONDE',
  AN_2DE_GRAM_MODAUX: 'SECONDE',
  AN_2DE_GRAM_PRONOMS: 'SECONDE',
  AN_2DE_GRAM_GN: 'SECONDE',
  AN_2DE_CULT_COMMONWEALTH: 'SECONDE',
  AN_2DE_LEX_IDIOMES: 'SECONDE',
  AN_2DE_LEX_PRECISION: 'SECONDE',
  AN_2DE_COMP_IMPLICITE: 'SECONDE',
  AN_2DE_COMP_ECRIT: 'SECONDE',
  AN_1RE_CULT_AMERIQUE: 'PREMIERE',
  AN_1RE_GRAM_HYPOTHESE: 'PREMIERE',
  AN_1RE_GRAM_ARTICULER: 'PREMIERE',
  AN_1RE_GRAM_NUANCE: 'PREMIERE',
  AN_1RE_CULT_INCLUSION: 'PREMIERE',
  AN_1RE_GRAM_PRONOMS: 'PREMIERE',
  AN_1RE_LEX_THEMATIQUE: 'PREMIERE',
  AN_1RE_COMP_ECRIT: 'PREMIERE',
  AN_TLE_CULT_ROYAUME_UNI: 'TERMINALE',
  AN_TLE_CULT_COMMUNICATION: 'TERMINALE',
  AN_TLE_ECR_TRADUIRE: 'TERMINALE',
  AN_TLE_LEX_REGISTRE: 'TERMINALE',
  AN_TLE_GRAM_STYLE: 'TERMINALE',
  AN_TLE_GRAM_GN: 'TERMINALE',
  AN_TLE_GRAM_MAITRISE: 'TERMINALE',
  AN_TLE_COMP_ECRIT: 'TERMINALE',
};

/**
 * LE REPLI DU RÉFÉRENTIEL (comme celui de l'API) : une classe qui n'a aucune
 * compétence à elle dans competences-lycee.txt, pour une matière, prend celles
 * de la même année en voie générale. En histoire-géographie, les voies
 * technologiques ont les leurs (HG_1TEC_…, HG_TTEC_…) ; la voie professionnelle
 * n'en a pas. En anglais, seules les classes générales en ont. Pour ces
 * classes-là, et pour elles seulement, le code attendu est celui de la classe
 * de repli — jamais un autre.
 */
const REPLI = {
  HISTOIRE_GEO: { SECONDE_PRO: 'SECONDE', PREMIERE_PRO: 'PREMIERE', TERMINALE_PRO: 'TERMINALE' },
  ANGLAIS: {
    SECONDE_PRO: 'SECONDE',
    PREMIERE_TECHNO: 'PREMIERE',
    PREMIERE_PRO: 'PREMIERE',
    TERMINALE_TECHNO: 'TERMINALE',
    TERMINALE_PRO: 'TERMINALE',
  },
};
const classeDesCompetences = (matiere, niveau) => REPLI[matiere][niveau] ?? niveau;

const PREFIXE = {
  SECONDE: '2de',
  SECONDE_PRO: '2pro',
  PREMIERE: '1re',
  PREMIERE_TECHNO: '1tec',
  PREMIERE_PRO: '1pro',
  TERMINALE: 'tle',
  TERMINALE_TECHNO: 'ttec',
  TERMINALE_PRO: 'tpro',
};

/** Le contrat commun, puis ce qui est propre à chaque module. */
const MODULES = [
  {
    nom: 'escape-histoire-geo-lycee',
    jeu: escapeHG,
    matiere: 'HISTOIRE_GEO',
    // Les titres peints sur les couvertures des illustrations, à la lettre.
    titres: {
      SECONDE: 'Le phare de la Méditerranée',
      SECONDE_PRO: 'Le mystère des routes marchandes',
      PREMIERE: 'Le dernier train de l’enquête',
      PREMIERE_TECHNO: 'Les quais de la révolution',
      PREMIERE_PRO: 'La cargaison des deux mondes',
      TERMINALE: 'Le réseau du monde',
      TERMINALE_TECHNO: 'Le barrage des frontières',
      TERMINALE_PRO: 'L’enquête des territoires',
    },
    mots: {
      SECONDE: 'ESCALE',
      SECONDE_PRO: 'POIVRE',
      PREMIERE: 'LEVIER',
      PREMIERE_TECHNO: 'VAPEUR',
      PREMIERE_PRO: 'NAVIRE',
      TERMINALE: 'MONDES',
      TERMINALE_TECHNO: 'OUVERT',
      TERMINALE_PRO: 'CARTES',
    },
  },
  {
    nom: 'escape-anglais-lycee',
    jeu: escapeAnglais,
    matiere: 'ANGLAIS',
    titres: {
      SECONDE: 'The Missing Harbour Key',
      SECONDE_PRO: 'The Workshop Mystery',
      PREMIERE: 'The Midnight Broadcast',
      PREMIERE_TECHNO: 'The Greenhouse Alarm',
      PREMIERE_PRO: 'The Delivery Detour',
      TERMINALE: 'The Silent Research Station',
      TERMINALE_TECHNO: 'The Smart City Blackout',
      TERMINALE_PRO: 'The Last Train Clue',
    },
    mots: {
      SECONDE: 'ANCHOR',
      SECONDE_PRO: 'PEDALS',
      PREMIERE: 'SIGNAL',
      PREMIERE_TECHNO: 'TOMATO',
      PREMIERE_PRO: 'PARCEL',
      TERMINALE: 'AURORA',
      TERMINALE_TECHNO: 'REBOOT',
      TERMINALE_PRO: 'TRACKS',
    },
  },
];

describe.each(MODULES.map((m) => [m.nom, m]))('%s — le module', (nom, { jeu, matiere }) => {
  it('se décrit : famille, escape game de six cadenas, les huit classes du lycée', () => {
    expect(jeu.FAMILLE).toEqual({ cle: nom, titre: expect.any(String), matiereCode: matiere });
    expect(jeu.ESCAPE).toBe(true);
    expect(jeu.MANCHES).toBe(6);
    expect(jeu.CLASSES).toEqual(CLASSES_DU_LYCEE);
    expect(jeu.bilan(6)).toBe('Sans une seule erreur. Bravo !');
  });

  it('chaque phrase est fixe : aucun chiffre, une clé en kebab-case ASCII, jamais « raté » ni « faux »', () => {
    const ecarts = Object.entries(jeu.PHRASES).filter(([cle, texte]) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(cle)
      || !texte.trim()
      || /\d/.test(texte)
      || /raté|\bfaux\b/i.test(texte));
    expect(ecarts).toEqual([]);
  });

  it('les phrases dites suivent la typographie française devant ? ! : ;', () => {
    const ecarts = Object.entries(jeu.PHRASES).filter(([, texte]) => /\S[?!:;]/.test(texte));
    expect(ecarts).toEqual([]);
  });

  it('les intros ne parlent ni de chrono ni de compte à rebours : l’écran s’en charge', () => {
    const ecarts = jeu.CLASSES.filter((c) => /minute|chrono|compte à rebours|countdown|hurry|dépêche/i.test(jeu.PAR_CLASSE[c].intro));
    expect(ecarts).toEqual([]);
  });

  it('chaque phrase sert : aucune réplique enregistrée pour rien', () => {
    const dites = new Set();
    jeu.CLASSES.forEach((niveau) => graines.concat(Array.from({ length: 200 }, (_, i) => i * 7919 + 1758000000001))
      .forEach((g) => jeu.serie(g, niveau).forEach((m) => {
        [m.consigne, `${m.consigne}-regle`, m.aide, ...Object.values(m.pieges)].forEach((k) => dites.add(k));
      })));
    expect(Object.keys(jeu.PHRASES).filter((k) => !dites.has(k))).toEqual([]);
  });
});

const CAS = MODULES.flatMap((m) => m.jeu.CLASSES.map((niveau) => [m.nom, niveau, m]));

describe.each(CAS)('%s — %s', (nom, niveau, {
  jeu, mots, titres, matiere,
}) => {
  it('PAR_CLASSE : le titre de l’illustration, accroche courte, intro, fin, compétences officielles de la classe', () => {
    const p = jeu.PAR_CLASSE[niveau];
    expect(p.titre).toBe(titres[niveau]);
    expect(p.accroche.trim()).not.toBe('');
    expect(p.accroche.length).toBeLessThanOrEqual(45);
    expect(p.intro.trim()).not.toBe('');
    expect(p.fin.trim()).not.toBe('');
    expect(p.competences.length).toBeGreaterThan(0);
    expect(p.competences.filter((c) => COMPETENCES[c] !== classeDesCompetences(matiere, niveau))).toEqual([]);
    const horsListe = graines.flatMap((g) => jeu.serie(g, niveau)).filter((m) => !p.competences.includes(m.competence));
    expect(horsListe).toEqual([]);
  });

  it('chaque partie a ses six étapes, et chaque étape sa bonne réponse parmi des choix différents', () => {
    const ecarts = [];
    graines.forEach((g) => {
      const serie = jeu.serie(g, niveau);
      if (serie.length !== jeu.MANCHES) ecarts.push([g, 'longueur', serie.length]);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        if (new Set(cles).size !== cles.length) ecarts.push([g, m.consigne, 'doublon']);
        if (cles.length < 2 || cles.length > 4) ecarts.push([g, m.consigne, 'nombre de choix']);
        if (!cles.includes(String(m.bonne))) ecarts.push([g, m.consigne, 'bonne absente']);
        if (m.choix.some((c) => !String(c.libelle).trim())) ecarts.push([g, m.consigne, 'libellé vide']);
        if (!m.question.trim()) ecarts.push([g, m.consigne, 'question vide']);
      });
    });
    expect(ecarts).toEqual([]);
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    const ecarts = [];
    graines.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
      if (!jeu.PHRASES[m.consigne]) ecarts.push([m.consigne, 'consigne']);
      if (!jeu.PHRASES[`${m.consigne}-regle`]) ecarts.push([m.consigne, 'règle']);
      if (!m.aide || !jeu.PHRASES[m.aide]) ecarts.push([m.consigne, 'aide', m.aide]);
      if (jeu.verdict(m, m.bonne) !== 'juste') ecarts.push([m.consigne, 'bonne refusée']);
      m.choix.filter((c) => String(c.cle) !== String(m.bonne)).forEach((c) => {
        const s = jeu.verdict(m, c.cle);
        if (!jeu.PHRASES[s] || /raté/i.test(jeu.PHRASES[s])) ecarts.push([m.consigne, c.cle, s]);
      });
      if (!jeu.PHRASES[jeu.verdict(m, '???')]) ecarts.push([m.consigne, 'repli']);
    }));
    expect(ecarts).toEqual([]);
  });

  it('chaque choix faux a son piège nommé, et la bonne réponse n’est jamais un piège', () => {
    const ecarts = [];
    graines.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
      if (m.pieges[m.bonne] !== undefined) ecarts.push([m.question, 'bonne en piège']);
      m.choix.filter((c) => c.cle !== m.bonne).forEach((c) => {
        if (!m.pieges[c.cle]) ecarts.push([m.question, c.cle]);
      });
    }));
    expect(ecarts).toEqual([]);
  });

  it('aucune clé de phrase ne sert à la fois de consigne et d’erreur', () => {
    const consignes = new Set();
    const erreurs = new Set();
    graines.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
      consignes.add(m.consigne);
      Object.values(m.pieges).forEach((p) => erreurs.add(p));
    }));
    expect([...consignes].filter((c) => erreurs.has(c))).toEqual([]);
  });

  it('la même graine redonne la même partie', () => {
    expect(jeu.serie(77, niveau)).toEqual(jeu.serie(77, niveau));
    expect(jeu.serie(1758000104729, niveau)).toEqual(jeu.serie(1758000104729, niveau));
  });

  it('escape : six étapes dans l’ordre du récit, et le code se construit pièce par pièce', () => {
    const ecarts = [];
    graines.forEach((g) => {
      const pieces = [];
      jeu.serie(g, niveau).forEach((m, i) => {
        if (m.consigne !== `${PREFIXE[niveau]}-etape-${i + 1}`) ecarts.push([g, i, 'consigne', m.consigne]);
        if (!m.recit.trim()) ecarts.push([g, i, 'récit vide']);
        if (m.cadenas.total !== 6) ecarts.push([g, i, 'total']);
        if (JSON.stringify(m.cadenas.avant) !== JSON.stringify(pieces)) ecarts.push([g, i, 'avant']);
        if (!/^[A-Z0-9]$/.test(m.cadenas.piece)) ecarts.push([g, i, 'pièce']);
        pieces.push(m.cadenas.piece);
      });
      if (pieces.join('') !== mots[niveau]) ecarts.push([g, 'mot', pieces.join('')]);
    });
    expect(ecarts).toEqual([]);
    expect(jeu.PAR_CLASSE[niveau].fin).toContain(mots[niveau]);
  });

  it('chaque étape varie d’une partie à l’autre', () => {
    for (let i = 0; i < jeu.MANCHES; i += 1) {
      const questions = new Set(graines.map((g) => `${jeu.serie(g, niveau)[i].question} ${jeu.serie(g, niveau)[i].bonne}`));
      expect(questions.size).toBeGreaterThan(1);
    }
  });
});

/**
 * L'EXACTITUDE, recopiée ici : pour chaque question de chaque étape, la seule
 * réponse juste. Si un module se trompait de libellé, ou ajoutait une
 * question sans qu'on la relise, le test tomberait.
 */
const REPONSES_HG = {
  SECONDE: [
    {
      'Quel stratège domine la vie politique d’Athènes au milieu du Ve siècle av. J.-C. ?': 'Périclès',
      'Qui devient, en 27 av. J.-C., le premier empereur romain ?': 'Auguste',
    },
    {
      'Quelle ville les croisés prennent-ils en 1099, au terme de la première croisade ?': 'Jérusalem',
      'Quelle cité de la lagune, gouvernée par un doge, domine le commerce de la Méditerranée orientale ?': 'Venise',
    },
    {
      'Par quel traité, en 1494, l’Espagne et le Portugal se partagent-ils les terres à découvrir ?': 'Le traité de Tordesillas',
      'Qui est ce moine, à l’origine de la Réforme protestante ?': 'Martin Luther',
    },
    {
      'Comment s’appelle ce texte de 1689, fondement de la monarchie parlementaire anglaise ?': 'Le Bill of Rights',
      'Quel roi révoque l’édit de Nantes, en 1685 ?': 'Louis XIV',
    },
    {
      'Quel savant anglais énonce la loi de la gravitation universelle ?': 'Isaac Newton',
      'Qui dirige l’Encyclopédie ?': 'Diderot et d’Alembert',
    },
    {
      'Comment appelle-t-on ce passage d’une natalité et d’une mortalité fortes à une natalité et une mortalité faibles ?': 'La transition démographique',
      'Quel indicateur combine l’espérance de vie, le niveau d’éducation et le revenu par habitant ?': 'L’IDH',
    },
  ],
  SECONDE_PRO: [
    {
      'Quel peuple de l’Antiquité appelait la Méditerranée Mare nostrum, « notre mer » ?': 'Les Romains',
      'De quelle cité grecque Le Pirée est-il le port ?': 'Athènes',
    },
    {
      'Quelle cité italienne, bâtie sur une lagune, domine le commerce des épices au Moyen Âge ?': 'Venise',
      'D’où vient le poivre vendu en Europe au Moyen Âge ?': 'D’Asie',
    },
    {
      'Pour qui Christophe Colomb traverse-t-il l’Atlantique en 1492 ?': 'Les Rois catholiques d’Espagne',
      'Quel navigateur portugais ouvre, en 1498, la route des Indes par le sud de l’Afrique ?': 'Vasco de Gama',
    },
    {
      'Quelle plante d’Amérique sert à fabriquer le chocolat ?': 'Le cacao',
      'Quelle plante, venue d’Amérique, arrive en Europe après les voyages de Colomb ?': 'La pomme de terre',
    },
    {
      'Comment appelle-t-on une personne qui quitte son pays pour s’installer dans un autre ?': 'Un migrant',
      'Comment appelle-t-on le fait de voyager pour ses loisirs, hors de chez soi ?': 'Le tourisme',
    },
    {
      'Quelle énergie utilise la force du vent ?': 'L’énergie éolienne',
      'Comment appelle-t-on une usine qui transforme l’eau de mer en eau douce ?': 'Une usine de dessalement',
    },
  ],
  PREMIERE: [
    {
      'Quel texte de 1804 unifie le droit civil des Français ?': 'Le Code civil',
      'Quel régime remplace alors la monarchie ?': 'La Première République',
    },
    {
      'Comment appelle-t-on cette vague de révolutions qui secoue l’Europe en 1848 ?': 'Le printemps des peuples',
      'Qui fait ce coup d’État, un an avant de devenir empereur ?': 'Louis-Napoléon Bonaparte',
      'Quel républicain inspire ce décret qui abolit l’esclavage dans les colonies françaises ?': 'Victor Schœlcher',
      'Quelle réunion de 1815 réorganise l’Europe après la chute de Napoléon ?': 'Le congrès de Vienne',
    },
    {
      'Qui conduit l’unité italienne par la diplomatie, depuis Turin ?': 'Cavour',
      'Où l’Empire allemand est-il proclamé ?': 'À Versailles',
    },
    {
      'Que fait cette loi de 1905 ?': 'Elle sépare les Églises et l’État',
      'Qui écrit « J’accuse… ! » pour défendre le capitaine Dreyfus ?': 'Émile Zola',
    },
    {
      'Quel président américain propose cette Société des nations ?': 'Woodrow Wilson',
      'Que signe-t-on à Rethondes, le 11 novembre 1918 ?': 'L’armistice',
    },
    {
      'Comment appelle-t-on ce transfert d’une production vers un pays où elle coûte moins cher ?': 'Une délocalisation',
      'Comment appelle-t-on la concentration des populations, des activités et des fonctions de commandement dans les plus grandes villes ?': 'La métropolisation',
    },
  ],
  PREMIERE_TECHNO: [
    {
      'Quel texte proclame, en août 1789, que « les hommes naissent et demeurent libres et égaux en droits » ?': 'La Déclaration des droits de l’homme',
      'Quel régime remplace la monarchie en septembre 1792 ?': 'La République',
    },
    {
      'Où Napoléon remporte-t-il sa plus célèbre victoire, en décembre 1805 ?': 'À Austerlitz',
      'Quelle réunion de 1815 réorganise l’Europe après la chute de Napoléon ?': 'Le congrès de Vienne',
    },
    {
      'Quel droit tous les hommes de 21 ans et plus obtiennent-ils en mars 1848 ?': 'Le droit de vote',
      'Quel républicain inspire ce décret qui abolit l’esclavage dans les colonies françaises ?': 'Victor Schœlcher',
    },
    {
      'Quel préfet transforme Paris par de grands travaux sous le Second Empire ?': 'Haussmann',
      'Qui gouverne la France sous le Second Empire, de 1852 à 1870 ?': 'Napoléon III',
    },
    {
      'Qui écrit « J’accuse… ! » pour défendre le capitaine Dreyfus ?': 'Émile Zola',
      'Que fait cette loi de 1905 ?': 'Elle sépare les Églises et l’État',
    },
    {
      'Comment appelle-t-on l’espace intérieur qu’un port dessert par la route, le rail et les fleuves ?': 'L’hinterland',
      'Comment appelle-t-on la concentration des hommes et des activités au bord de la mer ?': 'La littoralisation',
    },
  ],
  PREMIERE_PRO: [
    {
      'Quelle machine, perfectionnée par James Watt au XVIIIe siècle, fait tourner les usines et les navires du XIXe siècle ?': 'La machine à vapeur',
      'Quelle source d’énergie alimente surtout les machines à vapeur du XIXe siècle ?': 'Le charbon',
    },
    {
      'Comment appelle-t-on la domination d’un territoire et de sa population par un pays étranger qui s’y installe ?': 'La colonisation',
      'En 1830, quel territoire d’Afrique du Nord la France commence-t-elle à conquérir ?': 'L’Algérie',
    },
    {
      'Quelle ville devient la capitale de l’Italie unifiée en 1871 ?': 'Rome',
      'Quel chef des Chemises rouges conquiert la Sicile et Naples en 1860 ?': 'Garibaldi',
    },
    {
      'Que signe-t-on à Rethondes, le 11 novembre 1918 ?': 'L’armistice',
      'Comment appelle-t-on la guerre que mènent les soldats sur le front de l’Ouest, de la fin de 1914 à 1918, enterrés face à face ?': 'La guerre de tranchées',
    },
    {
      'Comment appelle-t-on ce passage d’une marchandise d’un moyen de transport à un autre ?': 'L’intermodalité',
      'Comment appelle-t-on ce transfert d’une production vers un pays où elle coûte moins cher ?': 'Une délocalisation',
    },
    {
      'Quelle monnaie la plupart des pays de l’Union européenne partagent-ils ?': 'L’euro',
      'Comment appelle-t-on la concentration des populations, des activités et des fonctions de commandement dans les plus grandes villes ?': 'La métropolisation',
    },
  ],
  TERMINALE: [
    {
      'Dans quelle ville le krach du « jeudi noir » éclate-t-il ?': 'New York',
      'Quel président lance le New Deal ?': 'Franklin D. Roosevelt',
    },
    {
      'Quelle bataille marque ce tournant de la guerre à l’Est ?': 'Stalingrad',
      'Où les Alliés débarquent-ils, le 6 juin 1944 ?': 'En Normandie',
    },
    {
      'Comment appelle-t-on cette crise d’octobre 1962 ?': 'La crise de Cuba',
      'Quelle organisation naît de cette Charte ?': 'L’ONU',
    },
    {
      'Qui est le premier président de la Ve République ?': 'Charles de Gaulle',
      'Dans quelle ville se tient cette conférence, où le tiers-monde s’affirme sur la scène internationale ?': 'Bandung',
    },
    {
      'Comment s’appelle ce traité ?': 'Le traité de Maastricht',
      'Qui est ce garde des Sceaux ?': 'Robert Badinter',
      'Qui est cette ministre ?': 'Simone Veil',
    },
    {
      'Comment appelle-t-on la mise en relation de toutes les parties du monde par des flux de marchandises, de capitaux, de personnes et d’informations ?': 'La mondialisation',
      'Comment s’appelle l’espace, jusqu’à 200 milles marins des côtes, où un État exploite seul les ressources ?': 'La zone économique exclusive',
      'Quel passage relie la mer Méditerranée à la mer Rouge ?': 'Le canal de Suez',
    },
  ],
  TERMINALE_TECHNO: [
    {
      'En quelle année Hitler devient-il chancelier de l’Allemagne ?': '1933',
      'Quel dirigeant impose sa dictature à l’URSS à partir de la fin des années 1920 ?': 'Staline',
    },
    {
      'Qui lance depuis Londres, le 18 juin 1940, un appel à continuer le combat ?': 'Charles de Gaulle',
      'Comment appelle-t-on la ligne qui sépare la zone occupée de la zone libre, à partir de 1940 ?': 'La ligne de démarcation',
    },
    {
      'Dans quelle ville sont jugés, en 1945-1946, les principaux dirigeants nazis ?': 'Nuremberg',
      'Quelle organisation naît de cette Charte ?': 'L’ONU',
      'En quelle année le mur de Berlin tombe-t-il ?': '1989',
    },
    {
      'Dans quelle ville se tient cette conférence, où le tiers-monde s’affirme sur la scène internationale ?': 'Bandung',
      'Quels accords, signés en mars 1962, mènent à l’indépendance de l’Algérie ?': 'Les accords d’Évian',
    },
    {
      'Comment s’appelle ce traité ?': 'Le traité de Maastricht',
      'Quels accords suppriment peu à peu les contrôles des personnes aux frontières entre de nombreux pays européens ?': 'Les accords de Schengen',
    },
    {
      'Comment appelle-t-on un lieu où les marchandises passent d’un mode de transport à un autre ?': 'Une plateforme multimodale',
      'Comment appelle-t-on une personne qui vit dans un pays et va travailler chaque jour dans le pays voisin ?': 'Un travailleur frontalier',
    },
  ],
  TERMINALE_PRO: [
    {
      'Comment appelle-t-on la période de forte croissance que connaît la France de 1945 à 1975 environ ?': 'Les Trente Glorieuses',
      'Quel choc met fin à la période de forte croissance, en 1973 ?': 'Le choc pétrolier',
    },
    {
      'Quel plan américain aide l’Europe de l’Ouest à se reconstruire à partir de 1947 ?': 'Le plan Marshall',
      'Comment appelle-t-on l’affrontement entre les États-Unis et l’URSS, de 1947 à 1991, sans guerre directe entre eux ?': 'La guerre froide',
    },
    {
      'Depuis 1962, comment le président de la République est-il élu en France ?': 'Au suffrage universel direct',
      'Qui est le premier président de la Ve République ?': 'Charles de Gaulle',
    },
    {
      'Comment appelle-t-on une entreprise qui produit et vend dans de nombreux pays ?': 'Une firme transnationale',
      'Comment appelle-t-on la concentration des hommes et des activités au bord de la mer ?': 'La littoralisation',
    },
    {
      'Comment appelle-t-on le recul du rivage sous l’action de la mer ?': 'L’érosion côtière',
      'Quel accord international, adopté en 2015, engage les pays à limiter le réchauffement climatique ?': 'L’accord de Paris',
    },
    {
      'Comment s’appelle l’espace, jusqu’à 200 milles marins des côtes, où un État exploite seul les ressources ?': 'La zone économique exclusive',
      'Quel traité de 1957 crée la Communauté économique européenne ?': 'Le traité de Rome',
    },
  ],
};

const REPONSES_ANGLAIS = {
  SECONDE: [
    {
      'Last night, Mr Penrose ___ the key in his coat pocket.': 'carried',
      'When he woke up this morning, he realised that someone ___ the key.': 'had taken',
      'When Mr Penrose was young, the fishermen ___ their nets by hand.': 'used to repair',
      'By the time Mr Penrose reached the quay, all the fishermen ___.': 'had arrived',
    },
    {
      'The footprints are fresh and go straight to the gates. Someone ___ walked here this morning.': 'must have',
      'Something is shining on top of the old crane. There ___ be something metal up there.': 'must',
      'Nobody saw who took the key. It ___ been a tourist, or maybe a fisherman.': 'might have',
      'The gates are locked and the key is missing. The boats ___ leave the harbour now!': 'can’t',
    },
    {
      'The crane ___ stands on the quay is more than a hundred years old.': 'which',
      'Mrs Tregarth, ___ son works on a fishing boat, saw a stranger last night.': 'whose',
      'The fishermen repair their boats ___, without any help.': 'themselves',
      'This is the boathouse ___ the fishermen keep their nets.': 'where',
    },
    {
      'What is the capital of Australia?': 'Canberra',
      'Which two languages are official in Canada at the federal level?': 'English and French',
      'Most members of the Commonwealth were once…': 'part of the British Empire',
      'What is the capital of Canada?': 'Ottawa',
    },
    {
      'A fourth message says: “Break a leg in the boat race tomorrow!” What does the writer want to do?': 'wish you good luck',
      'A third message says: “It’s raining cats and dogs: no fishing today!” What was the weather like?': 'It was raining very hard.',
      'Another message says: “I was over the moon when I caught my first lobster.” How did the writer feel?': 'extremely happy',
      'A message says: “Fixing this old engine is a piece of cake!” What does it mean?': 'It is very easy.',
    },
    {
      'What is the tone of the note?': 'warm and apologetic',
      'Why did Tom borrow the key?': 'to take his boat out at night',
      'What does the note suggest about Tom and Mr Penrose?': 'They have known each other for a long time.',
      '“I should have asked you first, I know.” This suggests that Tom…': 'feels a little guilty',
    },
  ],
  SECONDE_PRO: [
    {
      'You need to tighten a nut. Which tool do you use?': 'a spanner',
      'The tyre is flat. What do you need?': 'a pump',
      'On a bike, you sit on the…': 'saddle',
      'You push the ___ with your feet.': 'pedals',
    },
    {
      'Last Monday, a customer ___ his old bike to the workshop.': 'brought',
      'Last week, the apprentice ___ three bikes.': 'fixed',
      'Yesterday, Mrs Okafor ___ the workshop at six.': 'left',
    },
    {
      'You ___ leave tools on the floor: someone could fall.': 'mustn’t',
      'You ___ wear gloves when you use the cleaning oil.': 'must',
      'Customers ___ pay for a safety check: it is free.': 'don’t have to',
    },
    {
      'Mrs Okafor left you ___ useful advice on a sticky note.': 'some',
      'We need ___ new tyres: there is only one left.': 'some',
      'There isn’t ___ oil left in the can.': 'much',
    },
    {
      'When will Mr Hughes collect his bike?': 'tomorrow morning',
      'Where is the new chain?': 'in the red locker',
      'What does the blue bike need?': 'a new chain',
      'Why did Ada leave early?': 'Her daughter is ill.',
    },
    {
      'Ada, ___ daughter is ill, will be back on Monday.': 'whose',
      'The key ___ opens the red locker was in the pump box.': 'which',
      'Mr Hughes is the customer ___ rides to work every day.': 'who',
      'This is the workshop ___ you are learning your job.': 'where',
    },
  ],
  PREMIERE: [
    {
      'Maine is on the coast of which ocean?': 'the Atlantic Ocean',
      'Which country borders Maine to the north?': 'Canada',
      'Maine is part of New England. Which state is also in New England?': 'Massachusetts',
    },
    {
      'If you ___ the generator last week, it would have started.': 'had checked',
      'If the power comes back, we ___ broadcast the midnight show.': 'will',
      'If I ___ an engineer, I would fix the transmitter myself.': 'were',
      'If we had installed a lightning rod, the antenna ___ damaged.': 'wouldn’t have been',
    },
    {
      'Stay at home tonight ___ stay safe.': 'in order to',
      '___ the station is small, thousands of people listen to it every night.': 'Although',
      'The roads are flooded. ___, the schools will be closed tomorrow.': 'As a result',
      '___ the storm, the lighthouse is still shining.': 'Despite',
    },
    {
      'Ms Rivera isn’t sure where the spare fuse is. She ___ left it in the studio.': 'may have',
      'The cable is burnt and smells of smoke. The lightning ___ hit it.': 'must have',
      'Luckily, you ___ call an engineer: the technician explained everything on the phone.': 'didn’t have to',
      'The generator ran out of fuel. Someone ___ filled it up before the storm!': 'should have',
    },
    {
      'What changed the year after the speech?': 'A law banned discrimination in public places.',
      'In the text, “segregation” means…': 'separating people because of their race',
      'What did the marchers demand?': 'equal rights for Black Americans',
      'Where did Martin Luther King give his speech?': 'in front of the Lincoln Memorial',
    },
    {
      'You say on air: “This show isn’t only Ms Rivera’s idea; it’s ___ too.”': 'mine',
      'When the show begins, Ms Rivera and the technician congratulate ___ on the phone.': 'each other',
      'The old headphones are broken, so you take new ___ from the drawer.': 'ones',
      'Ms Rivera says: “The technician and I taught ___ to use this old equipment.”': 'ourselves',
    },
  ],
  PREMIERE_TECHNO: [
    {
      'The leaves are dry and hang down. The plants are…': 'wilting',
      'Which device measures the temperature?': 'a thermometer',
      'A long period without rain is…': 'a drought',
      'To give water to plants is to ___ them.': 'water',
    },
    {
      'Why is there no water in zone B?': 'The pump does not respond.',
      'What happened first?': 'The sensor found dry soil.',
      'Which zone has a problem?': 'zone B',
    },
    {
      'The tank is still full. The plants ___ received much water today.': 'can’t have',
      'There is water on the floor. The pipe ___ come off during the day.': 'must have',
      'Nobody knows who moved the pipe. It ___ been the cleaner.': 'might have',
    },
    {
      'Zone A is fine, ___ zone B is very dry.': 'whereas',
      '___ the alarm, nobody came to the greenhouse.': 'Despite',
      'The pipe was disconnected. ___, zone B got no water.': 'As a result',
      'The plants in zone B are wilting ___ the pump stopped working.': 'because',
    },
    {
      'If the soil gets too dry, the system ___ send a message to your phone.': 'will',
      'If we ___ a second pump, zone B would get water even during a failure.': 'had',
      'If the pipe had been fixed properly, the plants ___.': 'wouldn’t have wilted',
    },
    {
      '“Is this report yours?” – “Yes, it’s ___.”': 'mine',
      'Some plants are dead. We will replace them with new ___.': 'ones',
      'Mr Diaz and you congratulate ___ on the good work.': 'each other',
      'Mr Diaz says: “The students built this greenhouse ___, ten years ago.”': 'themselves',
    },
  ],
  PREMIERE_PRO: [
    {
      'The big building where parcels are stored before delivery is the…': 'warehouse',
      'The customer is not at home. You leave a card in the…': 'letterbox',
      'The customer writes their name on your screen to confirm the delivery. It is their…': 'signature',
    },
    {
      'Which parcel must you carry carefully?': 'parcel 2',
      'Why must you ring twice at the third address?': 'The customer works at night.',
      'Where do you turn left?': 'at the church',
      'Why can’t you take Mill Road today?': 'The bridge is closed.',
    },
    {
      'The parcel is heavy, ___ the cargo bike can carry it.': 'but',
      'Mill Road is closed, ___ I am taking Canal Street.': 'so',
      '___, I go to the bakery. Then I deliver the fragile parcel.': 'First',
      'I am late ___ the bridge is closed.': 'because',
    },
    {
      'If I had a van, I ___ deliver faster.': 'would',
      'If you ___ the fragile parcel, it will break.': 'drop',
      'If the customer isn’t at home, I ___ leave a card.': 'will',
    },
    {
      'Nobody knows who left the gate open. It ___ been the new driver.': 'might have',
      'All the cargo bikes are still here. A thief ___ come in.': 'can’t have',
      'The padlock isn’t broken. Someone ___ opened it with a key.': 'must have',
    },
    {
      'The two drivers help ___ to close the heavy gate.': 'each other',
      'This key isn’t the manager’s. Is it ___?': 'yours',
      'The old padlock is rusty. Let’s buy a new ___.': 'one',
    },
  ],
  TERMINALE: [
    {
      'Which nation of the UK shares a land border with the Republic of Ireland?': 'Northern Ireland',
      'Which two houses make up the UK Parliament?': 'the House of Commons and the House of Lords',
      'In which city does the Scottish Parliament sit?': 'Edinburgh',
      'What is the capital of Wales?': 'Cardiff',
    },
    {
      'Translate: « Il a assisté à la réunion de l’équipe hier. »': 'He attended the team meeting yesterday.',
      'Translate: « Notre cheffe d’équipe est très sympathique. »': 'Our team leader is very nice.',
      'Translate: « La glace fondra éventuellement. »': 'The ice may melt.',
      'Translate: « Actuellement, la station n’envoie aucune donnée. »': 'Currently, the station is not sending any data.',
    },
    {
      'Your email begins with “Dear Professor Hughes,”. How should it end, in British English?': 'Yours sincerely,',
      'Which sentence is the most formal?': 'I would be grateful if you could send us the latest data.',
      'In “The university will look into the problem”, what does “look into” mean?': 'investigate',
    },
    {
      '___ worries Dr Morgan most is the missing data.': 'What',
      'Not only ___ the antenna under the snow, but it also cut the main cable.': 'did the storm bury',
      'Hardly ___ the team arrived when the lights went out.': 'had',
      'Never ___ such a strange failure.': 'have we seen',
    },
    {
      'Dr Morgan gave us some useful advice.': 'Dr Morgan gave us some useful advice.',
      'The equipment is very old.': 'The equipment is very old.',
      'This information is important.': 'This information is important.',
      'The team made a two-day journey.': 'The team made a two-day journey.',
    },
    {
      'What is the tone of the end of the page?': 'calm and reassuring',
      'Why did the station stop sending data?': 'Ana unplugged the main cable on purpose.',
      'Why did Ana unplug the cable?': 'to protect the computers',
      'According to Ana, what matters most?': 'the people',
    },
  ],
  TERMINALE_TECHNO: [
    {
      'Which river flows through London?': 'the Thames',
      'The dome of St Paul’s rises above the City. What is St Paul’s?': 'a cathedral',
      'Where does the UK Parliament sit?': 'in the Palace of Westminster',
      'Which two houses make up the UK Parliament?': 'the House of Commons and the House of Lords',
    },
    {
      'What is the best way to check a piece of news?': 'compare several reliable sources',
      'A post says: “Share before it’s deleted!” Why is this a warning sign?': 'It rushes you so you don’t check.',
      'Three posts appear online. Which one is most likely fake news?': 'Aliens hacked the grid! Share now!',
    },
    {
      '“The lights will be back soon.” Which version is the most formal?': 'Power will be restored shortly.',
      'Which sentence suits an official message?': 'We apologise for any inconvenience.',
      'Your email begins with “Dear Sir or Madam,”. How should it end, in British English?': 'Yours faithfully,',
    },
    {
      'The police are directing the traffic.': 'The police are directing the traffic.',
      'This information comes from the council.': 'This information comes from the council.',
      'The equipment is very modern.': 'The equipment is very modern.',
      'The engineers replaced a ten-metre cable.': 'The engineers replaced a ten-metre cable.',
    },
    {
      'Were the hospitals affected?': 'No, they have their own generators.',
      'According to the engineer, what is the real problem?': 'the software',
      'What will come back first?': 'the traffic lights',
      'Why did the engineers switch off the district?': 'to prevent a fire',
    },
    {
      'Translate: « Le courant reviendra éventuellement ce soir. »': 'Power may come back tonight.',
      'Translate: « Actuellement, le logiciel redémarre. »': 'Currently, the software is restarting.',
      'Translate: « Il faut contrôler les câbles. »': 'We need to check the cables.',
      'Translate: « Ce capteur est très sensible. »': 'This sensor is very sensitive.',
    },
  ],
  TERMINALE_PRO: [
    {
      'Look! The red light ___ on and off.': 'is flashing',
      'The last train usually ___ at 22:15.': 'leaves',
      'Yesterday, the signal ___ perfectly.': 'worked',
      '___ the technician know about the problem?': 'Does',
    },
    {
      'What must you do first?': 'switch off the power',
      'How do you connect the wires?': 'each wire to the same colour',
      'Why did Sam leave?': 'for an emergency on another line',
      'Is the signal broken?': 'No, a wire came off.',
    },
    {
      'A passenger asks when the train will leave. What is the best answer?': 'I’m sorry, there is a short delay.',
      'Which sentence is the most polite?': 'Could you please stay behind the yellow line?',
      'Which announcement suits a station?': 'We apologise for the delay to this service.',
    },
    {
      'The two men are checking the wires.': 'The two men are checking the wires.',
      'The equipment is in the box.': 'The equipment is in the box.',
      'I need two screwdrivers.': 'I need two screwdrivers.',
    },
    {
      'Translate: « Actuellement, le train attend sur le quai. »': 'Currently, the train is waiting at the platform.',
      'Translate: « Le conducteur est en retard. »': 'The driver is late.',
      'Translate: « Ne touche pas les fils ! »': 'Don’t touch the wires!',
      'Translate: « Il faut couper le courant. »': 'You must switch off the power.',
    },
    {
      'Today is ___ day of the summer.': 'the hottest',
      'The red wire is ___ than the blue one.': 'longer',
      'The new signal is ___ than the old one.': 'more reliable',
      'Sam is ___ technician in the team.': 'the best',
    },
  ],
};

/** La clé d'une manche dans la table d'exactitude : la question, sauf quand elle ne distingue pas la variante. */
const cleDe = (m) => (m.question === 'Choose the correct sentence.' ? m.bonne : m.question);

describe.each([
  ['escape-histoire-geo-lycee', escapeHG, REPONSES_HG],
  ['escape-anglais-lycee', escapeAnglais, REPONSES_ANGLAIS],
])('%s — l’exactitude', (nom, jeu, REPONSES) => {
  const beaucoup = Array.from({ length: 300 }, (_, i) => (i % 2 ? (i + 1) * 7919 + 1758000000000 : i + 1));

  it('la table couvre les huit classes', () => {
    expect(Object.keys(REPONSES).sort()).toEqual([...jeu.CLASSES].sort());
  });

  it.each(jeu.CLASSES)('%s : chaque bonne réponse est celle de la table, et jamais un piège', (niveau) => {
    const ecarts = [];
    graines.forEach((g) => jeu.serie(g, niveau).forEach((m, i) => {
      const attendue = REPONSES[niveau][i][cleDe(m)];
      if (attendue === undefined) ecarts.push([i, 'question non relue', m.question]);
      else if (m.bonne !== attendue) ecarts.push([i, m.question, m.bonne, attendue]);
      if (Object.keys(m.pieges).includes(m.bonne)) ecarts.push([i, 'bonne en piège', m.bonne]);
      if (Object.keys(m.pieges).some((p) => p.trim().toLowerCase() === m.bonne.trim().toLowerCase())) {
        ecarts.push([i, 'piège identique à la bonne', m.bonne]);
      }
    }));
    expect(ecarts).toEqual([]);
  });

  it.each(jeu.CLASSES)('%s : toutes les questions de la table finissent par sortir', (niveau) => {
    const vues = REPONSES[niveau].map(() => new Set());
    beaucoup.forEach((g) => jeu.serie(g, niveau).forEach((m, i) => vues[i].add(cleDe(m))));
    const manquantes = REPONSES[niveau].flatMap((table, i) => Object.keys(table).filter((q) => !vues[i].has(q)));
    expect(manquantes).toEqual([]);
  });
});

describe('les repères qu’on ne doit jamais trahir', () => {
  const toutes = (jeu, niveau) => graines.flatMap((g) => jeu.serie(g, niveau));

  it('histoire : quand la question et le récit donnent la même sorte de repère, ils ne se contredisent pas', () => {
    // Les dates du récit et de la question d'une même étape restent dans une fenêtre de dix ans.
    const ecarts = [];
    escapeHG.CLASSES.forEach((niveau) => toutes(escapeHG, niveau).forEach((m) => {
      const anneesQuestion = (m.question.match(/\b\d{4}\b/g) ?? []).map(Number);
      const anneesRecit = (m.recit.match(/\b\d{4}\b/g) ?? []).map(Number);
      anneesQuestion.forEach((a) => anneesRecit
        .filter((b) => Math.abs(a - b) > 10)
        .forEach((b) => ecarts.push([m.question, a, b])));
    }));
    expect(ecarts).toEqual([]);
  });

  it('histoire : quand la réponse est une année, le récit ne la donne pas', () => {
    const ecarts = [];
    escapeHG.CLASSES.forEach((niveau) => toutes(escapeHG, niveau)
      .filter((m) => /^\d{4}$/.test(m.bonne) && m.recit.includes(m.bonne))
      .forEach((m) => ecarts.push([niveau, m.question])));
    expect(ecarts).toEqual([]);
  });

  it('histoire : les pièges de date sont bien d’une autre époque, et leur phrase le dit en lettres', () => {
    // Quelques repères vérifiés un à un : la phrase de chaque piège nomme sa vraie date.
    const P = escapeHG.PHRASES;
    expect(P['2de-constantinople-croisade']).toContain('douze cent quatre');
    expect(P['2de-grenade']).toContain('quatorze cent quatre-vingt-douze');
    expect(P['2de-henri-iv']).toContain('quinze cent quatre-vingt-dix-huit');
    expect(P['2de-grande-charte']).toContain('douze cent quinze');
    expect(P['2de-habeas-corpus']).toContain('seize cent soixante-dix-neuf');
    expect(P['2pro-magellan']).toContain('quinze cent dix-neuf');
    expect(P['1re-congres-berlin']).toContain('dix-huit cent soixante-dix-huit');
    expect(P['1re-traite-versailles']).toContain('vingt-huit juin dix-neuf cent dix-neuf');
    expect(P['1tec-waterloo']).toContain('juin dix-huit cent quinze');
    expect(P['1tec-greve']).toContain('dix-huit cent soixante-quatre');
    expect(P['1pro-maroc']).toContain('dix-neuf cent douze');
    expect(P['1pro-turin']).toContain('dix-huit cent soixante et un');
    expect(P['tle-provence']).toContain('quinze août dix-neuf cent quarante-quatre');
    expect(P['tle-rome']).toContain('dix-neuf cent cinquante-sept');
    expect(P['tle-eaux-territoriales']).toContain('douze milles');
    expect(P['ttec-1923']).toContain('dix-neuf cent vingt-trois');
    expect(P['ttec-1961']).toContain('dix-neuf cent soixante et un');
    expect(P['ttec-geneve']).toContain('dix-neuf cent cinquante-quatre');
    expect(P['tpro-kyoto']).toContain('dix-neuf cent quatre-vingt-dix-sept');
    expect(P['tpro-krach']).toContain('dix-neuf cent vingt-neuf');
  });

  it('anglais : les pièges de grammaire sont bien ceux qu’on nomme', () => {
    const FORMES = {
      'orthographe-ied': /yed$/,
      'used-to-forme': /^use to /,
      'used-to-base': /^used to \w+ing$/,
      'apres-if': /^would/,
      'apres-if-will': /^will /,
      'irreel-passe-would': /^hadn’t/,
      'modal-passe-have': /^(should|must|may)$/,
      'reflechi-forme': /^theirselves$/,
      'inversion-negatif': /^(we|the \w+) /,
      'auxiliaire-did-base': /^did .+ (\w+ed|hid)$/,
      'adjectif-invariable': /\b[a-z]+-[a-z]+s [a-z]+/,
      indenombrable: /informations|advices|An information|a useful advice|equipments|An equipment/,
      'police-pluriel': /police is|polices/,
      actually: /^Actually/,
      eventually: /eventually/,
      'assist-attend': /assisted/,
      sympathetic: /sympath(et)?ic/,
      'sensible-sensitive': /sensible\.$/,
      'control-check': /control /,
      'cant-mustnt': /^mustn’t$/,
      'mustnt-certitude': /^mustn’t$/,
      'verbe-irregulier': /^(leaved|bringed)$/,
      'troisieme-personne-s': /^leave$/,
      'pluriel-irregulier': /mans/,
      'superlatif-irregulier': /goodest/,
      'comparatif-court': /^more long$/,
      'modal-sans-to': /must to /,
    };
    const ecarts = [];
    escapeAnglais.CLASSES.forEach((niveau) => toutes(escapeAnglais, niveau).forEach((m) => {
      Object.entries(m.pieges)
        .filter(([, piege]) => FORMES[piege])
        .forEach(([cle, piege]) => { if (!FORMES[piege].test(cle)) ecarts.push([piege, cle]); });
    }));
    expect(ecarts).toEqual([]);
  });

  it('anglais : la bonne forme d’hypothèse suit la règle des trois types', () => {
    // Les étapes d'hypothèse : 1re (deuxième cadenas), 1re techno (cinquième), 1re pro (quatrième).
    const ETAPES = { PREMIERE: '1re-etape-2', PREMIERE_TECHNO: '1tec-etape-5', PREMIERE_PRO: '1pro-etape-4' };
    const hypotheses = Object.entries(ETAPES)
      .flatMap(([niveau, consigne]) => toutes(escapeAnglais, niveau).filter((m) => m.consigne === consigne));
    expect(hypotheses.length).toBeGreaterThan(0);
    const ecarts = hypotheses.filter((m) => {
      const phrase = m.question.replace('___', m.bonne);
      const [si, principale] = phrase.split(/,\s*/);
      // Irréel du passé : had suivi d'un participe (et non « had a van », simple prétérit de have).
      if (/^If [\w’ ]+? had (?!an?\b|the\b)\w+/.test(si)) return !/would(n’t)? have/.test(principale);
      if (/^If [\w’ ]+? (were|had|was)\b/.test(si)) return !/\bwould\b/.test(principale) || /would have/.test(principale);
      return !/\bwill\b/.test(principale);
    });
    expect(ecarts).toEqual([]);
  });
});
