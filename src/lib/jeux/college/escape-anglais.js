/**
 * L'ESCAPE GAME D'ANGLAIS DU COLLÈGE — Marine, de la 6e à la 3e. Camara, le
 * 06/10/2026 : « les escape games pour les maths, l'histoire-géo, le français,
 * l'anglais et les sciences ».
 *
 * L'IMMERSION FAIT L'INTÉRÊT : le récit, la question et les choix (affichés)
 * sont EN ANGLAIS, au niveau de la classe (A1 en 6e, B1 en 3e). Ce qui se DIT
 * (PHRASES, enregistré une fois) reste en français : la consigne de l'étape
 * et, pour chaque erreur, la règle qui permet de faire juste. Les seuls mots
 * anglais de PHRASES sont fixes et nécessaires à la règle (he, she, it, since…).
 *
 * UNE HISTOIRE PAR CLASSE, SIX CADENAS, L'ORDRE DU RÉCIT :
 *   - 6e, anglais britannique : chasse au trésor dans Londres. Code BIGBEN.
 *     L'âge avec be, le génitif et les possessifs, can, présent simple ou en
 *     -ing, do et does, une énigme à lire.
 *   - 5e, anglais britannique : le mystère d'un château écossais. Code NESSIE.
 *     Les nations du Royaume-Uni, les prépositions, le prétérit en -ing, some,
 *     any, much, many, le comparatif (hauteurs tirées au hasard), une lettre.
 *   - 4e, anglais américain : un tableau volé à Manhattan. Code HUDSON.
 *     Prétérit ou present perfect, since et for, who et which, les modaux, le
 *     passif, les connecteurs et un message à comprendre.
 *   - 3e, anglais américain : la mission Aurora autour de la Lune. Code APOLLO.
 *     Le temps juste, infinitif ou -ing, le discours rapporté, les phrases avec
 *     if, le passif à plusieurs temps, un dernier message.
 *
 * Chaque étape tire une de ses variantes (écrites à la main, une seule bonne
 * réponse défendable) et mélange ses choix ; les étapes, elles, gardent
 * l'ordre de l'histoire. Chaque choix faux a son piège nommé.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-anglais', titre: 'Escape game en anglais', matiereCode: 'ANGLAIS' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le trésor de Londres',
    accroche: 'Six cadenas dans les rues de Londres.',
    intro: 'Welcome to London! A treasure box is hidden in the city: follow Lily, open the six locks and find the secret code.',
    fin: 'The code is BIG BEN: the treasure box opens, and inside there is a golden key to London!',
    competences: [
      'AN_6E_GRAM_AGE', 'AN_6E_GRAM_POSSESSION', 'AN_6E_GRAM_MODAUX',
      'AN_6E_GRAM_PRESENT', 'AN_6E_GRAM_AUXILIAIRE', 'AN_6E_COMP_ECRIT',
    ],
  },
  CINQUIEME: {
    titre: 'Le mystère du château écossais',
    accroche: 'Un bruit étrange dans la tour du château.',
    intro: 'You are spending the holidays at Glenmore Castle, in the Highlands of Scotland. Every night, a strange noise comes from the tower: open the six locks and discover the secret!',
    fin: 'The code is NESSIE: behind the stone, you find the old lord’s treasure, and in the lake, a long green neck says hello!',
    competences: [
      'AN_5E_CULT_ROYAUME_UNI', 'AN_5E_GRAM_PREPOSITIONS', 'AN_5E_GRAM_PRETERIT_ING',
      'AN_5E_GRAM_QUANTITE', 'AN_5E_GRAM_COMPARATIF', 'AN_5E_COMP_ECRIT',
    ],
  },
  QUATRIEME: {
    titre: 'Enquête à New York',
    accroche: 'Un tableau a disparu à Manhattan.',
    intro: 'Welcome to New York City! Last night, a famous painting disappeared from a small museum in Manhattan: help Detective Carter find it before the morning news.',
    fin: 'The code is HUDSON: on Pier 25, Mr. Brown gives the painting back, safe and dry, and the case is closed!',
    competences: [
      'AN_4E_GRAM_PRESENT_PERFECT', 'AN_4E_GRAM_SINCE_FOR', 'AN_4E_GRAM_RELATIVES',
      'AN_4E_GRAM_MODAUX', 'AN_4E_GRAM_PASSIF', 'AN_4E_LEX_CONNECTEURS', 'AN_4E_COMP_ECRIT',
    ],
  },
  TROISIEME: {
    titre: 'Mission Aurora',
    accroche: 'Ramène l’équipage de la Lune.',
    intro: 'Welcome to Mission Control in Houston, Texas! The spaceship Aurora is in trouble near the Moon: solve six problems and bring the crew safely back to Earth.',
    fin: 'The code is APOLLO: the Aurora splashes down safely in the Pacific Ocean, and the whole Mission Control team cheers!',
    competences: [
      'AN_3E_GRAM_TEMPS', 'AN_3E_GRAM_INFINITIF', 'AN_3E_GRAM_DISCOURS',
      'AN_3E_GRAM_CONDITIONNEL', 'AN_3E_GRAM_PASSIF', 'AN_3E_COMP_ECRIT',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Une variante : la question affichée, la bonne réponse, et chaque choix faux avec son piège. */
const v = (question, bonne, pieges) => ({ question, bonne, pieges });

/** Les trois tours du château de la 5e : leurs hauteurs sont tirées au hasard. */
const TOURS = ['North', 'East', 'West'];

/** 5e, cinquième cadenas : comparer les tours d'après les hauteurs du récit. */
function lesTours({ au, melanger }) {
  const h = melanger([15, 20, 25, 30, 35, 40, 45, 50, 55, 60]).slice(0, 3);
  const recit = `In the library, an old map shows the three towers of the castle: the North Tower is ${h[0]} metres high, the East Tower is ${h[1]} metres high and the West Tower is ${h[2]} metres high. Under the map, someone has written: “Only the true sentence opens the lock.”`;

  if (au([true, false])) {
    const [a, b] = melanger([0, 1, 2]);
    const plusHaute = h[a] > h[b];
    const bonne = plusHaute ? 'taller than' : 'shorter than';
    const inverse = plusHaute ? 'shorter than' : 'taller than';
    const long = plusHaute ? 'more tall than' : 'more short than';
    return {
      recit,
      ...v(`The ${TOURS[a]} Tower is ___ the ${TOURS[b]} Tower.`, bonne, {
        [long]: 'comparatif-court', [inverse]: 'lire-nombres',
      }),
    };
  }

  const grand = au([true, false]);
  const cible = h.indexOf(grand ? Math.max(...h) : Math.min(...h));
  const autre = au([0, 1, 2].filter((i) => i !== cible));
  const adjectif = grand ? 'tallest' : 'shortest';
  const long = grand ? 'most tall' : 'most short';
  return {
    recit,
    ...v('Which sentence is true?', `The ${TOURS[cible]} Tower is the ${adjectif}.`, {
      [`The ${TOURS[autre]} Tower is the ${adjectif}.`]: 'lire-nombres',
      [`The ${TOURS[cible]} Tower is the ${long}.`]: 'superlatif-court',
    }),
  };
}

/** Les banques, classe par classe : six étapes dans l'ordre du récit, et le code qu'elles forment. */
const BANQUES = {
  SIXIEME: {
    prefixe: '6e',
    code: ['B', 'I', 'G', 'B', 'E', 'N'],
    etapes: [
      {
        recit: 'You arrive at King’s Cross station, in London. A girl with a red scarf smiles at you: she is your guide.',
        variantes: [
          v('Lily says: “Hello! My name is Lily and I ___ twelve.”', 'am', { have: 'age-avec-have', is: 'be-sujet' }),
          v('Lily says: “My brother Sam ___ fourteen.”', 'is', { has: 'age-avec-have', are: 'be-sujet' }),
          v('Lily asks you: “How old ___ you?”', 'are', { have: 'age-avec-have', is: 'be-sujet' }),
        ],
      },
      {
        recit: 'Lily shows you a photo of her family in front of a black taxi. “This is my uncle Tom: he is a taxi driver!”',
        variantes: [
          v('Whose taxi is it?', 'It’s Tom’s taxi.', { 'It’s the taxi of Tom.': 'genitif', 'It’s Tom taxi.': 'genitif' }),
          v('In the photo, Lily is with ___ father.', 'her', { his: 'possessif-possesseur', its: 'possessif-possesseur' }),
          v('In the photo, Tom is with ___ mother.', 'his', { her: 'possessif-possesseur', its: 'possessif-possesseur' }),
          v('Lily and her brother love ___ uncle Tom.', 'their', { there: 'their-there', his: 'possessif-possesseur' }),
        ],
      },
      {
        recit: 'Now you are at Buckingham Palace. A guard in a red jacket and a tall black hat stands very still in front of the gate.',
        variantes: [
          v('Choose the correct question.', 'Can I take a photo?', {
            'Do I can take a photo?': 'modal-sans-do', 'Can I to take a photo?': 'modal-sans-to',
          }),
          v('Choose the correct sentence.', 'The guard can stand for hours.', {
            'The guard cans stand for hours.': 'modal-sans-s', 'The guard can to stand for hours.': 'modal-sans-to',
          }),
          v('Choose the correct sentence.', 'You can’t touch the guard.', {
            'You don’t can touch the guard.': 'modal-sans-do', 'You can’t to touch the guard.': 'modal-sans-to',
          }),
        ],
      },
      {
        recit: 'In the Natural History Museum, a huge dinosaur skeleton stands in the main hall. Lily finds a new clue under a bench.',
        variantes: [
          v('Every day, the museum ___ at ten o’clock.', 'opens', { open: 'present-s', 'is opening': 'present-habitude' }),
          v('Look! A guide ___ a story to some children.', 'is telling', { tells: 'present-maintenant', telling: 'ing-sans-be' }),
          v('Lily ___ the museum every Saturday.', 'visits', { visit: 'present-s', 'is visiting': 'present-habitude' }),
          v('Listen! Lily ___ a song about dinosaurs.', 'is singing', { sings: 'present-maintenant', singing: 'ing-sans-be' }),
        ],
      },
      {
        recit: 'In the museum shop, the shopkeeper smiles at you. “Ask me a correct question and I will give you a letter.”',
        variantes: [
          v('Choose the correct question.', 'Does Lily like dinosaurs?', {
            'Do Lily like dinosaurs?': 'auxiliaire-do-does', 'Does Lily likes dinosaurs?': 'auxiliaire-base',
          }),
          v('Choose the correct question.', 'Where do you live?', {
            'Where you live?': 'question-sans-auxiliaire', 'Where does you live?': 'auxiliaire-do-does',
          }),
          v('Choose the correct question.', 'Does the shop sell maps?', {
            'Do the shop sell maps?': 'auxiliaire-do-does', 'Does the shop sells maps?': 'auxiliaire-base',
          }),
          v('Choose the correct sentence.', 'Tom doesn’t like rain.', {
            'Tom doesn’t likes rain.': 'auxiliaire-base', 'Tom don’t like rain.': 'auxiliaire-do-does',
          }),
        ],
      },
      {
        recit: 'Lily gives you the last clue: a riddle on an old postcard. Read it carefully!',
        variantes: [
          v('“I am very tall and very old. I have got four clock faces, and you can hear my bell every hour. Who am I?”', 'Big Ben', {
            'Tower Bridge': 'lire-indices', 'the London Eye': 'lire-indices',
          }),
          v('“I am a giant wheel next to the River Thames. From the top, you can see all of London. Who am I?”', 'the London Eye', {
            'Big Ben': 'lire-indices', 'Tower Bridge': 'lire-indices',
          }),
          v('“I am a bridge with two tall towers. I open in the middle to let big ships pass. Who am I?”', 'Tower Bridge', {
            'London Bridge': 'lire-indices', 'Big Ben': 'lire-indices',
          }),
        ],
      },
    ],
  },

  CINQUIEME: {
    prefixe: '5e',
    code: ['N', 'E', 'S', 'S', 'I', 'E'],
    etapes: [
      {
        recit: 'You arrive at Glenmore Castle, in the Highlands of Scotland. On the old wooden door, a note says: “Answer my question and I will open.”',
        variantes: [
          v('What is the capital of Scotland?', 'Edinburgh', { Glasgow: 'capitale-ecosse', Cardiff: 'capitale-ecosse' }),
          v('What does the Scottish flag look like?', 'a white diagonal cross on blue', {
            'a red cross on white': 'drapeau-ecosse', 'a red dragon on green and white': 'drapeau-ecosse',
          }),
          v('Which country is NOT part of the United Kingdom?', 'the Republic of Ireland', {
            Wales: 'nations-royaume', 'Northern Ireland': 'nations-royaume',
          }),
        ],
      },
      {
        recit: 'Inside, the great hall is dark and cold. There is a long table, an old fireplace and a big painting of a lady in a green dress.',
        variantes: [
          v('The painting is ___ the wall.', 'on', { in: 'on-surface', at: 'on-surface' }),
          v('The key is ___ the carpet: lift the carpet to find it.', 'under', { on: 'lire-position', above: 'lire-position' }),
          v('The lady’s ghost comes back every year ___ October.', 'in', { on: 'prepositions-temps', at: 'prepositions-temps' }),
          v('The family has lunch in the great hall ___ Sundays.', 'on', { in: 'prepositions-temps', at: 'prepositions-temps' }),
        ],
      },
      {
        recit: 'Suddenly, all the lights go out and a strange noise comes from the tower! When the lights come back on, everyone tells you what they were doing.',
        variantes: [
          v('The cook: “I ___ dinner when the lights went out.”', 'was cooking', {
            'were cooking': 'was-were', 'was cook': 'ing-oublie',
          }),
          v('The twins: “We ___ in the library when the lights went out.”', 'were reading', {
            'was reading': 'was-were', 'are reading': 'preterit-be',
          }),
          v('The gardener: “I ___ the dog in the garden.”', 'was walking', {
            'were walking': 'was-were', 'am walking': 'preterit-be',
          }),
          v('Lady Fiona: “My husband and I ___ cards by the fire.”', 'were playing', {
            'was playing': 'was-were', 'were play': 'ing-oublie',
          }),
        ],
      },
      {
        recit: 'You go down to the castle kitchen to look for a clue. The shelves are almost empty, but there is a note on the table.',
        variantes: [
          v('There isn’t ___ bread left.', 'any', { some: 'some-any', many: 'much-many' }),
          v('How ___ candles are there on the table?', 'many', { much: 'much-many', any: 'much-many' }),
          v('There are ___ apples in the basket.', 'some', { any: 'some-any', much: 'much-many' }),
          v('How ___ milk is there in the jug?', 'much', { many: 'much-many', any: 'much-many' }),
        ],
      },
      { fabriquer: lesTours },
      {
        recit: 'At the top of the tower, you find a letter from the old lord of the castle: “Do not be afraid. The noise is not a ghost: it is my old clock. Go down to the lake and look behind the big grey stone.”',
        variantes: [
          v('What makes the strange noise?', 'an old clock', { 'a ghost': 'relire-negation', 'the cook': 'relire-texte' }),
          v('Where must you go now?', 'to the lake', { 'to the kitchen': 'relire-texte', 'to the library': 'relire-texte' }),
          v('Where must you look?', 'behind the big grey stone', { 'under the old clock': 'relire-texte', 'in the great hall': 'relire-texte' }),
        ],
      },
    ],
  },

  QUATRIEME: {
    prefixe: '4e',
    code: ['H', 'U', 'D', 'S', 'O', 'N'],
    etapes: [
      {
        recit: 'You are in a small art museum in Manhattan, New York City. Detective Carter shows you an empty frame on the wall: the museum’s most famous painting is gone!',
        variantes: [
          v('The thief ___ the painting last night.', 'stole', { 'has stolen': 'preterit-date', 'has stole': 'participe-passe' }),
          v('The guard ___ a strange noise at midnight yesterday.', 'heard', { 'has heard': 'preterit-date', 'has hear': 'participe-passe' }),
          v('Two days ago, a visitor ___ photos of the painting.', 'took', { 'has taken': 'preterit-date', 'has took': 'participe-passe' }),
        ],
      },
      {
        recit: 'You question Mr. Brown, the night guard. He looks tired and nervous.',
        variantes: [
          v('Mr. Brown: “I have worked here ___ ten years.”', 'for', { since: 'since-for', during: 'during-duree' }),
          v('Mr. Brown: “I have lived in Brooklyn ___ 2015.”', 'since', { for: 'since-for', ago: 'ago-preterit' }),
          v('Mr. Brown: “I ___ here since midnight, and I am so tired!”', 'have been', { am: 'present-depuis', was: 'present-depuis' }),
          v('Mr. Brown: “I haven’t slept ___ two days.”', 'for', { since: 'since-for', during: 'during-duree' }),
        ],
      },
      {
        recit: 'On the security video, you can see a woman in a red cap, a tall man and a big black bag near the window.',
        variantes: [
          v('The woman ___ is wearing a red cap works at the museum.', 'who', { which: 'who-which', what: 'what-relatif' }),
          v('The bag ___ is near the window looks very heavy.', 'which', { who: 'who-which', what: 'what-relatif' }),
          v('The man ___ is standing near the door is the director.', 'who', { which: 'who-which', what: 'what-relatif' }),
          v('The window ___ is behind the bag is open.', 'which', { who: 'who-which', what: 'what-relatif' }),
        ],
      },
      {
        recit: 'Outside, there are footprints in the snow. They go toward the subway station on the corner.',
        variantes: [
          v('The footprints are very small. The thief ___ be a child, but we are not sure.', 'might', {
            must: 'modal-certitude', should: 'modal-conseil',
          }),
          v('It’s freezing! You ___ wear a warmer coat, Detective.', 'should', {
            'should to': 'modal-sans-to', might: 'conseil-should',
          }),
          v('When he was young, Mr. Brown ___ run very fast.', 'could', { can: 'could-passe', 'could to': 'modal-sans-to' }),
        ],
      },
      {
        recit: 'In the subway station, someone has left a newspaper on a bench. There is an article about the museum.',
        variantes: [
          v('The painting ___ by a famous American artist in 1890.', 'was painted', { painted: 'passif-be', 'was paint': 'passif-participe' }),
          v('The painting ___ last night.', 'was stolen', { stole: 'passif-be', 'was stole': 'passif-participe' }),
          v('A man in a gray coat ___ near the Hudson River early this morning.', 'was seen', { saw: 'passif-be', 'was saw': 'passif-participe' }),
          v('The museum ___ in 1950.', 'was built', { built: 'passif-be', 'was build': 'passif-participe' }),
        ],
      },
      {
        recit: 'A text message arrives on Detective Carter’s phone: “The painting is safe. The window was broken and it was raining, so I took the painting to a dry place. I wanted to call you; however, my phone was dead. Come to Pier 25, on the Hudson River. Mr. Brown”',
        variantes: [
          v('Why did Mr. Brown take the painting?', 'to protect it from the rain', {
            'to sell it': 'relire-texte', 'to show it to the police': 'relire-texte',
          }),
          v('Where is the painting now?', 'at Pier 25', { 'in the museum': 'relire-texte', 'in the subway station': 'relire-texte' }),
          v('Mr. Brown wanted to call the detective. ___, his phone was dead.', 'However', {
            Therefore: 'however-therefore', Although: 'although-place',
          }),
          v('The window was broken and it was raining. ___, Mr. Brown moved the painting.', 'Therefore', {
            However: 'however-therefore', Although: 'although-place',
          }),
        ],
      },
    ],
  },

  TROISIEME: {
    prefixe: '3e',
    code: ['A', 'P', 'O', 'L', 'L', 'O'],
    etapes: [
      {
        recit: 'Mission Control, Houston. On the big screen, the spaceship Aurora is a tiny light near the Moon, with Commander Maya Chen and engineer Tom Reed on board.',
        variantes: [
          v('Commander Chen ___ in space for forty days now.', 'has been', { is: 'temps-depuis', was: 'temps-depuis' }),
          v('She ___ her astronaut training ten years ago.', 'finished', { 'has finished': 'temps-date', finishes: 'temps-date' }),
          v('Look at the screen: right now, the Aurora ___ around the Moon.', 'is flying', {
            flies: 'temps-maintenant', 'has flown': 'temps-maintenant',
          }),
          v('The astronauts ___ three spacewalks since Monday.', 'have done', { did: 'temps-depuis', do: 'temps-depuis' }),
        ],
      },
      {
        recit: 'Suddenly, an alarm goes off: a small rock has hit the spaceship! Commander Chen speaks to Mission Control on the radio.',
        variantes: [
          v('Maya: “We need ___ the solar panel.”', 'to repair', { repairing: 'verbe-infinitif', repair: 'verbe-infinitif' }),
          v('Maya: “I usually enjoy ___ in space, but not today!”', 'working', { 'to work': 'verbe-ing', work: 'verbe-ing' }),
          v('Maya: “We have decided ___ the engine off.”', 'to turn', { turning: 'verbe-infinitif', turn: 'verbe-infinitif' }),
          v('Maya: “Tom, please avoid ___ the red button!”', 'pressing', { 'to press': 'verbe-ing', press: 'verbe-ing' }),
        ],
      },
      {
        recit: 'You are in charge of the radio. The flight director wants a short report of what the crew said.',
        variantes: [
          v('Maya: “I am cold.” Report her words.', 'She said that she was cold.', {
            'She said that I was cold.': 'discours-pronom', 'She told that she was cold.': 'say-tell',
          }),
          v('Maya: “Can you hear me?” Report her question.', 'She asked if we could hear her.', {
            'She asked can we hear her.': 'question-rapportee', 'She asked if we could hear me.': 'discours-pronom',
          }),
          v('Tom: “I will fix it.” Report his words.', 'He said that he would fix it.', {
            'He said that I would fix it.': 'discours-pronom', 'He told that he would fix it.': 'say-tell',
          }),
          v('Maya, to the team: “Don’t worry!” Report her words.', 'She told them not to worry.', {
            'She told them don’t worry.': 'ordre-rapporte', 'She said them not to worry.': 'say-tell',
          }),
        ],
      },
      {
        recit: 'The engine is damaged. The flight director has two plans, and Mission Control must choose fast.',
        variantes: [
          v('If the engine works, the Aurora ___ home on Friday.', 'will come', { 'would come': 'si-present', came: 'si-present' }),
          v('If we had more fuel, we ___ land on the Moon.', 'could', { can: 'si-preterit', will: 'si-preterit' }),
          v('If I ___ you, I would stay calm.', 'were', { 'would be': 'apres-if', am: 'hypothese-were' }),
          v('If the panel ___ again, the lights will go off.', 'breaks', { 'will break': 'apres-if', 'would break': 'apres-if' }),
        ],
      },
      {
        recit: 'The repair works! On Earth, the newspapers are writing about the mission.',
        variantes: [
          v('The solar panel ___ by Commander Chen this morning.', 'was repaired', { repaired: 'passif-be', 'was repair': 'passif-participe' }),
          v('The astronauts ___ by millions of people since Monday.', 'have been watched', {
            'have watched': 'passif-be', 'were watched': 'passif-temps',
          }),
          v('A new spaceship ___ next year.', 'will be built', { 'will build': 'passif-be', 'will be build': 'passif-participe' }),
          v('Right now, new photos ___ to Earth.', 'are being sent', { 'are sending': 'passif-be', 'are being send': 'passif-participe' }),
        ],
      },
      {
        recit: 'The last message from the Aurora arrives: “The panel is repaired, but we only have enough oxygen for three days. Therefore, we will leave the Moon tonight instead of on Friday. Thank you, Houston: without you, we would still be lost.”',
        variantes: [
          v('When will the Aurora leave the Moon?', 'tonight', { 'on Friday': 'relire-instead', 'in three days': 'relire-texte' }),
          v('Why is the crew leaving early?', 'They don’t have much oxygen.', {
            'The panel is still broken.': 'relire-texte', 'Houston told them to wait.': 'relire-texte',
          }),
          v('What is the tone of the message?', 'grateful', { angry: 'relire-ton', bored: 'relire-ton' }),
        ],
      },
    ],
  },
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES.SIXIEME;
  return banque.etapes.map((etape, i) => {
    const tiree = etape.fabriquer ? etape.fabriquer(o) : o.au(etape.variantes);
    return {
      consigne: `${banque.prefixe}-etape-${i + 1}`,
      recit: tiree.recit ?? etape.recit,
      question: tiree.question,
      choix: o.melanger([tiree.bonne, ...Object.keys(tiree.pieges)]).map((c) => ({ cle: c, libelle: c })),
      bonne: tiree.bonne,
      pieges: { ...tiree.pieges },
      cadenas: { avant: banque.code.slice(0, i), piece: banque.code[i], total: MANCHES },
    };
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // ------------------------------------------------ les consignes, étape par étape
  '6e-etape-1': 'Premier cadenas : ta guide se présente. Choisis le mot qui complète sa phrase.',
  '6e-etape-2': 'Deuxième cadenas : la photo de famille. Trouve la bonne façon de dire à qui c’est.',
  '6e-etape-3': 'Troisième cadenas : le garde du palais te regarde. Choisis la phrase correcte.',
  '6e-etape-4': 'Quatrième cadenas : un indice au musée. Choisis la bonne forme du verbe.',
  '6e-etape-5': 'Cinquième cadenas : la boutique du musée. Choisis la phrase correcte.',
  '6e-etape-6': 'Dernier cadenas : lis l’énigme et trouve le monument de Londres.',

  '5e-etape-1': 'Premier cadenas : la porte du château t’interroge sur le Royaume-Uni.',
  '5e-etape-2': 'Deuxième cadenas : la grande salle. Trouve la bonne préposition.',
  '5e-etape-3': 'Troisième cadenas : les lumières s’éteignent. Que faisait chacun à ce moment-là ?',
  '5e-etape-4': 'Quatrième cadenas : la cuisine du château. Choisis le bon mot de quantité.',
  '5e-etape-5': 'Cinquième cadenas : la carte des tours. Compare leurs hauteurs.',
  '5e-etape-6': 'Dernier cadenas : la lettre du vieux seigneur. Lis-la bien avant de répondre.',

  '4e-etape-1': 'Premier cadenas : que s’est-il passé cette nuit ? Choisis le bon temps.',
  '4e-etape-2': 'Deuxième cadenas : le gardien de nuit répond à tes questions. Complète sa phrase.',
  '4e-etape-3': 'Troisième cadenas : la vidéo de surveillance. Choisis le mot qui relie la phrase.',
  '4e-etape-4': 'Quatrième cadenas : des traces de pas dans la neige. Choisis le bon modal.',
  '4e-etape-5': 'Cinquième cadenas : un journal oublié dans le métro. Complète la phrase de l’article.',
  '4e-etape-6': 'Dernier cadenas : un message arrive sur le téléphone du détective. Lis-le bien avant de répondre.',

  '3e-etape-1': 'Premier cadenas : le centre de contrôle te présente la mission. Choisis le temps juste.',
  '3e-etape-2': 'Deuxième cadenas : une alarme retentit. Infinitif ou forme en ing ?',
  '3e-etape-3': 'Troisième cadenas : rapporte au centre de contrôle ce qu’a dit l’équipage.',
  '3e-etape-4': 'Quatrième cadenas : deux plans pour ramener l’équipage. Complète la phrase avec if.',
  '3e-etape-5': 'Cinquième cadenas : la Terre raconte la mission. Choisis la bonne forme du passif.',
  '3e-etape-6': 'Dernier cadenas : le dernier message de l’Aurora. Lis-le bien avant de répondre.',

  // ------------------------------------------------ 6e
  'age-avec-have': 'En anglais, l’âge se dit avec be, jamais avec have : I am twelve.',
  'be-sujet': 'Le verbe be change avec le sujet : I am ; he, she et it is ; we, you et they are.',
  genitif: 'Pour dire à qui est quelque chose, on écrit le nom du possesseur, une apostrophe et un s, puis l’objet.',
  'possessif-possesseur': 'En anglais, le possessif s’accorde avec celui qui possède, pas avec l’objet : une fille et son père, c’est her father.',
  'their-there': 'There veut dire là ; pour dire leur, on écrit their.',
  'modal-sans-do': 'Can n’a jamais besoin de do : pour la question, on le place devant le sujet ; pour la négation, on écrit can’t.',
  'modal-sans-to': 'Après un modal comme can, should ou could, le verbe suit directement, sans to.',
  'modal-sans-s': 'Can ne prend jamais de s, même avec he, she ou it.',
  'present-s': 'Avec he, she ou it, le verbe prend un s au présent simple.',
  'present-habitude': 'Pour une habitude, avec every day ou every week, on emploie le présent simple, pas la forme en ing.',
  'present-maintenant': 'Pour une action en train de se passer, après look ou listen, on emploie be suivi du verbe en ing.',
  'ing-sans-be': 'La forme en ing ne marche jamais seule : il lui faut be devant, comme dans she is reading.',
  'auxiliaire-do-does': 'Au présent simple, on emploie does avec he, she et it, et do avec I, you, we et they.',
  'auxiliaire-base': 'Quand does est là, c’est lui qui porte le s : le verbe reste à la base verbale.',
  'question-sans-auxiliaire': 'Au présent simple, une question a besoin de do ou de does devant le sujet.',
  'lire-indices': 'Relis chaque indice de l’énigme : la bonne réponse les vérifie tous, pas seulement un.',

  // ------------------------------------------------ 5e
  'capitale-ecosse': 'La capitale de l’Écosse est Édimbourg ; Glasgow est sa plus grande ville, et Cardiff est la capitale du pays de Galles.',
  'drapeau-ecosse': 'Le drapeau écossais, c’est la croix de saint André : une croix blanche en diagonale sur fond bleu.',
  'nations-royaume': 'Le Royaume-Uni réunit quatre nations : l’Angleterre, l’Écosse, le pays de Galles et l’Irlande du Nord. La république d’Irlande n’en fait pas partie.',
  'on-surface': 'Pour ce qui est posé ou accroché sur une surface, on emploie on : on the wall, on the table.',
  'lire-position': 'Lis la fin de la phrase : elle dit où chercher. Under, c’est sous ; on, c’est sur ; above, c’est au-dessus.',
  'prepositions-temps': 'Pour le temps : in devant un mois, une saison ou une année ; on devant un jour ; at devant une heure.',
  'was-were': 'Au prétérit, be fait was avec I, he, she et it, et were avec you, we et they.',
  'ing-oublie': 'Pour une action en cours dans le passé, on écrit was ou were, suivi du verbe en ing.',
  'preterit-be': 'L’histoire se passe dans le passé : be se met au prétérit, was ou were.',
  'some-any': 'Some s’emploie dans une phrase affirmative ; dans une phrase négative ou une question, on emploie any.',
  'much-many': 'Many va avec ce qu’on peut compter, comme candles ; much avec ce qui ne se compte pas, comme milk ou bread.',
  'comparatif-court': 'Avec un adjectif court comme tall ou short, on ajoute er puis than : taller than. More est pour les adjectifs longs.',
  'superlatif-court': 'Avec un adjectif court, le superlatif se forme avec the et la terminaison est : the tallest. Most est pour les adjectifs longs.',
  'lire-nombres': 'Compare d’abord les hauteurs données sur la carte : la phrase doit dire ce que montrent les nombres.',
  'relire-negation': 'Attention à not : la lettre dit justement que ce n’est pas un fantôme. Relis la phrase en entier.',
  'relire-texte': 'La réponse est écrite dans le texte : retrouve la phrase qui en parle et relis-la mot à mot.',

  // ------------------------------------------------ 4e
  'preterit-date': 'Avec un moment passé précis, comme last night, yesterday ou ago, on emploie le prétérit, pas le present perfect.',
  'participe-passe': 'Le present perfect se forme avec have ou has, suivi du participe passé : stolen, heard, taken.',
  'since-for': 'For se place devant une durée, comme ten years ; since devant un point de départ, comme midnight ou une année.',
  'during-duree': 'Pour dire combien de temps, c’est for : during dit pendant quoi, comme during the night.',
  'ago-preterit': 'Ago se place après une durée et va avec le prétérit ; avec le present perfect, le point de départ s’introduit par since.',
  'present-depuis': 'Le français dit je suis là depuis, mais l’anglais emploie le present perfect : I have been here since.',
  'who-which': 'Who renvoie à une personne, which à une chose ou à un animal.',
  'what-relatif': 'What ne reprend pas un nom : après un nom de personne, on met who ; après un nom de chose, which.',
  'modal-certitude': 'Must exprime presque une certitude ; quand on n’est pas sûr, on emploie might.',
  'modal-conseil': 'Should sert à donner un conseil, pas à faire une hypothèse.',
  'conseil-should': 'Pour donner un conseil, on emploie should ; might exprime seulement une possibilité.',
  'could-passe': 'Pour une capacité dans le passé, can devient could.',
  'passif-be': 'Ici, le sujet subit l’action : au passif, on emploie be au bon temps, suivi du participe passé.',
  'passif-participe': 'Au passif, après be, le verbe se met au participe passé : painted, stolen, built.',
  'however-therefore': 'However marque une opposition, therefore une conséquence : cherche d’abord le lien entre les deux phrases.',
  'although-place': 'Although ne se suit pas d’une virgule : il introduit toute une proposition, comme although it was late.',

  // ------------------------------------------------ 3e
  'temps-depuis': 'Une action commencée dans le passé et qui dure encore, avec since ou for, se dit au present perfect.',
  'temps-date': 'Avec ago ou une date passée, on emploie le prétérit, jamais le present perfect.',
  'temps-maintenant': 'Pour une action en train de se dérouler, avec right now, on emploie be suivi du verbe en ing.',
  'verbe-infinitif': 'Après need, want, decide ou hope, le verbe qui suit se met à l’infinitif avec to.',
  'verbe-ing': 'Après enjoy, avoid, finish ou mind, le verbe qui suit prend la forme en ing.',
  'discours-pronom': 'Au discours rapporté, les pronoms changent selon qui parle : I devient he ou she, et me devient him ou her.',
  'say-tell': 'Tell est toujours suivi de la personne à qui l’on parle, comme tell them ; sans elle, on emploie say.',
  'question-rapportee': 'Une question rapportée perd l’ordre de la question : if, puis le sujet, puis le verbe.',
  'ordre-rapporte': 'Un ordre rapporté se construit avec tell, la personne, puis to ou not to et le verbe.',
  'si-present': 'Après if suivi du présent, l’autre partie de la phrase prend will.',
  'si-preterit': 'Après if suivi du prétérit, c’est une hypothèse : l’autre partie de la phrase prend would ou could.',
  'hypothese-were': 'Pour une hypothèse avec would, if est suivi du prétérit, et be devient were : if I were you.',
  'apres-if': 'Juste après if, jamais de will ni de would : ils vont dans l’autre partie de la phrase.',
  'passif-temps': 'Avec since, be se met au present perfect : have been, suivi du participe passé.',
  'relire-instead': 'Instead of annonce ce qui est remplacé : ce qui suit n’aura pas lieu.',
  'relire-ton': 'Le ton se lit dans les mots choisis : cherche ceux qui montrent un sentiment, comme thank you.',
};
