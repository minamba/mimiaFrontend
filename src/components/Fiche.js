import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';
import { getFiche, marquerFicheVue } from '../lib/api/elevesApi';
import { imprimerSous, nomDocument } from '../lib/impression';
import { etatFiche } from '../lib/fiches';
import Loader from './Loader';

/**
 * Une fiche de révision, en pleine page.
 *
 * Pleine page et non fenêtre modale, contrairement à la copie et au rapport :
 * ces deux-là se consultent une fois, alors qu'une fiche se relit la veille
 * d'un contrôle. On lui donne donc une adresse à elle, qu'on peut mettre en
 * favori, et toute la largeur pour lire sans piège de défilement.
 */

const dateLongue = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

/**
 * Rend le texte de la fiche.
 *
 * Le professeur écrit en texte simple : `##` pour un titre, `-` pour une puce,
 * `1.` pour une étape numérotée. On s'en tient à ces trois formes — accepter
 * du markdown complet obligerait à faire confiance au modèle sur du HTML, et
 * une fiche n'a besoin de rien de plus.
 */
function Corps({ contenu }) {
  const blocs = [];
  let puces = null; // liste en cours de construction, ou null

  const fermerListe = () => {
    if (puces) {
      blocs.push({ type: puces.type, lignes: puces.lignes, cle: blocs.length });
      puces = null;
    }
  };

  (contenu ?? '').split('\n').forEach((brute) => {
    const ligne = brute.trim();

    if (!ligne) {
      fermerListe();
      return;
    }

    if (ligne.startsWith('##')) {
      fermerListe();
      blocs.push({ type: 'titre', texte: ligne.replace(/^#+\s*/, ''), cle: blocs.length });
      return;
    }

    const puce = ligne.match(/^[-*•]\s+(.*)$/);
    const etape = ligne.match(/^\d+[.)]\s+(.*)$/);

    if (puce || etape) {
      const type = puce ? 'puces' : 'etapes';

      // Passer d'une liste à puces à une liste numérotée ouvre une nouvelle
      // liste : sans cela les deux se mélangeraient dans le même <ul>.
      if (puces && puces.type !== type) fermerListe();
      if (!puces) puces = { type, lignes: [] };

      puces.lignes.push((puce ?? etape)[1]);
      return;
    }

    fermerListe();
    blocs.push({ type: 'texte', texte: ligne, cle: blocs.length });
  });

  fermerListe();

  return (
    <div className="fiche__corps">
      {blocs.map((bloc) => {
        if (bloc.type === 'titre') return <h3 key={bloc.cle}>{bloc.texte}</h3>;
        if (bloc.type === 'texte') return <p key={bloc.cle}>{bloc.texte}</p>;

        const Liste = bloc.type === 'etapes' ? 'ol' : 'ul';

        return (
          <Liste key={bloc.cle} className={`fiche__${bloc.type}`}>
            {bloc.lignes.map((ligne, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>{ligne}</li>
            ))}
          </Liste>
        );
      })}
    </div>
  );
}

/** La feuille seule, sans le décor de la page. C'est elle qu'on imprime. */
export function FeuilleFiche({ fiche }) {
  return (
    <article className="fiche" style={{ '--teinte': fiche.profCouleur || 'var(--accent)' }}>
      <div className="controle__marque">
        <img src={logoFondClair} alt="Mimia" className="controle__logo controle__logo--clair" />
        <img src={logoFondSombre} alt="" aria-hidden="true" className="controle__logo controle__logo--sombre" />
      </div>

      <header className="fiche__entete">
        <p className="fiche__sur-titre">
          Fiche de révision · {fiche.matiereLibelle}
          {fiche.domaine && ` · ${fiche.domaine}`}
        </p>

        <div className="fiche__ligne-titre">
          <h2 className="fiche__titre">{fiche.notion}</h2>
          <span
            className={`fiche-etat fiche-etat--${etatFiche(fiche).cle}`}
            title={etatFiche(fiche).titre}
          >
            {etatFiche(fiche).libelle}
          </span>
        </div>

        <p className="fiche__meta">
          {[fiche.elevePrenom, fiche.eleveNom].filter(Boolean).join(' ')}
          {fiche.eleveNiveau && ` · ${fiche.eleveNiveau}`}
          {fiche.profPrenom && ` · écrite par ${fiche.profPrenom}`}
          {fiche.dateMiseAJour && ` · ${dateLongue(fiche.dateMiseAJour)}`}
        </p>
      </header>

      <Corps contenu={fiche.contenu} />
    </article>
  );
}

export default function Fiche() {
  const { eleveId, ficheId } = useParams();

  const [fiche, setFiche] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');

    try {
      const { data } = await getFiche(eleveId, ficheId);
      setFiche(data);

      // Ouvrir la fiche vaut lecture : la pastille s'éteint. Échec silencieux
      // — rater ce marquage laisse une pastille de trop, ce qui est sans
      // gravité, alors qu'une erreur affichée masquerait la fiche elle-même.
      marquerFicheVue(eleveId, ficheId).catch(() => {});
    } catch {
      setErreur('Cette fiche est introuvable.');
    } finally {
      setChargement(false);
    }
  }, [eleveId, ficheId]);

  useEffect(() => {
    charger();
  }, [charger]);

  return (
    <section className="page page--fiche">
      <div className="fiche-page__barre">
        <Link
          to={
            fiche
              ? `/eleves/${eleveId}/matieres/${fiche.matiereId}/fiches`
              : `/eleves/${eleveId}/matieres`
          }
          className="lien-retour"
        >
          <span aria-hidden="true">←</span>{' '}
          {fiche ? `Fiches de ${fiche.matiereLibelle.toLowerCase()}` : 'Mes matières'}
        </Link>

        {fiche && (
          <button
            type="button"
            className="btn btn--compact"
            onClick={() =>
              imprimerSous(
                nomDocument({
                  prenom: fiche.elevePrenom,
                  nom: fiche.eleveNom,
                  matiere: fiche.matiereLibelle,
                  date: fiche.dateMiseAJour,
                  // La notion, sinon deux fiches écrites le même jour dans la
                  // même matière porteraient le même nom.
                  suffixe: `Fiche-${fiche.notion ?? ''}`,
                }),
                '.fiche',
              )
            }
          >
            Télécharger en PDF
          </button>
        )}
      </div>

      {chargement && <Loader texte="Chargement de la fiche…" />}
      {erreur && <div className="alert">{erreur}</div>}

      {fiche && <FeuilleFiche fiche={fiche} />}
    </section>
  );
}
