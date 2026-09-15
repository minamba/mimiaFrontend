import { useRef } from 'react';

/**
 * LES LIGNES DE LA COPIE AU CLAVIER, modifiables jusqu'au rendu.
 *
 * POURQUOI ELLES SONT MODIFIABLES
 * -------------------------------
 * Voulu par Camara le 11/09/2026 : la relecture complète sert à se relire
 * et à rattraper un oubli. Une ligne figée dès qu'elle est validée la rendait
 * inutile au clavier — on entendait l'erreur, sans pouvoir y toucher.
 *
 * UNE PHRASE OUBLIÉE SE GLISSE À SA PLACE, PAS EN BOUT DE COPIE
 * -------------------------------------------------------------
 * Relevé le même jour, pendant la relecture : la phrase 3 oubliée, il fallait
 * l'insérer sous la ligne 2, et l'élève n'a pas pu. D'où :
 *
 * - le bouton ＋ au bout de chaque ligne, qui ouvre une ligne JUSTE EN
 *   DESSOUS — visible, parce qu'un geste qu'on ne voit pas n'existe pas ;
 * - Entrée, qui fait la même chose — et, le curseur au tout début d'une
 *   ligne, en ouvre une AU-DESSUS : le seul moyen de rattraper une première
 *   phrase oubliée ;
 * - Retour arrière sur une ligne vide, qui la retire.
 *
 * La numérotation suit d'elle-même : c'est une liste numérotée, l'ancienne
 * ligne 3 devient la 4.
 *
 * SORTI DE `Chat.js` pour être éprouvé : c'est le seul endroit où un test
 * peut cliquer, taper et vérifier les numéros — voir `lignesCopie.test.js`.
 */

/** Ouvre une ligne vide à `position` — pure, pour le test comme pour l'écran. */
export function insererLigneDans(lignes, position) {
  const suite = [...(lignes ?? [])];
  suite.splice(Math.max(0, Math.min(position, suite.length)), 0, '');
  return suite;
}

export default function LignesCopie({ lignes, onLignes }) {
  const champs = useRef([]);

  const placerCurseur = (index) => {
    requestAnimationFrame(() => champs.current[index]?.focus());
  };

  const modifier = (index, valeur) => {
    onLignes((actuelles) => (actuelles ?? []).map((l, i) => (i === index ? valeur : l)));
  };

  const inserer = (position) => {
    onLignes((actuelles) => insererLigneDans(actuelles, position));
    placerCurseur(position);
  };

  const auClavier = (evenement, index) => {
    if (evenement.key === 'Enter' && !evenement.shiftKey) {
      evenement.preventDefault();

      const champ = evenement.currentTarget;
      const auDebut = champ.value !== ''
        && champ.selectionStart === 0
        && champ.selectionEnd === 0;

      inserer(auDebut ? index : index + 1);
      return;
    }

    if (evenement.key === 'Backspace' && evenement.currentTarget.value === '') {
      evenement.preventDefault();

      onLignes((actuelles) => (actuelles ?? []).filter((_, i) => i !== index));
      placerCurseur(Math.max(0, index - 1));
    }
  };

  return (
    <ol className="copie-dictee__lignes">
      {lignes.map((ligne, index) => (
        // La clé porte l'index : deux phrases identiques dans une dictée ne
        // sont pas impossibles, et rien ne les distingue.
        // eslint-disable-next-line react/no-array-index-key
        <li key={index}>
          <div className="copie-dictee__rangee">
            {/* PAS DE CORRECTEUR DU NAVIGATEUR : il soulignerait les fautes,
                et la dictée ne mesurerait plus rien. */}
            <input
              ref={(el) => { champs.current[index] = el; }}
              className="copie-dictee__ligne"
              value={ligne}
              onChange={(e) => modifier(index, e.target.value)}
              onKeyDown={(e) => auClavier(e, index)}
              aria-label={`Ligne ${index + 1} de ta copie`}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />

            <button
              type="button"
              className="copie-dictee__inserer"
              onClick={() => inserer(index + 1)}
              aria-label={`Ajouter une ligne sous la ligne ${index + 1}`}
              title="Ajouter une ligne en dessous"
            >
              ＋
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
