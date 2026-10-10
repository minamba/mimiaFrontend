import { RELATIONS, ecrire } from '../../../../lib/jeux/metreRuban';
import {
  Fete, humeurDe, Mascotte, rangee,
} from './communs';

/**
 * LE MÈTRE RUBAN (CE2) — 09/10/2026. La couverture : un atelier ensoleillé,
 * un établi en bois clair, des crayons dans un pot, une équerre bleue, et une
 * petite fille en sweat rose qui tire le ruban jaune de son mètre le long
 * d'une planche. La scène :
 *   - L'ÉTABLI : la planche de bois, le boîtier jaune et noir du mètre, d'où
 *     le RUBAN SE DÉROULE à chaque nouvelle manche, graduation après
 *     graduation ; le pot de crayons et l'équerre posés dans les coins ;
 *   - LA QUESTION, écrite gros sur une étiquette fixée au ruban (le même
 *     texte qu'avant, nombres écrits avec l'espace des milliers) ;
 *   - APRÈS LA RÉPONSE, l'égalité à retenir — « 1 m = 100 cm » — arrive en
 *     tampon sous le ruban, et le ruban se rembobine d'un coup sec ;
 *   - LES RÉPONSES : des planches de bois graduées, à choisir sur l'établi
 *     (on clique la planche) ;
 *   - LA MASCOTTE : un mètre ruban qui a des yeux. Il attend en remuant le
 *     bout de son ruban, le déroule tout grand à la réussite, hoche la tête
 *     à l'erreur.
 * Avant la réponse, rien n'est converti ni souligné.
 */
export const PREFIXE = 'sc-metre-ruban';

/** La fête : des étoiles et des bouts de ruban jaune, bleu, rose. */
const ECLATS = ['etoile', 'jaune', 'bleu', 'rose', 'etoile', 'jaune', 'bleu', 'etoile', 'rose', 'jaune', 'etoile', 'bleu', 'rose', 'jaune'];

/** Le texte de la question, tel que l'écran l'a toujours montré. */
export function texteRuban(m, termine) {
  const q = String(m?.question ?? '');
  if (termine && m?.bonne != null) return q.replace('?', ecrire(m.bonne));
  return q.replace(/\d{4,}/g, (x) => ecrire(Number(x)));
}

/** L'égalité à retenir : « 1 m = 100 cm » ; rien si la relation est inconnue. */
export function egalite(m) {
  const r = RELATIONS[m?.relation];
  return r ? `1 ${r.grande} = ${ecrire(r.facteur)} ${r.petite}` : null;
}

/** LE MÈTRE DE L'ÉTABLI : le boîtier et le ruban qui se déroule. */
function Metre({ termine }) {
  return (
    <svg className={`${PREFIXE}__metre${termine ? ' est-rembobine' : ''}`} viewBox="0 0 320 60" aria-hidden="true" focusable="false">
      <g className={`${PREFIXE}__ruban`}>
        <rect x="44" y="30" width="268" height="20" rx="2" className={`${PREFIXE}__ruban-jaune`} />
        {rangee(54).map((i) => (
          <line key={i} x1={48 + i * 5} y1="30" x2={48 + i * 5} y2={i % 10 === 0 ? 44 : i % 5 === 0 ? 40 : 35} className={`${PREFIXE}__graduation`} />
        ))}
        <rect x="308" y="26" width="6" height="28" rx="1.5" className={`${PREFIXE}__crochet`} />
      </g>
      <g className={`${PREFIXE}__boitier`}>
        <rect x="2" y="6" width="54" height="52" rx="14" className={`${PREFIXE}__boitier-jaune`} />
        <rect x="8" y="14" width="14" height="36" rx="5" className={`${PREFIXE}__boitier-noir`} />
        <circle cx="34" cy="32" r="11" className={`${PREFIXE}__moyeu`} />
        <circle cx="34" cy="32" r="3" className={`${PREFIXE}__boitier-noir`} />
      </g>
    </svg>
  );
}

/**
 * LA QUESTION SUR L'ÉTABLI. Le texte entier reste à l'écran, lisible, sur son
 * étiquette ; la classe `ruban__question` garde son allure d'origine.
 */
export function QuestionRuban({ m, termine, extra = {} }) {
  const lEgalite = egalite(m);
  return (
    <div className={`${PREFIXE}${termine ? ' est-termine' : ''}`}>
      <div className={`ruban-jeu ${PREFIXE}__etabli`}>
        <span className={`${PREFIXE}__crayons`} aria-hidden="true">
          <svg viewBox="0 0 40 56" focusable="false">
            <path d="M10 6 L13 0 L16 6 Z" fill="#f4c27a" />
            <rect x="10" y="6" width="6" height="26" fill="#e63946" />
            <path d="M18 2 L21 -4 L24 2 Z" fill="#f4c27a" />
            <rect x="18" y="2" width="6" height="30" fill="#2563eb" />
            <path d="M26 8 L29 2 L32 8 Z" fill="#f4c27a" />
            <rect x="26" y="8" width="6" height="24" fill="#f59e0b" />
            <path d="M6 26 L34 26 L31 54 L9 54 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          </svg>
        </span>
        <span className={`${PREFIXE}__equerre`} aria-hidden="true">
          <svg viewBox="0 0 60 50" focusable="false">
            <path d="M4 46 L56 46 L4 4 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" opacity="0.9" />
            <path d="M14 38 L36 38 L14 20 Z" fill="#dbeafe" />
          </svg>
        </span>
        <Metre termine={termine} />
        <p className={`ruban__question ${PREFIXE}__etiquette`}>{texteRuban(m, termine)}</p>
        {termine && lEgalite && <p className={`${PREFIXE}__egalite`}>{lEgalite}</p>}
      </div>
      {extra.trouve && <Fete prefixe={PREFIXE} eclats={ECLATS} />}
      <MetreQuiParle
        humeur={humeurDe({ reussi: Boolean(extra.trouve), faute: extra.derniereFaute != null || (termine && !extra.trouve) })}
        cle={String(extra.derniereFaute ?? '')}
      />
    </div>
  );
}

/**
 * LES RÉPONSES : DES PLANCHES DE BOIS GRADUÉES. Chaque planche est un bouton
 * à son libellé ; une planche fausse est barrée, ternie, et ne se clique plus.
 */
export function ChoixRuban({ choix, fautes = [], choisir }) {
  return (
    <ul className={`${PREFIXE}__planches`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${PREFIXE}__planche${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className={`${PREFIXE}__traits`} aria-hidden="true" />
              <span className={`${PREFIXE}__mesure`}>{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** LE MÈTRE RUBAN QUI A DES YEUX. Le bout du ruban est un groupe à part. */
export function MetreQuiParle({ humeur, cle }) {
  return (
    <Mascotte prefixe={PREFIXE} humeur={humeur} cle={cle}>
      <svg viewBox="0 0 110 100" focusable="false">
        <ellipse cx="44" cy="96" rx="30" ry="3.5" className={`${PREFIXE}__ombre`} />
        <g className={`${PREFIXE}__langue`}>
          <rect x="66" y="70" width="34" height="9" rx="1.5" fill="#facc15" stroke="#a16207" strokeWidth="1" />
          {rangee(6).map((i) => <line key={i} x1={70 + i * 5} y1="70" x2={70 + i * 5} y2={i % 2 ? 74 : 76} stroke="#3f2d05" strokeWidth="1" />)}
          <rect x="98" y="66" width="4" height="16" rx="1" fill="#9ca3af" />
        </g>
        <rect x="26" y="86" width="12" height="9" rx="4" fill="#1f2937" />
        <rect x="50" y="86" width="12" height="9" rx="4" fill="#1f2937" />
        <rect x="8" y="28" width="72" height="62" rx="20" fill="#facc15" stroke="#a16207" strokeWidth="2.4" />
        <rect x="14" y="40" width="12" height="40" rx="5" fill="#1f2937" />
        <circle cx="64" cy="76" r="7" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.6" />
        <circle cx="64" cy="76" r="2" fill="#374151" />
        <g className={`${PREFIXE}__yeux`}>
          <ellipse cx="42" cy="52" rx="4" ry="5" fill="#2b1a05" />
          <ellipse cx="60" cy="52" rx="4" ry="5" fill="#2b1a05" />
          <circle cx="43.4" cy="50.4" r="1.4" fill="#fff" />
          <circle cx="61.4" cy="50.4" r="1.4" fill="#fff" />
        </g>
        <ellipse cx="35" cy="62" rx="4" ry="2.4" fill="#fb923c" opacity="0.7" />
        <ellipse cx="68" cy="62" rx="4" ry="2.4" fill="#fb923c" opacity="0.7" />
        <path d="M45 63 Q51 70 57 63" stroke="#2b1a05" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M24 32 Q44 22 66 32" stroke="#fff6b0" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      </svg>
    </Mascotte>
  );
}
