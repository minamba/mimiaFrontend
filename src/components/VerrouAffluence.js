import { useLocation } from 'react-router-dom';
import { useSalleDAttente } from '../lib/affluence/salleDAttente';
import SalleDAttente from './SalleDAttente';

/**
 * Les adresses qui restent ouvertes même en file d'attente.
 *
 * LES MÊMES QUE POUR LE RIDEAU DE MAINTENANCE, et pour une raison voisine.
 * `/callback` est le point d'arrivée du serveur d'identité : couvrir cette
 * page-là laisserait la session à moitié établie, et le visiteur reviendrait
 * se connecter en boucle sans jamais aboutir. `/silent-renew` est l'iframe de
 * renouvellement du jeton — elle ne rend rien, mais l'intercepter casserait
 * les sessions en cours.
 */
const OUVERTES = ['/callback', '/silent-renew'];

/**
 * Montre la file d'attente quand le serveur a refusé faute de place.
 *
 * IL N'Y A PAS DE TEST DE RÔLE ICI, contrairement au rideau de maintenance, et
 * ce n'est pas un oubli : c'est le SERVEUR qui laisse passer l'administrateur.
 * Il ne reçoit donc jamais de refus, la file ne s'arme jamais chez lui, et cet
 * écran ne peut pas s'afficher devant lui. Un second test côté navigateur
 * dupliquerait une décision déjà prise — et le jour où les deux divergeraient,
 * c'est celui du navigateur qui aurait tort.
 *
 * ET IL NE S'ARME QUE SUR UN REFUS RÉEL. Tant que la salle d'attente est
 * éteinte dans l'administration, rien de tout ceci ne s'exécute : aucun appel,
 * aucun état, aucun rendu. C'est ce qui permet de le laisser en place en
 * permanence sans rien coûter.
 */
export default function VerrouAffluence({ children }) {
  const { enFile } = useSalleDAttente();
  const { pathname } = useLocation();

  if (!enFile) return children;
  if (OUVERTES.includes(pathname)) return children;

  return <SalleDAttente />;
}
