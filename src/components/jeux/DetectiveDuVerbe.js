import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, estSujet, estVerbe, MANCHES, phrase, PHRASES, questionSujet, serie,
} from '../../lib/jeux/detectiveDuVerbe';
import { commun, repliquesDetective } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import DetectiveClasses from './DetectiveClasses';

const ESSAIS_AVANT_AIDE = 2;

/**
 * LE DÉTECTIVE DU VERBE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `detectiveDuVerbe.js`.
 *
 * CHAQUE MOT DE LA PHRASE EST UN BOUTON. Au premier temps on cherche le
 * verbe, au second le sujet ; un mot faux reste barré le temps de la
 * question. Le verbe trouvé est souligné en rouge, le sujet en bleu — les
 * couleurs de la classe — et chacun garde aussi son étiquette écrite dessous,
 * pour ne pas reposer sur la couleur seule.
 *
 * LA MANCHE COMPTE « DU PREMIER COUP » si le verbe ET le sujet ont été
 * trouvés sans erreur.
 */
/** Au CE2, le détective enquête sur les classes de mots — voir `DetectiveClasses.js`. */
export default function DetectiveDuVerbe({ niveau, ...props }) {
  return niveau === 'CE2' ? <DetectiveClasses {...props} /> : <DetectiveVerbeSujet {...props} />;
}

function DetectiveVerbeSujet({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [temps, setTemps] = useState('verbe');
  const [fautes, setFautes] = useState([]);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const p = phrase(manches[manche]);
  const montrer = fautes.length >= ESSAIS_AVANT_AIDE;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = temps === 'verbe' ? repliquesDetective.consigneVerbe : repliquesDetective.sujet(p);

  useEffect(() => {
    if (!fini && temps !== 'fini') dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const toucher = useCallback((i) => {
    if (temps === 'fini') return;
    const bon = temps === 'verbe' ? estVerbe(p, i) : estSujet(p, i);
    if (bon) {
      setFautes([]);
      if (temps === 'verbe') setTemps('sujet');
      else {
        setTemps('fini');
        dire(commun.bravo(manche));
      }
      return;
    }
    setPropre(false);
    setFautes((f) => [...f, i]);
    dire(temps === 'verbe' ? repliquesDetective.erreurVerbe : repliquesDetective.erreurSujet);
  }, [temps, p, manche, dire]);

  // Au bout de deux erreurs, on montre le bon mot et on passe au temps suivant.
  const passer = useCallback(() => {
    setFautes([]);
    setTemps((t) => (t === 'verbe' ? 'sujet' : 'fini'));
  }, []);

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((n) => n + 1);
    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setTemps('verbe');
    setFautes([]);
    setPropre(true);
  }, [manche, propre]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setTemps('verbe');
    setFautes([]);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
  }, []);

  if (fini) {
    return (
      <div className="jeu jeu--fini">
        <p className="jeu__bilan-score">
          {duPremierCoup} <span>sur {MANCHES}</span>
        </p>
        <p className="jeu__bilan-mot">{bilan(duPremierCoup)}</p>

        <div className="jeu__actions">
          <button type="button" className="btn btn--principal" onClick={rejouer}>
            Rejouer
          </button>
          <button type="button" className="btn-ghost" onClick={onQuitter}>
            Revenir aux jeux
          </button>
        </div>
      </div>
    );
  }

  const verbeTrouve = temps !== 'verbe';
  const sujetTrouve = temps === 'fini';

  return (
    <div className="jeu jeu--scene jeu--detective">
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={m}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {temps === 'fini' ? 'Bien joué, détective !' : laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      <p className="detective__phrase" aria-label="La phrase">
        {p.mots.map((mot, i) => {
          const verbe = verbeTrouve && estVerbe(p, i);
          const sujet = sujetTrouve && estSujet(p, i);
          const montre = montrer && (temps === 'verbe' ? estVerbe(p, i) : estSujet(p, i));
          return (
            <button
              // Les mots d'une phrase peuvent se répéter : la place est l'identité.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              type="button"
              className={`detective__mot${verbe ? ' est-verbe' : ''}${sujet ? ' est-sujet' : ''}${fautes.includes(i) ? ' est-faux' : ''}${montre ? ' est-montre' : ''}`}
              onClick={() => toucher(i)}
              disabled={temps === 'fini' || fautes.includes(i) || montrer || verbe}
            >
              {mot}
              {verbe && <span className="detective__etiquette">verbe</span>}
              {sujet && i === p.sujet[0] && <span className="detective__etiquette">sujet</span>}
            </button>
          );
        })}
      </p>

      {fautes.length > 0 && !montrer && (
        <p className="jeu__trop" role="status">{temps === 'verbe' ? PHRASES.erreurVerbe : PHRASES.erreurSujet}</p>
      )}

      {montrer && (
        <div className="jeu__gagne" role="status">
          <p className="scene__bulle">Regarde : {temps === 'verbe' ? 'voici le verbe.' : 'voici le sujet.'}</p>
          <button type="button" className="btn btn--principal" onClick={passer}>
            Continuer
          </button>
        </div>
      )}

      {temps === 'fini' && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">
            {questionSujet(p).replace(' Touche le sujet.', '')}
            {' '}<strong>{p.sujet.map((i) => p.mots[i].replace(/[,.]$/, '')).join(' ')}</strong>
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
