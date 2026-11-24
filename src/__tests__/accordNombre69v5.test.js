/**
 * SIGNALEMENT #69 v5 (24/11/2026) — retours d'Omar sur a0682a3, point 1 : import d'un dossier de schémas
 * (ImportDossierPlanches.js), « 1 déjà à jour, sautés » et « 1 sans emplacement au catalogue, non importés ».
 * Monté sur le VRAI composant, avec n = 1 et n = 2.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import ImportDossierPlanches from '../components/ImportDossierPlanches';

jest.mock('../lib/api/adminApi', () => ({ importerPlanche: jest.fn() }));

const FIGURES = [
  { cle: 'svt-respiratoire', titre: 'Appareil respiratoire', niveau: '5e' },
  { cle: 'svt-digestif', titre: 'Appareil digestif', niveau: '5e' },
];

const fichier = (chemin) => {
  const f = new File(['x'], chemin.split('/').pop(), { type: 'image/png' });
  Object.defineProperty(f, 'webkitRelativePath', { value: chemin });
  return f;
};

const ouvrir = (fichiers, importees = []) => {
  render(<ImportDossierPlanches figures={FIGURES} matiereDeLaCle={() => ({ code: 'SVT' })} importees={importees} onTermine={jest.fn()} />);
  fireEvent.change(screen.getByTestId('dossier-planches'), { target: { files: fichiers } });
};

// Un schéma déjà importé à la même taille (1 octet, comme le fichier de test) est « déjà à jour ».
const importee = (cle) => ({ cle, variante: 'legende', taille: 1 });

describe('administration, import de schémas : « sauté » et « non importé » accordés au nombre', () => {
  test('un seul schéma déjà à jour : « 1 déjà à jour, sauté »', () => {
    ouvrir([fichier('schemas/5e/SVT/svt-respiratoire.png')], [importee('svt-respiratoire')]);
    expect(screen.getByText(/déjà à jour/).textContent).toMatch(/· 1 déjà à jour, sauté$/);
  });

  test('deux schémas déjà à jour : « 2 déjà à jour, sautés »', () => {
    ouvrir([fichier('schemas/5e/SVT/svt-respiratoire.png'), fichier('schemas/5e/SVT/svt-digestif.png')],
      [importee('svt-respiratoire'), importee('svt-digestif')]);
    expect(screen.getByText(/déjà à jour/).textContent).toMatch(/· 2 déjà à jour, sautés$/);
  });

  test('un seul schéma sans emplacement : « 1 sans emplacement au catalogue, non importé : »', () => {
    ouvrir([fichier('schemas/5e/SVT/svt-inconnu.png')]);
    expect(screen.getByText(/sans emplacement au catalogue/).textContent)
      .toMatch(/^1 sans emplacement au catalogue, non importé : svt-inconnu/);
  });

  test('deux schémas sans emplacement : « 2 sans emplacement au catalogue, non importés : »', () => {
    ouvrir([fichier('schemas/5e/SVT/svt-inconnu.png'), fichier('schemas/5e/SVT/svt-autre.png')]);
    expect(screen.getByText(/sans emplacement au catalogue/).textContent)
      .toMatch(/^2 sans emplacement au catalogue, non importés : /);
  });
});
