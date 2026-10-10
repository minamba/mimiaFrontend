import portraitSalim from '../../../../assets/profs/p_histoire_geo.png';

/**
 * CE QUE PARTAGENT LES DEUX JEUX DU « DÉTECTIVE DE L'HISTOIRE » (10/10/2026) :
 * Salim qui parle dans une bulle de manga, et le tampon qui frappe l'image.
 * Le portrait est celui de l'avatar du site (même fichier, déjà chargé).
 */

/** Salim et sa bulle. `ton` : 'neutre', 'bien' ou 'mal' (la couleur du bord). */
export function BulleSalim({ children, ton = 'neutre', className = '' }) {
  return (
    <div className={`hg-histoire-salim hg-histoire-salim--${ton} ${className}`}>
      <img className="hg-histoire-salim__portrait" src={portraitSalim} alt="" width="64" height="64" />
      <div className="hg-histoire-salim__bulle">
        <span className="hg-histoire-salim__nom">Salim</span>
        {children}
      </div>
    </div>
  );
}

/**
 * Le tampon qui tombe sur l'image : « ANACHRONISME », « VRAI », « MYTHE ».
 * `ou` : son centre, en pour cent ({ x, y }) — loin de l'intrus, qu'il ne doit
 * pas cacher ; au milieu par défaut.
 */
export function Tampon({ texte, couleur = 'rouge', ou = null, petit = false }) {
  return (
    <span
      className={`hg-histoire-tampon hg-histoire-tampon--${couleur}${petit ? ' hg-histoire-tampon--petit' : ''}`}
      style={ou ? { left: `${ou.x}%`, top: `${ou.y}%` } : undefined}
      aria-hidden="true"
    >
      <span className="hg-histoire-tampon__encre">{texte}</span>
    </span>
  );
}
