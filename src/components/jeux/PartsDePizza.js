import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, cle, ERREURS, ESSAIS_AVANT_AIDE, MANCHES, PHRASES, reponse, serie, verdict,
} from '../../lib/jeux/partsDePizza';
import { commun, repliquesPizza } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import FractionsCM1 from './FractionsCM1';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * LES PARTS DE PIZZA, À L'ÉCRAN.
 *
 * Toute la règle vit dans `partsDePizza.js`, y compris pourquoi les pizzas
 * n'apparaissent qu'après la comparaison.
 *
 * UNE FRACTION TOUCHÉE EST UNE RÉPONSE — une seule à trouver, rien à
 * assembler. Les fractions s'écrivent comme au tableau, un nombre sur
 * l'autre, jamais « 3/4 » : c'est la forme que l'enfant apprend à lire.
 */
function PartsDePizzaAvantCM1({ onQuitter, matiereCode, niveau = 'CE1' }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine, niveau), [graine, niveau]);

  const [manche, setManche] = useState(0);
  const [fautes, setFautes] = useState([]);
  const [sens, setSens] = useState(null);
  const [trouve, setTrouve] = useState(false);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const { mode } = courante;
  const montrer = !trouve && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;
  const bonne = reponse(courante);

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesPizza.consigne(mode);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const choisir = useCallback((f) => {
    if (termine) return;
    const s = verdict(f, courante);
    if (s === 'juste') {
      setTrouve(true);
      setSens(null);
      if (fautes.length === 0) setDuPremierCoup((n) => n + 1);
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = [...fautes, cle(f)];
    setFautes(suivantes);
    setSens(s);
    dire(suivantes.length >= ESSAIS_AVANT_AIDE ? repliquesPizza.aide : repliquesPizza.erreur(s));
  }, [termine, courante, fautes, manche, dire]);

  const suivante = useCallback(() => {
    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setSens(null);
    setTrouve(false);
  }, [manche]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setSens(null);
    setTrouve(false);
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

  return (
    <div className="jeu jeu--scene jeu--pizza">
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

      {/* CE QU'ON REGARDE : une pizza à lire, deux pizzas révélées après la
          comparaison, ou l'addition et ses pizzas. */}
      {mode === 'lire' && <Pizzas {...courante.fraction} grande />}

      {/* ÉGALER : la fraction connue et sa pizza, l'autre coupée plus fin. */}
      {mode === 'egaler' && (
        <div className="pizza__addition">
          <Pizza {...courante.modele} />
          <span className="pizza__signe">=</span>
          <Pizza n={termine ? courante.fraction.n : 0} d={courante.fraction.d} />
          <p className="pizza__calcul">
            <Fraction {...courante.modele} /> =
            {termine ? <Fraction {...bonne} /> : <Fraction n="?" d={courante.fraction.d} />}
          </p>
        </div>
      )}

      {mode === 'comparer' && termine && (
        <div className="pizza__rangee">
          {courante.choix.map((f) => <Pizza key={cle(f)} {...f} />)}
        </div>
      )}

      {mode === 'additionner' && (
        <div className="pizza__addition">
          <Pizza {...courante.termes[0]} />
          <span className="pizza__signe">+</span>
          <Pizza {...courante.termes[1]} />
          {termine && bonne.n > bonne.d && (
            <>
              <span className="pizza__signe">=</span>
              <Pizzas {...bonne} />
            </>
          )}
          <p className="pizza__calcul">
            <Fraction {...courante.termes[0]} /> + <Fraction {...courante.termes[1]} /> =
            {termine ? <Fraction {...bonne} /> : ' ?'}
          </p>
        </div>
      )}

      {!termine && (
        <ul className="scene__choix" aria-label="Choisis la fraction">
          {courante.choix.map((f) => (
            <li key={cle(f)}>
              <button
                type="button"
                className={`scene__carte pizza__choix${fautes.includes(cle(f)) ? ' est-fausse' : ''}`}
                onClick={() => choisir(f)}
                disabled={fautes.includes(cle(f))}
                aria-label={`${f.n} sur ${f.d}`}
              >
                <Fraction {...f} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {sens && !termine && <p className="jeu__trop" role="status">{PHRASES[ERREURS[sens]]}</p>}

      {termine && (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="scene__bulle">{PHRASES.aide}</p>}
          <p className="jeu__gagne-calcul pizza__reponse">
            <Fraction {...bonne} />
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}

/** Une fraction écrite comme au tableau : un nombre sur l'autre. */
function Fraction({ n, d }) {
  return (
    <span className="fraction" aria-label={`${n} sur ${d}`}>
      <span className="fraction__haut">{n}</span>
      <span className="fraction__bas">{d}</span>
    </span>
  );
}

/**
 * PLUS D'UNE PIZZA : 5/4, c'est une pizza entière garnie et un quart d'une
 * seconde. Chaque pizza reste coupée en `d` : c'est ce qui permet de compter
 * les cinq quarts.
 */
function Pizzas({ n, d, grande }) {
  if (n <= d) return <Pizza n={n} d={d} grande={grande} />;
  const pleines = Math.floor(n / d);
  const reste = n % d;
  return (
    <div className="pizza__rangee">
      {Array.from({ length: pleines }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Pizza key={i} n={d} d={d} />
      ))}
      {reste > 0 && <Pizza n={reste} d={d} />}
    </div>
  );
}

/**
 * UNE PIZZA COUPÉE EN `d` PARTS ÉGALES, dont `n` garnies. Les parts vides
 * restent de la pâte : la pizza entière est toujours visible, c'est « le
 * tout » dont la fraction est une partie.
 */
function Pizza({ n, d, grande }) {
  const r = 46;
  const part = (i) => {
    const a0 = (i / d) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
    const x0 = 50 + r * Math.cos(a0);
    const y0 = 50 + r * Math.sin(a0);
    const x1 = 50 + r * Math.cos(a1);
    const y1 = 50 + r * Math.sin(a1);
    return `M50 50 L${x0} ${y0} A${r} ${r} 0 ${1 / d > 0.5 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  return (
    <svg
      className={`pizza${grande ? ' pizza--grande' : ''}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Une pizza coupée en ${d} parts, ${n} garnie${n > 1 ? 's' : ''}`}
    >
      <circle cx="50" cy="50" r="49" className="pizza__croute" />
      {Array.from({ length: d }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <path key={i} d={part(i)} className={i < n ? 'pizza__garnie' : 'pizza__vide'} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const a = ((i + 0.5) / d) * 2 * Math.PI - Math.PI / 2;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <circle key={i} cx={50 + 27 * Math.cos(a)} cy={50 + 27 * Math.sin(a)} r="5" className="pizza__rondelle" />
        );
      })}
    </svg>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `FractionsCM1.js` ; il lit la classe. */
export default function PartsDePizza({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <FractionsCM1 niveau={niveau} {...props} /> : <PartsDePizzaAvantCM1 niveau={niveau} {...props} />;
}
