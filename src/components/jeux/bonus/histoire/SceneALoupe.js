import { useRef, useState } from 'react';

/** Le grossissement de la loupe. */
const ZOOM = 2.6;
/** Le pas d'un appui sur une flèche du clavier, en pour cent. */
const PAS = 2;

const borne = (v) => Math.min(100, Math.max(0, v));

/**
 * LA SCÈNE ET SA LOUPE (L'image qui ment, 10/10/2026). Un cercle grossit ce
 * qu'il survole ; on accuse là où il est.
 *
 *   - À LA SOURIS, la loupe suit le pointeur ; un clic accuse.
 *   - AU DOIGT, la loupe naît à l'appui, suit le doigt, et le RELÂCHER
 *     accuse. COMME DANS « OÙ SUR TERRE » — Camara, le 11/10/2026 : « c'est
 *     comme ça que la loupe doit être » : elle est CENTRÉE sous le doigt, reste
 *     DANS l'image (le cadre la coupe à ses bords) et DISPARAÎT quand le doigt
 *     sort de l'image ; relâcher dehors annule le coup.
 *   - AU CLAVIER, la scène se focalise : les flèches promènent la loupe,
 *     Entrée ou Espace accuse.
 *
 * Les positions sont en pour cent de l'image, comme les zones de
 * `lib/jeux/bonus/histoire/imageQuiMent.js`.
 *
 * `entourer` : les cercles de la fin (l'intrus, et l'éventuel second) ;
 * `marques` : les fausses accusations (✗) et les leurres (?) ; `children` :
 * ce qui se pose par-dessus (le tampon).
 */
export default function SceneALoupe({
  src, description, actif, onAccuser, entourer = [], marques = [], children,
}) {
  const cadre = useRef(null);
  const appui = useRef(null);
  // Le dernier point VALIDE sous le doigt : c'est là que la loupe reste quand
  // le doigt sort de l'image, et là qu'on accuse au relâcher.
  const dernier = useRef(null);
  const [loupe, setLoupe] = useState(null);
  const [taille, setTaille] = useState({ l: 0, h: 0 });

  const mesurer = () => {
    const r = cadre.current?.getBoundingClientRect?.();
    if (!r || !r.width) return null;
    setTaille((t) => (t.l === r.width && t.h === r.height ? t : { l: r.width, h: r.height }));
    return r;
  };

  const point = (e) => {
    const r = mesurer();
    if (!r || !Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return { x: 50, y: 50 };
    return { x: borne(((e.clientX - r.left) / r.width) * 100), y: borne(((e.clientY - r.top) / r.height) * 100) };
  };

  const auDoigt = (e) => e.pointerType && e.pointerType !== 'mouse';

  /**
   * LE DOIGT HORS DE L'IMAGE — Camara, le 11/10/2026 : « si le doigt sort de
   * l'écran la loupe remonte tout en haut… sur mobile c'est injouable ». Au
   * bord de l'écran, un téléphone envoie des positions parasites (souvent 0, 0)
   * ou un doigt hors de l'image ; la loupe sautait au coin haut. Désormais un
   * point hors de l'image (au-delà d'une petite marge) ne la déplace plus : elle
   * reste au dernier point valide.
   */
  const dansLImage = (e) => {
    const r = cadre.current?.getBoundingClientRect?.();
    if (!r || !r.width || !Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return false;
    if (e.clientX === 0 && e.clientY === 0 && (r.left > 0 || r.top > 0)) return false;
    return e.clientX >= r.left && e.clientX <= r.right
      && e.clientY >= r.top && e.clientY <= r.bottom;
  };

  const appuyer = (e) => {
    if (!actif) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    appui.current = e.pointerId ?? 1;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* sans capture, le doigt reste suivi sur la scène */ }
    dernier.current = point(e);
    setLoupe({ ...dernier.current, doigt: auDoigt(e) });
  };

  const bouger = (e) => {
    if (!actif) return;
    if (auDoigt(e) && appui.current === null) return;
    if (auDoigt(e) && !dansLImage(e)) {
      // Le doigt est sorti : la loupe disparaît, et revient s'il rentre.
      dernier.current = null;
      setLoupe(null);
      return;
    }
    dernier.current = point(e);
    setLoupe({ ...dernier.current, doigt: auDoigt(e) });
  };

  const relacher = (e) => {
    if (!actif || appui.current === null) return;
    appui.current = null;
    if (auDoigt(e)) {
      setLoupe(null);
      // Relâché hors de l'image : le coup est annulé, il ne coûte pas une loupe.
      const p = dansLImage(e) ? point(e) : null;
      dernier.current = null;
      if (p) onAccuser(p.x, p.y);
      return;
    }
    const p = point(e);
    onAccuser(p.x, p.y);
  };

  const annuler = () => {
    appui.current = null;
    dernier.current = null;
    setLoupe(null);
  };

  const quitter = (e) => {
    if (!auDoigt(e)) setLoupe(null);
  };

  const touche = (e) => {
    if (!actif) return;
    const depl = {
      ArrowLeft: [-PAS, 0], ArrowRight: [PAS, 0], ArrowUp: [0, -PAS], ArrowDown: [0, PAS],
    }[e.key];
    if (depl) {
      e.preventDefault();
      mesurer();
      setLoupe((l) => ({ x: borne((l?.x ?? 50) + depl[0]), y: borne((l?.y ?? 50) + depl[1]), doigt: false }));
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const l = loupe ?? { x: 50, y: 50 };
      onAccuser(l.x, l.y);
    }
  };

  const focaliser = () => {
    if (!actif) return;
    mesurer();
    setLoupe((l) => l ?? { x: 50, y: 50, doigt: false });
  };

  // La loupe : environ un cinquième de la scène, entre 110 et 180 pixels.
  const diametre = Math.round(Math.min(180, Math.max(110, taille.l * 0.2)));
  const visible = actif && loupe && taille.l > 0;

  return (
    <div className={`hg-loupe__scene${actif ? ' est-active' : ''}${visible ? ' a-sa-loupe' : ''}`}>
      <div
        ref={cadre}
        className="hg-loupe__cadre"
        role="application"
        aria-roledescription="scène à fouiller"
        aria-label={actif
          ? `${description}. Promène la loupe avec la souris, le doigt ou les flèches du clavier, puis touche, clique ou appuie sur Entrée pour accuser.`
          : description}
        tabIndex={actif ? 0 : -1}
        onPointerDown={appuyer}
        onPointerMove={bouger}
        onPointerUp={relacher}
        onPointerCancel={annuler}
        onPointerLeave={quitter}
        onKeyDown={touche}
        onFocus={focaliser}
        onBlur={() => setLoupe(null)}
      >
        <img className="hg-loupe__image" src={src} alt="" draggable="false" />

        {marques.map((m) => (
          <span
            key={m.id}
            className={`hg-loupe__marque hg-loupe__marque--${m.sorte}`}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            aria-hidden="true"
          >
            {m.sorte === 'leurre' ? '?' : '✗'}
          </span>
        ))}

        {entourer.map((z, i) => (
          <span
            key={`${z.x}-${z.y}`}
            className={`hg-loupe__cercle${i > 0 ? ' hg-loupe__cercle--second' : ''}`}
            style={{ left: `${z.x}%`, top: `${z.y}%`, width: `${z.r * 2}%` }}
            aria-hidden="true"
          />
        ))}

        {children}

        {visible && (
          <div
            className="hg-loupe__verre"
            style={{
              left: `${loupe.x}%`,
              top: `${loupe.y}%`,
              width: diametre,
              height: diametre,
              transform: 'translate(-50%, -50%)',
              backgroundImage: `url(${src})`,
              backgroundSize: `${taille.l * ZOOM}px ${taille.h * ZOOM}px`,
              backgroundPosition: `${diametre / 2 - (taille.l * ZOOM * loupe.x) / 100}px ${diametre / 2 - (taille.h * ZOOM * loupe.y) / 100}px`,
            }}
            aria-hidden="true"
          >
            <span className="hg-loupe__croix" />
          </div>
        )}
      </div>
    </div>
  );
}
