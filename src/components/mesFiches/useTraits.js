import { useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { entrerEnImpression, sortirDeLImpression } from '../../lib/mesFiches/impression';

/**
 * LES TRAITS D'UNE CARTE, MESURÉS SUR CE QUI EST VRAIMENT À L'ÉCRAN.
 *
 * Les bulles et les étiquettes sont du HTML ordinaire : le texte s'y replie
 * tout seul, quelle que soit sa longueur, ce que le SVG ne sait pas faire.
 * Les traits, eux, sont un calque SVG posé dessus, recalculé dès que la
 * carte change de taille (fenêtre, police chargée, réponse dépliée).
 *
 * `liens` : [{ de, a, couleur, forme }] — `de` et `a` sont les valeurs de
 * l'attribut `data-ancre` des deux éléments à relier. `forme` dit d'où part
 * et où arrive le trait :
 *   - 'branche' : du bord droit de l'un au bord gauche de l'autre ;
 *   - 'feuille' : du bord droit de l'un au pied gauche de l'autre (le mot
 *     est souligné, le trait file sous lui) ;
 *   - 'fleche'  : du bord de l'un au bord de l'autre, sur la droite qui
 *     joint leurs centres.
 *
 * Sans mise en page (tests, impression avant rendu), rien n'est tracé : la
 * carte reste lisible sans ses traits.
 */
export default function useTraits(conteneur, liens, actif = true) {
  const [traits, setTraits] = useState({ largeur: 0, hauteur: 0, chemins: [] });
  const cle = JSON.stringify(liens);

  useLayoutEffect(() => {
    const boite = conteneur.current;
    if (!boite || !actif) {
      setTraits({ largeur: 0, hauteur: 0, chemins: [] });
      return undefined;
    }

    const mesurer = () => {
      const origine = boite.getBoundingClientRect();
      if (!origine.width) return;

      // UNE CARTE RÉDUITE (la miniature de la page de création, 15/10/2026) :
      // `getBoundingClientRect` rend des mesures déjà réduites, que le calque,
      // réduit avec la carte, réduirait une seconde fois. On revient à
      // l'échelle de la mise en page, que donne `offsetWidth`.
      const echelle = boite.offsetWidth ? origine.width / boite.offsetWidth : 1;

      const rect = (ancre) => {
        const el = boite.querySelector(`[data-ancre="${ancre}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (!r.width) return null;
        return {
          x: (r.left - origine.left) / echelle,
          y: (r.top - origine.top) / echelle,
          l: r.width / echelle,
          h: r.height / echelle,
        };
      };

      const chemins = [];

      JSON.parse(cle).forEach((lien) => {
        const a = rect(lien.de);
        const b = rect(lien.a);
        if (!a || !b) return;

        if (lien.forme === 'fleche') {
          const [x1, y1] = bordVers(a, b);
          const [x2, y2] = bordVers(b, a);
          // Une courbe légère plutôt qu'une droite : c'est ce qui donne à la
          // carte son air dessiné à la main.
          const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
          const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
          chemins.push({ ...lien, d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}` });
          return;
        }

        const x1 = a.x + a.l;
        const y1 = a.y + a.h / 2;
        const x2 = b.x;
        const y2 = lien.forme === 'feuille' ? b.y + b.h - 1 : b.y + b.h / 2;
        const dx = Math.max(24, (x2 - x1) / 2);
        chemins.push({ ...lien, d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}` });
      });

      setTraits({ largeur: origine.width / echelle, hauteur: origine.height / echelle, chemins });
    };

    mesurer();

    const Observateur = window.ResizeObserver;
    const observateur = Observateur ? new Observateur(mesurer) : null;
    observateur?.observe(boite);
    window.addEventListener('resize', mesurer);
    document.fonts?.ready?.then?.(mesurer).catch?.(() => {});

    // À L'IMPRESSION, LA FICHE CHANGE DE LARGEUR (celle d'une page A4) : les
    // traits sont remesurés avant que le navigateur ne fige la page, et
    // `flushSync` les écrit tout de suite — un rendu différé arriverait
    // après la capture. Au retour, on remesure à la largeur de l'écran.
    const avantImpression = () => {
      entrerEnImpression();
      flushSync(mesurer);
    };
    const apresImpression = () => {
      sortirDeLImpression();
      flushSync(mesurer);
    };
    window.addEventListener('beforeprint', avantImpression);
    window.addEventListener('afterprint', apresImpression);

    return () => {
      observateur?.disconnect();
      window.removeEventListener('resize', mesurer);
      window.removeEventListener('beforeprint', avantImpression);
      window.removeEventListener('afterprint', apresImpression);
    };
  }, [conteneur, cle, actif]);

  return traits;
}

/** Le point où la droite qui va du centre de `a` au centre de `b` sort de `a`. */
function bordVers(a, b) {
  const cx = a.x + a.l / 2;
  const cy = a.y + a.h / 2;
  const dx = b.x + b.l / 2 - cx;
  const dy = b.y + b.h / 2 - cy;
  if (dx === 0 && dy === 0) return [cx, cy];

  const marge = 6;
  const tx = dx === 0 ? Infinity : (a.l / 2 + marge) / Math.abs(dx);
  const ty = dy === 0 ? Infinity : (a.h / 2 + marge) / Math.abs(dy);
  const t = Math.min(tx, ty);
  return [cx + dx * t, cy + dy * t];
}
