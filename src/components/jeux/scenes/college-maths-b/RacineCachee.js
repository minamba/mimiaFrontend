import { avecVisuel } from '../base';
import {
  Enonce, ecrire, nombre, proprietesChoix, useEtapes,
} from './commun';

/**
 * LE JARDIN AUX RACINES — « La racine cachée » (3e), le 09/10/2026.
 * La couverture : un jardin antique envahi de verdure, un grand arbre dont
 * les racines dorées brillent sous la dalle de pierre, une graine lumineuse
 * dans les mains d'une jardinière. La scène :
 *   - L'ÉNONCÉ est gravé sur une dalle moussue ; dessous, les racines
 *     dorées pulsent — la racine est CACHÉE sous la dalle ;
 *   - APRÈS LA RÉPONSE, le carré de terre se découpe en n × n dalles : on
 *     voit que n × n donne l'aire, et le côté s'illumine — c'est la racine ;
 *     l'encadrement montre le carré pris entre deux carrés parfaits ; la
 *     somme montre que √a + √b et √(a + b) ne sont pas le même carré ;
 *   - LES RÉPONSES : des fruits d'or suspendus aux branches de l'arbre.
 */

const P = 'sc-racine-cachee';

/** Un carré découpé en n × n dalles (n entier), dont le côté s'allume ; `etiquette` sur le côté. */
function Carreau({
  n, taille = 150, cote, aire, allume = true, ton = 'or',
}) {
  const cases = Math.max(1, Math.min(n, 15));
  return (
    <span className={`${P}__carreau ${P}__carreau--${ton}${allume ? ' est-decoupe' : ''}`} style={{ '--n': cases, width: taille, height: taille }}>
      {Array.from({ length: cases * cases }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <i key={i} style={{ '--k': i }} />
      ))}
      {cote && <em className={`${P}__cote`}>{cote}</em>}
      {aire && <b className={`${P}__aire`}>{aire}</b>}
    </span>
  );
}

function Explication({ m }) {
  const q = String(m.question);
  const bonne = String(m.bonne);
  const k = useEtapes(2, 1300, 500);
  const encadre = q.match(/^√(\d+) est compris entre/);
  const exacte = q.match(/^√([\d,]+) = \?$/);
  const carre = q.match(/^\(√(\d+)\)² = \?$/);
  const separees = q.match(/^√(\d+) \+ √(\d+) = \?$/);
  const ensemble = q.match(/^√\((\d+) \+ (\d+)\) = \?$/);
  let dessin = null;
  let lignes = [`= ${bonne}`];
  if (exacte) {
    const v = nombre(exacte[1]);
    const r = nombre(bonne);
    const entier = Number.isInteger(r);
    const n = entier ? r : Math.round(r * 10);
    dessin = <Carreau n={n} cote={k >= 1 ? bonne : '?'} aire={exacte[1]} allume={k >= 1} />;
    lignes = [
      `${n} dalles sur ${n} dalles${entier ? '' : ' de 0,1'} : ${ecrire(r)} × ${ecrire(r)} = ${ecrire(v)}`,
      `Le côté du carré est la racine : √${exacte[1]} = ${bonne}`,
    ];
  } else if (carre) {
    dessin = <Carreau n={1} cote={`√${carre[1]}`} aire={k >= 1 ? carre[1] : '?'} allume={k >= 1} />;
    lignes = [`Un carré de côté √${carre[1]}`, `Son aire : √${carre[1]} × √${carre[1]} = ${carre[1]}`];
  } else if (encadre) {
    const v = Number(encadre[1]);
    const r = Math.floor(Math.sqrt(v));
    dessin = (
      <span className={`${P}__emboite`}>
        <Carreau n={r + 1} taille={170} cote={`${r + 1}`} aire={`${(r + 1) * (r + 1)}`} allume={k >= 1} ton="vert" />
        <span className={`${P}__dedans`}>
          <Carreau n={r} taille={170 * (r / (r + 1))} cote={`${r}`} aire={`${r * r}`} allume={k >= 1} />
        </span>
      </span>
    );
    lignes = [`${r}² = ${r * r}  <  ${v}  <  ${(r + 1) * (r + 1)} = ${r + 1}²`, `donc ${r} < √${v} < ${r + 1}`];
  } else if (separees) {
    const [a, b] = [Number(separees[1]), Number(separees[2])];
    const [ra, rb] = [Math.sqrt(a), Math.sqrt(b)];
    const e = 150 / (ra + rb);
    dessin = (
      <span className={`${P}__deux`}>
        <Carreau n={ra} taille={ra * e} cote={`${ra}`} aire={`${a}`} allume={k >= 1} />
        <Carreau n={rb} taille={rb * e} cote={`${rb}`} aire={`${b}`} allume={k >= 1} ton="vert" />
      </span>
    );
    lignes = [`√${a} = ${ra} et √${b} = ${rb}`, `${ra} + ${rb} = ${ra + rb}`];
  } else if (ensemble) {
    const [a, b] = [Number(ensemble[1]), Number(ensemble[2])];
    const r = Math.sqrt(a + b);
    dessin = <Carreau n={r} cote={k >= 1 ? `${r}` : '?'} aire={`${a + b}`} allume={k >= 1} />;
    lignes = [`D’abord l’addition : ${a} + ${b} = ${a + b}`, `√${a + b} = ${r}  (et pas √${a} + √${b} = ${Math.sqrt(a) + Math.sqrt(b)})`];
  }
  return (
    <div className={`${P}__atelier`}>
      {dessin}
      <ol className={`${P}__grimoire`} aria-label="Le calcul">
        {lignes.map((l, i) => <li key={l} className={i < k ? 'est-pose' : ''}>{l}</li>)}
      </ol>
    </div>
  );
}

/** Les racines dorées sous la dalle, qui pulsent doucement. */
function Racines() {
  return (
    <svg viewBox="0 0 300 50" className={`${P}__racines`} aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <path d="M150 0 C150 18 120 22 96 34 C80 42 52 40 30 48 M150 0 C152 20 186 24 206 36 C222 44 254 42 276 50 M150 0 C148 22 140 34 136 50 M118 26 C110 36 98 40 88 50 M190 30 C200 38 208 44 214 50" />
    </svg>
  );
}

export function QuestionRacine({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__dalle`}>
        {avecVisuel(m, <Enonce m={m} classe={`${P}__gravure`} />)}
        <Racines />
      </div>
      {termine && <Explication m={m} />}
    </div>
  );
}

/** Les réponses : des fruits d'or suspendus à la branche de l'arbre. */
export function Fruits({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__arbre`}>
      <span className={`${P}__branche`} aria-hidden="true" />
      <ul className={`${P}__fruits`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => (
          <li key={cle} style={{ '--i': i }}>
            <span className={`${P}__tige`} aria-hidden="true" />
            <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__fruit${fautes.includes(cle) ? ' est-faux' : ''}${String(libelle).length > 6 ? ' est-long' : ''}`}>
              {libelle}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const sceneRacine = {
  question: (m, termine) => <QuestionRacine m={m} termine={termine} />,
  choix: (props) => <Fruits {...props} />,
};
