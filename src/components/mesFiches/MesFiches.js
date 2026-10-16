import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { entrainementCours, getMesFiches, supprimerCours } from '../../lib/api/mesFichesApi';
import { typeFiche } from '../../lib/mesFiches/typesFiches';
import { styleMatiere } from '../../lib/couleurMatiere';
import { styleCategorie, styleDuCours, useProprietaireFiches } from '../../lib/mesFiches/espaceFiches';
import GestionCategories from './GestionCategories';
import iconeCahier from '../../assets/cahier.webp';
import Loader from '../Loader';
import JaugeQuota, { quotaEpuise } from './JaugeQuota';
import ForfaitRequis from './ForfaitRequis';
import MeTester from './MeTester';
import imageCerveau from '../../assets/me-tester/cerveau.webp';
import './mesFiches.css';
import './mesFichesPages.css';

/**
 * MES FICHES DE RÉVISION — l'espace de l'élève (Camara, le 14/10/2026).
 *
 * RANGÉES PAR MATIÈRE, DU PLUS RÉCENT AU PLUS ANCIEN : c'est la demande de
 * Camara, et c'est ainsi qu'on cherche — « ma fiche de maths d'hier ». La
 * matière qui a reçu le dernier cours passe en premier ; dans chaque matière,
 * les cours vont du plus récent au plus ancien (l'ordre du serveur).
 *
 * UN COURS, PLUSIEURS FICHES : une par notion, et autant de types que l'enfant
 * en a demandé. La carte du cours dit lesquels, et mène à sa page.
 */
export const dateCourte = (valeur) =>
  valeur ? new Date(valeur).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '';

const ETATS = {
  a_lire: 'Lecture de ton cours…',
  notions: 'Choisis tes notions',
  a_generer: 'Tes fiches arrivent…',
  echec: 'À reprendre',
};

/**
 * UNE PILE DE FEUILLES, À LA COULEUR DU TYPE — Camara, le 16/10/2026 : « trop
 * plat ». Trois feuilles décalées, la première rayée comme un cahier, et le
 * nombre de fiches en pastille : on voit d'un coup d'œil ce que le cours a
 * donné. Décorative : le texte de la carte dit déjà tout.
 */
function PileDeFiches({ cours }) {
  const nombre = cours.fiches?.length ?? 0;
  const type = cours.fiches?.[0]?.type ?? cours.type ?? 'classique';
  return (
    <span className={`mf-pile fdr-feuille--${type}`} aria-hidden="true">
      <span className="mf-pile__feuille" />
      <span className="mf-pile__feuille" />
      <span className="mf-pile__feuille">
        <span className="mf-pile__lignes" />
      </span>
      {nombre > 0 && <span className="mf-pile__nombre">{nombre}</span>}
    </span>
  );
}

/** Les types présents dans un cours, avec leur nombre de fiches. */
function typesDuCours(cours) {
  const compte = new Map();
  (cours.fiches ?? []).forEach((f) => compte.set(f.type, (compte.get(f.type) ?? 0) + 1));
  return [...compte.entries()].map(([code, nombre]) => ({ code, nombre, libelle: typeFiche(code)?.libelle ?? code }));
}

export function grouperParMatiere(cours) {
  const groupes = new Map();
  cours.forEach((c) => {
    // L'espace parent range par CATÉGORIE (16/10/2026) ; un cours sans
    // catégorie (la sienne supprimée, ou aucune choisie) va dans « Sans catégorie ».
    const parCategorie = c.matiereId == null;
    const cle = parCategorie ? `categorie-${c.categorieId ?? 'aucune'}` : c.matiereId;
    if (!groupes.has(cle)) {
      groupes.set(cle, {
        id: cle,
        libelle: c.matiereLibelle ?? 'Sans catégorie',
        code: c.matiereCode,
        couleur: parCategorie ? (c.categorieCouleur ?? '#475569') : null,
        cours: [],
      });
    }
    groupes.get(cle).cours.push(c);
  });

  // La matière du cours le plus récent d'abord : le serveur rend les cours du
  // plus récent au plus ancien, l'ordre d'apparition des matières le suit.
  return [...groupes.values()];
}

/**
 * LES CRÉDITS DU PARENT, À LA PLACE DE LA JAUGE DU MOIS (espace parent,
 * 16/10/2026) : il n'a pas de mois à lui, il puise dans les crédits de la
 * famille. Un administrateur n'a rien à compter : pas de jauge.
 */
function CreditsParent({ quota }) {
  if (!quota || quota.sansLimite) return null;
  const n = quota.disponibles ?? 0;
  return (
    <p className={`mf-credits-parent${n <= 0 ? ' est-vide' : ''}`} role="status">
      {n > 0
        ? <><strong>{n} crédit{n > 1 ? 's' : ''}</strong> de fiches disponible{n > 1 ? 's' : ''} : les crédits de votre famille, partagés avec vos enfants.</>
        : <>Vous n’avez plus de crédits de fiches.</>}
      {' '}<Link to="/profil?onglet=forfait">Acheter des crédits</Link>
    </p>
  );
}

export default function MesFiches() {
  const { eleveId, estParent, chemin, retour } = useProprietaireFiches();
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;
    getMesFiches(eleveId)
      .then(({ data }) => { if (vivant) setDonnees(data); })
      .catch(() => { if (vivant) setErreur(estParent ? 'Vos fiches n’ont pas pu être chargées. Rechargez la page.' : 'Tes fiches n’ont pas pu être chargées. Recharge la page.'); });
    return () => { vivant = false; };
  }, [eleveId, estParent]);

  const groupes = useMemo(() => grouperParMatiere(donnees?.cours ?? []), [donnees]);

  // SUPPRIMER UN COURS DEPUIS SA CARTE — Camara, le 16/10/2026 : le cours et
  // toutes ses fiches partent d'un coup. Un cours prêt reste compté dans le
  // mois (le quota compte ce qui a été créé) : on le dit avant, pas après.
  const supprimer = async (cours) => {
    const nombre = cours.fiches?.length ?? 0;
    const quoi = nombre > 1 ? ` et ses ${nombre} fiches` : nombre === 1 ? ' et sa fiche' : '';
    const compte = cours.etat === 'pret' && !estParent ? '\n\nIl restera compté dans tes cours du mois.' : '';
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Supprimer « ${cours.titre ?? 'Ton cours'} »${quoi} ? C’est définitif.${compte}`)) return;

    setErreur(null);
    try {
      await supprimerCours(eleveId, cours.id);
      setDonnees((d) => ({ ...d, cours: d.cours.filter((c) => c.id !== cours.id) }));
    } catch {
      setErreur('Ce cours n’a pas pu être supprimé. Tu peux réessayer ?');
    }
  };

  // PLUS RIEN À CRÉER, PLUS DE BOUTON (Camara, le 16/10/2026) : l'enfant qui a
  // épuisé ses fiches du mois et la réserve ne voit plus « Créer » nulle part.
  // La jauge lui dit pourquoi, et à qui le demander.
  // SANS VRAI FORFAIT (essai, pause, plus d'abonnement — 16/10/2026), la page
  // dit pourquoi et ne montre rien d'autre.
  const fermee = donnees?.forfait === false;
  const peutCreer = Boolean(donnees?.actif) && !fermee && !quotaEpuise(donnees?.quota);

  // « ME TESTER » (16/10/2026) : hors quota, mais un vrai forfait, un cours prêt
  // et au moins une fiche.
  const [aTester, setATester] = useState(null);
  const testable = (cours) => Boolean(donnees?.actif) && !fermee && cours.etat === 'pret' && (cours.fiches?.length ?? 0) > 0;

  return (
    <div className="mf-page">
      {retour && <Link to={retour.to} className="lien-retour">{retour.libelle}</Link>}

      {/* UN BANDEAU, PLUS UNE LIGNE — Camara, le 16/10/2026 : « améliore le
          style du titre ». Carte vitrée, cahier dans une tuile qui flotte,
          « fiches de révision » en dégradé. */}
      <header className="mf-entete">
        <span className="mf-entete__vignette" aria-hidden="true">
          <img className="mf-entete__icone" src={iconeCahier} alt="" />
        </span>
        <div className="mf-entete__texte">
          <span className="mf-entete__surtitre">{estParent ? 'Votre espace parent' : 'Ton espace de révision'}</span>
          {/* « Mes fiches personnelles » dans l'espace parent (Camara, le 16/10/2026). */}
          <h1>Mes <span className="mf-entete__accent">{estParent ? 'fiches personnelles' : 'fiches de révision'}</span></h1>
          <p>
            {estParent
              ? 'Importez un document, choisissez votre fiche : elle est prête en un instant, rangée dans votre catégorie. Elles ne sont visibles que par vous.'
              : 'Importe ton cours, choisis ta fiche : elle est prête en un instant, rangée dans sa matière.'}
          </p>
        </div>
        {/* PAS DE BOUTON EN DOUBLE — Camara, le 14/10/2026 : sans aucune fiche,
            celui de l'encadré « Créer ma première fiche » suffit. */}
        {peutCreer && groupes.length > 0 && (
          <Link to={`${chemin}/nouvelle`} className="btn mf-entete__bouton">
            + Créer une fiche
          </Link>
        )}
      </header>

      {donnees?.actif && fermee && <ForfaitRequis />}

      {donnees?.actif && !fermee && !estParent && <JaugeQuota quota={donnees.quota} />}
      {donnees?.actif && estParent && <CreditsParent quota={donnees.quota} />}

      {/* SES CATÉGORIES, à lui : il les crée, les renomme, les supprime. */}
      {donnees?.actif && estParent && (
        <GestionCategories
          categories={donnees.categories ?? []}
          onChange={(categories) => setDonnees((d) => ({ ...d, categories }))}
          onSupprimee={(id) => setDonnees((d) => ({
            ...d,
            categories: (d.categories ?? []).filter((k) => k.id !== id),
            cours: d.cours.map((c) => (c.categorieId === id ? { ...c, categorieId: null, categorieCouleur: null, matiereLibelle: null } : c)),
          }))}
        />
      )}

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
      {!donnees && !erreur && <Loader />}

      {donnees && !donnees.actif && (
        <p className="mf-vide">Les fiches de révision ne sont pas encore ouvertes.</p>
      )}

      {donnees?.actif && !fermee && groupes.length === 0 && (
        <div className="mf-vide">
          <p><strong>{estParent ? 'Vous n’avez pas encore de fiche.' : 'Tu n’as pas encore de fiche.'}</strong></p>
          {peutCreer && (
            <>
              <p>
                {estParent
                  ? 'Importez un document (photos ou PDF) : vous choisissez le type de fiche et la catégorie, elle est prête en un instant.'
                  : 'Prends ton cours en photo ou importe-le : tu choisis le type de fiche, et elle est prête en un instant.'}
              </p>
              <Link to={`${chemin}/nouvelle`} className="btn">Créer ma première fiche</Link>
            </>
          )}
        </div>
      )}

      {!fermee && groupes.map((groupe) => (
        <section
          key={groupe.id}
          className="mf-matiere"
          style={groupe.couleur ? styleCategorie(groupe.couleur) : styleMatiere(groupe.code)}
          aria-labelledby={`mf-matiere-${groupe.id}`}
        >
          <h2 id={`mf-matiere-${groupe.id}`} className="mf-matiere__titre">
            {groupe.libelle}
            <span className="mf-matiere__compte">
              {groupe.cours.length} cours
            </span>
          </h2>

          <ul className="mf-cours-liste">
            {groupe.cours.map((cours) => (
              <li key={cours.id} className="mf-carte-cours">
                <Link to={`${chemin}/cours/${cours.id}`} className="mf-cours">
                  <PileDeFiches cours={cours} />
                  <span className="mf-cours__texte">
                    <span className="mf-cours__titre">{cours.titre ?? 'Ton cours'}</span>
                    <span className="mf-cours__date">Importé le {dateCourte(cours.dateCreation)}</span>
                    <span className="mf-cours__types">
                    {typesDuCours(cours).map((t) => (
                      <span key={t.code} className={`mf-badge fdr-feuille--${t.code}`}>
                        {t.libelle}{t.nombre > 1 ? ` · ${t.nombre}` : ''}
                      </span>
                    ))}
                    {ETATS[cours.etat] && (
                      <span className={`mf-cours__etat est-${cours.etat}`}>{ETATS[cours.etat]}</span>
                    )}
                    </span>
                  </span>
                </Link>
                {/* HORS DU LIEN : un bouton dans un lien ouvrirait le cours en
                    même temps qu'il le supprime. */}
                <div className="mf-cours__pied">
                  {/* DEUX ACTIONS AU PLUS (16/10/2026) : « Réviser → » passait sous
                      « Compléter ». La carte entière ouvre déjà le cours ; son pied
                      propose de le compléter quand c'est possible, sinon « Réviser »
                      (pour la souris seulement : le clavier a déjà la carte). */}
                  {peutCreer && cours.etat === 'pret' ? (
                    <Link
                      to={`${chemin}/nouvelle?complement=${cours.id}`}
                      className="mf-cours__completer"
                      aria-label={`Compléter le cours « ${cours.titre ?? 'Ton cours'} »`}
                    >
                      Compléter
                    </Link>
                  ) : (
                    <Link
                      to={`${chemin}/cours/${cours.id}`}
                      className="mf-cours__ouvrir"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      Réviser <span className="mf-cours__fleche">→</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    className="mf-cours__supprimer"
                    aria-label={`Supprimer le cours « ${cours.titre ?? 'Ton cours'} » et ses fiches`}
                    onClick={() => supprimer(cours)}
                  >
                    Supprimer
                  </button>
                </div>
                {/* LE SECOND PIED : « ME TESTER » SUR TOUT LE COURS — Camara, le
                    16/10/2026 : flash cards ou quiz, tranquille ou challenge. */}
                {testable(cours) && (
                  <button
                    type="button"
                    className="mf-cours__tester"
                    aria-label={`Me tester sur le cours « ${cours.titre ?? 'Ton cours'} »`}
                    onClick={() => setATester(cours)}
                  >
                    <img className="mf-cerveau" src={imageCerveau} alt="" /> Me tester
                    <span className="mf-cours__tester-modes" aria-hidden="true">Flash cards · Quiz</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {aTester && (
        <MeTester
          titre={aTester.titre ?? 'Ton cours'}
          charger={() => entrainementCours(eleveId, aTester.id)}
          style={styleDuCours(aTester)}
          onFermer={() => setATester(null)}
        />
      )}
    </div>
  );
}
