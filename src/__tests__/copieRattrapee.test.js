/**
 * AU CLAVIER, LA DICTÉE ATTEND QUE LA COPIE AIT RATTRAPÉ LA VOIX — Camara, le
 * 01/11/2026 : « quand l'enfant met plus de temps que la pause pour écrire
 * "un", le professeur passe à "deux" ; quand il fait Entrée, il dit
 * directement "trois". L'enfant a des mots de retard. »
 *
 * Et l'annonce suit le type : « premier mot » pour une dictée de mots.
 */
import { voixService } from '../lib/storage/voixService';
import { typeDeLaDictee, marquerTypeDictee, MOTS, PHRASES } from '../lib/storage/typeDictee';

const lecteurAuClavier = () => {
  const lecteur = voixService.creerLecteur();
  lecteur.supportDictee = 'clavier';
  lecteur.surPauseDictee = jest.fn();
  return lecteur;
};

describe('la copie au clavier règle le rythme de la dictée', () => {
  it('Entrée sur le mot d’AVANT n’écourte pas la pause du mot en cours', () => {
    const lecteur = lecteurAuClavier();
    lecteur.sauterLaPause = jest.fn();

    // Deux mots dictés, l'enfant valide le premier seulement.
    lecteur.dits = { phrases: 2, mots: 2 };
    lecteur.noterCopie(1, 1);
    expect(lecteur.sauterLaPause).not.toHaveBeenCalled();

    // Il valide le second : il a rattrapé, la pause n'a plus d'objet.
    lecteur.noterCopie(2, 2);
    expect(lecteur.sauterLaPause).toHaveBeenCalledTimes(1);
  });

  it('au terme de la pause, la voix attend la copie, et repart quand il a rattrapé', async () => {
    const lecteur = lecteurAuClavier();
    lecteur.dits = { phrases: 2, mots: 2 };
    lecteur.noterCopie(1, 1);

    let repartie = false;
    const attente = lecteur.attendreLaCopie(lecteur.jeton).then(() => { repartie = true; });

    await Promise.resolve();
    expect(repartie).toBe(false);
    expect(lecteur.surPauseDictee).toHaveBeenLastCalledWith(true);

    lecteur.noterCopie(2, 2);
    await attente;
    expect(repartie).toBe(true);
    expect(lecteur.surPauseDictee).toHaveBeenLastCalledWith(false);
  });

  it('deux mots tapés sur une seule ligne comptent : la dictée ne l’attend pas pour toujours', () => {
    const lecteur = lecteurAuClavier();
    lecteur.dits = { phrases: 2, mots: 2 };
    lecteur.noterCopie(1, 2);
    expect(lecteur.copieRattrapee()).toBe(true);
  });

  it('au cahier, rien ne l’attend : la pause calculée reste seule', async () => {
    const lecteur = lecteurAuClavier();
    lecteur.supportDictee = 'cahier';
    lecteur.dits = { phrases: 3, mots: 3 };
    await expect(lecteur.attendreLaCopie(lecteur.jeton)).resolves.toBeUndefined();
  });

  it('une interruption libère l’attente', async () => {
    const lecteur = lecteurAuClavier();
    lecteur.dits = { phrases: 2, mots: 2 };
    const jeton = lecteur.jeton;
    const attente = lecteur.attendreLaCopie(jeton);

    await Promise.resolve();
    lecteur.jeton += 1;
    lecteur.finirLecture?.();
    await expect(attente).resolves.toBeUndefined();
  });
});

describe('« Attends ! » pendant une dictée au cahier', () => {
  const lecteurAuCahier = () => {
    const lecteur = voixService.creerLecteur();
    lecteur.supportDictee = 'cahier';
    lecteur.surPauseDictee = jest.fn();
    lecteur.dits = { phrases: 1, mots: 1 };
    return lecteur;
  };

  it('appuyé, la voix attend au-delà de la pause ; relâché, elle repart', async () => {
    const lecteur = lecteurAuCahier();
    lecteur.suspendreDictee(true);

    let repartie = false;
    const attente = lecteur.attendreLaCopie(lecteur.jeton).then(() => { repartie = true; });

    await Promise.resolve();
    expect(repartie).toBe(false);

    lecteur.suspendreDictee(false);
    await attente;
    expect(repartie).toBe(true);
  });

  it('relâché pendant la pause, il l’écourte : l’enfant a fini', () => {
    const lecteur = lecteurAuCahier();
    lecteur.sauterLaPause = jest.fn();

    lecteur.suspendreDictee(true);
    expect(lecteur.sauterLaPause).not.toHaveBeenCalled();

    lecteur.suspendreDictee(false);
    expect(lecteur.sauterLaPause).toHaveBeenCalledTimes(1);
  });

  it('sans bouton appuyé, le cahier garde la seule pause calculée', async () => {
    const lecteur = lecteurAuCahier();
    await expect(lecteur.attendreLaCopie(lecteur.jeton)).resolves.toBeUndefined();
  });

  it('arrêter la voix relâche le bouton', () => {
    const lecteur = lecteurAuCahier();
    lecteur.suspendreDictee(true);
    lecteur.arreter();
    expect(lecteur.dicteeSuspendue).toBe(false);
  });
});

describe('« Redis le mot » et le rappel d’un « Attends ! » oublié', () => {
  const lecteurSimule = () => {
    const lecteur = voixService.creerLecteur();
    lecteur.supportDictee = 'cahier';
    lecteur.dicteeDeMots = true;
    lecteur.surPauseDictee = jest.fn();
    lecteur.charger = jest.fn(() => Promise.resolve(null));
    lecteur.demarrer = jest.fn();
    lecteur.dits = { phrases: 2, mots: 2 };
    lecteur.dernierDicte = { texte: 'sept.', langue: null, dictee: true };
    return lecteur;
  };

  it('glisse « Je répète le mot » puis le mot, en tête, sans avancer la dictée', () => {
    const lecteur = lecteurSimule();
    lecteur.file = [{ texte: 'huit.', dictee: true }];

    expect(lecteur.redireLeMot()).toBe(true);
    expect(lecteur.file.map((p) => p.texte)).toEqual(['Je répète le mot.', 'sept.', 'huit.']);
    expect(lecteur.file[1]).toMatchObject({ redite: true, dictee: true });
    expect(lecteur.prechargements.map((e) => e.phrase.texte)).toEqual(['Je répète le mot.', 'sept.']);
    expect(lecteur.dits).toEqual({ phrases: 2, mots: 2 });
  });

  it('passe même pendant un « Attends ! » : c’est l’élève qui l’a demandé', () => {
    const lecteur = lecteurSimule();
    lecteur.suspendreDictee(true);
    expect(lecteur.doitAttendre()).toBe(true);

    lecteur.redireLeMot();
    expect(lecteur.doitAttendre()).toBe(false);
  });

  it('ne fait rien avant le premier mot dit', () => {
    const lecteur = lecteurSimule();
    lecteur.dernierDicte = null;
    expect(lecteur.redireLeMot()).toBe(false);
    expect(lecteur.file).toEqual([]);
  });

  it('au bout de trente secondes d’« Attends ! », le professeur le rappelle — une fois', async () => {
    jest.useFakeTimers();
    try {
      const lecteur = lecteurSimule();
      lecteur.suspendreDictee(true);

      const attente = lecteur.attendreLaCopie(lecteur.jeton);
      await Promise.resolve();

      jest.advanceTimersByTime(29000);
      expect(lecteur.file).toEqual([]);

      jest.advanceTimersByTime(1500);
      await attente;
      expect(lecteur.file.map((p) => p.texte)).toEqual([
        "Prends ton temps. Quand tu as fini d'écrire, appuie sur C'est bon.",
      ]);
      expect(lecteur.file[0].interlude).toBe(true);

      // Le rappel dit, la voix l'attend encore — sans nouveau rappel.
      lecteur.file.shift();
      const encore = lecteur.attendreLaCopie(lecteur.jeton);
      await Promise.resolve();
      jest.advanceTimersByTime(60000);
      expect(lecteur.file).toEqual([]);

      lecteur.suspendreDictee(false);
      await encore;
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('la voix dit à l’écran qu’elle dicte', () => {
  it('signale une fois au premier morceau, retire à la relecture et à l’arrêt', () => {
    const lecteur = voixService.creerLecteur();
    lecteur.surDicteeEnCours = jest.fn();

    lecteur.signalerDictee(true);
    lecteur.signalerDictee(true);
    expect(lecteur.surDicteeEnCours).toHaveBeenCalledTimes(1);
    expect(lecteur.surDicteeEnCours).toHaveBeenLastCalledWith(true);

    lecteur.signalerRelecture('en_cours');
    expect(lecteur.surDicteeEnCours).toHaveBeenLastCalledWith(false);

    lecteur.signalerDictee(true);
    lecteur.arreter();
    expect(lecteur.surDicteeEnCours).toHaveBeenLastCalledWith(false);
  });
});

describe('typeDeLaDictee', () => {
  const prof = (contenu) => ({ role: 'assistant', contenu });
  const eleve = (contenu) => ({ role: 'user', contenu });

  it('suit le choix de l’élève, cliqué ou dit en toutes lettres', () => {
    expect(typeDeLaDictee([
      eleve(marquerTypeDictee('', MOTS)),
      prof('Tu l’écris où ? [DICTEE] le chat dort. [/DICTEE]'),
    ])).toBe(MOTS);

    expect(typeDeLaDictee([
      eleve('Je voudrais faire une dictée de phrases.'),
      prof('[DICTEE] Le chat dort. [/DICTEE]'),
    ])).toBe(PHRASES);
  });

  it('à défaut de choix, lit la forme du texte dicté', () => {
    expect(typeDeLaDictee([prof('[DICTEE] six. sept. huit. [/DICTEE]')])).toBe(MOTS);
    expect(typeDeLaDictee([prof('[DICTEE] Le chat dort sur le lit. [/DICTEE]')])).toBe(PHRASES);
  });

  it('voit la dictée qui arrive encore en flux', () => {
    expect(typeDeLaDictee(
      [eleve('Une dictée de mots.')],
      'Tu l’écris où ? [DICTEE] un.',
    )).toBe(MOTS);
  });

  it('ne dit rien tant qu’aucune dictée n’est en vue', () => {
    expect(typeDeLaDictee([eleve('Une dictée de mots.')])).toBeNull();
  });
});
