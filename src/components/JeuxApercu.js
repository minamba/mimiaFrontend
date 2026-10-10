import couvertureEclair from '../assets/Jeux/CP/mot_eclaire800.webp';
import couvertureLiaison from '../assets/Jeux/CM1/liaison800.webp';
import couvertureNavale from '../assets/Jeux/secondaire/cinquieme/bataille-navale_couverture.webp';
import couvertureServeur from '../assets/Jeux/secondaire/seconde/escape-maths-lycee_couverture.webp';

/**
 * « APPRENDRE, C'EST AUSSI JOUER » — le teaser des jeux sur la page d'accueil.
 *
 * Voulu par Camara le 23/09/2026, le jour où le professeur s'est mis à
 * proposer un jeu à la fin du cours. La page vendait MIMIA comme un
 * professeur particulier complet et ne disait rien des jeux — alors que c'est
 * la seule chose de l'application qui donne à un enfant envie de revenir de
 * lui-même.
 *
 * COURTE, ET PLACÉE APRÈS L'ÉQUIPE. Une grande section « Gaming » au milieu
 * de la page ferait deux dégâts : elle laisserait croire que MIMIA s'adresse
 * surtout aux petits — les jeux couvrent le primaire aujourd'hui — et elle
 * promettrait plus large que ce qui existe. Elle vient donc après « Une
 * matière, un professeur » et avant « La mémoire d'un vrai prof » : on sait
 * QUI enseigne, on découvre ce que l'enfant fait entre deux séances, puis on
 * revient au suivi.
 *
 * ELLE RATTACHE LE JEU AU COURS, ELLE NE LE POSE PAS À CÔTÉ. C'est le sens du
 * titre en trois temps : le professeur explique, l'enfant s'entraîne, le jeu
 * consolide. Et ce n'est pas une intention — depuis le 23/09/2026, le
 * professeur propose lui-même le jeu à la fin de la séance, sur la notion
 * travaillée ou sur une notion d'avant qui résiste encore.
 *
 * ⚠ CETTE PROMESSE SUPPOSE LA FONCTIONNALITÉ EN LIGNE. Si la balise [JEU] est
 * un jour retirée côté API, ce paragraphe doit partir avec elle.
 *
 * LE CHIFFRE D'ABORD, LA COUVERTURE EN PETIT — choisi par Camara : « plus de
 * 40 jeux » impressionne et ne ment pas ; le niveau réellement couvert est
 * écrit juste en dessous, sans être ce qu'on lit en premier.
 *
 * MIS À JOUR LE 10/10/2026 (Camara) : le collège et le lycée sont jouables.
 * « Plus de 250 jeux » = 249 jeux distincts du catalogue (titres de
 * public/jeux.json, du CP à la terminale) + 17 jeux bonus, soit 266. Le chiffre
 * suppose les interrupteurs Collège et Lycée allumés (Admin › Modes) ; sans le
 * lycée ni le collège, il redevient faux.
 *
 * ET LA COUVERTURE DIT L'ÉTAT, PAS LA LIMITE. « En maths et en français au
 * primaire » tout court enfermait le produit dans ce qu'il est aujourd'hui,
 * alors que d'autres matières et le collège sont en route : la phrase dit
 * donc ce qui existe, puis la direction. Ces deux morceaux sont à retoucher
 * ENSEMBLE le jour où une matière s'ajoute — le chiffre, la phrase, et les
 * trois couvertures au-dessous.
 *
 * « PEUT PROPOSER », ET NON « PROPOSE ». Il ne le fait que s'il a un jeu qui
 * tombe juste et que la porte des jeux est ouverte pour ce cycle : l'annoncer
 * comme systématique serait une promesse que la moitié des séances
 * démentirait. « Lui-même » reste, en revanche : c'est tout l'argument — ce
 * n'est ni au parent ni à l'enfant de chercher le bon jeu.
 *
 * QUATRE COUVERTURES ÉCRITES, TROIS MONTRÉES SUR GRAND ÉCRAN — Camara, le
 * 23/09/2026. Depuis le 10/10/2026 elles vont du CP à la 2de, dans l'ordre :
 * « La bataille navale » (5e) a remplacé « Le partage des bonbons » (CE2) et
 * « Le serveur piraté » (2de) « Les fractions décimales » (CM2).
 *
 * C'est le CM1, en DEUXIÈME position, qui s'efface sur grand écran (règle
 * nth-child(2) dans App.css). Trois cartes tiennent en une rangée, quatre
 * feraient un bandeau ; les trois restantes bornent alors toute la scolarité :
 * CP, 5e, 2de.
 *
 * SUR TÉLÉPHONE, LES QUATRE. Deux colonnes, deux rangées : la grille tombe
 * juste, et l'ordre du DOM suffit à les lire dans l'ordre des classes. Rien
 * n'est réordonné en CSS — ce qui se voit est ce qui est écrit.
 *
 * AUCUN BOUTON. « Découvrir les jeux » ne mènerait nulle part : la ludothèque
 * vit derrière la connexion, à l'adresse d'un enfant précis
 * (`/eleves/:id/jeux`). Un bouton qui renvoie vers l'inscription au milieu
 * d'une section qui n'en parle pas casserait la lecture ; les appels à
 * l'action de la page suffisent.
 */

/**
 * Quatre jeux, quatre classes, deux matières, DANS L'ORDRE DES CLASSES. Les
 * titres sont ceux du catalogue, à la classe indiquée — « Les parts de pizza »
 * devient « Les fractions décimales » au CM2, et c'est ce titre-là qu'un
 * parent verra.
 *
 * LE DEUXIÈME EST CELUI QUE LE GRAND ÉCRAN MASQUE : si tu changes cette
 * liste, garde en deuxième position celui dont tu peux te passer.
 */
const APERCUS = [
  { image: couvertureEclair, titre: 'Les mots éclair', classe: 'CP', matiere: 'Français' },
  { image: couvertureLiaison, titre: 'Les mots de liaison', classe: 'CM1', matiere: 'Français' },
  { image: couvertureNavale, titre: 'La bataille navale', classe: '5e', matiere: 'Mathématiques' },
  { image: couvertureServeur, titre: 'Le serveur piraté', classe: '2de', matiere: 'Mathématiques' },
];

export default function JeuxApercu() {
  return (
    <section className="jeux-apercu">
      <div className="jeux-apercu__texte">
        <span className="etiquette">Apprendre, c’est aussi jouer</span>

        {/* Les trois temps sur trois lignes : c'est la phrase qui rattache le
            jeu au cours, et elle doit se lire comme une progression. */}
        <h2 className="jeux-apercu__titre">
          Le professeur explique.
          <br />
          L’enfant s’entraîne.
          <br />
          <em className="titre-accent">Le jeu consolide.</em>
        </h2>

        <p className="section__intro">
          À la fin du cours, le professeur peut proposer lui-même un jeu sur la
          notion travaillée — ou sur une notion plus ancienne qui mérite d’être
          consolidée. Votre enfant clique, et il s’entraîne aussitôt.
        </p>

        <p className="jeux-apercu__nombre">
          <strong>Plus de 250 jeux</strong> déjà jouables
        </p>

        <p className="jeux-apercu__couverture">
          Du CP à la terminale, en maths et en français, mais aussi en
          histoire-géo, en anglais et en sciences. D’autres matières
          arrivent progressivement.
        </p>
      </div>

      {/* Les couvertures sont décoratives : leur titre est écrit à côté, sur
          la carte. Les décrire une seconde fois ferait répéter chaque jeu aux
          lecteurs d'écran. */}
      <ul className="jeux-apercu__grille">
        {APERCUS.map((jeu) => (
          <li key={jeu.titre} className="jeux-apercu__carte">
            <img src={jeu.image} alt="" loading="lazy" />
            <span className="jeux-apercu__legende">
              <strong>{jeu.titre}</strong>
              <span className="jeux-apercu__matiere">
                {jeu.matiere}
                <span className="jeux-apercu__classe">{jeu.classe}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
