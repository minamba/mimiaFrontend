import '../college-francais-b/college-francais-b.css';
import lesAccords from '../college-francais-b/LesAccords';
import commeUneImage from '../college-francais-b/CommeUneImage';
import poemeTheatre from '../college-francais-b/PoemeTheatre';
import pourquoiOnRit from '../college-francais-b/PourquoiOnRit';
import leChevalier from '../college-francais-b/LeChevalier';
import compteurDeSyllabes from '../college-francais-b/CompteurDeSyllabes';
import quelRegistre from '../college-francais-b/QuelRegistre';
import infoOuOpinion from '../college-francais-b/InfoOuOpinion';
import siJEtais from '../college-francais-b/SiJEtais';
import surOuPasSur from '../college-francais-b/SurOuPasSur';
import chasseAuxFautes from '../college-francais-b/ChasseAuxFautes';
import theseArgumentExemple from '../college-francais-b/TheseArgumentExemple';
import ceQuiNEstPasDit from '../college-francais-b/CeQuiNEstPasDit';

/**
 * Les scènes du groupe « college-francais-b » — voir `../index.js`. Treize
 * jeux de français du collège (5e, 4e, 3e), un univers chacun, tiré de sa
 * couverture (09/10/2026) :
 *   - les accords : le jardin des carillons (les réponses, des tubes qui
 *     tintent) ;
 *   - comme une image : la crique aux coquillages ;
 *   - poème, théâtre ou récit : le théâtre de plein air (des billets) ;
 *   - pourquoi on rit : la cuisine en folie (des bocaux sur l'étagère) ;
 *   - le chevalier : la cour de la Table ronde (l'épée dans la pierre) ;
 *   - le compteur de syllabes : la passerelle aux lanternes ;
 *   - quel registre : la ville sous l'orage (le cadran des registres) ;
 *   - info ou opinion : le plateau du journal (la dépêche à glisser) ;
 *   - si j'étais : les ponts suspendus (la planche à poser) ;
 *   - sûr ou pas sûr : le phare dans la brume (des bouées) ;
 *   - la chasse aux fautes : le patio aux azulejos (des carreaux) ;
 *   - thèse, argument ou exemple : l'agora de pierre (la tour à bâtir) ;
 *   - ce qui n'est pas dit : la maison aux paravents (des panneaux coulissants).
 */
const SCENES = {
  'les-accords-college': lesAccords,
  'comme-une-image-college': commeUneImage,
  'poeme-theatre-college': poemeTheatre,
  'pourquoi-on-rit': pourquoiOnRit,
  'le-chevalier': leChevalier,
  'compteur-de-syllabes': compteurDeSyllabes,
  'quel-registre': quelRegistre,
  'info-ou-opinion': infoOuOpinion,
  'si-j-etais': siJEtais,
  'sur-ou-pas-sur': surOuPasSur,
  'chasse-aux-fautes': chasseAuxFautes,
  'these-argument-exemple': theseArgumentExemple,
  'ce-qui-n-est-pas-dit': ceQuiNEstPasDit,
};

export default SCENES;
