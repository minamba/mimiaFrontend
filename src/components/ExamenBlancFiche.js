import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMatieresEleve } from '../lib/api/elevesApi';
import { getExamenBlanc, retirerMatiereExamenBlanc, supprimerExamenBlanc } from '../lib/api/examensBlancsApi';
import { styleMatiere } from '../lib/couleurMatiere';
import { useVueIllustree } from '../lib/vueIllustree';
import useAccesForfait from '../lib/hooks/useAccesForfait';
import useRelectureApresSeance from '../lib/hooks/useRelectureApresSeance';
import BarrePreparation, { palierPreparation } from './BarrePreparation';
import DocumentsExamenBlanc from './DocumentsExamenBlanc';
import DossiersExamenBlanc from './DossiersExamenBlanc';
import ExamenBlancForm from './ExamenBlancForm';
import Loader from './Loader';
import OuvertureSeance from './OuvertureSeance';
import PastillePret from './PastillePret';
import { LIBELLE_ETAT } from './ControleFiche';
import { useAffichageEleve } from '../lib/besoins';
import { iconeEpreuve } from './PreparationExamen';
import fujiCerisiers from '../assets/controles-illustre/fuji-cerisiers.webp';
import toriiCerisiers from '../assets/controles-illustre/torii-cerisiers.webp';
import './epreuveIllustre.css';
import './examensBlancs.css';

const jourLong = (iso) =>
  new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const ERREUR_CHARGEMENT = 'Cet examen blanc n’a pas pu être chargé.';

/**
 * UNE MATIÈRE DE L'EXAMEN BLANC : son professeur, son pourcentage, ses documents. Le pourcentage et le bouton
 * « Commencer à réviser » arrivent avec le programme (étape 3) : tant qu'il n'est pas validé en séance, la carte le
 * dit, et l'enfant peut déjà envoyer et revoir ses documents.
 */
function MatiereExamenBlanc({ eleveId, examen, matiere, onChange, onReviser, ouvert }) {
  const [confirmer, setConfirmer] = useState(false);
  const [erreur, setErreur] = useState(null);

  const retirer = async () => {
    setErreur(null);
    try {
      await retirerMatiereExamenBlanc(eleveId, examen.id, matiere.id);
      onChange();
    } catch {
      setErreur('Cette matière n’a pas pu être retirée. Tu peux réessayer ?');
    }
  };

  return (
    <li className="eb-matiere" style={styleMatiere({ matiereLibelle: matiere.matiereLibelle })}>
      <div className="eb-matiere__tete">
        <span className="eb-matiere__icone" aria-hidden="true">
          {iconeEpreuve({ libelle: matiere.matiereLibelle })}
        </span>
        <h2 className="eb-matiere__titre">
          {matiere.matiereLibelle}
          {matiere.profPrenom && <span className="eb-matiere__prof"> avec {matiere.profPrenom}</span>}
        </h2>
      </div>

      <BarrePreparation
        pourcent={matiere.preparation?.pourcent ?? 0}
        perimetreConnu={matiere.preparation?.perimetreConnu ?? false}
        compact
      />

      {/* LE PROGRAMME : proposé au tableau par le professeur, validé par l'élève (étape 3). Avant, la carte le dit ;
          après, ses notions et leur avancement, comme la fiche d'un contrôle. */}
      {matiere.programmeValide ? (
        <>
          <PastillePret statut={matiere.preparation?.pretStatut} titre={matiere.preparation?.pretObservation} />
          {matiere.preparation?.pretObservation && (
            <p className="eb-matiere__mot">
              <strong>Le mot de ton professeur</strong> {matiere.preparation.pretObservation}
            </p>
          )}
          {(matiere.preparation?.notions?.length ?? 0) > 0 && (
            <ul className="eb-programme">
              {matiere.preparation.notions.map((n) => (
                <li key={n.libelle} className="eb-programme__notion">
                  <span className="eb-programme__libelle">{n.libelle}</span>
                  <span className="eb-programme__etat">{LIBELLE_ETAT[n.etat] ?? n.etat}</span>
                  <span className="eb-programme__pourcent">{n.pourcent} %</span>
                  {/* UNE BARRE PAR NOTION (Camara, le 23/11/2026), aux couleurs des barres de préparation. */}
                  <span
                    className="eb-programme__jauge"
                    role="progressbar"
                    aria-label={`${n.libelle} : ${n.pourcent} %`}
                    aria-valuenow={n.pourcent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span
                      className={`est-${palierPreparation(n.pourcent)}`}
                      style={{ width: `${Math.max(0, Math.min(100, n.pourcent))}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="eb-matiere__programme">
          Programme à valider avec ton professeur : à ta première séance, il te le proposera au tableau à partir de
          tes documents. Tu pourras retirer ou ajouter une notion avant de dire d’accord.
        </p>
      )}

      {matiere.controleId && (
        <button
          type="button"
          className="btn btn--compact eb-matiere__reviser"
          disabled={!ouvert}
          title={ouvert ? undefined : 'Les examens blancs sont réservés aux abonnés.'}
          onClick={() => onReviser(matiere)}
        >
          {matiere.preparation?.commence ? 'Continuer la préparation' : 'Commencer à réviser'}
          {matiere.profPrenom ? ` avec ${matiere.profPrenom}` : ''}
        </button>
      )}

      <DossiersExamenBlanc eleveId={eleveId} examenId={examen.id} matiere={matiere} />

      <DocumentsExamenBlanc
        eleveId={eleveId}
        examenId={examen.id}
        ligneId={matiere.id}
        documents={matiere.documents}
        onChange={() => onChange()}
      />

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

      <div className="eb-matiere__pied">
        {confirmer ? (
          <span>
            Retirer {matiere.matiereLibelle} et ses documents ?{' '}
            <button type="button" className="eb-matiere__retirer" onClick={retirer}>Oui, retirer</button>
            {' · '}
            <button type="button" className="eb-matiere__retirer" onClick={() => setConfirmer(false)}>Non</button>
          </span>
        ) : (
          <button type="button" className="eb-matiere__retirer" onClick={() => setConfirmer(true)}>
            Retirer cette matière
          </button>
        )}
      </div>
    </li>
  );
}

/**
 * LA PAGE D'UN EXAMEN BLANC — Camara, le 23/11/2026 : « une page comme pour la préparation aux examens, avec
 * exactement la même mécanique : le pourcentage global et par notion ». Le titre et la date, la barre globale (la
 * moyenne des matières), une carte par matière avec son professeur et ses documents, « + Ajouter une matière ».
 *
 * ÉTAPE 1 : les documents. Les dossiers par notion (étape 2) et le programme validé en séance, avec ses
 * pourcentages et son bouton de révision (étape 3), viennent ensuite.
 */
export default function ExamenBlancFiche() {
  const { eleveId, examenId } = useParams();
  const navigate = useNavigate();
  const illustre = useVueIllustree();
  const acces = useAccesForfait(eleveId);

  const [examen, setExamen] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [matieres, setMatieres] = useState([]);
  const [ajout, setAjout] = useState(false);
  const [confirmerSuppression, setConfirmerSuppression] = useState(false);
  // LA SÉANCE DE PRÉPARATION (étape 3) : la durée et le casque, puis le cours, sur le contrôle caché de la matière.
  const [ouverture, setOuverture] = useState(null);
  const { calme } = useAffichageEleve(eleveId);

  // `silencieuse` (relectures : après une séance, pendant le rangement) : un échec ne touche pas à l'écran — la page
  // affichée reste, aucun message ne la remplace (#65 v2). `vivant()` faux à l'arrivée = page quittée : on ignore.
  // Seul un 404 (examen supprimé) renvoie aux contrôles, même en silence.
  const charger = useCallback(async ({ silencieuse = false, vivant = () => true } = {}) => {
    try {
      const { data } = await getExamenBlanc(eleveId, examenId);
      if (!vivant()) return null;
      setExamen(data);
      // Une lecture réussie efface l'erreur de CHARGEMENT (pas celle d'une suppression ratée, que l'enfant doit lire).
      setErreur((avant) => (avant === ERREUR_CHARGEMENT ? null : avant));
      return data;
    } catch (e) {
      if (!vivant()) return null;
      if (e?.response?.status === 404) navigate(`/eleves/${eleveId}/matieres#mes-controles`, { replace: true });
      else if (!silencieuse) setErreur(ERREUR_CHARGEMENT);
      return null;
    }
  }, [eleveId, examenId, navigate]);

  useEffect(() => { charger(); }, [charger]);

  // Ouverte juste après « Quitter », la page se relit le temps que le professeur conclue la séance (signalement #65).
  useRelectureApresSeance((vivant) => charger({ silencieuse: true, vivant }), `${eleveId}-${examenId}`);

  useEffect(() => {
    let vivant = true;
    getMatieresEleve(eleveId)
      .then(({ data }) => { if (vivant) setMatieres(Array.isArray(data) ? data : []); })
      .catch(() => {});
    return () => { vivant = false; };
  }, [eleveId]);

  // UNE MATIÈRE RETIRÉE PEUT EMPORTER L'EXAMEN BLANC (sa dernière) : on recharge, et la page renvoie aux contrôles.
  // Un document ajouté ou retiré aussi : les dossiers sont à refaire, l'écran doit le dire.
  const surChangement = useCallback(() => { charger(); }, [charger]);

  // TANT QUE LE PROFESSEUR LIT OU RANGE, la page se relit toutes les 5 secondes : l'enfant voit ses dossiers
  // apparaître sans recharger. Rien ne tourne une fois tout rangé.
  const enCours = Boolean(examen?.matieres?.some((m) => (m.documents?.length ?? 0) > 0 && !m.dossiersAJour));
  // Relecture elle aussi : un appel raté ne remplace pas la page par un message (#65 v2).
  useEffect(() => {
    if (!enCours) return undefined;
    let vivant = true;
    const minuteur = setInterval(() => charger({ silencieuse: true, vivant: () => vivant }), 5000);
    return () => {
      vivant = false;
      clearInterval(minuteur);
    };
  }, [enCours, charger]);

  if (erreur) return <div className="alert">{erreur}</div>;
  if (!examen) return <Loader texte="Chargement…" />;

  const ouvert = acces.ouvert !== false;
  const nombre = examen.matieres.length;

  const supprimer = async () => {
    try {
      await supprimerExamenBlanc(eleveId, examen.id);
      navigate(`/eleves/${eleveId}/matieres#mes-controles`);
    } catch {
      setErreur('Cet examen blanc n’a pas pu être supprimé.');
    }
  };

  const entete = illustre ? (
    <header className="epv-banniere">
      <img className="epv-banniere__decor" src={fujiCerisiers} alt="" aria-hidden="true" />
      <div className="epv-banniere__haut">
        <span className="epv-banniere__examen"><span aria-hidden="true">🎓</span> {examen.libelle}</span>
        <span className="epv-banniere__pourcent">{examen.pourcent ?? 0} %</span>
      </div>
      <h1 className="epv-banniere__titre">{examen.libelle} du {jourLong(examen.dateExamen)}</h1>
      <p className="epv-banniere__desc">
        {examen.heureExamen ? `À ${examen.heureExamen.slice(0, 5)} · ` : ''}
        {nombre} matière{nombre > 1 ? 's' : ''}. Tes documents sont gardés jusqu’au {jourLong(examen.effacementLe)}.
      </p>
    </header>
  ) : (
    <header className="eb-page__entete">
      <div>
        <h1>{examen.libelle} du {jourLong(examen.dateExamen)}</h1>
        <p className="eb-page__sous-titre">
          {examen.heureExamen ? `À ${examen.heureExamen.slice(0, 5)} · ` : ''}
          Tes documents sont gardés jusqu’au {jourLong(examen.effacementLe)}.
        </p>
      </div>
    </header>
  );

  return (
    <section className={`page controle-page eb-page${illustre ? ' page-decor-enfant epv-illu' : ''}`}>
      <Link to={`/eleves/${eleveId}/matieres#mes-controles`} className="lien-retour">← Mes cours</Link>

      {entete}

      {/* LA BARRE GLOBALE : la moyenne des matières, comme la préparation au brevet. À zéro tant qu'aucun
          programme n'est validé. */}
      <div className="examen-section__global">
        <BarrePreparation pourcent={examen.pourcent ?? 0} perimetreConnu={examen.matieres.some((m) => m.programmeValide)} />
        <p className="examen-section__explication">
          {/* UNE SEULE MATIÈRE SE DIT AU SINGULIER (signalement #69) : « tes 1 matière » sonnait faux. */}
          {nombre > 1 ? `La moyenne de tes ${nombre} matières.` : 'La moyenne de ta matière.'}
        </p>
      </div>

      <ul className="eb-matieres">
        {examen.matieres.map((matiere) => (
          <MatiereExamenBlanc
            key={matiere.id}
            eleveId={eleveId}
            examen={examen}
            matiere={matiere}
            onChange={surChangement}
            ouvert={ouvert}
            onReviser={setOuverture}
          />
        ))}
      </ul>

      <div className="eb-ajouter">
        <button
          type="button"
          className="btn btn--compact"
          disabled={!ouvert}
          title={ouvert ? undefined : 'Les examens blancs sont réservés aux abonnés.'}
          onClick={() => setAjout(true)}
        >
          + Ajouter une matière
        </button>
      </div>

      <div className="eb-supprimer">
        {confirmerSuppression ? (
          <span>
            Supprimer ce {examen.libelle.toLowerCase()} et tous ses documents ?{' '}
            <button type="button" className="eb-matiere__retirer" onClick={supprimer}>Oui, supprimer</button>
            {' · '}
            <button type="button" className="eb-matiere__retirer" onClick={() => setConfirmerSuppression(false)}>Non</button>
          </span>
        ) : (
          <button type="button" className="eb-matiere__retirer" onClick={() => setConfirmerSuppression(true)}>
            Supprimer ce {examen.libelle.toLowerCase()}
          </button>
        )}
      </div>

      {illustre && <img className="epv-pied" src={toriiCerisiers} alt="" aria-hidden="true" />}

      {ouverture && (
        <OuvertureSeance
          eleveId={eleveId}
          calme={calme}
          matiere={matieres.find((m) => m.id === ouverture.matiereId)
            ?? { id: ouverture.matiereId, profPrenom: ouverture.profPrenom ?? 'Ton professeur' }}
          onAnnuler={() => setOuverture(null)}
          onOuvrir={(duree, casque) => navigate(
            `/eleves/${eleveId}/matieres/${ouverture.matiereId}/chat`
            + `?duree=${duree}&casque=${casque ? 1 : 0}`
            + `&mode=controle&controleId=${ouverture.controleId}`,
          )}
        />
      )}

      {ajout && (
        <div className="modale" role="dialog" aria-modal="true" aria-label="Ajouter une matière">
          <div className="modale__boite">
            <ExamenBlancForm
              eleveId={eleveId}
              matieres={matieres}
              libelle={examen.libelle}
              dateFixee={examen.dateExamen}
              heureFixee={examen.heureExamen}
              dejaLa={examen.matieres.map((m) => m.matiereId)}
              onEnregistre={() => { setAjout(false); charger(); }}
              onAnnule={() => setAjout(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
