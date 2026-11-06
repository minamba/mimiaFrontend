import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  DELAI_SILENCE_MS, SEUIL_VOIX, diagnostic, etatDeLErreur, etatDuSilence,
  lireEnvironnement, niveauDe,
} from '../../lib/tutoriel/diagnosticMicro';

const PERIODE_MS = 50;

/**
 * Les micros de l'appareil. Sans accès accordé, leurs noms restent vides.
 *
 * `null` QUAND ON NE PEUT PAS SAVOIR, ce qui n'est pas « aucun micro » : un
 * navigateur sans cette fonction ne dit rien de ce qui est branché.
 */
async function listerMicros() {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return null;

    const appareils = await navigator.mediaDevices.enumerateDevices();
    return appareils.filter((a) => a.kind === 'audioinput');
  } catch {
    return null;
  }
}

/**
 * LA BARRE D'ADRESSE, MONTRÉE DU DOIGT — Camara, le 03/11/2026 : « quand tu parles
 * d'une chose, montre-la clairement à l'écran ». Une page ne peut rien dessiner sur
 * le navigateur : une flèche pointe depuis le haut de la page vers l'endroit où se
 * trouve le réglage, et un dessin reproduit ce qu'on y voit.
 *
 * Portée à la racine : dans la bulle centrée, déplacée par un `transform`, une
 * position fixe se calculerait par rapport à la bulle et non à l'écran.
 */
function FlecheBarreAdresse() {
  return createPortal(
    <div className="tuto-fleche" aria-hidden="true">
      <span className="tuto-fleche__pointe">⬆</span>
      <span className="tuto-fleche__texte">C’est ici, dans la barre d’adresse</span>
    </div>,
    document.body,
  );
}

function DessinBarreAdresse({ firefox }) {
  return (
    <div className="tuto-dessin" role="img" aria-label="Dessin de la barre d’adresse du navigateur">
      <div className="tuto-dessin__barre">
        <span className="tuto-dessin__icone">{firefox ? '🎙️' : '🎤'}</span>
        {/* Toujours l'adresse que le parent connaît, même lancé en local. */}
        <span className="tuto-dessin__adresse">mimia.fr</span>
      </div>
      {!firefox && (
        <div className="tuto-dessin__panneau">
          <span>🎤 Micro</span>
          <span className="tuto-dessin__interrupteur" />
        </div>
      )}
    </div>
  );
}

/**
 * LE TEST DU MICRO — Camara, le 02/11/2026, puis le 03/11 : « si pas de son, il faut
 * proposer des solutions », au bout de 20 secondes. On dit ce qu'on a vérifié, ce qui
 * manque, et quoi faire, en parlant de son micro par son nom.
 *
 * L'accès n'est demandé qu'au clic : un navigateur, sur iPhone surtout, refuse une
 * demande qui ne vient pas d'un geste. Avant ce clic, on regarde déjà sans rien
 * demander : aucun micro branché, ou un accès déjà refusé, se disent tout de suite.
 *
 * LE SON NE VA NULLE PART. On mesure un niveau sur l'appareil, rien n'est enregistré
 * ni envoyé, et le micro est relâché dès qu'on quitte cette étape. Rien ne bloque non
 * plus la suite du tutoriel : « Suivant » reste là.
 */
export default function TestMicro() {
  const [etat, setEtat] = useState('attente');
  const [niveau, setNiveau] = useState(0);
  const [entendu, setEntendu] = useState(false);
  const [sansSon, setSansSon] = useState(null);
  const [nomMicro, setNomMicro] = useState('');
  const [micros, setMicros] = useState([]);
  const [microChoisi, setMicroChoisi] = useState('');

  const fluxRef = useRef(null);
  const contexteRef = useRef(null);
  const minuteurRef = useRef(null);
  const etatRef = useRef(etat);
  etatRef.current = etat;

  const env = useMemo(
    () => lireEnvironnement(navigator.userAgent, navigator.maxTouchPoints),
    [],
  );
  const site = window.location.host || 'ce site';

  const relacher = useCallback(() => {
    clearInterval(minuteurRef.current);
    minuteurRef.current = null;
    fluxRef.current?.getTracks().forEach((piste) => { piste.onended = null; piste.stop(); });
    fluxRef.current = null;
    contexteRef.current?.close?.()?.catch?.(() => {});
    contexteRef.current = null;
  }, []);

  useEffect(() => relacher, [relacher]);

  const tester = useCallback(async (idMicro) => {
    relacher();
    setEntendu(false);
    setSansSon(null);
    setNiveau(0);

    if (!navigator.mediaDevices?.getUserMedia) {
      setEtat('indisponible');
      return;
    }

    setEtat('demande');

    try {
      const flux = await navigator.mediaDevices.getUserMedia({
        audio: idMicro ? { deviceId: { exact: idMicro } } : true,
      });
      fluxRef.current = flux;

      const piste = flux.getAudioTracks?.()[0];
      setNomMicro(piste?.label ?? '');

      // Les noms ne sont lisibles qu'une fois l'accès donné.
      const presents = await listerMicros();
      if (presents) setMicros(presents);
      setMicroChoisi(piste?.getSettings?.().deviceId ?? idMicro ?? '');

      if (piste) {
        piste.onended = () => {
          clearInterval(minuteurRef.current);
          setEtat('debranche');
        };
      }

      const Contexte = window.AudioContext || window.webkitAudioContext;
      const contexte = new Contexte();
      contexteRef.current = contexte;
      await contexte.resume?.();

      const analyseur = contexte.createAnalyser();
      analyseur.fftSize = 1024;
      contexte.createMediaStreamSource(flux).connect(analyseur);

      const donnees = new Float32Array(analyseur.fftSize);
      const debut = Date.now();
      let crete = 0;
      let voixEntendue = false;

      setEtat('ecoute');

      minuteurRef.current = setInterval(() => {
        analyseur.getFloatTimeDomainData(donnees);

        const valeur = niveauDe(donnees);
        setNiveau(valeur);
        crete = Math.max(crete, valeur);

        if (valeur >= SEUIL_VOIX) {
          // Le son revient, même après un diagnostic : le problème est réglé.
          voixEntendue = true;
          setEntendu(true);
          setSansSon(null);
        } else if (!voixEntendue && Date.now() - debut >= DELAI_SILENCE_MS) {
          setSansSon(etatDuSilence(crete));
        }
      }, PERIODE_MS);
    } catch (erreur) {
      relacher();
      setEtat(etatDeLErreur(erreur));
    }
  }, [relacher]);

  // CE QU'ON SAIT SANS RIEN DEMANDER : ni fenêtre d'autorisation ni micro ouvert.
  useEffect(() => {
    let vivant = true;

    (async () => {
      try {
        const droit = await navigator.permissions?.query?.({ name: 'microphone' });
        if (vivant && droit?.state === 'denied') {
          setEtat('refuse');
          return;
        }
      } catch {
        // Firefox ne connaît pas cette question : on saura au clic.
      }

      const presents = await listerMicros();
      if (vivant && presents?.length === 0) setEtat('absent');
    })();

    return () => { vivant = false; };
  }, []);

  // UN MICRO BRANCHÉ, RETIRÉ OU RALLUMÉ PENDANT LE TEST : la liste suit, et le test
  // reprend tout seul s'il attendait justement ce branchement.
  useEffect(() => {
    const appareils = navigator.mediaDevices;
    if (!appareils?.addEventListener) return undefined;

    const auChangement = async () => {
      const presents = await listerMicros();
      if (!presents) return;

      setMicros(presents);

      if (presents.length === 0) {
        if (etatRef.current !== 'attente') relacher();
        setEtat('absent');
      } else if (etatRef.current === 'absent' || etatRef.current === 'debranche') {
        tester();
      }
    };

    appareils.addEventListener('devicechange', auChangement);
    return () => appareils.removeEventListener('devicechange', auChangement);
  }, [relacher, tester]);

  const probleme = etat === 'ecoute' && !entendu && sansSon ? sansSon : etat;
  const avis = ['attente', 'demande', 'ecoute'].includes(probleme)
    ? null
    : diagnostic(probleme, {
      env, site, nomMicro, plusieursMicros: micros.length > 1,
    });

  return (
    <div className="tuto-micro">
      {(etat === 'attente' || etat === 'demande') && (
        <button
          type="button"
          className="tuto-bouton"
          onClick={() => tester()}
          disabled={etat === 'demande'}
        >
          {etat === 'demande' ? 'En attente de votre accord…' : '🎤 Tester mon micro'}
        </button>
      )}

      {etat === 'demande' && (
        <p className="tuto-micro__aide">
          Le navigateur vous demande l’autorisation : cliquez sur « Autoriser ».
        </p>
      )}

      {etat === 'ecoute' && (
        <>
          <div
            className="tuto-micro__jauge"
            role="meter"
            aria-label="Niveau du micro"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(niveau * 100)}
          >
            <span style={{ width: `${Math.round(niveau * 100)}%` }} />
          </div>

          {entendu && <p className="tuto-micro__ok">✅ Parfait, le micro fonctionne.</p>}

          {!entendu && !sansSon && (
            <p className="tuto-micro__aide">
              {nomMicro ? `J’écoute « ${nomMicro} ». ` : ''}
              Parlez à voix normale : la barre doit bouger.
            </p>
          )}
        </>
      )}

      {avis && (
        <div className="tuto-micro__souci">
          <p className="tuto-micro__titre"><strong>{avis.titre}</strong></p>

          <ul className="tuto-micro__constats">
            {avis.constats.map((c) => (
              <li key={c.texte}>
                <span aria-hidden="true">{c.ok ? '✅' : '❌'}</span> {c.texte}
              </li>
            ))}
          </ul>

          {avis.montrerBarre && <DessinBarreAdresse firefox={env.navigateur === 'firefox'} />}

          <ol className="tuto-micro__etapes">
            {avis.etapes.map((texte) => <li key={texte}>{texte}</li>)}
          </ol>

          {avis.lien && (
            <a className="tuto-micro__lien" href={avis.lien.adresse}>
              {avis.lien.texte}
            </a>
          )}
        </div>
      )}

      {avis?.montrerBarre && <FlecheBarreAdresse />}

      {/* PLUSIEURS MICROS : on écoute peut-être le mauvais, et le parent n'a aucun
          moyen de le savoir sans la liste. */}
      {etat === 'ecoute' && micros.length > 1 && (
        <label className="tuto-micro__choix">
          Micro utilisé
          <select
            value={microChoisi}
            onChange={(evenement) => tester(evenement.target.value)}
          >
            {micros.map((m, i) => (
              <option key={m.deviceId || i} value={m.deviceId}>
                {m.label || `Micro ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
      )}

      {avis && etat !== 'indisponible' && etat !== 'debranche' && (
        <button type="button" className="tuto-bouton tuto-bouton--discret" onClick={() => tester()}>
          Réessayer
        </button>
      )}
    </div>
  );
}
