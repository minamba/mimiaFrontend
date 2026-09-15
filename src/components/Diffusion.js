import { useEffect, useState } from 'react';
import { apercuDiffusion, lancerDiffusion, getEtatDiffusion } from '../lib/api/adminApi';
import { useCompositionMessage } from '../lib/hooks/useCompositionMessage';
import BarreOutilsTexte from './BarreOutilsTexte';
import BlocPieces from './BlocPieces';

/**
 * Écrire à tous les parents.
 *
 * L'ÉCRAN LE PLUS DANGEREUX DE L'ADMINISTRATION
 * ---------------------------------------------
 * Un clic écrit à tous les clients, et un courriel parti ne se rattrape pas.
 * Toute la mise en page découle de là : l'aperçu avant l'envoi, le nombre de
 * destinataires écrit en toutes lettres dans la confirmation, et un bouton
 * d'envoi qui reste gris tant qu'on n'a pas relu.
 *
 * PAS D'ÉDITEUR ENRICHI, ET C'EST UN CHOIX
 * ----------------------------------------
 * Un éditeur visuel produit du HTML qu'on ne relit jamais, et qui casse dans
 * la moitié des messageries — celles-ci n'implémentent qu'un sous-ensemble du
 * HTML, différent pour chacune. Ici le texte est du texte, les paragraphes
 * viennent des lignes vides, `**gras**` et les images se placent avec un
 * marqueur (voir `useCompositionMessage`). Ce qu'on écrit est ce qui part.
 */
export default function Diffusion({ nombreParents }) {
  const [sujet, setSujet] = useState('');
  const [titre, setTitre] = useState('');

  const {
    texte, setTexte,
    images, setImages,
    documents, setDocuments,
    zoneTexte,
    insererMarqueur, insererEmoji, insererGras,
  } = useCompositionMessage();

  const [confirme, setConfirme] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [etat, setEtat] = useState(null);

  // Suit l'avancement pendant l'envoi. L'intervalle s'arrête dès que la
  // diffusion se termine : continuer à interroger une API pour un état qui ne
  // bougera plus est du bruit pur.
  useEffect(() => {
    let vivant = true;

    const lire = () => {
      getEtatDiffusion()
        .then(({ data }) => { if (vivant) setEtat(data); })
        .catch(() => {});
    };

    lire();
    const minuteur = setInterval(lire, 2000);

    return () => { vivant = false; clearInterval(minuteur); };
  }, []);

  const enCours = etat?.enCours === true;

  const composition = { sujet, titre: titre || sujet, texte, images, documents };

  const voirApercu = async () => {
    setErreur(null);

    try {
      const { data } = await apercuDiffusion(composition);

      // OUVERT DANS UN ONGLET, PAS DANS UNE FENÊTRE MODALE.
      //
      // Un courriel se lit en pleine largeur, avec les images et la mise en
      // page réelles. Le montrer dans une boîte de 420 pixels donnerait un
      // aperçu qui ne ressemble à rien de ce que le parent verra.
      const blob = new Blob([data], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');

      // L'adresse est révoquée après ouverture : sans ça, chaque aperçu
      // laisserait un objet en mémoire jusqu'au rechargement de la page.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErreur("L'aperçu n'a pas pu être généré.");
    }
  };

  const envoyer = async () => {
    setEnvoi(true);
    setErreur(null);

    try {
      await lancerDiffusion(composition);
      setConfirme(false);

      const { data } = await getEtatDiffusion();
      setEtat(data);
    } catch (e) {
      setErreur(
        e?.response?.status === 409
          ? 'Une diffusion est déjà en cours. Attendez qu’elle se termine.'
          : "La diffusion n'a pas pu être lancée.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  const pret = sujet.trim().length > 0 && texte.trim().length > 0;

  return (
    <div className="diffusion">
      {erreur && <div className="alert">{erreur}</div>}

      {/* L'avancement d'abord : quand un envoi tourne, c'est la seule chose
          qu'on vient regarder. */}
      {etat && (etat.enCours || etat.fin) && (
        <div className={`diffusion__etat ${enCours ? 'est-active' : ''}`}>
          <strong>
            {enCours
              ? `Envoi en cours — ${etat.traites} / ${etat.total}`
              : `Dernière diffusion : ${etat.envoyes} envoyé(s), ${etat.echecs} échec(s)`}
          </strong>

          {etat.sujet && <span className="diffusion__etat-sujet">« {etat.sujet} »</span>}

          {etat.erreur && <span className="diffusion__etat-erreur">{etat.erreur}</span>}
        </div>
      )}

      <div className="champ">
        <label htmlFor="dif-sujet">Objet du courriel</label>
        <input
          id="dif-sujet"
          maxLength={150}
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          placeholder="Une nouveauté sur Mimia"
        />
        <span className="champ__aide">
          C’est la seule ligne que le parent lit avant de décider d’ouvrir.
        </span>
      </div>

      <div className="champ">
        <label htmlFor="dif-titre">Titre affiché dans le message</label>
        <input
          id="dif-titre"
          maxLength={150}
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="(identique à l’objet si vous le laissez vide)"
        />
      </div>

      <div className="champ">
        <label htmlFor="dif-texte">Message</label>
        <BarreOutilsTexte onGras={insererGras} onEmoji={insererEmoji} />
        <textarea
          id="dif-texte"
          ref={zoneTexte}
          rows={12}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={'Bonjour,\n\nUne ligne vide sépare deux paragraphes.\n\nÀ bientôt,\nL’équipe Mimia'}
        />
        <span className="champ__aide">
          Une ligne vide crée un paragraphe. <strong>**Ainsi**</strong> devient du
          gras ; le reste du texte part tel quel.
        </span>
      </div>

      <BlocPieces
        titre="Images dans le message"
        items={images}
        onAjouter={(fichiers) => setImages([...images, ...fichiers])}
        onRetirer={(i) => setImages(images.filter((_, n) => n !== i))}
        onInserer={insererMarqueur}
        accept="image/*"
        videTexte="Aucune image. Ajoutez-en une, puis cliquez sur « Insérer ici » pour la placer à l’endroit du curseur dans votre texte."
        avecMarqueur
      />

      <BlocPieces
        titre="Documents joints"
        items={documents}
        onAjouter={(fichiers) => setDocuments([...documents, ...fichiers])}
        onRetirer={(i) => setDocuments(documents.filter((_, n) => n !== i))}
        videTexte="Aucun document. Ceux que vous ajoutez seront téléchargeables depuis le courriel, et listés à la fin du message."
      />

      {/* CINQ MÉGAOCTETS, ET C'EST UNE LIMITE DE DÉLIVRABILITÉ.
          Au-delà, beaucoup de messageries refusent le message ou le classent
          en indésirable — le parent ne reçoit alors rien du tout. */}
      <p className="diffusion__poids-total">
        Poids total des pièces : <strong>{Math.round(
          [...images, ...documents].reduce((n, f) => n + f.size, 0) / 1024,
        ).toLocaleString('fr-FR')} Ko</strong> sur 5 120 Ko autorisés.
      </p>

      <div className="diffusion__actions">
        <button
          type="button"
          className="btn btn--compact btn--fantome"
          disabled={!pret}
          onClick={voirApercu}
        >
          Voir l’aperçu
        </button>

        {confirme ? (
          <>
            <button
              type="button"
              className="btn btn--compact btn--danger"
              disabled={envoi || enCours}
              onClick={envoyer}
            >
              {envoi ? 'Lancement…' : `Confirmer l’envoi à ${nombreParents} parent(s)`}
            </button>

            <button
              type="button"
              className="btn btn--compact btn--fantome"
              onClick={() => setConfirme(false)}
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn--compact"
            disabled={!pret || enCours}
            onClick={() => setConfirme(true)}
          >
            Envoyer à tous les parents
          </button>
        )}
      </div>

      {confirme && (
        <p className="diffusion__avertissement">
          Ce message partira à <strong>{nombreParents} parent(s)</strong>, chacun
          dans son propre courriel. <strong>Un envoi ne s’annule pas.</strong>{' '}
          Avez-vous relu l’aperçu ?
        </p>
      )}
    </div>
  );
}
