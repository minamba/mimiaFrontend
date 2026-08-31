import { Link } from 'react-router-dom';

/**
 * Politique de confidentialité et RGPD.
 *
 * ELLE DÉCRIT CE QUE LE CODE FAIT, PAS UN MODÈLE
 * ----------------------------------------------
 * Chaque durée, chaque destinataire et chaque transfert écrits ici a été relevé
 * dans l'application : les douze mois viennent de `DatePurge`, appliquée par le
 * worker de purge ; les sous-traitants viennent des services réellement
 * appelés. Une politique recopiée d'ailleurs décrirait un autre produit, et
 * mentirait aux parents sur les données de leurs enfants.
 *
 * Toute évolution du traitement doit être répercutée ici le même jour.
 */
export default function Confidentialite() {
  return (
    <article className="legal">
      <header className="legal__entete">
        <p className="legal__surtitre">RGPD</p>
        <h1 className="legal__titre">Confidentialité</h1>
        <p className="legal__maj">Dernière mise à jour&nbsp;: 6 août 2026</p>
      </header>

      <section className="legal__section">
        <p>
          Mimia est utilisé par des enfants. Cette page dit exactement quelles
          données nous conservons, combien de temps, qui d'autre y accède, et
          comment vous en reprenez le contrôle. Elle est écrite pour être lue,
          pas pour être opposée.
        </p>
      </section>

      <section className="legal__section">
        <h2>Qui est responsable</h2>
        <p>
          Le responsable du traitement est <strong>Minanba Camara</strong>,
          entrepreneur individuel exerçant sous le nom commercial
          «&nbsp;Mins&nbsp;Corp&nbsp;», 2&nbsp;rue Jules Vallès,
          91000&nbsp;Évry-Courcouronnes.
        </p>
        <p>
          Pour toute question ou demande&nbsp;:{' '}
          <a href="mailto:support@mimia.fr">support@mimia.fr</a>, ou le{' '}
          <Link to="/contact">formulaire de contact</Link>.
        </p>
      </section>

      <section className="legal__section">
        <h2>Ce que nous collectons</h2>

        <h3>Du parent</h3>
        <ul>
          <li>Prénom, nom, adresse e-mail</li>
          <li>Formule souscrite, historique de paiement</li>
          <li>Date de création du compte</li>
        </ul>

        <h3>De l'enfant</h3>
        <ul>
          <li>Prénom, nom, âge, sexe, classe</li>
          <li>
            <strong>Le contenu des séances</strong>&nbsp;: ce que l'enfant écrit
            ou dit, et ce que le professeur lui répond
          </li>
          <li>Ses fiches de révision, ses évaluations, les comptes rendus de séance</li>
          <li>Sa progression&nbsp;: les compétences travaillées et leur niveau de maîtrise</li>
          <li>Le temps de cours consommé</li>
        </ul>

        <p>
          Nous ne demandons ni adresse postale, ni date de naissance exacte, ni
          numéro de téléphone, ni établissement scolaire. Nous n'utilisons aucun
          traceur publicitaire et ne pratiquons aucun profilage commercial.
        </p>
      </section>

      <section className="legal__section">
        <h2>La voix de votre enfant</h2>
        <p>
          C'est le point le plus sensible, et nous préférons l'écrire noir sur
          blanc plutôt que le noyer dans un tableau.
        </p>
        <p>
          Quand votre enfant parle au professeur, <strong>son audio est
          transmis à OpenAI</strong> pour être transcrit en texte, et le texte
          de la réponse y est renvoyé pour être lu à voix haute. Ces
          transmissions ont lieu pendant la séance, en direct.
        </p>
        <p>
          <strong>Nous n'enregistrons aucun fichier audio.</strong> La voix
          n'est ni stockée sur nos serveurs, ni conservée après la séance&nbsp;:
          seule la transcription en texte est gardée, comme le serait un message
          écrit au clavier.
        </p>
        <p>
          Un enfant peut travailler entièrement au clavier. Dans ce cas, aucune
          donnée audio n'est produite ni transmise.
        </p>
      </section>

      <section className="legal__section">
        <h2>Les documents que votre enfant envoie</h2>
        <p>
          Votre enfant peut photographier son exercice ou envoyer un PDF pour
          que le professeur le lise. Ces documents méritent la même franchise
          que la voix&nbsp;: ce sont souvent des copies portant son nom, celui
          de son établissement, parfois son écriture.
        </p>
        <p>
          Le document est <strong>enregistré sur nos serveurs</strong>, dans la
          même base que la conversation, et <strong>transmis à Anthropic</strong>{' '}
          avec le message auquel il est joint, puis à chaque tour de la séance
          tant qu'il reste dans la mémoire immédiate du professeur. C'est ce qui
          lui permet de continuer à s'y référer sans que votre enfant ait à le
          renvoyer.
        </p>
        <p>
          Nous n'acceptons que les images et les PDF, cinq mégaoctets et dix
          pages au maximum. Un document déposé puis jamais envoyé est effacé
          dans les vingt-quatre heures.
        </p>
        <p>
          <strong>L'image elle-même n'est conservée que trois jours.</strong>{' '}
          Passé ce délai, elle est effacée automatiquement et seul son contenu
          relevé en texte subsiste — l'énoncé de l'exercice, pas la photo. Le
          professeur peut ainsi se souvenir de ce sur quoi vous avez travaillé
          sans que nous gardions l'écriture de votre enfant.
        </p>
        <p>
          Ce texte suit ensuite le sort de la conversation&nbsp;: il est effacé
          en même temps qu'elle, au bout de douze mois — ou immédiatement si
          vous nous le demandez.
        </p>
        <p>
          Les documents ne sont lisibles que depuis votre compte. Ils ne portent
          pas d'adresse publique&nbsp;: une image ne s'affiche qu'après
          vérification de votre session.
        </p>
        <p>
          Cette fonctionnalité est facultative. Un enfant peut travailler
          entièrement sans jamais envoyer de document.
        </p>
      </section>

      <section className="legal__section">
        <h2>Pourquoi, et sur quelle base</h2>
        <ul>
          <li>
            <strong>Fournir les cours</strong> — exécution du contrat qui nous
            lie au parent.
          </li>
          <li>
            <strong>Suivre la progression et envoyer le bilan hebdomadaire</strong>{' '}
            — exécution du contrat&nbsp;: c'est l'objet même du service.
          </li>
          <li>
            <strong>Facturer et prévenir de la fin du quota</strong> — exécution
            du contrat et obligations comptables.
          </li>
          <li>
            <strong>Assurer la sécurité et prévenir les abus</strong> — intérêt
            légitime.
          </li>
        </ul>
        <p>
          L'enfant n'ouvre pas de compte lui-même. C'est le parent, titulaire de
          l'autorité parentale, qui crée son profil et consent au traitement —
          conformément à l'article&nbsp;8 du RGPD pour les mineurs de moins de
          quinze ans.
        </p>
      </section>

      <section className="legal__section">
        <h2>Qui d'autre y accède</h2>
        <p>
          Nous ne vendons ni ne louons aucune donnée. Nous faisons appel aux
          prestataires suivants, et à eux seuls&nbsp;:
        </p>

        <div className="legal__tableau">
          <table>
            <thead>
              <tr>
                <th>Prestataire</th>
                <th>Ce qui lui est transmis</th>
                <th>Où</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Anthropic (Claude)</td>
                <td>Prénom de l'enfant, sa classe, le contenu du dialogue</td>
                <td>Hors&nbsp;UE</td>
              </tr>
              <tr>
                <td>OpenAI</td>
                <td>L'audio de la voix, le texte à lire à voix haute</td>
                <td>Hors&nbsp;UE</td>
              </tr>
              <tr>
                <td>Stripe</td>
                <td>Données de paiement du parent</td>
                <td>UE et hors&nbsp;UE</td>
              </tr>
              <tr>
                <td>Google</td>
                <td>Identité, si vous choisissez la connexion Google</td>
                <td>Hors&nbsp;UE</td>
              </tr>
              <tr>
                <td>LWS</td>
                <td>Adresse e-mail du parent, contenu des messages envoyés</td>
                <td>France</td>
              </tr>
              <tr>
                <td>IONOS</td>
                <td>Hébergement du serveur et de la base de données</td>
                <td>France</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Les transferts hors Union européenne s'appuient sur les clauses
          contractuelles types de la Commission européenne, prévues aux contrats
          de sous-traitance de ces prestataires.
        </p>
        <p>
          Vos données ne sont utilisées par aucun de ces prestataires pour
          entraîner leurs modèles, conformément aux conditions applicables aux
          usages professionnels de leurs interfaces de programmation.
        </p>
      </section>

      <section className="legal__section">
        <h2>Combien de temps nous conservons</h2>

        <div className="legal__tableau">
          <table>
            <thead>
              <tr>
                <th>Donnée</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Échanges verbatim des séances</td>
                <td><strong>12 mois</strong>, puis effacement automatique</td>
              </tr>
              <tr>
                <td>Fiches, évaluations, comptes rendus, progression</td>
                <td>Durée de vie du compte</td>
              </tr>
              <tr>
                <td>Compte parent et profils enfants</td>
                <td>Jusqu'à suppression par le parent</td>
              </tr>
              <tr>
                <td>Enfant retiré du compte</td>
                <td>Archivé, puis anonymisé à la demande</td>
              </tr>
              <tr>
                <td>Pièces comptables</td>
                <td>10 ans (article L123-22 du Code de commerce)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          La distinction entre les deux premières lignes est volontaire. Les
          <strong> paroles</strong> échangées pendant un cours s'effacent au bout
          d'un an&nbsp;: elles n'ont pas à survivre à leur utilité. Les{' '}
          <strong>travaux</strong> qui en sortent — fiches, évaluations,
          progression — sont conservés tant que le compte existe, parce que le
          suivi d'une année sur l'autre est précisément ce que vous êtes venus
          chercher.
        </p>
      </section>

      <section className="legal__section">
        <h2>Retirer un enfant</h2>
        <p>
          Depuis votre espace, vous pouvez à tout moment&nbsp;:
        </p>
        <ul>
          <li>
            <strong>Retirer un enfant</strong> — son profil disparaît de votre
            espace, ses données sont conservées le temps que vous changiez
            d'avis.
          </li>
          <li>
            <strong>Effacer ses données</strong> — ses échanges, ses fiches et
            ses évaluations sont supprimés définitivement. Seule subsiste la
            trace anonyme du temps de cours consommé, nécessaire à la
            comptabilité.
          </li>
        </ul>
        <p>
          Cette seconde action est irréversible. Elle vous demande de taper le
          prénom de l'enfant pour confirmer&nbsp;: un clic malheureux ne doit pas
          détruire deux ans de travail.
        </p>
      </section>

      {/* CE QUE LA SUPPRESSION DE COMPTE EMPORTE, ET CE QU'ELLE LAISSE.
          Cette section manquait. Le mail de confirmation affirme « il ne reste
          rien » — c'est presque vrai, et « presque » n'est pas une formulation
          acceptable en matière de données personnelles. Ce qui subsiste est
          énuméré, avec sa raison d'être. */}
      <section className="legal__section">
        <h2>Supprimer votre compte</h2>
        <p>
          Depuis <strong>Mon compte&nbsp;› Mes informations</strong>, vous pouvez
          supprimer l'ensemble du compte. C'est définitif et immédiat&nbsp;: nous
          n'avons aucun moyen de revenir en arrière, y compris si vous nous le
          demandez.
        </p>
        <p>Sont effacés de nos serveurs&nbsp;:</p>
        <ul>
          <li>Les profils de vos enfants, leur âge, leur classe.</li>
          <li>
            Tous leurs cours et l'intégralité de ce qu'ils y ont écrit ou dit.
          </li>
          <li>
            Leurs évaluations, leurs copies, les comptes rendus de séance et
            leurs fiches de révision.
          </li>
          <li>Leur progression et leurs compétences acquises.</li>
          <li>Vos identifiants de connexion.</li>
        </ul>
        <p>
          Votre abonnement est résilié auprès de notre prestataire de paiement
          dans le même mouvement&nbsp;: aucun prélèvement ne peut survivre à la
          suppression du compte.
        </p>

        <h3>Ce qui subsiste, et pourquoi</h3>
        <ul>
          <li>
            <strong>Les factures déjà émises</strong> — le code de commerce nous
            impose de les conserver dix ans. Elles portent votre nom et le
            montant réglé, rien sur vos enfants.
          </li>
          <li>
            <strong>Une empreinte de votre adresse email</strong>, si vous avez
            utilisé l'essai gratuit. Ce n'est pas votre adresse&nbsp;: c'est une
            suite de caractères calculée à partir d'elle, dont on ne peut pas
            revenir en arrière. Elle ne permet ni de vous contacter, ni de savoir
            qui vous êtes&nbsp;; elle sert uniquement à répondre à la question
            «&nbsp;cette adresse a-t-elle déjà bénéficié de l'essai&nbsp;?&nbsp;»
            si elle se réinscrit un jour. Sans elle, il suffirait de supprimer
            son compte et d'en recréer un pour obtenir des essais gratuits à
            l'infini. Cette conservation repose sur notre intérêt légitime à
            prévenir les abus, et se limite à cette seule empreinte.
          </li>
          <li>
            <strong>Le décompte anonyme du temps de cours consommé</strong>,
            nécessaire à notre comptabilité. Il n'est plus rattaché à aucun nom.
          </li>
        </ul>
        <p>
          Si vous vous réinscrivez plus tard avec la même adresse, ce sera un
          compte entièrement neuf&nbsp;: rien de ce qui précède n'y sera
          rattaché, et nous n'aurons aucun moyen de retrouver l'ancien.
        </p>
      </section>

      <section className="legal__section">
        <h2>Vos droits</h2>
        <p>
          Vous disposez, pour vous comme pour vos enfants, d'un droit d'accès,
          de rectification, d'effacement, de limitation, d'opposition et de
          portabilité.
        </p>
        <p>
          Écrivez à <a href="mailto:support@mimia.fr">support@mimia.fr</a>.
          Nous répondons sous un mois. Nous pourrons vous demander de confirmer
          votre identité&nbsp;: sans cette précaution, n'importe qui pourrait
          réclamer les données de vos enfants.
        </p>
        <p>
          Si notre réponse ne vous satisfait pas, vous pouvez saisir la
          Commission nationale de l'informatique et des libertés&nbsp;:{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>.
        </p>
      </section>

      <section className="legal__section">
        <h2>Cookies</h2>
        <p>
          Mimia n'utilise <strong>aucun cookie publicitaire ni de mesure
          d'audience</strong>. Les seules informations déposées sur votre
          appareil sont celles qui font fonctionner le site&nbsp;: votre session
          de connexion, et vos préférences d'affichage. Elles sont exemptées de
          consentement, et c'est pourquoi aucune bannière ne vous barre la route
          à l'arrivée.
        </p>
      </section>

      <section className="legal__section">
        <h2>Sécurité</h2>
        <p>
          Les échanges avec le site sont chiffrés. Les mots de passe ne sont
          jamais stockés en clair. L'accès aux données d'un enfant est réservé au
          parent qui l'a inscrit&nbsp;: aucune famille ne peut voir les données
          d'une autre.
        </p>
        <p>
          Si vous constatez une faille, écrivez-nous plutôt que de la publier —
          nous la traiterons vite et sans hostilité.
        </p>
      </section>
    </article>
  );
}
