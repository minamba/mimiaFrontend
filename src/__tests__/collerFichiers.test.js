/**
 * COLLER UNE CAPTURE DANS UN SIGNALEMENT (11/11/2026) : Ctrl+V joint l'image du presse-papiers ; le texte collé dans
 * la description reste du texte.
 */
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useState } from 'react';
import ChoixPiecesSignalement from '../components/ChoixPiecesSignalement';
import { fichiersDuPressePapier, nommerFichierColle, prendreLesFichiers } from '../lib/collerFichiers';

const MAINTENANT = new Date(2026, 10, 11, 18, 5, 9);
const image = (nom = 'image.png') => new File(['xxxx'], nom, { type: 'image/png' });
const donnees = ({ fichiers = [], texte = '' } = {}) => ({
  files: fichiers,
  items: [],
  getData: (type) => (type === 'text/plain' ? texte : ''),
});

describe('le nom d’une capture collée', () => {
  test('« image.png » devient un nom horodaté', () => {
    expect(nommerFichierColle(image(), 0, MAINTENANT).name).toBe('capture-20261111-180509.png');
    expect(nommerFichierColle(image(), 1, MAINTENANT).name).toBe('capture-20261111-180509-2.png');
  });

  test('un vrai nom de fichier est gardé', () => {
    expect(nommerFichierColle(image('bug-nora.png'), 0, MAINTENANT).name).toBe('bug-nora.png');
  });

  test('les fichiers se lisent aussi par `items`', () => {
    const fichier = image();
    const lus = fichiersDuPressePapier({ files: [], items: [{ kind: 'string' }, { kind: 'file', getAsFile: () => fichier }] }, MAINTENANT);
    expect(lus).toHaveLength(1);
    expect(lus[0].name).toMatch(/^capture-/);
  });
});

describe('fichier ou texte ?', () => {
  const zone = document.createElement('textarea');
  const div = document.createElement('div');

  test('une capture seule est prise, même dans la description', () => {
    expect(prendreLesFichiers(donnees({ fichiers: [image()] }), zone)).toBe(true);
  });

  test('du texte copié depuis Word (texte + image) se colle comme texte dans un champ', () => {
    expect(prendreLesFichiers(donnees({ fichiers: [image()], texte: 'Nora se trompe' }), zone)).toBe(false);
  });

  test('hors d’un champ de texte, l’image est prise même avec du texte', () => {
    expect(prendreLesFichiers(donnees({ fichiers: [image()], texte: 'légende' }), div)).toBe(true);
  });
});

function Formulaire() {
  const [fichiers, setFichiers] = useState([]);
  return (
    <form>
      <textarea aria-label="Description" />
      <ChoixPiecesSignalement fichiers={fichiers} onChange={setFichiers} />
    </form>
  );
}

test('Ctrl+V dans la description joint la capture', () => {
  render(<Formulaire />);
  const description = screen.getByLabelText('Description');

  act(() => {
    fireEvent.paste(description, { clipboardData: donnees({ fichiers: [image()] }) });
  });

  expect(screen.getByText(/capture-\d{8}-\d{6}\.png/)).toBeInTheDocument();
});

test('coller du texte ne joint rien', () => {
  render(<Formulaire />);
  const description = screen.getByLabelText('Description');

  act(() => {
    fireEvent.paste(description, { clipboardData: donnees({ texte: 'du texte' }) });
  });

  expect(screen.queryByText(/capture-/)).not.toBeInTheDocument();
});
