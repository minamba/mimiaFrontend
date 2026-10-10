import {
  createContext, useContext, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { DEFI } from '../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { sessionEleve } from '../../../lib/storage/sessionEleve';
import { dureeDuDefi, enMinutesSecondes } from '../../../lib/jeux/bonus/reglages.js';
import { enregistrerTemps, meilleurTemps } from '../../../lib/jeux/bonus/recordTemps.js';
import Etincelle from '../Etincelle';
import useAmbiance, { adresseAmbiance } from '../../../lib/jeux/ambiance';

/**
 * L'AMBIANCE SONORE DES JEUX BONUS (10/10/2026) — Camara : « vu qu'ils sont peu
 * nombreux et que c'est le même pour tous les niveaux, ça peut être pas mal ».
 * Un son par jeu (`public/sons/ambiances/<clé>.mp3`), le même mécanisme que les
 * escape games (`useAmbiance` : boucle sans blanc, volume 0,08, baisse sous la
 * voix). La clé vient de l'enveloppe du décor (`avecDecor`, bonus/index.js),
 * qui la passe à l'en-tête par ce contexte. Le bouton n'apparaît qu'une fois le
 * son chargé ; le choix « coupé » est commun à tous les jeux (même mémoire).
 */
export const JeuBonusCourant = createContext(null);

/**
 * UNE AMBIANCE PAR IMAGE (10/10/2026) — Camara, sur Mythe ou Histoire : « je
 * suis sur les Jeux olympiques et j'entends la mer, c'est hors sujet » ; puis
 * « je veux que les sons soient adaptés aux images ». Un jeu qui change de
 * décor à chaque manche passe `ambiance` à l'en-tête (l'identifiant de
 * l'image) : le son devient `bonus-<jeu>-<image>.mp3`, et change avec elle
 * (fondu de sortie, fondu d'entrée). Une image sans son retombe sur le son du
 * jeu, `bonus-<jeu>.mp3` — et sans ce son-là non plus, pas de bouton.
 */
function AmbianceBonus({ cle, image }) {
  const [manquantes, setManquantes] = useState(() => new Set());
  const precise = image && !manquantes.has(image) ? `${cle}-${image}` : cle;
  const url = adresseAmbiance(precise);
  const {
    coupee, basculer, disponible, absente,
  } = useAmbiance(url);
  useEffect(() => {
    if (absente && precise !== cle && absente === url) {
      setManquantes((m) => new Set(m).add(image));
    }
  }, [absente, precise, cle, url, image]);
  if (!disponible) return null;
  return (
    <button
      type="button"
      className={`bonus__compte bonus__ambiance${coupee ? ' est-coupee' : ''}`}
      onClick={basculer}
      aria-pressed={!coupee}
      title={coupee ? 'Remettre l’ambiance' : 'Couper l’ambiance'}
    >
      <span aria-hidden="true">{coupee ? '🔇' : '🎵'}</span>
      <span className="visuellement-cache">{coupee ? 'Ambiance coupée' : 'Ambiance'}</span>
    </button>
  );
}

/**
 * CE QUE PARTAGENT LES JEUX BONUS (09/10/2026) : le chrono selon le mode,
 * l'en-tête, et l'écran de fin au record de temps. Voir `lib/jeux/bonus/reglages.js`.
 */

/**
 * LE PLATEAU TIENT DANS L'ÉCRAN, MESURÉ ET NON ESTIMÉ — Camara, le 10/10/2026 :
 * « tous les morpions débordent ; pourquoi cette fenêtre n'est pas dynamique ? ».
 * La largeur des plateaux venait d'une ESTIMATION (`--libre`, la hauteur de
 * l'écran moins un en-tête supposé, divisée par le zoom) : elle ignorait la
 * consigne et la ligne du tour, et grandissait quand le zoom de la page
 * baissait pour faire tenir le jeu — les deux s'annulaient, le jeu débordait.
 *
 * Ici, on MESURE : la place qui reste sous la barre du site, moins ce que le
 * jeu affiche au-dessus et au-dessous du plateau, et l'on donne au plateau
 * (carré) exactement cette taille, bornée par `min` et `max`, jamais plus large
 * que le jeu moins `largeurAutour` (ce qui l'entoure en largeur : les colonnes
 * des prises aux échecs ; une fonction si cela dépend de l'écran). Tout est mesuré dans la même unité (les pixels à l'écran,
 * zoom compris), puis ramené aux pixels du jeu par une simple règle de trois.
 * Recalculé quand la fenêtre change et quand le jeu change de hauteur ; la
 * taille est aussi posée en variable CSS (`--plateau`) pour les pièces.
 */
export function useTientDansLEcran(ref, {
  min = 180, max = 760, actif = true, largeurAutour = 40,
} = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !actif) return undefined;
    let image = 0;
    const ajuster = () => {
      const jeu = el.closest('.jeu');
      const r = el.getBoundingClientRect();
      if (!jeu || !r.height || !el.offsetWidth) return;
      const j = jeu.getBoundingClientRect();
      const barre = document.querySelector('.navbar')?.getBoundingClientRect().height ?? 0;
      const autour = (r.top - j.top) + (j.bottom - r.bottom);
      const dispo = window.innerHeight - barre - 16 - autour;
      const echelle = el.offsetWidth / r.width || 1;
      const autourEnLargeur = typeof largeurAutour === 'function' ? largeurAutour() : largeurAutour;
      const large = jeu.clientWidth - autourEnLargeur;
      const voulu = Math.max(min, Math.min(max, large, dispo * echelle));
      if (Math.abs(voulu - el.offsetWidth) > 2) {
        el.style.width = `${Math.round(voulu)}px`;
        el.style.setProperty('--plateau', `${Math.round(voulu)}px`);
      } else if (!el.style.getPropertyValue('--plateau')) {
        el.style.setProperty('--plateau', `${el.offsetWidth}px`);
      }
    };
    const planifier = () => {
      window.cancelAnimationFrame?.(image);
      image = window.requestAnimationFrame?.(ajuster) ?? 0;
    };
    planifier();
    window.addEventListener('resize', planifier);
    const observateur = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(planifier) : null;
    observateur?.observe(el.closest('.jeu') ?? el);
    return () => {
      window.cancelAnimationFrame?.(image);
      window.removeEventListener('resize', planifier);
      observateur?.disconnect();
    };
  }, [ref, min, max, actif, largeurAutour]);
}

/**
 * LE CHRONO D'UNE PARTIE BONUS. En tranquille, il monte ; en défi, il descend
 * depuis la durée du jeu, et à zéro la page reçoit la fin du défi — la même
 * que celle des escape games, avec ce que l'enfant a trouvé.
 *
 * `compte` : `{ trouves, total, unite }`, pour cette fin-là (« 3 mots trouvés
 * sur 5 »). `fini` arrête la montre.
 *
 * `montre: false` : le jeu compte son temps autrement (un chrono par drapeau,
 * par mot de passe ; l'adversaire du morpion) — le chrono monte alors toujours.
 */
export function useChronoBonus(jeu, niveau, fini, compte, { montre = true } = {}) {
  const { mode, terminerDefi } = useJeuOuvert();
  const defi = montre && mode === DEFI;
  const duree = dureeDuDefi(jeu, niveau) * 1000;
  const debut = useRef(Date.now());
  const fin = useRef(null);
  if (fini && fin.current === null) fin.current = Date.now();

  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    if (fini) return undefined;
    const id = setInterval(() => setMaintenant(Date.now()), 250);
    return () => clearInterval(id);
  }, [fini]);

  const ecoule = Math.max(0, (fin.current ?? Math.max(maintenant, debut.current)) - debut.current);
  const reste = Math.max(0, duree - ecoule);

  const signale = useRef(false);
  useLayoutEffect(() => {
    if (!defi || fini || reste > 0 || signale.current) return;
    signale.current = true;
    terminerDefi?.({
      reussies: compte.trouves, questions: compte.trouves, raison: 'temps', total: compte.total, unite: compte.unite,
    });
  }, [defi, fini, reste, terminerDefi, compte.trouves, compte.total, compte.unite]);

  return { defi, ecoule, reste };
}

/** Le chrono à l'écran : le temps qui monte, ou ce qui reste en défi — rouge dans les vingt dernières secondes. */
export function ChronoBonus({ chrono }) {
  const { defi, ecoule, reste } = chrono;
  const presse = defi && reste <= 20000;
  const valeur = defi ? reste : ecoule;
  return (
    <p className={`bonus__chrono${presse ? ' est-presse' : ''}`} role="timer" aria-label={`${defi ? 'Temps restant' : 'Temps'} : ${enMinutesSecondes(valeur)}`}>
      <span aria-hidden="true">{defi ? '⏳' : '⏱'}</span>
      <span className="bonus__chrono-valeur">{enMinutesSecondes(valeur)}</span>
    </p>
  );
}

/** L'en-tête d'un jeu bonus : le retour, le titre, le chrono, et ce qu'on y voit en plus (vies, compte). */
export function EnTeteBonus({
  titre, sousTitre, chrono, onQuitter, children, ambiance = null,
}) {
  const cle = useContext(JeuBonusCourant);
  return (
    <>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>
      <header className="bonus__entete">
        <h2 className="bonus__titre">{titre}</h2>
        {sousTitre && <p className="bonus__sous-titre">{sousTitre}</p>}
        <div className="bonus__compteurs">
          <ChronoBonus chrono={chrono} />
          {children}
          {cle && <AmbianceBonus cle={cle} image={ambiance} />}
        </div>
      </header>
    </>
  );
}

/**
 * L'ÉCRAN DE FIN D'UNE PARTIE BONUS : le temps, le record de temps (le plus
 * court), et ce qui a été trouvé quand tout ne l'a pas été. Le record ne
 * s'écrit que pour une partie finie en entier : un temps plus court sur une
 * partie ratée ne serait pas un exploit.
 */
export function FinBonus({
  jeu, niveau, ecoule, trouves, total, unite, onRejouer, onQuitter,
}) {
  const complet = trouves === total;
  const [resultat] = useState(() => {
    const { eleveId } = sessionEleve() ?? {};
    if (!complet) return { precedent: meilleurTemps(eleveId, jeu, niveau), record: false };
    return enregistrerTemps(eleveId, jeu, niveau, ecoule);
  });
  const entete = useRef(null);
  useEffect(() => { entete.current?.focus?.({ preventScroll: true }); }, []);
  const titre = complet ? 'Bravo !' : 'Bien joué !';
  const pluriel = (n, u) => (n > 1 ? u.split(' ').map((m) => `${m}s`).join(' ') : u);

  return (
    <div className="jeu jeu--choix jeu--fini partie-fin bonus-fin">
      <h2 className="choix-mode__titre" ref={entete} tabIndex={-1}>
        <Etincelle grande />
        <span className="choix-mode__question">
          <span className="choix-mode__question-cerne" aria-hidden="true">{titre}</span>
          <span className="choix-mode__question-texte">{titre}</span>
        </span>
        <Etincelle grande />
      </h2>

      <div className="fin-jeu__score">
        <strong>{enMinutesSecondes(ecoule)}</strong>
        <span>
          {complet ? 'pour tout trouver' : `${trouves} ${pluriel(trouves, unite)} sur ${total}`}
        </span>
      </div>

      {resultat.record && <p className="bonus-fin__record" role="status">🏆 Nouveau record de temps !</p>}
      {!resultat.record && resultat.precedent !== null && (
        <p className="fin-jeu__mot">{`Ton record : ${enMinutesSecondes(resultat.precedent)}. ${complet ? 'Tu peux le battre !' : 'Finis la partie pour le battre !'}`}</p>
      )}

      <div className="fin-jeu__portes">
        <button type="button" className="fin-jeu__porte fin-jeu__porte--rouge" onClick={onRejouer}>
          Rejouer
        </button>
        <button type="button" className="fin-jeu__porte" onClick={onQuitter}>
          Revenir aux jeux
        </button>
      </div>
    </div>
  );
}
