import { useState } from 'react';
import { ACCEPTE, ajouterAuxPieces, tailleLisible } from '../lib/signalementPieces';
import { collerDisponible, lirePressePapier, useCollerFichiers } from '../lib/collerFichiers';
import './signalementsAdmin.css';

/**
 * CHOISIR DES CAPTURES D'ÉCRAN OU DES DOCUMENTS — Camara, le 03/11/2026. Les fichiers
 * attendent ici l'envoi du signalement : il faut d'abord qu'il existe pour les recevoir.
 *
 * ET LES COLLER (11/11/2026) : Ctrl+V n'importe où dans le formulaire, ou le bouton « Coller » — voir collerFichiers.
 *
 * @param fichiers  les fichiers choisis ;
 * @param onChange  appelé avec la nouvelle liste.
 */
export default function ChoixPiecesSignalement({ fichiers, onChange, identifiant = 'signalement-pieces' }) {
  const [refus, setRefus] = useState([]);

  const ajouter = (nouveaux) => {
    const resultat = ajouterAuxPieces(fichiers, nouveaux);
    setRefus(resultat.refus);
    onChange(resultat.liste);
  };

  const choisir = (evenement) => {
    ajouter(evenement.target.files);

    // Sans cela, rechoisir le même fichier après l'avoir retiré ne ferait rien.
    evenement.target.value = '';
  };

  useCollerFichiers(true, ajouter);

  const collerDepuisLeBouton = async () => {
    try {
      const colles = await lirePressePapier();
      if (colles.length === 0) {
        setRefus(['Le presse-papiers ne contient ni image ni PDF.']);
        return;
      }
      ajouter(colles);
    } catch {
      setRefus(['Le navigateur n’a pas donné accès au presse-papiers : utilise Ctrl+V (ou Cmd+V).']);
    }
  };

  return (
    <div className="champ signalement-pieces-choix">
      <label htmlFor={identifiant}>Captures d’écran ou documents (facultatif)</label>
      <div className="signalement-pieces-choix__entree">
        <input id={identifiant} type="file" multiple accept={ACCEPTE} onChange={choisir} />
        {collerDisponible() && (
          <button type="button" className="btn-ghost btn-ghost--mini" onClick={collerDepuisLeBouton}>
            Coller
          </button>
        )}
      </div>
      <span className="champ__aide">
        Images, PDF, Word, Excel… 10 fichiers au plus, 10 Mo chacun. Une capture copiée se colle avec Ctrl+V (Cmd+V sur Mac).
      </span>

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
