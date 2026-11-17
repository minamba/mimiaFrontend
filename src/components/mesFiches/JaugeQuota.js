import { sessionEleve } from '../../lib/storage/sessionEleve';
import AchatCredits from './AchatCredits';

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
 * L'ACHAT (Camara, le 16/10 puis le 16/11/2026) : d'abord seulement dans « Mon
 * forfait » ; depuis le 16/11, un bouton « Acheter des crédits » ouvre ici le
 * même encadré, pour le parent seulement. L'enfant qui n'a plus rien est
 * invité à le demander à ses parents.
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

/**
 * LES PODCASTS (15/11/2026) : la même jauge, un compteur à part — « podcasts » là où les fiches disent « cours ».
 */
function textePodcastsEnfant({ maximum, restantes, credits: reserve, disponibles, remiseLe }) {
  if (disponibles <= 0) {
    return `Tu as utilisé tes ${maximum} podcasts de ce mois-ci. Demande à tes parents d’acheter des crédits `
      + `pour en créer d’autres. Sinon, tes podcasts reviennent le ${jour(remiseLe)}.`;
  }
  if (restantes <= 0) {
    return `Tes ${maximum} podcasts du mois sont utilisés. Ta famille a encore ${credits(reserve)} : `
      + `chaque cours transformé en podcast en prend un (deux s’il dépasse 10 pages). Ils reviennent le ${jour(remiseLe)}.`;
  }
  return `Tu peux encore créer ${restantes} podcast${restantes > 1 ? 's' : ''} ce mois-ci. Un cours compte pour un, même s’il `
    + `donne plusieurs épisodes (pour deux s’il dépasse 10 pages). Ils reviennent le ${jour(remiseLe)}.`
    + (reserve > 0 ? ` Ta famille a aussi ${credits(reserve)}.` : '');
}

function textePodcastsParent({ maximum, restantes, credits: reserve, disponibles, remiseLe }) {
  if (disponibles <= 0) {
    return `Ses ${maximum} podcasts du mois sont utilisés et la famille n’a plus de crédit de podcasts. `
      + `Ils reviennent le ${jour(remiseLe)}.`;
  }
  if (restantes <= 0) {
    return `Ses ${maximum} podcasts du mois sont utilisés : les suivants prennent sur les crédits de podcasts de la famille `
      + `(${credits(reserve)}). Ils reviennent le ${jour(remiseLe)}.`;
  }
  return `Il lui reste ${restantes} podcast${restantes > 1 ? 's' : ''} à créer ce mois-ci, jusqu’au ${jour(remiseLe)}.`
    + (reserve > 0 ? ` Crédits de podcasts de la famille : ${reserve}.` : '');
}

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

export default function JaugeQuota({ quota, module = 'fiches', achat = true }) {
  if (!quota?.maximum) return null;

  const enfant = Boolean(sessionEleve());
  const { utilisees = 0, maximum, restantes = 0, credits: reserve = 0, disponibles = 0 } = quota;
  const pris = quota.creditsPris ?? 0;
  const total = maximum + pris + reserve;
  const partMois = (utilisees / total) * 100;
  const partCredits = (pris / total) * 100;
  const part = Math.min(100, Math.round((utilisees / maximum) * 100));
  const niveau = disponibles <= 0 ? 'epuise' : restantes <= 0 || part >= 80 ? 'bas' : 'ok';
  const podcasts = module === 'podcasts';
  const quoi = podcasts ? 'podcasts' : 'cours';

  return (
    <div className={`mf-quota est-${niveau}`}>
      <div className="mf-quota__ligne">
        <span className="mf-quota__titre">{enfant ? `Tes ${quoi} ce mois-ci` : `Ses ${quoi} ce mois-ci`}</span>
        <span className="mf-quota__compte">
          <strong>{utilisees}</strong> / {maximum}
          {reserve > 0 && <span className="mf-quota__reserve"> + {credits(reserve)}</span>}
        </span>
      </div>

      <div
        className="mf-quota__jauge"
        role="progressbar"
        aria-label={podcasts ? 'Podcasts créés ce mois-ci' : 'Cours importés ce mois-ci'}
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
          <span className="mf-quota__pastille mf-quota__pastille--mois" /> {podcasts ? 'Podcasts du mois' : 'Cours du mois'}
          <span className="mf-quota__pastille mf-quota__pastille--credits" /> Crédits de la famille
        </p>
      )}

      <p className="mf-quota__reste">
        {podcasts
          ? (enfant ? textePodcastsEnfant(quota) : textePodcastsParent(quota))
          : (enfant ? texteEnfant(quota) : texteParent(quota))}
      </p>

      {/* « ACHETER DES CRÉDITS », TOUJOURS LÀ POUR LE PARENT — Camara, le 16/11/2026 (avant : seulement le mois
          épuisé, et un lien vers Mon forfait). La fenêtre reprend l'encadré de Mon forfait. Jamais pour un enfant
          entré par son code ; jamais dans la visite de démonstration (`achat={false}`). */}
      {!enfant && achat && (
        <p className="mf-quota__lien">
          <AchatCredits module={module} />
        </p>
      )}
    </div>
  );
}
