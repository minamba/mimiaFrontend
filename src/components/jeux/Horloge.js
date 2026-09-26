import { useCallback, useEffect, useMemo, useState } from 'react';
import decor from '../../assets/Jeux/CP/horloge.webp';
import {
  bilan, ecrire, estDemie, MANCHES, PHRASES, serie, verdictLecture, verdictReglage,
} from '../../lib/jeux/horloge';
import { commun, repliquesHorloge } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * L'HORLOGE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `horloge.js`, y compris pourquoi « 12 heures » est
 * toujours proposé à la lecture.
 *
 * RÉGLER, C'EST DEUX GESTES : choisir une aiguille, puis toucher le nombre où
 * la poser. On ne fait pas tourner une aiguille au doigt — le glisser échoue
 * sur un trackpad et reste inaccessible au clavier, même raison que les
 * autres jeux. Choisir l'aiguille AVANT est justement la compétence : savoir
 * laquelle des deux donne l'heure.
 *
 * LES AIGUILLES S'ARRÊTENT AVANT LES NOMBRES : la grande passait sur le 12
 * et le 9, et un enfant qui doit lire le nombre montré ne doit pas le
 * trouver barré.
 *
 * LES DEUX AIGUILLES NE SE DISTINGUENT PAS QUE PAR LA COULEUR : la petite est
 * courte et épaisse, la grande longue et fine, comme sur une vraie horloge.
 * La couleur aide, elle ne porte pas seule la différence.
 *
 * LE DÉCOR EST UNE IMAGE, L'HORLOGE EST DESSINÉE — la règle des autres jeux.
 * Le mur du décor est libre au centre, et c'est là que se pose le cadran.
 * L'horloge murale peinte à droite montre 10 h 10 : elle n'est pas une
 * heure juste, et ne peut donc jamais souffler la réponse d'une manche.
 *
 * AU CE1, LES AIGUILLES SONT LIÉES COMME SUR UNE VRAIE HORLOGE : l'enfant pose
 * la petite sur le 3 et la grande sur le 6, et la petite glisse d'elle-même à
 * mi-chemin du 4. Il voit ce qu'il lira ensuite : à la demie, la petite est
 * ENTRE deux nombres. Au CP, elles restent indépendantes — la grande part
 * n'importe où, et une petite qui se décalerait avec elle troublerait un
 * enfant qui apprend à la poser sur un nombre.
 */
export default function Horloge({ onQuitter, matiereCode, niveau = 'CP' }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine, MANCHES, niveau), [graine, niveau]);
  const ce1 = niveau === 'CE1';

  const [manche, setManche] = useState(0);
  const [reponse, setReponse] = useState(null);
  const [aiguilles, setAiguilles] = useState(() => manches[0].depart ?? null);
  const [choisie, setChoisie] = useState(null);
  const [annonce, setAnnonce] = useState(null);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);

  const courante = manches[manche];
  const lecture = courante.mode === 'lecture';
  const sens = lecture
    ? (reponse === null ? null : verdictLecture(reponse, courante.heure))
    : annonce;
  const juste = sens === 'juste';

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = lecture
    ? repliquesHorloge.consigneLecture
    : repliquesHorloge.consigneReglage(courante.heure);

  // CE QUE DIT NORA EN DÉBUT DE MANCHE : la consigne, puis, à la lecture,
  // les quatre réponses une à une — le bouton nommé s'éclaire —, et au
  // réglage, l'indice qui dit comment s'y prendre. Un CP ne lit ni les
  // réponses ni l'indice : sans la voix, ils ne lui disent rien.
  const aDire = lecture
    ? [laConsigne, ...courante.choix.map(repliquesHorloge.heure)]
    : [laConsigne, repliquesHorloge.indice];

  useEffect(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  const repondre = useCallback((s) => {
    if (s === 'juste') dire(commun.bravo(manche));
    else {
      setPropre(false);
      dire(repliquesHorloge.erreur(s));
    }
  }, [manche, dire]);

  const lire = useCallback((heure) => {
    if (juste) return;
    setReponse(heure);
    repondre(verdictLecture(heure, courante.heure));
  }, [juste, courante.heure, repondre]);

  const poser = useCallback((nombre) => {
    if (juste || !choisie) return;
    setAnnonce(null);
    setAiguilles((a) => ({ ...a, [choisie]: nombre }));
  }, [juste, choisie]);

  const annoncer = useCallback(() => {
    const s = verdictReglage(aiguilles, courante.heure);
    setAnnonce(s);
    repondre(s);
  }, [aiguilles, courante.heure, repondre]);

  const suivante = useCallback(() => {
    if (propre) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setReponse(null);
    setAiguilles(manches[manche + 1].depart ?? null);
    setChoisie(null);
    setAnnonce(null);
    setPropre(true);
  }, [manche, manches, propre]);

  const rejouer = useCallback(() => {
    const g = Date.now();
    setGraine(g);
    setManche(0);
    setReponse(null);
    setAiguilles(serie(g, MANCHES, niveau)[0].depart ?? null);
    setChoisie(null);
    setAnnonce(null);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
  }, [niveau]);

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

  // Ce que montre le cadran. À la lecture, la petite est sur l'heure — ou
  // entre deux nombres à la demie ; au réglage CE1, elle suit la grande.
  let montre = aiguilles;
  if (lecture) montre = { petite: courante.heure, grande: estDemie(courante.heure) ? 6 : 12 };
  else if (ce1) montre = { ...aiguilles, petite: aiguilles.petite + (aiguilles.grande % 12) / 12 };
  const bouge = !lecture && (aiguilles.petite !== courante.depart.petite
    || aiguilles.grande !== courante.depart.grande);

  return (
    <div className="jeu jeu--horloge" style={{ backgroundImage: `url(${decor})` }}>
      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>

      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.heure}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {/* CE QU'ON MONTRE, PAS CE QU'ON DIT. La consigne de réglage porte les
            deux : « 9 heures » à l'écran, « neuf heures » dans la voix, pour
            la liaison — voir `horloge.dire`. */}
        {laConsigne.ecrit ?? laConsigne.texte}
        <BoutonsVoix voix={voix} consigne={aDire} />
      </p>

      <Cadran
        aiguilles={montre}
        choisie={lecture ? null : choisie}
        onPoser={lecture || juste ? null : poser}
        heureDite={lecture ? null : courante.heure}
      />

      {!lecture && !juste && (
        <div className="horloge__outils" role="group" aria-label="Choisis une aiguille">
          {['petite', 'grande'].map((a) => (
            <button
              key={a}
              type="button"
              className={`horloge__outil horloge__outil--${a}`}
              aria-pressed={choisie === a}
              onClick={() => setChoisie(a)}
            >
              <svg viewBox="0 0 40 16" aria-hidden="true">
                <rect x="2" y={a === 'petite' ? 4 : 6} width={a === 'petite' ? 24 : 36} height={a === 'petite' ? 8 : 4} rx="3" />
              </svg>
              {a === 'petite' ? 'Petite aiguille' : 'Grande aiguille'}
            </button>
          ))}
        </div>
      )}

      {!lecture && !juste && !choisie && (
        <p className="horloge__indice">{PHRASES.indice}</p>
      )}

      {lecture && !juste && (
        <div className="horloge__reponses" role="group" aria-label="Choisis l’heure">
          {courante.choix.map((h) => (
            <button
              key={h}
              type="button"
              className={`horloge__reponse${reponse === h ? ' est-refusee' : ''}${voix.enCours === repliquesHorloge.heure(h).cle ? ' est-lue' : ''}`}
              onClick={() => lire(h)}
            >
              {ecrire(h)}
            </button>
          ))}
        </div>
      )}

      {sens && !juste && <p className="jeu__trop" role="status">{PHRASES[CLE_PHRASE[sens]]}</p>}

      {juste ? (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">{ecrire(courante.heure)}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      ) : (!lecture && bouge && (
        <button type="button" className="btn btn--principal" onClick={annoncer}>
          C’est prêt&nbsp;!
        </button>
      ))}

    </div>
  );
}

/** Le verdict, vers la phrase qui le dit. */
const CLE_PHRASE = {
  aiguilles: 'aiguilles',
  'plus-tard': 'plusTard',
  'plus-tot': 'plusTot',
  inversees: 'inversees',
  grande: 'grande',
  petite: 'petite',
  demie: 'demie',
  entre: 'entre',
  pleine: 'pleine',
  'grande-demie': 'grandeDemie',
};

/**
 * LE CADRAN : douze nombres, deux aiguilles. Au réglage, chaque nombre est un
 * bouton — posé en HTML par-dessus le dessin, pour qu'il soit une vraie cible
 * au clavier et au lecteur d'écran.
 */
function Cadran({
  aiguilles, choisie, onPoser, heureDite,
}) {
  const nombres = Array.from({ length: 12 }, (_, i) => i + 1);
  const position = (n, rayon) => {
    const a = (n / 12) * 2 * Math.PI;
    return { x: 100 + rayon * Math.sin(a), y: 100 - rayon * Math.cos(a) };
  };
  const angle = (n) => (n % 12) * 30;

  const libelle = heureDite
    ? `Horloge : la petite aiguille est sur le ${Math.floor(aiguilles.petite)}, la grande sur le ${aiguilles.grande}`
    : 'Horloge';

  return (
    <div className="cadran">
      <svg viewBox="0 0 200 200" role="img" aria-label={libelle}>
        <circle className="cadran__fond" cx="100" cy="100" r="96" />
        <circle className="cadran__bord" cx="100" cy="100" r="96" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * 2 * Math.PI;
          const long = i % 5 === 0;
          const r1 = long ? 86 : 89;
          return (
            <line
              key={i}
              className={long ? 'cadran__trait cadran__trait--heure' : 'cadran__trait'}
              x1={100 + r1 * Math.sin(a)}
              y1={100 - r1 * Math.cos(a)}
              x2={100 + 92 * Math.sin(a)}
              y2={100 - 92 * Math.cos(a)}
            />
          );
        })}
        {!onPoser && nombres.map((n) => {
          const p = position(n, 72);
          return (
            <text key={n} className="cadran__nombre" x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central">
              {n}
            </text>
          );
        })}

        <line
          className={`cadran__aiguille cadran__aiguille--grande${choisie === 'grande' ? ' est-choisie' : ''}`}
          x1="100" y1="100" x2="100" y2="42"
          transform={`rotate(${angle(aiguilles.grande)} 100 100)`}
        />
        <line
          className={`cadran__aiguille cadran__aiguille--petite${choisie === 'petite' ? ' est-choisie' : ''}`}
          x1="100" y1="100" x2="100" y2="62"
          transform={`rotate(${angle(aiguilles.petite)} 100 100)`}
        />
        <circle className="cadran__axe" cx="100" cy="100" r="7" />
      </svg>

      {onPoser && nombres.map((n) => {
        const p = position(n, 72);
        return (
          <button
            key={n}
            type="button"
            className="cadran__cible"
            style={{ left: `${p.x / 2}%`, top: `${p.y / 2}%` }}
            onClick={() => onPoser(n)}
            aria-label={`Le ${n}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
