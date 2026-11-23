import { useState } from 'react';
import { getFichierExamenBlanc, getTexteExamenBlanc } from '../lib/api/examensBlancsApi';
import ApercuCoursControle from './ApercuCoursControle';
import { MESSAGE_PURGE_EXAMEN_BLANC } from './DocumentsExamenBlanc';

/**
 * LES DOSSIERS PAR NOTION — examens blancs, étape 2 (Camara, le 23/11/2026) : « le professeur extrait les notions,
 * les organise en dossiers, par exemple le dossier Thalès et à l'intérieur les différents documents sur Thalès ;
 * les dossiers sont consultables par l'élève et il peut voir un aperçu des documents ».
 *
 * Un document peut être dans plusieurs dossiers. Ceux qu'aucun dossier ne reprend sont rangés à part (« Autres
 * documents ») : l'enfant ne doit pas croire qu'un document a disparu.
 */
export default function DossiersExamenBlanc({ eleveId, examenId, matiere }) {
  const [ouvert, setOuvert] = useState(null);
  const [enApercu, setEnApercu] = useState(null);

  const documents = matiere.documents ?? [];
  const dossiers = matiere.dossiers ?? [];
  const parId = new Map(documents.map((d) => [d.id, d]));

  if (documents.length === 0) return null;

  if (!matiere.dossiersAJour) {
    return (
      <p className="eb-dossiers__attente" role="status">
        <span className="eb-dossiers__onde" aria-hidden="true" />
        {matiere.documentsLus < documents.length
          ? `Ton professeur lit tes documents… (${matiere.documentsLus} sur ${documents.length})`
          : 'Ton professeur range tes documents par notion…'}
      </p>
    );
  }

  const ranges = new Set(dossiers.flatMap((d) => d.documentIds));
  const autres = documents.filter((d) => !ranges.has(d.id));
  const tous = [
    ...dossiers.map((d) => ({ cle: `n${d.id}`, libelle: d.libelle, docs: d.documentIds.map((id) => parId.get(id)).filter(Boolean) })),
    ...(autres.length > 0 ? [{ cle: 'autres', libelle: dossiers.length > 0 ? 'Autres documents' : 'Tes documents', docs: autres }] : []),
  ];

  return (
    <div className="eb-dossiers">
      <p className="eb-dossiers__titre">
        {dossiers.length > 0
          ? `Tes dossiers : ${dossiers.length} notion${dossiers.length > 1 ? 's' : ''} trouvée${dossiers.length > 1 ? 's' : ''} dans tes documents`
          : 'Ton professeur n’a pas trouvé de notion à ranger dans ces documents.'}
      </p>

      <ul className="eb-dossiers__liste">
        {tous.map((dossier) => (
          <li key={dossier.cle} className={`eb-dossier${ouvert === dossier.cle ? ' est-ouvert' : ''}`}>
            <button
              type="button"
              className="eb-dossier__entete"
              aria-expanded={ouvert === dossier.cle}
              onClick={() => setOuvert((o) => (o === dossier.cle ? null : dossier.cle))}
            >
              <span className="eb-dossier__icone" aria-hidden="true">📁</span>
              <span className="eb-dossier__libelle">{dossier.libelle}</span>
              <span className="eb-dossier__nombre">
                {dossier.docs.length} document{dossier.docs.length > 1 ? 's' : ''}
              </span>
            </button>

            {ouvert === dossier.cle && (
              <ul className="eb-dossier__documents">
                {dossier.docs.map((doc) => (
                  <li key={doc.id}>
                    <span className="eb-dossier__nom">{doc.nomFichier}</span>
                    {doc.consultable ? (
                      <button type="button" className="cours-controle__apercu" onClick={() => setEnApercu(doc)}>
                        Aperçu
                      </button>
                    ) : (
                      <span className="cours-controle__etat est-purge">Effacé</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {enApercu && (
        <ApercuCoursControle
          eleveId={eleveId}
          controleId={examenId}
          document={enApercu}
          lireFichier={(id) => getFichierExamenBlanc(eleveId, examenId, id)}
          lireTexte={(id) => getTexteExamenBlanc(eleveId, examenId, id)}
          messagePurge={MESSAGE_PURGE_EXAMEN_BLANC}
          onFermer={() => setEnApercu(null)}
        />
      )}
    </div>
  );
}
