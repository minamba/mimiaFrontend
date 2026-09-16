import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { login } from '../lib/actions/authActions';
import { viserEssai } from '../lib/storage/essaiVise';
import { signalerVisite } from '../lib/storage/visite';
import { useEssaisOuverts } from '../lib/storage/modeTest';
import { getEquipe, getAnneeScolaire } from '../lib/api/referentielApi';
import { libelleProgrammes } from '../lib/storage/anneeScolaire';
import Avatar from './Avatar';
import FondCraie from './FondCraie';
import MotifMatiere from './MotifMatiere';
import AvisClients from './AvisClients';
import FicheProfesseur from './FicheProfesseur';
import Faq from './Faq';
import ApercuParent from './ApercuParent';
import Comparatif from './Comparatif';
import ExercicesLangue from './ExercicesLangue';
import BandeauPromo from './BandeauPromo';
import CompteARebours from './CompteARebours';
import iconeVoix from '../assets/voix.png';
import iconeTableau from '../assets/tableau.png';
import iconeCerveau from '../assets/cerveau.png';
import iconeSuivi from '../assets/suivi.png';
import iconeNoReponse from '../assets/noreponse.png';
import iconeDonnees from '../assets/data.png';
import iconeEnfants from '../assets/many.png';
import iconeAge from '../assets/age.png';

/**
 * Les quatre mots qui disent le produit, sous la démonstration.
 *
 * Les icônes sont des images depuis le 12/09/2026, à la place des emojis :
 * elles ne dépendent plus de la police du système — c'est ce qui faisait
 * afficher « GB » au lieu d'un drapeau sous Windows, un peu plus bas.
 *
 * `alt` vide, et c'est voulu : le titre est juste en dessous, en toutes
 * lettres. Le décrire une seconde fois ferait répéter chaque item aux
 * lecteurs d'écran.
 */
const PREUVES = [
  {
    icone: iconeVoix,
    titre: 'Une vraie conversation',
    texte: 'Il écoute votre enfant et lui répond en temps réel.',
    halo: true,
  },
  {
    icone: iconeTableau,
    titre: 'Un tableau',
    texte: 'Il écrit ce qui doit être vu pour être compris.',
  },
  {
    icone: iconeCerveau,
    titre: 'Une mémoire',
    texte: 'Il se souvient, d’une séance à l’autre.',
  },
  {
    icone: iconeSuivi,
    titre: 'Un vrai suivi',
    texte: 'Vous recevez son bilan chaque semaine.',
  },
];

/**
 * Les quatre craintes d'un parent, dans l'ordre où elles se présentent.
 *
 * « Il va lui donner les réponses » vient en premier : c'est celle qui fait
 * renoncer. Les icônes sont des images, comme celles de la bande de preuve.
 */
const CONFIANCE = [
  {
    icone: iconeNoReponse,
    titre: 'Jamais la réponse toute faite',
    texte: "Impossible de s'en servir pour faire ses devoirs à sa place. C'est le principe.",
  },
  {
    icone: iconeDonnees,
    titre: 'Vos données restent les vôtres',
    texte: 'Hébergement en Europe, conservation limitée, suppression sur simple demande.',
  },
  {
    icone: iconeEnfants,
    titre: 'Un compte, plusieurs enfants',
    texte: 'Vous créez un profil par enfant. Chacun a son professeur, son niveau, son rythme.',
  },
  {
    icone: iconeAge,
    titre: "Adapté à l'âge, pas seulement à la classe",
    texte: "Un élève de 14 ans en 5e n'est pas traité comme un enfant de 11 ans.",
  },
];

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

  // Le professeur dont la fiche est ouverte, ou null. Une seule fiche à la
  // fois, comme le code d'un enfant sur « Vos enfants ».
  const [profOuvert, setProfOuvert] = useState(null);

  // « PROGRAMMES OFFICIELS 2026-2027 », À CÔTÉ DU TITRE — voulu par Camara le
  // 13/09/2026, et JAMAIS écrit en dur : le serveur le calcule avec le
  // référentiel, et le 1er août il passera à l'année suivante tout seul. Le
  // repli local applique la même règle, pour qu'un réseau capricieux ne
  // laisse pas un badge vide ou une année périmée.
  const [programmes, setProgrammes] = useState(() => libelleProgrammes());

  useEffect(() => {
    let vivant = true;

    getEquipe()
      .then(({ data }) => {
        if (!vivant) return;
        // MINAMBA FERME LA GRILLE — Camara, le 16/09/2026 : « change la position
        // de Minamba avec Jeanne ». L'ordre du serveur (celui des matières)
        // plaçait la NSI avant l'EPPCS et les arts ; seul l'affichage de
        // l'équipe change, pas l'ordre de la grille des matières. Le tri est
        // stable : les autres gardent leur place.
        const ordre = [...(data ?? [])].sort(
          (a, b) => Number(a.avatar === 'minamba') - Number(b.avatar === 'minamba'),
        );
        setEquipe(ordre);
      })
      .catch(() => { /* section masquée, rien à dire au visiteur */ });

    getAnneeScolaire()
      .then(({ data }) => { if (vivant && data?.libelle) setProgrammes(data.libelle); })
      .catch(() => { /* le repli local est déjà affiché */ });

    // Le drapeau évite d'écrire dans un composant démonté : quelqu'un qui
    // clique sur « Commencer » pendant le chargement quitte la page avant la
    // réponse.
    return () => { vivant = false; };
  }, []);

  return (
    <>
      {/* HORS DE `.landing`, ET C’EST TOUTE LA DIFFÉRENCE.

          Le visuel doit courir d’un bord à l’autre de l’écran. Placé dans
          `.landing` — une colonne de 1 180 px avec 28 px de marge — il
          s’arrêtait à un huitième de l’écran de chaque côté, et on voyait
          deux bandes sombres encadrer une image censée être pleine largeur.

          Le sortir du conteneur plutôt que le déborder au `calc(-50vw)` :
          `100vw` compte la barre de défilement, donc cette astuce ajoute
          une quinzaine de pixels de débordement horizontal sur Windows —
          et une barre de défilement horizontale sur toute la page d’accueil.

          AVANT LE HÉROS, ET SEULEMENT SUR CETTE PAGE. Avant, parce qu’une
          promotion placée sous le héros n’est vue que par ceux qui font
          défiler — et ce sont ceux qui étaient déjà convaincus. Seulement
          ici, parce qu’un parent venu travailler avec son enfant n’a pas à
          voir une remise sur chaque écran.

          Ne rend RIEN quand il n’y a pas de promotion en cours, ce qui est
          l’état ordinaire du site. */}
      <BandeauPromo />

      <div className="landing">
          {/* APRÈS LE VISUEL, AVANT LE HÉROS. L’un annonce, l’autre presse :
              les mettre côte à côte donnerait deux appels à l’action qui se
              disputent le même regard.

              Celui-ci reste DANS la colonne : c’est une carte, pas une bande.
              Étirée d’un bord à l’autre, elle n’aurait plus de forme. */}
          <CompteARebours />

        {/* ----------------------------------------------------------- héros */}
        <section className="heros">
          <FondCraie />

          <div className="heros__texte">
            {/* LE TITRE PART DU PROBLÈME DU PARENT, PAS DE LA CATÉGORIE.
                Personne ne cherche « des cours particuliers d'une nouvelle
                ère » : on cherche parce qu'un enfant bloque, que les notes
                tombent, et qu'on ne sait plus comment l'aider. La formule de
                marque reste, mais au-dessus — elle signe, elle ne vend pas. */}
            <span className="etiquette">Le professeur particulier d'une nouvelle ère</span>

            <h1>
              Votre enfant bloque&nbsp;?
              <br />
              Son professeur cherche <em>pourquoi</em>.
            </h1>

            {/* LE BADGE DES PROGRAMMES, JUSTE SOUS LE TITRE. Essayé sous les
                boutons le 14/09/2026, puis remis ici par Camara : il y perdait
                sa visibilité. Une bulle qui respire — pas un clignotement :
                elle attire l'œil une fois, puis se tient tranquille. Le
                drapeau est dessiné en CSS, pas en emoji : l'emoji 🇫🇷
                s'affiche « FR » en lettres sur Windows, qui n'a pas de
                drapeaux. */}
            <span className="hero__programmes" data-testid="badge-programmes">
              <span className="hero__drapeau" aria-hidden="true" />
              {programmes}
            </span>

            {/* « IL LUI PARLE » RESTE EN GRAS CORAIL — c'est l'argument que
                Camara tenait à mettre en avant le 12/09/2026, et le seul que
                cette page ne peut pas prouver d'elle-même : la démonstration
                à côté le montre, mais elle ne peut pas se faire entendre. */}
            <p className="heros__pitch">
              Un professeur particulier disponible quand votre enfant en a besoin,
              qui <strong>lui parle en temps réel</strong>, détecte ses lacunes et
              se souvient de sa progression.
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

            {/* CE QUI LÈVE LE RISQUE, SOUS LE BOUTON ET NULLE PART AILLEURS.
                Les trois sont vrais : l'offre d'essai ne porte aucun
                identifiant de paiement — donc aucune carte n'est demandée
                pour essayer — et aucune formule n'engage sur la durée. */}
            <p className="heros__note">
              30 minutes offertes · Sans carte bancaire · Du CP à la Terminale
            </p>
          </div>

          <div className="heros__visuel">
            <Seance />
          </div>
        </section>

        {/* ------------------------------------------------------- la preuve
            QUATRE MOTS POUR DIRE LE PRODUIT, JUSTE SOUS LA DÉMO. Le bandeau
            portait trois chiffres — 12 niveaux, 24/7, 1 compte — tous déjà
            dits ailleurs : l'étiquette du héros, son pitch, le bloc des prix.
            À cette place, ce qu'un parent a besoin de comprendre n'est pas un
            chiffre, c'est ce que fait le professeur.

            « 1 seul abonnement pour toute la fratrie » a disparu avec eux, et
            ce n'est pas un regret : c'était vrai du COMPTE, faux du prix, et
            le bloc des tarifs le démentait deux écrans plus bas. */}
        <section className="preuve">
          {PREUVES.map((preuve) => (
            <div key={preuve.titre} className="preuve__item">
              <img
                className={`preuve__icone${preuve.halo ? ' preuve__icone--halo' : ''}`}
                src={preuve.icone}
                alt=""
              />
              <strong className={preuve.halo ? 'preuve__titre--halo' : undefined}>
                {preuve.titre}
              </strong>
              <span>{preuve.texte}</span>
            </div>
          ))}
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

        {/* LA DICTÉE ET L'ÉCOUTE, MONTRÉES. C'est ce qu'aucun chatbot ne fait,
            et ça ne se raconte pas : la correction affichée ici est rendue par
            le composant du produit lui-même. */}
        <ExercicesLangue />

        {/* ------------------------------------------------------------ équipe */}
        {/* La section entière disparaît tant qu'il n'y a personne à montrer.
            Un titre « Une matière, un professeur » au-dessus d'une grille vide
            se lit comme une page cassée — et c'est la page qui vend. */}
        {equipe.length > 0 && (
        <section className="equipe">
          <header className="section__entete">
            <span className="etiquette">L'équipe pédagogique</span>
            <h2>
              Une matière, <em className="titre-accent">un professeur</em>
            </h2>
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
              <li key={prof.avatar}>
                {/* LA CARTE OUVRE SA FICHE — Camara, le 15/09/2026. Un bouton et
                    non un lien : elle ouvre une fenêtre, elle ne mène nulle
                    part. La carte ne dit plus que la matière ; le détail des
                    disciplines est dans la fiche. */}
                <button
                  type="button"
                  className="prof"
                  style={{ '--teinte': prof.couleur }}
                  aria-haspopup="dialog"
                  onClick={() => setProfOuvert(prof)}
                >
                  <MotifMatiere code={prof.code} />
                  <Avatar nom={prof.avatar} taille={96} couleur={prof.couleur} />
                  <strong>{prof.prenom}</strong>

                  {/* Le titre choisi pour la carte ; la liste d'avant en repli,
                      tant qu'un serveur plus ancien ne le fournit pas. */}
                  <span>{prof.titre || prof.matieres?.join(' · ')}</span>
                  <span className="prof__voir">Voir sa fiche <span aria-hidden="true">→</span></span>
                </button>
              </li>
            ))}
          </ul>

          {profOuvert && (
            <FicheProfesseur prof={profOuvert} onFermer={() => setProfOuvert(null)} />
          )}
        </section>
        )}

        {/* ------------------------------------------------------------ graphe */}
        <section className="graphe">
          <div className="graphe__texte">
            <span className="etiquette">Ce qui nous distingue</span>
            {/* La mémoire en sarcelle, comme « la vraie cause » du graphe d'à côté. */}
            <h2>
              La <em className="titre-accent titre-accent--sarcelle">mémoire</em> d'un vrai prof particulier
            </h2>
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
          {/* RETITRÉE : « Pour les parents » servait deux fois, ici et sur
              l'aperçu du suivi. Celle-ci ne parle pas de suivi, elle répond à
              la peur — « il va lui donner les réponses », « où vont ses
              données ». C'est de la confiance, pas du tableau de bord. */}
          <header className="section__entete">
            <span className="etiquette etiquette--sombre">La confiance</span>
            <h2>
              Conçu pour les <em className="titre-accent">enfants</em>. Pensé pour rassurer les parents.
            </h2>
          </header>

          <div className="parents__grille">
            {CONFIANCE.map((point) => (
              <div key={point.titre} className="point">
                <img className="point__icone" src={point.icone} alt="" />
                <h3>{point.titre}</h3>
                <p>{point.texte}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LE SUIVI PARENT, MONTRÉ. C'est ce qui fait renouveler l'abonnement :
            le parent doit voir, avant de payer, ce qu'il verra chaque semaine. */}
        <ApercuParent />

        {/* Puis l'objection que tout le monde se pose, traitée de face. */}
        <Comparatif />

        {/* ------------------------------------------------------------- prix
            L'ORDRE DE GRANDEUR AVANT LA PAGE DES TARIFS. Un parent qui parcourt
            toute la page sans voir un prix se dit « ça doit être cher », et
            découvre 39,90 € au pire moment. Comparé à une heure de cours
            particulier, le même chiffre devient bon marché.

            RIEN N'EST ARRONDI EN NOTRE FAVEUR : les heures et les prix sont
            ceux des formules réelles, et le prix par enfant est calculé sur le
            nombre d'enfants réellement couverts. */}
        <section className="prix-apercu">
          <header className="section__entete">
            <span className="etiquette">Les tarifs</span>
            {/* LE TITRE NOMME LES DEUX TERMES DE LA COMPARAISON — relevé par
                Camara le 12/09/2026 : « le prix d'une heure de cours, pour le
                mois entier » laissait deviner de quelle heure on parlait, et
                de quel côté était Mimia. Ici, « cours particulier » désigne
                sans ambiguïté le professeur humain, et « un mois entier » ce
                qu'on obtient pour le même prix. */}
            <h2>Un mois entier, pour le prix d’une heure de cours particulier</h2>
          </header>

          {/* UN SEUL PRIX, PAS TROIS FORMULES — voulu par Camara le
              12/09/2026. Trois cartes obligeaient le parent à comparer et à
              choisir avant même d'avoir envie du produit ; c'est le travail de
              la page des tarifs, pas de la page qui donne envie.

              LA COMPARAISON EST VRAIE, ET C'EST CE QUI LA REND UTILISABLE :
              une heure de cours particulier se paie 30 à 50 €, 39,90 € tombe
              dans cette fourchette. La phrase reste donc défendable devant un
              parent qui connaît les tarifs — et le chiffre est écrit juste en
              dessous pour qu'il puisse vérifier lui-même. */}
          <div className="prix-phare">
            <div className="prix-phare__montant">
              <span className="prix-phare__depuis">À partir de</span>
              <strong>39,90 €<small>/mois</small></strong>
              {/* Le prix à l'heure a migré dans la confrontation, plus bas :
                  l'afficher aux deux endroits ferait lire deux fois le même
                  chiffre à quelques centimètres d'écart. */}
            </div>

            <ul className="prix-phare__points">
              <li>9 h de cours par mois, quand il en a besoin</li>
              <li>Toutes les matières, du CP à la Terminale</li>
              <li>Sans engagement : vous arrêtez quand vous voulez</li>
            </ul>

            {/* L'ARGUMENT LE PLUS FORT ÉTAIT LA LIGNE LA PLUS DISCRÈTE.
                ------------------------------------------------------
                Relevé par Camara le 12/09/2026 : « je ne l'avais même pas
                vu ». Le tarif d'un professeur humain justifie tout le titre
                de la section, et il était en gris clair, centré, noyé dans
                une phrase qui parlait aussi de la fratrie.

                COMPARÉ À UNITÉ ÉGALE, ET C'EST CE QUI REND L'ÉCART LISIBLE :
                mettre « 30 à 50 € l'heure » en face de « 39,90 € le mois »
                demande un calcul. En ramenant les deux à l'heure, le parent
                n'a plus rien à calculer — il voit. */}
            <div className="prix-phare__duel">
              <div className="prix-phare__camp">
                <span className="prix-phare__qui">Un professeur particulier</span>
                <strong className="prix-phare__combien">30 à 50 €</strong>
                <span className="prix-phare__unite">l’heure</span>
              </div>

              <span className="prix-phare__contre" aria-hidden="true">vs</span>

              <div className="prix-phare__camp prix-phare__camp--nous">
                <span className="prix-phare__qui">Avec Mimia</span>
                <strong className="prix-phare__combien">4,43 €</strong>
                <span className="prix-phare__unite">l’heure</span>
              </div>
            </div>
          </div>

          {/* Les autres formules restent à un clic : cacher qu'elles existent
              se retournerait à l'écran de paiement, où un parent de trois
              enfants découvrirait que Solo n'en couvre qu'un. */}
          {/* Le tarif du professeur humain est remonté dans la carte : il ne
              reste ici que ce qui est vraiment secondaire. */}
          <p className="prix-apercu__note">
            Plusieurs enfants&nbsp;? Les formules Duo et Famille partagent un même
            pot d’heures.{' '}
            <Link to="/tarifs">Voir toutes les formules</Link>
          </p>
        </section>

        {/* PLACÉE JUSTE AVANT L'APPEL FINAL, et pas plus haut : les avis
            répondent à la dernière hésitation, celle qui précède la décision.
            Au milieu de la page, ils seraient lus avant que la question ne se
            pose. */}
        <AvisClients />

        {/* LES QUESTIONS FRÉQUENTES, APRÈS LES AVIS ET AVANT L'APPEL FINAL —
            Camara, le 15/09/2026. Les avis rassurent sur le résultat ; les
            questions lèvent les dernières objections pratiques (triche,
            données, engagement) juste avant le bouton qui décide. */}
        <Faq />

        {/* ------------------------------------------------------------ final */}
        <section className="final">
          <h2>
            Essayez <em className="titre-accent">ce soir</em> sur son prochain devoir.
          </h2>
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
    </>
  );
}
