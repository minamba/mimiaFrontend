/**
 * L'ESSAI GRATUIT, TRENTE MINUTES EN TOUT — Camara, le 16/10/2026.
 *
 * CE QUI SE TESTE ICI
 * -------------------
 * 1. En essai, 35 et 45 minutes sont grisées ; 15 et 25 restent possibles.
 * 2. L'échéance du forfait (essai ou formule), reçue au début d'un tour, est
 *    gardée avec son motif ; quand elle tombe, la séance est coupée net
 *    (génération arrêtée), sans retirer la bulle de l'élève — son message est
 *    bien parti.
 */
import { render, screen } from '@testing-library/react';
import { ChoixDuree } from '../components/OuvertureSeance';
import chatReducer from '../lib/reducers/chatReducer';
import { ECHEANCE_FORFAIT, forfaitAtteint } from '../lib/actions/chatActions';

jest.mock('react-redux', () => ({ useSelector: (lire) => lire({ auth: { estAdmin: false } }) }));

const matiere = { id: 1, profPrenom: 'Nora' };
const bouton = (minutes) => screen.getByRole('button', { name: new RegExp(`\\b${minutes}\\s*min`) });

describe('le choix de la durée', () => {
  it('en essai, 35 et 45 minutes sont grisées, et la page dit pourquoi', () => {
    render(<ChoixDuree matiere={matiere} essai onValider={jest.fn()} onAnnuler={jest.fn()} />);

    expect(bouton(15)).toBeEnabled();
    expect(bouton(25)).toBeEnabled();
    expect(bouton(35)).toBeDisabled();
    expect(bouton(45)).toBeDisabled();
    expect(screen.getByText(/Pendant l’essai gratuit : 25 minutes au plus, et 30 minutes en tout/)).toBeInTheDocument();
  });

  it('avec un forfait, les quatre durées restent ouvertes', () => {
    render(<ChoixDuree matiere={matiere} onValider={jest.fn()} onAnnuler={jest.fn()} />);

    [15, 25, 35, 45].forEach((m) => expect(bouton(m)).toBeEnabled());
    expect(screen.queryByText(/Pendant l’essai gratuit/)).not.toBeInTheDocument();
  });
});

describe('la coupure de l’essai', () => {
  const enCours = {
    ...chatReducer(undefined, { type: '@@init' }),
    streaming: true,
    reponseEnCours: 'Alors, pour calculer AM, on',
    messages: [{ id: -1, role: 'user', contenu: 'je ne comprends pas' }],
  };

  it('garde l’échéance reçue au début du tour, avec son motif', () => {
    const etat = chatReducer(enCours, { type: ECHEANCE_FORFAIT, payload: { le: 1_000, motif: 'EssaiEpuise' } });
    expect(etat.echeance).toEqual({ le: 1_000, motif: 'EssaiEpuise' });
  });

  it('coupe net : plus de génération, motif EssaiEpuise, la bulle de l’élève reste', () => {
    const etat = chatReducer({ ...enCours, echeance: { le: 1_000, motif: 'EssaiEpuise' } }, forfaitAtteint('EssaiEpuise'));

    expect(etat.streaming).toBe(false);
    expect(etat.reponseEnCours).toBe('');
    expect(etat.quota).toBe('EssaiEpuise');
    expect(etat.echeance).toBeNull();
    expect(etat.messages).toHaveLength(1);
  });

  it('une formule payante au bout de ses heures : même coupure, motif du pot', () => {
    const etat = chatReducer({ ...enCours, echeance: { le: 1_000, motif: 'PotEpuise' } }, forfaitAtteint('PotEpuise'));

    expect(etat.streaming).toBe(false);
    expect(etat.quota).toBe('PotEpuise');
  });
});
