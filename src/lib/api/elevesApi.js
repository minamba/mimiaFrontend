import httpClient from './httpClient';

export const getEleves = () => httpClient.get('/eleves');

export const getEleveById = (id) => httpClient.get(`/eleves/${id}`);

/**
 * Fiche détaillée d'un enfant, côté parent.
 * Le serveur vérifie que l'élève est bien rattaché au compte du jeton avant
 * de renvoyer quoi que ce soit.
 */
/**
 * `niveau` réduit TOUTE la fiche à une année scolaire — cours suivis, réponses
 * du professeur, dernier cours, statistiques par matière, points fragiles,
 * compétences acquises, progression, évaluations et séances.
 *
 * Le filtre est appliqué en base et non ici : les évaluations et les séances
 * sont paginées côté serveur, et filtrer une tranche de dix lignes afficherait
 * « aucune » à un élève qui en a trente.
 */
export const getFicheEleve = (id, niveau = null) =>
  httpClient.get(`/eleves/${id}/fiche`, { params: niveau ? { niveau } : undefined });

/**
 * La carte des compétences de l'enfant.
 *
 * APPELÉE UNE FOIS PAR OUVERTURE, et ce n'est pas anodin : quand c'est
 * l'ENFANT qui appelle, le serveur avance sa date de dernière visite et
 * les victoires listées ne reparaîtront plus. Un appel en double — un
 * effet qui se rejoue, un rechargement — lui volerait sa fanfare.
 */
export const getProgression = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/progression`);

/** Les évaluations d'un enfant, la plus récente d'abord. */
export const getEvaluations = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/evaluations`);

/**
 * Une tranche de l'historique : `{ elements, total, suite }`.
 *
 * `curseur` vient de la tranche précédente — `suite`. Null pour la première.
 * Le curseur n'est pas lisible et n'a pas à l'être : on le repasse tel quel.
 *
 * `matiereId` et `ancien` portent sur TOUT l'historique, pas sur la tranche
 * déjà affichée — c'est le serveur qui trie et filtre, sans quoi « maths »
 * ne montrerait que les maths des dix dernières lignes.
 */
export const getHistoriqueEvaluations = (eleveId, curseur, taille, tri) =>
  httpClient.get(`/eleves/${eleveId}/evaluations/historique`, {
    params: { curseur, taille, ...tri },
  });

/** Une tranche de l'historique des comptes rendus. */
export const getHistoriqueRapports = (eleveId, curseur, taille, tri) =>
  httpClient.get(`/eleves/${eleveId}/rapports/historique`, {
    params: { curseur, taille, ...tri },
  });

/** La copie d'une évaluation : questions, réponses, verdicts et observation. */
export const getCopieEvaluation = (eleveId, evaluationId) =>
  httpClient.get(`/eleves/${eleveId}/evaluations/${evaluationId}`);

/** Les comptes rendus de séance, le plus récent d'abord. */
export const getRapports = (eleveId) => httpClient.get(`/eleves/${eleveId}/rapports`);

/** Le détail d'un compte rendu de séance. */
export const getRapport = (eleveId, rapportId) =>
  httpClient.get(`/eleves/${eleveId}/rapports/${rapportId}`);

/**
 * Les compteurs de fiches par matière : `{ [matiereId]: { total, nouveautes } }`.
 * Sert aux cartes de matière, qui n'ont besoin que de deux entiers.
 */
export const getNombreFiches = (eleveId) => httpClient.get(`/eleves/${eleveId}/fiches`);

/** Les fiches d'une matière, la plus récemment révisée d'abord. */
export const getFiches = (eleveId, matiereId) =>
  httpClient.get(`/eleves/${eleveId}/fiches?matiereId=${matiereId}`);

/** Une fiche complète, avec l'identité de l'élève pour l'impression. */
export const getFiche = (eleveId, ficheId) =>
  httpClient.get(`/eleves/${eleveId}/fiches/${ficheId}`);

/** L'élève vient de lire la fiche : la pastille « à consulter » s'éteint. */
export const marquerFicheVue = (eleveId, ficheId) =>
  httpClient.post(`/eleves/${eleveId}/fiches/${ficheId}/vue`);

/**
 * Les compteurs de dictées par matière : `{ [matiereId]: { total, nouveautes } }`.
 * Même principe que `getNombreFiches`, réservé aux matières de langue.
 */
export const getNombreDictees = (eleveId) => httpClient.get(`/eleves/${eleveId}/dictees`);

/** Les dictées corrigées d'une matière, la plus récente d'abord. */
export const getDictees = (eleveId, matiereId) =>
  httpClient.get(`/eleves/${eleveId}/dictees?matiereId=${matiereId}`);

/** Une dictée complète : le texte dicté, la copie, et la remarque du professeur. */
export const getDictee = (eleveId, dicteeId) =>
  httpClient.get(`/eleves/${eleveId}/dictees/${dicteeId}`);

/** L'élève vient de lire la dictée : la pastille « à consulter » s'éteint. */
export const marquerDicteeVue = (eleveId, dicteeId) =>
  httpClient.post(`/eleves/${eleveId}/dictees/${dicteeId}/vue`);

/**
 * Les compteurs de compréhensions orales par matière :
 * `{ [matiereId]: { total, nouveautes } }`. Même principe que `getNombreDictees`.
 */
export const getNombreComprehensionsOrales = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/comprehensions-orales`);

/** Les compréhensions orales d'une matière, la plus récente d'abord. */
export const getComprehensionsOrales = (eleveId, matiereId) =>
  httpClient.get(`/eleves/${eleveId}/comprehensions-orales?matiereId=${matiereId}`);

/**
 * LES CONVERSATIONS D'EXPRESSION ORALE — Camara, le 18/09/2026.
 *
 * CE N'EST PAS LA COMPRÉHENSION ORALE juste au-dessus, et les deux se
 * ressemblent assez pour valoir la précision :
 *
 *   - compréhension orale : le professeur LIT, l'élève ÉCOUTE et explique EN
 *     FRANÇAIS ce qu'il a compris. On garde l'audio, pour réécouter.
 *   - expression orale : les DEUX parlent, dans la langue du cours. On garde
 *     la CONVERSATION, qu'on relit comme une messagerie. Aucun audio.
 */
export const getExpressionsOrales = (eleveId, matiereId) =>
  httpClient.get(`/eleves/${eleveId}/expressions-orales?matiereId=${matiereId}`);

/** Une conversation complète, avec tous ses tours de parole. */
export const getExpressionOrale = (eleveId, expressionOraleId) =>
  httpClient.get(`/eleves/${eleveId}/expressions-orales/${expressionOraleId}`);

/** Combien de conversations par matière, et combien jamais ouvertes. */
export const getNombreExpressionsOrales = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/expressions-orales`);

/** L'élève vient de l'ouvrir : la pastille « à consulter » s'éteint. */
export const marquerExpressionOraleVue = (eleveId, expressionOraleId) =>
  httpClient.post(`/eleves/${eleveId}/expressions-orales/${expressionOraleId}/vue`);

/**
 * LES TEXTES D'EXPRESSION ÉCRITE — Camara, le 18/09/2026.
 *
 * LE TROISIÈME DE LA FAMILLE, et le seul où son ORTHOGRAPHE se voit : la
 * compréhension orale garde ce qu'il a ENTENDU, l'expression orale ce qu'il a
 * DIT, celle-ci ce qu'il a ÉCRIT.
 *
 * CE QU'ON EN RAPPORTE, C'EST LA PAIRE : son texte fautes comprises, et la
 * correction à côté. Le texte seul ne vaut rien à relire.
 */
export const getExpressionsEcrites = (eleveId, matiereId) =>
  httpClient.get(`/eleves/${eleveId}/expressions-ecrites?matiereId=${matiereId}`);

/** Un texte complet, avec sa correction. */
export const getExpressionEcrite = (eleveId, expressionEcriteId) =>
  httpClient.get(`/eleves/${eleveId}/expressions-ecrites/${expressionEcriteId}`);

/** Combien de textes par matière, et combien jamais ouverts. */
export const getNombreExpressionsEcrites = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/expressions-ecrites`);

/** L'élève vient de l'ouvrir : la pastille s'éteint. */
export const marquerExpressionEcriteVue = (eleveId, expressionEcriteId) =>
  httpClient.post(`/eleves/${eleveId}/expressions-ecrites/${expressionEcriteId}/vue`);

/**
 * La photo de son cahier, tant qu'elle n'a pas été recopiée.
 *
 * MÊME RAISON QUE POUR L'AUDIO D'UNE COMPRÉHENSION ORALE : la route exige le
 * jeton, un `<img src>` nu ne suffit pas. L'appelant DOIT appeler
 * `URL.revokeObjectURL` quand il a fini.
 *
 * NULL QUAND ELLE A ÉTÉ PURGÉE, et c'est le cas normal d'un texte déjà
 * transcrit : on ne garde pas indéfiniment l'écriture manuscrite d'un enfant.
 */
export const chargerPhotoExpressionEcrite = async (eleveId, expressionEcriteId) => {
  try {
    const reponse = await httpClient.get(
      `/eleves/${eleveId}/expressions-ecrites/${expressionEcriteId}/photo`,
      { responseType: 'blob' },
    );

    return URL.createObjectURL(reponse.data);
  } catch {
    return null;
  }
};

/** Une compréhension orale complète : le passage, ce qui a été compris, la remarque. */
export const getComprehensionOrale = (eleveId, comprehensionOraleId) =>
  httpClient.get(`/eleves/${eleveId}/comprehensions-orales/${comprehensionOraleId}`);

/**
 * Charge l'audio du passage et rend une URL locale utilisable par `<audio>`.
 *
 * Même raison que `chargerPieceJointe` : l'endpoint exige le jeton, un
 * `<audio src>` nu ne suffit pas. L'appelant DOIT appeler
 * `URL.revokeObjectURL` quand il a fini.
 */
export const chargerAudioComprehensionOrale = async (eleveId, comprehensionOraleId) => {
  const reponse = await httpClient.get(
    `/eleves/${eleveId}/comprehensions-orales/${comprehensionOraleId}/audio`,
    { responseType: 'blob' },
  );

  return URL.createObjectURL(reponse.data);
};

/** L'élève vient d'ouvrir la compréhension orale : la pastille « à consulter » s'éteint. */
export const marquerComprehensionOraleVue = (eleveId, comprehensionOraleId) =>
  httpClient.post(`/eleves/${eleveId}/comprehensions-orales/${comprehensionOraleId}/vue`);

/**
 * Le calendrier d'un mois : vacances, séances par matière, évaluations
 * passées et à venir. `mois` de 1 à 12.
 */
export const getCalendrier = (eleveId, annee, mois) =>
  httpClient.get(`/eleves/${eleveId}/calendrier`, { params: { annee, mois } });

/**
 * Pose un contrôle depuis le calendrier — par le parent ou l'enfant, hors
 * séance. `matiereId` doit être une matière au programme de l'élève : le
 * serveur la revérifie, ce n'est jamais qu'un confort ici.
 */
export const creerControle = (eleveId, { matiereId, sujet, dateControle, heureControle }) =>
  httpClient.post(`/eleves/${eleveId}/controles`, { matiereId, sujet, dateControle, heureControle });

/**
 * Les contrôles de l'élève avec l'état de leur préparation. `statut` vaut
 * « avenir » (par défaut) ou « passes ».
 *
 * Le nombre de jours restants vient du serveur, calculé en heure de Paris :
 * on ne le recalcule jamais ici.
 */
export const getControles = (eleveId, statut = 'avenir', limite = 20) =>
  httpClient.get(`/eleves/${eleveId}/controles`, { params: { statut, limite } });

export const getControle = (eleveId, controleId) =>
  httpClient.get(`/eleves/${eleveId}/controles/${controleId}`);

/**
 * Modifie la date, l'heure ou le sujet d'un contrôle.
 *
 * PAS LA MATIÈRE : elle se fige à la création. La déplacer viderait le
 * programme et rattacherait les préparations déjà faites au mauvais
 * professeur — le serveur l'ignore de toute façon.
 */
export const modifierControle = (eleveId, controleId, { sujet, dateControle, heureControle }) =>
  httpClient.put(`/eleves/${eleveId}/controles/${controleId}`, {
    sujet, dateControle, heureControle,
  });

export const supprimerControle = (eleveId, controleId) =>
  httpClient.delete(`/eleves/${eleveId}/controles/${controleId}`);

/**
 * La préparation à l'examen de l'élève : `{ examen }`, où `examen` vaut
 * `null` quand sa classe n'en passe pas cette année. Voir `PreparationExamen`.
 */
export const getExamen = (eleveId) => httpClient.get(`/eleves/${eleveId}/examen`);

/** Une épreuve de son examen, avec les notions de chacune de ses matières. */
export const getEpreuve = (eleveId, code) =>
  httpClient.get(`/eleves/${eleveId}/examen/epreuves/${encodeURIComponent(code)}`);

export const addEleve = (data) => httpClient.post('/eleves', data);

export const updateEleve = (data) => httpClient.put('/eleves', data);

/**
 * Retire un profil : il quitte les listes et libère sa place dans la formule.
 * Rien n'est effacé, et le geste se défait par `restaurerEleve`.
 */
export const archiverEleve = (id) => httpClient.post(`/eleves/${id}/archiver`);

/** Les profils retirés, ceux qu'on peut encore remettre. */
export const getElevesArchives = () => httpClient.get('/eleves/archives');

export const restaurerEleve = (id) => httpClient.post(`/eleves/${id}/restaurer`);

/**
 * Efface les données de l'enfant — identité, cours, évaluations, fiches.
 * Définitif. À ne proposer qu'avec une confirmation forte.
 */
export const supprimerDonneesEleve = (id) => httpClient.delete(`/eleves/${id}`);

/**
 * Le code d'accès d'un enfant, celui qu'il tape sur mimia.fr.
 *
 * Il est CRÉÉ au premier appel s'il n'existe pas encore : un enfant n'a pas de
 * code tant que personne ne l'a regardé, et il n'y a pas de raison d'en semer
 * dans la base pour des profils dont personne ne se servira.
 */
export const getCodeEleve = (id) => httpClient.get(`/eleves/${id}/code`);

/**
 * Régénère le code. L'ancien cesse de marcher, et TOUTES les sessions ouvertes
 * se ferment avec — sinon les appareils déjà connectés continueraient, et le
 * parent croirait avoir coupé quelque chose qu'il n'a pas coupé.
 */
export const regenererCodeEleve = (id) => httpClient.post(`/eleves/${id}/code`);

/** Coupe ou rouvre l'accès d'un enfant, sans toucher à son code. */
export const changerAccesEleve = (id, suspendu) =>
  httpClient.put(`/eleves/${id}/acces`, { suspendu });

/**
 * Les matières qui figurent à l'emploi du temps de cet élève.
 *
 * C'EST LE SERVEUR QUI DÉCIDE. La règle — bornes de niveau et exclusions de
 * voie — a longtemps été appliquée aussi côté front, et la copie s'ouvrait en
 * grand quand le niveau de l'élève n'était pas encore chargé : un enfant de
 * sixième s'est vu proposer la philosophie.
 *
 * Les matières « à venir » sont incluses, avec `active` à faux : elles
 * concernent bien sa classe, c'est leur ouverture qui n'est pas faite.
 */
export const getMatieresEleve = (eleveId) => httpClient.get(`/eleves/${eleveId}/matieres`);
