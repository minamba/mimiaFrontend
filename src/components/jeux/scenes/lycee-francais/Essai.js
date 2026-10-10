import { ESSAIS, ORDRE, ROLES } from '../../../../lib/jeux/lycee/essai';
import { libelleBon, lignesDe } from './commun';

/**
 * LA ROTONDE DE LA SPHÈRE — « L'essai » (1re technologique). La couverture :
 * une rotonde de marbre au couchant, des bassins en terrasses, et au centre
 * une grande sphère de marbre rose prise dans un anneau doré. La scène la
 * reprend :
 *   - LA QUESTION : le texte sur une dalle de marbre, sous la sphère qui
 *     tourne dans son anneau ; la phrase désignée y est soulignée ;
 *   - LES RÉPONSES : des sphères de marbre rose cerclées d'or (`objets`) ;
 *   - APRÈS LA RÉPONSE : L'ESSAI SE MONTE PIERRE À PIERRE. Ses cinq phrases
 *     prennent, l'une après l'autre, la couleur de leur rôle : la thèse,
 *     l'argument, l'exemple qui le prouve, le contre-argument et la
 *     réfutation qui lui répond ; dessous, la chaîne des cinq rôles allume
 *     celui de la phrase désignée. Le
 *     connecteur prend sa place dans l'anneau du trou et dit le lien qu'il
 *     exprime ; la question posée flotte dans la sphère ; l'appui se relie à
 *     son argument.
 * Rien ne se monte avant la réponse : chaque pierre porterait son rôle.
 */

const P = 'sc-essai';

/** Le lien qu'exprime chaque connecteur du module. */
const LIENS = {
  'bien que': 'une concession', 'même si': 'une concession', 'pour que': 'un but', 'pour qu’': 'un but',
  si: 'une condition', car: 'une cause', puisque: 'une cause', 'c’est pourquoi': 'une conséquence',
  'si bien que': 'une conséquence', comme: 'une comparaison', 'au contraire': 'une opposition',
};

/** L'essai de la manche : celui dont les cinq phrases ouvrent la question. */
const essaiDe = (m) => ESSAIS.find((e) => m.question.startsWith(e.join(' '))) ?? null;

/** La sphère de marbre rose dans son anneau doré, qui tourne lentement. */
function Sphere({ children = null }) {
  return (
    <div className={`${P}__sphere`}>
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`${P}-marbre`} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff3ee" />
            <stop offset="0.5" stopColor="#f2b8a8" />
            <stop offset="1" stopColor="#c27060" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="34" fill={`url(#${P}-marbre)`} />
        <path d="M36 50 Q58 58 80 42 M40 72 Q62 66 84 76" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.6" />
        <g className={`${P}__anneau`}>
          <ellipse cx="60" cy="60" rx="52" ry="16" fill="none" stroke="#e8b53c" strokeWidth="4" />
        </g>
        <g className={`${P}__anneau ${P}__anneau--lent`}>
          <ellipse cx="60" cy="60" rx="16" ry="52" fill="none" stroke="#d99a2b" strokeWidth="3" />
        </g>
      </svg>
      {children}
    </div>
  );
}

/** La chaîne des cinq rôles, dans l'ordre de l'essai ; celui de la phrase désignée s'illumine. */
function Chaine({ bonne }) {
  return (
    <ol className={`${P}__chaine`} aria-label="Les cinq pierres de l’essai">
      {ORDRE.map((role, i) => (
        <li key={role} className={`${P}__maillon ${P}__pierre--${role}${role === bonne ? ` ${P}__maillon--ici` : ''}`} style={{ '--k': i }}>
          {ROLES[role]}
        </li>
      ))}
    </ol>
  );
}

/** Le texte de la dalle : la phrase désignée soulignée, le trou du connecteur dans son anneau. */
function Dalle({ m, termine }) {
  const lignes = lignesDe(m.question);
  return (
    <p className={`${P}__texte`}>
      {lignes.map((l, i) => {
        if (l.trim() === '') return null;
        let contenu = l;
        const essai = termine && m.consigne === 'role' && i === 0 ? essaiDe(m) : null;
        if (/^→ /.test(l)) contenu = <span className={`${P}__designe`}>{l}</span>;
        else if (essai && l === essai.join(' ')) {
          // L'essai se monte : chaque phrase devient la pierre de son rôle.
          contenu = essai.map((phrase, k) => (
            <span key={ORDRE[k]}>
              <mark className={`${P}__pierre ${P}__pierre--${ORDRE[k]}`} style={{ '--k': k }}>{phrase}</mark>
              {k < essai.length - 1 ? ' ' : null}
            </span>
          ));
        } else if (m.consigne === 'connecteur' && l.includes('…')) {
          const at = l.indexOf('…');
          contenu = (
            <>
              {l.slice(0, at)}
              <span className={`${P}__trou${termine ? ` ${P}__trou--pose` : ''}`} data-mot={termine ? m.bonne : undefined}>…</span>
              {l.slice(at + 1)}
            </>
          );
        }
        return (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__ligne`}>
            {contenu}
            {i < lignes.length - 1 ? '\n' : null}
          </span>
        );
      })}
    </p>
  );
}

/** Après la réponse : selon la manche, l'essai monté, le lien, la question posée, l'appui. */
function Bilan({ m }) {
  let contenu;
  if (m.consigne === 'role') contenu = <Chaine bonne={m.bonne} />;
  else if (m.consigne === 'connecteur') {
    const lien = LIENS[String(m.bonne).toLowerCase()];
    contenu = <p className={`${P}__dit`}>{`« ${m.bonne} » exprime ${lien ?? 'le lien logique de la phrase'}.`}</p>;
  } else if (m.consigne === 'question') {
    contenu = (
      <Sphere>
        <p className={`${P}__question-posee`}>{libelleBon(m)}</p>
      </Sphere>
    );
  } else {
    contenu = (
      <p className={`${P}__appui`}>
        <span className={`${P}__coche`} aria-hidden="true">✔</span>
        {libelleBon(m)}
      </p>
    );
  }
  return <div className={`${P}__bilan`} role="status">{contenu}</div>;
}

export function QuestionEssai({ m, termine }) {
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      {!(termine && m.consigne === 'question') && <Sphere />}
      <div className={`${P}__dalle`}>
        <Dalle m={m} termine={termine} />
      </div>
      {termine && <Bilan m={m} />}
    </div>
  );
}
