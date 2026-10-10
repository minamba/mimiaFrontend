import { useEffect, useMemo, useState } from 'react';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as motsCaches from '../../../lib/jeux/bonus/motsCaches.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-mots-caches', motsCaches);

/** Une couleur par mot trouvé, pour que deux mots qui se croisent restent lisibles. */
const TEINTES = [150, 200, 270, 330, 30, 90, 180, 240, 300, 0, 60, 120];

/** La case sous le doigt : lue dans le document, ce qui reste juste quand la page est zoomée. */
function caseSous(e) {
  const el = document.elementFromPoint?.(e.clientX, e.clientY)?.closest?.('[data-l]');
  return el ? [Number(el.dataset.l), Number(el.dataset.c)] : null;
}

/**
 * LES MOTS CACHÉS — voir `lib/jeux/bonus/motsCaches.js`. On appuie sur la
 * première lettre et on glisse jusqu'à la dernière, souris cliquée ou doigt
 * posé (Camara, le 09/10/2026). Le tracé suit une ligne droite.
 */
export default function MotsCaches({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const partie = useMemo(() => motsCaches.serie(graine, niveau), [graine, niveau]);
  const [trouves, setTrouves] = useState([]);
  const [depart, setDepart] = useState(null);
  const [courant, setCourant] = useState(null);
  const [rate, setRate] = useState(false);

  const fini = trouves.length === partie.mots.length;
  const chrono = useChronoBonus('mots-caches', niveau, fini, { trouves: trouves.length, total: partie.mots.length, unite: 'mot trouvé' });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const enCours = depart && courant ? motsCaches.trace(depart, courant) : [];
  const dansTrace = new Set(enCours.map(([l, c]) => `${l},${c}`));
  const couleurDe = {};
  trouves.forEach((mot, i) => {
    partie.mots.find((m) => m.mot === mot)?.cases.forEach(([l, c]) => { couleurDe[`${l},${c}`] = TEINTES[i % TEINTES.length]; });
  });

  const commencer = (e) => {
    const c = caseSous(e);
    if (!c) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDepart(c);
    setCourant(c);
  };
  const suivre = (e) => {
    if (!depart) return;
    const c = caseSous(e);
    if (c) setCourant(c);
  };
  const lacher = () => {
    if (!depart) return;
    const cases = enCours;
    setDepart(null);
    setCourant(null);
    if (cases.length < 2) return;
    const m = motsCaches.motTrace(partie, cases, trouves);
    if (m) {
      bruitage('bonne');
      setTrouves((t) => [...t, m.mot]);
    } else {
      bruitage('mauvaise');
      setRate(true);
      setTimeout(() => setRate(false), 400);
    }
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-mots-caches"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={trouves.length}
        total={partie.mots.length}
        unite="mot trouvé"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  return (
    <div className="jeu bonus bonus--mots-caches">
      <EnTeteBonus titre="Les mots cachés" sousTitre={partie.titre} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">{`${trouves.length} / ${partie.mots.length}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="mots-caches__corps">
        <div
          className={`mots-caches__grille${rate ? ' est-rate' : ''}`}
          style={{ '--taille': partie.taille }}
          onPointerDown={commencer}
          onPointerMove={suivre}
          onPointerUp={lacher}
          onPointerCancel={lacher}
          role="grid"
          aria-label={`Grille de ${partie.taille} lettres sur ${partie.taille}`}
        >
          {partie.grille.map((ligne, l) => ligne.map((lettre, c) => {
            const cle = `${l},${c}`;
            const teinte = couleurDe[cle];
            return (
              <span
                key={cle}
                data-l={l}
                data-c={c}
                role="gridcell"
                className={`mots-caches__case${dansTrace.has(cle) ? ' est-tracee' : ''}${teinte !== undefined ? ' est-trouvee' : ''}`}
                style={teinte !== undefined ? { '--teinte': teinte } : undefined}
              >
                {lettre}
              </span>
            );
          }))}
        </div>

        <ul className="mots-caches__liste" aria-label="Les mots à trouver">
          {partie.mots.map((m) => {
            const i = trouves.indexOf(m.mot);
            return (
              <li
                key={m.mot}
                className={`mots-caches__mot${i >= 0 ? ' est-trouve' : ''}`}
                style={i >= 0 ? { '--teinte': TEINTES[i % TEINTES.length] } : undefined}
              >
                {m.mot}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
