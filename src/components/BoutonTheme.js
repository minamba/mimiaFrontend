import { useState } from 'react';
import iconeLune from '../assets/lune.png';
import iconeSoleil from '../assets/soleil.png';
import { themeEnregistre, definirTheme } from '../lib/storage/theme';

/**
 * L'interrupteur de thème, en icône plutôt qu'en case à cocher.
 *
 * DES MÉDAILLONS ILLUSTRÉS DEPUIS LE 14/09/2026 — Camara : `lune.png` et
 * `soleil.png` remplacent les deux dessins au trait. Ce sont déjà des pièces
 * rondes, bordées et lumineuses : le bouton s'efface derrière (voir
 * `.bouton-theme` dans App.css), sinon on aurait un rond dans un rond.
 *
 * L'ICÔNE MONTRE LE THÈME ACTUEL, PAS CELUI SUR LEQUEL ON BASCULE.
 * -------------------------------------------------------------
 * En sombre, la lune ; en clair, le soleil. C'est l'inverse d'un bouton
 * « lumière » qui montrerait l'ampoule qu'on va allumer — mais c'est la
 * lecture demandée, et c'est aussi celle d'une horloge : elle affiche
 * l'heure qu'il est, pas celle qui vient.
 *
 * PARTAGÉ AVEC « Mes paramètres » (`MonProfil.js`), MÊME STOCKAGE.
 * Les deux écrivent et lisent le même thème via `lib/storage/theme.js` —
 * changer l'un change l'autre au prochain rendu, sans état à synchroniser
 * entre eux.
 */
export default function BoutonTheme({ className = '' }) {
  const [theme, setTheme] = useState(() => themeEnregistre());
  const clair = theme === 'light';

  const basculer = () => {
    const nouveau = clair ? 'dark' : 'light';
    setTheme(nouveau);
    definirTheme(nouveau);
  };

  return (
    <button
      type="button"
      className={`bouton-theme ${clair ? 'bouton-theme--clair' : 'bouton-theme--sombre'} ${className}`}
      onClick={basculer}
      aria-label={clair ? 'Passer au thème sombre' : 'Passer au thème clair'}
      title={clair ? 'Thème clair activé — cliquer pour le sombre' : 'Thème sombre activé — cliquer pour le clair'}
    >
      {/* Décorative : l'intitulé du bouton dit déjà ce qu'il fait. */}
      <img className="bouton-theme__icone" src={clair ? iconeSoleil : iconeLune} alt="" />
    </button>
  );
}
