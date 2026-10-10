import { Fragment, useMemo } from 'react';
import { Serpent } from '../UsinePython';
import { useDeroule } from './commun';
import { listesPasAPas } from './listesPasAPas';

/**
 * L'ÉTAL DES LISTES EN PYTHON (09/10/2026). La couverture : un marché au bord
 * de la Méditerranée, des étals couverts de céramiques bleues, des plateaux
 * alignés remplis de billes et de gemmes. Une liste, c'est un étal : des
 * plateaux en rang, chacun avec sa marchandise.
 *   - LA QUESTION : le programme sur l'ardoise du marchand, et le python
 *     (cousin de l'usine) enroulé dessus ; à côté, l'étal de départ quand le
 *     programme pose la liste telle quelle — ses valeurs, SANS numéros ;
 *   - LES RÉPONSES sont des carreaux de céramique bleue (`objets`) ;
 *   - APRÈS LA RÉPONSE, le marchand REJOUE le programme (`listesPasAPas`) :
 *     la ligne en cours s'allume, les plateaux arrivent (append), partent
 *     (pop, remove), changent (L[i] = …), le plateau lu brille, chaque plateau
 *     montre ses deux numéros (0, 1, 2… et −1, −2… depuis la fin), les
 *     compteurs montent dans leurs pots, l'affichage tombe à la fin — ou
 *     « IndexError » quand on tend la main au-delà du dernier plateau.
 */

const P = 'sc-listes-python';
const MOTS = /^(for|in|range|if|print|len|append|pop|remove)$/;

function Ligne({ texte }) {
  return texte.split(/(\b\w+\b)/).map((morceau, i) => {
    // eslint-disable-next-line react/no-array-index-key
    if (MOTS.test(morceau)) return <span key={i} className={`${P}__mot`}>{morceau}</span>;
    // eslint-disable-next-line react/no-array-index-key
    if (/^\d+$/.test(morceau)) return <span key={i} className={`${P}__nombre`}>{morceau}</span>;
    // eslint-disable-next-line react/no-array-index-key
    return <Fragment key={i}>{morceau}</Fragment>;
  });
}

/** L'ardoise : les numéros de ligne sont dessinés par le CSS (un compteur), pas écrits : le texte reste celui du programme. */
function Ardoise({ programme, allumee = null, erreur = false }) {
  const lignes = String(programme).split('\n');
  return (
    <div className={`${P}__ardoise`}>
      <pre className={`${P}__code`} aria-label="Le programme">
        {lignes.map((l, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__ligne${allumee === i ? ' est-allumee' : ''}${allumee === i && erreur ? ' est-en-erreur' : ''}`}>
            <Ligne texte={l} />
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}

/** Un étal : un plateau par élément ; les numéros (indices) seulement une fois la réponse donnée. */
function Etal({
  nom, valeurs, indices = false, regarde = null, erreur = false,
}) {
  return (
    <div className={`${P}__etal${erreur ? ' est-en-erreur' : ''}`}>
      <span className={`${P}__enseigne`}>{nom}</span>
      <ol className={`${P}__plateaux`} aria-label={`La liste ${nom}`}>
        {valeurs.length === 0 && <li className={`${P}__vide`}>vide</li>}
        {valeurs.map((v, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${i}-${v}`} className={`${P}__plateau${regarde === i ? ' est-regarde' : ''}`} style={{ '--i': i }}>
            <span className={`${P}__gemme`}>{v}</span>
            {indices && (
              <span className={`${P}__indices`}>
                <span>{i}</span>
                <span>{i - valeurs.length}</span>
              </span>
            )}
          </li>
        ))}
        {erreur && <li className={`${P}__plateau ${P}__plateau--absent`}>?</li>}
      </ol>
    </div>
  );
}

/** L'étal de départ : la liste posée telle quelle par la première ligne, s'il y en a une. */
function listeDeDepart(programme) {
  const r = String(programme).match(/^(\w+) = \[([\d,\s]*)\]$/m);
  if (!r) return null;
  return { nom: r[1], valeurs: r[2].trim() === '' ? [] : r[2].split(',').map((x) => Number(x.trim())) };
}

export function QuestionListes({ m, termine }) {
  // eslint-disable-next-line no-use-before-define
  if (termine) return <MarcheEnMarche m={m} />;
  const depart = listeDeDepart(m.question);
  return (
    <div className={P}>
      <div className={`${P}__marche`}>
        <div className={`${P}__poste`}>
          <Serpent />
          <Ardoise programme={m.question} />
        </div>
        {depart && depart.valeurs.length > 0 && <Etal {...depart} />}
      </div>
    </div>
  );
}

/** Après la réponse : le marchand rejoue le programme, plateau après plateau. */
export function MarcheEnMarche({ m }) {
  const { etapes, sorties } = useMemo(() => listesPasAPas(m.question), [m.question]);
  const cadence = Math.max(160, Math.min(800, Math.round(11000 / Math.max(etapes.length, 1))));
  const n = useDeroule(Math.max(etapes.length - 1, 0), cadence);
  if (etapes.length === 0) {
    return (
      <div className={P}>
        <div className={`${P}__poste`}>
          <Serpent />
          <Ardoise programme={m.question} />
        </div>
      </div>
    );
  }
  const etape = etapes[Math.min(n, etapes.length - 1)];
  const fini = n >= etapes.length - 1;
  const affichage = fini ? sorties : etape.sorties;
  const erreur = fini && etape.erreur;
  return (
    <div className={`${P} ${P}--en-marche`}>
      <div className={`${P}__marche`}>
        <div className={`${P}__poste`}>
          <Serpent />
          <Ardoise programme={m.question} allumee={fini && !erreur ? null : etape.ligne} erreur={erreur} />
        </div>
        <div className={`${P}__etals`}>
          {Object.entries(etape.listes).map(([nom, valeurs]) => (
            <Etal key={nom} nom={nom} valeurs={valeurs} indices regarde={etape.regarde?.liste === nom ? etape.regarde.indice : null} erreur={erreur} />
          ))}
          {Object.keys(etape.variables).length > 0 && (
            <ul className={`${P}__pots`} aria-label="Les variables">
              {Object.entries(etape.variables).map(([nom, v]) => (
                <li key={nom} className={`${P}__pot`}>
                  <strong key={String(v)}>{String(v)}</strong>
                  <span>{nom}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className={`${P}__ecran${fini ? ' est-fini' : ''}${erreur ? ' est-en-erreur' : ''}`} role="status">
        <span className={`${P}__ecran-titre`}>Affichage</span>
        <strong>{affichage.length ? affichage.join('  ') : '…'}</strong>
      </div>
    </div>
  );
}
