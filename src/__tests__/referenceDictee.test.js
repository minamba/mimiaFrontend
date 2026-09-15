import { copieDeReference, comparerDictee, lireComparaison } from '../lib/storage/diffDictee';
import { dicteeAuTableau, dicteeSupprimee, texteParle, decouper } from '../lib/storage/ardoise';
import { retirerMarqueurCahier, marquerCopieAuClavier } from '../lib/storage/copieCahier';
import { tableauDeDictee } from '../components/ComparaisonDictee';

/**
 * LES BADGES NE DÉPENDENT JAMAIS DE CE QUE LE PROFESSEUR RECOPIE.
 *
 * Relevé par Camara le 11/09/2026 : à la reprise d'une correction, le
 * professeur a recopié au tableau une copie DÉJÀ CORRIGÉE — plus une faute,
 * donc plus un badge. Et revenir sur une dictée ancienne doit la montrer comme
 * dans « Mes dictées ».
 */

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

const DICTEE = 'Le soir tombait doucement sur la ville. Les lumières des magasins '
  + "s'allumaient une à une. Les passants pressaient le pas pour rentrer chez eux.";

const COPIE_RENDUE = 'Le soir tombait doucement sur la\n'
  + "Les lumières des magasins s'allumaient 1 à 1\n"
  + 'Les passants pressaient le pas pour Rentrer chez eux';

const COPIE_CORRIGEE = 'Le soir tombait doucement sur la ville\n'
  + "Les lumières des magasins s'allumaient une à une\n"
  + 'Les passants pressaient le pas pour rentrer chez eux';

const tableau = (copie) => `La dictée\n${DICTEE}\n\nTa copie\n${copie}`;

describe('copieDeReference', () => {
  test('LE CAS RELEVÉ : la copie rendue au clavier l\'emporte sur la copie recopiée corrigée', () => {
    const messages = [
      prof(`[DICTEE]${DICTEE}[/DICTEE]`),
      eleve(marquerCopieAuClavier(COPIE_RENDUE)),
      prof(`[ARDOISE]${tableau(COPIE_CORRIGEE)}[/ARDOISE]`),
    ];

    const reference = copieDeReference(messages, tableau(COPIE_CORRIGEE), {
      retirerMarqueur: retirerMarqueurCahier,
    });

    expect(reference).toBe(COPIE_RENDUE);

    // Et avec elle, les badges reviennent.
    expect(comparerDictee(DICTEE, reference).erreurs).toBeGreaterThan(0);
    expect(comparerDictee(DICTEE, COPIE_CORRIGEE).erreurs).toBe(0);
  });

  test('au cahier, c\'est la PREMIÈRE retranscription au tableau qui fait foi', () => {
    const messages = [
      prof(`[DICTEE]${DICTEE}[/DICTEE]`),
      eleve('[photo]'),
      prof(`Je la mets au tableau.[ARDOISE]${tableau(COPIE_RENDUE)}[/ARDOISE]`),
      prof(`On corrige.[ARDOISE]${tableau(COPIE_CORRIGEE)}[/ARDOISE]`),
    ];

    expect(copieDeReference(messages, tableau(COPIE_CORRIGEE))).toBe(COPIE_RENDUE);
  });

  test('la copie d\'une AUTRE dictée ne sert pas de référence', () => {
    const messages = [eleve(marquerCopieAuClavier('le chien court dans le jardin vert'))];

    expect(copieDeReference(messages, tableau(COPIE_RENDUE), {
      retirerMarqueur: retirerMarqueurCahier,
    })).toBeNull();
  });

  test('un tableau ordinaire n\'a pas de copie de référence', () => {
    expect(copieDeReference([], '3 + 4 = 7')).toBeNull();
  });
});

describe('les repères de dictée posés par le professeur', () => {
  test('la dictée remise au tableau se lit par son numéro', () => {
    expect(dicteeAuTableau('Regarde.[DICTEE_AU_TABLEAU]42[/DICTEE_AU_TABLEAU]')).toBe(42);
    expect(dicteeAuTableau('[DICTEE_AU_TABLEAU]n° 7[/DICTEE_AU_TABLEAU]')).toBe(7);
    expect(dicteeAuTableau('Rien au tableau.')).toBeNull();
  });

  test('la suppression se reconnaît, numérotée ou non', () => {
    expect(dicteeSupprimee('[DICTEE_SUPPRIMEE]derniere[/DICTEE_SUPPRIMEE]')).toBe(true);
    expect(dicteeSupprimee('[DICTEE_SUPPRIMEE]42[/DICTEE_SUPPRIMEE]')).toBe(true);
    expect(dicteeSupprimee('Une phrase ordinaire.')).toBe(false);
  });

  test('l\'abandon d\'un exercice d\'écoute ne se lit pas, ni ne s\'affiche', () => {
    // Voulu par Camara le 12/09/2026 : même mécanique que la dictée
    // abandonnée, pour la compréhension orale.
    const message = "D'accord, on laisse tomber celui-là."
      + '[COMPREHENSION_SUPPRIMEE]dernier[/COMPREHENSION_SUPPRIMEE]';

    expect(texteParle(message)).not.toMatch(/COMPREHENSION|dernier/);
    expect(decouper(message).map((s) => s.contenu).join(''))
      .not.toMatch(/COMPREHENSION|dernier/);
  });

  test('ni l\'un ni l\'autre ne se lit, ni ne s\'affiche', () => {
    const message = 'D\'accord, on la laisse.[DICTEE_SUPPRIMEE]42[/DICTEE_SUPPRIMEE] '
      + 'Je te remets l\'autre.[DICTEE_AU_TABLEAU]41[/DICTEE_AU_TABLEAU]';

    expect(texteParle(message)).not.toMatch(/DICTEE|42|41/);

    const affiche = decouper(message).map((s) => s.contenu).join('');
    expect(affiche).not.toMatch(/DICTEE|42|41/);
  });
});

describe('tableauDeDictee', () => {
  test('une archive s\'écrit comme le professeur écrit le tableau', () => {
    const lu = lireComparaison(tableauDeDictee({
      titre: 'La ville le soir',
      dateCreation: '2026-01-03T10:00:00Z',
      texteDicte: DICTEE,
      copie: COPIE_RENDUE,
    }));

    expect(lu.avant).toMatch(/La ville le soir/);
    expect(lu.dicte).toBe(DICTEE);
    expect(lu.copie).toBe(COPIE_RENDUE);
  });
});
