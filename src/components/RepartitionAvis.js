/**
 * La répartition des notes, de 5 à 1 étoile.
 *
 * UNE MOYENNE SEULE CACHE LA DIFFÉRENCE entre « tout le monde met 4 » et « la
 * moitié met 5, l'autre met 3 » — et c'est précisément ce qu'un lecteur
 * méfiant cherche à savoir.
 *
 * SUR LA PAGE « TOUS LES AVIS », PLUS SUR L'ACCUEIL — Camara, le 14/09/2026.
 * Sur la page d'accueil, cinq barres donnaient à la section l'air d'un tableau
 * de bord, et le visiteur n'en retient que la note. Celui qui veut le détail
 * clique sur « Voir les avis » : il le trouve ici.
 */
export default function RepartitionAvis({ repartition, total }) {
  return (
    <ul className="avis__barres">
      {[5, 4, 3, 2, 1].map((rang) => {
        const nombre = repartition?.[rang - 1] ?? 0;
        const part = total === 0 ? 0 : Math.round((nombre / total) * 100);

        return (
          <li key={rang}>
            <span className="avis__barre-libelle">{rang} étoile{rang > 1 ? 's' : ''}</span>
            <span className="avis__barre">
              <span className="avis__barre-remplie" style={{ width: `${part}%` }} />
            </span>
            <span className="avis__barre-part">{part} %</span>
          </li>
        );
      })}
    </ul>
  );
}
