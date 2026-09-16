import { dateUtc } from '../lib/storage/dateUtc';

const heure = (valeur) =>
  dateUtc(valeur)?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) ?? '';

const jour = (valeur) =>
  dateUtc(valeur)?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) ?? '';

function libelleEtat(etat, enregistreA) {
  switch (etat) {
    case 'modifie': return 'Modifications en attente…';
    case 'enregistrement': return 'Enregistrement…';
    case 'enregistre': return enregistreA ? `Enregistré à ${heure(enregistreA)}` : 'Enregistré';
    case 'erreur': return 'Échec de l’enregistrement — les dernières modifications ne sont pas sauvegardées';
    default: return enregistreA ? `Modifié le ${jour(enregistreA)} à ${heure(enregistreA)}` : '';
  }
}

/**
 * « VOUS AVEZ CHOISI UN TEMPLATE » — Camara, le 15/09/2026.
 *
 * Le bandeau dit deux choses qu'on doit savoir avant de taper : ce qu'on
 * modifie n'est pas un brouillon mais le template lui-même, et c'est déjà
 * enregistré. L'état d'enregistrement vit ici, à côté, pour qu'on voie la
 * sauvegarde se faire au lieu d'avoir à la croire.
 */
export default function BandeauModele({ modele, etat, enregistreA }) {
  if (!modele) return null;

  return (
    <div className="bandeau-modele" role="status">
      <span>
        <strong>Vous avez choisi un template</strong> — « {modele.nom} »
      </span>
      <span className="bandeau-modele__aide">
        Vos modifications sont enregistrées automatiquement.
      </span>
      <span className={`etat-enregistrement etat-enregistrement--${etat}`}>
        {libelleEtat(etat, enregistreA)}
      </span>
    </div>
  );
}
