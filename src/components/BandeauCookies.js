import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ACCEPTE, useConsentement } from '../lib/storage/consentement';
import { chargerClarity, clarityConfigure, refuserClarity } from '../lib/analytics/clarity';
import { prefixePrive } from '../lib/seo/pages';

/**
 * LE BANDEAU DE CONSENTEMENT.
 *
 * Camara, le 23/09/2026 : « va falloir mettre la petite fenêtre pour les
 * cookies ».
 *
 * UN BANDEAU EN BAS, PAS UNE FENÊTRE QUI BARRE LA PAGE. La même raison que
 * `BandeauInfo` : une modale transforme une information en péage. Ici s'ajoute
 * que le visiteur vient LIRE — lui masquer la page qu'il découvre pour lui
 * poser une question sur des cookies est le meilleur moyen de le faire partir
 * avant d'avoir vu le produit. En bas, il lit d'abord, il répond quand il veut.
 *
 * « ACCEPTER » ET « REFUSER » DU MÊME POIDS, CÔTE À CÔTE. Refuser doit être
 * aussi simple qu'accepter : c'est la règle de la CNIL, et c'est aussi la
 * seule forme honnête. Pas de « Accepter » en couleur vive face à un
 * « Paramétrer » gris qui ouvre trois écrans.
 *
 * PAS DE CROIX DE FERMETURE. Fermer sans répondre laisserait la question en
 * suspens sans que le visiteur l'ait tranchée — et le bandeau reparaîtrait à
 * la visite suivante, ce qui se lit comme un défaut. Deux réponses, c'est
 * tout ; l'une d'elles est « non », et elle est définitive tant qu'il ne
 * revient pas dessus par le pied de page.
 *
 * IL NE SORT QUE SUR LE SITE PUBLIC, comme Clarity lui-même : dans l'espace
 * connecté il n'y a rien à mesurer, donc rien à demander.
 *
 * LE TEXTE RESTE GÉNÉRAL, ET C'EST VOULU — Camara, le 23/09/2026 : « ça fait
 * peur là ». La première version promettait que l'outil « ne fonctionne jamais
 * pendant les cours » et « ne voit rien du travail de votre enfant ». Tout y
 * était vrai, et c'était quand même une erreur : un parent qui n'avait aucune
 * inquiétude sur ce que Mimia fait de ses enfants en repartait avec une. Se
 * défendre d'un soupçon, c'est l'installer.
 *
 * Le détail — ce que Clarity dépose, ce qu'il enregistre, ce qu'il ne voit
 * jamais — est à sa vraie place : la page de confidentialité, où on va quand
 * on veut savoir. Le bandeau dit ce qu'on fait et laisse partir.
 */
export default function BandeauCookies() {
  const { pathname } = useLocation();
  const { choix, accepter, refuser } = useConsentement();

  const dansLEspacePrive = Boolean(prefixePrive(pathname));

  // LE CHARGEMENT SUIT LE CHOIX, ET NON LE CLIC. Branché ici plutôt que dans
  // le bouton, il s'applique aussi au visiteur qui revient avec un « oui »
  // déjà enregistré — sans quoi Clarity ne tournerait qu'à la visite où il a
  // répondu, une fois dans sa vie.
  useEffect(() => {
    if (dansLEspacePrive) return;

    if (choix === ACCEPTE) chargerClarity();
  }, [choix, dansLEspacePrive]);

  // EN DÉVELOPPEMENT, ON LE VOIT — et rien ne part quand même.
  //
  // Camara, le 23/09/2026 : « fais-la apparaître de force en dev, je veux la
  // valider moi-même ». Sans ça, la carte n'était visible qu'en production :
  // pour juger un mot ou une couleur il fallait construire, publier, puis
  // rouvrir la question depuis le pied de page — et on se retrouvait à
  // arbitrer un texte sur le site en ligne, devant de vrais visiteurs.
  //
  // Clarity, lui, ne se charge toujours pas : `chargerClarity()` refuse sans
  // identifiant, et `.env.development` n'en a pas. On voit donc la question
  // sans que la mesure démarre — ce qui est exactement ce qu'on veut d'un
  // environnement de travail.
  const enDeveloppement = process.env.NODE_ENV === 'development';

  // Rien à demander : pas de projet Clarity et pas en développement, question
  // déjà tranchée, ou espace connecté.
  if ((!clarityConfigure() && !enDeveloppement) || choix || dansLEspacePrive) return null;

  return (
    <div className="cookies" role="region" aria-label="Cookies et confidentialité">
      <div className="cookies__texte">
        <strong className="cookies__titre">Nous améliorons le site avec vous</strong>
        <p>
          Des cookies de mesure nous aident à comprendre ce qui fonctionne bien
          et à rendre la navigation plus simple. Vous pouvez refuser&nbsp;: le
          site marche exactement pareil.{' '}
          <Link to="/confidentialite" className="cookies__lien">En savoir plus</Link>
        </p>
      </div>

      {/* Les deux boutons ont la même forme et la même taille : c'est ce qui
          rend le refus aussi accessible que l'accord. Le refus en premier
          dans le DOM, donc atteint en premier au clavier. */}
      <div className="cookies__actions">
        <button
          type="button"
          className="btn-ghost cookies__bouton"
          onClick={() => { refuserClarity(); refuser(); }}
        >
          Refuser
        </button>
        <button
          type="button"
          className="btn btn--principal cookies__bouton"
          onClick={accepter}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
