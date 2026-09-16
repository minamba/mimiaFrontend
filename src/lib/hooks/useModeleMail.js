import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ajouterPieceModele,
  creerModeleMail,
  getModeleMail,
  modifierModeleMail,
  retirerPieceModele,
} from '../api/adminApi';
import { useCompositionMessage } from './useCompositionMessage';

/** Le temps de pause après la dernière frappe avant d'enregistrer. */
export const DELAI_ENREGISTREMENT = 800;

const versPiece = (p) => ({ id: p.id, name: p.nomFichier, size: p.taille, type: p.typeMime });

const CHAMPS = ['nom', 'description', 'sujet', 'titre', 'texte'];

const identiques = (a, b) => Boolean(a && b) && CHAMPS.every((champ) => a[champ] === b[champ]);

/**
 * Un courriel en cours d'écriture, éventuellement adossé à un template.
 *
 * UN TEMPLATE CHOISI S'ENREGISTRE TOUT SEUL — Camara, le 15/09/2026.
 * ------------------------------------------------------------------
 * Pas de bouton « Enregistrer » à ne pas oublier : chaque pause de frappe
 * enregistre le nom, la description, l'objet, le titre et le message. Les
 * pièces, elles, partent au moment où on les ajoute ou les retire.
 *
 * RIEN NE PART SANS QUE CE QUI EST TAPÉ SOIT ENREGISTRÉ. L'aperçu, l'envoi, le
 * retrait d'une pièce et le changement de template attendent `enregistrer()` :
 * sans cela, l'aperçu montrerait la version d'il y a une seconde, et l'envoi
 * partirait sans la dernière phrase.
 *
 * SANS TEMPLATE, rien n'est enregistré : le message reste un brouillon en
 * mémoire, et les fichiers restent des `File` jusqu'à `creer()`.
 */
export function useModeleMail() {
  const composition = useCompositionMessage();
  const { texte, images, documents, charger, vider } = composition;

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [sujet, setSujet] = useState('');
  const [titre, setTitre] = useState('');
  const [modele, setModele] = useState(null);

  // aucun | charge | modifie | enregistrement | enregistre | erreur
  const [etat, setEtat] = useState('aucun');
  const [enregistreA, setEnregistreA] = useState(null);

  // Incrémentée à chaque écriture : la liste des templates se relit dessus.
  const [revision, setRevision] = useState(0);
  const [erreurPiece, setErreurPiece] = useState(null);

  const modeleId = modele?.id ?? null;

  // Les dernières valeurs, lisibles depuis un minuteur sans fermer dessus.
  const valeurs = useRef({ nom, description, sujet, titre, texte });
  valeurs.current = { nom, description, sujet, titre, texte };

  const idCourant = useRef(modeleId);
  idCourant.current = modeleId;

  const dernierEnregistre = useRef(null);
  const minuteur = useRef(null);
  const enCours = useRef(null);

  const enregistrer = useCallback(async () => {
    clearTimeout(minuteur.current);

    const id = idCourant.current;
    if (!id) return;

    // UNE ÉCRITURE À LA FOIS : deux PUT croisés pourraient arriver dans le
    // désordre, et le plus ancien écraserait le plus récent.
    if (enCours.current) await enCours.current;

    const aEnregistrer = valeurs.current;
    if (identiques(aEnregistrer, dernierEnregistre.current)) return;

    setEtat('enregistrement');

    const promesse = modifierModeleMail(id, aEnregistrer)
      .then(({ data }) => {
        if (idCourant.current !== id) return;

        dernierEnregistre.current = aEnregistrer;
        setEnregistreA(data?.dateModification ?? new Date().toISOString());

        // Une frappe a pu arriver pendant l'appel : son propre minuteur
        // l'enregistrera, l'état le dit en attendant.
        setEtat(identiques(valeurs.current, aEnregistrer) ? 'enregistre' : 'modifie');
        setRevision((r) => r + 1);
      })
      .catch(() => {
        if (idCourant.current === id) setEtat('erreur');
      })
      .finally(() => {
        enCours.current = null;
      });

    enCours.current = promesse;
    await promesse;
  }, []);

  // La pause de frappe. Le minuteur n'est PAS annulé au démontage de l'effet :
  // c'est l'effet de démontage du composant, plus bas, qui s'en charge.
  useEffect(() => {
    if (!modeleId) return;
    if (identiques(valeurs.current, dernierEnregistre.current)) return;

    setEtat('modifie');
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(enregistrer, DELAI_ENREGISTREMENT);
  }, [modeleId, nom, description, sujet, titre, texte, enregistrer]);

  // Quitter l'onglet « Mails » pendant la pause ne perd pas la dernière phrase.
  useEffect(() => () => {
    clearTimeout(minuteur.current);

    if (idCourant.current && !identiques(valeurs.current, dernierEnregistre.current)) {
      modifierModeleMail(idCourant.current, valeurs.current).catch(() => {});
    }
  }, []);

  // Fermer la page, elle, ne peut pas attendre une requête : le navigateur
  // prévient qu'il reste quelque chose à enregistrer.
  useEffect(() => {
    if (etat !== 'modifie' && etat !== 'enregistrement') return undefined;

    const avantDepart = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', avantDepart);
    return () => window.removeEventListener('beforeunload', avantDepart);
  }, [etat]);

  /** Remplit le formulaire avec un template tel que le serveur l'a rendu. */
  const appliquer = (detail) => {
    // Posé AVANT les états : l'effet de pause compare à cette référence, et
    // ne doit pas prendre le chargement pour une modification.
    dernierEnregistre.current = {
      nom: detail.nom ?? '',
      description: detail.description ?? '',
      sujet: detail.sujet ?? '',
      titre: detail.titre ?? '',
      texte: detail.texte ?? '',
    };

    setNom(detail.nom ?? '');
    setDescription(detail.description ?? '');
    setSujet(detail.sujet ?? '');
    setTitre(detail.titre ?? '');
    charger({
      texte: detail.texte ?? '',
      images: (detail.images ?? []).map(versPiece),
      documents: (detail.documents ?? []).map(versPiece),
    });
    setModele(detail);
    setEnregistreA(detail.dateModification ?? null);
  };

  const selectionner = async (id) => {
    if (id === idCourant.current) return;

    await enregistrer();

    const { data } = await getModeleMail(id);
    appliquer(data);
    setEtat('charge');
    setErreurPiece(null);
  };

  /**
   * « Nouveau message » : on quitte le template, le formulaire se vide.
   * `sansEnregistrer` quand le template vient d'être supprimé — l'écrire
   * encore finirait sur une erreur.
   */
  const deselectionner = async ({ sansEnregistrer = false } = {}) => {
    if (!sansEnregistrer) await enregistrer();

    clearTimeout(minuteur.current);
    dernierEnregistre.current = null;
    setModele(null);
    setNom('');
    setDescription('');
    setSujet('');
    setTitre('');
    vider();
    setEtat('aucun');
    setEnregistreA(null);
    setErreurPiece(null);
  };

  /**
   * Enregistre le message comme nouveau template, et le choisit. Rend son id.
   * `nature` : « Diffusion » par défaut, « Automatique » pour un courriel
   * automatique créé depuis l'écran.
   */
  const creer = async ({ nature = 'Diffusion' } = {}) => {
    const { data } = await creerModeleMail({
      nature, nom, description, sujet, titre, texte, images, documents,
    });

    appliquer(data);
    setEtat('enregistre');
    setRevision((r) => r + 1);

    return data.id;
  };

  const ajouterPieces = async (genre, fichiers) => {
    setErreurPiece(null);

    const setListe = genre === 'Image' ? composition.setImages : composition.setDocuments;
    const id = idCourant.current;

    if (!id) {
      setListe((liste) => [...liste, ...fichiers]);
      return;
    }

    // Une par une, dans l'ordre choisi : c'est l'ordre qui fait les rangs,
    // donc les marqueurs `[image:N]`.
    for (const fichier of fichiers) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await ajouterPieceModele(id, genre, fichier);
        setListe((liste) => [...liste, versPiece(data)]);
        setRevision((r) => r + 1);
      } catch (e) {
        setErreurPiece(
          e?.response?.data?.message ?? `« ${fichier.name} » n’a pas pu être ajouté.`,
        );
        break;
      }
    }
  };

  const retirerPiece = async (genre, index) => {
    setErreurPiece(null);

    const id = idCourant.current;

    if (!id) {
      if (genre === 'Image') composition.retirerImage(index);
      else composition.retirerDocument(index);
      return;
    }

    const piece = (genre === 'Image' ? images : documents)[index];
    if (!piece?.id) return;

    // Le texte tapé d'abord : le serveur renvoie le texte renuméroté, qui
    // doit contenir la dernière phrase.
    await enregistrer();

    try {
      const { data } = await retirerPieceModele(id, piece.id);
      appliquer(data);
      setEtat('enregistre');
      setRevision((r) => r + 1);
    } catch {
      setErreurPiece('La pièce n’a pas pu être retirée.');
    }
  };

  /**
   * La programmation a changé (courriel automatique) : on reprend ses champs,
   * JAMAIS le texte — il peut y avoir une frappe pas encore enregistrée, que le
   * texte rendu par le serveur écraserait.
   */
  const mettreAJourModele = (detail) => {
    const {
      actif, frequence, heure, jourSemaine, jourMois,
      prochaineExecution, dernierEnvoiLe, dernierResultat,
    } = detail;

    setModele((m) => (m && m.id === detail.id
      ? {
        ...m, actif, frequence, heure, jourSemaine, jourMois,
        prochaineExecution, dernierEnvoiLe, dernierResultat,
      }
      : m));
    setRevision((r) => r + 1);
  };

  return {
    ...composition,
    mettreAJourModele,
    nom, setNom,
    description, setDescription,
    sujet, setSujet,
    titre, setTitre,
    modele,
    etat,
    enregistreA,
    revision,
    erreurPiece,
    enregistrer,
    selectionner,
    deselectionner,
    creer,
    ajouterPieces,
    retirerPiece,
  };
}
