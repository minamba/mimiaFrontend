import { useCallback, useEffect, useState } from 'react';
import { getFournisseurs, verifierFournisseurs } from '../lib/api/adminApi';
import Onglets from './Onglets';
import TarifsFournisseurs from './TarifsFournisseurs';

/**
 * L'onglet « Anthropic / OpenAI » : les deux fournisseurs dont le produit
 * dépend, et s'ils acceptent encore de travailler.
 *
 * NÉ DE LA PANNE DU 14/09/2026 : plus de voix ni de micro après un
 * redémarrage, et c'était le crédit OpenAI. Le serveur essaie un appel
 * minuscule chez chacun toutes les trente minutes et écrit aux
 * administrateurs quand l'un refuse ; cet écran montre ce qu'il a constaté.
 *
 * L'ÉTAT EST TOUJOURS ÉCRIT EN TOUTES LETTRES à côté du voyant : la couleur
 * seule ne porte jamais l'information.
 */

const STATUTS = {
  ok: { ton: 'ok', libelle: 'Fonctionne' },
  credit_epuise: {
    ton: 'bloque',
    libelle: 'Crédit épuisé',
    conseil: 'Les appels sont refusés faute de crédit. Rechargez le compte : le retour se verra dans les cinq minutes.',
  },
  cle_refusee: {
    ton: 'bloque',
    libelle: 'Clé refusée',
    conseil: 'La clé API est invalide ou révoquée. Elle se remplace dans la configuration du serveur.',
  },
  limite: {
    ton: 'attention',
    libelle: 'Freiné',
    conseil: 'Trop de requêtes à la fois. Ça se règle seul en quelques minutes.',
  },
  indisponible: {
    ton: 'attention',
    libelle: 'Panne chez le fournisseur',
    conseil: 'Le service est surchargé ou en panne de leur côté. Rien à faire chez nous.',
  },
  injoignable: {
    ton: 'attention',
    libelle: 'Injoignable',
    conseil: "Le serveur n'a pas pu joindre le fournisseur : réseau, ou délai dépassé.",
  },
  erreur: {
    ton: 'attention',
    libelle: 'Réponse inattendue',
    conseil: 'Le détail technique ci-dessous dit ce que le fournisseur a répondu.',
  },
  non_configure: {
    ton: 'neutre',
    libelle: 'Non configuré',
    conseil: 'Aucune clé API dans la configuration du serveur.',
  },
  inconnu: {
    ton: 'neutre',
    libelle: 'Pas encore vérifié',
    conseil: 'La première vérification a lieu une minute après le démarrage du serveur.',
  },
};

const statutDe = (code) => STATUTS[code] ?? STATUTS.erreur;

const dateHeure = (iso) =>
  iso
    ? new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      })
    : '—';

/** « à l'instant », « il y a 12 min », « il y a 3 h ». */
export function ilYA(iso, maintenant = Date.now()) {
  if (!iso) return 'jamais';

  const minutes = Math.floor((maintenant - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;

  return `le ${dateHeure(iso)}`;
}

function CarteFournisseur({ etat, maintenant }) {
  const statut = statutDe(etat.statut);
  const titreId = `fournisseur-${etat.code}`;

  return (
    <article className={`fournisseur fournisseur--${statut.ton}`} aria-labelledby={titreId}>
      <header className="fournisseur__entete">
        <h3 id={titreId}>{etat.nom}</h3>
        <span className="fournisseur__statut">
          <span className="fournisseur__voyant" aria-hidden="true" />
          {statut.libelle}
        </span>
      </header>

      <p className="fournisseur__usage">{etat.usage}</p>

      {statut.conseil && <p className="fournisseur__conseil">{statut.conseil}</p>}

      <dl className="fournisseur__faits">
        <div>
          <dt>Vérifié</dt>
          <dd>{ilYA(etat.verifieLe, maintenant)}</dd>
        </div>

        {etat.statutDepuis && (
          <div>
            <dt>Dans cet état depuis</dt>
            <dd>{dateHeure(etat.statutDepuis)}</dd>
          </div>
        )}

        {etat.statut !== 'ok' && etat.verifieLe && (
          <div>
            <dt>Dernier bon fonctionnement</dt>
            <dd>{etat.dernierSuccesLe ? dateHeure(etat.dernierSuccesLe) : 'aucun depuis le démarrage'}</dd>
          </div>
        )}

        {etat.statut === 'ok' && etat.dureeMs != null && (
          <div>
            <dt>Temps de réponse</dt>
            <dd>{etat.dureeMs} ms</dd>
          </div>
        )}

        {etat.modele && (
          <div>
            <dt>Modèle essayé</dt>
            <dd><code>{etat.modele}</code></dd>
          </div>
        )}
      </dl>

      {(etat.codeErreur || etat.detail) && (
        <p className="fournisseur__technique">
          <code>{[etat.codeHttp, etat.codeErreur].filter(Boolean).join(' · ')}</code>
          {etat.detail && <span> {etat.detail}</span>}
        </p>
      )}

      <a
        className={etat.statut === 'credit_epuise' ? 'btn btn--compact' : 'btn-ghost btn-ghost--mini'}
        href={etat.lienFacturation}
        target="_blank"
        rel="noreferrer"
      >
        {etat.statut === 'credit_epuise' ? 'Recharger le compte' : 'Voir le solde'} ↗
      </a>
    </article>
  );
}

function resumer(etats) {
  if (etats.some((e) => statutDe(e.statut).ton === 'bloque')) {
    return 'Un fournisseur refuse de travailler : une partie du produit est coupée.';
  }
  if (etats.length > 0 && etats.every((e) => e.statut === 'ok')) {
    return 'Les deux fournisseurs fonctionnent.';
  }
  if (etats.some((e) => statutDe(e.statut).ton === 'attention')) {
    return 'Un fournisseur répond mal en ce moment.';
  }
  return null;
}

/**
 * L'ONGLET « ANTHROPIC / OPENAI », EN DEUX VUES — voulu par Camara le
 * 19/09/2026 : l'état des fournisseurs, et leurs tarifs.
 */
export default function FournisseursIA() {
  const [vue, setVue] = useState('etat');

  return (
    <>
      <Onglets
        mini
        etiquette="Fournisseurs"
        actif={vue}
        onChoisir={setVue}
        items={[
          { cle: 'etat', libelle: 'État' },
          { cle: 'tarifs', libelle: 'Tarifs' },
        ]}
      />

      {vue === 'etat' ? <EtatFournisseurs /> : <TarifsFournisseurs />}
    </>
  );
}

function EtatFournisseurs() {
  const [etats, setEtats] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [verification, setVerification] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  const charger = useCallback(({ silencieux } = {}) =>
    getFournisseurs()
      .then(({ data }) => {
        setEtats(Array.isArray(data) ? data : []);
        setErreur(null);
      })
      .catch(() => {
        if (!silencieux) setErreur("L'état des fournisseurs n'a pas pu être chargé.");
      })
      .finally(() => {
        setChargement(false);
        setMaintenant(Date.now());
      }), []);

  // Relu chaque minute : le worker vérifie de lui-même, et « il y a 2 min »
  // qui ne bouge jamais finirait par mentir.
  useEffect(() => {
    charger();
    const minuterie = setInterval(() => charger({ silencieux: true }), 60000);
    return () => clearInterval(minuterie);
  }, [charger]);

  const verifier = async () => {
    setVerification(true);
    setErreur(null);

    try {
      const { data } = await verifierFournisseurs();
      setEtats(Array.isArray(data) ? data : []);
      setMaintenant(Date.now());
    } catch {
      setErreur("La vérification n'a pas pu être lancée.");
    } finally {
      setVerification(false);
    }
  };

  if (chargement && etats.length === 0) return <p className="etat-vide">Chargement…</p>;

  const resume = resumer(etats);

  return (
    <div className="fournisseurs">
      {erreur && <div className="alert">{erreur}</div>}

      <div className="fournisseurs__barre">
        {resume && <p className="fournisseurs__resume">{resume}</p>}
        <button type="button" className="btn btn--compact" onClick={verifier} disabled={verification}>
          {verification ? 'Vérification…' : 'Vérifier maintenant'}
        </button>
      </div>

      <div className="fournisseurs__grille">
        {etats.map((etat) => (
          <CarteFournisseur key={etat.code} etat={etat} maintenant={maintenant} />
        ))}
      </div>

      <p className="fournisseurs__note">
        Le serveur essaie un appel minuscule chez chacun toutes les 30 minutes (toutes les
        5 minutes tant que l'un est en défaut). Un message part dans le groupe Telegram des
        signalements dès qu'un état passe au rouge ou à l'orange, et un autre quand ça repart ;
        un courriel s'y ajoute pour le crédit épuisé et la clé refusée. Le solde exact ne se lit
        pas par l'API : il reste sur les sites d'Anthropic et d'OpenAI.
      </p>
    </div>
  );
}
