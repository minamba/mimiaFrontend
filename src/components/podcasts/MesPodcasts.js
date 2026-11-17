import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMesPodcasts, supprimerCoursPodcast } from '../../lib/api/mesPodcastsApi';
import { oublier, suivre } from '../../lib/podcasts/suiviPodcasts';
import { styleDuCours, useProprietairePodcasts } from '../../lib/mesFiches/espaceFiches';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { useVueIllustree } from '../../lib/vueIllustree';
import iconeCasque from '../../assets/casque.webp';
import Loader from '../Loader';
import JaugeQuota, { quotaEpuise } from '../mesFiches/JaugeQuota';
import ForfaitRequis from '../mesFiches/ForfaitRequis';
import { PageNonIncluse } from './PodcastsNonInclus';
import { dateCourte } from '../mesFiches/MesFiches';
import '../mesFiches/mesFiches.css';
import '../mesFiches/mesFichesPages.css';
import './podcasts.css';
import './podcastsIllustre.css';
import { paletteDeMatiere, sceneDeMatiere } from '../../lib/scenesMatieres';
import banniereIllustree from '../../assets/podcasts-illustre/banniere.webp';
import iconeJauge from '../../assets/podcasts-illustre/icone-jauge.webp';
import AchatCredits from '../mesFiches/AchatCredits';

/**
 * MES PODCASTS — l'espace de l'élève (Camara, le 15/11/2026) : ses cours transformés en épisodes audio, lus par le
 * professeur de la matière. Rangés comme ses fiches : PAR MATIÈRE, la plus récente d'abord, et dans chaque matière du
 * plus récent au plus ancien. Un cours = une carte, qui mène à ses épisodes.
 */
const ETATS = {
  a_lire: 'Lecture de ton cours…',
  notions: 'Choisis tes épisodes',
  a_generer: 'Ton podcast s’enregistre…',
  echec: 'À reprendre',
};

/** Les mêmes états, pour le parent dans son espace (15/11/2026). */
const ETATS_PARENT = {
  a_lire: 'Lecture du document…',
  notions: 'Choisissez vos épisodes',
  a_generer: 'Votre podcast s’enregistre…',
  echec: 'À reprendre',
};

/** Par matière pour l'élève ; par catégorie pour le parent (`Sans catégorie` à part). */
function grouper(cours, parent) {
  const groupes = new Map();
  cours.forEach((c) => {
    const cle = parent ? (c.categorieId ?? 'aucune') : c.matiereId;
    if (!groupes.has(cle)) {
      groupes.set(cle, {
        id: cle,
        libelle: c.matiereLibelle ?? (parent ? 'Sans catégorie' : 'Sa matière'),
        style: parent && !c.categorieCouleur ? undefined : styleDuCours(c),
        cours: [],
      });
    }
    groupes.get(cle).cours.push(c);
  });
  return [...groupes.values()];
}

/** Les crédits de podcasts du parent (les mêmes que ceux de ses enfants) ; rien pour un administrateur. */
function CreditsParent({ quota }) {
  if (!quota || quota.sansLimite) return null;
  const n = quota.disponibles ?? 0;
  return (
    <p className={`mf-credits-parent${n <= 0 ? ' est-vide' : ''}`} role="status">
      {n > 0
        ? <><strong>{n} crédit{n > 1 ? 's' : ''}</strong> de podcasts disponible{n > 1 ? 's' : ''} : les crédits de votre famille, partagés avec vos enfants.</>
        : <>Vous n’avez plus de crédits de podcasts.</>}
      {' '}<AchatCredits module="podcasts" className="mf-credits-parent__achat" />
    </p>
  );
}

export default function MesPodcasts() {
  // L'ESPACE PARENT (15/11/2026) : la même page, propriétaire changé.
  const { eleveId, estParent, chemin } = useProprietairePodcasts();
  const enfant = Boolean(sessionEleve());
  const vueIllustree = useVueIllustree();
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState(null);

  const charger = () => getMesPodcasts(eleveId)
    .then(({ data }) => {
      setDonnees(data);
      setErreur(null);
      // Les cours en fabrication rejoignent la barre de toutes les pages (15/11/2026).
      (data?.cours ?? [])
        .filter((c) => c.etat === 'a_lire' || c.etat === 'a_generer')
        .forEach((c) => suivre(eleveId, c.id));
    })
    .catch(() => setErreur(estParent
      ? 'Vos podcasts n’ont pas pu être chargés. Rechargez la page.'
      : 'Tes podcasts n’ont pas pu être chargés. Tu peux réessayer ?'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { charger(); }, [eleveId]);

  // UN PODCAST EN ROUTE SE SUIT TOUT SEUL : la liste se relit tant qu'un cours est en lecture ou en enregistrement.
  const enRoute = useMemo(() => (donnees?.cours ?? []).some((c) => c.etat === 'a_lire' || c.etat === 'a_generer'), [donnees]);
  useEffect(() => {
    if (!enRoute) return undefined;
    const minuteur = setInterval(charger, 6000);
    return () => clearInterval(minuteur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enRoute]);

  const groupes = useMemo(() => grouper(donnees?.cours ?? [], estParent), [donnees, estParent]);

  const supprimer = async (cours) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Supprimer le podcast « ${cours.titre ?? 'ce cours'} » et ses épisodes ?`)) return;
    try {
      await supprimerCoursPodcast(eleveId, cours.id);
      oublier(eleveId, cours.id);
      setDonnees((d) => ({ ...d, cours: d.cours.filter((c) => c.id !== cours.id) }));
    } catch {
      setErreur(estParent ? 'Ce podcast n’a pas pu être supprimé.' : 'Ce podcast n’a pas pu être supprimé. Tu peux réessayer ?');
    }
  };

  if (!donnees && !erreur) return <Loader />;

  const essaiUtilise = donnees?.essai && donnees.essai !== 'libre';
  const fermePourEssai = donnees && !donnees.forfait;
  const peutCreer = donnees?.actif && !donnees.nonInclus && !quotaEpuise(donnees?.quota) && !(fermePourEssai && essaiUtilise);

  // LA PAGE ILLUSTRÉE, D'APRÈS LA MAQUETTE DE CAMARA (15/11/2026) : bannière au garçon casqué, jauge encadrée, une carte
  // par podcast aux couleurs et à la scène de sa matière (lib/scenesMatieres.js). Pour l'enfant, et pour le parent dans
  // l'espace de son enfant (16/11/2026, lib/vueIllustree.js) ; jamais dans l'espace parent.
  const illustre = vueIllustree && !estParent;

  return (
    <div className={`mf-page pod-page${illustre ? ' page-decor-enfant podi' : ''}`}>
      {!estParent && <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">← Mes cours</Link>}

      {illustre ? (
        <div className="podi-banniere" style={{ backgroundImage: `url(${banniereIllustree})` }}>
          <h1 className="podi-banniere__titre">Mes <span>podcasts</span></h1>
          <p className="podi-banniere__sous-titre">
            {enfant
              ? 'Ton cours, raconté par ton professeur : à écouter dans le bus, avant un contrôle, ou les yeux fermés.'
              : 'Son cours, raconté par son professeur : à écouter partout, avant un contrôle.'}
          </p>
          {peutCreer && (
            <Link to={`${chemin}/nouveau`} className="podi-banniere__creer">
              <span className="podi-micro" aria-hidden="true" />
              Créer un podcast
            </Link>
          )}
        </div>
      ) : (
      <>
      {/* LA BANNIÈRE DES PODCASTS — Camara, le 15/11/2026 : « améliore le design du titre ». Les couleurs de la fenêtre
          « Comment veux-tu créer ton podcast ? » : cadre orange → rose → violet, casque dans un halo, ondes sonores. */}
      <div className="pod-entete pod-entete--banniere">
        <span className="pod-entete__icone" aria-hidden="true"><img src={iconeCasque} alt="" /></span>
        <div className="pod-entete__textes">
          <h1 className="mf-titre pod-entete__titre">Mes <span className="pod-entete__accent">podcasts</span></h1>
          <p className="page__sous-titre pod-entete__sous-titre">
            {estParent
              ? 'Vos documents, vos notes ou un livre, racontés par le professeur de votre choix : à écouter partout.'
              : enfant
                ? 'Ton cours, raconté par ton professeur : à écouter dans le bus, avant un contrôle, ou les yeux fermés.'
                : 'Son cours, raconté par son professeur : à écouter partout, avant un contrôle.'}
          </p>
        </div>
        <span className="pod-entete__ondes" aria-hidden="true">
          {[34, 58, 82, 46, 100, 64, 88, 40, 70, 52, 30].map((h, i) => <i key={i} style={{ '--h': `${h}%` }} />)}
        </span>
        {peutCreer && (
          <Link to={`${chemin}/nouveau`} className="btn pod-entete__creer">+ Créer un podcast</Link>
        )}
      </div>
      </>
      )}

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

      {/* PAS DE PODCASTS AVEC STARTER (15/11/2026) : la raison, et rien d'autre. */}
      {donnees?.nonInclus && <PageNonIncluse enfant={enfant} />}

      {donnees && !donnees.nonInclus && !donnees.actif && (
        <div className="mf-vide" role="note"><p>Les podcasts ne sont pas encore ouverts.</p></div>
      )}

      {donnees?.actif && !donnees.nonInclus && fermePourEssai && (!donnees.essai || essaiUtilise) && (
        <ForfaitRequis module="podcasts" essaiUtilise={Boolean(essaiUtilise)} />
      )}

      {donnees?.actif && !donnees.nonInclus && !estParent && !illustre && <JaugeQuota quota={donnees.quota} module="podcasts" />}
      {donnees?.actif && !donnees.nonInclus && illustre && donnees.quota?.maximum > 0 && (
        <div className="podi-jauge">
          <img className="podi-jauge__icone" src={iconeJauge} alt="" />
          <JaugeQuota quota={donnees.quota} module="podcasts" />
        </div>
      )}
      {donnees?.actif && !donnees.nonInclus && estParent && <CreditsParent quota={donnees.quota} />}

      {donnees?.actif && !donnees.nonInclus && groupes.length === 0 && (
        <div className="mf-vide pod-vide">
          <img src={iconeCasque} alt="" className="pod-vide__image" />
          <p><strong>{estParent ? 'Vous n’avez pas encore de podcast.' : enfant ? 'Tu n’as pas encore de podcast.' : 'Pas encore de podcast.'}</strong></p>
          <p>
            {estParent
              ? 'Importez un document, écrivez un sujet ou donnez le titre d’un livre : le professeur de votre choix vous l’explique en quelques minutes.'
              : enfant
              ? 'Importe ton cours ou dis simplement ton sujet : ton professeur l’explique en quelques minutes, à écouter quand tu veux.'
              : 'Importez un cours ou dites un sujet : son professeur l’explique en quelques minutes.'}
          </p>
          {peutCreer && <Link to={`${chemin}/nouveau`} className="btn">Créer mon premier podcast</Link>}
        </div>
      )}

      {groupes.map((groupe) => (
        <section key={groupe.id} className="pod-matiere" style={groupe.style} aria-labelledby={`pod-matiere-${groupe.id}`}>
          <h2 id={`pod-matiere-${groupe.id}`} className="pod-matiere__titre">
            <span className="pod-matiere__pastille" aria-hidden="true" />
            {groupe.libelle}
          </h2>
          <ul className="pod-cartes">
            {groupe.cours.map((c) => (illustre ? (
              <li key={c.id} className={`podi-carte est-${c.etat}`} style={paletteDeMatiere({ code: c.matiereCode })}>
                <Link to={`${chemin}/cours/${c.id}`} className="podi-carte__lien">
                  <span
                    className={`podi-carte__vignette${sceneDeMatiere(c.matiereCode) ? '' : ' est-vide'}`}
                    aria-hidden="true"
                  />
                  <span className="podi-carte__texte">
                    {c.matiereLibelle && <span className="podi-carte__matiere">{c.matiereLibelle}</span>}
                    <strong className="podi-carte__titre">
                      <span className="podi-onde" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                      {c.titre ?? 'Ton cours'}
                    </strong>
                    <span className="podi-carte__meta">
                      <span className="podi-carte__episodes">
                        <span className="podi-icone podi-icone--pile" aria-hidden="true" />
                        {ETATS[c.etat] ?? (c.episodes.length > 1 ? `${c.episodes.length} épisodes` : '1 épisode')}
                      </span>
                      <span className="podi-carte__date">
                        <span className="podi-icone podi-icone--agenda" aria-hidden="true" />
                        {dateCourte(c.dateCreation)}
                      </span>
                    </span>
                  </span>
                  <span className="podi-carte__jouer" aria-hidden="true"><span className="podi-triangle" /></span>
                </Link>
                {c.etat !== 'a_lire' && c.etat !== 'a_generer' && (
                  <button type="button" className="podi-carte__supprimer" aria-label={`Supprimer ${c.titre ?? 'ce podcast'}`} onClick={() => supprimer(c)}>
                    ×
                  </button>
                )}
              </li>
            ) : (
              <li key={c.id} className={`pod-carte est-${c.etat}`}>
                <Link to={`${chemin}/cours/${c.id}`} className="pod-carte__lien">
                  <span className="pod-carte__onde" aria-hidden="true"><span /><span /><span /><span /><span /></span>
                  <span className="pod-carte__texte">
                    <strong className="pod-carte__titre">{c.titre ?? 'Ton cours'}</strong>
                    <span className="pod-carte__meta">
                      {(estParent ? ETATS_PARENT : ETATS)[c.etat] ?? (c.episodes.length > 1 ? `${c.episodes.length} épisodes` : '1 épisode')}
                      {' · '}{dateCourte(c.dateCreation)}
                    </span>
                  </span>
                  <span className="pod-carte__jouer" aria-hidden="true"><span className="pod-icone-jouer" /></span>
                </Link>
                {c.etat !== 'a_lire' && c.etat !== 'a_generer' && (
                  <button type="button" className="pod-carte__supprimer" aria-label={`Supprimer ${c.titre ?? 'ce podcast'}`} onClick={() => supprimer(c)}>
                    ×
                  </button>
                )}
              </li>
            )))}
          </ul>
        </section>
      ))}
    </div>
  );
}
