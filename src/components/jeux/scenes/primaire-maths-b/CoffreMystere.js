import { Fragment } from 'react';
import { entiersDe, rangee, rang } from './communs';
import './primaire-maths-b.css';

/**
 * LA BOÎTE MYSTÈRE — CM1 « La boîte mystère », CM2 « Le schéma en barres »
 * (09/10/2026). Deux couvertures, deux univers :
 *   - AU CM1, un garçon ouvre un coffre noir et or d'où s'échappent des « ? »
 *     lumineux. La scène : le coffre qui frémit (quelque chose bouge dedans),
 *     l'égalité sur une enseigne en bois, la case ▢ en petit coffre doré ; le
 *     nombre pensé devient une MACHINE (× puis +) dont on voit les étapes.
 *     Les réponses sont des CLÉS d'un trousseau : on essaie une clé.
 *     Après : le couvercle s'ouvre, le nombre sort dans un rayon de lumière,
 *     et le calcul À L'ENVERS se déroule (le total moins le connu, la machine
 *     défaite de la fin vers le début).
 *   - AU CM2, un panneau holographique bleu porte le schéma en barres. La
 *     balance (17 + 8 = ▢ + 10) a deux plateaux à l'équilibre : on y pose un
 *     POIDS. Les problèmes « de plus » et « fois plus » gardent leur schéma ;
 *     on choisit une BARRE lumineuse. Après : les « ? » du schéma se
 *     remplissent, et le calcul s'écrit étape par étape.
 * Avant la réponse, rien n'est calculé à l'écran.
 */

export const BOITE = '▢';

/**
 * LE SCHÉMA EN BARRES DU CM2. « De plus que » : deux barres égales, la plus
 * longue porte en plus l'écart. « Fois plus que » : une part pour le moins
 * cher, plusieurs parts égales pour l'autre. L'accolade porte le total ; la
 * part cherchée porte un « ? » — et, une fois la réponse donnée (`valeur`),
 * chaque part montre ce qu'elle vaut.
 */
export function Schema({ schema, valeur = null }) {
  const [premier, second] = schema.noms;
  const unite = schema.sorte === 'fois' ? ' €' : '';
  let n = 0;
  const part = (k) => {
    n += 1;
    return valeur === null
      ? <span key={k} className="schema__part">?</span>
      : <span key={k} className="schema__part sc-boite-mystere__part-revelee" style={rang(n)}>{`${valeur}${unite}`}</span>;
  };
  const parts = (combien, extra) => (
    <span className="schema__barre">
      {rangee(combien).map((i) => part(i))}
      {extra != null && <span className="schema__part schema__part--ecart">{extra}</span>}
    </span>
  );
  return (
    <div className="schema" role="img" aria-label={`Un schéma en barres ; ${schema.total} en tout`}>
      <div className="schema__ligne">
        <span className="schema__nom">{premier}</span>
        {schema.sorte === 'plus' ? parts(1, schema.ecart) : parts(schema.fois)}
      </div>
      <div className="schema__ligne">
        <span className="schema__nom">{second}</span>
        {parts(1)}
      </div>
      <p className="schema__total">{`${schema.total}${unite} en tout`}</p>
    </div>
  );
}

/** Une égalité écrite en jetons ; la case ▢ devient un petit coffre doré. */
function Egalite({ texte, valeur = null }) {
  const morceaux = String(texte).split(' ');
  return (
    <p className="sc-boite-mystere__egalite">
      {morceaux.map((t, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          {i > 0 && ' '}
          {t === BOITE
            ? <span className={`sc-boite-mystere__case${valeur !== null ? ' est-ouverte' : ''}`}>{valeur !== null ? valeur : t}</span>
            : <span className={/^[+×=−-]$/.test(t) ? 'sc-boite-mystere__signe' : 'sc-boite-mystere__nb'}>{t}</span>}
        </Fragment>
      ))}
    </p>
  );
}

/** Le coffre noir et or ; `ouvert` : le couvercle bascule et le nombre s'envole. */
function Coffre({ ouvert, valeur }) {
  return (
    <div className={`sc-boite-mystere__coffre${ouvert ? ' est-ouvert' : ''}`} aria-hidden="true">
      {!ouvert && rangee(5).map((i) => <span key={i} className="sc-boite-mystere__mystere" style={rang(i)}>?</span>)}
      {ouvert && <span className="sc-boite-mystere__rayon" />}
      {ouvert && <span className="sc-boite-mystere__sortie">{valeur}</span>}
      <svg viewBox="0 0 160 140" focusable="false">
        <rect x="20" y="62" width="120" height="70" rx="8" className="sc-boite-mystere__corps" />
        <rect x="36" y="62" width="8" height="70" className="sc-boite-mystere__or" />
        <rect x="116" y="62" width="8" height="70" className="sc-boite-mystere__or" />
        <text x="62" y="114" className="sc-boite-mystere__point">?</text>
        <text x="98" y="114" className="sc-boite-mystere__point">?</text>
        <rect x="70" y="72" width="20" height="24" rx="3" className="sc-boite-mystere__serrure" />
        <path d="M80 80 a3 3 0 1 1 0.1 0 l2 8 h-4 z" className="sc-boite-mystere__trou" />
        <g className="sc-boite-mystere__couvercle">
          <path d="M20 62 L20 46 Q80 14 140 46 L140 62 Z" className="sc-boite-mystere__corps" />
          <path d="M36 62 L36 37 M124 62 L124 37" className="sc-boite-mystere__bande" />
          <path d="M20 62 L140 62" className="sc-boite-mystere__bande" />
        </g>
      </svg>
    </div>
  );
}

/** « Je le multiplie par 3, puis j'ajoute 4. J'obtiens 25. » → { f: 3, a: 4, r: 25 }. */
function lirePense(question) {
  const f = /multiplie par (\d+)/.exec(question);
  const a = /ajoute (\d+)/.exec(question);
  const r = /obtiens (\d+)/.exec(question);
  return f && a && r ? { f: Number(f[1]), a: Number(a[1]), r: Number(r[1]) } : null;
}

/**
 * LA MACHINE DU NOMBRE PENSÉ : ▢ → × 3 → … → + 4 → 25. Avant la réponse, on la
 * voit dans le bon sens, sans rien calculer. Après, elle tourne À L'ENVERS :
 * 25 → − 4 → 21 → ÷ 3 → 7, une étape après l'autre.
 */
function Machine({ m, termine }) {
  const p = lirePense(m.question);
  if (!p) return null;
  const milieu = p.r - p.a;
  if (!termine) {
    return (
      <div className="sc-boite-mystere__machine" aria-hidden="true">
        <span className="sc-boite-mystere__wagon est-mystere">?</span>
        <span className="sc-boite-mystere__engrenage">{`× ${p.f}`}</span>
        <span className="sc-boite-mystere__wagon">…</span>
        <span className="sc-boite-mystere__engrenage">{`+ ${p.a}`}</span>
        <span className="sc-boite-mystere__wagon est-fin">{p.r}</span>
      </div>
    );
  }
  return (
    <div className="sc-boite-mystere__machine est-envers">
      <span className="sc-boite-mystere__wagon est-fin sc-boite-mystere__etape" style={rang(0)}>{p.r}</span>
      <span className="sc-boite-mystere__engrenage sc-boite-mystere__etape" style={rang(1)}>{`− ${p.a}`}</span>
      <span className="sc-boite-mystere__wagon sc-boite-mystere__etape" style={rang(2)}>{milieu}</span>
      <span className="sc-boite-mystere__engrenage sc-boite-mystere__etape" style={rang(3)}>{`÷ ${p.f}`}</span>
      <span className="sc-boite-mystere__wagon est-trouve sc-boite-mystere__etape" style={rang(4)}>{m.bonne}</span>
    </div>
  );
}

/** Le calcul à l'envers d'une égalité à trou du CM1. */
function CalculEnvers({ m }) {
  const [a, total] = entiersDe(m.question);
  if (a === undefined || total === undefined) return null;
  const operation = m.consigne === 'multiplication' ? `${total} ÷ ${a} = ${m.bonne}` : `${total} − ${a} = ${m.bonne}`;
  return (
    <div className="sc-boite-mystere__preuve">
      <span className="sc-boite-mystere__etape" style={rang(1)}>{operation}</span>
      <span className="sc-boite-mystere__etape sc-boite-mystere__juste" style={rang(2)}>
        {String(m.question).replace(BOITE, String(m.bonne))}
        {' ✔'}
      </span>
    </div>
  );
}

/** Le CM1 : le coffre, l'enseigne de l'égalité ou du nombre pensé. */
function CoffreCM1({ m, termine }) {
  const pense = m.consigne === 'pense';
  return (
    <div className={`sc-boite-mystere sc-boite-mystere--coffre${termine ? ' est-termine' : ''}`}>
      <Coffre ouvert={termine} valeur={m.bonne} />
      <div className="sc-boite-mystere__enseigne">
        {pense
          ? <p className="sc-boite-mystere__pense">{m.question}</p>
          : <Egalite texte={m.question} />}
        {pense && <Machine m={m} termine={termine} />}
        {termine && !pense && <CalculEnvers m={m} />}
      </div>
    </div>
  );
}

/** La balance du CM2 : a + b à gauche, ▢ + c à droite, toujours à l'équilibre. */
function Balance({ m, termine }) {
  const [a, b, c] = entiersDe(m.question);
  const gauche = (a ?? 0) + (b ?? 0);
  return (
    <div className="sc-boite-mystere__balance">
      <svg viewBox="0 0 320 176" aria-hidden="true" focusable="false">
        <path d="M150 168 L170 168 L164 52 L156 52 Z" className="sc-boite-mystere__pied" />
        <rect x="120" y="164" width="80" height="10" rx="4" className="sc-boite-mystere__pied" />
        <g className={`sc-boite-mystere__fleau${termine ? ' est-pose' : ''}`}>
          <rect x="34" y="44" width="252" height="8" rx="4" className="sc-boite-mystere__poutre" />
          <circle cx="160" cy="48" r="9" className="sc-boite-mystere__pivot" />
          <path d="M60 52 L36 118 M60 52 L84 118 M260 52 L236 118 M260 52 L284 118" className="sc-boite-mystere__fil" />
          <path d="M26 118 Q60 140 94 118 Z" className="sc-boite-mystere__plateau" />
          <path d="M226 118 Q260 140 294 118 Z" className="sc-boite-mystere__plateau" />
          <rect x="34" y="92" width="24" height="26" rx="4" className="sc-boite-mystere__bloc" />
          <rect x="62" y="98" width="24" height="20" rx="4" className="sc-boite-mystere__bloc sc-boite-mystere__bloc--b" />
          <text x="46" y="110" className="sc-boite-mystere__chiffre">{a}</text>
          <text x="74" y="113" className="sc-boite-mystere__chiffre">{b}</text>
          <rect x="232" y="90" width="26" height="28" rx="4" className={`sc-boite-mystere__bloc-mystere${termine ? ' est-ouvert' : ''}`} />
          <text x="245" y="110" className={`sc-boite-mystere__chiffre${termine ? '' : ' sc-boite-mystere__chiffre--mystere'}`}>
            {termine ? m.bonne : '?'}
          </text>
          <rect x="262" y="98" width="24" height="20" rx="4" className="sc-boite-mystere__bloc sc-boite-mystere__bloc--b" />
          <text x="274" y="113" className="sc-boite-mystere__chiffre">{c}</text>
        </g>
        <path d="M160 20 l-7 -12 h14 z" className="sc-boite-mystere__aiguille" />
      </svg>
      {termine && (
        <div className="sc-boite-mystere__preuve">
          <span className="sc-boite-mystere__etape" style={rang(1)}>{`À gauche : ${a} + ${b} = ${gauche}`}</span>
          <span className="sc-boite-mystere__etape" style={rang(2)}>{`À droite, il manque : ${gauche} − ${c} = ${m.bonne}`}</span>
          <span className="sc-boite-mystere__etape sc-boite-mystere__juste" style={rang(3)}>{`${gauche} = ${m.bonne} + ${c} ✔`}</span>
        </div>
      )}
    </div>
  );
}

/** Le calcul qui suit le schéma : retirer l'écart, puis partager ; ou compter les parts. */
function CalculSchema({ m }) {
  const s = m.schema;
  if (s.sorte === 'plus') {
    const reste = s.total - s.ecart;
    return (
      <div className="sc-boite-mystere__preuve">
        <span className="sc-boite-mystere__etape" style={rang(3)}>{`On retire l'écart : ${s.total} − ${s.ecart} = ${reste}`}</span>
        <span className="sc-boite-mystere__etape sc-boite-mystere__juste" style={rang(4)}>{`Deux parts égales : ${reste} ÷ 2 = ${m.bonne}`}</span>
      </div>
    );
  }
  const parts = s.fois + 1;
  return (
    <div className="sc-boite-mystere__preuve">
      <span className="sc-boite-mystere__etape" style={rang(3)}>{`${s.fois} parts + 1 part = ${parts} parts égales`}</span>
      <span className="sc-boite-mystere__etape sc-boite-mystere__juste" style={rang(4)}>{`${s.total} € ÷ ${parts} = ${m.bonne} €`}</span>
    </div>
  );
}

/** Le CM2 : le panneau holographique — la balance, ou le problème et son schéma. */
function PanneauCM2({ m, termine }) {
  return (
    <div className={`sc-boite-mystere sc-boite-mystere--holo${termine ? ' est-termine' : ''}`}>
      <span className="sc-boite-mystere__etincelles" aria-hidden="true">
        {rangee(6).map((i) => <i key={i} style={rang(i)} />)}
      </span>
      {m.schema ? (
        <>
          <p className="texte-a-lire">{m.question}</p>
          <Schema schema={m.schema} valeur={termine ? m.bonne : null} />
          {termine && <CalculSchema m={m} />}
        </>
      ) : (
        <>
          <div className="sc-boite-mystere__enseigne sc-boite-mystere__enseigne--holo">
            <Egalite texte={m.question} />
          </div>
          {m.consigne === 'balance' && <Balance m={m} termine={termine} />}
        </>
      )}
    </div>
  );
}

const DU_CM2 = ['balance', 'plus', 'fois'];

export function QuestionMystere({ m, termine }) {
  if (m.schema || DU_CM2.includes(m.consigne)) return <PanneauCM2 m={m} termine={termine} />;
  return <CoffreCM1 m={m} termine={termine} />;
}

/**
 * LES RÉPONSES : des clés au CM1 (on essaie la clé dans la serrure), des poids
 * pour la balance, des barres lumineuses pour le schéma.
 */
export function ReponsesMystere({ m, choix, fautes, choisir }) {
  const sorte = m.consigne === 'balance' ? 'poids' : (m.schema || DU_CM2.includes(m.consigne) ? 'barre' : 'cle');
  const titre = { cle: 'Essaie une clé', poids: 'Pose un poids sur le plateau', barre: 'Choisis ta barre' }[sorte];
  return (
    <ul className={`sc-boite-mystere__reponses sc-boite-mystere__reponses--${sorte}`} aria-label={titre}>
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`sc-boite-mystere__${sorte}${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className="sc-boite-mystere__valeur">{libelle}</span>
              {sorte === 'cle' && (
                <span className="sc-boite-mystere__tige" aria-hidden="true">
                  <i />
                  <i />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const SCENE_MYSTERE = {
  rendreQuestion: (m, termine) => <QuestionMystere m={m} termine={termine} />,
  // Le coffre ouvert, la balance ou le schéma rempli montrent la réponse.
  rendreApres: () => null,
  rendreLesChoix: (props) => <ReponsesMystere {...props} />,
};
