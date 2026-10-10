import { classeQuestion } from '../base';
import {
  Etapes, Explication, ecrireDuree, ecrireNombre, lireDuree, lireNombre,
} from './outils';

/**
 * LA GARE AU COUCHER DU SOLEIL — « Combien de temps », 6e (09/10/2026). La
 * couverture : un quai de gare au crépuscule, de grandes horloges sous la
 * marquise, des lanternes, des rails qui filent vers les montagnes. La scène :
 *   - LA QUESTION : le tableau des départs, lettres ambrées sur fond noir ;
 *     l'horloge du quai donne l'heure de départ (celle de la question), sa
 *     trotteuse tourne, les lanternes s'allument ;
 *   - LES RÉPONSES : trois billets de train, un par voie — on composte le bon ;
 *   - APRÈS LA RÉPONSE : le train part. Il roule sur la frise des rails,
 *     gare après gare : jusqu'à l'heure pile, puis les heures entières, puis
 *     les minutes qui restent ; l'horloge avance avec lui jusqu'à l'arrivée.
 */
const P = 'sc-combien-de-temps-college';

const heure = (mn) => ecrireDuree(mn, { heure: true });

function lire(m) {
  const q = m.question;
  let r = /Départ\s+(\d+\s*h\s*\d+),\s*arrivée\s+(\d+\s*h\s*\d+)/.exec(q);
  if (r) return { sorte: 'entre', depart: lireDuree(r[1]), arrivee: lireDuree(r[2]) };
  r = /Départ\s+(\d+\s*h\s*\d+),\s*durée\s+(.+?)\.\s*Arrivée/.exec(q);
  if (r) {
    const depart = lireDuree(r[1]);
    const duree = lireDuree(r[2]);
    return duree === null ? null : {
      sorte: 'arrivee', depart, duree, arrivee: depart + duree,
    };
  }
  r = /^(\d+) min\s*=/.exec(q);
  if (r) return { sorte: 'minutes', minutes: Number(r[1]) };
  r = /^(\d+(?:,\d+)?) h\s*=/.exec(q);
  if (r) return { sorte: 'heures', heures: lireNombre(r[1]) };
  return null;
}

/** Les gares de la frise : le départ, l'heure pile, les heures entières, l'arrivée. */
function gares(depart, arrivee) {
  const points = [depart];
  const pile = Math.ceil(depart / 60) * 60;
  if (pile > depart && pile < arrivee) points.push(pile);
  const derniere = Math.floor(arrivee / 60) * 60;
  if (derniere > points[points.length - 1] && derniere < arrivee) points.push(derniere);
  if (arrivee > points[points.length - 1]) points.push(arrivee);
  return points;
}

/** La frise : des rails, une gare par étape, le train qui roule de l'une à l'autre. */
function Frise({ points }) {
  const n = points.length - 1;
  return (
    <div className={`${P}__frise`} style={{ '--n': n }}>
      <span className={`${P}__rails`} aria-hidden="true" />
      <span className={`${P}__train`} aria-hidden="true">
        <span className={`${P}__fumee`} />
      </span>
      {/* Chaque gare occupe le tronçon qui la précède : son heure à droite, la durée au milieu. */}
      <ol className={`${P}__gares`}>
        {points.map((t, i) => (
          <li
            key={t}
            className={`${P}__gare`}
            style={{ '--d': `${(0.4 + i * 1).toFixed(2)}s`, left: `${(100 * Math.max(0, i - 1)) / n}%`, width: i ? `${100 / n}%` : 0 }}
          >
            <span className={`${P}__heure`}>{heure(t)}</span>
            {i > 0 && <span className={`${P}__troncon`}>{`+ ${ecrireDuree(t - points[i - 1])}`}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** L'horloge du quai. Avec `jusqua`, les aiguilles avancent jusqu'à l'arrivée. */
function Horloge({ de = 0, jusqua = null }) {
  const angleMin = (t) => (t % 60) * 6;
  const angleH = (t) => ((t / 60) % 12) * 30;
  const fin = jusqua ?? de;
  // Les aiguilles tournent dans le sens des aiguilles d'une montre, tours complets compris.
  const tourMin = angleMin(de) + (fin - de) * 6;
  const tourH = angleH(de) + (fin - de) * 0.5;
  return (
    <svg className={`${P}__horloge`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" className={`${P}__cadran`} />
      {Array.from({ length: 12 }, (_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <line key={i} x1="50" y1="9" x2="50" y2={i % 3 ? 14 : 18} transform={`rotate(${i * 30} 50 50)`} className={`${P}__repere`} />
      ))}
      <line
        x1="50" y1="50" x2="50" y2="28"
        className={`${P}__petite`}
        style={{ '--de': `${angleH(de)}deg`, '--a': `${tourH}deg` }}
      />
      <line
        x1="50" y1="50" x2="50" y2="14"
        className={`${P}__grande`}
        style={{ '--de': `${angleMin(de)}deg`, '--a': `${tourMin}deg` }}
      />
      <line x1="50" y1="56" x2="50" y2="12" className={`${P}__trotteuse`} />
      <circle cx="50" cy="50" r="3" className={`${P}__axe`} />
    </svg>
  );
}

function contenu(m) {
  const l = lire(m);
  if (!l) return null;
  if (l.sorte === 'entre' || l.sorte === 'arrivee') {
    if (l.depart === null || l.arrivee === null || l.arrivee <= l.depart) return null;
    const pts = gares(l.depart, l.arrivee);
    const morceaux = pts.slice(1).map((t, i) => ecrireDuree(t - pts[i]));
    return (
      <>
        <div className={`${P}__voyage`}>
          <Horloge de={l.depart} jusqua={l.arrivee} />
          <Frise points={pts} />
        </div>
        <Etapes
          p={P}
          depart={pts.length + 0.2}
          lignes={[
            l.sorte === 'entre'
              ? `${morceaux.join(' + ')} = ${ecrireDuree(l.arrivee - l.depart)}`
              : `${heure(l.depart)} + ${ecrireDuree(l.duree)} : on passe par ${heure(pts[1])}, et 60 minutes font une heure.`,
          ]}
        />
      </>
    );
  }
  if (l.sorte === 'minutes') {
    const h = Math.floor(l.minutes / 60);
    return (
      <>
        <Horloge de={0} jusqua={l.minutes} />
        <Etapes p={P} depart={1} lignes={[`${l.minutes} min = ${h} × 60 min + ${l.minutes - 60 * h} min`, '60 minutes font une heure.']} />
      </>
    );
  }
  if (l.heures === null) return null;
  const h = Math.floor(l.heures);
  const reste = Math.round((l.heures - h) * 600) / 600;
  return (
    <>
      <Horloge de={0} jusqua={Math.round(l.heures * 60)} />
      <Etapes
        p={P}
        depart={1}
        lignes={[
          `${ecrireNombre(l.heures)} h = ${h} h + ${ecrireNombre(reste)} h`,
          `${ecrireNombre(reste)} h = ${ecrireNombre(reste)} × 60 min = ${ecrireNombre(Math.round(reste * 60))} min (pas ${ecrireNombre(Math.round(reste * 100))} !)`,
        ]}
      />
    </>
  );
}

export function QuestionCombienDeTemps({ m, termine }) {
  const l = lire(m);
  const depart = l?.depart ?? null;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {!termine && (
        <div className={`${P}__quai`} aria-hidden="true">
          <span className={`${P}__marquise`} />
          {depart !== null && <Horloge de={depart} />}
          <span className={`${P}__lanterne`} />
          <span className={`${P}__lanterne ${P}__lanterne--2`} />
        </div>
      )}
      <div className={`${P}__tableau`}>
        <span className={`${P}__titre`} aria-hidden="true">Départs</span>
        <p className={`${classeQuestion(m.question)} ${P}__question`}>{m.question}</p>
      </div>
      {termine && <Explication p={P} m={m} contenu={() => contenu(m)} retard={l && (l.sorte === 'entre' || l.sorte === 'arrivee') ? 5 : 2.8} />}
    </div>
  );
}

/** Les réponses : un billet de train par voie ; on composte le bon. */
export function Billets({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__billets`} aria-label="Composte le bon billet">
      {choix.map(({ cle, libelle }, i) => (
        <li key={cle} style={{ '--i': i }}>
          <button
            type="button"
            className={`${P}__billet${fautes.includes(cle) ? ' est-fausse' : ''}`}
            onClick={() => choisir(cle)}
            disabled={fautes.includes(cle)}
          >
            <span className={`${P}__voie`} aria-hidden="true">{`Voie ${i + 1}`}</span>
            <span className={`${P}__duree`}>{libelle}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
