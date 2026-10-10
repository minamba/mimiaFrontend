import { avecVisuel, designer } from '../base';
import { PHRASES } from '../../../../lib/jeux/college/ce-qui-n-est-pas-dit';
import {
  BoutonsReponses, eclairer, libelleDe, premierPiege,
} from './commun';

/**
 * LA MAISON AUX PARAVENTS — « Ce qui n'est pas dit », 3e (09/10/2026). La
 * couverture : un garçon sur une véranda de bois, au crépuscule ; derrière
 * les paravents de papier, des ombres d'érable ; une lanterne de pierre au
 * jardin. Ce qui n'est pas dit, c'est ce qui se cache derrière le papier.
 *   - LA QUESTION : la réplique dans une bulle, devant un paravent où passe
 *     une ombre (on devine quelqu'un, on ne le voit pas) ; des feuilles
 *     d'érable tombent, la lanterne vacille ;
 *   - LES RÉPONSES (`choix`) : des panneaux de papier coulissants, chacun
 *     une lecture ; au survol, le panneau s'entrouvre ; un mauvais panneau
 *     se déchire ;
 *   - APRÈS LA RÉPONSE : le paravent s'ouvre sur une pièce éclairée où
 *     s'écrit ce qui n'était pas dit ; pour l'ironie, les mots et la
 *     situation face à face, avec « ≠ » ou « = » entre eux ; pour le petit
 *     mot, il s'allume à la lanterne.
 */

const P = 'sc-ce-qui-n-est-pas-dit';

/** La réplique entre guillemets, et la situation autour (« dit Léa à son frère, qui… »). */
function decouper(question) {
  const q = String(question ?? '');
  const citation = q.match(/«[^»]*»/)?.[0] ?? null;
  if (!citation) return null;
  const situation = q.replace(citation, '').replace(/^[\s,.]+/, '').trim();
  return { citation, situation };
}

/** Les feuilles d'érable qui tombent. */
function Erables() {
  return (
    <span className={`${P}__erables`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} className={`${P}__feuille`} style={{ '--n': i }} viewBox="0 0 20 20" focusable="false">
          <path d="M10 1 l2 5 l5 -2 l-2 5 l4 2 l-5 2 l1 5 l-5 -3 l-5 3 l1 -5 l-5 -2 l4 -2 l-2 -5 l5 2 z" fill={['#e0402a', '#f07a2a', '#c92a2a'][i % 3]} />
        </svg>
      ))}
    </span>
  );
}

function Explication({ m }) {
  // Pour l'ironie, la phrase d'erreur explique la bonne lecture ; ailleurs,
  // elle parlerait d'un mauvais choix : on lui préfère la règle.
  const regle = m.consigne === 'ironie'
    ? PHRASES[premierPiege(m)] ?? PHRASES['ironie-regle']
    : PHRASES[`${m.consigne}-regle`];
  if (m.consigne === 'ironie') {
    const d = decouper(m.question);
    const ironique = m.bonne === 'ironique';
    return (
      <div className={`${P}__explication`} role="status">
        {d && (
          <div className={`${P}__face-a-face`}>
            <p className={`${P}__volet`}>
              <span className={`${P}__titre`}>Les mots disent</span>
              {d.citation}
            </p>
            <strong className={`${P}__signe${ironique ? ' est-contraire' : ''}`} aria-hidden="true">{ironique ? '≠' : '='}</strong>
            <p className={`${P}__volet`}>
              <span className={`${P}__titre`}>La situation montre</span>
              {d.situation}
            </p>
          </div>
        )}
        <strong className={`${P}__verdict`}>{libelleDe(m, m.bonne)}</strong>
        {regle && <p className={`${P}__regle`}>{regle}</p>}
      </div>
    );
  }
  if (m.consigne === 'mot-qui-sous-entend') {
    return (
      <div className={`${P}__explication`} role="status">
        <p className={`${P}__lanterne`}>{eclairer(m.question, m.bonne, `${P}__lueur`)}</p>
        {regle && <p className={`${P}__regle`}>{regle}</p>}
      </div>
    );
  }
  return (
    <div className={`${P}__explication`} role="status">
      <div className={`${P}__piece`}>
        <span className={`${P}__battant ${P}__battant--gauche`} aria-hidden="true" />
        <p className={`${P}__secret`}>
          <span className={`${P}__titre`}>Ce qui n’est pas dit</span>
          {m.bonne}
        </p>
        <span className={`${P}__battant ${P}__battant--droite`} aria-hidden="true" />
      </div>
      {regle && <p className={`${P}__regle`}>{regle}</p>}
    </div>
  );
}

export function QuestionNonDit({ m, termine }) {
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <Erables />
      <div className={`${P}__veranda`}>
        <span className={`${P}__shoji`} aria-hidden="true">
          <span className={`${P}__ombre`} />
        </span>
        <div className={`${P}__bulle`}>
          <p className={`${P}__texte`}>{designer(m.question)}</p>
        </div>
        <span className={`${P}__lanterne-pierre`} aria-hidden="true" />
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** Les réponses : des panneaux de papier coulissants. */
export function ChoixShoji({ m, choix, fautes, choisir }) {
  return (
    <BoutonsReponses
      prefixe={P}
      m={m}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      classeListe={m.consigne === 'ironie' ? `${P}__paire` : ''}
      dessin={() => <span className={`${P}__croisillons`} />}
    />
  );
}

const scene = {
  question: (m, termine) => <QuestionNonDit m={m} termine={termine} />,
  // La pièce éclairée, le face-à-face ou le mot allumé montrent la bonne réponse.
  apres: () => null,
  choix: (props) => <ChoixShoji {...props} />,
};

export default scene;
