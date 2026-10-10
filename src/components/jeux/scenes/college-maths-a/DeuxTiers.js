import { classeQuestion } from '../base';
import { Etapes, Explication } from './outils';

/**
 * LE MARCHÉ AUX GRAINS — « Les deux tiers du sac », 6e (09/10/2026). La
 * couverture : un étal de marché sous des auvents rouges, un grand sac de
 * toile plein de grains dorés, des épis de blé, trois bols de bois qu'un
 * garçon remplit à pleines mains. La scène :
 *   - LA QUESTION : l'ardoise du marchand, sous l'auvent festonné ; le sac
 *     déborde de grains, les épis se balancent au vent ;
 *   - LES RÉPONSES : des sachets de toile noués (`objets`) ;
 *   - APRÈS LA RÉPONSE : le sac se vide dans les bols — autant de bols que le
 *     dénominateur, la même quantité dans chacun ; puis les bols qu'on prend
 *     s'allument (ou s'en vont, pour « ce qui reste »). Pour « quelle
 *     fraction », les grains se comptent : la part en couleur, sur le tout.
 */
const P = 'sc-deux-tiers-du-sac';

function lire(m) {
  const q = m.question;
  const f = /(\d+)\/(\d+)/.exec(q);
  const autres = (f ? q.replace(f[0], ' ') : q).match(/\d+/g)?.map(Number) ?? [];
  if (m.consigne === 'quelle-fraction') {
    const [part, tout] = autres;
    return part !== undefined && tout ? { sorte: 'part', part, tout } : null;
  }
  if (!f) return null;
  const n = Number(f[1]);
  const d = Number(f[2]);
  const N = autres[0] ?? (/heure/.test(q) ? 60 : null);
  if (!N || !d || N % d) return null;
  return {
    sorte: m.consigne === 'reste' ? 'reste' : 'fraction', n, d, N, k: N / d, unite: /heure/.test(q) ? ' min' : '',
  };
}

/** Les bols : autant que de parts, la même quantité dans chacun ; les bols pris s'allument. */
function Bols({ l }) {
  return (
    <div className={`${P}__bols`} aria-hidden="true">
      {Array.from({ length: l.d }, (_, i) => {
        const pris = i < l.n;
        const garde = l.sorte === 'reste' ? !pris : pris;
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`${P}__bol${garde ? ' est-garde' : ''}${l.sorte === 'reste' && pris ? ' est-pris' : ''}`}
            style={{ '--d': `${(0.3 + i * 0.15).toFixed(2)}s`, '--d2': `${(1.6 + i * 0.12).toFixed(2)}s` }}
          >
            <span className={`${P}__grains`} />
            <span className={`${P}__dose`}>{l.k}</span>
          </span>
        );
      })}
    </div>
  );
}

/** Les grains comptés : la part en couleur, sur le tout. */
function Grains({ part, tout }) {
  if (tout > 60) return null;
  return (
    <div className={`${P}__compte`} aria-hidden="true">
      {Array.from({ length: tout }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`${P}__grain${i < part ? ' est-compte' : ''}`} style={{ '--d': `${(0.2 + i * 0.04).toFixed(2)}s` }} />
      ))}
    </div>
  );
}

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  if (l.sorte === 'part') {
    return (
      <>
        <Grains part={l.part} tout={l.tout} />
        <Etapes p={P} depart={1.6} lignes={[`${l.part} sur ${l.tout} : la part en haut, le tout en bas → ${l.part}/${l.tout}`]} />
      </>
    );
  }
  const lignes = [`Le tout en ${l.d} parts égales : ${l.N} ÷ ${l.d} = ${l.k}${l.unite} par bol.`];
  if (l.sorte === 'fraction') lignes.push(`On prend ${l.n} bols : ${l.n} × ${l.k} = ${l.n * l.k}${l.unite}`);
  else {
    lignes.push(`On en prend ${l.n} : ${l.n} × ${l.k} = ${l.n * l.k}`);
    lignes.push(`Il reste ${l.N} − ${l.n * l.k} = ${l.N - l.n * l.k}`);
  }
  return (
    <>
      <Bols l={l} />
      <Etapes p={P} depart={2.2} lignes={lignes} />
    </>
  );
}

/** Le décor : l'auvent festonné, le sac qui déborde, les épis qui se balancent. */
function Etal() {
  return (
    <div className={`${P}__etal`} aria-hidden="true">
      <span className={`${P}__auvent`} />
      <svg className={`${P}__sac`} viewBox="0 0 120 90" focusable="false">
        <path d="M18 88 C 6 60 14 30 30 22 L 90 22 C 106 30 114 60 102 88 Z" className={`${P}__toile`} />
        <ellipse cx="60" cy="24" rx="32" ry="9" className={`${P}__dessus`} />
        {[44, 54, 64, 74, 50, 68, 59].map((x, i) => (
          <circle key={`${x}-${i}`} cx={x} cy={i > 3 ? 18 : 22} r="3.4" className={`${P}__grain-decor`} />
        ))}
      </svg>
      {[0, 1, 2].map((i) => (
        <svg key={i} className={`${P}__epi`} viewBox="0 0 20 80" focusable="false" style={{ animationDelay: `${(i * -0.7).toFixed(1)}s` }}>
          <line x1="10" y1="80" x2="10" y2="18" />
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <ellipse cx="6" cy={10 + k * 8} rx="3.2" ry="5" transform={`rotate(-25 6 ${10 + k * 8})`} />
              <ellipse cx="14" cy={10 + k * 8} rx="3.2" ry="5" transform={`rotate(25 14 ${10 + k * 8})`} />
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}

export function QuestionDeuxTiers({ m, termine }) {
  const l = termine ? lire(m) : null;
  let retard = 2.6;
  if (l && l.sorte !== 'part') retard = l.sorte === 'reste' ? 4.6 : 3.8;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Etal />
      <div className={`${P}__ardoise`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={retard} />}
    </div>
  );
}
