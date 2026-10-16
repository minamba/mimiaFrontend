import { useId, useRef } from 'react';
import TexteFiche from './TexteFiche';
import useTraits from './useTraits';
import { Ajoute } from './BlocsFiche';
import { couleurFamille } from '../../lib/mesFiches/typesFiches';
import { texteNu } from '../../lib/mesFiches/texteFiche';

/**
 * LA FICHE VISUELLE : UNE CARTE MENTALE QUI EXPLIQUE — d'après le modèle de
 * Camara (14/10/2026). La notion au centre, dans un nuage ; autour, une bulle
 * par idée, chacune dans sa couleur : son nom à la main, sa définition, son
 * exemple. Des flèches courbes partent du centre vers chaque bulle.
 *
 * « Elles doivent être belles » (Camara) : rien n'est une image générée, qui
 * écrirait mal les mots. Les bulles sont du texte, les flèches un calque
 * dessiné par-dessus, la police manuscrite est celle du site (Caveat).
 *
 * LA PLACE DES BULLES AUTOUR DU CENTRE dépend de leur nombre, pour que la
 * carte reste équilibrée : en croix à quatre, en couronne à huit. Au-delà de
 * huit, la carte ne se lirait plus — le module en génère au plus huit.
 *
 * Sur téléphone, la couronne ne tient pas : le centre passe en haut, les
 * bulles s'empilent dessous, et les flèches disparaissent.
 */
const PLACES = {
  1: ['bc'],
  2: ['ml', 'mr'],
  3: ['tc', 'bl', 'br'],
  4: ['tl', 'tr', 'bl', 'br'],
  5: ['tl', 'tr', 'ml', 'mr', 'bc'],
  6: ['tl', 'tc', 'tr', 'bl', 'bc', 'br'],
  7: ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'br'],
  8: ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'],
};

function Bulle({ branche, rang, place }) {
  return (
    <div
      className={`fdr-bulle fdr-c-${couleurFamille(rang)}`}
      style={place ? { gridArea: place } : undefined}
      data-ancre={`b${rang}`}
    >
      <p className="fdr-bulle__nom"><TexteFiche texte={branche.titre} /></p>
      {branche.texte && <p className="fdr-bulle__texte"><TexteFiche texte={branche.texte} /></p>}
      {branche.exemple && (
        <p className="fdr-bulle__exemple">
          <TexteFiche texte={branche.exemple} />
          {branche.ajoute && <Ajoute />}
        </p>
      )}
      {branche.enfants?.length > 0 && (
        <ul className="fdr-bulle__enfants">
          {branche.enfants.map((enfant) => (
            <li key={enfant.titre}>
              <strong><TexteFiche texte={enfant.titre} /></strong>
              {enfant.texte && <> — <TexteFiche texte={enfant.texte} /></>}
              {enfant.exemple && (
                <span className="fdr-bulle__exemple"> <TexteFiche texte={enfant.exemple} /></span>
              )}
              {enfant.ajoute && <Ajoute />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CarteVisuelle({ bloc }) {
  const conteneur = useRef(null);
  // Deux cartes sur une même page ne partagent pas leurs pointes de flèche.
  const base = useId().replace(/[^a-zA-Z0-9]/g, '');
  const pointe = (couleur) => `fdr-pointe-${base}-${couleur}`;
  const branches = (bloc.branches ?? []).slice(0, 8);
  const places = PLACES[branches.length] ?? [];

  const liens = branches.map((_, i) => ({
    de: 'centre', a: `b${i}`, couleur: couleurFamille(i), forme: 'fleche',
  }));

  const traits = useTraits(conteneur, liens);

  return (
    <div
      className={`fdr-carte fdr-carte--${branches.length}`}
      ref={conteneur}
      role="group"
      aria-label={`Carte mentale : ${texteNu(bloc.centre)}`}
    >
      <svg
        className="fdr-traits"
        width={traits.largeur}
        height={traits.hauteur}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {branches.map((_, i) => (
            <marker
              key={couleurFamille(i)}
              id={pointe(couleurFamille(i))}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 Z" className={`fdr-pointe fdr-c-${couleurFamille(i)}`} />
            </marker>
          ))}
        </defs>
        {traits.chemins.map((c) => (
          <path
            key={c.a}
            d={c.d}
            className={`fdr-trait fdr-trait--fleche fdr-c-${c.couleur}`}
            markerEnd={`url(#${pointe(c.couleur)})`}
          />
        ))}
      </svg>

      <div className="fdr-carte__centre" style={{ gridArea: 'mc' }} data-ancre="centre">
        <p className="fdr-carte__titre"><TexteFiche texte={bloc.centre} /></p>
        {bloc.sousTitre && <p className="fdr-carte__sous-titre"><TexteFiche texte={bloc.sousTitre} /></p>}
      </div>

      {branches.map((branche, i) => (
        <Bulle key={branche.titre} branche={branche} rang={i} place={places[i]} />
      ))}
    </div>
  );
}
