const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JEUX = void 0;
exports.jeuxDeLaClasse = jeuxDeLaClasse;
exports.parMatiere = parMatiere;
exports.selonLaClasse = selonLaClasse;
const couvertureBalance = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/balance800.webp';
const couvertureBoiteDeDix = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/cov_boite_de_10.webp';
const couvertureChantier = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/chantier800.webp';
const couvertureDeux = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/2par2800.webp';
const couverturePeche = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/son800.webp';
const couvertureSyllabes = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/syllabe800.webp';
const couvertureEclair = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/mot_eclaire800.webp';
const couvertureUnOuDes = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/unoudes800.webp';
const couvertureHorloge = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/horloge800.webp';
const couvertureCoffre = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/coffre800.webp';
const couvertureCourse = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/course800.webp';
const couverturePizza = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/pizza800.webp';
const couvertureMachine = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/machine10800.webp';
const couvertureAOuA = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/aoua800.webp';
const couvertureDetective = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/detective800.webp';
const couvertureRoue = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/roue800.webp';
const couvertureRaconte = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/raconte800.webp';
const couvertureNon = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/non800.webp';
const couvertureContraires = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE1/contraire800.webp';
const couvertureBonbons = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/bonbon800.webp';
const couvertureRuban = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/ruban800.webp';
const couvertureJardin = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/jardin800.webp';
const couvertureTemps = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/temps800.webp';
const couvertureBouteilles = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/bouteille800.webp';
const couvertureMiroir = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/miroir800.webp';
const couvertureDiagramme = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/diagramme800.webp';
const couvertureFeminin = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/feminin800.webp';
const couvertureSonOuSont = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/sonouson800.webp';
const couvertureTransforme = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/transforme800.webp';
const couvertureOuQuandComment = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/ou800.webp';
const couvertureSujet = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CE2/eloigne800.webp';
const couvertureCm1AdjectifEloigne = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/adeloigne800.webp';
const couvertureCm1CeSe = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/ce800.webp';
const couvertureCm1QuatreTemps = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/4temps800.webp';
const couvertureCm1TypesFormes = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/type800.webp';
const couvertureCm1Prefixes = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/prefixe800.webp';
const couvertureCm1Cod = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/cod800.webp';
const couvertureCm1PasseCompose = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/passe800.webp';
const couvertureCm1GrandsNombres = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/nombre800.webp';
const couvertureCm1CalculMalin = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/malin800.webp';
const couvertureCm1Fractions = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/fraction800.webp';
const couvertureCm1Contenances = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/contenance800.webp';
const couvertureCm1Aire = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/airjardin800.webp';
const couvertureCm1Durees = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/minute800.webp';
const couvertureCm1Angles = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/angle800.webp';
const couvertureCm1Tableau = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/marche800.webp';
const couvertureCm1Pronom = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/pronom800.webp';
const couvertureCm1Image = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/image800.webp';
const couvertureCm1Genres = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/theatre800.webp';
const couvertureCm1Liaison = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/liaison800.webp';
const couvertureCm1Dixiemes = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/regle800.webp';
const couvertureCm1Recette = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/recette800.webp';
const couvertureCm1Mystere = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/mystere800.webp';
const couvertureCm1Suite = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/suite800.webp';
const couvertureCm1Billes = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/sac800.webp';
const couvertureCm1Robot = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/robot800.webp';
const couvertureCm1Crible = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CM1/crible800.webp';
const couvertureMarchande = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/cov_marchande.webp';
const couverturePaquets = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/paquet_10.webp';
const couvertureTrain = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/train_des_nombres.webp';

/**
 * LA LUDOTHÈQUE DE MIMIA.
 *
 * Voulue par Camara le 20/09/2026. Un jeu n'est PAS visible parce qu'il
 * existe : il l'est parce qu'il correspond à la classe de l'enfant. Un CM2 ne
 * doit jamais tomber sur un jeu de CP — la honte de se voir proposer « pour
 * les petits » ferait refermer la page pour de bon.
 *
 * CHAQUE JEU DÉCLARE SES COMPÉTENCES, et ce sont celles du référentiel, mot
 * pour mot. Ce n'est pas de la décoration : c'est ce qui permettra plus tard
 * de recommander un jeu d'après ce que le professeur a VU bloquer, plutôt que
 * d'après une intuition. Les codes sont vérifiables dans
 * `ReferentielMaths.cs` et `ReferentielFrancais.cs`.
 *
 * LE CATALOGUE EST UNE DONNÉE, PAS UNE GÉNÉRATION. Rien ici n'est produit par
 * un modèle au moment de jouer : les jeux tournent sans le moindre appel, donc
 * sans le moindre jeton, et leur contenu a été relu une fois pour toutes.
 * C'est la même règle que les référentiels, et pour la même raison — un
 * contenu pédagogique que personne ne relit finit par être faux.
 */

/**
 * L'ILLUSTRATION D'UN JEU, OPTIONNELLE — Camara, le 21/09/2026.
 *
 * Déposer une image dans `src/assets`, l'importer en haut de ce fichier, et
 * la nommer dans `image` : la carte s'habille toute seule. Sans image, elle
 * garde son aperçu dessiné, qui reste net et ne pèse rien.
 *
 * FORMAT : 800 × 800 px, sans aucun texte dedans, le sujet dans la moitié
 * haute — le bas de la carte est assombri pour que le titre reste lisible.
 * Le fichier est converti en WebP avant d'entrer ici.
 */
const JEUX = exports.JEUX = [{
  cle: 'boite-de-dix',
  titre: 'La boîte de 10',
  accroche: 'Complète la boîte pour arriver à dix.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP'],
  competences: ['MATH_CP_CALC_COMPLEMENT', 'MATH_CP_CALC_ADD_10'],
  image: couvertureBoiteDeDix,
  // SA COUVERTURE PORTE DÉJÀ LE TITRE, peint sur l'enseigne de la ferme.
  // La carte ne le réécrit donc pas par-dessus — mais elle le GARDE pour
  // les lecteurs d'écran, qui ne voient pas ce qui est dessiné.
  titreDansImage: true
}, {
  cle: 'marchande',
  titre: 'La marchande',
  accroche: 'Paie la somme exacte au marché.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP', 'CE1', 'CE2'],
  competences: ['MATH_CP_MES_MONNAIE', 'MATH_CP_PROB_UNE_ETAPE'],
  // Au CE1, l'enfant tient la caisse : voir `Caisse.js`.
  parNiveau: {
    CE1: {
      competences: ['MATH_CE1_MES_MONNAIE'],
      accroche: 'Calcule le prix et rends la monnaie.'
    },
    CE2: {
      competences: ['MATH_CE2_MES_MONNAIE'],
      accroche: 'Lis le prix à virgule, et paie juste.'
    }
  },
  image: couvertureMarchande,
  titreDansImage: true
}, {
  cle: 'train-des-nombres',
  titre: 'Le train des nombres',
  accroche: 'Accroche le wagon au bon arrêt.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP'],
  competences: ['MATH_CP_NUM_DEMI_DROITE', 'MATH_CP_NUM_SIGNES', 'MATH_CP_NUM_100'],
  image: couvertureTrain,
  titreDansImage: true
}, {
  cle: 'paquets-de-dix',
  titre: 'Les paquets de dix',
  accroche: 'Prépare le bon nombre de bûchettes, en paquets de dix.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP'],
  competences: ['MATH_CP_NUM_DECOMPOSER'],
  image: couverturePaquets,
  titreDansImage: true
}, {
  cle: 'chantier-des-formes',
  titre: 'Le chantier des formes',
  accroche: 'Trouve toutes les pièces de la bonne forme.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP'],
  competences: ['MATH_CP_GEO_FIGURES'],
  image: couvertureChantier,
  titreDansImage: true
}, {
  cle: 'horloge',
  titre: 'L’horloge',
  accroche: 'Lis l’heure, puis règle les aiguilles.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP', 'CE1'],
  competences: ['MATH_CP_MES_TEMPS'],
  // Au CE1, la demi-heure : voir `horloge.js`.
  parNiveau: {
    CE1: {
      competences: ['MATH_CE1_MES_HEURE'],
      accroche: 'Lis l’heure et la demi-heure.'
    }
  },
  image: couvertureHorloge,
  titreDansImage: true
}, {
  cle: 'balance',
  titre: 'La balance',
  accroche: 'Compare et pèse les objets.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP', 'CE1', 'CE2'],
  competences: ['MATH_CP_MES_MASSE'],
  // Au CE1, la boîte de poids en grammes : voir `balance.js`.
  parNiveau: {
    CE1: {
      competences: ['MATH_CE1_MES_MASSE'],
      accroche: 'Range, puis pèse en grammes.'
    },
    CE2: {
      competences: ['MATH_CE2_MES_MASSE'],
      accroche: 'Pèse en grammes et en kilogrammes.'
    }
  },
  image: couvertureBalance,
  titreDansImage: true
}, {
  cle: 'deux-par-deux',
  titre: 'Deux par deux',
  accroche: 'Trouve le double, puis partage en deux.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CP'],
  competences: ['MATH_CP_CALC_DOUBLE'],
  image: couvertureDeux,
  titreDansImage: true
}, {
  cle: 'peche-aux-sons',
  titre: 'La pêche aux sons',
  accroche: 'Pêche les images où tu entends le son.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CP'],
  competences: ['FR_CP_LECT_GRAPHEMES'],
  image: couverturePeche,
  titreDansImage: true
}, {
  cle: 'atelier-syllabes',
  titre: 'L’atelier des syllabes',
  accroche: 'Écoute le mot, et range ses syllabes dans les wagons.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CP'],
  competences: ['FR_CP_LECT_SYLLABES'],
  image: couvertureSyllabes,
  titreDansImage: true
}, {
  cle: 'mots-eclair',
  titre: 'Les mots éclair',
  accroche: 'Un mot passe très vite : retrouve-le !',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CP'],
  competences: ['FR_CP_LECT_MOTS_OUTILS'],
  image: couvertureEclair,
  titreDansImage: true
}, {
  cle: 'un-ou-des',
  titre: 'Un ou des ?',
  accroche: 'Un seul, ou plusieurs ? N’oublie pas le s.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CP', 'CE2', 'CM1', 'CM2'],
  competences: ['FR_CP_LANG_PLURIEL'],
  parNiveau: {
    CM2: {
      titre: 'L’attribut du sujet',
      competences: ['FR_CM2_LANG_ATTRIBUT'],
      accroche: 'Elles semblent fatiguées.'
    },
    CM1: {
      image: couvertureCm1AdjectifEloigne,
      titreDansImage: true,
      titre: 'L’adjectif s’éloigne',
      competences: ['FR_CM1_LANG_GN_ELOIGNE'],
      accroche: 'Accorde avec le bon nom.'
    },
    CE2: {
      image: couvertureFeminin,
      titreDansImage: true,
      titre: 'Féminin et pluriel',
      competences: ['FR_CE2_LANG_FEMININ'],
      accroche: 'Chevaux, chatte, boulangère : accorde le groupe.'
    }
  },
  image: couvertureUnOuDes,
  titreDansImage: true
},
// ------------------------------------------------------------ le CE1

{
  cle: 'coffre-des-centaines',
  titre: 'Le coffre des centaines',
  accroche: 'Range les centaines, les dizaines et les unités.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE1_NUM_DECOMPOSER', 'MATH_CE1_NUM_1000'],
  parNiveau: {
    CM2: {
      titre: 'Les grands nombres',
      competences: ['MATH_CM2_NUM_ENTIERS'],
      accroche: 'Lis, écris, compare.'
    },
    CM1: {
      image: couvertureCm1GrandsNombres,
      titreDansImage: true,
      titre: 'Les grands nombres',
      competences: ['MATH_CM1_NUM_MILLIONS'],
      accroche: 'Lis et écris les millions.'
    },
    CE2: {
      competences: ['MATH_CE2_NUM_10000'],
      accroche: 'Range les milliers, centaines, dizaines et unités.'
    }
  },
  image: couvertureCoffre,
  titreDansImage: true
}, {
  cle: 'course-des-tables',
  titre: 'La course des tables',
  accroche: 'Chaque bonne réponse fait avancer ta voiture.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE1_TABLES_BASE', 'MATH_CE1_MULT_COMMUTATIVE'],
  parNiveau: {
    CM2: {
      titre: 'Les opérations posées',
      competences: ['MATH_CM2_CALC_ADD_SOUS', 'MATH_CM2_CALC_MULT', 'MATH_CM2_CALC_DIV'],
      accroche: 'Soustraction, multiplication, division.'
    },
    CM1: {
      image: couvertureCm1CalculMalin,
      titreDansImage: true,
      titre: 'Le calcul malin',
      competences: ['MATH_CM1_CALC_MENTAL'],
      accroche: 'Fois 9, fois 25, fois 50 : trouve la ruse.'
    },
    CE2: {
      competences: ['MATH_CE2_TABLES'],
      accroche: 'Toutes les tables, jusqu’à 9 × 10.'
    }
  },
  image: couvertureCourse,
  titreDansImage: true
}, {
  cle: 'parts-de-pizza',
  titre: 'Les parts de pizza',
  accroche: 'Lis, compare et additionne les fractions.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE1_FRAC_SENS', 'MATH_CE1_FRAC_COMPARER', 'MATH_CE1_FRAC_ADD'],
  parNiveau: {
    CM2: {
      titre: 'Les fractions décimales',
      competences: ['MATH_CM2_FRAC_INTRO', 'MATH_CM2_FRAC_DECIMALES'],
      accroche: 'Dixièmes et centièmes.'
    },
    CM1: {
      image: couvertureCm1Fractions,
      titreDansImage: true,
      titre: 'Les fractions',
      competences: ['MATH_CM1_FRAC_SENS', 'MATH_CM1_FRAC_SUP_UN', 'MATH_CM1_FRAC_OPERATEUR', 'MATH_CM1_DEC_FRACTIONS'],
      accroche: 'Décompose, partage, écris à virgule.'
    },
    CE2: {
      competences: ['MATH_CE2_FRAC_SUP_UN', 'MATH_CE2_FRAC_EGALITES', 'MATH_CE2_FRAC_ADD'],
      accroche: 'Plus d’une pizza, et des parts égales.'
    }
  },
  image: couverturePizza,
  titreDansImage: true
}, {
  cle: 'machine-a-dix',
  titre: 'La machine à dix',
  accroche: 'La machine multiplie par dix : que sort-il ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE1', 'CE2'],
  competences: ['MATH_CE1_MULT_DIX'],
  parNiveau: {
    CE2: {
      competences: ['MATH_CE2_MULT_DIX_CENT'],
      accroche: 'Fois dix, ou fois cent : que sort-il ?'
    }
  },
  image: couvertureMachine,
  titreDansImage: true
}, {
  cle: 'a-ou-a',
  titre: 'a ou à ? et ou est ?',
  accroche: 'Choisis le bon mot pour compléter la phrase.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
  competences: ['FR_CE1_LANG_A_ET'],
  parNiveau: {
    CM2: {
      titre: 'Ou, où, leur, quel',
      competences: ['FR_CM2_LANG_HOMOPHONES'],
      accroche: 'Des mots qui sonnent pareil.'
    },
    CM1: {
      image: couvertureCm1CeSe,
      titreDansImage: true,
      titre: 'Ce, se, ces, ses, la, là',
      competences: ['FR_CM1_LANG_CE_SE'],
      accroche: 'Des mots qui sonnent pareil.'
    },
    CE2: {
      image: couvertureSonOuSont,
      titreDansImage: true,
      titre: 'son ou sont ? on ou ont ?',
      competences: ['FR_CE2_LANG_SON_ONT']
    }
  },
  image: couvertureAOuA,
  titreDansImage: true
}, {
  cle: 'detective-du-verbe',
  titre: 'Le détective du verbe',
  accroche: 'Trouve le verbe, puis son sujet.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE1', 'CE2'],
  competences: ['FR_CE1_LANG_VERBE_SUJET'],
  parNiveau: {
    CE2: {
      competences: ['FR_CE2_LANG_CLASSES'],
      accroche: 'Nom, verbe, déterminant, adjectif ou pronom ?'
    }
  },
  image: couvertureDetective,
  titreDansImage: true
}, {
  cle: 'roue-des-verbes',
  titre: 'La roue des verbes',
  accroche: 'Conjugue le verbe au présent.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
  competences: ['FR_CE1_LANG_PRESENT'],
  parNiveau: {
    CM2: {
      titre: 'Les temps composés',
      competences: ['FR_CM2_LANG_TEMPS_COMPOSES'],
      accroche: 'Passé composé, plus-que-parfait, conditionnel.'
    },
    CM1: {
      image: couvertureCm1QuatreTemps,
      titreDansImage: true,
      titre: 'Les quatre temps',
      competences: ['FR_CM1_LANG_TEMPS_SIMPLES'],
      accroche: 'Présent, imparfait, futur, passé simple.'
    },
    CE2: {
      competences: ['FR_CE2_LANG_TROIS_TEMPS'],
      accroche: 'Présent, imparfait ou futur ?'
    }
  },
  image: couvertureRoue,
  titreDansImage: true
}, {
  cle: 'types-de-phrases',
  titre: 'Raconte, question ou ordre ?',
  accroche: 'Reconnais les trois sortes de phrases.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE1'],
  competences: ['FR_CE1_LANG_TYPES'],
  image: couvertureRaconte,
  titreDansImage: true
}, {
  cle: 'phrase-qui-dit-non',
  titre: 'La phrase qui dit non',
  accroche: 'Pose « ne » et « pas » autour du verbe.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
  competences: ['FR_CE1_LANG_NEGATION'],
  parNiveau: {
    CM2: {
      titre: 'Simple ou complexe ?',
      competences: ['FR_CM2_LANG_TYPES', 'FR_CM2_LANG_SIMPLE_COMPLEXE'],
      accroche: 'Compte les verbes conjugués.'
    },
    CM1: {
      image: couvertureCm1TypesFormes,
      titreDansImage: true,
      titre: 'Types et formes',
      competences: ['FR_CM1_LANG_TYPES', 'FR_CM1_LANG_FORMES'],
      accroche: 'Interrogative ? Négative ? Exclamative ?'
    },
    CE2: {
      image: couvertureTransforme,
      titreDansImage: true,
      titre: 'Transforme la phrase',
      competences: ['FR_CE2_LANG_FORMES'],
      accroche: 'Négative, question ou exclamation ?'
    }
  },
  image: couvertureNon,
  titreDansImage: true
}, {
  cle: 'contraires-et-jumeaux',
  titre: 'Contraires et jumeaux',
  accroche: 'Trouve le contraire, ou le mot jumeau.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE1', 'CE2', 'CM1', 'CM2'],
  competences: ['FR_CE1_LANG_VOC_RELATIONS'],
  parNiveau: {
    CM2: {
      titre: 'Sens et niveaux de langue',
      competences: ['FR_CM2_LANG_VOC_SYNONYMES', 'FR_CM2_LANG_SENS'],
      accroche: 'Souris, bagnole, avare.'
    },
    CM1: {
      image: couvertureCm1Prefixes,
      titreDansImage: true,
      titre: 'Préfixes et synonymes',
      competences: ['FR_CM1_LANG_FAMILLES', 'FR_CM1_LANG_VOC_SYNONYMES'],
      accroche: 'Impossible, lentement, joyeux.'
    },
    CE2: {
      competences: ['FR_CE2_LANG_VOC_RELATIONS'],
      accroche: 'Contraires, jumeaux et familles de mots.'
    }
  },
  image: couvertureContraires,
  titreDansImage: true
},
// ------------------------------------------------------------ le CE2

{
  cle: 'partage-des-bonbons',
  titre: 'Le partage des bonbons',
  accroche: 'Partage équitablement : combien chacun ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE2'],
  competences: ['MATH_CE2_DIV_SENS'],
  image: couvertureBonbons,
  titreDansImage: true
}, {
  cle: 'metre-ruban',
  titre: 'Le mètre ruban',
  accroche: 'Mètres, centimètres, millimètres : convertis.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE2_MES_CONVERSION'],
  parNiveau: {
    CM2: {
      titre: 'Les longueurs',
      competences: ['MATH_CM2_MES_LONGUEUR'],
      accroche: 'Du kilomètre au millimètre.'
    },
    CM1: {
      image: couvertureCm1Contenances,
      titreDansImage: true,
      titre: 'Masses et contenances',
      competences: ['MATH_CM1_MES_CONVERSION', 'MATH_CM1_MES_CONTENANCE'],
      accroche: 'Des kilos aux grammes, des litres aux millilitres.'
    }
  },
  image: couvertureRuban,
  titreDansImage: true
}, {
  cle: 'tour-du-jardin',
  titre: 'Le tour du jardin',
  accroche: 'Combien de clôture pour en faire le tour ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE2_MES_PERIMETRE'],
  parNiveau: {
    CM2: {
      titre: 'L’aire du rectangle',
      competences: ['MATH_CM2_MES_AIRE'],
      accroche: 'Longueur fois largeur.'
    },
    CM1: {
      image: couvertureCm1Aire,
      titreDansImage: true,
      titre: 'L’aire du jardin',
      competences: ['MATH_CM1_MES_AIRE'],
      accroche: 'Compte les carreaux qui le couvrent.'
    }
  },
  image: couvertureJardin,
  titreDansImage: true
}, {
  cle: 'combien-de-temps',
  titre: 'Combien de temps ?',
  accroche: 'De quelle heure à quelle heure : combien de temps ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE2_MES_DUREE'],
  parNiveau: {
    CM2: {
      titre: 'Problèmes de durée',
      competences: ['MATH_CM2_MES_DUREE'],
      accroche: 'Remonte le temps.'
    },
    CM1: {
      image: couvertureCm1Durees,
      titreDansImage: true,
      titre: 'Heures, minutes, secondes',
      competences: ['MATH_CM1_MES_DUREE'],
      accroche: 'À quelle heure arrive-t-on ?'
    }
  },
  image: couvertureTemps,
  titreDansImage: true
}, {
  cle: 'les-bouteilles',
  titre: 'Les bouteilles',
  accroche: 'Litres et centilitres : laquelle contient le plus ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE2'],
  competences: ['MATH_CE2_MES_CONTENANCE'],
  image: couvertureBouteilles,
  titreDansImage: true
}, {
  cle: 'le-miroir',
  titre: 'Le miroir',
  accroche: 'Trouve l’axe de symétrie, puis l’angle droit.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE2_GEO_SYMETRIE', 'MATH_CE2_GEO_ANGLE_DROIT'],
  parNiveau: {
    CM2: {
      titre: 'Angles et figures',
      competences: ['MATH_CM2_MES_ANGLE', 'MATH_CM2_GEO_FIGURES', 'MATH_CM2_GEO_PERPENDICULAIRE', 'MATH_CM2_GEO_SYMETRIE'],
      accroche: 'Mesure, nomme, reflète.'
    },
    CM1: {
      image: couvertureCm1Angles,
      titreDansImage: true,
      titre: 'Angles, droites et miroir',
      competences: ['MATH_CM1_MES_ANGLE', 'MATH_CM1_GEO_PERPENDICULAIRE', 'MATH_CM1_GEO_SYMETRIE'],
      accroche: 'Aigu ou obtus, perpendiculaires ou parallèles.'
    }
  },
  image: couvertureMiroir,
  titreDansImage: true
}, {
  cle: 'le-diagramme',
  titre: 'Le diagramme',
  accroche: 'Lis le diagramme en barres.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CE2', 'CM1', 'CM2'],
  competences: ['MATH_CE2_DATA_DIAGRAMME'],
  parNiveau: {
    CM2: {
      titre: 'Tableaux et diagrammes',
      competences: ['MATH_CM2_DATA_TABLEAU', 'MATH_CM2_DATA_DIAGRAMME'],
      accroche: 'Trouve le bon diagramme.'
    },
    CM1: {
      image: couvertureCm1Tableau,
      titreDansImage: true,
      titre: 'Le tableau du marché',
      competences: ['MATH_CM1_DATA_TABLEAU'],
      accroche: 'Lis un tableau à double entrée.'
    }
  },
  image: couvertureDiagramme,
  titreDansImage: true
}, {
  cle: 'ou-quand-comment',
  titre: 'Où, quand, comment ?',
  accroche: 'À quelle question répond le groupe ?',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE2', 'CM1', 'CM2'],
  competences: ['FR_CE2_LANG_COMPLEMENTS'],
  parNiveau: {
    CM2: {
      titre: 'Complément du verbe ou de phrase',
      competences: ['FR_CM2_LANG_COMPL_PHRASE'],
      accroche: 'Déplace-le, enlève-le.'
    },
    CM1: {
      image: couvertureCm1Cod,
      titreDansImage: true,
      titre: 'COD ou COI ?',
      competences: ['FR_CM1_LANG_COD_COI'],
      accroche: 'Trouve la fonction du groupe.'
    }
  },
  image: couvertureOuQuandComment,
  titreDansImage: true
}, {
  cle: 'sujet-qui-s-eloigne',
  titre: 'Le sujet qui s’éloigne',
  accroche: 'Accorde le verbe avec son vrai sujet.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CE2', 'CM1', 'CM2'],
  competences: ['FR_CE2_LANG_ACCORD_SV'],
  parNiveau: {
    CM2: {
      titre: 'Le participe avec avoir',
      competences: ['FR_CM2_LANG_PP_AVOIR'],
      accroche: 'Les pommes que j’ai cueillies.'
    },
    CM1: {
      image: couvertureCm1PasseCompose,
      titreDansImage: true,
      titre: 'Le passé composé avec être',
      competences: ['FR_CM1_LANG_PASSE_COMPOSE'],
      accroche: 'Elles sont parties : accorde le participe.'
    }
  },
  image: couvertureSujet,
  titreDansImage: true
}, {
  cle: 'regle-des-dixiemes',
  titre: 'La règle des dixièmes',
  accroche: 'La virgule, au bon endroit.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CM1', 'CM2'],
  competences: ['MATH_CM1_NUM_DECIMAUX'],
  parNiveau: {
    CM2: {
      titre: 'La loupe des centièmes',
      competences: ['MATH_CM2_NUM_DECIMAUX'],
      accroche: 'Le zéro qui compte.'
    }
  },
  image: couvertureCm1Dixiemes,
  titreDansImage: true
}, {
  cle: 'recette-pour-8',
  titre: 'La recette pour 8',
  accroche: 'Deux fois plus d’invités, deux fois plus de tout ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CM1', 'CM2'],
  competences: ['MATH_CM1_PROP_IDENTIFIER', 'MATH_CM1_PROP_RESOUDRE'],
  parNiveau: {
    CM2: {
      titre: 'Prix, vitesse, tableau',
      competences: ['MATH_CM2_PROP_RESOUDRE'],
      accroche: 'Passe par un seul.'
    }
  },
  image: couvertureCm1Recette,
  titreDansImage: true
}, {
  cle: 'boite-mystere',
  titre: 'La boîte mystère',
  accroche: 'Quel nombre se cache dans la boîte ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CM1', 'CM2'],
  competences: ['MATH_CM1_ALG_INCONNUE'],
  parNiveau: {
    CM2: {
      titre: 'Le schéma en barres',
      competences: ['MATH_CM2_ALG_EGALITE', 'MATH_CM2_ALG_INCONNUE', 'MATH_CM2_ALG_SCHEMA'],
      accroche: 'Le signe égal est une balance.'
    }
  },
  image: couvertureCm1Mystere,
  titreDansImage: true
}, {
  cle: 'suite-qui-continue',
  titre: 'La suite qui continue',
  accroche: 'Trouve ce qui vient après.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CM1'],
  competences: ['MATH_CM1_ALG_MOTIFS'],
  image: couvertureCm1Suite,
  titreDansImage: true
}, {
  cle: 'sac-de-billes',
  titre: 'Le sac de billes',
  accroche: 'Impossible, possible ou certain ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CM1', 'CM2'],
  competences: ['MATH_CM1_PROBA_ALEATOIRE', 'MATH_CM1_PROBA_VOCABULAIRE'],
  parNiveau: {
    CM2: {
      titre: 'Deux sacs, les mêmes chances ?',
      competences: ['MATH_CM2_PROBA_COMPARER', 'MATH_CM2_PROBA_EQUI'],
      accroche: 'Compare les chances.'
    }
  },
  image: couvertureCm1Billes,
  titreDansImage: true
}, {
  cle: 'le-robot',
  titre: 'Le robot',
  accroche: 'Programme son chemin jusqu’à l’étoile.',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CM1', 'CM2'],
  competences: ['MATH_CM1_ALGO_DEPLACEMENT'],
  parNiveau: {
    CM2: {
      titre: 'La boucle du robot',
      competences: ['MATH_CM2_ALGO_PROGRAMME', 'MATH_CM2_GEO_DEPLACEMENT'],
      accroche: 'Répète le motif.'
    }
  },
  image: couvertureCm1Robot,
  titreDansImage: true
}, {
  cle: 'le-crible',
  titre: 'Le crible',
  accroche: 'Multiple de 2, de 5, de 10 ?',
  matiere: 'Mathématiques',
  matiereCode: 'MATHS',
  niveaux: ['CM1'],
  competences: ['MATH_CM1_NUM_MULTIPLES'],
  image: couvertureCm1Crible,
  titreDansImage: true
}, {
  cle: 'a-qui-le-pronom',
  titre: 'À qui renvoie le pronom ?',
  accroche: 'Il, elle, le vieux marin : qui est-ce ?',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CM1'],
  competences: ['FR_CM1_LECT_REPRISES'],
  image: couvertureCm1Pronom,
  titreDansImage: true
}, {
  cle: 'comme-une-image',
  titre: 'Comme une image',
  accroche: 'Que veut dire le poète ?',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CM1', 'CM2'],
  competences: ['FR_CM1_LECT_POESIE'],
  parNiveau: {
    CM2: {
      titre: 'Sens propre, sens figuré',
      competences: ['FR_CM2_LANG_SENS'],
      accroche: 'Tomber dans les pommes.'
    }
  },
  image: couvertureCm1Image,
  titreDansImage: true
}, {
  cle: 'poeme-theatre-recit',
  titre: 'Poème, théâtre ou récit ?',
  accroche: 'Reconnais le genre du texte.',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CM1', 'CM2'],
  competences: ['FR_CM1_LECT_GENRES'],
  parNiveau: {
    CM2: {
      titre: 'Qui raconte ?',
      competences: ['FR_CM2_LECT_NARRATEUR'],
      accroche: 'Un personnage, ou un narrateur ?'
    }
  },
  image: couvertureCm1Genres,
  titreDansImage: true
}, {
  cle: 'mots-de-liaison',
  titre: 'Les mots de liaison',
  accroche: 'Car, donc, mais, ensuite…',
  matiere: 'Français',
  matiereCode: 'FRANCAIS',
  niveaux: ['CM1'],
  competences: ['FR_CM1_ECR_CONNECTEURS'],
  image: couvertureCm1Liaison,
  titreDansImage: true
}];

/**
 * UN JEU PEUT SERVIR PLUSIEURS CLASSES — Camara, le 21/09/2026 : les jeux de CP
 * qui s'y prêtent gagnent un niveau CE1 plutôt qu'un double. `competences` et
 * `accroche` sont ceux de la première classe du jeu ; `parNiveau` porte ce
 * qui change pour une autre. Le jeu, lui, reçoit la classe de l'enfant et
 * règle sa difficulté.
 */
function selonLaClasse(jeu, niveauCode) {
  var _jeu$parNiveau$code, _jeu$parNiveau;
  const code = (niveauCode !== null && niveauCode !== void 0 ? niveauCode : '').toUpperCase();
  const propre = (_jeu$parNiveau$code = (_jeu$parNiveau = jeu.parNiveau) === null || _jeu$parNiveau === void 0 ? void 0 : _jeu$parNiveau[code]) !== null && _jeu$parNiveau$code !== void 0 ? _jeu$parNiveau$code : {};
  // UNE COUVERTURE NE MENT PAS — Camara, le 22/09/2026, en donnant les
  // couvertures du CE1 : elles portent le titre peint (« Le coffre des
  // centaines »). Là où la classe change le titre (« Les grands nombres » au
  // CM1), cette image dirait un autre jeu : la carte reprend alors son aperçu
  // dessiné, sauf si la classe apporte sa propre image.
  const autreTitre = propre.titre && propre.titre !== jeu.titre && jeu.titreDansImage && !('image' in propre);
  return {
    ...jeu,
    ...propre,
    ...(autreTitre ? {
      image: null,
      titreDansImage: false
    } : {})
  };
}

/**
 * Les jeux ouverts à cette classe.
 *
 * Une classe inconnue — profil incomplet, code de niveau plus récent que
 * cette liste — ne rend RIEN plutôt que tout : mieux vaut une ludothèque vide
 * et une phrase qui l'explique qu'un jeu de CP proposé à un lycéen.
 */
function jeuxDeLaClasse(niveauCode) {
  const code = (niveauCode !== null && niveauCode !== void 0 ? niveauCode : '').toUpperCase();
  if (!code) return [];
  return JEUX.filter(jeu => jeu.niveaux.includes(code)).map(jeu => selonLaClasse(jeu, code));
}

/**
 * LES JEUX RANGÉS PAR MATIÈRE — Camara, le 21/09/2026 : « je veux que les jeux
 * soient regroupés par matière, avec un titre Maths, Français, etc., et sous
 * la matière apparaissent les jeux. C'est une règle générale à tous les jeux,
 * et aux futurs jeux qui arriveront. »
 *
 * RIEN À DÉCLARER POUR UN NOUVEAU JEU : le regroupement lit la matière que
 * chaque jeu porte déjà. Un jeu de français ouvre la section Français à son
 * arrivée, un jeu de maths rejoint celle des maths.
 *
 * L'ORDRE EST CELUI DU CATALOGUE, sections comme jeux : la première matière
 * qui y apparaît vient en premier. On range donc les matières en rangeant
 * leurs jeux ici, sans tri caché ailleurs.
 */
function parMatiere(jeux) {
  const groupes = [];
  jeux.forEach(jeu => {
    let groupe = groupes.find(g => g.matiereCode === jeu.matiereCode);
    if (!groupe) {
      groupe = {
        matiere: jeu.matiere,
        matiereCode: jeu.matiereCode,
        jeux: []
      };
      groupes.push(groupe);
    }
    groupe.jeux.push(jeu);
  });
  return groupes;
}