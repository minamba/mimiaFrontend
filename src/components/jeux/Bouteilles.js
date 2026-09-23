import * as b from '../../lib/jeux/bouteilles';
import { repliquesBouteilles } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';

/**
 * LES BOUTEILLES, À L'ÉCRAN — une conversion, trois récipients à comparer, ou
 * des verres à remplir. Toute la règle vit dans `bouteilles.js`.
 *
 * À LA COMPARAISON, LES RÉCIPIENTS ONT TOUS LA MÊME TAILLE : dessinés à leur
 * contenance, ils donneraient la réponse sans lire les étiquettes.
 */
const REGLE = {
  MANCHES: b.MANCHES,
  serie: b.serie,
  bilan: b.bilan,
  consigne: (m) => repliquesBouteilles.consigne(m.mode),
  choix: (m) => m.choix.map((c) => ({
    cle: c,
    libelle: m.mode === 'comparer' ? b.avecArticle(c) : `${c} ${m.unite === 'verres' ? 'verres' : m.unite}`,
  })),
  verdict: b.verdict,
  erreur: (m, sens) => repliquesBouteilles.erreur(sens),
  aide: () => repliquesBouteilles.erreur('litre'),
};

export default function Bouteilles(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--bouteilles"
      rendreQuestion={(m, termine) => {
        if (m.mode === 'comparer') {
          return (
            <ul className="bouteilles__rangee">
              {m.recipients.map((r) => (
                <li key={r.nom} className={`bouteilles__recipient${termine && r.nom === m.bonne ? ' est-bon' : ''}`}>
                  <Bouteille />
                  <span className="bouteilles__nom">{r.nom}</span>
                  <span className="bouteilles__etiquette">{b.ecrire(r.cl)}</span>
                  {termine && <span className="bouteilles__cl">= {r.cl} cL</span>}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p className="bouteilles__question">
            {!termine && m.question}
            {termine && m.mode === 'remplir' && `${m.bonne} verres de ${m.verre} cL remplissent ${b.ecrire(m.bouteille)}.`}
            {termine && m.mode !== 'remplir' && m.question.replace('?', String(m.bonne))}
          </p>
        );
      }}
    />
  );
}

/** Une bouteille dessinée, toujours de la même taille. */
function Bouteille() {
  return (
    <svg className="bouteilles__dessin" viewBox="0 0 40 80" aria-hidden="true">
      <rect x="15" y="2" width="10" height="10" rx="2" className="bouteilles__bouchon" />
      <path d="M14 12 h12 v8 q10 6 10 18 v34 q0 6 -6 6 h-20 q-6 0 -6 -6 v-34 q0 -12 10 -18 z" className="bouteilles__verre" />
      <path d="M6 44 h28 v28 q0 6 -6 6 h-16 q-6 0 -6 -6 z" className="bouteilles__eau" />
    </svg>
  );
}
