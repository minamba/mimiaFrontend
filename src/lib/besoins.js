import { createContext, useContext, useEffect } from 'react';
import { ReactReduxContext } from 'react-redux';
import { sessionEleve } from './storage/sessionEleve';
import { useBesoinsParticuliers } from './storage/modeTest';

/**
 * LES BESOINS PARTICULIERS — dyslexie, dyscalculie, TDAH (Camara, le
 * 11/10/2026). Le parent les coche dans le profil de son enfant ; sa coche vaut
 * accord. Voir `BesoinsParticuliers.cs` côté serveur.
 *
 * CE QUE L'ÉCRAN EN FAIT, SEULEMENT SI LE MODULE EST ALLUMÉ ET QUE LE PARENT
 * N'A PAS COUPÉ L'ÉCRAN ADAPTÉ :
 *   - dyslexie → LECTURE AÉRÉE : texte un peu plus grand, interlignage et
 *     espacements augmentés, alignement à gauche (tableau, bulles, fiches,
 *     consignes des jeux). Pas de police « spéciale » : aucune n'a fait ses
 *     preuves mieux qu'une police ordinaire bien espacée.
 *   - TDAH → CALME : le mode tranquille des jeux et la séance courte sont
 *     marqués « conseillé pour toi », et le décor s'apaise.
 *
 * L'ENFANT NE REÇOIT JAMAIS LES CASES : sa session ne porte que l'affichage
 * qui en découle (`affichage`), calculé par le serveur.
 */
// `effet` : ce que le parent verra changer, dit en une ligne sur la tuile.
export const BESOINS = [
  {
    code: 'DYSLEXIE',
    libelle: 'Dyslexie ou dysorthographie',
    effet: 'L’oral d’abord, l’orthographe ne compte pas hors du français, texte plus aéré.',
  },
  {
    code: 'DYSCALCULIE',
    libelle: 'Dyscalculie',
    effet: 'On montre avant de calculer, une étape à la fois, au tableau.',
  },
  {
    code: 'TDAH',
    libelle: 'TDAH (trouble de l’attention)',
    effet: 'Une consigne à la fois, messages courts, pauses et séances courtes.',
  },
];

const AUCUN = { lectureAeree: false, calme: false };

/** L'affichage d'un élève vu par son parent : ses cases, son choix d'écran, le module. */
export function affichageDe(eleve, moduleActif) {
  if (!moduleActif || !eleve || eleve.ecranAdapte === false) return AUCUN;
  const besoins = eleve.besoinsParticuliers ?? [];
  return { lectureAeree: besoins.includes('DYSLEXIE'), calme: besoins.includes('TDAH') };
}

/**
 * L'AFFICHAGE DE L'ÉLÈVE DE LA PAGE, et sa pose sur la page entière tant
 * qu'elle est ouverte : `data-lecture="aeree"` et `data-calme` sur <html>, que
 * la feuille de style lit. Le parent qui regarde la séance de son enfant la voit
 * comme lui.
 */
// Quand react-redux est simulé sans son contexte (certains tests).
const SANS_STORE = createContext(null);

export function useAffichageEleve(eleveId) {
  const moduleActif = useBesoinsParticuliers();
  // LE STORE S'IL EXISTE, SANS L'EXIGER : certaines pages (les contrôles)
  // vivent sans lui. La liste des enfants est chargée avant d'arriver ici.
  const contexte = useContext(ReactReduxContext ?? SANS_STORE);
  const liste = contexte?.store?.getState?.()?.eleves?.liste ?? [];
  const enfant = sessionEleve();

  const sien = enfant && String(enfant.eleveId) === String(eleveId);
  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const affichage = sien
    ? { ...AUCUN, ...(enfant.affichage ?? {}) }
    : affichageDe(eleve, moduleActif);

  const { lectureAeree, calme } = affichage;

  useEffect(() => {
    const racine = document.documentElement;
    if (lectureAeree) racine.dataset.lecture = 'aeree';
    if (calme) racine.dataset.calme = 'oui';
    return () => {
      delete racine.dataset.lecture;
      delete racine.dataset.calme;
    };
  }, [lectureAeree, calme]);

  return affichage;
}

/** Le calme est-il posé sur la page ? Pour les fenêtres qui n'ont pas l'élève sous la main. */
export const pageCalme = () => document.documentElement.dataset.calme === 'oui';
