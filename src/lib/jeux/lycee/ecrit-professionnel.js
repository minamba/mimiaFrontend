/**
 * L'ÉCRIT PROFESSIONNEL — le français de terminale professionnelle (Adrien).
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_TPRO_ECR_PROFESSIONNEL — « Adapter son écrit au support : courriel et
 *                                message professionnel »
 *
 * SIX SORTES DE MANCHES (2 + 1 + 1 + 2 + 1 + 1) :
 *   - LA FORMULE D'APPEL (2) : selon le destinataire. LES PIÈGES : le
 *     familier (« Salut »), le trop proche (« Cher… » à un inconnu), le
 *     mauvais destinataire (« Monsieur » à une femme), « Monsieur » seul
 *     quand on ignore qui lira (« Madame, Monsieur ») ;
 *   - LA FORMULE DE POLITESSE (1) : elle reprend la formule d'appel à
 *     l'identique. LES PIÈGES : le familier, le tutoiement, la reprise
 *     inexacte, l'impatience ;
 *   - L'OBJET DU COURRIEL (1) : court et précis. LES PIÈGES : le vague
 *     (« Question »), le message entier dans l'objet, les majuscules qui
 *     crient, le familier ;
 *   - LE REGISTRE (2) : courant ou soutenu. LES PIÈGES : le familier,
 *     l'abrégé de SMS ;
 *   - LA STRUCTURE (1) : l'ordre d'un courriel, la place de l'objet, le plan
 *     « vous, moi, nous » de la lettre de motivation, la signature ;
 *   - CE QU'ON N'ÉCRIT PAS (1) : émoticônes, majuscules, abréviations,
 *     critiques d'un ancien employeur, vie privée, adresse fantaisiste.
 * Seules des règles d'usage stables sont demandées : aucune formule que les
 * guides de correspondance se disputent n'est proposée comme bonne ou comme
 * piège.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'ecrit-professionnel', titre: 'L’écrit professionnel', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TERMINALE_PRO: {
    titre: 'L’écrit professionnel',
    accroche: 'Le bon ton pour écrire à un employeur.',
    competences: ['FR_TPRO_ECR_PROFESSIONNEL'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [situation, la bonne réponse, [[réponse à écarter, la méthode], …]]. */
export const APPELS = [
  ['Lettre de motivation à une entreprise : tu ne connais pas le nom de la personne qui recrute.', 'Madame, Monsieur,', [['Salut,', 'appel-familier'], ['Cher ami,', 'appel-trop-proche']]],
  ['Courriel à Mme Bernard, responsable du recrutement, que tu n’as jamais rencontrée.', 'Madame,', [['Monsieur,', 'appel-destinataire'], ['Coucou,', 'appel-familier']]],
  ['Courriel à M. Petit, directeur de l’agence où tu postules.', 'Monsieur,', [['Salut Monsieur,', 'appel-familier'], ['Madame,', 'appel-destinataire']]],
  ['Lettre au service clients d’une entreprise : tu ignores qui la lira.', 'Madame, Monsieur,', [['Monsieur,', 'appel-inconnu'], ['Bonjour à toi,', 'appel-familier']]],
  ['Premier courriel à ton tuteur de stage, M. Garcia.', 'Bonjour Monsieur,', [['Salut,', 'appel-familier'], ['Madame,', 'appel-destinataire']]],
  ['Candidature spontanée au service des ressources humaines d’un hôpital.', 'Madame, Monsieur,', [['Bonjour les gars,', 'appel-familier'], ['Monsieur,', 'appel-inconnu']]],
  ['Courriel à Mme Roux, directrice de l’entreprise où tu fais ton stage.', 'Madame la Directrice,', [['Salut Mme Roux,', 'appel-familier'], ['Monsieur le Directeur,', 'appel-destinataire']]],
  ['Courriel à l’adresse de contact générale d’une entreprise.', 'Madame, Monsieur,', [['Coucou à tous,', 'appel-familier'], ['Chère Madame,', 'appel-trop-proche']]],
];

export const POLITESSES = [
  [
    'Fin d’une lettre de motivation qui commence par « Madame, Monsieur, ».',
    'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.',
    [['Bisous, à bientôt !', 'politesse-familier'], ['Je vous prie d’agréer, Monsieur, l’expression de mes salutations distinguées.', 'politesse-reprise']],
  ],
  [
    'Fin d’un courriel professionnel bref à un client que tu vouvoies.',
    'Cordialement,',
    [['Bien à toi,', 'politesse-tutoiement'], ['À plus !', 'politesse-familier']],
  ],
  [
    'Fin d’une lettre qui commence par « Madame, ».',
    'Veuillez agréer, Madame, l’expression de mes salutations distinguées.',
    [['Veuillez agréer, Madame, Monsieur, l’expression de mes salutations distinguées.', 'politesse-reprise'], ['Salut, et à la prochaine !', 'politesse-familier']],
  ],
  [
    'Fin d’un courriel à ton tuteur de stage, que tu vouvoies.',
    'Bien cordialement,',
    [['Bien à toi,', 'politesse-tutoiement'], ['Ciao !', 'politesse-familier']],
  ],
  [
    'Fin d’une lettre qui commence par « Monsieur le Directeur, ».',
    'Je vous prie d’agréer, Monsieur le Directeur, l’expression de mes salutations distinguées.',
    [['Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.', 'politesse-reprise'], ['Merci, bye !', 'politesse-familier']],
  ],
  [
    'Juste avant la formule de politesse d’une lettre de motivation.',
    'Je me tiens à votre disposition pour un entretien.',
    [['Réponds-moi vite, s’il te plaît.', 'politesse-tutoiement'], ['J’attends votre réponse cette semaine, sinon je postule ailleurs.', 'politesse-ton']],
  ],
];

export const OBJETS = [
  [
    'Tu envoies ta candidature au poste de vendeur que l’enseigne a publié en ligne.',
    'Candidature au poste de vendeur',
    [['Bonjour', 'objet-vague'], ['Je vous écris parce que j’ai vu votre annonce et que je voudrais travailler chez vous comme vendeur', 'objet-long']],
  ],
  [
    'Tu demandes à ton lycée une attestation de stage.',
    'Demande d’attestation de stage',
    [['Question', 'objet-vague'], ['URGENT !!!', 'objet-crier']],
  ],
  [
    'Tu préviens ton tuteur de ton absence demain, pour un rendez-vous médical.',
    'Absence demain : rendez-vous médical',
    [['Petit souci', 'objet-vague'], ['coucou c’est moi', 'objet-familier']],
  ],
  [
    'Tu réponds à une offre de stage en maintenance industrielle.',
    'Candidature au stage en maintenance industrielle',
    [['Stage', 'objet-vague'], ['Madame, Monsieur, je souhaite faire un stage de maintenance dans votre entreprise, car ce métier me plaît', 'objet-long']],
  ],
  [
    'Tu envoies à ton employeur l’attestation de sécurité sociale qu’il t’a demandée.',
    'Envoi de mon attestation de sécurité sociale',
    [['Pièce jointe', 'objet-vague'], ['Voilà le truc !!', 'objet-familier']],
  ],
  [
    'Tu demandes un rendez-vous au service des ressources humaines.',
    'Demande de rendez-vous',
    [['Message', 'objet-vague'], ['RÉPONDEZ SVP', 'objet-crier']],
  ],
];

/** [ce qu'il faut dire, la phrase au bon registre, la familière, l'abrégée]. */
export const REGISTRES = [
  ['Demander la date de l’entretien.', 'Pourriez-vous me confirmer la date de l’entretien ?', 'Tu peux me dire c’est quand, l’entretien ?', 'Slt, c kan l’entretien ?'],
  ['T’excuser d’un retard.', 'Je vous prie de m’excuser pour mon retard de ce matin.', 'Pardon pour ce matin, j’étais grave à la bourre.', 'dsl pr le retard ce mat'],
  ['Remercier après un stage.', 'Je vous remercie pour votre accueil durant ces quatre semaines.', 'Merci pour tout, c’était trop cool !', 'mrc pr tt c t top'],
  ['Demander un document.', 'Pourriez-vous m’envoyer le planning de la semaine prochaine ?', 'Tu m’envoies le planning de la semaine pro ?', 'planning stp'],
  ['Signaler une panne.', 'Je vous informe que la machine de l’atelier est en panne depuis ce matin.', 'La machine de l’atelier, elle est encore cassée, c’est la galère.', 'machine HS lol'],
  ['Accepter un entretien.', 'J’accepte avec plaisir votre proposition d’entretien.', 'OK, ça marche, je viens !', 'ok jsui la'],
  ['Annoncer une pièce jointe.', 'Vous trouverez ci-joint mon curriculum vitae.', 'Je t’envoie mon CV avec, regarde.', 'cv en PJ :)'],
  ['Demander un délai.', 'Pourriez-vous m’accorder un jour supplémentaire pour ce dossier ?', 'Je peux avoir un jour de plus, c’est chaud, là ?', '1 jr de + svp'],
];

export const STRUCTURES = [
  [
    'Dans quel ordre se suivent les éléments d’un courriel professionnel ?',
    'Objet, formule d’appel, message, formule de politesse, signature',
    [['Formule d’appel, message, signature, objet', 'structure-ordre'], ['Signature, objet, message, formule de politesse', 'structure-ordre']],
  ],
  [
    'Quel plan conseille-t-on souvent pour une lettre de motivation ?',
    'Vous, moi, nous : l’entreprise, mes atouts, notre projet commun',
    [['La liste de tous mes loisirs', 'structure-hors-sujet'], ['Le récit de toute ma scolarité', 'structure-recit']],
  ],
  [
    'Dans une lettre papier, où se place l’objet ?',
    'Avant la formule d’appel',
    [['Après la signature', 'structure-ordre'], ['Dans la formule de politesse', 'structure-ordre']],
  ],
  [
    'Que contient la signature d’un courriel professionnel ?',
    'Ton prénom, ton nom et un moyen de te joindre',
    [['Une citation que tu aimes et des émoticônes', 'structure-superflu'], ['Rien : l’adresse électronique suffit', 'structure-signature']],
  ],
  [
    'Comment présenter le corps d’un courriel professionnel ?',
    'Des paragraphes courts, une idée par paragraphe',
    [['Un seul bloc de texte, sans paragraphe', 'structure-bloc'], ['Plusieurs sujets sans rapport, mélangés', 'structure-un-sujet']],
  ],
  [
    'Que place-t-on dans le premier paragraphe d’une lettre de motivation ?',
    'Le poste visé et ce qui t’attire dans l’entreprise',
    [['Tes loisirs du week-end', 'structure-hors-sujet'], ['La formule de politesse', 'structure-ordre']],
  ],
];

/** [ce qui n'a pas sa place, [deux éléments attendus]]. */
export const A_EVITER = [
  ['Des émoticônes', ['Un objet précis', 'Une formule de politesse']],
  ['Des phrases entières en majuscules', ['Des paragraphes courts', 'Ta signature']],
  ['Des abréviations de SMS', ['Une formule d’appel', 'L’annonce de la pièce jointe']],
  ['Des critiques sur ton ancien employeur', ['Tes compétences', 'Tes disponibilités']],
  ['Une adresse électronique fantaisiste', ['Ton numéro de téléphone', 'Le motif de ton message']],
  ['Des détails de ta vie privée sans rapport avec la demande', ['Le motif de ton message', 'Une formule de politesse']],
];

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche à choix : la bonne réponse et ses réponses à écarter, chacune avec sa méthode. */
const qcm = (melanger, consigne, question, bonne, faux) => ({
  consigne,
  question,
  bonne,
  choix: cartes(melanger([bonne, ...faux.map(([f]) => f)])),
  pieges: Object.fromEntries(faux),
  aide: `${consigne}-regle`,
});

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const tirer = (banque, n) => melanger(banque).slice(0, n);

  const appels = tirer(APPELS, 2).map(([s, b, f]) => qcm(melanger, 'appel', s, b, f));
  const politesses = tirer(POLITESSES, 1).map(([s, b, f]) => qcm(melanger, 'politesse', s, b, f));
  const objets = tirer(OBJETS, 1).map(([s, b, f]) => qcm(melanger, 'objet', s, b, f));
  const registres = tirer(REGISTRES, 2).map(([s, b, familier, abrege]) => qcm(melanger, 'registre', `À écrire : ${s}`, b, [[familier, 'registre-familier'], [abrege, 'registre-abrege']]));
  const structures = tirer(STRUCTURES, 1).map(([s, b, f]) => qcm(melanger, 'structure', s, b, f));
  const aEviter = tirer(A_EVITER, 1).map(([b, attendus]) => qcm(
    melanger,
    'a-eviter',
    'Qu’est-ce qui n’a pas sa place dans un courriel à un employeur ?',
    b,
    attendus.map((a) => [a, 'a-eviter-attendu']),
  ));

  return melanger([...appels, ...politesses, ...objets, ...registres, ...structures, ...aEviter]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  appel: 'Quelle formule d’appel convient à ce destinataire ?',
  politesse: 'Quelle formule convient pour terminer ?',
  objet: 'Quel objet donner à ce courriel ?',
  registre: 'Quelle phrase a le registre qui convient à un écrit professionnel ?',
  structure: 'Une question sur la forme d’un écrit professionnel.',
  'a-eviter': 'Qu’est-ce qui n’a pas sa place dans un courriel à un employeur ?',

  'appel-familier': 'Cette formule est familière : on ne l’emploie qu’avec ses proches. À un destinataire professionnel, on écrit « Madame » ou « Monsieur ».',
  'appel-trop-proche': '« Cher » ou « Chère » supposent que l’on connaît déjà la personne. À un inconnu, on écrit simplement « Madame, Monsieur ».',
  'appel-destinataire': 'Vérifie à qui tu écris : la formule d’appel doit correspondre au destinataire, une femme ou un homme.',
  'appel-inconnu': 'Tu ignores qui lira ta lettre : n’écris pas « Monsieur » seul, mais « Madame, Monsieur », pour t’adresser à tous les lecteurs possibles.',
  'appel-regle': 'La formule d’appel dépend du destinataire : « Madame, Monsieur » si on ne le connaît pas, « Madame » ou « Monsieur » sinon, parfois précédés de « Bonjour » dans un courriel, et jamais de prénom ni de surnom.',

  'politesse-familier': 'Cette formule est familière : elle convient à un ami, pas à un écrit professionnel.',
  'politesse-tutoiement': 'Cette formule tutoie le destinataire. Dans un écrit professionnel, on vouvoie du début à la fin.',
  'politesse-reprise': 'La formule de politesse reprend exactement la formule d’appel : si la lettre commence par « Madame », elle se termine par « Madame ».',
  'politesse-ton': 'Une impatience ou une menace ferme la porte. Termine en restant disponible et courtois.',
  'politesse-regle': 'La formule finale reste polie et vouvoie : « Cordialement » pour un courriel bref, la formule complète pour une lettre, en reprenant la formule d’appel.',

  'objet-vague': 'Cet objet ne dit rien du contenu. Le destinataire doit comprendre, avant d’ouvrir, de quoi parle ton courriel.',
  'objet-long': 'C’est tout le message, pas un objet. L’objet tient en quelques mots : la nature de la demande et son sujet.',
  'objet-crier': 'Les majuscules et les points d’exclamation crient. Un objet professionnel reste calme et précis.',
  'objet-familier': 'Cet objet est familier. Un objet professionnel nomme la demande, sobrement.',
  'objet-regle': 'Un bon objet est court et précis : il dit la nature du message et son sujet, en quelques mots.',

  'registre-familier': 'Cette phrase est familière : tutoiement, mots du langage parlé. À un employeur, on vouvoie, dans une langue courante et soignée.',
  'registre-abrege': 'Les abréviations de SMS n’ont pas leur place dans un écrit professionnel : on écrit chaque mot en entier, avec la ponctuation.',
  'registre-regle': 'Dans un écrit professionnel : le vouvoiement, des phrases complètes, des mots en entier, un ton poli mais simple.',

  'structure-ordre': 'Cet ordre ne va pas. Un courriel s’ouvre sur l’objet et la formule d’appel, puis le message, la formule de politesse, et enfin la signature.',
  'structure-hors-sujet': 'Cela n’intéresse pas le recruteur. Une lettre de motivation parle du poste, de l’entreprise, et de ce que tu peux lui apporter.',
  'structure-recit': 'Raconter toute ta scolarité ne convainc pas. Le plan « vous, moi, nous » parle de l’entreprise, de tes atouts, puis de ce que vous ferez ensemble.',
  'structure-superflu': 'Citations et émoticônes n’ont pas leur place dans une signature professionnelle : ton nom et un moyen de te joindre suffisent.',
  'structure-signature': 'Une adresse électronique ne suffit pas : la signature donne ton prénom, ton nom et un moyen de te joindre.',
  'structure-bloc': 'Un bloc compact décourage la lecture. Aère ton message : des paragraphes courts, une idée par paragraphe.',
  'structure-un-sujet': 'Un courriel professionnel traite un seul sujet, clairement. Pour un autre sujet, on écrit un autre courriel.',
  'structure-regle': 'Un écrit professionnel suit un ordre fixe : objet, formule d’appel, message en paragraphes courts, formule de politesse, signature.',

  'a-eviter-attendu': 'Cet élément est attendu dans un courriel professionnel. Cherche plutôt ce qui serait familier, agressif ou déplacé.',
  'a-eviter-regle': 'Relis ton courriel comme si tu étais l’employeur : tout ce qui serait familier, agressif ou sans rapport avec la demande doit disparaître.',
};
