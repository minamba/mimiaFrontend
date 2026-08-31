/**
 * De quoi ranger un historique : une matière, et un sens pour la date.
 *
 * POURQUOI LA MATIÈRE EST UN FILTRE ET NON UN TRI
 * ---------------------------------------------
 * Trier deux cents lignes par matière les regroupe par ordre alphabétique :
 * pour arriver aux maths, le parent déroulerait l'anglais, puis le français,
 * puis l'histoire — dix lignes à la fois. Le filtre y va d'un clic, et la
 * question derrière « trier par matière » est toujours celle-là : comment va-t-il
 * dans CETTE matière-ci.
 *
 * POURQUOI ÇA REPART DE LA PREMIÈRE TRANCHE
 * ----------------------------------------
 * Le filtre et le sens portent sur l'historique ENTIER, pas sur les lignes
 * déjà chargées : filtrer sur place ne montrerait que les maths présentes
 * dans les dix dernières lignes, et afficherait « aucune » à un élève qui en
 * a trente. Chaque changement redemande donc la première tranche au serveur.
 *
 * POURQUOI LE SENS EST UN BOUTON ET NON DEUX
 * -----------------------------------------
 * Il n'y a que deux états et l'un est toujours vrai. Une bascule qui montre
 * celui du moment — « ↓ Du plus récent » — tient en un mot de plus qu'une
 * étiquette, là où deux boutons demandent de comparer lequel est enfoncé.
 */
export default function TriHistorique({ matieres, tri, onChange, chargement, nom }) {
  const parMatiere = (evenement) => {
    const choix = evenement.target.value;
    onChange({ ...tri, matiereId: choix === '' ? null : Number(choix) });
  };

  return (
    <div className="tri-histo">
      {/* Sur une seule matière, le sélecteur ne trierait rien. */}
      {matieres.length > 1 && (
        <label className="tri-histo__champ">
          <span className="tri-histo__intitule">Matière</span>
          <select
            value={tri.matiereId ?? ''}
            onChange={parMatiere}
            disabled={chargement}
          >
            <option value="">Toutes</option>
            {matieres.map((m) => (
              <option key={m.matiereId} value={m.matiereId}>
                {m.matiereLibelle}
              </option>
            ))}
          </select>
        </label>
      )}

      <button
        type="button"
        className="btn-ghost btn-ghost--mini"
        onClick={() => onChange({ ...tri, ancien: !tri.ancien })}
        disabled={chargement}
        aria-label={
          `${nom} : actuellement du plus ${tri.ancien ? 'ancien' : 'récent'}. `
          + 'Activer pour inverser.'
        }
      >
        <span aria-hidden="true">{tri.ancien ? '↑' : '↓'}</span>{' '}
        {tri.ancien ? 'Du plus ancien' : 'Du plus récent'}
      </button>
    </div>
  );
}
