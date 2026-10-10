/**
 * L'ENFANT DE LA COUVERTURE, EN MASCOTTE — groupe « cp-maths-2 » (09/10/2026).
 *
 * Chaque couverture du groupe montre un enfant : le petit chef de chantier au
 * casque jaune, la fillette au sweat rose et à la queue de cheval devant
 * l'horloge, le garçon au sweat bleu derrière la balance du marché, la
 * fillette aux cheveux violets de la fête foraine. Ce dessin les fait tous :
 * la tenue, la coiffure et l'objet tenu changent, le squelette reste.
 *
 * TROIS HUMEURS, JAMAIS DE MOQUERIE — l'additif du CP :
 *   - `attente` : il respire, cligne des yeux, regarde le jeu ;
 *   - `bravo`   : il saute, bras en l'air, grand rire, une étoile dans sa bulle ;
 *   - `oups`    : il penche la tête, sourit, lève le pouce, un cœur dans sa
 *                 bulle — c'est un encouragement, pas un reproche.
 *
 * AUCUN TEXTE, AUCUN RÔLE : la mascotte est `aria-hidden`. Elle n'ajoute rien
 * à lire ni à entendre, et ne touche à aucun `role="status"` des jeux.
 *
 * LES CLASSES SONT CELLES DU JEU (`prefixe`, par exemple `sc-horloge`) : la
 * règle des scènes veut chaque classe préfixée par la clé de son jeu, et
 * chaque jeu anime son enfant à sa façon dans `cp-maths-2.css`.
 *
 * `main` et `mainGauche` : ce que tient chaque main (le cube, la pomme, le
 * doigt tendu, le « V »), dessiné autour de la main, bras pendant.
 *
 * `regard` (-1, 0, 1) tourne les yeux vers la gauche ou la droite : à la
 * balance, l'enfant suit le plateau qui descend.
 */
export default function Enfant({
  prefixe, humeur = 'attente', regard = 0, tenue, main = null, mainGauche = null,
}) {
  const p = prefixe;
  const {
    peau = '#f6d2b4', joues = '#f5a3a3', cheveux = '#3b2a20', coiffure = 'herisse',
    haut = '#2f5fa8', hautClair = '#4b7fd0', bas = '#2a3d66', chaussures = '#5a3a24',
    accessoire = null, accent = '#f06292',
  } = tenue ?? {};
  const decale = Math.max(-1, Math.min(1, regard)) * 2.6;

  return (
    <div className={`${p}__mascotte ${p}__mascotte--${humeur}`} aria-hidden="true">
      <svg className={`${p}__m-svg`} viewBox="0 0 130 178">
        <ellipse className={`${p}__m-ombre`} cx="60" cy="171" rx="32" ry="4.5" />

        <g className={`${p}__m-corps`}>
          {/* Les jambes et les chaussures. */}
          <rect x="47" y="138" width="11" height="25" rx="5" fill={bas} />
          <rect x="62" y="138" width="11" height="25" rx="5" fill={bas} />
          <ellipse cx="51" cy="165" rx="8.5" ry="4.6" fill={chaussures} />
          <ellipse cx="69" cy="165" rx="8.5" ry="4.6" fill={chaussures} />

          {/* Les cheveux longs passent DERRIÈRE le visage et le buste. */}
          {coiffure === 'longs' && (
            <path
              d="M27 66 Q25 28 60 28 Q95 28 93 66 L97 122 Q85 128 78 114 L42 114 Q35 128 23 122 Z"
              fill={cheveux}
            />
          )}

          {/* Le buste : sweat ou salopette. */}
          <path d="M33 146 Q30 113 44 104 Q60 97 76 104 Q90 113 87 146 Z" fill={haut} />
          <path d="M48 104 Q60 112 72 104 Q60 100 48 104 Z" fill={hautClair} />
          <rect x="49" y="122" width="22" height="13" rx="4" fill={hautClair} />
          {accessoire === 'casque' && (
            // Les bretelles jaunes de la salopette de chantier.
            <g fill="#f2b632">
              <rect x="44" y="104" width="5" height="34" rx="2" />
              <rect x="71" y="104" width="5" height="34" rx="2" />
            </g>
          )}
          <rect x="54" y="92" width="12" height="10" rx="4" fill={peau} />

          {/* Le bras gauche (à gauche de l'écran). */}
          <g className={`${p}__m-bras-g`}>
            <line x1="43" y1="108" x2="31" y2="134" stroke={haut} strokeWidth="11" strokeLinecap="round" />
            <circle cx="30.5" cy="136.5" r="6.2" fill={peau} />
            {mainGauche && <g transform="translate(30.5 136.5)">{mainGauche}</g>}
          </g>

          {/* Le bras droit, qui tient l'objet du thème. */}
          <g className={`${p}__m-bras-d`}>
            <line x1="77" y1="108" x2="89" y2="134" stroke={haut} strokeWidth="11" strokeLinecap="round" />
            <circle cx="89.5" cy="136.5" r="6.2" fill={peau} />
            {main && <g transform="translate(89.5 136.5)">{main}</g>}
          </g>

          {/* La tête. */}
          <g className={`${p}__m-tete`}>
            {coiffure === 'queue' && (
              <g className={`${p}__m-queue`}>
                <path d="M84 40 Q114 44 106 80 Q102 94 95 98 Q103 70 84 52 Z" fill={cheveux} />
                <circle cx="87" cy="44" r="6.5" fill={accent} />
              </g>
            )}
            <circle cx="31" cy="68" r="6" fill={peau} />
            <circle cx="89" cy="68" r="6" fill={peau} />
            <circle cx="60" cy="64" r="30" fill={peau} />

            <Coiffure coiffure={coiffure} cheveux={cheveux} accent={accent} />
            {accessoire === 'casque' && (
              <g>
                <path d="M26 60 Q26 24 60 24 Q94 24 94 60 Z" fill="#f5c518" stroke="#c99a0a" strokeWidth="2" />
                <path d="M60 25 L60 58" stroke="#ffe27a" strokeWidth="5" strokeLinecap="round" />
                <rect x="20" y="56" width="80" height="9" rx="4.5" fill="#f2b400" stroke="#c99a0a" strokeWidth="2" />
                <rect x="66" y="36" width="15" height="11" rx="2" fill="#2f5fa8" />
                <path d="M73.5 37 L73.5 46" stroke="#fff" strokeWidth="1.4" />
              </g>
            )}

            {/* Les sourcils : relevés à l'erreur, pour encourager. */}
            <g className={`${p}__m-sourcils`} stroke={cheveux} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d={humeur === 'oups' ? 'M43 56 Q49 52 55 55' : 'M43 57 Q49 54 55 57'} />
              <path d={humeur === 'oups' ? 'M65 55 Q71 52 77 56' : 'M65 57 Q71 54 77 57'} />
            </g>

            {/* Les yeux, et les pupilles qui suivent `regard`. */}
            <g>
              <ellipse cx="49" cy="68" rx="6" ry="7" fill="#fff" />
              <ellipse cx="71" cy="68" rx="6" ry="7" fill="#fff" />
              {humeur === 'bravo' ? (
                // Les yeux rieurs : deux arcs fermés.
                <g stroke="#2b1d16" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M43.5 70 Q49 63 54.5 70" />
                  <path d="M65.5 70 Q71 63 76.5 70" />
                </g>
              ) : (
                <g className={`${p}__m-pupilles`} transform={`translate(${decale} 0)`}>
                  <circle cx="49" cy="69" r="4" fill="#3a2418" />
                  <circle cx="71" cy="69" r="4" fill="#3a2418" />
                  <circle cx="50.4" cy="67.4" r="1.4" fill="#fff" />
                  <circle cx="72.4" cy="67.4" r="1.4" fill="#fff" />
                </g>
              )}
              <g className={`${p}__m-paupieres`} fill={peau}>
                <ellipse cx="49" cy="68" rx="6.6" ry="7.6" />
                <ellipse cx="71" cy="68" rx="6.6" ry="7.6" />
              </g>
            </g>

            <ellipse cx="40.5" cy="79" rx="5" ry="3" fill={joues} opacity="0.7" />
            <ellipse cx="79.5" cy="79" rx="5" ry="3" fill={joues} opacity="0.7" />
            <Bouche humeur={humeur} />
          </g>
        </g>

        {/* La bulle : une étoile à la réussite, un cœur à l'erreur. */}
        {humeur !== 'attente' && (
          <g className={`${p}__m-bulle`}>
            <circle cx="111" cy="20" r="16" fill="#fff" stroke="#f0c040" strokeWidth="2.5" />
            <path d="M98 31 L94 39 L103 33 Z" fill="#fff" stroke="#f0c040" strokeWidth="2" strokeLinejoin="round" />
            {humeur === 'bravo' ? (
              <path
                d="M111 9 L114 16.5 L122 17 L116 22 L118 30 L111 25.5 L104 30 L106 22 L100 17 L108 16.5 Z"
                fill="#ffc83d"
                stroke="#e09a00"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M111 29 C101 22 101 13 106.5 12 C109 11.6 110.5 13.5 111 15 C111.5 13.5 113 11.6 115.5 12 C121 13 121 22 111 29 Z"
                fill="#ff6f91"
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

/** Les cheveux de devant, selon la coiffure de la couverture. */
function Coiffure({ coiffure, cheveux, accent }) {
  if (coiffure === 'queue') {
    return (
      <path
        d="M29 70 Q27 32 60 32 Q93 32 91 70 Q88 52 76 46 Q64 55 44 50 Q34 56 29 70 Z"
        fill={cheveux}
      />
    );
  }
  if (coiffure === 'longs') {
    return (
      <g>
        <path d="M30 68 Q29 34 60 34 Q91 34 90 68 Q83 49 67 46 Q58 57 40 52 Q34 58 30 68 Z" fill={cheveux} />
        <path d="M80 42 l3 -6 l3 6 l-6 -3 h6 Z" fill={accent} />
      </g>
    );
  }
  // Hérissés : les mèches en pointes des deux garçons.
  return (
    <path
      d="M30 66 L26 48 L37 51 L34 34 L47 42 L51 25 L61 38 L70 23 L75 40 L88 32 L85 49 L95 47 L90 66 Q84 46 60 44 Q36 46 30 66 Z"
      fill={cheveux}
    />
  );
}

/** La bouche : un sourire qui attend, un grand rire, un sourire qui encourage. */
function Bouche({ humeur }) {
  if (humeur === 'bravo') {
    return (
      <g>
        <path d="M49 80 Q60 97 71 80 Z" fill="#7a2230" />
        <path d="M54 88 Q60 93 66 88 Q60 85 54 88 Z" fill="#ff8fa3" />
      </g>
    );
  }
  if (humeur === 'oups') {
    return <path d="M52 83 Q60 89 68 83" stroke="#7a2230" strokeWidth="3" strokeLinecap="round" fill="none" />;
  }
  return <path d="M51 81 Q60 89 69 81" stroke="#7a2230" strokeWidth="3" strokeLinecap="round" fill="none" />;
}
