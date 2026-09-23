/**
 * LES SIX JEUX DE FRANÇAIS DU CE1 — le contenu d'abord (chaque phrase n'a
 * qu'une réponse, chaque leurre est un vrai piège et pas une seconde bonne
 * réponse), puis chaque écran : l'erreur se nomme, la bonne réponse fait
 * continuer.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AOuA from '../components/jeux/AOuA';
import ContrairesEtJumeaux from '../components/jeux/ContrairesEtJumeaux';
import DetectiveDuVerbe from '../components/jeux/DetectiveDuVerbe';
import PhraseQuiDitNon from '../components/jeux/PhraseQuiDitNon';
import RoueDesVerbes from '../components/jeux/RoueDesVerbes';
import TypesDePhrases from '../components/jeux/TypesDePhrases';
import * as aOuA from '../lib/jeux/aOuA';
import * as cj from '../lib/jeux/contrairesEtJumeaux';
import * as detective from '../lib/jeux/detectiveDuVerbe';
import * as negation from '../lib/jeux/phraseQuiDitNon';
import * as roue from '../lib/jeux/roueDesVerbes';
import * as types from '../lib/jeux/typesDePhrases';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 60 }, (_, i) => i + 1);

afterEach(() => { jest.restoreAllMocks(); });
beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

describe('a ou à ? et ou est ?', () => {
  it('cinq phrases de chaque paire, et chaque mot est bien l’un des deux de sa paire', () => {
    graines.forEach((g) => {
      const l = aOuA.serie(g);
      expect(l).toHaveLength(aOuA.MANCHES);
      expect(l.filter((p) => aOuA.paire(p)[0] === 'a')).toHaveLength(5);
    });
    [...aOuA.PHRASES_A, ...aOuA.PHRASES_ET].forEach((p) => expect(aOuA.paire(p)).toContain(p.bon));
  });

  it('la preuve : « avait » et « était » remplacent le verbe', () => {
    expect(aOuA.avecRemplacant(aOuA.PHRASES_A[0])).toBe('Léo avait un chat.');
    expect(aOuA.avecRemplacant(aOuA.PHRASES_ET[0])).toBe('Le ciel était bleu.');
  });

  it('à l’écran : la mauvaise réponse donne la méthode', async () => {
    render(<AOuA onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const p = aOuA.serie(2024)[0];
    const faux = aOuA.paire(p).find((m) => m !== p.bon);
    await userEvent.click(screen.getByRole('button', { name: faux }));
    expect(screen.getByRole('status')).toHaveTextContent(aOuA.PHRASES[p.bon]);
    await userEvent.click(screen.getByRole('button', { name: p.bon }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});

describe('raconte, question ou ordre ?', () => {
  it('trois phrases de chaque type, sans leur signe de fin', () => {
    graines.forEach((g) => {
      const l = types.serie(g);
      types.TYPES.forEach((t) => expect(l.filter((p) => p.type === t.cle)).toHaveLength(3));
      l.forEach((p) => expect(p.texte).not.toMatch(/[.?!]$/));
    });
  });

  it('à l’écran : un ordre pris pour un récit est nommé', async () => {
    render(<TypesDePhrases onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const p = types.serie(2024)[0];
    const faux = types.TYPES.find((t) => t.cle !== p.type);
    await userEvent.click(screen.getByRole('button', { name: faux.libelle }));
    expect(screen.getByRole('status')).toHaveTextContent(types.PHRASES[p.type]);
  });
});

describe('contraires et jumeaux', () => {
  it('le piège (l’autre relation) est toujours parmi les choix', () => {
    graines.forEach((g) => cj.serie(g).forEach((m) => {
      const t = cj.triplet(m.mot);
      expect(m.choix).toContain(t.contraire);
      expect(m.choix).toContain(t.jumeau);
      expect(new Set(m.choix).size).toBe(3);
    }));
  });

  it('le troisième choix ne vient jamais d’un triplet voisin', () => {
    graines.forEach((g) => cj.serie(g).forEach((m) => {
      const t = cj.triplet(m.mot);
      const intrus = m.choix.find((c) => c !== t.contraire && c !== t.jumeau);
      const origine = cj.MOTS.find((x) => x.contraire === intrus || x.jumeau === intrus);
      expect(t.eviter ?? []).not.toContain(origine.mot);
    }));
  });

  it('les voisinages sont réciproques', () => {
    cj.MOTS.forEach((t) => (t.eviter ?? []).forEach((v) => {
      expect(cj.triplet(v).eviter ?? []).toContain(t.mot);
    }));
  });

  it('à l’écran : le jumeau pris pour le contraire est nommé', async () => {
    render(<ContrairesEtJumeaux onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const m = cj.serie(2024)[0];
    const t = cj.triplet(m.mot);
    const piege = m.demande === 'contraire' ? t.jumeau : t.contraire;
    await userEvent.click(screen.getByRole('button', { name: piege }));
    expect(screen.getByRole('status')).toHaveTextContent(
      m.demande === 'contraire' ? cj.PHRASES.piegeContraire : cj.PHRASES.piegeJumeau,
    );
  });
});

describe('la roue des verbes', () => {
  it('conjugue juste, élision comprise', () => {
    expect(roue.forme('chanter', 'nous')).toBe('chantons');
    expect(roue.forme('chanter', 'elles')).toBe('chantent');
    expect(roue.forme('être', 'vous')).toBe('êtes');
    expect(roue.forme('avoir', 'il')).toBe('a');
    expect(roue.avecPronom('je', roue.forme('aimer', 'je'))).toBe('j’aime');
    expect(roue.avecPronom('je', roue.forme('chanter', 'je'))).toBe('je chante');
  });

  it('trois formes différentes, dont la bonne ; être et avoir dans chaque partie', () => {
    graines.forEach((g) => {
      const l = roue.serie(g);
      expect(l.map((m) => m.verbe)).toContain('être');
      expect(l.map((m) => m.verbe)).toContain('avoir');
      l.forEach((m) => {
        expect(new Set(m.choix).size).toBe(3);
        expect(m.choix).toContain(roue.forme(m.verbe, m.pronom));
      });
    });
  });

  it('les formes qui sonnent pareil sont proposées d’abord', () => {
    const choix = roue.formesProposees('chanter', 'je', () => 0.5);
    expect([...choix].sort()).toEqual(['chante', 'chantent', 'chantes']);
  });

  it('à l’écran : la mauvaise terminaison rappelle la règle du pronom', async () => {
    render(<RoueDesVerbes onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const m = roue.serie(2024)[0];
    const faux = m.choix.find((f) => f !== roue.forme(m.verbe, m.pronom));
    await userEvent.click(screen.getByRole('button', { name: faux }));
    expect(screen.getByRole('status')).toHaveTextContent(roue.PHRASES[roue.verdict(m, faux)]);
  });
});

describe('le détective du verbe', () => {
  it('chaque phrase a son verbe hors du sujet, et au moins une partie a le sujet ailleurs qu’en tête', () => {
    detective.PHRASES_JEU.forEach((p) => {
      expect(p.sujet).not.toContain(p.verbe);
      expect(p.verbe).toBeLessThan(p.mots.length);
    });
    graines.forEach((g) => {
      expect(detective.serie(g).some((i) => detective.phrase(i).sujet[0] !== 0)).toBe(true);
    });
  });

  it('à l’écran : le verbe, puis le sujet', async () => {
    render(<DetectiveDuVerbe onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const p = detective.phrase(detective.serie(2024)[0]);
    const pasLeVerbe = p.mots.findIndex((_, i) => i !== p.verbe);

    await userEvent.click(screen.getAllByRole('button', { name: p.mots[pasLeVerbe] })[0]);
    expect(screen.getByRole('status')).toHaveTextContent(detective.PHRASES.erreurVerbe);

    await userEvent.click(screen.getByRole('button', { name: p.mots[p.verbe] }));
    expect(screen.getByText(detective.questionSujet(p))).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: p.mots[p.sujet[0]] })[0]);
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});

describe('la phrase qui dit non', () => {
  it('écrit juste la phrase négative, avec l’élision', () => {
    expect(negation.negative(negation.PHRASES_JEU[0])).toBe('Le chat ne dort pas.');
    expect(negation.negative(negation.PHRASES_JEU[2])).toBe('Il n’aime pas les épinards.');
  });

  it('nomme chaque erreur', () => {
    const p = negation.PHRASES_JEU[2]; // Il aime les épinards.
    expect(negation.verdict(p, { ne: 1, pas: 2, forme: 'n’' })).toBe('juste');
    expect(negation.verdict(p, { ne: 0, pas: 2, forme: 'n’' })).toBe('place-ne');
    expect(negation.verdict(p, { ne: 1, pas: 3, forme: 'n’' })).toBe('place-pas');
    expect(negation.verdict(p, { ne: 1, pas: 2, forme: 'ne' })).toBe('elision');
  });

  it('au moins deux phrases à élision par partie', () => {
    graines.forEach((g) => {
      const l = negation.serie(g).map(negation.phrase);
      expect(l.filter((p) => negation.formeDuNe(p) === 'n’').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('à l’écran : rien ne se gagne sans l’annoncer', async () => {
    render(<PhraseQuiDitNon onQuitter={jest.fn()} matiereCode="FRANCAIS" />);
    const p = negation.phrase(negation.serie(2024)[0]);
    const f = negation.formeDuNe(p);

    await userEvent.click(screen.getByRole('button', { name: f }));
    let espaces = screen.getAllByRole('button', { name: `Poser ${f} ici` });
    await userEvent.click(espaces[p.verbe]);
    espaces = screen.getAllByRole('button', { name: 'Poser pas ici' });
    // L'espace de « ne » est pris : les espaces restants sont décalés d'un cran.
    await userEvent.click(espaces[p.verbe]);
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});

describe('les jeux de français du CE1 dans la ludothèque', () => {
  it('six jeux, chacun avec sa compétence', () => {
    const ce1 = jeuxDeLaClasse('CE1').filter((j) => j.matiereCode === 'FRANCAIS');
    expect(ce1.map((j) => j.competences[0]).sort()).toEqual([
      'FR_CE1_LANG_A_ET', 'FR_CE1_LANG_NEGATION', 'FR_CE1_LANG_PRESENT',
      'FR_CE1_LANG_TYPES', 'FR_CE1_LANG_VERBE_SUJET', 'FR_CE1_LANG_VOC_RELATIONS',
    ]);
  });
});
