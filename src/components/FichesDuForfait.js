import { useCallback, useEffect, useState } from 'react';
import { acheterFiches, getFichesFamille } from '../lib/api/abonnementApi';
import { useFichesRevision } from '../lib/storage/modeTest';
import { Confirmation, Jauge, dateCourte, euros } from './Quota';

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
export default function FichesDuForfait() {
  const ouvert = useFichesRevision();
  const [etat, setEtat] = useState(null);
  const [aAcheter, setAAcheter] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  // RETOUR DE STRIPE (`?achat=fiches`) : le webhook crédite la famille
  // quelques secondes après le paiement. On le dit, et on relit deux fois.
  const [retourAchat] = useState(
    () => new URLSearchParams(window.location.search).get('achat') === 'fiches',
  );

  const charger = useCallback(async () => {
    try {
      const { data } = await getFichesFamille();
      setEtat(data);
    } catch {
      // Sans cet encadré, le forfait reste lisible : on se tait.
      setEtat(null);
    }
  }, []);

  useEffect(() => {
    if (ouvert) charger();
  }, [ouvert, charger]);

  useEffect(() => {
    if (!ouvert || !retourAchat) return undefined;
    const minuteurs = [2500, 7000].map((delai) => setTimeout(charger, delai));
    return () => minuteurs.forEach(clearTimeout);
  }, [ouvert, retourAchat, charger]);

  if (!ouvert || !etat) return null;

  const payer = async () => {
    setErreur(null);
    setEnvoi(true);
    try {
      const { data } = await acheterFiches(aAcheter.code);
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
  if (etat.forfait === false) return null;

  return (
    <div className="quota quota--fiches">
      {aAcheter && (
        <Confirmation
          titre={`Ajouter ${credits(aAcheter.fiches)} de fiches de révision ?`}
          resume={
            <>
              Vous allez acheter <strong>{credits(aAcheter.fiches)}</strong>{' '}
              pour <strong>{euros(aAcheter.prixCentimes)}</strong>.
            </>
          }
          consequences={[
            'Vous allez être redirigé vers le paiement sécurisé.',
            '1 crédit = 1 cours importé, quel que soit le nombre de fiches qu’il donne ; 2 crédits pour un cours de plus de 10 pages.',
            'Les crédits servent à tous vos enfants, une fois leurs 10 cours du mois utilisés.',
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
          <strong className="quota__offre">Fiches de révision</strong>
          <span className="quota__periode">
            {maximum} cours par enfant et par mois · remis à zéro le {dateCourte(remiseLe)}
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
                {enfant.utilisees} / {maximum} cours
              </span>
            </li>
          ))}
        </ul>
      )}

      {packs.length > 0 && (
        <section className="quota-achat">
          <h3>Acheter des crédits</h3>
          <p className="quota-achat__explication">
            Un enfant a utilisé ses {maximum} cours du mois ? Chaque crédit lui permet d’importer un
            cours de plus, quel que soit le nombre de fiches qu’il en tire. Les crédits servent à tous
            vos enfants et n’expirent jamais.
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
