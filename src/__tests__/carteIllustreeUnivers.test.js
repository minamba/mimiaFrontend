/**
 * LES DÉCORS DE « MA CARTE », POUR TOUTES LES MATIÈRES — Camara, le 15/11/2026 : les 16 univers générés
 * (assets/carte-generees) branchés à côté des 7 de la maquette. La progression ne donne que le libellé : chaque
 * libellé de la base doit trouver son univers (sauf l'orientation, qui n'a pas de notions).
 */
import { decorDeMatiere } from '../lib/carteIllustree';

const univers = (libelle) => {
  const d = decorDeMatiere(libelle);
  if (!d) return null;
  return String(d.decor).replace(/^.*\//, '').replace(/\.webp$/, '').replace(/^rangee-/, '');
};

test.each([
  ['Mathématiques', 'maths'],
  ['Français', 'francais'],
  ['Histoire-Géographie', 'histoire_geo'],
  ['Histoire-géographie, géopolitique et sciences politiques', 'histoire_geo'],
  ['Anglais', 'anglais'],
  ['LLCER anglais, monde contemporain (AMC)', 'anglais'],
  ['Espagnol', 'espagnol'],
  ['Physique-Chimie', 'physique_chimie'],
  ['Physique-chimie et mathématiques', 'physique_chimie'],
  ['Sciences physiques et chimiques en laboratoire', 'physique_chimie'],
  ['SVT', 'svt'],
  ['Biochimie, biologie et biotechnologies', 'svt'],
  ['Sciences et technologie', 'sciences'],
  ['Philosophie', 'philosophie'],
  ['Humanités, littérature et philosophie', 'philosophie'],
  ['Sciences économiques et sociales', 'economie'],
  ['Sciences de gestion et numérique', 'economie'],
  ['Management', 'economie'],
  ['Droit et économie', 'economie'],
  ['Économie-droit', 'economie'],
  ['Économie-gestion', 'economie'],
  ['Sciences et techniques sanitaires et sociales', 'sante'],
  ['Prévention-santé-environnement', 'sante'],
  ['Numérique et sciences informatiques', 'informatique'],
  ["Sciences de l'ingénieur", 'ingenierie'],
  ['Ingénierie, innovation et développement durable', 'science_ingenierie'],
  ['Technologie', 'technologie'],
  ['Éducation physique, pratiques et culture sportives', 'sport'],
  ['Arts plastiques', 'arts'],
  ['Histoire des arts', 'arts'],
  ['Musique', 'arts'],
  ['Danse', 'arts'],
  ['Cinéma-audiovisuel', 'cinema'],
  ['Théâtre', 'theatre'],
  ['Arts du cirque', 'cirque'],
  ["Littérature, langues et cultures de l'Antiquité - latin", 'antiquite'],
  ["Littérature, langues et cultures de l'Antiquité - grec", 'antiquite'],
  ['Allemand', 'allemand'],
  ['Italien', 'italien'],
  ['Chinois', 'chinois'],
  ['Arabe', 'arabe'],
])('%s → %s', (libelle, attendu) => {
  expect(univers(libelle)).toBe(attendu);
});

// Depuis le 16/11/2026, toutes les matières (les 7 de la première maquette comprises) sont des panoramas.
test('toutes les matières couvrent la rangée d’un panorama', () => {
  expect(decorDeMatiere('Italien').plein).toBe(true);
  expect(decorDeMatiere('Mathématiques').plein).toBe(true);
});
