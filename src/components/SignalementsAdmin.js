import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import alerte from '../assets/alerte.webp';
import { useSelector } from 'react-redux';
import {
  ajouterPieceSignalement,
  getSignalements,
  getSignalementsAdmin,
  creerSignalement,
  modifierSignalement,
  supprimerSignalement,
} from '../lib/api/adminApi';
import { useEvenementsAdmin } from '../lib/hooks/useEvenementsAdmin';
import ChoixPiecesSignalement from './ChoixPiecesSignalement';
import CommentairesSignalement from './CommentairesSignalement';
import PiecesSignalement from './PiecesSignalement';
import './signalementsAdmin.css';

const CATEGORIES = [
  { code: 'PROFESSEUR', libelle: 'Problème avec un professeur' },
  { code: 'TECHNIQUE', libelle: 'Problème technique' },
  { code: 'SUGGESTION', libelle: 'Suggestion' },
  { code: 'AUTRE', libelle: 'Autre' },
];

const ETATS = [
  { code: 'nouveau', libelle: 'Nouveau' },
  { code: 'en_cours', libelle: 'En cours de traitement' },
  { code: 'traite', libelle: 'Traité' },
];

const libelleCategorie = (code) => CATEGORIES.find((c) => c.code === code)?.libelle ?? code;

const dateLisible = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR') : '—');

const tronquer = (texte, longueur) => {
  if (!texte) return '';
  return texte.length > longueur ? `${texte.slice(0, longueur)}…` : texte;
};

/**
 * CE QUE PORTE LE SIGNALEMENT, EN TOUTES LETTRES, SOUS SA DESCRIPTION — Camara, le
 * 03/11/2026 : deux pastilles chiffrées sur le bouton « Aperçu » ne disaient rien, et
 * le rendaient plus haut que ses voisins. Un mot vaut mieux qu'une icône à deviner.
 */
const compter = (nombre, mot) => (nombre > 0 ? `${nombre} ${mot}${nombre > 1 ? 's' : ''}` : null);

const contenuJoint = (s) => [
  compter(s.nombrePieces, 'fichier'),
  compter(s.nombreCommentaires, 'commentaire'),
].filter(Boolean).join(' · ');

/**
 * Un mail par changement d'état part côté serveur dès qu'on enregistre —
 * voir `AdminController.ModifierSignalement`. Corriger un texte sans
 * toucher à l'état n'en envoie aucun.
 */
/**
 * L'ÉTAT, CHANGÉ DEPUIS LA LISTE — Camara, le 03/11/2026 : « sans devoir ouvrir le
 * signalement ». La couleur reste celle de l'ancienne pastille.
 *
 * LE PARENT REÇOIT UN MAIL À CHAQUE CHANGEMENT (voir plus haut), et rien ne le
 * rattrape : le survol le dit.
 */
/** « Grille de tests CP › Test Français », pour la ligne de test d'un signalement d'administrateur. */
const lienTest = (s) => (s.test
  ? `${s.test.jeuTitre || s.test.classe} › ${s.test.testTitre}`
  : null);

const STATUTS_LIGNE = { a_tester: 'À tester', en_cours: 'En cours', ok: 'OK', ko: 'KO' };

/**
 * LE LIEN VERS LE JEU DE TEST — Camara, le 06/11/2026 : « un lien vers le jeu de test directement ». Un clic ouvre
 * l'onglet « Jeux de tests » sur ce jeu, bloc déplié et ligne en évidence ; Ctrl+clic ou clic du milieu l'ouvre dans
 * un nouvel onglet du navigateur, par l'adresse (`?onglet=jeux_tests&jeu=…&ligne=…`, lue par Admin.js).
 */
function LienJeu({ signalement, onOuvrirJeu }) {
  const texte = lienTest(signalement);
  const { jeuId, ligneId } = signalement.test ?? {};
  if (!texte || !jeuId) return texte;

  return (
    <a
      className="signalements__lien-jeu"
      href={`/admin?onglet=jeux_tests&jeu=${jeuId}&ligne=${ligneId}`}
      title="Ouvrir ce jeu de test, sur la ligne du signalement"
      onClick={(e) => {
        if (!onOuvrirJeu || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onOuvrirJeu(jeuId, ligneId);
      }}
    >
      {texte}
    </a>
  );
}

function ChoixEtat({ signalement, occupe, onChange }) {
  return (
    <select
      className={`signalement-etat signalement-etat-choix signalement-etat--${signalement.etat}`}
      aria-label={`État du signalement de ${signalement.parentMail}`}
      title={signalement.estAdmin
        ? 'Passer à « Traité » remet le test « à tester » et prévient la personne qui teste'
        : 'Changer l’état envoie aussitôt un mail au parent'}
      value={signalement.etat}
      disabled={occupe}
      onChange={(e) => onChange(signalement, e.target.value)}
    >
      {ETATS.map((e) => (
        <option key={e.code} value={e.code}>{e.libelle}</option>
      ))}
    </select>
  );
}

/** Lire un signalement en entier, et ses commentaires, sans passer par « Modifier ». */
function Apercu({
  signalement, occupe, onFermer, onModifier, onChangeEtat, onCommentaires, onPieces, onOuvrirJeu,
}) {
  useEffect(() => {
    const surTouche = (e) => { if (e.key === 'Escape') onFermer(); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [onFermer]);

  return createPortal(
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="signalement-apercu-titre">
      <div className="modale__boite signalement-apercu">
        <h3 id="signalement-apercu-titre" className="signalement-apercu__titre">
          {libelleCategorie(signalement.categorie)}
        </h3>

        <div className="signalement-apercu__corps">
          <div className="signalement-apercu__entete">
            <p className="signalement-apercu__meta">
              {signalement.parentMail}
              {signalement.elevePrenom && ` (via ${signalement.elevePrenom})`}
              {' · '}
              {dateLisible(signalement.dateCreation)}
            </p>
            <ChoixEtat signalement={signalement} occupe={occupe} onChange={onChangeEtat} />
          </div>

          <p className="signalement-apercu__message">{signalement.description}</p>

          {signalement.estAdmin && (signalement.test ? (
            <div className="signalement-apercu__test">
              <div className="signalement-apercu__test-tete">
                <span className="signalement-apercu__etiquette">Jeu de test</span>
                <span className={`signalement-apercu__statut signalement-apercu__statut--${signalement.test.statut}`}>
                  Ligne {STATUTS_LIGNE[signalement.test.statut] ?? signalement.test.statut}
                </span>
              </div>
              <LienJeu signalement={signalement} onOuvrirJeu={onOuvrirJeu} />
              <p className="signalement-apercu__competence">
                <span className="signalement-apercu__etiquette">Compétence</span>
                {signalement.test.competence}
              </p>
            </div>
          ) : (
            <p className="signalement-apercu__meta">
              {signalement.ligneDeTestId ? 'La ligne de test a été supprimée du jeu.' : 'Non relié à un jeu de test.'}
            </p>
          ))}

          <PiecesSignalement signalementId={signalement.id} onChange={onPieces} />

          <CommentairesSignalement signalementId={signalement.id} onChange={onCommentaires} />
        </div>

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={() => onModifier(signalement)}>
            Modifier
          </button>
          <button type="button" className="btn btn--compact" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Formulaire({
  signalement, onEnregistre, onAnnule, onCommentaires, onPieces,
}) {
  const edition = Boolean(signalement);

  // PRÉ-REMPLI AVEC LE COMPTE CONNECTÉ — Camara, le 17/09/2026. La plupart
  // des signalements saisis depuis l'administration portent sur son propre
  // compte, et retaper son adresse à chaque fois est un obstacle inutile.
  //
  // LE CHAMP RESTE MODIFIABLE : c'est une valeur de départ, pas une
  // contrainte. Un signalement remonté par téléphone concerne le compte de
  // quelqu'un d'autre, et il faut pouvoir l'écrire.
  const { utilisateur } = useSelector((etat) => etat.auth);

  const [parentMail, setParentMail] = useState(utilisateur?.email ?? '');
  const [categorie, setCategorie] = useState(signalement?.categorie ?? 'TECHNIQUE');
  const [description, setDescription] = useState(signalement?.description ?? '');
  const [etat, setEtat] = useState(signalement?.etat ?? 'nouveau');

  // UN SIGNALEMENT ADMIN RELIÉ À UN JEU DE TEST (06/11/2026) : sa compétence se modifie ici, et la ligne du jeu
  // reprend compétence et description à l'enregistrement.
  const relie = Boolean(signalement?.estAdmin && signalement?.ligneDeTestId);
  const [competence, setCompetence] = useState(signalement?.competence ?? signalement?.test?.competence ?? '');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  // À la création seulement : en modification, le signalement existe, et ses pièces
  // s'ajoutent tout de suite (voir `PiecesSignalement`).
  const [fichiers, setFichiers] = useState([]);

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    setEnvoi(true);
    setErreur(null);

    const donnees = { categorie, description: description.trim(), etat };
    if (!edition) donnees.parentMail = parentMail.trim();
    if (relie) donnees.competence = competence.trim();

    try {
      if (edition) {
        await modifierSignalement(signalement.id, donnees);
      } else {
        const { data } = await creerSignalement(donnees);

        // LE SIGNALEMENT EST CRÉÉ : un fichier refusé ne doit pas le faire recréer.
        const resultats = await Promise.allSettled(
          fichiers.map((fichier) => ajouterPieceSignalement(data.id, fichier)),
        );
        const echecs = resultats.filter((r) => r.status === 'rejected').length;

        if (echecs > 0) {
          window.alert(`Le signalement est créé, mais ${echecs} fichier${echecs > 1 ? 's' : ''} n'a pas pu être joint. Vous pouvez réessayer depuis « Modifier ».`);
        }
      }

      onEnregistre();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le signalement n'a pas pu être enregistré.");
      setEnvoi(false);
    }
  };

  return (
    <>
    <form className="periodes-vacances__formulaire" onSubmit={soumettre}>
      <h3>{edition ? 'Modifier le signalement' : 'Ajouter un signalement'}</h3>

      {erreur && <div className="alert">{erreur}</div>}

      {!edition && (
        <div className="champ">
          <label htmlFor="sig-mail">Adresse du parent</label>
          <input
            id="sig-mail"
            type="email"
            value={parentMail}
            onChange={(e) => setParentMail(e.target.value)}
            placeholder="parent@exemple.fr"
            required
          />
          <span className="champ__aide">Le compte doit déjà exister.</span>
        </div>
      )}

      <div className="duo">
        <div className="champ">
          <label htmlFor="sig-categorie">Catégorie</label>
          <select id="sig-categorie" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.code} value={c.code}>{c.libelle}</option>
            ))}
          </select>
        </div>

        <div className="champ">
          <label htmlFor="sig-etat">État</label>
          <select id="sig-etat" value={etat} onChange={(e) => setEtat(e.target.value)}>
            {ETATS.map((e) => (
              <option key={e.code} value={e.code}>{e.libelle}</option>
            ))}
          </select>
        </div>
      </div>

      {relie && (
        <div className="champ">
          <label htmlFor="sig-competence">Compétence / test à réaliser</label>
          <input
            id="sig-competence"
            value={competence}
            maxLength={1000}
            onChange={(e) => setCompetence(e.target.value)}
            required
          />
          {signalement.test && (
            <span className="champ__aide">Ligne du jeu de test : {lienTest(signalement)}. Elle reprend la compétence et la description.</span>
          )}
        </div>
      )}

      <div className="champ">
        <label htmlFor="sig-description">Description</label>
        <textarea
          id="sig-description"
          rows={5}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {!edition && <ChoixPiecesSignalement fichiers={fichiers} onChange={setFichiers} identifiant="sig-pieces" />}

      <div className="modale__actions">
        <button type="button" className="btn-ghost" onClick={onAnnule}>
          Annuler
        </button>
        <button type="submit" className="btn btn--compact" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>

    {/* HORS DU FORMULAIRE : un formulaire ne peut pas en contenir un autre, et ajouter
        un commentaire n'enregistre pas le reste. */}
    {edition && (
      <div className="signalement-formulaire__commentaires">
        <PiecesSignalement signalementId={signalement.id} modifiable onChange={onPieces} />
        <CommentairesSignalement signalementId={signalement.id} onChange={onCommentaires} />
      </div>
    )}
    </>
  );
}

/**
 * LES DEUX ONGLETS — Camara, le 05/11/2026 : « Signalements » pour ceux des parents, « Signalements Admin » pour ceux
 * des administrateurs (`admin`), avec leur ligne de jeu de test. Ces derniers se créent depuis le bouton à côté du
 * bouclier, pas d'ici.
 */
export default function SignalementsAdmin({ admin = false, onOuvrirJeu = null }) {
  const [signalements, setSignalements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // `null` = pas de formulaire ; `'nouveau'` = création ; un objet = édition.
  const [formulaire, setFormulaire] = useState(null);

  const [occupe, setOccupe] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [filtreEtat, setFiltreEtat] = useState('');

  // L'identifiant et non l'objet : l'aperçu suit ainsi l'état changé, ou le signalement
  // retiré entre-temps par un autre administrateur.
  const [apercuId, setApercuId] = useState(null);

  // `silencieux` sert au rafraîchissement automatique : un nouveau
  // signalement déposé pendant qu'on regarde déjà l'écran ne doit pas faire
  // clignoter la liste en « Chargement… » ni écraser une erreur affichée
  // pour un incident qui, lui, s'est résolu depuis.
  const charger = ({ silencieux } = {}) => {
    if (!silencieux) setChargement(true);

    return (admin ? getSignalementsAdmin() : getSignalements())
      .then(({ data }) => setSignalements(Array.isArray(data) ? data : []))
      .catch(() => { if (!silencieux) setErreur("Les signalements n'ont pas pu être chargés."); })
      .finally(() => { if (!silencieux) setChargement(false); });
  };

  // Rechargé si l'on passe d'un onglet à l'autre : ce sont deux listes différentes.
  useEffect(() => { charger(); }, [admin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Un signalement peut arriver d'un parent connecté ailleurs, ou d'un
  // enfant : le serveur le pousse ici en direct dès qu'il arrive, plutôt
  // que d'attendre qu'on recharge la page.
  useEvenementsAdmin((type) => {
    if (type === 'signalement') charger({ silencieux: true });
  });

  const supprimer = async (signalement) => {
    setOccupe(signalement.id);

    try {
      await supprimerSignalement(signalement.id);
      setASupprimer(null);
      await charger();
    } catch {
      setErreur("Le signalement n'a pas pu être supprimé.");
    } finally {
      setOccupe(null);
    }
  };

  const changerEtat = async (signalement, etat) => {
    if (etat === signalement.etat) return;

    setOccupe(signalement.id);
    setErreur(null);

    try {
      const { data } = await modifierSignalement(signalement.id, {
        categorie: signalement.categorie,
        description: signalement.description,
        etat,
      });

      setSignalements((liste) => liste.map((s) => (s.id === signalement.id ? { ...s, ...data } : s)));
    } catch (e) {
      // La liste n'a pas bougé : le choix revient de lui-même à l'état réel.
      setErreur(e?.response?.data?.message ?? "L'état n'a pas pu être changé.");
    } finally {
      setOccupe(null);
    }
  };

  const noterCommentaires = (id, nombre) => {
    setSignalements((liste) => liste.map((s) => (s.id === id ? { ...s, nombreCommentaires: nombre } : s)));
  };

  const noterPieces = (id, nombre) => {
    setSignalements((liste) => liste.map((s) => (s.id === id ? { ...s, nombrePieces: nombre } : s)));
  };

  if (chargement && signalements.length === 0) return <p className="etat-vide">Chargement…</p>;

  if (formulaire) {
    return (
      <Formulaire
        signalement={formulaire === 'nouveau' ? null : formulaire}
        onAnnule={() => setFormulaire(null)}
        onEnregistre={() => { setFormulaire(null); charger(); }}
        onCommentaires={(nombre) => noterCommentaires(formulaire.id, nombre)}
        onPieces={(nombre) => noterPieces(formulaire.id, nombre)}
      />
    );
  }

  const affiches = filtreEtat
    ? signalements.filter((s) => s.etat === filtreEtat)
    : signalements;

  const enApercu = signalements.find((s) => s.id === apercuId);

  return (
    <div className="periodes-vacances">
      {enApercu && (
        <Apercu
          signalement={enApercu}
          occupe={occupe === enApercu.id}
          onFermer={() => setApercuId(null)}
          onModifier={(s) => { setApercuId(null); setFormulaire(s); }}
          onChangeEtat={changerEtat}
          onCommentaires={(nombre) => noterCommentaires(enApercu.id, nombre)}
          onPieces={(nombre) => noterPieces(enApercu.id, nombre)}
          onOuvrirJeu={onOuvrirJeu}
        />
      )}

      {/* LE TITRE ET SON MÉGAPHONE — Camara, le 20/09/2026. L'onglet s'ouvrait
          sur un filtre et un tableau, sans rien dire de ce qu'on regarde : les
          autres onglets de l'administration portent tous leur nom.

          Le sous-titre COMPTE, et dit ce que le filtre cache : « 2
          signalements » sur une liste qui en porte douze se lit comme une
          perte de données. Même règle que le carnet d'idées. */}
      <div className="signalements__entete">
        <span className="signalements__icone" aria-hidden="true">
          <img src={alerte} alt="" />
        </span>

        <div>
          <h2 className="signalements__titre">{admin ? 'Signalements Admin' : 'Signalements'}</h2>
          <p className="signalements__sous-titre">
            {signalements.length === 0
              ? 'Aucun signalement pour le moment.'
              : affiches.length === signalements.length
                ? `${signalements.length} signalement${signalements.length > 1 ? 's' : ''} reçu${signalements.length > 1 ? 's' : ''}.`
                : `${affiches.length} sur ${signalements.length} signalement${signalements.length > 1 ? 's' : ''}.`}
          </p>
        </div>
      </div>

      {erreur && <div className="alert">{erreur}</div>}

      <div className="filtres">
        <select value={filtreEtat} onChange={(e) => setFiltreEtat(e.target.value)}>
          <option value="">Tous les états</option>
          {ETATS.map((e) => (
            <option key={e.code} value={e.code}>{e.libelle}</option>
          ))}
        </select>

        {!admin && (
          <button type="button" className="btn btn--compact" onClick={() => setFormulaire('nouveau')}>
            Ajouter un signalement
          </button>
        )}
      </div>

      {affiches.length === 0 ? (
        <p className="etat-vide">Aucun signalement.</p>
      ) : (
        <div className="tableau">
          {/* SUR TÉLÉPHONE, CHAQUE LIGNE DEVIENT UNE CARTE — Camara, le
              20/09/2026 : « le tableau des signalements n'est pas responsive
              sur mobile ». Six colonnes dans 360 pixels réduisaient la
              description à une colonne de trois mots par ligne, et l'état, la
              date et les actions restaient hors de l'écran.

              Les classes ci-dessous ne servent QUE là : au-delà de 640 px, le
              tableau reste un tableau. Même recette que le carnet d'idées. */}
          <table className="signalements__tableau">
            <thead>
              <tr>
                <th scope="col">{admin ? 'Auteur' : 'Parent'}</th>
                <th scope="col">Catégorie</th>
                <th scope="col">Description</th>
                {admin && <th scope="col">Jeu de test</th>}
                <th scope="col">État</th>
                <th scope="col">Reçu le</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {affiches.map((s) => (
                <tr key={s.id}>
                  <td className="signalements__cellule-parent">
                    {s.parentMail}
                    {s.elevePrenom && (
                      <span className="signalement-admin__enfant"> (via {s.elevePrenom})</span>
                    )}
                  </td>
                  <td className="signalements__cellule-categorie">{libelleCategorie(s.categorie)}</td>
                  <td className="signalements__cellule-description">
                    {tronquer(s.description, 80)}
                    {contenuJoint(s) && (
                      <span className="signalement-ligne__joint">{contenuJoint(s)}</span>
                    )}
                  </td>
                  {admin && (
                    <td className="signalements__cellule-test" data-libelle="Jeu de test">
                      {lienTest(s) ? <LienJeu signalement={s} onOuvrirJeu={onOuvrirJeu} /> : (s.ligneDeTestId ? 'Ligne supprimée' : '—')}
                      {s.test && (
                        <span className="signalement-ligne__joint">{tronquer(s.test.competence, 60)} · {STATUTS_LIGNE[s.test.statut] ?? s.test.statut}</span>
                      )}
                    </td>
                  )}
                  <td className="signalements__cellule-etat">
                    <ChoixEtat signalement={s} occupe={occupe === s.id} onChange={changerEtat} />
                  </td>
                  <td className="signalements__cellule-date" data-libelle="Reçu le">
                    {dateLisible(s.dateCreation)}
                  </td>
                  {/* Les boutons dans un conteneur : `.actions` est en flex, et posé sur la case elle-même il lui
                      faisait perdre son comportement de cellule (bordure décalée sous les boutons, 06/11/2026). */}
                  <td className="signalements__cellule-actions">
                    <div className="actions">
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini"
                      onClick={() => setApercuId(s.id)}
                    >
                      Aperçu
                    </button>

                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini"
                      onClick={() => setFormulaire(s)}
                    >
                      Modifier
                    </button>

                    {aSupprimer === s.id ? (
                      <>
                        <button
                          type="button"
                          className="btn-ghost btn-ghost--mini btn-ghost--danger"
                          disabled={occupe === s.id}
                          title={admin && s.test ? 'Supprime aussi sa ligne dans le jeu de test' : undefined}
                          onClick={() => supprimer(s)}
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-ghost--mini"
                          onClick={() => setASupprimer(null)}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini btn-ghost--danger"
                        onClick={() => setASupprimer(s.id)}
                      >
                        Supprimer
                      </button>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
