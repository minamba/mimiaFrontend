import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../lib/actions/authActions';
import { getMonAvis, deposerAvis, retirerMonAvis } from '../lib/api/avisApi';
import Etoiles from './Etoiles';

const LONGUEUR_TITRE = 120;
const LONGUEUR_AVIS = 2000;

/**
 * Déposer, modifier ou retirer son avis.
 *
 * EXTRAIT DE LA SECTION VITRINE, ET MONTÉ AUX DEUX ENDROITS.
 *
 * La page d'accueil est le bon endroit pour LIRE des avis — on les consulte en
 * hésitant, avant de s'inscrire. C'est le mauvais endroit pour en ÉCRIRE un :
 * un parent connecté atterrit sur ses enfants et ne repasse jamais par
 * l'accueil. Le formulaire y serait resté invisible à ceux-là mêmes qui ont
 * quelque chose à dire.
 *
 * Il vit donc aussi dans « Mon compte », où le parent va vraiment. Un seul
 * composant pour les deux : deux formulaires jumeaux divergeraient au premier
 * ajustement, et les longueurs maximales cesseraient d'être les mêmes des deux
 * côtés sans que rien ne le signale.
 */
export default function MonAvis({ surEnvoi }) {
  const dispatch = useDispatch();
  const { authentifie } = useSelector((state) => state.auth);

  const [mien, setMien] = useState(null);
  const [ouvert, setOuvert] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const [note, setNote] = useState(5);
  const [titre, setTitre] = useState('');
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    if (!authentifie) { setMien(null); return undefined; }

    let vivant = true;

    getMonAvis()
      .then(({ data, status }) => {
        if (!vivant) return;

        // 204 : pas encore d'avis. `data` est alors une chaîne vide.
        const sien = status === 204 || !data ? null : data;
        setMien(sien);

        if (sien) {
          setNote(sien.note ?? 5);
          setTitre(sien.titre ?? '');
          setCommentaire(sien.commentaire ?? '');
        }
      })
      .catch(() => { if (vivant) setMien(null); });

    return () => { vivant = false; };
  }, [authentifie]);

  const envoyer = async (evenement) => {
    evenement.preventDefault();
    setEnvoi(true);
    setErreur(null);

    try {
      const { data } = await deposerAvis(note, titre, commentaire);
      setMien(data);
      setOuvert(false);
      surEnvoi?.();
    } catch (e) {
      setErreur(
        e?.response?.data?.message
        ?? "Votre avis n'a pas pu être envoyé. Réessayez dans un instant.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  const retirer = async () => {
    if (!window.confirm('Retirer votre avis ? Cette action est définitive.')) return;

    try {
      await retirerMonAvis();
      setMien(null);
      setNote(5);
      setTitre('');
      setCommentaire('');
      setOuvert(false);
      surEnvoi?.();
    } catch {
      setErreur("Votre avis n'a pas pu être retiré.");
    }
  };

  if (!authentifie) {
    return (
      <p className="avis__invite">
        Vous êtes client ?{' '}
        <button type="button" className="avis__lien" onClick={() => dispatch(login())}>
          Connectez-vous
        </button>{' '}
        pour laisser votre avis.
      </p>
    );
  }

  if (!ouvert) {
    return (
      <div className="avis__etat">
        {mien ? (
          <>
            <Etoiles note={mien.note} />
            <span>
              Votre avis {mien.publie ? 'est en ligne.' : 'sera publié après relecture.'}
            </span>
            <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setOuvert(true)}>
              Modifier
            </button>
            <button type="button" className="btn-ghost btn-ghost--mini btn-ghost--danger" onClick={retirer}>
              Retirer
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--principal" onClick={() => setOuvert(true)}>
            Donner mon avis
          </button>
        )}
      </div>
    );
  }

  return (
    <form className="avis__formulaire" onSubmit={envoyer}>
      <label className="avis__champ">
        <span>Votre note</span>
        <Etoiles note={note} saisie taille="grande" onChange={setNote} />
      </label>

      <label className="avis__champ">
        <span>Un titre <em>(facultatif)</em></span>
        <input
          type="text"
          maxLength={LONGUEUR_TITRE}
          value={titre}
          placeholder="Très content"
          onChange={(e) => setTitre(e.target.value)}
        />
      </label>

      <label className="avis__champ">
        <span>Votre avis <em>(facultatif)</em></span>
        <textarea
          rows={4}
          maxLength={LONGUEUR_AVIS}
          value={commentaire}
          placeholder="Ce qui a changé pour votre enfant, ce qui vous a plu, ce qui manque…"
          onChange={(e) => setCommentaire(e.target.value)}
        />
        <small>{commentaire.length} / {LONGUEUR_AVIS}</small>
      </label>

      {erreur && <p className="alert">{erreur}</p>}

      {/* DIT AVANT L'ENVOI, PAS APRÈS. Un avis qui n'apparaît pas
          immédiatement se lit comme une panne, ou pire comme une censure.
          Annoncer la relecture coûte une phrase. */}
      <p className="avis__mention">
        Votre avis est relu avant publication. Il apparaîtra signé de votre
        prénom et de l'initiale de votre nom.
      </p>

      <div className="avis__actions">
        <button type="submit" className="btn btn--principal" disabled={envoi}>
          {envoi ? 'Envoi…' : 'Envoyer mon avis'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOuvert(false)}>
          Annuler
        </button>
      </div>
    </form>
  );
}
