import { useEffect, useMemo, useState } from 'react';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as puzzle from '../../../lib/jeux/bonus/puzzle.js';
import { IMAGES_SECONDAIRE } from '../../../lib/jeux/imagesSecondaire.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-puzzle', puzzle);

/** Les décors peints des jeux du collège et du lycée : les images du puzzle. */
const IMAGES = [...new Set(Object.values(IMAGES_SECONDAIRE).map((i) => i.fond).filter(Boolean))];

/** Le morceau d'image d'une pièce : la même image, cadrée sur sa case. */
function stylePiece(image, piece, colonnes, lignes) {
  const x = colonnes > 1 ? ((piece % colonnes) / (colonnes - 1)) * 100 : 0;
  const y = lignes > 1 ? (Math.floor(piece / colonnes) / (lignes - 1)) * 100 : 0;
  return {
    backgroundImage: image ? `url(${image})` : undefined,
    backgroundSize: `${colonnes * 100}% ${lignes * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
  };
}

/**
 * LE PUZZLE — voir `lib/jeux/bonus/puzzle.js`. Un toucher choisit une pièce,
 * un second l'échange avec celle touchée ; à la souris, on peut aussi la
 * faire glisser. Le modèle se montre tant qu'on garde le bouton appuyé.
 */
export default function Puzzle({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const partie = useMemo(() => puzzle.serie(graine, niveau, IMAGES), [graine, niveau]);
  const { colonnes, lignes, image } = partie;
  const [ordre, setOrdre] = useState(partie.ordre);
  const [choisie, setChoisie] = useState(null);
  const [modele, setModele] = useState(false);

  const total = ordre.length;
  const places = puzzle.bienPlacees(ordre);
  const fini = places === total;
  const chrono = useChronoBonus('puzzle', niveau, fini, { trouves: places, total, unite: 'pièce placée' });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const echanger = (a, b) => {
    if (a === b) return;
    const suite = puzzle.echanger(ordre, a, b);
    const gagnees = [a, b].filter((i) => suite[i] === i).length;
    bruitage(gagnees ? 'bonne' : 'selection');
    setOrdre(suite);
  };

  const toucher = (i) => {
    if (ordre[i] === i) return;
    if (choisie === null) {
      setChoisie(i);
      return;
    }
    echanger(choisie, i);
    setChoisie(null);
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-puzzle"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={places}
        total={total}
        unite="pièce placée"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  return (
    <div className="jeu bonus bonus--puzzle">
      <EnTeteBonus titre="Le puzzle" sousTitre={`${total} pièces`} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">{`${places} / ${total}`}</p>
          <button
            type="button"
            className="bonus__compte puzzle__voir"
            title="Voir le modèle : garde appuyé"
            onPointerDown={() => setModele(true)}
            onPointerUp={() => setModele(false)}
            onPointerLeave={() => setModele(false)}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') setModele(true); }}
            onKeyUp={() => setModele(false)}
          >
            👁 Modèle
          </button>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="puzzle__cadre">
        <div className="puzzle__grille" style={{ '--colonnes': colonnes, '--lignes': lignes }}>
          {ordre.map((piece, i) => {
            const enPlace = piece === i;
            return (
              <button
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                type="button"
                className={`puzzle__piece${enPlace ? ' est-en-place' : ''}${choisie === i ? ' est-choisie' : ''}`}
                style={stylePiece(image, piece, colonnes, lignes)}
                onClick={() => toucher(i)}
                draggable={!enPlace}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const de = Number(e.dataTransfer.getData('text/plain'));
                  if (!Number.isNaN(de) && ordre[i] !== i) echanger(de, i);
                  setChoisie(null);
                }}
                aria-label={enPlace ? `Pièce ${i + 1}, à sa place` : `Pièce ${i + 1}`}
                aria-pressed={choisie === i}
              />
            );
          })}
          {modele && <span className="puzzle__modele" style={{ backgroundImage: image ? `url(${image})` : undefined }} aria-hidden="true" />}
        </div>
      </div>

    </div>
  );
}
