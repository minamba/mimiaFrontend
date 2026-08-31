import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

  const [fiche, setFiche] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const { data } = await getFicheEleve(eleveId);
      setFiche(data);
    } catch {
      setErreur("Impossible de charger la fiche de votre enfant.");
    } finally {
      setChargement(false);
    }
  }, [eleveId]);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <>
      <Link to="/profil" className="lien-retour">
        <span aria-hidden="true">←</span> Mon compte
      </Link>

      <FicheEleve
        enPage
        fiche={fiche}
        chargement={chargement}
        erreur={erreur}
        onFermer={() => navigate('/profil')}
        chargerEvaluations={getHistoriqueEvaluations}
        chargerRapports={getHistoriqueRapports}
      />
    </>
  );
}
