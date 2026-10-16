import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getMatieresEleve } from '../../lib/api/elevesApi';
import {
  ajouterPage, creerCours, creerScanCours, envoyerCours, etatScanCours, getCours, getQuota, modifierCours, supprimerCours, supprimerPage,
} from '../../lib/api/mesFichesApi';
import { typesPourLeRang } from '../../lib/mesFiches/typesFiches';
import { styleMatiere } from '../../lib/couleurMatiere';
import { styleCategorie, useProprietaireFiches } from '../../lib/mesFiches/espaceFiches';
import { getCategories } from '../../lib/api/espaceParentApi';
import { NouvelleCategorie } from './GestionCategories';
import { reduire, TYPES_ACCEPTES } from '../PieceJointe';
import ScanMobileModale from '../ScanMobileModale';
import { Icone } from '../CopieControle';
import useEleveFiches from './useEleveFiches';
import RenduFiche from './RenduFiche';
import ApercuType from './ApercuType';
import JaugeQuota, { quotaEpuise as plusRien } from './JaugeQuota';
import ForfaitRequis from './ForfaitRequis';
import useAccesForfait from '../../lib/hooks/useAccesForfait';
import { exemplePour } from '../../lib/mesFiches/exemples';
import './mesFiches.css';
import './mesFichesPages.css';

/** Les mêmes plafonds que le serveur (`FichesRevisionEleve`). */
export const PAGES_MAX = 20;
export const PIECES_MAX = 20;

/**
 * UN GROS COURS COMPTE DOUBLE — Camara, le 16/10/2026 : au-delà de ces pages,
 * le cours compte pour 2 dans le quota (`FichesRevisionEleve.PagesCoursSimple`).
 * L'enfant le lit AVANT d'envoyer : c'est le serveur qui décompte et refuse.
 */
export const PAGES_COURS_SIMPLE = 10;

/**
 * UNE ÉTAPE DU PARCOURS — Camara, le 14/10/2026 : « comment je suis censé
 * savoir que je dois sélectionner ma matière ? ». Rien ne le disait : trois
 * blocs côte à côte, qu'on lisait comme des informations.
 *
 * Désormais le titre DIT quoi faire (« Choisis ta matière »), une seule étape
 * est allumée à la fois — son numéro pulse —, celles d'après restent grisées
 * avec la raison (« Choisis d'abord ta matière »), et une étape faite passe au
 * ✓. L'ordre ne se devine plus : il se voit.
 */
function Etape({ id, numero, titre, etat, aide, verrou, refEl, children }) {
  return (
    <section ref={refEl} className={`mf-etape est-${etat}`} aria-labelledby={id} aria-disabled={etat === 'verrouillee' || undefined}>
      <h2 id={id} className="mf-etape__titre">
        <span className="mf-etape__numero" aria-hidden="true">{etat === 'faite' ? '✓' : numero}</span>
        {titre}
      </h2>
      <p className={`mf-etape__aide${etat === 'verrouillee' ? ' est-verrou' : ''}`}>
        {etat === 'verrouillee' ? verrou : aide}
      </p>
      <div className="mf-etape__corps">{children}</div>
    </section>
  );
}

/**
 * Amène une étape sous les yeux, si elle n'y est pas déjà — AU CENTRE de la
 * fenêtre. En haut (`block: 'start'`), elle passait sous la barre de navigation
 * fixe et son titre disparaissait (Camara, le 14/10/2026).
 */
function montrer(element) {
  if (!element?.getBoundingClientRect) return;
  const { top, bottom } = element.getBoundingClientRect();
  if (top < 0 || bottom > window.innerHeight) element.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
}

/**
 * CRÉER UNE FICHE DE RÉVISION — Camara, le 14/10/2026 : « un bouton qui
 * emmène vers une page avec le choix de la matière, le choix du type de fiche
 * et un bouton d'import, avec toutes les possibilités d'import qu'on a déjà ».
 *
 * TROIS ÉTAPES SUR UNE PAGE, dans l'ordre où l'enfant les pense : la matière,
 * le type, puis son cours. Le cours s'importe comme partout ailleurs : un
 * fichier, une photo au téléphone, ou le QR code depuis l'ordinateur.
 *
 * LE BROUILLON NAÎT À LA PREMIÈRE PAGE : chaque page part tout de suite au
 * serveur, qui la vérifie (format, poids, vingt pages en tout) et répond avec
 * une phrase pour l'enfant. La matière et le type RESTENT MODIFIABLES tant que
 * le cours n'est pas envoyé (16/10/2026) : le brouillon est mis à jour, ses
 * pages gardées. « Annuler » efface le brouillon et ramène à ses fiches.
 *
 * COMPLÉTER UN COURS (`?complement=<id>`, 16/10/2026) : la même page, pour
 * les nouvelles pages d'un chapitre déjà commencé. La matière est celle du
 * cours complété, et on y revient en annulant.
 */
/** « Sans catégorie », dans l'espace parent : un choix comme un autre. */
const SANS_CATEGORIE = 'aucune';

export default function NouveauCours() {
  const { eleveId, estParent, chemin } = useProprietaireFiches();
  const naviguer = useNavigate();
  const [recherche] = useSearchParams();
  const complementDe = Number(recherche.get('complement')) || null;
  const [complete, setComplete] = useState(null);
  // Le parent n'a pas de porte de forfait : son droit et ses crédits suffisent.
  const { ouvert: forfaitOuvert } = useAccesForfait(estParent ? null : eleveId);
  const { rang } = useEleveFiches(eleveId);

  const [matieres, setMatieres] = useState(null);
  const [matiereId, setMatiereId] = useState(null);
  const [type, setType] = useState(null);
  const [coursId, setCoursId] = useState(null);
  const [pages, setPages] = useState([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [scanOuvert, setScanOuvert] = useState(false);
  const [apercu, setApercu] = useState(null);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    let vivant = true;
    getQuota(eleveId).then(({ data }) => { if (vivant) setQuota(data); }).catch(() => {});
    return () => { vivant = false; };
  }, [eleveId]);

  // LES PLAFONDS VIENNENT DU SERVEUR, avec la jauge : une famille
  // administratrice n'a pas ceux des autres (Camara, le 16/10/2026). Les
  // constantes ne servent qu'en attendant la réponse.
  const piecesMax = quota?.limites?.piecesMax ?? PIECES_MAX;
  const pagesMax = quota?.limites?.pagesMax ?? PAGES_MAX;

  // Le cours complété : sa matière s'impose, son titre s'affiche.
  useEffect(() => {
    if (!complementDe) return undefined;
    let vivant = true;
    getCours(eleveId, complementDe)
      .then(({ data }) => {
        if (!vivant) return;
        setComplete(data);
        setMatiereId(estParent ? (data.categorieId ?? SANS_CATEGORIE) : data.matiereId);
      })
      .catch(() => { if (vivant) setComplete({ introuvable: true }); });
    return () => { vivant = false; };
  }, [eleveId, complementDe, estParent]);

  const retour = complementDe ? `${chemin}/cours/${complementDe}` : chemin;
  const libelleRetour = complementDe ? '← Mon cours' : estParent ? '← Mes fiches personnelles' : '← Mes fiches de révision';
  const titrePage = complementDe
    ? `Compléter « ${complete?.titre ?? 'mon cours'} »`
    : 'Créer une fiche de révision';
  const fermerApercu = useCallback(() => setApercu(null), []);

  // APRÈS CHAQUE CHOIX, L'ÉTAPE SUIVANTE VIENT SOUS LES YEUX : sur un téléphone,
  // elle est souvent sous le pli, et l'enfant croirait que rien ne se passe.
  const refType = useRef(null);
  const refCours = useRef(null);
  useEffect(() => { if (matiereId) montrer(refType.current); }, [matiereId]);
  useEffect(() => { if (type) montrer(refCours.current); }, [type]);

  const telephone = useMemo(
    () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(pointer: coarse)')?.matches),
    [],
  );

  useEffect(() => {
    let vivant = true;
    // L'ESPACE PARENT (16/10/2026) : ses catégories à lui, et « Sans catégorie ».
    if (estParent) {
      getCategories()
        .then(({ data }) => {
          if (!vivant) return;
          setMatieres([
            ...(Array.isArray(data) ? data : []).map((k) => ({ id: k.id, libelle: k.libelle, couleur: k.couleur })),
            { id: SANS_CATEGORIE, libelle: 'Sans catégorie', couleur: '#475569' },
          ]);
        })
        .catch(() => { if (vivant) setMatieres([{ id: SANS_CATEGORIE, libelle: 'Sans catégorie', couleur: '#475569' }]); });
      return () => { vivant = false; };
    }
    getMatieresEleve(eleveId)
      .then(({ data }) => {
        if (!vivant) return;
        // Ses matières ouvertes, sans la conseillère : on ne fait pas de fiche
        // de révision sur son orientation.
        setMatieres((Array.isArray(data) ? data : []).filter((m) => m.active && m.code !== 'ORIENTATION'));
      })
      .catch(() => { if (vivant) setMatieres([]); });
    return () => { vivant = false; };
  }, [eleveId, estParent]);

  const types = typesPourLeRang(rang ?? NaN);
  const totalPages = pages.reduce((somme, p) => somme + (p.nombrePages || 1), 0);
  const choixFaits = Boolean(matiereId && type);
  const matiereCode = matieres?.find((m) => m.id === matiereId)?.code ?? null;

  // CHANGER D'AVIS APRÈS AVOIR IMPORTÉ — Camara, le 16/10/2026 : la matière et
  // le type restent modifiables tant que le cours n'est pas envoyé. Avant la
  // première page, rien n'existe côté serveur ; après, le brouillon est mis à
  // jour et ses pages restent.
  const changer = async (nouvelleMatiere, nouveauType) => {
    if (!coursId) {
      setMatiereId(nouvelleMatiere);
      setType(nouveauType);
      return;
    }
    if (!nouvelleMatiere || !nouveauType) return;

    setErreur(null);
    try {
      await modifierCours(eleveId, coursId, nouvelleMatiere, nouveauType);
      setMatiereId(nouvelleMatiere);
      setType(nouveauType);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Ton choix n’a pas pu être changé. Tu peux réessayer ?');
    }
  };

  /** Le brouillon, créé à la première page. */
  const brouillon = useCallback(async () => {
    if (coursId) return coursId;
    const { data } = await creerCours(eleveId, matiereId, type, complementDe);
    setCoursId(data.id);
    return data.id;
  }, [coursId, eleveId, matiereId, type, complementDe]);

  const ajouter = async (fichiers) => {
    const retenus = Array.from(fichiers ?? []).slice(0, Math.max(0, piecesMax - pages.length));
    if (retenus.length === 0 || !choixFaits) return;

    setErreur(null);
    setEnvoi(true);

    try {
      const id = await brouillon();
      // Réduites ici, comme en séance : c'est le réseau de l'enfant qui est lent.
      const reduits = await Promise.all(retenus.map((f) => reduire(f).catch(() => f)));
      for (const fichier of reduits) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await ajouterPage(eleveId, id, fichier);
        setPages((liste) => [...liste, data]);
      }
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Ce fichier n’a pas pu être envoyé. Tu peux réessayer ?');
    } finally {
      setEnvoi(false);
    }
  };

  const retirer = async (page) => {
    setErreur(null);
    try {
      await supprimerPage(eleveId, coursId, page.id);
      setPages((liste) => liste.filter((p) => p.id !== page.id));
    } catch {
      setErreur('Cette page n’a pas pu être retirée. Tu peux réessayer ?');
    }
  };

  // ANNULER RAMÈNE À SES FICHES (16/10/2026), et le brouillon part avec : ses
  // pages ne serviront plus. On demande seulement s'il y a des pages à perdre.
  const annuler = async () => {
    // eslint-disable-next-line no-alert
    if (pages.length > 0 && !window.confirm('Abandonner ce cours ? Les pages que tu as importées seront effacées.')) return;
    if (coursId) {
      try { await supprimerCours(eleveId, coursId); } catch { /* le brouillon partira de lui-même sous 24 h */ }
    }
    naviguer(retour);
  };

  const scanner = async () => {
    setErreur(null);
    try {
      await brouillon();
      setScanOuvert(true);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Le QR code n’a pas pu être créé. Tu peux réessayer ?');
    }
  };

  const creerScan = useCallback(() => creerScanCours(eleveId, coursId), [eleveId, coursId]);
  const lireScan = useCallback((jeton) => etatScanCours(eleveId, coursId, jeton), [eleveId, coursId]);
  const recu = useCallback((page) => {
    setPages((liste) => (liste.some((p) => p.id === page.id) ? liste : [...liste, page]));
  }, []);

  const creer = async () => {
    setErreur(null);
    setEnvoi(true);
    try {
      await envoyerCours(eleveId, coursId);
      naviguer(`${chemin}/cours/${coursId}`);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Ton cours n’a pas pu être envoyé. Tu peux réessayer ?');
      setEnvoi(false);
    }
  };

  const plein = pages.length >= piecesMax || totalPages >= pagesMax;
  // Plus aucune fiche, ni du mois ni en réserve : rien ne s'importe. La jauge
  // dit pourquoi, quand ça repart — et à qui demander d'en ajouter.
  const quotaEpuise = plusRien(quota);
  const bloque = envoi || plein || !choixFaits || quotaEpuise;

  // ARRIVÉ ICI SANS PLUS RIEN À CRÉER (lien gardé, page rechargée) : pas une
  // seule étape à l'écran, seulement la jauge et son message (16/10/2026). Un
  // brouillon déjà commencé garde sa page, ses boutons restent grisés.
  // SANS VRAI FORFAIT (16/10/2026) : aucune étape, la raison seulement.
  if (forfaitOuvert === false) {
    return (
      <div className="mf-page">
        <Link to={retour} className="lien-retour">{libelleRetour}</Link>
        <h1 className="mf-titre">{titrePage}</h1>
        <ForfaitRequis />
      </div>
    );
  }

  if (quotaEpuise && !coursId) {
    return (
      <div className="mf-page">
        <Link to={retour} className="lien-retour">{libelleRetour}</Link>
        <h1 className="mf-titre">{titrePage}</h1>
        {estParent ? (
          <p className="mf-credits-parent est-vide" role="status">
            Vous n’avez plus de crédits de fiches. <Link to="/profil?onglet=forfait">Acheter des crédits</Link>
          </p>
        ) : <JaugeQuota quota={quota} />}
      </div>
    );
  }

  return (
    <div className="mf-page">
      <Link to={retour} className="lien-retour">{libelleRetour}</Link>
      <h1 className="mf-titre">{titrePage}</h1>
      {!estParent && <JaugeQuota quota={quota} />}

      <Etape
        id="mf-etape-matiere"
        numero={1}
        titre={estParent ? 'Choisissez une catégorie' : 'Choisis ta matière'}
        etat={matiereId ? 'faite' : 'active'}
        aide={estParent ? 'Touchez une de vos catégories, ou créez-en une.' : 'Touche la matière de ton cours.'}
      >
        {matieres === null ? (
          <p className="champ__aide">{estParent ? 'Chargement de vos catégories…' : 'Chargement de tes matières…'}</p>
        ) : (
          <div className="mf-choix" role="radiogroup" aria-label={estParent ? 'Votre catégorie' : 'Ta matière'}>
            {matieres
              .filter((m) => !complementDe || m.id === (estParent ? (complete?.categorieId ?? SANS_CATEGORIE) : complete?.matiereId))
              .map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={matiereId === m.id}
                disabled={envoi || Boolean(complementDe)}
                className={`mf-choix__matiere${matiereId === m.id ? ' est-choisi' : ''}`}
                style={m.couleur ? styleCategorie(m.couleur) : styleMatiere(m.code)}
                onClick={() => changer(m.id, type)}
              >
                <span className="mf-coche" aria-hidden="true" />
                {m.libelle}
              </button>
            ))}
          </div>
        )}

        {/* Créer une catégorie sur place : elle est choisie aussitôt. */}
        {estParent && !complementDe && matieres !== null && (
          <NouvelleCategorie
            onCreee={(k) => {
              setMatieres((liste) => [
                ...liste.filter((m) => m.id !== SANS_CATEGORIE),
                { id: k.id, libelle: k.libelle, couleur: k.couleur },
                ...liste.filter((m) => m.id === SANS_CATEGORIE),
              ]);
              changer(k.id, type);
            }}
          />
        )}
      </Etape>

      <Etape
        id="mf-etape-type"
        numero={2}
        titre="Choisis ton type de fiche"
        etat={!matiereId ? 'verrouillee' : type ? 'faite' : 'active'}
        aide="Touche la fiche que tu veux."
        verrou="Choisis d’abord ta matière."
        refEl={refType}
      >
        <div className="mf-types" role="radiogroup" aria-label="Ton type de fiche">
          {types.map((t) => {
            const exemple = exemplePour(t.code, matiereCode);
            return (
              <div key={t.code} className={`mf-type-case fdr-feuille--${t.code}${type === t.code ? ' est-choisi' : ''}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={type === t.code}
                  disabled={!matiereId || envoi}
                  className={`mf-type${type === t.code ? ' est-choisi' : ''}`}
                  onClick={() => changer(matiereId, t.code)}
                >
                  <span className="mf-type__texte">
                    <span className="mf-type__nom">{t.libelle}</span>
                    <span className="mf-type__accroche">{t.accroche}</span>
                    {t.decoupe === 'notion' && <span className="mf-type__note">Une fiche par notion</span>}
                  </span>
                  {/* Le choix dit en toutes lettres, posé au pied de l'en-tête :
                      un petit rond seul dans le coin ne se voyait pas (16/10/2026). */}
                  <span className="mf-type__choix" aria-hidden="true">
                    <span className="mf-coche" />
                    {type === t.code ? 'Choisie' : 'Choisir'}
                  </span>
                </button>

                {/* LA MINIATURE — Camara, le 15/10/2026 : voir à quoi ressemble
                    chaque type sans rien toucher. Un vrai exemple, réduit ;
                    décoratif (le bouton dessous l'ouvre en grand) et inerte. */}
                {exemple && (
                  <>
                    <div className="mf-type__miniature" aria-hidden="true" inert>
                      <div className="mf-type__echelle">
                        <RenduFiche fiche={exemple} miniature />
                      </div>
                    </div>
                    <button type="button" className="mf-type__voir" aria-label={`Voir un exemple de ${t.libelle}`} onClick={() => setApercu(t.code)}>
                      Voir un exemple
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Etape>

      <Etape
        id="mf-etape-cours"
        numero={3}
        titre={estParent ? 'Importez votre document' : 'Importe ton cours'}
        etat={!choixFaits ? 'verrouillee' : pages.length > 0 ? 'faite' : 'active'}
        aide={estParent
          ? `Photos ou PDF, ${pagesMax} pages au plus.${quota?.sansLimite ? '' : ` Au-delà de ${PAGES_COURS_SIMPLE} pages, il compte pour 2 crédits.`}`
          : `Une partie ou le chapitre entier : photos ou PDF, ${pagesMax} pages au plus. Au-delà de ${PAGES_COURS_SIMPLE} pages, ton cours compte pour 2.`}
        verrou={matiereId ? 'Choisis d’abord ton type de fiche.' : 'Choisis d’abord ta matière et ton type de fiche.'}
        refEl={refCours}
      >
        {pages.length > 0 && (
          <ul className="cours-controle__liste">
            {pages.map((page) => (
              <li key={page.id} className="cours-controle__document">
                <Icone />
                <span className="cours-controle__nom">{page.nomFichier ?? 'Photo'}</span>
                <span className="cours-controle__etat">
                  {page.nombrePages > 1 ? `${page.nombrePages} pages` : '1 page'}
                </span>
                <button
                  type="button"
                  className="cours-controle__retirer"
                  aria-label={`Retirer ${page.nomFichier ?? 'cette photo'}`}
                  disabled={envoi}
                  onClick={() => retirer(page)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {pages.length > 0 && (
          <p className="champ__aide">{totalPages} page{totalPages > 1 ? 's' : ''} sur {pagesMax}</p>
        )}

        {totalPages > PAGES_COURS_SIMPLE && !estParent && (
          <p className={`mf-poids${(quota?.disponibles ?? 2) < 2 ? ' est-bloquant' : ''}`} role="status">
            <strong>Ton cours fait {totalPages} pages : il comptera pour 2 cours.</strong>{' '}
            {(quota?.disponibles ?? 2) < 2
              ? `Il ne t’en reste qu’un : garde seulement les pages de la leçon (${PAGES_COURS_SIMPLE} au plus), ou demande à tes parents d’acheter des crédits.`
              : `Pour qu’il compte pour 1, garde seulement les pages de la leçon (${PAGES_COURS_SIMPLE} au plus).`}
          </p>
        )}

        {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

        {!plein && (
          <div className="cours-controle__boutons">
            <label className={`btn btn--compact btn--fantome cours-controle__bouton${bloque ? ' est-desactive' : ''}`}>
              <Icone /> {envoi ? 'Envoi…' : 'Importer mon cours'}
              <input
                type="file"
                hidden
                multiple
                disabled={bloque}
                accept={TYPES_ACCEPTES}
                onChange={(e) => { const choisis = e.target.files; ajouter(choisis); e.target.value = ''; }}
              />
            </label>

            {estParent && !telephone ? null : telephone ? (
              <label className={`btn btn--compact btn--fantome cours-controle__bouton${bloque ? ' est-desactive' : ''}`}>
                <Icone scan /> Prendre en photo
                <input
                  type="file"
                  hidden
                  disabled={bloque}
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => { const choisis = e.target.files; ajouter(choisis); e.target.value = ''; }}
                />
              </label>
            ) : (
              <button type="button" className="btn btn--compact btn--fantome cours-controle__bouton" disabled={bloque} onClick={scanner}>
                <Icone scan /> Scanner avec mon téléphone
              </button>
            )}
          </div>
        )}

        {plein && <p className="champ__aide">C’est le maximum pour un cours : retire une page pour en ajouter une autre.</p>}
      </Etape>

      <div className="mf-actions">
        <button type="button" className="btn btn--fantome" disabled={envoi} onClick={annuler}>
          Annuler
        </button>
        <button type="button" className="btn mf-actions__principal" disabled={envoi || pages.length === 0 || quotaEpuise} onClick={creer}>
          {envoi && pages.length > 0 ? 'Un instant…' : 'Créer ma fiche'}
        </button>
      </div>

      {apercu && exemplePour(apercu, matiereCode) && (
        <ApercuType
          exemple={exemplePour(apercu, matiereCode)}
          peutChoisir={Boolean(matiereId)}
          onChoisir={() => { changer(matiereId, apercu); setApercu(null); }}
          onFermer={fermerApercu}
        />
      )}

      {scanOuvert && coursId && (
        <ScanMobileModale
          creer={creerScan}
          lire={lireScan}
          onRecu={recu}
          onFermer={() => setScanOuvert(false)}
        />
      )}
    </div>
  );
}
