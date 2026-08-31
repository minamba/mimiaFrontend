import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { chargerEleves, selectionnerEleve } from '../lib/actions/elevesActions';
import { getCapaciteEnfants } from '../lib/api/abonnementApi';
import { couleurEleve } from '../lib/couleurEleve';
import Loader from './Loader';
import QuotaEnfants from './QuotaEnfants';

/**
 * Ancienneté en clair. « 2026-07-26T20:18 » ne dit rien à un parent ;
 * « il y a 2 jours » lui dit s'il doit relancer son enfant.
 */
function derniereFois(valeur) {
  if (!valeur) return { texte: 'Pas encore commencé', etat: 'neuf' };

  const jours = Math.floor((Date.now() - new Date(valeur).getTime()) / 86400000);

  if (jours <= 0) return { texte: "Travaillé aujourd'hui", etat: 'actif' };
  if (jours === 1) return { texte: 'Travaillé hier', etat: 'actif' };
  if (jours < 7) return { texte: `Il y a ${jours} jours`, etat: 'actif' };
  if (jours < 30) return { texte: `Il y a ${Math.floor(jours / 7)} semaines`, etat: 'tiede' };

  return {
    texte: `Depuis le ${new Date(valeur).toLocaleDateString('fr-FR')}`,
    etat: 'froid',
  };
}

export default function ListeEleves() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { liste, loading, error } = useSelector((state) => state.eleves);

  // Ce que la formule autorise. Null tant qu'on ne sait pas : on n'affiche
  // alors aucun blocage, pour ne pas interdire à tort le temps d'un chargement.
  const [capacite, setCapacite] = useState(null);

  useEffect(() => {
    dispatch(chargerEleves());

    getCapaciteEnfants()
      .then(({ data }) => setCapacite(data))
      .catch(() => {
        // Sans cette information, on laisse l'ajout ouvert : le serveur
        // refusera de toute façon, avec un message précis.
      });
  }, [dispatch]);

  const complet = capacite !== null && !capacite.peutAjouter;

  const ouvrir = (eleve) => {
    dispatch(selectionnerEleve(eleve));
    navigate(`/eleves/${eleve.id}/matieres`);
  };

  if (loading) return <Loader texte="Chargement des profils…" />;

  return (
    <section className="page page--large">
      <div className="page__entete">
        <div>
          <h1>Vos enfants</h1>
          <p className="page__sous-titre">
            Chacun a son espace, ses professeurs et sa progression.
          </p>
        </div>

        {/* PLUS DE BOUTON D'AJOUT ICI.

            Il y en avait un, et son propre commentaire disait pourquoi il ne
            fallait pas le doubler quand la formule est pleine : « deux boutons
            vers la même page, à dix centimètres l'un de l'autre, ne donnent
            aucun choix supplémentaire ». L'argument valait aussi contre lui —
            la tuile en fin de grille mène exactement au même endroit.

            C'est elle qui reste, et pas l'inverse : elle est à côté des enfants
            dont on veut la compagnie, elle se trouve encore quand la liste
            s'allonge, et elle disparaît d'elle-même quand la formule est
            pleine. */}
      </div>

      {error && <div className="alert">{error}</div>}

      {complet && <QuotaEnfants capacite={capacite} enPage />}

      {liste.length === 0 ? (
        <div className="accueil-vide">
          <span className="accueil-vide__illu" aria-hidden="true">
            👋
          </span>
          <h2>Créez le profil de votre enfant</h2>
          <p>
            Son prénom, sa classe et son âge suffisent. Son professeur l'attend
            derrière, et se souviendra de lui d'une séance à l'autre.
          </p>
          <Link to="/eleves/nouveau" className="btn">
            Créer le premier profil
          </Link>
        </div>
      ) : (
        <ul className="eleves">
          {liste.map((eleve) => {
            const activite = derniereFois(eleve.derniereActivite);
            const couleur = couleurEleve(eleve);

            return (
              <li key={eleve.id}>
                <button
                  type="button"
                  className="eleve-carte"
                  onClick={() => ouvrir(eleve)}
                  style={{ '--teinte': couleur }}
                >
                  {/* Bandeau de couleur : la carte se reconnaît de loin, avant
                      même que le prénom soit lisible. */}
                  <span className="eleve-carte__bande" aria-hidden="true" />

                  <span className="eleve-carte__haut">
                    <span className="eleve-carte__initiale">
                      {eleve.prenom?.charAt(0)?.toUpperCase()}
                    </span>

                    <span className="eleve-carte__identite">
                      <strong>{eleve.prenom}</strong>
                      <span className="eleve-carte__badges">
                        <span className="badge">{eleve.niveauLibelle}</span>
                        <span className="badge badge--discret">{eleve.age} ans</span>
                      </span>
                    </span>
                  </span>

                  <span className={`eleve-carte__activite eleve-carte__activite--${activite.etat}`}>
                    <span className="pastille" aria-hidden="true" />
                    {activite.texte}
                  </span>

                  <span className="eleve-carte__action">
                    {eleve.derniereActivite ? 'Reprendre le cours' : 'Commencer'}
                    <span aria-hidden="true">→</span>
                  </span>
                </button>
              </li>
            );
          })}

          {/* Tuile d'ajout en fin de grille, et seul chemin vers l'ajout depuis
              cette page. À sa place : avec six enfants, un bouton isolé en haut
              devenait difficile à retrouver. Elle disparaît quand la formule
              est pleine — un « + » qui mène à un refus est une invitation
              malhonnête, et l'encadré de quota prend alors le relais avec
              l'explication. */}
          {!complet && (
            <li>
              <Link to="/eleves/nouveau" className="eleve-ajout">
                <span className="eleve-ajout__signe" aria-hidden="true">
                  +
                </span>
                Ajouter un enfant
              </Link>
            </li>
          )}
        </ul>
      )}

    </section>
  );
}
