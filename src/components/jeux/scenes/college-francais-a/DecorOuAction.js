import { Boutons, decouper } from './commun';

/**
 * LA RUELLE SOUS LA PLUIE — « Décor ou action ? » (6e). La couverture : une
 * ruelle de lanternes sous l'orage, des feuilles d'érable rouges, et au
 * premier plan un parapluie rouge emporté par le vent. C'est exactement la
 * leçon : DERRIÈRE, le décor qui dure (la pluie, les maisons, les lanternes :
 * l'imparfait) ; DEVANT, ce qui surgit (le parapluie qui s'envole : le passé
 * simple).
 *   - LA QUESTION : la ruelle en deux plans, la phrase sur une dalle mouillée ;
 *   - LES RÉPONSES : des lanternes de papier qui se balancent ; pour « quelle
 *     valeur ? », trois calques du décor (la ruelle, l'horloge des habitudes,
 *     le coup de vent) ;
 *   - APRÈS LA RÉPONSE : la phrase se remplit, chaque verbe va dans SON plan —
 *     brume bleue derrière, rouge vif devant — et la ruelle joue le plan de la
 *     réponse (la pluie redouble, l'horloge tourne, le parapluie s'envole).
 */

const P = 'sc-decor-ou-action';

/** Le plan de chaque réponse, pour la ruelle et pour la couleur du verbe. */
const PLAN = {
  imparfait: 'decor',
  'passe-simple': 'action',
  description: 'decor',
  habitude: 'habitude',
  'premier-plan': 'action',
};

const LEGENDES = {
  'imparfait-description': 'Le décor, ce qui dure : imparfait.',
  'imparfait-habitude': 'Une habitude, qui se répète : imparfait.',
  'passe-simple-soudain': 'Une action brève qui surgit : passé simple.',
  'passe-simple-succession': 'Des actions qui s’enchaînent : passé simple.',
  'premier-plan': 'Une action précise, qui fait avancer l’histoire : passé simple.',
  'deux-plans-inverses': 'Ce qui dure, à l’imparfait ; ce qui surgit, au passé simple.',
};

const NOM_PLAN = { decor: 'arrière-plan', habitude: 'habitude', action: 'premier plan' };

/** Les mots qui annoncent un plan : on les allume dans la phrase remplie. */
const INDICES = /(Soudain|soudain|Tout à coup|tout à coup|À cet instant|à cet instant|brusquement|enfin|Chaque [a-zé]+|chaque [a-zé]+|Tous les [a-z]+|tous les [a-z]+|Autrefois|autrefois|Le dimanche|Le soir|Ce matin-là|quand soudain|lorsqu’|quand)/;

/** La ruelle en deux plans : derrière, les maisons et la pluie ; devant, les feuilles et le parapluie. */
function Ruelle() {
  return (
    <div className={`${P}__ruelle`} aria-hidden="true">
      <svg className={`${P}__fond`} viewBox="0 0 320 110" preserveAspectRatio="none" focusable="false">
        <g fill="#1d2b4f">
          <path d="M0 110 V48 L20 34 L44 48 V110 Z" />
          <path d="M40 110 V58 L66 40 L92 58 V110 Z" />
          <path d="M228 110 V54 L256 36 L284 54 V110 Z" />
          <path d="M276 110 V44 L298 30 L320 44 V110 Z" />
        </g>
        <g className={`${P}__fenetres`} fill="#ffc46b">
          <rect x="14" y="62" width="10" height="12" rx="1" />
          <rect x="58" y="70" width="12" height="12" rx="1" />
          <rect x="244" y="66" width="12" height="12" rx="1" />
          <rect x="292" y="58" width="10" height="12" rx="1" />
        </g>
        <g className={`${P}__lanternes`}>
          <ellipse cx="34" cy="84" rx="5" ry="7" fill="#ff922b" />
          <ellipse cx="270" cy="84" rx="5" ry="7" fill="#ff922b" />
        </g>
        <path d="M0 104 Q160 92 320 104 V110 H0 Z" fill="#33415f" />
      </svg>
      <span className={`${P}__pluie`} />
      <span className={`${P}__horloge`} />
      <svg className={`${P}__parapluie`} viewBox="0 0 60 60" focusable="false">
        <path d="M6 30 Q30 2 54 30 Q48 26 42 30 Q36 26 30 30 Q24 26 18 30 Q12 26 6 30 Z" fill="#e03131" stroke="#8c1d1d" strokeWidth="1.5" />
        <path d="M30 30 V50 Q30 56 24 54" fill="none" stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {[0, 1, 2, 3].map((i) => <span key={i} className={`${P}__feuille`} style={{ '--n': i }} />)}
    </div>
  );
}

/** Un verbe placé dans son plan : sa couleur, et le nom du plan au-dessus (par le CSS). */
const Verbe = ({ forme, plan, n = 0 }) => (
  <span className={`${P}__verbe ${P}__verbe--${plan}`} data-plan={NOM_PLAN[plan]} style={{ '--n': n }}>{forme}</span>
);

/** La phrase remplie, avec ses indices allumés. */
function AvecIndices({ texte }) {
  return String(texte).split(INDICES).map((t, i) => (i % 2
    // eslint-disable-next-line react/no-array-index-key
    ? <mark key={i} className={`${P}__indice`}>{t}</mark>
    : t));
}

/** La phrase, ses trous remplis par les verbes de la réponse, chacun dans son plan. */
function PhraseRemplie({ m }) {
  const q = String(m.question);
  if (m.consigne === 'valeur') {
    const parts = decouper(q);
    return (
      <p className={`${P}__remplie`}>
        {parts.map((p, i) => (p.designe
          // eslint-disable-next-line react/no-array-index-key
          ? <Verbe key={i} forme={p.texte} plan={PLAN[m.bonne] ?? 'decor'} />
          // eslint-disable-next-line react/no-array-index-key
          : <AvecIndices key={i} texte={p.texte} />))}
      </p>
    );
  }
  const bonne = (m.choix ?? []).find((c) => c.cle === m.bonne)?.libelle ?? '';
  const morceaux = q.split('___');
  let formes = [];
  let plans = [];
  if (m.consigne === 'deux-plans') {
    formes = bonne.split(' / ');
    plans = m.bonne === 'ps-imp' ? ['action', 'decor'] : ['decor', 'action'];
  } else {
    formes = [bonne];
    plans = [PLAN[m.bonne] ?? 'decor'];
  }
  if (morceaux.length - 1 !== formes.length) return null;
  return (
    <p className={`${P}__remplie`}>
      {morceaux.map((t, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>
          <AvecIndices texte={t} />
          {i < formes.length && <Verbe forme={formes[i]} plan={plans[i]} n={i} />}
        </span>
      ))}
    </p>
  );
}

export function QuestionDecorAction({ m, termine }) {
  let joue = '';
  if (termine) {
    joue = m.consigne === 'deux-plans' ? ' joue-decor joue-action' : ` joue-${PLAN[m.bonne] ?? 'decor'}`;
  }
  return (
    <div className={`${P}${joue}`}>
      <Ruelle />
      <div className={`${P}__dalle`}>
        <p className={`${P}__phrase`}>
          {decouper(m.question).map((p, i) => (p.designe
            // eslint-disable-next-line react/no-array-index-key
            ? <strong key={i} className={`college__designe ${P}__designe`}>{p.texte}</strong>
            // eslint-disable-next-line react/no-array-index-key
            : <span key={i}>{p.texte}</span>))}
        </p>
      </div>
      {termine && (
        <div className={`${P}__plans`} role="status">
          <PhraseRemplie m={m} />
          {LEGENDES[m.aide] && <p className={`${P}__legende`}>{LEGENDES[m.aide]}</p>}
        </div>
      )}
    </div>
  );
}

/** Les réponses : des lanternes de papier ; pour la valeur, trois calques de la ruelle. */
export function LanternesDecorAction({
  m, choix, fautes, choisir,
}) {
  const calques = m.consigne === 'valeur';
  return (
    <Boutons
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      prefixe={P}
      classe={calques ? `${P}__choix--calques` : `${P}__choix--lanternes`}
      etiquette={calques ? 'Choisis le plan de ce verbe' : 'Choisis ta lanterne'}
      rendu={(c) => (calques ? (
        <>
          <span className={`${P}__vignette ${P}__vignette--${PLAN[c.cle] ?? 'decor'}`} aria-hidden="true" />
          <span className={`${P}__nom`}>{c.libelle}</span>
        </>
      ) : (
        <>
          <span className={`${P}__anse`} aria-hidden="true" />
          <span className={`${P}__nom`}>{c.libelle}</span>
        </>
      ))}
    />
  );
}
