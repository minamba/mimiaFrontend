import * as partage from '../../lib/jeux/partageBonbons';
import { repliquesPartage } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';

/**
 * LE PARTAGE DES BONBONS, À L'ÉCRAN — le tas de bonbons, les assiettes des
 * amis ; une fois la réponse trouvée, les bonbons se rangent dans les
 * assiettes, et le reste reste à côté. Toute la règle vit dans
 * `partageBonbons.js`.
 */
const REGLE = {
  MANCHES: partage.MANCHES,
  serie: partage.serie,
  bilan: partage.bilan,
  consigne: () => repliquesPartage.consigne,
  choix: (m) => m.choix.map((c) => ({ cle: c.cle, libelle: partage.ecrire(c) })),
  verdict: partage.verdict,
  erreur: (m, sens) => repliquesPartage.erreur(sens),
  aide: () => repliquesPartage.erreur('partage'),
};

const COULEURS = ['#e63946', '#f4a261', '#2a9d8f', '#8d5bd6', '#e9c46a'];

export default function PartageBonbons(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--partage"
      rendreQuestion={(m, termine) => (
        <div className="partage-jeu">
          <p className="partage__enonce">
            <strong>{m.bonbons} bonbons</strong> pour <strong>{m.amis} amis</strong>.
          </p>
          {!termine && (
            <div className="partage__tas" role="img" aria-label={`${m.bonbons} bonbons`}>
              {Array.from({ length: m.bonbons }, (_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Bonbon key={i} couleur={COULEURS[i % COULEURS.length]} />
              ))}
            </div>
          )}
          <ul className="partage__assiettes" aria-label={`${m.amis} assiettes`}>
            {Array.from({ length: m.amis }, (_, a) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={a} className="partage__assiette">
                {termine && Array.from({ length: m.bonne.q }, (_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Bonbon key={i} couleur={COULEURS[(a + i) % COULEURS.length]} />
                ))}
              </li>
            ))}
          </ul>
          {termine && m.bonne.r > 0 && (
            <p className="partage__reste">
              Il en reste {m.bonne.r} :{' '}
              {Array.from({ length: m.bonne.r }, (_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Bonbon key={i} couleur={COULEURS[i % COULEURS.length]} />
              ))}
            </p>
          )}
        </div>
      )}
    />
  );
}

/** Un bonbon emballé : un rond, deux papillotes. */
function Bonbon({ couleur }) {
  return (
    <svg className="partage__bonbon" viewBox="0 0 40 20" aria-hidden="true">
      <path d="M2 4 L10 10 L2 16 Z" fill={couleur} opacity="0.7" />
      <path d="M38 4 L30 10 L38 16 Z" fill={couleur} opacity="0.7" />
      <circle cx="20" cy="10" r="9" fill={couleur} />
      <circle cx="17" cy="7" r="2.5" fill="#fff" opacity="0.6" />
    </svg>
  );
}
