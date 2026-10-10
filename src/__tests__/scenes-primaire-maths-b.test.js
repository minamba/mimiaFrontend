/**
 * LES SCÈNES DU GROUPE « PRIMAIRE-MATHS-B » (09/10/2026) — le crible, la
 * boîte mystère, le sac de billes, la règle des dixièmes, la géométrie, le
 * tableau du marché et le robot. Pour chaque jeu, chaque classe (CM1, CM2),
 * 25 parties et chacune de leurs manches :
 *   - la question se dessine avant ET après la réponse, sans exception ;
 *   - le texte entier de la question reste à l'écran ;
 *   - les réponses jouées autrement restent des boutons qui portent leur
 *     libellé, et un clic appelle `choisir(cle)`.
 */

/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte, ses classes, ses attributs. */
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import * as crible from '../lib/jeux/crible';
import * as boite from '../lib/jeux/boiteMystere';
import * as boiteCM2 from '../lib/jeux/boiteCM2';
import * as billes from '../lib/jeux/sacDeBilles';
import * as billesCM2 from '../lib/jeux/billesCM2';
import * as dixiemes from '../lib/jeux/regleDesDixiemes';
import * as decimauxCM2 from '../lib/jeux/decimauxCM2';
import * as geometrie from '../lib/jeux/geometrieCM1';
import * as geometrieCM2 from '../lib/jeux/geometrieCM2';
import * as tableaux from '../lib/jeux/tableauxCM1';
import * as tableauxCM2 from '../lib/jeux/tableauxCM2';
import * as robot from '../lib/jeux/robot';
import * as robotCM2 from '../lib/jeux/robotCM2';
import { SCENE_CRIBLE } from '../components/jeux/scenes/primaire-maths-b/ArcDuCrible';
import { SCENE_MYSTERE } from '../components/jeux/scenes/primaire-maths-b/CoffreMystere';
import { SCENE_BILLES, situation, compte } from '../components/jeux/scenes/primaire-maths-b/SacsEtChances';
import { SCENE_DIXIEMES } from '../components/jeux/scenes/primaire-maths-b/RegleEtLoupe';
import { SCENE_GEOMETRIE, codages, SOMMETS } from '../components/jeux/scenes/primaire-maths-b/AtelierGeometrie';
import { SCENE_MARCHE } from '../components/jeux/scenes/primaire-maths-b/EtalDuMarche';
import { SCENE_ROBOT } from '../components/jeux/scenes/primaire-maths-b/RobotEtoile';

jest.setTimeout(60000);

const JEUX = [
  ['le crible', SCENE_CRIBLE, [[crible, 'CM1']]],
  ['la boîte mystère', SCENE_MYSTERE, [[boite, 'CM1'], [boiteCM2, 'CM2']]],
  ['le sac de billes', SCENE_BILLES, [[billes, 'CM1'], [billesCM2, 'CM2']]],
  ['la règle des dixièmes', SCENE_DIXIEMES, [[dixiemes, 'CM1'], [decimauxCM2, 'CM2']]],
  ['la géométrie', SCENE_GEOMETRIE, [[geometrie, 'CM1'], [geometrieCM2, 'CM2']]],
  ['le tableau du marché', SCENE_MARCHE, [[tableaux, 'CM1'], [tableauxCM2, 'CM2']]],
  ['le robot', SCENE_ROBOT, [[robot, 'CM1'], [robotCM2, 'CM2']]],
];

const GRAINES = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);
const net = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();

const cas = JEUX.flatMap(([nom, scene, modules]) => modules.map(([module, classe]) => [`${nom} (${classe})`, scene, module, classe]));

describe.each(cas)('%s', (_, scene, module, classe) => {
  const manches = GRAINES.flatMap((g) => module.serie(g, classe));
  /** Les réponses telles que l'écran les reçoit : dessinées, s'il le faut. */
  const choixDe = (m) => (scene.rendreChoix ? m.choix.map((c) => ({ ...c, libelle: scene.rendreChoix(c, m) })) : m.choix);
  const avecChoix = scene.rendreLesChoix ? it : it.skip;

  it('la question se dessine avant et après la réponse, et son texte reste à l’écran', () => {
    manches.forEach((m) => {
      [[false, {}], [true, { trouve: true }], [true, { montrer: true }]].forEach(([termine, extra]) => {
        const { container, unmount } = render(<>{scene.rendreQuestion(m, termine, extra)}</>);
        const texte = net(container.textContent).toLowerCase();
        // Jamais un rendu vide.
        expect(container.firstChild).not.toBeNull();
        // Le texte entier de la question reste à l'écran (une manche dessinée n'en a pas).
        expect(texte).toContain(net(typeof m.question === 'string' ? m.question : '').toLowerCase());
        // Rien n'est un bouton ni un « status » dans la question : l'écran commun les compte.
        expect(container.querySelectorAll('button, [role="status"]')).toHaveLength(0);
        // Jamais la preuve ni le verdict avant la réponse : ce serait la donner.
        expect(termine ? null : container.querySelector('[class*="__verdict"], [class*="__preuve"]')).toBeNull();
        // Une scène qui remplace la bulle de la réponse (`rendreApres`) la montre elle-même.
        const bonne = choixDe(m).find((c) => String(c.cle) === String(m.bonne));
        const doitMontrer = termine && scene.rendreApres && typeof bonne?.libelle === 'string';
        expect(texte).toContain(doitMontrer ? net(bonne.libelle).toLowerCase() : '');
        unmount();
      });
      const { unmount } = render(<>{scene.rendreApres ? scene.rendreApres(m) : null}</>);
      unmount();
    });
  });

  avecChoix('chaque réponse est un bouton qui porte son libellé, et un clic la choisit', () => {
    manches.forEach((m) => {
      const choisir = jest.fn();
      const choix = choixDe(m);
      const { unmount } = render(<>{scene.rendreLesChoix({
        m, choix, fautes: [], choisir, objet: 'gemme',
      })}</>);
      const boutons = screen.getAllByRole('button');
      expect(boutons).toHaveLength(choix.length);
      choix.forEach((c, i) => {
        // Le nom accessible EXACT : c'est ainsi que les tests des écrans le cherchent.
        fireEvent.click(typeof c.libelle === 'string' ? screen.getByRole('button', { name: c.libelle }) : boutons[i]);
        expect(choisir).toHaveBeenLastCalledWith(c.cle);
      });
      unmount();
    });
  });

  avecChoix('une réponse fausse reste un bouton, barré et désactivé', () => {
    const m = manches[0];
    const choix = choixDe(m);
    const fausse = choix.find((c) => String(c.cle) !== String(m.bonne));
    render(<>{scene.rendreLesChoix({
      m, choix, fautes: [fausse.cle], choisir: jest.fn(), objet: 'gemme',
    })}</>);
    const desactives = screen.getAllByRole('button').filter((b) => b.disabled);
    expect(desactives).toHaveLength(1);
    expect(desactives[0]).toHaveClass('est-fausse');
  });
});

describe('les explications qui se déroulent', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  it('le robot rejoue le bon programme en blocs, et finit sur l’étoile', () => {
    const m = robotCM2.serie(2024, 'CM2')[0];
    const { container } = render(<>{SCENE_ROBOT.rendreQuestion(m, true, { trouve: true })}</>);
    expect(container.querySelector('.sc-le-robot__repete')).toHaveTextContent(/Répète \d fois/);
    act(() => { jest.advanceTimersByTime(500 * 20); });
    expect(container.querySelector('.robot__gagne')).toBeInTheDocument();
    expect(container.querySelector('.sc-le-robot__compagnon.est-content')).toBeInTheDocument();
  });

  it('la coccinelle compte les dixièmes jusqu’à la flèche, puis la réponse s’écrit', () => {
    const m = dixiemes.serie(2024, 'CM1').find((x) => x.consigne === 'regle');
    const { container } = render(<>{SCENE_DIXIEMES.rendreQuestion(m, true, { trouve: true })}</>);
    expect(container.querySelector('.sc-regle-des-dixiemes__arrivee')).toBeNull();
    // Un pas par minuterie : chaque saut programme le suivant.
    for (let k = 0; k <= m.dixiemes; k += 1) act(() => { jest.advanceTimersByTime(600); });
    expect(container.querySelector('.sc-regle-des-dixiemes__arrivee')).toHaveTextContent(m.bonne);
    expect(container.querySelectorAll('.sc-regle-des-dixiemes__saut')).toHaveLength(m.dixiemes);
  });

  it('le crible : seul le bon nombre passe à travers le tamis', () => {
    const m = crible.serie(2024, 'CM1')[0];
    const { container } = render(<>{SCENE_CRIBLE.rendreQuestion(m, true, { trouve: true })}</>);
    expect(container.querySelector('.sc-le-crible__caillou.est-bon')).toHaveTextContent(String(m.bonne));
    expect(container.querySelectorAll('.sc-le-crible__caillou.est-retenu')).toHaveLength(m.choix.length - 1);
  });

  it('la figure du CM2 porte ses codages : le carré a quatre côtés égaux et quatre angles droits', () => {
    const carre = codages(SOMMETS.carre);
    expect(carre.traits).toHaveLength(4);
    expect(carre.angles).toHaveLength(4);
    expect(codages(SOMMETS.losange).angles).toHaveLength(0);
    expect(codages(SOMMETS['triangle-isocele']).traits).toHaveLength(2);
    expect(codages(SOMMETS['triangle-rectangle']).angles).toHaveLength(1);
  });

  it('les chances du CM2 : chaque situation est lue, et chaque issue comptée', () => {
    billesCM2.SITUATIONS.forEach(([question, a, b, bonne]) => {
      const sit = situation(question);
      expect(sit).not.toBeNull();
      const [na, nb] = [compte(sit, a).n, compte(sit, b).n];
      const attendu = na === nb ? 'autant' : (na > nb ? 'a' : 'b');
      expect(attendu).toBe(bonne);
    });
  });
});
