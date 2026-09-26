import { useEffect } from 'react';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { imprimerSous, nomDocument } from '../lib/impression';
import ExpressionEcriteDetail from './ExpressionEcriteDetail';
import ExpressionOraleDetail from './ExpressionOraleDetail';

/**
 * UNE EXPRESSION, ÉCRITE OU ORALE, VUE PAR LE PARENT ET IMPRIMABLE — Camara,
 * le 24/09/2026 : « pour les expressions écrites, comme pour les dictées,
 * j'aimerais que le parent y ait accès et puisse le télécharger en PDF.
 * Pareil pour l'expression orale. »
 *
 * UN SEUL COMPOSANT POUR LES DEUX, et ce n'est pas de l'économie : les deux
 * documents ne diffèrent que par leur corps — un texte corrigé d'un côté, une
 * conversation de l'autre. L'en-tête, la feuille, l'impression et la fermeture
 * sont identiques. Deux composants auraient divergé au premier ajustement de
 * l'en-tête, et le parent aurait eu deux mises en page pour deux documents que
 * rien ne distingue à ses yeux.
 *
 * LA FEUILLE EST CELLE DE LA COPIE DE CONTRÔLE (`.controle`), déjà écrite,
 * déjà éprouvée à l'impression : logo pour fond clair sur le papier, titres,
 * identité de l'élève, et les règles de coupure de page. Reprendre ses classes
 * plutôt qu'en écrire d'autres, c'est hériter de tout ça sans le redire.
 *
 * L'ÉLÈVE ARRIVE EN PROPRIÉTÉ, il n'est pas dans le document : ni
 * `ExpressionEcriteEleve` ni `ExpressionOraleEleve` ne portent le prénom —
 * l'archive est toujours lue depuis un élève qu'on connaît déjà. La fiche le
 * sait, elle le passe.
 */
const dateLongue = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    : '';

export default function ExpressionCopie({ type, document: doc, photo, eleve, onFermer }) {
  // Échap ferme, comme partout ailleurs : un parent qui a fini de lire ne
  // cherche pas le bouton.
  useEffect(() => {
    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') onFermer?.();
    };

    window.document.addEventListener('keydown', auClavier);
    return () => window.document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  if (!doc) return null;

  const orale = type === 'orale';
  const surTitre = orale ? 'Expression orale' : 'Expression écrite';
  const identite = [eleve?.prenom, eleve?.nom].filter(Boolean).join(' ');

  return (
    <div
      className="modale modale--expression"
      role="dialog"
      aria-modal="true"
      aria-label={surTitre}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer?.(); }}
    >
      <div className="modale__boite modale__boite--controle">
        <article className="controle expression-copie">
          {/* Deux fichiers plutôt qu'un filtre : sur le papier c'est toujours
              la version pour fond clair, quel que soit le thème du parent. */}
          <div className="controle__marque">
            <img src={logoFondClair} alt="Mimia" className="controle__logo controle__logo--clair" />
            <img src={logoFondSombre} alt="" aria-hidden="true" className="controle__logo controle__logo--sombre" />
          </div>

          <header className="controle__entete">
            <div>
              <p className="controle__sur-titre">
                {surTitre}
                {doc.matiereLibelle && ` · ${doc.matiereLibelle}`}
              </p>
              <h2 className="controle__titre">{doc.titre || surTitre}</h2>

              {identite && (
                <p className="controle__identite">
                  {identite}
                  {eleve?.niveauLibelle && ` · ${eleve.niveauLibelle}`}
                </p>
              )}

              <p className="controle__meta">
                {dateLongue(doc.dateCreation)}
                {doc.profPrenom && ` · avec ${doc.profPrenom}`}
              </p>
            </div>
          </header>

          {orale ? (
            <ExpressionOraleDetail conversation={doc} prenomEleve={eleve?.prenom} />
          ) : (
            <ExpressionEcriteDetail texte={doc} photo={photo} />
          )}

          {doc.remarque && (
            <section className="controle__observation">
              <h3>Ce qu’en dit le professeur</h3>
              <p>{doc.remarque}</p>
            </section>
          )}
        </article>

        <div className="modale__actions modale__actions--controle">
          <button
            type="button"
            className="btn btn--compact"
            onClick={() =>
              imprimerSous(
                nomDocument({
                  prenom: eleve?.prenom,
                  nom: eleve?.nom,
                  matiere: doc.matiereLibelle,
                  date: doc.dateCreation,
                  suffixe: orale ? 'Expression-orale' : 'Expression-ecrite',
                }),
                '.modale--expression',
              )
            }
          >
            Télécharger en PDF
          </button>
          <button type="button" className="btn-ghost" onClick={onFermer}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
