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

import {
  FERMEES_AUX_ROBOTS, NON_INDEXEES, ORIGINE, PAGES,
} from '../lib/seo/pages';

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
  const fermes = () => [...robots.matchAll(/^Disallow: (.+)$/gm)]
    .map((m) => m[1].trim().replace(/\/$/, ''));

  it('ferme exactement les pages qui agissent à l\'ouverture', () => {
    expect(fermes().sort()).toEqual([...FERMEES_AUX_ROBOTS].sort());
  });

  it('laisse lire les pages privées, pour que Google y voie le noindex (26/10/2026)', () => {
    // Fermer une page qu'on veut hors de l'index la fait indexer QUAND MÊME,
    // sans contenu, dès qu'un lien y mène : « Indexée malgré le blocage par le
    // fichier robots.txt ». Le noindex n'agit que sur une page lue.
    const lisibles = NON_INDEXEES.filter((p) => !FERMEES_AUX_ROBOTS.includes(p));
    expect(lisibles).toEqual(expect.arrayContaining(['/code', '/profil', '/admin', '/eleves']));
    lisibles.forEach((chemin) => expect(fermes()).not.toContain(chemin));
  });

  it('ne ferme que des chemins non indexés', () => {
    FERMEES_AUX_ROBOTS.forEach((chemin) => expect(NON_INDEXEES).toContain(chemin));
  });

  it('ne ferme aucune page publique', () => {
    PAGES.forEach((page) => {
      fermes().forEach((ferme) => {
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
