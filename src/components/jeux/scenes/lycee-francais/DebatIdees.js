import { SOPHISMES } from '../../../../lib/jeux/lycee/debat-idees';
import { BoutonsChoix, libelleBon, surligner } from './commun';

/**
 * LA BALANCE DE L'AGORA — « Le débat d'idées » (terminale professionnelle).
 * La couverture : une agora de marbre au couchant, des bannières rouges et
 * bleues, et au centre une grande balance de métal. Débattre, c'est PESER
 * des raisons ; la scène le montre :
 *   - LA QUESTION : le sujet ou la phrase du camarade sur une bannière, au-
 *     dessus de la grande balance qui oscille, en attente ;
 *   - LES RÉPONSES : des cartes de parole (`choix`), comme on en tient à
 *     l'oral ; on pose la sienne sur la balance. Une carte écartée fait
 *     trembler la balance — elle ne pèse rien —, sans rien montrer de la
 *     bonne ;
 *   - APRÈS LA RÉPONSE : la bonne carte se pose sur un plateau, devenue une
 *     tablette de pierre, et la balance PENCHE : une idée + une raison, ça
 *     pèse. Dans un avis, la raison s'allume en or à côté de l'avis ; un
 *     argument fallacieux reçoit le tampon rouge de son procédé : la balance
 *     est truquée.
 */

const P = 'sc-debat-idees';

/** Ce qui fait le poids de la bonne réponse, selon la manche. */
const POIDS = {
  position: 'Une position claire, et la raison qui la soutient.',
  refuter: 'On reconnaît l’idée de l’autre, puis on lui répond par un argument, poliment.',
  nuancer: 'La position reste la même, mais elle se précise : à condition de, sauf si…',
};

/** Ce que fait chaque argument fallacieux. */
const TRUCAGES = {
  attaque: 'On s’en prend à la personne, pas à son idée.',
  generalisation: 'Un ou deux cas, et l’on conclut pour tous.',
  popularite: 'Beaucoup de gens le pensent : cela ne prouve rien.',
  autorite: 'Une célébrité parle d’un sujet qu’elle ne connaît pas.',
  dilemme: 'On fait croire qu’il n’y a que deux choix possibles.',
  pente: 'Une petite cause mènerait, de proche en proche, à une catastrophe.',
};

/** La grande balance : elle oscille, tremble à une faute, penche une fois la réponse posée. */
function Balance({ penche, tremble, truquee }) {
  return (
    <svg
      key={tremble ?? 'calme'}
      className={`${P}__balance${penche ? ` ${P}__balance--penche` : ''}${tremble ? ` ${P}__balance--tremble` : ''}${truquee ? ` ${P}__balance--truquee` : ''}`}
      viewBox="0 0 200 120"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M100 18 V108 M74 112 H126" stroke="#c9a23a" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="16" r="7" fill="#f0d28a" stroke="#8a6420" strokeWidth="2" />
      <g className={`${P}__fleau`}>
        <path d="M24 22 H176" stroke="#d9b35a" strokeWidth="5" strokeLinecap="round" />
        <g className={`${P}__plateau ${P}__plateau--gauche`}>
          <path d="M26 22 L12 60 M26 22 L40 60" stroke="#8a6420" strokeWidth="1.5" />
          <path d="M6 60 H46 Q26 74 6 60 Z" fill="#f0d28a" stroke="#8a6420" strokeWidth="2" />
          {penche && <rect className={`${P}__pierre`} x="13" y="46" width="26" height="14" rx="3" fill="#e8e2d6" stroke="#8d8070" strokeWidth="2" />}
        </g>
        <g className={`${P}__plateau ${P}__plateau--droite`}>
          <path d="M174 22 L160 60 M174 22 L188 60" stroke="#8a6420" strokeWidth="1.5" />
          <path d="M154 60 H194 Q174 74 154 60 Z" fill="#f0d28a" stroke="#8a6420" strokeWidth="2" />
          {penche && truquee && <path className={`${P}__plume`} d="M166 56 Q174 36 184 52" fill="none" stroke="#fff" strokeWidth="3" />}
        </g>
      </g>
    </svg>
  );
}

/** « Avis : raison » → l'avis en bleu, la raison en or. */
function decouperAvis(m) {
  const phrase = /^« (.+) »$/.exec(m.question)?.[1];
  if (!phrase) return null;
  const r = /^(.+?)(\s*(?::|, car|, parce que|, donc)\s*)(.+)$/.exec(phrase);
  return r ? { avis: r[1], raison: r[3] } : { avis: phrase, raison: null };
}

/** Après la réponse : la tablette posée sur le plateau, et ce qui la rend lourde. */
function Pesee({ m }) {
  if (m.consigne === 'fallacieux') {
    return (
      <div className={`${P}__pesee`} role="status">
        <span className={`${P}__tampon`}>{SOPHISMES[m.bonne]}</span>
        <span className={`${P}__dit`}>{`Balance truquée : ${TRUCAGES[m.bonne] ?? ''}`}</span>
      </div>
    );
  }
  if (m.consigne === 'argument-ou-opinion') {
    const d = decouperAvis(m);
    const argument = m.bonne === 'argument';
    return (
      <div className={`${P}__pesee`} role="status">
        <strong className={`${P}__verdict`}>{libelleBon(m)}</strong>
        <span className={`${P}__dit`}>
          {argument && d?.raison ? 'Un avis, et la raison qui le justifie : il pèse.' : 'Un avis affirmé, sans raison : il ne pèse rien.'}
        </span>
      </div>
    );
  }
  return (
    <div className={`${P}__pesee`} role="status">
      <p className={`${P}__tablette`}>{libelleBon(m)}</p>
      <span className={`${P}__dit`}>{POIDS[m.consigne] ?? ''}</span>
    </div>
  );
}

const marque = (role) => `${P}__allume ${P}__allume--${role}`;

export function QuestionDebat({ m, termine, extra = {} }) {
  const d = termine && m.consigne === 'argument-ou-opinion' && m.bonne === 'argument' ? decouperAvis(m) : null;
  const morceaux = d?.raison ? [[d.avis, 'avis'], [d.raison, 'raison']] : [];
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__banniere`}>
        <p className={`${P}__texte`}>{morceaux.length ? surligner(m.question, morceaux, marque) : m.question}</p>
      </div>
      <Balance
        penche={termine && m.consigne !== 'argument-ou-opinion' ? true : termine && m.bonne === 'argument'}
        tremble={!termine ? extra.derniereFaute ?? null : null}
        truquee={termine && m.consigne === 'fallacieux'}
      />
      {termine && <Pesee m={m} />}
    </div>
  );
}

/** Les cartes de parole : on pose la sienne sur la balance. */
export function ChoixDebat({ choix, fautes, choisir }) {
  return (
    <BoutonsChoix
      p={P}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      etiquette="Pose ta carte sur la balance"
      deco={() => <span className={`${P}__coin`} aria-hidden="true" />}
    />
  );
}
