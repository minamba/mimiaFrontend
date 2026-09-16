import { useMemo, useState } from 'react';
import {
  apercuDiffusion,
  apercuModeleMail,
  envoyerMailParent,
  envoyerModeleParent,
} from '../lib/api/adminApi';
import { useModeleMail } from '../lib/hooks/useModeleMail';
import BandeauModele from './BandeauModele';
import BarreOutilsTexte from './BarreOutilsTexte';
import BlocPieces from './BlocPieces';
import ColonneModeles from './ColonneModeles';
import SectionMail from './SectionMail';

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
 *
 * LES MÊMES TEMPLATES QUE LA DIFFUSION — Camara, le 15/09/2026
 * ------------------------------------------------------------
 * Un template choisi ici s'enregistre à chaque modification, comme dans la
 * diffusion : c'est le même objet. Seuls les templates de diffusion sont
 * proposés — un courriel automatique part tout seul. Un message envoyé à un
 * seul parent sans template n'en crée pas : ce serait remplir la liste de
 * réponses ponctuelles.
 *
 * TROIS CARTES — le template, le destinataire, le courriel — et une barre
 * d'actions qui reste à portée : les trois questions qu'on se pose dans cet
 * ordre, séparées plutôt qu'enfilées dans une seule colonne de champs.
 */
export default function MessageParent({ parents }) {
  const [recherche, setRecherche] = useState('');
  const [listeOuverte, setListeOuverte] = useState(false);
  const [destinataire, setDestinataire] = useState('');

  const {
    nom, setNom,
    description, setDescription,
    sujet, setSujet,
    titre, setTitre,
    texte, setTexte,
    images, documents,
    zoneTexte,
    insererMarqueur, insererEmoji, insererGras,
    modele, etat: etatModele, enregistreA, revision, erreurPiece,
    enregistrer, selectionner, deselectionner, creer, ajouterPieces, retirerPiece,
  } = useModeleMail();

  const [confirme, setConfirme] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
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
  const contenuPret = sujet.trim().length > 0 && texte.trim().length > 0;
  const pret = adresseValide && contenuPret;

  const voirApercu = async () => {
    setErreur(null);

    try {
      let html;

      if (modele) {
        await enregistrer();
        ({ data: html } = await apercuModeleMail(modele.id));
      } else {
        ({ data: html } = await apercuDiffusion(composition));
      }

      // MÊME GESTE QUE LA DIFFUSION : un onglet plutôt qu'une modale, pour
      // voir le courriel à sa taille réelle.
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErreur("L'aperçu n'a pas pu être généré.");
    }
  };

  const enregistrerTemplate = async () => {
    setErreur(null);
    setEnregistrementEnCours(true);

    try {
      await creer();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le template n'a pas pu être enregistré.");
    } finally {
      setEnregistrementEnCours(false);
    }
  };

  const envoyer = async () => {
    setEnvoi(true);
    setErreur(null);

    try {
      const adresse = destinataire.trim();

      if (modele) {
        await enregistrer();
        await envoyerModeleParent(modele.id, adresse);
      } else {
        await envoyerMailParent({ ...composition, destinataire: adresse });

        // Sans template, le formulaire se vide comme avant. Avec, il reste
        // ouvert : on écrit souvent le même message à plusieurs parents.
        await deselectionner();
      }

      setEnvoye(adresse);
      setConfirme(false);
      setDestinataire('');
      setRecherche('');
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le message n'a pas pu être envoyé.");
    } finally {
      setEnvoi(false);
    }
  };

  const choisir = (id) => {
    setErreur(null);
    setConfirme(false);
    selectionner(id).catch(() => setErreur("Le template n'a pas pu être ouvert."));
  };

  return (
    <div className="atelier-mails">
      <div className="diffusion message-parent">
        {erreur && <div className="alert">{erreur}</div>}
        {envoye && <div className="alert alert--succes">Message envoyé à {envoye}.</div>}

        <BandeauModele modele={modele} etat={etatModele} enregistreA={enregistreA} />

        {/* ① LE TEMPLATE — ce qu'on lit dans la liste de droite. */}
        <SectionMail
          numero="1"
          titre="Le template"
          aide={modele
            ? 'Son nom et sa description, tels qu’ils apparaissent dans la liste de droite.'
            : 'Facultatif : pour retrouver ce message dans la liste si vous l’enregistrez.'}
          teinte="sarcelle"
        >
          <div className="champ">
            <label htmlFor="mp-nom">Nom du template</label>
            <input
              id="mp-nom"
              maxLength={120}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder={modele ? '' : '(l’objet, si vous le laissez vide)'}
            />
          </div>

          <div className="champ">
            <label htmlFor="mp-description">Description</label>
            <textarea
              id="mp-description"
              className="champ-description"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="À quoi sert ce message, en une ou deux phrases."
            />
          </div>
        </SectionMail>

        {/* ② LE DESTINATAIRE — qui va le recevoir. */}
        <SectionMail
          numero="2"
          titre="Le destinataire"
          aide="Cherchez un parent par son nom, ou tapez directement son adresse."
          teinte="bleu"
        >
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
        </SectionMail>

        {/* ③ LE COURRIEL — ce que le parent reçoit. */}
        <SectionMail
          numero="3"
          titre="Le courriel"
          aide="Ce que le parent reçoit : l’objet, le message, et ses images ou documents."
          teinte="corail"
        >
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
            onAjouter={(fichiers) => ajouterPieces('Image', fichiers)}
            onRetirer={(i) => retirerPiece('Image', i)}
            onInserer={insererMarqueur}
            accept="image/*"
            videTexte="Aucune image. Ajoutez-en une, puis cliquez sur « Insérer ici » pour la placer à l’endroit du curseur dans votre texte."
            avecMarqueur
          />

          <BlocPieces
            titre="Documents joints"
            items={documents}
            onAjouter={(fichiers) => ajouterPieces('Document', fichiers)}
            onRetirer={(i) => retirerPiece('Document', i)}
            videTexte="Aucun document. Ceux que vous ajoutez seront téléchargeables depuis le courriel."
          />

          {erreurPiece && <div className="alert">{erreurPiece}</div>}

          <p className="diffusion__poids-total">
            Poids total des pièces : <strong>{Math.round(
              [...images, ...documents].reduce((n, f) => n + (f.size ?? 0), 0) / 1024,
            ).toLocaleString('fr-FR')} Ko</strong> sur 5 120 Ko autorisés.
          </p>
        </SectionMail>

        <div className="diffusion__actions diffusion__actions--barre">
          <button
            type="button"
            className="btn btn--compact btn--fantome"
            disabled={!contenuPret}
            onClick={voirApercu}
          >
            Voir l’aperçu
          </button>

          {/* Le même bouton que la diffusion : un template se modifie sans
              être envoyé, et on doit pouvoir le voir. */}
          {modele && (
            <button
              type="button"
              className="btn btn--compact btn--fantome"
              disabled={etatModele !== 'modifie' && etatModele !== 'erreur'}
              onClick={() => enregistrer()}
            >
              {etatModele === 'enregistrement' ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          )}

          {!modele && (
            <button
              type="button"
              className="btn btn--compact btn--fantome"
              disabled={!contenuPret || enregistrementEnCours}
              onClick={enregistrerTemplate}
            >
              {enregistrementEnCours ? 'Enregistrement…' : 'Enregistrer le template'}
            </button>
          )}

          {confirme ? (
            <>
              <button
                type="button"
                className="btn btn--compact diffusion__envoi"
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
              className="btn btn--compact diffusion__envoi"
              disabled={!pret}
              onClick={() => setConfirme(true)}
            >
              Envoyer à ce parent
            </button>
          )}
        </div>
      </div>

      <ColonneModeles
        nature="Diffusion"
        natureFixe
        selectionId={modele?.id}
        onSelectionner={choisir}
        onNouveau={() => { setConfirme(false); deselectionner(); }}
        onSupprime={(id) => { if (modele?.id === id) deselectionner({ sansEnregistrer: true }); }}
        revision={revision}
      />
    </div>
  );
}
