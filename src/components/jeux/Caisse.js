import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/marchande.webp';
import {
  bilan, ESSAIS_AVANT_AIDE, MANCHES, MONNAIE, PHRASES_CE1, serieCE1, somme, verdict,
} from '../../lib/jeux/marchande';
import { commun, repliquesMarchande } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import { Monnaie, Produit } from './Etal';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * LA CAISSE — la marchande du CE1, à l'écran.
 *
 * Toute la règle vit dans `marchande.js`, section « le CE1 ».
 *
 * MÊME DÉCOR, MÊMES PIÈCES, MÊME GESTE QUE LE CP : poser une pièce sur le
 * comptoir, la reprendre d'un clic. Ce qui change est le sens : l'argent va
 * cette fois de l'enfant vers le client, et il l'annonce quand il a fini.
 *
 * LE PRIX N'EST PAS ÉCRIT : le calculer est la première moitié de la
 * compétence. Chaque produit porte son prix à l'unité, comme l'ardoise du
 * stand, et il est dessiné autant de fois qu'on l'achète.
 */
export default function Caisse({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serieCE1(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [posees, setPosees] = useState([]);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const rendu = somme(posees);
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesMarchande.consigneCE1(courante.lignes);
  const aDire = [laConsigne, repliquesMarchande.rendre];

  useEffect(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const poser = useCallback((valeur) => {
    if (termine) return;
    setResultat(null);
    setPosees((p) => [...p, valeur]);
  }, [termine]);

  const reprendre = useCallback((index) => {
    if (termine) return;
    setResultat(null);
    setPosees((p) => p.filter((_, i) => i !== index));
  }, [termine]);

  const annoncer = useCallback(() => {
    const r = verdict(posees, courante.rendu);
    setResultat(r);
    if (r === 'juste') {
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    if (suivantes >= ESSAIS_AVANT_AIDE) dire(repliquesMarchande.aideRendu);
    else dire(r === 'trop' ? repliquesMarchande.rendTrop : repliquesMarchande.rendPasAssez);
  }, [posees, courante.rendu, manche, ratees, dire]);

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
      <FinDePartie
        score={duPremierCoup}
        total={MANCHES}
        mot={bilan(duPremierCoup)}
        onRejouer={rejouer}
        onQuitter={onQuitter}
      />
    );
  }

  // Le calcul du prix, écrit comme on le pose : « 2 + 2 + 3 = 7 € ».
  const calculPrix = courante.lignes
    .flatMap((l) => Array.from({ length: l.quantite }, () => l.produit.prix))
    .join(' + ');

  return (
    <div className="jeu jeu--marche jeu--caisse" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.total}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte} {PHRASES_CE1.rendre}
        <BoutonsVoix voix={voix} consigne={aDire} />
      </p>

      <div className="caisse__vente">
        {/* LA COMMANDE : chaque produit autant de fois qu'on l'achète, avec son
            prix à l'unité. Le total n'est pas écrit — le calculer est le jeu. */}
        <ul className="etal" aria-label="Ce que le client achète">
          {courante.lignes.map((l) => (
            <li key={l.produit.cle} className="etal__article">
              <span className="caisse__produits">
                {Array.from({ length: l.quantite }, (_, i) => (
                  // Des copies du même produit : la place est la seule identité.
                  // eslint-disable-next-line react/no-array-index-key
                  <Produit key={i} cle={l.produit.cle} />
                ))}
              </span>
              <span className="etal__prix">{l.produit.prix} € l’une</span>
            </li>
          ))}
        </ul>

        {/* LE BILLET DU CLIENT, posé à côté : c'est de lui qu'on part. */}
        <div className="caisse__billet" aria-label={`Le client te donne ${courante.billet} euros`}>
          <span className="caisse__legende">Le client te donne</span>
          <Monnaie valeur={courante.billet} genre="billet" />
        </div>
      </div>

      {/* LE COMPTOIR : la monnaie que l'enfant rend. */}
      <div className="comptoir" role="group" aria-label={`Tu rends ${rendu} euros`}>
        {posees.length === 0 ? (
          <p className="comptoir__vide">Pose la monnaie à rendre ici</p>
        ) : (
          posees.map((valeur, i) => (
            <button
              key={`${valeur}-${i}`}
              type="button"
              className="comptoir__piece"
              onClick={() => reprendre(i)}
              disabled={termine}
              aria-label={`Reprendre ${valeur} euro${valeur > 1 ? 's' : ''}`}
            >
              <Monnaie valeur={valeur} genre={valeur === 5 ? 'billet' : 'piece'} />
            </button>
          ))
        )}
      </div>

      {resultat && !termine && (
        <p className="jeu__trop" role="status">
          {resultat === 'trop' ? PHRASES_CE1.trop : PHRASES_CE1.pasAssez}
        </p>
      )}

      {termine ? (
        <div className="jeu__gagne" role="status">
          {montrer && <p className="caisse__aide">{PHRASES_CE1.aide}</p>}
          <p className="jeu__gagne-calcul">
            {calculPrix} = {courante.total} €
            <br />
            {courante.billet} − {courante.total} = {courante.rendu} €
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      ) : (
        <>
          <div className="bourse" role="group" aria-label="Ta caisse">
            {MONNAIE.map(({ valeur, genre }) => (
              <button
                key={valeur}
                type="button"
                className="bourse__piece"
                onClick={() => poser(valeur)}
                aria-label={`Rendre ${valeur} euro${valeur > 1 ? 's' : ''}`}
              >
                <Monnaie valeur={valeur} genre={genre} />
              </button>
            ))}
          </div>

          {posees.length > 0 && !resultat && (
            <button type="button" className="btn btn--principal" onClick={annoncer}>
              C’est rendu&nbsp;!
            </button>
          )}
        </>
      )}
    </div>
  );
}
