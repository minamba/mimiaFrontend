import { comparerDictee, cleMot, lireComparaison } from '../lib/storage/diffDictee';

/**
 * LES BADGES D'ERREUR, AU MÊME ENDROIT DES DEUX CÔTÉS.
 *
 * Voulu par Camara le 11/09/2026 : chaque erreur surlignée sur la copie ET à
 * l'endroit correspondant de la dictée, avec le même numéro, dans l'ordre du
 * texte. Les exemples viennent de la dictée faite ce jour-là (Karim et son
 * examen).
 */

/** Les mots en erreur d'un côté : [texte, numéro, badge]. */
const enErreur = (segments) => segments
  .filter((s) => s.type === 'mot' && s.texte.trim())
  .map((s) => [s.texte, s.erreur, s.badge]);

const trous = (segments) => segments.filter((s) => s.type === 'manque').map((s) => s.erreur);

describe('cleMot', () => {
  test('ni casse, ni ponctuation autour', () => {
    expect(cleMot('Karim,')).toBe('karim');
    expect(cleMot('«tôt»')).toBe('tôt');
  });

  test('l\'apostrophe courbe vaut l\'apostrophe droite', () => {
    expect(cleMot('s’est')).toBe("s'est");
  });

  test('« coeur » vaut « cœur » : la ligature ne se tape pas', () => {
    expect(cleMot('cœur')).toBe(cleMot('coeur'));
  });

  test('les accents, eux, comptent', () => {
    expect(cleMot('a')).not.toBe(cleMot('à'));
  });
});

describe('comparerDictee', () => {
  test('une copie parfaite : aucun badge', () => {
    const r = comparerDictee('Le chat dort.', 'le chat dort');
    expect(r.erreurs).toBe(0);
    expect(enErreur(r.copie)).toEqual([]);
  });

  test('LE CAS RELEVÉ : deux mots mal écrits, badges 1 et 2 des deux côtés', () => {
    const r = comparerDictee(
      "Ce matin, Karim s'est levé plus tôt que d'habitude.",
      "ce matin Karim s'est levée plut tôt que d'habitude",
    );

    expect(r.erreurs).toBe(2);
    expect(enErreur(r.dicte)).toEqual([['levé', 1, true], ['plus', 2, true]]);
    expect(enErreur(r.copie)).toEqual([['levée', 1, true], ['plut', 2, true]]);
  });

  test('un passage oublié : UNE erreur, surlignée dans la dictée, repérée dans la copie', () => {
    const r = comparerDictee(
      'Il a relu ses notes une dernière fois avant de partir.',
      'il a relu ses notes avant de partir',
    );

    expect(r.erreurs).toBe(1);

    // LE CAS RELEVÉ : le badge FERME le groupe — après « fois », pas après
    // « une », qui aurait eu l'air d'être la seule erreur.
    expect(enErreur(r.dicte)).toEqual([
      ['une', 1, false], ['dernière', 1, false], ['fois', 1, true],
    ]);

    // Et le groupe se lit d'un bloc : les blancs entre ses mots sont
    // surlignés avec eux.
    const debut = r.dicte.findIndex((s) => s.texte === 'une');
    const fin = r.dicte.findIndex((s) => s.texte === 'fois');
    expect(r.dicte.slice(debut, fin + 1).every((s) => s.type === 'mot' && s.erreur === 1))
      .toBe(true);

    // Le repère tombe juste après « notes », là où le passage manque.
    const copie = r.copie;
    const indexNotes = copie.findIndex((s) => s.texte === 'notes');
    expect(copie[indexNotes + 1]).toEqual({ type: 'manque', erreur: 1 });
  });

  test('une phrase entière oubliée ne vaut qu\'un badge', () => {
    const r = comparerDictee(
      'Il partit. Sur le chemin, il a croisé son ami Yanis. Ils ont discuté.',
      'il partit. ils ont discuté',
    );

    expect(r.erreurs).toBe(1);
    expect(trous(r.copie)).toEqual([1]);
  });

  test('deux erreurs voisines restent deux blocs, séparés', () => {
    // « levée plut » : deux mots faux côte à côte, deux badges — le blanc
    // entre eux n'est pas surligné, sinon on lirait une seule erreur.
    const r = comparerDictee("s'est levé plus tôt", "s'est levée plut tôt");
    const blanc = r.copie.find((s, i) => s.texte === ' ' && r.copie[i - 1]?.texte === 'levée');

    expect(blanc.type).toBe('texte');
    expect(enErreur(r.copie)).toEqual([['levée', 1, true], ['plut', 2, true]]);
  });

  test('un groupe ne se relie jamais par-dessus un retour à la ligne', () => {
    const r = comparerDictee('Le chat dort. Le chien court.', 'le chat\nle chien court');
    expect(r.copie.some((s) => s.type === 'mot' && s.texte.includes('\n'))).toBe(false);
  });

  test('un mot en trop dans la copie : repère dans la dictée', () => {
    const r = comparerDictee('Le chat dort.', 'le gros chat dort');

    expect(enErreur(r.copie)).toEqual([['gros', 1, true]]);
    expect(trous(r.dicte)).toEqual([1]);
  });

  test('un mot soudé — « ilse » pour « ils se » — est UNE erreur', () => {
    const r = comparerDictee('Ils se sont souhaité bonne chance.', 'ilse sont souhaité bonne chance');

    expect(r.erreurs).toBe(1);
    expect(enErreur(r.copie)).toEqual([['ilse', 1, true]]);
  });

  test('un mot mal écrit tombe en face de SON mot, pas du suivant', () => {
    const r = comparerDictee('le cœur battant, et', 'le coeur batton et');

    expect(enErreur(r.dicte)).toEqual([['battant,', 1, true]]);
    expect(enErreur(r.copie)).toEqual([['batton', 1, true]]);
  });

  test('« a » pour « à » est une erreur', () => {
    const r = comparerDictee('avant de commencer à écrire', 'avant de commencer a écrire');
    expect(enErreur(r.copie)).toEqual([['a', 1, true]]);
  });

  test('les numéros suivent l\'ordre du texte', () => {
    const r = comparerDictee(
      'Karim est entré dans la salle, le cœur battant, et s\'est installé à sa place habituelle.',
      'kari mest rentré dans la salle le coeur batton et sst installé à sa place hatibuelle',
    );

    const numeros = enErreur(r.copie).map(([, n]) => n);
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b));
    expect(r.erreurs).toBeGreaterThanOrEqual(5);
  });

  test('le chinois se compare caractère par caractère', () => {
    const r = comparerDictee('我爱你。', '我爱他');
    expect(enErreur(r.dicte)).toEqual([['你', 1, true]]);
    expect(enErreur(r.copie)).toEqual([['他', 1, true]]);
  });

  test('une copie « arrivée en photo » n\'est pas comparable', () => {
    const r = comparerDictee(
      'Ce matin, Karim s\'est levé plus tôt que d\'habitude.',
      "(La copie est arrivée en photo, mais n'a pas encore été relue par le professeur.)",
    );
    expect(r.comparable).toBe(false);
  });

  test('le texte de chaque côté est rendu à l\'identique', () => {
    const dicte = "Ce matin, Karim s'est levé.";
    const copie = 'ce matin\nKarim sest levée';
    const r = comparerDictee(dicte, copie);

    const recolle = (segments) => segments.map((s) => s.texte ?? '').join('');
    expect(recolle(r.dicte)).toBe(dicte);
    expect(recolle(r.copie)).toBe(copie);
  });
});

describe('lireComparaison', () => {
  test('reconnaît le tableau de correction', () => {
    const lu = lireComparaison('La dictée\nLe chat dort.\n\nTa copie\nle chat dor');

    expect(lu).toEqual({
      avant: '',
      titreDictee: 'La dictée',
      titreCopie: 'Ta copie',
      dicte: 'Le chat dort.',
      copie: 'le chat dor',
    });
  });

  test('les titres traduits sont reconnus : la dictée existe dans toutes les langues', () => {
    // La consigne demande les titres français quelle que soit la langue du
    // cours, mais un professeur qui traduit ne doit pas priver l'élève de ses
    // badges.
    expect(lireComparaison('The dictation\nThe cat sleeps.\n\nYour copy\nthe cat sleep')?.dicte)
      .toBe('The cat sleeps.');

    expect(lireComparaison('El dictado\nEl gato duerme.\n\nTu copia\nel gato duerme')?.copie)
      .toBe('el gato duerme');

    expect(lireComparaison('听写\n我爱你。\n\n你的抄写\n我爱他')?.copie).toBe('我爱他');
  });

  test('un tableau ordinaire ne se prend pas pour une correction', () => {
    expect(lireComparaison('3 + 4 = 7')).toBeNull();
    expect(lireComparaison('La dictée\nLe chat dort.')).toBeNull();
  });
});
