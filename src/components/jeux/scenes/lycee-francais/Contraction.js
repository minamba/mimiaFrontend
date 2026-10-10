import { TEXTES, fourchette } from '../../../../lib/jeux/lycee/contraction';
import { BoutonsChoix, libelleBon } from './commun';

/**
 * LA DISTILLERIE DE CRISTAL — « La contraction de texte » (1re
 * technologique). La couverture : une distillerie de verre et de laiton, des
 * tubes où coulent des fleurs, et au bout un flacon de cristal où tombe une
 * goutte d'essence violette. Contracter, c'est DISTILLER un texte en son
 * essence ; la scène le montre :
 *   - LA QUESTION : le texte dans le grand alambic de verre, où flottent des
 *     fleurs ; un tube le relie au petit flacon, vide ;
 *   - LES RÉPONSES : des flacons de parfum (`choix`), chacun portant sa
 *     version ; on choisit celui qui garde l'essence ;
 *   - APRÈS LA RÉPONSE : la goutte tombe et le flacon s'emplit. La bonne
 *     contraction s'y dépose, avec le compte des mots (le texte → son
 *     essence) ; le mouvement passe d'alambic en alambic, étape par étape ;
 *     la fourchette et la longueur se lisent sur une éprouvette graduée, où
 *     la bonne zone s'allume et où le niveau monte.
 * Avant la réponse, le flacon reste vide : il dirait laquelle choisir.
 */

const P = 'sc-contraction';

const compterMots = (t) => String(t).split(/[\s’']+/).filter((x) => /[\p{L}\d]/u.test(x)).length;

/** Le texte de la manche, s'il est un des paragraphes du module. */
const texteDe = (m) => TEXTES.find((t) => t.texte === m.question) ?? null;

/** L'alambic : le texte, des fleurs qui flottent, un tube vers le flacon. */
function Alambic({ m }) {
  return (
    <div className={`${P}__alambic`}>
      <span className={`${P}__fleurs`} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => <span key={i} className={`${P}__fleur`} style={{ '--n': i }} />)}
      </span>
      <p className={`${P}__texte`}>{m.question}</p>
    </div>
  );
}

/** Le flacon de cristal : il s'emplit, et la bonne contraction s'y dépose. */
function Flacon({ m }) {
  const t = texteDe(m);
  const avant = t ? compterMots(t.texte) : null;
  const apres = compterMots(libelleBon(m));
  return (
    <div className={`${P}__distillat`}>
      <span className={`${P}__goutte`} aria-hidden="true" />
      <div className={`${P}__flacon`}>
        <span className={`${P}__liquide`} aria-hidden="true" />
        <p className={`${P}__essence`}>{libelleBon(m)}</p>
      </div>
      {avant && <span className={`${P}__compte`}>{`${avant} mots → ${apres} mots : l’essence, reformulée`}</span>}
    </div>
  );
}

/** Le mouvement, d'alambic en alambic : chaque étape s'allume à son tour. */
function Etapes({ m }) {
  const etapes = String(m.bonne).split(' → ');
  return (
    <ol className={`${P}__etapes`} aria-label="Le mouvement du texte">
      {etapes.map((e, i) => (
        <li key={e} className={`${P}__etape`} style={{ '--k': i }}>
          <span className={`${P}__ballon`} aria-hidden="true" />
          {e}
        </li>
      ))}
    </ol>
  );
}

/** L'éprouvette graduée : la zone juste (le quart, à 10 % près), et le niveau de la contraction. */
function Eprouvette({ m }) {
  const nombres = (m.question.match(/\d+/g) ?? []).map(Number);
  const n = nombres[0];
  if (!n) return null;
  const { quart, min, max } = fourchette(n);
  const mots = m.consigne === 'longueur' ? nombres[1] : null;
  // L'éprouvette ne montre que le haut de l'échelle : la zone juste y reste bien lisible.
  const bas = min / 2;
  const haut = Math.max(max * 1.25, (mots ?? 0) * 1.1);
  const part = (v) => ((v - bas) / (haut - bas)) * 100;
  const y = (v) => `${100 - part(v)}%`;
  let etat = '';
  if (mots !== null) etat = mots < min ? 'courte' : (mots > max ? 'longue' : 'dans');
  return (
    <div className={`${P}__mesure`}>
      <div className={`${P}__eprouvette`}>
        <span className={`${P}__zone`} style={{ top: y(max), bottom: `${part(min)}%` }} />
        <span className={`${P}__trait`} style={{ top: y(max) }} data-valeur={max} />
        <span className={`${P}__trait ${P}__trait--quart`} style={{ top: y(quart) }} />
        <span className={`${P}__trait`} style={{ top: y(min) }} data-valeur={min} />
        {mots !== null && (
          <span className={`${P}__niveau ${P}__niveau--${etat}`} style={{ height: `${Math.max(4, part(mots))}%` }} data-valeur={`${mots} mots`} />
        )}
      </div>
      <p className={`${P}__lecture`}>
        {`${n} mots ÷ 4 = ${quart} ; 10 % de ${quart} = ${quart / 10} → de ${min} à ${max} mots.`}
      </p>
    </div>
  );
}

function Bilan({ m }) {
  let contenu;
  if (m.consigne === 'fidele') contenu = <Flacon m={m} />;
  else if (m.consigne === 'mouvement') contenu = <Etapes m={m} />;
  else if (m.consigne === 'fourchette' || m.consigne === 'longueur') {
    contenu = (
      <>
        <Eprouvette m={m} />
        <strong className={`${P}__verdict`}>{libelleBon(m)}</strong>
      </>
    );
  } else contenu = <strong className={`${P}__verdict`}>{libelleBon(m)}</strong>;
  return <div className={`${P}__bilan`} role="status">{contenu}</div>;
}

export function QuestionContraction({ m, termine }) {
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <Alambic m={m} />
      {termine && <Bilan m={m} />}
    </div>
  );
}

/** Les flacons de parfum : on choisit celui qui garde l'essence du texte. */
export function ChoixContraction({ choix, fautes, choisir }) {
  return (
    <BoutonsChoix
      p={P}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      etiquette="Choisis le bon flacon"
      deco={() => <span className={`${P}__bouchon`} aria-hidden="true" />}
    />
  );
}
