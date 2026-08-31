import { analyserSchema, estUnSchema } from '../lib/storage/schemaSvg';

/**
 * L'assainisseur est une frontière de sécurité : il décide ce qui, d'une
 * sortie de modèle, a le droit d'entrer dans le document. C'est le seul
 * fichier du projet qui mérite un test à lui seul — une régression ici ne se
 * verrait pas à l'écran, elle se verrait dans un incident.
 */
const balises = (noeud) => {
  if (typeof noeud === 'string') return [];
  return [noeud.balise, ...noeud.enfants.flatMap(balises)];
};

describe('assainisseur de schéma', () => {
  it('reconnaît un dessin et laisse passer la géométrie', () => {
    const arbre = analyserSchema(
      '<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80"/>'
      + '<text x="100" y="40" text-anchor="middle">croûte</text></svg>',
    );

    expect(balises(arbre)).toEqual(['svg', 'circle', 'text']);
    expect(arbre.attributs.viewBox).toBe('0 0 200 200');
  });

  it("n'est pas déclenché par du texte ordinaire", () => {
    expect(estUnSchema('3/4 + 1/8')).toBe(false);
    expect(analyserSchema('3/4 + 1/8')).toBeNull();
  });

  it('retire le balisage exécutable en gardant le dessin', () => {
    const arbre = analyserSchema(
      '<svg viewBox="0 0 100 100"><script>alert(1)</script>'
      + '<circle cx="50" cy="50" r="20" onclick="alert(1)"/></svg>',
    );

    expect(balises(arbre)).toEqual(['svg', 'circle']);
    expect(arbre.enfants[0].attributs.onclick).toBeUndefined();
  });

  it('écarte un lien, quel que soit son protocole', () => {
    const arbre = analyserSchema(
      '<svg viewBox="0 0 100 100"><a href="javascript:alert(1)">'
      + '<circle cx="1" cy="1" r="1"/></a></svg>',
    );

    expect(balises(arbre)).toEqual(['svg']);
  });

  it('impose la craie : aucune couleur choisie ne survit', () => {
    const arbre = analyserSchema(
      '<svg viewBox="0 0 100 100"><rect x="0" y="0" width="10" height="10" '
      + 'fill="red" stroke="#000" style="fill:red" class="x"/></svg>',
    );

    const rect = arbre.enfants[0].attributs;
    expect(rect.fill).toBeUndefined();
    expect(rect.stroke).toBeUndefined();
    expect(rect.style).toBeUndefined();
    expect(rect.class).toBeUndefined();
  });

  it('accepte les deux seules valeurs de remplissage utiles', () => {
    const arbre = analyserSchema(
      '<svg viewBox="0 0 100 100"><rect x="0" y="0" width="10" height="10" '
      + 'fill="none" stroke="currentColor"/></svg>',
    );

    expect(arbre.enfants[0].attributs.fill).toBe('none');
    expect(arbre.enfants[0].attributs.stroke).toBe('currentColor');
  });

  it('impose un cadre quand celui du modèle manque ou est absurde', () => {
    expect(analyserSchema('<svg><circle cx="5" cy="5" r="2"/></svg>').attributs.viewBox)
      .toBe('0 0 400 300');

    expect(analyserSchema('<svg viewBox="0 0 -5 abc"><circle cx="5" cy="5" r="2"/></svg>')
      .attributs.viewBox).toBe('0 0 400 300');
  });

  it('rejette ce qui ne se lit pas', () => {
    expect(analyserSchema('<svg viewBox="0 0 10 10"><circle')).toBeNull();
    expect(analyserSchema('')).toBeNull();
  });
});

/**
 * La bibliothèque : chaque figure doit survivre à l'assainisseur qu'elle
 * traverse comme n'importe quel dessin. Un schéma écrit à la main mais
 * contenant une balise hors liste blanche s'afficherait amputé sans que
 * personne s'en aperçoive avant qu'un élève le voie.
 */
describe('bibliothèque de SVT', () => {
  const { catalogueDessine: catalogue, cleSchema, PREFIXE } = require('../lib/storage/schemas');

  it.each(catalogue())('$cle ($niveau) traverse l’assainisseur intact', ({ cle, titre }) => {
    const arbre = analyserSchema(`${PREFIXE}${cle}`);

    expect(arbre).not.toBeNull();
    expect(arbre.balise).toBe('svg');
    expect(arbre.enfants.length).toBeGreaterThan(2);
    expect(titre.length).toBeGreaterThan(3);
  });

  it('écrit toutes ses légendes en toutes lettres, jamais en chiffres', () => {
    const motsDe = (n) =>
      typeof n === 'string' ? [n] : n.enfants.flatMap(motsDe);

    for (const { cle } of catalogue()) {
      const textes = motsDe(analyserSchema(`${PREFIXE}${cle}`));

      for (const t of textes) {
        expect(t.trim()).not.toMatch(/^\d+$/);
      }
    }
  });

  it('ignore une clé inconnue', () => {
    expect(cleSchema(`${PREFIXE}svt-inexistant`)).toBeNull();
    expect(analyserSchema(`${PREFIXE}svt-inexistant`)).toBeNull();
  });
});

/**
 * LE CATALOGUE DU PROMPT DOIT SUIVRE LA BIBLIOTHÈQUE.
 *
 * Le professeur ne connaît que les clés listées dans sa consigne. Quand
 * vingt-quatre figures ont été ajoutées ici sans que le tableau du prompt soit
 * repris, il a continué à dessiner l'ADN lui-même — très mal — alors qu'une
 * figure juste l'attendait. Rien ne l'avertissait, et rien ne nous avertissait
 * non plus : les tests étaient au vert.
 *
 * Ce test lit le prompt C# depuis le dépôt voisin. S'il n'est pas là — clone
 * partiel, intégration continue du seul front — il ne fait rien plutôt que
 * d'échouer à tort.
 */
describe('catalogue du prompt', () => {
  const fs = require('fs');
  const { catalogue, catalogueDessine } = require('../lib/storage/schemas');

  const PROMPT =
    'C:/Users/daryu/source/repos/SchoolWebApp/SchoolWebApp/Services/Prompts/PromptsPedagogiques.cs';

  it('liste toutes les figures dessinées', () => {
    if (!fs.existsSync(PROMPT)) return;

    const texte = fs.readFileSync(PROMPT, 'utf8');
    const absentes = catalogueDessine()
      .map((s) => s.cle)
      .filter((cle) => !texte.includes(`SCHEMA:${cle}\``));

    expect(absentes).toEqual([]);
  });

  /**
   * LE REVERS, ET IL EST PLUS DANGEREUX QUE L'OUBLI.
   *
   * Un emplacement sans dessin n'affiche RIEN tant que sa planche n'a pas été
   * importée. L'écrire en dur dans la consigne ferait donc écrire au
   * professeur une clé qui laisse un tableau vide devant l'élève — et il n'a
   * aucun moyen de s'en rendre compte, puisqu'il ne voit pas son propre
   * tableau.
   *
   * Ces clés-là ne lui arrivent que par le relevé des planches réellement en
   * base, construit à l'exécution. Jamais par le prompt figé.
   */
  it('n’annonce aucun emplacement encore vide', () => {
    if (!fs.existsSync(PROMPT)) return;

    const texte = fs.readFileSync(PROMPT, 'utf8');
    const dessinees = new Set(catalogueDessine().map((s) => s.cle));

    const annoncees = catalogue()
      .filter((s) => !dessinees.has(s.cle))
      .map((s) => s.cle)
      .filter((cle) => texte.includes(`SCHEMA:${cle}`));

    expect(annoncees).toEqual([]);
  });
});

/**
 * Le catalogue lui-même : deux fichiers l'alimentent, et rien n'empêche
 * structurellement une clé d'être écrite deux fois ou de porter un préfixe
 * qu'aucune matière ne reconnaît. Dans les deux cas la figure disparaîtrait
 * de l'administration sans un mot.
 */
describe('cohérence du catalogue', () => {
  const { catalogue, cleSchema, PREFIXE } = require('../lib/storage/schemas');

  const PREFIXES = ['svt', 'pc', 'math', 'fr', 'hg', 'an', 'sc'];

  it('n’a aucune clé en double', () => {
    const cles = catalogue().map((f) => f.cle);
    const doublons = cles.filter((c, i) => cles.indexOf(c) !== i);

    expect(doublons).toEqual([]);
  });

  it('range chaque figure sous une matière connue', () => {
    const orphelines = catalogue()
      .map((f) => f.cle)
      .filter((cle) => !PREFIXES.includes(cle.split('-')[0]));

    expect(orphelines).toEqual([]);
  });

  it('donne à chaque figure un titre et un niveau', () => {
    for (const f of catalogue()) {
      expect(f.titre.length).toBeGreaterThan(3);
      expect(f.niveau).toMatch(/^(CP|CE1|CE2|CM1|CM2|6e|5e|4e|3e|2de|1re|Tle)$/);
    }
  });

  /**
   * Une clé d'emplacement doit être RECONNUE même sans dessin : c'est elle qui
   * permet à une planche importée de s'afficher pour une matière qui n'a aucun
   * tracé à elle. Si `cleSchema` la rejetait, l'import marcherait en base et
   * ne s'afficherait jamais au tableau.
   */
  it('reconnaît les clés sans dessin', () => {
    expect(cleSchema(`${PREFIXE}hg-empire-romain`)).toBe('hg-empire-romain');
    expect(cleSchema(`${PREFIXE}pc-circuit-serie`)).toBe('pc-circuit-serie');
    expect(cleSchema(`${PREFIXE}hg-inexistant`)).toBeNull();
  });
});
