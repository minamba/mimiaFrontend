import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/paquet_10_bg.webp';
import {
  bilan, MANCHES, PHRASES, serie, verdict,
} from '../../lib/jeux/paquetsDeDix';
import { commun, repliquesPaquets } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * LES PAQUETS DE DIX, À L'ÉCRAN.
 *
 * Toute la règle vit dans `paquetsDeDix.js`, y compris pourquoi dix bûchettes
 * deviennent toujours un paquet.
 *
 * L'ENFANT ANNONCE QUAND IL A FINI, et c'est le cœur du jeu — Camara, le
 * 21/09/2026 : « comment je sais que j'ai bon ou pas bon ? ». La première
 * version se contentait d'allumer la victoire dès que le compte tombait
 * juste. Deux défauts, dont un grave :
 *
 *   - Tant qu'on était en dessous, RIEN ne se disait. L'enfant qui pensait
 *     avoir fini restait devant un écran muet, sans savoir s'il s'était
 *     trompé ou s'il lui manquait seulement une bûchette.
 *
 *   - Surtout, ON NE POUVAIT PAS SE TROMPER. En ajoutant une bûchette à la
 *     fois, on passait forcément par le bon nombre, et le jeu s'allumait tout
 *     seul. C'est exactement le reproche fait à la première boîte de 10.
 *
 * Avec l'annonce, l'enfant s'engage AVANT de voir le résultat : c'est ce qui
 * sépare « poser des bûchettes » de « préparer trente-trois bûchettes ». Et la
 * réponse nomme le sens de l'erreur, comme le train nomme « trop loin » et
 * « pas assez loin » — jamais un simple « raté ».
 *
 * DES BÛCHETTES, PARCE QUE LE DÉCOR EN EST PLEIN — même règle que les prix de
 * la marchande, qui viennent des ardoises de son stand. Le tableau de la
 * classe annonce « 1 dizaine = 10 » au-dessus d'un fagot lié de raphia, et il
 * y en a un autre posé sur le bureau. Un jeu qui poserait des jetons ronds
 * là-dessus contredirait son propre dessin. C'est aussi le matériel que
 * l'enfant a dans les mains en classe.
 *
 * DIX BÛCHETTES FONT EXACTEMENT LA LARGEUR D'UN PAQUET, au dessin près : le
 * fagot n'est pas un symbole de dix, c'est dix bûchettes qu'on peut compter.
 *
 * ON CLIQUE, ON NE GLISSE PAS — même raison que les trois autres jeux : le
 * glisser-déposer échoue sur un trackpad, sur un écran tactile mal calibré,
 * et il est inaccessible au clavier.
 *
 * CE QUI EST POSÉ EST LUI-MÊME LE BOUTON DE REPRISE : cliquer un paquet ou
 * une bûchette déjà là la retire, même geste que les pièces de la marchande.
 */
export default function PaquetsDeDix({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [paquets, setPaquets] = useState(0);
  const [unites, setUnites] = useState(0);

  // LA RÉPONSE ANNONCÉE, ou `null` tant que l'enfant construit encore. C'est
  // elle qui décide de tout ce qui s'affiche : rien ne se juge avant qu'il
  // ait dit qu'il avait fini.
  const [annonce, setAnnonce] = useState(null);

  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const cible = manches[manche];
  const juste = annonce === 'juste';
  const pose = paquets > 0 || unites > 0;

  // LA VOIX DE LA PROFESSEURE : la consigne à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesPaquets.consigne(cible);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const ajouterPaquet = useCallback(() => {
    if (juste) return;
    setAnnonce(null);
    setPaquets(paquets + 1);
  }, [juste, paquets]);

  const ajouterBuchette = useCallback(() => {
    if (juste) return;
    setAnnonce(null);

    // DIX BÛCHETTES DEVIENNENT UN PAQUET — voir la note du module.
    if (unites === 9) {
      setPaquets(paquets + 1);
      setUnites(0);
      return;
    }

    setUnites(unites + 1);
  }, [juste, paquets, unites]);

  const reprendrePaquet = useCallback(() => {
    if (juste || paquets === 0) return;
    setAnnonce(null);
    setPaquets(paquets - 1);
  }, [juste, paquets]);

  const reprendreBuchette = useCallback(() => {
    if (juste || unites === 0) return;
    setAnnonce(null);
    setUnites(unites - 1);
  }, [juste, unites]);

  /**
   * « C'EST PRÊT ! » — le seul moment où le jeu répond.
   *
   * Une annonce fausse coûte la manche au tableau final, jamais la manche
   * elle-même : on corrige et on réannonce autant de fois qu'il faut.
   */
  const annoncer = useCallback(() => {
    const sens = verdict(paquets, unites, cible);
    if (sens !== 'juste') setPropre(false);
    setAnnonce(sens);

    if (sens === 'juste') dire(commun.bravo(manche));
    else dire(sens === 'trop' ? repliquesPaquets.trop : repliquesPaquets.pasAssez);
  }, [paquets, unites, cible, manche, dire]);

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setPaquets(0);
    setUnites(0);
    setAnnonce(null);
    setPropre(true);
  }, [manche, propre]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPaquets(0);
    setUnites(0);
    setAnnonce(null);
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

  return (
    <div className="jeu jeu--paquets" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((c, i) => (
          <li
            key={`${c}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* LE BUREAU EN BOIS EST LA ZONE DE JEU, et le décor a été cadré pour
          ça : le tableau et la fenêtre en haut, le plateau vide en bas. */}
      <div
        className="paquets__zone"
        role="group"
        aria-label={
          pose
            ? `${paquets} paquet${paquets > 1 ? 's' : ''} de dix et ${unites} bûchette${unites > 1 ? 's' : ''}`
            : 'Rien de posé pour l’instant'
        }
      >
        {!pose && (
          <p className="paquets__vide">Pose tes paquets et tes bûchettes ici</p>
        )}

        {Array.from({ length: paquets }, (_, i) => (
          <button
            key={`paquet-${i}`}
            type="button"
            className="paquets__paquet"
            onClick={reprendrePaquet}
            disabled={juste}
            aria-label="Reprendre un paquet de dix"
          >
            <Paquet />
          </button>
        ))}

        {Array.from({ length: unites }, (_, i) => (
          <button
            key={`buchette-${i}`}
            type="button"
            className="paquets__buchette"
            onClick={reprendreBuchette}
            disabled={juste}
            aria-label="Reprendre une bûchette"
          >
            <Buchette />
          </button>
        ))}
      </div>

      {/* LE SENS DE L'ERREUR, JAMAIS « RATÉ » : c'est le mot qui dit quoi faire
          ensuite, et c'est la règle des quatre jeux. */}
      {annonce === 'trop' && (
        <p className="jeu__trop" role="status">{PHRASES.trop}</p>
      )}
      {annonce === 'pas-assez' && (
        <p className="jeu__trop" role="status">{PHRASES.pasAssez}</p>
      )}

      {juste ? (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">
            {paquets} paquet{paquets > 1 ? 's' : ''}
            {unites > 0 ? ` et ${unites} bûchette${unites > 1 ? 's' : ''}` : ''}
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      ) : (
        <div className="paquets__barre">
          <div className="paquets__actions" role="group" aria-label="Ajouter à ce qui est posé">
            <button type="button" className="paquets__ajouter" onClick={ajouterPaquet}>
              <Paquet />
              Un paquet de dix
            </button>
            <button type="button" className="paquets__ajouter" onClick={ajouterBuchette}>
              <Buchette />
              Une bûchette
            </button>
          </div>

          {/* L'ANNONCE N'APPARAÎT QU'UNE FOIS QUELQUE CHOSE POSÉ : annoncer un
              plateau vide ne serait pas une réponse, et un clic égaré coûterait
              la manche au tableau final. */}
          {pose && (
            <button type="button" className="btn btn--principal paquets__annoncer" onClick={annoncer}>
              C’est prêt&nbsp;!
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * UN PAQUET DE DIX : dix bûchettes liées par un lien de raphia.
 *
 * Les dix bûchettes sont VRAIMENT dessinées, pas suggérées : l'enfant qui
 * doute peut les compter. Un fagot opaque ne serait qu'un symbole de dix,
 * et il faudrait le croire sur parole.
 */
function Paquet() {
  return (
    <svg className="paquet" viewBox="0 0 62 48" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect className="buchette__corps" x={1.4 + i * 6} y="4" width="4.4" height="40" rx="2.2" />
          <rect className="buchette__reflet" x={2.4 + i * 6} y="8" width="1.4" height="11" rx="0.7" />
        </g>
      ))}

      <rect className="paquet__lien" x="0" y="17" width="62" height="10" rx="2" />
      <rect className="paquet__lien-ombre" x="0" y="24" width="62" height="3" />
    </svg>
  );
}

/** Une bûchette seule, pas encore liée dans un paquet. */
function Buchette() {
  return (
    <svg className="buchette" viewBox="0 0 14 48" aria-hidden="true">
      <rect className="buchette__corps" x="2" y="4" width="10" height="40" rx="5" />
      <rect className="buchette__reflet" x="4.2" y="9" width="2.6" height="13" rx="1.3" />
    </svg>
  );
}
