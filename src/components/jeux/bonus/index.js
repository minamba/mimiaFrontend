import OperationsATrous from './OperationsATrous';
import MotsCaches from './MotsCaches';
import Paires from './Paires';
import { DevineLaPhrase, DevineLeMot } from './Devinettes';
import Puzzle from './Puzzle';
import MotDePasse from './MotDePasse';
import Drapeaux from './Drapeaux';
import Morpion from './Morpion';
import Echecs from './Echecs';
import MotSecret from './MotSecret';
import Planetes from './Planetes';
import { IMAGES_BONUS } from '../../../lib/jeux/imagesBonus';
import { IMAGES_HISTOIRE_GEO } from '../../../lib/jeux/imagesHistoireGeo';
import { ECRANS as ECRANS_HISTOIRE, APERCUS as APERCUS_HISTOIRE } from './histoire';
import { JeuBonusCourant } from './CadreBonus';
import { ECRANS as ECRANS_GEO, APERCUS as APERCUS_GEO } from './geo';

/**
 * LE DÉCOR PEINT DE CHAQUE JEU (09/10/2026, `imagesBonus.js`) : posé en
 * variable CSS (`--fond-bonus`) par une enveloppe `display: contents`, qui
 * ne change rien à la mise en page. L'écran de fin garde son propre fond.
 */
const avecDecor = (cle, Ecran) => {
  const fond = IMAGES_BONUS[cle]?.fond ?? IMAGES_HISTOIRE_GEO.fonds[cle.replace(/^bonus-/, '')];
  // La clé du jeu descend jusqu'à l'en-tête, pour son ambiance sonore (10/10/2026).
  function Decore(props) {
    return (
      <JeuBonusCourant.Provider value={cle}>
        <div className="bonus-decor" style={fond ? { '--fond-bonus': `url(${fond})` } : undefined}>
          <Ecran {...props} />
        </div>
      </JeuBonusCourant.Provider>
    );
  }
  Decore.displayName = `Decor(${cle})`;
  return Decore;
};

/** Les écrans des jeux bonus, par clé du catalogue — voir `lib/jeux/bonus/catalogue.js`. */
const ECRANS_NUS = {
  'bonus-devine-le-mot': DevineLeMot,
  'bonus-mots-caches': MotsCaches,
  'bonus-devine-la-phrase': DevineLaPhrase,
  'bonus-paires': Paires,
  'bonus-operations': OperationsATrous,
  'bonus-puzzle': Puzzle,
  'bonus-mot-de-passe': MotDePasse,
  'bonus-drapeaux': Drapeaux,
  'bonus-morpion': Morpion,
  'bonus-echecs': Echecs,
  'bonus-mot-secret': MotSecret,
  'bonus-planetes': Planetes,
  // Histoire et géographie (10/10/2026) : voir ./histoire et ./geo.
  ...ECRANS_HISTOIRE,
  ...ECRANS_GEO,
};

export const ECRANS_BONUS = Object.fromEntries(Object.entries(ECRANS_NUS).map(([cle, Ecran]) => [cle, avecDecor(cle, Ecran)]));

/** L'aperçu de leur carte, faute de couverture : un dessin en texte, rien à charger. */
const APERCUS = {
  'bonus-devine-le-mot': '🔤',
  'bonus-mots-caches': '🔎',
  'bonus-devine-la-phrase': '💬',
  'bonus-paires': '🃏',
  'bonus-operations': '➗',
  'bonus-puzzle': '🧩',
  'bonus-mot-de-passe': '🔑',
  'bonus-drapeaux': '🚩',
  'bonus-morpion': '⭕',
  'bonus-echecs': '♞',
  'bonus-mot-secret': '🔠',
  'bonus-planetes': '🪐',
  ...APERCUS_HISTOIRE,
  ...APERCUS_GEO,
};

export const VIGNETTES_BONUS = Object.fromEntries(Object.entries(APERCUS).map(([cle, signe]) => [
  cle,
  () => <span className="college__vignette bonus__vignette" aria-hidden="true">{signe}</span>,
]));
