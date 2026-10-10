import './ce1-maths.css';

/**
 * LES BRIQUES COMMUNES DU GROUPE « CE1-MATHS » (09/10/2026) — le coffre des
 * centaines, la course des tables, les parts de pizza, la machine à dix, le
 * partage des bonbons et le mètre ruban. Camara : « fais la même chose avec
 * les jeux du CP, CE1, CE2 ». Chaque jeu a son univers, sa mascotte et son
 * CSS (`sc-<clé du jeu>`) ; ici, seulement ce qui se ressemble d'un jeu à
 * l'autre : l'humeur de la mascotte, sa bulle, et la gerbe de la fête.
 *
 * TOUT EST DÉRIVÉ DE L'ÉTAT DU JEU, rien n'est retenu ici : pas de minuterie,
 * pas d'effet. Une animation se rejoue parce que sa CLÉ change (une nouvelle
 * faute, une nouvelle manche), jamais parce qu'un compteur tourne.
 */

/** Un tableau de `n` éléments numérotés : de quoi dessiner des bonbons, des cubes… */
export const rangee = (n) => Array.from({ length: Math.max(0, Math.floor(Number(n) || 0)) }, (_, i) => i);

/**
 * L'HUMEUR DE LA MASCOTTE : elle fête une réussite, encourage après une
 * erreur (jamais de moquerie), attend sinon.
 */
export function humeurDe({ reussi, faute }) {
  if (reussi) return 'bravo';
  if (faute) return 'encourage';
  return 'attend';
}

/** Une étoile à cinq branches, pour la bulle et la fête. */
function Etoile() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.8 L15 8.6 L22.4 9.3 L16.8 14.2 L18.5 21.5 L12 17.7 L5.5 21.5 L7.2 14.2 L1.6 9.3 L9 8.6 Z" fill="#ffd23f" stroke="#c98a00" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/** Un cœur : l'encouragement, sans un mot à lire. */
function Coeur() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 21 C4 15 1.5 11 3.5 7 C5.4 3.4 10 3.6 12 7 C14 3.6 18.6 3.4 20.5 7 C22.5 11 20 15 12 21 Z" fill="#ff6b8b" stroke="#c23a5a" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * LA MASCOTTE ET SA BULLE. Le dessin vient du jeu (`children`) ; ici,
 * l'enveloppe qui porte l'humeur (`est-attend`, `est-bravo`, `est-encourage`)
 * et la bulle : une étoile à la réussite, un cœur à l'erreur. Au CP et au
 * CE1, l'enfant ne lit pas encore : la mascotte ne dit rien qu'il faudrait
 * lire. `cle` relance l'animation à chaque nouvelle faute.
 */
export function Mascotte({
  prefixe, humeur, cle = 0, children,
}) {
  return (
    <div className={`${prefixe}__mascotte est-${humeur}`} aria-hidden="true">
      <span key={`${humeur}-${cle}`} className={`${prefixe}__personnage`}>
        {children}
      </span>
      {humeur !== 'attend' && (
        <span key={`b-${humeur}-${cle}`} className={`${prefixe}__bulle`}>
          {humeur === 'bravo' ? <Etoile /> : <Coeur />}
        </span>
      )}
    </div>
  );
}

/**
 * LA FÊTE D'UNE RÉUSSITE : une gerbe d'éclats aux couleurs du jeu, qui part
 * en étoile depuis le centre et s'éteint une seule fois. `eclats` donne la
 * sorte de chaque éclat (le CSS du jeu les dessine : pièce d'or, damier,
 * feuille de basilic, bonbon…).
 */
export function Fete({ prefixe, eclats }) {
  const n = eclats.length;
  return (
    <span className={`${prefixe}__fete`} aria-hidden="true">
      {eclats.map((sorte, i) => (
        <span
          // Des éclats sans identité propre : leur place est leur nom.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`${prefixe}__eclat ${prefixe}__eclat--${sorte}`}
          style={{
            '--angle': `${Math.round((i * 360) / n + (i % 2) * 9)}deg`,
            '--loin': `${130 + (i % 4) * 46}px`,
            '--delai': `${(i % 5) * 45}ms`,
          }}
        />
      ))}
      <span className={`${prefixe}__eclat-etoile`}><Etoile /></span>
    </span>
  );
}
