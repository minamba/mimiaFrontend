import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAvisPublics } from '../lib/api/avisApi';
import CarteAvis from './CarteAvis';
import Etoiles from './Etoiles';

const PAR_PAGE = 24;

/**
 * Tous les avis, sur leur propre page.
 *
 * PAGINÉE, ET PAS SEULEMENT PLAFONNÉE. « Voir tous les avis » qui en montre
 * soixante et s'arrête sans le dire est un mensonge poli : on peut vivre avec
 * tant qu'il y en a trente, et il devient faux le jour où le produit marche.
 * Le bouton « Voir plus » n'apparaît que s'il reste quelque chose à voir.
 *
 * LA MOYENNE NE BOUGE PAS D'UNE PAGE À L'AUTRE : le serveur la calcule sur
 * TOUS les avis publiés, jamais sur la tranche affichée.
 */
export default function TousLesAvis() {
  const [donnees, setDonnees] = useState(null);
  const [liste, setListe] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(false);

  const charger = useCallback(async (decalage) => {
    setChargement(true);

    try {
      const { data } = await getAvisPublics(PAR_PAGE, decalage);
      setDonnees(data);
      setListe((precedents) =>
        (decalage === 0 ? (data.avis ?? []) : [...precedents, ...(data.avis ?? [])]));
    } catch {
      setErreur(true);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(0); }, [charger]);

  const total = donnees?.total ?? 0;
  const reste = total - liste.length;

  return (
    <div className="page page--avis">
      {/* Le retour en tête de page, avant le titre : c'est la première chose
          qu'on cherche en arrivant sur une page qu'on n'a pas voulue. */}
      <Link to="/" className="lien-retour">
        <span aria-hidden="true">‹</span> Retour à l'accueil
      </Link>

      <header className="page__entete">
        <h1>Les avis de nos familles</h1>
        {total > 0 && (
          <div className="avis__note avis__note--enligne">
            <span className="avis__moyenne">
              {(donnees.moyenne ?? 0).toFixed(1).replace('.', ',')}
            </span>
            <Etoiles note={donnees.moyenne} taille="grande" />
            <span className="avis__total">
              {total} avis vérifié{total > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </header>

      {erreur && <div className="alert">Les avis n'ont pas pu être chargés.</div>}

      {!erreur && total === 0 && !chargement && (
        <p className="vide">Aucun avis publié pour le moment.</p>
      )}

      <div className="avis__liste">
        {liste.map((a) => <CarteAvis key={a.id} avis={a} />)}
      </div>

      {reste > 0 && (
        <div className="page__actions">
          <button
            type="button"
            className="btn btn--principal"
            disabled={chargement}
            onClick={() => charger(liste.length)}
          >
            {chargement ? 'Chargement…' : `Voir ${Math.min(reste, PAR_PAGE)} avis de plus`}
          </button>
        </div>
      )}

      <div className="page__actions">
        <Link to="/" className="btn-ghost">Retour à l'accueil</Link>
      </div>
    </div>
  );
}
