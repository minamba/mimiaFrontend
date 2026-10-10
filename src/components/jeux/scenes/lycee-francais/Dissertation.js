import { Fragment } from 'react';
import { EXEMPLES, PROBLEMATIQUES } from '../../../../lib/jeux/lycee/dissertation';
import { libelleBon, lignesDe } from './commun';

/**
 * LE TEMPLE DE LA DISSERTATION — « La dissertation » (1re). La couverture :
 * un palais de marbre blanc au-dessus d'une mer turquoise, des arches, une
 * sphère armillaire dorée. Une dissertation se BÂTIT ; la scène la reprend :
 *   - LA QUESTION : le sujet gravé au fronton ; un plan en trois parties se
 *     lit sur trois colonnes ; trois plans à comparer sont trois plans
 *     d'architecte, déroulés côte à côte ;
 *   - LES RÉPONSES : des blocs de marbre taillés (`objets`) ;
 *   - APRÈS LA RÉPONSE : l'édifice se monte. Le bon plan se dresse en temple
 *     sous le fronton du sujet, les deux autres s'effritent avec leur défaut
 *     (hors-sujet, redite, paraphrase) ; les colonnes d'un plan reçoivent
 *     leur rôle (thèse, antithèse, synthèse…) ; la problématique devient une
 *     arche dont la clé de voûte est le « ou » qui fait la tension ; l'exemple
 *     se pose en fondation sous l'argument qu'il prouve.
 * Avant la réponse, rien ne s'élève : on ne fait que lire les plans.
 */

const P = 'sc-dissertation';

/** « I. … II. … III. … » → les trois parties, chacune avec son espace de fin (le texte reste identique). */
export const parties = (plan) => String(plan).split(/(?<=\s)(?=(?:II|III)\. )/);

/** Le rôle des trois colonnes, selon le type de plan. */
const ROLES = {
  dialectique: ['Thèse', 'Antithèse', 'Synthèse'],
  thematique: ['Un aspect', 'Un autre aspect', 'Un troisième aspect'],
  analytique: ['Le constat', 'Les causes', 'Conséquences et remèdes'],
};

/** Le défaut d'un plan écarté. */
const DEFAUTS = {
  'plan-hors-sujet': 'Hors sujet',
  'plan-redite': 'Trois fois la même idée',
  'plan-paraphrase': 'Raconte l’œuvre au lieu de répondre',
};

/** Ce qu'annonce chaque connecteur. */
const ANNONCES = {
  certes: 'une concession', pourtant: 'une opposition', cependant: 'une opposition', car: 'une cause',
  'c’est pourquoi': 'une conséquence', donc: 'une conséquence', 'de plus': 'un ajout', 'en somme': 'une conclusion',
  'par exemple': 'un exemple',
};

/** Le fronton : le sujet gravé dans le marbre. */
function Fronton({ children }) {
  return (
    <div className={`${P}__fronton`}>
      <span className={`${P}__triangle`} aria-hidden="true" />
      <p className={`${P}__sujet`}>{children}</p>
    </div>
  );
}

/** Un plan en trois colonnes ; `roles` : le nom de chaque colonne, une fois la réponse donnée. */
function Colonnes({ plan, roles = null, eleve = false }) {
  return (
    <span className={`${P}__colonnes${eleve ? ` ${P}__colonnes--eleve` : ''}`}>
      {parties(plan).map((partie, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`${P}__colonne`} style={{ '--k': i }}>
          {roles && <em className={`${P}__role`} aria-hidden="true" data-role={roles[i]} />}
          {partie}
        </span>
      ))}
    </span>
  );
}

/** Trois plans pour un sujet : trois plans d'architecte, puis le bon se dresse. */
function TroisPlans({ m, termine }) {
  const lignes = lignesDe(m.question);
  const sujet = lignes[0];
  const plans = lignes.slice(1).filter((l) => /^[ABC]\. /.test(l));
  return (
    <div className={`${P}__chantier`}>
      <Fronton>{sujet}</Fronton>
      {'\n'}
      <div className={`${P}__plans`}>
        {plans.map((ligne) => {
          const lettre = ligne[0];
          const bon = termine && lettre === m.bonne;
          const defaut = termine && !bon ? DEFAUTS[m.pieges?.[lettre]] : null;
          return (
            <Fragment key={lettre}>
              <div className={`${P}__plan${bon ? ` ${P}__plan--bon` : ''}${defaut ? ` ${P}__plan--ecarte` : ''}`}>
                <span className={`${P}__lettre`}>{ligne.slice(0, 3)}</span>
                <Colonnes plan={ligne.slice(3)} eleve={bon} />
                {defaut && <span className={`${P}__defaut`} data-defaut={defaut} aria-hidden="true" />}
              </div>
              {'\n'}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/** Le connecteur posé dans son trou, et ce qu'il annonce. */
function Trou({ m, termine }) {
  const at = m.question.indexOf('…');
  if (at < 0) return <p className={`${P}__phrase`}>{m.question}</p>;
  return (
    <p className={`${P}__phrase`}>
      {m.question.slice(0, at)}
      <span className={`${P}__trou${termine ? ` ${P}__trou--pose` : ''}`} data-mot={termine ? m.bonne : undefined}>…</span>
      {m.question.slice(at + 1)}
    </p>
  );
}

/** La problématique en arche : ses deux piliers, et le « ou » en clé de voûte. */
function Arche({ m }) {
  const bonne = PROBLEMATIQUES.find(([sujet]) => m.question.includes(sujet))?.[1] ?? m.bonne;
  const coupe = bonne.split(/, ou /);
  if (coupe.length !== 2) return <p className={`${P}__annonce`}>{bonne}</p>;
  return (
    <div className={`${P}__arche`}>
      <span className={`${P}__pilier`} style={{ '--k': 0 }}>{`${coupe[0]},`}</span>
      <span className={`${P}__cle`} style={{ '--k': 1 }}>ou</span>
      <span className={`${P}__pilier`} style={{ '--k': 2 }}>{coupe[1]}</span>
    </div>
  );
}

/** L'exemple posé en fondation, sous l'argument qu'il prouve. */
function Fondation({ m }) {
  const ligne = EXEMPLES.find(([argument]) => m.question.includes(argument));
  if (!ligne) return null;
  return (
    <div className={`${P}__edifice`}>
      <span className={`${P}__argument`}>{ligne[0]}</span>
      <span className={`${P}__prouve`} aria-hidden="true">▲ prouvé par</span>
      <span className={`${P}__fondation`}>{ligne[1]}</span>
    </div>
  );
}

/** Après la réponse, sous la question : l'arche, la fondation, le connecteur expliqué. */
function Chantier({ m }) {
  let dessin = null;
  if (m.consigne === 'problematique') dessin = <Arche m={m} />;
  else if (m.consigne === 'exemple') dessin = <Fondation m={m} />;
  else if (m.consigne === 'connecteur') {
    const annonce = ANNONCES[String(m.bonne).toLowerCase()];
    dessin = annonce ? <p className={`${P}__annonce`}>{`« ${m.bonne} » annonce ${annonce}.`}</p> : null;
  } else if (m.consigne === 'type-de-plan') {
    dessin = <p className={`${P}__annonce`}>{libelleBon(m)}</p>;
  } else if (m.consigne === 'plan-au-sujet') {
    dessin = <p className={`${P}__annonce`}>{`Le plan ${m.bonne} répond au sujet : il discute, il progresse.`}</p>;
  }
  return dessin ? <div className={`${P}__bilan`} role="status">{dessin}</div> : null;
}

export function QuestionDissertation({ m, termine }) {
  let corps;
  if (m.consigne === 'plan-au-sujet') corps = <TroisPlans m={m} termine={termine} />;
  else if (m.consigne === 'type-de-plan') {
    corps = (
      <div className={`${P}__temple`}>
        <span className={`${P}__toit`} aria-hidden="true" />
        <Colonnes plan={m.question.replace(/\n/g, ' ')} roles={termine ? ROLES[m.bonne] : null} eleve={termine} />
        <span className={`${P}__socle`} aria-hidden="true" />
      </div>
    );
  } else if (m.consigne === 'connecteur') corps = <div className={`${P}__tablette`}><Trou m={m} termine={termine} /></div>;
  else corps = <div className={`${P}__tablette`}><p className={`${P}__phrase`}>{m.question}</p></div>;

  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      {corps}
      {termine && <Chantier m={m} />}
    </div>
  );
}
