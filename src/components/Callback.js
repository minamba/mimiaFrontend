import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { traiterCallback } from '../lib/actions/authActions';
import { ouvrirEssai } from '../lib/api/abonnementApi';
import { essaiVise, oublierEssai } from '../lib/storage/essaiVise';
import Loader from './Loader';

/**
 * Atterrissage après la connexion sur le serveur d'identité.
 * Échange le code contre les jetons, puis redirige vers le tableau de bord.
 */
export default function Callback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authentifie, error } = useSelector((state) => state.auth);

  // StrictMode exécute les effets deux fois en développement. Sans ce verrou,
  // le code d'autorisation partirait deux fois — et le second échange échoue
  // toujours, un code n'étant utilisable qu'une seule fois.
  const demarre = useRef(false);

  useEffect(() => {
    if (demarre.current) return;
    demarre.current = true;
    dispatch(traiterCallback());
  }, [dispatch]);

  useEffect(() => {
    if (!authentifie) return;

    let vivant = true;

    (async () => {
      // Il a cliqué « Commencer gratuitement » : l'essai s'ouvre ici, avant
      // qu'il n'arrive sur ses enfants. Le faire passer par la page des tarifs
      // lui demanderait de re-choisir la gratuité qu'on venait de lui promettre.
      //
      // Un échec ne bloque RIEN : il atterrit sur ses enfants comme avant, et
      // la page des tarifs reste là. Retenir quelqu'un sur un écran de
      // connexion parce qu'un abonnement gratuit n'a pas pu s'ouvrir serait
      // une punition sans rapport avec la faute.
      if (essaiVise()) {
        oublierEssai();
        try {
          await ouvrirEssai();
        } catch {
          // Silencieux à dessein : voir ci-dessus.
        }
      }

      if (!vivant) return;

      // Le visiteur s'est connecté depuis la page de tarifs, pour prendre une
      // formule précise. L'envoyer au tableau de bord lui ferait tout
      // recommencer : on le ramène là où il s'était arrêté.
      const formuleVisee = sessionStorage.getItem('mimia-formule-visee');
      navigate(formuleVisee ? '/tarifs' : '/eleves', { replace: true });
    })();

    return () => { vivant = false; };
  }, [authentifie, navigate]);

  if (error) {
    return (
      <section className="centre">
        <div className="alert">{error}</div>
        <button type="button" className="btn" onClick={() => navigate('/', { replace: true })}>
          Retour à l'accueil
        </button>
      </section>
    );
  }

  return <Loader texte="Connexion en cours…" />;
}
