import { useEffect, useState } from 'react';
import iconeAutre from '../assets/autre.png';
import iconeProfesseur from '../assets/prob_prof.png';
import iconeTechnique from '../assets/prob_technique.png';
import iconeSuggestion from '../assets/suggestion.png';
import { creerSignalement } from '../lib/api/signalementsApi';

/** Le drapeau du bouton flottant — un trait, pas un emoji, pour rester net à toute taille d'écran. */
function IconeDrapeau() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21V4" />
      <path d="M5 4.5h13l-3.2 4L18 12.5H5" />
    </svg>
  );
}

/** Le rond coché de l'écran de confirmation. */
function IconeEnvoye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M7.8 12.4 10.4 15l6-6.2" />
    </svg>
  );
}

/**
 * Les quatre catégories, chacune avec son illustration — Camara, le
 * 14/09/2026 : des images au-dessus du libellé plutôt que des pictogrammes au
 * trait à côté. Décoratives : le libellé, juste dessous, dit la catégorie.
 */
const CATEGORIES = [
  { code: 'PROFESSEUR', libelle: 'Problème avec un professeur', image: iconeProfesseur },
  { code: 'TECHNIQUE', libelle: 'Problème technique', image: iconeTechnique },
  { code: 'SUGGESTION', libelle: 'Suggestion', image: iconeSuggestion },
  { code: 'AUTRE', libelle: 'Autre', image: iconeAutre },
];

const LONGUEUR_MAX = 2000;

/**
 * Le bouton « Signaler », flottant en bas à droite sur tout l'écran une fois
 * connecté — parent ou enfant.
 *
 * L'envoi ne réclame que la catégorie et le texte : le serveur retrouve seul
 * qui écrit (et son parent, si c'est un enfant) depuis le jeton, comme
 * partout ailleurs dans l'application — rien à lui redonner ici.
 */
export default function BoutonSignalement() {
  const [ouvert, setOuvert] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [categorie, setCategorie] = useState('TECHNIQUE');
  const [description, setDescription] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const fermer = () => {
    setOuvert(false);
    // Réinitialisé à la fermeture, pas à l'envoi : rouvrir juste après un
    // envoi réussi ne doit pas retrouver le message de la fois précédente.
    setEnvoye(false);
    setCategorie('TECHNIQUE');
    setDescription('');
    setErreur(null);
  };

  // Échap referme, comme partout ailleurs dans l'application.
  useEffect(() => {
    if (!ouvert) return undefined;

    const auClavier = (e) => { if (e.key === 'Escape') fermer(); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [ouvert]);

  const soumettre = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setEnvoi(true);
    setErreur(null);

    try {
      await creerSignalement(categorie, description.trim());
      setEnvoye(true);
    } catch {
      setErreur("L'envoi a échoué. Réessayez dans un instant.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="bouton-signalement"
        onClick={() => setOuvert(true)}
      >
        <span className="bouton-signalement__icone"><IconeDrapeau /></span>
        Signaler
      </button>

      {ouvert && (
        <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-signalement">
          <div className="modale__boite modale__boite--signalement">
            {envoye ? (
              <div className="signalement-envoye">
                <span className="signalement-envoye__icone"><IconeEnvoye /></span>
                <h2 id="titre-signalement">Message envoyé</h2>
                <p className="modale__texte">
                  Votre message a bien été envoyé, il sera traité par l’équipe mimia.fr.
                </p>
                <div className="modale__actions">
                  <button type="button" className="btn" onClick={fermer}>Fermer</button>
                </div>
              </div>
            ) : (
              // EN TROIS PARTIES : en-tête figé, corps qui défile, boutons
              // figés — relevé par Camara le 15/09/2026, sur téléphone comme
              // sur un écran d'ordinateur peu haut, les boutons sortaient de
              // la fenêtre et on ne pouvait plus envoyer.
              <form onSubmit={soumettre} className="signalement-modale__formulaire">
                {/* L'EN-TÊTE, MIS EN VALEUR SANS CHANGER UN MOT — Camara, le
                    14/09/2026. Le médaillon reprend le drapeau du bouton
                    « Signaler » qui a ouvert la fenêtre : on sait d'où l'on
                    vient. Le filet dessous sépare ce qui se lit de ce qui se
                    remplit. */}
                <header className="signalement-modale__entete">
                  <span className="signalement-modale__badge" aria-hidden="true">
                    <IconeDrapeau />
                  </span>
                  <div>
                    <h2 id="titre-signalement" className="signalement-modale__titre">
                      Signaler un problème
                    </h2>
                    <p className="modale__texte signalement-modale__intro">
                      Dites-nous ce qui ne va pas, ou ce que vous aimeriez voir : nous lisons chaque message.
                    </p>
                  </div>
                </header>

                <div className="modale__corps">
                {erreur && <div className="alert">{erreur}</div>}

                <span className="champ__intitule">Catégorie</span>
                <div className="signalement-modale__categories">
                  {CATEGORIES.map(({ code, libelle, image }) => (
                    <button
                      key={code}
                      type="button"
                      className={[
                        'signalement-categorie',
                        categorie === code ? 'signalement-categorie--active' : '',
                      ].filter(Boolean).join(' ')}
                      aria-pressed={categorie === code}
                      onClick={() => setCategorie(code)}
                    >
                      <img className="signalement-categorie__icone" src={image} alt="" />
                      <span className="signalement-categorie__libelle">{libelle}</span>
                    </button>
                  ))}
                </div>

                <div className="champ">
                  <label htmlFor="signalement-description">Description</label>
                  <textarea
                    id="signalement-description"
                    rows={5}
                    maxLength={LONGUEUR_MAX}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le problème ou votre suggestion…"
                    required
                  />
                  <span className="champ__aide signalement-modale__compteur">
                    {description.length}/{LONGUEUR_MAX}
                  </span>
                </div>
                </div>

                <div className="modale__actions">
                  <button type="button" className="btn-ghost" onClick={fermer}>
                    Annuler
                  </button>
                  <button type="submit" className="btn" disabled={envoi || !description.trim()}>
                    {envoi ? 'Envoi…' : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
