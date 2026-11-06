import { useState } from 'react';
import { ACCEPTE, ajouterAuxPieces, tailleLisible } from '../lib/signalementPieces';
import './signalementsAdmin.css';

/**
 * CHOISIR DES CAPTURES D'ÉCRAN OU DES DOCUMENTS — Camara, le 03/11/2026. Les fichiers
 * attendent ici l'envoi du signalement : il faut d'abord qu'il existe pour les recevoir.
 *
 * @param fichiers  les fichiers choisis ;
 * @param onChange  appelé avec la nouvelle liste.
 */
export default function ChoixPiecesSignalement({ fichiers, onChange, identifiant = 'signalement-pieces' }) {
  const [refus, setRefus] = useState([]);

  const choisir = (evenement) => {
    const resultat = ajouterAuxPieces(fichiers, evenement.target.files);
    setRefus(resultat.refus);
    onChange(resultat.liste);

    // Sans cela, rechoisir le même fichier après l'avoir retiré ne ferait rien.
    evenement.target.value = '';
  };

  return (
    <div className="champ signalement-pieces-choix">
      <label htmlFor={identifiant}>Captures d’écran ou documents (facultatif)</label>
      <input id={identifiant} type="file" multiple accept={ACCEPTE} onChange={choisir} />
      <span className="champ__aide">Images, PDF, Word, Excel… 10 fichiers au plus, 10 Mo chacun.</span>

      {refus.map((raison) => <p key={raison} className="signalement-pieces-choix__refus" role="alert">{raison}</p>)}

      {fichiers.length > 0 && (
        <ul className="signalement-pieces-choix__liste">
          {fichiers.map((fichier) => (
            <li key={`${fichier.name}-${fichier.size}`}>
              <span className="signalement-pieces-choix__nom">
                {fichier.name} <small>({tailleLisible(fichier.size)})</small>
              </span>
              <button
                type="button"
                className="btn-ghost btn-ghost--mini"
                aria-label={`Retirer ${fichier.name}`}
                onClick={() => onChange(fichiers.filter((f) => f !== fichier))}
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
