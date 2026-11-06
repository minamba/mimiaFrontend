import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './pauseCours.css';

/**
 * L'ÉCRAN DE PAUSE DU COURS — Camara, le 03/11/2026.
 *
 * PAR-DESSUS TOUTE LA PAGE, MENU COMPRIS : l'enfant n'a que deux gestes possibles,
 * reprendre ou quitter. Aller ailleurs par le menu laisserait une pause en cours
 * que plus rien ne viendrait lever.
 *
 * `aria-modal` FIGE AUSSI LA PAGE (voir `verrouDefilement.js`), et c'est ce qu'on
 * veut ici : rien ne bouge pendant la pause.
 */
export default function PauseCours({ onReprendre, onQuitter }) {
  const reprendreRef = useRef(null);

  // Le clavier arrive sur « Reprendre » : le champ de saisie, lui, est désactivé.
  useEffect(() => {
    reprendreRef.current?.focus();
  }, []);

  return createPortal(
    <div className="pause-cours" role="dialog" aria-modal="true" aria-labelledby="pause-cours-titre">
      <div className="pause-cours__carte">
        <span className="pause-cours__icone" aria-hidden="true">
          <span className="btn-pause-cours__barres" />
        </span>

        <h2 id="pause-cours-titre">Cours en pause</h2>

        <p>Le temps est arrêté, et ton professeur t’attend. Il reprendra là où il en était.</p>

        <button
          ref={reprendreRef}
          type="button"
          className="pause-cours__reprendre"
          onClick={onReprendre}
        >
          <span aria-hidden="true">▶</span> Reprendre le cours
        </button>

        <button type="button" className="pause-cours__quitter" onClick={onQuitter}>
          Quitter le cours
        </button>
      </div>
    </div>,
    document.body,
  );
}
