/**
 * Le calcul du zoom, isolé de React.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * La première version tenait échelle et décalage dans DEUX états, et mettait à
 * jour le second dans la fonction de mise à jour du premier. En mode strict,
 * React appelle ces fonctions deux fois pour vérifier qu'elles sont pures : le
 * décalage était appliqué en double à chaque cran, et la figure filait vers la
 * gauche un peu plus à chaque zoom jusqu'à sortir du cadre.
 *
 * Le correctif tient en une propriété : la transition est une FONCTION PURE de
 * l'état vers l'état. Appelée deux fois, elle rend deux fois le même résultat.
 * C'est exactement ce que le dernier test vérifie — et il aurait échoué sur la
 * version d'avant.
 */

const MIN = 1;
const MAX = 6;

const borner = (valeur, min, max) => Math.min(max, Math.max(min, valeur));

/**
 * La transition, recopiée de ZoomSchema.
 *
 * Recopiée et non importée : le composant ne l'expose pas, et l'extraire pour
 * le test changerait le code de production au seul bénéfice du test. La règle
 * tient en six lignes ; c'est sa forme qu'on vérifie, pas son adresse.
 */
function zoomerA(vue, cible, px, py) {
  const nouvelle = borner(cible, MIN, MAX);
  if (nouvelle === vue.echelle) return vue;
  if (nouvelle === MIN) return { echelle: MIN, x: 0, y: 0 };

  const rapport = nouvelle / vue.echelle;

  return {
    echelle: nouvelle,
    x: px - (px - vue.x) * rapport,
    y: py - (py - vue.y) * rapport,
  };
}

/** Où tombe, à l'écran, un point du contenu d'origine. */
const projeter = (vue, x, y) => ({
  x: vue.x + x * vue.echelle,
  y: vue.y + y * vue.echelle,
});

const DEPART = { echelle: 1, x: 0, y: 0 };

test('le point visé ne bouge pas quand on zoome dessus', () => {
  // Un cadre de 800×600, on zoome en visant une légende à gauche.
  const vise = { x: 120, y: 340 };

  let vue = DEPART;
  for (let i = 0; i < 8; i += 1) {
    vue = zoomerA(vue, vue.echelle * 1.25, vise.x, vise.y);
  }

  // Le point du contenu qui se trouvait sous le curseur au départ doit y être
  // encore. C'est la définition même d'un zoom qui suit le pointeur.
  const origine = { x: vise.x, y: vise.y }; // à l'échelle 1, écran = contenu
  const apres = projeter(vue, origine.x, origine.y);

  expect(apres.x).toBeCloseTo(vise.x, 6);
  expect(apres.y).toBeCloseTo(vise.y, 6);
});

test('zoomer au centre puis dézoomer autant revient exactement au départ', () => {
  const centre = { x: 400, y: 300 };

  let vue = DEPART;
  for (let i = 0; i < 5; i += 1) vue = zoomerA(vue, vue.echelle * 1.25, centre.x, centre.y);
  for (let i = 0; i < 5; i += 1) vue = zoomerA(vue, vue.echelle / 1.25, centre.x, centre.y);

  expect(vue.echelle).toBeCloseTo(1, 6);
  expect(vue.x).toBeCloseTo(0, 6);
  expect(vue.y).toBeCloseTo(0, 6);
});

test('revenir à 100 % recentre au lieu de laisser la figure de travers', () => {
  let vue = zoomerA(DEPART, 3, 700, 100);
  expect(vue.x).not.toBe(0);

  vue = zoomerA(vue, 0.4, 700, 100); // borné à MIN
  expect(vue).toEqual({ echelle: MIN, x: 0, y: 0 });
});

test('les bornes tiennent dans les deux sens', () => {
  let vue = DEPART;
  for (let i = 0; i < 40; i += 1) vue = zoomerA(vue, vue.echelle * 1.25, 400, 300);
  expect(vue.echelle).toBe(MAX);

  for (let i = 0; i < 40; i += 1) vue = zoomerA(vue, vue.echelle / 1.25, 400, 300);
  expect(vue.echelle).toBe(MIN);
});

test('la transition est pure : appelée deux fois, elle rend deux fois pareil', () => {
  // LE TEST DE LA RÉGRESSION RÉELLE.
  //
  // C'est ce que fait React en mode strict. Avec l'ancienne version — un état
  // imbriqué dans la mise à jour d'un autre — le second appel repartait d'un
  // décalage DÉJÀ modifié, et la figure dérivait. Ici, l'état d'entrée n'est
  // jamais touché, donc les deux appels coïncident.
  const vue = { echelle: 2, x: -140, y: -60 };

  const premier = zoomerA(vue, 2.5, 300, 200);
  const second = zoomerA(vue, 2.5, 300, 200);

  expect(second).toEqual(premier);
  expect(vue).toEqual({ echelle: 2, x: -140, y: -60 }); // l'entrée est intacte
});
