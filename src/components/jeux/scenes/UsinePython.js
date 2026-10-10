import { Fragment, useEffect, useMemo, useState } from 'react';
import { pasAPas } from '../../../lib/jeux/pythonPasAPas';

/**
 * L'USINE DU JEU « PYTHON : QUE VAUT LA VARIABLE ? » — Camara, le 09/10/2026 :
 * « pour le jeu du Python, j'aurais mis un vrai python animé, un truc en
 * rapport avec le titre et la couverture qui donne envie à mort ». La
 * couverture montre une usine à billes ; la scène la reprend :
 *   - LA QUESTION : le programme sur la console de l'usine, un python (bleu
 *     et jaune, les couleurs du langage) enroulé dessus, qui ondule, cligne
 *     et sort la langue ;
 *   - LES RÉPONSES : des caisses de billes (`objets: 'caisse'`) ;
 *   - APRÈS LA RÉPONSE : l'usine REJOUE le programme (`pythonPasAPas`) — la
 *     ligne en cours s'allume, chaque variable change dans son tube de billes,
 *     l'affichage tombe à la fin. On voit POURQUOI c'est la bonne réponse.
 * Rien n'est montré du déroulé avant la réponse : ce serait la donner.
 */

const MOTS_CLES = /\b(for|in|range|while|if|elif|else|def|return|print)\b/;

/** Une ligne de Python, colorée : mots-clés, nombres, le reste. */
function LigneColoree({ texte }) {
  const morceaux = texte.split(/(\b(?:for|in|range|while|if|elif|else|def|return|print)\b|\b\d+\b)/);
  return morceaux.map((m, i) => {
    // eslint-disable-next-line react/no-array-index-key
    if (MOTS_CLES.test(m) && /^\w+$/.test(m)) return <span key={i} className="usine__mot">{m}</span>;
    // eslint-disable-next-line react/no-array-index-key
    if (/^\d+$/.test(m)) return <span key={i} className="usine__nombre">{m}</span>;
    // eslint-disable-next-line react/no-array-index-key
    return <Fragment key={i}>{m}</Fragment>;
  });
}

function Console({ programme, allumee = null }) {
  const lignes = String(programme).split('\n');
  return (
    <div className="usine__console">
      <div className="usine__barre" aria-hidden="true">
        <span />
        <span />
        <span />
        <em>usine.py</em>
      </div>
      <pre className="usine__code" aria-label="Le programme">
        {lignes.map((l, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`usine__ligne${allumee === i ? ' est-allumee' : ''}`}>
            <span className="usine__numero" aria-hidden="true">{i + 1}</span>
            <LigneColoree texte={l} />
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}

/** Le python : un corps d'anneaux bleus et jaunes qui ondule, une tête qui cligne et tire la langue. */
export function Serpent() {
  const anneaux = Array.from({ length: 16 }, (_, i) => i);
  return (
    <svg className="serpent" viewBox="0 0 260 70" aria-hidden="true" focusable="false">
      {anneaux.map((i) => (
        <circle
          key={i}
          className="serpent__anneau"
          cx={22 + i * 13}
          cy="40"
          r={9 + Math.sin((i / 15) * Math.PI) * 4}
          fill={i % 2 ? '#ffd43b' : '#3776ab'}
          stroke={i % 2 ? '#c99a00' : '#1f4f7a'}
          strokeWidth="1.5"
          style={{ '--n': i }}
        />
      ))}
      <g className="serpent__tete">
        <path className="serpent__langue" d="M246 42 h12 l5 -4 M258 42 l5 4" stroke="#e5383b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="236" cy="40" rx="16" ry="12.5" fill="#3776ab" stroke="#1f4f7a" strokeWidth="1.5" />
        <ellipse cx="238" cy="45" rx="10" ry="5" fill="#ffd43b" opacity="0.9" />
        <g className="serpent__oeil">
          <circle cx="240" cy="34" r="4.6" fill="#fff" />
          <circle cx="241.5" cy="34" r="2.4" fill="#152238" />
          <circle cx="242.3" cy="33" r="0.9" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

/** La question : la console de l'usine, et son python — puis l'usine en marche, une fois la réponse donnée. */
export function QuestionPython({ m, termine }) {
  // eslint-disable-next-line no-use-before-define
  if (termine) return <UsineEnMarche m={m} />;
  return (
    <div className="usine">
      <Serpent />
      <Console programme={m.question} />
    </div>
  );
}

/** Un tube de billes : la valeur en grand, des billes tant qu'on peut les compter. */
function Tube({ nom, valeur }) {
  const billes = Number.isInteger(valeur) && valeur >= 0 && valeur <= 12 ? valeur : null;
  return (
    <div className="usine__tube">
      <span className="usine__verre">
        {billes !== null
          ? Array.from({ length: billes }, (_, i) => <span key={i} className="usine__bille" style={{ '--n': i }} />)
          : <span className="usine__jauge" />}
        <strong key={String(valeur)} className="usine__valeur">{String(valeur)}</strong>
      </span>
      <span className="usine__nom">{nom}</span>
    </div>
  );
}

function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/** Après la réponse : l'usine rejoue le programme, pas à pas. */
export function UsineEnMarche({ m }) {
  const { etapes, sorties } = useMemo(() => pasAPas(m.question), [m.question]);
  // Douze secondes au plus, une demi-seconde par pas au mieux.
  const cadence = Math.max(110, Math.min(600, Math.round(12000 / Math.max(etapes.length, 1))));
  const [n, setN] = useState(() => (mouvementReduit() ? etapes.length - 1 : 0));

  useEffect(() => {
    if (n >= etapes.length - 1) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), cadence);
    return () => clearTimeout(id);
  }, [n, etapes.length, cadence]);

  if (etapes.length === 0) return <div className="scene__reponse">{m.bonne}</div>;
  const etape = etapes[Math.max(0, n)];
  const fini = n >= etapes.length - 1;
  const affichage = fini ? sorties : etape.sorties;

  return (
    <div className="usine usine--en-marche">
      <Serpent />
      <div className="usine__atelier">
        <Console programme={m.question} allumee={fini ? null : etape.ligne} />
        <div className="usine__tubes" aria-label="Les variables">
          {Object.entries(etape.variables).map(([nom, valeur]) => <Tube key={nom} nom={nom} valeur={valeur} />)}
        </div>
      </div>
      <div className={`usine__ecran${fini ? ' est-fini' : ''}`} role="status">
        <span className="usine__ecran-titre">Affichage</span>
        <strong>{affichage.length ? affichage.join('  ') : '…'}</strong>
      </div>
    </div>
  );
}
