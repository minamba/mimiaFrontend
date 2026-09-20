import { consigneDuTableau, figerTableauDeCorrection } from '../lib/storage/tableauFige';

// La séance du 19/09/2026, telle qu'elle est en base.
const consigne = 'La consigne\nRaconte un moment où tu as eu très peur, réel ou inventé. Écris entre 6 et 8 phrases.';
const seule = consigne;
const surligne = `${consigne}\n\nTon texte\nJe suis donc ==partie== voir mes amis.\nj'allais ==depassé== l'heure.`;
const reecrit = `${consigne}\n\nTon texte\nJe suis donc parti voir mes amis.\nj'allais ==depassé== l'heure.`;
const sansBadge = `${consigne}\n\nTon texte\nJe suis donc parti voir mes amis.\nj'allais dépasser l'heure.`;
const regle = 'Le participe passé avec être s\'accorde avec le sujet.';
const autre = 'La consigne\nDécris ta chambre.\n\nTon texte\nMa ==chambe== est petite.';

describe('tableauFige — le tableau de correction reste le premier', () => {
  it('lit la consigne, sans les surlignés ni les espaces en trop', () => {
    expect(consigneDuTableau(surligne)).toBe('Raconte un moment où tu as eu très peur, réel ou inventé. Écris entre 6 et 8 phrases.');
    expect(consigneDuTableau(regle)).toBeNull();
    expect(consigneDuTableau(null)).toBeNull();
  });

  it('la consigne seule est remplacée par le premier tableau surligné', () => {
    expect(figerTableauDeCorrection(surligne, [seule, surligne])).toBe(surligne);
  });

  it('une réécriture corrigée, même surlignée, ne remplace pas le tableau', () => {
    expect(figerTableauDeCorrection(reecrit, [seule, surligne, reecrit])).toBe(surligne);
  });

  it('une réécriture sans badge non plus', () => {
    expect(figerTableauDeCorrection(sansBadge, [seule, surligne, reecrit, sansBadge])).toBe(surligne);
  });

  it('en cours de flux, le tableau réécrit n’est pas encore dans la liste : figé quand même', () => {
    expect(figerTableauDeCorrection(reecrit, [seule, surligne])).toBe(surligne);
  });

  it('une règle montrée en passant s’affiche', () => {
    expect(figerTableauDeCorrection(regle, [seule, surligne])).toBe(regle);
  });

  it('un autre texte, une autre consigne : nouveau tableau', () => {
    expect(figerTableauDeCorrection(autre, [seule, surligne, reecrit])).toBe(autre);
  });

  it('sans tableau, rien', () => {
    expect(figerTableauDeCorrection(null, [surligne])).toBeNull();
  });
});

describe('tableauFige — la dictée et la copie restent figées', () => {
  const { dicteeDuTableau } = require('../lib/storage/tableauFige');
  const premier = 'La dictée\nCe matin-là, Karim s\'est levé.\n\nTa copie\nce matin la karim s\'est levé';
  const reecrit = 'La dictée\nCe matin-là, Karim s\'est levé.\n\nTa copie\nce matin-là karim s\'est levé';
  const autre = 'La dictée\nLéa marche au bord de la rivière.\n\nTa copie\nlea marche au bord de la riviere';

  it('lit le texte dicté du tableau de comparaison', () => {
    expect(dicteeDuTableau(premier)).toBe('Ce matin-là, Karim s\'est levé.');
    expect(dicteeDuTableau('3 × 2 = 6')).toBeNull();
  });

  it('une réécriture avec la copie corrigée ne remplace pas le premier tableau', () => {
    expect(figerTableauDeCorrection(reecrit, [premier, reecrit])).toBe(premier);
  });

  it('en cours de flux aussi', () => {
    expect(figerTableauDeCorrection(reecrit, [premier])).toBe(premier);
  });

  it('une autre dictée : nouveau tableau', () => {
    expect(figerTableauDeCorrection(autre, [premier, reecrit])).toBe(autre);
  });
});

describe('tableauFige — un tableau de comparaison en cours de flux', () => {
  const premier = 'La dictée\nLe vent soufflait fort.\n\nTa copie\nle vent souflait fort';

  it('ne remplace pas le tableau figé tant que « Ta copie » n’est pas arrivée', () => {
    expect(figerTableauDeCorrection('La dictée\nLe vent souff', [premier])).toBe(premier);
  });

  it('mais une dictée vraiment nouvelle, une fois complète, s’affiche', () => {
    const autre = 'La dictée\nLéa marche.\n\nTa copie\nlea marche';
    expect(figerTableauDeCorrection(autre, [premier])).toBe(autre);
  });
});
