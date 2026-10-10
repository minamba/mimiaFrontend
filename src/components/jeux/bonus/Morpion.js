import { useEffect, useRef, useState } from 'react';
import { DEFI } from '../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as morpion from '../../../lib/jeux/bonus/morpion.js';
import {
  EnTeteBonus, FinBonus, useChronoBonus, useTientDansLEcran,
} from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-morpion', morpion);
const vide = (taille = 3) => Array(taille * taille).fill(null);

/** Le choix de la difficulté (10/10/2026), comme aux échecs : la grille grandit avec elle. */
const EMBLEMES = ['🙂', '🤔', '😤', '🔥'];
function ChoixDifficulte({ conseillee, onChoisir }) {
  return (
    <ul className="morpion__difficultes" aria-label="Choisis ta difficulté">
      {morpion.DIFFICULTES.map((d, i) => (
        <li key={d.cle}>
          <button
            type="button"
            className={`morpion__difficulte morpion__difficulte--${d.cle}${d.cle === conseillee ? ' est-conseillee' : ''}`}
            onClick={() => { bruitage('selection'); onChoisir(d.cle); }}
          >
            <span className="morpion__embleme" aria-hidden="true">{EMBLEMES[i]}</span>
            <span className="morpion__mini" aria-hidden="true" style={{ '--taille': d.taille }}>
              {Array.from({ length: d.taille * d.taille }, (_, k) => <i key={k} />)}
            </span>
            <strong>{d.libelle}</strong>
            <span>{d.detail}</span>
            {d.cle === conseillee && <em>Conseillé pour ta classe</em>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * LE MORPION — voir `lib/jeux/bonus/morpion.js`. Trois manches ; l'enfant
 * commence la première et la troisième, l'ordinateur la deuxième. Le coup de
 * l'ordinateur arrive après un temps de « réflexion », pour qu'on le voie
 * jouer.
 */
export default function Morpion({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [cleDifficulte, setCleDifficulte] = useState(null);
  // La grille prend la place qui reste à l'écran, mesurée (voir `useTientDansLEcran`).
  const refGrille = useRef(null);
  useTientDansLEcran(refGrille, { min: 200, max: 640, actif: Boolean(cleDifficulte) });
  const choix = morpion.difficulte(cleDifficulte);
  const plateau = { taille: choix.taille, aligner: choix.aligner };
  const force = Math.min(3, choix.force + (mode === DEFI ? 1 : 0));
  const [manche, setManche] = useState(0);
  const [grille, setGrille] = useState(vide);
  const [scores, setScores] = useState({ gagne: 0, nul: 0, perdu: 0 });
  const [enFin, setEnFin] = useState(false);

  const fin = cleDifficulte ? morpion.issue(grille, plateau) : null;
  const aLOrdi = Boolean(cleDifficulte) && !fin && (grille.filter(Boolean).length + (manche === 1 ? 0 : 1)) % 2 === 0;
  const fini = enFin;
  const chrono = useChronoBonus('morpion', niveau, fini, { trouves: scores.gagne, total: morpion.MANCHES, unite: 'manche gagnée' }, { montre: false });

  const voix = useVoixJeu('FRANCAIS');
  // AVANT LE CHOIX, UNE CONSIGNE QUI NE PROMET RIEN (10/10/2026, Camara : « l'énoncé n'est
  // plus d'actualité, on peut aussi avoir 4 croix à aligner ») ; après, celle de la grille choisie.
  const consigne = dire(!cleDifficulte ? 'consigne-choix' : choix.aligner > 3 ? 'consigne-quatre' : 'consigne');
  const nul = choix.aligner > 3 ? 'nul-quatre' : 'match-nul';
  useEffect(() => { voix.dire(consigne); }, [cleDifficulte]); // eslint-disable-line react-hooks/exhaustive-deps

  // Le coup de l'ordinateur, après un temps de réflexion.
  useEffect(() => {
    if (!aLOrdi) return undefined;
    const id = setTimeout(() => {
      setGrille((g) => {
        if (morpion.issue(g, plateau)) return g;
        const coup = morpion.coupOrdi(g, force, Math.random, plateau);
        return g.map((v, i) => (i === coup ? morpion.ORDI : v));
      });
    }, 550);
    return () => clearTimeout(id);
  }, [aLOrdi, force]); // eslint-disable-line react-hooks/exhaustive-deps

  // La manche se termine : on compte, on le dit.
  useEffect(() => {
    if (!fin) return;
    const cle = fin.gagnant === morpion.ENFANT ? 'gagne' : fin.gagnant === morpion.ORDI ? 'perdu' : 'nul';
    bruitage(cle === 'gagne' ? 'bonne' : cle === 'perdu' ? 'mauvaise' : 'selection');
    voix.dire(dire(cle === 'nul' ? nul : cle));
    setScores((s) => ({ ...s, [cle]: s[cle] + 1 }));
  }, [fin?.gagnant]); // eslint-disable-line react-hooks/exhaustive-deps

  const jouer = (i) => {
    if (fin || aLOrdi || grille[i]) return;
    setGrille((g) => g.map((v, k) => (k === i ? morpion.ENFANT : v)));
  };

  const suivante = () => {
    if (manche + 1 >= morpion.MANCHES) {
      setEnFin(true);
      return;
    }
    setManche(manche + 1);
    setGrille(vide(choix.taille));
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-morpion"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={scores.gagne}
        total={morpion.MANCHES}
        unite="manche gagnée"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const gagnante = new Set(fin?.ligne ?? []);
  return (
    <div className="jeu bonus bonus--morpion">
      <EnTeteBonus titre="Le morpion" sousTitre={cleDifficulte ? `${choix.libelle} · manche ${manche + 1} sur ${morpion.MANCHES}` : 'Choisis ta difficulté'} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">{`✕ ${scores.gagne} · nul ${scores.nul} · ◯ ${scores.perdu}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      {!cleDifficulte && (
        <ChoixDifficulte
          conseillee={morpion.difficulteConseillee(niveau)}
          onChoisir={(cle) => { setCleDifficulte(cle); setGrille(vide(morpion.difficulte(cle).taille)); }}
        />
      )}

      {cleDifficulte && (
      <>
      <p className="morpion__tour" role="status">
        {fin ? dire(fin.gagnant === morpion.ENFANT ? 'gagne' : fin.gagnant === morpion.ORDI ? 'perdu' : nul).texte
          : aLOrdi ? 'L’ordinateur réfléchit…' : 'À toi de jouer !'}
      </p>

      <div ref={refGrille} className={`morpion__grille morpion__grille--${choix.taille}`} role="grid" aria-label="La grille du morpion" style={{ '--taille': choix.taille }}>
        {grille.map((v, i) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            type="button"
            className={`morpion__case${v ? ` est-${v === morpion.ENFANT ? 'croix' : 'rond'}` : ''}${gagnante.has(i) ? ' est-gagnante' : ''}`}
            onClick={() => jouer(i)}
            disabled={Boolean(v) || Boolean(fin) || aLOrdi}
            aria-label={v ? (v === morpion.ENFANT ? 'Croix' : 'Rond') : `Case ${i + 1}, libre`}
          >
            {v === morpion.ENFANT ? '✕' : v === morpion.ORDI ? '◯' : ''}
          </button>
        ))}
      </div>

      {fin && (
        <button type="button" className="btn btn--principal" onClick={suivante}>
          {manche + 1 < morpion.MANCHES ? 'Manche suivante' : 'Voir mon score'}
        </button>
      )}
      </>
      )}
    </div>
  );
}
