import { useState } from 'react';
import { supprimerMonCompte } from '../lib/api/profilApi';

/**
 * La suppression définitive du compte.
 *
 * POURQUOI ELLE EXISTE
 * -------------------
 * Un parent confie à Mimia le prénom de ses enfants, leur niveau, leurs
 * difficultés scolaires et l'intégralité de ce qu'ils écrivent à leur
 * professeur. Il doit pouvoir tout reprendre, sans écrire à personne et sans
 * avoir à se justifier. Un compte qu'on ne peut quitter qu'en demandant la
 * permission n'est pas un compte, c'est un piège.
 *
 * POURQUOI DEUX ÉCRANS ET NON UN BOUTON
 * ------------------------------------
 * L'action est irréversible et n'a pas de corbeille. Le bouton ne fait donc
 * qu'OUVRIR l'avertissement ; c'est le second geste, dans la fenêtre, qui
 * détruit. Sans cette marche, un clic à côté sur un téléphone effacerait une
 * année de travail scolaire.
 *
 * ET POURQUOI ON ÉNUMÈRE
 * ---------------------
 * « Toutes vos données seront supprimées » ne dit rien : personne ne sait ce
 * que ça recouvre. La liste nommée — les enfants, les cours, les notes, les
 * comptes rendus — est ce qui permet de mesurer avant de confirmer.
 */
function Avertissement({ nombreEnfants, enCours, erreur, onConfirmer, onFermer }) {
  return (
    <div
      className="modale"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titre-suppression"
    >
      <div className="modale__boite">
        <h2 id="titre-suppression">Supprimer définitivement votre compte ?</h2>

        <p className="modale__texte">
          Cette action est <strong>irréversible</strong>. Il n'y a pas de
          corbeille, et nous n'aurons aucun moyen de récupérer quoi que ce soit —
          y compris si vous nous le demandez.
        </p>

        <p className="modale__texte">Seront effacés définitivement :</p>

        <ul className="liste-consequences">
          <li>
            {nombreEnfants > 0
              ? `Le${nombreEnfants > 1 ? 's' : ''} profil${nombreEnfants > 1 ? 's' : ''} de vos ${nombreEnfants} enfant${nombreEnfants > 1 ? 's' : ''}`
              : 'Les profils de vos enfants'}
          </li>
          <li>Tous leurs cours et tout ce qu'ils y ont écrit</li>
          <li>Leurs évaluations, leurs copies et les comptes rendus de séance</li>
          <li>Leur progression et les compétences acquises</li>
          <li>Votre abonnement, qui cesse d'être prélevé</li>
          <li>Vos identifiants de connexion</li>
        </ul>

        <p className="modale__texte">
          Vous pourrez vous réinscrire avec la même adresse, mais ce sera un
          compte neuf : rien de ce qui précède n'y sera rattaché.
        </p>

        {erreur && <div className="alert">{erreur}</div>}

        <div className="modale__actions">
          {/* L'annulation en premier et en bouton plein : c'est l'issue qu'on
              veut rendre la plus facile des deux. La destruction reste
              atteignable, elle n'a pas à être commode. */}
          <button
            type="button"
            className="btn btn--compact"
            onClick={onFermer}
            disabled={enCours}
          >
            Annuler
          </button>

          <button
            type="button"
            className="btn-ghost btn-ghost--danger"
            onClick={onConfirmer}
            disabled={enCours}
          >
            {enCours ? 'Suppression…' : 'Supprimer définitivement mon compte'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuppressionCompte({ nombreEnfants = 0, onSupprime }) {
  const [ouverte, setOuverte] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState(null);

  const supprimer = async () => {
    setEnCours(true);
    setErreur(null);

    try {
      await supprimerMonCompte();
      onSupprime();
    } catch {
      setErreur(
        "Votre compte n'a pas pu être supprimé. Réessayez dans un instant ; "
        + 'si cela se reproduit, écrivez-nous.',
      );
      setEnCours(false);
    }
  };

  return (
    <>
      {ouverte && (
        <Avertissement
          nombreEnfants={nombreEnfants}
          enCours={enCours}
          erreur={erreur}
          onConfirmer={supprimer}
          onFermer={() => setOuverte(false)}
        />
      )}

      {/* En bas de l'onglet et dans son propre cadre : une action destructrice
          ne se range pas à côté de « changer mon mot de passe », qui se clique
          sans y penser. */}
      <section className="bloc-profil bloc-profil--danger">
        <h2>Supprimer mon compte</h2>

        <p className="page__sous-titre">
          Vous partez avec vos données : les profils de vos enfants, leurs cours,
          leurs notes et leur progression sont effacés de nos serveurs. Rien
          n'est conservé, et rien n'est récupérable ensuite.
        </p>

        <button
          type="button"
          className="btn btn--danger"
          onClick={() => setOuverte(true)}
        >
          Supprimer mon compte
        </button>
      </section>
    </>
  );
}
