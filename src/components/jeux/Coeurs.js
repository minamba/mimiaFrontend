import { useLayoutEffect, useRef } from 'react';
import { useJeuOuvert } from '../../lib/jeux/contexteJeu';
import { DEFI, COEURS_DEPART, suivreCoeurs } from '../../lib/jeux/coeurs';
import imageCoeur from '../../assets/coeur.webp';
// LE CŒUR PERDU DEVIENT NOIR — Camara, le 26/09. Un cœur rose simplement
// pâli ne se remarquait pas assez : l'enfant doit VOIR qu'il vient d'en
// perdre un, à sa place dans la rangée.
import imageCoeurNoir from '../../assets/coeur_noir.webp';

/**
 * LES CŒURS DU MODE DÉFI — Camara, le 25/09/2026.
 *
 * Une barre de cœurs en haut de la scène. Le mode « tranquille » ne rend rien
 * du tout : ce composant est alors absent de l'arbre, sans coût ni effet.
 *
 * AU DERNIER CŒUR, IL PRÉVIENT LA PAGE, qui démonte le jeu et affiche
 * `FinDuDefi` à sa place (26/09). Il ne pose plus de voile par-dessus : le
 * jeu restait vivant dessous, passait à la question suivante et la faisait
 * lire par la professeure.
 *
 * LES JEUX NE LUI DONNENT QUE DEUX NOMBRES : la manche en cours et le
 * nombre de réussites du premier coup, qu'ils possédaient tous déjà. C'est ce
 * qui a permis d'ajouter les cœurs sans toucher la logique d'un seul jeu, et
 * ce qui fait qu'un jeu écrit demain les aura sans rien déclarer. Depuis le
 * 26/09, le composant suit leur évolution pour savoir quand un cœur revient.
 */
export default function Coeurs({ manche, duPremierCoup }) {
  const { mode, coeursMax, terminerDefi } = useJeuOuvert();

  // LE COMPOSANT SUIT LA PARTIE, il ne la recalcule plus (26/09) : deux
  // bonnes réponses d'affilée rendent un cœur, et une série dépend de
  // l'ordre des réponses, que les deux nombres seuls ne disent pas. La règle
  // est dans `suivreCoeurs` ; ce registre n'en garde que le dernier état.
  //
  // Mettre à jour un registre pendant le rendu est sans risque ici : un
  // relevé identique ne change rien, donc le double rendu du mode strict
  // retombe sur le même état.
  const suivi = useRef(COEURS_DEPART);

  const actif = mode === DEFI && coeursMax > 0;
  if (actif) suivi.current = suivreCoeurs(suivi.current, manche, duPremierCoup, coeursMax);
  const restants = actif ? Math.max(0, coeursMax - suivi.current.perdus) : null;

  // AVANT QUE L'ÉCRAN NE SE PEIGNE : un effet de mise en page, et non un
  // effet ordinaire. La page démonte le jeu dans la foulée, et la question
  // suivante — que le jeu vient de rendre — n'apparaît jamais à l'écran. Le
  // démontage coupe aussi la phrase qu'il avait commencé à charger.
  useLayoutEffect(() => {
    if (restants === 0) terminerDefi?.({ reussies: duPremierCoup ?? 0, questions: manche ?? 0 });
  }, [restants, terminerDefi, duPremierCoup, manche]);

  if (!actif || restants === 0) return null;

  return (
    <p
      className={`coeurs${restants === 1 ? ' coeurs--dernier' : ''}`}
      // LE COMPTE EST ANNONCÉ, PAS SEULEMENT DESSINÉ : une rangée de cœurs ne
      // dit rien à qui ne voit pas l'écran. La zone est polie pour que la
      // perte se sache sans couper la question en cours.
      role="status"
      aria-label={`${restants} cœur${restants > 1 ? 's' : ''} sur ${coeursMax}`}
    >
      {Array.from({ length: coeursMax }, (_, i) => (
        <img
          key={i}
          className={`coeurs__un${i < restants ? '' : ' est-perdu'}`}
          // Les cœurs ne redeviennent roses qu'à la partie suivante.
          src={i < restants ? imageCoeur : imageCoeurNoir}
          alt=""
          aria-hidden="true"
          width="128"
          height="128"
        />
      ))}
    </p>
  );
}
