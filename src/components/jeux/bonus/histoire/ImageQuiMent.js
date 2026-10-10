import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useJeuOuvert } from '../../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../../lib/jeux/bruitages';
import { sessionEleve } from '../../../../lib/storage/sessionEleve';
import { IMAGES_HISTOIRE_GEO } from '../../../../lib/jeux/imagesHistoireGeo';
import * as iqm from '../../../../lib/jeux/bonus/histoire/imageQuiMent.js';
import { lireDossier, rangerScene } from '../../../../lib/jeux/bonus/histoire/dossierEnquete.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from '../CadreBonus';
import BoutonsVoix from '../../BoutonsVoix';
import SceneALoupe from './SceneALoupe';
import { BulleSalim, Tampon } from './communs';
import './histoire.css';

const dire = phrasesDe('bonus-image-qui-ment', iqm);
const IMAGES = IMAGES_HISTOIRE_GEO['image-qui-ment'];
const UNITE = 'anachronisme trouvé';
/** Le temps d'une croix rouge sur une fausse accusation. */
const DUREE_MARQUE = 1400;

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * L'IMAGE QUI MENT — voir `lib/jeux/bonus/histoire/imageQuiMent.js`. La
 * scène et sa loupe à gauche, le carnet du détective à droite : l'époque, les
 * loupes qui restent, l'indice, « montre-moi », puis l'explication de Salim
 * et la scène suivante. Le dossier d'enquête s'ouvre par-dessus.
 */
export default function ImageQuiMent({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [eleveId] = useState(() => (sessionEleve() ?? {}).eleveId);
  const [dossier, setDossier] = useState(() => lireDossier(eleveId));
  const [graine] = useState(() => Date.now());
  const scenes = useMemo(() => iqm.serie(graine, niveau, Object.keys(dossier)), [graine, niveau]); // eslint-disable-line react-hooks/exhaustive-deps
  const loupesDepart = iqm.loupesDe(niveau);

  const [index, setIndex] = useState(0);
  const [loupes, setLoupes] = useState(loupesDepart);
  const [indice, setIndice] = useState(false);
  const [issue, setIssue] = useState(null);
  const [marques, setMarques] = useState([]);
  const [message, setMessage] = useState('');
  const [leurre, setLeurre] = useState(false);
  const [bilans, setBilans] = useState([]);
  const [fini, setFini] = useState(false);
  const [dossierOuvert, setDossierOuvert] = useState(false);
  const minuteries = useRef([]);
  const suite = useRef(null);

  const scene = scenes[index];
  const trouves = bilans.filter((b) => b.trouve).length;
  const score = bilans.reduce((s, b) => s + b.points, 0);
  const chrono = useChronoBonus('image-qui-ment', niveau, fini, { trouves, total: scenes.length, unite: UNITE });

  const voix = useVoixJeu('HISTOIRE_GEO');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('fin')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => minuteries.current.forEach(clearTimeout), []);
  // Après la résolution, le bouton « Scène suivante » prend la main.
  useEffect(() => { if (issue) suite.current?.focus?.({ preventScroll: true }); }, [issue]);

  const resoudre = (trouve, autre = null) => {
    const perdues = loupesDepart - loupes;
    const pts = iqm.points({ trouve, loupesPerdues: perdues, indice });
    setIssue({ trouve, autre });
    setBilans((b) => [...b, { id: scene.id, trouve, points: pts }]);
    setDossier(rangerScene(eleveId, scene.id, trouve));
    return pts;
  };

  const accuser = (x, y) => {
    if (issue) return;
    const r = iqm.toucher(scene, x, y, niveau);
    if (r.sorte === 'intrus') {
      bruitage('bonne');
      const pts = resoudre(true, r.autre);
      setMessage(`Bien vu, détective ! ${majuscule(r.autre ? r.autre.nom : scene.intrus.nom)} : +${pts} points.`);
      setLeurre(false);
      voix.dire([dire('trouve'), dire(iqm.cleExplication(scene)), ...(scene.aussi ?? []).map((a) => dire(iqm.cleAussi(scene, a)))]);
      return;
    }
    const id = `${Date.now()}-${x}-${y}`;
    if (r.sorte === 'leurre') {
      bruitage('selection');
      setMarques((m) => [...m, { id, x, y, sorte: 'leurre' }]);
      setLeurre(true);
      setMessage('Bien vu de te méfier… mais ce n’est pas l’intrus. Ta loupe est sauve.');
      voix.dire(dire(iqm.cleLeurre(scene)));
      return;
    }
    bruitage('mauvaise');
    setLeurre(false);
    setMarques((m) => [...m, { id, x, y, sorte: 'faux' }]);
    minuteries.current.push(setTimeout(() => setMarques((m) => m.filter((k) => k.id !== id)), DUREE_MARQUE));
    const reste = loupes - 1;
    setLoupes(reste);
    if (reste <= 0) {
      resoudre(false);
      setMessage(`Plus de loupe ! L’intrus : ${scene.intrus.nom}.`);
      voix.dire([dire('plus-de-loupes'), dire(iqm.cleExplication(scene))]);
    } else {
      setMessage(`Ce n’est pas ça… Plus que ${pluriel(reste, 'loupe')}.`);
      voix.dire(dire('rate'));
    }
  };

  const demanderIndice = () => {
    if (issue || indice) return;
    bruitage('selection');
    setIndice(true);
    setLeurre(false);
    voix.dire(dire(iqm.cleIndice(scene)));
  };

  const montrer = () => {
    if (issue) return;
    bruitage('selection');
    resoudre(false);
    setLeurre(false);
    setMessage(`Voici l’intrus : ${scene.intrus.nom}.`);
    voix.dire([dire('montre'), dire(iqm.cleExplication(scene))]);
  };

  const suivante = () => {
    if (index + 1 >= scenes.length) {
      setFini(true);
      return;
    }
    minuteries.current.forEach(clearTimeout);
    minuteries.current = [];
    setIndex((i) => i + 1);
    setLoupes(loupesDepart);
    setIndice(false);
    setIssue(null);
    setMarques([]);
    setMessage('');
    setLeurre(false);
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-image-qui-ment"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={trouves}
        total={scenes.length}
        unite={UNITE}
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const entourer = issue ? [scene.intrus, ...(scene.aussi ?? [])] : [];
  const ranges = Object.keys(dossier).length;
  const texteSalim = issue
    ? [iqm.PHRASES[iqm.cleExplication(scene)], ...(scene.aussi ?? []).map((a) => iqm.PHRASES[iqm.cleAussi(scene, a)])]
    : leurre ? [iqm.PHRASES[iqm.cleLeurre(scene)]]
      : indice ? [iqm.PHRASES[iqm.cleIndice(scene)]] : null;

  return (
    <div className="jeu bonus hg-loupe">
      <EnTeteBonus titre="L’image qui ment" sousTitre={`Scène ${index + 1} sur ${scenes.length}`} chrono={chrono} onQuitter={onQuitter} ambiance={scene.id}>
        <p className="bonus__compte" aria-label={`${score} points`}>
          <span aria-hidden="true">★</span>
          {` ${score}`}
        </p>
        <button
          type="button"
          className="bonus__compte hg-loupe__dossier-bouton"
          onClick={() => setDossierOuvert(true)}
          aria-haspopup="dialog"
          aria-label={`Mon dossier d’enquête : ${ranges} scène${ranges > 1 ? 's' : ''} sur ${iqm.SCENES.length}`}
          title="Mon dossier d’enquête"
        >
          <span aria-hidden="true">📁</span>
          {` ${ranges}/${iqm.SCENES.length}`}
        </button>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="hg-loupe__plateau">
        <SceneALoupe
          key={scene.id}
          src={IMAGES[scene.id]}
          description={`${scene.titre}, ${scene.epoque}`}
          actif={!issue}
          onAccuser={accuser}
          entourer={entourer}
          marques={marques}
        >
          {issue && <Tampon texte="ANACHRONISME" ou={iqm.placeDuTampon(scene)} petit />}
        </SceneALoupe>

        {/* LA COLONNE N'A PAS DE HAUTEUR À ELLE : le carnet s'y pose en absolu, à la
            hauteur de la scène, et défile dedans si son texte est long (Camara,
            10/10/2026 : « ça déborde »). */}
        <div className="hg-loupe__colonne">
        <aside className="hg-loupe__carnet" aria-label="Le carnet du détective">
          <div className="hg-loupe__fiche">
            <h3 className="hg-loupe__titre-scene">{scene.titre}</h3>
            <div className="hg-loupe__rangee">
              <p className="hg-loupe__epoque">{scene.epoque}</p>
              {!issue && (
                <p className="hg-loupe__loupes" aria-label={`${pluriel(loupes, 'loupe')} sur ${loupesDepart}`}>
                  {Array.from({ length: loupesDepart }, (_, i) => (
                    <span key={i} className={`hg-loupe__jeton${i < loupes ? '' : ' est-perdu'}`} aria-hidden="true">🔍</span>
                  ))}
                </p>
              )}
            </div>
          </div>

          <p className={`hg-loupe__verdict${issue?.trouve ? ' est-trouve' : ''}`} role="status">{message}</p>

          {/* La suite AVANT l'explication : sur un écran bas, c'est l'explication
              qui défile dans le carnet, jamais le bouton qui disparaît. */}
          {issue && (
            <button type="button" ref={suite} className="hg-histoire-bouton hg-histoire-bouton--suite" onClick={suivante}>
              {index + 1 >= scenes.length ? 'Fin de l’enquête' : 'Scène suivante'}
              <span aria-hidden="true"> →</span>
            </button>
          )}

          {texteSalim && (
            <BulleSalim ton={issue ? (issue.trouve ? 'bien' : 'neutre') : leurre ? 'neutre' : 'indice'} className="hg-loupe__salim">
              {texteSalim.map((t) => <p key={t}>{t}</p>)}
            </BulleSalim>
          )}

          {!issue && (
            <div className="hg-loupe__aides">
              <button type="button" className="hg-histoire-bouton hg-histoire-bouton--indice" onClick={demanderIndice} disabled={indice}>
                <span aria-hidden="true">💡</span>
                {' Un indice'}
              </button>
              <button type="button" className="hg-histoire-bouton hg-histoire-bouton--montre" onClick={montrer}>
                <span aria-hidden="true">🙈</span>
                {' Je ne trouve pas, montre-moi'}
              </button>
            </div>
          )}
        </aside>
        </div>
      </div>

      {dossierOuvert && <DossierEnquete dossier={dossier} onFermer={() => setDossierOuvert(false)} />}
    </div>
  );
}

/**
 * LE DOSSIER D'ENQUÊTE : les 24 scènes, celles résolues en vignette avec leur
 * intrus (une étoile s'il a été trouvé sans qu'on le montre), les autres sous
 * scellé. Échap ou le bouton le referme.
 */
function DossierEnquete({ dossier, onFermer }) {
  const titre = useRef(null);
  useEffect(() => { titre.current?.focus?.({ preventScroll: true }); }, []);
  useEffect(() => {
    const echap = (e) => { if (e.key === 'Escape') onFermer(); };
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [onFermer]);

  const ranges = iqm.SCENES.filter((s) => dossier[s.id]);
  return (
    <div className="hg-loupe-dossier" role="dialog" aria-modal="true" aria-labelledby="hg-loupe-dossier-titre">
      <div className="hg-loupe-dossier__chemise">
        <header className="hg-loupe-dossier__entete">
          <h3 id="hg-loupe-dossier-titre" className="hg-loupe-dossier__titre" ref={titre} tabIndex={-1}>
            Mon dossier d’enquête
          </h3>
          <p className="hg-loupe-dossier__compte">{`${ranges.length} scène${ranges.length > 1 ? 's' : ''} résolue${ranges.length > 1 ? 's' : ''} sur ${iqm.SCENES.length}`}</p>
          <button type="button" className="hg-histoire-bouton hg-loupe-dossier__fermer" onClick={onFermer}>Fermer le dossier</button>
        </header>
        <ul className="hg-loupe-dossier__fiches">
          {iqm.SCENES.map((s) => {
            const fiche = dossier[s.id];
            return (
              <li key={s.id} className={`hg-loupe-dossier__fiche${fiche ? '' : ' est-scellee'}`}>
                {fiche ? (
                  <>
                    <img src={IMAGES[s.id]} alt="" className="hg-loupe-dossier__vignette" />
                    <span className="hg-loupe-dossier__nom">{s.titre}</span>
                    <span className="hg-loupe-dossier__intrus">
                      {fiche.trouve && <span className="hg-loupe-dossier__etoile" aria-hidden="true">★ </span>}
                      {fiche.trouve && <span className="hg-histoire-cache">Trouvé seul : </span>}
                      {s.intrus.nom}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="hg-loupe-dossier__scelle" aria-hidden="true">?</span>
                    <span className="hg-loupe-dossier__nom">Scène pas encore résolue</span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
