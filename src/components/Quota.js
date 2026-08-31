import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getMonQuota,
  getOffres,
  mettreEnPause,
  rattraperPaiement,
  reprendre,
  resilier,
  annulerResiliation,
  annulerChangement,
  ouvrirPortail,
  recharger,
} from '../lib/api/abonnementApi';
import Loader from './Loader';

/**
 * L'état du forfait de la famille.
 *
 * Tout est exprimé en HEURES, jamais en minutes ni en tokens. Un parent lit
 * « il reste 4 h 30 » d'un coup d'œil ; « il reste 270 minutes » lui demande un
 * calcul, et « 1,2 million de tokens » ne lui dit rien du tout.
 */

const euros = (centimes) =>
  (centimes / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
  });

const dateCourte = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : '';

/**
 * Fin de la pause qu'on s'apprête à poser.
 *
 * Calculée ici plutôt que lue sur l'abonnement : `pauseJusquau` n'existe pas
 * encore au moment où l'on demande confirmation, et annoncer une date après
 * coup ne sert plus à rien.
 */
const dansUnMois = () => {
  const fin = new Date();
  fin.setDate(fin.getDate() + 30);
  return fin;
};

/** « 4 h 30 », « 45 min », « 0 h ». Jamais « 4.5 heures ». */
export function heures(minutes) {
  if (!minutes || minutes <= 0) return '0 h';

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/** Jauge de consommation. Le seuil colore, il n'alarme pas trop tôt. */
function Jauge({ part }) {
  const niveau = part >= 1 ? 'plein' : part >= 0.8 ? 'haut' : 'normal';

  return (
    <span className="quota-jauge">
      <span
        className={`quota-jauge__remplissage quota-jauge__remplissage--${niveau}`}
        style={{ width: `${Math.round(Math.min(1, part) * 100)}%` }}
      />
    </span>
  );
}

/**
 * Confirmation avant une action qu'on ne peut pas défaire d'un clic.
 *
 * Générique parce que les deux cas — acheter des heures, mettre en pause —
 * demandent exactement la même chose : redire ce qui va se passer, lister les
 * conséquences, et laisser une porte de sortie. Deux fenêtres séparées auraient
 * fini par diverger.
 */
function Confirmation({ titre, resume, consequences, libelle, enCours, onConfirmer, onAnnuler }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-confirmation">
      <div className="modale__boite">
        <h2 id="titre-confirmation">{titre}</h2>

        <p className="modale__texte">{resume}</p>

        <ul className="achat-details">
          {consequences.map((ligne) => (
            <li key={ligne}>{ligne}</li>
          ))}
        </ul>

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onAnnuler} disabled={enCours}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn--compact"
            onClick={onConfirmer}
            disabled={enCours}
          >
            {enCours ? 'Un instant…' : libelle}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Quota({ compact = false }) {
  const [etat, setEtat] = useState(null);
  const [packs, setPacks] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [action, setAction] = useState(null);
  const [erreur, setErreur] = useState(null);

  // La grille des formules, chargée avec les packs. Elle ne sert qu'à savoir
  // si l'abonnement en cours est l'essai — voir `enEssai` plus bas.
  const [formules, setFormules] = useState([]);

  // Pack en attente de confirmation. Un achat ne part jamais sur un seul clic.
  const [aAcheter, setAAcheter] = useState(null);
  const [pauseAConfirmer, setPauseAConfirmer] = useState(false);
  const [resiliationAConfirmer, setResiliationAConfirmer] = useState(false);

  /**
   * Le parent revient de la page de paiement.
   *
   * Stripe le renvoie sur `/profil?paiement=ok`. On en profite pour demander
   * au serveur de rattraper l'abonnement si le webhook ne l'a pas fait — sans
   * ça, un webhook perdu laisse quelqu'un qui vient de payer devant son
   * ancienne formule, sans explication et sans recours.
   */
  const retourDePaiement =
    new URLSearchParams(useLocation().search).get('paiement') === 'ok';

  const charger = useCallback(async () => {
    try {
      // Au retour du paiement on passe par le rattrapage, qui rend le même
      // état — un appel au lieu de deux. Ailleurs, la simple lecture suffit :
      // interroger Stripe à chaque affichage du forfait serait un aller-retour
      // de plus pour une question qui a déjà sa réponse en base.
      const { data, status } = retourDePaiement
        ? await rattraperPaiement()
        : await getMonQuota();

      // 204 : le parent n'a pas encore d'abonnement. Ce n'est pas une erreur,
      // c'est l'état normal d'un compte qui vient d'être créé.
      setEtat(status === 204 ? null : data);
    } catch {
      setErreur("Votre forfait n'a pas pu être chargé.");
    } finally {
      setChargement(false);
    }
  }, [retourDePaiement]);

  useEffect(() => {
    charger();

    getOffres()
      .then(({ data }) => {
        setPacks(data.recharges ?? []);
        setFormules(data.formules ?? []);
      })
      .catch(() => {
        // Sans les packs, le bouton de recharge n'apparaît pas. Le reste de
        // l'affichage n'en dépend pas.
      });
  }, [charger]);

  const executer = async (nom, appel) => {
    setAction(nom);
    setErreur(null);

    try {
      const { data } = await appel();

      // DEUX SORTIES, COMME SUR LA PAGE DES TARIFS.
      //
      // Un achat d'heures répond une adresse de paiement : rien n'est encore
      // crédité, et c'est le webhook qui ajoutera les heures quand Stripe aura
      // encaissé. Les comptes exemptés, eux, n'ont pas de caisse à passer et
      // répondent directement l'état du quota.
      //
      // Sans ce test, on affichait l'objet de paiement comme s'il était un
      // quota : le parent voyait ses heures disparaître de l'écran, et croyait
      // avoir perdu son forfait.
      if (data?.urlPaiement) {
        // `replace` et non `assign` : le retour arrière depuis la page de
        // paiement doit ramener au forfait, pas relancer une caisse.
        window.location.replace(data.urlPaiement);
        return;
      }

      setEtat(data);
    } catch (e) {
      setErreur(
        e?.response?.data?.message ?? "L'opération n'a pas abouti. Réessayez dans un instant.",
      );
    } finally {
      setAction(null);
    }
  };

  if (chargement) return <Loader texte="Chargement de votre forfait…" />;

  if (!etat) {
    return (
      <div className="quota quota--vide">
        <div>
          <strong>Aucun forfait en cours</strong>
          <p>
            Choisissez une formule pour que vos enfants puissent travailler avec
            leurs professeurs.
          </p>
        </div>

        <Link to="/tarifs" className="btn btn--compact">
          Voir les formules
        </Link>
      </div>
    );
  }

  /**
   * L'abonnement en cours est-il l'essai gratuit ?
   *
   * Trois choses de cette carte n'ont aucun sens pour un essai, et deux
   * étaient carrément fausses — voir leurs emplacements respectifs. Il fallait
   * donc pouvoir le distinguer.
   *
   * DEUX SOURCES. Le serveur le dit (`estEssai`), mais ce champ est récent :
   * une API pas encore redémarrée n'envoie rien. La grille des formules, déjà
   * chargée ici pour les packs, porte la même information. Une carte dont
   * l'exactitude dépend d'un déploiement synchronisé se trompera pendant toute
   * la fenêtre où les deux ne le sont pas.
   */
  const enEssai = etat.estEssai
    ?? formules.find((f) => f.code === etat.offreCode)?.estEssai
    ?? false;

  return (
    <div className="quota">
      {aAcheter && (
        <Confirmation
          titre={`Ajouter ${heures(aAcheter.minutes)} à votre forfait ?`}
          resume={
            <>
              Vous allez acheter <strong>{heures(aAcheter.minutes)} de cours supplémentaires</strong>{' '}
              pour <strong>{euros(aAcheter.prixCentimes)}</strong>.
            </>
          }
          consequences={[
            'Vous allez être redirigé vers le paiement sécurisé.',
            'Les heures sont ajoutées dès l’encaissement, en quelques secondes.',
            `Elles sont valables jusqu’au ${dateCourte(etat.periodeFin)}.`,
            'Les heures non utilisées ne se reportent pas au mois suivant.',
          ]}
          libelle={`Confirmer — ${euros(aAcheter.prixCentimes)}`}
          enCours={action === aAcheter.code}
          onAnnuler={() => setAAcheter(null)}
          onConfirmer={async () => {
            await executer(aAcheter.code, () => recharger(aAcheter.code));
            setAAcheter(null);
          }}
        />
      )}

      {/* Résilier n'est pas dangereux — l'accès court jusqu'au bout de la
          période et la décision s'annule — mais c'est une décision. On dit donc
          exactement ce qui se passe, plutôt que d'effrayer pour retenir. */}
      {resiliationAConfirmer && (
        <Confirmation
          titre="Résilier votre abonnement ?"
          resume={
            <>
              Vos cours continuent normalement jusqu'au{' '}
              <strong>{dateCourte(etat.periodeFin)}</strong>. Aucune nouvelle
              période ne sera engagée après cette date.
            </>
          }
          consequences={[
            'Vous gardez vos heures restantes jusqu’à la fin de la période déjà payée.',
            'Aucun frais, aucun motif à donner.',
            'Vous pouvez revenir sur cette décision tant que la période court.',
            'Après cette date, fiches et évaluations restent consultables ; les cours s’arrêtent.',
          ]}
          libelle="Confirmer la résiliation"
          enCours={action === 'resilier'}
          onAnnuler={() => setResiliationAConfirmer(false)}
          onConfirmer={async () => {
            await executer('resilier', resilier);
            setResiliationAConfirmer(false);
          }}
        />
      )}

      {/* La pause bloque TOUS les enfants pendant un mois et ne se reprend pas
          avant un an. C'est irréversible à l'échelle de l'année : ça ne peut
          pas partir sur un clic mal placé. */}
      {pauseAConfirmer && (
        <Confirmation
          titre="Mettre votre abonnement en pause ?"
          resume={
            <>
              Vos cours seront suspendus pendant <strong>un mois</strong>, jusqu’au{' '}
              <strong>{dateCourte(dansUnMois())}</strong>.
            </>
          }
          consequences={[
            'Aucun de vos enfants ne pourra suivre de cours pendant la pause.',
            'Vous ne perdez rien : la date de renouvellement est décalée d’autant.',
            'Vous pouvez reprendre à tout moment, sans attendre la fin du mois.',
            'Ce droit est offert une fois par an — vous ne pourrez pas remettre en pause avant douze mois.',
          ]}
          libelle="Mettre en pause"
          enCours={action === 'pause'}
          onAnnuler={() => setPauseAConfirmer(false)}
          onConfirmer={async () => {
            await executer('pause', mettreEnPause);
            setPauseAConfirmer(false);
          }}
        />
      )}

      <header className="quota__entete">
        <div>
          <strong className="quota__offre">{etat.offreLibelle}</strong>
          <span className="quota__periode">
            {/* UN ESSAI NE SE RENOUVELLE PAS, IL S'ARRÊTE.
                « Renouvellement le 15 août » annonçait à un parent en essai
                une reconduction qui n'aura jamais lieu — et lui laissait
                craindre un prélèvement là où il n'y a pas de carte. */}
            {/* UNE SEULE PHRASE, ET ELLE DOIT ÊTRE VRAIE.
                L'en-tête annonçait « Renouvellement le 8 septembre » pendant
                que le bandeau juste dessous disait « votre abonnement prend
                fin le 8 septembre ». Deux affirmations contraires dans le même
                encadré, sur la même date : impossible de savoir laquelle
                croire. Le renouvellement n'est annoncé que lorsqu'il aura
                vraiment lieu. */}
            {etat.enPause
              ? `En pause jusqu'au ${dateCourte(etat.pauseJusquau)}`
              : enEssai || etat.resiliationDemandee
                ? `Se termine le ${dateCourte(etat.periodeFin)}`
                : `Renouvellement le ${dateCourte(etat.periodeFin)}`}
          </span>
        </div>

        {/* Le chiffre que le parent vient chercher. Trois états plutôt qu'un
            seuil binaire : « il reste peu » doit se voir AVANT d'arriver à
            zéro, sinon l'information ne sert plus qu'à constater. */}
        <span
          className={`quota__restant quota__restant--${
            etat.minutesRestantes === 0
              ? 'vide'
              : etat.partConsommee >= 0.8
                ? 'bas'
                : 'normal'
          }`}
        >
          <strong>{heures(etat.minutesRestantes)}</strong>
          <span>{etat.minutesRestantes === 0 ? 'plus d’heures' : 'restantes'}</span>
        </span>
      </header>

      <Jauge part={etat.partConsommee} />

      <p className="quota__resume">
        {heures(etat.minutesConsommees)} utilisées sur {heures(etat.minutesAllouees)}
        {etat.minutesRecharge > 0 && (
          <span className="quota__bonus"> · dont {heures(etat.minutesRecharge)} rechargées</span>
        )}
      </p>

      {erreur && <div className="alert">{erreur}</div>}

      {/* Le détail par enfant : c'est ce qui permet au parent de voir QUI
          consomme, et de comprendre pourquoi le pot descend vite. */}
      {!compact && etat.enfants.length > 0 && (
        <ul className="quota-enfants">
          {etat.enfants.map((enfant) => (
            <li key={enfant.eleveId}>
              <span className="quota-enfants__nom">{enfant.prenom}</span>
              <Jauge part={enfant.partConsommee} />
              <span className="quota-enfants__valeur">
                {heures(enfant.minutesConsommees)} / {heures(enfant.minutesPlafond)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Plus d'enfants que la formule n'en couvre. Le dire franchement : sans
          ça le parent voit trois enfants avec chacun son plafond et croit
          disposer du triple d'heures. */}
      {/* Pas de bouton ici : « Changer de formule » vit en permanence dans la
          barre d'actions plus bas. En remettre un ici ferait deux chemins vers
          la même page sur une seule carte. */}
      {!compact && etat.enfants.length > etat.nombreEnfantsMax && (
        <div className="quota__avertissement">
          <p>
            Votre formule couvre {etat.nombreEnfantsMax} enfant
            {etat.nombreEnfantsMax > 1 ? 's' : ''} et vous en avez{' '}
            {etat.enfants.length}.{' '}
            {etat.nombreEnfantsMax === 1
              ? 'Le premier à travailler ce mois-ci utilisera le forfait'
              : `Les ${etat.nombreEnfantsMax} premiers à travailler ce mois-ci utiliseront le forfait`}
             ; les autres seront bloqués.
          </p>
        </div>
      )}

      {/* L'IMPAYÉ SE DIT AVANT L'ÉCHÉANCE, PAS APRÈS.
          Un parent prévenu met sa carte à jour en deux minutes ; un parent qui
          découvre son compte bloqué écrit au support, et son enfant a raté sa
          séance entre-temps. On annonce donc dès le premier refus, alors que
          rien n'est encore coupé — et on donne le bouton qui règle le problème,
          pas seulement la mauvaise nouvelle. */}
      {!compact && etat.impaye && (
        <div className="quota-impaye">
          <p>
            <strong>Un prélèvement n'est pas passé.</strong> Vos heures restent
            disponibles jusqu'au {dateCourte(etat.periodeFin)}, mais votre forfait ne
            sera pas renouvelé tant que la carte n'est pas à jour.
          </p>
          <button
            type="button"
            className="btn btn--compact"
            onClick={async () => {
              try {
                const { data } = await ouvrirPortail();
                if (data?.urlPortail) window.location.assign(data.urlPortail);
              } catch {
                setErreur("La page de facturation n'a pas pu être ouverte.");
              }
            }}
            disabled={action !== null}
          >
            Mettre ma carte à jour
          </button>
        </div>
      )}

      {/* LE CHANGEMENT PROGRAMMÉ SE DIT, ET SE DÉFAIT.
          Une descente de gamme ne s'applique qu'au renouvellement — le parent
          garde jusque-là les heures qu'il a payées. Mais s'il l'oubliait, il
          découvrirait un mois plus tard un pot rétréci sans savoir pourquoi.
          D'où l'annonce, la date, et le moyen de revenir dessus. */}
      {!compact && etat.offrePrevueCode && (
        <div className="quota-programme">
          <p>
            Vous passerez à la formule <strong>{etat.offrePrevueLibelle}</strong>
            {etat.changementPrevuLe && <> le <strong>{dateCourte(etat.changementPrevuLe)}</strong></>}.
            D'ici là vous gardez {etat.offreLibelle} et toutes ses heures.
          </p>
          <button
            type="button"
            className="btn btn--fantome btn--compact"
            onClick={() => executer('annuler-changement', annulerChangement)}
            disabled={action !== null}
          >
            {action === 'annuler-changement'
              ? 'Un instant…'
              : `Finalement, je reste en ${etat.offreLibelle}`}
          </button>
        </div>
      )}

      {/* Achat d'heures. Une section à part, titrée et expliquée : les boutons
          étaient collés aux autres actions et rien ne disait qu'ils engageaient
          une dépense. On ne fait pas payer quelqu'un par surprise.

          RIEN À VENDRE PENDANT L'ESSAI. Ces heures sont valables « jusqu'à la
          fin de la période en cours » — pour un essai, c'est sept jours, et il
          n'y a pas d'abonnement derrière pour en profiter ensuite. On
          proposait donc quinze euros d'heures qui expirent avec l'essai, à
          quelqu'un qui n'a pas encore décidé de rester. Ce qu'il faut lui
          proposer à ce moment-là, c'est une formule. */}
      {!compact && !enEssai && packs.length > 0 && (
        <section className="quota-achat">
          <h3>Ajouter des heures</h3>
          <p className="quota-achat__explication">
            Une semaine de révisions, un contrôle qui approche : vous pouvez acheter
            des heures en plus sans changer de formule. Elles s'ajoutent au forfait
            en cours et restent valables jusqu'au {dateCourte(etat.periodeFin)}.
          </p>

          <div className="quota-achat__packs">
            {packs.map((pack) => (
              <button
                key={pack.code}
                type="button"
                className="pack"
                onClick={() => setAAcheter(pack)}
                disabled={action !== null}
              >
                <span className="pack__heures">+{heures(pack.minutes)}</span>
                <span className="pack__prix">{euros(pack.prixCentimes)}</span>
                <span className="pack__mention">achat unique</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Résiliation demandée : on l'annonce clairement, avec la date jusqu'à
          laquelle tout continue, et le chemin pour revenir en arrière. Un
          parent qui se ravise ne doit pas avoir à re-souscrire — il repaierait
          une période déjà réglée. */}
      {!compact && etat.resiliationDemandee && (
        <div className="quota__resiliation">
          <p>
            <strong>Votre abonnement prend fin le {dateCourte(etat.finPrevue)}.</strong>{' '}
            D'ici là, rien ne change&nbsp;: vos enfants gardent leurs cours et vos
            heures restantes. Aucune nouvelle période ne sera engagée.
          </p>
          <button
            type="button"
            className="btn btn--fantome btn--compact"
            onClick={() => executer('annuler-resiliation', annulerResiliation)}
            disabled={action !== null}
          >
            {action === 'annuler-resiliation' ? 'Un instant…' : 'Finalement, je continue'}
          </button>
        </div>
      )}

      {!compact && (
        <div className="quota__actions">
          {/* Toujours présent, et en premier : changer de formule est l'action
              qui engage le plus, et un parent ne doit pas avoir à attendre un
              avertissement pour la trouver. */}
          <Link to="/tarifs" className="btn btn--compact">
            Changer de formule
          </Link>

          {etat.enPause ? (
            <button
              type="button"
              className="btn-pause btn-pause--reprise"
              onClick={() => executer('reprendre', reprendre)}
              disabled={action !== null}
            >
              {action === 'reprendre' ? 'Un instant…' : 'Reprendre maintenant'}
            </button>
          ) : (
            etat.pauseDisponible && (
              <button
                type="button"
                className="btn-pause"
                onClick={() => setPauseAConfirmer(true)}
                disabled={action !== null}
                title="Un mois de pause offert par an"
              >
                Mettre en pause un mois
              </button>
            )
          )}

          {/* La résiliation vit ICI, à côté des autres actions, et non cachée
              au fond du profil. C'est ce qu'exige l'article L215-1-1 du Code de
              la consommation : arrêter doit être aussi simple que souscrire.
              Discrète en revanche — c'est une sortie, pas une invitation.

              PAS PENDANT L'ESSAI, EN REVANCHE. Il n'y a rien à résilier : pas
              de carte, pas de prélèvement, pas de reconduction tacite — il
              s'arrête tout seul au bout des sept jours. Le bouton faisait
              croire à un engagement, sur l'écran même qui devait rassurer
              quelqu'un qui n'a pas encore payé. Et l'obligation légale ne s'y
              applique pas : elle vise la reconduction des contrats payants.
              Un parent qui veut vraiment partir a « Supprimer mon compte ». */}
          {!etat.resiliationDemandee && !enEssai && (
            <button
              type="button"
              className="quota__lien-resilier"
              onClick={() => setResiliationAConfirmer(true)}
              disabled={action !== null}
            >
              Résilier mon abonnement
            </button>
          )}
        </div>
      )}

      {/* CETTE PHRASE MENTAIT EN ESSAI.
          Le droit de pause est indisponible pour DEUX raisons distinctes :
          il a déjà été pris cette année, ou l'offre est l'essai — qui n'y
          donne pas droit du tout. La condition ne regardait que le résultat,
          et annonçait donc à un parent inscrit de la veille qu'il avait
          consommé un droit auquel il n'a jamais eu accès. On ne se contente
          pas de retirer la phrase en essai : mettre en pause une offre de sept
          jours n'a de toute façon aucun sens à évoquer. */}
      {!compact && !enEssai && !etat.pauseDisponible && !etat.enPause && (
        <p className="quota__mention">
          Votre mois de pause a déjà été utilisé cette année.
        </p>
      )}
    </div>
  );
}
