import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import RetraitNotion, { useRetraitNotion } from '../components/RetraitNotion';
import {
  retraitPropose, retraitEnAttente, marquerClicRetrait, retirerBalisesRetrait, retirerMarqueurClicRetrait,
} from '../lib/storage/retraitNotion';
import { decouper, texteParle } from '../lib/storage/ardoise';
import { retirerMarqueursApplication } from '../lib/storage/texteAffiche';

/**
 * SIGNALEMENT #67 v7 — le retrait d'une notion du programme passe UNIQUEMENT par un bouton.
 *
 *   - les boutons ne s'affichent que sous la balise du SERVEUR (pas sous celle que le professeur écrit) ;
 *   - le clic sur « Oui » appelle la route, puis envoie le tour ; « Non » n'appelle rien ;
 *   - les boutons sont désactivés après le clic (pas de double envoi) ;
 *   - aucune balise ni aucun marqueur ne se voit ni ne s'entend.
 */

jest.mock('../lib/api/elevesApi', () => ({ retirerNotionDuProgramme: jest.fn() }));

const LIBELLE = 'Réaliser un titrage par suivi pH-métrique';
const BOUTON = `[RETRAIT_BOUTON]controle=42|id=7|libelle=${LIBELLE}[/RETRAIT_BOUTON]`;
const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu) => ({ role: 'user', contenu });

const affiche = (texte) => decouper(texte)
  .filter((s) => s.type === 'texte')
  .map((s) => s.contenu)
  .join(' ');

describe('la balise du serveur', () => {
  test('elle donne le contrôle, la ligne et le libellé', () => {
    expect(retraitPropose(`Clique si tu veux la retirer. [RETRAIT_PROPOSE] id=7\n\n${BOUTON}`))
      .toEqual({ controleId: 42, notionId: 7, libelle: LIBELLE });
  });

  test('la balise du professeur seule ne donne AUCUN bouton', () => {
    expect(retraitPropose('Clique si tu veux la retirer. [RETRAIT_PROPOSE] id=7')).toBeNull();
    expect(retraitPropose('Je la retire, c’est fait.')).toBeNull();
  });

  test('les boutons ne valent que pour le DERNIER message, s’il est du professeur', () => {
    expect(retraitEnAttente([eleve('retire les titrages'), prof(`Clique. ${BOUTON}`)])).not.toBeNull();
    expect(retraitEnAttente([prof(`Clique. ${BOUTON}`), eleve('oui')])).toBeNull();
    expect(retraitEnAttente([prof(`Clique. ${BOUTON}`), eleve('oui'), prof('D’accord.')])).toBeNull();
    expect(retraitEnAttente([])).toBeNull();
  });
});

describe('rien ne se voit ni ne s’entend', () => {
  const texte = `Tu peux la retirer avec le bouton. [RETRAIT_PROPOSE] id=7\n\n${BOUTON}`;

  test('ni la balise du professeur, ni celle du serveur', () => {
    expect(affiche(texte)).not.toMatch(/RETRAIT_|controle=|libelle=/);
    expect(texteParle(texte)).not.toMatch(/RETRAIT_|controle=|libelle=/);
    expect(affiche(texte)).toContain('Tu peux la retirer avec le bouton.');
    expect(retirerBalisesRetrait('[RETRAIT_PROPOSE] « Cinétique chimique »')).toBe('');
  });

  test('le marqueur du clic ne se voit pas dans la bulle de l’élève', () => {
    const message = marquerClicRetrait(LIBELLE, 7, true);
    expect(message).toBe(`Oui, retire « ${LIBELLE} » de mon programme.\n[RETRAIT_CLIC:RETIREE id=7]`);
    expect(retirerMarqueurClicRetrait(message)).toBe(`Oui, retire « ${LIBELLE} » de mon programme.`);
    expect(retirerMarqueursApplication(message)).toBe(`Oui, retire « ${LIBELLE} » de mon programme.`);
    expect(retirerMarqueursApplication(marquerClicRetrait(LIBELLE, 7, false))).toBe(`Non, je garde « ${LIBELLE} ».`);
  });
});

function Banc({ messages, envoyerTexte, retirer }) {
  const r = useRetraitNotion(messages, '5', envoyerTexte, retirer);
  if (!r.attendu) return <p>pas de bouton</p>;
  return <RetraitNotion libelle={r.attendu.libelle} onRepondre={r.repondre} desactive={r.desactive} erreur={r.erreur} />;
}

describe('les boutons', () => {
  test('aucun bouton sans la balise du serveur', () => {
    render(<Banc messages={[prof('Tu veux la retirer ? [RETRAIT_PROPOSE] id=7')]} envoyerTexte={jest.fn()} retirer={jest.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('pas de bouton')).toBeInTheDocument();
  });

  test('« Oui » appelle la route (élève, contrôle, ligne, libellé), puis envoie le tour ; boutons désactivés', async () => {
    const envoyerTexte = jest.fn();
    let finir;
    const retirer = jest.fn(() => new Promise((ok) => { finir = ok; }));
    render(<Banc messages={[prof(`Clique. ${BOUTON}`)]} envoyerTexte={envoyerTexte} retirer={retirer} />);

    const oui = screen.getByRole('button', { name: `Oui, retirer « ${LIBELLE} »` });
    fireEvent.click(oui);

    expect(retirer).toHaveBeenCalledWith('5', 42, 7, LIBELLE);
    // Pendant l'appel : désactivés, et rien n'est encore parti vers le professeur.
    await waitFor(() => expect(oui).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Non, la garder' })).toBeDisabled();
    expect(envoyerTexte).not.toHaveBeenCalled();

    // Double clic : aucun second appel.
    fireEvent.click(oui);
    expect(retirer).toHaveBeenCalledTimes(1);

    await act(async () => { finir({ data: {} }); });
    expect(envoyerTexte).toHaveBeenCalledWith(marquerClicRetrait(LIBELLE, 7, true));
    expect(oui).toBeDisabled();
  });

  test('« Non » n’appelle PAS la route et envoie « GARDÉE »', async () => {
    const envoyerTexte = jest.fn();
    const retirer = jest.fn();
    render(<Banc messages={[prof(`Clique. ${BOUTON}`)]} envoyerTexte={envoyerTexte} retirer={retirer} />);

    fireEvent.click(screen.getByRole('button', { name: 'Non, la garder' }));

    expect(retirer).not.toHaveBeenCalled();
    expect(envoyerTexte).toHaveBeenCalledWith(marquerClicRetrait(LIBELLE, 7, false));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Non, la garder' })).toBeDisabled());
  });

  test('échec de la route : rien n’est envoyé, la notion reste, on peut réessayer', async () => {
    const envoyerTexte = jest.fn();
    const retirer = jest.fn().mockRejectedValue({ response: { status: 409 } });
    render(<Banc messages={[prof(`Clique. ${BOUTON}`)]} envoyerTexte={envoyerTexte} retirer={retirer} />);

    fireEvent.click(screen.getByRole('button', { name: `Oui, retirer « ${LIBELLE} »` }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ton programme ne peut pas rester vide');
    expect(envoyerTexte).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: `Oui, retirer « ${LIBELLE} »` })).toBeEnabled();
  });

  test('une même notion reproposée plus tard a de nouveau ses boutons', async () => {
    const envoyerTexte = jest.fn();
    const premier = [prof(`Clique. ${BOUTON}`)];
    const { rerender } = render(<Banc messages={premier} envoyerTexte={envoyerTexte} retirer={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Non, la garder' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Non, la garder' })).toBeDisabled());

    rerender(<Banc
      messages={[...premier, eleve(marquerClicRetrait(LIBELLE, 7, false)), prof(`Tu veux toujours ? ${BOUTON}`)]}
      envoyerTexte={envoyerTexte}
      retirer={jest.fn()}
    />);
    expect(screen.getByRole('button', { name: 'Non, la garder' })).toBeEnabled();
  });
});
