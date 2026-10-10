import { Reponses, Texte, sur, useDeroule } from './commun';

/**
 * L'ARBRE AUX PUISSANCES ET AUX RACINES (09/10/2026). La couverture : un arbre
 * géant au-dessus de jardins en terrasses, ses racines dorées qui courent
 * sous les ruines.
 *   - LA QUESTION est gravée sur une tablette de pierre posée contre le tronc ;
 *     le feuillage respire, des feuilles tombent, les racines brillent ;
 *   - LES RÉPONSES sont des fruits d'or suspendus à une branche : on cueille
 *     le bon (`choix`) ;
 *   - APRÈS LA RÉPONSE, l'arbre montre la règle, étape par étape : le carré
 *     qui sort de la racine (√96 = √(16 × 6) = 4√6), les exposants qui
 *     s'ajoutent ou se multiplient, la virgule qui saute de rang en rang.
 */

const P = 'sc-puissances-et-racines-lycee';

const EXPOSANTS = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};
const enExposant = (n) => String(n).split('').map((c) => Object.keys(EXPOSANTS).find((k) => EXPOSANTS[k] === c) ?? c).join('');
const lireExposant = (s) => (s ? Number(s.split('').map((c) => EXPOSANTS[c]).join('')) : 1);
const signe = (n) => (n < 0 ? `(−${-n})` : String(n));
const ent = (n) => String(n).replace('-', '−');

/** Le plus grand carré qui divise n : 96 → 16. */
function plusGrandCarre(n) {
  for (let k = Math.floor(Math.sqrt(n)); k >= 2; k -= 1) if (n % (k * k) === 0) return k;
  return 1;
}

/** LES ÉTAPES DE L'EXPLICATION : une liste de lignes, ou null si la question ne se lit pas. */
export function etapesDe(m) {
  const q = String(m.question).replace(/ = \?$/, '');
  const b = String(m.bonne);
  let r;
  switch (m.consigne) {
    case 'simplifier-racine': {
      r = q.match(/^√(\d+)$/);
      if (!r) return null;
      const n = Number(r[1]);
      const k = plusGrandCarre(n);
      if (`${k}√${n / (k * k)}` !== b) return null;
      return [`√${n}`, `√(${k * k} × ${n / (k * k)})`, `√${k * k} × √${n / (k * k)}`, `${k} × √${n / (k * k)}`, b];
    }
    case 'regles-puissances': {
      const exp = '([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]*)';
      r = q.match(new RegExp(`^([ax])${exp} ([×÷]) [ax]${exp}$`));
      if (r) {
        const e1 = lireExposant(r[2]);
        const e2 = lireExposant(r[4]);
        const e = r[3] === '×' ? e1 + e2 : e1 - e2;
        if (`${r[1]}${enExposant(e)}` !== b) return null;
        return [q, `${r[1]}^(${ent(e1)} ${r[3] === '×' ? '+' : '−'} ${signe(e2)})`, b];
      }
      r = q.match(new RegExp(`^\\(([ax])${exp}\\)${exp}$`));
      if (r) {
        const e1 = lireExposant(r[2]);
        const e2 = lireExposant(r[3]);
        if (`${r[1]}${enExposant(e1 * e2)}` !== b) return null;
        return [q, `${r[1]}^(${ent(e1)} × ${signe(e2)})`, b];
      }
      return null;
    }
    case 'puissance-negative': {
      r = q.match(/^(\d+)⁻([¹²³⁴⁵⁶⁷⁸⁹])$/);
      if (!r) return null;
      const n = Number(r[1]);
      const e = lireExposant(r[2]);
      if (`1/${n ** e}` !== b) return null;
      return [q, `1/${n}${r[2]}`, `1/(${Array.from({ length: e }, () => n).join(' × ')})`, b];
    }
    case 'racines': {
      r = q.match(/^√(\d+) ([+×]) √(\d+)$/);
      if (!r) return null;
      const a = Number(r[1]);
      const c = Number(r[3]);
      if (r[2] === '+') {
        if (`${Math.sqrt(a) + Math.sqrt(c)}` !== b) return null;
        return [q, `${Math.sqrt(a)} + ${Math.sqrt(c)}`, b];
      }
      if (`${Math.sqrt(a * c)}` !== b) return null;
      return [q, `√(${a} × ${c})`, `√${a * c}`, b];
    }
    default:
      return null;
  }
}

/**
 * LA VIRGULE QUI SAUTE (écriture scientifique) : les chiffres du nombre, et
 * la virgule à sa place de départ puis à sa place d'arrivée.
 */
export function sautsDe(m) {
  if (m.consigne !== 'scientifique') return null;
  const q = String(m.question).replace(/ = \?$/, '').replace(/\s/g, '');
  const e = String(m.bonne).match(/× 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
  if (!/^\d+(,\d+)?$/.test(q) || !e) return null;
  const chiffres = q.replace(',', '');
  const depart = q.includes(',') ? q.indexOf(',') : q.length;
  const premier = chiffres.search(/[1-9]/);
  const arrivee = premier + 1;
  const exposant = lireExposant(e[1]);
  if (depart - arrivee !== exposant) return null;
  return { chiffres, depart, arrivee, exposant };
}

/** L'arbre : feuillage qui respire, tronc, racines d'or qui se dessinent, feuilles qui tombent. */
function Arbre() {
  return (
    <svg className={`${P}__arbre`} viewBox="0 0 220 180" aria-hidden="true" focusable="false">
      <g className={`${P}__racines`}>
        <path d="M100 150 C 80 160 50 160 20 176" pathLength="1" />
        <path d="M112 150 C 130 162 170 160 205 176" pathLength="1" />
        <path d="M106 152 C 104 164 96 170 90 180" pathLength="1" />
        <path d="M118 152 C 126 166 140 172 150 180" pathLength="1" />
      </g>
      <path d="M92 152 C 98 120 94 96 84 74 L 104 70 C 108 90 116 100 132 74 L 140 80 C 124 104 118 124 124 152 Z" className={`${P}__tronc`} />
      <g className={`${P}__feuillage`}>
        <circle cx="62" cy="62" r="40" />
        <circle cx="110" cy="40" r="44" />
        <circle cx="162" cy="62" r="40" />
        <circle cx="132" cy="84" r="30" />
        <circle cx="86" cy="86" r="28" />
      </g>
      <g className={`${P}__lumieres`}>
        <circle cx="70" cy="50" r="3" />
        <circle cx="128" cy="30" r="2.5" />
        <circle cx="170" cy="58" r="3" />
        <circle cx="100" cy="70" r="2" />
      </g>
      {[30, 90, 150, 190].map((x, i) => (
        <path key={x} className={`${P}__feuille`} style={{ '--i': i }} d={`M${x} 90 q 6 -8 12 0 q -6 8 -12 0 Z`} />
      ))}
    </svg>
  );
}

function Explication({ etapes }) {
  const n = useDeroule(etapes.length - 1, 900);
  return (
    <ol className={`${P}__etapes`} aria-label="La règle, étape par étape">
      {etapes.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={`${i <= n ? 'est-pousse' : ''}${i === etapes.length - 1 ? ` ${P}__fruit-mur` : ''}`}>
          {i > 0 && <span className={`${P}__egal`} aria-hidden="true">=</span>}
          {e}
        </li>
      ))}
    </ol>
  );
}

function Sauts({ chiffres, depart, arrivee, exposant }) {
  const total = Math.abs(depart - arrivee);
  const n = useDeroule(total, 520);
  const position = depart + (arrivee < depart ? -n : n);
  const morceaux = chiffres.split('');
  return (
    <div className={`${P}__sauts`}>
      <p className={`${P}__nombre`} aria-label="La virgule saute de rang en rang">
        {morceaux.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__chiffre`}>
            {c}
            {i === position - 1 && i < morceaux.length - 1 && <span key={position} className={`${P}__virgule`}>,</span>}
          </span>
        ))}
      </p>
      <p className={`${P}__compte`}>
        {`${n} saut${n > 1 ? 's' : ''} ${arrivee < depart ? 'vers la gauche' : 'vers la droite'}`}
        {n >= total && <strong>{` → × 10${enExposant(exposant)}`}</strong>}
      </p>
    </div>
  );
}

export function QuestionPuissances({ m, termine }) {
  const etapes = termine ? sur(() => etapesDe(m)) : null;
  const sauts = termine ? sur(() => sautsDe(m)) : null;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__jardin`}>
        <Arbre />
        <div className={`${P}__tablette`}>
          <Texte m={m} classe={`${P}__texte`} />
        </div>
      </div>
      {etapes && <Explication etapes={etapes} />}
      {sauts && <Sauts {...sauts} />}
    </div>
  );
}

/** Les fruits d'or, suspendus à la branche : on cueille le bon. */
export function FruitsPuissances({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__branche`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Cueille le bon fruit"
        decor={() => (
          <>
            <span className={`${P}__tige`} aria-hidden="true" />
            <span className={`${P}__feuille-du-fruit`} aria-hidden="true" />
          </>
        )}
      />
    </div>
  );
}
