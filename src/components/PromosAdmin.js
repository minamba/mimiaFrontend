import { useEffect, useRef, useState } from 'react';
import {
  getPromos,
  creerPromo,
  modifierPromo,
  afficherPromo,
  supprimerPromo,
  urlImagePromo,
} from '../lib/api/promosApi';

/**
 * LA BIBLIOTHÈQUE DES BANDEAUX PROMOTIONNELS.
 *
 * UNE COLLECTION, PAS UN RÉGLAGE
 * ------------------------------
 * Le message d'information est une phrase qu'on allume. Celui-ci est un
 * OBJET qu'on garde : la rentrée revient chaque année, Noël aussi. Préparer
 * le visuel une fois et le rallumer la saison suivante vaut mieux que de le
 * refaire — d'où une liste où les bandeaux éteints restent visibles.
 *
 * UN SEUL AFFICHÉ À LA FOIS, et c'est le serveur qui le garantit : allumer un
 * bandeau éteint les autres dans la même écriture. L'écran le DIT au lieu de
 * le supposer — le libellé du bouton change quand une autre promotion est déjà
 * en ligne, pour qu'on sache qu'on la remplace avant de cliquer.
 *
 * L'APERÇU EST LE VRAI VISUEL, à sa vraie largeur. Le seul défaut probable de
 * cet écran est un cadrage qui ne passe pas ; un tableau de noms de fichiers
 * ne le montrerait jamais.
 */

/** La même borne que le serveur — il refuse au-delà. */
const TAILLE_MAX = 5 * 1024 * 1024;

const kilos = (octets) => `${Math.round(octets / 1024).toLocaleString('fr-FR')} Ko`;

/**
 * Le formulaire d'un bandeau, en création comme en modification.
 *
 * LE MÊME COMPOSANT POUR LES DEUX, parce que ce sont les mêmes champs et les
 * mêmes règles. Les dédoubler ferait diverger les deux moitiés au premier
 * ajout de champ, et c'est toujours celle qu'on utilise le moins qui reste en
 * arrière.
 */
function Formulaire({ promo, onEnregistre, onAnnule }) {
  const edition = Boolean(promo);

  const [titre, setTitre] = useState(promo?.titre ?? '');
  const [texteAlternatif, setTexteAlternatif] = useState(promo?.texteAlternatif ?? '');
  const [lien, setLien] = useState(promo?.lien ?? '');

  const [imageLarge, setImageLarge] = useState(null);
  const [imageMobile, setImageMobile] = useState(null);

  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  // Les aperçus locaux des fichiers choisis, avant tout envoi. `URL.createObjectURL`
  // laisse un objet en mémoire jusqu'au rechargement de la page : on le révoque
  // dès que le fichier change ou que le formulaire se ferme.
  const [apercus, setApercus] = useState({ large: null, mobile: null });
  const apercusRef = useRef(apercus);
  apercusRef.current = apercus;

  useEffect(() => () => {
    Object.values(apercusRef.current).forEach((url) => url && URL.revokeObjectURL(url));
  }, []);

  const choisir = (quoi, fichier) => {
    if (fichier && fichier.size > TAILLE_MAX) {
      setErreur(`Ce fichier fait ${kilos(fichier.size)} : la limite est de 5 Mo.`);
      return;
    }

    setErreur(null);

    setApercus((etat) => {
      if (etat[quoi]) URL.revokeObjectURL(etat[quoi]);

      return { ...etat, [quoi]: fichier ? URL.createObjectURL(fichier) : null };
    });

    if (quoi === 'large') setImageLarge(fichier);
    else setImageMobile(fichier);
  };

  const enregistrer = async () => {
    setEnvoi(true);
    setErreur(null);

    try {
      const donnees = { titre, texteAlternatif, lien, imageLarge, imageMobile };

      if (edition) await modifierPromo(promo.id, donnees);
      else await creerPromo(donnees);

      onEnregistre();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le bandeau n'a pas pu être enregistré.");
    } finally {
      setEnvoi(false);
    }
  };

  // En création, l'image large est obligatoire. En modification, non : ne rien
  // envoyer veut dire « garde celle qui est là ».
  const pret = titre.trim() && texteAlternatif.trim() && (edition || imageLarge);

  return (
    <div className="promos__formulaire">
      {erreur && <div className="alert">{erreur}</div>}

      <div className="champ">
        <label htmlFor="promo-titre">Nom du bandeau</label>
        <input
          id="promo-titre"
          maxLength={120}
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Rentrée 2026"
        />
        <span className="champ__aide">
          Pour vous seul, jamais affiché aux visiteurs. C’est ce qui vous
          permettra de retrouver ce visuel dans six mois.
        </span>
      </div>

      <div className="champ">
        <label htmlFor="promo-alt">Description de l’offre</label>
        <input
          id="promo-alt"
          maxLength={300}
          value={texteAlternatif}
          onChange={(e) => setTexteAlternatif(e.target.value)}
          placeholder="Rentrée : -20 % sur tous les forfaits jusqu’au 29 septembre."
        />
        <span className="champ__aide">
          {/* Ce n'est PAS un champ de confort. Toute la promotion est dans
              l'image : le prix, la date, la remise. Sans ce texte, un visiteur
              aveugle ou un visiteur dont l'image ne charge pas n'a rien. */}
          Obligatoire. C’est ce que lisent les personnes aveugles, et ce qui
          s’affiche si l’image ne charge pas. Écrivez l’offre en une phrase.
        </span>
      </div>

      <div className="champ">
        <label htmlFor="promo-lien">Où mène le clic</label>
        <input
          id="promo-lien"
          maxLength={500}
          value={lien}
          onChange={(e) => setLien(e.target.value)}
          placeholder="/tarifs"
        />
        <span className="champ__aide">
          Facultatif. « /tarifs » pour une page du site, ou une adresse
          complète en https://. Laissé vide, le bandeau n’est pas cliquable.
        </span>
      </div>

      <div className="promos__visuels">
        <ChoixImage
          identifiant="promo-large"
          titre="Image pour ordinateur"
          aide="2400 × 480 pixels (ratio 5:1). À ce format, rien n’est rogné. Une image plus haute est recadrée par le haut et le bas — gardez votre message au centre. Titre en 60 à 80 px pour rester lisible une fois réduit."
          obligatoire={!edition}
          fichier={imageLarge}
          apercu={apercus.large}
          actuelle={edition ? urlImagePromo(promo.id, { version: promo.version }) : null}
          onChoisir={(f) => choisir('large', f)}
        />

        <ChoixImage
          identifiant="promo-mobile"
          titre="Image pour téléphone"
          aide="1200 × 900 pixels (ratio 4:3). Refaites la mise en page en vertical, ne réduisez pas celle du dessus. Sans cette image, la version ordinateur est écrasée à 65 px de haut sur un téléphone."
          obligatoire={false}
          fichier={imageMobile}
          apercu={apercus.mobile}
          actuelle={
            edition && promo.avecImageMobile
              ? urlImagePromo(promo.id, { mobile: true, version: promo.version })
              : null
          }
          onChoisir={(f) => choisir('mobile', f)}
        />
      </div>

      <div className="promos__actions">
        <button
          type="button"
          className="btn btn--compact"
          disabled={!pret || envoi}
          onClick={enregistrer}
        >
          {envoi ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Ajouter à la bibliothèque'}
        </button>

        <button
          type="button"
          className="btn btn--compact btn--fantome"
          disabled={envoi}
          onClick={onAnnule}
        >
          Annuler
        </button>
      </div>

      {!edition && (
        <p className="promos__note">
          Le bandeau est ajouté <strong>éteint</strong>. Vous le verrez dans la
          bibliothèque, et vous l’afficherez quand il vous conviendra.
        </p>
      )}
    </div>
  );
}

/** Un champ de fichier avec son aperçu — celui qu'on choisit, ou celui en place. */
function ChoixImage({ identifiant, titre, aide, obligatoire, fichier, apercu, actuelle, onChoisir }) {
  const montre = apercu ?? actuelle;

  return (
    <div className="promos__visuel">
      <strong className="promos__visuel-titre">
        {titre}
        {obligatoire && <span className="promos__requis"> — obligatoire</span>}
      </strong>

      <span className="promos__visuel-aide">{aide}</span>

      {montre ? (
        <img className="promos__apercu" src={montre} alt="" />
      ) : (
        <div className="promos__apercu promos__apercu--vide">Aucune image</div>
      )}

      <div className="promos__visuel-pied">
        <label className="btn btn--compact btn--fantome" htmlFor={identifiant}>
          {montre ? 'Remplacer' : 'Choisir un fichier'}
        </label>

        <input
          id={identifiant}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => onChoisir(e.target.files?.[0] ?? null)}
        />

        {fichier && <span className="promos__poids">{kilos(fichier.size)}</span>}
      </div>
    </div>
  );
}

export default function PromosAdmin() {
  const [promos, setPromos] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // `null` = pas de formulaire ; `'nouveau'` = création ; un objet = édition.
  const [formulaire, setFormulaire] = useState(null);

  const [occupe, setOccupe] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);

  const charger = () => {
    setChargement(true);

    return getPromos()
      .then(({ data }) => setPromos(Array.isArray(data) ? data : []))
      .catch(() => setErreur("La bibliothèque n'a pas pu être chargée."))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const active = promos.find((p) => p.actif) ?? null;

  const basculer = async (promo) => {
    setOccupe(promo.id);
    setErreur(null);

    try {
      await afficherPromo(promo.id, !promo.actif);
      await charger();
    } catch {
      setErreur("L'affichage n'a pas pu être changé.");
    } finally {
      setOccupe(null);
    }
  };

  const supprimer = async (promo) => {
    setOccupe(promo.id);

    try {
      await supprimerPromo(promo.id);
      setASupprimer(null);
      await charger();
    } catch {
      setErreur("Le bandeau n'a pas pu être supprimé.");
    } finally {
      setOccupe(null);
    }
  };

  if (chargement && promos.length === 0) return <p className="etat-vide">Chargement…</p>;

  if (formulaire) {
    return (
      <Formulaire
        promo={formulaire === 'nouveau' ? null : formulaire}
        onAnnule={() => setFormulaire(null)}
        onEnregistre={() => { setFormulaire(null); charger(); }}
      />
    );
  }

  return (
    <div className="promos">
      {erreur && <div className="alert">{erreur}</div>}

      {/* L'ÉTAT AVANT LA LISTE : en arrivant, la question n'est pas « qu'est-ce
          que j'ajoute » mais « qu'est-ce qui est en ligne en ce moment ». */}
      <div className={`promos__etat ${active ? 'est-active' : ''}`}>
        <strong>
          {active
            ? `« ${active.titre} » est affiché sur la page d’accueil.`
            : 'Aucun bandeau n’est affiché sur la page d’accueil.'}
        </strong>

        <span>
          Un seul bandeau à la fois : en afficher un retire automatiquement
          celui qui était en ligne.
        </span>
      </div>

      <div className="promos__barre">
        <button
          type="button"
          className="btn btn--compact"
          onClick={() => setFormulaire('nouveau')}
        >
          Ajouter un bandeau
        </button>
      </div>

      {promos.length === 0 ? (
        <p className="etat-vide">
          La bibliothèque est vide. Ajoutez un visuel : il sera enregistré
          éteint, et vous l’afficherez quand vous voudrez.
        </p>
      ) : (
        <ul className="promos__liste">
          {promos.map((promo) => (
            <li key={promo.id} className={`promos__carte ${promo.actif ? 'est-active' : ''}`}>
              <img
                className="promos__vignette"
                src={urlImagePromo(promo.id, { version: promo.version })}
                alt=""
              />

              <div className="promos__infos">
                <strong className="promos__titre">
                  {promo.titre}
                  {promo.actif && <span className="promos__pastille">Affiché</span>}
                </strong>

                <span className="promos__alt">{promo.texteAlternatif}</span>

                <span className="promos__meta">
                  {promo.lien ? `Mène à ${promo.lien}` : 'Non cliquable'}
                  {' · '}
                  {kilos(promo.tailleLarge)}

                  {/* Signalé, parce que c'est le défaut le plus courant et
                      qu'il ne se voit que sur un téléphone : la moitié du
                      trafic verrait une bande minuscule sans qu'on le sache. */}
                  {promo.avecImageMobile
                    ? ` · version téléphone (${kilos(promo.tailleMobile)})`
                    : ' · pas de version téléphone'}
                </span>
              </div>

              <div className="promos__boutons">
                <button
                  type="button"
                  className={`btn btn--compact ${promo.actif ? 'btn--danger' : ''}`}
                  disabled={occupe === promo.id}
                  onClick={() => basculer(promo)}
                >
                  {promo.actif
                    ? 'Retirer'
                    // LE LIBELLÉ DIT CE QUE LE CLIC VA CASSER. « Afficher »
                    // sur un site qui montre déjà autre chose cacherait le
                    // fait qu'on remplace une promotion en cours.
                    : active
                      ? 'Afficher à la place'
                      : 'Afficher'}
                </button>

                <button
                  type="button"
                  className="btn-ghost btn-ghost--mini"
                  onClick={() => setFormulaire(promo)}
                >
                  Modifier
                </button>

                {aSupprimer === promo.id ? (
                  <>
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini btn-ghost--danger"
                      disabled={occupe === promo.id}
                      onClick={() => supprimer(promo)}
                    >
                      Confirmer
                    </button>

                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini"
                      onClick={() => setASupprimer(null)}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost btn-ghost--mini btn-ghost--danger"
                    onClick={() => setASupprimer(promo.id)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
