import { useEffect, useState } from 'react';
import alerte from '../assets/alerte.webp';
import { useSelector } from 'react-redux';
import {
  getSignalements,
  creerSignalement,
  modifierSignalement,
  supprimerSignalement,
} from '../lib/api/adminApi';
import { useEvenementsAdmin } from '../lib/hooks/useEvenementsAdmin';

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
const libelleEtat = (code) => ETATS.find((e) => e.code === code)?.libelle ?? code;

const dateLisible = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR') : '—');

const tronquer = (texte, longueur) => {
  if (!texte) return '';
  return texte.length > longueur ? `${texte.slice(0, longueur)}…` : texte;
};

/**
 * Un mail par changement d'état part côté serveur dès qu'on enregistre —
 * voir `AdminController.ModifierSignalement`. Corriger un texte sans
 * toucher à l'état n'en envoie aucun.
 */
function Formulaire({ signalement, onEnregistre, onAnnule }) {
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
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    setEnvoi(true);
    setErreur(null);

    const donnees = { categorie, description: description.trim(), etat };
    if (!edition) donnees.parentMail = parentMail.trim();

    try {
      if (edition) await modifierSignalement(signalement.id, donnees);
      else await creerSignalement(donnees);
      onEnregistre();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le signalement n'a pas pu être enregistré.");
      setEnvoi(false);
    }
  };

  return (
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

      <div className="modale__actions">
        <button type="button" className="btn-ghost" onClick={onAnnule}>
          Annuler
        </button>
        <button type="submit" className="btn btn--compact" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

export default function SignalementsAdmin() {
  const [signalements, setSignalements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // `null` = pas de formulaire ; `'nouveau'` = création ; un objet = édition.
  const [formulaire, setFormulaire] = useState(null);

  const [occupe, setOccupe] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [filtreEtat, setFiltreEtat] = useState('');

  // `silencieux` sert au rafraîchissement automatique : un nouveau
  // signalement déposé pendant qu'on regarde déjà l'écran ne doit pas faire
  // clignoter la liste en « Chargement… » ni écraser une erreur affichée
  // pour un incident qui, lui, s'est résolu depuis.
  const charger = ({ silencieux } = {}) => {
    if (!silencieux) setChargement(true);

    return getSignalements()
      .then(({ data }) => setSignalements(Array.isArray(data) ? data : []))
      .catch(() => { if (!silencieux) setErreur("Les signalements n'ont pas pu être chargés."); })
      .finally(() => { if (!silencieux) setChargement(false); });
  };

  useEffect(() => { charger(); }, []);

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

  if (chargement && signalements.length === 0) return <p className="etat-vide">Chargement…</p>;

  if (formulaire) {
    return (
      <Formulaire
        signalement={formulaire === 'nouveau' ? null : formulaire}
        onAnnule={() => setFormulaire(null)}
        onEnregistre={() => { setFormulaire(null); charger(); }}
      />
    );
  }

  const affiches = filtreEtat
    ? signalements.filter((s) => s.etat === filtreEtat)
    : signalements;

  return (
    <div className="periodes-vacances">
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
          <h2 className="signalements__titre">Signalements</h2>
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

        <button type="button" className="btn btn--compact" onClick={() => setFormulaire('nouveau')}>
          Ajouter un signalement
        </button>
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
                <th scope="col">Parent</th>
                <th scope="col">Catégorie</th>
                <th scope="col">Description</th>
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
                  </td>
                  <td className="signalements__cellule-etat">
                    <span className={`signalement-etat signalement-etat--${s.etat}`}>
                      {libelleEtat(s.etat)}
                    </span>
                  </td>
                  <td className="signalements__cellule-date" data-libelle="Reçu le">
                    {dateLisible(s.dateCreation)}
                  </td>
                  <td className="actions signalements__cellule-actions">
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
