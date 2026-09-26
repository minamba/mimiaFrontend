import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/Jeux/CP/2par2.webp';
import {
  bilan, MANCHES, PHRASES, resultatDouble, resultatMoitie, serie, verdict,
} from '../../lib/jeux/deuxParDeux';
import { commun, repliquesDeux } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * DEUX PAR DEUX, À L'ÉCRAN.
 *
 * Toute la règle vit dans `deuxParDeux.js`, y compris pourquoi l'une des
 * assiettes est sous une cloche.
 *
 * NORA LIT LA QUESTION PUIS LES QUATRE RÉPONSES, et le bouton qu'elle nomme
 * s'éclaire — le même mécanisme que l'horloge.
 *
 * LA BONNE RÉPONSE SE MONTRE AUSSITÔT : au double, la cloche se lève sur les
 * biscuits cachés ; à la moitié, la grande assiette se partage en deux. Ce
 * qu'on vient de calculer, l'enfant le voit se vérifier.
 *
 * LE DÉCOR EST UNE IMAGE, LES ASSIETTES SONT DESSINÉES — la règle des autres
 * jeux. L'esplanade de la fête foraine, au centre, porte la table.
 */
export default function DeuxParDeux({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [choix, setChoix] = useState(null);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const double = courante.mode === 'double';
  const sens = choix === null ? null : verdict(choix, courante);
  const juste = sens === 'juste';

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = double ? repliquesDeux.consigneDouble : repliquesDeux.consigneMoitie;
  const aDire = [laConsigne, ...courante.choix.map(repliquesDeux.nombre)];

  useEffect(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const repondre = useCallback((valeur) => {
    if (juste) return;
    setChoix(valeur);
    const s = verdict(valeur, courante);
    if (s === 'juste') {
      dire([commun.bravo(manche), repliquesDeux.resultat(courante.mode, courante.n)]);
    } else {
      setPropre(false);
      dire(repliquesDeux.erreur(s));
    }
  }, [juste, courante, manche, dire]);

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((k) => k + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setChoix(null);
    setPropre(true);
  }, [manche, propre]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setChoix(null);
    setPropre(true);
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

  const message = sens && !juste ? PHRASES[CLE_PHRASE[sens]] : null;

  return (
    <div className="jeu jeu--deux" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.mode}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={aDire} />
      </p>

      <Table mode={courante.mode} n={courante.n} devoile={juste} />

      {!juste && (
        <div className="deux__reponses" role="group" aria-label="Choisis ta réponse">
          {courante.choix.map((v) => (
            <button
              key={v}
              type="button"
              className={`deux__reponse${choix === v ? ' est-refusee' : ''}${voix.enCours === repliquesDeux.nombre(v).cle ? ' est-lue' : ''}`}
              onClick={() => repondre(v)}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {message && <p className="jeu__trop" role="status">{message}</p>}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">
            {double ? resultatDouble(courante.n) : resultatMoitie(courante.n)}
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

    </div>
  );
}

const CLE_PHRASE = {
  oubli: 'oubli', tout: 'tout', trop: 'trop', 'pas-assez': 'pasAssez',
};

// ------------------------------------------------------------- le dessin

/**
 * Les places d'une petite assiette : deux rangs de cinq au plus. Rangés, ils
 * se comptent bien — c'est voulu ici : l'assiette visible est celle qu'on
 * doit compter.
 */
function placesPetite(cx, n) {
  return Array.from({ length: n }, (_, i) => {
    const rang = Math.floor(i / 5);
    const dansRang = Math.min(5, n - rang * 5);
    const col = i % 5;
    const rangs = Math.ceil(n / 5);
    return { x: cx + (col - (dansRang - 1) / 2) * 25, y: 124 + (rang - (rangs - 1) / 2) * 26 };
  });
}

/**
 * LES PLACES DE LA GRANDE ASSIETTE, EN DÉSORDRE : une grille bousculée, et un
 * ordre de remplissage fixe qui éparpille les biscuits. Rangés par deux, ils
 * donneraient la moitié toute faite.
 */
const GRILLE = (() => {
  // UNE SECOUSSE DE TROIS POINTS AU PLUS : assez pour casser les paires, pas
  // assez pour qu'un biscuit en chevauche un autre — un tas qu'on ne peut plus
  // compter ne se partage pas.
  const secousse = [[3, -2], [-2, 3], [1, 2], [-3, -1], [2, 3], [-1, -3], [3, 1]];
  const cases = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 7; c += 1) {
      const [dx, dy] = secousse[(c + r * 3) % secousse.length];
      cases.push({ x: 200 + (c - 3) * 34 + dx, y: 122 + (r - 1) * 30 + dy });
    }
  }
  const ordre = [10, 3, 17, 7, 13, 0, 20, 5, 15, 1, 19, 8, 12, 4, 16, 9, 11, 2, 18, 6, 14];
  return ordre.map((i) => cases[i]);
})();

function Table({ mode, n, devoile }) {
  const libelle = mode === 'double'
    ? `Deux assiettes. Sur l'une, ${n} biscuits. L'autre est sous une cloche${devoile ? `, et on voit ${n} biscuits` : ''}.`
    : devoile
      ? `Les biscuits partagés : ${n} sur chaque assiette.`
      : `Une grande assiette avec ${2 * n} biscuits à partager.`;

  return (
    <svg className="deux__table" viewBox="0 0 400 190" role="img" aria-label={libelle}>
      {mode === 'double' && (
        <>
          <Assiette cx={100} />
          {placesPetite(100, n).map((p, i) => <Biscuit key={`g${i}`} {...p} />)}
          <Assiette cx={300} />
          {devoile && placesPetite(300, n).map((p, i) => <Biscuit key={`d${i}`} {...p} />)}
          <Cloche cx={300} levee={devoile} />
        </>
      )}

      {mode === 'moitie' && !devoile && (
        <>
          <ellipse className="deux__assiette" cx="200" cy="122" rx="176" ry="64" />
          <ellipse className="deux__assiette-fond" cx="200" cy="122" rx="150" ry="52" />
          {GRILLE.slice(0, 2 * n).map((p, i) => <Biscuit key={i} {...p} />)}
        </>
      )}

      {mode === 'moitie' && devoile && (
        <>
          <Assiette cx={100} />
          {placesPetite(100, n).map((p, i) => <Biscuit key={`g${i}`} {...p} />)}
          <Assiette cx={300} />
          {placesPetite(300, n).map((p, i) => <Biscuit key={`d${i}`} {...p} />)}
        </>
      )}
    </svg>
  );
}

function Assiette({ cx }) {
  return (
    <g>
      <ellipse className="deux__assiette" cx={cx} cy="124" rx="88" ry="44" />
      <ellipse className="deux__assiette-fond" cx={cx} cy="124" rx="72" ry="35" />
    </g>
  );
}

/** Un biscuit rond, et ses pépites. */
function Biscuit({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle className="deux__biscuit" r="11" />
      <circle className="deux__pepite" cx="-4" cy="-3" r="1.8" />
      <circle className="deux__pepite" cx="4" cy="-1" r="1.6" />
      <circle className="deux__pepite" cx="-1" cy="4" r="1.7" />
    </g>
  );
}

/** La cloche : elle cache l'assiette de droite, et se lève à la bonne réponse. */
function Cloche({ cx, levee }) {
  return (
    <g className={`deux__cloche${levee ? ' est-levee' : ''}`}>
      <path className="deux__cloche-dome" d={`M${cx - 84} 128 Q${cx - 84} 34 ${cx} 34 Q${cx + 84} 34 ${cx + 84} 128 Z`} />
      <path className="deux__cloche-reflet" d={`M${cx - 58} 104 Q${cx - 56} 62 ${cx - 22} 52`} />
      <rect className="deux__cloche-bord" x={cx - 90} y="124" width="180" height="9" rx="4.5" />
      <circle className="deux__cloche-bouton" cx={cx} cy="30" r="8" />
    </g>
  );
}
