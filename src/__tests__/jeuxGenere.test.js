/**
 * LE CATALOGUE GÉNÉRÉ EST À JOUR — Camara, le 23/09/2026.
 *
 * L'API reçoit la liste des jeux par un fichier généré depuis le catalogue
 * (`scripts/jeux-vers-api.mjs`). Ce test compare la copie du front à ce que
 * le catalogue produit MAINTENANT : un jeu ajouté, renommé ou déplacé de
 * classe sans relancer le script fait tomber ce test, et le message dit quoi
 * faire. Sans lui, le professeur proposerait des jeux qui n'existent plus,
 * ou ignorerait les nouveaux.
 */

// `public/jeux.json` : servi avec le site, et relu par l'API toutes les heures.
import genere from '../../public/jeux.json';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';
import { FRISE } from '../lib/jeux/frise';

const attendu = FRISE.flatMap(({ code }) => jeuxDeLaClasse(code).map((jeu) => ({
  classe: code,
  cle: jeu.cle,
  titre: jeu.titre,
  matiereCode: jeu.matiereCode,
  competences: [...(jeu.competences ?? [])],
})));

describe('le catalogue passé à l’API', () => {
  it('est à jour — sinon : node scripts/jeux-vers-api.mjs, puis republier l’API', () => {
    expect(genere).toEqual(attendu);
  });

  it('nomme chaque jeu par sa classe, sa clé, son titre, sa matière et ses compétences', () => {
    genere.forEach((ligne) => {
      expect(ligne.classe).toBeTruthy();
      expect(ligne.cle).toBeTruthy();
      expect(ligne.titre).toBeTruthy();
      expect(['MATHS', 'FRANCAIS']).toContain(ligne.matiereCode);
      expect(ligne.competences.length).toBeGreaterThan(0);
    });
  });

  it('couvre les cinq classes du primaire', () => {
    const classes = new Set(genere.map((l) => l.classe));
    ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].forEach((c) => expect(classes.has(c)).toBe(true));
  });
});

/**
 * LA LISTE ENVOYÉE AU PROFESSEUR NE DOIT PAS DEVENIR UN ANNUAIRE.
 *
 * Camara, le 23/09/2026 : « garde bien ça en tête, ça risque d'arriver super
 * vite ». Justement : ni sa mémoire ni la mienne ne sont un bon gardien, donc
 * c'est ce test qui surveille.
 *
 * CE QUI SE PASSE QUAND ELLE GROSSIT. Le contexte de chaque séance porte TOUS
 * les jeux de la classe dans la matière — 15 au plus aujourd'hui (CM1 maths).
 * À quarante, deux choses se dégradent : la consigne s'alourdit, et surtout le
 * professeur CHOISIT MOINS BIEN, parce qu'il trie quarante propositions dont
 * trente-huit n'ont rien à voir avec la séance du jour.
 *
 * CE QU'IL FAUDRA FAIRE, quand ce test tombera : ne plus lister toute la
 * classe, mais seulement les jeux du DOMAINE travaillé — « Nombres et
 * calculs », « Géométrie »… Chaque compétence du référentiel porte son domaine
 * (`Competence.Domaine`), et le catalogue porte les codes de compétence : le
 * filtre se pose dans `JeuxService.PourLaSeanceAsync` côté API, sans toucher
 * au front. Voir la note de mémoire « Jeux proposés par le professeur ».
 *
 * PAS AVANT. À quinze lignes, filtrer ne gagnerait rien et ferait perdre au
 * professeur des jeux qu'il aurait pu proposer si le domaine était mal
 * identifié. Tout avoir sous les yeux reste le plus sûr tant que c'est court.
 */
describe('la longueur de la liste envoyée au professeur', () => {
  const SEUIL = 25;

  it(`reste sous ${SEUIL} jeux par classe et par matière — voir la note au-dessus si ce test tombe`, () => {
    const compte = {};
    genere.forEach((l) => {
      const cle = `${l.classe} / ${l.matiereCode}`;
      compte[cle] = (compte[cle] ?? 0) + 1;
    });

    const trop = Object.entries(compte)
      .filter(([, n]) => n > SEUIL)
      .map(([cle, n]) => `${cle} : ${n} jeux`);

    expect(trop).toEqual([]);
  });
});
