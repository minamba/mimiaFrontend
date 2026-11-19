import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMonQuota, getOffres, souscrire } from '../lib/api/abonnementApi';
import { login } from '../lib/actions/authActions';
import {
  useConseillereOrientation,
  useDesJeuxOuverts,
  useEssaisOuverts,
  useFichesRevision,
  useOffreLancement,
  usePodcasts,
} from '../lib/storage/modeTest';
import Loader from './Loader';
import imageCalendrierEssai from '../assets/tarifs/calendrier-essai.webp';
import './tarifsIllustre.css';
import './tarifsCartesIllustre.css';

/**
 * Formule que le visiteur voulait prendre avant d'être envoyé se connecter.
 *
 * En sessionStorage et non en localStorage : une intention d'achat n'a pas à
 * survivre à la fermeture du navigateur. Retrouver « vous étiez sur le point
 * de choisir Famille » trois jours plus tard serait déplacé.
 */
const CLE_INTENTION = 'mimia-formule-visee';

/**
 * La page de tarifs.
 *
 * Les prix viennent du serveur et non du code : une grille en dur obligerait à
 * déployer pour changer un prix, et surtout elle finirait par mentir — la page
 * afficherait 60 € pendant que la base facture autre chose.
 */

/** « 8 septembre » : le jour et le mois suffisent, l'année encombre. */
const dateCourte = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : '';

const euros = (centimes) =>
  (centimes / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
  });

/**
 * Une durée, dans l'unité où on la pense.
 *
 * En dessous d'une heure on écrit les minutes : l'essai s'affichait
 * « 0,5 h de cours », ce qui demande une conversion mentale pour comprendre
 * qu'on parle d'une demi-heure — et fait passer une offre franche pour un
 * reliquat. Au-dessus, l'heure reste la bonne unité : personne ne lit
 * « 960 minutes » pour un forfait Famille.
 */
const heures = (h) => {
  if (h > 0 && h < 1) return `${Math.round(h * 60)} minutes`;

  return h === Math.round(h) ? `${h} h` : `${h}`.replace('.', ',') + ' h';
};


/**
 * Ce que chaque formule apporte, dit avec des mots de parent.
 *
 * `lancement` n'est passé QUE pour la formule concernée : la décision
 * « cette carte est-elle en promotion » appartient à celui qui dessine les
 * cartes, pas à celui qui écrit les lignes. Sans ça, ce composant devrait
 * connaître le code de la formule en promotion, et il y en aurait deux à
 * corriger le jour où elle change.
 */
/**
 * Ce que chaque formule apporte, dit avec des mots de parent.
 *
 * `lancement` porte le NOMBRE D'HEURES OFFERTES, et non plus un simple
 * booléen. Il vient du serveur, qui le lit dans le pack réglé en
 * administration : offrir dix heures au lieu de trois ne demande donc
 * aucune retouche ici. La constante écrite en dur qui vivait à cet endroit
 * aurait menti au premier changement d'offre — et personne n'aurait su
 * qu'elle existait.
 */
/**
 * `modules` (18/10/2026) : fiches, jeux et conseillère s'allument et s'éteignent
 * dans Admin › Modes ; une formule n'annonce que ce qui est réellement ouvert.
 */
/**
 * CE QUE CETTE FORMULE AJOUTE À LA PRÉCÉDENTE — Camara, le 14/11/2026 : « les offres reprennent une phrase du genre
 * “tous les avantages de l'offre précédente”, juste on met en avant les différences ». Tout se déduit des
 * colonnes (enfants, heures, plafond) : aucune formule n'est nommée ici, et une ligne identique n'est pas répétée.
 */
/** L'offre de lancement, en court : « 12 h le 1er mois (3 h offertes) » (Camara, le 15/11/2026). */
const premierMois = (pot, lancement) => `${heures(pot + lancement)} le 1er mois (${heures(lancement)} offertes)`;

// `avecConseillere` vient du serveur (OffreTarif) ; absent = incluse, comme avant le 14/11/2026.
const aLaConseillere = (offre) => offre?.avecConseillere !== false;
// `avecPodcasts` (15/11/2026) : ni Starter ni l'essai. Absent (une API d'avant) = rien d'annoncé, plutôt qu'à tort.
const aLesPodcasts = (offre) => offre?.avecPodcasts === true;
const LIGNE_PODCASTS = 'Accès aux podcasts de ses cours';

export function differences(offre, precedente, lancement = 0, modules = {}) {
  const plusieurs = offre.nombreEnfantsMax > 1;
  const lignes = [];

  if (offre.nombreEnfantsMax !== precedente.nombreEnfantsMax) {
    lignes.push(plusieurs ? `Jusqu'à ${offre.nombreEnfantsMax} enfants` : 'Un enfant');
  }

  // LES HEURES EN PLUS, ET LE TOTAL ENTRE PARENTHÈSES — Camara, le 15/11/2026 : « au lieu de mettre 9 h, on prend
  // les 4 h du Starter + 5 h et on met en parenthèse le total ». « + 5 h de cours par mois (9 h au total) » : la
  // carte dit ce qu'elle ajoute à la précédente, comme le reste de la liste. Des heures qui ne montent pas (cas
  // théorique) gardent le chiffre seul.
  //
  // PLUS COURT, LE MÊME JOUR (Camara : « tu ne trouves pas que ça fait long ? ») : « + 5 h par mois · 9 h au total »,
  // le total en gras ; « de cours » et « à partager entre les enfants » (redit par la ligne du plafond) sont partis.
  const ajout = offre.heuresPot - precedente.heuresPot;
  const ligneHeures = ajout > 0
    ? { plein: `+ ${heures(ajout)} par mois`, total: `${heures(offre.heuresPot)} au total` }
    : { plein: `${heures(offre.heuresPot)} par mois` };

  if (lancement > 0) {
    // L'offre de lancement dessous, en couleur. La ligne des heures n'est PAS barrée ici : barrer « + 5 h » ferait
    // croire qu'on ne les a pas ; c'est le premier mois qui en a davantage.
    lignes.push({ cle: 'heures-promo', ...ligneHeures, fort: premierMois(offre.heuresPot, lancement) });
  } else if (ajout !== 0) {
    lignes.push({ cle: 'heures', ...ligneHeures });
  }

  // Le plafond ne se dit que là où il apparaît (première formule à plusieurs enfants) ou s'il change.
  if (plusieurs && (precedente.nombreEnfantsMax <= 1 || offre.heuresPlafondEnfant !== precedente.heuresPlafondEnfant)) {
    lignes.push(`${heures(offre.heuresPlafondEnfant)} max. par enfant`);
  }

  // LA CONSEILLÈRE, LÀ OÙ ELLE ARRIVE (Starter n'en a pas, 14/11/2026) — seulement si le module est allumé.
  if (modules.orientation && aLaConseillere(offre) && !aLaConseillere(precedente)) {
    lignes.push('Une conseillère d’orientation dès la 3e');
  }

  // LES PODCASTS, LÀ OÙ ILS ARRIVENT — Camara, le 15/11/2026 : « dans la partie Solo, ajoute l'accès aux podcasts ».
  if (modules.podcasts && aLesPodcasts(offre) && !aLesPodcasts(precedente)) {
    lignes.push(LIGNE_PODCASTS);
  }

  return lignes;
}

/**
 * L'ÉCART EN UNE PHRASE (14/11/2026) : une carte qui n'ajoute que des heures paraissait vide. Dit seulement quand c'est
 * exact — même nombre d'enfants, heures exactement doublées (Starter → Solo) — sinon rien.
 */
export function phraseDEcart(offre, precedente) {
  if (!precedente || offre.nombreEnfantsMax !== precedente.nombreEnfantsMax) return null;
  if (offre.heuresPot !== 2 * precedente.heuresPot) return null;
  return 'Deux fois plus d’heures pour accompagner votre enfant régulièrement.';
}

function Lignes({ lignes }) {
  return (
    <ul className="tarif__details">
      {lignes.map((ligne) =>
        typeof ligne === 'string' ? (
          <li key={ligne}>{ligne}</li>
        ) : ligne.barre || ligne.plein ? (
          <li key={ligne.cle} className="tarif__detail--promo">
            {ligne.barre ? (
              <span className="tarif__barre">{ligne.barre}</span>
            ) : (
              <span>
                {ligne.plein}
                {ligne.total && <> · <b className="tarif__total">{ligne.total}</b></>}
              </span>
            )}
            {ligne.fort && <strong>{ligne.fort}</strong>}
          </li>
        ) : (
          <li key={ligne.cle}>
            {ligne.fort}
            <span className="tarif__au-lieu">{ligne.apres}</span>
          </li>
        ))}
    </ul>
  );
}

function Details({ offre, lancement, modules = {}, precedente = null }) {
  // Une formule qui en suit une autre : « Tous les avantages de …, plus : » et seulement ce qui change.
  if (precedente) {
    // Un seul bloc qui prend la hauteur libre : la phrase reste collée à la liste, le vide va dessous.
    return (
      <div className="tarif__suite">
        <p className="tarif__heritage">
          <span className="tarif__heritage-coche" aria-hidden="true">✓</span>
          <span>Tous les avantages de {precedente.libelle}, plus&nbsp;:</span>
        </p>
        <Lignes lignes={differences(offre, precedente, lancement, modules)} />
        {phraseDEcart(offre, precedente) && <p className="tarif__plus">{phraseDEcart(offre, precedente)}</p>}
      </div>
    );
  }

  const lignes = [
    offre.nombreEnfantsMax > 1
      ? `Jusqu'à ${offre.nombreEnfantsMax} enfants`
      : 'Un enfant',

    // LA LIGNE DES HEURES, BARRÉE PUIS REMPLACÉE.
    //
    // Barrer plutôt que remplacer : c'est l'écart qui vend, pas le
    // chiffre. « 12 h » seul ne dit rien à qui découvre la page ; « 9 h »
    // rayé au-dessus de « 12 h » dit tout, sans une phrase d'explication.
    lancement > 0
      ? {
          cle: 'heures-promo',
          barre: `${heures(offre.heuresPot)} par mois`,
          fort: premierMois(offre.heuresPot, lancement),
        }
      : `${heures(offre.heuresPot)} de cours par mois${offre.nombreEnfantsMax > 1 ? ', à partager entre les enfants' : ''}`,

    offre.nombreEnfantsMax > 1
      ? `${heures(offre.heuresPlafondEnfant)} max. par enfant`
      : null,
    'Toutes les matières disponibles',

    // Camara, le 18/10/2026 : ce que la séance apporte en plus des cours.
    'Préparation aux contrôles et aux examens (brevet, bac)',
    'Suivi détaillé des activités de l’enfant',
    // À L'ESSAI (15/11/2026) : à découvrir, et l'on dit qu'elle n'est incluse qu'à partir de Solo.
    !modules.orientation || !aLaConseillere(offre) ? null
      : offre.estEssai ? 'La conseillère d’orientation à découvrir (dès la 3e), incluse ensuite à partir de Solo'
        : 'Une conseillère d’orientation dès la 3e',

    // FICHES ET JEUX (Camara, le 18/10/2026) : pleins dans les formules
    // payantes. Sans chiffre : le nombre de cours de fiches par mois se règle
    // côté serveur, une constante ici mentirait au premier changement.
    // À L'ESSAI, UN AVANT-GOÛT (le même jour) : une fiche de révision, et les
    // deux premiers jeux de mathématiques.
    !modules.fiches ? null
      : offre.estEssai ? 'Une fiche de révision offerte' : 'Fiches de révision générées à partir de ses cours',
    !modules.jeux ? null
      : offre.estEssai ? 'Deux jeux de mathématiques à essayer' : 'Accès aux jeux éducatifs',
    // Une formule en tête de liste qui les inclut les annonce (Starter et l'essai, non).
    modules.podcasts && aLesPodcasts(offre) ? LIGNE_PODCASTS : null,
    'Bilan hebdomadaire par mail',
    offre.estEssai ? null : 'Un mois de pause offert par an',
  ].filter(Boolean);

  return <Lignes lignes={lignes} />;
}

export default function Tarifs() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // `authentifie`, pas `isAuthenticated` : c'est le nom du champ dans le
  // réducteur. Lire le mauvais donnait `undefined`, donc toujours faux, donc
  // un visiteur connecté était traité comme un anonyme.
  const { authentifie } = useSelector((state) => state.auth);

  // Les essais sont-ils encore proposés ? Pilote le bloc « Essayez d'abord ».
  const essaisOuverts = useEssaisOuverts();

  // L'offre de lancement. `active` vient du serveur, échéance comprise : on
  // ne rejuge pas ici avec l'horloge du visiteur, qu'il suffirait de reculer
  // pour rouvrir une promotion fermée.
  const lancement = useOffreLancement();

  // Ce que les formules annoncent : seulement les modules allumés.
  const modules = {
    fiches: useFichesRevision(),
    jeux: useDesJeuxOuverts(),
    orientation: useConseillereOrientation(),
    podcasts: usePodcasts(),
  };

  const [formules, setFormules] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);

  // La formule sélectionnée. Jamais nulle une fois les tarifs chargés : une
  // page de prix qui s'ouvre sans rien de sélectionné oblige le visiteur à
  // choisir avant de comparer. On préselectionne la formule mise en avant.
  const [choisie, setChoisie] = useState(null);

  /**
   * Le rythme de facturation. Mensuel par défaut, parce que c'est l'engagement
   * le plus léger : un visiteur qui découvre le service ne s'engage pas sur un
   * an, et lui présenter d'abord le prix annuel gonflerait le chiffre affiché.
   *
   * Il n'est PAS déduit côté serveur — la route le refuse s'il manque. Une
   * ambiguïté de rythme sur un abonnement est le pire endroit où être tolérant.
   */
  const [periodicite, setPeriodicite] = useState('Mensuel');
  const annuel = periodicite === 'Annuel';

  /**
   * Cette formule est-elle en promotion en ce moment ?
   *
   * ÉCRIT UNE FOIS ET APPELÉ TROIS FOIS — le nom, les lignes, la carte. Les
   * trois doivent être vrais ensemble : une carte encadrée dont le titre ne
   * porte pas la mention, ou des heures barrées sans promotion annoncée, se
   * lisent comme un bug d'affichage plutôt que comme une offre.
   *
   * `SOLO` EN DUR, parce que c'est la formule que l'offre vise et qu'un
   * réglage de plus pour choisir laquelle serait un réglage que personne ne
   * relit. Le serveur applique exactement la même règle de son côté.
   */
  /**
   * Cette formule est-elle en promotion en ce moment ?
   *
   * LES CODES VIENNENT DU SERVEUR, plus d'un `=== 'SOLO'` écrit ici. La
   * campagne peut porter sur une formule, deux, ou les trois — et le
   * webhook lit exactement la même liste, donc ce qui est annoncé est ce
   * qui est crédité.
   */
  const enPromotion = (offre) =>
    lancement.active
    && lancement.heures > 0
    && lancement.formules.includes(offre.code)
    && !annuel;

  // Le visiteur revient de la connexion avec une formule en tête. On le lui
  // rappelle plutôt que de souscrire à sa place : sans page de paiement en
  // face, un abonnement qui s'ouvrirait tout seul après une redirection serait
  // un engagement qu'il n'a pas confirmé.
  const [reprise, setReprise] = useState(null);

  /**
   * L'abonnement en cours, quand il y en a un. Null pour un visiteur non
   * connecté ou un compte sans abonnement — la route répond alors 204.
   *
   * POURQUOI LA PAGE DE PRIX A BESOIN DE LE SAVOIR
   * ---------------------------------------------
   * Sans lui, elle propose « Commencer l'essai » à quelqu'un dont l'essai
   * court déjà, et « Choisir cette formule » à quelqu'un qui l'a déjà prise.
   * Le serveur refuse le second essai sans rien dire, et pour une formule
   * payante il ouvrirait une SECONDE page de paiement — donc un second
   * prélèvement. Un bouton qui ne peut pas aboutir ne doit pas se présenter
   * comme s'il le pouvait.
   */
  const [abonnement, setAbonnement] = useState(null);

  useEffect(() => {
    if (!authentifie) {
      setAbonnement(null);
      return undefined;
    }

    let vivant = true;

    getMonQuota()
      // 204 = aucun abonnement : `data` est alors une chaîne vide, pas un
      // objet. On force à null plutôt que de laisser passer un `''` qui
      // ferait échouer les lectures de propriétés plus bas.
      .then(({ data }) => vivant && setAbonnement(data || null))
      .catch(() => vivant && setAbonnement(null));

    return () => {
      vivant = false;
    };
  }, [authentifie]);

  useEffect(() => {
    let vivant = true;

    getOffres()
      .then(({ data }) => {
        if (!vivant) return;

        const formulesRecues = data.formules ?? [];
        setFormules(formulesRecues);
        setRecharges(data.recharges ?? []);

        // Une formule visée avant la connexion reprend la main sur le choix
        // par défaut : le visiteur revient exactement là où il s'était arrêté.
        const visee = sessionStorage.getItem(CLE_INTENTION);
        const payantes = formulesRecues.filter((f) => !f.estEssai);

        setChoisie(
          formulesRecues.find((f) => f.code === visee)?.code
            ?? (payantes.find((f) => f.code === 'DUO') ?? payantes[0])?.code
            ?? null,
        );

        if (visee) setReprise(visee);
      })
      .catch(() => vivant && setErreur("Les tarifs n'ont pas pu être chargés."))
      .finally(() => vivant && setChargement(false));

    return () => {
      vivant = false;
    };
  }, []);

  const choisir = async (offre) => {
    setChoisie(offre.code);

    // Visiteur non connecté : on retient la formule et on lance la connexion.
    // Le renvoyer à l'accueil lui ferait tout recommencer sans rien lui
    // expliquer — il vient de dire « je veux celle-là ».
    if (!authentifie) {
      sessionStorage.setItem(CLE_INTENTION, offre.code);
      dispatch(login());
      return;
    }

    setEnCours(offre.code);
    setErreur(null);

    try {
      const { data } = await souscrire(offre.code, periodicite);
      sessionStorage.removeItem(CLE_INTENTION);

      // DEUX SORTIES, ET C'EST VOULU.
      //
      // Une formule payante répond une adresse de paiement : rien n'est
      // encore souscrit, et c'est le webhook qui ouvrira l'abonnement quand
      // Stripe aura encaissé. L'essai et les comptes exemptés n'ont pas de
      // caisse à passer et répondent directement l'état du quota.
      if (data?.urlPaiement) {
        // `replace` et non `assign` : le retour arrière depuis la page de
        // paiement doit ramener aux tarifs, pas relancer une caisse.
        window.location.replace(data.urlPaiement);
        return;
      }

      // Pas d'adresse de paiement : soit la formule est gratuite, soit c'est
      // un CHANGEMENT de formule — la carte est déjà chez Stripe, l'abonnement
      // a été modifié sur place, il n'y a pas de caisse à repasser. Dans les
      // deux cas le forfait est à jour, et c'est ça qu'il faut lui montrer.
      navigate('/profil?formule=changee');
    } catch (erreurAppel) {
      // 503 = notre faute, pas la sienne : clé absente ou catalogue non
      // synchronisé. Le distinguer évite de lui faire réessayer en boucle
      // quelque chose qui ne peut pas marcher.
      setErreur(
        erreurAppel?.response?.status === 503
          ? "Le paiement est momentanément indisponible. Réessayez plus tard."
          : "La souscription n'a pas abouti. Réessayez dans un instant.",
      );
    } finally {
      setEnCours(null);
    }
  };

  // LES PRIX AU CENTRE DE L'ÉCRAN — Camara, le 16/11/2026 : « quand on clique sur Tarifs, sur PC, je veux que ça
  // scrolle pour bien avoir les prix au centre ». Une fois les formules affichées, la page descend jusqu'au choix
  // « Au mois / À l'année », juste sous la barre du haut et la dernière ligne de l'accroche : les quatre cartes
  // tiennent alors dans l'écran. Sur PC seulement (le téléphone garde le haut de page), et pas si l'adresse vise
  // déjà un endroit (#…).
  useEffect(() => {
    if (chargement || window.location.hash) return undefined;
    if (!window.matchMedia?.('(min-width: 900px) and (min-height: 600px)')?.matches) return undefined;

    const image = window.requestAnimationFrame(() => {
      const rythme = document.querySelector('.page--tarifs-illu > .rythme');
      if (!rythme) return;
      const barre = document.querySelector('.navbar')?.getBoundingClientRect().bottom ?? 0;
      const haut = rythme.getBoundingClientRect().top + window.scrollY - Math.max(0, barre) - 46;
      if (haut > window.scrollY + 20) window.scrollTo?.({ top: haut, behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(image);
  }, [chargement]);

  if (chargement) return <Loader texte="Chargement des tarifs…" />;

  /**
   * L'abonnement en cours est-il l'essai gratuit ?
   *
   * DEUX SOURCES, ET C'EST VOULU. Le serveur le dit (`estEssai`), mais ce
   * champ est récent : une API pas encore redémarrée n'envoie rien, et le
   * bouton affichait alors « Vous avez déjà un abonnement » à quelqu'un dont
   * l'essai courait — le seul message qu'il ne fallait pas lui donner.
   *
   * La grille des offres, elle, porte déjà l'information : elle est chargée de
   * toute façon, et son `estEssai` est le même que celui de la base. On la
   * consulte donc en second recours. Ce n'est pas une béquille de transition :
   * une page dont l'affichage dépend d'un déploiement synchronisé se trompera
   * toujours pendant la fenêtre où les deux ne le sont pas.
   */
  const enEssai = abonnement
    ? abonnement.estEssai
      ?? formules.find((f) => f.code === abonnement.offreCode)?.estEssai
      ?? false
    : false;

  /**
   * Ce que dit le bouton d'une formule, et s'il est encore actionnable.
   *
   * TROIS SITUATIONS, TROIS PHRASES.
   *
   * 1. C'est sa formule, au même rythme → « Votre formule actuelle », éteint.
   *    Le laisser cliquable ouvrirait une seconde page de paiement, donc un
   *    second prélèvement pour la même chose.
   *
   * 2. C'est sa formule, à l'AUTRE rythme → « Passer à l'année » (ou au mois).
   *    Ce n'est pas la même chose que la précédente : changer de rythme est un
   *    vrai geste, et le bouton doit dire lequel.
   *
   * 3. Une autre formule alors qu'il en a déjà une → « Passer à cette
   *    formule ». Le mot compte : « Choisir » laisse croire à une première
   *    souscription, alors qu'il en remplace une.
   *
   * L'essai en cours éteint TOUTES les formules payantes ? Non — au contraire,
   * c'est le moment où on veut qu'il puisse prendre un abonnement. Seul le
   * bouton de l'essai lui-même s'éteint.
   */
  const etatBouton = (offre) => {
    if (enCours === offre.code) return { texte: 'Un instant…', eteint: true };

    // Une descente déjà demandée : le bouton de la formule visée dit QUAND
    // elle arrivera, plutôt que de proposer de la redemander. Sans ça, un
    // parent qui revient sur la page croirait que sa demande n'a pas été prise.
    if (abonnement?.offrePrevueCode === offre.code) {
      return {
        texte: abonnement.changementPrevuLe
          ? `Prévu le ${dateCourte(abonnement.changementPrevuLe)}`
          : 'Changement prévu',
        eteint: true,
        actuelle: true,
      };
    }

    const sien = abonnement?.offreCode === offre.code;

    // Rythme inconnu — une API antérieure au champ `periodicite` — traité
    // comme IDENTIQUE. Se tromper dans ce sens affiche « votre formule
    // actuelle » sur un abonnement mensuel qu'on regarde à l'année : au pire
    // un bouton éteint de trop. Se tromper dans l'autre proposerait de
    // « passer à l'année » quelqu'un qui y est déjà, et ouvrirait une seconde
    // caisse. Entre un bouton en trop et un prélèvement en trop, c'est vite vu.
    const memeRythme = !abonnement?.periodicite || abonnement.periodicite === periodicite;

    if (sien && !enEssai) {
      return memeRythme
        ? { texte: 'Votre formule actuelle', eteint: true, actuelle: true }
        : { texte: annuel ? "Passer à l'année" : 'Passer au mois', eteint: false };
    }

    // Un abonnement payant en cours : on ne « choisit » plus, on change.
    if (abonnement && !enEssai) {
      return { texte: 'Passer à cette formule', eteint: false };
    }

    return {
      texte: choisie === offre.code ? 'Continuer avec cette formule' : 'Choisir cette formule',
      eteint: false,
    };
  };

  /**
   * Le bouton de l'essai.
   *
   * Trois cas, et aucun ne doit mener à une page qui ne fera rien : le serveur
   * n'accorde l'essai qu'à un compte qui n'a JAMAIS eu d'abonnement. Un bouton
   * qui part sans rien produire est pire qu'un bouton éteint — le visiteur ne
   * sait pas si c'est lui ou le site qui a échoué.
   */
  const etatEssai = () => {
    if (enCours === essai?.code) return { texte: 'Un instant…', eteint: true };

    if (enEssai) {
      return { texte: 'Votre essai est en cours', eteint: true, actuelle: true };
    }

    // Un abonnement payant : l'essai n'a plus d'objet, et le reproposer
    // laisserait croire qu'on peut revenir en arrière pour ne plus payer.
    if (abonnement) {
      return { texte: 'Vous avez déjà un abonnement', eteint: true };
    }

    return { texte: "Commencer l'essai", eteint: false };
  };

  // L'essai a sa place à part : le mettre dans la grille le ferait comparer
  // colonne par colonne avec des formules payantes, alors qu'il ne se compare
  // à rien — c'est une porte d'entrée.
  const essai = formules.find((f) => f.estEssai);
  const payantes = formules.filter((f) => !f.estEssai);

  return (
    <section className="page page--large page--tarifs-illu">
      {/* L'en-tête de la page commerciale, en présentation d'accroche : c'est
          le seul écran que voit un parent qui n'a pas encore de compte, il
          mérite plus qu'un titre de page administrative. */}
      <header className="page__entete page__entete--centre page__entete--accroche">
        <span className="page__surtitre">Nos formules</span>

        {/* Les deux derniers mots en couleur. C'est la promesse du produit —
            un professeur pour CHAQUE enfant, pas un abonnement par enfant —
            et une accroche entièrement en encre pleine ne dit pas où elle
            porte. */}
        <h1>
          {/* « UNE ÉQUIPE PÉDAGOGIQUE » — Camara, le 19/10/2026 : plus
              représentatif que « un professeur », Mimia en a un par matière. */}
          Une équipe pédagogique pour <em>chaque enfant</em>
        </h1>

        <p className="page__intro">
          Un seul abonnement pour toute la fratrie, et des heures à se partager.
          Sans engagement : vous arrêtez quand vous voulez.
        </p>
      </header>

      {/* Le rythme se choisit AVANT de comparer les formules.
          -------------------------------------------------
          Le prix annuel était relégué en petite ligne sous chaque carte : le
          visiteur devait faire la division lui-même pour savoir s'il y gagnait.
          Ici il bascule, et les trois prix changent ensemble — la comparaison
          reste possible, ce qui est tout l'objet d'une page de tarifs. */}
      <div className="rythme" role="group" aria-label="Rythme de facturation">
        <button
          type="button"
          className={!annuel ? 'actif' : ''}
          onClick={() => setPeriodicite('Mensuel')}
          aria-pressed={!annuel}
        >
          Au mois
        </button>
        <button
          type="button"
          className={annuel ? 'actif' : ''}
          onClick={() => setPeriodicite('Annuel')}
          aria-pressed={annuel}
        >
          À l'année
          <span className="rythme__gain">1 mois offert</span>
        </button>
      </div>

      {erreur && <div className="alert">{erreur}</div>}

      {reprise && authentifie && (
        <div className="alert alert--info">
          Vous étiez sur le point de choisir la formule{' '}
          <strong>{formules.find((f) => f.code === reprise)?.libelle ?? reprise}</strong>.
          Confirmez pour continuer.
        </div>
      )}

      {/* Un groupe de boutons radio, pas une simple liste de cartes : choisir
          une formule parmi trois EST un choix unique, et l'écrire ainsi donne
          la navigation aux flèches et l'annonce vocale sans code en plus. */}
      <div className="tarifs" role="radiogroup" aria-label="Formules d'abonnement">
        {payantes.map((offre, rang) => (
          <article
            key={offre.code}
            className={[
              'tarif',
              // La formule nommée (16/11/2026) : chaque carte a son décor (cerisier, Fuji, torii, maison).
              `tarif--${String(offre.code).toLowerCase()}`,
              choisie === offre.code ? 'tarif--choisie' : '',
              offre.code === 'DUO' ? 'tarif--vedette' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="radio"
            aria-checked={choisie === offre.code}
            // Seule la carte sélectionnée reste dans le parcours de tabulation :
            // c'est la règle d'un groupe radio, les flèches servent à circuler
            // entre les options.
            tabIndex={choisie === offre.code ? 0 : -1}
            onClick={() => setChoisie(offre.code)}
            onKeyDown={(evenement) => {
              if (evenement.key === ' ' || evenement.key === 'Enter') {
                evenement.preventDefault();
                setChoisie(offre.code);
              }
            }}
          >
            {offre.code === 'DUO' && <span className="tarif__ruban">Le plus choisi</span>}
            {/* RECOMMANDÉ, SUR SOLO — Camara, le 14/11/2026 : un petit badge bleu. Même place que le ruban de Duo
                (les deux cartes ne le portent jamais ensemble), en bleu pour ne pas se confondre avec lui. */}
            {offre.code === 'SOLO' && <span className="tarif__ruban tarif__ruban--recommande">Recommandé</span>}

            <h2 className="tarif__nom">
              {offre.libelle}

              {/* LA MENTION EST DANS LE TITRE, pas au-dessus en ruban : le
                  ruban est déjà pris par « Le plus choisi », et deux
                  étiquettes empilées sur une même carte s'annulent — on ne
                  sait plus laquelle compte. */}
              {enPromotion(offre) && (
                // SANS PARENTHÈSES (15/11/2026) : dans une pastille, elles ne disent rien et coûtaient la place qui
                // manquait à « Starter » et « Famille » pour garder la mention à côté du titre.
                <span className="tarif__mention">{lancement.texte}</span>
              )}
            </h2>
            <p className="tarif__accroche">{offre.accroche}</p>

            {/* Le prix affiché suit le rythme choisi. En annuel on montre le
                total de l'année, pas un « équivalent par mois » : c'est la
                somme qui sera prélevée, et l'annoncer autrement est le genre
                de raccourci qui se retourne au premier relevé bancaire. */}
            <p className="tarif__prix">
              <strong>
                {euros(annuel ? offre.prixAnnuelCentimes : offre.prixMensuelCentimes)}
              </strong>
              <span>{annuel ? "par an" : 'par mois'}</span>
            </p>

            {annuel ? (
              <p className="tarif__unitaire">
                soit {euros(Math.round(offre.prixAnnuelCentimes / 12))} par mois
                {offre.nombreEnfantsMax > 1 && ' pour toute la fratrie'}
              </p>
            ) : (
              offre.nombreEnfantsMax > 1 && (
                <p className="tarif__unitaire">
                  soit {euros(offre.prixParEnfantCentimes)} par enfant
                </p>
              )
            )}

            <Details
              offre={offre}
              lancement={enPromotion(offre) ? lancement.heures : 0}
              modules={modules}
              precedente={rang > 0 ? payantes[rang - 1] : null}
            />

            {/* La contrepartie de l'autre rythme, pour que le choix reste
                réversible sans remonter en haut de page. */}
            {offre.moisOfferts > 0 && (
              <p className="tarif__annuel">
                {annuel
                  ? `${offre.moisOfferts} mois offert${offre.moisOfferts > 1 ? 's' : ''}
                     par rapport au mois`
                  : `ou ${euros(offre.prixAnnuelCentimes)} à l'année — ${offre.moisOfferts} mois offert${offre.moisOfferts > 1 ? 's' : ''}`}
              </p>
            )}

            {/* Pas de stopPropagation : cliquer le bouton implique de choisir
                cette formule, donc la sélection qui remonte est cohérente. */}
            {(() => {
              const etat = etatBouton(offre);

              return (
                <button
                  type="button"
                  className={
                    'btn '
                    + (etat.actuelle
                      ? 'btn--actuelle'
                      : choisie === offre.code ? 'btn--principal' : 'btn--fantome')
                  }
                  onClick={() => choisir(offre)}
                  disabled={etat.eteint}
                >
                  {etat.texte}
                </button>
              );
            })()}
          </article>
        ))}
      </div>

      {/* Le bloc disparaît quand l'administrateur ferme les essais : afficher
          « 30 minutes offertes » avec un bouton que le serveur refusera serait
          promettre pour rien. Un essai DÉJÀ en cours n'est pas coupé pour
          autant — c'est la porte d'entrée qu'on ferme, pas ce qui est promis. */}
      {essai && essaisOuverts && (
        <div className="tarif-essai">
          {/* LE BANDEAU ILLUSTRÉ — maquette de Camara, 16/11/2026 : le calendrier coché à gauche (découpé dans
              sa maquette), cerisier et nuage en décor (tarifsIllustre.css). */}
          <img className="tarif-essai__icone" src={imageCalendrierEssai} alt="" />
          <div className="tarif-essai__texte">
            <strong>Essayez d'abord</strong>
            {/* « 0,5 h de cours, 7 jours » se lisait comme un essai de sept
                jours. C'est une SEULE demi-heure, et les sept jours ne sont que
                le délai pour l'utiliser : deux informations de nature
                différente que la virgule mettait sur le même plan. */}
            {/* SANS DÉLAI depuis le 18/10/2026 (`joursValidite` à 0) : la phrase
                ne parle de jours que si l'offre en fixe encore. */}
            {/* LA PHRASE DE LA MAQUETTE (16/11/2026), plus courte : ce qui est offert en gras, puis les
                trois garanties. Les jours ne sont cités que si l'offre en fixe encore. */}
            <p>
              <b>{heures(essai.heuresPot)} de cours offertes,</b> une seule fois,{' '}
              {essai.joursValidite > 0
                ? `à utiliser dans les ${essai.joursValidite} jours, sans carte bancaire.`
                : 'à utiliser quand vous voulez, sans date limite et sans carte bancaire.'}
            </p>
          </div>

          {(() => {
            const etat = etatEssai();

            return (
              <button
                type="button"
                className={`btn btn--compact tarif-essai__bouton ${etat.actuelle ? 'btn--actuelle' : ''}`}
                onClick={() => choisir(essai)}
                disabled={etat.eteint}
              >
                {etat.texte}
                {!etat.eteint && <span className="tarif-essai__fleche" aria-hidden="true">→</span>}
              </button>
            );
          })()}
        </div>
      )}

      {recharges.length > 0 && (
        <div className="separateur separateur--recharges">
          <h2>Besoin de plus un mois donné ?</h2>
          <p>
            Une semaine de révisions, un contrôle qui approche : vous ajoutez des
            heures sans changer de formule. Elles sont valables jusqu'au
            renouvellement.
          </p>
        </div>
      )}

      <div className="recharges">
        {recharges.map((pack) => (
          <div key={pack.code} className="recharge-carte">
            <svg className="recharge-carte__chrono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="13.5" r="8" /><path d="M12 9.5v4l2.5 1.6M9.5 2.5h5" />
            </svg>
            <strong>{heures(pack.heures)}</strong>
            <span>{euros(pack.prixCentimes)}</span>
          </div>
        ))}
      </div>

      <p className="tarifs__mention">
        <svg className="tarifs__info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" /><path d="M12 11v6M12 7.5v.01" />
        </svg>
        Prix nets en euros. TVA non applicable, art.&nbsp;293&nbsp;B du CGI.
        Les heures non utilisées ne se reportent pas d'un mois sur
        l'autre — en revanche vous pouvez mettre votre abonnement en pause un
        mois par an, sans rien perdre.
      </p>
    </section>
  );
}
