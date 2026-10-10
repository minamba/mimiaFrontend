import { Fragment } from 'react';
import { GROUPEMENTS, REGARDS, RELATIONS } from '../../../../lib/jeux/lycee/groupement-textes';
import { libelleBon, lignesDe } from './commun';

/**
 * LES PAVILLONS SUR LA MER — « Le groupement de textes » (terminale
 * professionnelle). La couverture : une terrasse de pierre au-dessus d'une
 * mer semée d'îles, et des pavillons de verre posés çà et là. La scène la
 * reprend :
 *   - LA QUESTION : chaque document est un pavillon de verre, avec sa lettre
 *     (A, B, C), posé sur la mer ; la question est gravée sur la terrasse ;
 *   - LES RÉPONSES : des passerelles de bois (`objets`) ;
 *   - APRÈS LA RÉPONSE : on RELIE les documents. Le thème apparaît sur une île
 *     au centre, et une passerelle part de chaque pavillon vers lui ; chaque
 *     pavillon allume le regard qu'il porte (le soleil du regard favorable,
 *     l'orage du regard critique, la balance de celui qui informe) ; entre
 *     deux documents, la passerelle est pleine s'ils s'accordent, rompue
 *     s'ils s'opposent, en pointillé quand l'un informe et l'autre juge.
 * Avant la réponse, aucun pavillon ne s'allume : ce serait la réponse.
 */

const P = 'sc-groupement-textes';

const SIGNES = { favorable: '☀', critique: '⚡', neutre: '⚖' };

/** Le regard d'un document, retrouvé dans les groupements du module. */
function regardDe(ligne) {
  for (const g of GROUPEMENTS) {
    const doc = (g.documents ?? []).find(([texte]) => ligne.endsWith(texte));
    if (doc) return doc[1];
  }
  return null;
}

/** Un pavillon de verre : un document, sa lettre, et son regard une fois la réponse donnée. */
function Pavillon({ ligne, regard }) {
  const r = /^Document ([ABC]) — /.exec(ligne);
  return (
    <span className={`${P}__pavillon${regard ? ` ${P}__pavillon--${regard}` : ''}`}>
      <span className={`${P}__toit`} aria-hidden="true" />
      {regard && <span className={`${P}__signe`} aria-hidden="true" data-signe={SIGNES[regard]} />}
      {r ? (
        <>
          <span className={`${P}__lettre`}>{`Document ${r[1]}`}</span>
          {ligne.slice(r[0].length - 3)}
        </>
      ) : ligne}
    </span>
  );
}

export function QuestionGroupement({ m, termine }) {
  const lignes = lignesDe(m.question);
  const documents = lignes.filter((l) => /^Document [ABC] — /.test(l));
  const question = lignes.filter((l) => l.trim() && !/^Document [ABC] — /.test(l));
  const montrerRegards = termine && m.consigne !== 'theme';
  const regards = documents.map((d) => (montrerRegards ? regardDe(d) : null));

  let lien = null;
  if (termine && m.consigne === 'rapprocher') lien = m.bonne;

  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__mer`}>
        <p className={`${P}__archipel${documents.length === 2 ? ` ${P}__archipel--deux` : ''}`}>
          {documents.map((d, i) => (
            <Fragment key={d.slice(0, 12)}>
              <Pavillon ligne={d} regard={regards[i]} />
              {i === 0 && lien && <span className={`${P}__passerelle ${P}__passerelle--${lien}`} aria-hidden="true" />}
              {'\n'}
            </Fragment>
          ))}
        </p>
        {termine && m.consigne === 'theme' && (
          <div className={`${P}__ile`} role="status">
            <span className={`${P}__rayons`} aria-hidden="true">
              {documents.map((d, i) => <span key={d.slice(0, 12)} style={{ '--k': i, '--n': documents.length }} />)}
            </span>
            <strong>{libelleBon(m)}</strong>
          </div>
        )}
      </div>
      {question.length > 0 && (
        <div className={`${P}__terrasse`}>
          <p className={`${P}__question`}>{question.join(' ')}</p>
        </div>
      )}
      {termine && m.consigne !== 'theme' && (
        <div className={`${P}__bilan`} role="status">
          <strong className={`${P}__verdict`}>{m.consigne === 'rapprocher' ? RELATIONS[m.bonne] : REGARDS[m.bonne]}</strong>
          <span className={`${P}__legende`}>☀ favorable · ⚡ critique · ⚖ informe sans juger</span>
        </div>
      )}
    </div>
  );
}
