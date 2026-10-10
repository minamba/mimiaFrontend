import { autourDuTrou, groupeDuDebut, PhraseATrou } from './outils';

/**
 * LE PASSÉ COMPOSÉ AVEC ÊTRE (CM1) — LE PARTICIPE AVEC AVOIR (CM2) : LE TRAIN
 * DES ACCORDS (09/10/2026). La couverture du CM1 : une gare de village, un
 * tableau « DESTINATION : être — aller, venir, partir, arriver… », un train
 * bleu « DESTINATION : DEMAIN », des panneaux « Parti(e), Arrivé(e) ». Celle du
 * CM2 : une fille qui cueille des pommes (« les pommes que j'ai cueillies »).
 * La scène :
 *   - LA QUESTION : la phrase s'affiche sur le TABLEAU DES DÉPARTS, lettres
 *     jaunes sur fond noir, qui tombent comme un panneau à palettes ;
 *   - LES RÉPONSES : des WAGONS sur la voie, chacun sa forme peinte sur le
 *     flanc ; ils roulent un peu, d'avant en arrière, en attendant ;
 *   - APRÈS LA RÉPONSE : le bon wagon s'ATTELLE à la locomotive, qui fume ; la
 *     locomotive porte le nom de « celui qui commande l'accord » (le sujet avec
 *     être, le COD placé avant avec avoir), et les lettres ajoutées au
 *     participe s'allument : e (féminin), s (pluriel). Avec avoir et un COD
 *     après le verbe, la locomotive dit « pas d'accord ».
 */

const CLE = 'sc-passe-compose-cm1';

const ETRE = new Set(['est', 'sont', 'es', 'suis', 'sommes', 'êtes']);

/** La forme de base : le plus court des choix dont la bonne réponse part. */
function base(m) {
  const formes = (m.choix ?? []).map((c) => String(c.cle)).filter((f) => String(m.bonne).startsWith(f));
  return formes.sort((a, b) => a.length - b.length)[0] ?? String(m.bonne);
}

/** Qui commande l'accord, et ce qu'on en dit. */
function chef(m) {
  const autour = autourDuTrou(m.question);
  if (m.consigne === 'auxiliaire') {
    const sujet = autour ? autour[0].trim() : null;
    return {
      nom: sujet,
      role: 'sujet',
      dit: ETRE.has(m.bonne) ? 'un verbe de mouvement : auxiliaire être' : 'pas un mouvement : auxiliaire avoir',
    };
  }
  if (m.consigne === 'accord' && autour) {
    // Avec être : le sujet est tout ce qui vient avant l'auxiliaire.
    const sujet = autour[0].trim().split(/\s+/).slice(0, -1).join(' ');
    return { nom: sujet || null, role: 'sujet', dit: 'avec être, on accorde avec le sujet' };
  }
  // Avec avoir (CM2) : accordé seulement si le COD est placé avant.
  const avant = Object.values(m.pieges ?? {}).includes('avant-oubli');
  if (avant) return { nom: groupeDuDebut(m.question), role: 'COD placé avant', dit: 'avec avoir, on accorde avec le COD placé avant' };
  return { nom: null, role: 'avoir', dit: 'avec avoir, et rien d’accordé avant : pas d’accord' };
}

/** Le participe, ses lettres ajoutées allumées. */
function Participe({ m }) {
  const b = base(m);
  const ajout = String(m.bonne).slice(b.length);
  if (m.consigne === 'auxiliaire' || !ajout) return <strong className={`${CLE}__forme`}>{m.bonne}</strong>;
  return (
    <strong className={`${CLE}__forme`}>
      {b}
      {ajout.split('').map((l, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`${CLE}__lettre`} style={{ '--i': i }}>{l}</span>
      ))}
    </strong>
  );
}

/** Ce que disent les lettres allumées. */
function Lettres({ m }) {
  const ajout = String(m.bonne).slice(base(m).length);
  if (m.consigne === 'auxiliaire' || !ajout) return null;
  return (
    <span className={`${CLE}__legende`}>
      {ajout.includes('e') && <span className={`${CLE}__puce ${CLE}__puce--e`}>e : féminin</span>}
      {ajout.includes('s') && <span className={`${CLE}__puce ${CLE}__puce--s`}>s : pluriel</span>}
    </span>
  );
}

/** Le train attelé, une fois la réponse donnée. */
function TrainAttele({ m }) {
  const c = chef(m);
  return (
    <div className={`${CLE}__voie`}>
      <div className={`${CLE}__train`}>
        <span className={`${CLE}__locomotive`}>
          <span className={`${CLE}__fumee`} aria-hidden="true"><span /><span /><span /></span>
          <span className={`${CLE}__cabine`} aria-hidden="true" />
          <span className={`${CLE}__plaque`}>
            <span className={`${CLE}__role`}>{c.role}</span>
            {c.nom ? <strong>{c.nom}</strong> : <strong>pas d’accord</strong>}
          </span>
          <span className={`${CLE}__roues`} aria-hidden="true"><span /><span /><span /></span>
        </span>
        <span className={`${CLE}__attelage`} aria-hidden="true" />
        <span className={`${CLE}__wagon-attele`}>
          <Participe m={m} />
          <span className={`${CLE}__roues`} aria-hidden="true"><span /><span /></span>
        </span>
      </div>
      <p className={`${CLE}__regle`}>
        {c.dit}
        <Lettres m={m} />
      </p>
    </div>
  );
}

export function QuestionPasseCompose({ m, termine }) {
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <div className={`${CLE}__tableau`}>
        <span className={`${CLE}__horloge`} aria-hidden="true"><span /></span>
        <span className={`${CLE}__entete`} aria-hidden="true">DÉPART</span>
        <p className={`${CLE}__affiche`}>
          <PhraseATrou texte={m.question} mot={termine ? m.bonne : null} classeTrou={`${CLE}__trou`} />
        </p>
      </div>
      {termine && <TrainAttele m={m} />}
    </div>
  );
}

/** Les wagons en attente sur la voie. */
export function WagonsSurLaVoie({ choix, fautes, choisir }) {
  return (
    <div className={`${CLE}__quai`}>
      <ul className={`${CLE}__wagons`} aria-label="Choisis ton wagon">
        {choix.map(({ cle, libelle }, i) => {
          const faux = fautes.includes(cle);
          return (
            <li key={cle} style={{ '--i': i }}>
              <button
                type="button"
                className={`${CLE}__wagon ${CLE}__wagon--${i % 3}${faux ? ' est-fausse' : ''}`}
                onClick={() => choisir(cle)}
                disabled={faux}
              >
                {libelle}
                <span className={`${CLE}__roues`} aria-hidden="true"><span /><span /></span>
              </button>
            </li>
          );
        })}
      </ul>
      <span className={`${CLE}__rails`} aria-hidden="true" />
    </div>
  );
}

const scene = {
  question: (m, termine) => <QuestionPasseCompose m={m} termine={termine} />,
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <WagonsSurLaVoie choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
