import { autourDuTrou, PhraseATrou } from './outils';

/**
 * CE, SE, CES, SES, LA, LÀ (CM1) — OU, OÙ, LEUR, QUEL (CM2) : LES MOTS-BULLES
 * (09/10/2026). Les deux couvertures montrent les mots eux-mêmes, gonflés
 * comme des bulles de couleur, qui flottent dans le ciel d'un village au bord
 * de la mer. La scène :
 *   - LA QUESTION : la phrase sur une plaque de pierre du muret, et son trou ;
 *   - LES RÉPONSES : les mots-bulles qui DÉRIVENT lentement dans le ciel —
 *     on en ATTRAPE un en le touchant. Lents, en boucle, et cliquables
 *     partout : on ne rate jamais une bulle faute d'être rapide (immobiles si
 *     l'enfant a demandé moins d'animations). La fausse éclate et se barre ;
 *   - APRÈS LA RÉPONSE : le mot tombe dans le trou, et LE TRUC DU JEU se fait
 *     sous nos yeux — on remplace (là → ici, l'a → l'avait, ou → ou bien,
 *     qu'elle → qu'il) et la phrase tient ; ou bien on montre ce qui décide
 *     (un nom après « ce », plusieurs choses à eux pour « leurs »…).
 */

const CLE = 'sc-homophones-cm1';

/** Chaque mot garde sa couleur d'une manche à l'autre, comme sur les couvertures. */
const COULEURS = {
  ce: 'bleu', se: 'orange', ces: 'rose', ses: 'vert', la: 'violet', là: 'jaune', 'l’a': 'turquoise',
  ou: 'bleu', où: 'jaune', leur: 'rose', leurs: 'vert', quel: 'vert', quelle: 'violet', 'qu’elle': 'orange',
};
const couleurDe = (mot) => COULEURS[String(mot).toLowerCase()] ?? 'bleu';

/**
 * LE TRUC DE LA BONNE RÉPONSE : un mot qu'on peut mettre à la place (et la
 * phrase récrite), ou une phrase qui dit ce qui décide.
 */
const TRUCS = {
  ce: { dit: 'Un nom juste après : ce montre, comme « ce … -là ».' },
  se: { remplace: 'me', dit: 'Un verbe juste après : on peut dire « je me… ».', personne: true },
  ces: { dit: 'On montre du doigt : ces …-là.' },
  ses: { dit: 'Ce sont les siens, à lui ou à elle.' },
  la: { dit: 'Devant un nom, ou à la place d’un nom féminin.' },
  là: { remplace: 'ici', dit: 'On dit où : on pourrait dire « ici ».' },
  'l’a': { remplace: 'l’avait', dit: 'On pourrait dire « l’avait ».' },
  ou: { remplace: 'ou bien', dit: 'On pourrait dire « ou bien ».' },
  où: { dit: 'Un lieu, ou la question « où ? » : avec un accent.' },
  leur: { dit: 'Devant un verbe, « leur » veut dire « lui » : jamais de s.' },
  leurs: { dit: 'Plusieurs choses à eux : leurs prend un s.' },
  quel: { dit: 'Il va avec un nom masculin.' },
  quelle: { dit: 'Il va avec un nom féminin.' },
  'qu’elle': { remplace: 'qu’il', dit: 'On pourrait dire « qu’il ».' },
};

/** La phrase récrite avec le mot qu'on peut mettre à la place ; null si ce n'est pas le bon truc ici. */
function recrite(question, truc) {
  const autour = autourDuTrou(question);
  if (!autour || !truc?.remplace || truc.personne) return null;
  const debut = !autour[0].trim();
  const mot = debut ? truc.remplace[0].toUpperCase() + truc.remplace.slice(1) : truc.remplace;
  return [autour[0], mot, autour[1]];
}

export function QuestionHomophones({ m, termine }) {
  const truc = TRUCS[String(m.bonne).toLowerCase()];
  const autre = termine ? recrite(m.question, truc) : null;
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <span className={`${CLE}__mouette`} aria-hidden="true" />
      <p className={`phrase-a-trou ${CLE}__plaque`}>
        <PhraseATrou texte={m.question} mot={termine ? m.bonne : null} classeTrou={`${CLE}__trou ${CLE}__trou--${couleurDe(m.bonne)}`} />
      </p>
      {termine && truc && (
        <div className={`${CLE}__truc`}>
          <span className={`${CLE}__ampoule`} aria-hidden="true">💡</span>
          <span className={`${CLE}__truc-texte`}>
            <strong className={`${CLE}__mot-truc ${CLE}__teinte--${couleurDe(m.bonne)}`}>{m.bonne}</strong>
            {` : ${truc.dit}`}
            {autre && (
              <span className={`${CLE}__recrite`}>
                {autre[0]}
                <em>{autre[1]}</em>
                {autre[2]}
                <span aria-hidden="true"> ✔</span>
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/** Le ciel : chaque bulle dérive dans son couloir, lentement ; on l'attrape en la touchant. */
export function BullesDansLeCiel({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__ciel`} aria-label="Attrape le bon mot">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} className={`${CLE}__couloir`} style={{ '--i': i, '--n': choix.length }}>
            <button
              type="button"
              className={`${CLE}__bulle ${CLE}__teinte--${couleurDe(cle)}${faux ? ' est-fausse' : ''}`}
              onClick={() => choisir(cle)}
              disabled={faux}
            >
              <span className={`${CLE}__reflet`} aria-hidden="true" />
              {libelle}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionHomophones m={m} termine={termine} />,
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <BullesDansLeCiel choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
