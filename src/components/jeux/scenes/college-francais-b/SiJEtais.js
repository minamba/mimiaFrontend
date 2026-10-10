import { avecVisuel, designer } from '../base';
import {
  HYPOTHESES, PHRASES, phrase, principale, subordonnee,
} from '../../../../lib/jeux/college/si-j-etais';
import { premierPiege, surDepot } from './commun';

/**
 * LES PONTS SUSPENDUS — « Si j'étais… », 3e (09/10/2026). La couverture : un
 * garçon sur un chemin fleuri, des falaises qui flottent dans les nuages
 * mauves, reliées par des ponts de corde et de planches.
 *   - LA QUESTION : la phrase sur un panneau de bois ; dessous, deux falaises
 *     dans les nuages — à gauche la subordonnée (« Si… »), à droite la
 *     principale — reliées par un pont de corde où manque une planche ;
 *   - LES RÉPONSES (`choix`) : des planches qui flottent dans les nuages ; on
 *     en GLISSE une dans le trou du pont, ou on la clique. Pour « laquelle
 *     est correcte ? », trois ponts entiers : on choisit celui qui tient ; un
 *     mauvais pont se rompt ;
 *   - APRÈS LA RÉPONSE : la planche est posée, un petit voyageur traverse, et
 *     chaque falaise porte son temps — « si + imparfait » d'un côté,
 *     « conditionnel présent » de l'autre : on voit le système.
 * Les temps ne s'affichent qu'après la réponse : avant, ce serait la donner.
 */

const P = 'sc-si-j-etais';

const TEMPS_SI = ['présent', 'imparfait', 'plus-que-parfait'];
const TEMPS_PR = ['futur', 'conditionnel présent', 'conditionnel passé'];
const FUTUR = 0;
/** Un repère impossible dans une phrase, pour retrouver la place du verbe. */
const TROU = '\u0001';

/**
 * LA MANCHE RELUE : l'hypothèse de la banque et son système (0, 1 ou 2),
 * retrouvés en refaisant les phrases du module. Introuvable : `null`.
 */
export function analyser(m) {
  for (const h of HYPOTHESES) {
    const [, , justes] = h.si;
    const v = h.pr[1];
    for (let s = 0; s < 3; s += 1) {
      const verbePr = v[s === 0 ? FUTUR : s];
      if (m.consigne === 'principale' && phrase(h, justes[s], '…') === m.question) return { h, s, verbeSi: justes[s], verbePr };
      if (m.consigne === 'apres-si' && phrase(h, '…', verbePr) === m.question) return { h, s, verbeSi: justes[s], verbePr };
      if (m.consigne === 'correcte' && s > 0 && phrase(h, justes[s], v[s]) === m.bonne) return { h, s, verbeSi: justes[s], verbePr: v[s] };
    }
  }
  return null;
}

/** Les nuages qui passent sous les falaises. */
function Nuages() {
  return (
    <span className={`${P}__nuages`} aria-hidden="true">
      {[0, 1, 2].map((i) => <span key={i} style={{ '--n': i }} />)}
    </span>
  );
}

/** Le pont : deux falaises, les cordes, les planches ; au milieu, le trou ou la planche posée. */
export function Pont({
  gauche, droite, milieu, tempsGauche, tempsDroite, voyageur = false, depot = null,
}) {
  return (
    <div className={`${P}__pont`}>
      <div className={`${P}__falaise ${P}__falaise--gauche`}>
        <span className={`${P}__rive`}>{gauche}</span>
        {tempsGauche && <span className={`${P}__temps`}>{tempsGauche}</span>}
      </div>
      <div className={`${P}__travee`}>
        <span className={`${P}__cordes`} aria-hidden="true" />
        <span className={`${P}__planches`} aria-hidden="true" />
        <span className={`${P}__case${milieu ? ' est-posee' : ''}`} {...(depot ?? {})}>
          {milieu ?? <span className={`${P}__vide`} aria-hidden="true">?</span>}
        </span>
        {voyageur && (
          /* LE VOYAGEUR MARCHE (10/10/2026, Camara : « le personnage glisse ») :
             le corps rebondit, bras et jambes se balancent en opposition ; le
             trajet suit la courbe du pont (plus bas au milieu) et s'arrête sur
             la rive, devant la falaise — jamais derrière. */
          <svg className={`${P}__voyageur`} viewBox="0 0 20 34" aria-hidden="true" focusable="false">
            <g className={`${P}__corps`}>
              <circle cx="10" cy="6" r="5" fill="#e8e0f5" />
              <path d="M10 11 v12" stroke="#2a1a4a" strokeWidth="3" strokeLinecap="round" />
              <path className={`${P}__bras ${P}__bras--g`} d="M10 14 l-6 6" stroke="#2a1a4a" strokeWidth="3" strokeLinecap="round" />
              <path className={`${P}__bras ${P}__bras--d`} d="M10 14 l6 6" stroke="#2a1a4a" strokeWidth="3" strokeLinecap="round" />
              <rect x="3" y="12" width="8" height="9" rx="2" fill="#8a5a2b" />
              <path className={`${P}__jambe ${P}__jambe--g`} d="M10 23 l-5 9" stroke="#2a1a4a" strokeWidth="3" strokeLinecap="round" />
              <path className={`${P}__jambe ${P}__jambe--d`} d="M10 23 l5 9" stroke="#2a1a4a" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        )}
      </div>
      <div className={`${P}__falaise ${P}__falaise--droite`}>
        <span className={`${P}__rive`}>{droite}</span>
        {tempsDroite && <span className={`${P}__temps`}>{tempsDroite}</span>}
      </div>
    </div>
  );
}

/** Après : le pont complet, le voyageur qui traverse, les temps du système. */
function Traversee({ m }) {
  const a = analyser(m);
  const regle = m.consigne === 'correcte'
    ? PHRASES['correcte-regle']
    : PHRASES[premierPiege(m)] ?? PHRASES[`${m.consigne}-regle`];
  if (!a) {
    return (
      <div className={`${P}__traversee`} role="status">
        <strong className={`${P}__systeme`}>{m.bonne}</strong>
        {regle && <p className={`${P}__regle`}>{regle}</p>}
      </div>
    );
  }
  const { h, s, verbeSi, verbePr } = a;
  // Le verbe qui manquait brille à sa place, sur sa rive.
  const marque = (texte, verbe, brille) => {
    const [avant, apres = ''] = texte.split(TROU);
    if (!brille) return `${avant}${verbe}${apres}`;
    return <>{avant}<mark className={`${P}__verbe`}>{verbe}</mark>{apres}</>;
  };
  return (
    <div className={`${P}__traversee`} role="status">
      <Nuages />
      <Pont
        gauche={<>{marque(subordonnee(h, TROU), verbeSi, m.consigne !== 'principale')},</>}
        droite={marque(principale(h, TROU), verbePr, m.consigne !== 'apres-si')}
        milieu={<strong aria-hidden="true">✔</strong>}
        tempsGauche={`si + ${TEMPS_SI[s]}`}
        tempsDroite={TEMPS_PR[s]}
        voyageur
      />
      {regle && <p className={`${P}__regle`}>{regle}</p>}
    </div>
  );
}

export function QuestionSi({ m, termine }) {
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__panneau`}>
        <span className={`${P}__piquet`} aria-hidden="true" />
        <p className={`${P}__texte`}>{designer(m.question)}</p>
      </div>
      {termine && <Traversee m={m} />}
    </div>
  ));
}

/** Les planches qui flottent : chacune un bouton, qu'on peut aussi glisser. */
function Planches({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__planches-libres`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${P}__planche${fausse ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={fausse}
              draggable={!fausse}
              onDragStart={(e) => {
                try {
                  e.dataTransfer.setData('text/plain', String(cle));
                } catch {
                  // Pas de transfert : le clic suffit.
                }
              }}
            >
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Le pont à compléter, et ses planches. */
function PontACompleter({ m, choix, fautes, choisir }) {
  // Le pont reprend les deux moitiés de la phrase, coupées à la virgule.
  const q = String(m.question);
  const coupe = q.indexOf(', ');
  const gauche = coupe > 0 ? `${q.slice(0, coupe)},` : q;
  const droite = coupe > 0 ? q.slice(coupe + 2) : '';
  return (
    <div className={`${P}__chantier`}>
      <Nuages />
      <Pont gauche={gauche} droite={droite} depot={surDepot(choix, fautes, choisir)} />
      <p className={`${P}__aide`} aria-hidden="true">Glisse la bonne planche dans le trou du pont… ou clique-la.</p>
      <Planches choix={choix} fautes={fautes} choisir={choisir} />
    </div>
  );
}

/** « Laquelle est correcte ? » : trois ponts, un seul tient. */
function TroisPonts({ choix, fautes, choisir }) {
  return (
    <ul className={`${P}__ponts`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <button
              type="button"
              className={`${P}__passerelle${fausse ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={fausse}
            >
              <span className={`${P}__corde-haute`} aria-hidden="true" />
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ChoixSi(props) {
  return props.m.consigne === 'correcte' ? <TroisPonts {...props} /> : <PontACompleter {...props} />;
}

const scene = {
  question: (m, termine) => <QuestionSi m={m} termine={termine} />,
  // Le pont complet montre la bonne planche à sa place.
  apres: () => null,
  choix: (props) => <ChoixSi {...props} />,
};

export default scene;
