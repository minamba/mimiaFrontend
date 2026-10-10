import { useEffect, useRef } from 'react';
import RecordJeu from './RecordJeu';
import Etincelle from './Etincelle';

/**
 * LA FIN DE PARTIE, COMMUNE AUX VINGT-TROIS JEUX — Camara, le 26/09 : « la
 * page de fin de jeu doit être beaucoup plus jolie, là c'est trop fade, ça
 * fait pas gaming ».
 *
 * Chaque jeu recopiait le même bloc — score, phrase, record, deux boutons.
 * Il n'y en a plus qu'un, ici : un jeu écrit demain aura le même écran sans
 * rien dessiner, et le prochain changement se fera à un seul endroit.
 *
 * LE MÊME DÉCOR QUE LE CHOIX DU MODE ET LA FIN DU DÉFI : les trois écrans
 * qui encadrent une partie parlent la même langue.
 *
 * LES ÉTOILES NE DESCENDENT JAMAIS À ZÉRO. Finir une partie vaut déjà une
 * étoile : un écran vide d'étoiles dirait « tu as échoué » à l'enfant qui a
 * le plus besoin de revenir. Les deux autres se gagnent au score.
 */
export function etoilesDuScore(score, total) {
  if (!total) return 1;
  const part = score / total;
  if (part >= 0.9) return 3;
  if (part >= 0.6) return 2;
  return 1;
}

const TITRES = {
  3: 'Excellent !',
  2: 'Bien joué !',
  1: 'Partie terminée !',
};

function Etoile({ gagnee, rang }) {
  return (
    <svg
      className={`partie-fin__etoile${gagnee ? ' est-gagnee' : ''}${rang === 1 ? ' partie-fin__etoile--centre' : ''}`}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      style={{ animationDelay: `${0.15 + rang * 0.18}s` }}
    >
      <defs>
        <linearGradient id={`or-${rang}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3a6" />
          <stop offset="0.45" stopColor="#ffd84d" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5l6.2 12.6 13.9 2-10 9.8 2.4 13.8L24 35.2l-12.5 6.5 2.4-13.8-10-9.8 13.9-2z"
        fill={gagnee ? `url(#or-${rang})` : 'rgba(255, 255, 255, 0.1)'}
      />
    </svg>
  );
}

/**
 * LE COFFRE DE LA CAGNOTTE (09/10/2026) — pour les jeux qui comptent des
 * points (`JeuDeChoix`). Il s'ouvre, les pièces en jaillissent — plus il y a
 * d'étoiles, plus il en sort — et la cagnotte s'affiche avec la meilleure série.
 */
function Coffre({ points, meilleureSerie, etoiles }) {
  return (
    <div className={`tresor tresor--${etoiles}`}>
      <svg className="tresor__dessin" viewBox="0 0 120 100" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="tresor-bois" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b5652f" />
            <stop offset="1" stopColor="#6e3514" />
          </linearGradient>
          <radialGradient id="tresor-lueur" cx="50%" cy="100%" r="80%">
            <stop offset="0" stopColor="#fff6c2" stopOpacity="0.95" />
            <stop offset="1" stopColor="#ffd34d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="tresor__lueur" cx="60" cy="52" rx="46" ry="30" fill="url(#tresor-lueur)" />
        {/* Une, trois ou cinq pièces, selon les étoiles. */}
        {Array.from({ length: etoiles * 2 - 1 }, (_, i) => (
          <circle key={i} className="tresor__piece" cx={60 + (i - (etoiles - 1)) * 9} cy="50" r="6" fill="#ffd34d" stroke="#c98a0b" strokeWidth="1.5" style={{ '--n': i }} />
        ))}
        <rect x="18" y="50" width="84" height="42" rx="6" fill="url(#tresor-bois)" stroke="#4a210a" strokeWidth="2.5" />
        <rect x="18" y="62" width="84" height="7" fill="#e8b23a" />
        <rect x="53" y="58" width="14" height="16" rx="3" fill="#ffd34d" stroke="#8a5a0b" strokeWidth="1.5" />
        <g className="tresor__couvercle">
          <path d="M18 50 V38 Q18 22 60 22 Q102 22 102 38 V50 Z" fill="url(#tresor-bois)" stroke="#4a210a" strokeWidth="2.5" />
          <path d="M18 44 H102" stroke="#e8b23a" strokeWidth="6" />
        </g>
      </svg>
      <p className="tresor__butin">
        <span className="cagnotte__piece" aria-hidden="true" />
        <strong>{points}</strong>
        {' points'}
        {meilleureSerie >= 2 && <span className="tresor__serie">{`🔥 meilleure série : ${meilleureSerie}`}</span>}
      </p>
    </div>
  );
}

export default function FinDePartie({
  score, total, mot, onRejouer, onQuitter, points, meilleureSerie = 0,
}) {
  const etoiles = etoilesDuScore(score, total);
  const titre = score === total && total > 0 ? 'Parfait !' : TITRES[etoiles];

  // Le focus sur le titre : un lecteur d'écran annonce la fin, et la
  // tabulation repart d'ici plutôt que du haut de la page.
  const entete = useRef(null);
  useEffect(() => { entete.current?.focus?.({ preventScroll: true }); }, []);

  return (
    <div className={`jeu jeu--choix jeu--fini partie-fin partie-fin--${etoiles}`}>
      <div
        className="partie-fin__etoiles"
        role="img"
        aria-label={`${etoiles} étoile${etoiles > 1 ? 's' : ''} sur 3`}
      >
        {[0, 1, 2].map((rang) => (
          <Etoile key={rang} rang={rang} gagnee={rang < etoiles} />
        ))}
      </div>

      <h2 className="choix-mode__titre" ref={entete} tabIndex={-1}>
        <Etincelle grande />
        <span className="choix-mode__question">
          <span className="choix-mode__question-cerne" aria-hidden="true">{titre}</span>
          <span className="choix-mode__question-texte">{titre}</span>
        </span>
        <Etincelle grande />
      </h2>

      <div className="fin-jeu__score">
        <strong>{score}</strong>
        <span>
          sur {total}
          <br />
          du premier coup
        </span>
      </div>

      <p className="fin-jeu__mot">{mot}</p>

      {points !== undefined && <Coffre points={points} meilleureSerie={meilleureSerie} etoiles={etoiles} />}

      <RecordJeu score={score} total={total} />

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
