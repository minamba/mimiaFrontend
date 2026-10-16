import { Link } from 'react-router-dom';
import { sessionEleve } from '../../lib/storage/sessionEleve';

/**
 * LA JAUGE DU MOIS — Camara, le 15/10/2026 : « que le quota s'affiche sous la
 * forme d'une barre de progression, avec ce qu'on a encore le droit de
 * générer ».
 *
 * ELLE COMPTE DES COURS IMPORTÉS, PAS DES FICHES (Camara, le 16/10/2026) :
 * un cours découpé en sept fiches compte pour un. Dix cours par mois et par
 * enfant, qui reviennent avec les heures de la famille. Au-delà, les crédits
 * de la famille — 1 crédit = 1 cours —, achetés par le parent, partagés entre
 * les enfants, sans date limite. Un cours de plus de dix pages compte pour 2
 * (et prend 2 crédits).
 *
 * ON N'ACHÈTE PAS ICI (Camara, le 16/10/2026) : l'achat se fait dans « Mon
 * forfait », à part des heures. L'enfant qui n'a plus rien est invité à le
 * demander à ses parents ; le parent est envoyé vers son forfait.
 *
 * Verte, orange quand le mois tire à sa fin ou qu'on puise dans la réserve,
 * rouge quand il ne reste plus rien.
 *
 * UNE SEULE BARRE, LE MOIS PUIS LES CRÉDITS — Camara, le 16/10/2026 : « une
 * barre globale de 20 + les crédits achetés par les parents ; la progression
 * monte normalement, une fois le quota atteint la barre jaune commence, collée
 * à la verte, et progresse avec les cours importés ». La longueur de la barre
 * vaut 20 + les crédits (pris par l'enfant ce mois-ci + encore libres) ; le
 * vert se remplit d'abord, le jaune ne paraît qu'une fois les 20 pris.
 */
const jour = (date) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '';

const credits = (n) => `${n} crédit${n > 1 ? 's' : ''}`;

/** Plus aucun cours, ni du mois ni en crédits : rien ne se crée. */
export const quotaEpuise = (quota) => Boolean(quota?.maximum) && (quota.disponibles ?? 0) <= 0;

function texteEnfant({ maximum, restantes, credits: reserve, disponibles, remiseLe }) {
  if (disponibles <= 0) {
    return `Tu as utilisé tes ${maximum} cours de ce mois-ci. Demande à tes parents d’acheter des crédits `
      + `pour en importer d’autres. Sinon, tes cours reviennent le ${jour(remiseLe)}.`;
  }
  if (restantes <= 0) {
    return `Tes ${maximum} cours du mois sont utilisés. Ta famille a encore ${credits(reserve)} : `
      + `chaque cours importé en prend un (deux s’il dépasse 10 pages). Tes cours du mois reviennent le ${jour(remiseLe)}.`;
  }
  return `Tu peux encore importer ${restantes} cours ce mois-ci. Un cours compte pour un, même s’il donne `
    + `plusieurs fiches (pour deux s’il dépasse 10 pages). Tes cours reviennent le ${jour(remiseLe)}.`
    + (reserve > 0 ? ` Ta famille a aussi ${credits(reserve)}.` : '');
}

function texteParent({ maximum, restantes, credits: reserve, disponibles, remiseLe }) {
  if (disponibles <= 0) {
    return `Ses ${maximum} cours du mois sont utilisés et la famille n’a plus de crédit. `
      + `Ses cours reviennent le ${jour(remiseLe)}.`;
  }
  if (restantes <= 0) {
    return `Ses ${maximum} cours du mois sont utilisés : les suivants prennent sur les crédits de la famille `
      + `(${credits(reserve)}). Ses cours reviennent le ${jour(remiseLe)}.`;
  }
  return `Il lui reste ${restantes} cours à importer ce mois-ci, jusqu’au ${jour(remiseLe)}.`
    + (reserve > 0 ? ` Crédits de la famille : ${reserve}.` : '');
}

export default function JaugeQuota({ quota }) {
  if (!quota?.maximum) return null;

  const enfant = Boolean(sessionEleve());
  const { utilisees = 0, maximum, restantes = 0, credits: reserve = 0, disponibles = 0 } = quota;
  const pris = quota.creditsPris ?? 0;
  const total = maximum + pris + reserve;
  const partMois = (utilisees / total) * 100;
  const partCredits = (pris / total) * 100;
  const part = Math.min(100, Math.round((utilisees / maximum) * 100));
  const niveau = disponibles <= 0 ? 'epuise' : restantes <= 0 || part >= 80 ? 'bas' : 'ok';

  return (
    <div className={`mf-quota est-${niveau}`}>
      <div className="mf-quota__ligne">
        <span className="mf-quota__titre">{enfant ? 'Tes cours ce mois-ci' : 'Ses cours ce mois-ci'}</span>
        <span className="mf-quota__compte">
          <strong>{utilisees}</strong> / {maximum}
          {reserve > 0 && <span className="mf-quota__reserve"> + {credits(reserve)}</span>}
        </span>
      </div>

      <div
        className="mf-quota__jauge"
        role="progressbar"
        aria-label="Cours importés ce mois-ci"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={utilisees + pris}
        aria-valuetext={`${utilisees} sur ${maximum}${pris + reserve > 0 ? `, et ${pris} crédit${pris > 1 ? 's' : ''} pris sur ${pris + reserve}` : ''}`}
      >
        <span className="mf-quota__plein" style={{ width: `${partMois}%` }} />
        {pris > 0 && <span className="mf-quota__credits" style={{ width: `${partCredits}%` }} />}
      </div>

      {pris + reserve > 0 && (
        <p className="mf-quota__legende" aria-hidden="true">
          <span className="mf-quota__pastille mf-quota__pastille--mois" /> Cours du mois
          <span className="mf-quota__pastille mf-quota__pastille--credits" /> Crédits de la famille
        </p>
      )}

      <p className="mf-quota__reste">{enfant ? texteEnfant(quota) : texteParent(quota)}</p>

      {/* Le parent achète dans son forfait, jamais ici. */}
      {!enfant && (disponibles <= 0 || restantes <= 0) && (
        <p className="mf-quota__lien">
          <Link to="/profil?onglet=forfait">Acheter des crédits dans Mon compte › Mon forfait</Link>
        </p>
      )}
    </div>
  );
}
