/**
 * LES MÉTADONNÉES SUIVENT LA PAGE — Camara, le 23/09/2026.
 *
 * Avant, toutes les pages du site se déclaraient « page d'accueil » à Google,
 * canonique comprise : aucune ne pouvait ressortir sur la recherche qui lui
 * correspond. Ces tests tiennent les trois promesses de la correction —
 * chaque page a SA fiche, la canonique suit le chemin, et rien ne se duplique
 * quand on navigue.
 *
 * Ils appellent `appliquerMeta` directement plutôt que de monter un routeur :
 * le hook n'est qu'un `useEffect` autour de cette fonction, et la tester nue
 * évite d'avoir à simuler une navigation pour lire une balise.
 */

import { appliquerMeta } from '../lib/seo/useMetaPage';
import { NON_INDEXEES, ORIGINE, PAGES, normaliser } from '../lib/seo/pages';

// Convention de la maison : le routeur est simulé plutôt que monté. Ici il
// n'est même pas sollicité — `appliquerMeta` ne le connaît pas — mais le
// module qui la porte importe `useLocation`, et v7 ne se charge pas sous Jest.
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
}));

const lire = (selecteur) => document.head.querySelector(selecteur)?.getAttribute('content') ?? null;
const canonique = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;

beforeEach(() => {
  document.head.innerHTML = '';
  document.title = '';
});

describe('la table des pages', () => {
  it('donne à chaque page un titre qui n’appartient qu’à elle', () => {
    const titres = PAGES.map((p) => p.titre);
    expect(new Set(titres).size).toBe(PAGES.length);
  });

  it('donne à chaque page une description qui n’appartient qu’à elle', () => {
    const descriptions = PAGES.map((p) => p.description);
    expect(new Set(descriptions).size).toBe(PAGES.length);
  });

  it('écrit des titres et des descriptions que Google n’aura pas à couper', () => {
    PAGES.forEach((page) => {
      // Google affiche environ 60 caractères de titre et 160 de description ;
      // au-delà il coupe, et ce qui est coupé est souvent ce qui convainc.
      expect(page.titre.length).toBeLessThanOrEqual(62);
      expect(page.description.length).toBeGreaterThan(70);
      expect(page.description.length).toBeLessThanOrEqual(165);
    });
  });

  it('ne range aucune page publique parmi les chemins non indexés', () => {
    PAGES.forEach((page) => {
      expect(NON_INDEXEES).not.toContain(page.chemin);
    });
  });
});

describe('appliquerMeta', () => {
  it('pose le titre et la description de la page demandée', () => {
    PAGES.forEach((page) => {
      appliquerMeta(page.chemin);

      expect(document.title).toBe(page.titre);
      expect(lire('meta[name="description"]')).toBe(page.description);
    });
  });

  it('fait pointer la canonique sur le chemin courant, pas sur l’accueil', () => {
    appliquerMeta('/tarifs');
    expect(canonique()).toBe(`${ORIGINE}/tarifs`);

    appliquerMeta('/avis');
    expect(canonique()).toBe(`${ORIGINE}/avis`);

    appliquerMeta('/');
    expect(canonique()).toBe(`${ORIGINE}/`);
  });

  it('ignore la barre finale et les paramètres : une seule adresse canonique', () => {
    appliquerMeta('/tarifs/');
    expect(canonique()).toBe(`${ORIGINE}/tarifs`);

    // Une campagne ajoute son `utm_source` : sans la normalisation, l'adresse
    // marquée deviendrait une page distincte, en doublon de celle d'origine.
    appliquerMeta('/tarifs?utm_source=facebook');
    expect(canonique()).toBe(`${ORIGINE}/tarifs`);
    expect(document.title).toBe(PAGES.find((p) => p.chemin === '/tarifs').titre);
    expect(normaliser('/tarifs?utm_source=facebook')).toBe('/tarifs');
  });

  it('aligne le partage sur la page : og et twitter reprennent son titre', () => {
    appliquerMeta('/avis');

    const page = PAGES.find((p) => p.chemin === '/avis');
    expect(lire('meta[property="og:title"]')).toBe(page.titre);
    expect(lire('meta[property="og:url"]')).toBe(`${ORIGINE}/avis`);
    expect(lire('meta[name="twitter:description"]')).toBe(page.description);
  });

  it('couvre d’un noindex tout l’espace connecté et les pages de passage', () => {
    ['/eleves', '/eleves/12/chat', '/profil', '/admin', '/code', '/scan/abc',
      '/callback', '/silent-renew', '/desabonnement', '/donner-mon-avis',
    ].forEach((chemin) => {
      appliquerMeta(chemin);
      expect(lire('meta[name="robots"]')).toBe('noindex, nofollow');
    });
  });

  it('couvre aussi les adresses inventées — la page « introuvable »', () => {
    appliquerMeta('/promo-2024');
    expect(lire('meta[name="robots"]')).toBe('noindex, nofollow');
  });

  it('RETIRE le noindex en revenant sur une page publique', () => {
    // Le défaut qu'on empêche : posé une fois et jamais enlevé, il suivrait le
    // visiteur de l'espace connecté vers les tarifs et les ferait disparaître
    // de l'index — invisible à l'écran, et durable.
    appliquerMeta('/eleves');
    expect(lire('meta[name="robots"]')).toBe('noindex, nofollow');

    appliquerMeta('/tarifs');
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('ne laisse jamais deux balises de la même sorte après plusieurs navigations', () => {
    ['/', '/tarifs', '/avis', '/eleves', '/tarifs', '/cgv', '/'].forEach(appliquerMeta);

    [
      'meta[name="description"]',
      'link[rel="canonical"]',
      'meta[property="og:url"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
    ].forEach((selecteur) => {
      expect(document.head.querySelectorAll(selecteur)).toHaveLength(1);
    });
  });
});
