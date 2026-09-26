#!/usr/bin/env node
/**
 * LE PLAN DU SITE, ÉCRIT DEPUIS LA TABLE DES PAGES.
 *
 * Usage : node scripts/sitemap.mjs
 *         node scripts/sitemap.mjs --verifier   (ne réécrit rien, sort en 1 si
 *                                                le fichier n'est plus à jour)
 *
 * POURQUOI LE GÉNÉRER PLUTÔT QUE L'ÉCRIRE. Un plan du site écrit à la main
 * ment au bout de deux mois : on ajoute une page, on oublie le fichier, et
 * Google continue de suivre une liste qui ne correspond plus au site. Ici, la
 * source est `src/lib/seo/pages.js` — LA MÊME que celle des titres et des
 * canoniques. Une page ne peut pas exister pour le navigateur et manquer au
 * plan, ni l'inverse.
 *
 * À LANCER À LA MAIN, comme `jeux-vers-api.mjs`, et non au build : le fichier
 * produit est versionné, donc une modification se relit dans le diff. Un test
 * (`sitemap.test.js`) échoue si on a oublié de le relancer.
 *
 * LA DATE. `lastmod` porte le jour de la génération, pas celui du dernier
 * changement réel de la page — on n'a pas cette information, et la mentir
 * finement n'apporterait rien : Google se fie de toute façon à ce qu'il lit.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const SORTIE = path.join(RACINE, 'public', 'sitemap.xml');

const { ORIGINE, PAGES } = await import(
  // Chemin de fichier converti en URL : sur Windows, `import()` d'un chemin
  // « C:\… » échoue, il lui faut un « file:// ».
  new URL(`file://${path.join(RACINE, 'src', 'lib', 'seo', 'pages.js').replace(/\\/g, '/')}`)
);

/** Le jour, au format que demande la norme : AAAA-MM-JJ. */
function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}

export function construireSitemap(date = aujourdhui()) {
  const entrees = PAGES.map((page) => {
    // La racine garde sa barre ; les autres n'en portent pas, comme les
    // canoniques que pose `useMetaPage` — deux adresses qui ne diffèrent que
    // par une barre finale sont deux pages pour un moteur.
    const adresse = page.chemin === '/' ? `${ORIGINE}/` : `${ORIGINE}${page.chemin}`;

    return [
      '  <url>',
      `    <loc>${adresse}</loc>`,
      `    <lastmod>${date}</lastmod>`,
      `    <changefreq>${page.frequence}</changefreq>`,
      `    <priority>${page.priorite}</priority>`,
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Généré par scripts/sitemap.mjs depuis src/lib/seo/pages.js. -->',
    '<!-- Ne pas modifier à la main : relancer le script. -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entrees,
    '</urlset>',
    '',
  ].join('\n');
}

/**
 * Compare en ignorant la date : le contenu utile est la liste des adresses.
 * Sans ça, le test tomberait chaque jour à minuit.
 */
function sansDate(xml) {
  return xml.replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod/>');
}

const verifier = process.argv.includes('--verifier');

if (verifier) {
  const existant = await readFile(SORTIE, 'utf8').catch(() => null);

  if (existant === null) {
    console.error('sitemap.xml absent — lancer : node scripts/sitemap.mjs');
    process.exit(1);
  }

  if (sansDate(existant) !== sansDate(construireSitemap())) {
    console.error('sitemap.xml ne correspond plus aux pages — lancer : node scripts/sitemap.mjs');
    process.exit(1);
  }

  console.log(`sitemap.xml à jour (${PAGES.length} pages).`);
} else {
  await writeFile(SORTIE, construireSitemap(), 'utf8');
  console.log(`sitemap.xml écrit — ${PAGES.length} pages.`);
}
