/**
 * LA CARTE « COPIE DU CONTRÔLE » — ce que l'élève voit et touche.
 *
 * Voulu par Camara le 13/09/2026 : Oui/Non d'abord, puis trois boutons si
 * oui, deux si non. Un bouton dont la pièce est arrivée disparaît.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopieControle from '../components/CopieControle';

const ETAT = (surcharges = {}) => ({
  controleId: 42, separee: null, enonceRecu: false, copieRecue: false, complet: false, ...surcharges,
});

test('la question d’abord, avec Oui et Non — et le choix remonte', async () => {
  const onChoisir = jest.fn();
  render(<CopieControle etat={ETAT()} onChoisir={onChoisir} onFichier={jest.fn()} />);

  expect(screen.getByText('L’énoncé et ta copie sont-ils séparés ?')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Oui' }));
  expect(onChoisir).toHaveBeenCalledWith(true);

  await userEvent.click(screen.getByRole('button', { name: 'Non' }));
  expect(onChoisir).toHaveBeenCalledWith(false);

  expect(screen.queryByText(/Importer/)).not.toBeInTheDocument();
});

test('OUI : les trois boutons, et l’énoncé importé part étiqueté « enonce »', async () => {
  const onFichier = jest.fn();
  render(<CopieControle etat={ETAT({ separee: true })} onChoisir={jest.fn()} onFichier={onFichier} />);

  expect(screen.getByText('Importer l’énoncé')).toBeInTheDocument();
  expect(screen.getByText('Importer ma copie')).toBeInTheDocument();
  expect(screen.getByText('Scanner ma copie')).toBeInTheDocument();

  const fichier = new File(['x'], 'enonce.jpg', { type: 'image/jpeg' });
  await userEvent.upload(screen.getByLabelText(/Importer l’énoncé/), fichier);

  expect(onFichier).toHaveBeenCalledWith('enonce', fichier);
});

test('NON : pas d’énoncé à envoyer — deux boutons seulement', () => {
  render(<CopieControle etat={ETAT({ separee: false })} onChoisir={jest.fn()} onFichier={jest.fn()} />);

  expect(screen.queryByText('Importer l’énoncé')).not.toBeInTheDocument();
  expect(screen.getByText('Importer ma copie')).toBeInTheDocument();
  expect(screen.getByText('Scanner ma copie')).toBeInTheDocument();
});

test('ce qui est reçu est coché, et son bouton disparaît', () => {
  render(
    <CopieControle
      etat={ETAT({ separee: true, enonceRecu: true })}
      onChoisir={jest.fn()}
      onFichier={jest.fn()}
    />,
  );

  expect(screen.getByText(/L’énoncé — reçue/)).toBeInTheDocument();
  expect(screen.getByText(/Ta copie — en attente/)).toBeInTheDocument();
  expect(screen.queryByText('Importer l’énoncé')).not.toBeInTheDocument();
});

test('tout reçu : plus aucun bouton', () => {
  render(
    <CopieControle
      etat={ETAT({ separee: false, copieRecue: true, complet: true })}
      onChoisir={jest.fn()}
      onFichier={jest.fn()}
    />,
  );

  expect(screen.getByText(/Ton professeur a tout ce qu’il faut/)).toBeInTheDocument();
  expect(screen.queryByText(/Importer|Scanner/)).not.toBeInTheDocument();
});

test('avec une caméra de séance, « Scanner ma copie » l’ouvre au lieu d’un sélecteur', async () => {
  const onScanner = jest.fn();
  render(
    <CopieControle
      etat={ETAT({ separee: false })}
      onChoisir={jest.fn()}
      onFichier={jest.fn()}
      onScanner={onScanner}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: /Scanner ma copie/ }));
  expect(onScanner).toHaveBeenCalled();
});
