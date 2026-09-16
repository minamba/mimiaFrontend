import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { login } from '../lib/actions/authActions';
import Loader from './Loader';

/**
 * La clé où l'on retient où aller après la connexion. Relue par `Callback`.
 */
export const CLE_RETOUR_APRES_CONNEXION = 'mimia-retour-apres-connexion';

const FORMULAIRE_AVIS = '/profil?onglet=avis';

/**
 * « Donner mon avis », la page des liens de courriel — Camara, le 15/09/2026.
 *
 * POURQUOI UNE PAGE PUBLIQUE, ET PAS UN LIEN DIRECT VERS LE PROFIL
 * ---------------------------------------------------------------
 * La session d'un parent vit dans l'onglet (`sessionStorage`). Un lien ouvert
 * depuis une messagerie ouvre un onglet NEUF, donc déconnecté, et la route
 * protégée du profil le renverrait à l'accueil : le parent qui voulait donner
 * son avis tomberait sur la page de présentation, sans formulaire.
 *
 * Ici, il se connecte d'un clic, et `Callback` — qui a retenu la destination,
 * comme il retient l'essai visé — l'amène directement sur l'onglet « Votre
 * avis ». Déjà connecté dans cet onglet, il y va tout de suite.
 */
export default function DonnerAvis() {
  const dispatch = useDispatch();
  const { authentifie, loading } = useSelector((state) => state.auth);

  if (authentifie) return <Navigate to={FORMULAIRE_AVIS} replace />;
  if (loading) return <Loader texte="Un instant…" />;

  const seConnecter = () => {
    sessionStorage.setItem(CLE_RETOUR_APRES_CONNEXION, FORMULAIRE_AVIS);
    dispatch(login());
  };

  return (
    <section className="page donner-avis">
      <div className="donner-avis__carte">
        <h1>Votre avis sur Mimia</h1>
        <p className="donner-avis__texte">
          Ce qui fonctionne, ce qui manque, ce que vous aimeriez voir changer : quelques mots
          suffisent, et tous les avis sont lus. Connectez-vous pour arriver directement au
          formulaire.
        </p>
        <button type="button" className="btn" onClick={seConnecter}>
          Me connecter pour donner mon avis
        </button>
      </div>
    </section>
  );
}
