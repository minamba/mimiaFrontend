import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getFichierCoursControle, getTexteCoursControle } from '../lib/api/elevesApi';

/** Le message quand le fichier n'est plus sur le serveur (purge, une semaine après le contrôle). */
export const MESSAGE_PURGE = 'Ce document n’est plus sur nos serveurs : il est effacé une semaine après le contrôle.';

const LIBELLES = {
  image: 'Image',
  pdf: 'PDF',
  word: 'Document Word',
  excel: 'Classeur Excel',
  powerpoint: 'Diaporama PowerPoint',
  autre: 'Document',
};

/**
 * L'APERÇU D'UN DOCUMENT DU COURS — Camara, le 04/11/2026 : « je veux aussi que
 * l'enfant puisse consulter le document (un bouton aperçu : image, PDF, Word,
 * Excel, PowerPoint) ».
 *
 * TROIS AFFICHAGES, UN SEUL FICHIER
 *   - une IMAGE s'affiche telle quelle ;
 *   - un PDF s'affiche dans un cadre ;
 *   - un document Word, Excel ou PowerPoint, que le navigateur ne sait pas
 *     dessiner, montre le TEXTE que le professeur lit, et se télécharge tel quel.
 *
 * LE FICHIER ARRIVE EN BLOB, PAS PAR UNE ADRESSE : la route exige le jeton de
 * l'élève, qu'une balise <img> ou <iframe> n'enverrait pas.
 *
 * Une semaine après le contrôle, le fichier est effacé du serveur : la route
 * répond 410, et l'aperçu le dit au lieu d'un cadre vide.
 */
export default function ApercuCoursControle({ eleveId, controleId, document: doc, onFermer }) {
  const [adresse, setAdresse] = useState(null);
  const [texte, setTexte] = useState(null);
  const [etat, setEtat] = useState('chargement');

  const visuel = doc.genre === 'image' || doc.genre === 'pdf';

  useEffect(() => {
    const surTouche = (e) => { if (e.key === 'Escape') onFermer(); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [onFermer]);

  useEffect(() => {
    let vivant = true;
    let creee = null;

    const charger = async () => {
      try {
        if (visuel) {
          const { data } = await getFichierCoursControle(eleveId, controleId, doc.id);
          creee = URL.createObjectURL(data);
          if (vivant) { setAdresse(creee); setEtat('pret'); }
        } else {
          const { data } = await getTexteCoursControle(eleveId, controleId, doc.id);
          if (vivant) { setTexte(data?.texte ?? ''); setEtat(data?.lu ? 'pret' : 'en-lecture'); }
        }
      } catch (e) {
        if (vivant) setEtat(e?.response?.status === 410 ? 'purge' : 'erreur');
      }
    };

    charger();

    return () => {
      vivant = false;
      if (creee) URL.revokeObjectURL(creee);
    };
  }, [eleveId, controleId, doc.id, visuel]);

  const telecharger = async () => {
    try {
      const { data } = await getFichierCoursControle(eleveId, controleId, doc.id);
      const lien = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = lien;
      a.download = doc.nomFichier;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(lien);
    } catch (e) {
      setEtat(e?.response?.status === 410 ? 'purge' : 'erreur');
    }
  };

  let corps;
  if (etat === 'chargement') {
    corps = <p className="cours-apercu__etat">Chargement…</p>;
  } else if (etat === 'purge') {
    corps = <p className="cours-apercu__etat" role="status">{MESSAGE_PURGE}</p>;
  } else if (etat === 'erreur') {
    corps = <p className="champ__erreur" role="alert">Ce document n’a pas pu être ouvert. Tu peux réessayer ?</p>;
  } else if (doc.genre === 'image') {
    corps = <img className="cours-apercu__image" src={adresse} alt={doc.nomFichier} />;
  } else if (doc.genre === 'pdf') {
    corps = <iframe className="cours-apercu__pdf" src={adresse} title={doc.nomFichier} />;
  } else if (etat === 'en-lecture') {
    corps = <p className="cours-apercu__etat">Ton professeur est en train de le lire… Le texte s’affichera ici dans un instant.</p>;
  } else if (!texte) {
    corps = <p className="cours-apercu__etat">Aucun texte n’a pu être lu dans ce document. Tu peux quand même le télécharger.</p>;
  } else {
    corps = <pre className="cours-apercu__texte">{texte}</pre>;
  }

  return createPortal(
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="cours-apercu-titre">
      <div className="modale__boite cours-apercu">
        <h3 id="cours-apercu-titre" className="cours-apercu__titre">{doc.nomFichier}</h3>
        <p className="cours-apercu__meta">
          {LIBELLES[doc.genre] ?? LIBELLES.autre}
          {!visuel && etat === 'pret' && texte && ' · ce que ton professeur lit'}
        </p>

        <div className="cours-apercu__corps">{corps}</div>

        <div className="modale__actions">
          {etat !== 'purge' && (
            <button type="button" className="btn-ghost" onClick={telecharger}>
              Télécharger
            </button>
          )}
          <button type="button" className="btn btn--compact" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>,
    window.document.body,
  );
}
