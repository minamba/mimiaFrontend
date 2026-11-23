import { useCallback, useEffect, useRef, useState } from 'react';
import './carrouselControles.css';

/**
 * LE CARROUSEL DE « MES CONTRÔLES » — Camara, le 23/11/2026 : « on peut mettre un slider si on a plus de 3 ? avec un
 * indicateur disant que je peux slider à gauche ou à droite ». Trois cartes à la fois sur ordinateur (une et un bout
 * de la suivante sur téléphone), défilement au doigt ou à la molette, aimanté carte par carte ; deux flèches, des
 * points qui disent où l'on est, et une phrase qui invite à faire glisser.
 *
 * Les flèches font défiler d'une « page » (la largeur visible). Elles se grisent au bord ; les points suivent le
 * défilement, quel qu'en soit l'auteur (flèche, doigt, clavier).
 */
export default function CarrouselControles({ nombre, children }) {
  const piste = useRef(null);
  const [debut, setDebut] = useState(true);
  const [fin, setFin] = useState(false);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const mesurer = useCallback(() => {
    const el = piste.current;
    if (!el) return;
    const largeur = Math.max(1, el.clientWidth);
    setDebut(el.scrollLeft <= 4);
    setFin(el.scrollLeft + largeur >= el.scrollWidth - 4);
    setPages(Math.max(1, Math.ceil((el.scrollWidth - 4) / largeur)));
    setPage(Math.min(Math.round(el.scrollLeft / largeur), Math.ceil(el.scrollWidth / largeur) - 1));
  }, []);

  useEffect(() => {
    mesurer();
    window.addEventListener('resize', mesurer);
    return () => window.removeEventListener('resize', mesurer);
  }, [mesurer, nombre]);

  const defiler = (sens) => {
    const el = piste.current;
    if (!el) return;
    el.scrollBy({ left: sens * el.clientWidth, behavior: 'smooth' });
  };

  // GLISSER À LA SOURIS (Camara, le 23/11/2026 : « quand je maintiens la souris sur une carte pour slider, ça ne
  // marche pas ») : le navigateur fait défiler au doigt et à la molette, jamais en tirant à la souris. On le fait ici,
  // pour la souris seulement : la piste suit la main, l'aimant est coupé pendant le geste, puis la carte la plus
  // proche se cale au relâchement. Un glisser ne doit pas valoir un clic sur le bouton ou le lien de la carte.
  const geste = useRef(null);
  const [glisse, setGlisse] = useState(false);

  const surAppui = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !piste.current) return;
    geste.current = { x: e.clientX, depart: piste.current.scrollLeft, bouge: false, id: e.pointerId };
  };

  const surMouvement = (e) => {
    const g = geste.current;
    const el = piste.current;
    if (!g || !el) return;
    const dx = e.clientX - g.x;
    if (!g.bouge && Math.abs(dx) < 6) return;
    if (!g.bouge) {
      g.bouge = true;
      setGlisse(true);
      el.setPointerCapture?.(g.id);
    }
    el.scrollLeft = g.depart - dx;
  };

  const surRelache = () => {
    const g = geste.current;
    const el = piste.current;
    geste.current = null;
    if (!g?.bouge || !el) return;

    // La carte la plus proche du bord gauche se cale.
    // Position de défilement qui cale chaque carte comme la première : son décalage par rapport à elle.
    const cartes = Array.from(el.children);
    const positions = cartes.map((carte) => carte.offsetLeft - (cartes[0]?.offsetLeft ?? 0));
    const cible = positions.reduce(
      (meilleure, p) => (Math.abs(p - el.scrollLeft) < Math.abs(meilleure - el.scrollLeft) ? p : meilleure),
      0,
    );
    setGlisse(false);
    el.scrollTo({ left: cible, behavior: 'smooth' });

    // Le clic qui suit un glisser est avalé (une seule fois).
    const avaler = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    el.addEventListener('click', avaler, { capture: true, once: true });
    setTimeout(() => el.removeEventListener('click', avaler, { capture: true }), 0);
  };

  const allerA = (n) => {
    const el = piste.current;
    if (!el) return;
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="ctr-carrousel" role="region" aria-roledescription="carrousel" aria-label="Tes contrôles à venir">
      <p className="ctr-carrousel__invite">
        <span aria-hidden="true">‹</span>
        Fais glisser pour voir tes {nombre} contrôles
        <span aria-hidden="true">›</span>
      </p>

      <div className="ctr-carrousel__cadre">
        <button
          type="button"
          className="ctr-carrousel__fleche ctr-carrousel__fleche--gauche"
          aria-label="Contrôles précédents"
          disabled={debut}
          onClick={() => defiler(-1)}
        >
          ‹
        </button>

        <ul
          className={`controles-liste ctr-carrousel__piste${glisse ? ' est-glisse' : ''}`}
          ref={piste}
          onScroll={mesurer}
          onPointerDown={surAppui}
          onPointerMove={surMouvement}
          onPointerUp={surRelache}
          onPointerCancel={surRelache}
          onDragStart={(e) => e.preventDefault()}
        >
          {children}
        </ul>

        <button
          type="button"
          className="ctr-carrousel__fleche ctr-carrousel__fleche--droite"
          aria-label="Contrôles suivants"
          disabled={fin}
          onClick={() => defiler(1)}
        >
          ›
        </button>
      </div>

      {pages > 1 && (
        <div className="ctr-carrousel__points" role="group" aria-label="Pages du carrousel">
          {Array.from({ length: pages }, (_, n) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={n}
              type="button"
              className={`ctr-carrousel__point${n === page ? ' est-actif' : ''}`}
              aria-label={`Page ${n + 1} sur ${pages}`}
              aria-current={n === page ? 'true' : undefined}
              onClick={() => allerA(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
