import { useEffect, useState } from 'react';
import {
  changerAccesEleve,
  getCodeEleve,
  regenererCodeEleve,
} from '../lib/api/elevesApi';

/**
 * Le code d'accès d'un enfant, côté parent.
 *
 * IL EST AFFICHÉ EN CLAIR, ET C'EST LE POINT DE TOUT
 * -------------------------------------------------
 * Un enfant oublie son code, le perd, se déconnecte. Si le parent ne pouvait
 * pas le RELIRE, il faudrait en régénérer un à chaque fois — et redonner le
 * nouveau à l'enfant. Ingérable pour un CE1.
 *
 * C'est pour ça qu'il n'est pas haché en base, contrairement à un mot de
 * passe. Ce qui rend ce choix tenable : ce code n'ouvre QUE les cours de cet
 * enfant. Pas la facturation, pas ses frères et sœurs, pas le compte du
 * parent.
 *
 * CHARGÉ À LA DEMANDE
 * ------------------
 * Le code n'apparaît qu'au clic. Une liste de six enfants afficherait sinon
 * six codes d'accès à l'écran, visibles de tous ceux qui passent derrière —
 * et déclencherait six requêtes pour une information qu'on regarde deux fois
 * par an.
 */
export default function CodeEnfant({ eleve }) {
  const [etat, setEtat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [copie, setCopie] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (etat) return;

    setChargement(true);

    getCodeEleve(eleve.id)
      .then(({ data }) => setEtat(data))
      .catch(() => setErreur('Impossible de charger le code.'))
      .finally(() => setChargement(false));
  }, [etat, eleve.id]);

  const regenerer = async () => {
    if (!window.confirm(
      `Créer un nouveau code pour ${eleve.prenom} ?\n\n`
      + 'L\'ancien cessera de marcher immédiatement, et les appareils déjà '
      + 'connectés seront déconnectés.',
    )) return;

    setChargement(true);
    setErreur(null);

    try {
      const { data } = await regenererCodeEleve(eleve.id);
      setEtat((precedent) => ({ ...precedent, code: data.code }));
      setCopie(false);
    } catch {
      setErreur('Impossible de créer un nouveau code.');
    } finally {
      setChargement(false);
    }
  };

  const basculerAcces = async () => {
    const suspendre = !etat?.suspendu;

    setChargement(true);
    setErreur(null);

    try {
      await changerAccesEleve(eleve.id, suspendre);
      setEtat((precedent) => ({ ...precedent, suspendu: suspendre }));
    } catch {
      setErreur('Impossible de changer l’accès.');
    } finally {
      setChargement(false);
    }
  };

  const copier = () => {
    // `clipboard` échoue hors HTTPS et sur certains navigateurs. Le code reste
    // affiché en grand juste à côté : on ne bloque rien, on ne signale rien.
    navigator.clipboard?.writeText(etat.code)
      .then(() => setCopie(true))
      .catch(() => {});
  };

  return (
    <div className="code-enfant">
      {erreur && <p className="code-enfant__erreur">{erreur}</p>}

      {chargement && !etat && <p className="code-enfant__note">Un instant…</p>}

      {etat && (
        <>
          <div className="code-enfant__haut">
            <code className="code-enfant__valeur">{etat.code}</code>

            <button type="button" className="btn-ghost btn-ghost--mini" onClick={copier}>
              {copie ? 'Copié' : 'Copier'}
            </button>
          </div>

          <p className="code-enfant__note">
            {eleve.prenom} tape ce code sur <strong>mimia.fr</strong>, bouton
            « J’ai un code ». Il restera connecté sur son appareil : il n’aura
            pas à le retaper.
          </p>

          {etat.suspendu && (
            <p className="code-enfant__suspendu">
              Accès suspendu — le code ne marche plus tant que vous ne le rouvrez pas.
            </p>
          )}

          <div className="code-enfant__actions">
            <button
              type="button"
              className="btn-ghost btn-ghost--mini"
              onClick={basculerAcces}
              disabled={chargement}
            >
              {etat.suspendu ? 'Rouvrir l’accès' : 'Suspendre l’accès'}
            </button>

            {/* Régénérer est le geste qui casse quelque chose : il vient en
                dernier, en discret, et demande confirmation. */}
            <button
              type="button"
              className="btn-ghost btn-ghost--mini btn-ghost--danger"
              onClick={regenerer}
              disabled={chargement}
            >
              Nouveau code
            </button>

          </div>
        </>
      )}
    </div>
  );
}
