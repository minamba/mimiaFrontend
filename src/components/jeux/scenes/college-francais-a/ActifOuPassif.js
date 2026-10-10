import { Boutons, laBonne, trouverMot } from './commun';
import { AGENTS } from '../../../../lib/jeux/college/actif-ou-passif';

/**
 * L'ÉCLUSE DU MOULIN — « Actif ou passif ? » (5e). La couverture : une jeune
 * meunière actionne le levier de laiton d'une écluse, la roue du moulin
 * tourne, l'eau dévale. L'action est un COURANT : qui la fait, qui la reçoit ?
 *   - LA QUESTION : la phrase sur la planche de l'écluse ; dessous, le canal,
 *     la roue qui tourne ;
 *   - LES RÉPONSES : pour « active ou passive ? », LE LEVIER de l'écluse, à
 *     basculer d'un côté ou de l'autre ; pour les autres manches, des vannes
 *     de bois et leur volant de laiton ;
 *   - APRÈS LA RÉPONSE : l'eau coule dans le sens de l'action — du sujet vers
 *     le complément à la voix active ; du complément d'agent vers le sujet à la
 *     voix passive. Dans la phrase, « être + participe » et le complément
 *     d'agent s'allument ; le piège du passé composé avec être est démonté.
 */

const P = 'sc-actif-ou-passif';

// Chaque motif commence par ce qui précède (début ou espace) : le morceau allumé vient après.
const VERBE_PASSIF = /(^|\s)(?:(?:a|ont|avait|avaient|aura|auront) été|est|sont|sommes|êtes|suis|était|étaient|fut|furent|sera|seront)\s+[\p{L}’-]+/u;
const AGENT = /(^|\s)(?:par|de) [^.,!?]+?(?=[.,!?]|\s+(?:en|à|devant|demain|chaque|pendant|au|dans)\s|$)/u;

/** Une phrase avec ses morceaux allumés : [{ t, role }]. */
function Morceaux({ morceaux }) {
  return morceaux.map((x, i) => (x.role
    // eslint-disable-next-line react/no-array-index-key
    ? <mark key={i} className={`${P}__role ${P}__role--${x.role}`} data-nom={x.nom}>{x.t}</mark>
    // eslint-disable-next-line react/no-array-index-key
    : <span key={i}>{x.t}</span>));
}

/** Découpe une phrase autour de plusieurs motifs trouvés (le premier de chacun). */
function allumer(phrase, reperes) {
  const trouves = reperes
    .map(({ motif, mot, role, nom }) => {
      if (mot) {
        const c = trouverMot(phrase, mot);
        return c ? { debut: c[0].length, fin: c[0].length + c[1].length, role, nom } : null;
      }
      const r = motif.exec(phrase);
      return r ? {
        debut: r.index + r[1].length, fin: r.index + r[0].length, role, nom,
      } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.debut - b.debut)
    .filter((x, i, l) => i === 0 || x.debut >= l[i - 1].fin);
  const morceaux = [];
  let k = 0;
  trouves.forEach((x) => {
    if (x.debut > k) morceaux.push({ t: phrase.slice(k, x.debut) });
    morceaux.push({ t: phrase.slice(x.debut, x.fin), role: x.role, nom: x.nom });
    k = x.fin;
  });
  if (k < phrase.length) morceaux.push({ t: phrase.slice(k) });
  return morceaux;
}

function Courant({ m }) {
  const sorte = String(m.consigne ?? '');
  const q = String(m.question);
  if (sorte === 'voix') {
    if (m.bonne === 'passive') {
      return (
        <>
          <p className={`${P}__phrase-allumee`}>
            <Morceaux morceaux={allumer(q, [
              { motif: VERBE_PASSIF, role: 'verbe', nom: 'être + participe' },
              { motif: AGENT, role: 'agent', nom: 'complément d’agent' },
            ])}
            />
          </p>
          <p className={`${P}__legende`}>Le sujet subit l’action : voix passive.</p>
        </>
      );
    }
    const etre = VERBE_PASSIF.test(q);
    return (
      <>
        {etre && (
          <p className={`${P}__phrase-allumee`}>
            <Morceaux morceaux={allumer(q, [{ motif: VERBE_PASSIF, role: 'piege', nom: 'passé composé' }])} />
          </p>
        )}
        <p className={`${P}__legende`}>
          {etre
            ? '« Être » + participe, mais personne ne subit rien : c’est un passé composé, à la voix active.'
            : 'Le sujet fait l’action : voix active.'}
        </p>
      </>
    );
  }
  if (sorte === 'transformer') {
    return (
      <div className={`${P}__ecluse`}>
        <p className={`${P}__avant`}>{q}</p>
        <span className={`${P}__sas`} aria-hidden="true">⇩</span>
        <p className={`${P}__phrase-allumee`}>
          <Morceaux morceaux={allumer(laBonne(m), [
            { motif: VERBE_PASSIF, role: 'verbe', nom: 'même temps, porté par être' },
            { motif: AGENT, role: 'agent', nom: 'ancien sujet' },
          ])}
          />
        </p>
      </div>
    );
  }
  if (sorte === 'agent') {
    const ligne = AGENTS.find(([phrase]) => phrase === q);
    return (
      <>
        <p className={`${P}__phrase-allumee`}>
          <Morceaux morceaux={allumer(q, [
            { mot: m.bonne, role: 'agent', nom: 'complément d’agent' },
            ...(ligne ? [{ mot: ligne[2], role: 'sujet', nom: 'sujet' }, { mot: ligne[3], role: 'cc', nom: 'circonstance' }] : []),
          ])}
          />
        </p>
        <p className={`${P}__legende`}>Le complément d’agent fait l’action ; le sujet la subit.</p>
      </>
    );
  }
  return <p className={`${P}__legende`}>{laBonne(m)}</p>;
}

/** Le moulin : la roue qui tourne et le canal. */
function Moulin() {
  return (
    <svg className={`${P}__moulin`} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <g className={`${P}__roue`}>
        <circle cx="40" cy="40" r="32" fill="none" stroke="#6b3f1d" strokeWidth="6" />
        {[0, 45, 90, 135].map((a) => (
          <line key={a} x1="40" y1="6" x2="40" y2="74" stroke="#8a5a2b" strokeWidth="4" transform={`rotate(${a} 40 40)`} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x="36" y="2" width="8" height="10" fill="#a0643a" transform={`rotate(${i * 30} 40 40)`} />
        ))}
        <circle cx="40" cy="40" r="7" fill="#c99a2e" />
      </g>
    </svg>
  );
}

export function QuestionActifPassif({ m, termine }) {
  // L'eau suit l'action : du sujet vers la droite à la voix active ; de l'agent vers le sujet, sinon.
  let sens = '';
  if (termine) sens = m.consigne === 'voix' && m.bonne === 'active' ? ' coule-droite' : ' coule-gauche';
  return (
    <div className={`${P}${sens}`}>
      <div className={`${P}__bief`}>
        <Moulin />
        <div className={`${P}__planche`}>
          <p className={`${P}__phrase`}>{m.question}</p>
        </div>
      </div>
      <div className={`${P}__canal`} aria-hidden="true">
        <span className={`${P}__fleches`} />
      </div>
      {termine && (
        <div className={`${P}__debit`} role="status">
          <Courant m={m} />
        </div>
      )}
    </div>
  );
}

/** Les réponses : le levier de l'écluse (active ou passive), ou des vannes de bois. */
export function VannesActifPassif({
  m, choix, fautes, choisir,
}) {
  const levier = m?.consigne === 'voix';
  return (
    <div className={`${P}__commandes${levier ? ` ${P}__commandes--levier` : ''}`}>
      {levier && <span className={`${P}__bras`} aria-hidden="true" />}
      <Boutons
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        classe={levier ? `${P}__choix--levier` : `${P}__choix--vannes`}
        etiquette={levier ? 'Bascule le levier' : 'Ouvre la bonne vanne'}
        rendu={(c) => (
          <>
            <span className={`${P}__volant`} aria-hidden="true" />
            <span className={`${P}__inscription`}>{c.libelle}</span>
          </>
        )}
      />
    </div>
  );
}
