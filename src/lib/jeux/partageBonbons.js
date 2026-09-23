/**
 * LE PARTAGE DES BONBONS — le septième nouveau jeu de maths du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE2_DIV_SENS — « Comprendre le sens de la division et du partage »
 *
 * LE JEU. Des bonbons, des assiettes pour des amis : on partage ÉQUITABLEMENT.
 * Combien chacun en aura-t-il ? L'enfant choisit parmi trois ; une fois
 * trouvé, les bonbons se rangent dans les assiettes, et ce qui reste reste à
 * côté.
 *
 * TROIS MANCHES SUR HUIT ONT UN RESTE : 13 bonbons pour 4 amis, chacun 3, il
 * en reste 1. C'est tout le sens de la division — on ne coupe pas un bonbon.
 *
 * LES PIÈGES DU CE2 :
 *   - SOUSTRAIRE au lieu de partager : 12 bonbons, 3 amis → 9 ;
 *   - OUBLIER LE RESTE, ou donner un bonbon de trop à chacun.
 */

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

/** « 3 chacun », « 3 chacun, il en reste 1 ». */
export const ecrire = ({ q, r }) => (r === 0 ? `${q} chacun` : `${q} chacun, il en reste ${r}`);
const cle = ({ q, r }) => `${q}-${r}`;

export function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const entre = (a, b) => a + Math.floor(tirer() * (b - a + 1));
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const avecReste = melanger([false, false, false, false, false, true, true, true]);

  const liste = [];
  const vus = new Set();
  for (let i = 0; i < MANCHES; i += 1) {
    let amis;
    let q;
    let r;
    do {
      amis = entre(2, 5);
      q = entre(2, 6);
      r = avecReste[i] ? entre(1, amis - 1) : 0;
    } while (vus.has(`${amis}-${amis * q + r}`));
    vus.add(`${amis}-${amis * q + r}`);
    const bonbons = amis * q + r;
    const bonne = { q, r };
    const pieges = [
      { q: bonbons - amis, r: 0 },
      r === 0 ? { q: q + 1, r: 0 } : { q, r: 0 },
    ];
    const uniques = [bonne, ...pieges].filter((c, k, l) => l.findIndex((x) => cle(x) === cle(c)) === k);
    while (uniques.length < 3) uniques.push({ q: q + uniques.length, r: 0 });
    liste.push({
      amis, bonbons, bonne, choix: melanger(uniques).map((c) => ({ ...c, cle: cle(c) })),
    });
  }
  return liste;
}

/** Juste, ou le piège : une soustraction, ou un reste oublié, ou un partage faux. */
export function verdict(m, choixCle) {
  if (choixCle === cle(m.bonne)) return 'juste';
  const [q, r] = choixCle.split('-').map(Number);
  if (q === m.bonbons - m.amis && r === 0) return 'soustraction';
  if (q === m.bonne.q && r !== m.bonne.r) return 'reste';
  return 'partage';
}

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export const PHRASES = {
  consigne: 'Partage les bonbons : chacun doit en avoir autant. Combien chacun en aura-t-il ?',
  soustraction: 'Partager, ce n’est pas enlever : donne un bonbon à chacun, puis recommence.',
  reste: 'Quand on ne peut plus donner un bonbon à chacun, ceux qui restent sont le reste.',
  partage: 'Chacun doit avoir autant que les autres : compte les bonbons de chaque assiette.',
};
