import {
  BoutonGlissable, DessinDuFil, Fete, cleHumeur, humeurDe, useFil,
} from './outils';
import './ce2-francais.css';

/**
 * LE SUJET QUI S'ÉLOIGNE (CE2) : LE CHEMIN DU SUJET (09/10/2026). La
 * couverture montre un grand panneau de bois pendu à deux cordes, un chemin
 * pointillé qui file vers un village au bord du lac, des flèches « Qui ? »,
 * « De qui ? »… et, sur le chemin, un petit bonhomme au sac marqué SUJET qui
 * s'en va en courant. La scène :
 *   - LA QUESTION : la phrase sur le panneau de bois ; dessous, le chemin où
 *     le petit SUJET (la mascotte) court au loin — il se retourne et fait
 *     signe à l'erreur (« je suis là-bas ! »), revient en sautant à la bonne
 *     réponse ;
 *   - LES RÉPONSES : trois GALETS du chemin, chacun gravé d'une forme du
 *     verbe. On en touche un, ou on le GLISSE dans le trou de la phrase ;
 *   - APRÈS LA RÉPONSE : le vrai sujet porte l'étiquette « sujet » qui
 *     s'accroche (dessinée par le CSS), le nom qui s'était glissé entre eux
 *     pâlit (« pas lui ! »), et une arche
 *     part du verbe, saute par-dessus l'intrus et retombe sur son sujet.
 */

const CLE = 'sc-sujet-qui-s-eloigne';

/** Le petit SUJET de la couverture : tête ronde, sac sur le dos, jambes qui courent. */
export function PetitSujet({ humeur, cle, sac }) {
  return (
    <span className={`${CLE}__coureur-piste`} aria-hidden="true">
      <span key={cle} className={`${CLE}__coureur est-${humeur}`}>
        <svg viewBox="0 0 70 90" focusable="false">
          <g className={`${CLE}__jambe ${CLE}__jambe--a`}>
            <path d="M30 60l-6 18" stroke="#3a3f55" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="22" cy="80" rx="7" ry="4" fill="#d14d4d" />
          </g>
          <g className={`${CLE}__jambe ${CLE}__jambe--b`}>
            <path d="M40 60l6 18" stroke="#3a3f55" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="48" cy="80" rx="7" ry="4" fill="#d14d4d" />
          </g>
          <rect x="22" y="36" width="26" height="28" rx="9" fill="#f4f4f4" stroke="#8e98ad" strokeWidth="2" />
          <rect x="10" y="36" width="18" height="24" rx="5" fill="#3a6ea5" stroke="#244a73" strokeWidth="2" />
          <path className={`${CLE}__bras`} d="M46 42l12-8" stroke="#f4f4f4" strokeWidth="6" strokeLinecap="round" />
          <circle cx="36" cy="22" r="16" fill="#fafafa" stroke="#8e98ad" strokeWidth="2" />
          <g className={`${CLE}__visage`}>
            <circle cx="31" cy="21" r="2.4" fill="#2b2b3a" />
            <circle cx="42" cy="21" r="2.4" fill="#2b2b3a" />
            <path d="M31 28q5 4 10 0" stroke="#2b2b3a" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="27" cy="26" r="2.6" fill="#ffb3b3" opacity="0.7" />
            <circle cx="46" cy="26" r="2.6" fill="#ffb3b3" opacity="0.7" />
          </g>
        </svg>
        <span className={`${CLE}__sac`}>{sac}</span>
        <span className={`${CLE}__bulle-coureur`}>!</span>
      </span>
    </span>
  );
}

export function QuestionSujetEloigne({ p, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  // Le nom glissé entre le sujet et le verbe : « de la classe ».
  const reste = p.avant.slice(p.sujet.length);
  const [conteneur, fil] = useFil(termine, `.${CLE}__trou`, `.${CLE}__sujet`);
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <div ref={conteneur} className={`${CLE}__panneau`}>
        <span className={`${CLE}__corde ${CLE}__corde--g`} aria-hidden="true" />
        <span className={`${CLE}__corde ${CLE}__corde--d`} aria-hidden="true" />
        {/* LE DESSIN D'ORIGINE, gardé : la phrase à trou, le sujet surligné une fois trouvé. */}
        <p className={`phrase-a-trou ${CLE}__phrase`}>
          {termine
            ? <mark className={`sujet__sujet ${CLE}__sujet`}>{p.sujet}</mark>
            : p.sujet}
          <span className={`${CLE}__intrus`}>{reste}</span>{' '}
          <span className={`phrase-a-trou__trou${termine ? ' est-rempli' : ''} ${CLE}__trou`}>{termine ? p.bon : '…'}</span>
          {' '}{p.apres}
        </p>
        {termine && <DessinDuFil fil={fil} className={`${CLE}__arche`} />}
        {termine && extra?.trouve && <Fete forme="fleur" />}
      </div>
      <div className={`${CLE}__paysage`} aria-hidden="true">
        <span className={`${CLE}__montagnes`} />
        <span className={`${CLE}__clocher`} />
        <svg className={`${CLE}__chemin`} viewBox="0 0 400 60" preserveAspectRatio="none" focusable="false">
          <path d="M0 52 C 120 50, 180 20, 400 14" className={`${CLE}__chemin-terre`} />
          <path d="M0 52 C 120 50, 180 20, 400 14" className={`${CLE}__chemin-pointilles`} />
        </svg>
        <span className={`${CLE}__fleche-qui`}>Qui ?</span>
        <PetitSujet humeur={humeur} cle={cleHumeur(humeur, extra)} sac="SUJET" />
        <span className={`${CLE}__fleurs`} />
      </div>
    </div>
  );
}

/** Les galets du chemin : on en touche un, ou on le glisse dans le trou de la phrase. */
export function Galets({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__galets`} aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <BoutonGlissable
              cible={`.${CLE}__trou`}
              choisir={() => choisir(cle)}
              disabled={faux}
              className={`${CLE}__galet ${CLE}__galet--${i % 3}${faux ? ' est-fausse' : ''}`}
            >
              <span className={`${CLE}__mousse`} aria-hidden="true" />
              {libelle}
            </BoutonGlissable>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (p, termine, extra) => <QuestionSujetEloigne p={p} termine={termine} extra={extra} />,
  choix: ({ choix, fautes, choisir }) => <Galets choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
