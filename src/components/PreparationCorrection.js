import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Le temps avant d'ouvrir la fenêtre : une réponse rapide ne doit pas la faire clignoter. */
export const DELAI_OUVERTURE = 1000;

/**
 * « NORA PRÉPARE LA CORRECTION DE TA COPIE… » — Camara, le 26/09/2026.
 *
 * Avant de corriger une copie, la professeure peut réfléchir quarante
 * secondes et plus sans écrire un mot. Une bulle vide ne disait rien : Syan a
 * cru à une panne, a reparlé, et sa voix a coupé la réponse qui allait venir.
 * Camara : « j'aimerais même une popup disant que le professeur prépare la
 * correction, comme ça c'est bien visible ».
 *
 * ELLE S'OUVRE SEULE et SE FERME SEULE : dès que le premier mot de la
 * correction arrive, elle disparaît et la correction démarre sous les yeux de
 * l'enfant. Aucun bouton : il n'y a rien à faire qu'attendre, et le dire.
 *
 * PAS DE FOND QUI BLOQUE LE MICRO : le micro n'est pas touché (décision de
 * Camara). La fenêtre informe, elle ne change rien à ce qui se passe dessous.
 */
export default function PreparationCorrection({ visible, profPrenom }) {
  const [ouverte, setOuverte] = useState(false);

  useEffect(() => {
    if (!visible) {
      setOuverte(false);
      return undefined;
    }

    const minuteur = setTimeout(() => setOuverte(true), DELAI_OUVERTURE);
    return () => clearTimeout(minuteur);
  }, [visible]);

  if (!ouverte) return null;

  const prof = profPrenom ?? 'Ton professeur';

  return createPortal(
    <div className="preparation-correction" role="status" aria-live="polite">
      <div className="preparation-correction__carte">
        {/* Une copie qu'on corrige : des lignes, et une coche qui passe de
            l'une à l'autre. Décorative — le texte dit tout. */}
        <div className="preparation-correction__feuille" aria-hidden="true">
          <span className="preparation-correction__ligne" />
          <span className="preparation-correction__ligne" />
          <span className="preparation-correction__ligne" />
          <span className="preparation-correction__ligne" />
          <span className="preparation-correction__crayon" />
        </div>

        <p className="preparation-correction__titre">
          {prof} prépare la correction de ta copie
          <span className="bulle__points" aria-hidden="true">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </p>
        {/* Le prénom, jamais « il » ou « elle » : les professeurs sont des
            deux genres, et le prénom seul ne dit pas lequel. */}
        <p className="preparation-correction__texte">
          {prof} regarde tes réponses une par une. Ça peut prendre une minute :
          la correction commence toute seule dès qu’elle est prête.
        </p>
      </div>
    </div>,
    document.body,
  );
}
