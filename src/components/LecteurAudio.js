import { useRef, useState } from 'react';
import hautParleurPng from '../assets/haut_parleur.webp';
import lecturePng from '../assets/lecture.webp';
import pausePng from '../assets/pause.webp';

/**
 * UN LECTEUR AUDIO AUX COULEURS DU SITE.
 *
 * Voulu par Camara le 12/09/2026 : le lecteur natif posait un gros rectangle
 * blanc au milieu d'une carte sombre.
 *
 * POURQUOI NE PAS SIMPLEMENT L'HABILLER : les contrôles natifs ne sont
 * atteignables que par des pseudo-éléments propriétaires — `::-webkit-media-
 * controls-*` — qui n'existent pas sur Firefox. On obtiendrait un lecteur au
 * thème sur un navigateur et blanc sur un autre. Le filtre `invert()` qu'on
 * voit souvent, lui, retourne aussi les icônes et la couleur du bouton.
 *
 * L'ÉLÉMENT `audio` RESTE LE MOTEUR : il n'est pas réimplémenté, seulement
 * privé de ses boutons. La barre est un vrai champ `range`, donc utilisable
 * au clavier (flèches, Début, Fin) sans une ligne de code de plus.
 */

/** « 1:07 ». Tant que la durée est inconnue, on n'invente pas de chiffre. */
const enMinutes = (secondes) => {
  if (!Number.isFinite(secondes)) return '--:--';

  const minutes = Math.floor(secondes / 60);
  const reste = Math.floor(secondes % 60);

  return `${minutes}:${String(reste).padStart(2, '0')}`;
};

export default function LecteurAudio({ src, libelle }) {
  const audio = useRef(null);

  const [joue, setJoue] = useState(false);
  const [position, setPosition] = useState(0);
  const [duree, setDuree] = useState(NaN);

  /**
   * LE VOLUME, DEMANDÉ PAR CAMARA LE 12/09/2026.
   *
   * Le lecteur natif l'offrait ; en le remplaçant, on hérite de ce qu'il
   * faisait gratuitement. Un extrait de compréhension orale s'écoute souvent
   * dans une pièce partagée — pouvoir baisser le son sans toucher à tout
   * l'appareil n'est pas un agrément, c'est la condition pour l'écouter.
   */
  const [volume, setVolume] = useState(1);
  const [muet, setMuet] = useState(false);

  const basculer = () => {
    const element = audio.current;
    if (!element) return;

    // `play()` rend une promesse qui peut être rejetée — onglet en sourdine,
    // fichier introuvable. L'ignorer suffit : l'état se remet d'aplomb tout
    // seul, puisque c'est l'événement `pause` qui le pilote, pas ce clic.
    if (element.paused) element.play().catch(() => {});
    else element.pause();
  };

  const deplacer = (evenement) => {
    const valeur = Number(evenement.target.value);

    setPosition(valeur);
    if (audio.current) audio.current.currentTime = valeur;
  };

  /** Glisser jusqu'à zéro coupe le son : c'est ce que le geste veut dire. */
  const changerVolume = (evenement) => {
    const valeur = Number(evenement.target.value);

    setVolume(valeur);
    setMuet(valeur === 0);

    if (audio.current) {
      audio.current.volume = valeur;
      audio.current.muted = valeur === 0;
    }
  };

  /**
   * Le bouton coupe et rétablit. Rétablir alors que le curseur est à zéro
   * ne produirait aucun son : on remonte alors à mi-hauteur, sans quoi le
   * bouton paraîtrait cassé.
   */
  const basculerMuet = () => {
    const coupe = !muet;
    const niveau = !coupe && volume === 0 ? 0.5 : volume;

    setMuet(coupe);
    setVolume(niveau);

    if (audio.current) {
      audio.current.muted = coupe;
      audio.current.volume = niveau;
    }
  };

  const avancement = Number.isFinite(duree) && duree > 0
    ? (position / duree) * 100
    : 0;

  const niveauSonore = muet ? 0 : volume;

  return (
    <div className="lecteur">
      <button
        type="button"
        className={`lecteur__bouton${joue ? ' est-en-lecture' : ''}`}
        onClick={basculer}
        aria-label={joue ? 'Mettre en pause' : `Écouter ${libelle}`}
      >
        {/* LES DESSINS SONT DES PASTILLES ENTIÈRES, pas des symboles posés sur
            un fond : c'est le bouton qui a perdu le sien, sinon on verrait un
            disque sur un disque. L'image ne dit rien d'elle-même — c'est le
            bouton qui porte « Écouter » ou « Mettre en pause ». */}
        <img
          className="lecteur__icone-lecture"
          src={joue ? pausePng : lecturePng}
          alt=""
          aria-hidden="true"
        />
      </button>

      {/* La part déjà écoutée est peinte par le CSS à partir de cette
          variable : un dégradé qui s'arrête au pourcentage, plutôt qu'un
          second élément à tenir synchronisé. */}
      <input
        type="range"
        className="lecteur__barre"
        min="0"
        max={Number.isFinite(duree) ? duree : 0}
        step="0.1"
        value={position}
        onChange={deplacer}
        aria-label={`Position dans ${libelle}`}
        style={{ '--avancement': `${avancement}%` }}
      />

      <span className="lecteur__temps">
        {enMinutes(position)}
        <small> / {enMinutes(duree)}</small>
      </span>

      <span className="lecteur__son">
        <button
          type="button"
          className={`lecteur__muet ${muet || volume === 0 ? 'lecteur__muet--coupe' : ''}`}
          onClick={basculerMuet}
          aria-label={muet ? 'Rétablir le son' : 'Couper le son'}
        >
          {/* LE MÊME DESSIN QUE DANS LE COURS, et le silence tracé par la
              feuille de style : il n'existe qu'une image. L'émoji d'avant était
              dessiné par le système — différent sur Windows, sur Mac et sur
              Android — et ne suivait aucune direction artistique.

              L'image ne dit rien d'elle-même : c'est le bouton qui porte
              « Couper le son » / « Rétablir le son ». */}
          <img className="lecteur__icone" src={hautParleurPng} alt="" aria-hidden="true" />
        </button>

        <input
          type="range"
          className="lecteur__volume"
          min="0"
          max="1"
          step="0.05"
          value={niveauSonore}
          onChange={changerVolume}
          aria-label="Niveau du son"
          style={{ '--avancement': `${niveauSonore * 100}%` }}
        />
      </span>

      {/* `metadata` : assez pour connaître la durée et l'afficher, sans
          télécharger les deux cents kilo-octets chez qui ne cliquera pas. */}
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setJoue(true)}
        onPause={() => setJoue(false)}
        onEnded={() => { setJoue(false); setPosition(0); }}
        onTimeUpdate={(evenement) => setPosition(evenement.target.currentTime)}
        onLoadedMetadata={(evenement) => setDuree(evenement.target.duration)}
      >
        Votre navigateur ne peut pas lire cet extrait.
      </audio>
    </div>
  );
}
