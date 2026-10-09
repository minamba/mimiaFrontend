/**
 * LE BRANCHEMENT DES JEUX DU LYCÉE — catalogue, voies, écrans, voix.
 *
 * Le contenu de chaque module a son propre test (lycee-*.test.js). Celui-ci
 * vérifie ce qui les relie au reste, et surtout LES VOIES : au lycée, la
 * classe de l'élève est ramenée à son programme — une 1re STMG voit les jeux
 * de la 1re technologique, jamais ceux de la 1re générale.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATALOGUE_LYCEE, MODULES_LYCEE } from '../lib/jeux/lycee/index.js';
import { LIBELLES_MATIERE, MODULES_COLLEGE } from '../lib/jeux/college/index.js';
import { JEUX, jeuxDeLaClasse } from '../lib/jeux/catalogue';
import {
  CLASSES_DU_CATALOGUE, classeDansSaVoie, programmeDeLaClasse, rangDeLaClasse, voieDeLaClasse,
} from '../lib/jeux/frise';
import { PROFESSEUR_PAR_MATIERE, toutesLesRepliques } from '../lib/jeux/voix/repliques';
import { ECRANS_COLLEGE } from '../components/jeux/JeuxCollege';

const PROGRAMMES = ['SECONDE', 'SECONDE_PRO', 'PREMIERE', 'PREMIERE_TECHNO', 'PREMIERE_PRO', 'TERMINALE', 'TERMINALE_TECHNO', 'TERMINALE_PRO'];
const cleFichier = (k) => k.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/gi, '-');

afterEach(() => jest.restoreAllMocks());

describe('les voies du lycée', () => {
  it('ramène chaque série technologique à son programme', () => {
    ['STMG', 'ST2S', 'STL', 'STI2D'].forEach((serie) => {
      expect(programmeDeLaClasse(`PREMIERE_${serie}`)).toBe('PREMIERE_TECHNO');
      expect(programmeDeLaClasse(`TERMINALE_${serie}`)).toBe('TERMINALE_TECHNO');
    });
    expect(programmeDeLaClasse('TROISIEME_PREPA')).toBe('TROISIEME');
    expect(programmeDeLaClasse('premiere_pro')).toBe('PREMIERE_PRO');
    expect(programmeDeLaClasse('CM2')).toBe('CM2');
    expect(programmeDeLaClasse('')).toBe('');
  });

  it('reconnaît la voie, et garde l’année choisie dans la voie de l’élève', () => {
    expect(voieDeLaClasse('TERMINALE_STMG')).toBe('TECHNO');
    expect(voieDeLaClasse('PREMIERE_PRO')).toBe('PRO');
    expect(voieDeLaClasse('PREMIERE')).toBeNull();
    expect(voieDeLaClasse('CM1')).toBeNull();
    expect(classeDansSaVoie('PREMIERE', 'TERMINALE_STMG')).toBe('PREMIERE_TECHNO');
    // La 2de est commune aux voies générale et technologique.
    expect(classeDansSaVoie('SECONDE', 'TERMINALE_STMG')).toBe('SECONDE');
    expect(classeDansSaVoie('SECONDE', 'TERMINALE_PRO')).toBe('SECONDE_PRO');
    expect(classeDansSaVoie('TROISIEME', 'TERMINALE_PRO')).toBe('TROISIEME');
    expect(classeDansSaVoie('PREMIERE', 'TERMINALE')).toBe('PREMIERE');
  });

  it('donne à une 1re STMG les jeux de la 1re techno, et rien de la 1re générale', () => {
    const stmg = jeuxDeLaClasse('PREMIERE_STMG').map((j) => j.cle).sort();
    expect(stmg).toEqual(jeuxDeLaClasse('PREMIERE_TECHNO').map((j) => j.cle).sort());
    expect(stmg.length).toBeGreaterThan(0);
    const seulementGeneral = JEUX.filter((j) => j.niveaux.includes('PREMIERE') && !j.niveaux.includes('PREMIERE_TECHNO'));
    seulementGeneral.forEach((j) => expect(stmg).not.toContain(j.cle));
  });

  it('chaque programme du lycée a ses jeux, et chaque jeu son rang', () => {
    PROGRAMMES.forEach((code) => {
      expect(CLASSES_DU_CATALOGUE).toContain(code);
      expect(rangDeLaClasse(code)).toBeGreaterThanOrEqual(10);
      expect(jeuxDeLaClasse(code).length).toBeGreaterThan(0);
    });
  });
});

describe('les jeux du lycée dans le catalogue', () => {
  it('chaque clé de jeu est unique dans tout le catalogue', () => {
    const cles = JEUX.map((j) => j.cle);
    expect(new Set(cles).size).toBe(cles.length);
  });

  it('chaque module est une entrée, sur des classes de lycée, avec sa matière en toutes lettres', () => {
    expect(CATALOGUE_LYCEE).toHaveLength(MODULES_LYCEE.length);
    CATALOGUE_LYCEE.forEach((jeu) => {
      expect(LIBELLES_MATIERE[jeu.matiereCode]).toBe(jeu.matiere);
      jeu.niveaux.forEach((n) => expect(PROGRAMMES).toContain(n));
    });
  });

  it('aucun jeu du lycée ne se glisse avant la 2de', () => {
    ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME'].forEach((classe) => {
      expect(jeuxDeLaClasse(classe).filter((j) => j.lycee)).toEqual([]);
    });
  });

  it('les escape games voulus — sans philosophie, SES ni NSI', () => {
    const escapes = (classe) => jeuxDeLaClasse(classe).filter((j) => j.escape).map((j) => j.matiereCode).sort();
    ['SECONDE', 'PREMIERE', 'TERMINALE'].forEach((classe) => {
      expect(escapes(classe)).toEqual(expect.arrayContaining(['ANGLAIS', 'HISTOIRE_GEO', 'MATHS', 'PHYSIQUE_CHIMIE', 'SVT']));
    });
    expect(escapes('SECONDE')).toContain('FRANCAIS');
    expect(escapes('PREMIERE')).toContain('FRANCAIS');
    const toutes = CATALOGUE_LYCEE.filter((j) => j.escape).map((j) => j.matiereCode);
    ['PHILOSOPHIE', 'SES', 'NSI'].forEach((m) => expect(toutes).not.toContain(m));
  });

  it('seuls les maths et le français ont des jeux hors escape game', () => {
    CATALOGUE_LYCEE.filter((j) => !j.escape).forEach((j) => expect(['MATHS', 'FRANCAIS']).toContain(j.matiereCode));
  });
});

describe('les voix et les écrans du lycée', () => {
  it('chaque phrase de chaque module est chez le professeur de sa matière', () => {
    const inventaire = toutesLesRepliques();
    const manquantes = [];
    MODULES_LYCEE.forEach((m) => {
      const professeur = PROFESSEUR_PAR_MATIERE[m.FAMILLE.matiereCode];
      const cles = new Set((inventaire[professeur] ?? []).map((r) => r.cle));
      Object.keys(m.PHRASES).forEach((k) => {
        const cle = `${m.FAMILLE.cle}/${cleFichier(k)}`;
        if (!cles.has(cle)) manquantes.push(cle);
      });
    });
    expect(manquantes).toEqual([]);
  });

  // UNE CLÉ, UN SENS (07/10/2026) : dans un module, quatre pièges portaient le
  // nom d'une consigne — la phrase dite pour l'erreur était celle de la
  // consigne, ou l'inverse. Vérifié ici pour le collège comme pour le lycée.
  it('aucune clé de phrase ne sert à la fois de consigne et d’erreur', () => {
    const doublons = [];
    [...MODULES_COLLEGE, ...MODULES_LYCEE].forEach((m) => {
      const consignes = new Set();
      const erreurs = new Set();
      m.CLASSES.forEach((niveau) => {
        [1, 7, 42, 2024, 99991, 1700000000000].forEach((graine) => {
          m.serie(graine, niveau).forEach((manche) => {
            consignes.add(manche.consigne);
            Object.values(manche.pieges ?? {}).forEach((p) => erreurs.add(p));
          });
        });
      });
      consignes.forEach((c) => { if (erreurs.has(c)) doublons.push(`${m.FAMILLE.cle}/${c}`); });
    });
    expect(doublons).toEqual([]);
  });

  it('chaque module a son écran', () => {
    MODULES_LYCEE.forEach((m) => expect(ECRANS_COLLEGE[m.FAMILLE.cle]).toBeTruthy());
  });

  // Un jeu par matière et par sorte (jeu ordinaire, escape game), à sa première classe.
  const ECHANTILLON = MODULES_LYCEE.filter((m, i, tous) => tous.findIndex(
    (n) => n.FAMILLE.matiereCode === m.FAMILLE.matiereCode && Boolean(n.ESCAPE) === Boolean(m.ESCAPE),
  ) === i).map((m) => [m.FAMILLE.cle, m]);

  it.each(ECHANTILLON)('%s : un choix faux nomme l’erreur, le bon fait continuer', async (cle, module) => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const niveau = module.CLASSES[0];
    const m = module.serie(2024, niveau)[0];
    const Jeu = ECRANS_COLLEGE[cle];
    render(<Jeu onQuitter={jest.fn()} matiereCode={module.FAMILLE.matiereCode} niveau={niveau} />);
    const bonne = m.choix.find((c) => String(c.cle) === String(m.bonne));
    const fausse = m.choix.find((c) => String(c.cle) !== String(m.bonne));
    await userEvent.click(screen.getByRole('button', { name: String(fausse.libelle) }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: String(bonne.libelle) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});
