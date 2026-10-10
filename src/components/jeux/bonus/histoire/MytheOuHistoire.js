import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { DEFI } from '../../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../../lib/jeux/bruitages';
import { IMAGES_HISTOIRE_GEO } from '../../../../lib/jeux/imagesHistoireGeo';
import * as moh from '../../../../lib/jeux/bonus/histoire/mytheOuHistoire.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from '../CadreBonus';
import BoutonsVoix from '../../BoutonsVoix';
import { BulleSalim, Tampon } from './communs';
import './histoire.css';

const dire = phrasesDe('bonus-mythe-ou-histoire', moh);
const IMAGES = IMAGES_HISTOIRE_GEO['mythe-ou-histoire'];
const UNITE = 'bonne réponse';

/**
 * MYTHE OU HISTOIRE — voir `lib/jeux/bonus/histoire/mytheOuHistoire.js`.
 * L'illustration à gauche, l'affirmation dans une bulle à droite, et deux
 * grands boutons : Histoire (c'est vrai) ou Mythe (idée reçue). Après, le
 * tampon frappe l'image et Salim explique, le mot clé surligné.
 *
 * LE DÉFI EST « RAPIDE » : un anneau par affirmation, qui se vide ; à zéro,
 * « Trop tard ! » et la réponse. Le chrono de la partie, lui, monte toujours.
 * L'explication se lit sans montre : on passe à la suite quand on veut.
 */
export default function MytheOuHistoire({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const manches = useMemo(() => moh.serie(graine, niveau), [graine, niveau]);
  const secondes = moh.secondesParAffirmation(niveau, mode === DEFI);
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState(null);
  const [bonnes, setBonnes] = useState(0);
  const [reste, setReste] = useState((secondes ?? 0) * 1000);
  const [fini, setFini] = useState(false);
  const debut = useRef(Date.now());
  const suite = useRef(null);

  const a = manches[index];
  const chrono = useChronoBonus('mythe-ou-histoire', niveau, fini, { trouves: bonnes, total: manches.length, unite: UNITE }, { montre: false });

  const voix = useVoixJeu('HISTOIRE_GEO');
  const consigne = dire('consigne');
  const lecture = (x) => dire(`affirmation-${x.id}`);
  useEffect(() => { voix.dire([consigne, lecture(manches[0])]); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('fin')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (choix) suite.current?.focus?.({ preventScroll: true }); }, [choix]);

  const reponse = (sorte) => [
    dire(sorte),
    dire(a.verdict === moh.HISTOIRE ? 'vrai' : 'mythe'),
    dire(`explication-${a.id}`),
  ];

  // Le temps d'une affirmation, en défi : à zéro, la réponse se montre.
  useEffect(() => {
    if (!secondes || choix || fini) return undefined;
    const id = setInterval(() => {
      const r = Math.max(0, secondes * 1000 - (Date.now() - debut.current));
      setReste(r);
      if (r === 0) {
        bruitage('mauvaise');
        setChoix('temps');
        voix.dire(reponse('trop-tard'));
      }
    }, 100);
    return () => clearInterval(id);
  }, [index, choix, fini, secondes]); // eslint-disable-line react-hooks/exhaustive-deps

  const choisir = (c) => {
    if (choix) return;
    const juste = moh.estJuste(a, c);
    bruitage(juste ? 'bonne' : 'mauvaise');
    if (juste) setBonnes((n) => n + 1);
    setChoix(c);
    voix.dire(reponse(juste ? 'bravo' : 'dommage'));
  };

  const suivante = () => {
    if (index + 1 >= manches.length) {
      setFini(true);
      return;
    }
    setIndex((i) => i + 1);
    setChoix(null);
    debut.current = Date.now();
    setReste((secondes ?? 0) * 1000);
    voix.dire(lecture(manches[index + 1]));
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-mythe-ou-histoire"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={bonnes}
        total={manches.length}
        unite={UNITE}
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const vrai = a.verdict === moh.HISTOIRE;
  const juste = choix && moh.estJuste(a, choix);
  const morceaux = moh.decouper(a);
  const verdict = !choix ? ''
    : `${choix === 'temps' ? 'Trop tard !' : juste ? 'Bien vu !' : 'Raté !'} ${vrai ? 'C’est de l’Histoire.' : 'C’est un mythe.'}`;
  const part = secondes ? reste / (secondes * 1000) : 1;

  return (
    <div className="jeu bonus hg-mythe">
      <EnTeteBonus titre="Mythe ou Histoire" sousTitre={`Affirmation ${index + 1} sur ${manches.length}`} chrono={chrono} onQuitter={onQuitter} ambiance={a.id}>
        <p className="bonus__compte">{`${bonnes} / ${manches.length}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="hg-mythe__plateau">
        <figure className={`hg-mythe__tableau${choix ? ' est-tamponne' : ''}`} key={a.id}>
          <img className="hg-mythe__image" src={IMAGES[a.id]} alt="" />
          {choix && <Tampon texte={vrai ? 'VRAI' : 'MYTHE'} couleur={vrai ? 'vert' : 'rouge'} />}
          {secondes && !choix && (
            <span
              className={`hg-mythe__minuteur${part < 0.3 ? ' est-presse' : ''}`}
              style={{ '--part': part }}
              role="timer"
              aria-label={`${Math.ceil(reste / 1000)} secondes`}
            >
              {Math.ceil(reste / 1000)}
            </span>
          )}
        </figure>

        <div className="hg-mythe__colonne">
        <div className="hg-mythe__pupitre">
          <blockquote className={`hg-mythe__affirmation${choix ? " est-tranchee" : ""}`} key={`b-${a.id}`}>
            <p>{a.affirmation}</p>
          </blockquote>

          {!choix && (
          <div className="hg-mythe__choix" role="group" aria-label="Ton verdict">
            <button
              type="button"
              className={`hg-mythe__bouton hg-mythe__bouton--histoire${choix === moh.HISTOIRE ? ' est-choisi' : ''}${choix && vrai ? ' est-juste' : ''}`}
              onClick={() => choisir(moh.HISTOIRE)}
              aria-label="Histoire : c’est vrai"
              disabled={Boolean(choix)}
            >
              <span className="hg-mythe__icone" aria-hidden="true">📜</span>
              <span className="hg-mythe__mot">Histoire</span>
              <span className="hg-mythe__precision">c’est vrai</span>
            </button>
            <button
              type="button"
              className={`hg-mythe__bouton hg-mythe__bouton--mythe${choix === moh.MYTHE ? ' est-choisi' : ''}${choix && !vrai ? ' est-juste' : ''}`}
              onClick={() => choisir(moh.MYTHE)}
              aria-label="Mythe : idée reçue"
              disabled={Boolean(choix)}
            >
              <span className="hg-mythe__icone" aria-hidden="true">🐉</span>
              <span className="hg-mythe__mot">Mythe</span>
              <span className="hg-mythe__precision">idée reçue</span>
            </button>
          </div>
          )}

          <p className={`hg-mythe__verdict${choix ? (juste ? ' est-juste' : ' est-faux') : ''}`} role="status">{verdict}</p>

          {/* La suite AVANT l'explication : si le texte est long, c'est lui qui
              défile dans la colonne, jamais le bouton qui sort de l'écran. */}
          {choix && (
            <>
              <button type="button" ref={suite} className="hg-histoire-bouton hg-histoire-bouton--suite" onClick={suivante}>
                {index + 1 >= manches.length ? 'Fin de l’enquête' : 'Affirmation suivante'}
                <span aria-hidden="true"> →</span>
              </button>
              <BulleSalim ton={juste ? 'bien' : 'mal'} className="hg-mythe__salim">
                <p>
                  {morceaux.avant}
                  {morceaux.mot && <mark className="hg-mythe__mot-cle">{morceaux.mot}</mark>}
                  {morceaux.apres}
                </p>
              </BulleSalim>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
