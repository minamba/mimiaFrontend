/**
 * La bibliothèque de schémas de SVT.
 *
 * POURQUOI UNE BIBLIOTHÈQUE PLUTÔT QUE DU DESSIN LIBRE
 * ---------------------------------------------------
 * Le professeur sait dessiner ce qui est géométrique — des cercles
 * concentriques, un cycle, une chaîne alimentaire. Il ne sait pas dessiner
 * l'anatomie : essai réel en séance, un appareil respiratoire rendu par deux
 * ovales et un triangle, légendé « 1 », « 2 », « 3 ». Aucune consigne ne
 * corrige ça, parce que ce n'est pas un problème de consigne.
 *
 * Or le programme scolaire est FINI ET STABLE. Les schémas dont un professeur
 * de SVT a besoin de la cinquième à la terminale forment une liste fermée qui
 * ne changera pas. Chacun dessiné une fois, vérifié une fois, est juste pour
 * toujours — et ne coûte plus un seul jeton ensuite : le professeur n'écrit
 * qu'une clé de vingt caractères.
 *
 * COMMENT ON DESSINE ICI
 * ---------------------
 * Aucune couleur, aucune épaisseur de trait, aucune police : la feuille de
 * style impose la craie, exactement comme pour un schéma généré. On ne décrit
 * que la géométrie et les mots. Un schéma d'ici et un schéma improvisé ont
 * ainsi rigoureusement la même allure.
 *
 * Les libellés sont ÉCRITS EN TOUTES LETTRES, jamais numérotés : un schéma
 * légendé « 1, 2, 3 » sans légende à côté est un schéma muet.
 */

/**
 * Le préfixe qu'écrit le professeur dans l'ardoise, à la place d'un dessin.
 * Court volontairement : c'est du texte qu'un modèle doit produire sans faute.
 */
export const PREFIXE = 'SCHEMA:';

const SCHEMAS = {
  // ------------------------------------------------------------------ 5e
  // Le diaphragme passe SOUS les poumons, il ne les traverse pas. La première
  // version le faisait couper la base des deux lobes — une erreur d'anatomie
  // qu'un élève recopie sans la questionner, et exactement le genre de faute
  // que cette bibliothèque existe pour empêcher.
  'svt-respiratoire': {
    titre: 'Appareil respiratoire',
    niveau: '5e',
    svg: `<svg viewBox="0 0 400 320">
      <path d="M200 20 v70" />
      <path d="M186 30 h28 M186 45 h28 M186 60 h28 M186 75 h28" />
      <text x="238" y="55" text-anchor="start">trachée</text>
      <path d="M200 90 L150 125 M200 90 L250 125" />
      <text x="120" y="118" text-anchor="end">bronche</text>
      <path d="M150 125 C102 142 92 198 116 234 C136 262 166 256 170 228 L178 130 Z" />
      <path d="M250 125 C298 142 308 198 284 234 C264 262 234 256 230 228 L222 130 Z" />
      <text x="80" y="195" text-anchor="end">poumon</text>
      <path d="M104 262 C150 292 250 292 296 262" stroke-dasharray="5 4" />
      <text x="200" y="312" text-anchor="middle">diaphragme</text>
    </svg>`,
  },

  'svt-alveole': {
    titre: 'Alvéole pulmonaire et échanges gazeux',
    niveau: '5e',
    svg: `<svg viewBox="-40 -10 500 300">
      <path d="M60 140 h60" />
      <text x="60" y="125" text-anchor="start">air</text>
      <circle cx="180" cy="140" r="60" />
      <text x="180" y="145" text-anchor="middle">alvéole</text>
      <path d="M270 60 C300 100 300 180 270 220" />
      <path d="M310 60 C340 100 340 180 310 220" />
      <text x="360" y="145" text-anchor="start">sang</text>
      <path d="M240 118 h50 M282 111 l9 7 l-9 7" />
      <text x="265" y="103" text-anchor="middle">dioxygène</text>
      <path d="M290 168 h-50 M248 161 l-9 7 l9 7" />
      <text x="272" y="192" text-anchor="middle">dioxyde de carbone</text>
    </svg>`,
  },

  'svt-digestif': {
    titre: 'Appareil digestif',
    niveau: '5e',
    svg: `<svg viewBox="0 0 460 400">
      <ellipse cx="200" cy="36" rx="30" ry="16" />
      <text x="150" y="41" text-anchor="end">bouche</text>
      <path d="M200 52 v58" />
      <text x="150" y="90" text-anchor="end">œsophage</text>
      <path d="M200 110 C152 116 146 172 186 186 C224 198 244 160 226 124 Z" />
      <text x="122" y="160" text-anchor="end">estomac</text>
      <path d="M300 120 C346 112 372 138 366 168 C358 196 316 194 302 168 Z" />
      <text x="404" y="150" text-anchor="start">foie</text>
      <path d="M198 190 C160 210 232 214 226 240 C220 268 164 264 168 292 C172 316 220 314 232 322" />
      <text x="122" y="252" text-anchor="end">intestin grêle</text>
      <path d="M232 322 h84 v-146" />
      <path d="M316 176 h-46" />
      <text x="404" y="266" text-anchor="start">gros intestin</text>
      <path d="M232 322 v40" />
      <text x="200" y="386" text-anchor="middle">anus</text>
    </svg>`,
  },

  'svt-circulation': {
    titre: 'Double circulation sanguine',
    niveau: '5e',
    svg: `<svg viewBox="0 0 460 380">
      <ellipse cx="230" cy="48" rx="86" ry="32" />
      <text x="230" y="54" text-anchor="middle">poumons</text>
      <rect x="178" y="158" width="104" height="76" rx="12" />
      <path d="M230 158 v76" />
      <text x="230" y="202" text-anchor="middle">cœur</text>
      <ellipse cx="230" cy="338" rx="96" ry="32" />
      <text x="230" y="344" text-anchor="middle">organes</text>
      <path d="M196 158 C140 132 128 96 152 66 M150 78 l2 -13 l13 4" />
      <text x="96" y="116" text-anchor="end">sang pauvre</text>
      <text x="96" y="136" text-anchor="end">en dioxygène</text>
      <path d="M310 66 C336 96 324 132 266 158 M268 146 l-3 13 l-13 -5" />
      <text x="364" y="116" text-anchor="start">sang riche</text>
      <text x="364" y="136" text-anchor="start">en dioxygène</text>
      <path d="M266 234 C326 262 336 296 312 320 M314 308 l-2 13 l-13 -5" />
      <text x="364" y="272" text-anchor="start">vers le corps</text>
      <path d="M150 320 C126 296 136 262 196 234 M194 246 l3 -13 l13 5" />
      <text x="96" y="272" text-anchor="end">retour au cœur</text>
    </svg>`,
  },

  'svt-nutrition-plante': {
    titre: 'Nutrition de la plante verte',
    niveau: '5e',
    svg: `<svg viewBox="0 0 400 320">
      <path d="M200 240 v-110" />
      <path d="M200 165 C160 145 140 160 132 178 C168 190 192 182 200 165 Z" />
      <path d="M200 140 C240 120 262 135 270 153 C234 165 210 157 200 140 Z" />
      <text x="285" y="150" text-anchor="start">feuille</text>
      <path d="M200 240 h-140" stroke-dasharray="6 5" />
      <text x="200" y="258" text-anchor="middle">sol</text>
      <path d="M200 240 C180 265 165 275 150 295 M200 240 C220 268 232 280 248 300 M200 240 v55" />
      <text x="115" y="300" text-anchor="end">racines</text>
      <path d="M60 275 h60 M112 268 l9 7 l-9 7" />
      <text x="55" y="268" text-anchor="start">eau et sels minéraux</text>
      <path d="M120 90 h50 M162 83 l9 7 l-9 7" />
      <text x="115" y="83" text-anchor="end">dioxyde de carbone</text>
      <path d="M330 60 L268 118 M270 110 l-2 10 l10 -2" />
      <text x="335" y="52" text-anchor="middle">lumière</text>
    </svg>`,
  },

  'svt-erosion': {
    titre: 'Érosion, transport et sédimentation',
    niveau: '5e',
    svg: `<svg viewBox="0 0 400 260">
      <path d="M20 180 L90 60 L150 150 L200 110 L260 180" />
      <text x="88" y="48" text-anchor="middle">relief</text>
      <path d="M260 180 C300 190 340 192 385 190" />
      <path d="M20 220 h365" />
      <path d="M100 100 l14 22 M92 116 l22 6" />
      <text x="70" y="108" text-anchor="end">érosion</text>
      <path d="M215 145 h60 M268 138 l9 7 l-9 7" />
      <text x="240" y="132" text-anchor="middle">transport</text>
      <path d="M300 192 h80 M300 202 h80 M300 212 h80" stroke-dasharray="7 5" />
      <text x="340" y="240" text-anchor="middle">sédiments déposés</text>
    </svg>`,
  },

  // ------------------------------------------------------------------ 4e
  'svt-terre-structure': {
    titre: 'Structure interne de la Terre',
    niveau: '4e',
    svg: `<svg viewBox="-120 -10 640 360">
      <circle cx="200" cy="170" r="140" />
      <circle cx="200" cy="170" r="92" />
      <circle cx="200" cy="170" r="46" />
      <text x="200" y="175" text-anchor="middle">graine</text>
      <path d="M245 130 L320 70" />
      <text x="325" y="64" text-anchor="start">noyau externe</text>
      <path d="M275 205 L345 250" />
      <text x="350" y="255" text-anchor="start">manteau</text>
      <path d="M110 90 L45 45" />
      <text x="40" y="39" text-anchor="end">croûte</text>
    </svg>`,
  },

  'svt-dorsale': {
    titre: 'Dorsale océanique : deux plaques qui s’écartent',
    niveau: '4e',
    svg: `<svg viewBox="0 0 400 260">
      <path d="M20 120 h150 l30 -34 l30 34 h150" />
      <path d="M20 175 h360" stroke-dasharray="6 5" />
      <text x="200" y="70" text-anchor="middle">dorsale</text>
      <path d="M200 120 v55" />
      <path d="M188 205 C195 185 205 185 212 205 Z" />
      <text x="200" y="228" text-anchor="middle">magma</text>
      <path d="M140 145 h-70 M78 138 l-9 7 l9 7" />
      <path d="M260 145 h70 M322 138 l9 7 l-9 7" />
      <text x="80" y="105" text-anchor="middle">plaque</text>
      <text x="320" y="105" text-anchor="middle">plaque</text>
    </svg>`,
  },

  'svt-subduction': {
    titre: 'Subduction : une plaque océanique plonge',
    niveau: '4e',
    svg: `<svg viewBox="-40 -10 500 300">
      <path d="M20 110 h150 l24 34" />
      <text x="80" y="95" text-anchor="middle">plaque océanique</text>
      <path d="M194 144 C230 200 260 240 300 265" />
      <path d="M215 110 h165" />
      <path d="M300 110 l-16 -30 l-16 30" />
      <text x="284" y="68" text-anchor="middle">volcan</text>
      <text x="350" y="95" text-anchor="middle">plaque continentale</text>
      <path d="M180 118 l14 26 l14 -26" />
      <text x="160" y="140" text-anchor="end">fosse</text>
      <path d="M283 175 v-45 M276 138 l7 -8 l7 8" />
      <text x="322" y="190" text-anchor="start">magma</text>
    </svg>`,
  },

  'svt-arc-reflexe': {
    titre: 'Le trajet du message nerveux dans un réflexe',
    niveau: '4e',
    svg: `<svg viewBox="0 0 400 240">
      <circle cx="45" cy="120" r="22" />
      <text x="45" y="170" text-anchor="middle">récepteur</text>
      <path d="M67 118 h95 M155 111 l9 7 l-9 7" />
      <text x="115" y="102" text-anchor="middle">nerf sensitif</text>
      <rect x="168" y="80" width="64" height="80" rx="14" />
      <text x="200" y="118" text-anchor="middle">moelle</text>
      <text x="200" y="136" text-anchor="middle">épinière</text>
      <path d="M238 142 h95 M326 135 l9 7 l-9 7" />
      <text x="286" y="168" text-anchor="middle">nerf moteur</text>
      <path d="M340 110 C370 118 370 152 340 160 Z" />
      <text x="356" y="190" text-anchor="middle">muscle</text>
      <text x="45" y="82" text-anchor="middle">stimulus</text>
      <path d="M45 88 v10" />
    </svg>`,
  },

  'svt-reproducteur-feminin': {
    titre: 'Appareil reproducteur féminin',
    niveau: '4e',
    svg: `<svg viewBox="0 0 620 400">
      <path d="M232 124 C238 194 250 230 266 244 L334 244 C350 230 362 194 368 124 C338 106 262 106 232 124 Z" />
      <path d="M252 140 C258 190 266 216 278 230 L322 230 C334 216 342 190 348 140 C324 128 276 128 252 140" opacity="0.5" />
      <text x="476" y="176" text-anchor="start">utérus</text>
      <path d="M468 180 L366 186" />

      <path d="M232 126 C204 96 168 88 138 104" />
      <path d="M368 126 C396 96 432 88 462 104" />
      <text x="150" y="56" text-anchor="middle">trompe</text>
      <path d="M158 66 L188 98" />

      <path d="M138 104 L124 92 M138 104 L126 116 M138 104 L142 88" />
      <path d="M462 104 L476 92 M462 104 L474 116 M462 104 L458 88" />

      <ellipse cx="104" cy="140" rx="30" ry="20" />
      <ellipse cx="496" cy="140" rx="30" ry="20" />
      <text x="60" y="192" text-anchor="middle">ovaire</text>
      <path d="M68 182 L92 158" />

      <path d="M266 244 C264 258 264 266 266 276" />
      <path d="M334 244 C336 258 336 266 334 276" />
      <text x="476" y="268" text-anchor="start">col de l'utérus</text>
      <path d="M468 266 L340 264" />

      <path d="M266 276 C252 304 250 336 258 362" />
      <path d="M334 276 C348 304 350 336 342 362" />
      <text x="476" y="348" text-anchor="start">vagin</text>
      <path d="M468 344 L348 340" />
    </svg>`,
  },

  'svt-reproducteur-masculin': {
    titre: 'Appareil reproducteur masculin',
    niveau: '4e',
    svg: `<svg viewBox="0 0 600 460">
      <path d="M186 24 C146 88 134 188 162 258 C182 306 208 328 222 338" opacity="0.45" />
      <path d="M344 24 C372 96 366 196 340 258 C322 300 296 322 278 332" opacity="0.45" />

      <ellipse cx="266" cy="152" rx="44" ry="36" />
      <text x="150" y="126" text-anchor="end">vessie</text>
      <path d="M158 130 L226 146" />

      <ellipse cx="330" cy="200" rx="28" ry="15" transform="rotate(-25 330 200)" />
      <text x="452" y="176" text-anchor="start">vésicule séminale</text>
      <path d="M444 180 L352 194" />

      <ellipse cx="272" cy="228" rx="30" ry="20" />
      <text x="452" y="236" text-anchor="start">prostate</text>
      <path d="M444 234 L302 230" />

      <path d="M258 246 C246 278 228 298 200 312" />
      <text x="150" y="284" text-anchor="end">urètre</text>
      <path d="M158 280 L232 292" />

      <path d="M200 310 C170 324 134 334 106 340" />
      <path d="M206 324 C176 338 142 348 114 354" />
      <path d="M106 340 C96 344 96 350 114 354" />
      <text x="120" y="396" text-anchor="middle">pénis</text>
      <path d="M126 386 L146 358" />

      <path d="M190 356 C152 358 142 404 176 420 C210 434 246 416 242 384 C240 362 220 354 190 356 Z" />
      <text x="140" y="432" text-anchor="end">scrotum</text>
      <path d="M148 428 L172 416" />

      <path d="M172 378 C178 360 218 360 222 382" />
      <text x="452" y="364" text-anchor="start">épididyme</text>
      <path d="M444 368 L228 380" />

      <ellipse cx="196" cy="398" rx="24" ry="18" />
      <text x="452" y="408" text-anchor="start">testicule</text>
      <path d="M444 412 L222 402" />

      <path d="M222 378 C254 344 282 302 288 248 C292 212 308 200 314 198" />
      <text x="452" y="118" text-anchor="start">canal déférent</text>
      <path d="M444 122 L294 212" />
    </svg>`,
  },

  'svt-fecondation': {
    titre: 'De la fécondation à la nidation',
    niveau: '4e',
    svg: `<svg viewBox="0 0 400 220">
      <circle cx="55" cy="100" r="26" />
      <circle cx="55" cy="100" r="8" />
      <text x="55" y="152" text-anchor="middle">ovule</text>
      <path d="M14 74 l22 12 M14 126 l22 -12 M8 100 h24" />
      <text x="30" y="52" text-anchor="middle">spermatozoïdes</text>
      <path d="M92 100 h44 M129 93 l9 7 l-9 7" />
      <text x="114" y="84" text-anchor="middle">fécondation</text>
      <circle cx="172" cy="100" r="22" />
      <text x="172" y="146" text-anchor="middle">cellule-œuf</text>
      <path d="M200 100 h42 M235 93 l9 7 l-9 7" />
      <text x="221" y="84" text-anchor="middle">divisions</text>
      <circle cx="272" cy="100" r="20" />
      <circle cx="266" cy="94" r="6" />
      <circle cx="278" cy="94" r="6" />
      <circle cx="266" cy="106" r="6" />
      <circle cx="278" cy="106" r="6" />
      <path d="M298 100 h34 M325 93 l9 7 l-9 7" />
      <path d="M348 74 C378 78 386 118 358 132 C342 140 336 118 344 100 Z" />
      <text x="360" y="164" text-anchor="middle">nidation</text>
    </svg>`,
  },

  'svt-selection-naturelle': {
    titre: 'Sélection naturelle',
    niveau: '4e',
    svg: `<svg viewBox="0 0 540 300">
      <text x="80" y="28" text-anchor="middle">population variée</text>
      <circle cx="36" cy="76" r="14" />
      <circle cx="80" cy="76" r="14" />
      <rect x="110" y="62" width="28" height="28" />
      <rect x="22" y="122" width="28" height="28" />
      <circle cx="80" cy="136" r="14" />
      <circle cx="124" cy="136" r="14" />
      <path d="M176 106 h188 M357 99 l9 7 l-9 7" />
      <text x="270" y="76" text-anchor="middle">le milieu change</text>
      <text x="270" y="148" text-anchor="middle">les ronds survivent mieux</text>
      <text x="460" y="28" text-anchor="middle">génération suivante</text>
      <circle cx="416" cy="76" r="14" />
      <circle cx="460" cy="76" r="14" />
      <circle cx="504" cy="76" r="14" />
      <circle cx="416" cy="136" r="14" />
      <circle cx="460" cy="136" r="14" />
      <rect x="490" y="122" width="28" height="28" />
      <text x="270" y="240" text-anchor="middle">le caractère avantageux devient plus fréquent</text>
      <text x="270" y="272" text-anchor="middle">— aucun individu ne l'a « voulu »</text>
    </svg>`,
  },

  // ------------------------------------------------------------------ 3e
  'svt-chromosome-adn-gene': {
    titre: 'Du noyau au gène',
    niveau: '3e',
    svg: `<svg viewBox="0 0 400 220">
      <circle cx="48" cy="100" r="34" />
      <circle cx="48" cy="100" r="15" />
      <text x="48" y="158" text-anchor="middle">noyau</text>
      <path d="M88 100 h34 M115 93 l9 7 l-9 7" />
      <path d="M148 62 C138 82 158 92 148 112 M164 62 C154 82 174 92 164 112" />
      <path d="M143 87 h26" />
      <path d="M148 112 C138 132 158 142 148 162 M164 112 C154 132 174 142 164 162" />
      <text x="156" y="188" text-anchor="middle">chromosome</text>
      <path d="M190 100 h34 M217 93 l9 7 l-9 7" />
      <path d="M248 60 C282 80 248 120 282 140 C248 160 282 180 248 190" />
      <path d="M282 60 C248 80 282 120 248 140 C282 160 248 180 282 190" />
      <path d="M254 84 h22 M254 116 h22 M254 148 h22" />
      <text x="265" y="212" text-anchor="middle">ADN</text>
      <path d="M300 100 h34 M327 93 l9 7 l-9 7" />
      <path d="M348 92 h44 M348 108 h44" />
      <path d="M356 92 v16 M384 92 v16" />
      <text x="370" y="80" text-anchor="middle">gène</text>
    </svg>`,
  },

  'svt-mitose': {
    titre: 'La mitose : deux cellules identiques',
    niveau: '3e',
    svg: `<svg viewBox="-20 0 460 240">
      <circle cx="55" cy="90" r="34" />
      <path d="M45 78 v24 M55 78 v24 M65 78 v24" />
      <text x="55" y="150" text-anchor="middle">la cellule</text>
      <text x="55" y="168" text-anchor="middle">copie son ADN</text>
      <path d="M96 90 h30 M119 83 l9 7 l-9 7" />
      <circle cx="168" cy="90" r="34" />
      <path d="M168 62 v56" stroke-dasharray="4 4" />
      <path d="M156 78 v24 M162 78 v24 M174 78 v24 M180 78 v24" />
      <text x="168" y="150" text-anchor="middle">les chromosomes</text>
      <text x="168" y="168" text-anchor="middle">se séparent</text>
      <path d="M209 90 h30 M232 83 l9 7 l-9 7" />
      <circle cx="288" cy="90" r="26" />
      <circle cx="352" cy="90" r="26" />
      <path d="M280 80 v20 M288 80 v20 M296 80 v20" />
      <path d="M344 80 v20 M352 80 v20 M360 80 v20" />
      <text x="320" y="150" text-anchor="middle">deux cellules filles</text>
      <text x="320" y="168" text-anchor="middle">identiques à la mère</text>
    </svg>`,
  },

  'svt-meiose': {
    titre: 'La méiose : quatre cellules à moitié moins de chromosomes',
    niveau: '3e',
    svg: `<svg viewBox="-40 -10 480 260">
      <circle cx="52" cy="100" r="32" />
      <path d="M42 86 v28 M50 86 v28 M60 86 v28 M68 86 v28" />
      <text x="52" y="156" text-anchor="middle">cellule mère</text>
      <text x="52" y="174" text-anchor="middle">4 chromosomes</text>
      <path d="M92 100 h28 M113 93 l9 7 l-9 7" />
      <circle cx="164" cy="62" r="24" />
      <circle cx="164" cy="140" r="24" />
      <path d="M156 52 v20 M172 52 v20" />
      <path d="M156 130 v20 M172 130 v20" />
      <text x="164" y="196" text-anchor="middle">1re division</text>
      <path d="M196 100 h28 M217 93 l9 7 l-9 7" />
      <circle cx="264" cy="42" r="18" />
      <circle cx="264" cy="88" r="18" />
      <circle cx="264" cy="134" r="18" />
      <circle cx="264" cy="180" r="18" />
      <path d="M264 34 v16 M264 80 v16 M264 126 v16 M264 172 v16" />
      <text x="330" y="96" text-anchor="start">4 cellules</text>
      <text x="330" y="116" text-anchor="start">2 chromosomes</text>
      <text x="330" y="136" text-anchor="start">chacune</text>
    </svg>`,
  },

  'svt-effet-de-serre': {
    titre: 'L’effet de serre',
    niveau: '3e',
    svg: `<svg viewBox="0 0 500 350">
      <path d="M50 300 C170 282 330 282 450 300" />
      <text x="250" y="336" text-anchor="middle">surface de la Terre</text>
      <path d="M50 130 h400" stroke-dasharray="9 7" />
      <text x="250" y="112" text-anchor="middle">couche de gaz à effet de serre</text>
      <circle cx="160" cy="158" r="7" />
      <circle cx="260" cy="152" r="7" />
      <circle cx="350" cy="160" r="7" />
      <path d="M80 46 L160 286 M154 270 l7 17 l-16 -4" />
      <text x="70" y="34" text-anchor="start">rayons du Soleil</text>
      <path d="M260 284 L306 46 M301 64 l6 -18 l10 15" />
      <text x="330" y="42" text-anchor="start">une partie repart</text>
      <path d="M340 168 L272 282 M276 266 l-5 17 l16 -6" />
      <text x="412" y="216" text-anchor="start">le reste est renvoyé</text>
      <text x="412" y="240" text-anchor="start">vers le sol : il chauffe</text>
    </svg>`,
  },

  'svt-phagocytose': {
    titre: 'La phagocytose',
    niveau: '3e',
    svg: `<svg viewBox="0 0 400 180">
      <path d="M40 90 C40 60 70 48 90 62 C104 48 130 58 128 84 C132 112 100 130 78 118 C52 122 38 110 40 90 Z" />
      <circle cx="150" cy="88" r="8" />
      <text x="150" y="62" text-anchor="middle">bactérie</text>
      <text x="78" y="150" text-anchor="middle">phagocyte</text>
      <path d="M180 88 h28 M201 81 l9 7 l-9 7" />
      <path d="M232 90 C232 58 268 48 288 66 C312 58 330 78 322 100 C326 126 288 136 266 122 C240 124 228 112 232 90 Z" />
      <circle cx="282" cy="92" r="8" />
      <circle cx="282" cy="92" r="16" stroke-dasharray="3 3" />
      <text x="282" y="150" text-anchor="middle">elle est ingérée</text>
      <text x="282" y="168" text-anchor="middle">puis digérée</text>
    </svg>`,
  },

  'svt-immunite-adaptative': {
    titre: 'La réponse immunitaire adaptative',
    niveau: '3e',
    svg: `<svg viewBox="0 0 400 240">
      <circle cx="52" cy="60" r="16" />
      <text x="52" y="30" text-anchor="middle">microbe</text>
      <path d="M76 66 h34 M103 59 l9 7 l-9 7" />
      <circle cx="146" cy="66" r="22" />
      <circle cx="146" cy="66" r="9" />
      <text x="146" y="26" text-anchor="middle">lymphocyte B</text>
      <path d="M172 66 h34 M199 59 l9 7 l-9 7" />
      <path d="M232 52 v28 M226 52 l6 -8 l6 8 M226 80 l6 8 l6 -8" />
      <text x="272" y="60" text-anchor="start">anticorps</text>
      <text x="272" y="80" text-anchor="start">qui neutralisent</text>
      <circle cx="146" cy="170" r="22" />
      <path d="M138 162 l16 16 M154 162 l-16 16" />
      <text x="212" y="176" text-anchor="start">lymphocyte T</text>
      <path d="M124 170 h-40 M92 163 l-9 7 l9 7" />
      <circle cx="58" cy="170" r="16" />
      <path d="M48 160 l20 20 M68 160 l-20 20" />
      <text x="58" y="212" text-anchor="middle">cellule infectée</text>
      <text x="58" y="228" text-anchor="middle">détruite</text>
    </svg>`,
  },

  'svt-vaccination': {
    titre: 'La vaccination et la mémoire immunitaire',
    niveau: '3e',
    svg: `<svg viewBox="0 0 400 240">
      <path d="M40 200 h330" />
      <path d="M40 200 v-160" />
      <text x="24" y="120" text-anchor="middle" transform="rotate(-90 24 120)">anticorps</text>
      <text x="366" y="214" text-anchor="end">temps</text>
      <path d="M70 200 v10" />
      <text x="70" y="226" text-anchor="middle">vaccin</text>
      <path d="M70 200 C100 195 110 160 130 158 C150 160 165 190 200 196" />
      <path d="M230 200 v10" />
      <text x="230" y="226" text-anchor="middle">vrai microbe</text>
      <path d="M230 196 C248 190 254 70 275 62 C300 58 320 90 360 88" />
      <text x="150" y="140" text-anchor="middle">réponse lente</text>
      <text x="330" y="60" text-anchor="middle">réponse rapide et forte</text>
    </svg>`,
  },

  'svt-communication-hormonale': {
    titre: 'La communication hormonale',
    niveau: '3e',
    svg: `<svg viewBox="0 0 400 190">
      <ellipse cx="60" cy="95" rx="34" ry="26" />
      <text x="60" y="150" text-anchor="middle">glande</text>
      <path d="M96 88 C140 74 180 74 224 88" />
      <path d="M96 108 C140 122 180 122 224 108" />
      <text x="160" y="66" text-anchor="middle">sang</text>
      <circle cx="130" cy="98" r="5" />
      <circle cx="160" cy="98" r="5" />
      <circle cx="190" cy="98" r="5" />
      <text x="160" y="140" text-anchor="middle">hormone</text>
      <path d="M228 96 C270 80 300 80 330 96 C346 112 330 140 300 140 C264 142 228 122 228 96 Z" />
      <text x="290" y="170" text-anchor="middle">organe cible</text>
    </svg>`,
  },

  'svt-synapse': {
    titre: 'La synapse',
    niveau: '3e',
    svg: `<svg viewBox="-20 0 460 240">
      <path d="M20 100 h110" />
      <path d="M130 72 C170 74 176 126 130 128 Z" />
      <text x="70" y="80" text-anchor="middle">neurone</text>
      <circle cx="150" cy="90" r="4" />
      <circle cx="152" cy="108" r="4" />
      <text x="150" y="54" text-anchor="middle">vésicules</text>
      <path d="M186 60 v80" />
      <path d="M206 60 v80" />
      <text x="196" y="46" text-anchor="middle">fente</text>
      <circle cx="196" cy="82" r="4" />
      <circle cx="196" cy="104" r="4" />
      <circle cx="196" cy="124" r="4" />
      <path d="M226 62 C266 74 266 126 226 138 L226 62 Z" />
      <path d="M266 100 h110" />
      <text x="320" y="80" text-anchor="middle">neurone suivant</text>
      <path d="M60 132 h90 M143 125 l9 7 l-9 7" />
      <text x="100" y="152" text-anchor="middle">message nerveux</text>
    </svg>`,
  },

  // -------------------------------------------------------------- seconde
  'svt-cellule-animale': {
    titre: 'La cellule animale',
    niveau: '2de',
    svg: `<svg viewBox="-40 -10 500 300">
      <path d="M60 140 C60 70 140 40 200 46 C280 40 350 84 344 148 C348 216 270 250 196 244 C112 250 56 208 60 140 Z" />
      <text x="30" y="70" text-anchor="start">membrane</text>
      <path d="M78 88 L62 76" />
      <circle cx="196" cy="140" r="46" />
      <circle cx="196" cy="140" r="12" />
      <text x="196" y="145" text-anchor="middle">noyau</text>
      <ellipse cx="290" cy="102" rx="26" ry="13" transform="rotate(-20 290 102)" />
      <path d="M276 98 l8 8 l8 -8 l8 8" />
      <text x="352" y="76" text-anchor="start">mitochondrie</text>
      <ellipse cx="112" cy="196" rx="24" ry="12" transform="rotate(15 112 196)" />
      <text x="72" y="228" text-anchor="middle">cytoplasme</text>
    </svg>`,
  },

  'svt-cellule-vegetale': {
    titre: 'La cellule végétale',
    niveau: '2de',
    svg: `<svg viewBox="-40 -10 500 300">
      <rect x="52" y="46" width="296" height="200" rx="10" />
      <rect x="64" y="58" width="272" height="176" rx="8" />
      <text x="30" y="40" text-anchor="start">paroi</text>
      <path d="M60 52 L46 44" />
      <circle cx="140" cy="120" r="34" />
      <circle cx="140" cy="120" r="10" />
      <text x="140" y="125" text-anchor="middle">noyau</text>
      <ellipse cx="252" cy="106" rx="30" ry="16" />
      <path d="M232 106 h40 M240 98 h24 M240 114 h24" />
      <text x="300" y="82" text-anchor="start">chloroplaste</text>
      <ellipse cx="212" cy="192" rx="70" ry="34" />
      <text x="212" y="197" text-anchor="middle">vacuole</text>
    </svg>`,
  },

  'svt-adn-double-helice': {
    titre: 'La molécule d’ADN',
    niveau: '2de',
    svg: `<svg viewBox="0 0 400 260">
      <path d="M200 20 C252 46 252 94 200 120 C148 146 148 194 200 220 C230 236 244 244 252 250" />
      <path d="M200 20 C148 46 148 94 200 120 C252 146 252 194 200 220 C170 236 156 244 148 250" />
      <path d="M176 46 h48 M164 74 h72 M176 100 h48 M176 146 h48 M164 174 h72 M176 200 h48" />
      <text x="326" y="66" text-anchor="start">deux brins</text>
      <text x="326" y="88" text-anchor="start">enroulés l'un</text>
      <text x="326" y="110" text-anchor="start">autour de l'autre</text>
      <path d="M256 78 L318 74" />
      <text x="74" y="168" text-anchor="end">paires de</text>
      <text x="74" y="190" text-anchor="end">nucléotides</text>
      <path d="M82 176 L162 172" />
    </svg>`,
  },

  'svt-metabolisme': {
    titre: 'Photosynthèse et respiration cellulaire',
    niveau: '2de',
    svg: `<svg viewBox="0 0 560 280">
      <rect x="130" y="70" width="150" height="96" rx="12" />
      <text x="205" y="112" text-anchor="middle">cellule à</text>
      <text x="205" y="136" text-anchor="middle">chlorophylle</text>
      <text x="205" y="44" text-anchor="middle">photosynthèse</text>
      <path d="M40 96 h72 M105 89 l9 7 l-9 7" />
      <text x="34" y="101" text-anchor="end">dioxyde de carbone</text>
      <path d="M40 142 h72 M105 135 l9 7 l-9 7" />
      <text x="34" y="147" text-anchor="end">eau et lumière</text>
      <path d="M282 118 h68 M343 111 l9 7 l-9 7" />
      <text x="316" y="100" text-anchor="middle">glucose</text>
      <text x="316" y="146" text-anchor="middle">et dioxygène</text>
      <rect x="352" y="70" width="150" height="96" rx="12" />
      <text x="427" y="124" text-anchor="middle">toute cellule</text>
      <text x="427" y="44" text-anchor="middle">respiration</text>
      <path d="M427 168 v40 M420 198 l7 10 l7 -10" />
      <text x="427" y="234" text-anchor="middle">énergie utilisable</text>
      <text x="427" y="258" text-anchor="middle">+ dioxyde de carbone + eau</text>
    </svg>`,
  },

  'svt-ecosysteme': {
    titre: 'Flux de matière dans un écosystème',
    niveau: '2de',
    svg: `<svg viewBox="0 0 400 250">
      <rect x="40" y="30" width="110" height="46" rx="10" />
      <text x="95" y="58" text-anchor="middle">producteurs</text>
      <rect x="240" y="30" width="120" height="46" rx="10" />
      <text x="300" y="58" text-anchor="middle">consommateurs</text>
      <rect x="132" y="170" width="140" height="46" rx="10" />
      <text x="202" y="198" text-anchor="middle">décomposeurs</text>
      <path d="M152 53 h78 M223 46 l9 7 l-9 7" />
      <path d="M300 80 C298 130 262 160 240 172 M244 164 l-9 8 l11 5" />
      <path d="M160 172 C130 158 96 128 92 82 M85 92 l7 -10 l8 8" />
      <text x="200" y="128" text-anchor="middle">matière minérale</text>
      <path d="M330 30 v-16 M323 22 l7 -9 l7 9" />
      <text x="352" y="16" text-anchor="start">énergie</text>
    </svg>`,
  },

  // ------------------------------------------------------------- première
  'svt-replication': {
    titre: 'La réplication de l’ADN',
    niveau: '1re',
    svg: `<svg viewBox="0 0 400 220">
      <path d="M30 96 h120 M30 124 h120" />
      <path d="M50 96 v28 M80 96 v28 M110 96 v28 M140 96 v28" />
      <text x="90" y="72" text-anchor="middle">molécule d'origine</text>
      <path d="M150 96 C190 96 210 62 250 58 h110" />
      <path d="M150 124 C190 124 210 158 250 162 h110" />
      <path d="M150 110 h14" />
      <text x="196" y="118" text-anchor="middle">les brins</text>
      <text x="196" y="136" text-anchor="middle">se séparent</text>
      <path d="M250 30 h110" />
      <path d="M270 30 v28 M300 30 v28 M330 30 v28 M356 30 v28" />
      <path d="M250 190 h110" />
      <path d="M270 162 v28 M300 162 v28 M330 162 v28 M356 162 v28" />
      <text x="305" y="18" text-anchor="middle">chaque brin sert de modèle</text>
      <text x="305" y="212" text-anchor="middle">deux molécules identiques</text>
    </svg>`,
  },

  'svt-transcription-traduction': {
    titre: 'De l’ADN à la protéine',
    niveau: '1re',
    svg: `<svg viewBox="0 0 400 210">
      <circle cx="80" cy="90" r="58" />
      <path d="M44 82 h72 M44 98 h72" />
      <path d="M62 82 v16 M86 82 v16 M108 82 v16" />
      <text x="80" y="70" text-anchor="middle">ADN</text>
      <text x="80" y="168" text-anchor="middle">noyau</text>
      <path d="M80 122 v22 M73 136 l7 9 l7 -9" />
      <text x="128" y="140" text-anchor="start">transcription</text>
      <path d="M150 92 h96" />
      <path d="M168 92 v14 M192 92 v14 M216 92 v14" />
      <text x="198" y="78" text-anchor="middle">ARN messager</text>
      <path d="M252 92 h30 M275 85 l9 7 l-9 7" />
      <text x="268" y="72" text-anchor="middle">traduction</text>
      <circle cx="308" cy="92" r="12" />
      <circle cx="330" cy="80" r="12" />
      <circle cx="352" cy="92" r="12" />
      <circle cx="368" cy="112" r="12" />
      <text x="336" y="158" text-anchor="middle">protéine</text>
    </svg>`,
  },

  'svt-cycle-carbone': {
    titre: 'Le cycle du carbone',
    niveau: '1re',
    svg: `<svg viewBox="-110 0 740 410">
      <ellipse cx="290" cy="50" rx="112" ry="34" />
      <text x="290" y="56" text-anchor="middle">dioxyde de carbone de l'air</text>
      <rect x="40" y="182" width="146" height="58" rx="10" />
      <text x="113" y="217" text-anchor="middle">végétaux</text>
      <rect x="440" y="182" width="132" height="58" rx="10" />
      <text x="506" y="217" text-anchor="middle">océan</text>
      <rect x="216" y="326" width="184" height="56" rx="10" />
      <text x="308" y="361" text-anchor="middle">roches et fossiles</text>
      <path d="M212 76 C170 112 138 148 122 176 M116 164 l6 13 l13 -6" />
      <text x="66" y="122" text-anchor="end">photosynthèse</text>
      <path d="M158 244 C198 288 232 314 250 324 M238 316 l13 9 l-3 -14" />
      <text x="150" y="300" text-anchor="end">enfouissement</text>
      <path d="M392 328 C438 274 420 150 358 84 M352 98 l6 -14 l13 8" />
      <text x="470" y="298" text-anchor="start">combustion</text>
      <path d="M470 180 C430 140 404 108 382 84 M378 98 l4 -14 l14 6" />
      <path d="M398 66 C420 92 446 128 486 172 M490 158 l-4 15 l-14 -6" />
      <text x="524" y="118" text-anchor="start">échanges</text>
    </svg>`,
  },

  'svt-cancer': {
    titre: 'D’une mutation à une tumeur',
    niveau: '1re',
    svg: `<svg viewBox="0 0 520 230">
      <circle cx="62" cy="104" r="26" />
      <circle cx="62" cy="104" r="9" />
      <text x="62" y="172" text-anchor="middle">cellule normale</text>
      <path d="M100 104 h64 M157 97 l9 7 l-9 7" />
      <text x="132" y="80" text-anchor="middle">mutation</text>
      <circle cx="220" cy="104" r="26" />
      <path d="M211 95 l18 18 M229 95 l-18 18" />
      <text x="220" y="172" text-anchor="middle">gène altéré</text>
      <path d="M258 104 h64 M315 97 l9 7 l-9 7" />
      <text x="290" y="80" text-anchor="middle">divisions</text>
      <text x="290" y="58" text-anchor="middle">incontrôlées</text>
      <circle cx="382" cy="88" r="17" />
      <circle cx="414" cy="110" r="17" />
      <circle cx="384" cy="130" r="17" />
      <circle cx="422" cy="76" r="17" />
      <circle cx="448" cy="114" r="17" />
      <circle cx="424" cy="142" r="17" />
      <text x="416" y="196" text-anchor="middle">tumeur</text>
    </svg>`,
  },

  // ------------------------------------------------------------- terminale
  'svt-brassage-meiose': {
    titre: 'Brassage interchromosomique',
    niveau: 'Tle',
    svg: `<svg viewBox="0 0 400 240">
      <text x="200" y="20" text-anchor="middle">une paire noire, une paire blanche</text>
      <circle cx="200" cy="70" r="40" />
      <path d="M182 52 v36 M190 52 v36" />
      <path d="M210 52 v36 M218 52 v36" stroke-dasharray="4 3" />
      <path d="M170 108 C140 130 120 140 100 152 M106 142 l-9 10 l12 3" />
      <path d="M230 108 C260 130 280 140 300 152 M294 142 l9 10 l-12 3" />
      <text x="120" y="128" text-anchor="end">une répartition</text>
      <text x="290" y="128" text-anchor="start">ou l'autre</text>
      <circle cx="60" cy="186" r="26" />
      <path d="M50 172 v28 M58 172 v28" />
      <circle cx="130" cy="186" r="26" />
      <path d="M122 172 v28 M130 172 v28" stroke-dasharray="4 3" />
      <circle cx="272" cy="186" r="26" />
      <path d="M262 172 v28" />
      <path d="M274 172 v28" stroke-dasharray="4 3" />
      <circle cx="342" cy="186" r="26" />
      <path d="M332 172 v28" />
      <path d="M344 172 v28" stroke-dasharray="4 3" />
      <text x="200" y="232" text-anchor="middle">le hasard de la métaphase multiplie les combinaisons</text>
    </svg>`,
  },

  'svt-crossing-over': {
    titre: 'Brassage intrachromosomique : le crossing-over',
    niveau: 'Tle',
    svg: `<svg viewBox="-20 0 460 240">
      <path d="M60 40 v120 M84 40 v120" />
      <path d="M132 40 v120 M156 40 v120" stroke-dasharray="4 3" />
      <text x="72" y="24" text-anchor="middle">chromosome</text>
      <text x="150" y="192" text-anchor="middle">son homologue</text>
      <path d="M84 92 C104 92 112 108 132 108" />
      <text x="108" y="212" text-anchor="middle">échange de morceaux</text>
      <path d="M190 100 h44 M227 93 l9 7 l-9 7" />
      <path d="M280 40 v52 M280 92 v68" stroke-dasharray="4 3" />
      <path d="M304 40 v120" />
      <path d="M348 40 v52" stroke-dasharray="4 3" />
      <path d="M348 92 v68" />
      <path d="M372 40 v120" stroke-dasharray="4 3" />
      <text x="326" y="186" text-anchor="middle">chromosomes recombinés</text>
    </svg>`,
  },

  'svt-collision': {
    titre: 'D’un océan à une chaîne de montagnes',
    niveau: 'Tle',
    svg: `<svg viewBox="0 0 400 240">
      <path d="M20 90 h110 C150 92 160 100 172 112" />
      <path d="M270 112 C282 100 292 92 312 90 h68" />
      <text x="60" y="76" text-anchor="middle">continent</text>
      <text x="350" y="76" text-anchor="middle">continent</text>
      <path d="M172 112 C186 132 200 140 220 140 C240 140 254 132 270 112" />
      <text x="220" y="166" text-anchor="middle">océan refermé</text>
      <path d="M40 200 h130 M163 193 l9 7 l-9 7" />
      <path d="M360 200 h-130 M237 193 l-9 7 l9 7" />
      <text x="200" y="222" text-anchor="middle">les continents se rapprochent</text>
      <path d="M172 112 L196 66 L216 96 L238 54 L262 100 L270 112" />
      <text x="222" y="40" text-anchor="middle">chaîne de montagnes</text>
    </svg>`,
  },

  'svt-datation-relative': {
    titre: 'Principes de datation relative',
    niveau: 'Tle',
    svg: `<svg viewBox="-40 -20 620 310">
      <path d="M30 60 h250 M30 100 h250 M30 140 h250 M30 180 h250" />
      <path d="M30 40 v160 M280 40 v160" />
      <text x="300" y="52" text-anchor="start">couche 4 — la plus jeune</text>
      <text x="300" y="92" text-anchor="start">couche 3</text>
      <text x="300" y="132" text-anchor="start">couche 2</text>
      <text x="300" y="172" text-anchor="start">couche 1 — la plus ancienne</text>
      <path d="M96 200 L140 40" />
      <text x="92" y="214" text-anchor="middle">faille</text>
      <text x="250" y="252" text-anchor="middle">elle recoupe les couches : elle est postérieure</text>
    </svg>`,
  },

  'svt-vih': {
    titre: 'Le VIH et les lymphocytes T4',
    niveau: 'Tle',
    svg: `<svg viewBox="-40 -10 480 260">
      <path d="M40 190 h330" />
      <path d="M40 190 v-160" />
      <text x="205" y="220" text-anchor="middle">années après la contamination</text>
      <path d="M60 60 C90 130 130 160 200 168 C270 174 320 182 360 186" />
      <text x="86" y="48" text-anchor="middle">lymphocytes T4</text>
      <path d="M60 178 C90 96 120 130 160 150 C220 176 300 100 360 44" />
      <text x="330" y="34" text-anchor="middle">virus</text>
      <path d="M300 186 v-16" stroke-dasharray="3 3" />
      <text x="300" y="204" text-anchor="middle">sida</text>
      <text x="238" y="96" text-anchor="middle">les défenses s'effondrent</text>
    </svg>`,
  },

  'svt-glycemie': {
    titre: 'La régulation de la glycémie',
    niveau: 'Tle',
    svg: `<svg viewBox="0 0 640 360">
      <path d="M70 160 h440" stroke-dasharray="7 5" />
      <text x="524" y="165" text-anchor="start">1 g/L</text>
      <path d="M70 160 C140 88 210 88 280 160 C350 232 420 232 490 160" />
      <text x="175" y="76" text-anchor="middle">trop de sucre dans le sang</text>
      <text x="392" y="272" text-anchor="middle">pas assez</text>
      <ellipse cx="290" cy="326" rx="74" ry="26" />
      <text x="290" y="332" text-anchor="middle">pancréas</text>
      <path d="M232 312 C170 296 140 250 132 190 M124 202 l8 -13 l11 9" />
      <text x="112" y="240" text-anchor="end">insuline :</text>
      <text x="112" y="262" text-anchor="end">fait baisser</text>
      <path d="M352 312 C420 296 452 264 470 216 M462 228 l9 -13 l4 15" />
      <text x="494" y="252" text-anchor="start">glucagon :</text>
      <text x="494" y="274" text-anchor="start">fait monter</text>
    </svg>`,
  },
};

/**
 * LES SEPT FIGURES QUI NE SE DESSINENT PAS AU TRAIT.
 *
 * Le reste de la bibliothèque décrit des PROCESSUS — un cycle, un
 * enchaînement, une géométrie. Des formes simples reliées par des flèches, et
 * un dessin au trait fait exactement le travail.
 *
 * L'anatomie, non. Il y faut des formes organiques justes, des proportions
 * crédibles, des positions relatives exactes — et une heure de travail y
 * aboutit à « mieux, mais pas bon ». Comparé au schéma d'un manuel, le résultat
 * reste un fil de fer.
 *
 * D'où ces sept-là : une planche vérifiée sous licence libre remplace le
 * dessin. Le fichier va dans `public/schemas/`, et `credit` porte la mention
 * qu'impose la licence — voir le README du dossier.
 *
 * TANT QU'UN FICHIER MANQUE, RIEN NE CASSE : l'image échoue à charger et le
 * dessin d'origine reprend la main. On peut donc les remplacer une par une, à
 * son rythme, sans jamais laisser un tableau vide.
 */
/**
 * Les figures pour lesquelles une planche importée est PERTINENTE.
 *
 * Le reste de la bibliothèque décrit des PROCESSUS — un cycle, un
 * enchaînement, une géométrie — et le dessin au trait y fait le travail. Ces
 * sept-là sont de l'anatomie : il y faut des formes organiques justes et des
 * proportions crédibles, ce qu'un tracé à la main n'atteint pas.
 *
 * Ce n'est PAS une interdiction : n'importe quelle clé peut recevoir une
 * planche. C'est un repère pour l'administration, qui met ces lignes en avant.
 */
const PLANCHES_RECOMMANDEES = new Set([
  'svt-respiratoire',
  'svt-digestif',
  'svt-circulation',
  'svt-reproducteur-feminin',
  'svt-reproducteur-masculin',
  'svt-cellule-animale',
  'svt-cellule-vegetale',
]);

export function plancheRecommandee(cle) {
  return PLANCHES_RECOMMANDEES.has(cle);
}

/**
 * L'adresse à laquelle le tableau va chercher une planche.
 *
 * POURQUOI L'API ET NON `public/`
 * ------------------------------
 * Les premières planches étaient des fichiers du paquet : en ajouter une
 * exigeait de reconstruire et redéployer l'application. Tenable pour sept
 * fichiers, absurde pour les cinq autres matières où il en faudra une
 * centaine. Ici, une planche s'importe depuis l'administration — ou par un
 * appel d'API, ce qui laisse la porte ouverte à un agent qui les collecterait.
 *
 * L'adresse est rendue SANS vérifier que la planche existe : c'est le 404 de
 * l'API qui fait retomber le tableau sur le dessin du professeur. Un appel
 * préalable pour savoir s'il faut appeler serait un aller-retour de plus à
 * chaque affichage, pour une information que la requête donne déjà.
 */
export function urlPlanche(cle, version) {
  if (!cle) return null;

  const base = `${process.env.REACT_APP_API_URL ?? ''}/planches/${cle}`;
  if (!version) return base;

  // POURQUOI UNE VERSION DANS L'ADRESSE ALORS QUE LE SERVEUR RÉVALIDE DÉJÀ.
  //
  // L'étiquette ETag règle le cas du rechargement de page : le navigateur
  // redemande, le serveur répond 304 ou renvoie les octets neufs. Elle ne règle
  // PAS celui de l'administration, et c'est là qu'on remplace une planche.
  //
  // Après un remplacement, la liste se recharge mais l'adresse de l'image ne
  // change pas. Le navigateur n'a donc aucune raison de refaire la moindre
  // requête : la balise `img` est déjà rendue, ses octets sont en mémoire, et
  // l'ancienne figure reste à l'écran. Rien n'est en panne, rien n'est demandé.
  //
  // La date de dernière modification dans l'adresse suffit : elle change quand
  // la planche change, et elle seulement — le cache continue donc de servir
  // entre deux imports.
  const jeton = Date.parse(version) || version;
  return `${base}?v=${encodeURIComponent(jeton)}`;
}

/**
 * L'adresse du crédit d'une planche : auteur, source, licence.
 *
 * Séparée de l'image parce qu'une balise `img` ne donne accès à aucun en-tête
 * de sa réponse. Le crédit ne pèse rien et se cache comme l'image.
 */
export function urlCreditPlanche(cle) {
  if (!cle) return null;
  return `${process.env.REACT_APP_API_URL ?? ''}/planches/${cle}/credit`;
}

/** La clé d'un schéma si le contenu de l'ardoise en désigne un, sinon null. */
export function cleSchema(contenu) {
  if (typeof contenu !== 'string') return null;

  const propre = contenu.trim();
  if (!propre.startsWith(PREFIXE)) return null;

  const cle = propre.slice(PREFIXE.length).trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(SCHEMAS, cle) ? cle : null;
}

/** Le SVG d'un schéma de la bibliothèque, ou null. */
export function schemaDeLaBibliotheque(cle) {
  return SCHEMAS[cle]?.svg ?? null;
}

/**
 * Le catalogue, pour la consigne du professeur.
 *
 * Généré à partir de la bibliothèque elle-même : une liste tenue à la main en
 * parallèle finirait par mentionner un schéma supprimé, et le professeur
 * écrirait une clé qui n'affiche rien.
 */
export function catalogue() {
  return Object.entries(SCHEMAS).map(([cle, s]) => ({
    cle,
    titre: s.titre,
    niveau: s.niveau,
  }));
}
