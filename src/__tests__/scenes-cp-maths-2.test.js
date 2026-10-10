/**
 * LES UNIVERS DU GROUPE « CP-MATHS-2 » (09/10/2026) — le chantier des formes,
 * l'horloge, la balance et deux par deux.
 *
 * Ce qui se vérifie, pour chaque écran et chaque classe où il se joue :
 *
 * 1. LE DÉCOR VIVANT ET LA MASCOTTE SONT LÀ, muets pour les lecteurs d'écran
 *    (aucun texte, aucun rôle à lire en plus), et la mascotte attend.
 * 2. UNE RÉUSSITE DÉCLENCHE LA FÊTE : la mascotte passe à « bravo », la
 *    gerbe jaillit — et elle disparaît à la manche suivante.
 * 3. UNE ERREUR FAIT ENCOURAGER, jamais fêter : « oups », sans gerbe.
 * 4. RIEN DE LA RÈGLE N'A BOUGÉ : un seul `role="status"`, les mêmes boutons.
 *    (Les tests de chaque jeu le vérifient en détail ; ils passent tous.)
 */

/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   le décor et la mascotte sont muets (`aria-hidden`) : ce sont leurs classes
   qu'on vérifie, aucun rôle ne les atteint. */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Balance from '../components/jeux/Balance';
import ChantierDesFormes from '../components/jeux/ChantierDesFormes';
import DeuxParDeux from '../components/jeux/DeuxParDeux';
import Horloge from '../components/jeux/Horloge';
import * as balance from '../lib/jeux/balance';
import * as chantier from '../lib/jeux/chantierDesFormes';
import * as deux from '../lib/jeux/deuxParDeux';
import * as horloge from '../lib/jeux/horloge';

const GRAINE = 2024;

beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });
afterEach(() => { jest.restoreAllMocks(); });

const annoncer = () => userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));

/**
 * CHAQUE ÉCRAN : sa clé, ses classes, et deux façons de finir la première
 * manche — juste, ou fausse.
 */
const ECRANS = [
  {
    cle: 'chantier-des-formes',
    Composant: ChantierDesFormes,
    niveaux: ['CP'],
    gagner: async () => {
      const { pieces } = chantier.serie(GRAINE)[0];
      for (let i = 0; i < pieces.length; i += 1) {
        if (pieces[i].cible) await userEvent.click(screen.getByRole('button', { name: `Pièce ${i + 1}` }));
      }
      await annoncer();
    },
    rater: async () => {
      const { pieces } = chantier.serie(GRAINE)[0];
      const intrus = pieces.findIndex((p) => !p.cible);
      await userEvent.click(screen.getByRole('button', { name: `Pièce ${intrus + 1}` }));
      await annoncer();
    },
  },
  {
    cle: 'horloge',
    Composant: Horloge,
    niveaux: ['CP', 'CE1'],
    gagner: async (niveau) => {
      const m = horloge.serie(GRAINE, horloge.MANCHES, niveau)[0];
      await userEvent.click(screen.getByRole('button', { name: horloge.ecrire(m.heure) }));
    },
    rater: async (niveau) => {
      const m = horloge.serie(GRAINE, horloge.MANCHES, niveau)[0];
      const faux = m.choix.find((h) => h !== m.heure);
      await userEvent.click(screen.getByRole('button', { name: horloge.ecrire(faux) }));
    },
  },
  {
    cle: 'balance',
    Composant: Balance,
    niveaux: ['CP', 'CE1', 'CE2'],
    gagner: async () => {
      const { table } = balance.serie(GRAINE)[0];
      await userEvent.click(screen.getByRole('button', { name: /J’ai pesé, je range/ }));
      for (const c of balance.ordreJuste(table)) {
        await userEvent.click(screen.getByRole('button', { name: balance.avecArticle(balance.objet(c)) }));
      }
      await annoncer();
    },
    rater: async () => {
      const { table } = balance.serie(GRAINE)[0];
      await userEvent.click(screen.getByRole('button', { name: /J’ai pesé, je range/ }));
      for (const c of [...balance.ordreJuste(table)].reverse()) {
        await userEvent.click(screen.getByRole('button', { name: balance.avecArticle(balance.objet(c)) }));
      }
      await annoncer();
    },
  },
  {
    cle: 'deux-par-deux',
    Composant: DeuxParDeux,
    niveaux: ['CP'],
    gagner: async () => {
      const m = deux.serie(GRAINE)[0];
      await userEvent.click(screen.getByRole('button', { name: String(deux.reponse(m)) }));
    },
    rater: async () => {
      const m = deux.serie(GRAINE)[0];
      const faux = m.choix.find((v) => v !== deux.reponse(m));
      await userEvent.click(screen.getByRole('button', { name: String(faux) }));
    },
  },
];

describe.each(ECRANS)('l’univers de « $cle »', ({
  cle, Composant, niveaux, gagner, rater,
}) => {
  const P = `sc-${cle}`;

  describe.each(niveaux)('en %s', (niveau) => {
    it('le décor vit et la mascotte attend, sans rien à lire de plus', () => {
      const { container } = render(<Composant onQuitter={jest.fn()} matiereCode="MATHS" niveau={niveau} />);

      const racine = container.firstChild;
      expect(racine).toHaveClass('jeu', P);
      expect(racine).not.toHaveClass(`${P}--gagne`);

      const decor = container.querySelector(`.${P}__decor`);
      expect(decor).toBeInTheDocument();
      expect(decor).toHaveAttribute('aria-hidden', 'true');

      const mascotte = container.querySelector(`.${P}__mascotte`);
      expect(mascotte).toHaveClass(`${P}__mascotte--attente`);
      expect(mascotte).toHaveAttribute('aria-hidden', 'true');
      expect(mascotte.textContent).toBe('');

      expect(container.querySelector(`.${P}__fete`)).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('une réussite fait la fête, qui s’efface à la manche suivante', async () => {
      const { container } = render(<Composant onQuitter={jest.fn()} matiereCode="MATHS" niveau={niveau} />);
      await gagner(niveau);

      expect(container.firstChild).toHaveClass(`${P}--gagne`);
      expect(container.querySelector(`.${P}__mascotte`)).toHaveClass(`${P}__mascotte--bravo`);
      const fete = container.querySelector(`.${P}__fete`);
      expect(fete).toHaveAttribute('aria-hidden', 'true');
      expect(fete.querySelectorAll(`.${P}__eclat`).length).toBeGreaterThan(8);
      // Toujours une seule annonce : la fête ne parle pas.
      expect(screen.getAllByRole('status')).toHaveLength(1);

      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }));
      expect(container.firstChild).not.toHaveClass(`${P}--gagne`);
      expect(container.querySelector(`.${P}__mascotte`)).toHaveClass(`${P}__mascotte--attente`);
      expect(container.querySelector(`.${P}__fete`)).not.toBeInTheDocument();
    });

    it('une erreur fait encourager, jamais fêter', async () => {
      const { container } = render(<Composant onQuitter={jest.fn()} matiereCode="MATHS" niveau={niveau} />);
      await rater(niveau);

      expect(container.querySelector(`.${P}__mascotte`)).toHaveClass(`${P}__mascotte--oups`);
      expect(container.querySelector(`.${P}__fete`)).not.toBeInTheDocument();
      expect(container.firstChild).not.toHaveClass(`${P}--gagne`);
      expect(screen.getAllByRole('status')).toHaveLength(1);
    });
  });
});

describe('les détails de chaque univers', () => {
  it('l’horloge est un réveil : ses clochettes sonnent à la bonne heure', async () => {
    const { container } = render(<Horloge onQuitter={jest.fn()} />);
    const clochettes = () => container.querySelector('.cadran .sc-horloge__clochettes');

    expect(clochettes()).toHaveAttribute('aria-hidden', 'true');
    expect(clochettes()).not.toHaveClass('sc-horloge__clochettes--sonne');

    const m = horloge.serie(GRAINE)[0];
    await userEvent.click(screen.getByRole('button', { name: horloge.ecrire(m.heure) }));
    expect(clochettes()).toHaveClass('sc-horloge__clochettes--sonne');
  });

  it('au chantier, la grue hisse son fanion à la réussite seulement', async () => {
    const { container } = render(<ChantierDesFormes onQuitter={jest.fn()} />);
    expect(container.querySelector('.sc-chantier-des-formes__fanion')).not.toBeInTheDocument();

    await ECRANS[0].gagner();
    expect(container.querySelector('.sc-chantier-des-formes__fanion')).toBeInTheDocument();
  });

  it('à deux par deux, une paire de ballons s’envole à la réussite seulement', async () => {
    const { container } = render(<DeuxParDeux onQuitter={jest.fn()} />);
    expect(container.querySelector('.sc-deux-par-deux__envol')).not.toBeInTheDocument();

    await ECRANS[3].gagner();
    expect(container.querySelector('.sc-deux-par-deux__envol')).toBeInTheDocument();
  });

  it('à la balance, le garçon regarde le plateau qui descend', async () => {
    const { container } = render(<Balance onQuitter={jest.fn()} />);
    const pupilles = () => container.querySelector('.sc-balance__m-pupilles');
    expect(pupilles()).toHaveAttribute('transform', 'translate(0 0)');

    // Le plus léger à gauche, le plus lourd à droite : le plateau de droite descend.
    const [leger, , lourd] = balance.ordreJuste(balance.serie(GRAINE)[0].table);
    await userEvent.click(screen.getByRole('button', { name: balance.avecArticle(balance.objet(leger)) }));
    await userEvent.click(screen.getByRole('button', { name: balance.avecArticle(balance.objet(lourd)) }));
    expect(screen.getByRole('img', { name: /Le plateau de droite descend/ })).toBeInTheDocument();
    expect(pupilles().getAttribute('transform')).toMatch(/^translate\(2\.6/);
  });
});
