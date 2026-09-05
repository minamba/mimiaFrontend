/**
 * CE QU'ON PEUT SAVOIR DE L'APPAREIL, ET RIEN DE PLUS.
 *
 * Une seule question ici, et elle a une bonne raison d'exister : le mode
 * silencieux d'iOS coupe le son du navigateur SANS RIEN AFFICHER dans la
 * page — pas d'icône, pas d'erreur, pas d'état lisible en JavaScript. Le
 * professeur parle, le micro fonctionne, le graphe audio tourne, et l'élève
 * n'entend rien.
 *
 * C'est arrivé le 04/09/2026, et le diagnostic a coûté une demi-heure : le
 * symptôme ressemblait trait pour trait à un bug de lecture audio.
 *
 * ON NE PEUT MÊME PAS DIRE OÙ SE TROUVE LE RÉGLAGE. Jusqu'à l'iPhone 14
 * c'était un interrupteur sur la tranche ; le 15 l'a remplacé par un bouton
 * configurable, et le silencieux s'active aussi depuis le centre de contrôle
 * ou un mode de concentration. L'avertissement nomme donc l'ÉTAT — « ton
 * téléphone est-il en silencieux ? » — et jamais le chemin qui y mène.
 *
 * AUCUNE INTERFACE WEB NE DONNE CET ÉTAT. On ne peut donc pas le détecter,
 * seulement PRÉVENIR — d'où la seule chose utile à savoir : l'appareil
 * est-il un iOS ?
 */

/**
 * Sommes-nous sur un iPhone ou un iPad ?
 *
 * LE NAVIGATEUR N'A AUCUNE IMPORTANCE. Chrome, Firefox et Edge sur iOS sont
 * obligés d'utiliser WebKit : ils héritent tous du même comportement audio,
 * et tous du même mode silencieux. Reconnaître « Safari » aurait laissé
 * passer les trois autres.
 *
 * L'IPAD MODERNE SE FAIT PASSER POUR UN MAC. Depuis iPadOS 13, son
 * identification annonce « Macintosh » — c'était voulu, pour recevoir les
 * versions de bureau des sites. Le seul écart observable est l'écran
 * tactile : aucun Mac n'en déclare. D'où ce second test, sans lequel les
 * iPad passeraient à travers.
 *
 * FAUX SI LE DOUTE EXISTE. Cette fonction ne pilote qu'un avertissement :
 * ne pas le montrer à un iPhone est un oubli ; le montrer à un Android
 * l'envoie chercher un bouton qui n'existe pas, et lui fait douter du reste.
 */
export function estIOS() {
  if (typeof navigator === 'undefined') return false;

  const identification = navigator.userAgent ?? '';

  if (/iPad|iPhone|iPod/.test(identification)) return true;

  return /Macintosh/.test(identification) && navigator.maxTouchPoints > 1;
}

export default estIOS;
