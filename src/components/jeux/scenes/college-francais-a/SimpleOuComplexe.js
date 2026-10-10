import { Designe, laBonne } from './commun';

/**
 * LA VILLE DES CANAUX — « Simple ou complexe ? » (6e → 4e). La couverture :
 * une ville sur l'eau, des passerelles couvertes qui relient les îlots. C'est
 * la phrase complexe : chaque PROPOSITION est un îlot, et ce qui les relie
 * (une virgule, une conjonction, un subordonnant) est un PONT.
 *   - LA QUESTION : la phrase sur l'écriteau du quai, les passerelles et leurs
 *     lanternes au-dessus, l'eau qui ondule ;
 *   - LES RÉPONSES : des barques qui dansent sur le canal (`objets`) ;
 *   - APRÈS LA RÉPONSE : l'archipel se dessine — un îlot par proposition, et
 *     le bon pont entre eux : des pierres de gué pour la juxtaposition, un pont
 *     en arc pour la coordination, une passerelle à cadenas pour la
 *     subordination (l'îlot ne tient pas seul). En 4e, les marques de la
 *     question et de la négation s'allument dans la phrase.
 */

const P = 'sc-simple-ou-complexe';

const LIENS = {
  juxtaposition: { nom: 'Juxtaposition', mots: 'une virgule, un point-virgule, deux-points' },
  coordination: { nom: 'Coordination', mots: 'mais, ou, et, donc, or, ni, car' },
  subordination: { nom: 'Subordination', mots: 'que, quand, si, parce que, qui…' },
  relatif: { nom: 'Pronom relatif', mots: 'qui, que, dont, où' },
};

/** Un archipel : `n` îlots, reliés deux à deux par le pont d'un lien. */
function Archipel({ n, lien = null }) {
  const iles = Array.from({ length: Math.max(1, Math.min(n, 4)) }, (_, i) => i);
  const sorte = lien === 'relatif' ? 'subordination' : lien;
  return (
    <div className={`${P}__archipel`} aria-hidden="true">
      {iles.map((i) => (
        <span key={i} className={`${P}__groupe`} style={{ '--n': i }}>
          {i > 0 && <span className={`${P}__pont ${P}__pont--${sorte ?? 'simple'}`} />}
          <span className={`${P}__ile${sorte === 'subordination' && i > 0 ? ` ${P}__ile--dependante` : ''}`} data-nom={`proposition ${i + 1}`} />
        </span>
      ))}
    </div>
  );
}

/** Surligne dans un texte ce qui répond à un motif (à un seul groupe capturant). */
function Surligne({ texte, motif, classe }) {
  return String(texte).split(motif).map((t, i) => (i % 2
    // eslint-disable-next-line react/no-array-index-key
    ? <mark key={i} className={classe}>{t}</mark>
    : t));
}

const MARQUES = {
  negation: /(ne |n’|\bpas\b|\bplus\b|\brien\b|\bjamais\b|\bpersonne\b|Personne)/,
  inversion: /(-t-|-(?:il|elle|ils|elles|on|tu|vous|nous|je)\b)/,
  'est-ce-que': /(Est-ce que|est-ce que|Est-ce qu’|est-ce qu’)/,
  intonation: /(\?)/,
};

const NOMS_COMPTE = (n) => `${n} verbe${n > 1 ? 's' : ''} conjugué${n > 1 ? 's' : ''} : ${n} proposition${n > 1 ? 's' : ''}`;

/** Ce que montre l'archipel, selon la sorte de manche. */
function Explication({ m }) {
  const sorte = String(m.consigne ?? '');
  const bonne = laBonne(m);
  if (sorte === 'simple-complexe-6e') {
    const simple = m.bonne === 'simple';
    return (
      <>
        <Archipel n={simple ? 1 : 2} />
        <p className={`${P}__legende`}>
          {simple ? 'Un seul verbe conjugué : un seul îlot, une phrase simple.' : 'Au moins deux verbes conjugués : plusieurs îlots reliés, une phrase complexe.'}
        </p>
      </>
    );
  }
  if (sorte === 'compter-6e') {
    const n = Number(m.bonne) || 1;
    return (
      <>
        <Archipel n={n} />
        <p className={`${P}__legende`}>{NOMS_COMPTE(n)}</p>
      </>
    );
  }
  if (sorte === 'laquelle-6e') {
    return (
      <>
        <Archipel n={2} />
        <p className={`${P}__legende`}>{`« ${bonne} » : deux verbes conjugués, deux îlots reliés.`}</p>
      </>
    );
  }
  const lien = /^relier-(.+)-5e$/.exec(sorte)?.[1] ?? (['lien-5e', 'mot-5e'].includes(sorte) ? m.bonne : null);
  if (lien && LIENS[lien]) {
    return (
      <>
        <Archipel n={2} lien={lien} />
        <p className={`${P}__legende`}>
          <strong>{LIENS[lien].nom}</strong>
          {` : ${LIENS[lien].mots}.`}
          {lien === 'subordination' || lien === 'relatif' ? ' L’îlot subordonné ne tient pas seul.' : ''}
        </p>
      </>
    );
  }
  const marque = {
    'negation-4e': 'negation', 'inversion-4e': 'inversion', 'interrogative-4e': m.bonne,
  }[sorte];
  if (marque && MARQUES[marque]) {
    const texte = sorte === 'interrogative-4e' ? m.question : bonne;
    return (
      <p className={`${P}__marques ${P}__marques--${marque}`}>
        <Surligne texte={texte} motif={MARQUES[marque]} classe={`${P}__marque`} />
        <span className={`${P}__nom-marque`}>
          {{
            negation: 'La négation a deux bouées : « ne », puis « pas », « plus », « rien », « jamais » ou « personne ».',
            inversion: 'Le sujet passe après le verbe, attaché par un trait d’union (et un « t » entre deux voyelles).',
            'est-ce-que': '« Est-ce que » annonce la question.',
            intonation: 'Rien ne change dans la phrase : seule la voix monte, et le point d’interrogation.',
          }[marque]}
        </span>
      </p>
    );
  }
  return null;
}

/** Les passerelles couvertes et leurs lanternes, au-dessus du canal. */
function Passerelles() {
  return (
    <svg className={`${P}__passerelles`} viewBox="0 0 320 70" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <path d="M0 70 V30 H40 V70 Z M280 70 V26 H320 V70 Z" fill="#c9a27a" stroke="#8a6440" />
      <path d="M40 40 Q160 6 280 40 V50 Q160 18 40 50 Z" fill="#9c3d2e" stroke="#5e2219" />
      <path d="M40 34 Q160 0 280 34" fill="none" stroke="#2f4f6f" strokeWidth="6" />
      {[70, 110, 150, 190, 230].map((x, i) => (
        <rect key={x} className={`${P}__vitrail`} style={{ '--n': i }} x={x} y={22 + Math.abs(2 - i) * 3} width="22" height="11" rx="2" />
      ))}
      <circle className={`${P}__lanterne`} cx="40" cy="26" r="5" />
      <circle className={`${P}__lanterne`} cx="280" cy="22" r="5" style={{ '--n': 1 }} />
    </svg>
  );
}

export function QuestionSimpleComplexe({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-relie' : ''}`}>
      <Passerelles />
      <div className={`${P}__quai`}>
        <p className={`${P}__phrase`}><Designe texte={m.question} classe={`${P}__designe`} /></p>
      </div>
      <span className={`${P}__eau`} aria-hidden="true" />
      {termine && (
        <div className={`${P}__carte`} role="status">
          <Explication m={m} />
        </div>
      )}
    </div>
  );
}
