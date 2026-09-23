/**
 * LA VOIX DES JEUX.
 *
 * Deux promesses à tenir, et c'est ici qu'elles se vérifient :
 *
 * 1. CE QUI EST DIT EST CE QUI EST ÉCRIT. Chaque phrase qu'un jeu peut
 *    afficher a son enregistrement, fait à partir du MÊME texte. Changer une
 *    phrase dans un jeu sans relancer `node scripts/voix-jeux.mjs` fait
 *    tomber le premier bloc : sans lui, la professeure continuerait de dire
 *    l'ancienne phrase sous la nouvelle, et personne ne l'entendrait avant
 *    un parent.
 *
 * 2. LA VOIX SUIT LA MATIÈRE. Un jeu de maths parle avec Nora ; un jeu sans
 *    professeur connu se tait, plutôt que de parler avec la mauvaise voix.
 */

import fs from 'fs';
import path from 'path';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaquetsDeDix from '../components/jeux/PaquetsDeDix';
import { commun, PROFESSEUR_PAR_MATIERE, toutesLesRepliques } from '../lib/jeux/voix/repliques';
import { JEUX } from '../lib/jeux/catalogue';
import * as boite from '../lib/jeux/boiteDeDix';
import * as chantier from '../lib/jeux/chantierDesFormes';
import * as marchande from '../lib/jeux/marchande';
import * as paquets from '../lib/jeux/paquetsDeDix';
import * as train from '../lib/jeux/trainDesNombres';

const DOSSIER = path.resolve(__dirname, '../../public/sons/jeux');
const manifeste = JSON.parse(fs.readFileSync(path.join(DOSSIER, 'manifeste.json'), 'utf8'));
const inventaire = toutesLesRepliques();

describe('ce qui est dit est ce qui est écrit', () => {
  it('chaque jeu du catalogue a un professeur qui parle', () => {
    JEUX.forEach((jeu) => expect(PROFESSEUR_PAR_MATIERE[jeu.matiereCode]).toBeTruthy());
  });

  it('les clés sont uniques, et font des noms de fichier sûrs', () => {
    Object.values(inventaire).forEach((liste) => {
      const cles = liste.map((r) => r.cle);
      expect(new Set(cles).size).toBe(cles.length);
      cles.forEach((cle) => expect(cle).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+$/));
    });
  });

  /** LE TEST QUI TIENT LA PROMESSE : voir la note en tête de fichier. */
  it('chaque phrase a été enregistrée avec son texte d’aujourd’hui', () => {
    const perimees = [];
    Object.entries(inventaire).forEach(([professeur, liste]) => {
      const connues = manifeste.professeurs[professeur]?.repliques ?? {};
      liste.forEach(({ cle, texte }) => {
        if (connues[cle]?.texte !== texte) perimees.push(`${professeur}/${cle}`);
      });
    });

    // Si ce test tombe : `node scripts/voix-jeux.mjs`, puis relancer.
    expect(perimees).toEqual([]);
  });

  it('chaque enregistrement est bien là, et n’est pas vide', () => {
    Object.entries(inventaire).forEach(([professeur, liste]) => {
      liste.forEach(({ cle }) => {
        const fichier = path.join(DOSSIER, professeur, `${cle}.mp3`);
        expect(fs.existsSync(fichier)).toBe(true);
        expect(fs.statSync(fichier).size).toBeGreaterThan(3000);
      });
    });
  });

  /**
   * LA NOTE DITE REPREND LE MOT DE LA FIN ÉCRIT — et les cinq jeux ont le
   * même. S'ils divergeaient un jour, la professeure dirait sous un jeu la
   * phrase d'un autre.
   */
  it('les cinq jeux ont le même mot de la fin, et la note le reprend', () => {
    for (let n = 0; n <= 8; n += 1) {
      const attendu = paquets.bilan(n);
      [boite, chantier, marchande, train].forEach((jeu) => expect(jeu.bilan(n)).toBe(attendu));
      expect(commun.note(n).texte).toContain(attendu);
    }
  });
});

describe('la voix dans un jeu', () => {
  let joues;

  beforeEach(() => {
    joues = [];
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(function jouer() {
      joues.push(this.src);
      return Promise.resolve();
    });
    try { window.localStorage.clear(); } catch { /* sans stockage */ }
  });

  afterEach(() => { jest.restoreAllMocks(); });

  const consigneAttendue = () => `/sons/jeux/nora/paquets/consigne-${paquets.serie(2024)[0]}.mp3`;

  it('un jeu de maths lit sa consigne avec la voix de Nora', () => {
    render(<PaquetsDeDix onQuitter={jest.fn()} matiereCode="MATHS" />);

    expect(joues).toHaveLength(1);
    expect(joues[0]).toMatch(new RegExp(`${consigneAttendue()}$`));
  });

  it('sans matière connue, le jeu se tait et n’affiche aucun bouton de voix', () => {
    render(<PaquetsDeDix onQuitter={jest.fn()} />);

    expect(joues).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Réécouter la consigne' })).not.toBeInTheDocument();
  });

  it('une erreur annoncée est dite, et c’est la phrase affichée', async () => {
    render(<PaquetsDeDix onQuitter={jest.fn()} matiereCode="MATHS" />);

    await userEvent.click(screen.getByRole('button', { name: 'Une bûchette' }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));

    expect(screen.getByRole('status')).toHaveTextContent(paquets.PHRASES.pasAssez);
    expect(joues[joues.length - 1]).toMatch(/\/sons\/jeux\/nora\/paquets\/pas-assez\.mp3$/);
  });

  /**
   * COUPER LA VOIX NE COUPE PAS « RÉÉCOUTER » : c'est une demande explicite
   * de l'enfant, on ne lui répond pas par un silence.
   */
  it('voix coupée : plus rien ne se dit tout seul, mais réécouter fonctionne', async () => {
    render(<PaquetsDeDix onQuitter={jest.fn()} matiereCode="MATHS" />);
    await userEvent.click(screen.getByRole('button', { name: 'Couper la voix' }));
    joues = [];

    await userEvent.click(screen.getByRole('button', { name: 'Une bûchette' }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(joues).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: 'Réécouter la consigne' }));
    expect(joues).toHaveLength(1);
    expect(joues[0]).toMatch(new RegExp(`${consigneAttendue()}$`));
  });
});

/**
 * LES RÉPONSES DE L'HORLOGE SONT LUES, et le bouton lu s'éclaire — Camara, le
 * 21/09/2026 : « on est sur des CP ». On déroule la suite à la main : chaque
 * son joué déclare qu'il est fini, et le suivant doit partir.
 */
describe('une suite de phrases', () => {
  let joues;

  beforeEach(() => {
    joues = [];
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(function jouer() {
      joues.push(this);
      return Promise.resolve();
    });
    try { window.localStorage.clear(); } catch { /* sans stockage */ }
  });

  afterEach(() => { jest.restoreAllMocks(); });

  // eslint-disable-next-line global-require
  const Horloge = require('../components/jeux/Horloge').default;
  // eslint-disable-next-line global-require
  const horloge = require('../lib/jeux/horloge');

  it('l’horloge lit la consigne, puis les quatre réponses en éclairant chacune', async () => {
    const { choix } = horloge.serie(2024)[0];
    const sons = joues;
    render(<Horloge onQuitter={jest.fn()} matiereCode="MATHS" />);

    expect(sons[0].src).toMatch(/horloge\/consigne-lecture\.mp3$/);

    for (let i = 0; i < choix.length; i += 1) {
      const avant = sons.length;
      sons[sons.length - 1].dispatchEvent(new Event('ended'));
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(sons.length).toBe(avant + 1));

      const h = choix[i];
      expect(sons[sons.length - 1].src.endsWith(`horloge/heure-${h}.mp3`)).toBe(true);
      expect(screen.getByRole('button', { name: horloge.ecrire(h) })).toHaveClass('est-lue');
    }
  });

  it('toucher une réponse coupe la lecture des suivantes', async () => {
    const { choix, heure } = horloge.serie(2024)[0];
    render(<Horloge onQuitter={jest.fn()} matiereCode="MATHS" />);

    await userEvent.click(screen.getByRole('button', { name: horloge.ecrire(heure) }));
    const apres = joues.length;

    // La consigne finit : rien ne doit reprendre derrière le bravo.
    joues[0].dispatchEvent(new Event('ended'));
    await new Promise((r) => { setTimeout(r, 400); });
    expect(joues.length).toBe(apres);
    expect(choix.length).toBe(4);
  });
});
