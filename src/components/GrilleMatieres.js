import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import { couleurEleve, couleurEleveClaire } from '../lib/couleurEleve';
import { sessionEleve } from '../lib/storage/sessionEleve';
import { cycleDuNiveau } from '../lib/niveauCycle';
import { useJeuxOuverts } from '../lib/storage/modeTest';
import {
  getNombreFiches, getEvaluations, getMatieresEleve, getNombreDictees,
  getNombreComprehensionsOrales,
  getNombreExpressionsOrales, getNombreExpressionsEcrites, getControles, getExamen,
} from '../lib/api/elevesApi';
import { estMatiereLangue } from '../lib/matieresLangues';
import Avatar from './Avatar';
import MotifMatiere from './MotifMatiere';
import Loader from './Loader';
import BoutonAvis from './BoutonAvis';
import MesControles from './MesControles';
import iconeCarte from '../assets/carte.png';
import iconeCalendrier from '../assets/calendrier.png';
import iconeJeux from '../assets/games.webp';
import PreparationExamen from './PreparationExamen';
import ControleForm from './ControleForm';
import { ChoixCasque, ChoixDuree } from './OuvertureSeance';
import useAncreSection from '../lib/hooks/useAncreSection';

/**
 * Ce qu'on promet à l'élève pour chaque matière, en une phrase.
 * Un nom de matière seul ne donne envie à personne ; « on lit, on écrit, on
 * raconte » dit à un enfant ce qu'il va faire.
 */
/**
 * La carte d'une matière, et sous elle l'accès à ses fiches de révision.
 *
 * Le lien est en dehors du bouton, pas dedans : un lien imbriqué dans un
 * bouton n'est pas du HTML valide et se comporte mal au clavier. Il ne
 * s'affiche qu'à partir d'une fiche — annoncer « Fiches · 0 » avant le premier
 * cours ne dit rien à personne.
 */
function CarteMatiere({
  matiere, onOuvrir, fiches, evaluations, dictees, comprehensionsOrales,
  expressionsOrales, expressionsEcrites, eleveId,
}) {
  const total = fiches?.total ?? 0;
  const nouveautes = fiches?.nouveautes ?? 0;
  const notes = evaluations ?? 0;
  const dictTotal = dictees?.total ?? 0;
  const dictNouveautes = dictees?.nouveautes ?? 0;
  const coTotal = comprehensionsOrales?.total ?? 0;
  const coNouveautes = comprehensionsOrales?.nouveautes ?? 0;

  // Les conversations d'expression orale — Camara, le 18/09/2026.
  const eoTotal = expressionsOrales?.total ?? 0;
  const eoNouveautes = expressionsOrales?.nouveautes ?? 0;

  const eeTotal = expressionsEcrites?.total ?? 0;
  const eeNouveautes = expressionsEcrites?.nouveautes ?? 0;

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

      {/* Réservé aux matières de langue : une dictée n'existe qu'en français
          et en langue vivante, la proposer ailleurs n'aurait aucun sens.
          Juste sous les fiches — une troisième teinte, pour la distinguer
          des deux bandeaux voisins d'un coup d'œil. */}
      {estMatiereLangue(matiere.code) && dictTotal > 0 && (
        <Link
          to={`/eleves/${eleveId}/matieres/${matiere.id}/dictees`}
          className={`matiere-fiches matiere-fiches--dictees ${dictNouveautes > 0 ? 'matiere-fiches--nouveautes' : ''}`}
        >
          <span className="matiere-fiches__emoji" aria-hidden="true">✏️</span>
          {dictNouveautes > 0
            ? `${dictNouveautes} dictée${dictNouveautes > 1 ? 's' : ''} à consulter`
            : 'Mes dictées'}
          <span className="matiere-fiches__compte">
            {dictNouveautes > 0 ? dictNouveautes : dictTotal}
          </span>
          <span className="matiere-fiches__fleche" aria-hidden="true">→</span>
        </Link>
      )}

      {/* Même restriction que les dictées : réservé aux matières de langue.
          Juste sous « Mes dictées » — même famille d'archives, une quatrième
          teinte pour la distinguer au coup d'œil des trois autres. */}
      {estMatiereLangue(matiere.code) && coTotal > 0 && (
        <Link
          to={`/eleves/${eleveId}/matieres/${matiere.id}/comprehensions-orales`}
          className={`matiere-fiches matiere-fiches--comprehensions-orales ${coNouveautes > 0 ? 'matiere-fiches--nouveautes' : ''}`}
        >
          <span className="matiere-fiches__emoji" aria-hidden="true">🎧</span>
          {coNouveautes > 0
            ? `${coNouveautes} compréhension${coNouveautes > 1 ? 's' : ''} orale${coNouveautes > 1 ? 's' : ''} à consulter`
            : 'Mes compréhensions orales'}
          <span className="matiere-fiches__compte">
            {coNouveautes > 0 ? coNouveautes : coTotal}
          </span>
          <span className="matiere-fiches__fleche" aria-hidden="true">→</span>
        </Link>
      )}

      {/* LES CONVERSATIONS, juste sous les compréhensions orales : même
          famille, même restriction aux matières de langue, cinquième teinte.

          LES DEUX SE SUIVENT PARCE QU'ON LES CONFOND, et les tenir côte à
          côte est justement ce qui les distingue : au-dessus, ce qu'il a
          ÉCOUTÉ ; ici, ce qu'il a DIT. Camara a dû me le préciser deux fois
          pour que je ne les mélange pas dans le code — un enfant n'aura pas
          cette chance, alors les libellés le disent. */}
      {estMatiereLangue(matiere.code) && eoTotal > 0 && (
        <Link
          to={`/eleves/${eleveId}/matieres/${matiere.id}/expressions-orales`}
          className={`matiere-fiches matiere-fiches--expressions-orales ${eoNouveautes > 0 ? 'matiere-fiches--nouveautes' : ''}`}
        >
          <span className="matiere-fiches__emoji" aria-hidden="true">💬</span>
          {eoNouveautes > 0
            ? `${eoNouveautes} conversation${eoNouveautes > 1 ? 's' : ''} à relire`
            : 'Mes conversations'}
          <span className="matiere-fiches__compte">
            {eoNouveautes > 0 ? eoNouveautes : eoTotal}
          </span>
          <span className="matiere-fiches__fleche" aria-hidden="true">→</span>
        </Link>
      )}

      {/* LES TEXTES ÉCRITS, juste sous les conversations : troisième et
          dernier de la famille, même restriction aux matières de langue.

          LES TROIS SE SUIVENT PARCE QU'ILS SE DISTINGUENT MAL DE LOIN, et
          les tenir côte à côte est ce qui les sépare : ce qu’il a ÉCOUTÉ,
          ce qu’il a DIT, ce qu’il a ÉCRIT. */}
      {estMatiereLangue(matiere.code) && eeTotal > 0 && (
        <Link
          to={`/eleves/${eleveId}/matieres/${matiere.id}/expressions-ecrites`}
          className={`matiere-fiches matiere-fiches--expressions-ecrites ${eeNouveautes > 0 ? 'matiere-fiches--nouveautes' : ''}`}
        >
          <span className="matiere-fiches__emoji" aria-hidden="true">✍️</span>
          {eeNouveautes > 0
            ? `${eeNouveautes} texte${eeNouveautes > 1 ? 's' : ''} à relire`
            : 'Expressions écrites'}
          <span className="matiere-fiches__compte">
            {eeNouveautes > 0 ? eeNouveautes : eeTotal}
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

export default function GrilleMatieres() {
  const { eleveId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Revenir d'une page de détail ramène à SA section, pas en haut de la page.
  // L'ancre voyage dans l'adresse du lien de retour — voir le commentaire du
  // crochet, qui explique pourquoi le retour du navigateur ne suffit pas.
  useAncreSection();

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

  // Compteurs de dictées par matière, même forme que `fiches`. Réservé aux
  // matières de langue à l'affichage — voir `estMatiereLangue`.
  const [dictees, setDictees] = useState({});

  // Compteurs de compréhensions orales par matière, même forme et même
  // restriction que `dictees`.
  const [comprehensionsOrales, setComprehensionsOrales] = useState({});

  // Compteurs de conversations d'expression orale, même forme et même
  // restriction que les deux du dessus.
  const [expressionsOrales, setExpressionsOrales] = useState({});
  const [expressionsEcrites, setExpressionsEcrites] = useState({});

  // Les contrôles à venir, avec leur préparation. `null` tant que rien n'est
  // revenu : la section ne s'affiche pas plutôt que d'annoncer « aucun
  // contrôle » le temps d'un aller-retour.
  const [controles, setControles] = useState(null);

  // Le contrôle qu'on s'apprête à préparer, le temps de traverser les deux
  // modales de durée et de casque.
  const [controleEnAttente, setControleEnAttente] = useState(null);

  // Même chose pour l'épreuve d'examen qu'on s'apprête à préparer. Jamais les
  // deux à la fois : une séance n'a qu'un sujet.
  const [epreuveEnAttente, setEpreuveEnAttente] = useState(null);

  // La préparation à l'examen de sa classe, ou `null` s'il n'en passe pas
  // cette année — la section ne s'affiche alors pas du tout.
  const [examen, setExamen] = useState(null);

  // La fenêtre d'ajout d'un contrôle, ouverte SUR PLACE : renvoyer l'enfant
  // vers la page dédiée pour qu'il y reclique était un détour pour rien.
  const [ajoutControle, setAjoutControle] = useState(false);

  // `useCallback` parce qu'elle est appelée depuis l'effet de chargement ET
  // après un ajout : sans identité stable, l'effet se relancerait à chaque
  // rendu, donc en boucle.
  const chargerControles = useCallback((vivant = true) =>
    getControles(eleveId, 'avenir', 3)
      .then(({ data }) => { if (vivant) setControles(data ?? []); })
      .catch(() => { if (vivant) setControles([]); }),
  [eleveId]);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));

  // CE QUE L'ENFANT SAIT DE LUI-MÊME, QUAND LE PARENT NE L'A PAS CHARGÉ.
  //
  // `eleve` vient de la liste du PARENT — un appel réservé à son compte, qui
  // n'a jamais lieu dans la session d'un enfant. Le lien « Ma carte » et le
  // « Bonjour {prénom} » étaient posés sur `eleve` seul : pour l'enfant
  // connecté avec son propre code, `liste` reste vide, `eleve` est undefined,
  // et les deux disparaissaient — alors que SA session (`enfant`, voir
  // sessionEleve()) porte déjà son prénom et sa classe.
  //
  // `enfant` ne porte pas le sexe : `couleurEleve` s'en accommode déjà, en
  // retombant sur la teinte neutre — pas de plantage, juste une couleur par
  // défaut là où le parent, lui, voit celle de l'enfant.
  const identite = eleve
    ? {
      id: eleve.id,
      prenom: eleve.prenom,
      niveauLibelle: eleve.niveauLibelle,
      sexe: eleve.sexe,
      // Le cycle décide de la porte des jeux — voir `useJeuxOuverts`.
      cycle: eleve.niveauCycle,
    }
    : enfant
      ? {
        id: enfant.eleveId,
        prenom: enfant.prenom,
        niveauLibelle: enfant.niveau,
        cycle: enfant.cycle,
      }
      : null;

  // LES JEUX S'OUVRENT CYCLE PAR CYCLE — Camara, le 20/09/2026. Trois
  // interrupteurs d'administration, et cet enfant n'est concerné que par
  // celui de son cycle. Éteint, sa porte n'existe simplement pas : ni la
  // carte de son accueil, ni la pastille de la vue de son parent.
  //
  // LE CYCLE VIENT DE LA SESSION, ou de son libellé de classe quand elle est
  // trop ancienne pour le porter — voir `niveauCycle.js`, et surtout la note
  // qui explique pourquoi ce filet n'appelle PAS le serveur.
  const jeuxOuverts = useJeuxOuverts(
    identite?.cycle || cycleDuNiveau(identite?.niveauLibelle),
  );

  useEffect(() => {
    if (matieres.length === 0) dispatch(chargerReferentiel());
    if (liste.length === 0) dispatch(chargerEleves());
  }, [dispatch, matieres.length, liste.length]);

  /**
   * Les compteurs des trois bandeaux, rechargés à chaque RETOUR sur la page.
   *
   * Ils ne l'étaient qu'au montage, et une archive écrite pendant que l'onglet
   * était ailleurs — le professeur rédige son compte rendu quelques secondes
   * APRÈS la sortie du cours — n'apparaissait jamais : il fallait un F5 pour
   * la voir. On réécoute donc le retour de l'onglet et le retour du focus.
   */
  useEffect(() => {
    let vivant = true;

    const charger = () => {
      getNombreFiches(eleveId)
        .then(({ data }) => { if (vivant) setFiches(data ?? {}); })
        .catch(() => {});

      getNombreDictees(eleveId)
        .then(({ data }) => { if (vivant) setDictees(data ?? {}); })
        .catch(() => {});

      getNombreComprehensionsOrales(eleveId)
        .then(({ data }) => { if (vivant) setComprehensionsOrales(data ?? {}); })
        .catch(() => {});

      getNombreExpressionsOrales(eleveId)
        .then(({ data }) => { if (vivant) setExpressionsOrales(data ?? {}); })
        .catch(() => {});

      getNombreExpressionsEcrites(eleveId)
        .then(({ data }) => { if (vivant) setExpressionsEcrites(data ?? {}); })
        .catch(() => {});

      // Un seul appel pour toutes les matières, puis un regroupement ici. Le
      // serveur rend les vingt dernières évaluations d'un élève, toutes
      // matières confondues : une route de comptage par matière ne ferait
      // qu'ajouter un aller-retour pour trier vingt lignes.
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

      // DANS `charger` ET PAS DANS SON PROPRE EFFET : c'est ce qui fait
      // remonter la barre de préparation au retour sur l'onglet. Une séance
      // de révision qui vient de se terminer a fait bouger le pourcentage —
      // il doit se voir sans avoir à recharger la page.
      chargerControles(vivant);

      // Même raison : une séance de révision fait bouger la barre de l'examen.
      getExamen(eleveId)
        .then(({ data }) => { if (vivant) setExamen(data?.examen ?? null); })
        .catch(() => {});
    };

    charger();

    const auRetour = () => {
      if (document.visibilityState === 'visible') charger();
    };

    document.addEventListener('visibilitychange', auRetour);
    window.addEventListener('focus', charger);

    return () => {
      vivant = false;
      document.removeEventListener('visibilitychange', auRetour);
      window.removeEventListener('focus', charger);
    };
  }, [eleveId, chargerControles]);

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
          onAnnuler={() => {
            setDureeChoisie(null);
            setEnAttente(null);
            setControleEnAttente(null);
            setEpreuveEnAttente(null);
          }}
          onRepondre={(casque) =>
            navigate(
              `/eleves/${eleveId}/matieres/${enAttente.id}/chat`
              + `?duree=${dureeChoisie}&casque=${casque ? 1 : 0}`
              // Le mode et sa cible voyagent DANS L'ADRESSE, comme la durée
              // et le casque : un rechargement en plein cours ne doit pas
              // faire perdre le sujet de la séance. Sans mode, c'est un cours
              // normal — le professeur ne parle alors d'aucun contrôle ni
              // d'aucun examen.
              + (controleEnAttente ? `&mode=controle&controleId=${controleEnAttente}` : '')
              + (epreuveEnAttente ? `&mode=examen&epreuve=${encodeURIComponent(epreuveEnAttente)}` : ''),
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

      {/* LA CARTE, ACCESSIBLE DEPUIS L ÉCRAN OÙ L ENFANT ARRIVE — CETTE
          VERSION-CI POUR LE PARENT SEULEMENT.

          Enfouie dans un menu, elle ne serait jamais ouverte — or c est le
          seul endroit du produit où il voit ses progrès. Elle est donc ici,
          à portée du premier regard, à côté de « Mes enfants » : le parent
          sait déjà ce qu il cherche, une pastille discrète suffit.

          Un lien et non un bouton : il mène à une page, et la barre
          d adresse doit pouvoir y revenir.

          Sur `identite`, et non `eleve` seul : voir le commentaire à sa
          définition, plus haut — un enfant connecté avec son propre code n a
          pas de `eleve`, mais il a bien une identité.

          LA GRANDE VERSION, POUR L ENFANT, N EST PLUS ICI : voir plus bas,
          après l accueil. Elle passait avant même son prénom, et elle
          dominait visuellement la grille de matières — qui est pourtant la
          vraie tâche de cet écran. On dit bonjour d abord, on propose
          ensuite.

          EN DESSOUS DE « MES ENFANTS », PAS À CÔTÉ : un `<div>` bloc
          suffit à les renvoyer à la ligne suivante, sans toucher au style
          partagé de `.lien-retour` — qui sert aussi de simple bouton de
          retour sur d'autres pages, où il doit rester sur sa ligne. */}
      {identite && !enfant && (
        <div className="liens-carte">
          {/* LES ILLUSTRATIONS EN BADGE — Camara, le 15/09/2026 : `carte.png` et
              `calendrier.png`, les mêmes que sur la page de l'enfant, à la
              place des emojis. Posées à cheval sur le bord de la pastille. */}
          <Link to={`/eleves/${identite.id}/progression`} className="lien-carte lien-carte--badge">
            <img className="lien-carte__badge" src={iconeCarte} alt="" />
            Ma carte
          </Link>
          <Link to={`/eleves/${identite.id}/calendrier`} className="lien-carte lien-carte--badge">
            <img className="lien-carte__badge" src={iconeCalendrier} alt="" />
            Mon calendrier
          </Link>

          {jeuxOuverts && (
          <>
          {/* MES JEUX ICI AUSSI — Camara, le 20/09/2026. Le parent voit la même
              chose que son enfant, en pastilles : trois portes, trois
              pastilles. En laisser une de côté aurait fait croire que les jeux
              lui sont cachés. */}
          <Link to={`/eleves/${identite.id}/jeux`} className="lien-carte lien-carte--badge">
            <img className="lien-carte__badge" src={iconeJeux} alt="" />
            Mes jeux
          </Link>
          </>
          )}
        </div>
      )}

      <div className="grille-matieres__entete">
        <header className="salutation">
          <h1>
            {/* Le prénom porte la couleur d'identité de l'enfant, la même que
                sur sa carte dans la liste. C'est ce qui lui fait reconnaître sa
                page comme la sienne. */}
            {identite ? (
              <>
                <span>Bonjour</span>
                <span
                  className="salutation__prenom"
                  style={{
                    '--teinte': couleurEleve(identite),
                    '--teinte-claire': couleurEleveClaire(identite),
                  }}
                >
                  {identite.prenom}
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
            {identite && <span className="badge badge--classe">{identite.niveauLibelle}</span>}
            {/* Espace insécable avant « ? » : le point d'interrogation ne
                part jamais seul à la ligne sur un téléphone. */}
            <span>Sur quoi veux-tu travailler aujourd’hui&nbsp;?</span>
          </p>
        </header>

        <div className="grille-matieres__actions">
          {/* Le bouton de thème a rejoint la barre du haut le 15/09/2026 (voir
              Navbar.js) : il n'est plus répété ici. */}
          {/* MÊME FORMULAIRE QUE « MON COMPTE » ET LA PAGE D'ACCUEIL
              (`MonAvis.js`), ouvert ici en fenêtre : c'est la page où
              l'enfant comme le parent passent vraiment, contrairement aux
              deux autres. */}
          <BoutonAvis />
        </div>
      </div>

      {/* LA GRANDE CARTE, POUR L ENFANT — APRÈS L ACCUEIL, PAS AVANT.
          Elle se tenait au-dessus, avant même « Bonjour {prénom} » : la
          première chose lue sur SA page était une invitation à en repartir,
          plus grande et plus colorée que les matières elle-mêmes, qui sont
          pourtant ce que cet écran demande de choisir. Ordre naturel
          maintenant : on l accueille, on lui montre sa carte, puis ses
          matières. */}
      {identite && enfant && (
        <div className="cartes-mienne">
          <Link to={`/eleves/${identite.id}/progression`} className="carte-mienne">
            <MotifMatiere code="CARTE" />
            <span className="carte-mienne__icone-zone">
              <span className="carte-mienne__halo" aria-hidden="true" />
              {/* Des illustrations depuis le 14/09/2026 (Camara), plus des
                  émojis : de la même famille que celles de l'accueil et de
                  « Mes contrôles ». Décoratives : le titre dit tout. */}
              <span className="carte-mienne__icone" aria-hidden="true">
                <img src={iconeCarte} alt="" />
              </span>
            </span>
            <span className="carte-mienne__texte">
              <strong>Ma carte</strong>
              <span>Vois ce que tu as déjà réussi !</span>
            </span>
            <span className="carte-mienne__fleche" aria-hidden="true">→</span>
          </Link>

          <Link to={`/eleves/${identite.id}/calendrier`} className="carte-mienne">
            <MotifMatiere code="CALENDRIER" />
            <span className="carte-mienne__icone-zone">
              <span className="carte-mienne__halo" aria-hidden="true" />
              <span className="carte-mienne__icone" aria-hidden="true">
                <img src={iconeCalendrier} alt="" />
              </span>
            </span>
            <span className="carte-mienne__texte">
              <strong>Mon calendrier</strong>
              <span>Tes vacances, tes cours, tes évaluations à venir</span>
            </span>
            <span className="carte-mienne__fleche" aria-hidden="true">→</span>
          </Link>

          {jeuxOuverts && (
          <>
          {/* MES JEUX — Camara, le 20/09/2026. Sous les deux autres et sur
              toute la largeur : c'est une troisième porte, pas une colonne de
              plus. À deux par ligne, elle serait restée orpheline à côté d'un
              vide, et la manette attire assez l'œil pour ne pas avoir besoin
              d'être serrée contre sa voisine.

              LA SEULE CARTE QUI N'EST PAS DU TRAVAIL : sa couleur le dit —
              violet, quand les deux autres portent la sarcelle. */}
          <Link
            to={`/eleves/${identite.id}/jeux`}
            className="carte-mienne carte-mienne--jeux"
          >
            {/* UN MOTIF DE CHAQUE CÔTÉ : le contenu étant centré, un seul
                aurait tiré toute la carte vers la droite. Deux dessins
                DIFFÉRENTS — une console à gauche, une manette à droite : le
                même répété en miroir se lisait comme une erreur de copie. */}
            <MotifMatiere code="CONSOLE" cote="gauche" />
            <MotifMatiere code="JEUX" />
            <span className="carte-mienne__icone-zone">
              <span className="carte-mienne__halo" aria-hidden="true" />
              <span className="carte-mienne__icone carte-mienne__icone--jeux" aria-hidden="true">
                <img src={iconeJeux} alt="" />
              </span>
            </span>
            <span className="carte-mienne__texte">
              <strong>Mes jeux</strong>
              <span>Réviser en jouant, quelques minutes suffisent</span>
            </span>
            <span className="carte-mienne__fleche" aria-hidden="true">→</span>
          </Link>
          </>
          )}
        </div>
      )}

      <ul className="matieres-grille">
        {ouvertes.map((matiere) => (
          <li key={matiere.id}>
            <CarteMatiere
              matiere={matiere}
              /* La durée repart à zéro à chaque ouverture : sans ça, un élève
                 qui annule au casque puis rouvre une AUTRE matière sauterait
                 directement à la seconde question, avec la durée de la
                 précédente. */
              onOuvrir={() => {
                setDureeChoisie(null);
                setControleEnAttente(null);
                setEpreuveEnAttente(null);
                setEnAttente(matiere);
              }}
              fiches={fiches[matiere.id]}
              evaluations={notes[matiere.id]}
              dictees={dictees[matiere.id]}
              comprehensionsOrales={comprehensionsOrales[matiere.id]}
              expressionsOrales={expressionsOrales[matiere.id]}
              expressionsEcrites={expressionsEcrites[matiere.id]}
              eleveId={eleveId}
            />
          </li>
        ))}
      </ul>

      {/* « PRÉPARER CE CONTRÔLE » PASSE PAR LES MÊMES DEUX QUESTIONS qu'un
          cours ordinaire — durée puis casque : c'est une vraie séance, avec
          son minuteur et son duplex. Seul le sujet est déjà connu. */}
      <MesControles
        eleveId={eleveId}
        controles={controles}
        onPreparer={(controle) => {
          const matiere = ouvertes.find((m) => m.id === controle.matiereId);
          if (!matiere) return;

          setDureeChoisie(null);
          setEpreuveEnAttente(null);
          setControleEnAttente(controle.id);
          setEnAttente(matiere);
        }}
        onAjouter={() => setAjoutControle(true)}
      />

      {/* LA PRÉPARATION À L'EXAMEN, SOUS LES CONTRÔLES — voulue par Camara le
          14/09/2026. Absente des classes qui n'en passent pas cette année.
          Même parcours d'ouverture qu'un contrôle : durée, casque, puis une
          séance dont le professeur connaît le sujet. */}
      <PreparationExamen
        eleveId={eleveId}
        examen={examen}
        onPreparer={(epreuve, matiereEpreuve) => {
          const matiere = ouvertes.find((m) => m.id === matiereEpreuve.matiereId);
          if (!matiere) return;

          setDureeChoisie(null);
          setControleEnAttente(null);
          setEpreuveEnAttente(epreuve.code);
          setEnAttente(matiere);
        }}
      />

      {ajoutControle && (
        <div className="modale" role="dialog" aria-modal="true" aria-label="Ajouter un contrôle">
          <div className="modale__boite">
            <ControleForm
              eleveId={eleveId}
              matieres={ouvertes}
              jour={null}
              onEnregistre={() => { setAjoutControle(false); chargerControles(); }}
              onAnnule={() => setAjoutControle(false)}
            />
          </div>
        </div>
      )}

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
