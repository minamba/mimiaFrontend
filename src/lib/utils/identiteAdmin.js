import { lireMotDePasse } from './motDePasseAdmin';

/**
 * CE QUE LA FENÊTRE « MODIFIER LE COMPTE » DOIT FAIRE — Camara, le 23/09/2026 :
 * « j'ai changé l'adresse mail d'un parent dans l'onglet administrateur, mais
 * elle ne peut plus se connecter ».
 *
 * POURQUOI UN MODULE À PART PLUTÔT QUE QUELQUES LIGNES DANS `Admin.js`
 * -------------------------------------------------------------------
 * Même raison que `motDePasseAdmin` : les règles sont courtes, leurs
 * conséquences ne le sont pas, et `Admin.js` fait deux mille lignes qui ne se
 * rendent pas sous Jest. Ici chaque cas se vérifie pour ce qu'il est.
 *
 * LE DÉFAUT D'ORIGINE
 * -------------------
 * Un compte parent vit dans DEUX bases : les identifiants sur le serveur
 * d'identité, la fiche de famille dans l'API métier. « Modifier le compte »
 * n'écrivait que la seconde. L'adresse de l'écran — et celle des bilans —
 * changeait ; l'identifiant de connexion, lui, restait l'ancien. Le parent
 * recevait ses courriels ici et ne pouvait entrer que par là, sans que rien ne
 * le lui dise. Aucune donnée perdue (la fiche tient au `sub`), mais un compte
 * injoignable.
 *
 * LA CLÉ EST LE `sub`, JAMAIS L'ADRESSE — et c'est la deuxième correction du
 * même jour. La première version désignait le compte par son ancienne adresse,
 * lue sur l'écran, donc dans la base MÉTIER. Sur un compte déjà désynchronisé,
 * cette adresse ne désignait personne côté identité : la route censée remettre
 * les deux d'accord répondait 404 précisément sur les comptes qui en avaient
 * besoin. Le `sub` ne bouge jamais ; l'API métier l'expose maintenant à
 * l'administration.
 *
 * ON N'ESSAIE PLUS DE DEVINER SI L'ADRESSE A CHANGÉ. L'écran ne connaît que la
 * base métier : comparer avec elle, c'est comparer avec la mauvaise. L'adresse
 * part donc à chaque enregistrement, et c'est le serveur — qui, lui, voit
 * l'identité — qui décide s'il y a quelque chose à faire. Identique, il ne fait
 * rien. Un compte désynchronisé se répare ainsi au premier passage dans la
 * fenêtre, sans que personne ait à s'en apercevoir.
 */

/**
 * Les appels d'identité à jouer avant d'enregistrer la fiche.
 *
 * `sub` EST OBLIGATOIRE : sans lui on ne peut désigner aucun compte, et on
 * n'appelle rien plutôt que d'appeler au hasard. Il manque pour un parent créé
 * avant que l'API ne l'expose, ou dont la fiche n'a jamais été reliée à une
 * identité — la fiche s'enregistre alors seule, comme avant.
 *
 * @returns {{
 *   erreur: string|null,
 *   adresse: { sub: string, email: string }|null,
 *   motDePasse: { sub: string, valeur: string }|null,
 * }}
 */
export function etapesIdentite({
  sub, mail, motDePasse, confirmation,
} = {}) {
  const mdp = lireMotDePasse({ motDePasse, confirmation });

  if (mdp.erreur) {
    return { erreur: mdp.erreur, adresse: null, motDePasse: null };
  }

  const cle = (sub ?? '').trim();
  const email = (mail ?? '').trim();

  if (!cle) {
    return { erreur: null, adresse: null, motDePasse: null };
  }

  return {
    erreur: null,
    // UNE ADRESSE VIDÉE N'EST PAS UNE CONSIGNE. Le champ n'est obligatoire
    // qu'à la création ; l'effacer en modification veut dire « je n'y touche
    // pas », certainement pas « donne-lui une adresse vide » — qui rendrait le
    // compte définitivement inaccessible.
    adresse: email ? { sub: cle, email } : null,
    motDePasse: mdp.envoyer ? { sub: cle, valeur: mdp.valeur } : null,
  };
}

/**
 * La fiche SANS les champs qui ne lui appartiennent pas.
 *
 * `sub` n'est pas une donnée de fiche : c'est la clé du compte sur l'AUTRE
 * base, gardée dans l'état de la fenêtre pour savoir qui renommer. Laissée
 * dans la charge, elle partirait à l'API métier — qui l'ignorerait, mais qui
 * n'a aucune raison de la recevoir en retour.
 */
export function sansSub(donnees) {
  const { sub, ...fiche } = donnees ?? {};
  return fiche;
}

/**
 * Cette saisie demande-t-elle un passage par le serveur d'identité ?
 *
 * Vrai dès qu'on connaît le compte et qu'une adresse est saisie : on laisse le
 * serveur juger s'il y a un renommage à faire. Faux sans `sub` — un parent
 * sans identité rattachée — ou sur une adresse vidée.
 */
export function toucheAuxIdentifiants(donnees = {}) {
  const etapes = etapesIdentite(donnees);
  return Boolean(etapes.erreur || etapes.adresse || etapes.motDePasse);
}
