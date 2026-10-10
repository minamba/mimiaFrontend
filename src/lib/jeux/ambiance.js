import { useCallback, useEffect, useRef, useState } from 'react';
import sonFinDuTemps from '../../assets/sons/time_end.mp3';

/**
 * L'AMBIANCE SONORE DES ESCAPE GAMES — Camara, le 09/10/2026 : « un son
 * d'ambiance selon le thème de chaque escape game, qui boucle sans qu'on
 * entende de coupure » ; des bruits naturels, sans instrument ni paroles.
 *
 * UNE BOUCLE DE 30 SECONDES PAR HISTOIRE, mixée à partir de 2 ou 3 sons
 * ElevenLabs (vagues et mouettes pour le phare, ronronnement des serveurs pour
 * le serveur piraté…), dans `public/sons/ambiances/<clé>-<classe>.mp3`.
 *
 * SANS LE MOINDRE BLANC À LA JOINTURE. Un `<audio loop>` laisse un silence à
 * chaque tour (le temps de recharger, et les quelques millisecondes de vide
 * que tout MP3 porte à ses deux bouts). On décode donc le son une fois, on
 * retire ces bouts muets, et Web Audio le reboucle à l'échantillon près.
 *
 * DISCRÈTE : elle reste sous la voix, et descend encore pendant que le
 * professeur parle (signal `mimia:voix-jeu` de `useVoixJeu`). Un fichier
 * absent laisse le jeu silencieux, sans erreur.
 */
const CLE_COUPEE = 'mimia.jeux.ambianceCoupee';
// Le 09/10/2026 : le fichier est mixé à -22 dB ; à 0,55 c'était « trop fort »
// (Camara), puis « baisse encore » trois fois : 0,08 sous le jeu, 0,03 pendant que le professeur parle.
const VOLUME = 0.08;
const VOLUME_SOUS_LA_VOIX = 0.03;

function lireCoupee() {
  try {
    return window.localStorage.getItem(CLE_COUPEE) === '1';
  } catch {
    return false;
  }
}

function ecrireCoupee(valeur) {
  try {
    window.localStorage.setItem(CLE_COUPEE, valeur ? '1' : '0');
  } catch { /* sans stockage, le choix vaut pour la partie en cours */ }
}

/**
 * L'adresse de l'ambiance d'une histoire — ou d'un jeu bonus (10/10/2026) :
 * sans classe, un seul son par jeu, `<clé>.mp3`.
 */
export function adresseAmbiance(cle, classe) {
  const nom = classe === undefined ? cle : `${cle}-${String(classe).toLowerCase()}`;
  return `${process.env.PUBLIC_URL || ''}/sons/ambiances/${nom}.mp3`;
}

/** Les bornes de la boucle : on saute le vide que le MP3 ajoute à ses deux bouts. */
export function bornesDeBoucle(donnees, frequence) {
  const seuil = 1e-4;
  let debut = 0;
  while (debut < donnees.length && Math.abs(donnees[debut]) < seuil) debut += 1;
  let fin = donnees.length - 1;
  while (fin > debut && Math.abs(donnees[fin]) < seuil) fin -= 1;
  return { debut: debut / frequence, fin: (fin + 1) / frequence };
}

let contexte = null;
/** Le moteur Web Audio de la page, partagé avec les bruitages (`bruitages.js`). */
export function moteur() {
  if (contexte) return contexte;
  const Classe = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Classe) return null;
  try {
    contexte = new Classe();
  } catch {
    contexte = null;
  }
  return contexte;
}

/**
 * LA MUSIQUE DE LA DERNIÈRE MINUTE — Camara, le 09/10/2026 : « quand il reste
 * une minute, le son d'ambiance s'éteint et time_end.mp3 prend place ».
 *
 * UNE MUSIQUE DE SUSPENSE QUI MONTE, et dont le sommet tombe sur le zéro : le
 * fichier dure 1 min 37, sa musique s'arrête à 95,6 s (le reste est un blanc).
 * On la prend donc là où il lui reste exactement ce qui reste au chrono.
 *
 * UN `<audio>` BRANCHÉ SUR WEB AUDIO, et non un son décodé : une minute et
 * demie de musique décodée pèserait plus de 30 Mo en mémoire. Le gain passe
 * par Web Audio, parce que l'iPhone ignore le volume d'un `<audio>`.
 *
 * Elle suit le bouton « Ambiance » : couper l'ambiance la coupe aussi. Elle
 * descend sous la voix du professeur, comme l'ambiance.
 */
const FIN_DE_LA_MUSIQUE = 95.6;
const MUSIQUE = 0.15;
const MUSIQUE_SOUS_LA_VOIX = 0.06;
export const DERNIERE_MINUTE_MS = 60000;

/**
 * Joue l'ambiance tant que le composant est monté. Rend l'état « coupée » et
 * de quoi la couper ou la remettre ; le choix est retenu par ce navigateur.
 *
 * `finale` : la dernière minute du chrono est entamée (et la partie n'est pas
 * gagnée). L'ambiance s'efface alors devant la musique de fin ; `resteMs`
 * dit où prendre cette musique pour que son sommet tombe sur le zéro.
 */
export default function useAmbiance(url, { finale = false, resteMs = DERNIERE_MINUTE_MS } = {}) {
  const [coupee, setCoupee] = useState(lireCoupee);
  // Le son est-il là ? Un jeu bonus n'affiche son bouton qu'une fois le fichier chargé.
  const [disponible, setDisponible] = useState(false);
  // L'adresse dont le fichier manque (10/10/2026) : un jeu à une ambiance PAR
  // IMAGE s'en sert pour retomber sur l'ambiance du jeu quand l'image n'a pas la sienne.
  const [absente, setAbsente] = useState(null);
  const gain = useRef(null);
  const parle = useRef(false);
  const musique = useRef(null);
  const reste = useRef(resteMs);
  reste.current = resteMs;
  const enFinale = useRef(finale);
  enFinale.current = finale;

  const cible = useCallback(() => {
    if (coupee || enFinale.current) return 0;
    return parle.current ? VOLUME_SOUS_LA_VOIX : VOLUME;
  }, [coupee]);

  const cibleMusique = useCallback(() => {
    if (coupee || !enFinale.current) return 0;
    return parle.current ? MUSIQUE_SOUS_LA_VOIX : MUSIQUE;
  }, [coupee]);

  useEffect(() => {
    const ctx = moteur();
    if (!ctx || !url) return undefined;
    let fini = false;
    let source = null;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(ctx.destination);
    gain.current = g;

    fetch(url)
      .then((r) => {
        if (!r.ok || (r.headers.get('content-type') || '').includes('text/html')) throw new Error('absent');
        return r.arrayBuffer();
      })
      .then((octets) => new Promise((ok, ko) => {
        const p = ctx.decodeAudioData(octets, ok, ko);
        if (p && typeof p.catch === 'function') p.catch(ko);
      }))
      .then((tampon) => {
        if (fini) return;
        setDisponible(true);
        const { debut, fin } = bornesDeBoucle(tampon.getChannelData(0), tampon.sampleRate);
        source = ctx.createBufferSource();
        source.buffer = tampon;
        source.loop = true;
        source.loopStart = debut;
        source.loopEnd = fin;
        source.connect(g);
        source.start(0, debut);
        // UN MOTEUR ENDORMI se réveille au premier geste : le navigateur peut
        // refuser de jouer un son qu'aucun clic n'a précédé.
        if (ctx.state !== 'running') {
          ctx.resume?.().catch?.(() => {});
          const reveil = () => { ctx.resume?.().catch?.(() => {}); };
          window.addEventListener('pointerdown', reveil, { once: true });
        }
        console.info(`Ambiance : lecture de ${url} (moteur ${ctx.state}, boucle ${debut.toFixed(3)}–${fin.toFixed(3)} s)`);
        // Une entrée en fondu de deux secondes : l'ambiance arrive, elle ne surgit pas.
        g.gain.setTargetAtTime(cible(), ctx.currentTime, 0.7);
      })
      // Pas d'ambiance pour cette histoire : le jeu reste silencieux, et la console le dit.
      .catch((e) => {
        console.info(`Ambiance : aucune pour ${url} (${e?.message ?? e})`);
        if (!fini) setAbsente(url);
      });

    return () => {
      fini = true;
      // Une sortie en fondu, puis on arrête la source.
      try {
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        source?.stop(ctx.currentTime + 0.8);
      } catch { /* déjà arrêtée */ }
      setTimeout(() => { try { g.disconnect(); } catch { /* déjà déconnecté */ } }, 1000);
      gain.current = null;
    };
    // `cible` est relue au démarrage seulement : ses changements passent par l'effet suivant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // La musique de fin est préparée dès l'ouverture de la partie : à la dernière
  // minute, elle part sans attendre son téléchargement.
  useEffect(() => {
    const ctx = moteur();
    if (!ctx || !url || typeof Audio === 'undefined') return undefined;
    const audio = new Audio(sonFinDuTemps);
    audio.preload = 'auto';
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(ctx.destination);
    try {
      ctx.createMediaElementSource(audio).connect(g);
    } catch {
      return undefined;
    }
    musique.current = { audio, gain: g };
    return () => {
      audio.pause();
      try { g.disconnect(); } catch { /* déjà déconnecté */ }
      musique.current = null;
    };
  }, [url]);

  // La dernière minute commence ou s'achève (gagnée, ou chrono à zéro).
  useEffect(() => {
    const ctx = moteur();
    const m = musique.current;
    if (!ctx || !m) return undefined;
    if (finale) {
      m.audio.currentTime = Math.max(0, FIN_DE_LA_MUSIQUE - reste.current / 1000);
      m.audio.play()?.catch?.(() => {});
      return undefined;
    }
    // Hors de la dernière minute, la musique se tait : un fondu, puis la pause.
    const id = setTimeout(() => m.audio.pause(), 1500);
    return () => clearTimeout(id);
  }, [finale]);

  // Couper, remettre, baisser sous la voix, passer à la musique : un fondu court à chaque fois.
  useEffect(() => {
    const ctx = moteur();
    const appliquer = () => {
      if (!ctx) return;
      gain.current?.gain.setTargetAtTime(cible(), ctx.currentTime, enFinale.current ? 0.6 : 0.25);
      musique.current?.gain.gain.setTargetAtTime(cibleMusique(), ctx.currentTime, 0.4);
    };
    appliquer();
    const surVoix = (e) => {
      parle.current = Boolean(e?.detail?.parle);
      appliquer();
    };
    window.addEventListener('mimia:voix-jeu', surVoix);
    return () => window.removeEventListener('mimia:voix-jeu', surVoix);
  }, [cible, cibleMusique, finale]);

  const basculer = useCallback(() => {
    setCoupee((avant) => {
      ecrireCoupee(!avant);
      return !avant;
    });
  }, []);

  return {
    coupee, basculer, disponible, absente,
  };
}
