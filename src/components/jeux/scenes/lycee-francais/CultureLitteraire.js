import {
  ECRIVAINS_MOUVEMENTS, GENRES, MOUVEMENTS, OEUVRES, SIECLES, SIECLE_DE,
} from '../../../../lib/jeux/lycee/culture-litteraire';
import { BoutonsChoix, libelleBon } from './commun';

/**
 * LE JARDIN D'AUTOMNE ET SA SPHÈRE — « La culture littéraire » (1re). La
 * couverture : un jardin de marbre à l'automne, des érables rouges, une
 * grande sphère armillaire de pierre autour d'un globe de bronze, qu'une
 * élève effleure du doigt. La scène la reprend :
 *   - LA QUESTION : gravée sur le socle de la sphère, dont les anneaux
 *     tournent lentement ; des feuilles rouges tombent derrière ;
 *   - LES RÉPONSES : des feuilles d'érable (`choix`) qui dansent dans le vent,
 *     chacune portant un nom : on attrape la bonne — elles bougent lentement
 *     et restent cliquables partout, et s'arrêtent si l'on réduit les
 *     animations ;
 *   - APRÈS LA RÉPONSE : la sphère s'arrête sur le bon siècle, une frise du
 *     XVIe au XXe s'allume, et la FICHE de l'œuvre ou de l'écrivain se
 *     remplit : titre, auteur, siècle, genre, mouvement, date quand elle est
 *     sûre — tout ce que le module sait, rien d'inventé.
 * Avant la réponse, ni frise ni fiche : elles diraient la réponse.
 */

const P = 'sc-culture-litteraire';

const titreDe = (q) => /^« (.+?) »/.exec(q)?.[1] ?? null;

/** Ce que l'on sait de la manche : l'œuvre, l'écrivain, son siècle, son genre, son mouvement. */
export function ficheDe(m) {
  let oeuvre = null;
  let ecrivain = null;
  if (m.consigne === 'oeuvre') oeuvre = OEUVRES.find(([t]) => t === m.bonne);
  else if (m.consigne === 'mouvement') ecrivain = m.question;
  else oeuvre = OEUVRES.find(([t]) => t === titreDe(m.question));
  if (oeuvre) [, ecrivain] = oeuvre;
  const mouvement = ECRIVAINS_MOUVEMENTS.find(([e]) => e === ecrivain)?.[1] ?? null;
  const siecle = oeuvre?.[2] ?? SIECLE_DE[ecrivain] ?? (mouvement ? MOUVEMENTS[mouvement][1] : null);
  return {
    titre: oeuvre?.[0] ?? null,
    ecrivain,
    siecle,
    genre: oeuvre?.[3] ? GENRES[oeuvre[3]] : null,
    annee: oeuvre?.[4] ?? null,
    mouvement: mouvement ? MOUVEMENTS[mouvement][0] : null,
  };
}

/** La sphère armillaire : trois anneaux qui tournent autour du globe de bronze. */
function Sphere({ arretee }) {
  return (
    <svg className={`${P}__sphere${arretee ? ` ${P}__sphere--arretee` : ''}`} viewBox="0 0 100 110" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${P}-bronze`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffd9a8" />
          <stop offset="0.45" stopColor="#c8742c" />
          <stop offset="1" stopColor="#6b3410" />
        </radialGradient>
      </defs>
      <path d="M30 104 h40 l-6 -14 h-28 z" fill="#d9cfc0" stroke="#8d8070" strokeWidth="1.5" />
      <rect x="47" y="80" width="6" height="12" fill="#b8ab98" />
      <circle cx="50" cy="44" r="16" fill={`url(#${P}-bronze)`} />
      <g className={`${P}__anneau ${P}__anneau--a`}><ellipse cx="50" cy="44" rx="38" ry="12" fill="none" stroke="#e6ddcf" strokeWidth="5" /></g>
      <g className={`${P}__anneau ${P}__anneau--b`}><ellipse cx="50" cy="44" rx="12" ry="38" fill="none" stroke="#d9cfc0" strokeWidth="5" /></g>
      <g className={`${P}__anneau ${P}__anneau--c`}><circle cx="50" cy="44" r="36" fill="none" stroke="#cfc3b0" strokeWidth="4" /></g>
    </svg>
  );
}

/** Les feuilles d'érable qui tombent en arrière-plan. */
function Feuillage() {
  return (
    <span className={`${P}__feuillage`} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => <span key={i} className={`${P}__feuille-deco`} style={{ '--n': i }} />)}
    </span>
  );
}

/** La frise des siècles : celui de l'œuvre s'allume. */
function Frise({ siecle }) {
  return (
    <ol className={`${P}__frise`} aria-label="Les siècles">
      {Object.entries(SIECLES).map(([s, nom]) => (
        <li key={s} className={`${P}__siecle${Number(s) === siecle ? ` ${P}__siecle--ici` : ''}`}>{nom.replace(' siècle', '')}</li>
      ))}
    </ol>
  );
}

/** Le champ de la fiche qui porte la réponse : il s'allume. */
const CHAMP_DE = {
  auteur: 'Écrivain', oeuvre: 'Œuvre', siecle: 'Siècle', genre: 'Genre', mouvement: 'Mouvement',
};

/** La fiche de l'œuvre ou de l'écrivain, remplie après la réponse. */
function Fiche({ m }) {
  const f = ficheDe(m);
  const lignes = [
    ['Œuvre', f.titre ? `« ${f.titre} »${f.annee ? `, ${f.annee}` : ''}` : null],
    ['Écrivain', f.ecrivain],
    ['Siècle', f.siecle ? SIECLES[f.siecle] : null],
    ['Genre', f.genre],
    ['Mouvement', f.mouvement],
  ].filter(([, v]) => v);
  return (
    <div className={`${P}__fiche`} role="status">
      {f.siecle && <Frise siecle={f.siecle} />}
      <dl className={`${P}__carte`}>
        {lignes.map(([nom, valeur], i) => (
          <div key={nom} className={`${P}__champ${CHAMP_DE[m.consigne] === nom ? ` ${P}__champ--reponse` : ''}`} style={{ '--k': i }}>
            <dt>{nom}</dt>
            <dd>{valeur}</dd>
          </div>
        ))}
      </dl>
      {lignes.length === 0 && <strong className={`${P}__verdict`}>{libelleBon(m)}</strong>}
    </div>
  );
}

export function QuestionCulture({ m, termine }) {
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <Feuillage />
      <div className={`${P}__socle`}>
        <Sphere arretee={termine} />
        <div className={`${P}__plaque`}>
          <p className={`${P}__texte`}>{m.question}</p>
        </div>
      </div>
      {termine && <Fiche m={m} />}
    </div>
  );
}

/** Les feuilles d'érable qui dansent : on attrape la bonne. */
export function ChoixCulture({ choix, fautes, choisir }) {
  return (
    <BoutonsChoix
      p={P}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      etiquette="Attrape la bonne feuille"
      deco={() => <span className={`${P}__nervure`} aria-hidden="true" />}
    />
  );
}
