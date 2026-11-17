import { useEffect, useState } from 'react';

/**
 * L'AVIS « SUR TÉLÉPHONE » — Camara, le 12/11/2026 : sur mobile, en arrivant sur ses matières, l'enfant apprend qu'il
 * peut suivre ses cours sur son téléphone, que Mimia est optimisé pour l'ordinateur, et qu'une application mobile
 * est EN PROJET (pas « en développement » : Camara ne l'a pas commencée, on ne promet rien).
 *
 * UNE FOIS PAR VISITE (sessionStorage) : le remontrer à chaque retour sur la page le rendrait insupportable ; une
 * seule fois pour toujours, l'enfant l'aurait oublié la semaine suivante. Jamais par-dessus le tutoriel : il attend
 * qu'il soit fini (`masque`).
 */
const CLE = 'mimia-avis-mobile-vu';

export function estUnTelephone(fenetre = typeof window !== 'undefined' ? window : undefined) {
  if (!fenetre) return false;
  const ua = fenetre.navigator?.userAgent ?? '';
  if (/iPhone|iPod|Android.*Mobile|Windows Phone|Mobile Safari/i.test(ua)) return true;
  // Un navigateur qui se fait passer pour un ordinateur : un écran tactile étroit reste un téléphone.
  const tactile = fenetre.matchMedia?.('(pointer: coarse)')?.matches ?? false;
  return tactile && Math.min(fenetre.innerWidth ?? 9999, fenetre.screen?.width ?? 9999) <= 600;
}

const dejaVu = () => {
  try { return sessionStorage.getItem(CLE) === '1'; } catch { return false; }
};

export default function AvisMobile({ masque = false }) {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (estUnTelephone() && !dejaVu()) setOuvert(true);
  }, []);

  if (!ouvert || masque) return null;

  const fermer = () => {
    try { sessionStorage.setItem(CLE, '1'); } catch { /* il le reverra à la prochaine page : sans gravité */ }
    setOuvert(false);
  };

  return (
    <div className="modale avis-mobile" role="dialog" aria-modal="true" aria-labelledby="avis-mobile-titre">
      <div className="modale__boite avis-mobile__boite">
        <div className="avis-mobile__icone" aria-hidden="true">📱</div>
        <h2 id="avis-mobile-titre" className="avis-mobile__titre">Sur ton téléphone, ça marche aussi&nbsp;!</h2>
        <p className="avis-mobile__texte">
          Tu peux suivre tes cours sur ton téléphone. Mais Mimia est optimisé pour fonctionner sur
          {' '}<strong>ordinateur</strong>&nbsp;: le tableau, les figures et le micro y sont plus confortables.
          Quand tu peux, préfère un ordinateur.
        </p>
        <p className="avis-mobile__texte avis-mobile__texte--bientot">
          Une <strong>application mobile</strong> fait partie des projets pour l’évolution de Mimia.
        </p>
        <button type="button" className="btn avis-mobile__bouton" onClick={fermer} autoFocus>
          J’ai compris
        </button>
      </div>
    </div>
  );
}
