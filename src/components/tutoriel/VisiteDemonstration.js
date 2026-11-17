import { createPortal } from 'react-dom';
import {
  Coche, IconeEvaluation, IconeSablier, grilleDuMois,
} from '../CalendrierContenu';
import { IconeControle } from '../ControleForm';
import ChoixHeure from '../ChoixHeure';
import { Icone } from '../CopieControle';
import FriseDesClasses from '../jeux/FriseDesClasses';
import ChoixModeFiche from '../mesFiches/ChoixModeFiche';
import JaugeQuota from '../mesFiches/JaugeQuota';
import RenduFiche from '../mesFiches/RenduFiche';
import AjusteALEcran from '../mesFiches/AjusteALEcran';
import Avatar from '../Avatar';
import { iconeEpreuve } from '../PreparationExamen';
import { styleMatiere } from '../../lib/couleurMatiere';
import { paletteDeMatiere, sceneDeMatiere } from '../../lib/scenesMatieres';
import {
  banniereCarte, decorDAnnee, decorDeMatiere, fondScore, livreSeparateur, pastilleAnnee,
} from '../../lib/carteIllustree';
import { jeuxDeLaClasse, parMatiere } from '../../lib/jeux/catalogue';
import { coeursDeLaClasse } from '../../lib/jeux/coeurs';
import { classeDansSaVoie, frisePourLaClasse, rangDeLaClasse } from '../../lib/jeux/frise';
import { exemplePour } from '../../lib/mesFiches/exemples';
import { typesPourLeRang } from '../../lib/mesFiches/typesFiches';
import iconeCahier from '../../assets/cahier.webp';
import banniereDesPodcasts from '../../assets/podcasts-illustre/banniere.webp';
import iconeJaugePodcasts from '../../assets/podcasts-illustre/icone-jauge.webp';
import iconeVoix from '../../assets/voix.png';
import imageTranquille from '../../assets/tranquille.webp';
import imageDefi from '../../assets/defi.webp';
import imageFlash from '../../assets/me-tester/flash.webp';
import imageQuiz from '../../assets/me-tester/quiz.webp';
import imageMtTranquille from '../../assets/me-tester/tranquille.webp';
import imageChallenge from '../../assets/me-tester/challenge.webp';
import imageCerveau from '../../assets/me-tester/cerveau.webp';
import '../carteIllustre.css';
import '../calendrierIllustre.css';
import '../jeuxIllustre.css';
import '../mesFiches/mesFiches.css';
import '../mesFiches/mesFichesPages.css';
import '../mesFiches/meTester.css';
import '../mesFiches/fichesIllustre.css';
import '../podcasts/podcasts.css';
import '../podcasts/podcastsIllustre.css';
import '../podcasts/podcastIllustre.css';

/**
 * LA VISITE DES PORTES (CINQ DEPUIS LES PODCASTS, 16/11/2026) — Camara, le 08/11/2026 : « pour le tutoriel, rentre
 * dans chacun des boutons et montre ce qu'il faut ».
 *
 * DES DESSINS, COMME LE COURS DE DÉMONSTRATION, ET POUR LA MÊME RAISON. Les vraies
 * pages chargent les données de l'enfant, décomptent ses fiches et quitteraient la page
 * qui porte le tutoriel. Ici : les classes des vraies pages, un enfant imaginaire et
 * aucun appel au serveur (`tutorielVisites.test.js` le vérifie).
 *
 * L'ÉCRAN NE TIENT AUCUN ÉTAT : il se déduit de l'étape (`scene` et `vue`, dans
 * `etapes.js`). C'est ce qui rend « Précédent » juste sans rien lui demander de plus.
 *
 * LA VUE ILLUSTRÉE DE L'ENFANT, PARTOUT OÙ ELLE EXISTE — Camara, le 16/11/2026 : « oui, mets-les avec le nouveau
 * design ». Ma carte (`carte-illustree`), Mon calendrier (`cal-illu`), Mes jeux (`jeux-illustre`), la liste des
 * fiches (`mf-illustre`) et les podcasts (`podi`, `podx`), sur le décor commun (`page-decor-enfant`). La création
 * d'une fiche, sa lecture et « Me tester » n'ont pas de vue illustrée dans l'application : ils restent tels quels.
 *
 * SI UNE VRAIE PAGE CHANGE, CE DESSIN NE SUIT PAS TOUT SEUL. Ce qui peut être repris
 * tel quel l'est : la frise, la jauge, les fiches d'exemple, les types de fiches, les
 * jeux de la classe.
 */
const rien = () => {};

/* ------------------------------------------------------------------ Ma carte */

const NOTIONS = [
  { libelle: 'Additionner des nombres décimaux', etat: 'acquise', mot: 'Acquise' },
  { libelle: 'Comparer des fractions', etat: 'en-cours', mot: 'En cours' },
  { libelle: 'Poser une division', etat: 'fragile', mot: 'À revoir' },
  { libelle: 'Calculer une durée', etat: 'a-decouvrir', mot: 'À découvrir' },
];

// Les décors de la vraie carte (lib/carteIllustree.js) : le panorama des maths, celui d'une année d'avant.
const DECOR_MATHS = decorDeMatiere('Mathématiques');

function VisiteCarte() {
  return (
    <section className="page parcours page-decor-enfant carte-illustree">
      <header className="carte-illustree__banniere" style={{ backgroundImage: `url(${banniereCarte})` }}>
        <h1 className="carte-illustree__titre">Ma carte</h1>
        <p className="carte-illustree__ruban">Vois ce que tu as déjà réussi !</p>
      </header>

      <div className="parcours__score" data-tuto="demo-carte-score" style={{ backgroundImage: `url(${fondScore})` }}>
        <strong>24</strong>
        <span>notions maîtrisées — programme de sa classe</span>
        <div className="parcours__jauge" aria-hidden="true"><span style={{ width: '32%' }} /></div>
        <small>32 % du chemin</small>
      </div>

      <details
        className={`parcours__matiere${DECOR_MATHS?.plein ? ' parcours__matiere--panorama' : ''}`}
        open
        style={DECOR_MATHS ? { '--decor': `url(${DECOR_MATHS.decor})` } : undefined}
      >
        <summary data-tuto="demo-carte-matiere">
          {DECOR_MATHS
            ? <img className="parcours__icone" src={DECOR_MATHS.pastille} alt="" />
            : <span className="parcours__pastille" aria-hidden="true" style={{ background: '#14b8a6' }} />}
          <strong>Mathématiques</strong>
          <span className="parcours__compte">14 / 38</span>
          <span className="parcours__mini" aria-hidden="true">
            <span style={{ width: '37%', background: '#14b8a6' }} />
          </span>
        </summary>

        <div className="parcours__domaine" data-tuto="demo-carte-notions">
          <span className="parcours__domaine-nom">Nombres et calculs</span>
          <ul className="parcours__notions">
            {NOTIONS.map((n) => (
              <li key={n.libelle} className={`parcours__notion est-${n.etat}`}>
                <span className="parcours__puce" aria-hidden="true" />
                <span className="parcours__libelle">{n.libelle}</span>
                <span className="parcours__etat">{n.mot}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <section className="parcours__avant" data-tuto="demo-carte-avant">
        <h2 className="parcours__avant-titre">
          <img className="parcours__avant-livre" src={livreSeparateur} alt="" />
          Tu as aussi consolidé 5 notions des années précédentes
        </h2>
        <details
          className="parcours__matiere parcours__matiere--annee parcours__matiere--panorama"
          style={{ '--decor': `url(${decorDAnnee('', 4)})` }}
        >
          <summary>
            <img className="parcours__icone" src={pastilleAnnee} alt="" />
            <strong>L’année dernière</strong>
            <span className="parcours__compte">5 / 7</span>
            <span className="parcours__mini" aria-hidden="true"><span style={{ width: '71%' }} /></span>
          </summary>
        </details>
      </section>
    </section>
  );
}

/* ------------------------------------------------------------ Mon calendrier */

// Un mois de mars qui commence un lundi : aucune case grisée au début de la grille.
const ANNEE = 2027;
const MOIS = 2;
const JOUR_AUJOURDHUI = 12;
const JOUR_OUVERT = 9;
const JOUR_CONTROLE = 18;
const JOUR_AJOUTE = 24;
const JOURS_COURS = [1, 2, 4, 5, 8, 9, 10, 11, 12];
const JOURS_VACANCES = [27, 28, 29, 30, 31];
const JOURS_SEMAINE = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

function GrilleCalendrier({ ajoute }) {
  return (
    <div className="calendrier-grille" role="grid">
      {JOURS_SEMAINE.map((j) => (
        <span key={j} className="calendrier-grille__entete-jour">{j}</span>
      ))}

      {grilleDuMois(ANNEE, MOIS).map(({ date, duMois }) => {
        const n = date.getDate();
        const dedans = (liste) => duMois && liste.includes(n);
        const controle = duMois && (n === JOUR_CONTROLE || (ajoute && n === JOUR_AJOUTE));
        const cours = dedans(JOURS_COURS);
        const evaluation = duMois && n === JOUR_OUVERT;

        // UN REPÈRE PAR ÉTAPE, posé sur une seule case de chaque sorte.
        const repere = !duMois ? undefined
          : n === JOUR_AUJOURDHUI ? 'demo-cal-aujourdhui'
            : n === JOUR_OUVERT ? 'demo-cal-jour'
              : n === 4 ? 'demo-cal-coche'
                : n === JOUR_CONTROLE ? 'demo-cal-controle'
                  : n === JOUR_AJOUTE ? 'demo-cal-ajoute'
                    : n === 29 ? 'demo-cal-vacances'
                      : undefined;

        return (
          <div
            key={date.toISOString()}
            data-tuto={repere}
            className={[
              'calendrier-jour',
              !duMois && 'calendrier-jour--hors-mois',
              dedans(JOURS_VACANCES) && 'calendrier-jour--vacances',
              controle && 'calendrier-jour--controle',
              duMois && n === JOUR_AUJOURDHUI && 'calendrier-jour--aujourdhui',
              duMois && 'calendrier-jour--cliquable',
            ].filter(Boolean).join(' ')}
          >
            <span className="calendrier-jour__numero">{n}</span>
            {controle && <span className="calendrier-jour__marque-controle">Contrôle</span>}
            {(cours || evaluation) && (
              <span className="calendrier-jour__pastilles">
                {cours && <span className="calendrier-jour__coche"><Coche /></span>}
                {evaluation && (
                  <span
                    className="calendrier-jour__coche calendrier-jour__coche--evaluation"
                    data-tuto="demo-cal-evaluation"
                  >
                    <IconeEvaluation />
                  </span>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailDuJour() {
  const seances = [
    { matiere: 'Mathématiques', duree: 25, heure: '17:05' },
    { matiere: 'Français', duree: 15, heure: '18:10' },
  ];

  return (
    <div className="modale" role="dialog" aria-label="Détail de la journée">
      <div className="modale__boite jour-detail">
        <h2 className="jour-detail__titre">mardi 9 mars</h2>

        <section className="jour-detail__section" data-tuto="demo-cal-seances">
          <h3>Matières travaillées</h3>
          <ul>
            {seances.map((s) => (
              <li key={s.matiere} style={styleMatiere({ matiereLibelle: s.matiere })}>
                <span className="jour-detail__pastille" aria-hidden="true" />
                <span className="jour-detail__matiere">{s.matiere}</span>
                <span className="jour-detail__quand">
                  <span className="jour-detail__duree">{s.duree} min</span>
                  <span className="jour-detail__heure">{s.heure}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="jour-detail__separateur" />

        <section className="jour-detail__section" data-tuto="demo-cal-notes">
          <h3>Évaluations</h3>
          <ul>
            <li style={styleMatiere({ matiereLibelle: 'Mathématiques' })}>
              <span className="jour-detail__pastille jour-detail__pastille--evaluation" aria-hidden="true" />
              <span className="jour-detail__matiere">Mathématiques</span>
              <span className="jour-detail__note">15,5/20</span>
              <span className="jour-detail__heure">17:30</span>
            </li>
          </ul>
        </section>

        <div className="modale__actions">
          <button type="button" className="btn-ghost" tabIndex={-1}>Fermer</button>
          <button type="button" className="btn btn--compact" tabIndex={-1} data-tuto="demo-cal-ajouter">
            Ajouter un contrôle
          </button>
        </div>
      </div>
    </div>
  );
}

function FormulaireControle() {
  return (
    <div className="modale" role="dialog" aria-label="Ajouter un contrôle">
      <div className="modale__boite jour-detail">
        <div className="controle-form">
          <header className="controle-form__entete">
            <span className="controle-form__pastille" aria-hidden="true"><IconeControle /></span>
            <span>
              <strong className="controle-form__titre">Ajouter un contrôle</strong>
              <span className="controle-form__soustitre">mercredi 24 mars</span>
            </span>
          </header>

          <div className="controle-form__dictee" data-tuto="demo-cal-dictee">
            <button type="button" className="controle-form__voix" tabIndex={-1} aria-label="Énoncer le contrôle à la voix">
              <img className="controle-form__voix-image" src={iconeVoix} alt="" />
            </button>
            <span className="controle-form__dictee-mot">
              <strong>Dis-le simplement, tout se remplit.</strong>
              <span>« J’ai contrôle vendredi en maths à 11h sur le théorème de Thalès »</span>
            </span>
          </div>

          <div data-tuto="demo-cal-champs">
            <div className="champ">
              <label htmlFor="demo-matiere">Matière</label>
              <select id="demo-matiere" value="maths" onChange={rien} tabIndex={-1}>
                <option value="maths">Mathématiques</option>
              </select>
            </div>

            <div className="champ">
              <label htmlFor="demo-sujet">
                Sujet du contrôle <span className="champ__option">(facultatif)</span>
              </label>
              <textarea id="demo-sujet" value="Les fractions" readOnly tabIndex={-1} rows={2} />
              <span className="champ__aide">Tu peux le laisser vide : ton professeur te le demandera en cours.</span>
            </div>

            <div className="champ">
              <span id="demo-heure" className="champ__libelle">
                Heure <span className="champ__option">(facultatif)</span>
              </span>
              <ChoixHeure id="demo-heure-choix" valeur="11:00" onChange={rien} labelledBy="demo-heure" />
            </div>
          </div>

          <div className="cours-controle" data-tuto="demo-cal-cours">
            <p className="cours-controle__titre">
              Ton cours <span className="champ__option">(facultatif)</span>
            </p>
            <p className="champ__aide">
              Ton professeur préparera le contrôle en suivant ta leçon, puis ajoutera ce qui manque
              du programme. Sans cours, il suit le programme officiel. Photo, PDF, Word, Excel ou
              PowerPoint : tu pourras les revoir ici jusqu’à une semaine après le contrôle.
            </p>
            <div className="cours-controle__boutons">
              <span className="btn btn--compact btn--fantome cours-controle__bouton"><Icone /> Importer mon cours</span>
              <span className="btn btn--compact btn--fantome cours-controle__bouton"><Icone scan /> Scanner avec mon téléphone</span>
            </div>
          </div>

          <div className="modale__actions">
            <button type="button" className="btn-ghost" tabIndex={-1}>Annuler</button>
            <button type="button" className="btn btn--compact" tabIndex={-1}>Ajouter le contrôle</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisiteCalendrier({ vue }) {
  return (
    <section className="page calendrier-eleve page-decor-enfant cal-illu">
      <header className="cal-illu__banniere">
        <div className="cal-illu__textes">
          <h1>Mon calendrier</h1>
          <p>Tes vacances, tes cours, tes évaluations à venir</p>
        </div>
      </header>

      {vue === 'jour' && <DetailDuJour />}
      {vue === 'formulaire' && <FormulaireControle />}

      <p className="calendrier-eleve__decompte" data-tuto="demo-cal-decompte">
        <span className="calendrier-eleve__decompte-icone"><IconeSablier /></span>
        <span className="calendrier-eleve__decompte-texte">
          <span>Les vacances de printemps sont <strong>dans 2 semaines</strong>.</span>
          <span className="calendrier-eleve__decompte-date">à partir du <strong>27 mars</strong></span>
        </span>
      </p>

      <div className="calendrier-eleve__carte">
        <div className="calendrier-eleve__reliure" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
        </div>

        <header className="calendrier-eleve__entete" data-tuto="demo-cal-mois">
          <button type="button" className="calendrier-eleve__nav" tabIndex={-1} aria-label="Mois précédent">‹</button>
          <h2>Mars</h2>
          <button type="button" className="calendrier-eleve__nav" tabIndex={-1} aria-label="Mois suivant">›</button>
        </header>

        <div className="calendrier-eleve__legende" data-tuto="demo-cal-legende">
          <span>
            <span className="calendrier-eleve__pastille calendrier-eleve__pastille--vacances" />
            {' '}Vacances (Zone C)
          </span>
          <span>
            <span className="calendrier-jour__coche calendrier-eleve__coche-legende"><Coche /></span>
            Cours effectué
          </span>
          <span>
            <span className="calendrier-jour__coche calendrier-jour__coche--evaluation calendrier-eleve__coche-legende">
              <IconeEvaluation />
            </span>
            Évaluation
          </span>
          <span>
            <span className="calendrier-jour__marque-controle calendrier-eleve__marque-legende">Contrôle</span>
            {' '}à venir
          </span>
        </div>

        <GrilleCalendrier ajoute={vue === 'ajoute'} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Mes jeux */

// La classe de cet enfant, pour montrer ses vrais jeux. Sans classe connue : le CE2.
const CLASSE_PAR_DEFAUT = 'CE2';

function CarteDeJeu({ jeu }) {
  return (
    <div
      className={`jeu-carte${jeu.image ? ' jeu-carte--illustree' : ''}`}
      style={{
        ...styleMatiere({ matiereLibelle: jeu.matiere }),
        ...(jeu.image ? { backgroundImage: `url(${jeu.image})` } : {}),
      }}
    >
      <span className={jeu.titreDansImage ? 'visuellement-cache' : 'jeu-carte__corps'}>
        <span className="jeu-carte__matiere">
          <span className="jeu-carte__point" aria-hidden="true" />
          {jeu.matiere}
        </span>
        <strong className="jeu-carte__titre">{jeu.titre}</strong>
        <span className="jeu-carte__accroche">{jeu.accroche}</span>
      </span>

      {jeu.escape && (
        <span className="jeu-carte__escape" data-tuto="demo-jeux-escape">
          <span aria-hidden="true">🔐</span>
          Escape game
        </span>
      )}

      <span className="jeu-carte__jouer">
        <span className="jeu-carte__triangle" aria-hidden="true" />
        Jouer
      </span>
    </div>
  );
}

// Trois cartes par matière, dont un escape game s'il y en a : l'étape qui en parle a
// besoin d'en voir un, et les catalogues les rangent souvent en dernier.
function troisJeux(jeux) {
  const escape = jeux.find((jeu) => jeu.escape);
  const autres = jeux.filter((jeu) => !jeu.escape).slice(0, escape ? 2 : 3);
  return escape ? [...autres, escape] : autres;
}

/** La bannière illustrée de « Mes jeux », comme JeuxEleve quand c'est l'enfant (le retour n'est pas un lien). */
function BanniereDesJeux() {
  return (
    <div className="jeux-banniere">
      <span className="lien-retour jeux-banniere__retour">← Mes cours</span>
      <h1 className="jeux-banniere__titre">
        Mes <span className="jeux-banniere__accent">jeux</span>
      </h1>
      <p className="jeux-banniere__sous-titre">Réviser en jouant, quelques minutes suffisent.</p>
    </div>
  );
}

function VisiteJeux({ vue, classe }) {
  const code = classe ?? CLASSE_PAR_DEFAUT;
  const coeurs = coeursDeLaClasse(code);

  // AU CP, LE DÉFI N'EXISTE PAS, et le vrai écran du choix ne s'affiche pas : on reste
  // sur la liste, et les étapes des modes se sautent faute de cible.
  if (vue === 'modes' && coeurs) {
    return (
      <section className="page page--large page-decor-enfant jeux-illustre">
        <BanniereDesJeux />
        <div className="jeux-zone">
        <div className="jeu jeu--choix">
          <p className="choix-mode__pastille"><span>Choisis ton mode de jeu</span></p>
          <h2 className="choix-mode__titre">
            <span className="choix-mode__question">
              <span className="choix-mode__question-texte">Comment veux-tu jouer&nbsp;?</span>
            </span>
          </h2>
          <ul className="choix-mode__portes">
            <li data-tuto="demo-jeux-tranquille">
              <div className="choix-mode__porte">
                <img className="choix-mode__image" src={imageTranquille} alt="" width="620" height="857" />
              </div>
            </li>
            <li data-tuto="demo-jeux-defi">
              <div className="choix-mode__porte choix-mode__porte--defi">
                <span className="choix-mode__cadre">
                  <img className="choix-mode__image" src={imageDefi} alt="" width="620" height="870" />
                </span>
              </div>
            </li>
          </ul>
        </div>
        </div>
      </section>
    );
  }

  const groupes = parMatiere(jeuxDeLaClasse(code));
  const deCours = groupes.filter((g) => g.matiereCode !== 'BONUS').slice(0, 2);
  const bonus = groupes.find((g) => g.matiereCode === 'BONUS');
  const etapes = frisePourLaClasse(code, (c) => jeuxDeLaClasse(classeDansSaVoie(c, code)).length > 0);
  const choisie = etapes.find((e) => e.sienne)?.code;

  return (
    <section className="page page--large page-decor-enfant jeux-illustre">
      <BanniereDesJeux />

      <div className="jeux-zone">
        <div data-tuto="demo-jeux-frise">
          <FriseDesClasses etapes={etapes} choisie={choisie} onChoisir={rien} illustree />
        </div>

        <div className="jeux-matieres">
          {deCours.map((groupe, rang) => (
            <section
              key={groupe.matiereCode}
              className="jeux-matiere"
              style={styleMatiere({ matiereLibelle: groupe.matiere })}
              data-tuto={rang === 0 ? 'demo-jeux-matiere' : undefined}
            >
              <h2 className="jeux-matiere__titre">
                <span className="jeux-matiere__pastille" aria-hidden="true" />
                {groupe.matiere}
              </h2>
              <ul className="jeux-liste">
                {troisJeux(groupe.jeux).map((jeu) => <li key={jeu.cle}><CarteDeJeu jeu={jeu} /></li>)}
              </ul>
            </section>
          ))}

          {bonus && (
            <section
              className="jeux-matiere"
              style={styleMatiere({ matiereLibelle: bonus.matiere })}
              data-tuto="demo-jeux-bonus"
            >
              <h2 className="jeux-matiere__titre">
                <span className="jeux-matiere__pastille" aria-hidden="true" />
                {bonus.matiere}
              </h2>
              <p className="jeux-matiere__note">
                Pour le plaisir de jouer : ces jeux ne sont pas liés aux notions de cours.
              </p>
              <ul className="jeux-liste">
                {bonus.jeux.slice(0, 3).map((jeu) => <li key={jeu.cle}><CarteDeJeu jeu={jeu} /></li>)}
              </ul>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Mes fiches de révision */

const FICHE = exemplePour('classique', 'FRANCAIS');
const QUESTION = exemplePour('questions', 'FRANCAIS')?.blocs?.[0]?.questions?.[0];

const NOTIONS_DU_COURS = [
  { titre: 'Les figures de ressemblance', resume: 'Comparaison, métaphore, personnification, allégorie' },
  { titre: 'Les figures d’opposition', resume: 'Antithèse, oxymore, antiphrase' },
  { titre: 'Les figures d’insistance et d’atténuation', resume: 'Hyperbole, gradation, litote, euphémisme' },
];

const OPTIONS_QUIZ = [
  { texte: 'Une comparaison', etat: ' est-juste' },
  { texte: 'Une métaphore', etat: ' est-eteint' },
  { texte: 'Une antithèse', etat: ' est-eteint' },
  { texte: 'Une litote', etat: ' est-eteint' },
];

const QUOTA = {
  utilisees: 3, maximum: 10, restantes: 7, credits: 0, disponibles: 7, remiseLe: new Date(ANNEE, MOIS + 1, 1),
};

function EtapeDemo({ repere, numero, titre, aide, children }) {
  return (
    <section className="mf-etape est-active" data-tuto={repere}>
      <h2 className="mf-etape__titre">
        <span className="mf-etape__numero" aria-hidden="true">{numero}</span>
        {titre}
      </h2>
      <p className="mf-etape__aide">{aide}</p>
      <div className="mf-etape__corps">{children}</div>
    </section>
  );
}

function ListeDesFiches() {
  return (
    <>
      <header className="mf-entete">
        <span className="mf-entete__vignette" aria-hidden="true">
          <img className="mf-entete__icone" src={iconeCahier} alt="" />
        </span>
        <div className="mf-entete__texte">
          <span className="mf-entete__surtitre">Ton espace de révision</span>
          <h1>Mes <span className="mf-entete__accent">fiches de révision</span></h1>
          <p>Importe ton cours, choisis ta fiche : elle est prête en un instant, rangée dans sa matière.</p>
        </div>
        <span className="btn mf-entete__bouton" data-tuto="demo-fiches-creer">+ Créer une fiche</span>
      </header>

      <div data-tuto="demo-fiches-quota"><JaugeQuota quota={QUOTA} achat={false} /></div>

      <section
        className="mf-matiere"
        style={{ ...styleMatiere('FRANCAIS'), ...paletteDeMatiere({ code: 'FRANCAIS' }) }}
        data-tuto="demo-fiches-liste"
      >
        <h2 className="mf-matiere__titre">
          {sceneDeMatiere('FRANCAIS') && <span className="mf-matiere__pastille" aria-hidden="true" />}
          Français
          <span className="mf-matiere__compte">1 cours</span>
        </h2>
        <ul className="mf-cours-liste">
          <li className="mf-carte-cours">
            <div className="mf-cours">
              <span className="mf-pile fdr-feuille--classique" aria-hidden="true">
                <span className="mf-pile__feuille" />
                <span className="mf-pile__feuille" />
                <span className="mf-pile__feuille"><span className="mf-pile__lignes" /></span>
                <span className="mf-pile__nombre">3</span>
              </span>
              <span className="mf-cours__texte">
                <span className="mf-cours__titre">Les figures de style</span>
                <span className="mf-cours__date">Importé le 3 mars</span>
                <span className="mf-cours__types">
                  <span className="mf-badge fdr-feuille--classique">Fiche classique · 3</span>
                </span>
              </span>
            </div>
            <div className="mf-cours__pied">
              <span className="mf-cours__completer">Compléter</span>
              <span className="mf-cours__supprimer">Supprimer</span>
            </div>
            <span className="mf-cours__tester">
              <img className="mf-cerveau" src={imageCerveau} alt="" /> Me tester
              <span className="mf-cours__tester-modes" aria-hidden="true">Flash cards · Quiz</span>
            </span>
          </li>
        </ul>
      </section>
    </>
  );
}

function CreationDepuisUnCours({ classe }) {
  const types = typesPourLeRang(rangDeLaClasse(classe) ?? undefined);

  return (
    <>
      <h1 className="mf-titre">Créer une fiche</h1>

      <EtapeDemo repere="demo-fiches-matiere" numero={1} titre="Choisis ta matière" aide="Touche la matière de ton cours.">
        <div className="mf-choix">
          {[['FRANCAIS', 'Français'], ['MATHS', 'Mathématiques'], ['ANGLAIS', 'Anglais']].map(([code, libelle]) => (
            <span
              key={code}
              className={`mf-choix__matiere${code === 'FRANCAIS' ? ' est-choisi' : ''}`}
              style={styleMatiere(code)}
            >
              <span className="mf-coche" aria-hidden="true" />
              {libelle}
            </span>
          ))}
        </div>
      </EtapeDemo>

      <EtapeDemo repere="demo-fiches-types" numero={2} titre="Choisis ton type de fiche" aide="Touche la fiche que tu veux.">
        <div className="mf-types">
          {types.map((t, rang) => {
            const exemple = exemplePour(t.code, 'FRANCAIS');
            return (
              <div key={t.code} className={`mf-type-case fdr-feuille--${t.code}${rang === 0 ? ' est-choisi' : ''}`}>
                <div className={`mf-type${rang === 0 ? ' est-choisi' : ''}`}>
                  <span className="mf-type__texte">
                    <span className="mf-type__nom">{t.libelle}</span>
                    <span className="mf-type__accroche">{t.accroche}</span>
                    {t.decoupe === 'notion' && <span className="mf-type__note">Une fiche par notion</span>}
                  </span>
                  <span className="mf-type__choix" aria-hidden="true">
                    <span className="mf-coche" />
                    {rang === 0 ? 'Choisie' : 'Choisir'}
                  </span>
                </div>
                {exemple && (
                  <>
                    <div className="mf-type__miniature" aria-hidden="true" inert>
                      <div className="mf-type__echelle"><RenduFiche fiche={exemple} miniature /></div>
                    </div>
                    <span className="mf-type__voir">Voir un exemple</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </EtapeDemo>

      <EtapeDemo
        repere="demo-fiches-import"
        numero={3}
        titre="Importe ton cours"
        aide="Une partie ou le chapitre entier : photos ou PDF, 20 pages au plus. Au-delà de 10 pages, ton cours compte pour 2."
      >
        <div className="cours-controle__boutons">
          <span className="btn btn--compact btn--fantome cours-controle__bouton"><Icone /> Importer mon cours</span>
          <span className="btn btn--compact btn--fantome cours-controle__bouton"><Icone scan /> Scanner avec mon téléphone</span>
        </div>
      </EtapeDemo>
    </>
  );
}

function CreationLibre() {
  return (
    <>
      <h1 className="mf-titre">Créer une fiche</h1>
      <p className="mf-mode__rappel"><span>Fiche libre : <strong>tu écris ou tu dictes</strong></span></p>

      <EtapeDemo
        repere="demo-fiches-libre"
        numero={3}
        titre="Écris ou dicte ce que tu veux réviser"
        aide="Ta leçon, tes notes, ou juste le sujet (« les fractions », « le passé composé ») : au clavier ou au micro."
      >
        <div className="mf-libre">
          <textarea className="mf-libre__texte" value="Les figures de style" readOnly tabIndex={-1} rows={6} aria-label="Ce que tu veux réviser" />
          <div className="mf-libre__pied">
            <span className="controle-form__voix mf-libre__micro">
              <img className="controle-form__voix-image" src={iconeVoix} alt="" />
            </span>
            <span className="mf-libre__etat"><span>Touche le micro pour dicter.</span></span>
            <span className="mf-libre__compteur">20 / 15000</span>
          </div>
        </div>
      </EtapeDemo>
    </>
  );
}

function ChoixDesNotions() {
  return (
    <section className="mf-etat" data-tuto="demo-fiches-notions">
      <h2 className="mf-etape__titre">Ton cours contient 3 notions</h2>
      <p className="champ__aide">
        Une fiche classique par notion. Décoche celles que tu ne veux pas réviser.
        {' '}Toutes ensemble, elles ne comptent que pour un seul cours.
      </p>
      <ul className="mf-notions">
        {NOTIONS_DU_COURS.map((notion) => (
          <li key={notion.titre}>
            <label className="mf-notion est-choisie">
              <input type="checkbox" checked readOnly tabIndex={-1} />
              <span>
                <strong>{notion.titre}</strong>
                <span className="mf-notion__resume">{notion.resume}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mf-actions">
        <span className="btn mf-actions__principal">Créer mes 3 fiches</span>
      </div>
    </section>
  );
}

function LectureDUneFiche() {
  return (
    <section className="mf-lecture">
      <div className="mf-lecteur a-un-sommaire">
        <nav className="mf-sommaire" aria-label="Les fiches de ce cours" data-tuto="demo-fiches-sommaire">
          <p className="mf-sommaire__titre">Les notions</p>
          <ol className="mf-sommaire__liste">
            {NOTIONS_DU_COURS.map((n, i) => (
              <li key={n.titre}>
                <span className={`mf-sommaire__notion${i === 0 ? ' est-courante' : ''}`}>
                  <span className="mf-sommaire__numero" aria-hidden="true">{i + 1}</span>
                  <span className="mf-sommaire__nom">{n.titre}</span>
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mf-lecteur__fiche">
          <div className="mf-fiche-actions mf-outils" data-tuto="demo-fiches-actions">
            <span className="btn btn--compact mf-bouton-tester">
              <img className="mf-cerveau" src={imageCerveau} alt="" /> Me tester
            </span>
            <span className="btn btn--compact">Imprimer ou enregistrer en PDF</span>
            <span className="btn btn--compact mf-bouton-tout">Toutes les fiches en PDF (3)</span>
          </div>
          <div data-tuto="demo-fiches-feuille">
            <AjusteALEcran type={FICHE?.type} aGauche>
              {FICHE && <RenduFiche fiche={FICHE} />}
            </AjusteALEcran>
          </div>
        </div>
      </div>
    </section>
  );
}

function FenetreMeTester({ children }) {
  return (
    <div className="mt" role="presentation">
      <div className="mt__fenetre" role="dialog" aria-label="Me tester : Les figures de style">
        <div className="mt__tete">
          <div>
            <p className="mt__surtitre"><img className="mf-cerveau" src={imageCerveau} alt="" /> Me tester</p>
            <p className="mt__titre">Les figures de style</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function ChoixDuJeu() {
  return (
    <div className="mt-choix">
      <p className="mt-choix__question">Comment veux-tu t’entraîner ?</p>
      <div className="mt-choix__grille" data-tuto="demo-tester-jeux">
        <div className="mt-choix__image mt-choix__image--cartes"><img src={imageFlash} alt="Flash cards" /></div>
        <div className="mt-choix__image mt-choix__image--quiz"><img src={imageQuiz} alt="Quiz" /></div>
      </div>
    </div>
  );
}

function ChoixDuModeDeTest() {
  return (
    <div className="mt-choix">
      <p className="mt-choix__question">Flash cards : quel mode ?</p>
      <div className="mt-choix__grille" data-tuto="demo-tester-modes">
        <div className="mt-choix__image mt-choix__image--mode"><img src={imageMtTranquille} alt="Tranquille" /></div>
        <div className="mt-choix__image mt-choix__image--mode"><img src={imageChallenge} alt="Challenge" /></div>
      </div>
    </div>
  );
}

function FlashCard({ retournee }) {
  return (
    <div className="mt-jeu">
      <div className="mt-jeu__haut"><span className="mt-jeu__compte">Carte 1 / 6</span></div>
      <div className="mt-progression" aria-hidden="true"><span style={{ width: '0%' }} /></div>

      <div data-tuto="demo-tester-carte">
      <div className="mt-pile">
        <span className="mt-pile__fantome mt-pile__fantome--2" aria-hidden="true" />
        <span className="mt-pile__fantome mt-pile__fantome--1" aria-hidden="true" />
        <div className={`mt-carte${retournee ? ' est-retournee' : ''}`}>
          <span className="mt-carte__interieur">
            <span className="mt-carte__face mt-carte__face--avant">
              <span className="mt-carte__etiquette">Question</span>
              <span className="mt-carte__texte">{QUESTION?.question}</span>
              <span className="mt-carte__aide">Touche la carte pour voir la réponse</span>
            </span>
            <span className="mt-carte__face mt-carte__face--arriere">
              <span className="mt-carte__etiquette">Réponse</span>
              <span className="mt-carte__texte mt-carte__texte--reponse">
                Elle rapproche deux idées opposées dans une même phrase.
              </span>
            </span>
          </span>
        </div>
      </div>

      <div className={`mt-jugement${retournee ? ' est-visible' : ''}`}>
        <span className="mt-jugement__bouton mt-jugement__bouton--revoir"><span aria-hidden="true">😕</span> À revoir</span>
        <span className="mt-jugement__bouton mt-jugement__bouton--savais"><span aria-hidden="true">😎</span> Je savais</span>
      </div>
      </div>
    </div>
  );
}

function Quiz() {
  return (
    <div className="mt-jeu">
      <div className="mt-jeu__haut"><span className="mt-jeu__compte">Question 1 / 6</span></div>
      <div className="mt-progression" aria-hidden="true"><span style={{ width: '0%' }} /></div>

      <div data-tuto="demo-tester-quiz">
        <div className="mt-question">
          <p className="mt-question__texte">« Il est fort comme un lion » : quelle est cette figure ?</p>
        </div>
        <ol className="mt-options">
          {OPTIONS_QUIZ.map((o, i) => (
            <li key={o.texte}>
              <div className={`mt-option${o.etat}`}>
                <span className="mt-option__lettre" aria-hidden="true">{'ABCD'[i]}</span>
                <span className="mt-option__texte">{o.texte}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-verdict est-juste">
          <strong>Bravo, c’est juste !</strong>
          <span>Le mot « comme » rapproche les deux éléments : c’est l’outil de la comparaison.</span>
        </div>
      </div>
    </div>
  );
}

const ECRANS_ME_TESTER = {
  'tester-jeux': <ChoixDuJeu />,
  'tester-modes': <ChoixDuModeDeTest />,
  'carte-question': <FlashCard retournee={false} />,
  'carte-reponse': <FlashCard retournee />,
  quiz: <Quiz />,
};

function VisiteFiches({ vue, classe }) {
  const meTester = ECRANS_ME_TESTER[vue];
  // LA LISTE A SA VUE ILLUSTRÉE (MesFiches.js) ; la création, les notions et la lecture n'en ont pas.
  const liste = !vue || vue === 'mode' || Boolean(meTester);

  return (
    <div className={`mf-page${liste ? ' page-decor-enfant mf-illustre' : ''}`}>
      {liste && <ListeDesFiches />}
      {vue === 'cours' && <CreationDepuisUnCours classe={classe} />}
      {vue === 'libre' && <CreationLibre />}
      {vue === 'notions' && <ChoixDesNotions />}
      {vue === 'fiche' && <LectureDUneFiche />}

      {vue === 'mode' && <ChoixModeFiche onChoisir={rien} onFermer={rien} />}
      {meTester && <FenetreMeTester>{meTester}</FenetreMeTester>}
    </div>
  );
}

/* ------------------------------------------------------------------ Mes podcasts */

/**
 * LA VISITE DES PODCASTS — Camara, le 16/11/2026. Les classes des vraies pages dans leur vue illustrée (`podi`, `podx`,
 * la fenêtre de choix des podcasts elle-même), un podcast imaginaire d'histoire, la tête de Salim : aucun son, aucun appel au serveur.
 */
const QUOTA_PODCASTS = {
  utilisees: 2, maximum: 10, restantes: 8, credits: 0, disponibles: 8, remiseLe: new Date(ANNEE, MOIS + 1, 1),
};

const PODCASTS = [
  { titre: 'La Première Guerre mondiale', episodes: '12 épisodes', date: '4 mars' },
  { titre: 'Les débuts de l’Islam', episodes: '5 épisodes', date: '26 février' },
];

const EPISODES_DU_COURS = [
  { titre: 'Le monument aux morts du village', resume: 'Ce qu’il raconte, et pourquoi il y en a partout' },
  { titre: 'Une guerre de tranchées', resume: 'La vie des soldats sur le front' },
  { titre: 'Verdun, 1916', resume: 'La bataille et sa mémoire' },
  { titre: 'L’arrière et les civils', resume: 'Les femmes, les usines, les colonies' },
];

const PHRASES = [
  'Salut, c’est Salim ! Aujourd’hui, on commence notre voyage dans la Première Guerre mondiale.',
  'Et pour ce premier épisode, on part de quelque chose que tu as sûrement déjà vu : le monument aux morts.',
  'Presque tous les villages de France en ont un.',
];

const MATIERE_PODCASTS = { code: 'HISTOIRE_GEO', libelle: 'Histoire-Géographie' };
const ONDE_LECTEUR = [30, 55, 40, 75, 50, 90, 60, 100, 70, 45, 80, 55, 35, 60, 40, 25];

/* LA VUE ILLUSTRÉE, PAS L'ANCIENNE — Camara, le 16/11/2026 : « le tuto du podcast ne va pas, il utilise l'ancien
   design ! ». Le même markup que MesPodcasts, CoursPodcast et LecteurEpisode quand c'est l'enfant (`podi`, `podx`,
   `page-decor-enfant`), recopié parce que les vrais composants appellent le serveur. Les liens deviennent des `span`. */
function ListeDesPodcasts() {
  return (
    <div className="mf-page pod-page page-decor-enfant podi">
      <div className="podi-banniere" style={{ backgroundImage: `url(${banniereDesPodcasts})` }}>
        <h1 className="podi-banniere__titre">Mes <span>podcasts</span></h1>
        <p className="podi-banniere__sous-titre">
          Ton cours, raconté par ton professeur : à écouter dans le bus, avant un contrôle, ou les yeux fermés.
        </p>
        <span className="podi-banniere__creer">
          <span className="podi-micro" aria-hidden="true" />
          Créer un podcast
        </span>
      </div>

      <div data-tuto="demo-podcasts-liste">
        <div className="podi-jauge">
          <img className="podi-jauge__icone" src={iconeJaugePodcasts} alt="" />
          <JaugeQuota quota={QUOTA_PODCASTS} module="podcasts" achat={false} />
        </div>
        <section className="pod-matiere" style={styleMatiere(MATIERE_PODCASTS.code)}>
          <h2 className="pod-matiere__titre">
            <span className="pod-matiere__pastille" aria-hidden="true" />
            {MATIERE_PODCASTS.libelle}
          </h2>
          <ul className="pod-cartes">
            {PODCASTS.map((p) => (
              <li key={p.titre} className="podi-carte est-pret" style={paletteDeMatiere(MATIERE_PODCASTS)}>
                <span className="podi-carte__lien">
                  <span className="podi-carte__vignette" aria-hidden="true" />
                  <span className="podi-carte__texte">
                    <span className="podi-carte__matiere">{MATIERE_PODCASTS.libelle}</span>
                    <strong className="podi-carte__titre">
                      <span className="podi-onde" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                      {p.titre}
                    </strong>
                    <span className="podi-carte__meta">
                      <span className="podi-carte__episodes">
                        <span className="podi-icone podi-icone--pile" aria-hidden="true" />
                        {p.episodes}
                      </span>
                      <span className="podi-carte__date">
                        <span className="podi-icone podi-icone--agenda" aria-hidden="true" />
                        {p.date}
                      </span>
                    </span>
                  </span>
                  <span className="podi-carte__jouer" aria-hidden="true"><span className="podi-triangle" /></span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** La page d'un podcast, vue illustrée : la scène de la matière en bannière, comme CoursPodcast. */
function PageDuPodcast({ children, ecoute = false }) {
  const scene = sceneDeMatiere(MATIERE_PODCASTS.code);
  const style = {
    ...styleMatiere(MATIERE_PODCASTS.code),
    ...paletteDeMatiere(MATIERE_PODCASTS),
    ...(scene ? { '--podx-scene': `url(${scene.image})` } : {}),
  };

  return (
    <div className={`mf-page pod-page page-decor-enfant podx${scene ? ' podx--scene' : ''}`} style={style}>
      <section className="podx-banniere">
        <span className="podx-banniere__scene" aria-hidden="true" />
        <span className="lien-retour podx-banniere__retour">← Mes podcasts</span>
        <span className="podx-banniere__matiere">
          <span aria-hidden="true">{iconeEpreuve({ libelle: MATIERE_PODCASTS.libelle })}</span>
          {MATIERE_PODCASTS.libelle}
        </span>
        <h1 className="podx-banniere__titre">La Première Guerre mondiale</h1>
        {ecoute && (
          <>
            <p className="podx-banniere__resume">
              <span className="podx-banniere__casque" aria-hidden="true">🎧</span>
              12 épisodes · 43:25 d’écoute
            </p>
            <div className="pod-tout" data-tuto="demo-podcasts-tout">
              <span className="btn btn--compact">▶ Tout écouter</span>
              <span className="pod-lecteur__telecharger"><span className="pod-icone-telecharger" aria-hidden="true" />Tout télécharger</span>
              <span className="pod-lecteur__telecharger"><span className="pod-icone-telecharger" aria-hidden="true" />Un seul fichier MP3</span>
            </div>
          </>
        )}
      </section>
      {children}
    </div>
  );
}

function ChoixDesEpisodes() {
  return (
    <PageDuPodcast>
      <section className="pod-notions" data-tuto="demo-podcasts-episodes">
        <h2 className="pod-notions__titre">Choisis tes épisodes</h2>
        <p className="champ__aide">
          Une notion de ton cours = un épisode de quelques minutes. Décoche ce que tu ne veux pas écouter.
        </p>
        <ul className="pod-notions__liste">
          {EPISODES_DU_COURS.map((n, i) => (
            <li key={n.titre}>
              <label className="pod-notion est-coche">
                <input type="checkbox" checked readOnly tabIndex={-1} />
                <span className="pod-notion__rang">{i + 1}</span>
                <span className="pod-notion__texte">
                  <strong>{n.titre}</strong>
                  <span>{n.resume}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mf-actions">
          <span className="btn mf-actions__principal">Créer mes {EPISODES_DU_COURS.length} épisodes</span>
        </div>
      </section>
    </PageDuPodcast>
  );
}

function LecteurDemo() {
  return (
    <PageDuPodcast ecoute>
      <div className="pod-episodes">
        <div className="pod-lecteur est-en-lecture podx-lecteur" data-tuto="demo-podcasts-lecteur">
          <div className="pod-lecteur__tete">
            <span className="pod-lecteur__prof"><Avatar nom="salim" taille={92} /></span>
            <div className="pod-lecteur__titres">
              <span className="pod-lecteur__rang">Épisode 1 sur 12 · avec Salim</span>
              <strong className="pod-lecteur__titre">Le monument aux morts du village</strong>
            </div>
            <span className="podx-onde" aria-hidden="true">
              {ONDE_LECTEUR.map((h, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <i key={i} style={{ '--h': `${h}%` }} />
              ))}
            </span>
          </div>
          <div className="pod-lecteur__barre">
            <span className="pod-lecteur__temps">1:12</span>
            <input
              type="range"
              className="pod-lecteur__progression"
              min={0}
              max={242}
              value={72}
              onChange={rien}
              tabIndex={-1}
              aria-hidden="true"
              style={{ '--pod-avance': `${(72 / 242) * 100}%` }}
            />
            <span className="pod-lecteur__temps">4:02</span>
          </div>
          <div className="pod-lecteur__commandes">
            <span className="pod-lecteur__saut">−10 s</span>
            <span className="pod-lecteur__jouer"><span className="pod-icone-pause" aria-hidden="true" /></span>
            <span className="pod-lecteur__saut">+10 s</span>
            <span className="pod-lecteur__vitesse">1×</span>
          </div>
          <div className="pod-lecteur__texte-zone">
            <div className="pod-lecteur__liens">
              <span className="pod-lecteur__afficher">
                <span className="podx-icone-texte" aria-hidden="true" />
                Masquer le texte
                <span className="podx-chevron est-ouvert" aria-hidden="true" />
              </span>
              <span className="pod-lecteur__telecharger">
                <span className="pod-icone-telecharger" aria-hidden="true" />
                Télécharger en MP3
              </span>
            </div>
            <div className="pod-lecteur__texte">
              <p className="est-en-cours">
                {PHRASES.map((phrase, k) => (
                  <span
                    key={phrase}
                    className={`pod-phrase${k === 1 ? ' est-dite' : ''}${k === 0 ? ' est-passee' : ''}`}
                  >
                    {phrase}{' '}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageDuPodcast>
  );
}

function VisitePodcasts({ vue }) {
  return (
    <>
      {(!vue || vue === 'mode') && <ListeDesPodcasts />}
      {vue === 'episodes' && <ChoixDesEpisodes />}
      {vue === 'lecteur' && <LecteurDemo />}

      {vue === 'mode' && <ChoixModeFiche module="podcasts" onChoisir={rien} onFermer={rien} />}
    </>
  );
}

/* ------------------------------------------------------------------ l'écran */

const SCENES = {
  carte: VisiteCarte,
  calendrier: VisiteCalendrier,
  jeux: VisiteJeux,
  fiches: VisiteFiches,
  podcasts: VisitePodcasts,
};

export default function VisiteDemonstration({ scene, vue, classe }) {
  const Ecran = SCENES[scene];
  if (!Ecran) return null;

  return createPortal(
    <div className="tuto-demo tuto-visite" data-tuto-visite={scene}>
      <p className="tuto-visite__exemple">Démonstration : un exemple, pas les données de votre enfant</p>
      <Ecran vue={vue} classe={classe} />
    </div>,
    document.body,
  );
}
