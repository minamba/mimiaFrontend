import * as temps from '../../lib/jeux/combienDeTemps';
import { repliquesDuree } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import DureesCM1 from './DureesCM1';

/**
 * COMBIEN DE TEMPS ?, À L'ÉCRAN — l'heure de début, l'heure de fin, trois
 * durées ; une fois trouvée, le chemin par l'heure pile. Toute la règle vit
 * dans `combienDeTemps.js`.
 */
const REGLE = {
  MANCHES: temps.MANCHES,
  serie: temps.serie,
  bilan: temps.bilan,
  consigne: () => repliquesDuree.consigne,
  choix: (m) => m.choix.map((d) => ({ cle: d, libelle: temps.ecrireDuree(d) })),
  verdict: temps.verdict,
  erreur: (m, sens) => repliquesDuree.erreur(sens),
  aide: () => repliquesDuree.erreur('naif'),
};

function CombienDeTempsAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--duree"
      rendreQuestion={(m, termine) => (
        <div className="duree-jeu">
          <p className="duree__activite">{m.activite}</p>
          <div className="duree__heures">
            <p className="duree__heure"><span>commence à</span>{temps.ecrireHeure(m.debut)}</p>
            <span className="duree__fleche" aria-hidden="true">→</span>
            <p className="duree__heure"><span>finit à</span>{temps.ecrireHeure(m.fin)}</p>
          </div>
          {termine && (
            <ol className="duree__etapes" aria-label="Le chemin par l’heure pile">
              {temps.etapes(m).map((e) => (
                <li key={e.de}>
                  {temps.ecrireHeure(e.de)} → {temps.ecrireHeure(e.a)} : <strong>{temps.ecrireDuree(e.a - e.de)}</strong>
                </li>
              ))}
              <li className="duree__total">En tout : <strong>{temps.ecrireDuree(m.bonne)}</strong></li>
            </ol>
          )}
        </div>
      )}
    />
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `DureesCM1.js` ; il lit la classe. */
export default function CombienDeTemps({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <DureesCM1 niveau={niveau} {...props} /> : <CombienDeTempsAvantCM1 niveau={niveau} {...props} />;
}
