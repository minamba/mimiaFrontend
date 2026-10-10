import {
  memo, useCallback, useEffect, useId, useRef, useState,
} from 'react';
import {
  HAUTEUR as H, LARGEUR as W, ligneDe, projection,
} from './monde';
import { enDegres } from '../../../../lib/jeux/bonus/geo/geodesie.js';
import './geo.css';

/**
 * LA CARTE DES JEUX DE GÉO (10/10/2026) — commune à « Où sur Terre ? »,
 * « Enquête sur la carte » et « Le grand jeu de géo ».
 *
 * SE DÉPLACER : la molette ou le pincement zoome là où l'on vise, un glissé
 * déplace, les boutons + et − zooment au centre, ⟲ revient au monde entier.
 * Au clavier : les flèches déplacent, + et − zooment, Entrée touche le centre
 * (un viseur s'y affiche quand la carte a le focus).
 *
 * UN TOUCHER (sans glisser) rend `{ lon, lat, pays }` : le point en degrés et
 * le pays touché, ou null en mer. La longitude et la latitude du dernier
 * toucher s'affichent en bas : la géographie des grands, gratuite pour tous.
 *
 * `vue` : la boîte projetée à montrer (`cadrer`) — la carte y vole ;
 * `classes` : une classe en plus par pays (mémorisée par l'appelant) ;
 * `marques` : épingles, points et ondes, toujours à la même taille ;
 * `boutons` : de vrais boutons posés sur la carte (les villes à choisir) ;
 * `pastilles` : des boutons à texte posés sur la carte (les régions à choisir) ;
 * `point` : le point [lon, lat] dont on affiche les coordonnées (le lieu trouvé), à la place du dernier toucher ;
 * `dessus` : ce qui se pose sur la carte sans la cacher (étapes, verdict) ;
 * `ligne` : le chemin d'un clic au lieu, par le grand cercle.
 */

const KMAX = 48;
const IDENTITE = { k: 1, x: 0, y: 0 };
const SEUIL_GLISSE = 6;

function borner({ k, x, y }) {
  const kk = Math.min(KMAX, Math.max(1, k));
  return {
    k: kk,
    x: Math.min(0, Math.max(W - kk * W, x)),
    y: Math.min(0, Math.max(H - kk * H, y)),
  };
}

/** Le zoom qui montre une boîte projetée [[x0, y0], [x1, y1]], avec une marge. */
export function cadrer(boite, marge = 0.86) {
  if (!boite) return IDENTITE;
  const [[x0, y0], [x1, y1]] = boite;
  const bw = Math.max(1, x1 - x0);
  const bh = Math.max(1, y1 - y0);
  const k = Math.min(KMAX, Math.max(1, Math.min(W / bw, H / bh) * marge));
  return borner({ k, x: W / 2 - (k * (x0 + x1)) / 2, y: H / 2 - (k * (y0 + y1)) / 2 });
}

const mouvementReduit = () => typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const peutAnimer = () => typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function' && !mouvementReduit();

/** Les pays : calculés une fois, redessinés seulement quand leurs classes changent. */
const Terres = memo(({ monde, palette, classes }) => (
  <g className="hg-carte__terres">
    {monde.pays.map((p, i) => (
      <path
        // eslint-disable-next-line react/no-array-index-key
        key={`${p.code}-${i}`}
        d={p.d}
        data-pays={p.code}
        className={`hg-carte__pays${classes?.[p.code] ? ` ${classes[p.code]}` : ''}`}
        style={{ '--hg-geo-fond': p.couleurs[palette] ?? p.couleurs.regions }}
      />
    ))}
  </g>
));
Terres.displayName = 'Terres';

/** Une épingle de carte, dessinée : elle tombe et se plante. */
function Epingle() {
  return (
    <g className="hg-carte__epingle">
      <ellipse className="hg-carte__epingle-ombre" cx="0" cy="0" rx="7" ry="2.6" />
      <g className="hg-carte__epingle-chute">
        <path className="hg-carte__epingle-tete" d="M0 0 C -2 -8 -11 -13 -11 -22 A 11 11 0 1 1 11 -22 C 11 -13 2 -8 0 0 Z" />
        <circle cx="0" cy="-22" r="4.6" fill="#fff" />
        <circle cx="-4.5" cy="-27" r="2.2" fill="#fff" opacity="0.75" />
      </g>
    </g>
  );
}

function Marque({ m, t }) {
  const p = projection([m.lon, m.lat]);
  if (!p) return null;
  const x = t.x + t.k * p[0];
  const y = t.y + t.k * p[1];
  if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return null;
  const haut = m.sorte === 'epingle' ? -52 : -16;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} className={`hg-carte__marque hg-carte__marque--${m.sorte}${m.classe ? ` ${m.classe}` : ''}`}>
      {m.sorte === 'epingle' && <g transform="scale(1.3)"><Epingle /></g>}
      {m.sorte === 'clic' && (
        <>
          <circle className="hg-carte__onde" r="7" />
          <circle className="hg-carte__clic" r="5.5" />
        </>
      )}
      {m.sorte === 'cible' && (
        <>
          <circle className="hg-carte__cible-anneau" r="16" />
          <circle className="hg-carte__cible-coeur" r="5" />
        </>
      )}
      {m.sorte === 'point' && <circle className="hg-carte__petit-point" r="3.6" />}
      {m.libelle && (
        <text className="hg-carte__libelle" y={haut} textAnchor="middle">{m.libelle}</text>
      )}
    </g>
  );
}

/**
 * LA PLACE DES ÉTIQUETTES DES VILLES : dessous, sinon dessus, à droite, à
 * gauche — la première qui ne chevauche ni une autre étiquette ni un point.
 * Sans place, l'étiquette se tait (le bouton garde son nom pour le lecteur
 * d'écran). `echelle` : pixels affichés par unité de carte.
 */
export function placerEtiquettes(points, echelle) {
  const e = echelle || 0.7;
  const boites = points.map((p) => [p.x - 11 / e, p.y - 11 / e, 22 / e, 22 / e]);
  const chevauche = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
  return points.map((p, i) => {
    if (!p.etiquette) return null;
    const w = (p.etiquette.length * 9 + 18) / e;
    const h = 26 / e;
    const d = 12 / e;
    const essais = [
      ['bas', [p.x - w / 2, p.y + d, w, h]],
      ['haut', [p.x - w / 2, p.y - d - h, w, h]],
      ['droite', [p.x + d, p.y - h / 2, w, h]],
      ['gauche', [p.x - d - w, p.y - h / 2, w, h]],
    ];
    const libre = essais.find(([, b]) => b[0] >= 0 && b[0] + b[2] <= W && b[1] >= 0 && b[1] + b[3] <= H
      && boites.every((o, k) => k === i || !chevauche(b, o)));
    if (!libre) return 'cache';
    boites.push(libre[1]);
    return libre[0];
  });
}

export default function CarteMonde({
  monde,
  vue = null,
  palette = 'regions',
  classes = null,
  onClic,
  marques = [],
  boutons = [],
  pastilles = [],
  dessus = null,
  point = null,
  ligne = null,
  desactive = false,
  etiquette = 'Carte du monde',
  coordonnees = true,
  children,
}) {
  const aide = useId();
  const cadre = useRef(null);
  const [t, setT] = useState(() => cadrer(vue?.boite));
  const tRef = useRef(t);
  const anim = useRef(0);
  const [dernier, setDernier] = useState(null);
  const [echelle, setEchelle] = useState(0.7);

  // La taille affichée de la carte : pour placer les étiquettes sans chevauchement.
  useEffect(() => {
    const el = cadre.current;
    if (!el) return undefined;
    const mesurer = () => {
      const largeur = el.getBoundingClientRect?.().width;
      if (largeur) setEchelle(largeur / W);
    };
    mesurer();
    if (typeof window.ResizeObserver !== 'function') return undefined;
    const observateur = new window.ResizeObserver(mesurer);
    observateur.observe(el);
    return () => observateur.disconnect();
  }, [monde]);

  const appliquer = useCallback((n) => {
    tRef.current = n;
    setT(n);
  }, []);

  const arreter = () => {
    if (anim.current && typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(anim.current);
    anim.current = 0;
  };

  /** La carte vole vers un zoom : le centre glisse, le zoom change en douceur. */
  const allerA = useCallback((cible, anime = true) => {
    arreter();
    const depart = tRef.current;
    if (!anime || !peutAnimer()) {
      appliquer(cible);
      return;
    }
    const c0 = [(W / 2 - depart.x) / depart.k, (H / 2 - depart.y) / depart.k];
    const c1 = [(W / 2 - cible.x) / cible.k, (H / 2 - cible.y) / cible.k];
    const duree = 950;
    const debut = performance.now();
    const pas = (maintenant) => {
      const u = Math.min(1, (maintenant - debut) / duree);
      const e = u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2;
      const k = depart.k * (cible.k / depart.k) ** e;
      const cx = c0[0] + (c1[0] - c0[0]) * e;
      const cy = c0[1] + (c1[1] - c0[1]) * e;
      appliquer(u < 1 ? borner({ k, x: W / 2 - k * cx, y: H / 2 - k * cy }) : cible);
      anim.current = u < 1 ? window.requestAnimationFrame(pas) : 0;
    };
    anim.current = window.requestAnimationFrame(pas);
  }, [appliquer]);

  // La vue demandée : la carte y vole (sauf au premier dessin, déjà cadré).
  const cleVue = vue?.boite ? vue.boite.flat().map((n) => n.toFixed(1)).join(',') : 'monde';
  const premier = useRef(true);
  useEffect(() => {
    if (premier.current) { premier.current = false; return; }
    allerA(cadrer(vue?.boite));
  }, [cleVue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => arreter(), []);

  /** Un point de l'écran dans le repère 960 × 500 de la carte. */
  const versCarte = (clientX, clientY) => {
    const r = cadre.current?.getBoundingClientRect?.();
    if (!r || !r.width || !r.height) return [W / 2, H / 2];
    const s = Math.min(r.width / W, r.height / H);
    return [(clientX - r.left - (r.width - W * s) / 2) / s, (clientY - r.top - (r.height - H * s) / 2) / s];
  };

  const toucher = (point, cible) => {
    if (desactive || !onClic || !monde) return;
    const z = tRef.current;
    const m = [(point[0] - z.x) / z.k, (point[1] - z.y) / z.k];
    const ll = projection.invert(m);
    if (!ll || !Number.isFinite(ll[0]) || !Number.isFinite(ll[1])) return;
    const retour = projection(ll);
    // Hors du globe (les coins de la carte), on ne touche rien.
    if (!retour || Math.hypot(retour[0] - m[0], retour[1] - m[1]) > 0.5) return;
    const surPays = cible?.closest?.('[data-pays]')?.getAttribute('data-pays');
    const pays = surPays ?? monde.paysSous(ll);
    setDernier(ll);
    onClic({ lon: ll[0], lat: ll[1], pays });
  };

  // --- Les gestes : glisser, pincer, toucher.
  const pointeurs = useRef(new Map());
  const geste = useRef(null);

  const auPointeurBas = (e) => {
    if (e.target.closest?.('button')) return;
    if (typeof e.button === 'number' && e.button > 0) return;
    arreter();
    const p = versCarte(e.clientX, e.clientY);
    pointeurs.current.set(e.pointerId, p);
    try { cadre.current?.setPointerCapture?.(e.pointerId); } catch { /* pas de capture : le glissé marche quand même */ }
    if (pointeurs.current.size === 1) {
      geste.current = {
        glisse: false, depart: p, t0: tRef.current, cible: e.target,
      };
    } else if (pointeurs.current.size === 2) {
      const [a, b] = [...pointeurs.current.values()];
      geste.current = {
        ...(geste.current ?? {}),
        glisse: true,
        pince: { d0: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, t0: tRef.current, m0: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] },
      };
    }
  };

  const auPointeurBouge = (e) => {
    if (!pointeurs.current.has(e.pointerId) || !geste.current) return;
    const p = versCarte(e.clientX, e.clientY);
    pointeurs.current.set(e.pointerId, p);
    const g = geste.current;
    if (pointeurs.current.size >= 2 && g.pince) {
      const [a, b] = [...pointeurs.current.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const milieu = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const { t0, m0, d0 } = g.pince;
      const k = Math.min(KMAX, Math.max(1, t0.k * (d / d0)));
      const vise = [(m0[0] - t0.x) / t0.k, (m0[1] - t0.y) / t0.k];
      appliquer(borner({ k, x: milieu[0] - k * vise[0], y: milieu[1] - k * vise[1] }));
      return;
    }
    const dx = p[0] - g.depart[0];
    const dy = p[1] - g.depart[1];
    if (!g.glisse && Math.hypot(dx, dy) > SEUIL_GLISSE) g.glisse = true;
    if (g.glisse && !g.pince) appliquer(borner({ k: g.t0.k, x: g.t0.x + dx, y: g.t0.y + dy }));
  };

  const auPointeurHaut = (e) => {
    if (!pointeurs.current.has(e.pointerId)) return;
    const p = versCarte(e.clientX, e.clientY);
    pointeurs.current.delete(e.pointerId);
    if (pointeurs.current.size > 0) return;
    const g = geste.current;
    geste.current = null;
    if (g && !g.glisse) toucher(p, g.cible);
  };

  const auPointeurPerdu = (e) => {
    pointeurs.current.delete(e.pointerId);
    if (pointeurs.current.size === 0) geste.current = null;
  };

  // La molette zoome là où vise la souris (écouteur non passif : la page ne défile pas sous la carte).
  useEffect(() => {
    const el = cadre.current;
    if (!el) return undefined;
    const roue = (e) => {
      e.preventDefault();
      arreter();
      const p = versCarte(e.clientX, e.clientY);
      const z = tRef.current;
      const k = Math.min(KMAX, Math.max(1, z.k * Math.exp(-e.deltaY * 0.0018)));
      const vise = [(p[0] - z.x) / z.k, (p[1] - z.y) / z.k];
      appliquer(borner({ k, x: p[0] - k * vise[0], y: p[1] - k * vise[1] }));
    };
    el.addEventListener('wheel', roue, { passive: false });
    return () => el.removeEventListener('wheel', roue);
  }, [appliquer, monde]);

  const zoomer = (facteur) => {
    const z = tRef.current;
    const k = Math.min(KMAX, Math.max(1, z.k * facteur));
    const vise = [(W / 2 - z.x) / z.k, (H / 2 - z.y) / z.k];
    allerA(borner({ k, x: W / 2 - k * vise[0], y: H / 2 - k * vise[1] }));
  };

  const auClavier = (e) => {
    if (e.target !== cadre.current) return;
    const z = tRef.current;
    const pas = 40;
    const deplacer = (dx, dy) => { e.preventDefault(); arreter(); appliquer(borner({ ...z, x: z.x + dx, y: z.y + dy })); };
    if (e.key === 'ArrowLeft') deplacer(pas, 0);
    else if (e.key === 'ArrowRight') deplacer(-pas, 0);
    else if (e.key === 'ArrowUp') deplacer(0, pas);
    else if (e.key === 'ArrowDown') deplacer(0, -pas);
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomer(1.6); } else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomer(1 / 1.6); } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toucher([W / 2, H / 2], null);
    }
  };

  if (!monde) {
    return (
      <div className="hg-carte hg-carte--charge">
        <p className="hg-carte__chargement">La carte se déplie…</p>
        {children}
      </div>
    );
  }

  const transformation = `translate(${t.x.toFixed(2)} ${t.y.toFixed(2)}) scale(${t.k.toFixed(4)})`;
  const traceLigne = ligne ? ligneDe(ligne.de, ligne.vers) : null;
  const visibles = boutons.map((b) => {
    const p = projection([b.lon, b.lat]);
    return p ? { b, x: t.x + t.k * p[0], y: t.y + t.k * p[1] } : null;
  }).filter((v) => v && v.x >= 0 && v.x <= W && v.y >= 0 && v.y <= H);
  const cotes = placerEtiquettes(visibles.map(({ b, x, y }) => ({ x, y, etiquette: b.etiquette })), echelle);

  return (
    <div className={`hg-carte${desactive ? ' est-desactivee' : ''}`}>
      <div
        ref={cadre}
        className="hg-carte__cadre"
        role="application"
        tabIndex={0}
        aria-label={etiquette}
        aria-describedby={aide}
        onPointerDown={auPointeurBas}
        onPointerMove={auPointeurBouge}
        onPointerUp={auPointeurHaut}
        onPointerCancel={auPointeurPerdu}
        onKeyDown={auClavier}
      >
        <svg className="hg-carte__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="hg-mer" cx="50%" cy="42%" r="70%">
              <stop offset="0%" stopColor="#5cc8ff" />
              <stop offset="60%" stopColor="#2f8fe6" />
              <stop offset="100%" stopColor="#1d5fc0" />
            </radialGradient>
            <pattern id="hg-vagues" width="46" height="26" patternUnits="userSpaceOnUse" patternTransform={`scale(${(1 / t.k).toFixed(4)})`}>
              <path d="M4 9 q5 -5 10 0 t10 0" className="hg-carte__vague" />
              <path d="M27 21 q5 -5 10 0 t10 0" className="hg-carte__vague" />
            </pattern>
          </defs>
          <rect className="hg-carte__espace" width={W} height={H} />
          <g transform={transformation}>
            <path className="hg-carte__mer" d={monde.sphere} />
            <path className="hg-carte__vagues" d={monde.sphere} fill="url(#hg-vagues)" />
            <path className="hg-carte__graticule" d={monde.graticule} />
            <Terres monde={monde} palette={palette} classes={classes} />
            <path className="hg-carte__frontieres" d={monde.frontieres} />
            <path className="hg-carte__bord" d={monde.sphere} />
            {traceLigne && <path className="hg-carte__ligne" d={traceLigne} />}
          </g>
          <g className="hg-carte__marques">
            {marques.map((m) => <Marque key={m.id} m={m} t={t} />)}
          </g>
          <g className="hg-carte__viseur">
            <circle cx={W / 2} cy={H / 2} r="11" />
            <path d={`M${W / 2 - 20} ${H / 2} h10 m20 0 h10 M${W / 2} ${H / 2 - 20} v10 m0 20 v10`} />
          </g>
        </svg>

        <div className="hg-carte__boutons">
          {visibles.map(({ b, x, y }, i) => {
            const cote = cotes[i];
            return (
              <button
                key={b.id}
                type="button"
                className={`hg-carte__bouton${b.classe ? ` ${b.classe}` : ''}`}
                style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` }}
                onClick={b.onClic}
                disabled={b.desactive}
                aria-label={b.libelle}
              >
                <span className="hg-carte__bouton-point" aria-hidden="true" />
                {b.etiquette && cote !== 'cache' && <span className={`hg-carte__etiquette hg-carte__etiquette--${cote}`} aria-hidden="true">{b.etiquette}</span>}
              </button>
            );
          })}
        </div>

        {pastilles.length > 0 && (
          <div className="hg-carte__pastilles">
            {pastilles.map((b) => {
              const p = projection([b.lon, b.lat]);
              if (!p) return null;
              const x = t.x + t.k * p[0];
              const y = t.y + t.k * p[1];
              if (x < 0 || x > W || y < 0 || y > H) return null;
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`hg-carte__pastille${b.classe ? ` ${b.classe}` : ''}`}
                  style={{ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, ...(b.style ?? {}) }}
                  onClick={b.onClic}
                  disabled={b.desactive}
                  aria-label={b.libelle}
                >
                  {b.texte}
                </button>
              );
            })}
          </div>
        )}

        {dessus}

        <div className="hg-carte__zoom">
          <button type="button" className="hg-carte__zoom-bouton" onClick={() => zoomer(1.7)} aria-label="Zoomer">+</button>
          <button type="button" className="hg-carte__zoom-bouton" onClick={() => zoomer(1 / 1.7)} aria-label="Dézoomer">−</button>
          <button type="button" className="hg-carte__zoom-bouton" onClick={() => allerA(cadrer(vue?.boite))} aria-label="Revenir à la vue de départ">⟲</button>
        </div>

        {coordonnees && (point ?? dernier) && (
          <p className="hg-carte__coord">
            <span aria-hidden="true">📍 </span>
            {enDegres(point ?? dernier)}
          </p>
        )}
      </div>
      {children}
      <p id={aide} className="hg-carte__aide-cachee">
        Glisse pour déplacer la carte, pince ou utilise la molette pour zoomer, puis touche un endroit. Au clavier : les flèches déplacent, plus et moins zooment, Entrée choisit le centre.
      </p>
    </div>
  );
}
