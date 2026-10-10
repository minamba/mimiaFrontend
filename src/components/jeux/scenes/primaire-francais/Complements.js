import { decouper } from '../../../../lib/jeux/complementsCM1';
import { capitale } from './outils';

/**
 * COD OU COI ? (CM1) — COMPLÉMENT DU VERBE OU DE PHRASE (CM2) : LES PORTAILS
 * (09/10/2026). La couverture du CM1 : deux portails de pierre qui brillent,
 * COD en bleu, COI en orange, des chemins fléchés qui y mènent ; celle du CM2,
 * un chemin de nuit jalonné de balises lumineuses. La scène :
 *   - LA QUESTION : la phrase sur un pont de pierre ; le groupe surligné est
 *     un VOYAGEUR (une pierre qui luit et sautille) ;
 *   - LES RÉPONSES : des PORTAILS — chacun sa couleur, son arche, sa lueur.
 *     Le mauvais portail baisse sa herse ;
 *   - APRÈS LA RÉPONSE : le voyageur file dans le bon portail, et le TEST du
 *     jeu se fait : la question « quoi ? » pour le COD, le petit mot « à » ou
 *     « de » qui accroche le COI, et pour le complément de phrase, le groupe
 *     qui se DÉPLACE puis DISPARAÎT — la phrase tient, ou elle tombe.
 */

const CLE = 'sc-complements-cm1';

const COULEURS = {
  cod: 'bleu', coi: 'orange', cc: 'vert', verbe: 'bleu', phrase: 'orange',
};

/** Les mots qu'on écrit en minuscule quand ils quittent le début de la phrase. */
const DEBUT_COMMUN = /^(le|la|les|l’|un|une|des|il|elle|ils|elles|nous|vous|je|j’|tu|on|mon|ma|mes|ce|cette|ces|chaque|pendant)\b/i;
const minusculeSiCommun = (t) => (DEBUT_COMMUN.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

/** Le groupe déplacé : en tête s'il est au bout, au bout s'il est en tête. */
function deplacer(avant, groupe, apres) {
  const fin = (apres.match(/[.!?]\s*$/) ?? ['.'])[0].trim();
  if (!avant.trim()) {
    const reste = apres.replace(/^,\s*/, '').replace(/[.!?]\s*$/, '');
    return `${capitale(reste)} ${minusculeSiCommun(groupe)}${fin}`;
  }
  const milieu = apres.replace(/[.!?]\s*$/, '');
  return `${capitale(groupe)}, ${minusculeSiCommun(avant.trim())}${milieu}${fin}`;
}

/** Le groupe enlevé. */
function enlever(avant, apres) {
  const t = `${avant}${apres}`.replace(/^\s*,\s*/, '').replace(/\s+([.,!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  return capitale(t);
}

function Essai({ texte, tient }) {
  return (
    <span className={`${CLE}__essai ${tient ? 'est-juste' : 'est-faux'}`}>
      <span className={`${CLE}__essai-signe`} aria-hidden="true">{tient ? '✔' : '✘'}</span>
      {texte}
    </span>
  );
}

/** LE TEST, une fois la manche finie. */
function Test({ m, avant, groupe, apres }) {
  if (m.bonne === 'cod') {
    return (
      <p className={`${CLE}__test`}>
        <span className={`${CLE}__question-test`}>{`${avant.trim()} quoi ? qui ?`}</span>
        <span aria-hidden="true"> → </span>
        <strong>{groupe}</strong>
        <span>{' : directement après le verbe, sans petit mot.'}</span>
      </p>
    );
  }
  if (m.bonne === 'coi') {
    const [petit, ...reste] = groupe.split(' ');
    return (
      <p className={`${CLE}__test`}>
        <span>{`${avant.trim()} `}</span>
        <span className={`${CLE}__crochet`}>{petit}</span>
        <span>{` ${reste.join(' ')}`}</span>
        <span>{` : le petit mot « ${petit} » accroche le groupe au verbe.`}</span>
      </p>
    );
  }
  // Complément de phrase (ou circonstanciel) : il se déplace et s'enlève. Du verbe : non.
  const tient = m.bonne === 'cc' || m.bonne === 'phrase';
  return (
    <div className={`${CLE}__test ${CLE}__test--essais`}>
      <Essai texte={deplacer(avant, groupe, apres)} tient={tient} />
      <Essai texte={enlever(avant, apres)} tient={tient} />
    </div>
  );
}

export function QuestionComplements({ m, termine }) {
  const phrase = String(m.phrase ?? '');
  if (!phrase.includes('[')) return <p className="phrase-a-trou">{m.question}</p>;
  const [avant, groupe, apres] = decouper(phrase);
  const libelle = (m.choix ?? []).find((c) => c.cle === m.bonne)?.libelle;
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <div className={`${CLE}__pont`}>
        <p className={`phrase-a-trou ${CLE}__phrase`}>
          {avant}
          <mark className={`surligne ${CLE}__voyageur`}>{groupe}</mark>
          {apres}
        </p>
        <span className={`${CLE}__arches`} aria-hidden="true" />
      </div>
      {termine && (
        <div className={`${CLE}__arrivee`}>
          <span className={`${CLE}__portail-fin ${CLE}__couleur--${COULEURS[m.bonne] ?? 'bleu'}`} aria-hidden="true">
            <span className={`${CLE}__voyageur-qui-entre`}>{groupe}</span>
          </span>
          <strong className={`${CLE}__nom-portail`}>{libelle}</strong>
          <Test m={m} avant={avant} groupe={groupe} apres={apres} />
        </div>
      )}
    </div>
  );
}

/** Les portails : une arche de pierre, une lueur, le nom gravé ; le faux baisse sa herse. */
export function Portails({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__portails`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${CLE}__portail ${CLE}__couleur--${COULEURS[cle] ?? 'bleu'}${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className={`${CLE}__lueur`} aria-hidden="true" />
              <span className={`${CLE}__herse`} aria-hidden="true" />
              <span className={`${CLE}__gravure`}>{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionComplements m={m} termine={termine} />,
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <Portails choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
