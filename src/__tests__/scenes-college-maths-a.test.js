/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte, ses attributs ; et sur des
   milliers de manches, les requêtes par rôle seraient bien trop lentes. */
import { fireEvent, render, within } from '@testing-library/react';
import SCENES from '../components/jeux/scenes/groupes/college-maths-a';
import { divisionPosee } from '../components/jeux/scenes/college-maths-a/Partage';
import { jetons, reduire } from '../components/jeux/scenes/college-maths-a/BonneParenthese';
import * as grandsNombres from '../lib/jeux/college/grands-nombres-college';
import * as loupe from '../lib/jeux/college/loupe-college';
import * as operations from '../lib/jeux/college/operations-college';
import * as partage from '../lib/jeux/college/partage-college';
import * as calculMental from '../lib/jeux/college/calcul-mental-college';
import * as parenthese from '../lib/jeux/college/bonne-parenthese';
import * as crible from '../lib/jeux/college/crible-college';
import * as fractions from '../lib/jeux/college/fractions-college';
import * as droite from '../lib/jeux/college/droite-des-fractions';
import * as deuxTiers from '../lib/jeux/college/deux-tiers-du-sac';
import * as recette from '../lib/jeux/college/recette-college';
import * as metre from '../lib/jeux/college/metre-ruban-college';
import * as temps from '../lib/jeux/college/combien-de-temps-college';
import * as jardin from '../lib/jeux/college/tour-du-jardin-college';
import * as rapporteur from '../lib/jeux/college/rapporteur';
import * as detective from '../lib/jeux/college/detective-des-figures';
import * as miroir from '../lib/jeux/college/miroir-college';

/**
 * LES SCÈNES « COLLÈGE, MATHS A » (09/10/2026) : pour chaque jeu, chaque
 * classe, 25 parties et toutes leurs manches — la scène se dessine avant et
 * après la réponse, garde la question entière à l'écran, ne montre aucune
 * explication avant la réponse, en montre une (jamais le simple repli)
 * après ; ses réponses jouées autrement restent des boutons à leur libellé.
 * Les écarts sont collectés puis comparés à une liste vide : le message
 * d'échec dit quelle manche a fauté.
 */
const MODULES = [
  grandsNombres, loupe, operations, partage, calculMental, parenthese, crible, fractions, droite,
  deuxTiers, recette, metre, temps, jardin, rapporteur, detective, miroir,
];

const normal = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();

describe('le registre du groupe', () => {
  it('couvre les dix-sept jeux, et eux seuls', () => {
    expect(Object.keys(SCENES).sort()).toEqual(MODULES.map((mod) => mod.FAMILLE.cle).sort());
  });

  it('préfixe ses objets par la clé du jeu', () => {
    const objets = Object.entries(SCENES).filter(([, s]) => s.objets);
    expect(objets.map(([, s]) => s.objets)).toEqual(objets.map(([cle]) => `sc-${cle}`));
  });
});

describe.each(MODULES.map((mod) => [mod.FAMILLE.cle, mod]))('%s', (cle, mod) => {
  const scene = SCENES[cle];

  it.each(mod.CLASSES)('dessine toutes les manches en %s', (classe) => {
    const absentes = [];
    const avantLaReponse = [];
    const replis = [];
    const boutonsFaux = [];
    for (let g = 0; g < 25; g += 1) {
      mod.serie(g * 7919 + 13, classe).forEach((m) => {
        const attendu = normal(m.question);
        const trace = `${m.consigne} : ${m.question}`;

        const { container: avant, unmount: oteAvant } = render(<>{scene.question(m, false, {})}</>);
        if (!normal(avant.textContent).includes(attendu)) absentes.push(`avant — ${trace}`);
        // Rien d'expliqué avant la réponse.
        if (avant.querySelector('[data-explication]')) avantLaReponse.push(trace);
        oteAvant();

        const { container: apres, unmount: oteApres } = render(<>{scene.question(m, true, { trouve: true })}</>);
        if (!normal(apres.textContent).includes(attendu)) absentes.push(`après — ${trace}`);
        const explication = apres.querySelector('[data-explication]');
        if (!explication || explication.hasAttribute('data-repli')) replis.push(trace);
        oteApres();

        if (!scene.choix) return;
        const choisir = jest.fn();
        const { container: reponses, unmount: oteReponses } = render(<>{scene.choix({
          m, choix: m.choix, fautes: [], choisir, objet: null,
        })}</>);
        const boutons = within(reponses).getAllByRole('button');
        if (boutons.length !== m.choix.length) boutonsFaux.push(`nombre — ${trace}`);
        m.choix.forEach((c, i) => {
          const nom = normal(boutons[i]?.getAttribute('aria-label') ?? boutons[i]?.textContent);
          if (typeof c.libelle === 'string' && !nom.includes(normal(c.libelle))) boutonsFaux.push(`libellé ${c.libelle} — ${trace}`);
          fireEvent.click(boutons[i]);
          if (choisir.mock.calls[choisir.mock.calls.length - 1]?.[0] !== c.cle) boutonsFaux.push(`clic ${c.cle} — ${trace}`);
        });
        oteReponses();
      });
    }
    // Le texte entier de la question reste à l'écran, avant comme après.
    expect(absentes).toEqual([]);
    expect(avantLaReponse).toEqual([]);
    // Chaque sorte de manche a son explication propre : aucune ne retombe sur le simple rappel.
    expect(replis).toEqual([]);
    // Chaque réponse jouée autrement est un bouton à son libellé, qui choisit sa clé.
    expect(boutonsFaux).toEqual([]);
  });
});

describe('les réponses jouées autrement', () => {
  it('une réponse déjà fausse est désactivée et marquée', () => {
    const fautives = [];
    Object.entries(SCENES).filter(([, s]) => s.choix).forEach(([cle, scene]) => {
      const mod = MODULES.find((x) => x.FAMILLE.cle === cle);
      const m = mod.serie(42, mod.CLASSES[0])[0];
      const faute = m.choix.find((c) => c.cle !== m.bonne).cle;
      const { container: reponses, unmount: oteReponses } = render(<>{scene.choix({
        m, choix: m.choix, fautes: [faute], choisir: jest.fn(), objet: null,
      })}</>);
      const bouton = within(reponses).getAllByRole('button')[m.choix.findIndex((c) => c.cle === faute)];
      if (!bouton.disabled || !/est-fausse/.test(bouton.className)) fautives.push(cle);
      oteReponses();
    });
    expect(fautives).toEqual([]);
  });

  it('le crible accepte une fève qu’on y glisse', () => {
    const m = crible.serie(42, 'SIXIEME')[0];
    const choisir = jest.fn();
    const { container } = render(<>{SCENES['crible-college'].choix({
      m, choix: m.choix, fautes: [], choisir, objet: null,
    })}</>);
    const donnees = { getData: () => String(m.choix[1].cle), setData: () => {} };
    fireEvent.drop(container.querySelector('.sc-crible-college__crible'), { dataTransfer: donnees });
    expect(choisir).toHaveBeenCalledWith(m.choix[1].cle);
  });
});

describe('les calculs des explications', () => {
  it('la division posée retrouve le quotient et le reste du module', () => {
    const ecarts = [];
    for (let g = 0; g < 60; g += 1) {
      partage.serie(g * 7919 + 13, 'SIXIEME').forEach((m) => {
        const r = /^([\d\s ]+(?:,\d+)?)\s*÷\s*(\d+)/.exec(m.question);
        const avecReste = /reste/.test(m.question);
        const d = divisionPosee(r[1].replace(/[\s ]/g, ''), Number(r[2]), avecReste);
        const trouve = avecReste ? `q = ${d.quotient}, r = ${d.reste}` : d.quotient;
        if (trouve !== m.bonne) ecarts.push(`${m.question} : ${trouve} au lieu de ${m.bonne}`);
      });
    }
    expect(ecarts).toEqual([]);
  });

  it('les pas du calcul finissent sur la bonne valeur, et le premier pas est le bon', () => {
    const ecarts = [];
    for (let g = 0; g < 60; g += 1) {
      ['SIXIEME', 'CINQUIEME'].forEach((classe) => {
        parenthese.serie(g * 7919 + 13, classe).forEach((m) => {
          const r = reduire(jetons(m.question));
          let trouve = r?.fin;
          if (r && m.consigne === 'premier') trouve = r.pas[0].jetons.slice(r.pas[0].ou, r.pas[0].ou + 3).join(' ');
          if (trouve !== m.bonne) ecarts.push(`${m.question} : ${trouve} au lieu de ${m.bonne}`);
        });
      });
    }
    expect(ecarts).toEqual([]);
  });
});

describe('une question inattendue', () => {
  it('ne casse aucune scène et garde la question à l’écran', () => {
    const m = {
      consigne: 'inconnue', question: 'Une question ¤ jamais vue ?', choix: [{ cle: 'a', libelle: 'a' }, { cle: 'b', libelle: 'b' }], bonne: 'a',
    };
    const fautives = [];
    Object.entries(SCENES).forEach(([cle, scene]) => {
      [false, true].forEach((termine) => {
        const { container: vue, unmount: oteVue } = render(<>{scene.question(m, termine, {})}</>);
        const garde = normal(vue.textContent).includes(m.question);
        const explique = Boolean(vue.querySelector('[data-explication]'));
        if (!garde || explique !== termine) fautives.push(`${cle} (${termine ? 'après' : 'avant'})`);
        oteVue();
      });
    });
    expect(fautives).toEqual([]);
  });
});
