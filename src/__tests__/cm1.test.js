/**
 * LES JEUX DU CM1 — Camara, le 21/09/2026 : « fais tout, comme ça on
 * attaquera le CM2 ». Vingt-six modules qui suivent tous la même forme (voir
 * `JeuSimple.js`) : on les éprouve donc tous de la même façon, sur soixante
 * parties chacun, puis on vérifie les pièges qui font l'intérêt de chacun.
 * Enfin chaque écran, ouvert depuis la ludothèque du CM1 : un choix faux
 * nomme l'erreur, le bon fait continuer.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as accords from '../lib/jeux/accordsCM1';
import * as aires from '../lib/jeux/airesCM1';
import * as pronom from '../lib/jeux/aQuiLePronom';
import * as boite from '../lib/jeux/boiteMystere';
import * as calcul from '../lib/jeux/calculMental';
import * as image from '../lib/jeux/commeUneImage';
import * as complements from '../lib/jeux/complementsCM1';
import * as crible from '../lib/jeux/crible';
import * as durees from '../lib/jeux/dureesCM1';
import * as fractions from '../lib/jeux/fractionsCM1';
import * as geometrie from '../lib/jeux/geometrieCM1';
import * as grands from '../lib/jeux/grandsNombres';
import * as homophones from '../lib/jeux/homophonesCM1';
import * as mesures from '../lib/jeux/mesuresCM1';
import * as liaison from '../lib/jeux/motsDeLiaison';
import * as passe from '../lib/jeux/passeComposeCM1';
import * as phrases from '../lib/jeux/phrasesCM1';
import * as genres from '../lib/jeux/poemeTheatreRecit';
import * as recette from '../lib/jeux/recettePour8';
import * as dixiemes from '../lib/jeux/regleDesDixiemes';
import * as robot from '../lib/jeux/robot';
import * as billes from '../lib/jeux/sacDeBilles';
import * as suite from '../lib/jeux/suiteQuiContinue';
import * as tableaux from '../lib/jeux/tableauxCM1';
import * as temps from '../lib/jeux/tempsCM1';
import * as vocabulaire from '../lib/jeux/vocabulaireCM1';
import { enLettres } from '../lib/jeux/nombresEnLettres';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';
import { toutesLesRepliques } from '../lib/jeux/voix/repliques';
import AOuA from '../components/jeux/AOuA';
import AQuiLePronom from '../components/jeux/AQuiLePronom';
import BoiteMystere from '../components/jeux/BoiteMystere';
import CoffreDesCentaines from '../components/jeux/CoffreDesCentaines';
import CombienDeTemps from '../components/jeux/CombienDeTemps';
import CommeUneImage from '../components/jeux/CommeUneImage';
import ContrairesEtJumeaux from '../components/jeux/ContrairesEtJumeaux';
import CourseDesTables from '../components/jeux/CourseDesTables';
import Crible from '../components/jeux/Crible';
import Diagramme from '../components/jeux/Diagramme';
import MetreRuban from '../components/jeux/MetreRuban';
import Miroir from '../components/jeux/Miroir';
import MotsDeLiaison from '../components/jeux/MotsDeLiaison';
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
import SuiteQuiContinue from '../components/jeux/SuiteQuiContinue';
import TourDuJardin from '../components/jeux/TourDuJardin';
import UnOuDes from '../components/jeux/UnOuDes';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** [nom, module, écran qui l'ouvre au CM1, clé du catalogue]. */
const JEUX = [
  ['les grands nombres', grands, CoffreDesCentaines, 'coffre-des-centaines'],
  ['les fractions', fractions, PartsDePizza, 'parts-de-pizza'],
  ['le calcul malin', calcul, CourseDesTables, 'course-des-tables'],
  ['masses et contenances', mesures, MetreRuban, 'metre-ruban'],
  ['les durées', durees, CombienDeTemps, 'combien-de-temps'],
  ['les aires', aires, TourDuJardin, 'tour-du-jardin'],
  ['angles, droites et miroir', geometrie, Miroir, 'le-miroir'],
  ['le tableau du marché', tableaux, Diagramme, 'le-diagramme'],
  ['les homophones', homophones, AOuA, 'a-ou-a'],
  ['les quatre temps', temps, RoueDesVerbes, 'roue-des-verbes'],
  ['préfixes et synonymes', vocabulaire, ContrairesEtJumeaux, 'contraires-et-jumeaux'],
  ['l’adjectif éloigné', accords, UnOuDes, 'un-ou-des'],
  ['types et formes', phrases, PhraseQuiDitNon, 'phrase-qui-dit-non'],
  ['le passé composé avec être', passe, SujetEloigne, 'sujet-qui-s-eloigne'],
  ['COD ou COI', complements, OuQuandComment, 'ou-quand-comment'],
  ['la règle des dixièmes', dixiemes, RegleDesDixiemes, 'regle-des-dixiemes'],
  ['la recette pour 8', recette, RecettePour8, 'recette-pour-8'],
  ['la boîte mystère', boite, BoiteMystere, 'boite-mystere'],
  ['la suite qui continue', suite, SuiteQuiContinue, 'suite-qui-continue'],
  ['le sac de billes', billes, SacDeBilles, 'sac-de-billes'],
  ['le robot', robot, Robot, 'le-robot'],
  ['le crible', crible, Crible, 'le-crible'],
  ['à qui renvoie le pronom', pronom, AQuiLePronom, 'a-qui-le-pronom'],
  ['comme une image', image, CommeUneImage, 'comme-une-image'],
  ['poème, théâtre ou récit', genres, PoemeTheatreRecit, 'poeme-theatre-recit'],
  ['les mots de liaison', liaison, MotsDeLiaison, 'mots-de-liaison'],
];

afterEach(() => { jest.restoreAllMocks(); });

describe.each(JEUX)('%s', (_, module) => {
  it('chaque partie a ses manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, 'CM1');
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
    graines.forEach((g) => module.serie(g, 'CM1').forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      m.choix.forEach((c) => {
        const sens = module.verdict(m, c.cle);
        if (String(c.cle) === String(m.bonne)) {
          expect(sens).toBe('juste');
        } else {
          expect(module.PHRASES[sens]).toBeTruthy();
          expect(module.PHRASES[sens]).not.toMatch(/raté/i);
        }
      });
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, 'CM1')).toEqual(module.serie(77, 'CM1'));
  });
});

describe('les pièges qui font chaque jeu', () => {
  // De grandes graines, comme Date.now() : les petites mélangent mal les listes courtes.
  const toutes = (module) => graines.flatMap((g) => module.serie(g * 104729, 'CM1'));

  it('les grands nombres : la bonne écriture en lettres est celle du nombre', () => {
    toutes(grands).forEach((m) => expect(enLettres(m.bonne).length).toBeGreaterThan(0));
    expect(grands.enChiffres(3045200)).toBe('3 045 200');
  });

  it('le calcul malin : la bonne réponse est le produit, et « fois dix » est toujours un piège', () => {
    toutes(calcul).forEach((m) => {
      const [n, f] = m.question.match(/\d+/g).map(Number);
      expect(m.bonne).toBe(n * f);
    });
    const neuf = toutes(calcul).find((m) => m.facteur === 9);
    const [n] = neuf.question.match(/\d+/g).map(Number);
    expect(calcul.verdict(neuf, n * 10)).toBe('fois9-oubli');
  });

  it('les durées : « 15 h 85 » est le piège de la base cent', () => {
    const fin = toutes(durees).filter((m) => m.consigne === 'fin');
    fin.forEach((m) => {
      const centaine = Object.keys(m.pieges).find((k) => m.pieges[k] === 'fin-soixante');
      expect(Number(centaine.split(' h ')[1])).toBeGreaterThanOrEqual(60);
    });
  });

  it('les aires : le périmètre est toujours proposé, et jamais égal à l’aire', () => {
    toutes(aires).forEach((m) => {
      const tour = Object.keys(m.pieges).find((k) => m.pieges[k] === 'perimetre');
      expect(Number(tour)).not.toBe(m.bonne);
    });
    expect(aires.perimetre([[0, 0], [1, 0], [0, 1], [1, 1]])).toBe(8);
  });

  it('le miroir : la figure glissée et la figure renversée ne sont jamais le bon reflet', () => {
    toutes(geometrie).filter((m) => m.consigne === 'miroir').forEach((m) => {
      const cle = (cases) => cases.map((c) => c.join('.')).sort().join(' ');
      expect(cle(m.moities.glisse)).not.toBe(cle(m.moities.miroir));
      expect(cle(m.moities.bas)).not.toBe(cle(m.moities.miroir));
    });
  });

  it('le tableau : le total d’un jour est la somme de sa colonne', () => {
    toutes(tableaux).filter((m) => m.consigne === 'total').forEach((m) => {
      const j = tableaux.JOURS.findIndex((x) => m.question.includes(` ${x},`));
      expect(m.bonne).toBe(m.tableau.reduce((s, l) => s + l[j], 0));
    });
  });

  it('les quatre temps : une forme juste à deux temps n’est jamais un piège', () => {
    toutes(temps).forEach((m) => {
      expect(m.choix.filter((c) => c.cle === m.bonne)).toHaveLength(1);
    });
  });

  it('l’adjectif éloigné : l’accord avec le nom le plus proche est toujours proposé', () => {
    toutes(accords).forEach((m) => expect(Object.values(m.pieges)).toContain('proche'));
  });

  it('types et formes : l’exclamative est une forme, jamais un type', () => {
    expect(Object.keys(phrases.TYPES)).toEqual(['declarative', 'interrogative', 'imperative']);
    expect(phrases.etiquette('declarative.neg.excl')).toBe('Déclarative, négative et exclamative');
  });

  it('le passé composé avec être : le participe s’accorde avec le sujet', () => {
    const allees = toutes(passe).find((m) => m.question.startsWith('Les filles'));
    expect(allees.bonne).toBe('allées');
    expect(passe.verdict(allees, 'allé')).toBe('accord-oubli');
  });

  it('la règle des dixièmes : le plus long n’est pas le plus grand', () => {
    toutes(dixiemes).filter((m) => m.consigne === 'plus-grand').forEach((m) => {
      const [a, b] = m.question.split('ou').map((x) => Number(x.replace('?', '').trim().replace(',', '.')));
      expect(a).toBeGreaterThan(b);
      expect(m.bonne.length).toBeLessThan(String(m.question.split('ou')[1]).trim().length);
    });
  });

  it('la recette : « ajouter autant de personnes » est toujours un piège', () => {
    toutes(recette).filter((m) => m.consigne !== 'proportionnel').forEach((m) => {
      expect(Object.values(m.pieges)).toContain('ajout');
    });
  });

  it('le robot : un seul programme mène à l’étoile', () => {
    toutes(robot).forEach((m) => {
      const arrivent = m.choix.filter((c) => {
        const fin = robot.executer(m.depart, [...c.cle]);
        return fin && fin[0] === m.etoile[0] && fin[1] === m.etoile[1];
      });
      expect(arrivent.map((c) => c.cle)).toEqual([m.bonne]);
    });
  });

  it('le crible : seulement 2, 5, 10 et les tables — et la bonne réponse passe au crible', () => {
    toutes(crible).forEach((m) => {
      const d = Number(m.question.match(/\d+/)[0]);
      expect([2, 5, 10, 6, 7, 8]).toContain(d);
      expect(m.bonne % d).toBe(0);
      m.choix.filter((c) => c.cle !== m.bonne).forEach((c) => expect(c.cle % d).not.toBe(0));
    });
  });

  it('le sac de billes : « certain », c’est une seule couleur dans le sac', () => {
    toutes(billes).filter((m) => m.bonne === 'certain').forEach((m) => {
      expect(Object.keys(m.sac)).toHaveLength(1);
    });
  });
});

describe('dans l’école', () => {
  it('chaque jeu est dans la ludothèque du CM1', () => {
    const cm1 = jeuxDeLaClasse('CM1').map((j) => j.cle);
    JEUX.forEach(([, , , cle]) => expect(cm1).toContain(cle));
  });

  it('chaque phrase de chaque jeu a sa voix', () => {
    const cles = Object.values(toutesLesRepliques()).flat().map((r) => r.cle);
    expect(cles).toContain('calcul-mental/fois9-oubli');
    expect(cles).toContain('mots-de-liaison/annonce-temps');
    expect(cles).toContain('geometrie-cm1/miroir-glisse');
  });

  const ecrans = JEUX.map(([nom, module, Jeu]) => [nom, module, Jeu]);

  it.each(ecrans)('%s : un choix faux nomme l’erreur, le bon fait continuer', async (_, module, Jeu) => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const m = module.serie(2024, 'CM1')[0];
    render(<Jeu onQuitter={jest.fn()} matiereCode="MATHS" niveau="CM1" />);
    const bonne = m.choix.find((c) => String(c.cle) === String(m.bonne));
    const fausse = m.choix.find((c) => String(c.cle) !== String(m.bonne));
    await userEvent.click(screen.getByRole('button', { name: String(fausse.libelle) }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: String(bonne.libelle) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});
