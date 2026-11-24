import { useCallback, useMemo, useState } from 'react';
import { retirerNotionDuProgramme } from '../lib/api/elevesApi';
import { retraitEnAttente, marquerClicRetrait } from '../lib/storage/retraitNotion';

/**
 * LES DEUX BOUTONS DU RETRAIT D'UNE NOTION — signalement #67 v7 (23/11/2026).
 *
 * Affichés sous le message du professeur SEULEMENT quand le serveur y a ajouté sa balise (voir
 * `lib/storage/retraitNotion.js`). « Oui » appelle la route qui retire la notion ; « Non » la garde. Les deux restent
 * désactivés après le clic : un double clic ne doit rien envoyer deux fois. Même carte que le choix du support de
 * l'évaluation : un enfant qui en a déjà vu une sait y répondre.
 */
export default function RetraitNotion({ libelle, onRepondre, desactive, erreur }) {
  return (
    <div className="support-eval retrait-notion" role="group" aria-label="Retirer une notion de ton programme">
      <p className="support-eval__question">
        Tu veux retirer « {libelle} » de ton programme ?
      </p>

      <div className="support-eval__choix">
        <button
          type="button"
          className="support-eval__bouton"
          disabled={desactive}
          onClick={() => onRepondre(true)}
        >
          <span className="support-eval__nom">Oui, retirer « {libelle} »</span>
        </button>

        <button
          type="button"
          className="support-eval__bouton"
          disabled={desactive}
          onClick={() => onRepondre(false)}
        >
          <span className="support-eval__nom">Non, la garder</span>
        </button>
      </div>

      {erreur && <p className="retrait-notion__erreur" role="alert">{erreur}</p>}
    </div>
  );
}

/**
 * LA LOGIQUE DU CLIC — signalement #67 v7. SEUL le « Oui » appelle la route qui retire la notion ; puis le clic part
 * comme un tour normal (`envoyerTexte`), et le serveur dit au professeur « RETIRÉ : X » (ou « GARDÉE : X ») après avoir
 * relu la base. Les boutons restent désactivés pendant l'appel et après : un double clic n'envoie rien deux fois. Un
 * échec garde la notion et le dit, sans rien envoyer au professeur ; l'élève peut réessayer.
 */
export function useRetraitNotion(messages, eleveId, envoyerTexte, retirer = retirerNotionDuProgramme) {
  const attendu = useMemo(() => retraitEnAttente(messages), [messages]);
  // La proposition est celle d'UN message (sa place dans le fil) : une même notion reproposée plus tard a ses boutons.
  const cle = attendu ? `${(messages ?? []).length}:${attendu.notionId}` : null;
  const [clic, setClic] = useState(null);

  const repondre = useCallback(
    async (oui) => {
      if (!attendu) return;
      const { controleId, notionId, libelle } = attendu;
      if (clic?.cle === cle && clic.etat !== 'erreur') return;

      if (!oui) {
        setClic({ cle, etat: 'fait' });
        envoyerTexte(marquerClicRetrait(libelle, notionId, false));
        return;
      }

      setClic({ cle, etat: 'envoi' });
      try {
        await retirer(eleveId, controleId, notionId, libelle);
        setClic({ cle, etat: 'fait' });
        envoyerTexte(marquerClicRetrait(libelle, notionId, true));
      } catch (erreur) {
        setClic({
          cle,
          etat: 'erreur',
          message: erreur?.response?.status === 409
            ? 'Ton programme ne peut pas rester vide : cette notion reste.'
            : 'Le retrait n’a pas marché, la notion est toujours dans ton programme. Réessaie dans un instant.',
        });
      }
    },
    [attendu, cle, clic, envoyerTexte, eleveId, retirer],
  );

  const sienne = cle !== null && clic?.cle === cle;

  return {
    attendu,
    repondre,
    desactive: Boolean(sienne && clic.etat !== 'erreur'),
    erreur: sienne ? clic.message ?? null : null,
  };
}
