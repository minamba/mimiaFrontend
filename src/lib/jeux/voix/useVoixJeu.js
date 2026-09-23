import { useCallback, useEffect, useRef, useState } from 'react';
import { PROFESSEUR_PAR_MATIERE } from './repliques';

/**
 * LA VOIX D'UN JEU — commune à tous, présents et à venir.
 *
 * Un jeu n'a qu'une chose à faire : `dire(replique)` — ou `dire([a, b, c])`
 * pour une suite — au bon moment. Le reste est ici : le professeur de la
 * matière, l'adresse de l'enregistrement, la phrase précédente coupée quand
 * la suivante commence, la voix coupée à la demande, et le silence quand le
 * jeu se ferme.
 *
 * RIEN N'EST SYNTHÉTISÉ À LA VOLÉE : chaque phrase est un fichier enregistré
 * une fois par `scripts/voix-jeux.mjs`. Jouer ne coûte rien.
 *
 * UNE PHRASE QUI NE SE JOUE PAS N'EST PAS UNE PANNE. Fichier absent, son
 * bloqué par le navigateur, haut-parleur coupé : le texte reste à l'écran, et
 * le jeu continue. On n'affiche aucune erreur à un enfant de six ans pour un
 * son qui n'est pas venu.
 *
 * LES SUITES SE JOUENT PAR LE MOTEUR AUDIO DU NAVIGATEUR, pas par des lecteurs
 * enchaînés — Camara, le 21/09/2026 : « parfois la professeure dit les heures
 * en mode haché ». Avec un lecteur par fichier, chaque heure n'était
 * téléchargée qu'au moment de la dire : entre deux heures s'ajoutaient la fin
 * de l'une, le début de l'autre et un temps de chargement qui changeait d'une
 * fois à l'autre. Désormais tous les sons d'une suite sont chargés AVANT le
 * premier mot, leurs silences de bord sont coupés, et chacun est programmé à
 * l'instant exact où le précédent finit, plus un silence choisi. Le
 * navigateur qui n'a pas ce moteur — et l'environnement des tests — garde
 * l'ancien enchaînement.
 */

const CLE_MUET = 'mimia.jeux.voixCoupee';

/** Le silence entre deux phrases d'une suite, en secondes. */
const SILENCE_ENTRE = 0.28;

/** Le seuil sous lequel un échantillon de bord compte comme silence, relatif au pic. */
const SEUIL_SILENCE = 0.02;

// Le choix de couper la voix est un confort de ce navigateur-là, pas une
// donnée : il peut disparaître (navigation privée, stockage vidé), et le jeu
// parle alors, comme par défaut.
function lireMuet() {
  try {
    return window.localStorage.getItem(CLE_MUET) === '1';
  } catch {
    return false;
  }
}

function ecrireMuet(valeur) {
  try {
    window.localStorage.setItem(CLE_MUET, valeur ? '1' : '0');
  } catch { /* sans stockage, le choix vaut pour la partie en cours */ }
}

/** L'adresse d'un enregistrement — sous /sons/, jamais /voix/, qui est une route de l'API. */
export function adresseReplique(professeur, cle) {
  return `${process.env.PUBLIC_URL || ''}/sons/jeux/${professeur}/${cle}.mp3`;
}

// ---------------------------------------------------------- le moteur audio

let contexte = null;
const tampons = new Map();

function moteur() {
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
 * Un son décodé, et sa partie parlée : les silences de début et de fin, que
 * l'encodage MP3 allonge encore, ne sont jamais joués. Le résultat est gardé
 * pour la partie : une heure lue deux fois n'est chargée qu'une.
 */
function charger(ctx, url) {
  if (!tampons.has(url)) {
    const promesse = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        // UN FICHIER ABSENT NE RÉPOND PAS 404 EN DÉVELOPPEMENT : le serveur
        // renvoie la page de l'application. On ne tente pas de la décoder.
        if ((r.headers.get('content-type') || '').includes('text/html')) throw new Error('absent');
        return r.arrayBuffer();
      })
      // CHROME RENVOIE AUSSI UNE PROMESSE quand on passe des rappels : rejetée
      // sans que personne ne l'écoute, elle faisait tomber la page entière
      // (« Unable to decode audio data »). On l'écoute, en plus des rappels
      // qui servent aux navigateurs plus anciens.
      .then((octets) => new Promise((ok, ko) => {
        const p = ctx.decodeAudioData(octets, ok, ko);
        if (p && typeof p.catch === 'function') p.catch(ko);
      }))
      .then((tampon) => {
        const d = tampon.getChannelData(0);
        let pic = 0;
        for (let i = 0; i < d.length; i += 1) pic = Math.max(pic, Math.abs(d[i]));
        const seuil = pic * SEUIL_SILENCE;
        let debut = 0;
        while (debut < d.length && Math.abs(d[debut]) < seuil) debut += 1;
        let fin = d.length - 1;
        while (fin > debut && Math.abs(d[fin]) < seuil) fin -= 1;
        // Une marge de 20 ms de part et d'autre : on coupe le silence, jamais
        // l'attaque ni la fin d'un mot.
        const marge = Math.round(tampon.sampleRate * 0.02);
        const a = Math.max(0, debut - marge);
        const b = Math.min(d.length, fin + marge);
        return { tampon, debut: a / tampon.sampleRate, duree: (b - a) / tampon.sampleRate };
      });
    promesse.catch(() => tampons.delete(url));
    tampons.set(url, promesse);
  }
  return tampons.get(url);
}

export default function useVoixJeu(matiereCode) {
  const professeur = PROFESSEUR_PAR_MATIERE[matiereCode] ?? null;
  const [muet, setMuet] = useState(lireMuet);

  // LA PHRASE EN TRAIN D'ÊTRE DITE, par sa clé. Un écran s'en sert pour
  // éclairer ce que la voix désigne : quand Nora lit les quatre réponses de
  // l'horloge, le bouton qu'elle nomme s'allume au même moment. C'est ce qui
  // relie, pour un enfant qui ne lit pas encore, le mot entendu au bouton.
  const [enCours, setEnCours] = useState(null);

  // Chaque nouvelle lecture prend un jeton ; une suite dont le jeton n'est
  // plus le bon s'arrête d'elle-même. C'est ce qui coupe la lecture des
  // réponses dès que l'enfant en touche une.
  const jeton = useRef(0);

  // Ce qui joue en ce moment : lecteurs, sons programmés et minuteries.
  const enVol = useRef({ lecteur: null, sources: [], minuteries: [] });

  // Lu par `dire` à travers une référence : ainsi `dire` ne change jamais
  // d'identité quand on coupe la voix, et un écran qui fait parler sa
  // consigne à chaque manche ne la redit pas au moment où l'on coupe.
  const muetRef = useRef(muet);
  muetRef.current = muet;

  const arreter = useCallback(() => {
    jeton.current += 1;
    setEnCours(null);
    const { lecteur, sources, minuteries } = enVol.current;
    enVol.current = { lecteur: null, sources: [], minuteries: [] };
    minuteries.forEach(clearTimeout);
    sources.forEach((s) => { try { s.stop(); } catch { /* déjà fini */ } });
    if (lecteur) { try { lecteur.pause(); } catch { /* déjà arrêté */ } }
  }, []);

  /** L'enchaînement de secours : un lecteur par fichier, l'un après l'autre. */
  const jouerParLecteurs = useCallback((cles, mien) => {
    const suivante = (i) => {
      if (jeton.current !== mien) return;
      if (i >= cles.length) {
        enVol.current.lecteur = null;
        setEnCours(null);
        return;
      }

      const audio = new Audio(adresseReplique(professeur, cles[i]));
      enVol.current.lecteur = audio;
      setEnCours(cles[i]);

      const apres = () => {
        if (i + 1 >= cles.length) suivante(i + 1);
        else enVol.current.minuteries.push(setTimeout(() => suivante(i + 1), SILENCE_ENTRE * 1000));
      };
      audio.addEventListener('ended', apres, { once: true });
      audio.addEventListener('error', apres, { once: true });

      try {
        const promesse = audio.play();
        if (promesse && typeof promesse.catch === 'function') {
          promesse.catch(() => { if (jeton.current === mien) setEnCours(null); });
        }
      } catch { /* voir la note du module : le texte reste à l'écran */ }
    };

    suivante(0);
  }, [professeur]);

  /** L'enchaînement par le moteur audio : tout chargé, puis tout programmé. */
  const jouerParMoteur = useCallback(async (ctx, cles, mien) => {
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      // Un son manquant est sauté, pas la suite entière : les autres phrases
      // gardent l'enchaînement fluide du moteur.
      const sons = await Promise.all(
        cles.map((c) => charger(ctx, adresseReplique(professeur, c)).catch(() => null)),
      );
      if (jeton.current !== mien) return;

      // AUCUN SON DÉCODÉ : le moteur n'y arrive pas sur ce navigateur, ou
      // rien n'est encore enregistré. On passe la main au lecteur de secours,
      // comme avant — sauter tous les sons laissait le jeu muet.
      if (sons.every((s) => !s)) {
        jouerParLecteurs(cles, mien);
        return;
      }

      let t = ctx.currentTime + 0.05;
      sons.forEach((son, i) => {
        if (!son) return;
        const source = ctx.createBufferSource();
        source.buffer = son.tampon;
        source.connect(ctx.destination);
        source.start(t, son.debut, son.duree);
        enVol.current.sources.push(source);

        const retard = Math.max(0, (t - ctx.currentTime) * 1000);
        enVol.current.minuteries.push(setTimeout(() => {
          if (jeton.current === mien) setEnCours(cles[i]);
        }, retard));

        t += son.duree + SILENCE_ENTRE;
      });

      const fin = Math.max(0, (t - SILENCE_ENTRE - ctx.currentTime) * 1000);
      enVol.current.minuteries.push(setTimeout(() => {
        if (jeton.current === mien) setEnCours(null);
      }, fin));
    } catch {
      // Un son introuvable ou indécodable : on retombe sur l'enchaînement de
      // secours, qui passera simplement le fichier manquant.
      if (jeton.current === mien) jouerParLecteurs(cles, mien);
    }
  }, [professeur, jouerParLecteurs]);

  /** Dire une phrase, ou une suite de phrases, l'une après l'autre. */
  const jouer = useCallback((repliques) => {
    arreter();
    const cles = (Array.isArray(repliques) ? repliques : [repliques])
      .map((r) => (typeof r === 'string' ? r : r?.cle))
      .filter(Boolean);
    if (!professeur || cles.length === 0) return;

    const mien = jeton.current;
    const ctx = moteur();
    if (ctx && typeof fetch === 'function') jouerParMoteur(ctx, cles, mien);
    else jouerParLecteurs(cles, mien);
  }, [arreter, professeur, jouerParMoteur, jouerParLecteurs]);

  /** Dire une phrase — sauf si l'enfant a coupé la voix. */
  const dire = useCallback((replique) => {
    if (muetRef.current) {
      arreter();
      return;
    }
    jouer(replique);
  }, [arreter, jouer]);

  /**
   * Réécouter — MÊME VOIX COUPÉE. C'est une demande explicite de l'enfant :
   * il a appuyé sur le haut-parleur pour entendre, on ne lui répond pas par
   * un silence.
   */
  const reecouter = useCallback((replique) => { jouer(replique); }, [jouer]);

  const basculerMuet = useCallback(() => {
    const apres = !muetRef.current;
    ecrireMuet(apres);
    if (apres) arreter();
    setMuet(apres);
  }, [arreter]);

  // Le jeu se ferme : la phrase en cours s'arrête avec lui.
  useEffect(() => arreter, [arreter]);

  return {
    dire, reecouter, muet, basculerMuet, enCours, parle: professeur !== null,
  };
}
