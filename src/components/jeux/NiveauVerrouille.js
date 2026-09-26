import { useEffect, useRef } from 'react';
import iconeVerrou from '../../assets/nolevel.webp';

/**
 * « TU N'AS PAS ENCORE LE NIVEAU » — la fenêtre du cadenas.
 *
 * Camara, le 23/09/2026 : « quand on clique sur un niveau auquel on n'a pas
 * accès, je voudrais que le message apparaisse dans une popup avec l'icône
 * nolevel.png ».
 *
 * LE MESSAGE VIVAIT SOUS LA FRISE, sur une ligne de texte. Il disait la même
 * chose, mais un enfant qui vient d'appuyer sur un portail regarde le
 * portail : la phrase apparaissait ailleurs, en petit, et se confondait avec
 * le reste de la page. Une fenêtre ne peut pas se manquer, et le dessin fait
 * comprendre le refus avant même qu'on ait lu.
 *
 * CE N'EST PAS UNE PUNITION, C'EST UN RENDEZ-VOUS. Le texte dit quand ça
 * s'ouvrira, et le bouton est un acquiescement — « J'ai compris » — pas une
 * excuse à présenter.
 *
 * Les usages de la maison : Échap referme, un clic sur le voile aussi, le
 * focus part sur le bouton à l'ouverture. Le verrou de défilement est
 * automatique dès qu'`aria-modal` est posé — voir `verrouDefilement.js`.
 */
export default function NiveauVerrouille({ etape, onFermer }) {
  const boutonRef = useRef(null);

  // Par une référence : la frise repasse une nouvelle fonction à chaque
  // rendu, et cet effet ne doit tourner qu'à l'ouverture.
  const onFermerRef = useRef(onFermer);
  onFermerRef.current = onFermer;

  useEffect(() => {
    boutonRef.current?.focus();

    const auClavier = (e) => { if (e.key === 'Escape') onFermerRef.current(); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, []);

  return (
    <div
      className="modale"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verrou-titre"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}
    >
      <div className="modale__boite verrou">
        {/* Décorative : le titre juste en dessous dit la même chose en
            toutes lettres. */}
        <img className="verrou__icone" src={iconeVerrou} alt="" />

        {/* LA PHRASE DE CAMARA, MOT POUR MOT. Elle est le titre et non le
            corps : c'est elle qu'on doit lire en premier, et un titre plus
            court aurait obligé à la couper en deux. */}
        <h2 id="verrou-titre" className="verrou__titre">
          Tu n’as pas encore le niveau pour débloquer ces jeux
        </h2>

        <p className="verrou__texte">
          Ceux de <strong>{etape.libelle}</strong> s’ouvriront quand tu y
          seras&nbsp;!
        </p>

        <button
          ref={boutonRef}
          type="button"
          className="btn btn--principal verrou__bouton"
          onClick={onFermer}
        >
          J’ai compris
        </button>
      </div>
    </div>
  );
}
