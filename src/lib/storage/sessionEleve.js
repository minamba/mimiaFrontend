/**
 * La session d'un enfant, sur son appareil.
 *
 * CE QUI A CHANGÉ PAR RAPPORT AU « MODE ÉLÈVE »
 * --------------------------------------------
 * Le mode élève était un drapeau de navigateur posé sur la session du PARENT :
 * l'enfant travaillait dans le compte de son père, et une clôture d'interface
 * l'empêchait d'en sortir. C'était tenable sur la tablette du salon, pas sur
 * l'ordinateur d'un adolescent.
 *
 * Ici, l'enfant a SA session. Le serveur sait qui appelle, et lui refuse tout
 * ce qui n'est pas à lui — la facturation, le profil de ses parents, les cours
 * de son frère. Ce n'est plus une convention de navigateur, c'est ce que
 * l'API autorise.
 *
 * Conséquence pratique : deux enfants peuvent travailler EN MÊME TEMPS sur
 * deux appareils, chacun dans sa session, sans que le parent ait à basculer
 * quoi que ce soit.
 */

const CLE = 'mimia.session-eleve';

/**
 * La session en cours, ou null.
 *
 * Dans `localStorage` : l'enfant tape son code une fois, sa machine reste la
 * sienne. Lui faire retaper un code de six caractères chaque matin
 * garantirait qu'un parent soit appelé tous les lundis.
 */
export function sessionEleve() {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;

    const valeur = JSON.parse(brut);
    return valeur?.jeton ? valeur : null;
  } catch {
    return null;
  }
}

export function ouvrirSessionEleve({ jeton, eleve }) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify({
      jeton,
      eleveId: eleve?.id,
      prenom: eleve?.prenom ?? '',
      niveau: eleve?.niveauLibelle ?? '',

      // LE CYCLE, ET PAS SEULEMENT LA CLASSE — depuis le 20/09/2026 : les jeux
      // s'ouvrent cycle par cycle, et « 3e » ne dit pas « College » sans une
      // table de correspondance que le serveur tient déjà.
      cycle: eleve?.niveauCycle ?? '',

      // ET LA CLASSE : le cycle ouvre la porte des jeux, la classe décide
      // lesquels. Un CP et un CM2 ne jouent pas au même jeu.
      niveauCode: eleve?.niveauCode ?? '',
    }));
  } catch {
    // Navigation privée : la session ne survivra pas à la fermeture de
    // l'onglet, mais le cours en cours fonctionne. On ne bloque rien.
  }
}

/**
 * COMPLÈTE UNE SESSION OUVERTE AVANT QU'ON SACHE TOUT D'ELLE.
 *
 * Camara, le 21/09/2026 : le bouton des jeux avait disparu alors que le
 * réglage était bien allumé en base et bien renvoyé par l'API. La cause
 * n'était ni l'un ni l'autre — c'était CETTE session-ci.
 *
 * Le cycle et la classe sont écrits ici AU MOMENT DE LA CONNEXION. Un enfant
 * déjà connecté quand ces deux champs sont apparus garde une session qui ne
 * les porte pas : la porte des jeux reste close, sans rien pour l'expliquer,
 * jusqu'à ce qu'il se déconnecte — ce qu'il n'a aucune raison de faire.
 *
 * On complète donc à la volée, depuis le serveur qui sait. Écrit une fois,
 * relu ensuite : aucun appel de plus aux visites suivantes.
 */
export function completerSessionEleve(infos) {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return;

    const session = JSON.parse(brut);

    window.localStorage.setItem(CLE, JSON.stringify({
      ...session,
      cycle: session.cycle || infos?.niveauCycle || '',
      niveauCode: session.niveauCode || infos?.niveauCode || '',
      niveau: session.niveau || infos?.niveauLibelle || '',
    }));
  } catch {
    // Navigation privée : la session vivra sans son cycle, et la porte des
    // jeux restera fermée. Rien d'autre n'en dépend.
  }
}

export function fermerSessionEleve() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // Sans effet possible, rien à signaler.
  }
}

/** Le jeton à mettre en en-tête, ou null si c'est un parent qui navigue. */
export function jetonEleve() {
  return sessionEleve()?.jeton ?? null;
}

/** La page d'accueil d'un enfant : ses matières. */
export function accueilEleve(eleveId) {
  return `/eleves/${eleveId}/matieres`;
}

/**
 * Vrai si cette adresse est interdite à un enfant.
 *
 * ON RAISONNE PAR CE QUI EST AUTORISÉ, JAMAIS PAR CE QUI EST INTERDIT.
 *
 * Ce n'est qu'un confort : l'API refuse déjà tout ce qui n'est pas à lui. Mais
 * un enfant qui atterrit sur une page de facturation vide et pleine d'erreurs
 * ne comprend pas qu'il n'avait rien à y faire — autant ne pas l'y emmener.
 *
 * `/eleves/nouveau` est exclu par construction : le segment doit être un
 * NOMBRE. C'est ce qui distingue l'espace d'un enfant du formulaire d'ajout,
 * qui partage pourtant le même préfixe.
 */
export function adresseInterdite(chemin, eleveId) {
  return !new RegExp(`^/eleves/${eleveId}(/|$)`).test(chemin);
}
