/**
 * La planche tient TOUJOURS dans le cadre du plein écran.
 *
 * CE QUE CE TEST PROTÈGE
 * ----------------------
 * Le dimensionnement du plein écran se mesurait sur le viewport —
 * `min(96vw, 1400px)` et `92vh`. Depuis que la figure vit dans un cadre de zoom
 * qui a `overflow: hidden`, cette référence est fausse : selon le rapport
 * d'aspect de l'image ET la taille de l'écran, la planche dépassait le cadre et
 * se faisait rogner. L'élève ne voyait plus les bords et ne pouvait plus y
 * cliquer — sur une figure, pas sur la suivante, et jamais sur la même machine.
 *
 * On ne teste donc pas un cas, on teste la RÈGLE : quelle que soit l'image,
 * quel que soit l'écran, la figure rendue tient dans le cadre. Une contrainte
 * exprimée en pourcentage du conteneur satisfait cette règle par construction ;
 * une contrainte exprimée en viewport ne la satisfait que par chance.
 */

const fs = require('fs');
const path = require('path');

// LES COMMENTAIRES SONT RETIRÉS AVANT TOUTE COMPARAISON.
//
// Ce fichier de style s'explique beaucoup, et un commentaire dit souvent ce
// qu'il ne faut PAS écrire — « pas de align-items: center ici ». Un test qui
// lit le texte brut prend cette mise en garde pour la règle elle-même et échoue
// sur du code juste. C'est arrivé à la première version de ce test.
const CSS = fs
  .readFileSync(path.join(__dirname, '../App.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

/** Le bloc de déclarations d'un sélecteur, ou null. */
function regle(selecteur) {
  const i = CSS.indexOf(`\n${selecteur} {`);
  if (i < 0) return null;

  const debut = CSS.indexOf('{', i);
  const fin = CSS.indexOf('}', debut);
  return CSS.slice(debut + 1, fin);
}

describe('la planche en plein écran', () => {
  test('se mesure sur son cadre, jamais sur le viewport', () => {
    for (const selecteur of [
      '.tableau-plein__surface .ardoise__planche',
      '.tableau-plein__surface .ardoise__planche img',
    ]) {
      const bloc = regle(selecteur);
      expect(bloc).not.toBeNull();

      // `vw` et `vh` sont précisément ce qui rendait le résultat dépendant de
      // l'écran plutôt que du cadre.
      expect(bloc).not.toMatch(/\d\s*v[wh]\b/);

      expect(bloc).toMatch(/max-width:\s*100%/);
      expect(bloc).toMatch(/max-height:\s*100%/);
    }
  });

  test('la racine du plein écran donne une hauteur, pas une ligne auto', () => {
    // C'EST ICI QUE TOUT SE JOUE, ET C'EST LE DERNIER ENDROIT OÙ ON REGARDE.
    //
    // `display: grid` sans piste déclarée crée une ligne AUTO, dimensionnée sur
    // son contenu. Les `height: 100 %` de toute la descendance se rapportent
    // alors à une hauteur déduite d'eux-mêmes : circulaire, donc abandonné, et
    // l'image s'affiche à sa taille naturelle. On peut réparer dix maillons en
    // dessous sans que rien ne change.
    //
    // Le `0` du `minmax` compte autant que le `1fr` : le minimum par défaut
    // d'une piste vaut `auto`, c'est-à-dire la taille du contenu — une grande
    // image ferait déborder la piste malgré le `1fr`.
    const racine = regle('.tableau-plein');

    expect(racine).toMatch(/grid-template-rows:\s*minmax\(\s*0\s*,\s*1fr\s*\)/);
    expect(racine).toMatch(/grid-template-columns:\s*minmax\(\s*0\s*,\s*1fr\s*\)/);

    // `place-items: center` retirerait la hauteur ferme qu'on vient d'établir.
    expect(racine).toMatch(/place-items:\s*stretch/);
  });

  test('la chaîne de hauteurs est FERME, pas seulement bornée', () => {
    // `max-height` pose un plafond, il ne donne pas de hauteur. Un enfant qui
    // demande `max-height: 100 %` à un parent qui n'a qu'un plafond ne trouve
    // rien à quoi se rapporter : sa contrainte est ignorée EN SILENCE et
    // l'image reprend sa taille naturelle — 1380 px de haut dans un cadre qui
    // en fait 700. C'est exactement la régression qu'a produite la première
    // version de ce correctif.
    const planche = regle('.tableau-plein__surface .ardoise__planche');
    expect(planche).toMatch(/(^|[;\s])height:\s*100%/);

    // Et le maillon qui manquait : le bouton porteur de l'image.
    const bouton = regle('.tableau-plein__surface .ardoise__pointage');
    expect(bouton).not.toBeNull();
    expect(bouton).toMatch(/flex:\s*1/);
    expect(bouton).toMatch(/min-height:\s*0/);
  });

  test("la chaîne de hauteurs reste définie jusqu'à la figure", () => {
    // Un `max-height: 100 %` ne vaut que si le parent a une hauteur ferme.
    // Centrer les enfants d'un conteneur flex rend leur hauteur dépendante de
    // leur contenu : la contrainte serait alors ignorée en silence, et la
    // planche déborderait à nouveau.
    const contenu = regle('.zoom-schema__contenu');
    expect(contenu).not.toBeNull();
    expect(contenu).toMatch(/height:\s*100%/);
    expect(contenu).toMatch(/align-items:\s*stretch/);
    expect(contenu).not.toMatch(/align-items:\s*center/);

    for (const selecteur of ['.zoom-schema', '.zoom-schema__cadre']) {
      expect(regle(selecteur)).toMatch(/height:\s*100%/);
    }
  });

  test("l'image garde des contraintes qui laissent sa boîte épouser le dessin", () => {
    // LE POINTAGE EN DÉPEND. Le pourcentage cliqué est calculé sur le rectangle
    // de l'`img`. Une largeur ou une hauteur IMPOSÉE créerait des bandes vides
    // autour du dessin — la boîte serait plus grande que l'image, et chaque
    // clic se retrouverait décalé.
    const bloc = regle('.tableau-plein__surface .ardoise__planche img');

    expect(bloc).not.toMatch(/(^|[;\s])width:/);
    expect(bloc).not.toMatch(/(^|[;\s])height:/);
  });
});
