import { avecVisuel, designer } from '../base';
import { PHRASES, ROLES, TEXTES } from '../../../../lib/jeux/college/these-argument-exemple';
import { BoutonsReponses, premierPiege, surDepot } from './commun';

/**
 * L'AGORA DE PIERRE — « Thèse, argument ou exemple ? », 3e (09/10/2026). La
 * couverture : une fille en cape verte accroupie dans un amphithéâtre de
 * pierre, au pied d'une haute tour ; elle pose la main sur un bloc gravé.
 * Un texte qui défend une idée se BÂTIT comme cette tour : l'exemple en
 * fondation, l'argument en colonne, la thèse au sommet.
 *   - LA QUESTION : le texte gravé sur une tablette de pierre ; la phrase
 *     indiquée est un bloc qu'on peut prendre ;
 *   - LES RÉPONSES (`choix`) : pour le rôle, la tour elle-même — trois
 *     étages vides, le sommet, la colonne, la fondation : on y GLISSE le
 *     bloc, ou on clique l'étage. Pour un connecteur, une arche dont manque
 *     la clé de voûte : on glisse (ou clique) la bonne clé. Pour la thèse,
 *     trois frontons gravés ;
 *   - APRÈS LA RÉPONSE : la tour se monte, chaque phrase du texte à son
 *     étage, la phrase indiquée qui brille ; la clé de voûte se pose et dit
 *     le lien (une cause, une conséquence…) ; la thèse coiffe le temple.
 */

const P = 'sc-these-argument-exemple';

const ORDRE = ['these', 'argument', 'exemple'];

/** Le lien qu'annonce chaque connecteur du module. */
const LIENS = {
  car: 'une cause',
  'en effet': 'une cause',
  'parce qu’': 'une cause',
  donc: 'une conséquence',
  'c’est pourquoi': 'une conséquence',
  pourtant: 'une opposition',
  cependant: 'une opposition',
  mais: 'une opposition',
  'au contraire': 'une opposition',
  'de plus': 'un ajout',
  'mais aussi': 'un ajout',
  'par exemple': 'un exemple',
};

const lienDe = (connecteur) => LIENS[String(connecteur ?? '').toLowerCase()] ?? null;

/** Le texte de la banque d'où vient une question de rôle, et la phrase indiquée. */
function texteDe(m) {
  const texte = TEXTES.find((t) => String(m.question).startsWith(t.join(' ')));
  const indiquee = String(m.question).match(/→\s*«\s*(.+?)\s*»\s*$/)?.[1] ?? null;
  return texte ? { texte, indiquee } : null;
}

/** La tablette : le texte gravé, la dernière ligne « → « … » » devenue un bloc. */
function Tablette({ m, termine }) {
  const lignes = String(m.question).split('\n');
  const bloc = m.consigne === 'role' && !termine;
  return (
    <div className={`${P}__tablette`}>
      {lignes.map((l, i) => {
        const fleche = l.startsWith('→');
        return (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__ligne${!l.trim() ? ' est-vide' : ''}${fleche ? ` ${P}__bloc` : ''}${fleche && bloc ? ' est-glissable' : ''}`}
            draggable={fleche && bloc ? true : undefined}
            onDragStart={fleche && bloc ? (e) => {
              try {
                e.dataTransfer.setData('text/plain', 'bloc');
              } catch {
                // Pas de transfert : le clic sur l'étage suffit.
              }
            } : undefined}
          >
            {designer(l)}
            {'\n'}
          </span>
        );
      })}
    </div>
  );
}

/** Après un rôle : la tour montée, une phrase par étage. */
function TourMontee({ m }) {
  const lu = texteDe(m);
  if (!lu) return null;
  return (
    <ol className={`${P}__tour ${P}__tour--montee`}>
      {ORDRE.map((role, i) => (
        <li
          key={role}
          className={`${P}__etage ${P}__etage--${role}${lu.texte[i] === lu.indiquee ? ' est-indiquee' : ''}`}
          aria-current={lu.texte[i] === lu.indiquee ? 'true' : undefined}
          style={{ '--n': 2 - i }}
        >
          <span className={`${P}__role`}>{ROLES[role]}</span>
          <span className={`${P}__phrase`}>{lu.texte[i]}</span>
        </li>
      ))}
    </ol>
  );
}

/** L'arche : deux piliers, et la clé de voûte (posée, ou à poser). */
function Arche({ gauche, droite, cle, depot }) {
  return (
    <div className={`${P}__arche`}>
      <span className={`${P}__pilier`}>{gauche}</span>
      <span className={`${P}__cle${cle ? ' est-posee' : ''}`} {...(depot ?? {})}>
        {cle ?? <span aria-hidden="true">?</span>}
      </span>
      <span className={`${P}__pilier`}>{droite}</span>
    </div>
  );
}

/** Les deux moitiés d'une phrase à connecteur, de part et d'autre du « … ». */
function moities(question) {
  const [avant, ...apres] = String(question).split('…');
  return [avant.trim(), apres.join('…').trim()];
}

function Explication({ m }) {
  // Pour un rôle, la phrase d'erreur explique le bon rôle ; ailleurs, elle
  // parlerait du mauvais choix : on lui préfère la règle.
  const regle = m.consigne === 'role'
    ? PHRASES[premierPiege(m)] ?? PHRASES['role-regle']
    : PHRASES[`${m.consigne}-regle`];
  if (m.consigne === 'role') {
    return (
      <div className={`${P}__explication`} role="status">
        <TourMontee m={m} />
        {regle && <p className={`${P}__regle`}>{regle}</p>}
      </div>
    );
  }
  if (m.consigne === 'connecteur') {
    const [gauche, droite] = moities(m.question);
    const lien = lienDe(m.bonne);
    return (
      <div className={`${P}__explication`} role="status">
        <Arche gauche={gauche} droite={droite} cle={<strong>{m.bonne}</strong>} />
        {lien && <span className={`${P}__lien`}>{`Le lien : ${lien}`}</span>}
        {regle && <p className={`${P}__regle`}>{regle}</p>}
      </div>
    );
  }
  return (
    <div className={`${P}__explication`} role="status">
      <div className={`${P}__temple`}>
        <strong className={`${P}__fronton`}>{m.bonne}</strong>
        <span className={`${P}__colonnes`} aria-hidden="true">
          {[0, 1, 2].map((i) => <span key={i} style={{ '--n': i }} />)}
        </span>
        <span className={`${P}__socle`}>Les arguments du texte portent cette thèse.</span>
      </div>
      {regle && <p className={`${P}__regle`}>{regle}</p>}
    </div>
  );
}

export function QuestionThese({ m, termine }) {
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <span className={`${P}__gradins`} aria-hidden="true" />
      <Tablette m={m} termine={termine} />
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** Le rôle : les trois étages de la tour, du sommet à la fondation. */
function Tour({ m, choix, fautes, choisir }) {
  return (
    <div className={`${P}__chantier`}>
      <p className={`${P}__aide`} aria-hidden="true">Glisse le bloc à son étage… ou clique l’étage.</p>
      <BoutonsReponses
        prefixe={P}
        m={m}
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        deposer
        classeListe={`${P}__tour`}
      />
    </div>
  );
}

/** Le connecteur : l'arche à compléter, et ses clés de voûte. */
function Voute({ m, choix, fautes, choisir }) {
  const [gauche, droite] = moities(m.question);
  return (
    <div className={`${P}__chantier`}>
      <Arche gauche={gauche} droite={droite} depot={surDepot(choix, fautes, choisir)} />
      <p className={`${P}__aide`} aria-hidden="true">Glisse la bonne clé de voûte… ou clique-la.</p>
      <BoutonsReponses
        prefixe={P}
        m={m}
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        glisser
        classeListe={`${P}__cles`}
      />
    </div>
  );
}

/** La thèse : trois frontons gravés. */
function Frontons(props) {
  return <BoutonsReponses prefixe={P} {...props} classeListe={`${P}__frontons`} />;
}

export function ChoixThese(props) {
  if (props.m.consigne === 'role') return <Tour {...props} />;
  if (props.m.consigne === 'connecteur') return <Voute {...props} />;
  return <Frontons {...props} />;
}

const scene = {
  question: (m, termine) => <QuestionThese m={m} termine={termine} />,
  // La tour montée, la clé posée ou le fronton montrent la bonne réponse.
  apres: () => null,
  choix: (props) => <ChoixThese {...props} />,
};

export default scene;
