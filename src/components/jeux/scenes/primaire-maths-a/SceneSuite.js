import { rangee, useDeroule } from './communs';
import './primaire-maths-a.css';

/**
 * LA SUITE QUI CONTINUE (CM1) — 09/10/2026. La couverture est un escalier de
 * pierre qui monte vers un portail baigné de soleil, une flèche lumineuse sur
 * chaque marche, et un panneau : « Un pas après l'autre… la suite continue ! ».
 * La scène :
 *   - LA QUESTION sur le panneau de bois ; dessous, l'ESCALIER : chaque nombre
 *     (ou chaque forme) sur sa marche, la dernière marche vide qui attend, un
 *     point d'interrogation qui pulse ; une coccinelle assise sur la dernière
 *     marche connue agite ses antennes ; en haut, le portail rayonne ;
 *   - LES RÉPONSES : des pierres taillées à poser sur la marche vide
 *     (`ChoixSuite`) — on clique sur la bonne ;
 *   - APRÈS LA RÉPONSE : au-dessus de chaque pas apparaît la règle (« + 4 »,
 *     « × 2 », « − 7 ») ; pour un motif, chaque groupe qui se répète se colore
 *     à son tour ; puis la pierre se pose sur la marche, la coccinelle y
 *     grimpe, et le portail s'illumine.
 * Avant la réponse, aucun écart n'est écrit : l'écart, c'est la méthode qui
 * donne la réponse.
 */

/** La règle d'une suite : ajouter, multiplier, ou répéter un motif ; et le terme suivant. */
export function regleDeLaSuite(question) {
  const q = String(question ?? '');
  const nombres = q.match(/^(\d+(?:, \d+)+), … \?$/);
  if (nombres) {
    const termes = nombres[1].split(', ').map(Number);
    const ecarts = termes.slice(1).map((x, i) => x - termes[i]);
    if (ecarts.every((e) => e === ecarts[0]) && ecarts[0] !== 0) {
      return {
        sorte: 'ajoute', termes, pas: ecarts[0], suivant: termes[termes.length - 1] + ecarts[0],
      };
    }
    const f = termes[0] !== 0 ? termes[1] / termes[0] : NaN;
    if (Number.isInteger(f) && f > 1 && termes.every((x, i) => i === 0 || x === termes[i - 1] * f)) {
      return {
        sorte: 'multiplie', termes, facteur: f, suivant: termes[termes.length - 1] * f,
      };
    }
    return null;
  }
  const motif = q.match(/^(.+) … \?$/);
  if (motif) {
    const termes = motif[1].split(' ').filter(Boolean);
    for (let p = 1; p < termes.length; p += 1) {
      if (termes.every((x, i) => x === termes[i % p])) {
        return {
          sorte: 'motif', termes, periode: p, suivant: termes[termes.length % p],
        };
      }
    }
  }
  return null;
}

/** L'écart écrit au-dessus d'un pas : « + 4 », « − 7 », « × 2 ». */
function ecritureDuPas(r) {
  if (r.sorte === 'multiplie') return `× ${r.facteur}`;
  return r.pas > 0 ? `+ ${r.pas}` : `− ${-r.pas}`;
}

/** La coccinelle : elle agite ses antennes, et ouvre ses ailes à l'arrivée. */
function Coccinelle({ envol = false }) {
  return (
    <svg className={`sc-suite-qui-continue__coccinelle${envol ? ' est-arrivee' : ''}`} viewBox="0 0 50 40" aria-hidden="true" focusable="false">
      <g className="sc-suite-qui-continue__antennes">
        <path d="M36 12 q4 -8 10 -8 M32 10 q0 -8 6 -10" fill="none" stroke="#1b1d3a" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="35" cy="20" r="8" fill="#1b1d3a" />
      <circle cx="38" cy="18" r="2" fill="#fff" />
      <g className="sc-suite-qui-continue__elytre sc-suite-qui-continue__elytre--a">
        <path d="M30 24 a16 14 0 0 0 -28 0 a16 12 0 0 0 28 0 Z" fill="#e03131" stroke="#1b1d3a" strokeWidth="2" />
        <circle cx="12" cy="22" r="3" fill="#1b1d3a" />
        <circle cx="20" cy="30" r="2.6" fill="#1b1d3a" />
        <circle cx="22" cy="17" r="2.4" fill="#1b1d3a" />
      </g>
      <path d="M8 34 l-3 5 M16 36 l0 4 M24 36 l2 4" stroke="#1b1d3a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Le portail de pierre, en haut de l'escalier, et ses rayons. */
function Portail({ ouvert }) {
  return (
    <svg className={`sc-suite-qui-continue__portail${ouvert ? ' est-ouvert' : ''}`} viewBox="0 0 80 90" aria-hidden="true" focusable="false">
      <g className="sc-suite-qui-continue__rayons">
        {rangee(10).map((i) => <rect key={i} x="38" y="-14" width="4" height="34" rx="2" fill="#ffe066" opacity="0.8" transform={`rotate(${i * 36} 40 46)`} />)}
      </g>
      <rect x="22" y="26" width="36" height="62" fill="#fff4c2" className="sc-suite-qui-continue__lumiere" />
      <rect x="8" y="22" width="14" height="66" fill="#d8cbb4" stroke="#8d7b68" strokeWidth="2" />
      <rect x="58" y="22" width="14" height="66" fill="#d8cbb4" stroke="#8d7b68" strokeWidth="2" />
      <rect x="2" y="10" width="76" height="14" rx="2" fill="#cdbfa6" stroke="#8d7b68" strokeWidth="2" />
    </svg>
  );
}

/** L'escalier : une marche par terme, la dernière vide (ou posée, après la réponse). */
function Escalier({
  termes, pose = null, pas = [], groupes = null, arrivee = false,
}) {
  const n = termes.length + 1;
  return (
    <div className="sc-suite-qui-continue__montee">
      <ol className="sc-suite-qui-continue__escalier" style={{ '--marches': n }} aria-label="L’escalier de la suite">
        {[...termes, pose].map((t, i) => {
          const derniere = i === termes.length;
          const groupe = groupes && !derniere ? groupes(i) : null;
          return (
            <li
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className={`sc-suite-qui-continue__marche${derniere ? ' est-derniere' : ''}${derniere && t !== null ? ' est-posee' : ''}${groupe !== null ? ` est-du-groupe-${groupe % 2}` : ''}`}
              style={{ '--i': i }}
            >
              {i > 0 && pas[i - 1] && <span className="sc-suite-qui-continue__pas">{pas[i - 1]}</span>}
              <span className="sc-suite-qui-continue__terme">{t ?? '?'}</span>
              {((!arrivee && i === termes.length - 1) || (arrivee && derniere)) && <Coccinelle envol={arrivee} />}
            </li>
          );
        })}
      </ol>
      <Portail ouvert={arrivee} />
    </div>
  );
}

/** Le décor : le ciel, le soleil, la colline. */
function Colline({ children, ouvert = false }) {
  return (
    <div className={`sc-suite-qui-continue${ouvert ? ' est-ouverte' : ''}`}>
      <span className="sc-suite-qui-continue__soleil" aria-hidden="true" />
      {children}
    </div>
  );
}

/** LA QUESTION : le panneau, l'escalier, la marche vide. */
export function QuestionSuite({ m, termine }) {
  if (termine) return <ApresSuite m={m} />;
  const r = regleDeLaSuite(m.question);
  return (
    <Colline>
      <p className="sc-suite-qui-continue__panneau">{m.question}</p>
      {r && <Escalier termes={r.termes.map(String)} />}
    </Colline>
  );
}

/**
 * LES RÉPONSES : des pierres taillées, une flèche lumineuse gravée dessus, qui
 * flottent doucement ; on clique sur celle qui continue la suite.
 */
export function ChoixSuite({ choix, fautes, choisir }) {
  return (
    <ul className="sc-suite-qui-continue__pierres" aria-label="Choisis la pierre de la marche suivante">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button type="button" className={`sc-suite-qui-continue__bloc${fausse ? ' est-fausse' : ''}`} onClick={() => choisir(cle)} disabled={fausse}>
              <span className="sc-suite-qui-continue__fleche" aria-hidden="true" />
              <span className="sc-suite-qui-continue__libelle">{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** APRÈS LA RÉPONSE : la règle s'écrit pas à pas, puis la pierre se pose et la coccinelle grimpe. */
export function ApresSuite({ m }) {
  const r = regleDeLaSuite(m.question);
  const motif = r?.sorte === 'motif';
  const etapes = r ? (motif ? Math.ceil(r.termes.length / r.periode) : r.termes.length - 1) : 0;
  const pas = useDeroule(etapes + 1, motif ? 700 : 900, 400);
  if (!r) {
    return (
      <Colline ouvert>
        <p className="sc-suite-qui-continue__panneau">{m.question}</p>
      </Colline>
    );
  }
  const fini = pas > etapes;
  const termes = r.termes.map(String);
  const ecarts = motif ? [] : rangee(termes.length).map((i) => (i < pas || (fini && i === termes.length - 1) ? ecritureDuPas(r) : null));
  const groupes = motif ? (i) => (Math.floor(i / r.periode) < pas || fini ? Math.floor(i / r.periode) : null) : null;
  const legende = motif
    ? `Le motif « ${termes.slice(0, r.periode).join(' ')} » se répète : la suite continue avec ${r.suivant}.`
    : `À chaque pas, ${ecritureDuPas(r)} : ${termes[termes.length - 1]} ${ecritureDuPas(r)} = ${r.suivant}.`;
  return (
    <Colline ouvert={fini}>
      <p className="sc-suite-qui-continue__panneau">{m.question}</p>
      <Escalier termes={termes} pose={fini ? String(r.suivant) : null} pas={ecarts} groupes={groupes} arrivee={fini} />
      <p className={`sc-suite-qui-continue__legende${fini ? ' est-fini' : ''}`}>{fini ? legende : (motif ? 'Quel petit groupe revient ?' : 'Quel est l’écart d’une marche à l’autre ?')}</p>
    </Colline>
  );
}
