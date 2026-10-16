/**
 * L'ESCAPE GAME D'HISTOIRE-GÉOGRAPHIE DU LYCÉE — avec Salim, de la 2de à la
 * terminale, dans les trois voies.
 *
 * Une histoire par classe, celle que raconte son illustration (08/10/2026 :
 * le client a fait illustrer chaque escape game ; le titre est celui peint
 * sur la couverture). Six cadenas chacune, dans l'ordre du récit : des étapes
 * d'histoire dans l'ordre chronologique du programme, puis de géographie.
 * Chaque étape tire l'une de ses variantes (un document, une question, trois
 * choix) et mélange ses choix ; les étapes, elles, gardent l'ordre de
 * l'histoire. Les six pièces forment un mot :
 *   - 2de « Le phare de la Méditerranée » → ESCALE (Athènes et Rome, la
 *     Méditerranée médiévale, la Renaissance et l'Atlantique, l'absolutisme et
 *     le modèle anglais, les Lumières et les sciences, puis le développement) ;
 *   - 2de pro « Le mystère des routes marchandes » → POIVRE (la Méditerranée
 *     antique, les épices du Moyen Âge, les grandes découvertes, les produits
 *     d'Amérique, puis les mobilités et les ressources d'aujourd'hui) ;
 *   - 1re « Le dernier train de l'enquête » → LEVIER (la Révolution et
 *     l'Empire, 1815-1851, les unités allemande et italienne, la IIIe
 *     République, la Grande Guerre, puis la métropolisation et les espaces
 *     productifs) ;
 *   - 1re techno « Les quais de la révolution » → VAPEUR (la Révolution,
 *     Napoléon et Vienne, 1848, le Second Empire, la République avant 1914,
 *     puis les espaces productifs) ;
 *   - 1re pro « La cargaison des deux mondes » → NAVIRE (la vapeur et le
 *     charbon, la colonisation, l'unité italienne, la Grande Guerre, puis la
 *     production, le transport et l'Union européenne) ;
 *   - Tle « Le réseau du monde » → MONDES (1929, la Seconde Guerre mondiale,
 *     l'ONU et la guerre froide, la décolonisation et la Ve République,
 *     1974-1992, puis les mers et la mondialisation) ;
 *   - Tle techno « Le barrage des frontières » → OUVERT (les totalitarismes,
 *     la France de 1940, l'ordre de 1945 et la guerre froide, la fin des
 *     empires, le projet européen, puis les flux qui traversent la frontière) ;
 *   - Tle pro « L'enquête des territoires » → CARTES (les Trente Glorieuses,
 *     la reconstruction et la guerre froide, la Ve République, la
 *     mondialisation, l'environnement, puis l'Europe et la mer).
 *
 * Les voies technologiques ont leurs propres compétences (HG_1TEC_…,
 * HG_TTEC_…) ; la voie professionnelle n'en a pas dans le référentiel et
 * prend celles de la même année en voie générale (le repli de l'API). Elle a
 * ses notions essentielles et des phrases plus courtes.
 *
 * EXACTITUDE : chaque question n'appelle qu'une réponse, un repère canonique
 * du programme (date, acteur, lieu, notion), que le récit rend univoque.
 * Chaque piège est un repère réel d'une autre époque ou d'un autre lieu, que
 * sa phrase nomme et replace. Rien de controversé, aucun chiffre qui vieillit
 * (ni population, ni nombre de membres d'une organisation).
 *
 * Ce qui se DIT (PHRASES) ne contient aucun chiffre : les dates y sont écrites
 * en lettres, les siècles et les régimes aussi (« cinquième siècle »,
 * « Troisième République »). Les chiffres restent dans le récit et la
 * question, qui sont affichés.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const ESCAPE = true;

export const FAMILLE = {
  cle: 'escape-histoire-geo-lycee',
  titre: 'L’escape game d’histoire-géo',
  matiereCode: 'HISTOIRE_GEO',
};

export const MANCHES = 6;

/** Une variante d'étape : son document, sa question, la bonne réponse, ses pièges et sa phrase d'aide. */
const v = (competence, recit, question, bonne, pieges, aide) => ({
  competence, recit, question, bonne, pieges, aide,
});

/** Les six étapes de chaque classe, dans l'ordre du récit, et le mot que forment leurs pièces. */
const BANQUES = {
  // ———————————————————————————————— 2de : Le phare de la Méditerranée
  SECONDE: {
    prefixe: '2de',
    code: ['E', 'S', 'C', 'A', 'L', 'E'],
    etapes: [
      [
        v(
          'HG_2DE_HIST_MEDITERRANEE',
          'Premier coffre : une amphore frappée d’une chouette, l’emblème d’Athènes, et une maquette du Parthénon. L’étiquette parle du stratège qui fit bâtir ce temple au Ve siècle av. J.-C.',
          'Quel stratège domine la vie politique d’Athènes au milieu du Ve siècle av. J.-C. ?',
          'Périclès',
          { 'Alexandre le Grand': '2de-alexandre', Auguste: '2de-auguste-athenes' },
          '2de-aide-pericles',
        ),
        v(
          'HG_2DE_HIST_MEDITERRANEE',
          'Premier coffre : sous une amphore, un denier romain en argent, frappé du profil d’un homme couronné de laurier. En 27 av. J.-C., le Sénat lui accorde un titre nouveau, qui devient son nom.',
          'Qui devient, en 27 av. J.-C., le premier empereur romain ?',
          'Auguste',
          { 'Jules César': '2de-cesar', Constantin: '2de-constantin' },
          '2de-aide-auguste',
        ),
      ],
      [
        v(
          'HG_2DE_HIST_MEDIEVALE',
          'Deuxième coffre : une croix de tissu rouge, autrefois cousue sur le manteau d’un croisé. En 1095, à Clermont, le pape Urbain II appelle les chevaliers d’Occident à partir vers l’Orient.',
          'Quelle ville les croisés prennent-ils en 1099, au terme de la première croisade ?',
          'Jérusalem',
          { Constantinople: '2de-constantinople-croisade', Grenade: '2de-grenade' },
          '2de-aide-croisade',
        ),
        v(
          'HG_2DE_HIST_MEDIEVALE',
          'Deuxième coffre : le sceau d’un doge et une carte marine du Moyen Âge, ornée d’une grande rose des vents et couverte de ports, de l’Adriatique à la mer Noire. Une cité bâtie sur une lagune y a semé ses comptoirs.',
          'Quelle cité de la lagune, gouvernée par un doge, domine le commerce de la Méditerranée orientale ?',
          'Venise',
          { Florence: '2de-florence', Constantinople: '2de-constantinople-empereur' },
          '2de-aide-venise',
        ),
      ],
      [
        v(
          'HG_2DE_HIST_XVE_XVIE',
          'Troisième coffre : sous la sphère armillaire, un feuillet imprimé en allemand. En 1517, un moine de Wittenberg y dénonce la vente des indulgences en 95 thèses.',
          'Qui est ce moine, à l’origine de la Réforme protestante ?',
          'Martin Luther',
          { 'Jean Calvin': '2de-calvin', 'Érasme': '2de-erasme' },
          '2de-aide-luther',
        ),
        v(
          'HG_2DE_HIST_XVE_XVIE',
          'Troisième coffre : à côté de la sphère armillaire, une carte du monde de la fin du XVe siècle, traversée du nord au sud par une ligne tracée à l’encre. À l’ouest, les terres sont promises à l’Espagne ; à l’est, au Portugal.',
          'Par quel traité, en 1494, l’Espagne et le Portugal se partagent-ils les terres à découvrir ?',
          'Le traité de Tordesillas',
          { 'Le traité de Verdun': '2de-verdun', 'Le traité d’Utrecht': '2de-utrecht' },
          '2de-aide-tordesillas',
        ),
      ],
      [
        v(
          'HG_2DE_HIST_ABSOLUTISME',
          'Quatrième coffre : une gravure de la galerie des Glaces de Versailles et la copie d’un édit d’octobre 1685, signé à Fontainebleau. Il interdit le culte protestant dans tout le royaume.',
          'Quel roi révoque l’édit de Nantes, en 1685 ?',
          'Louis XIV',
          { 'Henri IV': '2de-henri-iv', 'Louis XVI': '2de-louis-xvi' },
          '2de-aide-louis-xiv',
        ),
        v(
          'HG_2DE_HIST_ABSOLUTISME',
          'Quatrième coffre : un parchemin anglais de 1689, laissé par un capitaine de passage. Après la Glorieuse Révolution, Guillaume et Marie acceptent ce texte, qui limite le pouvoir royal : le roi ne peut plus lever d’impôts sans l’accord du Parlement.',
          'Comment s’appelle ce texte de 1689, fondement de la monarchie parlementaire anglaise ?',
          'Le Bill of Rights',
          { 'La Grande Charte': '2de-grande-charte', 'L’Habeas Corpus': '2de-habeas-corpus' },
          '2de-aide-bill-of-rights',
        ),
      ],
      [
        v(
          'HG_2DE_HIST_LUMIERES',
          'Cinquième coffre : un gros volume relié de cuir, le premier tome de l’Encyclopédie, paru en 1751. Ses planches montrent aussi bien les sciences que les métiers, jusqu’aux instruments de marine.',
          'Qui dirige l’Encyclopédie ?',
          'Diderot et d’Alembert',
          { 'Voltaire et Rousseau': '2de-voltaire-rousseau', 'Locke et Newton': '2de-locke-newton' },
          '2de-aide-encyclopedie',
        ),
        v(
          'HG_2DE_HIST_LUMIERES',
          'Cinquième coffre : à côté de la longue-vue, un livre en latin de 1687, les Principia. Son auteur y explique le mouvement des planètes et la chute des corps par une même loi.',
          'Quel savant anglais énonce la loi de la gravitation universelle ?',
          'Isaac Newton',
          { 'Galilée': '2de-galilee', Copernic: '2de-copernic' },
          '2de-aide-newton',
        ),
      ],
      [
        v(
          'HG_2DE_GEO_DEVELOPPEMENT',
          'Dernier coffre : un planisphère récent, où les pays des deux rives de la Méditerranée, comme ceux du monde entier, sont colorés du rouge au vert. La légende parle d’un indicateur publié chaque année par un programme des Nations unies.',
          'Quel indicateur combine l’espérance de vie, le niveau d’éducation et le revenu par habitant ?',
          'L’IDH',
          { 'Le PIB': '2de-pib', 'Le taux de natalité': '2de-natalite' },
          '2de-aide-idh',
        ),
        v(
          'HG_2DE_GEO_TRANSITIONS',
          'Dernier coffre : un graphique à deux courbes, la natalité et la mortalité d’un pays méditerranéen sur deux siècles. D’abord hautes toutes les deux, elles finissent par baisser l’une après l’autre.',
          'Comment appelle-t-on ce passage d’une natalité et d’une mortalité fortes à une natalité et une mortalité faibles ?',
          'La transition démographique',
          { 'L’exode rural': '2de-exode-rural', 'Le vieillissement': '2de-vieillissement' },
          '2de-aide-transition',
        ),
      ],
    ],
  },

  // ———————————————————————————————— 2de pro : Le mystère des routes marchandes
  SECONDE_PRO: {
    prefixe: '2pro',
    code: ['P', 'O', 'I', 'V', 'R', 'E'],
    etapes: [
      [
        v(
          'HG_2DE_HIST_MEDITERRANEE',
          'Premier ballot : une amphore antique, retrouvée au fond du port. Son étiquette dit qu’au temps de son peuple, toute la Méditerranée était devenue une mer intérieure, entourée par un seul empire.',
          'Quel peuple de l’Antiquité appelait la Méditerranée Mare nostrum, « notre mer » ?',
          'Les Romains',
          { 'Les Vikings': '2pro-vikings', 'Les Aztèques': '2pro-azteques' },
          '2pro-aide-romains',
        ),
        v(
          'HG_2DE_HIST_MEDITERRANEE',
          'Premier ballot : une pièce d’argent frappée d’une chouette, venue de la cité grecque qui inventa la démocratie. Ses navires partaient d’un grand port, Le Pirée.',
          'De quelle cité grecque Le Pirée est-il le port ?',
          'Athènes',
          { Rome: '2pro-rome-grecque', Sparte: '2pro-sparte' },
          '2pro-aide-athenes',
        ),
      ],
      [
        v(
          'HG_2DE_HIST_MEDIEVALE',
          'Deuxième ballot : un sac de poivre et un carnet de marchand, écrit en italien au XIVe siècle. Il parle d’une cité bâtie sur une lagune, gouvernée par un doge, où arrivent les épices d’Orient.',
          'Quelle cité italienne, bâtie sur une lagune, domine le commerce des épices au Moyen Âge ?',
          'Venise',
          { Rome: '2pro-rome-epices', Paris: '2pro-paris' },
          '2pro-aide-venise',
        ),
        v(
          'HG_2DE_HIST_MEDIEVALE',
          'Deuxième ballot : un sac de poivre, au parfum toujours aussi fort. L’étiquette dit qu’il a fait un très long voyage, par la route et par la mer, avant d’arriver ici au Moyen Âge.',
          'D’où vient le poivre vendu en Europe au Moyen Âge ?',
          'D’Asie',
          { 'D’Amérique': '2pro-amerique-epices', 'D’Europe du Nord': '2pro-europe-nord' },
          '2pro-aide-asie',
        ),
      ],
      [
        v(
          'HG_2DE_HIST_XVE_XVIE',
          'Troisième ballot : un rouleau de soie et un journal de bord portugais. Il raconte un voyage commencé en 1497 : les navires ont contourné l’Afrique par le cap de Bonne-Espérance pour atteindre Calicut, en Inde.',
          'Quel navigateur portugais ouvre, en 1498, la route des Indes par le sud de l’Afrique ?',
          'Vasco de Gama',
          { 'Christophe Colomb': '2pro-colomb', Magellan: '2pro-magellan' },
          '2pro-aide-gama',
        ),
        v(
          'HG_2DE_HIST_XVE_XVIE',
          'Troisième ballot : une carte de l’océan Atlantique, avec trois petits navires dessinés à l’encre. Partis du port de Palos en août 1492, ils atteignent en octobre une île des Bahamas.',
          'Pour qui Christophe Colomb traverse-t-il l’Atlantique en 1492 ?',
          'Les Rois catholiques d’Espagne',
          { 'Le roi du Portugal': '2pro-portugal', 'Le roi de France': '2pro-france-colomb' },
          '2pro-aide-colomb',
        ),
      ],
      [
        v(
          'HG_2DE_HIST_XVE_XVIE',
          'Quatrième ballot : un sac de tubercules, inconnus des Européens jusqu’au XVIe siècle. L’étiquette dit qu’ils viennent des montagnes des Andes.',
          'Quelle plante, venue d’Amérique, arrive en Europe après les voyages de Colomb ?',
          'La pomme de terre',
          { 'Le poivre': '2pro-poivre-asie', 'Le riz': '2pro-riz' },
          '2pro-aide-pomme-de-terre',
        ),
        v(
          'HG_2DE_HIST_XVE_XVIE',
          'Quatrième ballot : des fèves brunes et amères. Les Aztèques en faisaient une boisson épicée, bien avant l’arrivée des Espagnols.',
          'Quelle plante d’Amérique sert à fabriquer le chocolat ?',
          'Le cacao',
          { 'La canne à sucre': '2pro-canne', 'Le café': '2pro-cafe' },
          '2pro-aide-cacao',
        ),
      ],
      [
        v(
          'HG_2DE_GEO_MOBILITES',
          'Cinquième ballot : une pile de cartes postales. Aujourd’hui, l’entrepôt est devenu un musée, et chaque été des visiteurs du monde entier viennent voir le port et ses criques, avant de rentrer chez eux.',
          'Comment appelle-t-on le fait de voyager pour ses loisirs, hors de chez soi ?',
          'Le tourisme',
          { 'L’exode rural': '2pro-exode-rural', 'La délocalisation': '2pro-delocalisation' },
          '2pro-aide-tourisme',
        ),
        v(
          'HG_2DE_GEO_MOBILITES',
          'Cinquième ballot : les lettres d’une famille du port, partie vivre de l’autre côté de la mer pour y trouver du travail, et qui s’y est installée pour de bon.',
          'Comment appelle-t-on une personne qui quitte son pays pour s’installer dans un autre ?',
          'Un migrant',
          { 'Un touriste': '2pro-touriste', 'Un frontalier': '2pro-frontalier' },
          '2pro-aide-migrant',
        ),
      ],
      [
        v(
          'HG_2DE_GEO_RESSOURCES',
          'Dernier ballot : au-dessus du port, le vieil aqueduc ne suffit plus. L’été, la ville manque d’eau douce, alors elle en fabrique à partir de l’eau de mer.',
          'Comment appelle-t-on une usine qui transforme l’eau de mer en eau douce ?',
          'Une usine de dessalement',
          { 'Une station d’épuration': '2pro-epuration', 'Un barrage': '2pro-barrage' },
          '2pro-aide-dessalement',
        ),
        v(
          'HG_2DE_GEO_ENERGIE',
          'Dernier ballot : une carte du port d’aujourd’hui. Au large, sur la mer, de grandes hélices blanches tournent au vent et produisent l’électricité de la ville.',
          'Quelle énergie utilise la force du vent ?',
          'L’énergie éolienne',
          { 'L’énergie solaire': '2pro-solaire', 'L’énergie hydraulique': '2pro-hydraulique' },
          '2pro-aide-eolien',
        ),
      ],
    ],
  },

  // ———————————————————————————————— 1re : Le dernier train de l'enquête
  PREMIERE: {
    prefixe: '1re',
    code: ['L', 'E', 'V', 'I', 'E', 'R'],
    etapes: [
      [
        v(
          'HG_1RE_HIST_REVOLUTION_NATION',
          'Premier levier : dans le dossier, un gros livre à la couverture usée, imprimé en 1804, que l’ancêtre de la famille gardait précieusement. Le Premier consul, bientôt empereur, a voulu un même droit pour tous les Français.',
          'Quel texte de 1804 unifie le droit civil des Français ?',
          'Le Code civil',
          { 'Le Concordat': '1re-concordat', 'La Déclaration des droits de l’homme': '1re-ddhc' },
          '1re-aide-code-civil',
        ),
        v(
          'HG_1RE_HIST_REVOLUTION_NATION',
          'Premier levier : dans le dossier, une affiche jaunie de septembre 1792, conservée par l’ancêtre de la famille. La Convention, qui vient de se réunir, abolit la royauté en France.',
          'Quel régime remplace alors la monarchie ?',
          'La Première République',
          { 'Le Consulat': '1re-consulat', 'Le Premier Empire': '1re-premier-empire' },
          '1re-aide-republique',
        ),
      ],
      [
        v(
          'HG_1RE_HIST_RESTAURATION',
          'Deuxième levier : une gravure montre des diplomates en habit, penchés sur une carte de l’Europe. Napoléon vient d’être vaincu, et les monarchies victorieuses redessinent les frontières.',
          'Quelle réunion de 1815 réorganise l’Europe après la chute de Napoléon ?',
          'Le congrès de Vienne',
          { 'Le congrès de Berlin': '1re-congres-berlin', 'Le traité de Versailles': '1re-versailles-1919' },
          '1re-aide-vienne',
        ),
        v(
          'HG_1RE_HIST_RESTAURATION',
          'Deuxième levier : des journaux de 1848, en français, en allemand, en italien et en hongrois. Partout, des révolutionnaires réclament des libertés et le droit des peuples à former une nation.',
          'Comment appelle-t-on cette vague de révolutions qui secoue l’Europe en 1848 ?',
          'Le printemps des peuples',
          { 'Les Trois Glorieuses': '1re-trois-glorieuses', 'La Commune': '1re-commune' },
          '1re-aide-printemps',
        ),
        v(
          'HG_1RE_HIST_AGE_DEMOCRATIQUE',
          'Deuxième levier : un décret d’avril 1848, signé par le gouvernement provisoire de la jeune Deuxième République. Il proclame que nulle terre française ne peut plus porter d’esclaves.',
          'Quel républicain inspire ce décret qui abolit l’esclavage dans les colonies françaises ?',
          'Victor Schœlcher',
          { 'Jules Ferry': '1re-ferry', 'Victor Hugo': '1re-hugo-depute' },
          '1re-aide-schoelcher',
        ),
        v(
          'HG_1RE_HIST_AGE_DEMOCRATIQUE',
          'Deuxième levier : une affiche placardée dans Paris le 2 décembre 1851. Le président de la République y annonce qu’il dissout l’Assemblée nationale.',
          'Qui fait ce coup d’État, un an avant de devenir empereur ?',
          'Louis-Napoléon Bonaparte',
          { 'Napoléon Ier': '1re-napoleon-ier', 'Adolphe Thiers': '1re-thiers' },
          '1re-aide-coup-etat',
        ),
      ],
      [
        v(
          'HG_1RE_HIST_NOUVEAUX_ETATS',
          'Troisième levier : la photographie d’un célèbre tableau. Le 18 janvier 1871, en pleine guerre franco-prussienne, les princes allemands acclament le roi de Prusse, devenu empereur allemand.',
          'Où l’Empire allemand est-il proclamé ?',
          'À Versailles',
          { 'À Berlin': '1re-berlin', 'À Francfort': '1re-francfort' },
          '1re-aide-versailles-1871',
        ),
        v(
          'HG_1RE_HIST_NOUVEAUX_ETATS',
          'Troisième levier : une lettre de 1858, venue de Turin. Le chef du gouvernement du Piémont-Sardaigne y prépare une alliance avec Napoléon III contre l’Autriche.',
          'Qui conduit l’unité italienne par la diplomatie, depuis Turin ?',
          'Cavour',
          { Garibaldi: '1re-garibaldi', Bismarck: '1re-bismarck' },
          '1re-aide-cavour',
        ),
      ],
      [
        v(
          'HG_1RE_HIST_REPUBLIQUE',
          'Quatrième levier : la une du journal L’Aurore, datée du 13 janvier 1898, gardée par l’arrière-grand-père, jeune aiguilleur. Une lettre ouverte au président de la République y accuse l’état-major d’avoir fait condamner un innocent.',
          'Qui écrit « J’accuse… ! » pour défendre le capitaine Dreyfus ?',
          'Émile Zola',
          { 'Victor Hugo': '1re-hugo-mort', 'Jean Jaurès': '1re-jaures' },
          '1re-aide-zola',
        ),
        v(
          'HG_1RE_HIST_REPUBLIQUE',
          'Quatrième levier : le Journal officiel du 11 décembre 1905. Une loi y affirme que la République ne reconnaît, ne salarie ni ne subventionne aucun culte.',
          'Que fait cette loi de 1905 ?',
          'Elle sépare les Églises et l’État',
          { 'Elle rend l’école obligatoire': '1re-ecole-obligatoire', 'Elle donne le vote aux femmes': '1re-vote-femmes' },
          '1re-aide-1905',
        ),
      ],
      [
        v(
          'HG_1RE_HIST_EMBRASEMENT',
          'Cinquième levier : la photographie d’un wagon arrêté dans une clairière de la forêt de Compiègne, au petit matin du 11 novembre 1918. Quelques heures plus tard, les clairons sonnent le cessez-le-feu sur tout le front.',
          'Que signe-t-on à Rethondes, le 11 novembre 1918 ?',
          'L’armistice',
          { 'Le traité de Versailles': '1re-traite-versailles', 'Le traité de Brest-Litovsk': '1re-brest-litovsk' },
          '1re-aide-armistice',
        ),
        v(
          'HG_1RE_HIST_SORTIR_GUERRE',
          'Cinquième levier : un discours de janvier 1918, traduit dans un journal français. Un président y propose quatorze points pour une paix juste, dont une association générale des nations.',
          'Quel président américain propose cette Société des nations ?',
          'Woodrow Wilson',
          { 'Franklin D. Roosevelt': '1re-roosevelt', 'Georges Clemenceau': '1re-clemenceau' },
          '1re-aide-wilson',
        ),
      ],
      [
        v(
          'HG_1RE_GEO_METROPOLISATION',
          'Dernier levier : au fond du dossier, une carte récente du réseau ferré. Les trains à grande vitesse filent vers la grande ville voisine, où vivent aujourd’hui les descendants de la famille, et où se concentrent sièges d’entreprises, universités et aéroport.',
          'Comment appelle-t-on la concentration des populations, des activités et des fonctions de commandement dans les plus grandes villes ?',
          'La métropolisation',
          { 'La périurbanisation': '1re-periurbanisation', 'L’exode rural': '1re-exode-rural' },
          '1re-aide-metropolisation',
        ),
        v(
          'HG_1RE_GEO_PRODUCTIFS',
          'Dernier levier : au fond du dossier, une coupure de presse récente. L’usine dont on voit la cheminée par la fenêtre, où travaillait un arrière-grand-père, a fermé : sa production a été transférée dans un pays où la main-d’œuvre coûte moins cher.',
          'Comment appelle-t-on ce transfert d’une production vers un pays où elle coûte moins cher ?',
          'Une délocalisation',
          { 'Une relocalisation': '1re-relocalisation', 'Une reconversion': '1re-reconversion' },
          '1re-aide-delocalisation',
        ),
      ],
    ],
  },

  // ———————————————————————————————— 1re techno : Les quais de la révolution
  PREMIERE_TECHNO: {
    prefixe: '1tec',
    code: ['V', 'A', 'P', 'E', 'U', 'R'],
    etapes: [
      [
        v(
          'HG_1TEC_HIST_REVOLUTION',
          'Premier caisson : une affiche d’août 1789, presque effacée, collée sur la porte de l’entrepôt. On y lit encore l’article premier d’un texte adopté par l’Assemblée nationale.',
          'Quel texte proclame, en août 1789, que « les hommes naissent et demeurent libres et égaux en droits » ?',
          'La Déclaration des droits de l’homme',
          { 'Le Code civil': '1tec-code-civil', 'Le Bill of Rights': '1tec-bill-of-rights' },
          '1tec-aide-ddhc',
        ),
        v(
          'HG_1TEC_HIST_REVOLUTION',
          'Premier caisson : un journal de septembre 1792, retrouvé au fond d’une caisse. La Convention, qui vient de se réunir, abolit la royauté.',
          'Quel régime remplace la monarchie en septembre 1792 ?',
          'La République',
          { 'L’Empire': '1tec-empire', 'La monarchie constitutionnelle': '1tec-monarchie-constit' },
          '1re-aide-republique',
        ),
      ],
      [
        v(
          'HG_1TEC_HIST_NAPOLEON_VIENNE',
          'Deuxième caisson : un tableau montre l’Empereur à cheval, au soleil levant, le 2 décembre 1805. Ce jour-là, en Moravie, il bat les armées de l’Autriche et de la Russie.',
          'Où Napoléon remporte-t-il sa plus célèbre victoire, en décembre 1805 ?',
          'À Austerlitz',
          { 'À Waterloo': '1tec-waterloo', 'À Trafalgar': '1tec-trafalgar' },
          '1tec-aide-austerlitz',
        ),
        v(
          'HG_1TEC_HIST_NAPOLEON_VIENNE',
          'Deuxième caisson : une gravure montre des diplomates en habit, penchés sur une carte de l’Europe. Napoléon vient d’être vaincu, et les monarchies victorieuses redessinent les frontières.',
          'Quelle réunion de 1815 réorganise l’Europe après la chute de Napoléon ?',
          'Le congrès de Vienne',
          { 'Le congrès de Berlin': '1re-congres-berlin', 'Le traité de Versailles': '1re-versailles-1919' },
          '1re-aide-vienne',
        ),
      ],
      [
        v(
          'HG_1TEC_HIST_1848',
          'Troisième caisson : une chaîne brisée, posée sur un décret d’avril 1848, signé par le gouvernement provisoire de la jeune République. Il proclame que nulle terre française ne peut plus porter d’esclaves.',
          'Quel républicain inspire ce décret qui abolit l’esclavage dans les colonies françaises ?',
          'Victor Schœlcher',
          { 'Jules Ferry': '1re-ferry', 'Victor Hugo': '1re-hugo-depute' },
          '1re-aide-schoelcher',
        ),
        v(
          'HG_1TEC_HIST_1848',
          'Troisième caisson : une affiche de mars 1848, collée sur le mur de l’entrepôt. Le gouvernement provisoire de la jeune République y annonce que désormais, pour choisir l’Assemblée, le docker pèsera autant que le riche armateur.',
          'Quel droit tous les hommes de 21 ans et plus obtiennent-ils en mars 1848 ?',
          'Le droit de vote',
          { 'Le droit de grève': '1tec-greve', 'Le droit à l’école gratuite': '1tec-ecole' },
          '1tec-aide-suffrage',
        ),
      ],
      [
        v(
          'HG_1TEC_HIST_SECOND_EMPIRE',
          'Quatrième caisson : un portrait officiel de l’empereur, accroché dans le bureau de la compagnie. Sous son règne, les chemins de fer, les grands travaux et les navires à vapeur transforment le port.',
          'Qui gouverne la France sous le Second Empire, de 1852 à 1870 ?',
          'Napoléon III',
          { 'Napoléon Ier': '1tec-napoleon-ier', 'Louis-Philippe': '1tec-louis-philippe' },
          '1tec-aide-napoleon-iii',
        ),
        v(
          'HG_1TEC_HIST_SECOND_EMPIRE',
          'Quatrième caisson : un plan de Paris de 1860, couvert de larges boulevards tracés à la règle. À Paris comme dans ce port, l’empereur veut des villes modernes, aérées et faciles à traverser.',
          'Quel préfet transforme Paris par de grands travaux sous le Second Empire ?',
          'Haussmann',
          { Eiffel: '1tec-eiffel', Vauban: '1tec-vauban' },
          '1tec-aide-haussmann',
        ),
      ],
      [
        v(
          'HG_1TEC_HIST_PROJET_REPUBLICAIN',
          'Cinquième caisson : le Journal officiel du 11 décembre 1905, arrivé par le train du soir. Une loi y affirme que la République ne reconnaît, ne salarie ni ne subventionne aucun culte.',
          'Que fait cette loi de 1905 ?',
          'Elle sépare les Églises et l’État',
          { 'Elle rend l’école obligatoire': '1re-ecole-obligatoire', 'Elle donne le vote aux femmes': '1re-vote-femmes' },
          '1re-aide-1905',
        ),
        v(
          'HG_1TEC_HIST_DREYFUS',
          'Cinquième caisson : la une du journal L’Aurore du 13 janvier 1898, vendue à la criée sur les quais. Une lettre ouverte au président de la République y accuse l’état-major d’avoir fait condamner un innocent.',
          'Qui écrit « J’accuse… ! » pour défendre le capitaine Dreyfus ?',
          'Émile Zola',
          { 'Victor Hugo': '1re-hugo-mort', 'Jean Jaurès': '1re-jaures' },
          '1re-aide-zola',
        ),
      ],
      [
        v(
          'HG_1TEC_GEO_ESPACES_PRODUCTIFS',
          'Dernier caisson : une carte d’aujourd’hui. Les vieux quais sont devenus un quartier de bureaux, et le port s’est déplacé vers l’estuaire, entouré de raffineries, d’usines et de terminaux à conteneurs.',
          'Comment appelle-t-on la concentration des hommes et des activités au bord de la mer ?',
          'La littoralisation',
          { 'La métropolisation': '1tec-metropolisation', 'La périurbanisation': '1tec-periurbanisation' },
          '1tec-aide-littoralisation',
        ),
        v(
          'HG_1TEC_GEO_ESPACES_PRODUCTIFS',
          'Dernier caisson : une carte d’aujourd’hui. Depuis le port, des autoroutes, des voies ferrées et un fleuve emportent les conteneurs vers les villes et les usines de l’intérieur.',
          'Comment appelle-t-on l’espace intérieur qu’un port dessert par la route, le rail et les fleuves ?',
          'L’hinterland',
          { 'Le littoral': '1tec-littoral', 'La façade maritime': '1tec-facade' },
          '1tec-aide-hinterland',
        ),
      ],
    ],
  },

  // ———————————————————————————————— 1re pro : La cargaison des deux mondes
  PREMIERE_PRO: {
    prefixe: '1pro',
    code: ['N', 'A', 'V', 'I', 'R', 'E'],
    etapes: [
      [
        v(
          'HG_1RE_HIST_INDUSTRIE',
          'Premier objet : la gravure d’un navire de fer, sa haute cheminée crachant une fumée noire. Au XIXe siècle, ces navires remplacent peu à peu les voiliers.',
          'Quelle machine, perfectionnée par James Watt au XVIIIe siècle, fait tourner les usines et les navires du XIXe siècle ?',
          'La machine à vapeur',
          { 'Le moteur électrique': '1pro-electrique', 'L’éolienne': '1pro-eolienne' },
          '1pro-aide-vapeur',
        ),
        v(
          'HG_1RE_HIST_INDUSTRIE',
          'Premier objet : un morceau de roche noire, brillante, qui laisse des traces sur les doigts. Au XIXe siècle, des wagons entiers en arrivaient sur les quais pour remplir les navires.',
          'Quelle source d’énergie alimente surtout les machines à vapeur du XIXe siècle ?',
          'Le charbon',
          { 'Le pétrole': '1pro-petrole', 'Le gaz naturel': '1pro-gaz' },
          '1pro-aide-charbon',
        ),
      ],
      [
        v(
          'HG_1RE_HIST_COLONIAL',
          'Deuxième objet : une carte du monde de 1900, où de larges territoires d’Afrique et d’Asie portent les couleurs de pays européens.',
          'Comment appelle-t-on la domination d’un territoire et de sa population par un pays étranger qui s’y installe ?',
          'La colonisation',
          { 'La décolonisation': '1pro-decolonisation', 'La mondialisation': '1pro-mondialisation' },
          '1pro-aide-colonisation',
        ),
        v(
          'HG_1RE_HIST_COLONIAL',
          'Deuxième objet : une gravure de l’été 1830 montre une flotte française devant une ville blanche d’Afrique du Nord, au bord de la Méditerranée.',
          'En 1830, quel territoire d’Afrique du Nord la France commence-t-elle à conquérir ?',
          'L’Algérie',
          { 'L’Égypte': '1pro-egypte', 'Le Maroc': '1pro-maroc' },
          '1pro-aide-algerie',
        ),
      ],
      [
        v(
          'HG_1RE_HIST_NOUVEAUX_ETATS',
          'Troisième objet : une chemise rouge, soigneusement pliée, et une gravure de 1860. Un millier de volontaires y débarquent en Sicile pour faire l’unité de l’Italie.',
          'Quel chef des Chemises rouges conquiert la Sicile et Naples en 1860 ?',
          'Garibaldi',
          { Cavour: '1pro-cavour', Bismarck: '1pro-bismarck' },
          '1pro-aide-garibaldi',
        ),
        v(
          'HG_1RE_HIST_NOUVEAUX_ETATS',
          'Troisième objet : une lettre de 1871, postée dans la ville où le roi d’Italie vient de s’installer, et où le pape a perdu son pouvoir sur la ville l’année précédente.',
          'Quelle ville devient la capitale de l’Italie unifiée en 1871 ?',
          'Rome',
          { Turin: '1pro-turin', Venise: '1pro-venise' },
          '1pro-aide-rome',
        ),
      ],
      [
        v(
          'HG_1RE_HIST_1GM',
          'Quatrième objet : la lettre d’un soldat, écrite en 1916 dans la boue, à quelques mètres de l’ennemi. Il raconte les abris creusés dans la terre et les nuits de garde sous les obus.',
          'Comment appelle-t-on la guerre que mènent les soldats sur le front de l’Ouest, de la fin de 1914 à 1918, enterrés face à face ?',
          'La guerre de tranchées',
          { 'La guerre de mouvement': '1pro-mouvement', 'La guerre froide': '1pro-guerre-froide' },
          '1pro-aide-tranchees',
        ),
        v(
          'HG_1RE_HIST_EMBRASEMENT',
          'Quatrième objet : une carte postale du 11 novembre 1918. Dans tous les ports de France, les cloches sonnent : les combats s’arrêtent sur tout le front.',
          'Que signe-t-on à Rethondes, le 11 novembre 1918 ?',
          'L’armistice',
          { 'Le traité de Versailles': '1re-traite-versailles', 'Le traité de Brest-Litovsk': '1re-brest-litovsk' },
          '1re-aide-armistice',
        ),
      ],
      [
        v(
          'HG_1RE_GEO_PRODUCTIFS',
          'Cinquième objet : l’étiquette d’un conteneur d’aujourd’hui. Les vêtements qu’il transporte étaient autrefois fabriqués dans la région ; leur production a été transférée dans un pays où la main-d’œuvre coûte moins cher.',
          'Comment appelle-t-on ce transfert d’une production vers un pays où elle coûte moins cher ?',
          'Une délocalisation',
          { 'Une relocalisation': '1re-relocalisation', 'Une reconversion': '1re-reconversion' },
          '1re-aide-delocalisation',
        ),
        v(
          'HG_1RE_GEO_PRODUCTIFS',
          'Cinquième objet : sous tes yeux, un portique soulève un conteneur du navire et le pose sur un train, qui l’emportera vers l’intérieur du pays.',
          'Comment appelle-t-on ce passage d’une marchandise d’un moyen de transport à un autre ?',
          'L’intermodalité',
          { 'La délocalisation': '1pro-delocalisation', 'La périurbanisation': '1pro-periurbanisation' },
          '1pro-aide-intermodalite',
        ),
      ],
      [
        v(
          'HG_1RE_GEO_METROPOLISATION',
          'Dernier objet : une carte d’aujourd’hui. La grande ville voisine attire les sièges d’entreprises, les universités, l’aéroport et la gare à grande vitesse.',
          'Comment appelle-t-on la concentration des populations, des activités et des fonctions de commandement dans les plus grandes villes ?',
          'La métropolisation',
          { 'La périurbanisation': '1re-periurbanisation', 'L’exode rural': '1re-exode-rural' },
          '1re-aide-metropolisation',
        ),
        v(
          'HG_1RE_GEO_UE',
          'Dernier objet : un billet et des pièces, glissés dans la caisse par un docker d’aujourd’hui. Ici, en Italie, on paie avec la même monnaie qu’en France, en Allemagne ou en Espagne.',
          'Quelle monnaie la plupart des pays de l’Union européenne partagent-ils ?',
          'L’euro',
          { 'Le franc': '1pro-franc', 'Le dollar': '1pro-dollar' },
          '1pro-aide-euro',
        ),
      ],
    ],
  },

  // ———————————————————————————————— Tle : Le réseau du monde
  TERMINALE: {
    prefixe: 'tle',
    code: ['M', 'O', 'N', 'D', 'E', 'S'],
    etapes: [
      [
        v(
          'HG_TLE_HIST_CRISE_1929',
          'Premier connecteur : sur la plaque du touret de câbles, une dépêche d’octobre 1929, « Panique à la Bourse ! » Le jeudi 24 octobre, les cours s’effondrent, et la crise gagne bientôt le monde entier.',
          'Dans quelle ville le krach du « jeudi noir » éclate-t-il ?',
          'New York',
          { Londres: 'tle-londres', Berlin: 'tle-berlin' },
          'tle-aide-krach',
        ),
        v(
          'HG_TLE_HIST_CRISE_1929',
          'Premier connecteur : sur la plaque du touret de câbles, une dépêche de 1933, « Un New Deal pour l’Amérique ». Le nouveau président promet de relancer l’économie par de grands travaux et l’aide aux chômeurs.',
          'Quel président lance le New Deal ?',
          'Franklin D. Roosevelt',
          { 'Herbert Hoover': 'tle-hoover', 'Harry Truman': 'tle-truman' },
          'tle-aide-new-deal',
        ),
      ],
      [
        v(
          'HG_TLE_HIST_2GM',
          'Deuxième connecteur : une dépêche de février 1943, « La VIe armée allemande capitule ». Après des mois de combats de rue au bord de la Volga, l’armée allemande est vaincue.',
          'Quelle bataille marque ce tournant de la guerre à l’Est ?',
          'Stalingrad',
          { Verdun: 'tle-verdun', Midway: 'tle-midway' },
          'tle-aide-stalingrad',
        ),
        v(
          'HG_TLE_HIST_2GM',
          'Deuxième connecteur : une dépêche du 6 juin 1944, « Jour J : les Alliés ont débarqué ! » Des milliers de navires ont traversé la Manche pendant la nuit.',
          'Où les Alliés débarquent-ils, le 6 juin 1944 ?',
          'En Normandie',
          { 'En Provence': 'tle-provence', 'En Sicile': 'tle-sicile' },
          'tle-aide-normandie',
        ),
      ],
      [
        v(
          'HG_TLE_HIST_1945',
          'Troisième connecteur : une dépêche du 26 juin 1945, « La Charte est signée à San Francisco ». Les vainqueurs veulent bâtir un ordre mondial qui empêche une nouvelle guerre.',
          'Quelle organisation naît de cette Charte ?',
          'L’ONU',
          { 'La SDN': 'tle-sdn', 'L’OTAN': 'tle-otan' },
          'tle-aide-onu',
        ),
        v(
          'HG_TLE_HIST_GUERRE_FROIDE',
          'Troisième connecteur : une dépêche d’octobre 1962, « Des missiles soviétiques à 150 kilomètres de la Floride ». Washington et Moscou sont au bord de la guerre nucléaire.',
          'Comment appelle-t-on cette crise d’octobre 1962 ?',
          'La crise de Cuba',
          { 'Le blocus de Berlin': 'tle-blocus-berlin', 'La guerre de Corée': 'tle-coree' },
          'tle-aide-cuba',
        ),
      ],
      [
        v(
          'HG_TLE_HIST_DECOLONISATION',
          'Quatrième connecteur : une dépêche d’avril 1955, « L’Asie et l’Afrique prennent la parole ». Sur l’île de Java, en Indonésie, des pays souvent nouvellement indépendants condamnent le colonialisme.',
          'Dans quelle ville se tient cette conférence, où le tiers-monde s’affirme sur la scène internationale ?',
          'Bandung',
          { Yalta: 'tle-yalta', 'Évian': 'tle-evian' },
          'tle-aide-bandung',
        ),
        v(
          'HG_TLE_HIST_FRANCE',
          'Quatrième connecteur : une dépêche de décembre 1958, « Le général élu président de la République ». Quelques mois après l’adoption par référendum d’une nouvelle Constitution, un nouveau régime commence.',
          'Qui est le premier président de la Ve République ?',
          'Charles de Gaulle',
          { 'Georges Pompidou': 'tle-pompidou', 'François Mitterrand': 'tle-mitterrand' },
          'tle-aide-de-gaulle',
        ),
      ],
      [
        v(
          'HG_TLE_HIST_FRANCE_1974',
          'Cinquième connecteur : une dépêche de novembre 1974, « L’Assemblée adopte la loi sur l’IVG ». Après des débats très durs, la ministre de la Santé obtient la dépénalisation de l’interruption volontaire de grossesse ; la loi est promulguée en janvier 1975.',
          'Qui est cette ministre ?',
          'Simone Veil',
          { 'Simone de Beauvoir': 'tle-beauvoir', 'Gisèle Halimi': 'tle-halimi' },
          'tle-aide-veil',
        ),
        v(
          'HG_TLE_HIST_FRANCE_1974',
          'Cinquième connecteur : une dépêche de septembre 1981, « L’Assemblée vote l’abolition de la peine de mort ». Le garde des Sceaux y a prononcé un discours resté célèbre.',
          'Qui est ce garde des Sceaux ?',
          'Robert Badinter',
          { 'François Mitterrand': 'tle-mitterrand-abolition', 'Jacques Chirac': 'tle-chirac' },
          'tle-aide-badinter',
        ),
        v(
          'HG_TLE_HIST_CONSTRUCTION_EU',
          'Cinquième connecteur : une dépêche de février 1992, « Douze pays fondent l’Union européenne ». Signé dans une ville des Pays-Bas, le traité prévoit aussi une monnaie unique.',
          'Comment s’appelle ce traité ?',
          'Le traité de Maastricht',
          { 'Le traité de Rome': 'tle-rome', 'Le traité de Lisbonne': 'tle-lisbonne' },
          'tle-aide-maastricht',
        ),
      ],
      [
        v(
          'HG_TLE_GEO_MERS',
          'Dernier connecteur : sur l’écran, la carte des câbles qui relient les continents par le fond des océans. Elle montre aussi les vastes espaces maritimes de la France, autour de ses territoires d’outre-mer.',
          'Comment s’appelle l’espace, jusqu’à 200 milles marins des côtes, où un État exploite seul les ressources ?',
          'La zone économique exclusive',
          { 'Les eaux territoriales': 'tle-eaux-territoriales', 'La haute mer': 'tle-haute-mer' },
          'tle-aide-zee',
        ),
        v(
          'HG_TLE_GEO_MERS',
          'Dernier connecteur : par la fenêtre, des porte-conteneurs attendent devant le port. Sur l’écran, leur route entre l’Asie et l’Europe passe par la mer Rouge.',
          'Quel passage relie la mer Méditerranée à la mer Rouge ?',
          'Le canal de Suez',
          { 'Le canal de Panama': 'tle-panama', 'Le détroit de Gibraltar': 'tle-gibraltar' },
          'tle-aide-suez',
        ),
        v(
          'HG_TLE_GEO_DYNAMIQUES',
          'Dernier connecteur : sur l’écran, une carte montre ensemble les câbles sous-marins, les routes maritimes, les grands ports et les places financières, qui relient les économies du monde entier.',
          'Comment appelle-t-on la mise en relation de toutes les parties du monde par des flux de marchandises, de capitaux, de personnes et d’informations ?',
          'La mondialisation',
          { 'La métropolisation': 'tle-metropolisation', 'La littoralisation': 'tle-littoralisation' },
          'tle-aide-mondialisation',
        ),
      ],
    ],
  },

  // ———————————————————————————————— Tle techno : Le barrage des frontières
  TERMINALE_TECHNO: {
    prefixe: 'ttec',
    code: ['O', 'U', 'V', 'E', 'R', 'T'],
    etapes: [
      [
        v(
          'HG_TTEC_HIST_TOTALITARISMES',
          'Première vanne : une vieille affiche en allemand, arrachée autrefois du poste de douane de l’autre rive. Elle célèbre le chef du parti nazi, nommé chancelier un 30 janvier, quatre ans après le début de la grande crise.',
          'En quelle année Hitler devient-il chancelier de l’Allemagne ?',
          '1933',
          { 1923: 'ttec-1923', 1939: 'ttec-1939' },
          'ttec-aide-1933',
        ),
        v(
          'HG_TTEC_HIST_TOTALITARISMES',
          'Première vanne : une affiche soviétique montre un chef moustachu en uniforme, entouré d’ouvriers et de paysans. Sous son pouvoir, des millions de personnes sont envoyées dans les camps du Goulag.',
          'Quel dirigeant impose sa dictature à l’URSS à partir de la fin des années 1920 ?',
          'Staline',
          { 'Lénine': 'ttec-lenine', Gorbatchev: 'ttec-gorbatchev' },
          'ttec-aide-staline',
        ),
      ],
      [
        v(
          'HG_TTEC_HIST_FRANCE_1940',
          'Deuxième vanne : un vieux poste de radio, trouvé dans la maison de l’éclusier. En juin 1940, il captait la BBC, qui diffusait chaque soir des messages venus de Londres.',
          'Qui lance depuis Londres, le 18 juin 1940, un appel à continuer le combat ?',
          'Charles de Gaulle',
          { 'Philippe Pétain': 'ttec-petain', 'Jean Moulin': 'ttec-moulin' },
          'ttec-aide-de-gaulle',
        ),
        v(
          'HG_TTEC_HIST_FRANCE_1940',
          'Deuxième vanne : un laissez-passer allemand de 1941, tamponné au poste de la rivière. Pour passer de la zone occupée à la zone libre, il fallait montrer ce papier.',
          'Comment appelle-t-on la ligne qui sépare la zone occupée de la zone libre, à partir de 1940 ?',
          'La ligne de démarcation',
          { 'La ligne Maginot': 'ttec-maginot', 'Le rideau de fer': 'ttec-rideau-fer' },
          'ttec-aide-demarcation',
        ),
      ],
      [
        v(
          'HG_TTEC_HIST_ORDRE_1945',
          'Troisième vanne : la photographie d’une signature, le 26 juin 1945, à San Francisco : celle d’une Charte. Les vainqueurs veulent bâtir un ordre mondial qui empêche une nouvelle guerre.',
          'Quelle organisation naît de cette Charte ?',
          'L’ONU',
          { 'La SDN': 'tle-sdn', 'L’OTAN': 'tle-otan' },
          'tle-aide-onu',
        ),
        v(
          'HG_TTEC_HIST_ORDRE_1945',
          'Troisième vanne : la photographie d’un tribunal, en 1946 : des juges américains, britanniques, français et soviétiques font face à des accusés allemands.',
          'Dans quelle ville sont jugés, en 1945-1946, les principaux dirigeants nazis ?',
          'Nuremberg',
          { Berlin: 'ttec-berlin', 'La Haye': 'ttec-la-haye' },
          'ttec-aide-nuremberg',
        ),
        v(
          'HG_TTEC_HIST_GUERRE_FROIDE',
          'Troisième vanne : un morceau de béton couvert de graffitis, rapporté d’Allemagne par l’éclusier, une nuit de novembre où une frontière s’est ouverte.',
          'En quelle année le mur de Berlin tombe-t-il ?',
          '1989',
          { 1961: 'ttec-1961', 1991: 'ttec-1991' },
          'ttec-aide-mur',
        ),
      ],
      [
        v(
          'HG_TTEC_HIST_FIN_EMPIRE',
          'Quatrième vanne : une coupure de presse de mars 1962, au bord d’un lac de la frontière franco-suisse : « Cessez-le-feu en Algérie ». Près de huit ans de guerre prennent fin.',
          'Quels accords, signés en mars 1962, mènent à l’indépendance de l’Algérie ?',
          'Les accords d’Évian',
          { 'Les accords de Genève': 'ttec-geneve', 'Les accords de Munich': 'ttec-munich' },
          'ttec-aide-evian',
        ),
        v(
          'HG_TTEC_HIST_DECOLONISATION',
          'Quatrième vanne : une coupure de presse d’avril 1955, « L’Asie et l’Afrique prennent la parole ». Sur l’île de Java, en Indonésie, des pays souvent nouvellement indépendants condamnent le colonialisme.',
          'Dans quelle ville se tient cette conférence, où le tiers-monde s’affirme sur la scène internationale ?',
          'Bandung',
          { Yalta: 'tle-yalta', 'Évian': 'tle-evian' },
          'tle-aide-bandung',
        ),
      ],
      [
        v(
          'HG_TTEC_HIST_PROJET_EUROPEEN',
          'Cinquième vanne : la photographie d’un bateau sur la Moselle, en juin 1985, près d’un petit village luxembourgeois où se touchent trois frontières. À bord, cinq pays signent un accord pour supprimer peu à peu les contrôles entre eux.',
          'Quels accords suppriment peu à peu les contrôles des personnes aux frontières entre de nombreux pays européens ?',
          'Les accords de Schengen',
          { 'Le traité de Rome': 'ttec-rome', 'Le traité de Versailles': 'ttec-versailles' },
          'ttec-aide-schengen',
        ),
        v(
          'HG_TTEC_HIST_PROJET_EUROPEEN',
          'Cinquième vanne : un journal de février 1992, « Douze pays fondent l’Union européenne ». Signé dans une ville des Pays-Bas, au bord de la Meuse, le traité prévoit aussi une monnaie unique.',
          'Comment s’appelle ce traité ?',
          'Le traité de Maastricht',
          { 'Le traité de Rome': 'tle-rome', 'Le traité de Lisbonne': 'tle-lisbonne' },
          'tle-aide-maastricht',
        ),
      ],
      [
        v(
          'HG_TTEC_GEO_INTEGRATION',
          'Dernière vanne : chaque matin, sur le pont, des milliers de personnes passent la rivière pour aller travailler de l’autre côté, puis rentrent le soir dans leur pays.',
          'Comment appelle-t-on une personne qui vit dans un pays et va travailler chaque jour dans le pays voisin ?',
          'Un travailleur frontalier',
          { 'Un migrant': 'ttec-migrant', 'Un touriste': 'ttec-touriste' },
          'ttec-aide-frontalier',
        ),
        v(
          'HG_TTEC_GEO_CENTRES_DECISION',
          'Dernière vanne : au-dessus de l’écluse, sur le viaduc, des trains chargés de conteneurs passent la frontière. Un peu plus loin, des grues les déposent sur des barges ou sur des camions.',
          'Comment appelle-t-on un lieu où les marchandises passent d’un mode de transport à un autre ?',
          'Une plateforme multimodale',
          { 'Une métropole': 'ttec-metropole', 'Une écluse': 'ttec-ecluse' },
          'ttec-aide-plateforme',
        ),
      ],
    ],
  },

  // ———————————————————————————————— Tle pro : L'enquête des territoires
  TERMINALE_PRO: {
    prefixe: 'tpro',
    code: ['C', 'A', 'R', 'T', 'E', 'S'],
    etapes: [
      [
        v(
          'HG_TLE_HIST_MUTATIONS',
          'Premier relevé : du belvédère, tu vois la raffinerie, l’autoroute et le grand port industriel, bâtis pendant les années de forte croissance qui ont suivi la guerre.',
          'Comment appelle-t-on la période de forte croissance que connaît la France de 1945 à 1975 environ ?',
          'Les Trente Glorieuses',
          { 'Les Années folles': 'tpro-annees-folles', 'La Belle Époque': 'tpro-belle-epoque' },
          'tpro-aide-trente-glorieuses',
        ),
        v(
          'HG_TLE_HIST_MUTATIONS',
          'Premier relevé : au pied de la colline, les grands réservoirs de la raffinerie. En 1973, le prix du pétrole qu’ils stockent est multiplié par quatre en quelques mois.',
          'Quel choc met fin à la période de forte croissance, en 1973 ?',
          'Le choc pétrolier',
          { 'Le krach de Wall Street': 'tpro-krach', 'La chute du mur de Berlin': 'tpro-mur' },
          'tpro-aide-choc-petrolier',
        ),
      ],
      [
        v(
          'HG_TLE_HIST_1945',
          'Deuxième relevé : sur la table d’orientation, une plaque rappelle que le port, détruit pendant la guerre, a été reconstruit à partir de 1947 grâce à une aide venue d’outre-Atlantique.',
          'Quel plan américain aide l’Europe de l’Ouest à se reconstruire à partir de 1947 ?',
          'Le plan Marshall',
          { 'Le New Deal': 'tpro-new-deal', 'Le plan Schuman': 'tpro-schuman' },
          'tpro-aide-marshall',
        ),
        v(
          'HG_TLE_HIST_GUERRE_FROIDE',
          'Deuxième relevé : sur la colline, les restes d’un vieux radar militaire, construit quand le monde était coupé en deux blocs.',
          'Comment appelle-t-on l’affrontement entre les États-Unis et l’URSS, de 1947 à 1991, sans guerre directe entre eux ?',
          'La guerre froide',
          { 'La Seconde Guerre mondiale': 'tpro-2gm', 'La guerre d’Algérie': 'tpro-algerie' },
          'tpro-aide-guerre-froide',
        ),
      ],
      [
        v(
          'HG_TLE_HIST_FRANCE',
          'Troisième relevé : dans la mairie du bourg, au pied de la colline, le portrait officiel du premier président de la Ve République, élu en décembre 1958.',
          'Qui est le premier président de la Ve République ?',
          'Charles de Gaulle',
          { 'Georges Pompidou': 'tle-pompidou', 'François Mitterrand': 'tle-mitterrand' },
          'tle-aide-de-gaulle',
        ),
        v(
          'HG_TLE_HIST_FRANCE',
          'Troisième relevé : dans la mairie du bourg, les affiches de l’élection présidentielle de décembre 1965, la première de ce genre, où de Gaulle est mis en ballottage.',
          'Depuis 1962, comment le président de la République est-il élu en France ?',
          'Au suffrage universel direct',
          { 'Par les députés': 'tpro-deputes', 'Par des grands électeurs': 'tpro-grands-electeurs' },
          'tpro-aide-suffrage-direct',
        ),
      ],
      [
        v(
          'HG_TLE_GEO_MERS',
          'Quatrième relevé : au théodolite, tu repères les usines, le port et les immeubles serrés au bord de l’eau, tandis que l’intérieur des terres reste plus vide.',
          'Comment appelle-t-on la concentration des hommes et des activités au bord de la mer ?',
          'La littoralisation',
          { 'La métropolisation': '1tec-metropolisation', 'La périurbanisation': '1tec-periurbanisation' },
          '1tec-aide-littoralisation',
        ),
        v(
          'HG_TLE_GEO_DYNAMIQUES',
          'Quatrième relevé : sur le port, les logos d’un grand groupe dont les usines et les magasins se trouvent sur tous les continents.',
          'Comment appelle-t-on une entreprise qui produit et vend dans de nombreux pays ?',
          'Une firme transnationale',
          { 'Une PME': 'tpro-pme', 'Une coopérative': 'tpro-cooperative' },
          'tpro-aide-ftn',
        ),
      ],
      [
        v(
          'HG_TLE_GEO_ENVIRONNEMENT',
          'Cinquième relevé : dans les bacs, des échantillons de sol desséché. Les mesures montrent que les étés sont de plus en plus secs ; en 2015, presque tous les pays du monde se sont engagés à limiter le réchauffement.',
          'Quel accord international, adopté en 2015, engage les pays à limiter le réchauffement climatique ?',
          'L’accord de Paris',
          { 'Le protocole de Kyoto': 'tpro-kyoto', 'Le traité de Maastricht': 'tpro-maastricht' },
          'tpro-aide-paris',
        ),
        v(
          'HG_TLE_GEO_ENVIRONNEMENT',
          'Cinquième relevé : dans les bacs, du sable prélevé sur la plage. D’un relevé à l’autre, le rivage a reculé de plusieurs mètres.',
          'Comment appelle-t-on le recul du rivage sous l’action de la mer ?',
          'L’érosion côtière',
          { 'La sécheresse': 'tpro-secheresse', 'La déforestation': 'tpro-deforestation' },
          'tpro-aide-erosion',
        ),
      ],
      [
        v(
          'HG_TLE_HIST_CONSTRUCTION_EU',
          'Dernier relevé : sur le panneau du viaduc, un drapeau bleu aux étoiles d’or rappelle qu’il a été financé en partie par l’Union européenne, héritière d’une communauté née d’un traité signé en 1957 par six pays.',
          'Quel traité de 1957 crée la Communauté économique européenne ?',
          'Le traité de Rome',
          { 'Le traité de Maastricht': 'tpro-maastricht-cee', 'Le traité de Versailles': 'tpro-versailles' },
          'tpro-aide-rome',
        ),
        v(
          'HG_TLE_GEO_MERS',
          'Dernier relevé : au large, des bateaux de pêche et une plateforme. La carte du bureau d’études montre jusqu’où la France peut exploiter seule les ressources de la mer.',
          'Comment s’appelle l’espace, jusqu’à 200 milles marins des côtes, où un État exploite seul les ressources ?',
          'La zone économique exclusive',
          { 'Les eaux territoriales': 'tle-eaux-territoriales', 'La haute mer': 'tle-haute-mer' },
          'tle-aide-zee',
        ),
      ],
    ],
  },
};

/** Les compétences d'une classe : celles de toutes ses variantes, sans doublon. */
const competencesDe = (classe) => [...new Set(BANQUES[classe].etapes.flat().map((e) => e.competence))];

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Le phare de la Méditerranée',
    accroche: 'Six coffres, d’Athènes au monde actuel.',
    intro: 'Tout en haut d’un vieux phare, au-dessus d’un port de la Méditerranée dominé par un temple antique, la gardienne a rassemblé dans sa salle de veille des trésors de toutes les époques : amphores, sphère armillaire, longue-vue, cartes marines. Six coffres sont fermés par des cadenas : ouvre-les dans l’ordre pour rallumer la lanterne du phare.',
    fin: 'Les six pièces forment le mot ESCALE : le dernier coffre s’ouvre sur la clé de la lanterne, et le phare se rallume sur la Méditerranée, escale de tous les mondes.',
    competences: competencesDe('SECONDE'),
  },
  SECONDE_PRO: {
    titre: 'Le mystère des routes marchandes',
    accroche: 'Six ballots sur les routes du commerce.',
    intro: 'Dans un port de la Méditerranée, au pied des falaises, l’entrepôt d’un ancien marchand garde six ballots fermés par des cadenas : épices, étoffes, amphores et lettres de toutes les époques. Ouvre-les dans l’ordre pour suivre les routes marchandes et percer le mystère de sa fortune.',
    fin: 'Les six pièces forment le mot POIVRE : le registre du marchand s’ouvre enfin, et le mystère est levé : sa fortune est venue des épices d’Asie, par les routes de la mer.',
    competences: competencesDe('SECONDE_PRO'),
  },
  PREMIERE: {
    titre: 'Le dernier train de l’enquête',
    accroche: 'Six leviers, de 1789 à nos jours.',
    intro: 'Au crépuscule, dans le poste d’aiguillage d’une gare entourée d’usines, une historienne a laissé sur le pupitre un jeton de cuivre et le dossier de son enquête sur une famille de cheminots, de la Révolution à nos jours. Six leviers sont verrouillés, chacun par une pièce du dossier : débloque-les dans l’ordre pour que le dernier train puisse partir.',
    fin: 'Les six pièces forment le mot LEVIER : le dernier levier bascule, le signal s’abaisse, et le train de l’enquête s’élance vers aujourd’hui.',
    competences: competencesDe('PREMIERE'),
  },
  PREMIERE_TECHNO: {
    titre: 'Les quais de la révolution',
    accroche: 'Six caissons, de 1789 à nos jours.',
    intro: 'Sur les quais d’un grand port français, entre les grues, les entrepôts de brique et les navires à vapeur, six caissons de la compagnie maritime sont restés fermés par des cadenas. Chacun garde un document du siècle des révolutions, politiques et industrielles : ouvre-les dans l’ordre pour remonter de la Révolution française jusqu’au port d’aujourd’hui.',
    fin: 'Les six pièces forment le mot VAPEUR : le dernier caisson s’ouvre, la grue se remet en marche, et les quais te livrent leur histoire.',
    competences: competencesDe('PREMIERE_TECHNO'),
  },
  PREMIERE_PRO: {
    titre: 'La cargaison des deux mondes',
    accroche: 'Une caisse, deux mondes, six cadenas.',
    intro: 'Sur les quais d’un port italien, entre les portiques et les trains de conteneurs, le musée du port a rangé dans une vieille caisse six objets, du temps des navires à vapeur jusqu’à celui des conteneurs. Chacun est fermé par un cadenas : ouvre-les dans l’ordre pour reconstituer le voyage des marchandises entre ces deux mondes.',
    fin: 'Les six pièces forment le mot NAVIRE : la caisse s’ouvre, et l’exposition du musée peut raconter le voyage des marchandises, du charbon aux conteneurs.',
    competences: competencesDe('PREMIERE_PRO'),
  },
  TERMINALE: {
    titre: 'Le réseau du monde',
    accroche: 'Six dépêches, de 1929 à nos jours.',
    intro: 'Au bord de l’océan, dans la station où les câbles sous-marins sortent de la mer avant de rejoindre la grande ville, tout le réseau vient de s’éteindre. Six connecteurs sont verrouillés, et chacun ne se rouvre que si tu reconnais une nouvelle qui a fait le tour du monde depuis 1929 : rebranche-les dans l’ordre pour rallumer le réseau.',
    fin: 'Les six pièces forment le mot MONDES : les connecteurs s’allument un à un, et le réseau qui relie tous les mondes se remet à battre sous l’océan.',
    competences: competencesDe('TERMINALE'),
  },
  TERMINALE_TECHNO: {
    titre: 'Le barrage des frontières',
    accroche: 'Six vannes, un siècle de frontières.',
    intro: 'Sur une rivière qui sert de frontière entre deux pays d’Europe, l’éclusier a fermé les six vannes du vieux barrage, au pied de l’ancienne porte fortifiée des douanes. Chaque vanne garde le souvenir d’un siècle de frontières fermées puis ouvertes : lève-les dans l’ordre pour que l’eau passe à nouveau.',
    fin: 'Les six pièces forment le mot OUVERT : les vannes se lèvent, l’eau franchit le barrage, et la frontière n’est plus qu’une rivière à traverser.',
    competences: competencesDe('TERMINALE_TECHNO'),
  },
  TERMINALE_PRO: {
    titre: 'L’enquête des territoires',
    accroche: 'Six relevés pour lire un territoire.',
    intro: 'Stagiaire dans un bureau d’études, tu montes au belvédère qui domine toute la région : la montagne, la plaine agricole, l’autoroute, le fleuve et le grand port industriel. Six caisses de matériel sont fermées par des cadenas, et chaque relevé réussi en ouvre une : mène l’enquête pour comprendre comment ce territoire s’est transformé depuis la guerre.',
    fin: 'Les six pièces forment le mot CARTES : ton dossier est complet, et la carte du territoire peut enfin être dessinée.',
    competences: competencesDe('TERMINALE_PRO'),
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

/** Les six étapes de la classe, dans l'ordre du récit : chacune tire une variante et mélange ses choix. */
export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { au, melanger } = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES[CLASSES[0]];

  return banque.etapes.map((variantes, i) => {
    const e = au(variantes);
    return {
      consigne: `${banque.prefixe}-etape-${i + 1}`,
      question: e.question,
      choix: melanger([e.bonne, ...Object.keys(e.pieges)]).map((l) => ({ cle: l, libelle: l })),
      bonne: e.bonne,
      pieges: { ...e.pieges },
      aide: e.aide,
      recit: e.recit,
      cadenas: { avant: banque.code.slice(0, i), piece: banque.code[i], total: MANCHES },
      competence: e.competence,
    };
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // ——— 2de : le phare de la Méditerranée ———
  '2de-etape-1': 'Premier coffre : un objet de la Méditerranée antique. Lis bien l’étiquette.',
  '2de-etape-1-regle': 'Repère la cité et le siècle donnés par l’étiquette, puis écarte les personnages d’une autre époque ou d’une autre cité.',
  '2de-aide-pericles': 'Retiens : Périclès, stratège réélu pendant des années, domine Athènes au cinquième siècle avant Jésus-Christ ; il fait bâtir le Parthénon sur l’Acropole.',
  '2de-alexandre': 'Alexandre le Grand est un roi de Macédoine du quatrième siècle avant Jésus-Christ, un conquérant, pas un magistrat élu d’Athènes. Remonte d’un siècle et cherche le stratège de la démocratie athénienne.',
  '2de-auguste-athenes': 'Auguste est le premier empereur romain, à la fin du premier siècle avant Jésus-Christ, et il règne sur Rome, pas sur la démocratie athénienne. Cherche un stratège athénien du cinquième siècle.',
  '2de-aide-auguste': 'Retiens : en vingt-sept avant Jésus-Christ, Octave reçoit du Sénat le titre d’Auguste ; il est le premier empereur, même s’il prétend restaurer la République.',
  '2de-cesar': 'Piège classique : Jules César est dictateur, mais il est assassiné en quarante-quatre avant Jésus-Christ sans avoir jamais été empereur. C’est son fils adoptif, Octave, qui reçoit le titre d’Auguste.',
  '2de-constantin': 'Constantin règne au quatrième siècle après Jésus-Christ ; on le retient pour sa conversion au christianisme. Le premier empereur vit plus de trois siècles plus tôt : c’est le fils adoptif de César.',

  '2de-etape-2': 'Deuxième coffre : la Méditerranée du Moyen Âge, entre échanges et affrontements.',
  '2de-etape-2-regle': 'Relis le document : il donne un lieu ou une date. Écarte ce qui appartient à un autre siècle ou à une autre rive de la Méditerranée.',
  '2de-aide-croisade': 'Retiens : lancée par Urbain deux en mille quatre-vingt-quinze, la première croisade s’achève par la prise de Jérusalem en mille quatre-vingt-dix-neuf.',
  '2de-constantinople-croisade': 'Constantinople est bien prise par des croisés, mais en douze cent quatre, lors de la quatrième croisade. La première vise la ville sainte où se trouve le tombeau du Christ.',
  '2de-grenade': 'Grenade tombe en quatorze cent quatre-vingt-douze, prise par les Rois catholiques : c’est la fin de la Reconquista, en Espagne. Les croisés de la première croisade marchent vers la ville sainte du tombeau du Christ.',
  '2de-aide-venise': 'Retiens : au Moyen Âge, Venise, république marchande dirigée par un doge, contrôle par ses comptoirs une grande partie du commerce entre l’Orient et l’Occident.',
  '2de-florence': 'Florence est une grande cité de banquiers et de marchands, mais elle n’a ni lagune ni doge. Cherche la cité bâtie sur l’eau, au fond de l’Adriatique.',
  '2de-constantinople-empereur': 'Constantinople est la capitale de l’Empire byzantin, gouvernée par un empereur, pas par un doge. Cherche la cité de la lagune, au fond de l’Adriatique.',

  '2de-etape-3': 'Troisième coffre : le temps de la Renaissance et des grandes découvertes.',
  '2de-etape-3-regle': 'Relis le document du coffre : sa date et son lieu suffisent à écarter les personnages et les traités d’une autre époque.',
  '2de-aide-luther': 'Retiens : en mille cinq cent dix-sept, Martin Luther publie ses quatre-vingt-quinze thèses contre les indulgences ; c’est le début de la Réforme protestante.',
  '2de-calvin': 'Calvin est un grand réformateur, mais il est français et de la génération suivante : il organise la Réforme à Genève. Le moine de Wittenberg, en Allemagne, ouvre la voie avant lui.',
  '2de-erasme': 'Érasme, le prince des humanistes, critique les abus de l’Église, mais il reste catholique. Le moine de Wittenberg, lui, rompt avec Rome.',
  '2de-aide-tordesillas': 'Retiens : en quatorze cent quatre-vingt-quatorze, le traité de Tordesillas partage le monde à découvrir entre l’Espagne et le Portugal ; c’est pourquoi le Brésil deviendra portugais.',
  '2de-verdun': 'Le traité de Verdun est bien un partage, mais en huit cent quarante-trois : celui de l’empire de Charlemagne entre ses petits-fils. Le partage des terres à découvrir suit de peu le premier voyage de Colomb.',
  '2de-utrecht': 'Le traité d’Utrecht, en dix-sept cent treize, met fin à la guerre de Succession d’Espagne. Le partage des terres à découvrir date de la fin du quinzième siècle, juste après le premier voyage de Colomb.',

  '2de-etape-4': 'Quatrième coffre : deux façons de gouverner, en France et en Angleterre.',
  '2de-etape-4-regle': 'Compare la date du document à celle de chaque choix : un seul roi, ou un seul texte, correspond exactement au récit.',
  '2de-aide-louis-xiv': 'Retiens : en seize cent quatre-vingt-cinq, par l’édit de Fontainebleau, Louis quatorze révoque l’édit de Nantes ; il veut un royaume d’une seule foi, sous un roi absolu.',
  '2de-henri-iv': 'Henri quatre fait exactement l’inverse : c’est lui qui signe l’édit de Nantes, en quinze cent quatre-vingt-dix-huit, pour accorder la tolérance aux protestants. Cherche le roi de Versailles, qui l’annule.',
  '2de-louis-xvi': 'Louis seize règne un siècle plus tard, et il rend même un état civil aux protestants en dix-sept cent quatre-vingt-sept. Cherche le roi de Versailles, celui de l’absolutisme.',
  '2de-aide-bill-of-rights': 'Retiens : en seize cent quatre-vingt-neuf, le Bill of Rights fonde la monarchie parlementaire anglaise : le pouvoir du roi est limité par le Parlement, qui vote l’impôt et les lois.',
  '2de-grande-charte': 'La Grande Charte, la Magna Carta, limite déjà le pouvoir du roi d’Angleterre, mais en douze cent quinze, au Moyen Âge. Le texte de la Glorieuse Révolution vient près de cinq siècles plus tard.',
  '2de-habeas-corpus': 'L’Habeas Corpus, en seize cent soixante-dix-neuf, protège contre les arrestations arbitraires, dix ans avant la Glorieuse Révolution. Le texte accepté par Guillaume et Marie est une déclaration des droits.',

  '2de-etape-5': 'Cinquième coffre : les Lumières et l’essor des sciences.',
  '2de-etape-5-regle': 'Repère la date et la langue du livre posé dans le coffre : elles désignent les auteurs, et écartent ceux qui vivent à une autre époque.',
  '2de-aide-encyclopedie': 'Retiens : Diderot et d’Alembert dirigent l’Encyclopédie, publiée à partir de dix-sept cent cinquante et un, qui veut rassembler et diffuser tous les savoirs.',
  '2de-voltaire-rousseau': 'Voltaire et Rousseau écrivent quelques articles de l’Encyclopédie, mais ils ne la dirigent pas. Cherche le philosophe et le mathématicien qui en prennent la tête.',
  '2de-locke-newton': 'Locke et Newton sont des Anglais qui inspirent les Lumières, mais ils sont morts avant la parution du premier tome. Cherche deux Français, un philosophe et un mathématicien.',
  '2de-aide-newton': 'Retiens : en seize cent quatre-vingt-sept, Isaac Newton publie les Principia : une même loi, la gravitation universelle, explique la chute des corps et le mouvement des planètes.',
  '2de-galilee': 'Galilée observe le ciel à la lunette et défend l’héliocentrisme, mais il est italien et meurt en seize cent quarante-deux. La loi de la gravitation vient d’un Anglais, quarante-cinq ans plus tard.',
  '2de-copernic': 'Copernic place le Soleil au centre du monde, au seizième siècle ; il est polonais et ne décrit pas la gravitation. Cherche le savant anglais de la fin du dix-septième siècle.',

  '2de-etape-6': 'Dernier coffre : une carte ou un graphique du monde d’aujourd’hui. Lis bien la légende.',
  '2de-etape-6-regle': 'Relis la légende du document : elle dit ce qui est mesuré. Choisis la notion qui correspond exactement à cette mesure.',
  '2de-aide-idh': 'Retiens : l’indice de développement humain, l’IDH, combine l’espérance de vie, la durée de scolarisation et le revenu par habitant ; il va de zéro à un.',
  '2de-pib': 'Le PIB mesure seulement la richesse produite par un pays. L’indicateur de la carte ajoute la santé et l’éducation : c’est l’indice de développement humain.',
  '2de-natalite': 'Le taux de natalité compte les naissances : c’est un indicateur démographique. Celui de la carte mêle santé, éducation et revenu pour mesurer le développement.',
  '2de-aide-transition': 'Retiens : pendant la transition démographique, la mortalité baisse d’abord, puis la natalité ; entre les deux, la population augmente fortement.',
  '2de-exode-rural': 'L’exode rural est un déplacement de population, des campagnes vers les villes. Le graphique, lui, compare les naissances et les décès : cherche le nom de ce changement de régime démographique.',
  '2de-vieillissement': 'Le vieillissement est une conséquence de ce passage, quand la natalité reste basse et qu’on vit plus longtemps. Le graphique montre le passage lui-même, d’un régime démographique à un autre.',

  // ——— 2de pro : le mystère des routes marchandes ———
  '2pro-etape-1': 'Premier ballot : la Méditerranée de l’Antiquité. Lis bien l’étiquette.',
  '2pro-etape-1-regle': 'Repère le peuple ou la cité dont parle l’étiquette, puis écarte ceux qui vivent à une autre époque ou dans une autre région du monde.',
  '2pro-aide-romains': 'Retiens : les Romains, maîtres de tout le tour de la Méditerranée, l’appelaient Mare nostrum, « notre mer ».',
  '2pro-vikings': 'Les Vikings sont des navigateurs venus de Scandinavie, au Moyen Âge, bien après l’Antiquité. Le peuple qui entourait toute la Méditerranée antique avait pour capitale Rome.',
  '2pro-azteques': 'Les Aztèques vivent en Amérique, loin de la Méditerranée, et les Européens ne les découvrent qu’au seizième siècle. Le peuple de « notre mer » a pour capitale Rome.',
  '2pro-aide-athenes': 'Retiens : Athènes, la cité de la démocratie, s’ouvre sur la mer par son port, Le Pirée.',
  '2pro-rome-grecque': 'Rome est en Italie, et ce n’est pas une cité grecque. Le Pirée est le port de la cité qui inventa la démocratie.',
  '2pro-sparte': 'Sparte est une cité grecque guerrière, dans les terres, et ce n’est pas une démocratie. Le Pirée est le port d’Athènes.',

  '2pro-etape-2': 'Deuxième ballot : le commerce des épices au Moyen Âge.',
  '2pro-etape-2-regle': 'Relis l’étiquette : elle donne un lieu ou une origine. Écarte ce qui est trop loin de la mer, ou ce que les Européens ne connaissent pas encore.',
  '2pro-aide-venise': 'Retiens : au Moyen Âge, Venise, bâtie sur une lagune au fond de l’Adriatique, domine le commerce des épices venues d’Orient.',
  '2pro-rome-epices': 'Rome est la ville du pape, pas la grande cité marchande des épices. Celle-ci est bâtie sur une lagune, au fond de l’Adriatique.',
  '2pro-paris': 'Paris est loin de la mer. La grande cité marchande des épices est un port italien, bâti sur une lagune.',
  '2pro-aide-asie': 'Retiens : le poivre, la cannelle ou le gingembre viennent d’Asie ; ils arrivent en Europe par de longues routes, à travers l’océan Indien et la Méditerranée.',
  '2pro-amerique-epices': 'L’Amérique n’est pas encore connue des Européens au Moyen Âge : Colomb n’y arrive qu’en quatorze cent quatre-vingt-douze. Le poivre vient d’Inde, en Asie.',
  '2pro-europe-nord': 'Les épices ne poussent pas dans les pays froids d’Europe : le poivre vient d’Asie, notamment d’Inde.',

  '2pro-etape-3': 'Troisième ballot : le temps des grandes découvertes.',
  '2pro-etape-3-regle': 'Relis la date et le trajet du voyage : par le sud de l’Afrique, ou vers l’ouest à travers l’Atlantique. Puis cherche qui a fait ce voyage, et pour qui.',
  '2pro-aide-gama': 'Retiens : en quatorze cent quatre-vingt-dix-huit, le Portugais Vasco de Gama atteint l’Inde en contournant l’Afrique ; la route des épices passe désormais par l’océan.',
  '2pro-colomb': 'Christophe Colomb cherche les Indes par l’ouest, et arrive en Amérique en quatorze cent quatre-vingt-douze. La route du sud de l’Afrique est ouverte par un autre navigateur, portugais.',
  '2pro-magellan': 'Magellan lance le premier tour du monde en quinze cent dix-neuf, plus de vingt ans après. La route des Indes par l’Afrique est ouverte en quatorze cent quatre-vingt-dix-huit.',
  '2pro-aide-colomb': 'Retiens : en quatorze cent quatre-vingt-douze, Christophe Colomb traverse l’Atlantique pour les Rois catholiques d’Espagne ; il croit arriver en Asie, mais il atteint l’Amérique.',
  '2pro-portugal': 'Le roi du Portugal a refusé le projet de Colomb. Ce sont Isabelle de Castille et Ferdinand d’Aragon, les Rois catholiques, qui financent son voyage.',
  '2pro-france-colomb': 'La France ne finance pas Colomb : ses trois navires partent d’Espagne, pour les Rois catholiques.',

  '2pro-etape-4': 'Quatrième ballot : ce que l’Amérique apporte à l’Europe.',
  '2pro-etape-4-regle': 'Demande-toi d’où vient vraiment chaque produit : d’Amérique, d’Asie ou d’Afrique. Un seul a traversé l’Atlantique vers l’Europe.',
  '2pro-aide-pomme-de-terre': 'Retiens : après les voyages de Colomb, l’Europe découvre des plantes d’Amérique, comme la pomme de terre, la tomate, le maïs ou le cacao.',
  '2pro-poivre-asie': 'Le poivre vient d’Asie, et il est connu en Europe depuis l’Antiquité. La plante venue d’Amérique pousse sous la terre, en tubercules.',
  '2pro-riz': 'Le riz vient d’Asie, et il est cultivé en Europe dès le Moyen Âge. La plante venue d’Amérique pousse sous la terre, en tubercules.',
  '2pro-aide-cacao': 'Retiens : le cacao, déjà cultivé par les Mayas et les Aztèques, arrive en Europe au seizième siècle ; on en fait le chocolat.',
  '2pro-canne': 'La canne à sucre vient d’Asie ; les Européens la plantent en Amérique, mais elle n’en est pas originaire. Le chocolat se fait avec le cacao, que connaissaient les Aztèques.',
  '2pro-cafe': 'Le café vient d’Afrique, d’Éthiopie, et il est d’abord bu dans le monde arabe. Le chocolat se fait avec le cacao, venu d’Amérique.',

  '2pro-etape-5': 'Cinquième ballot : les voyageurs d’aujourd’hui.',
  '2pro-etape-5-regle': 'Demande-toi pourquoi ces personnes se déplacent, et si elles rentrent chez elles : pour leurs loisirs, pour travailler, ou pour s’installer ailleurs.',
  '2pro-aide-tourisme': 'Retiens : le tourisme, c’est voyager pour ses loisirs, hors de chez soi, puis rentrer ; c’est une grande richesse des côtes de la Méditerranée.',
  '2pro-exode-rural': 'L’exode rural est le départ des habitants des campagnes vers les villes, pour y vivre. Les visiteurs du port, eux, viennent pour leurs loisirs, puis rentrent chez eux.',
  '2pro-delocalisation': 'Une délocalisation déplace une usine, pas des personnes en vacances. Ceux qui voyagent pour leurs loisirs font du tourisme.',
  '2pro-aide-migrant': 'Retiens : un migrant quitte son pays pour s’installer et vivre dans un autre ; les migrations font partie des grandes mobilités du monde.',
  '2pro-touriste': 'Un touriste voyage pour ses loisirs, puis rentre chez lui. Celui qui s’installe pour vivre dans un autre pays est un migrant.',
  '2pro-frontalier': 'Un travailleur frontalier passe la frontière pour travailler, mais il rentre chaque soir ou chaque semaine dans son pays. Celui qui s’installe dans un autre pays est un migrant.',

  '2pro-etape-6': 'Dernier ballot : le port face à ses besoins d’aujourd’hui.',
  '2pro-etape-6-regle': 'Relis le document : il dit quel besoin il faut satisfaire. Choisis l’installation ou l’énergie qui y répond exactement.',
  '2pro-aide-dessalement': 'Retiens : une usine de dessalement retire le sel de l’eau de mer pour fabriquer de l’eau douce ; c’est une réponse au manque d’eau autour de la Méditerranée.',
  '2pro-epuration': 'Une station d’épuration nettoie les eaux usées avant de les rejeter. Pour rendre l’eau de mer bonne à boire, on en retire le sel : c’est le dessalement.',
  '2pro-barrage': 'Un barrage retient l’eau d’une rivière dans un lac. Pour rendre l’eau de mer bonne à boire, on en retire le sel : c’est le dessalement.',
  '2pro-aide-eolien': 'Retiens : l’énergie éolienne utilise la force du vent, grâce aux éoliennes ; c’est une énergie renouvelable, comme le solaire.',
  '2pro-solaire': 'L’énergie solaire utilise la lumière du soleil, avec des panneaux. Les grandes hélices qui tournent au vent sont des éoliennes.',
  '2pro-hydraulique': 'L’énergie hydraulique utilise la force de l’eau, avec des barrages. Les grandes hélices qui tournent au vent sont des éoliennes.',

  // ——— 1re : le dernier train de l'enquête ———
  '1re-etape-1': 'Premier levier : la Révolution et l’Empire.',
  '1re-etape-1-regle': 'Relis la date du document, puis range les choix sur la frise : un seul correspond exactement à cette année.',
  '1re-aide-code-civil': 'Retiens : en dix-huit cent quatre, le Code civil, voulu par Napoléon Bonaparte, unifie le droit et consacre l’égalité devant la loi et la propriété.',
  '1re-concordat': 'Le Concordat, signé en dix-huit cent un avec le pape, règle la place de l’Église catholique en France. Le texte de dix-huit cent quatre organise le droit des personnes, de la famille et de la propriété.',
  '1re-ddhc': 'La Déclaration des droits de l’homme et du citoyen date de dix-sept cent quatre-vingt-neuf : elle proclame des principes. Le texte de dix-huit cent quatre est un code, qui fixe les règles du droit civil.',
  '1re-aide-republique': 'Retiens : en septembre dix-sept cent quatre-vingt-douze, la Convention abolit la royauté ; la Première République commence.',
  '1re-consulat': 'Le Consulat naît du coup d’État de Bonaparte, en dix-sept cent quatre-vingt-dix-neuf, sept ans plus tard. En septembre dix-sept cent quatre-vingt-douze, la royauté abolie laisse place à un régime sans roi.',
  '1re-premier-empire': 'Le Premier Empire est proclamé en dix-huit cent quatre, douze ans plus tard. En dix-sept cent quatre-vingt-douze, la Convention fonde un régime sans roi ni empereur.',

  '1re-etape-2': 'Deuxième levier : l’Europe et la France, de la chute de Napoléon au coup d’État de son neveu.',
  '1re-etape-2-regle': 'Repère l’année et l’échelle du document : un événement français ou européen, au début ou au milieu du siècle. Puis cherche le nom qui lui correspond exactement.',
  '1re-aide-vienne': 'Retiens : en dix-huit cent quinze, le congrès de Vienne restaure les monarchies et redessine l’Europe, sans tenir compte des aspirations des peuples.',
  '1re-congres-berlin': 'Le congrès de Berlin a lieu en dix-huit cent soixante-dix-huit, et il règle surtout la question des Balkans. Après la chute de Napoléon, les vainqueurs se réunissent dans la capitale de l’empire d’Autriche.',
  '1re-versailles-1919': 'Le traité de Versailles conclut la Première Guerre mondiale, en dix-neuf cent dix-neuf. Après Napoléon, l’Europe est redessinée un siècle plus tôt, dans la capitale de l’Autriche.',
  '1re-aide-printemps': 'Retiens : en dix-huit cent quarante-huit, le printemps des peuples embrase l’Europe ; libéraux et patriotes réclament des constitutions et des États-nations.',
  '1re-trois-glorieuses': 'Les Trois Glorieuses, ce sont les trois journées de juillet dix-huit cent trente, à Paris, qui renversent Charles dix. Les journaux du dossier parlent d’une vague européenne, dix-huit ans plus tard.',
  '1re-commune': 'La Commune est une insurrection parisienne de dix-huit cent soixante et onze, après la défaite face à la Prusse. En dix-huit cent quarante-huit, la révolte touche presque toute l’Europe.',
  '1re-aide-schoelcher': 'Retiens : le vingt-sept avril dix-huit cent quarante-huit, le décret inspiré par Victor Schœlcher abolit l’esclavage dans les colonies françaises.',
  '1re-ferry': 'Jules Ferry est l’homme des lois scolaires des années mille huit cent quatre-vingt, et aussi de l’expansion coloniale. Le décret d’abolition vient trente ans plus tôt, porté par un sous-secrétaire d’État à la Marine.',
  '1re-hugo-depute': 'Victor Hugo est élu député en dix-huit cent quarante-huit, mais ce décret n’est pas de lui. Cherche le républicain qui a consacré sa vie au combat contre l’esclavage.',
  '1re-aide-coup-etat': 'Retiens : élu président en dix-huit cent quarante-huit, Louis-Napoléon Bonaparte fait un coup d’État le deux décembre dix-huit cent cinquante et un, puis devient Napoléon trois un an plus tard.',
  '1re-napoleon-ier': 'Napoléon premier est mort en dix-huit cent vingt et un. Le président de dix-huit cent cinquante et un est son neveu, élu au suffrage universel masculin en dix-huit cent quarante-huit.',
  '1re-thiers': 'Adolphe Thiers est un opposant au coup d’État, qui le fait même arrêter. Il ne deviendra président qu’en dix-huit cent soixante et onze, sous la Troisième République.',

  '1re-etape-3': 'Troisième levier : des nations naissent par la guerre et la diplomatie.',
  '1re-etape-3-regle': 'Relis le document : il donne le pays et le lieu. Écarte ce qui appartient à l’autre unité, ou à un autre moment de la même histoire.',
  '1re-aide-versailles-1871': 'Retiens : le dix-huit janvier dix-huit cent soixante et onze, l’Empire allemand est proclamé dans la galerie des Glaces de Versailles ; l’unité allemande se fait par la guerre.',
  '1re-berlin': 'Berlin devient la capitale du nouvel empire, mais la proclamation a lieu en France, en pleine guerre, dans la galerie des Glaces d’un château royal.',
  '1re-francfort': 'À Francfort, en mai dix-huit cent soixante et onze, on signe le traité de paix qui enlève l’Alsace et une partie de la Lorraine à la France. L’empire est proclamé plus tôt, dans la galerie des Glaces.',
  '1re-aide-cavour': 'Retiens : Cavour, chef du gouvernement du Piémont-Sardaigne, prépare l’unité italienne par la diplomatie, avec l’appui de la France ; Garibaldi la fait avancer par les armes.',
  '1re-garibaldi': 'Garibaldi sert l’unité italienne par les armes, à la tête de ses volontaires, les Chemises rouges. L’homme de la diplomatie et des alliances dirige le gouvernement de Turin.',
  '1re-bismarck': 'Bismarck mène l’unité allemande, depuis Berlin, au service du roi de Prusse. L’unité italienne est préparée à Turin, par le chef du gouvernement piémontais.',

  '1re-etape-4': 'Quatrième levier : la Troisième République s’enracine.',
  '1re-etape-4-regle': 'Relis le document : sa date et ses mots exacts suffisent. Écarte les réponses qui appartiennent à une autre décennie.',
  '1re-aide-zola': 'Retiens : le treize janvier dix-huit cent quatre-vingt-dix-huit, Émile Zola publie « J’accuse… ! » dans L’Aurore ; l’affaire Dreyfus divise la France.',
  '1re-hugo-mort': 'Victor Hugo est mort en dix-huit cent quatre-vingt-cinq, avant le début de l’Affaire. La lettre ouverte de dix-huit cent quatre-vingt-dix-huit est signée par un romancier naturaliste.',
  '1re-jaures': 'Jean Jaurès devient un ardent défenseur de Dreyfus, mais il n’est pas l’auteur de cette lettre. Elle est signée par le romancier des Rougon-Macquart.',
  '1re-aide-1905': 'Retiens : la loi du neuf décembre dix-neuf cent cinq sépare les Églises et l’État ; elle garantit la liberté de conscience et le libre exercice des cultes.',
  '1re-ecole-obligatoire': 'L’école primaire devient obligatoire avec les lois Ferry, en dix-huit cent quatre-vingt-deux. Relis l’article : il parle des cultes, donc des religions.',
  '1re-vote-femmes': 'Les femmes n’obtiennent le droit de vote qu’en dix-neuf cent quarante-quatre. L’article du document parle des cultes : cherche ce que la République change dans ses liens avec les religions.',

  '1re-etape-5': 'Cinquième levier : la Grande Guerre, et la sortie de la guerre.',
  '1re-etape-5-regle': 'Relis la date et le lieu du document, puis range les choix sur la frise : un seul correspond exactement à ce moment de la guerre.',
  '1re-aide-armistice': 'Retiens : le onze novembre dix-neuf cent dix-huit, l’armistice signé à Rethondes, dans un wagon, arrête les combats ; la paix est signée à Versailles l’année suivante.',
  '1re-traite-versailles': 'Le traité de Versailles est signé plus tard, le vingt-huit juin dix-neuf cent dix-neuf : c’est la paix. À Rethondes, on arrête d’abord les combats.',
  '1re-brest-litovsk': 'Le traité de Brest-Litovsk, en mars dix-neuf cent dix-huit, met fin à la guerre entre l’Allemagne et la Russie des bolcheviks. En novembre, à Rethondes, ce sont les Alliés et l’Allemagne qui arrêtent les combats.',
  '1re-aide-wilson': 'Retiens : en janvier dix-neuf cent dix-huit, Woodrow Wilson présente ses quatorze points ; la Société des nations naît avec les traités de paix.',
  '1re-roosevelt': 'Franklin Roosevelt préside les États-Unis pendant la Seconde Guerre mondiale et prépare l’ONU. Les quatorze points datent de la Première, une génération plus tôt.',
  '1re-clemenceau': 'Clemenceau est le chef du gouvernement français, pas un président américain ; à la conférence de la paix, il veut surtout la sécurité de la France face à l’Allemagne.',

  '1re-etape-6': 'Dernier levier : la ville et la famille aujourd’hui, dans un monde qui se recompose.',
  '1re-etape-6-regle': 'Relis le document : il décrit un mouvement précis. Choisis la notion dont la définition correspond exactement, pas une notion voisine.',
  '1re-aide-metropolisation': 'Retiens : la métropolisation concentre les hommes, les richesses et les fonctions de commandement dans les grandes villes, reliées entre elles en réseau.',
  '1re-periurbanisation': 'La périurbanisation, c’est l’étalement de la ville vers ses périphéries, avec ses lotissements. Ici, il s’agit de la concentration des fonctions de commandement au cœur des plus grandes villes.',
  '1re-exode-rural': 'L’exode rural est le départ des habitants des campagnes vers les villes, surtout aux dix-neuvième et vingtième siècles. La carte montre autre chose : ce qui se concentre dans les plus grandes villes.',
  '1re-aide-delocalisation': 'Retiens : une délocalisation transfère une production vers un autre pays, souvent pour profiter d’une main-d’œuvre moins chère ; elle recompose les espaces productifs.',
  '1re-relocalisation': 'La relocalisation, c’est le mouvement inverse : le retour d’une production dans son pays d’origine. Ici, la production part vers un pays où le travail coûte moins cher.',
  '1re-reconversion': 'La reconversion, c’est le changement d’activité d’un territoire ou d’une personne, souvent après une fermeture. Le transfert de la production, lui, porte un autre nom.',

  // ——— 1re techno : les quais de la révolution ———
  '1tec-etape-1': 'Premier caisson : la Révolution française.',
  '1tec-etape-1-regle': 'Relis la date du document, puis range les choix sur la frise : un seul correspond exactement à ce moment de la Révolution.',
  '1tec-aide-ddhc': 'Retiens : le vingt-six août dix-sept cent quatre-vingt-neuf, l’Assemblée nationale adopte la Déclaration des droits de l’homme et du citoyen : les hommes naissent et demeurent libres et égaux en droits.',
  '1tec-code-civil': 'Le Code civil date de dix-huit cent quatre, sous Napoléon Bonaparte : il organise le droit des personnes et de la propriété. En dix-sept cent quatre-vingt-neuf, l’Assemblée proclame des principes, dans une déclaration.',
  '1tec-bill-of-rights': 'Le Bill of Rights est anglais, et il date de seize cent quatre-vingt-neuf, un siècle plus tôt. En août dix-sept cent quatre-vingt-neuf, c’est l’Assemblée nationale française qui adopte une déclaration.',
  '1tec-empire': 'L’Empire est proclamé plus tard, en dix-huit cent quatre, par Napoléon Bonaparte. En dix-sept cent quatre-vingt-douze, la royauté abolie laisse place à un régime sans roi ni empereur.',
  '1tec-monarchie-constit': 'La monarchie constitutionnelle, avec un roi dont le pouvoir est limité, est justement ce qui tombe en dix-sept cent quatre-vingt-douze. Le régime suivant n’a plus de roi.',

  '1tec-etape-2': 'Deuxième caisson : l’Europe de Napoléon, puis celle du congrès de Vienne.',
  '1tec-etape-2-regle': 'Repère la date et le lieu du document : une victoire de l’Empereur, ou la paix qui suit sa chute. Écarte ce qui appartient à un autre moment de son histoire.',
  '1tec-aide-austerlitz': 'Retiens : le deux décembre dix-huit cent cinq, à Austerlitz, Napoléon bat les armées autrichienne et russe ; c’est sa victoire la plus célèbre.',
  '1tec-waterloo': 'Waterloo, en Belgique, est la défaite finale de Napoléon, en juin dix-huit cent quinze. Sa plus célèbre victoire date de décembre dix-huit cent cinq, contre l’Autriche et la Russie.',
  '1tec-trafalgar': 'Trafalgar est une bataille navale d’octobre dix-huit cent cinq, et c’est une défaite : la flotte franco-espagnole y est battue par les Anglais de Nelson. La grande victoire de décembre se gagne sur terre.',

  '1tec-etape-3': 'Troisième caisson : les promesses de dix-huit cent quarante-huit.',
  '1tec-etape-3-regle': 'Relis le document : il parle de liberté ou d’égalité. Cherche la mesure de dix-huit cent quarante-huit qui lui correspond, et écarte celles d’une autre époque.',
  '1tec-aide-suffrage': 'Retiens : en mars dix-huit cent quarante-huit, la Deuxième République instaure le suffrage universel masculin : tous les hommes de vingt et un ans et plus peuvent voter.',
  '1tec-greve': 'Le droit de grève n’est reconnu qu’en dix-huit cent soixante-quatre, sous le Second Empire. En dix-huit cent quarante-huit, la République donne à tous les hommes le droit de voter : c’est le suffrage universel masculin.',
  '1tec-ecole': 'L’école primaire gratuite, laïque et obligatoire vient des lois Ferry, au début des années dix-huit cent quatre-vingt. En dix-huit cent quarante-huit, tous les hommes obtiennent le droit de voter.',

  '1tec-etape-4': 'Quatrième caisson : le Second Empire transforme les villes et les ports.',
  '1tec-etape-4-regle': 'Repère la période du document, de dix-huit cent cinquante-deux à dix-huit cent soixante-dix, puis écarte les personnages qui vivent avant ou après.',
  '1tec-aide-napoleon-iii': 'Retiens : neveu de Napoléon premier, Louis-Napoléon Bonaparte devient l’empereur Napoléon trois en dix-huit cent cinquante-deux ; le Second Empire tombe en dix-huit cent soixante-dix.',
  '1tec-napoleon-ier': 'Napoléon premier est l’empereur du Premier Empire, mort en dix-huit cent vingt et un. Le Second Empire est le régime de son neveu.',
  '1tec-louis-philippe': 'Louis-Philippe est le roi de la monarchie de Juillet, renversé en dix-huit cent quarante-huit. L’empereur de dix-huit cent cinquante-deux est le neveu de Napoléon premier.',
  '1tec-aide-haussmann': 'Retiens : sous le Second Empire, le préfet Haussmann transforme Paris : larges boulevards, égouts, parcs et immeubles alignés.',
  '1tec-eiffel': 'Gustave Eiffel est un ingénieur ; sa tour est construite pour l’Exposition universelle de dix-huit cent quatre-vingt-neuf, sous la Troisième République. Le préfet des grands travaux de Napoléon trois est Haussmann.',
  '1tec-vauban': 'Vauban est l’ingénieur militaire de Louis quatorze, au dix-septième siècle, célèbre pour ses fortifications. Paris est transformé deux siècles plus tard.',

  '1tec-etape-5': 'Cinquième caisson : la République s’enracine avant dix-neuf cent quatorze.',
  '1tec-etape-5-regle': 'Relis le document : sa date et ses mots exacts suffisent. Écarte les réponses qui appartiennent à une autre décennie.',

  '1tec-etape-6': 'Dernier caisson : le port d’aujourd’hui, ouvert sur le monde.',
  '1tec-etape-6-regle': 'Relis la carte : elle décrit où se concentrent les activités, ou jusqu’où le port rayonne. Choisis la notion dont la définition correspond exactement.',
  '1tec-aide-littoralisation': 'Retiens : la littoralisation concentre les hommes et les activités au bord de la mer ; les grands ports attirent raffineries, usines et terminaux à conteneurs.',
  '1tec-metropolisation': 'La métropolisation concentre les hommes et les activités dans les plus grandes villes, qu’elles soient sur la côte ou non. Ici, ce qui attire, c’est le bord de mer.',
  '1tec-periurbanisation': 'La périurbanisation, c’est l’étalement des villes vers leurs périphéries. Ici, les usines, le port et les habitants se regroupent au bord de la mer.',
  '1tec-aide-hinterland': 'Retiens : l’hinterland, ou arrière-pays, est l’espace intérieur qu’un port dessert par la route, le rail et les fleuves ; plus il est vaste, plus le port est puissant.',
  '1tec-littoral': 'Le littoral est la bande de terre au bord de la mer. L’espace intérieur, desservi par le port grâce aux routes, aux voies ferrées et aux fleuves, s’appelle l’hinterland, ou arrière-pays.',
  '1tec-facade': 'Une façade maritime est un ensemble de ports voisins sur une même côte. L’espace intérieur desservi par un port s’appelle l’hinterland.',

  // ——— 1re pro : la cargaison des deux mondes ———
  '1pro-etape-1': 'Premier objet : l’âge de la vapeur et du charbon.',
  '1pro-etape-1-regle': 'Pense à l’époque du document : le dix-neuvième siècle, celui du charbon et de la vapeur. Écarte les énergies et les machines qui se répandent plus tard.',
  '1pro-aide-vapeur': 'Retiens : la machine à vapeur, perfectionnée par James Watt, fait tourner les usines, les trains et les navires du dix-neuvième siècle ; c’est le cœur de l’industrialisation.',
  '1pro-electrique': 'Le moteur électrique se répand plus tard, à la fin du dix-neuvième siècle. Les usines et les navires du début de l’industrialisation marchent au charbon, grâce à la vapeur.',
  '1pro-eolienne': 'L’éolienne moderne produit de l’électricité, surtout depuis la fin du vingtième siècle. L’industrialisation du dix-neuvième siècle repose sur le charbon et la vapeur.',
  '1pro-aide-charbon': 'Retiens : au dix-neuvième siècle, le charbon est la grande énergie de l’industrie : on le brûle pour chauffer l’eau des machines à vapeur.',
  '1pro-petrole': 'Le pétrole ne devient la grande énergie qu’au vingtième siècle, avec le moteur à explosion. Les machines à vapeur du dix-neuvième siècle brûlent surtout du charbon.',
  '1pro-gaz': 'Le gaz naturel est surtout exploité au vingtième siècle. Au dix-neuvième, on brûle du charbon, extrait des mines, pour chauffer l’eau des machines.',

  '1pro-etape-2': 'Deuxième objet : l’Europe se partage le monde.',
  '1pro-etape-2-regle': 'Relis le document : il décrit une domination, ou il donne une date et un lieu. Choisis la notion ou le territoire qui correspond exactement.',
  '1pro-aide-colonisation': 'Retiens : la colonisation, c’est la domination d’un territoire et de sa population par un pays étranger ; au dix-neuvième siècle, les puissances européennes se partagent l’Afrique et une partie de l’Asie.',
  '1pro-decolonisation': 'La décolonisation, c’est l’inverse : le moment où une colonie devient indépendante, surtout après dix-neuf cent quarante-cinq.',
  '1pro-mondialisation': 'La mondialisation est la mise en relation du monde par les échanges ; elle ne suppose pas qu’un pays en domine un autre. Ici, un pays étranger s’installe et commande.',
  '1pro-aide-algerie': 'Retiens : en dix-huit cent trente, la France débarque près d’Alger ; c’est le début de la conquête de l’Algérie, qui reste française jusqu’en dix-neuf cent soixante-deux.',
  '1pro-egypte': 'L’Égypte passe sous le contrôle du Royaume-Uni, en dix-huit cent quatre-vingt-deux. En dix-huit cent trente, la France débarque près d’Alger.',
  '1pro-maroc': 'Le Maroc ne devient un protectorat français qu’en dix-neuf cent douze. En dix-huit cent trente, la France débarque près d’Alger.',

  '1pro-etape-3': 'Troisième objet : l’Italie devient une nation.',
  '1pro-etape-3-regle': 'Relis le document : il donne une date et un rôle. Écarte ce qui appartient à l’unité allemande, ou à un autre moment de l’unité italienne.',
  '1pro-aide-garibaldi': 'Retiens : en dix-huit cent soixante, Garibaldi et ses mille volontaires, les Chemises rouges, conquièrent la Sicile et Naples ; Cavour, lui, prépare l’unité par la diplomatie.',
  '1pro-cavour': 'Cavour fait l’unité par la diplomatie, depuis Turin ; il ne combat pas. Le chef des Chemises rouges, à la tête de ses volontaires, s’appelle Garibaldi.',
  '1pro-bismarck': 'Bismarck fait l’unité de l’Allemagne, pas celle de l’Italie. Le héros des Chemises rouges est italien.',
  '1pro-aide-rome': 'Retiens : le royaume d’Italie naît en dix-huit cent soixante et un ; Rome n’en devient la capitale qu’en dix-huit cent soixante et onze, après Turin puis Florence.',
  '1pro-turin': 'Turin est la première capitale du royaume d’Italie, en dix-huit cent soixante et un, puis vient Florence. Rome ne devient la capitale qu’en dix-huit cent soixante et onze.',
  '1pro-venise': 'Venise rejoint l’Italie en dix-huit cent soixante-six, mais elle n’en devient pas la capitale. La capitale de l’Italie unifiée est Rome.',

  '1pro-etape-4': 'Quatrième objet : la Grande Guerre.',
  '1pro-etape-4-regle': 'Relis la date et le lieu du document, puis range les choix sur la frise : un seul correspond exactement à ce moment de la guerre.',
  '1pro-aide-tranchees': 'Retiens : à partir de la fin de dix-neuf cent quatorze, sur le front de l’Ouest, les soldats s’enterrent dans des tranchées, face à face : c’est la guerre de position.',
  '1pro-mouvement': 'La guerre de mouvement, ce sont les premiers mois de la guerre, en dix-neuf cent quatorze, et la fin, en dix-neuf cent dix-huit. Entre les deux, le front se fige, et les soldats s’enterrent.',
  '1pro-guerre-froide': 'La guerre froide oppose les États-Unis et l’URSS après dix-neuf cent quarante-cinq, sans combat direct entre eux. La Grande Guerre, sur le front de l’Ouest, se fige dans les tranchées.',

  '1pro-etape-5': 'Cinquième objet : comment les marchandises sont produites et transportées aujourd’hui.',
  '1pro-etape-5-regle': 'Relis le document : il décrit un mouvement précis, d’une production ou d’une marchandise. Choisis la notion dont la définition correspond exactement.',
  '1pro-aide-intermodalite': 'Retiens : l’intermodalité, c’est l’enchaînement de plusieurs moyens de transport, navire, train, camion, pour une même marchandise ; le conteneur la rend simple et rapide.',
  '1pro-delocalisation': 'Une délocalisation déplace une production vers un autre pays. Ici, la même marchandise change seulement de moyen de transport, du navire au train.',
  '1pro-periurbanisation': 'La périurbanisation, c’est l’étalement des villes vers leurs périphéries. Ici, il s’agit d’une marchandise qui passe du navire au train.',

  '1pro-etape-6': 'Dernier objet : l’Italie et la France aujourd’hui, dans l’Union européenne.',
  '1pro-etape-6-regle': 'Relis le document : il décrit une grande ville qui attire, ou une monnaie partagée. Choisis la notion ou la réponse qui correspond exactement.',
  '1pro-aide-euro': 'Retiens : l’euro, mis en circulation en deux mille deux, est la monnaie commune de la plupart des pays de l’Union européenne, dont la France et l’Italie.',
  '1pro-franc': 'Le franc était la monnaie de la France avant l’euro, mis en circulation en deux mille deux. Aujourd’hui, la plupart des pays de l’Union partagent une monnaie unique.',
  '1pro-dollar': 'Le dollar est la monnaie des États-Unis. La plupart des pays de l’Union européenne partagent une monnaie unique, l’euro.',

  // ——— Terminale : le réseau du monde ———
  'tle-etape-1': 'Premier connecteur : la crise de dix-neuf cent vingt-neuf.',
  'tle-etape-1-regle': 'Relis la dépêche : elle donne la date et le lieu. Cherche la ville ou l’acteur qui correspond exactement, pas un pays frappé ensuite.',
  'tle-aide-krach': 'Retiens : le jeudi vingt-quatre octobre dix-neuf cent vingt-neuf, le krach de Wall Street, à New York, ouvre une crise économique mondiale.',
  'tle-londres': 'Londres est une grande place financière, mais le krach de dix-neuf cent vingt-neuf éclate de l’autre côté de l’Atlantique, à Wall Street, dans la première puissance économique du monde.',
  'tle-berlin': 'L’Allemagne est durement frappée par la crise, mais elle la subit : le krach éclate aux États-Unis, à la Bourse de Wall Street.',
  'tle-aide-new-deal': 'Retiens : élu en dix-neuf cent trente-deux, Franklin Roosevelt lance le New Deal dès dix-neuf cent trente-trois : l’État intervient dans l’économie pour combattre la crise.',
  'tle-hoover': 'Herbert Hoover est le président du krach, de dix-neuf cent vingt-neuf à dix-neuf cent trente-trois ; il est battu en dix-neuf cent trente-deux par celui qui lance le New Deal.',
  'tle-truman': 'Harry Truman devient président en dix-neuf cent quarante-cinq, à la fin de la Seconde Guerre mondiale. Le New Deal est lancé douze ans plus tôt, par son prédécesseur.',

  'tle-etape-2': 'Deuxième connecteur : la Seconde Guerre mondiale et ses basculements.',
  'tle-etape-2-regle': 'Relis la dépêche : la date et le lieu désignent un seul front. Écarte les batailles d’une autre guerre ou d’un autre théâtre d’opérations.',
  'tle-aide-stalingrad': 'Retiens : début février dix-neuf cent quarante-trois, la capitulation allemande à Stalingrad marque un tournant de la guerre sur le front de l’Est.',
  'tle-verdun': 'Verdun est une bataille de la Première Guerre mondiale, en dix-neuf cent seize. La dépêche parle d’une ville au bord de la Volga, en dix-neuf cent quarante-trois.',
  'tle-midway': 'Midway est un tournant de la guerre, mais dans le Pacifique, entre Américains et Japonais, en juin dix-neuf cent quarante-deux. Ici, la bataille se livre en URSS, au bord de la Volga.',
  'tle-aide-normandie': 'Retiens : le six juin dix-neuf cent quarante-quatre, le débarquement de Normandie ouvre un nouveau front à l’Ouest ; celui de Provence suit le quinze août.',
  'tle-provence': 'Le débarquement de Provence a lieu plus tard, le quinze août dix-neuf cent quarante-quatre, sur la Méditerranée. Le six juin, les navires traversent la Manche.',
  'tle-sicile': 'Les Alliés débarquent en Sicile en juillet dix-neuf cent quarante-trois, près d’un an plus tôt. Le six juin dix-neuf cent quarante-quatre, ils traversent la Manche.',

  'tle-etape-3': 'Troisième connecteur : un nouvel ordre mondial, puis un monde bipolaire.',
  'tle-etape-3-regle': 'Relis la dépêche : sa date et son lieu suffisent. Écarte l’organisation ou la crise qui appartient à une autre période.',
  'tle-aide-onu': 'Retiens : la Charte de San Francisco, signée le vingt-six juin dix-neuf cent quarante-cinq, fonde l’Organisation des Nations unies, pour maintenir la paix et la sécurité internationales.',
  'tle-sdn': 'La Société des nations date de la fin de la Première Guerre mondiale, et elle n’a pas su empêcher la Seconde. En dix-neuf cent quarante-cinq, les vainqueurs fondent une organisation nouvelle.',
  'tle-otan': 'L’OTAN est une alliance militaire du bloc occidental, créée en dix-neuf cent quarante-neuf, pendant la guerre froide. La Charte de San Francisco fonde une organisation ouverte à toutes les nations.',
  'tle-aide-cuba': 'Retiens : en octobre dix-neuf cent soixante-deux, la crise de Cuba est le moment le plus dangereux de la guerre froide ; elle se règle par la négociation entre Kennedy et Khrouchtchev.',
  'tle-blocus-berlin': 'Le blocus de Berlin, en dix-neuf cent quarante-huit et quarante-neuf, est la première grande crise de la guerre froide, en Europe. En octobre dix-neuf cent soixante-deux, la crise se joue près de la Floride.',
  'tle-coree': 'La guerre de Corée, de dix-neuf cent cinquante à dix-neuf cent cinquante-trois, est une vraie guerre, en Asie. En dix-neuf cent soixante-deux, la crise porte sur des missiles installés dans une île des Caraïbes.',

  'tle-etape-4': 'Quatrième connecteur : la décolonisation, et la France dans le monde d’après-guerre.',
  'tle-etape-4-regle': 'Relis la dépêche : le lieu ou la date te disent de quel événement il s’agit. Écarte les noms qui appartiennent à une autre décennie.',
  'tle-aide-bandung': 'Retiens : en avril dix-neuf cent cinquante-cinq, la conférence de Bandung, en Indonésie, réunit des pays d’Asie et d’Afrique contre le colonialisme ; le tiers-monde s’affirme.',
  'tle-yalta': 'Yalta, en Crimée, accueille en février dix-neuf cent quarante-cinq Roosevelt, Churchill et Staline, qui préparent la fin de la guerre. La conférence de dix-neuf cent cinquante-cinq se tient en Indonésie.',
  'tle-evian': 'À Évian, en mars dix-neuf cent soixante-deux, sont signés les accords qui mènent à l’indépendance de l’Algérie. La conférence des pays d’Asie et d’Afrique se tient sept ans plus tôt, en Indonésie.',
  'tle-aide-de-gaulle': 'Retiens : rappelé au pouvoir en dix-neuf cent cinquante-huit, Charles de Gaulle fonde la Cinquième République et en devient le premier président.',
  'tle-pompidou': 'Georges Pompidou est d’abord le Premier ministre du général, puis son successeur à l’Élysée, en dix-neuf cent soixante-neuf. Le premier président de la Cinquième République est le fondateur du régime.',
  'tle-mitterrand': 'François Mitterrand est un opposant au général ; il n’est élu président qu’en dix-neuf cent quatre-vingt-un. Cherche le fondateur du régime.',

  'tle-etape-5': 'Cinquième connecteur : des années soixante-dix aux années quatre-vingt-dix.',
  'tle-etape-5-regle': 'Relis la dépêche : la fonction ou le lieu qu’elle cite désigne une seule réponse. Écarte les personnes qui jouent un autre rôle, et les traités d’une autre époque.',
  'tle-aide-veil': 'Retiens : la loi Veil, promulguée en janvier dix-neuf cent soixante-quinze, dépénalise l’interruption volontaire de grossesse ; c’est un tournant de la société française.',
  'tle-beauvoir': 'Simone de Beauvoir est une philosophe et une écrivaine féministe, autrice du Deuxième Sexe ; elle n’a jamais été ministre. La loi est défendue par la ministre de la Santé.',
  'tle-halimi': 'Gisèle Halimi est une avocate qui défend le droit à l’avortement, notamment au procès de Bobigny ; elle n’est pas ministre. Cherche la ministre de la Santé.',
  'tle-aide-badinter': 'Retiens : en dix-neuf cent quatre-vingt-un, la loi défendue par Robert Badinter, garde des Sceaux, abolit la peine de mort en France.',
  'tle-mitterrand-abolition': 'François Mitterrand, président depuis le mois de mai, s’était engagé à abolir la peine de mort, mais il n’est pas garde des Sceaux. Le discours est celui de son ministre de la Justice.',
  'tle-chirac': 'Jacques Chirac est alors maire de Paris, dans l’opposition ; il n’est pas ministre. Le discours est celui du ministre de la Justice du nouveau gouvernement.',
  'tle-aide-maastricht': 'Retiens : le traité de Maastricht, signé en dix-neuf cent quatre-vingt-douze, fonde l’Union européenne et prévoit la monnaie unique, l’euro.',
  'tle-rome': 'Le traité de Rome, en dix-neuf cent cinquante-sept, crée la Communauté économique européenne, entre six pays. L’Union européenne naît trente-cinq ans plus tard, dans une ville des Pays-Bas.',
  'tle-lisbonne': 'Le traité de Lisbonne, signé en deux mille sept, réforme le fonctionnement d’une Union qui existe déjà. Elle a été fondée quinze ans plus tôt, dans une ville des Pays-Bas.',

  'tle-etape-6': 'Dernier connecteur : la mondialisation passe par les mers et les océans.',
  'tle-etape-6-regle': 'Repère sur la carte ce qui est décrit : une distance aux côtes, deux mers à relier, ou des flux qui relient le monde. Choisis l’espace, le passage ou la notion qui correspond exactement.',
  'tle-aide-zee': 'Retiens : depuis la convention de Montego Bay, chaque État côtier dispose d’une zone économique exclusive de deux cents milles marins ; grâce à l’outre-mer, celle de la France est l’une des plus vastes du monde.',
  'tle-eaux-territoriales': 'Les eaux territoriales ne s’étendent que jusqu’à douze milles marins : l’État y est souverain comme sur terre. L’espace des deux cents milles, où il exploite seul les ressources, porte un autre nom.',
  'tle-haute-mer': 'La haute mer commence au-delà, et elle n’appartient à aucun État. L’espace des deux cents milles, réservé à l’État côtier pour ses ressources, porte un autre nom.',
  'tle-aide-suez': 'Retiens : le canal de Suez, en Égypte, relie la Méditerranée à la mer Rouge ; avec les grands détroits, c’est un point de passage clé de la mondialisation.',
  'tle-panama': 'Le canal de Panama relie l’océan Atlantique et l’océan Pacifique, à travers l’Amérique centrale. Entre la Méditerranée et la mer Rouge, le passage est un canal creusé en Égypte.',
  'tle-gibraltar': 'Le détroit de Gibraltar relie la Méditerranée à l’océan Atlantique, entre l’Espagne et le Maroc. Vers la mer Rouge et l’Asie, le passage est un canal creusé en Égypte.',
  'tle-aide-mondialisation': 'Retiens : la mondialisation est la mise en relation des territoires du monde par des flux de marchandises, de capitaux, de personnes et d’informations ; les mers et les câbles sous-marins en sont les grands vecteurs.',
  'tle-metropolisation': 'La métropolisation, c’est la concentration des hommes et des activités dans les plus grandes villes, l’un des effets de ce phénomène. Ici, il s’agit de la mise en relation du monde entier par les flux.',
  'tle-littoralisation': 'La littoralisation, c’est la concentration des hommes et des activités sur les littoraux, autre effet de ce phénomène. Ici, on parle des flux qui relient toutes les parties du monde.',

  // ——— Terminale techno : le barrage des frontières ———
  'ttec-etape-1': 'Première vanne : le temps des totalitarismes.',
  'ttec-etape-1-regle': 'Relis le document : il désigne un pays, un régime et une période. Écarte les dirigeants et les dates qui appartiennent à un autre moment.',
  'ttec-aide-1933': 'Retiens : le trente janvier dix-neuf cent trente-trois, Hitler est nommé chancelier ; en quelques mois, il installe une dictature totalitaire.',
  'ttec-1923': 'En dix-neuf cent vingt-trois, Hitler tente un coup d’État à Munich, et il échoue : il est emprisonné. Il n’arrive au pouvoir que dix ans plus tard, nommé chancelier.',
  'ttec-1939': 'En dix-neuf cent trente-neuf, Hitler est déjà au pouvoir depuis six ans : c’est l’année où il envahit la Pologne, et où commence la Seconde Guerre mondiale.',
  'ttec-aide-staline': 'Retiens : successeur de Lénine, Staline impose à partir de la fin des années vingt une dictature totalitaire en URSS : culte du chef, terreur et camps du Goulag.',
  'ttec-lenine': 'Lénine dirige la révolution bolchevique de dix-neuf cent dix-sept, mais il meurt en dix-neuf cent vingt-quatre. C’est son successeur qui impose sa dictature totalitaire.',
  'ttec-gorbatchev': 'Gorbatchev dirige l’URSS bien plus tard, à partir de dix-neuf cent quatre-vingt-cinq, et il tente de la réformer. Le dictateur des années trente est Staline.',

  'ttec-etape-2': 'Deuxième vanne : la France dans la Seconde Guerre mondiale.',
  'ttec-etape-2-regle': 'Relis le document : il parle de Londres, ou de la ligne entre deux zones. Écarte ceux qui ont choisi l’autre camp, et les lignes d’une autre époque.',
  'ttec-aide-de-gaulle': 'Retiens : le dix-huit juin dix-neuf cent quarante, depuis Londres, à la radio de la BBC, le général de Gaulle appelle les Français à continuer le combat.',
  'ttec-petain': 'Pétain fait l’inverse : chef du gouvernement, il demande l’armistice, puis dirige le régime de Vichy, qui collabore avec l’Allemagne nazie.',
  'ttec-moulin': 'Jean Moulin est un grand résistant, qui unifie la Résistance intérieure à partir de dix-neuf cent quarante-deux. L’appel du dix-huit juin est lancé depuis Londres par un général.',
  'ttec-aide-demarcation': 'Retiens : après l’armistice de juin dix-neuf cent quarante, la ligne de démarcation sépare la zone occupée par l’Allemagne et la zone libre, gouvernée depuis Vichy.',
  'ttec-maginot': 'La ligne Maginot est une ligne de fortifications bâtie avant la guerre, le long de la frontière de l’Est. La ligne qui sépare la zone occupée de la zone libre porte un autre nom.',
  'ttec-rideau-fer': 'Le rideau de fer coupe l’Europe en deux après dix-neuf cent quarante-cinq, pendant la guerre froide. En France, à partir de dix-neuf cent quarante, une ligne sépare la zone occupée et la zone libre.',

  'ttec-etape-3': 'Troisième vanne : un nouvel ordre mondial, puis un monde coupé en deux.',
  'ttec-etape-3-regle': 'Relis le document : sa date et son lieu suffisent. Écarte l’organisation, la ville ou l’année qui appartient à une autre période.',
  'ttec-aide-nuremberg': 'Retiens : de novembre dix-neuf cent quarante-cinq à octobre dix-neuf cent quarante-six, à Nuremberg, un tribunal international juge les principaux dirigeants nazis, notamment pour crimes contre l’humanité.',
  'ttec-berlin': 'Berlin, en ruines, est la capitale vaincue. Le procès des dirigeants nazis se tient dans une autre ville allemande, Nuremberg, où le parti nazi tenait ses grands rassemblements.',
  'ttec-la-haye': 'La Haye accueille aujourd’hui des cours de justice internationales, mais le grand procès des dirigeants nazis se tient en Allemagne, à Nuremberg.',
  'ttec-aide-mur': 'Retiens : construit en dix-neuf cent soixante et un, le mur de Berlin tombe le neuf novembre dix-neuf cent quatre-vingt-neuf ; deux ans plus tard, l’URSS disparaît.',
  'ttec-1961': 'En dix-neuf cent soixante et un, le mur est construit, pas détruit : la RDA coupe Berlin en deux pour empêcher les départs vers l’Ouest.',
  'ttec-1991': 'En dix-neuf cent quatre-vingt-onze, c’est l’URSS qui disparaît, deux ans après la chute du mur.',

  'ttec-etape-4': 'Quatrième vanne : la fin des empires coloniaux.',
  'ttec-etape-4-regle': 'Relis le document : le lieu et la date désignent un seul événement. Écarte les accords et les conférences d’une autre décennie.',
  'ttec-aide-evian': 'Retiens : signés le dix-huit mars dix-neuf cent soixante-deux, les accords d’Évian mettent fin à la guerre d’Algérie ; l’Algérie devient indépendante en juillet.',
  'ttec-geneve': 'Les accords de Genève, en dix-neuf cent cinquante-quatre, mettent fin à la guerre d’Indochine. Ceux de dix-neuf cent soixante-deux sont signés au bord du même lac, mais du côté français.',
  'ttec-munich': 'Les accords de Munich, en dix-neuf cent trente-huit, livrent une partie de la Tchécoslovaquie à Hitler. Ceux de dix-neuf cent soixante-deux concernent l’Algérie.',

  'ttec-etape-5': 'Cinquième vanne : l’Europe se construit et ouvre ses frontières.',
  'ttec-etape-5-regle': 'Relis le document : le lieu ou la date te disent de quel accord il s’agit. Écarte les traités d’une autre époque, ou d’un autre objet.',
  'ttec-aide-schengen': 'Retiens : signés en dix-neuf cent quatre-vingt-cinq à Schengen, au Luxembourg, les accords de Schengen suppriment peu à peu les contrôles des personnes aux frontières entre les pays qui les appliquent.',
  'ttec-rome': 'Le traité de Rome, en dix-neuf cent cinquante-sept, crée la Communauté économique européenne et un marché commun ; il ne supprime pas les contrôles des personnes aux frontières.',
  'ttec-versailles': 'Le traité de Versailles, en dix-neuf cent dix-neuf, conclut la Première Guerre mondiale et redessine des frontières ; il ne les ouvre pas.',

  'ttec-etape-6': 'Dernière vanne : la frontière d’aujourd’hui, traversée par les flux.',
  'ttec-etape-6-regle': 'Relis le document : il décrit des personnes ou des marchandises qui passent la frontière. Choisis la notion qui correspond exactement à ce flux.',
  'ttec-aide-frontalier': 'Retiens : un travailleur frontalier vit d’un côté de la frontière et travaille de l’autre ; il la traverse chaque jour ou chaque semaine.',
  'ttec-migrant': 'Un migrant s’installe pour vivre dans un autre pays. Celui qui traverse la frontière chaque jour pour travailler, puis rentre chez lui, est un frontalier.',
  'ttec-touriste': 'Un touriste voyage pour ses loisirs. Celui qui traverse la frontière chaque jour pour travailler est un frontalier.',
  'ttec-aide-plateforme': 'Retiens : une plateforme multimodale fait passer les marchandises d’un mode de transport à un autre, du fleuve au rail ou à la route ; c’est un nœud des échanges mondialisés.',
  'ttec-metropole': 'Une métropole est une grande ville qui concentre des fonctions de commandement. Le lieu où les marchandises changent de moyen de transport est une plateforme multimodale.',
  'ttec-ecluse': 'Une écluse fait passer les bateaux d’un niveau d’eau à un autre ; elle ne fait pas changer les marchandises de moyen de transport.',

  // ——— Terminale pro : l'enquête des territoires ———
  'tpro-etape-1': 'Premier relevé : le territoire transformé par la croissance d’après-guerre.',
  'tpro-etape-1-regle': 'Repère l’époque dont parle le document : les années de forte croissance après la guerre, ou la crise qui les termine. Puis écarte les périodes d’un autre siècle.',
  'tpro-aide-trente-glorieuses': 'Retiens : de dix-neuf cent quarante-cinq à dix-neuf cent soixante-quinze environ, la France connaît les Trente Glorieuses : forte croissance, plein emploi et grands équipements.',
  'tpro-annees-folles': 'Les Années folles, ce sont les années vingt, après la Première Guerre mondiale. La forte croissance qui suit la Seconde porte un autre nom.',
  'tpro-belle-epoque': 'La Belle Époque désigne les années d’avant dix-neuf cent quatorze. Les trente années de croissance commencent après dix-neuf cent quarante-cinq.',
  'tpro-aide-choc-petrolier': 'Retiens : en dix-neuf cent soixante-treize, le premier choc pétrolier multiplie par quatre le prix du pétrole ; il met fin aux Trente Glorieuses.',
  'tpro-krach': 'Le krach de Wall Street éclate en dix-neuf cent vingt-neuf, bien avant. En dix-neuf cent soixante-treize, c’est le prix du pétrole qui s’envole.',
  'tpro-mur': 'Le mur de Berlin tombe en dix-neuf cent quatre-vingt-neuf, seize ans plus tard. En dix-neuf cent soixante-treize, c’est le prix du pétrole qui s’envole.',

  'tpro-etape-2': 'Deuxième relevé : le monde d’après-guerre, entre reconstruction et guerre froide.',
  'tpro-etape-2-regle': 'Relis le document : il parle d’une aide pour reconstruire, ou d’un monde coupé en deux. Écarte ce qui appartient à une autre époque ou à un autre pays.',
  'tpro-aide-marshall': 'Retiens : à partir de dix-neuf cent quarante-sept, le plan Marshall apporte l’aide des États-Unis à la reconstruction de l’Europe de l’Ouest.',
  'tpro-new-deal': 'Le New Deal est le plan de Roosevelt contre la crise de dix-neuf cent vingt-neuf, aux États-Unis. L’aide américaine à l’Europe après la guerre porte le nom d’un secrétaire d’État.',
  'tpro-schuman': 'Le plan Schuman, en dix-neuf cent cinquante, propose de mettre en commun le charbon et l’acier de la France et de l’Allemagne : c’est un projet européen. L’aide à la reconstruction vient des États-Unis.',
  'tpro-aide-guerre-froide': 'Retiens : de dix-neuf cent quarante-sept à dix-neuf cent quatre-vingt-onze, la guerre froide oppose les États-Unis et l’URSS, deux blocs qui s’affrontent sans guerre directe entre eux.',
  'tpro-2gm': 'La Seconde Guerre mondiale est une vraie guerre, où les États-Unis et l’URSS sont alliés contre l’Allemagne nazie. Leur affrontement d’après-guerre se fait sans combat direct.',
  'tpro-algerie': 'La guerre d’Algérie oppose la France et les indépendantistes algériens, de dix-neuf cent cinquante-quatre à dix-neuf cent soixante-deux. L’affrontement des deux Grands porte un autre nom.',

  'tpro-etape-3': 'Troisième relevé : la France de la Cinquième République.',
  'tpro-etape-3-regle': 'Relis le document : la date ou la fonction qu’il cite désigne une seule réponse. Écarte ce qui appartient à une autre époque du régime.',
  'tpro-aide-suffrage-direct': 'Retiens : depuis la réforme de dix-neuf cent soixante-deux, le président de la République est élu au suffrage universel direct, par tous les citoyens ; la première élection de ce genre a lieu en dix-neuf cent soixante-cinq.',
  'tpro-deputes': 'Le président n’est pas élu par les députés : depuis la réforme de dix-neuf cent soixante-deux, ce sont tous les citoyens qui le choisissent, au suffrage universel direct.',
  'tpro-grands-electeurs': 'Avant la réforme, en dix-neuf cent cinquante-huit, le président est élu par des grands électeurs. Depuis dix-neuf cent soixante-deux, il est élu par tous les citoyens.',

  'tpro-etape-4': 'Quatrième relevé : le territoire dans la mondialisation.',
  'tpro-etape-4-regle': 'Relis le document : il décrit où se regroupent les activités, ou qui les organise. Choisis la notion dont la définition correspond exactement.',
  'tpro-aide-ftn': 'Retiens : une firme transnationale produit et vend dans de nombreux pays ; ces grandes entreprises sont des actrices majeures de la mondialisation.',
  'tpro-pme': 'Une PME est une petite ou moyenne entreprise, souvent présente dans une seule région ou un seul pays. Celle qui produit et vend dans de nombreux pays est une firme transnationale.',
  'tpro-cooperative': 'Une coopérative appartient à ses membres, comme des agriculteurs qui vendent ensemble leur récolte. Le grand groupe présent sur tous les continents est une firme transnationale.',

  'tpro-etape-5': 'Cinquième relevé : l’environnement, un enjeu mondial.',
  'tpro-etape-5-regle': 'Relis les relevés : ils décrivent un phénomène précis, ou un accord entre les pays. Choisis la réponse qui correspond exactement.',
  'tpro-aide-paris': 'Retiens : adopté en décembre deux mille quinze, à la fin de la conférence de Paris sur le climat, l’accord de Paris engage presque tous les pays du monde à limiter le réchauffement climatique.',
  'tpro-kyoto': 'Le protocole de Kyoto est plus ancien : il est adopté en dix-neuf cent quatre-vingt-dix-sept. L’accord de deux mille quinze porte le nom de la ville où se tient la conférence.',
  'tpro-maastricht': 'Le traité de Maastricht, en dix-neuf cent quatre-vingt-douze, fonde l’Union européenne ; ce n’est pas un accord sur le climat.',
  'tpro-aide-erosion': 'Retiens : l’érosion côtière, c’est le recul du rivage sous l’action de la mer ; avec la montée des eaux, elle menace les littoraux.',
  'tpro-secheresse': 'La sécheresse est un manque d’eau prolongé, qui assèche les sols. Le recul du rivage sous l’action de la mer s’appelle l’érosion côtière.',
  'tpro-deforestation': 'La déforestation, c’est la disparition des forêts, coupées ou brûlées. Ici, c’est la mer qui grignote le rivage : c’est l’érosion côtière.',

  'tpro-etape-6': 'Dernier relevé : le territoire dans l’Europe, et face à la mer.',
  'tpro-etape-6-regle': 'Relis le document : il donne une date ou une distance. Choisis le traité ou l’espace qui correspond exactement.',
  'tpro-aide-rome': 'Retiens : en dix-neuf cent cinquante-sept, six pays, dont la France, signent le traité de Rome, qui crée la Communauté économique européenne.',
  'tpro-maastricht-cee': 'Le traité de Maastricht, en dix-neuf cent quatre-vingt-douze, fonde l’Union européenne, trente-cinq ans plus tard. La Communauté économique européenne naît en Italie, en dix-neuf cent cinquante-sept.',
  'tpro-versailles': 'Le traité de Versailles conclut la Première Guerre mondiale, en dix-neuf cent dix-neuf. La Communauté économique européenne naît après la Seconde, en Italie.',
};
