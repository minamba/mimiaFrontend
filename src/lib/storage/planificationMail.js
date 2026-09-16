import { dateUtc } from './dateUtc';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** Les jours de la semaine, lundi = 1 … dimanche = 7, comme le serveur. */
export const JOURS_SEMAINE = JOURS.map((libelle, i) => ({ valeur: i + 1, libelle }));

/**
 * La planification d'un courriel automatique, en une phrase :
 * « Tous les jours à 08:00 », « Chaque lundi à 09:00 », « Le 5 de chaque mois
 * à 13:00 ».
 */
export function resumerPlanification({ frequence, heure, jourSemaine, jourMois } = {}) {
  if (!heure || !frequence || frequence === 'Aucune') return 'Non programmé';

  switch (frequence) {
    case 'Jour':
      return `Tous les jours à ${heure}`;
    case 'Semaine':
      return jourSemaine ? `Chaque ${JOURS[jourSemaine - 1]} à ${heure}` : 'Non programmé';
    case 'Mois':
      return jourMois ? `Le ${jourMois === 1 ? '1er' : jourMois} de chaque mois à ${heure}` : 'Non programmé';
    default:
      return 'Non programmé';
  }
}

/**
 * « lundi 21 septembre à 09:00 », À L'HEURE DE PARIS quel que soit le fuseau
 * de l'ordinateur : c'est l'heure à laquelle les parents reçoivent le
 * courriel, et celle qu'on a choisie en le programmant.
 */
export function formaterProchainEnvoi(valeur) {
  const date = dateUtc(valeur);
  if (!date) return '';

  const morceaux = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const p = Object.fromEntries(morceaux.map(({ type, value }) => [type, value]));

  return `${p.weekday} ${p.day} ${p.month} à ${p.hour}:${p.minute}`;
}
