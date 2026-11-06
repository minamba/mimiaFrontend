/**
 * Les libellés et les dates des jeux de tests : les mêmes à l'écran et dans le PDF.
 * Voir `JeuxTestsAdmin` et `JeuTestPdf`.
 */
export const SECTIONS = [
  { code: 'elementaire', libelle: 'Élémentaire', cycle: 'Primaire' },
  { code: 'college', libelle: 'Collège', cycle: 'College' },
  { code: 'lycee', libelle: 'Lycée', cycle: 'Lycee' },
];

export const STATUTS_LIGNE = [
  { code: 'a_tester', libelle: 'À tester' },
  { code: 'en_cours', libelle: 'En cours de test' },
  { code: 'ok', libelle: 'OK' },
  { code: 'ko', libelle: 'KO' },
];

export const STATUTS_JEU = {
  non_demarre: 'Non démarré',
  en_cours: 'En cours',
  ok: 'OK',
};

export const libelleSection = (code) => SECTIONS.find((s) => s.code === code)?.libelle ?? code;

export const libelleStatut = (code) => STATUTS_LIGNE.find((s) => s.code === code)?.libelle ?? code;

export const dateLisible = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');

/** « 2026-11-04… » lu à la main : un jour choisi au calendrier ne doit pas glisser avec le fuseau. */
export const jourLisible = (iso) => {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
};

export const lignesDuTest = (nombre) => `${nombre} ligne${nombre > 1 ? 's' : ''}`;
