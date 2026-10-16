import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getEspaceParent } from '../api/espaceParentApi';
import { sessionEleve } from '../storage/sessionEleve';

/**
 * CE QUE L'ESPACE PARENT OUVRE AU PARENT CONNECTÉ — Camara, le 16/10/2026 :
 * « Mon espace parent », visible seulement des parents qui ont le droit de
 * créer des fiches (coché dans Admin › Parents ; le super-administrateur
 * l'a toujours).
 *
 * Rend `{ fiches, sansLimite, actif }`, ou NULL tant qu'on ne sait pas. Jamais
 * pour une session d'enfant : l'espace parent n'existe pas pour lui. Une
 * erreur de lecture ferme l'espace (rien ne s'affiche plutôt qu'un bouton qui
 * mènerait à un refus).
 */
export default function useEspaceParent() {
  const { authentifie } = useSelector((etat) => etat.auth);
  const enfant = Boolean(sessionEleve());
  const [espace, setEspace] = useState(null);

  useEffect(() => {
    if (!authentifie || enfant) {
      setEspace({ fiches: false, sansLimite: false, actif: false });
      return undefined;
    }
    let vivant = true;
    getEspaceParent()
      .then(({ data }) => { if (vivant) setEspace(data ?? { fiches: false }); })
      .catch(() => { if (vivant) setEspace({ fiches: false, sansLimite: false, actif: false }); });
    return () => { vivant = false; };
  }, [authentifie, enfant]);

  return espace;
}
