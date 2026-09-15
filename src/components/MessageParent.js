import { useMemo, useState } from 'react';
import { apercuDiffusion, envoyerMailParent } from '../lib/api/adminApi';
import { useCompositionMessage } from '../lib/hooks/useCompositionMessage';
import BarreOutilsTexte from './BarreOutilsTexte';
import BlocPieces from './BlocPieces';

const REGEX_MAIL = /^\S+@\S+\.\S+$/;

const correspond = (parent, terme) => {
  const cible = `${parent.mail ?? ''} ${parent.prenom ?? ''} ${parent.nom ?? ''}`.toLowerCase();
  return cible.includes(terme.toLowerCase());
};

const nomAffiche = (parent) => [parent.prenom, parent.nom].filter(Boolean).join(' ') || 'Sans nom';

/**
 * Écrire à UN parent — même mise en page que la diffusion, un seul
 * destinataire.
 *
 * LE CHAMP MAIL RESTE UN CHAMP, LA RECHERCHE N'EST QU'UN RACCOURCI.
 * -------------------------------------------------------------------
 * Choisir une ligne dans la liste remplit l'adresse, mais ne la verrouille
 * pas : on peut toujours l'écrire ou la corriger à la main, pour un parent
 * qui n'apparaît pas encore dans la liste ou une adresse ponctuelle.
 */
export default function MessageParent({ parents }) {
  const [recherche, setRecherche] = useState('');
  const [listeOuverte, setListeOuverte] = useState(false);
  const [destinataire, setDestinataire] = useState('');

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
  const [envoye, setEnvoye] = useState(null);

  const resultats = useMemo(() => {
    const terme = recherche.trim();
    if (terme.length === 0) return [];
    return parents.filter((p) => correspond(p, terme)).slice(0, 8);
  }, [parents, recherche]);

  const choisirParent = (parent) => {
    setDestinataire(parent.mail ?? '');
    setRecherche(`${nomAffiche(parent)} — ${parent.mail ?? ''}`);
    setListeOuverte(false);
  };

  const composition = { sujet, titre: titre || sujet, texte, images, documents };
  const adresseValide = REGEX_MAIL.test(destinataire.trim());
  const pret = adresseValide && sujet.trim().length > 0 && texte.trim().length > 0;

  const voirApercu = async () => {
    setErreur(null);

    try {
      const { data } = await apercuDiffusion(composition);

      // MÊME GESTE QUE LA DIFFUSION : un onglet plutôt qu'une modale, pour
      // voir le courriel à sa taille réelle.
      const blob = new Blob([data], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErreur("L'aperçu n'a pas pu être généré.");
    }
  };

  const envoyer = async () => {
    setEnvoi(true);
    setErreur(null);

    try {
      await envoyerMailParent({ ...composition, destinataire: destinataire.trim() });

      setEnvoye(destinataire.trim());
      setConfirme(false);
      setSujet('');
      setTitre('');
      setTexte('');
      setImages([]);
      setDocuments([]);
      setDestinataire('');
      setRecherche('');
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le message n'a pas pu être envoyé.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="diffusion message-parent">
      {erreur && <div className="alert">{erreur}</div>}
      {envoye && <div className="alert alert--succes">Message envoyé à {envoye}.</div>}

      <div className="champ champ--recherche-parent">
        <label htmlFor="mp-recherche">Rechercher un parent</label>
        <input
          id="mp-recherche"
          autoComplete="off"
          value={recherche}
          onChange={(e) => { setRecherche(e.target.value); setListeOuverte(true); }}
          onFocus={() => setListeOuverte(true)}
          // Le délai laisse le clic sur une ligne se produire avant que la
          // liste ne se referme : sans lui, `onBlur` la ferme en premier et
          // le clic tombe dans le vide.
          onBlur={() => setTimeout(() => setListeOuverte(false), 150)}
          placeholder="Nom ou adresse e-mail…"
        />

        {listeOuverte && resultats.length > 0 && (
          <ul className="recherche-parent__liste">
            {resultats.map((p) => (
              <li key={p.id}>
                <button type="button" onMouseDown={() => choisirParent(p)}>
                  <span className="recherche-parent__nom">{nomAffiche(p)}</span>
                  <span className="recherche-parent__mail">{p.mail}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="champ">
        <label htmlFor="mp-mail">Adresse e-mail du destinataire</label>
        <input
          id="mp-mail"
          type="email"
          value={destinataire}
          onChange={(e) => setDestinataire(e.target.value)}
          placeholder="parent@exemple.fr"
        />
        <span className="champ__aide">
          Remplie automatiquement en choisissant une ligne ci-dessus, ou à taper
          directement.
        </span>
      </div>

      <div className="champ">
        <label htmlFor="mp-sujet">Objet du courriel</label>
        <input
          id="mp-sujet"
          maxLength={150}
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          placeholder="Votre question sur Mimia"
        />
      </div>

      <div className="champ">
        <label htmlFor="mp-titre">Titre affiché dans le message</label>
        <input
          id="mp-titre"
          maxLength={150}
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="(identique à l’objet si vous le laissez vide)"
        />
      </div>

      <div className="champ">
        <label htmlFor="mp-texte">Message</label>
        <BarreOutilsTexte onGras={insererGras} onEmoji={insererEmoji} />
        <textarea
          id="mp-texte"
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
        videTexte="Aucun document. Ceux que vous ajoutez seront téléchargeables depuis le courriel."
      />

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
              className="btn btn--compact"
              disabled={envoi}
              onClick={envoyer}
            >
              {envoi ? 'Envoi…' : `Confirmer l’envoi à ${destinataire.trim()}`}
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
            disabled={!pret}
            onClick={() => setConfirme(true)}
          >
            Envoyer à ce parent
          </button>
        )}
      </div>
    </div>
  );
}
