/**
 * L'ÉPISODE EN MP3, FABRIQUÉ DANS LE NAVIGATEUR — Camara, le 15/11/2026 : « un bouton pour télécharger l'audio en
 * MP3 ». Le serveur range l'épisode en Ogg Opus (léger, fait pour la voix) et sait le rendre en WAV ; le MP3 se fait
 * ici, avec un encodeur en JavaScript pur (`@breezystack/lamejs`, chargé seulement au premier clic). Rien de natif à
 * installer dans le conteneur, et le serveur ne travaille pas pour un fichier que personne ne télécharge.
 *
 * 64 kbit/s en mono : la voix reste nette, une minute ≈ 480 Ko.
 */
const DEBIT = 64;
const BLOC = 1152;
// Tous les 60 blocs (≈ 3 s d'audio, quelques dizaines de millisecondes de calcul), la page reprend la main : un
// podcast de quarante minutes s'encode sans figer l'écran.
const BLOCS_PAR_SOUFFLE = 60;

const souffle = () => new Promise((fin) => { setTimeout(fin, 0); });

/** L'encodeur, chargé au premier besoin. Selon l'outil qui assemble le code, il arrive seul ou sous `default`. */
async function chargerEncodeur() {
  const lame = await import('@breezystack/lamejs');
  return lame.Mp3Encoder ?? lame.default?.Mp3Encoder;
}

/** Les échantillons et la fréquence d'un WAV PCM 16 bits mono (celui que rend le serveur). */
export function lireWav(octets) {
  const vue = new DataView(octets);
  const texte = (debut) => String.fromCharCode(...new Uint8Array(octets, debut, 4));
  if (octets.byteLength < 44 || texte(0) !== 'RIFF' || texte(8) !== 'WAVE') throw new Error('WAV illisible');

  let frequence = 24000;
  let position = 12;
  while (position + 8 <= octets.byteLength) {
    const id = texte(position);
    const taille = vue.getUint32(position + 4, true);
    if (id === 'fmt ') frequence = vue.getUint32(position + 12, true);
    if (id === 'data') {
      const fin = Math.min(octets.byteLength, position + 8 + taille);
      const debut = position + 8;
      const echantillons = new Int16Array(octets.slice(debut, debut + (Math.floor((fin - debut) / 2) * 2)));
      return { frequence, echantillons };
    }
    position += 8 + taille + (taille % 2);
  }
  throw new Error('WAV sans données');
}

/** Le WAV de l'épisode → un Blob MP3. */
export async function wavEnMp3(blobWav) {
  const { frequence, echantillons } = lireWav(await blobWav.arrayBuffer());
  const Mp3Encoder = await chargerEncodeur();
  const encodeur = new Mp3Encoder(1, frequence, DEBIT);

  const morceaux = [];
  for (let i = 0, n = 0; i < echantillons.length; i += BLOC, n += 1) {
    if (n > 0 && n % BLOCS_PAR_SOUFFLE === 0) await souffle(); // eslint-disable-line no-await-in-loop
    const sortie = encodeur.encodeBuffer(echantillons.subarray(i, i + BLOC));
    if (sortie.length > 0) morceaux.push(new Uint8Array(sortie));
  }
  const fin = encodeur.flush();
  if (fin.length > 0) morceaux.push(new Uint8Array(fin));

  return new Blob(morceaux, { type: 'audio/mpeg' });
}

/**
 * TOUS LES ÉPISODES DANS UN SEUL MP3 — Camara, le 15/11/2026 : « fusionner tous les audios pour n'en avoir qu'un seul
 * à télécharger, comme ça l'enfant peut tout écouter dans le même audio ». Un seul encodeur, nourri épisode après
 * épisode (le WAV d'un épisode est lâché dès qu'il est encodé : un podcast de quarante minutes tient dans la mémoire
 * d'un téléphone), avec un silence entre deux épisodes pour qu'on entende le passage.
 *
 * `const f = creerFusion(); await f.ajouter(blobWav); … ; const mp3 = f.finir();`
 */
export const SILENCE_ENTRE_EPISODES = 1.5;

export function creerFusion(silence = SILENCE_ENTRE_EPISODES) {
  let encodeur = null;
  let frequence = null;
  let episodes = 0;
  const morceaux = [];

  const encoder = async (echantillons) => {
    for (let i = 0, n = 0; i < echantillons.length; i += BLOC, n += 1) {
      if (n > 0 && n % BLOCS_PAR_SOUFFLE === 0) await souffle(); // eslint-disable-line no-await-in-loop
      const sortie = encodeur.encodeBuffer(echantillons.subarray(i, i + BLOC));
      if (sortie.length > 0) morceaux.push(new Uint8Array(sortie));
    }
  };

  return {
    async ajouter(blobWav) {
      const wav = lireWav(await blobWav.arrayBuffer());
      if (!encodeur) {
        const Mp3Encoder = await chargerEncodeur();
        frequence = wav.frequence;
        encodeur = new Mp3Encoder(1, frequence, DEBIT);
      } else if (wav.frequence !== frequence) {
        throw new Error('Épisodes à des fréquences différentes');
      }
      if (episodes > 0) await encoder(new Int16Array(Math.round(frequence * silence)));
      await encoder(wav.echantillons);
      episodes += 1;
    },

    finir() {
      if (!encodeur) throw new Error('Aucun épisode');
      const fin = encodeur.flush();
      if (fin.length > 0) morceaux.push(new Uint8Array(fin));
      return new Blob(morceaux, { type: 'audio/mpeg' });
    },
  };
}

/** « Le monument aux morts du village » → « le-monument-aux-morts-du-village.mp3 ». */
export function nomDuFichier(titre, rang, extension = 'mp3') {
  const base = (titre ?? 'episode')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'episode';
  return `${rang ? `${String(rang).padStart(2, '0')}-` : ''}${base}.${extension}`;
}

/**
 * TOUS LES ÉPISODES DANS UN SEUL FICHIER — Camara, le 15/11/2026 : « un bouton “Tout télécharger” ». Un ZIP des MP3,
 * chacun gardant son nom et son numéro. Rangés sans compression : un MP3 est déjà compressé, le ZIP se fait d'un coup.
 * `fichiers` : [{ nom, blob }].
 */
export async function enZip(fichiers) {
  const { zipSync } = await import('fflate');
  const entrees = {};
  for (const { nom, blob } of fichiers) {
    let unique = nom;
    for (let i = 2; entrees[unique]; i += 1) unique = nom.replace(/\.mp3$/, `-${i}.mp3`);
    // eslint-disable-next-line no-await-in-loop
    entrees[unique] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
  }
  return new Blob([zipSync(entrees)], { type: 'application/zip' });
}

/** Propose le fichier au navigateur, comme un lien de téléchargement. */
export function proposer(blob, nom) {
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
