import { useCallback, useEffect, useState } from 'react';
import { getAvisARelire, publierAvis, supprimerAvis } from '../lib/api/avisApi';
import Etoiles from './Etoiles';

/**
 * La relecture des avis, dans l'administration.
 *
 * POURQUOI CET ÉCRAN EST OBLIGATOIRE
 * ----------------------------------
 * Sans lui, aucun avis n'apparaît jamais : ils arrivent tous en attente. Ce
 * n'est pas une précaution ajoutée après coup, c'est la moitié du dispositif.
 *
 * La page d'accueil d'un service destiné à des ENFANTS accepterait sinon du
 * texte libre, écrit par n'importe quel compte, visible immédiatement et
 * indexé par les moteurs. Une insulte, une adresse, le prénom d'un enfant :
 * rien de tout cela ne se rattrape, et personne ne surveille une page
 * d'accueil en permanence.
 *
 * PUBLIER N'EST PAS FLATTER. Un trois étoiles argumenté vaut mieux qu'une page
 * de cinq étoiles que personne ne croit : ce qu'on retire, ce sont les abus,
 * pas les reproches.
 */
export default function RelectureAvis() {
  const [avis, setAvis] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const { data } = await getAvisARelire();
      setAvis(data ?? []);
    } catch {
      setErreur("Les avis n'ont pas pu être chargés.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const basculer = async (a) => {
    setEnCours(a.id);

    try {
      await publierAvis(a.id, !a.publie);
      await charger();
    } catch {
      setErreur("La publication n'a pas pu être modifiée.");
    } finally {
      setEnCours(null);
    }
  };

  const retirer = async (a) => {
    const question = `Supprimer définitivement l'avis de ${a.auteur} ? `
      + 'Dépublier suffit si vous voulez seulement le retirer de la vitrine.';

    if (!window.confirm(question)) return;

    setEnCours(a.id);

    try {
      await supprimerAvis(a.id);
      await charger();
    } catch {
      setErreur("L'avis n'a pas pu être supprimé.");
    } finally {
      setEnCours(null);
    }
  };

  const attente = avis.filter((a) => !a.publie).length;

  if (chargement) return <div className="vide">Chargement…</div>;

  return (
    <>
      {erreur && <div className="alert">{erreur}</div>}

      <p className="relecture__resume">
        {avis.length === 0
          ? 'Aucun avis pour le moment.'
          : `${avis.length} avis, dont ${attente} en attente de relecture.`}
      </p>

      <ul className="relecture">
        {avis.map((a) => (
          <li key={a.id} className={a.publie ? 'relecture__carte' : 'relecture__carte relecture__carte--attente'}>
            <div className="relecture__entete">
              <Etoiles note={a.note} />
              <span className="relecture__auteur">{a.auteur}</span>
              <span className="relecture__mail">{a.mail}</span>
              {a.abonne && <span className="avis__verifie">Client abonné</span>}
              <span className={a.publie ? 'badge' : 'badge badge--discret'}>
                {a.publie ? 'En ligne' : 'En attente'}
              </span>
            </div>

            {a.titre && <h4 className="relecture__titre">{a.titre}</h4>}

            {a.commentaire
              ? <p className="relecture__texte">{a.commentaire}</p>
              : <p className="relecture__texte relecture__texte--vide">Une note seule, sans commentaire.</p>}

            <div className="relecture__pied">
              <time dateTime={a.date}>
                {new Date(a.date).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
                {a.dateModification && ' · modifié depuis'}
              </time>

              <div className="relecture__actions">
                {/* DÉPUBLIER AVANT SUPPRIMER, dans cet ordre et avec cette
                    couleur : retirer de la vitrine est réversible, effacer ne
                    l'est pas. Le geste le moins grave doit être le plus
                    accessible. */}
                <button
                  type="button"
                  className={a.publie ? 'btn-ghost btn-ghost--mini' : 'btn-ghost btn-ghost--mini btn-ghost--accent'}
                  disabled={enCours === a.id}
                  onClick={() => basculer(a)}
                >
                  {enCours === a.id ? '…' : a.publie ? 'Retirer de la vitrine' : 'Publier'}
                </button>

                <button
                  type="button"
                  className="btn-ghost btn-ghost--mini btn-ghost--danger"
                  disabled={enCours === a.id}
                  onClick={() => retirer(a)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
