import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, ESSAIS_AVANT_AIDE, MANCHES, negative, phrase, PHRASES, serie, verdict,
} from '../../lib/jeux/phraseQuiDitNon';
import { commun, repliquesNegation } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import TransformerPhrase from './TransformerPhrase';
import PhrasesCM1 from './PhrasesCM1';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * LA PHRASE QUI DIT NON, À L'ÉCRAN.
 *
 * Toute la règle vit dans `phraseQuiDitNon.js`.
 *
 * DEUX GESTES, DANS L'ORDRE DE L'ÉCRITURE : choisir « ne » ou « n' » puis
 * toucher un espace entre deux mots ; ensuite toucher l'espace de « pas ».
 * Toucher un mot posé le retire. Chaque espace est un vrai bouton — pas de
 * glisser, même raison que les autres jeux.
 */
/** Au CE2, on transforme la phrase — voir `TransformerPhrase.js`. */
function PhraseQuiDitNonAvantCM1({ niveau, ...props }) {
  return niveau === 'CE2' ? <TransformerPhrase {...props} /> : <PhraseQuiDitNonCE1 {...props} />;
}

function PhraseQuiDitNonCE1({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [forme, setForme] = useState(null);
  const [ne, setNe] = useState(null);
  const [pas, setPas] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const p = phrase(manches[manche]);
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesNegation.consigne;

  useEffect(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  // Ce que l'enfant pose maintenant : « ne » tant qu'il n'est pas posé, puis « pas ».
  const aPoser = ne === null ? 'ne' : (pas === null ? 'pas' : null);

  const poserDans = useCallback((espace) => {
    if (termine) return;
    setResultat(null);
    if (aPoser === 'ne' && forme) setNe(espace);
    else if (aPoser === 'pas' && espace !== ne) setPas(espace);
  }, [termine, aPoser, forme, ne]);

  const retirer = useCallback((quoi) => {
    if (termine) return;
    setResultat(null);
    if (quoi === 'ne') { setNe(null); setForme(null); } else setPas(null);
  }, [termine]);

  const annoncer = useCallback(() => {
    const r = verdict(p, { ne, pas, forme });
    setResultat(r);
    if (r === 'juste') {
      dire([commun.bravo(manche), repliquesNegation.phrase(manches[manche])]);
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    dire(suivantes >= ESSAIS_AVANT_AIDE ? repliquesNegation.aide : repliquesNegation.erreur(r));
  }, [p, ne, pas, forme, manche, manches, ratees, dire]);

  const suivante = useCallback(() => {
    if (juste && ratees === 0) setDuPremierCoup((n) => n + 1);
    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setForme(null);
    setNe(null);
    setPas(null);
    setResultat(null);
    setRatees(0);
  }, [manche, juste, ratees]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setForme(null);
    setNe(null);
    setPas(null);
    setResultat(null);
    setRatees(0);
    setDuPremierCoup(0);
    setFini(false);
  }, []);

  if (fini) {
    return (
      <FinDePartie
        score={duPremierCoup}
        total={MANCHES}
        mot={bilan(duPremierCoup)}
        onRejouer={rejouer}
        onQuitter={onQuitter}
      />
    );
  }

  /** Un espace entre deux mots : vide et touchable, ou portant ne / pas. */
  const espace = (k) => {
    if (ne === k) {
      return (
        <button type="button" className="non__pose non__pose--ne" onClick={() => retirer('ne')} disabled={termine} aria-label={`Retirer ${forme}`}>
          {forme}
        </button>
      );
    }
    if (pas === k) {
      return (
        <button type="button" className="non__pose non__pose--pas" onClick={() => retirer('pas')} disabled={termine} aria-label="Retirer pas">
          pas
        </button>
      );
    }
    if (termine || !aPoser || (aPoser === 'ne' && !forme)) return <span className="non__espace non__espace--fixe" />;
    return (
      <button type="button" className="non__espace" onClick={() => poserDans(k)} aria-label={`Poser ${aPoser === 'ne' ? forme : 'pas'} ici`} />
    );
  };

  const fautif = resultat && !termine;

  return (
    <div className="jeu jeu--scene jeu--non">
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={m}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      <p className="non__oui"><span className="non__marque">oui</span> {p.mots.join(' ')}</p>

      <p className={`non__phrase${fautif ? ' est-fautive' : ''}`} aria-label="La phrase à écrire">
        {termine ? (
          <span className="non__finale">{negative(p)}</span>
        ) : (
          <>
            {espace(0)}
            {p.mots.map((mot, i) => (
              // Les mots peuvent se répéter : la place est l'identité.
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={i}>
                <span className="non__mot">{mot}</span>
                {espace(i + 1)}
              </Fragment>
            ))}
          </>
        )}
      </p>

      {!termine && aPoser === 'ne' && (
        <div className="non__etiquettes" role="group" aria-label="Choisis ne ou n’">
          {['ne', 'n’'].map((f) => (
            <button
              key={f}
              type="button"
              className={`scene__carte non__etiquette${forme === f ? ' est-choisie' : ''}`}
              onClick={() => setForme(f)}
              aria-pressed={forme === f}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {!termine && aPoser === 'pas' && (
        <p className="scene__bulle">Maintenant, touche l’espace où poser « pas ».</p>
      )}

      {fautif && <p className="jeu__trop" role="status">{PHRASES[resultat]}</p>}

      {termine && (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="scene__bulle">{PHRASES.aide}</p>}
          <p className="jeu__gagne-calcul">La phrase dit non&nbsp;!</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {!termine && ne !== null && pas !== null && !resultat && (
        <button type="button" className="btn btn--principal" onClick={annoncer}>
          C’est prêt&nbsp;!
        </button>
      )}
    </div>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `PhrasesCM1.js` ; il lit la classe. */
export default function PhraseQuiDitNon({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <PhrasesCM1 niveau={niveau} {...props} /> : <PhraseQuiDitNonAvantCM1 niveau={niveau} {...props} />;
}
