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
import { envoyerScanMobile, lireScanMobile } from '../lib/api/scanMobileApi';
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
  test('le QR code s’affiche, puis la photo arrivée est remise à la séance UNE fois', async () => {
    creerScanMobile.mockResolvedValue({ data: { jeton: 'abc123', expireLe: '2099-01-01T00:00:00Z' } });

    const piece = { id: 77, nomFichier: 'photo.jpg', typeMime: 'image/jpeg', taille: 1000 };
    etatScanMobile
      .mockResolvedValueOnce({ data: { etat: 'attente', piece: null } })
      .mockResolvedValue({ data: { etat: 'recu', piece } });

    const onRecu = jest.fn();

    render(
      <ScanMobileModale conversationId={5} profPrenom="Nora" onRecu={onRecu} onFermer={jest.fn()} intervalle={10} />,
    );

    expect(await screen.findByAltText(/QR code/)).toBeInTheDocument();
    expect(screen.getByText(/Prends ta copie en photo et envoie-la à Nora/)).toBeInTheDocument();

    expect(await screen.findByText(/C’est arrivé !/)).toBeInTheDocument();
    expect(onRecu).toHaveBeenCalledTimes(1);
    expect(onRecu).toHaveBeenCalledWith(piece);

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

    render(<ScanMobile />);

    expect(await screen.findByText('Envoie ta copie à Nora')).toBeInTheDocument();

    const photo = new File(['x'], 'copie.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText(/Choisir dans la galerie/), photo);

    await userEvent.click(screen.getByRole('button', { name: 'Envoyer à Nora' }));

    expect(await screen.findByText('C’est envoyé !')).toBeInTheDocument();
    expect(envoyerScanMobile).toHaveBeenCalledWith('abc123', photo, expect.any(Object));
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

    expect(await screen.findByText('Ta photo est déjà partie')).toBeInTheDocument();
    expect(screen.queryByText(/Prendre la photo/)).not.toBeInTheDocument();
  });
});
