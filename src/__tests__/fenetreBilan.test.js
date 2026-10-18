import { fireEvent, render, screen } from '@testing-library/react';
import FenetreBilan, { nomDuPdf } from '../components/FenetreBilan';

/*
 * LE BILAN HEBDOMADAIRE SUR LE SITE — Camara, le 17/10/2026 : le bouton « Voir
 * le bilan hebdomadaire » ouvre le bilan, tel que le courriel.
 */
describe('la fenêtre du bilan hebdomadaire', () => {
  it('attend, puis montre le bilan dans un cadre isolé', async () => {
    const charger = jest.fn().mockResolvedValue({ data: '<html><head></head><body><h1>Bilan de Bilal</h1></body></html>' });
    render(<FenetreBilan prenom="Bilal" charger={charger} onFermer={() => {}} />);

    expect(screen.getByRole('dialog', { name: 'Le bilan de la semaine de Bilal' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Le professeur prépare le bilan');

    const cadre = await screen.findByTitle('Bilan de la semaine de Bilal');
    expect(cadre).toHaveAttribute('sandbox', 'allow-popups allow-popups-to-escape-sandbox');
    expect(cadre.getAttribute('srcdoc')).toContain('<base target="_blank">');
    expect(charger).toHaveBeenCalledTimes(1);
  });

  it('nomme le PDF sans accents ni espaces, daté du jour', () => {
    expect(nomDuPdf('Éloïse Marie', new Date('2026-10-17T10:00:00Z'))).toBe('bilan-eloise-marie-2026-10-17.pdf');
    expect(nomDuPdf(null, new Date('2026-10-17T10:00:00Z'))).toBe('bilan-enfant-2026-10-17.pdf');
  });

  it('le bouton « Télécharger en PDF » paraît avec le bilan', async () => {
    render(<FenetreBilan prenom="Bilal" charger={() => Promise.resolve({ data: '<html><body>Bilan</body></html>' })} onFermer={() => {}} />);
    expect(screen.queryByRole('button', { name: /Télécharger en PDF/ })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Télécharger en PDF/ })).toBeEnabled();
  });

  it('sans semaine à résumer, le dit ; Échap referme', async () => {
    const onFermer = jest.fn();
    render(<FenetreBilan prenom="Bilal" charger={() => Promise.reject({ response: { status: 404 } })} onFermer={onFermer} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('le premier arrive lundi');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onFermer).toHaveBeenCalled();
  });
});
