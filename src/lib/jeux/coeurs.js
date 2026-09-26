import { rangDeLaClasse } from './frise';

/**
 * LE MODE DÉFI ET SES CŒURS — Camara, le 25/09/2026 : « mettre des vies sous
 * forme de cœurs, en fonction de la classe le nombre varie, à chaque erreur
 * l'enfant perd une vie ».
 *
 * POURQUOI UN MODE, ET NON LA RÈGLE DE TOUS LES JEUX
 * --------------------------------------------------
 * Punir l'erreur dans un outil d'apprentissage retourne l'objectif : l'enfant
 * qui a le plus besoin de l'exercice est celui qui perd ses cœurs le plus
 * vite, donc celui qui y joue le moins. On écarterait précisément ceux qu'on
 * voulait faire travailler.
 *
 * L'enfant choisit donc à l'ouverture. « Tranquille » est le jeu tel qu'il a
 * toujours été — on se trompe, le professeur explique, on continue.
 * « Défi » ajoute les cœurs, pour celui qui maîtrise déjà et veut du piment.
 *
 * Ce choix a un autre mérite : il MESURE l'envie. Si personne ne prend jamais
 * le défi, on saura que la piste ne valait pas la peine — ce qu'aucune
 * imposition générale n'aurait jamais dit.
 *
 * RIEN AU CP, ET C'EST L'INTUITION DE CAMARA
 * -------------------------------------------
 * « Au CP je ne sais pas si c'est utile de mettre ce système. » Non. À six
 * ans, on découvre la lecture et le nombre ; l'erreur y est le matériau du
 * cours, pas un accident. Le mode n'est même pas proposé.
 */

/**
 * Combien de cœurs, selon la classe — ou 0 quand le défi n'est pas proposé.
 *
 * MOINS DE CŒURS EN GRANDISSANT, ce qui revient à durcir le défi. Un enfant
 * de CE1 a besoin de marge pour que le mode reste un jeu ; un élève de
 * troisième qui choisit « Défi » demande justement qu'il soit difficile.
 *
 * LE NOMBRE SE LIT DANS LA FRISE, comme partout ailleurs : le rang donne
 * l'année, et lui seul. Une liste de codes recopiée ici dériverait de la
 * frise à la première classe ajoutée.
 */
export function coeursDeLaClasse(classe) {
  const rang = rangDeLaClasse(classe);
  if (!rang) return 0;

  if (rang <= 1) return 0;        // CP : pas de défi.
  if (rang <= 3) return 5;        // CE1, CE2
  if (rang <= 5) return 4;        // CM1, CM2
  return 3;                       // collège et lycée
}

/** Le défi est-il proposé à cette classe ? */
export function defiPossible(classe) {
  return coeursDeLaClasse(classe) > 0;
}

/**
 * Les cœurs qu'il reste, déduits de la partie en cours.
 *
 * AUCUN ÉTAT, ET C'EST TOUT L'INTÉRÊT. Les cœurs ne sont pas une mécanique
 * de plus à tenir dans chaque jeu : ils se CALCULENT à partir de deux nombres
 * que les vingt-trois écrans possèdent déjà — la manche où l'on est, et le
 * nombre de manches réussies du premier coup. Une manche passée sans être
 * réussie du premier coup est une erreur, donc un cœur.
 *
 * Conséquence pratique : ajouter les cœurs n'a demandé de toucher la logique
 * d'AUCUN jeu. Et un jeu écrit demain en hérite sans rien déclarer.
 */
export function coeursRestants(manche, duPremierCoup, max) {
  const perdus = Math.max(0, (manche ?? 0) - (duPremierCoup ?? 0));
  return Math.max(0, (max ?? 0) - perdus);
}

/**
 * DEUX BONNES RÉPONSES D'AFFILÉE RENDENT UN CŒUR — Camara, le 26/09/2026.
 * Du premier coup, sans dépasser le nombre de départ ; une erreur remet la
 * série à zéro. « D'affilée » plutôt qu'« au total » : sinon on regagne
 * presque tout en jouant n'importe comment, et le défi n'en est plus un.
 *
 * La série ne compte que quand il manque un cœur : des réussites faites avec
 * tous ses cœurs ne se mettent pas en réserve pour plus tard.
 */
export const REUSSITES_POUR_UN_COEUR = 2;

export const COEURS_DEPART = Object.freeze({
  manche: 0, duPremierCoup: 0, reussieIci: false, perdus: 0, serie: 0,
});

/**
 * L'état des cœurs après un nouveau relevé (manche, duPremierCoup).
 *
 * POURQUOI SUIVRE LES CHANGEMENTS, ET NON RECALCULER : « manche −
 * réussites » dit combien de manches ont été ratées, pas DANS QUEL ORDRE — et
 * la série d'affilée dépend de l'ordre. Les deux nombres restent la seule
 * chose que les jeux fournissent ; c'est leur évolution qu'on lit.
 *
 * LE PIÈGE DU 26/09 : tous les jeux comptent la réussite DÈS la réponse, mais
 * n'avancent la manche qu'au « Continuer ». Une réussite appartient donc à la
 * manche en cours (`reussieIci`), et une manche quittée sans réussite est une
 * erreur — c'est au passage de manche qu'elle se constate.
 *
 * Une manche qui RECULE est une nouvelle partie : tout repart.
 */
export function suivreCoeurs(etat, manche, duPremierCoup, max) {
  const m = manche ?? 0;
  const d = duPremierCoup ?? 0;
  const e = m < etat.manche || d < etat.duPremierCoup ? { ...COEURS_DEPART } : { ...etat };

  // UN SAUT, ET NON UN PAS — l'écran apparaît en pleine partie. L'ordre des
  // réponses est perdu : on retombe sur le compte simple, sans série.
  if (m - e.manche > 1 || d - e.duPremierCoup > 1) {
    return {
      manche: m,
      duPremierCoup: d,
      reussieIci: false,
      perdus: (max ?? 0) - coeursRestants(m, d, max),
      serie: 0,
    };
  }

  // Les réussites d'abord : elles appartiennent à la manche qu'on quitte.
  for (let i = e.duPremierCoup; i < d; i += 1) {
    e.reussieIci = true;
    if (e.perdus > 0) {
      e.serie += 1;
      if (e.serie >= REUSSITES_POUR_UN_COEUR) {
        e.perdus -= 1;
        e.serie = 0;
      }
    }
  }
  e.duPremierCoup = d;

  // Puis les manches quittées : sans réussite, c'est un cœur.
  for (let i = e.manche; i < m; i += 1) {
    if (!e.reussieIci) {
      e.perdus = Math.min(max ?? 0, e.perdus + 1);
      e.serie = 0;
    }
    e.reussieIci = false;
  }
  e.manche = m;

  return e;
}

export const TRANQUILLE = 'tranquille';
export const DEFI = 'defi';
