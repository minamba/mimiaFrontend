/**
 * Un bloc de pièces jointes — images intégrées au message ou documents
 * téléchargeables — partagé par la diffusion et le message à un parent : les
 * deux composent le même genre de courriel, avec les mêmes pièces.
 *
 * `avecMarqueur` distingue les deux usages : une image se réfère depuis le
 * texte par `[image:N]` et propose donc « Insérer ici », un document se lit
 * en pièce jointe et n'a rien à faire dans le texte.
 */
export default function BlocPieces({
  titre, items, onAjouter, onRetirer, onInserer, accept, videTexte, avecMarqueur = false,
}) {
  return (
    <div className="diffusion__pieces">
      <div className="diffusion__pieces-entete">
        <strong>{titre}</strong>
        <label className="btn btn--compact btn--fantome">
          Ajouter {avecMarqueur ? 'des images' : 'des documents'}
          <input
            type="file"
            accept={accept}
            multiple
            hidden
            onChange={(e) => {
              onAjouter(Array.from(e.target.files ?? []));
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {items.length === 0 ? (
        <p className="diffusion__vide">{videTexte}</p>
      ) : (
        <ul className="diffusion__liste">
          {items.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              {avecMarqueur && <span className="diffusion__rang">[image:{i + 1}]</span>}
              <span className="diffusion__nom">
                {avecMarqueur ? '' : '📎 '}{f.name}
              </span>
              <span className="diffusion__poids">{Math.round(f.size / 1024)} Ko</span>

              {avecMarqueur && (
                <button
                  type="button"
                  className="btn-ghost btn-ghost--mini"
                  onClick={() => onInserer(i + 1)}
                >
                  Insérer ici
                </button>
              )}

              <button
                type="button"
                className="btn-ghost btn-ghost--mini btn-ghost--danger"
                onClick={() => onRetirer(i)}
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
