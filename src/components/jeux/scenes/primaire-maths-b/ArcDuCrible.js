import { rangee, rang } from './communs';
import './primaire-maths-b.css';

/**
 * LE PAS DE TIR DU CRIBLE — le jeu « Le crible » (CM1), 09/10/2026. La
 * couverture montre une archère au kimono, des cerisiers en fleurs et une
 * cible au bord d'un lac au coucher du soleil (« Trier pour mieux viser ! ») :
 *   - LA QUESTION : la bannière du dojo porte la question ; l'arc est bandé,
 *     la flèche tremble, les pétales tombent ;
 *   - LES RÉPONSES : trois CIBLES sur leurs pieds — on tire sur celle qu'on
 *     choisit. Une cible fausse garde une flèche plantée au bord, et se barre ;
 *   - APRÈS LA RÉPONSE : la flèche part et se plante au centre ; à côté, le
 *     CRIBLE (un tamis) trie les trois nombres — seul le multiple passe à
 *     travers les mailles, et la phrase dit pourquoi (le dernier chiffre, ou
 *     la table de multiplication).
 * Rien ne trie avant la réponse : ce serait la donner.
 */

/** Le diviseur de la manche : « par5 » → 5, « table7 » → 7. */
const diviseurDe = (m) => Number(String(m.consigne ?? '').replace(/\D/g, '')) || null;

function Petales() {
  return (
    <div className="sc-le-crible__petales" aria-hidden="true">
      {rangee(10).map((i) => <span key={i} style={rang(i)} />)}
    </div>
  );
}

/** L'arc bandé et sa cible ; `tire` : la flèche part et se plante au centre. */
function PasDeTir({ tire }) {
  return (
    <svg className={`sc-le-crible__tir${tire ? ' est-tire' : ''}`} viewBox="0 0 360 150" aria-hidden="true" focusable="false">
      {/* Le lac au coucher du soleil, la montagne au loin. */}
      <path d="M118 114 L168 66 L192 88 L228 50 L276 114 Z" className="sc-le-crible__mont" />
      <circle cx="204" cy="100" r="14" className="sc-le-crible__soleil" />
      <rect x="0" y="112" width="360" height="38" className="sc-le-crible__lac" />

      {/* La branche de cerisier, en haut, qui se balance. */}
      <g className="sc-le-crible__rameau">
        <path d="M150 0 Q190 18 240 10 Q262 6 280 16" className="sc-le-crible__branche" />
        {[[178, 14], [206, 18], [232, 9], [258, 12], [196, 4]].map(([x, y]) => (
          <g key={`${x}`} className="sc-le-crible__fleur" transform={`translate(${x} ${y})`}>
            {rangee(5).map((k) => <ellipse key={k} cx="0" cy="-4" rx="3" ry="4.5" transform={`rotate(${k * 72})`} />)}
            <circle r="1.8" className="sc-le-crible__coeur-fleur" />
          </g>
        ))}
      </g>

      {/* La cible sur son pied. */}
      <g className="sc-le-crible__cible-fixe">
        <line x1="282" y1="110" x2="268" y2="150" className="sc-le-crible__pied-bois" />
        <line x1="318" y1="110" x2="332" y2="150" className="sc-le-crible__pied-bois" />
        <circle cx="300" cy="75" r="46" fill="#f4ecd8" stroke="#5a3a1a" strokeWidth="4" />
        <circle cx="300" cy="75" r="37" fill="#2b2b2b" />
        <circle cx="300" cy="75" r="28" fill="#f4ecd8" />
        <circle cx="300" cy="75" r="19" fill="#2b2b2b" />
        <circle cx="300" cy="75" r="10" fill="#e0352b" />
      </g>

      {/* L'arc et sa corde. */}
      <g className="sc-le-crible__arc">
        <path d="M46 14 Q4 75 46 136" className="sc-le-crible__bois" />
        <rect x="14" y="66" width="10" height="18" rx="3" className="sc-le-crible__poignee" />
        <path d="M46 14 L24 75 L46 136" className="sc-le-crible__corde" />
      </g>

      {/* La flèche : encochée, puis plantée au centre. */}
      <g className="sc-le-crible__fleche">
        <line x1="24" y1="75" x2="112" y2="75" className="sc-le-crible__fut" />
        <path d="M112 69 L124 75 L112 81 Z" className="sc-le-crible__pointe" />
        <path d="M24 75 L16 68 L32 68 Z M24 75 L16 82 L32 82 Z" className="sc-le-crible__plumes" />
      </g>
    </svg>
  );
}

/** La bannière du dojo : la question, en entier. */
function Banniere({ m }) {
  const d = diviseurDe(m);
  return (
    <div className="sc-le-crible__banniere">
      {d && <span className="sc-le-crible__sceau" aria-hidden="true">{d}</span>}
      <p className="sc-le-crible__question">{m.question}</p>
    </div>
  );
}

/** Pourquoi le bon nombre passe le crible : son dernier chiffre, ou sa table. */
function Preuve({ m }) {
  const d = diviseurDe(m);
  const n = Number(m.bonne);
  const texte = String(m.bonne);
  if (!d || !Number.isFinite(n)) return <p className="sc-le-crible__preuve"><strong>{texte}</strong></p>;
  if (String(m.consigne).startsWith('table')) {
    return (
      <p className="sc-le-crible__preuve">
        <strong>{`${d} × ${n / d} = ${texte}`}</strong>
        {` : ${texte} est dans la table de ${d}.`}
      </p>
    );
  }
  const dernier = texte.slice(-1);
  const regle = { 2: 'un chiffre pair', 5: 'un 0 ou un 5', 10: 'un 0' }[d] ?? `un multiple de ${d}`;
  return (
    <p className="sc-le-crible__preuve">
      <strong>
        {texte.slice(0, -1)}
        <mark className="sc-le-crible__dernier">{dernier}</mark>
      </strong>
      {` finit par ${dernier} : ${regle}.`}
    </p>
  );
}

/** Le crible : les trois nombres sur le tamis, seul le bon passe à travers. */
function Tamis({ m }) {
  return (
    <div className="sc-le-crible__tamis" aria-hidden="true">
      <div className="sc-le-crible__cailloux">
        {m.choix.map((c, i) => (
          <span
            key={c.cle}
            className={`sc-le-crible__caillou${String(c.cle) === String(m.bonne) ? ' est-bon' : ' est-retenu'}`}
            style={rang(i)}
          >
            {c.libelle}
          </span>
        ))}
      </div>
      <span className="sc-le-crible__grille" />
      <span className="sc-le-crible__panier" />
    </div>
  );
}

export function QuestionCrible({ m, termine, trouve }) {
  return (
    <div className={`sc-le-crible${termine ? ' est-termine' : ''}`}>
      <Petales />
      <Banniere m={m} />
      <div className="sc-le-crible__terrain">
        <PasDeTir tire={termine} />
        {termine && <Tamis m={m} />}
      </div>
      {termine && (
        <div className="sc-le-crible__verdict">
          <span className="sc-le-crible__titre-verdict">{trouve ? 'En plein dans le mille !' : 'Voici la bonne cible'}</span>
          <Preuve m={m} />
        </div>
      )}
    </div>
  );
}

/** Les trois cibles : on tire sur celle qu'on choisit. */
export function CiblesDuCrible({ choix, fautes, choisir }) {
  return (
    <ul className="sc-le-crible__cibles" aria-label="Choisis ta cible">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`sc-le-crible__cible${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className="sc-le-crible__nombre">{libelle}</span>
              {faux && <span className="sc-le-crible__plantee" aria-hidden="true" />}
            </button>
            <span className="sc-le-crible__trepied" aria-hidden="true" />
          </li>
        );
      })}
    </ul>
  );
}

export const SCENE_CRIBLE = {
  rendreQuestion: (m, termine, extra) => <QuestionCrible m={m} termine={termine} trouve={Boolean(extra?.trouve)} />,
  // La scène montre déjà le bon nombre, passé à travers le crible.
  rendreApres: () => null,
  rendreLesChoix: (props) => <CiblesDuCrible {...props} />,
};
