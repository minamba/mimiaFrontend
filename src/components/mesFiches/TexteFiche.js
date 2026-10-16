import { decouperTexte } from '../../lib/mesFiches/texteFiche';

/**
 * Le texte d'une fiche, avec ses quatre marques (voir `texteFiche.js`).
 * Aucune chaîne n'est jamais injectée comme HTML : React l'échappe.
 *
 * Les morceaux d'un texte ne bougent jamais entre deux rendus : leur rang
 * est une clé stable.
 */
/* eslint-disable react/no-array-index-key */
function Morceaux({ morceaux }) {
  return morceaux.map((m, i) => {
    switch (m.type) {
      case 'gras':
        return <strong key={i}><Morceaux morceaux={m.morceaux} /></strong>;
      case 'italique':
        return <em key={i}><Morceaux morceaux={m.morceaux} /></em>;
      case 'fraction':
        return (
          <span key={i} className="fdr-fraction" role="math" aria-label={`${m.haut} sur ${m.bas}`}>
            <span className="fdr-fraction__haut" aria-hidden="true">{m.haut}</span>
            <span className="fdr-fraction__bas" aria-hidden="true">{m.bas}</span>
          </span>
        );
      case 'formule':
        return <span key={i} className="fdr-formule"><Morceaux morceaux={m.morceaux} /></span>;
      case 'blanc':
        return <span key={i} className="fdr-blanc">{m.texte}</span>;
      default:
        return <span key={i}>{m.texte}</span>;
    }
  });
}
/* eslint-enable react/no-array-index-key */

export default function TexteFiche({ texte }) {
  return <Morceaux morceaux={decouperTexte(texte)} />;
}
