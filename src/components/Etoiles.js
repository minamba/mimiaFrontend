/**
 * Une note en étoiles, en lecture ou en saisie.
 *
 * POURQUOI UN SEUL COMPOSANT POUR LES DEUX USAGES
 * ----------------------------------------------
 * La vitrine et le formulaire montrent la même chose : cinq étoiles dont
 * certaines sont pleines. Les écrire deux fois ferait diverger la demi-étoile,
 * la couleur ou l'ordre au premier ajustement — et l'écart se verrait sur la
 * même page, à deux centimètres d'intervalle.
 *
 * EN SAISIE, CE SONT DE VRAIS BOUTONS RADIO. Un rang de `<span>` cliquables
 * serait invisible au clavier et muet pour un lecteur d'écran, alors qu'un
 * groupe de radios se parcourt aux flèches et s'annonce tout seul. Les ronds
 * sont masqués, les étoiles servent d'étiquettes.
 */
export default function Etoiles({ note, taille = 'normale', saisie = false, onChange, nom = 'note' }) {
  const valeur = Number(note) || 0;

  if (!saisie) {
    return (
      <span
        className={`etoiles etoiles--${taille}`}
        role="img"
        aria-label={`${valeur} sur 5`}
      >
        {[1, 2, 3, 4, 5].map((rang) => (
          <span
            key={rang}
            aria-hidden="true"
            className={rang <= Math.round(valeur) ? 'etoile etoile--pleine' : 'etoile'}
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={`etoiles etoiles--${taille} etoiles--saisie`} role="radiogroup" aria-label="Votre note">
      {[1, 2, 3, 4, 5].map((rang) => (
        <label
          key={rang}
          className={rang <= valeur ? 'etoile etoile--pleine' : 'etoile'}
          title={`${rang} étoile${rang > 1 ? 's' : ''}`}
        >
          <input
            type="radio"
            name={nom}
            value={rang}
            checked={valeur === rang}
            onChange={() => onChange?.(rang)}
          />
          <span aria-hidden="true">★</span>
          <span className="visuellement-cache">
            {rang} étoile{rang > 1 ? 's' : ''}
          </span>
        </label>
      ))}
    </span>
  );
}
