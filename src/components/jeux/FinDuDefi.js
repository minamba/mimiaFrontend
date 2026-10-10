import { useEffect, useRef } from 'react';
import imageCoeurNoir from '../../assets/coeur_noir.webp';
import Etincelle from './Etincelle';

/**
 * LA FIN DU DÉFI — l'écran qui remplace le jeu quand le dernier cœur tombe.
 *
 * IL REMPLACE LE JEU, IL NE SE POSE PLUS PAR-DESSUS — Camara, le 26/09 :
 * « la professeure continue de lire les questions alors que je suis sur la
 * page de fin ». Le voile d'avant laissait le jeu vivant dessous : il passait
 * à la question suivante, l'affichait à travers et la faisait lire. Le jeu est
 * maintenant démonté par la page, et sa voix s'arrête avec lui.
 *
 * LE MÊME DÉCOR QUE L'ÉCRAN DU CHOIX : l'enfant revient là où il avait choisi
 * le défi, et retrouve les deux mêmes portes.
 *
 * CE QU'IL NE DIT PAS : ni « perdu », ni « raté », ni le nombre de fautes.
 * L'enfant a choisi lui-même un mode difficile ; le lui reprocher serait le
 * dernier moyen de l'y ramener. Il lit ce qu'il a réussi.
 *
 * LA PORTE VERS « TRANQUILLE » EST LÀ EXPRÈS : c'est la sortie de secours de
 * celui qui s'est surestimé. Sans elle, il ne lui resterait qu'à quitter.
 */
export default function FinDuDefi({
  coeursMax, reussies, questions, onRefaire, onTranquille, onQuitter, raison, total, unite,
}) {
  // LE COMPTE À REBOURS D'UN ESCAPE GAME finit aussi un défi (07/10/2026) :
  // ni cœurs noirs ni astuce de cœurs, mais les cadenas ouverts. L'alarme qui
  // « gagne » est celle de l'histoire, pas un reproche à l'élève.
  const temps = raison === 'temps';
  // Le focus sur le titre : un lecteur d'écran annonce la fin, et la
  // tabulation repart d'ici plutôt que du haut de la page.
  const titre = useRef(null);
  useEffect(() => { titre.current?.focus?.({ preventScroll: true }); }, []);

  // LE SCORE EST DÉJÀ DIT EN GRAND : la phrase dit autre chose — combien de
  // temps il a tenu, et comment tenir plus longtemps la prochaine fois.
  // UN JEU BONUS (09/10/2026) compte ce qu'il a trouvé (`unite`) : pas d'alarme ni de cadenas.
  const pluriel = (n, u) => (n > 1 ? u.split(' ').map((m) => `${m}s`).join(' ') : u);
  const mot = temps && unite
    ? 'La montre a gagné cette fois. Astuce : en mode tranquille, prends ton temps, puis bats ton record.'
    : temps
    ? 'L’alarme a gagné cette fois. Astuce : en mode tranquille, tu peux finir même après zéro, et repérer les cadenas qui te prennent du temps.'
    : reussies === 0
    ? 'Chaque question t’a appris quelque chose. Astuce : deux bonnes réponses d’affilée te rendent un cœur.'
    : `Tu as tenu ${questions} question${questions > 1 ? 's' : ''}. Astuce : deux bonnes réponses d’affilée te rendent un cœur.`;

  return (
    <div className="jeu jeu--choix defi-fin">
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <p className="defi-fin__coeurs" aria-hidden="true">
        {temps ? <span className="defi-fin__chrono">⏱</span> : Array.from({ length: coeursMax }, (_, i) => (
          <img
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            src={imageCoeurNoir}
            alt=""
            width="128"
            height="128"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </p>

      <p className="choix-mode__pastille">
        <Etincelle />
        <span>Mode défi</span>
        <Etincelle />
      </p>

      <h2 className="choix-mode__titre" ref={titre} tabIndex={-1}>
        <Etincelle grande />
        <span className="choix-mode__question">
          <span className="choix-mode__question-cerne" aria-hidden="true">
            {temps ? 'Le temps est écoulé !' : 'Le défi s’arrête ici !'}
          </span>
          <span className="choix-mode__question-texte">{temps ? 'Le temps est écoulé !' : 'Le défi s’arrête ici !'}</span>
        </span>
        <Etincelle grande />
      </h2>

      <div className="fin-jeu__score" role="status">
        <strong>{temps ? questions : reussies}</strong>
        {temps ? (
          <span>
            {unite ? pluriel(questions, unite) : `cadenas ouvert${questions > 1 ? 's' : ''}`}
            <br />
            sur {total}
          </span>
        ) : (
          <span>
            bonne{reussies > 1 ? 's' : ''} réponse{reussies > 1 ? 's' : ''}
            <br />
            du premier coup
          </span>
        )}
      </div>

      <p className="fin-jeu__mot">{mot}</p>

      <div className="fin-jeu__portes">
        <button type="button" className="fin-jeu__porte fin-jeu__porte--rouge" onClick={onRefaire}>
          Refaire le défi
        </button>
        <button type="button" className="fin-jeu__porte" onClick={onTranquille}>
          Jouer tranquillement
        </button>
      </div>
    </div>
  );
}
