import {
  Fragment, useCallback, useEffect, useMemo, useState,
} from 'react';
import { commun, PROFESSEUR_PAR_MATIERE } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';
import { bruitage } from '../../lib/jeux/bruitages';
import Avatar from '../Avatar';

/**
 * L'ÉCRAN COMMUN DES JEUX « UNE QUESTION, DES CHOIX » — a ou à, les types de
 * phrases, la roue des verbes, contraires et jumeaux. Camara, le 21/09/2026 :
 * « code vraiment tout ». Quatre jeux qui ne diffèrent que par leur contenu
 * partagent donc un seul écran ; chacun lui confie sa RÈGLE (le module pur)
 * et la façon de montrer sa question.
 *
 * LA RÈGLE FOURNIT :
 *   serie(graine), MANCHES, bilan(n), consigne(m), choix(m) → [{ cle, libelle }],
 *   verdict(m, cle) → 'juste' ou le nom de l'erreur, erreur(m, sens) et
 *   aide(m) → des répliques { cle, texte }.
 *
 * LES RÈGLES DE TOUS LES JEUX VALENT ICI : un choix touché est une réponse ;
 * l'erreur se nomme et donne une méthode, jamais « raté » ; le choix faux
 * reste barré ; au bout de deux erreurs, on montre la réponse et on continue.
 *
 * LA SALLE À FOUILLER (escape games, 09/10/2026) — Camara : « dans un escape
 * game, on se déplace dans des pièces, on sélectionne des choses ». Avec
 * `salle`, l'écran ne pose plus ses questions à la suite : il dessine la
 * salle (`salle(...)`), et l'énigme de la manche ne s'ouvre qu'au clic sur
 * son objet. La consigne n'est dite qu'à ce moment-là. Après le dernier
 * cadenas, l'écran de fin attend que l'enfant franchisse la porte (`sortir`).
 * Tout le reste — verdict, voix, cœurs, aide — est le même code.
 */
export const ESSAIS_AVANT_AIDE = 2;

/**
 * LA GERBE D'ÉTINCELLES DE LA BONNE RÉPONSE — Camara, le 09/10/2026 : « rendre
 * les jeux plus vivants et animés ». Douze éclats partent en étoile et
 * s'éteignent ; le dessin est tout entier dans le CSS (`.gerbe`).
 */
function Gerbe() {
  return (
    <span className="gerbe" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className="gerbe__eclat" style={{ '--angle': `${i * 30}deg`, '--delai': `${(i % 3) * 40}ms` }} />
      ))}
    </span>
  );
}

/**
 * DES OBJETS À ATTRAPER, PAS DES ÉTIQUETTES — Camara, le 09/10/2026 : « là on
 * n'a que du texte ; ça aurait été sympa de faire des choses originales qui
 * attirent les enfants à rejouer ». Chaque matière donne sa forme aux
 * réponses : des gemmes taillées en maths, des bulles en français, des fioles
 * en sciences, des feuilles en SVT, des médailles en histoire, des ballons en
 * langues, des blocs de pixels en informatique. Le dessin est tout entier dans
 * le CSS (`.objet--…`) ; une règle peut imposer le sien (`regle.objets`).
 */
const OBJETS = {
  MATHS: 'gemme',
  FRANCAIS: 'bulle',
  SCIENCES: 'fiole',
  PHYSIQUE_CHIMIE: 'fiole',
  SVT: 'feuille',
  HISTOIRE_GEO: 'medaille',
  ANGLAIS: 'ballon',
  ESPAGNOL: 'ballon',
  ALLEMAND: 'ballon',
  ITALIEN: 'ballon',
  NSI: 'pixel',
};

/**
 * VRAI OU FAUX, OUI OU NON : DEUX BUZZERS — Camara, le 09/10/2026 (capture du
 * jeu des réciproques) : « y'a pas moyen de rendre ça plus amusant ? ». Deux
 * choix, l'un qui dit oui, l'autre non : un dôme vert ✔ à gauche, un dôme
 * rouge ✘ à droite, comme un jeu télévisé — toujours dans cet ordre, d'une
 * question à l'autre. La réponse trouvée tombe ensuite en tampon.
 */
const DIT_OUI = /^(vraie?s?|oui|juste)\b/i;
const DIT_NON = /^(fausses?|faux|non)\b/i;
const sensDe = ({ libelle }) => {
  if (typeof libelle !== 'string') return null;
  const t = libelle.trim();
  if (DIT_OUI.test(t)) return 'oui';
  if (DIT_NON.test(t)) return 'non';
  return null;
};
export function enDuel(choix) {
  if (choix.length !== 2) return null;
  const sens = choix.map(sensDe);
  if (!sens.includes('oui') || !sens.includes('non')) return null;
  return sens[0] === 'oui' ? choix : [choix[1], choix[0]];
}

/**
 * LA CAGNOTTE ET LE COMBO (09/10/2026). Une bonne réponse du premier coup
 * rapporte 10 points, multipliés par la série en cours (×2, puis ×3 au plus) ;
 * trouvée au deuxième essai, 5 points, et la série repart de zéro. Le compteur
 * bondit et le gain s'envole au-dessus ; une série allume la flamme du combo.
 */
const POINTS = 10;
const COMBO_MAX = 3;
export function gainDe(premierCoup, serie) {
  return premierCoup ? POINTS * Math.min(Math.max(serie, 1), COMBO_MAX) : POINTS / 2;
}

function Cagnotte({ points, serie, gain }) {
  return (
    <div className="jeu__cagnotte">
      <span key={`p-${gain?.k ?? 0}`} className="cagnotte__compte">
        <span className="cagnotte__piece" aria-hidden="true" />
        <strong>{points}</strong>
        <span className="visuellement-cache"> points</span>
      </span>
      {gain && <span key={`g-${gain.k}`} className="cagnotte__gain" aria-hidden="true">{`+${gain.n}`}</span>}
      {serie >= 2 && (
        <span key={`c-${serie}`} className="cagnotte__combo">
          <span aria-hidden="true">🔥</span>
          {` Combo ×${Math.min(serie, COMBO_MAX)}`}
        </span>
      )}
    </div>
  );
}

/**
 * LE PROFESSEUR QUI RÉAGIT (09/10/2026) — en médaillon, il bondit sur une
 * bonne réponse et encourage sur une mauvaise ; sa boucle de parole tourne
 * quand il parle. Les réactions filmées (Higgsfield) remplaceront les
 * mouvements CSS, humeur par humeur, une fois validées par Camara.
 */
const MOTS_DU_PROF = { bravo: 'Bravo !', encourage: 'Courage !' };
function ProfQuiReagit({ nom, humeur, parle }) {
  if (!nom) return null;
  return (
    <div className={`jeu__prof${humeur ? ` est-${humeur}` : ''}`} aria-hidden="true">
      <span key={humeur ?? 'calme'} className="jeu__prof-visage">
        <Avatar nom={nom} taille={84} parle={parle} />
      </span>
      {humeur && <span key={`m-${humeur}`} className="jeu__prof-bulle">{MOTS_DU_PROF[humeur]}</span>}
    </div>
  );
}

export default function JeuDeChoix({
  onQuitter, matiereCode, regle, classe, rendreQuestion, rendreApres, fond, salle,
}) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => regle.serie(graine), [regle, graine]);

  const [manche, setManche] = useState(0);
  const [fautes, setFautes] = useState([]);
  const [sens, setSens] = useState(null);
  const [trouve, setTrouve] = useState(false);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);
  // La salle : l'énigme de la manche est-elle ouverte, et la porte attend-elle ?
  const [enquete, setEnquete] = useState(false);
  const [sortie, setSortie] = useState(false);
  // La cagnotte, la série en cours, la meilleure série, le dernier gain, l'humeur du professeur.
  const [points, setPoints] = useState(0);
  const [serie, setSerie] = useState(0);
  const [meilleureSerie, setMeilleureSerie] = useState(0);
  const [gain, setGain] = useState(null);
  const [humeur, setHumeur] = useState(null);

  const courante = manches[manche];
  const montrer = !trouve && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = regle.consigne(courante);

  // Dans une salle, la consigne attend que l'enfant ouvre l'énigme.
  const consigneDue = !fini && !sortie && (!salle || enquete);
  // Dans la salle, la consigne est suivie du récit de l'objet fouillé.
  const leRecit = salle ? regle.recit?.(courante) ?? null : null;
  useEffect(() => {
    if (consigneDue) dire(leRecit ? [laConsigne, leRecit] : laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, leRecit?.cle, manche, graine, consigneDue, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup, regle.MANCHES));
  }, [fini, duPremierCoup, dire, regle.MANCHES]);

  // L'humeur du professeur retombe d'elle-même.
  useEffect(() => {
    if (!humeur) return undefined;
    const id = setTimeout(() => setHumeur(null), 2200);
    return () => clearTimeout(id);
  }, [humeur, manche, fautes.length]);

  const choisir = useCallback((cle) => {
    if (termine) return;
    const s = regle.verdict(courante, cle);
    if (s === 'juste') {
      setTrouve(true);
      setSens(null);
      if (fautes.length === 0) setDuPremierCoup((n) => n + 1);
      const premierCoup = fautes.length === 0;
      const nouvelleSerie = premierCoup ? serie + 1 : 0;
      const n = gainDe(premierCoup, nouvelleSerie);
      setPoints((p) => p + n);
      setGain({ n, k: Date.now() });
      setSerie(nouvelleSerie);
      setMeilleureSerie((m) => Math.max(m, nouvelleSerie));
      setHumeur('bravo');
      bruitage('bonne');
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = [...fautes, cle];
    setFautes(suivantes);
    setSens(s);
    setSerie(0);
    setHumeur('encourage');
    const aide = suivantes.length >= ESSAIS_AVANT_AIDE ? regle.aide(courante) : null;
    bruitage('mauvaise');
    dire(aide ?? regle.erreur(courante, s));
  }, [termine, regle, courante, fautes, manche, dire, serie]);

  const suivante = useCallback(() => {
    setEnquete(false);
    if (manche + 1 >= regle.MANCHES) {
      // Dans une salle, la partie finit à la porte, pas au dernier « Continuer ».
      if (salle) setSortie(true);
      else setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setSens(null);
    setTrouve(false);
  }, [manche, regle.MANCHES, salle]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setSens(null);
    setTrouve(false);
    setDuPremierCoup(0);
    setFini(false);
    setEnquete(false);
    setSortie(false);
    setPoints(0);
    setSerie(0);
    setMeilleureSerie(0);
    setGain(null);
    setHumeur(null);
  }, []);

  if (fini) {
    return (
      <FinDePartie
        score={duPremierCoup}
        total={regle.MANCHES}
        mot={regle.bilan(duPremierCoup)}
        points={salle ? undefined : points}
        meilleureSerie={meilleureSerie}
        onRejouer={rejouer}
        onQuitter={onQuitter}
      />
    );
  }

  const aide = montrer ? regle.aide(courante) : null;
  // Les réponses-objets : pas dans la salle d'un escape game, qui a son propre décor.
  const objet = salle ? null : (regle.objets ?? OBJETS[matiereCode] ?? 'gemme');
  const lesChoix = regle.choix(courante);
  const duel = objet ? enDuel(lesChoix) : null;
  const laBonne = duel && termine ? duel.find((c) => regle.verdict(courante, c.cle) === 'juste') : null;

  const pistes = (
    <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${regle.MANCHES}`}>
      {manches.map((m, i) => (
        <li
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`jeu__manche${i < manche || sortie ? ' est-faite' : ''}${i === manche && !sortie ? ' est-courante' : ''}`}
        />
      ))}
    </ol>
  );

  // LA CLÉ DE LA MANCHE remonte la question et les réponses à chaque manche :
  // c'est ce qui rejoue leur entrée (la question glisse, les réponses
  // apparaissent l'une après l'autre — voir `.jeu--scene` dans App.css).
  const question = (
    <Fragment key={`${graine}-${manche}`}>
      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* Le dessin sait aussi ce qui vient d'être choisi : le robot, par
          exemple, rejoue le programme touché (Camara, 22/09/2026). */}
      {rendreQuestion(courante, termine, { derniereFaute: fautes[fautes.length - 1] ?? null, trouve, montrer })}

      {/* UN JEU PEUT JOUER SES RÉPONSES À SA FAÇON (09/10/2026, `scenes/`) :
          glisser, attraper, tourner une roue… Chaque réponse reste un bouton
          qui porte son libellé et appelle `choisir(cle)`. */}
      {!termine && regle.rendreLesChoix && !salle && regle.rendreLesChoix({
        m: courante, choix: lesChoix, fautes, choisir, objet,
      })}

      {!termine && !(regle.rendreLesChoix && !salle) && (
        <ul className={`scene__choix${duel ? ' scene__choix--duel' : ''}`} aria-label="Choisis ta réponse">
          {(duel ?? lesChoix).map(({ cle, libelle }, i) => (
            <li key={cle} style={{ '--i': i }}>
              {duel ? (
                <button
                  type="button"
                  className={`buzzer buzzer--${i === 0 ? 'oui' : 'non'}${fautes.includes(cle) ? ' est-fausse' : ''}`}
                  onClick={() => choisir(cle)}
                  disabled={fautes.includes(cle)}
                >
                  <span className="buzzer__dome" aria-hidden="true">{i === 0 ? '✔' : '✘'}</span>
                  <span className="buzzer__plaque">{libelle}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`scene__carte${objet ? ` scene__carte--objet objet--${objet}` : ''}${fautes.includes(cle) ? ' est-fausse' : ''}`}
                  onClick={() => choisir(cle)}
                  disabled={fautes.includes(cle)}
                >
                  {objet && <span className="objet__eclat" aria-hidden="true" />}
                  {libelle}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {sens && !termine && <p className="jeu__trop" role="status">{regle.erreur(courante, sens).texte}</p>}

      {termine && (
        <div className="jeu__gagne" role="status">
          {trouve && <Gerbe />}
          {laBonne && (
            <p className={`tampon tampon--${sensDe(laBonne)}`}>
              <span aria-hidden="true">{sensDe(laBonne) === 'oui' ? '✔ ' : '✘ '}</span>
              {laBonne.libelle}
            </p>
          )}
          {aide && <p className="scene__bulle">{aide.texte}</p>}
          {rendreApres ? rendreApres(courante) : null}
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
    </Fragment>
  );

  if (salle) {
    return (
      <div className={`jeu jeu--scene jeu--salle ${classe}`}>
        <button type="button" className="jeu__quitter" onClick={onQuitter}>
          ← Revenir aux jeux
        </button>
        <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
        {pistes}
        {salle({
          courante,
          manche,
          termine,
          enquete,
          ouvrir: () => setEnquete(true),
          enigme: enquete ? question : null,
          sortie,
          sortir: () => setFini(true),
        })}
      </div>
    );
  }

  return (
    // LE FOND PEUT VENIR DU JEU (collège et lycée, 08/10/2026) : une image par
    // jeu et par classe, trop nombreuses pour une règle CSS chacune.
    <div className={`jeu jeu--scene ${classe}`} style={fond ? { backgroundImage: `url(${fond})` } : undefined}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <Cagnotte points={points} serie={serie} gain={gain} />
      {pistes}
      {question}
      <ProfQuiReagit nom={PROFESSEUR_PAR_MATIERE[matiereCode]} humeur={humeur} parle={voix.enCours !== null} />
    </div>
  );
}
