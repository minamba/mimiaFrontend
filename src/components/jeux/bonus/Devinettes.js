import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useJeuOuvert } from '../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../lib/jeux/bruitages';
import {
  LETTRES, PHRASES_MOT, PHRASES_PHRASE, cases, erreursDe, erreursPermises, estTrouve, lettresDe, serieMots, seriePhrases,
} from '../../../lib/jeux/bonus/devinettes.js';
import { enCapitales } from '../../../lib/jeux/bonus/reglages.js';
import { EnTeteBonus, FinBonus, useChronoBonus } from './CadreBonus';
import BoutonsVoix from '../BoutonsVoix';

const direMot = phrasesDe('bonus-devine-le-mot', { PHRASES: PHRASES_MOT });
const direPhrase = phrasesDe('bonus-devine-la-phrase', { PHRASES: PHRASES_PHRASE });

/** Le texte caché, découpé en mots pour que les cases passent à la ligne entre deux mots, jamais au milieu. */
function Tableau({ texte, proposees, devoile }) {
  const mots = [];
  let courant = [];
  cases(texte).forEach((c) => {
    if (c.car === ' ') {
      if (courant.length) mots.push(courant);
      courant = [];
    } else courant.push(c);
  });
  if (courant.length) mots.push(courant);
  return (
    <div className="devinette__tableau" aria-label="Le texte à deviner">
      {mots.map((mot, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className="devinette__mot">
          {mot.map((c, k) => {
            const vue = !c.lettre || proposees.includes(c.lettre) || devoile;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <span key={k} className={`devinette__case${c.lettre ? '' : ' est-signe'}${vue && c.lettre ? ' est-vue' : ''}${devoile && !proposees.includes(c.lettre) && c.lettre ? ' est-devoilee' : ''}`}>
                {vue ? c.car : ''}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

/**
 * DEVINE LE MOT et DEVINE LA PHRASE — un seul écran, deux réglages : cinq
 * mots et six erreurs permises, ou trois phrases et des vies en pastilles.
 * Clavier à l'écran, et celui de l'ordinateur aussi.
 */
function Devinette({
  sorte, onQuitter, niveau = 'CP',
}) {
  const estMot = sorte === 'mot';
  const jeu = estMot ? 'devine-le-mot' : 'devine-la-phrase';
  const dire = estMot ? direMot : direPhrase;
  const { mode, rejouerPartie } = useJeuOuvert();
  const [graine] = useState(() => Date.now());
  const serie = useMemo(() => (estMot ? serieMots : seriePhrases)(graine, niveau), [estMot, graine, niveau]);
  const permises = erreursPermises(sorte, niveau);

  const [index, setIndex] = useState(0);
  const [proposees, setProposees] = useState([]);
  const [bilan, setBilan] = useState([]);
  const courant = serie[index];
  const erreurs = erreursDe(courant.texte, proposees);
  const gagne = estTrouve(courant.texte, proposees);
  const perdu = !gagne && erreurs >= permises;
  const fini = bilan.length === serie.length;
  const trouves = bilan.filter(Boolean).length;
  const unite = estMot ? 'mot trouvé' : 'phrase trouvée';
  const chrono = useChronoBonus(jeu, niveau, fini, { trouves, total: serie.length, unite });

  const voix = useVoixJeu('FRANCAIS');
  const consigne = dire('consigne');
  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (gagne) voix.dire(dire('bravo'));
    else if (perdu) voix.dire(dire('dommage'));
  }, [gagne, perdu]); // eslint-disable-line react-hooks/exhaustive-deps

  const proposer = useCallback((lettre) => {
    if (gagne || perdu || proposees.includes(lettre)) return;
    const suivantes = [...proposees, lettre];
    setProposees(suivantes);
    bruitage(lettresDe(courant.texte).includes(lettre) ? 'bonne' : 'mauvaise');
  }, [gagne, perdu, proposees, courant.texte]);

  // Le clavier de l'ordinateur : une lettre tapée est une lettre proposée.
  useEffect(() => {
    const touche = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const l = enCapitales(e.key);
      if (/^[A-Z]$/.test(l)) proposer(l);
    };
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [proposer]);

  const suivant = () => {
    setBilan((b) => [...b, gagne]);
    if (index + 1 < serie.length) {
      setIndex(index + 1);
      setProposees([]);
    }
  };

  if (fini) {
    return (
      <FinBonus
        jeu={`bonus-${jeu}`}
        niveau={niveau}
        ecoule={chrono.ecoule}
        trouves={trouves}
        total={serie.length}
        unite={unite}
        onRejouer={() => rejouerPartie(mode)}
        onQuitter={onQuitter}
      />
    );
  }

  return (
    <div className={`jeu bonus bonus--devinette bonus--${jeu}`}>
      <EnTeteBonus
        titre={estMot ? 'Devine le mot' : 'Devine la phrase'}
        sousTitre={`${estMot ? 'Mot' : 'Phrase'} ${index + 1} sur ${serie.length}`}
        chrono={chrono}
        onQuitter={onQuitter}
      >
        {!estMot && (
          <p className="devinette__vies" aria-label={`${permises - erreurs} essai${permises - erreurs > 1 ? 's' : ''} restant${permises - erreurs > 1 ? 's' : ''}`}>
            {Array.from({ length: permises }, (_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={i} className={`devinette__vie${i < erreurs ? ' est-perdue' : ''}`} />
            ))}
          </p>
        )}
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="devinette__corps">
        <div className="devinette__centre">
          <p className="devinette__indice">
            <span className="devinette__indice-mot">Indice</span>
            {courant.indice}
          </p>
          <Tableau texte={courant.texte} proposees={proposees} devoile={perdu} />
          {estMot && <p className="devinette__erreurs">{`Erreurs : ${erreurs} / ${permises}`}</p>}

          {gagne || perdu ? (
            <div className={`devinette__issue${gagne ? ' est-gagne' : ' est-perdu'}`} role="status">
              <p>{gagne ? dire('bravo').texte : dire('dommage').texte}</p>
              <button type="button" className="btn btn--principal" onClick={suivant}>
                {index + 1 < serie.length ? (estMot ? 'Mot suivant' : 'Phrase suivante') : 'Voir mon score'}
              </button>
            </div>
          ) : (
            <div className="devinette__clavier" role="group" aria-label="Les lettres">
              {LETTRES.map((l) => {
                const dite = proposees.includes(l);
                const bonne = dite && lettresDe(courant.texte).includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    className={`devinette__touche${dite ? (bonne ? ' est-bonne' : ' est-mauvaise') : ''}`}
                    onClick={() => proposer(l)}
                    disabled={dite}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DevineLeMot(props) {
  return <Devinette {...props} sorte="mot" />;
}

export function DevineLaPhrase(props) {
  return <Devinette {...props} sorte="phrase" />;
}
