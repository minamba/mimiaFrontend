import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/Jeux/CP/chantier.webp';
import {
  aide, bilan, erreur, ESSAIS_AVANT_AIDE, MANCHES, message, modele, PLURIELS, serie, verdict,
} from '../../lib/jeux/chantierDesFormes';
import { commun, repliquesChantier } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';

/**
 * LE CHANTIER DES FORMES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `chantierDesFormes.js`, y compris pourquoi un carré
 * sur la pointe est une pièce à trouver et pourquoi un carré n'est jamais
 * posé quand on demande les rectangles.
 *
 * LA CONSIGNE EST DITE, ET N'A PLUS DE DESSIN — Camara, le 21/09/2026. Le
 * dessin de la forme demandée donnait la réponse : l'enfant comparait deux
 * images sans avoir à savoir ce que veut dire « rectangle ». C'est maintenant
 * Nora qui le dit, et c'est le mot qu'il faut relier à la forme.
 *
 * L'ENFANT CHOISIT, PUIS ANNONCE — la leçon des paquets de dix. Rien ne se
 * juge avant « C'est prêt ! » : sans ça, il suffirait de cliquer les pièces
 * une à une jusqu'à ce que le jeu s'allume.
 *
 * LES PIÈCES N'ONT PAS DE NOM POUR LES LECTEURS D'ÉCRAN, seulement un
 * numéro. Les nommer « triangle renversé » donnerait la réponse : le jeu est
 * par nature visuel, c'est la forme qu'on apprend à reconnaître.
 *
 * TOUTES LES PIÈCES SONT DES CONTOURS, AUCUNE N'EST PLEINE. Une forme ouverte
 * ne peut pas être remplie — SVG la refermerait pour la peindre. Si les
 * pièces fermées étaient pleines et les ouvertes en trait seul, l'enfant
 * reconnaîtrait les faux amis à leur allure, sans regarder s'ils sont fermés.
 *
 * ON CLIQUE, ON NE GLISSE PAS — même raison que les quatre autres jeux.
 *
 * LE DÉCOR EST UNE IMAGE, LES PIÈCES SONT DESSINÉES — la règle des quatre
 * autres jeux. L'affiche et les planches du chantier montrent les quatre
 * formes, mais SANS LEUR NOM : elles ne donnent donc pas la réponse, puisque
 * c'est le mot entendu qu'il faut relier à la forme.
 */
export default function ChantierDesFormes({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [choisies, setChoisies] = useState([]);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;

  const courante = manches[manche];
  const juste = resultat?.sens === 'juste';
  const laConsigne = repliquesChantier.consigne(courante.famille);

  // L'AIDE, au bout de trois annonces fausses : les bonnes pièces sont
  // montrées, et on peut passer à la suite. Voir la note du module.
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  // LA CONSIGNE SE DIT À CHAQUE MANCHE, dès qu'elle s'affiche.
  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  // LA NOTE, DITE PAR LA PROFESSEURE, quand la partie se termine.
  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const basculer = useCallback((id) => {
    if (termine) return;
    setResultat(null);
    setChoisies((actuelles) => (actuelles.includes(id)
      ? actuelles.filter((x) => x !== id)
      : [...actuelles, id]));
  }, [termine]);

  const annoncer = useCallback(() => {
    const r = verdict(choisies, courante.pieces);

    if (r.sens === 'juste') {
      dire(commun.bravo(manche));
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      dire(suivantes >= ESSAIS_AVANT_AIDE
        ? repliquesChantier.aide(courante.famille)
        : erreur(r, courante.famille, courante.pieces));
    }

    setResultat(r);
  }, [choisies, courante, manche, ratees, dire]);

  const suivante = useCallback(() => {
    if (propre && juste) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setChoisies([]);
    setResultat(null);
    setRatees(0);
    setPropre(true);
  }, [manche, propre, juste]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setChoisies([]);
    setResultat(null);
    setRatees(0);
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

  const phrase = resultat && !juste && !montrer
    ? message(resultat, courante.famille, courante.pieces)
    : null;

  return (
    <div className="jeu jeu--chantier" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.famille}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      <ul className="chantier__tas" aria-label="Le tas de pièces">
        {courante.pieces.map((piece, i) => {
          const choisie = choisies.includes(piece.id);
          const fautive = resultat?.erreurs.includes(piece.id);
          const montree = montrer && piece.cible;

          return (
            <li key={piece.id}>
              <button
                type="button"
                className={`chantier__piece${choisie ? ' est-choisie' : ''}${fautive ? ' est-fautive' : ''}${montree ? ' est-montree' : ''}`}
                onClick={() => basculer(piece.id)}
                disabled={termine}
                aria-pressed={choisie}
                aria-label={`Pièce ${i + 1}`}
              >
                <Piece piece={piece} />
              </button>
            </li>
          );
        })}
      </ul>

      {phrase && <p className="jeu__trop" role="status">{phrase}</p>}

      {montrer && (
        <div className="jeu__gagne" role="status">
          <p className="chantier__aide">{aide(courante.famille)}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">
            {choisies.length} {PLURIELS[courante.famille]}&nbsp;!
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {/* L'ANNONCE N'APPARAÎT QU'UNE FOIS UNE PIÈCE CHOISIE : annoncer un tas
          vide ne serait pas une réponse, et un clic égaré coûterait la manche
          au tableau final. */}
      {!termine && choisies.length > 0 && (
        <button type="button" className="btn btn--principal" onClick={annoncer}>
          C’est prêt&nbsp;!
        </button>
      )}

    </div>
  );
}

/** Une pièce du tas, dans sa couleur, sa taille et son orientation. */
function Piece({ piece }) {
  const m = modele(piece.modele);
  const rotation = m.rotation ?? 0;

  return (
    <svg className="forme" viewBox="0 0 100 100" aria-hidden="true">
      <g
        transform={`rotate(${rotation} 50 50) translate(50 50) scale(${piece.taille}) translate(-50 -50)`}
        style={{ stroke: piece.couleur }}
        // Le trait ne doit pas maigrir avec la pièce : une petite forme au
        // trait fin paraîtrait plus légère, et la taille parlerait encore.
        strokeWidth={7 / piece.taille}
      >
        <Trace modele={m} />
      </g>
    </svg>
  );
}

/** Le tracé d'un modèle, en contour seul. */
function Trace({ modele: m }) {
  const { trace } = m;

  switch (trace.type) {
    case 'polygone':
      return <polygon className="forme__trait" points={trace.points} />;
    case 'ligne':
      return <polyline className="forme__trait" points={trace.points} />;
    case 'cercle':
      return <circle className="forme__trait" cx="50" cy="50" r={trace.r} />;
    case 'ellipse':
      return <ellipse className="forme__trait" cx="50" cy="50" rx={trace.rx} ry={trace.ry} />;
    default:
      return <path className="forme__trait" d={trace.d} />;
  }
}
