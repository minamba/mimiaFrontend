import { MOUVEMENTS } from '../../../../lib/jeux/lycee/mouvements-litteraires';
import { BoutonsChoix, libelleBon } from './commun';

/**
 * L'ARCHIPEL DU CIEL — « Les mouvements littéraires » (2de). La couverture :
 * un balcon de marbre couvert de glycines, et au loin des îles qui flottent
 * dans le ciel du couchant, chacune portant son château. La scène la reprend :
 *   - LA QUESTION : gravée sur la balustrade du balcon ; au-dessus, trois
 *     petites îles dérivent dans le ciel ;
 *   - LES RÉPONSES : des îles volantes (`choix`), qui montent et descendent
 *     doucement, chacune avec son château et sa bannière : on aborde la bonne ;
 *   - APRÈS LA RÉPONSE : la route du ciel, une frise du XVIe au XXe siècle. Les
 *     dix mouvements y flottent à leur époque ; celui de la réponse s'allume
 *     et grandit, et l'on voit qui vient avant lui, qui vient après. Pour une
 *     question de siècle, c'est le siècle qui s'allume.
 * La frise n'apparaît qu'après la réponse : elle placerait le mouvement.
 */

const P = 'sc-mouvements-litteraires';

/** L'époque de chaque mouvement, pour le placer sur la frise (une année repère). */
const EPOQUES = {
  humanisme: 1545,
  baroque: 1600,
  classicisme: 1665,
  lumieres: 1750,
  romantisme: 1825,
  realisme: 1852,
  naturalisme: 1880,
  symbolisme: 1895,
  surrealisme: 1925,
  absurde: 1950,
};

const DEBUT = 1500;
const FIN = 2000;
const SIECLES = [16, 17, 18, 19, 20];
const ROMAINS = {
  16: 'XVIe', 17: 'XVIIe', 18: 'XVIIIe', 19: 'XIXe', 20: 'XXe', 21: 'XXIe',
};
const position = (annee) => `${((annee - DEBUT) / (FIN - DEBUT)) * 100}%`;

/** Le siècle d'une réponse « XIXe siècle » → 19. */
const siecleDe = (texte) => Number(Object.entries(ROMAINS).find(([, r]) => String(texte).startsWith(`${r} `))?.[0]) || null;

/** Une île volante : son rocher, son herbe, son petit château. */
function Ile({ grande = false }) {
  return (
    <svg className={`${P}__ile${grande ? ` ${P}__ile--grande` : ''}`} viewBox="0 0 80 60" aria-hidden="true" focusable="false">
      <path d="M6 30 Q 40 22 74 30 L 60 44 L 48 58 L 38 50 L 28 56 L 18 42 Z" fill="#8a6f8f" />
      <path d="M18 42 L 28 56 L 38 50 L 48 58 L 60 44" fill="none" stroke="#5e4766" strokeWidth="2" />
      <path d="M6 30 Q 40 20 74 30 Q 40 36 6 30 Z" fill="#7cbf6a" />
      <rect x="31" y="14" width="18" height="14" fill="#f4ead8" />
      <rect x="27" y="8" width="7" height="20" fill="#efe2cc" />
      <rect x="46" y="8" width="7" height="20" fill="#efe2cc" />
      <path d="M26 9 L 30.5 2 L 35 9 Z M45 9 L 49.5 2 L 54 9 Z" fill="#8a5cc7" />
      <rect x="37" y="20" width="6" height="8" rx="3" fill="#8a6f8f" />
    </svg>
  );
}

/** Le ciel au-dessus du balcon : trois îles qui dérivent. */
function Ciel() {
  return (
    <div className={`${P}__ciel`} aria-hidden="true">
      {[0, 1, 2].map((i) => <span key={i} className={`${P}__derive`} style={{ '--n': i }}><Ile /></span>)}
    </div>
  );
}

/** La route du ciel : la frise des siècles, les dix îles, la bonne allumée. */
function Frise({ m }) {
  const siecle = m.consigne === 'siecle' ? siecleDe(m.bonne) : null;
  const mouvement = MOUVEMENTS[m.bonne] ? m.bonne : null;
  return (
    <div className={`${P}__frise`} role="status">
      <div className={`${P}__route`}>
        {SIECLES.map((s) => (
          <span
            key={s}
            className={`${P}__siecle${siecle === s ? ` ${P}__siecle--allume` : ''}`}
            style={{ left: position((s - 1) * 100), width: position(DEBUT + 100) }}
          >
            {ROMAINS[s]}
          </span>
        ))}
        {Object.entries(EPOQUES).map(([cle, annee], i) => (
          <span
            key={cle}
            className={`${P}__point${cle === mouvement ? ` ${P}__point--allume` : ''}`}
            style={{ left: position(annee), '--n': i }}
            title={MOUVEMENTS[cle]}
          >
            {cle === mouvement && <Ile grande />}
          </span>
        ))}
      </div>
      <p className={`${P}__arrivee`}>
        {mouvement
          ? `${MOUVEMENTS[mouvement]} — ${mouvement === 'baroque'
            // Le baroque est à cheval sur deux siècles : le dire, plutôt que d'en choisir un.
            ? 'fin du XVIe et début du XVIIe siècle'
            : `${ROMAINS[Math.floor((EPOQUES[mouvement] - 1) / 100) + 1]} siècle`}`
          : libelleBon(m)}
      </p>
    </div>
  );
}

export function QuestionMouvements({ m, termine }) {
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      {termine ? <Frise m={m} /> : <Ciel />}
      <div className={`${P}__balcon`}>
        <p className={`${P}__texte`}>{m.question}</p>
      </div>
    </div>
  );
}

/** Les îles volantes : on aborde la bonne. */
export function ChoixMouvements({ choix, fautes, choisir }) {
  return (
    <BoutonsChoix
      p={P}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      etiquette="Aborde la bonne île"
      deco={() => <Ile />}
    />
  );
}
