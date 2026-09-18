import { QUESTION_SUPPORT, CAHIER, ORDINATEUR } from '../lib/storage/supportEvaluation';

/**
 * LA CARTE « SUR QUOI TU COMPOSES », DANS LE FIL.
 *
 * Elle vit à la suite du dernier message, comme la carte de copie de contrôle
 * et celle de la dictée : c'est là que l'élève regarde. Voir
 * `supportEvaluation.js` pour la mécanique.
 *
 * DEUX BOUTONS DE MÊME POIDS, et c'est voulu. Le professeur vient de dire
 * lequel il conseille, avec sa raison — « il y a deux figures à tracer, ton
 * cahier sera plus simple ». Habiller le conseillé en bouton plein et l'autre
 * en fantôme ferait de la préconisation une réponse attendue, alors que Camara
 * y tient : « ce sont juste des préconisations ». Le choix est à l'enfant, et
 * l'écran ne doit pas peser dessus.
 */
export default function SupportEvaluation({ onChoisir, disabled }) {
  return (
    <div className="support-eval" role="group" aria-label="Le support de ton évaluation">
      <p className="support-eval__question">{QUESTION_SUPPORT}</p>

      <div className="support-eval__choix">
        <button
          type="button"
          className="support-eval__bouton"
          disabled={disabled}
          onClick={() => onChoisir(CAHIER)}
        >
          <span className="support-eval__icone" aria-hidden="true">📓</span>
          <span className="support-eval__nom">Mon cahier</span>
          <span className="support-eval__detail">
            Le sujet s’affiche au tableau, tu m’envoies la photo de ta copie
          </span>
        </button>

        <button
          type="button"
          className="support-eval__bouton"
          disabled={disabled}
          onClick={() => onChoisir(ORDINATEUR)}
        >
          <span className="support-eval__icone" aria-hidden="true">💻</span>
          <span className="support-eval__nom">L’ordinateur</span>
          <span className="support-eval__detail">
            Les questions une par une, tu réponds ici
          </span>
        </button>
      </div>
    </div>
  );
}
