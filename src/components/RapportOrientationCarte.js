/**
 * UN RAPPORT D'ORIENTATION, tel que Maëlle l'a écrit à la fin d'une séance
 * (11/10/2026) — adressé à l'élève. Partagé par sa page « Rapports
 * d'orientation » et par la fiche du parent : les deux lisent la même chose.
 *
 * Chaque rubrique est facultative : la conseillère n'écrit que ce qui a eu
 * lieu. Les listes (pistes, étapes) arrivent séparées par « ; ».
 */
export const dateLongue = (valeur) => new Date(valeur).toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const enListe = (texte) => (texte ?? '')
  .split(/\s*;\s*|\n/)
  .map((t) => t.trim())
  .filter(Boolean);

function Rubrique({ titre, icone, children }) {
  return (
    <section className="rapport-orientation__rubrique">
      <h3>
        <span aria-hidden="true">{icone} </span>
        {titre}
      </h3>
      {children}
    </section>
  );
}

export default function RapportOrientationCarte({ rapport, nouveau = false, titreNiveau = 2 }) {
  const Titre = `h${titreNiveau}`;
  const pistes = enListe(rapport.pistes);
  const etapes = enListe(rapport.etapes);

  return (
    <article className={`rapport-orientation${nouveau ? ' rapport-orientation--nouveau' : ''}`}>
      <header className="rapport-orientation__entete">
        <Titre className="rapport-orientation__date">{dateLongue(rapport.dateCreation)}</Titre>
        {nouveau && <span className="rapport-orientation__nouveau">Nouveau</span>}
      </header>

      {rapport.discussion && (
        <Rubrique titre="Ce qu’on s’est dit" icone="💬">
          <p>{rapport.discussion}</p>
        </Rubrique>
      )}

      {pistes.length > 0 && (
        <Rubrique titre="Tes pistes" icone="🧭">
          <ul className="rapport-orientation__pistes">
            {pistes.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </Rubrique>
      )}

      {rapport.chemin && (
        <Rubrique titre="Ton chemin" icone="🗺️">
          <pre className="rapport-orientation__chemin">{rapport.chemin}</pre>
        </Rubrique>
      )}

      {(rapport.atouts || rapport.aConsolider) && (
        <div className="rapport-orientation__duo">
          {rapport.atouts && (
            <Rubrique titre="Tes atouts" icone="💪">
              <p>{rapport.atouts}</p>
            </Rubrique>
          )}
          {rapport.aConsolider && (
            <Rubrique titre="À consolider" icone="🎯">
              <p>{rapport.aConsolider}</p>
            </Rubrique>
          )}
        </div>
      )}

      {etapes.length > 0 && (
        <Rubrique titre="Tes prochaines étapes" icone="✅">
          <ol className="rapport-orientation__etapes">
            {etapes.map((e) => <li key={e}>{e}</li>)}
          </ol>
        </Rubrique>
      )}
    </article>
  );
}
