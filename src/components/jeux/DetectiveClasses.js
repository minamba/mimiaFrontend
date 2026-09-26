import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, MANCHES, NOMS_CLASSES, PHRASES_CE2, PHRASES_CLASSES, serieCE2,
} from '../../lib/jeux/detectiveDuVerbe';
import { commun, repliquesDetective } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

const ESSAIS_AVANT_AIDE = 2;

/**
 * LE DÉTECTIVE DES CLASSES — le détective du verbe au CE2, à l'écran.
 *
 * Toute la règle vit dans `detectiveDuVerbe.js`, section « le CE2 ».
 *
 * CHAQUE MOT EST UN BOUTON ; un mot faux reste barré, avec sous lui
 * l'étiquette de sa classe — l'erreur apprend quelque chose même quand elle
 * est une erreur. Le bon mot, une fois trouvé, porte la sienne en vert.
 */
export default function DetectiveClasses({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serieCE2(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [fautes, setFautes] = useState([]);
  const [trouve, setTrouve] = useState(null);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const { phrase: indice, cible } = manches[manche];
  const p = PHRASES_CE2[indice];
  const montrer = trouve === null && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve !== null || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesDetective.consigneClasse(cible);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const toucher = useCallback((i) => {
    if (termine) return;
    if (p.classes[i] === cible) {
      setTrouve(i);
      if (fautes.length === 0) setDuPremierCoup((n) => n + 1);
      dire(commun.bravo(manche));
      return;
    }
    setFautes((f) => [...f, i]);
    dire([repliquesDetective.estUn(p.classes[i]), repliquesDetective.definition(cible)]);
  }, [termine, p, cible, fautes.length, manche, dire]);

  const suivante = useCallback(() => {
    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setTrouve(null);
  }, [manche]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setTrouve(null);
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

  const derniere = fautes[fautes.length - 1];

  return (
    <div className="jeu jeu--scene jeu--detective">
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      <p className="detective__phrase" aria-label="La phrase">
        {p.mots.map((mot, i) => {
          const faux = fautes.includes(i);
          const bon = trouve === i || (montrer && p.classes[i] === cible);
          return (
            <button
              // Les mots d'une phrase peuvent se répéter : la place est l'identité.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              type="button"
              className={`detective__mot${faux ? ' est-faux' : ''}${bon ? ' est-montre' : ''}`}
              onClick={() => toucher(i)}
              disabled={termine || faux}
            >
              {mot}
              {(faux || bon) && p.classes[i] !== 'autre' && (
                <span className="detective__etiquette">{NOMS_CLASSES[p.classes[i]].replace(/^une? /, '')}</span>
              )}
            </button>
          );
        })}
      </p>

      {derniere !== undefined && !termine && (
        <p className="jeu__trop" role="status">
          {PHRASES_CLASSES.estUn(p.classes[derniere])} {PHRASES_CLASSES.definition[cible]}
        </p>
      )}

      {termine && (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="scene__bulle">{PHRASES_CLASSES.definition[cible]}</p>}
          {trouve !== null && <p className="jeu__gagne-calcul">Bien vu, détective&nbsp;!</p>}
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
