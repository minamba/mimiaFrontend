/**
 * LA FENÊTRE S'OUVRE SUR LE GESTE QU'ON VIENT DE DEMANDER.
 *
 * CE QUE CE TEST PROTÈGE
 * ----------------------
 * Cette fenêtre sert à deux choses très différentes : retirer un profil, ce qui
 * libère une place sans rien effacer, et supprimer définitivement ses données.
 * Elle s'ouvrait TOUJOURS sur le retrait.
 *
 * Depuis la liste des profils déjà retirés, ça donnait ceci : le parent clique
 * « Supprimer les données », et on lui propose de retirer un profil qui l'est
 * depuis des semaines. Le bouton principal n'aurait rien fait de visible — la
 * place est déjà libre — et rien n'indiquait comment atteindre l'effacement.
 *
 * Le défaut ne tenait pas à la fenêtre elle-même, dont les deux modes
 * marchaient, mais à celui par lequel elle COMMENCE. C'est donc ce que ces
 * tests fixent, des deux côtés : un profil actif ouvre sur le retrait, un
 * profil retiré ouvre sur l'effacement.
 */

import { render, screen } from '@testing-library/react';
import RetraitEnfant from '../components/RetraitEnfant';

jest.mock('../lib/api/elevesApi', () => ({
  archiverEleve: jest.fn(),
  supprimerDonneesEleve: jest.fn(),
}));

const MINAMBA = { id: 7, prenom: 'Minamba' };

const monter = (props) =>
  render(<RetraitEnfant eleve={MINAMBA} onFerme={() => {}} onFait={() => {}} {...props} />);

describe('la fenêtre de retrait', () => {
  test('un profil ACTIF s’ouvre sur le retrait, pas sur l’effacement', () => {
    monter();

    expect(screen.getByRole('heading')).toHaveTextContent('Retirer le profil de Minamba');

    // L'effacement reste atteignable, mais en second plan : c'est tout
    // l'équilibre de cette fenêtre pour un parent qui veut juste libérer
    // une place.
    expect(screen.getByRole('button', { name: /Supprimer les données de Minamba/ }))
      .toBeInTheDocument();
    expect(screen.queryByLabelText(/Pour confirmer/)).not.toBeInTheDocument();
  });

  test('un profil DÉJÀ RETIRÉ s’ouvre sur l’effacement', () => {
    monter({ dejaRetire: true });

    expect(screen.getByRole('heading')).toHaveTextContent('Supprimer les données de Minamba');

    // La saisie du prénom est le garde-fou du geste irréversible : sa présence
    // prouve qu'on est bien sur l'effacement et non sur le retrait.
    expect(screen.getByLabelText(/Pour confirmer/)).toBeInTheDocument();

    // Et surtout : plus aucun bouton ne propose un retrait déjà fait.
    expect(screen.queryByRole('button', { name: /^Retirer le profil$/ })).not.toBeInTheDocument();
  });

  test('sur un profil déjà retiré, l’échappement referme au lieu de promettre un retour', () => {
    // « Retour » supposerait une étape précédente. Ouvert directement sur
    // l'effacement, il n'y en a pas : le bouton doit refermer la fenêtre.
    const onFerme = jest.fn();
    monter({ dejaRetire: true, onFerme });

    expect(screen.queryByRole('button', { name: 'Retour' })).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Annuler' }).click();

    expect(onFerme).toHaveBeenCalled();
  });
});
