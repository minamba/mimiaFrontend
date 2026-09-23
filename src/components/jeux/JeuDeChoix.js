import { useCallback, useEffect, useMemo, useState } from 'react';
import { commun } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';

/**
 * L'ÉCRAN COMMUN DES JEUX « UNE QUESTION, DES CHOIX » — a ou à, les types de
 * phrases, la roue des verbes, contraires et jumeaux. Camara, le 21/09/2026 :
 * « code vraiment tout ». Quatre jeux qui ne diffèrent que par leur contenu
 * partagent donc un seul écran ; chacun lui confie sa RÈGLE (le module pur)
 * et la façon de montrer sa question.
 *
 * LA RÈGLE FOURNIT :
 *   serie(graine), MANCHES, bilan(n), consigne(m), choix(m) → [{ cle, libelle }],
 *   verdict(m, cle) → 'juste' ou le nom de l'erreur, erreur(m, sens) et
 *   aide(m) → des répliques { cle, texte }.
 *
 * LES RÈGLES DE TOUS LES JEUX VALENT ICI : un choix touché est une réponse ;
 * l'erreur se nomme et donne une méthode, jamais « raté » ; le choix faux
 * reste barré ; au bout de deux erreurs, on montre la réponse et on continue.
 */
export const ESSAIS_AVANT_AIDE = 2;

export default function JeuDeChoix({
  onQuitter, matiereCode, regle, classe, rendreQuestion, rendreApres,
}) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => regle.serie(graine), [regle, graine]);

  const [manche, setManche] = useState(0);
  const [fautes, setFautes] = useState([]);
  const [sens, setSens] = useState(null);
  const [trouve, setTrouve] = useState(false);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const montrer = !trouve && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = regle.consigne(courante);

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup, regle.MANCHES));
  }, [fini, duPremierCoup, dire, regle.MANCHES]);

  const choisir = useCallback((cle) => {
    if (termine) return;
    const s = regle.verdict(courante, cle);
    if (s === 'juste') {
      setTrouve(true);
      setSens(null);
      if (fautes.length === 0) setDuPremierCoup((n) => n + 1);
      dire(commun.bravo(manche));
      return;
    }
    const suivantes = [...fautes, cle];
    setFautes(suivantes);
    setSens(s);
    const aide = suivantes.length >= ESSAIS_AVANT_AIDE ? regle.aide(courante) : null;
    dire(aide ?? regle.erreur(courante, s));
  }, [termine, regle, courante, fautes, manche, dire]);

  const suivante = useCallback(() => {
    if (manche + 1 >= regle.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setSens(null);
    setTrouve(false);
  }, [manche, regle.MANCHES]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setSens(null);
    setTrouve(false);
    setDuPremierCoup(0);
    setFini(false);
  }, []);

  if (fini) {
    return (
      <div className="jeu jeu--fini">
        <p className="jeu__bilan-score">
          {duPremierCoup} <span>sur {regle.MANCHES}</span>
        </p>
        <p className="jeu__bilan-mot">{regle.bilan(duPremierCoup)}</p>

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

  const aide = montrer ? regle.aide(courante) : null;

  return (
    <div className={`jeu jeu--scene ${classe}`}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${regle.MANCHES}`}>
        {manches.map((m, i) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* Le dessin sait aussi ce qui vient d'être choisi : le robot, par
          exemple, rejoue le programme touché (Camara, 22/09/2026). */}
      {rendreQuestion(courante, termine, { derniereFaute: fautes[fautes.length - 1] ?? null, trouve, montrer })}

      {!termine && (
        <ul className="scene__choix" aria-label="Choisis ta réponse">
          {regle.choix(courante).map(({ cle, libelle }) => (
            <li key={cle}>
              <button
                type="button"
                className={`scene__carte${fautes.includes(cle) ? ' est-fausse' : ''}`}
                onClick={() => choisir(cle)}
                disabled={fautes.includes(cle)}
              >
                {libelle}
              </button>
            </li>
          ))}
        </ul>
      )}

      {sens && !termine && <p className="jeu__trop" role="status">{regle.erreur(courante, sens).texte}</p>}

      {termine && (
        <div className="jeu__gagne" role="status">
          {aide && <p className="scene__bulle">{aide.texte}</p>}
          {rendreApres ? rendreApres(courante) : null}
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
