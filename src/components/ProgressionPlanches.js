import { useCallback, useEffect, useRef, useState } from 'react';
import { getFilesPlanches, relancerDescriptionsPlanches } from '../lib/api/adminApi';

/**
 * OÙ EN SONT LES DESCRIPTIONS — Camara, le 20/10/2026 : « c'est dommage que je
 * n'aie pas de barre de progression, je suis à l'aveugle », puis « la matière
 * en cours et la planche en cours, avec un lien vers la planche ».
 *
 * La tâche de fond travaille sur le serveur : l'écran relit ses files toutes
 * les vingt secondes (`planches/files`, une liste courte, sans images) et en
 * tire deux barres, le rythme constaté et le temps qu'il reste.
 *
 * LA PLANCHE EN COURS est la première de chaque file : la tâche les prend dans
 * le même ordre que la file (les plus récentes d'abord), par lots de cinq —
 * cinq descriptions, puis les cartes des repères de celles qui sont décrites.
 *
 * LA FILE DES CARTES NE COMPTE QUE LES PLANCHES DÉJÀ DÉCRITES : une planche qui
 * attend sa description attend aussi sa carte. Les cartes faites sont donc
 * le total moins les deux files.
 *
 * `totalLegendees` : les planches légendées importées (les muettes n'ont ni
 * description ni carte à elles). `decrire(cle)` : { titre, matiere } pour
 * l'affichage. `onOuvrir(cle)` : ouvre la planche en grand. `onFini` : appelé
 * quand tout est fait, pour relire la liste.
 */
const INTERVALLE_MS = 20000;

function duree(secondes) {
  if (!Number.isFinite(secondes) || secondes <= 0) return null;
  const minutes = Math.round(secondes / 60);
  if (minutes < 1) return 'moins d’une minute';
  if (minutes < 60) return `environ ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return `environ ${heures} h${reste > 0 ? ` ${String(reste).padStart(2, '0')}` : ''}`;
}

function Barre({ libelle, faites, total, rythme }) {
  const pourcentage = total > 0 ? Math.min(100, Math.round((faites / total) * 100)) : 100;
  const restant = rythme > 0 ? duree((total - faites) / rythme) : null;
  return (
    <div className="planches-progression__ligne">
      <div className="planches-progression__texte">
        <span>{libelle}</span>
        <span>
          <strong>{faites}</strong> / {total} · {pourcentage} %
          {faites < total && restant && <> · reste {restant}</>}
        </span>
      </div>
      <div className="planches-dossier__barre"><span style={{ width: `${pourcentage}%` }} /></div>
    </div>
  );
}

/** « Description en cours : L'appareil respiratoire · SVT — Voir la planche ». */
function EnCours({ libelle, cle, decrire, onOuvrir }) {
  if (!cle) return null;
  const { titre, matiere } = decrire?.(cle) ?? {};
  return (
    <p className="planches-progression__courante">
      <span className="planches-progression__etape">{libelle}</span>
      <span className="planches-progression__titre">
        <strong>{titre ?? cle}</strong>
        {matiere && <span className="planches-progression__matiere">{matiere}</span>}
      </span>
      {onOuvrir && (
        <button type="button" className="planches-progression__lien" onClick={() => onOuvrir(cle)}>
          Voir la planche →
        </button>
      )}
    </p>
  );
}

export default function ProgressionPlanches({ totalLegendees, decrire, onOuvrir, onFini }) {
  const [files, setFiles] = useState(null);
  const [relance, setRelance] = useState(null);
  // Les dernières mesures, pour le rythme : [{ t, decrites, cartes }].
  const mesures = useRef([]);
  const [rythme, setRythme] = useState({ descriptions: 0, reperes: 0 });
  const enCoursAvant = useRef(false);
  const totalRef = useRef(totalLegendees);
  totalRef.current = totalLegendees;

  const lire = useCallback(async () => {
    try {
      const { data } = await getFilesPlanches();
      const aDecrire = data?.aDecrire ?? [];
      const aCartographier = data?.aCartographier ?? [];
      setFiles({ aDecrire, aCartographier });

      const total = Math.max(totalRef.current, aDecrire.length + aCartographier.length);
      const decrites = total - aDecrire.length;
      const cartes = total - aDecrire.length - aCartographier.length;

      const maintenant = Date.now();
      // Une fenêtre de quatre minutes : un tour de la tâche (cinq descriptions, puis
      // leurs cinq cartes) peut en prendre deux, la mesure doit le couvrir.
      mesures.current = [...mesures.current.slice(-11), { t: maintenant, decrites, cartes }];
      const premiere = mesures.current[0];
      if (mesures.current.length > 1 && maintenant > premiere.t) {
        const secondes = (maintenant - premiere.t) / 1000;
        setRythme({
          descriptions: Math.max(0, (decrites - premiere.decrites) / secondes),
          reperes: Math.max(0, (cartes - premiere.cartes) / secondes),
        });
      }

      const enCours = aDecrire.length + aCartographier.length > 0;
      if (enCoursAvant.current && !enCours) onFini?.();
      enCoursAvant.current = enCours;
    } catch {
      // Une lecture ratée n'efface pas la dernière mesure : on réessaie au tour suivant.
    }
  }, [onFini]);

  useEffect(() => {
    lire();
    const minuteur = setInterval(() => {
      if (document.visibilityState !== 'hidden') lire();
    }, INTERVALLE_MS);
    return () => clearInterval(minuteur);
  }, [lire]);

  const relancer = async () => {
    setRelance('en-cours');
    try {
      await relancerDescriptionsPlanches();
      setRelance('faite');
      mesures.current = [];
      setTimeout(lire, 3000);
    } catch {
      setRelance('erreur');
    }
  };

  if (!files || files.aDecrire.length + files.aCartographier.length === 0) return null;

  const total = Math.max(totalLegendees, files.aDecrire.length + files.aCartographier.length);
  const immobile = mesures.current.length >= 12 && rythme.descriptions === 0 && rythme.reperes === 0;

  return (
    <section className="planches-progression" aria-labelledby="planches-progression-titre" role="status">
      <div className="planches-dossier__entete">
        <div>
          <h3 id="planches-progression-titre">Descriptions en cours</h3>
          <p>
            La tâche de fond lit chaque planche sur le serveur ; vous pouvez fermer cette page,
            elle continue. Mise à jour toutes les 20 secondes.
          </p>
        </div>
        <button type="button" className="btn btn--compact" onClick={relancer} disabled={relance === 'en-cours'}>
          {relance === 'en-cours' ? 'Relance…' : 'Relancer les descriptions'}
        </button>
      </div>

      <Barre libelle="Descriptions" faites={total - files.aDecrire.length} total={total} rythme={rythme.descriptions} />
      <Barre
        libelle="Cartes des repères"
        faites={total - files.aDecrire.length - files.aCartographier.length}
        total={total}
        rythme={rythme.reperes}
      />

      <div className="planches-progression__courantes">
        <EnCours libelle="Description en cours" cle={files.aDecrire[0]?.cle} decrire={decrire} onOuvrir={onOuvrir} />
        <EnCours libelle="Carte en cours" cle={files.aCartographier[0]?.cle} decrire={decrire} onOuvrir={onOuvrir} />
      </div>

      {relance === 'faite' && <p className="champ__aide">Tâche de fond relancée.</p>}
      {relance === 'erreur' && <p className="champ__aide champ__aide--alerte">La relance a échoué : l’API est-elle à jour ?</p>}
      {immobile && relance !== 'faite' && (
        <p className="champ__aide champ__aide--alerte">
          Rien n’avance depuis quatre minutes : la tâche est peut-être arrêtée (crédit épuisé,
          redémarrage). Cliquez sur « Relancer les descriptions ».
        </p>
      )}
    </section>
  );
}
