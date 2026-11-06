/**
 * DES MOTS OU DES PHRASES — remonté par un parent le 01/11/2026 : en CP, son
 * fils révisait « un, deux, trois » et a reçu ces mots pris dans des phrases.
 * Voir `typeDictee.js` (écran) et `TypeDeDictee.cs` (serveur).
 */
import {
  typeDicteeChoisi, marquerTypeDictee, lireReponseTypeDictee,
  retirerMarqueurTypeDictee, demandeTypeDictee, demandeRedite, MOTS, PHRASES,
} from '../lib/storage/typeDictee';
import { retirerMarqueursApplication } from '../lib/storage/texteAffiche';

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

describe('la question « des mots ou des phrases ? »', () => {
  it('ouvre la carte tant que l’élève n’a pas répondu', () => {
    const messages = [
      eleve('On fait une dictée ?'),
      prof('[TYPE_DICTEE] Tu veux une dictée de mots ou une dictée de phrases ?'),
    ];
    expect(typeDicteeChoisi(messages)).toBeNull();
  });

  it('se referme sur le clic, qui porte le fait du choix', () => {
    const messages = [
      prof('[TYPE_DICTEE] Tu veux une dictée de mots ou une dictée de phrases ?'),
      eleve(marquerTypeDictee('', MOTS)),
    ];
    expect(typeDicteeChoisi(messages)).toBe(MOTS);
  });

  it('vaut aussi quand l’élève répond à voix haute', () => {
    const messages = [
      prof('[TYPE_DICTEE] Tu veux une dictée de mots ou une dictée de phrases ?'),
      eleve('Des phrases'),
    ];
    expect(typeDicteeChoisi(messages)).toBe(PHRASES);
  });

  it('se referme quand la dictée elle-même arrive', () => {
    const messages = [
      prof('[TYPE_DICTEE] Tu veux une dictée de mots ou une dictée de phrases ?'),
      eleve(marquerTypeDictee('', MOTS)),
      prof('Tu l’écris sur ton cahier ou au clavier ? [DICTEE]un. deux. trois.[/DICTEE]'),
    ];
    expect(typeDicteeChoisi(messages)).toBeUndefined();
  });

  it('se referme quand l’élève part sur autre chose et que le professeur le suit', () => {
    const messages = [
      prof('[TYPE_DICTEE] Tu veux une dictée de mots ou une dictée de phrases ?'),
      eleve('Aucun des deux. Je voudrais faire de la lecture.'),
      prof('D’accord, on fait un peu de lecture ! [ARDOISE]Le chat dort sur le lit.[/ARDOISE] Tu peux me lire cette phrase ?'),
    ];
    expect(typeDicteeChoisi(messages)).toBeUndefined();
  });

  it('reste ouverte tant que la question est le dernier mot du professeur', () => {
    const messages = [
      prof('[TYPE_DICTEE] Tu veux une dictée de mots ou une dictée de phrases ?'),
      eleve('Euh… je sais pas.'),
    ];
    expect(typeDicteeChoisi(messages)).toBeNull();
  });

  it('n’existe pas sans la balise du professeur', () => {
    expect(typeDicteeChoisi([prof('On fait une dictée de mots ?')])).toBeUndefined();
    expect(demandeTypeDictee('[TYPE_DICTEE] Mots ou phrases ?')).toBe(true);
    expect(demandeTypeDictee('Mots ou phrases ?')).toBe(false);
  });
});

describe('« tu peux répéter le mot ? » pendant la dictée', () => {
  it('vaut le clic sur « Redis le mot »', () => {
    expect(demandeRedite('Tu peux répéter le mot encore ?')).toBe(true);
    expect(demandeRedite('redis')).toBe(true);
    expect(demandeRedite('j’ai pas bien entendu')).toBe(true);
    expect(demandeRedite('Encore une fois')).toBe(true);
  });

  it('ne prend pas autre chose pour une redite', () => {
    expect(demandeRedite('attends')).toBe(false);
    expect(demandeRedite('j’ai fini')).toBe(false);
    expect(demandeRedite('')).toBe(false);
    // « repète » dans une longue phrase n'est plus une simple demande.
    expect(demandeRedite('x'.repeat(90) + ' répète')).toBe(false);
  });
});

describe('la réponse dite à voix haute', () => {
  it('tranche quand un seul des deux mots est dit', () => {
    expect(lireReponseTypeDictee('Une dictée de mots')).toBe(MOTS);
    expect(lireReponseTypeDictee('des phrases s’il te plaît')).toBe(PHRASES);
    expect(lireReponseTypeDictee('mot')).toBe(MOTS);
  });

  it('laisse la carte ouverte quand ça ne tranche pas', () => {
    expect(lireReponseTypeDictee('je sais pas')).toBeUndefined();
    expect(lireReponseTypeDictee('des mots ou des phrases ?')).toBeUndefined();
    // « motus » n'est pas « mots » : les bornes sont des lettres.
    expect(lireReponseTypeDictee('motus')).toBeUndefined();
  });
});

describe('ce que l’écran montre', () => {
  it('ne montre jamais le fait ajouté au message de l’élève', () => {
    const envoye = marquerTypeDictee('', MOTS);
    expect(envoye).toContain('[DICTÉE DE MOTS');
    expect(retirerMarqueurTypeDictee(envoye)).toBe('Une dictée de mots.');
    expect(retirerMarqueursApplication(envoye)).toBe('Une dictée de mots.');
  });

  it('ne contient pas de bloc de dictée dans le fait — sinon l’écran croirait une dictée commencée', () => {
    expect(marquerTypeDictee('', MOTS)).not.toContain('[DICTEE');
    expect(marquerTypeDictee('', PHRASES)).not.toContain('[DICTEE');
  });

  it('garde les mots de l’enfant quand il a répondu à voix haute', () => {
    expect(retirerMarqueurTypeDictee(marquerTypeDictee('Des phrases !', PHRASES))).toBe('Des phrases !');
  });
});
