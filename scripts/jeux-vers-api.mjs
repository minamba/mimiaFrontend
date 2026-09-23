/**
 * LE CATALOGUE DES JEUX, PASSÉ À L'API.
 *
 * Camara, le 23/09/2026 : « à la fin du cours, le professeur peut proposer à
 * l'élève d'aller jouer à un jeu en rapport avec la notion étudiée ». Pour ça,
 * l'API doit savoir quels jeux existent, pour quelle classe, et quelles
 * compétences chacun travaille. Cette connaissance vit dans le front
 * (`src/lib/jeux/catalogue.js`), et c'est elle qui fait foi : on ne la
 * recopie pas à la main, on la GÉNÈRE.
 *
 * Ce script lit le catalogue avec les vrais modules — transpilés à la volée,
 * les images remplacées par leur chemin — et écrit la même liste à deux
 * endroits :
 *
 *   - `src/lib/jeux/jeux.genere.json`, dans le front : un test compare ce
 *     fichier au catalogue, et tombe s'ils divergent (« relancer le script »);
 *   - `<API>/SchoolWebApp/Ressources/jeux.json`, ressource EMBARQUÉE dans la
 *     DLL de l'API : impossible de l'oublier au déploiement, ce qui a déjà
 *     coûté un conteneur en boucle avec un autre fichier.
 *
 * USAGE
 *   node scripts/jeux-vers-api.mjs
 *   MIMIA_API=D:/ailleurs/SchoolWebApp node scripts/jeux-vers-api.mjs
 *
 * À RELANCER après tout jeu ajouté, retiré, renommé ou déplacé de classe —
 * puis republier l'API, sinon le professeur ignore le nouveau jeu.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(racine, 'package.json'));
const babel = require('@babel/core');

// Le dépôt de l'API, voisin de celui-ci : Documents/React-projects/school_ia
// et source/repos/SchoolWebApp partagent le même dossier utilisateur.
const API = process.env.MIMIA_API
  || path.resolve(racine, '..', '..', '..', 'source', 'repos', 'SchoolWebApp');

// DANS `public/` ET NON DANS `src/` : le fichier part avec le site, à
// l'adresse `/jeux.json`, et c'est là que l'API vient le relire toutes les
// heures (voir `CatalogueJeuxWorker` côté API). Publier le front suffit donc
// à ce que les professeurs connaissent un nouveau jeu ; la copie embarquée
// dans l'API n'est que l'état de départ, celui d'avant la première relecture.
const SORTIE_FRONT = path.join(racine, 'public', 'jeux.json');
const SORTIE_API = path.join(API, 'SchoolWebApp', 'Ressources', 'jeux.json');

// ----------------------------------------------------- charger le catalogue
// Les modules du catalogue sont écrits en ESM avec des imports d'images, que
// Node ne sait pas charger. On les transpile en CommonJS dans un dossier
// temporaire, chaque image remplacée par son chemin — la valeur n'a aucune
// importance ici, seul compte que l'import ne casse pas.
const atelier = fs.mkdtempSync(path.join(os.tmpdir(), 'mimia-jeux-'));

function transpiler(relatif) {
  const source = fs.readFileSync(path.join(racine, 'src', relatif), 'utf8')
    .replace(
      /import (\w+) from '\.\.\/\.\.\/assets\/(.+?)';/g,
      (_, nom, chemin) => `const ${nom} = 'assets/${chemin}';`,
    );
  const { code } = babel.transformSync(source, {
    filename: relatif,
    babelrc: false,
    configFile: false,
    presets: [[require.resolve('babel-preset-react-app'), { runtime: 'classic' }]],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  const cible = path.join(atelier, relatif);
  fs.mkdirSync(path.dirname(cible), { recursive: true });
  fs.writeFileSync(cible, code);
  return cible;
}

process.env.NODE_ENV ??= 'production';
const { jeuxDeLaClasse } = require(transpiler('lib/jeux/catalogue.js'));
const { FRISE } = require(transpiler('lib/jeux/frise.js'));

// ------------------------------------------------------------ la liste
// UNE LIGNE PAR COUPLE (classe, jeu), et non un jeu avec ses classes : un
// même jeu change de titre et de compétences d'une classe à l'autre (« Le
// coffre des centaines » au CE1 devient « Les grands nombres » au CM2), et
// c'est le couple que le professeur doit nommer.
const lignes = FRISE.flatMap(({ code }) => jeuxDeLaClasse(code).map((jeu) => ({
  classe: code,
  cle: jeu.cle,
  titre: jeu.titre,
  matiereCode: jeu.matiereCode,
  competences: [...(jeu.competences ?? [])],
})));

lignes.forEach((l) => {
  if (!l.cle || !l.titre || !l.matiereCode) throw new Error(`Ligne incomplète : ${JSON.stringify(l)}`);
  if (l.competences.length === 0) throw new Error(`${l.classe}/${l.cle} n'a aucune compétence : le professeur ne saurait pas quand le proposer.`);
});

const json = `${JSON.stringify(lignes, null, 2)}\n`;

fs.writeFileSync(SORTIE_FRONT, json);
console.log(`${lignes.length} couples (classe, jeu) → ${path.relative(racine, SORTIE_FRONT)}`);

if (fs.existsSync(path.dirname(path.dirname(SORTIE_API)))) {
  fs.mkdirSync(path.dirname(SORTIE_API), { recursive: true });
  fs.writeFileSync(SORTIE_API, json);
  console.log(`${lignes.length} couples (classe, jeu) → ${SORTIE_API}`);
} else {
  console.log(`API introuvable à ${API} : la copie de l'API n'a pas été écrite (MIMIA_API pour indiquer le chemin).`);
  process.exitCode = 1;
}

fs.rmSync(atelier, { recursive: true, force: true });
