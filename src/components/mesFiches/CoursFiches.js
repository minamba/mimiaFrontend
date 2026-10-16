import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { demanderFiches, entrainementFiche, getCours, getQuota, supprimerCours, supprimerFiche } from '../../lib/api/mesFichesApi';
import { typeFiche } from '../../lib/mesFiches/typesFiches';
import { imprimerFiche } from '../../lib/mesFiches/impression';
import { styleDuCours, useProprietaireFiches } from '../../lib/mesFiches/espaceFiches';
import RenduFiche from './RenduFiche';
import AjusteALEcran from './AjusteALEcran';
import Visionneuse from './Visionneuse';
import MenuNotions, { BoutonNotions } from './MenuNotions';
import JaugeQuota, { quotaEpuise } from './JaugeQuota';
import ForfaitRequis from './ForfaitRequis';
import SuiviComplement from './SuiviComplement';
import MeTester from './MeTester';
import imageCerveau from '../../assets/me-tester/cerveau.webp';
import useAccesForfait from '../../lib/hooks/useAccesForfait';
import useGlissement from '../../lib/hooks/useGlissement';
import { dateCourte } from './MesFiches';
import Loader from '../Loader';
import './mesFiches.css';
import './mesFichesPages.css';

/** Le temps entre deux relevés, tant que le cours est lu ou que ses fiches s'écrivent. */
const INTERVALLE = 3000;

const EN_COURS = ['a_lire', 'a_generer'];

/** L'astuce « glisse la fiche » s'efface pour de bon dès le premier glissement. */
const CLE_ASTUCE = 'mimia.fiches.glissement-compris';

function astuceDejaComprise() {
  try {
    return window.localStorage.getItem(CLE_ASTUCE) === '1';
  } catch {
    return false;
  }
}

/**
 * Les notions à cocher : toutes cochées d'abord — l'enfant décoche ce qu'il ne
 * veut pas réviser (Camara, le 14/10/2026). Aucune limite : toutes les fiches
 * d'un cours ne comptent que pour UN cours dans le quota (16/10/2026).
 */
function ChoixNotions({ notions, choisies, onChange, disabled, complement = false }) {
  const basculer = (rang) => onChange(
    choisies.includes(rang) ? choisies.filter((r) => r !== rang) : [...choisies, rang].sort((a, b) => a - b),
  );

  return (
    <ul className="mf-notions">
      {notions.map((notion, i) => {
        const rang = i + 1;
        return (
          <li key={notion.titre}>
            <label className={`mf-notion${choisies.includes(rang) ? ' est-choisie' : ''}`}>
              <input
                type="checkbox"
                checked={choisies.includes(rang)}
                disabled={disabled}
                onChange={() => basculer(rang)}
              />
              <span>
                <strong>{notion.titre}</strong>
                {notion.resume && <span className="mf-notion__resume">{notion.resume}</span>}
                {/* Un complément : la notion est déjà dans le cours (16/10/2026). */}
                {complement && notion.rang && (
                  <span className="mf-notion__deja">Déjà dans ton cours : sa fiche sera remplacée par la nouvelle</span>
                )}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * UNE FICHE DÉJÀ FAITE DE QUESTIONS ET RÉPONSES se joue en flash cards sans
 * rien demander au serveur (16/10/2026) : ses cartes sont là. Null sinon.
 */
function cartesDeLaFiche(fiche) {
  if (fiche?.type !== 'questions') return null;
  const cartes = (fiche.blocs ?? [])
    .filter((b) => b?.type === 'questions')
    .flatMap((b) => b.questions ?? [])
    .filter((q) => q?.question && q?.reponse)
    .map((q) => ({ question: q.question, reponse: q.reponse, explication: q.exemple ?? null }));
  return cartes.length > 0 ? cartes : null;
}

/**
 * UN COURS ET SES FICHES — la page où l'enfant arrive après avoir envoyé son
 * cours, et où il revient pour réviser.
 *
 * ELLE SUIT LE COURS DANS SA VIE : lecture (« je lis ton cours »), choix des
 * notions s'il y en a plusieurs, fiches qui arrivent l'une après l'autre,
 * puis la lecture des fiches, notion par notion, avec des flèches. Tant que
 * le cours est lu ou que ses fiches s'écrivent, la page se relit toute seule.
 *
 * LE COURS N'EST PAS GARDÉ (Camara, le 15/10/2026) : ses pages sont effacées
 * dès que ses fiches sont faites. Pour un autre type, l'enfant le réimporte.
 */
export default function CoursFiches() {
  const { coursId } = useParams();
  // L'élève de l'adresse, ou le parent dans son espace (16/10/2026).
  const { eleveId, estParent, chemin } = useProprietaireFiches();
  const naviguer = useNavigate();
  const { ouvert: forfaitOuvert } = useAccesForfait(estParent ? null : eleveId);

  const [cours, setCours] = useState(null);
  const [erreur, setErreur] = useState(null);
  // NULL = TOUTES COCHÉES, dès le premier affichage : un effet qui les cochait
  // après coup les montrait un instant décochées.
  const [choixFait, setChoisies] = useState(null);
  const [typeVu, setTypeVu] = useState(null);
  const [rangVu, setRangVu] = useState(0);
  // D'où arrive la fiche affichée : elle entre par ce côté (16/10/2026).
  const [sens, setSens] = useState(null);
  const [astuceComprise, setAstuceComprise] = useState(astuceDejaComprise);
  const [envoi, setEnvoi] = useState(false);
  // La fiche en grand, où l'on zoome (16/10/2026).
  const [enGrand, setEnGrand] = useState(false);
  // Les notions en panneau, sur téléphone (16/10/2026).
  const [menuNotions, setMenuNotions] = useState(false);
  // Flash cards et quiz sur la fiche regardée (16/10/2026).
  const [aTester, setATester] = useState(false);
  // Où la feuille est affichée : la barre d'actions s'aligne sur ses bords.
  const [placeFeuille, setPlaceFeuille] = useState(null);
  const placer = useCallback((p) => {
    setPlaceFeuille((avant) => (avant?.gauche === p?.gauche && avant?.largeur === p?.largeur ? avant : p));
  }, []);
  const [quota, setQuota] = useState(null);

  // LE SOMMAIRE COLLE SOUS LA BARRE DU SITE (16/10/2026) : elle est elle-même
  // collée en haut de l'écran ; collé à 16 px du haut, le sommaire passait
  // dessous et semblait ne pas suivre. Sa hauteur varie avec l'écran : on la mesure.
  const [hautNavbar, setHautNavbar] = useState(0);
  useEffect(() => {
    const barre = document.querySelector('.navbar');
    if (!barre) return undefined;
    const mesurer = () => setHautNavbar(barre.offsetHeight);
    mesurer();
    const observateur = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(mesurer);
    observateur?.observe(barre);
    return () => observateur?.disconnect();
  }, []);

  const charger = useCallback(async () => {
    try {
      const { data } = await getCours(eleveId, coursId);
      setCours(data);
    } catch (e) {
      setErreur(e?.response?.status === 404 ? 'Ce cours n’existe plus.' : 'Ce cours n’a pas pu être chargé. Recharge la page.');
    }
  }, [eleveId, coursId]);

  useEffect(() => { charger(); }, [charger]);

  const enCours = EN_COURS.includes(cours?.etat);
  // Le cours se relit aussi tant que son complément se prépare : ses fiches
  // arrivent ici (16/10/2026).
  const complementEnRoute = ['a_lire', 'notions', 'a_generer'].includes(cours?.complement?.etat);
  const aRelire = enCours || complementEnRoute;
  useEffect(() => {
    if (!aRelire) return undefined;
    const minuteur = setInterval(charger, INTERVALLE);
    return () => clearInterval(minuteur);
  }, [aRelire, charger]);

  // UN COMPLÉMENT N'A PAS DE PAGE À LUI une fois prêt : ses fiches sont dans
  // le cours complété, on y va.
  const versComplete = cours?.complementDe ? `${chemin}/cours/${cours.complementDe}` : null;
  useEffect(() => {
    if (versComplete && cours?.etat === 'pret') naviguer(versComplete, { replace: true });
  }, [versComplete, cours?.etat, naviguer]);

  // Le quota sert à savoir s'il faut encore proposer de créer (cours fini,
  // brouillon) : on le lit dans ces états-là.
  const doitChoisir = ['pret', 'echec', 'brouillon'].includes(cours?.etat);
  useEffect(() => {
    if (!doitChoisir) return undefined;
    let vivant = true;
    getQuota(eleveId).then(({ data }) => { if (vivant) setQuota(data); }).catch(() => { if (vivant) setQuota({}); });
    return () => { vivant = false; };
  }, [doitChoisir, eleveId]);

  const nombreNotions = cours?.notions?.length ?? 0;
  const choisies = useMemo(
    () => choixFait ?? Array.from({ length: nombreNotions }, (_, i) => i + 1),
    [choixFait, nombreNotions],
  );

  const fiches = useMemo(() => cours?.fiches ?? [], [cours]);
  const typesPresents = useMemo(() => [...new Set(fiches.map((f) => f.type))], [fiches]);

  // Le type affiché : celui de la dernière demande s'il a des fiches, sinon le premier présent.
  const typeAffiche = typeVu && typesPresents.includes(typeVu)
    ? typeVu
    : (typesPresents.includes(cours?.type) ? cours?.type : typesPresents[0]);

  const fichesDuType = useMemo(
    () => fiches
      .filter((f) => f.type === typeAffiche)
      .sort((a, b) => (a.notionRang ?? 0) - (b.notionRang ?? 0) || new Date(b.dateCreation) - new Date(a.dateCreation)),
    [fiches, typeAffiche],
  );

  const indexVu = Math.min(rangVu, Math.max(0, fichesDuType.length - 1));
  const ficheVue = fichesDuType[indexVu];
  const ficheAffichee = ficheVue && {
    id: ficheVue.id,
    type: ficheVue.type,
    matiere: cours?.matiereLibelle,
    titre: ficheVue.titre,
    cours: cours?.titre,
    position: ficheVue.notionRang ? { rang: ficheVue.notionRang, total: ficheVue.notionTotal } : null,
    blocs: ficheVue.blocs,
  };

  // Toute navigation passe ici : la fiche arrive du côté d'où elle vient.
  const allerA = (i) => {
    if (i === indexVu || i < 0 || i >= fichesDuType.length) return;
    setSens(i > indexVu ? 'suivante' : 'precedente');
    setRangVu(i);
  };

  // GLISSER SUR TÉLÉPHONE (Camara, le 16/10/2026) : la fiche suivante sans
  // viser les boutons. Elle se lit en colonne, souvent jusqu'en bas : la
  // suivante reprend à son début, pas au milieu.
  const lecteur = useRef(null);
  const remonterAuDebut = () => {
    const haut = lecteur.current?.getBoundingClientRect().top;
    if (haut != null && haut < hautNavbar) {
      const doux = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      window.scrollBy?.({ top: haut - hautNavbar - 12, behavior: doux ? 'smooth' : 'auto' });
    }
  };
  const glisserVers = (i) => {
    if (i < 0 || i >= fichesDuType.length) return;
    allerA(i);
    if (!astuceComprise) {
      setAstuceComprise(true);
      try { window.localStorage.setItem(CLE_ASTUCE, '1'); } catch { /* navigation privée : l'astuce reviendra */ }
    }
    remonterAuDebut();
  };
  const glissement = useGlissement({
    onVersLaGauche: () => glisserVers(indexVu + 1),
    onVersLaDroite: () => glisserVers(indexVu - 1),
  });

  // La progression de la demande en cours : les fiches de ce type écrites depuis la demande.
  const attendues = typeFiche(cours?.type)?.decoupe === 'notion' ? (cours?.notionsDemandees?.length || 1) : 1;
  const pretes = cours?.demandeLe
    ? fiches.filter((f) => f.type === cours.type && new Date(f.dateCreation) >= new Date(cours.demandeLe)).length
    : 0;

  const demander = async (type, rangs) => {
    setErreur(null);
    setEnvoi(true);
    try {
      await demanderFiches(eleveId, coursId, type, rangs);
      // Les fiches d'un complément s'écrivent dans le cours complété : on les y attend.
      if (versComplete) {
        naviguer(versComplete);
        return;
      }
      setTypeVu(type);
      setRangVu(0);
      await charger();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Ta demande n’a pas pu être envoyée. Tu peux réessayer ?');
    } finally {
      setEnvoi(false);
    }
  };

  const effacerFiche = async (fiche) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Supprimer cette fiche ?')) return;
    try {
      await supprimerFiche(eleveId, fiche.id);
      setRangVu(0);
      await charger();
    } catch {
      setErreur('Cette fiche n’a pas pu être supprimée.');
    }
  };

  const effacerCours = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Supprimer ce cours et toutes ses fiches ?')) return;
    try {
      await supprimerCours(eleveId, coursId);
      naviguer(chemin);
    } catch {
      setErreur('Ce cours n’a pas pu être supprimé.');
    }
  };

  // SANS VRAI FORFAIT (16/10/2026) : la page d'un cours ne s'ouvre pas non plus.
  if (forfaitOuvert === false) {
    return (
      <div className="mf-page">
        <Link to={chemin} className="lien-retour">{estParent ? '← Mes fiches personnelles' : '← Mes fiches de révision'}</Link>
        <ForfaitRequis />
      </div>
    );
  }

  if (!cours) {
    return (
      <div className="mf-page">
        <Link to={chemin} className="lien-retour">{estParent ? '← Mes fiches personnelles' : '← Mes fiches de révision'}</Link>
        {erreur ? <p className="champ__erreur" role="alert">{erreur}</p> : <Loader />}
      </div>
    );
  }

  const typeDemande = typeFiche(cours.type);

  const complementEnEchec = cours.complement?.etat === 'echec';

  return (
    <div className="mf-page" style={styleDuCours(cours)}>
      {versComplete
        ? <Link to={versComplete} className="lien-retour">← Mon cours</Link>
        : <Link to={chemin} className="lien-retour">{estParent ? '← Mes fiches personnelles' : '← Mes fiches de révision'}</Link>}

      <header className="mf-cours-entete">
        <p className="mf-cours-entete__matiere">{cours.matiereLibelle}</p>
        <h1 className="mf-titre">
          {versComplete ? `Compléter « ${cours.complementDeTitre ?? 'ton cours'} »` : (cours.titre ?? 'Ton cours')}
        </h1>
        <p className="mf-cours-entete__date">
          Importé le {dateCourte(cours.dateCreation)}
          {fiches.length > 0 && (
            <span className="mf-cours-entete__nombre"> · {fiches.length} fiche{fiches.length > 1 ? 's' : ''}</span>
          )}
        </p>
      </header>

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

      {cours.etat === 'brouillon' && (
        <div className="mf-etat">
          <p>Ce cours n’a pas encore été envoyé.</p>
          {!quotaEpuise(quota) && (
            <Link to={`${chemin}/nouvelle`} className="btn">Créer une fiche</Link>
          )}
        </div>
      )}

      {cours.etat === 'a_lire' && (
        <div className="mf-etat mf-etat--attente" role="status">
          <span className="mf-etat__roue" aria-hidden="true" />
          <p><strong>Je lis ton cours…</strong></p>
          <p>Je repère les notions qu’il contient. Ça prend quelques secondes.</p>
        </div>
      )}

      {cours.etat === 'notions' && (
        <section className="mf-etat" aria-labelledby="mf-notions-titre">
          <h2 id="mf-notions-titre" className="mf-etape__titre">
            Ton cours contient {nombreNotions} notions
          </h2>
          <p className="champ__aide">
            Une {typeDemande?.libelle.toLowerCase() ?? 'fiche'} par notion. Décoche celles que tu ne veux pas réviser.
            {' '}Toutes ensemble, elles ne comptent que pour un seul cours.
            {versComplete && ' Les nouvelles notions s’ajoutent à la suite de ton cours ; celles qu’il avait déjà sont remplacées.'}
          </p>
          <ChoixNotions
            notions={cours.notions}
            choisies={choisies}
            onChange={setChoisies}
            disabled={envoi}
            complement={Boolean(versComplete)}
          />
          <div className="mf-actions">
            <button type="button" className="btn mf-actions__principal" disabled={envoi || choisies.length === 0} onClick={() => demander(cours.type, choisies)}>
              {choisies.length > 1 ? `Créer mes ${choisies.length} fiches` : 'Créer ma fiche'}
            </button>
          </div>
        </section>
      )}

      {cours.etat === 'a_generer' && (
        <div className="mf-etat mf-etat--attente" role="status">
          <span className="mf-etat__roue" aria-hidden="true" />
          <p><strong>{attendues > 1 ? `Fiche ${Math.min(pretes + 1, attendues)} sur ${attendues} en préparation…` : 'Ta fiche est en préparation…'}</strong></p>
          <p>Elle apparaît ici dès qu’elle est prête.</p>
        </div>
      )}

      {cours.remarque && cours.etat !== 'a_lire' && (
        <p className={`mf-remarque${cours.etat === 'echec' ? ' est-echec' : ''}`} role="alert">{cours.remarque}</p>
      )}

      {fiches.length > 0 && (
        <section className="mf-lecture" aria-label="Tes fiches">
          {typesPresents.length > 1 && (
            <div className="mf-onglets" role="tablist" aria-label="Type de fiche">
              {typesPresents.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="tab"
                  aria-selected={code === typeAffiche}
                  className={`mf-onglet fdr-feuille--${code}${code === typeAffiche ? ' est-choisi' : ''}`}
                  onClick={() => { setTypeVu(code); setRangVu(0); }}
                >
                  {typeFiche(code)?.libelle ?? code}
                </button>
              ))}
            </div>
          )}

          {/* LA BARRE DE NAVIGATION, SEULE ET CENTRÉE — Camara, le 16/10/2026.
              Les actions de la fiche ont leur propre barre, au-dessus d'elle. */}
          {ficheVue?.blocs && fichesDuType.length > 1 && (
          <div className="mf-barre fdr-sans-impression">
          {fichesDuType.length > 1 && (
            <nav className="mf-navigation" aria-label="Notions">
              <button type="button" className="mf-navigation__bouton" disabled={indexVu === 0} onClick={() => allerA(indexVu - 1)}>
                <span aria-hidden="true">←</span>
                <span className="mf-navigation__mot">Précédente</span>
              </button>
              {/* « Fiche 2 sur 4 » en entier, « 2 / 4 » sur téléphone (16/10/2026) : la
                  phrase longue reste lue par les lecteurs d'écran. */}
              <span className="mf-navigation__position">
                {/* Un point par fiche : on saute directement à celle qu'on veut. */}
                <span className="mf-points">
                  {fichesDuType.map((f, i) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`mf-point${i === indexVu ? ' est-courant' : ''}`}
                      aria-label={`Aller à la fiche ${i + 1}`}
                      aria-current={i === indexVu ? 'true' : undefined}
                      onClick={() => allerA(i)}
                    />
                  ))}
                </span>
                <span className="mf-navigation__long">Fiche {indexVu + 1} sur {fichesDuType.length}</span>
                <span className="mf-navigation__court" aria-hidden="true">{indexVu + 1} / {fichesDuType.length}</span>
              </span>
              <button type="button" className="mf-navigation__bouton" disabled={indexVu >= fichesDuType.length - 1} onClick={() => allerA(indexVu + 1)}>
                <span className="mf-navigation__mot">Suivante</span>
                <span aria-hidden="true">→</span>
              </button>
            </nav>
          )}

          </div>
          )}

          {/* Sur téléphone seulement, jusqu'au premier glissement. */}
          {ficheVue?.blocs && fichesDuType.length > 1 && !astuceComprise && (
            <p className="mf-astuce-glisser fdr-sans-impression">
              <span aria-hidden="true">👆</span>
              {estParent ? 'Glissez la fiche du doigt pour passer à la suivante' : 'Glisse la fiche du doigt pour passer à la suivante'}
            </p>
          )}

          {ficheVue?.blocs && (
            <>

              {/* LE SOMMAIRE DES NOTIONS À GAUCHE — Camara, le 16/10/2026 : « la
                  liste des notions cliquables, pour aller directement à la fiche
                  qui nous intéresse ; celle qu'on regarde a un effet visuel ».
                  Sur un écran étroit, il s'efface : les points de la barre font
                  le même travail. */}
              <div className={`mf-lecteur${fichesDuType.length > 1 ? ' a-un-sommaire' : ''}`}>
              {fichesDuType.length > 1 && (
                <nav
                  className="mf-sommaire fdr-sans-impression"
                  aria-label="Les fiches de ce cours"
                  style={{ '--haut-sommaire': `${hautNavbar + 16}px` }}
                >
                  <p className="mf-sommaire__titre">Les notions</p>
                  <ol className="mf-sommaire__liste">
                    {fichesDuType.map((f, i) => (
                      <li key={f.id}>
                        <button
                          type="button"
                          className={`mf-sommaire__notion${i === indexVu ? ' est-courante' : ''}`}
                          aria-current={i === indexVu ? 'true' : undefined}
                          onClick={() => allerA(i)}
                        >
                          <span className="mf-sommaire__numero" aria-hidden="true">{f.notionRang ?? i + 1}</span>
                          <span className="mf-sommaire__nom">{f.titre}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="mf-lecteur__fiche" ref={lecteur} {...(fichesDuType.length > 1 ? glissement : {})}>
              {/* LES ACTIONS DE LA FICHE, AU-DESSUS D'ELLE — Camara, le 16/10/2026 :
                  dans la barre de navigation, elles la décentraient. La barre du
                  haut dit OÙ l'on est ; celle-ci, ce qu'on fait de CETTE fiche. */}
                <div
                  className="mf-fiche-actions mf-outils fdr-sans-impression"
                  style={placeFeuille ? { marginLeft: placeFeuille.gauche, width: placeFeuille.largeur } : undefined}
                >
                  <button type="button" className="btn btn--compact mf-bouton-tester" onClick={() => setATester(true)}>
                    <img className="mf-cerveau" src={imageCerveau} alt="" /> Me tester
                  </button>
                  <button
                    type="button"
                    className="btn btn--compact"
                    onClick={() => imprimerFiche({ titre: ficheVue.titre, matiere: cours.matiereLibelle, dateCreation: ficheVue.dateCreation })}
                  >
                    <span className="mf-action__long">Imprimer ou enregistrer en PDF</span>
                    <span className="mf-action__court" aria-hidden="true">Imprimer / PDF</span>
                  </button>
                  <button type="button" className="btn btn--compact mf-bouton-supprimer" onClick={() => effacerFiche(ficheVue)}>
                    <span className="mf-action__long">Supprimer cette fiche</span>
                    <span className="mf-action__court" aria-hidden="true">Supprimer</span>
                  </button>
                </div>

              {/* « AGRANDIR » DANS LE COIN DE LA FICHE — Camara, le 16/10/2026 :
                  il était mal placé dans la barre ; il appartient à la feuille. */}
              <div key={ficheVue.id} className={`mf-arrivee${sens ? ` mf-arrivee--${sens}` : ''}`}>
              <AjusteALEcran
                type={ficheVue.type}
                aGauche={fichesDuType.length > 1}
                onFeuille={placer}
                coin={(
                  <span className="mf-coin">
                    {/* Le sommaire, quand il n'a plus sa colonne (CSS : sous 900 px). */}
                    {fichesDuType.length > 1 && <BoutonNotions onClick={() => setMenuNotions(true)} />}
                    <button type="button" className="mf-agrandir-coin" onClick={() => setEnGrand(true)}>
                      <span aria-hidden="true">⤢</span>
                      <span className="mf-agrandir-coin__mot">Agrandir</span>
                    </button>
                  </span>
                )}
              >
                <RenduFiche fiche={ficheAffichee} />
              </AjusteALEcran>
              </div>
              </div>
              </div>

              {aTester && (
                <MeTester
                  titre={ficheVue.titre}
                  charger={() => entrainementFiche(eleveId, ficheVue.id)}
                  cartesLocales={cartesDeLaFiche(ficheVue)}
                  onFermer={() => setATester(false)}
                />
              )}

              {menuNotions && fichesDuType.length > 1 && (
                <MenuNotions
                  fiches={fichesDuType}
                  indexVu={indexVu}
                  style={styleDuCours(cours)}
                  onChoisir={(i) => { setMenuNotions(false); allerA(i); window.requestAnimationFrame?.(remonterAuDebut); }}
                  onFermer={() => setMenuNotions(false)}
                />
              )}

              {enGrand && (
                <Visionneuse
                  fiche={ficheAffichee}
                  position={{ rang: indexVu + 1, total: fichesDuType.length }}
                  onPrecedente={indexVu > 0 ? () => allerA(indexVu - 1) : null}
                  onSuivante={indexVu < fichesDuType.length - 1 ? () => allerA(indexVu + 1) : null}
                  onFermer={() => setEnGrand(false)}
                />
              )}
            </>
          )}
        </section>
      )}

      {/* COMPLÉTER CE COURS — Camara, le 16/10/2026 : l'enfant reçoit son
          chapitre en plusieurs fois ; les fiches des nouvelles pages s'ajoutent
          à la suite, une notion déjà faite est remplacée. Compte comme un cours. */}
      {!versComplete && cours.etat === 'pret' && (
        <section className="mf-autre mf-completer" aria-labelledby="mf-completer-titre">
          <h2 id="mf-completer-titre" className="mf-etape__titre">Tu as la suite de ce cours ?</h2>
          <p className="champ__aide">
            Importe les nouvelles pages : leurs fiches s’ajoutent à la suite de celles-ci.
            Une notion que tu avais déjà est remplacée par sa nouvelle version.
          </p>

          {/* Le suivi du complément s'affiche au milieu de l'écran (SuiviComplement). */}
          {cours.complement?.etat === 'notions' && (
            <div className="mf-actions">
              <Link to={`${chemin}/cours/${cours.complement.id}`} className="btn">Choisir mes notions</Link>
            </div>
          )}

          {complementEnEchec && cours.complement.remarque && (
            <p className="mf-remarque est-echec" role="alert">{cours.complement.remarque}</p>
          )}

          {!complementEnRoute && (quotaEpuise(quota) ? (
            estParent ? null : <JaugeQuota quota={quota} />
          ) : (
            <div className="mf-actions">
              <Link to={`${chemin}/nouvelle?complement=${cours.id}`} className="btn">
                Compléter ce cours
              </Link>
            </div>
          ))}
        </section>
      )}

      {(versComplete ? cours.etat === 'echec' : cours.etat === 'echec') && (
        <section className="mf-autre" aria-labelledby="mf-autre-titre">
          <h2 id="mf-autre-titre" className="mf-etape__titre">On réessaie ?</h2>
          <p className="champ__aide">
            Ton cours n’est pas gardé : ses pages ont été effacées. Importe-le à nouveau pour créer tes fiches.
          </p>
          {/* Plus rien à créer : pas de bouton, la jauge dit pourquoi (16/10/2026). */}
          {quotaEpuise(quota) ? (
            estParent ? null : <JaugeQuota quota={quota} />
          ) : (
            <div className="mf-actions">
              <Link
                to={versComplete ? `${chemin}/nouvelle?complement=${cours.complementDe}` : `${chemin}/nouvelle`}
                className="btn"
              >
                {versComplete ? 'Réimporter la suite' : 'Importer mon cours'}
              </Link>
            </div>
          )}
        </section>
      )}

      {!versComplete && <SuiviComplement eleveId={eleveId} complement={cours.complement} />}

      {!versComplete && (
        <div className="mf-pied">
          <button type="button" className="mf-lien-danger" onClick={effacerCours}>Supprimer ce cours et ses fiches</button>
        </div>
      )}
    </div>
  );
}
