import { useEffect, useRef, useState } from 'react';
import {
  ajouterPieceSignalement,
  getFichierPieceSignalement,
  getPiecesSignalement,
  supprimerPieceSignalement,
} from '../lib/api/adminApi';
import {
  ACCEPTE, PIECES_MAX, refusPiece, tailleLisible,
} from '../lib/signalementPieces';

/**
 * LES CAPTURES D'ÉCRAN ET DOCUMENTS D'UN SIGNALEMENT — Camara, le 03/11/2026 : « dans
 * l'aperçu, je veux voir ces images et pouvoir télécharger les documents ».
 *
 * LES IMAGES ARRIVENT EN BLOB, PAS PAR UNE ADRESSE : la route exige le jeton de
 * l'administrateur, qu'une balise <img> n'enverrait pas.
 *
 * @param modifiable en plus, ajouter et supprimer (le formulaire ; l'aperçu ne fait que lire).
 * @param onChange   appelé avec le nombre de pièces, pour le compteur de la liste.
 */
export default function PiecesSignalement({ signalementId, modifiable = false, onChange }) {
  const [pieces, setPieces] = useState([]);
  const [apercus, setApercus] = useState({});
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);

  // Les adresses créées, pour les rendre au navigateur en partant.
  const adresses = useRef({});

  useEffect(() => {
    let vivant = true;
    const creees = adresses.current;

    getPiecesSignalement(signalementId)
      .then(({ data }) => { if (vivant) setPieces(Array.isArray(data) ? data : []); })
      .catch(() => { if (vivant) setErreur("Les fichiers joints n'ont pas pu être chargés."); })
      .finally(() => { if (vivant) setChargement(false); });

    return () => {
      vivant = false;
      Object.values(creees).forEach((adresse) => URL.revokeObjectURL(adresse));
    };
  }, [signalementId]);

  useEffect(() => {
    let vivant = true;

    pieces.filter((p) => p.estImage && !adresses.current[p.id]).forEach((piece) => {
      getFichierPieceSignalement(signalementId, piece.id)
        .then(({ data }) => {
          const adresse = URL.createObjectURL(data);
          adresses.current[piece.id] = adresse;
          if (vivant) setApercus((avant) => ({ ...avant, [piece.id]: adresse }));
        })
        .catch(() => { if (vivant) setApercus((avant) => ({ ...avant, [piece.id]: null })); });
    });

    return () => { vivant = false; };
  }, [pieces, signalementId]);

  const remplacer = (liste) => {
    setPieces(liste);
    onChange?.(liste.length);
  };

  const telecharger = async (piece) => {
    setErreur(null);

    try {
      const { data } = await getFichierPieceSignalement(signalementId, piece.id);
      const adresse = URL.createObjectURL(data);
      const lien = document.createElement('a');
      lien.href = adresse;
      lien.download = piece.nom;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      URL.revokeObjectURL(adresse);
    } catch {
      setErreur(`« ${piece.nom} » n'a pas pu être téléchargé.`);
    }
  };

  const ajouter = async (evenement) => {
    const fichiers = Array.from(evenement.target.files ?? []);
    evenement.target.value = '';

    setEnvoi(true);
    setErreur(null);

    let liste = pieces;
    const refus = [];

    // L'un après l'autre : un fichier refusé ne fait pas perdre les autres.
    for (const fichier of fichiers) {
      const raison = liste.length >= PIECES_MAX
        ? `Au plus ${PIECES_MAX} fichiers par signalement : « ${fichier.name} » n'a pas été ajouté.`
        : refusPiece(fichier);

      if (raison) {
        refus.push(raison);
      } else {
        try {
          // eslint-disable-next-line no-await-in-loop
          const { data } = await ajouterPieceSignalement(signalementId, fichier);
          liste = [...liste, data];
        } catch (e) {
          refus.push(e?.response?.data?.message ?? `« ${fichier.name} » n'a pas pu être envoyé.`);
        }
      }
    }

    remplacer(liste);
    if (refus.length > 0) setErreur(refus.join(' '));
    setEnvoi(false);
  };

  const supprimer = async (piece) => {
    setEnvoi(true);
    setErreur(null);

    try {
      await supprimerPieceSignalement(signalementId, piece.id);
      remplacer(pieces.filter((p) => p.id !== piece.id));
      setASupprimer(null);
    } catch {
      setErreur(`« ${piece.nom} » n'a pas pu être supprimé.`);
    } finally {
      setEnvoi(false);
    }
  };

  // Rien à montrer en lecture seule : l'aperçu ne s'encombre pas d'un titre vide.
  if (!modifiable && !erreur && pieces.length === 0) return null;

  const images = pieces.filter((p) => p.estImage);
  const documents = pieces.filter((p) => !p.estImage);

  const gestes = (piece) => (
    <div className="signalement-piece__gestes">
      <button
        type="button"
        className="btn-ghost btn-ghost--mini"
        aria-label={`Télécharger ${piece.nom}`}
        onClick={() => telecharger(piece)}
      >
        Télécharger
      </button>

      {modifiable && (aSupprimer === piece.id ? (
        <>
          <button
            type="button"
            className="btn-ghost btn-ghost--mini btn-ghost--danger"
            disabled={envoi}
            onClick={() => supprimer(piece)}
          >
            Confirmer
          </button>
          <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setASupprimer(null)}>
            Annuler
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn-ghost btn-ghost--mini btn-ghost--danger"
          aria-label={`Supprimer ${piece.nom}`}
          onClick={() => setASupprimer(piece.id)}
        >
          Supprimer
        </button>
      ))}
    </div>
  );

  return (
    <section className="signalement-pieces" aria-label="Fichiers joints">
      <h4 className="signalement-pieces__titre">Fichiers joints</h4>

      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && pieces.length === 0 && (
        <p className="signalement-pieces__vide">Aucun fichier joint.</p>
      )}

      {images.length > 0 && (
        <ul className="signalement-pieces__images">
          {images.map((piece) => (
            <li key={piece.id} className="signalement-piece signalement-piece--image">
              {apercus[piece.id] ? (
                <a href={apercus[piece.id]} target="_blank" rel="noreferrer" title="Ouvrir en grand">
                  <img src={apercus[piece.id]} alt={piece.nom} />
                </a>
              ) : (
                <span className="signalement-piece__attente">
                  {apercus[piece.id] === null ? 'Image indisponible' : 'Chargement…'}
                </span>
              )}
              <span className="signalement-piece__nom">{piece.nom}</span>
              {gestes(piece)}
            </li>
          ))}
        </ul>
      )}

      {documents.length > 0 && (
        <ul className="signalement-pieces__documents">
          {documents.map((piece) => (
            <li key={piece.id} className="signalement-piece">
              <span className="signalement-piece__nom">
                <span aria-hidden="true">📄</span> {piece.nom} <small>({tailleLisible(piece.taille)})</small>
              </span>
              {gestes(piece)}
            </li>
          ))}
        </ul>
      )}

      {modifiable && (
        <div className="champ signalement-pieces__ajout">
          <label htmlFor={`signalement-${signalementId}-ajout`}>Ajouter des captures d’écran ou des documents</label>
          <input
            id={`signalement-${signalementId}-ajout`}
            type="file"
            multiple
            accept={ACCEPTE}
            disabled={envoi}
            onChange={ajouter}
          />
          <span className="champ__aide">
            {envoi ? 'Envoi en cours…' : 'Images, PDF, Word, Excel… 10 fichiers au plus, 10 Mo chacun.'}
          </span>
        </div>
      )}
    </section>
  );
}
