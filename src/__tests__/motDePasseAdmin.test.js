import { lireMotDePasse, sansMotDePasse } from '../lib/utils/motDePasseAdmin';

/**
 * LES DEUX CHAMPS DE MOT DE PASSE DE L'ADMINISTRATION — Camara, le 17/09/2026 :
 * « je dois créer aussi le mot de passe… et quand je crée le compte, il doit
 * être directement actif », puis « je peux réinitialiser le mot de passe du
 * parent directement quand je vais dans les modifications ».
 *
 * CE QUE CES TESTS PROTÈGENT, ET CE QUE CHACUN COÛTERAIT
 * -----------------------------------------------------
 * 1. UN CHAMP VIDE N'EST PAS UN MOT DE PASSE. La fenêtre de modification sert
 *    d'abord à corriger un nom : traiter le vide comme une saisie couperait les
 *    sessions d'un parent qu'on venait renommer, sans que personne comprenne.
 * 2. DEUX SAISIES DIFFÉRENTES NE PASSENT PAS. Sinon on pose un mot de passe que
 *    personne ne connaît — et que l'administrateur croit pourtant avoir donné
 *    de vive voix. Le parent ne s'en aperçoit qu'en n'arrivant pas à se
 *    connecter, et personne ne pense d'abord à ça.
 * 3. LE MOT DE PASSE NE PART PAS DANS LA FICHE. L'API métier l'ignorerait, mais
 *    il serait passé en clair dans une route qui n'a rien à en faire, et il
 *    resterait dans ses journaux.
 */

describe('lireMotDePasse', () => {
  test('rien de saisi : on n’envoie rien, et ce n’est pas une erreur', () => {
    expect(lireMotDePasse({ motDePasse: '', confirmation: '' }))
      .toEqual({ envoyer: false, valeur: undefined, erreur: null });
  });

  test('des espaces seules ne sont pas un mot de passe', () => {
    expect(lireMotDePasse({ motDePasse: '   ', confirmation: '   ' }).envoyer).toBe(false);
  });

  test('champs absents : on n’envoie rien', () => {
    expect(lireMotDePasse({}).envoyer).toBe(false);
    expect(lireMotDePasse().envoyer).toBe(false);
  });

  test('une confirmation restée pleine pendant qu’on efface n’est pas une faute', () => {
    // C'est un changement d'avis : on avait commencé à saisir, on renonce.
    expect(lireMotDePasse({ motDePasse: '', confirmation: 'Motdepasse1' }))
      .toEqual({ envoyer: false, valeur: undefined, erreur: null });
  });

  test('deux saisies identiques passent, telles quelles', () => {
    expect(lireMotDePasse({ motDePasse: 'Motdepasse1', confirmation: 'Motdepasse1' }))
      .toEqual({ envoyer: true, valeur: 'Motdepasse1', erreur: null });
  });

  test('deux saisies différentes sont refusées, et le disent', () => {
    const lu = lireMotDePasse({ motDePasse: 'Motdepasse1', confirmation: 'Motdepasse2' });

    expect(lu.envoyer).toBe(false);
    expect(lu.valeur).toBeUndefined();
    expect(lu.erreur).toMatch(/pas identiques/i);
  });

  test('une différence d’espace compte comme une différence', () => {
    // Deux mots de passe qui ne diffèrent que par une espace finale SONT deux
    // mots de passe différents : les accepter en poserait un que
    // l'administrateur ne relira pas comme il l'a tapé.
    expect(lireMotDePasse({ motDePasse: 'Motdepasse1 ', confirmation: 'Motdepasse1' }).erreur)
      .toMatch(/pas identiques/i);
  });

  test('les espaces du mot de passe lui-même ne sont pas rognées', () => {
    expect(lireMotDePasse({ motDePasse: ' Motdepasse1 ', confirmation: ' Motdepasse1 ' }).valeur)
      .toBe(' Motdepasse1 ');
  });
});

describe('sansMotDePasse', () => {
  test('les deux champs sont retirés, le reste est intact', () => {
    const fiche = sansMotDePasse({
      prenom: 'Nora',
      nom: 'Belkacem',
      mail: 'nora@exemple.fr',
      motDePasse: 'Motdepasse1',
      confirmation: 'Motdepasse1',
    });

    expect(fiche).toEqual({ prenom: 'Nora', nom: 'Belkacem', mail: 'nora@exemple.fr' });
    expect(fiche).not.toHaveProperty('motDePasse');
    expect(fiche).not.toHaveProperty('confirmation');
  });

  test('une fiche qui n’en porte pas n’est pas abîmée', () => {
    expect(sansMotDePasse({ prenom: 'Nora' })).toEqual({ prenom: 'Nora' });
    expect(sansMotDePasse()).toEqual({});
  });
});
