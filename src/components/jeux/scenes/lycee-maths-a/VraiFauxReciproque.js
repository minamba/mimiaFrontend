import { Texte, sur } from './commun';

/**
 * LE JARDIN JAPONAIS DE « VRAI, FAUX, RÉCIPROQUE » (09/10/2026). La
 * couverture : un jardin de pierre et de cerisiers en fleurs, des allées
 * fermées de portillons rouges, des flèches gravées. Une implication, c'est
 * un pont qui va d'une pierre à l'autre — dans UN sens.
 *   - LA QUESTION est sur un rouleau suspendu (kakemono), sous un torii ; des
 *     pétales de cerisier tombent ;
 *   - L'IMPLICATION DE L'ÉNONCÉ est posée en pierres : « P » — pont — « Q »
 *     (la condition et la conclusion lues dans l'énoncé, rien de plus) ;
 *   - LES RÉPONSES restent celles de l'écran commun : les buzzers Vraie /
 *     Fausse quand il y en a deux, sinon des plaquettes votives en bois
 *     (`objets`) ;
 *   - APRÈS LA RÉPONSE, le jardin montre la logique : le pont se retourne
 *     (réciproque), les pierres échangent leur place et se barrent de « non »
 *     (contraposée), les lanternes du pont s'allument dans les deux sens qui
 *     marchent (nécessaire, suffisante), les mots qui basculent pour une
 *     négation (« pour tout » → « il existe », « et » → « ou »)…
 */

const P = 'sc-vrai-faux-reciproque';

const citations = (q) => [...String(q).matchAll(/« ([^»]+) »/g)].map((r) => r[1]);
const siAlors = (s) => {
  const r = String(s).match(/^Si (.+?), alors (.+?)\.?$/);
  return r ? { p: r[1], q: r[2] } : null;
};

/** Ce que le jardin pose et rejoue : { pierres: {p, q}, apres: {...} } ou null. */
export function jardinDe(m) {
  const q = String(m.question);
  const b = String(m.bonne);
  const [premiere, seconde] = citations(q);
  switch (m.consigne) {
    case 'reciproque':
    case 'contraposee': {
      const s = siAlors(premiere);
      const r = siAlors(b);
      if (!s || !r) return null;
      return { pierres: s, apres: { sorte: m.consigne, pierres: r } };
    }
    case 'verite': {
      const s = siAlors(seconde ?? premiere);
      if (!s) return null;
      return { pierres: s, apres: { sorte: 'verite', vraie: /^Vraie/.test(b) } };
    }
    case 'necessaire': {
      // « Pour avoir « Q », la condition « P » est… » : P est la condition, Q le but.
      if (!premiere || !seconde) return null;
      const suffisante = /^Suffisante|et suffisante/.test(b);
      const necessaire = /^Nécessaire/.test(b);
      return { pierres: { p: seconde, q: premiere }, inconnu: true, apres: { sorte: 'necessaire', suffisante, necessaire } };
    }
    case 'negation': {
      const bascules = [];
      if (/Pour tout/.test(q) && /Il existe/.test(b)) bascules.push(['pour tout', 'il existe']);
      if (/Il existe/.test(q) && /Pour tout/.test(b)) bascules.push(['il existe', 'pour tout']);
      if (/ et /.test(q) && / ou /.test(b)) bascules.push(['et', 'ou']);
      if (/ ou /.test(q) && / et /.test(b)) bascules.push(['ou', 'et']);
      [['≤', '>'], ['<', '≥'], ['≥', '<'], ['>', '≤']].forEach(([a, c]) => {
        if (q.includes(a) && b.includes(c) && !bascules.some((x) => x[0] === a)) bascules.push([a, c]);
      });
      [['pair', 'impair'], ['impair', 'pair']].forEach(([a, c]) => {
        if (new RegExp(`(^|[^m])${a}`).test(q) && new RegExp(`(^|[^m])${c}`).test(b) && !bascules.some((x) => x[0] === 'pair' || x[0] === 'impair')) bascules.push([a, c]);
      });
      return bascules.length ? { apres: { sorte: 'negation', bascules } } : null;
    }
    case 'contre-exemple':
      return { apres: { sorte: 'contre-exemple', valeur: b } };
    case 'identite':
      return { apres: { sorte: 'identite', identite: /identité/.test(b) } };
    case 'statut':
      return {
        apres: {
          sorte: 'statut',
          mot: b,
          sens: {
            'un paramètre': 'fixé d’abord, il change d’un cas à l’autre',
            'une variable': 'elle parcourt toutes les valeurs',
            'une inconnue': 'on la cherche : l’équation dit qui elle est',
          }[b] ?? '',
        },
      };
    default:
      return null;
  }
}

function Petales() {
  return (
    <span className={`${P}__petales`} aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} className={`${P}__petale`} style={{ '--i': i }} />)}
    </span>
  );
}

/** Deux pierres et un pont : P → Q. Après la réponse, le pont rejoue la logique. */
function Pont({ pierres, apres, termine, inconnu }) {
  const sorte = termine ? apres?.sorte : null;
  const affichees = termine && (sorte === 'reciproque' || sorte === 'contraposee') ? apres.pierres : pierres;
  let fleche = inconnu ? '?' : '⟹';
  if (sorte === 'necessaire') fleche = apres.suffisante && apres.necessaire ? '⟺' : apres.suffisante ? '⟹' : '⟸'; // eslint-disable-line no-nested-ternary
  return (
    <div className={`${P}__pont${sorte ? ` est-${sorte}` : ''}${sorte === 'verite' ? ` est-${apres.vraie ? 'vraie' : 'fausse'}` : ''}`}>
      <span key={`p-${termine}`} className={`${P}__pierre ${P}__pierre--p`}>{affichees.p}</span>
      <span key={`f-${termine}`} className={`${P}__arche`}>
        <span className={`${P}__lanterne`} aria-hidden="true" />
        <span className={`${P}__sens`}>{fleche}</span>
      </span>
      <span key={`q-${termine}`} className={`${P}__pierre ${P}__pierre--q`}>{affichees.q}</span>
    </div>
  );
}

function Lecon({ apres }) {
  if (apres.sorte === 'negation') {
    return (
      <ul className={`${P}__bascules`} aria-label="Ce qui bascule">
        {apres.bascules.map(([a, c], i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} style={{ '--i': i }}>
            <s>{a}</s>
            <span aria-hidden="true">→</span>
            <strong>{c}</strong>
          </li>
        ))}
      </ul>
    );
  }
  const texte = {
    reciproque: 'La réciproque retourne le pont : la conclusion devient la condition.',
    contraposee: 'La contraposée retourne le pont ET dit « non » aux deux pierres.',
    'contre-exemple': `Avec ${apres.valeur}, la phrase « pour tout » tombe : un seul cas suffit.`,
    identite: apres.identite ? 'Vraie pour TOUS les x : c’est une identité.' : 'Vraie seulement pour certains x : c’est une équation.',
    statut: `${apres.mot ?? ''} : ${apres.sens ?? ''}`,
    necessaire: 'Suffisante : la condition mène au but. Nécessaire : sans elle, pas de but.',
    verite: apres.vraie ? 'Le pont tient : la phrase est vraie.' : 'Le pont casse : un contre-exemple suffit.',
  }[apres.sorte];
  return texte ? <p className={`${P}__lecon`}>{texte}</p> : null;
}

export function QuestionVraiFaux({ m, termine }) {
  const jardin = sur(() => jardinDe(m));
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Petales />
      <div className={`${P}__torii`} aria-hidden="true">
        <span className={`${P}__kasagi`} />
        <span className={`${P}__nuki`} />
      </div>
      <div className={`${P}__rouleau`}>
        <Texte m={m} classe={`${P}__texte`} />
      </div>
      {jardin?.pierres && <Pont pierres={jardin.pierres} apres={jardin.apres} termine={termine} inconnu={jardin.inconnu} />}
      {termine && jardin?.apres && <Lecon apres={jardin.apres} />}
    </div>
  );
}
