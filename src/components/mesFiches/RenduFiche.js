import { useEffect } from 'react';
import TexteFiche from './TexteFiche';
import ArbreExpress from './ArbreExpress';
import CarteVisuelle from './CarteVisuelle';
import {
  Encadre, Etapes, Intertitre, Liste, Paragraphe, Questions, Tableau,
} from './BlocsFiche';
import { typeFiche } from '../../lib/mesFiches/typesFiches';
import { installerImpression } from '../../lib/mesFiches/impression';
import logoFondClair from '../../assets/logo-fond-clair.png';
import './mesFiches.css';

/**
 * UNE FICHE DE RÉVISION, TELLE QUE L'ENFANT LA LIT ET L'IMPRIME.
 *
 * Une feuille de papier posée sur la page : claire même en thème sombre,
 * parce que c'est un document — celui qu'on imprime et qu'on glisse dans
 * son classeur. Ce qui s'affiche à l'écran est ce qui sort de l'imprimante.
 *
 * LE CONTENU EST UNE SUITE DE BRIQUES (voir `BlocsFiche`). Une brique d'un
 * type inconnu n'est pas affichée : une fiche à moitié lisible vaut mieux
 * qu'une page cassée.
 */
const BRIQUES = {
  paragraphe: Paragraphe,
  intertitre: Intertitre,
  tableau: Tableau,
  liste: Liste,
  etapes: Etapes,
  encadre: Encadre,
  questions: Questions,
  arbre: ArbreExpress,
  carte: CarteVisuelle,
};

/**
 * `miniature` : l'aperçu réduit d'un type de fiche, sur la page de création
 * (Camara, le 15/10/2026). Sans en-tête — c'est le corps qui distingue un
 * type d'un autre —, et sans entrer dans l'impression.
 */
export default function RenduFiche({ fiche, miniature = false }) {
  const type = typeFiche(fiche.type);

  // Ctrl+P comme le bouton : seule la fiche s'imprime (voir impression.js).
  useEffect(installerImpression, []);

  return (
    <article
      className={`fdr-feuille fdr-feuille--${fiche.type}${miniature ? ' fdr-feuille--miniature' : ''}`}
      aria-labelledby={miniature ? undefined : `fdr-titre-${fiche.id}`}
    >
      {!miniature && (
        <header className="fdr-entete">
          {/* LE LOGO, SUR LE PAPIER SEULEMENT — Camara, le 14/10/2026 : « la
              fiche doit contenir le logo Mimia ». À l'écran, le site l'a déjà. */}
          <img src={logoFondClair} alt="Mimia" className="fdr-entete__logo" />
          <p className="fdr-entete__ligne">
            {fiche.matiere && <span className="fdr-entete__matiere">{fiche.matiere}</span>}
            {type && <span className="fdr-entete__type">{type.libelle}</span>}
            {fiche.position && (
              <span className="fdr-entete__position">
                Notion {fiche.position.rang} sur {fiche.position.total}
              </span>
            )}
          </p>
          <h2 className="fdr-entete__titre" id={`fdr-titre-${fiche.id}`}>
            <span className="fdr-surligne"><TexteFiche texte={fiche.titre} /></span>
          </h2>
          {fiche.cours && <p className="fdr-entete__cours">Cours : {fiche.cours}</p>}
        </header>
      )}

      <div className="fdr-corps">
        {(fiche.blocs ?? []).map((bloc, rang) => {
          const Brique = BRIQUES[bloc.type];
          if (!Brique) return null;
          // Les briques d'une fiche ne bougent pas : leur rang est une clé stable.
          // eslint-disable-next-line react/no-array-index-key
          return <Brique key={rang} bloc={bloc} />;
        })}
      </div>
    </article>
  );
}
