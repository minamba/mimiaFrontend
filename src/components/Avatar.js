/**
 * Visage du professeur.
 *
 * Dessiné en SVG plutôt qu'importé en image : net à toute taille, aucun
 * fichier à héberger, et la couleur s'adapte à la matière. Pour un enfant,
 * c'est ce visage qui fait qu'il retrouve « son » prof d'une séance à l'autre.
 */

import { useEffect, useRef, useState } from 'react';

import photoNora from '../assets/profs/p_math.png';
import photoAdrien from '../assets/profs/p_français.png';
import photoSalim from '../assets/profs/p_histoire_geo.png';
import photoMarine from '../assets/profs/p_anglais.png';
import photoYann from '../assets/profs/p_sciences-technologie.png';
import photoInes from '../assets/profs/p_svt.png';
import photoCamille from '../assets/profs/p_philosophie.png';
import photoLucia from '../assets/profs/p_espagnol.png';
import photoKarim from '../assets/profs/p_droit.png';
import photoElodie from '../assets/profs/p_sanitaires_sociales.png';
import photoTheo from '../assets/profs/p_sport.png';
import photoJeanne from '../assets/profs/p_arts.png';
import photoMinamba from '../assets/profs/p_nsi.png';
import photoJonas from '../assets/profs/p_allemand.png';
import photoGiulia from '../assets/profs/p_italien.png';
import photoLin from '../assets/profs/p_chinois.png';
import photoYoussef from '../assets/profs/p_arabe.png';
import photoMaelle from '../assets/profs/p_orientation.png';
import photoHugo from '../assets/profs/p_pse.png';

import animNora from '../assets/profs/anim/nora.mp4';
import animAdrien from '../assets/profs/anim/adrien.mp4';
import animSalim from '../assets/profs/anim/salim.mp4';
import animMarine from '../assets/profs/anim/marine.mp4';
import animYann from '../assets/profs/anim/yann.mp4';
import animInes from '../assets/profs/anim/ines.mp4';
import animCamille from '../assets/profs/anim/camille.mp4';
import animLucia from '../assets/profs/anim/lucia.mp4';
import animKarim from '../assets/profs/anim/karim.mp4';
import animElodie from '../assets/profs/anim/elodie.mp4';
import animTheo from '../assets/profs/anim/theo.mp4';
import animJeanne from '../assets/profs/anim/jeanne.mp4';
import animMinamba from '../assets/profs/anim/minamba.mp4';
import animJonas from '../assets/profs/anim/jonas.mp4';
import animGiulia from '../assets/profs/anim/giulia.mp4';
import animLin from '../assets/profs/anim/lin.mp4';
import animYoussef from '../assets/profs/anim/youssef.mp4';
import animMaelle from '../assets/profs/anim/maelle.mp4';
import animHugo from '../assets/profs/anim/hugo.mp4';

/**
 * LES VISAGES ILLUSTRÉS — voulus par Camara le 14/09/2026, d'abord pour Nora
 * (« j'ai envie de voir comment ça rend »), puis pour toute l'équipe. Les
 * images sont nommées par matière ; un professeur qui en tient plusieurs garde
 * UN visage — Yann en sciences comme en physique-chimie, Karim en STMG comme en
 * SES. Le dessin ci-dessous reste le repli d'un professeur sans image.
 *
 * À REDIMENSIONNER AVANT LA MISE EN LIGNE : chaque image fait 1254 px et
 * 1,1 à 1,7 Mo, pour un visage affiché entre 32 et 96 px.
 */
const PHOTOS = {
  nora: photoNora,
  adrien: photoAdrien,
  salim: photoSalim,
  marine: photoMarine,
  yann: photoYann,
  ines: photoInes,
  camille: photoCamille,
  lucia: photoLucia,
  karim: photoKarim,
  elodie: photoElodie,
  theo: photoTheo,
  jeanne: photoJeanne,
  // Fournie par Camara le 15/09/2026. Des trous transparents le long de la
  // veste, dans la partie visible du disque, ont été bouchés avec la couleur
  // de leurs voisins : on y aurait vu le fond de la page.
  minamba: photoMinamba,
  // Les quatre professeurs de langue du 04/10/2026 — portraits fournis par
  // Camara le jour même.
  jonas: photoJonas,
  giulia: photoGiulia,
  lin: photoLin,
  youssef: photoYoussef,
  // La conseillère d'orientation — portrait fourni par Camara le 11/10/2026.
  maelle: photoMaelle,
  // Le professeur de PSE de la voie professionnelle (16/10/2026) — portrait
  // généré (Higgsfield, GPT Image, deux portraits de l'équipe en référence de
  // style), cercle redécoupé net.
  hugo: photoHugo,
};

/**
 * LE PROFESSEUR QUI PARLE — Camara, le 04/10/2026 : « quand c'est le
 * professeur qui parle, mettre les gif en action ».
 *
 * Une boucle de trois secondes par professeur, fabriquée à partir de son
 * portrait (Higgsfield, Kling 3.0, même image au début et à la fin pour
 * qu'elle se referme sans à-coup), puis réduite à 192 px : 11 à 22 Ko pièce,
 * en MP4 H.264 de base — lisible partout, cent fois plus léger qu'un GIF.
 *
 * ELLE N'EST PAS SYNCHRONISÉE SUR LES MOTS, et ne prétend pas l'être : elle
 * tourne tant que le professeur parle. Ce qui suit le son réel, ce sont les
 * ondes — voir `Ondes`.
 *
 * Régénérer une boucle : scratchpad `anim/convertir.mjs` garde la recette.
 */

const BOUCLES = {
  nora: animNora,
  adrien: animAdrien,
  salim: animSalim,
  marine: animMarine,
  yann: animYann,
  ines: animInes,
  camille: animCamille,
  lucia: animLucia,
  karim: animKarim,
  elodie: animElodie,
  theo: animTheo,
  jeanne: animJeanne,
  minamba: animMinamba,
  jonas: animJonas,
  giulia: animGiulia,
  lin: animLin,
  youssef: animYoussef,
  // Higgsfield Kling 3.0, 4,5 crédits, le 11/10/2026 — même recette que les autres.
  maelle: animMaelle,
  hugo: animHugo,
};

const PROFS = {
  nora: {
    peau: '#E8B48C',
    cheveux: '#2F2622',
    coupe: 'carre',
    vetement: '#0E7C7B',
    lunettes: false,
  },
  adrien: {
    peau: '#F0C9A4',
    cheveux: '#6B4A2F',
    coupe: 'courte',
    vetement: '#B4531F',
    lunettes: true,
  },
  salim: {
    peau: '#B07A50',
    cheveux: '#1E1815',
    coupe: 'courte',
    vetement: '#7A3E9D',
    lunettes: false,
  },
  marine: {
    peau: '#F3D2B3',
    cheveux: '#C97A32',
    coupe: 'queue',
    vetement: '#1D6FB8',
    lunettes: true,
  },
  yann: {
    peau: '#D9A377',
    cheveux: '#3D3A38',
    coupe: 'courte',
    vetement: '#6B4400',
    lunettes: false,
  },
  // Professeure de SVT. Quatrième coupe et quatrième carnation : c'est ce qui
  // fait qu'un enfant la distingue de Nora et de Marine au premier coup d'œil,
  // avant même d'avoir lu son prénom.
  ines: {
    peau: '#8A5A3B',
    cheveux: '#241C18',
    coupe: 'boucles',
    vetement: '#5C7F14',
    lunettes: false,
  },
  // Professeure de philosophie. Seuls cheveux GRIS de l'équipe, et le carré
  // de Nora porté avec des lunettes : deux écarts suffisent à ce qu'un élève
  // ne les confonde pas, alors qu'il ne les croisera jamais dans la même
  // séance. L'âge apparent n'est pas un hasard non plus — la philosophie
  // n'arrive qu'en terminale, et un visage plus âgé dit sans un mot que ce
  // n'est pas une matière de plus.
  camille: {
    peau: '#C98F63',
    cheveux: '#8A8580',
    coupe: 'carre',
    vetement: '#5A4A8C',
    lunettes: true,
  },

  // ---------------------------------------------------------------------
  // L'ÉQUIPE DES SÉRIES TECHNOLOGIQUES (14/09/2026).
  //
  // Même règle que pour les autres : deux professeurs d'une même grille ne
  // se ressemblent pas. Un élève de STMG voit Karim à côté de Nora, Adrien,
  // Salim, Marine et Camille ; un élève de ST2S voit Élodie à côté de Yann et
  // d'Inès. Carnation, coupe, couleur de cheveux ou lunettes : au moins deux
  // écarts avec chacun de ses voisins.
  // ---------------------------------------------------------------------

  // Économie-gestion de STMG.
  karim: {
    peau: '#A8744E',
    cheveux: '#1C1714',
    coupe: 'courte',
    vetement: '#166534',
    lunettes: true,
  },
  // Espagnol en LV2 (14/09/2026). Elle côtoie tous les autres dans la grille
  // de l'élève qui l'a choisie : les cheveux roux ondulés et la carnation la
  // distinguent de Marine, sa voisine de langue.
  lucia: {
    peau: '#DDA982',
    cheveux: '#8E3B1E',
    coupe: 'boucles',
    vetement: '#BE123C',
    lunettes: false,
  },
  // LES QUATRE PROFESSEURS DE LANGUE DU 04/10/2026 — allemand, italien,
  // chinois, arabe. Le dessin n'est plus que le repli : Camara a fourni
  // leurs portraits le jour même (voir PHOTOS).
  jonas: {
    peau: '#F1CFB0',
    cheveux: '#C9A45C',
    coupe: 'courte',
    vetement: '#3730A3',
    lunettes: true,
  },
  giulia: {
    peau: '#E8B98F',
    cheveux: '#3B2416',
    coupe: 'queue',
    vetement: '#0E7490',
    lunettes: false,
  },
  lin: {
    peau: '#F3D3B0',
    cheveux: '#17120F',
    coupe: 'carre',
    vetement: '#A16207',
    lunettes: false,
  },
  youssef: {
    peau: '#C68E63',
    cheveux: '#1C1714',
    coupe: 'courte',
    vetement: '#0F766E',
    lunettes: false,
  },
  // LA CONSEILLÈRE D'ORIENTATION (11/10/2026) — le dessin n'est plus que le
  // repli : Camara a fourni son portrait le jour même (voir PHOTOS).
  maelle: {
    peau: '#EBC2A0',
    cheveux: '#6B3E26',
    coupe: 'boucles',
    vetement: '#6D28D9',
    lunettes: true,
  },
  // Sciences et techniques sanitaires et sociales.
  elodie: {
    peau: '#F1CFB0',
    cheveux: '#5A3825',
    coupe: 'queue',
    vetement: '#B91C1C',
    lunettes: false,
  },

  // ---------------------------------------------------------------------
  // LES SPÉCIALITÉS DE LA VOIE GÉNÉRALE (14/09/2026) : deux nouveaux visages.
  // Les autres spécialités vont à des professeurs déjà là.
  // ---------------------------------------------------------------------

  // Éducation physique, pratiques et culture sportives. Seuls cheveux blonds
  // courts de l'équipe : il ne se confond ni avec Yann, ni avec Karim, ni
  // avec Salim.
  theo: {
    peau: '#C68A5E',
    cheveux: '#D9A441',
    coupe: 'courte',
    vetement: '#C2410C',
    lunettes: false,
  },
  // Les sept enseignements artistiques. Des boucles blondes et des lunettes :
  // deux écarts avec Inès et avec Lucía.
  jeanne: {
    peau: '#F5D0B5',
    cheveux: '#E3C16F',
    coupe: 'boucles',
    vetement: '#86198F',
    lunettes: true,
  },

  // Numérique et sciences informatiques (15/09/2026), d'abord confiée à Nora.
  // Son image (`p_nsi.png`) prime ; ce dessin n'est que le repli. Boucles
  // courtes et carnation la plus foncée : deux écarts avec Salim, Karim, Inès
  // et Jeanne.
  minamba: {
    peau: '#5E3A26',
    cheveux: '#151111',
    coupe: 'boucles',
    vetement: '#AA5F04',
    lunettes: true,
  },

  // Prévention santé environnement, voie professionnelle (16/10/2026). Son
  // image (`p_pse.png`) prime. Cheveux châtain clair, sans lunettes : deux
  // écarts avec Théo (blond), Karim (lunettes, brun) et Salim.
  hugo: {
    peau: '#E9B98F',
    cheveux: '#7A5230',
    coupe: 'courte',
    vetement: '#9A3412',
    lunettes: false,
  },
};

/** Chevelure : dessinée sous et sur le visage selon la coupe. */
function Cheveux({ coupe, couleur }) {
  if (coupe === 'carre') {
    return (
      <>
        <path d="M18 44c0-16 6-26 22-26s22 10 22 26v14c0 3-2 5-5 5h-2V40H25v23h-2c-3 0-5-2-5-5z" fill={couleur} />
        <path d="M25 36c4-8 12-11 15-11s11 3 15 11c-6-4-11-5-15-5s-9 1-15 5z" fill={couleur} />
      </>
    );
  }

  if (coupe === 'boucles') {
    return (
      <>
        {/* Le volume est fait de cercles et non d'un contour lisse : une
            silhouette bouclée dessinée d'un seul trait donne un casque. */}
        <g fill={couleur}>
          <circle cx="40" cy="24" r="10" />
          <circle cx="26" cy="29" r="9" />
          <circle cx="54" cy="29" r="9" />
          <circle cx="21" cy="40" r="7" />
          <circle cx="59" cy="40" r="7" />
        </g>
        <path d="M22 42c0-13 8-21 18-21s18 8 18 21c-4-9-10-12-18-12s-14 3-18 12z" fill={couleur} />
      </>
    );
  }

  if (coupe === 'queue') {
    return (
      <>
        <path d="M60 40c6 2 9 8 8 15-1 6-4 10-8 12V40z" fill={couleur} />
        <path d="M21 42c0-14 8-23 19-23s19 9 19 23v2c-4-9-10-13-19-13s-15 4-19 13z" fill={couleur} />
      </>
    );
  }

  return <path d="M21 43c0-14 8-24 19-24s19 10 19 24c-4-10-10-14-19-14s-15 4-19 14z" fill={couleur} />;
}

/** L'élève a-t-il demandé moins de mouvement à son système ? */
const mouvementReduit = () => typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

/** Hauteur de repos d'une onde, et ce que chacune prend du niveau. */
const REPOS = 0.22;
const GAINS = [0.85, 1.2, 1];

/**
 * LES ONDES SUIVENT LE SON RÉEL.
 *
 * `niveau` est une fonction rendue par le lecteur de voix : le volume de
 * l'instant, entre 0 et 1, ou null quand le son ne passe pas par lui (la
 * voix du navigateur). Lu à chaque image et écrit DIRECTEMENT dans le style
 * des trois barres — soixante rendus React par seconde pour trois traits
 * seraient du gâchis.
 *
 * Montée immédiate, descente amortie : une syllabe se voit, et la barre ne
 * tremble pas entre deux. Sans `niveau`, ou tant qu'il rend null, l'ancienne
 * animation en boucle reste en place.
 */
function Ondes({ niveau }) {
  const racine = useRef(null);

  useEffect(() => {
    if (typeof niveau !== 'function' || typeof requestAnimationFrame !== 'function') return undefined;

    const barres = racine.current ? [...racine.current.children] : [];
    const hauteurs = barres.map(() => REPOS);
    let image = 0;

    const dessiner = () => {
      const volume = niveau();

      if (volume === null || volume === undefined) {
        racine.current?.classList.remove('avatar__ondes--reelles');
      } else {
        racine.current?.classList.add('avatar__ondes--reelles');

        barres.forEach((barre, i) => {
          const cible = Math.min(1, REPOS + volume * GAINS[i % GAINS.length]);
          hauteurs[i] = cible > hauteurs[i] ? cible : hauteurs[i] + (cible - hauteurs[i]) * 0.22;
          barre.style.transform = `scaleY(${hauteurs[i].toFixed(3)})`;
        });
      }

      image = requestAnimationFrame(dessiner);
    };

    image = requestAnimationFrame(dessiner);

    return () => {
      cancelAnimationFrame(image);
      barres.forEach((barre) => { barre.style.transform = ''; });
    };
  }, [niveau]);

  return (
    <span className="avatar__ondes" ref={racine}>
      <i /><i /><i />
    </span>
  );
}

export default function Avatar({ nom = 'nora', taille = 44, parle = false, couleur, niveau }) {
  const prof = PROFS[nom] ?? PROFS.nora;
  const accent = couleur ?? prof.vetement;
  const photo = PHOTOS[nom];
  const boucle = BOUCLES[nom];

  // LA BOUCLE N'EST CHARGÉE QU'À LA PREMIÈRE PAROLE : une liste de dictées ou
  // un tableau de bord qui affiche treize avatars n'en télécharge aucune.
  // Une fois montée, elle reste — elle se relance sans nouveau chargement.
  const [boucleMontee, setBoucleMontee] = useState(false);
  const video = useRef(null);

  useEffect(() => {
    if (parle && boucle && !mouvementReduit()) setBoucleMontee(true);
  }, [parle, boucle]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;

    try {
      if (parle) {
        // Refusée par le navigateur (économie d'énergie, onglet caché) : la
        // photo reste, et c'est très bien ainsi.
        v.play?.()?.catch?.(() => {});
      } else {
        v.pause?.();
        v.currentTime = 0;
      }
    } catch { /* un lecteur absent ne doit pas emporter l'avatar */ }
  }, [parle, boucleMontee]);

  return (
    <span
      className={`avatar ${parle ? 'avatar--parle' : ''}`}
      style={{ width: taille, height: taille, '--avatar-accent': accent, '--avatar-taille': `${taille}px` }}
    >
      {photo ? (
        // LE CADRE ROGNE L'IMAGE UN PEU À L'INTÉRIEUR DE SON DISQUE BLEU. Huit
        // images sur douze ont un fond vert opaque autour du disque : sans ce
        // rognage, un liseré vert entourerait le visage. Mesuré le 14/09/2026 :
        // le disque occupe au moins 46,3 % du côté, centré à 1 % près.
        <span className="avatar__cadre" style={{ width: taille, height: taille }} aria-hidden="true">
          <img className="avatar__photo" src={photo} alt="" />

          {/* LA BOUCLE, PAR-DESSUS LA PHOTO, AVEC LE MÊME ROGNAGE : le fond
              vert que le modèle a posé dans les coins tombe hors du cadre
              exactement comme celui des portraits. Elle apparaît en fondu ;
              au repos, c'est la photo qu'on voit. */}
          {boucleMontee && (
            <video
              ref={video}
              className={`avatar__photo avatar__boucle ${parle ? 'avatar__boucle--visible' : ''}`}
              src={boucle}
              loop
              muted
              playsInline
              preload="auto"
              tabIndex={-1}
            />
          )}
        </span>
      ) : (
      <svg viewBox="0 0 80 80" width={taille} height={taille} role="img" aria-hidden="true">
        <circle cx="40" cy="40" r="40" fill={accent} opacity="0.14" />

        {/* Buste */}
        <path d="M14 80c0-13 12-21 26-21s26 8 26 21z" fill={accent} />
        <path d="M32 56h16v8c0 3-3 5-8 5s-8-2-8-5z" fill={prof.peau} />

        {/* Visage */}
        <ellipse cx="40" cy="40" rx="19" ry="21" fill={prof.peau} />

        <Cheveux coupe={prof.coupe} couleur={prof.cheveux} />

        {/* Yeux */}
        <circle cx="33" cy="41" r="2.1" fill="#2A2320" />
        <circle cx="47" cy="41" r="2.1" fill="#2A2320" />

        {prof.lunettes && (
          <g stroke="#2A2320" strokeWidth="1.4" fill="none" opacity="0.85">
            <circle cx="33" cy="41" r="6" />
            <circle cx="47" cy="41" r="6" />
            <path d="M39 41h2" />
          </g>
        )}

        {/* Sourire */}
        <path
          d="M34 49c2 2.6 4 3.8 6 3.8s4-1.2 6-3.8"
          stroke="#B2705A"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      )}

      {parle && <Ondes niveau={niveau} />}
    </span>
  );
}
