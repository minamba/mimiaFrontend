import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { chargerEleves, selectionnerEleve } from '../lib/actions/elevesActions';
import { getCapaciteEnfants } from '../lib/api/abonnementApi';
import { couleurEleve, couleurEleveClaire } from '../lib/couleurEleve';
import Loader from './Loader';
import QuotaEnfants from './QuotaEnfants';
import BoutonTheme from './BoutonTheme';
import CodeEnfant from './CodeEnfant';

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

  // L'enfant dont on regarde le code, ou null. Une seule fenêtre pour toute
  // la liste : jamais deux codes à l'écran en même temps.
  const [codeDe, setCodeDe] = useState(null);

  // Échap referme, comme partout ailleurs dans l'application.
  useEffect(() => {
    if (!codeDe) return undefined;

    const auClavier = (e) => { if (e.key === 'Escape') setCodeDe(null); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [codeDe]);

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

        {/* PAS DE BOUTON D'AJOUT ICI.

            Il y en avait un, et son propre commentaire disait pourquoi il ne
            fallait pas le doubler quand la formule est pleine : « deux boutons
            vers la même page, à dix centimètres l'un de l'autre, ne donnent
            aucun choix supplémentaire ». L'argument valait aussi contre lui —
            la tuile en fin de grille mène exactement au même endroit.

            C'est elle qui reste, et pas l'inverse : elle est à côté des enfants
            dont on veut la compagnie, elle se trouve encore quand la liste
            s'allonge, et elle disparaît d'elle-même quand la formule est
            pleine.

            C'EST DONC ICI QU'ON MET « MON COMPTE ».
            La pastille du menu, en haut de page, est trop discrète pour
            servir de point d'entrée principal — elle est faite pour un
            visiteur qui SAIT déjà où cliquer, pas pour l'annoncer. Sur la
            première page qu'un parent voit après connexion, ce bouton-ci se
            voit tout de suite.

            LE CONTOUR SEUL NE SUFFISAIT PAS, ET LA PASTILLE NON PLUS.
            Un bouton à peine plus marqué que le fond de la page reste un
            détail qu'on doit chercher — c'est exactement le défaut qu'on
            reprochait à la pastille de la barre. `btn` est le VRAI bouton
            d'appel du site, le même corail que « Créer le premier profil » :
            il n'y a plus à le repérer, il saute aux yeux. Et sans icône, il
            n'y a rien d'autre à lire que son texte. */}
        <div className="page__entete-actions">
          {/* MÊME RÉGLAGE QUE « MES PARAMÈTRES » ET « MES MATIÈRES »
              (voir `GrilleMatieres.js`) — proposer ce raccourci ici n'en crée
              pas un second, ça donne juste un chemin de plus vers le même
              bouton, sur la première page qu'un parent ouvre après
              connexion. */}
          <BoutonTheme />
          <Link to="/profil" className="btn page__bouton-compte">
            Mon compte
          </Link>
        </div>
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
                {/* LE CALENDRIER EST UN LIEN À CÔTÉ DU BOUTON, PAS DEDANS —
                    même construction que les fiches de révision sous une
                    matière (voir `CarteMatiere` dans `GrilleMatieres.js`) : un
                    lien imbriqué dans un bouton n'est pas du HTML valide, et
                    se comporte mal au clavier. */}
                <div className="eleve-case" style={{ '--teinte': couleur }}>
                  <button
                    type="button"
                    className="eleve-carte"
                    onClick={() => ouvrir(eleve)}
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

                  {/* MÊME PAGE QUE CELLE DE L'ENFANT, littéralement : pas une
                      vue « admin » du calendrier, le même composant, la même
                      route — seul le lecteur change. */}
                  <Link
                    to={`/eleves/${eleve.id}/calendrier`}
                    className="eleve-bandeau eleve-bandeau--calendrier"
                  >
                    <span className="eleve-bandeau__emoji" aria-hidden="true">📅</span>
                    Calendrier de {eleve.prenom}
                    <span className="eleve-bandeau__fleche" aria-hidden="true">→</span>
                  </Link>

                  <Link
                    to={`/eleves/${eleve.id}/fiche`}
                    // D'OÙ ON VIENT, PAS SEULEMENT OÙ ON VA.
                    // La fiche a deux portes d'entrée — celle-ci et « Mon
                    // compte » — et son bouton retour doit ramener par la
                    // même porte, pas toujours vers l'une des deux (voir
                    // `PageEleve.js`).
                    state={{ depuis: 'mes-enfants' }}
                    className="eleve-bandeau eleve-bandeau--fiche"
                  >
                    <span className="eleve-bandeau__emoji" aria-hidden="true">📋</span>
                    Fiche de {eleve.prenom}
                    <span className="eleve-bandeau__fleche" aria-hidden="true">→</span>
                  </Link>

                  {/* « VOIR SON CODE » — Camara, le 14/09/2026. Le parent vient
                      ici quand l'enfant dit « j'ai oublié mon code » : c'est la
                      première page qu'il voit, pas « Mon compte ». Un bouton et
                      non un lien : il ouvre une fenêtre, il ne mène nulle part.
                      Le code n'est chargé qu'à l'ouverture (voir `CodeEnfant`). */}
                  <button
                    type="button"
                    className="eleve-bandeau eleve-bandeau--code"
                    onClick={() => setCodeDe(eleve)}
                  >
                    <span className="eleve-bandeau__emoji" aria-hidden="true">🔑</span>
                    Voir son code
                    <span className="eleve-bandeau__fleche" aria-hidden="true">→</span>
                  </button>
                </div>
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

      {codeDe && (
        <div
          className="modale"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-code-enfant"
        >
          {/* AUX COULEURS DE L'ENFANT, voulu par Camara le 15/09/2026 : la
              fenêtre reprend la teinte de sa carte et son initiale. On sait
              de qui on lit le code avant même d'avoir lu le prénom — et avec
              plusieurs enfants, c'est ce qui évite de dicter le mauvais. */}
          <div
            className="modale__boite modale__boite--code"
            style={{ '--teinte': couleurEleve(codeDe), '--teinte-claire': couleurEleveClaire(codeDe) }}
          >
            <header className="code-modale__entete">
              <span className="code-modale__initiale" aria-hidden="true">
                {codeDe.prenom?.charAt(0)?.toUpperCase()}
              </span>
              <div className="code-modale__titres">
                <p className="code-modale__surtitre">
                  <span aria-hidden="true">🔑 </span>Code d’accès
                </p>
                <h2 id="titre-code-enfant">Le code de {codeDe.prenom}</h2>
              </div>
            </header>

            <CodeEnfant eleve={codeDe} avecActions={false} />

            <p className="code-enfant__renvoi">
              Pour suspendre son accès ou lui créer un nouveau code, passez
              par <Link to="/profil">Mon compte</Link>.
            </p>

            <div className="modale__actions">
              <button type="button" className="btn-ghost" onClick={() => setCodeDe(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
