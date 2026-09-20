import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getIdees, getIdee, creerIdee, modifierIdee, supprimerIdee,
  ajouterPieceIdee, retirerPieceIdee, chargerPieceIdee,
} from '../lib/api/ideesApi';
import { rendreTexteRiche, entourerSelection } from '../lib/utils/texteRiche';
import { trier, inverser } from '../lib/utils/tri';
import { imprimerSous } from '../lib/impression';

// L'AMPOULE DU TITRE, EN WEBP — l'original pesait 963 Ko pour une icône de
// 52 px. Réencodée à 180 px de côté : 12 Ko.
import ampoule from '../assets/ampoule.webp';

/**
 * LE CARNET D'IDÉES D'ÉVOLUTION — voulu par Camara le 17/09/2026.
 *
 * UN CARNET, PAS UN OUTIL DE TICKETS. On y note une idée en deux champs : un
 * titre et une urgence. La description est facultative — une idée qu'on doit
 * documenter pour avoir le droit de l'écrire est une idée qu'on n'écrit pas.
 *
 * L'ÉDITION SE FAIT DANS LE TABLEAU, pas dans une fenêtre. Ouvrir une modale
 * pour changer un statut d'un cran demanderait trois clics là où il en faut
 * un ; le formulaire ne s'ouvre que pour écrire, et il prend toute la largeur
 * parce que c'est là qu'on écrit vraiment.
 */

const URGENCES = [
  { cle: 'Basse', libelle: 'Bas' },
  { cle: 'Moyenne', libelle: 'Moyen' },
  { cle: 'Haute', libelle: 'Haut' },
];

/**
 * LES PARTICIPES S'ACCORDENT AU FÉMININ — « une idée » : nouvelle, validée,
 * implémentée. Camara, le 17/09/2026.
 *
 * Les statuts, dans l'ordre du parcours — de la trouvaille à la production.
 * « Abandonnée » ferme la marche : ce n'est pas une étape, c'est une fin.
 */
const STATUTS = [
  'Nouvelle',
  "En cours d'analyse",
  'Validée',
  "En cours d'implémentation",
  'Implémentée',
  'En test',
  'En production',
  'Abandonnée',
];

/** Le nom de la classe CSS qui porte la couleur, sans accent ni espace. */
const glissante = (valeur) =>
  (valeur ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/* TROIS DESSINS, EN SVG ET NON EN ÉMOTICÔNES — Camara, le 17/09/2026 :
   « pour aperçu je veux l'icône d'œil, pour modifier un crayon, pour
   supprimer une corbeille ». Une émoticône est dessinée par le système :
   différente sur Windows, sur Mac et sur Android, et parfois pas dessinée
   du tout — on l'a vu le matin même avec le pictogramme d'image, sorti en
   carré. Un tracé SVG est le même partout, et il prend la couleur du
   bouton au lieu d'imposer la sienne. */
const Oeil = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

const Crayon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7.5 18.5l-4 1 1-4z" />
    <path d="M14.5 5.5l4 4" />
  </svg>
);

const Corbeille = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M9 7V4.8A.8.8 0 019.8 4h4.4a.8.8 0 01.8.8V7" />
    <path d="M6.5 7l.8 12.2a1 1 0 001 .8h7.4a1 1 0 001-.8L17.5 7" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const VIDE = { titre: '', urgence: 'Moyenne', description: '', statut: 'Nouvelle' };

/**
 * Le poids d'un fichier, en clair.
 *
 * Affiché sur les pièces jointes et pas sur les vignettes d'images : une
 * capture se juge à ce qu'elle montre, un document à ce qu'il coûte à
 * télécharger.
 */
const poids = (octets) => (octets >= 1024 * 1024
  ? `${(octets / (1024 * 1024)).toFixed(1)} Mo`
  : `${Math.max(1, Math.round(octets / 1024))} Ko`);

const dateCourte = (valeur) => {
  if (!valeur) return '';
  const date = new Date(valeur);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function IdeesAdmin() {
  const [idees, setIdees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // `null` : aucun formulaire. `{...}` : on écrit. `id` absent : c'est un ajout.
  const [brouillon, setBrouillon] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const [apercu, setApercu] = useState(null);

  // « Tous » plutôt qu'une valeur vide : une liste déroulante dont la
  // première entrée est vide laisse croire qu'on a oublié de choisir.
  /**
   * LE TRI DU CARNET — Camara, le 17/09/2026 : « de base les idées doivent
   * être classées du plus récent au plus vieux ».
   *
   * LE DÉFAUT EST ÉCRIT ICI ET NON SUPPOSÉ. L'API rend déjà les idées dans
   * cet ordre, et s'y fier aurait marché — jusqu'au jour où quelqu'un
   * changerait son `OrderByDescending` pour une bonne raison, et où le carnet
   * se retrouverait à l’envers sans que personne fasse le lien.
   */
  const [tri, setTri] = useState({ cle: 'creation', sens: 'desc' });

  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [filtreUrgence, setFiltreUrgence] = useState('toutes');

  // Les adresses locales des images, par identifiant de pièce. Libérées au
  // démontage : sans cela chaque aperçu laisse une copie en mémoire.
  const [urls, setUrls] = useState({});
  const urlsRef = useRef({});
  urlsRef.current = urls;

  const zoneTexte = useRef(null);
  const choixFichier = useRef(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const { data } = await getIdees();
      setIdees(data);
      setErreur(null);
    } catch {
      setErreur("Impossible de charger les idées.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // MONTÉ OU NON. Le téléchargement des images est asynchrone : fermer
  // l'onglet pendant qu'il tourne ferait écrire dans un composant démonté.
  const vivant = useRef(true);

  // REMIS À VRAI À CHAQUE MONTAGE, ET C'EST UNE CORRECTION DU 17/09/2026.
  //
  // React tourne en `StrictMode` : en développement il monte le composant, le
  // démonte, puis le remonte aussitôt. Le nettoyage passait donc `vivant` à
  // faux dès le premier démontage — et RIEN ne le remettait à vrai. Après ce
  // double montage, toute mise à jour des images était écartée en silence, le
  // message d'erreur compris : l'aperçu affichait « indisponible » sans jamais
  // dire pourquoi.
  //
  // La leçon vaut pour tous les drapeaux de ce genre : ils s'arment DANS
  // l'effet, jamais seulement à sa sortie.
  useEffect(() => {
    vivant.current = true;

    return () => {
      vivant.current = false;
      Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  /**
   * Télécharge les octets des pièces d'une idée, et les range par
   * IDENTIFIANT de pièce — l'adresse locale sert aussi bien à l'aperçu d'une
   * image qu'au lecteur audio.
   *
   * `genres` BORNE CE QU'ON RAPATRIE, et il le faut depuis que les pièces ne
   * sont plus seulement des captures d'écran. Le formulaire n'a besoin que
   * des vignettes ; rapatrier au passage un enregistrement de vingt
   * mégaoctets ferait attendre à l'ouverture pour un fichier que personne ne
   * va écouter. Les documents, eux, ne descendent JAMAIS tout seuls : ils
   * partent au clic sur « Télécharger ».
   */
  const chargerImages = useCallback(async (idee, genres = ['image']) => {
    const echecs = [];

    const aCharger = (idee.pieces ?? []).filter((p) => genres.includes(p.genre));

    const paires = await Promise.all(
      aCharger.map(async (piece) => {
        if (urlsRef.current[piece.id]) return [piece.id, urlsRef.current[piece.id]];
        try {
          return [piece.id, await chargerPieceIdee(idee.id, piece.id)];
        } catch (e) {
          // UN ÉCHEC SE DIT. Avalé, il donnait un aperçu sans image et sans
          // explication — « comme si ça n'existait pas ».
          echecs.push(`${piece.nomFichier} (${e?.response?.status ?? "réseau"})`);
          return null;
        }
      }),
    );

    if (echecs.length > 0 && vivant.current) {
      setErreur(`Pièce(s) illisible(s) : ${echecs.join(", ")}.`);
    }

    if (!vivant.current) return;

    setUrls((precedentes) => ({
      ...precedentes,
      ...Object.fromEntries(paires.filter(Boolean)),
    }));
  }, []);

  /**
   * Ce qu’on lit sur chaque idée pour la classer.
   *
   * L'AUTEUR SE TRIE SUR « PRÉNOM NOM » assemblé, et non sur le nom seul :
   * c’est ce que la colonne affiche, et un tri qui ne suit pas ce qu’on lit
   * passe pour une panne.
   */
  const VALEUR_TRI = {
    creation: (i) => i.dateCreation,
    auteur: (i) => [i.auteurPrenom, i.auteurNom].filter(Boolean).join(' '),
  };

  /**
   * Les idées après filtrage ET tri.
   *
   * FILTRÉ ET TRIÉ ICI, PAS SUR LE SERVEUR : le carnet tient en quelques
   * dizaines de lignes, elles sont déjà toutes chargées, et un aller-retour
   * par changement de critère rendrait le tableau lent pour rien.
   */
  const visibles = trier(
    idees.filter((idee) => (
      (filtreStatut === 'tous' || idee.statut === filtreStatut)
      && (filtreUrgence === 'toutes' || idee.urgence === filtreUrgence)
    )),
    VALEUR_TRI[tri.cle] ?? VALEUR_TRI.creation,
    tri.sens,
  );

  const urlParRang = (idee) => (rang) => {
    // Les pièces sans rang — audio, documents — sont à zéro : elles ne
    // peuvent donc jamais répondre à un `[image:N]`, qui commence à 1.
    const image = (idee?.pieces ?? []).find((p) => p.rang === rang && p.rang > 0);
    return image ? urls[image.id] : null;
  };

  /**
   * TÉLÉCHARGE UN DOCUMENT AU CLIC, ET PAS AVANT.
   *
   * Les octets ne descendent qu'ici : un PDF de maquettes pèse plus lourd que
   * tout le reste de l'idée, et ouvrir un aperçu pour relire trois lignes ne
   * doit pas le rapatrier. L'adresse locale créée pour l'occasion est libérée
   * au démontage, comme les autres.
   */
  const telecharger = async (idee, piece) => {
    try {
      const url = urlsRef.current[piece.id]
        ?? await chargerPieceIdee(idee.id, piece.id);

      if (!urlsRef.current[piece.id] && vivant.current) {
        setUrls((p) => ({ ...p, [piece.id]: url }));
      }

      const lien = document.createElement('a');
      lien.href = url;
      lien.download = piece.nomFichier;
      lien.click();
    } catch {
      setErreur(`« ${piece.nomFichier} » n’a pas pu être téléchargé.`);
    }
  };

  /** Les pièces qui ne vivent pas dans le texte : audio et documents. */
  const jointes = (idee) => (idee?.pieces ?? []).filter((p) => p.genre !== 'image');

  /** Les vignettes du formulaire : les images seules. */
  const vignettes = (idee) => (idee?.pieces ?? []).filter((p) => p.genre === 'image');

  const ouvrirAjout = () => { setBrouillon({ ...VIDE }); setApercu(null); };

  const ouvrirModification = (idee) => {
    setBrouillon({
      id: idee.id,
      titre: idee.titre,
      urgence: idee.urgence,
      description: idee.description ?? '',
      statut: idee.statut,
      pieces: idee.pieces ?? [],
    });
    setApercu(null);
    chargerImages(idee);
  };

  const enregistrer = async (evenement) => {
    evenement.preventDefault();
    if (!brouillon.titre.trim()) return;

    setEnvoi(true);
    try {
      if (brouillon.id) {
        await modifierIdee(brouillon.id, {
          titre: brouillon.titre,
          urgence: brouillon.urgence,
          description: brouillon.description,
          statut: brouillon.statut,
        });
      } else {
        await creerIdee({
          titre: brouillon.titre,
          urgence: brouillon.urgence,
          description: brouillon.description,
        });
      }

      setBrouillon(null);
      await charger();
      setErreur(null);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "L'idée n'a pas pu être enregistrée.");
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async (idee) => {
    // Une confirmation qui NOMME l'idée : « Supprimer ? » se clique sans lire,
    // et on efface alors la mauvaise ligne sans s'en apercevoir.
    if (!window.confirm(`Supprimer l'idée « ${idee.titre} » ? Cette action est définitive.`)) {
      return;
    }

    try {
      await supprimerIdee(idee.id);
      await charger();
    } catch {
      setErreur("L'idée n'a pas pu être supprimée.");
    }
  };

  /** Change le statut depuis le tableau, sans ouvrir le formulaire. */
  const changerStatut = async (idee, statut) => {
    try {
      await modifierIdee(idee.id, {
        titre: idee.titre,
        urgence: idee.urgence,
        description: idee.description,
        statut,
      });
      await charger();
    } catch {
      setErreur("Le statut n'a pas pu être changé.");
    }
  };

  /** Pose une balise autour de la sélection et rend le curseur au bon endroit. */
  const baliser = (avant, apres) => {
    const champ = zoneTexte.current;
    if (!champ) return;

    const { texte, debut, fin } = entourerSelection(
      brouillon.description ?? '', champ.selectionStart, champ.selectionEnd, avant, apres,
    );

    setBrouillon((b) => ({ ...b, description: texte }));

    // Après le rendu : React réécrit la valeur du champ, et une position posée
    // avant serait effacée.
    requestAnimationFrame(() => {
      champ.focus();
      champ.setSelectionRange(debut, fin);
    });
  };

  /**
   * L'identifiant de l'idée en cours, EN LA CRÉANT s'il le faut.
   *
   * UNE IMAGE SE RANGE EN BASE À CÔTÉ DE SON IDÉE : tant que celle-ci
   * n'existe pas, il n'y a pas de « à côté ». La première version
   * désactivait donc le bouton image sur une idée neuve — Camara, le
   * 17/09/2026 : « je peux pas ajouter d'image ». C'était la bonne
   * contrainte et la mauvaise réponse : on enregistre l'idée à sa place,
   * au moment où il colle. Il ne lui reste qu'à donner un titre, et ce
   * n'est pas une formalité — une idée sans titre ne se retrouve pas.
   */
  const assurerIdee = async () => {
    if (brouillon?.id) return brouillon.id;

    if (!brouillon?.titre?.trim()) {
      setErreur('Donne un titre à l’idée, puis colle ton image : elle se range en base à côté d’elle.');
      return null;
    }

    const { data } = await creerIdee({
      titre: brouillon.titre,
      urgence: brouillon.urgence,
      description: brouillon.description,
    });

    setBrouillon((b) => ({ ...b, id: data.id, statut: data.statut }));
    await charger();

    return data.id;
  };

  /**
   * Téléverse un fichier et le raccroche à l'idée.
   *
   * UNE IMAGE POSE SON MARQUEUR À LA POSITION DU CURSEUR — et non à la fin du
   * texte, où il aurait atterri trois paragraphes plus bas que l'endroit qu'il
   * illustre.
   *
   * UN AUDIO OU UN DOCUMENT N'ÉCRIT RIEN DANS LE TEXTE. Ce sont des pièces
   * jointes au sens du courrier : elles se posent sous la description, et un
   * `[document:2]` planté au milieu d'une phrase n'aurait rien décrit du tout.
   * C'est le serveur qui tranche, en rendant un rang à 0.
   */
  const televerserImage = async (fichier) => {
    const champ = zoneTexte.current;
    const position = champ ? champ.selectionStart : (brouillon?.description ?? "").length;

    const ideeId = await assurerIdee();
    if (!ideeId) return;

    const { data } = await ajouterPieceIdee(ideeId, fichier);
    const { data: fraiche } = await getIdee(ideeId);

    setBrouillon((b) => {
      const texte = b.description ?? "";

      if (data.rang <= 0) return { ...b, pieces: fraiche.pieces ?? [] };

      const marqueur = `\n[image:${data.rang}]\n`;

      return {
        ...b,
        description: texte.slice(0, position) + marqueur + texte.slice(position),
        pieces: fraiche.pieces ?? [],
      };
    });

    chargerImages(fraiche);
    await charger();
    setErreur(null);
  };

  /**
   * COLLER UNE CAPTURE D'ÉCRAN DIRECTEMENT DANS LE CHAMP — Camara, le
   * 17/09/2026. C'est le geste naturel : on fait sa capture, on colle.
   * Passer par un sélecteur de fichiers obligerait à l'enregistrer quelque
   * part d'abord, et une capture qu'on doit ranger sur son disque est une
   * capture qu'on ne joint pas.
   *
   * ON N'INTERCEPTE QUE LES IMAGES : un collage de texte ordinaire doit
   * continuer de fonctionner tel quel, donc `preventDefault` seulement
   * quand il y a bien un fichier image dans le presse-papier.
   */
  const collerDansDescription = async (evenement) => {
    const elements = Array.from(evenement.clipboardData?.items ?? []);
    const image = elements.find((e) => e.kind === 'file' && e.type.startsWith('image/'));

    if (!image) return;

    const fichier = image.getAsFile();
    if (!fichier) return;

    evenement.preventDefault();

    try {
      await televerserImage(fichier);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'L’image collée n’a pas pu être ajoutée.');
    }
  };

  const insererImage = async (evenement) => {
    const fichier = evenement.target.files?.[0];
    evenement.target.value = '';
    if (!fichier) return;

    try {
      await televerserImage(fichier);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "L'image n'a pas pu être ajoutée.");
    }
  };

  const retirerImage = async (piece) => {
    try {
      const { data } = await retirerPieceIdee(brouillon.id, piece.id);

      // La description revient RÉÉCRITE quand c'était une image : les
      // marqueurs des suivantes ont reculé d'un rang. La recalculer ici ferait
      // deux règles au lieu d'une, et elles finiraient par diverger.
      setBrouillon((b) => ({
        ...b,
        description: data.description ?? '',
        pieces: (b.pieces ?? []).filter((p) => p.id !== piece.id),
      }));

      await charger();
    } catch {
      setErreur("La pièce jointe n'a pas pu être retirée.");
    }
  };

  const imprimer = (idee) => {
    const nom = `Mimia--Idee-${idee.id}-${glissante(idee.titre).slice(0, 40)}`;
    imprimerSous(nom, '.idee-apercu');
  };

  return (
    <section className="idees">
      <div className="idees__tete">
        {/* L'AMPOULE ET LE TITRE, D'UN BLOC — Camara, le 19/09/2026 : « rends-le
            plus beau, mets l'ampoule ». Le halo chaud autour d'elle est ce qui
            la fait lire comme ALLUMÉE, donc comme une idée : posée à plat sur
            le fond bleu, ce n'était qu'un dessin d'objet. */}
        <div className="idees__entete">
          <span className="idees__ampoule" aria-hidden="true">
            <img src={ampoule} alt="" />
          </span>

          <div>
          <h2 className="idees__titre">Idées d’évolution</h2>
          <p className="idees__sous-titre">
            {idees.length === 0
              ? 'Aucune idée pour le moment.'
              : visibles.length === idees.length
                ? `${idees.length} idée${idees.length > 1 ? 's' : ''} au carnet.`
                // LE FILTRE DIT CE QU'IL CACHE. « 2 idées » sur un carnet qui en
                // porte douze se lit comme une perte de données.
                : `${visibles.length} sur ${idees.length} idée${idees.length > 1 ? 's' : ''}.`}
          </p>
          </div>
        </div>

        {!brouillon && (
          <button type="button" className="btn btn--principal" onClick={ouvrirAjout}>
            Nouvelle idée
          </button>
        )}
      </div>

      {erreur && <p className="alert">{erreur}</p>}

      {/* ------------------------------------------------------- le formulaire */}
      {brouillon && (
        <form className="idee-form" onSubmit={enregistrer}>
          <div className="idee-form__ligne">
            <label className="idee-form__champ idee-form__champ--large">
              <span>Titre</span>
              <input
                type="text"
                maxLength={150}
                value={brouillon.titre}
                placeholder="Ce qu’on retient de l’idée en une ligne"
                onChange={(e) => setBrouillon({ ...brouillon, titre: e.target.value })}
              />
            </label>

            <label className="idee-form__champ">
              <span>Urgence</span>
              <select
                value={brouillon.urgence}
                onChange={(e) => setBrouillon({ ...brouillon, urgence: e.target.value })}
              >
                {URGENCES.map((u) => (
                  <option key={u.cle} value={u.cle}>{u.libelle}</option>
                ))}
              </select>
            </label>

            {/* LE STATUT N'EXISTE QU'EN MODIFICATION. Une idée naît « Nouveau »,
                toujours — c'est le serveur qui l'impose, et proposer le choix à
                la création laisserait croire le contraire. */}
            {brouillon.id && (
              <label className="idee-form__champ">
                <span>Statut</span>
                <select
                  value={brouillon.statut}
                  onChange={(e) => setBrouillon({ ...brouillon, statut: e.target.value })}
                >
                  {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}
          </div>

          <div className="idee-form__champ">
            <label className="idee-form__etiquette" htmlFor="idee-description">
              Description
            </label>

            <div className="idee-outils" role="toolbar" aria-label="Mise en forme">
              <button type="button" onClick={() => baliser('**')} title="Gras">
                <strong>G</strong>
              </button>
              <button type="button" onClick={() => baliser('_')} title="Italique">
                <em>I</em>
              </button>
              {/* PLUS DE BOUTON « LIEN » — Camara, le 17/09/2026 : « elle ne
                  sert plus à rien ». Depuis que coller une adresse la
                  transforme en lien cliquable toute seule, ce bouton ne
                  faisait qu'écrire `[](https://)` à remplir à la main.

                  PLUS DE BOUTON DÉSACTIVÉ NON PLUS : si l'idée n'existe pas
                  encore, elle est enregistrée au moment du clic (voir
                  `assurerIdee`). */}
              <button
                type="button"
                onClick={() => choixFichier.current?.click()}
                title="Joindre une image, un audio ou un document — ou colle directement ta capture dans le champ"
                aria-label="Joindre un fichier"
              >
                📎
              </button>

              {/* CE QUE LE SERVEUR ACCEPTE, ET RIEN DE PLUS. Cette liste ne
                  protège rien — elle se contourne dans le sélecteur du système —
                  mais elle épargne à Camara de choisir un fichier pour se voir
                  refuser après le téléversement. La vraie liste blanche est dans
                  `IdeesController`. */}
              <input
                ref={choixFichier}
                type="file"
                aria-label="Fichier à joindre"
                accept={[
                  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
                  'audio/*',
                  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
                  '.txt', '.csv', '.rtf', '.zip',
                ].join(',')}
                className="visuellement-cache"
                onChange={insererImage}
              />

              <button
                type="button"
                className="idee-outils__apercu"
                onClick={async () => {
                  await chargerImages(brouillon, ['image', 'audio']);
                  setApercu({ ...brouillon, id: brouillon.id ?? 0 });
                }}
              >
Aperçu du brouillon
              </button>

              <span className="idee-outils__aide">
                Colle ta capture ici · 😀 🚀 ⚠️
              </span>
            </div>

            <textarea
              id="idee-description"
              ref={zoneTexte}
              rows={10}
              onPaste={collerDansDescription}
              value={brouillon.description ?? ''}
              placeholder="Ce qui manque, pourquoi, et à quoi ça ressemblerait."
              onChange={(e) => setBrouillon({ ...brouillon, description: e.target.value })}
            />
          </div>

          {vignettes(brouillon).length > 0 && (
            <div className="idee-form__images">
              {vignettes(brouillon).map((image) => (
                <span key={image.id} className="idee-vignette">
                  {/* LA VIGNETTE MONTRE L'IMAGE — Camara, le 17/09/2026 : « je
                      veux voir l'image directement ». Un nom de fichier et un
                      numéro ne disent pas ce qu'on vient de coller, surtout
                      quand trois captures se suivent et s'appellent toutes
                      « image.png ». */}
                  {urls[image.id]
                    ? (
                      <img
                        className="idee-vignette__apercu"
                        src={urls[image.id]}
                        alt={`Illustration ${image.rang}`}
                      />
                    )
                    : <span className="idee-vignette__attente" aria-hidden="true" />}

                  <span className="idee-vignette__rang">[image:{image.rang}]</span>
                  <span className="idee-vignette__nom">{image.nomFichier}</span>
                  <button
                    type="button"
                    className="idee-vignette__croix"
                    aria-label={`Retirer ${image.nomFichier}`}
                    onClick={() => retirerImage(image)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* LES PIÈCES JOINTES, SÉPARÉES DES VIGNETTES — Camara, le
              17/09/2026 : « si c'est une image, on l'affiche, si c'est un autre
              document, il sera juste mis en pj téléchargeable ».

              Une image vit DANS le texte, à l'endroit de son marqueur : sa
              vignette porte donc `[image:N]`, qui dit où elle apparaîtra. Un
              audio et un document vivent SOUS le texte, comme les pièces
              jointes d'un courriel — ils n'ont pas de marqueur, et leur en
              afficher un aurait laissé croire qu'il fallait le recopier
              quelque part. */}
          {jointes(brouillon).length > 0 && (
            <div className="idee-form__jointes">
              <p className="idee-form__jointes-titre">Pièces jointes</p>

              {jointes(brouillon).map((piece) => (
                <span key={piece.id} className="idee-jointe">
                  <span className="idee-jointe__icone" aria-hidden="true">
                    {piece.genre === 'audio' ? '🎧' : '📄'}
                  </span>

                  <span className="idee-jointe__nom">{piece.nomFichier}</span>
                  <span className="idee-jointe__poids">{poids(piece.taille)}</span>

                  <button
                    type="button"
                    className="idee-vignette__croix"
                    aria-label={`Retirer ${piece.nomFichier}`}
                    onClick={() => retirerImage(piece)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="idee-form__actions">
            <button type="submit" className="btn btn--principal" disabled={envoi}>
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setBrouillon(null)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------ la liste */}
      {chargement ? (
        <p className="idees__vide">Chargement…</p>
      ) : idees.length === 0 ? (
        <p className="idees__vide">
          Rien encore. La première idée est souvent celle qu’on a eue il y a
          cinq minutes et qu’on allait oublier.
        </p>
      ) : (
        <>
          {/* LES FILTRES AU-DESSUS DU TABLEAU, jamais dans son en-tête : une
              colonne qui se filtre elle-même oblige à cliquer dedans pour
              découvrir qu'elle le peut. */}
          <div className="idees__filtres">
            <label>
              {/* NOMMÉS EN TOUTES LETTRES : « Statut » seul entrait en collision avec
                  le libellé du formulaire ET avec l en-tête de colonne. Un lecteur
                  d écran annonçait alors trois champs du même nom. */}
              <span>Filtrer par statut</span>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
              >
                <option value="tous">Tous</option>
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label>
              <span>Filtrer par urgence</span>
              <select
                value={filtreUrgence}
                onChange={(e) => setFiltreUrgence(e.target.value)}
              >
                <option value="toutes">Toutes</option>
                {URGENCES.map((u) => (
                  <option key={u.cle} value={u.cle}>{u.libelle}</option>
                ))}
              </select>
            </label>

            {/* LE CRITÈRE ET LE SENS SONT DEUX COMMANDES SÉPARÉES — même
                raison que dans le tableau des parents : doubler les entrées
                de la liste aurait obligé à la rouvrir pour inverser. */}
            <label>
              <span>Trier par</span>
              <select
                value={tri.cle}
                onChange={(e) => setTri({ cle: e.target.value, sens: 'desc' })}
              >
                <option value="creation">Date de création</option>
                <option value="auteur">Créée par</option>
              </select>
            </label>

            <button
              type="button"
              className="btn-ghost btn-ghost--mini idees__sens"
              onClick={() => setTri((t) => ({ ...t, sens: inverser(t.sens) }))}
              title={tri.sens === 'desc'
                ? 'Du plus récent au plus ancien — cliquez pour inverser'
                : 'Du plus ancien au plus récent — cliquez pour inverser'}
            >
              {tri.sens === 'desc' ? '↓ Décroissant' : '↑ Croissant'}
            </button>

            {(filtreStatut !== 'tous' || filtreUrgence !== 'toutes') && (
              <button
                type="button"
                className="btn-ghost btn-ghost--mini"
                onClick={() => { setFiltreStatut('tous'); setFiltreUrgence('toutes'); }}
              >
                Tout afficher
              </button>
            )}
          </div>

          {/* `.tableau` EST LE CONTENEUR, PAS LA TABLE — c'est la convention de
              tout le site, et l'avoir inversée coûtait la largeur : la règle
              qui pose `width: 100%` vise `.tableau table`, donc la table
              n'était jamais étirée et s'arrêtait à son contenu. */}
          <div className="tableau">
            <table className="idees__tableau">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Urgence</th>
                <th>Statut</th>
                <th>Créée par</th>
                <th>Créée le</th>
                <th>Modifiée le</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((idee) => (
                <tr key={idee.id}>
                  <td className="idees__cellule-titre">{idee.titre}</td>
                  <td className="idees__cellule-urgence">
                    <span className={`idee-urgence idee-urgence--${glissante(idee.urgence)}`}>
                      {URGENCES.find((u) => u.cle === idee.urgence)?.libelle ?? idee.urgence}
                    </span>
                  </td>
                  <td className="idees__cellule-statut">
                    <select
                      className={`idee-statut idee-statut--${glissante(idee.statut)}`}
                      value={idee.statut}
                      aria-label={`Statut de ${idee.titre}`}
                      onChange={(e) => changerStatut(idee, e.target.value)}
                    >
                      {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="idees__auteur" data-libelle="Par">
                    {[idee.auteurPrenom, idee.auteurNom].filter(Boolean).join(' ') || '—'}
                  </td>

                  <td className="idees__date-creation" data-libelle="Créée le">{dateCourte(idee.dateCreation)}</td>

                  {/* JAMAIS MODIFIÉE : un tiret, et non la date de création
                      répétée. Répéter la même date des deux côtés donnerait à
                      croire qu'on y a retouché le jour même. */}
                  <td className="idees__date-modif" data-libelle="Modifiée le">
                    {idee.dateModification
                      ? dateCourte(idee.dateModification)
                      : <span aria-label="jamais modifiée">—</span>}
                  </td>
                  {/* LA CELLULE RESTE UNE CELLULE, LE FLEX VA DANS LA BOÎTE.

                      Le `display: flex` était posé sur le `td` lui-même, ce qui
                      lui retirait son display `table-cell` : la ligne de
                      séparation que `.tableau td` dessine sous chaque cellule
                      ne se peignait plus sous celle-ci. Sur un tableau à sept
                      colonnes, le trait courait donc jusqu'aux dates et
                      s'arrêtait net avant les boutons. */}
                  <td className="idees__cellule-actions">
                    <div className="idees__actions">
                      {/* TROIS ACTIONS, TROIS COULEURS — Camara, le 17/09/2026.
                          Trois boutons gris côte à côte se lisent comme un bloc :
                          on vise « Modifier » et on clique « Supprimer ». Chacune
                          porte donc sa teinte, et « Supprimer » garde le rouge qui
                          l'isole déjà. */}
                      {/* DES DESSINS SEULS, PAS DES DESSINS AVEC LEUR MOT. Trois
                          libellés côte à côte débordaient de la colonne et
                          repassaient à la ligne. Chacun garde son nom pour qui ne
                          voit pas l'image — `aria-label` pour un lecteur d'écran,
                          `title` pour l'infobulle au survol. */}
                      <button
                        type="button"
                        className="idee-action idee-action--apercu"
                        title="Aperçu"
                        aria-label={`Aperçu de ${idee.titre}`}
                        // LES IMAGES D'ABORD, LA FENÊTRE ENSUITE : ouverte avant,
                        // elle s'affichait sans elles le temps du téléchargement,
                        // et un aperçu qu'on referme dans la seconde n'a jamais
                        // le temps de les montrer.
                        onClick={async () => {
                          // L'AUDIO DESCEND ICI ET PAS AVANT : c'est l'aperçu qui
                          // le fait entendre, et lui seul. Le charger à
                          // l'ouverture du formulaire ferait attendre pour un
                          // fichier que personne n'écoutera peut-être.
                          await chargerImages(idee, ['image', 'audio']);
                          setApercu(idee);
                        }}
                      >
                        <Oeil />
                      </button>
                      <button
                        type="button"
                        className="idee-action idee-action--modifier"
                        title="Modifier"
                        aria-label={`Modifier ${idee.titre}`}
                        onClick={() => ouvrirModification(idee)}
                      >
                        <Crayon />
                      </button>
                      <button
                        type="button"
                        className="idee-action idee-action--supprimer"
                        title="Supprimer"
                        aria-label={`Supprimer ${idee.titre}`}
                        onClick={() => supprimer(idee)}
                      >
                        <Corbeille />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------ l'aperçu */}
      {apercu && (
        <div
          className="modale"
          role="dialog"
          aria-modal="true"
          aria-label={`Aperçu de ${apercu.titre}`}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setApercu(null); }}
        >
          <div className="modale__boite modale__boite--large">
            {/* LA FEUILLE SEULE EST IMPRIMÉE — `imprimerSous` masque tout le
                reste de la page en remontant ses ancêtres. D'où cette classe
                sur le contenu et non sur la fenêtre : les boutons « Fermer »
                et « Télécharger » n'ont rien à faire dans le PDF. */}
            <article className="idee-apercu">
              <header className="idee-apercu__tete">
                <h3>{apercu.titre}</h3>
                <p className="idee-apercu__meta">
                  <span className={`idee-urgence idee-urgence--${glissante(apercu.urgence)}`}>
                    {URGENCES.find((u) => u.cle === apercu.urgence)?.libelle ?? apercu.urgence}
                  </span>
                  <span className={`idee-statut-pastille idee-statut--${glissante(apercu.statut)}`}>
                    {apercu.statut}
                  </span>
                  <span className="idee-apercu__date">Créée le {dateCourte(apercu.dateCreation)}</span>
                </p>
              </header>

              <div className="texte-riche">
                {apercu.description?.trim()
                  ? rendreTexteRiche(apercu.description, urlParRang(apercu))
                  : <p className="idee-apercu__sans">Pas de description.</p>}
              </div>

              {/* L'AUDIO S'ÉCOUTE ICI, LE DOCUMENT SE TÉLÉCHARGE — Camara, le
                  17/09/2026. Les deux sont sous le texte et non dedans : ce sont
                  des pièces jointes, pas des illustrations.

                  Les adresses sont locales (`blob:`) et non des liens vers
                  l'API : l'application s'authentifie par un en-tête, qu'une
                  balise `audio` ou un lien de téléchargement ne porteraient
                  pas. */}
              {jointes(apercu).length > 0 && (
                <section className="idee-apercu__jointes">
                  <h4>Pièces jointes</h4>

                  {jointes(apercu).map((piece) => (
                    <div key={piece.id} className="idee-apercu__jointe">
                      {piece.genre === 'audio' ? (
                        <>
                          <p className="idee-apercu__jointe-nom">
                            🎧 {piece.nomFichier}
                            <span className="idee-jointe__poids">{poids(piece.taille)}</span>
                          </p>

                          {urls[piece.id]
                            ? (
                              // eslint-disable-next-line jsx-a11y/media-has-caption -- une note vocale de Camara pour lui-même, dans son carnet privé : il n’y a ni transcription à afficher ni second lecteur à qui la donner.
                              <audio controls src={urls[piece.id]} preload="metadata" />
                            )
                            : (
                              <p className="idee-apercu__sans">
                                Chargement du son…
                              </p>
                            )}
                        </>
                      ) : (
                        <p className="idee-apercu__jointe-nom">
                          📄 {piece.nomFichier}
                          <span className="idee-jointe__poids">{poids(piece.taille)}</span>

                          <button
                            type="button"
                            className="btn-ghost btn-ghost--mini"
                            onClick={() => telecharger(apercu, piece)}
                          >
                            Télécharger
                          </button>
                        </p>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </article>

            <div className="modale__actions">
              <button type="button" className="btn-ghost" onClick={() => imprimer(apercu)}>
                Télécharger en PDF
              </button>
              <button type="button" className="btn btn--compact" onClick={() => setApercu(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
