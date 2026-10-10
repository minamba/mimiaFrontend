import {
  Enonce, ecrire, nombre, useEtapes,
} from './commun';

/**
 * LE PORT AUX CONTENEURS — « Le diagramme » (6e → 3e), le 09/10/2026.
 * La couverture : un quai au soleil couchant, des grues, des piles de
 * conteneurs colorés, une bitte d'amarrage. Ici, LES DONNÉES SONT DES PILES DE
 * CONTENEURS : une barre est une pile, une série est un alignement sur le quai,
 * un tableau est le manifeste du port, un diagramme circulaire la rose du
 * cadran. Le texte de la question reste affiché tel quel sur le manifeste.
 *   AVANT la réponse : on ne dessine que ce que la question donne (les
 *   valeurs, les angles, les graduations) — jamais le résultat ;
 *   APRÈS : la grue se met au travail — les piles se nivellent à la moyenne,
 *   se rangent pour la médiane, la case cherchée s'allume, le secteur sort du
 *   disque, l'écart se mesure… et le calcul se pose, ligne à ligne.
 */

const P = 'sc-diagramme-college';
const TEINTES = ['#e8590c', '#1c7ed6', '#2f9e44', '#f2b705', '#c2255c', '#5f3dc4', '#0c8599', '#d9480f'];

/* ------------------------------------------------------- LES LECTURES */

/** « 12 ; 5 ; 30 » → [12, 5, 30] (la série de la question). */
function serieDe(question) {
  const apres = String(question).split(':')[1] ?? '';
  const morceau = apres.split('.').filter((x) => /\d/.test(x))[0] ?? '';
  const liste = morceau.split(';').map((x) => nombre(x.replace(/\(.*\)/, '')));
  return liste.every((x) => Number.isFinite(x)) && liste.length >= 2 ? liste : null;
}

/** « foot 3, danse 5, judo 7 » → [['foot', 3], …] */
function paires(texte) {
  return String(texte).split(',').map((x) => x.trim().match(/^(.+?)\s+(\d+)°?$/)).filter(Boolean).map((r) => [r[1], Number(r[2])]);
}

/* -------------------------------------------------------- LES DESSINS */

/**
 * LE QUAI : une pile de conteneurs par valeur. `hauteurs` (facultatif)
 * remplace les vraies hauteurs (la moyenne qui nivelle), `places` la position
 * de chaque pile (le rangement), `allumes` les piles mises en lumière.
 */
function Quai({
  valeurs, noms = [], hauteurs = null, places = null, allumes = [], niveau = null, etiquettes = true, bas = null, max: maxDonne, bande = null, muet = false,
}) {
  const max = maxDonne ?? Math.max(...valeurs, ...(niveau !== null ? [niveau] : []), 1);
  const n = valeurs.length;
  return (
    <div className={`${P}__quai`} style={{ '--n': n }}>
      {niveau !== null && (
        <span className={`${P}__niveau`} style={{ '--h': niveau / max }}>
          {!muet && <em>{ecrire(niveau)}</em>}
        </span>
      )}
      {valeurs.map((v, i) => {
        const h = hauteurs ? hauteurs[i] : v;
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`${P}__pile${allumes.includes(i) ? ' est-allumee' : ''}`}
            style={{
              '--x': places ? places[i] : i, '--h': Math.max(0, h) / max, '--c': TEINTES[i % TEINTES.length], '--k': i,
            }}
          >
            {etiquettes && <strong className={`${P}__valeur`}>{ecrire(v)}</strong>}
            <span className={`${P}__conteneurs`} />
            {bande && bande.i === i && (
              <span className={`${P}__bande`} style={{ '--b': bande.de / Math.max(v, 1) }}><em>{bande.texte}</em></span>
            )}
            {(noms[i] || bas) && <span className={`${P}__nom`}>{noms[i] ?? bas?.(i)}</span>}
          </span>
        );
      })}
      <span className={`${P}__eau`} aria-hidden="true" />
    </div>
  );
}

/** Le calcul qui se pose sur l'ardoise du quai, une ligne après l'autre. */
function Calcul({ lignes, n }) {
  return (
    <ol className={`${P}__calcul`} aria-label="Le calcul">
      {lignes.map((l, i) => <li key={l} className={i < n ? 'est-pose' : ''}>{l}</li>)}
    </ol>
  );
}

/* --------------------------------------------------------- LES SORTES */

/** Le tableau à double entrée : le manifeste du port. */
function Tableau({ m, termine }) {
  const q = m.question;
  const f = q.match(/Filles : (.+?)\. Garçons : (.+?)\./);
  if (!f) return null;
  const filles = paires(f[1]);
  const garcons = paires(f[2]);
  if (filles.length !== garcons.length || !filles.length) return null;
  const queue = q.slice(q.indexOf(f[0]) + f[0].length);
  const colonne = filles.findIndex(([a]) => new RegExp(`\\b${a}\\b`).test(queue));
  let allume = () => false;
  if (termine) {
    if (/en tout \?$/.test(queue) && colonne < 0) allume = () => true;
    else if (/en tout/.test(queue)) allume = (l, c) => c === colonne;
    else {
      const ligne = /filles/.test(queue) ? 0 : 1;
      allume = (l, c) => l === ligne && c === colonne;
    }
  }
  return (
    <table className={`${P}__manifeste`}>
      <thead>
        <tr>
          <th aria-label="Groupe" />
          {filles.map(([a], c) => <th key={a} className={termine && colonne === c ? 'est-visee' : ''}>{a}</th>)}
        </tr>
      </thead>
      <tbody>
        {[['Filles', filles], ['Garçons', garcons]].map(([nom, ligne], l) => (
          <tr key={nom}>
            <th>{nom}</th>
            {ligne.map(([a, v], c) => <td key={a} className={allume(l, c) ? 'est-allumee' : ''} style={{ '--k': l * 3 + c }}>{v}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Le diagramme circulaire : le secteur cherché sort du disque, après. */
function Circulaire({ m, termine }) {
  const q = m.question;
  const r = q.match(/de (\d+) élèves : (.+?)\. Combien d’élèves font (.+?) \?/);
  if (!r) return null;
  const total = Number(r[1]);
  const secteurs = paires(r[2]);
  if (secteurs.reduce((s, [, a]) => s + a, 0) !== 360) return null;
  const vise = secteurs.findIndex(([a]) => new RegExp(`\\b${a}\\b`).test(r[3]));
  let debut = -90;
  const rad = (d) => (d * Math.PI) / 180;
  return (
    <div className={`${P}__rose`}>
      <svg viewBox="-120 -120 240 240" className={`${P}__disque`} aria-hidden="true" focusable="false">
        <circle r="104" className={`${P}__cadran`} />
        {secteurs.map(([nom, angle], i) => {
          const a0 = debut;
          debut += angle;
          const a1 = debut;
          const milieu = rad((a0 + a1) / 2);
          const d = `M0 0 L${90 * Math.cos(rad(a0))} ${90 * Math.sin(rad(a0))} A90 90 0 ${angle > 180 ? 1 : 0} 1 ${90 * Math.cos(rad(a1))} ${90 * Math.sin(rad(a1))} Z`;
          const sort = termine && i === vise;
          return (
            <g key={nom} className={`${P}__secteur${sort ? ' est-sorti' : ''}`} style={{ '--dx': `${14 * Math.cos(milieu)}px`, '--dy': `${14 * Math.sin(milieu)}px` }}>
              <path d={d} fill={TEINTES[i]} />
              <text x={56 * Math.cos(milieu)} y={56 * Math.sin(milieu) - 6} textAnchor="middle">{nom}</text>
              <text x={56 * Math.cos(milieu)} y={56 * Math.sin(milieu) + 12} textAnchor="middle" className={`${P}__angle`}>{`${angle}°`}</text>
            </g>
          );
        })}
      </svg>
      {termine && vise >= 0 && (
        <EtapesCirculaire total={total} angle={secteurs[vise][1]} />
      )}
    </div>
  );
}

function EtapesCirculaire({ total, angle }) {
  const lignes = [
    `Le disque entier : 360° pour ${total} élèves`,
    `${angle}° sur 360°, c’est ${angle} ÷ 360 du disque`,
    `${total} × ${angle} ÷ 360 = ${ecrire((total * angle) / 360)} élèves`,
  ];
  return <Calcul lignes={lignes} n={useEtapes(lignes.length, 1000)} />;
}

/** Les barres : l'écart qui se mesure, ou la graduation du milieu. */
function Barres({ m, termine }) {
  const q = m.question;
  const g = q.match(/gradué de (\d+) en \d+\. La barre des (.+?) s’arrête juste au milieu, entre (\d+) et (\d+)\./);
  if (g) return <Graduation pas={Number(g[1])} bas={Number(g[3])} haut={Number(g[4])} objet={g[2]} termine={termine} />;
  const e = q.match(/: (.+?)\. De combien la barre de (\S+) dépasse-t-elle celle de (\S+) \?/);
  if (!e) return null;
  const jours = paires(e[1]);
  if (jours.length < 2) return null;
  const valeurs = jours.map(([, v]) => v);
  const ig = jours.findIndex(([j]) => j === e[2]);
  const ip = jours.findIndex(([j]) => j === e[3]);
  if (ig < 0 || ip < 0) return null;
  return (
    <div className={`${P}__atelier`}>
      <Quai
        valeurs={valeurs}
        noms={jours.map(([j]) => j)}
        allumes={termine ? [ig, ip] : []}
        niveau={termine ? valeurs[ip] : null}
        muet
        bande={termine ? { i: ig, de: valeurs[ip], texte: `+${valeurs[ig] - valeurs[ip]}` } : null}
      />
      {termine && <Calcul lignes={[`${valeurs[ig]} − ${valeurs[ip]} = ${valeurs[ig] - valeurs[ip]}`]} n={1} />}
    </div>
  );
}

/** La barre qui s'arrête entre deux traits : après, le trait du milieu apparaît. */
function Graduation({
  pas, bas, haut, objet, termine,
}) {
  const traits = [];
  for (let v = 0; v <= haut + pas; v += pas) traits.push(v);
  const max = traits[traits.length - 1];
  const y = (v) => 170 - (v / max) * 150;
  const milieu = (bas + haut) / 2;
  return (
    <svg viewBox="0 0 260 190" className={`${P}__graduation`} aria-hidden="true" focusable="false">
      {traits.map((v) => (
        <g key={v}>
          <line x1="52" x2="240" y1={y(v)} y2={y(v)} className={`${P}__grille`} />
          <text x="44" y={y(v) + 5} textAnchor="end">{v}</text>
        </g>
      ))}
      <line x1="52" x2="52" y1="14" y2="172" className={`${P}__axe`} />
      <rect x="110" y={y(milieu)} width="70" height={170 - y(milieu)} rx="3" className={`${P}__barre`} />
      <text x="145" y="186" textAnchor="middle" className={`${P}__legende`}>{objet}</text>
      {termine && (
        <g className={`${P}__repere-milieu`}>
          <line x1="52" x2="200" y1={y(milieu)} y2={y(milieu)} />
          <rect x="196" y={y(milieu) - 13} width="56" height="26" rx="13" />
          <text x="224" y={y(milieu) + 6} textAnchor="middle">{ecrire(milieu)}</text>
        </g>
      )}
    </svg>
  );
}

/** Les notes : après, la grue nivelle les piles à la moyenne. */
function Moyenne({ m, termine, ponderee }) {
  const valeurs = serieDe(m.question);
  if (!valeurs) return null;
  const coefs = ponderee ? (m.question.match(/coefficient (\d+)/g) ?? []).map((x) => Number(x.split(' ')[1])) : valeurs.map(() => 1);
  if (coefs.length !== valeurs.length) return null;
  const somme = valeurs.reduce((s, v, i) => s + v * coefs[i], 0);
  const effectif = coefs.reduce((s, c) => s + c, 0);
  const moyenne = somme / effectif;
  const noms = ponderee ? coefs.map((c) => `coef. ${c}`) : null;
  if (!termine) return <Quai valeurs={valeurs} noms={noms ?? []} max={20} />;
  return <Nivellement valeurs={valeurs} coefs={coefs} moyenne={moyenne} somme={somme} effectif={effectif} noms={noms} ponderee={ponderee} />;
}

function Nivellement({
  valeurs, coefs, moyenne, somme, effectif, noms, ponderee,
}) {
  const lignes = ponderee ? [
    `${valeurs.map((v, i) => `${v} × ${coefs[i]}`).join(' + ')} = ${somme}`,
    `Somme des coefficients : ${coefs.join(' + ')} = ${effectif}`,
    `${somme} ÷ ${effectif} = ${ecrire(moyenne)}`,
  ] : [
    `${valeurs.join(' + ')} = ${somme}`,
    `${somme} ÷ ${effectif} = ${ecrire(moyenne)}`,
  ];
  const n = useEtapes(lignes.length, 1100);
  const nivele = n >= lignes.length;
  return (
    <div className={`${P}__atelier`}>
      <Quai
        valeurs={valeurs}
        noms={noms ?? []}
        max={20}
        hauteurs={nivele && !ponderee ? valeurs.map(() => moyenne) : null}
        niveau={nivele ? moyenne : null}
        etiquettes
      />
      <Calcul lignes={lignes} n={n} />
    </div>
  );
}

/** La médiane : après, les piles se rangent, et celle du milieu s'allume. */
function Mediane({ m, termine }) {
  const valeurs = serieDe(m.question);
  if (!valeurs) return null;
  if (!termine) return <Quai valeurs={valeurs} />;
  return <Rangement valeurs={valeurs} />;
}

function Rangement({ valeurs }) {
  const n = valeurs.length;
  const ordre = valeurs.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const places = Array(n);
  ordre.forEach(([, i], rang) => { places[i] = rang; });
  const milieux = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
  const centre = milieux.map((r) => ordre[r][1]);
  const med = milieux.reduce((s, r) => s + ordre[r][0], 0) / milieux.length;
  const lignes = [
    `On range les ${n} valeurs : ${ordre.map(([v]) => ecrire(v)).join(' ; ')}`,
    n % 2
      ? `Au milieu, la ${milieux[0] + 1}e valeur : ${ecrire(med)}`
      : `Au milieu, entre ${ecrire(ordre[milieux[0]][0])} et ${ecrire(ordre[milieux[1]][0])} : ${ecrire(med)}`,
  ];
  const k = useEtapes(lignes.length, 1300);
  return (
    <div className={`${P}__atelier`}>
      <Quai valeurs={valeurs} places={k >= 1 ? places : null} allumes={k >= 2 ? centre : []} niveau={k >= 2 ? med : null} />
      <Calcul lignes={lignes} n={k} />
    </div>
  );
}

/** Les quartiles : la série est déjà rangée ; après, le rang se calcule et la pile s'allume. */
function Quartile({ m, termine }) {
  const valeurs = serieDe(m.question);
  if (!valeurs) return null;
  const n = valeurs.length;
  const troisieme = /Troisième/.test(m.question);
  const rang = Math.ceil(((troisieme ? 3 : 1) * n) / 4);
  const lignes = [
    `${troisieme ? `3 × ${n} ÷ 4` : `${n} ÷ 4`} = ${ecrire(((troisieme ? 3 : 1) * n) / 4)}`,
    `On arrondit au-dessus : rang ${rang}`,
    `La ${rang}e valeur : ${ecrire(valeurs[rang - 1])}`,
  ];
  return termine
    ? <EtapesQuartile valeurs={valeurs} rang={rang} lignes={lignes} troisieme={troisieme} />
    : <Quai valeurs={valeurs} />;
}

function EtapesQuartile({
  valeurs, rang, lignes, troisieme,
}) {
  const k = useEtapes(lignes.length, 1100);
  return (
    <div className={`${P}__atelier`}>
      <Quai valeurs={valeurs} allumes={k >= 3 ? [rang - 1] : []} bas={k >= 2 ? (i) => (i + 1 === rang ? (troisieme ? 'Q3' : 'Q1') : `${i + 1}`) : null} />
      <Calcul lignes={lignes} n={k} />
    </div>
  );
}

/** L'étendue : après, la plus haute et la plus basse s'allument, et l'écart se mesure. */
function Etendue({ m, termine }) {
  const valeurs = serieDe(m.question);
  if (!valeurs) return null;
  const max = Math.max(...valeurs);
  const min = Math.min(...valeurs);
  return (
    <div className={`${P}__atelier`}>
      <Quai valeurs={valeurs} allumes={termine ? [valeurs.indexOf(max), valeurs.indexOf(min)] : []} niveau={termine ? min : null} />
      {termine && <Calcul lignes={[`La plus grande : ${max} ; la plus petite : ${min}`, `${max} − ${min} = ${max - min}`]} n={2} />}
    </div>
  );
}

/** Une grille de conteneurs : la part colorée, et la jauge de fréquence. */
function Grille({ total, colores, jauge = null, marque = null }) {
  return (
    <div className={`${P}__grille-cadre`}>
      <div className={`${P}__parc`} style={{ '--n': Math.min(total, 10) }}>
        {Array.from({ length: total }, (_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__boite${i < colores ? ' est-coloree' : ''}`} style={{ '--k': i }} />
        ))}
      </div>
      {(jauge !== null || marque !== null) && (
        <div className={`${P}__jauge`}>
          <span className={`${P}__jauge-plein`} style={{ '--f': jauge ?? 0 }} />
          {marque !== null && <span className={`${P}__jauge-marque`} style={{ '--f': marque }}><em>{ecrire(marque)}</em></span>}
          <span className={`${P}__jauge-bornes`}><b>0</b><b>1</b></span>
        </div>
      )}
    </div>
  );
}

function Frequence({ m, termine }) {
  const r = m.question.match(/Sur (\d+) élèves, (\d+) viennent/);
  if (!r) return null;
  const [total, part] = [Number(r[1]), Number(r[2])];
  return (
    <div className={`${P}__atelier`}>
      <Grille total={total} colores={part} jauge={termine ? part / total : null} />
      {termine && <Calcul lignes={[`${part} ÷ ${total} = ${ecrire(part / total)}`]} n={1} />}
    </div>
  );
}

function Effectif({ m, termine }) {
  const r = m.question.match(/Classe de (\d+) élèves ; fréquence des demi-pensionnaires : ([\d,]+)\./);
  if (!r) return null;
  const total = Number(r[1]);
  const f = nombre(r[2]);
  if (!Number.isFinite(f)) return null;
  return termine ? <EtapesEffectif total={total} f={f} /> : <Grille total={total} colores={0} marque={f} />;
}

function EtapesEffectif({ total, f }) {
  const e = Math.round(total * f);
  const k = useEtapes(e, Math.min(260, 4000 / Math.max(e, 1)), 300);
  return (
    <div className={`${P}__atelier`}>
      <Grille total={total} colores={k} marque={f} jauge={f} />
      <Calcul lignes={[`${total} × ${ecrire(f)} = ${ecrire(total * f)}`]} n={k >= e ? 1 : 0} />
    </div>
  );
}

const SORTES = {
  tableau: Tableau,
  circulaire: Circulaire,
  barres: Barres,
  moyenne: (props) => <Moyenne {...props} />,
  ponderee: (props) => <Moyenne {...props} ponderee />,
  mediane: Mediane,
  quartile: Quartile,
  etendue: Etendue,
  frequence: Frequence,
  effectif: Effectif,
};

/** La grue du port, qui se balance au-dessus du quai. */
function Grue() {
  return (
    <svg viewBox="0 0 120 90" className={`${P}__grue`} aria-hidden="true" focusable="false">
      <path d="M20 88 V10 H112 M20 10 L46 34 M20 26 H96" className={`${P}__grue-metal`} />
      <path d="M14 88 H34" className={`${P}__grue-metal`} />
      <g className={`${P}__crochet`}>
        <line x1="92" y1="10" x2="92" y2="54" />
        <rect x="78" y="54" width="28" height="16" rx="2" />
      </g>
    </svg>
  );
}

export function QuestionDiagramme({ m, termine }) {
  const Sorte = SORTES[m.consigne];
  // Une donnée qu'on ne sait pas lire : le manifeste seul, sans dessin.
  const dessin = Sorte ? <Sorte m={m} termine={termine} /> : null;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__entete`}>
        <Grue />
        <Enonce m={m} classe={`${P}__tableau-noir`} />
      </div>
      {dessin}
    </div>
  );
}

export const sceneDiagramme = {
  question: (m, termine) => <QuestionDiagramme m={m} termine={termine} />,
  objets: P,
};
