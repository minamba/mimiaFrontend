import { useEffect, useState } from 'react';
import { classeQuestion } from '../base';

/**
 * LES PETITS OUTILS DES SCÈNES DU GROUPE « college-maths-b » (09/10/2026).
 * Rien ici ne porte de classe CSS à lui : chaque scène garde son préfixe
 * (`sc-<clé du jeu>`), et les outils le reçoivent quand ils dessinent.
 */

/** L'enfant a demandé moins de mouvement : on montre tout de suite la fin. */
export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * UNE EXPLICATION PAS À PAS : un compteur qui monte de 0 à `total`, un pas
 * toutes les `cadence` millisecondes, puis s'arrête (aucune minuterie qui
 * tourne pour rien). En mouvement réduit, on est tout de suite au bout.
 */
export function useEtapes(total, cadence = 900, depart = 350) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), n === 0 ? depart : cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence, depart]);
  return Math.min(n, total);
}

/**
 * LE TEXTE ENTIER DE LA QUESTION, toujours : c'est lui que l'enfant lit. On
 * garde les classes communes (retours à la ligne, code), et on ajoute celle de
 * la scène pour l'habiller.
 */
export function Enonce({ m, classe = '' }) {
  return <p className={`${classeQuestion(m.question)} ${classe}`}>{m.question}</p>;
}

/** « −3,5 » → −3.5 ; « 12 » → 12 ; NaN si ce n'est pas un nombre. */
export function nombre(texte) {
  const t = String(texte ?? '').trim().replace(/\s/g, '').replace(/[−–]/g, '-').replace(',', '.');
  if (!/^[-+]?\d+(\.\d+)?$/.test(t)) return NaN;
  return Number(t);
}

/** −3.5 → « −3,5 » : le signe moins typographique et la virgule. */
export function ecrire(x) {
  const r = Math.round(x * 1000) / 1000;
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
}

/** Tous les nombres d'un texte, dans l'ordre (« −3 », « 2,5 »…). */
export function nombresDe(texte) {
  return (String(texte ?? '').match(/[−-]?\d+(?:,\d+)?/g) ?? []).map(nombre);
}

/** Les propriétés d'un bouton-réponse : son clic, et « faux » une fois raté. */
export function proprietesChoix(cle, fautes, choisir) {
  const faux = fautes.includes(cle);
  return {
    type: 'button',
    onClick: () => choisir(cle),
    disabled: faux,
  };
}

/** Borne une valeur. */
export const borne = (x, a, b) => Math.max(a, Math.min(b, x));
