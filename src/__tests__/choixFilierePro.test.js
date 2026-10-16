import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ChoixFilierePro from '../components/ChoixFilierePro';
import { filiereAEnvoyer, filiereDeLaClasse } from '../lib/niveauxScolaires';

/*
 * LA FILIÈRE PROFESSIONNELLE — Camara, le 15/10/2026 : la famille de métiers
 * en seconde pro, la spécialité en première et terminale pro.
 */
const familles = [
  { code: 'RELATION_CLIENT', libelle: 'Relation client' },
  { code: 'TRANSITIONS', libelle: 'Transitions numérique et énergétique' },
];
const specialites = [
  { code: 'MCV', libelle: 'Métiers du commerce et de la vente', precision: 'RELATION_CLIENT' },
  { code: 'ASSP', libelle: 'Accompagnement, soins et services à la personne (ASSP)', precision: null },
  { code: 'AUTRE', libelle: 'Une autre spécialité', precision: null },
];
const seconde = { etape: 'famille', familles, specialites };
const premiere = { etape: 'specialite', familles, specialites };

function Banc({ filiere, depart = {} }) {
  const [valeur, setValeur] = useState({ familleMetiers: '', specialitePro: '', specialiteProLibre: '', ...depart });
  return (
    <>
      <ChoixFilierePro id="f" filiere={filiere} valeur={valeur} onChange={setValeur} />
      <output data-testid="valeur">{JSON.stringify(valeur)}</output>
    </>
  );
}

const valeur = () => JSON.parse(screen.getByTestId('valeur').textContent);

describe('la filière professionnelle', () => {
  it('rien hors de la voie pro', () => {
    render(<Banc filiere={null} />);
    expect(screen.queryByText('Sa filière')).not.toBeInTheDocument();
  });

  it('en seconde pro : la famille de métiers, et la spécialité seulement hors famille', () => {
    render(<Banc filiere={seconde} />);
    expect(screen.getByLabelText('Sa famille de métiers')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sa spécialité de bac pro')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Sa famille de métiers'), { target: { value: 'HORS_FAMILLE' } });
    const select = screen.getByLabelText('Sa spécialité de bac pro');
    // Hors famille : seulement les spécialités sans famille.
    expect(select).toHaveTextContent('ASSP');
    expect(select).not.toHaveTextContent('commerce');

    fireEvent.change(select, { target: { value: 'ASSP' } });
    expect(valeur()).toEqual({ familleMetiers: 'HORS_FAMILLE', specialitePro: 'ASSP', specialiteProLibre: '' });

    // Revenir à une famille efface la spécialité de seconde.
    fireEvent.change(screen.getByLabelText('Sa famille de métiers'), { target: { value: 'TRANSITIONS' } });
    expect(valeur()).toEqual({ familleMetiers: 'TRANSITIONS', specialitePro: '', specialiteProLibre: '' });
  });

  it('en première pro : la spécialité, et son nom écrit à la main si « Autre »', () => {
    render(<Banc filiere={premiere} />);
    expect(screen.queryByLabelText('Sa famille de métiers')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Sa spécialité de bac pro'), { target: { value: 'AUTRE' } });
    fireEvent.change(screen.getByLabelText('Laquelle ?'), { target: { value: 'Optique lunetterie' } });
    expect(valeur()).toEqual({ familleMetiers: '', specialitePro: 'AUTRE', specialiteProLibre: 'Optique lunetterie' });

    fireEvent.change(screen.getByLabelText('Sa spécialité de bac pro'), { target: { value: 'MCV' } });
    expect(screen.queryByLabelText('Laquelle ?')).not.toBeInTheDocument();
    expect(valeur().specialiteProLibre).toBe('');
  });

  it('ce qui part au serveur : vide hors de la voie pro, la filière sinon', () => {
    const niveaux = [{ id: 1, filierePro: premiere }, { id: 2, filierePro: null }];
    expect(filiereDeLaClasse(niveaux, '1')).toBe(premiere);
    expect(filiereDeLaClasse(niveaux, 2)).toBeNull();
    expect(filiereAEnvoyer({ specialitePro: 'MCV' }, null)).toEqual({ familleMetiers: '', specialitePro: '', specialiteProLibre: '' });
    expect(filiereAEnvoyer({ specialitePro: 'AUTRE', specialiteProLibre: '  Coiffure ' }, premiere))
      .toEqual({ familleMetiers: '', specialitePro: 'AUTRE', specialiteProLibre: 'Coiffure' });
  });
});
