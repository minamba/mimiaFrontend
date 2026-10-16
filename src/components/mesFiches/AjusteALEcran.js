import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Jusqu'où la fiche peut rétrécir POUR TENIR EN HAUTEUR. Les schémas (carte,
 * arbre) sont hauts : il leur faut souvent moins de la moitié de leur taille
 * pour tenir — l'ancien plancher à 55 % les laissait déborder. « Agrandir »
 * sert à lire le détail.
 */
const ECHELLE_MIN = { visuelle: 0.3, express: 0.3 };
const ECHELLE_MIN_TEXTE = 0.6;

/** Jamais moins que cette part de la fenêtre pour la fiche, même sous un long en-tête. */
const PART_MIN_FENETRE = 0.6;

/** La largeur de bureau de la feuille (`.fdr-feuille`, max-width) : sa mise en page de référence. */
const LARGEUR_FEUILLE = 920;

/** À côté du sommaire, la fiche peut grandir un peu pour remplir sa colonne. */
const GRANDISSEMENT_MAX = 1.15;

/**
 * LA FICHE À LA TAILLE DE L'ÉCRAN — Camara, le 16/10/2026 : « que la taille
 * des fiches soit adaptée à l'écran et totalement visible ».
 *
 * La fiche est réduite pour tenir dans la place qui RESTE sous le haut de la
 * page (titre, barre de navigation) : à l'ouverture, la page entière tient
 * dans la fenêtre. Viser toute la hauteur de la fenêtre ne suffisait pas —
 * la fiche commence bien plus bas, et débordait encore.
 *
 * ELLE GARDE SA MISE EN PAGE DE BUREAU (16/10/2026, avec le sommaire à
 * gauche : « la fiche est trop comprimée ») : dans une colonne plus étroite
 * que la feuille, elle n'est PAS remise en page — une carte tassée devient
 * haute, puis minuscule une fois ajustée. Elle est posée à sa largeur de
 * 920 px, puis réduite d'un bloc pour tenir en largeur ET en hauteur.
 *
 * JAMAIS SOUS UN PLANCHER POUR LA HAUTEUR : une carte ou un arbre jusqu'à 30 %
 * de leur taille, un texte jusqu'à 60 % — en dessous, on ne lit plus rien.
 * La largeur, elle, s'impose : une fiche ne déborde jamais sur le côté.
 *
 * Pas sur téléphone : la fiche y prend sa mise en page en colonne, faite pour
 * défiler.
 *
 * À CÔTÉ DU SOMMAIRE (`aGauche`, 16/10/2026 : « trop d'espace vide entre le
 * menu et la carte », puis « tu trouves le design propre ? ») : la fiche
 * REMPLIT sa colonne (jusqu'à 115 % de sa taille) et tient dans la HAUTEUR DE
 * L'ÉCRAN, pas dans la place sous le titre — un petit défilement la montre en
 * entier, le sommaire reste collé. Réduite pour une fiche très haute, elle se
 * cale contre le sommaire. Les bords de la barre, du sommaire et de la fiche
 * s'alignent.
 *
 * LE COIN (`coin`) est posé hors de la réduction — il garde sa taille — et
 * calé sur le bord RÉEL de la feuille, mesuré, et non sur celui de la page :
 * la feuille est souvent moins large que la page.
 */
export default function AjusteALEcran({ type, coin = null, aGauche = false, onFeuille = null, children }) {
  const cadre = useRef(null);
  const contenu = useRef(null);
  const [mesure, setMesure] = useState({ echelle: 1, hauteur: null, decalage: 0 });
  const [place, setPlace] = useState(null);

  useLayoutEffect(() => {
    const c = contenu.current;
    const w = cadre.current;
    if (!c || !w) return undefined;

    const calculer = () => {
      const colonne = w.clientWidth;
      if (!colonne || window.innerWidth <= 720) {
        c.style.width = '';
        setMesure((m) => (m.echelle === 1 && m.hauteur === null && m.decalage === 0
          ? m
          : { echelle: 1, hauteur: null, decalage: 0 }));
        return;
      }

      // La feuille à sa largeur de bureau, au moins : la hauteur se lit sur
      // CETTE mise en page (lire offsetHeight force la mise en page à jour).
      // Calée à gauche, la feuille garde sa propre largeur : rien ne la centre.
      const largeur = aGauche ? LARGEUR_FEUILLE : Math.max(colonne, LARGEUR_FEUILLE);
      if (c.style.width !== `${largeur}px`) c.style.width = `${largeur}px`;
      const hauteur = c.offsetHeight;
      if (!hauteur) return;

      // La place sous le haut de la page, page remontée tout en haut — ou,
      // à côté du sommaire, la hauteur de l'écran.
      const haut = w.getBoundingClientRect().top + window.scrollY;
      const dispo = aGauche
        // moins la barre du site, collée en haut elle aussi.
        ? window.innerHeight - (document.querySelector('.navbar')?.offsetHeight ?? 0) - 32
        : Math.max(window.innerHeight * PART_MIN_FENETRE, window.innerHeight - haut - 16);
      const plancher = ECHELLE_MIN[type] ?? ECHELLE_MIN_TEXTE;
      const plafond = aGauche ? GRANDISSEMENT_MAX : 1;
      const echelle = Math.min(plafond, colonne / largeur, Math.max(plancher, dispo / hauteur));

      const suivante = {
        echelle,
        hauteur: echelle !== 1 ? hauteur * echelle : null,
        decalage: aGauche ? 0 : (colonne - largeur * echelle) / 2,
      };
      setMesure((m) => (m.echelle === suivante.echelle && m.hauteur === suivante.hauteur && m.decalage === suivante.decalage
        ? m
        : suivante));
    };

    calculer();
    window.addEventListener('resize', calculer);
    const observateur = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(calculer);
    observateur?.observe(c);
    observateur?.observe(w);
    return () => {
      window.removeEventListener('resize', calculer);
      observateur?.disconnect();
    };
  }, [type, aGauche]);

  // LA FEUILLE TELLE QU'ELLE EST AFFICHÉE (16/10/2026) : sa place dans le cadre
  // est rendue au parent, pour aligner la barre d'actions sur ses bords —
  // pleine largeur, elle débordait d'une fiche réduite.
  const signaler = useRef(onFeuille);
  signaler.current = onFeuille;

  // Le coin suit la feuille telle qu'elle est affichée (réduite comprise).
  useLayoutEffect(() => {
    const w = cadre.current;
    const feuille = w?.querySelector('.fdr-feuille');
    if (!feuille) return;
    const rw = w.getBoundingClientRect();
    const rf = feuille.getBoundingClientRect();
    signaler.current?.(rf.width ? { gauche: Math.round(rf.left - rw.left), largeur: Math.round(rf.width) } : null);
    if (!coin) return;
    const suivante = { top: Math.round(rf.top - rw.top + 12), right: Math.round(rw.right - rf.right + 12) };
    setPlace((p) => (p && p.top === suivante.top && p.right === suivante.right ? p : suivante));
  }, [coin, mesure]);

  const transforme = mesure.echelle !== 1 || mesure.decalage !== 0 || aGauche;

  return (
    <div
      ref={cadre}
      className="fdr-ajuste"
      style={{ '--echelle': mesure.echelle, ...(mesure.hauteur ? { height: mesure.hauteur } : {}) }}
    >
      {coin && (
        <div className="fdr-ajuste__coin" style={place ?? undefined}>
          {coin}
        </div>
      )}
      <div
        ref={contenu}
        className="fdr-ajuste__contenu"
        style={transforme
          ? { transform: `translateX(${mesure.decalage}px) scale(${mesure.echelle})`, transformOrigin: 'top left' }
          : undefined}
      >
        {children}
      </div>
    </div>
  );
}
