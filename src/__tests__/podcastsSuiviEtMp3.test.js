/**
 * PODCASTS : LE MP3 ET LA BARRE DE TOUTES LES PAGES — Camara, le 15/11/2026.
 *
 * CE QUI SE TESTE ICI
 * 1. Le WAV du serveur se lit (fréquence, échantillons) ; le nom du fichier MP3 est propre.
 * 2. Le bouton « Télécharger en MP3 » n'existe que si l'admin l'affiche ; au clic, le WAV est demandé.
 * 3. La barre suit un cours en fabrication (pourcentage) ; à 100 %, la fenêtre « Ton podcast est prêt » et son bouton
 *    « Écouter » ramènent au podcast ; le cours quitte la liste suivie.
 * 4. « Tout télécharger » : chaque épisode en MP3, rangés dans un ZIP au nom du podcast.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { unzipSync } from 'fflate';
import CoursPodcast from '../components/podcasts/CoursPodcast';
import LecteurEpisode from '../components/podcasts/LecteurEpisode';
import SuiviPodcasts from '../components/podcasts/SuiviPodcasts';
import { getAudioEpisode, getAvancementPodcast, getCoursPodcast } from '../lib/api/mesPodcastsApi';
import { enZip, lireWav, nomDuFichier, proposer, wavEnMp3 } from '../lib/podcasts/mp3';
import { lireSuivis, suivre } from '../lib/podcasts/suiviPodcasts';

const mockNaviguer = jest.fn();

jest.mock('../lib/api/mesPodcastsApi', () => ({
  getAudioEpisode: jest.fn(),
  getAvancementPodcast: jest.fn(),
  getCoursPodcast: jest.fn(),
  demanderEpisodes: jest.fn(),
}));

jest.mock('../lib/podcasts/mp3', () => {
  const vrai = jest.requireActual('../lib/podcasts/mp3');
  return { ...vrai, wavEnMp3: jest.fn(), proposer: jest.fn(), enZip: jest.fn() };
});

jest.mock('../lib/storage/modeTest', () => ({ usePodcasts: () => true, usePodcastsTelechargement: () => true }));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => null }));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => mockNaviguer,
  useParams: () => ({ eleveId: '7', coursId: '42' }),
}));

jest.mock('../components/Avatar', () => function Avatar() { return null; });

/** Un WAV PCM 16 bits mono minimal. */
function wav(echantillons, frequence = 24000) {
  const tampon = new ArrayBuffer(44 + (echantillons.length * 2));
  const v = new DataView(tampon);
  const ecrire = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  ecrire(0, 'RIFF'); v.setUint32(4, 36 + (echantillons.length * 2), true); ecrire(8, 'WAVE');
  ecrire(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, frequence, true); v.setUint32(28, frequence * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ecrire(36, 'data'); v.setUint32(40, echantillons.length * 2, true);
  echantillons.forEach((e, i) => v.setInt16(44 + (i * 2), e, true));
  return tampon;
}

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:episode');
  global.URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  getAudioEpisode.mockResolvedValue({ data: new Blob(['x']) });
});

describe('le MP3', () => {
  it('lit le WAV du serveur', () => {
    const { frequence, echantillons } = lireWav(wav([0, 1000, -1000], 24000));
    expect(frequence).toBe(24000);
    expect(Array.from(echantillons)).toEqual([0, 1000, -1000]);
    expect(() => lireWav(new ArrayBuffer(10))).toThrow();
  });

  it('donne au fichier un nom propre, numéroté s’il y a plusieurs épisodes', () => {
    expect(nomDuFichier('Le Moyen Âge : les châteaux !')).toBe('le-moyen-age-les-chateaux.mp3');
    expect(nomDuFichier('Fractions', 3)).toBe('03-fractions.mp3');
    expect(nomDuFichier(null)).toBe('episode.mp3');
  });

  const episode = { id: 5, titre: 'Les fractions', duree: 60, paragraphes: ['Un.'] };

  it('le bouton n’existe pas quand l’admin le masque', async () => {
    render(<LecteurEpisode eleveId="7" episode={episode} />);
    await waitFor(() => expect(getAudioEpisode).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /Télécharger en MP3/ })).not.toBeInTheDocument();
  });

  it('affiché, il demande le WAV et le transforme en MP3', async () => {
    wavEnMp3.mockResolvedValue(new Blob(['mp3'], { type: 'audio/mpeg' }));
    render(<LecteurEpisode eleveId="7" episode={episode} telechargeable />);

    fireEvent.click(screen.getByRole('button', { name: /Télécharger en MP3/ }));
    await waitFor(() => expect(wavEnMp3).toHaveBeenCalled());
    expect(getAudioEpisode).toHaveBeenCalledWith('7', 5, true);
  });
});

describe('la barre de toutes les pages', () => {
  it('montre le pourcentage d’un cours en fabrication', async () => {
    suivre(7, 42);
    getAvancementPodcast.mockResolvedValue({
      data: { id: 42, etat: 'a_generer', titre: 'Les fractions', matiereLibelle: 'Mathématiques', demandes: 3, faits: 1, pourcent: 47 },
    });

    render(<SuiviPodcasts />);

    expect(await screen.findByText('47 %')).toBeInTheDocument();
    expect(screen.getByText('Épisode 2 sur 3 en préparation')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '47');
  });

  it('à 100 %, la fenêtre « prêt » et son bouton Écouter ramènent au podcast', async () => {
    suivre(7, 42);
    getAvancementPodcast.mockResolvedValue({
      data: { id: 42, etat: 'pret', titre: 'Les fractions', matiereLibelle: 'Mathématiques', demandes: 2, faits: 2, pourcent: 100 },
    });

    render(<SuiviPodcasts />);

    expect(await screen.findByText('100 %')).toBeInTheDocument();
    expect(await screen.findByText('Ton podcast est prêt !', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(lireSuivis()).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Écouter' }));
    expect(mockNaviguer).toHaveBeenCalledWith('/eleves/7/mes-podcasts/cours/42');
    expect(screen.queryByText('Ton podcast est prêt !')).not.toBeInTheDocument();
  });

  it('un cours supprimé n’est plus suivi', async () => {
    suivre(7, 42);
    getAvancementPodcast.mockRejectedValue({ response: { status: 404 } });

    render(<SuiviPodcasts />);

    await waitFor(() => expect(lireSuivis()).toEqual([]));
  });
});

describe('tout télécharger', () => {
  /** Un faux Blob : jsdom ne sait pas lire un vrai Blob en ArrayBuffer. */
  const faux = (texte) => ({ arrayBuffer: async () => Uint8Array.from(texte, (c) => c.charCodeAt(0)).buffer });

  it('range les MP3 dans un ZIP, sans écraser deux noms identiques', async () => {
    const { enZip: vraiZip } = jest.requireActual('../lib/podcasts/mp3');
    const zip = await vraiZip([
      { nom: '01-a.mp3', blob: faux('un') },
      { nom: '01-a.mp3', blob: faux('deux') },
    ]);
    expect(zip.type).toBe('application/zip');

    const octets = await new Promise((fin) => {
      const lecteur = new FileReader();
      lecteur.onload = () => fin(new Uint8Array(lecteur.result));
      lecteur.readAsArrayBuffer(zip);
    });
    const contenu = unzipSync(octets);
    expect(Object.keys(contenu).sort()).toEqual(['01-a-2.mp3', '01-a.mp3']);
    expect(String.fromCharCode(...contenu['01-a-2.mp3'])).toBe('deux');
  });

  it('le bouton sous « Tout écouter » prépare chaque épisode puis propose le ZIP du podcast', async () => {
    getCoursPodcast.mockResolvedValue({
      data: {
        id: 42, matiereLibelle: 'Histoire', matiereCode: 'HG', titre: 'La Première Guerre mondiale', etat: 'pret',
        notions: [{ titre: 'A' }, { titre: 'B' }], notionsDemandees: [1, 2],
        episodes: [
          { id: 1, titre: 'Le monument', notionRang: 1, notionTotal: 2, duree: 200, paragraphes: ['…'] },
          { id: 2, titre: 'Les tranchées', notionRang: 2, notionTotal: 2, duree: 180, paragraphes: ['…'] },
        ],
      },
    });
    wavEnMp3.mockResolvedValue(faux('mp3'));
    enZip.mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }));

    render(<CoursPodcast />);

    fireEvent.click(await screen.findByRole('button', { name: /Tout télécharger/ }));
    await waitFor(() => expect(proposer).toHaveBeenCalled());

    expect(wavEnMp3).toHaveBeenCalledTimes(2);
    expect(enZip.mock.calls[0][0].map((f) => f.nom)).toEqual(['01-le-monument.mp3', '02-les-tranchees.mp3']);
    expect(proposer.mock.calls[0][1]).toBe('la-premiere-guerre-mondiale.zip');
  });
});
