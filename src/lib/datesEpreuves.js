/**
 * LES DATES OFFICIELLES DES ÉPREUVES, MISES EN MOTS — Camara, le 25/11/2026 : les dates des sessions officielles sur
 * chaque carte d'épreuve, et dans l'onglet « Sessions d'examens ». Un seul module pour les deux : l'élève et
 * l'administrateur lisent la même phrase.
 *
 * Une date arrive du serveur ainsi : { nature: 'JOUR' | 'UN_DES_DEUX' | 'PERIODE', dateEpreuve, dateFin,
 * heureDebut: '08:00:00', heureFin, remplacementLe }. Les jours sont des dates sans fuseau (« 2027-06-24T00:00:00 ») :
 * on les lit en date LOCALE, jamais en UTC, sans quoi un enfant à l'ouest de Greenwich verrait la veille.
 */

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre',
  'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** « 2027-06-24T00:00:00 » → Date locale à minuit, ou null. */
export function jourLocal(valeur) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valeur ?? '');
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

/** « 08:00:00 » → « 8 h », « 11:15:00 » → « 11 h 15 ». */
export function heureCourte(valeur) {
  const m = /^(\d{1,2}):(\d{2})/.exec(valeur ?? '');
  if (!m) return null;
  const h = Number(m[1]);
  return m[2] === '00' ? `${h} h` : `${h} h ${m[2]}`;
}

const jourLong = (d, avecAnnee = true) =>
  `${JOURS[d.getDay()]} ${d.getDate() === 1 ? '1er' : d.getDate()} ${MOIS[d.getMonth()]}${avecAnnee ? ` ${d.getFullYear()}` : ''}`;

/**
 * « Jeudi 24 juin 2027 », « Mercredi 16 ou jeudi 17 juin 2027 » (une spécialité du bac général, selon la
 * convocation), « Du 21 juin au 2 juillet 2027 » (une période). Null si la date est illisible.
 */
export function jourEpreuve(date) {
  const debut = jourLocal(date?.dateEpreuve);
  if (!debut) return null;
  const fin = jourLocal(date?.dateFin);

  let texte;
  if (date.nature === 'UN_DES_DEUX' && fin) {
    // « Mercredi 16 ou jeudi 17 juin 2027 » : le mois une seule fois quand les deux jours le partagent.
    texte = debut.getMonth() === fin.getMonth()
      ? `${JOURS[debut.getDay()]} ${debut.getDate()} ou ${jourLong(fin)}`
      : `${jourLong(debut, false)} ou ${jourLong(fin)}`;
  } else if (date.nature === 'PERIODE' && fin) {
    texte = `du ${debut.getDate()} ${MOIS[debut.getMonth()]} au ${fin.getDate()} ${MOIS[fin.getMonth()]} ${fin.getFullYear()}`;
  } else {
    texte = jourLong(debut);
  }
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** « 8 h – 11 h 15 », « 8 h » si la fin manque, null sans horaire. */
export function horaireEpreuve(date) {
  const debut = heureCourte(date?.heureDebut);
  const fin = heureCourte(date?.heureFin);
  if (!debut) return null;
  return fin ? `${debut} – ${fin}` : debut;
}

/** La durée en clair : « 3 h 15 », « 2 h », « 30 min ». Null sans début ou sans fin. */
export function dureeEpreuve(date) {
  const a = /^(\d{1,2}):(\d{2})/.exec(date?.heureDebut ?? '');
  const b = /^(\d{1,2}):(\d{2})/.exec(date?.heureFin ?? '');
  if (!a || !b) return null;
  const minutes = (Number(b[1]) * 60 + Number(b[2])) - (Number(a[1]) * 60 + Number(a[2]));
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/** Les jours qui restent jusqu'au premier jour de l'épreuve (0 = aujourd'hui), ou null. */
export function joursRestants(date, aujourdhui = new Date()) {
  const debut = jourLocal(date?.dateEpreuve);
  if (!debut) return null;
  const base = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
  return Math.round((debut - base) / 86400000);
}

/**
 * Le compte à rebours et son ton : neutre au-delà d'un mois, ambre sous 30 jours, corail sous 7. Null une fois
 * l'épreuve passée (la carte n'affiche plus rien de compté).
 */
export function compteARebours(date, aujourdhui = new Date()) {
  const n = joursRestants(date, aujourdhui);
  if (n === null || n < 0) return null;
  const texte = n === 0 ? 'Aujourd’hui' : `J-${n}`;
  const ton = n <= 7 ? 'proche' : n <= 30 ? 'bientot' : 'loin';
  return { texte, ton, jours: n };
}

/** « Du 24 au 28 juin 2027 » : l'étendue des épreuves écrites, d'après leurs dates. Null sans date. */
export function etendueSession(dates) {
  const jours = (dates ?? [])
    .flatMap((d) => [jourLocal(d?.dateEpreuve), d?.nature === 'UN_DES_DEUX' ? jourLocal(d?.dateFin) : null])
    .filter(Boolean)
    .sort((a, b) => a - b);
  if (jours.length === 0) return null;

  const a = jours[0];
  const b = jours[jours.length - 1];
  if (a.getTime() === b.getTime()) return `Le ${jourLong(a)}`;
  if (a.getMonth() === b.getMonth()) return `Du ${a.getDate()} au ${b.getDate()} ${MOIS[b.getMonth()]} ${b.getFullYear()}`;
  return `Du ${a.getDate()} ${MOIS[a.getMonth()]} au ${b.getDate()} ${MOIS[b.getMonth()]} ${b.getFullYear()}`;
}
