import { useRef, useState } from 'react';
import { ecouteService } from '../lib/storage/ecouteService';
import { lireEnonce } from '../lib/storage/enonceControle';
import { creerControle, modifierControle } from '../lib/api/elevesApi';

/**
 * Le pictogramme de l'en-tête : une feuille de contrôle, dessinée au trait
 * comme les autres icônes du produit (la coche du calendrier, le sablier) —
 * jamais un emoji, dont le rendu change d'un système à l'autre.
 */
function IconeControle() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </svg>
  );
}

/** Date locale (pas UTC) → « AAAA-MM-JJ ». `toISOString` décalerait le jour
 * pour un enfant à Paris : minuit heure locale tombe la veille en UTC. */
const versISODate = (date) => {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
};

/**
 * Le formulaire d'un contrôle à venir, posé depuis le calendrier par le
 * parent ou l'enfant — matière, sujet (dicté ou tapé), heure facultative.
 *
 * MÊME MICRO QUE PARTOUT AILLEURS : `ecouteService`, pas `Chat.js` — celui-ci
 * est entièrement pris dans la logique d'une séance de tutorat (mains
 * libres, détection de silence, bascule haut-parleur) et n'a rien à faire
 * dans un simple champ de saisie.
 */
export default function ControleForm({
  eleveId, matieres, jour, controle = null, sousTitre = null,
  onEnregistre, onAnnule,
}) {
  const edition = Boolean(controle);

  // PAS DE MATIÈRE PAR DÉFAUT À LA CRÉATION. Pré-sélectionner la première de
  // la liste rendait le champ obligatoire impossible à manquer… et surtout
  // impossible à voir : on validait sans regarder, et le contrôle atterrissait
  // en mathématiques par hasard. Un contrôle rangé dans la mauvaise matière ne
  // sera préparé par personne.
  const [matiereId, setMatiereId] = useState(controle?.matiereId ?? '');
  const [sujet, setSujet] = useState(controle?.sujet ?? '');
  const [heure, setHeure] = useState(controle?.heureControle?.slice(0, 5) ?? '');

  // Le jour vient de la case cliquée dans le calendrier ; ouvert depuis la
  // page « Mes contrôles » ou en édition, il se saisit à la main.
  const [date, setDate] = useState(
    jour ? versISODate(jour) : (controle?.dateControle?.slice(0, 10) ?? ''),
  );
  const [ecoute, setEcoute] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  // Les champs obligatoires laissés vides, par nom de champ. Vidé dès que
  // l'enfant corrige : un message rouge qui reste après correction donne
  // l'impression que le formulaire est cassé.
  const [manquants, setManquants] = useState({});

  const ecouteRef = useRef(null);

  /**
   * LA PHRASE ENTIÈRE REMPLIT LE FORMULAIRE, PAS SEULEMENT LE SUJET.
   *
   * Voulu par Camara le 13/09/2026 : le micro était braqué sur le champ
   * « sujet », alors qu'un enfant énonce son contrôle d'un bloc — « j'ai
   * contrôle lundi 14 septembre en math à 11h sur le théorème de Thalès ».
   * Tout ce qu'il disait d'autre que le sujet finissait écrit DANS le sujet,
   * et il devait ensuite remplir à la main les trois champs qu'il venait de
   * dicter.
   *
   * CHAQUE CHAMP RESTE INDÉPENDANT, et c'est ce qui rend la dictée sûre : une
   * phrase qui ne donne que la date ne touche qu'à la date. On n'efface jamais
   * ce qui est déjà saisi avec une valeur qu'on n'a pas entendue — un enfant
   * qui complète sa phrase ne doit pas voir disparaître ce qu'il avait choisi.
   */
  const remplirDepuisLaVoix = (texte) => {
    const lu = lireEnonce(texte, matieres);

    if (lu.matiereId) setMatiereId(String(lu.matiereId));
    if (lu.date) setDate(lu.date);
    if (lu.heure) setHeure(lu.heure);
    if (lu.sujet) setSujet(lu.sujet);

    // Le message rouge tombe dès que la voix a comblé le manque : le laisser
    // afficher « choisis la matière » sous un champ qui vient de se remplir
    // ferait croire que la dictée n'a pas marché.
    setManquants((actuels) => {
      const restants = { ...actuels };
      if (lu.matiereId) delete restants.matiere;
      if (lu.date) delete restants.date;
      return restants;
    });
  };

  const basculerMicro = () => {
    if (ecoute) {
      ecouteRef.current?.arreter();
      return;
    }

    setEcoute(true);
    ecouteRef.current = ecouteService.ecouter({
      // LE PROVISOIRE NE REMPLIT RIEN. Il arrive par morceaux — « j'ai
      // contrôle ven… » — et poser une date sur une phrase coupée en deux la
      // ferait sauter d'un jour à l'autre sous les yeux de l'enfant. On attend
      // qu'il ait fini de parler.
      onFinal: remplirDepuisLaVoix,
      onFin: () => setEcoute(false),
      onErreur: (message) => { setErreur(message); setEcoute(false); },
    });
  };

  const soumettre = async (evenement) => {
    evenement.preventDefault();

    // LA MATIÈRE ET LA DATE SONT LES DEUX SEULES OBLIGATOIRES.
    //
    // Sans matière, aucun professeur ne peut le préparer ; sans date, le
    // contrôle n'a aucun jour où s'accrocher dans le calendrier et rien ne
    // peut décompter les jours restants. Le sujet et l'heure, eux, se
    // complètent en parlant avec le professeur — les exiger ici ferait
    // renoncer un enfant qui ne sait pas encore ce qu'il y aura dessus.
    const manques = {};
    if (!matiereId) manques.matiere = 'Choisis la matière du contrôle.';
    if (!date) manques.date = 'Indique la date du contrôle.';

    setManquants(manques);

    if (Object.keys(manques).length > 0) {
      setErreur(null);
      return;
    }

    setEnvoi(true);
    setErreur(null);

    const donnees = {
      matiereId: Number(matiereId),
      sujet: sujet.trim() || null,
      dateControle: date,
      // Toujours avec les secondes : un « 14:00 » seul suffit au
      // navigateur, mais le format constant .NET attendu côté serveur
      // (hh:mm:ss) ne les rend pas facultatives.
      heureControle: heure ? `${heure}:00` : null,
    };

    try {
      if (edition) await modifierControle(eleveId, controle.id, donnees);
      else await creerControle(eleveId, donnees);

      onEnregistre();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le contrôle n'a pas pu être enregistré.");
      setEnvoi(false);
    }
  };

  return (
    <form className="controle-form" onSubmit={soumettre}>
      {/* L'EN-TÊTE EST ICI, PAS CHEZ LES TROIS APPELANTS. Le formulaire
          s'ouvre depuis le calendrier, depuis « Mes contrôles » et depuis la
          fiche : trois titres écrits séparément auraient divergé au premier
          changement de formulation. */}
      <header className="controle-form__entete">
        <span className="controle-form__pastille" aria-hidden="true">
          <IconeControle />
        </span>

        <span>
          <strong className="controle-form__titre">
            {edition ? 'Modifier le contrôle' : 'Ajouter un contrôle'}
          </strong>
          <span className="controle-form__soustitre">
            {sousTitre ?? 'Ton professeur pourra t’aider à le préparer.'}
          </span>
        </span>
      </header>

      {erreur && <div className="alert">{erreur}</div>}

      {/* LE MICRO EN TÊTE, ET PAS DANS UN CHAMP.
          Il servait au seul « sujet », donc tout ce que l'enfant disait
          d'autre — le jour, l'heure, la matière — finissait écrit dans le
          sujet, et il remplissait ensuite à la main ce qu'il venait de dicter.
          Placé ici, avant les champs, il annonce ce qu'il fait : on parle une
          fois, le formulaire se remplit. En édition il n'a plus lieu d'être —
          on vient corriger un champ précis, pas tout redire. */}
      {ecouteService.supporte && !edition && (
        <div className={`controle-form__dictee${ecoute ? ' est-active' : ''}`}>
          <button
            type="button"
            className={`micro${ecoute ? ' micro--actif' : ''}`}
            onClick={basculerMicro}
            aria-label={ecoute ? 'Arrêter le micro' : 'Énoncer le contrôle à la voix'}
          >
            <span className="micro__icone" aria-hidden="true" />
          </button>

          <span className="controle-form__dictee-mot">
            {ecoute ? (
              <strong>Je t’écoute…</strong>
            ) : (
              <>
                <strong>Dis-le simplement, tout se remplit.</strong>
                <span>
                  « J’ai contrôle vendredi en maths à 11h sur le théorème de
                  Thalès »
                </span>
              </>
            )}
          </span>
        </div>
      )}

      <div className={`champ${manquants.matiere ? ' champ--manquant' : ''}`}>
        <label htmlFor="ctrl-matiere">Matière</label>
        <select
          id="ctrl-matiere"
          value={matiereId}
          onChange={(e) => {
            setMatiereId(e.target.value);
            setManquants((m) => ({ ...m, matiere: undefined }));
          }}
          /* LA MATIÈRE SE FIGE À LA CRÉATION — voulu par Camara le
             13/09/2026. En changer après coup vide le programme, invalide la
             préparation déjà faite, et laisse le professeur de l'ancienne
             matière avec des séances rattachées à un contrôle qui n'est plus
             le sien. S'être trompé de matière se répare en supprimant, pas
             en déplaçant. */
          disabled={edition}
          aria-invalid={Boolean(manquants.matiere)}
          aria-describedby={
            edition ? 'ctrl-matiere-figee' : manquants.matiere ? 'ctrl-matiere-erreur' : undefined
          }
        >
          {/* L'option vide n'existe QUE si rien n'est encore choisi : une
              fois la matière prise, on ne propose plus de la retirer. */}
          {!matiereId && <option value="">Choisis une matière…</option>}
          {matieres.length === 0 && <option value="">Aucune matière disponible</option>}
          {matieres.map((m) => (
            <option key={m.id} value={m.id}>{m.libelle}</option>
          ))}
        </select>

        {edition && (
          <span className="champ__aide" id="ctrl-matiere-figee">
            La matière ne se change pas. Si tu t’es trompé, supprime ce
            contrôle et crée-le dans la bonne matière.
          </span>
        )}

        {!edition && manquants.matiere && (
          <span className="champ__erreur" id="ctrl-matiere-erreur" role="alert">
            {manquants.matiere}
          </span>
        )}
      </div>

      <div className="champ">
        <label htmlFor="ctrl-sujet">
          Sujet du contrôle <span className="champ__option">(facultatif)</span>
        </label>
        <textarea
          id="ctrl-sujet"
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          placeholder="Ce sur quoi porte le contrôle…"
          rows={3}
        />

        <span className="champ__aide">
          Tu peux le laisser vide : ton professeur te le demandera en cours.
        </span>
      </div>

      <div className="duo">
        {/* Masquée quand elle vient de la case cliquée : redemander la date
            qu'on vient de désigner du doigt serait absurde. */}
        {!jour && (
          <div className={`champ${manquants.date ? ' champ--manquant' : ''}`}>
            <label htmlFor="ctrl-date">Date du contrôle</label>
            <input
              id="ctrl-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setManquants((m) => ({ ...m, date: undefined }));
              }}
              aria-invalid={Boolean(manquants.date)}
              aria-describedby={manquants.date ? 'ctrl-date-erreur' : undefined}
            />

            {manquants.date && (
              <span className="champ__erreur" id="ctrl-date-erreur" role="alert">
                {manquants.date}
              </span>
            )}
          </div>
        )}

        <div className="champ">
          <label htmlFor="ctrl-heure">
            Heure <span className="champ__option">(facultatif)</span>
          </label>
          <input
            id="ctrl-heure"
            type="time"
            value={heure}
            onChange={(e) => setHeure(e.target.value)}
          />
        </div>
      </div>

      <div className="modale__actions">
        <button type="button" className="btn-ghost" onClick={onAnnule}>
          Annuler
        </button>
        <button type="submit" className="btn btn--compact" disabled={envoi || matieres.length === 0}>
          {envoi ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Ajouter le contrôle'}
        </button>
      </div>
    </form>
  );
}
