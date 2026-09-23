/**
 * LES VOIX DES JEUX, ENREGISTRÉES UNE FOIS POUR TOUTES.
 *
 * Camara, le 21/09/2026 : la voix du professeur de la matière lit chaque
 * consigne, dit bravo, nomme l'erreur et donne la note — « pour éviter que ça
 * coûte quelque chose, les voix peuvent-elles être préenregistrées ? ».
 *
 * Ce script lit l'inventaire (`src/lib/jeux/voix/repliques.js`), enregistre
 * chaque phrase avec la voix du professeur, et dépose les fichiers dans
 * `public/sons/jeux/<professeur>/<jeu>/<phrase>.mp3`. Ils partent ensuite
 * avec le site comme n'importe quelle image : jouer ne coûte plus rien.
 *
 * IL N'ENREGISTRE QUE CE QUI A CHANGÉ. Chaque phrase porte une empreinte —
 * texte, voix, modèle et consigne de diction ensemble — gardée dans
 * `manifeste.json`. Une phrase inchangée n'est pas renvoyée ; une phrase
 * modifiée l'est. Relancer le script après avoir ajouté un jeu coûte donc
 * les seules phrases nouvelles.
 *
 * USAGE
 *   node scripts/voix-jeux.mjs --essai   liste ce qui serait enregistré, n'appelle rien
 *   node scripts/voix-jeux.mjs           enregistre ce qui manque ou a changé
 *
 * LA CLÉ OPENAI est celle de l'API : variable OPENAI_API_KEY si elle existe,
 * sinon `Voix:ApiKey` du fichier appsettings.Development.json de l'API (chemin
 * modifiable par MIMIA_APPSETTINGS). ELLE N'EST JAMAIS AFFICHÉE, ni dans les
 * journaux ni dans les erreurs : on n'imprime que le code et le type d'erreur
 * renvoyés par OpenAI, jamais leur message, qui peut en citer un morceau.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { toutesLesRepliques } = await import(
  new URL('../src/lib/jeux/voix/repliques.js', import.meta.url).href
);
const { enLettres: centaines } = await import(
  new URL('../src/lib/jeux/nombresEnLettres.js', import.meta.url).href
);

const DOSSIER = path.join(racine, 'public', 'sons', 'jeux');
const MANIFESTE = path.join(DOSSIER, 'manifeste.json');
const MODELE = 'gpt-4o-mini-tts';

/**
 * LA VOIX DE CHAQUE PROFESSEUR — la même qu'en cours, pour que l'enfant
 * reconnaisse Nora dans le jeu comme dans sa leçon. Recopiée de
 * `SyntheseVocaleService.Voix` côté API : si elle change là-bas, la changer
 * ici, et relancer le script (l'empreinte fera le reste).
 */
const VOIX = {
  nora: 'coral',
  adrien: 'ash',
};

/**
 * LA CONSIGNE DE DICTION — celle de l'API pour un enfant de sept ans :
 * `Naturel` puis `Registre(age <= 8)`, recopiés tels quels de
 * `SyntheseVocaleService`. Les jeux sont au CP : c'est ce registre-là.
 */
const NATUREL = `Tu parles, tu ne lis pas. Ce n'est pas une lecture à voix haute :
c'est une personne qui s'adresse à quelqu'un qu'elle a en face.

Varie le rythme à l'intérieur des phrases : accélère sur ce qui est
accessoire, ralentis sur ce qui compte. Ne fais pas retomber
l'intonation à la fin de chaque phrase — enchaîne, comme dans une
conversation où l'on sait déjà ce qu'on va dire ensuite.

Articule proprement, sans bruit de bouche ni souffle audible.

N'articule pas exagérément. Ne détache pas les mots. Ne prends pas
de ton de présentateur.

Prononciation française d'un bout à l'autre, y compris sur un mot
bref ou isolé — jamais un accent anglicisé, même passager.`;

const REGISTRE_CP = (elle) => `Tu es ${elle ? 'une professeure particulière' : 'un professeur particulier'} qui parle à un enfant de sept ans.
Débit lent et très articulé, ton chaleureux et rassurant, beaucoup
de douceur. Tu souris en parlant. Laisse de vrais silences entre
les idées, comme si tu laissais à l'enfant le temps de
réfléchir — sans jamais dire que tu marques une pause.`;

/**
 * L'ACCENT FRANÇAIS NATIF, EN TÊTE — Camara, le 21/09/2026 : « la professeure a
 * un accent ; pour les jeux hors langue, elle doit avoir un accent français
 * natif et tout dire en français ». La voix d'OpenAI est anglophone
 * d'origine : sans cet ordre placé en premier, elle garde un reste de son
 * accent, et glisse vers l'anglais sur un mot isolé.
 */
/*
 * LES DEUX VERSIONS SONT ÉCRITES EN ENTIER, et non fabriquées par des
 * conditions au milieu du texte : la version masculine doit rester IDENTIQUE
 * AU CARACTÈRE PRÈS à celle d'avant, retours à la ligne compris, sinon son
 * empreinte change et les neuf cents répliques d'Adrien se réenregistrent
 * pour rien. Un essai l'a montré : un seul retour à la ligne déplacé les
 * avait toutes remises dans la liste.
 */
const ACCENT = (elle) => (elle
  ? `Tu es née en France et tu y as grandi : tu parles avec l'accent d'une
enseignante française native — aucune trace d'accent anglais ou américain.
Tout ce que tu dis est en français, y compris chaque nombre et chaque mot
isolé : « six » se dit comme en français, jamais comme en anglais.`
  : `Tu es né en France et tu y as grandi : tu parles avec l'accent d'un
enseignant français natif — aucune trace d'accent anglais ou américain.
Tout ce que tu dis est en français, y compris chaque nombre et chaque mot
isolé : « six » se dit comme en français, jamais comme en anglais.`);

/**
 * LA CONSIGNE EST AU GENRE DU PROFESSEUR — Camara, le 22/09/2026 : « en CE1
 * dans la marchande, sur "Rends-moi la monnaie", ça passe à une voix d'homme ».
 *
 * LA CONSIGNE PARLAIT AU MASCULIN à une voix de femme. Elle disait « tu es NÉ
 * en France », « tu es UN PROFESSEUR particulier » — et c'est un portrait,
 * pas une formalité : le modèle joue le personnage qu'on lui décrit. Sur une
 * phrase courte et impérative, où rien d'autre ne le retient, il glissait
 * vers la voix qui va avec ce portrait.
 *
 * LE GENRE SE LIT SUR LA VOIX et non sur le prénom : `coral` est la voix de
 * Nora, `ash` celle d'Adrien, et c'est ce couple-là qui doit rester cohérent.
 * Un professeur ajouté avec une voix inconnue prend le masculin, comme avant.
 *
 * LA CONSIGNE ENTRE DANS L'EMPREINTE : la changer ne réenregistre donc QUE
 * les répliques des professeures, celle d'Adrien restant mot pour mot la
 * même.
 */
const consigneDe = (elle) => `${ACCENT(elle)}

${elle ? `Tu es une femme, et ta voix reste une voix de femme d'un bout à
l'autre — y compris sur une phrase brève, une exclamation ou un ordre.

` : ''}${NATUREL}

${REGISTRE_CP(elle)}`;

/** Les voix féminines. `coral` est celle de Nora. */
const VOIX_FEMININES = new Set(['coral', 'sage', 'shimmer', 'nova', 'alloy']);

const CONSIGNES = {};
const consignePour = (voix) => {
  if (!CONSIGNES[voix]) CONSIGNES[voix] = consigneDe(VOIX_FEMININES.has(voix));
  return CONSIGNES[voix];
};

/**
 * LES SILENCES SONT RESSERRÉS APRÈS COUP — Camara, le 21/09/2026 : « les voix
 * sont trop robotiques […] pour les jeux et les phrases courtes, ça doit
 * être fluide », puis, à l'écoute de quatre versions, « je préfère la A, le
 * débit ralenti est bien pour les explications en cours ».
 *
 * LA DICTION RESTE DONC CELLE DES COURS, c'est le silence qui change. Mesuré
 * sur les premiers enregistrements : 9,5 lettres par seconde, et jusqu'à
 * 880 ms de pause au milieu de « Six sur huit. Presque parfait ! ». Une
 * explication supporte ces respirations ; une phrase de jeu en sort hachée.
 * Deux autres consignes de diction, essayées, ne raccourcissaient pas les
 * pauses : c'est le traitement du son qui y arrive, pas la consigne.
 *
 * Le traitement, appliqué au son brut que renvoie OpenAI :
 *   - silence de tête ramené à 30 ms : la voix répond dès le clic ;
 *   - silence de queue ramené à 150 ms ;
 *   - tout silence interne de plus de 220 ms ramené à 200 ms, en coupant son
 *     MILIEU — la fin du mot d'avant et l'attaque du suivant sont intactes —,
 *     avec un fondu de 8 ms de part et d'autre, pour qu'aucune coupure ne
 *     claque.
 *
 * Changer un de ces réglages : changer aussi TRAITEMENT, pour que
 * l'empreinte force le réenregistrement de tout.
 */
const TRAITEMENT = 'pcm24k-4prises-resserre-30/150ms-200|100ms-mp3-48k-v2';
const FREQUENCE = 24000;
const TRAME = FREQUENCE / 100; // 10 ms

/**
 * LES RÉACTIONS NE SE DISENT PAS COMME LES CONSIGNES — Camara, le 21/09/2026,
 * après avoir joué à la boîte de 10 : « quand la prof dit "il y en a trop",
 * c'est trop lent ». Mesuré : 1,94 s pour ces quatre mots, deux pauses dedans.
 *
 * Une consigne peut garder une respiration de 200 ms à la virgule : on
 * explique. Un bravo ou une erreur est une réaction, qui part du tac au tac :
 * ses pauses sont ramenées à 100 ms. Est une réaction tout ce qui n'est ni une
 * consigne, ni une aide, ni la note de fin.
 */
const estReaction = (cle) => !/consigne|aide|note/.test(cle);

/**
 * QUATRE PRISES PAR PHRASE, ON GARDE LA PLUS FLUIDE. Le débit du modèle varie
 * énormément d'une prise à l'autre : cinq prises de « Il y en a trop ! »,
 * même voix et même consigne, ont duré de 1,10 s sans aucune pause à 1,80 s
 * avec une pause de 480 ms. Changer la consigne de diction, essayé deux fois,
 * pesait bien moins que ce hasard. Garder la meilleure prise rend la voix
 * fluide sans toucher au son lui-même — aucune accélération, qui s'entend
 * toujours.
 *
 * La meilleure est la plus courte À PAROLE ÉGALE : on écarte d'abord toute
 * prise anormalement brève (moins de 70 % de la durée médiane), qui a
 * probablement avalé un mot.
 */
const PRISES = 4;

function mesurer(pcm, sousLePic = 35) {
  const trames = Math.floor(pcm.length / TRAME);
  const niveaux = [];
  for (let t = 0; t < trames; t += 1) {
    let somme = 0;
    for (let k = t * TRAME; k < (t + 1) * TRAME; k += 1) somme += (pcm[k] / 32768) ** 2;
    niveaux.push(10 * Math.log10(somme / TRAME + 1e-12));
  }
  const plafond = Math.max(...niveaux);
  const parle = niveaux.map((n) => n > plafond - sousLePic);
  return {
    trames, parle, premier: parle.indexOf(true), dernier: parle.lastIndexOf(true),
  };
}

/** La durée de parole d'une prise, silences de tête et de queue exclus, en trames. */
function dureeParole(pcm) {
  const { premier, dernier } = mesurer(pcm);
  return premier < 0 ? 0 : dernier - premier + 1;
}

/**
 * LA HAUTEUR D'UNE PRISE, EN HERTZ — le garde-fou de la voix de Nora.
 *
 * Camara, le 22/09/2026 : « sur "Rends-moi la monnaie" ça passe à une voix
 * d'homme ». La consigne au féminin traite la cause, mais le modèle reste
 * un modèle : sur une prise de temps en temps, il descendra quand même. On
 * MESURE donc, au lieu d'espérer.
 *
 * COMMENT. Autocorrélation classique : la voix est un signal presque
 * périodique, et la période qui se répète le mieux donne la fréquence des
 * cordes vocales. On garde la MÉDIANE des trames voisées — une moyenne serait
 * emportée par les quelques trames où l'algorithme se trompe d'octave.
 *
 * À 8 kHz ET SUR QUELQUES TRAMES SEULEMENT. Une autocorrélation sur 24 kHz et
 * sur toute la prise, c'est trente millions d'opérations par prise, et il y en
 * a quatre par réplique pour un millier de répliques. Décimé par trois, la
 * plage 70–320 Hz reste entièrement mesurable — c'est bien en deçà de la
 * limite de Nyquist — et vingt-quatre trames suffisent à une médiane stable.
 */
const HAUTEUR_TAUX = 8000;
const HAUTEUR_TRAMES = 24;

function hauteur(pcm) {
  // Décimation par trois, avec moyenne des trois échantillons : sans elle, on
  // replierait les aigus sur la plage qu'on mesure.
  const n = Math.floor(pcm.length / 3);
  const bas = new Float32Array(n);
  for (let i = 0; i < n; i += 1) bas[i] = (pcm[3 * i] + pcm[3 * i + 1] + pcm[3 * i + 2]) / 3;

  const cadre = Math.round(HAUTEUR_TAUX * 0.032); // 32 ms : au moins deux périodes
  const lagMin = Math.floor(HAUTEUR_TAUX / 320);
  const lagMax = Math.floor(HAUTEUR_TAUX / 70);
  const dispo = n - cadre - lagMax;
  if (dispo <= 0) return 0;

  const pas = Math.max(cadre, Math.floor(dispo / HAUTEUR_TRAMES));
  const mesures = [];

  for (let d = 0; d < dispo && mesures.length < HAUTEUR_TRAMES; d += pas) {
    let energie = 0;
    for (let i = 0; i < cadre; i += 1) energie += bas[d + i] * bas[d + i];
    // Une trame trop faible est du silence ou du souffle : elle n'a pas de
    // hauteur, et l'autocorrélation y trouverait n'importe quoi.
    if (energie / cadre < 400 * 400) continue;

    let meilleur = 0;
    let meilleurLag = 0;
    for (let lag = lagMin; lag <= lagMax; lag += 1) {
      let somme = 0;
      for (let i = 0; i < cadre; i += 1) somme += bas[d + i] * bas[d + i + lag];
      if (somme > meilleur) { meilleur = somme; meilleurLag = lag; }
    }
    // En dessous de la moitié de l'énergie, rien ne se répète vraiment : c'est
    // une consonne ou du bruit, pas une voyelle.
    if (meilleurLag && meilleur / energie > 0.5) mesures.push(HAUTEUR_TAUX / meilleurLag);
  }

  if (mesures.length < 3) return 0;
  mesures.sort((a, b) => a - b);
  return mesures[mesures.length >> 1];
}

/**
 * LE SEUIL. Une voix de femme parlée tient entre 165 et 255 Hz, une voix
 * d'homme entre 85 et 155 Hz. À 150 Hz on rejette une prise franchement
 * masculine sans écarter une professeure qui pose sa voix dans les graves.
 * `0` veut dire « pas mesurable » — une prise trop courte ou muette : on ne
 * la juge pas là-dessus, `priseValide` s'en charge.
 */
const HAUTEUR_MINIMALE = 150;

const sonneMasculin = (pcm, feminine) => {
  if (!feminine) return false;
  const f = hauteur(pcm);
  return f > 0 && f < HAUTEUR_MINIMALE;
};

/**
 * LES ÉLÉMENTS D'UNE LISTE SE CHOISISSENT AUTREMENT — Camara, le 21/09/2026 :
 * « la lecture des heures n'est pas fluide, parfois la professeure dit les
 * heures en mode haché ». Mesuré : « 11 heures » en 0,64 s, « 7 heures » en
 * 1,14 s. Lues à la suite, des heures dites chacune à son propre débit
 * sonnent comme des morceaux recollés. Pour un élément de liste, on garde
 * donc la prise la plus proche d'une durée commune, pas la plus courte :
 * c'est la régularité qui fait la fluidité d'une énumération.
 */
const DUREE_LISTE = 80; // trames de 10 ms : 0,80 s de parole

function priseReguliere(prises) {
  const durees = prises.map(dureeParole);
  const triees = [...durees].sort((a, b) => a - b);
  const mediane = triees[Math.floor(triees.length / 2)];
  let meilleure = -1;
  durees.forEach((d, i) => {
    if (d < 0.7 * mediane) return;
    const ecart = Math.abs(d - DUREE_LISTE);
    if (meilleure < 0 || ecart < Math.abs(durees[meilleure] - DUREE_LISTE)) meilleure = i;
  });
  return prises[meilleure < 0 ? 0 : meilleure];
}

function meilleurePrise(prises) {
  const durees = prises.map(dureeParole);
  const triees = [...durees].sort((a, b) => a - b);
  const mediane = triees[Math.floor(triees.length / 2)];
  let meilleure = -1;
  durees.forEach((d, i) => {
    if (d < 0.7 * mediane) return;
    if (meilleure < 0 || d < durees[meilleure]) meilleure = i;
  });
  return prises[meilleure < 0 ? 0 : meilleure];
}

/**
 * `motSeul` — Camara, le 22/09/2026 : « énormément de mots sont coupés ».
 * Un mot découpé dans sa phrase porteuse commence par une attaque douce
 * (le « l » de « lunettes », la fermeture du « c » de « cochon ») que le seuil
 * ordinaire prenait pour du silence et rognait : « cchon », « unettes ». Pour
 * un mot seul, le seuil est plus tolérant (50 dB sous le pic) et on garde
 * 80 ms devant la première trame parlée, 200 ms derrière.
 */
function resserrer(pcm, reaction, motSeul = false) {
  const {
    trames, parle, premier, dernier,
  } = mesurer(pcm, motSeul ? 50 : 35);
  if (premier < 0) return pcm;
  const tete = motSeul ? 8 : 3;
  const queue = motSeul ? 20 : 15;

  // Au-delà de `seuil` trames de silence, on n'en garde que `bord` de chaque
  // côté : 220 ms ramenées à 200 pour une consigne, 140 ramenées à 100 pour
  // une réaction.
  const seuil = reaction ? 14 : 22;
  const bord = reaction ? 5 : 10;

  // Les morceaux à garder, en trames.
  const garder = [[Math.max(0, premier - tete), premier]];
  let debut = premier;
  for (let i = premier; i <= dernier; i += 1) {
    if (parle[i]) continue;
    let j = i;
    while (j <= dernier && !parle[j]) j += 1;
    garder.push([debut, i]);
    if (j - i > seuil) {
      garder.push([i, i + bord]);
      garder.push([j - bord, j]);
    } else {
      garder.push([i, j]);
    }
    debut = j;
    i = j - 1;
  }
  garder.push([debut, dernier + 1]);
  garder.push([dernier + 1, Math.min(trames, dernier + 1 + queue)]);

  const morceaux = garder
    .filter(([a, b]) => b > a)
    .map(([a, b]) => pcm.subarray(a * TRAME, b * TRAME));
  const total = morceaux.reduce((s, m) => s + m.length, 0);
  const sortie = new Int16Array(total);
  const fondu = Math.round(FREQUENCE * 0.008);

  let o = 0;
  morceaux.forEach((m, k) => {
    sortie.set(m, o);
    if (k > 0) {
      for (let i = 0; i < fondu && i < m.length; i += 1) sortie[o + i] = Math.round(sortie[o + i] * (i / fondu));
    }
    if (k < morceaux.length - 1) {
      for (let i = 0; i < fondu && i < m.length; i += 1) {
        const p = o + m.length - 1 - i;
        sortie[p] = Math.round(sortie[p] * (i / fondu));
      }
    }
    o += m.length;
  });

  return sortie;
}

/**
 * L'ENCODEUR MP3, lu dans sa version autonome : l'entrée ordinaire de
 * `lamejs` 1.2.1 plante sous Node (« MPEGMode is not defined », défaut
 * connu du paquet). 48 kb/s en mono suffisent largement à une voix, et
 * pèsent près de trois fois moins que les 128 kb/s que livre OpenAI.
 */
const lame = new Function(`${fs.readFileSync(
  path.join(racine, 'node_modules', 'lamejs', 'lame.all.js'), 'utf8',
)}; return lamejs;`)();

function versMp3(pcm) {
  const encodeur = new lame.Mp3Encoder(1, FREQUENCE, 48);
  const morceaux = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const m = encodeur.encodeBuffer(pcm.subarray(i, i + 1152));
    if (m.length) morceaux.push(Buffer.from(m));
  }
  morceaux.push(Buffer.from(encodeur.flush()));
  return Buffer.concat(morceaux);
}

const essai = process.argv.includes('--essai');

// --seulement <préfixe> : n'enregistre que les phrases dont la clé commence
// ainsi (« peche/ », « adrien »…). Pour faire parler un nouveau jeu sans
// attendre toute la passe des autres.
const iSeul = process.argv.indexOf('--seulement');
const seulement = iSeul >= 0 ? process.argv[iSeul + 1] : null;
// --mots-seuls : n'enregistre que les mots dits seuls (voir `motDansUnePhrase`).
const motsSeuls = process.argv.includes('--mots-seuls');
// --refaire : réenregistre ce que --seulement retient, même s'il est à jour —
// pour refaire un mot à l'unité quand l'oreille dit qu'il sonne faux.
const refaire = process.argv.includes('--refaire');

// Le choix de prise d'un élément de liste entre dans l'empreinte : le changer
// réenregistre ces éléments-là, et eux seuls.
function empreinte(professeur, texte, liste, syllabe = false) {
  return crypto.createHash('sha256')
    .update([
      MODELE, VOIX[professeur], consignePour(VOIX[professeur]), TRAITEMENT, ...(liste ? [`liste-${DUREE_LISTE}`] : []), 'francais-ecoute-v2',
      ...(syllabe ? ['syllabe-v1'] : []),
      // Les mots seuls passent par leur phrase porteuse depuis le 22/09/2026 :
      // cette marque les fait tous réenregistrer, et eux seuls.
      ...(unSeulMot(texteDit(texte, liste)) ? ['phrase-porteuse-v2'] : []),
      texteDit(texte, liste),
    ].join('\u0000'))
    .digest('hex')
    .slice(0, 16);
}

function lireCle() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  const fichier = process.env.MIMIA_APPSETTINGS
    ?? path.resolve(racine, '../../../source/repos/SchoolWebApp/SchoolWebApp/appsettings.Development.json');

  const config = JSON.parse(fs.readFileSync(fichier, 'utf8').replace(/^﻿/, ''));
  const cle = config?.Voix?.ApiKey;
  if (!cle) throw new Error(`Aucune clé Voix:ApiKey dans ${fichier}`);
  return cle;
}

function lireManifeste() {
  try {
    return JSON.parse(fs.readFileSync(MANIFESTE, 'utf8'));
  } catch {
    return { modele: MODELE, professeurs: {} };
  }
}

const attendre = (ms) => new Promise((r) => { setTimeout(r, ms); });

/** Une prise brute : le son tel que le rend OpenAI, en échantillons 16 bits. */
/**
 * UNE COUPURE RÉSEAU SE RÉESSAIE, comme une panne du serveur — le 21/09/2026,
 * « ours » et « pomme » ont été perdus sur un simple « fetch failed ».
 */
async function appeler(url, options, essaiN) {
  try {
    return await fetch(url, options);
  } catch (erreur) {
    if (essaiN >= 4) throw erreur;
    return { ok: false, status: 503, json: async () => ({}) };
  }
}

async function unePrise(cle, voix, texte) {
  for (let essaiN = 1; essaiN <= 4; essaiN += 1) {
    const reponse = await appeler('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // LE SON BRUT, pas un MP3 : on le retravaille avant de l'encoder, et
        // décoder puis réencoder un MP3 l'abîmerait deux fois.
        model: MODELE, voice: voix, input: texte, instructions: consignePour(voix), response_format: 'pcm',
      }),
    }, essaiN);

    if (reponse.ok) {
      const brut = Buffer.from(await reponse.arrayBuffer());
      const pcm = new Int16Array(brut.length >> 1);
      for (let i = 0; i < pcm.length; i += 1) pcm[i] = brut.readInt16LE(i * 2);
      return pcm;
    }

    // Trop de demandes ou panne passagère : on réessaie, en patientant.
    if ((reponse.status === 429 || reponse.status >= 500) && essaiN < 4) {
      await attendre(1500 * essaiN);
      continue;
    }

    // Jamais le message d'OpenAI : il peut citer un morceau de la clé.
    let detail = '';
    try {
      const corps = await reponse.json();
      detail = [corps?.error?.type, corps?.error?.code].filter(Boolean).join(' / ');
    } catch { /* corps illisible : le code HTTP suffira */ }
    throw new Error(`OpenAI a répondu ${reponse.status}${detail ? ` (${detail})` : ''}`);
  }
  throw new Error('OpenAI ne répond pas après quatre essais');
}

// ------------------------------------------------ tout dire en français

/**
 * LES NOMBRES SONT DITS EN LETTRES — Camara, le 21/09/2026 : « la prof dit mal
 * les chiffres et nombres, et parfois elle les dit en anglais ». Le texte
 * envoyé pour une réponse était « 6 ? » : un chiffre nu, sans un mot de
 * français autour. Le modèle devinait la langue, et se trompait parfois.
 * « six ? » ne laisse plus rien à deviner.
 *
 * L'ÉCRAN GARDE LES CHIFFRES : seul le texte envoyé à la voix est converti.
 * Le manifeste, lui, garde le texte écrit — c'est lui que le test compare à
 * l'écran.
 */
const UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const DIZAINES = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

export function nombreEnLettres(n) {
  if (n < 20) return UNITES[n];
  if (n === 100) return 'cent';
  const d = Math.floor(n / 10);
  let u = n % 10;
  if (d === 7 || d === 9) u += 10; // soixante-dix, quatre-vingt-dix
  const base = DIZAINES[d];
  if (u === 0) return d === 8 ? 'quatre-vingts' : base;
  if (u === 1 && d !== 8 && d !== 9) return `${base} et un`;
  if (u === 11 && d === 7) return `${base} et onze`;
  return `${base}-${UNITES[u]}`;
}

/**
 * LE TEXTE ENVOYÉ À LA VOIX. Pour un élément de liste, sans le point
 * d'interrogation : derrière un nombre isolé, la voix le lisait parfois —
 * « dix point ». L'écran, lui, n'a jamais montré de point d'interrogation.
 */
/**
 * LES MOTS QUE LA VOIX LIT À L'ANGLAISE — Camara, le 22/09/2026 : dans la pêche
 * aux sons, « bus » sortait « beuss », et le son u ne s'entendait plus. La
 * voix d'OpenAI est anglophone d'origine : sur un mot seul qui existe aussi en
 * anglais, la consigne d'accent ne suffit pas. On lui fait donc lire une
 * orthographe qui ne peut se dire qu'en français. L'écran, lui, écrit toujours
 * le vrai mot : seul le son change.
 *
 * L'ÉCOUTE NE PEUT PAS LE VOIR : un « bus » anglais, Whisper l'écrit « bus »
 * aussi. Et sa détection de langue ne vaut rien sur un mot seul — mesurée le
 * 22/09/2026 sur les 135 mots des jeux, elle classait « chat », « poule » ou
 * « lapin » en anglais. Un mot mal dit se repère donc à l'oreille : l'ajouter
 * ici, et relancer le script (l'empreinte change, seul ce mot est refait).
 */
const PRONONCIATION = {
  bus: 'busse',
  rat: 'ra',
  // LES SYLLABES DE L'ATELIER (22/09/2026) : quand c'est possible, un vrai mot
  // français qui se dit exactement comme elles — c'est lui qui tient la voix
  // en français. L'étiquette, à l'écran, reste la syllabe.
  teau: 'tôt',
  deau: 'dos',
  ci: 'si',
  ca: 'ka',
  me: 'meu',
  o: 'ô',
  kan: 'quand',
  gou: 'goût',
  rou: 'roue',
  tou: 'tout',
  dou: 'doux',
  bou: 'bout',
  lan: 'lent',
  lon: 'long',
  tron: 'tronc',
  bin: 'bain',
  ban: 'banc',
  pon: 'pont',
  tan: 'temps',
  // Celles qui existent aussi en anglais — le 22/09/2026, « to » de « moto »
  // sortait « tou » : un mot français qui se dit pareil, pour toutes.
  to: 'tôt',
  do: 'dos',
  no: 'nos',
  mo: 'mot',
  lo: 'lot',
  po: 'pot',
  bo: 'beau',
  go: 'gô',
  ko: 'kô',
  ro: 'rô',
  jo: 'jô',
  ju: 'jus',
  du: 'dû',
  nu: 'nue',
  mi: 'mie',
  li: 'lit',
  di: 'dit',
  ni: 'nid',
  pi: 'pie',
  bi: 'bie',
  ki: 'qui',
  si: 'scie',
  pan: 'paon',
  pin: 'pain',
  ton: 'thon',
  mon: 'mont',
  non: 'nom',
  a: 'à',
  i: 'y',
  la: 'là',
  ra: 'ras',
  ba: 'bas',
  ta: 'tas',
  co: 'kô',
  // Vérifiées une à une le 22/09/2026 : aucun mot anglais ne s'écrit ainsi,
  // l'orthographe simple se lit forcément en français. Elles sont ici pour
  // que la garde des syllabes (plus bas) les sache tranchées.
  va: 'va',
  fa: 'fa',
  ma: 'ma',
  na: 'na',
  da: 'da',
  sa: 'sa',
  ga: 'ga',
  ka: 'ka',
  tra: 'tra',
  mou: 'mou',
  bon: 'bon',
  kon: 'kon',
};

/**
 * LA GARDE DES SYLLABES — Camara, le 22/09/2026, après « to » dit « tou » :
 * « fais bien les choses […] pour qu'on n'ait plus ce problème ». Une syllabe
 * seule bascule en anglais dès qu'elle ressemble à un mot anglais, et
 * l'écoute ne peut pas le voir. Toute syllabe doit donc soit porter un
 * accent (« vé », « pé » : forcément français), soit figurer dans
 * `PRONONCIATION`, où quelqu'un a tranché sa prononciation. Sinon, le script
 * refuse d'enregistrer, et dit laquelle ajouter.
 */
function verifierSyllabes(repliques) {
  const sans = repliques
    .filter((r) => r.syllabe && !(r.texte in PRONONCIATION) && !/[éèêëàâîïôûùç]/.test(r.texte))
    .map((r) => r.texte);
  if (sans.length > 0) {
    throw new Error(`Syllabes sans prononciation tranchée : ${[...new Set(sans)].join(', ')}. Les ajouter à PRONONCIATION.`);
  }
}

function texteDit(texte, liste) {
  const t = enFrancais(PRONONCIATION[texte] ?? texte);
  return liste ? t.replace(/\s*\?\s*$/, '') : t;
}

export function enFrancais(texte) {
  // « 3 480 » (la transcription sépare les milliers) se lit comme « 3480 ».
  return texte.replace(/(\d)[   ](\d{3})\b/g, '$1$2').replace(/\b(\d{1,4})\b(\s+(heure|bûchette|cube|biscuit)s?\b)?/g, (m, nombre, suite, mot) => {
    const n = Number(nombre);
    // AU-DELÀ DE CENT, LES CENTAINES DU CE1 — le 21/09/2026, « 342 » restait en
    // chiffres, et aucune prise du coffre ne pouvait être validée : la
    // transcription écrit « 342 », la comparaison ne lit que des lettres.
    // Jusqu'à cent, rien ne change : les voix déjà faites restent valables.
    if (n > 100) return centaines(n);
    // « une heure », « vingt et une bûchettes » : devant un mot féminin, tout
    // nombre qui finit par « un » se dit « une ».
    const feminin = mot === 'heure' || mot === 'bûchette';
    const lettres = feminin ? nombreEnLettres(n).replace(/\bun$/, 'une') : nombreEnLettres(n);
    return `${lettres}${suite ?? ''}`;
  });
}

/**
 * CHAQUE PRISE EST ÉCOUTÉE AVANT D'ÊTRE GARDÉE. Une transcription indique la
 * langue qu'elle entend : une prise où la voix a glissé vers l'anglais est
 * rejetée, et on en refait une autre. On vérifie aussi que les nombres dits
 * sont bien ceux du texte. C'est la seule garantie qui ne dépende pas d'une
 * consigne que le modèle peut ignorer.
 */
const normaliser = (t) => enFrancais(t)
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z ]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function versWav(pcm) {
  const t = Buffer.alloc(44 + pcm.length * 2);
  t.write('RIFF', 0); t.writeUInt32LE(36 + pcm.length * 2, 4); t.write('WAVE', 8);
  t.write('fmt ', 12); t.writeUInt32LE(16, 16); t.writeUInt16LE(1, 20); t.writeUInt16LE(1, 22);
  t.writeUInt32LE(FREQUENCE, 24); t.writeUInt32LE(FREQUENCE * 2, 28); t.writeUInt16LE(2, 32); t.writeUInt16LE(16, 34);
  t.write('data', 36); t.writeUInt32LE(pcm.length * 2, 40);
  for (let i = 0; i < pcm.length; i += 1) t.writeInt16LE(pcm[i], 44 + i * 2);
  return t;
}

async function ecouter(cleApi, pcm, langueImposee) {
  for (let essaiN = 1; essaiN <= 4; essaiN += 1) {
    const corps = new FormData();
    corps.append('file', new Blob([versWav(pcm)], { type: 'audio/wav' }), 'prise.wav');
    corps.append('model', 'whisper-1');
    corps.append('response_format', 'verbose_json');
    if (langueImposee) corps.append('language', langueImposee);
    const reponse = await appeler('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${cleApi}` }, body: corps,
    }, essaiN);
    if (reponse.ok) {
      const r = await reponse.json();
      return { langue: r.language, texte: r.text ?? '' };
    }
    if ((reponse.status === 429 || reponse.status >= 500) && essaiN < 4) {
      await attendre(1500 * essaiN);
      continue;
    }
    throw new Error(`Transcription refusée : ${reponse.status}`);
  }
  throw new Error('Transcription : pas de réponse');
}

/** Les nombres écrits en lettres d'un texte : ce qu'on doit entendre. */
function nombresAttendus(texte) {
  // La même conversion que le texte dit : au-delà de cent, `nombreEnLettres`
  // ne savait rien, et « 200 grammes » faisait planter la vérification.
  return (texte.match(/\b\d{1,4}\b/g) ?? []).map((n) => normaliser(enFrancais(n)));
}

/**
 * CE QUI EST DIT ET RIEN DE PLUS — Camara, le 21/09/2026 : « pourquoi elle dit
 * "vingt un", "dix point" ? ». La première vérification ne cherchait que le
 * bon nombre dans la transcription : « dix point » contenait bien « dix », et
 * passait. On compare maintenant la transcription ENTIÈRE au texte dit, mot
 * à mot : un mot ajouté, oublié ou changé rejette la prise. Une phrase
 * longue a droit à un mot d'écart — la transcription elle-même n'est pas
 * parfaite —, une phrase de quatre mots ou moins à aucun.
 */
function ecartEnMots(a, b) {
  const x = a.split(' ').filter(Boolean);
  const y = b.split(' ').filter(Boolean);
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= x.length; i += 1) {
    for (let j = 1; j <= y.length; j += 1) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
  }
  return { ecart: d[x.length][y.length], mots: y.length };
}

/**
 * LES MOTS ISOLÉS — le 21/09/2026, 31 mots d'Adrien sur 73 perdus : « pizza »,
 * « panda », « chat » dits seuls, la transcription ne sait pas en deviner la
 * langue, et répondait « italien » ou « anglais ». Pour une phrase d'un ou
 * deux mots, on IMPOSE le français à l'écoute et on ne garde que le contrôle
 * mot pour mot.
 *
 * ET LES HOMOPHONES : « ils » se dit comme « il », « est » comme « et ». Dit
 * seul, rien ne permet à la transcription de choisir, et elle écrit le plus
 * courant. Ces mots-là valent pour leurs jumeaux — mais seulement dans une
 * phrase courte : dans une phrase entière, le contexte tranche.
 */
const MOTS_COURTS = 2;
const JUMEAUX = [
  ['il', 'ils', 'ile'], ['et', 'est', 'e', 'eh', 'he', 'ai'], ['ces', 'ses', 'c est', 'sait', 'c es', 'ce', 'se', 'cest', 'sais'],
  ['sa', 'ca'], ['son', 'sont'], ['mes', 'mais', 'met', 'mai'], ['sans', 'cent', 'sang'],
  ['on', 'ont'], ['en', 'an'], ['au', 'eau', 'oh', 'o', 'haut'], ['du', 'du'], ['la', 'l a'],
  ['ma', 'm a'], ['tu', 'tue'], ['que', 'queue'], ['qui', 'qu il'], ['par', 'part'],
  ['pas', 'pa'], ['sur', 'sure'], ['sous', 'sou', 'soue'], ['puis', 'puits'],
  ['quand', 'quant', 'qu en', 'camp'], ['dans', 'dent', 'dents', 'd en'], ['lit', 'lie', 'li'],
  ['riz', 'ris', 'rie', 'ri', 'rit'], ['le', 'leu'], ['de', 'deux'], ['ne', 'nœud', 'noeud'], ['vous', 'vou'],
  ['nous', 'nou'], ['les', 'lait', 'laid'], ['plus', 'plu'], ['tente', 'tante'],
  ['main', 'mains', 'maint'], ['un', 'hein'], ['elle', 'aile'], ['sapin', 'sapins'],
  // « des » seul, Un ou des ? (21/09/2026) : l'écoute l'écrit « D. » ou « Dez ».
  // Pas « de » ni « day » : ce sont d'autres sons.
  ['des', 'd', 'dez'],
  // Les orthographes de `PRONONCIATION` : l'écoute écrit le vrai mot.
  ['busse', 'bus', 'buss'], ['ra', 'rat', 'rah'],
];
const jumeau = (t) => {
  const groupe = JUMEAUX.find((g) => g.includes(t));
  return groupe ? groupe[0] : t;
};

function priseValide(ecoute, texte, dit) {
  // « une » et « un » comptent pour le même nombre : « vingt et une
  // bûchettes » est juste. Sans ça, toute phrase au féminin était rejetée.
  const unifier = (t) => normaliser(t).replace(/\bune\b/g, 'un');
  const court = unifier(dit).split(' ').filter(Boolean).length <= MOTS_COURTS;
  if (court) {
    const valide = jumeau(normaliser(ecoute.texte)) === jumeau(normaliser(dit));
    if (!valide && process.env.VOIX_DEBUG) {
      console.log(`\n  rejet (court) : « ${texte} » entendu « ${ecoute.texte} »`);
    }
    return valide;
  }
  const entendu = unifier(ecoute.texte);
  const bonsNombres = nombresAttendus(texte).every((mots) => ` ${entendu} `.includes(` ${mots} `));
  const { ecart, mots } = ecartEnMots(entendu, unifier(dit));
  const fidele = ecart <= (mots <= 4 ? 0 : 1);
  const valide = ecoute.langue === 'french' && bonsNombres && fidele;
  if (!valide && process.env.VOIX_DEBUG) {
    console.log(`\n  rejet : « ${texte} » entendu « ${ecoute.texte} » (${ecoute.langue})`);
  }
  return valide;
}

/**
 * LE DERNIER RECOURS D'UNE PHRASE — le 22/09/2026, 22 phrases sur 386 étaient
 * rejetées douze fois de suite alors que la voix disait juste : l'écoute
 * écrivait « x10 » pour « fois dix », « l'heure » pour « leur », « l'air » pour
 * « l'aire », « était » pour « étaient ». Ce sont des homophones et des
 * graphies, pas des fautes de voix. Quand AUCUNE prise n'est parfaite, on
 * accepte donc une prise reconnue comme FRANÇAISE, aux nombres justes, dont
 * l'écart reste minime : deux mots au plus, ou un quart de la phrase. Les
 * phrases courtes (`MOTS_COURTS`) n'y ont pas droit : un mot de travers y
 * change tout.
 *
 * LA PHRASE EST COMPARÉE À L'OREILLE (`aLOreille`) : « c est » recollé,
 * chaque homophone connu ramené à sa forme de référence (`JUMEAUX`), et les
 * finales muettes retirées — « ils chantaient » s'entend « il chantait ».
 */
const aLOreille = (t) => t.replace(/\bc est\b/g, 'ces').replace(/\bl heures?\b/g, 'leur')
  .split(' ').filter(Boolean)
  .map((m) => jumeau(m).replace(/(ent|s|x|t)$/, ''))
  .join(' ');

function priseTolerable(ecoute, texte, dit) {
  const unifier = (t) => aLOreille(normaliser(t).replace(/\bune\b/g, 'un'));
  if (unifier(dit).split(' ').filter(Boolean).length <= MOTS_COURTS) return false;
  // « x10 » : l'écoute écrit le signe fois.
  const entendu = unifier(ecoute.texte.replace(/\bx\s?(\d)/gi, 'fois $1'));
  const bonsNombres = nombresAttendus(texte).every((mots) => ` ${entendu} `.includes(` ${aLOreille(mots)} `));
  const { ecart, mots } = ecartEnMots(entendu, unifier(dit));
  return ecoute.langue === 'french' && bonsNombres && ecart <= Math.max(2, Math.floor(mots / 4));
}

/**
 * Une phrase enregistrée : des prises françaises, la plus fluide, resserrée,
 * en MP3. Au-delà de trois fois le nombre de prises voulu sans en trouver
 * une seule française, on s'arrête et on le dit : mieux vaut une phrase
 * manquante, signalée, qu'une phrase en anglais dans un jeu de CP.
 */
/**
 * UN MOT NASAL DIT SEUL SORT DE TRAVERS — le 21/09/2026, « dans » donnait
 * « d'oh » vingt-quatre fois sur vingt-quatre, « main » donnait « Maine » :
 * sans contexte, la voix de synthèse ne sait pas que c'est du français.
 * « Le mot dans », en revanche, est dit juste à tous les coups.
 *
 * ON FAIT DONC DIRE LA PHRASE, ET ON GARDE LE MOT. La transcription donne
 * l'instant où chaque mot commence ; on coupe tout ce qui précède le mot
 * voulu. Puis ON RÉÉCOUTE LE MORCEAU COUPÉ : s'il n'est pas reconnu comme le
 * bon mot, il est rejeté comme n'importe quelle prise.
 *
 * CE N'EST PLUS UN SECOURS, C'EST LA RÈGLE — Camara, le 22/09/2026 : « bus »
 * sortait « beuss », puis « main » à l'anglaise : « le prof de français doit
 * lire tous les mots en français ». Jusque-là, la phrase porteuse ne servait
 * qu'aux mots dont TOUTES les prises seules avaient été rejetées. Mais un mot
 * dit à l'anglaise n'est pas rejeté : Whisper écrit « main » et « bus » dans
 * les deux langues. Le défaut passait donc sans jamais déclencher le secours.
 * Désormais, TOUT MOT DIT SEUL est enregistré dans sa phrase française puis
 * découpé : c'est le contexte qui tient la voix en français, pas la consigne.
 *
 * Un article (« une dent ») aurait été plus simple, mais dans la pêche aux
 * sons il ferait entendre un son de plus — le « u » de « une ».
 */
/**
 * L'échantillon où couper, entre deux mots : le MILIEU du plus long silence
 * de la fenêtre [de, a] (en secondes). Le silence est ce qui reste 40 dB sous
 * le pic de toute la prise. Faute de silence, la trame la plus calme.
 */
function milieuDuSilence(pcm, de, a) {
  const { parle } = mesurer(pcm, 40);
  const t0 = Math.max(0, Math.floor(de * 100));
  const t1 = Math.min(parle.length - 1, Math.ceil(a * 100));
  let meilleur = null;
  for (let t = t0; t <= t1; t += 1) {
    if (parle[t]) continue;
    let j = t;
    while (j <= t1 && !parle[j]) j += 1;
    if (!meilleur || j - t > meilleur[1] - meilleur[0]) meilleur = [t, j];
    t = j;
  }
  if (meilleur) return Math.round((meilleur[0] + meilleur[1]) / 2) * TRAME;
  let calme = t0;
  let plusBas = Infinity;
  for (let t = t0; t <= t1; t += 1) {
    let e = 0;
    for (let k = t * TRAME; k < (t + 1) * TRAME && k < pcm.length; k += 1) e += pcm[k] * pcm[k];
    if (e < plusBas) { plusBas = e; calme = t; }
  }
  return calme * TRAME;
}

const unSeulMot = (dit) => normaliser(dit).split(' ').filter(Boolean).length === 1;

/**
 * `syllabe` — Camara, le 22/09/2026 : l'atelier des syllabes fait entendre
 * chaque syllabe. Une syllabe n'est pas un mot : l'écoute écrit « teau »
 * « tôt », « deau » « do », « gou » « goût », et ne la reconnaîtrait jamais.
 * On n'exige donc que la forme de la phrase — « bien », puis quelque chose,
 * puis « voilà » — pour couper proprement, sans comparer ce qui est entendu.
 * Ce qui garantit le son, c'est l'orthographe dite (`PRONONCIATION`).
 */
async function motDansUnePhrase(cleApi, voix, dit, combien = 2, syllabe = false) {
  const voulu = jumeau(normaliser(dit));
  const gardees = [];
  const probables = [];

  for (let essai = 0; gardees.length < combien && essai < combien * 6; essai += 1) {
    // LE MOT EST UNE PHRASE À LUI SEUL, ENTRE DEUX PHRASES — Camara, le
    // 22/09/2026 : « énormément de mots sont coupés ». Dans « Le mot « cochon » »,
    // la voix enchaînait sans respirer, et toute coupe tombait dans la parole.
    // Les points forcent une respiration avant et après le mot ; les phrases
    // autour gardent la prononciation française. On coupe au milieu de chaque
    // silence.
    const pcm = await unePrise(cleApi, voix, `Écoute bien. ${dit}. Voilà.`);
    const { mots } = await ecouterMots(cleApi, pcm);
    const i = mots.findIndex((m) => normaliser(m.word) === 'bien');
    // TOUT CE QUI EST DIT ENTRE « bien » ET « voilà » : « ses » est transcrit
    // « C est », en deux mots — on les recolle avant de comparer.
    const apres = i >= 0 ? mots.slice(i + 1).filter((m) => normaliser(m.word) !== '') : [];
    const iVoila = apres.findIndex((m) => /^voil/.test(normaliser(m.word)));
    const dits = iVoila >= 0 ? apres.slice(0, iVoila) : apres;
    const cible = dits.length > 0 ? { start: dits[0].start, end: dits[dits.length - 1].end } : null;
    const suivant = iVoila >= 0 ? apres[iVoila] : null;
    const entendu = jumeau(normaliser(dits.map((m) => m.word).join(' ')));
    const reconnu = entendu === voulu || jumeau(normaliser(dits.map((m) => m.word).join(''))) === voulu;
    if (!cible || (syllabe ? !suivant : !reconnu)) {
      if (process.env.VOIX_DEBUG) console.log(`
  secours : phrase entendue « ${mots.map((m) => m.word).join(' ')} »`);
      statistiques.rejetees += 1;
      continue;
    }

    const debut = milieuDuSilence(pcm, (i >= 0 ? mots[i].end : cible.start - 0.5) - 0.05, cible.start + 0.05);
    const fin = suivant
      ? milieuDuSilence(pcm, cible.end - 0.05, suivant.start + 0.05)
      : pcm.length;
    const morceau = pcm.slice(debut, fin);
    if (syllabe) {
      gardees.push(morceau);
      continue;
    }
    const reecoute = await ecouter(cleApi, morceau, 'fr');
    if (jumeau(normaliser(reecoute.texte)) === voulu) gardees.push(morceau);
    else {
      // Un morceau d'un quart de seconde se transcrit mal, même bien dit : la
      // phrase entière, elle, a été validée. On le garde en réserve.
      probables.push(morceau);
      if (process.env.VOIX_DEBUG) console.log(`
  secours : morceau coupé entendu « ${reecoute.texte} »`);
      statistiques.rejetees += 1;
    }
  }

  // EN DERNIER RECOURS SEULEMENT, les morceaux dont la réécoute seule a
  // échoué — le 21/09/2026, « elle », « quand », « en », « du » ne passaient
  // jamais autrement.
  return gardees.length > 0 ? gardees : probables.slice(0, 2);
}

/** La transcription, avec l'instant où commence chaque mot. */
async function ecouterMots(cleApi, pcm) {
  for (let essaiN = 1; essaiN <= 4; essaiN += 1) {
    const corps = new FormData();
    corps.append('file', new Blob([versWav(pcm)], { type: 'audio/wav' }), 'prise.wav');
    corps.append('model', 'whisper-1');
    corps.append('response_format', 'verbose_json');
    corps.append('language', 'fr');
    corps.append('timestamp_granularities[]', 'word');
    const reponse = await appeler('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${cleApi}` }, body: corps,
    }, essaiN);
    if (reponse.ok) {
      const r = await reponse.json();
      return { texte: r.text ?? '', mots: r.words ?? [] };
    }
    if ((reponse.status === 429 || reponse.status >= 500) && essaiN < 4) {
      await attendre(1500 * essaiN);
      continue;
    }
    throw new Error(`Transcription refusée : ${reponse.status}`);
  }
  throw new Error('Transcription : pas de réponse');
}

async function enregistrer(cleApi, voix, texte, cleReplique, liste, syllabe) {
  // Deux fois plus de prises pour un élément de liste : on cherche une durée
  // précise, pas seulement la plus courte, et le hasard a besoin de place.
  const combien = liste ? PRISES * 2 : PRISES;
  const dit = texteDit(texte, liste);
  const feminine = VOIX_FEMININES.has(voix);
  const prises = [];
  const tolerables = [];
  // Des prises justes, mais dites trop bas : gardées de côté plutôt que
  // jetées — mieux vaut une voix grave que pas de son du tout.
  const graves = [];
  let rejetees = 0;

  // UN MOT SEUL PASSE TOUJOURS PAR SA PHRASE PORTEUSE — voir `motDansUnePhrase`.
  if (unSeulMot(dit)) {
    const dansUnePhrase = await motDansUnePhrase(cleApi, voix, dit, 2, syllabe);
    const claires = dansUnePhrase.filter((p) => !sonneMasculin(p, feminine));
    prises.push(...(claires.length > 0 ? claires : dansUnePhrase));
    if (claires.length === 0 && dansUnePhrase.length > 0) statistiques.graves.push(cleReplique);
    if (prises.length === 0) throw new Error('aucune prise en français dans sa phrase porteuse');
    const choisie = liste ? priseReguliere(prises) : meilleurePrise(prises);
    return versMp3(resserrer(choisie, estReaction(cleReplique), true));
  }

  for (let essai = 0; prises.length < combien && essai < combien * 3; essai += 1) {
    const pcm = await unePrise(cleApi, voix, dit);
    const court = normaliser(dit).split(' ').filter(Boolean).length <= MOTS_COURTS;
    const ecoute = await ecouter(cleApi, pcm, court ? 'fr' : null);
    const bas = sonneMasculin(pcm, feminine);
    if (priseValide(ecoute, texte, dit)) (bas ? graves : prises).push(pcm);
    else if (priseTolerable(ecoute, texte, dit)) tolerables.push(pcm);
    else rejetees += 1;
  }

  // Aucune prise parfaite : le dernier recours, voir `priseTolerable`.
  // LES GRAVES PASSENT AVANT LES TOLÉRABLES : une phrase juste dite un peu
  // bas vaut mieux qu'une phrase dont le texte lui-même n'est pas sûr.
  if (prises.length === 0 && graves.length > 0) {
    // Aucune prise claire : on prend les graves, et on le dit — c'est à
    // réécouter à la main.
    prises.push(...graves);
    statistiques.graves.push(cleReplique);
  } else if (graves.length > 0) {
    statistiques.basses += graves.length;
  }
  if (prises.length === 0) prises.push(...tolerables);
  if (prises.length === 0) throw new Error(`aucune prise en français sur ${rejetees + tolerables.length}`);
  if (rejetees > 0) statistiques.rejetees += rejetees;
  const choisie = liste ? priseReguliere(prises) : meilleurePrise(prises);
  return versMp3(resserrer(choisie, estReaction(cleReplique)));
}

// `graves` porte les CLÉS et non un compte : une réplique qui n'a eu que des
// prises basses est à réécouter, et on ne la retrouve pas sans son nom.
const statistiques = { rejetees: 0, basses: 0, graves: [] };

// ------------------------------------------------------------------------

const inventaire = toutesLesRepliques();
Object.values(inventaire).forEach(verifierSyllabes);
const manifeste = lireManifeste();
const aFaire = [];

for (const [professeur, repliques] of Object.entries(inventaire)) {
  if (!VOIX[professeur]) throw new Error(`Pas de voix connue pour « ${professeur} » : l'ajouter à VOIX.`);
  const connues = manifeste.professeurs?.[professeur]?.repliques ?? {};

  for (const {
    cle, texte, liste, syllabe,
  } of repliques) {
    const fichier = path.join(DOSSIER, professeur, `${cle}.mp3`);
    const e = empreinte(professeur, texte, liste, syllabe);
    const aJour = connues[cle]?.empreinte === e && fs.existsSync(fichier);
    const retenue = !seulement || `${professeur}/${cle}`.startsWith(seulement) || cle.startsWith(seulement);
    if ((!aJour || (refaire && seulement)) && retenue && (!motsSeuls || unSeulMot(texteDit(texte, liste)))) aFaire.push({
      professeur, cle, texte, liste, syllabe, fichier, empreinte: e,
    });
  }
}

const caracteres = aFaire.reduce((s, r) => s + r.texte.length, 0);
console.log(`${aFaire.length} phrase(s) à enregistrer, ${caracteres} caractères.`);

if (essai) {
  aFaire.forEach((r) => console.log(`  ${r.professeur}/${r.cle} — ${r.texte}`));
  console.log('Essai : rien n’a été envoyé.');
  process.exit(0);
}

const cle = aFaire.length > 0 ? lireCle() : null;
let faites = 0;
const echecs = [];

// QUATRE À LA FOIS : assez pour finir en une minute, pas assez pour se faire
// refuser par la limite de débit du compte.
const file = [...aFaire];
async function ouvrier() {
  while (file.length > 0) {
    const r = file.shift();
    try {
      const audio = await enregistrer(cle, VOIX[r.professeur], r.texte, r.cle, r.liste, r.syllabe);
      fs.mkdirSync(path.dirname(r.fichier), { recursive: true });
      fs.writeFileSync(r.fichier, audio);

      manifeste.professeurs[r.professeur] ??= { voix: VOIX[r.professeur], repliques: {} };
      manifeste.professeurs[r.professeur].repliques[r.cle] = { texte: r.texte, empreinte: r.empreinte };
      faites += 1;
      // LE MANIFESTE EST ÉCRIT À CHAQUE PHRASE : le 21/09/2026, un enregistrement
      // interrompu avait laissé 42 fichiers que le manifeste ignorait.
      fs.writeFileSync(MANIFESTE, `${JSON.stringify(manifeste, null, 2)}\n`);
      process.stdout.write(`\r${faites}/${aFaire.length}`);
    } catch (erreur) {
      echecs.push(`${r.professeur}/${r.cle} : ${erreur.message}`);
    }
  }
}

await Promise.all([ouvrier(), ouvrier(), ouvrier(), ouvrier()]);

// Le manifeste est réécrit même après des échecs : ce qui a réussi est
// gardé, et seul ce qui a échoué sera retenté au prochain lancement.
manifeste.modele = MODELE;
fs.mkdirSync(DOSSIER, { recursive: true });
fs.writeFileSync(MANIFESTE, `${JSON.stringify(manifeste, null, 2)}\n`);

console.log(`\n${faites} enregistrée(s).`);
console.log(`${statistiques.rejetees} prise(s) rejetée(s) à l'écoute : langue ou nombre entendus faux.`);
console.log(`${statistiques.basses} prise(s) écartée(s) pour voix trop grave (seuil ${HAUTEUR_MINIMALE} Hz).`);
if (statistiques.graves.length > 0) {
  console.log(`${statistiques.graves.length} réplique(s) n'ont eu QUE des prises graves, à réécouter :`);
  statistiques.graves.forEach((c) => console.log(`  ${c}   (refaire : --refaire --seulement ${c})`));
}
if (echecs.length > 0) {
  console.log(`${echecs.length} échec(s) :`);
  echecs.forEach((e) => console.log(`  ${e}`));
  process.exit(1);
}
