import {
  createElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { analyserSchema } from '../lib/storage/schemaSvg';
import { cleSchema, titreFigure, urlCreditPlanche, urlPlanche } from '../lib/storage/schemas';

/**
 * Le schéma tracé au tableau.
 *
 * Rendu à partir de l'arbre assaini, jamais par injection de balisage : pas de
 * `dangerouslySetInnerHTML` ici ni ailleurs. Ce qui n'a pas été reconnu par
 * l'assainisseur n'existe tout simplement pas dans l'arbre, donc ne peut pas
 * être rendu — c'est une garantie de construction, pas un filtre à trous.
 *
 * L'apparence n'est pas dans le SVG : `stroke` et `fill` valent au plus
 * `currentColor`, et c'est la feuille de style qui donne la craie. Un schéma
 * ne peut donc pas dépareiller avec le reste du tableau, ni devenir illisible
 * en choisissant du noir sur fond noir.
 */
/**
 * Où l'élève a cliqué, dit en français.
 *
 * POURQUOI DES MOTS ET PAS SEULEMENT DES POURCENTAGES
 * --------------------------------------------------
 * « 74 %, 82 % » demande au professeur un calcul mental à chaque clic, et il
 * le fera parfois de travers. « en bas à droite » est immédiat, et c'est de
 * toute façon la précision réelle de l'information : un doigt sur une carte ne
 * désigne pas un point, il désigne une zone.
 *
 * Les deux partent quand même — les mots pour raisonner, les nombres pour
 * départager deux zones voisines.
 */
function situer(x, y) {
  // CINQ BANDES ET NON TROIS.
  //
  // Trois bandes donnaient « en bas à droite » pour tout le tiers sud-est
  // d'une carte de France — soit six régions. Le professeur ne pouvait
  // qu'être vague, et il l'a été. Cinq bandes distinguent le bord du milieu,
  // ce qui suffit à séparer la Provence de l'Auvergne.
  const bande = (v, mots) =>
    v < 0.2 ? mots[0] : v < 0.4 ? mots[1] : v < 0.6 ? mots[2] : v < 0.8 ? mots[3] : mots[4];

  const colonne = bande(x, [
    "tout à gauche", "à gauche", "au centre", "à droite", "tout à droite",
  ]);

  const ligne = bande(y, [
    "tout en haut", "en haut", "à mi-hauteur", "en bas", "tout en bas",
  ]);

  if (colonne === 'au centre' && ligne === 'à mi-hauteur') return 'en plein centre';

  return `${ligne}, ${colonne}`;
}

/**
 * L'étiquette du dessin la plus proche d'un point de l'écran, ou null.
 *
 * POURQUOI DES COORDONNÉES D'ÉCRAN ET NON CELLES DU `viewBox`
 * ----------------------------------------------------------
 * Le SVG est mis à l'échelle, parfois recadré, et son repère interne n'a aucun
 * rapport simple avec ce que voit l'élève. `getBoundingClientRect` rend la
 * position RÉELLE de chaque mot à l'écran, après toutes les transformations :
 * c'est le seul repère commun avec le clic.
 *
 * LA PORTÉE MAXIMALE COMPTE AUTANT QUE LA DISTANCE. Un clic dans un coin vide
 * ne désigne pas l'étiquette la moins lointaine — il ne désigne rien. Nommer
 * quand même serait exactement l'erreur qu'on vient de corriger côté planches.
 * Un huitième de la diagonale : assez large pour rattraper une étiquette posée
 * à côté de sa forme, assez serré pour qu'un clic perdu reste sans réponse.
 */
function motLePlusProche(racine, clientX, clientY) {
  const cadre = racine.getBoundingClientRect();
  if (cadre.width <= 0 || cadre.height <= 0) return null;

  const portee = Math.hypot(cadre.width, cadre.height) / 8;

  let mot = null;
  let meilleure = Infinity;

  for (const texte of racine.querySelectorAll('text')) {
    const contenu = (texte.textContent ?? '').trim();
    if (!contenu) continue;

    const bornes = texte.getBoundingClientRect();
    if (bornes.width <= 0 && bornes.height <= 0) continue;

    const distance = Math.hypot(
      bornes.left + bornes.width / 2 - clientX,
      bornes.top + bornes.height / 2 - clientY,
    );

    if (distance < meilleure) {
      meilleure = distance;
      mot = contenu;
    }
  }

  return meilleure <= portee ? mot : null;
}

/**
 * @param point   L'endroit montré, en fractions, ou null. FOURNI PAR LE PARENT
 *                quand il existe deux vues de la même figure — le panneau et le
 *                plein écran. Sans ça, chacune tient sa propre marque : on
 *                clique en grand, la vue se ferme, et la petite n'a jamais rien
 *                su. L'élève voyait alors le professeur commenter un clic dont
 *                il ne restait aucune trace à l'écran.
 * @param onPoint Prévient le parent qu'un endroit vient d'être montré.
 */
export default function Schema({ contenu, onMontrer, point: pointImpose, onPoint }) {
  const arbre = useMemo(() => analyserSchema(contenu), [contenu]);
  const svgRef = useRef(null);
  const [cadre, setCadre] = useState(null);

  // La planche remplace le dessin quand elle existe ET qu'elle se charge.
  // L'échec fait revenir au tracé : un fichier pas encore déposé, ou mal
  // nommé, ne doit jamais laisser un tableau vide devant un élève.
  const cle = useMemo(() => cleSchema(contenu), [contenu]);
  const planche = useMemo(() => urlPlanche(cle), [cle]);
  const [plancheKo, setPlancheKo] = useState(false);

  useLayoutEffect(() => setPlancheKo(false), [contenu]);

  /**
   * LE CRÉDIT N'EST PAS UNE DÉCORATION, C'EST UNE CONDITION.
   *
   * Les planches viennent de Wikimedia sous CC BY ou CC BY-SA. Ces licences
   * autorisent l'affichage À CONDITION de nommer l'auteur et la licence, partout
   * où l'œuvre est montrée. Ici, « partout » veut dire ce tableau : c'est le
   * seul endroit où un élève voit la planche, donc le seul endroit où la
   * condition est remplie ou ne l'est pas.
   *
   * L'appel est séparé de l'image parce qu'une balise `img` ne donne accès à
   * aucun en-tête de sa réponse.
   *
   * UNE PANNE ICI N'INTERROMPT PAS LE COURS : le crédit manque, le schéma
   * s'affiche. C'est un manquement à réparer, pas une raison de laisser un
   * tableau vide devant un enfant.
   */
  const [credit, setCredit] = useState(null);

  /**
   * L'endroit montré par l'élève, en fraction de la planche.
   *
   * Remis à zéro quand le tableau change : une marque laissée d'une figure à
   * l'autre désignerait un point sur une image qui n'est plus là.
   */
  const [pointLocal, setPointLocal] = useState(null);

  // Contrôlé par le parent s'il en tient un, autonome sinon. Les deux modes
  // cohabitent pour que ce composant reste utilisable seul.
  const controle = onPoint !== undefined;
  const point = controle ? pointImpose ?? null : pointLocal;

  const noter = (p) => {
    if (controle) onPoint(p);
    else setPointLocal(p);
  };

  /**
   * OÙ POSER L'ÉPINGLE, EN PIXELS, DANS LE BOUTON.
   *
   * Le clic est mesuré sur l'IMAGE ; la marque, elle, est positionnée dans le
   * bouton qui la contient. Tant que le bouton épousait l'image, un pourcentage
   * valait pour les deux et personne n'avait à y penser.
   *
   * Le plein écran a séparé les deux : le bouton y occupe tout le cadre pour
   * donner une hauteur ferme à l'image, qui flotte au centre. Un pourcentage du
   * bouton désignait alors un tout autre point que le même pourcentage de
   * l'image — l'épingle tombait à côté, d'autant plus loin que l'écran était
   * large. C'est aussi pourquoi ça « perdait sa précision en changeant
   * d'écran » : l'erreur est exactement la moitié de la bande vide.
   *
   * On mesure donc les deux rectangles et on pose la marque au bon endroit.
   * Aucune hypothèse sur la mise en page : ça vaut pour le panneau, le plein
   * écran, et tout ce qu'on inventera après.
   */
  const imageRef = useRef(null);
  const boutonRef = useRef(null);
  const [marque, setMarque] = useState(null);

  const placerLaMarque = useCallback(() => {
    const image = imageRef.current;
    const bouton = boutonRef.current;

    if (!image || !bouton || !point) {
      setMarque(null);
      return;
    }

    const bornesImage = image.getBoundingClientRect();
    const bornesBouton = bouton.getBoundingClientRect();

    if (bornesImage.width <= 0 || bornesImage.height <= 0) return;

    setMarque({
      x: bornesImage.left - bornesBouton.left + point.x * bornesImage.width,
      y: bornesImage.top - bornesBouton.top + point.y * bornesImage.height,
    });
  }, [point]);

  // Recalculé à chaque fois que la géométrie peut avoir bougé : nouveau clic,
  // image chargée, fenêtre redimensionnée, passage en plein écran. Un
  // `ResizeObserver` couvre le dernier cas, que l'événement `resize` ignore —
  // la fenêtre ne change pas, seul le cadre change.
  useLayoutEffect(() => {
    placerLaMarque();

    const image = imageRef.current;
    if (!image) return undefined;

    const observateur = new ResizeObserver(placerLaMarque);
    observateur.observe(image);
    window.addEventListener('resize', placerLaMarque);

    return () => {
      observateur.disconnect();
      window.removeEventListener('resize', placerLaMarque);
    };
  }, [placerLaMarque]);

  useLayoutEffect(() => {
    if (!controle) setPointLocal(null);
  }, [contenu, controle]);

  const montrer = (evenement) => {
    // Les bornes de l'IMAGE, pas du bouton : l'image est centrée avec
    // `object-fit: contain`, donc le bouton porte des bandes vides sur les
    // côtés. Mesurer le bouton décalerait chaque clic.
    const image = evenement.currentTarget.querySelector('img');
    if (!image) return;

    const bornes = image.getBoundingClientRect();
    if (bornes.width <= 0 || bornes.height <= 0) return;

    const x = (evenement.clientX - bornes.left) / bornes.width;
    const y = (evenement.clientY - bornes.top) / bornes.height;

    // Un clic sur la bande vide n'est pas un clic sur la planche.
    if (x < 0 || x > 1 || y < 0 || y > 1) return;

    noter({ x, y });
    onMontrer({ x, y, position: situer(x, y), titre: titreFigure(cle), cle });
  };

  useEffect(() => {
    setCredit(null);
    if (!cle) return undefined;

    const abandon = new AbortController();

    fetch(urlCreditPlanche(cle), { signal: abandon.signal })
      .then((r) => (r.ok && r.status !== 204 ? r.json() : null))
      .then((c) => { if (c?.auteur || c?.licence || c?.maison) setCredit(c); })
      .catch(() => {});

    return () => abandon.abort();
  }, [cle]);

  /**
   * LE DESSIN DOIT REMPLIR LE TABLEAU.
   *
   * Le professeur déclare un `viewBox` avant de savoir ce qu'il va dessiner,
   * et il le déclare toujours trop grand. Résultat vu en séance : un appareil
   * respiratoire minuscule flottant au milieu d'un tableau vide, illisible
   * non pas parce que le dessin était faux mais parce qu'il faisait un
   * cinquième de la surface.
   *
   * On ne lui demande donc plus de cadrer juste : on recadre nous-mêmes sur
   * ce qu'il a RÉELLEMENT tracé. `getBBox` donne les bornes du contenu une
   * fois rendu — c'est la seule mesure fiable, aucune analyse du balisage ne
   * saurait où finit une courbe de Bézier.
   *
   * En layout effect et non en effect : la mesure a lieu avant que le
   * navigateur ne peigne, donc l'élève ne voit jamais la version mal cadrée.
   */
  useLayoutEffect(() => {
    setCadre(null);
    if (!svgRef.current) return;

    let bornes;
    try {
      bornes = svgRef.current.getBBox();
    } catch {
      return;
    }

    if (!bornes || bornes.width <= 0 || bornes.height <= 0) return;

    // Une marge proportionnelle : les traits ont une épaisseur, et les
    // étiquettes débordent des bornes calculées pour les formes.
    const marge = Math.max(bornes.width, bornes.height) * 0.06 + 8;

    setCadre(
      `${bornes.x - marge} ${bornes.y - marge} `
      + `${bornes.width + marge * 2} ${bornes.height + marge * 2}`,
    );
  }, [arbre]);

  // UNE PLANCHE S'AFFICHE COMME UNE AFFICHE PUNAISÉE AU TABLEAU.
  //
  // On ne cherche PAS à lui donner l'allure de la craie : ces planches sont
  // en couleurs sur fond blanc, et les forcer en trait blanc sur ardoise les
  // rendrait illisibles. On assume donc l'objet — une feuille imprimée
  // affichée devant la classe — ce qui est d'ailleurs ce qu'un professeur
  // fait vraiment.
  //
  // Le crédit accompagne l'image et n'est pas facultatif : les licences
  // libres l'imposent, et il ne se voit que là.
  if (planche && !plancheKo) {
    return (
      <figure className="ardoise__planche">
        {/*
          MONTRER DU DOIGT.

          Le professeur demande « montre-moi les Alpes » et l'élève ne pouvait
          rien faire : c'est la première chose qu'il a essayée en séance, et le
          cours s'est arrêté sur un « je ne peux pas faire d'interaction ».

          Le clic part en TEXTE — une position, pas une capture d'écran. Une
          image coûterait un appel de vision par clic, mettrait des secondes, et
          laisserait une photo du tableau à effacer derrière. Deux nombres ne
          coûtent rien, arrivent instantanément et ne laissent aucune trace à
          purger.

          C'est un `button` et non une `div` cliquable : au clavier comme au
          doigt, montrer doit marcher.
        */}
        <button
          ref={boutonRef}
          type="button"
          className="ardoise__pointage"
          onClick={onMontrer ? montrer : undefined}
          disabled={!onMontrer}
          aria-label="Montrer un endroit sur le schéma"
        >
          <img
            ref={imageRef}
            src={planche}
            alt="Schéma"
            onLoad={placerLaMarque}
            onError={() => setPlancheKo(true)}
          />

          {/* La marque RESTE. Sans elle, l'élève ne sait pas si son clic a
              été pris, et le professeur commente un point que personne ne
              voit plus.

              POSITIONNÉE EN PIXELS MESURÉS, PAS EN POURCENTAGE DU BOUTON.
              Le clic est mesuré sur l'IMAGE ; tant que le bouton l'épousait,
              un pourcentage de l'un valait pour l'autre. En plein écran le
              bouton occupe tout le cadre et l'image y flotte au centre : les
              deux repères ont divergé, et l'épingle se posait à côté de
              l'endroit cliqué. On mesure donc le rectangle de l'image. */}
          {point && marque && (
            <span
              className="ardoise__point"
              style={{ left: `${marque.x}px`, top: `${marque.y}px` }}
              aria-hidden="true"
            />
          )}
        </button>
        {credit && (
          <figcaption className="ardoise__credit">
            {/*
              Un lien plutôt qu'une adresse en toutes lettres : CC BY demande la
              source, et une URL de Wikimedia fait deux cents caractères qui
              écraseraient la planche. Le lien s'ouvre à côté — on ne sort jamais
              un élève de sa séance en cours.

              Une figure maison n'a rien de tout ça : aucun auteur à nommer,
              aucune licence à respecter. Une mention de propriété suffit, et
              c'est tout ce que l'élève doit lire.
            */}
            {credit.maison ? (
              'Propriété de mimia.fr'
            ) : (
              <>
                {credit.source ? (
                  <a href={credit.source} target="_blank" rel="noreferrer noopener">
                    {credit.auteur || 'Auteur inconnu'}
                  </a>
                ) : (
                  credit.auteur || 'Auteur inconnu'
                )}
                {credit.licence && <> — {credit.licence}</>}
              </>
            )}
          </figcaption>
        )}
      </figure>
    );
  }

  if (!arbre) return null;

  // Le cadre recalculé remplace celui du modèle. Tant qu'il n'est pas mesuré,
  // on garde le sien : mieux vaut un dessin mal cadré qu'un dessin absent.
  const racine = cadre
    ? { ...arbre, attributs: { ...arbre.attributs, viewBox: cadre } }
    : arbre;

  // MONTRER MARCHE AUSSI SUR UN DESSIN.
  //
  // Ne l'autoriser que sur les planches importées aurait créé un piège : la
  // consigne du professeur promet le clic sur « une figure », et les
  // trente-huit schémas de SVT en sont. Il aurait dit « montre-moi le
  // diaphragme » sur son propre dessin, et l'élève serait resté bloqué —
  // exactement la scène qu'on cherche à supprimer.
  //
  // Ici on mesure le conteneur et non l'image : le SVG remplit sa boîte, il
  // n'y a pas de bande vide à écarter.
  const montrerSurLeDessin = (evenement) => {
    const bornes = evenement.currentTarget.getBoundingClientRect();
    if (bornes.width <= 0 || bornes.height <= 0) return;

    const x = (evenement.clientX - bornes.left) / bornes.width;
    const y = (evenement.clientY - bornes.top) / bornes.height;

    noter({ x, y });
    onMontrer({
      x,
      y,
      position: situer(x, y),
      titre: titreFigure(cle),
      cle,

      // SUR UN DESSIN, LE NOM SE CALCULE ICI — ET IL EST EXACT.
      //
      // Les planches importées sont des images : le serveur a dû faire lire
      // leurs étiquettes par un modèle de vision, une fois, et s'en remet à
      // cette carte. Un schéma à la craie n'a pas ce problème : ses légendes
      // sont des balises `text` dans le document, avec leur position réelle.
      // Le navigateur les mesure, il n'a rien à deviner.
      //
      // Le serveur, lui, ne verra jamais ce SVG : la bibliothèque vit dans le
      // front, et l'ardoise ne transporte que la clé. C'est donc ici, et
      // nulle part ailleurs, que ce calcul peut se faire.
      mot: motLePlusProche(evenement.currentTarget, evenement.clientX, evenement.clientY),
    });
  };

  return (
    <div className="ardoise__schema">
      <button
        type="button"
        className="ardoise__pointage ardoise__pointage--dessin"
        onClick={onMontrer ? montrerSurLeDessin : undefined}
        disabled={!onMontrer}
        aria-label="Montrer un endroit sur le schéma"
      >
        {rendre(racine, 'r', svgRef)}

        {point && (
          <span
            className="ardoise__point"
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}

/**
 * Un nœud de l'arbre vers un élément React.
 *
 * `createElement` et non du JSX : le nom de balise est une donnée, et JSX ne
 * sait pas rendre un nom variable sans passer par une indirection qui
 * n'apporterait rien ici.
 */
function rendre(noeud, cle, ref) {
  if (typeof noeud === 'string') return noeud;

  const props = { key: cle, ...enProprietesReact(noeud.attributs) };

  // La référence ne va que sur la racine : c'est elle qu'on mesure.
  if (ref) props.ref = ref;

  const enfants = noeud.enfants.map((enfant, index) => rendre(enfant, `${cle}-${index}`));

  return createElement(noeud.balise, props, enfants.length > 0 ? enfants : undefined);
}

/**
 * React attend `strokeWidth` là où le SVG écrit `stroke-width`.
 *
 * `viewBox` fait exception : il s'écrit déjà en camelCase côté React, et le
 * transformer donnerait `viewBox` → `viewbox`, que React refuse silencieusement
 * — la figure s'afficherait alors à sa taille intrinsèque, minuscule.
 */
function enProprietesReact(attributs) {
  const props = {};

  for (const [nom, valeur] of Object.entries(attributs)) {
    props[nom === 'viewBox' ? 'viewBox' : camel(nom)] = valeur;
  }

  return props;
}

const camel = (nom) => nom.replace(/-([a-z])/g, (_, lettre) => lettre.toUpperCase());
