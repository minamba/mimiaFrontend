import { useEffect, useState } from 'react';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as planetes from '../../../lib/jeux/bonus/planetes.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';
import Dessin, { Soleil } from './Astre';

const dire = phrasesDe('bonus-planetes', planetes);

/** Une planète à sa taille relative — le dessin lui-même est dans `Astre.js`. */
function Astre({ cle, echelle = 1 }) {
  const p = planetes.planete(cle);
  const d = Math.round(26 + 70 * p.taille * echelle);
  return (
    // `--d` : la taille calculée, que le téléphone réduit sans perdre les proportions.
    <span className="planetes__astre" style={{ width: d, height: d, '--d': `${d}px` }} aria-hidden="true">
      <Dessin cle={cle} diametre={d} />
    </span>
  );
}

/**
 * LES PLANÈTES — voir `lib/jeux/bonus/planetes.js`. On prend une planète dans
 * la réserve (un toucher, ou on la fait glisser à la souris) et on la pose sur
 * une orbite. Bien placée, elle y reste ; sinon, elle revient.
 */
export default function Planetes({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const reglage = planetes.reglageDe(niveau);
  const [graine] = useState(() => Date.now());
  const [indexManche, setIndexManche] = useState(0);
  const manche = reglage.manches[indexManche];
  const [enReserve, setEnReserve] = useState(() => planetes.reserve(graine, reglage.manches[0]));
  const [places, setPlaces] = useState(() => Array(8).fill(null));
  const [enMain, setEnMain] = useState(null);
  const [rate, setRate] = useState(null);
  const [fini, setFini] = useState(false);

  const total = 8 * reglage.manches.length;
  const trouves = 8 * indexManche + places.filter(Boolean).length;
  const chrono = useChronoBonus('planetes', niveau, fini, { trouves, total, unite: 'planète placée' });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire(manche === 'taille' ? 'consigne-taille' : 'consigne');
  useEffect(() => { voix.dire(consigne); }, [manche]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const poser = (place, cle = enMain) => {
    if (!cle || places[place]) return;
    if (planetes.aSaPlace(manche, cle, place)) {
      bruitage('bonne');
      const suite = places.map((v, i) => (i === place ? cle : v));
      setPlaces(suite);
      setEnReserve((r) => r.filter((c) => c !== cle));
      setEnMain(null);
      if (suite.every(Boolean)) {
        setTimeout(() => {
          if (indexManche + 1 < reglage.manches.length) {
            const prochaine = reglage.manches[indexManche + 1];
            setIndexManche(indexManche + 1);
            setPlaces(Array(8).fill(null));
            setEnReserve(planetes.reserve(graine, prochaine));
          } else setFini(true);
        }, 900);
      }
    } else {
      bruitage('mauvaise');
      voix.dire(dire('faux'));
      setRate(place);
      setTimeout(() => setRate(null), 450);
    }
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-planetes"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={total}
        total={total}
        unite="planète placée"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  const attendu = planetes.ordreAttendu(manche);
  return (
    <div className="jeu bonus bonus--planetes">
      <EnTeteBonus
        titre="Les planètes"
        sousTitre={manche === 'taille' ? 'De la plus grande à la plus petite' : 'Depuis le Soleil'}
        chrono={chrono}
        onQuitter={onQuitter}
      >
        <p className="bonus__compte">{`${trouves} / ${total}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className={`planetes__ciel planetes__ciel--${manche}`}>
        {manche === 'distance' && <span className="planetes__soleil" aria-hidden="true"><Soleil /></span>}
        <ol className="planetes__orbites" aria-label={manche === 'taille' ? 'Les places, de la plus grande à la plus petite' : 'Les orbites, depuis le Soleil'}>
          {places.map((cle, i) => {
            const indice = reglage.indices ? planetes.planete(attendu[i]) : null;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <li key={i} className="planetes__orbite">
                <button
                  type="button"
                  className={`planetes__place${cle ? ' est-occupee' : ''}${rate === i ? ' est-ratee' : ''}${enMain && !cle ? ' est-ouverte' : ''}`}
                  style={indice ? { '--indice': indice.couleurs[1], '--diametre': `${Math.round(26 + 70 * indice.taille)}px` } : undefined}
                  onClick={() => poser(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); poser(i, e.dataTransfer.getData('text/plain')); }}
                  aria-label={cle ? `Place ${i + 1} : ${planetes.planete(cle).nom}` : `Place ${i + 1}, libre`}
                >
                  {cle ? <Astre cle={cle} /> : <span className="planetes__rang" aria-hidden="true">{i + 1}</span>}
                </button>
                {cle && <span className="planetes__nom">{planetes.planete(cle).nom}</span>}
              </li>
            );
          })}
        </ol>
      </div>

      <ul className="planetes__reserve" aria-label="Les planètes à placer">
        {enReserve.map((cle) => (
          <li key={cle}>
            <button
              type="button"
              draggable
              onDragStart={(e) => { e.dataTransfer.setData('text/plain', cle); setEnMain(cle); }}
              className={`planetes__pion${enMain === cle ? ' est-en-main' : ''}`}
              onClick={() => setEnMain(enMain === cle ? null : cle)}
              aria-pressed={enMain === cle}
              aria-label={reglage.noms ? planetes.planete(cle).nom : 'Une planète à reconnaître'}
            >
              <Astre cle={cle} echelle={0.85} />
              {reglage.noms && <span className="planetes__nom">{planetes.planete(cle).nom}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
