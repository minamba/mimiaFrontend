/**
 * OÙ COMMENCE ET OÙ FINIT UN EXERCICE, relu depuis le fil des messages.
 *
 * TROIS FENÊTRES S'EN SERVENT, et les trois avaient le même défaut le même
 * jour : la conversation d'expression orale, le choix cahier/clavier d'un texte
 * à écrire, le choix cahier/ordinateur d'une évaluation. Chacune s'ouvre sur
 * une balise du professeur et attend un clic de l'élève.
 *
 * LE DÉFAUT — Camara, en séance le 18/09/2026 : « j'avais demandé une
 * expression orale que j'ai pas faite, je viens de demander un exercice
 * d'expression écrite mais la fenêtre du choix de vitesse pour l'expression
 * orale est toujours là et ne part pas. »
 *
 * Aucune des trois ne se demandait ce qui se passe si l'élève NE CLIQUE JAMAIS.
 * Il suffit qu'il tape sa demande au lieu de cliquer — ce qu'un enfant fait
 * tout le temps — pour que la carte survive à l'exercice qu'elle servait, et
 * s'empile sous le suivant.
 *
 * UNE LISTE BLANCHE PLUTÔT QU'UNE LISTE NOIRE, et c'est tout l'intérêt : on ne
 * peut pas énumérer tout ce qui n'est pas l'exercice en cours, mais on peut
 * énumérer ce qui EN FAIT PARTIE — c'est court, et ça ne bouge pas. Un exercice
 * ajouté l'an prochain refermera les trois fenêtres sans que personne ait à y
 * penser. C'est la leçon du bloc [EXPRESSION_ORALE] qui s'est affiché et
 * prononcé en séance : ce qui dépend d'une liste à tenir à jour finit par ne
 * pas l'être.
 *
 * LE PENDANT SERVEUR EST DANS `FenetreExercice.cs`, et il porte la même liste
 * pour la même raison : le filet de reconstitution doit savoir, lui aussi, où
 * un exercice s'arrête.
 */

/**
 * CE QUI NE VEUT JAMAIS DIRE « ON EST PASSÉ À AUTRE CHOSE ».
 *
 * Les répliques du professeur dans la langue du cours, le tableau, une image.
 * Montrer un mot pendant qu'on attend une réponse est exactement ce qu'un
 * professeur doit faire.
 */
const NEUTRES = new Set([
  'EN', 'FR', 'ES', 'DE', 'IT', 'ZH',
  'ARDOISE', 'TABLEAU_EFFACE', 'SCHEMA', 'POINTAGE',
]);

/** Le nom d'une balise technique : `[EN]`, `[/ARDOISE]`, `[SCHEMA:x/muette]`. */
const BALISE = /\[\/?([A-Z_]+)(?::[^\]]*)?\]/gi;

/**
 * Le professeur ouvre-t-il autre chose dans ce message ?
 *
 * `propres` porte les balises de la fenêtre elle-même — celle qui l'ouvre, et
 * celle qui la range. Sans elles, une fenêtre se refermerait sur sa propre
 * balise d'ouverture.
 */
export function ouvreAutreChose(texte, propres = []) {
  const siennes = new Set(propres.map((b) => b.toUpperCase()));

  for (const trouvee of (texte ?? '').matchAll(BALISE)) {
    const nom = trouvee[1].toUpperCase();

    if (!NEUTRES.has(nom) && !siennes.has(nom)) return true;
  }

  return false;
}

/**
 * La réponse à une question posée par carte, relue à l'envers.
 *
 * Rend :
 *   - la valeur trouvée dans le message de l'élève — il a répondu ;
 *   - `null` — la question est posée et attend : la carte s'affiche ;
 *   - `undefined` — aucune question en attente, soit qu'elle n'ait jamais été
 *     posée, soit qu'on soit passé à autre chose depuis.
 *
 * ON REMONTE À L'ENVERS ET ON S'ARRÊTE AU PREMIER MARQUEUR : la dernière chose
 * écrite fait foi. Deux textes dans une séance posent donc deux fois la
 * question, et le support du premier n'engage pas le second.
 */
export function reponseEnAttente(messages, { lireReponse, pose, propres }) {
  const liste = messages ?? [];

  for (let i = liste.length - 1; i >= 0; i -= 1) {
    const contenu = liste[i]?.contenu ?? '';

    if (liste[i]?.role === 'user') {
      const reponse = lireReponse(contenu);
      if (reponse !== undefined) return reponse;

      // L'ÉLÈVE, LUI, PEUT ÉCRIRE CE QU'IL VEUT. Un enfant qui tape
      // « [SUPPORT_ECRIT] » pour rire ne doit rien ouvrir ni rien fermer.
      continue;
    }

    if (liste[i]?.role !== 'assistant') continue;

    // L'ORDRE COMPTE : on referme AVANT de reconnaître la question, sinon un
    // message qui porte les deux rouvrirait ce qu'il vient de clore.
    if (ouvreAutreChose(contenu, propres)) return undefined;
    if (pose(contenu)) return null;
  }

  return undefined;
}
