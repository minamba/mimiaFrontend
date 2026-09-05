import { useEffect, useMemo, useState } from 'react';
import { estIOS } from '../lib/storage/appareil';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import { couleurEleve, couleurEleveClaire } from '../lib/couleurEleve';
import { sessionEleve } from '../lib/storage/sessionEleve';
import { getNombreFiches, getEvaluations, getMatieresEleve } from '../lib/api/elevesApi';
import Avatar from './Avatar';
import MotifMatiere from './MotifMatiere';
import Loader from './Loader';

/**
 * Ce qu'on promet à l'élève pour chaque matière, en une phrase.
 * Un nom de matière seul ne donne envie à personne ; « on lit, on écrit, on
 * raconte » dit à un enfant ce qu'il va faire.
 */
/**
 * Durées de séance proposées avant d'entrer en cours.
 *
 * Un cours sans fin annoncée s'étire ou s'interrompt n'importe où. Fixer la
 * durée à l'avance donne un cadre : l'élève sait combien de temps il s'engage,
 * et le professeur sait quand conclure proprement.
 */
const DUREES = [
  { minutes: 15, libelle: 'Rapide', detail: 'Une notion, une question', ton: 1 },
  { minutes: 25, libelle: 'Court', detail: 'De quoi avancer sur un point', ton: 2 },
  { minutes: 35, libelle: 'Complet', detail: 'Le format habituel', ton: 3 },
  { minutes: 45, libelle: 'Long', detail: 'Pour un chapitre entier', ton: 4 },
];

/**
 * Cadran d'horloge dont le secteur rempli vaut la durée choisie.
 *
 * Un enfant lit « trois quarts de cadran » avant de lire « 45 » : le dessin
 * donne la durée relative que le nombre seul ne montre pas. On part de midi et
 * on tourne dans le sens des aiguilles, comme sur une vraie montre.
 */
function CadranDuree({ minutes }) {
  const R = 15;
  const angle = (minutes / 60) * 2 * Math.PI;
  const x = 24 + R * Math.sin(angle);
  const y = 24 - R * Math.cos(angle);
  const grandArc = minutes > 30 ? 1 : 0;

  return (
    <svg className="duree__cadran" viewBox="0 0 48 48" aria-hidden="true">
      {/* Boîtier : le cercle extérieur et les repères des quarts d'heure. */}
      <circle className="duree__boitier" cx="24" cy="24" r="19" />
      <path className="duree__repere" d="M24 3.5 v3 M44.5 24 h-3 M24 44.5 v-3 M3.5 24 h3" />

      {/* Secteur écoulé : c'est lui qui porte la couleur pleine. */}
      <path className="duree__secteur" d={`M24 24 L24 ${24 - R} A${R} ${R} 0 ${grandArc} 1 ${x} ${y} Z`} />

      {/* Aiguille des minutes, posée sur la fin du secteur. */}
      <path className="duree__aiguille" d={`M24 24 L${x} ${y}`} />
      <circle className="duree__axe" cx="24" cy="24" r="2" />
    </svg>
  );
}

/* ------------------------------------------ séances de test, administration
   Séances courtes servant à vérifier le comportement de FIN : la conclusion,
   le compte rendu, la fiche de révision. Tout cela ne se produit qu'au bout
   d'un cours, et personne ne vérifiera jamais rien si chaque essai coûte
   trente-cinq minutes.

   DEUX DURÉES, PARCE QU'ELLES NE SERVENT PAS À LA MÊME CHOSE.

   Une minute vérifie la MÉCANIQUE : la clôture part-elle, le compte rendu
   s'écrit-il, la fiche apparaît-elle ? On n'a rien à dire au professeur, on
   regarde ce qui se déclenche. Le dernier préavis tombe à trois secondes de la
   fin, la séance se déroule donc normalement, en accéléré.

   Six minutes vérifient le DÉROULÉ : il reste de quoi poser deux questions,
   voir la figure s'afficher, et juger si la conclusion arrive au bon moment
   plutôt que de constater qu'elle arrive.

   Elles NE DISPARAISSENT PAS en production : elles ne sont affichées qu'aux
   comptes administrateurs, ce qui les rend inoffensives et les garde là où
   elles servent. Les valeurs 1 et 6 restent donc aussi dans DUREES_VALIDES de
   Chat.js — les retirer casserait les séances de test elles-mêmes.

   Aucun risque côté quota : une séance plus courte consomme MOINS d'heures.
   Un parent qui devinerait le paramètre d'URL se priverait, il ne gagnerait
   rien.
   ---------------------------------------------------------------------- */
const DUREES_TEST = [
  {
    minutes: 1,
    detail: 'fin immédiate — pour vérifier la clôture et le compte rendu',
  },
  {
    minutes: 6,
    detail: 'assez long pour un vrai échange avant la fin',
  },
];

/**
 * La carte d'une matière, et sous elle l'accès à ses fiches de révision.
 *
 * Le lien est en dehors du bouton, pas dedans : un lien imbriqué dans un
 * bouton n'est pas du HTML valide et se comporte mal au clavier. Il ne
 * s'affiche qu'à partir d'une fiche — annoncer « Fiches · 0 » avant le premier
 * cours ne dit rien à personne.
 */
function CarteMatiere({ matiere, onOuvrir, fiches, evaluations, eleveId }) {
  const total = fiches?.total ?? 0;
  const nouveautes = fiches?.nouveautes ?? 0;
  const notes = evaluations ?? 0;

  const contenu = (
    <>
      <span className="matiere-carte__halo" aria-hidden="true" />
      <MotifMatiere code={matiere.code} />

      <span className="matiere-carte__avatar">
        <Avatar nom={matiere.profAvatar} couleur={matiere.profCouleur} taille={64} />
      </span>

      <strong className="matiere-carte__titre">{matiere.libelle}</strong>

      {matiere.profPrenom && (
        <span className="matiere-carte__prof">avec {matiere.profPrenom}</span>
      )}

      {/* La phrase vient de la base, avec la matière. Elle était écrite ici,
          et le défaut a fini par arriver : une matière ajoutée partout
          ailleurs débarquait dans cette grille avec un professeur, un motif,
          une couleur — et une phrase vide. Rien ne plantait, rien ne le
          disait. Une matière se décrit maintenant à un seul endroit. */}
      <span className="matiere-carte__promesse">{matiere.promesse ?? ''}</span>

      <span className="matiere-carte__pied">
        {matiere.active ? (
          <>
            Commencer <span aria-hidden="true">→</span>
          </>
        ) : (
          'Bientôt'
        )}
      </span>
    </>
  );

  if (!matiere.active) {
    // Un <div> et non un <button> désactivé : rien à activer ici, et un bouton
    // grisé invite quand même au clic. On le sort aussi du parcours clavier.
    return (
      <div className="matiere-carte matiere-carte--bientot" style={{ '--teinte': matiere.profCouleur }}>
        <span className="ruban">Bientôt</span>
        {contenu}
      </div>
    );
  }

  return (
    <div className="matiere-case" style={{ '--teinte': matiere.profCouleur }}>
      <button type="button" className="matiere-carte" onClick={onOuvrir}>
        {contenu}
      </button>

      {total > 0 && (
        <Link
          to={`/eleves/${eleveId}/matieres/${matiere.id}/fiches`}
          className={`matiere-fiches ${nouveautes > 0 ? 'matiere-fiches--nouveautes' : ''}`}
        >
          {/* 📚 et non 📄 : la page seule est dessinée blanche, sans couleur
              propre, et disparaît sur la pastille. Les livres portent du rouge,
              du vert et du bleu — ils se lisent à 18 px. */}
          <span className="matiere-fiches__emoji" aria-hidden="true">📚</span>

          {/* Le libellé porte l'information nouvelle quand il y en a une : une
              pastille seule laisse l'enfant deviner ce qu'elle compte. */}
          {nouveautes > 0
            ? `${nouveautes} fiche${nouveautes > 1 ? 's' : ''} à consulter`
            : 'Fiches de révision'}

          <span className="matiere-fiches__compte">
            {nouveautes > 0 ? nouveautes : total}
          </span>
          <span className="matiere-fiches__fleche" aria-hidden="true">→</span>
        </Link>
      )}

      {/* Ses copies, à lui. Elles n'étaient visibles que du parent — or c'est
          lui qui les a passées, et revoir ce qu'on a écrit à côté de ce qu'il
          fallait écrire est le moment où la correction rentre vraiment. */}
      {notes > 0 && (
        <Link
          to={`/eleves/${eleveId}/matieres/${matiere.id}/evaluations`}
          className="matiere-fiches matiere-fiches--notes"
        >
          <span className="matiere-fiches__emoji" aria-hidden="true">📝</span>
          Mes évaluations
          <span className="matiere-fiches__compte">{notes}</span>
          <span className="matiere-fiches__fleche" aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

/**
 * La question du casque, posée juste avant d'entrer en cours.
 *
 * POURQUOI ELLE EXISTE
 * --------------------
 * Le micro reste ouvert pendant que le professeur parle — c’est ce qui
 * permet à l'élève de l'interrompre. Sur un haut-parleur, ce micro capte la
 * voix du professeur, la transcrit, et la lui renvoie comme une
 * interruption : le professeur se coupe lui-même, en boucle.
 *
 * ON NE PEUT PAS LE DEVINER DEPUIS LE NAVIGATEUR. Aucune interface web ne
 * dit si le son sort d'un casque ou d'un haut-parleur — l'annulation d'écho
 * du navigateur aide, mais elle échoue précisément dans le cas qui nous
 * occupe : une voix de synthèse jouée fort, à quelques centimètres du micro.
 * La seule source fiable est celle qui est assise devant.
 *
 * POSÉE À CHAQUE COURS, et pas une fois pour toutes : un enfant met son
 * casque le lundi et écoute sur la tablette du salon le mercredi. Une
 * réponse mémorisée serait fausse une fois sur deux, et fausse en silence.
 */
function ChoixCasque({ matiere, onRepondre, onAnnuler }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-casque">
      <div className="modale__boite modale__boite--casque">
        <h2 id="titre-casque">Tu as un casque ou des écouteurs ?</h2>

        <p className="modale__texte">
          Avec un casque, tu peux couper la parole à {matiere.profPrenom} quand tu
          veux. Sans casque, ton micro entendrait sa voix et croirait que c’est
          toi qui parles.
        </p>

        {/* LE MODE SILENCIEUX D’IOS, ET POURQUOI L’AVERTISSEMENT EST ICI.

            Actif, il coupe le son du navigateur SANS RIEN AFFICHER dans la
            page : pas d’icône, pas d’erreur, aucun état lisible en
            JavaScript. Le professeur parle, le micro marche, le graphe
            audio tourne — et l’élève n’entend rien. Le symptôme ressemble
            trait pour trait à une panne de l’application.

            ON NE NOMME AUCUN BOUTON, ET C’EST VOULU. La première version
            disait « le petit bouton sur la tranche » — vrai jusqu’à
            l’iPhone 14, faux depuis : le 15 l’a remplacé par un bouton
            configurable, et le silencieux s’active aussi depuis le centre
            de contrôle ou un mode de concentration. Envoyer chercher un
            bouton qui n’existe pas fait douter de tout le reste du
            message. On nomme donc l’ÉTAT, que l’élève sait retrouver, et
            pas le chemin qui y mène, qui change avec le modèle.

            DANS CETTE POPUP ET PAS AILLEURS. C’est déjà le moment où on
            parle de son, c’est juste avant d’en avoir besoin, et surtout
            c’est le seul instant où l’élève a encore le téléphone en main
            pour vérifier. Un avertissement à la connexion serait lu vingt
            minutes trop tôt, puis oublié.

            SUR IOS SEULEMENT : aucun Android n’a ce bouton, et l’y envoyer
            chercher lui ferait douter du reste. */}
        {estIOS() && (
          <p className="modale__silence">
            <span aria-hidden="true">🔇</span>
            <span>
              <strong>Vérifie que ton téléphone n’est pas en silencieux.</strong>{' '}
              Sinon tu n’entendras pas {matiere.profPrenom}, même si tout le
              reste fonctionne.
            </span>
          </p>
        )}

        <div className="casque-choix">
          <button
            type="button"
            className="casque-option casque-option--oui"
            onClick={() => onRepondre(true)}
          >
            <span className="casque-option__icone" aria-hidden="true">🎧</span>
            <span className="casque-option__titre">Oui, j’ai un casque</span>
            <span className="casque-option__detail">
              Je peux interrompre le prof en parlant
            </span>
          </button>

          <button
            type="button"
            className="casque-option"
            onClick={() => onRepondre(false)}
          >
            <span className="casque-option__icone" aria-hidden="true">🔊</span>
            <span className="casque-option__titre">Non, haut-parleur</span>
            <span className="casque-option__detail">
              J’attends que le prof ait fini pour parler
            </span>
          </button>
        </div>

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onAnnuler}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

/** Choix de la durée, avant d'entrer en cours. */
function ChoixDuree({ matiere, onValider, onAnnuler, estAdmin }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-duree">
      <div className="modale__boite modale__boite--duree">
        <h2 id="titre-duree">Combien de temps aujourd'hui ?</h2>

        <p className="modale__texte">
          {matiere.profPrenom} adaptera le cours à la durée choisie, et préviendra
          cinq minutes avant la fin.
        </p>

        <div className="durees">
          {DUREES.map((duree) => (
            <button
              key={duree.minutes}
              type="button"
              className="duree"
              style={{ '--ton': `var(--duree-${duree.ton})` }}
              onClick={() => onValider(duree.minutes)}
            >
              <CadranDuree minutes={duree.minutes} />
              <span className="duree__minutes">
                {duree.minutes}
                <span className="duree__unite">min</span>
              </span>
              <span className="duree__libelle">{duree.libelle}</span>
              <span className="duree__detail">{duree.detail}</span>
            </button>
          ))}
        </div>

        {/* Réservée à l'administration, et elle y reste.
            -------------------------------------------
            Elle devait disparaître avant la production ; elle est plus utile
            gardée. Vérifier le comportement de fin — préavis, conclusion,
            compte rendu, fiche — demande d'aller au bout d'une séance, et
            personne ne le fera si chaque essai coûte trente-cinq minutes.

            Un parent, lui, ne doit pas la voir : six minutes ne sont pas un
            cours, et proposer un format qui ne sert qu'à nous brouillerait le
            choix des quatre vraies durées. */}
        {estAdmin && DUREES_TEST.map((test) => (
          <button
            key={test.minutes}
            type="button"
            className="duree-test"
            onClick={() => onValider(test.minutes)}
          >
            Test · {test.minutes} minute{test.minutes > 1 ? 's' : ''}
            <span>{test.detail}</span>
          </button>
        ))}

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onAnnuler}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GrilleMatieres() {
  const { eleveId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // La durée retenue entre les deux questions. `null` = on en est encore à
  // la première.
  const [dureeChoisie, setDureeChoisie] = useState(null);

  // Le référentiel n est plus lu ici : les matières de l élève viennent de sa
  // propre route, et le niveau ne sert plus à filtrer puisque le serveur s en
  // charge. On garde le chargement, que d autres écrans attendent — la liste
  // des matières sert de dictionnaire de libellés dans les fiches et les
  // évaluations.
  const { matieres } = useSelector((state) => state.referentiel);
  const { liste } = useSelector((state) => state.eleves);
  const { estAdmin } = useSelector((state) => state.auth);

  // Relu à chaque rendu, comme dans la barre de navigation : ouvrir ou fermer
  // une session enfant change l'adresse, donc l'écran se remet à jour au bon
  // moment sans qu'on ait à partager un état.
  const enfant = sessionEleve();

  // Matière choisie, en attente de la durée. Null = aucune fenêtre ouverte.
  const [enAttente, setEnAttente] = useState(null);

  // Compteurs par matière : `{ [matiereId]: { total, nouveautes } }`. Un échec
  // est silencieux — la grille des matières doit s'afficher même sans eux.
  const [fiches, setFiches] = useState({});

  // Nombre d'évaluations par matière : `{ [matiereId]: nombre }`.
  const [notes, setNotes] = useState({});

  const eleve = liste.find((e) => String(e.id) === String(eleveId));

  useEffect(() => {
    if (matieres.length === 0) dispatch(chargerReferentiel());
    if (liste.length === 0) dispatch(chargerEleves());
  }, [dispatch, matieres.length, liste.length]);

  useEffect(() => {
    let vivant = true;

    getNombreFiches(eleveId)
      .then(({ data }) => {
        if (vivant) setFiches(data ?? {});
      })
      .catch(() => {});

    // Un seul appel pour toutes les matières, puis un regroupement ici. Le
    // serveur rend les vingt dernières évaluations d'un élève, toutes matières
    // confondues : une route de comptage par matière ne ferait qu'ajouter un
    // aller-retour pour trier vingt lignes.
    getEvaluations(eleveId)
      .then(({ data }) => {
        if (!vivant) return;

        const parMatiere = {};
        (data ?? []).forEach((evaluation) => {
          parMatiere[evaluation.matiereId] = (parMatiere[evaluation.matiereId] ?? 0) + 1;
        });

        setNotes(parMatiere);
      })
      .catch(() => {});

    return () => {
      vivant = false;
    };
  }, [eleveId]);

  /**
   * Les matières de CET élève, demandées au serveur.
   *
   * LE FILTRAGE ÉTAIT FAIT ICI, ET IL A CÉDÉ.
   * ----------------------------------------
   * La grille recevait toutes les matières et écartait elle-même celles qui ne
   * concernaient pas l'élève, en comparant le rang de sa classe aux bornes de
   * chaque matière. Deux copies de la même règle — une en C#, une ici — et
   * celle-ci portait un défaut : tant que le niveau de l'élève n'était pas
   * connu, elle n'écartait RIEN. C'était assumé, au nom du clignotement évité.
   *
   * Or l'élève arrive d'un autre appel que les matières. Quand il tardait — ou
   * ne venait pas du tout — la grille restait grande ouverte. Un enfant de
   * sixième s'est vu proposer la philosophie, et a pu l'ouvrir.
   *
   * Le serveur connaît l'élève et la règle : c'est lui qui répond. Il n'y a
   * plus de seconde copie, plus de jointure à faire ici, et plus de moment où
   * l'on montre tout faute de savoir.
   *
   * TANT QUE LA RÉPONSE N'EST PAS LÀ, ON N'AFFICHE RIEN. Une grille vide une
   * demi-seconde est sans conséquence ; une grille qui propose l'absurde, non.
   */
  const [siennes, setSiennes] = useState(null);

  useEffect(() => {
    let vivant = true;

    getMatieresEleve(eleveId)
      .then(({ data }) => { if (vivant) setSiennes(data ?? []); })
      .catch(() => { if (vivant) setSiennes([]); });

    return () => { vivant = false; };
  }, [eleveId]);

  const { ouvertes, aVenir } = useMemo(() => ({
    ouvertes: (siennes ?? []).filter((m) => m.active),

    // « Bientôt » et « pas pour toi » ne sont pas la même chose : le serveur
    // renvoie les matières à venir de SA classe, avec leur drapeau à faux.
    aVenir: (siennes ?? []).filter((m) => !m.active),
  }), [siennes]);


  if (siennes === null) {
    return <Loader texte="Chargement des matières…" />;
  }

  return (
    <section className="page page--large">
      {/* DEUX ÉTAPES, ET LA DURÉE D’ABORD. La question du casque tient à
          l’équipement, pas au cours : la poser en premier ferait commencer
          par de l’intendance quelqu’un qui vient travailler. */}
      {enAttente && dureeChoisie === null && (
        <ChoixDuree
          matiere={enAttente}
          onAnnuler={() => setEnAttente(null)}
          estAdmin={estAdmin}
          onValider={setDureeChoisie}
        />
      )}

      {enAttente && dureeChoisie !== null && (
        <ChoixCasque
          matiere={enAttente}
          onAnnuler={() => { setDureeChoisie(null); setEnAttente(null); }}
          onRepondre={(casque) =>
            navigate(
              `/eleves/${eleveId}/matieres/${enAttente.id}/chat`
              + `?duree=${dureeChoisie}&casque=${casque ? 1 : 0}`,
            )
          }
        />
      )}

      {/* Le seul chemin de retour était le lien de la navbar, qui ne se lit pas
          comme un retour. Même libellé que lui pour qu'on comprenne qu'ils
          mènent au même endroit.

          RIEN DE TOUT ÇA POUR UN ENFANT. « Mes enfants » n'est pas sa page :
          elle appartient au parent, et le filtre des routes la lui refuse de
          toute façon. Lui montrer le lien, c'est lui promettre une porte qui
          se referme — il clique, il est renvoyé, et il ne comprend pas
          pourquoi. Un enfant n'a d'ailleurs pas de « retour » à faire : ses
          matières SONT son point de départ. */}
      {!enfant && (
        <Link to="/eleves" className="lien-retour">
          <span aria-hidden="true">←</span> Mes enfants
        </Link>
      )}

      <header className="salutation">
        <h1>
          {/* Le prénom porte la couleur d'identité de l'enfant, la même que
              sur sa carte dans la liste. C'est ce qui lui fait reconnaître sa
              page comme la sienne. */}
          {eleve ? (
            <>
              <span>Bonjour</span>
              <span
                className="salutation__prenom"
                style={{
                  '--teinte': couleurEleve(eleve),
                  '--teinte-claire': couleurEleveClaire(eleve),
                }}
              >
                {eleve.prenom}
              </span>
            </>
          ) : (
            <span>Choisis une matière</span>
          )}
          <span className="salutation__main" aria-hidden="true">
            👋
          </span>
        </h1>

        <p className="salutation__ligne">
          {eleve && <span className="badge badge--classe">{eleve.niveauLibelle}</span>}
          <span>Sur quoi veux-tu travailler aujourd'hui ?</span>
        </p>
      </header>

      <ul className="matieres-grille">
        {ouvertes.map((matiere) => (
          <li key={matiere.id}>
            <CarteMatiere
              matiere={matiere}
              /* La durée repart à zéro à chaque ouverture : sans ça, un élève
                 qui annule au casque puis rouvre une AUTRE matière sauterait
                 directement à la seconde question, avec la durée de la
                 précédente. */
              onOuvrir={() => { setDureeChoisie(null); setEnAttente(matiere); }}
              fiches={fiches[matiere.id]}
              evaluations={notes[matiere.id]}
              eleveId={eleveId}
            />
          </li>
        ))}
      </ul>

      {aVenir.length > 0 && (
        <>
          {/* Montrer les matières fermées plutôt que de les taire : un enfant
              qui ne voit que les maths croit que le produit s'arrête là. */}
          <div className="separateur">
            <h2>Bientôt avec toi</h2>
            <p>Ces professeurs préparent leurs cours. Ils arrivent très vite.</p>
          </div>

          <ul className="matieres-grille matieres-grille--bientot">
            {aVenir.map((matiere) => (
              <li key={matiere.id}>
                <CarteMatiere matiere={matiere} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
