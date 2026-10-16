import { styleMatiere } from '../lib/couleurMatiere';
import Avatar from './Avatar';
import RapportOrientationCarte from './RapportOrientationCarte';
import Pagination, { usePage } from './Pagination';

/**
 * L'ORIENTATION SUR LA FICHE DE L'ENFANT — Camara, le 11/10/2026 : « dans la
 * fiche de l'élève, je sais quand il a fait cours, mais je n'ai pas de section
 * avec l'observation de la conseillère ».
 *
 * TROIS CHOSES, DANS UNE SEULE SECTION :
 *   - SON PROJET, noté par Maëlle avec son accord ; chacun de ses professeurs
 *     en reçoit la ligne de sa matière. Seule la conseillère le met à jour.
 *   - SES SÉANCES AVEC MAËLLE, une carte par séance : ce qui a été abordé et
 *     SON OBSERVATION POUR LE PARENT (son rapport de séance, sans note)…
 *   - … et, replié dessous, LE RAPPORT D'ORIENTATION adressé à l'enfant, quand
 *     il existe (les séances d'avant le 11/10/2026 n'en ont pas).
 *
 * Une observation et un rapport vont ensemble s'ils ont été écrits à moins de
 * dix minutes d'écart : ils naissent du même message de fin de séance. (Trois
 * heures avant le 12/10/2026 : une séance recevait le rapport de la précédente.)
 *
 * Rien quand il n'y a rien : le serveur n'envoie rien non plus quand la
 * conseillère est éteinte.
 */
const dateLongue = (valeur) => new Date(valeur).toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const dateCourte = (valeur) => new Date(valeur).toLocaleDateString('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric',
});

const MEME_SEANCE_MS = 10 * 60 * 1000;

/** Les séances, la plus récente d'abord : chaque observation avec son rapport, puis les rapports seuls. */
export function seancesOrientation(observations, rapports) {
  const restants = [...rapports];
  const seances = observations.map((o) => {
    const t = new Date(o.dateCreation).getTime();
    const i = restants.findIndex((r) => Math.abs(new Date(r.dateCreation).getTime() - t) < MEME_SEANCE_MS);
    const rapport = i >= 0 ? restants.splice(i, 1)[0] : null;
    return { cle: `o${o.id}`, date: o.dateCreation, observation: o, rapport };
  });

  restants.forEach((r) => seances.push({ cle: `r${r.id}`, date: r.dateCreation, observation: null, rapport: r }));

  return seances.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function ProjetOrientationFiche({
  projet, rapports = [], observations = [], children = null,
}) {
  const aUnProjet = Boolean(projet?.objectif);
  const seances = seancesOrientation(observations, rapports);
  // Dix séances par page (12/10/2026). Appelé avant tout retour : c'est un hook.
  const pageSeances = usePage(seances);
  if (!aUnProjet && seances.length === 0) return null;

  const lignes = projet?.matieres ?? [];

  return (
    <section id="fiche-orientation" className="fiche-orientation" aria-labelledby="fiche-orientation-titre">
      {/* Les raccourcis de la fiche, au-dessus du titre, quand elle les fournit. */}
      {children}
      <header className="fiche-orientation__entete">
        <span className="fiche-orientation__surtitre">À part des cours</span>
        <h3 id="fiche-orientation-titre">Orientation</h3>
        <p>
          Les séances avec Maëlle, la conseillère d’orientation : son projet, ses
          observations et les rapports écrits pour votre enfant.
        </p>
      </header>
      <div className="projet-orientation">
        <Avatar nom="maelle" taille={44} />
        <div className="projet-orientation__corps">
          {aUnProjet ? (
            <>
              <strong className="projet-orientation__but">
                <span aria-hidden="true">🎯 </span>
                {projet.objectif}
              </strong>
              <span className="projet-orientation__meta">
                Projet vu avec Maëlle, la conseillère d’orientation, le {dateCourte(projet.le)}.
                {lignes.length > 0 && ' Avec son accord, ses professeurs en tiennent compte :'}
              </span>
              {lignes.length > 0 && (
                <ul className="projet-orientation__lignes">
                  {lignes.map((l) => (
                    <li key={l.matiereId}>
                      <strong className="matiere-nom" style={styleMatiere({ matiereLibelle: l.matiereLibelle })}>
                        {l.matiereLibelle}
                      </strong>
                      {' '}— {l.texte}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <span className="projet-orientation__meta">
              Pas encore de projet noté : il se dessine au fil des séances avec Maëlle.
            </span>
          )}

          {seances.length > 0 && (
            <div className="projet-orientation__seances">
              <strong className="projet-orientation__sous-titre">
                Ses séances avec Maëlle ({seances.length})
              </strong>
              {pageSeances.visibles.map((s, i) => (
                <article key={s.cle} className="observation-orientation">
                  <p className="observation-orientation__date">{dateLongue(s.date)}</p>

                  {s.observation?.travaille && (
                    <p className="observation-orientation__aborde">
                      <span>Abordé :</span> {s.observation.travaille}
                    </p>
                  )}

                  {s.observation?.remarque && (
                    <blockquote className="observation-orientation__remarque">
                      <span className="observation-orientation__qui">L’observation de Maëlle</span>
                      {s.observation.remarque}
                    </blockquote>
                  )}

                  {s.rapport && (
                    <details open={i === 0 && !s.observation}>
                      <summary>Son rapport d’orientation</summary>
                      <RapportOrientationCarte rapport={s.rapport} titreNiveau={4} />
                    </details>
                  )}
                </article>
              ))}
              <Pagination
                page={pageSeances.page}
                pages={pageSeances.pages}
                onPage={pageSeances.allerA}
                etiquette="Pages des séances avec Maëlle"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
