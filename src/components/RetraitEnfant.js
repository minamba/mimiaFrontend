import { useState } from 'react';
import { archiverEleve, supprimerDonneesEleve } from '../lib/api/elevesApi';

/**
 * Retirer un profil enfant, ou effacer ses données.
 *
 * DEUX gestes, et c'est tout l'objet de cette fenêtre. Un parent qui cherche
 * « supprimer » veut presque toujours libérer une place — son aîné a arrêté, sa
 * cadette commence — et non anéantir deux ans de suivi. Lui proposer d'emblée
 * l'effacement définitif, c'est lui faire détruire ce qu'il voulait garder.
 *
 * Le retrait est donc au premier plan, l'effacement en dessous, atteignable
 * mais délibéré : il faut retaper le prénom. Une confirmation qu'on ne peut pas
 * donner par réflexe est la seule qui protège d'un geste irréversible.
 *
 * SAUF QUAND LE PROFIL EST DÉJÀ RETIRÉ.
 * -------------------------------------
 * Depuis la liste des profils retirés, ce raisonnement s'inverse. Le parent a
 * déjà libéré la place ; il ne reste qu'un geste possible, l'effacement. Lui
 * proposer « Retirer le profil » revenait à lui offrir un bouton qui ne fait
 * rien — la place est déjà libre — pour l'action qu'il venait justement de
 * demander. Il cliquait sur « Supprimer les données » et se voyait proposer un
 * retrait : de quoi croire que le bouton s'était trompé de fenêtre.
 *
 * `dejaRetire` vient de l'appelant plutôt que d'un champ de l'élève : c'est
 * l'ÉCRAN qui sait d'où vient le clic, et le savoir ne dépend alors d'aucune
 * forme de réponse d'API.
 */
export default function RetraitEnfant({ eleve, dejaRetire = false, onFerme, onFait }) {
  const [mode, setMode] = useState(dejaRetire ? 'effacement' : 'retrait');
  const [confirmation, setConfirmation] = useState('');
  const [encours, setEncours] = useState(false);
  const [erreur, setErreur] = useState(null);

  const prenom = eleve.prenom ?? '';

  // Comparaison insensible à la casse et aux espaces : on vérifie une
  // intention, pas une dictée.
  const prenomSaisi =
    confirmation.trim().toLocaleLowerCase('fr') === prenom.trim().toLocaleLowerCase('fr');

  const agir = async (action, message) => {
    setEncours(true);
    setErreur(null);

    try {
      await action(eleve.id);
      onFait();
    } catch {
      setErreur(message);
      setEncours(false);
    }
  };

  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-retrait">
      <div className="modale__boite">
        {mode === 'retrait' ? (
          <>
            <h2 id="titre-retrait">Retirer le profil de {prenom} ?</h2>

            <p className="modale__texte">
              Son profil disparaît de vos enfants et <strong>libère sa place</strong> dans
              votre formule. Vous pourrez inscrire un autre enfant à la place.
            </p>

            <p className="modale__texte">
              Rien n'est effacé : ses cours, ses évaluations et ses fiches de révision
              sont conservés, et vous pouvez le remettre quand vous voulez.
            </p>

            {erreur && <div className="alert">{erreur}</div>}

            <div className="modale__actions">
              <button type="button" className="btn-ghost" onClick={onFerme} disabled={encours}>
                Annuler
              </button>

              <button
                type="button"
                className="btn btn--compact"
                disabled={encours}
                onClick={() => agir(archiverEleve, "Le profil n'a pas pu être retiré.")}
              >
                {encours ? 'Retrait…' : 'Retirer le profil'}
              </button>
            </div>

            {/* En retrait, et formulé sans ambiguïté : c'est l'autre besoin,
                celui du parent qui quitte le service. */}
            <p className="modale__note">
              Vous souhaitez effacer définitivement ses données ?{' '}
              <button
                type="button"
                className="lien-nu"
                onClick={() => { setMode('effacement'); setErreur(null); }}
              >
                Supprimer les données de {prenom}
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 id="titre-retrait">Supprimer les données de {prenom}</h2>

            <p className="modale__texte">
              Cette action efface <strong>définitivement</strong> son identité, ses cours,
              ses évaluations, ses copies, ses comptes rendus et ses fiches de révision.
              Elle ne peut pas être annulée.
            </p>

            <p className="modale__texte">
              Le décompte des heures déjà consommées ce mois-ci est conservé, sans son nom :
              c'est la comptabilité de votre abonnement, elle ne dit plus rien de lui.
            </p>

            <div className="champ">
              <label htmlFor="confirmation-prenom">
                Pour confirmer, tapez <strong>{prenom}</strong>
              </label>
              <input
                id="confirmation-prenom"
                value={confirmation}
                onChange={(evenement) => setConfirmation(evenement.target.value)}
                autoComplete="off"
              />
            </div>

            {erreur && <div className="alert">{erreur}</div>}

            <div className="modale__actions">
              {/* « Retour » n'a de sens que s'il y a un écran précédent. Ouvert
                  directement sur l'effacement, le seul geste d'échappement est
                  de refermer — et le nommer « Retour » ferait espérer une étape
                  qui n'existe pas. */}
              <button
                type="button"
                className="btn-ghost"
                onClick={dejaRetire
                  ? onFerme
                  : () => { setMode('retrait'); setConfirmation(''); }}
                disabled={encours}
              >
                {dejaRetire ? 'Annuler' : 'Retour'}
              </button>

              <button
                type="button"
                className="btn btn--compact btn--danger"
                disabled={!prenomSaisi || encours}
                onClick={() =>
                  agir(supprimerDonneesEleve, "Les données n'ont pas pu être effacées.")}
              >
                {encours ? 'Effacement…' : 'Supprimer définitivement'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
