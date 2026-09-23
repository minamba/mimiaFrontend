/**
 * LA MARCHANDE — le deuxième jeu de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026, décor de marché à l'appui. L'enfant achète
 * un ou deux produits et paie la somme exacte, en posant des pièces sur le
 * comptoir.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (celles qui sont déjà en base, mot pour mot) :
 *   - MATH_CP_MES_MONNAIE      — « Reconnaître les pièces et les billets et
 *                                 payer une somme »
 *   - MATH_CP_PROB_UNE_ETAPE   — « Résoudre un problème en une seule étape »
 *
 * LES PRIX VIENNENT DU DÉCOR, ET C'EST UNE DÉCISION. Les ardoises du stand
 * annoncent pommes 2 €, bananes 1 €, tomates 3 €, carottes 1 € — peintes dans
 * l'image. Tirer des prix au hasard aurait donné un jeu qui contredit son
 * propre décor : l'enfant lit « 2 € » sur l'ardoise et on lui en demande 5.
 * Ce sont donc ces quatre prix-là qui font foi, et la variété vient de CE
 * QU'ON ACHÈTE, pas de combien ça coûte.
 *
 * AUCUN CENTIME, ET C'EST LE PROGRAMME QUI LE DIT : lire un prix à virgule est
 * une compétence de CE2. Au CP, on paie en euros entiers.
 *
 * ON PAIE EXACT, ON NE REND PAS LA MONNAIE : rendre la monnaie est au
 * programme du CE1. Ce jeu s'arrêtera donc là où le CE1 commencera — c'est la
 * même marchande qui reprendra, avec sa caisse.
 */

/** Ce que vend le stand, tel que ses ardoises l'annoncent. */
export const PRODUITS = [
  { cle: 'banane', nom: 'banane', pluriel: 'bananes', prix: 1 },
  { cle: 'carotte', nom: 'carotte', pluriel: 'carottes', prix: 1 },
  { cle: 'pomme', nom: 'pomme', pluriel: 'pommes', prix: 2 },
  { cle: 'tomate', nom: 'tomate', pluriel: 'tomates', prix: 3 },
];

/**
 * LA BOURSE : deux pièces et un billet.
 *
 * Le programme dit « reconnaître les pièces ET LES BILLETS » : le billet de
 * 5 € a donc sa place, et c'est lui qui rend le jeu intéressant — payer 5 €
 * en une fois ou en cinq pièces de 1 € sont deux réponses justes, et l'enfant
 * découvre qu'il y a plusieurs chemins.
 *
 * PAS DE PIÈCE DE 10 € (elle n'existe pas) NI DE BILLET DE 10 € : au-delà de
 * 9 €, on sortirait des nombres que le CP manipule à l'aise.
 */
export const MONNAIE = [
  { valeur: 1, genre: 'piece' },
  { valeur: 2, genre: 'piece' },
  { valeur: 5, genre: 'billet' },
];

/** Huit manches, comme la boîte de 10 : la durée d'attention d'un CP. */
export const MANCHES = 8;

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * LA COMMANDE D'UNE MANCHE.
 *
 * TROIS RÈGLES DE TIRAGE :
 *
 * 1. ON COMMENCE PAR UN SEUL PRODUIT. Les deux premières manches n'en
 *    demandent qu'un, à 1 ou 2 € : une pièce suffit, et l'enfant comprend le
 *    geste avant qu'on lui demande de compter.
 *
 * 2. ENSUITE DEUX PRODUITS DIFFÉRENTS, jamais deux fois le même. « Une pomme
 *    et une pomme » se dit « deux pommes » et deviendrait une multiplication —
 *    ce n'est pas ce qu'on travaille ici.
 *
 * 3. JAMAIS DEUX FOIS LE MÊME TOTAL D'AFFILÉE, pour la même raison que dans la
 *    boîte de 10 : sans cette garde, l'enfant repose les mêmes pièces sans
 *    plus compter.
 */
export function serie(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const liste = [];

  for (let i = 0; i < manches; i += 1) {
    const seul = i < 2;
    let achats;
    let total;

    do {
      const premier = PRODUITS[Math.floor(tirer() * PRODUITS.length)];

      if (seul) {
        achats = [premier];
      } else {
        const autres = PRODUITS.filter((p) => p.cle !== premier.cle);
        achats = [premier, autres[Math.floor(tirer() * autres.length)]];
      }

      total = achats.reduce((somme, p) => somme + p.prix, 0);
    } while (liste.length > 0 && total === liste[liste.length - 1].total);

    liste.push({ achats, total });
  }

  return liste;
}

/** La somme posée sur le comptoir. */
export function somme(posees) {
  return posees.reduce((total, valeur) => total + valeur, 0);
}

/**
 * Où en est le paiement.
 *
 * ON NOMME LE SENS DE L'ÉCART, jamais « raté » : « il manque » et « c'est
 * trop » sont deux informations différentes, et ce sont elles qui permettent
 * de corriger. C'est la leçon de la boîte de 10.
 */
export function verdict(posees, total) {
  const paye = somme(posees);

  if (paye === total) return 'juste';
  return paye > total ? 'trop' : 'pas-assez';
}

/**
 * La commande, en toutes lettres : « une pomme et une banane ».
 *
 * ÉCRITE POUR ÊTRE DITE. Un CP ne lit pas encore cette phrase, mais elle part
 * telle quelle aux lecteurs d'écran, et elle servira de consigne parlée quand
 * la voix sera branchée. D'où les articles en toutes lettres plutôt qu'un
 * « 1 pomme + 1 banane » qui ne se prononce pas.
 */
export function commande(achats) {
  const morceaux = achats.map((p) => `une ${p.nom}`);

  return morceaux.length === 1
    ? morceaux[0]
    : `${morceaux.slice(0, -1).join(', ')} et ${morceaux[morceaux.length - 1]}`;
}

/**
 * Le mot de la fin, d'après le nombre de manches payées du premier coup.
 *
 * CE QUI SE MESURE, c'est le premier essai : toutes les manches finissent par
 * être payées puisqu'on peut reprendre une pièce. La différence entre chercher
 * et savoir tient dans ce premier coup.
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
export function consigne(achats) {
  return `Je voudrais ${commande(achats)}, s’il te plaît.`;
}

export const PHRASES = {
  trop: 'C’est trop ! Reprends une pièce.',
};

// ------------------------------------------------------------ le CE1

/**
 * AU CE1, L'ENFANT TIENT LA CAISSE — Camara, le 21/09/2026 : les jeux de CP qui
 * s'y prêtent gagnent un niveau CE1. C'est la « même marchande qui reprend,
 * avec sa caisse », annoncée plus haut. Compétence :
 *   MATH_CE1_MES_MONNAIE — « Rendre la monnaie et calculer un prix »
 *
 * LES DEUX MOITIÉS DE LA COMPÉTENCE, DANS CET ORDRE :
 *   1. CALCULER LE PRIX : le client achète « deux pommes et une tomate ». Les
 *      prix restent ceux des ardoises du décor ; ce qui change, c'est qu'on
 *      achète plusieurs fois le même produit.
 *   2. RENDRE LA MONNAIE : le client tend un billet de 5, 10 ou 20 €, le plus
 *      petit qui dépasse le prix. L'enfant rend la différence avec ses pièces.
 *
 * L'ENFANT ANNONCE QU'IL A RENDU, contrairement au CP : rendre 1 € puis 1 €
 * puis 1 € jusqu'à ce que le jeu s'allume, c'est gagner sans calculer — la
 * leçon des paquets de dix.
 *
 * TOUJOURS DES EUROS ENTIERS : les centimes sont au programme du CE2.
 */

/** Les billets que tend le client, du plus petit au plus grand. */
export const BILLETS_CLIENT = [5, 10, 20];
export const ESSAIS_AVANT_AIDE = 3;

const EN_LETTRES = { 1: 'une', 2: 'deux', 3: 'trois' };

/** Le prix d'une commande : chaque ligne, son prix fois sa quantité. */
export function prix(lignes) {
  return lignes.reduce((total, l) => total + l.produit.prix * l.quantite, 0);
}

/** Le billet du client : le plus petit qui dépasse le prix — il y a toujours à rendre. */
export function billetPour(total) {
  return BILLETS_CLIENT.find((b) => b > total);
}

/**
 * LA SÉRIE DU CE1 : deux manches d'échauffement sur un seul produit acheté
 * deux ou trois fois, puis six commandes de deux produits différents, dont
 * au moins un pris deux fois. Jamais deux fois le même prix d'affilée.
 */
export function serieCE1(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const au = (liste) => liste[Math.floor(tirer() * liste.length)];
  const liste = [];

  for (let i = 0; i < manches; i += 1) {
    let lignes;
    let total;
    do {
      const premier = au(PRODUITS);
      if (i < 2) {
        lignes = [{ produit: premier, quantite: au([2, 3]) }];
      } else {
        const second = au(PRODUITS.filter((p) => p.cle !== premier.cle));
        const [q1, q2] = au([[1, 2], [2, 1], [2, 2]]);
        lignes = [{ produit: premier, quantite: q1 }, { produit: second, quantite: q2 }];
      }
      total = prix(lignes);
    } while (liste.length > 0 && total === liste[liste.length - 1].total);

    const billet = billetPour(total);
    liste.push({
      lignes, total, billet, rendu: billet - total,
    });
  }

  return liste;
}

/** « deux pommes et une tomate » — écrit pour être dit. */
export function commandeCE1(lignes) {
  const morceaux = lignes.map((l) => `${EN_LETTRES[l.quantite]} ${l.quantite > 1 ? l.produit.pluriel : l.produit.nom}`);
  return morceaux.length === 1 ? morceaux[0] : `${morceaux[0]} et ${morceaux[1]}`;
}

export function consigneCE1(lignes) {
  return `Je voudrais ${commandeCE1(lignes)}. Voici un billet de ${billetPour(prix(lignes))} euros.`;
}

export const PHRASES_CE1 = {
  rendre: 'Rends-moi la monnaie, s’il te plaît.',
  trop: 'Tu me rends trop. Compte encore.',
  pasAssez: 'Il me manque de la monnaie. Compte encore.',
  aide: 'Regarde : on calcule le prix, puis on compte jusqu’au billet.',
};

// ------------------------------------------------------------ le CE2

/**
 * AU CE2, LES PRIX À VIRGULE — Camara, le 21/09/2026. Compétence :
 *   MATH_CE2_MES_MONNAIE — « Lire un prix à virgule : euros et centimes »
 *
 * LE JEU. Un produit porte une étiquette — « 3,45 € » — et l'enfant paie
 * exactement, avec des euros et des centimes, puis annonce.
 *
 * NORA NE DIT PAS LE PRIX : dit à voix haute, « trois euros quarante-cinq » ne
 * demanderait plus de lire la virgule. Elle donne la consigne ; l'étiquette
 * fait le reste.
 *
 * L'ERREUR REGARDE D'ABORD AVANT LA VIRGULE : si les euros sont faux, on le
 * dit ; s'ils sont justes, c'est aux centimes qu'il faut regarder. C'est la
 * lecture même du prix qu'on corrige, pas seulement le total.
 *
 * LES ÉTIQUETTES FONT FOI, pas les ardoises du décor : au CE2, les prix ont
 * des centimes, et c'est l'étiquette posée sur le produit que l'enfant lit.
 */

/** La monnaie du CE2, en centimes : deux pièces d'euro et quatre de centimes. */
export const MONNAIE_CE2 = [200, 100, 50, 20, 10, 5];

/** « 2 € » ou « 50 c » : ce qui est écrit sur la pièce. */
export const ecrirePiece = (c) => (c >= 100 ? `${c / 100} €` : `${c} c`);

/** « 3,45 € » : un prix écrit comme sur une étiquette. */
export function ecrirePrix(c) {
  const e = Math.floor(c / 100);
  const reste = c % 100;
  return `${e},${String(reste).padStart(2, '0')} €`;
}

/** « 3 euros et 45 centimes » : le prix dit en toutes lettres des unités. */
export function prixEnMots(c) {
  const e = Math.floor(c / 100);
  const reste = c % 100;
  const euros = `${e} euro${e > 1 ? 's' : ''}`;
  return reste === 0 ? euros : `${euros} et ${reste} centimes`;
}

/**
 * LA SÉRIE DU CE2 : huit prix différents, de 1,05 € à 4,95 €, multiples de
 * 5 centimes. Les trois premiers n'ont que des dizaines de centimes (2,50 €,
 * 1,30 €) : on apprend la virgule avant de compter les pièces de 5.
 */
export function serieCE2(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const liste = [];
  const vus = new Set();
  for (let i = 0; i < manches; i += 1) {
    let prix;
    do {
      const euros = 1 + Math.floor(tirer() * 4);
      const centimes = i < 3 ? 10 * (1 + Math.floor(tirer() * 9)) : 5 * (1 + Math.floor(tirer() * 19));
      prix = euros * 100 + centimes;
    } while (vus.has(prix));
    vus.add(prix);
    liste.push({ produit: PRODUITS[Math.floor(tirer() * PRODUITS.length)], prix });
  }
  return liste;
}

/** Ce que vaut un paiement annoncé : juste, ou ce qu'il faut relire. */
export function verdictCE2(posees, prix) {
  const paye = somme(posees);
  if (paye === prix) return 'juste';
  if (Math.floor(paye / 100) !== Math.floor(prix / 100)) return 'euros';
  return 'centimes';
}

export const PHRASES_CE2 = {
  consigne: 'Lis le prix sur l’étiquette, et paie exactement.',
  euros: 'Regarde les euros : ce sont les nombres avant la virgule.',
  centimes: 'Les euros sont justes. Regarde les centimes, après la virgule.',
  aide: 'Regarde : avant la virgule, les euros ; après la virgule, les centimes.',
};
