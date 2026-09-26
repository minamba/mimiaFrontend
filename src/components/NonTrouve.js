import { Link } from 'react-router-dom';

/**
 * LA PAGE D'UNE ADRESSE QUI N'EXISTE PAS.
 *
 * Camara, le 23/09/2026, dans le chantier du référencement.
 *
 * AVANT, ON RENVOYAIT VERS L'ACCUEIL (`<Navigate to="/" replace />`). Deux
 * défauts, l'un pour le visiteur et l'autre pour Google :
 *
 *   — le visiteur qui a mal recopié un lien se retrouvait sur l'accueil sans
 *     savoir pourquoi. Il croit que le lien marchait et que la page a changé,
 *     ou il se demande s'il s'est trompé de site ;
 *   — Google recevait un contenu complet, en HTTP 200, pour N'IMPORTE QUELLE
 *     adresse. C'est une « soft 404 » : il peut indexer `mimia.fr/promo-2024`
 *     comme une page à part entière, avec le contenu de l'accueil. Autant de
 *     doublons qui diluent la page qu'on veut voir remonter.
 *
 * ELLE PORTE `noindex` sans rien faire de particulier : `estNonIndexee` dans
 * `lib/seo/pages.js` marque tout chemin qui n'est pas dans la table, et cette
 * page est précisément ce qu'on sert à ces chemins-là.
 *
 * LE VRAI CODE 404 RESTE HORS DE PORTÉE : le repli de l'API rend `index.html`
 * en 200 pour toute adresse inconnue (`Program.cs`, `MapFallbackToFile`), et
 * le changer demanderait de distinguer côté serveur les routes de React des
 * fautes de frappe — c'est-à-dire d'y recopier la liste des routes. Le
 * `noindex` suffit à Google, qui le respecte.
 */
export default function NonTrouve() {
  return (
    <section className="page page--etroite non-trouve">
      <h1>Cette page n’existe pas</h1>

      <p className="non-trouve__texte">
        Le lien est peut-être incomplet, ou la page a été déplacée depuis qu’il
        a été écrit.
      </p>

      <div className="non-trouve__actions">
        <Link to="/" className="btn btn--principal">Retour à l’accueil</Link>
        <Link to="/contact" className="btn-ghost">Nous signaler le lien</Link>
      </div>
    </section>
  );
}
