import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { camera } from '../lib/storage/camera';
import cameraPng from '../assets/camera.png';

/**
 * LA CAMÉRA QU'ON DÉCLENCHE EN DISANT « PHOTO ».
 *
 * Éteinte par défaut, et rien ne l'allume toute seule : c'est un clic de
 * l'élève qui ouvre le flux, jamais l'arrivée sur la page ni le début d'une
 * dictée. Le navigateur demande alors la permission — on ne peut pas s'en
 * passer, et on ne cherche pas à s'en passer.
 *
 * UNE FOIS ALLUMÉE, ELLE RESTE VISIBLE. Le petit aperçu au-dessus de la
 * saisie montre ce que la caméra voit, avec une pastille qui rappelle que
 * dire « Photo » déclenche une capture — sans lui, l'élève ne saurait ni que
 * la caméra tourne, ni comment la couper.
 */
const CameraVoix = forwardRef(function CameraVoix({ onErreur, enSurbrillance, desactive = false }, ref) {
  const [actif, setActif] = useState(false);
  const [dispo, setDispo] = useState(false);
  const videoRef = useRef(null);
  const fluxRef = useRef(null);

  useEffect(() => {
    if (!camera.supporte) return undefined;

    let vivant = true;
    camera.disponible().then((oui) => { if (vivant) setDispo(oui); });
    return () => { vivant = false; };
  }, []);

  const arreter = useCallback(() => {
    fluxRef.current?.getTracks().forEach((piste) => piste.stop());
    fluxRef.current = null;
    setActif(false);
  }, []);

  // Un changement de page, ou le démontage du chat, ne doit pas laisser la
  // caméra allumée derrière l'élève.
  useEffect(() => () => arreter(), [arreter]);

  /**
   * Ouvre le flux. Sans effet si la caméra tourne déjà — un second appel ne
   * doit pas redemander la permission ni relancer `getUserMedia`.
   *
   * Séparée de `basculer` : c'est aussi la porte d'entrée EXTERNE, celle
   * qu'utilise le bouton « Prendre ma copie en photo » du panneau de dictée
   * au cahier. Ce bouton n'éteint jamais la caméra — seul le bouton de la
   * barre le fait — donc il a besoin d'un geste qui n'ouvre QUE dans un
   * sens, jamais d'un bascule.
   */
  const activer = useCallback(async () => {
    if (actif) return;

    try {
      fluxRef.current = await camera.demarrer();
      // Le flux est prêt, mais pas encore branché : voir l'effet plus bas.
      // La balise <video> n'existe pas tant que `actif` est faux — elle ne se
      // monte qu'à l'instant même où ce `setActif(true)` s'exécute — donc lui
      // donner le flux ICI tomberait sur une référence encore nulle.
      setActif(true);
    } catch {
      onErreur?.(
        "Je n'ai pas pu ouvrir la caméra. Vérifie que l'autorisation est "
        + 'accordée dans les réglages du navigateur.',
      );
    }
  }, [actif, onErreur]);

  const basculer = useCallback(() => {
    if (actif) arreter();
    else activer();
  }, [actif, arreter, activer]);

  // LE FLUX SE BRANCHE UNE FOIS LA BALISE MONTÉE, PAS AVANT.
  //
  // C'était le bug : brancher `srcObject` dans `basculer`, juste avant
  // `setActif(true)`, visait un <video> qui n'existait pas encore — il ne
  // se monte qu'avec ce `actif`. L'affectation ne levait aucune erreur,
  // elle portait sur `null`, et l'aperçu restait noir alors que la caméra
  // tournait bel et bien derrière.
  useEffect(() => {
    if (!actif || !videoRef.current || !fluxRef.current) return;

    videoRef.current.srcObject = fluxRef.current;

    // `.play()` REND UNE PROMESSE PARTOUT, SAUF LÀ OÙ ON NE S'Y ATTEND PAS.
    // Certains environnements la rejettent, d'autres — jsdom en test, et
    // quelques vieux moteurs — la lancent ou ne rendent rien du tout. Le
    // `try` couvre le premier cas, `?.catch` le second : aucun des deux ne
    // doit faire planter le composant, l'image reste simplement figée.
    try {
      videoRef.current.play()?.catch(() => {});
    } catch {
      // Ignoré, comme le rejet ci-dessus.
    }
  }, [actif]);

  useImperativeHandle(ref, () => ({
    actif,
    ouvrir: activer,

    /**
     * Éteint la caméra depuis l'extérieur — après une capture réussie, par
     * exemple. Distincte de `basculer` : celle-ci répond à un clic sur LE
     * bouton de la caméra, celle-là à un événement qui n'a rien à voir avec
     * ce bouton.
     */
    fermer: arreter,

    /**
     * Prend la frame affichée à cet instant et la rend en fichier prêt à
     * envoyer — le même format qu'une photo choisie à la main, pour rejoindre
     * exactement le même chemin d'envoi ensuite.
     */
    async capturer() {
      const video = videoRef.current;

      // readyState < 2 : le flux vient d'ouvrir, aucune image n'est encore
      // arrivée. Capturer maintenant rendrait un cadre noir.
      if (!fluxRef.current || !video || video.readyState < 2) return null;

      const toile = document.createElement('canvas');
      toile.width = video.videoWidth;
      toile.height = video.videoHeight;
      toile.getContext('2d').drawImage(video, 0, 0);

      const blob = await new Promise((resoudre) => {
        toile.toBlob(resoudre, 'image/jpeg', 0.9);
      });
      if (!blob) return null;

      return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
    },
  }), [actif, activer, arreter]);

  if (!dispo) return null;

  return (
    <div className="camera-voix">
      <button
        type="button"
        className={`camera-voix__bouton ${actif ? 'camera-voix__bouton--actif' : ''} ${!actif && enSurbrillance ? 'camera-voix__bouton--surbrillance' : ''}`}
        onClick={basculer}
        // Désactivée pendant que la carte de copie de contrôle attend : la
        // copie passe par la question, obligatoirement. Une caméra déjà
        // allumée reste éteignable.
        disabled={desactive && !actif}
        aria-pressed={actif}
        title={actif ? 'Éteindre la caméra' : 'Activer la caméra pour prendre une photo en disant « Photo »'}
      >
        <img src={cameraPng} alt="" className="icone-png" />
      </button>

      {actif && (
        <div className="camera-voix__apercu" role="status">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} muted playsInline className="camera-voix__video" />
          <span className="camera-voix__pastille" aria-hidden="true" />
          <span className="camera-voix__legende">Dis « Photo » pour prendre la page</span>
        </div>
      )}
    </div>
  );
});

export default CameraVoix;
