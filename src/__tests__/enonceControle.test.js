/**
 * « J'AI CONTRÔLE VENDREDI EN MATHS À 11H SUR LE THÉORÈME DE THALÈS. »
 *
 * Voulu par Camara le 13/09/2026 : le micro de la fenêtre d'ajout ne doit plus
 * servir au seul champ « sujet ». L'enfant énonce son contrôle d'une phrase, et
 * les quatre champs se remplissent.
 *
 * CES TESTS PORTENT SUR LE CALENDRIER, et c'est là qu'est tout le risque : une
 * date déduite de travers pose un contrôle au mauvais jour, et l'enfant révise
 * pour rien. Le reste — matière, heure, sujet — est du rapprochement de texte.
 *
 * Repère fixe pour toute la série : le MARDI 15 SEPTEMBRE 2026.
 */

import {
  lireEnonce, deduireDate, deduireHeure, deduireMatiere, deduireSujet, formatISO,
} from '../lib/storage/enonceControle';

const MARDI = new Date(2026, 8, 15);
const SAMEDI = new Date(2026, 8, 19);
const VENDREDI = new Date(2026, 8, 18);

const jour = (texte, maintenant) => formatISO(deduireDate(texte, maintenant));

describe('le jour de la semaine', () => {
  test('« vendredi » dit un mardi, c’est le vendredi de cette semaine', () => {
    expect(jour('vendredi', MARDI)).toBe('2026-09-18');
  });

  /**
   * LE CAS QUI DÉCIDE DE LA RÈGLE — donné par Camara : « un "j'ai contrôle
   * vendredi prochain" alors qu'on est actuellement samedi, tu devineras que
   * c'est le prochain vendredi de la semaine prochaine ».
   */
  test('« vendredi » dit un samedi, c’est forcément celui d’après', () => {
    expect(jour('vendredi', SAMEDI)).toBe('2026-09-25');
    expect(jour('vendredi prochain', SAMEDI)).toBe('2026-09-25');
  });

  test('« vendredi » dit un vendredi, c’est aujourd’hui', () => {
    // Un enfant qui prévient le matin d'un contrôle de l'après-midi ne dit pas
    // « vendredi prochain ».
    expect(jour('vendredi', VENDREDI)).toBe('2026-09-18');
  });

  test('mais « vendredi prochain » dit un vendredi repousse d’une semaine', () => {
    expect(jour('vendredi prochain', VENDREDI)).toBe('2026-09-25');
  });

  /**
   * « PROCHAIN » ET « SEMAINE PROCHAINE » NE SONT PAS LA MÊME CHOSE, et les
   * confondre décalerait d'une semaine entière. Un mardi, « vendredi prochain »
   * est dans trois jours ; « vendredi de la semaine prochaine », dans dix.
   */
  test('« de la semaine prochaine » compte à partir du lundi suivant', () => {
    expect(jour('vendredi de la semaine prochaine', MARDI)).toBe('2026-09-25');
    expect(jour('vendredi prochain', MARDI)).toBe('2026-09-18');
  });

  test('« lundi de la semaine prochaine » dit un samedi tombe dans deux jours', () => {
    // Le samedi 19, le lundi de la semaine suivante est le 21 — pas le 28.
    expect(jour('lundi de la semaine prochaine', SAMEDI)).toBe('2026-09-21');
  });
});

describe('les repères sans ambiguïté', () => {
  test.each([
    ["aujourd'hui", '2026-09-15'],
    ['demain', '2026-09-16'],
    ['après-demain', '2026-09-17'],
    ['dans 3 jours', '2026-09-18'],
  ])('« %s »', (texte, attendu) => {
    expect(jour(texte, MARDI)).toBe(attendu);
  });
});

describe('une date dite en toutes lettres', () => {
  test('« lundi 14 septembre » : on croit le chiffre, pas le jour de la semaine', () => {
    // Le 14 septembre 2026 est un lundi — mais même s'il ne l'était pas, c'est
    // le chiffre qui fait foi : il est plus précis, et c'est ce que l'enfant a
    // lu sur son cahier.
    expect(jour('lundi 14 septembre', MARDI)).toBe('2027-09-14');
  });

  test('« le 20 septembre » à venir reste cette année', () => {
    expect(jour('le 20 septembre', MARDI)).toBe('2026-09-20');
  });

  /**
   * Une date déjà passée bascule sur l'année suivante : « le 3 janvier »
   * annoncé en septembre parle forcément de l'année d'après.
   */
  test('« le 3 janvier » annoncé en septembre, c’est l’an prochain', () => {
    expect(jour('le 3 janvier', MARDI)).toBe('2027-01-03');
  });

  test('« 18/09 » se lit jour puis mois, à la française', () => {
    expect(jour('18/09', MARDI)).toBe('2026-09-18');
  });

  test('une date impossible ne rend rien plutôt qu’une date fausse', () => {
    expect(deduireDate('le 31 février', MARDI)).toBeNull();
  });
});

test('sans aucun repère de date, rien n’est inventé', () => {
  expect(deduireDate('j’ai un contrôle de maths', MARDI)).toBeNull();
});

describe('l’heure', () => {
  test.each([
    ['à 11h', '11:00'],
    ['à 11 heures', '11:00'],
    ['11h30', '11:30'],
    ['à 14 h 15', '14:15'],
  ])('« %s »', (texte, attendue) => {
    expect(deduireHeure(texte)).toBe(attendue);
  });

  test('une heure absente reste absente : le champ est facultatif exprès', () => {
    expect(deduireHeure('vendredi en maths')).toBeNull();
  });

  test('une heure impossible est refusée', () => {
    expect(deduireHeure('à 34h')).toBeNull();
  });
});

/**
 * LA MATIÈRE VIENT DE LA LISTE DU COMPTE, JAMAIS DU TEXTE. Un mot inconnu ne
 * sélectionne rien : un contrôle rangé dans la mauvaise matière ne se voit
 * pas, alors qu'un champ vide se remplit en un clic.
 */
describe('la matière', () => {
  const MATIERES = [
    { id: 1, code: 'MATHS', libelle: 'Mathématiques' },
    { id: 2, code: 'FRANCAIS', libelle: 'Français' },
    { id: 3, code: 'HISTOIRE_GEO', libelle: 'Histoire-Géographie' },
  ];

  test.each([
    ['en maths', 1],
    ['en mathématiques', 1],
    ['de français', 2],
    ['en histoire-géo', 3],
    ['en géographie', 3],
  ])('« %s »', (texte, attendue) => {
    expect(deduireMatiere(texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(), MATIERES))
      .toBe(attendue);
  });

  test('une matière que l’enfant n’a pas ne sélectionne rien', () => {
    expect(deduireMatiere('en svt', MATIERES)).toBeNull();
  });

  test('un mot inconnu ne sélectionne rien non plus', () => {
    expect(deduireMatiere('en poterie', MATIERES)).toBeNull();
  });
});

describe('le sujet', () => {
  test('c’est ce qui suit « sur »', () => {
    expect(deduireSujet('j’ai contrôle vendredi sur le théorème de Thalès'))
      .toBe('le théorème de Thalès');
  });

  /**
   * ON NE PREND PAS « TOUT LE RESTE ». Une phrase dont on a retiré la date, la
   * matière et l'heure laisse des miettes — « j'ai contrôle en à le » — qui
   * iraient s'écrire dans le champ et qu'il faudrait effacer à la main.
   */
  test('sans « sur », le sujet reste vide plutôt que bricolé', () => {
    expect(deduireSujet('j’ai contrôle vendredi en maths à 11h')).toBeNull();
  });
});

/**
 * LA PHRASE ENTIÈRE — l'exemple donné par Camara, de bout en bout.
 */
test('« j’ai contrôle lundi 14 septembre en math à 11h sur le théorème de Thalès »', () => {
  const matieres = [{ id: 7, code: 'MATHS', libelle: 'Mathématiques' }];

  expect(lireEnonce(
    'j’ai contrôle lundi 14 septembre en math à 11h sur le théorème de Thalès',
    matieres,
    MARDI,
  )).toEqual({
    matiereId: 7,
    date: '2027-09-14',
    heure: '11:00',
    sujet: 'le théorème de Thalès',
  });
});

test('« j’ai contrôle vendredi » ne remplit que la date', () => {
  expect(lireEnonce('j’ai contrôle vendredi', [], MARDI)).toEqual({
    matiereId: null,
    date: '2026-09-18',
    heure: null,
    sujet: null,
  });
});

test('une phrase vide ne remplit rien', () => {
  expect(lireEnonce('', [], MARDI)).toEqual({
    matiereId: null, date: null, heure: null, sujet: null,
  });
});
