/**
 * LES JEUX DU CM2 — Camara, le 21/09/2026 : « attaque le CM2 ». Vingt-deux
 * modules, un par jeu du CM1 qu'ils prolongent (voir `parNiveau` dans
 * `JeuSimple.js`). Même épreuve que le CM1 : soixante parties chacun, les
 * pièges qui font l'intérêt de chacun, puis chaque écran ouvert au CM2.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as attribut from '../lib/jeux/attributCM2';
import * as aires from '../lib/jeux/airesCM2';
import * as billes from '../lib/jeux/billesCM2';
import * as boite from '../lib/jeux/boiteCM2';
import * as complements from '../lib/jeux/complementsCM2';
import * as decimaux from '../lib/jeux/decimauxCM2';
import * as durees from '../lib/jeux/dureesCM2';
import * as fractions from '../lib/jeux/fractionsCM2';
import * as geometrie from '../lib/jeux/geometrieCM2';
import * as homophones from '../lib/jeux/homophonesCM2';
import * as longueurs from '../lib/jeux/longueursCM2';
import * as narrateur from '../lib/jeux/narrateurCM2';
import * as nombres from '../lib/jeux/nombresCM2';
import * as operations from '../lib/jeux/operationsCM2';
import * as participe from '../lib/jeux/participeAvoirCM2';
import * as phrases from '../lib/jeux/phrasesCM2';
import * as recette from '../lib/jeux/recetteCM2';
import * as robot from '../lib/jeux/robotCM2';
import * as sens from '../lib/jeux/sensFigureCM2';
import * as tableaux from '../lib/jeux/tableauxCM2';
import * as temps from '../lib/jeux/tempsCM2';
import * as vocabulaire from '../lib/jeux/vocabulaireCM2';
import { executer } from '../lib/jeux/robot';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';
import { toutesLesRepliques } from '../lib/jeux/voix/repliques';
import AOuA from '../components/jeux/AOuA';
import BoiteMystere from '../components/jeux/BoiteMystere';
import CoffreDesCentaines from '../components/jeux/CoffreDesCentaines';
import CombienDeTemps from '../components/jeux/CombienDeTemps';
import CommeUneImage from '../components/jeux/CommeUneImage';
import ContrairesEtJumeaux from '../components/jeux/ContrairesEtJumeaux';
import CourseDesTables from '../components/jeux/CourseDesTables';
import Diagramme from '../components/jeux/Diagramme';
import MetreRuban from '../components/jeux/MetreRuban';
import Miroir from '../components/jeux/Miroir';
import OuQuandComment from '../components/jeux/OuQuandComment';
import PartsDePizza from '../components/jeux/PartsDePizza';
import PhraseQuiDitNon from '../components/jeux/PhraseQuiDitNon';
import PoemeTheatreRecit from '../components/jeux/PoemeTheatreRecit';
import RecettePour8 from '../components/jeux/RecettePour8';
import RegleDesDixiemes from '../components/jeux/RegleDesDixiemes';
import Robot from '../components/jeux/Robot';
import RoueDesVerbes from '../components/jeux/RoueDesVerbes';
import SacDeBilles from '../components/jeux/SacDeBilles';
import SujetEloigne from '../components/jeux/SujetEloigne';
import TourDuJardin from '../components/jeux/TourDuJardin';
import UnOuDes from '../components/jeux/UnOuDes';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** [nom, module, écran qui l'ouvre, clé du catalogue]. */
const JEUX = [
  ['les grands nombres', nombres, CoffreDesCentaines, 'coffre-des-centaines'],
  ['les fractions décimales', fractions, PartsDePizza, 'parts-de-pizza'],
  ['les opérations posées', operations, CourseDesTables, 'course-des-tables'],
  ['les longueurs', longueurs, MetreRuban, 'metre-ruban'],
  ['les problèmes de durée', durees, CombienDeTemps, 'combien-de-temps'],
  ['l’aire du rectangle', aires, TourDuJardin, 'tour-du-jardin'],
  ['angles et figures', geometrie, Miroir, 'le-miroir'],
  ['tableaux et diagrammes', tableaux, Diagramme, 'le-diagramme'],
  ['la loupe des centièmes', decimaux, RegleDesDixiemes, 'regle-des-dixiemes'],
  ['prix, vitesse, tableau', recette, RecettePour8, 'recette-pour-8'],
  ['le schéma en barres', boite, BoiteMystere, 'boite-mystere'],
  ['la boucle du robot', robot, Robot, 'le-robot'],
  ['deux sacs', billes, SacDeBilles, 'sac-de-billes'],
  ['ou, où, leur, quel', homophones, AOuA, 'a-ou-a'],
  ['les temps composés', temps, RoueDesVerbes, 'roue-des-verbes'],
  ['sens et niveaux de langue', vocabulaire, ContrairesEtJumeaux, 'contraires-et-jumeaux'],
  ['l’attribut du sujet', attribut, UnOuDes, 'un-ou-des'],
  ['simple ou complexe', phrases, PhraseQuiDitNon, 'phrase-qui-dit-non'],
  ['le participe avec avoir', participe, SujetEloigne, 'sujet-qui-s-eloigne'],
  ['complément du verbe ou de phrase', complements, OuQuandComment, 'ou-quand-comment'],
  ['sens propre, sens figuré', sens, CommeUneImage, 'comme-une-image'],
  ['qui raconte ?', narrateur, PoemeTheatreRecit, 'poeme-theatre-recit'],
];

afterEach(() => { jest.restoreAllMocks(); });

describe.each(JEUX)('%s', (_, module) => {
  it('chaque partie a ses manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, 'CM2');
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles).toContain(String(m.bonne));
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => module.serie(g, 'CM2').forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      m.choix.forEach((c) => {
        const s = module.verdict(m, c.cle);
        if (String(c.cle) === String(m.bonne)) {
          expect(s).toBe('juste');
        } else {
          expect(module.PHRASES[s]).toBeTruthy();
          expect(module.PHRASES[s]).not.toMatch(/raté/i);
        }
      });
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, 'CM2')).toEqual(module.serie(77, 'CM2'));
  });
});

describe('les pièges qui font chaque jeu', () => {
  const toutes = (module) => graines.flatMap((g) => module.serie(g, 'CM2'));

  it('les opérations : la bonne réponse est le vrai résultat, le reste est plus petit que le diviseur', () => {
    toutes(operations).forEach((m) => {
      if (m.consigne === 'soustraction') {
        const [a, b] = m.question.match(/\d+/g).map(Number);
        expect(m.bonne).toBe(a - b);
      } else if (m.consigne === 'multiplication') {
        const [a, b] = m.question.match(/\d+/g).map(Number);
        expect(m.bonne).toBe(a * b);
      } else {
        const [n, d] = m.question.match(/\d+/g).map(Number);
        const [q, r] = m.bonne.match(/\d+/g).map(Number);
        expect(d * q + r).toBe(n);
        expect(r).toBeLessThan(d);
      }
    });
    expect(operations.sansRetenue(523, 187)).toBe(464);
  });

  it('les grands nombres : le plus grand l’est vraiment, et le piège commence par 9', () => {
    toutes(nombres).filter((m) => m.consigne === 'comparer').forEach((m) => {
      m.choix.forEach((c) => expect(c.cle).toBeLessThanOrEqual(m.bonne));
      const piege = Object.keys(m.pieges).find((k) => m.pieges[k] === 'premier-chiffre');
      expect(piege[0]).toBe('9');
    });
  });

  it('la loupe : « 4,05 » est plus petit que « 4,5 »', () => {
    toutes(decimaux).filter((m) => m.consigne === 'zero').forEach((m) => {
      const [a, b] = m.choix.filter((c) => c.cle !== 'egaux').map((c) => Number(c.cle.replace(',', '.')));
      expect(Number(m.bonne.replace(',', '.'))).toBe(Math.min(a, b));
    });
  });

  it('les durées : l’heure de départ plus la durée redonne l’heure de fin', () => {
    const minutes = (t) => {
      const [h, mn] = t.match(/\d+/g).map(Number);
      return h * 60 + mn;
    };
    toutes(durees).filter((m) => m.consigne === 'depart').forEach((m) => {
      const [fin, duree] = m.question.split('et dure');
      const d = duree.match(/(\d+) h (\d+)/).slice(1).map(Number);
      expect(minutes(m.bonne) + d[0] * 60 + d[1]).toBe(minutes(fin));
    });
  });

  it('la boucle du robot : un seul programme mène à l’étoile, jamais « répète 1 fois »', () => {
    toutes(robot).forEach((m) => {
      const arrivent = m.choix.filter((c) => {
        const fin = executer(m.depart, robot.deplier(c.cle));
        return fin && fin[0] === m.etoile[0] && fin[1] === m.etoile[1];
      });
      expect(arrivent.map((c) => c.cle)).toEqual([m.bonne]);
      m.choix.forEach((c) => expect(c.cle.startsWith('1|')).toBe(false));
    });
  });

  it('deux sacs : le sac qui gagne n’est jamais celui qui a le plus de rouges', () => {
    toutes(billes).filter((m) => m.consigne === 'deux-sacs').forEach((m) => {
      const part = (s) => s.rouge / (s.rouge + s.bleue);
      const [a, b] = [part(m.sacs.a), part(m.sacs.b)];
      let attendu = 'autant';
      if (a > b) attendu = 'a';
      if (b > a) attendu = 'b';
      expect(m.bonne).toBe(attendu);
      if (attendu !== 'autant') expect(m.sacs[attendu].rouge).toBeLessThan(m.sacs[attendu === 'a' ? 'b' : 'a'].rouge);
    });
  });

  it('le schéma en barres : la réponse redonne le total', () => {
    toutes(boite).forEach((m) => {
      if (m.consigne === 'plus') expect(2 * m.bonne + m.schema.ecart).toBe(m.schema.total);
      if (m.consigne === 'fois') expect(m.bonne * (m.schema.fois + 1)).toBe(m.schema.total);
    });
  });

  it('les temps composés : « il a allé » est le piège de l’auxiliaire', () => {
    expect(temps.conjuguer('aller', 'passe-compose', 0)).toBe('est allé');
    expect(temps.conjuguer('aller', 'passe-compose', 1)).toBe('sont allés');
    expect(temps.conjuguer('aller', 'passe-compose', 0, 'avoir')).toBe('a allé');
  });

  it('le participe avec avoir : accordé seulement quand le COD est avant', () => {
    toutes(participe).forEach((m) => {
      const avant = Object.values(m.pieges).includes('avant-oubli');
      expect(/[es]$/.test(m.bonne) && m.bonne !== 'pris').toBe(avant);
    });
  });

  it('simple ou complexe : un infinitif ne fait pas une phrase complexe', () => {
    const veut = toutes(phrases).find((m) => m.question === 'Léo veut partir à la mer.');
    expect(veut.bonne).toBe('simple');
    expect(phrases.verdict(veut, 'complexe')).toBe('compter-infinitif');
  });
});

describe('dans l’école', () => {
  it('chaque jeu est dans la ludothèque du CM2, avec les compétences du CM2', () => {
    const cm2 = jeuxDeLaClasse('CM2');
    JEUX.forEach(([, , , cle]) => {
      const jeu = cm2.find((j) => j.cle === cle);
      expect(jeu).toBeTruthy();
      jeu.competences.forEach((c) => expect(c).toMatch(/_CM2_/));
    });
  });

  it('chaque phrase de chaque jeu a sa voix', () => {
    const cles = Object.values(toutesLesRepliques()).flat().map((r) => r.cle);
    expect(cles).toContain('operations-cm2/division-reste');
    expect(cles).toContain('participe-avoir-cm2/avant-oubli');
  });

  /** Le nom du bouton : le texte, ou, pour un diagramme, sa description. */
  const nom = (m, c) => (m.consigne === 'diagramme' ? `Un diagramme : ${m.barres[c.cle].join(', ')}` : String(c.libelle));

  it.each(JEUX)('%s : au CM2, un choix faux nomme l’erreur, le bon fait continuer', async (_, module, Jeu) => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const m = module.serie(2024, 'CM2')[0];
    render(<Jeu onQuitter={jest.fn()} matiereCode="MATHS" niveau="CM2" />);
    if (m.consigne === 'miroir') return;
    const bonne = m.choix.find((c) => String(c.cle) === String(m.bonne));
    const fausse = m.choix.find((c) => String(c.cle) !== String(m.bonne));
    await userEvent.click(screen.getByRole('button', { name: nom(m, fausse) }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: nom(m, bonne) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});
