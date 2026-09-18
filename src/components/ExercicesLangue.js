import { ContenuTableau } from './ComparaisonDictee';
import LecteurAudio from './LecteurAudio';
import { VITESSES, VITESSE_PAR_DEFAUT } from '../lib/storage/vitesseEcoute';
import extraitAnglais from '../assets/demo_comprehension_oral_anglais.mp3';

/**
 * CE QU'AUCUN CHATBOT NE FAIT : DICTER, ÉCOUTER, CORRIGER.
 *
 * Voulu par Camara le 12/09/2026. C'est la vraie différence du produit, et
 * elle n'était écrite nulle part sur la page : un parent comprend « il parle »
 * en voyant la démo du héros, mais pas qu'il DICTE un texte, le relit, et
 * rend une copie corrigée erreur par erreur.
 *
 * LE TABLEAU EST LE VRAI COMPOSANT, PAS UNE IMITATION. La correction affichée
 * ici passe par `ContenuTableau` — le même code qui tourne en séance et dans
 * « Mes dictées ». Une maquette dessinée à la main dériverait au premier
 * changement de rendu, et promettrait un écran qui n'existe plus. Les quatre
 * vitesses viennent de `VITESSES`, pour la même raison.
 */

/** Une vraie dictée, avec les fautes qu'un élève de 4e fait vraiment. */
const CORRECTION = [
  'La dictée',
  'Le vent soufflait fort ce matin-là. Les feuilles tombaient une à une sur le sol mouillé.',
  '',
  'Ta copie',
  'le vent soufflait fort ce matin la',
  'les feuilles tombait une à',
].join('\n');

export default function ExercicesLangue() {
  return (
    <section className="exercices">
      <header className="section__entete">
        <span className="etiquette etiquette--sombre">Ce qu’un chatbot ne fait pas</span>
        <h2>Il entraîne votre enfant à l’écrit comme à l’oral</h2>
        <p className="section__intro">
          En français comme en langues, votre enfant s’entraîne avec de vraies
          dictées et des exercices de compréhension orale adaptés à son niveau.
        </p>
      </header>

      <div className="exercices__grille">
        {/* ------------------------------------------------------ la dictée */}
        <article className="exercices__carte">
          <div className="exercices__tete">
            <span className="exercices__num">01</span>
            <h3>La dictée, corrigée erreur par erreur</h3>
          </div>

          <p className="exercices__texte">
            Le professeur dicte à voix haute, à son rythme, puis relit le texte
            en entier pour que votre enfant se relise. Chaque faute est ensuite
            surlignée des deux côtés, avec le même numéro : ce qu’il a écrit, et
            ce qu’il fallait écrire.
          </p>

          {/* Le vrai rendu du produit — voir l'en-tête du fichier. */}
          <div className="exercices__tableau" aria-hidden="true">
            <ContenuTableau contenu={CORRECTION} />
          </div>

          <p className="exercices__note">
            Chaque dictée est archivée : il la retrouve des mois plus tard, avec
            sa correction.
          </p>
        </article>

        {/* ------------------------------------------- la compréhension orale */}
        <article className="exercices__carte">
          <div className="exercices__tete">
            <span className="exercices__num">02</span>
            <h3>L’écoute, à la vitesse qu’il choisit</h3>
          </div>

          <p className="exercices__texte">
            Avant chaque exercice de compréhension orale, c’est l’enfant qui
            décide du débit. Celui qui n’a pas compris n’ose pas toujours
            demander qu’on ralentisse&nbsp;: ici, on le lui demande.
          </p>

          <div className="exercices__vitesses" aria-hidden="true">
            <span className="exercices__question">À quelle vitesse veux-tu que je lise&nbsp;?</span>

            <div className="exercices__boutons">
              {VITESSES.map((vitesse) => (
                <span
                  key={vitesse.cle}
                  /* LA VITESSE MISE EN AVANT EST CELLE PAR DÉFAUT — Camara, le
                     16/09/2026 : « c'est normal, pas lent ». Elle n'est plus
                     écrite ici : la démonstration lit `VITESSE_PAR_DEFAUT`,
                     comme la séance, et suivra si ce choix change. */
                  className={`exercices__vitesse${vitesse.cle === VITESSE_PAR_DEFAUT ? ' est-choisie' : ''}`}
                >
                  <img className="exercices__icone" src={vitesse.image} alt="" />
                  <strong>{vitesse.libelle}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* LA VOIX SE JUGE EN L'ÉCOUTANT, PAS EN LA DÉCRIVANT — voulu par
              Camara le 12/09/2026. « Lu par un locuteur natif » est une
              promesse comme une autre tant qu'on ne l'a pas entendue.

              `preload="none"` : deux cents kilo-octets ne se téléchargent pas
              chez tous les visiteurs pour le seul cas où l'on clique. */}
          <figure className="exercices__audio">
            {/* PAS D'EMOJI DRAPEAU — relevé par Camara le 12/09/2026 : le
                🇬🇧 s'affichait « GB » sur sa machine. Windows ne dessine pas
                les drapeaux, composés de deux lettres régionales : sa police
                retombe sur ces lettres. Le piège est qu'un Mac, lui, affiche
                bien le drapeau — le défaut reste donc invisible pour qui ne
                teste pas sous Windows. Le casque, lui, existe partout, et
                c'est déjà celui de la fiche archivée. */}
            <figcaption>
              <span className="exercices__casque" aria-hidden="true">🎧</span>
              Voici un extrait d’une compréhension orale en anglais
            </figcaption>

            <LecteurAudio
              src={extraitAnglais}
              libelle="l’extrait de compréhension orale en anglais"
            />
          </figure>

          {/* SEULEMENT LES LANGUES ENSEIGNÉES — Camara, le 15/09/2026 : l'allemand,
              l'italien et le chinois ne sont pas encore dans l'application.
              Les annoncer ici promettait un cours qu'aucun parent ne trouverait.

              LE FRANÇAIS MANQUAIT — Camara, le 18/09/2026 : « j'ai oublié de te
              dire de mettre le français ». Il a bien sa compréhension orale :
              « comprendre et s'exprimer à l'oral » est au programme du CP à la
              troisième, et le professeur a sa balise [FR] comme les autres.

              MAIS LA PHRASE NE POUVAIT PAS SEULEMENT S'ALLONGER. « Lu par un
              locuteur natif, jamais avec l'accent français » n'a aucun sens
              pour le français lui-même : la promesse ne vaut que pour les
              langues étrangères. Deux phrases, donc — l'une qui dit où l'écoute
              existe, l'autre ce qu'elle garantit en anglais et en espagnol. */}
          <p className="exercices__note">
            Français, anglais, espagnol&nbsp;: l’écoute existe dans les trois.
            En anglais et en espagnol, le passage est lu par un locuteur natif,
            jamais avec l’accent français.
          </p>
        </article>
      </div>
    </section>
  );
}
