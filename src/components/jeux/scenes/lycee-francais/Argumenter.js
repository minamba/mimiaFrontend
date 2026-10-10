import { Fragment } from 'react';
import {
  ARGUMENTS, LIENS, RELATIONS, STRATEGIES, TROUS,
} from '../../../../lib/jeux/lycee/argumenter';
import { BoutonsChoix, lignesDe } from './commun';

/**
 * L'AGORA DE MOSAÏQUE — « Argumenter » (2de). La couverture : une terrasse
 * méditerranéenne, des colonnades, un sol de mosaïque en rosace, la mer. La
 * scène la reprend :
 *   - LA QUESTION : la phrase posée sur le pupitre de marbre de l'orateur, au
 *     milieu de la rosace ; le trou d'une phrase à compléter est une case vide
 *     de la mosaïque ;
 *   - LES RÉPONSES : des tesselles de mosaïque (`choix`) qu'on pose dans le
 *     sol — on en choisit une ;
 *   - APRÈS LA RÉPONSE : LE RAISONNEMENT DESSINÉ. La phrase se coupe en ses
 *     deux blocs, reliés par la tesselle d'or du connecteur et par une
 *     flèche : de la cause vers la conséquence, de ce qu'on admet vers ce
 *     qu'on maintient, ⇄ pour deux idées opposées, + pour un ajout. Un type
 *     d'argument reçoit son emblème ; une phrase de stratégie prend sa place
 *     sur le chemin du texte : thèse adverse → concession → réfutation.
 * Rien de ce dessin n'existe avant la réponse : la flèche dirait le lien.
 */

const P = 'sc-argumenter';

/** Les deux blocs d'une phrase liée : celui qu'introduit le connecteur, et l'autre. */
const ROLES_BLOCS = {
  cause: ['La cause', 'L’effet'],
  consequence: ['La conséquence', 'Le point de départ'],
  opposition: ['D’un côté…', '… de l’autre'],
  concession: ['Ce qu’on admet', 'Ce qu’on maintient'],
  addition: ['Un ajout', 'Un premier point'],
};

/**
 * DÉCOUPER LA PHRASE AUTOUR DE SON CONNECTEUR. Rend les blocs dans l'ordre
 * de lecture, chacun avec son rôle, et le sens de la flèche (du premier vers
 * le second, ou l'inverse). `null` si la phrase ne se laisse pas découper.
 */
export function raisonnement(phrase, connecteur, relation) {
  const nettoie = (t) => t.replace(/^[\s,;:]+|[\s,;:.]+$/g, '').trim();
  const [introduit, autre] = ROLES_BLOCS[relation] ?? [];
  if (!introduit) return null;
  if (connecteur.includes('…')) {
    // « Certes… mais », « Non seulement… mais encore » : deux bornes.
    const [b1, b2] = connecteur.split('…').map((x) => x.trim());
    const i1 = phrase.indexOf(b1);
    const i2 = phrase.indexOf(b2, i1 + b1.length);
    if (i1 < 0 || i2 < 0) return null;
    const a = nettoie(phrase.slice(i1 + b1.length, i2));
    const b = nettoie(phrase.slice(i2 + b2.length));
    if (!a || !b) return null;
    const roles = relation === 'addition' ? [autre, introduit] : [introduit, autre];
    return { blocs: [[a, roles[0]], [b, roles[1]]], pont: connecteur, sens: 'droite' };
  }
  const i = phrase.indexOf(connecteur);
  if (i < 0) return null;
  // « A ; la campagne, en revanche, B » : le connecteur est dans le second bloc, coupé au point-virgule.
  const pv = phrase.search(/[;:]/);
  if (pv >= 0 && pv < i && nettoie(phrase.slice(pv + 1, i))) {
    return {
      blocs: [[nettoie(phrase.slice(0, pv)), autre], [nettoie(phrase.slice(pv + 1)), introduit]],
      pont: connecteur,
      sens: relation === 'cause' ? 'gauche' : 'droite',
    };
  }
  const avant = nettoie(phrase.slice(0, i));
  const apres = phrase.slice(i + connecteur.length);
  if (avant) {
    // « Certes A, mais B » : après « mais », ce qu'on maintient.
    if (connecteur === 'mais') {
      const b = nettoie(apres);
      return b ? { blocs: [[avant.replace(/^Certes,?\s*/, ''), introduit], [b, autre]], pont: connecteur, sens: 'droite' } : null;
    }
    // « A, car B » : B est le bloc introduit.
    const b = nettoie(apres);
    if (!b) return null;
    return {
      blocs: [[avant, autre], [b, introduit]],
      pont: connecteur,
      sens: relation === 'cause' ? 'gauche' : 'droite',
    };
  }
  // « Puisque A, B » : le connecteur ouvre la phrase, son bloc va jusqu'à la virgule.
  const virgule = apres.indexOf(',');
  if (virgule < 0) return null;
  const a = nettoie(apres.slice(0, virgule));
  const b = nettoie(apres.slice(virgule + 1));
  if (!a || !b) return null;
  return {
    blocs: [[a, introduit], [b, autre]],
    pont: connecteur,
    sens: relation === 'consequence' ? 'gauche' : 'droite',
  };
}

const FLECHES = {
  opposition: '⇄', addition: '+', gauche: '←', droite: '→',
};

/** Le raisonnement dessiné : deux blocs, la tesselle d'or du connecteur, la flèche. */
function Pont({ r, relation }) {
  const fleche = FLECHES[relation] ?? FLECHES[r.sens];
  return (
    <div className={`${P}__pont`}>
      {r.blocs.map(([texte, role], i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          <span className={`${P}__bloc`} style={{ '--k': i * 2 }}>
            <em className={`${P}__role`}>{role}</em>
            {texte}
          </span>
          {i === 0 && (
            <span className={`${P}__lien`} style={{ '--k': 1 }}>
              <span className={`${P}__tesselle-or`}>{r.pont}</span>
              <span className={`${P}__fleche`} aria-hidden="true">{fleche}</span>
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

/** Les emblèmes des quatre types d'argument. */
const EMBLEMES = {
  autorite: ['❝', 'Une voix reconnue parle à sa place.'],
  exemple: ['📌', 'Un cas précis, réel, prouve l’idée.'],
  analogie: ['≈', 'On compare à une autre situation qui lui ressemble.'],
  'ad-hominem': ['⚠', 'On attaque la personne, pas son idée : un argument fallacieux.'],
};

/** Le chemin d'un texte qui réfute : thèse adverse → concession → réfutation. */
function Chemin({ bonne }) {
  return (
    <ol className={`${P}__chemin`} aria-label="Le chemin d’un texte qui réfute">
      {Object.entries(STRATEGIES).map(([cle, nom], i) => (
        <li key={cle} className={`${P}__etape${cle === bonne ? ` ${P}__etape--ici` : ''}`} style={{ '--k': i }}>
          {nom}
        </li>
      ))}
    </ol>
  );
}

/** Après la réponse : selon la manche, le pont, l'emblème ou le chemin. */
function Raisonnement({ m }) {
  let contenu = null;
  if (m.consigne === 'relation') {
    const lien = LIENS.find(([phrase]) => m.question.startsWith(`« ${phrase} »`));
    const r = lien && raisonnement(lien[0], lien[1], lien[2]);
    contenu = (
      <>
        {r && <Pont r={r} relation={lien[2]} />}
        <strong className={`${P}__verdict`}>{RELATIONS[m.bonne]}</strong>
      </>
    );
  } else if (m.consigne === 'connecteur') {
    const trou = TROUS.find(([phrase]) => phrase === m.question);
    const phrase = trou ? m.question.replace('…', trou[1][0]) : null;
    const relation = trou?.[1][1];
    const r = phrase && raisonnement(phrase, trou[1][0], relation);
    contenu = (
      <>
        {r ? <Pont r={r} relation={relation} /> : null}
        <strong className={`${P}__verdict`}>{`« ${m.bonne} » : ${RELATIONS[relation]?.toLowerCase() ?? ''}`}</strong>
      </>
    );
  } else if (m.consigne === 'argument') {
    const [icone, dit] = EMBLEMES[m.bonne] ?? ['★', ''];
    contenu = (
      <div className={`${P}__embleme${m.bonne === 'ad-hominem' ? ` ${P}__embleme--piege` : ''}`}>
        <span className={`${P}__icone`} aria-hidden="true">{icone}</span>
        <span>
          <strong className={`${P}__verdict`}>{ARGUMENTS[m.bonne]}</strong>
          <span className={`${P}__dit`}>{dit}</span>
        </span>
      </div>
    );
  } else if (m.consigne === 'strategie') {
    contenu = <Chemin bonne={m.bonne} />;
  }
  return contenu ? <div className={`${P}__dessin`} role="status">{contenu}</div> : null;
}

/** La phrase du pupitre : le trou devient une case vide de la mosaïque (ou la tesselle posée). */
function Phrase({ m, termine }) {
  const lignes = lignesDe(m.question);
  return (
    <p className={`${P}__texte`}>
      {lignes.map((l, i) => {
        let contenu = l;
        if (i > 0) contenu = <span className={`${P}__signal`}>{l}</span>;
        else if (m.consigne === 'connecteur' && l.includes('…')) {
          const at = l.indexOf('…');
          contenu = (
            <>
              {l.slice(0, at)}
              <span className={`${P}__case-vide${termine ? ` ${P}__case-vide--posee` : ''}`} data-mot={termine ? m.bonne : undefined}>…</span>
              {l.slice(at + 1)}
            </>
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
  );
}

export function QuestionArgumenter({ m, termine }) {
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__agora`}>
        <span className={`${P}__rosace`} aria-hidden="true" />
        <div className={`${P}__pupitre`}>
          <Phrase m={m} termine={termine} />
        </div>
      </div>
      {termine && <Raisonnement m={m} />}
    </div>
  );
}

/** Les tesselles : on choisit celle qui complète la mosaïque. */
export function ChoixArgumenter({ choix, fautes, choisir }) {
  return (
    <BoutonsChoix
      p={P}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      etiquette="Pose la bonne tesselle"
      deco={() => <span className={`${P}__motif`} aria-hidden="true" />}
    />
  );
}
