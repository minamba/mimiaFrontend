import { useCallback, useEffect, useState } from 'react';
import { getImportOrientation, lancerImportOrientation } from '../lib/api/adminApi';

/**
 * LA CONSEILLÈRE D'ORIENTATION, DANS ADMIN › MODES — Camara, le 11/10/2026 :
 * « un mode qui me permette d'afficher ou d'activer ou non la conseillère, comme
 * les professeurs de langue ».
 *
 * DEUX CHOSES DANS LA MÊME CARTE, parce qu'elles vont ensemble :
 *   - l'interrupteur : éteinte, la conseillère n'existe pour personne ;
 *   - l'offre des lycées qu'elle lit : la date du dernier import, le nombre de
 *     lycées, l'erreur s'il y en a eu une, et un bouton pour l'importer sans
 *     attendre la tâche de la semaine.
 *
 * Un import dure une demi-minute environ : pendant qu'il tourne, l'écran relit
 * son état toutes les cinq secondes.
 */
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
};

export default function ModeConseillere({ conseillere, lus, envoi, onBasculer }) {
  const [etat, setEtat] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [lancement, setLancement] = useState(false);

  const relire = useCallback(async () => {
    try {
      const { data } = await getImportOrientation();
      setEtat(data);
      setErreur(null);
    } catch {
      setErreur("L'état de l'import n'a pas pu être lu.");
    }
  }, []);

  useEffect(() => { relire(); }, [relire]);

  // Pendant un import, on relit son état jusqu'à ce qu'il finisse.
  useEffect(() => {
    if (!etat?.enCours) return undefined;
    const minuteur = setInterval(relire, 5000);
    return () => clearInterval(minuteur);
  }, [etat?.enCours, relire]);

  const lancer = async () => {
    setLancement(true);
    setErreur(null);
    try {
      await lancerImportOrientation(true);
      setEtat((e) => ({ ...(e ?? {}), enCours: true }));
    } catch (e) {
      setErreur(e?.response?.status === 409
        ? 'Un import est déjà en cours.'
        : "L'import n'a pas pu être lancé.");
    } finally {
      setLancement(false);
    }
  };

  if (!conseillere?.existe) return null;

  const dernier = etat?.passages?.[0];
  const actif = Boolean(conseillere.actif);

  return (
    <section className="mode mode--pile" aria-labelledby="mode-conseillere-titre">
      <div className="mode__entete">
        <div>
          <h3 className="mode__titre" id="mode-conseillere-titre">La conseillère d’orientation</h3>
          <p className="mode__description">
            Maëlle accompagne les élèves de la 3e à la terminale dans leurs
            choix : après la 3e, après la 2de, après le bac. Éteinte, elle
            n’apparaît nulle part, et aucune séance ne s’ouvre avec elle.
          </p>
        </div>

        <button
          type="button"
          className={`bascule ${actif ? 'bascule--active' : ''}`}
          onClick={onBasculer}
          disabled={envoi === 'MODULE_ORIENTATION' || !lus}
          role="switch"
          aria-checked={actif}
          aria-label="La conseillère d’orientation"
        >
          <span className="bascule__piste">
            <span className="bascule__bouton" />
          </span>
        </button>
      </div>

      <div className="mode__sous-reglage">
        <div className="mode__sous-texte">
          <strong>L’offre des lycées</strong>
          <span>
            {etat == null && !erreur && 'Lecture…'}
            {etat?.enCours && 'Import en cours…'}
            {etat && !etat.enCours && (etat.lycees > 0
              ? `${etat.lycees.toLocaleString('fr-FR')} lycées en base.`
              : 'Aucun lycée en base : l’import n’a pas encore tourné.')}
            {dernier && !etat?.enCours && ` Dernier passage le ${formatDate(dernier.date)} : ${dernier.message ?? ''}`}
          </span>
        </div>

        <button
          type="button"
          className="btn btn--secondaire"
          onClick={lancer}
          disabled={lancement || etat?.enCours || !lus}
        >
          Importer maintenant
        </button>
      </div>

      {dernier && !dernier.reussi && (
        <p className="alert" role="alert">
          Le dernier import a échoué. La conseillère continue avec l’offre
          précédente.
        </p>
      )}

      {erreur && <p className="alert" role="alert">{erreur}</p>}

      <p className="mode__note">
        Sources officielles : l’Onisep (formations, spécialités, options de
        chaque lycée) et l’Annuaire de l’éducation (voies, sections). Une tâche
        les relit chaque semaine et ne télécharge que si elles ont changé. Un
        changement de format de la source arrête l’import sans rien effacer.
        Aucun jeton n’est dépensé.
      </p>
    </section>
  );
}
