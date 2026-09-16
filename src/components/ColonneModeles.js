import { useEffect, useState } from 'react';
import { getModelesMail, supprimerModeleMail } from '../lib/api/adminApi';
import { dateUtc } from '../lib/storage/dateUtc';
import { formaterProchainEnvoi } from '../lib/storage/planificationMail';
import Onglets from './Onglets';

const NATURES = [
  { cle: 'Diffusion', libelle: 'Diffusion de masse' },
  { cle: 'Automatique', libelle: 'Automatique' },
];

const jour = (valeur) =>
  dateUtc(valeur)?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) ?? '';

/** Ce qu'on veut savoir d'un coup d'œil, sous le nom. */
function Badge({ modele }) {
  if (modele.nature === 'Automatique') {
    if (modele.reglesADefinir) {
      return <span className="modeles__badge modeles__badge--attente">Règles à définir</span>;
    }

    // « POUR CEUX QUI SONT DÉJÀ PROGRAMMÉS, JE VEUX VOIR QUAND » — Camara.
    return modele.actif
      ? (
        <span className="modeles__badge modeles__badge--programme">
          Programmé
          {modele.prochaineExecution && ` · ${formaterProchainEnvoi(modele.prochaineExecution)}`}
        </span>
      )
      : <span className="modeles__badge">Non programmé</span>;
  }

  return modele.dernierEnvoiLe
    ? <span className="modeles__badge">Envoyé le {jour(modele.dernierEnvoiLe)}</span>
    : <span className="modeles__badge">Pas encore envoyé</span>;
}

/**
 * LA COLONNE DES TEMPLATES, À DROITE DU FORMULAIRE — Camara, le 15/09/2026.
 *
 * Choisir une ligne remplit le formulaire ; « Nouveau message » le vide et
 * quitte le template — et, dans la liste « Automatique », ouvre la création
 * d'un nouveau courriel automatique. `natureFixe` masque le sélecteur :
 * « Écrire à un parent » n'a que les diffusions.
 *
 * SUPPRIMER DEMANDE UNE CONFIRMATION, DANS LA LIGNE. Un template supprimé ne
 * revient pas, et ses images non plus. Le serveur dit lesquels se suppriment
 * (`supprimable`) : les courriels reliés à un envoi — bilans, période d'essai,
 * demandes d'avis — n'ont pas le bouton.
 */
export default function ColonneModeles({
  nature,
  onNature,
  natureFixe = false,
  selectionId,
  onSelectionner,
  onNouveau,
  onSupprime,
  revision = 0,
}) {
  const [modeles, setModeles] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [aConfirmer, setAConfirmer] = useState(null);

  useEffect(() => {
    let vivant = true;

    getModelesMail(nature)
      .then(({ data }) => {
        if (!vivant) return;
        setModeles(data ?? []);
        setErreur(null);
      })
      .catch(() => {
        if (!vivant) return;
        setModeles((actuels) => actuels ?? []);
        setErreur('La liste des templates n’a pas pu être chargée.');
      });

    return () => { vivant = false; };
  }, [nature, revision]);

  const supprimer = async (id) => {
    try {
      await supprimerModeleMail(id);
      setAConfirmer(null);
      setModeles((liste) => (liste ?? []).filter((m) => m.id !== id));
      onSupprime?.(id);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Le template n’a pas pu être supprimé.');
    }
  };

  const vide = nature === 'Automatique'
    ? 'Aucun courriel automatique. Cliquez sur « Nouveau message » pour en créer un.'
    : 'Aucun template. Écrivez un message puis cliquez sur « Enregistrer le template » — un message envoyé à tous les parents est aussi enregistré.';

  return (
    <aside className="modeles" aria-label="Templates de courriel">
      <div className="modeles__entete">
        <h3 className="modeles__titre">Templates</h3>
        <button type="button" className="btn btn--compact btn--fantome" onClick={onNouveau}>
          Nouveau message
        </button>
      </div>

      {!natureFixe && (
        <Onglets
          mini
          etiquette="Type de template"
          actif={nature}
          onChoisir={onNature}
          items={NATURES}
        />
      )}

      {erreur && <p className="modeles__erreur">{erreur}</p>}

      {modeles === null && <p className="modeles__vide">Chargement…</p>}

      {modeles?.length === 0 && <p className="modeles__vide">{vide}</p>}

      {modeles?.length > 0 && (
        <ul className="modeles__liste">
          {modeles.map((m) => (
            <li key={m.id} className={`modeles__item${m.id === selectionId ? ' est-choisi' : ''}`}>
              <button
                type="button"
                className="modeles__choisir"
                aria-pressed={m.id === selectionId}
                onClick={() => onSelectionner(m.id)}
              >
                <span className="modeles__nom">{m.nom}</span>
                {m.description && <span className="modeles__description">{m.description}</span>}
                <Badge modele={m} />
              </button>

              {m.supprimable && (
                aConfirmer === m.id ? (
                  <span className="modeles__confirmation">
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini btn-ghost--danger"
                      onClick={() => supprimer(m.id)}
                    >
                      Confirmer la suppression
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini"
                      onClick={() => setAConfirmer(null)}
                    >
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--mini btn-ghost--danger modeles__supprimer"
                    onClick={() => setAConfirmer(m.id)}
                    aria-label={`Supprimer le template ${m.nom}`}
                  >
                    Supprimer
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
