/**
 * LES DISTANCES ET LES DIRECTIONS SUR LA TERRE (10/10/2026) — la boussole de
 * « Enquête sur la carte » et les jugements du « Grand jeu de géo ».
 *
 * PAR LE GRAND CERCLE, pas à la règle sur la carte : une carte plane étire le
 * nord et le sud, et la distance « vue » entre deux points n'est pas la vraie.
 * La Terre est prise ronde, de rayon moyen 6 371 km (l'écart avec l'ellipsoïde
 * reste sous 0,5 %, invisible pour un enfant).
 */

export const RAYON_TERRE_KM = 6371;

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

/** La distance du grand cercle entre deux points [lon, lat], en kilomètres (formule de haversine). */
export function distanceKm([lon1, lat1], [lon2, lat2]) {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAYON_TERRE_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Le cap initial pour aller de `de` vers `vers`, en degrés (0 = nord, 90 = est). */
export function cap([lon1, lat1], [lon2, lat2]) {
  const y = Math.sin(rad(lon2 - lon1)) * Math.cos(rad(lat2));
  const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lon2 - lon1));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Les huit directions de la rose des vents, dans l'ordre du cap. */
export const DIRECTIONS = [
  { cle: 'n', nom: 'le nord' },
  { cle: 'ne', nom: 'le nord-est' },
  { cle: 'e', nom: 'l’est' },
  { cle: 'se', nom: 'le sud-est' },
  { cle: 's', nom: 'le sud' },
  { cle: 'so', nom: 'le sud-ouest' },
  { cle: 'o', nom: 'l’ouest' },
  { cle: 'no', nom: 'le nord-ouest' },
];

/** La direction d'un cap : « le nord-est ». */
export function direction(degres) {
  return DIRECTIONS[Math.round((((degres % 360) + 360) % 360) / 45) % 8];
}

/**
 * FROID, TIÈDE, CHAUD : trois paliers seulement, qu'un enfant de six ans
 * comprend, et la distance en kilomètres à côté pour les plus grands. Les
 * seuils dépendent de la carte : le monde entier, ou la France.
 */
export const PALIERS = {
  monde: { chaud: 1000, tiede: 3000 },
  france: { chaud: 100, tiede: 250 },
};

export function temperature(km, echelle = 'monde') {
  const p = PALIERS[echelle] ?? PALIERS.monde;
  if (km <= p.chaud) return 'chaud';
  if (km <= p.tiede) return 'tiede';
  return 'froid';
}

/** « 1 234 km » : arrondi à la dizaine au-delà de 100 km, espace insécable des milliers. */
export function enKm(km) {
  const arrondi = km >= 100 ? Math.round(km / 10) * 10 : Math.round(km);
  return `${String(arrondi).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} km`;
}

/** « 48,9° N · 2,4° E » : un point en latitude et longitude, à la française. */
export function enDegres([lon, lat]) {
  const f = (v) => Math.abs(v).toFixed(1).replace('.', ',');
  const ns = lat >= 0 ? 'N' : 'S';
  const eo = lon >= 0 ? 'E' : 'O';
  return `${f(lat)}° ${ns} · ${f(lon)}° ${eo}`;
}

/** Le point le plus proche d'un clic parmi une liste d'objets `{ lon, lat }`, avec sa distance. */
export function plusProche(point, liste) {
  let meilleur = null;
  let km = Infinity;
  liste.forEach((x) => {
    const d = distanceKm(point, [x.lon, x.lat]);
    if (d < km) { km = d; meilleur = x; }
  });
  return { lieu: meilleur, km };
}
