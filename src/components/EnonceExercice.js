import cameraPng from '../assets/cam_2.png';
import feuillePng from '../assets/feuille.webp';
import scanPng from '../assets/scan.png';
import {
  AIDE_ENONCE, boutonsEnonce, QUESTION_CHOIX, QUESTION_ENONCE,
} from '../lib/storage/enonceExercice';

// Les dessins de l'application, pas les émojis du système — Camara, le
// 20/09/2026 : la feuille pour importer, le scanner pour scanner, et `cam_2`
// pour la prise de vue.
const ICONES = { fichier: feuillePng, photo: cameraPng, scan: scanPng };

/**
 * LA CARTE « ENVOIE L'ÉNONCÉ », DANS LE FIL.
 *
 * Trois boutons — Camara, le 20/09/2026 : importer, prendre en photo, scanner.
 * Elle se pose à la suite du dernier message du professeur, là où l'enfant
 * regarde déjà.
 *
 * CHAQUE GESTE A SON CHEMIN, et c'est ce qui justifie trois boutons plutôt
 * qu'un menu :
 *
 *   - `fichier` : un sélecteur de fichier ordinaire, images et PDF.
 *   - `photo` : la caméra de la séance, celle qui est déjà à l'écran. Le
 *     bouton n'apparaît que si l'appareil en a une.
 *   - `scan` : sur téléphone, `capture` ouvre l'appareil photo natif — c'est
 *     le vrai geste de scanner une feuille. Sur ordinateur, `onScanner`
 *     bascule sur le QR code du téléphone.
 */
export default function EnonceExercice({
  choix = null, disabled, cameraDispo = false, onChoisir, onFichier, onPhoto, onScanner,
}) {
  // LE CHOIX D'ABORD — Camara, le 20/09/2026 : « je veux qu'une fenêtre de
  // choix apparaisse, juste l'énoncé ou la copie et l'énoncé ».
  //
  // POSÉ PAR L'ÉCRAN ET NON PAR LE PROFESSEUR : la question ne coûte alors
  // aucun tour de modèle, et l'enfant répond d'un clic plutôt que d'une
  // phrase que le professeur pourrait comprendre de travers — il l'a fait
  // deux fois de suite le jour même.
  if (choix === null) {
    return (
      <div className="copie-controle" role="group" aria-label="L’énoncé de ton exercice">
        <p className="copie-controle__question">{QUESTION_CHOIX}</p>

        <div className="copie-controle__choix">
          <button
            type="button"
            className="btn btn--compact"
            disabled={disabled}
            onClick={() => onChoisir?.(false)}
          >
            Juste l’énoncé
          </button>
          <button
            type="button"
            className="btn btn--compact btn--fantome"
            disabled={disabled}
            onClick={() => onChoisir?.(true)}
          >
            Ta copie et l’énoncé
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="copie-controle" role="group" aria-label="L’énoncé de ton exercice">
      <p className="copie-controle__question">{QUESTION_ENONCE}</p>
      <p className="copie-controle__aide">{AIDE_ENONCE}</p>

      {/* SE TROMPER DE BOUTON DOIT SE RATTRAPER — Camara, le 20/09/2026.
          Ce retour-ci est gratuit : le choix n'a jamais quitté le navigateur,
          on repose simplement la question. */}
      {onChoisir && (
        <button
          type="button"
          className="copie-controle__retour"
          disabled={disabled}
          onClick={() => onChoisir(null)}
        >
          ← Ce n’est pas ce que je voulais
        </button>
      )}

      <div className="copie-controle__boutons">
        {boutonsEnonce({ cameraDispo: cameraDispo && Boolean(onPhoto) }).map((b) => {
          const icone = (
            <img src={ICONES[b.geste]} alt="" aria-hidden="true" className="copie-controle__icone" />
          );

          // Les deux gestes qui ouvrent quelque chose sont de vrais boutons.
          if (b.geste === 'photo' || (b.geste === 'scan' && onScanner)) {
            return (
              <button
                key={b.cle}
                type="button"
                className="btn btn--compact copie-controle__bouton"
                disabled={disabled}
                onClick={b.geste === 'photo' ? onPhoto : onScanner}
              >
                {icone} {b.libelle}
              </button>
            );
          }

          return (
            <label
              key={b.cle}
              className={`btn btn--compact copie-controle__bouton${disabled ? ' est-desactive' : ''}`}
            >
              {icone} {b.libelle}
              <input
                type="file"
                hidden
                disabled={disabled}
                accept={b.geste === 'scan' ? 'image/*' : 'image/*,application/pdf'}
                capture={b.geste === 'scan' ? 'environment' : undefined}
                onChange={(e) => {
                  const fichier = e.target.files?.[0];
                  e.target.value = '';
                  if (fichier) onFichier(fichier);
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
