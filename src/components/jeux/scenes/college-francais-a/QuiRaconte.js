import { Boutons, laBonne } from './commun';

/**
 * LA CHAMBRE NOIRE — « Qui raconte ? » (6e) et « Moi, je raconte » (3e). La
 * couverture : une jeune photographe règle une grande chambre de bois devant
 * les montagnes. Raconter, c'est cadrer : QUI tient l'appareil, et D'OÙ ?
 *   - LA QUESTION : l'extrait dans le viseur de l'appareil (coins de cadrage,
 *     point rouge qui clignote), l'objectif dont le diaphragme respire ;
 *   - LES RÉPONSES : des plaques de projection, chacune avec son pictogramme
 *     (l'œil du personnage, la caméra posée dehors, le regard qui voit tout ;
 *     la plume de l'auteur, celle du narrateur, l'enfant d'autrefois…) ;
 *   - APRÈS LA RÉPONSE : on voit d'où l'on filme — le « je » du narrateur
 *     s'allume dans l'extrait, ou au contraire les paroles entre guillemets
 *     (le « je » d'un personnage, pas du narrateur) ; un petit schéma place la
 *     caméra (dans la tête d'un personnage, dehors, au-dessus de tous) ; en 3e,
 *     le triptyque auteur / narrateur / personnage s'éclaire.
 */

const P = 'sc-qui-raconte-college';

const PICTOS = {
  personnage: '🗣️',
  exterieur: '🎥',
  interne: '👁️',
  externe: '📷',
  omniscient: '🌍',
  autobiographie: '📖',
  biographie: '👤',
  roman: '✒️',
  journal: '📔',
  memoires: '🏛️',
  auteur: '✍️',
  narrateur: '🖋️',
};

const GENRES = {
  autobiographie: 'L’auteur raconte sa propre vie : auteur, narrateur et personnage ne font qu’un.',
  biographie: 'Quelqu’un raconte la vie d’un autre.',
  roman: 'Un « je » inventé : le personnage n’est pas l’auteur.',
  journal: 'Jour après jour, des pages datées, écrites sur le moment.',
  memoires: 'Un témoin raconte les grands événements qu’il a vécus.',
};

const VUES = {
  interne: 'La caméra est dans la tête d’un seul personnage : ce qu’il voit, ce qu’il ressent.',
  externe: 'La caméra est posée dehors : des gestes, des paroles, aucune pensée.',
  omniscient: 'La caméra est au-dessus de tous : elle voit dans chaque tête, et l’avenir.',
};

/** Les mots du « je » : on les allume hors des paroles entre guillemets. */
const JE = /(\b(?:je|j’|me|m’|moi|mon|ma|mes|nous|notre|nos)\b|J’|Je\b|Moi\b|Mon\b|Ma\b|Mes\b|Nous\b|Notre\b|Nos\b)/;

/** L'extrait, avec soit les « je » du narrateur, soit les paroles des personnages, allumés. */
function Extrait({ texte, allume }) {
  const t = String(texte);
  if (!allume) return t;
  // Les paroles entre guillemets d'abord : elles appartiennent aux personnages.
  return t.split(/(«[^»]*»)/).map((morceau, i) => {
    if (/^«[^»]*»$/.test(morceau)) {
      // eslint-disable-next-line react/no-array-index-key
      return <span key={i} className={allume === 'paroles' ? `${P}__paroles` : undefined}>{morceau}</span>;
    }
    if (allume !== 'je') return morceau;
    return morceau.split(JE).map((x, j) => (j % 2
      // eslint-disable-next-line react/no-array-index-key
      ? <mark key={`${i}-${j}`} className={`${P}__je`}>{x}</mark>
      : x));
  });
}

/** Où se tient la caméra : un petit schéma par point de vue. */
function Schema({ vue }) {
  return (
    <div className={`${P}__schema ${P}__schema--${vue}`} aria-hidden="true">
      <span className={`${P}__perso`} />
      <span className={`${P}__perso`} />
      <span className={`${P}__perso`} />
      <span className={`${P}__camera`}>🎥</span>
    </div>
  );
}

/** Le triptyque de l'autobiographie : qui signe, qui se souvient, qui vit l'histoire. */
function Triptyque({ role }) {
  const volets = [
    { cle: 'auteur', nom: 'L’auteur', quand: 'signe le livre' },
    { cle: 'narrateur', nom: 'Le narrateur', quand: 'se souvient, en écrivant' },
    { cle: 'personnage', nom: 'Le personnage', quand: 'vit les faits, autrefois' },
  ];
  return (
    <div className={`${P}__triptyque`}>
      {volets.map((v) => (
        <div key={v.cle} className={`${P}__volet${v.cle === role ? ' est-ici' : ''}`}>
          <span className={`${P}__picto`} aria-hidden="true">{v.cle === 'personnage' ? '🧒' : PICTOS[v.cle]}</span>
          <strong>{v.nom}</strong>
          <span>{v.quand}</span>
        </div>
      ))}
    </div>
  );
}

function Revelation({ m }) {
  const sorte = String(m.consigne ?? '');
  if (sorte === 'qui-raconte') {
    const personnage = m.bonne === 'personnage';
    return (
      <p className={`${P}__legende`}>
        {personnage
          ? 'Le narrateur dit « je » et vit l’histoire : c’est un narrateur personnage.'
          : (m.aide === 'narrateur-dialogue'
            ? 'Le « je » est dans les paroles, entre guillemets : c’est un personnage qui parle. Le narrateur, lui, reste dehors.'
            : 'Il, elle : le narrateur ne fait pas partie de l’histoire. C’est un narrateur extérieur.')}
      </p>
    );
  }
  if (sorte === 'point-de-vue' || sorte === 'ce-que-sait') {
    return (
      <div className={`${P}__vue`}>
        <Schema vue={m.bonne} />
        <p className={`${P}__legende`}>{VUES[m.bonne] ?? laBonne(m)}</p>
      </div>
    );
  }
  if (sorte === 'qui-est-qui') return <Triptyque role={m.bonne} />;
  if (sorte === 'quel-genre') {
    return (
      <p className={`${P}__legende`}>
        <span className={`${P}__picto`} aria-hidden="true">{PICTOS[m.bonne] ?? '🎞️'}</span>
        <strong>{laBonne(m)}</strong>
        {` — ${GENRES[m.bonne] ?? ''}`}
      </p>
    );
  }
  return (
    <p className={`${P}__legende ${P}__legende--pacte`}>
      <span className={`${P}__picto`} aria-hidden="true">📜</span>
      <strong>{laBonne(m)}</strong>
    </p>
  );
}

/** L'appareil : une chambre de bois, son soufflet, son objectif au diaphragme qui respire. */
function Appareil() {
  return (
    <svg className={`${P}__appareil`} viewBox="0 0 90 80" aria-hidden="true" focusable="false">
      <rect x="4" y="16" width="40" height="44" rx="4" fill="#8a5a2b" stroke="#4d2c0c" strokeWidth="2" />
      <path d="M44 22 L62 26 V50 L44 54 Z" fill="#3d2b1f" />
      <path d="M48 23 V53 M53 24 V52 M58 25 V51" stroke="#5c4433" strokeWidth="1.5" />
      <circle cx="72" cy="38" r="15" fill="#c99a2e" stroke="#6b4a12" strokeWidth="2" />
      <circle className={`${P}__iris`} cx="72" cy="38" r="9" fill="#1c2b3a" />
      <circle cx="68" cy="34" r="2.5" fill="#e7f5ff" opacity="0.8" />
      <rect x="14" y="62" width="20" height="16" fill="#6b4a12" />
      <rect x="10" y="8" width="14" height="8" rx="2" fill="#c99a2e" />
    </svg>
  );
}

export function QuestionQuiRaconte({ m, termine }) {
  const sorte = String(m.consigne ?? '');
  let allume = null;
  if (termine && sorte === 'qui-raconte') allume = m.bonne === 'personnage' ? 'je' : 'paroles';
  return (
    <div className={`${P}${termine ? ' est-developpe' : ''}`}>
      <Appareil />
      <div className={`${P}__viseur`}>
        <span className={`${P}__rec`} aria-hidden="true">REC</span>
        <p className={`${P}__phrase`}><Extrait texte={m.question} allume={allume} /></p>
      </div>
      {termine && (
        <div className={`${P}__tirage`} role="status">
          <Revelation m={m} />
        </div>
      )}
    </div>
  );
}

/** Les plaques de projection : une par réponse, avec son pictogramme. */
export function PlaquesQuiRaconte({
  m, choix, fautes, choisir,
}) {
  // En 3e, « le personnage » est l'enfant d'autrefois, pas le narrateur qui dit je.
  const picto = (cle) => (m?.consigne === 'qui-est-qui' && cle === 'personnage' ? '🧒' : (PICTOS[cle] ?? '🎞️'));
  return (
    <Boutons
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      prefixe={P}
      etiquette="Choisis ta plaque"
      rendu={(c) => (
        <>
          <span className={`${P}__vignette`} aria-hidden="true">{picto(c.cle)}</span>
          <span className={`${P}__titre`}>{c.libelle}</span>
        </>
      )}
    />
  );
}
