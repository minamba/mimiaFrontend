/**
 * ON N'ENVOIE PAS UNE PHRASE DONT LA FIN EST ENCORE EN ROUTE.
 *
 * Relevé par Camara le 13/09/2026 : « j'ai parlé trente secondes, j'ai vu mes
 * paroles s'écrire et s'effacer, et il a envoyé un bout de phrase alors que
 * j'avais fait toute une justification ». Parti : « Alors, comme D appartient
 * à AB et E à ».
 *
 * Le délai d'assemblage partait au silence, alors que le morceau qui venait
 * d'être dit n'était pas encore transcrit. Il expirait avant son retour : le
 * chat envoyait ce qu'il avait et vidait le champ.
 */

import {
  doitAttendreAvantEnvoi, ATTENTE_TRANSCRIPTION_MAX_MS,
} from '../lib/storage/tourEleve';

test('un morceau encore en route vers sa transcription retient l’envoi', () => {
  expect(doitAttendreAvantEnvoi({ parle: false, transcriptionEnCours: true, attenteMs: 1400 }))
    .toBe(true);
});

test('un élève qui parle encore retient l’envoi', () => {
  expect(doitAttendreAvantEnvoi({ parle: true, transcriptionEnCours: false })).toBe(true);
});

test('tout est transcrit et il s’est tu : on envoie', () => {
  expect(doitAttendreAvantEnvoi({ parle: false, transcriptionEnCours: false, attenteMs: 150 }))
    .toBe(false);
});

/**
 * UN PLAFOND, ET IL EST VOULU. Une transcription qui ne revient jamais — une
 * liaison morte que le chien de garde n'aurait pas encore remplacée — ne doit
 * pas bloquer l'envoi pour toujours : l'enfant attendrait une réponse qui ne
 * partira jamais.
 */
test('au-delà du plafond, on envoie même si une transcription manque', () => {
  expect(doitAttendreAvantEnvoi({
    parle: false,
    transcriptionEnCours: true,
    attenteMs: ATTENTE_TRANSCRIPTION_MAX_MS,
  })).toBe(false);
});

test('le moteur du navigateur, qui ne sait rien de ses transcriptions, n’est pas retenu', () => {
  // `transcriptionEnCours` n'existe pas sur le moteur de repli : l'appel
  // facultatif rend `undefined`, et le comportement d'avant est gardé.
  expect(doitAttendreAvantEnvoi({ parle: undefined, transcriptionEnCours: undefined }))
    .toBe(false);
});
