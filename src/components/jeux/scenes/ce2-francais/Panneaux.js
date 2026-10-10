import { reponse } from '../../../../lib/jeux/contrairesEtJumeaux';
import {
  BoutonGlissable, Fete, cleHumeur, humeurDe,
} from './outils';
import './ce2-francais.css';

/**
 * CONTRAIRES ET JUMEAUX (CE1, CE2) : LE CARREFOUR DES PANNEAUX (09/10/2026).
 * La couverture montre des poteaux couverts de panneaux de bois qui vont par
 * deux — jour/nuit, grand/petit, froid/chaud, content/joyeux —, un chat
 * tigré sur la barrière et un rouge-gorge perché sur un poteau. La scène :
 *   - LA QUESTION : le dessin d'origine (le mot, le lien, la case « ? »)
 *     devient deux panneaux cloués sur le poteau. Pour un CONTRAIRE, ils
 *     pointent dans des sens opposés ; pour un JUMEAU, dans le même sens ;
 *     pour une FAMILLE (CE2), une branche pousse entre eux. Le ROUGE-GORGE
 *     (la mascotte) est perché en haut : il penche la tête, bat des ailes
 *     pour encourager à l'erreur, chante à la bonne réponse ; le chat,
 *     sur la barrière, balance la queue ;
 *   - LES RÉPONSES : des pancartes plantées dans l'herbe, qui se balancent ;
 *     on en touche une, ou on la GLISSE sur le panneau vide ;
 *   - APRÈS LA RÉPONSE : le mot se cloue sur le panneau, et la RELATION se
 *     voit — les contraires s'écartent dos à dos, les jumeaux se balancent
 *     ensemble, la famille montre en couleur le morceau de mot qu'elle
 *     partage (dent → dentiste).
 */

const CLE = 'sc-contraires-et-jumeaux';

/** Le signe entre les deux mots : ↔ pour un contraire, = pour un jumeau, ⋯ pour une famille (le dessin d'origine). */
const LIEN = { contraire: '↔', jumeau: '=', famille: '⋯' };

const sansAccent = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * LE MORCEAU PARTAGÉ PAR DEUX MOTS DE LA MÊME FAMILLE : la plus longue suite
 * de lettres commune (au moins trois), sa place dans chacun. « dent » et
 * « dentiste » → « dent » ; « froid » et « refroidir » → « froid ». Null si
 * rien de net ne se partage (« mer » et « marin » : seul le sens les lie).
 */
export function racineCommune(a, b) {
  const x = sansAccent(String(a ?? ''));
  const y = sansAccent(String(b ?? ''));
  let meilleur = null;
  for (let i = 0; i < x.length; i += 1) {
    for (let j = 0; j < y.length; j += 1) {
      let n = 0;
      while (i + n < x.length && j + n < y.length && x[i + n] === y[j + n]) n += 1;
      if (n >= 3 && (!meilleur || n > meilleur.n)) meilleur = { i, j, n };
    }
  }
  return meilleur;
}

/** Un mot dont un morceau est mis en couleur ; le texte reste le même. */
function MotSurligne({ mot, debut, n }) {
  if (debut == null) return mot;
  return (
    <>
      {mot.slice(0, debut)}
      <span className={`${CLE}__racine`}>{mot.slice(debut, debut + n)}</span>
      {mot.slice(debut + n)}
    </>
  );
}

/** Le rouge-gorge de la couverture, perché sur le poteau. */
export function RougeGorge({ humeur, cle }) {
  return (
    <span className={`${CLE}__perchoir`} aria-hidden="true">
      <span key={cle} className={`${CLE}__oiseau est-${humeur}`}>
        <svg viewBox="0 0 80 70" focusable="false">
          <path d="M14 40l-12 6 14 2z" fill="#6b4a2e" />
          <ellipse cx="38" cy="40" rx="24" ry="20" fill="#8a5a33" />
          <ellipse cx="46" cy="44" rx="15" ry="14" fill="#f2763a" />
          <path className={`${CLE}__aile`} d="M22 34c8-6 20-4 24 6-8 6-18 6-24-6z" fill="#6b4a2e" />
          <circle cx="54" cy="24" r="14" fill="#8a5a33" />
          <circle cx="58" cy="30" r="9" fill="#f2763a" />
          <path d="M66 22l10 3-10 3z" fill="#e8b33c" />
          <g className={`${CLE}__oeil-oiseau`}>
            <circle cx="58" cy="20" r="3.4" fill="#1d1408" />
            <circle cx="59.2" cy="19" r="1.1" fill="#fff" />
          </g>
          <path d="M34 58v8M44 58v8" stroke="#6b4a2e" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        <span className={`${CLE}__notes`}>
          <span>♪</span>
          <span>♫</span>
          <span>♪</span>
        </span>
      </span>
    </span>
  );
}

/** Le chat tigré de la barrière : il cligne et balance la queue. */
function Chat({ heureux }) {
  return (
    <span className={`${CLE}__chat${heureux ? ' est-heureux' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 70 70" focusable="false">
        <path className={`${CLE}__queue`} d="M50 56c14 0 16-14 10-22" stroke="#c98a4a" strokeWidth="6" fill="none" strokeLinecap="round" />
        <ellipse cx="34" cy="52" rx="20" ry="14" fill="#e8b27a" />
        <path d="M14 22l4-16 10 10zM54 22l-4-16-10 10z" fill="#e8b27a" stroke="#c98a4a" strokeWidth="1.5" />
        <circle cx="34" cy="28" r="18" fill="#f2c48e" stroke="#c98a4a" strokeWidth="1.5" />
        <path d="M30 13l2 6M34 12v6M38 13l-2 6" stroke="#c98a4a" strokeWidth="2" strokeLinecap="round" />
        <g className={`${CLE}__yeux-chat`}>
          <path d="M24 27q3-3 6 0" stroke="#2b1d10" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M38 27q3-3 6 0" stroke="#2b1d10" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
        <path d="M32 33l2 2 2-2" stroke="#2b1d10" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M18 34h-8M18 37l-7 3M50 34h8M50 37l7 3" stroke="#a87445" strokeWidth="1.2" />
      </svg>
    </span>
  );
}

export function QuestionContraires({ m, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  const bonne = termine ? reponse(m) : null;
  const racine = termine && m.demande === 'famille' ? racineCommune(m.mot, bonne) : null;
  return (
    <div className={`${CLE} est-${m.demande}${termine ? ' est-termine' : ''}`}>
      <div className={`${CLE}__carrefour`}>
        <span className={`${CLE}__poteau`} aria-hidden="true" />
        <RougeGorge humeur={humeur} cle={cleHumeur(humeur, extra)} />
        {m.demande === 'famille' && <span className={`${CLE}__branche`} aria-hidden="true" />}
        {/* LE DESSIN D'ORIGINE, gardé : le mot, le lien, la case à trouver. */}
        <p className={`contraires__paire ${CLE}__paire`}>
          <span className={`contraires__mot ${CLE}__panneau ${CLE}__panneau--mot`}>
            <MotSurligne mot={m.mot} debut={racine?.i} n={racine?.n} />
          </span>
          <span className={`contraires__lien ${CLE}__lien`}>{LIEN[m.demande]}</span>
          <span className={`contraires__mot${termine ? ' est-trouve' : ' est-vide'} ${CLE}__panneau ${CLE}__vide`}>
            {termine ? <MotSurligne mot={bonne} debut={racine?.j} n={racine?.n} /> : '?'}
          </span>
        </p>
        {termine && extra?.trouve && <Fete forme="feuille" />}
      </div>
      <Chat heureux={termine && extra?.trouve} />
    </div>
  );
}

/** Les pancartes plantées dans l'herbe : on en touche une, ou on la glisse sur le panneau vide. */
export function Pancartes({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__pancartes`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <BoutonGlissable
              cible={`.${CLE}__vide`}
              choisir={() => choisir(cle)}
              disabled={faux}
              className={`${CLE}__pancarte${faux ? ' est-fausse' : ''}`}
            >
              <span className={`${CLE}__piquet`} aria-hidden="true" />
              {libelle}
            </BoutonGlissable>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine, extra) => <QuestionContraires m={m} termine={termine} extra={extra} />,
  choix: ({ choix, fautes, choisir }) => <Pancartes choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
