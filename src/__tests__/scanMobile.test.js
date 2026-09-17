/**
 * LE SCANNER PAR QR CODE — voulu par Camara le 13/09/2026.
 *
 * Sur l'ordinateur : un QR code, et la photo remise à la séance dès qu'elle
 * arrive. Sur le téléphone : une page sans compte, un seul geste.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScanMobileModale from '../components/ScanMobileModale';
import ScanMobile from '../components/ScanMobile';
import { creerScanMobile, etatScanMobile } from '../lib/api/chatApi';
import { envoyerScanMobile, lireScanMobile, terminerScanMobile } from '../lib/api/scanMobileApi';
import {
  adresseScan, baseApiScan, origineScan, tempsRestant,
} from '../lib/storage/scanMobile';

jest.mock('qrcode', () => ({ toString: jest.fn(() => Promise.resolve('<svg></svg>')) }));

jest.mock('../lib/api/chatApi', () => ({
  creerScanMobile: jest.fn(),
  etatScanMobile: jest.fn(),
  chargerPieceJointe: jest.fn(),
}));

jest.mock('../lib/api/scanMobileApi', () => ({
  lireScanMobile: jest.fn(),
  envoyerScanMobile: jest.fn(),
  terminerScanMobile: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useParams: () => ({ jeton: 'abc123' }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('le QR code pointe vers la page du téléphone, jeton compris', () => {
  expect(adresseScan('abc123', 'https://mimia.fr')).toBe('https://mimia.fr/scan/abc123');
  expect(adresseScan('abc', 'https://mimia.fr/')).toBe('https://mimia.fr/scan/abc');
});

describe('en développement comme en production', () => {
  const LOCAL = { hostname: 'localhost', origin: 'http://localhost:3000' };
  const PROD = { hostname: 'mimia.fr', origin: 'https://mimia.fr' };

  test('en production, le QR code porte l’origine du site, sans rien demander', async () => {
    const recuperer = jest.fn();
    expect(await origineScan({ env: { NODE_ENV: 'production' }, emplacement: PROD, recuperer }))
      .toBe('https://mimia.fr');
    expect(recuperer).not.toHaveBeenCalled();
  });

  test('en développement, le QR code porte l’adresse de l’ordinateur sur le réseau', async () => {
    const recuperer = jest.fn(() => Promise.resolve({
      ok: true, json: () => Promise.resolve({ adresse: 'http://192.168.1.63:3000' }),
    }));

    expect(await origineScan({ env: { NODE_ENV: 'development' }, emplacement: LOCAL, recuperer }))
      .toBe('http://192.168.1.63:3000');
  });

  test('si le serveur de développement ne répond pas, on garde l’origine — rien ne casse', async () => {
    const recuperer = jest.fn(() => Promise.reject(new Error('hors ligne')));

    expect(await origineScan({ env: { NODE_ENV: 'development' }, emplacement: LOCAL, recuperer }))
      .toBe('http://localhost:3000');
  });

  test('une adresse forcée l’emporte sur tout', async () => {
    expect(await origineScan({
      env: { NODE_ENV: 'development', REACT_APP_PUBLIC_URL: 'https://tunnel.exemple' },
      emplacement: LOCAL,
    })).toBe('https://tunnel.exemple');
  });

  test('le téléphone passe par le serveur de développement quand l’API est sur localhost', () => {
    // Sur le téléphone : l'API « localhost » serait le téléphone lui-même.
    expect(baseApiScan('http://localhost:5066', '192.168.1.63')).toBe('');

    // Sur l'ordinateur, et en production : la base habituelle, inchangée.
    expect(baseApiScan('http://localhost:5066', 'localhost')).toBe('http://localhost:5066');
    expect(baseApiScan('', 'mimia.fr')).toBe('');
    expect(baseApiScan('https://api.mimia.fr', 'mimia.fr')).toBe('https://api.mimia.fr');
  });
});

test('le compte à rebours s’écrit en minutes et secondes, sans descendre sous zéro', () => {
  const maintenant = Date.parse('2026-09-13T20:00:00Z');
  expect(tempsRestant('2026-09-13T20:09:05Z', maintenant)).toBe('9:05');
  expect(tempsRestant('2026-09-13T19:59:00Z', maintenant)).toBe('0:00');
});

describe('sur l’ordinateur', () => {
  test('les photos arrivent une à une, chacune remise UNE fois — et c’est « terminé » qui clôt', async () => {
    creerScanMobile.mockResolvedValue({ data: { jeton: 'abc123', expireLe: '2099-01-01T00:00:00Z' } });

    const une = { id: 77, nomFichier: 'page1.jpg', typeMime: 'image/jpeg', taille: 1000 };
    const deux = { id: 78, nomFichier: 'page2.jpg', typeMime: 'image/jpeg', taille: 1000 };
    etatScanMobile
      .mockResolvedValueOnce({ data: { etat: 'attente', pieces: [], termine: false } })
      .mockResolvedValueOnce({ data: { etat: 'recu', pieces: [une], termine: false } })
      .mockResolvedValueOnce({ data: { etat: 'recu', pieces: [une, deux], termine: false } })
      .mockResolvedValue({ data: { etat: 'recu', pieces: [une, deux], termine: true } });

    const onRecu = jest.fn();
    const onTermine = jest.fn();

    render(
      <ScanMobileModale
        conversationId={5}
        profPrenom="Nora"
        onRecu={onRecu}
        onTermine={onTermine}
        onFermer={jest.fn()}
        intervalle={10}
      />,
    );

    expect(await screen.findByAltText(/QR code/)).toBeInTheDocument();
    expect(screen.getByText(/Prends ta copie en photo — plusieurs pages si tu veux/)).toBeInTheDocument();

    // La première photo est là : elle est remise à la séance, mais RIEN ne
    // part encore — le téléphone n'a pas dit « terminé ».
    await waitFor(() => expect(onRecu).toHaveBeenCalledWith(une));
    expect(onTermine).not.toHaveBeenCalled();
    expect(screen.queryByText(/C’est arrivé !/)).not.toBeInTheDocument();

    expect(await screen.findByText(/Nora a reçu tes 2 photos/)).toBeInTheDocument();
    expect(onRecu).toHaveBeenCalledTimes(2);
    expect(onRecu).toHaveBeenCalledWith(deux);
    expect(onTermine).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('button', { name: 'Scanner une autre page' })).toBeInTheDocument();
  });

  test('un QR code expiré se renouvelle d’un clic', async () => {
    creerScanMobile.mockResolvedValue({ data: { jeton: 'abc123', expireLe: '2099-01-01T00:00:00Z' } });
    etatScanMobile.mockResolvedValue({ data: { etat: 'expire', piece: null } });

    render(<ScanMobileModale conversationId={5} onRecu={jest.fn()} onFermer={jest.fn()} intervalle={10} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Nouveau QR code' }));
    await waitFor(() => expect(creerScanMobile).toHaveBeenCalledTimes(2));
  });
});

describe('sur le téléphone', () => {
  test('la photo choisie part au professeur, et la page le confirme', async () => {
    lireScanMobile.mockResolvedValue({ data: { profPrenom: 'Nora', matiere: 'Mathématiques', dejaEnvoye: false } });
    envoyerScanMobile.mockResolvedValue({ data: { recu: true } });
    terminerScanMobile.mockResolvedValue({ data: { termine: true } });

    render(<ScanMobile />);

    expect(await screen.findByRole('heading', { name: 'Envoie ta copie à Nora' })).toBeInTheDocument();

    const photo = new File(['x'], 'copie.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText(/Importer un document/), photo);

    await userEvent.click(screen.getByRole('button', { name: 'Envoyer à Nora' }));

    expect(await screen.findByText('C’est envoyé !')).toBeInTheDocument();
    expect(envoyerScanMobile).toHaveBeenCalledWith('abc123', photo, expect.any(Object));

    // Et le téléphone dit « terminé » : c'est ça qui fait partir le message.
    expect(terminerScanMobile).toHaveBeenCalledWith('abc123');
  });

  test('plusieurs photos partent ensemble, dans l’ordre, et une croix retire celle qu’on ne veut plus', async () => {
    lireScanMobile.mockResolvedValue({ data: { profPrenom: 'Nora', matiere: 'Mathématiques', dejaEnvoye: false } });
    envoyerScanMobile.mockResolvedValue({ data: { recu: true } });
    terminerScanMobile.mockResolvedValue({ data: { termine: true } });

    render(<ScanMobile />);
    await screen.findByRole('heading', { name: 'Envoie ta copie à Nora' });

    const page1 = new File(['1'], 'page1.pdf', { type: 'application/pdf' });
    const page2 = new File(['2'], 'page2.pdf', { type: 'application/pdf' });
    const brouillon = new File(['3'], 'brouillon.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText(/Importer un document/), [page1, page2, brouillon]);

    // Les trois sont listées ; le brouillon s'en va d'une croix.
    expect(screen.getByText('page1.pdf')).toBeInTheDocument();
    expect(screen.getByText('brouillon.pdf')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retirer brouillon.pdf' }));
    expect(screen.queryByText('brouillon.pdf')).not.toBeInTheDocument();

    // Les boutons pour en ajouter sont toujours là : la liste n'est pas close.
    expect(screen.getByLabelText(/Ajouter une photo/)).toBeInTheDocument();
    expect(screen.getByText('Les 2 documents partiront ensemble.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Envoyer à Nora' }));

    expect(await screen.findByText('C’est envoyé !')).toBeInTheDocument();

    // Dans l'ordre, puis « terminé » — jamais avant la dernière.
    expect(envoyerScanMobile).toHaveBeenCalledTimes(2);
    expect(envoyerScanMobile.mock.calls[0][1]).toBe(page1);
    expect(envoyerScanMobile.mock.calls[1][1]).toBe(page2);
    expect(terminerScanMobile).toHaveBeenCalledTimes(1);
    expect(terminerScanMobile.mock.invocationCallOrder[0])
      .toBeGreaterThan(envoyerScanMobile.mock.invocationCallOrder[1]);
  });

  test('le téléphone prend le style du site, qu’il ne peut connaître que par le serveur', async () => {
    lireScanMobile.mockResolvedValue({
      data: { profPrenom: 'Nora', matiere: 'Mathématiques', dejaEnvoye: false, blueSky: true },
    });

    render(<ScanMobile />);
    await screen.findByRole('heading', { name: 'Envoie ta copie à Nora' });

    // L'appareil n'a ni compte ni rien en mémoire : sans cette réponse, la
    // page resterait au style d'origine pendant que le reste du site bascule.
    expect(document.documentElement.getAttribute('data-da')).toBe('blue-sky');

    // Et on ne laisse pas le style sur le document des tests suivants.
    document.documentElement.removeAttribute('data-da');
    window.localStorage.removeItem('mimia_style');
  });

  test('sans Blue Sky, la page garde le style d’origine', async () => {
    lireScanMobile.mockResolvedValue({
      data: { profPrenom: 'Nora', matiere: 'Mathématiques', dejaEnvoye: false, blueSky: false },
    });

    render(<ScanMobile />);
    await screen.findByRole('heading', { name: 'Envoie ta copie à Nora' });

    expect(document.documentElement.getAttribute('data-da')).toBeNull();
  });

  test('un QR code expiré le dit, sans rien proposer d’envoyer', async () => {
    lireScanMobile.mockRejectedValue({ response: { status: 404 } });

    render(<ScanMobile />);

    expect(await screen.findByText('Ce QR code a expiré')).toBeInTheDocument();
    expect(screen.queryByText(/Prendre la photo/)).not.toBeInTheDocument();
  });

  test('un QR code déjà utilisé ne renvoie pas une seconde photo', async () => {
    lireScanMobile.mockResolvedValue({ data: { profPrenom: 'Nora', matiere: 'Mathématiques', dejaEnvoye: true } });

    render(<ScanMobile />);

    expect(await screen.findByText('Tes documents sont déjà partis')).toBeInTheDocument();
    expect(screen.queryByText(/Prendre la photo/)).not.toBeInTheDocument();
  });
});
