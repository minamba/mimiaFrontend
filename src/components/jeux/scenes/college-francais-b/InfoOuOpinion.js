import { avecVisuel, designer } from '../base';
import { PHRASES } from '../../../../lib/jeux/college/info-ou-opinion';
import {
  BoutonsReponses, eclairer, libelleDe, premierPiege, sansLeMot,
} from './commun';

/**
 * LE PLATEAU DU JOURNAL TÉLÉVISÉ — « Info ou opinion ? », 4e (09/10/2026).
 * La couverture : une présentatrice assise sur le bureau d'un plateau de
 * télévision, la ville au coucher du soleil derrière la grande baie, le bleu
 * d'un côté (Info), l'orange de l'autre (opinion).
 *   - LA QUESTION : la dépêche à l'écran du plateau, « EN DIRECT » qui
 *     clignote, la ville derrière, le bandeau qui défile en bas ;
 *   - LES RÉPONSES, pour info ou opinion : deux pupitres, le bleu de
 *     l'information (une loupe) et l'orange de l'opinion (une bulle) — on y
 *     GLISSE la dépêche, ou on clique le pupitre (`choix`). Pour le mot qui
 *     juge et la source : des micros tendus, chacun sa bonnette ;
 *   - APRÈS LA RÉPONSE : un tampon s'abat sur la dépêche (« VÉRIFIABLE » ou
 *     « AVIS »), le mot qui juge passe au surligneur orange, et la phrase
 *     revient SANS lui, devenue neutre ; pour une source, sa fiche.
 */

const P = 'sc-info-ou-opinion';

/** La ville derrière la baie du plateau, au coucher du soleil. */
function Baie() {
  return (
    <svg className={`${P}__baie`} viewBox="0 0 840 60" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${P}-soir`} x1="0" x2="1">
          <stop offset="0" stopColor="#2a4a8a" />
          <stop offset="0.55" stopColor="#6a5aa8" />
          <stop offset="1" stopColor="#ff9a3a" />
        </linearGradient>
      </defs>
      <rect width="840" height="60" fill={`url(#${P}-soir)`} />
      <circle className={`${P}__soleil`} cx="760" cy="34" r="14" fill="#fff1b8" />
      {[0, 420].map((dx) => (
        <g key={dx} transform={`translate(${dx} 0)`}>
          <path d="M0 60 V40 h16 V26 h12 V40 h10 V18 h14 V40 h20 V30 h10 V8 h10 V30 h16 V44 h18 V22 h14 V44 h22 V34 h12 V16 h8 V34 h20 V46 h16 V28 h14 V46 h24 V36 h12 V20 h12 V36 h22 V48 h40 V60 Z" fill="#1c2346" opacity="0.9" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} className={`${P}__lumiere`} style={{ '--n': i }} x={40 + i * 56} y={38} width="3" height="4" fill="#ffd86b" />
          ))}
        </g>
      ))}
    </svg>
  );
}

/** Après : la dépêche tamponnée, le mot surligné, ou la fiche de la source. */
function Explication({ m }) {
  if (m.consigne === 'nature') {
    const info = m.bonne === 'info';
    return (
      <div className={`${P}__explication`} role="status">
        <span className={`${P}__tampon ${P}__tampon--${info ? 'info' : 'opinion'}`}>
          {info ? 'Vérifiable' : 'Avis'}
        </span>
        <strong className={`${P}__verdict`}>{libelleDe(m, m.bonne)}</strong>
        <p className={`${P}__regle`}>{PHRASES[info ? 'info-verifiable' : 'opinion-jugement']}</p>
      </div>
    );
  }
  if (m.consigne === 'mot-qui-juge') {
    const neutre = sansLeMot(m.question, m.bonne);
    return (
      <div className={`${P}__explication`} role="status">
        <p className={`${P}__surligne`}>{eclairer(m.question, m.bonne, `${P}__feutre`)}</p>
        {neutre && (
          <p className={`${P}__neutre`}>
            <span className={`${P}__neutre-titre`}>Sans ce mot, la phrase ne juge plus :</span>
            {`« ${neutre} »`}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className={`${P}__explication`} role="status">
      <div className={`${P}__fiche`}>
        <span className={`${P}__fiche-titre`}>Fiche source</span>
        <strong>{libelleDe(m, m.bonne)}</strong>
      </div>
      {PHRASES[premierPiege(m)] && <p className={`${P}__regle`}>{PHRASES[premierPiege(m)]}</p>}
    </div>
  );
}

export function QuestionInfo({ m, termine }) {
  const glissable = m.consigne === 'nature' && !termine;
  return avecVisuel(m, (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__ecran`}>
        <Baie />
        <span className={`${P}__direct`} aria-hidden="true">
          <span className={`${P}__point`} />
          En direct
        </span>
        <div
          className={`${P}__depeche${glissable ? ' est-glissable' : ''}`}
          draggable={glissable || undefined}
          onDragStart={glissable ? (e) => {
            try {
              e.dataTransfer.setData('text/plain', 'depeche');
            } catch {
              // Pas de transfert : le clic sur le pupitre suffit.
            }
          } : undefined}
        >
          <span className={`${P}__agence`} aria-hidden="true">Dépêche</span>
          <p className={`${P}__texte`}>{designer(m.question)}</p>
        </div>
        <span className={`${P}__bandeau`} aria-hidden="true">
          <span>Info · Opinion · Source · Vérifier · Croiser · Info · Opinion · Source · Vérifier · Croiser ·</span>
        </span>
      </div>
      {termine && <Explication m={m} />}
    </div>
  ));
}

/** Les pupitres : la dépêche s'y glisse, ou on clique. */
function Pupitres({ m, choix, fautes, choisir }) {
  return (
    <div className={`${P}__studio`}>
      <p className={`${P}__aide`} aria-hidden="true">Glisse la dépêche sur un pupitre… ou clique-le.</p>
      <BoutonsReponses
        prefixe={P}
        m={m}
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        deposer
        classeListe={`${P}__pupitres`}
        dessin={({ cle }) => (cle === 'info' ? (
          <svg viewBox="0 0 40 40" width="40" height="40" focusable="false">
            <circle cx="17" cy="17" r="11" fill="rgba(200, 235, 255, 0.6)" stroke="#fff" strokeWidth="4" />
            <path d="M25 25 l10 10" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 40 40" width="40" height="40" focusable="false">
            <path d="M4 8 h32 v20 h-18 l-8 8 v-8 h-6 z" fill="#fff" />
            <path d="M14 18 q3 -4 6 0 q3 -4 6 0 q-6 7 -6 7 q0 0 -6 -7" fill="#ff7a1f" />
          </svg>
        ))}
      />
    </div>
  );
}

/** Les micros : pour le mot qui juge, et pour la source. */
function Micros(props) {
  return (
    <BoutonsReponses
      prefixe={P}
      {...props}
      classeListe={`${P}__micros`}
      dessin={() => (
        <svg viewBox="0 0 30 40" width="30" height="40" focusable="false">
          <rect x="8" y="2" width="14" height="20" rx="7" fill="#2a2f3a" />
          <path d="M8 10 h14 M8 14 h14" stroke="#5a6070" strokeWidth="1.5" />
          <rect x="13" y="22" width="4" height="16" rx="2" fill="#5a6070" />
        </svg>
      )}
    />
  );
}

export function ChoixInfo(props) {
  return props.m.consigne === 'nature' ? <Pupitres {...props} /> : <Micros {...props} />;
}

const scene = {
  question: (m, termine) => <QuestionInfo m={m} termine={termine} />,
  // Le tampon, le surligneur ou la fiche montrent déjà la bonne réponse.
  apres: () => null,
  choix: (props) => <ChoixInfo {...props} />,
};

export default scene;
