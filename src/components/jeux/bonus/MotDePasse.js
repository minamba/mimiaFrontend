import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { DEFI } from '../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as mdp from '../../../lib/jeux/bonus/motDePasse.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-mot-de-passe', mdp);
const PAUSE = 1600;

/**
 * LE MOT DE PASSE — voir `lib/jeux/bonus/motDePasse.js`. Trois cartes
 * d'indice (la première ouverte, les autres sous une loupe), un chrono par
 * mot, et la jauge des points. Le niveau et son thème sont sous le titre.
 */
export default function MotDePasse({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const manches = useMemo(() => mdp.serie(graine, niveau), [graine, niveau]);
  const secondes = mdp.secondesParMot(niveau, mode === DEFI);
  const [index, setIndex] = useState(0);
  const [ouverts, setOuverts] = useState(1);
  const [saisie, setSaisie] = useState('');
  const [issue, setIssue] = useState(null);
  const [tremble, setTremble] = useState(false);
  const [score, setScore] = useState({ trouves: 0, points: 0 });
  const [reste, setReste] = useState(secondes * 1000);
  const [fini, setFini] = useState(false);
  const debut = useRef(Date.now());

  const m = manches[index];
  const chrono = useChronoBonus('mot-de-passe', niveau, fini, { trouves: score.trouves, total: manches.length, unite: 'mot trouvé' }, { montre: false });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('fin')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  // Le chrono du mot : à zéro, le mot secret est montré, et on passe.
  useEffect(() => {
    if (issue || fini) return undefined;
    const id = setInterval(() => {
      const r = Math.max(0, secondes * 1000 - (Date.now() - debut.current));
      setReste(r);
      if (r === 0) {
        bruitage('mauvaise');
        voix.dire(dire('dommage'));
        setIssue('temps');
      }
    }, 100);
    return () => clearInterval(id);
  }, [index, issue, fini, secondes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!issue) return undefined;
    const id = setTimeout(() => {
      if (index + 1 >= manches.length) {
        setFini(true);
        return;
      }
      setIndex((i) => i + 1);
      setOuverts(1);
      setSaisie('');
      setIssue(null);
      debut.current = Date.now();
      setReste(secondes * 1000);
    }, PAUSE);
    return () => clearTimeout(id);
  }, [issue]); // eslint-disable-line react-hooks/exhaustive-deps

  const proposer = (mot) => {
    if (issue || !String(mot).trim()) return;
    if (mdp.estLeMot(mot, m.mot)) {
      bruitage('bonne');
      voix.dire(dire('bravo'));
      setScore((s) => ({ trouves: s.trouves + 1, points: s.points + mdp.points(ouverts) }));
      setIssue('trouve');
    } else {
      bruitage('mauvaise');
      setTremble(true);
      setTimeout(() => setTremble(false), 400);
    }
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-mot-de-passe"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={score.trouves}
        total={manches.length}
        unite="mot trouvé"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const part = reste / (secondes * 1000);
  return (
    <div className="jeu bonus bonus--mot-de-passe">
      <EnTeteBonus titre="Le mot de passe" sousTitre={`Niveau ${m.niveau} · ${m.theme}`} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">{`${score.points} point${score.points > 1 ? 's' : ''}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="mdp__table">
        <span className={`mdp__minuteur${part < 0.3 ? ' est-presse' : ''}`} role="timer" aria-label={`${Math.ceil(reste / 1000)} secondes`}>
          {Math.ceil(reste / 1000)}
          s
        </span>
        <ul className="mdp__indices" aria-label="Les indices">
          {m.indices.map((indice, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={i} className={`mdp__indice${i < ouverts || issue ? ' est-ouvert' : ''}`}>
              {i < ouverts || issue ? (
                <span className="mdp__mot-indice">{indice}</span>
              ) : (
                <button
                  type="button"
                  className="mdp__loupe"
                  onClick={() => { if (i === ouverts) setOuverts(ouverts + 1); }}
                  disabled={i !== ouverts}
                  aria-label={`Ouvrir l’indice ${i + 1} (un point de moins)`}
                >
                  🔍
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {issue ? (
        <p className={`mdp__issue${issue === 'trouve' ? ' est-trouve' : ''}`} role="status">
          {issue === 'trouve' ? `Bravo : ${m.mot} ! +${mdp.points(ouverts)}` : `Le mot secret était : ${m.mot}`}
        </p>
      ) : m.choix ? (
        <ul className={`mdp__choix${tremble ? ' est-faux' : ''}`} aria-label="Choisis le mot secret">
          {m.choix.map((c) => (
            <li key={c}>
              <button type="button" className="scene__carte" onClick={() => proposer(c)}>{c}</button>
            </li>
          ))}
        </ul>
      ) : (
        <form
          className={`mdp__saisie${tremble ? ' est-faux' : ''}`}
          onSubmit={(e) => { e.preventDefault(); proposer(saisie); }}
        >
          <label htmlFor="mdp-mot" className="visuellement-cache">Le mot secret</label>
          <input
            id="mdp-mot"
            className="mdp__champ"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Écris le mot secret…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button type="submit" className="btn btn--principal">Valider</button>
        </form>
      )}
    </div>
  );
}
