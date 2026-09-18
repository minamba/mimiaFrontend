import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import {
  getExpressionsEcrites, getExpressionEcrite, marquerExpressionEcriteVue,
  chargerPhotoExpressionEcrite,
} from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import Avatar from './Avatar';
import ExpressionEcriteDetail from './ExpressionEcriteDetail';
import Loader from './Loader';

/**
 * LES TEXTES ÉCRITS d'un élève dans une matière — Camara, le 18/09/2026 :
 * « faut archiver comme les autres ».
 *
 * LE TROISIÈME ÉCRAN DE LA FAMILLE, et les trois se distinguent par ce qu'ils
 * gardent : la compréhension orale garde ce qu'il a ENTENDU, l'expression
 * orale ce qu'il a DIT, celui-ci ce qu'il a ÉCRIT. C'est le seul où son
 * orthographe se voit.
 *
 * RANGÉS PAR JOUR, comme les conversations et pour la même raison : un enfant
 * qui cherche « le texte sur mes vacances » se repère à la date avant de se
 * repérer au titre.
 */

/** Le jour d'un texte, en clé comparable — « 2026-09-18 ». */
const jourDe = (iso) => (iso ?? '').slice(0, 10);

/** Le jour, écrit comme on le dirait. Même règle que sur les conversations. */
function libelleJour(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';

  const jour = (d) => new Date(d).toISOString().slice(0, 10);
  const aujourdHui = jour(new Date());

  const hier = new Date();
  hier.setDate(hier.getDate() - 1);

  if (jour(date) === aujourdHui) return 'Aujourd’hui';
  if (jour(date) === jour(hier)) return 'Hier';

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

const heureDe = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Ce qu'on dit d'un texte sans l'ouvrir : sa longueur, et ce qu'il y avait à
 * retravailler.
 *
 * LES RÉUSSITES NE SONT PAS COMPTÉES ICI — le serveur les a déjà écartées.
 * « 6 points » dont trois compliments se lirait comme six fautes.
 */
function resume(texte) {
  const bouts = [];

  // PAS ENCORE RECOPIÉ : on le dit, plutôt que d'afficher « 0 mots » — ce
  // qui laisserait croire que l’enfant n’a rien écrit alors que sa page est
  // là, en photo.
  //
  // `=== false` ET NON `!texte.transcrit` : un champ absent veut dire « le
  // serveur ne s'est pas prononcé », pas « pas recopié ». Sans cette nuance,
  // toute ligne d'une version antérieure s'annoncerait comme un travail en
  // souffrance qui n'existe pas.
  if (texte.transcrit === false) {
    return texte.aPhoto ? 'À recopier par ton professeur' : '';
  }

  if (texte.nombreMots > 0) bouts.push(`${texte.nombreMots} mots`);

  if (texte.nombreReprises > 0) {
    bouts.push(`${texte.nombreReprises} point${texte.nombreReprises > 1 ? 's' : ''} à revoir`);
  }

  return bouts.join(' · ');
}

export default function ExpressionsEcrites() {
  const { eleveId, matiereId } = useParams();
  const dispatch = useDispatch();

  const { matieres } = useSelector((state) => state.referentiel);
  const { liste } = useSelector((state) => state.eleves);

  const [textes, setTextes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // L'identifiant plutôt qu'un booléen, pour n'afficher « … » que sur la ligne
  // cliquée.
  const [ouvert, setOuvert] = useState(null);
  const [ouverture, setOuverture] = useState(null);

  // L'URL locale de la photo, à révoquer à la fermeture : sans ça, chaque
  // ouverture laisserait une page de cahier en mémoire jusqu’au rechargement.
  const [photo, setPhoto] = useState(null);

  const fermer = useCallback(() => {
    setOuvert(null);

    setPhoto((actuelle) => {
      if (actuelle) URL.revokeObjectURL(actuelle);
      return null;
    });
  }, []);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const matiere = matieres.find((m) => String(m.id) === String(matiereId));

  useEffect(() => {
    if (matieres.length === 0) dispatch(chargerReferentiel());
    if (liste.length === 0) dispatch(chargerEleves());
  }, [dispatch, matieres.length, liste.length]);

  useEffect(() => {
    let vivant = true;

    getExpressionsEcrites(eleveId, matiereId)
      .then(({ data }) => { if (vivant) setTextes(data ?? []); })
      .catch(() => {
        if (vivant) setErreur('Tes textes n’ont pas pu être chargés.');
      })
      .finally(() => { if (vivant) setChargement(false); });

    return () => { vivant = false; };
  }, [eleveId, matiereId]);

  /** Les textes groupés par jour, le plus récent en tête. */
  const jours = useMemo(() => {
    const parJour = new Map();

    [...textes]
      .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
      .forEach((t) => {
        const cle = jourDe(t.dateCreation);
        if (!parJour.has(cle)) parJour.set(cle, { cle, date: t.dateCreation, lignes: [] });
        parJour.get(cle).lignes.push(t);
      });

    return [...parJour.values()];
  }, [textes]);

  /**
   * Ouvre un texte : on va chercher sa copie et sa correction, puis on éteint
   * sa pastille.
   *
   * NI LE TEXTE NI LA CORRECTION NE SONT DANS LA LISTE : trente textes
   * feraient transiter trente rédactions pour afficher trente titres.
   */
  const ouvrir = async (texte) => {
    setOuverture(texte.id);

    try {
      const { data } = await getExpressionEcrite(eleveId, texte.id);
      setOuvert(data);

      // LA PHOTO NE SE CHARGE QUE QUAND ELLE SERT : une copie déjà recopiée
      // a son texte, et la page de cahier pèse des mégaoctets.
      if (data?.aPhoto && !data?.transcrit) {
        const lien = await chargerPhotoExpressionEcrite(eleveId, texte.id);
        if (lien) setPhoto(lien);
      }

      // LA PASTILLE S'ÉTEINT APRÈS L'OUVERTURE, jamais avant : une lecture qui
      // échoue ne doit pas faire disparaître le « à consulter » d'un texte que
      // l'enfant n'a pas vu.
      if (!texte.dateConsultation) {
        marquerExpressionEcriteVue(eleveId, texte.id).catch(() => {});

        setTextes((actuels) => actuels.map((t) => (
          t.id === texte.id
            ? { ...t, dateConsultation: new Date().toISOString() }
            : t
        )));
      }
    } catch {
      setErreur('Ce texte n’a pas pu être ouvert.');
    } finally {
      setOuverture(null);
    }
  };

  const teinte = matiere?.profCouleur;

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
          {matiere?.libelle && (
            <p className="fiches-entete__sur-titre">{matiere.libelle}</p>
          )}

          <h1>Expressions écrites</h1>

          <p className="fiches-entete__ligne">
            {[
              matiere?.profPrenom && `Avec ${matiere.profPrenom}`,
              eleve && `pour ${eleve.prenom}`,
            ].filter(Boolean).join(' ')}
          </p>
        </div>
      </header>

      {chargement && <Loader texte="Chargement de tes textes…" />}
      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && !erreur && jours.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore de texte ici.</p>
          <p>
            {matiere?.profPrenom ?? 'Ton professeur'} rangera ici chaque texte que
            tu auras écrit, avec sa correction à côté. C’est en relisant les deux
            ensemble qu’on voit ce qu’on a appris.
          </p>
        </div>
      )}

      {jours.map((jour) => (
        <section key={jour.cle} className="expr-jour">
          <h2 className="expr-jour__titre">{libelleJour(jour.date)}</h2>

          <ul className="expr-liste">
            {jour.lignes.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`expr-ligne${t.dateConsultation ? '' : ' expr-ligne--nouvelle'}`}
                  onClick={() => ouvrir(t)}
                  disabled={ouverture === t.id}
                >
                  {!t.dateConsultation && (
                    <span className="expr-ligne__pastille" aria-hidden="true" />
                  )}

                  <span className="expr-ligne__titre">{t.titre}</span>

                  <span className="expr-ligne__detail">
                    {[heureDe(t.dateCreation), resume(t)].filter(Boolean).join(' · ')}
                  </span>

                  <span className="expr-ligne__fleche" aria-hidden="true">
                    {ouverture === t.id ? '…' : '→'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {ouvert && (
        <div
          className="modale"
          role="dialog"
          aria-modal="true"
          aria-label={ouvert.titre}
          onMouseDown={(e) => { if (e.target === e.currentTarget) fermer(); }}
        >
          <div className="modale__boite modale__boite--large">
            <h3 className="modale__titre">{ouvert.titre}</h3>

            <ExpressionEcriteDetail texte={ouvert} photo={photo} />

            <div className="modale__actions">
              <button
                type="button"
                className="btn btn--compact"
                onClick={fermer}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
