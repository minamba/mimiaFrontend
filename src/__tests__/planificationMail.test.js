import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PlanificationModele from '../components/PlanificationModele';
import * as api from '../lib/api/adminApi';
import { formaterProchainEnvoi, resumerPlanification } from '../lib/storage/planificationMail';

jest.mock('../lib/api/adminApi');

const FIN_ESSAI = {
  id: 4,
  nature: 'Automatique',
  code: 'FIN_ESSAI',
  actif: false,
  frequence: 'Jour',
  heure: '10:00',
  jourSemaine: null,
  jourMois: null,
  reglesADefinir: false,
};

test('la programmation se dit en une phrase', () => {
  expect(resumerPlanification({ frequence: 'Jour', heure: '08:00' })).toBe('Tous les jours à 08:00');
  expect(resumerPlanification({ frequence: 'Semaine', heure: '09:00', jourSemaine: 1 })).toBe('Chaque lundi à 09:00');
  expect(resumerPlanification({ frequence: 'Mois', heure: '13:00', jourMois: 5 })).toBe('Le 5 de chaque mois à 13:00');
  expect(resumerPlanification({ frequence: 'Mois', heure: '13:00', jourMois: 1 })).toBe('Le 1er de chaque mois à 13:00');
  expect(resumerPlanification({ frequence: 'Aucune', heure: '13:00' })).toBe('Non programmé');
});

test('le prochain envoi s’affiche à l’heure de Paris, été comme hiver', () => {
  expect(formaterProchainEnvoi('2026-09-21T07:00:00Z')).toBe('lundi 21 septembre à 09:00');
  expect(formaterProchainEnvoi('2026-12-07T08:00:00Z')).toBe('lundi 7 décembre à 09:00');
  // Une date sans fuseau, telle qu'Entity Framework la rend, est de l'UTC.
  expect(formaterProchainEnvoi('2026-12-07T08:00:00')).toBe('lundi 7 décembre à 09:00');
});

test('les champs suivent la fréquence', () => {
  render(<PlanificationModele modele={FIN_ESSAI} />);

  expect(screen.getByLabelText('Heure (Paris)')).toHaveValue('10:00');
  expect(screen.queryByLabelText('Jour')).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Fréquence'), { target: { value: 'Semaine' } });
  expect(screen.getByLabelText('Jour')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Fréquence'), { target: { value: 'Mois' } });
  expect(screen.getByLabelText('Jour du mois')).toBeInTheDocument();
  expect(screen.queryByLabelText('Jour')).not.toBeInTheDocument();
});

test('« Enregistrer la programmation » envoie la règle réglée', async () => {
  api.planifierModeleMail.mockResolvedValue({ data: { ...FIN_ESSAI, heure: '07:30' } });

  render(<PlanificationModele modele={FIN_ESSAI} />);

  fireEvent.change(screen.getByLabelText('Heure (Paris)'), { target: { value: '07:30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la programmation' }));

  await waitFor(() => expect(api.planifierModeleMail).toHaveBeenCalledWith(
    4, expect.objectContaining({ frequence: 'Jour', heure: '07:30', actif: false }),
  ));
  expect(await screen.findByText('Programmation enregistrée')).toBeInTheDocument();
});

test('les bilans ne proposent pas de fréquence : ils sont hebdomadaires', () => {
  render(<PlanificationModele modele={{ ...FIN_ESSAI, code: 'BILANS', frequence: 'Semaine', jourSemaine: 1 }} />);

  expect(screen.queryByLabelText('Fréquence')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Jour')).toBeInTheDocument();
});

test('Relance et Rappels ne se programment pas : leurs règles restent à définir', () => {
  render(<PlanificationModele modele={{ ...FIN_ESSAI, code: 'RELANCE', reglesADefinir: true }} />);

  expect(screen.getByText(/ne sont pas encore définies/)).toBeInTheDocument();
  expect(screen.queryByRole('switch')).not.toBeInTheDocument();
});
