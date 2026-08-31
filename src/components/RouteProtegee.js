import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { sessionEleve } from '../lib/storage/sessionEleve';
import Loader from './Loader';

/**
 * Bloque l'accès tant que l'état d'authentification n'est pas connu.
 *
 * Le `loading` est indispensable : au premier rendu, `authentifie` est faux
 * parce qu'on n'a pas encore lu le stockage de session. Rediriger tout de
 * suite éjecterait un utilisateur pourtant connecté à chaque rafraîchissement.
 *
 * `admin` masque la route aux non-administrateurs. Ce n'est qu'un confort
 * d'interface : l'API revérifie le rôle sur chaque appel, un utilisateur qui
 * forcerait l'URL n'obtiendrait que des 403.
 */
export default function RouteProtegee({ children, admin = false }) {
  const { authentifie, estAdmin, loading } = useSelector((state) => state.auth);

  // DEUX FAÇONS D'ÊTRE CHEZ SOI.
  //
  // Le parent porte une session OpenID ; l'enfant porte un jeton obtenu avec
  // son code. Ce composant ne connaissait que la première, et un enfant
  // parfaitement authentifié était renvoyé à l'accueil.
  //
  // Ce qu'un enfant peut atteindre ne se décide PAS ici : le serveur refuse
  // tout ce qui n'est pas à lui. Ici on dit seulement « quelqu'un est
  // connecté », et `VerrouEleve` évite de l'emmener où il n'a rien à voir.
  const eleve = sessionEleve();

  if (eleve) return admin ? <Navigate to="/" replace /> : children;

  if (loading) return <Loader texte="Vérification de la session…" />;
  if (!authentifie) return <Navigate to="/" replace />;
  if (admin && !estAdmin) return <Navigate to="/eleves" replace />;

  return children;
}
