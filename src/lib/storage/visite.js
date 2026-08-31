import { API_BASE_URL } from '../api/httpClient';

/**
 * Le comptage des visites du site public.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * Le tableau de bord savait tout de ceux qui se sont inscrits, et rien de ceux
 * qui sont passés. Or un mois sans inscription ne se lit pas de la même façon
 * selon qu'il y a eu trois visiteurs ou trois mille : dans un cas c'est l'offre
 * qui ne convainc pas, dans l'autre c'est que personne n'est venu.
 *
 * CE QUI EST ENVOYÉ, ET RIEN D'AUTRE
 * ----------------------------------
 * Un identifiant tiré au sort par le navigateur. Pas d'adresse, pas de page,
 * pas de référent, pas même la date — l'heure est celle du serveur, sinon
 * n'importe qui pourrait écrire dans le passé et fausser une courbe qu'on lit
 * pour décider.
 *
 * POURQUOI PAS DE COOKIE
 * ----------------------
 * Un identifiant rangé dans le stockage local ne part sur aucun autre site,
 * n'alimente aucune régie, et disparaît au premier nettoyage d'historique. On
 * accepte de recompter la personne : mieux vaut un chiffre légèrement haut
 * qu'une empreinte qui suivrait quelqu'un malgré lui.
 */

const CLE_VISITEUR = 'mimia-visiteur';
const CLE_DERNIER = 'mimia-visite-le';

/**
 * On ne se signale qu'une fois par heure.
 *
 * Sans cette retenue, quelqu'un qui parcourt la page d'accueil, les tarifs
 * puis revient pèserait trois fois plus qu'une famille qui lit une fois — et
 * la table grossirait au rythme des clics. Le serveur applique la même règle
 * de son côté : celle-ci lui épargne simplement l'appel.
 */
const ATTENTE_MS = 60 * 60 * 1000;

/**
 * L'identifiant de ce navigateur, créé au besoin.
 *
 * `randomUUID` n'existe pas sur les Safari anciens ni hors contexte sécurisé,
 * d'où le repli. Il n'a aucune exigence cryptographique : on veut deux
 * visiteurs distincts, pas un secret.
 */
function identifiant() {
  let valeur = null;

  try {
    valeur = localStorage.getItem(CLE_VISITEUR);
  } catch {
    // Navigation privée verrouillée, cookies bloqués : on ne compte pas.
    return null;
  }

  if (valeur) return valeur;

  valeur = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });

  try {
    localStorage.setItem(CLE_VISITEUR, valeur);
  } catch {
    return null;
  }

  return valeur;
}

/**
 * Signale la venue. Ne rend rien et n'échoue jamais bruyamment.
 *
 * `keepalive` plutôt qu'une requête ordinaire : l'appel part souvent au moment
 * où quelqu'un clique déjà sur autre chose, et un navigateur annule les
 * requêtes en cours quand il change de page. Un compteur qui perd la moitié
 * des visites de ceux qui rebondissent mesurerait surtout la patience.
 */
export function signalerVisite() {
  const visiteur = identifiant();
  if (!visiteur) return;

  try {
    const dernier = Number(localStorage.getItem(CLE_DERNIER) ?? 0);
    if (Date.now() - dernier < ATTENTE_MS) return;
    localStorage.setItem(CLE_DERNIER, String(Date.now()));
  } catch {
    return;
  }

  // Aucune attente et aucune propagation d'erreur : le visiteur découvre le
  // site, il n'a pas à voir passer une erreur de compteur dans sa console.
  fetch(`${API_BASE_URL}/visites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visiteur }),
    keepalive: true,
  }).catch(() => {});
}

export default signalerVisite;
