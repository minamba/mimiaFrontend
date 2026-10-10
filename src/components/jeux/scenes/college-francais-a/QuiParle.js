import { Boutons, laBonne, trouverMot } from './commun';

/**
 * L'AMPHITHÉÂTRE DES VOIX — « Qui parle ? » (6e) et « Du direct à
 * l'indirect » (4e). La couverture : une jeune fille tient un coquillage à
 * l'oreille dans un théâtre de pierre, au bord de la mer ; deux immenses
 * conques renvoient les voix en ondes lumineuses.
 *   - LA QUESTION : l'extrait sur la scène de l'amphithéâtre, les conques qui
 *     vibrent de part et d'autre ;
 *   - LES RÉPONSES : des coquillages à écouter — on clique celui qui dit vrai ;
 *   - APRÈS LA RÉPONSE : les voix deviennent visibles. Les paroles se gonflent
 *     en bulles, celui qui parle s'allume, le verbe de parole fait onde ; en
 *     4e, la bulle du discours direct se déverse dans la phrase au discours
 *     indirect, qui s'écrit avec les mots qui ont changé.
 */

const P = 'sc-qui-parle';

/** Le texte, ses paroles en bulles (guillemets, tirets de dialogue), un mot allumé. */
function Voix({ texte, bulles, allume }) {
  const lignes = String(texte).split('\n');
  return lignes.map((ligne, n) => {
    const fin = n < lignes.length - 1 ? '\n' : '';
    const contenu = ligne.split(/(«[^»]*»)/).map((morceau, i) => {
      if (bulles && /^«[^»]*»$/.test(morceau)) {
        // eslint-disable-next-line react/no-array-index-key
        return <span key={i} className={`${P}__bulle`}>{morceau}</span>;
      }
      const coupe = allume ? trouverMot(morceau, allume) : null;
      if (!coupe) return morceau;
      return (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>
          {coupe[0]}
          <mark className={`${P}__allume`}>{coupe[1]}</mark>
          {coupe[2]}
        </span>
      );
    });
    const tiret = bulles && /^— /.test(ligne);
    return (
      // eslint-disable-next-line react/no-array-index-key
      <span key={n} className={tiret ? `${P}__replique` : undefined}>
        {contenu}
        {fin}
      </span>
    );
  });
}

/** Le passage au discours indirect : la bulle d'abord, puis la phrase qu'elle devient. */
function Transposition({ m }) {
  const [direct = '', second = ''] = String(m.question).split('\n');
  const bonne = laBonne(m);
  const bulle = /«[^»]*»/.exec(direct)?.[0] ?? direct;
  let avant = '';
  let apres = '';
  if (m.consigne === 'vers-indirect') {
    avant = `${second.replace(/…\s*$/, '')} `;
  } else {
    const i = second.indexOf('___');
    if (i < 0) return null;
    avant = second.slice(0, i);
    apres = second.slice(i + 3);
  }
  return (
    <div className={`${P}__transposition`}>
      <span className={`${P}__bulle ${P}__bulle--source`}>{bulle}</span>
      <span className={`${P}__deverse`} aria-hidden="true">⤵</span>
      <p className={`${P}__indirecte`}>
        {avant}
        <mark className={`${P}__change`}>{bonne}</mark>
        {apres}
      </p>
    </div>
  );
}

const DISCOURS = {
  direct: 'Les paroles sont rapportées telles quelles, entre guillemets ou après un tiret : discours direct.',
  indirect: 'Les paroles sont fondues dans la phrase, après « que », « si » ou « de » : discours indirect.',
  recit: 'Personne ne parle ici : c’est le récit, sans paroles rapportées.',
};

/** Les conques de l'amphithéâtre, qui renvoient les voix en ondes. */
function Conque({ cote }) {
  return (
    <svg className={`${P}__conque ${P}__conque--${cote}`} viewBox="0 0 70 70" aria-hidden="true" focusable="false">
      <path d="M8 60 Q4 20 40 8 Q62 4 64 30 Q50 26 40 34 Q30 44 34 62 Z" fill="#f4c7a1" stroke="#a0643a" strokeWidth="2" />
      <path d="M40 34 Q48 30 56 34 M38 44 Q46 40 52 44 M36 54 Q42 50 48 54" stroke="#c98a5a" strokeWidth="2" fill="none" />
      <path className={`${P}__onde`} d="M60 14 q8 8 0 16" />
      <path className={`${P}__onde`} style={{ '--n': 1 }} d="M64 8 q14 14 0 28" />
    </svg>
  );
}

export function QuestionQuiParle({ m, termine }) {
  const sorte = String(m.consigne ?? '');
  const quatrieme = /indirect$/.test(sorte);
  let allume = null;
  if (termine && sorte === 'verbe-de-parole') allume = m.bonne;
  if (termine && sorte === 'qui-dit') allume = laBonne(m);
  if (termine && sorte === 'quel-discours' && m.bonne === 'indirect') {
    allume = /(?:^|\s)(que(?=\s)|si(?=\s)|de(?=\s)|qu’|d’)/u.exec(String(m.question))?.[1] ?? null;
  }
  const bulles = termine && (sorte !== 'quel-discours' || m.bonne === 'direct');
  return (
    <div className={`${P}${termine ? ' est-audible' : ''}`}>
      <Conque cote="gauche" />
      <div className={`${P}__scene`}>
        <p className={`${P}__phrase`}><Voix texte={m.question} bulles={bulles} allume={allume} /></p>
      </div>
      <Conque cote="droite" />
      {termine && (
        <div className={`${P}__echo`} role="status">
          {quatrieme && <Transposition m={m} />}
          {sorte === 'quel-discours' && <p className={`${P}__legende`}>{DISCOURS[m.bonne]}</p>}
          {sorte === 'qui-dit' && <p className={`${P}__legende`}>{`C’est ${laBonne(m).replace(/^L(e|a|es|’)\b ?/, (x) => x.toLowerCase())} qui parle.`}</p>}
          {sorte === 'verbe-de-parole' && <p className={`${P}__legende`}>{`« ${laBonne(m)} » introduit les paroles : c’est le verbe de parole.`}</p>}
        </div>
      )}
    </div>
  );
}

/** Les coquillages : on écoute celui qui dit vrai. */
export function CoquillagesQuiParle({ choix, fautes, choisir }) {
  return (
    <Boutons
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      prefixe={P}
      etiquette="Écoute le bon coquillage"
      rendu={(c) => (
        <>
          <span className={`${P}__coquille`} aria-hidden="true" />
          <span className={`${P}__ondes`} aria-hidden="true" />
          <span className={`${P}__texte`}>{c.libelle}</span>
        </>
      )}
    />
  );
}
