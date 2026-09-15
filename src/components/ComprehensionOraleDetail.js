import { useEffect, useState } from 'react';
import { chargerAudioComprehensionOrale } from '../lib/api/elevesApi';
import LecteurAudio from './LecteurAudio';
import Loader from './Loader';

/**
 * La fiche d'une compréhension orale archivée : le passage à réécouter, ce
 * que l'élève en a compris, et la remarque du professeur.
 *
 * Même construction que `DicteeCopie.js`, sans la partie impression — l'audio
 * ne s'imprime pas, et c'est lui l'artefact central ici, pas le texte.
 */

const LIBELLE_LANGUE = {
  en: 'anglais',
  fr: 'français',
  es: 'espagnol',
  de: 'allemand',
  it: 'italien',
  zh: 'chinois',
};

const dateLongue = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    : '';

export default function ComprehensionOraleDetail({ eleveId, fiche, onFermer }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [erreurAudio, setErreurAudio] = useState(false);

  // Échap ferme la fenêtre : un enfant qui a fini d'écouter cherche rarement
  // le bouton.
  useEffect(() => {
    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') onFermer?.();
    };

    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  // L'URL locale est révoquée au démontage — sans ça, chaque ouverture
  // laisse un fichier audio accroché à l'onglet.
  useEffect(() => {
    if (!fiche?.audioDisponible) return undefined;

    let vivant = true;

    chargerAudioComprehensionOrale(eleveId, fiche.id)
      .then((url) => {
        if (vivant) setAudioUrl(url);
      })
      .catch(() => {
        if (vivant) setErreurAudio(true);
      });

    return () => {
      vivant = false;
      setAudioUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
    };
  }, [eleveId, fiche?.id, fiche?.audioDisponible]);

  const langue = LIBELLE_LANGUE[fiche.langue] || fiche.langue;

  return (
    <div
      className="modale modale--comprehension-orale"
      role="dialog"
      aria-modal="true"
      aria-label="Compréhension orale"
    >
      <div className="modale__boite co-fiche">
        <header className="co-fiche__entete">
          <p className="co-fiche__sur-titre">
            Compréhension orale
            {fiche.matiereLibelle && <span aria-hidden="true"> · </span>}
            {fiche.matiereLibelle}
          </p>

          <h2 className="co-fiche__titre">{fiche.titre || 'Compréhension orale'}</h2>

          <p className="co-fiche__meta">
            {[fiche.elevePrenom, fiche.eleveNom].filter(Boolean).join(' ')}
            {fiche.eleveNiveau && ` · ${fiche.eleveNiveau}`}
          </p>

          <p className="co-fiche__meta co-fiche__meta--discret">
            {dateLongue(fiche.dateCreation)}
            {fiche.profPrenom && ` · avec ${fiche.profPrenom}`}
            {langue && ` · en ${langue}`}
          </p>
        </header>

        <section className="co-bloc co-bloc--passage">
          <h3 className="co-bloc__titre">
            <span className="co-bloc__puce" aria-hidden="true">🎧</span>
            Le passage à réécouter
          </h3>

          {fiche.audioDisponible && audioUrl && (
            /* LE MÊME LECTEUR QUE SUR LA PAGE D'ACCUEIL — voulu par Camara le
               12/09/2026. Les contrôles natifs posaient un rectangle blanc au
               milieu d'une fiche sombre, et ne s'habillent pas de la même
               façon d'un navigateur à l'autre.

               `key` sur l'URL : en ouvrant une autre fiche, l'objet URL change
               et le lecteur doit repartir de zéro. Sans elle, il garderait la
               position et la durée de l'extrait précédent. */
            <LecteurAudio
              key={audioUrl}
              src={audioUrl}
              libelle="le passage à réécouter"
            />
          )}
          {fiche.audioDisponible && !audioUrl && !erreurAudio && (
            <Loader texte="Chargement de l'audio…" />
          )}
          {/* UN AUDIO RANGÉ N'EST PAS UN AUDIO CASSÉ.

              Le son est effacé du disque au bout de trois mois — six cents
              kilo-octets par exercice, ça ne se garde pas indéfiniment. Mais
              l'enfant lisait alors « n'a pas pu être régénéré », un message
              de panne, pour quelque chose de parfaitement normal. Le texte du
              passage, lui, est toujours là juste en dessous. */}
          {!fiche.audioDisponible && fiche.audioEffaceLe && (
            <p className="co-bloc__texte comprehension-orale__audio-absente">
              L&apos;enregistrement a été effacé après quelques mois. Le texte du
              passage, lui, reste ici.
            </p>
          )}

          {(!fiche.audioDisponible && !fiche.audioEffaceLe) || erreurAudio ? (
            <p className="co-bloc__texte comprehension-orale__audio-absente">
              L&apos;audio n&apos;a pas pu être régénéré pour cette fiche.
            </p>
          ) : null}

          <p className="co-bloc__texte co-bloc__texte--passage">{fiche.passage}</p>
        </section>

        <section className="co-bloc co-bloc--dit">
          <h3 className="co-bloc__titre">
            <span className="co-bloc__puce" aria-hidden="true">💬</span>
            Ce que tu as dit
          </h3>
          <p className="co-bloc__texte">{fiche.reponseEleve}</p>
        </section>

        <section className="co-bloc co-bloc--compris">
          <h3 className="co-bloc__titre">
            <span className="co-bloc__puce" aria-hidden="true">✅</span>
            Ce que tu as compris
          </h3>
          <p className="co-bloc__texte">{fiche.comprehension}</p>
        </section>

        {fiche.remarque && (
          <section className="co-bloc co-bloc--remarque">
            <h3 className="co-bloc__titre">
              <span className="co-bloc__puce" aria-hidden="true">✍️</span>
              Observation du professeur
            </h3>
            <p className="co-bloc__texte">{fiche.remarque}</p>
            {fiche.profPrenom && (
              <p className="co-fiche__signature">
                — {fiche.profPrenom}, {fiche.matiereLibelle}
              </p>
            )}
          </section>
        )}

        <div className="modale__actions co-fiche__actions">
          <button type="button" className="btn-ghost" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
