import {
  DEFINITIONS, EFFETS, EXEMPLES, FIGURES,
} from '../../../../lib/jeux/lycee/figures-de-style-lycee';
import { Lignes, libelleBon, surligner } from './commun';

/**
 * LE BEFFROI DES DEUX FONTAINES — « Les figures de style » (2de). La
 * couverture : un palais de cloches, une fontaine de feu à gauche, une
 * fontaine de glace à droite, et leurs reflets qui se mêlent sur le sol. La
 * scène la reprend :
 *   - LA QUESTION : la phrase gravée sur une plaque de marbre, sous la grande
 *     cloche, entre le feu et la glace ;
 *   - LES RÉPONSES : des cloches de bronze qui se balancent (`objets`) ;
 *   - APRÈS LA RÉPONSE : la grande cloche sonne, la figure s'inscrit dessous
 *     avec sa définition, et la phrase S'ALLUME là où la figure travaille :
 *     les deux termes opposés en feu et en glace, l'outil de la comparaison
 *     en or, les mots répétés de l'anaphore, les marches de la gradation…
 * Avant la réponse, la phrase reste nue : surligner, ce serait nommer.
 */

const P = 'sc-figures-de-style-lycee';

/**
 * CE QUI FAIT LA FIGURE, DANS CHAQUE PHRASE DU MODULE — écrit à la main.
 * Rôles : feu / glace (les deux pôles), outil (comme, tel…), repete,
 * m1 → m3 (les marches de la gradation), force (l'exagération), nie (la
 * négation de la litote), doux (l'adoucissement), lien (la métonymie),
 * detour (la périphrase), chose / humain (la personnification), idee /
 * attribut (l'allégorie).
 */
export const TRAVAIL = {
  'Je vis, je meurs ; je me brûle et me noie.': [['vis', 'feu'], ['meurs', 'glace'], ['brûle', 'feu'], ['noie', 'glace']],
  'Hier, il possédait un château ; aujourd’hui, il dort sous les ponts.': [['possédait un château', 'feu'], ['dort sous les ponts', 'glace']],
  'Tout le monde le connaît, personne ne l’aime.': [['Tout le monde', 'feu'], ['personne', 'glace']],
  'Le jour, la place est pleine de cris ; la nuit, elle est vide et silencieuse.': [['Le jour', 'feu'], ['pleine de cris', 'feu'], ['la nuit', 'glace'], ['vide et silencieuse', 'glace']],

  'Cette obscure clarté qui tombe des étoiles': [['obscure', 'glace'], ['clarté', 'feu']],
  'Un silence assourdissant suivit l’annonce des résultats.': [['silence', 'glace'], ['assourdissant', 'feu']],
  'Le prix fut remis à un illustre inconnu.': [['illustre', 'feu'], ['inconnu', 'glace']],
  'Elle le quitta avec une douce cruauté.': [['douce', 'feu'], ['cruauté', 'glace']],

  'Il faut manger pour vivre, et non pas vivre pour manger.': [['manger', 'feu'], ['vivre', 'glace'], ['vivre', 'glace'], ['manger', 'feu']],
  'Il était doux avec les faibles, avec les forts il était dur.': [['doux', 'feu'], ['avec les faibles', 'glace'], ['avec les forts', 'glace'], ['dur', 'feu']],
  'Elle partit à l’aube, au crépuscule elle revint.': [['partit', 'feu'], ['à l’aube', 'glace'], ['au crépuscule', 'glace'], ['revint', 'feu']],
  'Ils travaillent pour vivre ; d’autres vivent pour travailler.': [['travaillent', 'feu'], ['vivre', 'glace'], ['vivent', 'glace'], ['travailler', 'feu']],

  'Je te l’ai répété cent fois !': [['cent fois', 'force']],
  'Elle versa des torrents de larmes.': [['des torrents de larmes', 'force']],
  'Ce sac pèse une tonne.': [['une tonne', 'force']],
  'J’ai attendu une éternité devant ce guichet.': [['une éternité', 'force']],

  'Va, je ne te hais point.': [['ne te hais point', 'nie']],
  'Ton gâteau n’est pas mauvais du tout.': [['n’est pas mauvais du tout', 'nie']],
  'Ce n’était pas une mince affaire.': [['n’était pas une mince affaire', 'nie']],
  'Je ne suis pas mécontent de ce résultat.': [['ne suis pas mécontent', 'nie']],
  'Il n’est pas bête, ce garçon.': [['n’est pas bête', 'nie']],

  'Il nous a quittés l’hiver dernier.': [['nous a quittés', 'doux']],
  'Elle s’est éteinte paisiblement dans son sommeil.': [['s’est éteinte paisiblement', 'doux']],
  'Après trois ans de service, il a été remercié.': [['a été remercié', 'doux']],
  'L’entreprise s’est séparée de deux cents salariés.': [['s’est séparée de', 'doux']],

  'Rome, l’unique objet de mon ressentiment !\nRome, à qui vient ton bras d’immoler mon amant !': [['Rome', 'repete'], ['Rome', 'repete']],
  'Mon bras qu’avec respect toute l’Espagne admire,\nMon bras, qui tant de fois a sauvé cet empire,': [['Mon bras', 'repete'], ['Mon bras', 'repete']],
  'Il faut lire pour comprendre, il faut lire pour douter, il faut lire pour rêver.': [['Il faut lire pour', 'repete'], ['il faut lire pour', 'repete'], ['il faut lire pour', 'repete']],
  'Ici, on travaille ; ici, on partage ; ici, on apprend.': [['Ici', 'repete'], ['ici', 'repete'], ['ici', 'repete']],

  'Va, cours, vole, et nous venge.': [['Va', 'm1'], ['cours', 'm2'], ['vole', 'm3']],
  'La rumeur enfla : d’abord un murmure, bientôt des cris, enfin une clameur.': [['un murmure', 'm1'], ['des cris', 'm2'], ['une clameur', 'm3']],
  'Il marcha, courut, s’enfuit à toutes jambes.': [['marcha', 'm1'], ['courut', 'm2'], ['s’enfuit à toutes jambes', 'm3']],
  'C’est une faute, une trahison, un crime.': [['une faute', 'm1'], ['une trahison', 'm2'], ['un crime', 'm3']],

  'Ce soir, nous boirons un verre ensemble.': [['un verre', 'lien']],
  'Elle a lu tout Zola pendant l’été.': [['tout Zola', 'lien']],
  'Toute la salle applaudit le pianiste.': [['Toute la salle', 'lien']],
  'L’Élysée a démenti cette rumeur.': [['L’Élysée', 'lien']],

  'L’astre du jour se levait sur la plaine.': [['L’astre du jour', 'detour']],
  'Le roi des animaux dormait à l’ombre d’un arbre.': [['Le roi des animaux', 'detour']],
  'Il parle à merveille la langue de Shakespeare.': [['la langue de Shakespeare', 'detour']],
  'La Ville Lumière attire chaque année des millions de visiteurs.': [['La Ville Lumière', 'detour']],

  'Le vent hurlait contre les volets.': [['Le vent', 'chose'], ['hurlait', 'humain']],
  'La vieille horloge soupirait à chaque heure.': [['La vieille horloge', 'chose'], ['soupirait', 'humain']],
  'La ville s’éveillait lentement sous la pluie.': [['La ville', 'chose'], ['s’éveillait', 'humain']],
  'Les arbres tendaient leurs bras nus vers le ciel.': [['Les arbres', 'chose'], ['tendaient leurs bras nus', 'humain']],

  'La Mort, sa faux à la main, frappait à toutes les portes.': [['La Mort', 'idee'], ['sa faux à la main', 'attribut']],
  'La Justice, les yeux bandés, tenait sa balance d’une main ferme.': [['La Justice', 'idee'], ['les yeux bandés', 'attribut'], ['sa balance', 'attribut']],
  'La Renommée, trompette aux lèvres, annonçait partout sa victoire.': [['La Renommée', 'idee'], ['trompette aux lèvres', 'attribut']],
  'La Liberté, un drapeau à la main, guidait le peuple sur les barricades.': [['La Liberté', 'idee'], ['un drapeau à la main', 'attribut']],

  'La terre est bleue comme une orange': [['La terre', 'feu'], ['comme', 'outil'], ['une orange', 'glace']],
  'Le Poète est semblable au prince des nuées': [['Le Poète', 'feu'], ['semblable', 'outil'], ['prince des nuées', 'glace']],
  'Tel un fauve, il bondit sur son adversaire.': [['Tel', 'outil'], ['un fauve', 'glace'], ['il', 'feu']],
  'Ses yeux brillaient comme deux braises dans la nuit.': [['Ses yeux', 'feu'], ['comme', 'outil'], ['deux braises', 'glace']],

  'Ma jeunesse ne fut qu’un ténébreux orage': [['Ma jeunesse', 'feu'], ['ténébreux orage', 'glace']],
  'Cette faucille d’or dans le champ des étoiles': [['faucille d’or', 'glace'], ['champ des étoiles', 'glace']],
  'Pendant la finale, le stade était un chaudron.': [['le stade', 'feu'], ['un chaudron', 'glace']],
  'Sa colère était un volcan prêt à exploser.': [['Sa colère', 'feu'], ['un volcan', 'glace']],
};

/** Ce que montrent les couleurs, figure par figure : la légende sous la phrase. */
const LEGENDES = {
  antithese: 'En feu et en glace : les deux termes opposés, chacun dans son groupe.',
  oxymore: 'En feu et en glace : deux contraires collés dans le même groupe.',
  chiasme: 'A B B A : les mêmes idées reviennent en croix.',
  hyperbole: 'L’exagération, impossible à prendre au pied de la lettre.',
  litote: 'La négation qui dit moins pour faire entendre plus.',
  euphemisme: 'Les mots doux qui voilent une réalité pénible.',
  anaphore: 'Le même mot, en tête de chaque groupe.',
  gradation: 'Chaque marche monte d’un cran.',
  metonymie: 'Le mot mis pour une réalité voisine : le contenant, l’auteur, le lieu.',
  periphrase: 'Le détour : une expression à la place d’un seul mot.',
  personnification: 'Une chose (en bleu) qui agit comme un humain (en or).',
  allegorie: 'Une idée (en majuscule) qui prend corps, avec ses attributs.',
  comparaison: 'Le comparé, l’outil en or, le comparant.',
  metaphore: 'Le comparé et son image, sans outil de comparaison.',
};

const montrer = (phrase, source) => (source ? `« ${phrase} »\n— ${source}` : `« ${phrase} »`);

/** La figure d'une manche : la bonne réponse, ou celle nommée dans « Une litote : quel effet ? ». */
export function figureDe(m) {
  if (m.consigne !== 'effet') return FIGURES[m.bonne] ? m.bonne : null;
  const effet = EFFETS.find(([phrase, source]) => m.question.startsWith(montrer(phrase, source)));
  return effet?.[2] ?? null;
}

/** La phrase citée par la manche (ou, pour une définition, un exemple de la figure). */
function phraseDe(m, figure) {
  if (m.consigne === 'definition') {
    const exemples = EXEMPLES.filter(([, , f]) => f === figure);
    return exemples.find(([, source]) => source) ?? exemples[0] ?? null;
  }
  return EXEMPLES.find(([phrase, source]) => m.question.startsWith(montrer(phrase, source))) ?? null;
}

const classe = (role) => `${P}__marque ${P}__marque--${role}`;

/** Une ligne de la phrase, allumée là où la figure travaille. */
function allumer(ligne, travail) {
  return travail ? surligner(ligne, travail, classe) : ligne;
}

/** La grande cloche du beffroi : elle se balance, puis sonne une fois la réponse donnée. */
function GrandeCloche({ sonne }) {
  return (
    <div className={`${P}__beffroi${sonne ? ` ${P}__beffroi--sonne` : ''}`} aria-hidden="true">
      <span className={`${P}__fontaine ${P}__fontaine--feu`}>
        {Array.from({ length: 5 }, (_, i) => <span key={i} className={`${P}__jet`} style={{ '--n': i }} />)}
      </span>
      <svg className={`${P}__cloche`} viewBox="0 0 120 110" focusable="false">
        <defs>
          <linearGradient id={`${P}-bronze`} x1="0" x2="1">
            <stop offset="0" stopColor="#7a4a14" />
            <stop offset="0.35" stopColor="#e8b65a" />
            <stop offset="0.6" stopColor="#c48a2c" />
            <stop offset="1" stopColor="#6b3f10" />
          </linearGradient>
        </defs>
        <rect x="52" y="0" width="16" height="12" rx="4" fill="#5a3410" />
        <path d="M60 10 C 30 10, 28 40, 26 66 C 24 82, 14 88, 8 94 L 112 94 C 106 88, 96 82, 94 66 C 92 40, 90 10, 60 10 Z" fill={`url(#${P}-bronze)`} stroke="#5a3410" strokeWidth="2" />
        <path d="M14 90 L 106 90" stroke="#5a3410" strokeWidth="3" />
        <path d="M34 40 L 86 40" stroke="#fbe2a6" strokeWidth="2" opacity="0.6" />
        <circle className={`${P}__battant`} cx="60" cy="100" r="8" fill="#5a3410" />
      </svg>
      <span className={`${P}__fontaine ${P}__fontaine--glace`}>
        {Array.from({ length: 5 }, (_, i) => <span key={i} className={`${P}__jet`} style={{ '--n': i }} />)}
      </span>
      {sonne && [0, 1, 2].map((i) => <span key={`o${i}`} className={`${P}__onde`} style={{ '--n': i }} />)}
    </div>
  );
}

export function QuestionFigures({ m, termine }) {
  const figure = termine ? figureDe(m) : null;
  const citee = figure ? phraseDe(m, figure) : null;
  const travail = citee ? TRAVAIL[citee[0]] : null;
  // Les lignes de la question qui sont la phrase elle-même (pas la source, pas « quel effet ? »).
  const estPhrase = (l) => !/^— /.test(l) && !/: quel effet \?$/.test(l);

  return (
    <div className={`${P}${termine ? ` ${P}--termine` : ''}`}>
      <GrandeCloche sonne={termine} />
      {figure && (
        <div className={`${P}__inscription`} role="status">
          <strong className={`${P}__nom`}>{FIGURES[figure]}</strong>
          {m.consigne !== 'definition' && <span className={`${P}__definition`}>{DEFINITIONS[figure]}</span>}
        </div>
      )}
      <div className={`${P}__plaque${m.consigne === 'definition' ? ` ${P}__plaque--definition` : ''}`}>
        <Lignes
          texte={m.question}
          className={`${P}__texte`}
          classeLigne={`${P}__ligne`}
          rendreLigne={(l) => {
            if (/^— /.test(l)) return <span className={`${P}__source`}>{l}</span>;
            if (/: quel effet \?$/.test(l)) return <span className={`${P}__demande`}>{l}</span>;
            return m.consigne !== 'definition' && estPhrase(l) ? allumer(l, travail) : l;
          }}
        />
      </div>
      {/* Une définition se comprend mieux sur un exemple : celui du module, allumé. */}
      {figure && m.consigne === 'definition' && citee && (
        <div className={`${P}__plaque ${P}__plaque--exemple`}>
          <span className={`${P}__titre-exemple`}>Par exemple</span>
          <Lignes
            texte={montrer(citee[0], citee[1])}
            className={`${P}__texte`}
            classeLigne={`${P}__ligne`}
            rendreLigne={(l) => (/^— /.test(l) ? <span className={`${P}__source`}>{l}</span> : allumer(l, travail))}
          />
        </div>
      )}
      {figure && travail && <p className={`${P}__legende`}>{LEGENDES[figure]}</p>}
      {termine && m.consigne === 'effet' && (
        <p className={`${P}__effet`}>
          <span className={`${P}__fleche`} aria-hidden="true">➜</span>
          {libelleBon(m)}
        </p>
      )}
    </div>
  );
}
