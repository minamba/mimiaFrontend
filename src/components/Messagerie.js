import { useCallback, useEffect, useState } from 'react';
import {
  getMessages,
  getMessage,
  marquerMessageLu,
  repondreMessage,
} from '../lib/api/adminApi';
import Loader from './Loader';

/**
 * La boîte de support, lue et répondue depuis l'administration.
 *
 * LE CORPS DES MESSAGES EST DU CONTENU HOSTILE
 * --------------------------------------------
 * N'importe qui connaissant `support@mimia.fr` peut y écrire ce qu'il veut, et
 * cet écran tourne dans une session qui a tous les droits. Le HTML reçu est
 * donc affiché dans un cadre isolé, sans droit d'exécution ni accès à la page
 * qui le contient — et il a déjà été nettoyé côté serveur.
 *
 * Deux barrières, dont aucune ne suffirait seule : un nettoyage par motifs est
 * faillible par construction, et un cadre isolé est une case à cocher qu'on
 * oublie.
 */
export default function Messagerie() {
  const [messages, setMessages] = useState(null);
  const [configuree, setConfiguree] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [ouvert, setOuvert] = useState(null);
  const [chargementCorps, setChargementCorps] = useState(false);
  const [images, setImages] = useState(false);

  const [reponse, setReponse] = useState('');
  const [envoi, setEnvoi] = useState(false);
  // Le compte rendu de l'envoi, tel que le serveur l'a dit : destinataire
  // réel, accusé SMTP, dépôt de la copie. « Réponse envoyée » ne suffit pas
  // quand le message n'arrive pas — c'est ce qui nous a coûté une heure.
  const [envoye, setEnvoye] = useState(null);

  const charger = useCallback(async () => {
    setErreur(null);

    try {
      const { data } = await getMessages();
      setConfiguree(data?.configuree !== false);
      setMessages(data?.messages ?? []);

      // UNE BOÎTE INJOIGNABLE N'EST PAS UNE BOÎTE VIDE.
      //
      // Sans ce message, une panne d'authentification s'affichait « aucun
      // message » — et on cherchait pourquoi les parents n'écrivaient plus,
      // alors que c'est la lecture qui échouait.
      if (data?.erreur) setErreur(`La boîte n'a pas pu être lue : ${data.erreur}`);
    } catch {
      setErreur("La boîte n'a pas pu être consultée.");
      setMessages([]);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ouvrir = async (message, avecImages = false) => {
    setChargementCorps(true);
    setEnvoye(null);
    setErreur(null);

    try {
      const { data } = await getMessage(message.identifiant, avecImages);
      setOuvert(data);
      setImages(avecImages);
      setReponse('');

      // La liste reflète le nouvel état sans recharger toute la boîte : une
      // seconde requête IMAP pour changer une pastille serait du gaspillage.
      setMessages((liste) =>
        liste.map((m) => (m.identifiant === message.identifiant ? { ...m, lu: true } : m)));
    } catch {
      setErreur("Ce message n'a pas pu être ouvert. Il a peut-être été supprimé.");
    } finally {
      setChargementCorps(false);
    }
  };

  const basculerLu = async (message) => {
    const nouveau = !message.lu;

    setMessages((liste) =>
      liste.map((m) => (m.identifiant === message.identifiant ? { ...m, lu: nouveau } : m)));

    try {
      await marquerMessageLu(message.identifiant, nouveau);
    } catch {
      // On remet la pastille comme elle était : afficher un état qu'on n'a pas
      // réussi à enregistrer ferait croire le message traité.
      setMessages((liste) =>
        liste.map((m) => (m.identifiant === message.identifiant ? { ...m, lu: !nouveau } : m)));
    }
  };

  const envoyer = async () => {
    if (!ouvert || !reponse.trim()) return;

    setEnvoi(true);
    setErreur(null);

    try {
      const { data } = await repondreMessage(ouvert.identifiant, reponse);
      setEnvoye(data ?? { message: 'Réponse envoyée.' });
      setReponse('');

      setMessages((liste) =>
        liste.map((m) => (m.identifiant === ouvert.identifiant ? { ...m, repondu: true } : m)));
    } catch (e) {
      setErreur(
        e?.response?.data?.detail
          ? `La réponse n'est pas partie — ${e.response.data.detail}`
          : "La réponse n'est pas partie. Réessayez dans un instant.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  if (!configuree) {
    return (
      <div className="messagerie__vide">
        <strong>La boîte de support n’est pas configurée.</strong>
        <p>
          Renseignez le mot de passe de <code>support@mimia.fr</code> dans la
          section <code>Messagerie</code> de la configuration, ou via la
          variable d’environnement <code>SUPPORT_PASSWORD</code>, puis
          redémarrez l’API.
        </p>
      </div>
    );
  }

  if (!messages) return <Loader texte="Ouverture de la boîte…" />;

  return (
    <div className="messagerie">
      {erreur && <div className="alert">{erreur}</div>}

      <div className="messagerie__barre">
        <span className="messagerie__compte">
          {messages.length} message{messages.length > 1 ? 's' : ''}
          {messages.some((m) => !m.lu) && (
            <em> · {messages.filter((m) => !m.lu).length} non lu(s)</em>
          )}
        </span>

        <button type="button" className="btn btn--compact btn--fantome" onClick={charger}>
          Rafraîchir
        </button>
      </div>

      <div className="messagerie__grille">
        {/* -------------------------------------------------------- liste */}
        <ul className="messagerie__liste">
          {messages.length === 0 && (
            <li className="messagerie__aucun">
              {erreur
                ? 'La boîte n’a pas pu être lue — voir le message ci-dessus.'
                : 'Aucun message dans la boîte.'}
            </li>
          )}

          {messages.map((m) => (
            <li
              key={m.identifiant}
              className={[
                'messagerie__ligne',
                m.lu ? '' : 'est-non-lu',
                ouvert?.identifiant === m.identifiant ? 'est-ouvert' : '',
              ].join(' ')}
            >
              <button type="button" className="messagerie__ouvrir" onClick={() => ouvrir(m)}>
                <span className="messagerie__de">{m.deNom || m.deAdresse || '—'}</span>
                <span className="messagerie__sujet">{m.sujet || '(sans objet)'}</span>
                <span className="messagerie__extrait">{m.extrait}</span>

                <span className="messagerie__meta">
                  {new Date(m.date).toLocaleDateString('fr-FR')}
                  {m.avecPiecesJointes && <span title="Pièce jointe"> 📎</span>}

                  {/* L'ÉTAT EST UNE ÉTIQUETTE, L'ACTION EST UN BOUTON.
                      Les deux étaient confondus : le bouton portait « Non lu »
                      pour dire « cliquez pour marquer non lu », et se lisait
                      comme un statut. Un message qui arrive non lu affichait
                      donc « Lu », et l'inverse une fois ouvert. */}
                  {!m.lu && <span className="messagerie__badge-nonlu">non lu</span>}
                  {m.repondu && <span className="messagerie__repondu">répondu</span>}
                </span>
              </button>

              <button
                type="button"
                className="btn-ghost btn-ghost--mini"
                onClick={() => basculerLu(m)}
              >
                {m.lu ? 'Marquer non lu' : 'Marquer lu'}
              </button>
            </li>
          ))}
        </ul>

        {/* ------------------------------------------------------ lecture */}
        <div className="messagerie__lecture">
          {chargementCorps && <Loader texte="Ouverture du message…" />}

          {!chargementCorps && !ouvert && (
            <p className="messagerie__invite">
              Choisissez un message à gauche pour le lire et y répondre.
            </p>
          )}

          {!chargementCorps && ouvert && (
            <>
              <div className="messagerie__entete">
                <h3>{ouvert.sujet || '(sans objet)'}</h3>
                <p>
                  {ouvert.deNom ? `${ouvert.deNom} — ` : ''}
                  <a href={`mailto:${ouvert.deAdresse}`}>{ouvert.deAdresse}</a>
                  {' · '}
                  {new Date(ouvert.date).toLocaleString('fr-FR')}
                </p>
              </div>

              {ouvert.imagesBloquees && !images && (
                <div className="messagerie__images-bloquees">
                  <span>
                    Les images distantes sont bloquées. Elles servent souvent à
                    savoir si vous avez ouvert le message.
                  </span>
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--mini"
                    onClick={() => ouvrir(ouvert, true)}
                  >
                    Afficher les images
                  </button>
                </div>
              )}

              {/* LE CADRE ISOLÉ, SECONDE BARRIÈRE.
                  `sandbox` vide retire TOUT : pas de script, pas d'accès à la
                  page qui contient le cadre, pas de navigation imposée. Le
                  contenu ne peut plus rien faire d'autre que s'afficher. */}
              {ouvert.html ? (
                <iframe
                  title="Contenu du message"
                  className="messagerie__corps"
                  sandbox=""
                  srcDoc={ouvert.html}
                />
              ) : (
                <pre className="messagerie__corps-texte">{ouvert.texte || '(message vide)'}</pre>
              )}

              {ouvert.piecesJointes?.length > 0 && (
                <div className="messagerie__pieces">
                  <strong>Pièces jointes</strong>
                  <ul>
                    {ouvert.piecesJointes.map((p) => (
                      <li key={p.nomFichier}>📎 {p.nomFichier}</li>
                    ))}
                  </ul>
                  <span className="champ__aide">
                    Les pièces jointes se téléchargent depuis votre webmail —
                    elles ne sont pas rapatriées ici.
                  </span>
                </div>
              )}

              {/* ---------------------------------------------------- réponse */}
              <div className="messagerie__reponse">
                <label htmlFor="msg-reponse">Votre réponse</label>
                <textarea
                  id="msg-reponse"
                  rows={8}
                  value={reponse}
                  onChange={(e) => {
                    setReponse(e.target.value);

                    // La confirmation du précédent envoi s'efface dès qu'on
                    // recommence à écrire : « Réponse envoyée » affiché
                    // au-dessus d'un message en cours de rédaction laisse
                    // croire que celui-ci est déjà parti.
                    if (envoye) setEnvoye(null);
                  }}
                  placeholder={'Bonjour,\n\nUne ligne vide sépare deux paragraphes.\n\nBien à vous,\nL’équipe Mimia'}
                />

                <span className="champ__aide">
                  Elle partira de <strong>support@mimia.fr</strong>, mise en page
                  aux couleurs du site, et rattachée à ce fil de discussion.
                </span>

                <div className="messagerie__reponse-actions">
                  <button
                    type="button"
                    className="btn btn--compact"
                    disabled={envoi || !reponse.trim()}
                    onClick={envoyer}
                  >
                    {envoi ? 'Envoi…' : 'Envoyer la réponse'}
                  </button>

                  {envoye && (
                    <span className="messagerie__succes">
                      Envoyée à <strong>{envoye.destinataire}</strong>
                      {envoye.accuse && (
                        <>
                          {' · '}
                          <code>{envoye.accuse}</code>
                        </>
                      )}
                      {envoye.copieDeposee === false && (
                        <em> · copie non déposée dans Envoyés</em>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
