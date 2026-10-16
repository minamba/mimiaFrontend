/**
 * L'API DES FICHES, POUR LE PARENT (16/10/2026) : les mêmes fonctions, à
 * l'adresse de l'espace parent, et la catégorie à la place de la matière.
 */
import httpClient from '../lib/api/httpClient';
import { creerCours, getMesFiches, modifierCours } from '../lib/api/mesFichesApi';

jest.mock('../lib/api/httpClient', () => ({ get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() }));

describe('l’API des fiches', () => {
  it('un élève garde son adresse et sa matière', () => {
    getMesFiches(7);
    creerCours(7, 2, 'classique');
    expect(httpClient.get).toHaveBeenCalledWith('/eleves/7/mes-fiches');
    expect(httpClient.post).toHaveBeenCalledWith('/eleves/7/mes-fiches/cours', { matiereId: 2, type: 'classique' });
  });

  it('le parent : son espace, et sa catégorie', () => {
    getMesFiches('parent');
    creerCours('parent', 3, 'express');
    modifierCours('parent', 12, 3, 'classique');
    expect(httpClient.get).toHaveBeenCalledWith('/parents/moi/mes-fiches');
    expect(httpClient.post).toHaveBeenCalledWith('/parents/moi/mes-fiches/cours', { categorieId: 3, type: 'express' });
    expect(httpClient.put).toHaveBeenCalledWith('/parents/moi/mes-fiches/cours/12', { categorieId: 3, type: 'classique' });
  });

  it('« Sans catégorie » part comme aucune catégorie', () => {
    creerCours('parent', 'aucune', 'classique', 5);
    expect(httpClient.post).toHaveBeenCalledWith('/parents/moi/mes-fiches/cours', { categorieId: null, type: 'classique', complementDe: 5 });
  });
});
