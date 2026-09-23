import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/train_bg.webp';
import {
  bilan, graduations, MANCHES, PHRASES, serie, verdict,
} from '../../lib/jeux/trainDesNombres';
import { commun, repliquesTrain } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';

/**
 * LE TRAIN DES NOMBRES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `trainDesNombres.js`, y compris pourquoi seules
 * trois graduations portent leur nombre.
 *
 * L'ENFANT CLIQUE UNE TRAVERSE, il n'y fait pas glisser un wagon. Le
 * glisser-déposer échoue sur un trackpad, sur un écran tactile mal calibré, et
 * il est inaccessible au clavier — trois façons de perdre un enfant de six ans
 * sur un geste qui n'est pas la leçon.
 *
 * LE DÉCOR EST UNE IMAGE, LE JEU EST DESSINÉ : la voie graduée et le wagon
 * sont en vectoriel, posés sur le quai de la gare.
 *
 * LA LOCOMOTIVE EST GARÉE SUR LE ZÉRO, pas à côté de la voie. Posée à gauche
 * de la demi-droite, elle devait esquiver le banc et la valise du quai, ce qui
 * poussait toute la graduation vers la droite et la décentrait. À l'arrêt
 * zéro, elle ne prend aucune place et dit la même chose : c'est d'ici que
 * part la demi-droite. Elle laisse passer les clics, pour ne pas transformer
 * une borne en zone morte.
 */
export default function TrainDesNombres({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [pose, setPose] = useState(null);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const arrets = useMemo(() => graduations(courante.voie), [courante.voie]);
  const sens = pose === null ? null : verdict(pose, courante.nombre);
  const juste = sens === 'juste';

  // LA VOIX DE LA PROFESSEURE : la consigne à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;

  useEffect(() => {
    if (!fini) dire(repliquesTrain.consigne);
  }, [manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const accrocher = useCallback((valeur) => {
    if (juste) return;

    setPose(valeur);
    if (valeur !== courante.nombre) setPropre(false);

    const s = verdict(valeur, courante.nombre);
    if (s === 'juste') dire(commun.bravo(manche));
    else dire(s === 'trop-loin' ? repliquesTrain.tropLoin : repliquesTrain.pasAssezLoin);
  }, [courante.nombre, juste, manche, dire]);

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setPose(null);
    setPropre(true);
  }, [manche, propre]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPose(null);
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

  return (
    <div className="jeu jeu--train" style={{ backgroundImage: `url(${decor})` }}>
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
        {PHRASES.consigne}
        <BoutonsVoix voix={voix} consigne={repliquesTrain.consigne} />
      </p>

      {/* LE WAGON À PLACER, au-dessus de la voie tant qu'il n'est pas posé :
          c'est lui qui porte la question, et il doit rester sous les yeux. */}
      {!juste && (
        <div className="train__wagon-attente" aria-label={`Wagon numéro ${courante.nombre}`}>
          <Wagon nombre={courante.nombre} />
        </div>
      )}

      <div className="voie" role="group" aria-label="La voie ferrée">
        <ul className="voie__arrets">
          {arrets.map((valeur) => {
            const repere = courante.voie.reperes.includes(valeur);
            const ici = juste && valeur === courante.nombre;

            return (
              <li key={valeur} className="voie__arret">
                {ici && (
                  <span className="voie__wagon-pose" aria-hidden="true">
                    <Wagon nombre={courante.nombre} />
                  </span>
                )}

                <button
                  type="button"
                  className={`traverse${repere ? ' est-repere' : ''}${pose === valeur && !juste ? ' est-refusee' : ''}`}
                  onClick={() => accrocher(valeur)}
                  disabled={juste}
                  aria-label={repere ? `Arrêt ${valeur}` : `Arrêt entre les repères, position ${valeur}`}
                >
                  <span className="traverse__trait" aria-hidden="true" />
                  {/* SEULS LES REPÈRES PORTENT LEUR NOMBRE — voir la note du
                      module : tout graduer supprimerait la question. */}
                  <span className="traverse__nombre">{repere ? valeur : ''}</span>
                </button>

                {valeur === 0 && (
                  <span className="voie__locomotive" aria-hidden="true">
                    <Locomotive />
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <span className="voie__rail" aria-hidden="true" />
      </div>

      {sens === 'trop-loin' && (
        <p className="jeu__trop" role="status">{PHRASES.tropLoin}</p>
      )}
      {sens === 'pas-assez-loin' && (
        <p className="jeu__trop" role="status">{PHRASES.pasAssezLoin}</p>
      )}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">{courante.nombre}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}

/** La locomotive, à l'arrêt sur le zéro. */
function Locomotive() {
  return (
    <svg className="locomotive" viewBox="0 0 84 60" aria-hidden="true">
      <rect className="locomotive__corps" x="6" y="18" width="54" height="26" rx="6" />
      <rect className="locomotive__cabine" x="44" y="6" width="30" height="38" rx="6" />
      <rect className="locomotive__vitre" x="52" y="13" width="15" height="13" rx="3" />
      <rect className="locomotive__cheminee" x="12" y="6" width="12" height="14" rx="3" />
      <circle className="locomotive__roue" cx="22" cy="50" r="9" />
      <circle className="locomotive__roue" cx="58" cy="50" r="9" />
    </svg>
  );
}

/** Le wagon, avec son numéro peint sur le flanc. */
function Wagon({ nombre }) {
  return (
    <svg className="wagon" viewBox="0 0 76 56" aria-hidden="true">
      <rect className="wagon__caisse" x="4" y="6" width="68" height="34" rx="6" />
      <rect className="wagon__plaque" x="14" y="12" width="48" height="22" rx="4" />
      <text className="wagon__nombre" x="38" y="30" textAnchor="middle">{nombre}</text>
      <circle className="wagon__roue" cx="20" cy="46" r="8" />
      <circle className="wagon__roue" cx="56" cy="46" r="8" />
    </svg>
  );
}
