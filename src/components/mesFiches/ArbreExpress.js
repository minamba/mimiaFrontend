import { useRef } from 'react';
import TexteFiche from './TexteFiche';
import useTraits from './useTraits';
import { couleurFamille } from '../../lib/mesFiches/typesFiches';
import { texteNu } from '../../lib/mesFiches/texteFiche';

/**
 * LA FICHE EXPRESS : L'ESSENTIEL SUR UNE PAGE, EN ARBRE — d'après le modèle
 * de Camara (14/10/2026) : le thème à gauche, ses familles au milieu, les
 * mots-clés à droite, chaque famille dans sa couleur, reliées par des
 * branches courbes.
 *
 * DES MOTS-CLÉS, PAS DE DÉFINITIONS : c'est ce qui la distingue de la fiche
 * visuelle, et ce qui la fait tenir sur une page.
 *
 * Sur téléphone, trois colonnes ne tiennent pas : l'arbre se déplie de haut
 * en bas, les familles l'une sous l'autre, les mots-clés en étiquettes, et
 * les traits disparaissent (la feuille de style s'en charge).
 */
export default function ArbreExpress({ bloc }) {
  const conteneur = useRef(null);
  const branches = bloc.branches ?? [];

  const liens = branches.flatMap((branche, i) => [
    { de: 'centre', a: `b${i}`, couleur: couleurFamille(i), forme: 'branche' },
    ...(branche.feuilles ?? []).map((_, j) => ({
      de: `b${i}`, a: `b${i}f${j}`, couleur: couleurFamille(i), forme: 'feuille',
    })),
  ]);

  const traits = useTraits(conteneur, liens);

  return (
    <div className="fdr-arbre" ref={conteneur} role="group" aria-label={`Arbre : ${texteNu(bloc.centre)}`}>
      <svg
        className="fdr-traits"
        width={traits.largeur}
        height={traits.hauteur}
        aria-hidden="true"
        focusable="false"
      >
        {traits.chemins.map((c) => (
          <path key={`${c.de}-${c.a}`} d={c.d} className={`fdr-trait fdr-c-${c.couleur}`} />
        ))}
      </svg>

      <p className="fdr-arbre__centre" data-ancre="centre">
        <TexteFiche texte={bloc.centre} />
      </p>

      <ul className="fdr-arbre__branches">
        {branches.map((branche, i) => (
          <li
            key={branche.titre}
            className={`fdr-arbre__groupe fdr-c-${couleurFamille(i)}`}
            aria-label={texteNu(branche.titre)}
          >
            <span className="fdr-arbre__branche" data-ancre={`b${i}`}>
              <TexteFiche texte={branche.titre} />
            </span>
            <ul className="fdr-arbre__feuilles">
              {(branche.feuilles ?? []).map((feuille, j) => (
                <li key={feuille} className="fdr-arbre__feuille" data-ancre={`b${i}f${j}`}>
                  <TexteFiche texte={feuille} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
