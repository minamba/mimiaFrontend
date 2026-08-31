import { Link } from 'react-router-dom';

/**
 * L'encadré qui explique pourquoi on ne peut pas ajouter d'enfant de plus.
 *
 * Partagé entre la page « Vos enfants » et l'onglet « Mes enfants » du compte,
 * parce que les deux écrans avaient la même limite à annoncer et que seul le
 * premier la connaissait : le second offrait un bouton « Ajouter un enfant »
 * qui menait à un formulaire voué au refus. Un texte recopié aurait dérivé au
 * premier changement de formulation ; il n'existe donc qu'ici.
 *
 * La limite se dit AVANT le clic. Laisser le bouton et refuser ensuite fait
 * remplir un formulaire pour rien, et le refus se lit alors comme une panne
 * plutôt que comme une limite d'offre.
 */
export default function QuotaEnfants({ capacite, enPage = false }) {
  if (!capacite) return null;

  const { offreLibelle, maximum, actuels } = capacite;

  return (
    <div className={`quota__avertissement ${enPage ? 'quota__avertissement--page' : ''}`}>
      <p>
        {offreLibelle
          ? `Votre formule ${offreLibelle} couvre ${maximum} enfant${
              maximum > 1 ? 's' : ''
            }, et vous en avez ${actuels}.`
          : "Vous n'avez pas encore de formule."}{' '}
        Pour enregistrer un enfant de plus, il faut passer à une formule plus large.
      </p>

      <Link to="/tarifs" className="btn btn--compact">
        Voir les formules
      </Link>
    </div>
  );
}
