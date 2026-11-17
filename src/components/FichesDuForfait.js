import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { acheterFiches, getFichesFamille } from '../lib/api/abonnementApi';
import { acheterPodcasts, getPodcastsDuForfait } from '../lib/api/mesPodcastsApi';
import { useFichesRevision, usePodcasts } from '../lib/storage/modeTest';
import { Confirmation, Jauge, dateCourte, euros } from './Quota';
import { messageSolo } from './podcasts/PodcastsNonInclus';

const credits = (n) => `${n} crédit${n > 1 ? 's' : ''}`;

/**
 * LES FICHES DE RÉVISION DANS « MON FORFAIT » — Camara, le 16/10/2026 : « pour
 * payer les packs, ça doit se faire via le compte parent dans l'onglet Mon
 * forfait, mais bien séparé des heures de cours ».
 *
 * UN ENCADRÉ À PART, sous celui des heures : les deux ne se mélangent jamais.
 * Les heures valent pour la période et ne se reportent pas ; les fiches en
 * réserve appartiennent à la famille et n'expirent pas. Les mettre dans le
 * même encadré ferait croire au parent que ses fiches partent avec le mois.
 *
 * L'UNITÉ EST LE COURS IMPORTÉ (16/10/2026) : un cours découpé en sept fiches
 * compte pour un. On y lit : les crédits de la famille (1 crédit = 1 cours),
 * les cours du mois de chaque enfant (vingt chacun, remis à zéro avec les
 * heures), et les deux packs.
 *
 * Invisible tant que le module est éteint dans Admin › Modes.
 */
/**
 * LES PODCASTS (15/11/2026) : le même encadré, un compteur à part — `module="podcasts"` change la source, l'achat et
 * les mots. Deux encadrés côte à côte dans « Mon forfait », jamais mêlés.
 */
/**
 * `fenetre` (16/11/2026) : l'encadré ouvert depuis le bouton « Acheter des crédits » des pages fiches et podcasts
 * (mesFiches/AchatCredits.js). Là, se taire laisserait une fenêtre vide : il dit pourquoi rien n'est à vendre.
 */
export default function FichesDuForfait({ module = 'fiches', fenetre = false }) {
  const podcasts = module === 'podcasts';
  const fichesOuvertes = useFichesRevision();
  const podcastsOuverts = usePodcasts();
  const ouvert = podcasts ? podcastsOuverts : fichesOuvertes;
  const quoi = podcasts ? 'podcasts' : 'cours';
  const [etat, setEtat] = useState(null);
  const [aAcheter, setAAcheter] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [charge, setCharge] = useState(false);

  // RETOUR DE STRIPE (`?achat=fiches`) : le webhook crédite la famille
  // quelques secondes après le paiement. On le dit, et on relit deux fois.
  const [retourAchat] = useState(
    () => new URLSearchParams(window.location.search).get('achat') === (podcasts ? 'podcasts' : 'fiches'),
  );

  const charger = useCallback(async () => {
    try {
      const { data } = await (podcasts ? getPodcastsDuForfait() : getFichesFamille());
      setEtat(data);
    } catch {
      // Sans cet encadré, le forfait reste lisible : on se tait.
      setEtat(null);
    } finally {
      setCharge(true);
    }
  }, [podcasts]);

  useEffect(() => {
    if (ouvert) charger();
  }, [ouvert, charger]);

  useEffect(() => {
    if (!ouvert || !retourAchat) return undefined;
    const minuteurs = [2500, 7000].map((delai) => setTimeout(charger, delai));
    return () => minuteurs.forEach(clearTimeout);
  }, [ouvert, retourAchat, charger]);

  // Dans la fenêtre, une phrase plutôt qu'une boîte vide.
  const indisponible = (texte) => (fenetre ? <p className="quota__resume achat-credits__message">{texte}</p> : null);

  if (!ouvert) return indisponible(`Les ${podcasts ? 'podcasts' : 'fiches de révision'} ne sont pas ouverts pour le moment.`);
  if (!etat) return indisponible(charge ? 'Les crédits ne sont pas disponibles pour le moment. Réessayez dans un instant.' : 'Chargement…');

  const payer = async () => {
    setErreur(null);
    setEnvoi(true);
    try {
      const { data } = await (podcasts ? acheterPodcasts(aAcheter.code) : acheterFiches(aAcheter.code));
      if (data?.urlPaiement) {
        window.location.assign(data.urlPaiement);
        return;
      }
      // Compte exempté : crédité sur-le-champ, sans paiement.
      setAAcheter(null);
      setEnvoi(false);
      await charger();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Le paiement n’a pas pu s’ouvrir. Réessayez dans un instant.');
      setEnvoi(false);
    }
  };

  const { credits: reserve = 0, maximum = 20, remiseLe, enfants = [], packs = [] } = etat;

  // MASQUÉ SANS VRAI FORFAIT — Camara, le 16/10/2026 : « en essai, masque la
  // partie fiche de révision qui permet d'acheter des crédits ». Même chose en
  // pause ou sans abonnement : les fiches y sont fermées, rien à vendre ni à
  // montrer.
  if (etat.forfait === false) {
    return fenetre ? (
      <p className="quota__resume achat-credits__message">
        Les crédits s’achètent avec un abonnement en cours, pas pendant l’essai ni en pause.{' '}
        <Link to="/tarifs">Voir les formules</Link>
      </p>
    ) : null;
  }
  // PAS DE PODCASTS AVEC STARTER (15/11/2026) : pas de crédits de podcasts à vendre.
  if (podcasts && etat.nonInclus) return indisponible(messageSolo(false));

  return (
    <div className="quota quota--fiches">
      {aAcheter && (
        <Confirmation
          titre={`Ajouter ${credits(aAcheter.fiches)} de ${podcasts ? 'podcasts' : 'fiches de révision'} ?`}
          resume={
            <>
              Vous allez acheter <strong>{credits(aAcheter.fiches)}</strong>{' '}
              pour <strong>{euros(aAcheter.prixCentimes)}</strong>.
            </>
          }
          consequences={[
            'Vous allez être redirigé vers le paiement sécurisé.',
            podcasts
              ? '1 crédit = 1 cours transformé en podcast, quel que soit le nombre d’épisodes ; 2 crédits pour un cours de plus de 10 pages.'
              : '1 crédit = 1 cours importé, quel que soit le nombre de fiches qu’il donne ; 2 crédits pour un cours de plus de 10 pages.',
            `Les crédits servent à tous vos enfants, une fois leurs ${maximum} ${quoi} du mois utilisés.`,
            'Ils sont ajoutés dès l’encaissement, en quelques secondes, et n’expirent jamais.',
          ]}
          libelle={`Confirmer — ${euros(aAcheter.prixCentimes)}`}
          enCours={envoi}
          onAnnuler={() => setAAcheter(null)}
          onConfirmer={payer}
        />
      )}

      <header className="quota__entete">
        <div>
          <strong className="quota__offre">{podcasts ? 'Podcasts' : 'Fiches de révision'}</strong>
          <span className="quota__periode">
            {maximum} {quoi} par enfant et par mois · remis à zéro le {dateCourte(remiseLe)}
          </span>
        </div>

        <span className={`quota__restant quota__restant--${reserve > 0 ? 'normal' : 'vide'}`}>
          <strong>{reserve}</strong>
          <span>{reserve > 1 ? 'crédits' : 'crédit'}</span>
        </span>
      </header>

      {retourAchat && (
        <p className="quota__resume" role="status">
          Merci ! Les crédits sont ajoutés dès que le paiement est confirmé, en quelques secondes.
        </p>
      )}

      {erreur && <div className="alert">{erreur}</div>}

      {enfants.length > 0 && (
        <ul className="quota-enfants">
          {enfants.map((enfant) => (
            <li key={enfant.id}>
              <span className="quota-enfants__nom">{enfant.prenom}</span>
              <Jauge part={enfant.utilisees / maximum} />
              <span className="quota-enfants__valeur">
                {enfant.utilisees} / {maximum} {quoi}
              </span>
            </li>
          ))}
        </ul>
      )}

      {packs.length > 0 && (
        <section className="quota-achat">
          <h3>Acheter des crédits</h3>
          <p className="quota-achat__explication">
            {podcasts
              ? `Un enfant a utilisé ses ${maximum} podcasts du mois ? Chaque crédit lui permet de transformer un cours de plus en podcast, quel que soit le nombre d’épisodes. Les crédits servent à tous vos enfants et n’expirent jamais.`
              : `Un enfant a utilisé ses ${maximum} cours du mois ? Chaque crédit lui permet d’importer un cours de plus, quel que soit le nombre de fiches qu’il en tire. Les crédits servent à tous vos enfants et n’expirent jamais.`}
          </p>

          <div className="quota-achat__packs">
            {packs.map((pack) => (
              <button
                key={pack.code}
                type="button"
                className="pack"
                onClick={() => setAAcheter(pack)}
                disabled={envoi}
              >
                <span className="pack__heures">+{credits(pack.fiches)}</span>
                <span className="pack__prix">{euros(pack.prixCentimes)}</span>
                <span className="pack__mention">achat unique</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
