import { useState } from 'react';
import { useSelector } from 'react-redux';
import { envoyerMessageContact } from '../lib/api/contactApi';

/**
 * Le formulaire de contact.
 *
 * OUVERT SANS CONNEXION, À DESSEIN
 * --------------------------------
 * Les personnes qui ont le plus besoin d'écrire sont souvent celles qui
 * n'arrivent pas à entrer : mot de passe perdu, paiement refusé, compte
 * introuvable. Exiger d'être connecté pour signaler qu'on n'y arrive pas
 * serait absurde.
 *
 * Un membre connecté, lui, n'a pas à retaper son adresse : elle est déjà
 * connue, et le serveur la reprend de son jeton quoi qu'il arrive.
 */
export default function Contact() {
  const { authentifie, utilisateur } = useSelector((state) => state.auth);
  const mailConnu = utilisateur?.email ?? '';
  const prenomConnu = utilisateur?.given_name ?? '';

  const [nom, setNom] = useState(prenomConnu);
  const [mail, setMail] = useState('');
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [site, setSite] = useState(''); // piège à robots
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [envoye, setEnvoye] = useState(false);

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    setErreur(null);
    setEnvoi(true);

    try {
      await envoyerMessageContact({
        nom: nom.trim(),
        // Inutile de l'envoyer quand le jeton la porte : le serveur ignore
        // ce champ pour un membre connecté.
        mail: authentifie ? undefined : mail.trim(),
        sujet: sujet.trim(),
        message: message.trim(),
        site,
      });
      setEnvoye(true);
    } catch (e) {
      setErreur(
        e?.response?.data?.message
        ?? "L'envoi a échoué. Vérifiez votre connexion et réessayez."
      );
    } finally {
      setEnvoi(false);
    }
  };

  if (envoye) {
    return (
      <section className="contact">
        <div className="contact__recu" role="status">
          <span className="contact__recu-marque" aria-hidden="true">✓</span>
          <h1 className="contact__titre">Message reçu</h1>
          <p className="contact__intro">
            Merci. Nous vous répondons à{' '}
            <strong>{authentifie ? mailConnu : mail}</strong>, en général sous
            vingt-quatre heures ouvrées.
          </p>
          <button
            type="button"
            className="btn btn--fantome"
            onClick={() => { setEnvoye(false); setSujet(''); setMessage(''); }}
          >
            Écrire un autre message
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="contact">
      <header className="contact__entete">
        <p className="contact__surtitre">Une question&nbsp;?</p>
        <h1 className="contact__titre">Écrivez-nous</h1>
        <p className="contact__intro">
          Un doute sur une formule, un souci technique, une remarque sur ce que
          fait le professeur avec votre enfant&nbsp;: tout nous intéresse.
        </p>
      </header>

      <form className="contact__form" onSubmit={soumettre}>
        <div className="champ">
          <label htmlFor="contact-nom">Votre nom</label>
          <input
            id="contact-nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
          />
        </div>

        {/* Un membre connecté ne retape pas son adresse : elle est affichée,
            verrouillée, et c'est de toute façon celle du jeton qui fait foi
            côté serveur. */}
        {authentifie ? (
          <div className="champ">
            <label htmlFor="contact-mail">Votre adresse e-mail</label>
            <input id="contact-mail" value={mailConnu} readOnly disabled />
            <p className="champ__aide">
              L'adresse de votre compte. Nous répondrons ici.
            </p>
          </div>
        ) : (
          <div className="champ">
            <label htmlFor="contact-mail">Votre adresse e-mail</label>
            <input
              id="contact-mail"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              required
              maxLength={180}
              autoComplete="email"
              placeholder="prenom@exemple.fr"
            />
            <p className="champ__aide">C'est à cette adresse que nous répondrons.</p>
          </div>
        )}

        <div className="champ">
          <label htmlFor="contact-sujet">Sujet</label>
          <input
            id="contact-sujet"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            required
            minLength={3}
            maxLength={120}
            placeholder="Par exemple : problème de connexion"
          />
        </div>

        <div className="champ">
          <label htmlFor="contact-message">Votre message</label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            maxLength={4000}
            rows={8}
          />
          <p className="champ__aide">{message.length} / 4000</p>
        </div>

        {/* Piège à robots : caché à l'œil ET aux lecteurs d'écran, jamais
            atteignable au clavier. Un humain ne peut donc pas le remplir par
            mégarde et voir son message disparaître en silence. */}
        <div className="contact__piege" aria-hidden="true">
          <label htmlFor="contact-site">Ne pas remplir</label>
          <input
            id="contact-site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {erreur && <p className="contact__erreur" role="alert">{erreur}</p>}

        <button type="submit" className="btn btn--principal" disabled={envoi}>
          {envoi ? 'Envoi…' : 'Envoyer le message'}
        </button>
      </form>
    </section>
  );
}
