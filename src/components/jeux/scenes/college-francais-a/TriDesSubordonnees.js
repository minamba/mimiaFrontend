import { Boutons, decouper, laBonne, trouverMot } from './commun';

/**
 * LA TEINTURERIE AUX GLYCINES — « Le tri des subordonnées » (5e → 3e). La
 * couverture : un atelier de teinturier sous les glycines, des bassins de
 * teinture en cascade, violets et turquoise, des étoffes qui sèchent. Trier
 * une subordonnée, c'est la plonger dans le bon bain.
 *   - LA QUESTION : la phrase est une bannière d'étoffe pendue à la poutre ; la
 *     subordonnée entre crochets y est une bande ÉCRUE, pas encore teinte ;
 *   - LES RÉPONSES : des cuves de teinture où l'eau colorée ondule — on y
 *     plonge la bande ;
 *   - APRÈS LA RÉPONSE : la bande prend la couleur de sa nature (relative,
 *     complétive, circonstancielle de cause, de but…) et son nom s'y coud ;
 *     l'antécédent ou le verbe complété s'allume dans la phrase, le
 *     subordonnant se glisse dans son trou.
 */

const P = 'sc-tri-des-subordonnees';

/** La couleur de chaque bain, et le nom qui se coud sur la bande. */
const BAINS = {
  relative: { teinte: '#9c36b5', nom: 'relative' },
  conjonctive: { teinte: '#0c8599', nom: 'conjonctive' },
  completive: { teinte: '#0c8599', nom: 'complétive' },
  circonstancielle: { teinte: '#e8590c', nom: 'circonstancielle' },
  principale: { teinte: '#364fc7', nom: 'principale' },
  independante: { teinte: '#495057', nom: 'indépendante' },
  temps: { teinte: '#1971c2', nom: 'temps' },
  cause: { teinte: '#c92a2a', nom: 'cause' },
  consequence: { teinte: '#e67700', nom: 'conséquence' },
  but: { teinte: '#2b8a3e', nom: 'but' },
  condition: { teinte: '#7048e8', nom: 'condition' },
  concession: { teinte: '#d6336c', nom: 'concession' },
  cod: { teinte: '#0c8599', nom: 'COD du verbe' },
  cdn: { teinte: '#9c36b5', nom: 'complément de l’antécédent' },
  cc: { teinte: '#e8590c', nom: 'complément circonstanciel' },
};

/** Les cuves des réponses : des couleurs de bain, sans rapport avec la réponse. */
const CUVES = ['#9775fa', '#22b8cf', '#f783ac', '#ffa94d', '#69db7c'];

/** Le bain de la bande, selon la sorte de manche : la nature, le sens, ou la fonction. */
function bainDe(m) {
  const sorte = String(m.consigne ?? '');
  if (/^(nature|sens|fonction)-/.test(sorte)) return BAINS[m.bonne] ?? null;
  if (sorte === 'antecedent-5e') return BAINS.relative;
  if (sorte === 'verbe-complete-5e') return BAINS.conjonctive;
  return null;
}

/** Ce qui s'allume dans la phrase, hors de la bande : l'antécédent, ou le verbe complété. */
function motAllume(m) {
  const sorte = String(m.consigne ?? '');
  if (sorte === 'antecedent-5e' || sorte === 'verbe-complete-5e') return m.bonne;
  return null;
}

/** La bannière : la phrase, sa bande écrue — ou teinte, une fois la réponse donnée. */
function Banniere({ m, termine }) {
  const bain = termine ? bainDe(m) : null;
  const allume = termine ? motAllume(m) : null;
  const sorte = String(m.consigne ?? '');
  return decouper(m.question).map((p, i) => {
    if (p.designe) {
      return (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`${P}__bande${bain ? ' est-teinte' : ''}`}
          style={bain ? { '--teinte': bain.teinte } : undefined}
          data-nom={bain?.nom}
        >
          {p.texte}
        </span>
      );
    }
    const coupe = allume ? trouverMot(p.texte, allume) : null;
    if (!coupe) {
      // eslint-disable-next-line react/no-array-index-key
      return <span key={i}>{p.texte}</span>;
    }
    return (
      // eslint-disable-next-line react/no-array-index-key
      <span key={i}>
        {coupe[0]}
        <mark className={`${P}__allume`} data-nom={sorte === 'antecedent-5e' ? 'antécédent' : 'verbe complété'}>{coupe[1]}</mark>
        {coupe[2]}
      </span>
    );
  });
}

/** Sous la bannière : ce que le bain apprend. */
function Etiquette({ m }) {
  const sorte = String(m.consigne ?? '');
  const bonne = laBonne(m);
  if (sorte === 'subordonnant-4e') {
    const [sens, phrase] = String(m.question).split(' : ');
    if (!phrase || !phrase.includes('…')) return null;
    const [avant, apres] = phrase.split('…');
    // « pour qu’ » se colle au mot suivant.
    const colle = /’$/.test(bonne);
    return (
      <p className={`${P}__teinte`}>
        {avant}
        <span className={`${P}__subordonnant`} data-nom={sens}>{bonne}</span>
        {colle ? apres.trimStart() : apres}
      </p>
    );
  }
  if (sorte === 'propositions-3e') {
    const n = Number(m.bonne) || 1;
    return (
      <div className={`${P}__sechoir`}>
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`${P}__etoffe`} style={{ '--n': i, '--teinte': CUVES[i % CUVES.length] }} />
        ))}
        <p className={`${P}__legende`}>{`${n} verbes conjugués : ${n} propositions.`}</p>
      </div>
    );
  }
  if (sorte === 'antecedent-5e') {
    return <p className={`${P}__legende`}>{`La relative complète le nom « ${bonne} » : c’est son antécédent.`}</p>;
  }
  if (sorte === 'verbe-complete-5e') {
    return <p className={`${P}__legende`}>{`La conjonctive complète le verbe « ${bonne} » de la principale.`}</p>;
  }
  if (sorte === 'nature-5e') {
    return (
      <p className={`${P}__legende`}>
        <strong>{`${bonne}. `}</strong>
        {m.bonne === 'relative'
          ? 'Le mot qui l’introduit remplace un nom : c’est un pronom relatif.'
          : '« Que » ne remplace aucun nom : c’est une conjonction de subordination.'}
      </p>
    );
  }
  return <p className={`${P}__legende`}>{bonne}</p>;
}

/** Les grappes de glycine qui pendent de la poutre. */
function Glycines() {
  return (
    <div className={`${P}__glycines`} aria-hidden="true">
      {[0, 1].map((i) => <span key={i} className={`${P}__grappe`} style={{ '--n': i }} />)}
    </div>
  );
}

export function QuestionTri({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-teint' : ''}`}>
      <Glycines />
      <div className={`${P}__poutre`} aria-hidden="true" />
      <div className={`${P}__etendard`}>
        <p className={`${P}__phrase`}><Banniere m={m} termine={termine} /></p>
      </div>
      {termine && (
        <div className={`${P}__atelier`} role="status">
          <Etiquette m={m} />
        </div>
      )}
    </div>
  );
}

/** Les cuves de teinture : on y plonge la bande. */
export function CuvesTri({ choix, fautes, choisir }) {
  return (
    <Boutons
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      prefixe={P}
      etiquette="Choisis la cuve"
      styleDe={(c, i) => ({ '--bain': CUVES[i % CUVES.length] })}
      rendu={(c) => (
        <>
          <span className={`${P}__eau`} aria-hidden="true" />
          <span className={`${P}__planche`}>{c.libelle}</span>
        </>
      )}
    />
  );
}
