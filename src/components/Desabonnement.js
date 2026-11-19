import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  confirmerDesabonnement,
  lireDesabonnement,
  reabonner,
} from '../lib/api/desabonnementApi';

/**
 * « Ne plus recevoir ces messages » — la page d'un lien de courriel.
 *
 * OUVRIR LA PAGE NE DÉSABONNE PAS : c'est le bouton. Les antivirus des
 * messageries ouvrent les liens avant le destinataire ; un désabonnement à
 * l'ouverture désabonnerait des parents qui n'ont rien demandé.
 *
 * ET ON PEUT REVENIR SUR SON CLIC : « Je me suis trompé » réabonne tout de
 * suite, sans avoir à écrire au support.
 *
 * SAUF POUR LES OFFRES, OÙ SE RÉABONNER C'EST CONSENTIR (retour d'Omar, 19/11/2026) : le lien du courriel n'expire pas
 * et peut avoir été transféré. Le bouton n'est proposé qu'à la page qui VIENT de désinscrire (jeton d'annulation rendu
 * par le serveur, valable 30 minutes) ; sinon, on renvoie vers l'espace parent connecté.
 */
export default function Desabonnement() {
  const jeton = new URLSearchParams(window.location.search).get('jeton') ?? '';

  // chargement | pret | fait | invalide | erreur
  const [etat, setEtat] = useState(jeton ? 'chargement' : 'invalide');
  const [libelle, setLibelle] = useState('ces messages');
  const [commerciale, setCommerciale] = useState(false);
  const [jetonAnnulation, setJetonAnnulation] = useState(null);
  const [annulationExpiree, setAnnulationExpiree] = useState(false);
  const [reabonne, setReabonne] = useState(false);
  const [occupe, setOccupe] = useState(false);

  useEffect(() => {
    if (!jeton) return undefined;

    let vivant = true;

    lireDesabonnement(jeton)
      .then(({ data }) => {
        if (!vivant) return;
        setLibelle(data?.libelle ?? 'ces messages');
        setCommerciale(data?.commerciale === true);
        setEtat(data?.desabonne ? 'fait' : 'pret');
      })
      .catch((e) => {
        if (vivant) setEtat(e?.response?.status === 400 ? 'invalide' : 'erreur');
      });

    return () => { vivant = false; };
  }, [jeton]);

  const desabonner = async () => {
    setOccupe(true);

    try {
      const { data } = await confirmerDesabonnement(jeton);
      setJetonAnnulation(data?.jetonAnnulation ?? null);
      setAnnulationExpiree(false);
      setReabonne(false);
      setEtat('fait');
    } catch {
      setEtat('erreur');
    } finally {
      setOccupe(false);
    }
  };

  const seReabonner = async () => {
    setOccupe(true);

    try {
      await reabonner(jeton, jetonAnnulation ?? undefined);
      setJetonAnnulation(null);
      setReabonne(true);
      setEtat('pret');
    } catch (e) {
      // Offres, délai dépassé : on le dit, et on montre où le faire.
      if (e?.response?.status === 403) {
        setJetonAnnulation(null);
        setAnnulationExpiree(true);
      } else {
        setEtat('erreur');
      }
    } finally {
      setOccupe(false);
    }
  };

  // Le bouton « me réabonner » : toujours hors offres ; pour les offres, seulement juste après la désinscription.
  const peutAnnuler = !commerciale || Boolean(jetonAnnulation);

  return (
    <section className="page desabonnement">
      <div className="desabonnement__carte">
        {etat === 'chargement' && <p className="desabonnement__texte">Un instant…</p>}

        {etat === 'pret' && (
          <>
            {reabonne && (
              <p className="desabonnement__confirmation" role="status">
                C’est noté : vous recevez de nouveau {libelle}.
              </p>
            )}
            <h1>Ne plus recevoir {libelle} ?</h1>
            <p className="desabonnement__texte">
              Vous continuerez à recevoir ce qui fait partie du service : les bilans de vos
              enfants et les messages sur votre compte.
            </p>
            <div className="desabonnement__actions">
              <button
                type="button"
                className="btn"
                disabled={occupe}
                onClick={desabonner}
              >
                {occupe ? 'Un instant…' : 'Ne plus recevoir ces messages'}
              </button>
              <Link to="/" className="btn btn--fantome">Retour au site</Link>
            </div>
          </>
        )}

        {etat === 'fait' && (
          <>
            <h1>C’est noté.</h1>
            <p className="desabonnement__texte">Vous ne recevrez plus {libelle}.</p>
            <p className="desabonnement__texte">
              Vous pouvez changer d’avis à tout moment depuis votre espace parent, dans Mon compte&nbsp;› Paramètres.
            </p>
            {annulationExpiree && (
              <p className="desabonnement__texte" role="status">
                Le délai pour annuler depuis cette page est passé : pour recevoir de nouveau nos offres, activez-les
                depuis votre espace parent.
              </p>
            )}
            <div className="desabonnement__actions">
              {peutAnnuler ? (
                <button
                  type="button"
                  className="btn btn--fantome"
                  disabled={occupe}
                  onClick={seReabonner}
                >
                  Je me suis trompé, me réabonner
                </button>
              ) : (
                <Link to="/profil?onglet=parametres" className="btn btn--fantome">Ouvrir mon espace parent</Link>
              )}
              <Link to="/" className="btn">Retour au site</Link>
            </div>
          </>
        )}

        {etat === 'invalide' && (
          <>
            <h1>Ce lien n’est pas valide</h1>
            <p className="desabonnement__texte">
              S’il a été coupé en le copiant, ouvrez-le directement depuis le courriel.
            </p>
          </>
        )}

        {etat === 'erreur' && (
          <>
            <h1>Une erreur est survenue</h1>
            <p className="desabonnement__texte">Réessayez dans un instant.</p>
          </>
        )}
      </div>
    </section>
  );
}
