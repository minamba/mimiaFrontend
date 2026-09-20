import { lireSurlignes } from '../lib/storage/surlignesTableau';

const numeros = (contenu, precedents) =>
  lireSurlignes(contenu, precedents).segments
    .filter((s) => s.type === 'mot')
    .map((s) => [s.texte, s.erreur]);

// La séance du 19/09/2026 : quatre fautes, corrigées une à une, le texte
// réécrit à chaque fois sans les fautes déjà reprises.
const t1 = 'je suis ==partie== et je ==vois== que je me ==suis a gratter== une porte ==encastré==';
const t2 = 'je suis parti et je ==vois== que je me ==suis a gratter== une porte ==encastré==';
const t3 = 'je suis parti et j\'ai vu que je me ==suis a gratter== une porte ==encastré==';
const t4 = 'je suis parti et j\'ai vu que j\'ai gratté une porte ==encastré==';

describe('Badges de correction — un mot garde son numéro', () => {
  it('le premier tableau numérote dans l’ordre', () => {
    expect(numeros(t1, [])).toEqual([['partie', 1], ['vois', 2], ['suis a gratter', 3], ['encastré', 4]]);
  });

  it('la faute 1 corrigée : les autres gardent 2, 3 et 4', () => {
    expect(numeros(t2, [t1])).toEqual([['vois', 2], ['suis a gratter', 3], ['encastré', 4]]);
  });

  it('jusqu’à la dernière : « encastré » reste le 4', () => {
    expect(numeros(t4, [t1, t2, t3])).toEqual([['encastré', 4]]);
  });

  it('un détour par un tableau sans surligné ne coupe pas la suite', () => {
    expect(numeros(t3, [t1, t2, 'je vois → j\'ai vu'])).toEqual([['suis a gratter', 3], ['encastré', 4]]);
  });

  it('une nouvelle faute repérée en route prend le numéro suivant', () => {
    expect(numeros('je suis parti et j\'ai ==vu== une porte ==encastré==', [t1, t2])).toEqual([['vu', 5], ['encastré', 4]]);
  });

  it('un autre texte repart à 1', () => {
    expect(numeros('il ==etait== une fois un ==chateau==', [t1, t2])).toEqual([['etait', 1], ['chateau', 2]]);
  });

  it('sans historique, le comportement d’avant', () => {
    expect(numeros(t2)).toEqual([['vois', 1], ['suis a gratter', 2], ['encastré', 3]]);
  });
});
