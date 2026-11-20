/**
 * LA MENTION TVA SOUS LES PRIX (décision de Min's, 19/11/2026 : « partout »).
 *
 * mimia est en franchise en base de TVA : jamais « TTC » sur nos prix. La même
 * phrase, mot pour mot, que sous les formules de /tarifs, les CGV (art. 4) et
 * les mentions légales — écrite UNE fois ici pour l'accueil, le comparatif et
 * les achats de l'espace parent (heures, fiches, podcasts).
 *
 * Sobre exprès : une note sous les prix, pas un bandeau. Elle informe, elle ne
 * doit pas détourner l'œil du prix lui-même.
 */
export const TEXTE_MENTION_TVA = 'Prix nets en euros. TVA non applicable, art. 293 B du CGI.';

export default function MentionTva({ className = '' }) {
  return <p className={`mention-tva ${className}`.trim()}>{TEXTE_MENTION_TVA}</p>;
}
