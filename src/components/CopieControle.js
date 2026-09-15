import { boutonsCopie, QUESTION_COPIE } from '../lib/storage/copieControle';

/**
 * LA CARTE « COPIE DU CONTRÔLE », DANS LE FIL.
 *
 * Elle vit à la suite du dernier message, comme la copie de dictée : c'est là
 * que l'élève regarde. Voir `copieControle.js` pour la mécanique.
 *
 * `onScanner` est fourni quand l'appareil a une caméra mais n'est pas un
 * téléphone : on ouvre alors la caméra de la séance. Sur téléphone, le bouton
 * est un sélecteur de fichier avec `capture` — le système ouvre directement
 * l'appareil photo, ce qui est le vrai geste de « scanner » une feuille.
 */
const LIBELLE_ENONCE = 'L’énoncé';
const LIBELLE_COPIE = 'Ta copie';

function Etat({ libelle, recu }) {
  return (
    <li className={`copie-controle__etat${recu ? ' est-recu' : ''}`}>
      <span aria-hidden="true">{recu ? '✓' : '○'}</span>
      {' '}
      {libelle}
      {' — '}
      {recu ? 'reçue' : 'en attente'}
    </li>
  );
}

export default function CopieControle({ etat, disabled, onChoisir, onFichier, onScanner }) {
  if (!etat) return null;

  const boutons = boutonsCopie(etat);

  if (etat.separee === null) {
    return (
      <div className="copie-controle" role="group" aria-label="La copie de ton contrôle">
        <p className="copie-controle__question">{QUESTION_COPIE}</p>

        <div className="copie-controle__choix">
          <button
            type="button"
            className="btn btn--compact"
            disabled={disabled}
            onClick={() => onChoisir(true)}
          >
            Oui
          </button>
          <button
            type="button"
            className="btn btn--compact btn--fantome"
            disabled={disabled}
            onClick={() => onChoisir(false)}
          >
            Non
          </button>
        </div>
      </div>
    );
  }

  const consigne = etat.complet
    ? 'Ton professeur a tout ce qu’il faut. Vous regardez ça ensemble.'
    : etat.separee
      ? 'Envoie l’énoncé et ta copie, dans l’ordre que tu veux.'
      : 'Envoie ta copie.';

  return (
    <div className="copie-controle" role="group" aria-label="La copie de ton contrôle">
      <p className="copie-controle__question">{consigne}</p>

      <ul className="copie-controle__etats">
        {etat.separee && <Etat libelle={LIBELLE_ENONCE} recu={etat.enonceRecu} />}
        <Etat libelle={LIBELLE_COPIE} recu={etat.copieRecue} />
      </ul>

      {boutons.length > 0 && (
        <div className="copie-controle__boutons">
          {boutons.map((b) => (
            b.scanner && onScanner ? (
              <button
                key={b.cle}
                type="button"
                className="btn btn--compact copie-controle__bouton"
                disabled={disabled}
                onClick={onScanner}
              >
                <span aria-hidden="true">📷</span> {b.libelle}
              </button>
            ) : (
              <label
                key={b.cle}
                className={`btn btn--compact copie-controle__bouton${disabled ? ' est-desactive' : ''}`}
              >
                <span aria-hidden="true">{b.scanner ? '📷' : '📄'}</span> {b.libelle}
                <input
                  type="file"
                  hidden
                  disabled={disabled}
                  accept={b.scanner ? 'image/*' : 'image/*,application/pdf'}
                  capture={b.scanner ? 'environment' : undefined}
                  onChange={(e) => {
                    const fichier = e.target.files?.[0];
                    e.target.value = '';
                    if (fichier) onFichier(b.role, fichier);
                  }}
                />
              </label>
            )
          ))}
        </div>
      )}
    </div>
  );
}
