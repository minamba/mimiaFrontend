/**
 * RECONNAÎTRE UN IPHONE, POUR UNE SEULE RAISON.
 *
 * Le mode silencieux d'iOS coupe le son du navigateur SANS RIEN AFFICHER dans
 * la page : pas d'icône, pas d'erreur, aucun état lisible en JavaScript. Le
 * professeur parle, le micro marche, le graphe audio tourne — et l'élève
 * n'entend rien.
 *
 * Le 04/09/2026, ce symptôme a coûté une demi-heure de diagnostic : il
 * ressemblait trait pour trait à une panne de lecture audio. D'où
 * l'avertissement dans la popup d'entrée en cours, et d'où cette détection.
 *
 * DEUX ERREURS SYMÉTRIQUES À ÉVITER, ET LES TESTS SONT ÉCRITS POUR ELLES :
 *
 *   1. RATER UN IPHONE. L'avertissement manque, et le prochain élève qui a
 *      son téléphone en silence croit que le produit ne marche pas. Le cas
 *      piège n'est pas Safari — c'est Chrome et Firefox sur iOS, obligés
 *      d'utiliser WebKit, donc soumis au même interrupteur. Et l'iPad, qui
 *      depuis iPadOS 13 se présente comme un Mac.
 *
 *   2. PRENDRE UN ANDROID POUR UN IPHONE. On l'envoie chercher un bouton qui
 *      n'existe pas sur son appareil, et il doute du reste de ce qu'on lui
 *      dit.
 */

import { estIOS } from '../lib/storage/appareil';

/**
 * Remplace l'identification du navigateur le temps d'un test.
 *
 * `navigator.userAgent` est en lecture seule : on redéfinit la propriété
 * plutôt que de l'affecter, et on la restaure après — sans quoi le premier
 * test contaminerait tous les suivants.
 */
function avec(identification, tactile = 0, verifier) {
  const uaOrigine = Object.getOwnPropertyDescriptor(navigator, 'userAgent');
  const tactileOrigine = Object.getOwnPropertyDescriptor(navigator, 'maxTouchPoints');

  Object.defineProperty(navigator, 'userAgent', {
    value: identification, configurable: true,
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: tactile, configurable: true,
  });

  try {
    verifier();
  } finally {
    if (uaOrigine) Object.defineProperty(navigator, 'userAgent', uaOrigine);
    if (tactileOrigine) Object.defineProperty(navigator, 'maxTouchPoints', tactileOrigine);
  }
}

// ------------------------------------------------------ ce qui est un iOS

test('un iPhone sous Safari est reconnu', () => {
  avec(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    5,
    () => expect(estIOS()).toBe(true),
  );
});

test('un iPhone sous CHROME est reconnu aussi', () => {
  // LE CAS QU'ON RATE EN CHERCHANT « SAFARI ». Chrome sur iOS est obligé
  // d'utiliser WebKit : même moteur audio, même interrupteur de silence.
  avec(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1',
    5,
    () => expect(estIOS()).toBe(true),
  );
});

test('un iPad moderne, qui se fait passer pour un Mac, est reconnu', () => {
  // Depuis iPadOS 13, l'iPad annonce « Macintosh » pour recevoir les versions
  // de bureau des sites. Le seul écart observable est l'écran tactile.
  avec(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    5,
    () => expect(estIOS()).toBe(true),
  );
});

// --------------------------------------------------- ce qui n'en est pas

test('un Android n’est pas envoyé chercher un bouton qui n’existe pas', () => {
  avec(
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/126.0.0.0 Mobile Safari/537.36',
    5,
    () => expect(estIOS()).toBe(false),
  );
});

test('un vrai Mac n’est pas pris pour un iPad', () => {
  // La même identification que l'iPad, à ceci près qu'aucun Mac ne déclare
  // d'écran tactile. C'est tout ce qui les sépare.
  avec(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    0,
    () => expect(estIOS()).toBe(false),
  );
});

test('un PC sous Windows n’est pas concerné', () => {
  avec(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/126.0.0.0 Safari/537.36',
    0,
    () => expect(estIOS()).toBe(false),
  );
});
