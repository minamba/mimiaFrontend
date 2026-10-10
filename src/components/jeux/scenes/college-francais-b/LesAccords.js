import { avecVisuel, designer } from '../base';
import { LEUR, PHRASES } from '../../../../lib/jeux/college/les-accords-college';
import { BoutonsReponses, premierPiege } from './commun';

/**
 * LE JARDIN DES CARILLONS — « Les accords », 5e (09/10/2026). La couverture :
 * un garçon sous la glycine, au soleil couchant, qui tend la main vers des
 * carillons dorés et leurs étiquettes de papier. Un accord, c'est aussi de la
 * musique : la phrase juste « sonne juste ».
 *   - LA QUESTION : la phrase sur une plaque de bois suspendue, le trou qui
 *     luit doucement, le verbe à l'infinitif sur son étiquette ; la glycine
 *     se balance et perd ses pétales ;
 *   - LES RÉPONSES : des tubes de carillon pendus à une poutre (`choix`),
 *     chacun avec son étiquette de papier ; ils oscillent lentement ;
 *   - APRÈS LA RÉPONSE : la phrase se remplit, en or, les carillons sonnent
 *     (des notes s'envolent) et une étiquette dit le secret de l'accord.
 * Avant la réponse, aucun tube n'est mis en valeur : ce serait la donner.
 */

const P = 'sc-les-accords-college';

/** « … (tomber) » : la phrase, et le verbe à l'infinitif entre parenthèses à la fin. */
function decouper(question) {
  const q = String(question ?? '');
  const fin = q.match(/\s*(\([^)]*\))\s*$/);
  return fin ? { phrase: q.slice(0, fin.index), infinitif: fin[1], blanc: fin[0].slice(0, fin[0].indexOf('(')) } : { phrase: q, infinitif: null, blanc: '' };
}

/** La phrase, son trou « … » qui luit. */
function PhraseATrou({ phrase }) {
  const morceaux = String(phrase).split('…');
  return morceaux.map((morceau, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <span key={i}>
      {designer(morceau)}
      {i < morceaux.length - 1 && <span className={`${P}__trou`}>…</span>}
    </span>
  ));
}

/** La glycine : des grappes mauves qui se balancent, des pétales qui tombent. */
function Glycine() {
  const grappes = [30, 95, 160, 240, 320, 400, 470, 540, 610, 670];
  // Une grappe : des fleurs de plus en plus petites, en cône, du mauve clair au violet.
  const fleurs = [[0, 6, 6], [-4, 13, 5], [4, 14, 5], [0, 21, 4.5], [-3, 28, 3.8], [3, 29, 3.5], [0, 36, 3], [0, 42, 2.2]];
  const teintes = ['#d9b8ff', '#c9a2f5', '#b98be0', '#a674d6', '#9a6bd0', '#8a5ac4', '#7d4fb8', '#6a3fa0'];
  return (
    <svg className={`${P}__glycine`} viewBox="0 0 700 50" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
      <path d="M0 4 Q175 10 350 4 T700 4" stroke="#6b3f1f" strokeWidth="5" fill="none" />
      {grappes.map((x, i) => (
        <g key={x} className={`${P}__grappe`} style={{ '--n': i, transformOrigin: `${x}px 4px` }}>
          <path d={`M${x - 10} 6 q-8 4 -14 0 M${x + 10} 6 q8 4 14 0`} stroke="#5f9a3a" strokeWidth="4" strokeLinecap="round" />
          {fleurs.map(([dx, y, r], k) => (
            // eslint-disable-next-line react/no-array-index-key
            <circle key={k} cx={x + dx} cy={y * (0.85 + (i % 3) * 0.1)} r={r} fill={teintes[k]} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Petales() {
  return (
    <span className={`${P}__petales`} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={`${P}__petale`} style={{ '--n': i }} />)}
    </span>
  );
}

/** Le secret de l'accord : la règle du piège, ou celle de leur / leurs. */
function secret(m) {
  if (m.consigne === 'leur') {
    const entree = LEUR.find(([phrase]) => phrase === m.question);
    return PHRASES[entree ? `leur-${entree[2]}` : 'leur-regle'];
  }
  return PHRASES[premierPiege(m)] ?? PHRASES[`${m.consigne}-regle`] ?? null;
}

/** Après la réponse : la phrase qui sonne juste, et les notes qui s'envolent. */
function Resonance({ m }) {
  const { phrase } = decouper(m.question);
  const morceaux = phrase.split('…');
  const regle = secret(m);
  return (
    <div className={`${P}__resonance`} role="status">
      <span className={`${P}__notes`} aria-hidden="true">
        {['♪', '♫', '♪', '♬', '♪'].map((n, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__note`} style={{ '--n': i }}>{n}</span>
        ))}
      </span>
      <p className={`${P}__juste`}>
        <span className={`${P}__titre`}>La phrase sonne juste</span>
        {morceaux.map((morceau, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i}>
            {morceau}
            {i < morceaux.length - 1 && <strong className={`${P}__or`}>{m.bonne}</strong>}
          </span>
        ))}
      </p>
      {regle && <p className={`${P}__secret`}>{regle}</p>}
    </div>
  );
}

export function QuestionAccords({ m, termine }) {
  const { phrase, infinitif, blanc } = decouper(m.question);
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Glycine />
      <Petales />
      <div className={`${P}__plaque`}>
        <span className={`${P}__cordes`} aria-hidden="true" />
        <p className={`${P}__phrase`}>
          <PhraseATrou phrase={phrase} />
          {infinitif && (
            <>
              {blanc}
              <span className={`${P}__infinitif`}>{infinitif}</span>
            </>
          )}
        </p>
      </div>
      {termine && <Resonance m={m} />}
    </div>
  ));
}

/** Un tube de carillon doré, son battant, et le fil qui le pend à la poutre. */
function Tube({ i }) {
  const hauteur = 60 + ((i * 13) % 26);
  return (
    <svg viewBox="0 0 60 120" width="66" height="132" focusable="false">
      <line x1="30" y1="0" x2="30" y2="12" stroke="#5b3a1a" strokeWidth="2" />
      <rect x="18" y="9" width="24" height="6" rx="2" fill="#6b3f1f" />
      <rect x="13" y="14" width="34" height={hauteur} rx="9" fill={`url(#${P}-or-${i})`} stroke="#8a5a12" strokeWidth="1.4" />
      <rect x="18" y="18" width="7" height={hauteur - 10} rx="3.5" fill="#fff6c9" opacity="0.75" />
      <ellipse cx="30" cy={14 + hauteur} rx="15" ry="3" fill="#8a5a12" opacity="0.5" />
      <line x1="30" y1={14 + hauteur} x2="30" y2="120" stroke="#5b3a1a" strokeWidth="1.5" />
      <circle cx="30" cy={21 + hauteur} r="6" fill="#6b3f1f" />
      <defs>
        <linearGradient id={`${P}-or-${i}`} x1="0" x2="1">
          <stop offset="0" stopColor="#b8801f" />
          <stop offset="0.45" stopColor="#ffd86b" />
          <stop offset="1" stopColor="#a8700f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Les réponses : des tubes de carillon pendus à la poutre, chacun son étiquette. */
export function ChoixCarillons({ m, choix, fautes, choisir }) {
  return (
    <div className={`${P}__carillon`}>
      <span className={`${P}__poutre`} aria-hidden="true" />
      <BoutonsReponses
        prefixe={P}
        m={m}
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        dessin={({ i }) => <Tube i={i} />}
      />
    </div>
  );
}

const scene = {
  question: (m, termine) => <QuestionAccords m={m} termine={termine} />,
  // La phrase remplie, en or, montre déjà la bonne réponse.
  apres: () => null,
  choix: (props) => <ChoixCarillons {...props} />,
};

export default scene;
