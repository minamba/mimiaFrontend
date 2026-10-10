import { useEffect, useState } from 'react';

/**
 * LES BRIQUES COMMUNES DU GROUPE « COLLEGE-FRANCAIS-B » (09/10/2026) : treize
 * jeux de français du collège, chacun dans son univers (le jardin des
 * carillons, la crique, le théâtre, la cuisine, la cour d'Arthur…). Ici, rien
 * que de la mécanique partagée : aucune classe CSS, chaque jeu a les siennes,
 * préfixées `sc-<clé du jeu>`.
 */

/** Le mouvement réduit est-il demandé ? (jamais d'exception, même sans `matchMedia`) */
export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * UN COMPTE QUI MONTE, PAS À PAS : de 0 à `total`, un pas toutes les
 * `cadence` millisecondes — l'explication rejouée après la réponse. En
 * mouvement réduit, tout est là d'emblée. La minuterie s'arrête au dernier pas
 * et se nettoie quand la scène disparaît.
 */
export function usePas(total, cadence) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence]);
  return Math.min(n, total);
}

/** Les espaces normalisés : pour comparer deux textes sans s'occuper des retours à la ligne. */
export const normaliser = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();

/** Le libellé d'une clé de réponse (la clé elle-même à défaut). */
export const libelleDe = (m, cle) => m?.choix?.find((c) => c.cle === cle)?.libelle ?? String(cle ?? '');

/** La première phrase d'erreur d'une manche : celle d'un piège, qui explique la règle. */
export const premierPiege = (m) => Object.values(m?.pieges ?? {})[0] ?? null;

/**
 * UN MOT MIS EN LUMIÈRE DANS UNE PHRASE, sans rien changer au texte : la
 * phrase est découpée autour de la première occurrence du mot (sans tenir
 * compte des majuscules), et le mot enveloppé dans `<mark className>`. Le mot
 * introuvable : la phrase telle quelle.
 */
export function eclairer(phrase, mot, classe) {
  const texte = String(phrase ?? '');
  const cherche = String(mot ?? '');
  if (!cherche) return texte;
  const i = texte.toLowerCase().indexOf(cherche.toLowerCase());
  if (i < 0) return texte;
  return [
    texte.slice(0, i),
    <mark key="mot" className={classe}>{texte.slice(i, i + cherche.length)}</mark>,
    texte.slice(i + cherche.length),
  ];
}

/**
 * LA PHRASE SANS LE MOT : « Heureusement, personne n'a été blessé. » devient
 * « Personne n'a été blessé. ». Les guillemets sont ôtés, la virgule orpheline
 * aussi, et la majuscule rendue au début. Rien à enlever : `null`.
 */
export function sansLeMot(phrase, mot) {
  const texte = String(phrase ?? '').replace(/^«\s*/, '').replace(/\s*»$/, '');
  const i = texte.toLowerCase().indexOf(String(mot ?? '').toLowerCase());
  if (!mot || i < 0) return null;
  let reste = `${texte.slice(0, i)}${texte.slice(i + mot.length)}`
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/^\s*,\s*/, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .trim();
  if (!reste) return null;
  reste = reste[0].toUpperCase() + reste.slice(1);
  return reste;
}

/**
 * LES RÉPONSES JOUÉES AUTREMENT, la règle commune : chacune reste un vrai
 * bouton, nommé par son libellé, qui appelle `choisir(cle)` ; une réponse
 * fausse est désactivée, barrée et ternie (classe `est-fausse`). Le dessin
 * de chaque bouton vient du jeu (`dessin`), en `aria-hidden`.
 *   `glisser` : la réponse peut aussi se glisser (sa clé part dans le transfert).
 *   `deposer` : la réponse reçoit ce qu'on y dépose, et le dépôt vaut un clic.
 */
export function BoutonsReponses({
  prefixe, m, choix, fautes, choisir, dessin, classeListe = '', glisser = false, deposer = false,
}) {
  return (
    <ul className={`${prefixe}__reponses ${classeListe}`.trim()} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        const surDepot = deposer && !fausse ? {
          onDragOver: (e) => e.preventDefault(),
          onDrop: (e) => {
            e.preventDefault();
            choisir(cle);
          },
        } : {};
        const glissable = glisser && !fausse ? {
          draggable: true,
          onDragStart: (e) => {
            try {
              e.dataTransfer.setData('text/plain', String(cle));
            } catch {
              // Un navigateur sans transfert : le clic suffit.
            }
          },
        } : {};
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${prefixe}__reponse${fausse ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={fausse}
              {...surDepot}
              {...glissable}
            >
              {dessin ? <span className={`${prefixe}__dessin`} aria-hidden="true">{dessin({ cle, libelle, i, m, fausse })}</span> : null}
              <span className={`${prefixe}__libelle`}>{libelle}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Une zone de dépôt : ce qu'on y lâche (une clé de réponse) vaut un clic sur cette réponse. */
export function surDepot(choix, fautes, choisir) {
  return {
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault();
      let cle = '';
      try {
        cle = e.dataTransfer.getData('text/plain');
      } catch {
        cle = '';
      }
      const visee = choix.find((c) => String(c.cle) === cle);
      if (visee && !fautes.includes(visee.cle)) choisir(visee.cle);
    },
  };
}
