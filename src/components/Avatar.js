/**
 * Visage du professeur.
 *
 * Dessiné en SVG plutôt qu'importé en image : net à toute taille, aucun
 * fichier à héberger, et la couleur s'adapte à la matière. Pour un enfant,
 * c'est ce visage qui fait qu'il retrouve « son » prof d'une séance à l'autre.
 */

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

  return (
    <span
      className={`avatar ${parle ? 'avatar--parle' : ''}`}
      style={{ width: taille, height: taille, '--avatar-accent': accent }}
    >
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

      {parle && (
        <span className="avatar__ondes">
          <i /><i /><i />
        </span>
      )}
    </span>
  );
}
