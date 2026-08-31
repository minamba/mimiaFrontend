import { useEffect, useState } from 'react';
import { getApercuBilan, envoyerBilan } from '../lib/api/adminApi';
import { getCopieEvaluation, getRapport } from '../lib/api/elevesApi';
import { couleurEleve, couleurEleveClaire } from '../lib/couleurEleve';
import { styleMatiere } from '../lib/couleurMatiere';
import Avatar from './Avatar';
import Loader from './Loader';
import ProgressionMatiere from './ProgressionMatiere';
import Controle from './Controle';
import Rapport from './Rapport';
import DeroulerListe from './DeroulerListe';
import TriHistorique from './TriHistorique';

const SEXES = { 0: 'Non précisé', 1: 'Fille', 2: 'Garçon' };

/**
 * La tranche d'historique demandée à chaque fois.
 *
 * Dix, comme la première que la fiche apporte déjà (`TaillePage` côté
 * serveur) : deux tailles différentes donneraient un premier « voir plus »
 * qui n'ajoute pas ce que le bouton d'à côté vient d'annoncer.
 */
const PAS = 10;

/**
 * Un historique servi par tranches.
 *
 * La fiche apporte la première — sans quoi le tableau resterait vide le temps
 * d'un aller-retour de plus. Les suivantes se demandent au serveur et
 * S'AJOUTENT : le parent garde sous les yeux ce qu'il a déjà lu, ce qui est
 * tout l'intérêt du déroulé sur des pages numérotées.
 *
 * Le curseur vient du serveur et n'est jamais fabriqué ici : c'est lui, et non
 * un compte de lignes, qui sait où reprendre.
 */
function useHistorique(premierePage, charger) {
  const [etat, setEtat] = useState(() => depart(premierePage));
  const [tri, setTri] = useState(TRI_PAR_DEFAUT);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  // Une autre fiche est arrivée — un autre enfant, ou la même rechargée :
  // l'historique accumulé était le sien, il repart de sa première tranche, et
  // le tri avec. Garder « matière : maths » en passant d'un enfant à l'autre
  // ferait croire que le second n'en a pas fait.
  useEffect(() => {
    setEtat(depart(premierePage));
    setTri(TRI_PAR_DEFAUT);
    setErreur(null);
  }, [premierePage]);

  const plus = async () => {
    if (!etat.suite || chargement) return;

    setChargement(true);
    setErreur(null);

    try {
      const { data } = await charger(etat.suite, tri);

      setEtat((precedent) => ({
        elements: [...precedent.elements, ...(data.elements ?? [])],
        // Le total est relu à chaque tranche plutôt que gardé : entre deux
        // clics, l'enfant a pu terminer une séance de plus.
        total: data.total ?? precedent.total,
        suite: data.suite ?? null,
      }));
    } catch {
      setErreur("La suite n'a pas pu être chargée.");
    } finally {
      setChargement(false);
    }
  };

  /**
   * Un autre tri : on REPART du serveur, sans curseur.
   *
   * Le curseur dit « ce qui vient après cette ligne-ci DANS CET ORDRE » — il
   * n'a aucun sens dans un autre. Le réutiliser après un changement de tri
   * servirait une tranche prise au hasard dans la nouvelle liste.
   */
  const ranger = async (nouveau) => {
    setTri(nouveau);
    setChargement(true);
    setErreur(null);

    try {
      const { data } = await charger(null, nouveau);
      setEtat(depart(data));
    } catch {
      setErreur("La liste n'a pas pu être réordonnée.");
    } finally {
      setChargement(false);
    }
  };

  return { ...etat, tri, chargement, erreur, plus, ranger };
}

const TRI_PAR_DEFAUT = { matiereId: null, ancien: false };

/**
 * Le nom de la matière filtrée, pour l'écrire dans le message de liste vide.
 *
 * « Aucune séance en histoire-géographie » dit au parent que le filtre est
 * la cause ; « aucun compte rendu » lui laisserait croire que l'enfant n'a
 * jamais travaillé.
 */
const libelleMatiere = (fiche, matiereId) =>
  fiche.matieres?.find((m) => m.matiereId === matiereId)?.matiereLibelle
  ?? 'cette matière';

const depart = (page) => ({
  elements: page?.elements ?? [],
  total: page?.total ?? 0,
  suite: page?.suite ?? null,
});

/**
 * Les quatre pictogrammes des chiffres clés.
 *
 * Dessinés au trait plutôt que pris à une police d'icônes : quatre glyphes ne
 * justifient pas une dépendance de plus, et `currentColor` les fait suivre la
 * teinte de leur pastille sans une ligne de style supplémentaire.
 */
const PICTOS = {
  cours: <><path d="M3 5.6c2.6-1.1 5.2-1 7 .6v11c-1.8-1.6-4.4-1.7-7-.6z" /><path d="M21 5.6c-2.6-1.1-5.2-1-7 .6v11c1.8-1.6 4.4-1.7 7-.6z" /></>,
  echanges: <><rect x="2.6" y="4" width="18.8" height="12.4" rx="2.6" /><path d="M8 16.4V20.5l4.6-4.1" /></>,
  competences: <><circle cx="12" cy="9" r="5.4" /><path d="m8.6 13.4-1.4 7.4 4.8-2.5 4.8 2.5-1.4-7.4" /></>,
  activite: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7v5.3l3.4 2" /></>,
};

/**
 * Un chiffre clé.
 *
 * La teinte est portée par la pastille et par un liseré, jamais par le nombre :
 * un chiffre écrit dans sa couleur de série se lit moins bien qu'en encre
 * pleine, et quatre fonds colorés côte à côte crieraient. C'est le picto qui
 * porte l'identité — on retrouve « les compétences » sans relire les libellés.
 */
function Chiffre({ ton, picto, valeur, libelle, precision, dateLongue }) {
  return (
    <div className={`stat stat--${ton}`}>
      <span className="stat__picto" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {PICTOS[picto]}
        </svg>
      </span>

      <span className="stat__corps">
        <span className={`stat__valeur${dateLongue ? ' stat__valeur--date' : ''}`}>{valeur}</span>
        <span className="stat__libelle">{libelle}</span>
        {precision && <span className="stat__precision">{precision}</span>}
      </span>
    </div>
  );
}

const date = (valeur) =>
  valeur ? new Date(valeur).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const dateCourte = (valeur) =>
  valeur ? new Date(valeur).toLocaleDateString('fr-FR') : '—';

/**
 * Date ET heure, sur deux lignes.
 *
 * Un parent enchaîne plusieurs séances dans la même journée : trois lignes
 * datées « 04/08/2026 » ne se distinguent plus, et rien ne dit dans quel ordre
 * elles ont eu lieu. L'heure est ce qui les remet en file.
 */
function DateHeure({ valeur }) {
  if (!valeur) return '—';

  const quand = new Date(valeur);

  return (
    <span className="date-heure">
      {quand.toLocaleDateString('fr-FR')}
      <span className="date-heure__heure">
        {quand.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </span>
  );
}

const pourcent = (valeur) =>
  valeur === null || valeur === undefined ? null : `${Math.round(valeur * 100)} %`;

/** Barre de maîtrise. La couleur suit le score, pas la matière. */
function Jauge({ score }) {
  const niveau = score >= 0.75 ? 'acquis' : score >= 0.4 ? 'fragile' : 'lacune';

  return (
    <span className="jauge" title={pourcent(score)}>
      <span className={`jauge__barre jauge__barre--${niveau}`} style={{ width: `${score * 100}%` }} />
    </span>
  );
}

/**
 * Pastille de note. La couleur ne descend jamais au rouge : une note basse est
 * une information sur le travail qui reste, pas une sanction. C'est la règle
 * que le professeur s'impose à l'oral, elle vaut aussi à l'écran.
 */
function Note({ valeur }) {
  const ton = valeur >= 16 ? 1 : valeur >= 12 ? 2 : valeur >= 10 ? 3 : 0;

  return (
    <span className={`note note--ton${ton}`}>
      {valeur.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
      <span className="note__sur">/20</span>
    </span>
  );
}

function ListeCompetences({ titre, competences, vide }) {
  return (
    <div className="fiche__colonne">
      <h3>{titre}</h3>

      {competences.length === 0 ? (
        <p className="vide vide--compact">{vide}</p>
      ) : (
        <ul className="competences">
          {competences.map((c) => (
            <li key={c.competenceId}>
              <div className="competences__ligne">
                <span className="competences__libelle">{c.libelle}</span>
                <span className="competences__score">{pourcent(c.score)}</span>
              </div>
              <Jauge score={c.score} />
              <span className="competences__meta">
                {/* La matière EN PREMIER et dans sa couleur. Tant qu'il n'y
                    avait que les maths, la préciser n'aurait rien dit ; avec
                    sept référentiels, « Le vivant et son évolution » posé à
                    côté de « Nombres et calculs » ne se rattache à rien sans
                    elle. La teinte se lit avant le mot — c'est exactement ce à
                    quoi sert la palette de matières. */}
                {c.matiereLibelle && (
                  <>
                    <strong className="matiere-nom" style={styleMatiere(c.matiereLibelle)}>
                      {c.matiereLibelle}
                    </strong>
                    {' · '}
                  </>
                )}
                {[c.niveauLibelle, c.domaine].filter(Boolean).join(' · ')}
                {c.nombreObservations > 0 && ` · ${c.nombreObservations} observation${c.nombreObservations > 1 ? 's' : ''}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Les matières présentes dans la fiche, dans l'ordre où elles apparaissent.
 *
 * Construite à partir des DONNÉES et non du catalogue : un élève qui ne fait
 * que maths et français ne doit pas voir sept pastilles dont cinq vides.
 */
function matieresPresentes(...listes) {
  const vues = [];

  for (const liste of listes) {
    for (const c of liste ?? []) {
      if (c.matiereLibelle && !vues.includes(c.matiereLibelle)) vues.push(c.matiereLibelle);
    }
  }

  return vues;
}

/**
 * Fiche détaillée d'un élève.
 *
 * Organisée par matière même quand une seule est active : c'est la structure
 * qui portera l'année prochaine le français, l'histoire-géo et les sciences,
 * sans redécoupage ni reprise de l'historique accumulé d'ici là.
 */
export default function FicheEleve({
  fiche,
  chargement,
  erreur,
  onFermer,
  // L'aperçu du bilan passe par une route d'administration : un parent y
  // recevrait un 403. Le bouton n'apparaît donc que pour l'administrateur.
  avecApercuBilan = false,

  /**
   * Rendue en pleine page plutôt qu'en fenêtre.
   *
   * C'est le mode normal pour un parent : la fiche porte l'identité, les
   * statistiques, les évaluations avec leurs copies, les comptes rendus et la
   * progression par matière. Une fenêtre modale impose une hauteur et un
   * défilement interne à tout cela, et interdit d'en partager le lien.
   *
   * Elle réglait aussi un vrai défaut technique : la copie et le rapport
   * s'ouvraient DANS cette fenêtre, donc une fenêtre dans une fenêtre — et le
   * PDF sortait coupé à la première page, un ancêtre en position fixe étant
   * toujours clippé à l'impression.
   *
   * L'administration garde la fenêtre : elle y consulte des fiches à la
   * volée depuis une liste, sans quitter son écran.
   */
  enPage = false,

  /**
   * De quoi aller chercher la tranche d'historique suivante.
   *
   * Passées par l'appelant plutôt que choisies ici : le parent lit
   * `/eleves/…`, l'administrateur `/admin/eleves/…`, et cet écran n'a pas à
   * savoir lequel des deux le regarde. Il ne sait qu'une chose : appeler avec
   * un curseur rend la suite.
   */
  chargerEvaluations,
  chargerRapports,
}) {
  const [apercuEnCours, setApercuEnCours] = useState(false);

  /** null | 'encours' | 'envoye' | 'rien' | 'echec' */
  const [envoiBilan, setEnvoiBilan] = useState(null);

  // Matière sur laquelle les deux colonnes sont restreintes. Null = toutes,
  // et c'est le défaut : voir d'un coup d'œil où l'enfant a le plus besoin
  // d'aide est ce que cet écran doit permettre en premier.
  const [matiereFiltre, setMatiereFiltre] = useState(null);

  // La copie ouverte par le parent. `chargement` porte l'identifiant plutôt
  // qu'un booléen : c'est ce qui permet de n'afficher « Ouverture… » que sur
  // la ligne cliquée, et pas sur toutes.
  const [copie, setCopie] = useState(null);
  const [copieChargement, setCopieChargement] = useState(null);
  const [copieErreur, setCopieErreur] = useState(null);

  const [rapport, setRapport] = useState(null);

  // Les deux historiques, chacun avec son curseur. Séparés : un parent
  // déroule les évaluations sans vouloir dérouler les séances, et l'inverse.
  const evaluations = useHistorique(fiche?.evaluations, (curseur, tri) =>
    chargerEvaluations(fiche.id, curseur, PAS, tri));

  const seances = useHistorique(fiche?.rapports, (curseur, tri) =>
    chargerRapports(fiche.id, curseur, PAS, tri));

  const voirLaCopie = async (evaluationId) => {
    setCopieChargement(evaluationId);
    setCopieErreur(null);

    try {
      const { data } = await getCopieEvaluation(fiche.id, evaluationId);
      setCopie(data);
    } catch {
      setCopieErreur("La copie n'a pas pu être chargée.");
    } finally {
      setCopieChargement(null);
    }
  };

  const voirLeRapport = async (rapportId) => {
    setCopieChargement(`r${rapportId}`);
    setCopieErreur(null);

    try {
      const { data } = await getRapport(fiche.id, rapportId);
      setRapport(data);
    } catch {
      setCopieErreur("Le rapport n'a pas pu être chargé.");
    } finally {
      setCopieChargement(null);
    }
  };

  /**
   * Ouvre le bilan hebdomadaire tel que le parent le recevra.
   * Le HTML arrive en blob puis passe par une URL locale : la route exige un
   * jeton, et un onglet ouvert sur l'URL directe recevrait un 401.
   */
  const voirLeBilan = async () => {
    setApercuEnCours(true);
    try {
      const { data } = await getApercuBilan(fiche.id);
      const url = URL.createObjectURL(new Blob([data], { type: 'text/html' }));
      window.open(url, '_blank', 'noopener');

      // Libéré après ouverture : révoquer tout de suite couperait le
      // chargement de l'onglet qui vient de s'ouvrir.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setApercuEnCours(false);
    }
  };

  /**
   * Envoie le bilan à ce parent, maintenant.
   *
   * POUR CELUI QUI N'A RIEN REÇU — courriel classé en indésirable, adresse
   * changée, panne d'envoi un lundi matin. Sans ce bouton, il fallait lui dire
   * d'attendre la semaine suivante, et le bilan manquant l'était pour toujours.
   *
   * UNE CONFIRMATION, PARCE QU'UN COURRIEL NE SE RATTRAPE PAS. Ce n'est pas un
   * aperçu : ça part chez un vrai parent. Le nom est rappelé dans la question,
   * pour qu'on relise qui l'on s'apprête à écrire.
   */
  const envoyerLeBilan = async () => {
    const nom = [fiche.prenom, fiche.nom].filter(Boolean).join(' ');

    if (!window.confirm(
      `Envoyer le bilan hebdomadaire de ${nom} à son parent, maintenant ?`,
    )) return;

    setEnvoiBilan('encours');

    try {
      const { data } = await envoyerBilan(fiche.id);

      // `envoyes` vaut zéro quand le parent n'a pas d'adresse, ou quand la
      // semaine ne contient aucune séance : dire « envoyé » serait faux, et
      // l'administrateur croirait le problème réglé.
      setEnvoiBilan(data?.envoyes > 0 ? 'envoye' : 'rien');
    } catch {
      setEnvoiBilan('echec');
    }
  };

  // Les matières réellement présentes dans les compétences de cet élève, et
  // le filtre qui en découle. Calculés ici plutôt que dans le rendu : les deux
  // colonnes doivent voir exactement la même liste.
  const matieres = matieresPresentes(fiche?.lacunes, fiche?.acquises);

  const filtrer = (liste) =>
    (liste ?? []).filter((c) => !matiereFiltre || c.matiereLibelle === matiereFiltre);

  const Cadre = enPage ? 'section' : 'div';
  const attributsCadre = enPage
    ? { className: 'page page--large' }
    : { className: 'modale', role: 'dialog', 'aria-modal': true, 'aria-label': 'Fiche élève' };

  return (
    <Cadre {...attributsCadre}>
      {/* La copie passe par-dessus la fiche : le parent y revient en fermant. */}
      {copie && <Controle copie={copie} onFermer={() => setCopie(null)} />}
      {rapport && <Rapport rapport={rapport} onFermer={() => setRapport(null)} />}

      <div className={enPage ? 'fiche-eleve' : 'modale__boite modale__boite--large'}>
        {chargement && <Loader texte="Chargement de la fiche…" />}

        {erreur && <div className="alert">{erreur}</div>}

        {fiche && (
          <>
            {/* ------------------------------------------------- identité

                L'en-tête porte la couleur d'identité de l'enfant — celle de sa
                carte dans la liste et de son prénom sur la page des matières.
                Un parent de quatre enfants reconnaît la fiche avant d'avoir lu
                le nom, et la page cesse d'être un aplat de bleu nuit. */}
            <header
              className="fiche__entete fiche__entete--colore"
              style={{
                '--teinte': couleurEleve(fiche),
                '--teinte-claire': couleurEleveClaire(fiche),
              }}
            >
              <span className="fiche__avatar" aria-hidden="true">
                {(fiche.prenom ?? '?').trim().charAt(0).toUpperCase()}
              </span>

              <div>
                <h2>
                  <span className="fiche__prenom">{fiche.prenom}</span> {fiche.nom}
                </h2>
                <p className="fiche__sous-titre">
                  {[
                    fiche.niveauLibelle,
                    `${fiche.age} ans`,
                    SEXES[fiche.sexe] ?? SEXES[0],
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="fiche__parent">
                  Compte de {fiche.parentNomComplet?.trim() || 'sans nom'} — {fiche.parentMail}
                </p>
              </div>

              <button type="button" className="btn-ghost" onClick={onFermer}>
                {enPage ? 'Retour' : 'Fermer'}
              </button>
            </header>

            {/* ---------------------------------------------------- chiffres

                Quatre mesures de nature différente, donc quatre teintes : ce
                n'est pas de la décoration, c'est ce qui permet de retrouver
                « les compétences » sans relire les quatre libellés. La couleur
                est portée par le chiffre et un liseré, jamais par le fond —
                quatre aplats côte à côte crieraient. */}
            <div className="stats stats--compact stats--teintees">
              <Chiffre
                ton="ton1"
                picto="cours"
                valeur={fiche.nombreCours}
                libelle="Cours suivis"
              />
              <Chiffre
                ton="ton2"
                picto="echanges"
                valeur={fiche.nombreRequetes.toLocaleString('fr-FR')}
                libelle="Réponses du professeur"
              />
              <Chiffre
                ton="ton3"
                picto="competences"
                valeur={fiche.competencesEvaluees}
                libelle="Compétences évaluées"
              />
              <Chiffre
                ton="ton4"
                picto="activite"
                dateLongue
                valeur={dateCourte(fiche.derniereActivite)}
                libelle="Dernière activité"
                precision={`Inscrit le ${date(fiche.dateCreation)}`}
              />
            </div>

            {/* ------------------------------------------------ dernier cours */}
            <h3>Dernier cours</h3>
            {fiche.dernierCours ? (
              <div className="dernier-cours">
                <Avatar nom={fiche.dernierCours.profAvatar} taille={44} />
                <div>
                  <strong className="matiere-nom" style={styleMatiere(fiche.dernierCours)}>
                    {fiche.dernierCours.matiereLibelle}
                  </strong>
                  <span className="dernier-cours__meta">
                    avec {fiche.dernierCours.profPrenom} ·{' '}
                    {dateCourte(fiche.dernierCours.dateDernierMessage ?? fiche.dernierCours.dateCreation)} ·{' '}
                    {fiche.dernierCours.nombreMessages} message
                    {fiche.dernierCours.nombreMessages > 1 ? 's' : ''}
                  </span>
                  {fiche.dernierCours.titre && (
                    <span className="dernier-cours__titre">« {fiche.dernierCours.titre} »</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="vide vide--compact">Cet élève n'a encore suivi aucun cours.</p>
            )}

            {/* --------------------------------------------------- matières */}
            <h3>Par matière</h3>
            <div className="matieres-fiche">
              {fiche.matieres.map((m) => (
                <div key={m.matiereId} className="matiere-fiche">
                  <div className="matiere-fiche__entete">
                    <Avatar nom={m.profAvatar} couleur={m.profCouleur} taille={34} />
                    <div>
                      <strong className="matiere-nom" style={styleMatiere(m)}>
                        {m.matiereLibelle}
                      </strong>
                      <span className="matiere-fiche__prof">{m.profPrenom}</span>
                    </div>
                  </div>

                  {m.nombreCours === 0 ? (
                    <p className="vide vide--compact">Pas encore travaillée.</p>
                  ) : (
                    <>
                      <dl className="matiere-fiche__chiffres">
                        <div>
                          <dt>Cours</dt>
                          <dd>{m.nombreCours}</dd>
                        </div>
                        <div>
                          <dt>Réponses</dt>
                          <dd>{m.nombreRequetes.toLocaleString('fr-FR')}</dd>
                        </div>
                        <div>
                          <dt>Dernier</dt>
                          <dd>{dateCourte(m.dernierCours)}</dd>
                        </div>
                      </dl>

                      {m.maitriseMoyenne === null || m.maitriseMoyenne === undefined ? (
                        <span className="matiere-fiche__note">Aucune compétence évaluée</span>
                      ) : (
                        <>
                          <div className="matiere-fiche__ligne">
                            <span>Maîtrise moyenne</span>
                            <strong>{pourcent(m.maitriseMoyenne)}</strong>
                          </div>
                          <Jauge score={m.maitriseMoyenne} />
                          <span className="matiere-fiche__note">
                            sur {m.competencesEvaluees} compétence
                            {m.competencesEvaluees > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* ------------------------------------------------ compétences */}

            {/* CE QUI RÉPOND À LA QUESTION PASSE AVANT CE QUI LA DOCUMENTE.
                Les points fragiles étaient sous les deux historiques : un
                parent devait franchir deux cents lignes d'évaluations et de
                séances avant d'atteindre la seule chose qu'il était venu
                chercher. Les listes, elles, sont un journal — on y descend
                quand on veut vérifier une séance précise, pas à l'ouverture. */}

            {/* UN FILTRE, PAS DES ONGLETS.
                Des onglets répondraient à « comment va-t-il en maths ? ». Mais
                la question de cet écran est « où a-t-il besoin d'aide ? », et
                celle-là est transversale : avec des onglets, il faudrait
                cliquer sept fois pour découvrir que le vrai problème est en
                français. Le classement toutes matières confondues reste donc
                l'affichage par défaut, et le filtre ne cache rien tant qu'on
                ne l'active pas.

                La rangée n'apparaît qu'à partir de deux matières : sur une
                seule, elle ne filtrerait rien. */}
            {matieres.length > 1 && (
              <div className="filtre-matieres" role="group" aria-label="Filtrer par matière">
                <button
                  type="button"
                  className={`puce-matiere ${matiereFiltre ? '' : 'puce-matiere--active'}`}
                  onClick={() => setMatiereFiltre(null)}
                >
                  Toutes
                </button>

                {matieres.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`puce-matiere ${matiereFiltre === m ? 'puce-matiere--active' : ''}`}
                    style={styleMatiere(m)}
                    onClick={() => setMatiereFiltre(matiereFiltre === m ? null : m)}
                    aria-pressed={matiereFiltre === m}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className="fiche__colonnes">
              <ListeCompetences
                titre="Points fragiles"
                competences={filtrer(fiche.lacunes)}
                vide={
                  matiereFiltre
                    ? `Aucune lacune identifiée en ${matiereFiltre}.`
                    : "Aucune lacune identifiée pour l'instant."
                }
              />
              <ListeCompetences
                titre="Compétences acquises"
                competences={filtrer(fiche.acquises)}
                vide={
                  matiereFiltre
                    ? `Aucune compétence validée en ${matiereFiltre}.`
                    : "Aucune compétence validée pour l'instant."
                }
              />
            </div>

            {/* ------------------------------------------------- progression */}
            {(fiche.progression?.length ?? 0) > 0 && (
              <>
                <h3>Sa progression</h3>
                {fiche.progression.map((m) => (
                  <ProgressionMatiere key={m.matiereId} matiere={m} />
                ))}
              </>
            )}

            {/* ------------------------------------------------ évaluations */}
            <h3>Ses évaluations</h3>

            {/* La barre reste même quand la liste est vide : c'est le seul
                moyen de défaire un filtre qui ne rend rien. */}
            <TriHistorique
              matieres={fiche.matieres}
              tri={evaluations.tri}
              onChange={evaluations.ranger}
              chargement={evaluations.chargement}
              nom="Évaluations"
            />

            {evaluations.elements.length === 0 ? (
              <p className="vide vide--compact">
                {evaluations.tri.matiereId
                  ? `Aucune évaluation en ${libelleMatiere(fiche, evaluations.tri.matiereId)}.`
                  : `Aucune évaluation passée. Le professeur en propose une quand il juge
                     une notion acquise.`}
              </p>
            ) : (
              <div className="tableau">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Note</th>
                      <th scope="col">Matière</th>
                      <th scope="col">Professeur</th>
                      <th scope="col">Sur quoi</th>
                      <th scope="col">Remarque</th>
                      <th scope="col">Date</th>
                      <th scope="col">Copie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.elements.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <Note valeur={e.note} />
                        </td>
                        <td className="matiere-nom" style={styleMatiere(e)}>
                          {e.matiereLibelle}
                        </td>
                        <td>{e.profPrenom}</td>
                        <td>{e.notion || '—'}</td>
                        <td className="cellule-texte">
                          {e.remarque || '—'}
                          {e.aRevoir && (
                            <span className="a-revoir">À reprendre : {e.aRevoir}</span>
                          )}
                        </td>
                        <td><DateHeure valeur={e.dateCreation} /></td>
                        <td>
                          <button
                            type="button"
                            className="btn-copie btn-copie--ligne"
                            onClick={() => voirLaCopie(e.id)}
                            disabled={copieChargement === e.id}
                          >
                            {copieChargement === e.id ? 'Ouverture…' : 'Voir la copie'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <DeroulerListe
                  visibles={evaluations.elements.length}
                  total={evaluations.total}
                  nom="évaluations"
                  pas={PAS}
                  encore={Boolean(evaluations.suite)}
                  chargement={evaluations.chargement}
                  erreur={evaluations.erreur}
                  onPlus={evaluations.plus}
                />
              </div>
            )}

            {copieErreur && <div className="alert">{copieErreur}</div>}

            {/* ---------------------------------------------------- rapports */}
            <h3>Ses séances</h3>

            <TriHistorique
              matieres={fiche.matieres}
              tri={seances.tri}
              onChange={seances.ranger}
              chargement={seances.chargement}
              nom="Séances"
            />

            {seances.elements.length === 0 ? (
              <p className="vide vide--compact">
                {seances.tri.matiereId
                  ? `Aucune séance en ${libelleMatiere(fiche, seances.tri.matiereId)}.`
                  : `Aucun compte rendu. Le professeur en rédige un à la fin de chaque
                     séance.`}
              </p>
            ) : (
              <div className="tableau">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Compréhension</th>
                      <th scope="col">Révision</th>
                      <th scope="col">Matière</th>
                      <th scope="col">Travaillé</th>
                      <th scope="col">Remarque</th>
                      <th scope="col">Date</th>
                      <th scope="col">Rapport</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seances.elements.map((r) => (
                      <tr key={r.id}>
                        <td>
                          {r.noteComprehension === null || r.noteComprehension === undefined ? (
                            <span className="note-absente">—</span>
                          ) : (
                            <Note valeur={r.noteComprehension} />
                          )}
                        </td>
                        <td>
                          {/* Jamais un tiret seul : « pas évalué » est une
                              information, pas une note manquante. */}
                          {r.noteRevision === null || r.noteRevision === undefined ? (
                            <span className="note-absente">Pas évalué dans le cours</span>
                          ) : (
                            <Note valeur={r.noteRevision} />
                          )}
                        </td>
                        <td className="matiere-nom" style={styleMatiere(r)}>
                          {r.matiereLibelle}
                        </td>
                        <td className="cellule-texte">{r.travaille || '—'}</td>
                        <td className="cellule-texte">
                          {r.remarque || '—'}
                          {r.aRevoir && (
                            <span className="a-revoir">À retravailler : {r.aRevoir}</span>
                          )}
                        </td>
                        <td><DateHeure valeur={r.dateCreation} /></td>
                        <td>
                          <button
                            type="button"
                            className="btn-copie btn-copie--ligne"
                            onClick={() => voirLeRapport(r.id)}
                            disabled={copieChargement === `r${r.id}`}
                          >
                            {copieChargement === `r${r.id}` ? 'Ouverture…' : 'Voir le rapport'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <DeroulerListe
                  visibles={seances.elements.length}
                  total={seances.total}
                  nom="séances"
                  pas={PAS}
                  encore={Boolean(seances.suite)}
                  chargement={seances.chargement}
                  erreur={seances.erreur}
                  onPlus={seances.plus}
                />
              </div>
            )}

            {/* ---------------------------------------------- derniers cours */}
            <h3>Derniers cours</h3>
            {fiche.dernieresSeances.length === 0 ? (
              <p className="vide vide--compact">Aucun cours enregistré.</p>
            ) : (
              <div className="tableau">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Matière</th>
                      <th scope="col">Professeur</th>
                      <th scope="col">Sujet</th>
                      <th scope="col">Messages</th>
                      <th scope="col">Dernier échange</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fiche.dernieresSeances.map((s) => (
                      <tr key={s.conversationId}>
                        <td className="matiere-nom" style={styleMatiere(s)}>
                          {s.matiereLibelle}
                        </td>
                        <td>{s.profPrenom}</td>
                        <td>{s.titre || '—'}</td>
                        <td className="num">{s.nombreMessages}</td>
                        <td><DateHeure valeur={s.dateDernierMessage ?? s.dateCreation} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modale__actions">
              {avecApercuBilan && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={voirLeBilan}
                  disabled={apercuEnCours}
                >
                  {apercuEnCours ? 'Génération…' : 'Voir le bilan hebdomadaire'}
                </button>
              )}

              {/* L'ENVOI EST À CÔTÉ DE L'APERÇU, ET APRÈS LUI.
                  On relit avant d'écrire à un parent — l'ordre des deux boutons
                  suggère ce geste sans avoir à l'écrire.

                  Le libellé change après coup et ne revient pas à son état
                  initial : « Envoyé » qui redeviendrait « Envoyer » laisserait
                  croire que rien n'est parti, et on cliquerait deux fois. */}
              {avecApercuBilan && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={envoyerLeBilan}
                  disabled={envoiBilan === 'encours' || envoiBilan === 'envoye'}
                  title="Envoie le bilan de la semaine au parent, immédiatement"
                >
                  {envoiBilan === 'encours' ? 'Envoi…'
                    : envoiBilan === 'envoye' ? 'Bilan envoyé ✓'
                      : envoiBilan === 'rien' ? 'Rien à envoyer'
                        : envoiBilan === 'echec' ? "L'envoi a échoué"
                          : 'Envoyer le bilan au parent'}
                </button>
              )}
              <button type="button" className="btn btn--compact" onClick={onFermer}>
                {enPage ? 'Retour' : 'Fermer'}
              </button>
            </div>
          </>
        )}
      </div>
    </Cadre>
  );
}
