/**
 * L'AVATAR D'UN ENFANT — Camara, le 16/11/2026.
 *
 * EN ATTENDANT LES VRAIS AVATARS (le PDF « avatars des enfants » : 155 portraits au choix du parent, et des
 * silhouettes par défaut), chaque enfant reçoit un portrait PROVISOIRE d'après sa tranche d'âge et son sexe :
 * les bustes du garçon et de la fille de la frise « accompagnement » (CP, CM2, 6e, 3e, Terminale), découpés dans
 * assets/avatars-enfants. Sexe non précisé : pas de portrait, l'initiale reste.
 *
 * La tranche vient de la classe (`niveauCode` ou `niveauLibelle`) : CP–CE1, CE2–CM2, 6e–5e, 4e–3e, lycée.
 */
import cpGarcon from '../assets/avatars-enfants/provisoire-cp-ce1-garcon.webp';
import cpFille from '../assets/avatars-enfants/provisoire-cp-ce1-fille.webp';
import cm2Garcon from '../assets/avatars-enfants/provisoire-ce2-cm2-garcon.webp';
import cm2Fille from '../assets/avatars-enfants/provisoire-ce2-cm2-fille.webp';
import sixiemeGarcon from '../assets/avatars-enfants/provisoire-6e-5e-garcon.webp';
import sixiemeFille from '../assets/avatars-enfants/provisoire-6e-5e-fille.webp';
import troisiemeGarcon from '../assets/avatars-enfants/provisoire-4e-3e-garcon.webp';
import troisiemeFille from '../assets/avatars-enfants/provisoire-4e-3e-fille.webp';
import lyceeGarcon from '../assets/avatars-enfants/provisoire-lycee-garcon.webp';
import lyceeFille from '../assets/avatars-enfants/provisoire-lycee-fille.webp';

const PORTRAITS = {
  'cp-ce1': { garcon: cpGarcon, fille: cpFille },
  'ce2-cm2': { garcon: cm2Garcon, fille: cm2Fille },
  '6e-5e': { garcon: sixiemeGarcon, fille: sixiemeFille },
  '4e-3e': { garcon: troisiemeGarcon, fille: troisiemeFille },
  lycee: { garcon: lyceeGarcon, fille: lyceeFille },
};

/** La tranche d'âge d'une classe, ou null si elle ne se reconnaît pas. */
export function trancheDeClasse(classe) {
  const c = String(classe ?? '').trim().toLowerCase();
  if (!c) return null;
  if (/^(cp|ce1)\b/.test(c)) return 'cp-ce1';
  if (/^(ce2|cm1|cm2)\b/.test(c)) return 'ce2-cm2';
  // Le code (« SIXIEME », « TROISIEME_PREPA ») autant que le libellé (« 6e »).
  if (/^(6|5)(e|ème)\b|^(sixieme|cinquieme)/.test(c)) return '6e-5e';
  if (/^(4|3)(e|ème)\b|^(quatrieme|troisieme)/.test(c)) return '4e-3e';
  if (/^(2nde|seconde|1(re|ère)|premi|term|tle|cap|bac)/.test(c)) return 'lycee';
  return null;
}

/**
 * L'ANNÉE D'UNE CLASSE (16/11/2026) — Camara dessine aussi des avatars classe par classe (« avatar-cp-… »,
 * « avatar-terminale-… »), en plus de ceux par tranche. Le code (« SIXIEME », « SECONDE_PRO ») autant que le libellé
 * (« 6e », « Terminale professionnelle »). Null pour une classe sans année reconnue (CAP…).
 */
export function anneeDeClasse(classe) {
  const c = String(classe ?? '').trim().toLowerCase();
  if (!c) return null;
  const primaire = c.match(/^(cp|ce1|ce2|cm1|cm2)\b/);
  if (primaire) return primaire[1];
  if (/^(6e|6ème)\b|^sixieme/.test(c)) return '6e';
  if (/^(5e|5ème)\b|^cinquieme/.test(c)) return '5e';
  if (/^(4e|4ème)\b|^quatrieme/.test(c)) return '4e';
  if (/^(3e|3ème)\b|^troisieme/.test(c)) return '3e';
  if (/^(2nde|seconde)/.test(c)) return 'seconde';
  if (/^(1re|1ère|premi)/.test(c)) return 'premiere';
  if (/^(term|tle)/.test(c)) return 'terminale';
  return null;
}

/** Le sexe, que l'API le donne en nombre (1 fille, 2 garçon) ou en texte. */
export function sexeDe(eleve) {
  const s = eleve?.sexe;
  if (s === 1 || s === '1' || /^fille$/i.test(String(s))) return 'fille';
  if (s === 2 || s === '2' || /^gar[cç]on$/i.test(String(s))) return 'garcon';
  return null;
}

/* ------------------------------------------------------------------------------------------------------------
   LE CATALOGUE DES AVATARS AU CHOIX (16/11/2026) — voir le PDF « avatars des enfants ».

   Il se lit dans le dossier lui-même : déposer une image bien nommée suffit, aucune liste à tenir à la main.
     - avatar-{tranche}-{origine}-{sexe}-{cheveux}.png|webp : un avatar au choix, de code
       « {tranche}-{origine}-{sexe}-{cheveux} » (ex. « cp-ce1-asie-garcon-courts ») — c'est ce code que le serveur garde ;
     - avatar-defaut-{tranche}-{sexe}.png|webp : l'avatar par défaut, quand le parent n'a rien choisi.
   Tant qu'un dossier est vide, le choix ne s'affiche pas et les portraits provisoires restent.
   `require.context` n'existe que dans webpack : sous Jest, le catalogue est vide (les tests passent par `lireCatalogue`).
   ------------------------------------------------------------------------------------------------------------ */
const TRANCHES = '(cp-ce1|ce2-cm2|6e-5e|4e-3e|lycee)';
// LE NIVEAU D'UN AVATAR : une tranche (« cp-ce1 ») ou, depuis le 16/11/2026, une classe (« cp », « terminale »). Les
// tranches d'abord : « cp-ce1 » ne doit pas se lire « cp » suivi d'une origine « ce1 ».
const NIVEAUX = '(cp-ce1|ce2-cm2|6e-5e|4e-3e|lycee|cp|ce1|ce2|cm1|cm2|6e|5e|4e|3e|seconde|premiere|terminale)';
// Les cheveux peuvent tenir en plusieurs mots (« tres-courts ») : tout ce qui suit le sexe.
// `String.raw` : sans lui, le gabarit avale la barre oblique et « \. » devient « . » (n'importe quel caractère).
const MOTIF_AVATAR = new RegExp(String.raw`^\./avatar-${NIVEAUX}-([a-z]+)-(garcon|fille)-([a-z]+(?:-[a-z]+)*)\.(png|webp)$`);
const MOTIF_DEFAUT = new RegExp(String.raw`^\./avatar-defaut-${TRANCHES}-(garcon|fille)\.(png|webp)$`);

export const ORIGINES = { asie: 'Asiatique', europe: 'Européen', latino: 'Latino', amerique: 'Américain', afrique: 'Africain' };
export const CHEVEUX = {
  'tres-courts': 'cheveux très courts', courts: 'cheveux courts', milongs: 'cheveux mi-longs', longs: 'cheveux longs',
  afro: 'afro', tresses: 'tresses', couettes: 'deux couettes afro',
};

/** Lit une liste de fichiers (« ./avatar-… ») ; `image(cle)` donne l'adresse de l'image. Exportée pour les tests. */
export function lireCatalogue(cles, image) {
  const avatars = [];
  const defauts = {};
  cles.forEach((cle) => {
    const a = cle.match(MOTIF_AVATAR);
    if (a) {
      const [, tranche, origine, sexe, cheveux] = a;
      avatars.push({ code: `${tranche}-${origine}-${sexe}-${cheveux}`, tranche, origine, sexe, cheveux, src: image(cle) });
      return;
    }
    const d = cle.match(MOTIF_DEFAUT);
    if (d) defauts[`${d[1]}-${d[2]}`] = image(cle);
  });
  return { avatars, defauts };
}

function catalogueDuDossier() {
  // L'appel doit rester écrit tel quel (`require.context(...)`) : webpack le lit au build. Sous Jest, il n'existe pas,
  // l'appel lève, et le catalogue reste vide.
  try {
    const dossier = require.context('../assets/avatars-enfants', false, /^\.\/avatar-.*\.(png|webp)$/);
    return lireCatalogue(dossier.keys(), (cle) => {
      const module = dossier(cle);
      return module?.default ?? module;
    });
  } catch {
    return { avatars: [], defauts: {} };
  }
}

const CATALOGUE = catalogueDuDossier();

/** L'avatar par défaut d'une classe et d'un sexe : la silhouette si elle existe, sinon le portrait provisoire. */
export function avatarParDefaut(classe, sexeVoulu, catalogue = CATALOGUE) {
  const tranche = trancheDeClasse(classe);
  const sexe = sexeDe({ sexe: sexeVoulu });
  if (!tranche || !sexe) return null;
  return catalogue.defauts[`${tranche}-${sexe}`] ?? PORTRAITS[tranche][sexe];
}

/**
 * Les avatars proposés pour une classe : ceux de sa tranche d'âge, et du sexe de l'enfant s'il est connu (sinon tous
 * ceux de la tranche).
 */
export function avatarsDeLaClasse(classe, sexeVoulu, catalogue = CATALOGUE) {
  const tranche = trancheDeClasse(classe);
  const annee = anneeDeClasse(classe);
  if (!tranche && !annee) return [];
  const sexe = sexeDe({ sexe: sexeVoulu });
  // Ceux de sa tranche d'âge et ceux de SA classe (16/11/2026), l'un comme l'autre.
  return catalogue.avatars.filter((a) => (a.tranche === tranche || a.tranche === annee) && (!sexe || a.sexe === sexe));
}

/** L'image d'un code d'avatar, ou null s'il n'est (plus) dans le catalogue. */
export function imageDeLAvatar(code, catalogue = CATALOGUE) {
  return code ? catalogue.avatars.find((a) => a.code === code)?.src ?? null : null;
}

/**
 * L'image du portrait de l'enfant : l'avatar choisi par le parent s'il existe encore, sinon celui par défaut ; null
 * quand rien ne convient (l'appelant affiche alors l'initiale).
 */
export function avatarEnfant(eleve, catalogue = CATALOGUE) {
  return imageDeLAvatar(eleve?.avatar, catalogue)
    ?? avatarParDefaut(eleve?.niveauCode ?? eleve?.niveauLibelle, eleve?.sexe, catalogue);
}

export default avatarEnfant;
