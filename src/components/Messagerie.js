import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMessages,
  getMessage,
  marquerMessageLu,
  repondreMessage,
  deconnecterBoite,
  supprimerMessages,
  getCompteursMessagerie,
  telechargerPieceJointe,
  getBrouillonPour,
  enregistrerBrouillon,
} from '../lib/api/adminApi';
import Loader from './Loader';
import ConnexionBoite from './ConnexionBoite';
import Pagination from './Pagination';
import MessageParent from './MessageParent';

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
/**
 * DEUX BOÎTES (17/10/2026) — Camara : « Ma boîte », celle de la personne
 * connectée une fois sa boîte LWS branchée, et « Support », la boîte commune,
 * toujours connectée, ouverte aux administrateurs ; on y répond depuis
 * support@mimia.fr, comme avant.
 */
/**
 * TROIS DOSSIERS (17/10/2026) — Camara : « Boîte de réception », « Messages
 * envoyés », « Brouillons » ; supprimer un message ou toute la page ; dix
 * messages par page. Une réponse non envoyée est gardée en brouillon au fil de
 * la frappe.
 */
const DOSSIERS = [
  { id: 'reception', libelle: 'Boîte de réception' },
  { id: 'envoyes', libelle: 'Messages envoyés' },
  { id: 'brouillons', libelle: 'Brouillons' },
];

const PAR_PAGE = 10;

/**
 * LE COURRIEL À LA LARGEUR DE L'ÉCRAN — Camara, le 17/10/2026 : « que les mails
 * soient lisibles sur mobile ». Un courriel est mis en page pour 600 px ou plus :
 * dans le cadre d'un téléphone, il débordait. On lui donne la largeur de
 * l'appareil et on borne ses tableaux et ses images ; le contenu, lui, ne change
 * pas (toujours affiché dans le cadre isolé, sans script).
 */
// SA VRAIE LARGEUR SUR ORDINATEUR (Camara, le 18/10/2026 : « en moins gros,
// pour scroller le moins possible ») : un courriel mis en page pour 600 px
// était étiré à toute la fenêtre agrandie, bannière et images comprises. Il
// n'est désormais ramené à la largeur de l'écran que sur un téléphone.
const LECTURE_ADAPTEE = '<meta name="viewport" content="width=device-width, initial-scale=1">'
  + '<style>html,body{margin:0;padding:8px;overflow-wrap:anywhere;-webkit-text-size-adjust:100%}'
  + 'table{max-width:100%!important}img{max-width:100%!important;height:auto!important}'
  + 'td,th{word-break:break-word}pre{white-space:pre-wrap}'
  + '@media (max-width:640px){table[width]{width:100%!important;table-layout:fixed}td[width]{width:auto!important}}'
  + '</style>';

/** `zoom` (en %) : la fenêtre agrandie peut réduire le courriel pour le voir d'un coup. */
const pourLecture = (html, zoom = 100) => LECTURE_ADAPTEE
  + (zoom !== 100 ? `<style>html{zoom:${zoom / 100}}</style>` : '')
  + (html ?? '');

const ZOOMS = [50, 60, 70, 80, 90, 100];

/**
 * La pastille d'un onglet : les non lus en orange pour la réception (sinon le
 * total), le total des envoyés, les brouillons en ambre. Rien tant qu'on ne sait
 * pas, ni pour un dossier vide.
 */
function PastilleDossier({ dossier, compteurs, nonLus }) {
  if (dossier === 'reception' && nonLus > 0) {
    return <span className="messagerie__dossier-compte" title={`${nonLus} non lu(s)`}>{nonLus}</span>;
  }

  const nombre = compteurs[dossier];
  if (!nombre) return null;

  return (
    <span className={`messagerie__dossier-compte messagerie__dossier-compte--${dossier}`}>
      {nombre > 999 ? '999+' : nombre}
    </span>
  );
}

/** L'objet d'une réponse : « Re : … », sans doubler le « Re ». */
const objetDeReponse = (sujet) =>
  (/^re\b/i.test(sujet ?? '') ? sujet : `Re : ${sujet || 'Votre message'}`);

/**
 * « ÉCRIRE UN NOUVEAU MESSAGE » — Camara, le 17/10/2026 : un bouton devant
 * « Boîte de réception » ouvre, dans une fenêtre, exactement le formulaire
 * d'« Écrire à un parent » (qui n'est plus un onglet). Un brouillon de ce
 * formulaire, choisi dans « Brouillons », s'y rouvre aussi.
 */
export default function Messagerie({ boite = 'moi', parents = [] }) {
  const estSupport = boite === 'support';
  const [dossier, setDossier] = useState('reception');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [nonLus, setNonLus] = useState(0);
  const [messages, setMessages] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [selection, setSelection] = useState(() => new Set());
  const [suppression, setSuppression] = useState(false);
  const [configuree, setConfiguree] = useState(true);
  // LA BOÎTE DE LA PERSONNE CONNECTÉE (17/10/2026) : son adresse une fois
  // connectée, ou ce qu'il manque (409 du serveur : code, adresse proposée).
  const [adresseBoite, setAdresseBoite] = useState(null);
  const [aConnecter, setAConnecter] = useState(null);
  const [erreur, setErreur] = useState(null);

  // Le message ouvert, et le dossier où il se lit : un brouillon ouvre le
  // message de la réception auquel il répond.
  const [ouvert, setOuvert] = useState(null);
  const [dossierOuvert, setDossierOuvert] = useState('reception');
  const [chargementCorps, setChargementCorps] = useState(false);
  const [images, setImages] = useState(false);
  // Le courriel en grand, dans une fenêtre (17/10/2026), et son zoom (18/10/2026) :
  // gardé d'un message à l'autre, comme dans un lecteur de documents.
  const [enGrand, setEnGrand] = useState(false);
  const [zoom, setZoom] = useState(() => {
    try {
      const garde = Number(localStorage.getItem('mimia.messagerie.zoom'));
      return ZOOMS.includes(garde) ? garde : 80;
    } catch {
      return 80;
    }
  });
  const changerZoom = (sens) => setZoom((z) => {
    const suivant = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, ZOOMS.indexOf(z) + sens))];
    try { localStorage.setItem('mimia.messagerie.zoom', String(suivant)); } catch { /* navigation privée */ }
    return suivant;
  });

  useEffect(() => {
    if (!enGrand) return undefined;
    const surTouche = (e) => { if (e.key === 'Escape') setEnGrand(false); };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, [enGrand]);

  // LES PASTILLES DES ONGLETS (Camara, le 17/10/2026) : combien dans chaque
  // dossier, relues aux moments où elles changent (envoi, suppression,
  // brouillon, rafraîchissement) — pas à chaque page.
  const [compteurs, setCompteurs] = useState({ reception: null, envoyes: null, brouillons: null });

  // Lus APRÈS la liste, jamais en même temps : deux connexions simultanées à la
  // même boîte LWS, l'une échouait, et les pastilles restaient vides jusqu'au
  // prochain clic (Camara, le 17/10/2026). Tant qu'ils n'ont pas abouti, chaque
  // rechargement de la liste les redemande.
  const compteursCharges = useRef(false);

  const chargerCompteurs = useCallback(async () => {
    try {
      const { data } = await getCompteursMessagerie(boite);
      if (!data) return;

      // La boîte n'a pas répondu : les brouillons (en base) restent justes,
      // les nombres de la boîte ne sont pas remplacés par des zéros.
      if (data.erreur) {
        setCompteurs((c) => ({ ...c, brouillons: data.brouillons }));
        return;
      }

      setCompteurs({ reception: data.reception, envoyes: data.envoyes, brouillons: data.brouillons });
      setNonLus(data.nonLus ?? 0);
      compteursCharges.current = true;
    } catch {
      // Sans compteurs, les onglets restent sans pastille : rien d'autre ne casse.
    }
  }, [boite]);

  // La fenêtre de rédaction : ouverte (vide ou sur un brouillon), ou fermée.
  const [redaction, setRedaction] = useState(null);

  const [reponse, setReponse] = useState('');
  const [envoi, setEnvoi] = useState(false);
  // Le compte rendu de l'envoi, tel que le serveur l'a dit : destinataire
  // réel, accusé SMTP, dépôt de la copie. « Réponse envoyée » ne suffit pas
  // quand le message n'arrive pas — c'est ce qui nous a coûté une heure.
  const [envoye, setEnvoye] = useState(null);

  // LE BROUILLON, ENREGISTRÉ AU FIL DE LA FRAPPE : une pause d'une seconde et
  // demie suffit ; changer de message ou d'onglet l'enregistre aussitôt.
  const [etatBrouillon, setEtatBrouillon] = useState(null);
  const minuteur = useRef(null);
  const aEnregistrer = useRef(null);

  const enregistrerMaintenant = useCallback(async () => {
    clearTimeout(minuteur.current);
    minuteur.current = null;
    const brouillon = aEnregistrer.current;
    if (!brouillon) return;
    aEnregistrer.current = null;

    setEtatBrouillon({ etat: 'enregistrement' });
    try {
      await enregistrerBrouillon(brouillon, boite);
      const garde = brouillon.texte.trim() !== '';
      setEtatBrouillon(garde ? { etat: 'enregistre', heure: new Date() } : null);
      chargerCompteurs();
      setMessages((liste) => liste?.map((m) => (
        m.identifiant === brouillon.messageOrigine && m.aUnBrouillon !== undefined
          ? { ...m, aUnBrouillon: garde }
          : m)));
    } catch {
      setEtatBrouillon({ etat: 'erreur' });
    }
  }, [boite, chargerCompteurs]);

  // En quittant l'écran, ce qui restait à enregistrer part quand même.
  const enregistrerRef = useRef(enregistrerMaintenant);
  enregistrerRef.current = enregistrerMaintenant;
  useEffect(() => () => { enregistrerRef.current(); }, []);

  const charger = useCallback(async (dossierVoulu = dossier, pageVoulue = page) => {
    setErreur(null);
    setChargement(true);

    try {
      const { data } = await getMessages(boite, dossierVoulu, pageVoulue + 1);
      setAConnecter(null);
      setAdresseBoite(data?.adresse ?? null);
      setConfiguree(data?.configuree !== false);

      // Une page vidée par une suppression : on recule d'une page.
      if ((data?.messages ?? []).length === 0 && pageVoulue > 0 && (data?.total ?? 0) > 0) {
        setPage(pageVoulue - 1);
        return;
      }

      setMessages(data?.messages ?? []);
      setTotal(data?.total ?? (data?.messages ?? []).length);
      setCompteurs((c) => ({ ...c, [dossierVoulu]: data?.total ?? c[dossierVoulu] }));
      if (dossierVoulu === 'reception') setNonLus(data?.nonLus ?? 0);
      setSelection(new Set());

      // UNE BOÎTE INJOIGNABLE N'EST PAS UNE BOÎTE VIDE.
      //
      // Sans ce message, une panne d'authentification s'affichait « aucun
      // message » — et on cherchait pourquoi les parents n'écrivaient plus,
      // alors que c'est la lecture qui échouait.
      if (data?.erreur) setErreur(`La boîte n'a pas pu être lue : ${data.erreur}`);
    } catch (e) {
      // PREMIÈRE VISITE, OU MOT DE PASSE À RESSAISIR : le formulaire de
      // connexion de la boîte, pas une erreur.
      if (e?.response?.status === 409) {
        setAConnecter(e.response.data ?? { code: 'a_configurer' });
        setMessages([]);
        return;
      }
      setErreur("La boîte n'a pas pu être consultée.");
      setMessages([]);
    } finally {
      setChargement(false);
      if (!compteursCharges.current) chargerCompteurs();
    }
  }, [boite, dossier, page, chargerCompteurs]);

  useEffect(() => { charger(); }, [charger]);

  const deconnecter = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Déconnecter votre boîte ? Le mot de passe enregistré sera effacé.')) return;
    try {
      await deconnecterBoite();
    } finally {
      setOuvert(null);
      charger();
    }
  };

  const changerDossier = (suivant) => {
    if (suivant === dossier) return;
    enregistrerMaintenant();
    setOuvert(null);
    setEtatBrouillon(null);
    setMessages(null);
    setPage(0);
    setDossier(suivant);
  };

  // Fermer la fenêtre de rédaction : le brouillon s'est enregistré en route,
  // et la liste se relit (un message envoyé, un brouillon de plus).
  const fermerRedaction = () => {
    setRedaction(null);
    charger();
    chargerCompteurs();
  };

  useEffect(() => {
    if (!redaction) return undefined;
    const surTouche = (e) => {
      // Échap ferme d'abord la palette d'émoticônes, pas toute la fenêtre.
      if (e.key === 'Escape' && !document.querySelector('.barre-outils-texte__palette')) fermerRedaction();
    };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redaction]);

  /** Referme le message ouvert (mobile : retour à la liste). */
  const fermerMessage = () => { enregistrerMaintenant(); setOuvert(null); setEnGrand(false); };

  const changerPage = (suivante) => {
    setPage(suivante);
  };

  /** Ouvre un message dans son dossier ; un brouillon rouvre sa réponse en cours. */
  const ouvrir = async (message) => {
    await enregistrerMaintenant();

    // UN BROUILLON D'« ÉCRIRE À UN PARENT » (17/10/2026) : pas de message
    // d'origine, il se reprend dans son formulaire.
    if (dossier === 'brouillons' && !message.messageOrigine) {
      setRedaction({ brouillon: message });
      return;
    }

    setChargementCorps(true);
    setEnvoye(null);
    setErreur(null);
    setEtatBrouillon(null);
    setImages(false);

    const depuisBrouillons = dossier === 'brouillons';
    const identifiant = depuisBrouillons ? message.messageOrigine : message.identifiant;
    const dossierDeLecture = depuisBrouillons ? 'reception' : dossier;

    try {
      const avecBrouillon = depuisBrouillons || (dossier === 'reception' && message.aUnBrouillon);
      const [lecture, brouillon] = await Promise.all([
        getMessage(identifiant, false, boite, dossierDeLecture),
        avecBrouillon ? getBrouillonPour(identifiant, boite).catch(() => null) : Promise.resolve(null),
      ]);

      setOuvert(lecture.data);
      setDossierOuvert(dossierDeLecture);
      setReponse(brouillon?.data?.texte ?? '');
      if (brouillon?.data) setEtatBrouillon({ etat: 'enregistre', heure: new Date(brouillon.data.dateModification) });

      // La liste reflète le nouvel état sans recharger toute la boîte : une
      // seconde requête IMAP pour changer une pastille serait du gaspillage.
      if (dossier === 'reception' && !message.lu) {
        setMessages((liste) =>
          liste.map((m) => (m.identifiant === message.identifiant ? { ...m, lu: true } : m)));
        setNonLus((n) => Math.max(0, n - 1));
      }
    } catch {
      setOuvert(null);
      setErreur(depuisBrouillons
        ? 'Le message auquel ce brouillon répond n’existe plus dans la boîte de réception. Vous pouvez supprimer le brouillon.'
        : "Ce message n'a pas pu être ouvert. Il a peut-être été supprimé.");
    } finally {
      setChargementCorps(false);
    }
  };

  /**
   * TÉLÉCHARGER UNE PIÈCE JOINTE (18/10/2026) : un PDF s'ouvre dans un nouvel
   * onglet, le reste s'enregistre sous son nom.
   */
  const [pieceEnCours, setPieceEnCours] = useState(null);
  const telecharger = async (piece) => {
    setPieceEnCours(piece.nomFichier);
    try {
      const { data } = await telechargerPieceJointe(ouvert.identifiant, piece.nomFichier, boite, dossierOuvert);
      const url = URL.createObjectURL(new Blob([data], { type: piece.typeMime || data.type }));
      if ((piece.typeMime || '').startsWith('application/pdf') || (piece.typeMime || '').startsWith('image/')) {
        window.open(url, '_blank', 'noopener');
      } else {
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = piece.nomFichier;
        lien.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErreur(`« ${piece.nomFichier} » n'a pas pu être téléchargé.`);
    } finally {
      setPieceEnCours(null);
    }
  };

  /** Recharge le message ouvert avec ses images, sans toucher à la réponse en cours. */
  const afficherImages = async () => {
    try {
      const { data } = await getMessage(ouvert.identifiant, true, boite, dossierOuvert);
      setOuvert(data);
      setImages(true);
    } catch {
      setErreur("Les images n'ont pas pu être chargées.");
    }
  };

  const basculerLu = async (message) => {
    const nouveau = !message.lu;

    setMessages((liste) =>
      liste.map((m) => (m.identifiant === message.identifiant ? { ...m, lu: nouveau } : m)));
    setNonLus((n) => Math.max(0, n + (nouveau ? -1 : 1)));

    try {
      await marquerMessageLu(message.identifiant, nouveau, boite, dossier);
    } catch {
      // On remet la pastille comme elle était : afficher un état qu'on n'a pas
      // réussi à enregistrer ferait croire le message traité.
      setMessages((liste) =>
        liste.map((m) => (m.identifiant === message.identifiant ? { ...m, lu: !nouveau } : m)));
      setNonLus((n) => Math.max(0, n + (nouveau ? 1 : -1)));
    }
  };

  const ecrire = (texte) => {
    setReponse(texte);

    // La confirmation du précédent envoi s'efface dès qu'on recommence à
    // écrire : « Réponse envoyée » affiché au-dessus d'un message en cours de
    // rédaction laisse croire que celui-ci est déjà parti.
    if (envoye) setEnvoye(null);

    aEnregistrer.current = {
      messageOrigine: ouvert.identifiant,
      destinataire: ouvert.deAdresse,
      sujet: objetDeReponse(ouvert.sujet),
      texte,
    };
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(enregistrerMaintenant, 1500);
  };

  const envoyer = async () => {
    if (!ouvert || !reponse.trim()) return;

    // Le brouillon en attente ne doit pas renaître après l'envoi.
    clearTimeout(minuteur.current);
    aEnregistrer.current = null;

    setEnvoi(true);
    setErreur(null);

    try {
      const { data } = await repondreMessage(ouvert.identifiant, reponse, boite);
      setEnvoye(data ?? { message: 'Réponse envoyée.' });
      setReponse('');
      setEtatBrouillon(null);
      chargerCompteurs();

      if (dossier === 'brouillons') {
        // La réponse est partie : son brouillon a disparu de la liste.
        setOuvert(null);
        charger();
      } else {
        setMessages((liste) =>
          liste.map((m) => (m.identifiant === ouvert.identifiant
            ? { ...m, repondu: true, aUnBrouillon: false }
            : m)));
      }
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

  // ------------------------------------------------------------ sélection
  const identifiantsPage = (messages ?? []).map((m) => m.identifiant);
  const toutCoche = identifiantsPage.length > 0 && identifiantsPage.every((id) => selection.has(id));

  const cocher = (id) => setSelection((avant) => {
    const apres = new Set(avant);
    if (apres.has(id)) apres.delete(id);
    else apres.add(id);
    return apres;
  });

  const toutCocher = () => setSelection(toutCoche ? new Set() : new Set(identifiantsPage));

  const supprimer = async () => {
    const ids = [...selection];
    if (ids.length === 0) return;

    const question = dossier === 'brouillons'
      ? `Supprimer définitivement ${ids.length > 1 ? `ces ${ids.length} brouillons` : 'ce brouillon'} ?`
      : `Supprimer ${ids.length > 1 ? `ces ${ids.length} messages` : 'ce message'} ? `
        + 'Ils iront dans la corbeille de la boîte, d’où le webmail LWS peut encore les récupérer.';
    // eslint-disable-next-line no-alert
    if (!window.confirm(question)) return;

    setSuppression(true);
    setErreur(null);
    try {
      await supprimerMessages(ids, boite, dossier);

      // Le message ouvert vient d'être supprimé : le panneau de lecture se vide.
      const ouvertSupprime = ouvert && messages.some((m) => selection.has(m.identifiant)
        && (dossier === 'brouillons' ? m.messageOrigine === ouvert.identifiant : m.identifiant === ouvert.identifiant));
      if (ouvertSupprime) {
        clearTimeout(minuteur.current);
        aEnregistrer.current = null;
        setOuvert(null);
        setReponse('');
        setEtatBrouillon(null);
      }

      await charger();
      chargerCompteurs();
    } catch (e) {
      setErreur(e?.response?.data?.detail
        ? `La suppression a échoué — ${e.response.data.detail}`
        : 'La suppression a échoué. Réessayez dans un instant.');
    } finally {
      setSuppression(false);
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

  if (aConnecter) {
    return (
      <ConnexionBoite
        code={aConnecter.code}
        adresse={aConnecter.adresse}
        message={aConnecter.message}
        onConnectee={() => charger()}
      />
    );
  }

  const pages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const envoyes = dossier === 'envoyes';
  const brouillons = dossier === 'brouillons';
  // Dans « Envoyés » et « Brouillons », on montre à qui le message est adressé.
  const correspondant = (m) => (envoyes || brouillons
    ? m.aNom || m.aAdresse || '—'
    : m.deNom || m.deAdresse || '—');
  const texteVide = (erreur && !brouillons && 'La boîte n’a pas pu être lue — voir le message ci-dessus.')
    || (brouillons && 'Aucun brouillon. Une réponse commencée et pas encore envoyée se range ici.')
    || (envoyes && 'Aucun message envoyé.')
    || 'Aucun message dans la boîte.';

  return (
    <div className="messagerie">
      {erreur && <div className="alert">{erreur}</div>}

      {redaction && (
        <div className="modale messagerie-ecrire">
          <div className="modale__boite messagerie-ecrire__boite" role="dialog" aria-modal="true" aria-label="Nouveau message">
            <header className="messagerie-ecrire__tete">
              <h3>{estSupport ? 'Nouveau message du support' : 'Nouveau message'}</h3>
              <button type="button" className="messagerie-grand__fermer" aria-label="Fermer" onClick={fermerRedaction}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>
            <div className="messagerie-ecrire__corps">
              <MessageParent
                parents={parents}
                brouillonAReprendre={redaction.brouillon}
                onBrouillonRepris={() => setRedaction((r) => (r ? { ...r, brouillon: null } : r))}
                onConnecterBoite={fermerRedaction}
                boite={estSupport ? 'support' : 'moi'}
              />
            </div>
          </div>
        </div>
      )}

      {/* LA BOÎTE OUVERTE, EN VALEUR — Camara, le 17/10/2026 : « plus visible ».
          Une carte : l'icône, la boîte (la sienne ou la commune) et son adresse
          en grand, les compteurs en pastilles, les actions à droite. */}
      <div className="messagerie__barre">
        <div className="messagerie__compte">
          <span className="messagerie__compte-icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="M3.5 7l8.5 6 8.5-6" />
            </svg>
          </span>
          <span className="messagerie__compte-texte">
            <span className="messagerie__compte-libelle">{estSupport ? 'Boîte commune du support' : 'Votre boîte mail'}</span>
            <strong className="messagerie__compte-adresse">{estSupport ? 'support@mimia.fr' : adresseBoite}</strong>
          </span>
          <span className="messagerie__compte-chiffres">
            <span className="messagerie__pastille">
              {total} {brouillons ? `brouillon${total > 1 ? 's' : ''}` : `message${total > 1 ? 's' : ''}`}
            </span>
            {dossier === 'reception' && nonLus > 0 && (
              <span className="messagerie__pastille messagerie__pastille--non-lus">
                {nonLus} non lu{nonLus > 1 ? 's' : ''}
              </span>
            )}
          </span>
        </div>

        <div className="messagerie__barre-actions">
          {!estSupport && adresseBoite && (
            <button type="button" className="messagerie__deconnecter" onClick={deconnecter}>Déconnecter</button>
          )}
          <button type="button" className="btn btn--compact btn--fantome" onClick={() => { charger(); chargerCompteurs(); }}>
            Rafraîchir
          </button>
        </div>
      </div>

      {/* LES TROIS DOSSIERS, SOUS L'ADRESSE (Camara, le 17/10/2026). */}
      <div className="messagerie__dossiers" role="tablist" aria-label="Dossiers de la boîte">
        {/* Aussi depuis la boîte Support (Camara, le 17/10/2026) : le message
            part alors de support@mimia.fr, signé « L'équipe Mimia ». */}
        {(
          <button type="button" className="messagerie__ecrire" onClick={() => setRedaction({ brouillon: null })}>
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Écrire un nouveau message
          </button>
        )}
        {DOSSIERS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={dossier === d.id}
            className={`messagerie__dossier${dossier === d.id ? ' est-actif' : ''}`}
            onClick={() => changerDossier(d.id)}
          >
            {d.libelle}
            <PastilleDossier dossier={d.id} compteurs={compteurs} nonLus={nonLus} />
          </button>
        ))}
      </div>

      <div className="messagerie__grille">
        {/* -------------------------------------------------------- liste */}
        <div className="messagerie__colonne">
          {messages && messages.length > 0 && (
            <div className="messagerie__selection">
              <label className="messagerie__tout">
                <input type="checkbox" checked={toutCoche} onChange={toutCocher} />
                Tout sélectionner
              </label>
              {selection.size > 0 && (
                <button
                  type="button"
                  className="messagerie__supprimer"
                  onClick={supprimer}
                  disabled={suppression}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                  </svg>
                  {suppression ? 'Suppression…' : `Supprimer (${selection.size})`}
                </button>
              )}
            </div>
          )}

          {!messages ? (
            <Loader texte="Ouverture du dossier…" />
          ) : (
            <ul className={`messagerie__liste${chargement ? ' est-en-chargement' : ''}`}>
              {messages.length === 0 && (
                <li className="messagerie__aucun">{texteVide}</li>
              )}

              {messages.map((m) => {
                const estOuvert = ouvert && (brouillons
                  ? m.messageOrigine === ouvert.identifiant
                  : dossierOuvert === dossier && m.identifiant === ouvert.identifiant);
                return (
                  <li
                    key={m.identifiant}
                    className={[
                      'messagerie__ligne',
                      m.lu ? '' : 'est-non-lu',
                      estOuvert ? 'est-ouvert' : '',
                      selection.has(m.identifiant) ? 'est-coche' : '',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      className="messagerie__case"
                      checked={selection.has(m.identifiant)}
                      onChange={() => cocher(m.identifiant)}
                      aria-label={`Sélectionner « ${m.sujet || '(sans objet)'} »`}
                    />
                    <button type="button" className="messagerie__ouvrir" onClick={() => ouvrir(m)}>
                      {/* L'INITIALE DU CORRESPONDANT (17/10/2026) : on repère qui
                          écrit d'un coup d'œil, avant de lire. */}
                      <span className="messagerie__initiale" aria-hidden="true">
                        {correspondant(m).trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="messagerie__de">
                        {(envoyes || brouillons) && <span className="messagerie__a">À : </span>}
                        {correspondant(m)}
                      </span>
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
                        {(brouillons || m.aUnBrouillon) && <span className="messagerie__badge-brouillon">brouillon</span>}
                      </span>
                    </button>

                    {dossier === 'reception' && (
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini"
                        onClick={() => basculerLu(m)}
                      >
                        {m.lu ? 'Marquer non lu' : 'Marquer lu'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <Pagination
            page={Math.min(page, pages - 1)}
            pages={pages}
            onPage={changerPage}
            chargement={chargement}
            etiquette="Pages du dossier"
          />
        </div>

        {/* ------------------------------------------------------ lecture */}
        {/* SUR MOBILE (Camara, le 17/10/2026) : le message ouvert et sa réponse
            passent en plein écran au lieu de tomber en bas de la page, sous la
            liste ; « Retour à la liste » les referme. Sur ordinateur, rien ne
            change : la lecture reste à droite. */}
        <div className={`messagerie__lecture${ouvert || chargementCorps ? ' est-en-lecture' : ''}`}>
          {(ouvert || chargementCorps) && (
            <button
              type="button"
              className="messagerie__retour"
              onClick={fermerMessage}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Retour à la liste
            </button>
          )}
          {chargementCorps && <Loader texte="Ouverture du message…" />}

          {!chargementCorps && !ouvert && (
            <p className="messagerie__invite">
              {brouillons
                ? 'Choisissez un brouillon à gauche pour reprendre votre réponse.'
                : envoyes
                  ? 'Choisissez un message à gauche pour le relire.'
                  : 'Choisissez un message à gauche pour le lire et y répondre.'}
            </p>
          )}

          {!chargementCorps && ouvert && (
            <>
              <div className="messagerie__entete">
                <h3>{ouvert.sujet || '(sans objet)'}</h3>
                <p>
                  {dossierOuvert === 'envoyes' ? (
                    <>
                      À : {ouvert.aNom ? `${ouvert.aNom} — ` : ''}
                      <a href={`mailto:${ouvert.aAdresse}`}>{ouvert.aAdresse}</a>
                    </>
                  ) : (
                    <>
                      {ouvert.deNom ? `${ouvert.deNom} — ` : ''}
                      <a href={`mailto:${ouvert.deAdresse}`}>{ouvert.deAdresse}</a>
                    </>
                  )}
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
                    onClick={afficherImages}
                  >
                    Afficher les images
                  </button>
                </div>
              )}

              {/* LE CADRE ISOLÉ, SECONDE BARRIÈRE.
                  `sandbox` vide retire TOUT : pas de script, pas d'accès à la
                  page qui contient le cadre, pas de navigation imposée. Le
                  contenu ne peut plus rien faire d'autre que s'afficher. */}
              {/* « AGRANDIR » DANS LE COIN DE L'APERÇU — Camara, le 17/10/2026 :
                  le cadre défile sur 320 px ; la fenêtre montre tout d'un coup. */}
              <div className="messagerie__apercu">
                <button type="button" className="messagerie__agrandir" onClick={() => setEnGrand(true)}>
                  <span aria-hidden="true">⤢</span> Agrandir
                </button>
                {ouvert.html ? (
                  <iframe
                    title="Contenu du message"
                    className="messagerie__corps"
                    sandbox=""
                    srcDoc={pourLecture(ouvert.html)}
                  />
                ) : (
                  <pre className="messagerie__corps-texte">{ouvert.texte || '(message vide)'}</pre>
                )}
              </div>

              {enGrand && (
                <div
                  className="modale messagerie-grand"
                  onMouseDown={(e) => { if (e.target === e.currentTarget) setEnGrand(false); }}
                >
                  <div className="modale__boite messagerie-grand__boite" role="dialog" aria-modal="true" aria-label={ouvert.sujet || 'Le message'}>
                    <header className="messagerie-grand__tete">
                      <div>
                        <h3>{ouvert.sujet || '(sans objet)'}</h3>
                        <p>
                          {dossierOuvert === 'envoyes'
                            ? `À : ${ouvert.aNom ? `${ouvert.aNom} — ` : ''}${ouvert.aAdresse ?? ''}`
                            : `${ouvert.deNom ? `${ouvert.deNom} — ` : ''}${ouvert.deAdresse ?? ''}`}
                          {' · '}
                          {new Date(ouvert.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {ouvert.html && (
                        <div className="messagerie-grand__zoom" role="group" aria-label="Taille de l’aperçu">
                          <button type="button" onClick={() => changerZoom(-1)} disabled={zoom === ZOOMS[0]} aria-label="Réduire">−</button>
                          <span>{zoom} %</span>
                          <button type="button" onClick={() => changerZoom(1)} disabled={zoom === ZOOMS[ZOOMS.length - 1]} aria-label="Agrandir">+</button>
                        </div>
                      )}
                      <button type="button" className="messagerie-grand__fermer" aria-label="Fermer" onClick={() => setEnGrand(false)}>
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
                          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                      </button>
                    </header>
                    {/* Le même cadre isolé (`sandbox` vide), à toute la hauteur. */}
                    {ouvert.html ? (
                      <iframe
                        title="Le message en grand"
                        className="messagerie-grand__corps"
                        sandbox=""
                        srcDoc={pourLecture(ouvert.html, zoom)}
                      />
                    ) : (
                      <pre className="messagerie__corps-texte messagerie-grand__texte">{ouvert.texte || '(message vide)'}</pre>
                    )}
                    {/* FERMER, TOUJOURS À PORTÉE DU POUCE — Camara, le 17/10/2026 :
                        sur mobile, une barre fixée en bas de la fenêtre ; le
                        courriel défile au-dessus sans jamais la recouvrir. */}
                    <div className="messagerie-grand__pied">
                      <button type="button" className="messagerie-grand__fermer-bas" onClick={() => setEnGrand(false)}>
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
                          stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                          <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                        Fermer le message
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {ouvert.piecesJointes?.length > 0 && (
                <div className="messagerie__pieces">
                  <strong>Pièces jointes</strong>
                  <ul>
                    {ouvert.piecesJointes.map((p) => (
                      <li key={p.nomFichier}>
                        <button
                          type="button"
                          className="messagerie__piece"
                          onClick={() => telecharger(p)}
                          disabled={pieceEnCours === p.nomFichier}
                        >
                          <span aria-hidden="true">📎</span>
                          <span className="messagerie__piece-nom">{p.nomFichier}</span>
                          {p.taille > 0 && (
                            <span className="messagerie__piece-taille">
                              {p.taille < 1024 * 1024
                                ? `${Math.max(1, Math.round(p.taille / 1024))} Ko`
                                : `${(p.taille / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`}
                            </span>
                          )}
                          <span className="messagerie__piece-action">
                            {pieceEnCours === p.nomFichier ? 'Ouverture…' : 'Ouvrir'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ---------------------------------------------------- réponse
                  On répond aux messages reçus ; un message envoyé se relit. */}
              {dossierOuvert === 'reception' && (
                <div className="messagerie__reponse">
                  {/* LA SALUTATION EST AJOUTÉE TOUTE SEULE (Camara, le 18/10/2026) :
                      inutile de commencer par « Bonjour » — dit AVANT le champ, en orange. */}
                  <span className="messagerie__info-salutation">
                    Inutile d’écrire « Bonjour » : la formule de salutation, avec le nom de la personne,
                    est ajoutée automatiquement en haut du message.
                  </span>
                  <label htmlFor="msg-reponse">Votre réponse</label>
                  <textarea
                    id="msg-reponse"
                    rows={8}
                    value={reponse}
                    onChange={(e) => ecrire(e.target.value)}
                    onBlur={enregistrerMaintenant}
                    placeholder={'Votre message…\n\nUne ligne vide sépare deux paragraphes.'}
                  />


                  <span className="champ__aide">
                    {estSupport ? (
                      <>
                        Elle partira de <strong>support@mimia.fr</strong>, mise en page aux couleurs du
                        site, signée « L’équipe Mimia », et rattachée à ce fil de discussion.
                      </>
                    ) : (
                      <>
                        Elle partira de <strong>{adresseBoite ?? 'votre adresse'}</strong>, mise en page
                        aux couleurs du site, avec votre signature, et rattachée à ce fil de discussion.
                      </>
                    )}
                    {' '}Tant qu’elle n’est pas envoyée, elle est gardée dans « Brouillons ».
                    {ouvert.repondreA && (
                      <>
                        {' '}<strong>Elle ira à {ouvert.repondreA}</strong>, l’adresse de réponse indiquée par
                        l’expéditeur.
                      </>
                    )}
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

                    {!envoye && etatBrouillon && (
                      <span className={`messagerie__etat-brouillon${etatBrouillon.etat === 'erreur' ? ' est-en-erreur' : ''}`} role="status">
                        {etatBrouillon.etat === 'enregistrement' && 'Enregistrement du brouillon…'}
                        {etatBrouillon.etat === 'enregistre'
                          && `Brouillon enregistré à ${etatBrouillon.heure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                        {etatBrouillon.etat === 'erreur' && 'Le brouillon n’a pas pu être enregistré.'}
                      </span>
                    )}

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
              )}
              {/* FERMER LE MESSAGE, TOUJOURS À PORTÉE DU POUCE — Camara, le
                  17/10/2026 : sur mobile, une barre collée au bas de l'écran de
                  lecture, visible pendant qu'on fait défiler le courriel et la
                  réponse. Masquée sur ordinateur. */}
              <div className="messagerie__fermer-mobile">
                <button type="button" onClick={fermerMessage}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
                    stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  Fermer le message
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
