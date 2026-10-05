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

  // « L'énoncé » est masculin : reçu, pas reçue.
  expect(screen.getByText(/L’énoncé — reçu$/)).toBeInTheDocument();
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

describe('comment corriger — la carte, une fois la copie reçue (Camara, 26/09/2026)', () => {
  const COMPLETE = (style = null, surcharges = {}) => ETAT({
    separee: false, copieRecue: true, complet: true, erreur: 2, total: 4, style, termine: false, ...surcharges,
  });

  test('avant la première erreur : pas encore de question', () => {
    render(<CopieControle etat={COMPLETE(null, { erreur: null })} onChoisir={jest.fn()} onFichier={jest.fn()} onStyle={jest.fn()} />);

    expect(screen.getByText(/va te montrer ta première erreur/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('la question porte sur L’ERREUR EN COURS, et le choix remonte', async () => {
    const onStyle = jest.fn();
    render(<CopieControle etat={COMPLETE()} onChoisir={jest.fn()} onFichier={jest.fn()} onStyle={onStyle} />);

    expect(screen.getByText('Erreur 2 sur 4 : comment veux-tu la corriger ?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Je t’aide à te corriger' }));
    expect(onStyle).toHaveBeenLastCalledWith('aide');

    await userEvent.click(screen.getByRole('button', { name: 'Je corrige et t’explique' }));
    expect(onStyle).toHaveBeenLastCalledWith('explique');
  });

  test('en « Je t’aide », seul l’enfant peut demander la correction expliquée', async () => {
    const onStyle = jest.fn();
    render(<CopieControle etat={COMPLETE('aide')} onChoisir={jest.fn()} onFichier={jest.fn()} onStyle={onStyle} />);

    expect(screen.getByText(/sans te donner la réponse/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Finalement, corrige et explique-moi' }));
    expect(onStyle).toHaveBeenCalledWith('explique');
  });

  test('en « Je corrige et t’explique », plus de bouton de changement', () => {
    render(<CopieControle etat={COMPLETE('explique')} onChoisir={jest.fn()} onFichier={jest.fn()} onStyle={jest.fn()} />);

    expect(screen.getByText(/t’explique pourquoi/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('la correction terminée se dit, sans bouton', () => {
    render(<CopieControle etat={COMPLETE(null, { termine: true })} onChoisir={jest.fn()} onFichier={jest.fn()} onStyle={jest.fn()} />);

    expect(screen.getByText(/Correction terminée/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('la file de la copie — la carte (Camara, 26/09/2026)', () => {
  test('l’énoncé importé est coché et attend la copie ; son bouton disparaît, il se retire', async () => {
    const onRetirer = jest.fn();
    render(
      <CopieControle
        etat={ETAT({ separee: true })}
        importes={{ enonce: true, copie: false }}
        onChoisir={jest.fn()}
        onFichier={jest.fn()}
        onRetirer={onRetirer}
      />,
    );

    expect(screen.getByText(/les deux partiront ensemble/)).toBeInTheDocument();
    expect(screen.getByText(/L’énoncé — importé/)).toBeInTheDocument();
    expect(screen.queryByText('Importer l’énoncé')).not.toBeInTheDocument();
    expect(screen.getByText('Importer ma copie')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retirer l’énoncé' }));
    expect(onRetirer).toHaveBeenCalledWith('enonce');
  });
});

describe('les moyens pour chaque feuille (Camara, 26/09/2026)', () => {
  test('avec une caméra : importer, photographier et scanner, pour l’énoncé comme pour la copie', async () => {
    const onPhoto = jest.fn();
    const onScanner = jest.fn();
    render(
      <CopieControle
        etat={ETAT({ separee: true })}
        onChoisir={jest.fn()}
        onFichier={jest.fn()}
        onPhoto={onPhoto}
        onScanner={onScanner}
      />,
    );

    expect(screen.getByText('Importer l’énoncé')).toBeInTheDocument();
    expect(screen.getByText('Scanner l’énoncé')).toBeInTheDocument();
    expect(screen.getByText('Importer ma copie')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Photographier ma copie/ }));
    expect(onPhoto).toHaveBeenCalledWith('copie');

    await userEvent.click(screen.getByRole('button', { name: /Scanner l’énoncé/ }));
    expect(onScanner).toHaveBeenCalledWith('enonce');
  });

  test('sans caméra, pas de bouton « Photographier »', () => {
    render(<CopieControle etat={ETAT({ separee: false })} onChoisir={jest.fn()} onFichier={jest.fn()} />);
    expect(screen.queryByText(/Photographier/)).not.toBeInTheDocument();
  });
});
