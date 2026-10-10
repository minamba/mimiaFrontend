import './ce2-francais.css';
import tableau from './Tableau';
import chemin from './Chemin';
import { sceneAOuA } from './PostIts';
import loupe from './Loupe';
import panneaux from './Panneaux';

/**
 * LES SCÈNES DES JEUX DE FRANÇAIS DU CE1 ET DU CE2 SUR `JeuDeChoix`
 * (09/10/2026) — un univers par jeu, repris de sa couverture. Chaque écran
 * (`OuQuandComment.js`, `SujetEloigne.js`, `AOuA.js`, `TypesDePhrases.js`,
 * `ContrairesEtJumeaux.js`) prend la sienne ici et la confie à `JeuDeChoix`
 * (`rendreQuestion`, `regle.rendreLesChoix`). Au CM1 et au CM2, ces clés
 * passent par d'autres écrans, qui ont leurs propres scènes.
 *
 * Une scène : { question(m, termine, extra), choix({ m, choix, fautes, choisir, objet }) }.
 */
const AOUA = { CE1: sceneAOuA('CE1'), CE2: sceneAOuA('CE2') };

export const SCENES = {
  'ou-quand-comment': tableau,
  'sujet-qui-s-eloigne': chemin,
  'a-ou-a': AOUA.CE1,
  'types-de-phrases': loupe,
  'contraires-et-jumeaux': panneaux,
};

/** La scène d'un jeu à une classe : « a ou à » a deux univers, le CE1 et le CE2. */
export function sceneDe(cle, niveau) {
  if (cle === 'a-ou-a') return AOUA[niveau] ?? AOUA.CE1;
  return SCENES[cle];
}
