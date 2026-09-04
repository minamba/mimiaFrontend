import { Link } from 'react-router-dom';
import { MEDIATEUR } from './ConditionsVente';

/**
 * Mentions légales.
 *
 * Obligatoires pour tout site édité à titre professionnel — article 6-III de
 * la loi pour la confiance dans l'économie numérique.
 *
 * LES INFORMATIONS SONT ÉCRITES EN DUR, ET C'EST VOULU
 * ---------------------------------------------------
 * Elles ne changent qu'au rythme d'une modification de statut, et une page
 * légale qui dépend d'un appel réseau peut s'afficher vide le jour où le
 * serveur tousse. Un visiteur qui cherche qui édite le site doit toujours
 * trouver la réponse.
 */
export default function MentionsLegales() {
  return (
    <article className="legal">
      <header className="legal__entete">
        <p className="legal__surtitre">Informations légales</p>
        <h1 className="legal__titre">Mentions légales</h1>
        <p className="legal__maj">Dernière mise à jour&nbsp;: 6 août 2026</p>
      </header>

      <section className="legal__section">
        <h2>Éditeur du site</h2>
        <dl className="legal__fiche">
          <div>
            <dt>Éditeur</dt>
            <dd>
              Minanba Camara, entrepreneur individuel,
              exerçant sous le nom commercial «&nbsp;Mins Corp&nbsp;»
            </dd>
          </div>
          <div>
            <dt>Siège</dt>
            <dd>2&nbsp;rue Jules Vallès, 91000&nbsp;Évry-Courcouronnes, France</dd>
          </div>
          <div>
            <dt>SIRET</dt>
            <dd>924&nbsp;291&nbsp;800&nbsp;00010</dd>
          </div>
          <div>
            <dt>TVA</dt>
            <dd>
              TVA non applicable, article&nbsp;293&nbsp;B du Code général des impôts
            </dd>
          </div>
          <div>
            <dt>Directeur de la publication</dt>
            <dd>Minanba Camara</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              <a href="mailto:support@mimia.fr">support@mimia.fr</a>
              {' — ou par le '}
              <Link to="/contact">formulaire de contact</Link>
            </dd>
          </div>
        </dl>
      </section>

      <section className="legal__section">
        <h2>Hébergement</h2>
        <p>
          Le site et ses données sont hébergés sur un serveur privé virtuel
          fourni par&nbsp;:
        </p>
        <dl className="legal__fiche">
          <div>
            <dt>Hébergeur</dt>
            <dd>IONOS SARL, société à responsabilité limitée au capital de 100&nbsp;000&nbsp;€</dd>
          </div>
          <div>
            <dt>Adresse</dt>
            <dd>7&nbsp;place de la Gare, BP&nbsp;70109, 57200&nbsp;Sarreguemines Cedex, France</dd>
          </div>
          <div>
            <dt>RCS</dt>
            <dd>Sarreguemines B&nbsp;431&nbsp;303&nbsp;775</dd>
          </div>
          <div>
            <dt>Site</dt>
            <dd><a href="https://www.ionos.fr" target="_blank" rel="noreferrer">www.ionos.fr</a></dd>
          </div>
        </dl>
      </section>

      <section className="legal__section">
        <h2>Propriété intellectuelle</h2>
        <p>
          Le nom Mimia, le logo, la charte graphique, les textes, les
          illustrations et l'ensemble des éléments composant le site sont
          protégés par le droit de la propriété intellectuelle. Toute
          reproduction ou représentation, totale ou partielle, sans
          autorisation écrite préalable est interdite.
        </p>
        <p>
          Les fiches de révision, les évaluations et les comptes rendus de
          séance produits pour un élève lui sont destinés, ainsi qu'à ses
          représentants légaux. Ils peuvent être imprimés et conservés
          librement pour un usage familial et scolaire.
        </p>
      </section>

      <section className="legal__section">
        <h2>Données personnelles</h2>
        <p>
          Le traitement des données personnelles, notamment celles des élèves
          mineurs, est décrit en détail dans notre{' '}
          <Link to="/confidentialite">politique de confidentialité</Link>. Vous
          y trouverez la nature des données collectées, leur durée de
          conservation, les destinataires, et la manière d'exercer vos droits.
        </p>
      </section>

      <section className="legal__section">
        {/* CM2C IMPOSE LA MENTION « SUR VOTRE SITE INTERNET ET SUR VOS
            CONDITIONS GÉNÉRALES ». Elle figure donc aux deux endroits.

            La fiche vient de ConditionsVente : une seule source, une seule
            adresse à corriger le jour où le médiateur déménage. Il l'a déjà
            fait — les conditions d'un concurrent donnent encore l'ancienne
            adresse, et un courrier de parent y arriverait nulle part. */}
        <h2>Médiation de la consommation</h2>
        <p>
          Conformément aux dispositions du Code de la consommation concernant
          «&nbsp;le processus de médiation des litiges de la consommation&nbsp;»,
          après nous avoir sollicités et à défaut de réponse vous satisfaisant,
          vous avez la possibilité de recourir gratuitement à une procédure de
          médiation de la consommation auprès de&nbsp;:
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
      </section>

      <section className="legal__section">
        <h2>Signaler un contenu</h2>
        <p>
          Pour signaler un contenu que vous estimez illicite, ou nous informer
          d'un problème concernant un élève, écrivez à{' '}
          <a href="mailto:support@mimia.fr">support@mimia.fr</a>. Précisez la
          date, l'heure et, si vous le pouvez, l'élève concerné&nbsp;: cela nous
          permet de retrouver la séance en question.
        </p>
      </section>
    </article>
  );
}
