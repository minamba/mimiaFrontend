/**
 * LA PAGE SE FIGE DERRIÈRE UNE FENÊTRE, ET REVIENT À SA PLACE APRÈS.
 *
 * Deux garanties : une fenêtre ouverte n'importe où bloque le défilement, et
 * la fermeture rend la page exactement où on l'avait laissée — un site qui
 * remonte en haut à chaque popup fermée est pire qu'un site qui défile.
 */

import { CLASSE_BLOQUEE, installerVerrouDefilement } from '../lib/storage/verrouDefilement';

const attendre = () => new Promise((fin) => { setTimeout(fin, 30); });

let desinstaller;

beforeEach(() => {
  document.body.innerHTML = '<main>la page</main>';
  window.scrollTo = jest.fn();
  Object.defineProperty(window, 'scrollY', { value: 420, configurable: true });
  desinstaller = installerVerrouDefilement();
});

afterEach(() => desinstaller());

test('une fenêtre ouverte fige la page à sa position', async () => {
  const fenetre = document.createElement('div');
  fenetre.className = 'modale';
  document.body.appendChild(fenetre);

  await attendre();

  expect(document.documentElement).toHaveClass(CLASSE_BLOQUEE);
  expect(document.body.style.position).toBe('fixed');
  expect(document.body.style.top).toBe('-420px');
});

test('la fermeture libère la page et la rend où elle était', async () => {
  const fenetre = document.createElement('div');
  fenetre.setAttribute('aria-modal', 'true');
  document.body.appendChild(fenetre);
  await attendre();

  fenetre.remove();
  await attendre();

  expect(document.documentElement).not.toHaveClass(CLASSE_BLOQUEE);
  expect(document.body.style.position).toBe('');
  expect(window.scrollTo).toHaveBeenCalledWith(0, 420);
});
