import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../lib/actions/authActions';
import { viserEssai } from '../lib/storage/essaiVise';
import { signalerVisite } from '../lib/storage/visite';
import { useEssaisOuverts } from '../lib/storage/modeTest';
import { getEquipe } from '../lib/api/referentielApi';
import Avatar from './Avatar';
import FondCraie from './FondCraie';
import MotifMatiere from './MotifMatiere';

/**
 * Séance rejouée en boucle dans le héros.
 *
 * Tout se joue à l'oral — c'est ça le produit. L'écrit n'apparaît que pour ce
 * qui est pénible à dicter : l'énoncé, posé sur l'ardoise pendant que le
 * professeur continue de parler. La démo doit montrer ces deux registres,
 * sinon on croit à un chat de plus.
 */
const SEANCE = [
  {
    role: 'agent',
    texte: 'Salut Emma, moi c’est Nora. Sur quoi tu as envie de travailler ?',
    duree: 2800,
  },
  {
    role: 'eleve',
    texte: 'Les fractions… j’y comprends rien.',
    duree: 2200,
  },
  {
    role: 'agent',
    texte: 'D’accord. Je te donne un exercice pour voir où tu en es — je te l’écris.',
    ardoise: 'Léa a une tarte coupée en 8 parts égales.\nElle en mange 3 parts.\n\nQuelle fraction a-t-elle mangée ?',
    duree: 4200,
  },
  {
    role: 'agent',
    texte: 'Dis-moi comment tu raisonnes pour trouver la fraction.',
    duree: 3000,
  },
];

/**
 * Barres animées : l'indicateur « quelqu'un est en train de parler ».
 *
 * `muettes` les rend invisibles SANS les retirer du flux. Les ôter ferait
 * gagner trente-deux pixels de largeur à la bulle, qui pourrait alors tenir
 * sur une ligne de moins — et toute la page remonterait d'un cran au moment
 * où le professeur cesse de parler.
 */
function Ondes({ variante, muettes = false }) {
  return (
    <span className={`ondes ondes--${variante}${muettes ? ' ondes--muettes' : ''}`}>
      <i /><i /><i /><i /><i />
    </span>
  );
}

function Seance() {
  const [etape, setEtape] = useState(0);

  // Chaque réplique reste affichée le temps qu'il faudrait pour la dire.
  useEffect(() => {
    const courante = SEANCE[Math.min(etape, SEANCE.length - 1)];
    const minuteur = setTimeout(
      () => setEtape((precedent) => (precedent >= SEANCE.length - 1 ? 0 : precedent + 1)),
      courante.duree,
    );
    return () => clearTimeout(minuteur);
  }, [etape]);

  return (
    <div className="demo" aria-hidden="true">
      <div className="demo__barre">
        <Avatar nom="nora" taille={38} parle={SEANCE[etape].role === 'agent'} />
        <span className="demo__prof">
          <strong>Nora</strong>
          <span>Professeure de mathématiques · 6e</span>
        </span>
        <span className="demo__direct">
          <i /> en cours
        </span>
      </div>

      <div className="demo__fil">
        {/*
          TOUTE LA SCÈNE EST MONTÉE DÈS LE DÉPART, MÊME CE QUI N'EST PAS
          ENCORE DIT.

          Les répliques n'apparaissaient qu'au fil de la boucle : la carte
          grandissait de trois cent quarante à cinq cents pixels, puis
          retombait d'un coup au recommencement. Comme elle est dans le flux
          de la page d'accueil, TOUT ce qui la suit sautait avec elle — et
          quelqu'un en train de faire défiler la page voit un site qui
          tressaute, pas une animation.

          Rendues invisibles plutôt qu'absentes, les répliques à venir
          occupent déjà leur place. La carte a donc, en permanence, la taille
          qu'elle aura à la fin — sans avoir à écrire cette hauteur en dur, ce
          qui redeviendrait faux au premier changement de texte ou de largeur
          d'écran.
        */}
        {SEANCE.map((replique, index) => {
          const parle = index === etape;
          const aVenir = index > etape;

          return (
            <div
              key={index}
              className={`demo__tour demo__tour--${replique.role}${
                aVenir ? ' demo__tour--a-venir' : ''
              }`}
            >
              <div
                className={`demo__bulle demo__bulle--${replique.role} ${
                  parle ? 'demo__bulle--parle' : ''
                }`}
              >
                <Ondes variante={replique.role} muettes={!parle} />
                <span>{replique.texte}</span>
              </div>

              {replique.ardoise && (
                <div className="demo__ardoise">
                  <span className="demo__ardoise-titre">Au tableau</span>
                  <pre>{replique.ardoise}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="demo__pied">
        <span className="demo__micro">
          <i />
        </span>
        Emma parle à Nora, Nora lui répond à voix haute
      </div>
    </div>
  );
}

/** Le graphe de prérequis : la remontée d'une lacune de 6e vers le CM2. */
function Remontee() {
  return (
    <div className="remontee" aria-hidden="true">
      <div className="remontee__noeud remontee__noeud--bloque">
        <span className="remontee__niveau">6e</span>
        <span className="remontee__libelle">Additionner des fractions</span>
        <span className="remontee__etat">bloqué</span>
      </div>

      <div className="remontee__lien"><span /></div>

      <div className="remontee__noeud">
        <span className="remontee__niveau">6e</span>
        <span className="remontee__libelle">Fractions égales</span>
        <span className="remontee__etat remontee__etat--fragile">fragile</span>
      </div>

      <div className="remontee__lien"><span /></div>

      <div className="remontee__noeud remontee__noeud--cause">
        <span className="remontee__niveau">CM2</span>
        <span className="remontee__libelle">Multiplication posée</span>
        <span className="remontee__etat remontee__etat--cause">la vraie cause</span>
      </div>
    </div>
  );
}

export default function Accueil() {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);
  const essaisOuverts = useEssaisOuverts();

  /**
   * On compte cette venue.
   *
   * ICI ET PAS DANS LE ROUTEUR : c'est la page de découverte. La compter
   * partout ferait entrer dans le chiffre les parents qui ouvrent
   * l'application tous les jours — ce sont des clients, pas des visiteurs, et
   * on sait déjà les compter autrement.
   *
   * Le module se tait de lui-même s'il s'est déjà signalé dans l'heure :
   * quelqu'un qui va voir les tarifs et revient ne compte qu'une fois.
   */
  useEffect(() => { signalerVisite(); }, []);

  /**
   * L'appel à l'action de l'accueil.
   *
   * SON TEXTE ET SON EFFET VONT ENSEMBLE, TOUJOURS.
   *
   * Essais ouverts : il promet du gratuit, donc il retient l'intention et
   * l'essai s'ouvre au retour de la connexion, sans détour par les tarifs.
   *
   * Essais fermés : il ne promet plus rien de gratuit — il dit « S'inscrire
   * maintenant » — et il ne pose AUCUNE intention. Garder le drapeau
   * « viser l'essai » avec un libellé qui ne le promet plus serait le pire des
   * deux : soit le serveur refuse et l'appel reste sans effet, soit il accepte
   * et on distribue un essai qu'on avait décidé de fermer.
   */
  const seConnecter = () => {
    if (essaisOuverts) viserEssai();

    // VERS L'INSCRIPTION, DANS LES DEUX CAS.
    //
    // « Commencer gratuitement » comme « S'inscrire maintenant » s'adressent à
    // quelqu'un qui n'a pas encore de compte : les déposer devant un champ de
    // mot de passe qu'il n'a jamais choisi lui demande de repérer un lien
    // discret pour arriver là où le bouton avait promis de le mener.
    //
    // Celui qui a déjà un compte n'est pas perdu pour autant : le formulaire
    // d'inscription porte « Vous avez déjà un compte ? Se connecter », et il
    // a « Connexion » dans la barre — c'est sa porte à lui.
    dispatch(login({ inscription: true }));
  };

  const libelleAction = essaisOuverts ? 'Commencer gratuitement' : "S'inscrire maintenant";

  /**
   * L'équipe pédagogique, lue au chargement.
   *
   * PAS PAR REDUX. Le magasin du référentiel sert l'espace connecté et ses
   * appels exigent un jeton ; cette page s'adresse à quelqu'un qui n'en a pas.
   * Un état local et un appel, c'est tout ce dont elle a besoin.
   *
   * UN ÉCHEC NE FAIT RIEN D'AUTRE QUE MASQUER LA SECTION. La page d'accueil
   * est la seule qu'un visiteur non inscrit verra jamais : elle ne doit ni
   * afficher d'erreur, ni cesser de se charger parce qu'une liste de prénoms
   * n'est pas revenue.
   */
  const [equipe, setEquipe] = useState([]);

  useEffect(() => {
    let vivant = true;

    getEquipe()
      .then(({ data }) => { if (vivant) setEquipe(data ?? []); })
      .catch(() => { /* section masquée, rien à dire au visiteur */ });

    // Le drapeau évite d'écrire dans un composant démonté : quelqu'un qui
    // clique sur « Commencer » pendant le chargement quitte la page avant la
    // réponse.
    return () => { vivant = false; };
  }, []);

  return (
    <div className="landing">
      {/* ----------------------------------------------------------- héros */}
      <section className="heros">
        <FondCraie />

        <div className="heros__texte">
          <span className="etiquette">Du CP à la Terminale</span>

          <h1>
            Des cours particuliers
            <br />
            d'une <em>nouvelle ère</em>.
          </h1>

          <p className="heros__pitch">
            Votre enfant a son professeur. Un prénom, un visage, une voix — et une
            mémoire qui le suit d'année en année. Ils se parlent, il écrit au
            tableau quand il faut écrire. Et il ne donne jamais la réponse : il
            cherche <em>où</em> ça bloque, et reprend depuis là.
          </p>

          {error && <div className="alert alert--heros">{error}</div>}

          <div className="heros__actions">
            <button type="button" className="btn btn--principal" onClick={seConnecter}>
              {libelleAction}
            </button>
            <a className="btn btn--fantome" href="#methode">
              Voir la méthode
            </a>
          </div>

          <p className="heros__note">
            Un seul compte parent · Tous vos enfants · Sans engagement
          </p>
        </div>

        <div className="heros__visuel">
          <Seance />
        </div>
      </section>

      {/* ---------------------------------------------------------- chiffres */}
      <section className="bandeau">
        <div>
          <strong>12</strong>
          <span>niveaux, du CP à la Terminale</span>
        </div>
        <div>
          <strong>24/7</strong>
          <span>disponible, même à 22h la veille du contrôle</span>
        </div>
        <div>
          <strong>1 seul</strong>
          <span>abonnement pour toute la fratrie</span>
        </div>
      </section>

      {/* ---------------------------------------------------------- méthode */}
      <section className="methode" id="methode">
        <header className="section__entete">
          <span className="etiquette etiquette--sombre">La méthode</span>
          <h2>Trois choses qu'un chatbot ne fait pas</h2>
        </header>

        <div className="methode__grille">
          <article className="tuile">
            <span className="tuile__num">01</span>
            <h3>Un professeur, pas un outil</h3>
            <p>
              Nora en maths, Adrien en français. Ils ont un prénom, un visage, et
              se souviennent de votre enfant. Ils lui parlent à voix haute, et
              écrivent au tableau ce qui doit être écrit — un calcul, un énoncé.
              Exactement comme en vrai.
            </p>
          </article>

          <article className="tuile">
            <span className="tuile__num">02</span>
            <h3>Il diagnostique avant d'expliquer</h3>
            <p>
              Avant la moindre explication, il demande ce que votre enfant a déjà
              essayé. Une seule question à la fois. On ne soigne pas ce qu'on n'a
              pas identifié.
            </p>
          </article>

          <article className="tuile">
            <span className="tuile__num">03</span>
            <h3>Il remonte à la vraie lacune</h3>
            <p>
              Un blocage en 4e vient rarement de la 4e. Notre graphe de compétences
              relie chaque notion à ses prérequis, jusqu'au primaire s'il le faut.
            </p>
          </article>
        </div>
      </section>

      {/* ------------------------------------------------------------ équipe */}
      {/* La section entière disparaît tant qu'il n'y a personne à montrer.
          Un titre « Une matière, un professeur » au-dessus d'une grille vide
          se lit comme une page cassée — et c'est la page qui vend. */}
      {equipe.length > 0 && (
      <section className="equipe">
        <header className="section__entete">
          <span className="etiquette">L'équipe pédagogique</span>
          <h2>Une matière, un professeur</h2>
          <p className="section__intro">
            Votre enfant retrouve le même professeur à chaque séance. C'est ce qui
            fait la différence entre un outil qu'on ouvre et quelqu'un qu'on revoit.
          </p>
        </header>

        {/* L'ÉQUIPE VIENT DU SERVEUR, ELLE N'EST PLUS RECOPIÉE ICI.
            -------------------------------------------------------
            Elle l'a été longtemps, et le défaut est apparu exactement comme on
            l'attendait : la philosophie ajoutée partout ailleurs — semeur,
            grille des matières, avatars — restait invisible sur la page
            d'accueil, parce que c'était le seul endroit qui ne lisait pas la
            base. Avant elle, deux teintes avaient déjà divergé.

            Une liste recopiée ne se trompe pas le jour où on l'écrit ; elle se
            trompe six mois plus tard, silencieusement, et sur la page que voit
            le plus de monde.

            LE REGROUPEMENT PAR VISAGE EST FAIT PAR LE SERVEUR. Yann tient deux
            matières et ne doit apparaître qu'une fois — la promesse de cette
            section est « une matière, un professeur », un Yann en double la
            démentirait à l'écran.

            LE MOTIF EST CELUI DE L'ESPACE ENFANT, PAS UN AUTRE. Ces cartes
            annoncent ce que l'enfant retrouvera : même professeur, même
            couleur, même objet. Deux vocabulaires pour la même matière et la
            promesse sonnerait faux dès la première connexion. */}
        <ul className="equipe__grille">
          {equipe.map((prof) => (
            <li key={prof.avatar} className="prof" style={{ '--teinte': prof.couleur }}>
              <MotifMatiere code={prof.code} />
              <Avatar nom={prof.avatar} taille={72} couleur={prof.couleur} />
              <strong>{prof.prenom}</strong>

              {/* Le séparateur se décide ICI et pas au serveur : « Sciences et
                  technologie et Physique-Chimie » serait illisible, et c'est
                  une question de mise en forme, pas de données. */}
              <span>{prof.matieres?.join(' · ')}</span>
            </li>
          ))}
        </ul>
      </section>
      )}

      {/* ------------------------------------------------------------ graphe */}
      <section className="graphe">
        <div className="graphe__texte">
          <span className="etiquette">Ce qui nous distingue</span>
          <h2>La mémoire d'un vrai prof particulier</h2>
          <p>
            Chaque échange nourrit un profil qui suit votre enfant d'année en année.
            Quand il bloque sur les fractions en 6e, l'IA sait que la cause est une
            multiplication mal ancrée en CM2 — et reprend là, pas ailleurs.
          </p>
          <p className="graphe__appui">
            C'est exactement ce que fait un professeur particulier expérimenté après
            trois séances. Sauf qu'ici, c'est acquis dès la première.
          </p>
        </div>

        <div className="graphe__visuel">
          <Remontee />
        </div>
      </section>

      {/* ------------------------------------------------------------ parents */}
      <section className="parents">
        <header className="section__entete">
          <span className="etiquette etiquette--sombre">Pour les parents</span>
          <h2>Vous gardez la main</h2>
        </header>

        <div className="parents__grille">
          <div className="point">
            <h3>Un compte, plusieurs enfants</h3>
            <p>Vous créez un profil par enfant. Chacun a son professeur, son niveau, son rythme.</p>
          </div>
          <div className="point">
            <h3>Adapté à l'âge, pas seulement à la classe</h3>
            <p>Un élève de 14 ans en 5e n'est pas traité comme un enfant de 11 ans.</p>
          </div>
          <div className="point">
            <h3>Jamais la réponse toute faite</h3>
            <p>Impossible de s'en servir pour faire ses devoirs à sa place. C'est le principe.</p>
          </div>
          <div className="point">
            <h3>Vos données restent les vôtres</h3>
            <p>Hébergement en Europe, conservation limitée, suppression sur simple demande.</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ final */}
      <section className="final">
        <h2>Essayez ce soir sur son prochain devoir.</h2>
        <p>Création du compte en une minute. Premier échange dans la foulée.</p>
        {/* Celui-ci dit « créer un compte » : il mène donc au formulaire
            d'INSCRIPTION, pas à celui de connexion. Il ne pose pas non plus
            d'intention d'essai — c'est le bouton du héros qui porte la
            promesse de gratuité, et un seul chemin doit l'ouvrir. */}
        <button
          type="button"
          className="btn btn--principal btn--large"
          onClick={() => dispatch(login({ inscription: true }))}
        >
          Créer mon compte parent
        </button>
      </section>
    </div>
  );
}
