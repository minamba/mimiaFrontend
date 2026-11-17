import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAvancementPodcast } from '../../lib/api/mesPodcastsApi';
import { ETATS_SUIVIS, lireSuivis, oublier, surChangement } from '../../lib/podcasts/suiviPodcasts';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import { cheminPodcasts, styleDuCours } from '../../lib/mesFiches/espaceFiches';
import { usePodcasts } from '../../lib/storage/modeTest';
import './podcasts.css';

/**
 * LA BARRE DES PODCASTS EN FABRICATION — Camara, le 15/11/2026 : « une barre de progression qui reste fixe même si on
 * change d'onglet », puis « une popup pour signaler que le podcast est prêt », « avec un bouton “Écouter” qui ramène
 * au podcast ».
 *
 * Posée une fois pour toute l'application (sous le routeur) : elle suit l'élève de page en page. Chaque cours suivi
 * (`lib/podcasts/suiviPodcasts.js`) est relu toutes les quelques secondes par une route courte. À 100 %, la carte
 * laisse la place à une fenêtre « Ton podcast est prêt ». Un cours qui échoue le dit aussi, une fois.
 */
const PERIODE = 4000;
// Onglet caché : on relit moins souvent, la fenêtre attendra son retour.
const PERIODE_CACHEE = 20000;
// Le temps de voir la barre pleine avant la fenêtre « prêt ».
const DELAI_CENT = 1200;

const cle = (s) => `${s.eleveId}-${s.coursId}`;
// Le parent dans son espace (15/11/2026) : `eleveId` vaut `parent`.
const adresse = (s) => `${cheminPodcasts(s.eleveId)}/cours/${s.coursId}`;

/** Les cours suivis que cette session a le droit de lire : un enfant connecté ne voit que les siens. */
function suivisVisibles() {
  const enfant = sessionEleve();
  const liste = lireSuivis();
  return enfant?.eleveId ? liste.filter((s) => String(s.eleveId) === String(enfant.eleveId)) : liste;
}

function libelle(a) {
  if (!a) return 'Je regarde où en est ton podcast…';
  if (a.etat === 'a_lire') return 'Je lis ton cours…';
  if (a.etat === 'notions') return 'Tes notions sont prêtes : choisis tes épisodes.';
  if (a.demandes > 1) return `Épisode ${Math.min(a.faits + 1, a.demandes)} sur ${a.demandes} en préparation`;
  return 'Ton épisode se prépare';
}

export default function SuiviPodcasts({ decale = false }) {
  const actif = usePodcasts();
  const navigate = useNavigate();
  const [suivis, setSuivis] = useState(suivisVisibles);
  const [avancees, setAvancees] = useState({});
  const [annonces, setAnnonces] = useState([]);
  const enCours = useRef(false);

  useEffect(() => surChangement(() => setSuivis(suivisVisibles())), []);

  const relire = useCallback(async () => {
    if (enCours.current) return;
    enCours.current = true;
    try {
      const liste = suivisVisibles();
      await Promise.all(liste.map(async (s) => {
        try {
          const { data } = await getAvancementPodcast(s.eleveId, s.coursId);
          if (data.etat === 'echec') {
            // Un seul onglet annonce : celui qui retire le cours de la liste.
            if (oublier(s.eleveId, s.coursId)) setAnnonces((a) => [...a, { ...s, ...data }]);
            return;
          }
          if (data.etat === 'pret') {
            // La barre touche 100 % sous les yeux de l'élève, puis la fenêtre s'ouvre.
            setAvancees((a) => ({ ...a, [cle(s)]: { ...data, etat: 'a_generer', pourcent: 100 } }));
            await new Promise((fin) => { setTimeout(fin, DELAI_CENT); });
            if (oublier(s.eleveId, s.coursId)) setAnnonces((a) => [...a, { ...s, ...data }]);
            return;
          }
          if (!ETATS_SUIVIS.includes(data.etat)) {
            oublier(s.eleveId, s.coursId);
            return;
          }
          setAvancees((a) => ({ ...a, [cle(s)]: data }));
        } catch (e) {
          const statut = e?.response?.status;
          // Supprimé, ou pas à cet enfant : on cesse de le suivre. Une panne passagère, elle, se relit plus tard.
          if (statut === 404 || statut === 403) oublier(s.eleveId, s.coursId);
        }
      }));
    } finally {
      enCours.current = false;
    }
  }, []);

  const rien = suivis.length === 0;
  useEffect(() => {
    if (!actif || rien) return undefined;
    relire();
    let minuteur;
    const programmer = () => {
      minuteur = setTimeout(async () => {
        await relire();
        programmer();
      }, document.hidden ? PERIODE_CACHEE : PERIODE);
    };
    programmer();
    // Au retour sur l'onglet, on relit tout de suite : la fenêtre « prêt » n'attend pas vingt secondes.
    const auRetour = () => { if (!document.hidden) relire(); };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      clearTimeout(minuteur);
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, [actif, rien, relire]);

  if (!actif) return null;

  const annonce = annonces[0];
  const fermerAnnonce = () => setAnnonces((a) => a.slice(1));
  const ecouter = () => {
    fermerAnnonce();
    navigate(adresse(annonce));
  };

  return (
    <>
      {suivis.length > 0 && (
        <div className={`pod-suivi${decale ? ' pod-suivi--decale' : ''}`} aria-live="polite">
          {suivis.map((s) => {
            const a = avancees[cle(s)];
            const pourcent = a?.etat === 'a_generer' ? (a.pourcent ?? 0) : null;
            return (
              <div key={cle(s)} className="pod-suivi__carte" style={a ? styleDuCours(a) : undefined}>
                <div className="pod-suivi__haut">
                  <span className="pod-suivi__icone" aria-hidden="true">🎧</span>
                  <Link to={adresse(s)} className="pod-suivi__titre">
                    {a?.titre || 'Ton podcast'}
                    {a?.matiereLibelle && <span>{a.matiereLibelle}</span>}
                  </Link>
                  {pourcent !== null && <strong className="pod-suivi__pourcent">{pourcent} %</strong>}
                  <button
                    type="button"
                    className="pod-suivi__fermer"
                    aria-label="Ne plus suivre ce podcast ici"
                    onClick={() => oublier(s.eleveId, s.coursId)}
                  >
                    ×
                  </button>
                </div>

                {a?.etat === 'notions' ? (
                  <Link to={adresse(s)} className="pod-suivi__lien">Choisir mes épisodes</Link>
                ) : (
                  <div
                    className={`pod-suivi__barre${pourcent === null ? ' pod-suivi__barre--attente' : ''}`}
                    role="progressbar"
                    aria-label="Avancement du podcast"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pourcent ?? undefined}
                  >
                    <span style={{ width: pourcent === null ? undefined : `${Math.max(3, pourcent)}%` }} />
                  </div>
                )}
                <p className="pod-suivi__etat">{libelle(a)}</p>
              </div>
            );
          })}
        </div>
      )}

      {annonce && (
        <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-podcast-pret">
          <div className="modale__boite pod-pret" style={styleDuCours(annonce)}>
            {annonce.etat === 'pret' ? (
              <>
                <span className="pod-pret__icone" aria-hidden="true">🎧</span>
                <h2 id="titre-podcast-pret">Ton podcast est prêt !</h2>
                <p className="modale__texte">
                  {annonce.titre ? <>« {annonce.titre} »</> : 'Ton podcast'}
                  {annonce.matiereLibelle ? ` en ${annonce.matiereLibelle}` : ''}
                  {annonce.faits > 1 ? ` : ${annonce.faits} épisodes t’attendent.` : ' t’attend.'}
                </p>
                {annonce.remarque && <p className="modale__note">{annonce.remarque}</p>}
                <div className="modale__actions">
                  <button type="button" className="btn btn--fantome" onClick={fermerAnnonce}>Plus tard</button>
                  <button type="button" className="btn" onClick={ecouter}>Écouter</button>
                </div>
              </>
            ) : (
              <>
                <h2 id="titre-podcast-pret">Ton podcast n’a pas pu être créé</h2>
                <p className="modale__texte">
                  {annonce.remarque || 'Importe ton cours à nouveau dans un moment.'}
                </p>
                <div className="modale__actions">
                  <button type="button" className="btn btn--fantome" onClick={fermerAnnonce}>Fermer</button>
                  <button type="button" className="btn" onClick={ecouter}>Voir</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
