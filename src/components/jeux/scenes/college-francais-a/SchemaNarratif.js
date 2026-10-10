import { Boutons } from './commun';
import { ETAPES } from '../../../../lib/jeux/college/schema-narratif';

/**
 * LE CHEMIN DU RÉCIT — « Le schéma narratif » (6e). La couverture : un jeune
 * voyageur au départ d'un chemin qui part du village, passe sous l'orage,
 * grimpe dans la montagne, franchit une arche et descend vers une plage
 * ensoleillée. C'est le schéma narratif tout entier, en paysage :
 *   - le village tranquille (situation initiale), l'orage qui éclate (élément
 *     perturbateur), la montagne (péripéties), l'arche de lumière (élément de
 *     résolution), la plage au soleil (situation finale) ;
 *   - LA QUESTION : l'extrait sur un parchemin ;
 *   - LES RÉPONSES : pour « quelle étape ? », on clique l'étape SUR LE CHEMIN
 *     (seules les trois étapes proposées sont des boutons) ; pour l'ordre, trois
 *     parchemins à choisir ;
 *   - APRÈS LA RÉPONSE : le parchemin se pose sur son étape, le voyageur y
 *     marche ; pour l'ordre, les trois phrases se rangent sur le chemin, dans
 *     l'ordre de l'histoire.
 */

const P = 'sc-schema-narratif';

export const STATIONS = {
  initiale: { nom: 'Situation initiale', icone: '🏡' },
  perturbateur: { nom: 'Élément perturbateur', icone: '⛈️' },
  peripeties: { nom: 'Péripéties', icone: '⛰️' },
  resolution: { nom: 'Élément de résolution', icone: '🗝️' },
  finale: { nom: 'Situation finale', icone: '🌅' },
};

/** Le chemin : cinq étapes, du village à la plage. `rendu(cle)` dessine ce qui se pose sur une étape. */
function Chemin({ rendu, classe = '' }) {
  return (
    <ol className={`${P}__chemin ${classe}`.trim()}>
      {ETAPES.map((cle, i) => (
        <li key={cle} className={`${P}__etape ${P}__etape--${cle}`} style={{ '--n': i }}>
          {rendu(cle)}
        </li>
      ))}
    </ol>
  );
}

const Station = ({ cle, children = null }) => (
  <>
    <span className={`${P}__medaillon`} aria-hidden="true">{STATIONS[cle]?.icone}</span>
    <span className={`${P}__nom`}>{STATIONS[cle]?.nom}</span>
    {children}
  </>
);

export function QuestionSchema({ m, termine }) {
  const ordre = /^ordre-/.test(String(m.consigne ?? ''));
  const rangees = ordre
    ? [...(m.choix ?? [])].sort((a, b) => ETAPES.indexOf(a.cle) - ETAPES.indexOf(b.cle))
    : [];
  return (
    <div className={`${P}${termine ? ' est-arrive' : ''}`}>
      <div className={`${P}__ciel`} aria-hidden="true">
        <span className={`${P}__nuage`} />
        <span className={`${P}__nuage`} style={{ '--n': 1 }} />
        <span className={`${P}__soleil`} />
      </div>
      <div className={`${P}__parchemin`}>
        <p className={`${P}__phrase`}>{m.question}</p>
      </div>
      {termine && (
        <div className={`${P}__arrivee`} role="status">
          <Chemin
            classe={`${P}__chemin--fixe`}
            rendu={(cle) => {
              const ici = cle === m.bonne;
              const rang = rangees.findIndex((c) => c.cle === cle);
              return (
                <div className={`${P}__case${ici ? ' est-ici' : ''}${rang >= 0 ? ' est-rangee' : ''}`}>
                  <Station cle={cle}>
                    {ici && <span className={`${P}__voyageur`} aria-hidden="true">🧒</span>}
                  </Station>
                </div>
              );
            }}
          />
          {ordre ? (
            <ol className={`${P}__recit`}>
              {rangees.map((c) => (
                <li key={c.cle} className={c.cle === m.bonne ? 'est-ici' : ''}>
                  <span className={`${P}__etiquette`}>{STATIONS[c.cle]?.nom}</span>
                  {c.libelle}
                </li>
              ))}
            </ol>
          ) : (
            <p className={`${P}__legende`}>{`Cet extrait, c’est : ${STATIONS[m.bonne]?.nom ?? ''}.`}</p>
          )}
        </div>
      )}
    </div>
  );
}

/** Les réponses : les étapes du chemin (pour « quelle étape ? »), ou trois parchemins (pour l'ordre). */
export function ChoixSchema({
  m, choix, fautes, choisir,
}) {
  if (/^ordre-/.test(String(m.consigne ?? ''))) {
    return (
      <Boutons
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        classe={`${P}__choix--parchemins`}
        etiquette="Choisis la phrase"
        rendu={(c) => <span className={`${P}__rouleau`}>{c.libelle}</span>}
      />
    );
  }
  const parCle = Object.fromEntries(choix.map((c) => [c.cle, c]));
  return (
    <nav className={`${P}__route`} aria-label="Choisis l’étape sur le chemin">
      <Chemin
        rendu={(cle) => {
          const c = parCle[cle];
          if (!c) return <div className={`${P}__case est-decor`}><Station cle={cle} /></div>;
          const faux = fautes.includes(cle);
          return (
            <button
              type="button"
              className={`${P}__case ${P}__bouton${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className={`${P}__medaillon`} aria-hidden="true">{STATIONS[cle]?.icone}</span>
              <span className={`${P}__nom`}>{c.libelle}</span>
            </button>
          );
        }}
      />
    </nav>
  );
}
