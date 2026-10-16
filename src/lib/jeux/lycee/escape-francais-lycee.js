/**
 * L'ESCAPE GAME DE FRANÇAIS DU LYCÉE — Adrien, en 2de, en 1re générale et en
 * 1re technologique. Camara, le 07/10/2026 : « en 1re, une révision du bac de
 * français : question de grammaire, procédés, culture littéraire ».
 *
 * UNE HISTOIRE PAR CLASSE, SIX ÉTAPES, L'ORDRE DU RÉCIT. Chaque étape travaille
 * une compétence de l'année ; réussie, elle donne une LETTRE, et les six
 * lettres forment un mot qui a un sens dans l'histoire :
 *   - 2de, le souffleur a disparu — RIDEAU : figures de style (litote contre
 *     euphémisme, oxymore contre antithèse…), versification, mouvements
 *     littéraires, négation, interrogation, étymologie grecque ;
 *   - 1re générale, la malle de l'écrivain — CARNET : nature des subordonnées,
 *     valeurs de la négation (ne explétif), portée de l'interrogation
 *     partielle, procédés, vocabulaire du théâtre, culture littéraire ;
 *   - 1re technologique, la rotative bloquée — PRESSE : circonstancielles,
 *     expression de la négation (phrase, préfixe, antonyme), interrogation
 *     directe ou indirecte, connecteurs logiques, pronoms relatifs, formation
 *     des mots nouveaux.
 *
 * Chaque étape tire une de ses phrases (écrites à la main, UNE seule bonne
 * réponse défendable) et mélange ses choix ; les étapes gardent l'ordre de
 * l'histoire. Chaque choix faux a son piège nommé, qui dit comment faire juste.
 *
 * SEULEMENT DES FAITS CANONIQUES : citations classiques sûres (Corneille,
 * Molière, Hugo, Louise Labé, Verlaine), manifestes et dates de référence. AUCUNE
 * question sur les œuvres au programme du bac de l'année : la liste change à
 * chaque rentrée et n'est pas en base.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-francais-lycee', titre: 'Escape game de français', matiereCode: 'FRANCAIS' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Le souffleur a disparu',
    accroche: 'Six énigmes dans les coulisses du théâtre.',
    intro: 'Après la répétition, les portes du vieux théâtre se sont refermées, et le souffleur a disparu avec le texte. Il a caché dans les coulisses les six lettres du mot qui rouvre la scène.',
    fin: 'Tu prononces le mot RIDEAU : le lourd rideau rouge se lève, et la salle s’ouvre devant toi.',
    competences: [
      'FR_2DE_LECT_PROCEDES', 'FR_2DE_LECT_POESIE', 'FR_2DE_LECT_MOUVEMENT',
      'FR_2DE_LANG_NEGATION', 'FR_2DE_LANG_INTERROGATION', 'FR_2DE_LANG_LEXIQUE',
    ],
  },
  PREMIERE: {
    titre: 'La malle de l’écrivain',
    accroche: 'Six serrures sur la malle d’un écrivain.',
    intro: 'Dans la maison d’un écrivain devenue musée, une vieille malle est fermée par six serrures. Chaque serrure ouverte te donne une lettre : ensemble, elles disent ce que la malle protège.',
    fin: 'Les six lettres forment CARNET : au fond de la malle dort le carnet de l’écrivain, couvert de brouillons et de ratures.',
    competences: [
      'FR_1RE_LANG_SUBORDINATION', 'FR_1RE_LANG_NEGATION', 'FR_1RE_LANG_INTERROGATION',
      'FR_1RE_METH_GRAMMAIRE', 'FR_1RE_METH_LINEAIRE', 'FR_1RE_LECT_THEATRE',
    ],
  },
  PREMIERE_TECHNO: {
    titre: 'La rotative bloquée',
    accroche: 'La rotative est bloquée : relance-la.',
    intro: 'Dans l’imprimerie du journal, la rotative s’est bloquée derrière six verrous, et l’édition de demain ne peut pas sortir. Chaque verrou ouvert te donne une lettre du mot qui la relance.',
    fin: 'Les six lettres forment PRESSE : la rotative redémarre, et le journal sort tout chaud de l’imprimerie.',
    competences: [
      'FR_1TEC_LANG_CIRCONSTANCIELLES', 'FR_1TEC_LANG_NEGATION', 'FR_1TEC_LANG_INTERROGATION',
      'FR_1TEC_ECR_RELATIONS_LOGIQUES', 'FR_1TEC_LANG_ACQUIS_SECONDE', 'FR_1TEC_LANG_LEXIQUE',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Le mot de chaque classe : une lettre par étape. */
export const MOTS = { SECONDE: 'RIDEAU', PREMIERE: 'CARNET', PREMIERE_TECHNO: 'PRESSE' };

const PREFIXE = { SECONDE: '2de', PREMIERE: '1re', PREMIERE_TECHNO: '1tec' };

/** Une phrase de la banque : la question affichée, la bonne réponse, et chaque piège avec son erreur. */
const q = (question, bonne, pieges) => ({ question, bonne, pieges });

/** Les mêmes choix pour plusieurs étapes. */
const TOTALE = 'négation totale';
const PARTIELLE = 'négation partielle';
const RESTRICTION = 'tournure restrictive';
const EXPLETIF = 'ne explétif';

/*
 * LES BANQUES. Une entrée par étape : le récit (affiché) et ses phrases.
 */
const ETAPES = {
  SECONDE: [
    {
      recit: 'Sur la table du souffleur, un vieux cahier est resté ouvert. Une réplique y est soulignée en rouge.',
      banque: [
        q('« Va, je ne te hais point. » (Corneille, Le Cid)', 'litote', { euphémisme: 'litote-euphemisme', hyperbole: 'figure-litote' }),
        q('« Il nous a quittés » (pour dire : il est mort)', 'euphémisme', { litote: 'euphemisme-litote', hyperbole: 'figure-euphemisme' }),
        q('« Je meurs de soif ! »', 'hyperbole', { euphémisme: 'figure-hyperbole', litote: 'figure-hyperbole' }),
        q('« Cette obscure clarté qui tombe des étoiles » (Corneille, Le Cid)', 'oxymore', { antithèse: 'oxymore-antithese', litote: 'figure-oxymore' }),
        q('« Je vis, je meurs ; je me brûle et me noie » (Louise Labé)', 'antithèse', { oxymore: 'antithese-oxymore', gradation: 'figure-antithese' }),
        q('« Va, cours, vole, et nous venge. » (Corneille, Le Cid)', 'gradation', { anaphore: 'figure-gradation', antithèse: 'figure-gradation' }),
        q('« Rome, l’unique objet de mon ressentiment ! / Rome, à qui vient ton bras d’immoler mon amant ! » (Corneille, Horace)', 'anaphore', { gradation: 'figure-anaphore', chiasme: 'figure-anaphore' }),
        q('« Il faut manger pour vivre et non pas vivre pour manger. » (Molière, L’Avare)', 'chiasme', { anaphore: 'figure-chiasme', gradation: 'figure-chiasme' }),
      ],
    },
    {
      recit: 'Sur le grand rideau rouge, le poète de la troupe a épinglé des vers. Ils cachent la deuxième lettre.',
      banque: [
        q('« Demain, dès l’aube, à l’heure où blanchit la campagne » (Hugo) : quel vers ?', 'alexandrin', { décasyllabe: 'vers-compter', octosyllabe: 'vers-compter' }),
        q('« Il pleure dans mon cœur » (Verlaine) : combien de syllabes ?', 'six', { cinq: 'vers-e-muet', sept: 'vers-compter' }),
        q('Un vers de dix syllabes s’appelle…', 'décasyllabe', { alexandrin: 'vers-noms', octosyllabe: 'vers-noms' }),
        q('Un vers de huit syllabes s’appelle…', 'octosyllabe', { décasyllabe: 'vers-noms', alexandrin: 'vers-noms' }),
        q('Rimes disposées A B A B : ce sont des rimes…', 'croisées', { embrassées: 'rimes-schema', plates: 'rimes-schema' }),
        q('Rimes disposées A B B A : ce sont des rimes…', 'embrassées', { croisées: 'rimes-schema', plates: 'rimes-schema' }),
        q('Rimes disposées A A B B : ce sont des rimes…', 'plates', { croisées: 'rimes-schema', embrassées: 'rimes-schema' }),
        q('Un sonnet à la française est formé de…', 'deux quatrains et deux tercets', { 'trois quatrains et un distique': 'sonnet-anglais', 'quatre quatrains': 'sonnet-forme' }),
      ],
    },
    {
      recit: 'Les murs du foyer des artistes sont couverts de portraits d’écrivains. Sous chaque groupe, une plaque attend le nom de leur mouvement.',
      banque: [
        q('Ronsard et Du Bellay, au XVIe siècle : quel mouvement ?', 'la Pléiade', { 'le romantisme': 'mouvement-romantisme', 'le classicisme': 'mouvement-classicisme' }),
        q('Montaigne et Rabelais : quel mouvement ?', 'l’humanisme', { 'les Lumières': 'mouvement-lumieres', 'le classicisme': 'mouvement-classicisme' }),
        q('Racine, Molière et La Fontaine : quel mouvement ?', 'le classicisme', { 'l’humanisme': 'mouvement-humanisme', 'le romantisme': 'mouvement-romantisme' }),
        q('Voltaire, Diderot et Montesquieu : quel mouvement ?', 'les Lumières', { 'l’humanisme': 'mouvement-humanisme', 'le classicisme': 'mouvement-classicisme' }),
        q('Hugo, Lamartine et la préface de Cromwell : quel mouvement ?', 'le romantisme', { 'le classicisme': 'mouvement-classicisme', 'le surréalisme': 'mouvement-surrealisme' }),
        q('Zola et Les Rougon-Macquart : quel mouvement ?', 'le naturalisme', { 'le réalisme': 'naturalisme-realisme', 'le romantisme': 'mouvement-romantisme' }),
        q('Verlaine et Mallarmé : quel mouvement ?', 'le symbolisme', { 'le surréalisme': 'mouvement-surrealisme', 'le réalisme': 'mouvement-realisme' }),
        q('Breton et Éluard : quel mouvement ?', 'le surréalisme', { 'le symbolisme': 'mouvement-symbolisme', 'le romantisme': 'mouvement-romantisme' }),
      ],
    },
    {
      recit: 'Le metteur en scène a laissé ses notes sur un pupitre. Il y a souligné ses phrases négatives.',
      banque: [
        q('Je ne joue pas ce soir.', TOTALE, { [PARTIELLE]: 'negation-totale', [RESTRICTION]: 'negation-totale' }),
        q('Le rideau ne se lève pas.', TOTALE, { [PARTIELLE]: 'negation-totale', [RESTRICTION]: 'negation-totale' }),
        q('Personne ne connaît son texte.', PARTIELLE, { [TOTALE]: 'negation-partielle', [RESTRICTION]: 'negation-partielle' }),
        q('Le souffleur ne se trompe jamais.', PARTIELLE, { [TOTALE]: 'negation-partielle', [RESTRICTION]: 'negation-partielle' }),
        q('Je n’ai rien entendu.', PARTIELLE, { [TOTALE]: 'negation-partielle', [RESTRICTION]: 'negation-partielle' }),
        q('Il ne reste que trois répétitions.', RESTRICTION, { [TOTALE]: 'negation-restrictive', [PARTIELLE]: 'negation-restrictive' }),
      ],
    },
    {
      recit: 'Dans la cabine de la régie, un carnet rapporte les questions des comédiens. Chacune a sa forme.',
      banque: [
        q('Le souffleur viendra-t-il ce soir ?', 'directe totale', { 'directe partielle': 'interrogation-totale', indirecte: 'interrogation-directe' }),
        q('Est-ce que le rideau va se lever ?', 'directe totale', { 'directe partielle': 'interrogation-totale', indirecte: 'interrogation-directe' }),
        q('Où as-tu rangé le texte ?', 'directe partielle', { 'directe totale': 'interrogation-partielle', indirecte: 'interrogation-directe' }),
        q('Qui a éteint les projecteurs ?', 'directe partielle', { 'directe totale': 'interrogation-partielle', indirecte: 'interrogation-directe' }),
        q('Je me demande qui a éteint les projecteurs.', 'indirecte', { 'directe partielle': 'interrogation-indirecte', 'directe totale': 'interrogation-indirecte' }),
        q('Dis-moi si la pièce commence.', 'indirecte', { 'directe totale': 'interrogation-indirecte', 'directe partielle': 'interrogation-indirecte' }),
      ],
    },
    {
      recit: 'La dernière lettre est gravée au-dessus de la scène, dans une devise venue du grec ancien.',
      banque: [
        q('« démocratie » : que veut dire la racine grecque « dêmos » ?', 'le peuple', { 'le pouvoir': 'etymologie-autre-racine', 'la loi': 'etymologie-sens' }),
        q('« philosophie » : que veut dire la racine grecque « sophia » ?', 'la sagesse', { 'l’amour': 'etymologie-autre-racine', 'la parole': 'etymologie-sens' }),
        q('« chronologie » : que veut dire la racine grecque « chronos » ?', 'le temps', { 'le discours': 'etymologie-autre-racine', 'l’ordre': 'etymologie-sens' }),
        q('« hippodrome » : que veut dire la racine grecque « hippos » ?', 'le cheval', { 'la course': 'etymologie-autre-racine', 'le fleuve': 'etymologie-sens' }),
        q('« bibliothèque » : que veut dire la racine grecque « biblion » ?', 'le livre', { 'le coffre': 'etymologie-autre-racine', 'la lecture': 'etymologie-sens' }),
        q('« autobiographie » : que veut dire la racine grecque « autos » ?', 'soi-même', { 'la vie': 'etymologie-autre-racine', 'l’écriture': 'etymologie-autre-racine' }),
      ],
    },
  ],

  PREMIERE: [
    {
      recit: 'Sur la première serrure, une phrase du manuscrit est gravée, avec une subordonnée entre guillemets.',
      banque: [
        q('Je crois qu’il viendra. — « qu’il viendra »', 'complétive', { relative: 'subordonnee-completive', circonstancielle: 'subordonnee-completive' }),
        q('Je veux que tu lises ce carnet. — « que tu lises ce carnet »', 'complétive', { relative: 'subordonnee-completive', 'interrogative indirecte': 'subordonnee-completive' }),
        q('Le carnet que tu lis est ancien. — « que tu lis »', 'relative', { complétive: 'subordonnee-relative', circonstancielle: 'subordonnee-relative' }),
        q('Le jour où il partit, il pleuvait. — « où il partit »', 'relative', { circonstancielle: 'relative-ou', 'interrogative indirecte': 'relative-ou' }),
        q('Il écrivait quand la nuit tombait. — « quand la nuit tombait »', 'circonstancielle', { 'interrogative indirecte': 'subordonnee-circonstancielle', relative: 'subordonnee-circonstancielle' }),
        q('Bien qu’il soit tard, l’écrivain continue. — « Bien qu’il soit tard »', 'circonstancielle', { complétive: 'subordonnee-circonstancielle', relative: 'subordonnee-circonstancielle' }),
        q('Elle se demande quand il reviendra. — « quand il reviendra »', 'interrogative indirecte', { circonstancielle: 'subordonnee-interrogative', relative: 'subordonnee-interrogative' }),
      ],
    },
    {
      recit: 'La deuxième serrure porte une lettre de l’écrivain à son éditeur. Elle est pleine de négations… ou de fausses négations.',
      banque: [
        q('Je crains qu’il ne pleuve.', EXPLETIF, { [TOTALE]: 'ne-expletif', [PARTIELLE]: 'ne-expletif' }),
        q('Partez avant qu’il ne soit trop tard.', EXPLETIF, { [TOTALE]: 'ne-expletif', [RESTRICTION]: 'ne-expletif' }),
        q('Il n’a pas fini son roman.', TOTALE, { [PARTIELLE]: 'negation-totale', [EXPLETIF]: 'negation-totale' }),
        q('Nul ne connaît ce carnet.', PARTIELLE, { [TOTALE]: 'negation-partielle', [EXPLETIF]: 'negation-partielle' }),
        q('Je ne l’ai jamais lu.', PARTIELLE, { [TOTALE]: 'negation-partielle', [RESTRICTION]: 'negation-partielle' }),
        q('L’écrivain n’écrit que la nuit.', RESTRICTION, { [TOTALE]: 'negation-restrictive', [PARTIELLE]: 'negation-restrictive' }),
      ],
    },
    {
      recit: 'La troisième serrure pose elle-même une question. Pour l’ouvrir, dis sur quoi porte cette question.',
      banque: [
        q('Qui a écrit ce carnet ?', 'sur le sujet', { 'sur le COD': 'portee-sujet', 'sur le COI': 'portee-sujet' }),
        q('Qui cherches-tu ?', 'sur le COD', { 'sur le sujet': 'portee-cod', 'sur le COI': 'portee-cod' }),
        q('Que cherches-tu dans la malle ?', 'sur le COD', { 'sur le sujet': 'portee-cod', 'sur un complément circonstanciel': 'portee-cod' }),
        q('À qui penses-tu ?', 'sur le COI', { 'sur le COD': 'portee-coi', 'sur un complément circonstanciel': 'portee-coi' }),
        q('Quand partiras-tu ?', 'sur un complément circonstanciel', { 'sur le COD': 'portee-cc', 'sur le sujet': 'portee-cc' }),
        q('Pourquoi as-tu ouvert la malle ?', 'sur un complément circonstanciel', { 'sur le COI': 'portee-cc', 'sur le COD': 'portee-cc' }),
      ],
    },
    {
      recit: 'Dans un brouillon raturé, l’écrivain a entouré une expression. Nomme le procédé.',
      banque: [
        q('« Vêtu de probité candide et de lin blanc » (Hugo)', 'zeugme', { oxymore: 'figure-zeugme', chiasme: 'figure-zeugme' }),
        q('« Je ne dirai rien de sa lâcheté, ni de ses mensonges. »', 'prétérition', { litote: 'preterition-litote', euphémisme: 'figure-preterition' }),
        q('« l’astre du jour » (pour dire : le soleil)', 'périphrase', { métaphore: 'periphrase-metaphore', métonymie: 'figure-periphrase' }),
        q('« boire un verre » (pour dire : boire ce qu’il contient)', 'métonymie', { métaphore: 'metonymie-metaphore', périphrase: 'figure-metonymie' }),
        q('« Quel temps magnifique ! » (sous une pluie battante)', 'antiphrase', { hyperbole: 'figure-antiphrase', litote: 'figure-antiphrase' }),
      ],
    },
    {
      recit: 'Sous les brouillons, une pièce de théâtre inachevée. Le mot de la cinquième serrure appartient au vocabulaire de la scène.',
      banque: [
        q('Une longue réplique d’un personnage, devant d’autres personnages', 'tirade', { monologue: 'theatre-tirade', aparté: 'theatre-tirade' }),
        q('Un personnage seul en scène se parle à lui-même', 'monologue', { tirade: 'theatre-monologue', aparté: 'theatre-monologue' }),
        q('Une réplique que les autres personnages sont censés ne pas entendre', 'aparté', { monologue: 'theatre-aparte', tirade: 'theatre-aparte' }),
        q('Un échange rapide de répliques très courtes, souvent vers contre vers', 'stichomythie', { tirade: 'theatre-stichomythie', aparté: 'theatre-stichomythie' }),
        q('Les indications de l’auteur, écrites hors des répliques', 'didascalies', { apartés: 'theatre-didascalies', tirades: 'theatre-didascalies' }),
        q('La première scène, qui présente les personnages et la situation', 'scène d’exposition', { dénouement: 'theatre-exposition', péripétie: 'theatre-exposition' }),
        q('Les trois unités du théâtre classique', 'temps, lieu, action', { 'temps, lieu, personnages': 'trois-unites', 'action, ton, décor': 'trois-unites' }),
      ],
    },
    {
      recit: 'La dernière serrure est un jeu de l’écrivain : une question sur l’histoire de la littérature.',
      banque: [
        q('La préface de Cromwell (Hugo, 1827) est le manifeste…', 'du romantisme', { 'du classicisme': 'mouvement-classicisme', 'du surréalisme': 'mouvement-surrealisme' }),
        q('Défense et illustration de la langue française (Du Bellay, 1549) est le manifeste…', 'de la Pléiade', { 'des Lumières': 'mouvement-lumieres', 'du classicisme': 'mouvement-classicisme' }),
        q('Le Manifeste du surréalisme (1924) est signé par…', 'André Breton', { 'Guillaume Apollinaire': 'surrealisme-apollinaire', 'Paul Verlaine': 'mouvement-symbolisme' }),
        q('L’Encyclopédie est dirigée par…', 'Diderot et d’Alembert', { 'Voltaire et Rousseau': 'encyclopedie-direction', 'Montaigne et Rabelais': 'mouvement-humanisme' }),
        q('« J’accuse… ! » (1898), pendant l’affaire Dreyfus, est écrit par…', 'Émile Zola', { 'Victor Hugo': 'repere-siecle', Voltaire: 'repere-siecle' }),
        q('La querelle des Anciens et des Modernes a lieu…', 'à la fin du XVIIe siècle', { 'au XVIe siècle': 'repere-querelle', 'au XIXe siècle': 'repere-querelle' }),
      ],
    },
  ],

  PREMIERE_TECHNO: [
    {
      recit: 'Sur le marbre de l’imprimerie, la une du journal attend. Une subordonnée y est en gras.',
      banque: [
        q('Le photographe reste au bureau parce qu’il pleut.', 'cause', { but: 'circ-cause', conséquence: 'circ-cause' }),
        q('Comme il pleuvait, le photographe resta au bureau.', 'cause', { but: 'circ-cause', concession: 'circ-cause' }),
        q('L’article est si long qu’il faut le couper.', 'conséquence', { cause: 'circ-consequence', but: 'circ-consequence' }),
        q('Le journaliste vérifie ses sources pour que l’article soit exact.', 'but', { conséquence: 'circ-but', cause: 'circ-but' }),
        q('Si la rotative repart, le journal sortira à l’heure.', 'condition', { cause: 'circ-condition', concession: 'circ-condition' }),
        q('Bien que l’article soit prêt, le rédacteur hésite.', 'concession', { cause: 'circ-concession', condition: 'circ-concession' }),
      ],
    },
    {
      recit: 'Le deuxième verrou porte un démenti : le journal doit nier une fausse nouvelle. Observe comment.',
      banque: [
        q('Ce témoignage est invérifiable.', 'préfixe négatif', { 'phrase négative': 'negation-par-prefixe', antonyme: 'negation-par-prefixe' }),
        q('Le journaliste est malhonnête.', 'préfixe négatif', { 'phrase négative': 'negation-par-prefixe', antonyme: 'negation-par-prefixe' }),
        q('Le titre est illisible.', 'préfixe négatif', { antonyme: 'negation-par-prefixe', 'phrase négative': 'negation-par-prefixe' }),
        q('Ce témoignage n’est pas vérifiable.', 'phrase négative', { 'préfixe négatif': 'negation-par-phrase', antonyme: 'negation-par-phrase' }),
        q('Personne n’a relu l’article.', 'phrase négative', { 'préfixe négatif': 'negation-par-phrase', antonyme: 'negation-par-phrase' }),
        q('L’imprimeur se tait.', 'antonyme', { 'préfixe négatif': 'negation-par-antonyme', 'phrase négative': 'negation-par-antonyme' }),
        q('La salle de rédaction est vide.', 'antonyme', { 'phrase négative': 'negation-par-antonyme', 'préfixe négatif': 'negation-par-antonyme' }),
      ],
    },
    {
      recit: 'Le troisième verrou affiche une note du rédacteur en chef, pleine de questions.',
      banque: [
        q('Quand l’article sera-t-il prêt ?', 'interrogation directe', { 'interrogative indirecte': 'interro-directe', 'subordonnée relative': 'interro-directe' }),
        q('Est-ce que la rotative fonctionne ?', 'interrogation directe', { 'interrogative indirecte': 'interro-directe', 'subordonnée relative': 'interro-directe' }),
        q('Le rédacteur demande quand l’article sera prêt. — « quand l’article sera prêt »', 'interrogative indirecte', { 'interrogation directe': 'interro-indirecte', 'subordonnée relative': 'interro-indirecte' }),
        q('Dis-moi si la rotative fonctionne. — « si la rotative fonctionne »', 'interrogative indirecte', { 'interrogation directe': 'interro-indirecte', 'subordonnée relative': 'interro-indirecte' }),
        q('Je voudrais savoir qui a signé cet article. — « qui a signé cet article »', 'interrogative indirecte', { 'subordonnée relative': 'interro-pas-relative', 'interrogation directe': 'interro-indirecte' }),
        q('Voici le journaliste qui a signé cet article. — « qui a signé cet article »', 'subordonnée relative', { 'interrogative indirecte': 'interro-relative', 'interrogation directe': 'interro-relative' }),
      ],
    },
    {
      recit: 'Le quatrième verrou garde l’éditorial, mais il y manque un mot de liaison.',
      banque: [
        q('L’article est court ; ___, il dit l’essentiel.', 'pourtant', { donc: 'connecteur-opposition', car: 'connecteur-opposition' }),
        q('Le titre est accrocheur ; ___, l’article est creux.', 'cependant', { donc: 'connecteur-opposition', car: 'connecteur-opposition' }),
        q('Les sources sont vérifiées ; ___, l’article peut paraître.', 'donc', { pourtant: 'connecteur-consequence', car: 'connecteur-consequence' }),
        q('Le photographe est arrivé en retard ; ___, il a manqué la conférence.', 'par conséquent', { pourtant: 'connecteur-consequence', car: 'connecteur-consequence' }),
        q('L’article sera coupé, ___ il est trop long.', 'car', { donc: 'connecteur-cause', pourtant: 'connecteur-cause' }),
      ],
    },
    {
      recit: 'Le cinquième verrou protège la page des petites annonces. Un pronom relatif y a sauté.',
      banque: [
        q('L’article ___ je te parle paraîtra demain.', 'dont', { que: 'relatif-dont', où: 'relatif-dont' }),
        q('Le dossier ___ il a besoin est sur le bureau.', 'dont', { que: 'relatif-dont', où: 'relatif-dont' }),
        q('La ville ___ il est né accueille le salon de la presse.', 'où', { dont: 'relatif-ou', que: 'relatif-ou' }),
        q('Le reportage ___ le journaliste a écrit est primé.', 'que', { dont: 'relatif-que', qui: 'relatif-que' }),
        q('Le photographe ___ a pris ce cliché est célèbre.', 'qui', { que: 'relatif-qui', dont: 'relatif-qui' }),
        q('C’est le stylo avec ___ il écrit ses articles.', 'lequel', { qui: 'relatif-lequel', que: 'relatif-lequel' }),
      ],
    },
    {
      recit: 'Le dernier verrou cache le lexique du journal, plein de mots nouveaux. Dis comment celui-ci est formé.',
      banque: [
        q('« courriel » (courrier + électronique)', 'mot-valise', { emprunt: 'lexique-mot-valise', troncation: 'lexique-mot-valise' }),
        q('« franglais » (français + anglais)', 'mot-valise', { dérivation: 'lexique-mot-valise', emprunt: 'lexique-mot-valise' }),
        q('« hebdo » (pour hebdomadaire)', 'troncation', { 'mot-valise': 'lexique-troncation', dérivation: 'lexique-troncation' }),
        q('« info » (pour information)', 'troncation', { 'mot-valise': 'lexique-troncation', emprunt: 'lexique-troncation' }),
        q('« week-end »', 'emprunt', { 'mot-valise': 'lexique-emprunt', dérivation: 'lexique-emprunt' }),
        q('« déconfiner » (dé + confiner)', 'dérivation', { 'mot-valise': 'lexique-derivation', emprunt: 'lexique-derivation' }),
      ],
    },
  ],
};

/** Les banques, pour les tests : chaque phrase de chaque étape. */
export const BANQUES = Object.fromEntries(
  Object.entries(ETAPES).map(([classe, etapes]) => [classe, etapes.map((e) => e.banque)]),
);

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { au, melanger } = outils(graine);
  const classe = ETAPES[niveau] ? niveau : CLASSES[0];
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
  // --------------------------------------------- 2de : le souffleur a disparu
  '2de-etape-1': 'Première lettre : nomme la figure de style.',
  '2de-etape-2': 'Deuxième lettre : une question de versification.',
  '2de-etape-3': 'Troisième lettre : à quel mouvement littéraire appartiennent ces auteurs ?',
  '2de-etape-4': 'Quatrième lettre : quelle sorte de négation ?',
  '2de-etape-5': 'Cinquième lettre : quelle sorte d’interrogation ?',
  '2de-etape-6': 'Dernière lettre : retrouve le sens de la racine grecque.',
  '2de-etape-1-regle': 'Cherche le mécanisme. Dire moins pour suggérer plus, litote ; adoucir une réalité pénible, euphémisme ; exagérer, hyperbole. Deux contraires collés, oxymore ; opposés dans la phrase, antithèse.',
  '2de-etape-2-regle': 'Compte les syllabes en prononçant le e muet devant une consonne, jamais devant une voyelle ni en fin de vers. Pour les rimes, nomme chaque son de fin de vers par une lettre.',
  '2de-etape-3-regle': 'Situe d’abord les auteurs dans leur siècle : seizième, humanisme et Pléiade ; dix-septième, classicisme ; dix-huitième, Lumières ; dix-neuvième, romantisme, réalisme, naturalisme et symbolisme ; vingtième, surréalisme.',
  '2de-etape-4-regle': 'Ne et pas nient toute la phrase : négation totale. Jamais, rien, personne ou plus n’en nient qu’une partie : négation partielle. Ne et que veulent dire seulement : tournure restrictive.',
  '2de-etape-5-regle': 'On répond par oui ou par non : interrogation totale. Un mot interrogatif porte sur un élément : interrogation partielle. Sans point d’interrogation, après un verbe comme demander : interrogation indirecte.',
  '2de-etape-6-regle': 'Découpe le mot en deux racines grecques, et cherche d’autres mots qui les partagent : chacune y garde son sens.',
  'litote-euphemisme': 'L’euphémisme adoucit une réalité pénible ; la litote dit moins pour faire entendre plus. Ici, la phrase suggère bien davantage qu’elle ne dit : c’est une litote.',
  'figure-litote': 'On dit moins pour faire entendre plus : c’est une litote, le contraire d’une exagération.',
  'euphemisme-litote': 'La litote dit moins pour faire entendre plus ; l’euphémisme adoucit une réalité pénible, comme la mort. C’est un euphémisme.',
  'figure-euphemisme': 'L’expression adoucit une réalité pénible au lieu de l’exagérer : c’est un euphémisme.',
  'figure-hyperbole': 'L’expression exagère pour frapper les esprits : c’est une hyperbole.',
  'oxymore-antithese': 'L’antithèse oppose deux idées dans la phrase ; l’oxymore colle deux mots contraires dans le même groupe, comme obscure et clarté.',
  'figure-oxymore': 'Deux mots de sens contraires sont collés dans le même groupe : c’est un oxymore.',
  'antithese-oxymore': 'L’oxymore colle deux mots contraires dans un même groupe ; ici, les contraires s’opposent d’une proposition à l’autre : c’est une antithèse.',
  'figure-antithese': 'Deux idées contraires s’opposent dans la phrase, sans monter en intensité : c’est une antithèse.',
  'figure-gradation': 'Les termes se suivent en montant d’intensité : c’est une gradation.',
  'figure-anaphore': 'Le même mot revient en tête de vers ou de phrase : c’est une anaphore.',
  'figure-chiasme': 'Les mots reviennent en ordre inversé, comme un miroir : c’est un chiasme.',
  'vers-compter': 'Compte les syllabes une à une, en élidant le e muet devant une voyelle. Douze syllabes font un alexandrin, dix un décasyllabe, huit un octosyllabe.',
  'vers-e-muet': 'Le e muet de pleure se prononce, car il est suivi d’une consonne : il compte pour une syllabe.',
  'vers-noms': 'Le nom du vers dit son nombre de syllabes : octo, huit ; déca, dix. L’alexandrin, lui, en a douze.',
  'rimes-schema': 'A B A B, les rimes se croisent ; A B B A, l’une embrasse l’autre ; A A B B, elles se suivent : ce sont des rimes plates.',
  'sonnet-anglais': 'Trois quatrains et un distique, c’est le sonnet anglais, celui de Shakespeare. Le sonnet à la française a deux quatrains, puis deux tercets.',
  'sonnet-forme': 'Un sonnet compte quatorze vers : deux quatrains, puis deux tercets.',
  'mouvement-humanisme': 'L’humanisme, c’est le seizième siècle : Rabelais, Montaigne, la confiance dans l’homme et dans le savoir antique.',
  'mouvement-classicisme': 'Le classicisme, c’est le dix-septième siècle : Racine, Molière, La Fontaine, la règle et la mesure.',
  'mouvement-lumieres': 'Les Lumières, c’est le dix-huitième siècle : Voltaire, Diderot, Montesquieu, la raison contre les préjugés.',
  'mouvement-romantisme': 'Le romantisme, c’est la première moitié du dix-neuvième siècle : Hugo, Lamartine, le moi et la liberté de l’art.',
  'mouvement-realisme': 'Le réalisme, c’est le dix-neuvième siècle de Balzac et de Flaubert : peindre la société telle qu’elle est.',
  'naturalisme-realisme': 'Zola va plus loin que le réalisme : il étudie l’hérédité et le milieu comme un savant. C’est le naturalisme.',
  'mouvement-symbolisme': 'Le symbolisme, c’est la fin du dix-neuvième siècle : Verlaine, Mallarmé, suggérer plutôt que décrire.',
  'mouvement-surrealisme': 'Le surréalisme, c’est le vingtième siècle : Breton, Éluard, le rêve et l’inconscient.',
  'negation-totale': 'Ne et pas nient toute la phrase : c’est une négation totale.',
  'negation-partielle': 'Jamais, rien, personne, plus ou nul ne nient qu’une partie de la phrase : c’est une négation partielle.',
  'negation-restrictive': 'Ne et que veulent dire seulement : la phrase n’est pas niée, elle est restreinte. C’est une tournure restrictive.',
  'interrogation-totale': 'On peut répondre par oui ou par non : l’interrogation est totale.',
  'interrogation-partielle': 'Un mot interrogatif, comme qui, où ou quand, porte sur un seul élément : l’interrogation est partielle.',
  'interrogation-directe': 'La question est posée telle quelle, avec son point d’interrogation : elle est directe.',
  'interrogation-indirecte': 'Pas de point d’interrogation : la question dépend d’un verbe comme demander ou dire. C’est une interrogation indirecte.',
  'etymologie-autre-racine': 'Ce sens appartient à l’autre morceau du mot : découpe-le en ses deux racines, et donne à chacune son sens.',
  'etymologie-sens': 'Pense à d’autres mots de la même famille : ils gardent le sens de la racine.',

  // ------------------------------------------ 1re : la malle de l'écrivain
  '1re-etape-1': 'Première serrure : quelle est la nature de la subordonnée entre guillemets ?',
  '1re-etape-2': 'Deuxième serrure : quelle valeur a cette négation ?',
  '1re-etape-3': 'Troisième serrure : sur quoi porte cette interrogation partielle ?',
  '1re-etape-4': 'Quatrième serrure : nomme le procédé.',
  '1re-etape-5': 'Cinquième serrure : trouve le mot juste du théâtre.',
  '1re-etape-6': 'Dernière serrure : une question de culture littéraire.',
  '1re-etape-1-regle': 'Regarde le mot qui introduit la subordonnée. Relative : il reprend un antécédent. Complétive : que complète le verbe. Circonstancielle : elle dit quand, pourquoi ou malgré quoi. Interrogative indirecte : elle rapporte une question.',
  '1re-etape-2-regle': 'Ne et pas : négation totale. Jamais, rien ou nul : négation partielle. Ne et que : restriction. Après craindre que ou avant que, un ne qui ne nie rien est explétif.',
  '1re-etape-3-regle': 'Réponds à la question par une phrase complète, puis donne sa fonction à la réponse : sujet, COD, COI ou complément circonstanciel.',
  '1re-etape-4-regle': 'Cherche le mécanisme : un mot pour un autre qui lui est lié, métonymie ; une description à la place du nom, périphrase ; dire le contraire, antiphrase ; annoncer qu’on se tait en parlant, prétérition ; un verbe pour deux compléments de nature différente, zeugme.',
  '1re-etape-5-regle': 'Monologue : seul en scène. Tirade : longue réplique devant d’autres personnages. Aparté : pour le public seulement. Stichomythie : répliques très courtes. Didascalies : indications de l’auteur.',
  '1re-etape-6-regle': 'Situe d’abord le texte dans son siècle, puis cherche le mouvement ou l’auteur de ce moment-là.',
  'subordonnee-completive': 'Que n’a pas d’antécédent : la subordonnée complète le verbe, comme un complément d’objet. C’est une complétive.',
  'subordonnee-relative': 'Le pronom reprend un nom placé juste avant, son antécédent : c’est une relative.',
  'relative-ou': 'Où reprend ici un nom placé juste avant lui : c’est un pronom relatif, et la subordonnée est relative.',
  'subordonnee-circonstancielle': 'La subordonnée se déplace et se supprime ; elle dit quand, pourquoi ou malgré quoi : c’est une circonstancielle.',
  'subordonnee-interrogative': 'Après se demander, la subordonnée rapporte une question, sans antécédent : c’est une interrogative indirecte.',
  'ne-expletif': 'Après craindre que ou avant que, ce ne ne nie rien : la phrase reste affirmative. C’est un ne explétif.',
  'portee-sujet': 'Réponds à la question par une phrase : la réponse fait l’action du verbe, elle en est le sujet.',
  'portee-cod': 'Réponds à la question par une phrase : la réponse complète le verbe sans préposition. L’interrogation porte sur le COD.',
  'portee-coi': 'La réponse est introduite par à : on pense à quelqu’un. L’interrogation porte sur le COI.',
  'portee-cc': 'La réponse dit quand ou pourquoi, et on pourrait la supprimer : l’interrogation porte sur un complément circonstanciel.',
  'figure-zeugme': 'Un même mot, vêtu, gouverne deux compléments de nature différente, l’un abstrait et l’autre concret : c’est un zeugme.',
  'preterition-litote': 'La litote dit moins pour faire entendre plus ; ici, on prétend taire ce qu’on dit quand même : c’est une prétérition.',
  'figure-preterition': 'On annonce qu’on ne parlera pas d’une chose, tout en en parlant : c’est une prétérition.',
  'periphrase-metaphore': 'Aucune image ici : on désigne le soleil par plusieurs mots qui le décrivent. C’est une périphrase.',
  'figure-periphrase': 'Plusieurs mots remplacent un seul nom, en le décrivant : c’est une périphrase.',
  'metonymie-metaphore': 'Aucune ressemblance ici, mais un lien logique : on nomme le contenant pour le contenu. C’est une métonymie.',
  'figure-metonymie': 'On désigne une chose par une autre qui lui est liée, le contenant pour le contenu : c’est une métonymie.',
  'figure-antiphrase': 'On dit le contraire de ce qu’on pense, pour se moquer : c’est une antiphrase.',
  'theatre-tirade': 'Une longue réplique dite devant d’autres personnages : c’est une tirade. Le monologue suppose que le personnage soit seul.',
  'theatre-monologue': 'Le personnage est seul en scène et se parle à lui-même : c’est un monologue.',
  'theatre-aparte': 'Les autres personnages sont censés ne pas entendre : c’est un aparté, adressé au public.',
  'theatre-stichomythie': 'Des répliques très courtes, qui se répondent vers à vers : c’est une stichomythie.',
  'theatre-didascalies': 'Ce que l’auteur écrit hors des répliques, pour le jeu et le décor : ce sont les didascalies.',
  'theatre-exposition': 'La première scène présente les personnages et la situation : c’est la scène d’exposition. Le dénouement, lui, vient à la fin.',
  'trois-unites': 'La règle classique des trois unités : une seule action, en un seul lieu, en une seule journée. Unité de temps, de lieu et d’action.',
  'surrealisme-apollinaire': 'Apollinaire annonce le surréalisme, mais il meurt avant le manifeste, signé par André Breton.',
  'encyclopedie-direction': 'Voltaire et Rousseau ont écrit des articles, mais l’Encyclopédie est dirigée par Diderot et d’Alembert.',
  'repere-siecle': 'Situe d’abord le texte dans son siècle, puis cherche quel auteur écrivait à ce moment-là.',
  'repere-querelle': 'La querelle oppose Boileau, pour les Anciens, à Perrault, pour les Modernes : c’est la fin du dix-septième siècle.',

  // ---------------------------------------- 1re techno : la rotative bloquée
  '1tec-etape-1': 'Premier verrou : quel est le sens de la subordonnée ?',
  '1tec-etape-2': 'Deuxième verrou : comment la négation est-elle exprimée ?',
  '1tec-etape-3': 'Troisième verrou : interrogation directe, interrogative indirecte, ou relative ?',
  '1tec-etape-4': 'Quatrième verrou : choisis le connecteur logique.',
  '1tec-etape-5': 'Cinquième verrou : choisis le pronom relatif.',
  '1tec-etape-6': 'Dernier verrou : comment ce mot est-il formé ?',
  '1tec-etape-1-regle': 'Le mot qui introduit la subordonnée donne son sens : parce que, cause ; si bien que, conséquence ; pour que, but ; si, condition ; bien que, concession.',
  '1tec-etape-2-regle': 'La négation peut passer par la phrase, avec ne et pas ; par un préfixe, comme in ou mal ; ou par un antonyme, un mot de sens contraire.',
  '1tec-etape-3-regle': 'Directe : la question est posée, avec un point d’interrogation. Indirecte : elle dépend d’un verbe comme demander, sans point d’interrogation. Relative : le pronom reprend un antécédent.',
  '1tec-etape-4-regle': 'Cherche le lien entre les deux idées : une opposition, pourtant ; une conséquence, donc ; une cause, car.',
  '1tec-etape-5-regle': 'Le pronom relatif dépend de sa fonction : sujet, qui ; complément direct, que ; complément construit avec de, dont ; lieu ou temps, où ; après une préposition, lequel.',
  '1tec-etape-6-regle': 'Mot-valise : deux mots soudés. Troncation : un mot coupé. Emprunt : un mot venu d’une autre langue. Dérivation : un préfixe ou un suffixe ajouté à un mot.',
  'circ-cause': 'Parce que, puisque, ou comme en tête de phrase : la subordonnée donne la raison. C’est la cause.',
  'circ-consequence': 'Si long que, tellement que, si bien que : la subordonnée dit ce qui en résulte. C’est la conséquence.',
  'circ-but': 'Pour que, afin que : la subordonnée dit ce qu’on cherche à obtenir. C’est le but.',
  'circ-condition': 'Si : la principale ne se réalise qu’à cette condition. C’est la condition.',
  'circ-concession': 'Bien que, quoique : un fait qui aurait pu empêcher l’action, mais ne l’empêche pas. C’est la concession.',
  'negation-par-prefixe': 'Le mot porte un préfixe négatif, comme in, il ou mal : la négation est dans le mot lui-même.',
  'negation-par-phrase': 'Ne et pas, ou ne et personne : la négation porte sur la phrase. C’est une phrase négative.',
  'negation-par-antonyme': 'Aucune marque de négation, aucun préfixe : un mot de sens contraire suffit à nier. C’est un antonyme.',
  'interro-directe': 'Point d’interrogation, inversion du sujet ou est-ce que : la question est posée directement.',
  'interro-indirecte': 'Pas de point d’interrogation : la question dépend d’un verbe comme demander ou dire. C’est une interrogative indirecte.',
  'interro-pas-relative': 'Qui n’a pas d’antécédent ici : il rapporte une question, après le verbe savoir. C’est une interrogative indirecte.',
  'interro-relative': 'Qui reprend un nom placé juste avant lui, son antécédent : c’est une subordonnée relative, pas une question.',
  'connecteur-opposition': 'Les deux idées s’opposent : il faut un connecteur d’opposition, comme pourtant ou cependant.',
  'connecteur-consequence': 'La seconde idée découle de la première : il faut un connecteur de conséquence, comme donc ou par conséquent.',
  'connecteur-cause': 'La seconde idée explique la première : il faut un connecteur de cause, comme car.',
  'relatif-dont': 'Le verbe se construit avec de : parler de, avoir besoin de. Le pronom relatif est dont.',
  'relatif-ou': 'Le pronom reprend un lieu : on est né quelque part. C’est où.',
  'relatif-que': 'Le pronom est complément d’objet direct du verbe, qui a déjà son sujet : c’est que.',
  'relatif-qui': 'Le pronom est le sujet du verbe qui le suit : c’est qui.',
  'relatif-lequel': 'Après une préposition, pour reprendre une chose, on emploie lequel ; qui ne reprend qu’une personne.',
  'lexique-mot-valise': 'Deux mots soudés en un seul, le début de l’un et la fin de l’autre : c’est un mot-valise.',
  'lexique-troncation': 'Le mot est coupé, on n’en garde que le début : c’est une troncation.',
  'lexique-emprunt': 'Le mot vient tel quel d’une autre langue, ici l’anglais : c’est un emprunt.',
  'lexique-derivation': 'Un préfixe s’ajoute à un mot qui existe déjà : c’est une dérivation.',
};
