import { useEffect, useState } from 'react';
import { getPromoActive, urlImagePromo } from '../lib/api/promosApi';

/**
 * LE BANDEAU PROMOTIONNEL DE LA PAGE D'ACCUEIL.
 *
 * Un visuel cliquable au-dessus du reste : la rentrée, une remise, un
 * parrainage. Il vit dans la page d'accueil et nulle part ailleurs — un
 * parent venu travailler avec son enfant n'a pas besoin de voir une
 * promotion sur chaque écran.
 *
 * IMAGE OU VIDÉO, ET LA BALISE N'EST PAS LA MÊME
 * ----------------------------------------------
 * `<picture>` et `<video>` ne se remplacent pas : une vidéo posée dans un
 * `<img>` ne montre rien du tout. Le serveur dit donc lequel des deux avant
 * qu'on demande le moindre octet, plutôt que de laisser l'écran deviner à
 * partir d'une extension.
 *
 * DEUX VISUELS, ET C'EST LA BALISE QUI CHOISIT — POUR LES IMAGES
 * -------------------------------------------------------------
 * Un visuel de 2400 × 480 ramené à la largeur d'un téléphone fait 65 pixels
 * de haut : le prix devient illisible là où se fait la moitié du trafic.
 * `<picture>` applique la requête média AVANT de télécharger quoi que ce
 * soit — un téléphone ne charge jamais la version large.
 *
 * POUR LA VIDÉO, IL FAUT MESURER SOI-MÊME. L'attribut `media` sur `<source>`
 * fonctionne dans `<picture>` mais plus dans `<video>` : Chrome l'a retiré.
 * On lit donc la largeur une seule fois, à l'initialisation de l'état, donc
 * AVANT le premier rendu — pas dans un effet, qui arriverait après et ferait
 * télécharger le mauvais fichier avant de le remplacer.
 *
 * IL NE RÉSERVE PAS SA PLACE, ET C'EST DÉLIBÉRÉ
 * ---------------------------------------------
 * Tant qu'on ne sait pas s'il y a une promotion, le composant ne rend RIEN :
 * pas de cadre vide, pas de hauteur réservée. Une bande grise qui attend une
 * image qui n'existe pas la plupart du temps repousserait le titre de la page
 * sous la ligne de flottaison, tous les jours, pour l'exception.
 */

/** Le seuil où la version téléphone prend le relais. Le même qu'en CSS. */
const SEUIL_MOBILE = '(max-width: 640px)';

export default function BandeauPromo() {
  const [promo, setPromo] = useState(null);

  // Le visuel a-t-il échoué ? Une promotion dont l'image ne charge pas ne doit
  // pas laisser un texte alternatif nu en haut de la page d'accueil : ça se
  // lit comme un site cassé. On efface tout.
  const [casse, setCasse] = useState(false);

  // Lu à l'initialisation, donc avant le premier rendu. Ne sert qu'à la
  // vidéo : les images passent par `<picture>`, que le navigateur résout
  // mieux que nous.
  const [surMobile, setSurMobile] = useState(
    () => window.matchMedia?.(SEUIL_MOBILE).matches ?? false,
  );

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

  // La rotation d'un téléphone franchit le seuil : sans cet écouteur, la
  // vidéo resterait celle du format qu'on avait au chargement.
  useEffect(() => {
    const sonde = window.matchMedia?.(SEUIL_MOBILE);
    if (!sonde) return undefined;

    const suivre = (e) => setSurMobile(e.matches);
    sonde.addEventListener('change', suivre);

    return () => sonde.removeEventListener('change', suivre);
  }, []);

  if (!promo || casse) return null;

  const version = promo.version;
  const mobile = surMobile && promo.avecImageMobile;

  const media = promo.estVideo ? (
    // MUET, EN BOUCLE, ET SANS COMMANDES.
    //
    // `muted` n'est pas un choix esthétique : sans lui, aucun navigateur ne
    // lance la lecture automatique, et le bandeau resterait figé sur sa
    // première image. `playsInline` est la même contrainte sur iPhone, qui
    // sinon ouvre la vidéo en plein écran par-dessus le site.
    //
    // Pas de commandes : c'est un ornement, pas un lecteur. Une barre de
    // lecture inviterait à mettre en pause une boucle de huit secondes.
    <video
      className="promo__image"
      src={urlImagePromo(promo.id, { mobile, version })}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={promo.texteAlternatif}
      onError={() => setCasse(true)}
    />
  ) : (
    <picture>
      {/* La version téléphone n'est proposée que si elle existe. Sans elle,
          la balise retombe sur l'image large — le serveur ferait le même
          repli, mais autant ne pas demander un fichier qu'on sait absent. */}
      {promo.avecImageMobile && (
        <source
          media={SEUIL_MOBILE}
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

  const classe = `promo ${promo.pleineLargeur ? 'promo--pleine' : ''}`;

  // PAS DE LIEN, PAS DE CADRE CLIQUABLE. Un bloc qui réagit au survol et ne
  // mène nulle part est plus frustrant qu'une image inerte.
  if (!promo.lien) return <div className={classe}>{media}</div>;

  const externe = /^https?:/i.test(promo.lien);

  return (
    <a
      className={`${classe} promo--lien`}
      href={promo.lien}
      {...(externe
        // `noopener` sur toute cible extérieure : sans lui, la page ouverte
        // garde une poignée sur la nôtre par `window.opener`.
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {media}
    </a>
  );
}
