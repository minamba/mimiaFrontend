/**
 * L'ESCAPE GAME D'ANGLAIS DU LYCÉE — Marine, de la 2de à la terminale, dans
 * les trois voies.
 *
 * L'IMMERSION FAIT L'INTÉRÊT, comme au collège : le récit, la question et les
 * choix (affichés) sont EN ANGLAIS — du niveau B1 en 2de au niveau B2 en
 * terminale générale, de l'A2 au B1 dans la voie professionnelle. Ce qui se
 * DIT (PHRASES, enregistré une fois) reste en français : la consigne de
 * l'étape, l'aide et, pour chaque erreur, la règle qui permet de faire juste.
 * Les seuls mots anglais de PHRASES sont fixes et nécessaires à la règle.
 *
 * UNE HISTOIRE PAR CLASSE, CELLE QUE RACONTE SON ILLUSTRATION (08/10/2026 :
 * le client a fait illustrer chaque escape game ; le titre est celui peint
 * sur la couverture, en anglais) :
 *   - 2de, « The Missing Harbour Key » : la clé des portes d'écluse d'un petit
 *     port de pêche anglais a disparu à marée basse. Code ANCHOR.
 *   - 2de pro, « The Workshop Mystery » : dans un atelier de vélos, un soir de
 *     pluie, la chaîne d'un client est sous cadenas. Code PEDALS.
 *   - 1re, « The Midnight Broadcast » : une radio sur une falaise du Maine,
 *     privée de courant par la tempête avant l'émission de minuit. Code SIGNAL.
 *   - 1re techno, « The Greenhouse Alarm » : l'alarme d'une serre
 *     expérimentale, la moitié des plants de tomates fanés. Code TOMATO.
 *   - 1re pro, « The Delivery Detour » : une entreprise de livraison à vélo,
 *     un pont fermé, un portail resté ouvert. Code PARCEL.
 *   - Terminale, « The Silent Research Station » : une station de recherche
 *     arctique qui n'envoie plus rien. Code AURORA.
 *   - Terminale techno, « The Smart City Blackout » : un quartier connecté de
 *     Londres plongé dans le noir. Code REBOOT.
 *   - Terminale pro, « The Last Train Clue » : un signal bloqué au rouge, le
 *     dernier train à faire partir. Code TRACKS.
 *
 * Les classes technologiques et professionnelles n'ont pas de compétences
 * d'anglais à elles dans le référentiel : elles prennent celles de la même
 * année en voie générale (le repli que fait l'API).
 *
 * Chaque étape tire une de ses variantes (écrites à la main, une seule bonne
 * réponse défendable, dans l'usage britannique comme américain) et mélange
 * ses choix ; les étapes gardent l'ordre de l'histoire. Chaque choix faux a
 * son piège nommé. Faits de civilisation : seulement des faits stables
 * (capitales, langues officielles, institutions, dates d'histoire).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const ESCAPE = true;

export const FAMILLE = { cle: 'escape-anglais-lycee', titre: 'Escape game en anglais', matiereCode: 'ANGLAIS' };

export const MANCHES = 6;

/** Une variante : la question affichée, la bonne réponse, et chaque choix faux avec son piège. */
const v = (question, bonne, pieges) => ({ question, bonne, pieges });

/** Les banques, classe par classe : six étapes dans l'ordre du récit, et le code qu'elles forment. */
const BANQUES = {
  // ———————————————————————————————— 2de : The Missing Harbour Key
  SECONDE: {
    prefixe: '2de',
    code: ['A', 'N', 'C', 'H', 'O', 'R'],
    etapes: [
      {
        competence: 'AN_2DE_GRAM_TEMPS',
        recit: 'It is low tide in Gullhaven, a small fishing harbour on the south coast of England. Mr Penrose, the old harbour master, is very upset: the brass key of the lock gates has disappeared during the night.',
        variantes: [
          v('Last night, Mr Penrose ___ the key in his coat pocket.', 'carried', {
            'has carried': 'preterit-date', carryed: 'orthographe-ied',
          }),
          v('When he woke up this morning, he realised that someone ___ the key.', 'had taken', {
            'has taken': 'present-perfect-recit', 'was taking': 'past-perfect-anteriorite',
          }),
          v('When Mr Penrose was young, the fishermen ___ their nets by hand.', 'used to repair', {
            'use to repair': 'used-to-forme', 'used to repairing': 'used-to-base',
          }),
          v('By the time Mr Penrose reached the quay, all the fishermen ___.', 'had arrived', {
            'have arrived': 'present-perfect-recit', 'were arrived': 'arrive-avec-have',
          }),
        ],
      },
      {
        competence: 'AN_2DE_GRAM_MODAUX',
        recit: 'Next to the lobster pots, you find muddy footprints going down the stone steps towards the empty harbour.',
        variantes: [
          v('The gates are locked and the key is missing. The boats ___ leave the harbour now!', 'can’t', {
            'mustn’t': 'cant-mustnt', must: 'must-contraire',
          }),
          v('The footprints are fresh and go straight to the gates. Someone ___ walked here this morning.', 'must have', {
            'can’t have': 'modal-indices', 'should have': 'should-have-regret',
          }),
          v('Nobody saw who took the key. It ___ been a tourist, or maybe a fisherman.', 'might have', {
            'must have': 'might-doute', 'can’t have': 'might-doute',
          }),
          v('Something is shining on top of the old crane. There ___ be something metal up there.', 'must', {
            'can’t': 'modal-indices', 'mustn’t': 'mustnt-certitude',
          }),
        ],
      },
      {
        competence: 'AN_2DE_GRAM_PRONOMS',
        recit: 'In the blue boathouse, you meet Mrs Tregarth, an old fisherwoman who has known the harbour all her life.',
        variantes: [
          v('Mrs Tregarth, ___ son works on a fishing boat, saw a stranger last night.', 'whose', {
            'who’s': 'whose-whos', which: 'whose-possession',
          }),
          v('This is the boathouse ___ the fishermen keep their nets.', 'where', {
            which: 'where-lieu', what: 'what-relatif',
          }),
          v('The crane ___ stands on the quay is more than a hundred years old.', 'which', {
            who: 'who-personne', what: 'what-relatif',
          }),
          v('The fishermen repair their boats ___, without any help.', 'themselves', {
            theirselves: 'reflechi-forme', them: 'reflechi-insistance',
          }),
        ],
      },
      {
        competence: 'AN_2DE_CULT_COMMONWEALTH',
        recit: 'In the harbour master’s office, the walls are covered with postcards from sailors who have stopped in Gullhaven: they come from Canada, Australia, India and many other Commonwealth countries.',
        variantes: [
          v('What is the capital of Canada?', 'Ottawa', { Toronto: 'capitale-canada', Montreal: 'capitale-canada' }),
          v('Which two languages are official in Canada at the federal level?', 'English and French', {
            'English and Spanish': 'langues-canada', 'English and Inuktitut': 'langues-canada',
          }),
          v('Most members of the Commonwealth were once…', 'part of the British Empire', {
            'part of the United States': 'commonwealth-empire', 'members of the European Union': 'commonwealth-empire',
          }),
          v('What is the capital of Australia?', 'Canberra', { Sydney: 'capitale-australie', Melbourne: 'capitale-australie' }),
        ],
      },
      {
        competence: 'AN_2DE_LEX_IDIOMES',
        recit: 'Outside the fish market, there is a noticeboard where the fishermen leave funny messages for each other.',
        variantes: [
          v('A message says: “Fixing this old engine is a piece of cake!” What does it mean?', 'It is very easy.', {
            'It is delicious.': 'idiome-litteral', 'It is very short.': 'idiome-sens',
          }),
          v('Another message says: “I was over the moon when I caught my first lobster.” How did the writer feel?', 'extremely happy', {
            'very nervous': 'idiome-sens', 'far away from home': 'idiome-litteral',
          }),
          v('A third message says: “It’s raining cats and dogs: no fishing today!” What was the weather like?', 'It was raining very hard.', {
            'Animals were falling from the sky.': 'idiome-litteral', 'It was raining a little.': 'idiome-sens',
          }),
          v('A fourth message says: “Break a leg in the boat race tomorrow!” What does the writer want to do?', 'wish you good luck', {
            'hurt you': 'idiome-litteral', 'stop the race': 'idiome-sens',
          }),
        ],
      },
      {
        competence: 'AN_2DE_COMP_IMPLICITE',
        recit: 'At last, on an old bollard next to the lock gates, you find the key, with a note tied to it: “Dear Mr Penrose, I borrowed your key last night to take my little boat out under the full moon, as you used to let me do when I was a boy. I should have asked you first, I know. Forty years at sea, and I still can’t resist the moonlight on the water! Thank you for everything, old friend. Tom”',
        variantes: [
          v('Why did Tom borrow the key?', 'to take his boat out at night', {
            'to steal Mr Penrose’s boat': 'relire-texte', 'to repair the lock gates': 'relire-texte',
          }),
          v('What does the note suggest about Tom and Mr Penrose?', 'They have known each other for a long time.', {
            'They met for the first time last night.': 'relire-implicite', 'They are angry with each other.': 'relire-ton',
          }),
          v('“I should have asked you first, I know.” This suggests that Tom…', 'feels a little guilty', {
            'is proud of himself': 'relire-implicite', 'wants to keep the key': 'relire-implicite',
          }),
          v('What is the tone of the note?', 'warm and apologetic', {
            'angry and bitter': 'relire-ton', 'cold and formal': 'relire-ton',
          }),
        ],
      },
    ],
  },

  // ———————————————————————————————— 2de pro : The Workshop Mystery (A2-B1)
  SECONDE_PRO: {
    prefixe: '2pro',
    code: ['P', 'E', 'D', 'A', 'L', 'S'],
    etapes: [
      {
        competence: 'AN_2DE_LEX_PRECISION',
        recit: 'It is a rainy evening in the village. Your boss, Ada Okafor, has gone home. In the bike workshop, the workbench is covered with tools, and an old bike is waiting on its stand.',
        variantes: [
          v('You need to tighten a nut. Which tool do you use?', 'a spanner', { 'a saw': 'outil-usage', 'a pump': 'outil-usage' }),
          v('The tyre is flat. What do you need?', 'a pump', { 'a hammer': 'outil-usage', 'a screwdriver': 'outil-usage' }),
          v('On a bike, you sit on the…', 'saddle', { handlebars: 'piece-velo', chain: 'piece-velo' }),
          v('You push the ___ with your feet.', 'pedals', { brakes: 'piece-velo', saddle: 'piece-velo' }),
        ],
      },
      {
        competence: 'AN_2DE_GRAM_TEMPS',
        recit: 'In the workshop logbook, your boss writes down everything that happens. You read the last pages.',
        variantes: [
          v('Yesterday, Mrs Okafor ___ the workshop at six.', 'left', { 'has left': 'preterit-date', leaved: 'verbe-irregulier' }),
          v('Last Monday, a customer ___ his old bike to the workshop.', 'brought', {
            'has brought': 'preterit-date', bringed: 'verbe-irregulier',
          }),
          v('Last week, the apprentice ___ three bikes.', 'fixed', { 'has fixed': 'preterit-date', fixes: 'preterit-passe' }),
        ],
      },
      {
        competence: 'AN_2DE_GRAM_MODAUX',
        recit: 'On the wall, next to the lockers, there is a big safety poster with the workshop rules.',
        variantes: [
          v('You ___ wear gloves when you use the cleaning oil.', 'must', { 'mustn’t': 'mustnt-oblige', can: 'can-oblige' }),
          v('You ___ leave tools on the floor: someone could fall.', 'mustn’t', {
            'don’t have to': 'dont-have-to', must: 'must-interdit',
          }),
          v('Customers ___ pay for a safety check: it is free.', 'don’t have to', {
            'mustn’t': 'mustnt-pas-oblige', 'can’t': 'cant-pas-oblige',
          }),
        ],
      },
      {
        competence: 'AN_2DE_GRAM_GN',
        recit: 'Your boss has asked you to check the shelves before she orders new parts.',
        variantes: [
          v('There isn’t ___ oil left in the can.', 'much', { many: 'much-many', a: 'oil-a' }),
          v('We need ___ new tyres: there is only one left.', 'some', { any: 'some-any', a: 'a-pluriel' }),
          v('Mrs Okafor left you ___ useful advice on a sticky note.', 'some', { a: 'advice-a', many: 'much-many' }),
        ],
      },
      {
        competence: 'AN_2DE_COMP_ECRIT',
        recit: 'On the computer, there is an email from your boss: “Hi! Sorry, I had to leave early: my daughter is ill. Mr Hughes is coming at 8 tomorrow morning to collect his blue bike. It only needs a new chain, but please check the brakes too: he rides to work every day, even in the rain. The new chain is in the red locker. And the key? Look inside the box of the last tool I used today: the pump! Thanks, Ada”',
        variantes: [
          v('Why did Ada leave early?', 'Her daughter is ill.', {
            'She was tired.': 'relire-texte', 'She went to see Mr Hughes.': 'relire-texte',
          }),
          v('What does the blue bike need?', 'a new chain', { 'new brakes': 'verifier-pas-changer', 'a new saddle': 'relire-texte' }),
          v('Where is the new chain?', 'in the red locker', { 'in the blue locker': 'relire-texte', 'on the workbench': 'relire-texte' }),
          v('When will Mr Hughes collect his bike?', 'tomorrow morning', { tonight: 'relire-texte', 'next week': 'relire-texte' }),
        ],
      },
      {
        competence: 'AN_2DE_GRAM_PRONOMS',
        recit: 'You open the old box of the bike pump, and there it is: the key of the red locker!',
        variantes: [
          v('The key ___ opens the red locker was in the pump box.', 'which', { who: 'who-personne', what: 'what-relatif' }),
          v('Mr Hughes is the customer ___ rides to work every day.', 'who', { which: 'which-chose', where: 'where-pas-lieu' }),
          v('This is the workshop ___ you are learning your job.', 'where', { which: 'where-lieu', what: 'what-relatif' }),
          v('Ada, ___ daughter is ill, will be back on Monday.', 'whose', { 'who’s': 'whose-whos', which: 'whose-possession' }),
        ],
      },
    ],
  },

  // ———————————————————————————————— 1re : The Midnight Broadcast
  PREMIERE: {
    prefixe: '1re',
    code: ['S', 'I', 'G', 'N', 'A', 'L'],
    etapes: [
      {
        competence: 'AN_1RE_CULT_AMERIQUE',
        recit: 'You are spending the summer as an intern at Harbor Light Radio, a small station on a cliff on the coast of Maine. Tonight, the station manager, Ms Rivera, has asked you to host the midnight show.',
        variantes: [
          v('Maine is on the coast of which ocean?', 'the Atlantic Ocean', {
            'the Pacific Ocean': 'cote-maine', 'the Arctic Ocean': 'cote-maine',
          }),
          v('Which country borders Maine to the north?', 'Canada', { Mexico: 'voisin-maine', Greenland: 'voisin-maine' }),
          v('Maine is part of New England. Which state is also in New England?', 'Massachusetts', {
            Texas: 'nouvelle-angleterre', California: 'nouvelle-angleterre',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_HYPOTHESE',
        recit: 'At eleven o’clock, a flash of lightning strikes the antenna, and the power goes out. Ms Rivera calls you from home.',
        variantes: [
          v('If we had installed a lightning rod, the antenna ___ damaged.', 'wouldn’t have been', {
            'hadn’t been': 'irreel-passe-would', 'won’t be': 'hypothese-type',
          }),
          v('If you ___ the generator last week, it would have started.', 'had checked', {
            'would have checked': 'apres-if', 'have checked': 'hypothese-type',
          }),
          v('If I ___ an engineer, I would fix the transmitter myself.', 'were', { 'would be': 'apres-if', am: 'hypothese-type' }),
          v('If the power comes back, we ___ broadcast the midnight show.', 'will', {
            would: 'hypothese-type', 'would have': 'hypothese-type',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_ARTICULER',
        recit: 'With a flashlight, you find the old backup generator. While it warms up, you write the storm bulletin for the listeners.',
        variantes: [
          v('___ the station is small, thousands of people listen to it every night.', 'Although', {
            However: 'however-place', Despite: 'despite-nom',
          }),
          v('___ the storm, the lighthouse is still shining.', 'Despite', { Although: 'although-proposition', However: 'however-place' }),
          v('Stay at home tonight ___ stay safe.', 'in order to', { 'so that': 'so-that-sujet', for: 'for-nom' }),
          v('The roads are flooded. ___, the schools will be closed tomorrow.', 'As a result', {
            Whereas: 'whereas-contraste', 'Even though': 'even-though-seul',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_NUANCE',
        recit: 'The generator is running, but the transmitter is still silent. On the phone, the technician goes over the evening with you.',
        variantes: [
          v('The generator ran out of fuel. Someone ___ filled it up before the storm!', 'should have', {
            'must have': 'regret-should-have', should: 'modal-passe-have',
          }),
          v('The cable is burnt and smells of smoke. The lightning ___ hit it.', 'must have', {
            'can’t have': 'modal-indices', must: 'modal-passe-have',
          }),
          v('Luckily, you ___ call an engineer: the technician explained everything on the phone.', 'didn’t have to', {
            'mustn’t': 'mustnt-interdiction', 'couldn’t': 'couldnt-capacite',
          }),
          v('Ms Rivera isn’t sure where the spare fuse is. She ___ left it in the studio.', 'may have', {
            'must have': 'might-doute', may: 'modal-passe-have',
          }),
        ],
      },
      {
        competence: 'AN_1RE_CULT_INCLUSION',
        recit: 'In the station’s archive, you find an old tape labelled “August 28, 1963”. It is the recording of Martin Luther King’s famous speech, “I Have a Dream”, given in front of the Lincoln Memorial, in Washington, during the March on Washington for Jobs and Freedom. That day, a huge crowd gathered to demand equal rights for Black Americans, at a time when segregation was still legal in many states. The next year, the Civil Rights Act banned discrimination in public places.',
        variantes: [
          v('Where did Martin Luther King give his speech?', 'in front of the Lincoln Memorial', {
            'in front of the White House': 'relire-texte', 'in a radio studio': 'relire-texte',
          }),
          v('What did the marchers demand?', 'equal rights for Black Americans', {
            'a new radio station': 'relire-texte', 'the right to travel abroad': 'relire-texte',
          }),
          v('In the text, “segregation” means…', 'separating people because of their race', {
            'building roads across the country': 'sens-contexte', 'traveling for pleasure': 'sens-contexte',
          }),
          v('What changed the year after the speech?', 'A law banned discrimination in public places.', {
            'Segregation became legal.': 'relire-texte', 'Radio stations were closed.': 'relire-texte',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_PRONOMS',
        recit: 'At last, the red light comes on: you are on air! Ms Rivera and the technician listen to you from home as the storm moves away.',
        variantes: [
          v('When the show begins, Ms Rivera and the technician congratulate ___ on the phone.', 'each other', {
            themselves: 'each-other', theirselves: 'reflechi-forme',
          }),
          v('The old headphones are broken, so you take new ___ from the drawer.', 'ones', { one: 'ones-pluriel', them: 'ones-reprise' }),
          v('Ms Rivera says: “The technician and I taught ___ to use this old equipment.”', 'ourselves', {
            us: 'reflechi-nous', themselves: 'reflechi-personne',
          }),
          v('You say on air: “This show isn’t only Ms Rivera’s idea; it’s ___ too.”', 'mine', { my: 'pronom-possessif', me: 'pronom-possessif' }),
        ],
      },
    ],
  },

  // ———————————————————————————————— 1re techno : The Greenhouse Alarm
  PREMIERE_TECHNO: {
    prefixe: '1tec',
    code: ['T', 'O', 'M', 'A', 'T', 'O'],
    etapes: [
      {
        competence: 'AN_1RE_LEX_THEMATIQUE',
        recit: 'The orange alarm light is flashing. On the left, the vegetables are still green; on the right, in zone B, the tomato plants are dry and brown.',
        variantes: [
          v('The leaves are dry and hang down. The plants are…', 'wilting', { growing: 'lexique-contexte', blooming: 'lexique-contexte' }),
          v('Which device measures the temperature?', 'a thermometer', { 'a sprinkler': 'lexique-appareil', 'a fan': 'lexique-appareil' }),
          v('A long period without rain is…', 'a drought', { 'a flood': 'lexique-secheresse', 'a storm': 'lexique-secheresse' }),
          v('To give water to plants is to ___ them.', 'water', { feed: 'lexique-contexte', grow: 'lexique-contexte' }),
        ],
      },
      {
        competence: 'AN_1RE_COMP_ECRIT',
        recit: 'On the control screen, you read the system log: “18:02, soil sensor B: dry. 18:03, pump B: no response. 18:05, water tank: 85% full. 18:06, ALARM: irrigation failure in zone B. 18:10, fan 2: on.”',
        variantes: [
          v('Which zone has a problem?', 'zone B', { 'zone A': 'relire-texte', 'all the zones': 'relire-texte' }),
          v('Why is there no water in zone B?', 'The pump does not respond.', {
            'The tank is empty.': 'relire-texte', 'It is raining.': 'relire-texte',
          }),
          v('What happened first?', 'The sensor found dry soil.', {
            'The alarm went off.': 'relire-ordre', 'The fan started.': 'relire-ordre',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_NUANCE',
        recit: 'You go down to pump B. A small puddle covers the floor, and a pipe is lying next to the pump.',
        variantes: [
          v('There is water on the floor. The pipe ___ come off during the day.', 'must have', {
            'can’t have': 'modal-indices', must: 'modal-passe-have',
          }),
          v('The tank is still full. The plants ___ received much water today.', 'can’t have', {
            'must have': 'cant-have-impossible', 'should have': 'should-have-regret',
          }),
          v('Nobody knows who moved the pipe. It ___ been the cleaner.', 'might have', {
            'must have': 'might-doute', 'can’t have': 'might-doute',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_ARTICULER',
        recit: 'Back in the office, you write a short report for your supervisor, Mr Diaz.',
        variantes: [
          v('The plants in zone B are wilting ___ the pump stopped working.', 'because', { so: 'so-cause', although: 'although-cause' }),
          v('___ the alarm, nobody came to the greenhouse.', 'Despite', { Although: 'although-proposition', However: 'however-place' }),
          v('The pipe was disconnected. ___, zone B got no water.', 'As a result', {
            Whereas: 'whereas-contraste', 'Even though': 'even-though-seul',
          }),
          v('Zone A is fine, ___ zone B is very dry.', 'whereas', { because: 'because-contraste', so: 'so-contraste' }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_HYPOTHESE',
        recit: 'Mr Diaz answers by email: he wants to know how to avoid the same problem in the future.',
        variantes: [
          v('If the pipe had been fixed properly, the plants ___.', 'wouldn’t have wilted', {
            'hadn’t wilted': 'irreel-passe-would', 'won’t wilt': 'hypothese-type',
          }),
          v('If we ___ a second pump, zone B would get water even during a failure.', 'had', {
            'would have': 'apres-if', have: 'hypothese-type',
          }),
          v('If the soil gets too dry, the system ___ send a message to your phone.', 'will', {
            would: 'hypothese-type', 'would have': 'hypothese-type',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_PRONOMS',
        recit: 'The pipe is back in place and pump B is running again. As the sun goes down, the sprinklers water the tomato plants, and Mr Diaz comes to see the result.',
        variantes: [
          v('Some plants are dead. We will replace them with new ___.', 'ones', { one: 'ones-pluriel', them: 'ones-reprise' }),
          v('Mr Diaz and you congratulate ___ on the good work.', 'each other', { themselves: 'each-other', theirselves: 'reflechi-forme' }),
          v('Mr Diaz says: “The students built this greenhouse ___, ten years ago.”', 'themselves', {
            theirselves: 'reflechi-forme', them: 'reflechi-insistance',
          }),
          v('“Is this report yours?” – “Yes, it’s ___.”', 'mine', { my: 'pronom-possessif', me: 'pronom-possessif' }),
        ],
      },
    ],
  },

  // ———————————————————————————————— 1re pro : The Delivery Detour (A2-B1)
  PREMIERE_PRO: {
    prefixe: '1pro',
    code: ['P', 'A', 'R', 'C', 'E', 'L'],
    etapes: [
      {
        competence: 'AN_1RE_LEX_THEMATIQUE',
        recit: 'It is your first morning at Brickyard Couriers, a bike delivery company in an English town. The cargo bikes are waiting in the yard, in front of the old brick building.',
        variantes: [
          v('The big building where parcels are stored before delivery is the…', 'warehouse', {
            'post office': 'lexique-contexte', garage: 'lexique-contexte',
          }),
          v('The customer is not at home. You leave a card in the…', 'letterbox', { parcel: 'lexique-contexte', doorbell: 'lexique-contexte' }),
          v('The customer writes their name on your screen to confirm the delivery. It is their…', 'signature', {
            address: 'lexique-contexte', parcel: 'lexique-contexte',
          }),
        ],
      },
      {
        competence: 'AN_1RE_COMP_ECRIT',
        recit: 'Before you leave, you read the message from the office: “The bridge on Mill Road is closed for repairs today. Take Canal Street instead, then turn left at the church. Parcel 1 goes to the bakery on Station Road before 10 a.m. Parcel 2 is fragile: glass! Parcel 3: the customer works at night, so ring twice and wait.”',
        variantes: [
          v('Why can’t you take Mill Road today?', 'The bridge is closed.', {
            'There is too much traffic.': 'relire-texte', 'The road is flooded.': 'relire-texte',
          }),
          v('Which parcel must you carry carefully?', 'parcel 2', { 'parcel 1': 'relire-texte', 'parcel 3': 'relire-texte' }),
          v('Where do you turn left?', 'at the church', { 'at the bakery': 'relire-texte', 'at the bridge': 'relire-texte' }),
          v('Why must you ring twice at the third address?', 'The customer works at night.', {
            'The doorbell is broken.': 'relire-texte', 'The parcel is heavy.': 'relire-texte',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_ARTICULER',
        recit: 'On the way, your colleague calls you: why are you not on Mill Road? You explain your detour.',
        variantes: [
          v('Mill Road is closed, ___ I am taking Canal Street.', 'so', { because: 'because-consequence', but: 'but-consequence' }),
          v('I am late ___ the bridge is closed.', 'because', { so: 'so-cause', but: 'but-cause' }),
          v('The parcel is heavy, ___ the cargo bike can carry it.', 'but', { so: 'so-opposition', because: 'because-opposition' }),
          v('___, I go to the bakery. Then I deliver the fragile parcel.', 'First', { Finally: 'ordre-chrono', Then: 'ordre-chrono' }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_HYPOTHESE',
        recit: 'Before your next round, the manager asks you what you will do if something goes wrong.',
        variantes: [
          v('If the customer isn’t at home, I ___ leave a card.', 'will', { would: 'hypothese-type', 'would have': 'hypothese-type' }),
          v('If you ___ the fragile parcel, it will break.', 'drop', { 'will drop': 'apres-if-will', dropped: 'hypothese-will' }),
          v('If I had a van, I ___ deliver faster.', 'would', { will: 'hypothese-type', 'would have': 'hypothese-type' }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_NUANCE',
        recit: 'When you come back to the yard, the gate is open and the padlock is hanging loose. The manager is worried.',
        variantes: [
          v('The padlock isn’t broken. Someone ___ opened it with a key.', 'must have', {
            'can’t have': 'modal-indices', must: 'modal-passe-have',
          }),
          v('All the cargo bikes are still here. A thief ___ come in.', 'can’t have', {
            'must have': 'cant-have-impossible', 'should have': 'should-have-regret',
          }),
          v('Nobody knows who left the gate open. It ___ been the new driver.', 'might have', {
            'must have': 'might-doute', 'can’t have': 'might-doute',
          }),
        ],
      },
      {
        competence: 'AN_1RE_GRAM_PRONOMS',
        recit: 'Near the gate, in the grass, something shines in the sun: a small brass key. The new driver walks over, looking a little embarrassed.',
        variantes: [
          v('This key isn’t the manager’s. Is it ___?', 'yours', { your: 'pronom-possessif', you: 'pronom-possessif' }),
          v('The old padlock is rusty. Let’s buy a new ___.', 'one', { ones: 'one-singulier', it: 'one-reprise' }),
          v('The two drivers help ___ to close the heavy gate.', 'each other', { themselves: 'each-other', theirselves: 'reflechi-forme' }),
        ],
      },
    ],
  },

  // ———————————————————————————————— terminale : The Silent Research Station
  TERMINALE: {
    prefixe: 'tle',
    code: ['A', 'U', 'R', 'O', 'R', 'A'],
    etapes: [
      {
        competence: 'AN_TLE_CULT_ROYAUME_UNI',
        recit: 'You have joined a team of British scientists flying to Aurora Station, a remote research station in the Arctic, which has stopped sending data. The team comes from all over the UK: Dr Morgan, the leader, is Welsh, Fiona is Scottish, Ciaran is from Belfast and Tom is from London.',
        variantes: [
          v('Which nation of the UK shares a land border with the Republic of Ireland?', 'Northern Ireland', {
            Scotland: 'frontiere-irlande', Wales: 'frontiere-irlande',
          }),
          v('Which two houses make up the UK Parliament?', 'the House of Commons and the House of Lords', {
            'the Senate and the House of Representatives': 'parlement-uk', 'the House of Commons and the Senate': 'parlement-uk',
          }),
          v('In which city does the Scottish Parliament sit?', 'Edinburgh', { Glasgow: 'parlement-ecosse', London: 'parlement-ecosse' }),
          v('What is the capital of Wales?', 'Cardiff', { Swansea: 'capitale-galles', Edinburgh: 'capitale-galles' }),
        ],
      },
      {
        competence: 'AN_TLE_ECR_TRADUIRE',
        recit: 'On the plane, Dr Morgan asks you to translate the notes of Claire, a French glaciologist who worked at the station last winter.',
        variantes: [
          v('Translate: « Actuellement, la station n’envoie aucune donnée. »', 'Currently, the station is not sending any data.', {
            'Actually, the station is not sending any data.': 'actually', 'Currently, the station does not send any data.': 'temps-en-cours',
          }),
          v('Translate: « Il a assisté à la réunion de l’équipe hier. »', 'He attended the team meeting yesterday.', {
            'He assisted the team meeting yesterday.': 'assist-attend', 'He has attended the team meeting yesterday.': 'preterit-date',
          }),
          v('Translate: « La glace fondra éventuellement. »', 'The ice may melt.', {
            'The ice will eventually melt.': 'eventually', 'The ice may melts.': 'modal-base',
          }),
          v('Translate: « Notre cheffe d’équipe est très sympathique. »', 'Our team leader is very nice.', {
            'Our team leader is very sympathetic.': 'sympathetic', 'Our team leader is very sympathic.': 'sympathetic',
          }),
        ],
      },
      {
        competence: 'AN_TLE_LEX_REGISTRE',
        recit: 'Before landing, you must write to the university that runs the station to report the problem. Dr Morgan reminds you: “Formal, please!”',
        variantes: [
          v('Which sentence is the most formal?', 'I would be grateful if you could send us the latest data.', {
            'Could you get back to me with the data?': 'registre-formel', 'Send us the data asap!': 'registre-formel',
          }),
          v('Your email begins with “Dear Professor Hughes,”. How should it end, in British English?', 'Yours sincerely,', {
            'Yours faithfully,': 'sincerely-faithfully', 'Cheers,': 'registre-formel',
          }),
          v('In “The university will look into the problem”, what does “look into” mean?', 'investigate', {
            'take care of': 'phrasal-sens', admire: 'phrasal-sens',
          }),
        ],
      },
      {
        competence: 'AN_TLE_GRAM_STYLE',
        recit: 'In the snow, the door of the station is open. Inside, the computers are on, but nothing is being sent. You write the first lines of your report, in a powerful style.',
        variantes: [
          v('Never ___ such a strange failure.', 'have we seen', { 'we have seen': 'inversion-negatif', 'have we saw': 'participe-irregulier' }),
          v('Not only ___ the antenna under the snow, but it also cut the main cable.', 'did the storm bury', {
            'the storm buried': 'inversion-negatif', 'did the storm buried': 'auxiliaire-did-base',
          }),
          v('Hardly ___ the team arrived when the lights went out.', 'had', { did: 'hardly-had', has: 'hardly-had' }),
          v('___ worries Dr Morgan most is the missing data.', 'What', { That: 'what-ce-qui', Which: 'what-ce-qui' }),
        ],
      },
      {
        competence: 'AN_TLE_GRAM_GN',
        recit: 'Before you send your report, Dr Morgan checks every sentence. A few mistakes are hidden in your draft.',
        variantes: [
          v('Choose the correct sentence.', 'The team made a two-day journey.', {
            'The team made a two-days journey.': 'adjectif-invariable', 'The team made a journey two-day.': 'gn-ordre',
          }),
          v('Choose the correct sentence.', 'This information is important.', {
            'These informations are important.': 'indenombrable', 'An information is important.': 'indenombrable',
          }),
          v('Choose the correct sentence.', 'The equipment is very old.', {
            'The equipments are very old.': 'indenombrable', 'An equipment is very old.': 'indenombrable',
          }),
          v('Choose the correct sentence.', 'Dr Morgan gave us some useful advice.', {
            'Dr Morgan gave us some useful advices.': 'indenombrable', 'Dr Morgan gave us a useful advice.': 'indenombrable',
          }),
        ],
      },
      {
        competence: 'AN_TLE_COMP_ECRIT',
        recit: 'On the desk, you find the last page of the station logbook: “The storm has been raging for two days. The wind is so strong that we cannot go out to check the sensors. No doubt this station is precious; but a station is only a building, and the people inside matter more. We are leaving for the coast tonight. Before leaving, I unplugged the main cable myself, so that the storm could not damage the computers. Plug it back in, and Aurora Station will speak again. Ana”',
        variantes: [
          v('Why did the station stop sending data?', 'Ana unplugged the main cable on purpose.', {
            'The storm destroyed the computers.': 'relire-texte', 'The scientists forgot to switch it on.': 'relire-texte',
          }),
          v('Why did Ana unplug the cable?', 'to protect the computers', {
            'to stop the experiment': 'relire-texte', 'to save fuel': 'relire-pas-dit',
          }),
          v('According to Ana, what matters most?', 'the people', { 'the station': 'relire-concession', 'the sensors': 'relire-texte' }),
          v('What is the tone of the end of the page?', 'calm and reassuring', {
            'panicked and desperate': 'relire-ton', 'angry and bitter': 'relire-ton',
          }),
        ],
      },
    ],
  },

  // ———————————————————————————————— terminale techno : The Smart City Blackout
  TERMINALE_TECHNO: {
    prefixe: 'ttec',
    code: ['R', 'E', 'B', 'O', 'O', 'T'],
    etapes: [
      {
        competence: 'AN_TLE_CULT_ROYAUME_UNI',
        recit: 'You are doing an internship at a tech company that runs the smart traffic lights, trams and sensors of a district of London. At dusk, everything goes dark: no lights, no trams, no signals. From the empty tram stop, you can still see the dome of St Paul’s and the Shard against the purple sky.',
        variantes: [
          v('Which river flows through London?', 'the Thames', { 'the Seine': 'tamise', 'the Severn': 'tamise' }),
          v('The dome of St Paul’s rises above the City. What is St Paul’s?', 'a cathedral', {
            'a royal palace': 'saint-paul', 'a museum': 'saint-paul',
          }),
          v('Where does the UK Parliament sit?', 'in the Palace of Westminster', {
            'in Buckingham Palace': 'westminster', 'in the Tower of London': 'westminster',
          }),
          v('Which two houses make up the UK Parliament?', 'the House of Commons and the House of Lords', {
            'the Senate and the House of Representatives': 'parlement-uk', 'the House of Commons and the Senate': 'parlement-uk',
          }),
        ],
      },
      {
        competence: 'AN_TLE_CULT_COMMUNICATION',
        recit: 'On social media, posts about the blackout are spreading fast. Your manager asks you to sort them out.',
        variantes: [
          v('Three posts appear online. Which one is most likely fake news?', 'Aliens hacked the grid! Share now!', {
            'Council: engineers are on site.': 'source-fiable', 'Tram operator: service stopped.': 'source-fiable',
          }),
          v('What is the best way to check a piece of news?', 'compare several reliable sources', {
            'count the number of likes': 'verifier-source', 'trust the first post you see': 'verifier-source',
          }),
          v('A post says: “Share before it’s deleted!” Why is this a warning sign?', 'It rushes you so you don’t check.', {
            'It proves the post is true.': 'urgence-signe', 'It shows the author is an expert.': 'urgence-signe',
          }),
        ],
      },
      {
        competence: 'AN_TLE_LEX_REGISTRE',
        recit: 'The city council asks your company to send an official message to the people who live in the district.',
        variantes: [
          v('Which sentence suits an official message?', 'We apologise for any inconvenience.', {
            'Sorry about the mess, guys!': 'registre-formel', 'Whatever, it’ll be fixed soon.': 'registre-formel',
          }),
          v('“The lights will be back soon.” Which version is the most formal?', 'Power will be restored shortly.', {
            'Lights back in a sec!': 'registre-formel', 'No worries, lights soon!': 'registre-formel',
          }),
          v('Your email begins with “Dear Sir or Madam,”. How should it end, in British English?', 'Yours faithfully,', {
            'Yours sincerely,': 'faithfully-sincerely', 'See you,': 'registre-formel',
          }),
        ],
      },
      {
        competence: 'AN_TLE_GRAM_GN',
        recit: 'You write a short report on the blackout for your manager. Before sending it, you check every sentence.',
        variantes: [
          v('Choose the correct sentence.', 'The engineers replaced a ten-metre cable.', {
            'The engineers replaced a ten-metres cable.': 'adjectif-invariable', 'The engineers replaced a cable ten-metre.': 'gn-ordre',
          }),
          v('Choose the correct sentence.', 'This information comes from the council.', {
            'These informations come from the council.': 'indenombrable', 'An information comes from the council.': 'indenombrable',
          }),
          v('Choose the correct sentence.', 'The equipment is very modern.', {
            'The equipments are very modern.': 'indenombrable', 'An equipment is very modern.': 'indenombrable',
          }),
          v('Choose the correct sentence.', 'The police are directing the traffic.', {
            'The police is directing the traffic.': 'police-pluriel', 'The polices are directing the traffic.': 'police-pluriel',
          }),
        ],
      },
      {
        competence: 'AN_TLE_COMP_ECRIT',
        recit: 'A message arrives from the engineer on duty: “At 18:47, the main cable in junction box 12 overheated. We switched off the whole district ourselves to prevent a fire. Hospitals were not affected: they have their own generators. Power will come back step by step: first the traffic lights, then the trams, and finally the offices. The real problem is not the cable, but the software, which did not detect the heat in time.”',
        variantes: [
          v('Why did the engineers switch off the district?', 'to prevent a fire', {
            'to repair the trams': 'relire-texte', 'to save money': 'relire-pas-dit',
          }),
          v('What will come back first?', 'the traffic lights', { 'the trams': 'relire-ordre', 'the offices': 'relire-ordre' }),
          v('According to the engineer, what is the real problem?', 'the software', {
            'the cable': 'relire-concession', 'the hospitals': 'relire-texte',
          }),
          v('Were the hospitals affected?', 'No, they have their own generators.', {
            'Yes, they had no power.': 'relire-texte', 'Yes, but only for an hour.': 'relire-pas-dit',
          }),
        ],
      },
      {
        competence: 'AN_TLE_ECR_TRADUIRE',
        recit: 'At junction box 12, Léa, a French engineer, is working with you. You translate her instructions for the British team.',
        variantes: [
          v('Translate: « Actuellement, le logiciel redémarre. »', 'Currently, the software is restarting.', {
            'Actually, the software is restarting.': 'actually', 'Currently, the software restarts.': 'temps-en-cours',
          }),
          v('Translate: « Il faut contrôler les câbles. »', 'We need to check the cables.', {
            'We need to control the cables.': 'control-check', 'We need to checking the cables.': 'need-to-base',
          }),
          v('Translate: « Ce capteur est très sensible. »', 'This sensor is very sensitive.', {
            'This sensor is very sensible.': 'sensible-sensitive', 'This sensor is very sensitives.': 'adjectif-sans-s',
          }),
          v('Translate: « Le courant reviendra éventuellement ce soir. »', 'Power may come back tonight.', {
            'Power will eventually come back tonight.': 'eventually', 'Power may comes back tonight.': 'modal-base',
          }),
        ],
      },
    ],
  },

  // ———————————————————————————————— terminale pro : The Last Train Clue (A2-B1)
  TERMINALE_PRO: {
    prefixe: 'tpro',
    code: ['T', 'R', 'A', 'C', 'K', 'S'],
    etapes: [
      {
        competence: 'AN_TLE_GRAM_MAITRISE',
        recit: 'You are an apprentice in a railway maintenance team. This evening, the signal at the end of platform 3 is stuck on red, and the last train of the day cannot leave the station.',
        variantes: [
          v('Look! The red light ___ on and off.', 'is flashing', { flashes: 'present-be-ing', 'is flash': 'be-ing-forme' }),
          v('The last train usually ___ at 22:15.', 'leaves', { leave: 'troisieme-personne-s', 'is leaving': 'present-habitude' }),
          v('Yesterday, the signal ___ perfectly.', 'worked', { works: 'preterit-passe', 'has worked': 'preterit-date' }),
          v('___ the technician know about the problem?', 'Does', { Is: 'question-do', Do: 'does-singulier' }),
        ],
      },
      {
        competence: 'AN_TLE_COMP_ECRIT',
        recit: 'Taped to the open junction box, you find a note from Sam, the technician: “Hi! I had to leave for an emergency on another line. The signal is not broken: a wire came off in this box. First, switch off the power with the black switch! Then connect each wire to the same colour: red with red, blue with blue, and so on. Finally, close the box and call the control room. Sam”',
        variantes: [
          v('Is the signal broken?', 'No, a wire came off.', { 'Yes, it must be replaced.': 'relire-texte', 'No, the bulb is dead.': 'relire-texte' }),
          v('What must you do first?', 'switch off the power', { 'call the control room': 'relire-ordre', 'close the box': 'relire-ordre' }),
          v('Why did Sam leave?', 'for an emergency on another line', {
            'to have dinner': 'relire-texte', 'to buy a new signal': 'relire-texte',
          }),
          v('How do you connect the wires?', 'each wire to the same colour', {
            'all the wires together': 'relire-texte', 'red with blue': 'relire-texte',
          }),
        ],
      },
      {
        competence: 'AN_TLE_LEX_REGISTRE',
        recit: 'On the platform, the passengers are getting impatient. You must speak to them politely.',
        variantes: [
          v('Which sentence is the most polite?', 'Could you please stay behind the yellow line?', {
            'Stay behind the line, OK?': 'registre-poli', 'Hey, move back!': 'registre-poli',
          }),
          v('A passenger asks when the train will leave. What is the best answer?', 'I’m sorry, there is a short delay.', {
            'No idea, mate.': 'registre-poli', 'Not my problem.': 'registre-poli',
          }),
          v('Which announcement suits a station?', 'We apologise for the delay to this service.', {
            'Sorry guys, the train is late.': 'registre-poli', 'Train late. Deal with it.': 'registre-poli',
          }),
        ],
      },
      {
        competence: 'AN_TLE_GRAM_GN',
        recit: 'You open the toolbox to choose what you need.',
        variantes: [
          v('Choose the correct sentence.', 'I need two screwdrivers.', {
            'I need two screwdriver.': 'pluriel-s', 'I need a screwdrivers.': 'a-pluriel',
          }),
          v('Choose the correct sentence.', 'The equipment is in the box.', {
            'The equipments are in the box.': 'indenombrable', 'An equipment is in the box.': 'indenombrable',
          }),
          v('Choose the correct sentence.', 'The two men are checking the wires.', {
            'The two mans are checking the wires.': 'pluriel-irregulier', 'The two men is checking the wires.': 'accord-pluriel',
          }),
        ],
      },
      {
        competence: 'AN_TLE_ECR_TRADUIRE',
        recit: 'Your French colleague, Karim, joins you. He gives you the safety rules in French, and you translate them for the English-speaking driver.',
        variantes: [
          v('Translate: « Il faut couper le courant. »', 'You must switch off the power.', {
            'You must cut the current.': 'calque-mot-a-mot', 'You must to switch off the power.': 'modal-sans-to',
          }),
          v('Translate: « Ne touche pas les fils ! »', 'Don’t touch the wires!', {
            'Not touch the wires!': 'imperatif-negatif', 'Don’t touches the wires!': 'imperatif-base',
          }),
          v('Translate: « Le conducteur est en retard. »', 'The driver is late.', {
            'The driver has late.': 'etre-be', 'The driver is in late.': 'calque-mot-a-mot',
          }),
          v('Translate: « Actuellement, le train attend sur le quai. »', 'Currently, the train is waiting at the platform.', {
            'Actually, the train is waiting at the platform.': 'actually', 'Currently, the train waits at the platform.': 'temps-en-cours',
          }),
        ],
      },
      {
        competence: 'AN_TLE_GRAM_MAITRISE',
        recit: 'The power is off. You connect each wire to its colour, close the box and switch the power back on. In the sunset, the signal at the end of the platform slowly changes colour…',
        variantes: [
          v('The red wire is ___ than the blue one.', 'longer', { 'more long': 'comparatif-court', longest: 'comparatif-superlatif' }),
          v('The new signal is ___ than the old one.', 'more reliable', { reliabler: 'comparatif-long', 'more reliabler': 'comparatif-double' }),
          v('Sam is ___ technician in the team.', 'the best', { 'the goodest': 'superlatif-irregulier', 'the better': 'comparatif-superlatif' }),
          v('Today is ___ day of the summer.', 'the hottest', { 'the most hot': 'superlatif-court', 'the hotter': 'comparatif-superlatif' }),
        ],
      },
    ],
  },
};

const competencesDe = (classe) => [...new Set(BANQUES[classe].etapes.map((e) => e.competence))];

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'The Missing Harbour Key',
    accroche: 'Une clé perdue, un port à marée basse.',
    intro: 'Welcome to Gullhaven, a small fishing harbour on the south coast of England. The brass key that opens the old lock gates has gone missing: follow six clues around the harbour to find it.',
    fin: 'The code is ANCHOR: the old gates swing open, the tide flows in, and the fishing boats can go out to sea again.',
    competences: competencesDe('SECONDE'),
  },
  SECONDE_PRO: {
    titre: 'The Workshop Mystery',
    accroche: 'Un atelier de vélos, un casier fermé.',
    intro: 'You are an apprentice in a small bike workshop in an English village. It is raining, your boss has gone home, and the new chain for a customer’s bike is locked in one of the lockers: solve six challenges to find the key.',
    fin: 'The code is PEDALS: the red locker opens, you fit the new chain, and the blue bike is ready for Mr Hughes.',
    competences: competencesDe('SECONDE_PRO'),
  },
  PREMIERE: {
    titre: 'The Midnight Broadcast',
    accroche: 'Une radio dans la tempête, à minuit.',
    intro: 'You are an intern at Harbor Light Radio, a small station on a cliff on the coast of Maine, and tonight you host the midnight show. A storm has cut the power: solve six challenges to get the station back on air.',
    fin: 'The code is SIGNAL: Harbor Light Radio is back on air, and your voice crosses the storm.',
    competences: competencesDe('PREMIERE'),
  },
  PREMIERE_TECHNO: {
    titre: 'The Greenhouse Alarm',
    accroche: 'Une serre en alerte, des plants qui fanent.',
    intro: 'You are on a work placement in an experimental greenhouse, where sensors and computers water the plants automatically. This evening, the alarm has gone off and half of the tomato plants are wilting: find out what went wrong and restart the system.',
    fin: 'The code is TOMATO: the system restarts, the sprinklers water zone B, and the tomato plants will soon be green again.',
    competences: competencesDe('PREMIERE_TECHNO'),
  },
  PREMIERE_PRO: {
    titre: 'The Delivery Detour',
    accroche: 'Des colis à livrer, une route coupée.',
    intro: 'You are on a work placement at a bike delivery company in an English town. Today, a bridge is closed on your route and something strange is happening at the yard gate: solve six challenges to deliver every parcel safely.',
    fin: 'The code is PARCEL: the key is back on its hook, the gate is locked, and every parcel has been delivered.',
    competences: competencesDe('PREMIERE_PRO'),
  },
  TERMINALE: {
    titre: 'The Silent Research Station',
    accroche: 'Une station polaire devenue muette.',
    intro: 'You have joined a team of British scientists flying to Aurora Station, a remote research station in the Arctic, which has suddenly stopped sending data. Solve six challenges to find out why the station has gone silent and bring it back to life.',
    fin: 'The code is AURORA: you plug the cable back in, the screens light up, and Aurora Station speaks to the world again under the northern lights.',
    competences: competencesDe('TERMINALE'),
  },
  TERMINALE_TECHNO: {
    titre: 'The Smart City Blackout',
    accroche: 'Londres plongée dans le noir.',
    intro: 'You are doing an internship at a tech company that runs the smart traffic lights, trams and sensors of a district of London. At dusk, the whole district has gone dark: solve six challenges to bring it back to life.',
    fin: 'The code is REBOOT: the software restarts, the traffic lights turn green, and the district lights up again.',
    competences: competencesDe('TERMINALE_TECHNO'),
  },
  TERMINALE_PRO: {
    titre: 'The Last Train Clue',
    accroche: 'Un signal au rouge, un dernier train.',
    intro: 'You are an apprentice in a railway maintenance team. This evening, a signal is stuck on red and the last train of the day cannot leave: follow your technician’s clues to repair it.',
    fin: 'The code is TRACKS: the signal turns green, and the last train of the day leaves the station with all its passengers.',
    competences: competencesDe('TERMINALE_PRO'),
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

/** Les six étapes de la classe, dans l'ordre du récit : chacune tire une variante et mélange ses choix. */
export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { au, melanger } = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES[CLASSES[0]];

  return banque.etapes.map((etape, i) => {
    const tiree = au(etape.variantes);
    const consigne = `${banque.prefixe}-etape-${i + 1}`;
    return {
      consigne,
      recit: etape.recit,
      question: tiree.question,
      choix: melanger([tiree.bonne, ...Object.keys(tiree.pieges)]).map((c) => ({ cle: c, libelle: c })),
      bonne: tiree.bonne,
      pieges: { ...tiree.pieges },
      aide: `${consigne}-aide`,
      cadenas: { avant: banque.code.slice(0, i), piece: banque.code[i], total: MANCHES },
      competence: etape.competence,
    };
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // ------------------------------------------------ 2de : The Missing Harbour Key
  '2de-etape-1': 'Premier cadenas : la clé du port a disparu pendant la nuit. Choisis le temps du passé qui convient.',
  '2de-etape-1-regle': 'Repère d’abord les marqueurs de temps de la phrase : un moment passé précis, une action antérieure à une autre, ou une habitude révolue.',
  '2de-etape-1-aide': 'Retiens : le prétérit pour un fait daté, le past perfect pour ce qui s’est passé avant un autre fait passé, et used to pour une habitude qui n’existe plus.',
  '2de-etape-2': 'Deuxième cadenas : des traces de pas mènent vers le bassin. Choisis le modal qui dit le bon degré de certitude.',
  '2de-etape-2-regle': 'Lis les indices de la phrase : rendent-ils la chose presque sûre, seulement possible, ou impossible ? Choisis le modal qui exprime ce degré.',
  '2de-etape-2-aide': 'Retiens : must pour une quasi-certitude, might pour une simple possibilité, can’t pour une impossibilité ; pour le passé, on ajoute have et le participe passé.',
  '2de-etape-3': 'Troisième cadenas : une vieille pêcheuse connaît tout le port. Choisis le pronom qui relie ou qui reprend.',
  '2de-etape-3-regle': 'Regarde ce que le pronom reprend : une personne, une chose, un lieu, un possesseur, ou le sujet lui-même.',
  '2de-etape-3-aide': 'Retiens : who pour une personne, which pour une chose, where pour un lieu, whose pour la possession ; le réfléchi, comme themselves, renvoie au sujet.',
  '2de-etape-4': 'Quatrième cadenas : des cartes postales venues de tout le Commonwealth. Montre ce que tu sais de ces pays.',
  '2de-etape-4-regle': 'Rappelle-toi l’histoire de ces pays : d’anciennes colonies britanniques, devenues membres du Commonwealth, chacune avec sa capitale et ses langues.',
  '2de-etape-4-aide': 'Retiens : la capitale du Canada est Ottawa, ses deux langues officielles sont l’anglais et le français ; celle de l’Australie est Canberra ; et le Commonwealth réunit surtout d’anciens territoires de l’Empire britannique.',
  '2de-etape-5': 'Cinquième cadenas : les petits mots drôles des pêcheurs. Trouve le sens de l’expression.',
  '2de-etape-5-regle': 'Une expression idiomatique ne se traduit pas mot à mot : cherche le sens qu’elle prend dans la situation.',
  '2de-etape-5-aide': 'Retiens : a piece of cake, c’est très facile ; over the moon, fou de joie ; raining cats and dogs, il pleut des cordes ; break a leg, bonne chance.',
  '2de-etape-6': 'Dernier cadenas : un mot est attaché à la clé. Lis-le bien, et cherche aussi ce qu’il sous-entend.',
  '2de-etape-6-regle': 'La réponse est dans le mot, parfois sous-entendue : retrouve la phrase qui en parle et relis-la mot à mot.',
  '2de-etape-6-aide': 'Retiens : pour comprendre l’implicite, demande-toi ce que l’auteur suggère sans le dire, et quel ton trahissent ses mots.',

  'preterit-date': 'Avec un moment passé précis, comme une date ou yesterday, on emploie le prétérit : le present perfect ne se combine jamais avec un moment passé daté.',
  'orthographe-ied': 'Quand un verbe se termine par une consonne suivie de y, le y devient i devant ed : carry donne carried, bury donne buried.',
  'present-perfect-recit': 'Le récit est au passé : pour une action antérieure à un autre moment passé, on emploie le past perfect, had suivi du participe passé, et non le present perfect.',
  'past-perfect-anteriorite': 'L’action est terminée avant un autre moment passé : on emploie le past perfect, had suivi du participe passé, pas la forme en ing.',
  'used-to-forme': 'Pour une habitude passée, à la forme affirmative, on écrit used to, avec un d : use to ne s’emploie qu’après did ou didn’t.',
  'used-to-base': 'Pour une habitude passée, used to est suivi de la base verbale. Avec la forme en ing, be used to veut dire être habitué à.',
  'arrive-avec-have': 'En anglais, arrive se conjugue avec have, jamais avec be, même quand le français dit « ils étaient arrivés » : on écrit had arrived.',
  'cant-mustnt': 'Mustn’t exprime une interdiction, pas une impossibilité : pour dire qu’une chose est impossible, on emploie can’t.',
  'mustnt-certitude': 'Mustn’t exprime une interdiction, pas une déduction : ici, les indices rendent la chose presque sûre, et la quasi-certitude se dit avec must.',
  'must-contraire': 'Must dirait le contraire de ce que montrent les indices : ici, tout rend la chose impossible, et l’impossibilité se dit avec can’t.',
  'modal-indices': 'Relis les indices : tout montre que c’est presque sûr, pas impossible. La quasi-certitude se dit avec must, ou must have pour le passé.',
  'should-have-regret': 'Should have exprime un regret ou un reproche, ce qui aurait dû se passer. Ici, on tire une conclusion à partir d’indices : elle se dit avec must have, ou can’t have.',
  'might-doute': 'La phrase dit qu’on n’est pas sûr : pour une simple possibilité, on emploie might ou may, suivi de have pour le passé. Must have serait presque une certitude, et can’t have une impossibilité.',
  'whose-whos': 'Who’s est la contraction de who is. Pour dire dont le fils ou dont la fille, la possession se marque avec whose.',
  'whose-possession': 'Which renvoie à une chose, et il ne marque pas la possession. Pour dire dont le fils ou dont la fille, on emploie whose.',
  'where-lieu': 'Which seul ne peut pas dire dans lequel ou où : pour reprendre un lieu, on emploie where.',
  'what-relatif': 'What ne reprend jamais un nom : après un nom de chose, on met which ; après un lieu, where.',
  'who-personne': 'Who renvoie à une personne ; une chose, un objet ou une machine se reprend par which.',
  'reflechi-forme': 'Theirselves n’existe pas : le réfléchi de they est themselves.',
  'reflechi-insistance': 'Pour insister sur le fait que le sujet agit seul, sans aide, on emploie un pronom réfléchi, themselves, et non them.',
  'capitale-canada': 'Toronto et Montréal sont les plus grandes villes du Canada, mais la capitale fédérale est Ottawa, en Ontario.',
  'langues-canada': 'Au niveau fédéral, le Canada a deux langues officielles, l’anglais et le français, héritage de ses deux colonisations européennes.',
  'commonwealth-empire': 'Le Commonwealth est né de l’Empire britannique : la plupart de ses membres sont d’anciennes colonies ou d’anciens dominions britanniques.',
  'capitale-australie': 'Sydney et Melbourne sont les plus grandes villes d’Australie, mais la capitale fédérale est Canberra, construite pour départager les deux rivales.',
  'idiome-litteral': 'Attention au sens littéral : une expression idiomatique a un sens figuré. Demande-toi ce qu’elle veut dire dans la situation.',
  'idiome-sens': 'Le sens est figuré, mais ce n’est pas celui-là : pense à l’équivalent français, comme « c’est du gâteau » ou « il pleut des cordes ».',
  'relire-texte': 'La réponse est écrite dans le texte : retrouve la phrase qui en parle et relis-la mot à mot.',
  'relire-implicite': 'Lis entre les lignes : l’auteur suggère quelque chose sans le dire. Demande-toi ce que sa remarque laisse entendre.',
  'relire-ton': 'Le ton se lit dans les mots choisis : cherche ceux qui montrent un sentiment, une plaisanterie, une fermeté ou une inquiétude.',

  // ------------------------------------------------ 2de pro : The Workshop Mystery
  '2pro-etape-1': 'Premier cadenas : l’établi est couvert d’outils. Trouve le mot exact.',
  '2pro-etape-1-regle': 'Pense d’abord à ce que tu dois faire, serrer, gonfler ou t’asseoir, puis choisis le mot de l’outil ou de la pièce qui sert à cela.',
  '2pro-etape-1-aide': 'Retiens : a spanner sert à serrer un écrou, a pump à gonfler un pneu ; sur le vélo, on s’assoit sur the saddle et on pousse the pedals avec les pieds.',
  '2pro-etape-2': 'Deuxième cadenas : le cahier de l’atelier raconte les jours passés. Choisis la bonne forme du passé.',
  '2pro-etape-2-regle': 'Repère le marqueur de temps : yesterday, last Monday ou last week situent l’action dans un passé daté, qui demande le prétérit.',
  '2pro-etape-2-aide': 'Retiens : avec un moment passé précis, on emploie le prétérit, en ed pour un verbe régulier ; les verbes irréguliers, comme leave, left, ou bring, brought, s’apprennent par cœur.',
  '2pro-etape-3': 'Troisième cadenas : l’affiche de sécurité de l’atelier. Choisis le modal qui dit la règle.',
  '2pro-etape-3-regle': 'Demande-toi ce que dit la règle : une obligation, une interdiction, ou quelque chose qui n’est pas obligatoire.',
  '2pro-etape-3-aide': 'Retiens : must pour une obligation, mustn’t pour une interdiction, don’t have to quand ce n’est pas obligatoire.',
  '2pro-etape-4': 'Quatrième cadenas : tu fais l’inventaire des étagères. Choisis le mot qui convient devant le nom.',
  '2pro-etape-4-regle': 'Demande-toi d’abord si le nom se compte, comme tyres, ou s’il est indénombrable, comme oil ou advice. Puis regarde si la phrase est affirmative ou négative.',
  '2pro-etape-4-aide': 'Retiens : much avec un indénombrable, many avec un pluriel qu’on compte ; some dans une phrase affirmative, any dans une phrase négative ou une question.',
  '2pro-etape-5': 'Cinquième cadenas : le message de la patronne. Lis-le bien avant de répondre.',
  '2pro-etape-5-regle': 'La réponse est écrite dans le message : retrouve la phrase qui en parle et relis-la mot à mot.',
  '2pro-etape-5-aide': 'Retiens : pour comprendre un message de travail, repère qui, quoi, où et quand ; ce sont les informations dont tu as besoin pour agir.',
  '2pro-etape-6': 'Dernier cadenas : la clé est retrouvée. Choisis le pronom relatif qui convient.',
  '2pro-etape-6-regle': 'Regarde ce que le pronom reprend : une personne, une chose, un lieu ou un possesseur.',
  '2pro-etape-6-aide': 'Retiens : who pour une personne, which pour une chose, where pour un lieu, whose pour la possession.',

  'outil-usage': 'Pense à ce que fait chaque outil : a spanner serre un écrou, a pump gonfle un pneu, a saw coupe, a hammer tape, a screwdriver visse.',
  'piece-velo': 'Situe la pièce sur le vélo : on s’assoit sur the saddle, on tient the handlebars, on pousse the pedals avec les pieds, on freine avec the brakes, et the chain fait tourner la roue.',
  'verbe-irregulier': 'Ce verbe est irrégulier : son prétérit ne se forme pas avec ed. Leave donne left, bring donne brought, et ces formes s’apprennent par cœur.',
  'preterit-passe': 'Le marqueur de temps, comme yesterday ou last week, situe l’action dans le passé : le verbe se met au prétérit, en ed pour un verbe régulier.',
  'mustnt-oblige': 'Mustn’t exprime une interdiction. Ici, la règle oblige à faire quelque chose : on emploie must.',
  'can-oblige': 'Can dit qu’on a le droit ou la possibilité de faire. Une règle de sécurité qui oblige se dit avec must.',
  'dont-have-to': 'Don’t have to veut dire qu’on n’est pas obligé. Pour une interdiction, on emploie mustn’t.',
  'must-interdit': 'Must oblige à faire. Ici, la règle interdit, car quelqu’un pourrait tomber : on emploie mustn’t.',
  'mustnt-pas-oblige': 'Mustn’t exprime une interdiction. Ici, rien n’est interdit : ce n’est simplement pas obligatoire, ce qui se dit don’t have to.',
  'cant-pas-oblige': 'Can’t dirait que c’est impossible. Ici, c’est seulement inutile : on n’est pas obligé, ce qui se dit don’t have to.',
  'much-many': 'Many va seulement avec un pluriel qu’on peut compter, comme many tyres. Oil et advice sont indénombrables : on dit much oil, ou some advice.',
  'oil-a': 'Oil est indénombrable : jamais de a devant. Dans une phrase négative, on dit much oil, ou any oil.',
  'some-any': 'Dans une phrase affirmative, on emploie some ; any s’emploie surtout dans les phrases négatives et les questions.',
  'a-pluriel': 'A ne va jamais devant un nom au pluriel : a s’emploie avec un seul objet, et au pluriel on emploie some, ou un nombre.',
  'advice-a': 'Advice est indénombrable en anglais : jamais de a, jamais de s. On dit some advice, ou a piece of advice.',
  'verifier-pas-changer': 'Relis bien : la patronne demande de vérifier les freins, pas de les changer. Ce dont le vélo a besoin est écrit juste avant.',
  'which-chose': 'Which renvoie à une chose ; pour une personne, comme un client, on emploie who.',
  'where-pas-lieu': 'Where reprend un lieu ; ici, on parle d’une personne : on emploie who.',

  // ------------------------------------------------ 1re : The Midnight Broadcast
  '1re-etape-1': 'Premier cadenas : la radio émet depuis la côte du Maine. Montre que tu connais la carte des États-Unis.',
  '1re-etape-1-regle': 'Situe d’abord le Maine sur la carte : tout au nord-est des États-Unis, en Nouvelle-Angleterre, au bord de l’Atlantique et tout près du Canada.',
  '1re-etape-1-aide': 'Retiens : le Maine, l’un des six États de la Nouvelle-Angleterre avec le Massachusetts, borde l’océan Atlantique et touche le Canada au nord.',
  '1re-etape-2': 'Deuxième cadenas : la foudre a coupé le courant. Choisis la forme qui correspond au type d’hypothèse.',
  '1re-etape-2-regle': 'Repère d’abord le temps qui suit if : présent, prétérit ou past perfect. Il fixe le temps de l’autre partie de la phrase.',
  '1re-etape-2-aide': 'Retiens : if et présent, puis will ; if et prétérit, puis would ; if et past perfect, puis would have et le participe passé, pour un regret sur le passé.',
  '1re-etape-3': 'Troisième cadenas : tu écris le bulletin de tempête. Choisis le mot de liaison qui articule la phrase.',
  '1re-etape-3-regle': 'Demande-toi d’abord quel lien unit les deux idées, opposition, but ou conséquence, puis regarde ce qui suit : un nom, un verbe ou une proposition.',
  '1re-etape-3-aide': 'Retiens : although et even though devant une proposition, despite devant un nom ; however en tête de phrase, suivi d’une virgule ; in order to devant un verbe.',
  '1re-etape-4': 'Quatrième cadenas : l’émetteur reste muet, et chacun refait le film de la soirée. Choisis le modal qui nuance le mieux.',
  '1re-etape-4-regle': 'Demande-toi ce que dit la phrase : un regret, une déduction, une absence d’obligation ou un doute. Puis vérifie si l’action est passée.',
  '1re-etape-4-aide': 'Retiens : should have pour un regret, must have pour une déduction presque sûre, may have pour un doute, didn’t have to pour une absence d’obligation.',
  '1re-etape-5': 'Cinquième cadenas : une vieille bande des archives de la radio. Lis le texte avant de répondre.',
  '1re-etape-5-regle': 'La réponse est dans le texte : retrouve la phrase qui en parle, et appuie-toi sur le contexte pour les mots que tu ne connais pas.',
  '1re-etape-5-aide': 'Retiens : le vingt-huit août mille neuf cent soixante-trois, Martin Luther King prononce « I have a dream » devant le Lincoln Memorial ; l’année suivante, la loi sur les droits civiques interdit la discrimination dans les lieux publics.',
  '1re-etape-6': 'Dernier cadenas : te voilà à l’antenne. Choisis le pronom qui évite la répétition.',
  '1re-etape-6-regle': 'Demande-toi ce que le pronom reprend : un nom déjà cité, le sujet lui-même, ou deux personnes qui agissent l’une sur l’autre.',
  '1re-etape-6-aide': 'Retiens : each other pour une action réciproque, le réfléchi pour une action qui revient sur le sujet, one ou ones pour reprendre un nom, mine ou yours pour remplacer un nom possédé.',

  'cote-maine': 'Le Maine est à l’extrême nord-est des États-Unis, en Nouvelle-Angleterre : il borde l’océan Atlantique. Le Pacifique baigne la côte ouest du pays.',
  'voisin-maine': 'Au nord, le Maine touche le Canada, notamment le Québec ; le Mexique borde les États-Unis au sud, et le Groenland est une île bien plus au nord, de l’autre côté de la mer.',
  'nouvelle-angleterre': 'La Nouvelle-Angleterre réunit six États du nord-est, autour de Boston : le Maine, le Massachusetts, le New Hampshire, le Vermont, le Rhode Island et le Connecticut. Le Texas et la Californie sont au sud et à l’ouest.',
  'irreel-passe-would': 'Pour un regret sur le passé, if est suivi du past perfect, et l’autre partie de la phrase prend would have et le participe passé : jamais deux past perfect.',
  'hypothese-type': 'Regarde le temps qui suit if : il impose celui de l’autre partie. Présent avec will, prétérit avec would, past perfect avec would have.',
  'apres-if': 'Juste après if, jamais de will ni de would : ils vont dans l’autre partie de la phrase.',
  'however-place': 'However ne relie pas deux propositions dans la même phrase : il se place en tête d’une nouvelle phrase, suivi d’une virgule.',
  'despite-nom': 'Despite est suivi d’un nom ou d’une forme en ing, jamais d’une proposition avec un sujet et un verbe.',
  'although-proposition': 'Although introduit une proposition, avec un sujet et un verbe ; devant un simple nom, comme the storm, on emploie despite.',
  'even-though-seul': 'Even though ne s’emploie jamais seul devant une virgule : il introduit une proposition. Ici, la seconde phrase dit la conséquence de la première.',
  'so-that-sujet': 'So that est suivi d’un sujet et d’un verbe, comme so that you stay safe. Devant un verbe seul, le but se dit avec in order to.',
  'for-nom': 'For s’emploie devant un nom, comme for your safety ; devant un verbe, le but se dit avec to ou in order to.',
  'whereas-contraste': 'Whereas marque un contraste entre deux faits. Ici, la seconde phrase dit la conséquence de la première : on emploie as a result.',
  'regret-should-have': 'Must have sert à déduire ce qui s’est sûrement passé. Pour regretter ce qu’on aurait dû faire, on emploie should have.',
  'modal-passe-have': 'L’action est passée : après le modal, on ajoute have et le participe passé, comme should have filled ou must have hit.',
  'mustnt-interdiction': 'Mustn’t exprime une interdiction. Ici, l’action n’était simplement pas nécessaire : on emploie didn’t have to.',
  'couldnt-capacite': 'Couldn’t dirait qu’on n’était pas capable de le faire. Ici, ce n’était simplement pas nécessaire, ce qui se dit didn’t have to.',
  'sens-contexte': 'Pour deviner le sens d’un mot, appuie-toi sur la phrase qui l’entoure : ici, elle parle de droits égaux refusés à une partie de la population.',
  'each-other': 'Themselves voudrait dire que chacun agit sur lui-même. Quand deux personnes agissent l’une sur l’autre, on emploie each other.',
  'ones-pluriel': 'Le nom repris est au pluriel, comme headphones ou plants : on le reprend par ones, et non par one.',
  'ones-reprise': 'Them reprendrait les objets déjà cités. Pour parler d’autres objets du même genre, on reprend le nom par ones.',
  'reflechi-nous': 'Quand le complément désigne les mêmes personnes que le sujet, the technician and I, on emploie le réfléchi ourselves, et non us.',
  'reflechi-personne': 'Le réfléchi s’accorde avec le sujet : the technician and I, c’est we, donc ourselves ; themselves renverrait à they.',
  'pronom-possessif': 'Pour remplacer un nom possédé, on emploie un pronom possessif, comme mine ou yours ; my et your doivent être suivis d’un nom, et me ou you n’expriment pas la possession.',

  // ------------------------------------------------ 1re techno : The Greenhouse Alarm
  '1tec-etape-1': 'Premier cadenas : l’alarme clignote dans la serre. Trouve le mot exact.',
  '1tec-etape-1-regle': 'Appuie-toi sur ce que décrit la phrase : une couleur, un état, une fonction. Ces indices désignent un seul mot.',
  '1tec-etape-1-aide': 'Retiens : wilting, c’est se faner ; a drought, une sécheresse ; to water, arroser ; a sprinkler arrose, a fan ventile, a thermometer mesure la température.',
  '1tec-etape-2': 'Deuxième cadenas : le journal du système s’affiche à l’écran. Lis-le ligne par ligne.',
  '1tec-etape-2-regle': 'La réponse est dans le journal : retrouve la ligne qui en parle, et suis les heures dans l’ordre.',
  '1tec-etape-2-aide': 'Retiens : dans un journal de bord, chaque ligne a son heure ; lis-les dans l’ordre pour reconstituer ce qui s’est passé, et appuie-toi sur les valeurs données.',
  '1tec-etape-3': 'Troisième cadenas : une flaque, un tuyau débranché. Choisis le modal qui tire la bonne conclusion.',
  '1tec-etape-3-regle': 'Lis les indices : rendent-ils la chose presque sûre, impossible, ou seulement possible ? Pour le passé, ajoute have et le participe passé.',
  '1tec-etape-3-aide': 'Retiens : must have pour une déduction presque sûre, can’t have pour une impossibilité, might have pour un simple doute.',
  '1tec-etape-4': 'Quatrième cadenas : tu rédiges ton rapport. Choisis le mot de liaison qui convient.',
  '1tec-etape-4-regle': 'Demande-toi quel lien unit les deux idées : une cause, une conséquence, une opposition ou un contraste. Puis regarde ce qui suit : un nom ou une proposition.',
  '1tec-etape-4-aide': 'Retiens : because pour une cause, as a result pour une conséquence, whereas pour un contraste, despite devant un nom.',
  '1tec-etape-5': 'Cinquième cadenas : ton tuteur veut éviter une nouvelle panne. Choisis la forme qui correspond au type d’hypothèse.',
  '1tec-etape-5-regle': 'Repère d’abord le temps qui suit if : présent, prétérit ou past perfect. Il fixe le temps de l’autre partie de la phrase.',
  '1tec-etape-5-aide': 'Retiens : if et présent, puis will ; if et prétérit, puis would ; if et past perfect, puis would have et le participe passé.',
  '1tec-etape-6': 'Dernier cadenas : la serre revit au coucher du soleil. Choisis le pronom qui évite la répétition.',
  '1tec-etape-6-regle': 'Demande-toi ce que le pronom reprend : un nom déjà cité, le sujet lui-même, ou deux personnes qui agissent l’une sur l’autre.',
  '1tec-etape-6-aide': 'Retiens : ones pour reprendre un nom au pluriel, each other pour une action réciproque, themselves pour insister sur le sujet, mine pour remplacer un nom possédé.',

  'lexique-contexte': 'Appuie-toi sur les indices de la phrase : un état, une couleur ou une action désignent un seul mot. Écarte celui qui dit autre chose, ou le contraire.',
  'lexique-appareil': 'Pense à la fonction de chaque appareil : a sprinkler arrose, a fan ventile, a thermometer mesure la température.',
  'lexique-secheresse': 'Une longue période sans pluie se dit a drought ; a flood est une inondation, et a storm une tempête.',
  'relire-ordre': 'Relis l’ordre donné par le texte : les heures, ou les mots first, then et finally, indiquent ce qui vient en premier.',
  'cant-have-impossible': 'Must have dirait que c’est presque sûr. Ici, les indices montrent le contraire : pour une impossibilité dans le passé, on emploie can’t have.',
  'so-cause': 'So introduit une conséquence. Ici, la seconde partie explique pourquoi : c’est une cause, introduite par because.',
  'although-cause': 'Although marque une opposition. Ici, la seconde partie explique la cause du problème : on emploie because.',
  'because-contraste': 'Because introduit une cause. Ici, on compare deux situations qui s’opposent : le contraste se dit avec whereas.',
  'so-contraste': 'So introduit une conséquence. Ici, on oppose deux situations : le contraste se dit avec whereas.',

  // ------------------------------------------------ 1re pro : The Delivery Detour
  '1pro-etape-1': 'Premier cadenas : ton premier jour dans l’entreprise de livraison. Trouve le mot exact.',
  '1pro-etape-1-regle': 'Appuie-toi sur la situation décrite : un lieu, un objet ou un geste du métier désignent un seul mot.',
  '1pro-etape-1-aide': 'Retiens : the warehouse est l’entrepôt, a parcel un colis, the letterbox la boîte aux lettres, et a signature la signature du client.',
  '1pro-etape-2': 'Deuxième cadenas : le message du bureau. Lis-le bien avant de partir.',
  '1pro-etape-2-regle': 'La réponse est écrite dans le message : retrouve la phrase qui en parle et relis-la mot à mot.',
  '1pro-etape-2-aide': 'Retiens : dans un message de travail, repère le lieu, l’heure et les précautions à prendre ; ce sont elles qui te disent comment agir.',
  '1pro-etape-3': 'Troisième cadenas : tu expliques ton détour au téléphone. Choisis le mot de liaison qui convient.',
  '1pro-etape-3-regle': 'Demande-toi quel lien unit les deux idées : une cause, une conséquence, une opposition, ou l’ordre des étapes.',
  '1pro-etape-3-aide': 'Retiens : because pour une cause, so pour une conséquence, but pour une opposition ; first, then et finally pour l’ordre des étapes.',
  '1pro-etape-4': 'Quatrième cadenas : et si quelque chose se passait mal ? Choisis la forme qui correspond au type d’hypothèse.',
  '1pro-etape-4-regle': 'Repère d’abord le temps qui suit if, présent ou prétérit : il fixe le temps de l’autre partie de la phrase.',
  '1pro-etape-4-aide': 'Retiens : if et présent, puis will, pour ce qui peut vraiment arriver ; if et prétérit, puis would, pour une situation imaginaire.',
  '1pro-etape-5': 'Cinquième cadenas : le portail de la cour est resté ouvert. Choisis le modal qui tire la bonne conclusion.',
  '1pro-etape-5-regle': 'Lis les indices : rendent-ils la chose presque sûre, impossible, ou seulement possible ? Pour le passé, ajoute have et le participe passé.',
  '1pro-etape-5-aide': 'Retiens : must have pour une déduction presque sûre, can’t have pour une impossibilité, might have pour un simple doute.',
  '1pro-etape-6': 'Dernier cadenas : une petite clé brille près du portail. Choisis le pronom qui convient.',
  '1pro-etape-6-regle': 'Demande-toi ce que le pronom reprend : un objet possédé, un nom déjà cité, ou deux personnes qui agissent l’une sur l’autre.',
  '1pro-etape-6-aide': 'Retiens : yours ou mine remplacent un nom possédé ; one reprend un nom au singulier, ones un nom au pluriel ; each other pour une action réciproque.',

  'because-consequence': 'Because introduit une cause. Ici, la seconde partie dit ce que tu fais en conséquence : on emploie so.',
  'but-consequence': 'But marque une opposition. Ici, la seconde partie est la conséquence de la première : on emploie so.',
  'but-cause': 'But marque une opposition. Ici, la seconde partie explique pourquoi : c’est une cause, introduite par because.',
  'so-opposition': 'So introduit une conséquence. Ici, les deux idées s’opposent : le colis est lourd, et pourtant le vélo le porte. On emploie but.',
  'because-opposition': 'Because introduit une cause. Ici, les deux idées s’opposent : le colis est lourd, et pourtant le vélo le porte. On emploie but.',
  'ordre-chrono': 'Pour la première étape, on emploie first ; then annonce l’étape suivante, et finally la dernière.',
  'apres-if-will': 'Juste après if, on ne met pas will : le présent suffit, if you drop. Will va dans l’autre partie de la phrase.',
  'hypothese-will': 'L’autre partie de la phrase est au futur, avec will : après if, on met alors le présent, if you drop.',
  'one-singulier': 'Le nom repris est au singulier, un seul cadenas : on le reprend par one ; ones reprend un pluriel.',
  'one-reprise': 'It reprendrait le vieux cadenas lui-même. Pour parler d’un autre objet du même genre, on reprend le nom par one.',

  // ------------------------------------------------ terminale : The Silent Research Station
  'tle-etape-1': 'Premier cadenas : l’équipe vient des quatre nations du Royaume-Uni. Montre ta culture britannique.',
  'tle-etape-1-regle': 'Rappelle-toi que le Royaume-Uni réunit quatre nations, avec un Parlement à Londres et des assemblées dans les nations.',
  'tle-etape-1-aide': 'Retiens : le Royaume-Uni réunit l’Angleterre, l’Écosse, le pays de Galles et l’Irlande du Nord ; son Parlement, à Westminster, compte la Chambre des communes et la Chambre des lords.',
  'tle-etape-2': 'Deuxième cadenas : traduis les notes de la glaciologue française sans calquer le français. Méfie-toi des mots trompeurs.',
  'tle-etape-2-regle': 'Un mot anglais qui ressemble au mot français n’a pas toujours le même sens : vérifie d’abord le sens, puis le temps du verbe.',
  'tle-etape-2-aide': 'Retiens : actually veut dire en fait, eventually finalement, to assist aider, sympathetic compatissant. Actuellement, éventuellement, assister à et sympathique se disent currently, may, to attend et nice.',
  'tle-etape-3': 'Troisième cadenas : tu écris à l’université qui gère la station. Choisis le registre qui convient.',
  'tle-etape-3-regle': 'Demande-toi à qui tu écris : un courrier officiel exige un registre soutenu, sans formule familière.',
  'tle-etape-3-aide': 'Retiens : dans un courrier formel, on préfère I would be grateful if ; on termine par yours sincerely après un nom, par yours faithfully après dear sir or madam.',
  'tle-etape-4': 'Quatrième cadenas : le début de ton rapport doit frapper. Choisis la tournure qui met l’idée en relief.',
  'tle-etape-4-regle': 'Quand une phrase commence par un mot négatif ou restrictif, comme never, not only ou hardly, l’auxiliaire passe devant le sujet.',
  'tle-etape-4-aide': 'Retiens : never, not only et hardly en tête de phrase entraînent l’inversion, comme dans une question ; what en tête de phrase veut dire ce qui ou ce que.',
  'tle-etape-5': 'Cinquième cadenas : la cheffe d’équipe relit ton brouillon. Choisis la phrase correcte.',
  'tle-etape-5-regle': 'Vérifie le groupe nominal : un nom indénombrable ne prend ni s ni a, et un adjectif placé devant le nom reste invariable.',
  'tle-etape-5-aide': 'Retiens : information, advice et equipment sont indénombrables ; dans a two-day journey, l’adjectif composé reste au singulier.',
  'tle-etape-6': 'Dernier cadenas : la dernière page du journal de bord de la station. Lis-la jusqu’au bout, car elle nuance son propos.',
  'tle-etape-6-regle': 'Lis tout le texte : une concession, introduite par no doubt puis réfutée par but, n’est pas l’avis de l’autrice. Sa position vient ensuite, après le mot but.',
  'tle-etape-6-aide': 'Retiens : dans une argumentation, l’auteur concède souvent un point avant de le réfuter ; sa vraie position suit le mot but.',

  'frontiere-irlande': 'L’Écosse et le pays de Galles sont sur l’île de Grande-Bretagne. La seule frontière terrestre avec la république d’Irlande passe sur l’île d’Irlande : c’est celle de l’Irlande du Nord.',
  'parlement-uk': 'Le Sénat et la Chambre des représentants forment le Congrès américain. Le Parlement britannique réunit la Chambre des communes et la Chambre des lords.',
  'parlement-ecosse': 'Depuis la dévolution, le Parlement écossais siège à Édimbourg, la capitale de l’Écosse ; Glasgow est sa plus grande ville, et Londres accueille le Parlement du Royaume-Uni.',
  'capitale-galles': 'Cardiff est la capitale du pays de Galles, où siège le Senedd, le Parlement gallois ; Swansea est une autre ville galloise, et Édimbourg est la capitale de l’Écosse.',
  actually: 'Actually ne veut pas dire actuellement, mais en fait. Pour dire en ce moment, on emploie currently.',
  'temps-en-cours': 'L’action est en cours en ce moment : l’anglais emploie be suivi du verbe en ing.',
  'assist-attend': 'To assist veut dire aider. Pour dire être présent à une réunion, on emploie to attend, sans préposition.',
  eventually: 'Eventually ne veut pas dire éventuellement, mais finalement. Pour une simple possibilité, on emploie may ou might.',
  'modal-base': 'Après un modal comme may, le verbe reste à la base verbale, sans s, même avec he, she ou it.',
  sympathetic: 'Sympathetic veut dire compatissant, et sympathic n’existe pas. Pour dire qu’une personne est agréable, on emploie nice ou friendly.',
  'registre-formel': 'Cette formule est familière : on l’emploie avec un ami, pas dans un courrier officiel. Cherche la tournure la plus polie et la plus soutenue.',
  'sincerely-faithfully': 'En anglais britannique, yours faithfully s’emploie quand on ne connaît pas le nom du destinataire, après dear sir or madam. Quand on l’a nommé, on écrit yours sincerely.',
  'phrasal-sens': 'Un verbe à particule change de sens avec sa particule : look after, c’est s’occuper de ; look up to, admirer ; look into, examiner, enquêter sur.',
  'inversion-negatif': 'Après un mot négatif placé en tête de phrase, comme never ou not only, on inverse le sujet et l’auxiliaire, comme dans une question.',
  'participe-irregulier': 'Après have, il faut le participe passé : see, saw, seen. On écrit have we seen.',
  'auxiliaire-did-base': 'Quand did porte le passé, le verbe reste à la base verbale : did the storm bury, et non buried.',
  'hardly-had': 'Hardly en tête de phrase se construit avec had, le sujet et le participe passé, puis when : une action passée juste antérieure à une autre.',
  'what-ce-qui': 'Pour dire ce qui en tête de phrase, on emploie what ; that et which ont besoin d’un nom à reprendre.',
  'adjectif-invariable': 'Placé devant le nom, un adjectif ne prend jamais de s, même composé avec un nombre : a two-day journey, a ten-metre cable.',
  'gn-ordre': 'En anglais, l’adjectif se place devant le nom : a two-day journey, a ten-metre cable.',
  indenombrable: 'Information, advice et equipment sont indénombrables en anglais : jamais de s, jamais de a. On dit some information, a piece of advice, a piece of equipment.',
  'relire-concession': 'Attention à la construction : l’auteur reconnaît ou écarte d’abord une idée, puis donne sa vraie position après but. Lis la phrase jusqu’au bout.',
  'relire-pas-dit': 'Le texte ne dit pas cela : ne lui prête pas une idée qu’il n’exprime pas. Cherche ce qu’il affirme vraiment.',

  // ------------------------------------------------ terminale techno : The Smart City Blackout
  'ttec-etape-1': 'Premier cadenas : le quartier est dans le noir, mais Londres se reconnaît. Montre ce que tu sais de la ville.',
  'ttec-etape-1-regle': 'Repère d’abord ce qui est demandé : un fleuve, un monument ou une institution. Puis rappelle-toi ce que l’on trouve vraiment à Londres.',
  'ttec-etape-1-aide': 'Retiens : Londres est traversée par la Tamise ; Saint-Paul est sa cathédrale ; le Parlement, avec ses deux chambres, siège au palais de Westminster.',
  'ttec-etape-2': 'Deuxième cadenas : les rumeurs se répandent sur les réseaux sociaux. Trie le fiable du douteux.',
  'ttec-etape-2-regle': 'Avant de croire un message, regarde sa source, ses preuves et son ton : une information fiable cite son origine et ne cherche pas à t’affoler.',
  'ttec-etape-2-aide': 'Retiens : une fausse information joue sur l’émotion et l’urgence, sans source ; pour vérifier, on compare plusieurs sources fiables et on remonte à l’origine du message.',
  'ttec-etape-3': 'Troisième cadenas : un message officiel aux habitants du quartier. Choisis le registre qui convient.',
  'ttec-etape-3-regle': 'Demande-toi à qui tu écris : un message officiel exige un registre soutenu, poli et sans formule familière.',
  'ttec-etape-3-aide': 'Retiens : dans un message officiel, on préfère we apologise for any inconvenience et des phrases complètes ; après dear sir or madam, on termine par yours faithfully.',
  'ttec-etape-4': 'Quatrième cadenas : tu relis ton rapport pour ton responsable. Choisis la phrase correcte.',
  'ttec-etape-4-regle': 'Vérifie le groupe nominal : un nom indénombrable ne prend ni s ni a, police est toujours pluriel, et un adjectif placé devant le nom reste invariable.',
  'ttec-etape-4-aide': 'Retiens : information et equipment sont indénombrables ; police est toujours pluriel ; dans a ten-metre cable, l’adjectif composé reste au singulier.',
  'ttec-etape-5': 'Cinquième cadenas : le message de l’ingénieur de garde. Lis-le jusqu’au bout avant de répondre.',
  'ttec-etape-5-regle': 'La réponse est dans le message : retrouve la phrase qui en parle, et lis-la jusqu’au bout, surtout après but.',
  'ttec-etape-5-aide': 'Retiens : dans un compte rendu, first, then et finally donnent l’ordre des étapes, et but annonce souvent l’idée qui compte vraiment.',
  'ttec-etape-6': 'Dernier cadenas : au boîtier, traduis les consignes de Léa sans calquer le français.',
  'ttec-etape-6-regle': 'Un mot anglais qui ressemble au mot français n’a pas toujours le même sens : vérifie d’abord le sens, puis la forme du verbe.',
  'ttec-etape-6-aide': 'Retiens : actually veut dire en fait, eventually finalement, to control maîtriser, sensible raisonnable. Actuellement, éventuellement, contrôler et sensible se disent currently, may, to check et sensitive.',

  tamise: 'Londres est traversée par la Tamise, the Thames ; la Severn est le plus long fleuve de Grande-Bretagne, mais elle coule dans l’ouest, entre le pays de Galles et l’Angleterre, et la Seine traverse Paris.',
  'saint-paul': 'Saint-Paul est la cathédrale de Londres, reconstruite par Christopher Wren après le grand incendie de seize cent soixante-six ; le palais du souverain, c’est Buckingham.',
  westminster: 'Buckingham est la résidence du souverain à Londres, et la Tour de Londres une ancienne forteresse royale. Le Parlement siège au palais de Westminster, au bord de la Tamise.',
  'source-fiable': 'Ce message cite une source officielle et donne des faits vérifiables, sans dramatiser : c’est l’inverse d’une fausse nouvelle. Une fausse information joue sur l’émotion, l’urgence et l’absence de source.',
  'verifier-source': 'Le nombre de partages ne prouve rien, et le premier message venu non plus : pour vérifier une information, on la compare avec plusieurs sources fiables et on cherche son origine.',
  'urgence-signe': 'Pousser à partager vite, c’est empêcher de réfléchir et de vérifier : l’urgence est un signal d’alerte, pas une preuve.',
  'faithfully-sincerely': 'En anglais britannique, yours sincerely s’emploie quand on a nommé le destinataire. Après dear sir or madam, quand on ne connaît pas son nom, on écrit yours faithfully.',
  'police-pluriel': 'Police est un nom collectif toujours pluriel en anglais, sans s : the police are.',
  'control-check': 'To control veut dire maîtriser, diriger. Pour dire vérifier, on emploie to check.',
  'need-to-base': 'Après need to, le verbe reste à la base verbale : we need to check.',
  'sensible-sensitive': 'Sensible veut dire raisonnable, sensé. Pour dire qu’un capteur réagit au moindre changement, on emploie sensitive.',
  'adjectif-sans-s': 'En anglais, l’adjectif ne prend jamais de s, même au pluriel : sensitive reste sensitive.',

  // ------------------------------------------------ terminale pro : The Last Train Clue
  'tpro-etape-1': 'Premier cadenas : le signal est bloqué au rouge. Choisis la forme du verbe qui convient.',
  'tpro-etape-1-regle': 'Repère d’abord le marqueur de temps : look pour ce qui se passe maintenant, usually pour une habitude, yesterday pour le passé. Puis vérifie le sujet.',
  'tpro-etape-1-aide': 'Retiens : be et ing pour ce qui se passe maintenant, le présent simple avec un s à la troisième personne pour une habitude, le prétérit pour un moment passé ; does pour une question avec he, she ou it.',
  'tpro-etape-2': 'Deuxième cadenas : le mot laissé par le technicien. Lis-le bien avant de toucher à quoi que ce soit.',
  'tpro-etape-2-regle': 'La réponse est écrite dans le mot : retrouve la phrase qui en parle et relis-la, en suivant l’ordre des étapes.',
  'tpro-etape-2-aide': 'Retiens : dans des consignes, first, then et finally donnent l’ordre des gestes ; et la sécurité passe toujours en premier.',
  'tpro-etape-3': 'Troisième cadenas : les voyageurs s’impatientent sur le quai. Choisis la phrase la plus polie.',
  'tpro-etape-3-regle': 'Face à des voyageurs, on reste poli et calme : une question avec could you et please, des excuses, jamais de formule familière.',
  'tpro-etape-3-aide': 'Retiens : could you please pour demander, I’m sorry ou we apologise pour s’excuser ; on évite mate, guys ou no idea avec des clients.',
  'tpro-etape-4': 'Quatrième cadenas : tu ouvres la caisse à outils. Choisis la phrase correcte.',
  'tpro-etape-4-regle': 'Vérifie le groupe nominal : le pluriel du nom, l’accord du verbe, et les noms qui ne se comptent pas.',
  'tpro-etape-4-aide': 'Retiens : un nom prend un s au pluriel, sauf les pluriels irréguliers comme men ; equipment est indénombrable ; a ne va jamais devant un pluriel.',
  'tpro-etape-5': 'Cinquième cadenas : ton collègue donne les consignes de sécurité en français. Traduis-les sans calquer.',
  'tpro-etape-5-regle': 'Ne traduis pas mot à mot : cherche d’abord l’expression anglaise qui dit la même chose, puis vérifie la forme du verbe.',
  'tpro-etape-5-aide': 'Retiens : couper le courant se dit switch off the power, être en retard be late ; après must et don’t, le verbe reste à la base verbale, sans to ni s.',
  'tpro-etape-6': 'Dernier cadenas : tu rebranches les fils, et le signal change de couleur. Choisis le comparatif ou le superlatif qui convient.',
  'tpro-etape-6-regle': 'Regarde ce que l’on compare : deux choses reliées par than demandent le comparatif ; la première d’un groupe demande le superlatif.',
  'tpro-etape-6-aide': 'Retiens : un adjectif court prend er et est, comme longer et the longest ; un adjectif long prend more et the most ; good donne better et the best.',

  'present-be-ing': 'Look montre que l’action se passe en ce moment : on emploie be suivi du verbe en ing, is flashing.',
  'be-ing-forme': 'Avec be, le verbe prend la forme en ing : is flashing.',
  'troisieme-personne-s': 'Avec he, she, it ou un nom au singulier, le présent simple prend un s : the train leaves.',
  'present-habitude': 'Usually montre une habitude : on emploie le présent simple, pas be suivi de ing.',
  'question-do': 'Pour poser une question au présent simple avec un verbe comme know, on emploie l’auxiliaire do, et does avec un sujet au singulier.',
  'does-singulier': 'Le sujet, the technician, est au singulier : à la troisième personne, l’auxiliaire est does.',
  'registre-poli': 'Face à des voyageurs, cette formule est trop sèche ou trop familière. Cherche la phrase polie, avec please, could you ou des excuses.',
  'pluriel-s': 'Après un nombre plus grand que un, le nom prend un s au pluriel : two screwdrivers.',
  'pluriel-irregulier': 'Man a un pluriel irrégulier, men, comme woman donne women et child donne children.',
  'accord-pluriel': 'Le sujet est au pluriel : le verbe be se conjugue are.',
  'calque-mot-a-mot': 'Ne traduis pas mot à mot : cherche l’expression que l’anglais emploie vraiment pour dire la même chose.',
  'modal-sans-to': 'Après must, le verbe se met à la base verbale, sans to : you must switch off.',
  'imperatif-negatif': 'L’impératif négatif se forme avec don’t suivi de la base verbale : don’t touch.',
  'imperatif-base': 'Après don’t, le verbe reste à la base verbale, sans s.',
  'etre-be': 'Pour dire être en retard, l’anglais emploie be, et non have : the driver is late.',
  'comparatif-court': 'Long est un adjectif court : son comparatif se forme avec er, longer, sans more.',
  'comparatif-superlatif': 'Regarde ce que l’on compare : avec than, deux choses, c’est le comparatif ; pour la première d’un groupe, c’est le superlatif, avec the.',
  'comparatif-long': 'Reliable est un adjectif long : son comparatif se forme avec more, more reliable, sans er.',
  'comparatif-double': 'On ne combine jamais more et er : c’est l’un ou l’autre, et pour un adjectif long, c’est more.',
  'superlatif-irregulier': 'Good a un superlatif irrégulier : the best, comme bad donne the worst.',
  'superlatif-court': 'Hot est un adjectif court : son superlatif se forme avec est, en doublant le t, the hottest.',
};
