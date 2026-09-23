const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.repliquesUnOuDes = exports.repliquesTypes = exports.repliquesTrain = exports.repliquesSyllabes = exports.repliquesSujetEloigne = exports.repliquesRuban = exports.repliquesRoue = exports.repliquesPizza = exports.repliquesPeche = exports.repliquesPartage = exports.repliquesPaquets = exports.repliquesNegation = exports.repliquesMiroir = exports.repliquesMarchande = exports.repliquesMachine = exports.repliquesJardin = exports.repliquesHorloge = exports.repliquesEclair = exports.repliquesDuree = exports.repliquesDiagramme = exports.repliquesDeux = exports.repliquesDetective = exports.repliquesCourse = exports.repliquesContraires = exports.repliquesComplements = exports.repliquesCoffre = exports.repliquesChantier = exports.repliquesBouteilles = exports.repliquesBoite = exports.repliquesBalance = exports.repliquesAccords = exports.repliquesAOuA = exports.phrasesDe = exports.commun = exports.PROFESSEUR_PAR_MATIERE = void 0;
exports.toutesLesRepliques = toutesLesRepliques;
var balance = _interopRequireWildcard(require("../balance.js"));
var boite = _interopRequireWildcard(require("../boiteDeDix.js"));
var chantier = _interopRequireWildcard(require("../chantierDesFormes.js"));
var deux = _interopRequireWildcard(require("../deuxParDeux.js"));
var horloge = _interopRequireWildcard(require("../horloge.js"));
var marchande = _interopRequireWildcard(require("../marchande.js"));
var paquets = _interopRequireWildcard(require("../paquetsDeDix.js"));
var peche = _interopRequireWildcard(require("../pecheAuxSons.js"));
var syllabes = _interopRequireWildcard(require("../atelierDesSyllabes.js"));
var eclair = _interopRequireWildcard(require("../motsEclair.js"));
var unOuDes = _interopRequireWildcard(require("../unOuDes.js"));
var coffre = _interopRequireWildcard(require("../coffreDesCentaines.js"));
var course = _interopRequireWildcard(require("../courseDesTables.js"));
var pizza = _interopRequireWildcard(require("../partsDePizza.js"));
var machine = _interopRequireWildcard(require("../machineADix.js"));
var aOuA = _interopRequireWildcard(require("../aOuA.js"));
var types = _interopRequireWildcard(require("../typesDePhrases.js"));
var cj = _interopRequireWildcard(require("../contrairesEtJumeaux.js"));
var roue = _interopRequireWildcard(require("../roueDesVerbes.js"));
var detective = _interopRequireWildcard(require("../detectiveDuVerbe.js"));
var negation = _interopRequireWildcard(require("../phraseQuiDitNon.js"));
var accords = _interopRequireWildcard(require("../accordsCE2.js"));
var ruban = _interopRequireWildcard(require("../metreRuban.js"));
var jardin = _interopRequireWildcard(require("../tourDuJardin.js"));
var duree = _interopRequireWildcard(require("../combienDeTemps.js"));
var bouteilles = _interopRequireWildcard(require("../bouteilles.js"));
var miroir = _interopRequireWildcard(require("../miroir.js"));
var diagramme = _interopRequireWildcard(require("../diagramme.js"));
var partage = _interopRequireWildcard(require("../partageBonbons.js"));
var complements = _interopRequireWildcard(require("../ouQuandComment.js"));
var sujetEloigne = _interopRequireWildcard(require("../sujetEloigne.js"));
var simple_narrateurCM2 = _interopRequireWildcard(require("../narrateurCM2.js"));
var simple_sensFigureCM2 = _interopRequireWildcard(require("../sensFigureCM2.js"));
var simple_complementsCM2 = _interopRequireWildcard(require("../complementsCM2.js"));
var simple_participeAvoirCM2 = _interopRequireWildcard(require("../participeAvoirCM2.js"));
var simple_phrasesCM2 = _interopRequireWildcard(require("../phrasesCM2.js"));
var simple_attributCM2 = _interopRequireWildcard(require("../attributCM2.js"));
var simple_vocabulaireCM2 = _interopRequireWildcard(require("../vocabulaireCM2.js"));
var simple_tempsCM2 = _interopRequireWildcard(require("../tempsCM2.js"));
var simple_homophonesCM2 = _interopRequireWildcard(require("../homophonesCM2.js"));
var simple_billesCM2 = _interopRequireWildcard(require("../billesCM2.js"));
var simple_robotCM2 = _interopRequireWildcard(require("../robotCM2.js"));
var simple_boiteCM2 = _interopRequireWildcard(require("../boiteCM2.js"));
var simple_recetteCM2 = _interopRequireWildcard(require("../recetteCM2.js"));
var simple_decimauxCM2 = _interopRequireWildcard(require("../decimauxCM2.js"));
var simple_tableauxCM2 = _interopRequireWildcard(require("../tableauxCM2.js"));
var simple_geometrieCM2 = _interopRequireWildcard(require("../geometrieCM2.js"));
var simple_airesCM2 = _interopRequireWildcard(require("../airesCM2.js"));
var simple_dureesCM2 = _interopRequireWildcard(require("../dureesCM2.js"));
var simple_longueursCM2 = _interopRequireWildcard(require("../longueursCM2.js"));
var simple_operationsCM2 = _interopRequireWildcard(require("../operationsCM2.js"));
var simple_fractionsCM2 = _interopRequireWildcard(require("../fractionsCM2.js"));
var simple_nombresCM2 = _interopRequireWildcard(require("../nombresCM2.js"));
var simple_motsDeLiaison = _interopRequireWildcard(require("../motsDeLiaison.js"));
var simple_poemeTheatreRecit = _interopRequireWildcard(require("../poemeTheatreRecit.js"));
var simple_commeUneImage = _interopRequireWildcard(require("../commeUneImage.js"));
var simple_aQuiLePronom = _interopRequireWildcard(require("../aQuiLePronom.js"));
var simple_crible = _interopRequireWildcard(require("../crible.js"));
var simple_robot = _interopRequireWildcard(require("../robot.js"));
var simple_sacDeBilles = _interopRequireWildcard(require("../sacDeBilles.js"));
var simple_suiteQuiContinue = _interopRequireWildcard(require("../suiteQuiContinue.js"));
var simple_boiteMystere = _interopRequireWildcard(require("../boiteMystere.js"));
var simple_recettePour8 = _interopRequireWildcard(require("../recettePour8.js"));
var simple_regleDesDixiemes = _interopRequireWildcard(require("../regleDesDixiemes.js"));
var simple_complementsCM1 = _interopRequireWildcard(require("../complementsCM1.js"));
var simple_passeComposeCM1 = _interopRequireWildcard(require("../passeComposeCM1.js"));
var simple_phrasesCM1 = _interopRequireWildcard(require("../phrasesCM1.js"));
var simple_accordsCM1 = _interopRequireWildcard(require("../accordsCM1.js"));
var simple_vocabulaireCM1 = _interopRequireWildcard(require("../vocabulaireCM1.js"));
var simple_tempsCM1 = _interopRequireWildcard(require("../tempsCM1.js"));
var simple_homophonesCM1 = _interopRequireWildcard(require("../homophonesCM1.js"));
var simple_tableauxCM1 = _interopRequireWildcard(require("../tableauxCM1.js"));
var simple_geometrieCM1 = _interopRequireWildcard(require("../geometrieCM1.js"));
var simple_airesCM1 = _interopRequireWildcard(require("../airesCM1.js"));
var simple_dureesCM1 = _interopRequireWildcard(require("../dureesCM1.js"));
var simple_mesuresCM1 = _interopRequireWildcard(require("../mesuresCM1.js"));
var simple_calculMental = _interopRequireWildcard(require("../calculMental.js"));
var simple_fractionsCM1 = _interopRequireWildcard(require("../fractionsCM1.js"));
var simple_grandsNombres = _interopRequireWildcard(require("../grandsNombres.js"));
var train = _interopRequireWildcard(require("../trainDesNombres.js"));
/**
 * TOUT CE QU'UN PROFESSEUR PEUT DIRE DANS UN JEU.
 *
 * Voulu par Camara le 21/09/2026 : « pour tous les jeux, je veux qu'il y ait
 * une lecture de la question par une voix […] la voix des professeurs de
 * l'équipe pédagogique en fonction de la matière », et « pour éviter que ça
 * coûte quelque chose, les voix peuvent-elles être préenregistrées ? ».
 *
 * ELLES LE PEUVENT, PARCE QUE CE QU'UN JEU DIT EST FINI. Une consigne, une
 * erreur nommée, un bravo, une note sur huit : chaque jeu n'a qu'un nombre
 * limité de phrases, toutes connues d'avance. Les paquets de dix ont la plus
 * longue liste — une consigne par nombre de 11 à 99, soit 89 — et c'est
 * encore peu. Tout est donc enregistré une fois, par `scripts/voix-jeux.mjs`,
 * et servi comme n'importe quelle image : jouer ne coûte rien, comme avant.
 *
 * CE FICHIER EST LA SEULE LISTE. Le script d'enregistrement la lit pour savoir
 * quoi enregistrer ; les écrans la lisent pour savoir quoi faire jouer ; un
 * test vérifie que chaque phrase a son enregistrement, avec LE MÊME TEXTE.
 * Changer une phrase sans réenregistrer fait tomber ce test — sans lui, la
 * professeure continuerait de dire l'ancienne phrase sous la nouvelle, et
 * personne ne l'entendrait avant un parent.
 *
 * LES TEXTES VIENNENT DES JEUX EUX-MÊMES (`PHRASES`, `consigne`…), jamais
 * recopiés ici : ce qui est dit est ce qui est écrit, par construction.
 *
 * LES IMPORTS PORTENT LEUR EXTENSION `.js` : le script d'enregistrement lit ce
 * fichier avec Node, qui l'exige. Webpack s'en accommode.
 */

/**
 * LE PROFESSEUR QUI PARLE, D'APRÈS LA MATIÈRE DU JEU.
 *
 * Les mathématiques sont à Nora — Camara l'a dit en ces termes, et c'est aussi
 * ce que porte la table des voix du serveur. POUR TOUTE AUTRE MATIÈRE, LIRE
 * LE PROFESSEUR EN BASE AVANT D'AJOUTER UNE LIGNE : les deviner a déjà coûté
 * cher (voir la note « Professeurs par matière »). Une matière absente d'ici
 * donne un jeu muet, pas un jeu qui parle avec la mauvaise voix.
 */
const PROFESSEUR_PAR_MATIERE = exports.PROFESSEUR_PAR_MATIERE = {
  MATHS: 'nora',
  // Lu en base le 21/09/2026 : Matiere FRANCAIS, prof_avatar « adrien ».
  FRANCAIS: 'adrien'
};

// ------------------------------------------------------ communes à tous

const LETTRES = ['Zéro', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix'];

/**
 * TROIS FAÇONS DE DIRE BRAVO, À TOUR DE RÔLE. La même phrase huit fois de
 * suite, un enfant cesse de l'entendre dès la troisième.
 */
const BRAVOS = ['Bonne réponse !', 'Bravo, c’est ça !', 'Oui, bien joué !'];
const commun = exports.commun = {
  /** Le bravo d'une manche gagnée — il tourne d'une manche à l'autre. */
  bravo: manche => {
    const i = manche % BRAVOS.length;
    return {
      cle: `commun/bravo-${i}`,
      texte: BRAVOS[i]
    };
  },
  /**
   * LA NOTE DE FIN, DITE PAR LA PROFESSEURE, avec son encouragement.
   *
   * L'encouragement est le mot de la fin que l'écran affiche déjà — les cinq
   * jeux ont le même, et un test le vérifie : ce qui est dit reste ce qui est
   * écrit. Le nombre est écrit en lettres pour que la voix le dise comme une
   * note, pas comme un chiffre lu.
   */
  //
  // SUR HUIT OU SUR DIX : les jeux à dix manches (mots éclair, un ou des, la
  // course des tables) disaient « sur huit » — et rien du tout au-delà de
  // huit. La note sur huit garde sa clé : ses voix sont enregistrées.
  note: (n, sur = 8) => sur === 8 ? {
    cle: `commun/note-${n}`,
    texte: `${LETTRES[n]} sur huit. ${paquets.bilan(n)}`
  } : {
    cle: `commun/note-${n}-sur-${sur}`,
    texte: `${LETTRES[n]} sur ${LETTRES[sur].toLowerCase()}. ${paquets.bilan(n, sur)}`
  }
};

// ------------------------------------------------------ jeu par jeu

const repliquesBoite = exports.repliquesBoite = {
  consigne: masquee => masquee ? {
    cle: 'boite/consigne-fermee',
    texte: boite.PHRASES.consigneMasquee
  } : {
    cle: 'boite/consigne',
    texte: boite.PHRASES.consigne
  },
  trop: {
    cle: 'boite/trop',
    texte: boite.PHRASES.trop
  },
  manque: {
    cle: 'boite/manque',
    texte: boite.PHRASES.manque
  }
};
const repliquesMarchande = exports.repliquesMarchande = {
  consigne: achats => ({
    cle: `marchande/consigne-${achats.map(p => p.cle).join('-')}`,
    texte: marchande.consigne(achats)
  }),
  trop: {
    cle: 'marchande/trop',
    texte: marchande.PHRASES.trop
  },
  // Le CE1 : le client commande, tend son billet, et attend sa monnaie.
  consigneCE1: lignes => ({
    cle: `marchande/ce1-${lignes.map(l => `${l.quantite}-${l.produit.cle}`).join('-')}`,
    texte: marchande.consigneCE1(lignes)
  }),
  rendre: {
    cle: 'marchande/ce1-rendre',
    texte: marchande.PHRASES_CE1.rendre
  },
  rendTrop: {
    cle: 'marchande/ce1-trop',
    texte: marchande.PHRASES_CE1.trop
  },
  rendPasAssez: {
    cle: 'marchande/ce1-pas-assez',
    texte: marchande.PHRASES_CE1.pasAssez
  },
  aideRendu: {
    cle: 'marchande/ce1-aide',
    texte: marchande.PHRASES_CE1.aide
  },
  // Le CE2 : lire un prix à virgule et payer juste.
  consigneCE2: {
    cle: 'marchande/ce2-consigne',
    texte: marchande.PHRASES_CE2.consigne
  },
  erreurCE2: sens => ({
    cle: `marchande/ce2-${sens}`,
    texte: marchande.PHRASES_CE2[sens]
  }),
  aideCE2: {
    cle: 'marchande/ce2-aide',
    texte: marchande.PHRASES_CE2.aide
  }
};
const repliquesTrain = exports.repliquesTrain = {
  consigne: {
    cle: 'train/consigne',
    texte: train.PHRASES.consigne
  },
  tropLoin: {
    cle: 'train/trop-loin',
    texte: train.PHRASES.tropLoin
  },
  pasAssezLoin: {
    cle: 'train/pas-assez-loin',
    texte: train.PHRASES.pasAssezLoin
  }
};
const repliquesPaquets = exports.repliquesPaquets = {
  consigne: cible => ({
    cle: `paquets/consigne-${cible}`,
    texte: paquets.consigne(cible)
  }),
  trop: {
    cle: 'paquets/trop',
    texte: paquets.PHRASES.trop
  },
  pasAssez: {
    cle: 'paquets/pas-assez',
    texte: paquets.PHRASES.pasAssez
  }
};
const repliquesChantier = exports.repliquesChantier = {
  consigne: famille => ({
    cle: `chantier/consigne-${famille}`,
    texte: chantier.consigne(famille)
  }),
  aide: famille => ({
    cle: `chantier/aide-${famille}`,
    texte: chantier.aide(famille)
  }),
  erreur: chantier.erreur
};

/** Le verdict de l'horloge, vers la clé de sa phrase. */
const ERREURS_HORLOGE = {
  aiguilles: 'aiguilles',
  'plus-tard': 'plusTard',
  'plus-tot': 'plusTot',
  inversees: 'inversees',
  grande: 'grande',
  petite: 'petite',
  // Le CE1 et ses demi-heures.
  demie: 'demie',
  entre: 'entre',
  pleine: 'pleine',
  'grande-demie': 'grandeDemie'
};

/**
 * LA CLÉ D'UN MOMENT : « 3 » pour 3 heures, « 3-demie » pour 3 heures et
 * demie. Les heures entières gardent la clé qu'elles avaient au CP : leurs
 * voix, déjà enregistrées, restent valables.
 */
const cleMoment = m => horloge.estDemie(m) ? `${Math.floor(m)}-demie` : String(m);
const repliquesHorloge = exports.repliquesHorloge = {
  consigneLecture: {
    cle: 'horloge/consigne-lecture',
    texte: horloge.PHRASES.consigneLecture
  },
  consigneReglage: heure => ({
    cle: `horloge/consigne-${cleMoment(heure)}`,
    texte: horloge.consigneReglage(heure)
  }),
  erreur: sens => ({
    cle: `horloge/${sens}`,
    texte: horloge.PHRASES[ERREURS_HORLOGE[sens]]
  }),
  /**
   * LES RÉPONSES ET L'INDICE SONT LUS AUSSI — Camara, le 21/09/2026 : « quand
   * on a les réponses à choix, je veux que le professeur les lise à voix
   * haute, on est sur des CP ». Un enfant qui ne lit pas encore « 12 heures »
   * sur un bouton ne peut pas choisir entre quatre boutons.
   */
  //
  // ELLES SONT DITES COMME ON PROPOSE UN CHOIX, sur un ton qui monte : « 2 heures ?
  // 12 heures ? ». Enregistrée seule et finie par un point, chaque heure
  // retombait comme une phrase close, et les quatre à la suite sonnaient
  // comme quatre phrases recollées. Le bouton garde « 2 heures » : ce sont
  // les mêmes mots, seule l'intonation change.
  heure: h => ({
    cle: `horloge/heure-${cleMoment(h)}`,
    texte: `${horloge.ecrire(h)} ?`,
    liste: true
  }),
  indice: {
    cle: 'horloge/indice',
    texte: horloge.PHRASES.indice
  }
};
const repliquesBalance = exports.repliquesBalance = {
  consigneComparer: {
    cle: 'balance/consigne-comparer',
    texte: balance.PHRASES.consigneComparer
  },
  consigneRanger: {
    cle: 'balance/consigne-ranger',
    texte: balance.PHRASES.consigneRanger
  },
  plein: {
    cle: 'balance/plein',
    texte: balance.PHRASES.plein
  },
  consignePeser: cle => ({
    cle: `balance/consigne-peser-${cle}`,
    texte: balance.consignePeser(cle)
  }),
  resultat: cle => ({
    cle: `balance/resultat-${cle}`,
    texte: balance.resultat(cle)
  }),
  /** Une paire dans le mauvais ordre : « Le livre est plus lourd que la pomme. » */
  plusLourdQue: (lourd, leger) => ({
    cle: `balance/${lourd}-plus-lourd-que-${leger}`,
    texte: balance.plusLourdQue(lourd, leger)
  }),
  erreur: sens => ({
    cle: `balance/${sens}`,
    texte: balance.PHRASES[sens]
  }),
  // Le CE1 : des poids marqués au lieu des cubes.
  consignePeserCE1: cle => ({
    cle: `balance/ce1-consigne-${cle}`,
    texte: balance.consignePeserCE1(cle)
  }),
  resultatCE1: cle => ({
    cle: `balance/ce1-resultat-${cle}`,
    texte: balance.resultatCE1(cle)
  }),
  resultatCE2: cle => ({
    cle: `balance/ce2-resultat-${cle}`,
    texte: balance.resultatCE2(cle)
  }),
  resultatPoids: (cle, niveau) => niveau === 'CE2' ? {
    cle: `balance/ce2-resultat-${cle}`,
    texte: balance.resultatCE2(cle)
  } : {
    cle: `balance/ce1-resultat-${cle}`,
    texte: balance.resultatCE1(cle)
  },
  erreurCE1: sens => ({
    cle: `balance/ce1-${sens}`,
    texte: balance.PHRASES_CE1[sens]
  })
};

/** Le verdict de « Deux par deux », vers la clé de sa phrase. */
const ERREURS_DEUX = {
  oubli: 'oubli',
  tout: 'tout',
  trop: 'trop',
  'pas-assez': 'pasAssez'
};
const repliquesDeux = exports.repliquesDeux = {
  consigneDouble: {
    cle: 'deux/consigne-double',
    texte: deux.PHRASES.consigneDouble
  },
  consigneMoitie: {
    cle: 'deux/consigne-moitie',
    texte: deux.PHRASES.consigneMoitie
  },
  // Les nombres proposés, dits comme on propose un choix — voir l'horloge.
  nombre: v => ({
    cle: `deux/nombre-${v}`,
    texte: `${v} ?`,
    liste: true
  }),
  resultat: (mode, n) => mode === 'double' ? {
    cle: `deux/double-${n}`,
    texte: deux.resultatDouble(n)
  } : {
    cle: `deux/moitie-${n}`,
    texte: deux.resultatMoitie(n)
  },
  erreur: sens => ({
    cle: `deux/${sens}`,
    texte: deux.PHRASES[ERREURS_DEUX[sens]]
  })
};
const repliquesPeche = exports.repliquesPeche = {
  consigne: s => ({
    cle: `peche/consigne-${s}`,
    texte: peche.son(s).consigne
  }),
  // Le nom de chaque image, dit comme un élément de liste : Adrien les
  // enchaîne tous en début de manche, à un débit régulier.
  nom: cle => ({
    cle: `peche/mot-${cle}`,
    texte: peche.mot(cle).mot,
    liste: true
  }),
  intrus: n => n > 1 ? {
    cle: 'peche/intrus-pluriel',
    texte: peche.PHRASES.intrusPluriel
  } : {
    cle: 'peche/intrus',
    texte: peche.PHRASES.intrus
  },
  manque: {
    cle: 'peche/manque',
    texte: peche.PHRASES.manque
  },
  aide: {
    cle: 'peche/aide',
    texte: peche.PHRASES.aide
  }
};
const repliquesSyllabes = exports.repliquesSyllabes = {
  consigne: {
    cle: 'syllabes/consigne',
    texte: syllabes.PHRASES.consigne
  },
  // Le mot entier, jamais ses syllabes : les étiquettes ne parlent pas, voir
  // la note du module. Dit comme un élément de liste, sans intonation de
  // question.
  mot: cle => ({
    cle: `syllabes/mot-${cle}`,
    texte: syllabes.mot(cle).mot,
    liste: true
  }),
  // Une syllabe seule : pour dire le mot en syllabes, et pour l'aide après
  // deux erreurs. `syllabe` : l'écoute ne peut pas la vérifier (« teau »
  // s'écrit « tôt »), voir `scripts/voix-jeux.mjs`.
  son: texte => ({
    cle: `syllabes/son-${cleFichier(texte)}`,
    texte,
    syllabe: true
  }),
  sonsOuverts: {
    cle: 'syllabes/sons-ouverts',
    texte: syllabes.PHRASES.sonsOuverts
  },
  faux: n => n > 1 ? {
    cle: 'syllabes/faux-pluriel',
    texte: syllabes.PHRASES.fauxPluriel
  } : {
    cle: 'syllabes/faux',
    texte: syllabes.PHRASES.faux
  },
  ordre: {
    cle: 'syllabes/ordre',
    texte: syllabes.PHRASES.ordre
  },
  aide: {
    cle: 'syllabes/aide',
    texte: syllabes.PHRASES.aide
  }
};
const repliquesEclair = exports.repliquesEclair = {
  consigne: {
    cle: 'eclair/consigne',
    texte: eclair.PHRASES.consigne
  },
  // Le mot outil, dit APRÈS le choix seulement : voir la note du composant.
  mot: m => ({
    cle: `eclair/mot-${m}`,
    texte: m,
    liste: true
  }),
  erreur: {
    cle: 'eclair/erreur',
    texte: eclair.PHRASES.erreur
  },
  aide: {
    cle: 'eclair/aide',
    texte: eclair.PHRASES.aide
  }
};
const repliquesCoffre = exports.repliquesCoffre = {
  construire: n => ({
    cle: `coffre/construire-${n}`,
    texte: coffre.consigneConstruire(n)
  }),
  consigneLire: {
    cle: 'coffre/consigne-lire',
    texte: coffre.PHRASES.consigneLire
  },
  erreur: (sens, colonne) => ({
    cle: `coffre/${sens}-${colonne}`,
    texte: coffre.phraseErreur(sens, colonne)
  }),
  aide: {
    cle: 'coffre/aide',
    texte: coffre.PHRASES.aide
  },
  aideCE2: {
    cle: 'coffre/aide-ce2',
    texte: coffre.PHRASES.aideCE2
  }
};
const repliquesCourse = exports.repliquesCourse = {
  consigne: {
    cle: 'course/consigne',
    texte: course.PHRASES.consigne
  },
  question: (a, b) => ({
    cle: `course/${a}-fois-${b}`,
    texte: course.question(a, b)
  }),
  jumelle: (a, b) => ({
    cle: `course/jumelle-${a}-fois-${b}`,
    texte: course.questionJumelle(a, b)
  }),
  methode: (a, b) => ({
    cle: `course/methode-${Math.min(a, b)}`,
    texte: course.methode(a, b)
  }),
  rappelJumelle: {
    cle: 'course/rappel-jumelle',
    texte: course.PHRASES.jumelle
  }
};
const repliquesPizza = exports.repliquesPizza = {
  consigne: mode => ({
    cle: `pizza/consigne-${mode}`,
    texte: pizza.PHRASES[mode]
  }),
  erreur: sens => ({
    cle: `pizza/${sens}`,
    texte: pizza.PHRASES[pizza.ERREURS[sens]]
  }),
  aide: {
    cle: 'pizza/aide',
    texte: pizza.PHRASES.aide
  }
};
const repliquesMachine = exports.repliquesMachine = {
  consigne: (mode, facteur = 10) => facteur === 100 ? {
    cle: `machine/consigne-${mode}-cent`,
    texte: machine.PHRASES[`${mode}Cent`]
  } : {
    cle: `machine/consigne-${mode}`,
    texte: machine.PHRASES[mode]
  },
  erreur: sens => ({
    cle: `machine/${sens}`,
    texte: machine.PHRASES[machine.ERREURS[sens]]
  }),
  aide: (facteur = 10) => facteur === 100 ? {
    cle: 'machine/aide-cent',
    texte: machine.PHRASES.aideCent
  } : {
    cle: 'machine/aide',
    texte: machine.PHRASES.aide
  }
};

/** Les clés de fichier n'ont pas d'accent : « à » s'y écrit « a-accent ». */
const sansAccentCle = mot => mot === 'à' ? 'a-accent' : mot;
const CONSIGNES_AOUA = {
  a: 'consigneA',
  et: 'consigneEt',
  son: 'consigneSon',
  on: 'consigneOn'
};
const repliquesAOuA = exports.repliquesAOuA = {
  consigne: p => {
    const premier = aOuA.paire(p)[0];
    return {
      cle: `aoua/consigne-${premier}`,
      texte: aOuA.PHRASES[CONSIGNES_AOUA[premier]]
    };
  },
  methode: mot => ({
    cle: `aoua/methode-${sansAccentCle(mot)}`,
    texte: aOuA.PHRASES[mot]
  })
};
const repliquesTypes = exports.repliquesTypes = {
  consigne: {
    cle: 'types/consigne',
    texte: types.PHRASES.consigne
  },
  indice: type => ({
    cle: `types/indice-${type}`,
    texte: types.PHRASES[type]
  })
};

/** Les clés de fichier n'ont ni accent ni espace : « mouillé » → « mouille ». */
const cleFichier = mot => mot.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '-');
const repliquesContraires = exports.repliquesContraires = {
  question: m => ({
    cle: `contraires/${m.demande}-${cleFichier(m.mot)}`,
    texte: cj.question(m)
  }),
  erreur: (m, sens) => {
    if (sens === 'sans-lien') return {
      cle: 'contraires/sans-lien',
      texte: cj.PHRASES.sansLien
    };
    if (sens === 'sosie') return {
      cle: 'contraires/sosie',
      texte: cj.PHRASES.sosie
    };
    return m.demande === 'contraire' ? {
      cle: 'contraires/piege-contraire',
      texte: cj.PHRASES.piegeContraire
    } : {
      cle: 'contraires/piege-jumeau',
      texte: cj.PHRASES.piegeJumeau
    };
  }
};
const repliquesRoue = exports.repliquesRoue = {
  consigne: {
    cle: 'roue/consigne',
    texte: roue.PHRASES.consigne
  },
  consigneCE2: {
    cle: 'roue/consigne-ce2',
    texte: roue.PHRASES.consigneCE2
  },
  // Les règles du présent sont écrites une à une ; celles de l'imparfait et
  // du futur se composent sur un modèle — voir `regleCE2`.
  regle: sens => {
    var _roue$PHRASES$sens;
    return {
      cle: `roue/${cleFichier(sens)}`,
      texte: (_roue$PHRASES$sens = roue.PHRASES[sens]) !== null && _roue$PHRASES$sens !== void 0 ? _roue$PHRASES$sens : roue.regleCE2(sens)
    };
  }
};
const repliquesDetective = exports.repliquesDetective = {
  consigneVerbe: {
    cle: 'detective/consigne-verbe',
    texte: detective.PHRASES.consigneVerbe
  },
  sujet: p => ({
    cle: `detective/qui-${cleFichier(p.question)}`,
    texte: detective.questionSujet(p)
  }),
  erreurVerbe: {
    cle: 'detective/erreur-verbe',
    texte: detective.PHRASES.erreurVerbe
  },
  erreurSujet: {
    cle: 'detective/erreur-sujet',
    texte: detective.PHRASES.erreurSujet
  },
  // Le CE2 : les classes de mots.
  consigneClasse: c => ({
    cle: `detective/touche-${c}`,
    texte: detective.PHRASES_CLASSES.consigne(c)
  }),
  estUn: c => ({
    cle: `detective/est-${c}`,
    texte: detective.PHRASES_CLASSES.estUn(c)
  }),
  definition: c => ({
    cle: `detective/definition-${c}`,
    texte: detective.PHRASES_CLASSES.definition[c]
  })
};
const repliquesNegation = exports.repliquesNegation = {
  consigne: {
    cle: 'negation/consigne',
    texte: negation.PHRASES.consigne
  },
  erreur: sens => ({
    cle: `negation/${sens}`,
    texte: negation.PHRASES[sens]
  }),
  aide: {
    cle: 'negation/aide',
    texte: negation.PHRASES.aide
  },
  // La phrase négative dite en entier, une fois écrite : on l'entend dire non.
  phrase: i => ({
    cle: `negation/phrase-${i}`,
    texte: negation.negative(negation.phrase(i))
  }),
  // Le CE2 : transformer une phrase.
  consigneCE2: forme => ({
    cle: `negation/ce2-${forme}`,
    texte: negation.PHRASES_CE2[forme]
  }),
  erreurCE2: faute => ({
    cle: `negation/ce2-${faute}`,
    texte: negation.PHRASES_CE2[faute]
  })
};
const repliquesAccords = exports.repliquesAccords = {
  consigne: i => ({
    cle: `accords/consigne-${i}`,
    texte: accords.consigne(accords.groupe(i))
  }),
  regle: sens => ({
    cle: `accords/${sens}`,
    texte: accords.REGLES[sens]
  }),
  aide: {
    cle: 'accords/aide',
    texte: accords.AIDE
  }
};

// ------------------------------------------------------ les jeux du CE2

/** Une consigne et des remarques nommées : la forme de la plupart des jeux du CE2. */
const simple = (prefixe, module) => ({
  consigne: {
    cle: `${prefixe}/consigne`,
    texte: module.PHRASES.consigne
  },
  erreur: sens => ({
    cle: `${prefixe}/${sens}`,
    texte: module.PHRASES[sens]
  })
});
const repliquesRuban = exports.repliquesRuban = simple('ruban', ruban);
const repliquesJardin = exports.repliquesJardin = simple('jardin', jardin);
const repliquesDuree = exports.repliquesDuree = simple('duree', duree);
const repliquesDiagramme = exports.repliquesDiagramme = simple('diagramme', diagramme);
const repliquesPartage = exports.repliquesPartage = simple('partage', partage);
const repliquesSujetEloigne = exports.repliquesSujetEloigne = simple('sujet-eloigne', sujetEloigne);
const repliquesBouteilles = exports.repliquesBouteilles = {
  consigne: mode => ({
    cle: `bouteilles/consigne-${mode}`,
    texte: bouteilles.PHRASES[mode]
  }),
  erreur: sens => ({
    cle: `bouteilles/${sens}`,
    texte: bouteilles.PHRASES[sens]
  })
};
const repliquesMiroir = exports.repliquesMiroir = {
  consigne: mode => mode === 'axe' ? {
    cle: 'miroir/consigne-axe',
    texte: miroir.PHRASES.consigneAxe
  } : {
    cle: 'miroir/consigne-angle',
    texte: miroir.PHRASES.consigneAngle
  },
  erreur: sens => ({
    cle: `miroir/${sens}`,
    texte: miroir.PHRASES[sens]
  })
};
const repliquesComplements = exports.repliquesComplements = {
  consigne: {
    cle: 'complements/consigne',
    texte: complements.PHRASES.consigne
  },
  indice: type => ({
    cle: `complements/${type}`,
    texte: complements.PHRASES[type]
  })
};

// ------------------------------------------------------ les jeux simples

/**
 * LES JEUX SIMPLES, À PARTIR DU CM1 — voir `components/jeux/JeuSimple.js`.
 * Chaque module porte TOUTES ses phrases dites dans `PHRASES` ; une phrase y
 * a sa clé, et le fichier s'appelle `<préfixe>/<clé>`.
 */
const phrasesDe = (prefixe, module) => cle => ({
  cle: `${prefixe}/${cleFichier(cle)}`,
  texte: module.PHRASES[cle]
});

/** Les jeux simples et le professeur de leur matière : [préfixe, module, matière]. */
exports.phrasesDe = phrasesDe;
const SIMPLES = [
// JEUX_SIMPLES — une ligne par jeu, ajoutée avec son import.
['narrateur-cm2', simple_narrateurCM2, 'FRANCAIS'], ['sens-figure-cm2', simple_sensFigureCM2, 'FRANCAIS'], ['complements-cm2', simple_complementsCM2, 'FRANCAIS'], ['participe-avoir-cm2', simple_participeAvoirCM2, 'FRANCAIS'], ['phrases-cm2', simple_phrasesCM2, 'FRANCAIS'], ['attribut-cm2', simple_attributCM2, 'FRANCAIS'], ['vocabulaire-cm2', simple_vocabulaireCM2, 'FRANCAIS'], ['temps-cm2', simple_tempsCM2, 'FRANCAIS'], ['homophones-cm2', simple_homophonesCM2, 'FRANCAIS'], ['billes-cm2', simple_billesCM2, 'MATHS'], ['robot-cm2', simple_robotCM2, 'MATHS'], ['boite-cm2', simple_boiteCM2, 'MATHS'], ['recette-cm2', simple_recetteCM2, 'MATHS'], ['decimaux-cm2', simple_decimauxCM2, 'MATHS'], ['tableaux-cm2', simple_tableauxCM2, 'MATHS'], ['geometrie-cm2', simple_geometrieCM2, 'MATHS'], ['aires-cm2', simple_airesCM2, 'MATHS'], ['durees-cm2', simple_dureesCM2, 'MATHS'], ['longueurs-cm2', simple_longueursCM2, 'MATHS'], ['operations-cm2', simple_operationsCM2, 'MATHS'], ['fractions-cm2', simple_fractionsCM2, 'MATHS'], ['nombres-cm2', simple_nombresCM2, 'MATHS'], ['mots-de-liaison', simple_motsDeLiaison, 'FRANCAIS'], ['poeme-theatre-recit', simple_poemeTheatreRecit, 'FRANCAIS'], ['comme-une-image', simple_commeUneImage, 'FRANCAIS'], ['a-qui-le-pronom', simple_aQuiLePronom, 'FRANCAIS'], ['crible', simple_crible, 'MATHS'], ['robot', simple_robot, 'MATHS'], ['sac-de-billes', simple_sacDeBilles, 'MATHS'], ['suite-qui-continue', simple_suiteQuiContinue, 'MATHS'], ['boite-mystere', simple_boiteMystere, 'MATHS'], ['recette-pour-8', simple_recettePour8, 'MATHS'], ['regle-des-dixiemes', simple_regleDesDixiemes, 'MATHS'], ['complements-cm1', simple_complementsCM1, 'FRANCAIS'], ['passe-compose-cm1', simple_passeComposeCM1, 'FRANCAIS'], ['phrases-cm1', simple_phrasesCM1, 'FRANCAIS'], ['accords-cm1', simple_accordsCM1, 'FRANCAIS'], ['vocabulaire-cm1', simple_vocabulaireCM1, 'FRANCAIS'], ['temps-cm1', simple_tempsCM1, 'FRANCAIS'], ['homophones-cm1', simple_homophonesCM1, 'FRANCAIS'], ['tableaux-cm1', simple_tableauxCM1, 'MATHS'], ['geometrie-cm1', simple_geometrieCM1, 'MATHS'], ['aires-cm1', simple_airesCM1, 'MATHS'], ['durees-cm1', simple_dureesCM1, 'MATHS'], ['mesures-cm1', simple_mesuresCM1, 'MATHS'], ['calcul-mental', simple_calculMental, 'MATHS'], ['fractions-cm1', simple_fractionsCM1, 'MATHS'], ['grands-nombres', simple_grandsNombres, 'MATHS']];

// Chaque étiquette se fait lire, le nom toujours sans son s : voir la note du
// module et `motADire`.
const repliquesUnOuDes = exports.repliquesUnOuDes = {
  mot: etiquetteChoisie => {
    const {
      sorte,
      mot
    } = unOuDes.motADire(etiquetteChoisie);
    return {
      cle: `unoudes/${sorte}-${cleFichier(mot)}`,
      texte: mot
    };
  },
  pareil: {
    cle: 'unoudes/pareil',
    texte: unOuDes.PHRASES.pareil
  },
  consigne: {
    cle: 'unoudes/consigne',
    texte: unOuDes.PHRASES.consigne
  },
  nombre: pluriel => pluriel ? {
    cle: 'unoudes/nombre-des',
    texte: unOuDes.PHRASES.nombreDes
  } : {
    cle: 'unoudes/nombre-un',
    texte: unOuDes.PHRASES.nombreUn
  },
  accord: pluriel => pluriel ? {
    cle: 'unoudes/accord-des',
    texte: unOuDes.PHRASES.accordDes
  } : {
    cle: 'unoudes/accord-un',
    texte: unOuDes.PHRASES.accordUn
  },
  aide: {
    cle: 'unoudes/aide',
    texte: unOuDes.PHRASES.aide
  }
};

// ------------------------------------------------------ l'inventaire

/**
 * TOUTES LES PHRASES POSSIBLES, PAR PROFESSEUR.
 *
 * C'est ce que le script enregistre et ce que le test vérifie. Chaque jeu y
 * énumère TOUT ce qu'il peut dire, y compris les combinaisons : les seize
 * commandes de la marchande, les 89 consignes des paquets. Un cas oublié ici
 * serait un silence en pleine partie — le test des écrans le rattrape en
 * vérifiant que chaque clé jouée figure dans cet inventaire.
 */
function toutesLesRepliques() {
  const parJeu = [];

  // La boîte de 10.
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesBoite.consigne(false), repliquesBoite.consigne(true), repliquesBoite.trop, repliquesBoite.manque]
  });

  // La marchande : un produit seul, ou deux produits différents dans l'ordre
  // où la commande les cite — « une pomme et une banane » ne se dit pas comme
  // « une banane et une pomme ».
  const commandes = [];
  marchande.PRODUITS.forEach(a => {
    commandes.push([a]);
    marchande.PRODUITS.forEach(b => {
      if (b !== a) commandes.push([a, b]);
    });
  });
  parJeu.push({
    matiere: 'MATHS',
    repliques: [...commandes.map(repliquesMarchande.consigne), repliquesMarchande.trop]
  });

  // La marchande du CE1 : un produit pris deux ou trois fois, ou deux produits
  // dont au moins un pris deux fois — voir `serieCE1`.
  const commandesCE1 = [];
  marchande.PRODUITS.forEach(a => {
    [2, 3].forEach(q => commandesCE1.push([{
      produit: a,
      quantite: q
    }]));
    marchande.PRODUITS.forEach(b => {
      if (b === a) return;
      [[1, 2], [2, 1], [2, 2]].forEach(([q1, q2]) => commandesCE1.push([{
        produit: a,
        quantite: q1
      }, {
        produit: b,
        quantite: q2
      }]));
    });
  });
  parJeu.push({
    matiere: 'MATHS',
    repliques: [...commandesCE1.map(repliquesMarchande.consigneCE1), repliquesMarchande.rendre, repliquesMarchande.rendTrop, repliquesMarchande.rendPasAssez, repliquesMarchande.aideRendu, repliquesMarchande.consigneCE2, repliquesMarchande.erreurCE2('euros'), repliquesMarchande.erreurCE2('centimes'), repliquesMarchande.aideCE2]
  });

  // Le train des nombres.
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesTrain.consigne, repliquesTrain.tropLoin, repliquesTrain.pasAssezLoin]
  });

  // Les paquets de dix : une consigne par nombre possible.
  const cibles = [];
  for (let n = paquets.CIBLE_MIN; n <= paquets.CIBLE_MAX; n += 1) cibles.push(n);
  parJeu.push({
    matiere: 'MATHS',
    repliques: [...cibles.map(repliquesPaquets.consigne), repliquesPaquets.trop, repliquesPaquets.pasAssez]
  });

  // Le chantier des formes : consignes, aides, et toutes les erreurs
  // possibles. ELLES SONT PRODUITES PAR `erreur()` ELLE-MÊME, sur des tas
  // fabriqués pour l'occasion, et jamais réécrites ici : recopier les textes
  // les aurait fait diverger au premier changement.
  const pieceDe = (id, cle) => ({
    id,
    modele: cle,
    cible: false
  });
  const erreursChantier = [];
  const ajouter = r => {
    if (r && !erreursChantier.some(x => x.cle === r.cle)) erreursChantier.push(r);
  };
  chantier.FAMILLES.forEach(f => {
    const autre = chantier.FAMILLES.find(x => x !== f);
    ajouter(chantier.erreur({
      sens: 'manque',
      erreurs: []
    }, f, []));
    ajouter(chantier.erreur({
      sens: 'intrus',
      erreurs: ['a']
    }, f, [pieceDe('a', autre)]));
    ajouter(chantier.erreur({
      sens: 'intrus',
      erreurs: ['a', 'b']
    }, f, [pieceDe('a', autre), pieceDe('b', autre)]));
    chantier.MODELES.filter(m => m.piege).forEach(m => {
      ajouter(chantier.erreur({
        sens: 'intrus',
        erreurs: ['a']
      }, f, [pieceDe('a', m.cle)]));
    });
  });
  parJeu.push({
    matiere: 'MATHS',
    repliques: [...chantier.FAMILLES.map(repliquesChantier.consigne), ...chantier.FAMILLES.map(repliquesChantier.aide), ...erreursChantier]
  });

  // L'horloge : la consigne de lecture, une consigne de réglage par heure,
  // et chaque erreur nommée.
  // Les heures entières du CP, puis les demies du CE1.
  const heures = [];
  for (let h = 1; h <= 12; h += 1) heures.push(h);
  for (let h = 1; h <= 12; h += 1) heures.push(h + 0.5);
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesHorloge.consigneLecture, ...heures.map(repliquesHorloge.consigneReglage), ...Object.keys(ERREURS_HORLOGE).map(repliquesHorloge.erreur), ...heures.map(repliquesHorloge.heure), repliquesHorloge.indice]
  });

  // La balance : les consignes du rangement, puis, par objet qu'on peut peser, sa
  // consigne et son résultat, et chaque erreur nommée.
  const pesables = balance.OBJETS.filter(o => o.masse >= 2).map(o => o.cle);
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesBalance.consigneComparer, repliquesBalance.consigneRanger, repliquesBalance.plein, ...pesables.map(repliquesBalance.consignePeser), ...pesables.map(repliquesBalance.resultat),
    // Chaque paire possible, du plus lourd vers le plus léger.
    ...balance.OBJETS.flatMap(a => balance.OBJETS.filter(b => a.masse > b.masse).map(b => repliquesBalance.plusLourdQue(a.cle, b.cle))), repliquesBalance.erreur('manque'), repliquesBalance.erreur('trop'),
    // Le CE1.
    ...pesables.map(repliquesBalance.consignePeserCE1), ...pesables.map(repliquesBalance.resultatCE1), ...pesables.map(repliquesBalance.resultatCE2), repliquesBalance.erreurCE1('manque'), repliquesBalance.erreurCE1('trop')]
  });

  // Deux par deux : les deux consignes, les nombres de 1 à 20 qui peuvent
  // être proposés, le résultat de chaque double et de chaque moitié, et
  // chaque erreur nommée.
  const nombres = Array.from({
    length: 20
  }, (_, i) => i + 1);
  const assiettes = Array.from({
    length: 9
  }, (_, i) => i + 2);
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesDeux.consigneDouble, repliquesDeux.consigneMoitie, ...nombres.map(repliquesDeux.nombre), ...assiettes.map(n => repliquesDeux.resultat('double', n)), ...assiettes.map(n => repliquesDeux.resultat('moitie', n)), ...Object.keys(ERREURS_DEUX).map(repliquesDeux.erreur)]
  });

  // La pêche aux sons : une consigne par son, le nom de chaque image, et
  // les erreurs nommées.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [...peche.SONS.map(x => repliquesPeche.consigne(x.cle)), ...peche.MOTS.map(x => repliquesPeche.nom(x.cle)), repliquesPeche.intrus(1), repliquesPeche.intrus(2), repliquesPeche.manque, repliquesPeche.aide]
  });

  // L'atelier des syllabes : la consigne, chaque mot entier, et les erreurs.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesSyllabes.consigne, ...syllabes.MOTS.map(x => repliquesSyllabes.mot(x.cle)), ...syllabes.toutesLesSyllabes().map(repliquesSyllabes.son), repliquesSyllabes.sonsOuverts, repliquesSyllabes.faux(1), repliquesSyllabes.faux(2), repliquesSyllabes.ordre, repliquesSyllabes.aide]
  });

  // Les mots éclair : la consigne, chaque mot outil, et les deux remarques.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesEclair.consigne, ...eclair.MOTS.map(x => repliquesEclair.mot(x.mot)), repliquesEclair.erreur, repliquesEclair.aide]
  });

  // Le coffre des centaines : chaque nombre à construire, la consigne de
  // lecture, et une remarque par colonne et par sens.
  parJeu.push({
    matiere: 'MATHS',
    repliques: [...coffre.NOMBRES.map(repliquesCoffre.construire), ...coffre.NOMBRES_CE2.map(repliquesCoffre.construire), repliquesCoffre.consigneLire, ...coffre.COLONNES_CE2.flatMap(c => ['plus', 'moins', 'relire'].map(sens => repliquesCoffre.erreur(sens, c.cle))), repliquesCoffre.aide, repliquesCoffre.aideCE2]
  });

  // La course des tables : chaque calcul des tables de 2 à 5, chaque jumelle
  // (nombres échangés), la méthode de chaque table, et le rappel de la règle.
  const faitsCourse = course.TABLES_CE2.flatMap(a => [2, 3, 4, 5, 6, 7, 8, 9, 10].map(b => [a, b]));
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesCourse.consigne, ...faitsCourse.map(([a, b]) => repliquesCourse.question(a, b)), ...faitsCourse.filter(([a, b]) => a !== b).map(([a, b]) => repliquesCourse.jumelle(b, a)), ...course.TABLES_CE2.map(t => repliquesCourse.methode(t, t)), repliquesCourse.rappelJumelle]
  });

  // Les parts de pizza : une consigne par temps, et chaque piège nommé.
  parJeu.push({
    matiere: 'MATHS',
    repliques: [...['lire', 'comparer', 'additionner', 'egaler'].map(repliquesPizza.consigne), ...Object.keys(pizza.ERREURS).map(repliquesPizza.erreur), repliquesPizza.aide]
  });

  // La machine à dix : une consigne par sens, et chaque piège nommé.
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesMachine.consigne('sortie'), repliquesMachine.consigne('entree'), repliquesMachine.consigne('sortie', 100), repliquesMachine.consigne('entree', 100), ...Object.keys(machine.ERREURS).map(repliquesMachine.erreur), repliquesMachine.aide(10), repliquesMachine.aide(100)]
  });

  // a ou à ? et ou est ? : les deux consignes et les quatre méthodes.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesAOuA.consigne(aOuA.PHRASES_A[0]), repliquesAOuA.consigne(aOuA.PHRASES_ET[0]), repliquesAOuA.consigne(aOuA.PHRASES_SON[0]), repliquesAOuA.consigne(aOuA.PHRASES_ON[0]), ...['a', 'à', 'et', 'est', 'son', 'sont', 'on', 'ont'].map(repliquesAOuA.methode)]
  });

  // Raconte, question ou ordre ? : la consigne et un indice par type.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesTypes.consigne, ...types.TYPES.map(t => repliquesTypes.indice(t.cle))]
  });

  // Contraires et jumeaux : chaque question possible, et les trois remarques.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [...cj.MOTS.flatMap(t => ['contraire', 'jumeau'].map(demande => repliquesContraires.question({
      mot: t.mot,
      demande
    }))), repliquesContraires.erreur({
      demande: 'contraire'
    }, 'piege'), repliquesContraires.erreur({
      demande: 'jumeau'
    }, 'piege'), repliquesContraires.erreur({
      demande: 'jumeau'
    }, 'sans-lien'), ...cj.FAMILLES.map(f => repliquesContraires.question({
      mot: f.mot,
      demande: 'famille'
    })), repliquesContraires.erreur({
      demande: 'famille'
    }, 'sosie')]
  });

  // La roue des verbes : la consigne, la terminaison de chaque personne, et
  // les deux verbes qui ne suivent pas la règle.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesRoue.consigne, ...[0, 1, 2, 3, 4, 5].map(k => repliquesRoue.regle(`personne-${k}`)), repliquesRoue.regle('être'), repliquesRoue.regle('avoir'), repliquesRoue.consigneCE2, ...['imparfait', 'futur'].flatMap(t => [...[0, 1, 2, 3, 4, 5].map(k => repliquesRoue.regle(`${t}-${k}`)), repliquesRoue.regle(`être-${t}`), repliquesRoue.regle(`avoir-${t}`)])]
  });

  // Le détective du verbe : les consignes, une question « Qui est-ce qui ? »
  // par phrase, et les deux remarques.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesDetective.consigneVerbe, ...detective.PHRASES_JEU.map(repliquesDetective.sujet), repliquesDetective.erreurVerbe, repliquesDetective.erreurSujet, ...detective.CLASSES.map(repliquesDetective.consigneClasse), ...[...detective.CLASSES, 'autre'].map(repliquesDetective.estUn), ...detective.CLASSES.map(repliquesDetective.definition)]
  });

  // La phrase qui dit non : la consigne, les quatre remarques, l'aide, et
  // chaque phrase négative dite en entier.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesNegation.consigne, ...['place-ne', 'place-pas', 'elision', 'pas-elision'].map(repliquesNegation.erreur), repliquesNegation.aide, ...negation.PHRASES_JEU.map((_, i) => repliquesNegation.phrase(i)), ...negation.FORMES.map(repliquesNegation.consigneCE2), ...['sans-ne', 'place', 'point-question', 'ordre', 'point-exclamation', 'pas-exclamation'].map(repliquesNegation.erreurCE2)]
  });

  // Féminin et pluriel (CE2) : chaque groupe, chaque règle, l'aide.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [...accords.GROUPES.map((_, i) => repliquesAccords.consigne(i)), ...Object.keys(accords.REGLES).map(repliquesAccords.regle), repliquesAccords.aide]
  });

  // Les nouveaux jeux du CE2 : leurs consignes et leurs remarques nommées.
  parJeu.push({
    matiere: 'MATHS',
    repliques: [repliquesRuban.consigne, ...['m-cm', 'cm-mm', 'km-m', 'composee'].map(repliquesRuban.erreur), repliquesJardin.consigne, ...['cotes-caches', 'oubli', 'produit', 'double'].map(repliquesJardin.erreur), repliquesDuree.consigne, ...['naif', 'cent'].map(repliquesDuree.erreur), ...['convertir', 'comparer', 'remplir'].map(repliquesBouteilles.consigne), ...['litre', 'compose', 'nombre', 'verres'].map(repliquesBouteilles.erreur), repliquesMiroir.consigne('axe'), repliquesMiroir.consigne('angle'), repliquesMiroir.erreur('axe'), repliquesMiroir.erreur('angle'), repliquesDiagramme.consigne, ...['lire', 'plus', 'difference', 'total'].map(repliquesDiagramme.erreur), repliquesPartage.consigne, ...['soustraction', 'reste', 'partage'].map(repliquesPartage.erreur)]
  });
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesComplements.consigne, ...['ou', 'quand', 'comment'].map(repliquesComplements.indice), repliquesSujetEloigne.consigne, ...['proche', 'autre'].map(repliquesSujetEloigne.erreur)]
  });

  // Les jeux simples : toutes les phrases de chaque module.
  SIMPLES.forEach(([prefixe, module, matiere]) => {
    parJeu.push({
      matiere,
      repliques: Object.keys(module.PHRASES).map(phrasesDe(prefixe, module))
    });
  });

  // Un ou des ? : la consigne et les remarques, jamais l'étiquette.
  parJeu.push({
    matiere: 'FRANCAIS',
    repliques: [repliquesUnOuDes.consigne, repliquesUnOuDes.nombre(false), repliquesUnOuDes.nombre(true), repliquesUnOuDes.accord(false), repliquesUnOuDes.accord(true), repliquesUnOuDes.aide, repliquesUnOuDes.pareil, ...['un', 'une', 'des', ...unOuDes.NOMS.map(n => n.nom)].map(repliquesUnOuDes.mot)]
  });

  // Rangées par professeur, avec les phrases communes pour chacun.
  const communes = [...[0, 1, 2].map(commun.bravo), ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => commun.note(n)), ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => commun.note(n, 9)), ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => commun.note(n, 10))];
  const parProfesseur = {};
  parJeu.forEach(({
    matiere,
    repliques
  }) => {
    const professeur = PROFESSEUR_PAR_MATIERE[matiere];
    if (!professeur) return;
    if (!parProfesseur[professeur]) parProfesseur[professeur] = [...communes];
    parProfesseur[professeur].push(...repliques);
  });
  return parProfesseur;
}