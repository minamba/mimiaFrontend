import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getBilanEleve,
  getFicheEleve,
  getHistoriqueEvaluations,
  getHistoriqueRapports,
} from '../lib/api/elevesApi';
import { getProfil, marquerTutorielFicheVu } from '../lib/api/profilApi';
import { sessionEleve } from '../lib/storage/sessionEleve';
import { ETAPES_FICHE } from '../lib/tutoriel/etapes';
import FicheEleve from './FicheEleve';
import Tutoriel from './tutoriel/Tutoriel';

/**
 * La fiche d'un enfant, en page.
 *
 * Elle s'ouvrait dans une fenêtre modale, ce qui ne tenait plus : elle porte
 * l'identité, les statistiques, toutes les évaluations avec leurs copies, les
 * comptes rendus de séance et la progression par matière. Une fenêtre impose
 * une hauteur et un défilement interne à tout cela.
 *
 * En page, elle gagne aussi une adresse : un parent peut la mettre en favori
 * et y revenir directement, sans repasser par son profil.
 */
export default function PageEleve() {
  const { eleveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // LA PORTE PAR LAQUELLE ON EST ENTRÉ, PAS TOUJOURS LA MÊME.
  //
  // Deux chemins mènent ici : « Mon compte » et, depuis peu, le bandeau
  // « Fiche de … » sous chaque enfant de « Mes enfants ». Le lien qui y a
  // conduit pose `state.depuis` (voir `ListeEleves.js`) ; sans lui, on est
  // venu de « Mon compte », comme avant que ce second chemin existe.
  const retour = location.state?.depuis === 'mes-enfants'
    ? { to: '/eleves', libelle: 'Mes enfants' }
    : { to: '/profil', libelle: 'Mon compte' };

  const [fiche, setFiche] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // L'ANNÉE REGARDÉE. `null` = celle en cours, que le serveur choisit.
  //
  // Le changement RECHARGE la fiche au lieu de filtrer ce qui est déjà là :
  // les évaluations et les séances arrivent par tranches de dix, et filtrer
  // une tranche déjà chargée montrerait « aucune évaluation en 4e » à un élève
  // qui en a vingt, simplement parce qu'aucune ne figure dans les dix
  // dernières.
  const [niveau, setNiveau] = useState(null);

  useEffect(() => { setNiveau(null); }, [eleveId]);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const { data } = await getFicheEleve(eleveId, niveau);
      setFiche(data);
    } catch {
      setErreur("Impossible de charger la fiche de votre enfant.");
    } finally {
      setChargement(false);
    }
  }, [eleveId, niveau]);

  useEffect(() => {
    charger();
  }, [charger]);

  // LE TUTORIEL DE LA FICHE (08/11/2026) : une fois par compte parent, et seulement quand
  // elle a quelque chose à montrer. Noté « vu » dès le départ, comme celui de la page de
  // l'enfant. Jamais pour un enfant connecté avec son code : le profil lui est fermé.
  const enfant = Boolean(sessionEleve());
  const [tutoriel, setTutoriel] = useState(false);
  const pourLeTutoriel = !chargement && (fiche?.nombreCours ?? 0) > 0;
  const dejaDemande = useRef(false);

  useEffect(() => {
    if (!pourLeTutoriel || enfant || dejaDemande.current) return undefined;
    dejaDemande.current = true;
    let vivant = true;

    getProfil()
      .then(({ data }) => {
        if (!vivant || data?.tutorielFicheVu !== false) return;
        setTutoriel(true);
        marquerTutorielFicheVu().catch(() => {});
      })
      .catch(() => {});

    return () => { vivant = false; };
  }, [pourLeTutoriel, enfant]);

  return (
    <section className="page page--large">
      {tutoriel && <Tutoriel etapes={ETAPES_FICHE} onFin={() => setTutoriel(false)} />}

      <div className="fiche-tuto-barre">
        <Link to={retour.to} className="lien-retour">
          <span aria-hidden="true">←</span> {retour.libelle}
        </Link>

        {fiche && !enfant && (
          <button type="button" className="bouton-tuto" onClick={() => setTutoriel(true)}>
            <span aria-hidden="true">🎓</span> Voir le tuto
          </button>
        )}
      </div>

      <FicheEleve
        enPage
        fiche={fiche}
        chargement={chargement}
        erreur={erreur}
        onFermer={() => navigate(retour.to)}
        niveau={niveau}
        onNiveau={setNiveau}
        chargerEvaluations={getHistoriqueEvaluations}
        chargerRapports={getHistoriqueRapports}
        chargerBilan={getBilanEleve}
      />
    </section>
  );
}
