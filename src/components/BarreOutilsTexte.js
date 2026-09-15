import { useEffect, useRef, useState } from 'react';

/**
 * Une sélection courte, pas un clavier d'émoticônes complet.
 *
 * Ce qu'on écrit à un parent reste professionnel : une vingtaine de choix
 * couvrant l'essentiel (confirmer, prévenir, féliciter, pointer une date)
 * suffit très largement, et évite d'aller chercher un clavier système que
 * tous les postes n'ont pas au même endroit.
 */
const EMOJIS = [
  '🙂', '👍', '🎉', '⭐', '❤️', '🙏',
  '📚', '✅', '⚠️', '📅', '📌', '💡',
  '🔔', '✨', '👏', '😉',
];

/**
 * Les deux raccourcis d'écriture communs à la diffusion et au message à un
 * parent : le gras (voir `useCompositionMessage`) et une émoticône, tous
 * deux insérés dans le texte brut — jamais un éditeur visuel séparé du
 * texte qu'on relit avant d'envoyer.
 */
export default function BarreOutilsTexte({ onGras, onEmoji }) {
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef(null);

  useEffect(() => {
    if (!ouvert) return undefined;

    const fermerSiExterieur = (evenement) => {
      if (!conteneur.current?.contains(evenement.target)) setOuvert(false);
    };

    document.addEventListener('mousedown', fermerSiExterieur);
    return () => document.removeEventListener('mousedown', fermerSiExterieur);
  }, [ouvert]);

  return (
    <div className="barre-outils-texte" ref={conteneur}>
      <button
        type="button"
        className="barre-outils-texte__bouton"
        onClick={onGras}
        title="Mettre en gras"
      >
        <strong>G</strong>
      </button>

      <div className="barre-outils-texte__emoji">
        <button
          type="button"
          className="barre-outils-texte__bouton"
          onClick={() => setOuvert((v) => !v)}
          title="Insérer une émoticône"
        >
          🙂
        </button>

        {ouvert && (
          <div className="barre-outils-texte__palette">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onEmoji(emoji); setOuvert(false); }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
