/**
 * CE QUE LE TEST DU MICRO SAIT, ET CE QU'IL CONSEILLE — Camara, le 03/11/2026 :
 * il a coupé son micro exprès, et la barre restait plate sans que rien ne soit
 * dit. « Il faut aider le parent. »
 *
 * Pas de React ici : des entrées, des textes, pour que chaque cas soit vérifié.
 *
 * CE QU'UNE PAGE PEUT SAVOIR, ET CE QU'ELLE NE PEUT PAS :
 *   — si un micro est présent, et son nom une fois l'accès donné ;
 *   — si l'accès est refusé, et parfois si c'est le système qui refuse ;
 *   — si un autre logiciel le tient ;
 *   — le niveau du son reçu.
 * Elle ne voit ni le bouton de coupure d'un casque, ni le volume du système : un
 * micro coupé arrive ici comme un silence. D'où « aucun son reçu », suivi de ce
 * qu'il faut vérifier, jamais « votre micro est coupé » affirmé à sa place.
 */

/** Sans son pendant ce temps, on cherche avec le parent ce qui ne va pas. */
export const DELAI_SILENCE_MS = 20000;

/** Au-dessus : quelqu'un a parlé. En dessous du second : aucun son du tout. */
export const SEUIL_VOIX = 0.22;
export const SEUIL_SILENCE = 0.02;

/** Le système et le navigateur, pour dire où cliquer. */
export function lireEnvironnement(userAgent = '', pointsTactiles = 0) {
  const ua = userAgent ?? '';

  let systeme = 'autre';
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && pointsTactiles > 1)) systeme = 'ios';
  else if (/Android/.test(ua)) systeme = 'android';
  else if (/Macintosh|Mac OS X/.test(ua)) systeme = 'mac';
  else if (/Windows/.test(ua)) systeme = 'windows';
  else if (/Linux|CrOS/.test(ua)) systeme = 'linux';

  let navigateur = 'autre';
  if (/Edg(e|A|iOS)?\//.test(ua)) navigateur = 'edge';
  else if (/Firefox|FxiOS/.test(ua)) navigateur = 'firefox';
  else if (/Chrome|CriOS|Chromium/.test(ua)) navigateur = 'chrome';
  else if (/Safari/.test(ua)) navigateur = 'safari';

  return {
    systeme,
    navigateur,
    mobile: systeme === 'ios' || systeme === 'android',
  };
}

/**
 * Le chemin des réglages du système. Les liens ouvrent ces réglages depuis le
 * navigateur, qui demande d'abord confirmation : seuls Windows et Mac en ont.
 */
const REGLAGES = {
  windows: {
    son: 'Paramètres › Système › Son › Entrée : choisissez votre micro, et vérifiez que son volume n’est pas à zéro.',
    droits: 'Paramètres › Confidentialité et sécurité › Microphone : activez l’accès au micro, y compris pour les applications de bureau.',
    lienSon: 'ms-settings:sound',
    lienDroits: 'ms-settings:privacy-microphone',
  },
  mac: {
    son: 'Réglages Système › Son › Entrée : choisissez votre micro, et montez le volume d’entrée.',
    droits: 'Réglages Système › Confidentialité et sécurité › Micro : activez votre navigateur, puis relancez-le.',
    lienSon: 'x-apple.systempreferences:com.apple.preference.sound',
    lienDroits: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
  },
  ios: {
    son: 'Vérifiez qu’aucun casque Bluetooth éteint n’est encore connecté à l’appareil.',
    droits: 'Réglages de l’appareil › votre navigateur (Safari ou Chrome) › Micro : autorisez.',
  },
  android: {
    son: 'Vérifiez qu’aucun casque Bluetooth éteint n’est encore connecté à l’appareil.',
    droits: 'Réglages › Applications › votre navigateur › Autorisations › Micro : autorisez.',
  },
  linux: {
    son: 'Dans les réglages du son, choisissez votre micro en entrée et vérifiez son volume.',
    droits: 'Dans les réglages du système, vérifiez que le navigateur a accès au micro.',
  },
  autre: {
    son: 'Dans les réglages du son de l’appareil, choisissez votre micro en entrée et vérifiez son volume.',
    droits: 'Dans les réglages de l’appareil, vérifiez que le navigateur a accès au micro.',
  },
};

export const reglagesDu = (systeme) => REGLAGES[systeme] ?? REGLAGES.autre;

/**
 * Peut-on montrer du doigt le réglage du site, dans la barre d'adresse ? Sur
 * ordinateur, avec Chrome, Edge ou Firefox : il est à gauche de l'adresse. Safari
 * le range dans son menu, et sur téléphone il n'y a rien à pointer de façon sûre.
 */
export function barreAdresseMontrable({ navigateur, mobile }) {
  return !mobile && ['chrome', 'edge', 'firefox'].includes(navigateur);
}

function etapesAutorisation(env, site) {
  const { navigateur, systeme, mobile } = env;

  if (mobile) return [reglagesDu(systeme).droits, 'Revenez ici, rechargez la page, puis réessayez.'];

  if (navigateur === 'safari') {
    return [
      `Dans le menu Safari, en haut de l’écran : Réglages pour ${site} › Microphone › Autoriser.`,
      'Rechargez la page, puis réessayez.',
    ];
  }

  if (navigateur === 'firefox') {
    return [
      'Cliquez sur l’icône de micro barré, à gauche de l’adresse du site, comme la flèche l’indique.',
      'Retirez le blocage du micro.',
      'Rechargez la page, puis réessayez.',
    ];
  }

  return [
    'Cliquez sur l’icône à gauche de l’adresse du site, comme la flèche l’indique.',
    'Activez « Micro », comme sur le dessin.',
    'Rechargez la page, puis réessayez.',
  ];
}

/**
 * Ce qu'on dit au parent, selon ce qu'on a constaté.
 *
 * @param etat   'refuse', 'refuse-systeme', 'absent', 'occupe', 'debranche',
 *               'silence', 'faible' ou 'indisponible'
 * @param contexte `{ env, site, nomMicro, plusieursMicros }`
 * @returns `{ titre, constats: [{ ok, texte }], etapes: [texte], montrerBarre }`
 */
export function diagnostic(etat, { env, site = 'ce site', nomMicro = '', plusieursMicros = false }) {
  const reglages = reglagesDu(env.systeme);
  const micro = nomMicro ? `« ${nomMicro} »` : 'votre micro';
  const montrable = barreAdresseMontrable(env);

  switch (etat) {
    case 'refuse':
      return {
        titre: 'L’accès au micro est bloqué',
        constats: [{ ok: false, texte: 'Le navigateur n’a pas le droit d’utiliser le micro sur ce site.' }],
        etapes: etapesAutorisation(env, site),
        montrerBarre: montrable,
      };

    case 'refuse-systeme':
      return {
        titre: 'C’est l’ordinateur qui bloque le micro',
        constats: [
          { ok: false, texte: 'Le système refuse le micro à votre navigateur, même si ce site y a droit.' },
        ],
        etapes: [reglages.droits, 'Rechargez la page, puis réessayez.'],
        lien: reglages.lienDroits
          ? { adresse: reglages.lienDroits, texte: 'Ouvrir ce réglage' }
          : null,
        montrerBarre: false,
      };

    case 'absent':
      return {
        titre: 'Je ne détecte aucun micro',
        constats: [{ ok: false, texte: 'Aucun micro n’est visible sur cet appareil.' }],
        etapes: [
          'Branchez un micro, ou un casque qui en a un. Sur ordinateur fixe, il n’y en a souvent aucun d’origine.',
          'En USB, essayez un autre port. En Bluetooth, vérifiez que le casque est allumé et connecté.',
          reglages.son,
        ],
        lien: reglages.lienSon ? { adresse: reglages.lienSon, texte: 'Ouvrir les réglages du son' } : null,
        montrerBarre: false,
      };

    case 'debranche':
      return {
        titre: 'Le micro vient de se débrancher',
        constats: [{ ok: false, texte: `Je ne reçois plus rien de ${micro}.` }],
        etapes: ['Rebranchez-le, ou rallumez votre casque : le test reprend tout seul dès qu’il revient.'],
        montrerBarre: false,
      };

    case 'occupe':
      return {
        titre: 'Le micro ne répond pas',
        constats: [{ ok: false, texte: 'Le micro est présent, mais il ne s’ouvre pas. Un autre logiciel le tient sans doute.' }],
        etapes: [
          'Fermez les logiciels qui peuvent s’en servir : Zoom, Teams, Discord, un autre onglet en visioconférence.',
          'Débranchez et rebranchez le micro.',
          reglages.son,
        ],
        lien: reglages.lienSon ? { adresse: reglages.lienSon, texte: 'Ouvrir les réglages du son' } : null,
        montrerBarre: false,
      };

    case 'silence':
      return {
        titre: 'Aucun son n’arrive',
        constats: [
          { ok: true, texte: `Micro détecté : ${micro}.` },
          { ok: true, texte: 'Le navigateur a bien accès au micro.' },
          { ok: false, texte: `Mais aucun son n’arrive depuis ${DELAI_SILENCE_MS / 1000} secondes.` },
        ],
        etapes: [
          'Le micro est peut-être coupé : vérifiez le bouton sur le micro ou sur le fil du casque, et la touche micro du clavier.',
          'Vérifiez le branchement : le câble ou la prise USB, ou la connexion Bluetooth.',
          reglages.son,
          ...(plusieursMicros ? ['Ce n’est peut-être pas le bon micro : essayez-en un autre dans la liste.'] : []),
        ],
        lien: reglages.lienSon ? { adresse: reglages.lienSon, texte: 'Ouvrir les réglages du son' } : null,

        // L'ACCÈS EST BON, IL N'Y A RIEN À FAIRE DANS LA BARRE D'ADRESSE — Camara, le
        // 03/11/2026 : la pastille « C'est ici » n'a de sens que si c'est là qu'il faut
        // agir, donc quand l'accès est refusé.
        montrerBarre: false,
      };

    case 'faible':
      return {
        titre: 'Je vous entends à peine',
        constats: [
          { ok: true, texte: `Micro détecté : ${micro}.` },
          { ok: true, texte: 'Le navigateur a bien accès au micro.' },
          { ok: false, texte: 'Un son très faible arrive, mais pas assez pour comprendre votre enfant.' },
        ],
        etapes: [
          'Rapprochez-vous du micro, et parlez à voix normale.',
          reglages.son,
          ...(plusieursMicros ? ['Ce n’est peut-être pas le bon micro : essayez-en un autre dans la liste.'] : []),
        ],
        lien: reglages.lienSon ? { adresse: reglages.lienSon, texte: 'Ouvrir les réglages du son' } : null,
        montrerBarre: false,
      };

    default:
      return {
        titre: 'Ce navigateur ne donne pas accès au micro',
        constats: [{ ok: false, texte: 'Le navigateur ne propose pas l’accès au micro sur cette page.' }],
        etapes: ['Essayez avec une version récente de Chrome, Edge ou Safari.'],
        montrerBarre: false,
      };
  }
}

/**
 * L'erreur du navigateur, traduite en état.
 *
 * CHROME DIT QUI REFUSE, ET LA RÉPONSE CHANGE TOUT : « Permission denied by
 * system » renvoie aux réglages de l'ordinateur ; la barre d'adresse n'y peut rien.
 */
export function etatDeLErreur(erreur) {
  switch (erreur?.name) {
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'absent';
    case 'NotReadableError':
    case 'AbortError':
      return 'occupe';
    case 'NotAllowedError':
    case 'SecurityError':
      return /system/i.test(erreur?.message ?? '') ? 'refuse-systeme' : 'refuse';
    default:
      return 'indisponible';
  }
}

/** Ce que vaut un test resté sans voix : rien du tout, ou un son trop faible. */
export const etatDuSilence = (crete) => (crete < SEUIL_SILENCE ? 'silence' : 'faible');

/** Le niveau affiché, de 0 à 1 : la racine écrase les écarts, une voix posée se voit. */
export function niveauDe(echantillons) {
  if (!echantillons?.length) return 0;

  let somme = 0;
  for (let i = 0; i < echantillons.length; i += 1) somme += echantillons[i] * echantillons[i];

  return Math.min(1, Math.sqrt(Math.sqrt(somme / echantillons.length)) * 1.2);
}
