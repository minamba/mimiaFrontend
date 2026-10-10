import { rangee, rang, useEtapes } from './communs';
import './primaire-maths-b.css';

/**
 * LA RÈGLE DES DIXIÈMES — CM1 « La règle des dixièmes », CM2 « La loupe des
 * centièmes » (09/10/2026). Deux couvertures :
 *   - AU CM1, une fillette accoudée à un muret de pierre pose le doigt sur une
 *     grande règle en bois ; des flèches de couleur pointent 0,3 ; 4,7 ; 8,9.
 *     La scène : la règle en bois sur le muret, une COCCINELLE posée au début
 *     de la règle, la flèche qui se balance ;
 *   - AU CM2, un garçon tient une grosse LOUPE devant une droite graduée
 *     lumineuse. La scène : la petite règle des dixièmes en haut, le dixième
 *     agrandi, et la règle des centièmes dans la lentille de la loupe.
 * LES RÉPONSES sont des ÉTIQUETTES accrochées par une pince à linge sur une
 * corde : on décroche la bonne.
 * APRÈS LA RÉPONSE : la coccinelle saute de trait en trait depuis le début de
 * la règle, en comptant à voix… écrite : 2,1 — 2,2 — … — 2,7, jusqu'à la
 * flèche. Pour « le plus grand / le plus petit », les deux nombres se rangent
 * chiffre par chiffre dans le tableau (unités, dixièmes, centièmes) — la
 * colonne qui décide s'allume — puis se plantent en fanions sur la règle.
 */

const x = (k) => 20 + k * 30;

/**
 * Une règle coupée en dix, la flèche sur un trait : d'un entier au suivant
 * (dixièmes, CM1), ou d'un dixième au suivant (centièmes, la loupe du CM2).
 */
export function Regle({
  gauche, droite, position, unite,
}) {
  return (
    <svg className="dixiemes__regle" viewBox="0 0 340 90" role="img" aria-label={`Une règle de ${gauche} à ${droite}, coupée en ${unite}`}>
      <line x1={x(0)} y1={50} x2={x(10)} y2={50} className="geo__trait" />
      {Array.from({ length: 11 }, (_, k) => (
        <line key={k} x1={x(k)} y1={k % 10 === 0 ? 36 : 42} x2={x(k)} y2={k % 10 === 0 ? 64 : 58} className="geo__trait" />
      ))}
      <text x={x(0)} y={84} className="dixiemes__nombre">{gauche}</text>
      <text x={x(10)} y={84} className="dixiemes__nombre">{droite}</text>
      <path d={`M ${x(position)} 32 l -8 -14 h 16 z`} className="dixiemes__fleche" />
    </svg>
  );
}

/** La coccinelle, rouge à points noirs, antennes au vent. */
function Coccinelle({ cx, cy, echelle = 1 }) {
  return (
    <g className="sc-regle-des-dixiemes__coccinelle" transform={`translate(${cx} ${cy}) scale(${echelle})`}>
      <g className="sc-regle-des-dixiemes__corps-cocci">
        <path d="M-3 -9 q-3 -6 -7 -7 M3 -9 q3 -6 7 -7" className="sc-regle-des-dixiemes__antennes" />
        <circle cx="0" cy="-7" r="5" className="sc-regle-des-dixiemes__tete" />
        <ellipse cx="0" cy="2" rx="10" ry="9" className="sc-regle-des-dixiemes__elytres" />
        <path d="M0 -6 V11" className="sc-regle-des-dixiemes__raie" />
        <circle cx="-5" cy="0" r="2.2" className="sc-regle-des-dixiemes__point" />
        <circle cx="5" cy="0" r="2.2" className="sc-regle-des-dixiemes__point" />
        <circle cx="-4" cy="6" r="1.8" className="sc-regle-des-dixiemes__point" />
        <circle cx="4" cy="6" r="1.8" className="sc-regle-des-dixiemes__point" />
      </g>
    </g>
  );
}

/**
 * LA RÈGLE QUI COMPTE, après la réponse : la coccinelle part du début et saute
 * d'un trait à l'autre ; chaque trait franchi écrit son nombre ; arrivée sous
 * la flèche, la bonne réponse s'écrit en grand.
 */
function RegleQuiCompte({
  gauche, droite, position, unite, nom, bonne,
}) {
  const k = useEtapes(position);
  const arrivee = k >= position;
  return (
    <svg className="sc-regle-des-dixiemes__compte" viewBox="0 0 340 150" role="img" aria-label={`${position} ${unite} après ${gauche} : ${bonne}`}>
      <rect x="4" y="78" width="332" height="44" rx="6" className="sc-regle-des-dixiemes__bois" />
      <line x1={x(0)} y1={100} x2={x(10)} y2={100} className="sc-regle-des-dixiemes__trait" />
      {rangee(11).map((j) => (
        <line key={j} x1={x(j)} y1={j % 10 === 0 ? 84 : 90} x2={x(j)} y2={j % 10 === 0 ? 116 : 110} className="sc-regle-des-dixiemes__trait" />
      ))}
      <text x={x(0)} y={145} className="sc-regle-des-dixiemes__bout">{gauche}</text>
      <text x={x(10)} y={145} className="sc-regle-des-dixiemes__bout">{droite}</text>
      <path d={`M ${x(position)} 80 l -8 -14 h 16 z`} className="sc-regle-des-dixiemes__fleche" />

      {/* Les sauts déjà faits, et le nombre de chaque trait franchi. */}
      {rangee(k).map((i) => (
        <g key={i}>
          <path d={`M ${x(i)} 94 Q ${x(i) + 15} 72 ${x(i + 1)} 94`} className="sc-regle-des-dixiemes__saut" />
          {i + 1 < position && (
            <text x={x(i + 1)} y={i % 2 ? 61 : 48} className="sc-regle-des-dixiemes__compteur">{`${nom}${i + 1}`}</text>
          )}
        </g>
      ))}

      <g className="sc-regle-des-dixiemes__porteur" style={{ transform: `translateX(${x(k) - x(0)}px)` }}>
        <Coccinelle cx={x(0)} cy={90} echelle={0.9} />
      </g>

      {/* L'arrivée : la bonne réponse en grand, au-dessus de la flèche. */}
      {arrivee && (
        <g className="sc-regle-des-dixiemes__arrivee">
          <rect x={Math.min(Math.max(x(position) - 36, 2), 266)} y={2} width="72" height="32" rx="10" />
          <text x={Math.min(Math.max(x(position), 38), 302)} y={26}>{bonne}</text>
        </g>
      )}
    </svg>
  );
}

/** Le CM1 : la règle en bois sur le muret, la coccinelle au départ. */
function RegleCM1({ m, termine }) {
  return (
    <div className={`sc-regle-des-dixiemes sc-regle-des-dixiemes--muret${termine ? ' est-termine' : ''}`}>
      <span className="sc-regle-des-dixiemes__lanterne" aria-hidden="true" />
      {termine ? (
        <>
          <RegleQuiCompte
            gauche={String(m.debut)}
            droite={String(m.debut + 1)}
            position={m.dixiemes}
            unite="dixièmes"
            nom={`${m.debut},`}
            bonne={m.bonne}
          />
          <p className="sc-regle-des-dixiemes__verdict">{`${m.dixiemes} dixièmes après ${m.debut} : ${m.bonne}`}</p>
        </>
      ) : (
        <div className="sc-regle-des-dixiemes__planche-regle">
          <Regle gauche={m.debut} droite={m.debut + 1} position={m.dixiemes} unite="dixièmes" />
          <svg className="sc-regle-des-dixiemes__depart" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <Coccinelle cx={20} cy={22} echelle={1.3} />
          </svg>
        </div>
      )}
    </div>
  );
}

/** « 2,3 » → [2, 3] : l'entier et le dixième agrandi par la loupe. */
const partiesDe = (texte) => String(texte).split(',').map(Number);

/** Le CM2 : la règle des dixièmes, le dixième agrandi, et la loupe. */
function LoupeCM2({ m, termine }) {
  const [u, d] = partiesDe(m.gauche);
  const ok = Number.isFinite(u) && Number.isFinite(d);
  return (
    <div className={`sc-regle-des-dixiemes sc-regle-des-dixiemes--loupe${termine ? ' est-termine' : ''}`}>
      {ok && (
        <svg className="sc-regle-des-dixiemes__mini" viewBox="0 0 340 74" aria-hidden="true" focusable="false">
          <rect x={x(d)} y="8" width="30" height="30" rx="4" className="sc-regle-des-dixiemes__zone" />
          <line x1={x(0)} y1={24} x2={x(10)} y2={24} className="sc-regle-des-dixiemes__trait-clair" />
          {rangee(11).map((j) => (
            <line key={j} x1={x(j)} y1={j % 10 === 0 ? 14 : 18} x2={x(j)} y2={j % 10 === 0 ? 34 : 30} className="sc-regle-des-dixiemes__trait-clair" />
          ))}
          <text x={x(0)} y={50} className="sc-regle-des-dixiemes__bout-clair">{u}</text>
          <text x={x(10)} y={50} className="sc-regle-des-dixiemes__bout-clair">{u + 1}</text>
          <path d={`M ${x(d)} 38 L 26 74 M ${x(d + 1)} 38 L 314 74`} className="sc-regle-des-dixiemes__rayons" />
        </svg>
      )}
      <div className="sc-regle-des-dixiemes__lentille">
        {termine ? (
          <RegleQuiCompte
            gauche={m.gauche}
            droite={m.droite}
            position={m.pas}
            unite="centièmes"
            nom={m.gauche}
            bonne={m.bonne}
          />
        ) : <Regle gauche={m.gauche} droite={m.droite} position={m.pas} unite="centièmes" />}
        <span className="sc-regle-des-dixiemes__manche" aria-hidden="true" />
      </div>
      {termine && <p className="sc-regle-des-dixiemes__verdict">{`${m.pas} centièmes après ${m.gauche} : ${m.bonne}`}</p>}
    </div>
  );
}

const COLONNES = ['unités', 'dixièmes', 'centièmes'];

/** « 3,45 » → [3, 4, 5] ; « 3,5 » → [3, 5, null]. Null si ce n'est pas un nombre à virgule. */
function chiffres(texte) {
  const t = String(texte).trim();
  if (!/^\d+,\d{1,2}$/.test(t)) return null;
  const [u, apres] = t.split(',');
  return [Number(u), Number(apres[0]), apres[1] !== undefined ? Number(apres[1]) : null];
}

/** Les deux nombres comparés : rangés dans le tableau, puis plantés sur la règle. */
function Comparaison({ m }) {
  const nombres = String(m.question).split('ou').map((s) => s.replace('?', '').trim());
  const [a, b] = nombres.map(chiffres);
  if (nombres.length !== 2 || !a || !b) return <p className="sc-regle-des-dixiemes__verdict">{String(m.bonne)}</p>;
  // La colonne qui décide : la première où les chiffres diffèrent (un centième absent vaut 0).
  const decide = [0, 1, 2].find((c) => (a[c] ?? 0) !== (b[c] ?? 0)) ?? 2;
  const plusGrand = m.consigne === 'plus-grand';
  const enA = (n) => (n === 0 ? 'aucun' : String(n));
  const [ga, gb] = [a[decide] ?? 0, b[decide] ?? 0];
  const explication = `${nombres[0]} : ${enA(ga)} ${COLONNES[decide].replace(/s$/, ga > 1 ? 's' : '')} ; ${nombres[1]} : ${enA(gb)} ${COLONNES[decide].replace(/s$/, gb > 1 ? 's' : '')}.`;
  const conclusion = m.bonne === 'egaux' ? 'Ils sont égaux.' : `${m.bonne} est le plus ${plusGrand ? 'grand' : 'petit'} !`;
  const u = a[0];
  const pos = (n) => ((n[1] ?? 0) + (n[2] ?? 0) / 10);
  return (
    <div className="sc-regle-des-dixiemes__comparaison">
      <table className="sc-regle-des-dixiemes__tableau">
        <thead>
          <tr>
            {COLONNES.map((c, i) => <th key={c} scope="col" className={i === decide ? 'est-decisive' : ''}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {[a, b].map((n, r) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={r}>
              {n.map((v, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <td key={i} className={i === decide ? 'est-decisive' : ''} style={rang(r * 3 + i)}>
                  {v === null ? '' : `${v}${i === 0 ? ',' : ''}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {a[0] === b[0] && (
        <svg className="sc-regle-des-dixiemes__fanions" viewBox="0 0 340 92" aria-hidden="true" focusable="false">
          <line x1={x(0)} y1={64} x2={x(10)} y2={64} className="sc-regle-des-dixiemes__trait-sombre" />
          {rangee(11).map((j) => (
            <line key={j} x1={x(j)} y1={j % 10 === 0 ? 54 : 58} x2={x(j)} y2={j % 10 === 0 ? 74 : 70} className="sc-regle-des-dixiemes__trait-sombre" />
          ))}
          <text x={x(0)} y={88} className="sc-regle-des-dixiemes__bout">{u}</text>
          <text x={x(10)} y={88} className="sc-regle-des-dixiemes__bout">{u + 1}</text>
          {[[a, nombres[0]], [b, nombres[1]]].map(([n, t], i) => (
            <g key={t} transform={`translate(${pos(n) * 30} 0)`}>
              <g className={`sc-regle-des-dixiemes__fanion${t === m.bonne ? ' est-bon' : ''}`} style={rang(i)}>
                <line x1={x(0)} y1={64} x2={x(0)} y2={i ? 30 : 8} />
                <rect x={x(0)} y={i ? 30 : 8} width="46" height="20" rx="3" />
                <text x={x(0) + 23} y={i ? 45 : 23}>{t}</text>
              </g>
            </g>
          ))}
        </svg>
      )}
      <p className="sc-regle-des-dixiemes__verdict">
        {explication}
        <br />
        <strong>{conclusion}</strong>
      </p>
    </div>
  );
}

/** Le plus grand (CM1), le zéro qui compte (CM2) : la question sur une planche. */
function Duel({ m, termine }) {
  return (
    <div className={`sc-regle-des-dixiemes sc-regle-des-dixiemes--duel${termine ? ' est-termine' : ''}`}>
      <div className="sc-regle-des-dixiemes__planche">
        <p className="grands__nombre">{m.question}</p>
        <svg className="sc-regle-des-dixiemes__cocci-planche" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <Coccinelle cx={20} cy={22} echelle={1.3} />
        </svg>
      </div>
      {termine && <Comparaison m={m} />}
    </div>
  );
}

export function QuestionDixiemes({ m, termine }) {
  if (m.consigne === 'regle') return <RegleCM1 m={m} termine={termine} />;
  if (m.consigne === 'loupe') return <LoupeCM2 m={m} termine={termine} />;
  if (typeof m.question === 'string') return <Duel m={m} termine={termine} />;
  return <p className="grands__nombre">{String(m.bonne ?? '')}</p>;
}

/** Les étiquettes pincées sur la corde à linge : on décroche la bonne. */
export function CordeAEtiquettes({ choix, fautes, choisir }) {
  return (
    <div className="sc-regle-des-dixiemes__corde" role="group" aria-label="Décroche la bonne étiquette">
      <span className="sc-regle-des-dixiemes__fil" aria-hidden="true" />
      <ul className="sc-regle-des-dixiemes__etiquettes">
        {choix.map(({ cle, libelle }, i) => {
          const faux = fautes.includes(cle);
          return (
            <li key={cle} style={{ '--i': i }}>
              <span className="sc-regle-des-dixiemes__pince" aria-hidden="true" />
              <button
                type="button"
                className={`sc-regle-des-dixiemes__etiquette${faux ? ' est-fausse' : ''}`}
                onClick={() => choisir(cle)}
                disabled={faux}
              >
                {libelle}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const SCENE_DIXIEMES = {
  rendreQuestion: (m, termine) => <QuestionDixiemes m={m} termine={termine} />,
  // La coccinelle arrive sous la flèche, le fanion du bon nombre s'allume.
  rendreApres: () => null,
  rendreLesChoix: (props) => <CordeAEtiquettes {...props} />,
};
