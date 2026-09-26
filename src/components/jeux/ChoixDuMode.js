import { useEffect } from 'react';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { recordDe } from '../../lib/jeux/record';
import { DEFI, TRANQUILLE, coeursDeLaClasse } from '../../lib/jeux/coeurs';
import imageTranquille from '../../assets/tranquille.webp';
import imageDefi from '../../assets/defi.webp';
import Etincelle from './Etincelle';

/**
 * « COMMENT VEUX-TU JOUER ? » — l'écran qui précède le jeu.
 *
 * Camara, le 25/09/2026, voulait des cœurs. Ils sont là, mais l'enfant les
 * demande : punir l'erreur dans un outil d'apprentissage écarte précisément
 * celui qui avait le plus besoin de l'exercice.
 *
 * IL NE S'AFFICHE PAS QUAND IL N'Y A RIEN À CHOISIR
 * -------------------------------------------------
 * Au CP, le défi n'existe pas — l'erreur y est le matériau du cours, pas un
 * accident. L'écran se choisit alors « tranquille » tout seul et disparaît :
 * un écran à une seule porte n'est pas un choix, c'est un obstacle de plus
 * entre un enfant de six ans et son jeu.
 *
 * LES DEUX ILLUSTRATIONS FONT TOUT LE TRAVAIL, et il n'y a plus un mot.
 * Camara a redessiné ses cartes le 26/09 avec leur titre dedans, puis :
 * « enlève les textes, ils sont inutiles maintenant ». Il avait raison — un
 * enfant lit la différence entre la sieste sur le pouf et la manette serrée
 * avant d'avoir fini « on prend son temps », et répéter en dessous ce que le
 * dessin dit déjà ne fait qu'encombrer.
 *
 * PLUS RIEN SOUS LES CARTES NON PLUS — Camara, le 26/09 : « enlève le nounours
 * sous Tranquille et les cœurs sous Défi ». L'écran est donc deux dessins, et
 * c'est tout ce que l'enfant voit.
 *
 * UNE SEULE CHOSE SURVIT, ET ELLE NE SE VOIT PAS : l'étiquette de lecture
 * d'écran de chaque bouton. Sans elle, l'écran deviendrait « bouton, bouton »
 * pour un enfant qui n'y voit pas, et le nombre de cœurs du défi — qui dépend
 * de sa classe — disparaîtrait avec le reste. C'est le seul endroit qui le
 * dise encore.
 *
 * LES DEUX PORTES ONT LE MÊME POIDS. « Tranquille » n'est pas le choix des
 * petits et « Défi » celui des grands : ce sont deux façons de travailler, et
 * la mise en page ne doit pas en désigner une comme la bonne. Le défi brille
 * davantage — c'est sa nature — mais il n'est ni plus grand, ni premier.
 */
export default function ChoixDuMode({
  classe, jeuCle, niveau, onChoisir, onQuitter,
}) {
  const coeurs = coeursDeLaClasse(classe);
  const { eleveId } = sessionEleve() ?? {};
  const record = eleveId && jeuCle ? recordDe(eleveId, jeuCle, niveau ?? '') : null;

  // PAS DE CHOIX, PAS D'ÉCRAN. L'effet plutôt qu'un rendu conditionnel dans la
  // page : la décision appartient à ce fichier, qui est le seul à savoir que
  // le CP n'a pas de défi.
  useEffect(() => {
    if (!coeurs) onChoisir(TRANQUILLE);
  }, [coeurs, onChoisir]);

  if (!coeurs) return null;

  return (
    <div className="jeu jeu--choix">
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      {/* L'EN-TÊTE SUIT LA MAQUETTE DE CAMARA, le 26/09 : une manette en
          trait lumineux, une pastille « Choisis ton mode de jeu », puis la
          question en grand, droite, entre deux étincelles.

          LE TITRE N'EST PLUS COURBÉ. Sur le `textPath`, un texte plus long
          que son chemin est coupé net aux deux bouts — le site affichait
          « HOISIS TON MODE DE JE ». Droit, il ne peut plus rien perdre.

          LE NOM DU JEU N'EST PLUS AFFICHÉ ICI : l'enfant vient de le choisir,
          et la maquette ne le montre pas. */}
      <svg
        className="choix-mode__manette"
        viewBox="0 0 64 40"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M18 5h28c8 0 13 6 15 15l2 9c1 6-5 9-9 5l-6-6H16l-6 6c-4 4-10 1-9-5l2-9C5 11 10 5 18 5z" />
        <path d="M17 14v10M12 19h10" />
        <circle cx="44" cy="15.5" r="2.2" />
        <circle cx="50" cy="21.5" r="2.2" />
      </svg>

      <p className="choix-mode__pastille">
        <Etincelle />
        <span>Choisis ton mode de jeu</span>
        <Etincelle />
      </p>

      <h2 className="choix-mode__titre">
        <Etincelle grande />
        {/* DEUX COUCHES DU MÊME TEXTE : dessous le double cerne (ombres),
            dessus le dégradé blanc → bleu pâle. Une seule couche ne peut pas
            porter les deux — l'ombre recouvrirait le dégradé. */}
        <span className="choix-mode__question">
          <span className="choix-mode__question-cerne" aria-hidden="true">
            Comment veux-tu jouer&nbsp;?
          </span>
          <span className="choix-mode__question-texte">Comment veux-tu jouer&nbsp;?</span>
        </span>
        <Etincelle grande />
      </h2>

      <ul className="choix-mode__portes">
        <li>
          <button
            type="button"
            className="choix-mode__porte"
            onClick={() => onChoisir(TRANQUILLE)}
            // SANS TEXTE, UN BOUTON N'A PLUS DE NOM. Les illustrations portent
            // maintenant leur titre en dessin ; un lecteur d'écran, lui, n'y
            // voit rien. L'étiquette rend ce que l'image dit à l'œil — sinon
            // l'écran devient « bouton, bouton », et le choix, impossible.
            aria-label="Jouer tranquillement : on prend son temps, sans cœurs à perdre"
          >
            {/* DÉCORATIVE, ET ANNONCÉE COMME TELLE : le nom du mode est juste
                en dessous, en texte. Un lecteur d'écran qui décrirait le
                dessin dirait deux fois la même chose, moins bien. */}
            <img
              className="choix-mode__image"
              src={imageTranquille}
              alt=""
              aria-hidden="true"
              width="620"
              height="857"
            />

          </button>
        </li>

        <li>
          <button
            type="button"
            className="choix-mode__porte choix-mode__porte--defi"
            onClick={() => onChoisir(DEFI)}
            aria-label={`Jouer en mode défi : ${coeurs} cœurs, chaque erreur en coûte un`}
          >
            <img
              className="choix-mode__image"
              src={imageDefi}
              alt=""
              aria-hidden="true"
              width="620"
              height="870"
            />

          </button>
        </li>
      </ul>

      {record && (
        <p className="choix-mode__record">
          Ton meilleur à ce jeu&nbsp;:{' '}
          <strong>
            {record.score}
            {record.total ? ` sur ${record.total}` : ''}
          </strong>.
        </p>
      )}
    </div>
  );
}
