import { render, screen, waitFor } from '@testing-library/react';
import RevenuTotal from '../components/RevenuTotal';
import { getRevenu } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({ getRevenu: jest.fn() }));

const sept = {
  disponible: true,
  totalEuros: 234.5,
  mensualites: 2,
  mensuelsEuros: 198,
  annuelsAbonnements: 1,
  annuelsMois: 1,
  annuelsEuros: 36.5,
  packs: 0,
  packsEuros: 0,
  lignes: [
    { code: 'FAMILLE', libelle: 'Famille', periodicite: 'Mensuel', nombre: 2, abonnements: 2, prixCentimes: 9900, euros: 198 },
    { code: 'SOLO', libelle: 'Solo', periodicite: 'Annuel', nombre: 1, abonnements: 1, prixCentimes: 43800, euros: 36.5 },
  ],
};

const texte = () => document.body.textContent.replace(/\s/g, ' ');

describe('RevenuTotal — ce que le produit rapporte', () => {
  beforeEach(() => getRevenu.mockReset());

  it('au jour, explique qu’il faut choisir le mois ou l’année', async () => {
    getRevenu.mockResolvedValue({ data: { disponible: false } });
    render(<RevenuTotal periode="jour" decalage={0} coutEuros={8} />);
    expect(await screen.findByText(/se paient au mois ou à l'année/)).toBeInTheDocument();
    expect(texte()).not.toMatch(/Bénéfice|Perte/);
  });

  it('dit combien d’annuels sont ajoutés et que leur prix est divisé par 12', async () => {
    getRevenu.mockResolvedValue({ data: sept });
    render(<RevenuTotal periode="mois" decalage={0} coutEuros={10} />);
    await waitFor(() => expect(texte()).toMatch(/1 abonnement annuel ajouté au calcul — prix annuel divisé par 12/));
    expect(texte()).toMatch(/438,00 € ÷ 12 = 36,50 € par mois/);
    expect(texte()).toMatch(/2 × 99,00 €/);
  });

  it('affiche un bénéfice quand le revenu dépasse le coût', async () => {
    getRevenu.mockResolvedValue({ data: sept });
    render(<RevenuTotal periode="mois" decalage={0} coutEuros={10} />);
    await waitFor(() => expect(texte()).toMatch(/Bénéfice du mois/));
    expect(texte()).toMatch(/\+224,50 €/);
  });

  it('affiche une perte quand le coût dépasse le revenu', async () => {
    getRevenu.mockResolvedValue({ data: sept });
    render(<RevenuTotal periode="annee" decalage={0} coutEuros={300} />);
    await waitFor(() => expect(texte()).toMatch(/Perte de l'année/));
    expect(texte()).toMatch(/−65,50 €/);
  });
});

describe('RevenuTotal — selon les droits', () => {
  beforeEach(() => getRevenu.mockReset());

  it('sans le droit « revenu », le bloc est caché mais toujours là', async () => {
    getRevenu.mockResolvedValue({ data: sept });
    render(<RevenuTotal periode="mois" decalage={0} coutEuros={10} visible={false} />);
    await waitFor(() => expect(getRevenu).toHaveBeenCalled());
    const bloc = screen.getByRole('region', { hidden: true });
    expect(bloc).toBeInTheDocument();
    expect(bloc).not.toBeVisible();
  });

  it('sans le droit « cout », ni bénéfice ni perte : ils trahiraient le coût', async () => {
    getRevenu.mockResolvedValue({ data: sept });
    render(<RevenuTotal periode="mois" decalage={0} coutEuros={10} afficherResultat={false} />);
    await waitFor(() => expect(texte()).toMatch(/Abonnements mensuels/));
    expect(texte()).not.toMatch(/Bénéfice|Perte|coûtés/);
  });

  it('porte le choix de la période quand le bloc du coût est caché', async () => {
    getRevenu.mockResolvedValue({ data: sept });
    render(<RevenuTotal periode="mois" decalage={0} coutEuros={10} entete={<div>Choix de période</div>} />);
    expect(await screen.findByText('Choix de période')).toBeInTheDocument();
  });
});
