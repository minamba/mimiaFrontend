import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, dureeEclair, ESSAIS_AVANT_AIDE, MANCHES, PHRASES, serie,
} from '../../lib/jeux/motsEclair';
import { commun, repliquesEclair } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import decor from '../../assets/Jeux/CP/mot_eclaire.webp';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * LES MOTS ÉCLAIR, À L'ÉCRAN.
 *
 * Toute la règle vit dans `motsEclair.js`, y compris pourquoi c'est l'enfant
 * qui déclenche l'éclair.
 *
 * TROIS TEMPS PAR MANCHE : l'éclair attend qu'on le touche ; le mot passe ;
 * les trois cartes apparaissent. UNE CARTE TOUCHÉE EST UNE RÉPONSE : il n'y
 * a qu'un mot à trouver, pas de train à remplir, donc rien à annoncer.
 *
 * ADRIEN NE DIT JAMAIS LE MOT AVANT LE CHOIX : l'enfant le retrouverait à
 * l'oreille. Il le dit après, une fois trouvé ou montré — c'est ce qui lie
 * la forme écrite au mot entendu.
 *
 * LE DÉCOR MONTRE DES MOTS QUI VOLENT (« chat », « avion »…) : le cadre de
 * l'éclair est donc OPAQUE dans ses trois temps, pour qu'aucun mot du décor
 * ne se lise à la place du mot à retrouver.
 */
export default function MotsEclair({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [temps, setTemps] = useState('attente');
  const [revu, setRevu] = useState(false);
  const [fautes, setFautes] = useState([]);
  const [trouve, setTrouve] = useState(false);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const montrer = !trouve && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesEclair.consigne;

  useEffect(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup, MANCHES));
  }, [fini, duPremierCoup, dire]);

  // L'ÉCLAIR S'ÉTEINT TOUT SEUL, après un coup d'œil.
  useEffect(() => {
    if (temps !== 'eclair') return undefined;
    const t = setTimeout(() => setTemps('choix'), dureeEclair(manche));
    return () => clearTimeout(t);
  }, [temps, manche]);

  const eclairer = useCallback(() => setTemps('eclair'), []);

  const revoir = useCallback(() => {
    setRevu(true);
    setTemps('eclair');
  }, []);

  const choisir = useCallback((carte) => {
    if (termine || temps !== 'choix') return;
    if (carte === courante.mot) {
      setTrouve(true);
      dire([commun.bravo(manche), repliquesEclair.mot(courante.mot)]);
      return;
    }
    const suivantes = [...fautes, carte];
    setFautes(suivantes);
    if (suivantes.length >= ESSAIS_AVANT_AIDE) dire([repliquesEclair.aide, repliquesEclair.mot(courante.mot)]);
    else dire(repliquesEclair.erreur);
  }, [termine, temps, courante.mot, fautes, manche, dire]);

  const suivante = useCallback(() => {
    if (trouve && fautes.length === 0) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setTemps('attente');
    setRevu(false);
    setFautes([]);
    setTrouve(false);
  }, [manche, trouve, fautes.length]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setTemps('attente');
    setRevu(false);
    setFautes([]);
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

  const erreur = fautes.length > 0 && !termine;

  return (
    <div className="jeu jeu--eclair" style={{ backgroundImage: `url(${decor})` }}>
      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.mot}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {PHRASES.consigne}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* LE CADRE DE L'ÉCLAIR : il garde sa taille dans les trois temps, pour
          que rien ne saute à l'écran quand le mot passe. */}
      <div className={`eclair__cadre eclair__cadre--${temps}`}>
        {temps === 'attente' && (
          <button type="button" className="eclair__declencheur" onClick={eclairer}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13.5 2 5 13.5h6L9.5 22 19 9.5h-6.2z" />
            </svg>
            <span>Montre le mot</span>
          </button>
        )}

        {temps === 'eclair' && (
          <p className="eclair__mot" aria-live="assertive">{courante.mot}</p>
        )}

        {temps === 'choix' && (termine ? (
          <p className="eclair__mot eclair__mot--pose">{courante.mot}</p>
        ) : (
          <button type="button" className="eclair__revoir" onClick={revoir} disabled={revu}>
            {revu ? 'Tu l’as déjà revu' : 'Revoir le mot'}
          </button>
        ))}
      </div>

      {temps === 'choix' && (
        <ul className="eclair__cartes" aria-label="Quel mot as-tu vu ?">
          {courante.cartes.map((c) => {
            const fausse = fautes.includes(c);
            const bonne = termine && c === courante.mot;
            return (
              <li key={c}>
                <button
                  type="button"
                  className={`eclair__carte${fausse ? ' est-fausse' : ''}${bonne ? ' est-bonne' : ''}`}
                  onClick={() => choisir(c)}
                  disabled={termine || fausse}
                >
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {erreur && <p className="jeu__trop" role="status">{PHRASES.erreur}</p>}

      {montrer && (
        <div className="jeu__gagne" role="status">
          <p className="eclair__aide">{PHRASES.aide}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {trouve && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">Vu&nbsp;!</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>
    </div>
  );
}
