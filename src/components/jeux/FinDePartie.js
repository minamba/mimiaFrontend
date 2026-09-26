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

export default function FinDePartie({
  score, total, mot, onRejouer, onQuitter,
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
