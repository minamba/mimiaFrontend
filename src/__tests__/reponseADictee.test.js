/**
 * CE QUE L'ÉLÈVE DOIT ÉCRIRE NE S'AFFICHE PAS — signalement du 09/11/2026 : « écoute bien, écris soixante », et la
 * réponse était dans la bulle. Le 🔊 la remplace à l'écran ; la voix, elle, lit toujours le texte entier.
 */
import { masquerReponseADictee as masquer } from '../lib/reponseADictee';

describe('ce qu’il doit écrire est caché', () => {
  test.each([
    ['Écoute bien, écris soixante.', 'Écoute bien, écris 🔊.'],
    ['Écoute bien, écrit soixante.', 'Écoute bien, écrit 🔊.'],
    ['Écris soixante-treize en chiffres.', 'Écris 🔊 en chiffres.'],
    ['Écris le nombre soixante et onze.', 'Écris le nombre 🔊.'],
    ['Écris le nombre que je dis : quatre-vingt-dix-sept !', 'Écris le nombre que je dis : 🔊 !'],
    ['Note sur ton cahier : 73.', 'Note sur ton cahier : 🔊.'],
    ['Écris le mot « chat ».', 'Écris le mot 🔊.'],
    ['Écris « maison » sur ton cahier.', 'Écris 🔊 sur ton cahier.'],
    ['Tape le mot "école" dans le champ.', 'Tape le mot 🔊 dans le champ.'],
    ['Écris 60 en lettres.', 'Écris 🔊 en lettres.'],
    ['Bravo ! Maintenant, écris cent vingt-cinq.', 'Bravo ! Maintenant, écris 🔊.'],
  ])('« %s »', (avant, apres) => {
    expect(masquer(avant)).toBe(apres);
  });
});

describe('une consigne ou une question ne bouge pas', () => {
  test.each([
    'Écris ta réponse sur ton cahier.',
    'Écris le résultat de quatre plus deux.',
    'Écris trois phrases sur ton week-end.',
    'Combien font soixante plus dix ?',
    'Oui, c’est soixante ! Bravo.',
    'Écris-le comme tu l’entends.',
    'Tu as écrit soixante, c’est juste !',
    'Écris le calcul : 7 × 8.',
  ])('« %s »', (texte) => {
    expect(masquer(texte)).toBe(texte);
  });
});

// SIGNALEMENT ROUVERT (14/11/2026) : la cible annoncée AVANT la consigne d'écrire.
describe('le nombre annoncé, puis « écris-le »', () => {
  test.each([
    ['Je te dis un nombre : soixante. Écris-le en chiffres.', 'Je te dis un nombre : 🔊. Écris-le en chiffres.'],
    ['Écoute bien le nombre : soixante-douze. Maintenant, écris-le.', 'Écoute bien le nombre : 🔊. Maintenant, écris-le.'],
    ['Voici le mot : « maison ». Écris-le sur ton cahier.', 'Voici le mot : 🔊. Écris-le sur ton cahier.'],
  ])('« %s »', (avant, apres) => {
    expect(masquer(avant)).toBe(apres);
  });

  test.each([
    'Le nombre : soixante. Bravo, c’est juste !',
  ])('sans « écris-le » ensuite, rien ne bouge : « %s »', (texte) => {
    expect(masquer(texte)).toBe(texte);
  });
});

// LA SÉRIE DE DICTÉE (14/11/2026) — messages réels de la séance de Test Kid, en prod.
describe('une annonce dans une série de dictée', () => {
  test.each([
    ['Oui, c’est ça ! 71, ça s’écrit bien soixante et onze.  Je te dis un autre nombre : 65.',
      'Oui, c’est ça ! 71, ça s’écrit bien soixante et onze.  Je te dis un autre nombre : 🔊.'],
    ['Je le redis doucement : soixante-dix-huit. Essaie de l’écrire en chiffres.',
      'Je le redis doucement : 🔊. Essaie de l’écrire en chiffres.'],
    ['D’accord, on inverse les rôles !  Je te dis : 81. Tu me l’écris en lettres.',
      'D’accord, on inverse les rôles !  Je te dis : 🔊. Tu me l’écris en lettres.'],
    ['Je te dis un nombre : soixante.', 'Je te dis un nombre : 🔊.'],
    ['Écoute bien : quarante-deux.', 'Écoute bien : 🔊.'],
    // Une annonce reste une annonce, même suivie d'une question : la voix dit le nombre.
    ['Je te dis un nombre : soixante. Combien de dizaines ?', 'Je te dis un nombre : 🔊. Combien de dizaines ?'],
  ])('« %s »', (avant, apres) => {
    expect(masquer(avant)).toBe(apres);
  });

  test.each([
    'Écoute bien : soixante, c’est six dizaines.',
    'Oui, c’est ça ! 81 en lettres, ça s’écrit « quatre-vingt-un ».',
    'Je te dis la règle : on ne met pas de « et » pour 81.',
    'Le temps est écoulé, Test Kid ! Tu as bien progressé aujourd’hui.',
    'Oui, c’est ça ! 71, ça s’écrit bien soixante et onze.',
    'Bravo, 43 s’écrit quarante-trois.',
  ])('rien ne bouge : « %s »', (texte) => {
    expect(masquer(texte)).toBe(texte);
  });
});
