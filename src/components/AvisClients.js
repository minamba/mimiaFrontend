import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAvisPublics } from '../lib/api/avisApi';
import CarrouselAvis from './CarrouselAvis';
import Etoiles from './Etoiles';
import MonAvis from './MonAvis';

/**
 * Combien d'avis défilent sur la page d'accueil.
 *
 * Au-delà, un bouton mène à la page qui les liste tous. Dix suffisent à
 * montrer que le produit est utilisé ; les faire tous défiler ferait payer
 * à chaque visiteur le poids de tous les avis jamais écrits, pour trois
 * qu'il lira.
 */
const AU_CARROUSEL = 10;

/**
 * Ce que les familles disent du produit, sur la page d'accueil.
 *
 * LA SECTION SE RETIRE TANT QU'AUCUN AVIS N'EST PUBLIÉ — pour un visiteur.
 * « Aucun avis pour le moment » sous un titre qui promet des témoignages est
 * pire que le silence : ça dit à quelqu'un qui hésite que personne n'a encore
 * osé. Un parent connecté, lui, voit toujours le bloc — c'est par là que le
 * premier avis arrivera.
 *
 * LE FORMULAIRE VIT AUSSI AILLEURS. Un parent connecté ne repasse jamais par
 * l'accueil : il atterrit sur ses enfants. Le même composant est donc monté
 * dans « Mon compte », qui est le seul endroit où il ira vraiment.
 */
export default function AvisClients() {
  const { authentifie } = useSelector((state) => state.auth);

  const [publics, setPublics] = useState(null);

  const charger = useCallback(async () => {
    try {
      const { data } = await getAvisPublics(AU_CARROUSEL);
      setPublics(data);
    } catch {
      // Silencieux : la section se retire, la page d'accueil reste entière.
      setPublics(null);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const total = publics?.total ?? 0;

  // LA COUPE EST REFAITE ICI, alors que le serveur la fait déjà.
  //
  // Ce n’est pas de la méfiance envers l’API : c’est que le nombre affiché
  // est une règle de CET écran, pas du transport. Une API plus ancienne, un
  // cache, un plafond changé côté serveur — chacun rendrait onze cartes dans
  // un carrousel qui en promet dix, et le bouton « voir tous les avis »
  // perdrait sa raison d’être. La règle est donc vraie par construction là où
  // elle est énoncée.
  const auCarrousel = (publics?.avis ?? []).slice(0, AU_CARROUSEL);

  // Rien à montrer et personne pour écrire : la section n'existe pas.
  if (total === 0 && !authentifie) return null;

  return (
    <section className="avis" id="avis">
      <header className="section__entete">
        <span className="etiquette etiquette--sombre">Ce qu'en disent les familles</span>
        <h2>Les parents qui nous font confiance</h2>
      </header>

      {total > 0 && (
        <div className="avis__resume">
          <div className="avis__note">
            <span className="avis__moyenne">
              {(publics.moyenne ?? 0).toFixed(1).replace('.', ',')}
            </span>
            <Etoiles note={publics.moyenne} taille="grande" />
            <span className="avis__total">
              {total} avis vérifié{total > 1 ? 's' : ''}
            </span>
          </div>

          {/* LA RÉPARTITION, DE 5 À 1 ÉTOILE. Une moyenne seule cache la
              différence entre « tout le monde met 4 » et « la moitié met 5,
              l'autre met 3 » — et c'est précisément ce qu'un lecteur méfiant
              cherche à savoir. */}
          <ul className="avis__barres">
            {[5, 4, 3, 2, 1].map((rang) => {
              const nombre = publics.repartition?.[rang - 1] ?? 0;
              const part = total === 0 ? 0 : Math.round((nombre / total) * 100);

              return (
                <li key={rang}>
                  <span className="avis__barre-libelle">{rang} étoile{rang > 1 ? 's' : ''}</span>
                  <span className="avis__barre">
                    <span className="avis__barre-remplie" style={{ width: `${part}%` }} />
                  </span>
                  <span className="avis__barre-part">{part} %</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="avis__moi">
        <MonAvis surEnvoi={charger} />
      </div>

      {total > 0 && <CarrouselAvis avis={auCarrousel} />}

      {/* LE BOUTON N'APPARAÎT QUE S'IL RESTE QUELQUE CHOSE À VOIR. « Voir
          tous les avis » sous un carrousel qui les contient déjà tous mène
          à une page identique, et le visiteur a fait le voyage pour rien. */}
      {total > AU_CARROUSEL && (
        <div className="avis__vers-tous">
          <Link to="/avis" className="btn-ghost">
            Voir les {total} avis
          </Link>
        </div>
      )}
    </section>
  );
}
