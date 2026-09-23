import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, ESSAIS_AVANT_AIDE, MANCHES, mot, PHRASES, serie, son, verdict,
} from '../../lib/jeux/pecheAuxSons';
import { commun, repliquesPeche } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import decor from '../../assets/Jeux/CP/son.webp';

/**
 * LA PÊCHE AUX SONS, À L'ÉCRAN.
 *
 * Toute la règle vit dans `pecheAuxSons.js`, y compris pourquoi « loup » est
 * un leurre dans la manche du son « u ».
 *
 * AU DÉBUT DE CHAQUE MANCHE, ADRIEN DIT LE SON PUIS NOMME LES SIX IMAGES, et
 * le poisson qu'il nomme s'éclaire — le mécanisme de l'horloge. Chaque
 * poisson garde un haut-parleur pour réentendre son mot : un enfant qui
 * hésite doit pouvoir réécouter autant qu'il veut, c'est tout le jeu.
 *
 * L'ENFANT PÊCHE, PUIS ANNONCE — la leçon des paquets de dix : sans l'annonce,
 * il suffirait de toucher les poissons un à un jusqu'à ce que le jeu s'allume.
 *
 * LE JEU NE MARCHE PAS SANS SON. La voix coupée garde le haut-parleur de
 * chaque poisson et celui de la consigne : ce sont des demandes de l'enfant.
 *
 * LE DÉCOR EST UN FOND MARIN : les poissons nagent dans la mer elle-même,
 * sans mare dessinée par-dessus.
 */
export default function PecheAuxSons({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [peches, setPeches] = useState([]);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const leSon = son(courante.son);
  const juste = resultat?.sens === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesPeche.consigne(courante.son);
  const aDire = [laConsigne, ...courante.poissons.map((p) => repliquesPeche.nom(p.mot))];

  useEffect(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const basculer = useCallback((cle) => {
    if (termine) return;
    setResultat(null);
    setPeches((p) => (p.includes(cle) ? p.filter((x) => x !== cle) : [...p, cle]));
  }, [termine]);

  const annoncer = useCallback(() => {
    const r = verdict(peches, courante.poissons);
    if (r.sens === 'juste') {
      dire(commun.bravo(manche));
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      if (suivantes >= ESSAIS_AVANT_AIDE) dire(repliquesPeche.aide);
      else if (r.sens === 'manque') dire(repliquesPeche.manque);
      // UNE ERREUR, ET SON MOT REDIT : l'enfant entend à nouveau le mot fautif,
      // juste après qu'on lui a dit d'écouter encore.
      else dire([repliquesPeche.intrus(r.erreurs.length), ...r.erreurs.map(repliquesPeche.nom)]);
    }
    setResultat(r);
  }, [peches, courante.poissons, manche, ratees, dire]);

  const suivante = useCallback(() => {
    if (propre && juste) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setPeches([]);
    setResultat(null);
    setRatees(0);
    setPropre(true);
  }, [manche, propre, juste]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPeches([]);
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

  let message = null;
  if (resultat?.sens === 'manque' && !montrer) message = PHRASES.manque;
  else if (resultat?.sens === 'intrus' && !montrer) {
    message = resultat.erreurs.length > 1 ? PHRASES.intrusPluriel : PHRASES.intrus;
  }

  return (
    <div className="jeu jeu--peche" style={{ backgroundImage: `url(${decor})` }}>
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.son}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      {/* LA LETTRE, EN GRAND : c'est la correspondance que le jeu travaille —
          le son qu'on entend, et la lettre qui l'écrit. */}
      <p className="peche__lettre" aria-label={`Le son ${leSon.lettre}`}>{leSon.lettre}</p>

      <p className="jeu__consigne">
        {/* Des espaces insécables dans les guillemets, à l'affichage seulement :
            sans eux, « » » partait seul à la ligne. Le texte dit ne change pas. */}
        {laConsigne.texte.replace(/« /g, '« ').replace(/ »/g, ' »')}
        <BoutonsVoix voix={voix} consigne={aDire} />
      </p>

      <ul className="peche__mare" aria-label="La mare aux poissons">
        {courante.poissons.map((p, i) => {
          const m = mot(p.mot);
          const peche = peches.includes(p.mot);
          const fautif = resultat?.erreurs.includes(p.mot);
          const montre = montrer && p.cible;
          const lu = voix.enCours === repliquesPeche.nom(p.mot).cle;
          return (
            <li
              key={p.mot}
              className={`peche__place${peche ? ' est-peche' : ''}${fautif ? ' est-fautif' : ''}${montre ? ' est-montre' : ''}${lu ? ' est-lu' : ''}`}
              style={{ '--nage': `${(i % 3) * 0.6}s` }}
            >
              <button
                type="button"
                className="peche__poisson"
                onClick={() => basculer(p.mot)}
                disabled={termine}
                aria-pressed={peche}
                aria-label={`${m.mot}${peche ? ', pêché' : ''}`}
              >
                <Poisson />
                <span className="peche__image" aria-hidden="true">{m.image}</span>
              </button>
              <button
                type="button"
                className="peche__ecouter"
                onClick={() => voix.reecouter(repliquesPeche.nom(p.mot))}
                aria-label={`Écouter : ${m.mot}`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 9h4l5-4v14l-5-4H4z" />
                  <path d="M16 8.5a4.5 4.5 0 0 1 0 7" className="voix-jeu__onde" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      {message && <p className="jeu__trop" role="status">{message}</p>}

      {montrer && (
        <div className="jeu__gagne" role="status">
          <p className="peche__aide">{PHRASES.aide}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">Belle pêche&nbsp;!</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {!termine && peches.length > 0 && (
        <button type="button" className="btn btn--principal" onClick={annoncer}>
          C’est prêt&nbsp;!
        </button>
      )}

      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>
    </div>
  );
}

/** Un poisson : un corps, une queue, un œil — l'image se pose sur le corps. */
function Poisson() {
  return (
    <svg className="peche__corps" viewBox="0 0 140 90" aria-hidden="true">
      <path className="peche__queue" d="M104 45 L136 20 Q128 45 136 70 Z" />
      <ellipse className="peche__chair" cx="60" cy="45" rx="54" ry="38" />
      <path className="peche__nageoire" d="M50 10 Q66 0 80 12 Z" />
      <circle className="peche__oeil" cx="22" cy="36" r="5" />
      <circle className="peche__reflet" cx="20.5" cy="34.5" r="1.6" />
    </svg>
  );
}
