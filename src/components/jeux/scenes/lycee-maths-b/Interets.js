import { useState } from 'react';
import { nombresDans, ecrireFr, TexteQuestion } from './outils';

/**
 * L'ATELIER DE LA MONNAIE — « Intérêts et pourcentages » (voie pro). La
 * couverture : une jeune frappeuse de monnaie dans un atelier de pierre, une
 * presse à balancier, des piles de pièces d'or, d'argent et de cuivre, une
 * balance de changeur près de la fenêtre. La scène la reprend :
 *   - LA QUESTION : écrite dans le livre de comptes ; à côté, la presse frappe
 *     des pièces, les piles montent, la balance oscille ;
 *   - LES RÉPONSES : des pièces d'or (`choix`) — on glisse la bonne dans le
 *     coffre, ou on la touche, simplement ;
 *   - APRÈS LA RÉPONSE : les piles des années — à intérêts simples, la même
 *     pile s'ajoute chaque année (+ r) ; à intérêts composés, chaque pile
 *     grandit (× q) ; pour le commerce, la balance pèse le prix et le
 *     coefficient. La formule de la manche, avec ses nombres, dessous.
 */

const P = 'sc-interets-et-pourcentages';

/* ---------------------------------------------------------------- le décor */

function Atelier() {
  return (
    <svg className={`${P}__atelier`} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sc-int-or" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff3c0" />
          <stop offset="0.6" stopColor="#f0b72f" />
          <stop offset="1" stopColor="#a8700e" />
        </radialGradient>
      </defs>
      <rect width="240" height="150" rx="16" className={`${P}__mur`} />
      <path d="M150 14 h70 v60 h-70 Z" className={`${P}__fenetre`} />
      <path d="M150 54 L170 36 L184 46 L200 30 L220 46 V74 H150 Z" fill="#7fae8a" />
      <rect x="0" y="112" width="240" height="38" className={`${P}__etabli`} />
      {/* La presse à balancier, qui frappe. */}
      <rect x="22" y="20" width="12" height="92" rx="3" className={`${P}__metal`} />
      <rect x="78" y="20" width="12" height="92" rx="3" className={`${P}__metal`} />
      <rect x="16" y="14" width="80" height="14" rx="4" className={`${P}__metal`} />
      <g className={`${P}__piston`}>
        <rect x="46" y="28" width="20" height="44" className={`${P}__metal est-clair`} />
        <rect x="40" y="70" width="32" height="10" rx="2" className={`${P}__metal`} />
      </g>
      <ellipse cx="56" cy="108" rx="13" ry="4" fill="url(#sc-int-or)" className={`${P}__frappe`} />
      {/* Les piles de pièces qui montent. */}
      {[0, 1, 2, 3].map((p) => (
        <g key={p} className={`${P}__pile`} style={{ '--n': p }}>
          {Array.from({ length: 3 + p * 2 }, (_, i) => (
            <ellipse key={i} cx={118 + p * 22} cy={130 - i * 5} rx="9" ry="3.2" fill="url(#sc-int-or)" stroke="#8a5a0c" strokeWidth="0.8" />
          ))}
        </g>
      ))}
      {/* La balance du changeur. */}
      <g transform="translate(196 92)">
        <rect x="-2" y="0" width="4" height="22" className={`${P}__metal`} />
        <g className={`${P}__fleau`}>
          <rect x="-26" y="-2" width="52" height="4" rx="2" className={`${P}__metal`} />
          <path d="M-24 2 L-30 14 H-18 Z M24 2 L18 14 H30 Z" className={`${P}__plateau`} />
        </g>
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- l'explication */

/** Les piles des années : des marches égales (simples) ou qui grandissent (composés). */
function Piles({ modele, n = 5, etiquettes }) {
  const nb = Math.max(2, Math.min(n + 1, 8));
  const hauteurs = Array.from({ length: nb }, (_, i) => (modele === 'composes' ? 30 * 1.28 ** i : 30 + 14 * i));
  const max = Math.max(...hauteurs);
  return (
    <svg className={`${P}__piles`} viewBox="0 0 280 120" aria-hidden="true" focusable="false">
      {hauteurs.map((h, i) => {
        const x = 14 + i * (252 / nb);
        const hh = (h / max) * 86;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <g key={i} className={`${P}__colonne`} style={{ '--n': i }}>
            <rect x={x} y={100 - hh} width={252 / nb - 8} height={hh} rx="4" className={i === 0 ? 'est-capital' : ''} />
            <text x={x + (252 / nb - 8) / 2} y="114" textAnchor="middle">{etiquettes?.[i] ?? (i === 0 ? 'départ' : `an ${i}`)}</text>
            {i > 0 && (
              <text x={x + (252 / nb - 8) / 2} y={94 - hh} textAnchor="middle" className={`${P}__marche`}>
                {modele === 'composes' ? '× q' : '+ r'}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** La balance du commerce : le prix d'un côté, le résultat de l'autre. */
function Balance({ gauche, droite, operation }) {
  return (
    <div className={`${P}__balance`}>
      <span className={`${P}__plateau-texte`}>{gauche}</span>
      <span className={`${P}__operation`}>{operation}</span>
      <span className={`${P}__plateau-texte est-resultat`}>{droite}</span>
    </div>
  );
}

const pourcent = (q) => nombresDans(String(q).match(/(\d+(?:,\d+)?) ?%/)?.[0] ?? '')[0] ?? null;

function Explication({ m }) {
  const q = String(m.question);
  const t = pourcent(q);
  const nombres = nombresDans(q);
  let dessin = null;
  let formule = `La réponse : ${m.bonne}.`;
  const composes = q.includes('composés');
  const duree = Number(q.match(/pendant (\d+) (ans|mois)/)?.[1] ?? q.match(/au bout de (\d+) ans/)?.[1] ?? 5);
  switch (m.consigne) {
    case 'remise':
      dessin = <Balance gauche={`${ecrireFr(nombres[0])} €`} droite={m.bonne} operation={`× (1 − ${ecrireFr(t / 100, 4)})`} />;
      formule = 'Prix payé = prix affiché × (1 − taux de remise).';
      break;
    case 'tva':
      if (q.startsWith('Prix TTC')) {
        dessin = <Balance gauche={`${ecrireFr(nombres[0])} € TTC`} droite={`${m.bonne} HT`} operation={`÷ ${ecrireFr(1 + t / 100, 4)}`} />;
        formule = 'HT = TTC ÷ (1 + taux de TVA) : on divise, on ne retire pas le pourcentage du TTC.';
      } else {
        dessin = <Balance gauche={`${ecrireFr(nombres[0])} € HT`} droite={`${m.bonne} TTC`} operation={`× ${ecrireFr(1 + t / 100, 4)}`} />;
        formule = 'TTC = HT × (1 + taux de TVA).';
      }
      break;
    case 'augmentation':
      dessin = <Balance gauche={`${ecrireFr(nombres[0])} €`} droite={m.bonne} operation={`× ${ecrireFr(1 + t / 100, 4)}`} />;
      formule = 'Nouveau salaire = salaire × (1 + taux).';
      break;
    case 'taux-de-remise':
      formule = 'Taux de remise = (prix affiché − prix payé) ÷ prix affiché.';
      dessin = <Balance gauche={`${ecrireFr(nombres[0] - nombres[1])} € de remise`} droite={m.bonne} operation={`÷ ${ecrireFr(nombres[0])} €`} />;
      break;
    case 'interets-simples':
      dessin = <Piles modele="simples" n={q.includes('mois') ? 3 : duree} etiquettes={q.includes('mois') ? ['départ', '', '', ''] : undefined} />;
      formule = q.includes('mois')
        ? 'Intérêts simples = C × t × (durée en mois ÷ 12) : une durée en mois se compte en douzièmes d’année.'
        : 'Intérêts simples = C × t × n : la même somme chaque année.';
      break;
    case 'valeur-acquise':
      dessin = <Piles modele="simples" n={q.includes('mois') ? 3 : duree} />;
      formule = 'Valeur acquise = capital + intérêts.';
      break;
    case 'placement':
      formule = q.includes('Taux annuel') ? 'Taux annuel = intérêts ÷ (capital × durée).' : 'Capital = intérêts ÷ (taux × durée).';
      dessin = <Piles modele="simples" n={duree} />;
      break;
    case 'capital-acquis':
      dessin = <Piles modele={composes ? 'composes' : 'simples'} n={duree} />;
      formule = composes
        ? 'Intérêts composés : le capital est multiplié par q = 1 + t chaque année, Cₙ = C₀ × qⁿ.'
        : 'Intérêts simples : le même intérêt s’ajoute chaque année, Cₙ = C₀ + n × C₀ × t.';
      break;
    case 'raison':
      dessin = <Piles modele={composes ? 'composes' : 'simples'} n={4} />;
      formule = composes ? 'Composés : suite géométrique de raison q = 1 + t.' : 'Simples : suite arithmétique de raison r = C₀ × t, en euros.';
      break;
    case 'reconnaitre-suite': {
      const valeurs = nombresDans(q.split(':')[1] ?? '').slice(0, 3);
      const modele = m.bonne === 'geometrique' ? 'composes' : 'simples';
      if (valeurs.length === 3) {
        dessin = <Piles modele={modele} n={2} etiquettes={valeurs.map((v) => `${ecrireFr(v)} €`)} />;
        const ecarts = [valeurs[1] - valeurs[0], valeurs[2] - valeurs[1]].map((v) => ecrireFr(v));
        const quotients = [valeurs[1] / valeurs[0], valeurs[2] / valeurs[1]].map((v) => ecrireFr(v, 4));
        formule = `Écarts : ${ecarts.join(' puis ')} ; quotients : ${quotients.join(' puis ')}. `;
      } else formule = '';
      formule += {
        arithmetique: 'Écarts constants : arithmétique (intérêts simples).',
        geometrique: 'Quotients constants : géométrique (intérêts composés).',
        'ni-l-une-ni-l-autre': 'Ni les écarts ni les quotients ne sont constants.',
      }[m.bonne] ?? '';
      break;
    }
    case 'duree-placement':
      dessin = <Piles modele="composes" n={6} />;
      formule = 'On cherche le premier n entier tel que C × (1 + t)ⁿ atteigne l’objectif : on arrondit au-dessus.';
      break;
    case 'taux-moyen':
      dessin = <Piles modele="composes" n={4} />;
      formule = 'Le taux moyen t se répète chaque année : (1 + t)ⁿ = coefficient global, donc 1 + t = (coefficient global)^(1/n).';
      break;
    case 'somme-versements':
      dessin = <Piles modele="simples" n={6} etiquettes={['1er', '2e', '3e', '4e', '5e', '6e', '…']} />;
      formule = 'Des versements qui augmentent toujours de la même somme : total = n × (premier + dernier) ÷ 2.';
      break;
    default:
      break;
  }
  return (
    <div className={`${P}__explication`}>
      {dessin}
      <p className={`${P}__regle`}>{formule}</p>
    </div>
  );
}

export function QuestionInterets({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Atelier />}
      <div className={`${P}__registre`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

/**
 * LES RÉPONSES : des pièces d'or. On peut en glisser une dans le coffre — un
 * plus — ou simplement la toucher : chaque pièce est un bouton à son libellé.
 */
export function PiecesInterets({ choix, fautes, choisir }) {
  const [survol, setSurvol] = useState(false);
  const deposer = (e) => {
    e.preventDefault();
    setSurvol(false);
    const cle = e.dataTransfer?.getData('text/plain');
    const choisie = choix.find((c) => String(c.cle) === cle);
    if (choisie && !fautes.includes(choisie.cle)) choisir(choisie.cle);
  };
  return (
    <div className={`${P}__comptoir`}>
      <div className={`${P}__pieces`} role="group" aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => {
          const fausse = fautes.includes(cle);
          return (
            <button
              key={cle}
              type="button"
              className={`${P}__piece${fausse ? ' est-fausse' : ''}`}
              style={{ '--i': i }}
              onClick={() => choisir(cle)}
              disabled={fausse}
              draggable={!fausse}
              onDragStart={(e) => e.dataTransfer?.setData('text/plain', String(cle))}
            >
              {libelle}
            </button>
          );
        })}
      </div>
      <div
        className={`${P}__coffre${survol ? ' est-survole' : ''}`}
        aria-hidden="true"
        onDragOver={(e) => { e.preventDefault(); setSurvol(true); }}
        onDragLeave={() => setSurvol(false)}
        onDrop={deposer}
      >
        <span className={`${P}__couvercle`} />
        <span className={`${P}__fente`} />
        <span className={`${P}__aide`}>Glisse ta pièce ici, ou touche-la</span>
      </div>
    </div>
  );
}
