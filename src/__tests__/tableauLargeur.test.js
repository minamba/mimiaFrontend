/**
 * LE TABLEAU S'ÉLARGIT PLUTÔT QUE DE FAIRE DÉFILER.
 *
 * CE QUE CE TEST PROTÈGE
 * ----------------------
 * La colonne du tableau valait 380 px, fixes. Ce que le professeur écrit, lui,
 * n'a pas de largeur fixe : une division posée, un nombre annoté, une ligne de
 * calcul un peu longue sortent du cadre. L'élève héritait alors d'une barre de
 * défilement horizontale au milieu d'une ardoise — et personne ne fait glisser
 * un tableau noir pour lire la fin d'un calcul. On croit que la ligne s'arrête
 * là, et on travaille sur un énoncé tronqué.
 *
 * Trois propriétés doivent tenir ENSEMBLE, et c'est pour ça qu'elles sont
 * testées ensemble : sans le plancher le tableau se ratatine sur « 3/4 = ? » ;
 * sans le plafond une seule ligne longue écrase la conversation ; sans la
 * remise à zéro sur mobile, le plancher de 380 px déborde un téléphone de 360.
 *
 * Chacune paraît anodine isolément. C'est leur combinaison qui est la règle.
 */

const fs = require('fs');
const path = require('path');

// Commentaires retirés : ce fichier de style s'explique beaucoup, et il nomme
// souvent ce qu'il ne faut PAS écrire. Un test qui lit le texte brut prendrait
// la mise en garde pour la règle.
const CSS = fs
  .readFileSync(path.join(__dirname, '../App.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

/** Le bloc de déclarations d'un sélecteur, ou null. */
function regle(selecteur, depuis = 0) {
  const i = CSS.indexOf(`\n${selecteur} {`, depuis);
  if (i < 0) return null;

  const debut = CSS.indexOf('{', i);
  const fin = CSS.indexOf('}', debut);
  return CSS.slice(debut + 1, fin);
}

describe('la largeur du tableau', () => {
  test('la colonne suit son contenu au lieu d’être figée', () => {
    const espace = regle('.chat-espace');

    expect(espace).not.toBeNull();
    expect(espace).toMatch(
      /grid-template-columns:\s*minmax\(\s*\d+px\s*,\s*1fr\s*\)\s*fit-content\(\s*\d+px\s*\)/,
    );

    // Une largeur fixe pour la seconde piste est exactement ce qu'on retire :
    // elle rendrait les deux autres règles inopérantes sans les contredire.
    expect(espace).not.toMatch(/grid-template-columns:[^;]*1fr\)\s*\d+px/);
  });

  test('la conversation garde de quoi se lire quand le tableau s’élargit', () => {
    // Sans plancher sur la PREMIÈRE piste, le tableau prenait son plafond quelle
    // que soit la place restante : sur une fenêtre étroite il ne restait du fil
    // du cours qu'une bande de quelques dizaines de pixels.
    const plancher = regle('.chat-espace').match(
      /grid-template-columns:\s*minmax\(\s*(\d+)px/,
    );

    expect(plancher).not.toBeNull();
    expect(Number(plancher[1])).toBeGreaterThanOrEqual(300);
  });

  test('elle ne descend jamais sous la largeur confortable d’avant', () => {
    // `fit-content` mesure le contenu ; la borne basse vient de la largeur
    // minimale de l'élément de grille. Sans elle, un tableau presque vide se
    // réduirait à la largeur de ses quelques caractères.
    expect(regle('.ardoise')).toMatch(/min-width:\s*380px/);
  });

  test('elle ne monte pas au point d’écraser la conversation', () => {
    const plafond = regle('.chat-espace').match(/fit-content\(\s*(\d+)px\s*\)/);

    expect(plafond).not.toBeNull();
    expect(Number(plafond[1])).toBeGreaterThanOrEqual(480);
    expect(Number(plafond[1])).toBeLessThanOrEqual(760);
  });

  test('ce qui est écrit revient à la ligne au lieu d’être coupé', () => {
    const contenu = regle('.ardoise__contenu');

    // UNE SEULE DÉCLARATION. C'est le vrai défaut d'origine : `pre-wrap` était
    // bien là, puis `white-space: pre` réapparaissait quinze lignes plus bas
    // dans la même règle et l'annulait. Les deux se lisaient comme justes en
    // relisant le fichier — seule la dernière comptait.
    const declarations = contenu.match(/white-space\s*:/g) ?? [];
    expect(declarations).toHaveLength(1);

    expect(contenu).toMatch(/white-space:\s*pre-wrap/);
  });

  test('le plancher est levé quand il n’y a plus qu’une colonne', () => {
    // Sous 1040 px la grille passe à une colonne et l'ardoise devient collante.
    // Garder 380 px de largeur minimale ferait déborder la PAGE sur un
    // téléphone étroit : la barre horizontale passerait du tableau au document.
    const bascule = CSS.indexOf('@media (max-width: 1040px)');
    expect(bascule).toBeGreaterThan(0);

    expect(regle('  .ardoise', bascule)).toMatch(/min-width:\s*0/);
  });
});
