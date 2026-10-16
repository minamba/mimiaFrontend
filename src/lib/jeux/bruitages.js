import sonBonne from '../../assets/sons/good.mp3';
import sonMauvaise from '../../assets/sons/bad.mp3';
import sonSurvol from '../../assets/sons/passage_sur_carte.mp3';
import sonSelection from '../../assets/sons/select.mp3';
import sonRetour from '../../assets/sons/return.mp3';
import sonFinDuDefi from '../../assets/sons/game_over.mp3';
import sonFerme from '../../assets/sons/close.mp3';
import sonRetourneCarte from '../../assets/sons/return_card.mp3';
import sonGlisseCarte from '../../assets/sons/card_swipe.mp3';
import { moteur } from './ambiance.js';

/**
 * LES BRUITAGES DES JEUX — Camara, le 09/10/2026 : « quand l'enfant donne une
 * bonne réponse, good.mp3 ; une mauvaise, bad.mp3 », et un petit son quand la
 * souris passe sur une carte de « Mes jeux ».
 *
 * DÉCODÉS UNE FOIS, JOUÉS PAR WEB AUDIO : un `<audio>` neuf à chaque réponse
 * part avec un retard qu'on entend, alors que le bruitage doit tomber pile sur
 * le clic. Le moteur est celui de l'ambiance (`ambiance.js`), un seul par page.
 *
 * SILENCIEUX SANS MOTEUR (tests, vieux navigateur) et tant que le navigateur
 * n'a pas vu de geste : le survol seul ne suffit pas à réveiller le son, il
 * faut un premier clic sur la page.
 */
const SONS = {
  bonne: { url: sonBonne, volume: 0.5 },
  mauvaise: { url: sonMauvaise, volume: 0.5 },
  // Le 09/10/2026 : 0,8 au départ, puis « baisse le son » deux fois (Camara).
  survol: { url: sonSurvol, volume: 0.2 },
  // Le clic qui choisit une classe, un jeu ou un mode (09/10/2026). Le fichier
  // est 16 dB plus fort que celui du survol : on part plus bas que les réponses.
  selection: { url: sonSelection, volume: 0.3 },
  // « Revenir aux jeux » (09/10/2026) : un fichier au niveau de select.mp3, même réglage.
  retour: { url: sonRetour, volume: 0.3 },
  // Le défi perdu, cœurs ou temps épuisés (09/10/2026) : au niveau de good/bad.
  finDuDefi: { url: sonFinDuDefi, volume: 0.5 },
  // Le portail d'une classe encore fermée (14/10/2026) : un clic, comme le
  // choix d'une classe, au même réglage que select.mp3.
  ferme: { url: sonFerme, volume: 0.3 },
  // Les flash cards de « Me tester » (16/10/2026) : la carte qui se retourne, et
  // celle qui s'en va quand on passe à la suivante. Fichiers bien plus faibles que
  // good.mp3 (-43 et -41 dB de moyenne contre -19) : volumes de départ plus hauts.
  retourneCarte: { url: sonRetourneCarte, volume: 0.5 },
  glisseCarte: { url: sonGlisseCarte, volume: 0.9 },
};

const tampons = new Map();

function charger(ctx, nom) {
  if (!tampons.has(nom)) {
    const promesse = fetch(SONS[nom].url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('absent'))))
      .then((octets) => new Promise((ok, ko) => {
        const p = ctx.decodeAudioData(octets, ok, ko);
        if (p && typeof p.catch === 'function') p.catch(ko);
      }))
      .catch(() => null);
    tampons.set(nom, promesse);
  }
  return tampons.get(nom);
}

/**
 * À L'ARRIVÉE SUR « MES JEUX » : les sons sont décodés d'avance, et le moteur
 * réveillé tout de suite si la page a déjà vu un clic (l'enfant y est venu en
 * cliquant), sinon au premier geste. Sans cela, la première réponse tomberait
 * pendant le réveil, en silence.
 */
export function prechargerBruitages() {
  const ctx = moteur();
  if (!ctx) return;
  Object.keys(SONS).forEach((nom) => charger(ctx, nom));
  const reveiller = () => { if (ctx.state !== 'running') ctx.resume?.()?.catch?.(() => {}); };
  reveiller();
  window.addEventListener('pointerdown', reveiller, { once: true });
  window.addEventListener('keydown', reveiller, { once: true });
}

// Le survol précédent s'arrête quand la souris file de carte en carte :
// les sons ne s'empilent pas.
let survolEnCours = null;

/** Joue un bruitage : 'bonne', 'mauvaise', 'survol', 'selection', 'retour', 'finDuDefi', 'ferme', 'retourneCarte' ou 'glisseCarte'. */
// `volume` (16/10/2026) : remplace le volume du son pour cet appel — « Me tester »
// joue ses réponses plus bas que les jeux.
export function bruitage(nom, volume = null) {
  const son = SONS[nom];
  const ctx = son ? moteur() : null;
  if (!ctx) return;
  if (ctx.state !== 'running') ctx.resume?.()?.catch?.(() => {});
  charger(ctx, nom).then((tampon) => {
    if (!tampon || ctx.state !== 'running') return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume ?? son.volume;
    source.buffer = tampon;
    source.connect(gain);
    gain.connect(ctx.destination);
    if (nom === 'survol') {
      try { survolEnCours?.stop(); } catch { /* déjà fini */ }
      survolEnCours = source;
    }
    source.start();
  });
}
