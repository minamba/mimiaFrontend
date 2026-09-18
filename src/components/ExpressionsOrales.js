import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import {
  getExpressionsOrales, getExpressionOrale, marquerExpressionOraleVue,
} from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import Avatar from './Avatar';
import ExpressionOraleDetail from './ExpressionOraleDetail';
import Loader from './Loader';

/**
 * LES CONVERSATIONS D'EXPRESSION ORALE d'un élève dans une matière — voulu par
 * Camara le 18/09/2026.
 *
 * CE N'EST PAS LA COMPRÉHENSION ORALE, et l'écran le montre : là-bas on
 * réécoute un passage lu par le professeur et on relit ce qu'on en avait
 * compris ; ici on relit une CONVERSATION, où les deux ont parlé dans la
 * langue du cours.
 *
 * RANGÉES PAR JOUR : « ça sera rangé par jour et par discussion ». Un enfant
 * qui cherche « la fois où on a parlé du restaurant » se repère à la date bien
 * avant de se repérer au titre — et deux conversations du même jour se lisent
 * ensemble, elles racontent la même séance.
 */

/** Le jour d'une conversation, en clé comparable — « 2026-09-18 ». */
const jourDe = (iso) => (iso ?? '').slice(0, 10);

/**
 * Le jour, écrit comme on le dirait.
 *
 * « Aujourd'hui » et « hier » plutôt que la date : c'est ce qu'un enfant
 * cherche en premier, et une date complète pour quelque chose fait il y a deux
 * heures se lit comme de l'archive.
 */
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

export default function ExpressionsOrales() {
  const { eleveId, matiereId } = useParams();
  const dispatch = useDispatch();

  const { matieres } = useSelector((state) => state.referentiel);
  const { liste } = useSelector((state) => state.eleves);

  const [conversations, setConversations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // La conversation ouverte, et celle qu'on est en train d'aller chercher :
  // l'identifiant plutôt qu'un booléen, pour n'afficher « Ouverture… » que sur
  // la ligne cliquée.
  const [ouverte, setOuverte] = useState(null);
  const [ouverture, setOuverture] = useState(null);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const matiere = matieres.find((m) => String(m.id) === String(matiereId));

  useEffect(() => {
    if (matieres.length === 0) dispatch(chargerReferentiel());
    if (liste.length === 0) dispatch(chargerEleves());
  }, [dispatch, matieres.length, liste.length]);

  useEffect(() => {
    let vivant = true;

    getExpressionsOrales(eleveId, matiereId)
      .then(({ data }) => { if (vivant) setConversations(data ?? []); })
      .catch(() => {
        if (vivant) setErreur('Tes conversations n’ont pas pu être chargées.');
      })
      .finally(() => { if (vivant) setChargement(false); });

    return () => { vivant = false; };
  }, [eleveId, matiereId]);

  /** Les conversations groupées par jour, le plus récent en tête. */
  const jours = useMemo(() => {
    const parJour = new Map();

    [...conversations]
      .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
      .forEach((c) => {
        const cle = jourDe(c.dateCreation);
        if (!parJour.has(cle)) parJour.set(cle, { cle, date: c.dateCreation, lignes: [] });
        parJour.get(cle).lignes.push(c);
      });

    return [...parJour.values()];
  }, [conversations]);

  /**
   * Ouvre une conversation : on va chercher son échange, puis on éteint sa
   * pastille.
   *
   * L'ÉCHANGE N'EST PAS DANS LA LISTE, volontairement : trente conversations
   * feraient transiter trente discussions entières pour afficher trente
   * titres.
   */
  const ouvrir = async (conversation) => {
    setOuverture(conversation.id);

    try {
      const { data } = await getExpressionOrale(eleveId, conversation.id);
      setOuverte(data);

      // LA PASTILLE S'ÉTEINT APRÈS L'OUVERTURE, jamais avant : une lecture qui
      // échoue ne doit pas faire disparaître le « à consulter » d'une
      // conversation que l'enfant n'a pas vue.
      if (!conversation.dateConsultation) {
        marquerExpressionOraleVue(eleveId, conversation.id).catch(() => {});

        setConversations((actuelles) => actuelles.map((c) => (
          c.id === conversation.id
            ? { ...c, dateConsultation: new Date().toISOString() }
            : c
        )));
      }
    } catch {
      setErreur('Cette conversation n’a pas pu être ouverte.');
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

          <h1>Mes conversations</h1>

          <p className="fiches-entete__ligne">
            {[
              matiere?.profPrenom && `Avec ${matiere.profPrenom}`,
              eleve && `pour ${eleve.prenom}`,
            ].filter(Boolean).join(' ')}
          </p>
        </div>
      </header>

      {chargement && <Loader texte="Chargement de tes conversations…" />}
      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && !erreur && jours.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore de conversation ici.</p>
          <p>
            {matiere?.profPrenom ?? 'Ton professeur'} rangera ici chaque fois que
            vous aurez parlé ensemble dans la langue du cours. Tu peux lui
            demander quand tu veux — il dira toujours oui.
          </p>
        </div>
      )}

      {jours.map((jour) => (
        <section key={jour.cle} className="expr-jour">
          <h2 className="expr-jour__titre">{libelleJour(jour.date)}</h2>

          <ul className="expr-liste">
            {jour.lignes.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`expr-ligne${c.dateConsultation ? '' : ' expr-ligne--nouvelle'}`}
                  onClick={() => ouvrir(c)}
                  disabled={ouverture === c.id}
                >
                  {/* La pastille dit « pas encore ouverte » — même code que
                      sur les autres archives de l'enfant. */}
                  {!c.dateConsultation && (
                    <span className="expr-ligne__pastille" aria-hidden="true" />
                  )}

                  <span className="expr-ligne__titre">{c.titre}</span>

                  <span className="expr-ligne__detail">
                    {heureDe(c.dateCreation)}
                    {c.nombreTours > 0 && ` · ${c.nombreTours} messages`}
                  </span>

                  <span className="expr-ligne__fleche" aria-hidden="true">
                    {ouverture === c.id ? '…' : '→'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {ouverte && (
        <div
          className="modale"
          role="dialog"
          aria-modal="true"
          aria-label={ouverte.titre}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOuverte(null); }}
        >
          <div className="modale__boite modale__boite--large">
            <h3 className="modale__titre">{ouverte.titre}</h3>

            <ExpressionOraleDetail
              conversation={ouverte}
              prenomEleve={eleve?.prenom}
            />

            <div className="modale__actions">
              <button
                type="button"
                className="btn btn--compact"
                onClick={() => setOuverte(null)}
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
