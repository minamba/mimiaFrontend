import * as roue from '../../../../lib/jeux/roueDesVerbes';
import {
  Cligne, Fete, Mascotte, humeurDe,
} from './communs';

/**
 * LA ROUE DES VERBES, SON UNIVERS (09/10/2026). La couverture : une grande
 * roue de fête foraine en bois, couronnée d'ampoules, aux parts de couleur
 * (« Je » rouge, « Tu » orange, « Il Elle On » vert, « Nous » bleu…), une
 * flèche dorée en haut, et une fillette qui tire le levier, au bord d'une
 * rivière pavoisée. La scène reprend :
 *   - LA ROUE : le levier s'abaisse, la roue fait plusieurs tours et s'arrête
 *     sur le pronom de la manche ; les ampoules clignotent. Une fois la
 *     réponse donnée, elles s'allument en farandole, et la TERMINAISON du
 *     verbe s'allume dans la phrase (« nous chant|ons ») — on voit ce qui
 *     change avec le pronom ;
 *   - LES RÉPONSES : des tickets de manège suspendus à un fil, qui se
 *     balancent doucement (`choix`) — un clic suffit, toujours ;
 *   - LA MASCOTTE : Lumi, une ampoule de la roue, qui s'illumine et saute à
 *     la bonne réponse, et penche la tête pour encourager.
 * Le pronom n'est pas un secret (la roue le donne) ; la forme, si : rien ne
 * la montre avant la réponse.
 */

/** Une couleur par part, celles de la couverture. */
const COULEURS = ['#e5533d', '#f59f2c', '#43a047', '#2e9e8f', '#1e88e5', '#7e57c2', '#ec5f9c', '#c2185b'];
const AMPOULES = Array.from({ length: 16 }, (_, i) => i);

/** La roue foraine : le cadre, les ampoules, le disque des pronoms, la flèche, le levier. */
function RoueForaine({ pronom, termine }) {
  const n = roue.PRONOMS.length;
  const i = Math.max(0, roue.PRONOMS.indexOf(pronom));
  // La roue tourne pour amener le pronom tiré sous la flèche, en haut.
  const angle = -((i + 0.5) / n) * 360;
  return (
    <svg
      className={`sc-roue-des-verbes__roue${termine ? ' est-gagnee' : ''}`}
      viewBox="-96 -92 192 196"
      role="img"
      aria-label={`La roue s’est arrêtée sur « ${pronom} »`}
    >
      <path d="M0 0 L-48 96 M0 0 L48 96" stroke="#6b4423" strokeWidth="9" strokeLinecap="round" />
      <rect x="-62" y="90" width="124" height="10" rx="4" fill="#5a3417" />
      <g className="sc-roue-des-verbes__levier">
        <rect x="64" y="72" width="26" height="24" rx="4" fill="#7a4a22" stroke="#3f2612" strokeWidth="2" />
        <g className="sc-roue-des-verbes__manche">
          <path d="M77 76 L77 40" stroke="#5a3417" strokeWidth="6" strokeLinecap="round" />
          <circle cx="77" cy="38" r="7" fill="#e5383b" stroke="#8c1d1f" strokeWidth="2" />
        </g>
      </g>
      <circle r="70" fill="#7a4a22" stroke="#3f2612" strokeWidth="3" />
      <circle r="61" fill="#4a2a12" />
      {AMPOULES.map((k) => {
        const a = (k / AMPOULES.length) * 2 * Math.PI;
        return (
          <circle
            key={k}
            className={`sc-roue-des-verbes__ampoule${k % 2 ? ' est-b' : ''}`}
            style={{ '--n': k }}
            cx={65.5 * Math.cos(a)}
            cy={65.5 * Math.sin(a)}
            r="3.4"
          />
        );
      })}
      <g className="sc-roue-des-verbes__elan">
        <g style={{ transform: `rotate(${angle}deg)` }}>
          {roue.PRONOMS.map((p, k) => {
            const a0 = (k / n) * 2 * Math.PI - Math.PI / 2;
            const a1 = ((k + 1) / n) * 2 * Math.PI - Math.PI / 2;
            const am = (a0 + a1) / 2;
            const tx = 38 * Math.cos(am);
            const ty = 38 * Math.sin(am);
            return (
              <g key={p}>
                <path
                  d={`M0 0 L${58 * Math.cos(a0)} ${58 * Math.sin(a0)} A58 58 0 0 1 ${58 * Math.cos(a1)} ${58 * Math.sin(a1)} Z`}
                  fill={COULEURS[k % COULEURS.length]}
                  className={`sc-roue-des-verbes__part${p === pronom ? ' est-tiree' : ''}`}
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="sc-roue-des-verbes__pronom"
                  // TOUJOURS DROIT : la roue tourne, ses mots non (voir l'ancienne roue).
                  transform={`rotate(${-angle} ${tx} ${ty})`}
                >
                  {p}
                </text>
              </g>
            );
          })}
        </g>
      </g>
      <circle r="15" fill="#3b2412" stroke="#e3b33e" strokeWidth="3" />
      <path d="M0 -8 l2.4 5 5.6 .8 -4 4 1 5.6 -5 -2.6 -5 2.6 1 -5.6 -4 -4 5.6 -.8z" fill="#f7d038" />
      <path className="sc-roue-des-verbes__fleche" d="M0 -54 L-11 -76 L0 -90 L11 -76 Z" fill="#f7c51e" stroke="#9c7419" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Le petit dessin du moment, au CE2 : le soleil couchant d'hier, le soleil d'aujourd'hui, l'aube de demain. */
function DessinDuMoment({ temps }) {
  if (temps === 'imparfait') {
    return (
      <svg className="sc-roue-des-verbes__moment" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15 4 A8 8 0 1 0 20 16 A7 7 0 0 1 15 4 Z" fill="#7e8cc9" />
      </svg>
    );
  }
  if (temps === 'futur') {
    return (
      <svg className="sc-roue-des-verbes__moment" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 17 A8 8 0 0 1 20 17 Z" fill="#f59f2c" />
        <path d="M2 19 H22 M12 3 V6 M4.5 8 L6.5 10 M19.5 8 L17.5 10" stroke="#e07b00" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="sc-roue-des-verbes__moment" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="5.5" fill="#f7c51e" />
      <path d="M12 1.5 V4.5 M12 19.5 V22.5 M1.5 12 H4.5 M19.5 12 H22.5 M4.5 4.5 L6.6 6.6 M17.4 17.4 L19.5 19.5 M4.5 19.5 L6.6 17.4 M17.4 6.6 L19.5 4.5" stroke="#e0a800" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * LA TERMINAISON : « chantons » → ['chant', 'ons'] ; au futur, « chanterai »
 * → ['chanter', 'ai'] (l'infinitif, puis la fin). Être et avoir ne suivent
 * pas la règle : pas de coupure, la forme entière s'allume.
 */
export function terminaison(verbe, f, temps) {
  if (verbe === 'être' || verbe === 'avoir') return null;
  const base = temps === 'futur' ? verbe : verbe.slice(0, -2);
  if (!f.startsWith(base) || f.length <= base.length) return null;
  return [base, f.slice(base.length)];
}

/** La phrase conjuguée, une fois la réponse donnée : le pronom, le radical, la terminaison allumée. */
function PhraseConjuguee({ m }) {
  const f = roue.forme(m.verbe, m.pronom, m.temps);
  const tout = roue.avecPronom(m.pronom, f);
  const debut = tout.slice(0, tout.length - f.length);
  const coupe = terminaison(m.verbe, f, m.temps);
  return (
    <>
      {debut}
      {coupe ? (
        <span className="sc-roue-des-verbes__forme">
          {coupe[0]}
          <strong className="sc-roue-des-verbes__fin">{coupe[1]}</strong>
        </span>
      ) : <strong className="sc-roue-des-verbes__fin sc-roue-des-verbes__fin--entiere">{f}</strong>}
    </>
  );
}

/** Lumi, l'ampoule de la roue : un culot doré, un verre qui s'allume. */
function Lumi({ humeur, declic }) {
  return (
    <Mascotte nom="ampoule" humeur={humeur} declic={declic}>
      <svg className="sc-roue-des-verbes__lumi" viewBox="0 0 100 130" focusable="false">
        <g className="sc-roue-des-verbes__rayons">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M50 6 V-6" stroke="#ffd23f" strokeWidth="5" strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
          ))}
        </g>
        <circle className="sc-roue-des-verbes__verre" cx="50" cy="50" r="36" fill="#fff3b0" stroke="#e0a800" strokeWidth="3.5" />
        <path d="M30 34 Q36 22 48 20" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
        <rect x="34" y="84" width="32" height="10" rx="3" fill="#c9952c" />
        <rect x="36" y="94" width="28" height="9" rx="3" fill="#b07f1f" />
        <rect x="40" y="103" width="20" height="9" rx="3" fill="#c9952c" />
        <path d="M44 112 Q50 120 56 112" fill="#7a5a12" />
        <Cligne decalage={0.7}>
          <circle cx="39" cy="50" r="5.5" fill="#3b2600" />
          <circle cx="61" cy="50" r="5.5" fill="#3b2600" />
          <circle cx="37.6" cy="48.4" r="1.8" fill="#fff" />
          <circle cx="59.6" cy="48.4" r="1.8" fill="#fff" />
        </Cligne>
        <circle cx="30" cy="62" r="4.5" fill="#ffa3a3" opacity="0.8" />
        <circle cx="70" cy="62" r="4.5" fill="#ffa3a3" opacity="0.8" />
        <path className="sc-cp-ce1-francais__sourire" d="M42 64 Q50 71 58 64" fill="none" stroke="#3b2600" strokeWidth="3" strokeLinecap="round" />
        <path className="sc-cp-ce1-francais__bouche" d="M41 62 Q50 78 59 62 Z" fill="#c2334f" stroke="#3b2600" strokeWidth="2" />
      </svg>
    </Mascotte>
  );
}

/** La question : la roue, la carte du verbe — et Lumi, la fête, après la réponse. */
export function SceneRoue({ m, termine, extra = {} }) {
  const reussi = Boolean(termine && extra.trouve);
  const humeur = humeurDe({ reussi, faute: !reussi && (extra.montrer || Boolean(extra.derniereFaute)) });
  const moment = m.temps ? roue.TEMPS.find((t) => t.cle === m.temps) : null;
  return (
    <div className={`roue__scene sc-roue-des-verbes__scene${termine ? ' est-terminee' : ''}`}>
      <span className="sc-roue-des-verbes__guirlande" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => <span key={k} style={{ '--n': k }} />)}
      </span>
      <RoueForaine pronom={m.pronom} termine={termine} />
      <p className="roue__question sc-roue-des-verbes__carte">
        {/* AU CE2, LE MOMENT : hier, aujourd'hui, demain — il dit le temps. */}
        {moment && (
          <span className={`roue__moment roue__moment--${m.temps}`}>
            <DessinDuMoment temps={m.temps} />
            {moment.moment}
          </span>
        )}
        <span className="roue__verbe">{m.verbe}</span>
        <span className="roue__phrase">
          {termine ? <PhraseConjuguee m={m} /> : `${m.pronom} …`}
        </span>
      </p>
      <Lumi humeur={humeur} declic={extra.derniereFaute ?? 0} />
      {reussi && <Fete forme="etoile" />}
    </div>
  );
}

/**
 * LES TICKETS DE MANÈGE : chaque forme est un ticket suspendu à un fil, qui
 * se balance doucement. Un clic le donne. Un ticket faux reste barré et terni.
 */
export function TicketsForains({ choix, fautes, choisir }) {
  return (
    <ul className="sc-roue-des-verbes__tickets" aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} className="sc-roue-des-verbes__fil" style={{ '--i': i }}>
            <button
              type="button"
              className={`sc-roue-des-verbes__ticket${faux ? ' est-faux' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
