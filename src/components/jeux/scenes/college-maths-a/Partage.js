import { classeQuestion } from '../base';
import { Etapes, Explication } from './outils';

/**
 * LA TABLE DU BOULANGER — « Le partage », 6e (09/10/2026). La couverture :
 * une terrasse au bord de la mer, un four à pain qui rougeoie, des pains
 * ronds coupés en parts sur des assiettes bleues et blanches. La scène :
 *   - LA QUESTION : l'ardoise du jour, où la division est POSÉE (la potence,
 *     le dividende, le diviseur, la place vide du quotient), le four qui
 *     rougeoie, les pains fument sur la planche, l'olivier se balance ;
 *   - LES RÉPONSES : des assiettes de pain à servir (un clic sert l'assiette) ;
 *   - APRÈS LA RÉPONSE : la potence se remplit pas à pas — on abaisse, on
 *     soustrait, chaque chiffre du quotient tombe à son tour ; pour un
 *     partage avec reste, les assiettes se servent et le reste va au panier.
 */
const P = 'sc-partage-college';

/** « 224 ÷ 3 », « 6 376 ÷ 9 », « 42,7 ÷ 7 » → dividende écrit et diviseur. */
function lire(m) {
  const r = /^\s*([\d\s  ]+(?:,\d+)?)\s*÷\s*(\d+)/.exec(m.question);
  if (!r) return null;
  const dividende = r[1].replace(/[\s  ]/g, '');
  const diviseur = Number(r[2]);
  if (!diviseur || !/^\d+(,\d+)?$/.test(dividende)) return null;
  return { dividende, diviseur, avecReste: /quotient et reste/.test(m.question) };
}

/**
 * LA DIVISION POSÉE, pas à pas. Chaque pas : le nombre partiel (`partiel`,
 * écrit tel qu'on l'a abaissé), le produit retiré, le reste, et l'indice du
 * dernier chiffre abaissé. Au-delà des chiffres du dividende, on abaisse
 * des zéros (trois au plus) tant que le reste n'est pas nul — sauf quand on
 * cherche un reste.
 */
export function divisionPosee(dividende, d, avecReste) {
  const [entier, dec = ''] = dividende.split(',');
  const chiffres = (entier + dec).split('').map(Number);
  const nbEntiers = entier.length;
  const pas = [];
  let quotient = '';
  let reste = 0;
  let partiel = '';
  let ajoutes = 0;
  for (let i = 0; i < chiffres.length; i += 1) {
    partiel += String(chiffres[i]);
    const valeur = Number(partiel);
    // La première tranche : assez de chiffres pour contenir le diviseur (jusqu'aux unités au plus).
    if (!pas.length && valeur < d && i < nbEntiers - 1) continue; // eslint-disable-line no-continue
    if (i === nbEntiers && !quotient.includes(',')) quotient += quotient ? ',' : '0,';
    const q = Math.floor(valeur / d);
    quotient += String(q);
    reste = valeur - q * d;
    pas.push({
      partiel, produit: q * d, reste, fin: i,
    });
    partiel = String(reste);
    if (i === chiffres.length - 1 && reste !== 0 && !avecReste && ajoutes < 3) {
      chiffres.push(0);
      ajoutes += 1;
    }
  }
  return {
    pas, quotient, reste, chiffres, nbEntiers, virgule: dec.length > 0 || ajoutes > 0,
  };
}

/** La potence : à gauche les soustractions, à droite le diviseur et le quotient. */
function Potence({ l, termine }) {
  const div = divisionPosee(l.dividende, l.diviseur, l.avecReste);
  const nbChiffres = termine ? div.chiffres.length : l.dividende.replace(',', '').length;
  // Colonne d'affichage du chiffre i : une colonne pour le signe « − », une de plus après la virgule.
  const col = (i) => 1 + i + (div.virgule && i >= div.nbEntiers ? 1 : 0);
  const largeur = col(nbChiffres - 1) + 1;
  const ligneVide = () => Array(largeur).fill('');
  const placer = (ligne, texte, fin, signe = false) => {
    const t = String(texte);
    for (let k = 0; k < t.length; k += 1) {
      const i = fin - (t.length - 1 - k);
      if (i >= 0) ligne[col(i)] = t[k]; // eslint-disable-line no-param-reassign
    }
    // eslint-disable-next-line no-param-reassign
    if (signe) ligne[Math.max(0, col(fin - t.length + 1) - 1)] = '−';
    return ligne;
  };
  // Le dividende, avec sa virgule et, une fois la réponse donnée, les zéros abaissés en plus.
  const tete = ligneVide();
  div.chiffres.slice(0, nbChiffres).forEach((c, i) => { tete[col(i)] = String(c); });
  if (div.virgule && (termine || l.dividende.includes(','))) tete[col(div.nbEntiers) - 1] = ',';
  const lignes = [];
  if (termine) {
    div.pas.forEach((s, j) => {
      lignes.push({ cellules: placer(ligneVide(), s.produit, s.fin, true), produit: true, j });
      const suivant = div.pas[j + 1];
      lignes.push({ cellules: placer(ligneVide(), suivant ? suivant.partiel : s.reste, suivant ? suivant.fin : s.fin), j });
    });
  }
  const ajoute = (i) => termine && i >= l.dividende.replace(',', '').length;
  return (
    <div className={`${P}__potence${termine ? ' est-posee' : ''}`}>
      <div className={`${P}__gauche`}>
        <div className={`${P}__rang`}>
          {tete.map((c, k) => {
            const i = div.chiffres.findIndex((_, x) => col(x) === k);
            return (
              // eslint-disable-next-line react/no-array-index-key
              <span key={k} className={`${P}__case${i >= 0 && ajoute(i) ? ' est-abaisse' : ''}`}>{c}</span>
            );
          })}
        </div>
        {lignes.map(({ cellules, produit, j }, n) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={n} className={`${P}__rang${produit ? ' est-produit' : ''}`} style={{ '--d': `${(0.5 + j * 1.1 + (produit ? 0.35 : 0.75)).toFixed(2)}s` }}>
            {cellules.map((c, k) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={k} className={`${P}__case`}>{c}</span>
            ))}
          </div>
        ))}
      </div>
      <div className={`${P}__droite`}>
        <span className={`${P}__diviseur`}>{l.diviseur}</span>
        <span className={`${P}__quotient`}>
          {termine
            ? div.quotient.split('').map((c, k) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={k} className={`${P}__q`} style={{ '--d': `${(0.5 + div.quotient.slice(0, k).replace(',', '').length * 1.1).toFixed(2)}s` }}>{c}</span>
            ))
            : <span className={`${P}__q est-vide`}>?</span>}
        </span>
      </div>
    </div>
  );
}

/** Les assiettes servies, et le reste qui va au panier. */
function Service({ q, d, r }) {
  if (d > 9) return null;
  return (
    <div className={`${P}__service`} aria-hidden="true">
      {Array.from({ length: d }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`${P}__assiette-servie`} style={{ '--d': `${(2.6 + i * 0.18).toFixed(2)}s` }}>{q}</span>
      ))}
      <span className={`${P}__panier`} style={{ '--d': `${(2.8 + d * 0.18).toFixed(2)}s` }}>{r}</span>
    </div>
  );
}

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  const div = divisionPosee(l.dividende, l.diviseur, l.avecReste);
  if (!div.pas.length) return null;
  const q = div.quotient;
  const fin = 0.5 + div.pas.length * 1.1;
  if (l.avecReste) {
    return (
      <>
        <Potence l={l} termine />
        <Service q={q} d={l.diviseur} r={div.reste} />
        <Etapes p={P} depart={fin + 0.6} lignes={[`${l.diviseur} × ${q} + ${div.reste} = ${l.dividende}, et le reste ${div.reste} est plus petit que ${l.diviseur}.`]} />
      </>
    );
  }
  return (
    <>
      <Potence l={l} termine />
      <Etapes
        p={P}
        depart={fin}
        lignes={[
          l.dividende.includes(',')
            ? 'La virgule se pose au quotient quand on abaisse le premier chiffre après la virgule.'
            : 'On met une virgule au quotient, puis on abaisse des zéros tant que le reste n’est pas nul.',
        ]}
      />
    </>
  );
}

/** Le décor : la planche du boulanger et ses pains qui fument, le four qui rougeoie, l'olivier qui se balance. */
function Terrasse() {
  return (
    <svg className={`${P}__terrasse`} viewBox="0 0 400 76" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax meet">
      <g className={`${P}__olivier`}>
        <path d="M0 4 Q 40 14 90 6" />
        {[22, 44, 66, 82].map((x, i) => <ellipse key={x} cx={x} cy={10 + (i % 2) * 3} rx="9" ry="3.4" transform={`rotate(${i % 2 ? 24 : -18} ${x} 10)`} />)}
      </g>
      <rect x="60" y="62" width="220" height="9" rx="4" className={`${P}__planche`} />
      {[90, 140, 190, 240].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 22} 62 Q ${x - 22} 36 ${x} 36 Q ${x + 22} 36 ${x + 22} 62 Z`} className={`${P}__pain-decor`} />
          <path d={`M${x - 9} 44 l6 12 M${x + 3} 42 l6 12`} className={`${P}__entaille`} />
          <path d={`M${x} 30 q -5 -7 0 -14 q 5 -7 0 -14`} className={`${P}__fumet`} style={{ animationDelay: `${(i * -0.7).toFixed(1)}s` }} />
        </g>
      ))}
      <g className={`${P}__four`}>
        <path d="M300 74 V46 a40 34 0 0 1 80 0 V74 Z" />
        <path d="M322 74 V58 a18 15 0 0 1 36 0 V74 Z" className={`${P}__braise`} />
      </g>
    </svg>
  );
}

export function QuestionPartage({ m, termine }) {
  const l = lire(m);
  // L'explication attend que la potence ait fini de s'écrire.
  const nbPas = l ? divisionPosee(l.dividende, l.diviseur, l.avecReste).pas.length : 0;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {!termine && <Terrasse />}
      <div className={`${P}__ardoise`}>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
        {!termine && l && <Potence l={l} termine={false} />}
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={nbPas * 1.1 + 1.6} />}
    </div>
  );
}

/** Les réponses : des assiettes de pain, chacune avec son étiquette. */
export function Assiettes({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__table`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__assiette${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__pain`} aria-hidden="true" />
            <span className={`${P}__etiquette`}>{libelle}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
