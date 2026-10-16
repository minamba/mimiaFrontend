import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import RenduFiche from './RenduFiche';

const ZOOM_MAX = 4;
const PAS = 1.25;

/** Le même geste que sur la page (useGlissement) : vif, de côté, assez long. */
const GLISSE_SEUIL = 60;
const GLISSE_DOMINANCE = 1.5;
const GLISSE_DUREE_MAX = 800;

/**
 * LA FICHE EN GRAND, ET ON ZOOME DEDANS — Camara, le 16/10/2026 : « un bouton
 * qui va permettre d'agrandir le schéma et zoomer dessus ».
 *
 * La fiche s'ouvre en plein écran, ajustée pour être vue en entier. On zoome
 * avec les boutons, la molette ou deux doigts ; on la déplace en la tirant.
 * « Ajuster » la remet en entier sous les yeux.
 *
 * D'UNE FICHE À L'AUTRE SANS FERMER (16/10/2026) : « Précédente » et
 * « Suivante » dans la barre, deux grandes flèches sur les bords, et les
 * flèches du clavier. Chaque fiche arrive ajustée, le zoom de la précédente
 * oublié.
 *
 * GLISSER AU DOIGT (16/10/2026) : tant que la fiche est vue en entier, un
 * geste vif de côté passe à la voisine, comme sur la page. Zoomée, le doigt
 * la déplace : on y lit le détail, on ne change pas de fiche.
 *
 * SUR TÉLÉPHONE, LA CARTE GARDE SA GRANDE MISE EN PAGE : la classe
 * `fdr-grand` sur <html> écarte les règles « téléphone » des fiches (voir
 * mesFiches.css), qui empilent les bulles. C'est le vrai schéma qu'on veut
 * agrandir, pas sa version en liste.
 */
export default function Visionneuse({ fiche, position = null, onPrecedente = null, onSuivante = null, onFermer }) {
  const scene = useRef(null);
  const contenu = useRef(null);
  const fermer = useRef(null);
  const [vue, setVue] = useState({ x: 0, y: 0, s: 1 });
  const vueRef = useRef(vue);
  vueRef.current = vue;
  const touche = useRef(false);
  const pointeurs = useRef(new Map());
  const pince = useRef(null);
  // Le départ d'un doigt seul : peut-être un glissement vers la fiche voisine.
  const glisse = useRef(null);

  // Les gestes du parent changent à chaque rendu : on lit toujours les
  // derniers, sans rebrancher le clavier ni regeler la page (un rebranchement
  // relisait « hidden » comme débordement d'origine, et la page restait figée
  // à la fermeture).
  const gestes = useRef({ onFermer, onPrecedente, onSuivante });
  gestes.current = { onFermer, onPrecedente, onSuivante };

  // Le plus petit zoom : celui qui montre la fiche en entier.
  const ajusteRef = useRef(1);

  const ajuster = useCallback(() => {
    const s = scene.current;
    const c = contenu.current;
    if (!s || !c || !c.offsetWidth || !c.offsetHeight) return;
    const largeur = s.clientWidth;
    const hauteur = s.clientHeight;
    const echelle = Math.min(largeur / c.offsetWidth, hauteur / c.offsetHeight) * 0.96;
    ajusteRef.current = echelle;
    setVue({
      s: echelle,
      x: (largeur - c.offsetWidth * echelle) / 2,
      y: Math.max(8, (hauteur - c.offsetHeight * echelle) / 2),
    });
  }, []);

  /** Zoome d'un facteur autour d'un point de la scène (le centre par défaut). */
  const zoomer = useCallback((facteur, px, py) => {
    const s = scene.current;
    if (!s) return;
    touche.current = true;
    setVue((v) => {
      const cx = px ?? s.clientWidth / 2;
      const cy = py ?? s.clientHeight / 2;
      const nouveau = Math.min(ZOOM_MAX, Math.max(ajusteRef.current * 0.5, v.s * facteur));
      const r = nouveau / v.s;
      return { s: nouveau, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r };
    });
  }, []);

  // Ouverture : la grande mise en page, la page gelée, le clavier.
  useEffect(() => {
    const racine = document.documentElement;
    racine.classList.add('fdr-grand');
    const debordement = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    fermer.current?.focus();

    const auClavier = (e) => {
      const { onFermer: quitter, onPrecedente: avant, onSuivante: apres } = gestes.current;
      if (e.key === 'Escape') quitter();
      else if (e.key === 'ArrowLeft' && avant) avant();
      else if (e.key === 'ArrowRight' && apres) apres();
      else if (e.key === '+' || e.key === '=') zoomer(PAS);
      else if (e.key === '-') zoomer(1 / PAS);
      else if (e.key === '0') ajuster();
    };
    document.addEventListener('keydown', auClavier);

    return () => {
      racine.classList.remove('fdr-grand');
      document.body.style.overflow = debordement;
      document.removeEventListener('keydown', auClavier);
    };
  }, [zoomer, ajuster]);

  // Ajustée à l'ouverture, puis tant qu'on n'y a pas touché (les polices et
  // les traits de la carte arrivent un instant après).
  useLayoutEffect(() => {
    ajuster();
    const c = contenu.current;
    if (!c || typeof ResizeObserver === 'undefined') return undefined;
    const observateur = new ResizeObserver(() => { if (!touche.current) ajuster(); });
    observateur.observe(c);
    observateur.observe(scene.current);
    return () => observateur.disconnect();
  }, [ajuster]);

  // Une autre fiche : elle arrive en entier, sans le zoom de la précédente.
  useLayoutEffect(() => {
    touche.current = false;
    ajuster();
  }, [fiche.id, ajuster]);

  // La molette zoome sous le pointeur. Écouteur non passif : il faut empêcher
  // la page de défiler.
  useEffect(() => {
    const s = scene.current;
    if (!s) return undefined;
    const molette = (e) => {
      e.preventDefault();
      const r = s.getBoundingClientRect();
      zoomer(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    s.addEventListener('wheel', molette, { passive: false });
    return () => s.removeEventListener('wheel', molette);
  }, [zoomer]);

  // Un doigt (ou la souris) déplace ; deux doigts pincent pour zoomer.
  const local = (e) => {
    const r = scene.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const appuyer = (e) => {
    scene.current.setPointerCapture?.(e.pointerId);
    pointeurs.current.set(e.pointerId, local(e));
    touche.current = true;
    glisse.current = pointeurs.current.size === 1 && e.pointerType !== 'mouse'
      ? { x: e.clientX, y: e.clientY, quand: Date.now() }
      : null;
    if (pointeurs.current.size === 2) {
      const [a, b] = [...pointeurs.current.values()];
      pince.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), milieu: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
    }
  };

  const bouger = (e) => {
    if (!pointeurs.current.has(e.pointerId)) return;
    const avant = pointeurs.current.get(e.pointerId);
    const maintenant = local(e);
    pointeurs.current.set(e.pointerId, maintenant);

    if (pointeurs.current.size === 1) {
      setVue((v) => ({ ...v, x: v.x + maintenant.x - avant.x, y: v.y + maintenant.y - avant.y }));
      return;
    }

    if (pointeurs.current.size === 2 && pince.current) {
      const [a, b] = [...pointeurs.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const milieu = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      // L'ancienne pince est lue ICI : la mise à jour de l'état peut s'exécuter
      // plus tard, quand `pince.current` aura déjà changé.
      const ancienne = pince.current;
      const facteur = distance / (ancienne.distance || distance);
      setVue((v) => {
        const nouveau = Math.min(ZOOM_MAX, Math.max(ajusteRef.current * 0.5, v.s * facteur));
        const r = nouveau / v.s;
        return {
          s: nouveau,
          x: milieu.x - (ancienne.milieu.x - v.x) * r,
          y: milieu.y - (ancienne.milieu.y - v.y) * r,
        };
      });
      pince.current = { distance, milieu };
    }
  };

  const lacher = (e) => {
    const avait = pointeurs.current.has(e.pointerId);
    pointeurs.current.delete(e.pointerId);
    if (pointeurs.current.size < 2) pince.current = null;

    const d = glisse.current;
    if (!avait || !d || pointeurs.current.size > 0) return;
    glisse.current = null;
    if (e.type !== 'pointerup' || Date.now() - d.quand > GLISSE_DUREE_MAX) return;
    // Zoomée, on se déplaçait dans la fiche.
    if (vueRef.current.s > ajusteRef.current * 1.05) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) < GLISSE_SEUIL || Math.abs(dx) < Math.abs(dy) * GLISSE_DOMINANCE) return;
    const { onPrecedente: avant, onSuivante: apres } = gestes.current;
    const voisine = dx < 0 ? apres : avant;
    // Pas de voisine de ce côté : la fiche revient à sa place.
    if (voisine) voisine(); else ajuster();
  };

  const pourcentage = Math.round((vue.s / (ajusteRef.current || 1)) * 100);
  const plusieurs = Boolean(position && position.total > 1);

  return (
    <div
      className={`fdr-visionneuse fdr-feuille--${fiche.type}`}
      role="dialog"
      aria-modal="true"
      aria-label={`La fiche en grand : ${fiche.titre}`}
    >
      <div className="fdr-visionneuse__barre">
        <span className="fdr-visionneuse__titre">{fiche.titre}</span>

        {plusieurs && (
          <nav className="fdr-visionneuse__fiches" aria-label="Fiches">
            <button
              type="button"
              className="fdr-visionneuse__pas"
              disabled={!onPrecedente}
              onClick={() => onPrecedente?.()}
            >
              <span aria-hidden="true">‹</span>
              <span className="fdr-visionneuse__mot"> Précédente</span>
            </button>
            <span className="fdr-visionneuse__position" aria-live="polite">
              {position.rang} / {position.total}
            </span>
            <button
              type="button"
              className="fdr-visionneuse__pas fdr-visionneuse__pas--suivante"
              disabled={!onSuivante}
              onClick={() => onSuivante?.()}
            >
              <span className="fdr-visionneuse__mot">Suivante </span>
              <span aria-hidden="true">›</span>
            </button>
          </nav>
        )}

        <div className="fdr-visionneuse__outils">
          <span className="fdr-visionneuse__zoomeur">
            <button type="button" className="fdr-visionneuse__bouton" aria-label="Dézoomer" onClick={() => zoomer(1 / PAS)}>−</button>
            <span className="fdr-visionneuse__zoom" aria-live="polite">{pourcentage} %</span>
            <button type="button" className="fdr-visionneuse__bouton" aria-label="Zoomer" onClick={() => zoomer(PAS)}>+</button>
          </span>
          <button
            type="button"
            className="fdr-visionneuse__bouton fdr-visionneuse__bouton--texte fdr-visionneuse__ajuster"
            onClick={() => { touche.current = false; ajuster(); }}
          >
            <span aria-hidden="true">⤢ </span>Ajuster
          </button>
          <button
            ref={fermer}
            type="button"
            className="fdr-visionneuse__bouton fdr-visionneuse__fermer"
            aria-label="Fermer la fiche en grand"
            onClick={onFermer}
          >
            ×
          </button>
        </div>
      </div>

      <div className="fdr-visionneuse__plateau">
        <div
          ref={scene}
          className="fdr-visionneuse__scene"
          onPointerDown={appuyer}
          onPointerMove={bouger}
          onPointerUp={lacher}
          onPointerCancel={lacher}
          onDoubleClick={(e) => { const p = local(e); zoomer(2, p.x, p.y); }}
        >
          <div
            ref={contenu}
            className="fdr-visionneuse__contenu"
            style={{ transform: `translate(${vue.x}px, ${vue.y}px) scale(${vue.s})` }}
          >
            <RenduFiche fiche={fiche} />
          </div>
        </div>

        {/* Les grandes flèches des bords : hors de la scène, pour ne pas
            déclencher le déplacement de la fiche. Doublons des boutons de la
            barre, cachées aux lecteurs d'écran. */}
        {plusieurs && onPrecedente && (
          <button
            type="button"
            className="fdr-visionneuse__fleche fdr-visionneuse__fleche--avant"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => onPrecedente()}
          >
            ‹
          </button>
        )}
        {plusieurs && onSuivante && (
          <button
            type="button"
            className="fdr-visionneuse__fleche fdr-visionneuse__fleche--apres"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => onSuivante()}
          >
            ›
          </button>
        )}
      </div>

      <p className="fdr-visionneuse__aide">
        Zoome avec les boutons, la molette ou deux doigts · Déplace la fiche en la tirant · Double-clic pour zoomer
        {plusieurs && ' · Flèches ← → pour changer de fiche'}
      </p>
    </div>
  );
}
