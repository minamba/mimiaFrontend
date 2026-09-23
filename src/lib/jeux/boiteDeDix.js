/**
 * LA BOÎTE DE 10 — le premier jeu de Mimia, pour le CP.
 *
 * Une boîte à dix alvéoles, quelques jetons déjà posés, et l'enfant complète
 * jusqu'à dix. C'est le geste fondateur du CP : la boîte de dix est l'objet
 * qu'il manipule en classe toute l'année, et le complément à dix est ce qui
 * rend possible tout le calcul qui suit.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (celles qui sont déjà en base, mot pour mot) :
 *   - MATH_CP_CALC_COMPLEMENT — « Trouver le complément à 10 »
 *   - MATH_CP_CALC_ADD_10     — « Additionner deux nombres jusqu'à 10 »
 *
 * ================== LA PREMIÈRE VERSION N'ENSEIGNAIT RIEN ==================
 *
 * Camara, le 21/09/2026 : « je comprends pas la boîte de 10, il est impossible
 * de se tromper ». Il avait entièrement raison, et c'est la leçon de ce
 * fichier.
 *
 * L'enfant cliquait sur les cases vides une par une pour y poser un jeton. Or
 * la boîte a exactement dix cases : boucher les trous jusqu'à ce qu'il n'y en
 * ait plus EST la réponse. Aucun comptage, aucun complément — et le garde-fou
 * du débordement que j'avais écrit ne pouvait même jamais se déclencher,
 * puisqu'on ne peut pas poser plus de jetons qu'il n'y a de trous.
 *
 * MES TESTS PASSAIENT TOUS. Ils vérifiaient que la mécanique fonctionne, pas
 * qu'elle enseigne quelque chose. C'est exactement la même erreur que la voix
 * mesurée sur une seule prise : la mesure était juste et la conclusion fausse.
 *
 * CE QUI CHANGE : l'enfant choisit une QUANTITÉ parmi quatre barres de jetons,
 * et s'engage avant de voir le résultat. Il peut se tromper, et l'erreur lui
 * apprend quelque chose — trop, pas assez. Compter les trous reste une
 * stratégie valable, c'est même celle qu'on enseigne au CP ; la différence est
 * qu'il faut maintenant TRANSFORMER ces trous en un nombre.
 *
 * ET LA BOÎTE SE FERME À MI-PARCOURS. À partir de la cinquième manche, les
 * cases vides sont couvertes : on ne peut plus les compter, il faut se
 * souvenir que six et quatre font dix. C'est le passage du comptage au fait
 * mémorisé, et c'est tout l'enjeu de l'année.
 *
 * AUCUN CHRONOMÈTRE, ET C'EST UNE DÉCISION PÉDAGOGIQUE. Mettre la pression à
 * un enfant qui déchiffre le fait abandonner au lieu de chercher.
 */

/** Le nombre d'alvéoles. C'est une boîte de DIX : elle ne se règle pas. */
export const ALVEOLES = 10;

/** Huit manches : deux à quatre minutes, la durée d'attention d'un CP. */
export const MANCHES = 8;

/** À partir d'ici, les cases vides sont couvertes : on ne les compte plus. */
export const PREMIERE_MASQUEE = 4;

/** Quatre barres proposées : de quoi se tromper sans noyer le choix. */
export const PROPOSITIONS = 4;

/**
 * Un tirage reproductible.
 *
 * `Math.random` rendrait le jeu impossible à tester : on ne saurait jamais si
 * une série est juste ou si on a eu de la chance. La graine voyage avec la
 * partie ; en jeu réel, elle vient de l'horloge.
 */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * LES QUATRE BARRES PROPOSÉES.
 *
 * La bonne réponse, et trois voisines. VOISINES ET NON AU HASARD : proposer
 * 4, 1, 8 et 9 pour un complément de 4 se devine sans compter, parce que les
 * trois autres sont grossièrement fausses. Des valeurs proches obligent à
 * quantifier vraiment.
 *
 * Toujours dans 1..9, jamais deux fois la même, et mélangées — sinon la bonne
 * réponse finirait toujours à la même place et l'enfant apprendrait la
 * position, pas le nombre.
 */
export function propositions(manque, tirer) {
  const choix = [manque];

  // On ratisse autour de la réponse, en s'éloignant progressivement, jusqu'à
  // en avoir quatre. Le bord de l'intervalle (1 ou 9) est ainsi géré sans cas
  // particulier : à 9, on descend ; à 1, on monte.
  for (let ecart = 1; choix.length < PROPOSITIONS; ecart += 1) {
    [manque - ecart, manque + ecart].forEach((valeur) => {
      if (choix.length < PROPOSITIONS && valeur >= 1 && valeur <= 9 && !choix.includes(valeur)) {
        choix.push(valeur);
      }
    });
  }

  // Mélange de Fisher-Yates, avec le même tirage que le reste de la partie.
  for (let i = choix.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [choix[i], choix[j]] = [choix[j], choix[i]];
  }

  return choix;
}

/**
 * LA SÉRIE D'UNE PARTIE.
 *
 * `depart` est le nombre de jetons déjà dans la boîte ; l'enfant doit en
 * ajouter `manque` pour arriver à dix.
 *
 * TROIS RÈGLES DE TIRAGE, et les trois comptent :
 *
 * 1. ON COMMENCE FACILE. Les deux premières manches ont un départ de 5 à 9 —
 *    il ne manque qu'un à cinq jetons. Un enfant qui rate sa première manche
 *    referme le jeu ; celui qui la réussit en veut une deuxième.
 *
 * 2. JAMAIS DEUX FOIS LE MÊME DÉPART D'AFFILÉE. Sans cette garde, le tirage
 *    proposait « il manque 3 » trois fois de suite et l'enfant répondait sans
 *    plus compter — il apprenait le geste, pas le complément.
 *
 * 3. LA BOÎTE SE FERME À PARTIR DE LA CINQUIÈME. On voit encore les jetons
 *    posés, mais plus les cases vides : il faut se souvenir, pas compter.
 */
export function serie(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const liste = [];

  for (let i = 0; i < manches; i += 1) {
    const facile = i < 2;
    const min = facile ? 5 : 1;
    const max = 9;

    let depart;
    do {
      depart = min + Math.floor(tirer() * (max - min + 1));
    } while (liste.length > 0 && depart === liste[liste.length - 1].depart);

    const manque = ALVEOLES - depart;

    liste.push({
      depart,
      manque,
      masquee: i >= PREMIERE_MASQUEE,
      choix: propositions(manque, tirer),
    });
  }

  return liste;
}

/** La barre choisie complète-t-elle exactement la boîte ? */
export function gagnee(depart, choisi) {
  return depart + choisi === ALVEOLES;
}

/**
 * Ce que l'erreur apprend : trop, ou pas assez.
 *
 * ON NOMME LE SENS DE L'ERREUR plutôt que de dire « raté ». « Il y en a trop »
 * et « il en manque encore » sont deux informations différentes, et ce sont
 * elles qui permettent de corriger au coup suivant. « Raté » n'apprend rien.
 */
export function verdict(depart, choisi) {
  const total = depart + choisi;

  if (total === ALVEOLES) return 'juste';
  return total > ALVEOLES ? 'trop' : 'pas-assez';
}

/**
 * L'état d'une alvéole, pour l'affichage.
 *
 * LES JETONS DE DÉPART SONT DANS LES PREMIÈRES ALVÉOLES, puis ceux que
 * l'enfant vient de poser : la boîte se remplit de gauche à droite et de haut
 * en bas, comme en classe. Un remplissage en désordre empêcherait de LIRE la
 * quantité d'un coup d'œil, ce qui est tout l'intérêt de l'objet.
 *
 * `masquee` couvre les cases encore vides — et seulement elles : les jetons
 * déjà là restent visibles, sans quoi il n'y aurait plus de question du tout.
 */
export function alveoles(depart, poses, masquee = false) {
  return Array.from({ length: ALVEOLES }, (_, i) => {
    if (i < depart) return 'depart';
    if (i < depart + poses) return 'pose';
    return masquee ? 'masque' : 'vide';
  });
}

/**
 * Le mot de la fin, d'après le nombre de manches trouvées du premier coup.
 *
 * CE QUI SE MESURE, c'est le premier essai : toutes les manches finissent par
 * être gagnées puisqu'on peut réessayer. La différence entre chercher et
 * savoir tient dans ce premier coup.
 */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES.
 *
 * Elles vivent ici et non dans l'écran pour n'exister qu'en un exemplaire :
 * l'écran affiche ce texte, et la professeure le dit mot pour mot, depuis un
 * enregistrement fait à partir de lui. Changer une phrase ici sans relancer
 * `scripts/voix-jeux.mjs` fait tomber un test : l'écrit et l'oral ne
 * peuvent pas se séparer en silence. Voir `voix/repliques.js`.
 */
export const PHRASES = {
  consigne: 'Combien d’œufs manque-t-il pour faire 10 ?',
  consigneMasquee: 'La boîte est fermée. Combien d’œufs manque-t-il ?',
  trop: 'Il y en a trop !',
  manque: 'Il en manque encore.',
};
