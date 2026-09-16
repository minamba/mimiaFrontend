import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  chargerProfil,
  enregistrerProfil,
  changerMotDePasse,
  effacerMessages,
} from '../lib/actions/profilActions';
import { chargerEleves, submitEleve } from '../lib/actions/elevesActions';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { getCapaciteEnfants } from '../lib/api/abonnementApi';
import MonAvis from './MonAvis';
import Onglets from './Onglets';
import ChampMotDePasse from './ChampMotDePasse';
import CodeEnfant from './CodeEnfant';
import Loader from './Loader';
import Quota from './Quota';
import QuotaEnfants from './QuotaEnfants';
import RetraitEnfant from './RetraitEnfant';
import SuppressionCompte from './SuppressionCompte';
import { logout } from '../lib/actions/authActions';
import { getElevesArchives, restaurerEleve } from '../lib/api/elevesApi';
import { themeEnregistre, definirTheme } from '../lib/storage/theme';
import {
  grouperClasses,
  serieAPreciser,
  specialitesDeLaClasse,
  specialitesAEnvoyer,
} from '../lib/niveauxScolaires';
import ChoixSpecialites from './ChoixSpecialites';
// Les mêmes images que le bouton de thème de la barre : déjà en cache, elles
// donnent à la carte « Apparence » sa couleur — voir `Apparence`.
import iconeLune from '../assets/lune.png';
import iconeSoleil from '../assets/soleil.png';

const ONGLETS = [
  { cle: 'infos', libelle: 'Mes informations' },
  // En deuxième position et non en dernier : c'est l'onglet qu'un parent vient
  // consulter le plus souvent, bien avant son mot de passe.
  { cle: 'forfait', libelle: 'Mon forfait' },
  { cle: 'securite', libelle: 'Mot de passe' },
  { cle: 'enfants', libelle: 'Mes enfants' },
  { cle: 'parametres', libelle: 'Paramètres' },
  // EN DERNIER, ET C’EST VOULU. Un parent vient ici pour régler quelque
  // chose ; on ne lui demande pas son avis avant de l’avoir laissé faire ce
  // pour quoi il est venu.
  { cle: 'avis', libelle: 'Mon avis' },
];

/** Date courte. Sur un profil retiré, le jour suffit — l'heure n'apprend rien. */
const date = (valeur) =>
  valeur ? new Date(valeur).toLocaleDateString('fr-FR') : '';

const SEXES = [
  { valeur: 1, libelle: 'Une fille' },
  { valeur: 2, libelle: 'Un garçon' },
];

// --------------------------------------------------------------- mes infos
function Informations({ parent, compte, saving, onEnregistrer }) {
  const [champs, setChamps] = useState({ prenom: '', nom: '' });

  useEffect(() => {
    if (parent) setChamps({ prenom: parent.prenom ?? '', nom: parent.nom ?? '' });
  }, [parent]);

  const soumettre = (evenement) => {
    evenement.preventDefault();
    onEnregistrer({ prenom: champs.prenom.trim(), nom: champs.nom.trim() });
  };

  return (
    <form onSubmit={soumettre} className="bloc-profil">
      <div className="duo">
        <div className="champ">
          <label htmlFor="p-prenom">Prénom</label>
          <input
            id="p-prenom"
            value={champs.prenom}
            onChange={(e) => setChamps({ ...champs, prenom: e.target.value })}
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="champ">
          <label htmlFor="p-nom">Nom</label>
          <input
            id="p-nom"
            value={champs.nom}
            onChange={(e) => setChamps({ ...champs, nom: e.target.value })}
            required
            minLength={2}
            maxLength={100}
          />
        </div>
      </div>

      <div className="champ">
        <label htmlFor="p-mail">Adresse email</label>
        <input id="p-mail" value={parent?.mail ?? ''} readOnly disabled />
        <span className="champ__aide">
          C'est votre identifiant de connexion. Pour en changer, écrivez-nous —
          nous vérifions la nouvelle adresse avant de basculer, sinon une faute
          de frappe vous fermerait la porte de votre propre compte.
        </span>
      </div>

      {compte?.fournisseurs?.length > 0 && (
        <p className="note-compte">
          Vous vous connectez avec {compte.fournisseurs.join(', ')}.
        </p>
      )}

      <button type="submit" className="btn" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}

/**
 * Explication affichée quand un compte Google tente d'ouvrir l'onglet mot de
 * passe. Un onglet simplement grisé laisserait l'utilisateur cliquer sans
 * comprendre pourquoi rien ne se passe.
 */
function ModaleGoogle({ fournisseurs, onFermer }) {
  const via = fournisseurs?.length > 0 ? fournisseurs.join(', ') : 'Google';

  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-google">
      <div className="modale__boite">
        <h2 id="titre-google">Votre compte utilise {via}</h2>

        <p className="modale__texte">
          Vous vous êtes inscrit avec votre compte {via}. Votre mot de passe est
          géré par {via}, pas par Mimia : nous ne le connaissons pas, et nous ne
          pouvons donc pas le modifier ici.
        </p>

        <p className="modale__texte">
          C'est aussi ce qui protège votre compte — un mot de passe de moins à
          retenir, et un de moins à voir fuiter.
        </p>

        <div className="modale__actions">
          <a
            href="https://myaccount.google.com/security"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Gérer ma sécurité Google
          </a>
          <button type="button" className="btn btn--compact" onClick={onFermer}>
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------- sécurité
function Securite({ compte, saving, succes, onChanger }) {
  const [champs, setChamps] = useState({ actuel: '', nouveau: '', confirmation: '' });
  const [local, setLocal] = useState(null);

  /**
   * Les champs ne se vident QU'AU SUCCÈS.
   *
   * Ils se vidaient à l'envoi, avant même de savoir si le serveur acceptait.
   * Une seule faute de frappe sur le mot de passe actuel, et les trois champs
   * repartaient à zéro : il fallait tout retaper, dont un nouveau mot de passe
   * qu'on venait de choisir et de confirmer. Sur un mot de passe de dix
   * caractères minimum, c'est une punition pour une erreur d'un caractère.
   *
   * Vider reste nécessaire une fois le changement fait : trois mots de passe en
   * clair dans un formulaire, sur un ordinateur familial, ne demandent qu'à
   * être lus par le suivant.
   *
   * `succes` ne peut pas être périmé ici : changer d'onglet efface les messages,
   * donc celui qu'on reçoit pendant qu'on est sur cet écran est bien le nôtre.
   */
  useEffect(() => {
    if (succes) setChamps({ actuel: '', nouveau: '', confirmation: '' });
  }, [succes]);

  if (compte && !compte.aMotDePasse) {
    return (
      <div className="bloc-profil">
        <h2>Connexion Google</h2>
        <p className="page__sous-titre">
          Votre compte n'a pas de mot de passe : vous vous connectez avec Google.
          Il n'y a donc rien à changer ici — c'est chez Google que se gère la
          sécurité de votre accès.
        </p>
      </div>
    );
  }

  // Compte de démonstration : le mot de passe est fixé par la configuration.
  //
  // On explique plutôt que de griser le bouton. Un formulaire complet dont
  // l'envoi serait refusé fait perdre son temps, et un bouton inerte sans
  // raison affichée se lit comme une panne.
  if (compte?.estDemonstration) {
    return (
      <div className="bloc-profil">
        <h2>Compte de démonstration</h2>
        <p className="page__sous-titre">
          Son mot de passe est fixé par la configuration du serveur et ne se
          change pas ici. C'est voulu : il sert à montrer le produit, et le
          modifier le rendrait inaccessible à tous ceux qui l'utilisent — sans
          que personne ne sache par quoi il a été remplacé.
        </p>
      </div>
    );
  }

  const soumettre = (evenement) => {
    evenement.preventDefault();

    // Vérifié ici plutôt qu'au serveur : inutile de faire un aller-retour
    // pour une faute de frappe que le navigateur voit déjà.
    if (champs.nouveau !== champs.confirmation) {
      setLocal('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLocal(null);
    onChanger({ motDePasseActuel: champs.actuel, nouveauMotDePasse: champs.nouveau });
  };

  return (
    <form onSubmit={soumettre} className="bloc-profil">
      {local && <div className="alert">{local}</div>}

      <ChampMotDePasse
        id="mdp-actuel"
        label="Mot de passe actuel"
        valeur={champs.actuel}
        onChanger={(v) => setChamps({ ...champs, actuel: v })}
      />

      <div className="duo">
        <ChampMotDePasse
          id="mdp-nouveau"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          valeur={champs.nouveau}
          onChanger={(v) => setChamps({ ...champs, nouveau: v })}
          minLength={10}
          aide="10 caractères minimum."
        />

        <ChampMotDePasse
          id="mdp-confirmation"
          label="Confirmer"
          autoComplete="new-password"
          valeur={champs.confirmation}
          onChanger={(v) => setChamps({ ...champs, confirmation: v })}
          minLength={10}
        />
      </div>

      <button type="submit" className="btn" disabled={saving}>
        {saving ? 'Changement…' : 'Changer mon mot de passe'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- enfants
function LigneEnfant({ eleve, niveaux, academies, onEnregistrer, onVoirFiche, onRetirer, saving }) {
  const [ouvert, setOuvert] = useState(false);
  const [codeOuvert, setCodeOuvert] = useState(false);
  const [champs, setChamps] = useState({
    prenom: eleve.prenom ?? '',
    nom: eleve.nom ?? '',
    age: eleve.age ?? '',
    niveauScolaireId: eleve.niveauScolaireId ?? '',
    sexe: eleve.sexe ?? 0,
    academieId: eleve.academieId ?? '',
    lv2Espagnol: Boolean(eleve.lv2Espagnol),
    specialites: eleve.specialites ?? [],
  });

  // Même règle qu'à l'inscription : la case LV2 n'existe que dans les classes
  // qui ont une LV2, et suit la classe choisie dans le formulaire.
  const lv2Possible = Boolean(
    niveaux.find((n) => String(n.id) === String(champs.niveauScolaireId))?.lv2Possible,
  );
  const specialitesClasse = specialitesDeLaClasse(niveaux, champs.niveauScolaireId);

  const soumettre = (evenement) => {
    evenement.preventDefault();
    onEnregistrer({
      id: eleve.id,
      prenom: champs.prenom.trim(),
      nom: champs.nom.trim(),
      age: Number(champs.age),
      niveauScolaireId: Number(champs.niveauScolaireId),
      sexe: Number(champs.sexe),
      academieId: champs.academieId ? Number(champs.academieId) : null,
      lv2Espagnol: lv2Possible && champs.lv2Espagnol,
      specialites: specialitesAEnvoyer(champs.specialites, specialitesClasse),
    });
    setOuvert(false);
  };

  // Regroupées par voie et par série ; la classe actuelle reste visible même
  // si elle ne se choisit plus. Voir `grouperClasses`.
  const parCycle = grouperClasses(niveaux, eleve.niveauScolaireId);
  const aPreciser = serieAPreciser(niveaux, champs.niveauScolaireId);

  return (
    <li className="enfant-ligne">
      <div className="enfant-ligne__entete">
        <span className="enfant-ligne__initiale">
          {eleve.prenom?.charAt(0)?.toUpperCase()}
        </span>

        <span className="enfant-ligne__identite">
          <strong>
            {eleve.prenom} {eleve.nom}
          </strong>
          <span>
            {eleve.niveauLibelle} · {eleve.age} ans
          </span>
        </span>

        {/*
          TROIS RANGS, PAS CINQ BOUTONS IDENTIQUES.

          La version précédente alignait cinq boutons fantômes de même poids :
          rien ne disait lequel on venait chercher, et « Retirer » se retrouvait
          collé à « Modifier ». Un parent fatigué à neuf heures du soir ne doit
          pas avoir la suppression d'un profil à un pixel du geste courant.

          1. « Voir la fiche » est ce pour quoi on ouvre cette page : bouton
             plein, il se voit du premier coup d'œil.
          2. « Modifier » et « Code d'accès » sont occasionnels : fantômes.
          3. « Retirer » est rare et destructeur : détaché, à l'écart, discret.
        */}
        <span className="enfant-ligne__actions">
          <button
            type="button"
            className="btn btn--compact"
            onClick={() => onVoirFiche(eleve.id)}
          >
            Voir la fiche
          </button>

          <button
            type="button"
            className="btn-ghost btn-ghost--mini btn-ghost--modifier"
            onClick={() => setOuvert(!ouvert)}
          >
            {ouvert ? 'Annuler' : 'Modifier'}
          </button>

          {/* Le code d'accès est rangé avec les autres actions de l'enfant :
              c'est ici que le parent vient quand son enfant lui dit « je
              n'arrive pas à me connecter ».

              SEUL LE BOUTON EST DANS CETTE RANGÉE. Le panneau se déplie sous
              la ligne — rendu ici, il écrasait le prénom à trente pixels. */}
          <button
            type="button"
            className={`btn-ghost btn-ghost--mini btn-ghost--code ${codeOuvert ? 'est-actif' : ''}`}
            onClick={() => setCodeOuvert(!codeOuvert)}
          >
            Code d’accès
          </button>

          {/* « Retirer » et non « Supprimer » : le mot dit ce que fait le
              geste. L'effacement définitif se trouve derrière, dans la
              fenêtre. */}
          <button
            type="button"
            className="btn-ghost btn-ghost--mini btn-ghost--retirer"
            onClick={() => onRetirer(eleve)}
          >
            Retirer
          </button>
        </span>
      </div>

      {codeOuvert && <CodeEnfant eleve={eleve} />}

      {ouvert && (
        <form onSubmit={soumettre} className="enfant-ligne__form">
          <div className="duo">
            <div className="champ">
              <label htmlFor={`e-prenom-${eleve.id}`}>Prénom</label>
              <input
                id={`e-prenom-${eleve.id}`}
                value={champs.prenom}
                onChange={(e) => setChamps({ ...champs, prenom: e.target.value })}
                required
                minLength={2}
              />
            </div>

            <div className="champ">
              <label htmlFor={`e-nom-${eleve.id}`}>Nom</label>
              <input
                id={`e-nom-${eleve.id}`}
                value={champs.nom}
                onChange={(e) => setChamps({ ...champs, nom: e.target.value })}
                required
                minLength={2}
              />
            </div>
          </div>

          <div className="duo">
            <div className="champ">
              <label htmlFor={`e-niveau-${eleve.id}`}>Classe</label>
              <select
                id={`e-niveau-${eleve.id}`}
                value={champs.niveauScolaireId}
                onChange={(e) => setChamps({ ...champs, niveauScolaireId: e.target.value })}
                required
              >
                {parCycle.map(([cycle, duCycle]) => (
                  <optgroup key={cycle} label={cycle}>
                    {duCycle.map((niveau) => (
                      <option key={niveau.id} value={niveau.id}>
                        {niveau.libelle}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* UNE CLASSE TECHNOLOGIQUE SANS SÉRIE N'A PAS DE SPÉCIALITÉS.
                  L'élève garde ses maths, son histoire-géographie, sa
                  philosophie ; mais ni management, ni ingénierie, ni biologie
                  humaine tant que la série n'est pas choisie. */}
              {aPreciser && (
                <span className="champ__aide champ__aide--alerte" role="alert">
                  Précise la série : sans elle, ses spécialités n’apparaissent pas.
                </span>
              )}

              {lv2Possible && (
                <label className="case">
                  <input
                    type="checkbox"
                    checked={champs.lv2Espagnol}
                    onChange={(e) => setChamps({ ...champs, lv2Espagnol: e.target.checked })}
                  />
                  Espagnol en LVB
                </label>
              )}

              <ChoixSpecialites
                id={`e-specialites-${eleve.id}`}
                nombre={specialitesClasse.nombre}
                possibles={specialitesClasse.possibles}
                valeur={champs.specialites}
                onChange={(specialites) => setChamps({ ...champs, specialites })}
              />
            </div>

            <div className="champ">
              <label htmlFor={`e-age-${eleve.id}`}>Âge</label>
              <input
                id={`e-age-${eleve.id}`}
                type="number"
                min={5}
                max={25}
                value={champs.age}
                onChange={(e) => setChamps({ ...champs, age: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="champ">
            <label htmlFor={`e-academie-${eleve.id}`}>Académie (facultatif)</label>
            <select
              id={`e-academie-${eleve.id}`}
              value={champs.academieId}
              onChange={(e) => setChamps({ ...champs, academieId: e.target.value })}
            >
              <option value="">Je ne sais pas / plus tard</option>
              <optgroup label="Zones A, B, C">
                {academies
                  .filter((a) => ['A', 'B', 'C'].includes(a.zone))
                  .map((a) => (
                    <option key={a.id} value={a.id}>{a.libelle}</option>
                  ))}
              </optgroup>
              <optgroup label="Corse et outre-mer">
                {academies
                  .filter((a) => !['A', 'B', 'C'].includes(a.zone))
                  .map((a) => (
                    <option key={a.id} value={a.id}>{a.libelle}</option>
                  ))}
              </optgroup>
            </select>
            <span className="champ__aide">
              Sert à afficher les périodes de vacances scolaires dans « Mon calendrier ».
            </span>
          </div>

          <fieldset className="champ champ--choix">
            <legend>Fille ou garçon</legend>
            <div className="choix">
              {SEXES.map((option) => (
                <label
                  key={option.valeur}
                  className={`choix__option ${Number(champs.sexe) === option.valeur ? 'choix__option--actif' : ''}`}
                >
                  <input
                    type="radio"
                    name={`sexe-${eleve.id}`}
                    value={option.valeur}
                    checked={Number(champs.sexe) === option.valeur}
                    onChange={(e) => setChamps({ ...champs, sexe: e.target.value })}
                    required
                  />
                  {option.libelle}
                </label>
              ))}
            </div>
            <span className="champ__aide">
              Détermine les accords du professeur quand il lui parle.
            </span>
          </fieldset>

          <button type="submit" className="btn btn--compact" disabled={saving}>
            Enregistrer
          </button>
        </form>
      )}
    </li>
  );
}

// -------------------------------------------------------------- paramètres
/**
 * Le thème du site.
 *
 * SOMBRE PAR DÉFAUT, PARTOUT. Mimia ne suit plus les réglages du système
 * d'exploitation — c'est ce réglage-ci, et lui seul, qui décide. Un seul
 * interrupteur suffit : il n'y a que deux thèmes, et « sombre » est déjà
 * l'état de repos du site tant qu'on ne l'a pas touché.
 *
 * MÉMORISÉ SUR CET APPAREIL, PAS SUR LE COMPTE. Un choix posé dans le
 * navigateur du salon ne doit rien changer sur la tablette de la chambre —
 * chacune retombe sur le sombre tant qu'on ne l'a pas réglée à son tour.
 */
function Parametres() {
  const [theme, setTheme] = useState(() => themeEnregistre());
  const clair = theme === 'light';

  const basculer = () => {
    const nouveau = clair ? 'dark' : 'light';
    setTheme(nouveau);
    definirTheme(nouveau);
  };

  return (
    <div className="bloc-profil bloc-profil--apparence">
      <h2>Apparence</h2>
      <p className="bloc-profil__intro">
        Mimia s’affiche en sombre par défaut. Le clair reste à un clic, et
        votre choix est retenu sur cet appareil pour vos prochaines visites.
      </p>

      {/* EN BLUE SKY, LE CHOIX DU THÈME N'A PLUS COURS — le style impose le
          sombre (voir `styleSite.js`). Cette phrase remplace alors
          l'interrupteur, masqué par App.css : un réglage qui ne fait rien
          laisserait croire à une panne. Invisible hors Blue Sky. */}
      <p className="bloc-profil__note-blue-sky">
        Le site affiche en ce moment son nouveau style, toujours en sombre : le
        choix du thème reviendra dès la fin de cet essai. Votre préférence est
        gardée.
      </p>

      {/* UNE VIGNETTE QUI CHANGE AVEC L'ÉTAT — Camara, le 16/09/2026 : « trop
          monochrome ». La carte n'avait que du texte sur du bleu nuit ; la
          lune ou le soleil du bouton de thème y met la couleur, et dit d'un
          coup d'œil dans quel état on est. La classe d'état teinte le reste. */}
      <div className={`mode apparence__mode ${clair ? 'apparence__mode--clair' : ''}`}>
        <span className="apparence__visuel" aria-hidden="true">
          <img src={clair ? iconeSoleil : iconeLune} alt="" />
        </span>

        <div className="mode__texte">
          <strong className="mode__titre">
            Thème clair
            <span className={`mode__etat ${clair ? 'mode__etat--actif' : ''}`}>
              {clair ? 'Activé' : 'Désactivé'}
            </span>
          </strong>

          <p className="mode__description">
            {clair
              ? 'Le site s’affiche en clair sur cet appareil.'
              : 'Désactivé, le site reste en sombre — son thème par défaut.'}
          </p>
        </div>

        <button
          type="button"
          className={`bascule ${clair ? 'bascule--active' : ''}`}
          onClick={basculer}
          role="switch"
          aria-checked={clair}
          aria-label="Thème clair"
        >
          <span className="bascule__piste">
            <span className="bascule__bouton" />
          </span>
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ page
export default function MonProfil() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { parent, compte, loading, saving, error, succes } = useSelector((state) => state.profil);
  const { liste, submitting } = useSelector((state) => state.eleves);
  const { niveaux, academies } = useSelector((state) => state.referentiel);

  /**
   * L'onglet ouvert. « Mes informations » par défaut — sauf au retour d'un
   * paiement.
   *
   * Stripe renvoie le parent sur `/profil?paiement=ok`. L'y déposer sur ses
   * nom et prénom, c'est lui cacher la seule chose qu'il vient chercher :
   * la confirmation que sa formule a bien changé. Il devrait cliquer pour
   * vérifier ce qu'il a payé.
   *
   * Et ce n'est pas qu'un confort : c'est l'onglet du forfait qui demande au
   * serveur de rattraper le paiement si le webhook s'est perdu. Non monté, ce
   * filet ne se déclenche jamais.
   */
  const [onglet, setOnglet] = useState(() => {
    const parametres = new URLSearchParams(window.location.search);

    // « Donner mon avis », depuis un courriel : la page publique fait
    // connecter le parent, puis l'amène ici, sur le bon onglet.
    if (parametres.get('onglet') === 'avis') return 'avis';

    return parametres.get('paiement') === 'ok' || parametres.has('formule')
      ? 'forfait'
      : 'infos';
  });
  const [modaleGoogle, setModaleGoogle] = useState(false);

  // Ce que la formule autorise. Null tant qu'on ne sait pas : on n'affiche
  // alors aucun blocage, pour ne pas interdire à tort le temps d'un
  // chargement. Même règle que sur la page « Vos enfants ».
  const [capacite, setCapacite] = useState(null);

  // L'enfant dont on est en train de retirer le profil, ou null.
  const [aRetirer, setARetirer] = useState(null);

  // Les profils déjà retirés. Chargés à part de `liste`, qui ne contient que
  // les actifs — c'est justement ce qui fait qu'ils n'encombrent plus.
  const [archives, setArchives] = useState([]);

  const rechargerArchives = useCallback(() => {
    getElevesArchives()
      .then(({ data }) => setArchives(data))
      .catch(() => setArchives([]));
  }, []);

  // La fiche d'un enfant a maintenant sa propre page : elle porte trop
  // d'informations pour une fenêtre, et un parent doit pouvoir la mettre en
  // favori. On navigue, on ne charge plus ici.
  const voirFiche = (id) => navigate(`/eleves/${id}/fiche`);

  // Le compte n'a pas de mot de passe : il vient d'un fournisseur externe.
  const compteExterne = compte !== null && compte.aMotDePasse === false;

  useEffect(() => {
    dispatch(chargerProfil());
    dispatch(chargerEleves());
    dispatch(chargerReferentiel());

    rechargerArchives();

    getCapaciteEnfants()
      .then(({ data }) => setCapacite(data))
      .catch(() => {
        // Sans cette information, on laisse l'ajout ouvert : le serveur
        // refusera de toute façon, avec un message précis.
      });
  }, [dispatch, rechargerArchives]);

  const complet = capacite !== null && !capacite.peutAjouter;

  // L'infobulle de « Mot de passe » dépend du compte (Google ou non), donc
  // ne peut pas vivre dans la liste statique `ONGLETS` : elle se calcule ici,
  // à chaque rendu.
  const ongletsAffiches = ONGLETS.map((o) => (
    o.cle === 'securite' && compteExterne
      ? { ...o, titre: 'Géré par votre fournisseur de connexion' }
      : o
  ));

  const changerOnglet = (cle) => {
    // L'onglet reste visible et cliquable pour un compte Google : le masquer
    // laisserait croire à une fonctionnalité absente, alors qu'elle est
    // simplement gérée ailleurs. Le clic explique, il ne navigue pas.
    if (cle === 'securite' && compteExterne) {
      setModaleGoogle(true);
      return;
    }

    // Un « enregistré » resté à l'écran après changement d'onglet donnerait
    // l'impression qu'on vient de sauvegarder autre chose.
    dispatch(effacerMessages());
    setOnglet(cle);
  };

  if (loading && !parent) return <Loader texte="Chargement de votre profil…" />;

  return (
    <>
      {modaleGoogle && (
        <ModaleGoogle
          fournisseurs={compte?.fournisseurs}
          onFermer={() => setModaleGoogle(false)}
        />
      )}

      {aRetirer && (
        <RetraitEnfant
          eleve={aRetirer.eleve}
          dejaRetire={aRetirer.dejaRetire}
          onFerme={() => setARetirer(null)}
          onFait={() => {
            setARetirer(null);
            dispatch(chargerEleves());
            rechargerArchives();

            // La capacité change avec le retrait : c'est elle qui décide si le
            // bouton « Ajouter un enfant » revient.
            getCapaciteEnfants()
              .then(({ data }) => setCapacite(data))
              .catch(() => {});
          }}
        />
      )}


    <section className="page page--large">
      <div className="page__entete">
        <div>
          <h1>Mon compte</h1>
          <p className="page__sous-titre">
            {parent?.mail}
            {parent?.dateCreation &&
              ` · membre depuis le ${new Date(parent.dateCreation).toLocaleDateString('fr-FR')}`}
          </p>
        </div>
      </div>

      {/* SUR MOBILE, LES CINQ ONGLETS SE REPLIENT EN MENU — voir Onglets.js.
          L'ancien balisage les mettait tous en rangée sans jamais prévoir le
          repli : sur un petit écran, « Mot de passe » se coupait en deux
          lignes et « Mon avis » sortait du cadre. Le composant partagé gère
          déjà ce cas, avec la même bascule que l'administration. */}
      <Onglets
        items={ongletsAffiches}
        actif={onglet}
        onChoisir={changerOnglet}
        etiquette="Section du compte"
      />

      {error && <div className="alert">{error}</div>}
      {succes && <div className="alert alert--succes">{succes}</div>}

      {onglet === 'infos' && (
        <>
          <Informations
            parent={parent}
            compte={compte}
            saving={saving}
            onEnregistrer={(donnees) => dispatch(enregistrerProfil(donnees))}
          />

          {/* SOUS « MES INFORMATIONS », ET NON SOUS « MOT DE PASSE ».
              Deux raisons. Supprimer son compte n'est pas une affaire de
              mot de passe : c'est le compte entier qui s'en va, pas le moyen
              d'y entrer. Et surtout, l'onglet « Mot de passe » NE S'OUVRE PAS
              pour un compte Google — il affiche une explication et reste en
              place. La suppression y aurait été purement inatteignable pour
              tous ceux qui se connectent avec Google, c'est-à-dire ceux qui
              n'ont aucun mot de passe à changer. */}
          <SuppressionCompte
            nombreEnfants={liste.length}
            onSupprime={() => {
              // Déconnexion après coup, et pas avant : elle jette le jeton, et
              // les deux appels de suppression en ont besoin.
              dispatch(logout());
              navigate('/', { replace: true });
            }}
          />
        </>
      )}

      {onglet === 'forfait' && <Quota />}

      {onglet === 'avis' && (
        <div className="bloc-profil">
          <h2>Votre avis sur Mimia</h2>
          <p className="bloc-profil__intro">
            Il apparaîtra sur la page d’accueil, signé de votre prénom et de
            votre rôle (Parent ou Étudiant), après relecture.
          </p>
          <MonAvis />
        </div>
      )}

      {onglet === 'securite' && (
        <Securite
          compte={compte}
          saving={saving}
          succes={succes}
          onChanger={(donnees) => dispatch(changerMotDePasse(donnees))}
        />
      )}

      {onglet === 'enfants' && (
        <div className="bloc-profil">
          {liste.length === 0 ? (
            <div className="vide">
              <p>Aucun profil enfant pour l'instant.</p>
              {!complet && (
                <Link to="/eleves/nouveau" className="btn">
                  Créer le premier profil
                </Link>
              )}
            </div>
          ) : (
            <>
              <ul className="enfants-liste">
                {liste.map((eleve) => (
                  <LigneEnfant
                    key={eleve.id}
                    eleve={eleve}
                    niveaux={niveaux}
                    academies={academies}
                    saving={submitting}
                    onEnregistrer={(donnees) => dispatch(submitEleve(donnees))}
                    onVoirFiche={voirFiche}
                    onRetirer={(cible) => setARetirer({ eleve: cible, dejaRetire: false })}
                  />
                ))}
              </ul>

              {/* Le bouton disparaît quand la formule est pleine — c'est ce
                  qu'il faisait déjà sur la page « Vos enfants », mais pas ici :
                  cet onglet ne demandait pas la capacité, il proposait donc un
                  formulaire voué au refus. */}
              {!complet && (
                <Link to="/eleves/nouveau" className="btn-ghost btn-ajouter-enfant">
                  Ajouter un enfant
                </Link>
              )}
            </>
          )}

          {complet && <QuotaEnfants capacite={capacite} />}

          {/* Les profils retirés, en dessous et en retrait : ils ne doivent pas
              peser sur la liste des enfants actifs, mais un parent qui a retiré
              le mauvais profil doit pouvoir le retrouver sans écrire au
              support. */}
          {archives.length > 0 && (
            <section className="archives">
              <h3 className="archives__titre">Profils retirés</h3>

              <ul className="enfants-liste">
                {archives.map((eleve) => (
                  <li key={eleve.id} className="enfant-ligne enfant-ligne--archive">
                    <div className="enfant-ligne__entete">
                      <span className="enfant-ligne__initiale">
                        {eleve.prenom?.charAt(0)?.toUpperCase()}
                      </span>

                      <span className="enfant-ligne__identite">
                        <strong>{eleve.prenom} {eleve.nom}</strong>
                        <span>{eleve.niveauLibelle} · retiré le {date(eleve.archiveLe)}</span>
                      </span>

                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini btn-ghost--accent"
                        onClick={async () => {
                          await restaurerEleve(eleve.id);
                          dispatch(chargerEleves());
                          rechargerArchives();
                          getCapaciteEnfants()
                            .then(({ data }) => setCapacite(data))
                            .catch(() => {});
                        }}
                      >
                        Remettre
                      </button>

                      {/* Ce profil est DÉJÀ retiré : la fenêtre s'ouvre
                          directement sur l'effacement. Lui proposer d'abord un
                          retrait offrirait un bouton sans effet, la place étant
                          libre depuis longtemps. */}
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini btn-ghost--danger"
                        onClick={() => setARetirer({ eleve, dejaRetire: true })}
                      >
                        Supprimer les données
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="archives__note">
                Un profil retiré ne compte plus dans votre formule et conserve tout son
                historique. Le remettre le rend accessible immédiatement.
              </p>
            </section>
          )}
        </div>
      )}

      {onglet === 'parametres' && <Parametres />}
    </section>
    </>
  );
}
