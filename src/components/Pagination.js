import { useEffect, useMemo, useState } from 'react';

/**
 * LA PAGINATION — Camara, le 12/10/2026 : « un système de pagination, 10
 * éléments par page », sur les rapports d'orientation et dans toutes les
 * sections de la fiche de l'élève, SAUF les listes de compétences (points
 * fragiles, acquises, en cours d'acquisition, à confirmer), qui gardent leur
 * « Voir les autres ».
 *
 * Elle remplace le « Voir plus » des historiques, choisi au départ pour garder
 * sous les yeux ce qu'on a lu : avec beaucoup de données, la page devenait
 * trop longue à parcourir.
 */
export const PAR_PAGE = 10;

/** La pagination d'une liste déjà en mémoire. Revient à la page 1 quand la liste change. */
export function usePage(liste, parPage = PAR_PAGE) {
  const elements = useMemo(() => liste ?? [], [liste]);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(elements.length / parPage));

  // Sur la LONGUEUR, pas sur l'identité : une liste recalculée à chaque rendu
  // ramènerait sinon à la page 1 en boucle.
  useEffect(() => { setPage(0); }, [elements.length]);

  const courante = Math.min(page, pages - 1);
  return {
    page: courante,
    pages,
    visibles: elements.slice(courante * parPage, (courante + 1) * parPage),
    allerA: setPage,
  };
}

/**
 * Les numéros à montrer : tous s'il y en a peu, sinon la première, la
 * dernière, et les voisines de la page courante, séparées par « … ».
 */
function numeros(page, pages) {
  if (pages <= 7) return [...Array(pages).keys()];

  const garder = new Set([0, pages - 1, page - 1, page, page + 1]);
  const liste = [...garder].filter((n) => n >= 0 && n < pages).sort((a, b) => a - b);

  return liste.flatMap((n, i) => (i > 0 && n - liste[i - 1] > 1 ? ['…', n] : [n]));
}

export default function Pagination({
  page, pages, onPage, chargement = false, etiquette = 'Pages',
}) {
  if (pages <= 1) return null;

  return (
    <nav className="pagination" aria-label={etiquette}>
      <button
        type="button"
        className="pagination__fleche"
        onClick={() => onPage(page - 1)}
        disabled={page === 0 || chargement}
      >
        <span aria-hidden="true">‹ </span>Précédent
      </button>

      {numeros(page, pages).map((n, i) => (n === '…' ? (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`etc-${i}`} className="pagination__etc" aria-hidden="true">…</span>
      ) : (
        <button
          key={n}
          type="button"
          className={`pagination__numero${n === page ? ' est-actif' : ''}`}
          aria-current={n === page ? 'page' : undefined}
          aria-label={`Page ${n + 1}`}
          onClick={() => onPage(n)}
          disabled={chargement}
        >
          {n + 1}
        </button>
      )))}

      <button
        type="button"
        className="pagination__fleche"
        onClick={() => onPage(page + 1)}
        disabled={page >= pages - 1 || chargement}
      >
        Suivant<span aria-hidden="true"> ›</span>
      </button>
    </nav>
  );
}
