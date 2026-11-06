import { useEffect, useMemo, useRef, useState } from 'react';
import { importerPlanche } from '../lib/api/adminApi';
import { analyserDossier, dejaAJour, licencesCitees, typeImage } from '../lib/planches/importDossier';

/**
 * IMPORTER UN DOSSIER DE SCHÉMAS — Camara, le 20/10/2026.
 *
 * On choisit le dossier (classes › matières › schémas) ; l'écran dit ce qu'il
 * a trouvé AVANT d'envoyer quoi que ce soit, puis envoie chaque schéma — la
 * légendée d'abord, sa muette ensuite (le serveur refuse l'ordre inverse) —,
 * trois à la fois, avec une barre de progression.
 *
 * LES DESCRIPTIONS SE FONT APRÈS, EN TÂCHE DE FOND : l'envoi ne les attend pas
 * (`differer`). Elles coûtent un appel au modèle par schéma légendé — la muette
 * reprend celle de sa légendée.
 *
 * REPRENDRE APRÈS UNE COUPURE : relancer l'import saute ce qui est déjà en
 * place à l'identique (même taille) ; le serveur ne relit jamais une image
 * identique, rien n'est donc payé deux fois.
 */
const EN_PARALLELE = 3;

/** Le texte d'un fichier, par la voie que tous les navigateurs connaissent. */
function lireTexte(fichier) {
  return new Promise((ok, ko) => {
    const lecteur = new FileReader();
    lecteur.onload = () => ok(String(lecteur.result ?? ''));
    lecteur.onerror = () => ko(lecteur.error);
    lecteur.readAsText(fichier);
  });
}

/** « Mimia, d'après … » : le crédit d'une carte faite à partir de données de tiers. */
async function creditsDe(fichier) {
  if (!fichier) return { maison: true };
  const texte = (await lireTexte(fichier)).replace(/\s+/g, ' ').trim();
  return {
    maison: false,
    auteur: 'Mimia, d’après les sources citées',
    source: texte.length > 500 ? `${texte.slice(0, 499)}…` : texte,
    licence: licencesCitees(texte) || 'Voir la source',
  };
}

export default function ImportDossierPlanches({ figures, matiereDeLaCle, importees, onTermine }) {
  const champ = useRef(null);
  const [analyse, setAnalyse] = useState(null);
  const [envoi, setEnvoi] = useState(null);
  const arret = useRef(false);

  // `webkitdirectory` n'est pas un attribut que React connaît : posé à la main.
  useEffect(() => {
    champ.current?.setAttribute('webkitdirectory', '');
    champ.current?.setAttribute('directory', '');
  }, []);

  const parCle = useMemo(() => {
    const index = new Map();
    for (const p of importees ?? []) index.set(`${p.cle}|${p.variante ?? 'legende'}`, p);
    return index;
  }, [importees]);

  const choisir = (e) => {
    const resultat = analyserDossier(e.target.files, figures, matiereDeLaCle);
    const aEnvoyer = resultat.paires.filter((p) => !(dejaAJour(parCle.get(`${p.cle}|legende`), p.legende)
      && (!p.muette || dejaAJour(parCle.get(`${p.cle}|muette`), p.muette))));
    setAnalyse({ ...resultat, aEnvoyer, aJour: resultat.paires.length - aEnvoyer.length });
    setEnvoi(null);
    e.target.value = '';
  };

  const lancer = async () => {
    const liste = analyse.aEnvoyer;
    arret.current = false;
    const etat = { faits: 0, total: liste.length, enCours: [], erreurs: [] };
    setEnvoi({ ...etat, actif: true });

    let suivant = 0;
    const travailleur = async () => {
      while (!arret.current && suivant < liste.length) {
        const paire = liste[suivant];
        suivant += 1;
        etat.enCours = [...etat.enCours, paire.cle];
        setEnvoi({ ...etat, actif: true });

        try {
          const credits = await creditsDe(paire.credits);
          const commun = { cle: paire.cle, matiereCode: paire.matiere.code, niveau: paire.niveau, differer: true, ...credits };

          if (!dejaAJour(parCle.get(`${paire.cle}|legende`), paire.legende)) {
            await importerPlanche({ ...commun, fichier: new File([paire.legende], paire.legende.name, { type: typeImage(paire.legende) }) });
          }
          if (paire.muette && !dejaAJour(parCle.get(`${paire.cle}|muette`), paire.muette)) {
            await importerPlanche({
              ...commun, variante: 'muette', fichier: new File([paire.muette], paire.muette.name, { type: typeImage(paire.muette) }),
            });
          }
        } catch (err) {
          etat.erreurs = [...etat.erreurs, { cle: paire.cle, message: err?.response?.data?.message ?? 'Envoi impossible.' }];
        }

        etat.faits += 1;
        etat.enCours = etat.enCours.filter((c) => c !== paire.cle);
        setEnvoi({ ...etat, actif: true });
      }
    };

    await Promise.all(Array.from({ length: EN_PARALLELE }, travailleur));
    setEnvoi({ ...etat, actif: false, arrete: arret.current });
    onTermine?.();
  };

  const pourcentage = envoi?.total ? Math.round((envoi.faits / envoi.total) * 100) : 0;

  return (
    <section className="planches-dossier" aria-labelledby="planches-dossier-titre">
      <div className="planches-dossier__entete">
        <div>
          <h3 id="planches-dossier-titre">Importer un dossier de schémas</h3>
          <p>
            Choisissez le dossier qui contient les classes, puis les matières, puis les schémas
            et leurs versions « -muette ». Rien ne part avant votre confirmation.
          </p>
        </div>
        <label className={`btn btn--compact${envoi?.actif ? ' est-desactive' : ''}`}>
          Choisir le dossier…
          <input
            ref={champ}
            type="file"
            multiple
            hidden
            disabled={envoi?.actif}
            onChange={choisir}
            data-testid="dossier-planches"
          />
        </label>
      </div>

      {analyse && (
        <div className="planches-dossier__bilan">
          <ul>
            <li><strong>{analyse.paires.length}</strong> schéma{analyse.paires.length > 1 ? 's' : ''} reconnu{analyse.paires.length > 1 ? 's' : ''}</li>
            <li><strong>{analyse.aEnvoyer.length}</strong> à envoyer{analyse.aJour > 0 && <> · {analyse.aJour} déjà à jour, sautés</>}</li>
            {analyse.incompletes.length > 0 && (
              <li className="est-alerte">
                <strong>{analyse.incompletes.length}</strong> sans leur paire :{' '}
                {analyse.incompletes.map((i) => `${i.cle} (${i.manque === 'muette' ? 'muette manquante' : 'légendée manquante'})`).join(', ')}
              </li>
            )}
            {analyse.inconnus.length > 0 && (
              <li className="est-alerte">
                <strong>{analyse.inconnus.length}</strong> sans emplacement au catalogue, non importés :{' '}
                {analyse.inconnus.slice(0, 12).map((i) => i.cle).join(', ')}
                {analyse.inconnus.length > 12 && ` … et ${analyse.inconnus.length - 12} autres`}
              </li>
            )}
          </ul>

          {!envoi && analyse.aEnvoyer.length > 0 && (
            <div className="planches-dossier__actions">
              <button type="button" className="btn" onClick={lancer}>
                Importer {analyse.aEnvoyer.length} schéma{analyse.aEnvoyer.length > 1 ? 's' : ''}
              </button>
              <span className="champ__aide">
                Les descriptions se font ensuite en tâche de fond, une par schéma légendé (la muette
                reprend celle de sa légendée).
              </span>
            </div>
          )}
        </div>
      )}

      {envoi && (
        <div className="planches-dossier__progression" role="status">
          <div className="planches-dossier__barre"><span style={{ width: `${pourcentage}%` }} /></div>
          <p>
            {envoi.actif
              ? <>Envoi : <strong>{envoi.faits}</strong> / {envoi.total}{envoi.enCours.length > 0 && <> · {envoi.enCours.join(', ')}</>}</>
              : envoi.arrete
                ? <>Import arrêté à {envoi.faits} / {envoi.total}. Rechoisissez le dossier pour reprendre : ce qui est déjà en place est sauté.</>
                : <>Import terminé : <strong>{envoi.faits - envoi.erreurs.length}</strong> schéma{envoi.faits - envoi.erreurs.length > 1 ? 's' : ''} envoyé{envoi.faits - envoi.erreurs.length > 1 ? 's' : ''}. Les descriptions arrivent en tâche de fond.</>}
          </p>
          {envoi.actif && (
            <button type="button" className="btn btn--fantome btn--compact" onClick={() => { arret.current = true; }}>
              Arrêter après les envois en cours
            </button>
          )}
          {envoi.erreurs.length > 0 && (
            <ul className="planches-dossier__erreurs">
              {envoi.erreurs.map((e) => <li key={e.cle}><code>{e.cle}</code> — {e.message}</li>)}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
