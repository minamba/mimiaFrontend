import { FOCALISATIONS, PRESENTS, PROCEDES } from '../../../../lib/jeux/lycee/procedes-et-effets';
import { libelleBon, lignesDe, surligner } from './commun';

/**
 * LE LABORATOIRE DU PRISME — « Procédés et effets » (1re). La couverture : un
 * cabinet de cristal, des prismes, des miroirs, et des rayons arc-en-ciel qui
 * se croisent sur le sol. La métaphore de l'exercice est là : un PROCÉDÉ est
 * un prisme, qui transforme la lumière blanche du texte en un EFFET coloré.
 *   - LA QUESTION : l'extrait sur une plaque de cristal ; au-dessus, un prisme
 *     où passe un rayon blanc ;
 *   - LES RÉPONSES : des éclats de cristal irisés (`objets`) ;
 *   - APRÈS LA RÉPONSE : LA DÉCOMPOSITION. Le texte (lumière blanche) entre
 *     dans le prisme qui porte le nom du procédé, et en ressort en arc-en-ciel
 *     vers l'effet ; dans l'extrait, le procédé s'allume (les mots répétés, les
 *     contraires, les s qui sifflent…). Le présent se place sur une ligne du
 *     temps ; la focalisation dit où se tient le regard.
 * Avant la réponse, le prisme reste neutre et l'extrait nu.
 */

const P = 'sc-procedes-et-effets';

/** Ce que chaque procédé allume dans son extrait. */
const ALLUMER = {
  anaphore: /je t’attends|mon pays/gi,
  gradation: /murmura|parla|cria|(?<![\p{L}])(?:Va|cours|vole)(?![\p{L}])/gu,
  hyperbole: /cent ans|un million de fois/g,
  accumulation: /des (?:cris|pleurs|rires|chants|appels)/g,
  antithese: /(?<![\p{L}])(?:jour|nuit|rit|pleure|brûle|gèle)(?![\p{L}])/gu,
  oxymore: /silence assourdissant|obscure clarté/g,
  chiasme: /manger|vivre|aimait la vie|la vie l’aimait/g,
  comparaison: /(?<![\p{L}])(?:comme|pareille à)(?![\p{L}])/gu,
  metaphore: /deux étoiles|un long fleuve/g,
  personnification: /dort|soupire|pleuraient/g,
  litote: /ne te hais point|n’est pas mauvais du tout/g,
  euphemisme: /nous a quittés|rendu le dernier soupir/g,
  alliteration: /s+/gi,
  apostrophe: /Ô nuit/g,
  rhetorique: /\?/g,
  preterition: /Je ne vous parlerai pas/g,
};

/** Le procédé d'une manche : la bonne réponse, ou celui que nomme « Procédé : … ». */
function procedeDe(m) {
  if (m.consigne === 'procede') return m.bonne;
  const nom = /\nProcédé : (.+)$/.exec(m.question)?.[1];
  if (!nom) return null;
  const cle = Object.keys(PROCEDES).find((k) => nom.startsWith(PROCEDES[k]));
  return cle ?? null;
}

/** Le nom à graver sur le prisme. */
function nomDuPrisme(m) {
  if (m.consigne === 'procede') return PROCEDES[m.bonne];
  if (m.consigne === 'effet') return /\nProcédé : (.+)$/.exec(m.question)?.[1] ?? '';
  if (m.consigne === 'focalisation') return FOCALISATIONS[m.bonne];
  if (m.consigne === 'present') return PRESENTS[m.bonne];
  return libelleBon(m);
}

/** Ce que voit le lecteur à la sortie du prisme. */
const SORTIES = {
  interne: 'On voit par les yeux du personnage, on partage ce qu’il ressent.',
  externe: 'On voit du dehors, comme une caméra : le personnage garde son mystère.',
  zero: 'Le narrateur sait tout : les pensées, l’avenir, ce qui se passe ailleurs.',
  verite: 'Vrai de tout temps : une loi, un proverbe.',
  enonciation: 'Vrai maintenant, au moment où l’on parle.',
  narration: 'Un fait passé, raconté au présent pour le rendre plus vif.',
  habitude: 'Une action qui se répète.',
};

/** La ligne du temps du présent : où tombe l'action ? */
function LigneDuTemps({ valeur }) {
  return (
    <svg className={`${P}__temps`} viewBox="0 0 300 54" aria-hidden="true" focusable="false">
      <path d="M10 30 H290" stroke="#fff" strokeWidth="3" />
      <path d="M282 24 L292 30 L282 36" fill="none" stroke="#fff" strokeWidth="3" />
      <path d="M150 20 V40" stroke="#ffe066" strokeWidth="3" />
      <text x="150" y="14" fill="#ffe066" fontSize="11" textAnchor="middle">maintenant</text>
      {valeur === 'enonciation' && <circle className={`${P}__point`} cx="150" cy="30" r="8" fill="#ff7ab8" />}
      {valeur === 'verite' && <rect className={`${P}__point`} x="14" y="25" width="270" height="10" rx="5" fill="#7ef0c4" opacity="0.85" />}
      {valeur === 'narration' && (
        <>
          <circle className={`${P}__point`} cx="70" cy="30" r="8" fill="#ff7ab8" />
          <path d="M80 44 Q115 54 146 42" fill="none" stroke="#ff7ab8" strokeWidth="2" strokeDasharray="4 3" />
        </>
      )}
      {valeur === 'habitude' && [40, 85, 130, 175, 220, 265].map((x, i) => (
        <circle key={x} className={`${P}__point`} cx={x} cy="30" r="6" fill="#7fb3ff" style={{ animationDelay: `${0.3 + i * 0.12}s` }} />
      ))}
    </svg>
  );
}

/** La décomposition : le texte blanc, le prisme du procédé, l'arc-en-ciel, l'effet. */
function Decomposition({ m }) {
  let sortie = null;
  if (m.consigne === 'effet') sortie = libelleBon(m);
  else if (m.consigne === 'focalisation' || m.consigne === 'present') sortie = SORTIES[m.bonne];
  return (
    <div className={`${P}__banc`} role="status">
      <div className={`${P}__optique`} aria-hidden="true">
        <span className={`${P}__blanc`} />
        <svg className={`${P}__prisme`} viewBox="0 0 80 70" focusable="false">
          <defs>
            <linearGradient id={`${P}-verre`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#c7a6ff" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <path d="M40 4 L76 66 L4 66 Z" fill={`url(#${P}-verre)`} stroke="#fff" strokeWidth="2" />
        </svg>
        <span className={`${P}__arc`} />
      </div>
      <strong className={`${P}__nom`}>{nomDuPrisme(m)}</strong>
      {m.consigne === 'present' && <LigneDuTemps valeur={m.bonne} />}
      {sortie && <span className={`${P}__effet`}>{sortie}</span>}
    </div>
  );
}

const marque = () => `${P}__allume`;

export function QuestionProcedes({ m, termine }) {
  const procede = termine ? procedeDe(m) : null;
  const regle = procede ? ALLUMER[procede] : null;
  const lignes = lignesDe(m.question);
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__rayon`} aria-hidden="true"><span /></div>
      <div className={`${P}__plaque`}>
        <p className={`${P}__texte`}>
          {lignes.map((l, i) => {
            if (l.trim() === '') return null;
            let contenu = l;
            if (/^Procédé : /.test(l)) contenu = <span className={`${P}__procede`}>{l}</span>;
            else if (regle) contenu = surligner(l, [...l.matchAll(regle)].map((r) => [r[0], 'x']), marque);
            return (
              // eslint-disable-next-line react/no-array-index-key
              <span key={i} className={`${P}__ligne`}>
                {contenu}
                {i < lignes.length - 1 ? '\n' : null}
              </span>
            );
          })}
        </p>
      </div>
      {termine && <Decomposition m={m} />}
    </div>
  );
}
