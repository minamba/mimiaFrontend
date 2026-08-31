/**
 * LE WORKFLOW N8N DOIT SUIVRE LE CATALOGUE.
 *
 * L'agent porte sa propre copie de la liste des figures — il tourne dans N8N,
 * il n'a aucun moyen de lire le code de l'application. Cette copie est écrite
 * par `scripts/genererWorkflowN8n.js`, mais rien n'oblige à relancer le script
 * après avoir ajouté une figure.
 *
 * La dérive serait silencieuse dans les deux sens, et invisible dans les deux :
 *
 * - une figure ajoutée au catalogue et absente du workflow ne serait jamais
 *   cherchée, et son emplacement resterait vide sans que rien ne le signale ;
 * - une clé restée dans le workflow après sa suppression du catalogue ferait
 *   importer une planche que l'application ne reconnaît plus — enregistrée en
 *   base, facturée en octets, et jamais affichée au tableau.
 *
 * Ce test lit le JSON produit et le compare au catalogue. S'il échoue, la
 * réponse est toujours la même : relancer le générateur.
 */
describe('workflow N8N', () => {
  const fs = require('fs');
  const path = require('path');
  const { catalogue, plancheRecommandee } = require('../lib/storage/schemas');

  const FICHIER = path.join(__dirname, '../../n8n/mimia-import-planches.json');

  const lire = () => JSON.parse(fs.readFileSync(FICHIER, 'utf8'));

  /** Le catalogue recopié dans le nœud « Ce qui manque ». */
  const catalogueDuWorkflow = (workflow) => {
    const noeud = workflow.nodes.find((n) => n.name === 'Ce qui manque');
    const trouve = noeud.parameters.jsCode.match(/const CATALOGUE = (\[[\s\S]*?\]);/);

    return JSON.parse(trouve[1]);
  };

  /**
   * Ce que l'agent doit chercher : tous les emplacements sans dessin, plus les
   * seules figures de SVT où la planche vaut mieux que le tracé.
   */
  const attendu = () =>
    catalogue()
      .filter((f) => !f.dessinee || plancheRecommandee(f.cle))
      .map((f) => f.cle)
      .sort();

  it('couvre exactement les figures à importer', () => {
    const cles = catalogueDuWorkflow(lire()).map((f) => f.cle).sort();

    expect(cles).toEqual(attendu());
  });

  it('donne à chaque figure une matière et une recherche', () => {
    for (const figure of catalogueDuWorkflow(lire())) {
      expect(figure.matiereCode).not.toBe('AUTRE');
      expect(figure.recherche.length).toBeGreaterThan(5);

      // Une lettre isolée en tête — « s symboles normalisés » — est le
      // symptôme d'un article mal découpé, et la recherche ne ramène plus
      // rien. Deux lettres, en revanche, sont légitimes : « la graine à la
      // plante » vient de « De la graine à la plante » et se cherche très bien.
      expect(figure.recherche).not.toMatch(/^[a-z]\s/);

      // Les deux-points d'un TITRE deviennent des critères de recherche
      // supplémentaires et écartent les bons résultats. Ceux de l'opérateur
      // `-filemime:pdf` sont légitimes : on ne regarde que les mots cherchés.
      const [mots, operateur] = figure.recherche.split(' -filemime:');

      expect(mots).not.toContain(':');
      expect(operateur).toBe('pdf');

      // LES QUALIFICATIFS SONT INTERDITS, ET C'EST UNE LEÇON PAYÉE.
      //
      // Ajouter « schéma » ou « anatomie » à la requête semblait orienter vers
      // les planches. Commons exige que TOUS les mots soient présents : chaque
      // mot ajouté divisait les résultats. « appareil digestif schéma anatomie »
      // ne rendait que des livres du XIXᵉ siècle numérisés, zéro image — et le
      // premier tour de l'agent n'a rien importé sur dix figures.
      for (const parasite of [' schéma', ' carte', ' anatomie', ' diagram']) {
        expect(mots.toLowerCase()).not.toContain(parasite);
      }

      // Un repli plus court existe pour les notions rares.
      expect(figure.rechercheCourte.length).toBeGreaterThan(5);
      expect(figure.rechercheCourte.length).toBeLessThanOrEqual(figure.recherche.length);
    }
  });

  /**
   * Le workflow ne doit porter AUCUN secret. Il est destiné à circuler — on
   * l'importe dans N8N, on le versionne, on l'envoie. Les jetons vivent dans
   * les identifiants de N8N, jamais dans le fichier.
   */
  it('ne contient aucun jeton ni clé', () => {
    const brut = fs.readFileSync(FICHIER, 'utf8');

    expect(brut).not.toMatch(/Bearer\s+[A-Za-z0-9._-]{20,}/);
    expect(brut).not.toMatch(/sk-[A-Za-z0-9_-]{20,}/);
    expect(brut).not.toMatch(/AIza[A-Za-z0-9_-]{20,}/);
    expect(brut).not.toMatch(/"(client_?secret|apiKey|password)"\s*:/i);
  });

  it('enchaîne ses nœuds sans en laisser un de côté', () => {
    const workflow = lire();
    const noms = workflow.nodes.map((n) => n.name);

    // Les déclencheurs n'ont pas d'entrée : ils sont atteints par définition.
    // Les reconnaître au TYPE et non au nom — la version précédente attendait
    // « Déclencher » et a échoué le jour où un second déclencheur est arrivé,
    // en signalant une panne là où il n'y avait qu'une fonctionnalité de plus.
    const atteints = new Set(
      workflow.nodes.filter((n) => /trigger/i.test(n.type)).map((n) => n.name),
    );

    for (const cibles of Object.values(workflow.connections)) {
      for (const groupe of cibles.main) {
        for (const lien of groupe) atteints.add(lien.node);
      }
    }

    expect([...noms].filter((n) => !atteints.has(n))).toEqual([]);
  });

  /**
   * L'agent doit pouvoir vider le catalogue SEUL.
   *
   * Sans déclencheur horaire, remplir cent quarante-sept emplacements voudrait
   * dire cliquer huit fois en surveillant. Avec, on active et on revient le
   * lendemain.
   */
  it('sait tourner tout seul jusqu’à ce que le catalogue soit plein', () => {
    const workflow = lire();

    const horloge = workflow.nodes.find((n) => /scheduleTrigger/i.test(n.type));
    expect(horloge).toBeDefined();
    expect(workflow.connections[horloge.name].main[0][0].node).toBe('Réglages');

    // Inactif à l'import : l'horloge ne part que sur décision explicite.
    expect(workflow.active).toBe(false);

    // Et il traite TOUTES les matières par défaut, par bouchées.
    const reglages = workflow.nodes.find((n) => n.name === 'Réglages').parameters.jsCode;
    expect(reglages).toMatch(/const MATIERE = ''/);
  });

  /**
   * LE BUG QUI A COÛTÉ QUATRE PLANCHES.
   *
   * Le nœud de filtrage appariait les résultats de recherche aux figures sur le
   * nombre d'éléments DÉJÀ retenus. Une figure sans résultat décalait tout d'un
   * cran : la frise chronologique a reçu la carte du relief, le relief celle des
   * fleuves, et les fleuves une carte de l'élection présidentielle de 2022.
   *
   * Rien ne le signalait — licence libre, bon format, API satisfaite.
   *
   * La règle qui l'empêche : un élément entre, un élément sort, et l'appariement
   * se fait sur l'INDICE d'entrée. Ce test la garde.
   */
  it('apparie les résultats sur l’indice, jamais sur un compteur', () => {
    const code = lire().nodes.find((n) => n.name === 'Chercher et filtrer')
      .parameters.jsCode;

    // La recherche se fait DANS le nœud, une figure à la fois : il ne peut
    // plus y avoir de liste de résultats à ré-apparier après coup.
    expect(code).toContain('helpers.httpRequest');
    expect(code).not.toContain('[sortie.length]');
    expect(code).not.toContain('[resultats.length]');

    // Et le repli à deux mots, sans lequel les notions rares restent vides.
    expect(code).toContain('rechercheCourte');
  });

  /**
   * LES ARTICLES COURTS NE PROUVENT RIEN.
   *
   * La première version du filtre de langue tenait « le, la, les, des, du »
   * pour des marqueurs français. « Der Sternenhimmel zu jeder Stunde DES
   * Jahres » passait donc pour du français — « des » est un mot allemand — et
   * « Mapa DE España » aussi.
   *
   * Ce test rejoue les deux cas qui sont réellement passés, plus les pièges
   * inverses : une planche française ne doit JAMAIS être écartée, sinon le
   * filtre vide le catalogue en silence.
   */
  it('reconnaît la langue sur des mots pleins, pas sur des articles', () => {
    const code = lire().nodes.find((n) => n.name === 'Chercher et filtrer')
      .parameters.jsCode;

    const motif = (nom) =>
      new RegExp(code.match(new RegExp(`const ${nom} = /(.*)/i;`))[1], 'i');

    const fr = motif('MARQUEURS_FR');
    const autres = motif('MARQUEURS_AUTRES');
    const suspecte = (t) => (fr.test(t) ? false : autres.test(t));

    // Écartés : une autre langue, aucun signe de français.
    for (const t of [
      'Der Sternenhimmel zu jeder Stunde des Jahres, Ausgabe für Mittel-Europa',
      'Karte von Deutschland Zeichnung',
      'World map with continents and oceans diagram',
      'Mapa de España fisico',
      'Mappa dell Impero romano',
    ]) {
      expect({ titre: t, ecarte: suspecte(t) }).toEqual({ titre: t, ecarte: true });
    }

    // Gardés : du français, ou rien de concluant — le juge tranchera.
    for (const t of [
      'Carte muette des départements, des préfectures et des fleuves de la France',
      'Appareil respiratoire humain',
      'Schéma du circuit en série',
      'Planisphère terrestre',
      'Coupe de la Terre',
      'Empire romain 117 ap JC',
      'Human respiratory system',
      'Frise chronologique des périodes historiques',
    ]) {
      expect({ titre: t, ecarte: suspecte(t) }).toEqual({ titre: t, ecarte: false });
    }
  });

  /**
   * Un filtre sur la licence et le format ne sait rien du SENS : « planisphère »
   * désigne aussi une carte du ciel. Sans juge dans la chaîne, ces confusions-là
   * arrivent jusqu'à l'élève.
   */
  it('fait juger la pertinence avant d’importer', () => {
    const w = lire();
    const noms = w.nodes.map((n) => n.name);

    expect(noms).toContain('Choisir avec l’IA');
    expect(noms.indexOf('Choisir avec l’IA'))
      .toBeLessThan(noms.indexOf('Importer dans Mimia'));
  });
});
