import {
  aLire, lectureAuTableau, estVerdictDeLecture, estMotEntierLu, estConsigneDeLecture,
} from '../lib/lectureDImage';
import {
  exerciceSonsChoisi, exercicesProposes, lireReponseChoixExerciceSons, phraseDuChoix, sujetDuChoix, marquerChoixExerciceSons,
  LIRE_SYLLABES, LIRE_MOTS, ECOUTER_SYLLABES, ECOUTER_MOTS, ECOUTER_SONS,
} from '../lib/storage/choixExerciceSons';
import { retirerMarqueursApplication } from '../lib/storage/texteAffiche';
import { decouper } from '../lib/storage/ardoise';
import { lectureEnCours } from '../lib/lectureAVoixHaute';

const prof = (contenu, id) => ({ role: 'assistant', contenu, id });
const eleve = (contenu, sonJuste = null) => ({ role: 'user', contenu, sonJuste });
const cp = { niveauCode: 'CP' };

describe('la lecture en images', () => {
  it('lit la balise du serveur', () => {
    expect(aLire('Regarde le tableau.\n\n[LECTURE_IMAGE:syllabe]jo[/LECTURE_IMAGE]')).toEqual({ genre: 'syllabe', cible: 'jo' });
    expect(aLire('Rien à lire')).toBeNull();
  });

  it('montre la syllabe dès la question, et la garde après un raté', () => {
    const question = prof('Lis la syllabe en couleur.\n\n[LECTURE_IMAGE:syllabe]jo[/LECTURE_IMAGE]', 7);
    expect(lectureAuTableau([question], cp)).toMatchObject({ mot: 'jo', image: '/images-syllabes/jo.webp', type: 'syllabe' });
    expect(lectureAuTableau([question, eleve("J'ai lu la syllabe ja.", false)], cp)?.mot).toBe('jo');
  });

  it('écrit le mot en grand, puis montre son dessin une fois bien lu', () => {
    const question = prof('Lis ce mot.\n\n[LECTURE_IMAGE:mot]âne[/LECTURE_IMAGE]', 3);
    expect(lectureAuTableau([question], cp)).toMatchObject({ mot: 'âne', image: null, type: 'a-lire' });
    expect(lectureAuTableau([question, eleve("J'ai lu le mot âne.", true)], cp))
      .toMatchObject({ type: 'mot', image: '/images-mots/ane.webp' });
  });

  it("montre l'image du mot anglais (« apple / Pomme »), celle du son à défaut", () => {
    const question = prof('Lis ce mot anglais.\n\n[LECTURE_IMAGE:anglais]apple[/LECTURE_IMAGE]');
    expect(lectureAuTableau([question], { niveauCode: 'CP' })).toMatchObject({ image: '/images-mots-en/apple.webp', type: 'mot-anglais' });
    const whale = prof('Lis ce mot anglais.\n\n[LECTURE_IMAGE:anglais]whale[/LECTURE_IMAGE]');
    expect(lectureAuTableau([whale], { niveauCode: 'CE1' })?.image).toBe('/images-mots-en/whale.webp');
  });

  it("s'arrête dès que le professeur passe à autre chose", () => {
    const messages = [prof('[LECTURE_IMAGE:syllabe]jo[/LECTURE_IMAGE]'), eleve('Je veux écouter des mots.'), prof('Voici le premier mot. [FR]chat[/FR]')];
    expect(lectureAuTableau(messages, cp)).toBeNull();
  });

  it('la prochaine image attend que la voix en parle (« ba » bien lu, la robe arrivait sur le mot ballon, 08/11/2026)', () => {
    const fil = [
      prof('Lis la syllabe en couleur.\n\n[LECTURE_IMAGE:syllabe]ba[/LECTURE_IMAGE]', 1),
      eleve("J'ai lu la syllabe ba.", true),
      prof('Bravo, comme dans ballon !\n\nVoici une autre image : lis à voix haute la syllabe en couleur.\n\n[LECTURE_IMAGE:syllabe]ro[/LECTURE_IMAGE]', 2),
    ];
    expect(lectureAuTableau(fil, cp, { retenue: true })?.mot).toBe('ba');
    expect(lectureAuTableau(fil, cp)?.mot).toBe('ro');
    // La réponse vient d'arriver, la question pas encore : rien à retenir.
    expect(lectureAuTableau(fil.slice(0, 2), cp, { retenue: true })?.mot).toBe('ba');
    // La toute première image : rien à montrer avant elle.
    expect(lectureAuTableau([eleve('Je veux lire des syllabes.'), fil[0]], cp, { retenue: true })).toBeNull();
  });

  it('la voix reconnaît toutes les consignes du code, et pas son bravo', () => {
    [
      'Regarde bien la syllabe en couleur, et essaie encore de la lire à voix haute.',
      'Regarde le tableau : lis à voix haute la syllabe en couleur.',
      'Voici une autre image : lis à voix haute la syllabe en couleur.',
      'Regarde bien le mot anglais, et essaie encore de le lire à voix haute.',
      'Regarde le tableau : lis ce mot anglais à voix haute.',
      'Voici un autre mot anglais : lis-le à voix haute.',
      'Voici un autre mot : lis-le à voix haute.',
    ].forEach((consigne) => expect(estConsigneDeLecture(consigne)).toBe(true));
    expect(estConsigneDeLecture('Bravo Zakariya, comme dans renard !')).toBe(false);
  });

  it("n'est pas l'exercice de lecture à voix haute (production, 07/11/2026 : « Lu à voix haute » au lieu du verdict)", () => {
    const image = prof('Regarde le tableau : lis à voix haute la syllabe en couleur.\n\n[LECTURE_IMAGE:syllabe]coi[/LECTURE_IMAGE]');
    expect(lectureEnCours([prof('Lis la phrase au tableau. [EXERCICE_LECTURE]'), image])).toBe(false);
    expect(lectureEnCours([image, prof('Maintenant lis la phrase au tableau. [EXERCICE_LECTURE]')])).toBe(true);
  });

  it('reconnaît les verdicts de lecture', () => {
    expect(estVerdictDeLecture("J'ai lu la syllabe jo.")).toBe(true);
    expect(estVerdictDeLecture("J'ai entendu la syllabe jo.")).toBe(false);
    expect(estMotEntierLu("J'ai lu la syllabe en disant le mot entier joker.")).toBe(true);
  });

  it('la cible ne se lit ni ne se dit', () => {
    const texte = 'Regarde le tableau : lis à voix haute la syllabe en couleur.\n\n[LECTURE_IMAGE:syllabe]jo[/LECTURE_IMAGE]';
    expect(retirerMarqueursApplication(texte)).not.toMatch(/jo|LECTURE_IMAGE/);
    const dit = decouper(texte).map((s) => s.contenu).join(' ');
    expect(dit).not.toMatch(/LECTURE_IMAGE|\bjo\b/);
    expect(decouper('Quel exercice ? [CHOIX_EXERCICE_SONS]').map((s) => s.contenu).join(' ')).not.toMatch(/CHOIX/);
  });
});

describe('la carte des exercices de sons', () => {
  it('propose quatre exercices en français, trois en anglais', () => {
    expect(exercicesProposes('FRANCAIS').map((e) => e.code)).toEqual([ECOUTER_SYLLABES, ECOUTER_MOTS, LIRE_SYLLABES, LIRE_MOTS]);
    expect(exercicesProposes('ANGLAIS').map((e) => e.code)).toEqual([ECOUTER_SONS, ECOUTER_MOTS, LIRE_MOTS]);
  });

  it('attend son choix, puis se ferme sur le clic ou la réponse dite', () => {
    const question = prof('On fait quel exercice ? [CHOIX_EXERCICE_SONS]');
    expect(exerciceSonsChoisi([question])).toBeNull();
    expect(exerciceSonsChoisi([question, eleve(phraseDuChoix(LIRE_SYLLABES))])).toBe(LIRE_SYLLABES);
    expect(exerciceSonsChoisi([question, eleve('écouter les mots')])).toBe(ECOUTER_MOTS);
    expect(exerciceSonsChoisi([prof('Bonjour')])).toBeUndefined();
  });

  it('ne propose que ce qu\'il a demandé : les mots, ou les syllabes', () => {
    expect(exercicesProposes('FRANCAIS', 'mots').map((e) => e.code)).toEqual([ECOUTER_MOTS, LIRE_MOTS]);
    expect(exercicesProposes('FRANCAIS', 'syllabes').map((e) => e.code)).toEqual([ECOUTER_SYLLABES, LIRE_SYLLABES]);
    expect(exercicesProposes('ANGLAIS', 'mots').map((e) => e.code)).toEqual([ECOUTER_MOTS, LIRE_MOTS]);
    expect(sujetDuChoix('D\'accord !\n\nChoisis ton exercice.\n[CHOIX_EXERCICE_SONS:mots]')).toBe('mots');
    expect(sujetDuChoix('[CHOIX_EXERCICE_SONS]')).toBeNull();
  });

  it('« lire » dit seul répond à la carte des mots, et part comme le clic', () => {
    const question = prof('D\'accord !\n\nChoisis ton exercice.\n[CHOIX_EXERCICE_SONS:mots]');
    expect(exerciceSonsChoisi([question, eleve('Lire !')])).toBe(LIRE_MOTS);
    expect(lireReponseChoixExerciceSons('écouter', 'syllabes')).toBe(ECOUTER_SYLLABES);
    const envoye = marquerChoixExerciceSons('Lire !', LIRE_MOTS);
    expect(envoye).toContain('Je veux lire des mots.');
    expect(retirerMarqueursApplication(envoye)).toBe('Lire !');
    expect(decouper('Choisis ton exercice.\n[CHOIX_EXERCICE_SONS:mots]').map((s) => s.contenu).join(' ')).not.toMatch(/CHOIX|mots\]/);
  });

  it('ne devine pas une réponse qui ne tranche pas', () => {
    expect(lireReponseChoixExerciceSons('je sais pas')).toBeUndefined();
    expect(lireReponseChoixExerciceSons('lire ou écouter des syllabes ?')).toBeUndefined();
    expect(lireReponseChoixExerciceSons('lire des mots')).toBe(LIRE_MOTS);
  });
});
