import { dureeEscape } from './college/chrono.js';

/**
 * CE QUE LES ESCAPE GAMES LISENT EN PLUS DE LEURS PHRASES — Camara, le
 * 09/10/2026 : « que les textes soient lus : la consigne "tu as 5 minutes…",
 * le texte sous le titre », et le récit de chaque cadenas. Ces textes vivent
 * dans les données des histoires, pas dans leurs PHRASES : ce fichier leur
 * donne une clé d'enregistrement, la même pour l'écran et pour le script des
 * voix (`scripts/voix-jeux.mjs`, via `repliques.js`).
 *
 * PAS LES QUESTIONS NI LES RÉPONSES : 3 500 textes de plus (≈ 50 $), écartés
 * par Camara le même jour. Pas non plus les récits FABRIQUÉS AU HASARD (des
 * nombres tirés à chaque partie) : impossibles à enregistrer d'avance, ils
 * restent affichés, et la voix se tait — un son absent n'est pas une panne.
 */

/**
 * LE RÉCIT SANS SON RANG — Camara : « pas besoin de répéter "Premier
 * connecteur", "Second connecteur" : c'est déjà dit ». La consigne annonce le
 * cadenas ; le récit commence donc à ce qu'on voit. Seul un rang en tête
 * (« Premier levier : », « Dernière salle, près de la sortie : ») s'en va ;
 * « Le deuxième verrou porte un démenti : … » reste une phrase.
 */
const RANG_EN_TETE = /^(Premi(?:er|ère)|Deuxième|Seconde?|Troisième|Quatrième|Cinquième|Sixième|Derni(?:er|ère))(?= )[^:.!?]{0,45} : /;
export function sansRang(recit) {
  const t = String(recit ?? '');
  const reste = t.replace(RANG_EN_TETE, '');
  return reste === t ? t : reste.charAt(0).toUpperCase() + reste.slice(1);
}

/** Une empreinte courte et stable d'un texte (FNV-1a), pour nommer son fichier. */
function empreinte(texte) {
  let h = 0x811c9dc5;
  for (const c of texte) {
    // eslint-disable-next-line no-bitwise
    h ^= c.codePointAt(0);
    // eslint-disable-next-line no-bitwise
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/** L'annonce du chrono, dite sur la fiche de mission : ses mots dépendent du mode et de la durée. */
export const texteAnnonce = (minutes, defi) => `Tu as ${minutes} minutes pour ouvrir les six cadenas. ${
  defi ? 'À zéro, l’alarme gagne !' : 'À zéro, tu pourras quand même finir.'}`;

export const repliquesEscape = {
  intro: (prefixe, module, classe) => ({
    cle: `${prefixe}/intro-${classe.toLowerCase().replace(/_/g, '-')}`,
    texte: module.PAR_CLASSE[classe].intro,
  }),
  annonce: (prefixe, minutes, defi) => ({
    cle: `${prefixe}/annonce-${minutes}-${defi ? 'defi' : 'tranquille'}`,
    texte: texteAnnonce(minutes, defi),
  }),
  recit: (prefixe, recit) => {
    const texte = sansRang(recit);
    return { cle: `${prefixe}/recit-${empreinte(texte)}`, texte };
  },
};

/**
 * Les récits FIXES d'un escape game, toutes classes et variantes : on tire des
 * parties jusqu'à les avoir tous vus. Une étape dont les récits se multiplient
 * encore quand on double les tirages est fabriquée au hasard : on la laisse.
 */
function recitsFixes(module, classe) {
  const vus = (n) => {
    const etapes = Array.from({ length: module.MANCHES }, () => new Set());
    for (let g = 1; g <= n; g += 1) {
      module.serie(g * 7919 + 13, classe).forEach((m, i) => etapes[i].add(m.recit));
    }
    return etapes;
  };
  const avant = vus(250);
  return vus(500).flatMap((s, i) => (s.size === avant[i].size ? [...s] : []));
}

/**
 * LES RÉCITS EN ANGLAIS (09/10/2026) : ceux des escape games d'anglais sont
 * écrits en anglais (« Welcome to London! »). Ils se lisent en anglais, et
 * l'écoute de contrôle doit y entendre de l'anglais — le premier lot les avait
 * tous rejetés en y cherchant du français. L'annonce du chrono, elle, reste en
 * français.
 */
const semblentAnglais = (t) => /\b(the|you|is|are|and|your|this|with)\b/i.test(t);

/** Tout ce qu'un escape game lit en plus de ses PHRASES, pour l'inventaire des voix. */
export function textesEnPlus(prefixe, module) {
  const repliques = [];
  const enAnglais = module.FAMILLE.matiereCode === 'ANGLAIS';
  const marquer = (r) => (enAnglais && semblentAnglais(r.texte) ? { ...r, anglais: true } : r);
  const minutes = new Set();
  module.CLASSES.forEach((classe) => {
    if (module.PAR_CLASSE[classe]?.intro) repliques.push(marquer(repliquesEscape.intro(prefixe, module, classe)));
    minutes.add(dureeEscape(classe) / 60);
    recitsFixes(module, classe).forEach((r) => repliques.push(marquer(repliquesEscape.recit(prefixe, r))));
  });
  minutes.forEach((n) => [false, true].forEach((defi) => repliques.push(repliquesEscape.annonce(prefixe, n, defi))));
  // Une même phrase dans deux classes : une seule fois.
  return [...new Map(repliques.map((r) => [r.cle, r])).values()];
}
