import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAudioEpisode } from '../../lib/api/mesPodcastsApi';
import { nomDuFichier, proposer, wavEnMp3 } from '../../lib/podcasts/mp3';
import Avatar from '../Avatar';

/**
 * LE LECTEUR D'UN ÉPISODE — Camara, le 15/11/2026 : « on lui génère un audio avec la voix du professeur ».
 *
 * LE PROFESSEUR PARLE QUAND L'AUDIO JOUE : son portrait animé (`Avatar parle`), comme en séance. Lecture et pause,
 * reculer et avancer de 10 secondes, la barre de progression, la vitesse (1×, 1,25×, 1,5×, 0,75×), et le TEXTE de
 * l'épisode.
 *
 * LE TEXTE SUIT LA VOIX — Camara, le 15/11/2026 : « je voudrais que le suivi soit vraiment synchronisé avec la parole
 * du professeur, comme ça l'élève suit en même temps, et que le scroll défile automatiquement ». Le serveur donne les
 * REPÈRES de chaque paragraphe (`episode.reperes` : début, fin, et pour chaque phrase le caractère où elle commence et
 * l'instant où la voix la commence). La phrase dite est éclairée, ce qui est déjà dit reste net, la suite est grisée ;
 * la zone de texte défile toute seule pour garder la phrase sous les yeux. Faire défiler à la main suspend ce suivi
 * quelques secondes ; toucher une phrase y mène. Un épisode sans repères (fait avant) : le paragraphe estimé, comme avant.
 *
 * L'AUDIO EST TÉLÉCHARGÉ PAR LE CLIENT HTTP (en-tête d'authentification, billet de la salle d'attente) puis lu depuis
 * un blob local. Un navigateur qui ne lit pas l'Ogg Opus (iPhone avant iOS 18.4) reçoit le même épisode en WAV.
 */
const VITESSES = [1, 1.25, 1.5, 0.75];

export const duree = (secondes) => {
  if (!Number.isFinite(secondes) || secondes < 0) return '0:00';
  const s = Math.floor(secondes);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Le navigateur sait-il lire l'Ogg Opus ? Sinon, on demande le WAV. */
export function litLOpus() {
  try {
    const a = document.createElement('audio');
    return Boolean(a.canPlayType?.('audio/ogg; codecs=opus'));
  } catch {
    return false;
  }
}

/** Le paragraphe suivant s'éclaire un rien avant sa première syllabe (pendant le silence qui le précède). */
const AVANCE_PARAGRAPHE = 0.15;

/** Après un défilement à la main, le suivi attend ce temps avant de reprendre la main. */
const SUSPENSION_MS = 4000;

/** Les repères du serveur sont-ils utilisables ? Un par paragraphe, autant d'instants que de phrases. */
export function reperesValides(episode) {
  const r = episode?.reperes;
  return Array.isArray(r) && r.length > 0 && r.length === episode.paragraphes?.length
    && r.every((x) => Array.isArray(x?.coupes) && Array.isArray(x?.temps)
      && x.coupes.length > 0 && x.coupes.length === x.temps.length);
}

/** Les phrases d'un paragraphe, coupées aux caractères que donne le serveur. */
export function phrasesDuParagraphe(texte, coupes) {
  return coupes.map((debut, k) => texte.slice(debut, k + 1 < coupes.length ? coupes[k + 1] : undefined));
}

/**
 * Où en est la voix : `{ paragraphe, phrase }`. Avec les repères, la phrase exacte ; sans eux, le paragraphe estimé
 * et `phrase: -1`.
 */
export function positionAuTemps(episode, temps, total) {
  if (!episode?.paragraphes?.length) return { paragraphe: -1, phrase: -1 };
  if (!reperesValides(episode)) return { paragraphe: paragrapheAuTemps(episode.paragraphes, temps, total), phrase: -1 };

  const r = episode.reperes;
  let i = 0;
  while (i + 1 < r.length && temps >= r[i + 1].debut - AVANCE_PARAGRAPHE) i += 1;
  let k = 0;
  while (k + 1 < r[i].temps.length && temps >= r[i].temps[k + 1]) k += 1;
  return { paragraphe: i, phrase: k };
}

/**
 * Le paragraphe dit à cet instant, SANS REPÈRES : la voix avance à peu près au rythme des caractères. Une estimation,
 * pour les épisodes faits avant les repères.
 */
export function paragrapheAuTemps(paragraphes, temps, total) {
  if (!paragraphes?.length || !total) return -1;
  const longueurs = paragraphes.map((p) => p.length + 40);
  const somme = longueurs.reduce((a, b) => a + b, 0);
  let cumul = 0;
  for (let i = 0; i < longueurs.length; i += 1) {
    cumul += longueurs[i];
    if ((temps / total) <= cumul / somme) return i;
  }
  return paragraphes.length - 1;
}

/** Le début d'un paragraphe, dans le temps de l'épisode (même estimation). */
function debutDuParagraphe(paragraphes, index, total) {
  const longueurs = paragraphes.map((p) => p.length + 40);
  const somme = longueurs.reduce((a, b) => a + b, 0);
  const avant = longueurs.slice(0, index).reduce((a, b) => a + b, 0);
  return (avant / somme) * total;
}

export default function LecteurEpisode({
  eleveId, episode, couleur, autoLecture = false, onFin, telechargeable = false,
  // LA PAGE ILLUSTRÉE DE L'ENFANT (15/11/2026) : des classes et des ornements, la même mécanique.
  illustre = false,
  // « Tout écouter » : l'épisode suivant s'ouvre avec son texte si l'élève lisait le précédent.
  texteOuvert = false, onTexte,
}) {
  const audio = useRef(null);
  const racine = useRef(null);
  const zone = useRef(null);
  const suspendu = useRef(0);
  const [url, setUrl] = useState(null);
  const [erreur, setErreur] = useState(false);
  const [joue, setJoue] = useState(false);
  const [temps, setTemps] = useState(0);
  const [total, setTotal] = useState(episode.duree ?? 0);
  const [vitesse, setVitesse] = useState(1);
  const [texte, setTexte] = useState(texteOuvert);
  const [position, setPosition] = useState({ paragraphe: -1, phrase: -1 });
  const [telechargement, setTelechargement] = useState(null);
  const avecReperes = useMemo(() => reperesValides(episode), [episode]);

  // TÉLÉCHARGER EN MP3 (15/11/2026) : l'épisode en WAV, encodé en MP3 ici, puis proposé au navigateur.
  const telecharger = async () => {
    setTelechargement('prepare');
    try {
      const { data } = await getAudioEpisode(eleveId, episode.id, true);
      const mp3 = await wavEnMp3(data);
      proposer(mp3, nomDuFichier(episode.titre, episode.notionTotal > 1 ? episode.notionRang : null));
      setTelechargement(null);
    } catch {
      setTelechargement('erreur');
    }
  };

  // L'audio, une fois par épisode ; l'URL du blob est rendue en partant.
  useEffect(() => {
    let vivant = true;
    let adresse = null;
    setUrl(null);
    setErreur(false);
    getAudioEpisode(eleveId, episode.id, !litLOpus())
      .then(({ data }) => {
        if (!vivant) return;
        adresse = URL.createObjectURL(data);
        setUrl(adresse);
      })
      .catch(() => { if (vivant) setErreur(true); });
    return () => {
      vivant = false;
      if (adresse) URL.revokeObjectURL(adresse);
    };
  }, [eleveId, episode.id]);

  useEffect(() => {
    if (audio.current) audio.current.playbackRate = vitesse;
  }, [vitesse, url]);

  useEffect(() => {
    if (url && autoLecture) audio.current?.play?.().catch(() => {});
  }, [url, autoLecture]);

  // OÙ EN EST LA VOIX. `timeupdate` n'arrive que quatre fois par seconde : pendant la lecture, on regarde dix fois
  // par seconde, et l'écran ne se redessine que si la phrase a changé.
  const suivre = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    const p = positionAuTemps(episode, a.currentTime || 0, a.duration || total);
    setPosition((avant) => (avant.paragraphe === p.paragraphe && avant.phrase === p.phrase ? avant : p));
  }, [episode, total]);

  useEffect(() => {
    if (!joue) return undefined;
    const minuteur = setInterval(suivre, 100);
    return () => clearInterval(minuteur);
  }, [joue, suivre]);

  // Le texte est éclairé dès que l'épisode a commencé, en lecture comme en pause.
  const commence = joue || temps > 0;

  // LE TEXTE DÉFILE TOUT SEUL : la phrase dite reste dans le tiers haut de la zone, la suite sous les yeux. Seule la
  // zone de texte bouge, jamais la page. Un défilement à la main suspend le suivi quelques secondes.
  useEffect(() => {
    if (!texte || !commence || Date.now() < suspendu.current) return;
    const boite = zone.current;
    const courant = boite?.querySelector?.('[data-courant="oui"]');
    if (!boite || !courant?.getBoundingClientRect || !boite.scrollTo) return;

    const b = boite.getBoundingClientRect();
    const c = courant.getBoundingClientRect();
    const cible = boite.scrollTop + (c.top - b.top) - (boite.clientHeight * 0.3);
    const doux = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    boite.scrollTo({ top: Math.max(0, cible), behavior: doux ? 'smooth' : 'auto' });
  }, [position, texte, commence]);

  const suspendre = () => { suspendu.current = Date.now() + SUSPENSION_MS; };

  // « Tout écouter » avec le texte ouvert : le lecteur qui démarre vient sous les yeux.
  useEffect(() => {
    if (autoLecture && texteOuvert) racine.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const basculerTexte = () => {
    const ouvert = !texte;
    setTexte(ouvert);
    onTexte?.(ouvert);
  };

  const basculer = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const decaler = (secondes) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.duration || total) - 0.1, a.currentTime + secondes));
  };

  const aller = (secondes) => {
    const a = audio.current;
    if (!a) return;
    a.currentTime = secondes;
    // Il a choisi où aller : le suivi reprend tout de suite.
    suspendu.current = 0;
    if (a.paused) a.play()?.catch?.(() => {});
  };

  const vitesseSuivante = () => setVitesse((v) => VITESSES[(VITESSES.indexOf(v) + 1) % VITESSES.length]);

  return (
    <div
      ref={racine}
      className={`pod-lecteur${joue ? ' est-en-lecture' : ''}${illustre ? ' podx-lecteur' : ''}`}
      style={couleur ? { '--pod-teinte': couleur } : undefined}
    >
      <div className="pod-lecteur__tete">
        <span className="pod-lecteur__prof">
          {/* LA VRAIE TÊTE DU PROFESSEUR qui lit l'épisode (Camara, le 15/11/2026), plus grande sur la page illustrée ; ramenée à 64 px le 18/11/2026 (« c'est trop gros »). */}
          <Avatar nom={episode.voix ?? undefined} taille={64} parle={joue} />
        </span>
        <div className="pod-lecteur__titres">
          <span className="pod-lecteur__rang">
            {episode.notionTotal > 1 ? `Épisode ${episode.notionRang} sur ${episode.notionTotal}` : 'Épisode'}
            {episode.prof ? ` · avec ${episode.prof}` : ''}
          </span>
          <strong className="pod-lecteur__titre">{episode.titre}</strong>
        </div>
        {/* Une onde fixe, décorative : rien ne s'y anime (le PC de Camara ralentit). */}
        {illustre && (
          <span className="podx-onde" aria-hidden="true">
            {[30, 55, 40, 75, 50, 90, 60, 100, 70, 45, 80, 55, 35, 60, 40, 25].map((h, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <i key={i} style={{ '--h': `${h}%` }} />
            ))}
          </span>
        )}
      </div>

      {erreur ? (
        <p className="champ__erreur" role="alert">L’audio de cet épisode n’a pas pu être chargé. Réessaie dans un moment.</p>
      ) : (
        <>
          {/* L'élément audio lui-même, sans ses contrôles : ceux d'en dessous sont faits pour un enfant. */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            ref={audio}
            src={url ?? undefined}
            preload="metadata"
            onPlay={() => setJoue(true)}
            onPause={() => setJoue(false)}
            onEnded={() => { setJoue(false); onFin?.(); }}
            onTimeUpdate={(e) => { setTemps(e.currentTarget.currentTime); suivre(); }}
            onLoadedMetadata={(e) => { if (Number.isFinite(e.currentTarget.duration)) setTotal(e.currentTarget.duration); }}
          />

          <div className="pod-lecteur__barre">
            <span className="pod-lecteur__temps">{duree(temps)}</span>
            <input
              type="range"
              className="pod-lecteur__progression"
              min={0}
              max={Math.max(1, Math.round(total))}
              step={1}
              value={Math.min(Math.round(temps), Math.round(total))}
              disabled={!url}
              aria-label="Avancer ou reculer dans l’épisode"
              onChange={(e) => aller(Number(e.target.value))}
              style={{ '--pod-avance': `${total ? (temps / total) * 100 : 0}%` }}
            />
            <span className="pod-lecteur__temps">{duree(total)}</span>
          </div>

          <div className="pod-lecteur__commandes">
            <button type="button" className="pod-lecteur__saut" disabled={!url} onClick={() => decaler(-10)} aria-label="Reculer de 10 secondes">
              −10 s
            </button>
            <button
              type="button"
              className="pod-lecteur__jouer"
              disabled={!url}
              onClick={basculer}
              aria-label={joue ? 'Pause' : 'Écouter'}
            >
              {!url ? <span className="pod-lecteur__chargement" aria-hidden="true" /> : (
                <span className={joue ? 'pod-icone-pause' : 'pod-icone-jouer'} aria-hidden="true" />
              )}
            </button>
            <button type="button" className="pod-lecteur__saut" disabled={!url} onClick={() => decaler(10)} aria-label="Avancer de 10 secondes">
              +10 s
            </button>
            <button type="button" className="pod-lecteur__vitesse" onClick={vitesseSuivante} aria-label={`Vitesse de lecture : ${vitesse}`}>
              {String(vitesse).replace('.', ',')}×
            </button>
          </div>
        </>
      )}

      {(episode.paragraphes?.length > 0 || telechargeable) && (
        <div className="pod-lecteur__texte-zone">
          <div className="pod-lecteur__liens">
            {episode.paragraphes?.length > 0 && (
              <button
                type="button"
                className="pod-lecteur__afficher"
                aria-expanded={texte}
                onClick={basculerTexte}
              >
                {illustre && <span className="podx-icone-texte" aria-hidden="true" />}
                {texte ? 'Masquer le texte' : 'Lire en même temps'}
                {illustre && <span className={`podx-chevron${texte ? ' est-ouvert' : ''}`} aria-hidden="true" />}
              </button>
            )}
            {telechargeable && (
              <button
                type="button"
                className="pod-lecteur__telecharger"
                disabled={telechargement === 'prepare'}
                onClick={telecharger}
              >
                <span className="pod-icone-telecharger" aria-hidden="true" />
                {telechargement === 'prepare' ? 'Préparation du MP3…' : 'Télécharger en MP3'}
              </button>
            )}
          </div>
          {telechargement === 'erreur' && (
            <p className="champ__erreur" role="alert">Le MP3 n’a pas pu être préparé. Réessaie dans un moment.</p>
          )}
          {texte && episode.paragraphes?.length > 0 && (
            <div
              ref={zone}
              className="pod-lecteur__texte"
              onWheel={suspendre}
              onTouchMove={suspendre}
              onPointerDown={suspendre}
            >
              {episode.paragraphes.map((p, i) => {
                const enCours = commence && i === position.paragraphe;

                // Sans repères (épisode fait avant) : le paragraphe estimé, entier.
                if (!avecReperes) {
                  return (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                    <p
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      className={enCours ? 'est-en-cours' : undefined}
                      data-courant={enCours ? 'oui' : undefined}
                      onClick={() => url && aller(debutDuParagraphe(episode.paragraphes, i, total))}
                    >
                      {p}
                    </p>
                  );
                }

                const repere = episode.reperes[i];
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <p key={i} className={enCours ? 'est-en-cours' : undefined}>
                    {phrasesDuParagraphe(p, repere.coupes).map((phrase, k) => {
                      const dite = enCours && k === position.phrase;
                      const passee = commence && (i < position.paragraphe || (enCours && k < position.phrase));
                      return (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                        <span
                          // eslint-disable-next-line react/no-array-index-key
                          key={k}
                          className={`pod-phrase${dite ? ' est-dite' : ''}${passee ? ' est-passee' : ''}`}
                          data-courant={dite ? 'oui' : undefined}
                          onClick={() => url && aller(repere.temps[k])}
                        >
                          {phrase}
                        </span>
                      );
                    })}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
