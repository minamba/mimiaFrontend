import { Link } from 'react-router-dom';
import iconeExamen from '../assets/exam.png';
import { styleMatiere } from '../lib/couleurMatiere';
import BarrePreparation from './BarrePreparation';
import PastillePret from './PastillePret';

/**
 * « Préparation au brevet » — la section posée sous « Mes contrôles ».
 *
 * Voulue par Camara le 14/09/2026 : une barre qui est la moyenne des épreuves,
 * puis une carte par épreuve écrite, puis, en ouvrant la carte, toutes les
 * notions à maîtriser avec leur barre, et le statut et la justification du
 * professeur — « le même principe que les contrôles ».
 *
 * RIEN N'EST CALCULÉ ICI. Les pourcentages, le titre de la section et la
 * session viennent du serveur, qui connaît la classe et l'année scolaire : un
 * élève de 3e en 2026-2027 passe le brevet 2027, et l'an prochain la section
 * changera de session sans qu'on touche à cet écran.
 *
 * UNE ÉPREUVE PEUT SE PRÉPARER AVEC PLUSIEURS PROFESSEURS — les sciences, avec
 * celui de physique-chimie et celui de SVT. Chacun juge ce qu'il a vu : la
 * carte porte donc un verdict et un bouton par matière.
 */

/** « Continuer la préparation avec Salim », quand l'épreuve a plusieurs professeurs. */
export const libellePreparation = (matiere, plusieurs) => {
  const verbe = (matiere.nombrePreparations ?? 0) > 0 ? 'Continuer la préparation' : 'Commencer à réviser';
  return plusieurs && matiere.profPrenom ? `${verbe} avec ${matiere.profPrenom}` : verbe;
};

export function EpreuveCarte({ epreuve, eleveId, onPreparer }) {
  const plusieurs = epreuve.matieres.length > 1;

  return (
    <li
      className="controle-carte epreuve-carte"
      style={styleMatiere({ matiereLibelle: epreuve.matieres[0]?.libelle })}
    >
      <div className="controle-carte__haut">
        <span className="controle-carte__matiere">
          <span className="controle-carte__point" aria-hidden="true" />
          {epreuve.matieres.map((m) => m.libelle).join(' · ')}
        </span>
      </div>

      <Link to={`/eleves/${eleveId}/examen/${epreuve.code}`} className="controle-carte__titre">
        {epreuve.libelle}
      </Link>

      <BarrePreparation pourcent={epreuve.pourcent} compact />

      <ul className="epreuve-carte__matieres">
        {epreuve.matieres.map((matiere) => (
          <li key={matiere.matiereId} className="epreuve-carte__matiere">
            {plusieurs && <span className="epreuve-carte__libelle">{matiere.libelle}</span>}

            <PastillePret
              statut={matiere.preparation?.pretStatut}
              titre={matiere.preparation?.pretObservation}
              cible="epreuve"
            />

            <button
              type="button"
              className="btn btn--compact controle-carte__action"
              onClick={() => onPreparer?.(epreuve, matiere)}
            >
              {libellePreparation(matiere, plusieurs)}
            </button>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function PreparationExamen({ eleveId, examen, onPreparer }) {
  if (!examen) return null;

  const nombre = examen.epreuves?.length ?? 0;
  const aRenseigner = Boolean(examen.specialitesARenseigner);
  const manquantes = examen.specialitesManquantes ?? 0;
  const notes = examen.notesControleContinu ?? [];

  if (nombre === 0 && !aRenseigner && notes.length === 0) return null;

  return (
    // Même destination que « Mes contrôles » : le détail d'une épreuve
    // renvoie ici, et non en haut d'une page longue.
    <section className="controles-section examen-section" id="preparation-examen">
      <div className="controles-section__entete">
        <div className="controles-section__titre">
          {/* LA MÊME ILLUSTRATION QUI DÉBORDE QUE « MES CONTRÔLES » — Camara,
              le 14/09/2026 : la copie « EXAM », sa toque et sa médaille sortent
              par le haut de la carte. Mêmes classes, donc même placement (voir
              `.controles-section__icone`). Décorative : le titre dit tout. */}
          <span className="controles-section__icone" aria-hidden="true">
            <img src={iconeExamen} alt="" />
          </span>

          <div>
            <h2>{examen.titreSection}</h2>
            {/* L'ANNÉE DE L'ÉPREUVE, PAS LA « SESSION ». Le bac de français de
                juin 2027 compte officiellement pour la session 2028 : écrire
                « session 2027 » serait faux, et « session 2028 » ferait croire
                qu'on a un an de plus. */}
            <p>
              Juin {examen.session} : les épreuves écrites, et où tu en es dans chacune.
            </p>
          </div>
        </div>
      </div>

      {/* LES SPÉCIALITÉS DÉCIDENT DES ÉPREUVES. Tant qu'il en manque une, la
          section le dit : sans cela, un élève de terminale croirait que son bac
          se réduit à la philosophie.

          UNE SEULE COCHÉE SUR DEUX SE TAISAIT — Camara, le 20/09/2026 : son
          fils n'avait que NSI, l'écran n'alertait qu'à zéro, et le bac
          paraissait amputé sans que rien ne l'explique. Le cas partiel est le
          plus trompeur des deux : la section a l'air complète. */}
      {aRenseigner && (
        <p className="examen-section__alerte" role="note">
          {manquantes === 1 && nombre > 0
            ? 'Il manque une spécialité dans ton profil : son épreuve n’apparaît pas ici. '
              + 'Demande à ton parent de la cocher.'
            : 'Tes spécialités ne sont pas encore renseignées. Demande à ton parent de '
              + 'les cocher dans ton profil : leurs épreuves apparaîtront ici.'}
        </p>
      )}

      {/* LA BARRE GLOBALE EST LA MOYENNE DES ÉPREUVES, et elle le dit : un
          chiffre dont on ne sait pas d'où il sort ne dit rien à un enfant. */}
      {nombre > 0 && (
        <div className="examen-section__global">
          <BarrePreparation pourcent={examen.pourcent} />
          <p className="examen-section__explication">
            La moyenne de tes {nombre} épreuve{nombre > 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {/* CE QUI COMPTE SANS ÉPREUVE FINALE — l'espagnol en LV2. Un élève de
          terminale se demande s'il a « le bac d'espagnol » : la réponse est ici,
          écrite par le serveur. */}
      {notes.map((note) => (
        <p key={note} className="examen-section__note">
          {note}
        </p>
      ))}

      <ul className="controles-liste">
        {(examen.epreuves ?? []).map((epreuve) => (
          <EpreuveCarte
            key={epreuve.code}
            epreuve={epreuve}
            eleveId={eleveId}
            onPreparer={onPreparer}
          />
        ))}
      </ul>
    </section>
  );
}
