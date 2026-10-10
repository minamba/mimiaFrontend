import { decouper, laBonne } from './commun';
import { APRES_4E, AVANT_4E, PENDANT_4E } from '../../../../lib/jeux/college/roue-des-verbes-college';

/**
 * LE MOULIN DE LA ROUE DES VERBES — « La roue des verbes » (6e → 3e). La
 * couverture : un vieux moulin au coucher du soleil, sa grande roue à aubes
 * sous une cascade. La scène en fait le jeu lui-même :
 *   - LA QUESTION : l'écriteau de bois cloué au moulin ; l'infinitif entre
 *     parenthèses y est gravé à part, le temps demandé aussi ;
 *   - LES RÉPONSES : accrochées aux godets de LA ROUE, qui tourne lentement
 *     sous la cascade (une minute par tour, elle s'arrête quand on la survole) ;
 *     chaque réponse reste droite et se clique à tout moment ;
 *   - APRÈS LA RÉPONSE : la roue s'arrête, la bonne forme en haut, dans le
 *     godet plein ; la phrase se remplit. Et selon la classe : le temps composé
 *     se démonte (auxiliaire + participe), la terminaison s'allume, ou, en 4e,
 *     la frise du récit place l'action AVANT, PENDANT ou APRÈS.
 */

const P = 'sc-roue-des-verbes-college';

/** Le temps de l'auxiliaire, pour chaque temps composé. */
const AUXILIAIRE = {
  'passe-compose': 'au présent',
  'plus-que-parfait': 'à l’imparfait',
  'passe-anterieur': 'au passé simple',
  'futur-anterieur': 'au futur',
};
const PRONOMS = /^(je|j’|tu|il|elle|on|nous|vous|ils|elles)$/i;

/** L'écriteau : la question telle quelle, l'infinitif et le temps demandé gravés à part. */
function Ecriteau({ texte }) {
  return decouper(texte).map((p, i) => {
    if (p.designe) {
      // eslint-disable-next-line react/no-array-index-key
      return <strong key={i} className={`college__designe ${P}__verbe`}>{p.texte}</strong>;
    }
    return (
      // eslint-disable-next-line react/no-array-index-key
      <span key={i}>
        {p.texte.split(/(\([^)]+\)|…| — .+$)/).map((t, j) => {
          // eslint-disable-next-line react/no-array-index-key
          if (/^\([^)]+\)$/.test(t)) return <span key={j} className={`${P}__infinitif`}>{t}</span>;
          // eslint-disable-next-line react/no-array-index-key
          if (t === '…') return <span key={j} className={`${P}__trou`}>{t}</span>;
          // eslint-disable-next-line react/no-array-index-key
          if (/^ — /.test(t)) return <span key={j} className={`${P}__temps`}>{t}</span>;
          return t;
        })}
      </span>
    );
  });
}

/** Une roue à aubes en SVG : la jante, les rayons, les godets. */
function DessinRoue({ godets = 12 }) {
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="92" fill="none" stroke="#5a3418" strokeWidth="9" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#7a4a24" strokeWidth="4" />
      {Array.from({ length: godets }, (_, i) => (
        <g key={i} transform={`rotate(${(i * 360) / godets} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="14" stroke="#6b3f1d" strokeWidth="5" />
          <rect x="91" y="2" width="18" height="16" rx="2" fill="#8a5a2b" stroke="#4d2c0c" strokeWidth="1.5" />
        </g>
      ))}
      <circle cx="100" cy="100" r="16" fill="#4d2c0c" stroke="#c9a15b" strokeWidth="3" />
      <circle cx="100" cy="100" r="5" fill="#c9a15b" />
    </svg>
  );
}

const remplirPhrase = (question, forme) => (/…\s*\([^)]*\)/.test(question)
  ? question.replace(/…\s*\([^)]*\)/, forme)
  : null);

/** En 4e : la frise du récit — l'action est-elle avant, pendant ou après le moment raconté ? */
function Frise({ question }) {
  let place = null;
  if (AVANT_4E.some(([q]) => q === question)) place = { cle: 'avant', nom: 'Avant : plus-que-parfait' };
  else if (PENDANT_4E.some(([q]) => q === question)) place = { cle: 'pendant', nom: 'Pendant : imparfait' };
  else if (APRES_4E.some(([q]) => q === question)) place = { cle: 'apres', nom: 'Après : conditionnel' };
  if (!place) return null;
  return (
    <div className={`${P}__frise ${P}__frise--${place.cle}`}>
      <span className={`${P}__axe`} aria-hidden="true" />
      <span className={`${P}__repere`}>moment du récit (passé simple)</span>
      <span className={`${P}__action`}>{place.nom}</span>
    </div>
  );
}

/** Le temps demandé, lu après le tiret (« — passé simple »). */
const TEMPS_DEMANDE = {
  présent: 'present',
  imparfait: 'imparfait',
  'passé simple': 'passe-simple',
  'futur simple': 'futur',
  'passé composé': 'passe-compose',
  'plus-que-parfait': 'plus-que-parfait',
  'passé antérieur': 'passe-anterieur',
  'futur antérieur': 'futur-anterieur',
};

/**
 * La forme démontée : auxiliaire + participe, la terminaison qui signe le
 * temps, ou « sans auxiliaire ». `temps` est une clé de temps ou de forme.
 */
function Demontage({ forme: brute, temps }) {
  const forme = String(brute).replace(/[«»]/g, '').trim();
  let mots = forme.split(/\s+/);
  // « j’avais vu » : le pronom élidé se détache de l'auxiliaire.
  if (/^j’./i.test(mots[0])) mots = [mots[0].slice(0, 2), mots[0].slice(2), ...mots.slice(1)];
  if (AUXILIAIRE[temps] && mots.length >= 3 && PRONOMS.test(mots[0])) {
    return (
      <p className={`${P}__demontage`}>
        <span>{mots[0]}</span>
        <span className={`${P}__aux`} data-role={`auxiliaire ${AUXILIAIRE[temps]}`}>{mots[1]}</span>
        <span className={`${P}__participe`} data-role="participe passé">{mots.slice(2).join(' ')}</span>
      </p>
    );
  }
  const fin = {
    conditionnel: /(r(?:ais|ait|ions|iez|aient))$/,
    futur: /(r(?:ai|as|a|ons|ez|ont))$/,
  }[temps];
  const r = fin?.exec(forme);
  if (r) {
    return (
      <p className={`${P}__demontage`}>
        <span>{forme.slice(0, r.index)}</span>
        <span className={`${P}__fin`} data-role="terminaison">{r[1]}</span>
      </p>
    );
  }
  const que = /^(que |qu’)(.+)$/.exec(forme);
  if (temps === 'subjonctif' && que) {
    return (
      <p className={`${P}__demontage`}>
        <span className={`${P}__fin`} data-role="annonce le subjonctif">{que[1].trim()}</span>
        <span>{que[2]}</span>
      </p>
    );
  }
  if (['present', 'imparfait', 'passe-simple'].includes(temps)) {
    return (
      <p className={`${P}__demontage`}>
        <span className={`${P}__participe`} data-role="sans auxiliaire : un temps simple">{forme}</span>
      </p>
    );
  }
  return null;
}

export function QuestionRoue({ m, termine }) {
  const bonne = laBonne(m);
  const sorte = String(m.consigne ?? '');
  // En 6e, la réponse porte déjà son sujet (« nous vînmes ») : on ne la glisse pas après « Nous ».
  const remplie = termine && !/-6e$/.test(sorte) ? remplirPhrase(String(m.question), bonne) : null;
  return (
    <div className={`${P}${termine ? ' est-arretee' : ''}`}>
      <div className={`${P}__ecriteau`}>
        <span className={`${P}__clou`} aria-hidden="true" />
        <span className={`${P}__clou`} aria-hidden="true" />
        <p className={`${P}__phrase`}><Ecriteau texte={m.question} /></p>
      </div>
      {termine && (
        <div className={`${P}__arrivee`} role="status">
          <div className={`${P}__petite-roue`} aria-hidden="true">
            <DessinRoue godets={8} />
            <span className={`${P}__cascade`} />
          </div>
          <div className={`${P}__explication`}>
            <p className={`${P}__godet-plein`}>{bonne}</p>
            {remplie && <p className={`${P}__remplie`}>{remplie}</p>}
            {/quel-temps|reconnaitre/.test(sorte) && <Demontage forme={m.question} temps={m.bonne} />}
            {/-6e$/.test(sorte) && !/quel-temps/.test(sorte) && <Demontage forme={bonne} temps={TEMPS_DEMANDE[(/ — (.+)$/.exec(String(m.question)) ?? [])[1]]} />}
            {sorte === 'concordance-4e' && <Frise question={String(m.question)} />}
          </div>
        </div>
      )}
    </div>
  );
}

/** LA ROUE : les réponses sur ses godets, la cascade qui la fait tourner. */
export function RoueDesReponses({ choix, fautes, choisir }) {
  const n = Math.max(choix.length, 1);
  return (
    <div className={`${P}__bief`}>
      <span className={`${P}__chute`} aria-hidden="true" />
      <div className={`${P}__roue`}>
        <DessinRoue />
        <ul className={`${P}__choix`} aria-label="Choisis ta réponse sur la roue">
          {choix.map((c, i) => {
            const faux = fautes.includes(c.cle);
            return (
              <li key={c.cle} className={`${P}__godet`} style={{ '--a': `${(i * 360) / n}deg` }}>
                <button
                  type="button"
                  className={`${P}__bouton${faux ? ' est-fausse' : ''}`}
                  onClick={() => choisir(c.cle)}
                  disabled={faux}
                >
                  {c.libelle}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <span className={`${P}__ecume`} aria-hidden="true" />
    </div>
  );
}
