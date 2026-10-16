import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { chargerEleves } from '../../lib/actions/elevesActions';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { rangDeLaClasse } from '../../lib/jeux/frise';

/**
 * L'élève dont on regarde les fiches, et le rang de sa classe (1 = CP).
 *
 * Même règle que « Mes jeux » : en session enfant, la classe vient de la
 * session (le serveur refuse la liste des enfants à un enfant) ; pour un
 * parent, de la liste, chargée ici si un F5 l'a vidée.
 */
export default function useEleveFiches(eleveId) {
  const dispatch = useDispatch();
  const liste = useSelector((etat) => etat.eleves?.liste) ?? [];
  const enfant = sessionEleve();
  const sien = String(enfant?.eleveId) === String(eleveId);

  useEffect(() => {
    if (liste.length === 0 && !sien) dispatch(chargerEleves());
  }, [dispatch, liste.length, sien]);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const niveauCode = eleve?.niveauCode ?? (sien ? (enfant?.niveauCode || enfant?.niveau) : null);

  return {
    prenom: eleve?.prenom ?? (sien ? enfant?.prenom : null),
    niveauCode,
    rang: rangDeLaClasse(niveauCode),
    enfant: sien,
  };
}
