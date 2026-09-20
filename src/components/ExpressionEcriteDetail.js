import { lireSurlignes } from '../lib/storage/surlignesTableau';
import { TexteCompare } from './ComparaisonDictee';

/**
 * UN TEXTE ÉCRIT ET SA CORRECTION, côte à côte.
 *
 * C'EST LA PAIRE QUI APPREND, ET RIEN D'AUTRE. Le texte seul ne vaut rien à
 * relire, la correction seule encore moins : ce qui fait entrer une règle,
 * c'est de voir ce qu'on a écrit à côté de ce qu'il fallait écrire. Même leçon
 * que la copie d'évaluation que Camara a fait rendre à l'élève.
 *
 * LES RÉUSSITES D'ABORD, ET SÉPARÉES DU RESTE. La consigne impose au
 * professeur de commencer par là ; l'écran ne doit pas défaire ce qu'elle
 * construit en noyant « c'est juste » au milieu de quatre fautes.
 */

/** Les cinq genres, avec ce qu'on en montre. */
const GENRES = {
  reussi: { libelle: 'Réussi', emoji: '✅' },
  orthographe: { libelle: 'Orthographe', emoji: '🔤' },
  grammaire: { libelle: 'Grammaire', emoji: '🧩' },
  vocabulaire: { libelle: 'Vocabulaire', emoji: '📖' },
  construction: { libelle: 'Construction', emoji: '🧱' },
};

/**
 * Un genre inconnu s'affiche quand même, sous son propre nom.
 *
 * La base ne devrait en contenir que cinq — ils sont normalisés à l'écriture —
 * mais une ligne écrite avant cette normalisation, ou par une version future,
 * ne doit pas disparaître de l'écran sans un mot.
 */
const genreDe = (genre) => GENRES[genre] ?? { libelle: genre, emoji: '•' };

/**
 * LE TEXTE AVEC SES BADGES, COMME EN SÉANCE — Camara, le 19/09/2026 : « je
 * veux les badges dans l'archive aussi ». Le serveur garde la copie surlignée
 * du premier tableau de correction ; on la rend avec le même composant que le
 * tableau. Sans elle (archives d'avant, tableau et copie qui ne se recoupent
 * pas), le texte nu.
 */
function TexteArchive({ texte }) {
  const surlignes = lireSurlignes(texte?.texteSurligne);

  if (!surlignes) return <p className="ecrit__texte">{texte?.texte}</p>;

  return (
    <p className="ecrit__texte ecrit__texte--surligne">
      <TexteCompare segments={surlignes.segments} cote="copie" />
    </p>
  );
}

export default function ExpressionEcriteDetail({ texte, photo }) {
  const corrections = texte?.corrections ?? [];

  const reussites = corrections.filter((c) => c.genre === 'reussi');
  const reprises = corrections.filter((c) => c.genre !== 'reussi');

  // PAS ENCORE RECOPIÉ : sa page existe, mais en image seulement. L'écran ne
  // doit ni faire comme si elle n'existait pas, ni faire croire qu'elle est
  // corrigée.
  const aTranscrire = texte?.transcrit === false;

  return (
    <div className="ecrit">
      {texte?.consigne && (
        <p className="ecrit__consigne">
          <span className="ecrit__etiquette">Ce qu’il fallait faire</span>
          {texte.consigne}
        </p>
      )}

      {/* SA COPIE, AVEC SES FAUTES. On ne la nettoie jamais : c'est elle qui
          montrera, dans six mois, le chemin parcouru. Les retours à la ligne
          sont conservés — un texte reformaté n'est plus tout à fait le sien. */}
      <div className="ecrit__copie">
        <span className="ecrit__etiquette">Ce que tu as écrit</span>

        {aTranscrire ? (
          <>
            {/* LA PHOTO DE SA PAGE, en attendant que le professeur la recopie.
                Elle est la SEULE trace de son travail : la montrer est ce qui
                fait que l'écran ne ment pas en disant « rien à lire ». */}
            {photo ? (
              <img
                className="ecrit__photo"
                src={photo}
                alt="Ta page de cahier"
              />
            ) : (
              <p className="ecrit__texte ecrit__texte--absent">
                La photo de cette page n’est plus disponible.
              </p>
            )}

            <p className="ecrit__attente">
              Ton professeur n’a pas encore eu le temps de recopier ce texte. Il
              le reprendra avec toi au prochain cours.
            </p>
          </>
        ) : (
          <TexteArchive texte={texte} />
        )}
      </div>

      {reussites.length > 0 && (
        <section className="ecrit__bloc ecrit__bloc--reussi" aria-label="Ce qui est réussi">
          <h4 className="ecrit__bloc-titre">
            <span aria-hidden="true">✅</span> Ce qui est réussi
          </h4>

          <ul className="ecrit__reprises">
            {reussites.map((c, rang) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={`reussi-${rang}`} className="ecrit__reprise">
                {c.texte}
              </li>
            ))}
          </ul>
        </section>
      )}

      {reprises.length > 0 && (
        <section className="ecrit__bloc" aria-label="À retravailler">
          <h4 className="ecrit__bloc-titre">
            <span aria-hidden="true">✍️</span> À retravailler
          </h4>

          <ul className="ecrit__reprises">
            {reprises.map((c, rang) => {
              const genre = genreDe(c.genre);

              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={`reprise-${rang}`} className="ecrit__reprise">
                  {/* LE GENRE EST ÉCRIT, PAS SEULEMENT COLORÉ : c'est la grille
                      de l'examen, et c'est en la voyant revenir que l'enfant
                      repère ce qui coince chez lui. */}
                  <span className={`ecrit__genre ecrit__genre--${c.genre}`}>
                    <span aria-hidden="true">{genre.emoji}</span> {genre.libelle}
                  </span>

                  <span className="ecrit__reprise-texte">{c.texte}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* AUCUNE CORRECTION : le texte a été rattrapé par le filet, pas archivé
          par le professeur. On le dit plutôt que d'afficher une page à moitié
          vide sans explication.

          PAS QUAND IL RESTE À RECOPIER : le message d'attente juste au-dessus
          dit déjà la même chose, en mieux. Deux phrases pour un seul fait
          donneraient l'impression que deux choses ont échoué. */}
      {corrections.length === 0 && !aTranscrire && (
        <p className="ecrit__sans-correction">
          La correction de ce texte n’a pas été enregistrée. Tu peux le montrer à
          ton professeur : il le reprendra avec toi.
        </p>
      )}

      {texte?.remarque && (
        <p className="ecrit__remarque">
          <span className="ecrit__etiquette">Ce que retient ton professeur</span>
          {texte.remarque}
        </p>
      )}
    </div>
  );
}
