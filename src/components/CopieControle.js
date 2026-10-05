import feuillePng from '../assets/feuille.webp';
import scanPng from '../assets/scan.png';
import {
  boutonsCopie, QUESTION_COPIE, STYLE_AIDE, STYLE_EXPLIQUE,
} from '../lib/storage/copieControle';

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

/**
 * LES DESSINS DE L'APPLICATION À LA PLACE DES ÉMOJIS — Camara, le 20/09/2026.
 *
 * Un émoji est dessiné par le système : il change de style d'un appareil à
 * l'autre, et n'appartient à aucune charte. Ces deux-là sont les nôtres, et
 * les mêmes que ceux du scan par téléphone.
 *
 * DÉCORATIFS : le libellé du bouton dit déjà tout, d'où l'`alt` vide.
 */
export function Icone({ scan = false }) {
  return (
    <img
      src={scan ? scanPng : feuillePng}
      alt=""
      aria-hidden="true"
      className="copie-controle__icone"
    />
  );
}

/**
 * Une pièce : reçue par le professeur, IMPORTÉE (dans la file, elle partira
 * avec l'autre — Camara, le 26/09/2026), ou en attente. Une pièce importée
 * se retire : l'enfant qui s'est trompé de photo n'a pas à l'envoyer.
 */
function Etat({
  libelle, recu, importe = false, onRetirer = null, disabled = false, feminin = false,
}) {
  const coche = recu || importe;

  return (
    <li className={`copie-controle__etat${coche ? ' est-recu' : ''}`}>
      <span aria-hidden="true">{coche ? '✓' : '○'}</span>
      {' '}
      {libelle}
      {' — '}
      {recu ? `reçu${feminin ? 'e' : ''}` : importe ? `importé${feminin ? 'e' : ''}` : 'en attente'}
      {importe && !recu && onRetirer && (
        <button
          type="button"
          className="copie-controle__retirer"
          aria-label={`Retirer ${libelle.toLowerCase()}`}
          disabled={disabled}
          onClick={onRetirer}
        >
          ×
        </button>
      )}
    </li>
  );
}

/**
 * LA CORRECTION, ERREUR PAR ERREUR — Camara, le 26/09/2026.
 *
 * Le professeur présente une erreur ; la carte demande alors comment
 * l'enfant veut la corriger : « Je t'aide à te corriger » (il trouve lui-même,
 * le professeur ne donne jamais la réponse) ou « Je corrige et t'explique ».
 * En « je t'aide », l'enfant qui bloque garde une sortie pour CETTE erreur :
 * « Finalement, corrige et explique-moi » — c'est lui qui la prend, jamais le
 * professeur. L'erreur suivante repose la question, jusqu'à la dernière.
 */
function ChoixCorrection({
  erreur, total, style, termine, disabled, onStyle,
}) {
  if (termine) {
    return (
      <div className="copie-controle" role="status">
        <p className="copie-controle__question">
          ✓ Correction terminée. Bravo d’être allé jusqu’au bout de ta copie !
        </p>
      </div>
    );
  }

  // Pas encore d'erreur présentée : le professeur regarde la copie.
  if (!erreur) {
    return (
      <div className="copie-controle" role="status">
        <p className="copie-controle__question">
          Ton professeur a tout ce qu’il faut : il va te montrer ta première erreur.
        </p>
      </div>
    );
  }

  const nom = `Erreur ${erreur}${total ? ` sur ${total}` : ''}`;

  if (!style) {
    return (
      <div className="copie-controle" role="group" aria-label="La correction de ta copie">
        <p className="copie-controle__question">{nom} : comment veux-tu la corriger ?</p>

        <div className="copie-controle__choix copie-controle__choix--style">
          <button
            type="button"
            className="btn btn--compact"
            disabled={disabled}
            onClick={() => onStyle(STYLE_AIDE)}
          >
            Je t’aide à te corriger
          </button>
          <button
            type="button"
            className="btn btn--compact btn--fantome"
            disabled={disabled}
            onClick={() => onStyle(STYLE_EXPLIQUE)}
          >
            Je corrige et t’explique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="copie-controle" role="group" aria-label="La correction de ta copie">
      <p className="copie-controle__question">
        {nom} —{' '}
        {style === STYLE_AIDE
          ? 'tu te corriges toi-même : ton professeur t’aide à trouver, sans te donner la réponse.'
          : 'ton professeur la corrige et t’explique pourquoi.'}
      </p>

      {/* UN VRAI BOUTON, PAS UN LIEN — Camara, le 26/09/2026 : « ce n'est pas
          assez visible ». C'est la seule sortie de l'enfant qui bloque ; un
          lien discret sous le texte, il ne le voyait pas, et il restait
          coincé sur une erreur qu'il ne trouvait pas. */}
      {style === STYLE_AIDE && (
        <button
          type="button"
          className="btn btn--compact copie-controle__basculer"
          disabled={disabled}
          onClick={() => onStyle(STYLE_EXPLIQUE)}
        >
          Finalement, corrige et explique-moi
        </button>
      )}
    </div>
  );
}

export default function CopieControle({
  etat, disabled, onChoisir, onFichier, onScanner, onRevenir = null, onStyle = null,
  importes = { enonce: false, copie: false }, enImport = false, erreur = null, onRetirer = null,
  onPhoto = null,
}) {
  if (!etat) return null;

  if (etat.complet && onStyle) {
    return (
      <ChoixCorrection
        erreur={etat.erreur}
        total={etat.total}
        style={etat.style}
        termine={etat.termine}
        disabled={disabled}
        onStyle={onStyle}
      />
    );
  }

  // Une pièce importée n'a plus de bouton : elle attend l'autre dans la file.
  const boutons = boutonsCopie({
    ...etat,
    enonceRecu: etat.enonceRecu || importes.enonce,
    copieRecue: etat.copieRecue || importes.copie,
  }, { photo: Boolean(onPhoto) });
  const bloque = disabled || enImport;

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

  const unImporte = (importes.enonce && !importes.copie) || (importes.copie && !importes.enonce);

  const consigne = etat.complet
    ? 'Ton professeur a tout ce qu’il faut. Vous regardez ça ensemble.'
    : enImport
      ? 'J’importe ton document…'
      : etat.separee && unImporte
        ? 'C’est noté ! Importe l’autre feuille : les deux partiront ensemble à ton professeur.'
        : etat.separee
          ? 'Importe l’énoncé et ta copie, dans l’ordre que tu veux.'
          : 'Importe ta copie.';

  return (
    <div className="copie-controle" role="group" aria-label="La copie de ton contrôle">
      <p className="copie-controle__question">{consigne}</p>

      <ul className="copie-controle__etats">
        {etat.separee && (
          <Etat
            libelle={LIBELLE_ENONCE}
            recu={etat.enonceRecu}
            importe={importes.enonce}
            disabled={bloque}
            onRetirer={onRetirer ? () => onRetirer('enonce') : null}
          />
        )}
        <Etat
          libelle={LIBELLE_COPIE}
          feminin
          recu={etat.copieRecue}
          importe={importes.copie}
          disabled={bloque}
          onRetirer={onRetirer ? () => onRetirer('copie') : null}
        />
      </ul>

      {/* N'EXISTE QUE SI L'ENFANT EST ARRIVÉ ICI PAR UN CHOIX — Camara, le
          20/09/2026 : s'être trompé de bouton doit se rattraper. Dans un bilan
          ordinaire, où le professeur propose lui-même de regarder la copie,
          `onRevenir` est absent et rien ne s'affiche : il n'y a pas de choix
          sur lequel revenir. */}
      {erreur && <p className="copie-controle__erreur" role="alert">{erreur}</p>}

      {onRevenir && !etat.copieRecue && !etat.enonceRecu && !importes.enonce && !importes.copie && (
        <button
          type="button"
          className="copie-controle__retour"
          disabled={disabled}
          onClick={onRevenir}
        >
          ← Finalement je n’ai pas de copie
        </button>
      )}

      {/* LES BOUTONS SOUS LEUR FEUILLE — Camara, le 26/09/2026 : chaque feuille
          a les mêmes moyens (importer, photographier, scanner). Rangés par
          feuille, l'enfant voit tout de suite lesquels concernent l'énoncé et
          lesquels sa copie. */}
      {['enonce', 'copie'].map((role) => {
        const siens = boutons.filter((b) => b.role === role);
        if (siens.length === 0) return null;

        const deuxFeuilles = boutons.some((b) => b.role !== role);

        return (
          <div key={role} className="copie-controle__groupe">
            {deuxFeuilles && (
              <p className="copie-controle__groupe-titre">
                {role === 'enonce' ? LIBELLE_ENONCE : LIBELLE_COPIE}
              </p>
            )}

            <div className="copie-controle__boutons">
              {siens.map((b) => {
                if (b.geste === 'photo') {
                  return (
                    <button
                      key={b.cle}
                      type="button"
                      className="btn btn--compact copie-controle__bouton"
                      disabled={bloque}
                      onClick={() => onPhoto(b.role)}
                    >
                      <Icone scan /> {b.libelle}
                    </button>
                  );
                }

                if (b.scanner && onScanner) {
                  return (
                    <button
                      key={b.cle}
                      type="button"
                      className="btn btn--compact copie-controle__bouton"
                      disabled={bloque}
                      onClick={() => onScanner(b.role)}
                    >
                      <Icone scan /> {b.libelle}
                    </button>
                  );
                }

                return (
                  <label
                    key={b.cle}
                    className={`btn btn--compact copie-controle__bouton${bloque ? ' est-desactive' : ''}`}
                  >
                    <Icone scan={b.scanner} /> {b.libelle}
                    <input
                      type="file"
                      hidden
                      disabled={bloque}
                      accept={b.scanner ? 'image/*' : 'image/*,application/pdf'}
                      capture={b.scanner ? 'environment' : undefined}
                      onChange={(e) => {
                        const fichier = e.target.files?.[0];
                        e.target.value = '';
                        if (fichier) onFichier(b.role, fichier);
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
