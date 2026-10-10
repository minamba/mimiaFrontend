/**
 * LES RÉGIONS ET LES CONTINENTS DE « CAP SUR LE MONDE » (10/10/2026).
 *
 * La carte vient de Natural Earth (domaine public), par `world-atlas`,
 * simplifiée dans `monde.json` : chaque pays y porte son code ISO alpha-2
 * (« FR »), ou un code maison pour les territoires qui n'en ont pas (Kosovo
 * « XK », Somaliland « SOL », Chypre du Nord « CYN », glacier de Siachen
 * « SIA », territoires australiens de l'océan Indien « IOT »).
 *
 * DEUX DÉCOUPAGES, PAS UN :
 *   - les RÉGIONS de « Où sur Terre ? » (on resserre : la région, le pays, la
 *     ville) — le Moyen-Orient y a sa place, comme dans les manuels ;
 *   - les CONTINENTS du « Grand jeu de géo » pour les petits — six terres
 *     habitées et l'Antarctique.
 * Un pays à cheval (la Russie, la Turquie, le Kazakhstan) se range là où vit
 * l'essentiel de ses habitants ; pour les continents, le point touché tranche
 * (`continentDuClic`) : un clic sur Moscou est en Europe, sur Vladivostok en Asie.
 */

/**
 * Les régions, dans l'ordre de la légende, avec leur couleur de carte (tons
 * animés). AUCUN BLEU pour une terre : zoomé sur la France, une Europe bleue
 * se confondait avec la mer.
 */
export const REGIONS = [
  { cle: 'europe', nom: 'Europe', couleur: '#ffd166', boite: [[-25, 34], [45, 71.5]] },
  { cle: 'afrique', nom: 'Afrique', couleur: '#ff9f5a', boite: [[-19, -36], [53, 38]] },
  { cle: 'moyen-orient', nom: 'Moyen-Orient', couleur: '#f3dcae', boite: [[25, 11], [63, 43]] },
  { cle: 'asie', nom: 'Asie', couleur: '#ff94b4', boite: [[58, -11], [150, 56]] },
  { cle: 'oceanie', nom: 'Océanie', couleur: '#5fdcc0', boite: [[110, -48], [180, 2]] },
  { cle: 'amerique-nord', nom: 'Amérique du Nord', couleur: '#b9a2ff', boite: [[-140, 13], [-52, 72]] },
  { cle: 'amerique-sud', nom: 'Amérique centrale et du Sud', couleur: '#8fe36f', boite: [[-118, -56], [-30, 32]] },
  { cle: 'antarctique', nom: 'Antarctique', couleur: '#eef5ff', boite: [[-180, -90], [180, -60]] },
];

const LISTES = {
  europe: 'AD AL AT AX BA BE BG BY CH CY CYN CZ DE DK EE ES FI FO FR GB GG GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA XK',
  afrique: 'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SH SL SN SO SOL SS ST SZ TD TG TN TZ UG ZA ZM ZW',
  'moyen-orient': 'AE BH IL IQ IR JO KW LB OM PS QA SA SY TR YE',
  asie: 'AF AM AZ BD BN BT CN GE HK ID IN IO JP KG KH KP KR KZ LA LK MM MN MO MV MY NP PH PK SG SIA TH TJ TL TM TW UZ VN',
  oceanie: 'AS AU CK FJ FM GU IOT KI MH MP NC NF NR NU NZ PF PG PN PW SB TO TV VU WF WS',
  'amerique-nord': 'BM CA GL MX PM US',
  'amerique-sud': 'AG AI AR AW BB BL BO BR BS BZ CL CO CR CU CW DM DO EC FK GD GS GT GY HN HT JM KN KY LC MF MS NI PA PE PR PY SR SV SX TC TT UY VC VE VG VI',
  antarctique: 'AQ HM TF',
};

const REGION_DU_PAYS = Object.fromEntries(Object.entries(LISTES).flatMap(([region, codes]) => codes.split(' ').map((c) => [c, region])));

/** La région d'un pays (code alpha-2 ou maison), ou null pour un code inconnu. */
export function regionDe(code) {
  return REGION_DU_PAYS[code] ?? null;
}

export function region(cle) {
  return REGIONS.find((r) => r.cle === cle) ?? null;
}

/** Tous les codes connus d'une région. */
export function paysDeLaRegion(cle) {
  return (LISTES[cle] ?? '').split(' ').filter(Boolean);
}

/**
 * LES CONTINENTS DES PETITS. L'Amérique se coupe à l'isthme de Panama : le
 * Mexique, l'Amérique centrale et les Caraïbes sont au nord, comme dans les
 * atlas de l'école.
 */
export const CONTINENTS = [
  { cle: 'europe', nom: 'l’Europe', couleur: '#ffd166' },
  { cle: 'afrique', nom: 'l’Afrique', couleur: '#ff9f5a' },
  { cle: 'asie', nom: 'l’Asie', couleur: '#ff94b4' },
  { cle: 'amerique-nord', nom: 'l’Amérique du Nord', couleur: '#b9a2ff' },
  { cle: 'amerique-sud', nom: 'l’Amérique du Sud', couleur: '#8fe36f' },
  { cle: 'oceanie', nom: 'l’Océanie', couleur: '#5fdcc0' },
  { cle: 'antarctique', nom: 'l’Antarctique', couleur: '#eef5ff' },
];

const AMERIQUE_DU_SUD = new Set('AR BO BR CL CO EC FK GS GY PE PY SR UY VE'.split(' '));

/** Le continent d'un pays, sans regarder où l'on a touché. */
export function continentDe(code) {
  const r = regionDe(code);
  if (r === 'moyen-orient') return 'asie';
  if (r === 'amerique-sud') return AMERIQUE_DU_SUD.has(code) ? 'amerique-sud' : 'amerique-nord';
  return r;
}

/**
 * Le continent du point touché : la Russie et le Kazakhstan passent en Asie à
 * l'est de l'Oural (60° E, assez juste pour un enfant), la Turquie est en
 * Europe sur sa rive de Thrace (à l'ouest de 29,1° E, Istanbul comprise).
 */
export function continentDuClic(code, lon) {
  if (code === 'RU') return lon < 60 ? 'europe' : 'asie';
  // Le Kazakhstan déborde en Europe à l'ouest du fleuve Oural (vers 52° E).
  if (code === 'KZ') return lon < 52 ? 'europe' : 'asie';
  if (code === 'TR') return lon < 29.1 ? 'europe' : 'asie';
  return continentDe(code);
}
