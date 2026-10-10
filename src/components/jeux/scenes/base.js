import Visuel from '../Visuel';

/**
 * LES BRIQUES DE LA QUESTION, communes à l'écran des jeux du collège et du
 * lycée (`JeuxCollege.js`) et aux scènes propres à un jeu (`scenes/`) : une
 * scène reprend la question telle quelle, puis l'habille.
 */
/**
 * LES QUESTIONS SUR PLUSIEURS LIGNES S'ALIGNENT À GAUCHE, et le CODE garde ses
 * espaces de début de ligne (07/10/2026) : en Python, l'indentation fait
 * partie du programme — « pre-line » l'effaçait, et une boucle devenait
 * illisible. Est du code une question dont une ligne commence par des
 * espaces, ou qui porte un mot-clé de programme.
 */
export function classeQuestion(texte) {
  const q = String(texte ?? '');
  const lignes = q.includes('\n');
  const code = lignes && (/\n[ \t\u00a0]+\S/.test(q) || /\b(def|for|while|print|range|append)\b/.test(q));
  return `phrase-a-trou college__question${lignes ? ' college__question--lignes' : ''}${code ? ' college__question--code' : ''}`;
}

/**
 * LA QUESTION ET SON DESSIN (09/10/2026) : une manche qui porte un `visuel`
 * (une boule cotée, un triangle, une courbe…) le montre au-dessus de sa
 * question — voir `lib/jeux/visuels.js`. Sans visuel, la question seule.
 */
export const avecVisuel = (m, texte) => (m.visuel ? (
  <div className="visuel-question">
    <Visuel visuel={m.visuel} />
    {texte}
  </div>
) : texte);

export const question = (m) => avecVisuel(m, <p className={classeQuestion(m.question)}>{m.question}</p>);

/**
 * EN FRANÇAIS, LE MOT À ANALYSER EST ENTRE CROCHETS dans la question
 * (« Le chat [mange] la souris. ») : on le souligne au lieu de montrer les
 * crochets. Pas en maths, où [AB] est un segment et doit rester écrit tel quel.
 */
export function designer(texte) {
  return String(texte).split(/(\[[^\]]+\])/).map((morceau, i) => (/^\[[^\]]+\]$/.test(morceau)
    // eslint-disable-next-line react/no-array-index-key
    ? <strong key={i} className="college__designe">{morceau.slice(1, -1)}</strong>
    : morceau));
}

export const questionFrancais = (m) => avecVisuel(m, <p className={classeQuestion(m.question)}>{designer(m.question)}</p>);
