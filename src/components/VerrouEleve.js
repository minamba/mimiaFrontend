import { useLocation, Navigate } from 'react-router-dom';
import { accueilEleve, adresseInterdite, sessionEleve } from '../lib/storage/sessionEleve';

/**
 * Garde un enfant dans son espace.
 *
 * CE N'EST QU'UN CONFORT, ET C'EST IMPORTANT DE LE SAVOIR
 * ------------------------------------------------------
 * La vraie barrière est côté serveur : l'API refuse tout ce qui n'est pas à
 * cet enfant, quelle que soit l'adresse tapée. Ce composant évite seulement de
 * l'emmener sur une page qui se remplirait d'erreurs — un enfant devant une
 * facturation vide et cassée ne comprend pas qu'il n'avait rien à y faire.
 *
 * Si un jour ce fichier disparaît, rien ne fuit. Si le filtre côté API
 * disparaît, tout fuit. C'est là qu'est le verrou.
 */
export default function VerrouEleve({ children }) {
  const { pathname } = useLocation();
  const session = sessionEleve();

  if (!session) return children;

  if (adresseInterdite(pathname, session.eleveId)) {
    return <Navigate to={accueilEleve(session.eleveId)} replace />;
  }

  return children;
}
