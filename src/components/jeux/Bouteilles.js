import * as b from '../../lib/jeux/bouteilles';
import { repliquesBouteilles } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import { ChoixBouteilles, QuestionBouteilles } from './scenes/ce2-maths/SceneBouteilles';

/**
 * LES BOUTEILLES, À L'ÉCRAN — une conversion, trois récipients à comparer, ou
 * des verres à remplir. Toute la règle vit dans `bouteilles.js`.
 *
 * À LA COMPARAISON, LES RÉCIPIENTS ONT TOUS LA MÊME TAILLE : dessinés à leur
 * contenance, ils donneraient la réponse sans lire les étiquettes.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026) : le comptoir au bord du lac, son
 * ardoise, Plouf la goutte d'eau qui réagit, des récipients à prendre sur le
 * comptoir pour réponses, et le versement une fois la réponse donnée — voir
 * `scenes/ce2-maths/SceneBouteilles.js`, où vit aussi le dessin de la bouteille.
 */
export const REGLE = {
  MANCHES: b.MANCHES,
  serie: b.serie,
  bilan: b.bilan,
  consigne: (m) => repliquesBouteilles.consigne(m.mode),
  choix: (m) => m.choix.map((c) => ({
    cle: c,
    libelle: m.mode === 'comparer' ? b.avecArticle(c) : `${c} ${m.unite === 'verres' ? 'verres' : m.unite}`,
  })),
  verdict: b.verdict,
  erreur: (m, sens) => repliquesBouteilles.erreur(sens),
  aide: () => repliquesBouteilles.erreur('litre'),
  rendreLesChoix: (p) => <ChoixBouteilles {...p} />,
};

export default function Bouteilles(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--bouteilles"
      rendreQuestion={(m, termine, extra) => <QuestionBouteilles m={m} termine={termine} extra={extra} />}
    />
  );
}
