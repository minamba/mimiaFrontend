import { Decor, Mascotte } from './communs';

/**
 * LE DÉTECTIVE DU VERBE, SON UNIVERS (09/10/2026). La couverture : un bureau
 * de détective la nuit — la lampe allumée, la loupe devant un grand œil, le
 * tableau de liège aux fils rouges, une carte au trésor où des empreintes de
 * pas mènent au « verbe » ENTOURÉ DE ROUGE. La scène reprend :
 *   - LE DÉCOR : la lune qui luit à la fenêtre, la lanterne qui vacille, le
 *     cône de la lampe où dansent des poussières, des points
 *     d'interrogation qui flottent, des empreintes qui avancent en bas ;
 *   - LA PHRASE devient la carte de l'enquête (papier ancien) ; le verbe
 *     trouvé s'entoure d'un trait rouge à main levée, le sujet d'un trait
 *     bleu — les couleurs de la classe, comme sur la carte de la couverture ;
 *   - LA MASCOTTE : la loupe au grand œil, coiffée de la casquette du
 *     détective — l'œil fouille la pièce, cligne, sourit quand l'indice est
 *     trouvé ; elle hoche la tête pour encourager ;
 *   - LA FÊTE : l'affaire est résolue, le tampon tombe (voir `DetectiveDuVerbe.js`).
 */

const POUSSIERES = [[18, 3, 7], [26, 5, 9], [12, 2, 8], [32, 6, 10], [22, 1, 6.5], [8, 4, 9.5]];
const QUESTIONS = [[6, 34, 0], [93, 26, 2.4], [90, 62, 4.6], [4, 70, 1.2]];
const PAS = [0, 1, 2, 3, 4, 5, 6, 7];

/** Le bureau de l'enquête, derrière la phrase. `resolu` : le tampon tombe. */
export function DecorBureau({ resolu }) {
  return (
    <Decor className="sc-detective-du-verbe__decor">
      <span className="sc-detective-du-verbe__lune" />
      <span className="sc-detective-du-verbe__lanterne" />
      <span className="sc-detective-du-verbe__cone" />
      {POUSSIERES.map(([x, delai, duree]) => (
        <span
          key={x}
          className="sc-detective-du-verbe__poussiere"
          style={{ '--x': `${x}%`, '--delai': `${-delai}s`, '--duree': `${duree}s` }}
        />
      ))}
      {QUESTIONS.map(([x, y, delai]) => (
        <span key={x} className="sc-detective-du-verbe__question" style={{ '--x': `${x}%`, '--y': `${y}%`, '--delai': `${-delai}s` }} />
      ))}
      <span className="sc-detective-du-verbe__piste">
        {PAS.map((i) => (
          <svg key={i} className={`sc-detective-du-verbe__pas${i % 2 ? ' est-droit' : ''}`} style={{ '--n': i }} viewBox="0 0 24 40" focusable="false">
            <ellipse cx="12" cy="13" rx="8" ry="11" />
            <ellipse cx="12" cy="32" rx="6" ry="6.5" />
          </svg>
        ))}
      </span>
      {resolu && (
        <svg className="sc-detective-du-verbe__tampon" viewBox="0 0 100 100" focusable="false">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#d62828" strokeWidth="6" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#d62828" strokeWidth="2.5" strokeDasharray="5 4" />
          <path d="M30 52 L45 66 L72 34" fill="none" stroke="#d62828" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Decor>
  );
}

/** La loupe au grand œil, coiffée de sa casquette à carreaux. */
export function Loupe({ humeur, declic }) {
  return (
    <Mascotte nom="loupe" humeur={humeur} declic={declic}>
      <svg className="sc-detective-du-verbe__loupe" viewBox="0 0 120 140" focusable="false">
        <path d="M78 84 L108 128" stroke="#5a3a1c" strokeWidth="14" strokeLinecap="round" />
        <path d="M80 88 L104 122" stroke="#8a5a2b" strokeWidth="7" strokeLinecap="round" />
        <circle cx="52" cy="60" r="40" fill="#eaf6ff" stroke="#c9952c" strokeWidth="9" />
        <circle cx="52" cy="60" r="35" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
        <g className="sc-detective-du-verbe__oeil">
          <ellipse cx="52" cy="62" rx="26" ry="18" fill="#fff" stroke="#7a8794" strokeWidth="1.5" />
          <g className="sc-detective-du-verbe__regard">
            <circle cx="52" cy="62" r="12" fill="#8a5a2b" />
            <circle cx="52" cy="62" r="6" fill="#1b1209" />
            <circle cx="48" cy="58" r="3" fill="#fff" />
          </g>
          <path className="sc-detective-du-verbe__paupiere" d="M26 62 Q52 30 78 62 Q52 46 26 62 Z" fill="#f2c9a0" />
        </g>
        <path className="sc-detective-du-verbe__oeil-rieur" d="M32 66 Q52 44 72 66" fill="none" stroke="#1b1209" strokeWidth="5" strokeLinecap="round" />
        <path d="M24 38 Q22 8 52 6 Q84 8 82 38 Q52 26 24 38 Z" fill="#8a6a45" stroke="#4e3117" strokeWidth="2.5" />
        <path d="M30 32 Q52 22 76 32 M40 10 V30 M54 7 V27 M68 10 V30" stroke="#5e4428" strokeWidth="1.6" fill="none" opacity="0.7" />
        <path d="M80 34 Q100 36 104 46 Q92 42 80 40 Z" fill="#8a6a45" stroke="#4e3117" strokeWidth="2" />
        <path d="M40 8 Q52 0 64 8" stroke="#4e3117" strokeWidth="3" fill="none" />
      </svg>
    </Mascotte>
  );
}
