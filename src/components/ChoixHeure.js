import { useRef, useState } from 'react';
import iconeHorloge from '../assets/horloge.png';

/**
 * L'HEURE D'UN CONTRÔLE, SUR UNE VRAIE HORLOGE — Camara, le 16/09/2026 :
 * « pas moyen d'ouvrir une vraie horloge, avec sélection de l'heure en premier
 * puis des minutes ? ». Comme sur un téléphone : on touche l'heure sur le
 * cadran, le cadran des minutes prend la suite, et l'aiguille se fait glisser
 * pour une minute exacte — 9 h 05 se règle du doigt.
 *
 * Le champ natif `type="time"` ouvrait une roue sur téléphone et un menu
 * étriqué sur ordinateur ; des pastilles avaient été essayées, jugées
 * lourdes. Le cadran est dessiné en SVG, sans bibliothèque : il s'affiche
 * pareil partout et ne pèse rien.
 *
 * LA VALEUR RESTE « HH:mm », comme avant : le remplissage par la voix et
 * l'envoi au serveur ne changent pas.
 */
const RAYON = 120;
const ANNEAU_EXTERIEUR = 96;
const ANNEAU_INTERIEUR = 60;
const ANNEAU_MINUTES = 96;

const deux = (n) => String(n).padStart(2, '0');

/** « 11:20 » → { heure: 11, minute: 20 } ; vide ou mal formé → null. */
export function lireHeure(valeur) {
  const m = /^(\d{1,2}):(\d{2})/.exec(valeur ?? '');
  if (!m) return null;

  const heure = Number(m[1]);
  const minute = Number(m[2]);
  if (heure > 23 || minute > 59) return null;

  return { heure, minute };
}

/** Le point du cadran pour un rang sur 12 (0 en haut, sens horaire). */
const point = (rang, rayon) => {
  const angle = ((rang / 12) * 2 * Math.PI) - Math.PI / 2;
  return { x: RAYON + rayon * Math.cos(angle), y: RAYON + rayon * Math.sin(angle) };
};

/** L'angle d'un point du cadran, en minutes (0 en haut, sens horaire). */
const minuteDepuis = (x, y) => {
  const angle = Math.atan2(y - RAYON, x - RAYON) + Math.PI / 2;
  const tour = (angle + 2 * Math.PI) % (2 * Math.PI);
  return Math.round((tour / (2 * Math.PI)) * 60) % 60;
};

export default function ChoixHeure({ id, valeur, onChange, labelledBy }) {
  const lue = lireHeure(valeur);
  const heure = lue?.heure ?? null;
  const minute = lue?.minute ?? null;

  // L'heure d'abord, les minutes ensuite — et on peut revenir sur l'une ou
  // l'autre en touchant le résumé, comme sur un téléphone.
  const [etape, setEtape] = useState('heure');
  const cadranRef = useRef(null);
  const glisseRef = useRef(false);

  const choisirHeure = (h) => {
    onChange(`${deux(h)}:${deux(minute ?? 0)}`);
    setEtape('minute');
  };

  const choisirMinute = (mn) => onChange(`${deux(heure ?? 8)}:${deux(mn)}`);

  const effacer = () => {
    onChange('');
    setEtape('heure');
  };

  /** Le point du cadran sous le doigt ou la souris, dans le repère du SVG. */
  const pointSous = (evenement) => {
    const rect = cadranRef.current.getBoundingClientRect();
    const echelle = (RAYON * 2) / rect.width;
    return {
      x: (evenement.clientX - rect.left) * echelle,
      y: (evenement.clientY - rect.top) * echelle,
    };
  };

  // FAIRE GLISSER L'AIGUILLE DES MINUTES : le seul geste qui donne une minute
  // exacte sans clavier. Les heures, elles, se touchent — glisser entre deux
  // anneaux choisirait une heure au hasard.
  const debutGlisse = (evenement) => {
    if (etape !== 'minute') return;
    glisseRef.current = true;
    cadranRef.current.setPointerCapture?.(evenement.pointerId);
    const { x, y } = pointSous(evenement);
    choisirMinute(minuteDepuis(x, y));
  };

  const glisse = (evenement) => {
    if (!glisseRef.current) return;
    const { x, y } = pointSous(evenement);
    choisirMinute(minuteDepuis(x, y));
  };

  const finGlisse = () => { glisseRef.current = false; };

  // L'aiguille : vers l'heure choisie (anneau extérieur ou intérieur), ou
  // vers la minute exacte — y compris entre deux nombres.
  let aiguille = null;
  if (etape === 'heure' && heure !== null) {
    aiguille = point(heure % 12, heure === 0 || heure > 12 ? ANNEAU_INTERIEUR : ANNEAU_EXTERIEUR);
  } else if (etape === 'minute' && minute !== null) {
    aiguille = point(minute / 5, ANNEAU_MINUTES);
  }

  return (
    <div id={id} className="cadran-heure" role="group" aria-labelledby={labelledBy}>
      <div className="cadran-heure__resume">
        <img className="cadran-heure__icone" src={iconeHorloge} alt="" />

        {lue ? (
          <span className="cadran-heure__valeur" aria-live="polite">
            <button
              type="button"
              className={`cadran-heure__partie ${etape === 'heure' ? 'est-active' : ''}`}
              onClick={() => setEtape('heure')}
              aria-label={`Changer l’heure, actuellement ${lue.heure} h`}
            >
              {`${lue.heure} h`}
            </button>
            <button
              type="button"
              className={`cadran-heure__partie ${etape === 'minute' ? 'est-active' : ''}`}
              onClick={() => setEtape('minute')}
              aria-label={`Changer les minutes, actuellement ${deux(lue.minute)}`}
            >
              {deux(lue.minute)}
            </button>
          </span>
        ) : (
          <span className="cadran-heure__vide">Pas d’heure précise</span>
        )}

        {lue && (
          <button type="button" className="cadran-heure__effacer" onClick={effacer}>
            Effacer
          </button>
        )}
      </div>

      <p className="cadran-heure__consigne">
        {etape === 'heure' ? 'Touche l’heure du contrôle' : 'Touche les minutes, ou fais glisser l’aiguille'}
      </p>

      <svg
        ref={cadranRef}
        className={`cadran-heure__cadran ${etape === 'minute' ? 'cadran-heure__cadran--minutes' : ''}`}
        viewBox={`0 0 ${RAYON * 2} ${RAYON * 2}`}
        role="group"
        aria-label={etape === 'heure' ? 'Les heures' : 'Les minutes'}
        onPointerDown={debutGlisse}
        onPointerMove={glisse}
        onPointerUp={finGlisse}
        onPointerCancel={finGlisse}
      >
        <circle className="cadran-heure__fond" cx={RAYON} cy={RAYON} r={RAYON - 2} />

        {aiguille && (
          <>
            <line className="cadran-heure__aiguille" x1={RAYON} y1={RAYON} x2={aiguille.x} y2={aiguille.y} />
            <circle className="cadran-heure__axe" cx={RAYON} cy={RAYON} r={4} />
            <circle className="cadran-heure__pointe" cx={aiguille.x} cy={aiguille.y} r={17} />
          </>
        )}

        {etape === 'heure'
          ? [ANNEAU_EXTERIEUR, ANNEAU_INTERIEUR].map((rayon, anneau) =>
            Array.from({ length: 12 }, (_, rang) => {
              // Extérieur : 12, 1 … 11. Intérieur : 00, 13 … 23 — comme sur
              // un téléphone, pour lire l'après-midi sans compter.
              const h = anneau === 0 ? (rang === 0 ? 12 : rang) : (rang === 0 ? 0 : 12 + rang);
              const { x, y } = point(rang, rayon);
              return (
                <Nombre
                  key={h}
                  x={x}
                  y={y}
                  libelle={anneau === 0 ? String(h) : deux(h)}
                  nom={`${h} h`}
                  choisi={h === heure}
                  petit={anneau === 1}
                  onChoisir={() => choisirHeure(h)}
                />
              );
            }))
          : Array.from({ length: 12 }, (_, rang) => {
            const mn = rang * 5;
            const { x, y } = point(rang, ANNEAU_MINUTES);
            return (
              <Nombre
                key={mn}
                x={x}
                y={y}
                libelle={deux(mn)}
                nom={`${mn} min`}
                choisi={mn === minute}
                onChoisir={() => choisirMinute(mn)}
              />
            );
          })}
      </svg>
    </div>
  );
}

/**
 * Un nombre du cadran : un vrai bouton, accessible au clavier et aux lecteurs
 * d'écran — `pointerdown` est absorbé pour qu'un simple toucher ne parte pas
 * en glissement.
 */
function Nombre({ x, y, libelle, nom, choisi, petit, onChoisir }) {
  return (
    <g
      className={`cadran-heure__nombre ${choisi ? 'est-choisi' : ''} ${petit ? 'cadran-heure__nombre--petit' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={nom}
      aria-pressed={choisi}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onChoisir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChoisir();
        }
      }}
    >
      <circle cx={x} cy={y} r={petit ? 14 : 17} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central">{libelle}</text>
    </g>
  );
}
