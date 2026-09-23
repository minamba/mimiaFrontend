import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/Jeux/CP/balance.webp';
import {
  avecArticle, bilan, boiteDe, CUBES_MAX, etiquettePoids, grammesParCube, inclinaison, MANCHES, objet,
  PHRASES, PHRASES_CE1, resultat, resultatCE1, resultatCE2, serie, verdictGrammes, verdictPeser,
  verdictRanger,
} from '../../lib/jeux/balance';
import { commun, repliquesBalance } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';

/**
 * LA BALANCE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `balance.js`, y compris pourquoi on range au lieu
 * de demander « lequel est le plus lourd ? ».
 *
 * UNE MANCHE DE RANGEMENT A DEUX TEMPS, et c'est l'enfant qui passe de l'un
 * à l'autre :
 *
 *   1. PESER. Il touche un objet sur la table : il va sur la balance, à
 *      gauche puis à droite. Il touche un objet sur un plateau : il revient
 *      sur la table. Il pèse autant de paires qu'il veut.
 *
 *   2. RANGER. Il touche les objets du plus léger au plus lourd ; ils se
 *      posent dans trois cases. Une case touchée rend son objet. Il peut
 *      toujours revenir peser.
 *
 * AU MESURAGE, DEUX BOUTONS — poser un cube, en reprendre un — et l'annonce.
 * La balance bouge à chaque cube : c'est elle qui répond, pas le jeu.
 *
 * ON TOUCHE, ON NE GLISSE PAS — même raison que les autres jeux.
 *
 * LE DÉCOR EST UNE IMAGE, LA BALANCE EST DESSINÉE — la règle des autres
 * jeux. La terrasse libre au centre du décor porte la balance.
 *
 * AU CE1, LA BOÎTE DE POIDS remplace les cubes au mesurage : toucher un poids
 * de la boîte le pose sur le plateau, toucher un poids posé le range. La
 * boîte n'a que ses cinq poids — voir `balance.js`.
 */
export default function Balance({ onQuitter, matiereCode, niveau = 'CP' }) {
  // Au CE1 comme au CE2, on mesure avec des poids marqués ; seule la boîte
  // change. `ce1` veut donc dire ici « avec des poids », CE2 compris.
  const ce2 = niveau === 'CE2';
  const ce1 = niveau === 'CE1' || ce2;
  const BOITE_POIDS = boiteDe(niveau);
  const resultatPoids = ce2 ? resultatCE2 : resultatCE1;
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [phase, setPhase] = useState('peser');
  const [surBalance, setSurBalance] = useState([null, null]);
  const [rangement, setRangement] = useState([]);
  const [plein, setPlein] = useState(false);
  const [cubes, setCubes] = useState(0);
  // Au CE1 : les poids posés, par leur place dans la boîte (deux 200 g se
  // distinguent ainsi l'un de l'autre).
  const [poids, setPoids] = useState([]);
  const [annonce, setAnnonce] = useState(null);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const ranger = courante.mode === 'ranger';
  const juste = annonce?.sens === 'juste' || annonce === 'juste';

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;

  let laConsigne;
  if (!ranger) {
    laConsigne = ce1
      ? repliquesBalance.consignePeserCE1(courante.objet)
      : repliquesBalance.consignePeser(courante.objet);
  } else if (phase === 'ranger') laConsigne = repliquesBalance.consigneRanger;
  else laConsigne = repliquesBalance.consigneComparer;

  useEffect(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  // ---------------------------------------------------------- ranger

  const peserObjet = useCallback((cle) => {
    if (juste) return;
    setAnnonce(null);
    const [g, d] = surBalance;
    if (!g) setSurBalance([cle, d]);
    else if (!d) setSurBalance([g, cle]);
    else {
      setPlein(true);
      dire(repliquesBalance.plein);
      return;
    }
    setPlein(false);
  }, [juste, surBalance, dire]);

  const retirer = useCallback((cote) => {
    if (juste) return;
    setPlein(false);
    setSurBalance(([g, d]) => (cote === 'gauche' ? [null, d] : [g, null]));
  }, [juste]);

  const passerAuRangement = useCallback(() => {
    setSurBalance([null, null]);
    setPlein(false);
    setPhase('ranger');
  }, []);

  const revenirPeser = useCallback(() => {
    setRangement([]);
    setAnnonce(null);
    setPhase('peser');
  }, []);

  const placer = useCallback((cle) => {
    if (juste) return;
    setAnnonce(null);
    setRangement((r) => (r.length >= 3 ? r : [...r, cle]));
  }, [juste]);

  const deplacer = useCallback((i) => {
    if (juste) return;
    setAnnonce(null);
    setRangement((r) => r.filter((_, k) => k !== i));
  }, [juste]);

  const annoncerRangement = useCallback(() => {
    const v = verdictRanger(rangement);
    setAnnonce(v);
    if (v.sens === 'juste') dire(commun.bravo(manche));
    else {
      setPropre(false);
      dire(repliquesBalance.plusLourdQue(v.lourd, v.leger));
    }
  }, [rangement, manche, dire]);

  // ---------------------------------------------------------- mesurer

  const poser = useCallback((delta) => {
    if (juste) return;
    setAnnonce(null);
    setCubes((n) => Math.max(0, Math.min(CUBES_MAX, n + delta)));
  }, [juste]);

  const basculerPoids = useCallback((place) => {
    if (juste) return;
    setAnnonce(null);
    setPoids((p) => (p.includes(place) ? p.filter((x) => x !== place) : [...p, place]));
  }, [juste]);

  const grammesPoses = poids.reduce((somme, place) => somme + BOITE_POIDS[place], 0);

  const annoncerMesure = useCallback(() => {
    const s = ce1
      ? verdictGrammes(poids.map((place) => BOITE_POIDS[place]), courante.objet, niveau)
      : verdictPeser(cubes, courante.objet);
    setAnnonce(s);
    if (s === 'juste') {
      // Le bravo, puis la mesure dite en entier : « La pomme pèse 3 cubes. »
      dire([
        commun.bravo(manche),
        ce1 ? repliquesBalance.resultatPoids(courante.objet, niveau) : repliquesBalance.resultat(courante.objet),
      ]);
    } else {
      setPropre(false);
      dire(ce1 ? repliquesBalance.erreurCE1(s) : repliquesBalance.erreur(s));
    }
  }, [ce1, poids, cubes, courante.objet, manche, dire, niveau, BOITE_POIDS]);

  // ---------------------------------------------------------- la partie

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setPhase('peser');
    setSurBalance([null, null]);
    setRangement([]);
    setPlein(false);
    setCubes(0);
    setPoids([]);
    setAnnonce(null);
    setPropre(true);
  }, [manche, propre]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPhase('peser');
    setSurBalance([null, null]);
    setRangement([]);
    setPlein(false);
    setCubes(0);
    setPoids([]);
    setAnnonce(null);
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

  // Ce que montre la balance.
  let gauche = null;
  let droite = null;
  if (ranger) {
    gauche = surBalance[0] && objet(surBalance[0]);
    droite = surBalance[1] && objet(surBalance[1]);
  } else {
    gauche = objet(courante.objet);
  }
  let contrepoids = cubes;
  if (ranger) contrepoids = droite?.masse ?? 0;
  else if (ce1) contrepoids = grammesPoses / grammesParCube(niveau);
  const angle = inclinaison(gauche?.masse ?? 0, contrepoids);

  // Ce qui reste sur la table.
  const sorti = phase === 'peser' ? surBalance : rangement;
  const table = ranger ? courante.table.filter((c) => !sorti.includes(c)) : [];

  let message = null;
  if (annonce?.sens === 'inverse') message = repliquesBalance.plusLourdQue(annonce.lourd, annonce.leger).texte;
  else if (annonce === 'manque' || annonce === 'trop') message = (ce1 ? PHRASES_CE1 : PHRASES)[annonce];
  else if (plein) message = PHRASES.plein;

  return (
    <div className="jeu jeu--balance" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.mode}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {(!ranger || phase === 'peser') && (
        <Plateaux
          angle={angle}
          gauche={gauche}
          droite={droite}
          cubes={ranger || ce1 ? null : cubes}
          poids={!ranger && ce1 ? poids.map((place) => BOITE_POIDS[place]) : null}
          onRetirer={ranger && !juste ? retirer : null}
        />
      )}

      {ranger && phase === 'ranger' && (
        <ol className="balance__cases" aria-label="Du plus léger au plus lourd">
          {[0, 1, 2].map((i) => {
            const cle = rangement[i];
            return (
              <li key={i} className="balance__case-li">
                <button
                  type="button"
                  className={`balance__case${cle ? ' est-remplie' : ''}`}
                  onClick={() => cle && deplacer(i)}
                  disabled={!cle || juste}
                  aria-label={cle ? `Case ${i + 1} : ${avecArticle(objet(cle))}, la reprendre` : `Case ${i + 1}, vide`}
                >
                  {cle && <Vignette cle={cle} />}
                </button>
                <span className="balance__case-etiquette">
                  {i === 0 && 'le plus léger'}
                  {i === 2 && 'le plus lourd'}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {ranger && !juste && table.length > 0 && (
        <div className="balance__table" role="group" aria-label="Les objets sur la table">
          {table.map((cle) => (
            <button
              key={cle}
              type="button"
              className="balance__objet"
              onClick={() => (phase === 'peser' ? peserObjet(cle) : placer(cle))}
              aria-label={avecArticle(objet(cle))}
            >
              <Vignette cle={cle} />
            </button>
          ))}
        </div>
      )}

      {!ranger && !juste && ce1 && (
        <div className="balance__poids-zone">
          <div className="balance__boite" role="group" aria-label="La boîte de poids">
            {BOITE_POIDS.map((g, place) => (
              <button
                // Deux poids de même valeur : la place dans la boîte les distingue.
                // eslint-disable-next-line react/no-array-index-key
                key={place}
                type="button"
                className={`balance__poids balance__poids--${g}${poids.includes(place) ? ' est-pose' : ''}`}
                onClick={() => basculerPoids(place)}
                aria-pressed={poids.includes(place)}
                aria-label={poids.includes(place) ? `Reprendre ${g} grammes` : `Poser ${g} grammes`}
              >
                {etiquettePoids(g)}
              </button>
            ))}
          </div>
        </div>
      )}

      {!ranger && !juste && !ce1 && (
        <div className="balance__actions">
          <button type="button" className="balance__bouton" onClick={() => poser(1)} disabled={cubes >= CUBES_MAX}>
            <span className="balance__cube-icone" aria-hidden="true" />
            Poser un cube
          </button>
          <button type="button" className="balance__bouton" onClick={() => poser(-1)} disabled={cubes === 0}>
            Reprendre un cube
          </button>
        </div>
      )}

      {message && <p className="jeu__trop" role="status">{message}</p>}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">
            {ranger && 'Bien rangé !'}
            {!ranger && (ce1 ? resultatPoids(courante.objet) : resultat(courante.objet))}
          </p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {!juste && (
        <div className="balance__actions">
          {ranger && phase === 'peser' && (
            <button type="button" className="btn btn--principal" onClick={passerAuRangement}>
              J’ai pesé, je range
            </button>
          )}
          {ranger && phase === 'ranger' && (
            <button type="button" className="balance__bouton" onClick={revenirPeser}>
              Peser encore
            </button>
          )}
          {ranger && phase === 'ranger' && rangement.length === 3 && (
            <button type="button" className="btn btn--principal" onClick={annoncerRangement}>
              C’est prêt&nbsp;!
            </button>
          )}
          {!ranger && (ce1 ? poids.length > 0 : cubes > 0) && (
            <button type="button" className="btn btn--principal" onClick={annoncerMesure}>
              C’est prêt&nbsp;!
            </button>
          )}
        </div>
      )}

    </div>
  );
}

// ------------------------------------------------------------- le dessin

const PIVOT = { x: 160, y: 58 };
const BRAS = 108;
const SUSPENTE = 52;

/** Le point où pend un plateau, au bout du fléau incliné. */
function bout(cote, angle) {
  const a = (angle * Math.PI) / 180;
  const s = cote === 'gauche' ? -1 : 1;
  return { x: PIVOT.x + s * BRAS * Math.cos(a), y: PIVOT.y + s * BRAS * Math.sin(a) };
}

/**
 * LA BALANCE : un fléau qui penche, deux plateaux qui restent à plat. Au
 * rangement, un objet posé sur un plateau est un bouton qui le rend à la
 * table.
 */
function Plateaux({
  angle, gauche, droite, cubes, poids, onRetirer,
}) {
  const g = bout('gauche', angle);
  const d = bout('droite', angle);
  const pg = { x: g.x, y: g.y + SUSPENTE };
  const pd = { x: d.x, y: d.y + SUSPENTE };

  const cibles = [
    ...(gauche ? [{ o: gauche, p: pg, cote: 'gauche' }] : []),
    ...(droite ? [{ o: droite, p: pd, cote: 'droite' }] : []),
  ];

  return (
    <div className="balance">
      <svg viewBox="0 0 320 240" role="img" aria-label={libelle(angle, gauche, droite, cubes, poids)}>
        <path className="balance__pied" d="M122 228 h76 l-14 -16 h-48 Z" />
        <rect className="balance__colonne" x="155" y={PIVOT.y} width="10" height="156" rx="4" />

        {[g, d].map((p, i) => (
          <g key={i} className="balance__cote" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
            <line className="balance__fil" x1="0" y1="0" x2="-34" y2={SUSPENTE} />
            <line className="balance__fil" x1="0" y1="0" x2="34" y2={SUSPENTE} />
            <path className="balance__plateau" d={`M-46 ${SUSPENTE} Q0 ${SUSPENTE + 16} 46 ${SUSPENTE} Z`} />
          </g>
        ))}

        <g className="balance__fleau" style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${PIVOT.x}px ${PIVOT.y}px` }}>
          <rect x={PIVOT.x - BRAS - 4} y={PIVOT.y - 4} width={2 * BRAS + 8} height="8" rx="4" />
        </g>
        <circle className="balance__axe" cx={PIVOT.x} cy={PIVOT.y} r="8" />

        <g className="balance__cote" style={{ transform: `translate(${pg.x}px, ${pg.y}px)` }}>
          {gauche && <Objet cle={gauche.cle} taille={gauche.taille} />}
        </g>
        <g className="balance__cote" style={{ transform: `translate(${pd.x}px, ${pd.y}px)` }}>
          {droite && <Objet cle={droite.cle} taille={droite.taille} />}
          {cubes !== null && <Cubes nombre={cubes} />}
          {poids && <Poids valeurs={poids} />}
        </g>
      </svg>

      {onRetirer && cibles.map(({ o, p, cote }) => (
        <button
          key={cote}
          type="button"
          className="balance__cible"
          style={{ left: `${(p.x / 320) * 100}%`, top: `${((p.y - 24) / 240) * 100}%` }}
          onClick={() => onRetirer(cote)}
          aria-label={`Reprendre ${avecArticle(o)}`}
        />
      ))}
    </div>
  );
}

function libelle(angle, gauche, droite, cubes, poids) {
  const bas = angle === 0 ? null : angle > 0 ? 'droite' : 'gauche';
  const g = gauche ? gauche.nom : 'rien';
  let d = droite ? droite.nom : 'rien';
  if (cubes !== null) d = `${cubes} cube${cubes > 1 ? 's' : ''}`;
  if (poids) d = `${poids.reduce((a, b) => a + b, 0)} grammes`;
  return `Balance : ${g} à gauche, ${d} à droite. ${bas ? `Le plateau de ${bas} descend.` : 'La balance est droite.'}`;
}

/**
 * UN OBJET HORS DE LA BALANCE, à sa taille relative : sur la table comme dans
 * les cases, le ballon reste le plus gros. C'est ce qui garde le piège.
 */
function Vignette({ cle }) {
  const { taille } = objet(cle);
  return (
    <svg className="balance__vignette" viewBox="-31 -64 62 67" aria-hidden="true">
      <Objet cle={cle} taille={taille} />
    </svg>
  );
}

/** Les cubes posés, en pile de quatre par rang. */
function Cubes({ nombre }) {
  return (
    <g>
      {Array.from({ length: nombre }, (_, i) => {
        const rang = Math.floor(i / 4);
        const dans = i % 4;
        const parRang = Math.min(4, nombre - rang * 4);
        const x = (dans - (parRang - 1) / 2) * 17;
        return (
          <g key={i} transform={`translate(${x} ${-8 - rang * 16})`}>
            <rect className="balance__cube" x="-8" y="-8" width="16" height="16" rx="2.5" />
            <rect className="balance__cube-reflet" x="-5.5" y="-5.5" width="6" height="4" rx="1" />
          </g>
        );
      })}
    </g>
  );
}

/**
 * LES POIDS POSÉS, côte à côte : plus un poids est lourd, plus il est gros,
 * comme les poids de laiton de la classe — et chacun porte sa valeur.
 */
function Poids({ valeurs }) {
  const largeurs = valeurs.map((g) => {
    if (g >= 1000) return 36;
    if (g >= 500) return 30;
    return g >= 200 ? 24 : 18;
  });
  const total = largeurs.reduce((a, b) => a + b + 3, -3);
  let x = -total / 2;
  return (
    <g>
      {valeurs.map((g, i) => {
        const l = largeurs[i];
        const h = l;
        const centre = x + l / 2;
        x += l + 3;
        return (
          // Des poids de même valeur se ressemblent : la place est l'identité.
          // eslint-disable-next-line react/no-array-index-key
          <g key={i} transform={`translate(${centre} 0)`}>
            <rect className="balance__poids-corps" x={-l / 2} y={-h} width={l} height={h} rx="3" />
            <rect className="balance__poids-bouton" x={-l / 6} y={-h - 5} width={l / 3} height="6" rx="2" />
            <text className="balance__poids-valeur" x="0" y={-h / 2 + 3} textAnchor="middle">{g >= 1000 ? '1 kg' : g}</text>
          </g>
        );
      })}
    </g>
  );
}

/** Un objet posé : dessiné le bas à 0, à l'échelle de sa taille. */
function Objet({ cle, taille }) {
  return (
    <g transform={`scale(${taille})`}>
      {DESSINS[cle]}
    </g>
  );
}

const DESSINS = {
  ballon: (
    <g>
      <circle cx="0" cy="-24" r="24" fill="#3a86d4" />
      <path d="M-10 -40 Q-2 -46 8 -42" stroke="#bfe0ff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-4 -1 L0 -4 L4 -1 Z" fill="#2a6aae" />
    </g>
  ),
  balle: (
    <g>
      <circle cx="0" cy="-20" r="20" fill="#c9df3b" />
      <path d="M-18 -30 Q-4 -20 -18 -10" stroke="#fff" strokeWidth="3" fill="none" />
      <path d="M18 -30 Q4 -20 18 -10" stroke="#fff" strokeWidth="3" fill="none" />
    </g>
  ),
  pomme: (
    <g>
      <path d="M0 -38 C-26 -46 -30 -8 -12 -1 C-6 1 -3 -2 0 -2 C3 -2 6 1 12 -1 C30 -8 26 -46 0 -38 Z" fill="#e0443a" />
      <path d="M0 -38 Q2 -46 5 -50" stroke="#6b4a2a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M4 -44 Q14 -52 20 -44 Q12 -40 4 -44 Z" fill="#4aa34d" />
    </g>
  ),
  conserve: (
    <g>
      <rect x="-18" y="-44" width="36" height="44" rx="3" fill="#aeb8c4" />
      <rect x="-18" y="-32" width="36" height="20" fill="#e76f51" />
      <ellipse cx="0" cy="-44" rx="18" ry="4" fill="#cfd7e0" />
    </g>
  ),
  livre: (
    <g>
      <rect x="-26" y="-18" width="52" height="18" rx="2" fill="#2f5fa8" />
      <rect x="-22" y="-14" width="46" height="10" fill="#fdf6e7" />
      <rect x="-26" y="-18" width="6" height="18" rx="2" fill="#244a85" />
    </g>
  ),
  // UN GALET, PAS UN DÔME : arrondi de partout, une ombre dessous, des
  // mouchetures. À plat sur son dessous, il ressemblait à une tache grise.
  caillou: (
    <g>
      <path d="M-24 -6 C-28 -22 -12 -36 4 -34 C22 -32 30 -18 24 -6 C20 2 -18 3 -24 -6 Z" fill="#7d8591" />
      <path d="M-22 -8 C-12 0 14 0 22 -8 C18 -1 -16 1 -22 -8 Z" fill="#5f6672" />
      <path d="M-10 -26 Q0 -31 10 -27" stroke="#b3bbc6" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="-9" cy="-14" r="2" fill="#636a75" />
      <circle cx="8" cy="-17" r="1.6" fill="#636a75" />
      <circle cx="2" cy="-9" r="1.4" fill="#636a75" />
    </g>
  ),
};
