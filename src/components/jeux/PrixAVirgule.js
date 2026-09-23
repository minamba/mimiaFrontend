import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/marchande.webp';
import {
  bilan, ecrirePiece, ecrirePrix, ESSAIS_AVANT_AIDE, MANCHES, MONNAIE_CE2, PHRASES_CE2, prixEnMots,
  serieCE2, somme, verdictCE2,
} from '../../lib/jeux/marchande';
import { commun, repliquesMarchande } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import { Monnaie, Produit } from './Etal';

/**
 * LES PRIX À VIRGULE — la marchande du CE2, à l'écran.
 *
 * Toute la règle vit dans `marchande.js`, section « le CE2 ».
 *
 * MÊME MARCHÉ, MÊME GESTE QUE LE CP : poser des pièces sur le comptoir, en
 * reprendre d'un clic. Ce qui change : l'étiquette a une virgule, la bourse
 * a des centimes, et l'enfant annonce qu'il a payé.
 */
export default function PrixAVirgule({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serieCE2(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [posees, setPosees] = useState([]);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesMarchande.consigneCE2;

  useEffect(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const poser = useCallback((c) => {
    if (termine) return;
    setResultat(null);
    setPosees((p) => [...p, c]);
  }, [termine]);

  const reprendre = useCallback((i) => {
    if (termine) return;
    setResultat(null);
    setPosees((p) => p.filter((_, k) => k !== i));
  }, [termine]);

  const annoncer = useCallback(() => {
    const r = verdictCE2(posees, courante.prix);
    setResultat(r);
    if (r === 'juste') {
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    dire(suivantes >= ESSAIS_AVANT_AIDE ? repliquesMarchande.aideCE2 : repliquesMarchande.erreurCE2(r));
  }, [posees, courante.prix, manche, ratees, dire]);

  const suivante = useCallback(() => {
    if (juste && ratees === 0) setDuPremierCoup((n) => n + 1);
    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPosees([]);
    setResultat(null);
    setRatees(0);
  }, [manche, juste, ratees]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPosees([]);
    setResultat(null);
    setRatees(0);
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

  const paye = somme(posees);

  return (
    <div className="jeu jeu--marche jeu--caisse" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.prix}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* LE PRODUIT ET SON ÉTIQUETTE : le prix à lire. */}
      <div className="etal__article prix__produit">
        <Produit cle={courante.produit.cle} />
        <span className="prix__etiquette">{ecrirePrix(courante.prix)}</span>
      </div>

      <div className="comptoir" role="group" aria-label="Ce que tu as posé">
        {posees.length === 0 ? (
          <p className="comptoir__vide">Pose ton argent ici</p>
        ) : (
          posees.map((c, i) => (
            <button
              // Des pièces identiques : la place est la seule identité.
              // eslint-disable-next-line react/no-array-index-key
              key={`${c}-${i}`}
              type="button"
              className="comptoir__piece"
              onClick={() => reprendre(i)}
              disabled={termine}
              aria-label={`Reprendre ${ecrirePiece(c)}`}
            >
              <Monnaie valeur={ecrirePiece(c)} genre="piece" />
            </button>
          ))
        )}
      </div>

      {resultat && !termine && (
        <p className="jeu__trop" role="status">{PHRASES_CE2[resultat]}</p>
      )}

      {termine ? (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="caisse__aide">{PHRASES_CE2.aide}</p>}
          <p className="jeu__gagne-calcul">
            {ecrirePrix(courante.prix)} = {prixEnMots(courante.prix)}
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      ) : (
        <>
          <div className="bourse" role="group" aria-label="Ton porte-monnaie">
            {MONNAIE_CE2.map((c) => (
              <button
                key={c}
                type="button"
                className={`bourse__piece${c < 100 ? ' bourse__piece--centimes' : ''}`}
                onClick={() => poser(c)}
                aria-label={`Poser ${ecrirePiece(c)}`}
              >
                <Monnaie valeur={ecrirePiece(c)} genre="piece" />
              </button>
            ))}
          </div>

          {posees.length > 0 && !resultat && (
            <button type="button" className="btn btn--principal" onClick={annoncer}>
              C’est payé&nbsp;!
            </button>
          )}
        </>
      )}
      <span className="visuellement-cache">Tu as posé {paye} centimes.</span>
    </div>
  );
}
