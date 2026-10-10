import { useEffect, useState } from 'react';
import {
  geoArea, geoContains, geoGraticule10, geoNaturalEarth1, geoPath,
} from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import paysIso from 'i18n-iso-countries';
import fr from 'i18n-iso-countries/langs/fr.json';
import { regionDe, continentDe, REGIONS, CONTINENTS } from '../../../../lib/jeux/bonus/geo/regions.js';

/**
 * LA CARTE DU MONDE DE « CAP SUR LE MONDE » (10/10/2026) : construite par le
 * code, sans aucune image, à partir de Natural Earth (domaine public) par
 * `world-atlas`, simplifiée dans `lib/jeux/bonus/geo/monde.json` (126 Ko
 * compressés, chargés à part, et seulement par ces trois jeux).
 *
 * PROJECTION NATURAL EARTH : ni le Groenland géant de Mercator, ni les
 * continents tordus des projections égales — celle des atlas de l'école.
 * Les tracés sont calculés UNE FOIS, puis la carte zoome par une simple
 * transformation : le zoom ne recalcule rien.
 *
 * LES NOMS EN FRANÇAIS viennent de `i18n-iso-countries`, corrigés là où le
 * nom officiel n'est pas celui qu'un enfant connaît (« États-Unis
 * d'Amérique » → « États-Unis »).
 */

export const LARGEUR = 960;
export const HAUTEUR = 500;

export const projection = geoNaturalEarth1().fitExtent([[8, 8], [LARGEUR - 8, HAUTEUR - 8]], { type: 'Sphere' });
const tracer = geoPath(projection);

/** Un tracé SVG, ses nombres coupés au centième : trois fois plus court, et rien ne se voit, même zoomé sur la France. */
const court = (d) => (d ? d.replace(/(\.\d\d)\d+/g, '$1') : '');
const chemin = Object.assign((objet) => court(tracer(objet)), { bounds: (o) => tracer.bounds(o), centroid: (o) => tracer.centroid(o) });

paysIso.registerLocale(fr);

const NOMS = {
  US: 'États-Unis',
  TZ: 'Tanzanie',
  SZ: 'Eswatini',
  VA: 'Vatican',
  CZ: 'Tchéquie',
  DO: 'République dominicaine',
  CF: 'Centrafrique',
  AE: 'Émirats arabes unis',
  SA: 'Arabie saoudite',
  BN: 'Brunei',
  CG: 'Congo',
  MM: 'Birmanie',
  CI: 'Côte d’Ivoire',
  NG: 'Nigeria',
  LR: 'Liberia',
  VN: 'Viêt Nam',
  XK: 'Kosovo',
  SOL: 'Somaliland',
  CYN: 'Chypre du Nord',
  SIA: 'Glacier de Siachen',
  IOT: 'Îles de l’océan Indien (Australie)',
  IO: 'Territoire britannique de l’océan Indien',
  AQ: 'Antarctique',
  TF: 'Terres australes françaises',
};

/** Le nom d'un pays en français, sans article : « Brésil ». */
export function nomFrancais(code) {
  return NOMS[code] ?? paysIso.getName(code, 'fr') ?? code;
}

/** Le plus grand morceau d'un pays : la France sans la Guyane, les États-Unis sans l'Alaska. */
function plusGrandMorceau(f) {
  if (f.geometry.type !== 'MultiPolygon') return f;
  let meilleur = null;
  let aire = -1;
  f.geometry.coordinates.forEach((polygone) => {
    const morceau = { type: 'Feature', geometry: { type: 'Polygon', coordinates: polygone } };
    const a = geoArea(morceau);
    if (a > aire) { aire = a; meilleur = morceau; }
  });
  return meilleur;
}

/** Une couleur un peu plus claire ou plus foncée, pour distinguer deux voisins de la même région. */
function nuance(hex, n) {
  const v = parseInt(hex.slice(1), 16);
  const ajuste = (c) => Math.max(0, Math.min(255, Math.round(c + n)));
  const r = ajuste((v >> 16) & 255);
  const g = ajuste((v >> 8) & 255);
  const b = ajuste(v & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const hacher = (texte) => [...texte].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);

function construire(topo) {
  const objet = topo.objects.countries;
  const couleurRegion = Object.fromEntries(REGIONS.map((r) => [r.cle, r.couleur]));
  const couleurContinent = Object.fromEntries(CONTINENTS.map((c) => [c.cle, c.couleur]));
  const pays = feature(topo, objet).features.map((f) => {
    const code = String(f.id);
    const region = regionDe(code) ?? 'antarctique';
    const continent = continentDe(code) ?? 'antarctique';
    const morceau = plusGrandMorceau(f);
    const ecart = ((hacher(code) % 5) - 2) * 9;
    return {
      code,
      region,
      continent,
      d: chemin(f),
      boite: chemin.bounds(morceau),
      centre: chemin.centroid(morceau),
      couleurs: {
        regions: nuance(couleurRegion[region] ?? '#dddddd', ecart),
        continents: nuance(couleurContinent[continent] ?? '#dddddd', ecart),
        neutre: nuance('#f6d98b', ecart),
      },
      feature: f,
    };
  });
  return {
    pays,
    sphere: chemin({ type: 'Sphere' }),
    graticule: chemin(geoGraticule10()),
    frontieres: chemin(mesh(topo, objet, (a, b) => a !== b)),
    /** Le pays sous un point [lon, lat], ou null en mer. */
    paysSous(point) {
      const trouve = pays.find((p) => geoContains(p.feature, point));
      return trouve ? trouve.code : null;
    },
    pays_: Object.fromEntries(pays.map((p) => [p.code, p])),
  };
}

let promesse = null;
let charge = null;

/** Charge la carte une fois pour toutes (un fichier à part, téléchargé au premier jeu de géo). */
export function chargerMonde() {
  if (charge) return Promise.resolve(charge);
  if (!promesse) {
    promesse = import('../../../../lib/jeux/bonus/geo/monde.json')
      .then((m) => {
        charge = construire(m.default ?? m);
        return charge;
      })
      .catch((e) => {
        promesse = null;
        throw e;
      });
  }
  return promesse;
}

/** La carte, ou null tant qu'elle se charge. */
export function useMonde() {
  const [monde, setMonde] = useState(charge);
  useEffect(() => {
    if (monde) return undefined;
    let vivant = true;
    chargerMonde().then((m) => { if (vivant) setMonde(m); }).catch(() => {});
    return () => { vivant = false; };
  }, [monde]);
  return monde;
}

/** Le tracé du plus court chemin (le grand cercle) entre deux points [lon, lat] : une courbe sur la carte. */
export const ligneDe = (de, vers) => chemin({ type: 'LineString', coordinates: [de, vers] });

/** Le point projeté d'un [lon, lat], dans le repère 960 × 500 de la carte. */
export const projeter = (lon, lat) => projection([lon, lat]);

/** La boîte projetée d'une boîte en degrés [[lonO, latS], [lonE, latN]] (bords échantillonnés : les méridiens sont courbes). */
export function boiteDegres([[lon0, lat0], [lon1, lat1]]) {
  const xs = [];
  const ys = [];
  for (let i = 0; i <= 8; i += 1) {
    const lon = lon0 + ((lon1 - lon0) * i) / 8;
    const lat = lat0 + ((lat1 - lat0) * i) / 8;
    [[lon, lat0], [lon, lat1], [lon0, lat], [lon1, lat]].forEach((p) => {
      const [x, y] = projection(p);
      xs.push(x);
      ys.push(y);
    });
  }
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
}

/** La boîte projetée qui contient des points [lon, lat], élargie d'une marge en degrés. */
export function boitePoints(points, marge = 2) {
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  return boiteDegres([
    [Math.max(-180, Math.min(...lons) - marge), Math.max(-85, Math.min(...lats) - marge)],
    [Math.min(180, Math.max(...lons) + marge), Math.min(85, Math.max(...lats) + marge)],
  ]);
}

/** L'union de deux boîtes projetées. */
export const unionBoites = (a, b) => [
  [Math.min(a[0][0], b[0][0]), Math.min(a[0][1], b[0][1])],
  [Math.max(a[1][0], b[1][0]), Math.max(a[1][1], b[1][1])],
];

/** La France métropolitaine, Corse comprise : la carte des villes de France. */
export const BOITE_FRANCE = [[-5.6, 41.2], [9.9, 51.3]];
