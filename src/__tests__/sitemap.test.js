/**
 * LE PLAN DU SITE CORRESPOND À LA TABLE DES PAGES — Camara, le 23/09/2026.
 *
 * `public/sitemap.xml` est généré (`node scripts/sitemap.mjs`) mais versionné :
 * rien n'oblige donc à le régénérer, sauf ce test. Sans lui, une page ajoutée à
 * `pages.js` manquerait au plan, et Google continuerait de suivre une liste qui
 * ne décrit plus le site.
 *
 * `robots.txt` est vérifié ici aussi, pour la même raison : sa liste de
 * `Disallow` double celle des chemins non indexés, et deux listes qui disent la
 * même chose finissent toujours par diverger.
 */

import fs from 'fs';
import path from 'path';

import { NON_INDEXEES, ORIGINE, PAGES } from '../lib/seo/pages';

const RACINE = path.resolve(__dirname, '..', '..');
const sitemap = fs.readFileSync(path.join(RACINE, 'public', 'sitemap.xml'), 'utf8');
const robots = fs.readFileSync(path.join(RACINE, 'public', 'robots.txt'), 'utf8');

const adresses = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

describe('sitemap.xml', () => {
  it('liste exactement les pages publiques — sinon : node scripts/sitemap.mjs', () => {
    const attendu = PAGES.map((p) => (p.chemin === '/' ? `${ORIGINE}/` : `${ORIGINE}${p.chemin}`));
    expect(adresses).toEqual(attendu);
  });

  it('n’expose aucune adresse de l’espace connecté', () => {
    adresses.forEach((adresse) => {
      const chemin = adresse.replace(ORIGINE, '');
      NON_INDEXEES.forEach((prive) => {
        expect(chemin.startsWith(prive)).toBe(false);
      });
    });
  });

  it('donne à chaque adresse une date, une fréquence et une priorité', () => {
    expect(sitemap.match(/<lastmod>/g)).toHaveLength(PAGES.length);
    expect(sitemap.match(/<changefreq>/g)).toHaveLength(PAGES.length);
    expect(sitemap.match(/<priority>/g)).toHaveLength(PAGES.length);
    expect(sitemap).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  });

  it('déclare l’espace de noms que la norme attend', () => {
    expect(sitemap).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
  });
});

describe('robots.txt', () => {
  it('ferme chacun des chemins non indexés', () => {
    NON_INDEXEES.forEach((chemin) => {
      // `/eleves` est fermé par `/eleves/`, `/scan` par `/scan/` : un préfixe
      // suffit, tant que la ligne commence bien par le chemin.
      const ferme = new RegExp(`^Disallow: ${chemin}/?$`, 'm');
      expect(robots).toMatch(ferme);
    });
  });

  it('ne ferme aucune page publique', () => {
    const fermes = [...robots.matchAll(/^Disallow: (.+)$/gm)].map((m) => m[1].trim());

    PAGES.forEach((page) => {
      fermes.forEach((ferme) => {
        const prefixe = ferme.replace(/\/$/, '');
        expect(page.chemin === prefixe || page.chemin.startsWith(`${prefixe}/`)).toBe(false);
      });
    });
  });

  it('annonce le plan du site', () => {
    expect(robots).toContain(`Sitemap: ${ORIGINE}/sitemap.xml`);
  });

  it('ne bloque pas tout le site par mégarde', () => {
    // Le défaut le plus coûteux du fichier : une ligne « Disallow: / » oubliée
    // retire le site entier de Google, sans aucun signe visible à l'écran.
    expect(robots).not.toMatch(/^Disallow: \/$/m);
  });
});
