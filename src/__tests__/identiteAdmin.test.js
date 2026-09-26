import {
  etapesIdentite, sansSub, toucheAuxIdentifiants,
} from '../lib/utils/identiteAdmin';

/**
 * CHANGER L'ADRESSE D'UN PARENT DEPUIS L'ADMINISTRATION — Camara, le
 * 23/09/2026 : « j'ai changé l'adresse mail d'un parent dans l'onglet
 * administrateur, mais elle ne peut plus se connecter ».
 *
 * CE QUE CES TESTS PROTÈGENT, ET CE QUE CHACUN COÛTERAIT
 * -----------------------------------------------------
 * 1. L'ADRESSE EST L'IDENTIFIANT DE CONNEXION, et elle vit dans une AUTRE base
 *    que la fiche. Si l'étape de renommage disparaissait, on retomberait dans
 *    le défaut d'origine : un parent qui reçoit ses bilans à la nouvelle
 *    adresse et ne peut entrer qu'avec l'ancienne. Aucune donnée perdue — la
 *    fiche tient au `sub` — mais un compte injoignable.
 *
 * 2. LA CLÉ EST LE `sub`, JAMAIS L'ADRESSE. C'est la deuxième correction du
 *    même jour, et elle vient d'un échec en production : keyée sur l'adresse
 *    de l'écran — celle de la base métier —, la route de réparation ne
 *    trouvait personne côté identité sur un compte justement désynchronisé.
 *    Elle échouait exactement sur les comptes qu'elle devait réparer.
 *
 * 3. ON NE DEVINE PLUS SI L'ADRESSE A CHANGÉ. L'écran ne voit qu'une des deux
 *    bases : comparer avec elle, c'est comparer avec la mauvaise. L'adresse
 *    part à chaque enregistrement et c'est le serveur, qui voit l'identité,
 *    qui tranche. Un test le verrouille : sans lui, quelqu'un « optimisera »
 *    un jour l'appel en le conditionnant de nouveau à l'écran, et les comptes
 *    désynchronisés redeviendront irréparables.
 */

describe('la clé du compte', () => {
  test('l’adresse part avec le sub, à chaque enregistrement', () => {
    const etapes = etapesIdentite({
      sub: 'a1b2c3',
      mail: 'nouveau@exemple.fr',
    });

    expect(etapes.erreur).toBeNull();
    expect(etapes.adresse).toEqual({ sub: 'a1b2c3', email: 'nouveau@exemple.fr' });
  });

  test('elle part MÊME si rien ne semble avoir changé à l’écran', () => {
    // LE POINT CENTRAL. L'écran affiche l'adresse de la base MÉTIER ; si
    // l'identité en porte une autre, « rien n'a changé » est faux. C'est le
    // serveur qui compare, à ce que l'identité porte vraiment, et qui répare.
    expect(etapesIdentite({
      sub: 'a1b2c3',
      mail: 'inchange@exemple.fr',
    }).adresse).toEqual({ sub: 'a1b2c3', email: 'inchange@exemple.fr' });
  });

  test('sans sub, on n’appelle rien plutôt que d’appeler au hasard', () => {
    // Une fiche jamais reliée à une identité. Elle s'enregistre seule.
    expect(etapesIdentite({ mail: 'nouveau@exemple.fr' })).toEqual({
      erreur: null, adresse: null, motDePasse: null,
    });
  });

  test('un sub fait d’espaces ne vaut pas un sub', () => {
    expect(etapesIdentite({ sub: '   ', mail: 'nouveau@exemple.fr' }).adresse).toBeNull();
  });

  test('l’adresse part rognée, jamais avec les espaces de la saisie', () => {
    expect(etapesIdentite({
      sub: ' a1b2c3 ',
      mail: '  nouveau@exemple.fr  ',
    }).adresse).toEqual({ sub: 'a1b2c3', email: 'nouveau@exemple.fr' });
  });

  test('une adresse vidée ne renomme rien', () => {
    // Le champ n'est obligatoire qu'à la création. L'effacer veut dire « je ne
    // touche pas à la connexion » — surtout pas « pose une adresse vide », qui
    // rendrait le compte définitivement inaccessible.
    expect(etapesIdentite({ sub: 'a1b2c3', mail: '   ' }).adresse).toBeNull();
  });
});

describe('le mot de passe', () => {
  test('vide : aucune étape, et ce n’est pas une erreur', () => {
    expect(etapesIdentite({
      sub: 'a1b2c3', mail: 'parent@exemple.fr', motDePasse: '', confirmation: '',
    }).motDePasse).toBeNull();
  });

  test('deux saisies différentes arrêtent tout, y compris le renommage', () => {
    // La saisie est fautive : on ne joue AUCUNE étape. Renommer d'abord puis
    // échouer laisserait l'administrateur devant une erreur, en ignorant que
    // l'adresse, elle, a bougé.
    const etapes = etapesIdentite({
      sub: 'a1b2c3',
      mail: 'nouveau@exemple.fr',
      motDePasse: 'Motdepasse1',
      confirmation: 'Motdepasse2',
    });

    expect(etapes.erreur).toMatch(/ne sont pas identiques/);
    expect(etapes.adresse).toBeNull();
    expect(etapes.motDePasse).toBeNull();
  });

  test('il vise le sub, pas une adresse', () => {
    // C'est ce qui rend l'ordre des deux appels indifférent : la route du mot
    // de passe ne dépend plus de l'adresse, donc plus de son renommage.
    expect(etapesIdentite({
      sub: 'a1b2c3',
      mail: 'nouveau@exemple.fr',
      motDePasse: 'Motdepasse1',
      confirmation: 'Motdepasse1',
    }).motDePasse).toEqual({ sub: 'a1b2c3', valeur: 'Motdepasse1' });
  });

  test('sans sub, aucun mot de passe ne part', () => {
    expect(etapesIdentite({
      mail: 'parent@exemple.fr', motDePasse: 'Motdepasse1', confirmation: 'Motdepasse1',
    }).motDePasse).toBeNull();
  });
});

describe('toucheAuxIdentifiants', () => {
  test('un compte relié avec une adresse : oui, on laisse le serveur juger', () => {
    expect(toucheAuxIdentifiants({
      sub: 'a1b2c3', mail: 'parent@exemple.fr', prenom: 'Sofia', nom: 'Benali',
    })).toBe(true);
  });

  test('une fiche sans identité rattachée : non', () => {
    expect(toucheAuxIdentifiants({
      mail: 'parent@exemple.fr', prenom: 'Sofia', nom: 'Benali',
    })).toBe(false);
  });

  test('une adresse vidée : non', () => {
    expect(toucheAuxIdentifiants({ sub: 'a1b2c3', mail: '', nom: 'Benali' })).toBe(false);
  });

  test('une saisie de mot de passe fautive : oui, pour que la raison s’affiche', () => {
    // Sinon la fiche partirait en silence et les deux mots de passe
    // discordants seraient simplement oubliés, sans un mot.
    expect(toucheAuxIdentifiants({
      sub: 'a1b2c3', mail: 'parent@exemple.fr',
      motDePasse: 'Motdepasse1', confirmation: 'autre',
    })).toBe(true);
  });
});

describe('sansSub', () => {
  test('retire la clé de l’autre base, garde le reste', () => {
    expect(sansSub({
      prenom: 'Sofia', nom: 'Benali', mail: 'nouveau@exemple.fr', sub: 'a1b2c3',
    })).toEqual({ prenom: 'Sofia', nom: 'Benali', mail: 'nouveau@exemple.fr' });
  });

  test('supporte l’absence de données', () => {
    expect(sansSub()).toEqual({});
  });
});
