import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { DEFI } from '../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as ms from '../../../lib/jeux/bonus/motSecret.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-mot-secret', ms);
const PAUSE = 1600;

/**
 * LE MOT SECRET — voir `lib/jeux/bonus/motSecret.js`. Les 26 lettres en roue ;
 * celle de la manche s'allume, celles déjà jouées passent au vert (trouvé) ou
 * au rouge (manqué). Au centre : « Commence par … », la définition, le chrono.
 */
export default function MotSecret({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const manches = useMemo(() => ms.serie(graine, niveau), [graine, niveau]);
  const secondes = ms.secondesParMot(niveau, mode === DEFI);
  const [index, setIndex] = useState(0);
  const [saisie, setSaisie] = useState('');
  const [issue, setIssue] = useState(null);
  const [tremble, setTremble] = useState(false);
  const [bilans, setBilans] = useState({});
  const [reste, setReste] = useState(secondes * 1000);
  const [fini, setFini] = useState(false);
  const debut = useRef(Date.now());

  const m = manches[index];
  const trouves = Object.values(bilans).filter((b) => b === 'trouve').length;
  const chrono = useChronoBonus('mot-secret', niveau, fini, { trouves, total: manches.length, unite: 'mot trouvé' }, { montre: false });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('fin')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  // Le chrono du mot : à zéro sans bonne réponse, le son de l'erreur, le mot montré, et la suite.
  useEffect(() => {
    if (issue || fini) return undefined;
    const id = setInterval(() => {
      const r = Math.max(0, secondes * 1000 - (Date.now() - debut.current));
      setReste(r);
      if (r === 0) {
        bruitage('mauvaise');
        voix.dire(dire('temps'));
        setBilans((b) => ({ ...b, [m.lettre]: 'manque' }));
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
      setSaisie('');
      setIssue(null);
      debut.current = Date.now();
      setReste(secondes * 1000);
    }, PAUSE);
    return () => clearTimeout(id);
  }, [issue]); // eslint-disable-line react-hooks/exhaustive-deps

  const proposer = (mot) => {
    if (issue || !String(mot).trim()) return;
    if (ms.estLeMot(mot, m.mot)) {
      bruitage('bonne');
      voix.dire(dire('bravo'));
      setBilans((b) => ({ ...b, [m.lettre]: 'trouve' }));
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
        jeu="bonus-mot-secret"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={trouves}
        total={manches.length}
        unite="mot trouvé"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const enJeu = new Set(manches.map((x) => x.lettre));
  const part = reste / (secondes * 1000);
  return (
    <div className="jeu bonus bonus--mot-secret">
      <EnTeteBonus titre="Le mot secret" sousTitre={`Mot ${index + 1} sur ${manches.length}`} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">{`${trouves} / ${manches.length}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="secret__table">
        <div className="secret__roue">
          {ms.LETTRES.map((l, i) => {
            const angle = (i / ms.LETTRES.length) * 2 * Math.PI - Math.PI / 2;
            const etat = l === m.lettre ? ' est-courante' : bilans[l] ? ` est-${bilans[l]}` : enJeu.has(l) ? ' est-a-venir' : '';
            return (
              <span
                key={l}
                className={`secret__lettre${etat}`}
                style={{ left: `${50 + 44 * Math.cos(angle)}%`, top: `${50 + 44 * Math.sin(angle)}%` }}
                aria-hidden="true"
              >
                {l}
              </span>
            );
          })}

          {/* LE CENTRE NE PORTE QUE LE CHRONO ET LA LETTRE (09/10/2026) : la
              définition et le champ, dedans, débordaient sur les lettres. */}
          <div className="secret__centre">
            <span className={`secret__minuteur${part < 0.3 ? ' est-presse' : ''}`} role="timer" aria-label={`${Math.ceil(reste / 1000)} secondes`}>
              {Math.ceil(reste / 1000)}
              s
            </span>
            <p className="secret__lettre-du-mot">
              <span className="secret__commence">Commence par</span>
              <span className="secret__initiale">{m.lettre}</span>
            </p>
          </div>
        </div>

        <div className="secret__panneau">
          <p className="secret__definition">{m.definition}</p>

          {issue ? (
            <p className={`secret__issue${issue === 'trouve' ? ' est-trouve' : ''}`} role="status">
              {issue === 'trouve' ? `Bravo : ${m.mot} !` : `C’était : ${m.mot}`}
            </p>
          ) : m.choix ? (
            <ul className={`secret__choix${tremble ? ' est-faux' : ''}`} aria-label="Choisis le mot">
              {m.choix.map((c) => (
                <li key={c}><button type="button" className="scene__carte" onClick={() => proposer(c)}>{c}</button></li>
              ))}
            </ul>
          ) : (
            <form className={`secret__saisie${tremble ? ' est-faux' : ''}`} onSubmit={(e) => { e.preventDefault(); proposer(saisie); }}>
              <label htmlFor="secret-mot" className="visuellement-cache">Le mot secret</label>
              <input
                id="secret-mot"
                className="mdp__champ"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder={`${m.lettre}…`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button type="submit" className="btn btn--principal">Valider</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
