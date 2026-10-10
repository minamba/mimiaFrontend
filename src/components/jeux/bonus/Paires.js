import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as paires from '../../../lib/jeux/bonus/paires.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-paires', paires);

/**
 * LES PAIRES — voir `lib/jeux/bonus/paires.js`. Deux cartes retournées à la
 * fois : partenaires, elles restent ouvertes ; sinon elles se referment
 * après un instant, le temps de les mémoriser.
 */
export default function Paires({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const partie = useMemo(() => paires.serie(graine, niveau), [graine, niveau]);
  const [ouvertes, setOuvertes] = useState([]);
  const [gagnees, setGagnees] = useState([]);
  const [coups, setCoups] = useState(0);
  const attente = useRef(null);
  useEffect(() => () => clearTimeout(attente.current), []);

  const total = partie.cartes.length / 2;
  const trouvees = gagnees.length / 2;
  const fini = trouvees === total;
  const chrono = useChronoBonus('paires', niveau, fini, { trouves: trouvees, total, unite: 'paire trouvée' });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire(partie.jumelles ? 'consigne' : 'consigne-familles');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const retourner = (carte) => {
    if (ouvertes.length === 2 || ouvertes.includes(carte.id) || gagnees.includes(carte.id)) return;
    const suivantes = [...ouvertes, carte.id];
    setOuvertes(suivantes);
    if (suivantes.length < 2) return;
    setCoups((n) => n + 1);
    const [a, b] = suivantes.map((id) => partie.cartes.find((c) => c.id === id));
    if (paires.vontEnsemble(a, b)) {
      bruitage('bonne');
      setGagnees((g) => [...g, a.id, b.id]);
      setOuvertes([]);
    } else {
      attente.current = setTimeout(() => setOuvertes([]), 950);
    }
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-paires"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={trouvees}
        total={total}
        unite="paire trouvée"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const colonnes = partie.cartes.length <= 12 ? 4 : 5;
  return (
    <div className="jeu bonus bonus--paires">
      <EnTeteBonus titre="Les paires" sousTitre={partie.titre} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">{`${trouvees} / ${total}`}</p>
        <p className="bonus__compte bonus__compte--coups">{`${coups} coup${coups > 1 ? 's' : ''}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <ul className="paires__table" style={{ '--colonnes': colonnes, '--rangees': Math.ceil(partie.cartes.length / colonnes) }}>
        {partie.cartes.map((carte) => {
          const visible = ouvertes.includes(carte.id) || gagnees.includes(carte.id);
          return (
            <li key={carte.id}>
              <button
                type="button"
                className={`paires__carte${visible ? ' est-retournee' : ''}${gagnees.includes(carte.id) ? ' est-gagnee' : ''}`}
                onClick={() => retourner(carte)}
                aria-label={visible ? (carte.texte ?? carte.nom ?? 'image') : 'Carte cachée'}
                style={{ animationDelay: `${carte.id * 0.03}s` }}
              >
                <span className="paires__dos" aria-hidden="true">?</span>
                <span className={`paires__face${carte.emoji ? ' est-dessin' : ''}`} aria-hidden="true">
                  {carte.emoji ?? carte.texte}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
