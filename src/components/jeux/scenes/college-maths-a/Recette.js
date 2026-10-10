import { classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireNombre, lireDuree, lireNombre,
} from './outils';

/**
 * LA CUISINE AUX CITRONS — « La recette », 6e, 5e et 4e (09/10/2026). La
 * couverture : une cuisine provençale, des faïences vertes et jaunes, des
 * citrons, des bocaux de farine et de sucre, une cuisinière qui fouette
 * sa pâte. La scène :
 *   - LA QUESTION : une fiche de recette épinglée (papier ligné), et, quand
 *     la question en donne un, son TABLEAU de proportionnalité recopié tel
 *     quel, « ? » dans la case vide ; des citrons se balancent, le fouet
 *     tourne dans le saladier, la vapeur monte ;
 *   - LES RÉPONSES : des bocaux de cuisine (`objets`) — et les deux buzzers
 *     pour « proportionnel ? oui ou non » ;
 *   - APRÈS LA RÉPONSE : la flèche « × k » se pose sur le tableau et la case
 *     vide se remplit ; ou les quotients colonne par colonne ; ou le
 *     bocal se remplit au pourcentage ; et le calcul, ligne à ligne.
 */
const P = 'sc-recette-college';

const e = (x) => ecrireNombre(Math.round(x * 1e6) / 1e6);
const nb = (t) => lireNombre(t);
/** Des euros : deux chiffres après la virgule dès qu'il y a des centimes (« 7,50 € »). */
const eur = (x) => {
  const c = Math.round(x * 100);
  const texte = ecrireNombre(c / 100);
  return c % 10 === 0 && c % 100 ? `${texte}0` : texte;
};
/** « 2 h 45 min » en heures décimales. */
const heures = (t) => (lireDuree(t) ?? 0) / 60;

/** Le tableau donné par la question : deux lignes de grandeurs. */
function tableau(q) {
  const r = /^(.+?)\s*:\s*([^.]+?)\.\s*(.+?)\s*:\s*([^.]+?)\.?\s*(?:Proportionnel\s*\?)?$/.exec(q);
  if (!r) return null;
  const valeurs = (s) => s.split(/\s*(?:;|\bet\b)\s*/).map((x) => x.trim()).filter(Boolean);
  const l1 = valeurs(r[2]);
  const l2 = valeurs(r[4]);
  if (l1.length !== l2.length || l1.length < 2) return null;
  return { titres: [r[1], r[3]], l1, l2 };
}

/** Le tableau dessiné, la flèche du coefficient, les quotients — selon l'état. */
function Tableau({
  t, coefficient = null, quotients = null, rempli = null,
}) {
  return (
    <div className={`${P}__tableau-cadre`}>
      <table className={`${P}__tableau`}>
        <tbody>
          <tr>
            <th scope="row">{t.titres[0]}</th>
            {t.l1.map((v, i) => <td key={`a${i}`}>{v}</td>)}
          </tr>
          <tr>
            <th scope="row">{t.titres[1]}</th>
            {t.l2.map((v, i) => (
              <td key={`b${i}`} className={v === '?' && rempli !== null ? 'est-rempli' : undefined}>
                {v === '?' && rempli !== null ? rempli : v}
              </td>
            ))}
          </tr>
          {quotients && (
            <tr className={`${P}__quotients`}>
              <th scope="row">÷</th>
              {quotients.map((v, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <td key={`q${i}`} style={{ '--d': `${(0.5 + i * 0.6).toFixed(2)}s` }}>{v}</td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
      {coefficient && <span className={`${P}__fleche`}>{`× ${coefficient}`}</span>}
    </div>
  );
}

/** Un bocal qui se remplit jusqu'au pourcentage. */
function Bocal({ pourcent }) {
  return (
    <span className={`${P}__bocal`} aria-hidden="true" style={{ '--p': `${Math.max(0, Math.min(100, pourcent))}%` }}>
      <span className={`${P}__couvercle`} />
      <span className={`${P}__contenu`} />
      <span className={`${P}__graduation`}>{`${e(pourcent)} %`}</span>
    </span>
  );
}

/** Les recettes de calcul, une par forme de question. Chacune rend { vue, lignes } ou null. */
const RECETTES = [
  // Plan ou carte à l'échelle 1/E.
  [/échelle 1\/([\d\s  ]+)\s*:.*?(\d+(?:,\d+)?) cm/, (r, m) => {
    const E = nb(r[1]);
    const L = nb(r[2]);
    const reel = L * E;
    const unite = /km$/.test(m.bonne) ? 'km' : 'm';
    const converti = unite === 'km' ? reel / 100000 : reel / 100;
    return {
      lignes: [
        `1 cm sur le papier = ${e(E)} cm en vrai`,
        `${e(L)} × ${e(E)} = ${e(reel)} cm = ${e(converti)} ${unite}`,
      ],
    };
  }],
  // 6 cahiers coûtent 7,50 €. Combien coûtent 12 cahiers ?
  [/^(\d+) (.+?) coûtent (\d+(?:,\d+)?)\s*€\.\s*Combien coûtent (\d+)/, (r) => {
    const [q1, prix, q2] = [nb(r[1]), nb(r[3]), nb(r[4])];
    const quoi = r[2];
    if (q2 % q1 === 0) return { lignes: [`${q2} ${quoi}, c’est ${q2 / q1} fois plus que ${q1}`, `${eur(prix)} € × ${q2 / q1} = ${eur(prix * (q2 / q1))} €`] };
    if (q1 % q2 === 0) return { lignes: [`${q2} ${quoi}, c’est ${q1 / q2} fois moins que ${q1}`, `${eur(prix)} € ÷ ${q1 / q2} = ${eur(prix / (q1 / q2))} €`] };
    return { lignes: [`Un seul : ${eur(prix)} € ÷ ${q1} = ${eur(prix / q1)} €`, `${q2} : ${eur(prix / q1)} € × ${q2} = ${eur((prix / q1) * q2)} €`] };
  }],
  // Le rectangle agrandi.
  [/rectangle de (\d+) cm sur (\d+) cm est agrandi : sa longueur passe de (\d+) cm à (\d+) cm/, (r) => {
    const [l, , L1, L2] = [nb(r[1]), nb(r[2]), nb(r[3]), nb(r[4])];
    const k = L2 / L1;
    return { lignes: [`La longueur est multipliée par ${L2} ÷ ${L1} = ${e(k)}`, `La largeur aussi : ${l} × ${e(k)} = ${e(l * k)} cm`] };
  }],
  // a % de N.
  [/^(\d+(?:,\d+)?) % de (\d+(?:,\d+)?)/, (r) => {
    const [t, N] = [nb(r[1]), nb(r[2])];
    return { vue: <Bocal pourcent={t} />, lignes: [`${e(t)} % de ${e(N)} = ${e(N)} × ${e(t)} ÷ 100 = ${e((N * t) / 100)}`] };
  }],
  // P élèves sur N : quel pourcentage ?
  [/^(\d+) .+? sur (\d+) .*Quel pourcentage/, (r) => {
    const [a, N] = [nb(r[1]), nb(r[2])];
    return { vue: <Bocal pourcent={(100 * a) / N} />, lignes: [`${a} ÷ ${N} = ${e(a / N)}`, `${e(a / N)} = ${e((100 * a) / N)}/100 = ${e((100 * a) / N)} %`] };
  }],
  // Un article soldé.
  [/article à (\d+(?:,\d+)?) € est soldé de (\d+) %/, (r) => {
    const [N, t] = [nb(r[1]), nb(r[2])];
    return { vue: <Bocal pourcent={100 - t} />, lignes: [`La remise : ${t} % de ${eur(N)} € = ${eur((N * t) / 100)} €`, `${eur(N)} − ${eur((N * t) / 100)} = ${eur(N - (N * t) / 100)} €`] };
  }],
  // Deux hausses successives.
  [/augmente de (\d+) %, puis de (\d+) %/, (r) => {
    const [a, b] = [nb(r[1]), nb(r[2])];
    const k = (1 + a / 100) * (1 + b / 100);
    return { lignes: [`+ ${a} % : × ${e(1 + a / 100)} ; + ${b} % : × ${e(1 + b / 100)}`, `${e(1 + a / 100)} × ${e(1 + b / 100)} = ${e(k)}, soit + ${e((k - 1) * 100)} %`] };
  }],
  // Une hausse puis une baisse.
  [/prix de (\d+(?:,\d+)?) € augmente de (\d+) %, puis baisse de (\d+) %/, (r) => {
    const [N, a, b] = [nb(r[1]), nb(r[2]), nb(r[3])];
    const apres = N * (1 + a / 100);
    return { lignes: [`${eur(N)} × ${e(1 + a / 100)} = ${eur(apres)} €`, `${eur(apres)} × ${e(1 - b / 100)} = ${eur(apres * (1 - b / 100))} €`, 'La baisse se calcule sur le nouveau prix, plus grand.'] };
  }],
  // Augmenter ou baisser, c'est multiplier par…
  [/^(Augmenter|Baisser) de (\d+) %/, (r) => {
    const t = nb(r[2]);
    const hausse = r[1] === 'Augmenter';
    return { lignes: [`100 % ${hausse ? '+' : '−'} ${t} % = ${hausse ? 100 + t : 100 - t} %`, `1 ${hausse ? '+' : '−'} ${e(t / 100)} = ${e(hausse ? 1 + t / 100 : 1 - t / 100)}`] };
  }],
  // Le robinet : un débit par minute, une durée en heures et minutes.
  [/débite (\d+(?:,\d+)?) L\/min\. Combien de litres coulent en (.+?) \?/, (r) => {
    const [deb, minutes] = [nb(r[1]), lireDuree(r[2])];
    return { lignes: [`${r[2]} = ${minutes} min`, `${e(deb)} × ${minutes} = ${e(deb * minutes)} L`] };
  }],
  // km/h → m/s.
  [/^(\d+(?:,\d+)?) km\/h = \? m\/s/, (r) => {
    const v = nb(r[1]);
    return { lignes: [`${e(v)} km en 1 h = ${e(v * 1000)} m en 3 600 s`, `${e(v * 1000)} ÷ 3 600 = ${e(v / 3.6)} m/s`] };
  }],
  // L'énergie : une puissance, une durée.
  [/de (\d+(?:,\d+)?) kW fonctionne (.+?)\./, (r) => {
    const [pw, h] = [nb(r[1]), heures(r[2])];
    return { lignes: [`${r[2]} = ${e(h)} h`, `${e(pw)} × ${e(h)} = ${e(pw * h)} kWh`] };
  }],
  // La vitesse moyenne.
  [/parcourt (\d+(?:,\d+)?) km en (.+?)\. Vitesse/, (r) => {
    const [d, h] = [nb(r[1]), heures(r[2])];
    return { lignes: [`${r[2]} = ${e(h)} h`, `v = ${e(d)} ÷ ${e(h)} = ${e(d / h)} km/h`] };
  }],
  // Le temps de parcours.
  [/parcourir (\d+(?:,\d+)?) km à (\d+(?:,\d+)?) km\/h/, (r) => {
    const [d, v] = [nb(r[1]), nb(r[2])];
    const h = d / v;
    const reste = h - Math.floor(h);
    const lignes = [`t = ${e(d)} ÷ ${e(v)} = ${e(h)} h`];
    if (reste > 1e-9) lignes.push(`${e(reste)} h = ${e(reste)} × 60 min = ${e(reste * 60)} min`);
    return { lignes };
  }],
  // La distance parcourue.
  [/roule à (\d+(?:,\d+)?) km\/h pendant (.+?)\. Distance/, (r) => {
    const [v, h] = [nb(r[1]), heures(r[2])];
    return { lignes: [`${r[2]} = ${e(h)} h`, `d = ${e(v)} × ${e(h)} = ${e(v * h)} km`] };
  }],
];

function contenu(m) {
  const q = m.question;
  const t = tableau(q);
  if (t && m.consigne === 'coefficient') {
    const [a1, a2] = t.l1.map(nb);
    const b1 = nb(t.l2[0]);
    if ([a1, a2, b1].some((x) => x === null) || !a1) return null;
    const k = b1 / a1;
    return (
      <>
        <Tableau t={t} coefficient={e(k)} rempli={e(a2 * k)} />
        <Etapes p={P} depart={1.4} lignes={[`${e(b1)} ÷ ${e(a1)} = ${e(k)} : on passe d’une ligne à l’autre en multipliant par ${e(k)}.`, `${e(a2)} × ${e(k)} = ${e(a2 * k)}`]} />
      </>
    );
  }
  if (t && m.consigne === 'proportionnel') {
    const quotients = t.l1.map((x, i) => {
      const a = nb(x);
      const b = nb(t.l2[i]);
      if (!a || b === null) return '?';
      const v = b / a;
      return `${Number.isInteger(v * 100) ? '' : '≈ '}${e(Math.round(v * 100) / 100)}`;
    });
    const memes = new Set(quotients).size === 1 && !quotients.includes('?');
    return (
      <>
        <Tableau t={t} quotients={quotients} />
        <Etapes p={P} depart={2.2} lignes={[memes ? 'Toujours le même quotient : on multiplie toujours par le même nombre.' : 'Les quotients ne sont pas tous égaux : aucun nombre unique ne fait passer d’une ligne à l’autre.']} />
      </>
    );
  }
  const regle = RECETTES.find(([motif]) => motif.test(q));
  if (!regle) return null;
  const r = regle[1](regle[0].exec(q), m);
  if (!r) return null;
  return (
    <>
      {r.vue}
      <Etapes p={P} depart={r.vue ? 1 : 0.3} lignes={r.lignes} />
    </>
  );
}

/** Le décor : des citrons qui se balancent, le saladier et son fouet, la vapeur. */
function Cuisine() {
  return (
    <div className={`${P}__cuisine`} aria-hidden="true">
      <span className={`${P}__branche`} />
      {[12, 30, 72, 88].map((x, i) => (
        <span key={x} className={`${P}__citron`} style={{ left: `${x}%`, animationDelay: `${(i * -0.8).toFixed(1)}s` }} />
      ))}
      <span className={`${P}__saladier`}>
        <span className={`${P}__fouet`} />
        <span className={`${P}__vapeur`} />
        <span className={`${P}__vapeur ${P}__vapeur--2`} />
      </span>
    </div>
  );
}

export function QuestionRecette({ m, termine }) {
  const t = ['coefficient', 'proportionnel'].includes(m.consigne) ? tableau(m.question) : null;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Cuisine />
      <div className={`${P}__fiche`}>
        <span className={`${P}__epingle`} aria-hidden="true" />
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
        {!termine && t && <Tableau t={t} />}
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={2.4} />}
    </div>
  );
}
