/**
 * LA BALISE [CONTROLE_NOTIONS] : ni lue ni affichée, comme
 * [CONTROLE_PROGRAMME] et [FICHE].
 *
 * C'est le bloc le plus facile à oublier dans `ardoise.js` — il est arrivé
 * après coup, et un bloc non masqué s'affiche en toutes lettres sous les yeux
 * de l'enfant au milieu de la phrase de son professeur.
 */

import { decouper, texteParle } from '../lib/storage/ardoise';

const message = [
  "On a bien avancé sur les fractions aujourd'hui !",
  '[CONTROLE_NOTIONS]',
  'controle: 42',
  'sujet: les fractions, addition et simplification',
  'notions: simplifier une fraction ; comparer deux fractions',
  '[/CONTROLE_NOTIONS]',
].join('\n');

test("le bloc ne s'affiche pas dans la bulle de l'élève", () => {
  const affiche = decouper(message).map((s) => s.contenu).join(' ');

  expect(affiche).not.toMatch(/CONTROLE_NOTIONS/);
  expect(affiche).not.toMatch(/simplifier une fraction/);
  expect(affiche).toMatch(/bien avancé/);
});

test("le bloc n'est jamais prononcé par la voix", () => {
  const parle = texteParle(message);

  expect(parle).not.toMatch(/CONTROLE_NOTIONS/);
  expect(parle).not.toMatch(/comparer deux fractions/);
  expect(parle).toMatch(/bien avancé/);
});

test('le numéro du contrôle ne fuit pas à l’affichage', () => {
  const affiche = decouper(message).map((s) => s.contenu).join(' ');

  expect(affiche).not.toMatch(/42/);
});

/**
 * LE SUJET CORRIGÉ NE DOIT PAS FUIR NON PLUS. Le professeur reformule le
 * sujet d'un contrôle mal déclaré dans ce bloc — « contrôle de maths » devient
 * « les fractions » — et cette reformulation part en base, pas à l'écran.
 */
test('le sujet reformulé reste invisible dans la bulle', () => {
  const affiche = decouper(message).map((s) => s.contenu).join(' ');
  const parle = texteParle(message);

  expect(affiche).not.toMatch(/addition et simplification/);
  expect(parle).not.toMatch(/addition et simplification/);
});

/**
 * Le bloc de résultat, posé après le contrôle. LA NOTE NE DOIT SURTOUT PAS
 * FUIR À L'ÉCRAN par ce chemin-là : c'est le professeur qui l'annonce avec ses
 * mots, pas un bloc technique qui s'affiche brut au milieu de sa phrase.
 */
const resultat = [
  'Alors, raconte-moi comment ça s’est passé !',
  '[CONTROLE_RESULTAT]',
  'controle: 42',
  'note: 14',
  'ressenti: Plus facile que prévu, sauf la dernière question.',
  'ratees: simplifier une fraction',
  '[/CONTROLE_RESULTAT]',
].join('\n');

test('le bloc de résultat ne s’affiche pas et ne se prononce pas', () => {
  const affiche = decouper(resultat).map((s) => s.contenu).join(' ');
  const parle = texteParle(resultat);

  expect(affiche).not.toMatch(/CONTROLE_RESULTAT/);
  expect(affiche).not.toMatch(/ressenti/);
  expect(affiche).toMatch(/comment ça s’est passé/);

  expect(parle).not.toMatch(/CONTROLE_RESULTAT/);
  expect(parle).not.toMatch(/simplifier une fraction/);
});

/**
 * Le verdict de préparation, posé en fin de séance de révision. IL NE DOIT NI
 * S'AFFICHER NI SE PRONONCER — le professeur dit de vive voix où en est
 * l'enfant, et la pastille de couleur fait le reste. Voir le bloc lui-même
 * pour le pourquoi : c'est lui qui allume « Prêt pour le contrôle ».
 *
 * Le cas le plus dangereux est l'observation : elle est rédigée POUR l'enfant,
 * donc parfaitement lisible — un bloc non masqué ne ressemblerait pas à une
 * fuite technique, il ressemblerait à un second message du professeur.
 */
const pret = [
  'On s’arrête là pour aujourd’hui, tu as bien travaillé.',
  '[CONTROLE_PRET]',
  'controle: 42',
  'pret: bientot',
  'observation: Il te reste à poser le calcul avant de conclure.',
  '[/CONTROLE_PRET]',
].join('\n');

test('le verdict de préparation ne s’affiche pas et ne se prononce pas', () => {
  const affiche = decouper(pret).map((s) => s.contenu).join(' ');
  const parle = texteParle(pret);

  expect(affiche).not.toMatch(/CONTROLE_PRET/);
  expect(affiche).not.toMatch(/bientot/);
  expect(affiche).not.toMatch(/poser le calcul/);
  expect(affiche).toMatch(/bien travaillé/);

  expect(parle).not.toMatch(/CONTROLE_PRET/);
  expect(parle).not.toMatch(/poser le calcul/);
  expect(parle).toMatch(/bien travaillé/);
});
