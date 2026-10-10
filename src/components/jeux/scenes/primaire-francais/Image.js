import { chercherMot } from './outils';

/**
 * COMME UNE IMAGE (CM1) — SENS PROPRE, SENS FIGURÉ (CM2) : LE VISEUR DU POÈTE
 * (09/10/2026). La couverture du CM1 : un garçon cadre le coucher de soleil
 * avec ses doigts, des panneaux « Observe, Ressens, Imagine » ; celle du CM2,
 * une goutte d'eau qui tombe dans un lac, « les mots ont parfois deux vies ».
 * La scène :
 *   - LA QUESTION : le vers dans le viseur d'un appareil photo (coins qui font
 *     la mise au point, point rouge qui clignote), et, en petites vignettes,
 *     ce que le vers met en scène (des yeux, des étoiles…) ;
 *   - LES RÉPONSES : des photos suspendues à un fil par des pinces à linge,
 *     qui se balancent ; la fausse se froisse et se barre ;
 *   - APRÈS LA RÉPONSE : la photo se DÉVELOPPE. Pour une image, deux tirages :
 *     « au pied de la lettre » (barré, avec un tampon) contre « ce que veut
 *     dire l'image » ; pour le mot-outil, il s'allume dans le vers et relie,
 *     comme un pont, les deux choses comparées ; pour sens propre ou figuré, le
 *     mot glisse du côté de la vraie chose ou du côté de l'image.
 */

const CLE = 'sc-comme-une-image';

/** Les choses que les vers mettent en scène, en vignettes. */
const VIGNETTES = [
  ['yeux', '👀'], ['étoiles', '✨'], ['lune', '🌙'], ['ballon', '🎈'], ['toit', '🏠'], ['vent', '🌬️'],
  ['loup', '🐺'], ['nuit', '🌃'], ['neige', '❄️'], ['manteau', '🧥'], ['ville', '🏙️'], ['soleil', '☀️'],
  ['orange', '🍊'], ['mer', '🌊'], ['cœur', '❤️'], ['oiseau', '🐦'], ['rivière', '🏞️'], ['pierres', '🪨'],
  ['chante', '🎵'], ['arbres', '🌳'], ['géants', '🗿'], ['forêt', '🌲'], ['miroir', '🪞'], ['bague', '💍'],
  ['or', '🪙'], ['corde', '🪢'], ['cordes', '🌧️'], ['feu', '🔥'], ['brûle', '🔥'], ['mule', '🐴'],
  ['lac', '🧊'], ['glace', '🧊'], ['public', '👥'], ['poil', '🖐️'], ['pommes', '🍎'], ['nuages', '☁️'],
  ['pâte', '🥖'], ['chat', '🐱'], ['langue', '👅'], ['main', '✋'], ['tête', '🙂'], ['puits', '🪣'],
];

function vignettesDe(texte) {
  const vues = [];
  VIGNETTES.forEach(([mot, dessin]) => {
    if (vues.length < 4 && chercherMot(texte, mot) >= 0 && !vues.some((v) => v.dessin === dessin)) vues.push({ mot, dessin });
  });
  return vues;
}

/** Le vers ; une fois trouvé, le mot-outil s'allume (le texte ne change pas). */
function Vers({ texte, outil }) {
  const i = outil ? chercherMot(texte, outil) : -1;
  if (i < 0) return texte;
  return (
    <>
      <span className={`${CLE}__compare`}>{texte.slice(0, i)}</span>
      <span className={`${CLE}__outil`}>{texte.slice(i, i + outil.length)}</span>
      <span className={`${CLE}__compare`}>{texte.slice(i + outil.length)}</span>
    </>
  );
}

/** Les deux tirages, après une image ou une expression : la lettre, barrée ; le sens, développé. */
function DeuxTirages({ m }) {
  const lettre = Object.entries(m.pieges ?? {}).find(([, sens]) => /lettre/.test(sens))?.[0];
  return (
    <div className={`${CLE}__tirages`}>
      {lettre && (
        <figure className={`${CLE}__tirage ${CLE}__tirage--lettre`}>
          <span className={`${CLE}__tirage-titre`}>Au pied de la lettre</span>
          <span className={`${CLE}__tirage-texte`}>{lettre}</span>
          <span className={`${CLE}__tampon`} aria-hidden="true">NON !</span>
        </figure>
      )}
      <figure className={`${CLE}__tirage ${CLE}__tirage--sens`}>
        <span className={`${CLE}__tirage-titre`}>Ce que veut dire l’image</span>
        <span className={`${CLE}__tirage-texte`}>{m.bonne}</span>
      </figure>
    </div>
  );
}

/** Sens propre ou figuré : le mot glisse vers la vraie chose, ou vers l'image. */
function Balance({ m }) {
  const mot = String(m.question).match(/Le mot « ([^»]+) »/)?.[1]?.trim();
  return (
    <div className={`${CLE}__balance ${CLE}__balance--${m.bonne === 'figure' ? 'figure' : 'propre'}`}>
      <span className={`${CLE}__cote ${CLE}__cote--propre`}>
        <span aria-hidden="true">📦 </span>
        sens propre : la vraie chose
      </span>
      {mot && <strong className={`${CLE}__mot-qui-glisse`}>{mot}</strong>}
      <span className={`${CLE}__cote ${CLE}__cote--figure`}>
        <span aria-hidden="true">✨ </span>
        sens figuré : une image
      </span>
    </div>
  );
}

export function QuestionImage({ m, termine }) {
  const texte = String(m.question ?? '');
  const vignettes = vignettesDe(texte);
  return (
    <div className={`${CLE}${termine ? ' est-termine' : ''}`}>
      <div className={`${CLE}__viseur`}>
        <span className={`${CLE}__coin ${CLE}__coin--hg`} aria-hidden="true" />
        <span className={`${CLE}__coin ${CLE}__coin--hd`} aria-hidden="true" />
        <span className={`${CLE}__coin ${CLE}__coin--bg`} aria-hidden="true" />
        <span className={`${CLE}__coin ${CLE}__coin--bd`} aria-hidden="true" />
        <span className={`${CLE}__rec`} aria-hidden="true">REC</span>
        <p className={`${CLE}__vers`}>
          <Vers texte={texte} outil={termine && m.consigne === 'outil' ? m.bonne : null} />
        </p>
        {vignettes.length > 0 && (
          <span className={`${CLE}__vignettes`} aria-hidden="true">
            {vignettes.map((v, i) => <span key={v.mot} style={{ '--i': i }}>{v.dessin}</span>)}
          </span>
        )}
      </div>
      {termine && m.consigne === 'outil' && (
        <p className={`${CLE}__pont`}>
          <strong>{m.bonne}</strong>
          {' relie les deux choses comparées, comme un pont.'}
        </p>
      )}
      {termine && m.consigne === 'emploi' && <Balance m={m} />}
      {termine && (m.consigne === 'sens' || m.consigne === 'expression') && <DeuxTirages m={m} />}
    </div>
  );
}

/** Les photos sur le fil : une pince à linge, un balancement, la réponse écrite sur le tirage. */
export function PhotosSurLeFil({ choix, fautes, choisir }) {
  return (
    <div className={`${CLE}__corde`}>
      <ul className={`${CLE}__photos`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => {
          const faux = fautes.includes(cle);
          return (
            <li key={cle} className={`${CLE}__photo-place`} style={{ '--i': i }}>
              <span className={`${CLE}__pince`} aria-hidden="true" />
              <button
                type="button"
                className={`${CLE}__photo${faux ? ' est-fausse' : ''}`}
                onClick={() => choisir(cle)}
                disabled={faux}
              >
                {libelle}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const scene = {
  question: (m, termine) => <QuestionImage m={m} termine={termine} />,
  apres: () => null,
  choix: ({ choix, fautes, choisir }) => <PhotosSurLeFil choix={choix} fautes={fautes} choisir={choisir} />,
};

export default scene;
