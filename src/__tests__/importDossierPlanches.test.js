/**
 * IMPORTER UN DOSSIER DE SCHÉMAS — Camara, le 20/10/2026 : classes › matières ›
 * schémas, chacun avec sa version « -muette ».
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ImportDossierPlanches from '../components/ImportDossierPlanches';
import { analyserDossier, dejaAJour, licencesCitees } from '../lib/planches/importDossier';
import { importerPlanche } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({ importerPlanche: jest.fn() }));

const fichier = (chemin, contenu = 'x', type = 'image/png') => {
  const f = new File([contenu], chemin.split('/').pop(), { type });
  Object.defineProperty(f, 'webkitRelativePath', { value: chemin });
  return f;
};

const FIGURES = [
  { cle: 'svt-respiratoire', titre: 'Appareil respiratoire', niveau: '5e' },
  { cle: 'hg-empire-ottoman', titre: 'L’Empire ottoman', niveau: '1re' },
];
const matiere = (cle) => ({ code: cle.startsWith('svt') ? 'SVT' : 'HISTOIRE_GEO' });

const DOSSIER = () => [
  fichier('schemas/5e/SVT/svt-respiratoire.png', 'legende'),
  fichier('schemas/5e/SVT/svt-respiratoire-muette.png', 'muette'),
  fichier('schemas/5e/SVT/sources/svt-respiratoire/illustration-originale.png'),
  fichier('schemas/5e/SVT/controles/rapport.png'),
  fichier('schemas/5e/LIRE-MOI-LICENCES.txt', 'licences', 'text/plain'),
  fichier('schemas/1re/HGGSP/hg-empire-ottoman.png'),
  fichier('schemas/1re/HGGSP/hg-empire-ottoman-muette.png'),
  fichier('schemas/1re/HGGSP/sources/hg-empire-ottoman/CREDITS.txt', 'Ourednik, GPL-3.0 ; Natural Earth : domaine public.', 'text/plain'),
  fichier('schemas/2de/SVT/svt-inconnu.png'),
  fichier('schemas/2de/SVT/svt-inconnu-muette.png'),
];

describe('l’analyse du dossier', () => {
  it('range les paires, écarte sources et contrôles, repère crédits et inconnus', () => {
    const r = analyserDossier(DOSSIER(), FIGURES, matiere);

    expect(r.paires.map((p) => p.cle)).toEqual(['hg-empire-ottoman', 'svt-respiratoire']);
    const svt = r.paires.find((p) => p.cle === 'svt-respiratoire');
    expect(svt.legende.name).toBe('svt-respiratoire.png');
    expect(svt.muette.name).toBe('svt-respiratoire-muette.png');
    expect(svt.niveau).toBe('5e');
    expect(svt.credits).toBeNull();
    expect(r.paires.find((p) => p.cle === 'hg-empire-ottoman').credits.name).toBe('CREDITS.txt');
    expect(r.inconnus.map((i) => i.cle)).toEqual(['svt-inconnu']);
    expect(r.ignores).toBe(3);
  });

  it('signale une moitié de paire', () => {
    const r = analyserDossier([fichier('schemas/5e/SVT/svt-respiratoire.png')], FIGURES, matiere);
    expect(r.incompletes).toEqual([{ cle: 'svt-respiratoire', manque: 'muette' }]);
    expect(r.paires).toHaveLength(1);
  });

  it('lit les licences d’un crédit, écrites toujours pareil', () => {
    expect(licencesCitees('CC BY-SA 3.0 … gpl-3.0 … odbl … Domaine public … CC BY-SA 3.0'))
      .toBe('CC BY-SA 3.0, GPL-3.0, ODbL, domaine public');
  });

  it('une planche de même taille est à jour', () => {
    expect(dejaAJour({ taille: 7 }, { size: 7 })).toBe(true);
    expect(dejaAJour({ taille: 7 }, { size: 8 })).toBe(false);
    expect(dejaAJour(null, { size: 8 })).toBe(false);
  });
});

it('l’écran annonce le bilan, puis envoie la légendée avant sa muette, sans attendre les descriptions', async () => {
  importerPlanche.mockResolvedValue({ data: {} });
  const fini = jest.fn();
  render(<ImportDossierPlanches figures={FIGURES} matiereDeLaCle={matiere} importees={[]} onTermine={fini} />);

  fireEvent.change(screen.getByTestId('dossier-planches'), { target: { files: DOSSIER() } });
  expect(screen.getByText(/sans emplacement au catalogue/)).toHaveTextContent('svt-inconnu');
  expect(importerPlanche).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Importer 2 schémas' }));
  await waitFor(() => expect(fini).toHaveBeenCalled());

  expect(importerPlanche).toHaveBeenCalledTimes(4);
  const appels = importerPlanche.mock.calls.map(([a]) => `${a.cle}/${a.variante ?? 'legende'}`);
  expect(appels.indexOf('svt-respiratoire/legende')).toBeLessThan(appels.indexOf('svt-respiratoire/muette'));
  expect(importerPlanche.mock.calls.every(([a]) => a.differer === true)).toBe(true);

  const ottoman = importerPlanche.mock.calls.find(([a]) => a.cle === 'hg-empire-ottoman')[0];
  expect(ottoman).toMatchObject({ maison: false, licence: 'GPL-3.0, domaine public', niveau: '1re', matiereCode: 'HISTOIRE_GEO' });
  expect(importerPlanche.mock.calls.find(([a]) => a.cle === 'svt-respiratoire')[0].maison).toBe(true);
  expect(screen.getByText(/Import terminé/)).toBeInTheDocument();
});
