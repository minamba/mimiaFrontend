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

      {/* LA NOTE SEULE, SANS LA RÉPARTITION — Camara, le 14/09/2026. Le
          visiteur retient la note, le nombre d'avis et ce que disent les
          parents : les cinq barres faisaient de la section un tableau de bord.
          Elles vivent sur la page « tous les avis » (`RepartitionAvis.js`),
          où va le lecteur méfiant qui veut le détail. */}
      {total > 0 && (
        <div className="avis__resume">
          <span className="avis__moyenne">
            {(publics.moyenne ?? 0).toFixed(1).replace('.', ',')}
            <span className="avis__sur">/5</span>
          </span>
          <span className="avis__resume-detail">
            <Etoiles note={publics.moyenne} taille="grande" />
            <span className="avis__total">
              Basé sur {total} avis vérifié{total > 1 ? 's' : ''}
            </span>
          </span>
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
