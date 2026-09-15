import {
  carteDeChoixVisible,
  debutDeDictee,
  finDeDictee,
} from '../lib/storage/etatDictee';
import { texteDicteDepuis } from '../lib/storage/comparaisonDictee';

/**
 * LE PARCOURS D'UNE DICTÉE : demander, choisir, écrire, rendre, finir,
 * recommencer.
 *
 * Les autres tests vérifient chaque décision isolément. Celui-ci les enchaîne
 * dans l'ordre réel, parce que c'est aux TRANSITIONS que tout a cassé le
 * 11/09/2026 : une règle juste prise séparément, fausse enchaînée à la
 * suivante.
 *
 * La vérification des passages manquants en a été retirée le 11/09/2026 : la
 * façon de traiter les manques est à redéfinir.
 */

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

const DICTEE_1 = '[DICTEE]\nLe vent soufflait fort sur la falaise.'
  + '\nLes mouettes tournoyaient au-dessus des vagues.'
  + '\nUn bateau rentrait lentement vers le port.\n[/DICTEE]';

const DICTEE_2 = '[DICTEE]\nLe marché du samedi attirait beaucoup de monde.\n[/DICTEE]';

describe('parcours complet', () => {
  // L'état de l'écran, tel que le composant le tient.
  let etat;

  beforeEach(() => {
    etat = {
      messages: [prof('Salut Bilal !'), eleve('Je veux une dictée.')],
      dicteeOuverte: false,
      modeDictee: null,
      copie: null,
      tourDuMode: null,
      debut: 0,
    };
  });

  const tourEleve = () => etat.messages.filter((m) => m.role !== 'assistant').length;
  const indexDernierProf = () => etat.messages.map((m) => m.role).lastIndexOf('assistant');

  const carte = () => carteDeChoixVisible({
    dicteeCourante: (etat.messages[indexDernierProf()]?.contenu ?? '').includes('[DICTEE]'),
    tourDuMode: etat.tourDuMode,
    tourEleve: tourEleve(),
    copieOuverte: etat.copie !== null,
    dicteeOuverte: etat.dicteeOuverte,
  });

  const choisir = (mode) => {
    etat.tourDuMode = tourEleve();
    etat.dicteeOuverte = true;
    etat.modeDictee = mode;
    etat.copie = mode === 'clavier' ? [] : null;
    etat.debut = debutDeDictee({
      dicteeDansLeFlux: false,
      nombreMessages: etat.messages.length,
      indexDernierProf: indexDernierProf(),
    });
  };

  const rendre = (lignes) => {
    etat.copie = null;
    etat.messages.push(eleve(lignes.join('\n')));
  };

  const professeurEcrit = (contenu) => {
    etat.messages.push(prof(contenu));

    const fin = finDeDictee({
      dicteeOuverte: etat.dicteeOuverte,
      correctionArrivee: contenu.includes('[DICTEE_CORRIGEE]'),
      passageArrivant: texteDicteDepuis([prof(contenu)]),
      dejaDicte: texteDicteDepuis(etat.messages.slice(etat.debut, indexDernierProf())),
      indexDernierProf: indexDernierProf(),
      debutDictee: etat.debut,
      dicteeDansLeFlux: false,
    });

    if (fin) {
      etat.dicteeOuverte = false;
      if (fin === 'nouvelle') { etat.copie = null; etat.modeDictee = null; }
    }

    return fin;
  };

  test('de la demande à la correction, sans accroc', () => {
    // 1. Le professeur dicte : la question du support s'affiche.
    etat.messages.push(prof(DICTEE_1));
    expect(carte()).toBe(true);

    // 2. L'élève choisit le clavier : la copie s'ouvre vide, la question part.
    choisir('clavier');
    expect(carte()).toBe(false);
    expect(etat.copie).toEqual([]);
    expect(etat.debut).toBe(2);

    // 3. Il rend sa copie : la dictée reste ouverte jusqu'à sa correction.
    rendre(['le vent soufflait fort sur la falaise']);
    expect(etat.dicteeOuverte).toBe(true);

    // 4. Une relecture ne la referme pas et ne repose pas la question.
    expect(professeurEcrit('[DICTEE]Le vent soufflait fort sur la falaise.[/DICTEE]'))
      .toBeNull();
    expect(etat.dicteeOuverte).toBe(true);
    expect(carte()).toBe(false);

    // 5. La correction clôt la dictée.
    expect(professeurEcrit('Voilà ![DICTEE_CORRIGEE]…[/DICTEE_CORRIGEE]'))
      .toBe('correction');
    expect(etat.dicteeOuverte).toBe(false);
  });

  test('une nouvelle dictée repart de zéro, même sans correction', () => {
    etat.messages.push(prof(DICTEE_1));
    choisir('cahier');
    rendre(['photo envoyée']);

    // Le professeur repart sur un texte inédit : celle-ci est abandonnée.
    expect(professeurEcrit(DICTEE_2)).toBe('nouvelle');
    expect(etat.dicteeOuverte).toBe(false);
    expect(etat.modeDictee).toBeNull();

    // Et la question du support revient.
    expect(carte()).toBe(true);
  });

  test('le message qui ouvre une dictée ne la referme pas', () => {
    etat.messages.push(prof(DICTEE_1));
    choisir('clavier');

    // Aucun message n'est arrivé depuis le choix : rien ne doit conclure.
    const fin = finDeDictee({
      dicteeOuverte: true,
      correctionArrivee: false,
      passageArrivant: texteDicteDepuis([prof(DICTEE_1)]),
      dejaDicte: '',
      indexDernierProf: indexDernierProf(),
      debutDictee: etat.debut,
      dicteeDansLeFlux: false,
    });

    expect(fin).toBeNull();
    expect(etat.copie).toEqual([]);
  });
});

describe('enchaînements qui ont cassé', () => {
  const fil = (...m) => m;

  test('trois dictées de suite sans aucune correction', () => {
    const d1 = { role: 'assistant', contenu: '[DICTEE]Le chat dort.[/DICTEE]' };
    const d2 = { role: 'assistant', contenu: '[DICTEE]Le chien court.[/DICTEE]' };
    const d3 = { role: 'assistant', contenu: '[DICTEE]La souris mange.[/DICTEE]' };

    // Chaque dictée ne voit QUE son propre texte.
    expect(texteDicteDepuis(fil(d1, d2, d3).slice(2))).toBe('La souris mange.');
    expect(texteDicteDepuis(fil(d1, d2, d3).slice(1, 2))).toBe('Le chien court.');
  });

  test('une relecture au milieu ne double pas le texte', () => {
    const d = { role: 'assistant', contenu: '[DICTEE]Le chat dort. Le chien court.[/DICTEE]' };
    const relu = { role: 'assistant', contenu: '[DICTEE]Le chien court.[/DICTEE]' };

    expect(texteDicteDepuis(fil(d, relu))).toBe('Le chat dort. Le chien court.');
  });

  test('après correction, la dictée suivante repart vierge', () => {
    const ancienne = { role: 'assistant', contenu: '[DICTEE]Le chat dort.[/DICTEE]' };
    const correction = { role: 'assistant', contenu: '[DICTEE_CORRIGEE]…[/DICTEE_CORRIGEE]' };
    const neuve = { role: 'assistant', contenu: '[DICTEE]Le chien court.[/DICTEE]' };

    expect(texteDicteDepuis(fil(ancienne, correction, neuve))).toBe('Le chien court.');
  });
});
