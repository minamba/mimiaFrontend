import { Designe, decouper, majuscule } from './commun';

/**
 * LE JARDIN DES FONCTIONS — « COD ou COI ? » (6e). La couverture : un jardin à
 * l'italienne, une fontaine, des arches fleuries, des pétales qui volent. La
 * phrase est gravée sur une plaque de marbre au bord de la fontaine ; le
 * groupe entre crochets y est un massif encore en bouton.
 *   - LES RÉPONSES : des stèles de marbre couronnées de fleurs
 *     (`objets: 'sc-cod-ou-coi'`) ;
 *   - APRÈS LA RÉPONSE : le massif fleurit et on y plante l'écriteau de sa
 *     fonction ; dessous, LE TEST QUI TRANCHE est joué pour de vrai — la
 *     préposition du COI devient un petit pont, le complément circonstanciel
 *     se déplace et se supprime sous nos yeux, le sujet répond à « qui est-ce
 *     qui ? », l'attribut est relié au sujet par un signe égal.
 */

const P = 'sc-cod-ou-coi';

const NOMS = {
  sujet: 'Sujet',
  cod: 'COD',
  coi: 'COI',
  attribut: 'Attribut',
  cc: 'Complément circonstanciel',
};

/** Les petits mots qu'on peut écrire en minuscule quand ils ne commencent plus la phrase. */
const MOTS_COMMUNS = /^(il|elle|ils|elles|on|nous|vous|je|j’|tu|le|la|les|l’|un|une|des|mon|ma|mes|ton|ta|tes|son|sa|ses|ce|cet|cette|ces|chaque|notre|nos|leur|leurs)\b/i;
const minusculeDebut = (t) => (MOTS_COMMUNS.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

/** La phrase sans le groupe, puis avec le groupe déplacé : ce qu'on peut faire d'un complément circonstanciel. */
export function deplacerEtSupprimer(question) {
  const parts = decouper(question);
  const i = parts.findIndex((p) => p.designe);
  if (i < 0) return null;
  const groupe = parts[i].texte.trim();
  const avant = parts.slice(0, i).map((p) => p.texte).join('');
  const apres = parts.slice(i + 1).map((p) => p.texte).join('');
  const propre = (t) => t.replace(/\s+([.!?,])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  if (!avant.trim()) {
    // « [Chaque été], nous campons près du lac. » → en fin de phrase.
    const reste = propre(apres.replace(/^\s*,\s*/, ''));
    const fin = /[.!?…]$/.exec(reste);
    const corps = fin ? reste.slice(0, -1) : reste;
    return {
      deplace: `${majuscule(corps)} ${minusculeDebut(groupe)}${fin ? fin[0] : ''}`,
      supprime: majuscule(reste),
    };
  }
  // « Il joue [dans le jardin]. » → en tête de phrase.
  const corps = propre(`${avant} ${apres}`);
  return {
    deplace: `${majuscule(groupe)}, ${minusculeDebut(corps)}`,
    supprime: corps,
  };
}

/** La fontaine du jardin : la vasque, les jets d'eau qui retombent, les ronds dans l'eau. */
function Fontaine() {
  return (
    <svg className={`${P}__fontaine`} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <path className={`${P}__jet`} d="M60 30 C 44 14, 30 26, 26 52" />
      <path className={`${P}__jet`} d="M60 30 C 76 14, 90 26, 94 52" style={{ '--n': 1 }} />
      <path className={`${P}__jet`} d="M60 30 C 52 8, 40 14, 38 40" style={{ '--n': 2 }} />
      <path className={`${P}__jet`} d="M60 30 C 68 8, 80 14, 82 40" style={{ '--n': 3 }} />
      <ellipse cx="60" cy="32" rx="16" ry="5" fill="#e9e3d6" stroke="#a89f8a" />
      <rect x="55" y="34" width="10" height="44" fill="#ddd5c3" stroke="#a89f8a" />
      <path d="M8 84 Q60 70 112 84 L104 108 Q60 118 16 108 Z" fill="#e4dccb" stroke="#a89f8a" strokeWidth="1.5" />
      <ellipse cx="60" cy="86" rx="48" ry="9" fill="#7cc6e6" />
      <ellipse className={`${P}__rond`} cx="40" cy="86" rx="8" ry="2.4" />
      <ellipse className={`${P}__rond`} cx="80" cy="86" rx="8" ry="2.4" style={{ '--n': 1 }} />
      <g fill="#f783ac">
        <circle cx="14" cy="104" r="4" />
        <circle cx="106" cy="104" r="4" />
        <circle cx="22" cy="110" r="3" fill="#ffa94d" />
        <circle cx="98" cy="110" r="3" fill="#ffa94d" />
      </g>
    </svg>
  );
}

/** Ce que le test montre, une fois la réponse donnée. */
function LeTest({ m }) {
  const groupe = decouper(m.question).find((p) => p.designe)?.texte ?? '';
  const bonne = m.bonne;
  if (bonne === 'coi') {
    const r = /^(à|au|aux|de|du|des|d’|d')\s*(.*)$/i.exec(groupe);
    return (
      <p className={`${P}__test`}>
        <span className={`${P}__question-test`}>à qui ? à quoi ? de qui ? de quoi ?</span>
        <span className={`${P}__fleche`} aria-hidden="true">→</span>
        «
        {r ? <span className={`${P}__pont`} data-mot="préposition">{r[1]}</span> : null}
        {r ? ` ${r[2]}` : groupe}
        {' »'}
        <span className={`${P}__legende`}>La préposition, demandée par le verbe, fait le pont : c’est un COI.</span>
      </p>
    );
  }
  if (bonne === 'cod') {
    return (
      <p className={`${P}__test`}>
        <span className={`${P}__question-test`}>quoi ? qui ?</span>
        <span className={`${P}__fleche`} aria-hidden="true">→</span>
        {`« ${groupe} »`}
        <span className={`${P}__legende`}>Aucune préposition entre le verbe et lui : c’est un COD.</span>
      </p>
    );
  }
  if (bonne === 'cc') {
    const essai = deplacerEtSupprimer(m.question);
    if (!essai) return null;
    return (
      <div className={`${P}__test ${P}__test--cc`}>
        <p className={`${P}__essai`}>
          <span className={`${P}__question-test`}>Je le déplace</span>
          <span className={`${P}__glisse`}>{essai.deplace}</span>
        </p>
        <p className={`${P}__essai`}>
          <span className={`${P}__question-test`}>Je le supprime</span>
          <span className={`${P}__glisse`} style={{ '--n': 1 }}>{essai.supprime}</span>
        </p>
        <p className={`${P}__legende`}>Il se déplace, il se supprime : c’est un complément circonstanciel.</p>
      </div>
    );
  }
  if (bonne === 'attribut') {
    return (
      <p className={`${P}__test`}>
        <span className={`${P}__question-test`}>le sujet</span>
        <span className={`${P}__egal`} aria-hidden="true">=</span>
        {`« ${groupe} »`}
        <span className={`${P}__legende`}>Un verbe d’état relie le sujet à ce qu’il est : c’est un attribut du sujet.</span>
      </p>
    );
  }
  if (bonne === 'sujet') {
    return (
      <p className={`${P}__test`}>
        <span className={`${P}__question-test`}>Qui est-ce qui ? Qu’est-ce qui ?</span>
        <span className={`${P}__fleche`} aria-hidden="true">→</span>
        {`« ${groupe} »`}
        <span className={`${P}__legende`}>C’est lui qui fait l’action, et qui commande l’accord du verbe : c’est le sujet.</span>
      </p>
    );
  }
  return null;
}

export function QuestionCodCoi({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-fleuri' : ''}`}>
      <span className={`${P}__petales`} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ '--n': i }} />)}
      </span>
      <Fontaine />
      <div className={`${P}__allee`}>
        <div className={`${P}__plaque`}>
          <p className={`${P}__phrase`}>
            <Designe
              texte={m.question}
              classe={`${P}__massif`}
              apres={termine ? <span className={`${P}__ecriteau`} data-nom={NOMS[m.bonne] ?? ''} aria-hidden="true" /> : null}
            />
          </p>
        </div>
        {termine && (
          <div className={`${P}__verdict`} role="status">
            <LeTest m={m} />
          </div>
        )}
      </div>
    </div>
  );
}
