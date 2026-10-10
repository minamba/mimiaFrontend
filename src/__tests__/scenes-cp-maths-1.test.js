/**
 * L'UNIVERS ANIMÉ DES JEUX DU GROUPE « CP-MATHS-1 » (09/10/2026) — la boîte
 * de 10 (la ferme), la marchande (le marché), le train des nombres (la gare)
 * et les paquets de dix (la salle de classe).
 *
 * Ce qu'on vérifie : chaque écran se rend à chaque classe sans exception ;
 * le décor vivant et la mascotte sont là ; la mascotte attend sans rien dire
 * de la réponse, penche la tête à l'erreur sans faire la fête, et la fête
 * part à la réussite. La mécanique elle-même a ses propres tests
 * (`boiteDeDix.test.js`, `marchande.test.js`, `trainDesNombres.test.js`,
 * `paquetsDeDix.test.js`), qu'on ne remplace pas.
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   un décor et une mascotte se vérifient sur leur dessin : leurs classes et
   leurs attributs, qu'aucun rôle accessible ne porte (ils sont décoratifs). */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoiteDeDix from '../components/jeux/BoiteDeDix';
import Marchande from '../components/jeux/Marchande';
import TrainDesNombres from '../components/jeux/TrainDesNombres';
import PaquetsDeDix from '../components/jeux/PaquetsDeDix';
import { serie as serieBoite } from '../lib/jeux/boiteDeDix';
import { serie as serieMarchande } from '../lib/jeux/marchande';
import { serie as serieTrain } from '../lib/jeux/trainDesNombres';
import { decomposer, serie as seriePaquets } from '../lib/jeux/paquetsDeDix';
import { eclats, humeurDe } from '../components/jeux/scenes/cp-maths-1/commun';
import { JEUX } from '../lib/jeux/catalogue';

const GRAINES = Array.from({ length: 6 }, (_, g) => g * 7919 + 13);

/** Le décor, la mascotte et son humeur, lus dans le rendu. */
function scene(container, prefixe) {
  const racine = container.querySelector(`.${prefixe}`);
  return {
    racine,
    decor: container.querySelector('.sc-cp-maths-1__decor'),
    mascotte: container.querySelector('.sc-cp-maths-1__mascotte svg'),
    fete: container.querySelector('.sc-cp-maths-1__gerbe'),
  };
}

afterEach(() => { jest.restoreAllMocks(); });

describe('les briques communes', () => {
  it('l’humeur suit l’état du jeu, la réussite l’emporte', () => {
    expect(humeurDe({})).toBe('attente');
    expect(humeurDe({ faux: true })).toBe('oups');
    expect(humeurDe({ faux: true, aide: true })).toBe('aide');
    expect(humeurDe({ juste: true, faux: true })).toBe('bravo');
  });

  it('la gerbe est la même à chaque rendu (pas de hasard)', () => {
    expect(eclats(12)).toEqual(eclats(12));
    expect(eclats(12)).toHaveLength(12);
  });
});

describe('chaque écran se rend à chaque classe, décor et mascotte compris', () => {
  const ecrans = [
    { cle: 'boite-de-dix', Ecran: BoiteDeDix, prefixe: 'sc-boite-de-dix' },
    { cle: 'marchande', Ecran: Marchande, prefixe: 'sc-marchande' },
    { cle: 'train-des-nombres', Ecran: TrainDesNombres, prefixe: 'sc-train-des-nombres' },
    { cle: 'paquets-de-dix', Ecran: PaquetsDeDix, prefixe: 'sc-paquets-de-dix' },
  ];

  // LA CAISSE DU CE1 ET LES PRIX À VIRGULE DU CE2 sont leurs propres écrans
  // (`Caisse.js`, `PrixAVirgule.js`), restés hors de ce lot : ils doivent
  // seulement toujours se rendre.
  const habille = (cle, niveau) => cle !== 'marchande' || niveau === 'CP';

  const cas = ecrans.flatMap(({ cle, Ecran, prefixe }) => JEUX
    .find((j) => j.cle === cle)
    .niveaux.map((niveau) => ({ cle, Ecran, prefixe, niveau })));

  const rendre = (Ecran, niveau, graine) => {
    jest.spyOn(Date, 'now').mockReturnValue(graine);
    return render(<Ecran onQuitter={jest.fn()} matiereCode="MATHS" niveau={niveau} />);
  };

  cas.filter(({ cle, niveau }) => habille(cle, niveau)).forEach(({ cle, Ecran, prefixe, niveau }) => {
    it(`${cle} — ${niveau} : décor, mascotte en attente, pas de fête`, () => {
      GRAINES.forEach((graine) => {
        const { container, unmount } = rendre(Ecran, niveau, graine);
        const s = scene(container, prefixe);

        expect(screen.getByRole('button', { name: /Revenir aux jeux/ })).toBeInTheDocument();
        expect(s.racine).toHaveClass(`${prefixe}--attente`);
        expect(s.decor).toHaveAttribute('aria-hidden', 'true');
        expect(s.mascotte).toHaveAttribute('aria-hidden', 'true');
        // RIEN NE FÊTE AVANT LA RÉPONSE.
        expect(s.fete).toBeNull();

        unmount();
        jest.restoreAllMocks();
      });
    });
  });

  cas.filter(({ cle, niveau }) => !habille(cle, niveau)).forEach(({ cle, Ecran, niveau }) => {
    it(`${cle} — ${niveau} : se rend toujours`, () => {
      GRAINES.forEach((graine) => {
        const { unmount } = rendre(Ecran, niveau, graine);
        expect(screen.getByRole('button', { name: /Revenir aux jeux/ })).toBeInTheDocument();
        unmount();
        jest.restoreAllMocks();
      });
    });
  });
});

describe('la boîte de 10 : Cocotte la poule', () => {
  it('penche la tête au mauvais panier, sans fête', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
    const [premiere] = serieBoite(12345);
    const faux = premiere.choix.find((v) => v !== premiere.manque);

    const { container } = render(<BoiteDeDix onQuitter={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^Panier de ${faux} œufs?$`) }));

    const s = scene(container, 'sc-boite-de-dix');
    expect(s.racine).toHaveClass('sc-boite-de-dix--oups');
    expect(container.querySelector('.sc-boite-de-dix__poule.est-oups')).not.toBeNull();
    expect(s.fete).toBeNull();
  });

  it('fait la fête au bon panier : poussin, gerbe, boîte en joie', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
    const [premiere] = serieBoite(12345);

    const { container } = render(<BoiteDeDix onQuitter={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^Panier de ${premiere.manque} œufs?$`) }));

    const s = scene(container, 'sc-boite-de-dix');
    expect(s.racine).toHaveClass('sc-boite-de-dix--fete');
    expect(s.fete).not.toBeNull();
    expect(s.fete).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.sc-boite-de-dix__poussin')).not.toBeNull();
    // Une seule annonce pour les lecteurs d'écran : la fête n'en ajoute pas.
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });
});

describe('la marchande : Pomme', () => {
  const poser = (v) => screen.getByRole('button', { name: new RegExp(`^Poser ${v} euros?$`) });

  it('se gratte la tête quand on a trop payé, sans fête', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const [premiere] = serieMarchande(2024);

    const { container } = render(<Marchande onQuitter={jest.fn()} />);
    // Un euro de moins que le total, puis une pièce de deux : on passe par-dessus
    // sans jamais tomber juste.
    for (let i = 0; i < premiere.total - 1; i += 1) await userEvent.click(poser(1));
    await userEvent.click(poser(2));

    const s = scene(container, 'sc-marchande');
    expect(s.racine).toHaveClass('sc-marchande--oups');
    expect(s.fete).toBeNull();
  });

  it('saute de joie, une pièce d’or en main, quand c’est payé juste', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const [premiere] = serieMarchande(2024);

    const { container } = render(<Marchande onQuitter={jest.fn()} />);
    for (let i = 0; i < premiere.total; i += 1) await userEvent.click(poser(1));

    const s = scene(container, 'sc-marchande');
    expect(s.racine).toHaveClass('sc-marchande--fete');
    expect(s.fete).not.toBeNull();
    expect(container.querySelector('.sc-marchande__piece-or')).not.toBeNull();
  });
});

describe('le train des nombres : Piou, l’oiseau chef de gare', () => {
  it('penche la tête au mauvais arrêt, et le wagon attend toujours', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(77);
    const [premiere] = serieTrain(77);
    const faux = premiere.voie.reperes.find((r) => r !== premiere.nombre);

    const { container } = render(<TrainDesNombres onQuitter={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: `Arrêt ${faux}` }));

    expect(scene(container, 'sc-train-des-nombres').racine).toHaveClass('sc-train-des-nombres--oups');
    expect(screen.getByLabelText(`Wagon numéro ${premiere.nombre}`)).toBeInTheDocument();
    expect(scene(container, 'sc-train-des-nombres').fete).toBeNull();
  });

  it('siffle le départ au bon arrêt : notes, gerbe, wagon accroché', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(77);
    const [premiere] = serieTrain(77);

    const { container } = render(<TrainDesNombres onQuitter={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', {
      name: `Arrêt entre les repères, position ${premiere.nombre}`,
    }));

    const s = scene(container, 'sc-train-des-nombres');
    expect(s.racine).toHaveClass('sc-train-des-nombres--fete');
    expect(s.fete).not.toBeNull();
    expect(container.querySelector('.sc-train-des-nombres__notes')).not.toBeNull();
    expect(container.querySelector('.voie__wagon-pose .wagon')).not.toBeNull();
  });

  it('la locomotive fume sur le zéro', () => {
    jest.spyOn(Date, 'now').mockReturnValue(77);
    const { container } = render(<TrainDesNombres onQuitter={jest.fn()} />);
    expect(container.querySelectorAll('.voie__locomotive .sc-train-des-nombres__fumee')).toHaveLength(3);
  });
});

describe('les paquets de dix : Bûchou', () => {
  const ajouterBuchette = () => screen.getByRole('button', { name: 'Une bûchette' });
  const ajouterPaquet = () => screen.getByRole('button', { name: 'Un paquet de dix' });
  const annoncer = () => screen.getByRole('button', { name: /C’est prêt/ });

  it('se gratte la tête à une annonce fausse, sans fête', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const { container } = render(<PaquetsDeDix onQuitter={jest.fn()} />);

    await userEvent.click(ajouterBuchette());
    await userEvent.click(annoncer());

    const s = scene(container, 'sc-paquets-de-dix');
    expect(s.racine).toHaveClass('sc-paquets-de-dix--oups');
    expect(s.fete).toBeNull();

    // Reprendre le travail le remet en attente.
    await userEvent.click(ajouterBuchette());
    expect(s.racine).toHaveClass('sc-paquets-de-dix--attente');
  });

  it('saute bras en l’air à l’annonce juste', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const [premiere] = seriePaquets(2024);
    const { paquets, unites } = decomposer(premiere);

    const { container } = render(<PaquetsDeDix onQuitter={jest.fn()} />);
    for (let i = 0; i < paquets; i += 1) await userEvent.click(ajouterPaquet());
    for (let i = 0; i < unites; i += 1) await userEvent.click(ajouterBuchette());
    await userEvent.click(annoncer());

    const s = scene(container, 'sc-paquets-de-dix');
    expect(s.racine).toHaveClass('sc-paquets-de-dix--fete');
    expect(s.fete).not.toBeNull();
    expect(container.querySelector('.sc-paquets-de-dix__buchou.est-bravo')).not.toBeNull();
  });
});
