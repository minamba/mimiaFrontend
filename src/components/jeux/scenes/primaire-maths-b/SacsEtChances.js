import { rangee, rang } from './communs';
import './primaire-maths-b.css';

/**
 * LE SAC DE BILLES — CM1 « Le sac de billes », CM2 « Deux sacs, les mêmes
 * chances ? » (09/10/2026). Deux couvertures :
 *   - AU CM1, une fillette joue aux billes sur les pavés d'un village au bord
 *     de la mer ; un sac de toile renversé laisse rouler des billes de verre.
 *     La scène : le sac ouvert dans le cercle de jeu tracé à la craie, la
 *     question sur l'ardoise, une bille-mystère qui saute au-dessus du sac
 *     (on tire sans regarder). Les réponses changent selon la question :
 *       · impossible / possible / certain : on pose la bille sur l'ÉCHELLE DES
 *         CHANCES, de « jamais » à « sûr » ;
 *       · la couleur : on choisit une grosse BILLE de cette couleur ;
 *       · « 3 sur 8 » : on choisit une ÉTIQUETTE de sac.
 *     Après : les billes de la couleur demandée s'allument ; pour « le plus de
 *     chances », elles se rangent en colonnes par couleur ; pour « combien de
 *     chances », la fraction se construit (les billes de la couleur sur
 *     toutes les billes).
 *   - AU CM2, deux sacs de velours bleu nuit à étoiles d'or. On répond sur une
 *     BALANCE DES CHANCES : le plateau de gauche (le sac A, ou la première
 *     issue), celui de droite, ou le fléau au milieu (« autant »). Les
 *     situations (dé, pièce, roue, sac, cartes) sont dessinées et animées.
 *     Après : chaque sac ou chaque issue montre sa PART — une jauge coupée en
 *     autant de cases que de billes (ou de faces, de cases de la roue…).
 */

const TEINTES = {
  rouge: '#d8434a', bleue: '#3a78c9', verte: '#3fa26b', jaune: '#f2c230',
};

/** « rouges », « bleu », « vertes » → la couleur du module : rouge, bleue, verte, jaune. */
function couleurDe(mot) {
  const m = String(mot ?? '').toLowerCase();
  if (m.startsWith('roug')) return 'rouge';
  if (m.startsWith('bleu')) return 'bleue';
  if (m.startsWith('vert')) return 'verte';
  if (m.startsWith('jaun')) return 'jaune';
  return null;
}

/** « 3 billes rouges », « 1 face » : chaque mot prend son s. */
const pluriel = (n, mot) => `${n} ${n > 1 ? mot.split(' ').map((w) => `${w}s`).join(' ') : mot}`;

/**
 * Le sac ouvert et ses billes — on les voit, mais on tire sans regarder.
 * `brille` : la couleur dont les billes s'allument, une fois la réponse donnée.
 */
export function Sac({ sac, nom, brille = null }) {
  const billes = Object.entries(sac).flatMap(([couleur, n]) => Array(n).fill(couleur));
  const description = Object.entries(sac).filter(([, n]) => n > 0).map(([c, n]) => `${n} ${c}${n > 1 ? 's' : ''}`).join(', ');
  return (
    <div className="billes__sac" role="img" aria-label={`${nom ? `Le sac ${nom}` : 'Dans le sac'} : ${description}`}>
      {nom && <span className="billes__nom">{nom}</span>}
      {billes.map((c, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`billes__bille billes__bille--${c}${brille && c === brille ? ' sc-sac-de-billes__brille' : ''}${brille && c !== brille ? ' sc-sac-de-billes__eteinte' : ''}`}
          style={rang(i)}
        />
      ))}
    </div>
  );
}

/** La bille qu'on va tirer, sans regarder : grise, un « ? », elle saute. */
function BilleMystere() {
  return <span className="sc-sac-de-billes__mystere" aria-hidden="true">?</span>;
}

/** L'échelle des chances : de « jamais » à « sûr ». `pose` : où la bille s'est arrêtée. */
const CRANS = ['impossible', 'possible', 'certain'];
function Echelle({ pose }) {
  const k = CRANS.indexOf(pose);
  return (
    <div className="sc-sac-de-billes__echelle" aria-hidden="true">
      <span className="sc-sac-de-billes__rail" />
      {CRANS.map((c, i) => (
        <span key={c} className={`sc-sac-de-billes__cran${i === k ? ' est-pose' : ''}`} style={{ '--x': `${i * 50}%` }}>
          <i />
          {c}
        </span>
      ))}
      {k >= 0 && <span className="sc-sac-de-billes__roule" style={{ '--x': `${k * 50}%` }} />}
    </div>
  );
}

/** « Tirer une bille rouge, c'est… » → rouge. */
const couleurDemandee = (m) => couleurDe(/bille (\S+?)[ ,?]/.exec(String(m.question ?? ''))?.[1]);

/** Après la réponse, au CM1 : pourquoi, avec les billes. */
function PreuveCM1({ m }) {
  const total = Object.values(m.sac).reduce((a, b) => a + b, 0);
  if (m.consigne === 'plus') {
    const max = Math.max(...Object.values(m.sac));
    return (
      <div className="sc-sac-de-billes__preuve">
        <div className="sc-sac-de-billes__colonnes" aria-hidden="true">
          {Object.entries(m.sac).map(([c, n], k) => (
            <span key={c} className={`sc-sac-de-billes__colonne${n === max ? ' est-max' : ''}`} style={rang(k)}>
              {rangee(n).map((i) => <i key={i} className={`billes__bille billes__bille--${c}`} style={rang(i)} />)}
              <b>{n}</b>
            </span>
          ))}
        </div>
        <p className="sc-sac-de-billes__verdict">{`${pluriel(max, `bille ${m.bonne}`)} : c’est la couleur la plus nombreuse.`}</p>
      </div>
    );
  }
  const c = couleurDemandee(m);
  const n = c ? m.sac[c] ?? 0 : 0;
  if (m.consigne === 'sur' && c) {
    return (
      <div className="sc-sac-de-billes__preuve">
        <div className="sc-sac-de-billes__fraction" aria-hidden="true">
          <span className="sc-sac-de-billes__haut">
            {rangee(n).map((i) => <i key={i} className={`billes__bille billes__bille--${c}`} style={rang(i)} />)}
          </span>
          <span className="sc-sac-de-billes__barre-fraction" />
          <span className="sc-sac-de-billes__bas">
            {Object.entries(m.sac).flatMap(([coul, k]) => rangee(k).map((i) => (
              <i key={`${coul}${i}`} className={`billes__bille billes__bille--${coul}`} />
            )))}
          </span>
        </div>
        <p className="sc-sac-de-billes__verdict">{`${pluriel(n, `bille ${c}`)} sur ${total} billes en tout : ${m.bonne}.`}</p>
      </div>
    );
  }
  const phrase = {
    impossible: `Aucune bille ${c ?? ''} dans le sac : c’est impossible.`,
    certain: `Toutes les billes sont ${c ?? ''}s : c’est certain.`,
    possible: `${pluriel(n, `bille ${c ?? ''}`)} sur ${total} : ça peut arriver, ou pas. C’est possible.`,
  }[m.bonne] ?? String(m.bonne);
  return (
    <div className="sc-sac-de-billes__preuve">
      <Echelle pose={m.bonne} />
      <p className="sc-sac-de-billes__verdict">{phrase}</p>
    </div>
  );
}

/** Le CM1 : le sac ouvert dans le cercle de jeu, et l'ardoise. */
function SacCM1({ m, termine }) {
  const brille = termine && m.consigne !== 'plus' ? couleurDemandee(m) : null;
  return (
    <div className={`sc-sac-de-billes sc-sac-de-billes--toile${termine ? ' est-termine' : ''}`}>
      <div className="sc-sac-de-billes__ardoise">
        <p className="phrase-a-trou">{m.question}</p>
      </div>
      <div className="sc-sac-de-billes__cercle">
        {!termine && <BilleMystere />}
        <span className="sc-sac-de-billes__lien" aria-hidden="true" />
        <Sac sac={m.sac} brille={brille ?? (termine && m.consigne === 'plus' ? m.bonne : null)} />
      </div>
      {termine && <PreuveCM1 m={m} />}
    </div>
  );
}

/** Une jauge de chances : `n` cases allumées sur `total`. */
function Jauge({ n, total, couleur = 'rouge', titre }) {
  const largeur = Math.max(1, total);
  return (
    <div className="sc-sac-de-billes__jauge">
      <span className="sc-sac-de-billes__titre-jauge">{titre}</span>
      <span className="sc-sac-de-billes__cases" aria-hidden="true">
        {rangee(largeur).map((i) => (
          <i
            key={i}
            className={i < n ? 'est-pleine' : ''}
            style={{ ...rang(i), ...(i < n ? { background: TEINTES[couleur] ?? couleur } : {}) }}
          />
        ))}
      </span>
    </div>
  );
}

/** Les situations du CM2 : un dé, une pièce, une roue, un sac, des cartes. */
export function situation(question) {
  const q = String(question ?? '');
  // `\b` ne connaît pas les accents : « dé » se cherche entre deux espaces.
  if (/(^|\s)dé(\s|$)/.test(q)) return { sorte: 'de', total: 6, unite: 'face' };
  if (/pièce/.test(q)) return { sorte: 'piece', total: 2, unite: 'face' };
  if (/roue/.test(q)) {
    const cases = [...q.matchAll(/(\d+) cases? (\S+?)[ .,]/g)].map(([, n, c]) => ({ n: Number(n), couleur: couleurDe(c) ?? c }));
    return cases.length ? { sorte: 'roue', cases, total: cases.reduce((s, c) => s + c.n, 0), unite: 'case' } : null;
  }
  if (/sac/.test(q)) {
    const sac = {};
    [...q.matchAll(/(\d+) billes? (\S+?)[ .,]/g)].forEach(([, n, c]) => { sac[couleurDe(c) ?? c] = Number(n); });
    const total = Object.values(sac).reduce((s, n) => s + n, 0);
    return total ? { sorte: 'sac', sac, total, unite: 'bille' } : null;
  }
  if (/carte/.test(q)) {
    const n = Number(/de 1 à (\d+)/.exec(q)?.[1]) || 10;
    return { sorte: 'cartes', total: n, unite: 'carte' };
  }
  return null;
}

/** Combien de faces, de cases ou de billes donnent cette issue. */
export function compte(sit, issue) {
  const t = String(issue ?? '');
  if (!sit) return null;
  if (sit.sorte === 'de') {
    if (/pair/.test(t)) return { n: 3, couleur: 'bleue' };
    if (/impair/.test(t)) return { n: 3, couleur: 'bleue' };
    return /\d/.test(t) ? { n: 1, couleur: 'bleue' } : null;
  }
  if (sit.sorte === 'piece' || sit.sorte === 'cartes') return { n: 1, couleur: 'jaune' };
  const couleur = couleurDe(t.split(' ').pop());
  if (sit.sorte === 'roue') {
    const c = sit.cases.find((x) => x.couleur === couleur);
    return c ? { n: c.n, couleur } : null;
  }
  if (sit.sorte === 'sac') return couleur && sit.sac[couleur] ? { n: sit.sac[couleur], couleur } : null;
  return null;
}

/** Le dessin animé de la situation : le dé roule, la pièce tourne, la roue aussi. */
function Situation({ sit }) {
  if (!sit) return null;
  if (sit.sorte === 'de') {
    return (
      <svg className="sc-sac-de-billes__de" viewBox="0 0 80 80" aria-hidden="true" focusable="false">
        <rect x="6" y="6" width="68" height="68" rx="14" />
        {[[24, 24], [56, 24], [40, 40], [24, 56], [56, 56]].map(([x, y]) => <circle key={`${x}.${y}`} cx={x} cy={y} r="6" />)}
      </svg>
    );
  }
  if (sit.sorte === 'piece') {
    return (
      <span className="sc-sac-de-billes__piece" aria-hidden="true">
        <span>€</span>
      </span>
    );
  }
  if (sit.sorte === 'roue') {
    // Les couleurs alternées, comme une vraie roue de fête foraine : une de chaque, tour à tour.
    const plusLongue = Math.max(...sit.cases.map((c) => c.n));
    const vrai = rangee(plusLongue).flatMap((k) => sit.cases.filter((c) => c.n > k).map((c) => c.couleur));
    const n = vrai.length;
    const point = (k) => {
      const a = (k / n) * 2 * Math.PI - Math.PI / 2;
      return [50 + 44 * Math.cos(a), 50 + 44 * Math.sin(a)];
    };
    return (
      <span className="sc-sac-de-billes__roue" aria-hidden="true">
        <svg viewBox="0 0 100 100" focusable="false">
          <g className="sc-sac-de-billes__tourne">
            {vrai.map((c, k) => {
              const [x1, y1] = point(k);
              const [x2, y2] = point(k + 1);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <path key={k} d={`M50 50 L${x1} ${y1} A44 44 0 ${n === 1 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={TEINTES[c] ?? '#ccc'} stroke="#fff" strokeWidth="2" />
              );
            })}
            <circle cx="50" cy="50" r="6" fill="#fff" stroke="#123" strokeWidth="2" />
          </g>
          <path d="M43 0 L57 0 L50 13 Z" fill="#123" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </span>
    );
  }
  if (sit.sorte === 'sac') return <span className="sc-sac-de-billes__velours"><Sac sac={sit.sac} /></span>;
  return (
    <span className="sc-sac-de-billes__cartes" aria-hidden="true">
      {rangee(Math.min(sit.total, 12)).map((i) => <i key={i} style={{ ...rang(i), '--a': `${(i - (Math.min(sit.total, 12) - 1) / 2) * 7}deg` }}>{i + 1}</i>)}
    </span>
  );
}

/** Le CM2 : deux sacs de velours, ou une situation dessinée. */
function SacsCM2({ m, termine }) {
  if (m.sacs) {
    const part = (sac) => ({ n: sac.rouge ?? 0, total: Object.values(sac).reduce((a, b) => a + b, 0) });
    const a = part(m.sacs.a);
    const b = part(m.sacs.b);
    const verdict = { a: 'Le sac A : la plus grande part de rouges.', b: 'Le sac B : la plus grande part de rouges.', autant: 'La même part de rouges : autant de chances !' }[m.bonne];
    return (
      <div className={`sc-sac-de-billes sc-sac-de-billes--velours${termine ? ' est-termine' : ''}`}>
        <div className="sc-sac-de-billes__ardoise sc-sac-de-billes__ardoise--nuit">
          <p className="phrase-a-trou">{m.question}</p>
        </div>
        <div className="billes__deux">
          {[['A', m.sacs.a, a], ['B', m.sacs.b, b]].map(([nom, sac, p]) => (
            <div key={nom} className={`sc-sac-de-billes__sac-nuit${termine && (m.bonne === 'autant' || m.bonne === nom.toLowerCase()) ? ' est-gagnant' : ''}`}>
              <span className="sc-sac-de-billes__cordon" aria-hidden="true" />
              <Sac sac={sac} nom={nom} brille={termine ? 'rouge' : null} />
              {termine && <Jauge n={p.n} total={p.total} titre={`${pluriel(p.n, 'rouge')} sur ${p.total}`} />}
            </div>
          ))}
        </div>
        {termine && <p className="sc-sac-de-billes__verdict">{verdict}</p>}
      </div>
    );
  }
  const sit = situation(m.question);
  const [ia, ib] = [m.choix.find((c) => c.cle === 'a')?.libelle, m.choix.find((c) => c.cle === 'b')?.libelle];
  const ca = compte(sit, ia);
  const cb = compte(sit, ib);
  const unite = sit?.unite ?? '';
  const bonne = m.choix.find((c) => c.cle === m.bonne)?.libelle ?? '';
  return (
    <div className={`sc-sac-de-billes sc-sac-de-billes--velours${termine ? ' est-termine' : ''}`}>
      <div className="sc-sac-de-billes__ardoise sc-sac-de-billes__ardoise--nuit">
        <p className="phrase-a-trou">{m.question}</p>
      </div>
      <div className="sc-sac-de-billes__situation">
        <Situation sit={sit} />
      </div>
      {termine && sit && ca && cb && (
        <div className="sc-sac-de-billes__jauges">
          <Jauge n={ca.n} total={sit.total} couleur={ca.couleur} titre={`${ia} : ${pluriel(ca.n, unite)} sur ${sit.total}`} />
          <Jauge n={cb.n} total={sit.total} couleur={cb.couleur} titre={`${ib} : ${pluriel(cb.n, unite)} sur ${sit.total}`} />
        </div>
      )}
      {termine && (
        <p className="sc-sac-de-billes__verdict">
          {m.bonne === 'autant' ? 'Autant de chances : chaque issue a la même part.' : `${bonne} : plus de chances.`}
        </p>
      )}
    </div>
  );
}

export function QuestionBilles({ m, termine }) {
  if (m.sac) return <SacCM1 m={m} termine={termine} />;
  return <SacsCM2 m={m} termine={termine} />;
}

/** Un bouton-réponse du sac de billes. */
function Reponse({
  c, fautes, choisir, classe, style,
}) {
  const faux = fautes.includes(c.cle);
  return (
    <button
      type="button"
      className={`${classe}${faux ? ' est-fausse' : ''}`}
      onClick={() => choisir(c.cle)}
      disabled={faux}
      style={style}
    >
      {c.libelle}
    </button>
  );
}

/** Les réponses, jouées selon la question : échelle, billes, étiquettes, balance. */
export function ReponsesBilles({
  m, choix, fautes, choisir,
}) {
  const parCle = Object.fromEntries(choix.map((c) => [String(c.cle), c]));

  // CM2 : la balance des chances — A à gauche, B à droite, « autant » au milieu.
  if (parCle.a && parCle.b && parCle.autant && choix.length === 3) {
    return (
      <div className="sc-sac-de-billes__balance" role="group" aria-label="La balance des chances">
        <span className="sc-sac-de-billes__fleau" aria-hidden="true" />
        <span className="sc-sac-de-billes__plateau sc-sac-de-billes__plateau--a">
          <Reponse c={parCle.a} fautes={fautes} choisir={choisir} classe="sc-sac-de-billes__coupe" />
        </span>
        <span className="sc-sac-de-billes__pilier">
          <Reponse c={parCle.autant} fautes={fautes} choisir={choisir} classe="sc-sac-de-billes__egal" />
        </span>
        <span className="sc-sac-de-billes__plateau sc-sac-de-billes__plateau--b">
          <Reponse c={parCle.b} fautes={fautes} choisir={choisir} classe="sc-sac-de-billes__coupe" />
        </span>
      </div>
    );
  }

  // CM1, impossible / possible / certain : l'échelle des chances.
  if (m.consigne === 'vocabulaire') {
    return (
      <div className="sc-sac-de-billes__echelle-choix" role="group" aria-label="L’échelle des chances">
        <span className="sc-sac-de-billes__rail" aria-hidden="true" />
        {choix.map((c, i) => (
          <Reponse key={c.cle} c={c} fautes={fautes} choisir={choisir} classe="sc-sac-de-billes__station" style={{ '--i': i }} />
        ))}
      </div>
    );
  }

  // La couleur : de grosses billes de verre ; « 3 sur 8 » : des étiquettes de sac.
  const sorte = m.consigne === 'plus' ? 'grosse-bille' : 'etiquette';
  return (
    <ul className={`sc-sac-de-billes__reponses sc-sac-de-billes__reponses--${sorte}`} aria-label="Choisis ta réponse">
      {choix.map((c, i) => (
        <li key={c.cle} style={{ '--i': i }}>
          <Reponse
            c={c}
            fautes={fautes}
            choisir={choisir}
            classe={`sc-sac-de-billes__${sorte}${sorte === 'grosse-bille' ? ` sc-sac-de-billes__grosse-bille--${c.cle}` : ''}`}
          />
        </li>
      ))}
    </ul>
  );
}

export const SCENE_BILLES = {
  rendreQuestion: (m, termine) => <QuestionBilles m={m} termine={termine} />,
  // Les billes allumées, les jauges et le verdict montrent la réponse.
  rendreApres: () => null,
  rendreLesChoix: (props) => <ReponsesBilles {...props} />,
};
