import { Fragment, useEffect, useState } from 'react';
import { designer } from '../base';

/**
 * LES BRIQUES COMMUNES DES SCÈNES DU FRANÇAIS AU LYCÉE (09/10/2026). Chaque
 * jeu a son univers (sa serre, ses cloches, son alambic…) ; ce fichier ne
 * porte que ce qui ne se voit pas : le déroulé d'une explication animée, les
 * boutons-réponses d'une mécanique propre, le découpage d'une question en
 * lignes. Toutes les classes sont celles du jeu qui appelle (`p`, préfixé
 * `sc-<cle>`) : aucun style n'est partagé en douce.
 */

/** Le réglage « réduire les animations » : l'explication s'affiche alors d'un coup. */
export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * UN DÉROULÉ PAS À PAS (comme l'usine Python) : de 0 à `total`, un pas toutes
 * les `cadence` millisecondes, puis on s'arrête — aucune minuterie sans fin.
 * Animations réduites : tout de suite au dernier pas.
 */
export function useDeroule(total, cadence = 650, actif = true) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (!actif || n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence, actif]);
  return actif ? Math.min(n, total) : 0;
}

/** Les espaces normalisés : pour comparer deux textes sans s'occuper des retours à la ligne. */
export const normal = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** Les lignes d'une question, sans les lignes vides (elles ne séparent que des blocs). */
export const lignesDe = (texte) => String(texte ?? '').split('\n');

/**
 * UNE QUESTION RENDUE LIGNE À LIGNE : chaque ligne dans son élément, et le
 * retour à la ligne gardé entre deux (le texte entier reste lisible, et
 * identique à celui du module). `rendreLigne(ligne, i)` habille une ligne ;
 * par défaut, le mot désigné entre crochets est souligné.
 */
export function Lignes({ texte, className, classeLigne, rendreLigne = (l) => designer(l) }) {
  const lignes = lignesDe(texte);
  return (
    <div className={className}>
      {lignes.map((l, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          {l.trim() === ''
            ? <span className={`${classeLigne}--vide`} aria-hidden="true" />
            : <span className={classeLigne}>{rendreLigne(l, i)}</span>}
          {i < lignes.length - 1 ? '\n' : null}
        </Fragment>
      ))}
    </div>
  );
}

/**
 * DES RÉPONSES JOUÉES AUTREMENT (cloches, carillon, feuilles qui tombent…) :
 * chaque réponse reste un VRAI bouton dont le nom est son libellé, qui
 * appelle `choisir(cle)` et se grise, barré, une fois écarté. `deco(c, i)`
 * dessine l'objet autour du libellé (décor seulement, sans texte).
 */
export function BoutonsChoix({
  p, choix, fautes, choisir, deco = () => null, etiquette = 'Choisis ta réponse', classeListe = '',
}) {
  return (
    <ul className={`${p}__choix ${classeListe}`} aria-label={etiquette}>
      {choix.map((c, i) => {
        const faux = fautes.includes(c.cle);
        return (
          <li key={c.cle} className={`${p}__case`} style={{ '--i': i, '--n': choix.length }}>
            <button
              type="button"
              className={`${p}__bouton${faux ? ` ${p}__bouton--faux` : ''}`}
              onClick={() => choisir(c.cle)}
              disabled={faux}
            >
              {deco(c, i, faux)}
              <span className={`${p}__libelle`}>{c.libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Le libellé de la bonne réponse, tel que le bouton l'affichait. */
export const libelleBon = (m) => m.choix.find((c) => String(c.cle) === String(m.bonne))?.libelle ?? String(m.bonne);

/**
 * SURLIGNER DES MORCEAUX D'UNE PHRASE, une fois la réponse donnée : chaque
 * morceau trouvé dans le texte est enveloppé (`classe(role)`), le reste du
 * texte est rendu tel quel — le texte entier reste identique. Un morceau
 * introuvable est simplement ignoré : jamais d'exception.
 * `morceaux` : [[texte, role], …], cherchés dans l'ordre.
 */
export function surligner(texte, morceaux, classe) {
  const t = String(texte ?? '');
  const zones = [];
  let depart = 0;
  morceaux.forEach(([bout, role]) => {
    if (!bout) return;
    let i = t.indexOf(bout, depart);
    if (i < 0) i = t.indexOf(bout);
    if (i < 0) return;
    if (zones.some((z) => i < z.fin && i + bout.length > z.debut)) return;
    zones.push({ debut: i, fin: i + bout.length, role });
    depart = i + bout.length;
  });
  zones.sort((a, b) => a.debut - b.debut);
  const sortie = [];
  let k = 0;
  zones.forEach((z, n) => {
    if (z.debut > k) sortie.push(t.slice(k, z.debut));
    sortie.push(
      // eslint-disable-next-line react/no-array-index-key
      <mark key={`z${n}`} className={classe(z.role)} style={{ '--k': n }}>{t.slice(z.debut, z.fin)}</mark>,
    );
    k = z.fin;
  });
  if (k < t.length) sortie.push(t.slice(k));
  return sortie;
}
