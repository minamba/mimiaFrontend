import {
  Fete, humeurDe, Mascotte, rangee,
} from './communs';

/**
 * LE PARTAGE DES BONBONS (CE2) — 09/10/2026. La couverture : une confiserie
 * de village, des guirlandes de fanions, de grands bocaux remplis de bonbons
 * et d'oursons en gélatine, une balance dorée, et une petite fille en sweat
 * rose qui tend une poignée de bonbons en faisant un clin d'œil. La scène :
 *   - LE COMPTOIR DE LA CONFISERIE : les fanions qui flottent, deux bocaux qui
 *     se dandinent de chaque côté ; l'énoncé écrit gros sur le comptoir ;
 *   - LE TAS DE BONBONS dans un grand bocal en verre, et devant chaque
 *     assiette, UN AMI qui attend (il cligne des yeux) — autant d'amis que
 *     dans l'énoncé ;
 *   - APRÈS LA RÉPONSE, LE PARTAGE SE REJOUE : les bonbons tombent dans les
 *     assiettes UN PAR UN, à tour de rôle — un à chacun, puis on recommence,
 *     exactement ce que dit l'aide —, et ceux qui restent tombent à côté ;
 *     les amis sourient ;
 *   - LES RÉPONSES : des sachets de bonbons noués d'un ruban, suspendus à une
 *     tringle, qui se balancent doucement (on clique le sachet) ;
 *   - LA MASCOTTE : l'ourson en gélatine des bocaux. Il se dandine en
 *     attendant, saute et fait voler des cœurs à la réussite, hoche la tête
 *     à l'erreur.
 * Avant la réponse, les assiettes sont vides : rien n'est partagé d'avance.
 */
export const PREFIXE = 'sc-partage-des-bonbons';

const COULEURS = ['#e63946', '#f4a261', '#2a9d8f', '#8d5bd6', '#e9c46a'];
/** La fête : des bonbons de toutes les couleurs et des cœurs. */
const ECLATS = ['rose', 'bleu', 'coeur', 'jaune', 'vert', 'rose', 'coeur', 'bleu', 'jaune', 'coeur', 'vert', 'rose', 'bleu', 'coeur'];

/** Un bonbon emballé : un rond, deux papillotes. */
export function Bonbon({ couleur, style, className = 'partage__bonbon' }) {
  return (
    <svg className={className} viewBox="0 0 40 20" style={style} aria-hidden="true" focusable="false">
      <path d="M2 4 L10 10 L2 16 Z" fill={couleur} opacity="0.7" />
      <path d="M38 4 L30 10 L38 16 Z" fill={couleur} opacity="0.7" />
      <circle cx="20" cy="10" r="9" fill={couleur} />
      <circle cx="17" cy="7" r="2.5" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/**
 * LES AMIS, EN PERSONNAGES DE MANGA — Camara, le 09/10/2026 : « tu peux me
 * créer d'autres personnages de type manga et les animer pour remplacer ceux
 * qui sont là ? ». Cinq enfants, qui reviennent à tour de rôle : grands yeux à
 * reflets, joues roses, mains posées sur le bord de l'assiette. Ils se
 * balancent et clignent des yeux en attendant (couettes et queue de cheval qui
 * bougent) ; une fois servis, yeux en « ^^ », grand sourire et une étincelle.
 */
const PERSONNAGES = [
  { coiffure: 'pics', cheveux: '#6b3a1f', reflet: '#9a5a32', yeux: '#7a4a1e', haut: '#3b82f6' },
  { coiffure: 'couettes', cheveux: '#ff7eb6', reflet: '#ffb3d4', yeux: '#d9468f', haut: '#fbcfe8' },
  { coiffure: 'bandeau', cheveux: '#1f2433', reflet: '#3b4256', yeux: '#2f855a', haut: '#22c55e' },
  { coiffure: 'queue', cheveux: '#f97316', reflet: '#fdba74', yeux: '#2563eb', haut: '#facc15' },
  { coiffure: 'longs', cheveux: '#7c3aed', reflet: '#a78bfa', yeux: '#7c3aed', haut: '#c084fc' },
];

function Oeil({ x, couleur, content }) {
  if (content) {
    return <path d={`M${x - 4.2} 34.5 Q${x} 29.5 ${x + 4.2} 34.5`} stroke="#2b1a12" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  return (
    <g>
      <ellipse cx={x} cy="33.5" rx="4.4" ry="5.4" fill="#fff" />
      <ellipse cx={x} cy="34" rx="3.8" ry="4.9" fill={couleur} />
      <ellipse cx={x} cy="35" rx="2.4" ry="3.1" fill="#1a1426" />
      <circle cx={x - 1.5} cy="31.6" r="1.6" fill="#fff" />
      <circle cx={x + 1.5} cy="36.6" r="0.8" fill="#fff" opacity="0.9" />
      <path d={`M${x - 5} 29.6 Q${x} 26.6 ${x + 5} 29.6`} stroke="#2b1a12" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Coiffure({ p, avant }) {
  const { cheveux: c, reflet: r, coiffure } = p;
  if (!avant) {
    // Ce qui passe DERRIÈRE la tête : couettes, queue, longueurs.
    if (coiffure === 'couettes') {
      return (
        <g>
          <g className="sc-partage-des-bonbons__meche sc-partage-des-bonbons__meche--g"><ellipse cx="9" cy="34" rx="6.5" ry="13" fill={c} /></g>
          <g className="sc-partage-des-bonbons__meche sc-partage-des-bonbons__meche--d"><ellipse cx="51" cy="34" rx="6.5" ry="13" fill={c} /></g>
        </g>
      );
    }
    if (coiffure === 'queue') {
      return <g className="sc-partage-des-bonbons__meche sc-partage-des-bonbons__meche--d"><path d="M42 14 Q62 12 57 36 Q55 26 46 22 Z" fill={c} /></g>;
    }
    if (coiffure === 'longs') return <path d="M11 26 Q8 50 14 58 L46 58 Q52 50 49 26 Z" fill={c} />;
    return null;
  }
  return (
    <g>
      {/* La calotte et la frange en mèches. */}
      <path d="M11 31 Q9 9 30 8 Q51 9 49 31 Q46 21 41 18 Q37 25 32 19 Q28 25 23 19 Q17 22 11 31 Z" fill={c} />
      <path d="M18 13 Q26 9 34 11" stroke={r} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.8" />
      {coiffure === 'pics' && <path d="M13 17 L9 5 L19 11 L21 1 L29 9 L36 0 L38 10 L49 4 L47 17 Z" fill={c} />}
      {coiffure === 'couettes' && (
        <g>
          <circle cx="12" cy="22" r="3" fill="#fde047" />
          <circle cx="48" cy="22" r="3" fill="#fde047" />
        </g>
      )}
      {coiffure === 'bandeau' && <path d="M11 22 Q30 13 49 22 L49 26 Q30 17 11 26 Z" fill="#ef4444" />}
      {coiffure === 'queue' && <path d="M15 14 l1.6 -3.2 l1.6 3.2 l3.4 0.5 l-2.5 2.4 l0.6 3.4 l-3.1 -1.6 l-3.1 1.6 l0.6 -3.4 l-2.5 -2.4 Z" fill="#fde047" transform="translate(28 2)" />}
      {coiffure === 'longs' && <path d="M15 14 l1.6 -3.2 l1.6 3.2 l3.4 0.5 l-2.5 2.4 l0.6 3.4 l-3.1 -1.6 l-3.1 1.6 l0.6 -3.4 l-2.5 -2.4 Z" fill="#fde047" />}
    </g>
  );
}

/** UN AMI QUI ATTEND SA PART, derrière son assiette. */
function Ami({ n, content }) {
  const p = PERSONNAGES[n % PERSONNAGES.length];
  return (
    <svg className={`${PREFIXE}__ami${content ? ' est-content' : ''}`} viewBox="0 0 60 64" style={{ '--n': n }} aria-hidden="true" focusable="false">
      <g className={`${PREFIXE}__ami-corps`}>
        <Coiffure p={p} avant={false} />
        {/* Les épaules et le col. */}
        <path d="M11 64 Q12 50 30 49 Q48 50 49 64 Z" fill={p.haut} />
        <path d="M24 50 Q30 55 36 50" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.8" />
        {/* La tête. */}
        <ellipse cx="30" cy="31" rx="18.5" ry="18" fill="#ffe2cc" />
        <Coiffure p={p} avant />
        <g className={`${PREFIXE}__ami-yeux`}>
          <Oeil x={22.5} couleur={p.yeux} content={content} />
          <Oeil x={37.5} couleur={p.yeux} content={content} />
        </g>
        <ellipse cx="17.5" cy="40.5" rx="3.2" ry="1.7" fill="#ff8fab" opacity="0.55" />
        <ellipse cx="42.5" cy="40.5" rx="3.2" ry="1.7" fill="#ff8fab" opacity="0.55" />
        {content
          ? <path d="M25.5 41.5 Q30 48.5 34.5 41.5 Z" fill="#c81e4b" />
          : <path d="M28 43 Q30 44.6 32 43" stroke="#7c2d12" strokeWidth="1.3" fill="none" strokeLinecap="round" />}
        {/* Les mains sur le bord de l'assiette. */}
        <circle cx="17" cy="61" r="3.6" fill="#ffe2cc" stroke="#e9b896" strokeWidth="0.8" />
        <circle cx="43" cy="61" r="3.6" fill="#ffe2cc" stroke="#e9b896" strokeWidth="0.8" />
        {content && <path className={`${PREFIXE}__ami-etincelle`} d="M52 8 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 Z" fill="#fde047" />}
      </g>
    </svg>
  );
}

/** LA BOUTIQUE AUTOUR : les fanions et les deux bocaux. */
function Boutique() {
  return (
    <div className={`${PREFIXE}__boutique`} aria-hidden="true">
      <svg className={`${PREFIXE}__fanions`} viewBox="0 0 300 30" preserveAspectRatio="none" focusable="false">
        <path d="M0 3 Q150 18 300 3" fill="none" stroke="#9a6b3f" strokeWidth="1.4" />
        {rangee(10).map((i) => {
          const x = 15 + i * 30;
          const t = x / 300;
          const y = 3 + 2 * t * (1 - t) * 15;
          return <path key={i} d={`M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 15} Z`} fill={['#ff7aa2', '#7cc8ff', '#ffd166', '#9be38f'][i % 4]} className={`${PREFIXE}__fanion`} style={{ '--i': i }} />;
        })}
      </svg>
      {['gauche', 'droite'].map((cote, j) => (
        <span key={cote} className={`${PREFIXE}__bocal-deco ${PREFIXE}__bocal-deco--${cote}`}>
          <svg viewBox="0 0 50 64" focusable="false">
            <rect x="12" y="2" width="26" height="8" rx="3" fill="#cbd5e1" />
            <rect x="6" y="10" width="38" height="50" rx="10" fill="rgba(220, 240, 255, 0.55)" stroke="#94a3b8" strokeWidth="2" />
            {rangee(9).map((i) => (
              <circle key={i} cx={14 + (i % 3) * 11 + (Math.floor(i / 3) % 2) * 4} cy={52 - Math.floor(i / 3) * 10} r="5" fill={COULEURS[(i + j * 2) % COULEURS.length]} />
            ))}
          </svg>
        </span>
      ))}
    </div>
  );
}

/**
 * LA QUESTION : le comptoir, le bocal, les amis et leurs assiettes. `termine`
 * rejoue le partage, un bonbon à chacun à tour de rôle.
 */
export function QuestionPartage({ m, termine, extra = {} }) {
  const bonbons = Number(m?.bonbons) || 0;
  const amis = Number(m?.amis) || 0;
  const q = Number(m?.bonne?.q) || 0;
  const r = Number(m?.bonne?.r) || 0;
  return (
    <div className={`${PREFIXE}${termine ? ' est-termine' : ''}`}>
      <Boutique />
      <div className={`partage-jeu ${PREFIXE}__comptoir`}>
        <p className="partage__enonce">
          <strong>{m?.bonbons} bonbons</strong> pour <strong>{m?.amis} amis</strong>.
        </p>
        {!termine && (
          <div className={`partage__tas ${PREFIXE}__bocal`} role="img" aria-label={`${bonbons} bonbons`}>
            {rangee(bonbons).map((i) => (
              <Bonbon key={i} couleur={COULEURS[i % COULEURS.length]} style={{ '--i': i }} />
            ))}
          </div>
        )}
        <ul className="partage__assiettes" aria-label={`${amis} assiettes`}>
          {rangee(amis).map((a) => (
            <li key={a} className={`partage__assiette ${PREFIXE}__place`}>
              <Ami n={a} content={termine} />
              <span className={`${PREFIXE}__assiette`}>
                {termine && rangee(q).map((i) => (
                  // L'ordre du partage : un bonbon à chacun, puis on recommence.
                  <Bonbon key={i} couleur={COULEURS[(a + i) % COULEURS.length]} className={`partage__bonbon ${PREFIXE}__tombe`} style={{ '--k': i * amis + a }} />
                ))}
              </span>
            </li>
          ))}
        </ul>
        {termine && r > 0 && (
          <p className="partage__reste">
            Il en reste {r} :{' '}
            {rangee(r).map((i) => (
              <Bonbon key={i} couleur={COULEURS[i % COULEURS.length]} className={`partage__bonbon ${PREFIXE}__tombe`} style={{ '--k': q * amis + i }} />
            ))}
          </p>
        )}
      </div>
      {extra.trouve && <Fete prefixe={PREFIXE} eclats={ECLATS} />}
      <Nounours
        humeur={humeurDe({ reussi: Boolean(extra.trouve), faute: extra.derniereFaute != null || (termine && !extra.trouve) })}
        cle={String(extra.derniereFaute ?? '')}
      />
    </div>
  );
}

/**
 * LES RÉPONSES : DES SACHETS DE BONBONS suspendus à une tringle, qui se
 * balancent doucement. Chaque sachet est un bouton à son libellé ; le
 * sachet faux est barré et terni, et ne se clique plus.
 */
export function ChoixPartage({ choix, fautes = [], choisir }) {
  return (
    <ul className={`${PREFIXE}__sachets`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${PREFIXE}__sachet${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <svg className={`${PREFIXE}__sachet-dessin`} viewBox="0 0 120 40" aria-hidden="true" focusable="false">
                <path d="M60 2 L60 12" stroke="#9a6b3f" strokeWidth="2" />
                <path d="M48 16 Q60 8 72 16 L66 20 L54 20 Z" fill={COULEURS[i % COULEURS.length]} />
                <circle cx="60" cy="16" r="4" fill={COULEURS[(i + 2) % COULEURS.length]} />
                <path d="M50 18 L40 30 M70 18 L80 30" stroke={COULEURS[(i + 2) % COULEURS.length]} strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className={`${PREFIXE}__etiquette`}>{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** L'OURSON EN GÉLATINE, tout droit sorti du bocal. */
export function Nounours({ humeur, cle }) {
  return (
    <Mascotte prefixe={PREFIXE} humeur={humeur} cle={cle}>
      <svg viewBox="0 0 100 110" focusable="false">
        <ellipse cx="50" cy="106" rx="28" ry="4" className={`${PREFIXE}__ombre`} />
        <g className={`${PREFIXE}__gelatine`}>
          <circle cx="30" cy="20" r="10" />
          <circle cx="70" cy="20" r="10" />
          <ellipse cx="50" cy="76" rx="26" ry="26" />
          <ellipse cx="34" cy="100" rx="10" ry="7" />
          <ellipse cx="66" cy="100" rx="10" ry="7" />
          <g className={`${PREFIXE}__bras-gauche`}><ellipse cx="22" cy="70" rx="8" ry="12" /></g>
          <g className={`${PREFIXE}__bras-droit`}><ellipse cx="78" cy="70" rx="8" ry="12" /></g>
          <circle cx="50" cy="38" r="24" />
        </g>
        <ellipse cx="40" cy="28" rx="6" ry="9" fill="#fff" opacity="0.45" transform="rotate(-25 40 28)" />
        <ellipse cx="44" cy="70" rx="5" ry="10" fill="#fff" opacity="0.3" transform="rotate(-20 44 70)" />
        <ellipse cx="50" cy="46" rx="9" ry="6.5" fill="#ffd2b0" opacity="0.8" />
        <g className={`${PREFIXE}__yeux`}>
          <circle cx="41" cy="36" r="3.4" fill="#3b1d0e" />
          <circle cx="59" cy="36" r="3.4" fill="#3b1d0e" />
          <circle cx="42.2" cy="34.8" r="1.1" fill="#fff" />
          <circle cx="60.2" cy="34.8" r="1.1" fill="#fff" />
        </g>
        <ellipse cx="50" cy="43" rx="3" ry="2.2" fill="#3b1d0e" />
        <path d="M45 48 Q50 53 55 48" stroke="#3b1d0e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <ellipse cx="33" cy="45" rx="3.6" ry="2.2" fill="#ff5d8f" opacity="0.6" />
        <ellipse cx="67" cy="45" rx="3.6" ry="2.2" fill="#ff5d8f" opacity="0.6" />
      </svg>
    </Mascotte>
  );
}
