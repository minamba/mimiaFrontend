/**
 * CC ET CCI, COMME SUR GMAIL — Camara, le 19/10/2026 : chaque adresse devient
 * une pastille ; une adresse mal écrite reste visible, en rouge.
 */
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ChampAdresses, { adressesValides, lireAdresses } from '../components/ChampAdresses';

function Banc({ depart = [], suggestions = [] }) {
  const [valeur, setValeur] = useState(depart);
  return (
    <>
      <ChampAdresses id="cc" libelle="Cc" valeur={valeur} onChange={setValeur} suggestions={suggestions} />
      <output data-testid="valeur">{valeur.join('|')}</output>
    </>
  );
}

const valeur = () => screen.getByTestId('valeur').textContent;

it('Entrée, virgule ou collage : chaque adresse devient une pastille, sans doublon', () => {
  render(<Banc />);
  const champ = screen.getByLabelText('Cc');

  fireEvent.change(champ, { target: { value: 'a@x.fr' } });
  fireEvent.keyDown(champ, { key: 'Enter' });
  fireEvent.change(champ, { target: { value: 'b@y.fr, A@x.fr; c@z.fr ' } });

  expect(valeur()).toBe('a@x.fr|b@y.fr|c@z.fr');
});

it('retour arrière dans le champ vide retire la dernière ; le × retire la sienne', () => {
  render(<Banc depart={['a@x.fr', 'b@y.fr', 'c@z.fr']} />);

  fireEvent.keyDown(screen.getByLabelText('Cc'), { key: 'Backspace' });
  expect(valeur()).toBe('a@x.fr|b@y.fr');

  fireEvent.click(screen.getByRole('button', { name: 'Retirer a@x.fr' }));
  expect(valeur()).toBe('b@y.fr');
});

it('une adresse mal écrite est signalée', () => {
  render(<Banc depart={['pas-une-adresse']} />);
  expect(screen.getByText(/Une adresse en rouge est mal écrite/)).toBeInTheDocument();
  expect(adressesValides(['a@x.fr', 'pas-une-adresse'])).toBe(false);
});

it('propose les parents par leur nom', () => {
  render(<Banc suggestions={[{ nom: 'Sophie Martin', mail: 'sophie@exemple.fr' }]} />);
  fireEvent.change(screen.getByLabelText('Cc'), { target: { value: 'soph' } });
  fireEvent.mouseDown(screen.getByRole('button', { name: /Sophie Martin/ }));
  expect(valeur()).toBe('sophie@exemple.fr');
});

it('relit la forme d’un brouillon', () => {
  expect(lireAdresses('a@x.fr, b@y.fr')).toEqual(['a@x.fr', 'b@y.fr']);
  expect(lireAdresses(null)).toEqual([]);
});

it('dès la première lettre, l’équipe passe avant les parents', () => {
  render(<Banc suggestions={[
    { nom: 'Mina Parent', mail: 'mina@exemple.fr' },
    { nom: 'Minamba Camara', mail: 'minamba.camara@mimia.fr', equipe: true },
  ]} />);
  fireEvent.change(screen.getByLabelText('Cc'), { target: { value: 'm' } });

  const lignes = screen.getAllByRole('button', { name: /Mina/ });
  expect(lignes[0]).toHaveTextContent('Minamba Camara');
  expect(lignes[0]).toHaveTextContent('Équipe');
  expect(lignes[1]).toHaveTextContent('Mina Parent');
});
