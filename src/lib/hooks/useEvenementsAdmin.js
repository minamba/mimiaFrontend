import { useEffect, useRef } from 'react';
import { API_BASE_URL, enTeteAuth } from '../api/httpClient';

/**
 * Écoute les événements admin en direct — « signalement », « visite » — et
 * appelle `onEvenement(type)` à la seconde où le serveur en publie un.
 *
 * REMPLACE UN SONDAGE PÉRIODIQUE, PAS UNE CONNEXION EN PLUS.
 * -----------------------------------------------------------
 * Une première version relançait l'appel toutes les 30 secondes, que
 * quelque chose se soit produit ou non. Ici, rien ne part tant que le
 * serveur n'a rien à annoncer — un seul flux tenu ouvert le prévient dès
 * qu'un vrai événement a lieu, jamais avant, jamais après.
 *
 * `EventSource` EST INUTILISABLE ICI, comme pour le flux de cours (voir
 * `consommerFlux` dans `chatApi.js`) : il ne sait pas porter l'en-tête
 * d'autorisation. On relit donc le flux à la main, avec `fetch`.
 *
 * SE RECONNECTE TOUT SEUL. Une connexion tenue ouverte des heures finit par
 * tomber — coupure réseau, redémarrage du serveur, mise en veille du poste.
 * Sans reconnexion, l'écran resterait silencieux pour de bon après le
 * premier incident, sans que rien ne le signale à l'administrateur.
 *
 * ON REFERME LE FLUX, ON N'INTERROMPT PAS LA REQUÊTE.
 * ---------------------------------------------------
 * Quitter l'écran coupait tout via `AbortController.abort()`, et c'est de là
 * que venait le « signal is aborted without reason » affiché en quittant les
 * onglets Signalements et Fréquentation.
 *
 * `abort()` ERRE la requête et tout ce qui pend dessus. `reader.cancel()`, à
 * l'inverse, REFERME le flux : la lecture en attente se résout normalement
 * (`done: true`), la connexion se termine, et le serveur voit partir son
 * abonné comme il le verrait pour un onglet fermé. C'est la façon prévue
 * d'arrêter de lire un flux qu'on a fini d'écouter, et il n'y a plus
 * d'`abort()` nulle part ici.
 *
 * Reste le court instant où la réponse n'est pas encore arrivée et où il n'y
 * a donc rien à refermer : `arrete` est alors relu dès qu'elle arrive, et
 * c'est son corps qu'on annule avant de repartir. Rien ne traîne.
 */
export function useEvenementsAdmin(onEvenement) {
  const callbackRef = useRef(onEvenement);
  callbackRef.current = onEvenement;

  useEffect(() => {
    let arrete = false;

    // Le lecteur du flux en cours, quand il y en a un : c'est la seule prise
    // dont le nettoyage a besoin pour refermer proprement.
    let lecteurActuel = null;

    const ecouter = async () => {
      while (!arrete) {
        let reponse = null;

        try {
          const entete = await enTeteAuth();

          // En développement, React monte, démonte puis remonte chaque écran
          // une première fois exprès (StrictMode) : la sortie peut tomber
          // pendant cette attente, avant même que la requête ne parte.
          if (arrete) return;

          reponse = await fetch(`${API_BASE_URL}/admin/evenements`, {
            headers: entete ? { Authorization: entete } : {},
          });

          // Partis entre-temps : on referme ce qui vient d'arriver plutôt que
          // de laisser une connexion ouverte derrière soi.
          if (arrete) return;

          if (!reponse.ok || !reponse.body) throw new Error('Flux indisponible.');

          const reader = reponse.body.getReader();
          lecteurActuel = reader;
          reponse = null;

          // Une connexion qui tombe d'elle-même — réseau coupé, serveur
          // redémarré — erre le flux : ce rejet-là existe pour de bon, et il
          // doit être regardé, sinon il remonte comme rejet non géré.
          reader.closed.catch(() => {});

          const decoder = new TextDecoder();
          let tampon = '';

          for (;;) {
            const { done, value } = await reader.read();
            if (done || arrete) break;

            tampon += decoder.decode(value, { stream: true });

            const evenements = tampon.split('\n\n');
            tampon = evenements.pop() ?? '';

            for (const evenement of evenements) {
              // Le serveur envoie aussi des lignes de commentaire (« : … »)
              // pour tenir la connexion en vie : aucune ligne « data: », rien
              // à faire, on passe.
              const ligne = evenement.split('\n').find((l) => l.startsWith('data: '));
              if (!ligne) continue;

              try {
                const charge = JSON.parse(ligne.slice(6));
                if (charge.type) callbackRef.current(charge.type);
              } catch {
                // fragment illisible : on l'ignore plutôt que de casser le flux
              }
            }
          }
        } catch {
          if (arrete) return;
        } finally {
          lecteurActuel = null;

          // Une réponse reçue mais jamais lue — inutilisable, ou arrivée
          // après la sortie — garde sa connexion ouverte tant qu'on ne la
          // referme pas.
          reponse?.body?.cancel().catch(() => {});
        }

        // La connexion est tombée : on retente dans quelques secondes plutôt
        // que de boucler à vide et de marteler le serveur.
        if (!arrete) await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    };

    // Lancé sans être attendu : un `.catch` est le seul endroit où un rejet
    // resté possible pourrait encore être vu.
    ecouter().catch(() => {});

    return () => {
      arrete = true;
      lecteurActuel?.cancel().catch(() => {});
    };
  }, []);
}
