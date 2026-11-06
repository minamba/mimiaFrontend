/**
 * LE TEST DU MICRO DU TUTORIEL — Camara, le 03/11/2026 : il a coupé son micro exprès
 * et la barre restait plate sans que rien ne soit dit. Au bout de 20 secondes sans
 * son, on dit ce qu'on a vérifié, ce qui manque et quoi faire.
 */
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import TestMicro from '../components/tutoriel/TestMicro';
import {
  diagnostic, etatDeLErreur, etatDuSilence, lireEnvironnement, niveauDe, barreAdresseMontrable,
} from '../lib/tutoriel/diagnosticMicro';

const CHROME_WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const CHROME_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const SAFARI_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const FIREFOX = 'Mozilla/5.0 (Windows NT 10.0; rv:130.0) Gecko/20100101 Firefox/130.0';
const EDGE = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0';

describe('lireEnvironnement', () => {
  it('reconnaît le système et le navigateur', () => {
    expect(lireEnvironnement(CHROME_WINDOWS)).toMatchObject({ systeme: 'windows', navigateur: 'chrome', mobile: false });
    expect(lireEnvironnement(CHROME_MAC)).toMatchObject({ systeme: 'mac', navigateur: 'chrome' });
    expect(lireEnvironnement(SAFARI_MAC)).toMatchObject({ systeme: 'mac', navigateur: 'safari' });
    expect(lireEnvironnement(IPHONE)).toMatchObject({ systeme: 'ios', mobile: true });
    expect(lireEnvironnement(FIREFOX)).toMatchObject({ navigateur: 'firefox' });
    expect(lireEnvironnement(EDGE)).toMatchObject({ navigateur: 'edge' });
  });

  it('prend un iPad récent, qui se dit Mac, pour ce qu’il est', () => {
    expect(lireEnvironnement(SAFARI_MAC, 5)).toMatchObject({ systeme: 'ios', mobile: true });
  });
});

describe('diagnostic', () => {
  const windows = lireEnvironnement(CHROME_WINDOWS);
  const mac = lireEnvironnement(CHROME_MAC);

  it('nomme le micro détecté et dit que le son manque', () => {
    const avis = diagnostic('silence', { env: windows, nomMicro: 'Elgato Wave:XLR' });

    expect(avis.titre).toBe('Aucun son n’arrive');
    expect(avis.constats[0]).toEqual({ ok: true, texte: 'Micro détecté : « Elgato Wave:XLR ».' });
    expect(avis.constats[1]).toEqual({ ok: true, texte: 'Le navigateur a bien accès au micro.' });
    expect(avis.constats[2].ok).toBe(false);
    expect(avis.etapes.join(' ')).toMatch(/coupé/);
    expect(avis.etapes.join(' ')).toMatch(/branchement/);
    expect(avis.etapes.join(' ')).toMatch(/Paramètres › Système › Son/);
  });

  it('adapte le chemin des réglages au système', () => {
    expect(diagnostic('silence', { env: mac }).etapes.join(' ')).toMatch(/Réglages Système › Son/);
    expect(diagnostic('silence', { env: mac }).lien.adresse).toMatch(/^x-apple/);
    expect(diagnostic('silence', { env: windows }).lien.adresse).toBe('ms-settings:sound');
  });

  it('ne propose la liste que s’il y a plusieurs micros', () => {
    expect(diagnostic('silence', { env: windows, plusieursMicros: true }).etapes.join(' ')).toMatch(/autre dans la liste/);
    expect(diagnostic('silence', { env: windows }).etapes.join(' ')).not.toMatch(/autre dans la liste/);
  });

  it('dit quand aucun micro n’est détecté', () => {
    const avis = diagnostic('absent', { env: windows });
    expect(avis.titre).toBe('Je ne détecte aucun micro');
    expect(avis.etapes.join(' ')).toMatch(/Branchez/);
  });

  it('montre la barre d’adresse quand c’est elle qui bloque, et seulement là où on sait la montrer', () => {
    expect(diagnostic('refuse', { env: windows }).montrerBarre).toBe(true);
    expect(diagnostic('refuse', { env: lireEnvironnement(SAFARI_MAC), site: 'mimia.fr' }).montrerBarre).toBe(false);
    expect(diagnostic('refuse', { env: lireEnvironnement(SAFARI_MAC), site: 'mimia.fr' }).etapes[0]).toMatch(/Réglages pour mimia\.fr/);
    expect(diagnostic('refuse', { env: lireEnvironnement(IPHONE) }).montrerBarre).toBe(false);
    expect(barreAdresseMontrable(lireEnvironnement(EDGE))).toBe(true);
  });

  it('l’accès étant bon, ne montre pas la barre d’adresse quand aucun son n’arrive', () => {
    const avis = diagnostic('silence', { env: windows });
    expect(avis.constats[1].texte).toBe('Le navigateur a bien accès au micro.');
    expect(avis.montrerBarre).toBe(false);
    expect(avis.etapes.join(' ')).not.toMatch(/flèche/);
    expect(diagnostic('faible', { env: windows }).montrerBarre).toBe(false);
  });

  it('renvoie aux réglages de l’ordinateur quand c’est le système qui refuse', () => {
    const avis = diagnostic('refuse-systeme', { env: mac });
    expect(avis.montrerBarre).toBe(false);
    expect(avis.etapes[0]).toMatch(/Confidentialité et sécurité › Micro/);
  });
});

describe('etatDeLErreur', () => {
  it('traduit les erreurs du navigateur', () => {
    expect(etatDeLErreur({ name: 'NotFoundError' })).toBe('absent');
    expect(etatDeLErreur({ name: 'NotReadableError' })).toBe('occupe');
    expect(etatDeLErreur({ name: 'NotAllowedError', message: 'Permission denied' })).toBe('refuse');
    expect(etatDeLErreur({ name: 'NotAllowedError', message: 'Permission denied by system' })).toBe('refuse-systeme');
    expect(etatDeLErreur({ name: 'Autre' })).toBe('indisponible');
  });
});

describe('le niveau', () => {
  it('vaut zéro sur un micro muet, et monte avec la voix', () => {
    expect(niveauDe(new Float32Array(100))).toBe(0);
    expect(niveauDe(new Float32Array(100).fill(0.1))).toBeGreaterThan(0.22);
    expect(etatDuSilence(0)).toBe('silence');
    expect(etatDuSilence(0.1)).toBe('faible');
  });
});

describe('le composant', () => {
  let amplitude;
  let piste;

  beforeEach(() => {
    jest.useFakeTimers();
    amplitude = 0;
    piste = {
      label: 'Elgato Wave:XLR', stop: jest.fn(), getSettings: () => ({ deviceId: 'a' }), onended: null,
    };

    const flux = { getTracks: () => [piste], getAudioTracks: () => [piste] };

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue(flux),
        enumerateDevices: jest.fn().mockResolvedValue([
          { kind: 'audioinput', deviceId: 'a', label: 'Elgato Wave:XLR' },
          { kind: 'audioinput', deviceId: 'b', label: 'Micro de la webcam' },
          { kind: 'audiooutput', deviceId: 'c', label: 'Enceintes' },
        ]),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    });

    window.AudioContext = class {
      resume() { return Promise.resolve(); }

      close() { return Promise.resolve(); }

      createAnalyser() {
        return {
          fftSize: 0,
          getFloatTimeDomainData: (donnees) => donnees.fill(amplitude),
        };
      }

      createMediaStreamSource() { return { connect() {} }; }
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    delete navigator.mediaDevices;
    delete window.AudioContext;
  });

  const lancer = async () => {
    render(<TestMicro />);
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole('button', { name: /Tester mon micro/ }));
    await act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve(); });
  };

  const avancer = (ms) => act(async () => { jest.advanceTimersByTime(ms); });

  it('ne dit rien avant 20 secondes, puis cherche avec le parent', async () => {
    await lancer();

    expect(screen.getByText(/J’écoute « Elgato Wave:XLR »/)).toBeInTheDocument();

    await avancer(19500);
    expect(screen.queryByText('Aucun son n’arrive')).not.toBeInTheDocument();

    await avancer(1000);
    expect(screen.getByText('Aucun son n’arrive')).toBeInTheDocument();
    expect(screen.getByText(/Micro détecté : « Elgato Wave:XLR »/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Micro utilisé/ })).toBeInTheDocument();
  });

  it('le son qui revient efface le diagnostic', async () => {
    await lancer();
    await avancer(20500);
    expect(screen.getByText('Aucun son n’arrive')).toBeInTheDocument();

    amplitude = 0.1;
    await avancer(100);

    expect(screen.queryByText('Aucun son n’arrive')).not.toBeInTheDocument();
    expect(screen.getByText(/Parfait, le micro fonctionne/)).toBeInTheDocument();
  });

  it('une voix entendue ne déclenche jamais le diagnostic', async () => {
    await lancer();
    amplitude = 0.1;
    await avancer(100);
    amplitude = 0;
    await avancer(25000);

    expect(screen.queryByText('Aucun son n’arrive')).not.toBeInTheDocument();
  });

  it('dit aussitôt qu’aucun micro n’est branché, sans rien demander', async () => {
    navigator.mediaDevices.enumerateDevices.mockResolvedValue([]);
    render(<TestMicro />);
    await act(async () => { for (let i = 0; i < 6; i += 1) await Promise.resolve(); });

    expect(screen.getByText('Je ne détecte aucun micro')).toBeInTheDocument();
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('un accès refusé montre la barre d’adresse', async () => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(CHROME_WINDOWS);
    navigator.mediaDevices.getUserMedia.mockRejectedValue(
      Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' }),
    );

    await lancer();

    expect(screen.getByText('L’accès au micro est bloqué')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /barre d’adresse/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('relâche le micro en quittant l’étape', async () => {
    render(<TestMicro />).unmount();

    const { unmount } = render(<TestMicro />);
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole('button', { name: /Tester mon micro/ }));
    await act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve(); });

    unmount();
    expect(piste.stop).toHaveBeenCalled();
  });
});
