/**
 * LES JEUX QUI GAGNENT UN NIVEAU CE2 — Camara, le 21/09/2026 : « lance dans cet
 * ordre et développe tous les jeux ». Chaque extension se vérifie ici : le
 * CE2 a son contenu à lui, et les classes d'avant n'ont pas bougé.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoffreDesCentaines from '../components/jeux/CoffreDesCentaines';
import Marchande from '../components/jeux/Marchande';
import AOuA from '../components/jeux/AOuA';
import * as aOuA from '../lib/jeux/aOuA';
import * as roue from '../lib/jeux/roueDesVerbes';
import DetectiveDuVerbe from '../components/jeux/DetectiveDuVerbe';
import * as detective from '../lib/jeux/detectiveDuVerbe';
import * as cj from '../lib/jeux/contrairesEtJumeaux';
import UnOuDes from '../components/jeux/UnOuDes';
import * as accords from '../lib/jeux/accordsCE2';
import PhraseQuiDitNon from '../components/jeux/PhraseQuiDitNon';
import * as negation from '../lib/jeux/phraseQuiDitNon';
import * as marchande from '../lib/jeux/marchande';
import * as course from '../lib/jeux/courseDesTables';
import * as machine from '../lib/jeux/machineADix';
import * as pizza from '../lib/jeux/partsDePizza';
import * as balance from '../lib/jeux/balance';
import * as coffre from '../lib/jeux/coffreDesCentaines';
import { enLettres } from '../lib/jeux/nombresEnLettres';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 60 }, (_, i) => i + 1);

afterEach(() => { jest.restoreAllMocks(); });

describe('le coffre du CE2 : les milliers', () => {
  it.each([
    [1000, 'mille'], [2005, 'deux mille cinq'], [7200, 'sept mille deux cents'],
    [3480, 'trois mille quatre cent quatre-vingts'], [9999, 'neuf mille neuf cent quatre-vingt-dix-neuf'],
  ])('%i s’écrit « %s »', (n, lettres) => {
    expect(enLettres(n)).toBe(lettres);
  });

  it('des nombres à quatre chiffres, sans doublon, la moitié avec un zéro', () => {
    const l = coffre.NOMBRES_CE2;
    expect(new Set(l).size).toBe(l.length);
    l.forEach((n) => { expect(n).toBeGreaterThanOrEqual(1000); expect(n).toBeLessThan(10000); });
    expect(l.filter((n) => String(n).slice(1).includes('0')).length).toBeGreaterThanOrEqual(l.length / 2);
  });

  it('à la lecture, trois nombres différents dont le bon ; le zéro oublié est un leurre', () => {
    graines.forEach((g) => coffre.serie(g, 'CE2').filter((m) => m.mode === 'lire').forEach((m) => {
      expect(new Set(m.choix).size).toBe(3);
      expect(m.choix).toContain(m.nombre);
    }));
    expect(coffre.leurresCE2(3480)).toContain(348);
  });

  it('le CE1 garde ses nombres à trois chiffres', () => {
    graines.forEach((g) => coffre.serie(g).forEach((m) => expect(m.nombre).toBeLessThan(1000)));
  });

  it('l’erreur nomme la colonne des milliers', () => {
    expect(coffre.verdictConstruire(coffre.decomposer(3480), 3480, 'CE2')).toEqual({ sens: 'juste' });
    expect(coffre.verdictConstruire({ ...coffre.decomposer(3480), milliers: 2 }, 3480, 'CE2'))
      .toEqual({ sens: 'plus', colonne: 'milliers' });
    expect(coffre.phraseErreur('moins', 'milliers')).toBe('Il y a trop de milliers.');
  });

  it('à l’écran : quatre cases, et un bloc de mille à ajouter', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<CoffreDesCentaines onQuitter={jest.fn()} niveau="CE2" />);
    expect(screen.getByText('Milliers')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un bloc' }));
    expect(screen.getByRole('img', { name: '1 milliers' })).toBeInTheDocument();
  });

  it('dans la ludothèque du CE2, avec sa compétence', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'coffre-des-centaines').competences)
      .toEqual(['MATH_CE2_NUM_10000']);
  });
});

describe('la course du CE2 : toutes les tables', () => {
  it('des tables de 2 à 9, et des tables au-delà de 5 dans chaque partie', () => {
    graines.forEach((g) => {
      const l = course.serie(g, 'CE2').filter((m) => !m.jumelle);
      l.forEach((m) => expect(course.TABLES_CE2).toContain(m.a));
    });
    const grandes = graines.filter((g) => course.serie(g, 'CE2').some((m) => m.a > 5 || m.b > 5));
    expect(grandes.length).toBe(graines.length);
  });

  it('le CE1 reste aux tables de 2 à 5', () => {
    graines.forEach((g) => course.serie(g).filter((m) => !m.jumelle)
      .forEach((m) => expect(course.TABLES).toContain(m.a)));
  });

  it('la méthode compte avec le plus petit nombre', () => {
    expect(course.methode(8, 3)).toBe('Compte de 3 en 3.');
    expect(course.methode(7, 9)).toBe('Compte de 7 en 7.');
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'course-des-tables').competences)
      .toEqual(['MATH_CE2_TABLES']);
  });
});

describe('la machine du CE2 : fois dix et fois cent', () => {
  it('une manche sur deux passe par la machine à cent ; le CE1 reste à dix', () => {
    graines.forEach((g) => {
      expect(machine.serie(g, 'CE2').filter((m) => m.facteur === 100)).toHaveLength(4);
      machine.serie(g).forEach((m) => expect(machine.facteurDe(m)).toBe(10));
    });
  });

  it('trois choix différents, dont le bon', () => {
    graines.forEach((g) => machine.serie(g, 'CE2').forEach((m) => {
      expect(new Set(m.choix).size).toBe(3);
      expect(m.choix).toContain(machine.reponse(m));
    }));
  });

  it('les pièges de la machine à cent se nomment', () => {
    const m = { mode: 'sortie', entree: 34, facteur: 100 };
    expect(machine.verdict(3400, m)).toBe('juste');
    expect(machine.verdict(134, m)).toBe('plus-cent');
    expect(machine.verdict(340, m)).toBe('un-zero');
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'machine-a-dix').competences)
      .toEqual(['MATH_CE2_MULT_DIX_CENT']);
  });
});

describe('les pizzas du CE2', () => {
  const vaut = (f) => f.n / f.d;

  it('à lire : au moins deux fractions plus grandes que 1, jamais un nombre rond de pizzas', () => {
    graines.forEach((g) => {
      const lire = pizza.serie(g, 'CE2').filter((m) => m.mode === 'lire');
      expect(lire.filter((m) => m.fraction.n > m.fraction.d).length).toBeGreaterThanOrEqual(2);
      lire.forEach((m) => {
        expect(m.fraction.n % m.fraction.d).not.toBe(0);
        expect(new Set(m.choix.map(pizza.cle)).size).toBe(3);
      });
    });
  });

  it('les égalités sont vraies, et leurs pièges ne le sont pas', () => {
    pizza.EGALITES.forEach(([a, b]) => expect(vaut(a)).toBe(vaut(b)));
    graines.forEach((g) => pizza.serie(g, 'CE2').filter((m) => m.mode === 'egaler').forEach((m) => {
      m.choix.filter((f) => pizza.cle(f) !== pizza.cle(m.fraction))
        .forEach((f) => expect(vaut(f)).not.toBe(vaut(m.modele)));
    }));
  });

  it('le piège du CE2 se nomme : ne compter que la dernière pizza', () => {
    const lire = { mode: 'lire', fraction: { n: 5, d: 4 } };
    expect(pizza.verdict({ n: 1, d: 4 }, lire)).toBe('reste');
    expect(pizza.verdict({ n: 4, d: 5 }, lire)).toBe('envers');
  });

  it('le CE1 ne voit jamais de fraction plus grande que 1 à lire', () => {
    graines.forEach((g) => pizza.serie(g).filter((m) => m.mode === 'lire')
      .forEach((m) => expect(m.fraction.n).toBeLessThan(m.fraction.d)));
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'parts-de-pizza').competences)
      .toEqual(['MATH_CE2_FRAC_SUP_UN', 'MATH_CE2_FRAC_EGALITES', 'MATH_CE2_FRAC_ADD']);
  });
});

describe('la balance du CE2 : grammes et kilogrammes', () => {
  /** Toutes les façons de prendre des poids dans la boîte, chacun une fois. */
  const sommes = (boite) => {
    const res = new Map();
    for (let masque = 1; masque < 1 << boite.length; masque += 1) {
      const pris = boite.filter((_, i) => masque & (1 << i));
      const s = pris.reduce((a, b) => a + b, 0);
      if (!res.has(s)) res.set(s, pris);
    }
    return res;
  };

  it('chaque objet à mesurer s’équilibre avec la boîte du CE2', () => {
    const possibles = sommes(balance.BOITE_POIDS_CE2);
    balance.OBJETS.filter((o) => o.masse >= 2).forEach((o) => {
      expect(possibles.has(balance.grammes(o.cle, 'CE2'))).toBe(true);
    });
  });

  it('la masse se dit en kilogrammes et en grammes', () => {
    expect(balance.enKilos(1250)).toBe('1 kilogramme 250 grammes');
    expect(balance.enKilos(1000)).toBe('1 kilogramme');
    expect(balance.enKilos(500)).toBe('500 grammes');
    expect(balance.resultatCE2('caillou')).toBe('Le caillou pèse 1 kilogramme 500 grammes.');
    expect(balance.etiquettePoids(1000)).toBe('1 kg');
  });

  it('le CE1 garde ses grammes', () => {
    expect(balance.grammes('pomme')).toBe(300);
    expect(balance.grammes('pomme', 'CE2')).toBe(750);
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'balance').competences).toEqual(['MATH_CE2_MES_MASSE']);
  });
});

describe('la marchande du CE2 : les prix à virgule', () => {
  it('huit prix différents, de 1,05 € à 4,95 €, par 5 centimes', () => {
    graines.forEach((g) => {
      const l = marchande.serieCE2(g);
      expect(new Set(l.map((m) => m.prix)).size).toBe(8);
      l.forEach((m) => {
        expect(m.prix % 5).toBe(0);
        expect(m.prix).toBeGreaterThanOrEqual(105);
        expect(m.prix).toBeLessThanOrEqual(495);
        expect(m.prix % 100).not.toBe(0);
      });
      l.slice(0, 3).forEach((m) => expect(m.prix % 10).toBe(0));
    });
  });

  it('écrit et dit le prix, et regarde les euros avant les centimes', () => {
    expect(marchande.ecrirePrix(345)).toBe('3,45 €');
    expect(marchande.ecrirePrix(205)).toBe('2,05 €');
    expect(marchande.prixEnMots(345)).toBe('3 euros et 45 centimes');
    expect(marchande.verdictCE2([200, 100, 20, 20, 5], 345)).toBe('juste');
    expect(marchande.verdictCE2([200, 20, 20, 5], 345)).toBe('euros');
    expect(marchande.verdictCE2([200, 100, 20, 20], 345)).toBe('centimes');
  });

  it('à l’écran : l’étiquette, les centimes, et l’annonce', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<Marchande onQuitter={jest.fn()} niveau="CE2" />);
    const m = marchande.serieCE2(2024)[0];
    expect(screen.getByText(marchande.ecrirePrix(m.prix))).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Poser 50 c' }));
    await userEvent.click(screen.getByRole('button', { name: /C’est payé/ }));
    expect(screen.getByRole('status')).toHaveTextContent(marchande.PHRASES_CE2.euros);
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'marchande').competences).toEqual(['MATH_CE2_MES_MONNAIE']);
  });
});

describe('son ou sont ? on ou ont ? — le CE2', () => {
  it('cinq phrases de chaque paire, jamais un trou en tête de phrase', () => {
    graines.forEach((g) => {
      const l = aOuA.serie(g, 'CE2');
      expect(l.filter((p) => aOuA.paire(p)[0] === 'son')).toHaveLength(5);
      expect(l.filter((p) => aOuA.paire(p)[0] === 'on')).toHaveLength(5);
    });
    [...aOuA.PHRASES_SON, ...aOuA.PHRASES_ON].forEach((p) => expect(p.avant.length).toBeGreaterThan(0));
  });

  it('la preuve : « étaient » et « avaient » remplacent le verbe', () => {
    expect(aOuA.avecRemplacant(aOuA.PHRASES_SON[1])).toBe('Les enfants étaient dans la cour.');
    expect(aOuA.avecRemplacant(aOuA.PHRASES_ON[1])).toBe('Mes parents avaient une voiture rouge.');
  });

  it('le CE1 garde a/à et et/est', () => {
    graines.forEach((g) => aOuA.serie(g).forEach((p) => expect(['a', 'à', 'et', 'est']).toContain(p.bon)));
  });

  it('à l’écran : la méthode de « sont »', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<AOuA onQuitter={jest.fn()} matiereCode="FRANCAIS" niveau="CE2" />);
    const p = aOuA.serie(2024, 'CE2')[0];
    const faux = aOuA.paire(p).find((m) => m !== p.bon);
    await userEvent.click(screen.getByRole('button', { name: faux }));
    expect(screen.getByRole('status')).toHaveTextContent(aOuA.PHRASES[p.bon]);
  });

  it('dans la ludothèque du CE2, sous son propre titre', () => {
    const jeu = jeuxDeLaClasse('CE2').find((j) => j.cle === 'a-ou-a');
    expect(jeu.titre).toBe('son ou sont ? on ou ont ?');
    expect(jeu.competences).toEqual(['FR_CE2_LANG_SON_ONT']);
  });
});

describe('la roue du CE2 : trois temps', () => {
  it('conjugue à l’imparfait et au futur, être et avoir compris', () => {
    expect(roue.forme('chanter', 'nous', 'imparfait')).toBe('chantions');
    expect(roue.forme('chanter', 'ils', 'imparfait')).toBe('chantaient');
    expect(roue.forme('chanter', 'je', 'futur')).toBe('chanterai');
    expect(roue.forme('être', 'tu', 'futur')).toBe('seras');
    expect(roue.forme('avoir', 'vous', 'imparfait')).toBe('aviez');
    expect(roue.avecPronom('je', roue.forme('être', 'je', 'imparfait'))).toBe('j’étais');
  });

  it('trois formes différentes dont la bonne, et les trois temps dans chaque partie', () => {
    graines.forEach((g) => {
      const l = roue.serie(g, 'CE2');
      ['present', 'imparfait', 'futur'].forEach((t) => expect(l.some((m) => m.temps === t)).toBe(true));
      l.forEach((m) => {
        expect(new Set(m.choix).size).toBe(3);
        expect(m.choix).toContain(roue.forme(m.verbe, m.pronom, m.temps));
      });
    });
  });

  it('l’erreur donne un modèle, sans épeler', () => {
    expect(roue.regleCE2('imparfait-2')).toBe('À l’imparfait, avec « il », on écrit comme dans « il chantait ».');
    expect(roue.regleCE2('futur-0')).toBe('Au futur, avec « je », on écrit comme dans « je chanterai ».');
    expect(roue.regleCE2('être-futur')).toBe('Au futur, le verbe être fait : je serai, tu seras, il sera, nous serons, vous serez, ils seront.');
  });

  it('le CE1 reste au présent', () => {
    graines.forEach((g) => roue.serie(g).forEach((m) => expect(m.temps).toBeUndefined()));
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'roue-des-verbes').competences).toEqual(['FR_CE2_LANG_TROIS_TEMPS']);
  });
});

describe('le détective du CE2 : les classes de mots', () => {
  it('chaque mot a une classe, et chaque phrase une étiquette par mot', () => {
    detective.PHRASES_CE2.forEach((p) => {
      expect(p.classes).toHaveLength(p.mots.length);
      p.classes.forEach((c) => expect([...detective.CLASSES, 'autre']).toContain(c));
    });
  });

  it('huit enquêtes, les cinq classes demandées, toujours dans une phrase qui la contient', () => {
    graines.forEach((g) => {
      const l = detective.serieCE2(g);
      expect(l).toHaveLength(detective.MANCHES);
      expect(new Set(l.map((m) => m.cible)).size).toBe(5);
      l.forEach((m) => expect(detective.PHRASES_CE2[m.phrase].classes).toContain(m.cible));
    });
  });

  it('à l’écran : un mot faux dit sa classe et rappelle la définition', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<DetectiveDuVerbe onQuitter={jest.fn()} matiereCode="FRANCAIS" niveau="CE2" />);
    const { phrase, cible } = detective.serieCE2(2024)[0];
    const p = detective.PHRASES_CE2[phrase];
    const faux = p.classes.findIndex((c) => c !== cible);
    await userEvent.click(screen.getAllByRole('button', { name: p.mots[faux] })[0]);
    expect(screen.getByRole('status')).toHaveTextContent(detective.PHRASES_CLASSES.definition[cible]);
    const bon = p.classes.indexOf(cible);
    await userEvent.click(screen.getAllByRole('button', { name: p.mots[bon] })[0]);
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'detective-du-verbe').competences).toEqual(['FR_CE2_LANG_CLASSES']);
  });
});

describe('contraires et jumeaux au CE2 : les familles de mots', () => {
  it('quatre familles sur dix manches, avec leur sosie parmi les choix', () => {
    graines.forEach((g) => {
      const l = cj.serie(g, 'CE2');
      expect(l).toHaveLength(cj.MANCHES);
      const fam = l.filter((m) => m.demande === 'famille');
      expect(fam).toHaveLength(4);
      fam.forEach((m) => {
        expect(m.choix).toContain(cj.famille(m.mot).famille);
        expect(m.choix).toContain(cj.famille(m.mot).sosie);
        expect(new Set(m.choix).size).toBe(3);
      });
    });
  });

  it('le sosie commence comme le mot, mais n’est pas le mot de la famille', () => {
    cj.FAMILLES.forEach((f) => {
      expect(f.sosie).not.toBe(f.famille);
      expect(f.sosie.slice(0, 2)).toBe(f.mot.slice(0, 2));
    });
  });

  it('le sosie se nomme', () => {
    const m = { mot: 'mer', demande: 'famille' };
    expect(cj.verdict(m, 'marin')).toBe('juste');
    expect(cj.verdict(m, 'merci')).toBe('sosie');
  });

  it('le CE1 n’a pas de famille', () => {
    graines.forEach((g) => cj.serie(g).forEach((m) => expect(m.demande).not.toBe('famille')));
  });

  it('dans la ludothèque du CE2', () => {
    expect(jeuxDeLaClasse('CE2').find((j) => j.cle === 'contraires-et-jumeaux').competences)
      .toEqual(['FR_CE2_LANG_VOC_RELATIONS']);
  });
});

describe('féminin et pluriel — un ou des au CE2', () => {
  it('chaque groupe a trois noms et trois adjectifs différents, et une règle connue', () => {
    accords.GROUPES.forEach((g) => {
      expect(new Set([g.nom, ...g.nomsFaux]).size).toBe(3);
      expect(new Set([g.adj, ...g.adjsFaux]).size).toBe(3);
      expect(accords.REGLES[`nom-${g.regleNom}`]).toBeDefined();
      expect(accords.REGLES[`adj-${g.regleAdj}`]).toBeDefined();
    });
  });

  it('aucun modèle de règle n’est un mot du jeu : il ne donne pas la réponse', () => {
    const motsDuJeu = accords.GROUPES.flatMap((g) => [g.nom, g.adj]);
    Object.values(accords.REGLES).forEach((r) => {
      motsDuJeu.forEach((m) => expect(r.split(/[ ,.:]+/)).not.toContain(m));
    });
  });

  it('cinq pluriels et trois féminins par partie', () => {
    graines.forEach((g) => {
      const l = accords.serie(g).map((m) => accords.groupe(m.groupe));
      expect(l.filter((x) => x.sens === 'pluriel')).toHaveLength(5);
      expect(l.filter((x) => x.sens === 'feminin')).toHaveLength(3);
    });
  });

  it('le nom est jugé avant l’adjectif', () => {
    const g = accords.GROUPES[0]; // un cheval noir
    expect(accords.verdict(g, 'chevaux', 'noirs')).toBe('juste');
    expect(accords.verdict(g, 'chevals', 'noir')).toBe('nom-al');
    expect(accords.verdict(g, 'chevaux', 'noir')).toBe('adj-s');
  });

  it('à l’écran : le groupe, puis l’annonce', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<UnOuDes onQuitter={jest.fn()} matiereCode="FRANCAIS" niveau="CE2" />);
    const g = accords.groupe(accords.serie(2024)[0].groupe);
    expect(screen.getByText(g.depart)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: g.nom }));
    await userEvent.click(screen.getByRole('button', { name: g.adj }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('dans la ludothèque du CE2, sous son titre', () => {
    const jeu = jeuxDeLaClasse('CE2').find((j) => j.cle === 'un-ou-des');
    expect(jeu.titre).toBe('Féminin et pluriel');
    expect(jeu.competences).toEqual(['FR_CE2_LANG_FEMININ']);
  });
});

describe('transformer une phrase — la phrase qui dit non au CE2', () => {
  it('écrit juste les trois formes', () => {
    const chat = negation.PHRASES_JEU[0]; // Le chat dort.
    const [neg, int, exc] = negation.FORMES.map((f) => negation.propositions(chat, f)[0].texte);
    expect(neg).toBe('Le chat ne dort pas.');
    expect(int).toBe('Est-ce que le chat dort ?');
    expect(exc).toBe('Comme le chat dort !');
    const il = negation.PHRASES_JEU[2]; // Il aime les épinards.
    expect(negation.propositions(il, 'interrogative')[0].texte).toBe('Est-ce qu’il aime les épinards ?');
  });

  it('trois propositions différentes, une seule juste, et les fautes nommées', () => {
    negation.PHRASES_JEU.forEach((p) => negation.FORMES.forEach((f) => {
      const l = negation.propositions(p, f);
      expect(new Set(l.map((c) => c.texte)).size).toBe(3);
      expect(l.filter((c) => c.faute === null)).toHaveLength(1);
      l.filter((c) => c.faute).forEach((c) => expect(negation.PHRASES_CE2[c.faute]).toBeDefined());
    }));
  });

  it('neuf manches, trois de chaque forme', () => {
    graines.forEach((g) => {
      const l = negation.serieCE2(g);
      expect(l).toHaveLength(9);
      negation.FORMES.forEach((f) => expect(l.filter((m) => m.forme === f)).toHaveLength(3));
    });
  });

  it('à l’écran : la négation sans « ne » est nommée', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<PhraseQuiDitNon onQuitter={jest.fn()} matiereCode="FRANCAIS" niveau="CE2" />);
    const m = negation.serieCE2(2024)[0];
    const faux = m.choix.find((c) => c.faute);
    await userEvent.click(screen.getByRole('button', { name: faux.texte }));
    expect(screen.getByRole('status')).toHaveTextContent(negation.PHRASES_CE2[faux.faute]);
  });

  it('dans la ludothèque du CE2', () => {
    const jeu = jeuxDeLaClasse('CE2').find((j) => j.cle === 'phrase-qui-dit-non');
    expect(jeu.titre).toBe('Transforme la phrase');
    expect(jeu.competences).toEqual(['FR_CE2_LANG_FORMES']);
  });
});
