import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/marchande.webp';
import {
  bilan, MANCHES, MONNAIE, PHRASES, serie, somme, verdict,
} from '../../lib/jeux/marchande';
import { commun, repliquesMarchande } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import Caisse from './Caisse';
import PrixAVirgule from './PrixAVirgule';
import { Monnaie, Produit } from './Etal';

/**
 * LA MARCHANDE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `marchande.js`, y compris pourquoi les prix ne se
 * tirent pas au hasard.
 *
 * L'ENFANT POSE DES PIÈCES SUR LE COMPTOIR jusqu'à la somme exacte. Il peut
 * reprendre une pièce d'un clic : au CP, se reprendre fait partie du calcul,
 * et interdire le retour en arrière transformerait une erreur de comptage en
 * échec définitif.
 *
 * PAS DE BOUTON « PAYER ». La somme juste EST la réponse — dès qu'elle est
 * atteinte, la marchande remercie. Une étape de confirmation n'apprendrait
 * rien à un enfant de six ans, et lui ferait croire qu'il peut payer faux.
 *
 * AUCUNE LECTURE OBLIGATOIRE : les produits sont dessinés, leur prix est
 * écrit en chiffres sur l'ardoise, et la monnaie porte sa valeur. La phrase de
 * la marchande est là pour l'adulte, et pour la voix quand elle sera branchée.
 */
/**
 * LA CLASSE CHOISIT LE JEU : au CP, on paie ; au CE1, on tient la caisse et
 * on rend la monnaie — voir `Caisse.js` ; au CE2, on lit un prix à virgule
 * — voir `PrixAVirgule.js`.
 */
export default function Marchande({ niveau, ...props }) {
  if (niveau === 'CE1') return <Caisse {...props} />;
  if (niveau === 'CE2') return <PrixAVirgule {...props} />;
  return <MarchandeCP {...props} />;
}

function MarchandeCP({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [posees, setPosees] = useState([]);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const paye = somme(posees);
  const sens = verdict(posees, courante.total);
  const juste = sens === 'juste';

  // LA VOIX DE LA PROFESSEURE : la commande à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesMarchande.consigne(courante.achats);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  // LA RÉPONSE SE DIT AU MOMENT OÙ ELLE CHANGE : la somme devient juste, ou
  // elle devient trop grosse. Tant qu'on reste « trop », on ne le répète
  // pas à chaque pièce posée en plus.
  useEffect(() => {
    if (sens === 'juste') dire(commun.bravo(manche));
    else if (sens === 'trop') dire(repliquesMarchande.trop);
  }, [sens, manche, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const poser = useCallback((valeur) => {
    if (juste) return;

    setPosees((actuelles) => {
      const suivantes = [...actuelles, valeur];
      if (somme(suivantes) !== courante.total) setPropre(false);
      return suivantes;
    });
  }, [courante.total, juste]);

  const reprendre = useCallback((index) => {
    if (juste) return;
    setPosees((actuelles) => actuelles.filter((_, i) => i !== index));
  }, [juste]);

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setPosees([]);
    setPropre(true);
  }, [manche, propre]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPosees([]);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
  }, []);

  if (fini) {
    return (
      <div className="jeu jeu--fini">
        <p className="jeu__bilan-score">
          {duPremierCoup} <span>sur {MANCHES}</span>
        </p>
        <p className="jeu__bilan-mot">{bilan(duPremierCoup)}</p>

        <div className="jeu__actions">
          <button type="button" className="btn btn--principal" onClick={rejouer}>
            Rejouer
          </button>
          <button type="button" className="btn-ghost" onClick={onQuitter}>
            Revenir aux jeux
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jeu jeu--marche" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.total}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* LA COMMANDE, POSÉE SUR LE COMPTOIR. Chaque produit porte son prix :
          c'est l'ardoise du stand, et c'est là que l'enfant lit ce qu'il doit
          additionner. Le TOTAL n'est pas écrit — le calculer est le jeu. */}
      <ul className="etal" aria-label="Ce que tu dois payer">
        {courante.achats.map((p, i) => (
          <li key={`${p.cle}-${i}`} className="etal__article">
            <Produit cle={p.cle} />
            <span className="etal__prix">{p.prix} €</span>
          </li>
        ))}
      </ul>

      {/* LE COMPTOIR : ce que l'enfant a posé. Un clic sur une pièce la
          reprend — se reprendre fait partie du calcul. */}
      <div className="comptoir" role="group" aria-label={`Tu as posé ${paye} euros`}>
        {posees.length === 0 ? (
          <p className="comptoir__vide">Pose ton argent ici</p>
        ) : (
          posees.map((valeur, i) => (
            <button
              key={`${valeur}-${i}`}
              type="button"
              className="comptoir__piece"
              onClick={() => reprendre(i)}
              disabled={juste}
              aria-label={`Reprendre ${valeur} euro${valeur > 1 ? 's' : ''}`}
            >
              <Monnaie valeur={valeur} genre={valeur === 5 ? 'billet' : 'piece'} />
            </button>
          ))
        )}
      </div>

      {sens === 'trop' && !juste && (
        <p className="jeu__trop" role="status">{PHRASES.trop}</p>
      )}

      {juste ? (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">
            {courante.achats.map((p) => p.prix).join(' + ')} = {courante.total} €
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      ) : (
        <div className="bourse" role="group" aria-label="Ton porte-monnaie">
          {MONNAIE.map(({ valeur, genre }) => (
            <button
              key={valeur}
              type="button"
              className="bourse__piece"
              onClick={() => poser(valeur)}
              aria-label={`Poser ${valeur} euro${valeur > 1 ? 's' : ''}`}
            >
              <Monnaie valeur={valeur} genre={genre} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
