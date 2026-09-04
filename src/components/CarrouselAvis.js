import { useCallback, useEffect, useRef, useState } from 'react';
import CarteAvis from './CarteAvis';

/**
 * Les avis qui défilent, sur la page d'accueil.
 *
 * LE DÉFILEMENT EST CELUI DU NAVIGATEUR, PAS UNE ANIMATION MAISON.
 *
 * La piste est une bande qui déborde avec `scroll-snap`, et les flèches ne font
 * qu'appeler `scrollBy`. On hérite ainsi gratuitement du glissement au doigt,
 * de la molette, du défilement inertiel et de la navigation au clavier — toutes
 * choses qu'une piste animée à la main réimplémente mal, quand elle les
 * réimplémente.
 *
 * LA BARRE DE DÉFILEMENT EST MASQUÉE, PAS LE DÉFILEMENT. Les flèches sont la
 * commande visible ; la barre faisait doublon et donnait au bloc l'air d'un
 * tableau qui déborde plutôt que d'un carrousel. Le glissement au doigt, lui,
 * continue de fonctionner — c'est ce qui reste quand les flèches disparaissent
 * sur téléphone.
 *
 * IL NE TOURNE PAS TOUT SEUL, et c'est délibéré. Un carrousel automatique
 * déplace le texte sous les yeux de celui qui le lit ; c'est irritant pour tout
 * le monde et franchement hostile pour un lecteur lent.
 */
export default function CarrouselAvis({ avis }) {
  const piste = useRef(null);
  const [debut, setDebut] = useState(true);
  const [fin, setFin] = useState(false);

  // Les flèches se grisent aux extrémités : une flèche qui ne fait rien est
  // pire qu'une flèche absente, parce qu'on clique deux fois avant de comprendre.
  const jauger = useCallback(() => {
    const el = piste.current;
    if (!el) return;

    setDebut(el.scrollLeft <= 4);
    setFin(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    jauger();

    const el = piste.current;
    if (!el) return undefined;

    el.addEventListener('scroll', jauger, { passive: true });
    window.addEventListener('resize', jauger);

    return () => {
      el.removeEventListener('scroll', jauger);
      window.removeEventListener('resize', jauger);
    };
  }, [jauger, avis]);

  const glisser = (sens) => {
    const el = piste.current;
    if (!el) return;

    // On avance d'une carte visible, pas d'une largeur fixe : la même règle
    // vaut sur un téléphone où l'on en voit une et sur un écran large où l'on
    // en voit trois.
    const carte = el.querySelector('.avis__carte');
    const pas = carte ? carte.getBoundingClientRect().width + 16 : el.clientWidth;

    el.scrollBy({ left: sens * pas, behavior: 'smooth' });
  };

  if (avis.length === 0) return null;

  const plusieurs = avis.length > 1;

  return (
    <div className="carrousel">
      {/* LES FLÈCHES ENCADRENT LA PISTE, elles ne la recouvrent pas. Posées
          par-dessus les cartes, elles masqueraient le début d'un nom et la fin
          d'une phrase — c'est-à-dire ce qu'on vient lire. */}
      {plusieurs && (
        <button
          type="button"
          className="carrousel__fleche"
          onClick={() => glisser(-1)}
          disabled={debut}
          aria-label="Avis précédents"
        >
          ‹
        </button>
      )}

      <div className="carrousel__piste" ref={piste} tabIndex={0} role="list">
        {avis.map((a) => (
          <div className="carrousel__element" role="listitem" key={a.id}>
            <CarteAvis avis={a} />
          </div>
        ))}
      </div>

      {plusieurs && (
        <button
          type="button"
          className="carrousel__fleche"
          onClick={() => glisser(1)}
          disabled={fin}
          aria-label="Avis suivants"
        >
          ›
        </button>
      )}
    </div>
  );
}
