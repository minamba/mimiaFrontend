import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { demanderEpisodes, getAudioEpisode, getCoursPodcast } from '../../lib/api/mesPodcastsApi';
import { creerFusion, enZip, nomDuFichier, proposer, wavEnMp3 } from '../../lib/podcasts/mp3';
import { styleDuCours, useProprietairePodcasts } from '../../lib/mesFiches/espaceFiches';
import { usePodcastsTelechargement } from '../../lib/storage/modeTest';
import { suivre } from '../../lib/podcasts/suiviPodcasts';
import Loader from '../Loader';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { useVueIllustree } from '../../lib/vueIllustree';
import { PageNonIncluse } from './PodcastsNonInclus';
import LecteurEpisode, { duree } from './LecteurEpisode';
import { paletteDeMatiere, sceneDeMatiere } from '../../lib/scenesMatieres';
import { iconeEpreuve } from '../PreparationExamen';
import '../mesFiches/mesFiches.css';
import '../mesFiches/mesFichesPages.css';
import './podcasts.css';
import './podcastIllustre.css';

/**
 * UN PODCAST — la page d'un cours transformé en épisodes (Camara, le 15/11/2026).
 *
 * SA VIE, COMME CELLE DES FICHES : le professeur LIT le cours (quelques secondes) ; s'il y trouve plusieurs notions,
 * l'enfant CHOISIT les épisodes qu'il veut (toutes cochées, il décoche) ; puis les épisodes s'ENREGISTRENT, un par un,
 * et arrivent sous ses yeux. La page se relit seule tant que quelque chose est en route.
 *
 * « TOUT ÉCOUTER » : à la fin d'un épisode, le suivant démarre.
 */
export default function CoursPodcast() {
  // L'ESPACE PARENT (15/11/2026) : la même page, propriétaire changé.
  const { eleveId, coursId, estParent, chemin } = useProprietairePodcasts();
  const vueIllustree = useVueIllustree();
  const [cours, setCours] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [choix, setChoix] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [enchainer, setEnchainer] = useState(null);
  // « Lire en même temps » ouvert sur un épisode : pendant « Tout écouter », le suivant s'ouvre avec son texte.
  const [texteSuivi, setTexteSuivi] = useState(false);
  // LE BOUTON « TÉLÉCHARGER EN MP3 », affiché ou non depuis Admin › Modes (15/11/2026).
  const telechargeable = usePodcastsTelechargement();
  // « TOUT TÉLÉCHARGER » (15/11/2026) : null, { fait, total } pendant la préparation, ou 'erreur'.
  const [toutTelecharger, setToutTelecharger] = useState(null);
  // « UN SEUL MP3 » (15/11/2026) : null, { fait, total } pendant l'assemblage, ou 'erreur'.
  const [fusion, setFusion] = useState(null);

  const charger = useCallback(() => getCoursPodcast(eleveId, coursId)
    .then(({ data }) => { setCours(data); setErreur(null); })
    .catch((e) => setErreur(e?.response?.data?.nonInclus
      ? 'non-inclus'
      : e?.response?.status === 404
      ? 'Ce podcast n’existe plus.'
      : 'Ton podcast n’a pas pu être chargé. Tu peux réessayer ?')), [eleveId, coursId]);

  useEffect(() => { charger(); }, [charger]);

  const enRoute = cours && (cours.etat === 'a_lire' || cours.etat === 'a_generer');

  // UN COURS EN FABRICATION OUVERT ICI (un autre appareil, un rechargement) : la barre de toutes les pages le suit.
  useEffect(() => {
    if (enRoute) suivre(eleveId, coursId);
  }, [enRoute, eleveId, coursId]);
  useEffect(() => {
    if (!enRoute) return undefined;
    const minuteur = setInterval(charger, 5000);
    return () => clearInterval(minuteur);
  }, [enRoute, charger]);

  // Les notions toutes cochées dès qu'elles arrivent : l'enfant décoche ce qu'il ne veut pas.
  useEffect(() => {
    if (cours?.etat === 'notions' && choix === null) setChoix(cours.notions.map((_, i) => i + 1));
  }, [cours, choix]);

  const basculer = (rang) => setChoix((liste) => (liste.includes(rang) ? liste.filter((r) => r !== rang) : [...liste, rang].sort((a, b) => a - b)));

  const demander = async () => {
    setEnvoi(true);
    setErreur(null);
    try {
      await demanderEpisodes(eleveId, coursId, choix);
      await charger();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Tes épisodes n’ont pas pu être demandés. Tu peux réessayer ?');
    } finally {
      setEnvoi(false);
    }
  };

  // TOUS LES ÉPISODES EN MP3, DANS UN ZIP : un épisode après l'autre (la mémoire d'un téléphone suffit), le compte
  // s'affiche sur le bouton.
  const telechargerTout = async (liste) => {
    setToutTelecharger({ fait: 0, total: liste.length });
    try {
      const fichiers = [];
      for (const e of liste) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await getAudioEpisode(eleveId, e.id, true);
        // eslint-disable-next-line no-await-in-loop
        const blob = await wavEnMp3(data);
        fichiers.push({ nom: nomDuFichier(e.titre, e.notionRang), blob });
        setToutTelecharger({ fait: fichiers.length, total: liste.length });
      }
      proposer(await enZip(fichiers), nomDuFichier(cours?.titre ?? 'podcast', null, 'zip'));
      setToutTelecharger(null);
    } catch {
      setToutTelecharger('erreur');
    }
  };

  // TOUS LES ÉPISODES DANS UN SEUL MP3 — Camara, le 15/11/2026 : « comme ça l'enfant peut tout écouter dans le même
  // audio ». Dans l'ordre des épisodes, un silence d'une seconde et demie entre deux.
  const fusionner = async (liste) => {
    setFusion({ fait: 0, total: liste.length });
    try {
      const f = creerFusion();
      for (const [i, e] of liste.entries()) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await getAudioEpisode(eleveId, e.id, true);
        // eslint-disable-next-line no-await-in-loop
        await f.ajouter(data);
        setFusion({ fait: i + 1, total: liste.length });
      }
      proposer(f.finir(), nomDuFichier(cours?.titre ?? 'podcast'));
      setFusion(null);
    } catch {
      setFusion('erreur');
    }
  };

  const enCours = (etat) => etat !== null && etat !== 'erreur';
  const occupe = enCours(toutTelecharger) || enCours(fusion);

  if (!cours && !erreur) return <Loader />;

  // PAS DE PODCASTS AVEC STARTER (15/11/2026) : un lien gardé mène à la raison, pas à une erreur.
  if (erreur === 'non-inclus') {
    return (
      <div className="mf-page pod-page">
        <Link to={chemin} className="lien-retour">← Mes podcasts</Link>
        <PageNonIncluse enfant={!estParent && Boolean(sessionEleve())} />
      </div>
    );
  }

  const retour = chemin;
  const episodes = [...(cours?.episodes ?? [])].sort((a, b) => (a.notionRang ?? 0) - (b.notionRang ?? 0));
  const attendus = cours?.etat === 'a_generer' ? Math.max(0, (cours.notionsDemandees?.length ?? 0) - episodes.length) : 0;
  const totalSecondes = episodes.reduce((s, e) => s + (e.duree ?? 0), 0);

  // LA PAGE D'UN PODCAST, ILLUSTRÉE — Camara, le 15/11/2026 : d'après sa maquette, « avec le background lié à la
  // matière, la vraie tête du professeur, et un style qui s'adapte à la matière ». Pour l'enfant, et pour le parent
  // dans l'espace de son enfant (16/11/2026, lib/vueIllustree.js) ; l'espace parent (sans matière) garde la page
  // d'avant. La bannière porte la SCÈNE de la matière (lib/scenesMatieres.js) ; ses couleurs et celles du lecteur
  // viennent de la même palette.
  const illustre = !estParent && vueIllustree;
  const scene = illustre ? sceneDeMatiere(cours?.matiereCode) : null;
  const styleRacine = !cours ? undefined : illustre
    ? {
      ...styleDuCours(cours),
      ...paletteDeMatiere({ code: cours.matiereCode }),
      ...(scene ? { '--podx-scene': `url(${scene.image})` } : {}),
    }
    : styleDuCours(cours);

  const resume = episodes.length > 0 && (
    <>
      {episodes.length > 1 ? `${episodes.length} épisodes` : '1 épisode'}
      {totalSecondes > 0 ? ` · ${duree(totalSecondes)} d’écoute` : ''}
    </>
  );

  // « TOUT ÉCOUTER », « TOUT TÉLÉCHARGER », « UN SEUL FICHIER MP3 » : dans la bannière pour l'enfant, sous l'en-tête
  // sinon. Les mêmes boutons, les mêmes actions.
  const boutonsTout = episodes.length > 1 && (
    <div className="pod-tout">
      <button type="button" className="btn btn--compact" onClick={() => setEnchainer({ index: 0, cle: Date.now() })}>
        ▶ Tout écouter
      </button>
      {telechargeable && (
        <button
          type="button"
          className="pod-lecteur__telecharger"
          disabled={occupe}
          onClick={() => telechargerTout(episodes)}
        >
          <span className="pod-icone-telecharger" aria-hidden="true" />
          {enCours(toutTelecharger)
            ? `Préparation ${toutTelecharger.fait} / ${toutTelecharger.total}…`
            : 'Tout télécharger'}
        </button>
      )}
      {telechargeable && (
        <button
          type="button"
          className="pod-lecteur__telecharger"
          disabled={occupe}
          onClick={() => fusionner(episodes)}
          title="Tous les épisodes, l’un après l’autre, dans un seul fichier MP3"
        >
          <span className="pod-icone-telecharger" aria-hidden="true" />
          {enCours(fusion)
            ? `Assemblage ${fusion.fait} / ${fusion.total}…`
            : 'Un seul fichier MP3'}
        </button>
      )}
      {toutTelecharger === 'erreur' && (
        <p className="champ__erreur" role="alert">Les MP3 n’ont pas pu être préparés. Réessaie dans un moment.</p>
      )}
      {fusion === 'erreur' && (
        <p className="champ__erreur" role="alert">Le fichier unique n’a pas pu être préparé. Réessaie dans un moment.</p>
      )}
    </div>
  );

  return (
    <div
      className={`mf-page pod-page${illustre ? ' page-decor-enfant podx' : ''}${illustre && scene ? ' podx--scene' : ''}`}
      style={styleRacine}
    >
      {!illustre && <Link to={retour} className="lien-retour">← Mes podcasts</Link>}

      {illustre && (
        <section className="podx-banniere">
          <span className="podx-banniere__scene" aria-hidden="true" />
          <Link to={retour} className="lien-retour podx-banniere__retour">← Mes podcasts</Link>
          {cours && (
            <>
              {cours.matiereLibelle && (
                <span className="podx-banniere__matiere">
                  <span aria-hidden="true">{iconeEpreuve({ libelle: cours.matiereLibelle })}</span>
                  {cours.matiereLibelle}
                </span>
              )}
              <h1 className="podx-banniere__titre">{cours.titre ?? 'Ton podcast'}</h1>
              {resume && (
                <p className="podx-banniere__resume">
                  <span className="podx-banniere__casque" aria-hidden="true">🎧</span>
                  {resume}
                </p>
              )}
              {boutonsTout}
            </>
          )}
        </section>
      )}

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

      {cours && (
        <>
          {!illustre && (
            <header className="pod-cours__entete">
              <span className="pod-cours__matiere">{cours.matiereLibelle ?? (estParent ? 'Sans catégorie' : '')}</span>
              <h1 className="mf-titre">{cours.titre ?? (estParent ? 'Votre podcast' : 'Ton podcast')}</h1>
              {resume && <p className="pod-cours__resume">{resume}</p>}
            </header>
          )}

          {cours.etat === 'a_lire' && (
            <div className="pod-attente" role="status">
              <span className="pod-attente__onde" aria-hidden="true"><span /><span /><span /><span /><span /></span>
              <p><strong>{estParent ? 'Le professeur lit votre document…' : 'Ton professeur lit ton cours…'}</strong></p>
              <p>{estParent ? 'Cela prend quelques secondes. Vous pouvez rester ici ou revenir plus tard.' : 'Ça prend quelques secondes. Tu peux rester ici ou revenir plus tard.'}</p>
            </div>
          )}

          {cours.etat === 'notions' && choix && (
            <section className="pod-notions" aria-labelledby="pod-notions-titre">
              <h2 id="pod-notions-titre" className="pod-notions__titre">{estParent ? 'Choisissez vos épisodes' : 'Choisis tes épisodes'}</h2>
              <p className="champ__aide">
                {estParent
                  ? 'Une notion = un épisode de quelques minutes. Décochez ce que vous ne voulez pas écouter.'
                  : 'Une notion de ton cours = un épisode de quelques minutes. Décoche ce que tu ne veux pas écouter.'}
              </p>
              <ul className="pod-notions__liste">
                {cours.notions.map((n, i) => {
                  const rang = i + 1;
                  const coche = choix.includes(rang);
                  return (
                    <li key={rang}>
                      <label className={`pod-notion${coche ? ' est-coche' : ''}`}>
                        <input type="checkbox" checked={coche} onChange={() => basculer(rang)} />
                        <span className="pod-notion__rang">{rang}</span>
                        <span className="pod-notion__texte">
                          <strong>{n.titre}</strong>
                          {n.resume && <span>{n.resume}</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="mf-actions">
                <button type="button" className="btn mf-actions__principal" disabled={envoi || choix.length === 0} onClick={demander}>
                  {envoi ? 'Un instant…' : choix.length > 1 ? `Créer mes ${choix.length} épisodes` : 'Créer mon épisode'}
                </button>
              </div>
            </section>
          )}

          {cours.etat === 'echec' && (
            <div className="mf-vide" role="note">
              <p><strong>{cours.remarque ?? (estParent ? 'Votre podcast n’a pas pu être créé.' : 'Ton podcast n’a pas pu être créé.')}</strong></p>
              <Link to={`${retour}/nouveau`} className="btn">Recommencer</Link>
            </div>
          )}

          {cours.etat === 'pret' && cours.remarque && <p className="mf-poids" role="status">{cours.remarque}</p>}

          {!illustre && boutonsTout}

          <div className="pod-episodes">
            {episodes.map((e, i) => (
              <LecteurEpisode
                key={enchainer?.index === i ? `${e.id}-${enchainer.cle}` : e.id}
                eleveId={eleveId}
                episode={e}
                illustre={illustre}
                autoLecture={enchainer?.index === i}
                telechargeable={telechargeable}
                texteOuvert={texteSuivi && enchainer?.index === i}
                onTexte={setTexteSuivi}
                onFin={() => {
                  if (enchainer && i + 1 < episodes.length) setEnchainer({ index: i + 1, cle: Date.now() });
                  else setEnchainer(null);
                }}
              />
            ))}

            {Array.from({ length: attendus }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={`attente-${i}`} className="pod-lecteur pod-lecteur--attente" role="status">
                <span className="pod-attente__onde" aria-hidden="true"><span /><span /><span /><span /><span /></span>
                <span>{i === 0 ? 'Ton professeur enregistre cet épisode…' : 'Épisode en préparation…'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
