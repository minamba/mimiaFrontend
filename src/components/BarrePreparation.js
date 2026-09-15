/**
 * L'avancement d'une préparation de contrôle.
 *
 * LA BARRE EST TOUJOURS LÀ, MÊME À ZÉRO — voulu par Camara le 13/09/2026.
 * Elle ne s'affichait auparavant que si le programme du contrôle était connu,
 * au motif qu'un « 0 % » ressemblait à un reproche. À l'usage c'était pire :
 * l'enfant ne voyait RIEN, et la mécanique avait l'air de ne pas fonctionner.
 * Une jauge vide dit au moins « il te reste tout à faire ».
 *
 * LE CHIFFRE EST ÉCRIT, PAS SEULEMENT DESSINÉ. Une largeur ne se lit pas au
 * clavier, ne s'entend pas dans un lecteur d'écran, et se compare mal d'une
 * carte à l'autre.
 */

/** Les paliers de couleur, alignés sur les seuils du suivi (0,80 et 0,50). */
export const palierPreparation = (pourcent) => {
  if (pourcent >= 80) return 'acquis';
  if (pourcent >= 50) return 'encours';
  if (pourcent > 0) return 'fragile';
  return 'vide';
};

export default function BarrePreparation({
  pourcent, perimetreConnu = true, compact = false,
}) {
  const borne = Math.max(0, Math.min(100, Math.round(pourcent ?? 0)));

  return (
    <div className={`preparation${compact ? ' preparation--compact' : ''}`}>
      <div className="preparation__ligne">
        <span className="preparation__libelle">Préparation</span>
        <span className="preparation__valeur">{borne} %</span>
      </div>

      <div
        className="preparation__jauge"
        role="progressbar"
        aria-valuenow={borne}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Avancement de la préparation"
      >
        <span
          className={`est-${palierPreparation(borne)}`}
          style={{ width: `${borne}%` }}
        />
      </div>

      {/* Le programme inconnu se dit SOUS la barre, au lieu de la remplacer :
          c'est une information de plus, pas une raison de ne rien montrer. */}
      {!perimetreConnu && (
        <p className="preparation__attente">
          On ne sait pas encore ce qu’il y a dessus.
        </p>
      )}
    </div>
  );
}
