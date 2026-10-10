import { useId } from 'react';
import * as b from '../../../../lib/jeux/bouteilles';
import {
  Bulle, Fete, humeurDe, rangee, useDeroule,
} from './communs';
import './ce2-maths.css';

/**
 * LES BOUTEILLES (CE2) — 09/10/2026. La couverture : une fillette derrière un
 * comptoir de bois au bord d'un lac de montagne, une rangée de bouteilles de
 * verre étiquetées (25 cL, 33 cL, 50 cL, 75 cL, 1 L, 1,5 L), un tonneau à
 * robinet, un seau, une lampe suspendue, une ardoise. La scène :
 *   - LA QUESTION : l'ardoise du comptoir (la question écrite à la craie), les
 *     bouteilles dont elle parle posées à côté ; la lampe se balance, le
 *     robinet du tonneau goutte, le lac scintille ; Plouf, la goutte d'eau,
 *     mascotte du jeu, rebondit sur le comptoir ;
 *   - LES RÉPONSES : on PREND UNE BOUTEILLE SUR LE COMPTOIR — pour comparer,
 *     les trois récipients eux-mêmes (tous de la même taille : dessinés à leur
 *     contenance, ils donneraient la réponse) ; pour remplir, des verres ;
 *   - APRÈS LA RÉPONSE : on VERSE. Chaque litre devient « 100 cL » et
 *     s'ajoute ; la carafe se vide dans des bouteilles d'un litre ; la
 *     bouteille remplit les verres un à un ; à la comparaison, l'eau monte
 *     dans chaque récipient à sa vraie hauteur — le plus plein gagne.
 */

/**
 * UNE BOUTEILLE DESSINÉE, toujours de la même taille (le dessin d'origine).
 * Avec `niveau` (de 0 à 1), l'eau monte jusqu'à sa hauteur.
 */
export function Bouteille({ niveau = null, className = '' }) {
  const id = `sc-les-bouteilles-ce2-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const verre = 'M14 12 h12 v8 q10 6 10 18 v34 q0 6 -6 6 h-20 q-6 0 -6 -6 v-34 q0 -12 10 -18 z';
  return (
    <svg className={`bouteilles__dessin ${className}`} viewBox="0 0 40 80" aria-hidden="true" focusable="false">
      <rect x="15" y="2" width="10" height="10" rx="2" className="bouteilles__bouchon" />
      <path d={verre} className="bouteilles__verre" />
      {niveau === null ? (
        <path d="M6 44 h28 v28 q0 6 -6 6 h-16 q-6 0 -6 -6 z" className="bouteilles__eau" />
      ) : (
        <>
          <clipPath id={id}><path d={verre} /></clipPath>
          <rect
            x="0"
            y="20"
            width="40"
            height="58"
            clipPath={`url(#${id})`}
            className="bouteilles__eau sc-les-bouteilles-ce2__eau-monte"
            style={{ '--niveau': Math.max(0, Math.min(1, niveau)) }}
          />
        </>
      )}
    </svg>
  );
}

/** Un verre, vide ou plein. */
function Verre({ plein = false }) {
  return (
    <svg className={`sc-les-bouteilles-ce2__verre${plein ? ' est-plein' : ''}`} viewBox="0 0 30 40" aria-hidden="true" focusable="false">
      <path d="M3 3 h24 l-3 33 q0 2 -2 2 h-14 q-2 0 -2 -2 z" className="sc-les-bouteilles-ce2__paroi" />
      <path d="M5.5 14 h19 l-2.1 22 h-14.8 z" className="sc-les-bouteilles-ce2__boisson" />
    </svg>
  );
}

/** Plouf, la goutte d'eau : elle rebondit, éclabousse à la réussite, encourage à l'erreur. */
export function Goutte({ humeur }) {
  return (
    <div className={`sc-les-bouteilles-ce2__mascotte est-${humeur}`} aria-hidden="true">
      <Bulle humeur={humeur} />
      {humeur === 'fete' && <Fete couleurs={['#74c0fc', '#ffd43b', '#4dabf7', '#ffffff']} />}
      <svg className="sc-les-bouteilles-ce2__goutte" viewBox="0 0 70 90" focusable="false">
        <path d="M35 4 C46 24 64 40 64 58 a29 29 0 0 1 -58 0 C6 40 24 24 35 4 Z" fill="#4dabf7" stroke="#1971c2" strokeWidth="2.5" />
        <path d="M20 46 q4 -12 12 -20" fill="none" stroke="#d0ebff" strokeWidth="5" strokeLinecap="round" />
        <g className="sc-les-bouteilles-ce2__yeux">
          <ellipse cx="26" cy="58" rx="4" ry="5.5" fill="#1b1b2f" />
          <ellipse cx="44" cy="58" rx="4" ry="5.5" fill="#1b1b2f" />
          <circle cx="27.3" cy="56" r="1.5" fill="#fff" />
          <circle cx="45.3" cy="56" r="1.5" fill="#fff" />
        </g>
        <circle cx="18" cy="68" r="4" fill="#ffa8c5" opacity="0.8" />
        <circle cx="52" cy="68" r="4" fill="#ffa8c5" opacity="0.8" />
        <path d="M28 70 q7 7 14 0" fill="none" stroke="#1b1b2f" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Le décor : le lac, les montagnes, la poutre et sa vigne, la lampe, le tonneau qui goutte. */
function Decor() {
  return (
    <div className="sc-les-bouteilles-ce2__decor" aria-hidden="true">
      <span className="sc-les-bouteilles-ce2__montagnes" />
      <span className="sc-les-bouteilles-ce2__lac">
        {rangee(4).map((i) => <span key={i} className="sc-les-bouteilles-ce2__ride" style={{ '--n': i }} />)}
      </span>
      <span className="sc-les-bouteilles-ce2__poutre" />
      {rangee(6).map((i) => <span key={i} className="sc-les-bouteilles-ce2__feuille" style={{ '--n': i }} />)}
      <span className="sc-les-bouteilles-ce2__lampe" />
      <span className="sc-les-bouteilles-ce2__tonneau">
        <span className="sc-les-bouteilles-ce2__robinet" />
        <span className="sc-les-bouteilles-ce2__goutte-qui-tombe" />
      </span>
      <span className="sc-les-bouteilles-ce2__planche" />
    </div>
  );
}

/** Ce que dit la question de conversion : des litres vers les centilitres, ou l'inverse. */
export function lireConversion(question) {
  const q = String(question ?? '');
  let r = q.match(/^(\d+) L(?: (\d+) cL)? = \? cL$/);
  if (r) return { sorte: 'versCl', l: Number(r[1]), c: Number(r[2] ?? 0) };
  r = q.match(/^(\d+) cL = \? L$/);
  if (r && Number(r[1]) % 100 === 0) return { sorte: 'versL', cl: Number(r[1]) };
  return null;
}

/** Une bouteille posée, avec son étiquette. */
function Posee({ etiquette, niveau = null, petite = false, className = '' }) {
  return (
    <span className={`sc-les-bouteilles-ce2__posee${petite ? ' est-petite' : ''} ${className}`}>
      <Bouteille niveau={niveau} />
      <span className="sc-les-bouteilles-ce2__papier">{etiquette}</span>
    </span>
  );
}

/** L'ardoise du comptoir : la question, écrite à la craie (et sa réponse, une fois trouvée). */
function Ardoise({ m, termine, fini = true }) {
  return (
    <div className="sc-les-bouteilles-ce2__ardoise">
      <p className="bouteilles__question sc-les-bouteilles-ce2__craie">{m.question}</p>
      {termine && fini && (
        <p className="sc-les-bouteilles-ce2__reponse">
          {m.mode === 'remplir'
            ? `${m.bonne} verres de ${m.verre} cL remplissent ${b.ecrire(m.bouteille)}.`
            : m.question.replace('?', String(m.bonne))}
        </p>
      )}
    </div>
  );
}

/** Avant la réponse : les bouteilles dont parle la conversion, sans rien convertir. */
function BouteillesDeLaQuestion({ m }) {
  if (m.mode === 'remplir') {
    return (
      <div className="sc-les-bouteilles-ce2__etagere">
        <Posee etiquette={b.ecrire(m.bouteille)} />
        <span className="sc-les-bouteilles-ce2__verre-modele">
          <Verre />
          <span className="sc-les-bouteilles-ce2__papier">{`${m.verre} cL`}</span>
        </span>
      </div>
    );
  }
  const lu = lireConversion(m.question);
  if (!lu) return null;
  if (lu.sorte === 'versL') {
    return <div className="sc-les-bouteilles-ce2__etagere"><Posee etiquette={`${lu.cl} cL`} className="est-carafe" /></div>;
  }
  return (
    <div className="sc-les-bouteilles-ce2__etagere">
      {rangee(lu.l).map((i) => <Posee key={i} etiquette="1 L" />)}
      {lu.c > 0 && <Posee etiquette={`${lu.c} cL`} petite />}
    </div>
  );
}

/** APRÈS : chaque litre devient cent centilitres, et tout s'ajoute. */
function VersCentilitres({ m, lu }) {
  const n = lu.l + (lu.c > 0 ? 1 : 0);
  const pas = useDeroule(n, 800, 450);
  const termes = [...rangee(lu.l).map(() => '100'), ...(lu.c > 0 ? [String(lu.c)] : [])];
  return (
    <>
      <div className="sc-les-bouteilles-ce2__etagere">
        {rangee(lu.l).map((i) => (
          <Posee key={i} etiquette={pas > i ? '100 cL' : '1 L'} niveau={0.85} className={pas > i ? 'est-converti' : ''} />
        ))}
        {lu.c > 0 && <Posee etiquette={`${lu.c} cL`} niveau={lu.c / 100} petite className={pas >= n ? 'est-converti' : ''} />}
      </div>
      <p className={`sc-les-bouteilles-ce2__somme${pas >= n ? ' est-fini' : ''}`}>
        {pas >= n ? `${termes.join(' + ')} = ${m.bonne} cL` : `${termes.slice(0, pas).join(' + ') || '1 L = 100 cL'} …`}
      </p>
    </>
  );
}

/** APRÈS : la carafe se vide dans des bouteilles d'un litre. */
function VersLitres({ m, lu }) {
  const n = lu.cl / 100;
  const pas = useDeroule(n, 800, 450);
  return (
    <>
      <div className="sc-les-bouteilles-ce2__etagere">
        <Posee etiquette={`${lu.cl} cL`} niveau={(n - pas) / n * 0.9 + 0.02} className="est-carafe" />
        <span className="sc-les-bouteilles-ce2__versement" aria-hidden="true">➜</span>
        {rangee(pas).map((i) => <Posee key={i} etiquette="1 L" niveau={0.85} className="est-converti" />)}
      </div>
      <p className={`sc-les-bouteilles-ce2__somme${pas >= n ? ' est-fini' : ''}`}>
        {pas >= n ? `${lu.cl} cL = ${n} fois 100 cL = ${m.bonne} L` : '100 cL = 1 L …'}
      </p>
    </>
  );
}

/** APRÈS : la bouteille remplit les verres un à un. */
function Remplissage({ m }) {
  const n = m.bonne;
  const pas = useDeroule(n, 700, 450);
  return (
    <>
      <div className="sc-les-bouteilles-ce2__etagere">
        <Posee etiquette={b.ecrire(m.bouteille)} niveau={((n - pas) / n) * 0.85} />
        <span className="sc-les-bouteilles-ce2__versement" aria-hidden="true">➜</span>
        <span className="sc-les-bouteilles-ce2__verres">
          {rangee(n).map((i) => <Verre key={i} plein={pas > i} />)}
        </span>
      </div>
      <p className={`sc-les-bouteilles-ce2__somme${pas >= n ? ' est-fini' : ''}`}>
        {pas === 0 ? 'On verse…' : `${pas} verre${pas > 1 ? 's' : ''} de ${m.verre} cL`}
      </p>
    </>
  );
}

/** APRÈS LA COMPARAISON : l'eau monte dans chaque récipient à sa vraie hauteur. */
function Comparaison({ m }) {
  const max = Math.max(...m.recipients.map((r) => r.cl));
  return (
    <ul className="bouteilles__rangee sc-les-bouteilles-ce2__rangee">
      {m.recipients.map((r, i) => (
        <li key={r.nom} className={`bouteilles__recipient${r.nom === m.bonne ? ' est-bon' : ''}`} style={{ '--i': i }}>
          {r.nom === m.bonne && <span className="sc-les-bouteilles-ce2__ruban" aria-hidden="true">★</span>}
          <Bouteille niveau={(r.cl / max) * 0.92} />
          <span className="bouteilles__nom">{r.nom}</span>
          <span className="bouteilles__etiquette">{b.ecrire(r.cl)}</span>
          <span className="bouteilles__cl">= {r.cl} cL</span>
        </li>
      ))}
    </ul>
  );
}

function Apres({ m }) {
  if (m.mode === 'comparer') return <Comparaison m={m} />;
  if (m.mode === 'remplir' && Number.isInteger(m.bonne) && m.bonne > 0 && m.bonne <= 12) return <Remplissage m={m} />;
  const lu = lireConversion(m.question);
  if (lu?.sorte === 'versCl') return <VersCentilitres m={m} lu={lu} />;
  if (lu?.sorte === 'versL' && lu.cl / 100 <= 8) return <VersLitres m={m} lu={lu} />;
  return null;
}

/** LA QUESTION : le comptoir au bord du lac, l'ardoise, les bouteilles, et Plouf. */
export function QuestionBouteilles({ m, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  return (
    <div className={`sc-les-bouteilles-ce2 sc-les-bouteilles-ce2--${m.mode}${termine ? ' est-termine' : ''}`}>
      <Decor />
      <div className="sc-les-bouteilles-ce2__scene">
        {m.mode !== 'comparer' && <Ardoise m={m} termine={termine} />}
        {m.mode === 'comparer' && !termine && (
          <p className="sc-les-bouteilles-ce2__enseigne" aria-hidden="true">
            <Bouteille />
            <span>?</span>
            <Bouteille />
          </p>
        )}
        {termine ? <Apres m={m} /> : <BouteillesDeLaQuestion m={m} />}
      </div>
      <Goutte key={`${humeur}-${extra?.derniereFaute ?? ''}`} humeur={humeur} />
    </div>
  );
}

/**
 * LES RÉPONSES : on prend un récipient sur le comptoir. Chaque récipient est
 * un bouton à son libellé (à la comparaison, avec sa contenance écrite) ; un
 * récipient faux est barré, terni, et ne se prend plus.
 */
export function ChoixBouteilles({
  m, choix, fautes, choisir,
}) {
  const comparer = m.mode === 'comparer';
  return (
    <ul className={`sc-les-bouteilles-ce2__comptoir sc-les-bouteilles-ce2__comptoir--${m.mode}`} aria-label="Prends ta réponse sur le comptoir">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        const recipient = comparer ? m.recipients?.find((r) => r.nom === cle) : null;
        return (
          <li key={cle} style={{ '--i': i }}>
            <button type="button" className={`sc-les-bouteilles-ce2__prendre${fausse ? ' est-fausse' : ''}`} onClick={() => choisir(cle)} disabled={fausse}>
              {m.mode === 'remplir' ? <Verre plein /> : <Bouteille />}
              <span className="sc-les-bouteilles-ce2__libelle">{libelle}</span>
              {recipient && <span className="sc-les-bouteilles-ce2__contenance">{b.ecrire(recipient.cl)}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
