import {
  conversationEnCours, marquerVitesseChoisie, ouvreUneConversation, rangConversation,
  retirerMarqueurConversation,
} from '../lib/storage/conversationLangue';

/**
 * LA VITESSE NE SE REDEMANDE PAS À CHAQUE RÉPLIQUE — trouvé en vérifiant, avant
 * livraison, le 18/09/2026.
 *
 * LE DÉFAUT QUE CE FICHIER PROTÈGE
 * --------------------------------
 * `carteVitesseVisible` repose la question dès qu'un passage INÉDIT arrive, et
 * c'est juste en compréhension orale : un nouveau texte à écouter, une nouvelle
 * question. Mais dans une conversation, CHAQUE réplique du professeur est un
 * texte inédit — les quatre vitesses seraient réapparues entre chaque phrase
 * d'un échange qui doit couler.
 *
 * Camara : « pour le choix de la vitesse j'espère que t'as repris le même
 * système que pour la compréhension orale, il est très bien et testé. » C'est
 * bien le même, et on n'y touche pas : on lui ajoute une condition qui ne
 * concerne QUE la conversation.
 *
 * POURQUOI UNE BALISE ET NON UNE DEVINETTE : on aurait pu déduire « si l'élève
 * parle aussi dans la langue, c'est une conversation ». Ça marche jusqu'au jour
 * où un élève répond un mot en anglais au milieu d'une compréhension orale, et
 * la vitesse cesse alors d'être demandée là où elle devrait l'être.
 */

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

describe('La balise', () => {
  test('elle est reconnue', () => {
    expect(ouvreUneConversation('On parle un peu ? [CONVERSATION]')).toBe(true);
  });

  test('un message ordinaire ne l’ouvre pas', () => {
    expect(ouvreUneConversation('On révise le vocabulaire.')).toBe(false);
    expect(ouvreUneConversation(undefined)).toBe(false);
  });

  test('elle ne s’affiche jamais à l’élève', () => {
    expect(retirerMarqueurConversation('On y va ! [CONVERSATION]')).toBe('On y va ! ');
  });
});

describe('Une conversation est-elle en cours ?', () => {
  test('non, par défaut', () => {
    expect(conversationEnCours([prof('Bonjour !')])).toBe(false);
    expect(conversationEnCours([])).toBe(false);
  });

  test('oui, dès la balise', () => {
    expect(conversationEnCours([prof('[CONVERSATION] Ready?')])).toBe(true);
  });

  test('oui, pendant que le professeur écrit sa réponse', () => {
    // Le flux arrive avant d'être versé dans l'historique : sans ce cas, la
    // carte des vitesses clignoterait le temps de la réponse.
    expect(conversationEnCours([], '[CONVERSATION] Let’s talk!')).toBe(true);
  });

  test('elle tient sur plusieurs tours', () => {
    const fil = [
      prof('[CONVERSATION] Ready?'),
      eleve('Yes!'),
      prof('Where did you go this summer?'),
      eleve('To Spain.'),
    ];

    expect(conversationEnCours(fil)).toBe(true);
  });

  /**
   * L'ARCHIVAGE LA REFERME, et c'est la même balise que celle qui range la
   * conversation : une balise de moins à penser pour le professeur.
   */
  test('le bloc d’archivage la referme', () => {
    const fil = [
      prof('[CONVERSATION] Ready?'),
      eleve('Yes!'),
      prof('Bravo ! [EXPRESSION_ORALE]titre: Les vacances[/EXPRESSION_ORALE]'),
    ];

    expect(conversationEnCours(fil)).toBe(false);
  });

  test('une seconde conversation repose la question', () => {
    const fil = [
      prof('[CONVERSATION] Ready?'),
      prof('[EXPRESSION_ORALE]…[/EXPRESSION_ORALE]'),
      prof('On en refait une ? [CONVERSATION]'),
    ];

    expect(conversationEnCours(fil)).toBe(true);
  });

  test('c’est la DERNIÈRE chose écrite qui fait foi', () => {
    // Le fil se lit à l'envers : un archivage ancien ne referme pas une
    // conversation ouverte après lui.
    const fil = [
      prof('[EXPRESSION_ORALE]…[/EXPRESSION_ORALE]'),
      prof('[CONVERSATION]'),
    ];

    expect(conversationEnCours(fil)).toBe(true);
  });

  test('une balise écrite par l’ÉLÈVE ne compte pas', () => {
    // Il peut taper ce qu'il veut dans son message : seul le professeur ouvre
    // une conversation.
    expect(conversationEnCours([eleve('[CONVERSATION]')])).toBe(false);
  });
});

describe('Le rang, identité de la conversation', () => {
  test('null quand aucune n’est ouverte', () => {
    expect(rangConversation([prof('Bonjour !')])).toBeNull();
  });

  /**
   * LE CAS QUI A CASSÉ, le 18/09/2026. Le message du professeur arrive d'abord
   * en FLUX, puis se range dans l'historique. Avec l'index du message comme
   * identité, celle-ci changeait au passage — et la fenêtre des vitesses
   * revenait juste après que l'élève avait cliqué, pour une conversation qu'il
   * venait de régler.
   *
   * Le rang, lui, vaut pareil des deux côtés.
   */
  test('le rang ne change pas quand le message passe du flux à l’historique', () => {
    const enFlux = rangConversation([prof('Salut !')], '[CONVERSATION] Ready?');
    const range = rangConversation([prof('Salut !'), prof('[CONVERSATION] Ready?')]);

    expect(enFlux).toBe(1);
    expect(range).toBe(1);
  });

  test('la deuxième conversation de la séance porte le rang 2', () => {
    const fil = [
      prof('[CONVERSATION] Ready?'),
      prof('[EXPRESSION_ORALE]…[/EXPRESSION_ORALE]'),
      prof('On en refait une ? [CONVERSATION]'),
    ];

    expect(rangConversation(fil)).toBe(2);
  });

  test('et elle aussi garde son rang pendant le flux', () => {
    const fil = [
      prof('[CONVERSATION] Ready?'),
      prof('[EXPRESSION_ORALE]…[/EXPRESSION_ORALE]'),
    ];

    expect(rangConversation(fil, 'On en refait une ? [CONVERSATION]')).toBe(2);
  });
});

describe('Le clic sur la vitesse parle au professeur', () => {
  /**
   * LE DÉFAUT — Camara, le 18/09/2026 : « j'ai choisi la vitesse, mais la prof
   * n'a pas démarré ».
   *
   * En compréhension orale, le clic ne produit aucun tour, et c'est correct :
   * le passage est déjà écrit, la carte décide seulement du débit. En
   * conversation, j'avais demandé au professeur d'attendre — sans rien lui
   * envoyer. Il attendait un signal qui n'arrivait jamais.
   */
  test('le tour dit explicitement de LANCER la conversation', () => {
    const tour = marquerVitesseChoisie();

    expect(tour).toMatch(/LANCE LA CONVERSATION/);
    expect(tour).toMatch(/à toi de parler en premier/);
  });

  test('il porte une phrase d’élève lisible, pas seulement le marqueur', () => {
    expect(marquerVitesseChoisie()).toMatch(/^C’est bon pour moi\./);
  });

  test('le marqueur ne s’affiche pas dans sa bulle', () => {
    expect(retirerMarqueurConversation(marquerVitesseChoisie()))
      .toBe('C’est bon pour moi.');
  });
});
