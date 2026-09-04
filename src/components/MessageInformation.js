import { useEffect, useState } from 'react';
import { getReglages, definirBandeau } from '../lib/api/adminApi';
import { oublierReglages } from '../lib/storage/modeTest';

/**
 * LE BANDEAU D'INFORMATION, CÔTÉ ADMINISTRATION.
 *
 * On écrit un message, on voit à quoi il ressemblera, on décide s'il
 * s'affiche. Une maintenance annoncée, un incident en cours, une nouveauté —
 * ce qui doit atteindre tout le monde tout de suite, sans passer par un
 * courriel que personne n'ouvrira dans l'heure.
 *
 * DANS L'ONGLET « MAILS », ET C'EST VOULU
 * ---------------------------------------
 * Ce n'est pas un réglage, c'est une prise de parole — la même intention que
 * la diffusion, un autre canal. Un message urgent se cherche là où on a
 * l'habitude d'écrire aux gens, pas dans la liste des interrupteurs.
 *
 * L'APERÇU EST LE VRAI BANDEAU, PAS UNE MAQUETTE
 * ----------------------------------------------
 * Mêmes classes, même mise en forme, à côté du champ de saisie. Un texte qui
 * tient dans le champ mais déborde en haut du site est le défaut le plus
 * probable de cet écran ; le montrer coûte trois lignes et l'élimine.
 *
 * LE BOUTON D'EXTINCTION EST SÉPARÉ DE L'ENREGISTREMENT. « Retirer le
 * bandeau » se clique dans l'urgence, quand on vient d'afficher une bêtise :
 * il ne doit pas obliger à d'abord vider un champ ni à décocher une case.
 */

/** La même borne que le serveur — il refuse au-delà. */
const LONGUEUR_MAX = 300;

export default function MessageInformation() {
  const [message, setMessage] = useState('');
  const [actif, setActif] = useState(false);

  // Ce qui est ENREGISTRÉ, par opposition à ce qui est tapé. Sans cette
  // copie, on ne peut pas dire à l'administrateur qu'il a des modifications
  // non enregistrées — et c'est exactement l'erreur qu'on veut éviter :
  // écrire un message, partir, et croire qu'il est affiché.
  const [enregistre, setEnregistre] = useState({ message: '', actif: false });

  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let vivant = true;

    getReglages()
      .then(({ data }) => {
        if (!vivant) return;

        const lu = {
          message: data?.bandeauMessage ?? '',
          actif: Boolean(data?.bandeauActif),
        };

        setMessage(lu.message);
        setActif(lu.actif);
        setEnregistre(lu);
      })
      .catch(() => {
        if (vivant) setErreur("Le message n'a pas pu être chargé.");
      })
      .finally(() => {
        if (vivant) setChargement(false);
      });

    return () => { vivant = false; };
  }, []);

  const propre = message.trim();
  const modifie = propre !== enregistre.message || actif !== enregistre.actif;
  const restant = LONGUEUR_MAX - message.length;

  /**
   * Enregistre le texte ET son affichage d'un seul geste.
   *
   * `oublierReglages` derrière : les drapeaux publics sont retenus le temps
   * d'une session. Sans cet oubli, l'administrateur afficherait son bandeau
   * et ne verrait rien changer sur son propre écran — il en conclurait que
   * ça n'a pas marché, et recommencerait.
   */
  const enregistrer = async (afficher) => {
    setEnvoi(true);
    setErreur(null);
    setConfirmation(null);

    try {
      await definirBandeau(propre, afficher);

      setMessage(propre);
      setActif(afficher);
      setEnregistre({ message: propre, actif: afficher });

      oublierReglages();

      setConfirmation(
        afficher
          ? 'Le bandeau est affiché en haut du site.'
          : 'Le bandeau est masqué. Le texte est conservé.',
      );
    } catch (e) {
      setErreur(
        e?.response?.data?.message ?? "Le message n'a pas pu être enregistré.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  if (chargement) return <p className="etat-vide">Chargement…</p>;

  return (
    <div className="info-bandeau">
      {erreur && <div className="alert">{erreur}</div>}
      {confirmation && <div className="info-bandeau__ok">{confirmation}</div>}

      {/* L'ÉTAT AVANT LE FORMULAIRE. En arrivant sur cet écran, la première
          question n'est pas « qu'est-ce que j'écris » mais « est-ce qu'il y a
          quelque chose d'affiché en ce moment ». */}
      <div className={`info-bandeau__etat ${enregistre.actif ? 'est-active' : ''}`}>
        <strong>
          {enregistre.actif
            ? 'Un bandeau est actuellement affiché sur le site.'
            : 'Aucun bandeau n’est affiché.'}
        </strong>

        {!enregistre.actif && enregistre.message && (
          <span>Un texte est enregistré, prêt à être affiché.</span>
        )}
      </div>

      <div className="champ">
        <label htmlFor="bandeau-texte">Message affiché en haut du site</label>
        <textarea
          id="bandeau-texte"
          rows={3}
          maxLength={LONGUEUR_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Maintenance prévue dimanche 7 septembre de 8h à 10h : le site sera indisponible."
        />
        <span className="champ__aide">
          {/* La longueur restante n'apparaît qu'à l'approche de la limite :
              un compteur permanent donne l'impression d'un devoir noté. */}
          Une ou deux phrases. Ce texte s’affiche sur toutes les pages, pour
          tout le monde — y compris les visiteurs non connectés.
          {restant <= 60 && (
            <strong className={restant <= 10 ? 'info-bandeau__reste-court' : ''}>
              {' '}Il reste {restant} caractère(s).
            </strong>
          )}
        </span>
      </div>

      {/* L'APERÇU : le vrai bandeau, avec ses vraies classes. */}
      {propre && (
        <div className="info-bandeau__apercu">
          <span className="info-bandeau__apercu-titre">Aperçu</span>

          <div className="bandeau-info" role="presentation">
            <span className="bandeau-info__icone" aria-hidden="true">!</span>
            <p className="bandeau-info__texte">{propre}</p>
          </div>
        </div>
      )}

      <div className="info-bandeau__actions">
        <button
          type="button"
          className="btn btn--compact"
          disabled={envoi || propre.length === 0 || (enregistre.actif && !modifie)}
          onClick={() => enregistrer(true)}
        >
          {envoi
            ? 'Enregistrement…'
            : enregistre.actif
              ? 'Mettre à jour le bandeau'
              : 'Afficher sur le site'}
        </button>

        {/* Toujours proposé quand un bandeau est affiché, même sans
            modification en cours : c'est le geste d'urgence de cet écran. */}
        {enregistre.actif && (
          <button
            type="button"
            className="btn btn--compact btn--danger"
            disabled={envoi}
            onClick={() => enregistrer(false)}
          >
            Retirer le bandeau
          </button>
        )}

        {/* Enregistrer sans afficher : préparer le message de dimanche le
            vendredi, sans l'annoncer trois jours trop tôt. */}
        {!enregistre.actif && modifie && propre.length > 0 && (
          <button
            type="button"
            className="btn btn--compact btn--fantome"
            disabled={envoi}
            onClick={() => enregistrer(false)}
          >
            Enregistrer sans afficher
          </button>
        )}
      </div>

      {modifie && !envoi && (
        <p className="info-bandeau__avertissement">
          Vos modifications ne sont pas encore enregistrées.
        </p>
      )}

      <p className="info-bandeau__note">
        Le visiteur ne peut pas le masquer : il reste affiché tant que vous ne
        l’avez pas retiré ici. Pensez à le retirer quand l’information n’est
        plus vraie.
      </p>
    </div>
  );
}
