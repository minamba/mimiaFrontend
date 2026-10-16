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
        <p className="legal__maj">Dernière mise à jour&nbsp;: 16 octobre 2026</p>
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
          <li>
            <em>Si vous le renseignez</em>, son établissement scolaire (nom,
            commune, code officiel), pour que la conseillère d'orientation
            parle des formations proches de chez lui
          </li>
          <li>
            <em>S'il en parle avec la conseillère d'orientation et qu'il est
            d'accord</em>, son projet&nbsp;: le métier ou la voie qu'il vise, et
            ce qu'il aurait à consolider pour y arriver. Ses professeurs en
            reçoivent chacun la ligne de leur matière, et vous le voyez sur sa
            fiche. Seule la conseillère le met à jour.
          </li>
          <li>
            Les <em>rapports d'orientation</em> que la conseillère écrit après
            chaque séance avec lui&nbsp;: ce qu'ils se sont dit, les pistes et
            les prochaines étapes. Votre enfant et vous les lisez&nbsp;; aucun
            professeur.
          </li>
          <li>
            <em>Si vous les cochez</em>, ses besoins particuliers&nbsp;: dyslexie,
            dyscalculie, TDAH — voir plus bas
          </li>
        </ul>

        <p>
          Nous ne demandons ni adresse postale, ni date de naissance exacte, ni
          numéro de téléphone. L'établissement scolaire est facultatif. Nous
          n'utilisons aucun traceur publicitaire et ne pratiquons aucun profilage
          commercial.
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
          <strong>Le cours importé avec un contrôle</strong> suit une règle
          encore plus courte pour l'image. Il est transmis à Anthropic pour
          être relevé en texte, et <strong>l'image est effacée dès que ce
          relevé est fait</strong> — en général dans la minute, et au plus
          tard après trois lectures en échec. Le texte reste attaché au
          contrôle, pour que le professeur prépare et corrige avec la leçon de
          votre enfant, puis il est <strong>effacé un mois après la date du
          contrôle</strong> (deux si le bilan n'a pas encore été fait), ou plus
          tôt si vous supprimez le contrôle.
        </p>
        <p>
          <strong>Les contrôles passés</strong> sont allégés au même moment&nbsp;:
          il ne reste que leur date, leur matière, leur sujet, la note et le
          ressenti de votre enfant, pour son calendrier. Ils sont
          supprimés entièrement à la fin de l'année scolaire, le 1er août.
          Ce que votre enfant a montré maîtriser, notion par notion, reste dans
          son suivi.
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

      {/* LES FICHES DE RÉVISION DE L'ÉLÈVE — 14/10/2026. Relevé dans le code :
          `CoursImporte` et ses pages (octets en base), `RedacteurFichesService`
          (transmission à Anthropic, pages en tête de chaque appel), la purge
          de `FichesDeCoursRepository` (brouillons 24 h ; pages supprimées dès que
          le cours est fini, au plus tard 24 h après sa lecture — 15/10/2026),
          `MesFichesController` (accès par le compte, rien vers les professeurs). */}
      <section className="legal__section">
        <h2>Les fiches de révision que votre enfant crée</h2>
        <p>
          Votre enfant peut importer son cours — des photos de son cahier, une
          image ou un PDF — pour en tirer des fiches de révision. Le cours est{' '}
          <strong>enregistré sur nos serveurs le temps de créer les fiches</strong> et{' '}
          <strong>transmis à Anthropic</strong>, qui le lit pour en trouver les
          notions, puis pour rédiger chaque fiche.
        </p>
        <p>
          Nous n'acceptons que les images et les PDF, cinq mégaoctets par
          fichier et vingt pages par cours. Un cours déposé mais jamais envoyé
          est effacé dans les vingt-quatre heures.
        </p>
        <p>
          <strong>Le cours n'est pas gardé</strong>&nbsp;: ses pages sont
          supprimées dès que ses fiches sont prêtes, ou dès que sa lecture
          échoue. Si votre enfant doit choisir les notions à réviser et ne le
          fait pas, elles sont supprimées vingt-quatre heures après la lecture.
          Seuls le titre du cours et la liste de ses notions restent, pour
          ranger les fiches.{' '}
          <strong>Les fiches, elles, restent</strong> tant que votre enfant ne
          les supprime pas ; il peut supprimer une fiche ou un cours entier à
          tout moment, et tout disparaît avec son profil.
        </p>
        <p>
          Ces fiches restent dans son espace&nbsp;: elles ne sont{' '}
          <strong>pas transmises à ses professeurs</strong> et n'entrent pas
          dans le suivi de ses progrès. Elles ne sont lisibles que depuis votre
          compte et celui de votre enfant.
        </p>
      </section>

      {/* LES BESOINS PARTICULIERS — 11/10/2026. Une dyslexie, une dyscalculie,
          un TDAH sont des DONNÉES DE SANTÉ (article 9 du RGPD) : leur traitement
          est interdit sauf exception, ici le consentement explicite du parent,
          donné en cochant. Tout ce qui est écrit ci-dessous a été relevé dans le
          code : `BesoinsParticuliers.cs`, `PromptsBesoins.cs`, la session de
          l'enfant (qui ne reçoit que l'affichage, jamais les cases),
          `EleveRepository` (date d'accord, effacement). */}
      <section className="legal__section">
        <h2>Les besoins particuliers de votre enfant</h2>
        <p>
          Dans le profil de votre enfant, une rubrique facultative vous permet
          d'indiquer une <strong>dyslexie</strong> (ou dysorthographie), une{' '}
          <strong>dyscalculie</strong> ou un <strong>TDAH</strong>. Ce sont des
          données de santé&nbsp;: la loi les protège plus que les autres, et nous
          aussi.
        </p>
        <p>
          <strong>Ce qu'elles changent.</strong> Le professeur adapte sa manière
          d'expliquer&nbsp;: consignes plus courtes, une étape à la fois, pas de
          reproche sur l'orthographe hors du français, et ainsi de suite. Si
          vous le laissez allumé, l'affichage s'adapte aussi&nbsp;: texte plus
          aéré, décor plus calme, séance courte conseillée. Le professeur ne
          nomme jamais le trouble devant votre enfant et ne pose aucun
          diagnostic.
        </p>
        <p>
          <strong>Votre accord.</strong> Rien n'est enregistré tant que vous ne
          cochez pas. Cocher vaut accord explicite, au sens de
          l'article&nbsp;9 du RGPD&nbsp;; nous en gardons la date. Décocher retire
          cet accord&nbsp;: les cases et leur date sont effacées sur-le-champ, et
          le professeur reprend sa manière habituelle dès la séance suivante.
        </p>
        <p>
          <strong>Le strict nécessaire.</strong> Trois cases, rien d'autre&nbsp;:
          ni certificat, ni compte rendu de bilan, ni nom de médecin, ni texte
          libre.
        </p>
        <p>
          <strong>Qui les voit.</strong> Vous, dans le profil de votre enfant.
          Le professeur, pendant la séance&nbsp;: elles sont transmises à
          Anthropic avec le reste du dialogue, comme le prénom et la classe.
          Personne d'autre&nbsp;: votre enfant ne voit pas les cases, seulement
          l'affichage qui en découle, et elles ne figurent ni dans les bilans,
          ni dans les e-mails, ni dans les outils d'administration de Mimia.
        </p>
        <p>
          <strong>Combien de temps.</strong> Tant que les cases restent cochées.
          Elles disparaissent quand vous les décochez, quand vous effacez les
          données de l'enfant ou quand vous supprimez votre compte.
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
            <strong>Adapter les séances aux besoins particuliers</strong> —
            consentement explicite du parent (article&nbsp;9, paragraphe&nbsp;2,
            point&nbsp;a du RGPD), retirable à tout moment en décochant.
          </li>
          <li>
            <strong>Orienter à partir de l'établissement</strong> — exécution du
            contrat, et seulement si vous l'avez renseigné.
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
                <td>
                  Prénom de l'enfant, sa classe, le contenu du dialogue&nbsp;; et,
                  s'ils existent, son établissement, ses besoins particuliers et
                  son projet d'orientation
                </td>
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
              {/* GOOGLE PORTE DEUX RÔLES DEPUIS LE 25/09/2026 : la connexion,
                  et l'hébergement de la sauvegarde de nuit. Celle-ci est chiffrée
                  sur notre serveur AVANT d'être envoyée ; Google en détient donc
                  les octets sans pouvoir les lire. À dire, plutôt qu'à taire :
                  la liste vaut par ce qu'elle n'omet pas. */}
              <tr>
                <td>Google</td>
                <td>
                  Identité, si vous choisissez la connexion Google&nbsp;; la
                  sauvegarde de nuit de la base, chiffrée avant son envoi et
                  illisible pour Google
                </td>
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
              {/* MICROSOFT EST ENTRÉ DANS LA LISTE LE 23/09/2026, en même temps
                  que Microsoft Clarity. Une section qui énumère les tiers et
                  qui en oublie un est pire qu'une section absente. */}
              <tr>
                <td>Microsoft (Clarity)</td>
                <td>
                  Mesure d'audience sur les pages publiques, si vous l'acceptez
                </td>
                <td>Hors&nbsp;UE</td>
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
                <td>Besoins particuliers et date de votre accord</td>
                <td>Tant qu'ils sont cochés&nbsp;; effacés dès que vous décochez</td>
              </tr>
              <tr>
                <td>Rapports d'orientation</td>
                <td>Durée de vie du compte, comme les fiches et les comptes rendus</td>
              </tr>
              <tr>
                <td>Contrôles passés et texte du cours importé avec eux</td>
                <td>Texte du cours et détail effacés <strong>un mois après le contrôle</strong> (deux sans bilan)&nbsp;; date, sujet et note gardés jusqu'au 1er août, puis suppression</td>
              </tr>
              <tr>
                <td>Pages d'un cours importé pour des fiches de révision</td>
                <td><strong>Le temps de créer les fiches</strong>, puis suppression automatique (24 heures au plus pour un cours jamais envoyé, ou dont les notions n'ont pas été choisies)</td>
              </tr>
              <tr>
                <td>Fiches de révision créées par votre enfant</td>
                <td>Jusqu'à ce qu'il les supprime, ou avec son profil</td>
              </tr>
              <tr>
                <td>Projet d'orientation</td>
                <td>Jusqu'à ce que la conseillère le remplace ou le retire, à la demande de l'enfant</td>
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
            <strong>Effacer ses données</strong> — ses échanges, ses fiches,
            ses évaluations, son établissement, ses besoins particuliers, son
            projet et ses rapports d'orientation sont supprimés définitivement. Seule subsiste la
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
          <li>
            Les profils de vos enfants, leur âge, leur classe, leur établissement,
            leurs besoins particuliers, leur projet et leurs rapports
            d'orientation.
          </li>
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
          {/* LES SAUVEGARDES SONT LE TROU DE TOUTE PROMESSE D'EFFACEMENT, et
              celui qu'on oublie de déclarer. On ne retire pas une ligne d'une
              sauvegarde déjà chiffrée sans la rendre inutilisable : une copie de
              nuit expire, elle ne se retouche pas. Le dire vaut mieux que de
              laisser croire à un effacement plus absolu qu'il ne l'est. */}
          <li>
            <strong>
              Les sauvegardes chiffrées des quatre-vingt-dix derniers jours
            </strong>
            . Nous copions la base chaque nuit, chiffrée, pour pouvoir tout
            rétablir en cas de panne. Une copie de nuit ne se modifie
            pas&nbsp;: vos données y demeurent jusqu&apos;à son expiration, au
            plus tard trois mois après la suppression, puis elle est détruite.
            Elles ne sont ni consultées, ni exploitées&nbsp;; elles ne servent
            qu&apos;à remettre le service en marche.
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

      {/* RÉÉCRITE LE 23/09/2026, EN MÊME TEMPS QUE L'ARRIVÉE DE CLARITY.
          Cette section affirmait « aucun cookie publicitaire ni de mesure
          d'audience » et « aucune bannière ne vous barre la route » : deux
          phrases devenues fausses le jour où l'outil de mesure se charge. Elle
          niait au passage le compteur de visites, qui existe depuis bien plus
          longtemps — décrit ici, au lieu d'être nié. Une page de confidentialité qui
          se trompe sur son propre site vaut moins que pas de page du tout. */}
      <section className="legal__section">
        <h2>Cookies et mesure d'audience</h2>

        <h3>Ce qui fait fonctionner le site</h3>
        <p>
          Votre session de connexion et vos préférences d'affichage (thème
          clair ou sombre, choix déjà faits) sont rangées sur votre appareil.
          Elles sont indispensables au service, ne partent vers aucun autre
          site, et sont à ce titre exemptées de consentement.
        </p>

        <h3>Le comptage des visites</h3>
        <p>
          Nous comptons combien de personnes passent sur les pages publiques.
          Pour cela, votre navigateur tire un numéro au sort et le garde&nbsp;;
          il nous l'envoie au plus une fois par heure. <strong>Aucun cookie</strong>,
          aucune page consultée, aucun référent, aucune adresse IP conservée. Ce
          numéro ne va nulle part ailleurs et disparaît au premier nettoyage de
          votre historique. Il nous dit «&nbsp;quarante personnes sont venues
          cette semaine&nbsp;», jamais qui, ni d'où.
        </p>

        <h3>Microsoft Clarity, si vous l'acceptez</h3>
        <p>
          Pour comprendre où l'on hésite et où l'on s'arrête sur les pages
          publiques, nous utilisons <strong>Microsoft Clarity</strong>. Il
          enregistre les parcours&nbsp;: déplacements de la souris, clics,
          défilement, pages vues. Il dépose deux cookies,{' '}
          <code>_clck</code> (un an) et <code>_clsk</code> (un jour), qui
          servent à relier les pages d'une même visite.
        </p>
        <p>
          <strong>Il ne se charge qu'après votre accord</strong>, demandé par le
          bandeau à votre arrivée, et jamais si vous refusez. Surtout&nbsp;: il
          ne fonctionne que sur les pages publiques — accueil, tarifs, avis,
          pages légales. <strong>Il est absent de l'espace connecté</strong>, et
          donc de toutes les séances&nbsp;: ni le dialogue avec le professeur,
          ni le tableau, ni les copies, ni les prénoms des enfants ne sont vus
          par cet outil. Aucune séance n'est enregistrée.
        </p>
        <p>
          Microsoft est établi hors de l'Union européenne&nbsp;; le transfert
          s'appuie sur les clauses contractuelles types, comme pour nos autres
          prestataires.
        </p>

        <h3>Revenir sur votre choix</h3>
        <p>
          À tout moment, le lien <strong>«&nbsp;Cookies&nbsp;»</strong> en bas de
          chaque page rouvre le bandeau&nbsp;: accepter après avoir refusé, ou
          refuser après avoir accepté. Un refus efface les cookies de mesure et
          arrête l'outil. Effacer les données du site depuis votre navigateur
          revient au même, à ceci près que la question vous sera reposée.
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
