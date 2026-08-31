import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Le zoom du tableau agrandi.
 *
 * POURQUOI L'AGRANDISSEMENT NE SUFFISAIT PAS
 * ------------------------------------------
 * Une planche d'anatomie porte une douzaine de légendes en corps 8. Mise à la
 * taille de l'écran, elle devient lisible pour SITUER — pas pour LIRE. Un élève
 * de quatrième qui cherche « canal déférent » doit pouvoir s'approcher, et sur
 * un téléphone la question ne se pose même pas.
 *
 * TROIS GESTES, LE MÊME ÉTAT
 * --------------------------
 * Les boutons pour ceux qui ne devinent pas les gestes, la molette pour la
 * souris, le pincement pour le doigt. Ils écrivent tous dans la même échelle et
 * le même décalage : il n'y a qu'un état à comprendre, et aucun des trois ne
 * peut désynchroniser les autres.
 *
 * LE ZOOM SUIT LE POINTEUR, PAS LE CENTRE
 * ---------------------------------------
 * Zoomer vers le centre oblige à repositionner après chaque cran : on vise une
 * légende, elle s'échappe, on la repousse à la main. En gardant le point sous
 * le curseur immobile, on s'approche de ce qu'on regarde — c'est ce que fait
 * toute carte, et personne n'a besoin de l'apprendre.
 *
 * DEUX MODES, ET UN SEUL À LA FOIS
 * --------------------------------
 * À 100 %, la figure se CLIQUE : l'élève montre un endroit au professeur.
 * Dès qu'on zoome, elle se DÉPLACE, et le clic est coupé — le curseur passe à
 * la main ouverte pour l'annoncer.
 *
 * Les deux ne peuvent pas cohabiter : un déplacement se termine par un clic, et
 * distinguer l'un de l'autre à quelques pixels près marchait mal — au mieux on
 * envoyait « je montre ici » en faisant glisser la planche, au pire on lisait
 * un état devenu nul entre le geste et le rendu, et l'application tombait.
 *
 * Séparer les modes supprime la question au lieu de l'arbitrer.
 */

/** En deçà, on ne zoome plus : la figure tiendrait dans un timbre. */
const MIN = 1;

/** Au-delà, une planche de 1000 px devient une bouillie de pixels. */
const MAX = 6;

/** Ce que fait un cran de molette ou un appui sur un bouton. */
const PAS = 0.25;

const borner = (valeur, min, max) => Math.min(max, Math.max(min, valeur));

export default function ZoomSchema({ children }) {
  /**
   * UN SEUL ÉTAT POUR L'ÉCHELLE ET LE DÉCALAGE, ET CE N'EST PAS DU CONFORT.
   *
   * La première version en tenait deux, et mettait à jour le second DANS la
   * fonction de mise à jour du premier. En mode strict, React appelle ces
   * fonctions deux fois pour vérifier qu'elles sont pures : le décalage était
   * donc appliqué en double à chaque cran, et la figure filait vers la gauche
   * un peu plus à chaque zoom jusqu'à sortir du cadre.
   *
   * Un seul état, une seule fonction, aucun effet de bord dedans : appelée
   * deux fois, elle rend deux fois le même résultat.
   */
  const [vue, setVue] = useState({ echelle: 1, x: 0, y: 0 });
  const { echelle } = vue;

  const cadreRef = useRef(null);

  // Les pointeurs actuellement posés. Une entrée = un doigt ou la souris ;
  // deux entrées = un pincement.
  const pointeurs = useRef(new Map());
  const depart = useRef(null);

  const reinitialiser = useCallback(() => setVue({ echelle: 1, x: 0, y: 0 }), []);

  /**
   * Porte l'échelle à une valeur donnée, en gardant immobile le point visé.
   *
   * ABSOLU plutôt que multiplicatif : le pincement connaît l'échelle qu'il
   * veut atteindre, pas un facteur. Le lui faire calculer à partir de l'échelle
   * courante l'obligerait à la lire dans une fermeture qui peut être périmée
   * d'un rendu — et le zoom s'emballait.
   *
   * `versX/versY` sont relatifs au cadre. Sans eux — c'est-à-dire pour les
   * boutons — on garde le centre, seul repère qui ait un sens quand le geste
   * ne désigne aucun endroit.
   */
  const zoomerA = useCallback((cible, versX, versY) => {
    const cadre = cadreRef.current;
    if (!cadre) return;

    const bornes = cadre.getBoundingClientRect();
    const px = versX ?? bornes.width / 2;
    const py = versY ?? bornes.height / 2;

    setVue((v) => {
      const nouvelle = borner(cible, MIN, MAX);
      if (nouvelle === v.echelle) return v;

      // Revenu à l'échelle 1 : on recentre plutôt que de laisser la figure
      // décalée dans un cadre qui la contient entièrement. Une planche
      // dézoomée et posée de travers a l'air cassée.
      if (nouvelle === MIN) return { echelle: MIN, x: 0, y: 0 };

      const rapport = nouvelle / v.echelle;

      return {
        echelle: nouvelle,
        x: px - (px - v.x) * rapport,
        y: py - (py - v.y) * rapport,
      };
    });
  }, []);

  /** Un cran, à partir de l'échelle courante. */
  const zoomer = useCallback(
    (facteur, versX, versY) => zoomerA(echelle * facteur, versX, versY),
    [zoomerA, echelle],
  );

  // LA MOLETTE, EN ÉCOUTEUR NON PASSIF.
  //
  // React attache `onWheel` en passif : `preventDefault` y est ignoré, et la
  // page défile derrière le zoom. On pose donc l'écouteur à la main.
  useEffect(() => {
    const cadre = cadreRef.current;
    if (!cadre) return undefined;

    const auDefilement = (evenement) => {
      evenement.preventDefault();

      const bornes = cadre.getBoundingClientRect();
      const facteur = evenement.deltaY < 0 ? 1 + PAS : 1 / (1 + PAS);

      zoomer(
        facteur,
        evenement.clientX - bornes.left,
        evenement.clientY - bornes.top,
      );
    };

    cadre.addEventListener('wheel', auDefilement, { passive: false });
    return () => cadre.removeEventListener('wheel', auDefilement);
  }, [zoomer]);

  /** La distance entre les deux doigts posés, pour le pincement. */
  const ecartement = () => {
    const [a, b] = [...pointeurs.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const auPointeurBas = (evenement) => {
    // LE CADRE GARDE LE POINTEUR — MAIS SEULEMENT QUAND ON DÉPLACE.
    //
    // Sans capture, un déplacement qui sort du cadre — ce qui arrive tout le
    // temps quand on tire une figure zoomée vers le bord — déclenche
    // `pointerleave`, et la main lâche la planche en pleine course.
    //
    // MAIS CAPTURER À 100 % TUE LE CLIC. Quand un pointeur est capturé, la
    // spécification délivre le `click` à l'élément qui capture, pas à celui
    // qu'on a visé : le bouton de la figure ne le recevait jamais, et montrer
    // un endroit au professeur ne marchait plus qu'en dehors du plein écran.
    //
    // On ne capture donc que là où c'est utile : zoomé, où il y a quelque chose
    // à déplacer et plus rien à cliquer.
    if (echelle > MIN) {
      try { evenement.currentTarget.setPointerCapture(evenement.pointerId); }
      catch { /* Navigateur sans capture : on retombe sur le comportement d'avant. */ }
    }

    pointeurs.current.set(evenement.pointerId, {
      x: evenement.clientX, y: evenement.clientY,
    });

    if (pointeurs.current.size === 2) {
      depart.current = { ecart: ecartement(), echelle };
      return;
    }

    depart.current = {
      x: evenement.clientX, y: evenement.clientY, vue,
    };
  };

  const auPointeurBouge = (evenement) => {
    if (!pointeurs.current.has(evenement.pointerId)) return;

    pointeurs.current.set(evenement.pointerId, {
      x: evenement.clientX, y: evenement.clientY,
    });

    // PINCEMENT. Deux doigts : l'écartement commande l'échelle, et le milieu
    // des deux sert de point fixe — c'est là que l'utilisateur regarde.
    if (pointeurs.current.size === 2 && depart.current?.ecart) {
      const cadre = cadreRef.current;
      if (!cadre) return;

      const bornes = cadre.getBoundingClientRect();
      const [a, b] = [...pointeurs.current.values()];
      const facteur = ecartement() / depart.current.ecart;

      // L'échelle VISÉE se calcule à partir de celle du début du geste, jamais
      // de la courante : composer un facteur à chaque déplacement de doigt
      // faisait s'emballer le zoom.
      zoomerA(
        depart.current.echelle * facteur,
        (a.x + b.x) / 2 - bornes.left,
        (a.y + b.y) / 2 - bornes.top,
      );

      return;
    }

    // DÉPLACEMENT. Un seul pointeur, et seulement si on est zoomé : à
    // l'échelle 1 la figure tient dans le cadre, la déplacer n'a aucun sens.
    if (pointeurs.current.size !== 1 || echelle <= MIN || !depart.current) return;

    // LES VALEURS SONT LUES MAINTENANT, PAS DANS L'UPDATER.
    //
    // `setVue` exécute sa fonction plus tard, au rendu. D'ici là un
    // `pointerup` a pu remettre `depart.current` à null — et lire `.vue`
    // dessus faisait tomber toute l'application, écran noir compris.
    const origine = depart.current.vue;
    const x = origine.x + (evenement.clientX - depart.current.x);
    const y = origine.y + (evenement.clientY - depart.current.y);

    setVue((v) => ({ ...v, x, y }));
  };

  const auPointeurHaut = (evenement) => {
    try { evenement.currentTarget.releasePointerCapture(evenement.pointerId); }
    catch { /* Déjà relâché, ou jamais capturé. */ }

    pointeurs.current.delete(evenement.pointerId);
    if (pointeurs.current.size < 2) depart.current = null;
  };

  const zoome = echelle > MIN;

  return (
    <div className="zoom-schema">
      <div
        ref={cadreRef}
        className={zoome ? 'zoom-schema__cadre zoom-schema__cadre--zoome' : 'zoom-schema__cadre'}
        onPointerDown={auPointeurBas}
        onPointerMove={auPointeurBouge}
        onPointerUp={auPointeurHaut}
        onPointerCancel={auPointeurHaut}
        onPointerLeave={auPointeurHaut}
      >
        <div
          className="zoom-schema__contenu"
          style={{
            transform: `translate(${vue.x}px, ${vue.y}px) scale(${vue.echelle})`,
          }}
        >
          {/* L'enfant est une FONCTION, pas un élément : il doit savoir s'il
              est zoomé pour couper le clic « montrer du doigt ». Le passer en
              props obligerait ce composant à connaître la figure qu'il
              transporte ; ainsi il ne transporte qu'un état. */}
          {typeof children === 'function' ? children(zoome) : children}
        </div>
      </div>

      {/* CE QUE LE CLIC FAIT, DIT AVANT QU'ON L'ESSAIE.

          Un élève qui zoome pour lire une légende, puis clique dessus pour la
          montrer au professeur, ne comprend pas pourquoi rien ne part. Le mode
          se lit donc en permanence, et il change au moment exact où il change.

          Jamais la couleur seule : l'icône et la phrase disent la même chose.
          Un élève daltonien — un garçon sur douze — ne verrait sinon qu'un
          bandeau qui change de teinte sans savoir dans quel sens.

          `aria-live="polite"` annonce le basculement à un lecteur d'écran sans
          couper ce qu'il est en train de lire. */}
      <p
        className={zoome ? 'zoom-schema__mode zoom-schema__mode--coupe' : 'zoom-schema__mode'}
        aria-live="polite"
      >
        <span aria-hidden="true">{zoome ? '✋' : '👆'}</span>
        {zoome
          ? 'Tu déplaces la figure. Le clic ne parle plus au professeur — reviens à 100 % pour lui montrer un endroit.'
          : 'Clique sur la figure pour montrer un endroit au professeur.'}
      </p>

      {/* Les commandes restent VISIBLES à l'échelle 1 : cachées, personne ne
          découvrirait qu'on peut zoomer — et c'est justement l'élève qui n'a
          pas le réflexe de la molette qui en a le plus besoin. */}
      <div className="zoom-schema__commandes" role="group" aria-label="Zoom">
        <button
          type="button"
          onClick={() => zoomer(1 / (1 + PAS))}
          disabled={echelle <= MIN}
          aria-label="Dézoomer"
          title="Dézoomer"
        >
          −
        </button>

        <button
          type="button"
          onClick={reinitialiser}
          disabled={!zoome}
          className="zoom-schema__taux"
          aria-label="Revenir à la taille normale"
          title="Revenir à la taille normale"
        >
          {Math.round(echelle * 100)} %
        </button>

        <button
          type="button"
          onClick={() => zoomer(1 + PAS)}
          disabled={echelle >= MAX}
          aria-label="Zoomer"
          title="Zoomer"
        >
          +
        </button>
      </div>
    </div>
  );
}
