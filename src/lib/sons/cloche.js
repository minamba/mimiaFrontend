/**
 * LA PETITE CLOCHE DES NOTIFICATIONS — Camara, le 19/10/2026 : « un petit son
 * qui va avec, genre une petite cloche ».
 *
 * DESSINÉE, PAS ENREGISTRÉE : quelques sinusoïdes aux rapports d'une vraie
 * cloche (1 ; 2 ; 2,76 ; 5,4), chacune qui s'éteint à son rythme. Aucun
 * fichier à charger, et le son part à la milliseconde où le message arrive.
 *
 * UN NAVIGATEUR NE JOUE RIEN AVANT UN PREMIER GESTE sur la page (règle
 * anti-lecture automatique). `preparerCloche` installe l'écoute de ce geste et
 * réveille le moteur à ce moment-là ; avant, `sonnerCloche` se tait.
 */
let contexte = null;
let preparee = false;

function moteur() {
  if (contexte) return contexte;
  const Classe = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
  if (!Classe) return null;
  try {
    contexte = new Classe();
  } catch {
    contexte = null;
  }
  return contexte;
}

/** À appeler une fois : le premier clic ou la première touche réveille le son. */
export function preparerCloche() {
  if (preparee || typeof window === 'undefined') return;
  preparee = true;
  const reveiller = () => {
    const c = moteur();
    if (c?.state === 'suspended') c.resume().catch(() => {});
    ['pointerdown', 'keydown', 'touchstart'].forEach((g) => window.removeEventListener(g, reveiller, true));
  };
  ['pointerdown', 'keydown', 'touchstart'].forEach((g) => window.addEventListener(g, reveiller, true));
}

/** Un « ding » doux, d'une seconde et demie. */
export function sonnerCloche(volume = 0.16) {
  const c = moteur();
  if (!c || c.state !== 'running') return;

  const debut = c.currentTime + 0.01;
  const sortie = c.createGain();
  sortie.gain.value = volume;
  sortie.connect(c.destination);

  // [rapport à la fondamentale, force, durée de résonance en secondes]
  const partiels = [[1, 1, 1.6], [2, 0.45, 1.1], [2.76, 0.3, 0.8], [5.4, 0.12, 0.4]];
  const fondamentale = 1318.5; // un mi aigu : clair, jamais strident

  partiels.forEach(([rapport, force, duree]) => {
    const oscillateur = c.createOscillator();
    oscillateur.type = 'sine';
    oscillateur.frequency.value = fondamentale * rapport;

    const enveloppe = c.createGain();
    enveloppe.gain.setValueAtTime(0.0001, debut);
    enveloppe.gain.exponentialRampToValueAtTime(force, debut + 0.006);
    enveloppe.gain.exponentialRampToValueAtTime(0.0001, debut + duree);

    oscillateur.connect(enveloppe);
    enveloppe.connect(sortie);
    oscillateur.start(debut);
    oscillateur.stop(debut + duree + 0.05);
  });
}
