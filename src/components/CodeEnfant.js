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
 *
 * `avecActions` : « Suspendre l'accès » et « Nouveau code » cassent quelque
 * chose, ils restent dans « Mon compte ». La fenêtre ouverte depuis « Vos
 * enfants » (`ListeEleves.js`) ne sert qu'à lire et copier le code — ce
 * qu'on vient y chercher quand l'enfant dit « j'ai oublié mon code ».
 */
export default function CodeEnfant({ eleve, avecActions = true }) {
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
            {/* UNE TOUCHE PAR CARACTÈRE. Un code dicté à l'autre bout de la
                pièce se lit caractère par caractère : les séparer à l'œil
                évite de sauter ou de doubler une lettre. Les touches sont
                décoratives ; le code entier reste lu d'un bloc par les
                lecteurs d'écran. */}
            <div className="code-enfant__valeur">
              <code className="visuellement-cache">{etat.code}</code>
              <span className="code-enfant__touches" aria-hidden="true">
                {[...etat.code].map((caractere, rang) => (caractere === '-'
                  ? <span key={rang} className="code-enfant__tiret" />
                  : <span key={rang} className="code-enfant__touche">{caractere}</span>))}
              </span>
            </div>

            <button
              type="button"
              className={`btn btn--compact code-enfant__copier ${copie ? 'code-enfant__copier--fait' : ''}`}
              onClick={copier}
            >
              <span className="code-enfant__copier-icone" aria-hidden="true">
                {copie ? '✓' : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
                  </svg>
                )}
              </span>
              {copie ? 'Copié' : 'Copier'}
            </button>
          </div>

          {/* TROIS GESTES NUMÉROTÉS plutôt qu'une phrase : c'est ce qu'on lit
              à l'enfant, dans l'ordre, en le regardant faire. */}
          <ol className="code-enfant__etapes">
            <li>
              <span className="code-enfant__num" aria-hidden="true">1</span>
              <span>Aller sur <strong>mimia.fr</strong></span>
            </li>
            <li>
              <span className="code-enfant__num" aria-hidden="true">2</span>
              <span>Cliquer sur <strong>« J’ai un code »</strong></span>
            </li>
            <li>
              <span className="code-enfant__num" aria-hidden="true">3</span>
              <span>Taper ce code</span>
            </li>
          </ol>

          <p className="code-enfant__note">
            Ensuite, plus besoin de le retaper : {eleve.prenom} reste connecté
            sur cet appareil.
          </p>

          {/* Affiché même sans les actions : un code qui ne marche pas doit
              le dire, sinon le parent le redonne à l'enfant pour rien. */}
          {etat.suspendu && (
            <p className="code-enfant__suspendu">
              Accès suspendu — le code ne marche plus tant que vous ne le rouvrez pas.
            </p>
          )}

          {avecActions && (
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
          )}
        </>
      )}
    </div>
  );
}
