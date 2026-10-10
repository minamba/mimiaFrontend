import { BoutonsChoix, libelleBon, useDeroule } from './commun';

/**
 * LE BUREAU DE VERRE — « L'écrit professionnel » (terminale
 * professionnelle). La couverture : un bureau moderne baigné de lumière, des
 * colonnes lumineuses turquoise et or, un écran de verre sur la table. La
 * scène la reprend :
 *   - LA QUESTION : la consigne de la situation sur un pense-bête collé à
 *     l'écran ; dessous, un courriel en cours d'écriture : objet, formule
 *     d'appel, message, formule de politesse, signature. La ligne à écrire
 *     clignote — c'est la sorte de manche qui la désigne, pas la réponse ;
 *   - LES RÉPONSES : des brouillons (`choix`), chacun avec son bouton
 *     « insérer » : on insère le bon dans le courriel ;
 *   - APRÈS LA RÉPONSE : le bon texte S'ÉCRIT dans le courriel, lettre après
 *     lettre, à sa place ; ce qu'on n'écrit pas est barré de rouge et chassé
 *     du message ; la structure s'allume partie par partie, dans l'ordre.
 * Avant la réponse, la ligne reste vide, avec son curseur.
 */

const P = 'sc-ecrit-professionnel';

/** La ligne du courriel où va la réponse, selon la manche. */
const PLACES = {
  objet: 'objet', appel: 'appel', politesse: 'politesse', registre: 'message', 'a-eviter': 'message', structure: null,
};

/** Une question de structure vise une partie (la signature, l'objet, le message) ou leur ordre. */
function placeDe(m) {
  if (m.consigne !== 'structure') return PLACES[m.consigne] ?? null;
  if (/ordre|où se place/i.test(m.question)) return null;
  if (/signature/i.test(m.question)) return 'signature';
  return 'message';
}

const PARTIES = [
  ['objet', 'Objet'],
  ['appel', 'Formule d’appel'],
  ['message', 'Message'],
  ['politesse', 'Formule de politesse'],
  ['signature', 'Signature'],
];

/** Le texte qui s'écrit, lettre après lettre. */
function Frappe({ texte }) {
  const n = useDeroule(texte.length, 28);
  return (
    <span className={`${P}__frappe`}>
      {texte.slice(0, n)}
      {n < texte.length && <span className={`${P}__curseur`} aria-hidden="true" />}
    </span>
  );
}

/** Une ligne du courriel : vide (lignes grises), à écrire (curseur), ou écrite. */
function Ligne({
  partie, nom, ici, termine, m,
}) {
  let contenu;
  if (ici && termine) {
    contenu = m.consigne === 'a-eviter'
      ? <span className={`${P}__chasse`}>{libelleBon(m)}</span>
      : <Frappe texte={libelleBon(m)} />;
  } else if (ici) {
    contenu = <span className={`${P}__curseur`} aria-hidden="true" />;
  } else {
    contenu = <span className={`${P}__gris`} aria-hidden="true" />;
  }
  return (
    <div className={`${P}__ligne ${P}__ligne--${partie}${ici ? ` ${P}__ligne--ici` : ''}`}>
      <span className={`${P}__champ`} aria-hidden="true" data-nom={nom} />
      {contenu}
    </div>
  );
}

export function QuestionEcrit({ m, termine }) {
  const place = placeDe(m);
  const structure = m.consigne === 'structure' && place === null;
  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <div className={`${P}__ecran`}>
        <div className={`${P}__barre`} aria-hidden="true">
          <span />
          <span />
          <span />
          <em>Nouveau message</em>
        </div>
        <div className={`${P}__corps`}>
          <div className={`${P}__pense-bete`}>
            <p className={`${P}__texte`}>{m.question}</p>
          </div>
          <div className={`${P}__courriel${structure && termine ? ` ${P}__courriel--structure` : ''}`}>
            {PARTIES.map(([partie, nom], i) => (
              <div key={partie} style={{ '--k': i }} className={`${P}__partie`}>
                <Ligne partie={partie} nom={nom} ici={partie === place} termine={termine} m={m} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {termine && (structure || m.consigne === 'a-eviter') && (
        <div className={`${P}__bilan`} role="status">
          {m.consigne === 'a-eviter'
            ? <span className={`${P}__dit`}>{`À ne jamais écrire : ${libelleBon(m).charAt(0).toLowerCase()}${libelleBon(m).slice(1)}.`}</span>
            : <strong className={`${P}__dit`}>{libelleBon(m)}</strong>}
        </div>
      )}
    </div>
  );
}

/** Les brouillons : on insère le bon dans le courriel. */
export function ChoixEcrit({ choix, fautes, choisir }) {
  return (
    <BoutonsChoix
      p={P}
      choix={choix}
      fautes={fautes}
      choisir={choisir}
      etiquette="Insère le bon brouillon dans le courriel"
      deco={(c, i, faux) => <span className={`${P}__inserer`} aria-hidden="true">{faux ? '✗' : '+'}</span>}
    />
  );
}
