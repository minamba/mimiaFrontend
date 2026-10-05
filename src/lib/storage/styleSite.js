import { appliquerTheme, themeEnregistre } from './theme';

/**
 * LE STYLE DU SITE : « Blue Sky » ou le sombre d'origine.
 *
 * Voulu par Camara le 15/09/2026 : le style de la page de maintenance (fond
 * bleu de marque, verre dépoli, accents corail) étendu à tout le site, pour le
 * faire tester — et pouvoir revenir à l'ancien quand il le veut.
 *
 * DÉCIDÉ PAR L'ADMINISTRATION, POUR TOUS LES VISITEURS : c'est le réglage
 * `BLUE_SKY`, lu avec les autres drapeaux publics (voir `modeTest.js`). Il pose
 * `data-da="blue-sky"` sur <html>, et App.css habille tout ce qui suit.
 *
 * MÉMORISÉ SUR L'APPAREIL, MAIS SEULEMENT POUR LE PREMIER AFFICHAGE.
 * `public/index.html` relit cette mémoire avant le CSS : sans elle, chaque
 * chargement montrerait l'ancien style une fraction de seconde, le temps que
 * les réglages reviennent du serveur. C'est toujours le serveur qui a le
 * dernier mot.
 *
 * BLUE SKY IMPOSE LE SOMBRE. Ses couleurs sont faites pour le bleu de marque,
 * et les règles propres au thème clair y poseraient des fonds blancs. Le choix
 * du parent n'est pas perdu : il reprend dès que le mode s'éteint.
 */
const CLE = 'mimia_style';

export const BLUE_SKY = 'blue-sky';

/**
 * LES DÉCLINAISONS DE BLUE SKY — Camara, le 29/09/2026 : « plusieurs modes de
 * design dans la même carte que Blue Sky » — soldes d'été, soldes d'hiver,
 * French Days, Black Friday. Chacune garde la structure de Blue Sky (verre,
 * cartes, halos) et change sa palette et son fond : App.css les habille sous
 * `:root[data-da='blue-sky'][data-saison='…']`. Aucune n'existe sans Blue Sky.
 *
 * L'ordre est celui de l'écran d'administration.
 */
export const SAISONS = [
  { cle: 'soldes-ete', libelle: 'Soldes d’été' },
  { cle: 'soldes-hiver', libelle: 'Soldes d’hiver' },
  { cle: 'french-days', libelle: 'French Days' },
  { cle: 'black-friday', libelle: 'Black Friday' },
  // Ajoutée le 29/09/2026, oubliée de la première liste par Camara.
  { cle: 'back-to-school', libelle: 'Back to School' },
];

const CLE_SAISON = 'mimia_saison';

/** Une déclinaison connue, ou null — une valeur inconnue ne pose rien. */
export function saisonValide(saison) {
  return SAISONS.some((s) => s.cle === saison) ? saison : null;
}

/** La dernière déclinaison connue sur cet appareil. */
export function saisonEnregistree() {
  try {
    return saisonValide(window.localStorage.getItem(CLE_SAISON));
  } catch {
    return null;
  }
}

/** Le dernier style connu sur cet appareil. */
export function blueSkyEnregistre() {
  try {
    return window.localStorage.getItem(CLE) === BLUE_SKY;
  } catch {
    return false;
  }
}

/**
 * Applique le style décidé par le serveur, et le retient pour le prochain
 * chargement. La déclinaison ne vaut qu'avec Blue Sky : éteint, elle tombe.
 */
export function appliquerBlueSky(actif, saison = null) {
  const racine = document.documentElement;
  const declinaison = actif ? saisonValide(saison) : null;

  if (actif) {
    racine.setAttribute('data-da', BLUE_SKY);
  } else {
    racine.removeAttribute('data-da');
  }

  if (declinaison) {
    racine.setAttribute('data-saison', declinaison);
  } else {
    racine.removeAttribute('data-saison');
  }

  // APRÈS l'attribut : `appliquerTheme` le lit pour savoir s'il doit imposer
  // le sombre, ou rendre au parent le thème qu'il avait choisi.
  appliquerTheme(themeEnregistre());

  try {
    if (actif) window.localStorage.setItem(CLE, BLUE_SKY);
    else window.localStorage.removeItem(CLE);

    if (declinaison) window.localStorage.setItem(CLE_SAISON, declinaison);
    else window.localStorage.removeItem(CLE_SAISON);
  } catch {
    // Le style s'applique quand même pour cette visite.
  }
}
