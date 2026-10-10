import { Fragment } from 'react';
import { TEXTES, texte } from '../../../../lib/jeux/lycee/explication-lineaire';
import { BoutonsChoix, libelleBon, lignesDe } from './commun';

/**
 * LA GALERIE DE CRISTAL — « L'explication linéaire » (1re). La couverture :
 * une galerie de verre et de piliers de cristal au couchant, une jeune fille
 * qui pose la main sur une colonne. La scène la reprend :
 *   - LA QUESTION : le texte, phrase après phrase, chacune sur une vitre de
 *     la galerie ; un fil de lumière descend le long des vitres, dans l'ordre
 *     — c'est la lecture LINÉAIRE ;
 *   - LES RÉPONSES : des prismes de cristal (`choix`) ; pour trouver le
 *     tournant, chaque prisme porte le début de sa phrase ;
 *   - APRÈS LA RÉPONSE : la galerie se partage en ses MOUVEMENTS. Les vitres
 *     d'avant le tournant prennent la couleur du couchant, celles d'après la
 *     couleur de la mer ; la vitre du tournant s'illumine et son mot de
 *     bascule (« Soudain », « Mais », « Pourtant »…) s'allume. Le mouvement
 *     étudié reçoit son rôle ; le projet de lecture s'inscrit au fronton ;
 *     linéaire et commentaire se dessinent côte à côte.
 * Avant la réponse, aucune vitre ne change de couleur : ce serait la donner.
 */

const P = 'sc-explication-lineaire';

/** L'extrait de la manche : celui dont le texte numéroté ouvre la question. */
export function extraitDe(m) {
  const i = TEXTES.findIndex((_, k) => m.question === texte(k) || m.question.startsWith(`${texte(k)}\n`));
  return i < 0 ? null : TEXTES[i];
}

/** Le mouvement désigné par la question : « → Le mouvement des phrases 4 à 6. » */
const mouvementDe = (m) => {
  const r = /phrases (\d+) à (\d+)\.\s*$/.exec(m.question);
  return r ? [Number(r[1]), Number(r[2])] : null;
};

/** Le mot qui fait basculer : le début de la phrase du tournant, jusqu'à la virgule. */
const BASCULES = /^(Soudain|Tout à coup|Mais|Pourtant|Cependant|Alors|Enfin|Et moi|Certes)/;

/** La galerie : une vitre par phrase, le fil de lumière, les mouvements une fois la réponse donnée. */
function Galerie({ m, termine }) {
  const extrait = extraitDe(m);
  const mouvement = mouvementDe(m);
  const tournant = termine && extrait && (m.consigne === 'bascule' || m.consigne === 'projet') ? extrait.tournant : null;
  const lignes = lignesDe(m.question);
  return (
    <div className={`${P}__galerie${tournant ? ` ${P}__galerie--partagee` : ''}`}>
      <span className={`${P}__fil`} aria-hidden="true"><span className={`${P}__lueur`} /></span>
      <p className={`${P}__texte`}>
        {lignes.map((l, i) => {
          if (l.trim() === '') return null;
          const r = /^(\d+)\. (.*)$/.exec(l);
          let contenu;
          if (!r) contenu = <span className={`${P}__note`}>{l}</span>;
          else {
            const n = Number(r[1]);
            const dans = mouvement && n >= mouvement[0] && n <= mouvement[1];
            let cote = '';
            if (tournant) cote = n < tournant ? ` ${P}__vitre--avant` : ` ${P}__vitre--apres`;
            const bascule = tournant === n ? BASCULES.exec(r[2])?.[0] : null;
            contenu = (
              <span
                className={`${P}__vitre${cote}${tournant === n ? ` ${P}__vitre--tournant` : ''}${dans ? ` ${P}__vitre--etudiee` : ''}${dans && termine ? ` ${P}__vitre--eclairee` : ''}`}
                style={{ '--k': n }}
              >
                <span className={`${P}__numero`}>{`${r[1]}.`}</span>
                {' '}
                {bascule ? (
                  <>
                    <mark className={`${P}__bascule`}>{bascule}</mark>
                    {r[2].slice(bascule.length)}
                  </>
                ) : r[2]}
              </span>
            );
          }
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Fragment key={i}>
              {contenu}
              {i < lignes.length - 1 ? '\n' : null}
            </Fragment>
          );
        })}
      </p>
    </div>
  );
}

/** Linéaire ou commentaire : suivre l'ordre du texte, ou regrouper par axes. */
function DeuxChemins({ bonne }) {
  return (
    <div className={`${P}__chemins`}>
      <span className={`${P}__chemin${bonne === 'lineaire' ? ` ${P}__chemin--ici` : ''}`}>
        <em>Explication linéaire</em>
        <span className={`${P}__suite`} aria-hidden="true">1 → 2 → 3 → 4 → 5</span>
        <span>dans l’ordre, à l’oral</span>
      </span>
      <span className={`${P}__chemin${bonne === 'commentaire' ? ` ${P}__chemin--ici` : ''}`}>
        <em>Commentaire</em>
        <span className={`${P}__suite`} aria-hidden="true">I : 1 · 4 — II : 2 · 3 · 5</span>
        <span>par axes, à l’écrit</span>
      </span>
    </div>
  );
}

/** Après la réponse, sous la galerie : le rôle du mouvement, le projet, ou les deux chemins. */
function Bilan({ m }) {
  const extrait = extraitDe(m);
  let contenu;
  if (m.consigne === 'methode') contenu = <DeuxChemins bonne={m.bonne} />;
  else if (m.consigne === 'bascule') {
    contenu = (
      <p className={`${P}__dit`}>
        {`Tout bascule à la phrase ${m.bonne} : `}
        <span className={`${P}__pastille ${P}__pastille--avant`}>{Number(m.bonne) === 2 ? 'mouvement 1 : phrase 1' : `mouvement 1 : phrases 1 à ${Number(m.bonne) - 1}`}</span>
        {' '}
        <span className={`${P}__pastille ${P}__pastille--apres`}>{`mouvement 2 : phrases ${m.bonne} à ${extrait?.phrases.length ?? '…'}`}</span>
      </p>
    );
  } else if (m.consigne === 'role') {
    const mv = mouvementDe(m);
    contenu = (
      <p className={`${P}__dit`}>
        {mv && <span className={`${P}__pastille ${P}__pastille--etudie`}>{`Phrases ${mv[0]} à ${mv[1]}`}</span>}
        {' '}
        {libelleBon(m)}
      </p>
    );
  } else contenu = <p className={`${P}__projet`}>{`Projet de lecture : ${libelleBon(m)}`}</p>;
  return <div className={`${P}__bilan`} role="status">{contenu}</div>;
}

export function QuestionExplication({ m, termine }) {
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      {m.consigne === 'methode'
        ? <div className={`${P}__pilier`}><p className={`${P}__phrase`}>{m.question}</p></div>
        : <Galerie m={m} termine={termine} />}
      {termine && <Bilan m={m} />}
    </div>
  );
}

/** Le début d'une phrase de l'extrait, pour le prisme qui la désigne. */
function debutDe(m, cle) {
  const phrase = extraitDe(m)?.phrases[Number(cle) - 1];
  if (!phrase) return null;
  const mots = phrase.split(' ');
  return mots.length > 5 ? `${mots.slice(0, 5).join(' ')}…` : phrase;
}

/** Les prismes de cristal : on touche celui de la bonne réponse. */
export function ChoixExplication({
  m, choix, fautes, choisir,
}) {
  return (
    <BoutonsChoix
      p={P}
      // Le tournant se cherche dans l'ordre du texte : les prismes suivent les phrases.
      choix={m.consigne === 'bascule' ? [...choix].sort((a, b) => Number(a.cle) - Number(b.cle)) : choix}
      fautes={fautes}
      choisir={choisir}
      classeListe={m.consigne === 'bascule' ? `${P}__choix--phrases` : ''}
      etiquette={m.consigne === 'bascule' ? 'Touche la phrase où tout bascule' : 'Choisis ta réponse'}
      deco={(c) => (
        <>
          <span className={`${P}__prisme`} aria-hidden="true" />
          {m.consigne === 'bascule' && debutDe(m, c.cle) && (
            <span className={`${P}__apercu`} aria-hidden="true">{`« ${debutDe(m, c.cle)} »`}</span>
          )}
        </>
      )}
    />
  );
}
