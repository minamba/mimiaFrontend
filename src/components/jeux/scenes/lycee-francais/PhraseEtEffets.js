import { EFFETS, PROCEDES } from '../../../../lib/jeux/lycee/phrase-et-effets';
import { Lignes, libelleBon, surligner } from './commun';

/**
 * L'ORGUE DE VERRE — « La phrase et ses effets » (2de). La couverture : un
 * palais de cristal où montent de hauts tubes de verre, traversés de rubans
 * de lumière verte et rose. La scène la reprend :
 *   - LA QUESTION : la phrase sur une vitre, entre deux tubes de verre où
 *     montent des rubans de lumière ;
 *   - LES RÉPONSES : des fioles de verre lumineuses (`objets`) ;
 *   - APRÈS LA RÉPONSE : LE RYTHME DE LA PHRASE. Elle se coupe à chaque
 *     ponctuation, et chaque groupe devient un tube d'orgue, d'autant plus
 *     haut qu'il compte de mots ; les tubes s'emplissent de lumière l'un après
 *     l'autre. On VOIT la phrase nominale, brève et seule ; la période, longue
 *     montée qui fait attendre sa fin ; l'asyndète, ses groupes courts
 *     enchaînés ; le rythme ternaire, ses trois tubes. La mise en relief et
 *     la question rhétorique s'allument en plus dans la phrase.
 * Avant la réponse, la phrase reste entière et nue.
 */

const P = 'sc-phrase-et-effets';

/** La phrase citée : entre les guillemets de la première ligne. */
const phraseDe = (m) => /« (.+) »/.exec(m.question)?.[1] ?? null;

/** Le procédé d'une manche : la bonne réponse, ou celui que nomme « … : quel effet ? ». */
function procedeDe(m) {
  if (m.consigne === 'procede') return m.bonne;
  if (m.consigne === 'effet') return EFFETS.find(([phrase]) => phraseDe(m) === phrase)?.[1] ?? null;
  return null;
}

/** Les groupes de la phrase, coupés à chaque ponctuation, et leur nombre de mots. */
export function groupes(phrase) {
  return String(phrase)
    .split(/[,;:.!?…]+/)
    .map((g) => g.trim())
    .filter(Boolean)
    .map((g) => ({ texte: g, mots: g.split(/[\s’']+/).filter(Boolean).length }));
}

/** Ce qui s'allume dans la phrase, après la réponse. */
function morceauxDe(procede, phrase) {
  if (procede === 'mise-en-relief') {
    return [...phrase.matchAll(/(C’est|c’est|Ce qui|Ce que|(?<![\p{L}])qu(?:i|e|’)(?![\p{L}]))/gu)].map((r) => [r[0], 'relief']);
  }
  if (procede === 'interrogation-rhetorique' || procede === null) {
    return phrase.includes('?') ? [['?', 'relief']] : [];
  }
  return [];
}

/** Les tubes de l'orgue : un par groupe, plus haut quand le groupe est long. */
function Orgue({ phrase }) {
  const g = groupes(phrase);
  return (
    <ol className={`${P}__orgue`} aria-label="Le rythme de la phrase, groupe par groupe">
      {g.map((x, i) => (
        <li
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`${P}__tube`}
          style={{ '--h': `${Math.min(150, 26 + x.mots * 9)}px`, '--n': i }}
        >
          <span className={`${P}__verre`}><span className={`${P}__lumiere`} /></span>
          <span className={`${P}__mots`}>{`${x.mots} mot${x.mots > 1 ? 's' : ''}`}</span>
        </li>
      ))}
    </ol>
  );
}

const marque = (role) => `${P}__allume ${P}__allume--${role}`;

export function QuestionPhrase({ m, termine }) {
  const phrase = phraseDe(m);
  const procede = termine ? procedeDe(m) : null;
  const morceaux = termine && phrase ? morceauxDe(procede, phrase) : [];
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__salle`}>
        <span className={`${P}__colonne ${P}__colonne--verte`} aria-hidden="true"><span className={`${P}__ruban`} /></span>
        <div className={`${P}__vitre`}>
          <Lignes
            texte={m.question}
            className={`${P}__texte`}
            classeLigne={`${P}__ligne`}
            rendreLigne={(l, i) => {
              if (i > 0) return <span className={`${P}__demande`}>{l}</span>;
              return morceaux.length ? surligner(l, morceaux, marque) : l;
            }}
          />
        </div>
        <span className={`${P}__colonne ${P}__colonne--rose`} aria-hidden="true"><span className={`${P}__ruban`} /></span>
      </div>
      {termine && phrase && (
        <div className={`${P}__atelier`} role="status">
          <Orgue phrase={phrase} />
          <p className={`${P}__verdict`}>
            {procede && m.consigne === 'effet' && `${PROCEDES[procede]} → ${libelleBon(m)}`}
            {m.consigne === 'forme' && `Interrogation ${libelleBon(m).toLowerCase()}`}
            {m.consigne !== 'effet' && m.consigne !== 'forme' && libelleBon(m)}
          </p>
        </div>
      )}
    </div>
  );
}
