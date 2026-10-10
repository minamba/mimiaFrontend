import { classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireNombre, nombresDe,
} from './outils';

/**
 * LE PALAIS DES ÉTOILES FILANTES — « Le calcul mental », 6e (09/10/2026). La
 * couverture : une héroïne lancée en pleine course sur les dalles d'un
 * palais du ciel, des rubans de lumière dorée, des cristaux bleus. La scène :
 *   - LA QUESTION : un médaillon bleu nuit cerclé d'or, au centre d'un
 *     anneau de lumière qui tourne ; des cristaux flottent, des étincelles
 *     scintillent ;
 *   - LES RÉPONSES : trois étoiles d'or qui flottent et scintillent — on
 *     attrape la bonne (un clic suffit, elles restent à portée) ;
 *   - APRÈS LA RÉPONSE : le RACCOURCI passe en étoile filante, ligne après
 *     ligne : × 11 = × 10 puis + le nombre ; × 50 = × 100 puis la moitié ;
 *     l'ordre de grandeur arrondit chaque facteur avant de multiplier.
 */
const P = 'sc-calcul-mental-college';

const e = (x) => ecrireNombre(x);

/** Un nombre arrondi à un seul chiffre significatif : 815 → 800, 70,4 → 70. */
function rond(x) {
  const p = 10 ** Math.floor(Math.log10(Math.abs(x)));
  return Math.round(x / p) * p;
}

function lignes(m) {
  const [a, b] = nombresDe(m.question);
  if (a === undefined || b === undefined) return null;
  if (m.consigne === 'ordre-de-grandeur') {
    const A = rond(a);
    const B = rond(b);
    return [
      `${e(a)} ≈ ${e(A)}   et   ${e(b)} ≈ ${e(B)}`,
      `${e(A)} × ${e(B)} = ${e(A * B)}`,
    ];
  }
  if (m.consigne === 'nombre-proche') {
    const B = b < 50 ? 10 : 100;
    const ecart = b - B;
    if (Math.abs(ecart) !== 1) return null;
    return [
      `${e(b)} = ${e(B)} ${ecart > 0 ? '+' : '−'} 1`,
      `${e(a)} × ${e(B)} = ${e(a * B)}`,
      `${e(a * B)} ${ecart > 0 ? '+' : '−'} ${e(a)} = ${e(a * b)}`,
    ];
  }
  if (m.consigne === 'fois-cinq') {
    const B = b === 5 ? 10 : 100;
    const part = B / b;
    if (!Number.isInteger(part)) return null;
    return [
      `${e(b)} = ${e(B)} ÷ ${part}`,
      `${e(a)} × ${e(B)} = ${e(a * B)}`,
      `${e(a * B)} ÷ ${part} = ${e(a * b)}  (${part === 2 ? 'la moitié' : 'le quart'})`,
    ];
  }
  return null;
}

/** L'anneau de lumière, les cristaux, les étincelles. */
function Ciel() {
  return (
    <div className={`${P}__ciel`} aria-hidden="true">
      <svg className={`${P}__anneau`} viewBox="0 0 400 140" focusable="false" preserveAspectRatio="none">
        <ellipse cx="200" cy="70" rx="190" ry="58" className={`${P}__ruban`} />
        <ellipse cx="200" cy="70" rx="170" ry="48" className={`${P}__ruban ${P}__ruban--2`} />
      </svg>
      {[8, 22, 78, 92].map((x, i) => (
        <span key={x} className={`${P}__cristal`} style={{ left: `${x}%`, animationDelay: `${(i * -0.9).toFixed(1)}s` }} />
      ))}
      {[15, 35, 50, 66, 85].map((x, i) => (
        <span key={x} className={`${P}__etincelle`} style={{ left: `${x}%`, top: `${(i * 37) % 80}%`, animationDelay: `${(i * -0.5).toFixed(1)}s` }} />
      ))}
    </div>
  );
}

function contenu(m) {
  const l = lignes(m);
  if (!l) return null;
  return <Etapes p={P} lignes={l} depart={0.3} pas={0.9} />;
}

export function QuestionCalculMental({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__scene`}>
        <Ciel />
        <div className={`${P}__medaillon`}>
          <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
        </div>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={(lignes(m)?.length ?? 0) * 0.9 + 0.4} />}
    </div>
  );
}

/** Les réponses : trois étoiles d'or qui flottent ; on attrape la bonne. */
export function Etoiles({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__etoiles`} aria-label="Attrape la bonne étoile">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__etoile${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__branches`} aria-hidden="true" />
            <span className={`${P}__valeur`}>{libelle}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
