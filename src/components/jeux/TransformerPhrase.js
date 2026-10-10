import * as negation from '../../lib/jeux/phraseQuiDitNon';
import { repliquesNegation } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import scene from './scenes/ce2-francais-b/Lac';

/**
 * TRANSFORMER UNE PHRASE — la phrase qui dit non, au CE2, à l'écran. La
 * phrase de départ, la forme demandée, trois transformations. Toute la règle
 * vit dans `phraseQuiDitNon.js`, section « le CE2 » ; l'écran est celui des
 * jeux à choix.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026) — voir `scenes/ce2-francais-b/Lac.js` :
 * le tableau noir au bord du lac, la phrase écrite à la craie, les réponses
 * en nuages de craie qu'on touche ou qu'on glisse sur la ligne vide ; la
 * manche finie, la bonne phrase s'y écrit et ce qui a changé s'allume en
 * couleur. Le seau de craies réagit. Rien de la règle ne change.
 */
const REGLE = {
  MANCHES: 9,
  serie: negation.serieCE2,
  bilan: (n) => negation.bilan(n, 9),
  consigne: (m) => repliquesNegation.consigneCE2(m.forme),
  choix: (m) => m.choix.map((c) => ({ cle: c.texte, libelle: c.texte })),
  verdict: (m, texte) => m.choix.find((c) => c.texte === texte).faute ?? 'juste',
  erreur: (m, faute) => repliquesNegation.erreurCE2(faute),
  aide: () => null,
  rendreLesChoix: scene.choix,
};

export default function TransformerPhrase(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--non jeu--transformer sc-ce2-francais-b sc-phrase-qui-dit-non-ce2"
      // La forme demandée et la phrase qui dit oui, sur le tableau : voir la scène.
      rendreQuestion={scene.question}
    />
  );
}
