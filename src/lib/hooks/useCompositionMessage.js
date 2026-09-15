import { useRef, useState } from 'react';

/**
 * L'état et les gestes d'écriture partagés par tout écran qui compose un
 * courriel dans le même format : la diffusion à tous les parents, et un
 * message écrit à un seul.
 *
 * DEUX GESTES, PAS UN ÉDITEUR VISUEL — LE CHOIX N'A PAS CHANGÉ.
 * ---------------------------------------------------------------
 * Voir `Diffusion.js` : un éditeur enrichi produit du HTML qui casse dans la
 * moitié des messageries. Ici, `**gras**` et les marqueurs d'image restent du
 * texte, lisible et modifiable à la main — seuls deux raccourcis évitent de
 * taper les astérisques ou le marqueur soi-même.
 */
export function useCompositionMessage() {
  const [texte, setTexte] = useState('');
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const zoneTexte = useRef(null);

  /**
   * Remplace la sélection par `valeur` (ou l'insère au curseur), et referme
   * dessus : le marqueur d'image et l'émoticône n'ont rien à faire de ce qui
   * était sélectionné, ils le remplacent.
   */
  const remplacerSelection = (valeur) => {
    const zone = zoneTexte.current;

    if (!zone) {
      setTexte((t) => `${t}\n\n${valeur}`);
      return;
    }

    const debut = zone.selectionStart ?? texte.length;
    const fin = zone.selectionEnd ?? texte.length;

    setTexte(`${texte.slice(0, debut)}${valeur}${texte.slice(fin)}`);

    const position = debut + valeur.length;
    requestAnimationFrame(() => {
      zone.focus();
      zone.setSelectionRange(position, position);
    });
  };

  /**
   * Enveloppe la sélection entre `avant` et `apres` (le gras garde le texte
   * choisi) ; sans sélection, insère les deux marqueurs et place le curseur
   * entre eux, prêt à taper.
   */
  const envelopperSelection = (avant, apres) => {
    const zone = zoneTexte.current;

    if (!zone) {
      setTexte((t) => `${t}${avant}${apres}`);
      return;
    }

    const debut = zone.selectionStart ?? texte.length;
    const fin = zone.selectionEnd ?? texte.length;
    const selection = texte.slice(debut, fin);

    setTexte(`${texte.slice(0, debut)}${avant}${selection}${apres}${texte.slice(fin)}`);

    const position = selection
      ? debut + avant.length + selection.length + apres.length
      : debut + avant.length;

    requestAnimationFrame(() => {
      zone.focus();
      zone.setSelectionRange(position, position);
    });
  };

  const insererMarqueur = (rang) => remplacerSelection(`[image:${rang}]`);
  const insererEmoji = (emoji) => remplacerSelection(emoji);
  const insererGras = () => envelopperSelection('**', '**');

  return {
    texte, setTexte,
    images, setImages,
    documents, setDocuments,
    zoneTexte,
    insererMarqueur, insererEmoji, insererGras,
  };
}
