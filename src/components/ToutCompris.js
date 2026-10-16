import { useEffect, useRef, useState } from 'react';

/**
 * « TOUT CE DONT VOTRE ENFANT A BESOIN, DANS UN SEUL ABONNEMENT » — sous le
 * prix de la page d'accueil (Camara, le 11/10/2026).
 *
 * DES PASTILLES VIVANTES, PAS UNE LISTE GRISE — Camara, le même jour : « mets
 * un effet sur les bulles, que ce soit plus sympathique ». Chacune a son icône
 * et sa teinte ; elles entrent en cascade quand la carte arrive à l'écran, et
 * se soulèvent au survol. Sans mouvement si le visiteur l'a demandé
 * (`prefers-reduced-motion`, dans la feuille de style).
 *
 * L'ORIENTATION n'y figure que si la conseillère est visible : la page ne
 * promet pas ce que l'application cache.
 */
const TEINTES = ['#ff7d5e', '#f5a524', '#8b5cf6', '#ec4899', '#22c55e', '#60a5fa'];

const BRIQUES = [
  { icone: '👩‍🏫', libelle: 'Un professeur par matière' },
  { icone: '🎙️', libelle: 'Conversation à voix haute' },
  { icone: '🖍️', libelle: 'Tableau' },
  { icone: '📝', libelle: 'Exercices' },
  { icone: '🎮', libelle: 'Jeux' },
  { icone: '🎧', libelle: 'Dictées et oral' },
  { icone: '✅', libelle: 'Contrôles' },
  { icone: '🎓', libelle: 'Examens' },
  { icone: '🧭', libelle: 'Orientation', orientation: true },
  { icone: '📊', libelle: 'Suivi parent' },
];

export default function ToutCompris({ orientation = false }) {
  const cadre = useRef(null);
  // Sans IntersectionObserver (vieux navigateur, tests), tout est visible d'emblée.
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (visible || !cadre.current) return undefined;
    const observateur = new IntersectionObserver(([entree]) => {
      if (entree.isIntersecting) {
        setVisible(true);
        observateur.disconnect();
      }
    }, { threshold: 0.3 });
    observateur.observe(cadre.current);
    return () => observateur.disconnect();
  }, [visible]);

  const briques = BRIQUES.filter((b) => !b.orientation || orientation);

  return (
    <div ref={cadre} className={`tout-compris${visible ? ' est-visible' : ''}`}>
      <strong className="tout-compris__titre">
        Tout ce dont votre enfant a besoin, dans un seul abonnement
      </strong>
      <ul className="tout-compris__liste">
        {briques.map((b, i) => (
          <li
            key={b.libelle}
            style={{ '--teinte': TEINTES[i % TEINTES.length], '--rang': i }}
          >
            <span className="tout-compris__icone" aria-hidden="true">{b.icone}</span>
            {b.libelle}
          </li>
        ))}
      </ul>
    </div>
  );
}
