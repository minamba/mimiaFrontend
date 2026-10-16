import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRapportsOrientation, marquerRapportsOrientationVus } from '../lib/api/orientationApi';
import { useAffichageEleve } from '../lib/besoins';
import Avatar from './Avatar';
import Loader from './Loader';
import RapportOrientationCarte from './RapportOrientationCarte';
import Pagination, { usePage } from './Pagination';

/**
 * « RAPPORTS D'ORIENTATION » — la page de la conseillère, à la place des
 * fiches de révision des professeurs (Camara, le 11/10/2026 : « elle n'est
 * pas un professeur ; ses fiches se nommeraient Rapports d'orientation »).
 *
 * Un rapport par séance, le plus récent en haut. Ceux que l'élève n'avait pas
 * encore ouverts portent « Nouveau » pendant cette visite ; ils sont marqués
 * vus dès l'ouverture de la page (le serveur ne le fait que pour l'élève
 * lui-même, pas pour son parent).
 */
export default function RapportsOrientation() {
  const { eleveId } = useParams();
  useAffichageEleve(eleveId);

  const [rapports, setRapports] = useState(null);
  const [erreur, setErreur] = useState(null);
  // Dix rapports par page (12/10/2026).
  const pageRapports = usePage(rapports);

  useEffect(() => {
    let vivant = true;

    getRapportsOrientation(eleveId)
      .then(({ data }) => {
        if (!vivant) return;
        setRapports(data ?? []);
        // Après l'affichage : « Nouveau » reste visible le temps de la visite.
        if ((data ?? []).some((r) => !r.vuLe)) {
          marquerRapportsOrientationVus(eleveId).catch(() => { /* rien à dire */ });
        }
      })
      .catch(() => { if (vivant) setErreur('Tes rapports n’ont pas pu être chargés.'); });

    return () => { vivant = false; };
  }, [eleveId]);

  return (
    <section className="page page--large rapports-orientation">
      <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">
        <span aria-hidden="true">←</span> Mes matières
      </Link>

      <header className="fiches-entete">
        <span className="fiches-entete__avatar">
          <Avatar nom="maelle" couleur="#6D28D9" taille={56} />
        </span>
        <div className="fiches-entete__texte">
          <p className="fiches-entete__sur-titre">Orientation</p>
          <h1>Rapports d’orientation</h1>
          <p className="fiches-entete__ligne">
            Écrits par Maëlle, ta conseillère d’orientation, après chaque séance.
          </p>
        </div>
      </header>

      {rapports === null && !erreur && <Loader texte="Chargement des rapports…" />}
      {erreur && <div className="alert">{erreur}</div>}

      {rapports?.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore de rapport.</p>
          <p>Après ta première séance avec Maëlle, tu retrouveras ici ce que vous vous êtes dit et tes prochaines étapes.</p>
        </div>
      )}

      {rapports?.length > 0 && (
        <div className="rapports-orientation__liste">
          {pageRapports.visibles.map((r) => (
            <RapportOrientationCarte key={r.id} rapport={r} nouveau={!r.vuLe} />
          ))}
          <Pagination
            page={pageRapports.page}
            pages={pageRapports.pages}
            onPage={(n) => {
              pageRapports.allerA(n);
              window.scrollTo?.({ top: 0, behavior: 'smooth' });
            }}
            etiquette="Pages des rapports"
          />
        </div>
      )}
    </section>
  );
}
