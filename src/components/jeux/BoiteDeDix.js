import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/boite_de_10.webp';
import {
  alveoles, bilan, gagnee, MANCHES, PHRASES, serie, verdict,
} from '../../lib/jeux/boiteDeDix';
import { commun, repliquesBoite } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import { BoiteAOeufs, PanierDOeufs } from './Oeufs';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * LA BOÎTE DE 10, À L'ÉCRAN.
 *
 * Toute la règle vit dans `boiteDeDix.js`, y compris l'histoire de sa
 * première version — celle où il était impossible de se tromper.
 *
 * L'ENFANT CHOISIT UN PANIER, il ne bouche pas des trous. Il voit la boîte à
 * œufs entamée, quatre paniers en dessous, et il doit désigner celui qui la
 * complète exactement. Il s'engage avant de voir le résultat : c'est ce qui
 * fait la différence entre remplir et compléter.
 *
 * LE DÉCOR EST UNE IMAGE, LE JEU EST DESSINÉ — Camara, le 21/09/2026, décor
 * de ferme généré à l'appui. Une image de boîte à œufs ne se remplirait pas :
 * la scène est en fond, la boîte et les paniers sont en vectoriel par-dessus.
 *
 * AUCUNE LECTURE OBLIGATOIRE — la contrainte du CP, et elle a décidé du
 * reste. Une boîte entamée et des barres de longueurs différentes : le geste
 * est évident sans un mot. La phrase affichée est là pour l'adulte qui
 * regarde par-dessus l'épaule.
 *
 * ON CLIQUE, ON NE GLISSE PAS. Le glisser-déposer échoue sur un trackpad, sur
 * un écran tactile mal calibré, et il est inaccessible au clavier.
 */
export default function BoiteDeDix({ onQuitter, matiereCode }) {
  // La graine ne change qu'au démarrage d'une partie : sans ça, le moindre
  // rendu retirerait la série sous les pieds de l'enfant.
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [essai, setEssai] = useState(null);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const juste = essai !== null && gagnee(courante.depart, essai);

  // LA VOIX DE LA PROFESSEURE : la consigne à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesBoite.consigne(courante.masquee);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const choisir = useCallback((valeur) => {
    if (juste) return;

    setEssai(valeur);
    if (!gagnee(courante.depart, valeur)) setPropre(false);

    const s = verdict(courante.depart, valeur);
    if (s === 'juste') dire(commun.bravo(manche));
    else dire(s === 'trop' ? repliquesBoite.trop : repliquesBoite.manque);
  }, [courante.depart, juste, manche, dire]);

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setEssai(null);
    setPropre(true);
  }, [manche, propre]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setEssai(null);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
  }, []);

  if (fini) {
    return (
      <FinDePartie
        score={duPremierCoup}
        total={MANCHES}
        mot={bilan(duPremierCoup)}
        onRejouer={rejouer}
        onQuitter={onQuitter}
      />
    );
  }

  // UN ESSAI FAUX SE MONTRE DANS LA BOÎTE, il ne se contente pas d'un
  // message : l'enfant doit VOIR qu'il en reste, ou que ça déborde. C'est le
  // dessin qui corrige, pas la phrase.
  const poses = essai ?? 0;
  const sens = essai === null ? null : verdict(courante.depart, essai);
  const cases = alveoles(courante.depart, Math.min(poses, 10 - courante.depart), courante.masquee && !juste);
  const enTrop = Math.max(0, courante.depart + poses - 10);


  return (
    <div className="jeu jeu--ferme" style={{ backgroundImage: `url(${decor})` }}>
      {/* LA PROGRESSION EN POINTS, PAS EN CHIFFRES : « manche 3 sur 8 » demande
          de lire et de comparer deux nombres — exactement ce qu'on est en
          train d'apprendre, et donc la dernière chose à mettre dans un décor. */}
      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.depart}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      <BoiteAOeufs cases={cases} />

      {/* LES ŒUFS QUI NE TIENNENT PAS, posés à côté de la boîte : c'est le
          dessin de « il y en a trop », et il se comprend sans savoir lire. */}
      {enTrop > 0 && (
        <div className="oeufs-debord" aria-hidden="true">
          {Array.from({ length: enTrop }, (_, i) => (
            <span key={i} className="oeufs-debord__oeuf" />
          ))}
        </div>
      )}

      {!juste && (
        <div className="jeu__paniers" role="group" aria-label="Choisis un panier d’œufs">
          {courante.choix.map((valeur) => (
            <button
              key={valeur}
              type="button"
              className={`panier-choix${essai === valeur ? ' est-refusee' : ''}`}
              onClick={() => choisir(valeur)}
              aria-label={`Panier de ${valeur} œuf${valeur > 1 ? 's' : ''}`}
            >
              <PanierDOeufs nombre={valeur} />
              <span className="panier-choix__nombre">{valeur}</span>
            </button>
          ))}
        </div>
      )}

      {/* ON NOMME LE SENS DE L'ERREUR : « trop » et « pas assez » sont deux
          informations différentes, et ce sont elles qui permettent de corriger
          au coup suivant. « Raté » n'apprendrait rien. */}
      {sens === 'trop' && (
        <p className="jeu__trop" role="status">{PHRASES.trop}</p>
      )}
      {sens === 'pas-assez' && (
        <p className="jeu__trop" role="status">{PHRASES.manque}</p>
      )}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">
            {courante.depart} + {courante.manque} = 10
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>
    </div>
  );
}
