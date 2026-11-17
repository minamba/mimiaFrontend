import { useEffect } from 'react';
import { avatarsDeLaClasse, avatarParDefaut } from '../lib/avatarEnfant';
import './choixAvatar.css';

/**
 * LE CHOIX DE L'AVATAR D'UN ENFANT — Camara, le 16/11/2026.
 *
 * À la création et à la modification de l'enfant, côté parent comme côté administration. FACULTATIF : la première
 * case, « Par défaut », est l'avatar que l'enfant reçoit sans choix (la silhouette de sa tranche et de son sexe, ou le
 * portrait provisoire). Les autres viennent du catalogue (`lib/avatarEnfant.js`) : ceux de la tranche d'âge de la
 * classe, et du sexe de l'enfant s'il est connu.
 *
 * TANT QUE LE CATALOGUE EST VIDE POUR CETTE CLASSE, RIEN NE S'AFFICHE : proposer une seule case serait un choix qui
 * n'en est pas un. Le terrain est prêt ; les images déposées dans assets/avatars-enfants le font apparaître.
 *
 * `valeur` : le code choisi, ou '' pour « par défaut ». Si la classe change de tranche et que l'avatar choisi n'y est
 * plus proposé, le choix revient à « par défaut » : un portrait de lycéen ne suit pas un enfant repassé en CM2.
 */
export default function ChoixAvatar({ classe, sexe, valeur, onChange, prenom = null }) {
  const proposes = avatarsDeLaClasse(classe, sexe);
  const parDefaut = avatarParDefaut(classe, sexe);

  useEffect(() => {
    if (proposes.length > 0 && valeur && !proposes.some((a) => a.code === valeur)) onChange('');
  }, [proposes, valeur, onChange]);

  if (proposes.length === 0) return null;

  const pour = prenom ? `de ${prenom}` : 'de votre enfant';

  return (
    <fieldset className="champ choix-avatar">
      <legend>
        Son avatar <span className="champ__option">(facultatif)</span>
      </legend>
      <span className="champ__aide">
        Le portrait {pour} dans son espace. Sans choix, il garde celui par défaut ; vous pourrez le changer plus tard.
      </span>

      <div className="choix-avatar__grille" role="radiogroup" aria-label="Avatar">
        <button
          type="button"
          role="radio"
          aria-checked={!valeur}
          className={`choix-avatar__case choix-avatar__case--defaut${!valeur ? ' est-choisi' : ''}`}
          onClick={() => onChange('')}
        >
          {parDefaut ? <img src={parDefaut} alt="" /> : <span className="choix-avatar__vide" aria-hidden="true">?</span>}
          <span className="choix-avatar__nom">Par défaut</span>
        </button>

        {/* PAS D'ÉTIQUETTE D'ORIGINE — Camara, le 16/11/2026 : la bulle au survol (« Africain, garçon, cheveux
            courts ») est retirée ; le portrait se choisit à l'œil. Les lecteurs d'écran disent « Avatar 1, 2… ». */}
        {proposes.map((a, rang) => {
          const libelle = `Avatar ${rang + 1}`;
          return (
            <button
              key={a.code}
              type="button"
              role="radio"
              aria-checked={valeur === a.code}
              aria-label={libelle}
              className={`choix-avatar__case${valeur === a.code ? ' est-choisi' : ''}`}
              onClick={() => onChange(a.code)}
            >
              <img src={a.src} alt="" />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
