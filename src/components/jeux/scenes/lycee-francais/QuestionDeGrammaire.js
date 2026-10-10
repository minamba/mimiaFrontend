import { Fragment } from 'react';
import { INDIRECTES, NEGATIONS_MOYENS, PREFIXES } from '../../../../lib/jeux/lycee/question-de-grammaire';
import { libelleBon, lignesDe, surligner } from './commun';

/**
 * LA SERRE DE GRAMMAIRE — « La question de grammaire » (1re). La couverture :
 * une grande serre de verre et de fer forgé, des paniers fleuris suspendus,
 * le soleil couchant. La scène la reprend :
 *   - LA QUESTION : la phrase sur une vitre dépolie de la serre, sous ses
 *     arches ; la subordonnée y pousse comme une branche greffée (le texte
 *     entre crochets, sans crochets) ; deux paniers fleuris se balancent ;
 *   - LES RÉPONSES : des étiquettes de jardinier, plantées sur leur tuteur
 *     (`objets`) ;
 *   - APRÈS LA RÉPONSE : la fiche d'analyse du botaniste. La subordonnée est
 *     cueillie, son mot subordonnant allumé, et son étiquette s'y accroche ;
 *     la négation, l'interrogation ou le mot à classer s'allument dans la
 *     phrase ; la question directe se transforme sous nos yeux en question
 *     rapportée (tu → je, plus d'inversion, plus de point d'interrogation).
 * Avant la réponse, rien n'est allumé : la phrase seule.
 */

const P = 'sc-question-de-grammaire';

/** Les mots qui ouvrent une subordonnée, les plus longs d'abord. */
const SUBORDONNANTS = [
  'quand bien même', 'sous prétexte qu’', 'étant donné qu', 'à condition qu', 'si bien qu', 'de sorte qu', 'parce qu',
  'au cas où', 'pourvu qu', 'afin qu', 'bien qu', 'pour qu', 'même s’', 'dès qu', 'puisqu', 'quoiqu', 'comme', 'quand',
  'pourquoi', 'si riche', 'dont', 'où', 'qui', 'qu', 'si', 's’',
];

/** Le début de la subordonnée qui la relie au reste de la phrase. */
function subordonnantDe(sub) {
  const bas = sub.toLowerCase();
  const trouve = SUBORDONNANTS.find((s) => bas.startsWith(s));
  if (!trouve) return sub.split(' ')[0];
  if (trouve === 'si riche') return 'si';
  // « parce qu » → « parce que » ou « parce qu’ » : on prend la suite jusqu'à l'espace ou l'apostrophe.
  const fin = /^[’']/.test(sub.slice(trouve.length)) ? trouve.length + 1 : trouve.length;
  const mot = sub.slice(0, fin);
  return /qu$/i.test(mot) ? sub.slice(0, fin + (sub[fin] === 'e' ? 1 : 0)) : mot;
}

/**
 * Les mots de la négation, selon sa valeur : le « ne » explétif est seul ; la
 * restriction, c'est « ne… que » ; la totale, « ne… pas » ; la partielle,
 * « ne… jamais, plus, rien, personne, aucun ».
 */
const NEGATIONS = {
  expletif: /^(ne|n’)$/i,
  restriction: /^(ne|n’|que|qu’)$/i,
  totale: /^(ne|n’|pas|point)$/i,
  partielle: /^(ne|n’|jamais|plus|rien|personne|aucun|aucune|nul|nulle)$/i,
};
const NEGATION = /^(ne|n’|pas|point|jamais|plus|rien|personne|aucun|aucune)$/i;

/** Les marques de l'interrogation : est-ce que, le sujet inversé, le mot interrogatif, le point. */
const INTERROGATION = /(est-ce que|est-ce qu’|-t-(?:il|elle|on)|-(?:tu|je|vous|nous|il|elle|ils|elles)(?![\p{L}])|(?<![\p{L}’-])(?:si|où|quand|pourquoi|qui|quel|quelle|quels|quelles|lequel|laquelle|que|qu’|quoi|comment)(?![\p{L}])|\?)/giu;

/** Le mot à classer (« → « que » »), désigné par la question. */
const DESIGNE = /\n\n→ « (.+) »$/;

/** Le mot qui porte la négation, pour « Un préfixe négatif » ou « Un mot de sens négatif ». */
const MOT_NEGATIF = {
  'Ce manuscrit est illisible.': 'illisible',
  'Le héros se montre incapable d’agir.': 'incapable',
  'Cette scène paraît irréelle.': 'irréelle',
  'Le fils désobéit à son père.': 'désobéit',
  'Le jeune homme reste immobile.': 'immobile',
  'Le roi refuse la grâce du condamné.': 'refuse',
  'Le père interdit ce mariage.': 'interdit',
  'Le témoin principal est absent.': 'absent',
  'Il est parti sans dire au revoir.': 'sans',
  'La reine ignore la vérité.': 'ignore',
};

const marque = (role) => `${P}__allume ${P}__allume--${role}`;

/** Les mots d'une phrase qui répondent à une règle, allumés un à un. */
function allumerMots(phrase, test, role) {
  // « n’a » se coupe en « n’ » et « a » : l'apostrophe ferme le mot.
  return phrase.split(/([\p{L}-]+’?)/u).map((bout, i) => (test(bout)
    // eslint-disable-next-line react/no-array-index-key
    ? <mark key={i} className={marque(role)} style={{ '--k': i }}>{bout}</mark>
    // eslint-disable-next-line react/no-array-index-key
    : <Fragment key={i}>{bout}</Fragment>));
}

/** La phrase et sa subordonnée : « [Si tu relis ce poème], tu… » */
function decouperCrochets(phrase) {
  const r = /^(.*?)\[([^\]]+)\](.*)$/.exec(phrase);
  return r ? { avant: r[1], sub: r[2], apres: r[3] } : null;
}

/** La phrase de la vitre : la subordonnée en branche greffée, la négation ou l'interrogation allumées. */
function Phrase({ m, phrase, termine }) {
  const c = decouperCrochets(phrase);
  if (c) {
    const sub = subordonnantDe(c.sub);
    return (
      <>
        {c.avant}
        <span className={`${P}__greffe${termine ? ` ${P}__greffe--cueillie` : ''}`}>
          {termine && c.sub.startsWith(sub) ? (
            <>
              <mark className={marque('subordonnant')}>{sub}</mark>
              {c.sub.slice(sub.length)}
            </>
          ) : c.sub}
        </span>
        {c.apres}
      </>
    );
  }
  if (!termine) return phrase;
  switch (m.consigne) {
    case 'negation-type':
      return allumerMots(phrase, (mot) => (NEGATIONS[m.bonne] ?? NEGATION).test(mot), 'negation');
    case 'negation-moyen': {
      const mot = MOT_NEGATIF[phrase];
      return mot ? surligner(phrase, [[mot, 'negation']], marque) : allumerMots(phrase, (x) => NEGATION.test(x), 'negation');
    }
    case 'valeur': {
      // La question citée, entre guillemets : c'est elle qui fait autre chose que demander.
      const citee = /« [^»]+ »/.exec(phrase)?.[0];
      return citee ? surligner(phrase, [[citee, 'interrogation']], marque) : phrase;
    }
    case 'interro-type':
    case 'marque': {
      const morceaux = [...phrase.matchAll(INTERROGATION)].map((r) => [r[0], 'interrogation']);
      return surligner(phrase, morceaux, marque);
    }
    case 'mode':
      return surligner(phrase, [['…', 'trou']], marque);
    default:
      return phrase;
  }
}

/** La vitre et son texte : chaque ligne de la question, le mot désigné souligné. */
function Vitre({ m, termine }) {
  const lignes = lignesDe(m.question);
  const designe = DESIGNE.exec(m.question)?.[1];
  return (
    <div className={`${P}__vitre`}>
      <p className={`${P}__texte`}>
        {lignes.map((l, i) => {
          let contenu;
          // Une ligne vide ne sépare que deux blocs : la note suit la phrase, sans trou.
          if (l.trim() === '') return null;
          if (i === 0) {
            contenu = designe && m.consigne !== 'indirecte'
              ? surligner(l, [[designe, termine ? 'designe-allume' : 'designe']], marque)
              : <Phrase m={m} phrase={l} termine={termine} />;
          } else contenu = <span className={`${P}__note`}>{l}</span>;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={i}>
              {contenu}
              {i < lignes.length - 1 ? '\n' : null}
            </Fragment>
          );
        })}
      </p>
    </div>
  );
}

/** La question rapportée, construite : la question directe, ses trois changements, la phrase obtenue. */
function Transformation({ m }) {
  const directe = /« (.+) »/.exec(m.question)?.[1] ?? '';
  const bonne = INDIRECTES.find(([d]) => d === directe)?.[1] ?? m.bonne;
  return (
    <div className={`${P}__transformation`}>
      <span className={`${P}__avant`}>{`« ${directe} »`}</span>
      <ul className={`${P}__changements`} aria-label="Ce qui change">
        <li style={{ '--k': 0 }}>tu → je</li>
        <li style={{ '--k': 1 }}>plus d’inversion ni de « est-ce que »</li>
        <li style={{ '--k': 2 }}>« ? » → « . »</li>
      </ul>
      <span className={`${P}__fleche`} aria-hidden="true">{bonne ? '↓' : ''}</span>
    </div>
  );
}

/** Le contraire formé par préfixe : le préfixe se détache du mot. */
function Prefixe({ m }) {
  const base = /« (.+) »/.exec(m.question)?.[1];
  const ligne = PREFIXES.find(([mot]) => mot === base);
  if (!ligne || !ligne[1].endsWith(base)) return null;
  const pre = ligne[1].slice(0, ligne[1].length - base.length);
  return (
    <p className={`${P}__prefixe`}>
      <mark className={marque('negation')}>{pre}</mark>
      <span className={`${P}__plus`} aria-hidden="true">+</span>
      <span>{base}</span>
    </p>
  );
}

/** Ce que la fiche dit de la phrase, une fois la réponse donnée. */
function noteDe(m) {
  const c = decouperCrochets(lignesDe(m.question)[0]);
  if (c) return `Le mot « ${subordonnantDe(c.sub)} » rattache la subordonnée au reste de la phrase.`;
  if (m.consigne === 'negation-moyen' && MOT_NEGATIF[m.question]) return `La négation tient dans « ${MOT_NEGATIF[m.question]} ».`;
  if (m.consigne === 'negation-moyen' && NEGATIONS_MOYENS.some(([p]) => p === m.question)) return 'La négation tient dans « ne… » et son second mot.';
  return null;
}

/** La fiche d'analyse du botaniste : l'étiquette de la bonne réponse, et ce qui la justifie. */
function Fiche({ m }) {
  const note = noteDe(m);
  return (
    <div className={`${P}__fiche`} role="status">
      <span className={`${P}__fiche-titre`}>Fiche d’analyse</span>
      {m.consigne === 'indirecte' && <Transformation m={m} />}
      {m.consigne === 'prefixe' && <Prefixe m={m} />}
      <span className={`${P}__etiquette`}>
        <span className={`${P}__ficelle`} aria-hidden="true" />
        {m.consigne === 'indirecte' ? libelleBon(m).replace(/^… /, 'Il me demande ') : libelleBon(m)}
      </span>
      {note && <span className={`${P}__fiche-note`}>{note}</span>}
    </div>
  );
}

/** La serre : ses arches de fer forgé, ses vitres, ses paniers fleuris. */
function Serre() {
  return (
    <div className={`${P}__serre`} aria-hidden="true">
      <svg className={`${P}__arches`} viewBox="0 0 400 60" preserveAspectRatio="none" focusable="false">
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${i * 100} 60 Q ${i * 100 + 50} -10 ${i * 100 + 100} 60`} />
        ))}
        <path d="M0 58 H400" />
      </svg>
      {[0, 1].map((i) => (
        <span key={i} className={`${P}__panier ${P}__panier--${i ? 'droite' : 'gauche'}`}>
          <span className={`${P}__chaine`} />
          <span className={`${P}__fleurs`} />
          <span className={`${P}__corbeille`} />
        </span>
      ))}
    </div>
  );
}

export function QuestionGrammaire({ m, termine }) {
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <Serre />
      <Vitre m={m} termine={termine} />
      {termine && <Fiche m={m} />}
    </div>
  );
}
