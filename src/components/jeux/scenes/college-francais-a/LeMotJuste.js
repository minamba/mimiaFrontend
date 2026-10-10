import { Boutons, Designe, entreCrochets, laBonne, trouverMot } from './commun';
import { DENOTATIONS_4E, GRADATION_5E } from '../../../../lib/jeux/college/le-mot-juste';

/**
 * LA SERRE AUX MOTS — « Le mot juste » (6e → 3e). La couverture : une serre
 * de verre pleine d'hortensias, une jardinière penchée sur ses fleurs. Ici,
 * chaque mot est une fleur : on cueille celle qui convient.
 *   - LA QUESTION : l'étiquette d'ardoise plantée dans la plate-bande, sous
 *     les verrières et les suspensions fleuries qui se balancent ;
 *   - LES RÉPONSES : des pots de fleurs, le mot sur le ruban du pot — on
 *     cueille ;
 *   - APRÈS LA RÉPONSE : le mot juste FLEURIT là où il sert — repiqué dans la
 *     phrase (« Le chemin est resserré »), à la place du mot passe-partout qui
 *     fane, en bouquet noué pour le mot qui regroupe, en trois fleurs de plus
 *     en plus grandes pour la gradation, en fiche de dictionnaire pour le sens.
 */

const P = 'sc-le-mot-juste';

const EMOTIONS = {
  'la colère': '😠',
  'la honte': '😳',
  'le soulagement': '😌',
  'la jalousie': '😒',
  'la nostalgie': '🥲',
  'la peur': '😨',
  'l’admiration': '🤩',
  'le mépris': '😏',
  'l’inquiétude': '😟',
  'la joie': '😄',
  'la surprise': '😲',
  'la tristesse': '😢',
};

/** Une fleur en SVG : cinq pétales autour d'un cœur, à la couleur donnée. */
function Fleur({ teinte = '#b197fc', coeur = '#ffd43b', taille = 1 }) {
  return (
    <svg className={`${P}__fleur`} viewBox="-20 -20 40 40" style={{ '--taille': taille }} aria-hidden="true" focusable="false">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-9" rx="6.5" ry="9" fill={teinte} transform={`rotate(${a})`} />
      ))}
      <circle r="5.5" fill={coeur} />
    </svg>
  );
}

const TEINTES = ['#9775fa', '#f783ac', '#ffd43b', '#74c0fc', '#ff922b'];

/** Le mot juste repiqué dans la phrase, à la place de l'ancien. */
function Repiquage({ phrase, ancien, nouveau }) {
  const coupe = trouverMot(phrase, ancien);
  if (!coupe) return null;
  return (
    <p className={`${P}__repiquee`}>
      {coupe[0]}
      <span className={`${P}__eclos`}>{nouveau}</span>
      {coupe[2]}
    </p>
  );
}

/** Ce que la serre montre, selon la sorte de manche. */
function Floraison({ m }) {
  const sorte = String(m.consigne ?? '');
  const q = String(m.question);
  const bonne = laBonne(m);

  if (sorte === 'synonyme-6e') {
    const r = /^« (.+) » Un synonyme de « (.+) » :$/.exec(q);
    if (r) return <Repiquage phrase={r[1]} ancien={r[2]} nouveau={bonne} />;
  }
  if (sorte === 'polysemie-6e') {
    const mot = /« ([^«»]+) » veut dire/.exec(q)?.[1];
    return (
      <div className={`${P}__dico`}>
        <p className={`${P}__entree`}>{mot ?? ''}</p>
        <ol className={`${P}__sens`}>
          {m.choix.map((c) => (
            <li key={c.cle} className={c.cle === m.bonne ? 'est-ici' : ''}>
              {c.libelle}
              {c.cle === m.bonne && <span className={`${P}__ici`}> ← ici</span>}
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (sorte === 'formation-6e') {
    const mot = /« ([^«»]+) »/.exec(q)?.[1];
    const coeur = bonne.replace(/^-|-$/g, '');
    const i = mot ? mot.indexOf(coeur) : -1;
    if (mot && coeur && i >= 0 && !/veut dire/.test(q)) {
      const avant = mot.slice(0, i);
      const apres = mot.slice(i + coeur.length);
      return (
        <p className={`${P}__decoupe`}>
          {avant && <span className={`${P}__morceau`}>{avant}</span>}
          <span className={`${P}__morceau ${P}__morceau--juste`}>{coeur}</span>
          {apres && <span className={`${P}__morceau`}>{apres}</span>}
        </p>
      );
    }
    return <p className={`${P}__repiquee`}><span className={`${P}__eclos`}>{bonne}</span></p>;
  }
  if (sorte === 'sentiment-5e') {
    return (
      <p className={`${P}__humeur`}>
        <span className={`${P}__emoji`} aria-hidden="true">{EMOTIONS[bonne] ?? '🌸'}</span>
        <span className={`${P}__eclos`}>{bonne}</span>
      </p>
    );
  }
  if (sorte === 'gradation-5e') {
    const ligne = GRADATION_5E.find(([fort]) => fort === bonne);
    const ordre = ligne ? [ligne[1], ligne[2], ligne[0]] : [bonne];
    return (
      <ol className={`${P}__gradation`}>
        {ordre.map((mot, i) => (
          <li key={mot} style={{ '--n': i }} className={mot === bonne ? 'est-fort' : ''}>
            <Fleur teinte={TEINTES[i]} taille={0.7 + i * 0.35} />
            <span>{mot}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (sorte === 'jugement-5e') {
    const beau = m.bonne === 'favorable';
    return (
      <p className={`${P}__humeur`}>
        <span className={`${P}__emoji`} aria-hidden="true">{beau ? '☀️' : '🌧️'}</span>
        <span className={`${P}__eclos`}>{beau ? 'Un jugement favorable : on fait l’éloge.' : 'Un jugement défavorable : on critique.'}</span>
      </p>
    );
  }
  if (sorte === 'connotation-4e') {
    const places = ['pejoratif', 'neutre', 'melioratif'];
    return (
      <div className={`${P}__jauge`}>
        {places.map((p) => (
          <span key={p} className={`${P}__cran${p === m.bonne ? ' est-ici' : ''}`}>
            {{ pejoratif: 'péjoratif', neutre: 'neutre', melioratif: 'mélioratif' }[p]}
          </span>
        ))}
      </div>
    );
  }
  if (sorte === 'denotation-4e' || sorte === 'evocation-4e') {
    const mot = /« ([^«»]+) »/.exec(q)?.[1];
    const ligne = DENOTATIONS_4E.find(([x]) => x === mot);
    if (ligne) {
      return (
        <div className={`${P}__dico`}>
          <p className={`${P}__entree`}>{mot}</p>
          <p className={`${P}__ligne${sorte === 'denotation-4e' ? ' est-ici' : ''}`}><strong>désigne :</strong>{` ${ligne[1]}`}</p>
          <p className={`${P}__ligne${sorte === 'evocation-4e' ? ' est-ici' : ''}`}><strong>évoque :</strong>{` ${ligne[2]}`}</p>
        </div>
      );
    }
  }
  if (sorte === 'relation-4e') {
    const [a, b] = q.split(' / ');
    const signe = {
      synonymes: '=', antonymes: '≠', homonymes: '🔊', paronymes: '≈',
    }[m.bonne] ?? '·';
    return (
      <p className={`${P}__paire`}>
        <span className={`${P}__eclos`}>{a}</span>
        <span className={`${P}__signe`} aria-hidden="true">{signe}</span>
        <span className={`${P}__eclos`} style={{ '--n': 1 }}>{b}</span>
        <span className={`${P}__nom-relation`}>{bonne}</span>
      </p>
    );
  }
  if (sorte === 'passe-partout-3e' || sorte === 'verbe-precis-3e') {
    const ancien = entreCrochets(q);
    return (
      <p className={`${P}__echange`}>
        <span className={`${P}__fane`}>{ancien}</span>
        <span className={`${P}__fleche`} aria-hidden="true">→</span>
        <span className={`${P}__eclos`}>{bonne}</span>
      </p>
    );
  }
  if (sorte === 'hyperonyme-3e') {
    const mots = q.replace(/ : ce sont…$/, '').split(', ');
    return (
      <div className={`${P}__bouquet`}>
        <div className={`${P}__tiges`}>
          {mots.map((mot, i) => (
            <span key={mot} className={`${P}__brin`} style={{ '--n': i }}>
              <Fleur teinte={TEINTES[i % TEINTES.length]} taille={0.9} />
              <span>{mot}</span>
            </span>
          ))}
        </div>
        <span className={`${P}__ruban`}>{bonne}</span>
      </div>
    );
  }
  return <p className={`${P}__repiquee`}><span className={`${P}__eclos`}>{bonne}</span></p>;
}

/** Les verrières de la serre et les suspensions fleuries qui se balancent. */
function Verriere() {
  return (
    <div className={`${P}__verriere`} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`${P}__suspension`} style={{ '--n': i }}>
          <Fleur teinte={TEINTES[i]} taille={0.8} />
        </span>
      ))}
    </div>
  );
}

export function QuestionMotJuste({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-fleurie' : ''}`}>
      <Verriere />
      <div className={`${P}__ardoise`}>
        <p className={`${P}__phrase`}><Designe texte={m.question} classe={`${P}__designe`} /></p>
      </div>
      {termine && (
        <div className={`${P}__plate-bande`} role="status">
          <Floraison m={m} />
        </div>
      )}
    </div>
  );
}

/** Les pots de fleurs : on cueille le mot juste. */
export function PotsMotJuste({ choix, fautes, choisir }) {
  return (
    <Boutons
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      prefixe={P}
      etiquette="Cueille le mot juste"
      rendu={(c, i) => (
        <>
          <span className={`${P}__tige`} aria-hidden="true"><Fleur teinte={TEINTES[i % TEINTES.length]} /></span>
          <span className={`${P}__pot`}>{c.libelle}</span>
        </>
      )}
    />
  );
}
