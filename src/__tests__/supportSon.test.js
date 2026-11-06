import {
  copieSonAttendue,
  demandeSupportSon,
  marquerPhotoDesSons,
  marquerSonAuCahier,
  marquerSonAuClavier,
  marquerSupportSon,
  retirerMarqueurSupportSon,
  SON_CAHIER,
  SON_CLAVIER,
  supportSonChoisi,
} from '../lib/storage/supportSon';
import { supportEcritChoisi } from '../lib/storage/supportEcrit';

const prof = (contenu) => ({ role: 'assistant', contenu });
const eleve = (contenu, extra = {}) => ({ role: 'user', contenu, ...extra });
const question = prof('D’accord !\n[SUPPORT_SON]');

describe('la fenêtre de choix de l’exercice où l’enfant écrit le son', () => {
  test('la balise ouvre la carte', () => {
    expect(demandeSupportSon('[SUPPORT_SON]')).toBe(true);
    expect(demandeSupportSon('Écris le son.')).toBe(false);
    expect(supportSonChoisi([question])).toBeNull();
  });

  test('sans question, pas de carte', () => {
    expect(supportSonChoisi([prof('[ARDOISE] coin [/ARDOISE] Lis ce mot.')])).toBeUndefined();
  });

  test('le clic ferme la carte et donne le support', () => {
    expect(supportSonChoisi([question, eleve(marquerSupportSon('', SON_CAHIER))])).toBe(SON_CAHIER);
    expect(supportSonChoisi([question, eleve(marquerSupportSon('', SON_CLAVIER))])).toBe(SON_CLAVIER);
  });

  test('la réponse dite à voix haute vaut le clic', () => {
    expect(supportSonChoisi([question, eleve('Sur mon cahier.')])).toBe(SON_CAHIER);
    expect(supportSonChoisi([question, eleve('Au clavier.')])).toBe(SON_CLAVIER);
  });

  test('une réponse qui ne tranche pas laisse la carte ouverte', () => {
    expect(supportSonChoisi([question, eleve('Je sais pas.')])).toBeNull();
  });

  test('une nouvelle série repose la question', () => {
    expect(supportSonChoisi([question, eleve(marquerSupportSon('', SON_CAHIER)), question])).toBeNull();
  });

  test('elle ne rouvre pas la carte du texte à rédiger', () => {
    expect(supportEcritChoisi([question])).toBeUndefined();
  });

  test('les balises de voix et le tableau ne referment rien', () => {
    expect(supportSonChoisi([question, prof('[FR]ou[/FR]')])).toBeNull();
  });
});

describe('le clavier reste choisi pendant la série', () => {
  test('les tours suivants gardent le support', () => {
    const fil = [question, eleve(marquerSupportSon('', SON_CLAVIER)), prof('[FR]chat[/FR]'), eleve(marquerSonAuClavier('Quoi ?', { auMicro: true }))];
    expect(supportSonChoisi(fil)).toBe(SON_CLAVIER);
  });

  test('la fin de séance referme tout : la séance suivante repose la question', () => {
    const fil = [question, eleve(marquerSupportSon('', SON_CLAVIER)), prof('Bravo ! [FIN_SEANCE]')];
    expect(supportSonChoisi(fil)).toBeUndefined();
  });
});

describe('le panneau « Ta copie »', () => {
  const cahier = eleve(marquerSupportSon('', SON_CAHIER));

  test('s’ouvre sur le choix du cahier', () => {
    expect(copieSonAttendue([question, cahier])).toBe(true);
  });

  test('ne s’ouvre pas au clavier', () => {
    expect(copieSonAttendue([question, eleve(marquerSupportSon('', SON_CLAVIER))])).toBe(false);
  });

  test('reste ouvert pendant la série, jusqu’à « j’ai fini » compris', () => {
    expect(copieSonAttendue([question, cahier, prof('[FR]ou[/FR]'), eleve(marquerSonAuCahier('J’ai fini.'))])).toBe(true);
    expect(copieSonAttendue([question, cahier, prof('[FR]ou[/FR]'), eleve('Oui.')])).toBe(true);
  });

  test('se referme à la photo', () => {
    const photo = eleve(marquerPhotoDesSons(''), { piecesJointes: [{ id: 1 }] });
    expect(copieSonAttendue([question, cahier, prof('[FR]ou[/FR]'), photo])).toBe(false);
    expect(copieSonAttendue([question, cahier, photo, prof('Bravo !')])).toBe(false);
  });

  test('se referme quand la question est reposée', () => {
    expect(copieSonAttendue([question, cahier, question])).toBe(false);
  });

  test('sans exercice, rien', () => {
    expect(copieSonAttendue([prof('Bonjour'), eleve('Bonjour')])).toBe(false);
    expect(copieSonAttendue([])).toBe(false);
  });
});

describe('l’affichage', () => {
  test('l’enfant ne voit jamais le fait donné au professeur', () => {
    expect(retirerMarqueurSupportSon(marquerSupportSon('', SON_CAHIER))).toBe('J’écris sur mon cahier.');
    expect(retirerMarqueurSupportSon(marquerSupportSon('', SON_CLAVIER))).toBe('J’écris au clavier.');
    expect(retirerMarqueurSupportSon(marquerSonAuCahier('J’ai fini.'))).toBe('J’ai fini.');
    expect(retirerMarqueurSupportSon(marquerPhotoDesSons(''))).toBe('');
  });

  test('ni le fait du clavier, tapé ou dit au micro', () => {
    expect(retirerMarqueurSupportSon(marquerSonAuClavier('chat'))).toBe('chat');
    expect(retirerMarqueurSupportSon(marquerSonAuClavier('Quoi ?', { auMicro: true }))).toBe('Quoi ?');
  });

  test('le fait dit d’où vient le message', () => {
    expect(marquerSonAuClavier('chat', { auMicro: true })).toContain('VIENT DU MICRO');
    expect(marquerSonAuClavier('chat')).toContain('EST TAPÉ');
  });

  test('ni la balise', () => {
    expect(retirerMarqueurSupportSon('D’accord !\n[SUPPORT_SON]')).toBe('D’accord !');
  });
});
