import httpClient from './httpClient';

export const getNiveaux = () => httpClient.get('/referentiel/niveaux');

// `toutes` inclut les matières encore fermées : l'élève doit voir ce qui
// arrive, sinon le produit paraît se résumer aux mathématiques. C'est le front
// qui les rend non cliquables, à partir du drapeau `active`.
export const getMatieres = () => httpClient.get('/referentiel/matieres', {
  params: { toutes: true },
});

/**
 * L'équipe pédagogique, pour la page d'accueil.
 *
 * SEULE ROUTE PUBLIQUE DU RÉFÉRENTIEL. La page d'accueil s'adresse à quelqu'un
 * qui n'a pas encore de compte : elle ne peut donc pas passer par les routes
 * qui exigent un jeton. Le serveur ne renvoie ici que des prénoms inventés,
 * des visages dessinés et des noms de matières — ce que le site affiche déjà.
 *
 * Un professeur par VISAGE et non par matière : Yann en tient deux, et le
 * regroupement est fait côté serveur pour qu'il ne soit pas à refaire partout.
 */
export const getEquipe = () => httpClient.get('/referentiel/equipe');
