import { useEffect, useState } from 'react';
import {
  ajouterCommentaireSignalement,
  getCommentairesSignalement,
  modifierCommentaireSignalement,
  supprimerCommentaireSignalement,
} from '../lib/api/adminApi';

const LONGUEUR_MAX = 2000;

const dateLisible = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR') : '');

/**
 * LES COMMENTAIRES SOUS UN SIGNALEMENT — Camara, le 03/11/2026 : « on les verra en bas
 * du signalement, modifiables et supprimables ».
 *
 * DES NOTES DE L'ADMINISTRATION : le parent ne les voit pas et aucun mail ne part. Tout
 * administrateur peut modifier ou supprimer ceux d'un autre, l'auteur reste affiché.
 *
 * @param onChange appelé avec le nombre de commentaires, pour le compteur de la liste.
 */
export default function CommentairesSignalement({ signalementId, onChange }) {
  const [commentaires, setCommentaires] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [nouveau, setNouveau] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // Le commentaire ouvert en modification, et celui dont la suppression attend sa confirmation.
  const [enEdition, setEnEdition] = useState(null);
  const [texteEdition, setTexteEdition] = useState('');
  const [aSupprimer, setASupprimer] = useState(null);

  useEffect(() => {
    let vivant = true;

    getCommentairesSignalement(signalementId)
      .then(({ data }) => { if (vivant) setCommentaires(Array.isArray(data) ? data : []); })
      .catch(() => { if (vivant) setErreur("Les commentaires n'ont pas pu être chargés."); })
      .finally(() => { if (vivant) setChargement(false); });

    return () => { vivant = false; };
  }, [signalementId]);

  const remplacer = (liste) => {
    setCommentaires(liste);
    onChange?.(liste.length);
  };

  const executer = async (action, message) => {
    setEnvoi(true);
    setErreur(null);

    try {
      await action();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? message);
    } finally {
      setEnvoi(false);
    }
  };

  const ajouter = (evenement) => {
    evenement.preventDefault();
    const texte = nouveau.trim();
    if (!texte) return undefined;

    return executer(async () => {
      const { data } = await ajouterCommentaireSignalement(signalementId, texte);
      remplacer([...commentaires, data]);
      setNouveau('');
    }, "Le commentaire n'a pas pu être ajouté.");
  };

  const enregistrer = (commentaire) => {
    const texte = texteEdition.trim();
    if (!texte) return undefined;

    return executer(async () => {
      const { data } = await modifierCommentaireSignalement(signalementId, commentaire.id, texte);
      remplacer(commentaires.map((c) => (c.id === commentaire.id ? data : c)));
      setEnEdition(null);
    }, "Le commentaire n'a pas pu être modifié.");
  };

  const supprimer = (commentaire) => executer(async () => {
    await supprimerCommentaireSignalement(signalementId, commentaire.id);
    remplacer(commentaires.filter((c) => c.id !== commentaire.id));
    setASupprimer(null);
  }, "Le commentaire n'a pas pu être supprimé.");

  return (
    <section className="signalement-notes" aria-label="Commentaires">
      <h4 className="signalement-notes__titre">Commentaires</h4>
      <p className="signalement-notes__aide">Visibles par l’administration seulement.</p>

      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && commentaires.length === 0 && (
        <p className="signalement-notes__vide">Aucun commentaire pour le moment.</p>
      )}

      <ul className="signalement-notes__liste">
        {commentaires.map((c) => (
          <li key={c.id} className="signalement-note">
            <p className="signalement-note__meta">
              {c.auteurMail ?? 'Administration'}
              {' · '}
              {dateLisible(c.dateCreation)}
              {c.dateMiseAJour && ` · modifié le ${dateLisible(c.dateMiseAJour)}`}
            </p>

            {enEdition === c.id ? (
              <>
                <textarea
                  rows={3}
                  maxLength={LONGUEUR_MAX}
                  aria-label="Modifier le commentaire"
                  value={texteEdition}
                  onChange={(e) => setTexteEdition(e.target.value)}
                />
                <div className="signalement-note__gestes">
                  <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setEnEdition(null)}>
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--mini"
                    disabled={envoi || !texteEdition.trim()}
                    onClick={() => enregistrer(c)}
                  >
                    Enregistrer
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="signalement-note__texte">{c.texte}</p>
                <div className="signalement-note__gestes">
                  {aSupprimer === c.id ? (
                    <>
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini btn-ghost--danger"
                        disabled={envoi}
                        onClick={() => supprimer(c)}
                      >
                        Confirmer
                      </button>
                      <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setASupprimer(null)}>
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini"
                        onClick={() => { setEnEdition(c.id); setTexteEdition(c.texte); setASupprimer(null); }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini btn-ghost--danger"
                        onClick={() => { setASupprimer(c.id); setEnEdition(null); }}
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <form className="signalement-notes__ajout" onSubmit={ajouter}>
        <textarea
          rows={3}
          maxLength={LONGUEUR_MAX}
          aria-label="Ajouter un commentaire"
          placeholder="Ajouter un commentaire…"
          value={nouveau}
          onChange={(e) => setNouveau(e.target.value)}
        />
        <button type="submit" className="btn btn--compact" disabled={envoi || !nouveau.trim()}>
          Ajouter le commentaire
        </button>
      </form>
    </section>
  );
}
