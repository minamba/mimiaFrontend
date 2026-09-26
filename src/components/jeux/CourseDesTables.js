import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, ESSAIS_AVANT_AIDE, MANCHES, methode, PHRASES, serie,
} from '../../lib/jeux/courseDesTables';
import { commun, repliquesCourse } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import CalculMental from './CalculMental';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * LA COURSE DES TABLES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `courseDesTables.js`, y compris pourquoi il n'y a
 * pas de chronomètre.
 *
 * UNE CARTE TOUCHÉE EST UNE RÉPONSE : il n'y a qu'un résultat à trouver,
 * rien à assembler, donc rien à annoncer — comme les mots éclair.
 *
 * LA PISTE EST LE SCORE : dix cases, la voiture avance d'une case par bonne
 * réponse du premier coup. L'enfant voit sa course avancer, pas un nombre.
 */
function CourseDesTablesAvantCM1({ onQuitter, matiereCode, niveau = 'CE1' }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine, niveau), [graine, niveau]);

  const [manche, setManche] = useState(0);
  const [fautes, setFautes] = useState([]);
  const [trouve, setTrouve] = useState(false);
  const [avance, setAvance] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const { a, b } = courante;
  const montrer = !trouve && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laQuestion = courante.jumelle ? repliquesCourse.jumelle(a, b) : repliquesCourse.question(a, b);

  useEffect(() => {
    if (!fini) dire(manche === 0 ? [repliquesCourse.consigne, laQuestion] : laQuestion);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laQuestion.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(avance, MANCHES));
  }, [fini, avance, dire]);

  const choisir = useCallback((r) => {
    if (termine) return;
    if (r === a * b) {
      setTrouve(true);
      if (fautes.length === 0) setAvance((n) => n + 1);
      dire(commun.bravo(manche));
      return;
    }
    setFautes((f) => [...f, r]);
    dire(courante.jumelle ? repliquesCourse.rappelJumelle : repliquesCourse.methode(a, b));
  }, [termine, a, b, fautes.length, courante.jumelle, manche, dire]);

  const suivante = useCallback(() => {
    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setTrouve(false);
  }, [manche]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setTrouve(false);
    setAvance(0);
    setFini(false);
  }, []);

  if (fini) {
    return (
      <FinDePartie
        score={avance}
        total={MANCHES}
        mot={bilan(avance)}
        onRejouer={rejouer}
        onQuitter={onQuitter}
      />
    );
  }

  return (
    <div className="jeu jeu--scene jeu--course">
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      {/* LA COURSE N'A PAS DE RANGÉE DE MANCHES : sa piste EST son avancement.
          Les cœurs se posent donc au-dessus de la consigne, seul endroit
          commun à tous les écrans de ce jeu. `avance` y joue le rôle de
          `duPremierCoup` — c'est le même nombre sous un autre nom. */}
      <Coeurs manche={manche} duPremierCoup={avance} />

      <p className="jeu__consigne">
        {PHRASES.consigne}
        <BoutonsVoix voix={voix} consigne={laQuestion} />
      </p>

      {/* LA PISTE : dix cases et une arrivée. */}
      <div className="course__piste" role="img" aria-label={`Ta voiture a avancé de ${avance} cases sur ${MANCHES}`}>
        {Array.from({ length: MANCHES }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`course__case${i < avance ? ' est-parcourue' : ''}`} />
        ))}
        <Arrivee />
        <span
          className="course__voiture"
          style={{ left: `calc(${(avance / MANCHES) * 100}% * 0.9)` }}
          aria-hidden="true"
        >
          <Voiture />
        </span>
      </div>

      {/* LA QUESTION. Une jumelle rappelle d'abord le calcul qu'elle retourne. */}
      <div className="course__question">
        {courante.jumelle && (
          <p className="course__modele">
            {courante.modele[0]} × {courante.modele[1]} = {a * b}
          </p>
        )}
        <p className="course__calcul">
          {a} × {b} = {termine ? <strong>{a * b}</strong> : '?'}
        </p>
      </div>

      {!termine && (
        <ul className="scene__choix" aria-label="Choisis le résultat">
          {courante.choix.map((r) => (
            <li key={r}>
              <button
                type="button"
                className={`scene__carte${fautes.includes(r) ? ' est-fausse' : ''}`}
                onClick={() => choisir(r)}
                disabled={fautes.includes(r)}
              >
                {r}
              </button>
            </li>
          ))}
        </ul>
      )}

      {fautes.length > 0 && !termine && (
        <p className="jeu__trop" role="status">
          {courante.jumelle ? PHRASES.jumelle : methode(a, b)}
        </p>
      )}

      {termine && (
        <div className="jeu__gagne" role="status">
          {montrer && (
            <p className="scene__bulle">
              {courante.jumelle ? PHRASES.jumelle : methode(a, b)}
            </p>
          )}
          {trouve && <p className="jeu__gagne-calcul">{fautes.length === 0 ? 'Vroum ! Une case de plus.' : 'Trouvé !'}</p>}
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * LA VOITURE ET L'ARRIVÉE SONT DESSINÉES, pas des émojis : sur certains
 * écrans l'émoji de course sortait minuscule, et la voiture est tout le score.
 */
function Voiture() {
  return (
    <svg viewBox="0 0 64 30" className="course__dessin-voiture">
      {/* ELLE ROULE VERS LE DRAPEAU — Camara, le 22/09/2026 : « la voiture est
          à l'envers ». Elle était dessinée capot à gauche, donc elle reculait
          le long de la piste à mesure qu'elle avançait. Le dessin est retourné
          ici plutôt que retracé point par point : une symétrie ne peut pas se
          tromper de coordonnée, et le capot, le pare-brise et les roues
          gardent exactement leurs proportions. */}
      <g transform="translate(64 0) scale(-1 1)">
        <path d="M4 20 L10 12 L24 10 L34 3 L48 4 L56 12 L61 14 L61 21 L4 22 Z" fill="#e63946" stroke="#9b1c27" strokeWidth="1.5" />
        <path d="M28 10 L35 5 L46 5.5 L51 11 Z" fill="#cfeaf8" />
        <circle cx="16" cy="22" r="6" fill="#2c2c36" />
        <circle cx="48" cy="22" r="6" fill="#2c2c36" />
        <circle cx="16" cy="22" r="2.4" fill="#b8bec8" />
        <circle cx="48" cy="22" r="2.4" fill="#b8bec8" />
      </g>
    </svg>
  );
}

function Arrivee() {
  return (
    <svg viewBox="0 0 24 28" className="course__arrivee" aria-hidden="true">
      <line x1="3" y1="2" x2="3" y2="27" stroke="#fff" strokeWidth="2" />
      {[0, 1, 2, 3].map((l) => [0, 1, 2].map((c) => (
        <rect key={`${l}-${c}`} x={4 + c * 6} y={2 + l * 4} width="6" height="4" fill={(l + c) % 2 ? '#111' : '#fff'} />
      )))}
    </svg>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `CalculMental.js` ; il lit la classe. */
export default function CourseDesTables({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <CalculMental niveau={niveau} {...props} /> : <CourseDesTablesAvantCM1 niveau={niveau} {...props} />;
}
