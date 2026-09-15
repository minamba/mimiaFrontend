import { useParams, useNavigate } from 'react-router-dom';
import iconeCalendrier from '../assets/calendrier.png';
import { getCalendrier } from '../lib/api/elevesApi';
import { CalendrierContenu } from './CalendrierContenu';

/**
 * « MON CALENDRIER », LE PENDANT DE « MA CARTE ».
 *
 * Trois choses sur une même grille mensuelle : les vacances de la zone de
 * l'enfant (si son académie est renseignée — voir FormulaireEleve), les
 * jours où il a eu cours, colorés par matière comme partout ailleurs dans
 * l'appli, et les évaluations déjà passées.
 *
 * LES ÉVALUATIONS « À VENIR » NE SONT PAS SUR LA GRILLE.
 * -------------------------------------------------------
 * Mimia n'a pas de séances programmées à une date précise — l'enfant se
 * connecte quand il veut, contrairement à un calendrier de rendez-vous
 * réservés. Une évaluation proposée et reportée « à la prochaine fois » n'a
 * donc pas de jour à elle : elle vit dans une liste séparée, sous la grille.
 *
 * CETTE PAGE N'EST PLUS QUE SON ADRESSE ET SON BOUTON RETOUR.
 * -------------------------------------------------------------
 * Tout le reste — la reliure, le mois, sa légende, sa grille, le détail d'un
 * jour — vit dans `CalendrierContenu.js`, pour pouvoir être montré une
 * seconde fois : dans une fenêtre, côté administration (voir
 * `CalendrierEleveModale.js`), sur n'importe quel enfant.
 */
export default function CalendrierEleve() {
  const { eleveId } = useParams();
  const navigate = useNavigate();

  return (
    <section className="page calendrier-eleve">
      <button type="button" className="btn-ghost calendrier-eleve__retour" onClick={() => navigate(-1)}>
        ← Retour
      </button>

      {/* LA BULLE DE LA PAGE, CENTRÉE SOUS « RETOUR » — Camara, le
          14/09/2026 : l'illustration et le titre ensemble. Le même vert, la
          même illustration et la même phrase que la carte « Mon calendrier »
          qui mène ici : l'enfant retrouve en haut de la page ce sur quoi il
          vient de cliquer. Ici et pas dans `CalendrierContenu` : la fenêtre
          de l'administration a déjà son propre titre. */}
      <header className="bandeau-page">
        <img className="bandeau-page__illustration" src={iconeCalendrier} alt="" />
        <div>
          <h1>Mon calendrier</h1>
          <p>Tes vacances, tes cours, tes évaluations à venir</p>
        </div>
      </header>

      <CalendrierContenu eleveId={eleveId} chargerCalendrier={getCalendrier} />
    </section>
  );
}
