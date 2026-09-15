import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getEpreuve } from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import BarrePreparation, { palierPreparation } from './BarrePreparation';
import { LIBELLE_ETAT } from './ControleFiche';
import JustificationProfesseur from './JustificationProfesseur';
import Loader from './Loader';
import PastillePret from './PastillePret';
import { jourControle } from './MesControles';
import { libellePreparation } from './PreparationExamen';

/**
 * La fiche d'une épreuve d'examen — le pendant de la fiche d'un contrôle.
 *
 * Toutes les notions de l'épreuve, regroupées par domaine du programme, avec
 * leur barre et leur état en toutes lettres ; puis le statut et la
 * justification de CHAQUE professeur de l'épreuve, signés et datés.
 *
 * LES DOMAINES SE REPLIENT, SAUF LE PREMIER : une épreuve de brevet compte des
 * dizaines de notions, et une liste de soixante lignes ne se lit pas. L'enfant
 * ouvre le domaine qu'il cherche.
 */
function grouperParDomaine(notions) {
  const groupes = new Map();

  notions.forEach((notion) => {
    const domaine = notion.domaine || 'Autres notions';
    if (!groupes.has(domaine)) groupes.set(domaine, []);
    groupes.get(domaine).push(notion);
  });

  return [...groupes.entries()].map(([domaine, liste]) => ({ domaine, notions: liste }));
}

function NotionEpreuve({ notion }) {
  const etat = LIBELLE_ETAT[notion.etat] ?? notion.etat;

  return (
    <li className="controle-notion">
      <div className="controle-notion__ligne">
        <span className="controle-notion__libelle">{notion.libelle}</span>

        <span className="controle-notion__etat">
          {etat}
          <span className="controle-notion__pourcent">{notion.pourcent} %</span>
        </span>
      </div>

      <div
        className="controle-notion__jauge"
        role="progressbar"
        aria-valuenow={notion.pourcent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${notion.libelle} : ${etat}`}
      >
        <span
          className={`est-${palierPreparation(notion.pourcent)}`}
          style={{ width: `${notion.pourcent}%` }}
        />
      </div>

      {notion.valideeParMesure && (
        <span className="controle-notion__resultat est-reussie">✓ validée par une note</span>
      )}
    </li>
  );
}

function MatiereEpreuve({ matiere, plusieurs, onPreparer }) {
  const preparation = matiere.preparation ?? { notions: [] };
  const domaines = grouperParDomaine(preparation.notions ?? []);

  return (
    <section className="epreuve-fiche__matiere">
      <h2 className="epreuve-fiche__titre">
        {matiere.libelle}
        {matiere.profPrenom && <span className="epreuve-fiche__prof"> avec {matiere.profPrenom}</span>}
      </h2>

      <section className="controle-fiche__resume">
        <BarrePreparation
          pourcent={preparation.pourcent}
          perimetreConnu={preparation.perimetreConnu ?? false}
        />

        {/* LE VERDICT EST CELUI DU PROFESSEUR, ET RIEN D'AUTRE — même règle
            que pour un contrôle : on ne devine pas. */}
        <div className="controle-pret">
          <PastillePret statut={preparation.pretStatut} cible="epreuve" />

          {/* EN PARAGRAPHES, un par domaine — voir JustificationProfesseur. */}
          {preparation.pretObservation && (
            <JustificationProfesseur
              texte={preparation.pretObservation}
              signature={preparation.pretLe
                ? ` — ${matiere.profPrenom ?? 'ton professeur'}, le ${jourControle(preparation.pretLe)}`
                : null}
            />
          )}
        </div>
      </section>

      {domaines.map((groupe, index) => (
        <details key={groupe.domaine} className="epreuve-fiche__domaine" open={index === 0}>
          <summary>
            <span>{groupe.domaine}</span>
            <span className="controle-fiche__compte">
              {groupe.notions.filter((n) => n.etat === 'acquise').length} acquise
              {groupe.notions.filter((n) => n.etat === 'acquise').length > 1 ? 's' : ''}
              {' '}sur {groupe.notions.length}
            </span>
          </summary>

          <ul className="controle-notions">
            {groupe.notions.map((notion) => <NotionEpreuve key={notion.id} notion={notion} />)}
          </ul>
        </details>
      ))}

      <div className="controle-fiche__actions">
        <button type="button" className="btn" onClick={() => onPreparer(matiere)}>
          {libellePreparation(matiere, plusieurs)}
        </button>
      </div>
    </section>
  );
}

export default function EpreuveFiche() {
  const { eleveId, epreuveCode } = useParams();
  const navigate = useNavigate();

  const [epreuve, setEpreuve] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;

    getEpreuve(eleveId, epreuveCode)
      .then(({ data }) => { if (vivant) setEpreuve(data); })
      .catch(() => { if (vivant) setErreur("Cette épreuve n'a pas pu être chargée."); });

    return () => { vivant = false; };
  }, [eleveId, epreuveCode]);

  if (erreur) return <div className="alert">{erreur}</div>;
  if (!epreuve) return <Loader texte="Chargement…" />;

  const plusieurs = epreuve.matieres.length > 1;

  // LE MODE VOYAGE DANS L'ADRESSE : c'est lui qui dit au professeur qu'on
  // prépare CETTE épreuve, et qu'il ne doit parler d'aucun contrôle.
  const preparer = (matiere) => navigate(
    `/eleves/${eleveId}/matieres/${matiere.matiereId}/chat?mode=examen&epreuve=${encodeURIComponent(epreuve.code)}`,
  );

  return (
    <section
      className="page controle-page"
      style={styleMatiere({ matiereLibelle: epreuve.matieres[0]?.libelle })}
    >
      <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">← Mes cours</Link>

      <article className="controle-fiche">
        <header className="controle-fiche__entete">
          <div className="controle-fiche__haut">
            <span className="controle-fiche__matiere">
              <span className="controle-fiche__point" aria-hidden="true" />
              {epreuve.examenLibelle} {epreuve.session}
            </span>

            <span className="controle-fiche__badge">{epreuve.pourcent} %</span>
          </div>

          <h1>{epreuve.libelle}</h1>

          {epreuve.description && <p className="controle-fiche__quand">{epreuve.description}</p>}
          {epreuve.remarque && <p className="epreuve-fiche__remarque">{epreuve.remarque}</p>}
        </header>

        <div className="controle-fiche__corps">
          {epreuve.matieres.map((matiere) => (
            <MatiereEpreuve
              key={matiere.matiereId}
              matiere={matiere}
              plusieurs={plusieurs}
              onPreparer={preparer}
            />
          ))}
        </div>
      </article>
    </section>
  );
}
