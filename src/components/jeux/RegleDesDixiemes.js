import * as regle from '../../lib/jeux/regleDesDixiemes';
import * as regleCM2 from '../../lib/jeux/decimauxCM2';
import jeuSimple from './JeuSimple';

/**
 * Une règle coupée en dix, la flèche sur un trait : d'un entier au suivant
 * (dixièmes, CM1), ou d'un dixième au suivant (centièmes, la loupe du CM2).
 */
function Regle({ gauche, droite, position, unite }) {
  const x = (k) => 20 + k * 30;
  return (
    <svg className="dixiemes__regle" viewBox="0 0 340 90" role="img" aria-label={`Une règle de ${gauche} à ${droite}, coupée en ${unite}`}>
      <line x1={x(0)} y1={50} x2={x(10)} y2={50} className="geo__trait" />
      {Array.from({ length: 11 }, (_, k) => (
        <line key={k} x1={x(k)} y1={k % 10 === 0 ? 36 : 42} x2={x(k)} y2={k % 10 === 0 ? 64 : 58} className="geo__trait" />
      ))}
      <text x={x(0)} y={84} className="dixiemes__nombre">{gauche}</text>
      <text x={x(10)} y={84} className="dixiemes__nombre">{droite}</text>
      <path d={`M ${x(position)} 32 l -8 -14 h 16 z`} className="dixiemes__fleche" />
    </svg>
  );
}

function Question(m) {
  if (m.consigne === 'regle') {
    return <Regle gauche={m.debut} droite={m.debut + 1} position={m.dixiemes} unite="dixièmes" />;
  }
  if (m.consigne === 'loupe') return <Regle gauche={m.gauche} droite={m.droite} position={m.pas} unite="centièmes" />;
  return <p className="grands__nombre">{m.question}</p>;
}

/**
 * LA RÈGLE DES DIXIÈMES — à l'écran. Toute la règle vit dans
 * `regleDesDixiemes.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'regle-des-dixiemes',
  classe: 'jeu--dixiemes',
  rendreQuestion: Question,
  parNiveau: { CM2: { module: regleCM2, prefixe: 'decimaux-cm2' } },
});
