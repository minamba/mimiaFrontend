import { Enonce, ecrire, nombresDe, useEtapes } from './commun';

/**
 * LE CHEMIN DE CRÊTE — « La droite des relatifs » (5e), le 09/10/2026.
 * La couverture : à gauche, une grotte de glace bleue ; à droite, la montagne
 * au soleil couchant ; entre les deux, une passerelle de bois enneigée. La
 * droite graduée EST cette passerelle : les négatifs côté glace, les positifs
 * côté soleil, le zéro au poteau du milieu.
 *   - COMPARER : les deux nombres flottent sur deux fanions ; APRÈS, ils se
 *     plantent à leur place, et le plus à droite (ou à gauche) s'allume ;
 *   - L'ABSCISSE : le point A, des graduations sans valeurs ; APRÈS, un
 *     randonneur part de zéro et chaque graduation passée prend sa valeur ;
 *   - LE DÉPLACEMENT : A est placé ; APRÈS, B saute unité par unité ;
 *   - RANGER : quatre cristaux dans la besace ; APRÈS, ils tombent sur la
 *     passerelle et se numérotent dans l'ordre demandé.
 */

const P = 'sc-droite-des-relatifs';
const G = 34;
const D = 606;

/** La passerelle graduée, de `min` à `max`, une graduation tous les `pas`. */
function Passerelle({
  min, max, pas, etiquette = () => false, children, hauteur = 150,
}) {
  const x = (v) => G + ((v - min) / (max - min)) * (D - G);
  const traits = [];
  for (let k = Math.ceil(min / pas - 1e-9); k * pas <= max + 1e-9; k += 1) traits.push(Math.round(k * pas * 1000) / 1000);
  const zero = min <= 0 && max >= 0 ? x(0) : null;
  return (
    <svg viewBox={`0 0 640 ${hauteur}`} className={`${P}__passerelle`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-droite-des-relatifs-ciel" x1="0" x2="1">
          <stop offset="0" stopColor="#5fb4ff" />
          <stop offset={zero !== null ? zero / 640 : 0.5} stopColor="#cfe8ff" />
          <stop offset={zero !== null ? zero / 640 : 0.5} stopColor="#ffe2b0" />
          <stop offset="1" stopColor="#ff9a4d" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height={hauteur} rx="18" fill="url(#sc-droite-des-relatifs-ciel)" />
      {/* Les stalactites côté glace, le soleil côté positif. */}
      <path d="M8 0 l8 22 l8 -22 m10 0 l6 15 l6 -15 m12 0 l9 28 l9 -28 m14 0 l5 12 l5 -12" className={`${P}__glace`} />
      <circle cx="604" cy="30" r="16" className={`${P}__soleil`} />
      {/* La passerelle : ses planches, ses poteaux. */}
      <rect x={G - 14} y="96" width={D - G + 28} height="12" rx="4" className={`${P}__planche`} />
      <line x1={G - 14} x2={D + 14} y1="96" y2="96" className={`${P}__neige`} />
      {traits.map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={v === 0 ? 74 : 86} y2="110" className={v === 0 ? `${P}__poteau-zero` : `${P}__trait`} />
          {(v === 0 || etiquette(v)) && <text x={x(v)} y="130" textAnchor="middle" className={v === 0 ? `${P}__zero` : `${P}__valeur`}>{ecrire(v)}</text>}
        </g>
      ))}
      {children?.(x)}
    </svg>
  );
}

/** Un fanion planté sur la passerelle (ou qui flotte, s'il n'est pas encore placé). */
function Fanion({
  x, texte, classe = '', delai = 0, y = 96, haut = 46,
}) {
  const l = 20 + 11 * String(texte).length;
  return (
    // L'enveloppe porte la position ; l'intérieur, l'animation (un transform CSS
    // écraserait l'autre).
    <g style={{ transform: `translate(${x}px, ${y}px)` }}>
      <g className={`${P}__fanion ${classe}`} style={{ '--delai': `${delai}ms` }}>
        <line x1="0" y1="0" x2="0" y2={-haut} />
        <path d={`M0 ${-haut} h${l} l-8 13 l8 13 h${-l} Z`} />
        <text x={l / 2 - 3} y={-haut + 19} textAnchor="middle">{texte}</text>
      </g>
    </g>
  );
}

/* --------------------------------------------------------- LES SORTES */

function Comparer({ m, termine }) {
  const [a, b] = nombresDe(m.question);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const decimaux = !Number.isInteger(a) || !Number.isInteger(b);
  const min = decimaux ? Math.floor(Math.min(a, b)) : Math.min(a, b, -1) - 1;
  const max = decimaux ? Math.ceil(Math.max(a, b)) : Math.max(a, b, 1) + 1;
  const pas = decimaux ? 0.1 : 1;
  const grand = m.consigne === 'plus-grand';
  const bon = grand ? Math.max(a, b) : Math.min(a, b);
  const etiquette = (v) => (decimaux ? Number.isInteger(v) : v % 5 === 0);
  return (
    <div className={`${P}__atelier`}>
      <Passerelle min={min} max={max} pas={pas} etiquette={etiquette}>
        {(x) => (termine ? (
          <>
            <Fanion x={x(a)} texte={ecrire(a)} classe={a === bon ? 'est-bon' : ''} delai={0} />
            <Fanion x={x(b)} texte={ecrire(b)} classe={b === bon ? 'est-bon' : ''} delai={250} />
          </>
        ) : null)}
      </Passerelle>
      {!termine && (
        <div className={`${P}__besace`} aria-hidden="true">
          {[a, b].map((v, i) => (
            <span key={v} className={`${P}__cristal${v < 0 ? ` ${P}__cristal--froid` : ''}`} style={{ '--k': i }}>{ecrire(v)}</span>
          ))}
        </div>
      )}
      {termine && (
        <p className={`${P}__lecon`}>
          {grand ? `Le plus grand est le plus à droite : ${ecrire(bon)}` : `Le plus petit est le plus à gauche : ${ecrire(bon)}`}
        </p>
      )}
    </div>
  );
}

function Abscisse({ m, termine }) {
  const pas = nombresDe(m.question.match(/vaut ([−\d,]+)/)?.[1] ?? '')[0];
  const r = m.question.match(/est (\d+) graduations à (gauche|droite)/);
  if (!Number.isFinite(pas) || !r) return null;
  const n = Number(r[1]);
  const sens = r[2] === 'gauche' ? -1 : 1;
  return termine
    ? <Marche pas={pas} n={n} sens={sens} />
    : (
      <div className={`${P}__atelier`}>
        <Passerelle min={-10 * pas} max={10 * pas} pas={pas}>
          {(x) => <Fanion x={x(sens * n * pas)} texte="A" classe="est-point" haut={66} />}
        </Passerelle>
        <p className={`${P}__legende`}>{`1 graduation = ${ecrire(pas)}`}</p>
      </div>
    );
}

/** Le randonneur part de zéro : chaque graduation passée prend sa valeur. */
function Marche({ pas, n, sens }) {
  const k = useEtapes(n, Math.min(600, 4200 / n), 400);
  const atteint = (v) => Math.sign(v) === sens && Math.abs(v) <= k * pas + 1e-9;
  return (
    <div className={`${P}__atelier`}>
      <Passerelle min={-10 * pas} max={10 * pas} pas={pas} etiquette={atteint}>
        {(x) => (
          <>
            <Fanion x={x(sens * n * pas)} texte="A" classe="est-point" haut={66} />
            <g className={`${P}__randonneur`} style={{ transform: `translate(${x(sens * k * pas)}px, 96px)` }}>
              <circle cx="0" cy="-30" r="7" />
              <path d="M0 -23 v12 m0 0 l-6 11 m6 -11 l6 11 m-6 -20 l-8 6 m8 -6 l8 6" />
            </g>
          </>
        )}
      </Passerelle>
      <p className={`${P}__lecon`}>
        {k >= n
          ? `${n} graduations × ${ecrire(pas)} = ${ecrire(n * pas)} ; à ${sens < 0 ? 'gauche' : 'droite'} de zéro : A a pour abscisse ${ecrire(sens * n * pas)}`
          : `${k} graduation${k > 1 ? 's' : ''}…`}
      </p>
    </div>
  );
}

function Deplacer({ m, termine }) {
  const [depart, d] = nombresDe(m.question);
  const droite = /à droite/.test(m.question);
  if (!Number.isFinite(depart) || !Number.isFinite(d)) return null;
  return termine
    ? <Saut depart={depart} d={d} droite={droite} />
    : (
      <div className={`${P}__atelier`}>
        <Passerelle min={depart - 13} max={depart + 13} pas={1} etiquette={(v) => v % 5 === 0}>
          {(x) => <Fanion x={x(depart)} texte={`A ${ecrire(depart)}`} classe="est-point est-large" />}
        </Passerelle>
      </div>
    );
}

function Saut({ depart, d, droite }) {
  const k = useEtapes(d, Math.min(500, 4000 / d), 400);
  const s = droite ? 1 : -1;
  const fin = depart + s * d;
  return (
    <div className={`${P}__atelier`}>
      <Passerelle min={depart - 13} max={depart + 13} pas={1} etiquette={(v) => v % 5 === 0 || v === fin}>
        {(x) => (
          <>
            {Array.from({ length: k }, (_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <path key={i} d={`M${x(depart + s * i)} 92 Q${(x(depart + s * i) + x(depart + s * (i + 1))) / 2} 64 ${x(depart + s * (i + 1))} 92`} className={`${P}__bond`} />
            ))}
            <Fanion x={x(depart)} texte={`A ${ecrire(depart)}`} classe="est-point est-large" />
            {k >= d && <Fanion x={x(fin)} texte={`B ${ecrire(fin)}`} classe="est-bon est-large" />}
          </>
        )}
      </Passerelle>
      <p className={`${P}__lecon`}>
        {k >= d
          ? `${ecrire(depart)} ${droite ? '+' : '−'} ${d} = ${ecrire(fin)}`
          : `${droite ? 'Vers la droite' : 'Vers la gauche'} : ${k} unité${k > 1 ? 's' : ''}…`}
      </p>
    </div>
  );
}

function Ranger({ m, termine }) {
  const valeurs = nombresDe(m.question.split(':')[1] ?? '');
  if (valeurs.length < 2 || valeurs.some((v) => !Number.isFinite(v))) return null;
  const croissant = m.consigne === 'ranger-croissant';
  const tries = [...valeurs].sort((u, v) => (croissant ? u - v : v - u));
  if (!termine) {
    return (
      <div className={`${P}__besace`} aria-hidden="true">
        {valeurs.map((v, i) => <span key={v} className={`${P}__cristal${v < 0 ? ` ${P}__cristal--froid` : ''}`} style={{ '--k': i }}>{ecrire(v)}</span>)}
      </div>
    );
  }
  return (
    <div className={`${P}__atelier`}>
      <Passerelle min={-10} max={10} pas={1} etiquette={(v) => v % 5 === 0} hauteur={150}>
        {(x) => valeurs.map((v, i) => (
          <g key={v}>
            {/* Deux voisins ne se cachent pas : un fanion sur deux plus haut. */}
            <Fanion x={x(v)} texte={ecrire(v)} delai={i * 200} classe={v < 0 ? 'est-froid' : 'est-chaud'} haut={croissant === (tries.indexOf(v) % 2 === 0) ? 40 : 66} />
            <g className={`${P}__rang`} style={{ '--delai': `${900 + tries.indexOf(v) * 350}ms` }}>
              <circle cx={x(v)} cy={croissant === (tries.indexOf(v) % 2 === 0) ? 44 : 18} r="11" />
              <text x={x(v)} y={croissant === (tries.indexOf(v) % 2 === 0) ? 49 : 23} textAnchor="middle">{tries.indexOf(v) + 1}</text>
            </g>
          </g>
        ))}
      </Passerelle>
      <p className={`${P}__lecon`}>{croissant ? 'De gauche à droite : du plus petit au plus grand.' : 'De droite à gauche : du plus grand au plus petit.'}</p>
    </div>
  );
}

const SORTES = {
  'plus-grand': Comparer,
  'plus-petit': Comparer,
  abscisse: Abscisse,
  deplacer: Deplacer,
  'ranger-croissant': Ranger,
  'ranger-decroissant': Ranger,
};

export function QuestionDroite({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Enonce m={m} classe={`${P}__panneau`} />
      {Sorte && <Sorte key={termine ? 'apres' : 'avant'} m={m} termine={termine} />}
    </div>
  );
}

export const sceneDroite = {
  question: (m, termine) => <QuestionDroite m={m} termine={termine} />,
  objets: P,
};
