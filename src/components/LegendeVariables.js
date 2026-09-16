/**
 * Les variables qu'un template peut employer, sous forme de pastilles :
 * cliquer en insère une au curseur. Elles sont remplacées pour chaque
 * destinataire — `{{prenom}}` devient « Camille » dans l'aperçu, et le prénom
 * de chaque parent à l'envoi.
 */
export default function LegendeVariables({ variables, onInserer }) {
  if (!variables?.length) return null;

  return (
    <div className="variables-mail">
      {/* « C'EST IMPOSSIBLE DE LES REMPLIR MOI-MÊME » — Camara, le
          15/09/2026, devant `{{prenomEnfant}}` : il n'y a rien à remplir, et
          l'écran doit le dire. Ce sont des repères que le serveur remplace
          au moment de l'envoi, destinataire par destinataire. */}
      <span className="variables-mail__titre">
        <strong>Remplies automatiquement à l’envoi</strong>, pour chaque destinataire —
        rien à saisir. Laissez-les telles quelles dans l’objet ou le message ; cliquez
        pour en insérer une :
      </span>

      <ul className="variables-mail__liste">
        {variables.map((v) => (
          <li key={v.cle}>
            <button
              type="button"
              className="variables-mail__puce"
              onClick={() => onInserer(`{{${v.cle}}}`)}
              aria-label={`Insérer {{${v.cle}}} : ${v.description}`}
            >
              {`{{${v.cle}}}`}
            </button>
            <span className="variables-mail__description">{v.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
