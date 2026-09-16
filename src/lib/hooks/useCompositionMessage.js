import { useRef, useState } from 'react';
import { retirerMarqueurImage } from '../storage/marqueursImages';

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
 *
 * DEUX SORTES DE PIÈCES DANS LES MÊMES LISTES (15/09/2026, templates)
 * -------------------------------------------------------------------
 * Un `File` choisi dans l'explorateur, ou une pièce déjà enregistrée dans un
 * template : `{ id, name, size, type }`. Les deux s'affichent de la même
 * façon ; seul l'envoi les distingue — un fichier se téléverse, une pièce
 * enregistrée est relue par le serveur.
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

  /** Insère un texte quelconque au curseur — une variable `{{prenom}}`, par exemple. */
  const insererTexte = (valeur) => remplacerSelection(valeur);

  /** Remplit tout d'un coup : l'ouverture d'un template. */
  const charger = ({ texte: t = '', images: i = [], documents: d = [] } = {}) => {
    setTexte(t ?? '');
    setImages(i ?? []);
    setDocuments(d ?? []);
  };

  const vider = () => charger();

  /**
   * RETIRER UNE IMAGE RENUMÉROTE LES MARQUEURS DU TEXTE.
   *
   * Le marqueur n'est que le rang dans la liste. Retirer la première de trois
   * images laissait `[image:3]` dans le texte pour une liste qui n'en compte
   * plus que deux : la dernière disparaissait du courriel et la deuxième
   * prenait la place de la première. Même règle que le serveur.
   */
  const retirerImage = (index) => {
    setImages((liste) => liste.filter((_, n) => n !== index));
    setTexte((t) => retirerMarqueurImage(t, index + 1));
  };

  const retirerDocument = (index) => {
    setDocuments((liste) => liste.filter((_, n) => n !== index));
  };

  return {
    texte, setTexte,
    images, setImages,
    documents, setDocuments,
    zoneTexte,
    insererMarqueur, insererEmoji, insererGras, insererTexte,
    charger, vider, retirerImage, retirerDocument,
  };
}
