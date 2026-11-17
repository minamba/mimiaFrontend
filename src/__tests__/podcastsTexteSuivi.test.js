/* eslint-disable testing-library/no-container, testing-library/no-node-access -- l'élément audio et la zone de texte n'ont ni rôle ni libellé. */
/**
 * LE TEXTE QUI SUIT LA VOIX — Camara, le 15/11/2026 : « je voudrais que le suivi soit vraiment synchronisé avec la
 * parole du professeur, et que le scroll défile automatiquement ».
 *
 * CE QUI SE TESTE ICI
 * 1. Avec les repères du serveur : le paragraphe et la phrase dits à un instant ; sans eux, le paragraphe estimé.
 * 2. À l'écran : la phrase dite est éclairée, ce qui précède est marqué « passé », la zone défile vers la phrase ;
 *    toucher une phrase y mène.
 * 3. Un défilement à la main suspend le suivi.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LecteurEpisode, { phrasesDuParagraphe, positionAuTemps, reperesValides } from '../components/podcasts/LecteurEpisode';
import { getAudioEpisode } from '../lib/api/mesPodcastsApi';

jest.mock('../lib/api/mesPodcastsApi', () => ({ getAudioEpisode: jest.fn() }));
jest.mock('../components/Avatar', () => function Avatar() { return null; });

const P1 = 'Bonjour à tous. Voici la suite !';
const P2 = 'Dernier paragraphe.';
const episode = {
  id: 5,
  titre: 'Les fractions',
  duree: 30,
  paragraphes: [P1, P2],
  reperes: [
    { debut: 0.3, fin: 9, coupes: [0, 16], temps: [0.3, 4.2] },
    { debut: 9.55, fin: 14, coupes: [0], temps: [9.55] },
  ],
};

// Les faux sont remis à zéro avant chaque test (réglage de Create React App) : on les repose à chaque fois.
beforeEach(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:episode');
  global.URL.revokeObjectURL = jest.fn();
  window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
  getAudioEpisode.mockResolvedValue({ data: new Blob(['x']) });
});

describe('où en est la voix', () => {
  it('donne le paragraphe et la phrase avec les repères', () => {
    expect(reperesValides(episode)).toBe(true);
    expect(phrasesDuParagraphe(P1, [0, 16])).toEqual(['Bonjour à tous. ', 'Voici la suite !']);
    expect(positionAuTemps(episode, 0, 30)).toEqual({ paragraphe: 0, phrase: 0 });
    expect(positionAuTemps(episode, 4.1, 30)).toEqual({ paragraphe: 0, phrase: 0 });
    expect(positionAuTemps(episode, 4.3, 30)).toEqual({ paragraphe: 0, phrase: 1 });
    // Pendant le silence entre deux paragraphes, la phrase dite reste ; le suivant s'éclaire juste avant sa voix.
    expect(positionAuTemps(episode, 9.2, 30)).toEqual({ paragraphe: 0, phrase: 1 });
    expect(positionAuTemps(episode, 9.45, 30)).toEqual({ paragraphe: 1, phrase: 0 });
  });

  it('sans repères (épisode fait avant), le paragraphe estimé', () => {
    const ancien = { ...episode, reperes: null };
    expect(reperesValides(ancien)).toBe(false);
    expect(positionAuTemps(ancien, 1, 30)).toEqual({ paragraphe: 0, phrase: -1 });
    // Des repères qui ne collent pas au texte sont ignorés.
    expect(reperesValides({ ...episode, reperes: [episode.reperes[0]] })).toBe(false);
  });
});

describe('le texte à l’écran', () => {
  const ouvrir = async () => {
    const { container } = render(<LecteurEpisode eleveId="7" episode={episode} />);
    await waitFor(() => expect(container.querySelector('audio')).toHaveAttribute('src', 'blob:episode'));
    fireEvent.click(screen.getByRole('button', { name: 'Lire en même temps' }));
    const audio = container.querySelector('audio');
    const zone = container.querySelector('.pod-lecteur__texte');
    zone.scrollTo = jest.fn();
    const aLInstant = (t) => {
      Object.defineProperty(audio, 'currentTime', { value: t, writable: true, configurable: true });
      fireEvent.timeUpdate(audio);
    };
    return { audio, zone, aLInstant };
  };

  it('éclaire la phrase dite, marque ce qui est dit, et fait défiler la zone', async () => {
    const { zone, aLInstant } = await ouvrir();

    aLInstant(5);
    expect(screen.getByText('Voici la suite !')).toHaveClass('est-dite');
    expect(screen.getByText('Bonjour à tous.')).toHaveClass('est-passee');
    expect(screen.getByText('Dernier paragraphe.')).not.toHaveClass('est-dite');
    expect(zone.scrollTo).toHaveBeenCalled();

    aLInstant(10);
    expect(screen.getByText('Dernier paragraphe.')).toHaveClass('est-dite');
    expect(screen.getByText('Voici la suite !')).toHaveClass('est-passee');
  });

  it('toucher une phrase mène à son instant', async () => {
    const { audio } = await ouvrir();
    fireEvent.click(screen.getByText('Voici la suite !'));
    expect(audio.currentTime).toBe(4.2);
  });

  it('un défilement à la main suspend le suivi', async () => {
    const { zone, aLInstant } = await ouvrir();
    aLInstant(1);
    zone.scrollTo.mockClear();

    fireEvent.wheel(zone);
    aLInstant(5);
    expect(screen.getByText('Voici la suite !')).toHaveClass('est-dite');
    expect(zone.scrollTo).not.toHaveBeenCalled();
  });
});
