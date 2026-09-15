import { useEffect, useState } from 'react';
import { getVerificationExamens } from '../lib/api/adminApi';

/**
 * LA VÉRIFICATION DES CARTES D'EXAMEN — voulue par Camara le 14/09/2026 :
 * une cinquantaine de cartes, impossibles à ouvrir une par une.
 *
 * Une carte ne plante jamais quand elle est mal réglée : elle se vide, ou elle
 * compte des notions qui ne tombent pas. Cet encart le dit en tête, puis donne
 * le détail carte par carte. RIEN N'EST CALCULÉ ICI : le serveur applique les
 * mêmes règles que pour la carte de l'élève.
 *
 * Chargé à part du programme scolaire : si la vérification échoue, le reste de
 * l'onglet reste lisible.
 */
export default function VerificationExamensAdmin() {
  const [examens, setExamens] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getVerificationExamens()
      .then(({ data }) => setExamens(data ?? []))
      .catch(() => setErreur("La vérification des cartes d'examen n'a pas pu être chargée."));
  }, []);

  if (erreur) return <div className="alert">{erreur}</div>;
  if (!examens) return <p className="etat-vide">Vérification des cartes d’examen…</p>;

  const nombreCartes = examens.reduce((n, e) => n + e.epreuves.length, 0);
  const cartes = `${nombreCartes} carte${nombreCartes > 1 ? 's' : ''} vérifiée${nombreCartes > 1 ? 's' : ''}`;
  const problemes = examens.flatMap((e) => [
    ...e.problemes.map((p) => ({ ou: e.libelle, texte: p })),
    ...e.epreuves.flatMap((c) => c.problemes.map((p) => ({ ou: `${e.libelle} — ${c.libelle}`, texte: p }))),
  ]);

  return (
    <section className="verification-examens">
      <h3 className="programme-scolaire__section-titre">Cartes d’examen</h3>

      {problemes.length === 0 ? (
        <p className="verification-examens__bilan est-ok" role="status">
          {cartes} : aucune n’est vide, chaque partie retenue ou exclue correspond à des notions.
        </p>
      ) : (
        <>
          <p className="verification-examens__bilan est-ko" role="status">
            {cartes} : {problemes.length} problème{problemes.length > 1 ? 's' : ''} à corriger.
          </p>
          <ul className="verification-examens__problemes">
            {problemes.map((p) => (
              <li key={`${p.ou}|${p.texte}`}>
                <strong>{p.ou}</strong> : {p.texte}
              </li>
            ))}
          </ul>
        </>
      )}

      {examens.map((examen) => (
        <details key={examen.code} className="verification-examens__examen">
          <summary>
            {examen.libelle} ({examen.code}, juin {examen.session}) — {examen.epreuves.length} carte
            {examen.epreuves.length > 1 ? 's' : ''}
          </summary>

          <div className="tableau-defilant">
            <table className="verification-examens__table">
              <thead>
                <tr>
                  <th scope="col">Carte</th>
                  <th scope="col">Matière</th>
                  <th scope="col">Notions retenues</th>
                </tr>
              </thead>
              <tbody>
                {examen.epreuves.flatMap((carte) =>
                  (carte.matieres.length ? carte.matieres : [{ code: '—', notionsRetenues: 0, notionsDuProgramme: 0 }])
                    .map((m, i) => (
                      <tr key={`${carte.code}-${m.code}`} className={m.notionsRetenues === 0 ? 'est-vide' : ''}>
                        <td>{i === 0 ? carte.libelle : ''}</td>
                        <td>{m.libelle ?? m.code}</td>
                        <td>
                          {m.notionsRetenues} sur {m.notionsDuProgramme}
                        </td>
                      </tr>
                    )))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </section>
  );
}
