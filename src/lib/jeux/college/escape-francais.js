/**
 * L'ESCAPE GAME DE FRANÇAIS DU COLLÈGE — Adrien, de la 6e à la 3e. Camara, le
 * 06/10/2026 : « les escape games pour les maths, l'histoire-géo, le français,
 * l'anglais et les sciences ».
 *
 * UNE HISTOIRE PAR CLASSE, SIX ÉTAPES, L'ORDRE DU RÉCIT. Chaque étape travaille
 * une compétence d'étude de la langue (ou de lecture) de l'année ; réussie,
 * elle donne une LETTRE, et les six lettres forment un mot qui a un sens dans
 * l'histoire :
 *   - 6e, la bibliothèque hantée — SORTIE : homophones, participe passé avec
 *     être et avoir, classes grammaticales, fonctions, imparfait ou passé
 *     simple, synonymes et contraires ;
 *   - 5e, le manuscrit du chevalier — DRAGON : juxtaposition, coordination,
 *     subordination ; antécédent ; subjonctif ; futur ou conditionnel ; voix
 *     passive ; comparaison, métaphore, personnification ;
 *   - 4e, le journal secret — MIROIR : discours indirect, concordance des
 *     temps, sens des circonstancielles, négation, participe des pronominaux,
 *     connotation ;
 *   - 3e, l'enquête du musée — MOBILE : homophones, systèmes hypothétiques,
 *     modes, modalisation, nature des subordonnées, paronymes.
 *
 * Chaque étape tire une de ses phrases (écrites à la main, UNE seule bonne
 * réponse défendable) et mélange ses choix ; les étapes gardent l'ordre de
 * l'histoire. Chaque choix faux a son piège nommé, qui dit comment faire juste.
 * Les modes : le conditionnel n'est jamais proposé comme un mode (la
 * terminologie de 2020 en fait un temps de l'indicatif).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-francais', titre: 'Escape game de français', matiereCode: 'FRANCAIS' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'La bibliothèque hantée',
    accroche: 'Sors de la bibliothèque hantée.',
    intro: 'À la fermeture, les portes de la vieille bibliothèque se sont refermées sur toi, et un fantôme range les livres en chuchotant. Trouve les six lettres du mot qui ouvre la grande porte.',
    fin: 'Tu prononces le mot SORTIE : la grande porte grince et s’ouvre sur la nuit étoilée.',
    competences: [
      'FR_6E_LANG_HOMOPHONES', 'FR_6E_LANG_PP', 'FR_6E_LANG_CLASSES',
      'FR_6E_LANG_FONCTIONS', 'FR_6E_LANG_VALEURS', 'FR_6E_LANG_VOC_RELATIONS',
    ],
  },
  CINQUIEME: {
    titre: 'Le manuscrit du chevalier',
    accroche: 'Six fermoirs scellent un manuscrit ancien.',
    intro: 'Dans la bibliothèque de l’abbaye, un manuscrit enluminé est scellé par six fermoirs. Il cache le nom de la créature que le chevalier Aymeric a juré de combattre.',
    fin: 'Le dernier fermoir saute : le mot DRAGON apparaît en lettres d’or, et le chevalier sait enfin quel ennemi l’attend.',
    competences: [
      'FR_5E_LANG_PROPOSITIONS', 'FR_5E_LANG_RELATIVE', 'FR_5E_LANG_SUBJONCTIF',
      'FR_5E_LANG_CONDITIONNEL', 'FR_5E_LANG_VOIX', 'FR_5E_LECT_FIGURES',
    ],
  },
  QUATRIEME: {
    titre: 'Le journal secret',
    accroche: 'Un journal fermé, un reflet qui bouge.',
    intro: 'Dans le grenier de ta grand-tante, tu trouves un journal fermé par six petites serrures. Depuis que tu l’as touché, ton reflet bouge un peu trop tard.',
    fin: 'Le mot MIROIR se dessine : c’est derrière le vieux miroir du grenier que dormait le dernier secret du journal.',
    competences: [
      'FR_4E_LANG_DISCOURS', 'FR_4E_LANG_CONCORDANCE', 'FR_4E_LANG_CIRCONSTANCIELLE',
      'FR_4E_LANG_NEGATION', 'FR_4E_LANG_PP_PRONOMINAL', 'FR_4E_LANG_CONNOTATION',
    ],
  },
  TROISIEME: {
    titre: 'L’enquête du musée',
    accroche: 'Un tableau a disparu : mène l’enquête.',
    intro: 'Un tableau précieux a disparu du musée pendant la nuit, et le commissaire te confie le dossier. Chaque énigme résolue te donne une lettre : six lettres pour comprendre pourquoi le voleur a agi.',
    fin: 'Les six lettres forment MOBILE : tu as trouvé la raison du vol, et l’enquête est résolue.',
    competences: [
      'FR_3E_LANG_ORTHO', 'FR_3E_LANG_HYPOTHESE', 'FR_3E_LANG_MODES',
      'FR_3E_LANG_MODALISATION', 'FR_3E_LANG_ANALYSE', 'FR_3E_LANG_VOC_RELATIONS',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Le mot de chaque classe : une lettre par étape. */
export const MOTS = {
  SIXIEME: 'SORTIE', CINQUIEME: 'DRAGON', QUATRIEME: 'MIROIR', TROISIEME: 'MOBILE',
};

const PREFIXE = {
  SIXIEME: '6e', CINQUIEME: '5e', QUATRIEME: '4e', TROISIEME: '3e',
};

/** Une phrase de la banque : la question affichée, la bonne réponse, et chaque piège avec son erreur. */
const q = (question, bonne, pieges) => ({ question, bonne, pieges });

/*
 * LES BANQUES. Une entrée par étape : le récit (affiché) et ses phrases.
 */
const ETAPES = {
  SIXIEME: [
    {
      recit: 'Sur la première étagère, un livre est resté ouvert. Une phrase y a perdu un petit mot.',
      banque: [
        q('Le fantôme ___ disparu derrière l’étagère.', 'a', { à: 'homophone-a' }),
        q('Il traverse la salle ___ pas de loup.', 'à', { a: 'homophone-a-accent' }),
        q('Les vieux livres ___ tombés tout seuls.', 'sont', { son: 'homophone-sont' }),
        q('Le gardien a perdu ___ trousseau de clés.', 'son', { sont: 'homophone-son' }),
        q('Les lampes ___ grésillé toute la nuit.', 'ont', { on: 'homophone-ont' }),
        q('La porte grince ___ une bougie s’éteint.', 'et', { est: 'homophone-et' }),
        q('La salle de lecture ___ plongée dans le noir.', 'est', { et: 'homophone-est' }),
      ],
    },
    {
      recit: 'Sur le bureau de la bibliothécaire, le fantôme a laissé un message. Un participe passé y attend son accord.',
      banque: [
        q('Toutes les lampes sont ___ maintenant. (éteindre)', 'éteintes', { éteint: 'pp-etre', éteints: 'pp-etre-genre' }),
        q('Les étagères sont ___ de poussière. (couvrir)', 'couvertes', { couvert: 'pp-etre', couverts: 'pp-etre-genre' }),
        q('La bibliothécaire est ___ très tard. (arriver)', 'arrivée', { arrivé: 'pp-etre', arrivés: 'pp-etre-nombre' }),
        q('Les fantômes ont ___ une longue plainte. (pousser)', 'poussé', { poussés: 'pp-avoir', poussée: 'pp-avoir' }),
        q('Nous avons ___ les vieux grimoires. (ranger)', 'rangé', { rangés: 'pp-avoir', rangées: 'pp-avoir' }),
        q('Elle a ___ un cri dans le noir. (entendre)', 'entendu', { entendue: 'pp-avoir', entendus: 'pp-avoir' }),
      ],
    },
    {
      recit: 'Au rayon des dictionnaires, un mot s’est mis à briller. Il faut dire à quelle classe il appartient.',
      banque: [
        q('Un vieux livre tremble sur l’étagère. — « vieux »', 'adjectif', { nom: 'classe-adjectif', adverbe: 'classe-adjectif' }),
        q('La porte grince doucement. — « doucement »', 'adverbe', { adjectif: 'classe-adverbe', nom: 'classe-adverbe' }),
        q('Le chat dort sous la table. — « sous »', 'préposition', { adverbe: 'classe-preposition', conjonction: 'classe-preposition' }),
        q('Elle cherche la clé mais ne la trouve pas. — « mais »', 'conjonction', { préposition: 'classe-conjonction', adverbe: 'classe-conjonction' }),
        q('Une ombre apparaît soudain. — « apparaît »', 'verbe', { nom: 'classe-verbe', adjectif: 'classe-verbe' }),
        q('Les livres anciens murmurent. — « livres »', 'nom', { verbe: 'classe-nom', adjectif: 'classe-nom' }),
        q('Le gardien prend la lampe et la pose ici. — « la » (devant pose)', 'pronom', { déterminant: 'classe-pronom', nom: 'classe-pronom' }),
      ],
    },
    {
      recit: 'Une phrase lumineuse flotte au-dessus de la salle de lecture. Un groupe de mots y brille plus fort que les autres.',
      banque: [
        q('Le fantôme ouvre le grimoire. — « le grimoire »', 'COD', { COI: 'fonction-cod', sujet: 'fonction-sujet-cod' }),
        q('Le gardien ressemble à un fantôme. — « à un fantôme »', 'COI', { COD: 'fonction-coi', 'complément circonstanciel': 'fonction-coi' }),
        q('À minuit, les livres s’agitent. — « À minuit »', 'complément circonstanciel', { COI: 'fonction-cc', sujet: 'fonction-cc' }),
        q('Dans la réserve dort un vieux dragon de papier. — « un vieux dragon de papier »', 'sujet', { COD: 'fonction-sujet-inverse', 'complément circonstanciel': 'fonction-sujet-inverse' }),
        q('La bibliothécaire cherche la sortie. — « La bibliothécaire »', 'sujet', { COD: 'fonction-sujet', COI: 'fonction-sujet' }),
      ],
    },
    {
      recit: 'Le registre du gardien raconte une nuit étrange. Un verbe y a été effacé.',
      banque: [
        q('Soudain, une voix ___ mon nom. (appeler)', 'appela', { appelait: 'valeur-passe-simple' }),
        q('Chaque nuit, les livres ___ dans le noir. (chuchoter)', 'chuchotaient', { chuchotèrent: 'valeur-imparfait', chuchotait: 'accord-pluriel' }),
        q('Tout à coup, les portes ___ toutes seules. (claquer)', 'claquèrent', { claquaient: 'valeur-passe-simple', claqua: 'accord-pluriel' }),
        q('D’habitude, le gardien ___ la porte à clé. (fermer)', 'fermait', { ferma: 'valeur-imparfait', fermaient: 'accord-singulier' }),
        q('Soudain, la bougie ___. (s’éteindre)', 's’éteignit', { 's’éteignait': 'valeur-passe-simple' }),
      ],
    },
    {
      recit: 'Devant la grande porte, une dernière énigme est gravée dans le bois. Le bon mot fera tourner la serrure.',
      banque: [
        q('Un synonyme de « effrayé » ?', 'apeuré', { effrayant: 'synonyme-famille', rassuré: 'synonyme-contraire' }),
        q('Un synonyme de « obscur » ?', 'sombre', { clair: 'synonyme-contraire', obscurité: 'synonyme-classe' }),
        q('Le contraire de « silencieux » ?', 'bruyant', { muet: 'contraire-synonyme', calme: 'contraire-synonyme' }),
        q('Le contraire de « ancien » ?', 'récent', { antique: 'contraire-synonyme', ancienneté: 'contraire-classe' }),
        q('Le contraire de « apparaître » ?', 'disparaître', { surgir: 'contraire-synonyme', apparition: 'contraire-classe' }),
      ],
    },
  ],

  CINQUIEME: [
    {
      recit: 'Le premier fermoir est orné d’un chevalier à cheval. Sous lui, deux propositions sont enlacées.',
      banque: [
        q('Le chevalier avance ; le dragon recule.', 'juxtaposition', { coordination: 'propositions-juxtaposees', subordination: 'propositions-juxtaposees' }),
        q('La nuit tombe, les torches s’allument.', 'juxtaposition', { coordination: 'propositions-juxtaposees', subordination: 'propositions-juxtaposees' }),
        q('Le chevalier a peur, mais il entre dans la grotte.', 'coordination', { juxtaposition: 'propositions-coordonnees', subordination: 'propositions-coordonnees' }),
        q('L’écuyer tremble, car le dragon rugit.', 'coordination', { juxtaposition: 'propositions-coordonnees', subordination: 'propositions-coordonnees' }),
        q('Le dragon s’éveille lorsque le chevalier entre.', 'subordination', { juxtaposition: 'propositions-subordonnees', coordination: 'propositions-subordonnees' }),
        q('Le roi attend que son chevalier revienne.', 'subordination', { juxtaposition: 'propositions-subordonnees', coordination: 'propositions-subordonnees' }),
      ],
    },
    {
      recit: 'Le deuxième fermoir montre une épée plantée dans la pierre. Une phrase du manuscrit y est enroulée.',
      banque: [
        q('Le chevalier regarde l’épée qui brille sur l’autel. — « qui »', 'l’épée', { 'l’autel': 'antecedent-avant', 'le chevalier': 'antecedent-avant' }),
        q('Le dragon garde un trésor que nul n’a jamais vu. — « que »', 'un trésor', { nul: 'antecedent-sujet', 'le dragon': 'antecedent-avant' }),
        q('Voici la grotte où dort le dragon. — « où »', 'la grotte', { 'le dragon': 'antecedent-sujet' }),
        q('La princesse dont parle le manuscrit vivait au nord. — « dont »', 'la princesse', { 'le manuscrit': 'antecedent-sujet', 'le nord': 'antecedent-avant' }),
      ],
    },
    {
      recit: 'Le troisième fermoir porte les armes du roi. Ses ordres y sont écrits, mais un verbe manque.',
      banque: [
        q('Il faut que le chevalier ___ courageux. (être)', 'soit', { est: 'subjonctif-declencheur', sera: 'subjonctif-declencheur' }),
        q('Il faut que tu ___ ton épée. (prendre)', 'prennes', { prends: 'subjonctif-declencheur', prendras: 'subjonctif-declencheur' }),
        q('Le roi veut que nous ___ avant l’aube. (partir)', 'partions', { partons: 'subjonctif-declencheur', partirons: 'subjonctif-declencheur' }),
        q('Bien que la route ___ longue, il avance. (être)', 'soit', { est: 'subjonctif-declencheur', était: 'subjonctif-declencheur' }),
        q('Il faut que vous ___ le manuscrit. (lire)', 'lisiez', { lisez: 'subjonctif-declencheur', lirez: 'subjonctif-declencheur' }),
        q('Je doute que le dragon ___ endormi. (être)', 'soit', { est: 'subjonctif-declencheur', sera: 'subjonctif-declencheur' }),
      ],
    },
    {
      recit: 'Le quatrième fermoir est gravé d’une couronne. Le chevalier y a noté ses promesses et ses rêves.',
      banque: [
        q('Si j’avais une épée, je ___ le dragon. (combattre)', 'combattrais', { combattrai: 'conditionnel-si', combattrait: 'conditionnel-personne' }),
        q('Si le dragon dormait, nous ___ passer. (pouvoir)', 'pourrions', { pourrons: 'conditionnel-si' }),
        q('Si j’étais chevalier, je ___ le royaume. (protéger)', 'protégerais', { protégerai: 'conditionnel-si' }),
        q('Je te promets que demain je ___ le manuscrit. (rendre)', 'rendrai', { rendrais: 'futur-certain', rendra: 'futur-personne' }),
        q('Quand le soleil se lèvera, l’armée ___. (partir)', 'partira', { partirait: 'futur-certain' }),
      ],
    },
    {
      recit: 'Le cinquième fermoir représente une tour. Pour l’ouvrir, il faut retourner une phrase comme un gant.',
      banque: [
        q('« Le dragon garde le trésor. » → Le trésor ___ par le dragon.', 'est gardé', { 'était gardé': 'passif-temps', 'a été gardé': 'passif-temps' }),
        q('« Le chevalier a vaincu le géant. » → Le géant ___ par le chevalier.', 'a été vaincu', { 'est vaincu': 'passif-temps', 'était vaincu': 'passif-temps' }),
        q('« Une fée protégeait la forêt. » → La forêt ___ par une fée.', 'était protégée', { 'est protégée': 'passif-temps', 'était protégé': 'passif-accord' }),
        q('« Le roi récompensera les écuyers. » → Les écuyers ___ par le roi.', 'seront récompensés', { 'seront récompensé': 'passif-accord', 'sont récompensés': 'passif-temps' }),
      ],
    },
    {
      recit: 'Le dernier fermoir est une enluminure dorée. Sous l’image, une phrase du poète attend qu’on nomme sa figure.',
      banque: [
        q('Ses écailles brillaient comme des émeraudes.', 'comparaison', { métaphore: 'figure-comparaison', personnification: 'figure-comparaison' }),
        q('La lune, pareille à un bouclier d’argent, éclairait la vallée.', 'comparaison', { métaphore: 'figure-comparaison', personnification: 'figure-comparaison' }),
        q('Le chevalier est un lion au combat.', 'métaphore', { comparaison: 'figure-metaphore', personnification: 'figure-metaphore' }),
        q('Sa colère était un incendie.', 'métaphore', { comparaison: 'figure-metaphore', personnification: 'figure-metaphore' }),
        q('La forêt retenait son souffle.', 'personnification', { comparaison: 'figure-personnification', métaphore: 'figure-personnification' }),
        q('Le vent chantait une plainte dans les tours.', 'personnification', { comparaison: 'figure-personnification', métaphore: 'figure-personnification' }),
      ],
    },
  ],

  QUATRIEME: [
    {
      recit: 'La première page du journal rapporte ce que ta grand-tante a entendu. Il faut le redire avec ses propres mots.',
      banque: [
        q('Elle m’a dit : « Je reviendrai demain. » → Elle m’a dit qu’elle ___ le lendemain.', 'reviendrait', { reviendrai: 'discours-personne', reviendra: 'discours-temps' }),
        q('Il a écrit : « Je vois une ombre. » → Il a écrit qu’il ___ une ombre.', 'voyait', { vois: 'discours-personne', voit: 'discours-temps' }),
        q('Elle m’a demandé : « As-tu lu mon journal ? » → Elle m’a demandé ___ lu son journal.', 'si j’avais', { 'si j’ai': 'discours-temps', 'est-ce que j’avais': 'discours-interrogation' }),
        q('Elle a affirmé : « Le miroir a bougé. » → Elle a affirmé que le miroir ___.', 'avait bougé', { 'a bougé': 'discours-temps', bougeait: 'discours-temps' }),
      ],
    },
    {
      recit: 'Plus loin, le journal raconte la nuit où tout a commencé. Le récit est au passé, et un verbe s’est effacé.',
      banque: [
        q('La nuit ___ quand j’ouvris le journal. (tomber)', 'tombait', { tombe: 'concordance-present', tombera: 'concordance-futur' }),
        q('Elle me jura qu’elle ___ le lendemain. (revenir)', 'reviendrait', { reviendra: 'concordance-futur', revient: 'concordance-present' }),
        q('Je compris que quelqu’un ___ mon journal avant moi. (lire)', 'avait lu', { 'a lu': 'concordance-anteriorite', lira: 'concordance-futur' }),
        q('Il remarqua que le miroir ___ fêlé. (être)', 'était', { est: 'concordance-present', sera: 'concordance-futur' }),
      ],
    },
    {
      recit: 'Une page arrachée a été recollée de travers. Une subordonnée y dit pourquoi, comment ou quand.',
      banque: [
        q('Je cachai le journal parce que ma sœur fouillait partout.', 'cause', { conséquence: 'circ-cause', but: 'circ-cause' }),
        q('J’allumai une bougie pour que l’ombre disparaisse.', 'but', { cause: 'circ-but', conséquence: 'circ-but' }),
        q('Le miroir trembla si fort qu’il se fendit.', 'conséquence', { cause: 'circ-consequence', but: 'circ-consequence' }),
        q('Bien que la pièce soit sombre, je lis chaque page.', 'concession', { cause: 'circ-concession', temps: 'circ-concession' }),
        q('Quand minuit sonna, le reflet sourit.', 'temps', { cause: 'circ-temps', concession: 'circ-temps' }),
      ],
    },
    {
      recit: 'Dans la marge, quelqu’un a écrit trois fois la même phrase, mais une seule est correcte.',
      banque: [
        q('Choisis la phrase correcte à l’écrit.', 'Je n’ai rien vu.', { 'J’ai rien vu.': 'negation-ne', 'Je n’ai pas rien vu.': 'negation-double' }),
        q('Choisis la phrase correcte à l’écrit.', 'On n’entend personne.', { 'On entend personne.': 'negation-on', 'On n’entend pas personne.': 'negation-double' }),
        q('Choisis la phrase correcte à l’écrit.', 'Il n’ouvre jamais ce journal.', { 'Il ouvre jamais ce journal.': 'negation-ne', 'Il n’ouvre pas jamais ce journal.': 'negation-double' }),
        q('Choisis la phrase correcte à l’écrit.', 'Je n’ai aucune peur.', { 'J’ai aucune peur.': 'negation-ne', 'Je n’ai pas aucune peur.': 'negation-double' }),
      ],
    },
    {
      recit: 'Deux sœurs apparaissent dans les souvenirs du journal. Leur histoire est pleine de verbes pronominaux.',
      banque: [
        q('Elles se sont ___ dans le miroir. (regarder)', 'regardées', { regardé: 'pp-pronominal-cod', regardés: 'pp-pronominal-genre' }),
        q('Elles se sont ___ des secrets. (dire)', 'dit', { dites: 'pp-pronominal-coi', dits: 'pp-pronominal-coi' }),
        q('Ils se sont ___ les mains. (laver)', 'lavé', { lavés: 'pp-pronominal-coi', lavées: 'pp-pronominal-coi' }),
        q('Elles se sont ___ toute la nuit. (parler)', 'parlé', { parlées: 'pp-pronominal-coi-seul', parlés: 'pp-pronominal-coi-seul' }),
        q('Elles se sont ___ du journal. (emparer)', 'emparées', { emparé: 'pp-pronominal-essentiel', emparés: 'pp-pronominal-genre' }),
      ],
    },
    {
      recit: 'La dernière serrure porte une liste de mots, comme un jeu de ta grand-tante. Un seul a la couleur demandée.',
      banque: [
        q('Pour parler d’une maison, quel mot est péjoratif ?', 'masure', { maison: 'connotation-neutre', demeure: 'connotation-meliorative' }),
        q('Pour parler d’un cheval, quel mot est péjoratif ?', 'canasson', { cheval: 'connotation-neutre', destrier: 'connotation-meliorative' }),
        q('Pour parler d’un visage, quel mot est mélioratif ?', 'minois', { visage: 'connotation-neutre', trogne: 'connotation-pejorative' }),
        q('Pour parler d’une voiture, quel mot est péjoratif ?', 'tacot', { voiture: 'connotation-neutre', automobile: 'connotation-neutre' }),
      ],
    },
  ],

  TROISIEME: [
    {
      recit: 'Le rapport du gardien de nuit est plein de fautes. Corrige-le avant de le lire au commissaire.',
      banque: [
        q('Le témoin ___ trompé d’heure.', 's’est', { 'c’est': 'homophone-sest', ses: 'homophone-sest' }),
        q('Le commissaire ___ vu entrer.', 'l’a', { la: 'homophone-la', là: 'homophone-la' }),
        q('Il faut ___ le coffre. (examiner)', 'examiner', { examiné: 'homophone-er', examinez: 'homophone-er' }),
        q('Il ignore ___ preuves nous avons.', 'quelles', { 'qu’elles': 'homophone-quelles', quel: 'homophone-quel-accord' }),
        q('Je crois ___ ment.', 'qu’il', { qui: 'homophone-quil' }),
      ],
    },
    {
      recit: 'Dans le bureau du conservateur, tu trouves ses notes sur ce qui aurait pu se passer. Il faut compléter ses hypothèses.',
      banque: [
        q('Si le suspect ___ la vérité, il serait libre. (dire)', 'disait', { dirait: 'hypothese-si-conditionnel', dira: 'hypothese-systemes' }),
        q('Si tu observes bien, tu ___ l’indice. (trouver)', 'trouveras', { trouverais: 'hypothese-systemes', trouvais: 'hypothese-systemes' }),
        q('Si le témoin avait parlé, l’enquête ___ plus vite. (avancer)', 'aurait avancé', { 'aura avancé': 'hypothese-systemes', 'avait avancé': 'hypothese-systemes' }),
        q('Si j’___ la clé, j’ouvrirais le coffre. (avoir)', 'avais', { aurais: 'hypothese-si-conditionnel', ai: 'hypothese-systemes' }),
        q('Si la serrure cède, nous ___ dans la pièce. (entrer)', 'entrerons', { entrerions: 'hypothese-systemes', entrions: 'hypothese-systemes' }),
      ],
    },
    {
      recit: 'Les ordres du commissaire sont épinglés au mur. Un verbe y est entouré de rouge.',
      banque: [
        q('Il faut que l’inspecteur vienne. — « vienne »', 'subjonctif', { indicatif: 'mode-subjonctif', impératif: 'mode-subjonctif' }),
        q('Bien qu’il soit innocent, il se tait. — « soit »', 'subjonctif', { indicatif: 'mode-subjonctif', infinitif: 'mode-subjonctif' }),
        q('Ouvrez ce tiroir ! — « Ouvrez »', 'impératif', { indicatif: 'mode-imperatif', subjonctif: 'mode-imperatif' }),
        q('Le suspect ment, j’en suis sûr. — « ment »', 'indicatif', { subjonctif: 'mode-indicatif', impératif: 'mode-indicatif' }),
        q('Il faut fouiller la cave. — « fouiller »', 'infinitif', { indicatif: 'mode-infinitif', impératif: 'mode-infinitif' }),
      ],
    },
    {
      recit: 'Les témoins ont parlé, mais aucun n’est tout à fait sûr de lui. Repère le mot qui trahit le doute.',
      banque: [
        q('Hier, le voleur est probablement entré seul.', 'probablement', { hier: 'modalisation', seul: 'modalisation' }),
        q('Le gardien semble cacher quelque chose.', 'semble', { cacher: 'modalisation', 'quelque chose': 'modalisation' }),
        q('Cette lettre a sans doute été écrite la nuit.', 'sans doute', { lettre: 'modalisation', 'la nuit': 'modalisation' }),
        q('Le suspect aurait quitté la ville.', 'aurait quitté', { 'le suspect': 'modalisation', 'la ville': 'modalisation' }),
      ],
    },
    {
      recit: 'Le procès-verbal est écrit en longues phrases complexes. Le commissaire te demande d’en analyser une.',
      banque: [
        q('Le commissaire pense que le voleur ment. — « que le voleur ment »', 'conjonctive', { relative: 'subordonnee-conjonctive', 'interrogative indirecte': 'subordonnee-conjonctive' }),
        q('Je sais que tu étais là. — « que tu étais là »', 'conjonctive', { relative: 'subordonnee-conjonctive', 'interrogative indirecte': 'subordonnee-conjonctive' }),
        q('Le voleur que la police cherche a fui. — « que la police cherche »', 'relative', { conjonctive: 'subordonnee-relative', 'interrogative indirecte': 'subordonnee-relative' }),
        q('La personne qui a volé le tableau portait des gants. — « qui a volé le tableau »', 'relative', { conjonctive: 'subordonnee-relative', 'interrogative indirecte': 'subordonnee-relative' }),
        q('L’inspecteur se demande qui a volé le tableau. — « qui a volé le tableau »', 'interrogative indirecte', { relative: 'subordonnee-interrogative', conjonctive: 'subordonnee-interrogative' }),
        q('Elle se demande pourquoi le coffre était ouvert. — « pourquoi le coffre était ouvert »', 'interrogative indirecte', { relative: 'subordonnee-interrogative', conjonctive: 'subordonnee-interrogative' }),
      ],
    },
    {
      recit: 'Le rapport final doit être parfait : le juge le lira mot à mot. Un mot y a un jumeau trompeur.',
      banque: [
        q('Le voleur est entré par ___ : la serrure est forcée.', 'effraction', { infraction: 'paronyme' }),
        q('Sans preuve, ce n’est qu’une ___.', 'conjecture', { conjoncture: 'paronyme' }),
        q('L’arrestation est ___ : la police est devant la porte.', 'imminente', { éminente: 'paronyme' }),
        q('Le juge a décidé d’___ le suspect.', 'inculper', { inculquer: 'paronyme' }),
        q('On soupçonne une ___ entre le gardien et le voleur.', 'collusion', { collision: 'paronyme' }),
        q('Le juge a ___ une lourde amende au voleur.', 'infligé', { affligé: 'paronyme' }),
      ],
    },
  ],
};

/** Les banques, pour les tests : chaque phrase de chaque étape. */
export const BANQUES = Object.fromEntries(
  Object.entries(ETAPES).map(([classe, etapes]) => [classe, etapes.map((e) => e.banque)]),
);

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { au, melanger } = outils(graine);
  const classe = ETAPES[niveau] ? niveau : 'SIXIEME';
  const prefixe = PREFIXE[classe];
  const mot = MOTS[classe];
  return ETAPES[classe].map((etape, i) => {
    const { question, bonne, pieges } = au(etape.banque);
    return {
      consigne: `${prefixe}-etape-${i + 1}`,
      recit: etape.recit,
      question,
      choix: melanger([bonne, ...Object.keys(pieges)]).map((c) => ({ cle: c, libelle: c })),
      bonne,
      pieges: { ...pieges },
      cadenas: { avant: mot.slice(0, i).split(''), piece: mot[i], total: MANCHES },
    };
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // -------------------------------------------- 6e : la bibliothèque hantée
  '6e-etape-1': 'Première lettre : choisis l’homophone qui convient.',
  '6e-etape-2': 'Deuxième lettre : accorde le participe passé.',
  '6e-etape-3': 'Troisième lettre : trouve la classe du mot entre guillemets.',
  '6e-etape-4': 'Quatrième lettre : trouve la fonction du groupe entre guillemets.',
  '6e-etape-5': 'Cinquième lettre : imparfait ou passé simple ? Choisis la bonne forme.',
  '6e-etape-6': 'Dernière lettre : trouve le synonyme ou le contraire demandé.',
  '6e-etape-1-regle': 'Remplace le mot pour l’entendre : a par avait, sont par étaient, son par mon, ont par avaient, est par était.',
  '6e-etape-2-regle': 'Avec être, le participe s’accorde avec le sujet ; avec avoir, il ne s’accorde jamais avec le sujet.',
  '6e-etape-3-regle': 'Observe le rôle du mot : un nom désigne, un adjectif précise un nom, un verbe se conjugue, un adverbe ne varie pas.',
  '6e-etape-4-regle': 'Pose la question au verbe : qui est-ce qui, pour le sujet ; quoi, pour le COD ; à qui ou à quoi, pour le COI. Ce qu’on peut déplacer et supprimer est circonstanciel.',
  '6e-etape-5-regle': 'Une action soudaine et unique se met au passé simple ; une habitude ou une description, à l’imparfait.',
  '6e-etape-6-regle': 'Un synonyme a le même sens et la même classe ; un contraire a le sens opposé.',
  'homophone-a': 'Ici, on peut dire « avait » : c’est le verbe avoir, sans accent.',
  'homophone-a-accent': 'On ne peut pas dire « avait » à cette place : c’est la préposition, avec un accent.',
  'homophone-sont': 'On peut dire « étaient » : c’est le verbe être, au pluriel.',
  'homophone-son': 'On peut dire « mon » : c’est le déterminant possessif.',
  'homophone-ont': 'On peut dire « avaient » : c’est le verbe avoir, au pluriel.',
  'homophone-et': 'On peut dire « et puis » : c’est la conjonction qui relie, pas le verbe être.',
  'homophone-est': 'On peut dire « était » : c’est le verbe être.',
  'pp-etre': 'Avec être, le participe s’accorde avec le sujet : cherche qui fait l’action, puis regarde son genre et son nombre.',
  'pp-etre-genre': 'Le sujet est féminin : le participe prend un e.',
  'pp-etre-nombre': 'Le sujet est au singulier : pas de s au participe.',
  'pp-avoir': 'Avec avoir, le participe ne s’accorde pas avec le sujet. Le complément est placé après le verbe : pas d’accord.',
  'classe-adjectif': 'Ce mot précise le nom et s’accorde avec lui : c’est un adjectif.',
  'classe-adverbe': 'Ce mot modifie le verbe et ne s’accorde jamais : c’est un adverbe.',
  'classe-preposition': 'Ce mot invariable introduit un groupe nominal : c’est une préposition.',
  'classe-conjonction': 'Ce mot relie deux propositions : c’est une conjonction de coordination, comme et, ou, donc, or, ni, car.',
  'classe-verbe': 'Ce mot se conjugue : on peut le mettre au passé. C’est un verbe.',
  'classe-nom': 'Ce mot est précédé d’un déterminant et désigne une chose : c’est un nom.',
  'classe-pronom': 'Ce mot n’est suivi d’aucun nom, il est placé devant le verbe : il remplace un nom. C’est un pronom.',
  'fonction-cod': 'Il n’y a pas de préposition entre le verbe et ce groupe : il répond à la question quoi. C’est un COD.',
  'fonction-sujet-cod': 'Le sujet répond à la question qui est-ce qui, posée devant le verbe. Ce groupe répond à quoi, après le verbe : c’est le COD.',
  'fonction-coi': 'Ce groupe est introduit par à ou de, et le verbe ne peut pas s’en passer : c’est un COI.',
  'fonction-cc': 'Ce groupe se déplace et se supprime sans abîmer la phrase : c’est un complément circonstanciel.',
  'fonction-sujet-inverse': 'Demande qui est-ce qui fait l’action : le sujet peut se placer après le verbe.',
  'fonction-sujet': 'Pose la question qui est-ce qui devant le verbe : la réponse, c’est le sujet.',
  'valeur-passe-simple': 'Soudain, tout à coup : l’action arrive d’un coup, une seule fois. C’est le passé simple.',
  'valeur-imparfait': 'Chaque nuit, d’habitude : l’action se répète. L’habitude se dit à l’imparfait.',
  'accord-pluriel': 'Le sujet est au pluriel : le verbe aussi.',
  'accord-singulier': 'Le sujet est au singulier : le verbe aussi.',
  'synonyme-famille': 'Même famille ne veut pas dire même sens : vérifie que le mot peut remplacer l’autre dans une phrase.',
  'synonyme-contraire': 'Ce mot dit le contraire. Un synonyme a le même sens.',
  'synonyme-classe': 'Un synonyme garde la même classe : un adjectif se remplace par un adjectif.',
  'contraire-synonyme': 'Ce mot a presque le même sens : c’est un synonyme. Le contraire dit l’opposé.',
  'contraire-classe': 'Un contraire garde la même classe : un adjectif s’oppose à un adjectif, un verbe à un verbe.',

  // ---------------------------------------- 5e : le manuscrit du chevalier
  '5e-etape-1': 'Premier fermoir : comment ces deux propositions sont-elles reliées ?',
  '5e-etape-2': 'Deuxième fermoir : trouve l’antécédent du pronom relatif.',
  '5e-etape-3': 'Troisième fermoir : conjugue le verbe au mode qui convient.',
  '5e-etape-4': 'Quatrième fermoir : futur ou conditionnel ? Choisis la bonne forme.',
  '5e-etape-5': 'Cinquième fermoir : mets la phrase à la voix passive.',
  '5e-etape-6': 'Dernier fermoir : nomme la figure de style.',
  '5e-etape-1-regle': 'Juxtaposées : une simple ponctuation. Coordonnées : mais, ou, et, donc, or, ni, car. Subordonnées : un mot comme que, quand ou lorsque.',
  '5e-etape-2-regle': 'L’antécédent est le nom que le pronom relatif reprend : il est placé juste avant lui.',
  '5e-etape-3-regle': 'Après il faut que, vouloir que, douter que ou bien que, le verbe se met au subjonctif.',
  '5e-etape-4-regle': 'Le futur annonce une action certaine ; le conditionnel dépend d’une condition.',
  '5e-etape-5-regle': 'À la voix passive, le complément d’objet devient sujet, et le verbe être prend le temps du verbe actif.',
  '5e-etape-6-regle': 'Comparaison : un outil comme comme ou pareil à. Métaphore : le rapprochement sans outil. Personnification : une chose agit comme une personne.',
  'propositions-juxtaposees': 'Aucun mot ne relie les deux propositions, seulement une ponctuation : elles sont juxtaposées.',
  'propositions-coordonnees': 'Mais, ou, et, donc, or, ni, car : ce sont les conjonctions de coordination. Les propositions sont coordonnées.',
  'propositions-subordonnees': 'Une proposition dépend de l’autre, introduite par un mot subordonnant comme que ou lorsque : c’est la subordination.',
  'antecedent-avant': 'L’antécédent se trouve juste avant le pronom relatif : c’est le nom que le pronom reprend.',
  'antecedent-sujet': 'Ce groupe est le sujet du verbe de la relative, pas l’antécédent. L’antécédent est placé avant le pronom relatif.',
  'subjonctif-declencheur': 'Ce début de phrase appelle le subjonctif : que je sois, que tu prennes, que nous partions.',
  'conditionnel-si': 'Après si suivi de l’imparfait, la suite se met au conditionnel présent : si j’étais, je serais.',
  'conditionnel-personne': 'Avec je, le conditionnel se termine par un s, comme l’imparfait : je serais, je pourrais.',
  'futur-certain': 'L’action est sûre, sans condition : c’est le futur. Je serai, sans s.',
  'futur-personne': 'Le sujet est je : le verbe se conjugue à la première personne, comme je serai.',
  'passif-temps': 'Le verbe être prend le temps du verbe de départ : présent donne est, imparfait donne était, passé composé donne a été, futur donne sera.',
  'passif-accord': 'Au passif, le participe s’accorde avec le nouveau sujet, comme avec être.',
  'figure-comparaison': 'Il y a un outil de comparaison, comme ou pareil à : c’est une comparaison.',
  'figure-metaphore': 'Pas d’outil de comparaison : on dit directement que l’un est l’autre. C’est une métaphore.',
  'figure-personnification': 'Une chose agit comme une personne : elle respire, elle chante. C’est une personnification.',

  // ----------------------------------------------- 4e : le journal secret
  '4e-etape-1': 'Première serrure : passe la phrase au discours indirect.',
  '4e-etape-2': 'Deuxième serrure : choisis le temps qui respecte la concordance.',
  '4e-etape-3': 'Troisième serrure : quel est le sens de la subordonnée ?',
  '4e-etape-4': 'Quatrième serrure : choisis la phrase négative correcte.',
  '4e-etape-5': 'Cinquième serrure : accorde le participe passé de ce verbe pronominal.',
  '4e-etape-6': 'Dernière serrure : trouve le mot qui porte la connotation demandée.',
  '4e-etape-1-regle': 'Au discours indirect, les pronoms changent de personne et, après un verbe au passé, les temps reculent : le présent devient imparfait, le futur devient conditionnel.',
  '4e-etape-2-regle': 'Dans un récit au passé, l’arrière-plan se met à l’imparfait, ce qui s’est passé avant au plus-que-parfait, et ce qui viendra après au conditionnel.',
  '4e-etape-3-regle': 'Le mot qui introduit la subordonnée donne son sens : parce que pour la cause, pour que pour le but, si bien que pour la conséquence, bien que pour la concession, quand pour le temps.',
  '4e-etape-4-regle': 'À l’écrit, la négation a deux morceaux : ne, puis pas, rien, personne, jamais ou aucun. Le second mot ne s’ajoute jamais à pas.',
  '4e-etape-5-regle': 'Si se est complément d’objet direct, placé avant, on accorde ; si se est complément indirect, on n’accorde pas avec lui. Un verbe toujours pronominal s’accorde avec le sujet.',
  '4e-etape-6-regle': 'Un mot neutre désigne sans juger ; un mot péjoratif rabaisse ; un mot mélioratif valorise.',
  'discours-personne': 'Au discours indirect, celui qui parle n’est plus je : je devient il ou elle.',
  'discours-temps': 'Le verbe qui introduit est au passé : les temps reculent. Le présent devient imparfait, le passé composé plus-que-parfait, le futur conditionnel.',
  'discours-interrogation': 'Une question rapportée s’introduit par si, sans est-ce que et sans point d’interrogation.',
  'concordance-present': 'Le récit est au passé : pas de présent ici. Ce qui dure en arrière-plan se met à l’imparfait.',
  'concordance-futur': 'Vu depuis le passé, l’avenir se dit au conditionnel, pas au futur.',
  'concordance-anteriorite': 'L’action a eu lieu avant une autre action passée : c’est le plus-que-parfait.',
  'circ-cause': 'Parce que, puisque, comme : la subordonnée donne la raison. C’est la cause.',
  'circ-but': 'Pour que, afin que : la subordonnée dit ce qu’on cherche à obtenir. C’est le but.',
  'circ-consequence': 'Si fort que, tellement que, si bien que : la subordonnée dit ce qui en résulte. C’est la conséquence.',
  'circ-concession': 'Bien que, quoique : un fait qui aurait pu empêcher l’action, mais ne l’empêche pas. C’est la concession.',
  'circ-temps': 'Quand, lorsque, pendant que : la subordonnée situe l’action dans le temps.',
  'negation-ne': 'Le ne a disparu : à l’oral on l’oublie souvent, mais à l’écrit il est obligatoire.',
  'negation-on': 'Avec on devant une voyelle, la liaison cache le ne : remplace on par il, et tu entends il n’entend.',
  'negation-double': 'Rien, personne, jamais, aucun prennent la place de pas : on ne les ajoute pas à pas.',
  'pp-pronominal-cod': 'Se est complément d’objet direct, placé avant le verbe : le participe s’accorde avec lui, donc avec le sujet.',
  'pp-pronominal-genre': 'Le sujet est féminin pluriel : le participe prend un e et un s.',
  'pp-pronominal-coi': 'Ici, se n’est pas complément d’objet direct : le complément d’objet direct est placé après le verbe. Pas d’accord.',
  'pp-pronominal-coi-seul': 'Se est ici complément d’objet indirect, on parle à quelqu’un, et il n’y a aucun complément d’objet direct : le participe reste invariable.',
  'pp-pronominal-essentiel': 'Ce verbe n’existe qu’à la forme pronominale : le participe s’accorde avec le sujet.',
  'connotation-neutre': 'Ce mot désigne sans juger : il est neutre. Cherche celui qui ajoute une image.',
  'connotation-meliorative': 'Ce mot donne une image flatteuse : il est mélioratif, l’inverse de ce qu’on cherche.',
  'connotation-pejorative': 'Ce mot rabaisse : il est péjoratif, l’inverse de ce qu’on cherche.',

  // -------------------------------------------- 3e : l'enquête du musée
  '3e-etape-1': 'Premier indice : choisis la bonne orthographe.',
  '3e-etape-2': 'Deuxième indice : construis le système hypothétique.',
  '3e-etape-3': 'Troisième indice : à quel mode est le verbe entre guillemets ?',
  '3e-etape-4': 'Quatrième indice : quel mot exprime le doute ?',
  '3e-etape-5': 'Cinquième indice : quelle est la nature de la subordonnée entre guillemets ?',
  '3e-etape-6': 'Dernier indice : choisis le mot juste, sans te laisser piéger par son jumeau.',
  '3e-etape-1-regle': 'Pour choisir entre deux homophones, remplace : s’est par se sont, l’a par l’avait, un infinitif par mordre, quelles par quels.',
  '3e-etape-2-regle': 'Si et présent, puis futur ; si et imparfait, puis conditionnel présent ; si et plus-que-parfait, puis conditionnel passé.',
  '3e-etape-3-regle': 'Indicatif : un fait réel. Subjonctif : un fait envisagé, après que. Impératif : un ordre, sans sujet. Infinitif : la forme du dictionnaire.',
  '3e-etape-4-regle': 'Cherche le mot qui dit à quel point on est sûr : peut-être, sans doute, probablement, sembler, ou un conditionnel.',
  '3e-etape-5-regle': 'Une relative reprend un antécédent ; une conjonctive complète le verbe, introduite par que sans antécédent ; une interrogative indirecte rapporte une question.',
  '3e-etape-6-regle': 'Deux paronymes se ressemblent à l’oreille mais n’ont pas le même sens : vérifie le sens de chacun.',
  'homophone-sest': 'Mets la phrase au pluriel : ils se sont trompés. C’est le verbe pronominal, s’est.',
  'homophone-la': 'Remplace par l’avait : il l’avait vu. C’est le pronom suivi du verbe avoir, l’a.',
  'homophone-er': 'Après il faut, le verbe reste à l’infinitif : remplace par mordre, il faut mordre.',
  'homophone-quelles': 'Mets au masculin : on dirait quels indices, pas qu’ils indices. C’est le déterminant quel, accordé avec le nom.',
  'homophone-quel-accord': 'Quel s’accorde avec le nom qu’il accompagne : ici, un nom féminin pluriel.',
  'homophone-quil': 'Mets au féminin : je crois qu’elle ment. C’est que suivi de il.',
  'hypothese-si-conditionnel': 'Jamais de conditionnel juste après si : si suivi de l’imparfait, puis le conditionnel dans l’autre proposition.',
  'hypothese-systemes': 'Regarde le temps après si : présent, puis futur ; imparfait, puis conditionnel présent ; plus-que-parfait, puis conditionnel passé.',
  'mode-subjonctif': 'Après il faut que ou bien que, le fait est envisagé, pas constaté : c’est le subjonctif.',
  'mode-imperatif': 'Un ordre, sans sujet exprimé : c’est l’impératif.',
  'mode-indicatif': 'Un fait présenté comme réel, avec un sujet, sans que devant : c’est l’indicatif.',
  'mode-infinitif': 'Le verbe n’est pas conjugué : c’est sa forme du dictionnaire, l’infinitif.',
  modalisation: 'Ce mot donne une information, pas un degré de certitude. Cherche celui qui montre le doute : peut-être, sans doute, sembler, un conditionnel.',
  'subordonnee-conjonctive': 'Que n’a pas d’antécédent : la subordonnée complète le verbe. C’est une conjonctive.',
  'subordonnee-relative': 'Le mot qui introduit reprend un nom placé juste avant, son antécédent : c’est une relative.',
  'subordonnee-interrogative': 'On peut retrouver la question posée, et il n’y a pas d’antécédent : c’est une interrogative indirecte.',
  paronyme: 'Ces deux mots se ressemblent mais n’ont pas le même sens : cherche celui qui va avec le reste de la phrase.',
};
