import { Boutons, autourDuTrou, majuscule } from './commun';

/**
 * LE VILLAGE DES MAISONS JUMELLES — « Les homophones » (6e). La couverture :
 * un village au bord d'un lac, deux maisons jaunes identiques, chacune sa
 * cloche. Des homophones, justement : des mots qui SONNENT pareil et n'habitent
 * pas la même maison.
 *   - LA QUESTION : la phrase sur le panneau du village ; à la place du trou,
 *     une cloche qui sonne — on entend le son, on ne voit pas l'orthographe ;
 *   - LES RÉPONSES : les maisons jumelles, une par orthographe, le mot écrit
 *     sur la porte ; leurs cloches se balancent ;
 *   - APRÈS LA RÉPONSE : le mot entre dans la phrase, et LE TEST DU
 *     REMPLACEMENT se joue sous nos yeux : « Mon frère avait perdu ses clés »
 *     — ça marche, c'est « a ». Pour « à », on essaie aussi : « Nous allons
 *     avait la piscine » — ça ne marche pas. Sinon, l'indice qui tranche.
 */

const P = 'sc-homophones-college';

/** Le test de chaque mot : un remplaçant qui marche (`par`), qui échoue (`non`), ou un indice. */
const TESTS = {
  a: { par: 'avait' },
  à: { non: 'avait' },
  et: { par: 'et puis' },
  est: { par: 'était' },
  son: { par: 'mon' },
  sont: { par: 'étaient' },
  on: { par: 'il' },
  ont: { par: 'avaient' },
  ce: { indice: 'Devant un nom, qu’il montre : au pluriel, on dirait « ces ».' },
  se: { indice: 'Devant un verbe : avec « je », on dirait « me » (je me lave, il se lave).' },
  ces: { indice: 'Il montre : on peut ajouter « -là » après le nom.' },
  ses: { indice: 'Ce sont les siens, à lui ou à elle : au singulier, « son » ou « sa ».' },
  'c’est': { par: 'c’était' },
  's’est': { indice: 'Avec « je », on dirait « je me suis » : s, apostrophe, est.' },
  la: { indice: 'Ni « là-bas », ni « l’avait » : c’est « la », sans accent.' },
  là: { par: 'là-bas' },
  'l’a': { par: 'l’avait' },
  leur: { par: 'lui' },
  leurs: { indice: 'Le nom qui suit est au pluriel : plusieurs choses à eux, « leurs » prend un s.' },
  ou: { par: 'ou bien' },
  où: { indice: 'Il indique un lieu ou un moment : « où », avec un accent.' },
  quand: { par: 'lorsque' },
  quant: { indice: '« Quant à » veut dire « en ce qui concerne ».' },
  'qu’en': { indice: 'Deux petits mots : « que » et « en ».' },
  peu: { indice: 'On peut dire « pas beaucoup » : c’est « peu ».' },
  peut: { par: 'pouvait' },
};

/** La phrase avec un mot à la place du trou : majuscule au début, « lorsque » s'élide devant une voyelle. */
export function substituer(question, mot) {
  const coupe = autourDuTrou(question);
  if (!coupe) return null;
  let [avant, apres] = coupe;
  let m = mot;
  if (/que$/.test(m) && /^\s*[aeiouyhéèêàâîôû]/i.test(apres)) {
    m = `${m.slice(0, -1)}’`;
    apres = apres.trimStart();
  }
  if (!avant.trim()) m = majuscule(m);
  return { avant, mot: m, apres };
}

/** Le test du remplacement, joué sur la phrase. */
function Test({ m }) {
  const bonne = String(m.bonne ?? '');
  const cle = bonne.toLowerCase();
  // « Les deux frères partagent leur chambre » : leur déterminant, une seule chose à eux.
  const test = m.aide === 'regle-leur-un'
    ? { indice: 'Une seule chose à eux, et le nom est au singulier : « leur », sans s.' }
    : TESTS[cle];
  if (!test) return null;
  if (test.indice) return <p className={`${P}__indice`}>{test.indice}</p>;
  const essai = substituer(m.question, test.par ?? test.non);
  if (!essai) return null;
  const marche = Boolean(test.par);
  return (
    <div className={`${P}__test${marche ? ' est-juste' : ' est-faux'}`}>
      <p className={`${P}__essai`}>
        <span className={`${P}__etiquette`}>{`Je remplace par « ${test.par ?? test.non} »`}</span>
        <span className={`${P}__phrase-test`}>
          {essai.avant}
          <span className={`${P}__remplacant`}>{essai.mot}</span>
          {essai.apres}
        </span>
      </p>
      <p className={`${P}__conclusion`}>
        {marche ? `Ça marche : c’est « ${bonne} ».` : `Ça ne marche pas : c’est « ${bonne} ».`}
      </p>
    </div>
  );
}

/** Le village : deux maisons jumelles, leurs clochers, le lac derrière. */
function Village() {
  const maison = (x) => (
    <g transform={`translate(${x} 0)`}>
      <rect x="6" y="40" width="58" height="46" fill="#f6d77a" stroke="#c9a33f" strokeWidth="1.5" />
      <path d="M0 42 L35 18 L70 42 Z" fill="#3b5bdb" stroke="#243b8f" strokeWidth="1.5" />
      <rect x="25" y="4" width="20" height="22" fill="#f6d77a" stroke="#c9a33f" strokeWidth="1.5" />
      <path d="M21 6 L35 -6 L49 6 Z" fill="#3b5bdb" />
      <g className={`${P}__cloche`}>
        <path d="M30 12 Q35 6 40 12 L41 20 H29 Z" fill="#c99a2e" />
        <circle cx="35" cy="21" r="1.8" fill="#7a5a12" />
      </g>
      <path d="M28 86 V64 Q35 56 42 64 V86 Z" fill="#3b5bdb" stroke="#243b8f" strokeWidth="1.5" />
      <circle cx="35" cy="52" r="5" fill="#a5d8ff" stroke="#c9a33f" />
    </g>
  );
  return (
    <svg className={`${P}__village`} viewBox="0 -10 300 100" aria-hidden="true" focusable="false">
      <path d="M0 70 L50 40 L90 62 L140 30 L190 60 L240 36 L300 66 V90 H0 Z" fill="#91a7ff" opacity="0.55" />
      <rect x="0" y="72" width="300" height="18" fill="#74c0fc" opacity="0.7" />
      {maison(20)}
      {maison(210)}
      <path className={`${P}__son`} d="M120 30 q8 -6 16 0 M116 40 q12 -10 24 0 M112 50 q16 -14 32 0" />
      <path className={`${P}__son`} d="M160 30 q8 -6 16 0 M156 40 q12 -10 24 0 M152 50 q16 -14 32 0" style={{ '--n': 1 }} />
      <text x="148" y="76" textAnchor="middle" className={`${P}__egal`}>=</text>
    </svg>
  );
}

export function QuestionHomophones({ m, termine }) {
  const coupe = autourDuTrou(m.question);
  const rempli = termine ? substituer(m.question, m.bonne) : null;
  return (
    <div className={`${P}${termine ? ' est-sonne' : ''}`}>
      <Village />
      <div className={`${P}__panneau`}>
        <p className={`${P}__phrase`}>
          {coupe ? (
            <>
              {coupe[0]}
              <span className={`${P}__trou`}>___</span>
              {coupe[1]}
            </>
          ) : m.question}
        </p>
      </div>
      {termine && (
        <div className={`${P}__resultat`} role="status">
          {rempli && (
            <p className={`${P}__remplie`}>
              {rempli.avant}
              <span className={`${P}__porte`}>{rempli.mot}</span>
              {rempli.apres}
            </p>
          )}
          <Test m={m} />
        </div>
      )}
    </div>
  );
}

/** Les maisons jumelles : une par orthographe, le mot sur la porte. */
export function MaisonsHomophones({ choix, fautes, choisir }) {
  return (
    <Boutons
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      prefixe={P}
      etiquette="Choisis la maison du bon mot"
      rendu={(c) => (
        <>
          <span className={`${P}__toit`} aria-hidden="true" />
          <span className={`${P}__clocher`} aria-hidden="true" />
          <span className={`${P}__mot`}>{c.libelle}</span>
        </>
      )}
    />
  );
}
