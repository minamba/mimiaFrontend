import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMatieresEleve } from '../../lib/api/elevesApi';
import {
  ajouterPagePodcast, creerCoursPodcast, creerScanPodcast, ecrireLivrePodcast, ecrireTextePodcast, envoyerCoursPodcast, etatScanPodcast,
  getProfesseursPodcast,
  getQuotaPodcasts, modifierCoursPodcast, supprimerCoursPodcast, supprimerPagePodcast,
} from '../../lib/api/mesPodcastsApi';
import { suivre } from '../../lib/podcasts/suiviPodcasts';
import { styleMatiere } from '../../lib/couleurMatiere';
import { styleCategorie, useProprietairePodcasts } from '../../lib/mesFiches/espaceFiches';
import { getCategories } from '../../lib/api/espaceParentApi';
import { NouvelleCategorie } from '../mesFiches/GestionCategories';
import Avatar from '../Avatar';
import { reduire, TYPES_ACCEPTES } from '../PieceJointe';
import ScanMobileModale from '../ScanMobileModale';
import { Icone } from '../CopieControle';
import JaugeQuota, { quotaEpuise as plusRien } from '../mesFiches/JaugeQuota';
import ForfaitRequis from '../mesFiches/ForfaitRequis';
import { PageNonIncluse } from './PodcastsNonInclus';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import useAccesForfait from '../../lib/hooks/useAccesForfait';
import ChoixModeFiche, { MODE_LIBRE, MODE_LIVRE } from '../mesFiches/ChoixModeFiche';
import SaisieLibre from '../mesFiches/SaisieLibre';
import '../mesFiches/mesFiches.css';
import '../mesFiches/mesFichesPages.css';
import './podcasts.css';

/** Les mêmes plafonds que le serveur (`PodcastsEleve`), en attendant sa réponse. */
export const PAGES_MAX_PODCAST = 40;
export const PIECES_MAX_PODCAST = 40;
export const PAGES_COURS_SIMPLE = 10;
const TEXTE_MIN = 3;
const TEXTE_MAX = 15000;
/** Le résumé de livre (15/11/2026) : les plafonds du serveur (`PodcastsEleve`). */
const TITRE_LIVRE_MIN = 2;
const TITRE_LIVRE_MAX = 200;
const AUTEUR_LIVRE_MAX = 120;

/** Le professeur de français, choisi d'avance pour un résumé de livre (Camara : « Français, modifiable »). */
/** Le parent range ses podcasts dans ses catégories, ou nulle part (comme ses fiches). */
const SANS_CATEGORIE = 'aucune';

export const estLeFrancais = (m) => m?.code === 'FRANCAIS' || /^fran[cç]ais$/i.test((m?.libelle ?? '').trim());

/** Une étape du parcours, comme sur la page des fiches : une seule allumée, celles d'après grisées avec la raison. */
function Etape({ id, numero, titre, etat, aide, verrou, refEl, children }) {
  return (
    <section ref={refEl} className={`mf-etape est-${etat}`} aria-labelledby={id} aria-disabled={etat === 'verrouillee' || undefined}>
      <h2 id={id} className="mf-etape__titre">
        <span className="mf-etape__numero" aria-hidden="true">{etat === 'faite' ? '✓' : numero}</span>
        {titre}
      </h2>
      <p className={`mf-etape__aide${etat === 'verrouillee' ? ' est-verrou' : ''}`}>{etat === 'verrouillee' ? verrou : aide}</p>
      <div className="mf-etape__corps">{children}</div>
    </section>
  );
}

/**
 * CRÉER UN PODCAST — Camara, le 15/11/2026 : « un enfant choisit une matière, importe son cours ou choisit un sujet
 * oralement, comme dans les fiches de révision ». Deux étapes : la matière (c'est elle qui décide QUEL professeur
 * parlera), puis le cours — importé (fichier, photo, QR code) ou écrit / dicté. Quarante pages au plus ; au-delà de
 * dix, le cours compte pour deux.
 */
export default function NouveauPodcast() {
  // L'ESPACE PARENT (15/11/2026) : la même page ; ses catégories au lieu des matières, et la voix qu'il choisit.
  const { eleveId, estParent, chemin } = useProprietairePodcasts();
  const naviguer = useNavigate();
  const retour = chemin;
  const { ouvert: forfaitOuvert, motif: motifForfait, podcasts: podcastsInclus } = useAccesForfait(estParent ? null : eleveId);
  // PAS DE PODCASTS AVEC STARTER (15/11/2026) : la route `acces` pour l'élève, le refus du serveur pour le parent.
  const [refusFormule, setRefusFormule] = useState(false);
  const nonInclus = podcastsInclus === false || refusFormule;
  const enEssai = forfaitOuvert === false && motifForfait === 'essai';

  const [matieres, setMatieres] = useState(null);
  const [matiereId, setMatiereId] = useState(null);
  const [coursId, setCoursId] = useState(null);
  const [pages, setPages] = useState([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [scanOuvert, setScanOuvert] = useState(false);
  const [quota, setQuota] = useState(null);
  const [mode, setMode] = useState(null);
  const [choixOuvert, setChoixOuvert] = useState(true);
  const [texte, setTexte] = useState('');
  const libre = mode === MODE_LIBRE;
  const livre = mode === MODE_LIVRE;
  const [titreLivre, setTitreLivre] = useState('');
  const [profs, setProfs] = useState(estParent ? null : []);
  const [prof, setProf] = useState(null);
  const [auteurLivre, setAuteurLivre] = useState('');
  const texteSuffit = livre ? titreLivre.trim().length >= TITRE_LIVRE_MIN : texte.trim().length >= TEXTE_MIN;

  useEffect(() => {
    let vivant = true;
    getQuotaPodcasts(eleveId)
      .then(({ data }) => { if (vivant) setQuota(data); })
      .catch((e) => { if (vivant && e?.response?.data?.nonInclus) setRefusFormule(true); });
    if (estParent) {
      const sans = { id: SANS_CATEGORIE, libelle: 'Sans catégorie', couleur: '#475569' };
      getCategories()
        .then(({ data }) => {
          if (vivant) setMatieres([...(Array.isArray(data) ? data : []).map((k) => ({ id: k.id, libelle: k.libelle, couleur: k.couleur })), sans]);
        })
        .catch(() => { if (vivant) setMatieres([sans]); });
      getProfesseursPodcast()
        .then(({ data }) => { if (vivant) setProfs(Array.isArray(data) ? data : []); })
        .catch(() => { if (vivant) setProfs([]); });
      return () => { vivant = false; };
    }
    getMatieresEleve(eleveId)
      .then(({ data }) => {
        // Ses matières ouvertes, sans la conseillère : on ne fait pas de podcast sur son orientation.
        if (vivant) setMatieres((Array.isArray(data) ? data : []).filter((m) => m.active && m.code !== 'ORIENTATION'));
      })
      .catch(() => { if (vivant) setMatieres([]); });
    return () => { vivant = false; };
  }, [eleveId, estParent]);

  const piecesMax = quota?.limites?.piecesMax ?? PIECES_MAX_PODCAST;
  const pagesMax = quota?.limites?.pagesMax ?? PAGES_MAX_PODCAST;
  const matiere = matieres?.find((m) => m.id === matiereId) ?? null;
  // Qui lit : le professeur de la matière (élève), ou celui que le parent a choisi.
  const lecteur = estParent ? profs?.find((x) => x.avatar === prof)?.prenom : matiere?.profPrenom;
  // Le contenu s'ouvre quand le brouillon peut être créé : une matière, ou une catégorie et une voix.
  const pret = Boolean(matiereId) && (!estParent || Boolean(prof));
  const verrou = estParent ? 'Choisissez d’abord une catégorie et la voix.' : 'Choisis d’abord ta matière.';

  const refCours = useRef(null);
  useEffect(() => {
    if (!matiereId) return;
    const el = refCours.current;
    if (!el?.getBoundingClientRect) return;
    const { top, bottom } = el.getBoundingClientRect();
    if (top < 0 || bottom > window.innerHeight) el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [matiereId]);

  const telephone = useMemo(
    () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(pointer: coarse)')?.matches),
    [],
  );

  const fermerChoix = useCallback(() => {
    if (mode) setChoixOuvert(false);
    else naviguer(retour);
  }, [mode, naviguer, retour]);
  const choisirMode = useCallback((m) => { setMode(m); setChoixOuvert(false); }, []);

  // UN RÉSUMÉ DE LIVRE : le français est choisi d'avance ; l'enfant peut en changer (un livre en anglais, par exemple).
  useEffect(() => {
    if (estParent || !livre || matiereId || coursId || !matieres) return;
    const francais = matieres.find(estLeFrancais);
    if (francais) setMatiereId(francais.id);
  }, [estParent, livre, matiereId, coursId, matieres]);

  const choisirMatiere = async (id) => {
    if (!coursId) { setMatiereId(id); return; }
    setErreur(null);
    try {
      await modifierCoursPodcast(eleveId, coursId, id, prof);
      setMatiereId(id);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? (estParent ? 'La catégorie n’a pas pu être changée.' : 'Ta matière n’a pas pu être changée. Tu peux réessayer ?'));
    }
  };

  const choisirProf = async (avatar) => {
    if (!coursId) { setProf(avatar); return; }
    setErreur(null);
    try {
      await modifierCoursPodcast(eleveId, coursId, matiereId, avatar);
      setProf(avatar);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'La voix n’a pas pu être changée.');
    }
  };

  const brouillon = useCallback(async () => {
    if (coursId) return coursId;
    const { data } = await creerCoursPodcast(eleveId, matiereId, prof);
    setCoursId(data.id);
    return data.id;
  }, [coursId, eleveId, matiereId, prof]);

  const totalPages = pages.reduce((somme, p) => somme + (p.nombrePages || 1), 0);

  const ajouter = async (fichiers) => {
    const retenus = Array.from(fichiers ?? []).slice(0, Math.max(0, piecesMax - pages.length));
    if (retenus.length === 0 || !pret) return;
    setErreur(null);
    setEnvoi(true);
    try {
      const id = await brouillon();
      const reduits = await Promise.all(retenus.map((f) => reduire(f).catch(() => f)));
      for (const fichier of reduits) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await ajouterPagePodcast(eleveId, id, fichier);
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
      await supprimerPagePodcast(eleveId, coursId, page.id);
      setPages((liste) => liste.filter((p) => p.id !== page.id));
    } catch {
      setErreur('Cette page n’a pas pu être retirée. Tu peux réessayer ?');
    }
  };

  const annuler = async () => {
    // eslint-disable-next-line no-alert
    if ((pages.length > 0 || (libre && texte.trim()) || (livre && titreLivre.trim())) && !window.confirm(estParent ? 'Abandonner ce podcast ? Ce que vous avez ajouté sera effacé.' : 'Abandonner ce podcast ? Ce que tu as ajouté sera effacé.')) return;
    if (coursId) {
      try { await supprimerCoursPodcast(eleveId, coursId); } catch { /* le brouillon partira de lui-même sous 24 h */ }
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

  const creerScan = useCallback(() => creerScanPodcast(eleveId, coursId), [eleveId, coursId]);
  const lireScan = useCallback((jeton) => etatScanPodcast(eleveId, coursId, jeton), [eleveId, coursId]);
  const recu = useCallback((page) => {
    setPages((liste) => (liste.some((p) => p.id === page.id) ? liste : [...liste, page]));
  }, []);

  const creer = async () => {
    setErreur(null);
    setEnvoi(true);
    try {
      const id = libre || livre ? await brouillon() : coursId;
      if (libre) await ecrireTextePodcast(eleveId, id, texte);
      if (livre) await ecrireLivrePodcast(eleveId, id, titreLivre.trim(), auteurLivre.trim());
      await envoyerCoursPodcast(eleveId, id);
      // LA BARRE DE TOUTES LES PAGES suit ce cours dès son envoi (15/11/2026).
      suivre(eleveId, id);
      naviguer(`${retour}/cours/${id}`);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? (estParent ? 'Votre podcast n’a pas pu être envoyé.' : 'Ton cours n’a pas pu être envoyé. Tu peux réessayer ?'));
      setEnvoi(false);
    }
  };

  const plein = pages.length >= piecesMax || totalPages >= pagesMax;
  const quotaEpuise = plusRien(quota);
  const bloque = envoi || plein || !pret || quotaEpuise;

  if (nonInclus) {
    return (
      <div className="mf-page pod-page">
        <Link to={retour} className="lien-retour">← Mes podcasts</Link>
        <h1 className="mf-titre">Créer un podcast</h1>
        <PageNonIncluse enfant={!estParent && Boolean(sessionEleve())} />
      </div>
    );
  }

  if (forfaitOuvert === false && !enEssai) {
    return (
      <div className="mf-page pod-page">
        <Link to={retour} className="lien-retour">← Mes podcasts</Link>
        <h1 className="mf-titre">Créer un podcast</h1>
        <ForfaitRequis module="podcasts" />
      </div>
    );
  }

  if (quotaEpuise && !coursId) {
    return (
      <div className="mf-page pod-page">
        <Link to={retour} className="lien-retour">← Mes podcasts</Link>
        <h1 className="mf-titre">Créer un podcast</h1>
        <JaugeQuota quota={quota} module="podcasts" />
      </div>
    );
  }

  return (
    <div className="mf-page pod-page">
      <Link to={retour} className="lien-retour">← Mes podcasts</Link>
      <h1 className="mf-titre">Créer un podcast</h1>
      {!estParent && <JaugeQuota quota={quota} module="podcasts" />}

      {mode && (
        <p className="mf-mode__rappel">
          <span>
            {livre ? 'Podcast à partir d’un livre : ' : libre ? 'Podcast libre : ' : 'Podcast à partir d’un cours : '}
            <strong>
              {estParent
                ? (livre ? 'vous donnez le titre du livre' : libre ? 'vous écrivez ou dictez votre sujet' : 'vous importez votre document')
                : (livre ? 'tu donnes le titre du livre' : libre ? 'tu écris ou tu dictes ton sujet' : 'tu importes ton cours')}
            </strong>
          </span>
          {pages.length === 0 && (
            <button type="button" className="mf-mode__changer" disabled={envoi} onClick={() => setChoixOuvert(true)}>Changer</button>
          )}
        </p>
      )}

      <Etape
        id="pod-etape-matiere"
        numero={1}
        titre={estParent ? 'Choisissez une catégorie' : 'Choisis ta matière'}
        etat={matiereId ? 'faite' : 'active'}
        aide={estParent
          ? 'Touchez une de vos catégories, ou créez-en une.'
          : livre
            ? 'Le professeur de français te raconte le livre. Un livre en anglais ? Choisis l’anglais.'
            : 'Touche la matière de ton cours : c’est son professeur qui te le racontera.'}
      >
        {matieres === null ? (
          <p className="champ__aide">{estParent ? 'Chargement de vos catégories…' : 'Chargement de tes matières…'}</p>
        ) : (
          <div className="mf-choix" role="radiogroup" aria-label={estParent ? 'Votre catégorie' : 'Ta matière'}>
            {matieres.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={matiereId === m.id}
                disabled={envoi}
                className={`mf-choix__matiere${matiereId === m.id ? ' est-choisi' : ''}`}
                style={m.couleur ? styleCategorie(m.couleur) : styleMatiere(m.code)}
                onClick={() => choisirMatiere(m.id)}
              >
                <span className="mf-coche" aria-hidden="true" />
                {m.libelle}
                {m.profPrenom && <span className="pod-choix__prof"> · {m.profPrenom}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Créer une catégorie sur place : elle est choisie aussitôt (comme pour ses fiches). */}
        {estParent && matieres !== null && (
          <NouvelleCategorie
            onCreee={(k) => {
              setMatieres((liste) => [
                ...liste.filter((m) => m.id !== SANS_CATEGORIE),
                { id: k.id, libelle: k.libelle, couleur: k.couleur },
                ...liste.filter((m) => m.id === SANS_CATEGORIE),
              ]);
              choisirMatiere(k.id);
            }}
          />
        )}
      </Etape>

      {/* LA VOIX DU PARENT — Camara, le 15/11/2026 : « le parent choisit » le professeur qui lit son podcast. */}
      {estParent && (
        <Etape
          id="pod-etape-voix"
          numero={2}
          titre="Qui lit votre podcast ?"
          etat={!matiereId ? 'verrouillee' : prof ? 'faite' : 'active'}
          aide="Choisissez le professeur dont la voix vous plaît : c’est lui qui vous racontera votre podcast."
          verrou="Choisissez d’abord une catégorie."
        >
          {profs === null ? (
            <p className="champ__aide">Chargement des professeurs…</p>
          ) : (
            <div className="pod-voix" role="radiogroup" aria-label="Le professeur qui lit">
              {profs.map((x) => (
                <button
                  key={x.avatar}
                  type="button"
                  role="radio"
                  aria-checked={prof === x.avatar}
                  disabled={envoi || !matiereId}
                  className={`pod-voix__choix${prof === x.avatar ? ' est-choisi' : ''}`}
                  onClick={() => choisirProf(x.avatar)}
                >
                  <Avatar nom={x.avatar} taille={56} />
                  <strong>{x.prenom}</strong>
                  {x.matieres?.length > 0 && <span>{x.matieres.slice(0, 2).join(' · ')}</span>}
                </button>
              ))}
            </div>
          )}
        </Etape>
      )}

      {livre ? (
        <Etape
          id="pod-etape-livre"
          numero={estParent ? 3 : 2}
          titre={estParent ? 'Quel livre voulez-vous écouter ?' : 'Quel livre veux-tu écouter ?'}
          etat={!pret ? 'verrouillee' : texteSuffit ? 'faite' : 'active'}
          aide={estParent
            ? `Écrivez ou dictez son titre, et son auteur si vous le connaissez : ${lecteur ?? 'le professeur'} vous le résume, partie par partie.`
            : `Écris ou dicte son titre, et son auteur si tu le connais : ${lecteur ?? 'ton professeur'} te le résume, partie par partie.`}
          verrou={verrou}
          refEl={refCours}
        >
          <div className="pod-livre">
            <span className="pod-livre__etiquette">Le titre du livre</span>
            <SaisieLibre
              eleveId={eleveId}
              estParent={estParent}
              texte={titreLivre}
              onTexte={setTitreLivre}
              max={TITRE_LIVRE_MAX}
              lignes={2}
              etiquette="Le titre du livre"
              indication="Par exemple : « Le Petit Prince »"
              disabled={!pret || envoi || quotaEpuise}
            />
            <span className="pod-livre__etiquette">Son auteur <em>{estParent ? '(si vous le connaissez)' : '(si tu le connais)'}</em></span>
            <SaisieLibre
              eleveId={eleveId}
              estParent={estParent}
              texte={auteurLivre}
              onTexte={setAuteurLivre}
              max={AUTEUR_LIVRE_MAX}
              lignes={1}
              etiquette="L’auteur du livre"
              indication="Par exemple : « Antoine de Saint-Exupéry »"
              disabled={!pret || envoi || quotaEpuise}
            />
            <p className="champ__aide">
              {estParent
                ? 'Si le professeur ne connaît pas assez bien ce livre, il vous le dira plutôt que d’inventer : votre podcast ne sera pas compté.'
                : 'Si ton professeur ne connaît pas assez bien ce livre, il te le dira plutôt que d’inventer : ton podcast ne sera pas compté.'}
            </p>
          </div>
          {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
        </Etape>
      ) : libre ? (
        <Etape
          id="pod-etape-libre"
          numero={estParent ? 3 : 2}
          titre={estParent ? 'Écrivez ou dictez ce que vous voulez écouter' : 'Écris ou dicte ce que tu veux écouter'}
          etat={!pret ? 'verrouillee' : texteSuffit ? 'faite' : 'active'}
          aide={estParent
            ? `Vos notes, un texte, ou juste un sujet : ${lecteur ?? 'le professeur'} vous l’explique.`
            : lecteur
              ? `Ta leçon, tes notes, ou juste le sujet (« les fractions », « la Révolution française ») : ${lecteur} te l’explique.`
              : 'Ta leçon, tes notes, ou juste le sujet (« les fractions », « la Révolution française ») : au clavier ou au micro.'}
          verrou={verrou}
          refEl={refCours}
        >
          <SaisieLibre
            eleveId={eleveId}
            estParent={estParent}
            texte={texte}
            onTexte={setTexte}
            max={TEXTE_MAX}
            disabled={!pret || envoi || quotaEpuise}
          />
          {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
        </Etape>
      ) : (
        <Etape
          id="pod-etape-cours"
          numero={estParent ? 3 : 2}
          titre={estParent ? 'Importez votre document' : 'Importe ton cours'}
          etat={!pret ? 'verrouillee' : pages.length > 0 ? 'faite' : 'active'}
          aide={estParent
            ? `Photos ou PDF, ${pagesMax} pages au plus. Au-delà de ${PAGES_COURS_SIMPLE} pages, le document compte pour 2.`
            : `Photos ou PDF, ${pagesMax} pages au plus. Au-delà de ${PAGES_COURS_SIMPLE} pages, ton cours compte pour 2.`}
          verrou={verrou}
          refEl={refCours}
        >
          {pages.length > 0 && (
            <ul className="cours-controle__liste">
              {pages.map((page) => (
                <li key={page.id} className="cours-controle__document">
                  <Icone />
                  <span className="cours-controle__nom">{page.nomFichier ?? 'Photo'}</span>
                  <span className="cours-controle__etat">{page.nombrePages > 1 ? `${page.nombrePages} pages` : '1 page'}</span>
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

          {pages.length > 0 && <p className="champ__aide">{totalPages} page{totalPages > 1 ? 's' : ''} sur {pagesMax}</p>}

          {totalPages > PAGES_COURS_SIMPLE && !estParent && (
            <p className={`mf-poids${(quota?.disponibles ?? 2) < 2 ? ' est-bloquant' : ''}`} role="status">
              <strong>Ton cours fait {totalPages} pages : il comptera pour 2 podcasts.</strong>{' '}
              {(quota?.disponibles ?? 2) < 2
                ? `Il ne t’en reste qu’un : garde seulement les pages de la leçon (${PAGES_COURS_SIMPLE} au plus), ou demande à tes parents d’acheter des crédits.`
                : `Pour qu’il compte pour 1, garde seulement les pages de la leçon (${PAGES_COURS_SIMPLE} au plus).`}
            </p>
          )}

          {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

          {!plein && (
            <div className="cours-controle__boutons">
              <label className={`btn btn--compact btn--fantome cours-controle__bouton${bloque ? ' est-desactive' : ''}`}>
                <Icone /> {envoi ? 'Envoi…' : estParent ? 'Importer un document' : 'Importer mon cours'}
                <input
                  type="file"
                  hidden
                  multiple
                  disabled={bloque}
                  accept={TYPES_ACCEPTES}
                  onChange={(e) => { const choisis = e.target.files; ajouter(choisis); e.target.value = ''; }}
                />
              </label>
              {telephone ? (
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
              ) : !estParent && (
                // Pas de scan au téléphone dans l'espace parent (comme ses fiches).
                <button type="button" className="btn btn--compact btn--fantome cours-controle__bouton" disabled={bloque} onClick={scanner}>
                  <Icone scan /> Scanner avec mon téléphone
                </button>
              )}
            </div>
          )}

          {plein && <p className="champ__aide">C’est le maximum pour un cours : retire une page pour en ajouter une autre.</p>}
        </Etape>
      )}

      <div className="mf-actions">
        <button type="button" className="btn btn--fantome" disabled={envoi} onClick={annuler}>Annuler</button>
        <button
          type="button"
          className="btn mf-actions__principal"
          disabled={envoi || quotaEpuise || !pret || (libre || livre ? !texteSuffit : pages.length === 0)}
          onClick={creer}
        >
          {envoi && (libre || livre || pages.length > 0) ? 'Un instant…' : 'Créer mon podcast'}
        </button>
      </div>

      {choixOuvert && <ChoixModeFiche module="podcasts" estParent={estParent} onChoisir={choisirMode} onFermer={fermerChoix} />}

      {scanOuvert && coursId && (
        <ScanMobileModale creer={creerScan} lire={lireScan} onRecu={recu} onFermer={() => setScanOuvert(false)} />
      )}
    </div>
  );
}
