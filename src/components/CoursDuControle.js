import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ajouterCoursControle, creerScanCoursControle, etatScanCoursControle,
  getCoursControle, supprimerCoursControle,
} from '../lib/api/elevesApi';
import { reduire, TYPES_ACCEPTES } from './PieceJointe';
import ScanMobileModale from './ScanMobileModale';
import { Icone } from './CopieControle';

/** Au plus six documents par contrôle — le même plafond que le serveur. */
export const DOCUMENTS_MAX = 6;

/** Le temps entre deux relevés, tant qu'un document est en cours de lecture. */
const INTERVALLE_LECTURE = 3000;

/**
 * « TON COURS » — Camara, le 26/09/2026, sur la remontée d'un parent : le
 * professeur doit préparer le contrôle en suivant la leçon de l'élève, puis
 * compléter avec les notions du programme qui y manquent. Sans cours, rien ne
 * change : il prépare avec le programme officiel, comme avant.
 *
 * TOUS LES MOYENS DES COURS ORDINAIRES : importer un fichier (photo ou PDF),
 * prendre une photo sur téléphone, scanner avec le téléphone depuis
 * l'ordinateur.
 *
 * DEUX RÉGIMES
 * ------------
 *   - LE CONTRÔLE EXISTE (`controleId`) : chaque fichier part tout de suite,
 *     la liste vient du serveur. Modification et fiche du contrôle.
 *   - PAS ENCORE (création) : les fichiers attendent dans `enAttente`, et le
 *     formulaire les envoie juste après avoir créé le contrôle. Le scan par
 *     téléphone, lui, a besoin du contrôle : `onBesoinDuControle` le crée
 *     d'abord, puis le QR code s'ouvre.
 */
export default function CoursDuControle({
  eleveId, controleId = null, enAttente = [], onEnAttente = null, onBesoinDuControle = null,
  disabled = false, onOccupe = null,
}) {
  const [documents, setDocuments] = useState([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [scanOuvert, setScanOuvert] = useState(false);

  // UN TÉLÉPHONE PHOTOGRAPHIE AVEC SON APPAREIL NATIF — `capture` l'ouvre
  // directement. Sur ordinateur, on passe par le QR code. Même règle que la
  // séance (`scannerNatif` dans Chat.js).
  const telephone = useMemo(
    () => typeof window !== 'undefined'
      && Boolean(window.matchMedia?.('(pointer: coarse)')?.matches),
    [],
  );

  const recharger = useCallback(async () => {
    if (!controleId) return;
    try {
      const { data } = await getCoursControle(eleveId, controleId);
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      // Une liste qui ne se charge pas n'empêche pas d'en ajouter.
    }
  }, [eleveId, controleId]);

  useEffect(() => { recharger(); }, [recharger]);

  // LE FORMULAIRE ATTEND QU'UN FICHIER SOIT PRÊT. Une photo est réduite avant
  // de partir — quelques centaines de millisecondes : l'enfant qui choisit
  // sa photo puis touche aussitôt « Ajouter le contrôle » ne doit pas voir
  // le contrôle partir sans son cours.
  useEffect(() => { onOccupe?.(envoi); }, [envoi, onOccupe]);

  // « EN LECTURE… » PUIS « LU » : le professeur lit chaque page en quelques
  // secondes. Tant qu'une page ne l'est pas, on relit la liste — l'enfant voit
  // que son cours est bien arrivé jusqu'à son professeur.
  const enLecture = documents.some((d) => !d.lu);

  useEffect(() => {
    if (!enLecture) return undefined;
    const minuteur = setInterval(recharger, INTERVALLE_LECTURE);
    return () => clearInterval(minuteur);
  }, [enLecture, recharger]);

  const nombre = controleId ? documents.length : enAttente.length;
  const plein = nombre >= DOCUMENTS_MAX;

  const ajouter = async (fichiers) => {
    const place = DOCUMENTS_MAX - nombre;
    const retenus = Array.from(fichiers ?? []).slice(0, Math.max(0, place));
    if (retenus.length === 0) return;

    setErreur(null);
    setEnvoi(true);

    // Réduites ici, comme en séance : c'est le téléphone de l'enfant, sur le
    // réseau de son collège, qui est lent — pas le serveur.
    const reduits = await Promise.all(retenus.map((f) => reduire(f).catch(() => f)));

    if (!controleId) {
      onEnAttente?.([...enAttente, ...reduits]);
      setEnvoi(false);
      return;
    }

    try {
      for (const fichier of reduits) {
        // eslint-disable-next-line no-await-in-loop
        const { data } = await ajouterCoursControle(eleveId, controleId, fichier);
        setDocuments((liste) => [...liste, data]);
      }
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Ce document n’a pas pu être envoyé. Tu peux réessayer ?');
    } finally {
      setEnvoi(false);
    }
  };

  const retirer = async (element, index) => {
    setErreur(null);

    if (!controleId) {
      onEnAttente?.(enAttente.filter((_, i) => i !== index));
      return;
    }

    try {
      await supprimerCoursControle(eleveId, controleId, element.id);
      setDocuments((liste) => liste.filter((d) => d.id !== element.id));
    } catch {
      setErreur('Ce document n’a pas pu être retiré. Tu peux réessayer ?');
    }
  };

  const scanner = async () => {
    setErreur(null);

    if (controleId) {
      setScanOuvert(true);
      return;
    }

    // Le QR code a besoin du contrôle : le formulaire le crée d'abord.
    const id = await onBesoinDuControle?.();
    if (id) setScanOuvert(true);
  };

  const creerScan = useCallback(
    () => creerScanCoursControle(eleveId, controleId),
    [eleveId, controleId],
  );

  const lireScan = useCallback(
    (jeton) => etatScanCoursControle(eleveId, controleId, jeton),
    [eleveId, controleId],
  );

  const recu = useCallback((document) => {
    setDocuments((liste) => (liste.some((d) => d.id === document.id) ? liste : [...liste, document]));
  }, []);

  const bloque = disabled || envoi || plein;
  const scanPossible = !telephone && (controleId || onBesoinDuControle);

  const elements = controleId
    ? documents.map((d) => ({ cle: `d${d.id}`, nom: d.nomFichier, etat: d.lu ? 'Lu par ton professeur' : 'En lecture…', element: d }))
    : enAttente.map((f, i) => ({ cle: `f${i}-${f.name}`, nom: f.name, etat: 'Sera envoyé avec le contrôle', element: f }));

  return (
    <div className="cours-controle" role="group" aria-labelledby="cours-controle-titre">
      <p className="cours-controle__titre" id="cours-controle-titre">
        Ton cours <span className="champ__option">(facultatif)</span>
      </p>
      <p className="champ__aide">
        Ton professeur préparera le contrôle en suivant ta leçon, puis ajoutera ce qui manque
        du programme. Sans cours, il suit le programme officiel.
      </p>

      {elements.length > 0 && (
        <ul className="cours-controle__liste">
          {elements.map(({ cle, nom, etat, element }, index) => (
            <li key={cle} className="cours-controle__document">
              <Icone />
              <span className="cours-controle__nom">{nom}</span>
              <span className={`cours-controle__etat${etat === 'Lu par ton professeur' ? ' est-lu' : ''}`}>
                {etat}
              </span>
              <button
                type="button"
                className="cours-controle__retirer"
                aria-label={`Retirer ${nom}`}
                disabled={disabled || envoi}
                onClick={() => retirer(element, index)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}

      {plein ? (
        <p className="champ__aide">{DOCUMENTS_MAX} documents au plus : retires-en un pour en ajouter un autre.</p>
      ) : (
        <div className="cours-controle__boutons">
          <label className={`btn btn--compact btn--fantome cours-controle__bouton${bloque ? ' est-desactive' : ''}`}>
            <Icone /> {envoi ? 'Envoi…' : 'Importer mon cours'}
            <input
              type="file"
              hidden
              multiple
              disabled={bloque}
              accept={TYPES_ACCEPTES}
              onChange={(e) => {
                const choisis = e.target.files;
                ajouter(choisis);
                e.target.value = '';
              }}
            />
          </label>

          {telephone ? (
            <label className={`btn btn--compact btn--fantome cours-controle__bouton${bloque ? ' est-desactive' : ''}`}>
              <Icone scan /> Prendre en photo
              <input
                type="file"
                hidden
                disabled={bloque}
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const choisis = e.target.files;
                  ajouter(choisis);
                  e.target.value = '';
                }}
              />
            </label>
          ) : scanPossible && (
            <button
              type="button"
              className="btn btn--compact btn--fantome cours-controle__bouton"
              disabled={bloque}
              onClick={scanner}
            >
              <Icone scan /> Scanner avec mon téléphone
            </button>
          )}
        </div>
      )}

      {scanOuvert && controleId && (
        <ScanMobileModale
          creer={creerScan}
          lire={lireScan}
          onRecu={recu}
          onTermine={recharger}
          onFermer={() => { setScanOuvert(false); recharger(); }}
        />
      )}
    </div>
  );
}
