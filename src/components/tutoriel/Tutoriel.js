import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import TestMicro from './TestMicro';
import {
  ETAPES, apresLaPartie, avancement, titreDeLEtape,
} from '../../lib/tutoriel/etapes';
import './tutoriel.css';

/** Le temps laissé à une cible pour apparaître, avant de sauter l'étape. */
const DELAI_CIBLE_MS = 1500;

/**
 * Une étape facultative n'attend presque pas : la page est déjà chargée, et si sa
 * cible n'y est pas (pas de conseillère avant la 3e, jeux éteints), elle n'y sera pas.
 * Sans quoi le parent resterait devant un écran noir à chaque étape absente.
 */
const DELAI_FACULTATIF_MS = 400;

/** Le défilement doux n'a pas amené la cible à l'écran : on y va d'un coup. */
const DELAI_DEFILEMENT_MS = 700;
const SONDE_MS = 120;

/** Ce qui entoure la cible éclairée, en pixels. */
const MARGE_TROU = 8;
const MARGE_BULLE = 14;

const trouver = (selecteur) => (selecteur ? document.querySelector(selecteur) : null);

/** La porte d'une visite n'est pas sur cette page : toute sa visite se saute. */
const sansSaPorte = (etape) => Boolean(etape.si) && !trouver(etape.si);

/** Le rectangle éclairé, gardé dans l'écran même quand la cible le dépasse. */
function rectangleDe(element) {
  const r = element.getBoundingClientRect();
  const haut = Math.max(r.top - MARGE_TROU, 0);
  const gauche = Math.max(r.left - MARGE_TROU, 0);
  const bas = Math.min(r.bottom + MARGE_TROU, window.innerHeight);
  const droite = Math.min(r.right + MARGE_TROU, window.innerWidth);

  return {
    haut, gauche, largeur: Math.max(droite - gauche, 0), hauteur: Math.max(bas - haut, 0),
  };
}

/** La cible est-elle à l'écran ? Sous la page, ou masquée, elle ne l'est pas. */
function aLEcran(element) {
  const r = element.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}

/**
 * Amène la cible à l'écran. Plus haute que l'écran, on en montre le début : au
 * milieu, le titre d'une longue section resterait hors de la vue.
 */
function amener(element, behavior) {
  const haute = element.getBoundingClientRect().height > window.innerHeight * 0.8;
  element.scrollIntoView?.({ block: haute ? 'start' : 'center', inline: 'nearest', behavior });
}

const memeRectangle = (a, b) => a && b
  && Math.abs(a.haut - b.haut) < 1 && Math.abs(a.gauche - b.gauche) < 1
  && Math.abs(a.largeur - b.largeur) < 1 && Math.abs(a.hauteur - b.hauteur) < 1;

/**
 * LE TUTORIEL — Camara, le 02/11/2026 : « tout est sombre, on voit juste, sous
 * forme de bulle, où cliquer », avec une barre de progression.
 *
 * QUATRE VOILES AUTOUR DE LA CIBLE, ET NON UNE OMBRE GÉANTE. Eux seuls arrêtent
 * les clics : hors de la cible, on ne peut rien toucher, pas même le menu.
 * L'espace entre eux laisse passer le clic quand l'étape le demande ; sinon, un
 * cinquième voile transparent le retient.
 *
 * UNE ÉTAPE NE PEUT PAS BLOQUER LE PARENT. Une cible absente (jeux éteints, pas
 * d'examen cette année, carte de matière fermée) fait sauter l'étape, et
 * « Passer » reste affiché en permanence.
 *
 * « PRÉCÉDENT » — Camara, le 08/11/2026. Il revient à la dernière étape VUE, et non à
 * l'étape d'avant dans la liste : une étape absente se resauterait aussitôt, et le parent
 * retomberait là d'où il vient sans comprendre. D'où `vues`, où ne s'inscrit que ce qui
 * a été à l'écran.
 *
 * @param etapes    le parcours : celui de la page de l'enfant, ou celui de sa fiche.
 * @param onScene   appelé avec l'écran de démonstration que demande l'étape et sa vue,
 *                  ou null : l'écran s'affiche, change ou se retire.
 * @param onFenetre appelé au retour avec 'duree', 'casque' ou null : la fenêtre que
 *                  l'étape retrouvée éclaire. Sans elle, une étape qui attend la fenêtre
 *                  suivante, ou sa fermeture, repartirait toute seule en avant.
 * @param onFin     appelé à la fin comme à « Passer ».
 */
export default function Tutoriel({
  etapes = ETAPES, onScene, onFenetre, onFin,
}) {
  const [{ index, vues }, setParcours] = useState({ index: 0, vues: [] });
  const [trou, setTrou] = useState(null);
  const [position, setPosition] = useState(null);

  const bulleRef = useRef(null);
  const derniereVue = useRef(null);
  const etape = etapes[index];
  const derniere = index === etapes.length - 1;

  // LA DERNIÈRE BULLE QUE CE PARENT VERRA, même si la liste continue : ce qui reste après
  // a sa porte absente de cette page. On n'y écrit pas « Suivant » pour tout refermer.
  const finale = derniere || etapes.slice(index + 1).every(sansSaPorte);

  const avancer = useCallback(() => {
    setTrou(null);
    setParcours((avant) => {
      if (avant.index >= etapes.length - 1) return avant;
      return {
        index: avant.index + 1,
        vues: derniereVue.current === avant.index ? [...avant.vues, avant.index] : avant.vues,
      };
    });
  }, [etapes]);

  const reculer = () => {
    if (vues.length === 0) return;

    const retrouvee = vues[vues.length - 1];
    setTrou(null);
    setParcours({ index: retrouvee, vues: vues.slice(0, -1) });
    onFenetre?.(etapes[retrouvee].fenetre ?? null);
  };

  // SAUTER UNE PARTIE. La fenêtre ouverte, s'il y en a une, se referme ; l'étape quittée
  // reste dans `vues` : « Précédent » y ramène, fenêtre comprise.
  const suiteDeLaPartie = etapes === ETAPES ? apresLaPartie(index) : null;
  const passerLaPartie = () => {
    setTrou(null);
    setParcours({ index: suiteDeLaPartie, vues: [...vues, index] });
    onFenetre?.(ETAPES[suiteDeLaPartie].fenetre ?? null);
  };

  // Une étape est vue quand sa bulle est là : aussitôt sans cible, sinon une fois la
  // cible éclairée.
  useEffect(() => {
    if (!etape.cible || trou) derniereVue.current = index;
  }, [etape, index, trou]);

  // LA SCÈNE SUIT L'ÉTAPE, À L'ARRIVÉE SUR ELLE. Pas à chaque rendu : le clic sur
  // « Quitter » retire la démonstration avant de changer d'étape, et un effet
  // continu la remettrait aussitôt.
  useEffect(() => {
    if (sansSaPorte(etape)) onScene?.(null, null);
    else onScene?.(etape.scene ?? null, etape.vue ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // TROUVER LA CIBLE. Elle peut arriver un peu après : une modale qui s'ouvre, un
  // bloc dont les données se chargent. Passé le délai, l'étape se saute.
  useEffect(() => {
    if (sansSaPorte(etape)) {
      if (derniere) onFin?.();
      else avancer();
      return undefined;
    }

    if (!etape.cible) {
      setTrou(null);
      return undefined;
    }

    const debut = Date.now();
    let suivi = null;
    let sonde = null;
    let cible = null;
    let dejaVue = false;
    let horsEcranDepuis = null;
    let ramenee = false;

    // LA DERNIÈRE ÉTAPE N'A PAS DE SUITE : sans cible, c'est la fin. Sinon le parent
    // resterait devant un écran noir, sans bulle ni bouton.
    const sauter = () => {
      if (derniere) onFin?.();
      else avancer();
    };

    // HORS DE L'ÉCRAN, ON N'ÉCLAIRE RIEN — Camara, le 03/11/2026 : en 3e, l'écran
    // restait noir à 90 %. Les cartes y sont longues et « Mes contrôles » est loin
    // sous l'écran : le trou et sa bulle se calculaient là-bas, hors de la vue, et
    // le défilement doux n'y amenait pas. On attend la cible à l'écran, on l'y amène
    // d'un coup si le défilement n'a pas suffi, et on saute l'étape si rien n'y fait.
    const suivre = () => {
      if (cible?.isConnected) {
        if (aLEcran(cible)) {
          dejaVue = true;
          horsEcranDepuis = null;
          ramenee = false;

          const rectangle = rectangleDe(cible);
          setTrou((avant) => (memeRectangle(avant, rectangle) ? avant : rectangle));
        } else {
          setTrou(null);

          const maintenant = Date.now();
          if (horsEcranDepuis === null) horsEcranDepuis = maintenant;

          if (!ramenee && maintenant - horsEcranDepuis >= DELAI_DEFILEMENT_MS) {
            ramenee = true;
            amener(cible, 'auto');
          }

          if (!dejaVue && maintenant - horsEcranDepuis >= DELAI_DEFILEMENT_MS + DELAI_CIBLE_MS) {
            sauter();
            return;
          }
        }
      }
      suivi = requestAnimationFrame(suivre);
    };

    const chercher = () => {
      cible = trouver(etape.cible);

      if (cible) {
        amener(cible, 'smooth');
        suivre();
        return;
      }

      if (Date.now() - debut >= (etape.optionnelle ? DELAI_FACULTATIF_MS : DELAI_CIBLE_MS)) {
        sauter();
        return;
      }

      sonde = setTimeout(chercher, SONDE_MS);
    };

    chercher();

    return () => {
      clearTimeout(sonde);
      if (suivi) cancelAnimationFrame(suivi);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etape, avancer]);

  // CE QUI FAIT PASSER À LA SUITE SANS « SUIVANT » : une fenêtre qui s'ouvre après
  // le clic du parent, ou qui se referme.
  useEffect(() => {
    if (!etape.attend && !etape.attendFin) return undefined;

    const sonde = setInterval(() => {
      const present = etape.attend && trouver(etape.attend);
      const parti = etape.attendFin && !trouver(etape.attendFin);
      if (present || parti) avancer();
    }, SONDE_MS);

    return () => clearInterval(sonde);
  }, [etape, avancer]);

  // PLACER LA BULLE : sous la cible s'il y a la place, sinon au-dessus, sinon à
  // côté, sinon en bas de l'écran pour une cible qui le remplit — le tableau, par
  // exemple, ne doit pas se retrouver caché par son explication. Toujours entière
  // dans l'écran.
  useLayoutEffect(() => {
    const bulle = bulleRef.current;
    if (!bulle) return;

    if (!trou) {
      setPosition(null);
      return;
    }

    const hauteur = bulle.offsetHeight;
    const largeur = bulle.offsetWidth;
    const barre = 56;

    const dessous = trou.haut + trou.hauteur + MARGE_BULLE;
    const dessus = trou.haut - MARGE_BULLE - hauteur;

    const centre = trou.gauche + trou.largeur / 2;
    let gauche = Math.min(
      Math.max(centre - largeur / 2, MARGE_BULLE),
      Math.max(window.innerWidth - largeur - MARGE_BULLE, MARGE_BULLE),
    );

    let haut;
    if (dessous + hauteur <= window.innerHeight - MARGE_BULLE) {
      haut = dessous;
    } else if (dessus >= barre) {
      haut = dessus;
    } else {
      const milieu = trou.haut + trou.hauteur / 2 - hauteur / 2;
      const placeADroite = window.innerWidth - (trou.gauche + trou.largeur);
      haut = Math.min(
        Math.max(milieu, barre + MARGE_BULLE),
        window.innerHeight - hauteur - MARGE_BULLE,
      );

      if (trou.gauche >= largeur + 2 * MARGE_BULLE) {
        gauche = trou.gauche - largeur - MARGE_BULLE;
      } else if (placeADroite >= largeur + 2 * MARGE_BULLE) {
        gauche = trou.gauche + trou.largeur + MARGE_BULLE;
      } else {
        haut = window.innerHeight - hauteur - MARGE_BULLE;
      }
    }

    setPosition((avant) => (avant && avant.haut === haut && avant.gauche === gauche
      ? avant
      : { haut, gauche }));
  }, [trou, index]);

  const part = finale ? 100 : avancement(index, etapes.length);
  const attendClic = Boolean(etape.action);

  return createPortal(
    // PAS D'`aria-modal`, ET C'EST ESSENTIEL — Camara, le 03/11/2026 : en 3e, le
    // tutoriel finissait juste après le cours. `verrouDefilement.js` fige la page dès
    // qu'une fenêtre se déclare modale : le tutoriel figeait donc la page qu'il doit
    // faire défiler. « Mes contrôles » et la préparation à l'examen, sous les longues
    // cartes de la 3e, restaient hors d'atteinte et leurs étapes se sautaient.
    <div className="tuto" role="dialog" aria-label="Tutoriel de Mimia">
      {trou ? (
        <>
          <div className="tuto__voile" style={{ top: 0, left: 0, right: 0, height: trou.haut }} />
          <div
            className="tuto__voile"
            style={{ top: trou.haut + trou.hauteur, left: 0, right: 0, bottom: 0 }}
          />
          <div
            className="tuto__voile"
            style={{ top: trou.haut, left: 0, width: trou.gauche, height: trou.hauteur }}
          />
          <div
            className="tuto__voile"
            style={{
              top: trou.haut,
              left: trou.gauche + trou.largeur,
              right: 0,
              height: trou.hauteur,
            }}
          />

          <div
            className={`tuto__trou${etape.ouverte ? ' tuto__trou--ouvert' : ''}`}
            style={{
              top: trou.haut, left: trou.gauche, width: trou.largeur, height: trou.hauteur,
            }}
          />
        </>
      ) : (
        <div className="tuto__voile" style={{ inset: 0 }} />
      )}

      <div className="tuto__progression">
        <div
          className="tuto__barre"
          role="progressbar"
          aria-label="Avancée du tutoriel"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={part}
        >
          <span style={{ width: `${part}%` }} />
        </div>

        <span className="tuto__pourcent">{part} %</span>

        {!finale && (
          <button type="button" className="tuto__passer" onClick={onFin}>
            Passer le tutoriel
          </button>
        )}
      </div>

      {/* Tant qu'une étape cherche sa cible, sa bulle n'attend pas dans le vide :
          elle n'apparaît qu'une fois qu'il y a quelque chose à montrer. */}
      {(!etape.cible || trou) && (
        <div
          ref={bulleRef}
          className={`tuto__bulle${position ? '' : ' tuto__bulle--centre'}`}
          style={position ? { top: position.haut, left: position.gauche } : undefined}
        >
          <h2 className="tuto__titre">{titreDeLEtape(etape)}</h2>
          <p className="tuto__texte">{etape.texte}</p>

          {etape.composant === 'micro' && <TestMicro />}

          {attendClic && (
            <p className="tuto__action">
              <span aria-hidden="true">👉</span> {etape.action}
            </p>
          )}

          {(vues.length > 0 || !attendClic || suiteDeLaPartie !== null) && (
            <div className="tuto__actions">
              {vues.length > 0 && (
                <button
                  type="button"
                  className="tuto-bouton tuto-bouton--discret tuto__precedent"
                  onClick={reculer}
                >
                  Précédent
                </button>
              )}

              {suiteDeLaPartie !== null && (
                <button
                  type="button"
                  className="tuto-bouton tuto-bouton--discret tuto__sauter"
                  onClick={passerLaPartie}
                >
                  Passer l’étape
                </button>
              )}

              {!attendClic && (
                <button
                  type="button"
                  className="tuto-bouton tuto__suite"
                  onClick={finale ? onFin : avancer}
                >
                  {finale ? 'Terminer' : (etape.suivant ?? 'Suivant')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}
