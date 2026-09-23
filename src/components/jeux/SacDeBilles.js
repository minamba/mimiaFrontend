import * as regle from '../../lib/jeux/sacDeBilles';
import * as regleCM2 from '../../lib/jeux/billesCM2';
import jeuSimple from './JeuSimple';

/** Le sac ouvert et ses billes — on les voit, mais on tire sans regarder. */
function Sac({ sac, nom }) {
  const billes = Object.entries(sac).flatMap(([couleur, n]) => Array(n).fill(couleur));
  const description = Object.entries(sac).filter(([, n]) => n > 0).map(([c, n]) => `${n} ${c}${n > 1 ? 's' : ''}`).join(', ');
  return (
    <div className="billes__sac" role="img" aria-label={`${nom ? `Le sac ${nom}` : 'Dans le sac'} : ${description}`}>
      {nom && <span className="billes__nom">{nom}</span>}
      {billes.map((c, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`billes__bille billes__bille--${c}`} />
      ))}
    </div>
  );
}

/**
 * LE SAC DE BILLES — à l'écran. Toute la règle vit dans `sacDeBilles.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'sac-de-billes',
  classe: 'jeu--billes',
  rendreQuestion: (m) => (
    <>
      {m.sac && <Sac sac={m.sac} />}
      {m.sacs && (
        <div className="billes__deux">
          <Sac sac={m.sacs.a} nom="A" />
          <Sac sac={m.sacs.b} nom="B" />
        </div>
      )}
      <p className="phrase-a-trou">{m.question}</p>
    </>
  ),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'billes-cm2' } },
});
