import { useMemo, useState } from 'react';
import { styleMatiere } from '../lib/couleurMatiere';

/**
 * Progression d'un enfant dans une matière.
 *
 * Deux graphiques et non un seul, parce qu'ils ne répondent pas à la même
 * question. Les notes disent l'évolution dans le temps ; les notions disent où
 * en est la maîtrise aujourd'hui. Une note sur 20 et une probabilité de
 * maîtrise ne se comparent pas — les poser sur un même axe serait faux.
 */

/** Géométrie de la courbe, en unités du viewBox. */
const L = { largeur: 320, hauteur: 150, gauche: 26, droite: 8, haut: 10, bas: 24 };

const dateCourte = (valeur) =>
  new Date(valeur).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const noteLisible = (note) => note.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

/**
 * Courbe des notes.
 *
 * Les points sont espacés régulièrement plutôt que placés à leur date réelle :
 * trois évaluations dont deux le même jour se chevaucheraient jusqu'à devenir
 * illisibles. L'axe dit l'ordre, pas la durée — et la légende le précise.
 */
function CourbeNotes({ notes, couleur }) {
  const [survole, setSurvole] = useState(null);

  const points = useMemo(() => {
    const utile = L.largeur - L.gauche - L.droite;
    const hauteurUtile = L.hauteur - L.haut - L.bas;

    return notes.map((note, index) => ({
      ...note,
      x: notes.length === 1
        ? L.gauche + utile / 2
        : L.gauche + (index / (notes.length - 1)) * utile,
      y: L.haut + (1 - note.note / 20) * hauteurUtile,
    }));
  }, [notes]);

  const chemin = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const detail = survole ?? points[points.length - 1];

  return (
    <div className="courbe">
      <svg
        className="courbe__svg"
        viewBox={`0 0 ${L.largeur} ${L.hauteur}`}
        role="img"
        aria-label={`Notes : ${points.map((p) => `${noteLisible(p.note)} sur 20`).join(', ')}`}
      >
        {/* Repères à 0, 10 et 20 : la moyenne se lit sans compter les
            graduations. Volontairement discrets, ils situent, ils ne décorent pas. */}
        {[0, 10, 20].map((valeur) => {
          const y = L.haut + (1 - valeur / 20) * (L.hauteur - L.haut - L.bas);
          return (
            <g key={valeur}>
              <line
                className={`courbe__grille ${valeur === 10 ? 'courbe__grille--moyenne' : ''}`}
                x1={L.gauche}
                y1={y}
                x2={L.largeur - L.droite}
                y2={y}
              />
              <text className="courbe__graduation" x={L.gauche - 6} y={y + 3.5} textAnchor="end">
                {valeur}
              </text>
            </g>
          );
        })}

        {points.length > 1 && (
          <path className="courbe__trait" d={chemin} style={{ stroke: couleur }} />
        )}

        {points.map((point, index) => (
          <g key={index}>
            <circle
              className={`courbe__point ${detail === point ? 'courbe__point--actif' : ''}`}
              cx={point.x}
              cy={point.y}
              r={detail === point ? 5 : 4}
              style={{ fill: couleur }}
            />

            {/* Cible de survol plus large que le point : viser un disque de
                quatre unités à la souris est impossible. */}
            <circle
              className="courbe__cible"
              cx={point.x}
              cy={point.y}
              r={14}
              onMouseEnter={() => setSurvole(point)}
              onMouseLeave={() => setSurvole(null)}
            >
              <title>
                {noteLisible(point.note)}/20 — {point.notion ?? 'évaluation'} le{' '}
                {dateCourte(point.date)}
              </title>
            </circle>

            <text className="courbe__date" x={point.x} y={L.hauteur - 7} textAnchor="middle">
              {dateCourte(point.date)}
            </text>
          </g>
        ))}
      </svg>

      {/* Le détail vit sous le graphique plutôt que dans une bulle flottante :
          au clavier comme au toucher, une bulle ne s'ouvre jamais. */}
      {detail && (
        <p className="courbe__detail">
          <strong style={{ color: couleur }}>{noteLisible(detail.note)}/20</strong>
          {detail.notion && <span> — {detail.notion}</span>}
          <span className="courbe__detail-date"> · {dateCourte(detail.date)}</span>
        </p>
      )}
    </div>
  );
}

/** Niveau de maîtrise, notion par notion. */
function BarresNotions({ notions }) {
  return (
    <ul className="notions">
      {notions.map((notion) => {
        const niveau =
          notion.score >= 0.75 ? 'acquis' : notion.score >= 0.4 ? 'fragile' : 'lacune';

        return (
          <li key={notion.competenceId} className="notion">
            <span className="notion__libelle" title={notion.libelle}>
              {notion.libelle}
            </span>

            <span className="notion__barre">
              <span
                className={`notion__remplissage notion__remplissage--${niveau}`}
                style={{ width: `${Math.round(notion.score * 100)}%` }}
              />
            </span>

            <span className="notion__score">{Math.round(notion.score * 100)} %</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function ProgressionMatiere({ matiere }) {
  const couleur = matiere.profCouleur || 'var(--serie-2)';
  const notes = matiere.notes ?? [];
  const notions = matiere.notions ?? [];

  return (
    <section className="progression">
      <header className="progression__entete">
        <div>
          <strong className="matiere-nom" style={styleMatiere(matiere)}>
            {matiere.matiereLibelle}
          </strong>
          {matiere.profPrenom && (
            <span className="progression__prof">avec {matiere.profPrenom}</span>
          )}
        </div>

        {matiere.moyenne !== null && matiere.moyenne !== undefined && (
          <span className="progression__moyenne" style={{ color: couleur }}>
            {noteLisible(matiere.moyenne)}
            <span>/20 de moyenne</span>
          </span>
        )}
      </header>

      <div className="progression__corps">
        <div className="progression__bloc">
          <h4>Ses notes</h4>
          {notes.length === 0 ? (
            <p className="vide vide--compact">Aucune évaluation passée dans cette matière.</p>
          ) : (
            <>
              <CourbeNotes notes={notes} couleur={couleur} />
              <p className="progression__note">
                Les évaluations dans l'ordre où elles ont été passées.
              </p>
            </>
          )}
        </div>

        <div className="progression__bloc">
          <h4>Où il en est, notion par notion</h4>
          {notions.length === 0 ? (
            <p className="vide vide--compact">
              Aucune notion évaluée pour l'instant. Il en faut quelques séances.
            </p>
          ) : (
            <BarresNotions notions={notions} />
          )}
        </div>
      </div>
    </section>
  );
}
