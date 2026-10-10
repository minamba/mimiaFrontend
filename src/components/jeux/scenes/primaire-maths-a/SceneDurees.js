import { rangee, useDeroule } from './communs';
import './primaire-maths-a.css';

/**
 * HEURES, MINUTES, SECONDES (CM1) ET PROBLÈMES DE DURÉE (CM2) — 09/10/2026.
 * La couverture du CM1 est une gare au bord de l'eau : une grande horloge de
 * quai, le panneau « Départ », un train qui attend ; celle du CM2, une tour à
 * horloge au soleil couchant, un sablier, des durées qui flottent (« 1 h 30 »,
 * « 45 min »). La scène :
 *   - AU CM1, LA GARE : la question sur le tableau des départs, l'horloge du
 *     quai (sa trotteuse tourne) à l'heure du départ, le train qui fume ;
 *   - AU CM2, LA TOUR À HORLOGE : la question sur un panneau lumineux, la
 *     tour, et le sablier qui se retourne ;
 *   - LES RÉPONSES : des billets de train à composter (`ChoixDurees`) — au
 *     CM2, des billets dorés ;
 *   - APRÈS LA RÉPONSE : la FRISE DU TEMPS. Le train (ou l'étoile) avance
 *     d'arrêt en arrêt — jusqu'à l'heure pile, puis les heures, puis les
 *     minutes qui restent — et les aiguilles de l'horloge tournent avec lui ;
 *     pour les conversions, des chronomètres de 60 secondes ou des sabliers
 *     de 60 minutes s'alignent.
 */

/**
 * « 1 h 45 » NE SE COUPE PAS EN FIN DE LIGNE : des espaces insécables entre
 * le nombre et son unité (le texte reste le même, à l'espace près).
 */
const INSECABLE = ' ';
const insecable = (texte) => String(texte ?? '')
  .replace(/(\d) (?=(?:h|min|s)\b)/g, `$1${INSECABLE}`)
  .replace(/\bh (?=\d)/g, `h${INSECABLE}`);

const hm = (min) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
const duree = (min) => (min < 60 ? `${min} min` : min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${min % 60} min`);

/** « 1 h 50 min », « 50 min », « 2 h » → des minutes ; NaN sinon. */
export function minutesDe(texte) {
  const r = String(texte).trim().match(/^(?:(\d+) h)?\s*(?:(\d+) min)?$/);
  if (!r || (!r[1] && !r[2])) return NaN;
  return Number(r[1] ?? 0) * 60 + Number(r[2] ?? 0);
}

/** Ce que dit la question : la sorte de manche et ses heures, en minutes. */
export function lireDuree(m) {
  const q = String(m?.question ?? '');
  let r = q.match(/^Départ à (\d+) h (\d+), trajet de (.+)\. Arrivée à \?$/);
  if (r) return { sorte: 'fin', debut: Number(r[1]) * 60 + Number(r[2]), d: minutesDe(r[3]) };
  r = q.match(/^(\d+) min (\d+) s = \?$/);
  if (r) return { sorte: 'secondes', mi: Number(r[1]), s: Number(r[2]) };
  r = q.match(/^(\d+) min = \?$/);
  if (r) return { sorte: 'heures', total: Number(r[1]) };
  r = q.match(/^Le film finit à (\d+) h (\d+) et dure (.+)\. À quelle heure a-t-il commencé \?$/);
  if (r) return { sorte: 'depart', fin: Number(r[1]) * 60 + Number(r[2]), d: minutesDe(r[3]) };
  r = q.match(/^De (\d+) h (\d+) à (\d+) h (\d+), combien de temps \?$/);
  if (r) return { sorte: 'ecart', debut: Number(r[1]) * 60 + Number(r[2]), fin: Number(r[3]) * 60 + Number(r[4]) };
  r = q.match(/^Du (\S+) (\d+) h au (\S+) (\d+) h, combien d.heures \?$/);
  if (r) {
    return {
      sorte: 'jours', j1: r[1], h1: Number(r[2]), j2: r[3], h2: Number(r[4]),
    };
  }
  return null;
}

const auCM2 = (m) => ['depart', 'ecart', 'jours'].includes(m?.consigne);

/**
 * LES ARRÊTS DE LA FRISE : [{ heure (en minutes, pour l'horloge), etiquette }]
 * et les sauts entre eux, toujours en passant par l'heure pile.
 */
export function frise(lu) {
  if (!lu) return null;
  const arrets = [];
  const sauts = [];
  const ajouter = (minutes, saut) => {
    if (saut) sauts.push(saut);
    arrets.push({ heure: minutes, etiquette: hm(minutes) });
  };
  if (lu.sorte === 'fin' && Number.isFinite(lu.d)) {
    let t = lu.debut;
    let reste = lu.d;
    ajouter(t);
    const versPile = (60 - (t % 60)) % 60;
    if (versPile > 0 && reste > versPile) { t += versPile; reste -= versPile; ajouter(t, `+ ${versPile} min`); }
    const heures = Math.floor(reste / 60);
    if (heures > 0) { t += heures * 60; reste -= heures * 60; ajouter(t, `+ ${heures} h`); }
    if (reste > 0) { t += reste; ajouter(t, `+ ${reste} min`); }
    return { arrets, sauts };
  }
  if (lu.sorte === 'depart' && Number.isFinite(lu.d)) {
    let t = lu.fin;
    let reste = lu.d;
    ajouter(t);
    const heures = Math.floor(reste / 60);
    if (heures > 0) { t -= heures * 60; reste -= heures * 60; ajouter(t, `− ${heures} h`); }
    const versPile = t % 60;
    if (versPile > 0 && reste > versPile) { t -= versPile; reste -= versPile; ajouter(t, `− ${versPile} min`); }
    if (reste > 0) { t -= reste; ajouter(t, `− ${reste} min`); }
    return { arrets, sauts };
  }
  if (lu.sorte === 'ecart' && lu.fin > lu.debut) {
    let t = lu.debut;
    ajouter(t);
    const versPile = (60 - (t % 60)) % 60;
    if (versPile > 0 && lu.fin - t > versPile) { t += versPile; ajouter(t, `+ ${versPile} min`); }
    const heures = Math.floor((lu.fin - t) / 60);
    if (heures > 0) { t += heures * 60; ajouter(t, `+ ${heures} h`); }
    if (lu.fin > t) { const reste = lu.fin - t; t = lu.fin; ajouter(t, `+ ${reste} min`); }
    return { arrets, sauts };
  }
  if (lu.sorte === 'jours') {
    return {
      arrets: [
        { heure: lu.h1 * 60, etiquette: `${lu.j1} ${lu.h1} h` },
        { heure: lu.h1 * 60 + 24 * 60, etiquette: `${lu.j2} ${lu.h1} h` },
        { heure: lu.h2 * 60 + 24 * 60, etiquette: `${lu.j2} ${lu.h2} h` },
      ],
      sauts: ['+ 24 h', `+ ${lu.h2 - lu.h1} h`],
    };
  }
  return null;
}

/**
 * L'HORLOGE DU QUAI. Les aiguilles tournent sur le total des minutes, sans
 * jamais revenir à zéro : elles avancent (ou reculent) toujours dans le bon
 * sens quand l'heure change.
 */
function Horloge({ minutes, tour = false }) {
  const grande = minutes * 6;
  const petite = minutes * 0.5;
  return (
    <svg className={`sc-durees-cm1__horloge${tour ? ' sc-durees-cm1__horloge--tour' : ''}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" className="sc-durees-cm1__cadran" />
      {rangee(12).map((i) => (
        <line key={i} x1="50" y1="8" x2="50" y2={i % 3 ? 13 : 17} className="sc-durees-cm1__repere" transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <line x1="50" y1="50" x2="50" y2="26" className="sc-durees-cm1__petite" style={{ transform: `rotate(${petite}deg)` }} />
      <line x1="50" y1="50" x2="50" y2="14" className="sc-durees-cm1__grande" style={{ transform: `rotate(${grande}deg)` }} />
      <line x1="50" y1="56" x2="50" y2="12" className="sc-durees-cm1__trotteuse" />
      <circle cx="50" cy="50" r="3.5" className="sc-durees-cm1__axe" />
    </svg>
  );
}

/** Le train de la gare : ses roues tournent, sa cheminée fume. */
function Train({ petit = false }) {
  return (
    <svg className={`sc-durees-cm1__train${petit ? ' sc-durees-cm1__train--petit' : ''}`} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
      {!petit && rangee(3).map((i) => <circle key={i} className="sc-durees-cm1__fumee" cx="28" cy="10" r={6 + i * 2} style={{ '--n': i }} />)}
      <rect x="20" y="14" width="14" height="16" rx="2" fill="#37474f" />
      <rect x="8" y="26" width="76" height="28" rx="8" fill="#e63946" stroke="#8d1b25" strokeWidth="2" />
      <rect x="62" y="12" width="32" height="42" rx="6" fill="#1d4e89" stroke="#0f2f57" strokeWidth="2" />
      <rect x="68" y="18" width="20" height="14" rx="3" fill="#cfeaf8" />
      <path d="M8 46 l-8 8 h12 Z" fill="#ffd43b" />
      <circle cx="14" cy="34" r="4" fill="#ffe066" />
      {[24, 50, 78].map((cx) => (
        <g key={cx} className="sc-durees-cm1__roue" style={{ transformOrigin: `${cx}px 58px` }}>
          <circle cx={cx} cy="58" r="9" fill="#2c2c36" />
          <line x1={cx - 7} y1="58" x2={cx + 7} y2="58" stroke="#b8bec8" strokeWidth="2" />
          <line x1={cx} y1="51" x2={cx} y2="65" stroke="#b8bec8" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/** Le sablier qui se retourne. */
function Sablier({ petit = false }) {
  return (
    <svg className={`sc-durees-cm1__sablier${petit ? ' sc-durees-cm1__sablier--petit' : ''}`} viewBox="0 0 50 80" aria-hidden="true" focusable="false">
      <rect x="4" y="2" width="42" height="7" rx="3" fill="#a0522d" />
      <rect x="4" y="71" width="42" height="7" rx="3" fill="#a0522d" />
      <path d="M10 9 h30 q0 18 -13 31 q13 13 13 31 h-30 q0 -18 13 -31 q-13 -13 -13 -31 Z" fill="rgba(220,240,255,0.55)" stroke="#e8f4ff" strokeWidth="2" />
      <path className="sc-durees-cm1__sable-haut" d="M14 14 h22 q-2 12 -11 22 q-9 -10 -11 -22 Z" fill="#f4c542" />
      <path className="sc-durees-cm1__sable-bas" d="M12 69 q2 -12 13 -18 q11 6 13 18 Z" fill="#f4c542" />
      <line className="sc-durees-cm1__filet" x1="25" y1="40" x2="25" y2="60" stroke="#f4c542" strokeWidth="2" />
    </svg>
  );
}

/** Le chronomètre (CM1, secondes). */
function Chrono({ tourne = true }) {
  return (
    <svg className="sc-durees-cm1__chrono" viewBox="0 0 60 70" aria-hidden="true" focusable="false">
      <rect x="25" y="2" width="10" height="8" rx="2" fill="#495057" />
      <circle cx="30" cy="40" r="26" fill="#fff" stroke="#f08c00" strokeWidth="5" />
      {rangee(12).map((i) => <line key={i} x1="30" y1="17" x2="30" y2="21" stroke="#495057" strokeWidth="2" transform={`rotate(${i * 30} 30 40)`} />)}
      <line x1="30" y1="40" x2="30" y2="20" stroke="#e03131" strokeWidth="2.5" strokeLinecap="round" className={tourne ? 'sc-durees-cm1__aiguille-chrono' : undefined} />
      <circle cx="30" cy="40" r="3" fill="#212529" />
    </svg>
  );
}

/** La tour à horloge du CM2. */
function Tour({ minutes }) {
  return (
    <div className="sc-durees-cm1__tour" aria-hidden="true">
      <span className="sc-durees-cm1__toit" />
      <Horloge minutes={minutes} tour />
    </div>
  );
}

/** LA QUESTION : le tableau des départs de la gare (CM1), ou le panneau de la tour (CM2). */
export function QuestionDurees({ m, termine }) {
  if (termine) return <ApresDurees m={m} />;
  const lu = lireDuree(m);
  if (auCM2(m)) {
    const heure = lu?.sorte === 'depart' ? lu.fin : lu?.sorte === 'ecart' ? lu.debut : lu?.sorte === 'jours' ? lu.h1 * 60 : 600;
    return (
      <div className="sc-durees-cm1 sc-durees-cm1--tour">
        <span className="sc-durees-cm1__soleil" aria-hidden="true" />
        {rangee(7).map((i) => <span key={i} className="sc-durees-cm1__etoile" style={{ '--n': i }} aria-hidden="true" />)}
        <div className="sc-durees-cm1__quai">
          <Tour minutes={Number.isFinite(heure) ? heure : 600} />
          <p className="sc-durees-cm1__panneau">{insecable(m.question)}</p>
          <Sablier />
        </div>
      </div>
    );
  }
  let accessoire = <Horloge minutes={lu?.sorte === 'fin' ? lu.debut : 600} />;
  if (lu?.sorte === 'secondes') accessoire = <Chrono />;
  if (lu?.sorte === 'heures') accessoire = <Sablier />;
  return (
    <div className="sc-durees-cm1 sc-durees-cm1--gare">
      <span className="sc-durees-cm1__auvent" aria-hidden="true" />
      <div className="sc-durees-cm1__quai">
        {accessoire}
        <div className="sc-durees-cm1__tableau">
          {lu?.sorte === 'fin' && <span className="sc-durees-cm1__entete" aria-hidden="true">Départ ➜</span>}
          <p className="sc-durees-cm1__panneau">{insecable(m.question)}</p>
        </div>
        <Train />
      </div>
      <span className="sc-durees-cm1__rails" aria-hidden="true" />
    </div>
  );
}

/** Le petit billet dessiné dans le talon. */
function IconeBillet({ cm2 }) {
  return cm2 ? <Sablier petit /> : <Train petit />;
}

/**
 * LES RÉPONSES : des billets à composter. Chaque billet est un bouton à son
 * libellé ; un billet faux est barré, poinçonné de rouge, et ne se prend plus.
 */
export function ChoixDurees({
  m, choix, fautes, choisir,
}) {
  const cm2 = auCM2(m);
  return (
    <ul className={`sc-durees-cm1__guichet${cm2 ? ' sc-durees-cm1__guichet--or' : ''}`} aria-label="Choisis ton billet">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button type="button" className={`sc-durees-cm1__billet${fausse ? ' est-fausse' : ''}`} onClick={() => choisir(cle)} disabled={fausse}>
              <span className="sc-durees-cm1__talon" aria-hidden="true"><IconeBillet cm2={cm2} /></span>
              <span className="sc-durees-cm1__libelle">{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** LA FRISE DU TEMPS : d'arrêt en arrêt, en passant par l'heure pile. */
function Frise({ m, lu, f }) {
  const cm2 = auCM2(m);
  const n = f.sauts.length;
  const pas = useDeroule(n + 1, 1200, 500);
  const ici = Math.min(pas, n);
  const fini = pas > n;
  let conclusion = '';
  if (lu.sorte === 'fin') conclusion = `On arrive à ${hm(f.arrets[n].heure)}.`;
  if (lu.sorte === 'depart') conclusion = `Le film a commencé à ${hm(f.arrets[n].heure)}.`;
  if (lu.sorte === 'ecart') conclusion = `${f.sauts.map((s) => s.replace('+ ', '')).join(' + ')} = ${duree(lu.fin - lu.debut)}`;
  if (lu.sorte === 'jours') conclusion = `24 h + ${lu.h2 - lu.h1} h = ${24 + lu.h2 - lu.h1} h`;
  return (
    <div className={`sc-durees-cm1 sc-durees-cm1--${cm2 ? 'tour' : 'gare'} sc-durees-cm1--apres`}>
      {cm2 && rangee(7).map((i) => <span key={i} className="sc-durees-cm1__etoile" style={{ '--n': i }} aria-hidden="true" />)}
      <div className="sc-durees-cm1__entree">
        <Horloge minutes={f.arrets[ici].heure} tour={cm2} />
        <p className="sc-durees-cm1__panneau">{insecable(m.question)}</p>
      </div>
      <ol className="sc-durees-cm1__frise" aria-label="La frise du temps">
        {f.arrets.map((a, i) => (
          <li key={a.etiquette} className={`sc-durees-cm1__arret${ici >= i ? ' est-atteint' : ''}`}>
            {i > 0 && <span className={`sc-durees-cm1__saut${ici >= i ? ' est-fait' : ''}`}>{f.sauts[i - 1]}</span>}
            <span className="sc-durees-cm1__heure">
              {lu.sorte === 'jours' && <span className={`sc-durees-cm1__astre sc-durees-cm1__astre--${i === 1 ? 'lune' : 'soleil'}`} aria-hidden="true" />}
              {a.etiquette}
              {ici === i && <span className="sc-durees-cm1__voyageur">{cm2 ? <Sablier petit /> : <Train petit />}</span>}
            </span>
          </li>
        ))}
      </ol>
      <p className={`sc-durees-cm1__conclusion${fini ? ' est-fini' : ''}`}>{fini ? conclusion : 'D’abord jusqu’à l’heure pile…'}</p>
    </div>
  );
}

/** Les conversions : des chronomètres de 60 secondes, ou des sabliers de 60 minutes. */
function Paquets({ m, lu }) {
  const secondes = lu.sorte === 'secondes';
  const pleins = secondes ? lu.mi : Math.floor(lu.total / 60);
  const reste = secondes ? lu.s : lu.total % 60;
  const n = pleins + (reste ? 1 : 0);
  const pas = useDeroule(n + 1, 900, 450);
  const fini = pas > n;
  const conclusion = secondes
    ? `${[...rangee(pleins).map(() => '60'), ...(reste ? [String(reste)] : [])].join(' + ')} = ${lu.mi * 60 + lu.s} s`
    : `${pleins} fois 60 min${reste ? `, et ${reste} min` : ''} : ${duree(lu.total)}`;
  return (
    <div className="sc-durees-cm1 sc-durees-cm1--gare sc-durees-cm1--apres">
      <p className="sc-durees-cm1__panneau sc-durees-cm1__panneau--seul">{insecable(m.question)}</p>
      <ol className="sc-durees-cm1__paquets" aria-label={secondes ? 'Les minutes, en secondes' : 'Les minutes, en heures'}>
        {rangee(n).map((i) => {
          const plein = i < pleins;
          return (
            <li key={i} className={`sc-durees-cm1__paquet${pas > i ? ' est-la' : ''}${plein ? '' : ' est-reste'}`}>
              {secondes ? <Chrono tourne={false} /> : <Sablier petit />}
              <span>{secondes ? (plein ? '1 min = 60 s' : `${reste} s`) : (plein ? '60 min = 1 h' : `${reste} min`)}</span>
            </li>
          );
        })}
      </ol>
      <p className={`sc-durees-cm1__conclusion${fini ? ' est-fini' : ''}`}>{fini ? conclusion : (secondes ? 'Une minute, c’est soixante secondes…' : 'Soixante minutes font une heure…')}</p>
    </div>
  );
}

/** APRÈS LA RÉPONSE : la frise du temps, ou les paquets de soixante. */
export function ApresDurees({ m }) {
  const lu = lireDuree(m);
  if (lu?.sorte === 'secondes' || (lu?.sorte === 'heures' && lu.total >= 60)) return <Paquets m={m} lu={lu} />;
  const f = frise(lu);
  if (f && f.sauts.length > 0) return <Frise m={m} lu={lu} f={f} />;
  return (
    <div className={`sc-durees-cm1 sc-durees-cm1--${auCM2(m) ? 'tour' : 'gare'}`}>
      <p className="sc-durees-cm1__panneau sc-durees-cm1__panneau--seul">{insecable(m.question)}</p>
    </div>
  );
}
