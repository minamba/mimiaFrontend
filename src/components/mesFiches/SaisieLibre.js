import { useEffect, useRef, useState } from 'react';
import { ecouteService } from '../../lib/storage/ecouteService';
import { ecouteTempsReel } from '../../lib/storage/ecouteTempsReel';
import iconeVoix from '../../assets/voix.png';

/** Le plafond d'une dictée : au-delà, le micro se referme avec ce qui a été dit. */
const DICTEE_MAX_MS = 3 * 60 * 1000;

/** Un silence aussi long : il a fini de dicter. */
const SILENCE_FIN_MS = 8000;

/** Ajoute un morceau dicté à la suite du texte, avec une espace entre les deux. */
export function ajouterDicte(texte, morceau) {
  const propre = (morceau ?? '').trim();
  if (!propre) return texte;
  if (!texte.trim()) return propre;
  return /\s$/.test(texte) ? `${texte}${propre}` : `${texte} ${propre}`;
}

/**
 * LE BLOC D'UNE FICHE LIBRE — Camara, le 06/11/2026 : « à la place du bloc
 * importer le cours, un bloc où on peut saisir du texte ou parler au micro ».
 *
 * LE MICRO DU FORMULAIRE DE CONTRÔLE, PAS CELUI DES COURS : `ecouteTempsReel` sur
 * la route de dictée (`ecoute/dictee/{eleveId}`), la reconnaissance du navigateur
 * en secours — et pour le parent, qui n'a pas d'élève à qui rattacher la dictée.
 *
 * CE QUI EST DICTÉ S'AJOUTE AU TEXTE, à la suite : l'enfant peut taper, dicter,
 * corriger au clavier, dicter encore. Le micro reste ouvert tant qu'il parle ; il
 * se referme à son clic, après huit secondes de silence, ou au bout de trois
 * minutes.
 */
export default function SaisieLibre({
  eleveId, estParent, texte, onTexte, max, disabled,
  // LE RÉSUMÉ DE LIVRE (15/11/2026) : un titre et un auteur se saisissent sur une ou deux lignes.
  lignes = 8, etiquette, indication,
}) {
  const [ecoute, setEcoute] = useState(false);
  const [entendu, setEntendu] = useState('');
  const [erreur, setErreur] = useState(null);
  const ecouteRef = useRef(null);
  const minuteurs = useRef({ silence: null, plafond: null });
  // Le texte à jour pour les rappels du micro, qui ne voient que leur rendu d'origine.
  const texteRef = useRef(texte);
  texteRef.current = texte;

  const serveur = !estParent && ecouteTempsReel.supporte;
  const microDisponible = serveur || ecouteService.supporte;

  const ajouter = (morceau) => {
    const nouveau = ajouterDicte(texteRef.current, morceau).slice(0, max);
    texteRef.current = nouveau;
    onTexte(nouveau);
  };

  const fermer = () => {
    clearTimeout(minuteurs.current.silence);
    clearTimeout(minuteurs.current.plafond);
    minuteurs.current = { silence: null, plafond: null };
    // Détaché AVANT d'arrêter : la fermeture qu'il annonce en retour ne rappelle personne.
    const enCours = ecouteRef.current;
    ecouteRef.current = null;
    enCours?.arreter();
    setEntendu('');
    setEcoute(false);
  };

  // On quitte la page micro ouvert : il se referme.
  useEffect(() => () => {
    clearTimeout(minuteurs.current.silence);
    clearTimeout(minuteurs.current.plafond);
    ecouteRef.current?.arreter();
  }, []);

  const basculer = () => {
    if (ecoute) { fermer(); return; }

    setErreur(null);
    setEcoute(true);
    minuteurs.current.plafond = setTimeout(fermer, DICTEE_MAX_MS);

    if (serveur) {
      ecouteRef.current = ecouteTempsReel.ecouter({
        chemin: `dictee/${eleveId}`,
        onPartiel: (morceau) => setEntendu(morceau),
        onFinal: (morceau) => { setEntendu(''); ajouter(morceau); },
        onSilence: () => {
          clearTimeout(minuteurs.current.silence);
          minuteurs.current.silence = setTimeout(fermer, SILENCE_FIN_MS);
        },
        onReprise: () => clearTimeout(minuteurs.current.silence),
        onErreur: (message) => { setErreur(message); fermer(); },
        onFermeture: fermer,
      });
      return;
    }

    // Le micro du navigateur s'arrête de lui-même à la fin d'une phrase : on
    // ajoute ce qu'il a compris, et l'enfant rouvre le micro pour continuer.
    ecouteRef.current = ecouteService.ecouter({
      onPartiel: (morceau) => setEntendu(morceau),
      onFin: (tout) => { ajouter(tout); fermer(); },
      onErreur: (message) => { setErreur(message); fermer(); },
    });
  };

  return (
    <div className={`mf-libre${ecoute ? ' est-a-l-ecoute' : ''}`}>
      <textarea
        className="mf-libre__texte"
        value={texte}
        maxLength={max}
        rows={lignes}
        disabled={disabled}
        aria-label={etiquette ?? (estParent ? 'Ce que vous voulez réviser' : 'Ce que tu veux réviser')}
        placeholder={indication ?? (estParent
          ? 'Écrivez ici, ou dictez au micro : un sujet, des notes, une leçon…'
          : 'Écris ici, ou dicte au micro. Par exemple : « Le théorème de Pythagore », ou recopie ta leçon.')}
        onChange={(e) => onTexte(e.target.value)}
      />

      <div className="mf-libre__pied">
        {microDisponible && (
          <button
            type="button"
            className={`controle-form__voix mf-libre__micro${ecoute ? ' controle-form__voix--actif' : ''}`}
            onClick={basculer}
            disabled={disabled}
            aria-pressed={ecoute}
            aria-label={ecoute ? 'Arrêter le micro' : 'Dicter au micro'}
          >
            <img className="controle-form__voix-image" src={iconeVoix} alt="" />
          </button>
        )}
        <span className="mf-libre__etat" role="status">
          {ecoute ? (
            <>
              <strong>{estParent ? 'Je vous écoute…' : 'Je t’écoute…'}</strong>
              {entendu && <span className="mf-libre__entendu">« {entendu} »</span>}
            </>
          ) : microDisponible ? (
            <span>{estParent ? 'Touchez le micro pour dicter.' : 'Touche le micro pour dicter.'}</span>
          ) : null}
        </span>
        <span className="mf-libre__compteur">{texte.length} / {max}</span>
      </div>

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
    </div>
  );
}
