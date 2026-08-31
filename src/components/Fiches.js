import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import { getFiches } from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import { etatFiche, nouveaute } from '../lib/fiches';
import Avatar from './Avatar';
import Loader from './Loader';

/**
 * Les fiches de révision d'un élève dans une matière.
 *
 * Rangées par domaine — Nombres et calculs, Géométrie… — parce que c'est ainsi
 * qu'un enfant cherche : il ne se souvient pas du nom exact de la notion, il
 * se souvient du chapitre. Le champ de recherche n'apparaît qu'au-delà de dix
 * fiches : en dessous, l'œil va plus vite que le clavier.
 */

const SEUIL_RECHERCHE = 10;

/**
 * Nombre de fiches montrées par domaine avant de replier le reste.
 *
 * Une matière suivie deux ans en compte des dizaines. Toutes les rendre d'un
 * coup allonge la page sans qu'on y trouve rien : au-delà d'une dizaine, on
 * cherche, on ne parcourt plus. Le bouton « voir les N autres » garde le reste
 * à portée sans le mettre en travers.
 */
const PAR_DOMAINE = 8;

const SANS_DOMAINE = 'Autres notions';

const dateCourte = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : '';

/** Les signes diacritiques, à retirer après décomposition NFD. */
const ACCENTS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Accents et casse retirés : « géométrie » doit trouver « Geometrie ». */
const aplatir = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(ACCENTS, '')
    .toLowerCase();

export default function Fiches() {
  const { eleveId, matiereId } = useParams();
  const dispatch = useDispatch();

  const { matieres } = useSelector((state) => state.referentiel);
  const { liste } = useSelector((state) => state.eleves);

  const [fiches, setFiches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');

  // Les domaines dont l'élève a demandé à voir toutes les fiches.
  const [deplies, setDeplies] = useState({});

  const matiere = matieres.find((m) => String(m.id) === String(matiereId));
  const eleve = liste.find((e) => String(e.id) === String(eleveId));

  useEffect(() => {
    if (matieres.length === 0) dispatch(chargerReferentiel());
    if (liste.length === 0) dispatch(chargerEleves());
  }, [dispatch, matieres.length, liste.length]);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur('');

    try {
      const { data } = await getFiches(eleveId, matiereId);
      setFiches(data ?? []);
    } catch {
      setErreur('Les fiches n’ont pas pu être chargées.');
    } finally {
      setChargement(false);
    }
  }, [eleveId, matiereId]);

  useEffect(() => {
    charger();
  }, [charger]);

  const filtrees = useMemo(() => {
    const terme = aplatir(recherche.trim());
    if (!terme) return fiches;

    return fiches.filter(
      (fiche) =>
        aplatir(fiche.notion).includes(terme)
        || aplatir(fiche.domaine).includes(terme)
        || aplatir(fiche.contenu).includes(terme),
    );
  }, [fiches, recherche]);

  /**
   * Les fiches regroupées par domaine, l'ordre des groupes suivant celui de la
   * fiche la plus récente : la matière travaillée cette semaine remonte en
   * haut d'elle-même, sans qu'on ait à trier quoi que ce soit à la main.
   */
  const groupes = useMemo(() => {
    const parDomaine = new Map();

    filtrees.forEach((fiche) => {
      const cle = fiche.domaine?.trim() || SANS_DOMAINE;
      if (!parDomaine.has(cle)) parDomaine.set(cle, []);
      parDomaine.get(cle).push(fiche);
    });

    return [...parDomaine.entries()].map(([domaine, lignes]) => ({ domaine, lignes }));
  }, [filtrees]);

  // Sur toutes les fiches, pas seulement celles que le filtre laisse passer :
  // annoncer « 2 à consulter » puis n'en montrer qu'une serait déroutant.
  //
  // Les deux motifs sont comptés SÉPARÉMENT, parce qu'ils n'appellent pas le
  // même geste — et le total, lui, doit tomber juste sur celui qu'affiche la
  // carte de la matière, sinon le rappel dément la promesse qui a amené
  // l'élève ici.
  const aLire = useMemo(() => {
    const signaux = fiches.map((f) => nouveaute(f)?.cle).filter(Boolean);

    return {
      maj: signaux.filter((cle) => cle === 'maj').length,
      neuves: signaux.filter((cle) => cle === 'neuve').length,
      total: signaux.length,
    };
  }, [fiches]);

  const teinte = matiere?.profCouleur || 'var(--accent)';

  // Deux jeux de teintes, et ils ne servent pas à la même chose : `--teinte`
  // est la couleur du professeur telle qu'elle est en base, bonne pour un
  // aplat (le liseré des cartes) ; `--matiere` et sa variante claire sont
  // celles qui tiennent le contraste en TEXTE, thème par thème.
  return (
    <section
      className="page page--large"
      style={{ '--teinte': teinte, ...styleMatiere(matiere) }}
    >
      <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">
        <span aria-hidden="true">←</span> Mes matières
      </Link>

      <header className="fiches-entete">
        {matiere && (
          <span className="fiches-entete__avatar">
            <Avatar nom={matiere.profAvatar} couleur={matiere.profCouleur} taille={56} />
          </span>
        )}

        <div className="fiches-entete__texte">
          {/* La matière remonte au-dessus du titre, dans sa couleur. Elle était
              noyée dans une ligne grise avec deux autres informations, alors
              que c'est elle qui situe la page. */}
          {matiere?.libelle && (
            <p className="fiches-entete__sur-titre">{matiere.libelle}</p>
          )}

          <h1>Fiches de révision</h1>

          <p className="fiches-entete__ligne">
            {[
              matiere?.profPrenom && `Écrites par ${matiere.profPrenom}`,
              eleve && `pour ${eleve.prenom}`,
            ]
              .filter(Boolean)
              .join(' ')}
          </p>

          {/* Le rappel global. Il compte exactement ce que les pastilles des
              cartes signalent, sinon un total de trois au-dessus d'une seule
              carte marquée se lirait comme un défaut. Les réécritures passent
              en premier : c'est ce qu'il faut ouvrir d'abord. */}
          {aLire.total > 0 && (
            <p className="fiches-entete__alerte">
              <span className="fiches-entete__point" aria-hidden="true" />
              {[
                aLire.maj > 0 &&
                  `${aLire.maj} fiche${aLire.maj > 1 ? 's' : ''} mise${aLire.maj > 1 ? 's' : ''} à jour`,
                aLire.neuves > 0 &&
                  `${aLire.neuves} jamais ouverte${aLire.neuves > 1 ? 's' : ''}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
      </header>

      {chargement && <Loader texte="Chargement des fiches…" />}
      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && !erreur && fiches.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore de fiche ici.</p>
          <p>
            {matiere?.profPrenom ?? 'Le professeur'} en écrit une dès qu{'’'}une
            notion a été vraiment travaillée, et la réécrit chaque fois que vous
            y revenez.
          </p>
          <Link to={`/eleves/${eleveId}/matieres`} className="btn btn--compact">
            Commencer un cours
          </Link>
        </div>
      )}

      {fiches.length > SEUIL_RECHERCHE && (
        <div className="fiches-recherche">
          <input
            type="search"
            value={recherche}
            onChange={(evenement) => setRecherche(evenement.target.value)}
            placeholder="Chercher une notion…"
            aria-label="Chercher une fiche"
          />
          <span className="fiches-recherche__compte">
            {filtrees.length} fiche{filtrees.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {fiches.length > 0 && filtrees.length === 0 && (
        <p className="fiches-vide__titre">Aucune fiche ne correspond à « {recherche} ».</p>
      )}

      {groupes.map((groupe) => {
        // Replié tant que l'élève n'a pas demandé à voir la suite. Une
        // recherche en cours annule le repli : il ne veut plus parcourir, il
        // cherche — lui cacher des résultats serait absurde.
        const deplie = recherche.trim().length > 0 || deplies[groupe.domaine];
        const visibles = deplie ? groupe.lignes : groupe.lignes.slice(0, PAR_DOMAINE);
        const caches = groupe.lignes.length - visibles.length;

        return (
        <div key={groupe.domaine} className="fiches-groupe">
          <h2 className="fiches-groupe__titre">
            {groupe.domaine}
            <span className="fiches-groupe__compte">{groupe.lignes.length}</span>
          </h2>

          <ul className="fiches-grille">
            {visibles.map((fiche) => {
              const signal = nouveaute(fiche);
              const etat = etatFiche(fiche);

              return (
                <li key={fiche.id}>
                  <Link
                    to={`/eleves/${eleveId}/fiches/${fiche.id}`}
                    /* Le liseré n'accompagne QUE la réécriture. Le poser aussi
                       sur les jamais-lues le mettrait sur cinq cartes de cinq,
                       et un repère que tout le monde porte ne repère plus
                       rien. */
                    className={`fiche-carte ${signal?.cle === 'maj' ? 'fiche-carte--signalee' : ''}`}
                  >
                    {signal && (
                      <span className={`fiche-signal fiche-signal--${signal.cle}`} title={signal.titre}>
                        {signal.libelle}
                      </span>
                    )}

                    <strong className="fiche-carte__titre">{fiche.notion}</strong>
                    <span className="fiche-carte__apercu">{fiche.apercu}</span>

                    <span className="fiche-carte__pied">
                      <span className={`fiche-etat fiche-etat--${etat.cle}`} title={etat.titre}>
                        {etat.libelle}
                      </span>
                      <span className="fiche-carte__date">{dateCourte(fiche.dateMiseAJour)}</span>
                      <span className="fiche-carte__lire">
                        Lire <span aria-hidden="true">→</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {caches > 0 && (
            <button
              type="button"
              className="fiches-groupe__plus"
              onClick={() => setDeplies((etat) => ({ ...etat, [groupe.domaine]: true }))}
            >
              Voir les {caches} autre{caches > 1 ? 's' : ''} <span aria-hidden="true">↓</span>
            </button>
          )}
        </div>
        );
      })}
    </section>
  );
}
