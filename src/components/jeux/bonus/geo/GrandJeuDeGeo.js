import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { DEFI } from '../../../../lib/jeux/coeurs';
import { useJeuOuvert } from '../../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../../lib/jeux/bruitages';
import * as gjg from '../../../../lib/jeux/bonus/geo/grandJeu.js';
import { continentDe } from '../../../../lib/jeux/bonus/geo/regions.js';
import { enDegres } from '../../../../lib/jeux/bonus/geo/geodesie.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from '../CadreBonus';
import BoutonsVoix from '../../BoutonsVoix';
import CarteMonde from './CarteMonde';
import {
  boitePoints, nomFrancais, unionBoites, useMonde,
} from './monde';

const dire = phrasesDe('bonus-grand-jeu-de-geo', gjg);
const PAUSE_JUSTE = 1300;
const PAUSE_FAUX = 2400;
const EMBLEMES = {
  continent: '🌍', pays: '🗺️', capitale: '🏛️', ville: '🏙️',
};
/** Le pays touché, avec son article quand on le connaît : « l’Australie », sinon « ce pays : Groenland ». */
const toucheLe = (code) => gjg.nomDuPays(code) ?? `ce pays : ${nomFrancais(code)}`;

const SORTES = {
  continent: 'Un continent', pays: 'Un pays', capitale: 'Une capitale', ville: 'Une ville',
};

/**
 * LE GRAND JEU DE GÉO — voir `lib/jeux/bonus/geo/grandJeu.js`. Un sablier
 * par question (plus court en défi) ; le chrono de la partie monte, pour le
 * record. Un clic juste : des points, et deux secondes de plus pour la
 * suivante. Un clic faux, ou le sablier vide : la carte vole jusqu'à la
 * réponse et la montre.
 */
export default function GrandJeuDeGeo({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const monde = useMonde();
  const [graine] = useState(() => Date.now());
  const questions = useMemo(() => gjg.serie(graine, niveau), [graine, niveau]);
  const visibles = useMemo(() => gjg.pointsVisibles(niveau), [niveau]);
  const base = gjg.secondesParQuestion(niveau, mode === DEFI);
  const [index, setIndex] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [reste, setReste] = useState(base * 1000);
  const [reponse, setReponse] = useState(null);
  const [mer, setMer] = useState(false);
  const [score, setScore] = useState(0);
  const [bonnes, setBonnes] = useState(0);
  const [fini, setFini] = useState(false);
  const debut = useRef(Date.now());
  const duree = (base + bonus) * 1000;

  const cible = questions[index];
  const compte = { trouves: bonnes, total: questions.length, unite: 'lieu trouvé' };
  const chrono = useChronoBonus('grand-jeu-de-geo', niveau, fini, compte, { montre: false });
  const voix = useVoixJeu('HISTOIRE_GEO');
  const consigne = dire('consigne');

  useEffect(() => { voix.dire(index === 0 ? [consigne, dire(`trouve-${cible.id.toLowerCase()}`)] : dire(`trouve-${cible.id.toLowerCase()}`)); }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const suivant = () => {
    if (index + 1 >= questions.length) {
      setFini(true);
      return;
    }
    setIndex((i) => i + 1);
    setReponse(null);
    setMer(false);
    debut.current = Date.now();
  };

  // Le sablier de la question : vide sans réponse, la carte montre où c'était.
  useEffect(() => {
    if (reponse || fini) return undefined;
    setReste(duree);
    const id = setInterval(() => {
      const r = Math.max(0, duree - (Date.now() - debut.current));
      setReste(r);
      if (r === 0) {
        bruitage('mauvaise');
        setBonus(0);
        setReponse({ juste: false, clic: null, tard: true });
        voix.dire(dire('trop-tard'));
      }
    }, 100);
    return () => clearInterval(id);
  }, [index, reponse, fini, duree]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!reponse) return undefined;
    const id = setTimeout(suivant, reponse.juste ? PAUSE_JUSTE : PAUSE_FAUX);
    return () => clearTimeout(id);
  }, [reponse]); // eslint-disable-line react-hooks/exhaustive-deps

  const toucher = (clic) => {
    if (reponse || fini) return;
    const r = gjg.juger(cible, clic, niveau);
    if (r.mer) {
      setMer(true);
      voix.dire(dire('mer'));
      return;
    }
    setMer(false);
    if (r.juste) {
      bruitage('bonne');
      setBonnes((n) => n + 1);
      setScore((s) => s + gjg.pointsDuClic(reste / 1000));
      setBonus((b) => Math.min(gjg.BONUS_MAX, b + gjg.BONUS_SECONDES));
      voix.dire(dire('juste'));
    } else {
      bruitage('mauvaise');
      setBonus(0);
      voix.dire(dire('faux'));
    }
    setReponse({ juste: r.juste, clic });
  };

  // --- Ce que la carte montre après la réponse.
  const estPoint = cible.type === 'capitale' || cible.type === 'ville';
  const classes = useMemo(() => {
    if (!monde || !reponse) return null;
    const c = {};
    const ton = reponse.juste ? 'est-juste' : 'est-montre';
    monde.pays.forEach((p) => {
      if (cible.type === 'pays' && p.code === cible.code) c[p.code] = ton;
      if (cible.type === 'continent' && continentDe(p.code) === cible.cle) c[p.code] = ton;
      if (!reponse.juste && reponse.clic?.pays === p.code && !c[p.code]) c[p.code] = 'est-faux';
    });
    return c;
  }, [monde, reponse, cible]);

  const vue = useMemo(() => {
    if (!monde || !reponse || reponse.juste || cible.type === 'continent') return null;
    const clic = reponse.clic ? [[reponse.clic.lon, reponse.clic.lat]] : [];
    if (estPoint) return { boite: boitePoints([[cible.lon, cible.lat], ...clic], 6) };
    const pays = monde.pays_[cible.code];
    if (!pays) return null;
    return { boite: clic.length ? unionBoites(pays.boite, boitePoints(clic, 3)) : pays.boite };
  }, [monde, reponse, cible, estPoint]);

  const marques = [
    ...(estPoint ? visibles.map((p) => ({
      id: p.id, sorte: 'point', lon: p.lon, lat: p.lat,
    })) : []),
    ...(reponse?.clic ? [{
      id: `clic-${index}`, sorte: 'clic', lon: reponse.clic.lon, lat: reponse.clic.lat, classe: reponse.juste ? 'est-trouve' : 'est-froid',
    }] : []),
    ...(reponse && estPoint ? [{
      id: `reponse-${index}`, sorte: 'epingle', lon: cible.lon, lat: cible.lat, libelle: cible.nom, classe: reponse.juste ? '' : 'est-montree',
    }] : []),
  ];

  if (fini) {
    return (
      <>
        <FinBonus
          jeu="bonus-grand-jeu-de-geo"
          niveau={niveau}
          ecoule={chrono.ecoule}
          trouves={bonnes}
          total={questions.length}
          unite="lieu trouvé"
          onRejouer={() => rejouerPartie(mode)}
          onQuitter={onQuitter}
        />
        <div className="hg-ost__bilan">
          <p>
            <span aria-hidden="true">⭐ </span>
            {`${score} points`}
          </p>
        </div>
      </>
    );
  }

  const part = Math.min(1, reste / duree);
  const ou = estPoint ? ` (${enDegres([cible.lon, cible.lat])})` : '';
  const verdict = !reponse ? (mer ? dire('mer').texte : '')
    : reponse.juste ? `Oui ! ${gjg.texteDeLaCible(cible)}.`
      : reponse.tard ? `Trop tard ! C’était ici : ${gjg.intitule(cible)}${ou}.`
        : `Non${reponse.clic?.pays && !estPoint ? `, tu as touché ${toucheLe(reponse.clic.pays)}` : ''}. C’était ici : ${gjg.intitule(cible)}${ou}.`;

  return (
    <div className="jeu bonus bonus--grand-jeu-de-geo hg-gjg">
      <EnTeteBonus titre="Le grand jeu de géo" sousTitre={`Question ${index + 1} sur ${questions.length}`} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">
          <span aria-hidden="true">⭐</span>
          {` ${score}`}
        </p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="hg-gjg__question">
        <span
          className={`hg-gjg__sablier${part < 0.3 ? ' est-presse' : ''}`}
          style={{ '--hg-geo-part': part }}
          role="timer"
          aria-label={`${Math.ceil(reste / 1000)} secondes`}
        >
          {Math.ceil(reste / 1000)}
        </span>
        <p className="hg-gjg__cible" key={cible.id}>
          <span className="hg-gjg__sorte">
            <span aria-hidden="true">{`${EMBLEMES[cible.type]} `}</span>
            {SORTES[cible.type]}
          </span>
          <span className="hg-gjg__trouve">
            {'Trouve '}
            <strong>{gjg.intitule(cible)}</strong>
          </span>
        </p>
        {bonus > 0 && !reponse && <span className="hg-gjg__bonus">{`+${bonus} s`}</span>}
      </div>

      <CarteMonde
        monde={monde}
        vue={vue}
        palette={cible.type === 'continent' ? 'continents' : 'regions'}
        classes={classes}
        onClic={toucher}
        marques={marques}
        desactive={Boolean(reponse)}
        etiquette={`Carte du monde : trouve ${gjg.intitule(cible)}`}
        coordonnees={!reponse}
        dessus={(
          <p className={`hg-geo__annonce hg-gjg__verdict${verdict ? ' est-visible' : ''}${reponse ? (reponse.juste ? ' est-bon' : ' est-faux') : ''}`} role="status">{verdict}</p>
        )}
      />
    </div>
  );
}
