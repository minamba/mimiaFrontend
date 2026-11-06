/**
 * L'IMAGE DU MOT TROUVÉ — Camara, le 06/11/2026 : au CP, dans les exercices de mots, une bonne réponse montre l'image
 * du mot. Les messages ci-dessous sont ceux de la conversation 25 (Zakariya), tels qu'en base.
 */
import fs from 'fs';
import path from 'path';
import {
  MOTS_ILLUSTRES, imageDeSyllabe, imageDuMot, motTrouve, nomDeFichier, nomDeSyllabe,
} from '../lib/imagesMots';

const CP = { niveauCode: 'CP', niveauLibelle: 'CP' };
const CE1 = { niveauCode: 'CE1', niveauLibelle: 'CE1' };

const questionMot = (mot, annonce = 'Voici le prochain mot.') => ({
  role: 'assistant',
  contenu: `Bravo Zakariya, « chat », bien entendu !\n\n${annonce}\n\n[FR]${mot}[/FR]\n\nQu'as-tu entendu ?`,
});
const questionSyllabe = (s) => ({
  role: 'assistant',
  contenu: `Bravo Zakariya, « na », bien entendu !\n\nVoici la prochaine syllabe.\n\n[FR]${s}[/FR]\n\nQu'as-tu entendu ?`,
});
const reponse = (contenu, sonJuste) => ({ role: 'user', contenu, sonJuste });

describe('chaque image correspond à un mot, et chaque mot à une image', () => {
  // Les images vivent dans le dossier de données de l'API (06/11/2026). Sur cette machine, on vérifie que la liste
  // et les fichiers concordent ; ailleurs (dossier absent), seule la liste est vérifiée.
  const dossier = path.join(__dirname, '..', '..', '..', '..', '..', 'source', 'repos', 'SchoolWebApp', 'donnees', 'images-mots');

  test('164 mots illustrés, et l’image servie par l’API', () => {
    expect(MOTS_ILLUSTRES.size).toBe(164);
    expect(imageDuMot('chat')).toMatch(/\/images-mots\/chat\.webp$/);
  });

  (fs.existsSync(dossier) ? test : test.skip)('les fichiers du dossier de données sont exactement la liste', () => {
    const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)).sort();
    expect([...MOTS_ILLUSTRES].sort()).toEqual(fichiers);
  });

  test('les accents et les ligatures tombent : âne, sœur, thé, clef', () => {
    expect(nomDeFichier('Âne.')).toBe('ane');
    expect(nomDeFichier('sœur')).toBe('soeur');
    expect(imageDuMot('thé')).toMatch(/\/images-mots\/the\.webp$/);
    expect(imageDuMot('clef')).toMatch(/\/images-mots\/clef\.webp$/);
    expect(imageDuMot('dinosaure')).toBeNull();
  });
});

describe('quand l’image s’affiche', () => {
  test('écoute de mots, bonne réponse au CP : l’image du mot de la question', () => {
    expect(motTrouve(reponse("J'ai entendu le mot tasse.", true), questionMot('tasse'), CP))
      .toEqual({ mot: 'tasse', image: expect.stringMatching(/\/images-mots\/tasse\.webp$/), type: 'mot' });
  });

  test('le premier mot, et le mot redit après une erreur', () => {
    expect(motTrouve(reponse("J'ai entendu le mot niche.", true), questionMot('niche', 'Voici le premier mot.'), CP)?.mot).toBe('niche');
    expect(motTrouve(reponse("J'ai entendu le mot souris.", true), questionMot('souris', 'Je te le redis.'), CP)?.mot).toBe('souris');
  });

  test('le mot vient de la question, pas de l’orthographe de la transcription', () => {
    expect(motTrouve(reponse("J'ai entendu le mot thé.", true), questionMot('thé'), CP)?.image).toMatch(/the\.webp$/);
    expect(motTrouve(reponse("J'ai entendu le mot souri.", true), questionMot('souris'), CP)?.mot).toBe('souris');
  });

  test('prononciation d’un mot jugée bonne : son image', () => {
    expect(motTrouve(reponse('chat', true), { role: 'assistant', contenu: 'Lis ce mot : « chat ».' }, CP)?.mot).toBe('chat');
  });
});

describe('quand elle ne s’affiche pas', () => {
  test('mauvaise réponse, ou réponse non jugée', () => {
    expect(motTrouve(reponse("J'ai entendu le mot tasse.", false), questionMot('tasse'), CP)).toBeNull();
    expect(motTrouve(reponse('tasse', undefined), questionMot('tasse'), CP)).toBeNull();
  });

  test('une syllabe juste ne montre jamais l’image d’un mot', () => {
    expect(motTrouve(reponse('lit', true), questionSyllabe('li'), CP)?.type).toBe('syllabe');
    expect(motTrouve(reponse("J'ai entendu la syllabe ri.", true), questionSyllabe('riz'), CP)?.image).toMatch(/images-syllabes/);
  });

  test('un mot hors du CP, une syllabe hors du CP et du CE1', () => {
    expect(motTrouve(reponse("J'ai entendu le mot tasse.", true), questionMot('tasse'), CE1)).toBeNull();
    expect(motTrouve(reponse("J'ai entendu la syllabe na.", true), questionSyllabe('na'), { niveauCode: 'CE2' })).toBeNull();
  });

  test('une syllabe juste après une question de mot', () => {
    expect(motTrouve(reponse("J'ai entendu la syllabe na.", true), questionMot('nappe'), CP)).toBeNull();
  });

  test('un mot sans image', () => {
    expect(motTrouve(reponse("J'ai entendu le mot dinosaure.", true), questionMot('dinosaure'), CP)).toBeNull();
  });

  test('un message du professeur', () => {
    expect(motTrouve({ role: 'assistant', contenu: 'chat', sonJuste: true }, null, CP)).toBeNull();
  });
});

/*
 * LES SYLLABES (06/11/2026) — le dossier des images se remplit peu à peu : l'adresse est toujours donnée, la carte
 * n'apparaît que si l'image se charge (Chat.js).
 */
describe('les images des syllabes', () => {
  test('le nom du fichier : sans accent, et « -aigu » pour un « é »', () => {
    expect(nomDeSyllabe('la')).toBe('la');
    expect(nomDeSyllabe('je')).toBe('je');
    expect(nomDeSyllabe('jé')).toBe('je-aigu');
    expect(nomDeSyllabe('blé')).toBe('ble-aigu');
    expect(nomDeSyllabe('é')).toBe('e-aigu');
    // « con » est un nom interdit par Windows : le fichier n'aurait pas pu exister sur la machine de Camara.
    expect(nomDeSyllabe('con')).toBe('con-syllabe');
    expect(imageDeSyllabe('son')).toMatch(/\/images-syllabes\/son\.webp$/);
  });

  test('écoute de syllabes juste, au CP et au CE1 : la syllabe de la question', () => {
    expect(motTrouve(reponse("J'ai entendu la syllabe joue.", true), questionSyllabe('jou'), CP))
      .toEqual({ mot: 'jou', image: expect.stringMatching(/\/images-syllabes\/jou\.webp$/), type: 'syllabe' });
    expect(motTrouve(reponse("J'ai entendu la syllabe na.", true), questionSyllabe('na'), CE1)?.mot).toBe('na');
    expect(motTrouve(reponse("J'ai entendu la syllabe fe.", true), {
      role: 'assistant', contenu: 'Pas grave, je te la redis.\n\n[FR]fé[/FR]\n\nQu’as-tu entendu ?',
    }, CP)?.image).toMatch(/fe-aigu\.webp$/);
  });

  test('syllabe fausse : rien', () => {
    expect(motTrouve(reponse("J'ai entendu la syllabe t.", false), questionSyllabe('tu'), CP)).toBeNull();
  });

  test('prononciation d’une syllabe, et un mot illustré lu syllabe par syllabe', () => {
    expect(motTrouve(reponse('ma', true), { role: 'assistant', contenu: 'Lis la syllabe « ma ».' }, CP)?.type).toBe('syllabe');
    expect(motTrouve(reponse('lapin', true), { role: 'assistant', contenu: 'Lis ce mot syllabe par syllabe : « lapin ».' }, CP)?.type).toBe('mot');
  });
});
