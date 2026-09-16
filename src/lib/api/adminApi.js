import httpClient from './httpClient';
import { supprimerIdentiteDe } from './profilApi';

export const getResume = () => httpClient.get('/admin/resume');

export const getSerieRequetes = (granularite, eleveId) =>
  httpClient.get('/admin/stats/requetes', { params: { granularite, eleveId: eleveId || undefined } });

/**
 * L'état du parc d'abonnements, par période.
 *
 * Le filtre élève est transmis comme pour les requêtes : le serveur le traduit
 * en filtre sur la FAMILLE de cet enfant, un contrat n'appartenant pas à un
 * élève mais à un parent.
 */
export const getSerieAbonnements = (granularite, eleveId) =>
  httpClient.get('/admin/stats/abonnements', {
    params: { granularite, eleveId: eleveId || undefined },
  });

/**
 * La fréquentation du site public, sur une fenêtre précise.
 *
 * LES DEUX BORNES SONT OBLIGATOIRES ICI, contrairement aux autres séries qui
 * se contentent d'une granularité. C'est ce qui permet de naviguer d'un jour à
 * l'autre, d'un mois à l'autre : la fenêtre est CHOISIE, pas déduite d'un
 * nombre de périodes en arrière.
 *
 * Rend { points, visiteurs } — et le second n'est pas la somme du premier :
 * quelqu'un venu lundi et jeudi compte une fois sur la semaine et deux fois
 * dans le détail par jour.
 */
export const getSerieVisites = (granularite, debut, fin) =>
  httpClient.get('/admin/stats/visites', { params: { granularite, debut, fin } });

/**
 * Le tunnel : combien sont venus, combien ont essayé, combien ont payé.
 *
 * LA CONVERSION N'EST PAS BORNÉE PAR LA FENÊTRE, et c'est voulu : un essai
 * lancé lundi peut se transformer en abonnement des semaines plus tard. Le
 * chiffre d'une période récente continue donc de monter — c'est la nature d'un
 * tunnel, pas un défaut de mesure.
 */
export const getTunnel = (granularite, debut, fin) =>
  httpClient.get('/admin/stats/tunnel', { params: { granularite, debut, fin } });

/** Les abonnements sur la MÊME fenêtre, pour l'onglet Fréquentation. */
export const getAbonnementsFenetre = (granularite, debut, fin) =>
  httpClient.get('/admin/stats/abonnements', { params: { granularite, debut, fin } });

export const getSerieParents = (granularite) =>
  httpClient.get('/admin/stats/parents', { params: { granularite } });

export const getSerieEleves = (granularite) =>
  httpClient.get('/admin/stats/eleves', { params: { granularite } });

/**
 * Le tableau des familles, sur une fenêtre de temps.
 *
 * La MÊME fenêtre que `getCout` : le bandeau annonce un total, les lignes en
 * dessous le détaillent. Deux fenêtres différentes donneraient un tableau dont
 * la somme ne tombe pas sur son propre titre.
 */
export const getParents = (recherche, periode = 'mois', decalage = 0) =>
  httpClient.get('/admin/parents', {
    params: { recherche: recherche || undefined, periode, decalage },
  });

/**
 * La répartition du fichier clients, à cet instant.
 *
 * SANS FENÊTRE, contrairement à `getParents` juste au-dessus. « Trois
 * familles en Solo mensuel » est un état, pas un événement daté : le
 * rapporter à une semaine ne voudrait rien dire.
 */
export const getRepartitionParents = () => httpClient.get('/admin/parents/repartition');

export const getEleves = (parentId, recherche) =>
  httpClient.get('/admin/eleves', {
    params: { parentId: parentId || undefined, recherche: recherche || undefined },
  });

export const getFicheEleve = (id) => httpClient.get(`/admin/eleves/${id}/fiche`);

/**
 * Le calendrier d'un élève, côté administration — même forme que
 * `elevesApi.getCalendrier(eleveId, annee, mois)`, pour alimenter le même
 * composant (`CalendrierContenu`) sans qu'il ait à savoir laquelle des deux
 * routes l'a appelé.
 */
export const getCalendrierEleve = (eleveId, annee, mois) =>
  httpClient.get(`/admin/eleves/${eleveId}/calendrier`, { params: { annee, mois } });

/**
 * Les tranches d'historique, côté administration.
 *
 * Mêmes tranches que côté parent, autres routes : la fiche est le même écran
 * des deux côtés, et sans ces deux appels son « voir plus » n'aurait rien à
 * demander depuis l'administration.
 */
export const getHistoriqueEvaluations = (eleveId, curseur, taille, tri) =>
  httpClient.get(`/admin/eleves/${eleveId}/evaluations/historique`, {
    params: { curseur, taille, ...tri },
  });

export const getHistoriqueRapports = (eleveId, curseur, taille, tri) =>
  httpClient.get(`/admin/eleves/${eleveId}/rapports/historique`, {
    params: { curseur, taille, ...tri },
  });

/**
 * Bilan rendu en HTML, sans envoi. Récupéré en blob : la route exige un jeton
 * porteur, qu'un simple lien dans un onglet ne pourrait pas transmettre.
 */
/**
 * Envoie le bilan hebdomadaire d'UN élève, tout de suite.
 *
 * Pour le parent qui n'a rien reçu — courriel tombé dans les indésirables,
 * adresse changée, panne du serveur d'envoi un lundi matin. Sans ce bouton, il
 * fallait attendre la semaine suivante, et le bilan manquant l'était pour
 * toujours.
 *
 * TOUJOURS AVEC UN ÉLÈVE. Sans `eleveId`, la route envoie à TOUS les parents :
 * c'est le déclenchement de masse du lundi. Un clic malheureux depuis une fiche
 * écrirait à toute la base, et un courriel parti ne se rattrape pas.
 */
export const envoyerBilan = (eleveId, finSemaine) =>
  httpClient.post('/admin/bilans/envoyer', null, {
    params: { eleveId, finSemaine: finSemaine || undefined },
  });

export const getApercuBilan = (eleveId) =>
  httpClient.get('/admin/bilans/apercu', {
    params: { eleveId },
    responseType: 'blob',
  });

/**
 * Pousse le catalogue de la base vers Stripe : un produit et deux tarifs par
 * formule, un tarif par recharge.
 *
 * À REJOUER À CHAQUE FOIS QUE LES PRIX CHANGENT, et une première fois au
 * passage en production : les identifiants de tarifs d'un compte de test
 * n'existent pas dans le compte réel. L'opération est idempotente — elle
 * réutilise un tarif déjà au bon montant et n'en crée un que s'il manque.
 */
export const synchroniserCatalogueStripe = () =>
  httpClient.post('/reglages/stripe/catalogue');

/**
 * Ce que le produit a coûté sur la période courante.
 * @param periode 'jour' | 'semaine' | 'mois' | 'annee'
 */
export const getCout = (periode, decalage = 0) =>
  httpClient.get('/admin/cout', { params: { periode, decalage } });

/**
 * L'historique du pot d'heures supplémentaires d'un compte : achats payés et
 * ajustements manuels, chacun daté et motivé.
 *
 * C'est ce qu'on ouvre quand un parent conteste. Sans lui, le motif saisi à
 * l'ajustement n'était lisible qu'en SQL.
 */
export const getHistoriqueHeures = (id) =>
  httpClient.get(`/admin/parents/${id}/heures`);

/**
 * Ajoute ou retire des heures à la main sur le compte d'un parent.
 *
 * Trois usages qu'aucun automatisme ne couvre : dédommager après un incident,
 * corriger une erreur, et solder un remboursement PARTIEL — que le webhook
 * laisse volontairement de côté, un montant partiel ne disant pas combien
 * d'heures retirer.
 *
 * `minutes` est négatif pour retirer. Le motif est obligatoire côté serveur.
 *
 * `prevenirLeParent` déclenche un courriel dont le MOTIF est le corps : un
 * solde qui bouge sans explication ne se lit pas comme une régularisation mais
 * comme une panne. On le laisse à faux pour les corrections internes, celles
 * que le parent n'a jamais vues.
 */
export const ajusterHeures = (id, minutes, motif, prevenirLeParent) =>
  httpClient.post(`/admin/parents/${id}/heures`, { minutes, motif, prevenirLeParent });

export const modifierParent = (id, data) => httpClient.put(`/admin/parents/${id}`, data);

/**
 * Accorde ou retire le droit d'administrer à un compte parent.
 *
 * Réservée au super-administrateur — l'API le revérifie. Le changement ne prend
 * effet qu'à la PROCHAINE CONNEXION du parent : le rôle voyage dans son jeton,
 * qui est signé et ne se réécrit pas à distance.
 */
export const definirAdministrateur = (id, actif) =>
  httpClient.put(`/admin/parents/${id}/administrateur`, { actif });

/**
 * La fiche d'un parent dont l'identité vient d'être créée — voir
 * `creerIdentite` dans profilApi.js, qui rend l'`identityUserId` attendu ici.
 */
export const creerParent = (data) => httpClient.post('/admin/parents', data);

export const modifierEleve = (id, data) => httpClient.put(`/admin/eleves/${id}`, data);

/**
 * Les périodes de vacances scolaires, toutes zones et années — pour
 * l'onglet « Périodes scolaires ». Tenues à jour chaque jour par un worker
 * côté serveur ; ces routes servent à corriger une date à la main.
 */
export const getPeriodesVacances = () => httpClient.get('/admin/periodes-vacances');

export const creerPeriodeVacances = (data) => httpClient.post('/admin/periodes-vacances', data);

export const modifierPeriodeVacances = (id, data) =>
  httpClient.put(`/admin/periodes-vacances/${id}`, data);

export const supprimerPeriodeVacances = (id) =>
  httpClient.delete(`/admin/periodes-vacances/${id}`);

/**
 * Les échéances de révision du référentiel — pour l'onglet « Programme
 * scolaire ». Tenues à jour par `EcheanceReferentielWorker`, qui relève
 * seul la page officielle de chaque échéance et compare son empreinte à la
 * précédente ; ces routes servent à consulter ce qu'il a constaté, et à
 * marquer une échéance traitée une fois le référentiel revérifié à la main.
 */
export const getEcheancesReferentiel = () => httpClient.get('/admin/echeances-referentiel');

/**
 * Le programme scolaire entier, classe par classe : chaque matière avec ses
 * notions (à jour, ajoutée, modifiée, retirée — et quand) et les échéances
 * officielles rangées dessous. C'est ce que lit l'onglet « Programme
 * scolaire » ; `getEcheancesReferentiel` reste pour la liste plate.
 */
export const getProgrammeScolaire = () => httpClient.get('/admin/programme-scolaire');

/**
 * La vérification des cartes d'examen : pour chaque carte, les notions
 * retenues par matière, et tout ce qui la viderait en silence (faute de frappe
 * dans une partie retenue ou exclue, matière fermée…).
 */
export const getVerificationExamens = () => httpClient.get('/admin/examens/verification');

export const traiterEcheanceReferentiel = (id) =>
  httpClient.post(`/admin/echeances-referentiel/${id}/traiter`);

/**
 * Les signalements déposés depuis le bouton « Signaler » — pour l'onglet
 * « Signalements ».
 */
export const getSignalements = () => httpClient.get('/admin/signalements');

export const creerSignalement = (data) => httpClient.post('/admin/signalements', data);

export const modifierSignalement = (id, data) =>
  httpClient.put(`/admin/signalements/${id}`, data);

export const supprimerSignalement = (id) =>
  httpClient.delete(`/admin/signalements/${id}`);

/**
 * Supprimer un parent, DES DEUX CÔTÉS.
 *
 * Un compte vit dans deux bases : les données de la famille dans l'API métier,
 * les identifiants dans le serveur d'identité. Cet appel n'en faisait que la
 * première moitié, et l'identité survivait — avec deux conséquences, dont la
 * seconde est la grave :
 *
 *   1. Une réinscription avec la même adresse était refusée. C'est le symptôme
 *      qu'on remarque.
 *   2. Le parent « supprimé » pouvait SE RECONNECTER, et l'API lui recréait un
 *      compte vierge à la volée. La suppression effaçait les données, pas
 *      l'accès.
 *
 * L'ORDRE EST LE MÊME QUE POUR UNE SUPPRESSION PAR LE PARENT LUI-MÊME : les
 * données d'abord, l'identité ensuite. Si le second appel échoue, il reste une
 * identité sans données — le compte se reconnecte sur du vide, et on recommence.
 * Dans l'autre sens, on aurait effacé la seule clé d'accès à des données
 * d'enfants que plus personne ne pourrait ni consulter ni réclamer.
 *
 * L'adresse arrive du tableau d'administration, seul endroit qui la connaisse.
 * Sans elle on ne supprime que les données, comme avant : mieux vaut une
 * suppression incomplète qu'un écran d'erreur sur une opération à moitié faite.
 */
export const supprimerParent = async (id, mail) => {
  await httpClient.delete(`/admin/parents/${id}`);
  if (mail) await supprimerIdentiteDe(mail);
};

export const supprimerEleve = (id) => httpClient.delete(`/admin/eleves/${id}`);

// ------------------------------------------------------------ bannissement
//
// LA LISTE PORTE DES ADRESSES, PAS DES COMPTES : elle survit à la
// suppression, et c'est précisément à ce moment-là qu'elle sert. Le refus,
// lui, est appliqué par le SERVEUR D'IDENTITÉ, qui lit cette même table —
// ces routes ne font qu'administrer.

export const getBannis = () => httpClient.get('/admin/bannis');

/** Bannit un parent depuis sa fiche. Son compte n'est PAS supprimé. */
export const bannirParent = (id, motif) =>
  httpClient.post(`/admin/parents/${id}/bannir`, { motif });

/** Le seul chemin quand le compte n'existe plus, ou n'a jamais existé. */
export const ajouterBanni = (mail, motif) =>
  httpClient.post('/admin/bannis', { mail, motif });

/**
 * Lève un bannissement.
 *
 * L'adresse passe en paramètre d'URL et non dans un corps : `DELETE` avec
 * un corps est mal pris en charge par une partie des relais et des
 * navigateurs. `URLSearchParams` encode le `@` et les points.
 */
export const leverBanni = (mail) =>
  httpClient.delete(`/admin/bannis?${new URLSearchParams({ mail })}`);

/**
 * Les interrupteurs du produit, vus par l'administration.
 * La lecture publique passe par `getReglagesPublics` — elle n'exige pas de
 * compte, la barre de navigation en a besoin avant toute connexion.
 */
export const getReglages = () => httpClient.get('/reglages');

export const definirReglage = (cle, actif) =>
  httpClient.put(`/reglages/${cle}`, { actif });

/**
 * Le bandeau d'information : son texte et son affichage, en un seul appel.
 *
 * PAS `definirReglage`, parce qu'il n'écrit qu'un booléen. Et les deux
 * ensemble parce que le geste est un : les séparer ouvrirait une fenêtre où
 * l'ancien message serait affiché comme si on venait de le confirmer.
 */
export const definirBandeau = (message, actif) =>
  httpClient.put('/reglages/bandeau', { message, actif });

/**
 * L'habillage de l'offre de lancement : son texte et son échéance.
 *
 * L'INTERRUPTEUR N'EST PAS ICI — il passe par `definirReglage`, comme les
 * autres modes. Régler une campagne et la lancer sont deux gestes, faits à
 * des moments différents.
 *
 * `fin` part en ISO 8601 AVEC son fuseau. Envoyer « 2026-09-30T23:59 » nu
 * laisserait le serveur deviner, et il devinerait UTC : la promotion
 * finirait deux heures trop tôt en été, un soir où personne ne regarde.
 */
/**
 * `minutes` ET NON DES HEURES : tout le reste du produit compte en
 * minutes — les forfaits, les consommations, les recharges. La conversion
 * se fait une seule fois, dans le champ de saisie, là où l'administrateur
 * pense en heures.
 */
export const definirOffreLancement = (texte, fin, minutes, formules) =>
  httpClient.put('/reglages/lancement', { texte, fin, minutes, formules });

// --------------------------------------------------------------- planches

/** Les planches DÉJÀ importées, sans leurs octets. */
export const getPlanches = () => httpClient.get('/planches');

/**
 * Importe une planche, ou remplace celle qui portait déjà cette clé.
 *
 * Le nom du fichier choisi sur le disque est ignoré : le serveur le
 * reconstruit à partir de la clé. « appareil_respiratoire_v2.svg » devient
 * « svt-respiratoire.svg », et on retrouve toujours une planche à son nom.
 */
export const importerPlanche = ({ cle, matiereCode, fichier, auteur, source, licence, maison }) => {
  const corps = new FormData();
  corps.append('cle', cle);
  corps.append('matiereCode', matiereCode);
  corps.append('fichier', fichier, fichier.name);
  if (auteur) corps.append('auteur', auteur);
  if (source) corps.append('source', source);
  if (licence) corps.append('licence', licence);

  // TOUJOURS ENVOYÉ, MÊME À FAUX. Un remplacement doit pouvoir RETIRER le
  // drapeau autant que le poser : sans cette ligne, une planche maison
  // remplacée par une figure de Commons resterait marquée maison, et le
  // remplissage automatique des crédits continuerait de l'ignorer.
  corps.append('maison', maison ? 'true' : 'false');

  return httpClient.post('/planches', corps);
};

/** Retire une planche : le professeur redessine à la main. */
export const supprimerPlanche = (cle) => httpClient.delete(`/planches/${cle}`);

/**
 * Ce qui reste à traiter, par file : à décrire, à cartographier, à créditer.
 *
 * LE JOURNAL DIT CE QU'ON A DÉPENSÉ, JAMAIS CE QU'IL RESTE À DÉPENSER.
 */
export const getFilesPlanches = () => httpClient.get('/planches/files');

/**
 * Vide les trois files SANS appeler le modèle.
 *
 * Chaque planche en attente est marquée comme traitée, avec un contenu qui dit
 * qu'elle ne l'a pas été. Rien n'est supprimé : réimporter la planche la remet
 * dans la file.
 */
export const viderFilesPlanches = () => httpClient.post('/planches/files/vider');

// ------------------------------------------------------------------ la base

/**
 * La place occupée par la base, et la part des documents.
 *
 * SUR SQL SERVER EXPRESS, UNE BASE PLEINE ARRÊTE TOUT — dix gigaoctets, et
 * plus une seule écriture n'est acceptée. Le chiffre ne s'obtenait qu'en
 * ouvrant un client SQL sur la production.
 */
export const getEtatBase = () => httpClient.get('/admin/base');

// ------------------------------------------------------- diffusion aux parents

/**
 * Construit le corps multipart d'une diffusion.
 *
 * Partagé par l'aperçu et l'envoi : deux constructions séparées finiraient par
 * diverger, et l'aperçu montrerait autre chose que ce qui part — ce qui lui
 * retirerait toute valeur, puisque c'est le seul garde-fou avant un envoi
 * irréversible.
 */
function corpsDiffusion({ sujet, titre, texte, images, documents }) {
  const corps = new FormData();
  corps.append('sujet', sujet ?? '');
  corps.append('titre', titre ?? '');
  corps.append('texte', texte ?? '');

  // L'ORDRE FAIT LA RÉFÉRENCE. `[image:1]` dans le texte désigne la première
  // image de cette liste : c'est le contrat avec le serveur, et il tient
  // uniquement à l'ordre d'ajout.
  //
  // SEULS LES VRAIS FICHIERS PARTENT. Une pièce déjà enregistrée dans un
  // template (`{ id, name, size }`) n'a pas d'octets ici : c'est le serveur
  // qui la relit.
  (images ?? []).filter(estFichier).forEach((f) => corps.append('images', f, f.name));
  (documents ?? []).filter(estFichier).forEach((f) => corps.append('documents', f, f.name));

  return corps;
}

const estFichier = (f) => typeof File !== 'undefined' && f instanceof File;

/** Le message rendu en HTML, sans destinataire. */
export const apercuDiffusion = (composition) =>
  httpClient.post('/admin/diffusion/apercu', corpsDiffusion(composition), {
    responseType: 'text',
  });

/** Lance l'envoi à TOUS les parents. Rend tout de suite : l'envoi se poursuit. */
export const lancerDiffusion = (composition) =>
  httpClient.post('/admin/diffusion', corpsDiffusion(composition));

/** L'avancement de la diffusion en cours, ou de la dernière. */
export const getEtatDiffusion = () => httpClient.get('/admin/diffusion/etat');

/**
 * Envoie un message personnalisé à UN parent, dans la même mise en page que
 * la diffusion. Contrairement à `lancerDiffusion`, l'envoi tient dans le
 * temps d'une requête : pas de suivi d'avancement à interroger après coup.
 */
export const envoyerMailParent = (composition) => {
  const corps = corpsDiffusion(composition);
  corps.append('destinataire', composition.destinataire ?? '');
  return httpClient.post('/admin/mails/parent', corps);
};

// ------------------------------------------------- templates de courriel

/** Les templates d'une nature (« Diffusion » ou « Automatique »), sans texte. */
export const getModelesMail = (nature) =>
  httpClient.get('/admin/modeles-mail', { params: { nature } });

/** Un template complet : texte et pièces (sans leurs octets). */
export const getModeleMail = (id) => httpClient.get(`/admin/modeles-mail/${id}`);

/**
 * Enregistre un message composé à la main comme nouveau template, fichiers
 * compris — même corps multipart que la diffusion.
 */
export const creerModeleMail = (composition) => {
  const corps = corpsDiffusion(composition);

  // « Diffusion » par défaut ; « Automatique » pour un courriel automatique
  // créé depuis l'écran, qui naît sans règle d'envoi.
  corps.append('nature', composition.nature ?? 'Diffusion');
  if (composition.nom) corps.append('nom', composition.nom);
  if (composition.description) corps.append('description', composition.description);

  return httpClient.post('/admin/modeles-mail', corps);
};

/** La sauvegarde automatique : objet, titre, message (et nom, description). */
export const modifierModeleMail = (id, champs) =>
  httpClient.put(`/admin/modeles-mail/${id}`, champs);

/** Ajoute UNE pièce à un template : `genre` vaut « Image » ou « Document ». */
export const ajouterPieceModele = (id, genre, fichier) => {
  const corps = new FormData();
  corps.append('genre', genre);
  corps.append('fichier', fichier, fichier.name);
  return httpClient.post(`/admin/modeles-mail/${id}/pieces`, corps);
};

/** Retire une pièce. Rend le template, texte renuméroté compris. */
export const retirerPieceModele = (id, pieceId) =>
  httpClient.delete(`/admin/modeles-mail/${id}/pieces/${pieceId}`);

export const supprimerModeleMail = (id) => httpClient.delete(`/admin/modeles-mail/${id}`);

/** Le template rendu en HTML, tel qu'il est enregistré. */
export const apercuModeleMail = (id) =>
  httpClient.post(`/admin/modeles-mail/${id}/apercu`, null, { responseType: 'text' });

/** Lance la diffusion d'un template à TOUS les parents. */
export const diffuserModeleMail = (id) => httpClient.post(`/admin/modeles-mail/${id}/diffusion`);

/** Envoie un template à UN parent. */
export const envoyerModeleParent = (id, destinataire) =>
  httpClient.post(`/admin/modeles-mail/${id}/envoi-parent`, { destinataire });

/**
 * Programme un courriel automatique :
 * `{ actif, frequence: 'Jour'|'Semaine'|'Mois', heure: 'HH:mm', jourSemaine, jourMois }`.
 * Rend le template à jour, prochain envoi compris.
 */
export const planifierModeleMail = (id, regle) =>
  httpClient.put(`/admin/modeles-mail/${id}/planification`, regle);

// ------------------------------------------------ messagerie du support

/** Les derniers messages reçus sur la boîte de support. */
export const getMessages = () => httpClient.get('/admin/messagerie');

/**
 * Un message avec son corps.
 *
 * `images` reste à faux par défaut : les images distantes d'un courriel sont
 * surtout des traceurs, qui disent à l'expéditeur quand le message a été
 * ouvert et depuis quelle adresse. On ne les charge que si on le demande.
 */
export const getMessage = (id, images = false) =>
  httpClient.get(`/admin/messagerie/${id}`, { params: { images } });

export const marquerMessageLu = (id, lu) =>
  httpClient.post(`/admin/messagerie/${id}/lu`, null, { params: { lu } });

/** Répond dans le fil, avec la mise en page du site. */
export const repondreMessage = (id, texte) =>
  httpClient.post(`/admin/messagerie/${id}/repondre`, { texte });

/** L'adresse d'une pièce jointe reçue — passée au navigateur pour téléchargement. */
export const urlPieceJointeMessage = (id, nom) =>
  `/admin/messagerie/${id}/piece?nom=${encodeURIComponent(nom)}`;

/**
 * Re-juge la langue des planches écartées, sans relire aucune image.
 *
 * La règle de langue a changé : elle condamnait des planches entièrement
 * françaises sur un « Erlenmeyer » ou un « Spoutnik », et écartait les
 * planches d'anglais alors que l'anglais y est attendu. Cette passe leur donne
 * une seconde chance à partir des légendes DÉJÀ relevées — quelques jetons de
 * texte par planche, aucune lecture d'image repayée.
 */
export const requalifierPlanches = () => httpClient.post('/planches/requalifier');

/**
 * Le détail d'un compte rendu, et la copie d'une évaluation, VUS PAR
 * L'ADMINISTRATION.
 *
 * Ils doublent les routes de l'espace parent, et c'est nécessaire : celles-là
 * vérifient d'abord que l'enfant appartient au parent du jeton. Un
 * administrateur consultant une autre famille échouait à cette garde — la
 * liste des séances s'affichait, le bouton « Voir le rapport » renvoyait 404.
 *
 * La garde n'est pas levée, elle est remplacée par la bonne : l'autorisation
 * d'administrateur sur le contrôleur, et le filtre sur l'élève dans la requête.
 */
export const getRapportEleve = (eleveId, rapportId) =>
  httpClient.get(`/admin/eleves/${eleveId}/rapports/${rapportId}`);

export const getCopieEleve = (eleveId, evaluationId) =>
  httpClient.get(`/admin/eleves/${eleveId}/evaluations/${evaluationId}/copie`);

export const getDicteeEleve = (eleveId, dicteeId) =>
  httpClient.get(`/admin/eleves/${eleveId}/dictees/${dicteeId}`);

/**
 * L'état d'Anthropic et d'OpenAI : ce que la dernière vérification a constaté.
 *
 * Ce n'est PAS le solde — aucune des deux API ne le donne. On sait si un appel
 * payant passe, et sinon pourquoi (crédit épuisé, clé refusée, panne).
 */
export const getFournisseurs = () => httpClient.get('/admin/fournisseurs');

/** Vérifie tout de suite, sans attendre le passage automatique. */
export const verifierFournisseurs = () => httpClient.post('/admin/fournisseurs/verifier');
