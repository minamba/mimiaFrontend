import { useEffect, useState } from 'react';
import {
  ajouterDocumentExamenBlanc, getFichierExamenBlanc, getTexteExamenBlanc, retirerDocumentExamenBlanc,
} from '../lib/api/examensBlancsApi';
import { reduire } from './PieceJointe';
import { Icone } from './CopieControle';
import ApercuCoursControle from './ApercuCoursControle';
import { TYPES_COURS } from './CoursDuControle';

/** Vingt documents par matière, comme le serveur (Camara : « un élève n'atteindra jamais cette limite »). */
export const DOCUMENTS_MAX_EXAMEN_BLANC = 20;

export const MESSAGE_PURGE_EXAMEN_BLANC = 'Ce document n’est plus sur nos serveurs : il est effacé deux mois après l’examen blanc.';

const ETAT_PURGE = 'Effacé deux mois après l’examen blanc';

/**
 * LE GENRE D'UN FICHIER ENCORE SUR L'APPAREIL (pas encore envoyé) : une image ou un PDF se montrent tels quels, sans
 * le serveur ; un Word, Excel ou PowerPoint, que le navigateur ne sait pas dessiner, attend l'envoi (son texte est lu
 * par le serveur). Camara, le 23/11/2026 : « je ne peux pas avoir d'aperçu sur les documents que j'ajoute ».
 */
const genreLocal = (fichier) => {
  const type = fichier?.type ?? '';
  const nom = (fichier?.name ?? '').toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type === 'application/pdf' || nom.endsWith('.pdf')) return 'pdf';
  return null;
};

/** Une liste vide qui reste la même d'un rendu à l'autre : sinon l'effet qui la recopie tournerait sans fin. */
const AUCUN = [];

/**
 * LES DOCUMENTS D'UNE MATIÈRE D'EXAMEN BLANC — Camara, le 23/11/2026 : « l'enfant envoie simplement tous ses
 * documents », et il peut les revoir. Mêmes gestes et même habillage que « Ton cours » d'un contrôle
 * (`CoursDuControle`), avec trois différences : vingt documents, AUCUNE limite de pages ni de taille propre (100 Mo
 * par fichier, pour le serveur), et pas encore de scan par téléphone.
 *
 * DEUX RÉGIMES, comme pour le contrôle :
 *   - LA MATIÈRE EXISTE (`ligneId`) : chaque fichier part tout de suite ;
 *   - PAS ENCORE (la fenêtre d'ajout) : les fichiers attendent dans `enAttente`, et la fenêtre les envoie juste
 *     après avoir ajouté la matière.
 */
export default function DocumentsExamenBlanc({
  eleveId, examenId = null, ligneId = null, documents: initiaux = AUCUN, enAttente = AUCUN, onEnAttente = null,
  onChange = null, disabled = false, onOccupe = null, titre = true,
}) {
  const [documents, setDocuments] = useState(initiaux);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [enApercu, setEnApercu] = useState(null);

  useEffect(() => { setDocuments(initiaux); }, [initiaux]);
  useEffect(() => { onOccupe?.(envoi); }, [envoi, onOccupe]);

  const enLigne = Boolean(examenId && ligneId);
  const nombre = enLigne ? documents.length : enAttente.length;
  const plein = nombre >= DOCUMENTS_MAX_EXAMEN_BLANC;

  const ajouter = async (fichiers) => {
    const place = DOCUMENTS_MAX_EXAMEN_BLANC - nombre;
    const retenus = Array.from(fichiers ?? []).slice(0, Math.max(0, place));
    if (retenus.length === 0) return;

    setErreur(null);
    setEnvoi(true);

    // Les photos sont réduites ici, comme en séance : c'est le téléphone de l'enfant qui est lent, pas le serveur.
    const reduits = await Promise.all(retenus.map((f) => reduire(f).catch(() => f)));

    if (!enLigne) {
      onEnAttente?.([...enAttente, ...reduits]);
      setEnvoi(false);
      return;
    }

    try {
      for (const fichier of reduits) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await ajouterDocumentExamenBlanc(eleveId, examenId, ligneId, fichier);
        setDocuments((liste) => [...liste, data]);
      }
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Ce document n’a pas pu être envoyé. Tu peux réessayer ?');
    } finally {
      setEnvoi(false);
      onChange?.();
    }
  };

  const retirer = async (element, index) => {
    setErreur(null);

    if (!enLigne) {
      onEnAttente?.(enAttente.filter((_, i) => i !== index));
      return;
    }

    try {
      await retirerDocumentExamenBlanc(eleveId, examenId, element.id);
      setDocuments((liste) => liste.filter((d) => d.id !== element.id));
      onChange?.();
    } catch {
      setErreur('Ce document n’a pas pu être retiré. Tu peux réessayer ?');
    }
  };

  // LU OU REÇU : le texte d'un Word, Excel ou PowerPoint est lu à l'envoi ; les photos et les PDF le seront par
  // le professeur (étape suivante). Effacé deux mois après l'examen blanc.
  const etatDe = (d) => {
    if (d.purge) return ETAT_PURGE;
    return d.lu ? 'Lu par ton professeur' : 'Reçu';
  };

  const elements = enLigne
    ? documents.map((d) => ({ cle: `d${d.id}`, nom: d.nomFichier, etat: etatDe(d), element: d, consultable: Boolean(d.consultable) }))
    : enAttente.map((f, i) => ({
      cle: `f${i}-${f.name}`,
      nom: f.name,
      etat: 'Sera envoyé avec la matière',
      // L'aperçu d'un fichier pas encore envoyé : lu sur l'appareil, sans le serveur (images et PDF).
      element: genreLocal(f) ? { id: `local-${i}`, nomFichier: f.name, genre: genreLocal(f), fichier: f } : f,
      consultable: Boolean(genreLocal(f)),
    }));

  const bloque = disabled || envoi || plein;

  return (
    <div className="cours-controle" role="group" aria-label="Tes documents">
      {titre && (
        <>
          <p className="cours-controle__titre">Tes documents</p>
          <p className="champ__aide">
            Envoie tous tes cours pour cette matière : photos, PDF, Word, Excel ou PowerPoint, sans limite de pages.
            Ton professeur en tirera les notions à réviser. Tu pourras les revoir ici jusqu’à deux mois après
            l’examen blanc.
          </p>
        </>
      )}

      {elements.length > 0 && (
        <ul className="cours-controle__liste">
          {elements.map(({ cle, nom, etat, element, consultable }, index) => (
            <li key={cle} className="cours-controle__document">
              <Icone />
              <span className="cours-controle__nom">{nom}</span>
              <span className={`cours-controle__etat${etat === 'Lu par ton professeur' ? ' est-lu' : ''}${etat === ETAT_PURGE ? ' est-purge' : ''}`}>
                {etat}
              </span>
              {consultable && (
                <button
                  type="button"
                  className="cours-controle__apercu"
                  aria-label={`Aperçu de ${nom}`}
                  onClick={() => setEnApercu(element)}
                >
                  Aperçu
                </button>
              )}
              <button
                type="button"
                className="cours-controle__retirer"
                aria-label={`Retirer ${nom}`}
                disabled={disabled || envoi}
                onClick={() => retirer(element, index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

      {plein ? (
        <p className="champ__aide">
          {DOCUMENTS_MAX_EXAMEN_BLANC} documents au plus : retires-en un pour en ajouter un autre.
        </p>
      ) : (
        <div className="cours-controle__boutons">
          <label className={`btn btn--compact btn--fantome cours-controle__bouton${bloque ? ' est-desactive' : ''}`}>
            <Icone /> {envoi ? 'Envoi…' : 'Ajouter mes documents'}
            <input
              type="file"
              hidden
              multiple
              disabled={bloque}
              accept={TYPES_COURS}
              onChange={(e) => {
                const choisis = e.target.files;
                ajouter(choisis);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      )}

      {enApercu?.fichier && (
        <ApercuCoursControle
          eleveId={eleveId}
          controleId={null}
          document={enApercu}
          lireFichier={() => Promise.resolve({ data: enApercu.fichier })}
          onFermer={() => setEnApercu(null)}
        />
      )}

      {enApercu && !enApercu.fichier && enLigne && (
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
