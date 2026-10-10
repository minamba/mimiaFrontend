import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AIDE, bilan, ESSAIS_AVANT_AIDE, groupe, MANCHES, REGLES, serie, verdict,
} from '../../lib/jeux/accordsCE2';
import { commun, repliquesAccords } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';
import { bruitage } from '../../lib/jeux/bruitages';
import { Fete, humeurDe } from './scenes/ce2-francais-b/communs';
import {
  DecorTonnelle, DessinsDeCraie, ExplicationAccord, Fleurette,
} from './scenes/ce2-francais-b/Tonnelle';

/**
 * FÉMININ ET PLURIEL — « Un ou des ? » au CE2, à l'écran.
 *
 * Toute la règle vit dans `accordsCE2.js`.
 *
 * MÊME GESTE QUE AU CP : une étiquette à deux cases, une rangée de choix par
 * case, et l'annonce. Le déterminant est donné (« des », « une ») : c'est lui
 * qui dit ce qu'il faut accorder.
 *
 * L'UNIVERS DE LA COUVERTURE (09/10/2026) — voir
 * `scenes/ce2-francais-b/Tonnelle.js` : la tonnelle fleurie vit (vigne,
 * lanterne, pétales), le groupe s'écrit sur le tableau à la craie, Fleurette
 * réagit (au pluriel, ses sœurs poussent ; au féminin, un nœud rose se pose
 * sur sa tête), et la manche finie montre à la craie la fin effacée et la fin
 * écrite de chaque mot. Rien de la règle ne change.
 */
export default function AccordsCE2({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [nom, setNom] = useState(null);
  const [adj, setAdj] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const g = groupe(courante.groupe);
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesAccords.consigne(courante.groupe);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const poser = useCallback((quoi, valeur) => {
    if (termine) return;
    setResultat(null);
    if (quoi === 'nom') setNom(valeur);
    else setAdj(valeur);
  }, [termine]);

  const annoncer = useCallback(() => {
    const r = verdict(g, nom, adj);
    setResultat(r);
    if (r === 'juste') {
      bruitage('bonne');
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    bruitage('mauvaise');
    dire(suivantes >= ESSAIS_AVANT_AIDE ? repliquesAccords.aide : repliquesAccords.regle(r));
  }, [g, nom, adj, manche, ratees, dire]);

  const suivante = useCallback(() => {
    if (juste && ratees === 0) setDuPremierCoup((n) => n + 1);
    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setNom(null);
    setAdj(null);
    setResultat(null);
    setRatees(0);
  }, [manche, juste, ratees]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setNom(null);
    setAdj(null);
    setResultat(null);
    setRatees(0);
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

  const [nomAffiche, adjAffiche] = montrer ? [g.nom, g.adj] : [nom, adj];
  const fauteNom = resultat?.startsWith('nom-') && !termine;
  const fauteAdj = resultat?.startsWith('adj-') && !termine;

  const rangee = (quoi, formes, choisie) => (
    <ul className="unoudes__rangee" aria-label={quoi === 'nom' ? 'Le nom' : 'L’adjectif'}>
      {formes.map((f) => (
        <li key={f}>
          <button
            type="button"
            className={`unoudes__tuile${choisie === f ? ' est-choisie' : ''}`}
            onClick={() => poser(quoi, f)}
            aria-pressed={choisie === f}
          >
            {f}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`jeu jeu--scene jeu--unoudes sc-ce2-francais-b sc-un-ou-des-ce2 sc-un-ou-des-ce2--${g.sens}${juste ? ' est-fete' : ''}`}>
      <DecorTonnelle fete={juste} />
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={m.groupe}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* LE TABLEAU DE LA TONNELLE : le départ, l'étiquette, puis ce qui a changé. */}
      <div key={manche} className={`sc-un-ou-des-ce2__tableau${termine ? ' est-termine' : ''}`}>
        <DessinsDeCraie />
        <p className="accords__depart">
          <span className={`accords__sens accords__sens--${g.sens}`}>{g.sens === 'pluriel' ? 'au pluriel' : 'au féminin'}</span>
          {g.depart}
        </p>

        <p className={`unoudes__etiquette${termine ? ' est-juste' : ''}`} aria-label="Le groupe à écrire">
          <span className="unoudes__case est-pleine">{g.det}</span>
          <span className={`unoudes__case unoudes__case--nom${nomAffiche ? ' est-pleine' : ''}${fauteNom ? ' est-fautive' : ''}`}>
            {nomAffiche ?? '…'}
          </span>
          <span className={`unoudes__case unoudes__case--nom${adjAffiche ? ' est-pleine' : ''}${fauteAdj ? ' est-fautive' : ''}`}>
            {adjAffiche ?? '…'}
          </span>
        </p>

        {termine && <ExplicationAccord g={g} />}
      </div>

      {!termine && (
        <div className="unoudes__choix">
          {rangee('nom', courante.noms, nom)}
          {rangee('adj', courante.adjs, adj)}
        </div>
      )}

      {resultat && !termine && <p className="jeu__trop" role="status">{REGLES[resultat]}</p>}

      {termine && (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="scene__bulle">{AIDE}</p>}
          {juste && <p className="jeu__gagne-calcul">Bien accordé&nbsp;!</p>}
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {!termine && nom && adj && !resultat && (
        <button type="button" className="btn btn--principal" onClick={annoncer}>
          C’est prêt&nbsp;!
        </button>
      )}

      {/* Fleurette fête la bonne étiquette, explique l'aide, encourage après une erreur. */}
      <Fleurette
        humeur={humeurDe({ reussi: juste, montre: montrer, faute: Boolean(resultat) && !termine })}
        declic={ratees}
        sens={g.sens}
      />
      {juste && <Fete forme="coeur" teintes={['#ff6fa8', '#c08bff', '#ffd84d', '#ff9cc2', '#a879ff', '#ffffff']} />}
    </div>
  );
}
