import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOffreLancement } from '../lib/storage/modeTest';
import { accord } from '../lib/accord';
import './reboursIllustre.css';

/**
 * LE COMPTE À REBOURS DE L'OFFRE DE LANCEMENT.
 *
 * Jours et heures, comme sur un site marchand : c'est le seul élément de la
 * page d'accueil dont le rôle est de faire décider maintenant plutôt que
 * « plus tard », et « plus tard » est le premier concurrent d'un abonnement.
 *
 * JOURS ET HEURES, PAS DE SECONDES
 * --------------------------------
 * Des secondes qui défilent obligent à un rendu par seconde pendant toute la
 * visite, et donnent au produit un air de vente-flash douteuse. Une offre de
 * lancement qui court sur plusieurs semaines se compte en jours ; les minutes
 * n'apparaissent que dans les dernières heures, là où elles veulent enfin
 * dire quelque chose.
 *
 * IL NE SURVIT PAS À SA PROPRE ÉCHÉANCE
 * -------------------------------------
 * À zéro, il disparaît — il ne s'affiche pas « 0 j 0 h ». Et il ne décide de
 * rien : c'est le SERVEUR qui dit si l'offre est vivante, échéance comprise.
 * Un compte à rebours qui déciderait tout seul se fierait à l'horloge du
 * visiteur, qu'il suffit de reculer pour rouvrir une promotion fermée.
 *
 * Le rendu local sert donc à afficher, jamais à autoriser.
 */

/** Le battement. Une minute suffit quand l'unité la plus fine est l'heure. */
const BATTEMENT_MS = 60_000;

/**
 * Le temps qui reste, découpé.
 *
 * Rendu `null` quand c'est fini ou illisible : l'appelant n'a alors rien à
 * dessiner, et n'a pas à distinguer les deux cas.
 */
function restant(fin) {
  if (!fin) return null;

  const cible = new Date(fin).getTime();
  if (Number.isNaN(cible)) return null;

  const delta = cible - Date.now();
  if (delta <= 0) return null;

  const heuresTotal = Math.floor(delta / 3_600_000);

  return {
    jours: Math.floor(heuresTotal / 24),
    heures: heuresTotal % 24,
    minutes: Math.floor(delta / 60_000) % 60,
  };
}

export default function CompteARebours() {
  const offre = useOffreLancement();

  const [temps, setTemps] = useState(() => restant(offre.fin));

  useEffect(() => {
    // Recalculé à chaque changement d'échéance ET tout de suite : sans ce
    // premier appel, un visiteur qui arrive juste après le chargement des
    // réglages attendrait une minute avant de voir le décompte.
    setTemps(restant(offre.fin));

    if (!offre.fin) return undefined;

    const battement = setInterval(() => setTemps(restant(offre.fin)), BATTEMENT_MS);

    return () => clearInterval(battement);
  }, [offre.fin]);

  // TROIS CONDITIONS, ET AUCUNE N'EST DE TROP.
  //
  // Sans offre vivante, il n'y a rien à annoncer. Sans échéance, une
  // promotion sans terme n'a pas de compte à rebours et en inventer un
  // serait un mensonge. Et `bandeau` est le choix de l'exploitant : les
  // premiers jours d'une campagne, l'urgence ne veut rien dire — il reste
  // trois semaines — et on préfère allumer le décompte à la fin.
  if (!offre.active || !offre.bandeau || !offre.heures || !temps) return null;

  const dernierJour = temps.jours === 0;

  return (
    <div className={`rebours ${dernierJour ? 'rebours--urgent' : ''}`}>
      {/* L’OFFRE D’ABORD, L’URGENCE ENSUITE. Une promotion se lit dans cet
          ordre : ce qu’on gagne, puis le temps qu’il reste. L’inverse
          presse quelqu’un qui ne sait pas encore pourquoi. */}
      <div className="rebours__offre">
        <span className="rebours__mention">
          {/* Le torii de la maquette de Camara (16/11/2026), dessiné en trait : il suit la couleur de l'étiquette. */}
          <svg className="rebours__torii" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 3.5c3 1 17 1 20 0M4 8h16M7 3.8V21M17 3.8V21M12 4.4V8" />
          </svg>
          {offre.texte}
        </span>

        <p className="rebours__phrase">
          {/* LE NOMBRE VIENT DU SERVEUR, qui le lit dans le pack réglé en
              administration. Écrit en dur, il aurait continué d’annoncer
              trois heures le jour où l’offre en donne dix. */}
          {/* « 1 h de cours offerte », « 1,5 h de cours offerte », « 3 h de cours offertes » (#69 v5) : le participe
              s'accorde avec les heures, réglées en administration (0,5 h, 1 h, 1,5 h sont possibles). */}
          <strong>{`${offre.heures}`.replace('.', ',')} h de cours {accord(offre.heures, 'offerte')}</strong>
          {' '}sur {offre.formulesTexte ? `la formule ${offre.formulesTexte}` : 'nos formules'},
          {' '}le premier mois
        </p>
      </div>

      <div className="rebours__fin">
        {/* LA LÉGENDE MANQUAIT, et deux nombres sans légende ne veulent rien
            dire : « 26 JOURS 19 HEURES » pouvait aussi bien être une durée
            de cours qu’un délai de livraison. C’est la première chose que
            l’œil doit lire dans ce bloc. */}
        <span className="rebours__libelle">
          {dernierJour ? 'Dernier jour — plus que' : 'Fin de l’offre dans'}
        </span>

        {/* `aria-hidden` sur les cases, et une phrase lisible à côté : un
            lecteur d'écran qui épellerait « 12 JOURS 06 HEURES 45 MINUTES »
            case par case donne une bouillie de chiffres. */}
        <div className="rebours__cases" aria-hidden="true">
          {temps.jours > 0 && (
            <span className="rebours__case">
              <strong>{temps.jours}</strong>
              <small>{temps.jours > 1 ? 'jours' : 'jour'}</small>
            </span>
          )}

          <span className="rebours__case">
            <strong>{String(temps.heures).padStart(2, '0')}</strong>
            <small>{temps.heures > 1 ? 'heures' : 'heure'}</small>
          </span>

          {/* LES MINUTES N'APPARAISSENT QU'AU DERNIER JOUR. Avant, elles
              n'ajoutent rien à « il reste 12 jours » ; après, elles sont
              exactement ce qu'on vient regarder. */}
          {dernierJour && (
            <span className="rebours__case">
              <strong>{String(temps.minutes).padStart(2, '0')}</strong>
              <small>min</small>
            </span>
          )}
        </div>

        <span className="visuellement-cache">
          Cette offre se termine dans
          {temps.jours > 0 && ` ${temps.jours} jour${temps.jours > 1 ? 's' : ''} et`}
          {` ${temps.heures} heure${temps.heures > 1 ? 's' : ''}.`}
        </span>
      </div>

      <Link className="btn rebours__bouton" to="/tarifs">
        Voir l’offre
      </Link>
    </div>
  );
}
