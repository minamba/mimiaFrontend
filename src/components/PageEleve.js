import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getFicheEleve,
  getHistoriqueEvaluations,
  getHistoriqueRapports,
} from '../lib/api/elevesApi';
import FicheEleve from './FicheEleve';

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

  return (
    <section className="page page--large">
      <Link to={retour.to} className="lien-retour">
        <span aria-hidden="true">←</span> {retour.libelle}
      </Link>

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
      />
    </section>
  );
}
