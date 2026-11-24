import { Link } from 'react-router-dom';
import BarrePreparation from './BarrePreparation';
import PastillePret, { STATUTS_PRET } from './PastillePret';
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
 * LES PASTILLES D'UNE CARTE D'EXAMEN BLANC : UNE PAR MATIÈRE (signalement #73 ; décision de Min's, 24/11/2026).
 * La carte prenait le statut de la PREMIÈRE matière qui en avait un : « Bientôt prêt » (Maths) alors que Français
 * était « Pas encore prêt », sans dire de quelle matière il s'agissait.
 *
 * Désormais chaque matière a SA pastille, précédée de son nom (« Mathématiques · Bientôt prêt », « Français · Pas
 * encore prêt »), dans l'ordre de l'examen : la carte redit ligne à ligne ce que dit la page de l'examen blanc.
 * Rien n'est recalculé ni résumé : chaque statut reste celui du serveur, et chaque infobulle l'observation du
 * professeur de SA matière (plus de question d'ex æquo).
 *
 * Rend une liste `{ cle, matiere, preparation }` (vide = pas de pastille) :
 * - une matière sans statut connu (absent, null, inconnu) n'a pas de ligne, comme `PastillePret` qui ne rend rien
 *   plutôt qu'une pastille fausse ;
 * - examen à une seule matière : sa pastille SANS nom (le titre de la carte le dit déjà), comme l'ancien badge,
 *   qui prenait celui de `seule` ;
 * - matière sans libellé (absent, vide ou blanc) : sa pastille sans nom, jamais « undefined » ni un nom vide.
 */
export function etatsDeLaCarte(matieresDeLExamen) {
  const toutes = matieresDeLExamen ?? [];
  const nommer = toutes.length > 1;
  return toutes
    .map((m, rang) => ({ m, rang }))
    .filter(({ m }) => Object.prototype.hasOwnProperty.call(STATUTS_PRET, m.preparation?.pretStatut ?? ''))
    .map(({ m, rang }) => ({
      cle: m.id ?? m.matiereId ?? `rang-${rang}`,
      matiere: nommer ? (m.matiereLibelle ?? '').trim() : '',
      preparation: m.preparation,
    }));
}

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

  // LES BADGES D'ÉTAT, un par matière : voir `etatsDeLaCarte` (signalement #73, décision de Min's du 24/11/2026).
  const etats = etatsDeLaCarte(examen.matieres);

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
      {/* « Prêt pour l'épreuve » (décision de Min's, 24/11/2026) : un examen blanc se passe en épreuves, comme le
          brevet ; « Prêt pour le contrôle » serait le mauvais mot. Les trois autres statuts sont inchangés. */}
      {etats.length > 0 && (
        <ul className="eb-carte__etats" aria-label="Où tu en es, matière par matière">
          {etats.map(({ cle, matiere, preparation }) => (
            <li key={cle} className="eb-carte__etat">
              {/* L'espace sépare le nom du mot pour un lecteur d'écran (« Français Pas encore prêt ») ; dans la
                  ligne flex, une espace seule ne s'affiche pas. */}
              {matiere && <><span className="eb-carte__etat-matiere">{matiere}</span>{' '}</>}
              <PastillePret statut={preparation.pretStatut} titre={preparation.pretObservation} cible="epreuve" />
            </li>
          ))}
        </ul>
      )}
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
