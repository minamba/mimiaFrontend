/**
 * UN ENFANT NE PORTE PAS LE MÊME LAISSEZ-PASSER QUE SON PARENT.
 *
 * Le parent entre par OIDC et porte « Bearer … ». L'enfant entre par un code,
 * ce qui lui ouvre une session serveur d'un autre schéma : « Eleve … ». Une
 * seule fonction sait produire l'un ou l'autre — `enTeteAuth`.
 *
 * CE QUI EST ARRIVÉ, ET QUI JUSTIFIE CE FICHIER
 * ---------------------------------------------
 * Trois modules appelaient `authService.getAccessToken()` directement. Pour un
 * parent, ça marche. Pour un enfant, cette fonction retourne `null` — il n'a
 * jamais vu OIDC. L'en-tête valait donc littéralement « Bearer null ».
 *
 * Le flux du cours répondait 401 et l'écran affichait « La connexion a été
 * interrompue » ; l'écoute temps réel se fermait sur un code 1006 muet. Le
 * produit marchait pour le parent qui le testait, et pour aucun enfant — soit
 * exactement l'inverse de qui doit s'en servir.
 *
 * POURQUOI CE TEST LIT LE CODE SOURCE
 * -----------------------------------
 * Le défaut ne se voyait à l'exécution que dans une session ENFANT. Une suite
 * qui monte des composants avec un parent authentifié serait restée verte tout
 * du long — c'est bien ce qui s'est passé. Ce qu'il faut interdire n'est pas un
 * comportement mais une TOURNURE : « je fabrique moi-même mon en-tête ».
 *
 * Alors on la cherche là où elle vit, dans le texte des modules.
 */

import fs from 'fs';
import path from 'path';

const RACINE = path.join(__dirname, '..', 'lib');

/**
 * Les seuls modules qui ont le droit d'appeler `getAccessToken`.
 *
 * `httpClient` parce qu'il EST l'endroit où le choix se fait, et `authService`
 * parce qu'il la définit.
 *
 * `profilApi` parce qu'il ne parle pas à l'API métier mais au serveur
 * d'identité : on y change son mot de passe, on y efface son compte. Un enfant
 * n'y a rien à faire, et lui donner un en-tête « Eleve » n'aurait aucun sens —
 * ce serveur-là ne connaît pas ce schéma.
 */
const DISPENSES = ['api/httpClient.js', 'api/profilApi.js', 'storage/authService.js'];

/**
 * Le code seul, commentaires retirés.
 *
 * Sans ça, ce fichier-ci se dénoncerait lui-même : les commentaires qui
 * EXPLIQUENT la panne citent forcément « Bearer » et `getAccessToken`. Une
 * règle qui interdit de nommer ce qu'elle interdit rend le code muet là où il
 * aurait le plus besoin de parler.
 *
 * Le découpage est grossier — il ne distingue pas un `//` dans une chaîne de
 * caractères d'un vrai commentaire. Il suffit ici : on cherche un appel de
 * fonction et un préfixe d'en-tête, pas à analyser du JavaScript.
 */
function sansCommentaires(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function fichiersJs(dossier) {
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((entree) => {
    const complet = path.join(dossier, entree.name);
    if (entree.isDirectory()) return fichiersJs(complet);
    return entree.name.endsWith('.js') ? [complet] : [];
  });
}

describe("l'autorisation d'une session enfant", () => {
  const modules = fichiersJs(RACINE).map((complet) => ({
    chemin: path.relative(RACINE, complet).split(path.sep).join('/'),
    source: fs.readFileSync(complet, 'utf8'),
    code: sansCommentaires(fs.readFileSync(complet, 'utf8')),
  }));

  it('trouve bien les modules à inspecter', () => {
    // Sans cette vérification, un jour où l'arborescence bouge, tous les tests
    // ci-dessous passeraient au vert en n'inspectant plus rien du tout.
    expect(modules.length).toBeGreaterThan(5);
    expect(modules.map((m) => m.chemin)).toEqual(
      expect.arrayContaining(['api/chatApi.js', 'storage/ecouteTempsReel.js']),
    );
  });

  it("n'appelle getAccessToken que dans les modules qui en ont le droit", () => {
    const fautifs = modules
      .filter((m) => !DISPENSES.includes(m.chemin))
      .filter((m) => /getAccessToken\s*\(/.test(m.code))
      .map((m) => m.chemin);

    expect(fautifs).toEqual([]);
  });

  it("n'écrit jamais « Bearer » en dur hors du point de décision", () => {
    // Un `Bearer ${…}` codé en dur est la trace exacte du défaut : il suppose
    // le schéma au lieu de le demander, et cette supposition est fausse dès
    // qu'un enfant est devant l'écran.
    const fautifs = modules
      .filter((m) => !DISPENSES.includes(m.chemin))
      .filter((m) => /Bearer\s/.test(m.code))
      .map((m) => m.chemin);

    expect(fautifs).toEqual([]);
  });

  it("transporte le schéma dans l'URL du WebSocket, et pas le jeton nu", () => {
    // Un WebSocket de navigateur n'accepte aucune en-tête : l'autorisation ne
    // peut voyager que par l'URL. Si on n'y met que le jeton, le serveur doit
    // deviner le schéma — c'est la panne d'origine, côté serveur cette fois.
    const ecoute = modules.find((m) => m.chemin === 'storage/ecouteTempsReel.js');

    expect(ecoute.source).toMatch(/access_token=\$\{encodeURIComponent\(entete\)\}/);
    expect(ecoute.source).toMatch(/await enTeteAuth\(\)/);
  });
});
