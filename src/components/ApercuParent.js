import { useEffect, useState } from 'react';

/**
 * CE QUE LE PARENT VOIT, MONTRÉ PLUTÔT QUE DÉCRIT.
 *
 * Voulu par Camara le 12/09/2026 : un carrousel des trois écrans du suivi
 * parent, parce que le meilleur argument du produit n'était écrit qu'en mots.
 * Un parent achète ce qu'il peut se représenter.
 *
 * RECONSTRUIT EN HTML, PAS EN CAPTURES D'ÉCRAN. Une image pixellise sur les
 * écrans fins, pèse quelques centaines de kilo-octets, ignore le thème clair
 * et se périme au premier changement de teinte — alors que ces trois écrans
 * changent encore. Reconstruits, ils suivent la charte et restent nets.
 *
 * TOUT CE QUI EST MONTRÉ EXISTE VRAIMENT : les cours suivis, les compétences
 * évaluées, la courbe des notes, la maîtrise notion par notion, le journal des
 * séances et son compte rendu sont exactement ce que l'espace parent affiche.
 * Promettre un écran qui n'existe pas se paierait à la première connexion.
 *
 * Les valeurs sont celles d'un exemple, et la carte le dit.
 */

/** Les notes, dans l'ordre où les évaluations ont été passées. */
const NOTES = [13, 6, 8, 15, 20];

/**
 * La maîtrise, notion par notion.
 *
 * DOUZE PLUTÔT QUE SIX — relevé par Camara le 12/09/2026 : l'écran laissait un
 * grand vide sous la liste. Le vrai suivi en affiche une vingtaine ; en montrer
 * si peu donnait l'image d'un produit qui sait peu de choses, alors que c'est
 * l'inverse qu'il faut comprendre.
 */
const NOTIONS = [
  { nom: 'Utiliser le coefficient de proportionnalité', part: 98 },
  { nom: 'Calculer mentalement un ordre de grandeur', part: 95 },
  { nom: 'Lire, écrire et ranger les nombres décimaux', part: 89 },
  { nom: 'Multiplier des nombres décimaux', part: 87 },
  { nom: 'Effectuer une division euclidienne', part: 84 },
  { nom: 'Encadrer, arrondir, donner une valeur approchée', part: 81 },
  { nom: 'Effectuer une division décimale', part: 68 },
  { nom: 'Appliquer les priorités opératoires', part: 65 },
  { nom: 'Utiliser le théorème de Thalès', part: 53 },
  { nom: 'Poser une multiplication à deux chiffres', part: 48 },
  { nom: 'Reconnaître des fractions égales et simplifier', part: 30 },
  { nom: 'Additionner et soustraire des fractions', part: 16 },
];

/** Vert au-dessus de 80, ambre au-dessus de 40, corail en dessous. */
const tonDe = (part) => (part >= 80 ? 'haut' : part >= 40 ? 'moyen' : 'bas');

/**
 * Le journal des séances.
 *
 * TROIS MATIÈRES DIFFÉRENTES, ET C'EST VOULU. Deux séances d'anglais
 * laissaient la moitié du cadre vide et donnaient à croire que le suivi ne
 * couvre qu'une matière. Un parent doit voir, sur le même écran, que le même
 * compte rendu existe en maths comme en français.
 */
const SEANCES = [
  {
    note: 15,
    matiere: 'Mathématiques',
    travaille: 'addition de fractions, dénominateurs communs',
    remarque:
      '« Il a refait seul les trois derniers exercices, sans revenir à '
      + 'l’exemple. La simplification reste à automatiser. »',
    revoir: 'Reconnaître des fractions égales',
  },
  {
    note: 13,
    matiere: 'Anglais',
    travaille: 'correction de dictée (prétérit, orthographe)',
    remarque:
      '« Bilal a identifié deux erreurs tout seul avec un peu de guidage. Il reste '
      + '« starting », confondu avec le prétérit « started ». »',
    revoir: 'Fin de la correction de dictée',
  },
  {
    note: 12,
    matiere: 'Français',
    travaille: 'accord du participe passé avec avoir',
    remarque:
      '« La règle est sue, mais il oublie de chercher le complément avant le '
      + 'verbe. On reprendra avec des phrases où il est placé avant. »',
    revoir: 'Accord du participe passé employé avec avoir',
  },
];

/** La courbe des notes. Un tracé, pas une bibliothèque : cinq points. */
function Courbe() {
  const largeur = 300;
  const hauteur = 96;
  const pas = largeur / (NOTES.length - 1);

  // 20/20 en haut du cadre, 0 en bas — la même échelle que l'écran réel.
  const y = (note) => hauteur - (note / 20) * hauteur;
  const points = NOTES.map((note, i) => `${i * pas},${y(note)}`).join(' ');

  return (
    <svg className="apercu-progression__courbe" viewBox={`0 -6 ${largeur} ${hauteur + 12}`} aria-hidden="true">
      <line x1="0" y1={y(10)} x2={largeur} y2={y(10)} className="apercu-progression__moyenne" />
      <polyline points={points} className="apercu-progression__trace" />
      {NOTES.map((note, i) => (
        <circle key={i} cx={i * pas} cy={y(note)} r="4" className="apercu-progression__point" />
      ))}
    </svg>
  );
}

function VoletSemaine() {
  return (
    <>
      <div className="apercu__chiffres">
        <div>
          <strong>3</strong>
          <span>cours suivis</span>
        </div>
        <div>
          <strong>24</strong>
          <span>compétences évaluées</span>
        </div>
        <div>
          <strong>2</strong>
          <span>notions acquises</span>
        </div>
      </div>

      <div className="apercu__notions">
        <div className="apercu__notion">
          <span className="apercu__pastille apercu__pastille--acquise" />
          <span className="apercu__titre">Additionner des fractions</span>
          <span className="apercu__etat apercu__etat--acquise">Acquise</span>
        </div>
        <div className="apercu__notion">
          <span className="apercu__pastille apercu__pastille--revoir" />
          <span className="apercu__titre">Proportionnalité</span>
          <span className="apercu__etat apercu__etat--revoir">À revoir</span>
        </div>
        <div className="apercu__notion">
          <span className="apercu__pastille apercu__pastille--acquise" />
          <span className="apercu__titre">Accord du participe passé</span>
          <span className="apercu__etat apercu__etat--acquise">Acquise</span>
        </div>
      </div>

      <div className="apercu__bas">
        <div className="apercu__eval">
          <span className="apercu__eval-note">14<small>/20</small></span>
          <span className="apercu__eval-libelle">
            Évaluation · Fractions
            <small>avec Nora, mercredi</small>
          </span>
        </div>

        <div className="apercu__bilan">
          <span className="apercu__bilan-titre">Votre bilan de la semaine</span>
          <p>
            « Bilal a repris les fractions de zéro et les additionne maintenant
            seul. La proportionnalité reste fragile : on la retravaille la
            semaine prochaine. »
          </p>
          <span className="apercu__bilan-signature">Nora · Mathématiques</span>
        </div>
      </div>
    </>
  );
}

function VoletProgression() {
  return (
    <div className="apercu-progression">
      <div className="apercu-progression__notes">
        <div className="apercu-progression__tete">
          <span className="apercu-progression__matiere">Mathématiques <small>avec Nora</small></span>
          <span className="apercu-progression__moyenne-valeur">13,2<small>/20 de moyenne</small></span>
        </div>

        <Courbe />

        <p className="apercu-progression__legende">
          Ses évaluations, dans l’ordre où elles ont été passées.
          La ligne marque la moyenne.
        </p>
      </div>

      <div className="apercu-progression__notions">
        <span className="apercu-progression__titre">Où il en est, notion par notion</span>

        {NOTIONS.map((notion) => (
          <div key={notion.nom} className="apercu-progression__notion">
            <span className="apercu-progression__nom">{notion.nom}</span>
            <span className={`apercu-progression__jauge apercu-progression__jauge--${tonDe(notion.part)}`}>
              <span style={{ width: `${notion.part}%` }} />
            </span>
            <span className="apercu-progression__part">{notion.part} %</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VoletSeances() {
  return (
    <>
      <span className="apercu-progression__titre">
        Chaque séance, avec le compte rendu de son professeur
      </span>

      <div className="seances">
        {SEANCES.map((seance) => (
          <div key={seance.travaille} className="seance">
            <span className="seance__note">{seance.note}<small>/20</small></span>

            <div className="seance__corps">
              <span className="seance__tete">
                <strong>{seance.matiere}</strong>
                <span>{seance.travaille}</span>
              </span>
              <p className="seance__remarque">{seance.remarque}</p>
              <span className="seance__revoir">À retravailler : {seance.revoir}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const VOLETS = [
  { cle: 'semaine', onglet: 'Cette semaine', Contenu: VoletSemaine },
  { cle: 'progression', onglet: 'Sa progression', Contenu: VoletProgression },
  { cle: 'seances', onglet: 'Ses séances', Contenu: VoletSeances },
];

/** Toutes les six secondes : le temps de lire un écran sans s'installer. */
const DUREE = 6000;

/**
 * Le visiteur a-t-il demandé qu'on limite les animations ? `matchMedia`
 * n'existe pas partout (jsdom des tests, vieux navigateurs) : son absence
 * vaut « pas de préférence », jamais une erreur.
 */
const mouvementReduit = () =>
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ApercuParent() {
  const [volet, setVolet] = useState('semaine');

  /**
   * LE DÉFILEMENT S'ARRÊTE DÈS QUE LE PARENT PREND LA MAIN, ET NE REPART PAS.
   *
   * Un carrousel qui reprend après un clic emporte l'écran qu'on était en
   * train de lire — c'est le reproche le plus courant fait à ce composant.
   * Un clic sur une flèche ou un onglet : la main passe au visiteur.
   */
  const [automatique, setAutomatique] = useState(true);
  const [survol, setSurvol] = useState(false);

  const index = VOLETS.findIndex((v) => v.cle === volet);

  useEffect(() => {
    if (!automatique || survol || mouvementReduit()) return undefined;

    const minuteur = setInterval(() => {
      setVolet((actuel) => {
        const i = VOLETS.findIndex((v) => v.cle === actuel);
        return VOLETS[(i + 1) % VOLETS.length].cle;
      });
    }, DUREE);

    return () => clearInterval(minuteur);
  }, [automatique, survol]);

  /** Le visiteur choisit : on s'arrête et on va où il demande. */
  const allerA = (cle) => {
    setAutomatique(false);
    setVolet(cle);
  };

  /** En boucle dans les deux sens : après le dernier vient le premier. */
  const decaler = (pas) => {
    const suivant = (index + pas + VOLETS.length) % VOLETS.length;
    allerA(VOLETS[suivant].cle);
  };

  return (
    <section className="parents-apercu">
      <header className="section__entete">
        <span className="etiquette">Pour les parents</span>
        <h2>Vous voyez ce qu’il a compris</h2>
        {/* L'INVITATION EST ÉCRITE, PAS SEULEMENT DESSINÉE. Trois boutons en
            haut d'une carte ne suffisent pas à dire qu'il y a trois écrans
            derrière : sans cette phrase, on lit le premier et on passe. */}
        <p className="section__intro">
          Pas seulement « il a travaillé 2 h ». Ce qu’il maîtrise, ce qui résiste
          encore, et ce que son professeur recommande de reprendre.
          <strong className="section__invite">
            Trois écrans de son compte parent&nbsp;: cliquez pour les parcourir.
          </strong>
        </p>
      </header>

      {/* Le survol suspend le défilement — on ne retire pas des yeux du
          lecteur l'écran qu'il examine. Le focus fait de même : arriver au
          clavier sur la carte, c'est déjà s'y intéresser. */}
      <div
        className="apercu"
        onMouseEnter={() => setSurvol(true)}
        onMouseLeave={() => setSurvol(false)}
        onFocus={() => setSurvol(true)}
        onBlur={() => setSurvol(false)}
      >
        {/* LES FLÈCHES DISENT « IL Y A AUTRE CHOSE À CÔTÉ ».
            Un carrousel sans elles se lit comme une carte figée. Elles bouclent
            dans les deux sens : on ne peut jamais rester bloqué à un bout. */}
        <button
          type="button"
          className="apercu__fleche apercu__fleche--avant"
          onClick={() => decaler(-1)}
          aria-label="Écran précédent"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <button
          type="button"
          className="apercu__fleche apercu__fleche--apres"
          onClick={() => decaler(1)}
          aria-label="Écran suivant"
        >
          <span aria-hidden="true">›</span>
        </button>

        {/* LE TITRE DE LA CARTE, ET NON UNE ÉTIQUETTE DANS LA BARRE D'ONGLETS.
            Relevé par Camara le 16/09/2026 : rangé à droite des onglets, il
            repassait à la ligne sur téléphone et se lisait comme un bouton de
            plus. Il annonce la carte entière — sa place est au-dessus. */}
        <p className="apercu__titre">Exemple de suivi</p>

        {/* De vrais boutons, pas des pastilles : on doit pouvoir y arriver au
            clavier et savoir lequel est actif sans voir la couleur. */}
        <div className="apercu__onglets" role="tablist" aria-label="Le suivi parent">
          {VOLETS.map((v) => (
            <button
              key={v.cle}
              type="button"
              role="tab"
              aria-selected={volet === v.cle}
              className={`apercu__onglet${volet === v.cle ? ' est-actif' : ''}`}
              onClick={() => allerA(v.cle)}
            >
              {v.onglet}
            </button>
          ))}
        </div>

        {/* LES TROIS ÉCRANS SONT MONTÉS EN PERMANENCE, SUPERPOSÉS.
            ------------------------------------------------------
            Relevé par Camara le 12/09/2026 : « le carrousel fait bouger la
            page ». Les volets n'ont pas la même hauteur, et celui qui arrivait
            faisait sauter tout ce qui suit — jusqu'au pied de page.

            Empilés dans une même case de grille, la carte prend d'emblée la
            hauteur du plus grand des trois et ne bouge plus. C'est la solution
            déjà retenue pour la démonstration du héros, et pour la même raison.

            Une hauteur écrite en dur aurait marché le jour même, puis serait
            devenue fausse au premier mot ajouté ou à la première largeur
            d'écran inhabituelle. */}
        <div className="apercu__scene">
          {VOLETS.map(({ cle, Contenu }) => (
            <div
              key={cle}
              data-volet={cle}
              className={`apercu__volet${volet === cle ? ' est-ouvert' : ''}`}
              aria-hidden="true"
            >
              <Contenu />
            </div>
          ))}
        </div>
      </div>

      <p className="parents-apercu__note">
        Un compte parent, un profil par enfant, et un bilan par courriel chaque
        semaine — sans rien avoir à demander à votre enfant.
      </p>
    </section>
  );
}
