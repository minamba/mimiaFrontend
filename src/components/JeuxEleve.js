import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import iconeJeux from '../assets/games.webp';
import { jeuxDeLaClasse, parMatiere } from '../lib/jeux/catalogue';
import { FRISE, frisePourLaClasse, rangDeLaClasse } from '../lib/jeux/frise';
import FriseDesClasses from './jeux/FriseDesClasses';
import { sessionEleve } from '../lib/storage/sessionEleve';
import { styleMatiere } from '../lib/couleurMatiere';
import Balance from './jeux/Balance';
import BoiteDeDix from './jeux/BoiteDeDix';
import ChantierDesFormes from './jeux/ChantierDesFormes';
import DeuxParDeux from './jeux/DeuxParDeux';
import Horloge from './jeux/Horloge';
import Marchande from './jeux/Marchande';
import PaquetsDeDix from './jeux/PaquetsDeDix';
import PecheAuxSons from './jeux/PecheAuxSons';
import AtelierDesSyllabes from './jeux/AtelierDesSyllabes';
import MotsEclair from './jeux/MotsEclair';
import UnOuDes from './jeux/UnOuDes';
import CoffreDesCentaines from './jeux/CoffreDesCentaines';
import CourseDesTables from './jeux/CourseDesTables';
import PartsDePizza from './jeux/PartsDePizza';
import MachineADix from './jeux/MachineADix';
import MotsDeLiaison from './jeux/MotsDeLiaison';
import PoemeTheatreRecit from './jeux/PoemeTheatreRecit';
import CommeUneImage from './jeux/CommeUneImage';
import AQuiLePronom from './jeux/AQuiLePronom';
import Crible from './jeux/Crible';
import Robot from './jeux/Robot';
import SacDeBilles from './jeux/SacDeBilles';
import SuiteQuiContinue from './jeux/SuiteQuiContinue';
import BoiteMystere from './jeux/BoiteMystere';
import RecettePour8 from './jeux/RecettePour8';
import RegleDesDixiemes from './jeux/RegleDesDixiemes';
import PartageBonbons from './jeux/PartageBonbons';
import MetreRuban from './jeux/MetreRuban';
import TourDuJardin from './jeux/TourDuJardin';
import CombienDeTemps from './jeux/CombienDeTemps';
import Bouteilles from './jeux/Bouteilles';
import Miroir from './jeux/Miroir';
import Diagramme from './jeux/Diagramme';
import OuQuandComment from './jeux/OuQuandComment';
import SujetEloigne from './jeux/SujetEloigne';
import AOuA from './jeux/AOuA';
import DetectiveDuVerbe from './jeux/DetectiveDuVerbe';
import RoueDesVerbes from './jeux/RoueDesVerbes';
import TypesDePhrases from './jeux/TypesDePhrases';
import PhraseQuiDitNon from './jeux/PhraseQuiDitNon';
import ContrairesEtJumeaux from './jeux/ContrairesEtJumeaux';
import TrainDesNombres from './jeux/TrainDesNombres';
import VignetteBalance from './jeux/VignetteBalance';
import VignetteBoiteDeDix from './jeux/VignetteBoiteDeDix';
import VignetteChantier from './jeux/VignetteChantier';
import VignetteDeux from './jeux/VignetteDeux';
import VignetteHorloge from './jeux/VignetteHorloge';
import VignettePaquets from './jeux/VignettePaquets';
import VignettePeche from './jeux/VignettePeche';
import VignetteSyllabes from './jeux/VignetteSyllabes';
import VignetteEclair from './jeux/VignetteEclair';
import VignetteUnOuDes from './jeux/VignetteUnOuDes';
import VignetteCoffre from './jeux/VignetteCoffre';
import VignetteCourse from './jeux/VignetteCourse';
import VignettePizza from './jeux/VignettePizza';
import VignetteMachine from './jeux/VignetteMachine';
import {
  VignetteAOuA, VignetteContraires, VignetteDetective, VignetteNegation, VignetteRoue, VignetteTypes,
} from './jeux/VignettesFrancaisCE1';
import {
  VignettePartage, VignetteRuban, VignetteJardin, VignetteDuree, VignetteBouteilles, VignetteMiroir, VignetteDiagramme, VignetteComplements, VignetteSujet,
} from './jeux/VignettesCE2';
import VignetteTrain from './jeux/VignetteTrain';

/** Les jeux écrits à ce jour. Un jeu du catalogue sans écran ne s'affiche pas. */
const ECRANS = {
  'boite-de-dix': BoiteDeDix,
  marchande: Marchande,
  'train-des-nombres': TrainDesNombres,
  'paquets-de-dix': PaquetsDeDix,
  'chantier-des-formes': ChantierDesFormes,
  horloge: Horloge,
  balance: Balance,
  'deux-par-deux': DeuxParDeux,
  'peche-aux-sons': PecheAuxSons,
  'atelier-syllabes': AtelierDesSyllabes,
  'mots-eclair': MotsEclair,
  'un-ou-des': UnOuDes,
  'coffre-des-centaines': CoffreDesCentaines,
  'course-des-tables': CourseDesTables,
  'parts-de-pizza': PartsDePizza,
  'machine-a-dix': MachineADix,
  'mots-de-liaison': MotsDeLiaison,
  'poeme-theatre-recit': PoemeTheatreRecit,
  'comme-une-image': CommeUneImage,
  'a-qui-le-pronom': AQuiLePronom,
  'le-crible': Crible,
  'le-robot': Robot,
  'sac-de-billes': SacDeBilles,
  'suite-qui-continue': SuiteQuiContinue,
  'boite-mystere': BoiteMystere,
  'recette-pour-8': RecettePour8,
  'regle-des-dixiemes': RegleDesDixiemes,
  'partage-des-bonbons': PartageBonbons,
  'metre-ruban': MetreRuban,
  'tour-du-jardin': TourDuJardin,
  'combien-de-temps': CombienDeTemps,
  'les-bouteilles': Bouteilles,
  'le-miroir': Miroir,
  'le-diagramme': Diagramme,
  'ou-quand-comment': OuQuandComment,
  'sujet-qui-s-eloigne': SujetEloigne,
  'a-ou-a': AOuA,
  'detective-du-verbe': DetectiveDuVerbe,
  'roue-des-verbes': RoueDesVerbes,
  'types-de-phrases': TypesDePhrases,
  'phrase-qui-dit-non': PhraseQuiDitNon,
  'contraires-et-jumeaux': ContrairesEtJumeaux,
};

/**
 * L'APERÇU DE CHAQUE JEU. C'est la seule chose de la carte qu'un CP puisse
 * lire : il ne déchiffre pas encore le titre, mais il reconnaît la boîte de
 * dix qu'il manipule en classe.
 */
const VIGNETTES = {
  'boite-de-dix': VignetteBoiteDeDix,
  'train-des-nombres': VignetteTrain,
  'paquets-de-dix': VignettePaquets,
  'chantier-des-formes': VignetteChantier,
  horloge: VignetteHorloge,
  balance: VignetteBalance,
  'deux-par-deux': VignetteDeux,
  'peche-aux-sons': VignettePeche,
  'atelier-syllabes': VignetteSyllabes,
  'mots-eclair': VignetteEclair,
  'un-ou-des': VignetteUnOuDes,
  'coffre-des-centaines': VignetteCoffre,
  'course-des-tables': VignetteCourse,
  'parts-de-pizza': VignettePizza,
  'machine-a-dix': VignetteMachine,
  'partage-des-bonbons': VignettePartage,
  'metre-ruban': VignetteRuban,
  'tour-du-jardin': VignetteJardin,
  'combien-de-temps': VignetteDuree,
  'les-bouteilles': VignetteBouteilles,
  'le-miroir': VignetteMiroir,
  'le-diagramme': VignetteDiagramme,
  'ou-quand-comment': VignetteComplements,
  'sujet-qui-s-eloigne': VignetteSujet,
  'a-ou-a': VignetteAOuA,
  'detective-du-verbe': VignetteDetective,
  'roue-des-verbes': VignetteRoue,
  'types-de-phrases': VignetteTypes,
  'phrase-qui-dit-non': VignetteNegation,
  'contraires-et-jumeaux': VignetteContraires,
};

/**
 * « MES JEUX » — la ludothèque de l'enfant.
 *
 * Voulue par Camara le 20/09/2026, remplie à partir du 21.
 *
 * ELLE S'OUVRE SUR SA CLASSE, et rien d'autre ne lui est proposé : un CM2 ne
 * doit JAMAIS se voir offrir un jeu de CP. Se voir proposer « pour les petits »
 * fait refermer la page pour de bon, et aucune quantité de jeux ne rattrape ça.
 *
 * MAIS IL PEUT Y RETOURNER LUI-MÊME. Camara, le 23/09/2026 : la frise du CP à
 * la terminale ouvre les classes d'avant et verrouille celles d'après. Choisir
 * de redescendre n'est pas la même chose que se le voir proposer — c'est
 * l'enfant qui décide, et la page continue de s'ouvrir sur son année.
 *
 * LA CLASSE VIENT DU SERVEUR, par deux chemins selon qui regarde : la liste
 * des enfants quand c'est le parent, la session quand c'est l'enfant lui-même
 * avec son code. Les deux portent `niveauCode` depuis le 21/09/2026.
 */
export default function JeuxEleve() {
  const { eleveId } = useParams();
  const { liste } = useSelector((etat) => etat.eleves);

  const [ouvert, setOuvert] = useState(null);

  // La classe REGARDÉE, qui n'est pas forcément la sienne : `null` tant que
  // l'enfant n'a rien choisi, pour que la page s'ouvre toujours sur son année.
  const [regardee, setRegardee] = useState(null);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const enfant = sessionEleve();

  // MÊME FILET QUE POUR LE CYCLE : une session ouverte avant le 21/09/2026 ne
  // porte pas son code de classe. Au primaire — les seuls jeux existants — le
  // libellé EST le code (« CE1 »), donc il suffit.
  const sien = String(enfant?.eleveId) === String(eleveId);

  const niveauCode = eleve?.niveauCode
    ?? (sien ? (enfant?.niveauCode || enfant?.niveau) : null);

  const classe = regardee ?? niveauCode;

  const jeux = useMemo(
    () => jeuxDeLaClasse(classe).filter((jeu) => ECRANS[jeu.cle]),
    [classe],
  );

  // Une classe de la frise « a des jeux » quand elle en a d'ÉCRITS : le
  // catalogue en annonce que les écrans ne servent pas encore.
  const etapes = useMemo(
    () => frisePourLaClasse(
      niveauCode,
      (code) => jeuxDeLaClasse(code).some((jeu) => ECRANS[jeu.cle]),
    ),
    [niveauCode],
  );

  // L'étape de frise qui correspond à ce qu'on regarde. PAR LE RANG et non par
  // le code : la classe d'un lycéen est `SECONDE_PRO` ou `PREMIERE_STMG`, que
  // la frise ne distingue pas — elle n'affiche que l'année.
  const etape = FRISE.find((e) => e.rang === rangDeLaClasse(classe));

  const Ecran = ouvert ? ECRANS[ouvert] : null;

  // LA MATIÈRE DU JEU DÉCIDE DE LA VOIX : les mathématiques parlent avec
  // celle de Nora. Le jeu ne la connaît pas lui-même, c'est le catalogue qui
  // la porte — voir `voix/repliques.js`.
  const matiereCode = jeux.find((j) => j.cle === ouvert)?.matiereCode;

  // OUVRIR UN JEU DOIT L'AMENER SOUS LES YEUX — Camara, le 23/09/2026 :
  // « quand je clique sur un jeu je ne suis jamais focus dessus, il faut que
  // je scrolle à la main ». Le jeu remplace la grille à sa place dans la page,
  // donc SOUS l'en-tête et la carte des niveaux : un enfant qui avait déroulé
  // jusqu'à la dernière matière se retrouvait devant un décor coupé en deux.
  //
  // LE FOCUS AUSSI, et pas seulement le défilement : sans lui, la tabulation
  // repartait du haut de la page, et un lecteur d'écran continuait d'annoncer
  // la liste qui n'existe plus.
  const zone = useRef(null);
  const premierRendu = useRef(true);

  useEffect(() => {
    // Au chargement, on ne bouge rien : la page s'ouvre où elle doit.
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }

    const doux = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    zone.current?.scrollIntoView?.({ block: 'start', behavior: doux ? 'smooth' : 'auto' });
    zone.current?.focus?.({ preventScroll: true });
  }, [ouvert]);

  // ARRIVER PAR LA CARTE DU PROFESSEUR — Camara, le 23/09/2026. À la fin du
  // cours, le professeur propose un jeu ; sa carte mène ici avec
  // `?classe=CE1&jeu=course-des-tables`, et le jeu s'ouvre directement, à
  // cette classe-là. Les mêmes gardes que la frise : jamais une classe
  // au-dessus de la sienne, jamais un jeu qui n'existe pas à cette classe —
  // dans ces cas, la page s'ouvre simplement comme d'habitude.
  const [parametres] = useSearchParams();
  const classeDemandee = (parametres.get('classe') ?? '').toUpperCase();
  const jeuDemande = (parametres.get('jeu') ?? '').toLowerCase();

  useEffect(() => {
    if (!classeDemandee || !jeuDemande) return;

    const rangSien = rangDeLaClasse(niveauCode);
    const rangVu = rangDeLaClasse(classeDemandee);
    if (rangSien !== null && (rangVu === null || rangVu > rangSien)) return;
    if (!jeuxDeLaClasse(classeDemandee).some((j) => j.cle === jeuDemande && ECRANS[j.cle])) return;

    setRegardee(classeDemandee);
    setOuvert(jeuDemande);
  }, [classeDemandee, jeuDemande, niveauCode]);

  return (
    <section className="page page--large">
      <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">← Mes cours</Link>

      <div className="jeux-entete">
        <span className="jeux-entete__icone" aria-hidden="true">
          <img src={iconeJeux} alt="" />
        </span>

        <div>
          {/* LE TITRE PARLE LA LANGUE DES COUVERTURES — voir `.jeux-entete__titre`. */}
          <h1 className="jeux-entete__titre">
            Mes <span className="jeux-entete__titre-accent">jeux</span>
          </h1>
          <p className="page__sous-titre jeux-entete__sous-titre">
            Réviser en jouant, quelques minutes suffisent.
          </p>
        </div>
      </div>

      {/* `tabIndex={-1}` : la zone n'entre pas dans l'ordre de tabulation,
          mais elle peut RECEVOIR le focus quand on le lui donne. C'est ce qui
          permet de poser l'enfant sur le jeu qu'il vient d'ouvrir. */}
      <div className="jeux-zone" ref={zone} tabIndex={-1}>
        {Ecran ? (
          <Ecran
            onQuitter={() => setOuvert(null)}
            matiereCode={matiereCode}
            // LA CLASSE RÈGLE LA DIFFICULTÉ : l'horloge du CE1 a ses demies. Et
            // c'est bien la classe REGARDÉE : un CM2 qui rouvre un jeu de CE1 le
            // retrouve tel qu'il était au CE1, sinon le retour n'a aucun sens.
            niveau={(classe ?? '').toUpperCase()}
          />
        ) : (
          <>
            <FriseDesClasses
              etapes={etapes}
              choisie={etape?.code}
              onChoisir={setRegardee}
            />

            {jeux.length === 0 ? (
              <div className="fiches-vide">
                <p className="fiches-vide__titre">
                  {etape ? `Pas encore de jeu en ${etape.court}.` : 'Pas encore de jeu pour ta classe.'}
                </p>
                <p>
                  Les premiers arrivent bientôt. En attendant, tu peux jouer à
                  ceux des classes d’avant : choisis-les dans la frise.
                </p>
              </div>
            ) : (
              // UNE SECTION PAR MATIÈRE, titrée — voir `parMatiere` dans le
              // catalogue. Chaque section prend la couleur de sa matière, celle
              // que l'enfant voit déjà sur ses cartes de cours.
              <div className="jeux-matieres">
                {parMatiere(jeux).map((groupe) => (
                  <section
                    key={groupe.matiereCode}
                    className="jeux-matiere"
                    style={styleMatiere({ matiereLibelle: groupe.matiere })}
                    aria-labelledby={`jeux-matiere-${groupe.matiereCode}`}
                  >
                    <h2 id={`jeux-matiere-${groupe.matiereCode}`} className="jeux-matiere__titre">
                      <span className="jeux-matiere__pastille" aria-hidden="true" />
                      {groupe.matiere}
                    </h2>

                    <ul className="jeux-liste">
                      {groupe.jeux.map((jeu) => (
                        <li key={jeu.cle}>
                          <CarteJeu jeu={jeu} onOuvrir={setOuvert} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                <ProchainsJeux />
              </div>
            )}
          </>
        )}
        </div>
      </section>
    );
  }

  /** Les matières dont les jeux sont en préparation — voir `ProchainsJeux`. */
  const BIENTOT = ['Anglais', 'Sciences', 'Et plus encore'];

  /**
   * « DE NOUVEAUX JEUX ARRIVENT » — Camara, le 21/09/2026 : « à la fin de la
   * page mes jeux, un message pour dire que plein d'autres jeux arrivent dans
   * les autres matières, que les enfants soient patients ; propre, joli, design
   * gaming ». Au lancement, seuls les maths et le français ont leurs jeux ; ce
   * panneau dit aux enfants que ce n'est qu'un début.
   *
   * Il reprend l'enseigne du titre de la page (Lilita One, cerne de nuit) et
   * ses couleurs fixes, pour être le même sur les deux thèmes. Les matières à
   * venir sont des « niveaux verrouillés » : un cadenas, et « Bientôt ».
   */
  function ProchainsJeux() {
    return (
      <aside className="jeux-bientot" aria-labelledby="jeux-bientot-titre">
        <span className="jeux-bientot__etoiles" aria-hidden="true" />
        <p className="jeux-bientot__badge">Nouveaux niveaux en préparation</p>
        <h2 id="jeux-bientot-titre" className="jeux-bientot__titre">
          D’autres jeux <span className="jeux-bientot__accent">arrivent !</span>
        </h2>
        <p className="jeux-bientot__texte">
          Tes professeurs préparent plein de nouveaux jeux, dans d’autres
          matières. Encore un peu de patience : ils débloquent bientôt !
        </p>

        <ul className="jeux-bientot__matieres">
          {BIENTOT.map((matiere) => (
            <li key={matiere} className="jeux-bientot__matiere">
              <svg className="jeux-bientot__cadenas" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" />
              </svg>
              <span>{matiere}</span>
              <span className="jeux-bientot__etiquette">Bientôt</span>
            </li>
          ))}
        </ul>

        <div className="jeux-bientot__chargement" aria-hidden="true">
          <span className="jeux-bientot__barre" />
      </div>
    </aside>
  );
}

/** Une carte de la ludothèque : sa couverture, ou son aperçu dessiné. */
function CarteJeu({ jeu, onOuvrir }) {
  return (
    <button
      type="button"
      className={`jeu-carte${jeu.image ? ' jeu-carte--illustree' : ''}`}
      style={{
        ...styleMatiere({ matiereLibelle: jeu.matiere }),
        ...(jeu.image ? { backgroundImage: `url(${jeu.image})` } : {}),
      }}
      onClick={() => onOuvrir(jeu.cle)}
    >
      {/* LE DESSIN D'ABORD, LE TEXTE ENSUITE : c'est l'ordre dans
          lequel un enfant lit une carte de jeu.

          L'APERÇU DESSINÉ NE SERT QUE SANS ILLUSTRATION. Les deux
          ensemble feraient deux images l'une sur l'autre — et
          l'aperçu, qui dit déjà ce qu'est le jeu, ferait doublon. */}
      {!jeu.image && (
        <span className="jeu-carte__vignette">
          {VIGNETTES[jeu.cle] ? VIGNETTES[jeu.cle]() : null}
        </span>
      )}

      {/* QUAND LA COUVERTURE PORTE DÉJÀ LE TITRE, on ne le réécrit
          pas par-dessus : ce serait deux fois le même mot, l'un
          peint et l'autre posé. Mais il reste dans le DOM, caché,
          pour les lecteurs d'écran — qui ne voient pas ce qui est
          dessiné sur une image. */}
      <span className={jeu.titreDansImage ? 'visuellement-cache' : 'jeu-carte__corps'}>
        <span className="jeu-carte__matiere">
          <span className="jeu-carte__point" aria-hidden="true" />
          {jeu.matiere}
        </span>
        <strong className="jeu-carte__titre">{jeu.titre}</strong>
        <span className="jeu-carte__accroche">{jeu.accroche}</span>
      </span>

      <span className="jeu-carte__jouer">
        <span className="jeu-carte__triangle" aria-hidden="true" />
        Jouer
      </span>
    </button>
  );
}
