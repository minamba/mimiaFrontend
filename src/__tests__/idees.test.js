import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rendreTexteRiche, entourerSelection } from '../lib/utils/texteRiche';
import IdeesAdmin from '../components/IdeesAdmin';
import * as api from '../lib/api/ideesApi';

jest.mock('../lib/api/ideesApi');
jest.mock('../lib/impression', () => ({
  imprimerSous: jest.fn(),
  nomDocument: jest.fn(() => 'Mimia--test'),
}));

const { imprimerSous } = require('../lib/impression');

const IDEE = {
  id: 7,
  titre: 'Relancer la séance depuis le compte parent',
  urgence: 'Haute',
  description: 'Il faudrait **un bouton**.',
  statut: 'Nouvelle',
  dateCreation: '2026-09-17T10:00:00Z',
  pieces: [],
};

// jsdom n'implémente pas revokeObjectURL. Le composant libère ses adresses
// locales au démontage — c'est voulu, et sans ce bouchon chaque test qui charge
// une pièce échouerait au nettoyage plutôt que sur ce qu'il vérifie.
URL.revokeObjectURL = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  api.getIdees.mockResolvedValue({ data: [IDEE] });
  api.getIdee.mockResolvedValue({ data: IDEE });
  api.creerIdee.mockResolvedValue({ data: { ...IDEE, id: 8 } });
  api.modifierIdee.mockResolvedValue({ data: IDEE });
  api.supprimerIdee.mockResolvedValue({});
  api.chargerPieceIdee.mockResolvedValue('blob:fausse');
  api.ajouterPieceIdee.mockResolvedValue({ data: { id: 9, rang: 1, genre: 'image' } });
});

// ---------------------------------------------------------- le rendu balisé

describe('rendreTexteRiche', () => {
  const afficher = (elements) => render(<div>{elements}</div>);

  test('le gras et l’italique deviennent des balises, pas du texte', () => {
    afficher(rendreTexteRiche('Un **mot** et un _autre_.', () => null));

    expect(screen.getByText('mot').tagName).toBe('STRONG');
    expect(screen.getByText('autre').tagName).toBe('EM');
  });

  test('un lien http s’ouvre ailleurs, sans fuite de référent', () => {
    afficher(rendreTexteRiche('Voir [la maquette](https://exemple.fr/a).', () => null));

    const lien = screen.getByRole('link', { name: 'la maquette' });

    expect(lien).toHaveAttribute('href', 'https://exemple.fr/a');
    expect(lien).toHaveAttribute('target', '_blank');
    expect(lien).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(lien).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  /**
   * LE TEST QUI COMPTE. `javascript:` dans un `href` s’exécute au clic : si le
   * rendu l’acceptait, un texte collé depuis ailleurs deviendrait du code.
   */
  test('un lien javascript: n’est PAS un lien', () => {
    afficher(rendreTexteRiche('[clique](javascript:alert(1))', () => null));

    expect(screen.queryByRole('link')).toBeNull();
    // Par le PARAGRAPHE entier, et non par le texte exact : le découpage
    // s'arrête à la première parenthèse fermante, donc la chaîne est répartie
    // sur deux éléments. Ce qui compte est qu'elle soit AFFICHÉE telle quelle,
    // pas en combien de morceaux elle l'est.
    expect(screen.getByText(
      (contenu, element) => element?.tagName === 'P'
        && element.textContent === '[clique](javascript:alert(1))',
    )).toBeInTheDocument();
  });

  test('du HTML collé reste du texte affiché, jamais interprété', () => {
    afficher(rendreTexteRiche('<img src=x onerror=alert(1)>', () => null));

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText(/<img src=x onerror=alert\(1\)>/)).toBeInTheDocument();
  });

  test('[image:N] prend l’adresse du rang demandé', () => {
    afficher(rendreTexteRiche('Avant [image:2] après', (r) => `blob:${r}`));

    expect(screen.getByRole('img', { name: 'Illustration 2' })).toHaveAttribute('src', 'blob:2');
  });

  test('un marqueur sans image ne laisse pas d’image cassée', () => {
    afficher(rendreTexteRiche('[image:9]', () => null));

    expect(screen.queryByRole('img')).toBeNull();
  });

  /**
   * Camara, le 17/09/2026 : coller une adresse doit suffire. Personne
   * n'écrit `[texte](adresse)` pour déposer une référence en vitesse.
   */
  test('une adresse collée telle quelle devient cliquable', () => {
    afficher(rendreTexteRiche('Voir https://exemple.fr/a/b ici', () => null));

    const lien = screen.getByRole('link');
    expect(lien).toHaveAttribute('href', 'https://exemple.fr/a/b');
    expect(lien).toHaveTextContent('https://exemple.fr/a/b');
  });

  /**
   * LE POINT FINAL N'APPARTIENT PAS À L'ADRESSE. Sans ce soin, le lien mène
   * à une page qui n'existe pas, et l'erreur ne se voit qu'au clic.
   */
  test('la ponctuation de fin de phrase reste au texte', () => {
    afficher(rendreTexteRiche('Voir https://exemple.fr.', () => null));

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://exemple.fr');
  });

  test('une adresse javascript: n’est toujours pas un lien', () => {
    afficher(rendreTexteRiche(`${'java'}script:alert(1)`, () => null));

    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('entourerSelection', () => {
  test('entoure la sélection et garde le mot sélectionné', () => {
    const r = entourerSelection('un mot ici', 3, 6, '**');

    expect(r.texte).toBe('un **mot** ici');
    expect('un **mot** ici'.slice(r.debut, r.fin)).toBe('mot');
  });

  test('sans sélection, le curseur se pose ENTRE les deux balises', () => {
    const r = entourerSelection('ab', 1, 1, '_');

    expect(r.texte).toBe('a__b');
    expect(r.debut).toBe(2);
    expect(r.fin).toBe(2);
  });
});

// ------------------------------------------------------------- le carnet

describe('IdeesAdmin', () => {
  test('la liste montre le titre, l’urgence et le statut', async () => {
    render(<IdeesAdmin />);

    expect(await screen.findByText(IDEE.titre)).toBeInTheDocument();
    // Dans le TABLEAU : « Haut » est aussi une option du filtre d'urgence.
    expect(within(screen.getByRole('table')).getByText('Haut')).toBeInTheDocument();
    expect(screen.getByLabelText(`Statut de ${IDEE.titre}`)).toHaveValue('Nouvelle');
  });

  /**
   * UNE IDÉE NAÎT « NOUVEAU », et le formulaire de création ne doit donc pas
   * proposer de statut : l'afficher laisserait croire qu'on peut le choisir.
   */
  test('la création ne propose aucun statut', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);

    await userEvent.click(screen.getByRole('button', { name: /nouvelle idée/i }));

    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    // Par l'ÉTIQUETTE et non par le texte : « Statut » est aussi un en-tête
    // de colonne du tableau, qui lui est toujours là.
    expect(screen.queryByLabelText('Statut')).toBeNull();
  });

  test('la modification propose les huit statuts', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);

    await userEvent.click(screen.getAllByRole('button', { name: /^Modifier / })[0]);

    const liste = screen.getByLabelText('Statut');
    expect(within(liste).getAllByRole('option')).toHaveLength(8);
    expect(within(liste).getByRole('option', { name: 'Abandonnée' })).toBeInTheDocument();
  });

  test('créer une idée envoie le titre et l’urgence, sans statut', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);

    await userEvent.click(screen.getByRole('button', { name: /nouvelle idée/i }));
    await userEvent.type(screen.getByLabelText(/titre/i), 'Un bouton de relance');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(api.creerIdee).toHaveBeenCalled());

    const envoye = api.creerIdee.mock.calls[0][0];
    expect(envoye.titre).toBe('Un bouton de relance');
    expect(envoye.urgence).toBe('Moyenne');
    expect(envoye.statut).toBeUndefined();
  });

  test('changer le statut depuis le tableau n’ouvre pas le formulaire', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);

    await userEvent.selectOptions(
      screen.getByLabelText(`Statut de ${IDEE.titre}`), 'En test',
    );

    await waitFor(() => expect(api.modifierIdee).toHaveBeenCalled());
    expect(api.modifierIdee.mock.calls[0][1].statut).toBe('En test');
    expect(screen.queryByRole('button', { name: 'Enregistrer' })).toBeNull();
  });

  test('la suppression demande confirmation et NOMME l’idée', async () => {
    const confirmer = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getAllByRole('button', { name: /^Supprimer / })[0]);

    expect(confirmer.mock.calls[0][0]).toContain(IDEE.titre);
    expect(api.supprimerIdee).not.toHaveBeenCalled();

    confirmer.mockRestore();
  });

  test('l’aperçu montre l’idée mise en forme', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);

    await userEvent.click(screen.getAllByRole('button', { name: /^Aperçu de / })[0]);

    const fenetre = await screen.findByRole('dialog');
    expect(within(fenetre).getByText('un bouton').tagName).toBe('STRONG');
  });

  test('le PDF imprime la feuille seule, pas les boutons', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);

    await userEvent.click(screen.getAllByRole('button', { name: /^Aperçu de / })[0]);
    await userEvent.click(await screen.findByRole('button', { name: /télécharger en pdf/i }));

    expect(imprimerSous).toHaveBeenCalledWith(expect.any(String), '.idee-apercu');
  });

  /**
   * LE GESTE NATUREL : on fait sa capture, on colle. Une capture qu'on doit
   * d'abord ranger sur son disque est une capture qu'on ne joint pas.
   */
  test('coller une capture la téléverse et pose son marqueur', async () => {
    api.ajouterPieceIdee.mockResolvedValue({ data: { id: 9, rang: 1, genre: 'image' } });

    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getAllByRole('button', { name: /^Modifier / })[0]);

    const champ = screen.getByRole('textbox', { name: /description/i });
    const presseP = {
      items: [{
        kind: 'file',
        type: 'image/png',
        getAsFile: () => new File(['xx'], 'capture.png', { type: 'image/png' }),
      }],
    };

    fireEvent.paste(champ, { clipboardData: presseP });

    await waitFor(() => expect(api.ajouterPieceIdee).toHaveBeenCalled());
    expect(api.ajouterPieceIdee.mock.calls[0][0]).toBe(IDEE.id);
    await waitFor(() => expect(champ.value).toContain('[image:1]'));
  });

  /**
   * UNE IMAGE SE RANGE À CÔTÉ DE SON IDÉE : sur une idée jamais enregistrée,
   * on l'enregistre d'abord plutôt que de refuser l'image.
   */
  test('coller sur une idée neuve l’enregistre d’abord', async () => {
    api.ajouterPieceIdee.mockResolvedValue({ data: { id: 9, rang: 1, genre: 'image' } });

    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getByRole('button', { name: /nouvelle idée/i }));
    await userEvent.type(screen.getByLabelText(/titre/i), 'Une idée neuve');

    const presseP = {
      items: [{
        kind: 'file',
        type: 'image/png',
        getAsFile: () => new File(['xx'], 'c.png', { type: 'image/png' }),
      }],
    };

    fireEvent.paste(screen.getByRole('textbox', { name: /description/i }), {
      clipboardData: presseP,
    });

    await waitFor(() => expect(api.creerIdee).toHaveBeenCalled());
    await waitFor(() => expect(api.ajouterPieceIdee).toHaveBeenCalled());
  });

  test('sans titre, le collage explique au lieu d’échouer en silence', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getByRole('button', { name: /nouvelle idée/i }));

    const presseP = {
      items: [{
        kind: 'file',
        type: 'image/png',
        getAsFile: () => new File(['xx'], 'c.png', { type: 'image/png' }),
      }],
    };

    fireEvent.paste(screen.getByRole('textbox', { name: /description/i }), {
      clipboardData: presseP,
    });

    expect(await screen.findByText(/donne un titre/i)).toBeInTheDocument();
    expect(api.ajouterPieceIdee).not.toHaveBeenCalled();
  });

  test('l’aperçu est accessible depuis le formulaire, sans enregistrer', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getByRole('button', { name: /nouvelle idée/i }));
    await userEvent.type(screen.getByLabelText(/titre/i), 'Brouillon');

    await userEvent.click(screen.getByRole('button', { name: 'Aperçu du brouillon' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(api.creerIdee).not.toHaveBeenCalled();
  });
});

// -------------------------------------------------------- les pièces jointes

/**
 * TROIS GENRES, UN SEUL DÉPÔT — Camara, le 17/09/2026 : « si c'est une image,
 * on l'affiche, si c'est un autre document, il sera juste mis en pj
 * téléchargeable », et un audio « qu'on va pouvoir lire directement dans
 * l'aperçu ».
 *
 * CE QUE CES TESTS PROTÈGENT
 * -------------------------
 * Le piège est le RANG. `[image:N]` cite le rang d'une image ; si un PDF ou un
 * audio prenait un numéro dans la même suite, toutes les images postérieures se
 * décaleraient d'un cran par rapport à leurs marqueurs — sans erreur nulle
 * part, juste la mauvaise image au mauvais endroit. Le serveur rend donc un
 * rang à 0 pour tout ce qui n'est pas une image, et le formulaire ne doit RIEN
 * écrire dans le texte quand il le reçoit.
 */
const AUDIO = {
  id: 21, rang: 0, genre: 'audio', nomFichier: 'note-vocale.m4a', typeMime: 'audio/x-m4a', taille: 350000,
};

const DOCUMENT = {
  id: 22, rang: 0, genre: 'document', nomFichier: 'maquettes.pdf', typeMime: 'application/pdf', taille: 2200000,
};

const joindre = async (piece) => {
  api.ajouterPieceIdee.mockResolvedValue({ data: piece });
  api.getIdee.mockResolvedValue({ data: { ...IDEE, pieces: [piece] } });
  api.getIdees.mockResolvedValue({ data: [{ ...IDEE, pieces: [piece] }] });

  render(<IdeesAdmin />);
  await screen.findByText(IDEE.titre);
  await userEvent.click(screen.getAllByRole('button', { name: /^Modifier / })[0]);
};

describe('Les pièces jointes', () => {
  test('le bouton « lien » a disparu, le trombone l’a remplacé', async () => {
    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getAllByRole('button', { name: /^Modifier / })[0]);

    expect(screen.queryByTitle('Lien')).toBeNull();
    expect(screen.getByRole('button', { name: /joindre un fichier/i })).toBeInTheDocument();
  });

  test('un audio joint n’écrit AUCUN marqueur dans la description', async () => {
    await joindre(AUDIO);

    const champ = screen.getByRole('textbox', { name: /description/i });
    const avant = champ.value;

    await userEvent.upload(
      screen.getByLabelText(/fichier à joindre/i),
      new File(['xx'], 'note-vocale.m4a', { type: 'audio/x-m4a' }),
    );

    await waitFor(() => expect(api.ajouterPieceIdee).toHaveBeenCalled());
    expect(champ.value).toBe(avant);
  });

  test('la pièce jointe apparaît sous le champ, avec son poids', async () => {
    await joindre(DOCUMENT);

    await userEvent.upload(
      screen.getByLabelText(/fichier à joindre/i),
      new File(['xx'], 'maquettes.pdf', { type: 'application/pdf' }),
    );

    expect(await screen.findByText('maquettes.pdf')).toBeInTheDocument();
    expect(screen.getByText('2.1 Mo')).toBeInTheDocument();
  });

  test('l’aperçu donne un lecteur pour l’audio', async () => {
    api.getIdees.mockResolvedValue({ data: [{ ...IDEE, pieces: [AUDIO] }] });

    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getAllByRole('button', { name: /^Aperçu / })[0]);

    const fenetre = await screen.findByRole('dialog');

    expect(within(fenetre).getByText(/note-vocale\.m4a/)).toBeInTheDocument();
    await waitFor(() => expect(
      within(fenetre).getByText(/pièces jointes/i),
    ).toBeInTheDocument());
  });

  test('l’aperçu propose de télécharger un document, sans le charger avant', async () => {
    api.getIdees.mockResolvedValue({ data: [{ ...IDEE, pieces: [DOCUMENT] }] });

    render(<IdeesAdmin />);
    await screen.findByText(IDEE.titre);
    await userEvent.click(screen.getAllByRole('button', { name: /^Aperçu / })[0]);

    const fenetre = await screen.findByRole('dialog');

    // LES OCTETS NE DESCENDENT PAS À L'OUVERTURE : un PDF de maquettes pèse
    // plus lourd que toute l'idée, et on ouvre l'aperçu pour relire le texte.
    expect(api.chargerPieceIdee).not.toHaveBeenCalled();
    expect(within(fenetre).getByRole('button', { name: /télécharger$/i })).toBeInTheDocument();
  });
});
