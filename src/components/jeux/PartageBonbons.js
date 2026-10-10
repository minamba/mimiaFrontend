import * as partage from '../../lib/jeux/partageBonbons';
import { repliquesPartage } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import { ChoixPartage, QuestionPartage } from './scenes/ce1-maths/ScenePartage';

/**
 * LE PARTAGE DES BONBONS, À L'ÉCRAN — le tas de bonbons, les assiettes des
 * amis ; une fois la réponse trouvée, les bonbons se rangent dans les
 * assiettes, et le reste reste à côté. Toute la règle vit dans
 * `partageBonbons.js`.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026, `scenes/ce1-maths/ScenePartage.js`) :
 * la confiserie, l'ourson en gélatine qui réagit, les amis qui attendent
 * derrière leurs assiettes, le partage qui se rejoue un bonbon à la fois ; les
 * réponses sont des sachets suspendus (`rendreLesChoix`).
 */
const REGLE = {
  MANCHES: partage.MANCHES,
  serie: partage.serie,
  bilan: partage.bilan,
  consigne: () => repliquesPartage.consigne,
  choix: (m) => m.choix.map((c) => ({ cle: c.cle, libelle: partage.ecrire(c) })),
  verdict: partage.verdict,
  erreur: (m, sens) => repliquesPartage.erreur(sens),
  aide: () => repliquesPartage.erreur('partage'),
  rendreLesChoix: (props) => <ChoixPartage {...props} />,
};

export default function PartageBonbons(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--partage"
      rendreQuestion={(m, termine, extra) => <QuestionPartage m={m} termine={termine} extra={extra} />}
    />
  );
}
