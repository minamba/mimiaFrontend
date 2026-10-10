import { useState } from 'react';

/**
 * LES QUATRE TEMPS (CM1) — LES TEMPS COMPOSÉS (CM2) : LE CADRAN DU TEMPS
 * (09/10/2026). La couverture du CM1 : quatre portails lumineux autour d'un
 * cadran de pierre — Passé (orange), Présent (vert), Futur (bleu), Imparfait
 * (violet) ; celle du CM2, une grande horloge, un sablier et une pellicule.
 * La scène :
 *   - LA QUESTION : la consigne gravée sur une plaque, et la FRISE DU TEMPS —
 *     hier à gauche, maintenant au milieu, demain à droite — avec les
 *     portails de chaque temps. Le portail du temps DEMANDÉ s'allume (le temps
 *     est dans la question : ce n'est pas la réponse) ;
 *   - LES RÉPONSES : un CADRAN à aiguille. Les formes sont posées autour ;
 *     l'aiguille se tourne vers celle qu'on survole, et on la touche pour
 *     répondre. La fausse se barre ;
 *   - APRÈS LA RÉPONSE : la bonne forme entre dans son portail, sur la frise,
 *     et sa marque s'allume — la terminaison (-ait, -aient pour l'imparfait,
 *     le r du futur, le r + -ait du conditionnel) ou l'AUXILIAIRE des temps
 *     composés, avec ce qu'il dit : « auxiliaire au présent » pour le passé
 *     composé, à l'imparfait pour le plus-que-parfait, au futur pour le futur
 *     antérieur.
 */

const CLE = 'sc-temps-cm1';

/** Les portails de la frise : leur place (en %), leur couleur, leur nom. */
const PORTAILS = {
  'plus-que-parfait': { x: 8, teinte: 'ambre', nom: 'plus-que-parfait' },
  'passe-simple': { x: 14, teinte: 'orange', nom: 'passé simple' },
  imparfait: { x: 32, teinte: 'violet', nom: 'imparfait' },
  'passe-compose': { x: 32, teinte: 'orange', nom: 'passé composé' },
  present: { x: 50, teinte: 'vert', nom: 'présent' },
  'futur-anterieur': { x: 64, teinte: 'cyan', nom: 'futur antérieur' },
  futur: { x: 86, teinte: 'bleu', nom: 'futur' },
  conditionnel: { x: 90, teinte: 'rose', nom: 'conditionnel' },
};

const CM1 = ['passe-simple', 'imparfait', 'present', 'futur'];
const CM2 = ['plus-que-parfait', 'passe-compose', 'futur-anterieur', 'conditionnel'];

const AUXILIAIRE_DIT = {
  'passe-compose': 'auxiliaire au présent',
  'plus-que-parfait': 'auxiliaire à l’imparfait',
  'futur-anterieur': 'auxiliaire au futur',
};

/** La forme, sa marque allumée : [avant, marque, après, ce que dit la marque]. */
export function marqueDe(forme, temps) {
  const f = String(forme).replace(/^ils? /, '');
  const sujet = String(forme).slice(0, String(forme).length - f.length);
  const coupe = (re, dit) => {
    const r = f.match(re);
    return r ? [sujet + f.slice(0, r.index), r[0], f.slice(r.index + r[0].length), dit] : null;
  };
  if (AUXILIAIRE_DIT[temps]) {
    const [aux, ...reste] = f.split(' ');
    if (reste.length) return [sujet, aux, ` ${reste.join(' ')}`, AUXILIAIRE_DIT[temps]];
  }
  if (temps === 'imparfait') return coupe(/(ait|aient)$/, 'imparfait : -ait, -aient');
  if (temps === 'futur') return coupe(/r(a|ont)$/, 'futur : le r avant la fin');
  if (temps === 'conditionnel') return coupe(/r(ait|aient)$/, 'conditionnel : le r du futur + -ait');
  return null;
}

/** La frise : les portails des temps de la classe, celui qui est demandé allumé. */
function Frise({ temps, forme }) {
  const famille = CM2.includes(temps) ? CM2 : CM1;
  const marque = forme ? marqueDe(forme, temps) : null;
  const ici = PORTAILS[temps];
  return (
    <>
      <div className={`${CLE}__frise`}>
        <span className={`${CLE}__ligne`} aria-hidden="true" />
        <span className={`${CLE}__repere ${CLE}__repere--hier`} aria-hidden="true">hier</span>
        <span className={`${CLE}__repere ${CLE}__repere--maintenant`} aria-hidden="true">maintenant</span>
        <span className={`${CLE}__repere ${CLE}__repere--demain`} aria-hidden="true">demain</span>
        {famille.map((t) => {
          const p = PORTAILS[t];
          const demande = t === temps;
          return (
            <span
              key={t}
              className={`${CLE}__portail ${CLE}__teinte--${p.teinte}${demande ? ' est-demande' : ''}${t === 'conditionnel' ? ` ${CLE}__portail--reve` : ''}`}
              style={{ '--x': p.x / 100 }}
            >
              <span className={`${CLE}__nom-temps`}>{p.nom}</span>
              <span className={`${CLE}__arche`} aria-hidden="true">{demande && !forme ? '?' : ''}</span>
            </span>
          );
        })}
        {forme && ici && (
          <span className={`${CLE}__voyageur ${CLE}__teinte--${ici.teinte}`} style={{ '--x': ici.x / 100 }}>
            {marque ? (
              <>
                {marque[0]}
                <span className={`${CLE}__marque`}>{marque[1]}</span>
                {marque[2]}
              </>
            ) : forme}
          </span>
        )}
      </div>
      {forme && marque && <p className={`${CLE}__marque-dit ${CLE}__teinte--${ici.teinte}`}>{marque[3]}</p>}
    </>
  );
}

export function QuestionTemps({ m, termine }) {
  const forme = termine ? (m.choix ?? []).find((c) => c.cle === m.bonne)?.libelle ?? m.bonne : null;
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <p className={`phrase-a-trou ${CLE}__plaque`}>{m.question}</p>
      {PORTAILS[m.consigne] && <Frise temps={m.consigne} forme={forme} />}
    </div>
  );
}

/** Le cadran : l'aiguille vise la forme survolée ; on la touche pour répondre. */
export function Cadran({ choix, fautes, choisir }) {
  const [vise, setVise] = useState(null);
  const n = choix.length;
  // Les formes en éventail au-dessus du cadran : de -60° à +60°.
  const angle = (i) => (n > 1 ? -60 + (120 * i) / (n - 1) : 0);
  return (
    <div className={`${CLE}__horloge`}>
      <ul className={`${CLE}__formes`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => {
          const faux = fautes.includes(cle);
          return (
            // Les formes du bord descendent un peu : l'éventail suit le tour du cadran.
            <li key={cle} style={{ '--i': i, '--creux': Math.abs(angle(i)) / 60 }}>
              <button
                type="button"
                className={`${CLE}__forme${faux ? ' est-fausse' : ''}${vise === i ? ' est-visee' : ''}`}
                onClick={() => choisir(cle)}
                onMouseEnter={() => setVise(i)}
                onFocus={() => setVise(i)}
                onMouseLeave={() => setVise(null)}
                onBlur={() => setVise(null)}
                disabled={faux}
              >
                {libelle}
              </button>
            </li>
          );
        })}
      </ul>
      <span className={`${CLE}__cadran`} aria-hidden="true">
        <span className={`${CLE}__graduations`} />
        <span className={`${CLE}__aiguille${vise === null ? ' est-libre' : ''}`} style={{ '--angle': vise === null ? '0deg' : `${angle(vise)}deg` }} />
        <span className={`${CLE}__axe`} />
      </span>
    </div>
  );
}

const scene = {
  question: (m, termine) => <QuestionTemps m={m} termine={termine} />,
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <Cadran choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
