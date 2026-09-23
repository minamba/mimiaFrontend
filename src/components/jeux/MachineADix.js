import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, ERREURS, ESSAIS_AVANT_AIDE, facteurDe, MANCHES, PHRASES, reponse, serie, verdict,
} from '../../lib/jeux/machineADix';
import { commun, repliquesMachine } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';

/**
 * LA MACHINE À DIX, À L'ÉCRAN.
 *
 * Toute la règle vit dans `machineADix.js`.
 *
 * LA MACHINE EST DESSINÉE AVEC SES DEUX BOUCHES : l'entrée à gauche, la
 * sortie à droite, « × 10 » sur le capot. Le nombre connu est posé dans sa
 * bouche, l'autre porte un point d'interrogation jusqu'à la bonne réponse.
 *
 * UN NOMBRE TOUCHÉ EST UNE RÉPONSE — une seule à trouver.
 */
export default function MachineADix({ onQuitter, matiereCode, niveau = 'CE1' }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine, niveau), [graine, niveau]);

  const [manche, setManche] = useState(0);
  const [fautes, setFautes] = useState([]);
  const [sens, setSens] = useState(null);
  const [trouve, setTrouve] = useState(false);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const sortie = courante.mode === 'sortie';
  const montrer = !trouve && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const facteur = facteurDe(courante);
  const laConsigne = repliquesMachine.consigne(courante.mode, facteur);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const choisir = useCallback((n) => {
    if (termine) return;
    const s = verdict(n, courante);
    if (s === 'juste') {
      setTrouve(true);
      setSens(null);
      if (fautes.length === 0) setDuPremierCoup((x) => x + 1);
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = [...fautes, n];
    setFautes(suivantes);
    setSens(s);
    dire(suivantes.length >= ESSAIS_AVANT_AIDE ? repliquesMachine.aide(facteur) : repliquesMachine.erreur(s));
  }, [termine, courante, fautes, manche, dire, facteur]);

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

  const entree = courante.entree;
  const sort = entree * facteur;
  const inconnu = <span className="machine__inconnu">?</span>;

  return (
    <div className="jeu jeu--scene jeu--machine">
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.entree}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      <div className="machine" role="img" aria-label={sortie ? `${entree} entre dans la machine` : `${sort} sort de la machine`}>
        <span className="machine__bouche">{sortie || termine ? entree : inconnu}</span>
        <span className="machine__fleche" aria-hidden="true">→</span>
        <span className="machine__corps">
          <span className="machine__engrenage" aria-hidden="true">⚙</span>
          <span className="machine__capot">× {facteur}</span>
        </span>
        <span className="machine__fleche" aria-hidden="true">→</span>
        <span className="machine__bouche machine__bouche--sortie">{!sortie || termine ? sort : inconnu}</span>
      </div>

      {!termine && (
        <ul className="scene__choix" aria-label="Choisis le nombre">
          {courante.choix.map((n) => (
            <li key={n}>
              <button
                type="button"
                className={`scene__carte${fautes.includes(n) ? ' est-fausse' : ''}`}
                onClick={() => choisir(n)}
                disabled={fautes.includes(n)}
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      )}

      {sens && !termine && <p className="jeu__trop" role="status">{PHRASES[ERREURS[sens]]}</p>}

      {termine && (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="scene__bulle">{facteur === 100 ? PHRASES.aideCent : PHRASES.aide}</p>}
          <p className="jeu__gagne-calcul">{entree} × {facteur} = {sort}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
      {/* La bonne réponse, pour les lecteurs d'écran qui ne voient pas la machine. */}
      <span className="visuellement-cache">{termine ? `La réponse était ${reponse(courante)}.` : ''}</span>
    </div>
  );
}
