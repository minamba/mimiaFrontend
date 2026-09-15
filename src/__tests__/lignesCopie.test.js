import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LignesCopie, { insererLigneDans } from '../components/LignesCopie';

/**
 * INSÉRER UNE PHRASE OUBLIÉE, À SA PLACE.
 *
 * Relevé par Camara le 11/09/2026, pendant la relecture complète d'une dictée
 * au clavier : la phrase 3 oubliée, impossible de l'insérer sous la ligne 2.
 * La nouvelle ligne doit porter le numéro 3, et les suivantes se décaler.
 */

function Banc({ depart }) {
  const [lignes, setLignes] = useState(depart);
  return <LignesCopie lignes={lignes} onLignes={setLignes} />;
}

const COPIE = ['Le vent soufflait.', 'La mer montait.', 'Un bateau rentrait.'];

const ligne = (numero) => screen.getByLabelText(`Ligne ${numero} de ta copie`);

describe('insererLigneDans', () => {
  test('ouvre une ligne vide à la position demandée', () => {
    expect(insererLigneDans(['a', 'b', 'c'], 2)).toEqual(['a', 'b', '', 'c']);
  });

  test('au début comme à la fin', () => {
    expect(insererLigneDans(['a'], 0)).toEqual(['', 'a']);
    expect(insererLigneDans(['a'], 1)).toEqual(['a', '']);
  });

  test('ne touche pas au tableau reçu', () => {
    const depart = ['a', 'b'];
    insererLigneDans(depart, 1);
    expect(depart).toEqual(['a', 'b']);
  });
});

describe('la copie à l\'écran', () => {
  test('LE CAS RELEVÉ : ＋ sous la ligne 2 ouvre la ligne 3, l\'ancienne 3 devient la 4', async () => {
    render(<Banc depart={COPIE} />);

    fireEvent.click(screen.getByLabelText('Ajouter une ligne sous la ligne 2'));

    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    expect(ligne(2).value).toBe('La mer montait.');
    expect(ligne(3).value).toBe('');
    expect(ligne(4).value).toBe('Un bateau rentrait.');

    // Le curseur l'attend : il n'a plus qu'à taper sa phrase.
    await waitFor(() => expect(document.activeElement).toBe(ligne(3)));

    fireEvent.change(ligne(3), { target: { value: 'Les mouettes criaient.' } });

    expect(screen.getAllByRole('textbox').map((c) => c.value)).toEqual([
      'Le vent soufflait.', 'La mer montait.', 'Les mouettes criaient.', 'Un bateau rentrait.',
    ]);
  });

  test('Entrée en fin de ligne 2 fait la même chose', () => {
    render(<Banc depart={COPIE} />);

    const champ = ligne(2);
    champ.setSelectionRange(champ.value.length, champ.value.length);
    fireEvent.keyDown(champ, { key: 'Enter' });

    expect(ligne(3).value).toBe('');
    expect(ligne(4).value).toBe('Un bateau rentrait.');
  });

  test('Entrée au tout début de la ligne 1 ouvre une ligne AU-DESSUS', () => {
    // Le seul moyen de rattraper une première phrase oubliée.
    render(<Banc depart={COPIE} />);

    const champ = ligne(1);
    champ.setSelectionRange(0, 0);
    fireEvent.keyDown(champ, { key: 'Enter' });

    expect(ligne(1).value).toBe('');
    expect(ligne(2).value).toBe('Le vent soufflait.');
  });

  test('Retour arrière sur une ligne vide la retire, et la numérotation se resserre', () => {
    render(<Banc depart={['a', '', 'c']} />);

    fireEvent.keyDown(ligne(2), { key: 'Backspace' });

    expect(screen.getAllByRole('textbox').map((c) => c.value)).toEqual(['a', 'c']);
  });

  test('chaque ligne se corrige', () => {
    render(<Banc depart={COPIE} />);

    fireEvent.change(ligne(2), { target: { value: 'La mer monter.' } });

    expect(ligne(2).value).toBe('La mer monter.');
  });

  test('le correcteur du navigateur est coupé : il soulignerait les fautes', () => {
    render(<Banc depart={COPIE} />);

    expect(ligne(1).getAttribute('spellcheck')).toBe('false');
  });
});
