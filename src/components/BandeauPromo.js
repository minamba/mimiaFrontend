import { useEffect, useState } from 'react';
import { getPromoActive, urlImagePromo } from '../lib/api/promosApi';

/**
 * LE BANDEAU PROMOTIONNEL DE LA PAGE D'ACCUEIL.
 *
 * Un visuel pleine largeur, cliquable, au-dessus du reste : la rentrée, une
 * remise, un parrainage. Il vit dans la page d'accueil et nulle part ailleurs
 * — un parent venu travailler avec son enfant n'a pas besoin de voir une
 * promotion sur chaque écran.
 *
 * DEUX IMAGES, ET C'EST LA BALISE QUI CHOISIT
 * -------------------------------------------
 * Un visuel de 1920 × 320 ramené à la largeur d'un téléphone fait 65 pixels
 * de haut : le prix devient illisible, et la promotion ne sert plus à rien là
 * où se fait la moitié du trafic. Aucune règle de style ne rattrape ça — il
 * faut un autre cadrage, donc un autre fichier.
 *
 * `<picture>` PLUTÔT QU'UNE MESURE EN JAVASCRIPT. Le navigateur applique la
 * requête média AVANT de télécharger quoi que ce soit : un téléphone ne
 * charge jamais la version large. Mesurer la fenêtre en JavaScript
 * arriverait toujours trop tard — l'image large serait déjà en vol.
 *
 * IL NE RÉSERVE PAS SA PLACE, ET C'EST DÉLIBÉRÉ
 * ---------------------------------------------
 * Tant qu'on ne sait pas s'il y a une promotion, le composant ne rend RIEN :
 * pas de cadre vide, pas de hauteur réservée. Une bande grise qui attend une
 * image qui n'existe pas la plupart du temps repousserait le titre de la page
 * sous la ligne de flottaison, tous les jours, pour l'exception.
 *
 * En contrepartie, l'arrivée du bandeau décale le contenu. C'est le bon
 * compromis ici : la promotion est rare, et le décalage se produit avant que
 * le visiteur ait eu le temps de lire — pas sous son doigt.
 */
export default function BandeauPromo() {
  const [promo, setPromo] = useState(null);

  // Le visuel a-t-il échoué ? Une promotion dont l'image ne charge pas ne doit
  // pas laisser un texte alternatif nu en haut de la page d'accueil : ça se
  // lit comme un site cassé. On efface tout.
  const [casse, setCasse] = useState(false);

  useEffect(() => {
    let vivant = true;

    getPromoActive()
      .then((p) => { if (vivant) setPromo(p); })

      // UNE PROMOTION EST UN ORNEMENT. Réseau coupé, API muette, réponse
      // illisible : la page d'accueil s'affiche sans elle et personne n'en
      // saura rien. Il n'y a rien à dire au visiteur — il ignore qu'il devait
      // y avoir quelque chose.
      .catch(() => {});

    return () => { vivant = false; };
  }, []);

  if (!promo || casse) return null;

  const version = promo.version;

  const image = (
    <picture>
      {/* La version téléphone n'est proposée que si elle existe. Sans elle,
          la balise retombe sur l'image large — le serveur ferait le même
          repli, mais autant ne pas demander un fichier qu'on sait absent. */}
      {promo.avecImageMobile && (
        <source
          media="(max-width: 640px)"
          srcSet={urlImagePromo(promo.id, { mobile: true, version })}
        />
      )}

      <img
        className="promo__image"
        src={urlImagePromo(promo.id, { version })}
        alt={promo.texteAlternatif}
        onError={() => setCasse(true)}
      />
    </picture>
  );

  // PAS DE LIEN, PAS DE CADRE CLIQUABLE. Un bloc qui réagit au survol et ne
  // mène nulle part est plus frustrant qu'une image inerte.
  if (!promo.lien) return <div className="promo">{image}</div>;

  const externe = /^https?:/i.test(promo.lien);

  return (
    <a
      className="promo promo--lien"
      href={promo.lien}
      {...(externe
        // `noopener` sur toute cible extérieure : sans lui, la page ouverte
        // garde une poignée sur la nôtre par `window.opener`.
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {image}
    </a>
  );
}
