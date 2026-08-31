import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useMaintenance } from '../lib/storage/modeTest';
import Maintenance from './Maintenance';

/**
 * Les adresses qui restent ouvertes rideau tiré.
 *
 * SANS ELLES, PERSONNE NE PEUT PLUS ENTRER — ADMINISTRATEUR COMPRIS.
 * La connexion se termine sur `/callback` : le masquer renverrait
 * l'administrateur revenant du serveur d'identité sur la page d'attente, et
 * sa session ne serait jamais établie. Il ne pourrait plus lever le rideau
 * qu'en modifiant la base à la main.
 *
 * `/silent-renew` est l'iframe de renouvellement du jeton : elle ne rend rien,
 * mais l'intercepter casserait les sessions en cours.
 */
const OUVERTES = ['/callback', '/silent-renew'];

/**
 * Tire le rideau devant les visiteurs, jamais devant l'administrateur.
 *
 * CE N'EST QU'UN AFFICHAGE, ET C'EST VOULU
 * ----------------------------------------
 * L'API répond normalement derrière ce rideau. Ce n'est pas un oubli : si le
 * mode maintenance coupait aussi l'API, l'administrateur qui vient de
 * l'activer ne pourrait plus rien faire — pas même le désactiver. Pour fermer
 * vraiment le service, on arrête l'API ; c'est un autre geste, et il ne doit
 * pas se confondre avec celui-ci.
 *
 * ON ATTEND DE SAVOIR QUI EST LÀ AVANT DE MASQUER
 * -----------------------------------------------
 * Le rôle arrive après la restauration de session. Masquer pendant ce
 * chargement ferait clignoter la page d'attente devant l'administrateur à
 * chaque rafraîchissement — et pire, l'y laisserait si la restauration
 * échouait à s'annoncer.
 */
export default function VerrouMaintenance({ children }) {
  const { estAdmin, loading } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const maintenance = useMaintenance();

  if (!maintenance) return children;
  if (loading) return children;
  if (estAdmin) return children;
  if (OUVERTES.includes(pathname)) return children;

  return <Maintenance />;
}
