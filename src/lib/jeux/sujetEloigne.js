/**
 * LE SUJET QUI S'ÉLOIGNE — le deuxième nouveau jeu de français du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE2_LANG_ACCORD_SV — « Accorder le verbe avec son sujet, même éloigné »
 *
 * LE JEU. « Les enfants de la classe … au ballon. » L'enfant choisit la forme
 * du verbe parmi trois.
 *
 * LE PIÈGE, TOUJOURS LE MÊME, ET C'EST TOUT LE SUJET : un nom s'est glissé
 * entre le sujet et le verbe — « de la classe » —, et le verbe s'accorde avec
 * lui par erreur (« joue »). Le leurre qui l'incarne est toujours proposé.
 * Le troisième choix est la forme de « tu », qui sonne pareil.
 *
 * APRÈS LA RÉPONSE, LA QUESTION DE LA CLASSE : « Qui est-ce qui joue ? — Les
 * enfants. » C'est elle qui retrouve le sujet, où qu'il soit.
 */

export const MANCHES = 10;

/** `sujet` est le vrai sujet, `intrus` le nom glissé entre lui et le verbe. */
export const PHRASES_JEU = [
  { avant: 'Les enfants de la classe', apres: 'au ballon.', bon: 'jouent', proche: 'joue', autre: 'joues', sujet: 'Les enfants', question: 'joue' },
  { avant: 'Le chien des voisins', apres: 'la nuit.', bon: 'aboie', proche: 'aboient', autre: 'aboies', sujet: 'Le chien', question: 'aboie' },
  { avant: 'Les fleurs du jardin', apres: 'vite.', bon: 'poussent', proche: 'pousse', autre: 'pousses', sujet: 'Les fleurs', question: 'pousse' },
  { avant: 'La maîtresse des élèves', apres: 'les cahiers.', bon: 'range', proche: 'rangent', autre: 'ranges', sujet: 'La maîtresse', question: 'range' },
  { avant: 'Les livres de ma sœur', apres: 'sur la table.', bon: 'sont', proche: 'est', autre: 'es', sujet: 'Les livres', question: 'est' },
  { avant: 'Le gâteau des enfants', apres: 'délicieux.', bon: 'est', proche: 'sont', autre: 'es', sujet: 'Le gâteau', question: 'est' },
  { avant: 'Les oiseaux de la forêt', apres: 'le matin.', bon: 'chantent', proche: 'chante', autre: 'chantes', sujet: 'Les oiseaux', question: 'chante' },
  { avant: 'Le frère de mes amis', apres: 'demain.', bon: 'arrive', proche: 'arrivent', autre: 'arrives', sujet: 'Le frère', question: 'arrive' },
  { avant: 'Les pommes de l’arbre', apres: 'dans l’herbe.', bon: 'tombent', proche: 'tombe', autre: 'tombes', sujet: 'Les pommes', question: 'tombe' },
  { avant: 'Le vélo des garçons', apres: 'une roue crevée.', bon: 'a', proche: 'ont', autre: 'as', sujet: 'Le vélo', question: 'a' },
  { avant: 'Les chats du quartier', apres: 'la nuit.', bon: 'miaulent', proche: 'miaule', autre: 'miaules', sujet: 'Les chats', question: 'miaule' },
  { avant: 'La voiture de mes parents', apres: 'vite.', bon: 'roule', proche: 'roulent', autre: 'roules', sujet: 'La voiture', question: 'roule' },
];

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Dix phrases, les trois formes mélangées. */
export function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  return melanger(PHRASES_JEU).slice(0, MANCHES).map((p) => ({
    ...p, choix: melanger([p.bon, p.proche, p.autre]),
  }));
}

export function verdict(p, choix) {
  if (choix === p.bon) return 'juste';
  return choix === p.proche ? 'proche' : 'autre';
}

/** « Qui est-ce qui joue ? Les enfants. » */
export const question = (p) => `Qui est-ce qui ${p.question} ?`;

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export const PHRASES = {
  consigne: 'Choisis la bonne forme du verbe. Attention : trouve bien son sujet.',
  proche: 'Le verbe ne s’accorde pas avec le nom le plus proche, mais avec son sujet. Qui est-ce qui fait l’action ?',
  autre: 'Cette forme va avec « tu ». Cherche le sujet : qui est-ce qui fait l’action ?',
};
