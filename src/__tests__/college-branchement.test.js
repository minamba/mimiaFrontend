/**
 * LE BRANCHEMENT DES JEUX DU COLLÈGE — catalogue, écrans, voix.
 *
 * Chaque module a son propre fichier de test (college-*.test.js) pour son
 * contenu ; celui-ci vérifie ce qui les relie au reste : qu'un jeu du collège
 * apparaisse bien dans la bonne classe, qu'il ait un écran qui se joue, et
 * que chacune de ses phrases ait sa place chez le professeur de sa matière.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATALOGUE_COLLEGE, LIBELLES_MATIERE, MODULES_COLLEGE } from '../lib/jeux/college/index.js';
import { JEUX, jeuxDeLaClasse } from '../lib/jeux/catalogue';
import { PROFESSEUR_PAR_MATIERE, toutesLesRepliques } from '../lib/jeux/voix/repliques';
import { ECRANS_COLLEGE, VIGNETTES_COLLEGE } from '../components/jeux/JeuxCollege';

const CLASSES_COLLEGE = ['SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME'];
const PARTIE = (m) => m.FAMILLE.cle;

afterEach(() => jest.restoreAllMocks());

describe('les jeux du collège dans le catalogue', () => {
  it('chaque clé de jeu est unique dans tout le catalogue', () => {
    const cles = JEUX.map((j) => j.cle);
    expect(new Set(cles).size).toBe(cles.length);
  });

  it('chaque module est une entrée, avec sa matière en toutes lettres', () => {
    expect(CATALOGUE_COLLEGE).toHaveLength(MODULES_COLLEGE.length);
    CATALOGUE_COLLEGE.forEach((jeu) => {
      expect(LIBELLES_MATIERE[jeu.matiereCode]).toBe(jeu.matiere);
      expect(jeu.niveaux.length).toBeGreaterThan(0);
      jeu.niveaux.forEach((n) => expect(CLASSES_COLLEGE).toContain(n));
    });
  });

  it.each(CLASSES_COLLEGE)('%s : chaque jeu de la classe a son titre, son accroche et ses compétences de l’année', (classe) => {
    const annee = { SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_' }[classe];
    const jeux = jeuxDeLaClasse(classe);
    expect(jeux.length).toBeGreaterThan(10);
    jeux.forEach((jeu) => {
      expect(jeu.titre).toBeTruthy();
      expect(jeu.accroche).toBeTruthy();
      expect(jeu.competences.length).toBeGreaterThan(0);
      jeu.competences.forEach((c) => expect(c).toContain(annee));
    });
  });

  it('les escape games voulus existent, et pour les bonnes classes', () => {
    const escapes = (classe) => jeuxDeLaClasse(classe).filter((j) => j.escape).map((j) => j.matiereCode).sort();
    expect(escapes('SIXIEME')).toEqual(['ANGLAIS', 'FRANCAIS', 'HISTOIRE_GEO', 'MATHS', 'SCIENCES']);
    ['CINQUIEME', 'QUATRIEME', 'TROISIEME'].forEach((classe) => {
      expect(escapes(classe)).toEqual(['ANGLAIS', 'FRANCAIS', 'HISTOIRE_GEO', 'MATHS', 'PHYSIQUE_CHIMIE', 'SVT']);
    });
  });

  it('seuls les maths et le français ont des jeux hors escape game', () => {
    CATALOGUE_COLLEGE.filter((j) => !j.escape).forEach((j) => expect(['MATHS', 'FRANCAIS']).toContain(j.matiereCode));
  });

  it('aucun jeu du collège ne se glisse au primaire', () => {
    ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].forEach((classe) => {
      expect(jeuxDeLaClasse(classe).filter((j) => j.college)).toEqual([]);
    });
  });
});

describe('les voix des jeux du collège', () => {
  it('chaque matière a son professeur', () => {
    MODULES_COLLEGE.forEach((m) => expect(PROFESSEUR_PAR_MATIERE[m.FAMILLE.matiereCode]).toBeTruthy());
  });

  it('chaque phrase de chaque module est chez le professeur de sa matière', () => {
    const inventaire = toutesLesRepliques();
    MODULES_COLLEGE.forEach((m) => {
      const professeur = PROFESSEUR_PAR_MATIERE[m.FAMILLE.matiereCode];
      const cles = new Set(inventaire[professeur].map((r) => r.cle));
      Object.keys(m.PHRASES).forEach((k) => {
        const cle = `${PARTIE(m)}/${k.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/gi, '-')}`;
        expect(cles.has(cle)).toBe(true);
      });
    });
  });

  it('aucun préfixe du collège ne recouvre celui d’un autre jeu', () => {
    const inventaire = toutesLesRepliques();
    const college = new Set(MODULES_COLLEGE.map(PARTIE));
    // Les préfixes des autres jeux : tout ce qui n'est ni du collège ni commun.
    const autres = new Set(Object.values(inventaire).flat().map((r) => r.cle.split('/')[0])
      .filter((p) => p !== 'commun' && !college.has(p)));
    college.forEach((p) => expect(autres.has(p)).toBe(false));
    // Deux clés de phrase identiques dans un même module se marcheraient dessus.
    const conflits = [];
    Object.values(inventaire).forEach((repliques) => {
      const vues = new Map();
      repliques.forEach((r) => {
        if (vues.has(r.cle) && vues.get(r.cle) !== r.texte) conflits.push(r.cle);
        vues.set(r.cle, r.texte);
      });
    });
    expect(conflits).toEqual([]);
  });

  it('la note d’un escape game se dit sur six', () => {
    const nora = toutesLesRepliques().nora.map((r) => r.cle);
    expect(nora).toContain('commun/note-6-sur-6');
  });
});

describe('les écrans des jeux du collège', () => {
  it('chaque module a son écran et son aperçu', () => {
    MODULES_COLLEGE.forEach((m) => {
      expect(ECRANS_COLLEGE[PARTIE(m)]).toBeTruthy();
      expect(VIGNETTES_COLLEGE[PARTIE(m)]).toBeTruthy();
    });
  });

  // Un jeu par matière et par sorte (jeu ordinaire, escape game), à sa première classe.
  const ECHANTILLON = MODULES_COLLEGE.filter((m, i, tous) => tous.findIndex(
    (n) => n.FAMILLE.matiereCode === m.FAMILLE.matiereCode && Boolean(n.ESCAPE) === Boolean(m.ESCAPE),
  ) === i).map((m) => [PARTIE(m), m]);

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

  it.each(MODULES_COLLEGE.filter((m) => m.ESCAPE).map((m) => [PARTIE(m), m]))(
    '%s : l’intro, le récit, puis la pièce du code une fois le cadenas ouvert',
    async (cle, module) => {
      jest.spyOn(Date, 'now').mockReturnValue(2024);
      const niveau = module.CLASSES[0];
      const m = module.serie(2024, niveau)[0];
      const Jeu = ECRANS_COLLEGE[cle];
      render(<Jeu onQuitter={jest.fn()} matiereCode={module.FAMILLE.matiereCode} niveau={niveau} />);

      expect(screen.getByText(module.PAR_CLASSE[niveau].intro)).toBeInTheDocument();
      expect(screen.getByText(m.recit)).toBeInTheDocument();
      const avant = screen.getByLabelText('Code : 0 pièce sur 6');
      expect(within(avant).getAllByRole('listitem')).toHaveLength(6);
      expect(within(avant).getByText('?')).toBeInTheDocument();

      const bonne = m.choix.find((c) => String(c.cle) === String(m.bonne));
      await userEvent.click(screen.getByRole('button', { name: String(bonne.libelle) }));
      const apres = screen.getByLabelText('Code : 1 pièce sur 6');
      expect(within(apres).getByText(String(m.cadenas.piece))).toBeInTheDocument();
      expect(within(apres).queryByText('?')).toBeNull();
    },
  );

  it('une classe que le module ne couvre pas reprend sa première classe, sans planter', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const module = MODULES_COLLEGE.find((m) => !m.CLASSES.includes('TROISIEME'));
    const Jeu = ECRANS_COLLEGE[PARTIE(module)];
    render(<Jeu onQuitter={jest.fn()} matiereCode={module.FAMILLE.matiereCode} niveau="TROISIEME" />);
    expect(screen.getByRole('button', { name: /Revenir aux jeux/ })).toBeInTheDocument();
  });
});
