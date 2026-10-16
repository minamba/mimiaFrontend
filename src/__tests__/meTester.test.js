import { act, fireEvent, render, screen } from '@testing-library/react';
import MeTester from '../components/mesFiches/MeTester';

/*
 * « ME TESTER » — Camara, le 16/10/2026 : flash cards ou quiz, puis mode
 * tranquille ou challenge avec un chrono.
 */
const questions = [
  { question: 'Que dit Thalès ?', reponse: 'Les longueurs sont proportionnelles', leurres: ['Les angles sont égaux', 'Les aires sont égales', 'Les côtés sont égaux'], explication: 'Deux parallèles.' },
  { question: 'Formule de l’aire ?', reponse: 'Base × hauteur / 2', leurres: ['Base × hauteur', 'Base + hauteur', '2 × base'], explication: null },
];

const ouvrir = (props = {}) => {
  const charger = jest.fn().mockResolvedValue({ data: { questions } });
  const onFermer = jest.fn();
  render(<MeTester titre="Thalès" charger={charger} onFermer={onFermer} {...props} />);
  return { charger, onFermer };
};

describe('Me tester', () => {
  afterEach(() => { document.body.style.overflow = ''; });

  it('propose les flash cards ou le quiz, puis le mode tranquille ou challenge', () => {
    ouvrir();
    expect(screen.getByRole('button', { name: /Flash cards/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Quiz/ }));
    expect(screen.getByRole('button', { name: /Tranquille/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Challenge/ })).toHaveAccessibleName(/20 s par question/);
  });

  it('le quiz : une bonne réponse est saluée, la fin donne le score', async () => {
    const { charger } = ouvrir();
    fireEvent.click(screen.getByRole('button', { name: /Quiz/ }));
    fireEvent.click(screen.getByRole('button', { name: /Tranquille/ }));

    expect(await screen.findByText(/Question 1 \/ 2/)).toBeInTheDocument();
    expect(charger).toHaveBeenCalledTimes(1);

    for (let i = 0; i < 2; i += 1) {
      const q = questions.find((x) => screen.queryByText(x.question));
      fireEvent.click(screen.getByRole('button', { name: new RegExp(q.reponse.replace(/[×/]/g, '.')) }));
      expect(screen.getByRole('status')).toHaveTextContent('Bravo, c’est juste !');
      fireEvent.click(screen.getByRole('button', { name: i === 0 ? 'Suivante →' : 'Voir mon score' }));
    }

    expect(screen.getByText('100 %')).toBeInTheDocument();
    expect(screen.getByText('2 bonnes réponses sur 2.')).toBeInTheDocument();
  });

  it('les flash cards : on retourne la carte, on dit si on savait, la carte s’envole', async () => {
    jest.useFakeTimers();
    try {
      ouvrir();
      fireEvent.click(screen.getByRole('button', { name: /Flash cards/ }));
      fireEvent.click(screen.getByRole('button', { name: /Tranquille/ }));
      await screen.findByText('Carte 1 / 2');

      expect(screen.getByRole('button', { name: /Je savais/ })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Retourner la carte' }));
      fireEvent.click(screen.getByRole('button', { name: /Je savais/ }));
      act(() => { jest.advanceTimersByTime(400); });

      fireEvent.click(screen.getByRole('button', { name: 'Retourner la carte' }));
      fireEvent.click(screen.getByRole('button', { name: /À revoir/ }));
      act(() => { jest.advanceTimersByTime(400); });

      expect(screen.getByText('50 %')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Revoir celle à revoir' })).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('en challenge, la carte se retourne seule au bout du temps et compte « à revoir »', async () => {
    jest.useFakeTimers();
    try {
      ouvrir();
      fireEvent.click(screen.getByRole('button', { name: /Flash cards/ }));
      fireEvent.click(screen.getByRole('button', { name: /Challenge/ }));
      await screen.findByText('Carte 1 / 2');

      act(() => { jest.advanceTimersByTime(10_500); });
      expect(screen.getByText(/Temps écoulé/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Je savais/ })).toBeDisabled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('une fiche de questions-réponses se joue en flash cards sans rien demander au serveur', async () => {
    const { charger } = ouvrir({ cartesLocales: [{ question: 'Q1', reponse: 'R1' }] });
    fireEvent.click(screen.getByRole('button', { name: /Flash cards/ }));
    fireEvent.click(screen.getByRole('button', { name: /Tranquille/ }));

    expect(await screen.findByText('Carte 1 / 1')).toBeInTheDocument();
    expect(charger).not.toHaveBeenCalled();
  });

  it('dit pourquoi si les questions n’ont pas pu être préparées', async () => {
    const charger = jest.fn().mockRejectedValue({ response: { data: { message: 'Réessaie dans un moment.' } } });
    render(<MeTester titre="Thalès" charger={charger} onFermer={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Quiz/ }));
    fireEvent.click(screen.getByRole('button', { name: /Tranquille/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Réessaie dans un moment.');
  });
});
