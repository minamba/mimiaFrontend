import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { DEFI } from '../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as drapeaux from '../../../lib/jeux/bonus/drapeaux.js';
import { IMAGES_DRAPEAUX } from '../../../lib/jeux/bonus/drapeauxImages.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-drapeaux', drapeaux);
const PAUSE = 1300;

/**
 * LE DÉFI DES DRAPEAUX — voir `lib/jeux/bonus/drapeaux.js`. Un anneau se vide
 * à chaque drapeau ; à zéro, le son de la mauvaise réponse, la bonne réponse
 * s'allume, et le drapeau suivant arrive.
 */
export default function Drapeaux({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const manches = useMemo(() => drapeaux.serie(graine, niveau), [graine, niveau]);
  const secondes = drapeaux.secondesParDrapeau(niveau, mode === DEFI);
  const [index, setIndex] = useState(0);
  const [reponse, setReponse] = useState(null);
  const [bonnes, setBonnes] = useState(0);
  const [reste, setReste] = useState(secondes * 1000);
  const [fini, setFini] = useState(false);
  const debut = useRef(Date.now());

  const courante = manches[index];
  const chrono = useChronoBonus('drapeaux', niveau, fini, { trouves: bonnes, total: manches.length, unite: 'drapeau trouvé' }, { montre: false });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const suivant = () => {
    if (index + 1 >= manches.length) {
      setFini(true);
      return;
    }
    setIndex((i) => i + 1);
    setReponse(null);
    debut.current = Date.now();
    setReste(secondes * 1000);
  };

  // Le chrono du drapeau : à zéro sans réponse, c'est une erreur, et on passe.
  useEffect(() => {
    if (reponse || fini) return undefined;
    const id = setInterval(() => {
      const r = Math.max(0, secondes * 1000 - (Date.now() - debut.current));
      setReste(r);
      if (r === 0) {
        bruitage('mauvaise');
        setReponse({ code: null });
      }
    }, 100);
    return () => clearInterval(id);
  }, [index, reponse, fini, secondes]);

  // Après chaque réponse (ou le temps écoulé), un instant pour voir la bonne, puis la suite.
  useEffect(() => {
    if (!reponse) return undefined;
    const id = setTimeout(suivant, PAUSE);
    return () => clearTimeout(id);
  }, [reponse]); // eslint-disable-line react-hooks/exhaustive-deps

  const choisir = (code) => {
    if (reponse) return;
    const juste = code === courante.pays.code;
    bruitage(juste ? 'bonne' : 'mauvaise');
    if (juste) setBonnes((n) => n + 1);
    setReponse({ code });
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-drapeaux"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={bonnes}
        total={manches.length}
        unite="drapeau trouvé"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const part = reste / (secondes * 1000);
  return (
    <div className="jeu bonus bonus--drapeaux">
      <EnTeteBonus titre="Le défi des drapeaux" sousTitre={`Drapeau ${index + 1} sur ${manches.length}`} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">{`${bonnes} / ${manches.length}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="drapeaux__scene">
        <span
          className={`drapeaux__minuteur${part < 0.3 ? ' est-presse' : ''}`}
          style={{ '--part': part }}
          role="timer"
          aria-label={`${Math.ceil(reste / 1000)} secondes`}
        >
          {Math.ceil(reste / 1000)}
        </span>
        <img
          key={courante.pays.code}
          className="drapeaux__drapeau"
          src={IMAGES_DRAPEAUX[courante.pays.code]}
          alt="Le drapeau à reconnaître"
          width="320"
          height="240"
        />
      </div>

      <ul className="drapeaux__choix" aria-label="Choisis le pays">
        {courante.choix.map((p) => {
          const etat = !reponse ? ''
            : p.code === courante.pays.code ? ' est-juste'
              : p.code === reponse.code ? ' est-faux' : ' est-eteint';
          return (
            <li key={p.code}>
              <button type="button" className={`drapeaux__pays${etat}`} onClick={() => choisir(p.code)} disabled={Boolean(reponse)}>
                {p.nom}
              </button>
            </li>
          );
        })}
      </ul>
      {reponse && reponse.code === null && <p className="drapeaux__trop-tard" role="status">Trop tard !</p>}
    </div>
  );
}
