import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, ESSAIS_AVANT_AIDE, MANCHES, mot, PHRASES, serie, SYLLABES_PARLANTES, verdict,
} from '../../lib/jeux/atelierDesSyllabes';
import { commun, repliquesSyllabes } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import decor from '../../assets/Jeux/CP/syllabe.webp';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * L'ATELIER DES SYLLABES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `atelierDesSyllabes.js`, y compris pourquoi les
 * étiquettes ne parlent qu'après deux erreurs, et pourquoi « Écoute en
 * syllabes » ne donne pas la réponse.
 *
 * TOUCHER UNE ÉTIQUETTE LA MONTE DANS LE PREMIER WAGON VIDE ; toucher un
 * wagon plein la fait redescendre. Pas de glisser-déposer : sur une tablette,
 * un doigt de six ans lâche l'étiquette en route.
 *
 * L'ENFANT REMPLIT, PUIS ANNONCE — la leçon des paquets de dix : le train
 * plein ne se juge pas tout seul, sinon il suffirait d'essayer toutes les
 * étiquettes jusqu'à ce que le jeu s'allume.
 *
 * LE DÉCOR EST UN STUDIO : le train roule sur le parquet, devant le grand
 * mur clair du milieu.
 */
export default function AtelierDesSyllabes({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [poses, setPoses] = useState([]);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const leMot = mot(courante.mot);
  const wagons = leMot.syllabes.length;
  const juste = resultat?.sens === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  // Après deux erreurs, les étiquettes parlent — voir la note du module.
  const parlantes = !termine && ratees >= SYLLABES_PARLANTES;

  // Ce que porte chaque wagon : l'étiquette posée, ou rien.
  const dansWagons = Array.from({ length: wagons }, (_, i) => {
    const id = poses[i];
    return id === undefined || id === null ? null : courante.etiquettes.find((e) => e.id === id);
  });
  const plein = dansWagons.every(Boolean);

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const leMotDit = repliquesSyllabes.mot(courante.mot);
  const aDire = [repliquesSyllabes.consigne, leMotDit];
  // Le mot syllabe par syllabe : « mou… ton ».
  const enSyllabes = leMot.syllabes.map(repliquesSyllabes.son);

  useEffect(() => {
    if (!fini) dire(manche === 0 ? aDire : leMotDit);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leMotDit.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const monter = useCallback((id) => {
    if (termine) return;
    setResultat(null);
    setPoses((p) => {
      const suivant = [...p];
      const libre = Array.from({ length: wagons }, (_, i) => i).find((i) => suivant[i] == null);
      if (libre === undefined) return p;
      suivant[libre] = id;
      return suivant;
    });
  }, [termine, wagons]);

  const descendre = useCallback((i) => {
    if (termine) return;
    setResultat(null);
    setPoses((p) => {
      const suivant = [...p];
      suivant[i] = null;
      return suivant;
    });
  }, [termine]);

  const annoncer = useCallback(() => {
    const r = verdict(dansWagons.map((e) => e.texte), courante.mot);
    if (r.sens === 'juste') {
      dire([commun.bravo(manche), leMotDit]);
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      // La deuxième erreur ouvre les haut-parleurs des étiquettes : Adrien le dit.
      const ouvre = suivantes === SYLLABES_PARLANTES ? [repliquesSyllabes.sonsOuverts] : [];
      if (suivantes >= ESSAIS_AVANT_AIDE) dire([repliquesSyllabes.aide, leMotDit]);
      else if (r.sens === 'ordre') dire([repliquesSyllabes.ordre, leMotDit, ...ouvre]);
      else dire([repliquesSyllabes.faux(r.erreurs.length), leMotDit, ...ouvre]);
    }
    setResultat(r);
  }, [dansWagons, courante.mot, manche, ratees, dire, leMotDit]);

  const suivante = useCallback(() => {
    if (propre && juste) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setPoses([]);
    setResultat(null);
    setRatees(0);
    setPropre(true);
  }, [manche, propre, juste]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPoses([]);
    setResultat(null);
    setRatees(0);
    setPropre(true);
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

  let message = null;
  if (resultat?.sens === 'ordre' && !montrer) message = PHRASES.ordre;
  else if (resultat?.sens === 'faux' && !montrer) {
    message = resultat.erreurs.length > 1 ? PHRASES.fauxPluriel : PHRASES.faux;
  }

  // Après trois essais, le train montre la bonne réponse, wagon par wagon.
  const affiche = montrer ? leMot.syllabes : dansWagons.map((e) => e?.texte ?? null);

  return (
    <div className="jeu jeu--syllabes" style={{ backgroundImage: `url(${decor})` }}>
      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.mot}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {PHRASES.consigne}
        <BoutonsVoix voix={voix} consigne={aDire} />
      </p>

      {/* L'IMAGE DU MOT, et de quoi le réentendre : c'est le modèle sonore. */}
      <div className="syllabes__modele">
        <span className="syllabes__image" role="img" aria-label={leMot.mot}>{leMot.image}</span>
        <button
          type="button"
          className="syllabes__ecouter"
          onClick={() => voix.reecouter(leMotDit)}
          aria-label="Réécouter le mot"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            <path d="M16 8.5a4.5 4.5 0 0 1 0 7" className="voix-jeu__onde" />
          </svg>
        </button>
      </div>

      {/* LE MOT EN SYLLABES : « mou… ton », comme on frappe dans ses mains. */}
      {!termine && (
        <button type="button" className="syllabes__en-syllabes" onClick={() => dire(enSyllabes)}>
          <span className="syllabes__mains" aria-hidden="true">👏</span>
          Écoute en syllabes
        </button>
      )}

      <ol className="syllabes__train" aria-label="Le train des syllabes">
        <li className="syllabes__loco" aria-hidden="true">
          <span className="syllabes__cheminee" />
        </li>
        {affiche.map((texte, i) => {
          const fautif = resultat?.sens === 'faux' && resultat.erreurs.includes(i) && !montrer;
          return (
            // Un wagon par syllabe, et l'ordre compte : la clé est la place.
            // eslint-disable-next-line react/no-array-index-key
            <li key={i} className="syllabes__place">
              <button
                type="button"
                className={`syllabes__wagon${texte ? ' est-plein' : ''}${fautif ? ' est-fautif' : ''}${juste || montrer ? ' est-juste' : ''}`}
                onClick={() => descendre(i)}
                disabled={!texte || termine}
                aria-label={texte ? `Wagon ${i + 1} : ${texte}` : `Wagon ${i + 1}, vide`}
              >
                {texte}
              </button>
            </li>
          );
        })}
      </ol>

      {juste && <p className="syllabes__mot-lu">{leMot.mot}</p>}

      <ul className="syllabes__etiquettes" aria-label="Les syllabes">
        {courante.etiquettes.map((e) => {
          const posee = poses.includes(e.id);
          return (
            <li key={e.id} className="syllabes__place-etiquette">
              <button
                type="button"
                className={`syllabes__etiquette${posee ? ' est-posee' : ''}`}
                onClick={() => monter(e.id)}
                disabled={posee || termine || plein}
                aria-label={posee ? `${e.texte}, dans un wagon` : e.texte}
              >
                {e.texte}
              </button>
              {/* Le haut-parleur : il fait dire la syllabe, il ne la pose pas. */}
              {parlantes && (
                <button
                  type="button"
                  className="syllabes__son"
                  onClick={() => dire(repliquesSyllabes.son(e.texte))}
                  aria-label={`Écouter « ${e.texte} »`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
                    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {message && <p className="jeu__trop" role="status">{message}</p>}

      {montrer && (
        <div className="jeu__gagne" role="status">
          <p className="syllabes__aide">{PHRASES.aide}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">Bien lu&nbsp;!</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {/* Après une erreur, le bouton attend qu'un wagon change : réannoncer
          le même train compterait un essai pour rien. */}
      {!termine && plein && !resultat && (
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
