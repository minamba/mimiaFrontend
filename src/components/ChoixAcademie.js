/**
 * L'ACADÉMIE DE L'ENFANT, pour les vacances scolaires de « Mon calendrier ».
 *
 * UN PANNEAU, COMME L'ÉTABLISSEMENT ET LES BESOINS — Camara, le 11/10/2026 :
 * « améliore le design aussi du choix de l'académie ». Partagé par l'ajout d'un
 * enfant et sa modification, pour qu'ils ne dérivent pas.
 *
 * FACULTATIVE, VOLONTAIREMENT : sans elle, « Mon calendrier » affiche les
 * séances sans les périodes de vacances, jusqu'à ce qu'elle soit renseignée.
 *
 * `valeur` : l'identifiant choisi ('' si aucun) ; `onChange` reçoit la valeur brute.
 */
const METROPOLE = ['A', 'B', 'C'];

export default function ChoixAcademie({
  id, valeur, onChange, academies,
}) {
  const choisie = academies.find((a) => String(a.id) === String(valeur));

  return (
    <div className="panneau-choix panneau-choix--academie">
      <div className="panneau-choix__tete">
        <span className="panneau-choix__icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
          </svg>
        </span>
        <span className="panneau-choix__titres">
          <span className="panneau-choix__titre">
            Académie
            <span className="panneau-choix__etiquette">facultatif</span>
            {choisie && METROPOLE.includes(choisie.zone) && (
              <span className="academie__zone">Zone {choisie.zone}</span>
            )}
          </span>
          <span className="panneau-choix__sous-titre">
            Pour les vacances scolaires dans « Mon calendrier »
          </span>
        </span>
      </div>

      <div className="academie__liste">
        <select
          id={id}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Académie (facultatif)"
        >
          <option value="">Je ne sais pas / plus tard</option>
          <optgroup label="Zones A, B, C">
            {academies
              .filter((a) => METROPOLE.includes(a.zone))
              .map((a) => (
                <option key={a.id} value={a.id}>{a.libelle}</option>
              ))}
          </optgroup>
          <optgroup label="Corse et outre-mer">
            {academies
              .filter((a) => !METROPOLE.includes(a.zone))
              .map((a) => (
                <option key={a.id} value={a.id}>{a.libelle}</option>
              ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
}
