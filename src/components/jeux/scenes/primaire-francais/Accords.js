import { decouper } from '../../../../lib/jeux/complementsCM1';
import {
  autourDuTrou, BoutonGlissable, DessinDuFil, groupeDuDebut, Trou, useFil,
} from './outils';

/**
 * L'ADJECTIF S'ÉLOIGNE (CM1) — L'ATTRIBUT DU SUJET (CM2) : LE SENTIER DES
 * ACCORDS (09/10/2026). La couverture du CM1 : un sentier de village, des
 * empreintes lumineuses qui partent d'un « ADJECTIF » et filent vers un
 * panneau « NOM ». La scène la reprend :
 *   - LA QUESTION : la phrase posée sur des planches de bois, au bord du
 *     sentier ; le trou attend son mot. Au CM2, le groupe à reconnaître reste
 *     surligné, et une étiquette vide pend au-dessus de lui ;
 *   - LES RÉPONSES : des étiquettes de carton à œillet, qu'on GLISSE dans le
 *     trou (ou sur le groupe) — ou qu'on touche, tout simplement ;
 *   - APRÈS LA RÉPONSE : le mot se pose dans le trou, un panneau « NOM » se
 *     plante sur le nom décrit, et des empreintes lumineuses vont de l'un à
 *     l'autre : c'est AVEC CE NOM-LÀ qu'on accorde, pas avec le plus proche.
 *     Au CM2, l'étiquette de la fonction s'accroche au groupe, et le test se
 *     montre (sujet = attribut ; « quoi ? » pour le COD ; « où ? » pour le
 *     complément circonstanciel).
 */

const CLE = 'sc-accords-cm1';

/** Le nom décrit : le groupe du début de phrase, avec son déterminant. */
function PhraseAccord({ m, termine }) {
  const autour = autourDuTrou(m.question);
  const nom = groupeDuDebut(m.question);
  const [conteneur, fil] = useFil(termine && Boolean(autour && nom), `.${CLE} .sc-primaire-francais__trou`, `.${CLE}__nom`);
  if (!autour) return <p className={`phrase-a-trou ${CLE}__planches`}>{m.question}</p>;
  // Le nom est au début de la phrase : on l'enveloppe, sans toucher au texte.
  const debut = nom && autour[0].startsWith(nom) ? nom : null;
  return (
    <div className={`${CLE}__sentier`} ref={conteneur}>
      <p className={`phrase-a-trou ${CLE}__planches`}>
        {debut ? (
          <span className={`${CLE}__nom${termine ? ' est-montre' : ''}`}>
            {termine && <span className={`${CLE}__panneau-nom`} data-texte="NOM" aria-hidden="true" />}
            {debut}
          </span>
        ) : null}
        {debut ? autour[0].slice(debut.length) : autour[0]}
        <Trou mot={termine ? m.bonne : null} className={`${CLE}__cible`} />
        {autour[1]}
      </p>
      <DessinDuFil fil={fil} className={`${CLE}__pas`} />
      {termine && debut && (
        <p className={`${CLE}__explique`}>
          <strong>{m.bonne}</strong>
          {' décrit « '}
          <strong>{debut}</strong>
          {' » : il s’accorde avec ce nom.'}
        </p>
      )}
    </div>
  );
}

/** Le test de la fonction, au CM2 : ce que l'enfant aurait pu se demander. */
function Test({ m, avant, groupe }) {
  const sujet = groupeDuDebut(avant);
  if (m.bonne === 'attribut' && sujet) {
    return (
      <p className={`${CLE}__explique`}>
        <strong>{sujet}</strong>
        <span className={`${CLE}__egal`} aria-hidden="true"> = </span>
        <strong>{groupe}</strong>
        {' : le groupe dit comment est le sujet.'}
      </p>
    );
  }
  if (m.bonne === 'cod') {
    return (
      <p className={`${CLE}__explique`}>
        {`${avant.trim()} quoi ? → `}
        <strong>{groupe}</strong>
      </p>
    );
  }
  return (
    <p className={`${CLE}__explique`}>
      {'Où ? → '}
      <strong>{groupe}</strong>
      {' : il ne décrit pas le sujet.'}
    </p>
  );
}

function PhraseFonction({ m, termine }) {
  const [avant, groupe, apres] = decouper(m.phrase);
  const etiquette = (m.choix ?? []).find((c) => c.cle === m.bonne)?.libelle;
  return (
    <div className={`${CLE}__sentier`}>
      <p className={`phrase-a-trou ${CLE}__planches`}>
        {avant}
        <span className={`${CLE}__groupe`}>
          {/* L'étiquette s'écrit par le CSS (`data-texte`) : le texte de la phrase reste celui de la question. */}
          <span
            className={`${CLE}__etiquette-vide${termine ? ' est-accrochee' : ''} ${CLE}__cible`}
            data-texte={termine ? etiquette : '?'}
            aria-hidden="true"
          />
          <mark className="surligne">{groupe}</mark>
        </span>
        {apres}
      </p>
      {termine && <Test m={m} avant={avant} groupe={groupe} />}
    </div>
  );
}

export function QuestionAccords({ m, termine }) {
  const reconnaitre = Boolean(m.phrase && m.phrase.includes('['));
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <span className={`${CLE}__lanterne`} aria-hidden="true" />
      {reconnaitre ? <PhraseFonction m={m} termine={termine} /> : <PhraseAccord m={m} termine={termine} />}
    </div>
  );
}

/** Les étiquettes de carton : à glisser vers la cible, ou à toucher. */
export function EtiquettesAccords({ choix, fautes, choisir }) {
  return (
    <ul className={`${CLE}__etiquettes`} aria-label="Choisis ta réponse — glisse l’étiquette ou touche-la">
      {choix.map(({ cle, libelle }, i) => {
        const faux = fautes.includes(cle);
        return (
          <li key={cle} style={{ '--i': i }}>
            <BoutonGlissable
              cible={`.${CLE}__cible`}
              choisir={() => choisir(cle)}
              disabled={faux}
              className={`${CLE}__etiquette${faux ? ' est-fausse' : ''}`}
            >
              {libelle}
            </BoutonGlissable>
          </li>
        );
      })}
    </ul>
  );
}

const scene = {
  question: (m, termine) => <QuestionAccords m={m} termine={termine} />,
  // Le mot posé dans le trou, ou l'étiquette accrochée au groupe : la réponse est dans la scène.
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <EtiquettesAccords choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
