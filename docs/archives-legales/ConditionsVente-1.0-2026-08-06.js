import { Link } from 'react-router-dom';

/**
 * Conditions générales de vente et d'utilisation.
 *
 * ELLES DÉCRIVENT LE PRODUIT TEL QU'IL EST
 * ----------------------------------------
 * La reconduction tacite, la pause d'un mois par an, l'absence de report des
 * heures non consommées : tout cela est relevé dans le code de la gestion des
 * abonnements, pas repris d'un modèle. Des CGV qui promettent ce que le
 * produit ne sait pas faire exposent plus qu'elles ne protègent.
 *
 * LE MÉDIATEUR
 * ------------
 * Obligatoire, et pas seulement recommandé : l'article L612-1 du Code de la
 * consommation ouvre au consommateur un droit de recours gratuit, et le L616-1
 * met à la charge du professionnel l'obligation d'en communiquer les
 * coordonnées — sur le site, dans les conditions générales, sur les contrats.
 * Le manquement porte sur l'INFORMATION : il est constitué avant tout litige.
 *
 * Cette constante est restée nulle jusqu'à l'adhésion, à dessein. Nommer un
 * médiateur sans contrat aurait été une fausse mention, et le parent qui l'aurait
 * saisi se serait entendu répondre que Mimia n'est pas adhérente — au pire
 * moment possible, c'est-à-dire pendant un différend.
 *
 * Adhésion CM2C souscrite le 31 août 2026, valable jusqu'au 31 août 2029.
 * À renouveler AVANT cette date : passé le terme, la mention resterait
 * affichée alors que l'adhésion serait éteinte — c'est-à-dire exactement la
 * fausse mention qu'on a évité d'écrire pendant tout ce temps.
 *
 * L'ADRESSE A ÉTÉ RELEVÉE SUR LE SITE DE CM2C, PAS RECOPIÉE AILLEURS. Les
 * conditions générales d'un concurrent donnaient encore « 14 rue Saint-Jean,
 * 75017 Paris » — l'ancienne. Une adresse de médiateur périmée dans des CGV
 * revient à ne pas en avoir : le courrier du parent n'arrive nulle part.
 */
export const MEDIATEUR = {
  nom: 'CM2C — Centre de Médiation de la Consommation de Conciliateurs de Justice',
  adresse: '49 rue de Ponthieu, 75008 Paris',
  telephone: '01 89 47 00 14',
  mail: 'litiges@cm2c.net',

  // L'ADRESSE DE SAISINE, ET NON L'ACCUEIL DU SITE. C'est celle que CM2C
  // impose de publier : un parent en litige n'a pas à chercher dans un menu
  // quelle page le concerne.
  saisine: 'https://www.cm2c.net/declarer-un-litige.php',
};

export default function ConditionsVente() {
  return (
    <article className="legal">
      <header className="legal__entete">
        <p className="legal__surtitre">Conditions générales</p>
        <h1 className="legal__titre">Conditions de vente et d'utilisation</h1>
        <p className="legal__maj">Version 1.0 — en vigueur depuis le 6 août 2026</p>
      </header>

      <section className="legal__section">
        <h2>1. Qui contracte avec vous</h2>
        <p>
          Mimia est édité par <strong>Minanba Camara</strong>, entrepreneur
          individuel exerçant sous le nom commercial «&nbsp;Mins&nbsp;Corp&nbsp;»,
          2&nbsp;rue Jules Vallès, 91000&nbsp;Évry-Courcouronnes,
          SIRET&nbsp;924&nbsp;291&nbsp;800&nbsp;00010. TVA non applicable,
          article&nbsp;293&nbsp;B du Code général des impôts.
        </p>
        <p>
          Ces conditions régissent l'accès au service et son utilisation. Toute
          souscription vaut acceptation pleine et entière.
        </p>
      </section>

      <section className="legal__section">
        <h2>2. Ce que le service est, et ce qu'il n'est pas</h2>
        <p>
          Mimia donne à un élève un professeur particulier reposant sur une
          intelligence artificielle. Ce professeur dialogue avec l'élève, à
          l'oral ou au clavier, cherche l'origine de ses difficultés et le
          conduit à trouver ses réponses lui-même.
        </p>
        <p>
          Le service <strong>ne remplace ni l'école, ni un enseignant, ni un
          professionnel de santé</strong>. Il ne délivre aucun diplôme et ne
          garantit aucun résultat scolaire. Ce n'est pas un service d'urgence.
        </p>
        <h3>Les limites de l'intelligence artificielle</h3>
        <p>
          Une intelligence artificielle peut se tromper, y compris avec
          assurance. Elle peut produire une explication inexacte ou une erreur
          de calcul. Nous mettons en place des garde-fous, mais nous ne pouvons
          pas les garantir infaillibles.
        </p>
        <p>
          Nous invitons les parents à conserver un regard sur le travail de leur
          enfant, et à nous signaler toute réponse manifestement fausse.
        </p>
      </section>

      <section className="legal__section">
        <h2>3. Le compte</h2>
        <p>
          Le compte est ouvert par un <strong>parent ou représentant légal</strong>,
          majeur, qui crée ensuite le profil de chacun de ses enfants. Un enfant
          n'ouvre jamais de compte lui-même.
        </p>
        <p>
          Le titulaire du compte est responsable de son mot de passe et de
          l'usage fait du service par les élèves qu'il a inscrits. Il s'engage à
          fournir des informations exactes et à les tenir à jour.
        </p>
        <p>
          Le compte est strictement personnel et familial. Il ne peut être
          partagé avec un tiers, ni utilisé dans un cadre collectif ou
          professionnel.
        </p>
      </section>

      <section className="legal__section">
        <h2>4. Les formules et le prix</h2>
        <p>
          Les formules, leur contenu et leur prix sont présentés sur la page{' '}
          <Link to="/tarifs">Tarifs</Link>. Les prix sont indiqués en euros,
          toutes taxes comprises&nbsp;— la TVA n'étant pas applicable.
        </p>
        <ul>
          <li>
            Chaque formule ouvre un <strong>volume d'heures de cours par
            période</strong>, partagé entre les enfants du compte.
          </li>
          <li>
            Les heures non consommées à la fin d'une période{' '}
            <strong>ne sont pas reportées</strong> sur la suivante.
          </li>
          <li>
            Des packs d'heures supplémentaires peuvent être ajoutés à tout
            moment sur la période en cours.
          </li>
        </ul>
        <p>
          Nous pouvons modifier nos prix. Une modification ne s'applique jamais
          à une période déjà payée&nbsp;: elle prend effet à la période
          suivante, et vous en êtes informé avant.
        </p>
      </section>

      <section className="legal__section">
        <h2>5. Durée, reconduction et résiliation</h2>
        <p>
          L'abonnement est souscrit au mois ou à l'année, selon votre choix. Il
          se <strong>reconduit tacitement</strong> à l'échéance de chaque
          période, pour une période de même durée.
        </p>
        <p>
          <strong>Vous pouvez résilier à tout moment</strong>, sans motif et
          sans frais. La résiliation prend effet à la fin de la période en
          cours&nbsp;: vous conservez l'accès et vos heures jusqu'à cette date,
          et aucune nouvelle période n'est engagée.
        </p>
        <p>
          La résiliation se fait <strong>depuis votre espace</strong>, à la
          rubrique de votre forfait&nbsp;: le bouton «&nbsp;Résilier mon
          abonnement&nbsp;» se trouve à côté des autres actions, sans qu'il soit
          nécessaire de nous écrire ni de justifier quoi que ce soit.
        </p>
        <p>
          Tant que la période court, vous pouvez revenir sur votre décision d'un
          clic. Si vous préférez malgré tout nous écrire, notre{' '}
          <Link to="/contact">formulaire de contact</Link> et l'adresse{' '}
          <a href="mailto:support@mimia.fr">support@mimia.fr</a> restent
          ouverts.
        </p>
        <h3>La pause</h3>
        <p>
          Une fois par année glissante, vous pouvez suspendre votre abonnement
          pendant un mois depuis votre espace. La période est décalée d'autant.
          La pause n'est pas ouverte aux offres d'essai.
        </p>
      </section>

      <section className="legal__section">
        <h2>6. Droit de rétractation</h2>
        <p>
          Vous disposez d'un délai de <strong>quatorze jours</strong> à compter
          de la souscription pour vous rétracter, sans motif, conformément aux
          articles L221-18 et suivants du Code de la consommation.
        </p>
        <p>
          Si vous demandez à ce que le service commence immédiatement — ce qui
          est le cas dès la première séance — et que vous vous rétractez
          ensuite, vous serez redevable du montant correspondant aux heures déjà
          consommées. Le solde vous est remboursé sous quatorze jours.
        </p>
        <p>
          Pour vous rétracter, il suffit de nous écrire&nbsp;: aucun formulaire
          particulier n'est exigé.
        </p>
      </section>

      <section className="legal__section">
        <h2>7. Protection des mineurs</h2>
        <p>
          Le service est conçu pour des enfants, et cela commande plusieurs
          règles.
        </p>
        <ul>
          <li>
            Le professeur est tenu à un cadre strictement scolaire. Il refuse
            les échanges sans rapport avec le travail.
          </li>
          <li>
            Les contenus violents, haineux, sexuels ou illégaux sont interdits,
            de la part de l'élève comme du service.
          </li>
          <li>
            Si un échange laissait apparaître un danger grave pour l'enfant,
            nous pourrions être amenés à en informer son représentant légal.
          </li>
        </ul>
        <p>
          Le service n'est <strong>pas un dispositif d'alerte</strong>. En cas de
          danger immédiat, contactez les services d'urgence&nbsp;: 15, 17, 18 ou
          112, et le 119 pour l'enfance en danger.
        </p>
      </section>

      <section className="legal__section">
        <h2>8. Données personnelles</h2>
        <p>
          Le traitement des données, les durées de conservation et vos droits
          sont décrits dans notre{' '}
          <Link to="/confidentialite">politique de confidentialité</Link>, qui
          fait partie intégrante des présentes conditions.
        </p>
      </section>

      <section className="legal__section">
        <h2>9. Responsabilité</h2>
        <p>Nous ne pouvons être tenus responsables&nbsp;:</p>
        <ul>
          <li>d'un usage du service contraire aux présentes conditions&nbsp;;</li>
          <li>des résultats scolaires de l'élève&nbsp;;</li>
          <li>d'une erreur produite par l'intelligence artificielle&nbsp;;</li>
          <li>
            d'une interruption due à la maintenance, à une panne d'un
            prestataire ou à une cause extérieure&nbsp;;
          </li>
          <li>d'une défaillance du réseau ou du matériel de l'utilisateur.</li>
        </ul>
        <p>
          En tout état de cause, et hors les cas où la loi l'interdit, notre
          responsabilité est limitée aux sommes effectivement versées au cours
          des douze mois précédant le fait générateur.
        </p>
      </section>

      <section className="legal__section">
        <h2>10. Suspension du compte</h2>
        <p>
          Nous pouvons suspendre l'accès en cas de manquement grave aux
          présentes conditions, notamment un partage du compte, un usage
          professionnel, une tentative de contournement des limites, ou un
          défaut de paiement. Sauf urgence, nous vous en informons par écrit et
          vous laissons la possibilité de régulariser.
        </p>
      </section>

      <section className="legal__section">
        <h2>11. Propriété intellectuelle</h2>
        <p>
          La marque Mimia, le logo et l'ensemble du service sont protégés. Les
          fiches de révision, évaluations et comptes rendus produits pour un
          élève lui appartiennent&nbsp;: vous pouvez les imprimer et les
          conserver librement pour un usage familial et scolaire.
        </p>
      </section>

      <section className="legal__section">
        <h2>12. Modification des conditions</h2>
        <p>
          Nous pouvons modifier ces conditions. La version applicable à votre
          abonnement est celle en vigueur au jour de sa souscription ou de sa
          dernière reconduction. Toute modification substantielle vous est
          notifiée&nbsp;; si elle ne vous convient pas, vous pouvez résilier.
        </p>
      </section>

      <section className="legal__section">
        <h2>13. Droit applicable et litiges</h2>
        <p>
          Les présentes conditions sont soumises au droit français.
        </p>
        <p>
          En cas de difficulté, écrivez-nous d'abord&nbsp;: la très grande
          majorité des litiges se règlent en un échange.{' '}
          <a href="mailto:support@mimia.fr">support@mimia.fr</a>
        </p>

        {MEDIATEUR && (
          <>
            <h3>Médiation de la consommation</h3>
            {/* LA FORMULATION EST CELLE QUE CM2C IMPOSE, mot pour mot.
                Elle est fournie dans l'espace professionnel sous le titre
                « mention à indiquer sur votre site internet ». La reformuler
                n'aurait rien gagné et aurait pu s'écarter de ce que le
                médiateur reconnaît comme sa propre désignation. */}
            <p>
              Conformément aux dispositions du Code de la consommation
              concernant «&nbsp;le processus de médiation des litiges de la
              consommation&nbsp;», après nous avoir sollicités et à défaut de
              réponse vous satisfaisant, vous avez la possibilité de recourir
              gratuitement à une procédure de médiation de la consommation
              auprès de&nbsp;:
            </p>
            <div className="legal__fiche">
              <div>
                <dt>Médiateur</dt>
                <dd>{MEDIATEUR.nom}</dd>
              </div>
              <div>
                <dt>Adresse</dt>
                <dd>{MEDIATEUR.adresse}</dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>{MEDIATEUR.telephone}</dd>
              </div>
              <div>
                <dt>Courriel</dt>
                <dd>
                  <a href={`mailto:${MEDIATEUR.mail}`}>{MEDIATEUR.mail}</a>
                </dd>
              </div>
              <div>
                <dt>Saisir le médiateur</dt>
                <dd>
                  <a href={MEDIATEUR.saisine} target="_blank" rel="noreferrer">
                    Déclarer un litige en ligne
                  </a>
                </dd>
              </div>
            </div>
          </>
        )}

        <p>
          À défaut d'accord amiable, les tribunaux français sont compétents.
        </p>
      </section>
    </article>
  );
}
