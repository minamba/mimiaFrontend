import { useState } from 'react';
import { avecVisuel, designer } from '../base';
import { PHRASES, REGISTRES } from '../../../../lib/jeux/college/quel-registre';
import { BoutonsReponses, libelleDe, premierPiege } from './commun';

/**
 * LA VILLE SOUS L'ORAGE — « Quel registre ? », 4e (09/10/2026). La
 * couverture : un garçon en manteau sombre sur des pavés mouillés, une ville
 * gothique, des réverbères, un ciel rouge déchiré d'éclairs.
 *   - LA QUESTION : l'extrait sur la page d'un vieux livre, éclairée par un
 *     réverbère ; au-dessus, la ville et ses flèches, la pluie qui tombe et
 *     l'éclair qui zèbre le ciel de temps en temps ;
 *   - LES RÉPONSES, pour un registre : LE CADRAN DES REGISTRES (`choix`) —
 *     une roue en demi-cercle dont l'aiguille suit la réponse qu'on vise (au
 *     survol, au clavier) ; on clique le registre pour le choisir. Pour les
 *     questions sur le doute et la nouvelle, des enseignes pendues aux
 *     réverbères ;
 *   - APRÈS LA RÉPONSE : le ciel de la ville prend la couleur du registre —
 *     des confettis pour le comique, l'éclair rouge du tragique, une pluie de
 *     larmes pour le pathétique, des cœurs et un soleil pour le lyrique, des
 *     yeux dans la brume pour le fantastique, une horloge sépia pour le
 *     réaliste, des étoiles pour le merveilleux.
 */

const P = 'sc-quel-registre';

/** La ville gothique, ses flèches, et l'éclair. */
function Ville({ registre }) {
  return (
    <div className={`${P}__ciel${registre ? ` ${P}__ciel--${registre}` : ''}`} aria-hidden="true">
      <svg className={`${P}__ville`} viewBox="0 0 800 80" preserveAspectRatio="xMidYMax slice" focusable="false">
        <path className={`${P}__eclair`} d="M560 0 l-12 26 h10 l-14 30 l26 -36 h-10 l12 -20 z" fill="#fff3c4" />
        {[0, 400].map((dx) => (
          <g key={dx} transform={`translate(${dx} 0)`}>
            <path d="M0 80 V52 h20 V40 l8 -14 l8 14 V52 h18 V30 l10 -22 l10 22 V52 h24 V44 h16 V58 h20 V24 l12 -24 l12 24 V58 h22 V38 l6 -10 l6 10 V60 h30 V46 h18 V30 l9 -18 l9 18 V62 h26 V48 h22 V36 l8 -16 l8 16 V64 h40 V80 Z" fill="#1a0f22" />
            {[38, 96, 176, 262, 330].map((x) => <rect key={x} className={`${P}__fenetre`} x={x} y="62" width="5" height="8" fill="#ffc96b" />)}
          </g>
        ))}
      </svg>
      <span className={`${P}__pluie`} />
      {registre && <span className={`${P}__humeur`} />}
    </div>
  );
}

/** Après : le registre (ou la bonne réponse) et la phrase qui explique. */
function Explication({ m }) {
  // Sur le doute, les phrases d'erreur parlent des mauvais choix : la règle vaut mieux.
  const regle = m.consigne === 'doute'
    ? PHRASES['doute-regle']
    : PHRASES[premierPiege(m)] ?? PHRASES[`${m.consigne}-regle`];
  return (
    <div className={`${P}__explication`} role="status">
      <strong className={`${P}__sceau`}>
        {m.consigne === 'registre' && <span className={`${P}__sceau-titre`}>Registre</span>}
        {libelleDe(m, m.bonne)}
      </strong>
      {regle && <p className={`${P}__regle`}>{regle}</p>}
    </div>
  );
}

export function QuestionRegistre({ m, termine }) {
  const registre = termine && m.consigne === 'registre' && REGISTRES[m.bonne] ? m.bonne : null;
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Ville registre={registre} />
      <div className={`${P}__rue`}>
        <span className={`${P}__reverbere`} aria-hidden="true" />
        <div className={`${P}__livre`}>
          <p className={`${P}__texte`}>{designer(m.question)}</p>
        </div>
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** L'angle de chaque réponse sur le cadran, en degrés depuis la verticale. */
const angles = (n) => (n <= 1 ? [0] : Array.from({ length: n }, (_, i) => -60 + (120 * i) / (n - 1)));

/** LE CADRAN DES REGISTRES : l'aiguille suit la réponse visée ; un clic la choisit. */
export function Cadran({ m, choix, fautes, choisir }) {
  const [vise, setVise] = useState(null);
  const a = angles(choix.length);
  return (
    <div className={`${P}__cadran`}>
      <svg className={`${P}__fond-cadran`} viewBox="0 0 200 104" aria-hidden="true" focusable="false">
        <path d="M6 100 A94 94 0 0 1 194 100 Z" fill="#2a1a30" stroke="#c9962b" strokeWidth="3" />
        <path d="M24 100 A76 76 0 0 1 176 100" fill="none" stroke="#5a3a4a" strokeWidth="2" strokeDasharray="2 6" />
        <g className={`${P}__aiguille${vise === null ? ' est-libre' : ''}`} style={{ '--a': `${vise ?? 0}deg` }}>
          <path d="M100 100 L96 96 L100 30 L104 96 Z" fill="#e5383b" />
        </g>
        <circle cx="100" cy="100" r="8" fill="#c9962b" />
      </svg>
      <ul className={`${P}__secteurs`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => {
          const fausse = fautes.includes(cle);
          return (
            <li key={cle} style={{ '--a': `${a[i]}deg`, '--i': i }}>
              <button
                type="button"
                className={`${P}__secteur ${P}__secteur--${cle}${fausse ? ' est-fausse' : ''}`}
                onClick={() => choisir(cle)}
                disabled={fausse}
                onMouseEnter={() => setVise(a[i])}
                onFocus={() => setVise(a[i])}
                onMouseLeave={() => setVise(null)}
                onBlur={() => setVise(null)}
              >
                <span className={`${P}__flamme`} aria-hidden="true" />
                {libelle}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Pour le doute et la nouvelle : des enseignes pendues aux réverbères. */
function Enseignes(props) {
  return (
    <BoutonsReponses
      prefixe={P}
      {...props}
      dessin={() => <span className={`${P}__potence`} />}
    />
  );
}

export function ChoixRegistre(props) {
  return props.m.consigne === 'registre' ? <Cadran {...props} /> : <Enseignes {...props} />;
}

const scene = {
  question: (m, termine) => <QuestionRegistre m={m} termine={termine} />,
  // Le sceau du registre montre déjà la bonne réponse.
  apres: () => null,
  choix: (props) => <ChoixRegistre {...props} />,
};

export default scene;
