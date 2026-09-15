/**
 * LA FICHE D'UN CONTRÔLE.
 *
 * Trois garanties, dont deux sont des règles du projet et non des détails
 * d'affichage :
 *
 * 1. L'ÉTAT D'UNE NOTION EST ÉCRIT EN TOUTES LETTRES, jamais porté par la
 *    seule couleur de sa puce — un enfant daltonien lit cette page comme les
 *    autres.
 * 2. PÉRIMÈTRE INCONNU, AUCUN « 0 % » — même raison que sur l'accueil.
 * 3. « SUPPRIMER » DEMANDE CONFIRMATION AVANT d'appeler l'API. Un contrôle
 *    supprimé l'est pour de bon : il n'y a pas de corbeille.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ControleFiche from '../components/ControleFiche';
import { getControle, getMatieresEleve, supprimerControle } from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi', () => ({
  getControle: jest.fn(),
  getMatieresEleve: jest.fn(),
  supprimerControle: jest.fn(),
  creerControle: jest.fn(),
  modifierControle: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '9', controleId: '42' }),
  useSearchParams: () => [new URLSearchParams(globalThis.__retourControle ?? '')],
  useNavigate: () => jest.fn(),
}));

const FICHE = {
  id: 42,
  matiereId: 1,
  matiereLibelle: 'Mathématiques',
  sujet: 'Les fractions',
  dateControle: '2026-09-20T00:00:00',
  heureControle: '14:00:00',
  joursRestants: 3,
  nombrePreparations: 1,
  dernierePreparationLe: '2026-09-15T10:00:00',
  preparation: {
    pourcent: 60,
    perimetreConnu: true,
    total: 3,
    acquises: 1,
    notions: [
      {
        id: 1, libelle: 'Additionner deux fractions', etat: 'acquise',
        travailleeLe: null, pourcent: 92,
      },
      {
        id: 2,
        libelle: 'Simplifier une fraction',
        etat: 'en-cours',
        travailleeLe: '2026-09-15T10:00:00',
        pourcent: 55,
      },
      {
        id: 3, libelle: 'Comparer deux fractions', etat: 'fragile',
        travailleeLe: null, pourcent: 18,
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  getMatieresEleve.mockResolvedValue({ data: [] });
  getControle.mockResolvedValue({ data: FICHE });
  supprimerControle.mockResolvedValue({});
});

test('chaque notion affiche son état en toutes lettres', async () => {
  render(<ControleFiche />);

  expect(await screen.findByText('Additionner deux fractions')).toBeInTheDocument();

  // Le mot, pas la couleur.
  expect(screen.getByText('Acquise')).toBeInTheDocument();
  expect(screen.getByText('En cours')).toBeInTheDocument();
  expect(screen.getByText('À revoir')).toBeInTheDocument();
});

test('une notion travaillée porte la date de la séance qui l’a travaillée', async () => {
  render(<ControleFiche />);

  expect(await screen.findByText(/travaillée le 15 septembre/)).toBeInTheDocument();
});

test('sans programme connu, la barre est là à 0 % et le dit en plus', async () => {
  getControle.mockResolvedValue({
    data: {
      ...FICHE,
      preparation: { pourcent: 0, perimetreConnu: false, total: 0, acquises: 0, notions: [] },
    },
  });

  render(<ControleFiche />);

  expect(await screen.findByText(/On ne sait pas encore/)).toBeInTheDocument();
  expect(screen.getByText('0 %')).toBeInTheDocument();
});

/**
 * LE DÉTAIL NOTION PAR NOTION — c'est lui qui donne sa raison d'être à la
 * fiche : un pourcentage global dit où on en est, pas PAR QUOI continuer.
 */
test('chaque notion porte sa propre barre, avec son pourcentage', async () => {
  render(<ControleFiche />);

  await screen.findByText('Additionner deux fractions');

  // Une barre pour le global, plus une par notion.
  const jauges = screen.getAllByRole('progressbar');
  expect(jauges).toHaveLength(1 + FICHE.preparation.notions.length);

  expect(screen.getByText('92 %')).toBeInTheDocument();
  expect(screen.getByText('55 %')).toBeInTheDocument();
  expect(screen.getByText('18 %')).toBeInTheDocument();
});

test('la couleur de chaque barre suit les seuils du suivi', async () => {
  const { container } = render(<ControleFiche />);

  await screen.findByText('Additionner deux fractions');

  // 92 % → acquis, 55 % → en cours, 18 % → fragile. Les mêmes seuils que
  // partout ailleurs (0,80 et 0,50), jamais des valeurs inventées ici.
  expect(container.querySelector('.controle-notion__jauge span.est-acquis')).not.toBeNull();
  expect(container.querySelector('.controle-notion__jauge span.est-encours')).not.toBeNull();
  expect(container.querySelector('.controle-notion__jauge span.est-fragile')).not.toBeNull();
});

test('« Supprimer » demande confirmation AVANT d’appeler l’API', async () => {
  render(<ControleFiche />);

  await userEvent.click(await screen.findByRole('button', { name: 'Supprimer' }));

  // La demande de confirmation est posée, et rien n'est encore parti.
  expect(screen.getByText(/Supprimer ce contrôle \?/)).toBeInTheDocument();
  expect(supprimerControle).not.toHaveBeenCalled();

  // C'est le second clic, celui de la fenêtre, qui supprime vraiment.
  const boutons = screen.getAllByRole('button', { name: 'Supprimer' });
  await userEvent.click(boutons[boutons.length - 1]);

  await waitFor(() => expect(supprimerControle).toHaveBeenCalledWith('9', '42'));
});

/**
 * APRÈS LE CONTRÔLE — le point 11 du dossier. Trois états se succèdent, et
 * chacun dit quelque chose de différent à l'enfant.
 */
describe('un contrôle passé', () => {
  const PASSE = { ...FICHE, joursRestants: -2 };

  /**
   * LE BILAN S'OUVRE PAR SON BOUTON — voulu par Camara le 14/09/2026. Le
   * professeur ne demande plus de lui-même, en cours normal, comment s'est
   * passé un contrôle : promettre qu'il le fera serait faux.
   */
  test('sans bilan, invite à faire le point, et le bouton est là', async () => {
    getControle.mockResolvedValue({ data: { ...PASSE, bilanLe: null } });

    render(<ControleFiche />);

    expect(await screen.findByText(/fais le point sur ce contrôle avec ton professeur/))
      .toBeInTheDocument();
    expect(screen.queryByText(/te demandera comment/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Faire le point sur ce contrôle' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Préparer ce contrôle' })).not.toBeInTheDocument();
  });

  test('avec une note, l’affiche en grand avec le ressenti', async () => {
    getControle.mockResolvedValue({
      data: {
        ...PASSE,
        bilanLe: '2026-09-22T10:00:00',
        note: 14,
        ressenti: 'Plus facile que prévu.',
      },
    });

    render(<ControleFiche />);

    expect(await screen.findByText('14')).toBeInTheDocument();
    expect(screen.getByText('/20')).toBeInTheDocument();
    expect(screen.getByText('Plus facile que prévu.')).toBeInTheDocument();
  });

  test('débriefé sans note, montre ce qu’il en a dit', async () => {
    getControle.mockResolvedValue({
      data: { ...PASSE, bilanLe: '2026-09-22T10:00:00', note: null, ressenti: 'Ça allait.' },
    });

    render(<ControleFiche />);

    expect(await screen.findByText('Ça allait.')).toBeInTheDocument();
  });

  /**
   * ON N'IMPOSE RIEN — la règle du produit. Un enfant qui ne veut pas revenir
   * sur son contrôle voit son refus enregistré comme une raison, pas comme une
   * attente : « note pas encore connue » lui dirait qu'on guette encore une
   * réponse qu'il a déjà refusé de donner.
   */
  test('un refus est affiché comme une raison, jamais comme une attente', async () => {
    getControle.mockResolvedValue({
      data: {
        ...PASSE,
        bilanLe: '2026-09-22T10:00:00',
        note: null,
        ressenti: 'Il n’a pas souhaité en reparler.',
        bilanClos: true,
      },
    });

    render(<ControleFiche />);

    expect(await screen.findByText('Il n’a pas souhaité en reparler.')).toBeInTheDocument();
    expect(screen.queryByText(/pas encore connue/)).not.toBeInTheDocument();
    expect(screen.queryByText(/te demandera comment/)).not.toBeInTheDocument();
  });

  test('après assez de relances, on annonce qu’il n’y aura pas de bilan', async () => {
    getControle.mockResolvedValue({
      data: { ...PASSE, bilanLe: null, note: null, ressenti: null, bilanClos: true },
    });

    render(<ControleFiche />);

    expect(await screen.findByText('Pas de bilan pour ce contrôle.')).toBeInTheDocument();

    // Surtout pas de promesse de relance : on a cessé de demander.
    expect(screen.queryByText(/te demandera comment/)).not.toBeInTheDocument();
  });

  test('ce que la copie corrigée a montré passe devant l’état mesuré', async () => {
    getControle.mockResolvedValue({
      data: {
        ...PASSE,
        bilanLe: '2026-09-22T10:00:00',
        note: 14,
        preparation: {
          ...PASSE.preparation,
          notions: [
            { id: 1, libelle: 'Additionner', etat: 'acquise', travailleeLe: null, resultat: 'reussie' },
            {
              id: 2,
              libelle: 'Simplifier',
              etat: 'fragile',
              travailleeLe: '2026-09-15T10:00:00',
              resultat: 'ratee',
            },
          ],
        },
      },
    });

    render(<ControleFiche />);

    expect(await screen.findByText('✓ réussie au contrôle')).toBeInTheDocument();
    expect(screen.getByText('✕ ratée au contrôle')).toBeInTheDocument();

    // La date de travail s'efface devant le verdict : sur une notion ratée au
    // contrôle, « travaillée le 15 » n'est plus l'information utile.
    expect(screen.queryByText(/travaillée le/)).not.toBeInTheDocument();
  });
});

/**
 * La matière ne se change plus du tout depuis le 13/09/2026 — le test qui
 * vérifiait l'avertissement « le programme repart de zéro » a disparu avec
 * l'action qu'il décrivait. Ce qui la remplace est vérifié dans
 * `controleFormValidation` : le champ est verrouillé, et l'écran renvoie vers
 * la suppression.
 */
test('« Modifier » ouvre le formulaire pré-rempli', async () => {
  render(<ControleFiche />);

  await userEvent.click(await screen.findByRole('button', { name: 'Modifier' }));

  expect(screen.getByDisplayValue('Les fractions')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Enregistrer les modifications/ })).toBeInTheDocument();
});

/**
 * LE VERDICT DU PROFESSEUR SUR LA PRÉPARATION — voulu par Camara le
 * 13/09/2026.
 *
 * Sur la carte, l'observation tient dans une infobulle ; ICI elle est le cœur
 * de la page. C'est la phrase qui dit à l'enfant quoi faire de son
 * pourcentage : une pastille verte sans raison n'apprend rien, et une rouge
 * sans raison décourage sans dire quoi faire.
 */
describe('est-il prêt ?', () => {
  const avecVerdict = (preparation) => ({
    ...FICHE,
    preparation: { ...FICHE.preparation, ...preparation },
  });

  test('la pastille, la phrase du professeur et sa date', async () => {
    getControle.mockResolvedValue({
      data: avecVerdict({
        pretStatut: 'bientot',
        pretObservation: 'Il te reste à poser le calcul avant de conclure.',
        pretLe: '2026-09-15T10:00:00',
      }),
    });

    render(<ControleFiche />);

    expect(await screen.findByText('Bientôt prêt')).toBeInTheDocument();
    expect(screen.getByText('Il te reste à poser le calcul avant de conclure.'))
      .toBeInTheDocument();

    // LE VERDICT NE PÉRIME PAS, MAIS IL SE DATE : l'enfant doit pouvoir voir
    // que « prêt » remonte à avant-hier.
    //
    // Ciblé sur la ligne de date du verdict et non sur le texte seul : la
    // fiche porte aussi « travaillée le 15 septembre » sur une notion, et un
    // premier jet trouvait deux éléments — il aurait pu passer au vert en
    // lisant la mauvaise ligne.
    expect(document.querySelector('.controle-pret__date').textContent)
      .toMatch(/ton professeur, le \w+ 15 septembre/);
  });

  /**
   * LE POURCENTAGE NE DÉCIDE JAMAIS. Le contraire aurait été le défaut le plus
   * facile à introduire — un seuil discret dans l'écran, invisible jusqu'au
   * jour où un enfant prêt lit qu'il ne l'est pas.
   */
  test('un contrôle à 100 % reste « pas encore prêt » si le professeur le dit', async () => {
    getControle.mockResolvedValue({
      data: avecVerdict({ pourcent: 100, pretStatut: 'pas-pret' }),
    });

    render(<ControleFiche />);

    expect(await screen.findByText('Pas encore prêt')).toBeInTheDocument();
    expect(screen.queryByText('Prêt pour le contrôle')).not.toBeInTheDocument();
  });

  test('sans verdict, la révision non commencée se dit telle quelle', async () => {
    getControle.mockResolvedValue({
      data: avecVerdict({ pretStatut: 'pas-commence', pretObservation: null, pretLe: null }),
    });

    render(<ControleFiche />);

    expect(await screen.findByText('Révision pas commencée')).toBeInTheDocument();

    // Aucune phrase inventée à la place de celle que le professeur n'a pas dite.
    expect(document.querySelector('.controle-pret__mot')).toBeNull();
    expect(document.querySelector('.controle-pret__date')).toBeNull();
  });
});

/**
 * POURQUOI CE STATUT ? — ajouté le 13/09/2026, à la première utilisation
 * réelle : « je vois que je suis pas encore prêt, j'aimerais comprendre
 * pourquoi ».
 *
 * La pastille affichait « Pas encore prêt » sans un mot, alors que PERSONNE
 * N'AVAIT JUGÉ : le professeur ne s'était pas prononcé et c'est le repli du
 * code qui parlait.
 *
 * LA RÈGLE, POSÉE PAR CAMARA LE MÊME JOUR : « on ne devine pas, c'est le
 * professeur qui gère ». Le statut ET sa justification viennent de lui. Un
 * premier correctif composait un constat factuel côté serveur — il paraissait
 * inoffensif puisqu'il n'énonçait que des mesures, mais il répondait à une
 * question dont la réponse n'appartient qu'à celui qui a posé le statut.
 */
describe('la justification du statut', () => {
  test('sans verdict, il n’y a NI pastille NI justification', async () => {
    getControle.mockResolvedValue({
      data: {
        ...FICHE,
        preparation: {
          ...FICHE.preparation,
          pretStatut: null,
          pretObservation: null,
          pretLe: null,
        },
      },
    });

    render(<ControleFiche />);

    await screen.findByText('Additionner deux fractions');

    // ON NE JUGE PAS À SA PLACE. Le repli rendait « Pas encore prêt », et
    // l'enfant lisait un jugement là où personne ne s'était prononcé.
    expect(document.querySelector('.pastille-pret')).toBeNull();
    expect(document.querySelector('.controle-pret__mot')).toBeNull();
    expect(screen.queryByText('Pas encore prêt')).not.toBeInTheDocument();
  });

  test('avec verdict, le statut ET sa raison viennent du professeur, signés', async () => {
    getControle.mockResolvedValue({
      data: {
        ...FICHE,
        preparation: {
          ...FICHE.preparation,
          pretStatut: 'bientot',
          pretObservation: 'Tu tiens les rapports, il te reste à poser le calcul.',
          pretLe: '2026-09-15T10:00:00',
        },
      },
    });

    render(<ControleFiche />);

    expect(await screen.findByText(/Tu tiens les rapports/)).toBeInTheDocument();
    expect(screen.getByText('Bientôt prêt')).toBeInTheDocument();
    expect(document.querySelector('.controle-pret__date').textContent)
      .toMatch(/ton professeur, le \w+ 15 septembre/);
  });

  /**
   * « Révision pas commencée » est le SEUL statut que l'application déduise,
   * parce que c'est un fait mesuré et non un jugement : aucune préparation,
   * aucune notion travaillée.
   */
  test('« pas commencée » se passe de justification : c’est un fait, pas un avis', async () => {
    getControle.mockResolvedValue({
      data: {
        ...FICHE,
        preparation: {
          ...FICHE.preparation,
          pretStatut: 'pas-commence',
          pretObservation: null,
          pretLe: null,
        },
      },
    });

    render(<ControleFiche />);

    expect(await screen.findByText('Révision pas commencée')).toBeInTheDocument();
    expect(document.querySelector('.controle-pret__mot')).toBeNull();
  });
});

/**
 * UNE NOTION VALIDÉE PAR UNE NOTE LE DIT — voulu par Camara le 13/09/2026,
 * après une réciproque de Thalès prouvée à 17,5/20 puis retombée de 98 à 71 %
 * le lendemain sous une impression de conversation. Le moteur la verrouille
 * désormais ; la fiche doit le montrer, sinon l'enfant ne sait pas laquelle de
 * ses notions est à l'abri.
 */
test('une notion validée par une note le dit, et ne dit plus « travaillée le »', async () => {
  getControle.mockResolvedValue({
    data: {
      ...FICHE,
      preparation: {
        ...FICHE.preparation,
        notions: [
          {
            id: 1, libelle: 'Utiliser la réciproque de Thalès', etat: 'acquise',
            travailleeLe: '2026-09-15T10:00:00', pourcent: 98, valideeParMesure: true,
          },
          {
            id: 2, libelle: 'Utiliser le théorème de Thalès', etat: 'en-cours',
            travailleeLe: '2026-09-15T10:00:00', pourcent: 55, valideeParMesure: false,
          },
        ],
      },
    },
  });

  render(<ControleFiche />);

  expect(await screen.findByText('✓ validée par une note')).toBeInTheDocument();

  // Une seule mention « travaillée le » : celle de la notion non validée.
  expect(screen.getAllByText(/travaillée le 15 septembre/)).toHaveLength(1);
});
