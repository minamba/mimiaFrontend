/**
 * LES FILTRES DE L'ADMINISTRATION NE SURVIVENT PAS À LA VISITE.
 *
 * Relevé en séance : on cherche « ceo » dans l'onglet Parents, on quitte par
 * « Mes enfants », on revient — un seul parent s'affiche, et le champ de
 * recherche est VIDE. L'écran annonçait donc « aucun filtre » au-dessus d'une
 * liste filtrée, et il fallait recharger la page pour s'en sortir.
 *
 * Deux défauts se superposaient, et il fallait les deux pour produire ça :
 *
 * 1. les filtres vivent dans le store, qui survit au démontage de l'écran ;
 * 2. le champ de saisie repartait de la chaîne vide, alors que son propre
 *    commentaire affirmait qu'il partait « de ce que le store contient ».
 *
 * Corriger l'un sans l'autre laissait la moitié du défaut : sans le premier,
 * on revenait avec « ceo » écrit dans le champ — cohérent, mais toujours
 * surprenant ; sans le second, l'écran pouvait encore mentir le jour où un
 * autre chemin laisserait un filtre derrière lui.
 */

import reducteur from '../lib/reducers/adminReducer';
import { reinitialiserFiltres, rechercher, filtrerParEleve } from '../lib/actions/adminActions';

test('la remise à plat efface tous les filtres', () => {
  const filtre = {
    recherche: 'ceo',
    rechercheEleve: 'Bilal',
    eleveFiltre: '9',
    parentFiltre: { id: 10, nom: 'Camara' },
  };

  const apres = reducteur(filtre, reinitialiserFiltres());

  expect(apres.recherche).toBe('');
  expect(apres.rechercheEleve).toBe('');
  expect(apres.eleveFiltre).toBe('');
  expect(apres.parentFiltre).toBeNull();
});

test('elle ne touche pas aux données déjà chargées', () => {
  // Les vider ferait clignoter l'écran au retour : elles seront rechargées au
  // montage suivant, sans filtre cette fois.
  const etat = {
    recherche: 'ceo',
    parents: [{ id: 10 }, { id: 11 }],
    eleves: [{ id: 9 }],
    resume: { nombreParents: 2 },
  };

  const apres = reducteur(etat, reinitialiserFiltres());

  expect(apres.parents).toHaveLength(2);
  expect(apres.eleves).toHaveLength(1);
  expect(apres.resume).toEqual({ nombreParents: 2 });
});

test('les filtres se posent toujours normalement', () => {
  // Le garde-fou de l'autre sens : une remise à plat qui écraserait les
  // actions ordinaires rendrait la recherche inutilisable.
  const avecRecherche = reducteur({ recherche: '' }, rechercher('emma'));
  expect(avecRecherche.recherche).toBe('emma');

  const avecEleve = reducteur({ eleveFiltre: '' }, filtrerParEleve('9'));
  expect(avecEleve.eleveFiltre).toBe('9');
});
