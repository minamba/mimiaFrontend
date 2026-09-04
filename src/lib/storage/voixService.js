/**
 * Synthèse vocale — le professeur parle.
 *
 * L'audio est produit par le serveur (OpenAI), pas par le navigateur. La Web
 * Speech API était gratuite mais sonnait robotique, ce qui détruit la seule
 * chose qui compte ici : croire qu'un vrai professeur est en face. Elle reste
 * en repli quand le serveur n'a pas de clé ou ne répond pas — une voix moche
 * vaut mieux qu'un silence.
 *
 * Le point clé reste le même : on parle PENDANT que l'agent écrit, phrase par
 * phrase. Attendre la fin de la génération ajouterait plusieurs secondes de
 * silence, et un prof qui met cinq secondes à répondre paraît cassé.
 */

import httpClient, { API_BASE_URL, enTeteAuth } from '../api/httpClient';
import { DEBUT_DICTEE, FIN_DICTEE } from './ardoise';
import { epelerLesChoix } from './epellation';

/**
 * LES DEUX ANNONCES DE DICTÉE, DITES PAR L'APPLICATION.
 *
 * POURQUOI ELLES NE SONT PLUS DEMANDÉES AU PROFESSEUR
 * ---------------------------------------------------
 * Sa consigne les lui réclamait, en toutes lettres, avec l'exemple de la
 * séquence complète et la raison — l'élève au cahier ne regarde pas l'écran,
 * il n'a que la voix. Il ne les a pas dites : dictée du 31 août, API relancée
 * seize minutes plus tôt avec la nouvelle consigne, aucune des deux phrases.
 * C'est la septième règle de dictée ignorée.
 *
 * La leçon est celle du choix cahier/clavier et celle de la photo de copie :
 * UNE GARANTIE D'USAGE NE SE DEMANDE PAS, ELLE S'IMPOSE. L'application SAIT où
 * la dictée commence et où elle finit — les bornes sont dans le texte, c'est
 * elle qui les pose. Elle dit donc ces deux phrases elle-même, dans la voix du
 * professeur, et il n'y a plus rien à espérer de personne.
 *
 * ELLES SONT COURTES PARCE QU'ELLES SE PAIENT. Chacune est un appel de
 * synthèse de plus par dictée. Deux phrases de quatre mots ne pèsent rien ;
 * un paragraphe, si.
 */
const OUVERTURE_DICTEE = 'Je commence. Première phrase.';
const FERMETURE_DICTEE = "Voilà, c'était la dernière phrase.";

const navigateurSupporte = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Longueur max d'un envoi ; au-delà le serveur tronque. */
const LONGUEUR_MAX = 700;

/**
 * Premier passage envoyé à la synthèse.
 *
 * C'EST LE LEVIER PRINCIPAL DE LA LATENCE. Le temps de génération chez OpenAI
 * est proportionnel à la longueur du passage : à 90 caractères, l'élève voyait
 * défiler deux lignes de texte avant d'entendre le premier mot. Une proposition
 * courte suffit à lancer la voix, et les passages suivants — plus longs, donc
 * mieux intonés — se téléchargent pendant qu'elle joue.
 *
 * Ne pas descendre beaucoup plus bas : sous une vingtaine de caractères, le
 * modèle n'a plus de contexte pour poser une intonation et on retombe sur le
 * phrasé haché qu'on cherchait à corriger.
 */
const PREMIER_GROUPE = 40;

/**
 * Passages suivants. Plus longs : ils se téléchargent pendant que le
 * précédent joue, et le modèle a de quoi construire une vraie intonation
 * plutôt que de recommencer à zéro à chaque phrase.
 */
const GROUPE = 260;

/**
 * Au bout de combien de silence du flux un groupe incomplet part quand même.
 *
 * POURQUOI CE FILET EXISTE
 * ------------------------
 * Un message ordinaire dépasse le premier seuil (40) et n'atteint jamais le
 * second (260) : la fin de la réponse reste donc en attente, et ne partait
 * qu'au `terminer()` de fin de flux. Or ce `terminer()` vient d'un effet React
 * protégé par quatre conditions. Le jour où l'une d'elles ne se réalise pas —
 * c'est arrivé en séance —, le professeur prononce sa première phrase et se
 * tait, pendant que le texte continue de s'écrire à l'écran.
 *
 * Faire dépendre TOUTE la fin d'un message d'un seul déclencheur était le vrai
 * défaut. Le flux, lui, ne ment pas : tant que le modèle écrit, les fragments
 * tombent en rafale. Un silence de cette durée signifie que le message est fini
 * — ou bloqué, et dans les deux cas il faut dire ce qu'on a.
 *
 * 400 ms : au-dessus du battement entre deux fragments, très en dessous de ce
 * qu'un élève perçoit comme une hésitation. Au pire on coupe un groupe entre
 * deux phrases, ce qui s'entend à peine ; c'est toujours mieux que de n'en
 * prononcer aucune.
 */
const SILENCE_GROUPE = 400;

/**
 * L avance minimale entre le calcul et le démarrage d un son.
 *
 * Le graphe audio ne joue pas à l instant où on le lui demande : il prend en
 * charge, puis démarre. Programmer sur `currentTime` revient à lui donner un
 * son dont le début est déjà passé, et il entre au milieu — la première
 * syllabe saute.
 *
 * Soixante millisecondes sont inaudibles, et couvrent largement l écart. Un
 * tour de parole en compte UNE seule : les morceaux suivants s enchaînent sur
 * `prochaineFin`, qui est déjà dans le futur.
 */
const AVANCE_DEMARRAGE = 0.06;

/**
 * De combien on programme à l'avance, en secondes.
 *
 * Assez pour qu'aucun blanc n'apparaisse si le décodage du passage suivant
 * prend un instant ; assez peu pour qu'une interruption de l'élève ne laisse
 * pas dix secondes de parole déjà engagée dans la carte son.
 */
const AVANCE_PROGRAMMATION = 0.4;

/**
 * Fréquence du PCM renvoyé par le serveur. Fixée par le fournisseur de
 * synthèse ; si elle diffère de celle du graphe audio, le navigateur
 * rééchantillonne à la lecture.
 */
const FREQUENCE_PCM = 24000;

/**
 * Où couper les aigus à la lecture. Voir `obtenirSortie`.
 *
 * Sept kilohertz : la parole tient dessous, les artefacts du modèle de
 * synthèse vivent au-dessus.
 */
const COUPURE_HZ = 7000;

/**
 * De quoi jouer, en octets, avant de lancer le premier morceau d'un passage.
 *
 * LE PRIX DE LA DIFFUSION AU FIL DE L'EAU. En attendant le passage entier, on
 * ne pouvait pas manquer de son ; en le jouant à mesure qu'il arrive, un
 * ralentissement du réseau peut faire arriver un morceau après l'instant où il
 * aurait dû se faire entendre — et là c'est un trou au milieu d'un mot, ce qui
 * s'entend bien plus qu'un démarrage un quart de seconde plus tard.
 *
 * Une avance suffit à couvrir ce risque parce que la synthèse produit le son
 * BIEN PLUS VITE qu'on ne le prononce : une fois le premier morceau posé, les
 * suivants arrivent avec de l'avance et le matelas ne fait que grandir.
 *
 * 12 000 octets = 6 000 échantillons = 0,25 seconde à 24 kHz sur 16 bits.
 */
const AMORCE_OCTETS = 12000;

// ---------------------------------------------------------------- disponibilité
// Interrogé une seule fois par session : la réponse ne change pas en cours de
// route, et un aller-retour avant chaque phrase ajouterait de la latence là où
// elle s'entend le plus.
let serveurDispo = null;
let sondeEnCours = null;

async function serveurDisponible() {
  if (serveurDispo !== null) return serveurDispo;

  if (!sondeEnCours) {
    sondeEnCours = httpClient
      .get('/voix/disponible')
      .then(({ data }) => {
        serveurDispo = Boolean(data?.disponible);
        return serveurDispo;
      })
      .catch(() => {
        serveurDispo = false;
        return false;
      });
  }

  return sondeEnCours;
}

// ---------------------------------------------------------------- repli navigateur
let voixFr = null;

function choisirVoix() {
  if (!navigateurSupporte) return null;
  if (voixFr) return voixFr;

  const voix = window.speechSynthesis.getVoices();
  const francaises = voix.filter((v) => v.lang?.toLowerCase().startsWith('fr'));
  if (francaises.length === 0) return null;

  voixFr =
    francaises.find((v) => /natural/i.test(v.name)) ??
    francaises.find((v) => /google/i.test(v.name)) ??
    francaises[0];

  return voixFr;
}

if (navigateurSupporte) {
  window.speechSynthesis.onvoiceschanged = () => {
    voixFr = null;
    choisirVoix();
  };
}

/**
 * Découpe un texte en phrases prononçables.
 * On ne coupe qu'après une ponctuation forte suivie d'un espace : couper au
 * milieu d'un nombre décimal ou d'une abréviation donnerait un débit haché.
 */
function decouperEnPhrases(texte) {
  const phrases = [];
  const regex = /[^.!?…]+[.!?…]+["'»)\]]*\s*/g;
  let match;
  let dernierIndex = 0;

  while ((match = regex.exec(texte)) !== null) {
    phrases.push(match[0]);
    dernierIndex = regex.lastIndex;
  }

  return { phrases, reste: texte.slice(dernierIndex) };
}

/**
 * Met la notation mathématique en français prononçable.
 *
 * LA SYNTHÈSE VOCALE AVALE LES SYMBOLES.
 * -------------------------------------
 * « 10/5 » se dit « dix cinq ». La barre disparaît, et l'élève entend deux
 * nombres sans opération entre eux — ce qui, en cours de mathématiques, est
 * exactement le mot qui portait le sens.
 *
 * POURQUOI ICI ET NON DANS LA CONSIGNE DU PROFESSEUR
 * --------------------------------------------------
 * Il écrit « 10/5 » au tableau, et c'est ce qu'il DOIT écrire : c'est la
 * notation de l'élève, celle de son cahier et de son manuel. Lui demander
 * d'écrire « dix divisé par cinq » abîmerait le tableau pour réparer la voix.
 * On transforme donc au dernier moment, sur le seul texte qui part à la
 * synthèse — l'affichage n'en sait rien.
 *
 * « SUR » ET NON « DIVISÉ PAR ». C'est ce que dit un professeur, et surtout
 * c'est juste dans les deux lectures : « trois sur quatre » vaut pour la
 * fraction comme pour la division. « Divisé par » serait faux sur une
 * fraction.
 *
 * LES DATES SONT ÉPARGNÉES. « 12/03/2026 » deviendrait « douze sur zéro trois
 * sur deux mille vingt-six ». Une barre oblique voisine d'une autre n'est pas
 * une division — c'est le seul indice nécessaire, et il suffit.
 */
function prononcable(texte) {
  // L ÉPELLATION DES CHOIX EN PREMIER : elle POSE des tirets, que la règle du
  // bas convertira ensuite en virgules. L inverse laisserait « a-i-t » intact
  // et la question resterait « X ou X ? ».
  return epelerLesChoix(texte)
    .replace(/(\d+)\s*\/\s*(\d+)/g, (tout, a, b, index, chaine) => {
      const avant = chaine[index - 1];
      const apres = chaine[index + tout.length];

      // Encadrée par d'autres barres : c'est une date complète.
      if (avant === '/' || apres === '/') return tout;

      // UN ZÉRO EN TÊTE TRAHIT UNE DATE. « 01/09 » s'écrit ainsi, « 1/9 »
      // jamais — un quotient ne porte pas de zéro de remplissage. C'est un
      // indice de FORME, indépendant de la langue, donc plus sûr qu'un mot
      // déclencheur.
      if (a.length > 1 && a.startsWith('0')) return tout;
      if (b.length > 1 && b.startsWith('0')) return tout;

      return `${a} sur ${b}`;
    })

    // Les autres symboles que la voix laisse tomber. Écrits en toutes lettres
    // ils ne changent rien pour un modèle qui les prononçait déjà bien, et ils
    // sauvent ceux qu'il ignorait.
    // LA MULTIPLICATION, SOUS SES TROIS ÉCRITURES.
    //
    // La règle n'acceptait que des CHIFFRES des deux côtés : « 3 × 4 »
    // passait, « 3 × BC » non. Or en géométrie le second membre est presque
    // toujours une longueur nommée par des lettres.
    //
    // Le défaut ne s'entendait pas sur `gpt-4o-mini-tts`, qui devine
    // l'intention et disait « trois fois BC » de lui-même. `tts-1` lit ce
    // qu'on lui donne et disait « trois BC ». On ne le remarquait donc qu'en
    // basculant sur le secours — et ce qui marchait ne marchait que par la
    // bonne volonté d'un modèle.
    //
    // On l'écrit. Une lecture correcte ne doit pas dépendre de ce qu'un
    // modèle veut bien comprendre.
    .replace(/(\d)\s*[×*]\s*([\dA-Za-zà-öø-ÿ])/g, '$1 fois $2')

    // LA MULTIPLICATION IMPLICITE : « 3BC », « 2AB ».
    //
    // DEUX MAJUSCULES AU MOINS, et c'est la borne qui rend la règle sûre.
    // Une seule attraperait « 3D », « 4K », « 2H » — des mots, pas des
    // produits. Deux majuscules collées à un chiffre ne se rencontrent, en
    // cours, que pour un segment ou un produit : « 3BC », « 2AM ».
    //
    // Les minuscules sont épargnées pour la même raison : « 3e » est un
    // rang, « 2h » une durée, et « 3x » resterait ambigu. Un professeur qui
    // veut le produit écrit alors le symbole, et la règle du dessus s'en
    // charge.
    .replace(/(\d)([A-Z]{2,})\b/g, '$1 fois $2')

    .replace(/(\d)\s*÷\s*(\d)/g, '$1 divisé par $2')

    // LES SIGNES QUE LA SYNTHÈSE AVALE EN SILENCE.
    //
    // « BC = 6,7 » se disait « BC six virgule sept » : le signe le plus
    // important de la phrase disparaissait, et l’élève entendait deux choses
    // côte à côte sans savoir qu’elles étaient égales.
    //
    // ENCADRÉS PAR DES ESPACES, toujours. Un tiret collé appartient à un mot
    // — « peut-être », « rez-de-chaussée » — et le convertir en « moins »
    // abîmerait la phrase pour réparer une équation. Le même raisonnement
    // vaut pour le plus et pour les comparateurs, qu’on croise aussi dans du
    // texte ordinaire.
    .replace(/\s=\s/g, ' égale ')
    .replace(/\s≈\s/g, ' environ égal à ')
    .replace(/\s\+\s/g, ' plus ')
    .replace(/\s[-−]\s/g, ' moins ')
    .replace(/\s≤\s/g, ' inférieur ou égal à ')
    .replace(/\s≥\s/g, ' supérieur ou égal à ')
    .replace(/\s<\s/g, ' inférieur à ')
    .replace(/\s>\s/g, ' supérieur à ')
    .replace(/(\d)\s*%/g, '$1 pour cent')
    .replace(/(\d)²/g, '$1 au carré')
    .replace(/(\d)³/g, '$1 au cube')

    // UNE SUITE DE LETTRES ÉPELÉES SE LIT LETTRE PAR LETTRE.
    //
    // Le professeur de langue épelle ce qui distingue deux homophones :
    // « on écrit avait, a-i-t, ou avaient, a-i-e-n-t ? ». Sans séparation,
    // rien ne garantit que la synthèse ne lise pas « aient » comme un mot — et
    // la question redeviendrait « on écrit X ou X ? », c'est-à-dire très
    // exactement le défaut qu'on cherche à corriger.
    //
    // Les virgules forcent une coupure entre chaque lettre.
    //
    // LA CONDITION EST STRICTE : le mot ENTIER doit être fait de lettres
    // seules. « peut-être » et « grand-mère » ont des parties longues, et
    // « a-t-il » se termine par « il » — tous restent intacts.
    //
    // C'est cette dernière borne qui compte le plus. Sans elle, le motif
    // s'arrêtait au milieu : « y a-t-il » devenait « y a, t-il ». Un `\b`
    // n'y suffit pas — un tiret est déjà une frontière de mot.
    //
    // PAS DE `lookbehind` : il n'existe pas sur les Safari d'avant 2023, et
    // son absence ne se manifeste pas par un défaut mais par une erreur de
    // syntaxe qui emporte le module entier — donc toute la voix. Le caractère
    // qui précède est donc capturé et réécrit.
    .replace(
      /(^|[^\wà-öø-ÿ-])([a-zà-öø-ÿ](?:-[a-zà-öø-ÿ])+)(?![-\wà-öø-ÿ])/gi,
      (tout, avant, suite) => avant + suite.split('-').join(', '),
    );
}

/**
 * Un passage qui arrive en morceaux.
 *
 * Le serveur diffuse le PCM au fil de l'eau — il lit la réponse d'OpenAI par
 * blocs de quatre kilo-octets et vidange après chacun. Le navigateur, lui,
 * réclamait la réponse ENTIÈRE avant d'en faire quoi que ce soit : tout ce
 * travail de diffusion était réassemblé en silence, et la première syllabe
 * n'arrivait qu'une fois le passage intégralement généré.
 *
 * Cet objet est le point de rendez-vous entre les deux vitesses. D'un côté le
 * téléchargement pousse les morceaux dès qu'ils tombent, aussi vite que le
 * réseau les livre ; de l'autre la lecture les tire à son rythme, en ne
 * programmant jamais plus d'une longueur d'avance — sans quoi une interruption
 * de l'élève laisserait derrière elle dix secondes de parole déjà engagée dans
 * la carte son.
 */
class PassageDiffuse {
  constructor(controleur) {
    this.controleur = controleur;
    this.morceaux = [];
    this.fini = false;
    this.erreur = null;

    // Un seul consommateur — la boucle de lecture — donc une seule attente
    // à réveiller. Une file de réveils serait du décor.
    this.reveil = null;
  }

  /**
   * Coupe le téléchargement et débloque qui attendait.
   *
   * Sans ça, une boucle suspendue sur un morceau qui n'arrive jamais — réseau
   * coupé au milieu d'un passage — resterait suspendue pour toujours. Le jeton
   * suffit à l'empêcher de PARLER, il ne suffit pas à la faire SORTIR : elle
   * ne revérifie le jeton qu'au retour de l'attente.
   */
  interrompre() {
    try { this.controleur?.abort(); } catch { /* déjà refermé */ }
    this.clore();
  }

  pousser(tampon) {
    this.morceaux.push(tampon);
    this.reveiller();
  }

  clore(erreur = null) {
    this.fini = true;
    this.erreur = erreur;
    this.reveiller();
  }

  reveiller() {
    const reveil = this.reveil;
    this.reveil = null;
    reveil?.();
  }

  /** Vrai si le passage s'est terminé sans avoir jamais produit de son. */
  muet() {
    return this.fini && this.morceaux.length === 0;
  }

  /**
   * Le morceau suivant, ou null quand le passage est dit.
   *
   * On attend plutôt que de rendre null dès que la file est vide : une file
   * vide ne veut pas dire « terminé », elle veut souvent dire « le prochain
   * bloc est en route ».
   */
  async suivant() {
    for (;;) {
      if (this.morceaux.length > 0) return this.morceaux.shift();
      if (this.fini) return null;

      await new Promise((resoudre) => {
        this.reveil = resoudre;
      });
    }
  }
}

/**
 * File d'attente de lecture.
 *
 * Le flux produit du texte bien plus vite que la voix ne le prononce. Chaque
 * phrase est synthétisée puis lue dans l'ordre, et la suivante se télécharge
 * pendant que la précédente joue — sans ce recouvrement, on entendrait un blanc
 * d'une seconde entre chaque phrase.
 */
class Lecteur {
  constructor() {
    this.tampon = '';

    // Phrases complètes en attente d'atteindre la taille d'un passage.
    this.groupe = '';
    this.premierGroupe = true;

    // Le filet qui les libère si le flux se tait sans dire qu'il a fini.
    this.minuteurGroupe = null;

    this.file = [];
    this.actif = false;
    this.enLecture = false;
    this.audio = null;
    this.avatar = null;
    this.age = 12;

    // Mode dictée : le débit n'est plus celui d'une conversation. Posé par
    // l'appelant à chaque tour, à partir du marqueur du professeur.
    this.dictee = false;

    /**
     * Lecture par le graphe audio plutôt que par des éléments <audio>.
     *
     * Chaque passage était joué par son propre élément, l'un après l'autre :
     * création, décodage et démarrage prenaient de cinquante à deux cents
     * millisecondes ENTRE chaque passage, auxquelles s'ajoutait le silence que
     * tout encodeur MP3 pose en tête et en queue de fichier. Le professeur
     * parlait donc par blocs séparés de micro-blancs qui ne tombaient pas sur
     * la ponctuation — c'est ce qui donnait cet effet mécanique.
     *
     * Ici les passages sont décodés à l'avance et programmés à la
     * milliseconde : le suivant démarre exactement là où le précédent finit.
     */
    this.contexte = null;

    // Le point où tous les morceaux se rejoignent avant la carte son :
    // voir `obtenirSortie`.
    this.sortie = null;
    this.sources = new Set();
    this.prochaineFin = 0;

    // Les passages en cours de téléchargement. Il y en a jusqu'à deux : celui
    // qu'on prononce et celui qu'on précharge. Gardés pour pouvoir les couper
    // net — un téléchargement continué après une interruption coûte de la
    // synthèse facturée pour du son que personne n'entendra.
    this.passages = new Set();

    // Comment débloquer la lecture en cours depuis l'extérieur.
    //
    // `audio.pause()` ne déclenche AUCUN événement de fin : ni `ended`, ni
    // `error`. Sans cette poignée, la promesse de lecture d'un passage
    // interrompu ne se résolvait jamais, la boucle restait suspendue sur son
    // `await`, et `enLecture` gardait la valeur vraie pour le reste de la
    // séance — donc plus une seule phrase prononcée jusqu'au rechargement.
    this.finirLecture = null;

    // Appelé quand la file est épuisée et que le son s'est tu. C'est ce
    // signal qui permet au mode mains libres de rendre la parole à l'élève
    // au bon moment, sans que le micro capte la voix du professeur.
    this.auSilence = null;

    // Le pendant de `auSilence` : le professeur COMMENCE à parler.
    //
    // Sans ce signal, l'écran ne pouvait apprendre la reprise de parole
    // qu'en observant un drapeau interne au fil des rendus — donc trop tard
    // et par intermittence. Or fermer un micro doit se faire AVANT la
    // première syllabe : après, la boucle a déjà commencé.
    this.auDebutDeParole = null;

    // Appelé quand le navigateur refuse de jouer le son faute d'interaction.
    // Sans ce signal, l'échec était avalé : le texte défilait, aucune voix ne
    // sortait, et rien à l'écran n'expliquait pourquoi.
    this.surBlocage = null;

    // Mesure du délai avant la première syllabe.
    this.debutAttente = null;
    this.surDelai = null;

    /**
     * Le passage a été prononcé par la voix du navigateur, faute de mieux.
     *
     * CE SIGNAL VAUT AUTANT QUE LE DÉLAI. Quand la synthèse serveur échoue, le
     * repli sonne robotique — et c'est exactement le reproche qu'on cherche à
     * mesurer. Sans lui, un parent dirait « la voix fait robot », on irait
     * chercher dans le modèle de synthèse, et le vrai coupable serait un
     * serveur qui a flanché deux fois dans la séance.
     */
    this.surRepli = null;

    /**
     * Prévenu quand un silence de dictée s'ouvre et quand il se referme.
     *
     * L'élève entend une phrase puis PLUS RIEN pendant trente secondes. En
     * classe le professeur est là, visible ; ici, un enfant croit que ça a
     * planté et clique ailleurs. L'écran doit dire que le silence est voulu.
     */
    this.surPauseDictee = null;

    /**
     * Les minuteurs de ce signal.
     *
     * PAS `attendreJusqua` : cette méthode n'a qu'UN emplacement
     * d'interruption (`finirLecture`), et l'appeler en parallèle de la boucle
     * lui volerait le sien — l'interruption ne réveillerait plus la lecture.
     */
    this.minuteursPause = [];

    /**
     * L'heure à laquelle le silence de dictée doit se terminer, ou zéro.
     *
     * Sert à savoir qu'une pause est EN COURS — c'est la seule chose que
     * `sauterLaPause` a besoin de connaître.
     */
    this.finPauseDictee = 0;

    /**
     * La pause que doit la DERNIÈRE phrase dictée, en secondes.
     *
     * Elle ne se prend pas tout de suite : l'annonce « c'était la dernière
     * phrase » passe avant, sans quoi l'élève attendrait le silence entier
     * sans savoir que la dictée est finie. Zéro = rien en attente.
     */
    this.pauseDue = 0;

    // Incrémenté par arreter(). Une boucle dont le jeton a changé se sait
    // périmée et se retire — c'est ce qui garantit qu'un professeur interrompu
    // ne reprend pas la parole trois phrases plus loin.
    this.jeton = 0;
  }

  /** Qui parle, et à qui. Détermine la voix et le débit. */
  configurer({ avatar, age }) {
    if (avatar) this.avatar = avatar;
    if (age) this.age = age;
  }

  /**
   * Prépare tout ce qui peut l'être avant d'avoir quelque chose à dire.
   *
   * À l'ouverture d'un cours, le premier passage payait DEUX allers-retours
   * au lieu d'un : la sonde « le serveur a-t-il une clé ? » puis la synthèse
   * elle-même. La sonde ne servant qu'une fois par session, elle tombait
   * toujours au pire moment — celui où l'élève attend la première syllabe.
   *
   * Le graphe audio est ouvert dans la foulée. Sa création coûte peu, mais
   * elle arrivait jusqu'ici au moment de programmer le premier son, en même
   * temps que tout le reste.
   *
   * Appelé pendant que la conversation s'ouvre : ce sont trois requêtes
   * enchaînées côté serveur, du temps mort dont on ne se servait pas.
   */
  prechauffer() {
    serveurDisponible();

    // `silencieux` : à ce stade, un refus de reprise n'est PAS un problème à
    // signaler. La page vient peut-être d'être rechargée directement sur le
    // cours, sans clic préalable — le premier passage retentera, et c'est lui
    // qui alertera si ça bloque vraiment. Sans ce garde-fou, on afficherait
    // « le son est bloqué » avant même que le professeur ait ouvert la bouche.
    this.obtenirContexte({ silencieux: true });
  }

  /**
   * Départ du chronomètre, à l'instant où il y a quelque chose à dire.
   *
   * Distinct de la mise en file : entre les deux, le texte peut attendre
   * qu'un groupe se remplisse ou qu'un profil arrive. C'est justement cette
   * partie-là qui était invisible — la mesure démarrait après, et affichait
   * de bons chiffres pendant que l'élève, lui, comptait jusqu'à dix.
   */
  marquerDebutTour() {
    if (this.debutAttente === null) this.debutAttente = performance.now();
  }

  /**
   * Ajoute du texte au flux.
   *
   * Les phrases sont REGROUPÉES avant d'être envoyées à la synthèse. Une
   * phrase seule est prononcée sans savoir ce qui suit : le modèle repart à
   * chaque fois de la même intonation neutre, redescend en fin de phrase, et
   * l'enchaînement sonne haché — c'est une bonne part de l'effet « robot ».
   * Un paragraphe entier laisse la prosodie se dérouler.
   *
   * Le premier groupe reste court pour que le professeur réponde vite ; les
   * suivants sont plus longs, puisqu'ils jouent pendant qu'on télécharge.
   */
  /**
   * Reçoit un fragment du flux, en respectant les bornes de dictée.
   *
   * LE MODE NE VAUT PLUS POUR TOUT LE TOUR DE PAROLE, MAIS POUR LE SEUL TEXTE
   * DICTÉ.
   *
   * Il valait pour le tour entier, au motif que la consigne interdit au
   * professeur de mettre autre chose dans un message de dictée. Il en met : sa
   * phrase d'annonce était donc traitée comme une phrase dictée et recevait sa
   * pause. L'élève attendait vingt secondes AVANT le premier mot, alors que le
   * silence doit tomber ENTRE les phrases.
   *
   * Le groupe en cours est vidé AVANT chaque bascule : le texte déjà accumulé
   * appartient au mode précédent, et l'emporter dans le suivant lui donnerait
   * le mauvais débit.
   */
  alimenter(fragment) {
    if (!fragment.includes(DEBUT_DICTEE) && !fragment.includes(FIN_DICTEE)) {
      this.alimenterMorceau(fragment);
      return;
    }

    // Le découpage GARDE les bornes — d'où le groupe capturant.
    //
    // Les caractères de contrôle dans une expression régulière sont signalés
    // par le linter, et c'est une bonne règle : ils sont presque toujours une
    // faute de frappe. Ici ils sont le sujet même de la découpe.
    // eslint-disable-next-line no-control-regex
    for (const morceau of fragment.split(/([\u0001\u0002])/)) {
      if (morceau === DEBUT_DICTEE) {
        this.viderGroupe();

        // AVANT de basculer : cette phrase se dit à la voix normale, pas au
        // débit de dictée — et surtout elle ne doit pas recevoir le silence
        // qui suit une phrase dictée.
        this.enfiler(OUVERTURE_DICTEE);

        this.dictee = true;
      } else if (morceau === FIN_DICTEE) {
        this.viderGroupe();

        // LA PAUSE DE LA DERNIÈRE PHRASE EST DIFFÉRÉE, PAS SUPPRIMÉE.
        //
        // Le silence tombe ENTRE les phrases : il donne à l'élève le temps
        // d'écrire celle qu'il vient d'entendre. Après la dernière, ce silence
        // se plaçait AVANT l'annonce de fin — vingt à quarante-cinq secondes
        // pendant lesquelles rien ne distingue une dictée finie d'une dictée
        // en cours.
        //
        // Relevé en séance, sur une dictée au cahier : « j'attendais dans le
        // vide que le professeur continue alors qu'il avait fini de dicter ».
        // L'élève au cahier ne regarde pas l'écran ; il n'a que la voix, et la
        // voix se taisait.
        //
        // On échange donc l'ordre : l'annonce d'abord, la pause ensuite. Elle
        // garde tout son rôle — c'est elle qui affiche « ✍️ Écris… » et qui
        // laisse le temps d'écrire cette dernière phrase — mais elle tombe
        // maintenant APRÈS que l'élève a su que c'était la dernière.
        const derniere = this.file[this.file.length - 1];
        if (derniere?.dictee) derniere.finDeDictee = true;

        this.dictee = false;

        // APRÈS la bascule : elle se dit normalement, et c'est elle qui porte
        // la pause différée de la dernière phrase. L'élève apprend donc que
        // c'est fini, PUIS il a son temps pour écrire.
        this.enfiler(FERMETURE_DICTEE);
      } else if (morceau) {
        this.alimenterMorceau(morceau);
      }
    }
  }

  alimenterMorceau(fragment) {
    this.tampon += fragment;
    const { phrases, reste } = decouperEnPhrases(this.tampon);
    this.tampon = reste;

    phrases.forEach((phrase) => {
      this.groupe += phrase;

      // EN DICTÉE, CHAQUE PHRASE PART SEULE.
      //
      // Le silence qu'on pose ensuite tombe entre les PHRASES ; groupées par
      // 260 caractères, deux ou trois phrases s'enchaînaient d'une traite et
      // l'élève n'avait de pause qu'une fois sur trois — exactement ce qui
      // rendait la dictée inutilisable.
      if (this.dictee) {
        this.viderGroupe();
        return;
      }

      const cible = this.premierGroupe ? PREMIER_GROUPE : GROUPE;
      if (this.groupe.length >= cible) this.viderGroupe();
    });

    // Le flux vient de parler : on repousse le filet d'autant.
    this.armerLeFilet();
  }

  /**
   * Le filet : si plus rien n'arrive, on dit quand même ce qu'on a.
   *
   * Il ne remplace pas `terminer()`, il le double. `terminer()` reste plus
   * rapide — il n'attend pas — et sait vider aussi le tampon de phrase
   * incomplète. Celui-ci n'existe que pour le jour où `terminer()` ne vient
   * pas : sans lui, la fin du message reste en attente pour toujours.
   */
  armerLeFilet() {
    clearTimeout(this.minuteurGroupe);

    this.minuteurGroupe = setTimeout(() => {
      this.minuteurGroupe = null;

      // LE TAMPON NE PART PAS. C'EST TOUTE LA DIFFÉRENCE AVEC `terminer()`.
      //
      // Le tampon contient la phrase EN COURS, coupée là où le flux s'est
      // arrêté — c'est-à-dire n'importe où, y compris au milieu d'un mot.
      // Une première version l'envoyait avec le reste : quand le modèle
      // marquait une pause au milieu de « trouver », la synthèse recevait
      // « trou » comme passage, et le professeur le prononçait tel quel.
      // Plusieurs fois par réponse.
      //
      // Ce filet agit sur une SUPPOSITION — un silence veut dire que c'est
      // fini. `terminer()` agit sur un FAIT — le flux a annoncé sa fin. Seul
      // un fait autorise à prononcer une phrase inachevée ; une supposition
      // n'a le droit de toucher qu'aux phrases complètes.
      this.viderGroupe();
    }, SILENCE_GROUPE);
  }

  /** Prononce ce qui reste en attente, en fin de flux. */
  terminer() {
    clearTimeout(this.minuteurGroupe);
    this.minuteurGroupe = null;

    this.groupe += this.tampon;
    this.tampon = '';
    this.viderGroupe();
  }

  viderGroupe() {
    const passage = this.groupe.trim();
    this.groupe = '';
    if (!passage) return;

    this.premierGroupe = false;
    this.enfiler(passage);
  }

  /**
   * Prononce une phrase isolée, hors flux de génération.
   * Sert aux messages du système — « je ne t'ai pas entendu », un problème de
   * micro. Dans un produit où l'élève porte un casque et regarde rarement
   * l'écran, un message écrit seul équivaut à ne rien dire du tout.
   */
  dire(texte) {
    if (!texte) return;
    this.tampon = '';
    this.groupe = '';
    this.enfiler(texte);
  }

  enfiler(texte) {
    const propre = prononcable(texte.trim());
    if (!propre) return;

    // Horodatage du premier passage d'un tour de parole : c'est lui qui donne
    // le délai « texte affiché → première syllabe entendue », la seule mesure
    // qui compte pour juger la fluidité. Sans elle on arbitre au ressenti.
    if (this.file.length === 0 && !this.actif) this.debutAttente = performance.now();

    // Voix et âge sont FIGÉS ici, à la mise en file, et non lus au moment de
    // la synthèse. Le profil de l'élève arrive de façon asynchrone : sans ce
    // gel, les premières phrases partaient avec l'âge par défaut et les
    // suivantes avec le vrai — donc avec une autre consigne de jeu, et une
    // voix qui semblait changer au milieu du message.
    const reglages = { avatar: this.avatar, age: this.age, dictee: this.dictee };

    // Une phrase sans ponctuation peut dépasser la limite du serveur : on la
    // coupe sur un espace plutôt que de la laisser tronquer en plein mot.
    let reste = propre;
    while (reste.length > LONGUEUR_MAX) {
      const coupe = reste.lastIndexOf(' ', LONGUEUR_MAX);
      const index = coupe > 0 ? coupe : LONGUEUR_MAX;
      this.file.push({ texte: reste.slice(0, index), ...reglages });
      reste = reste.slice(index).trim();
    }
    if (reste) this.file.push({ texte: reste, ...reglages });

    this.demarrer();
  }

  /**
   * Vrai dès qu'il y a quelque chose à dire, même si aucun son ne sort encore.
   *
   * `actif` seul ne suffit pas : il ne passe à vrai qu'une fois l'audio
   * téléchargé, soit une seconde après la mise en file. Pendant ce trou, un
   * appelant qui teste « est-ce que le professeur parle ? » croirait la voie
   * libre et couperait la phrase avant qu'elle ne commence.
   */
  estOccupe() {
    return (
      this.actif
      || this.enLecture
      || this.file.length > 0
      || this.tampon.trim().length > 0
      || this.groupe.trim().length > 0
    );
  }

  /**
   * Le silence à poser après une phrase dictée, en secondes.
   *
   * POURQUOI IL NE PEUT PAS VENIR DU MODÈLE VOCAL
   * ---------------------------------------------
   * On a demandé au modèle de « marquer un vrai silence, plusieurs secondes ».
   * Mesuré : il allonge la phrase de 1,43× et ne pose aucun blanc digne de ce
   * nom. Un modèle de parole comprime les silences — il est fait pour parler,
   * pas pour se taire. Le seul silence fiable est celui qu'on programme
   * soi-même.
   *
   * LE CALCUL SUIT LA MAIN DE L'ÉLÈVE, PAS UNE VALEUR FIXE.
   * Une constante serait trop longue sur trois mots et trop courte sur une
   * phrase entière. On estime le temps d'écriture à partir du nombre de
   * caractères et de l'âge — un CE1 forme ses lettres, un lycéen écrit en
   * attaché — puis on retire le temps qu'a déjà duré l'audio, pendant lequel
   * l'élève écrit déjà.
   *
   * Le plancher évite l'enchaînement sec sur un groupe très court. Le plafond
   * évite qu'un passage anormalement long fige la séance une minute.
   */
  silenceDictee(texte, dureeAudio) {
    // CARACTÈRES ÉCRITS PAR SECONDE, à la main, en écoutant.
    //
    // Première calibration trop prudente — 1,6 pour un collégien — et le
    // résultat s est senti tout de suite : trente-six secondes de silence sur
    // une phrase de soixante-dix signes, six minutes pour douze lignes. À
    // quatorze ans on écrit plutôt deux caractères et demi par seconde, et
    // surtout on COMMENCE à écrire pendant qu on entend, pas après.
    const parSeconde =
      this.age <= 8 ? 1.0
      : this.age <= 11 ? 1.6
      : this.age <= 15 ? 2.4
      : 3.0;

    const ecriture = texte.length / parSeconde;

    // Plancher à 2 s : jamais d'enchaînement sec, même sur trois mots.
    // Plafond à 45 s : un garde-fou contre un passage anormalement long, pas
    // un réglage. À 30 s il se déclenchait sur presque toutes les phrases et
    // écrasait la différence entre un CE1 et un lycéen — le plafond faisait
    // le calcul à la place du calcul.
    return Math.min(Math.max(ecriture - dureeAudio, 2), 45);
  }

  demarrer() {
    if (this.enLecture) return;

    this.enLecture = true;

    // AVANT la première syllabe, et pas après : sur un appareil sans casque,
    // c'est ce signal qui ferme le micro avant que la voix du professeur ne
    // s'y engouffre. Une microseconde de retard suffit à laisser passer le
    // début du mot, que le transcripteur prendra pour une interruption.
    this.auDebutDeParole?.();
    const jeton = this.jeton;

    this.boucle(jeton).finally(() => {
      // Une boucle périmée ne baisse pas le drapeau d'une boucle plus
      // récente : après une interruption, l'ancienne se termine souvent
      // APRÈS que la nouvelle a démarré, et elle la ferait taire.
      if (jeton === this.jeton) this.enLecture = false;
    });
  }

  /**
   * Lit la file jusqu'à épuisement, en préparant toujours la phrase suivante
   * pendant que la courante joue.
   */
  async boucle(jeton) {
    let prochain = null;

    for (;;) {
      if (jeton !== this.jeton) return;

      // File vide : on attend la fin de ce qui est déjà programmé, PUIS on
      // regarde à nouveau. C'est indispensable — le texte arrive en flux, et
      // de nouvelles phrases tombent pendant qu'on joue les précédentes.
      //
      // Sans ce second regard, la boucle sortait dès que la file se vidait un
      // instant, `enLecture` restait à vrai le temps d'attendre la fin du son,
      // et `demarrer()` refusait d'en relancer une. Les phrases arrivées entre
      // les deux n'étaient jamais prononcées : le professeur disait la première
      // phrase de sa réponse et se taisait.
      if (this.file.length === 0) {
        await this.attendreJusqua(this.prochaineFin, jeton);
        if (this.file.length === 0 || jeton !== this.jeton) break;
        continue;
      }

      const phrase = this.file.shift();
      const source = prochain ?? this.charger(phrase, jeton);

      // Lance le téléchargement de la suivante AVANT de jouer la courante.
      // Ses morceaux s'empilent dans son propre passage sans être programmés :
      // c'est la boucle qui décide quand ils passent à l'antenne, donc l'ordre
      // reste celui de la file même si le réseau rend la suite en avance.
      prochain = this.file.length > 0 ? this.charger(this.file[0], jeton) : null;

      const passage = await source;
      if (jeton !== this.jeton) return;

      this.actif = true;

      // Repère pour mesurer la durée réelle de ce passage : la différence
      // entre l'horloge audio avant et après sa programmation.
      const horlogeAvant = Math.max(this.contexte?.currentTime ?? 0, this.prochaineFin);

      // Pas de passage : c'est le repli navigateur, qui ne sait pas se
      // programmer — on l'attend comme avant.
      if (!passage) {
        this.surRepli?.();
        this.debutAttente = null;
        await this.parlerNavigateur(phrase.texte, jeton);
        continue;
      }

      // Le passage arrive en morceaux, chacun programmé dès qu'il est là.
      //
      // On garde une longueur d'avance, pas plus : programmer tout ce qui est
      // disponible empêcherait d'interrompre proprement, et retenir chaque
      // morceau jusqu'à la fin du précédent rouvrirait le blanc qu'on cherche
      // à supprimer. Pendant cette attente, le téléchargement continue et le
      // matelas grandit — c'est ce qui rend l'enchaînement continu.
      for (;;) {
        const tampon = await passage.suivant();
        if (tampon === null) break;
        if (jeton !== this.jeton) return;

        this.programmer(tampon, jeton);
        await this.attendreJusqua(this.prochaineFin - AVANCE_PROGRAMMATION, jeton);
      }

      // LE SILENCE DE DICTÉE EST UNE VRAIE ATTENTE DE LA BOUCLE.
      //
      // Il a d'abord été posé sur l'horloge audio : on repoussait simplement
      // `prochaineFin`, et le passage suivant se programmait à cette nouvelle
      // heure. Élégant, et faux dès qu'on a voulu ÉCOURTER la pause.
      //
      // Car la boucle ne dormait pas : elle enchaînait aussitôt, programmait
      // la phrase suivante à l'heure lointaine, et la rendait à un
      // `AudioBufferSourceNode` déjà démarré. Reculer la borne ensuite ne
      // reprogrammait rien — le premier morceau restait calé sur l'ancienne
      // heure pendant que les suivants avançaient. D'où le premier mot mangé.
      //
      // La boucle attend donc pour de bon. Rien n'est programmé pendant le
      // silence, donc rien n'est à reprogrammer pour l'écourter : il suffit de
      // réveiller l'attente.
      // La dernière phrase dictée : on calcule sa pause et on la met de côté.
      // L'annonce de fin passe d'abord.
      if (phrase.dictee && phrase.finDeDictee) {
        this.pauseDue = this.silenceDictee(phrase.texte, this.prochaineFin - horlogeAvant);
        continue;
      }

      // Une phrase dictée ordinaire, ou le passage qui suit la dernière et qui
      // porte la pause différée. Dans les deux cas, on attend pour de bon.
      const silence = phrase.dictee
        ? this.silenceDictee(phrase.texte, this.prochaineFin - horlogeAvant)
        : this.pauseDue;

      if (silence > 0) {
        this.pauseDue = 0;

        const finAudio = this.prochaineFin;
        this.finPauseDictee = finAudio + silence;
        this.signalerPauseDictee(finAudio, this.finPauseDictee, jeton);

        await this.attendreJusqua(this.finPauseDictee, jeton);
        if (jeton !== this.jeton) return;

        this.finPauseDictee = 0;
        this.viderPausesDictee();

        // LA PHRASE SUIVANTE PART UN POIL APRÈS « MAINTENANT ».
        //
        // Programmer exactement sur `currentTime` fait rendre un son dont le
        // début est déjà passé quand le graphe le prend en charge : la
        // première syllabe saute. Cinquante millisecondes d'avance ne
        // s'entendent pas et suffisent.
        this.prochaineFin = Math.max(this.prochaineFin, (this.contexte?.currentTime ?? 0) + 0.05);
      }
    }

    // LE FILET DE LA PAUSE DIFFÉRÉE.
    //
    // Elle est portée par le passage qui SUIT la dernière phrase dictée —
    // l'annonce de fin. Si le professeur l'oublie, ce passage n'existe pas, et
    // la pause tomberait dans le vide : l'élève n'aurait plus une seconde pour
    // écrire la dernière phrase, et l'indicateur « ✍️ Écris… » ne s'afficherait
    // jamais.
    //
    // On la prend donc ici, à la fin du tour. Le professeur a manqué son
    // annonce, l'élève garde son temps.
    if (this.pauseDue > 0 && jeton === this.jeton) {
      const finAudio = this.prochaineFin;
      this.finPauseDictee = finAudio + this.pauseDue;
      this.pauseDue = 0;

      this.signalerPauseDictee(finAudio, this.finPauseDictee, jeton);
      await this.attendreJusqua(this.finPauseDictee, jeton);
      if (jeton !== this.jeton) return;

      this.finPauseDictee = 0;
      this.viderPausesDictee();
    }

    if (jeton === this.jeton) {
      // L'ordre compte : les deux drapeaux tombent AVANT le signal. Les laisser
      // au `finally` du démarrage les remettrait à faux dans une microtâche
      // dont l'ordre n'est pas garanti vis-à-vis du rendu React — l'écouteur
      // testerait alors « occupé » et ne rouvrirait jamais le micro.
      this.actif = false;
      this.enLecture = false;
      this.auSilence?.();
    }
  }

  /**
   * Récupère l'audio d'un passage. Renvoie null si le repli s'impose.
   *
   * Un échec réseau isolé faisait basculer CE passage sur la voix du
   * navigateur : au milieu d'une explication, le professeur changeait de voix
   * pour une phrase puis revenait. C'est ce qui donnait l'impression d'un
   * timbre instable et robotique. On réessaie donc avant d'abandonner.
   */
  async charger({ texte, avatar, age, dictee }, jeton) {
    if (!(await serveurDisponible())) return null;

    for (let tentative = 0; tentative < 2; tentative += 1) {
      try {
        // LE DRAPEAU DE DICTÉE VOYAGE JUSQU AU BOUT.
        //
        // Il était posé à la mise en file, lu par la boucle pour placer les
        // silences... et perdu ICI : ni « charger » ni « diffuser » ne le
        // recevaient, alors que les deux savaient quoi en faire. Le serveur
        // recevait donc « dictee: false » pour TOUTES les phrases, et la voix
        // lente de dictée n avait jamais servi.
        //
        // Le défaut ne s entendait pas comme un défaut : les silences entre
        // les phrases, eux, fonctionnaient, et ils portaient à eux seuls tout
        // le rythme de l exercice. La lenteur d élocution, elle, manquait
        // simplement — et rien ne disait qu elle aurait dû être là.
        return await this.diffuser({ texte, avatar, age, dictee }, jeton);
      } catch (erreur) {
        const code = erreur?.statut ?? erreur?.response?.status;

        // 503 = aucune clé configurée. Rien ne servira de réessayer, et le
        // repli navigateur devient le mode normal de la session.
        if (code === 503) {
          serveurDispo = false;
          return null;
        }

        // 4xx : la requête est mauvaise, la rejouer donnerait le même résultat.
        if (code >= 400 && code < 500) break;

        if (tentative === 0) await new Promise((r) => setTimeout(r, 350));
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[voix] repli navigateur — la synthèse serveur a échoué pour :', texte.slice(0, 60));
    }

    return null;
  }

  /**
   * Ouvre le flux du serveur et rend la main dès qu'il y a de quoi commencer.
   *
   * Deux rythmes cohabitent ici, et c'est voulu. La promesse rendue se résout
   * après l'AMORCE — un quart de seconde de son —, pas à la fin du passage :
   * c'est tout le gain, la voix démarre pendant que la suite se fabrique. Le
   * pompage, lui, continue en tâche de fond jusqu'au dernier octet.
   *
   * `fetch` plutôt qu'axios : dans un navigateur, aucun `responseType` d'axios
   * ne donne accès au corps avant qu'il soit complet. C'est exactement ce
   * qu'on veut éviter — le serveur vidange par blocs de quatre kilo-octets, et
   * personne ne les récupérait.
   */
  async diffuser({ texte, avatar, age, dictee }, jeton) {
    const controleur = new AbortController();
    const entete = await enTeteAuth();

    const reponse = await fetch(`${API_BASE_URL}/voix/synthese`, {
      method: 'POST',
      signal: controleur.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(entete ? { Authorization: entete } : {}),
      },
      body: JSON.stringify({ texte, avatar, age, dictee: Boolean(dictee) }),
    });

    if (!reponse.ok || !reponse.body) {
      const erreur = new Error(`La synthèse a répondu ${reponse.status}.`);
      erreur.statut = reponse.status;
      throw erreur;
    }

    const passage = new PassageDiffuse(controleur);
    this.passages.add(passage);

    const lecteur = reponse.body.getReader();

    let amorce = 0;
    let liberer = null;
    let echec = null;
    const pret = new Promise((resoudre) => {
      liberer = resoudre;
    });

    const pomper = async () => {
      // L'octet orphelin d'un bloc qui s'est terminé au milieu d'un
      // échantillon. Sans ce report, tout le reste du passage se décale d'un
      // demi-échantillon : les octets de poids fort et faible s'inversent, et
      // ce qui sort n'est plus une voix mais du bruit blanc.
      let orphelin = new Uint8Array(0);

      try {
        for (;;) {
          const { done, value } = await lecteur.read();
          if (done) break;

          // L'élève a coupé : inutile de télécharger la suite d'une phrase
          // que plus personne n'entendra.
          if (jeton !== this.jeton) {
            controleur.abort();
            break;
          }

          let bloc = value;
          if (orphelin.length > 0) {
            bloc = new Uint8Array(orphelin.length + value.length);
            bloc.set(orphelin, 0);
            bloc.set(value, orphelin.length);
          }

          const utiles = bloc.length - (bloc.length % 2);
          orphelin = bloc.slice(utiles);
          if (utiles === 0) continue;

          const tampon = this.construireTampon(bloc.subarray(0, utiles));
          if (tampon) passage.pousser(tampon);

          amorce += utiles;
          if (amorce >= AMORCE_OCTETS) liberer?.();
        }
      } catch (erreur) {
        // Une coupure APRÈS le premier morceau ne bascule pas sur la voix du
        // navigateur : changer de timbre au milieu d'une phrase s'entend bien
        // plus qu'une phrase écourtée. Seul un échec avant tout son compte.
        echec = erreur;
      } finally {
        this.passages.delete(passage);
        passage.clore(echec);
        liberer?.();
      }
    };

    pomper();
    await pret;

    // Rien n'est sorti du tout : c'est un vrai échec, il doit remonter pour
    // que la reprise puis le repli navigateur jouent leur rôle.
    if (passage.muet()) {
      throw echec ?? Object.assign(new Error('audio vide'), { statut: 0 });
    }

    return passage;
  }

  /** Le graphe audio, ouvert au préchauffage puis réutilisé. */
  obtenirContexte({ silencieux = false } = {}) {
    if (!this.contexte) {
      const Contexte = window.AudioContext || window.webkitAudioContext;

      // ------------------------------------------------------------------
      // LE CONTEXTE TOURNE À LA FRÉQUENCE DU FLUX, PAS À CELLE DE LA CARTE.
      // ------------------------------------------------------------------
      //
      // C'est la correction des « bips » du 03/09/2026, et elle tient à un
      // détail qui ne se voit pas en lisant le code.
      //
      // Sans argument, le contexte s'ouvre à la fréquence du périphérique —
      // 48 kHz sur presque toutes les machines. Nos tampons, eux, sont
      // fabriqués à 24 kHz, la fréquence du PCM. Le navigateur les
      // rééchantillonne donc, ET IL LE FAIT MORCEAU PAR MORCEAU.
      //
      // Or l'interpolation qui termine un morceau ignore le morceau suivant.
      // Les deux ne se raccordent pas : la tension saute au point de
      // jointure. Une marche dans une onde, c'est un clic — large bande, très
      // bref, et dont la hauteur dépend de là où la coupure est tombée dans
      // la forme d'onde. D'où des « bips » qui changeaient de ton.
      //
      // CE QUI A ÉGARÉ LE DIAGNOSTIC. Le son sort PROPRE du fournisseur :
      // mesuré à 4-13 ruptures par seconde en le demandant directement. Le
      // même contenu joué par l'application en produisait bien davantage. Le
      // défaut naissait donc entre les deux, à un endroit où personne ne
      // pense à regarder puisqu'aucune ligne ne le fabrique.
      //
      // La voix du navigateur, elle, ne clique jamais — et pour cause : elle
      // ne passe pas par ce graphe. Ça semblait accuser le fournisseur ; ça
      // n'accusait que notre lecture.
      //
      // LE REPLI EXISTE PARCE QUE LA CONTRAINTE PEUT ÊTRE REFUSÉE. Certains
      // périphériques ne savent pas ouvrir un contexte à 24 kHz et le
      // constructeur lève. On repart alors sur le défaut : le son clique un
      // peu, mais il sort — c'est le bon sens du compromis.
      try {
        this.contexte = new Contexte({ sampleRate: FREQUENCE_PCM });
      } catch {
        this.contexte = new Contexte();
      }

      // Le rééchantillonnage a-t-il vraiment été évité ? Le navigateur peut
      // accepter le constructeur et servir une autre fréquence.
      if (this.contexte.sampleRate !== FREQUENCE_PCM) {
        // eslint-disable-next-line no-console
        console.warn(
          '[voix] contexte à', this.contexte.sampleRate,
          'Hz au lieu de', FREQUENCE_PCM,
          '— les morceaux seront rééchantillonnés un par un, ce qui peut cliquer.',
        );
      }
    }

    // Le navigateur suspend le graphe tant que la page n'a pas été touchée.
    // On tente la reprise à chaque passage : le premier clic la débloque, où
    // qu'il tombe.
    if (this.contexte.state === 'suspended') {
      this.contexte.resume().catch(() => {
        if (!silencieux) this.surBlocage?.();
      });
    }

    return this.contexte;
  }

  /**
   * Transforme le PCM brut du serveur en tampon audio.
   *
   * Aucun décodage : les octets sont des échantillons 16 bits signés qu'on
   * recopie tels quels. C'est le format le plus sûr pour ce qu'on fait —
   * le MP3 ajoute un silence en tête et en queue de chaque passage, et le WAV
   * arrive en flux avec un en-tête dont les tailles sont inconnues, ce que le
   * décodeur du navigateur refuse.
   */
  construireTampon(octets) {
    // La recopie n'est pas du gaspillage, elle est nécessaire : un morceau
    // sorti du flux est une VUE sur un tampon partagé, à un décalage
    // quelconque. `Int16Array` exige un décalage pair — sur un octet impair il
    // lève, et c'est la seule façon de s'en prémunir sans supposer ce que le
    // navigateur nous a rendu.
    const aligne = octets.slice();

    // Un échantillon fait deux octets : une longueur impaire signalerait un
    // morceau tronqué, on laisse tomber le dernier plutôt que de décaler tout
    // le passage d'un demi-échantillon.
    const echantillons = new Int16Array(
      aligne.buffer, 0, Math.floor(aligne.byteLength / 2),
    );
    if (echantillons.length === 0) return null;

    const contexte = this.obtenirContexte();
    const tampon = contexte.createBuffer(1, echantillons.length, FREQUENCE_PCM);
    const canal = tampon.getChannelData(0);

    for (let i = 0; i < echantillons.length; i += 1) {
      canal[i] = echantillons[i] / 0x8000;
    }

    return tampon;
  }

  /**
   * Programme un passage à la suite du précédent et renvoie l'instant, sur
   * l'horloge du graphe, où il finira.
   */
  programmer(tampon, jeton) {
    const contexte = this.obtenirContexte();
    const source = contexte.createBufferSource();
    source.buffer = tampon;

    // UN ROBINET PAR MORCEAU, POUR POUVOIR L'ÉTEINDRE EN DOUCEUR.
    //
    // `source.stop()` coupe l'onde à l'échantillon près, où qu'elle en
    // soit. Si la tension valait 0,7 à cet instant, elle tombe à 0 en une
    // seule période d'échantillonnage : c'est une marche, et une marche
    // contient toutes les fréquences à la fois. On entend un clic sec.
    //
    // Un clic par interruption. Et une interruption arrive à chaque fois
    // que le micro croit entendre l'élève — sur un haut-parleur, c'est la
    // voix du professeur qui se coupe elle-même, plusieurs fois par
    // réponse. Les « bips inexpliqués » sont ces coupures.
    //
    // Le robinet permet de descendre à zéro en quelques millisecondes
    // avant d'arrêter : inaudible comme fondu, et il n'y a plus de marche.
    const robinet = contexte.createGain();

    // UNE SORTIE COMMUNE PLUTÔT QUE LA DESTINATION DIRECTE.
    //
    // Elle ne change rien à ce qu'on entend — un gain à 1 est transparent —
    // mais elle donne un point unique où poser le filtre. Sans elle, il
    // faudrait le répéter sur chaque source, et les sources vont et
    // viennent à chaque morceau.
    const sortie = this.obtenirSortie(contexte);

    source.connect(robinet).connect(sortie);
    source.robinet = robinet;

    // UN SON NE DÉMARRE JAMAIS SUR « MAINTENANT », TOUJOURS UN POIL APRÈS.
    //
    // C'était `Math.max(currentTime, prochaineFin)`. Sur un passage en retard
    // sur l'horloge — le PREMIER de chaque tour de parole, dont la borne vient
    // du tour précédent et se situe donc dans le passé — cela revenait à
    // demander au graphe de jouer à l'instant même.
    //
    // Or entre le calcul et la prise en charge effective, l'horloge avance.
    // Le début du tampon se trouve alors déjà passé, et le graphe le rattrape
    // en entrant au milieu : la première syllabe est perdue. « On dirait »
    // devenait « dirait », et le premier mot sautait souvent — mais pas
    // toujours, ce qui rendait le défaut difficile à saisir.
    //
    // Soixante millisecondes d'avance ne s'entendent pas et suffisent
    // largement. Elles ne s'accumulent pas : dès que `prochaineFin` est dans
    // le futur — c'est-à-dire tout au long d'un passage — c'est elle qui
    // l'emporte, et l'enchaînement reste bord à bord.
    const debut = Math.max(contexte.currentTime + AVANCE_DEMARRAGE, this.prochaineFin);

    // LE FONDU D'ENTRÉE, ET SEULEMENT SUR LES REPRISES.
    //
    // On avait adouci l'arrêt sans toucher au démarrage, et c'était la moitié
    // du travail. Une lecture qui REPART — après une interruption, ou au
    // premier morceau d'une réponse — attaque le son à la valeur qu'a l'onde
    // à cet instant. Si elle vaut 0,6, la tension saute de 0 à 0,6 en un seul
    // échantillon : la même marche que la coupure, donc le même clic, à
    // l'autre bout.
    //
    // `prochaineFin === 0` désigne exactement ces reprises : la valeur est
    // remise à zéro par `arreter()` et à la construction. Tant qu'un passage
    // se déroule elle porte la fin du morceau précédent, et les morceaux se
    // suivent bord à bord — leur appliquer un fondu creuserait un trou toutes
    // les quelques centaines de millisecondes, audible comme un tremblement.
    if (this.prochaineFin === 0) {
      robinet.gain.setValueAtTime(0, debut);
      robinet.gain.linearRampToValueAtTime(1, debut + 0.008);
    }

    source.start(debut);

    this.prochaineFin = debut + tampon.duration;
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);

    // Mesure du délai jusqu'à la première syllabe : c'est l'instant programmé
    // qui compte, pas celui où le code s'exécute.
    if (this.debutAttente !== null) {
      const attente = Math.max(0, debut - contexte.currentTime) * 1000;
      const delai = Math.round(performance.now() - this.debutAttente + attente);
      this.debutAttente = null;
      this.surDelai?.(delai);

      if (process.env.NODE_ENV !== 'production') {
        console.info(`[voix] première syllabe après ${delai} ms`);
      }
    }

    return jeton === this.jeton ? this.prochaineFin : 0;
  }

  /**
   * Annonce l'ouverture et la fermeture d'un silence de dictée.
   *
   * Les deux instants sont ceux de l'HORLOGE AUDIO — le son n'a pas encore
   * commencé quand on programme le signal, et c'est justement ce qui permet
   * de le poser à l'avance sans rien attendre.
   */
  signalerPauseDictee(debut, fin, jeton) {
    const contexte = this.contexte;
    if (!contexte) return;

    const versDebut = Math.max((debut - contexte.currentTime) * 1000, 0);
    const versFin = Math.max((fin - contexte.currentTime) * 1000, 0);

    this.minuteursPause.push(
      setTimeout(() => {
        if (jeton === this.jeton) this.surPauseDictee?.(true);
      }, versDebut),

      setTimeout(() => {
        if (jeton === this.jeton) this.surPauseDictee?.(false);
      }, versFin),
    );
  }

  /**
   * Écourte le silence de dictée en cours : l'élève a fini d'écrire.
   *
   * POURQUOI CE RACCOURCI EXISTE
   * ----------------------------
   * La durée du silence est CALCULÉE — nombre de caractères divisé par une
   * vitesse d'écriture moyenne pour l'âge. C'est une estimation, donc une
   * borne haute : elle doit couvrir l'élève le plus lent, sinon elle ne sert à
   * rien.
   *
   * Mais quand il écrit au CLAVIER, il nous dit lui-même quand il a fini — sa
   * phrase validée est le signal exact que l'estimation approchait. Continuer
   * d'attendre vingt secondes après ce signal, c'est faire patienter un élève
   * qui a terminé, et allonger une dictée de dix lignes de plusieurs minutes
   * pour rien.
   *
   * Sur le cahier, aucun signal de ce genre n'existe : la pause calculée reste
   * la seule chose dont on dispose, et elle garde tout son sens.
   *
   * ON NE REMONTE JAMAIS AVANT LA FIN DE L'AUDIO. Ramener l'horloge en deçà
   * ferait démarrer la phrase suivante par-dessus la précédente — deux voix en
   * même temps, et une dictée incompréhensible.
   */
  sauterLaPause() {
    // Aucune pause en cours : rien à écourter, et surtout rien à réveiller.
    // Sans ce test, on résoudrait l'attente d'un passage en train de JOUER et
    // on programmerait le suivant par-dessus.
    if (!this.finPauseDictee) return;

    this.finPauseDictee = 0;

    // La boucle dort jusqu'à l'échéance calculée : on la réveille, elle
    // reprend au point suivant et programme la phrase d'après.
    this.finirLecture?.();
  }

  /**
   * Referme le signal et jette les minuteurs en attente.
   *
   * Appelé à l'interruption : sans ça, l'indicateur « écris » resterait
   * affiché après que l'élève a coupé la dictée, ou se rallumerait tout seul
   * une demi-minute plus tard.
   */
  viderPausesDictee() {
    this.minuteursPause.forEach(clearTimeout);
    this.minuteursPause = [];
    this.surPauseDictee?.(false);
  }

  /** Attend l'horloge du graphe, en se réveillant si on interrompt. */
  attendreJusqua(instant, jeton) {
    const contexte = this.contexte;
    if (!contexte) return Promise.resolve();

    const reste = (instant - contexte.currentTime) * 1000;
    if (reste <= 0) return Promise.resolve();

    return new Promise((resoudre) => {
      const minuteur = setTimeout(resoudre, reste);

      // Une interruption périme le jeton : on ne laisse pas la boucle dormir
      // jusqu'au bout d'un passage qu'on vient de couper.
      this.finirLecture = () => {
        clearTimeout(minuteur);
        this.finirLecture = null;
        resoudre();
      };

      if (jeton !== this.jeton) this.finirLecture();
    });
  }

  /**
   * La sortie commune, créée à la demande.
   *
   * Gain à 1 : rigoureusement transparent. Elle n'existe que pour donner un
   * point de branchement au magnétophone de diagnostic.
   */
  obtenirSortie(contexte) {
    if (this.sortie) return this.sortie;

    this.sortie = contexte.createGain();

    // ------------------------------------------------------------------
    // LE FILTRE QUI FAIT TAIRE LES BIPS.
    // ------------------------------------------------------------------
    //
    // LE DÉFAUT N'EST PAS DANS NOTRE CODE. Mesuré en redemandant la même
    // phrase au fournisseur, PCM brut, sans passer par le navigateur : la
    // sortie de `gpt-4o-mini-tts` contient des oscillations violentes d'un
    // échantillon au suivant — jusqu'à 0,76 d'amplitude, autour de 6,5 et
    // 8,3 kHz. À 24 kHz d'échantillonnage, c'est le voisinage de Nyquist.
    // Large bande, très bref : on l'entend comme un « bip » sec, au milieu
    // des mots, sans régularité.
    //
    // COMBIEN : 10 886 sauts francs sur sept secondes de parole. Le même
    // texte par `tts-1` en donne 173.
    //
    // POURQUOI FILTRER PLUTÔT QUE CHANGER DE MODÈLE. `tts-1` est propre,
    // mais il ignore le paramètre `instructions` — celui qui fait ralentir
    // le professeur pour une dictée et adapter son ton à l'âge de l'élève.
    // On ne troque pas la pédagogie contre le silence.
    //
    // POURQUOI 7 kHz, ET PAS AILLEURS. Mesuré coupure par coupure sur le
    // même audio : 8 kHz laisse encore 16 % des sauts, 7 kHz en laisse 1 %,
    // et descendre plus bas n'enlève plus rien. La parole, elle, tient
    // entièrement sous 7 kHz — seules les sifflantes perdent un peu de
    // brillance, et personne ne remarque cela sur une voix de professeur.
    //
    // DEUX FILTRES EN CASCADE, pas un. Un biquad seul descend de 12 dB par
    // octave : à 8 kHz il ne retire que la moitié de ce qui gêne. Deux en
    // série doublent la pente, et c'est cette configuration-là que la
    // mesure ci-dessus valide.
    const premier = contexte.createBiquadFilter();
    premier.type = "lowpass";
    premier.frequency.value = COUPURE_HZ;

    const second = contexte.createBiquadFilter();
    second.type = "lowpass";
    second.frequency.value = COUPURE_HZ;

    this.sortie.connect(premier).connect(second).connect(contexte.destination);

    return this.sortie;
  }
  jouerAudio(url, jeton) {
    return new Promise((resoudre) => {
      const audio = new Audio(url);
      this.audio = audio;

      // `fini` garde la résolution unique : `ended` et `error` peuvent tomber
      // tous les deux, et arreter() peut appeler la poignée en plus.
      let fini = false;
      const finir = () => {
        if (fini) return;
        fini = true;

        URL.revokeObjectURL(url);
        if (this.audio === audio) this.audio = null;
        if (this.finirLecture === finir) this.finirLecture = null;
        resoudre();
      };

      this.finirLecture = finir;
      audio.onended = finir;
      audio.onerror = finir;

      audio.onplaying = () => {
        if (this.debutAttente === null) return;

        const delai = Math.round(performance.now() - this.debutAttente);
        this.debutAttente = null;
        this.surDelai?.(delai);

        if (process.env.NODE_ENV !== 'production') {
          console.info(`[voix] première syllabe après ${delai} ms`);
        }
      };

      audio.play().catch((erreur) => {
        // Lecture refusée faute d'interaction utilisateur : le navigateur
        // bloque l'audio tant que la page n'a pas été cliquée. Un rechargement
        // direct sur l'URL du cours suffit à tomber dedans.
        this.surBlocage?.(erreur);
        finir();
      });

      // Interruption : arreter() a changé le jeton pendant le chargement.
      if (jeton !== this.jeton) {
        audio.pause();
        finir();
      }
    });
  }

  parlerNavigateur(texte, jeton) {
    return new Promise((resoudre) => {
      if (!navigateurSupporte) {
        resoudre();
        return;
      }

      let fini = false;
      const finir = () => {
        if (fini) return;
        fini = true;
        if (this.finirLecture === finir) this.finirLecture = null;
        resoudre();
      };

      const enonce = new SpeechSynthesisUtterance(texte);
      const voix = choisirVoix();

      if (voix) enonce.voice = voix;
      enonce.lang = voix?.lang ?? 'fr-FR';
      enonce.rate = this.age <= 8 ? 0.85 : this.age <= 11 ? 0.95 : 1.05;

      enonce.onend = finir;
      enonce.onerror = finir;

      if (jeton !== this.jeton) {
        finir();
        return;
      }

      // Même poignée que pour l'audio serveur : `speechSynthesis.cancel()`
      // est censé émettre `end`, mais ne le fait pas de façon fiable selon
      // les navigateurs. On ne dépend pas de sa bonne volonté.
      this.finirLecture = finir;
      window.speechSynthesis.speak(enonce);
    });
  }

  /** Coupe net : changement de page, ou l'élève reprend la parole. */
  arreter() {
    this.jeton += 1; // périme la boucle en cours

    // L'indicateur de dictée tombe avec le reste : il annonce une attente qui
    // n'aura pas lieu.
    this.viderPausesDictee();

    // Le filet doit tomber avec le reste : sinon il se déclencherait après
    // l'interruption et prononcerait la fin de la phrase qu'on vient de couper.
    clearTimeout(this.minuteurGroupe);
    this.minuteurGroupe = null;

    this.tampon = '';
    this.groupe = '';
    this.premierGroupe = true;
    this.file = [];
    this.actif = false;
    this.debutAttente = null;

    // Tout ce qui est déjà programmé dans la carte son doit être coupé : sans
    // ça, le professeur continuerait à parler pendant l'avance de
    // programmation alors que l'élève vient de l'interrompre.
    // LE FONDU DE COUPURE : QUINZE MILLISECONDES.
    //
    // Assez long pour qu'il n'y ait plus de marche dans le signal, assez
    // court pour qu'on n'entende aucune traîne — l'élève qui coupe la
    // parole doit avoir le sentiment que le professeur se tait net.
    //
    // On arrête la source APRÈS le fondu, pas pendant : l'arrêter tout de
    // suite rendrait le fondu inutile, puisque le son serait déjà coupé.
    const maintenant = this.contexte?.currentTime ?? 0;
    const FONDU = 0.015;

    this.sources.forEach((source) => {
      try {
        const robinet = source.robinet;

        if (robinet) {
          // On repart de la valeur courante et non de 1 : un morceau déjà
          // en train de s'éteindre remonterait sinon au maximum avant de
          // redescendre, ce qui produirait le claquement même qu’on évite.
          robinet.gain.cancelScheduledValues(maintenant);
          robinet.gain.setValueAtTime(robinet.gain.value, maintenant);
          robinet.gain.linearRampToValueAtTime(0, maintenant + FONDU);
          source.stop(maintenant + FONDU + 0.005);
        } else {
          source.stop();
        }
      } catch { /* déjà terminée */ }
    });
    this.sources.clear();
    this.prochaineFin = 0;

    // Et les téléchargements en vol, pour la même raison : ce qu'ils
    // rapporteraient ne sera pas prononcé. Couper libère aussi la boucle
    // suspendue sur son prochain morceau, qui sans ça n'en verrait jamais la
    // fin et resterait en attente pour toute la séance.
    this.passages.forEach((passage) => passage.interrompre());
    this.passages.clear();

    // Les deux drapeaux tombent ICI, et pas dans la boucle. La boucle ne peut
    // plus s'en charger : elle est suspendue sur la lecture qu'on interrompt,
    // et une pause n'émet aucun événement de fin. C'est exactement ce qui
    // laissait `enLecture` à vrai pour toujours et rendait le professeur muet
    // pour le reste de la séance.
    this.enLecture = false;

    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    if (navigateurSupporte) window.speechSynthesis.cancel();

    // Débloque la boucle suspendue. Elle constatera que le jeton a changé et
    // se retirera sans toucher aux drapeaux qu'on vient de poser.
    const finir = this.finirLecture;
    this.finirLecture = null;
    finir?.();
  }
}

export const voixService = {
  // La lecture d'un flux audio est universelle ; c'est le repli navigateur qui
  // ne l'est pas. Le service reste donc toujours utilisable.
  supporte: true,
  creerLecteur: () => new Lecteur(),
};
