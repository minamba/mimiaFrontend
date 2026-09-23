/**
 * UNE COUVERTURE NE MENT PAS — Camara, le 22/09/2026 : les couvertures portent
 * leur titre peint. Là où une classe renomme le jeu (« Les grands nombres » au
 * CM2), la carte doit montrer LA SIENNE, et non celle d'une autre classe qui
 * annoncerait « Le coffre des centaines ». Depuis le 23/09/2026 et l'arrivée
 * des planches du CM2, chaque jeu de chaque classe a la sienne : le repli
 * « pas d'image plutôt qu'une image fausse » n'a plus de cas vivant, mais la
 * règle reste, et le dernier test du fichier la garde.
 */

import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const carte = (classe, cle) => jeuxDeLaClasse(classe).find((j) => j.cle === cle);

const CM2 = ['un-ou-des', 'a-ou-a', 'roue-des-verbes', 'phrase-qui-dit-non', 'contraires-et-jumeaux',
  'ou-quand-comment', 'sujet-qui-s-eloigne', 'comme-une-image', 'poeme-theatre-recit',
  'coffre-des-centaines', 'course-des-tables', 'parts-de-pizza', 'metre-ruban', 'tour-du-jardin',
  'combien-de-temps', 'le-miroir', 'le-diagramme', 'regle-des-dixiemes', 'recette-pour-8',
  'boite-mystere', 'sac-de-billes', 'le-robot'];

describe('les couvertures du CM2', () => {
  it('les 22 jeux du CM2 ont leur couverture au CM2', () => {
    CM2.forEach((cle) => {
      const jeu = carte('CM2', cle);
      expect(jeu.image).toBeTruthy();
      expect(jeu.titreDansImage).toBe(true);
    });
  });

  it('la couverture du CM2 est la sienne, pas celle du CM1 ni de la classe d’origine', () => {
    expect(carte('CM2', 'coffre-des-centaines').image).not.toBe(carte('CM1', 'coffre-des-centaines').image);
    expect(carte('CM2', 'coffre-des-centaines').image).not.toBe(carte('CE1', 'coffre-des-centaines').image);
    expect(carte('CM2', 'le-robot').image).not.toBe(carte('CM1', 'le-robot').image);
    expect(carte('CM2', 'metre-ruban').image).not.toBe(carte('CE2', 'metre-ruban').image);
  });

  it('le jeu renommé au CM2 garde son titre du CM2', () => {
    expect(carte('CM2', 'coffre-des-centaines').titre).toBe('Les grands nombres');
    expect(carte('CM2', 'le-robot').titre).toBe('La boucle du robot');
    expect(carte('CM2', 'un-ou-des').titre).toBe('L’attribut du sujet');
  });
});

describe('les couvertures du CM1', () => {
  const CM1 = ['un-ou-des', 'a-ou-a', 'roue-des-verbes', 'phrase-qui-dit-non', 'contraires-et-jumeaux',
    'ou-quand-comment', 'sujet-qui-s-eloigne', 'coffre-des-centaines', 'course-des-tables', 'parts-de-pizza',
    'metre-ruban', 'tour-du-jardin', 'combien-de-temps', 'le-miroir', 'le-diagramme', 'a-qui-le-pronom',
    'comme-une-image', 'poeme-theatre-recit', 'mots-de-liaison', 'regle-des-dixiemes', 'recette-pour-8',
    'boite-mystere', 'suite-qui-continue', 'sac-de-billes', 'le-robot', 'le-crible'];

  it('les 26 jeux du CM1 ont leur couverture au CM1', () => {
    CM1.forEach((cle) => {
      const jeu = carte('CM1', cle);
      expect(jeu.image).toBeTruthy();
      expect(jeu.titreDansImage).toBe(true);
    });
  });

  it('la couverture du CM1 ne déborde pas sur le CE1-CE2', () => {
    expect(carte('CM1', 'coffre-des-centaines').image).not.toBe(carte('CE1', 'coffre-des-centaines').image);
    expect(carte('CM1', 'a-ou-a').image).not.toBe(carte('CE2', 'a-ou-a').image);
  });
});

describe('les couvertures du CE2', () => {
  it('chaque jeu du CE2 a sa couverture au CE2', () => {
    ['partage-des-bonbons', 'metre-ruban', 'tour-du-jardin', 'combien-de-temps', 'les-bouteilles',
      'le-miroir', 'le-diagramme', 'un-ou-des', 'a-ou-a', 'phrase-qui-dit-non', 'ou-quand-comment', 'sujet-qui-s-eloigne'].forEach((cle) => {
      const jeu = carte('CE2', cle);
      expect(jeu.image).toBeTruthy();
      expect(jeu.titreDansImage).toBe(true);
    });
  });

  it('un jeu partagé montre au CE2 sa couverture du CE2, et aux autres classes la leur', () => {
    expect(carte('CE2', 'a-ou-a').image).not.toBe(carte('CE1', 'a-ou-a').image);
    expect(carte('CE2', 'un-ou-des').image).not.toBe(carte('CP', 'un-ou-des').image);
    expect(carte('CE2', 'phrase-qui-dit-non').image).not.toBe(carte('CE1', 'phrase-qui-dit-non').image);
  });
});

describe('les couvertures du CE1', () => {
  it('chaque jeu du CE1 a sa couverture au CE1, titre peint compris', () => {
    ['coffre-des-centaines', 'course-des-tables', 'parts-de-pizza', 'machine-a-dix', 'a-ou-a',
      'detective-du-verbe', 'roue-des-verbes', 'types-de-phrases', 'phrase-qui-dit-non', 'contraires-et-jumeaux'].forEach((cle) => {
      const jeu = carte('CE1', cle);
      expect(jeu.image).toBeTruthy();
      expect(jeu.titreDansImage).toBe(true);
    });
  });

  it('une classe qui garde le titre garde la couverture', () => {
    expect(carte('CE2', 'coffre-des-centaines').image).toBeTruthy();
    expect(carte('CE2', 'machine-a-dix').image).toBeTruthy();
  });
});

describe('la règle, toutes classes confondues', () => {
  /* LE FILET. Tant qu'aucun jeu n'est dépourvu de couverture, aucune carte ne
     peut en afficher une qui annonce le titre d'une autre classe. Un jeu ajouté
     sans sa planche fait tomber ce test, avec son nom : c'est le rappel qu'il
     faut la dessiner, ou accepter que sa carte s'affiche sans aperçu. */
  it('aucun jeu, dans aucune classe, ne s’affiche sans couverture', () => {
    const sans = [];
    ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].forEach((classe) => {
      jeuxDeLaClasse(classe).forEach((jeu) => {
        if (!jeu.image) sans.push(`${classe} · ${jeu.cle} · ${jeu.titre}`);
      });
    });
    expect(sans).toEqual([]);
  });
});
