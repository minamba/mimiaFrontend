import { classeQuestion } from '../base';
import { Etapes, Explication } from './outils';

/**
 * L'ATELIER DU BOULIER — « Les opérations posées », 6e (09/10/2026). La
 * couverture : un atelier clair, de grands bouliers aux perles bleues,
 * blanches et orange, des plateaux de perles en bois. La scène :
 *   - LA QUESTION : le boulier de l'atelier, ses perles qui glissent sur
 *     leurs tiges, et l'opération POSÉE sur l'ardoise — virgule sous virgule
 *     pour l'addition et la soustraction, chiffres à droite pour le produit ;
 *     la ligne du résultat reste vide ;
 *   - LES RÉPONSES : des perles de boulier (`objets`) ;
 *   - APRÈS LA RÉPONSE : l'ardoise se remplit, colonne après colonne depuis
 *     la droite, avec ses retenues et les zéros qui complètent ; pour le
 *     produit, on compte les chiffres après la virgule ; pour × 10, × 0,1…,
 *     les chiffres glissent dans le tableau de numération, la virgule reste.
 */
const P = 'sc-operations-college';

/** Un zéro ajouté pour aligner les décimales (« 2,7 » devient « 2,70 »). */
const COMPLETE = '+0';

/** « 17,87 » → { entier: '17', dec: '87' }. */
function decouper(x) {
  const [entier, dec = ''] = String(x).split(',');
  return { entier, dec };
}

/** Les nombres de la question, tels qu'écrits (« 30,8 », « 1000 »), sans leurs espaces. */
function morceaux(question) {
  const ecrits = String(question).match(/\d{1,3}(?:[   ]\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g) ?? [];
  return ecrits.map((t) => t.replace(/[\s  ]/g, ''));
}

const puissanceDeDix = (x) => /^(0,0*1|10*)$/.test(x);

function lire(m) {
  const q = m.question;
  const [a, b] = morceaux(q);
  const op = /[+−×]/.exec(q)?.[0];
  if (!a || !b || !op) return null;
  if (op === '×' && (puissanceDeDix(b) || puissanceDeDix(a))) {
    // Le facteur « puissance de dix » peut être écrit en premier.
    const [x, f] = puissanceDeDix(b) ? [a, b] : [b, a];
    const k = f.startsWith('0,') ? -(f.length - 2) : f.length - 1;
    return {
      sorte: 'par-dix', a: x, b: f, k,
    };
  }
  return {
    sorte: op === '×' ? 'produit' : 'colonnes', a, b, op,
  };
}

/** Les cellules d'un nombre, alignées sur la virgule (`ent` chiffres avant, `dec` après). */
function cellulesAlignees(x, ent, dec, completer = false) {
  const { entier, dec: d } = decouper(x);
  const avant = Array.from({ length: ent }, (_, i) => entier[entier.length - ent + i] ?? '');
  const apres = Array.from({ length: dec }, (_, i) => d[i] ?? (completer ? COMPLETE : ''));
  return dec ? [...avant, ',', ...apres] : avant;
}

/** L'ardoise : les lignes posées, le trait, la ligne du résultat (qui s'écrit depuis la droite). */
function Ardoise({ lignes, resultat, retenues = [] }) {
  const n = resultat.length;
  const retard = (i, base) => `${(base + (n - 1 - i) * 0.45).toFixed(2)}s`;
  return (
    <div className={`${P}__ardoise`}>
      {retenues.some(Boolean) && (
        <div className={`${P}__ligne ${P}__ligne--retenues`}>
          {retenues.map((c, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={`${P}__case`} style={{ '--d': retard(i, 0.75) }}>{c}</span>
          ))}
        </div>
      )}
      {lignes.map((ligne, j) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={j} className={`${P}__ligne`}>
          {ligne.map((c, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={`${P}__case${c === ',' ? ' est-virgule' : ''}${c === COMPLETE ? ' est-complete' : ''}`}>
              {c === COMPLETE ? '0' : c}
            </span>
          ))}
        </div>
      ))}
      <div className={`${P}__ligne ${P}__ligne--resultat`}>
        {resultat.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__case${c ? ' est-ecrite' : ''}${c === ',' ? ' est-virgule' : ''}`} style={{ '--d': retard(i, 0.4) }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

/** L'addition ou la soustraction posée, virgule sous virgule. */
function Colonnes({ l, termine }) {
  const A = decouper(l.a);
  const B = decouper(l.b);
  const dec = Math.max(A.dec.length, B.dec.length);
  const va = Number(A.entier + A.dec.padEnd(dec, '0'));
  const vb = Number(B.entier + B.dec.padEnd(dec, '0'));
  const vr = l.op === '+' ? va + vb : va - vb;
  if (!Number.isFinite(vr) || vr < 0) return null;
  const texteR = String(vr).padStart(dec + 1, '0');
  const r = dec ? `${texteR.slice(0, -dec)},${texteR.slice(-dec)}` : texteR;
  const ent = Math.max(A.entier.length, B.entier.length, decouper(r).entier.length);
  const lignes = [
    ['', ...cellulesAlignees(l.a, ent, dec, termine)],
    [l.op, ...cellulesAlignees(l.b, ent, dec, termine)],
  ];
  const resultat = ['', ...cellulesAlignees(r, ent, dec)];
  // Les retenues de l'addition : la colonne j des chiffres est la cellule j + 1
  // (l'opérateur en tête), et une de plus après la virgule.
  const retenues = Array(resultat.length).fill('');
  if (termine && l.op === '+') {
    const ca = String(va).padStart(ent + dec, '0');
    const cb = String(vb).padStart(ent + dec, '0');
    const cellule = (j) => 1 + j + (dec && j >= ent ? 1 : 0);
    let ret = 0;
    for (let j = ent + dec - 1; j >= 0; j -= 1) {
      ret = Math.floor((Number(ca[j]) + Number(cb[j]) + ret) / 10);
      if (ret && j > 0) retenues[cellule(j - 1)] = '1';
    }
  }
  return <Ardoise lignes={lignes} resultat={termine ? resultat : resultat.map(() => '')} retenues={retenues} />;
}

/** Le produit posé, chiffres alignés à droite. */
function Produit({ l, termine }) {
  const A = decouper(l.a);
  const B = decouper(l.b);
  const nd = A.dec.length + B.dec.length;
  const texte = String(Number(A.entier + A.dec) * Number(B.entier + B.dec)).padStart(nd + 1, '0');
  const r = nd ? `${texte.slice(0, -nd)},${texte.slice(-nd)}` : texte;
  const n = Math.max(l.a.length, l.b.length + 1, r.length);
  const caler = (c) => [...Array(Math.max(0, n - c.length)).fill(''), ...c];
  const resultat = caler(r.split(''));
  return (
    <Ardoise
      lignes={[caler(l.a.split('')), caler(['×', ...l.b.split('')])]}
      resultat={termine ? resultat : resultat.map(() => '')}
    />
  );
}

const NOMS_RANGS = {
  4: 'd.m', 3: 'm', 2: 'c', 1: 'd', 0: 'u', '-1': '1/10', '-2': '1/100', '-3': '1/1000', '-4': '1/10⁴',
};

/** Les chiffres d'un nombre, rang par rang (puissance de dix → chiffre), décalés de k rangs. */
function rangs(x, k) {
  const { entier, dec } = decouper(x);
  const chiffres = new Map();
  entier.split('').forEach((c, i) => chiffres.set(entier.length - 1 - i + k, c));
  dec.split('').forEach((c, i) => chiffres.set(-1 - i + k, c));
  // Des chiffres utiles jusqu'aux unités : ni zéro de tête, ni zéro de queue, mais toujours l'unité.
  const utiles = [...chiffres].filter(([, c]) => c !== '0').map(([p]) => p);
  if (!utiles.length) return new Map([[0, '0']]);
  const propre = new Map();
  for (let p = Math.max(0, ...utiles); p >= Math.min(0, ...utiles); p -= 1) propre.set(p, chiffres.get(p) ?? '0');
  return propre;
}

/** × 10, × 100, × 0,1… : les chiffres glissent dans le tableau, la virgule reste. */
function Glissement({ l }) {
  const avant = rangs(l.a, 0);
  const apres = rangs(l.a, l.k);
  const tous = [...avant.keys(), ...apres.keys()];
  const colonnes = [];
  for (let p = Math.max(...tous); p >= Math.min(...tous); p -= 1) colonnes.push(p);
  const classe = (p) => `${P}__chiffre${p === 0 ? ' est-unite' : ''}`;
  return (
    <div className={`${P}__numeration`} style={{ '--k': l.k }}>
      <div className={`${P}__rangee ${P}__rangee--titres`}>
        {colonnes.map((p) => <span key={p} className={classe(p)}>{NOMS_RANGS[p] ?? ''}</span>)}
      </div>
      <div className={`${P}__rangee`}>
        {colonnes.map((p) => <span key={p} className={classe(p)}>{avant.get(p) ?? ''}</span>)}
      </div>
      <div className={`${P}__rangee ${P}__rangee--apres`}>
        {colonnes.map((p) => (
          <span key={p} className={`${classe(p)}${apres.has(p) && avant.get(p - l.k) === undefined ? ' est-zero' : ' est-glisse'}`}>
            {apres.get(p) ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  if (l.sorte === 'par-dix') {
    const n = Math.abs(l.k);
    return (
      <>
        <Glissement l={l} />
        <Etapes
          p={P}
          depart={1.6}
          lignes={[`× ${l.b} : chaque chiffre glisse de ${n} rang${n > 1 ? 's' : ''} vers la ${l.k > 0 ? 'gauche' : 'droite'}, la virgule ne bouge pas.`]}
        />
      </>
    );
  }
  if (l.sorte === 'produit') {
    const A = decouper(l.a);
    const B = decouper(l.b);
    const [x, y] = [Number(A.entier + A.dec), Number(B.entier + B.dec)];
    return (
      <>
        <Produit l={l} termine />
        <Etapes
          p={P}
          depart={2}
          lignes={[
            `Sans les virgules : ${x} × ${y} = ${x * y}`,
            `Chiffres après la virgule : ${A.dec.length} + ${B.dec.length} = ${A.dec.length + B.dec.length}, autant dans le résultat.`,
          ]}
        />
      </>
    );
  }
  const posee = Colonnes({ l, termine: true });
  if (!posee) return null;
  return (
    <>
      {posee}
      <Etapes p={P} depart={2.4} lignes={['Virgule sous virgule, on calcule colonne par colonne depuis la droite.']} />
    </>
  );
}

/** Le boulier de l'atelier : des perles qui glissent sur leurs tiges. */
function Boulier() {
  const couleurs = ['#1f3f9e', '#f4f1ea', '#f28a1c', '#7fb6ff', '#f4f1ea'];
  return (
    <svg className={`${P}__boulier`} viewBox="0 0 300 74" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="292" height="66" rx="8" className={`${P}__cadre`} />
      {[0, 1, 2, 3].map((t) => (
        <g key={t}>
          <line x1="12" x2="288" y1={18 + t * 14} y2={18 + t * 14} className={`${P}__tige`} />
          <g className={`${P}__perles`} style={{ animationDelay: `${(t * -1.3).toFixed(1)}s` }}>
            {[0, 1, 2, 3, 4].map((b) => (
              <circle key={b} cx={30 + b * 13 + t * 26} cy={18 + t * 14} r="6.3" fill={couleurs[(b + t) % couleurs.length]} className={`${P}__perle`} />
            ))}
          </g>
        </g>
      ))}
    </svg>
  );
}

export function QuestionOperations({ m, termine }) {
  const l = lire(m);
  let posee = null;
  if (!termine && l?.sorte === 'colonnes') posee = Colonnes({ l, termine: false });
  if (!termine && l?.sorte === 'produit') posee = <Produit l={l} termine={false} />;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Boulier />
      <div className={`${P}__fronton`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {posee}
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={3.2} />}
    </div>
  );
}
