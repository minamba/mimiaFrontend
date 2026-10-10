import { enMorceaux, estUnMot } from './outils';

/**
 * POÈME, THÉÂTRE OU RÉCIT ? (CM1) — QUI RACONTE ? (CM2) : LA SCÈNE DU THÉÂTRE
 * (09/10/2026). La couverture du CM1 : un théâtre à rideaux rouges, des
 * projecteurs, un garçon en cape, et trois enseignes — un parchemin et sa
 * plume (poème), deux masques (théâtre), un chemin dans un paysage (récit).
 * Celle du CM2 : une pellicule de film qui déroule une histoire sous les
 * étoiles. La scène :
 *   - LA QUESTION : l'extrait, sur une page posée au milieu de la scène, entre
 *     deux rideaux qui ondulent ; un projecteur balaie la page. L'extrait
 *     garde sa forme, retours à la ligne compris : c'est elle qui répond ;
 *   - LES RÉPONSES : les accessoires suspendus aux cintres par des cordes —
 *     le parchemin, les masques, le livre (au CM2 : celui qui dit « je »,
 *     le conteur qui dit « il ») ; ils se balancent ; le faux tombe et se barre ;
 *   - APRÈS LA RÉPONSE : les rideaux s'ouvrent grand, le projecteur se fixe,
 *     et les INDICES s'allument : les rimes du poème, chaque vers numéroté ;
 *     les noms des personnages et les indications entre parenthèses du
 *     théâtre ; les phrases du récit, l'une après l'autre ; au CM2, les « je »
 *     de celui qui raconte, ou les « il », et le dialogue entre guillemets.
 */

const CLE = 'sc-poeme-theatre-recit';

/** Les rimes : deux vers riment s'ils finissent par les mêmes lettres. */
const finDe = (vers) => {
  const mots = String(vers).toLowerCase().match(/[\p{L}]+/gu) ?? [];
  const dernier = mots[mots.length - 1] ?? '';
  return dernier.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/(e|es|ent)$/, '').slice(-2);
};

function Poeme({ texte }) {
  const vers = texte.split('\n');
  const fins = vers.map(finDe);
  const couleurs = {};
  let n = 0;
  return vers.map((v, i) => {
    const fin = fins[i];
    const rime = fins.filter((f) => f && f === fin).length > 1;
    if (rime && couleurs[fin] === undefined) {
      couleurs[fin] = n;
      n += 1;
    }
    const m = v.match(/^(.*?)([\p{L}’'-]+)([^\p{L}]*)$/u);
    return (
      // eslint-disable-next-line react/no-array-index-key
      <span key={i} className={`${CLE}__vers`} style={{ '--i': i }}>
        <span className={`${CLE}__numero`} data-numero={i + 1} aria-hidden="true" />
        {m ? (
          <>
            {m[1]}
            <span className={`${CLE}__rime${rime ? ` ${CLE}__rime--${couleurs[fin] % 3}` : ''}`}>{m[2]}</span>
            {m[3]}
          </>
        ) : v}
        {i < vers.length - 1 ? '\n' : ''}
      </span>
    );
  });
}

function Theatre({ texte }) {
  const repliques = texte.split('\n');
  return repliques.map((r, i) => {
    const m = r.match(/^([^(.—]+?)(\s*\([^)]*\))?(\.\s*—)(.*)$/u);
    return (
      // eslint-disable-next-line react/no-array-index-key
      <span key={i} className={`${CLE}__replique`} style={{ '--i': i }}>
        {m ? (
          <>
            <span className={`${CLE}__personnage`}>{m[1]}</span>
            {m[2] ? <span className={`${CLE}__didascalie`}>{m[2]}</span> : null}
            {m[3]}
            {m[4]}
          </>
        ) : r}
        {i < repliques.length - 1 ? '\n' : ''}
      </span>
    );
  });
}

function Recit({ texte }) {
  const phrases = texte.match(/[^.!?]+[.!?]+\s*/g) ?? [texte];
  const reste = texte.slice(phrases.join('').length);
  return (
    <>
      {phrases.map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`${CLE}__phrase-recit`} style={{ '--i': i }}>{p}</span>
      ))}
      {reste}
    </>
  );
}

const JE = /^(je|j’|j'|me|m’|m'|moi|mon|ma|mes|nous|nos|notre)$/i;
const IL = /^(il|elle|ils|elles|ses|sa|son|lui|leur)$/i;

/** Au CM2 : les mots de celui qui raconte, et le dialogue entre guillemets, mis à part. */
function QuiRaconte({ texte, bonne }) {
  const parts = texte.split(/(«[^»]*»)/);
  return parts.map((p, i) => {
    if (/^«/.test(p)) {
      // eslint-disable-next-line react/no-array-index-key
      return <span key={i} className={`${CLE}__dialogue`}>{p}</span>;
    }
    return enMorceaux(p).map((x, j) => {
      const cherche = bonne === 'personnage' ? JE : IL;
      if (estUnMot(x) && cherche.test(x)) {
        // eslint-disable-next-line react/no-array-index-key
        return <span key={`${i}-${j}`} className={`${CLE}__voix`}>{x}</span>;
      }
      return x;
    });
  });
}

/** Ce qui s'allume, une fois la manche finie. */
function Indices({ m, texte }) {
  if (m.bonne === 'poeme') return <Poeme texte={texte} />;
  if (m.bonne === 'theatre') return <Theatre texte={texte} />;
  if (m.bonne === 'recit') return <Recit texte={texte} />;
  if (m.consigne === 'qui') return <QuiRaconte texte={texte} bonne={m.bonne} />;
  return texte;
}

const DIT = {
  poeme: 'Des vers qui vont à la ligne, et des rimes.',
  theatre: 'Le nom du personnage avant chaque réplique, et des indications entre parenthèses.',
  recit: 'Des phrases qui s’enchaînent : quelqu’un raconte une histoire.',
  personnage: 'Celui qui raconte dit « je » : il vit l’histoire.',
  exterieur: 'Celui qui raconte dit « il », « elle » : il n’est pas dans l’histoire.',
  non: 'L’auteur écrit le livre, mais c’est le chat qui dit « je » et raconte.',
  oui: 'Ici, l’auteur raconte lui-même.',
};

export function QuestionGenres({ m, termine }) {
  const texte = String(m.question ?? '');
  const libelle = (m.choix ?? []).find((c) => c.cle === m.bonne)?.libelle;
  const piege = termine && m.dialogue;
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <span className={`${CLE}__rideau ${CLE}__rideau--gauche`} aria-hidden="true" />
      <span className={`${CLE}__rideau ${CLE}__rideau--droite`} aria-hidden="true" />
      <span className={`${CLE}__projecteur`} aria-hidden="true" />
      <blockquote className={`texte-a-lire texte-a-lire--forme ${CLE}__page`}>
        {termine ? <Indices m={m} texte={texte} /> : texte}
      </blockquote>
      {termine && (
        <p className={`${CLE}__enseigne`}>
          <strong>{libelle}</strong>
          {` — ${DIT[m.bonne] ?? ''}`}
          {piege && <span className={`${CLE}__note`}>{' Le « je » entre guillemets, c’est un personnage qui parle.'}</span>}
        </p>
      )}
    </div>
  );
}

/** L'accessoire de chaque réponse, dessiné. */
function Accessoire({ cle }) {
  if (cle === 'poeme') {
    return (
      <svg viewBox="0 0 60 48" aria-hidden="true" focusable="false">
        <rect x="8" y="8" width="34" height="34" rx="4" fill="#f6e7c1" stroke="#b08a4a" strokeWidth="2" />
        <path d="M14 18 h22 M14 25 h18 M14 32 h20" stroke="#8a6a3a" strokeWidth="2" strokeLinecap="round" />
        <path d="M52 4 q-14 10 -18 30 l3 1 q6 -18 15 -31z" fill="#4a6fd1" stroke="#2a3f80" strokeWidth="1.5" />
      </svg>
    );
  }
  if (cle === 'theatre') {
    return (
      <svg viewBox="0 0 60 48" aria-hidden="true" focusable="false">
        <path d="M6 8 q14 -6 26 0 q0 22 -13 26 q-13 -4 -13 -26z" fill="#ffd34d" stroke="#a87b00" strokeWidth="2" />
        <path d="M12 16 h4 M22 16 h4 M12 24 q7 6 14 0" stroke="#5a3b00" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M28 14 q14 -6 26 0 q0 22 -13 26 q-13 -4 -13 -26z" fill="#3a3f55" stroke="#151a2a" strokeWidth="2" />
        <path d="M34 22 h4 M44 22 h4 M35 34 q6 -6 13 0" stroke="#e8ecff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (cle === 'recit') {
    return (
      <svg viewBox="0 0 60 48" aria-hidden="true" focusable="false">
        <path d="M30 12 q-12 -6 -24 -2 v30 q12 -4 24 2 q12 -6 24 -2 v-30 q-12 -4 -24 2z" fill="#fff8ea" stroke="#7a4b1c" strokeWidth="2" />
        <path d="M30 12 v30" stroke="#7a4b1c" strokeWidth="2" />
        <path d="M10 34 q8 -10 14 -2 M36 30 l5 -8 l5 8" stroke="#3f8f5b" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (cle === 'personnage' || cle === 'non') {
    return (
      <svg viewBox="0 0 60 48" aria-hidden="true" focusable="false">
        <circle cx="22" cy="18" r="10" fill="#f6c99c" stroke="#a0683a" strokeWidth="2" />
        <path d="M8 46 q14 -22 28 0z" fill="#d1495b" />
        <path d="M36 6 h20 v14 h-12 l-5 5 v-5 h-3z" fill="#fff" stroke="#3a3f55" strokeWidth="2" strokeLinejoin="round" />
        <text x="46" y="17" textAnchor="middle" fontSize="10" fontWeight="700" fill="#3a3f55">je</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 48" aria-hidden="true" focusable="false">
      <path d="M8 40 q22 -10 44 0 v-28 q-22 -10 -44 0z" fill="#fff8ea" stroke="#3a3f55" strokeWidth="2" />
      <circle cx="30" cy="22" r="8" fill="#ffd34d" stroke="#a87b00" strokeWidth="2" />
      <circle cx="30" cy="22" r="3" fill="#3a3f55" />
      <text x="30" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">il, elle</text>
    </svg>
  );
}

/** Les accessoires suspendus aux cintres. */
export function Accessoires({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__cintres`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} className={`${CLE}__corde`} style={{ '--i': i }}>
            <button
              type="button"
              className={`${CLE}__accessoire${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <Accessoire cle={cle} />
              <span className={`${CLE}__nom`}>{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionGenres m={m} termine={termine} />,
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <Accessoires choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
