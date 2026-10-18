import { fireEvent, render, screen, within } from '@testing-library/react';
import SignaturesMail from '../components/SignaturesMail';
import { getSignatures, apercuSignature, apercuSignatureCompte } from '../lib/api/adminApi';

/*
 * LES SIGNATURES — Camara, le 17/10/2026 : un bouton « Aperçu » sur chaque
 * compte de « Qui signe avec quoi » montre sa signature, telle que ses
 * destinataires la verront.
 */
jest.mock('../lib/api/adminApi', () => ({
  getSignatures: jest.fn(),
  creerSignature: jest.fn(),
  modifierSignature: jest.fn(),
  supprimerSignature: jest.fn(),
  apercuSignature: jest.fn(),
  attribuerSignature: jest.fn(),
  apercuSignatureCompte: jest.fn(),
}));

describe('les signatures', () => {
  beforeEach(() => {
    getSignatures.mockResolvedValue({
      data: {
        modeles: [{ id: 1, nom: 'Signature Mimia', parDefaut: true, nombreComptes: 0, couleur: '#16233a' }],
        signataires: [
          { parentId: 10, prenom: 'Minamba', nom: 'Camara', mail: 'ceo@mimia.fr', role: 'Super-admin', signatureId: null, adresseBoite: null },
        ],
      },
    });
    apercuSignature.mockResolvedValue({ data: '<p>modèle</p>' });
    apercuSignatureCompte.mockResolvedValue({ data: '<p>Minamba Camara</p>' });
  });

  it('le bouton Aperçu d’un compte ouvre sa signature', async () => {
    render(<SignaturesMail />);
    expect(await screen.findByText('Super-admin')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Aperçu' }));

    const fenetre = await screen.findByRole('dialog', { name: 'Signature de ceo@mimia.fr' });
    expect(apercuSignatureCompte).toHaveBeenCalledWith(10);
    expect(await within(fenetre).findByTitle('Aperçu de la signature')).toHaveAttribute('srcdoc', expect.stringContaining('Minamba Camara'));

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
