import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, colonnes, decomposer, ESSAIS_AVANT_AIDE, MANCHES, MAX_PAR_COLONNE, PHRASES,
  phraseErreur, serie, verdictConstruire, verdictLire,
} from '../../lib/jeux/coffreDesCentaines';
import { enLettres } from '../../lib/jeux/nombresEnLettres';
import { commun, repliquesCoffre } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import GrandsNombres from './GrandsNombres';

const VIDE = {
  milliers: 0, centaines: 0, dizaines: 0, unites: 0,
};
const TITRES = {
  milliers: 'Milliers', centaines: 'Centaines', dizaines: 'Dizaines', unites: 'Unités',
};
const PIECES = {
  milliers: 'bloc', centaines: 'plaque', dizaines: 'barre', unites: 'cube',
};
/** Le nom de chaque pièce avec son article : « un cube », pas « une cube ». */
const UNE = {
  bloc: 'un bloc', plaque: 'une plaque', barre: 'une barre', cube: 'un cube',
};

/**
 * LE COFFRE DES CENTAINES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `coffreDesCentaines.js`, y compris pourquoi le
 * nombre à construire est écrit en lettres.
 *
 * LE COFFRE A TROIS CASES, UNE PAR COLONNE, et chaque case a ses deux
 * boutons : ajouter une pièce, en retirer une. On ne glisse rien — même
 * raison que les autres jeux. Le nom de la colonne est écrit au-dessus : au
 * CE1, « centaines » se lit, et c'est le mot qu'on veut qu'il retienne.
 *
 * LE NOMBRE CONSTRUIT N'EST PAS AFFICHÉ pendant qu'on construit : il serait
 * la réponse. Il apparaît une fois juste, avec sa décomposition.
 */
function CoffreDesCentainesAvantCM1({ onQuitter, matiereCode, niveau = 'CE1' }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine, niveau), [graine, niveau]);
  const ce2 = niveau === 'CE2';

  const [manche, setManche] = useState(0);
  const [coffre, setCoffre] = useState(VIDE);
  const [resultat, setResultat] = useState(null);
  const [fausses, setFausses] = useState([]);
  const [ratees, setRatees] = useState(0);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const construire = courante.mode === 'construire';
  const juste = resultat?.sens === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = construire
    ? repliquesCoffre.construire(courante.nombre)
    : repliquesCoffre.consigneLire;

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const changer = useCallback((colonne, delta) => {
    if (termine) return;
    setResultat(null);
    setCoffre((c) => ({
      ...c, [colonne]: Math.max(0, Math.min(MAX_PAR_COLONNE, c[colonne] + delta)),
    }));
  }, [termine]);

  const conclure = useCallback((r) => {
    setResultat(r);
    if (r.sens === 'juste') {
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    const aide = ce2 ? repliquesCoffre.aideCE2 : repliquesCoffre.aide;
    dire(suivantes >= ESSAIS_AVANT_AIDE ? aide : repliquesCoffre.erreur(r.sens, r.colonne));
  }, [manche, ratees, dire, ce2]);

  const annoncer = useCallback(() => {
    conclure(verdictConstruire(coffre, courante.nombre, niveau));
  }, [coffre, courante.nombre, conclure, niveau]);

  const lire = useCallback((choix) => {
    if (termine) return;
    const r = verdictLire(choix, courante.nombre, niveau);
    if (r.sens !== 'juste') setFausses((f) => [...f, choix]);
    conclure(r);
  }, [termine, courante.nombre, conclure, niveau]);

  const suivante = useCallback(() => {
    if (juste && ratees === 0) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setCoffre(VIDE);
    setResultat(null);
    setFausses([]);
    setRatees(0);
  }, [manche, juste, ratees]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setCoffre(VIDE);
    setResultat(null);
    setFausses([]);
    setRatees(0);
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

  // À la lecture, et quand on montre la réponse, le coffre porte le nombre.
  const montre = !construire || montrer ? decomposer(courante.nombre) : coffre;
  const {
    milliers: m, centaines: c, dizaines: d, unites: u,
  } = decomposer(courante.nombre);

  return (
    <div className={`jeu jeu--scene jeu--coffre${ce2 ? ' jeu--coffre-ce2' : ''}`}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.nombre}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      <div className="coffre" role="group" aria-label="Le coffre">
        {colonnes(niveau).map(({ cle }) => {
          const fautive = resultat?.colonne === cle && !termine;
          return (
            <div key={cle} className={`coffre__case${fautive ? ' est-fautive' : ''}`}>
              <p className="coffre__titre">{TITRES[cle]}</p>
              <div
                className={`coffre__pieces coffre__pieces--${PIECES[cle]}`}
                aria-label={`${montre[cle]} ${TITRES[cle].toLowerCase()}`}
                role="img"
              >
                {Array.from({ length: montre[cle] }, (_, i) => (
                  // Des pièces identiques : la place est la seule identité.
                  // eslint-disable-next-line react/no-array-index-key
                  <Piece key={i} sorte={PIECES[cle]} />
                ))}
              </div>
              {construire && !termine && (
                <div className="coffre__boutons">
                  <button
                    type="button"
                    className="coffre__bouton"
                    onClick={() => changer(cle, -1)}
                    disabled={coffre[cle] === 0}
                    aria-label={`Retirer ${UNE[PIECES[cle]]}`}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="coffre__bouton"
                    onClick={() => changer(cle, 1)}
                    disabled={coffre[cle] >= MAX_PAR_COLONNE}
                    aria-label={`Ajouter ${UNE[PIECES[cle]]}`}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!construire && !termine && (
        <ul className="scene__choix" aria-label="Quel nombre ?">
          {courante.choix.map((n) => (
            <li key={n}>
              <button
                type="button"
                className={`scene__carte${fausses.includes(n) ? ' est-fausse' : ''}`}
                onClick={() => lire(n)}
                disabled={fausses.includes(n)}
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      )}

      {resultat && !termine && (
        <p className="jeu__trop" role="status">{phraseErreur(resultat.sens, resultat.colonne)}</p>
      )}

      {termine && (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="scene__bulle">{ce2 ? PHRASES.aideCE2 : PHRASES.aide}</p>}
          <p className="jeu__gagne-calcul">
            {courante.nombre} = {ce2 ? `${m * 1000} + ` : ''}{c * 100} + {d * 10} + {u}
            <br />
            <span className="coffre__lettres">{enLettres(courante.nombre)}</span>
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {construire && !termine && !resultat && (coffre.milliers + coffre.centaines + coffre.dizaines + coffre.unites > 0) && (
        <button type="button" className="btn btn--principal" onClick={annoncer}>
          C’est prêt&nbsp;!
        </button>
      )}
    </div>
  );
}

/**
 * UNE PIÈCE DU MATÉRIEL : la plaque de cent (dix sur dix), la barre de dix, le
 * cube. La plaque et la barre laissent voir leurs cubes — c'est ce qui dit
 * qu'une barre VAUT dix cubes.
 */
function Piece({ sorte }) {
  // LE GROS CUBE DE MILLE : dix plaques empilées, dessiné en volume.
  if (sorte === 'bloc') {
    return (
      <svg className="coffre__piece coffre__piece--bloc" viewBox="0 0 60 60" aria-hidden="true">
        <path d="M4 16 L44 16 L44 56 L4 56 Z" className="coffre__bloc-face" />
        <path d="M4 16 L16 4 L56 4 L44 16 Z" className="coffre__bloc-dessus" />
        <path d="M44 16 L56 4 L56 44 L44 56 Z" className="coffre__bloc-cote" />
      </svg>
    );
  }
  if (sorte === 'plaque') {
    return (
      <svg className="coffre__piece coffre__piece--plaque" viewBox="0 0 50 50" aria-hidden="true">
        <rect x="1" y="1" width="48" height="48" rx="2" />
        {Array.from({ length: 9 }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <g key={i}>
            <line x1={1 + (i + 1) * 4.8} y1="1" x2={1 + (i + 1) * 4.8} y2="49" />
            <line x1="1" y1={1 + (i + 1) * 4.8} x2="49" y2={1 + (i + 1) * 4.8} />
          </g>
        ))}
      </svg>
    );
  }
  if (sorte === 'barre') {
    return (
      <svg className="coffre__piece coffre__piece--barre" viewBox="0 0 8 50" aria-hidden="true">
        <rect x="1" y="1" width="6" height="48" rx="1.5" />
        {Array.from({ length: 9 }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <line key={i} x1="1" y1={1 + (i + 1) * 4.8} x2="7" y2={1 + (i + 1) * 4.8} />
        ))}
      </svg>
    );
  }
  return (
    <svg className="coffre__piece coffre__piece--cube" viewBox="0 0 10 10" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" rx="1.5" />
    </svg>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `GrandsNombres.js` ; il lit la classe. */
export default function CoffreDesCentaines({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <GrandsNombres niveau={niveau} {...props} /> : <CoffreDesCentainesAvantCM1 niveau={niveau} {...props} />;
}
