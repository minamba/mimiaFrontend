import { useLayoutEffect, useRef } from 'react';
import { DEFI } from '../../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../../lib/jeux/contexteJeu';
import { useChronoBonus } from '../CadreBonus';
import { enKm } from '../../../../lib/jeux/bonus/geo/geodesie.js';
import { rangDe } from '../../../../lib/jeux/bonus/reglages.js';
import portraitSalim from '../../../../assets/profs/p_histoire_geo.png';
import './geo.css';

/**
 * CE QUE PARTAGENT LES TROIS JEUX DE « CAP SUR LE MONDE » (10/10/2026) :
 * Salim dans sa bulle, la boussole, le tampon, et le chrono du défi.
 */

/**
 * LE CHRONO DES JEUX DE GÉO : celui des jeux bonus (`useChronoBonus`), qui
 * monte en tranquille ; en défi, il descend depuis une durée propre à chaque
 * jeu et à chaque année — les trois jeux de géo durent plus longtemps qu'une
 * partie de paires, et leur durée est écrite ici plutôt que dans la table
 * commune des jeux bonus. À zéro, la page reçoit la fin du défi.
 */
export function useChronoGeo(jeu, niveau, fini, compte, secondesDefi) {
  const { mode, terminerDefi } = useJeuOuvert();
  const base = useChronoBonus(jeu, niveau, fini, compte, { montre: false });
  const defi = mode === DEFI && secondesDefi > 0;
  const reste = Math.max(0, secondesDefi * 1000 - base.ecoule);
  const signale = useRef(false);
  useLayoutEffect(() => {
    if (!defi || fini || reste > 0 || signale.current) return;
    signale.current = true;
    terminerDefi?.({
      reussies: compte.trouves, questions: compte.trouves, raison: 'temps', total: compte.total, unite: compte.unite,
    });
  }, [defi, fini, reste, terminerDefi, compte.trouves, compte.total, compte.unite]);
  return { defi, ecoule: base.ecoule, reste };
}

/** Les durées du défi, en secondes, de la primaire au lycée. */
export function dureeDefiGeo(jeu, niveau) {
  const rang = rangDe(niveau);
  const table = {
    'ou-sur-terre': [420, 300, 270],
    'enquete-carte': [330, 270, 240],
  }[jeu] ?? [300, 270, 240];
  return table[rang <= 5 ? 0 : rang <= 9 ? 1 : 2];
}

/** Salim, le professeur d'histoire-géo, et ce qu'il dit, dans une bulle de manga. */
export function BulleSalim({
  texte, voix, phrase, titre, enfant, className = '',
}) {
  return (
    <div className={`hg-geo__bulle ${className}`}>
      <img className="hg-geo__salim" src={portraitSalim} alt="" width="64" height="64" />
      <div className="hg-geo__parole">
        {titre && <p className="hg-geo__parole-titre">{titre}</p>}
        <p className="hg-geo__parole-texte">{texte}</p>
        {voix?.parle && phrase && (
          <button type="button" className="hg-geo__reecouter" onClick={() => voix.reecouter(phrase)} aria-label="Réécouter Salim">
            <span aria-hidden="true">🔊</span>
          </button>
        )}
        {enfant}
      </div>
    </div>
  );
}

const ETATS = {
  froid: { nom: 'Froid', emoji: '🥶' },
  tiede: { nom: 'Tiède', emoji: '🙂' },
  chaud: { nom: 'Chaud', emoji: '🔥' },
};

/**
 * LA BOUSSOLE : l'aiguille montre la direction du lieu, sa couleur dit la
 * température, et la distance s'écrit dessous. Avant le premier clic, elle
 * tourne doucement (sauf mouvements réduits).
 */
export function Boussole({ verdict, essais = null }) {
  const etat = verdict ? ETATS[verdict.temperature] : null;
  return (
    <div className={`hg-geo__boussole${verdict ? ` est-${verdict.temperature}` : ' est-attente'}`}>
      <svg viewBox="-60 -60 120 120" className="hg-geo__boussole-cadran" aria-hidden="true">
        <circle r="56" className="hg-geo__boussole-bord" />
        <circle r="47" className="hg-geo__boussole-fond" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} className="hg-geo__boussole-graduation" x1="0" y1="-47" x2="0" y2={a % 90 === 0 ? -38 : -42} transform={`rotate(${a})`} />
        ))}
        <text className="hg-geo__boussole-lettre est-nord" y="-27" textAnchor="middle">N</text>
        <text className="hg-geo__boussole-lettre" x="30" y="5" textAnchor="middle">E</text>
        <text className="hg-geo__boussole-lettre" y="36" textAnchor="middle">S</text>
        <text className="hg-geo__boussole-lettre" x="-30" y="5" textAnchor="middle">O</text>
        <g className="hg-geo__aiguille" style={{ transform: `rotate(${verdict ? verdict.cap : 0}deg)` }}>
          <path className="hg-geo__aiguille-pointe" d="M0 -40 L9 0 L0 6 L-9 0 Z" />
          <path className="hg-geo__aiguille-queue" d="M0 40 L9 0 L0 -6 L-9 0 Z" />
          <circle r="5" className="hg-geo__aiguille-axe" />
        </g>
      </svg>
      <p className="hg-geo__boussole-texte">
        {etat ? (
          <>
            <strong>
              <span aria-hidden="true">{etat.emoji}</span>
              {` ${etat.nom} !`}
            </strong>
            <span>{`${enKm(verdict.km)}, vers ${verdict.direction.nom}`}</span>
          </>
        ) : (
          <span>Touche la carte : je te dirai si tu chauffes.</span>
        )}
        {essais && <span className="hg-geo__boussole-essais">{essais}</span>}
      </p>
    </div>
  );
}

/** Un tampon qui tombe (passeport, dossier résolu) : décor, le texte est dit ailleurs. */
export function Tampon({ texte, sousTexte, couleur = 'rouge' }) {
  return (
    <div className={`hg-geo__tampon hg-geo__tampon--${couleur}`} aria-hidden="true">
      <span className="hg-geo__tampon-texte">{texte}</span>
      {sousTexte && <span className="hg-geo__tampon-sous">{sousTexte}</span>}
    </div>
  );
}
