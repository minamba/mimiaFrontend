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
 */
export default function Desabonnement() {
  const jeton = new URLSearchParams(window.location.search).get('jeton') ?? '';

  // chargement | pret | fait | invalide | erreur
  const [etat, setEtat] = useState(jeton ? 'chargement' : 'invalide');
  const [libelle, setLibelle] = useState('ces messages');
  const [reabonne, setReabonne] = useState(false);
  const [occupe, setOccupe] = useState(false);

  useEffect(() => {
    if (!jeton) return undefined;

    let vivant = true;

    lireDesabonnement(jeton)
      .then(({ data }) => {
        if (!vivant) return;
        setLibelle(data?.libelle ?? 'ces messages');
        setEtat(data?.desabonne ? 'fait' : 'pret');
      })
      .catch((e) => {
        if (vivant) setEtat(e?.response?.status === 400 ? 'invalide' : 'erreur');
      });

    return () => { vivant = false; };
  }, [jeton]);

  const agir = async (appel, suivant, estReabonne) => {
    setOccupe(true);

    try {
      await appel(jeton);
      setReabonne(estReabonne);
      setEtat(suivant);
    } catch {
      setEtat('erreur');
    } finally {
      setOccupe(false);
    }
  };

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
                onClick={() => agir(confirmerDesabonnement, 'fait', false)}
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
            <div className="desabonnement__actions">
              <button
                type="button"
                className="btn btn--fantome"
                disabled={occupe}
                onClick={() => agir(reabonner, 'pret', true)}
              >
                Je me suis trompé, me réabonner
              </button>
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
