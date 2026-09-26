import { useEffect, useRef, useState } from 'react';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { enregistrer } from '../../lib/jeux/record';
import { useJeuOuvert } from '../../lib/jeux/contexteJeu';

/**
 * LA LIGNE DU RECORD, SOUS LE SCORE DE FIN DE PARTIE.
 *
 * Voulue par Camara le 25/09/2026, avant tout classement : un enfant rejoue
 * pour se battre lui-même bien plus que pour dépasser un inconnu. Et ce
 * ressort-là marche avec un seul enfant inscrit comme avec dix mille.
 *
 * TROIS ÉTATS, ET PAS UN DE PLUS
 * ------------------------------
 *   - première partie  → rien. Il n'y a rien à battre, et annoncer un record
 *     dès le premier essai viderait le mot de son sens.
 *   - record battu     → « Nouveau record ! » et l'ancien, pour qu'on voie le
 *     chemin parcouru.
 *   - sinon            → « Ton meilleur : 8 sur 10 », c'est-à-dire la cible.
 *
 * ÉGALER SON RECORD N'EST PAS LE BATTRE : on retombe dans le troisième cas.
 * Le mot « record » ne vaut que s'il reste rare.
 *
 * RIEN POUR LE PARENT QUI ESSAIE UN JEU. L'aperçu parent n'ouvre pas de
 * session élève : sans identifiant, on n'enregistre rien et on n'affiche rien.
 * Un parent qui découvre un jeu ne doit pas polluer le record de son enfant.
 */
export default function RecordJeu({ score, total }) {
  const { jeuCle, niveau } = useJeuOuvert();
  const [etat, setEtat] = useState(null);

  // UNE PARTIE NE S'ENREGISTRE QU'UNE FOIS. Le garde n'est pas décoratif : en
  // développement, React monte les effets deux fois pour débusquer ce genre
  // d'oubli, et le second passage ferait disparaître le « nouveau record »
  // qu'on vient d'obtenir — le record venant d'être écrit, il ne serait plus
  // battu par lui-même.
  const fait = useRef(false);

  useEffect(() => {
    if (fait.current) return;
    fait.current = true;

    const { eleveId } = sessionEleve() ?? {};
    if (!eleveId || !jeuCle) return;

    setEtat(enregistrer(eleveId, jeuCle, niveau ?? '', score, total));
  }, [jeuCle, niveau, score, total]);

  if (!etat) return null;

  if (etat.record) {
    return (
      <p className="jeu__record jeu__record--neuf" role="status">
        <span className="jeu__record-medaille" aria-hidden="true">★</span>
        Nouveau record&nbsp;! Ton ancien&nbsp;: {etat.precedent} sur {total}.
      </p>
    );
  }

  if (etat.precedent === null) return null;

  return (
    <p className="jeu__record">
      Ton meilleur&nbsp;: <strong>{etat.precedent} sur {total}</strong>.
      {score < etat.precedent && ' À toi de le battre.'}
    </p>
  );
}
