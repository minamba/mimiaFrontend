import { Link } from 'react-router-dom';
import BarrePreparation from './BarrePreparation';
import PastillePret from './PastillePret';
import './examensBlancs.css';

/** Les jours qui restent jusqu'à l'examen blanc, en dates locales (« demain » ne doit pas dépendre de l'heure). */
export const joursAvant = (iso) => {
  const jour = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  return Math.round((jour - aujourdhui) / 86400000);
};

// Les mêmes mots que la carte d'un contrôle (MesControles), recopiés ici : MesControles importe cette carte, et
// l'import inverse ferait une boucle entre les deux fichiers.
const delaiControle = (jours) => {
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return 'demain';
  return `dans ${jours} jours`;
};

const jourControle = (iso) =>
  new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const urgence = (jours) => {
  if (jours <= 1) return 'imminent';
  if (jours <= 6) return 'proche';
  return 'lointain';
};

/**
 * LA CARTE D'UN EXAMEN BLANC, PARMI LES CONTRÔLES — Camara, le 23/11/2026 : une seule carte « Brevet blanc » par
 * date, ses matières, son pourcentage global ; en cliquant, la page de l'examen blanc (comme la préparation au
 * brevet). Habillage à part (étiquette dorée) : on la distingue d'un coup d'œil d'un simple contrôle.
 *
 * Le pourcentage reste à zéro tant que le programme n'est pas validé avec les professeurs (étape 3).
 */
export default function ExamenBlancCarte({ examen, eleveId, illustre = false, onPreparer = null, passe = false }) {
  const jours = joursAvant(examen.dateExamen);
  const matieres = (examen.matieres ?? []).map((m) => m.matiereLibelle).filter(Boolean);
  const lien = `/eleves/${eleveId}/examens-blancs/${examen.id}`;

  // « COMMENCER / CONTINUER LA PRÉPARATION » (Camara, le 23/11/2026), comme la carte d'un contrôle. Une seule matière :
  // la séance s'ouvre sur elle (son contrôle caché). Plusieurs : la page de l'examen blanc, où chacune a son bouton.
  const avecControle = (examen.matieres ?? []).filter((m) => m.controleId);
  const seule = avecControle.length === 1 && (examen.matieres ?? []).length === 1 ? avecControle[0] : null;
  const commence = (examen.matieres ?? []).some((m) => m.preparation?.commence);
  // PASSÉ : « Faire le point », comme un contrôle passé (la séance de bilan, sur le contrôle caché de la matière).
  const libelleAction = passe
    ? 'Faire le point'
    : commence ? 'Continuer la préparation' : 'Commencer la préparation';

  // LE BADGE D'ÉTAT, comme sur la carte d'un contrôle : celui de la matière (ou de la première qui en a un).
  const etat = (seule ?? (examen.matieres ?? []).find((m) => m.preparation?.pretStatut))?.preparation;

  return (
    <li className={`controle-carte eb-carte${illustre ? ' eb-carte--illustree' : ''}`}>
      <div className="eb-carte__tete">
        <span className="eb-carte__icone" aria-hidden="true">🎓</span>
        <div className="eb-carte__ident">
          <span className="eb-carte__etiquette">{examen.libelle}</span>
          <Link to={lien} className="controle-carte__titre eb-carte__titre">
            {matieres.length > 0 ? matieres.join(' · ') : 'Ajoute tes matières'}
          </Link>
          <p className="controle-carte__quand">
            <span className="controle-carte__jour">{jourControle(examen.dateExamen)}</span>
            {examen.heureExamen && ` · ${examen.heureExamen.slice(0, 5)}`}
          </p>
        </div>
        {jours >= 0 && (
          <span className={`controle-carte__delai est-${urgence(jours)}`}>
            <span aria-hidden="true">⏳ </span>
            {delaiControle(jours)}
          </span>
        )}
      </div>

      {/* « On ne sait pas encore ce qu'il y a dessus » serait faux ici : ses documents sont là, rangés. La note qui
          suit dit ce qui manque (le programme à valider). */}
      <div className="eb-carte__preparation">
        <BarrePreparation pourcent={examen.pourcent ?? 0} perimetreConnu compact />
      </div>

      {(examen.matieres ?? []).some((m) => !m.programmeValide) && (
        <p className="eb-carte__note">Programme à valider avec tes professeurs.</p>
      )}

      {/* EN BAS DE LA CARTE, COMME LES AUTRES (Camara, le 23/11/2026) : le badge d'état, puis le bouton. */}
      <div className="eb-carte__bas">
      <PastillePret statut={etat?.pretStatut} titre={etat?.pretObservation} />
      {seule && onPreparer ? (
        <button
          type="button"
          className="btn btn--compact controle-carte__action eb-carte__action"
          onClick={() => onPreparer({ id: seule.controleId, matiereId: seule.matiereId })}
        >
          {libelleAction}
        </button>
      ) : (
        <Link to={lien} className="btn btn--compact controle-carte__action eb-carte__action">
          {libelleAction}
        </Link>
      )}
      </div>
    </li>
  );
}
