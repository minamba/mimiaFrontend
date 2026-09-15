/**
 * Visage du professeur.
 *
 * Dessiné en SVG plutôt qu'importé en image : net à toute taille, aucun
 * fichier à héberger, et la couleur s'adapte à la matière. Pour un enfant,
 * c'est ce visage qui fait qu'il retrouve « son » prof d'une séance à l'autre.
 */

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

export default function Avatar({ nom = 'nora', taille = 44, parle = false, couleur }) {
  const prof = PROFS[nom] ?? PROFS.nora;
  const accent = couleur ?? prof.vetement;
  const photo = PHOTOS[nom];

  return (
    <span
      className={`avatar ${parle ? 'avatar--parle' : ''}`}
      style={{ width: taille, height: taille, '--avatar-accent': accent }}
    >
      {photo ? (
        // LE CADRE ROGNE L'IMAGE UN PEU À L'INTÉRIEUR DE SON DISQUE BLEU. Huit
        // images sur douze ont un fond vert opaque autour du disque : sans ce
        // rognage, un liseré vert entourerait le visage. Mesuré le 14/09/2026 :
        // le disque occupe au moins 46,3 % du côté, centré à 1 % près.
        <span className="avatar__cadre" style={{ width: taille, height: taille }} aria-hidden="true">
          <img className="avatar__photo" src={photo} alt="" />
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

      {parle && (
        <span className="avatar__ondes">
          <i /><i /><i />
        </span>
      )}
    </span>
  );
}
