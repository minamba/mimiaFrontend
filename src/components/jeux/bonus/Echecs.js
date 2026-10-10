import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { DEFI } from '../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as echecs from '../../../lib/jeux/bonus/echecs.js';
import {
  EnTeteBonus, FinBonus, useChronoBonus, useTientDansLEcran,
} from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-echecs', echecs);

/**
 * Le choix de la difficulté, avant la partie : celle de la classe est mise en avant.
 * UNE PIÈCE ET DES ÉTOILES PAR NIVEAU (09/10/2026, Camara : « pas très visible ») :
 * du pion à la dame, une à quatre étoiles, sur une carte opaque à sa couleur.
 */
/** Ce qui entoure l'échiquier en largeur : 2 colonnes de 176 px, les écarts et le cadre ; empilé sur téléphone. */
const LARGEUR_AUTOUR = () => (window.matchMedia?.('(max-width: 760px)')?.matches ? 80 : 2 * 176 + 2 * 18 + 2 * 26 + 40);

const EMBLEMES = ['♟', '♞', '♜', '♛'];
function ChoixDifficulte({ conseillee, onChoisir }) {
  return (
    <ul className="echecs__difficultes" aria-label="Choisis ta difficulté">
      {echecs.DIFFICULTES.map((d, i) => (
        <li key={d.cle}>
          <button
            type="button"
            className={`echecs__difficulte${d.cle === conseillee ? ' est-conseillee' : ''}`}
            onClick={() => { bruitage('selection'); onChoisir(d.cle); }}
          >
            <span className="echecs__embleme" aria-hidden="true">{EMBLEMES[i] ?? '♛'}</span>
            <strong>{d.libelle}</strong>
            <span className="echecs__etoiles" aria-hidden="true">{'★'.repeat(i + 1)}</span>
            <span>{d.detail}</span>
            {d.cle === conseillee && <em>Conseillé pour ta classe</em>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Les pièces prises d'un camp, en rangée. */
function Prises({ titre, pieces }) {
  return (
    <aside className={`echecs__prises${titre === 'Tes prises' ? ' echecs__prises--toi' : ' echecs__prises--lui'}`} aria-label={`${titre} : ${pieces.length}`}>
      <p className="echecs__prises-titre">{titre}</p>
      <p className="echecs__prises-liste">
        {pieces.map((p, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`echecs__piece ${echecs.estBlanche(p) ? 'est-blanche' : 'est-noire'}`}>{echecs.dessin(p)}</span>
        ))}
        {pieces.length === 0 && <span className="echecs__prises-vide">Aucune</span>}
      </p>
    </aside>
  );
}

/**
 * LES ÉCHECS — voir `lib/jeux/bonus/echecs.js`. Un toucher sur une pièce
 * blanche la prend (ses coups s'allument en tranquille), un toucher sur une
 * case la pose. L'ordinateur répond après un court temps de réflexion.
 */
export default function Echecs({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const aides = mode !== DEFI;
  const [difficulte, setDifficulte] = useState(null);
  // L'échiquier prend la place qui reste à l'écran, mesurée (voir `useTientDansLEcran`) :
  // sur ordinateur, les deux colonnes des joueurs et le cadre l'encadrent en largeur.
  const refPlateau = useRef(null);
  useTientDansLEcran(refPlateau, {
    min: 240,
    max: 720,
    actif: Boolean(difficulte),
    largeurAutour: LARGEUR_AUTOUR,
  });
  const partie = useRef(null);
  const [etat, setEtat] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [choisie, setChoisie] = useState(null);
  const [dernier, setDernier] = useState(null);
  const [fini, setFini] = useState(false);

  const issue = etat?.isFinished
    ? (etat.checkMate ? (etat.turn === 'black' ? 'gagne' : 'perdu') : 'pat')
    : null;
  const chrono = useChronoBonus('echecs', niveau, fini, { trouves: issue === 'gagne' ? 1 : 0, total: 1, unite: 'partie gagnée' }, { montre: false });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (issue) {
      bruitage(issue === 'gagne' ? 'bonne' : issue === 'perdu' ? 'mauvaise' : 'selection');
      voix.dire(dire(issue));
    } else if (etat?.check && etat.turn === 'white') voix.dire(dire('echec'));
  }, [issue, etat?.check, etat?.turn]); // eslint-disable-line react-hooks/exhaustive-deps

  const commencer = (cle) => {
    partie.current = echecs.nouvellePartie();
    setDifficulte(cle);
    setEtat(partie.current.exportJson());
  };

  // L'ordinateur joue les noirs, après un temps pour qu'on voie son coup arriver.
  const aLOrdi = etat && !etat.isFinished && etat.turn === 'black';
  useEffect(() => {
    if (!aLOrdi) return undefined;
    const id = setTimeout(() => {
      const coup = echecs.coupOrdi(partie.current, difficulte);
      const [de, vers] = Object.entries(coup)[0] ?? [];
      setDernier(de ? { de, vers } : null);
      setEtat(partie.current.exportJson());
    }, 450);
    return () => clearTimeout(id);
  }, [aLOrdi, difficulte]);

  const coupsPossibles = useMemo(() => {
    if (!choisie || !partie.current) return [];
    return partie.current.moves(choisie)[choisie] ?? [];
  }, [choisie, etat]); // eslint-disable-line react-hooks/exhaustive-deps

  const toucher = (caseCle) => {
    if (!etat || etat.isFinished || etat.turn !== 'white') return;
    const piece = etat.pieces[caseCle];
    if (piece && echecs.estBlanche(piece)) {
      setChoisie(choisie === caseCle ? null : caseCle);
      return;
    }
    if (!choisie) return;
    const legaux = partie.current.moves(choisie)[choisie] ?? [];
    if (!legaux.includes(caseCle)) {
      bruitage('mauvaise');
      setChoisie(null);
      return;
    }
    setHistorique((h) => [...h, partie.current.exportJson()]);
    const prise = Boolean(etat.pieces[caseCle]);
    partie.current.move(choisie, caseCle);
    bruitage(prise ? 'bonne' : 'selection');
    setDernier({ de: choisie, vers: caseCle });
    setChoisie(null);
    setEtat(partie.current.exportJson());
  };

  const annuler = () => {
    const precedent = historique[historique.length - 1];
    if (!precedent) return;
    partie.current = echecs.nouvellePartie(precedent);
    setHistorique((h) => h.slice(0, -1));
    setDernier(null);
    setChoisie(null);
    setEtat(partie.current.exportJson());
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-echecs"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={issue === 'gagne' ? 1 : 0}
        total={1}
        unite="partie gagnée"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const prises = etat ? echecs.piecesPrises(etat.pieces) : { blanches: [], noires: [] };
  const roiEnEchec = etat?.check ? Object.keys(etat.pieces).find((k) => etat.pieces[k] === (etat.turn === 'white' ? 'K' : 'k')) : null;
  const libelle = echecs.DIFFICULTES.find((d) => d.cle === difficulte)?.libelle;

  return (
    <div className="jeu bonus bonus--echecs">
      <EnTeteBonus titre="Les échecs" sousTitre={libelle ? `Difficulté : ${libelle}` : 'Choisis ta difficulté'} chrono={chrono} onQuitter={onQuitter}>
        {aides && difficulte && (
          <button type="button" className="bonus__compte echecs__annuler" onClick={annuler} disabled={!historique.length || aLOrdi}>
            ↶ Annuler mon coup
          </button>
        )}
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      {!difficulte ? (
        <ChoixDifficulte conseillee={echecs.difficulteConseillee(niveau)} onChoisir={commencer} />
      ) : (
        <>
          <div className="echecs__table">
            {/* LE TOUR DE JEU À GAUCHE, AU-DESSUS DES PRISES (09/10/2026, Camara :
                « l'échiquier doit être plus gros, c'est le jeu principal ») : la
                rangée qu'il occupait au-dessus du plateau revient à l'échiquier. */}
            <div className="echecs__colonne">
              <p className={`echecs__tour${!issue && !aLOrdi ? ' est-actif' : ''}`} role="status">
                <span className="echecs__joueur" aria-hidden="true">
                  <span className="echecs__piece est-blanche">{echecs.dessin('K')}</span>
                  Toi · les blancs
                </span>
                {issue ? dire(issue).texte : aLOrdi ? 'L’ordinateur réfléchit…' : etat.check ? 'Échec au roi ! Protège-le.' : 'À toi de jouer, avec les blancs.'}
              </p>
              <Prises titre="Tes prises" pieces={prises.noires} />
            </div>
            {/* LE CADRE ÉPIQUE (09/10/2026, Camara : « je veux que l'échiquier soit
                épique, en rapport avec le thème ») : argent givré, quatre gemmes, la
                neige qui tombe sur le palais de glace. Décor seulement. */}
            <div className="echecs__cadre">
              <span className="echecs__gemme echecs__gemme--hg" aria-hidden="true" />
              <span className="echecs__gemme echecs__gemme--hd" aria-hidden="true" />
              <span className="echecs__gemme echecs__gemme--bg" aria-hidden="true" />
              <span className="echecs__gemme echecs__gemme--bd" aria-hidden="true" />
            <div ref={refPlateau} className="echecs__plateau" role="grid" aria-label="L’échiquier">
              {echecs.CASES.map((c, i) => {
                const piece = etat.pieces[c];
                const sombre = (Math.floor(i / 8) + (i % 8)) % 2 === 1;
                const cible = aides && coupsPossibles.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    className={[
                      'echecs__case',
                      sombre ? 'est-sombre' : 'est-claire',
                      choisie === c ? 'est-choisie' : '',
                      cible ? (piece ? 'est-prenable' : 'est-possible') : '',
                      dernier && (dernier.de === c || dernier.vers === c) ? 'est-dernier' : '',
                      roiEnEchec === c ? 'est-en-echec' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => toucher(c)}
                    aria-label={`${c}${piece ? ` : ${echecs.nomDe(piece)}` : ''}`}
                  >
                    {piece && <span className={`echecs__piece ${echecs.estBlanche(piece) ? 'est-blanche' : 'est-noire'}`}>{echecs.dessin(piece)}</span>}
                    {i % 8 === 0 && <span className="echecs__coord echecs__coord--ligne" aria-hidden="true">{c[1]}</span>}
                    {i >= 56 && <span className="echecs__coord echecs__coord--colonne" aria-hidden="true">{c[0]}</span>}
                  </button>
                );
              })}
            </div>
              <span className="echecs__neige" aria-hidden="true" />
            </div>
            {/* LES DEUX CÔTÉS SE RÉPONDENT (09/10/2026, Camara : « regarde la
                disposition des éléments ») : même largeur, même hauteur, une
                plaque de joueur en haut — celle dont c'est le tour s'allume. */}
            <div className="echecs__colonne">
              <p className={`echecs__tour echecs__tour--ordi${aLOrdi ? ' est-actif' : ''}`} aria-hidden="true">
                <span className="echecs__joueur">
                  <span className="echecs__piece est-noire">{echecs.dessin('k')}</span>
                  L’ordinateur · les rouges
                </span>
                {aLOrdi ? <span className="echecs__reflexion">Il réfléchit<i>.</i><i>.</i><i>.</i></span> : 'En attente'}
              </p>
              <Prises titre="Ses prises" pieces={prises.blanches} />
            </div>
          </div>
          {issue && (
            <button type="button" className="btn btn--principal" onClick={() => setFini(true)}>
              Voir mon score
            </button>
          )}
        </>
      )}
    </div>
  );
}
