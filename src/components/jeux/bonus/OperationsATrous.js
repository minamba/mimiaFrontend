import {
  useEffect, useMemo, useState,
} from 'react';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import * as operations from '../../../lib/jeux/bonus/operations.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const dire = phrasesDe('bonus-operations', operations);

/**
 * LES OPÉRATIONS À TROUS — voir `lib/jeux/bonus/operations.js`. On prend un
 * signe (un toucher, ou on le fait glisser à la souris), on le pose dans une
 * case. Un calcul complet se vérifie aussitôt : juste, il se verrouille en
 * vert ; faux, il tremble et ses signes reviennent.
 */
export default function OperationsATrous({ onQuitter, niveau = 'CP' }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const calculs = useMemo(() => operations.serie(graine, niveau), [graine, niveau]);
  const permis = operations.signesDe(niveau);
  const [poses, setPoses] = useState(() => calculs.map((c) => c.signes.map(() => null)));
  const [justes, setJustes] = useState(() => calculs.map(() => false));
  const [enMain, setEnMain] = useState(null);
  const [tremble, setTremble] = useState(null);

  const trouves = justes.filter(Boolean).length;
  const fini = trouves === calculs.length;
  const chrono = useChronoBonus('operations', niveau, fini, { trouves, total: calculs.length, unite: 'calcul juste' });

  const voix = useVoixJeu('MATHS');
  const consigne = dire(calculs[0]?.signes.length > 1 ? 'consigne-priorites' : 'consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const poser = (i, j, signe = enMain) => {
    if (justes[i]) return;
    // Une case pleine touchée sans signe en main se vide.
    if (!signe) {
      setPoses((p) => p.map((ligne, k) => (k === i ? ligne.map((s, l) => (l === j ? null : s)) : ligne)));
      return;
    }
    const ligne = poses[i].map((s, l) => (l === j ? signe : s));
    setPoses((p) => p.map((l, k) => (k === i ? ligne : l)));
    if (!ligne.every(Boolean)) return;
    if (operations.juste(calculs[i], ligne)) {
      bruitage('bonne');
      setJustes((js) => js.map((v, k) => (k === i ? true : v)));
      setEnMain(null);
    } else {
      bruitage('mauvaise');
      voix.dire(dire('faux'));
      setTremble(i);
      setTimeout(() => {
        setTremble(null);
        setPoses((p) => p.map((l, k) => (k === i ? l.map(() => null) : l)));
      }, 650);
    }
  };

  if (fini) {
    return (
      <FinBonus
        jeu="bonus-operations"
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={trouves}
        total={calculs.length}
        unite="calcul juste"
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  return (
    <div className="jeu bonus bonus--operations">
      <EnTeteBonus
        titre="Les opérations à trous"
        sousTitre="Pose le bon signe dans chaque case"
        chrono={chrono}
        onQuitter={onQuitter}
      >
        <p className="bonus__compte">{`${trouves} / ${calculs.length}`}</p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <ul className="operations__calculs">
        {calculs.map((c, i) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`operations__calcul${justes[i] ? ' est-juste' : ''}${tremble === i ? ' est-faux' : ''}`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {c.termes.map((t, k) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={k} className="operations__morceau">
                {k > 0 && (
                  <button
                    type="button"
                    className={`operations__trou${poses[i][k - 1] ? ' est-plein' : ''}`}
                    onClick={() => poser(i, k - 1)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); poser(i, k - 1, e.dataTransfer.getData('text/plain') || enMain); }}
                    disabled={justes[i]}
                    aria-label={poses[i][k - 1] ? `Case : ${operations.AFFICHE[poses[i][k - 1]]}` : 'Case vide'}
                  >
                    {poses[i][k - 1] ? operations.AFFICHE[poses[i][k - 1]] : ''}
                  </button>
                )}
                <span className="operations__nombre">{operations.ecrireNombre(t, k === 0)}</span>
              </span>
            ))}
            <span className="operations__egal">=</span>
            <span className="operations__resultat">{operations.ecrireNombre(c.resultat, true)}</span>
          </li>
        ))}
      </ul>

      <div className="operations__signes" role="group" aria-label="Les signes">
        {permis.map((s) => (
          <button
            key={s}
            type="button"
            draggable
            onDragStart={(e) => { e.dataTransfer.setData('text/plain', s); setEnMain(s); }}
            className={`operations__signe${enMain === s ? ' est-en-main' : ''}`}
            onClick={() => setEnMain(enMain === s ? null : s)}
            aria-pressed={enMain === s}
            aria-label={`Signe ${operations.AFFICHE[s]}`}
          >
            {operations.AFFICHE[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
