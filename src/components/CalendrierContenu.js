import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { styleMatiere } from '../lib/couleurMatiere';
import { getMatieresEleve } from '../lib/api/elevesApi';
import ControleForm from './ControleForm';

/**
 * Le contenu du calendrier d'un enfant — la reliure, le mois, sa légende, sa
 * grille et le détail d'un jour — SANS la page qui l'entoure.
 *
 * SORTI DE `CalendrierEleve.js` POUR ÊTRE MONTRÉ DEUX FOIS.
 * -----------------------------------------------------------
 * L'enfant et son parent le voient en pleine page, à l'adresse
 * `/eleves/:eleveId/calendrier` (voir `CalendrierEleve.js`, qui n'est plus
 * que cette adresse-là et un bouton « Retour »). L'administration doit
 * pouvoir ouvrir EXACTEMENT LA MÊME CHOSE dans une fenêtre, sur n'importe
 * quel enfant — pas une vue « admin » à part qui finirait par diverger de ce
 * que la famille voit vraiment.
 *
 * `chargerCalendrier` EST LE SEUL POINT QUI CHANGE D'UN CONTEXTE À L'AUTRE.
 * La route `/eleves/{id}/calendrier` (`elevesApi.getCalendrier`) vérifie que
 * l'enfant appartient bien à celui qui demande ; l'administration passe par
 * sa propre route (`adminApi.getCalendrierEleve`), sans cette vérification —
 * elle a le droit de regarder n'importe quel profil. Le rendu, lui, ne sait
 * pas laquelle des deux l'a nourri.
 */
export function CalendrierContenu({ eleveId, chargerCalendrier }) {
  // Le 1er du mois affiché — seule la position dans l'année compte, jamais
  // l'heure ni le jour exact.
  const [curseur, setCurseur] = useState(() => {
    const aujourdhui = new Date();
    return new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);
  });

  const [calendrier, setCalendrier] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Le jour cliqué, dont le détail s'affiche dans une fenêtre — null tant
  // que rien n'est ouvert.
  const [jourDetail, setJourDetail] = useState(null);

  // Bascule le contenu de LA MÊME fenêtre vers le formulaire d'ajout d'un
  // contrôle, plutôt que d'empiler une deuxième modale par-dessus — ça
  // évite un conflit d'Échap et de z-index entre les deux.
  const [modeFormulaire, setModeFormulaire] = useState(false);

  // Les matières de l'élève, pour la combobox du formulaire — chargées une
  // seule fois, pas à chaque mois affiché.
  const [matieres, setMatieres] = useState([]);

  useEffect(() => {
    let vivant = true;

    getMatieresEleve(eleveId)
      .then(({ data }) => { if (vivant) setMatieres((data ?? []).filter((m) => m.active)); })
      .catch(() => { /* La combobox reste vide ; le formulaire le dit lui-même. */ });

    return () => { vivant = false; };
  }, [eleveId]);

  const charger = () =>
    chargerCalendrier(eleveId, curseur.getFullYear(), curseur.getMonth() + 1)
      .then(({ data }) => { setCalendrier(data); return data; });

  useEffect(() => {
    let vivant = true;
    setChargement(true);

    chargerCalendrier(eleveId, curseur.getFullYear(), curseur.getMonth() + 1)
      .then(({ data }) => { if (vivant) setCalendrier(data); })
      .catch(() => { if (vivant) setErreur("Le calendrier n'a pas pu être chargé."); })
      .finally(() => { if (vivant) setChargement(false); });

    return () => { vivant = false; };
  }, [eleveId, curseur, chargerCalendrier]);

  const moisPrecedent = () =>
    setCurseur((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const moisSuivant = () =>
    setCurseur((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  // Échap referme la fenêtre de détail, comme partout ailleurs dans l'appli.
  useEffect(() => {
    if (!jourDetail) return undefined;

    const auClavier = (e) => { if (e.key === 'Escape') { setJourDetail(null); setModeFormulaire(false); } };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [jourDetail]);

  const fermerDetail = () => { setJourDetail(null); setModeFormulaire(false); };

  const apresAjoutControle = () => {
    setModeFormulaire(false);
    charger().catch(() => { /* La grille garde son dernier état connu. */ });
  };

  if (chargement && !calendrier) return <p className="etat-vide">Chargement…</p>;

  if (erreur && !calendrier) {
    return <div className="alert">{erreur}</div>;
  }

  const {
    zone, vacances = [], seances = [], evaluations = [],
    controles = [], prochaineVacances = null,
  } = calendrier ?? {};

  const decompte = messageDecompte(prochaineVacances);

  const jours = grilleDuMois(curseur.getFullYear(), curseur.getMonth());

  const enVacances = (jour) =>
    vacances.some((v) => jour >= new Date(v.dateDebut) && jour <= new Date(v.dateFin));

  /**
   * Une pastille par MATIÈRE travaillée ce jour-là, jamais une par séance.
   *
   * `seances` porte une ligne par compte rendu, et un élève qui reprend
   * plusieurs fois la même matière dans la même journée — fréquent en test,
   * ça arrive aussi en vrai usage un jour de rattrapage — en produit
   * plusieurs pour un seul jour. Sans ce filtre, la case affichait un chapelet
   * de pastilles de la même couleur, illisible et qui ne dit rien de plus
   * qu'une seule : « cette matière a été travaillée ce jour-là ».
   */
  const seancesDuJour = (jour) => {
    const duJour = seances.filter((s) => memeJour(new Date(s.date), jour));
    const parMatiere = new Map();

    for (const s of duJour) {
      if (!parMatiere.has(s.matiereId)) parMatiere.set(s.matiereId, s);
    }

    return [...parMatiere.values()];
  };

  const evaluationDuJour = (jour) =>
    evaluations.find((e) => memeJour(new Date(e.date), jour));

  // TOUTES les évaluations du jour, pour la fenêtre de détail — la pastille
  // de la grille n'en montre qu'une (`evaluationDuJour`), mais rien n'empêche
  // deux contrôles le même jour dans deux matières différentes.
  const evaluationsDuJour = (jour) =>
    evaluations.filter((e) => memeJour(new Date(e.date), jour));

  // TOUTES les séances du jour, sans le regroupement par matière de
  // `seancesDuJour` : ici on veut au contraire chaque séance avec son heure.
  const toutesLesSeancesDuJour = (jour) =>
    seances
      .filter((s) => memeJour(new Date(s.date), jour))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

  const vacancesDuJour = (jour) =>
    vacances.filter((v) => jour >= new Date(v.dateDebut) && jour <= new Date(v.dateFin));

  // Une case respire dès qu'UN contrôle y tombe, peu importe combien — même
  // principe que `evaluationDuJour` pour la pastille de la grille.
  const controleDuJour = (jour) =>
    controles.some((c) => memeJour(new Date(c.dateControle), jour));

  const controlesDuJour = (jour) =>
    controles.filter((c) => memeJour(new Date(c.dateControle), jour));

  const AUJOURDHUI_MINUIT = new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <>
      {jourDetail && modeFormulaire && (
        <div className="modale" role="dialog" aria-modal="true" aria-label="Ajouter un contrôle">
          <div className="modale__boite jour-detail">
            <ControleForm
              eleveId={eleveId}
              matieres={matieres}
              jour={jourDetail}
              sousTitre={dateLongue(jourDetail)}
              onEnregistre={apresAjoutControle}
              onAnnule={() => setModeFormulaire(false)}
            />
          </div>
        </div>
      )}

      {jourDetail && !modeFormulaire && (
        <div className="modale" role="dialog" aria-modal="true" aria-label="Détail de la journée">
          <div className="modale__boite jour-detail">
            <h2 className="jour-detail__titre">{dateLongue(jourDetail)}</h2>

            {vacancesDuJour(jourDetail).length > 0 && (
              <p className="jour-detail__vacances">
                <span aria-hidden="true">🏖️</span>{' '}
                {vacancesDuJour(jourDetail).map((v) => v.libelle).join(', ')}
              </p>
            )}

            {toutesLesSeancesDuJour(jourDetail).length > 0 && (
              <section className="jour-detail__section">
                <h3>Matières travaillées</h3>
                <ul>
                  {toutesLesSeancesDuJour(jourDetail).map((s, i) => (
                    <li key={i} style={styleMatiere({ matiereLibelle: s.matiereLibelle })}>
                      <span className="jour-detail__pastille" aria-hidden="true" />
                      <span className="jour-detail__matiere">{s.matiereLibelle}</span>

                      {/* Un seul groupe poussé à droite, plutôt que deux
                          éléments qui se pousseraient séparément : sans lui,
                          l'heure sautait d'une colonne à l'autre selon qu'une
                          séance porte ou non sa durée. */}
                      <span className="jour-detail__quand">
                        {/* Absente sur toute séance enregistrée avant que ce
                            champ n'existe — rien à deviner, on ne montre que
                            ce qu'on sait vraiment. */}
                        {s.dureeChoisieMinutes && (
                          <span className="jour-detail__duree">{s.dureeChoisieMinutes} min</span>
                        )}
                        <span className="jour-detail__heure">{heure(s.date)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {evaluationsDuJour(jourDetail).length > 0 && (
              <>
                {toutesLesSeancesDuJour(jourDetail).length > 0 && (
                  <hr className="jour-detail__separateur" />
                )}

                <section className="jour-detail__section">
                  <h3>Évaluations</h3>
                  <ul>
                    {evaluationsDuJour(jourDetail).map((e, i) => (
                      <li key={i} style={styleMatiere({ matiereLibelle: e.matiereLibelle })}>
                        <span className="jour-detail__pastille jour-detail__pastille--evaluation" aria-hidden="true" />
                        <span className="jour-detail__matiere">{e.matiereLibelle}</span>
                        <span className="jour-detail__note">
                          {e.note.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}/20
                        </span>
                        <span className="jour-detail__heure">{heure(e.date)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {controlesDuJour(jourDetail).length > 0 && (
              <>
                {(toutesLesSeancesDuJour(jourDetail).length > 0
                  || evaluationsDuJour(jourDetail).length > 0) && (
                  <hr className="jour-detail__separateur" />
                )}

                <section className="jour-detail__section">
                  <h3>Contrôles à venir</h3>
                  <ul>
                    {controlesDuJour(jourDetail).map((c, i) => (
                      <li key={i} style={styleMatiere({ matiereLibelle: c.matiereLibelle })}>
                        <span className="jour-detail__pastille jour-detail__pastille--controle" aria-hidden="true" />

                        {/* Vers la fiche : c'est là que vivent le programme,
                            l'avancement et le bouton « Préparer ». */}
                        <Link
                          to={`/eleves/${eleveId}/controles/${c.id}`}
                          className="jour-detail__matiere"
                        >
                          {c.matiereLibelle}
                        </Link>

                        <span className="jour-detail__sujet">{c.sujet || 'Sujet non précisé'}</span>
                        {c.heureControle && (
                          <span className="jour-detail__heure">{c.heureControle.slice(0, 5)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            {toutesLesSeancesDuJour(jourDetail).length === 0
              && evaluationsDuJour(jourDetail).length === 0
              && vacancesDuJour(jourDetail).length === 0
              && controlesDuJour(jourDetail).length === 0 && (
              <p className="etat-vide">Rien à voir pour cette journée.</p>
            )}

            <div className="modale__actions">
              <button type="button" className="btn-ghost" onClick={fermerDetail}>
                Fermer
              </button>
              <button type="button" className="btn btn--compact" onClick={() => setModeFormulaire(true)}>
                Ajouter un contrôle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOUS LE BOUTON RETOUR, ET NULLE PART AILLEURS : c'est la première
          chose qu'on lit en arrivant sur cette page, avant même le mois
          affiché — c'est une information sur AUJOURD'HUI, indépendante du
          mois qu'on est en train de consulter. */}
      {zone && decompte && (
        <p className="calendrier-eleve__decompte">
          <span className="calendrier-eleve__decompte-icone">
            <IconeSablier />
          </span>
          <span className="calendrier-eleve__decompte-texte">
            {/* LA DATE EXACTE EN DESSOUS, PAS DANS LA MÊME PHRASE.
                Deux mentions en gras sur une seule ligne se disputaient
                l'attention. Ici le délai reste seul en avant ; la date, plus
                petite et plus sobre, reste lisible sans lui faire concurrence. */}
            <span>{decompte.intro} <strong>{decompte.delai}</strong>.</span>
            <span className="calendrier-eleve__decompte-date">
              à partir du <strong>{decompte.aPartirDe}</strong>
            </span>
          </span>
        </p>
      )}

      {/* LA RELIURE, ET LE PAPIER EN DESSOUS.
          Rien d'autre ne dit « calendrier » d'un coup d'œil comme des anneaux
          en tête d'une feuille : le mois, sa légende et sa grille vivent tous
          les trois sur la même page, du coup. */}
      <div className="calendrier-eleve__carte">
        <div className="calendrier-eleve__reliure" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
        </div>

        <header className="calendrier-eleve__entete">
          <button type="button" className="calendrier-eleve__nav" onClick={moisPrecedent} aria-label="Mois précédent">
            ‹
          </button>
          {/* `h2` depuis le 14/09/2026 : sur « Mon calendrier », le titre de
              la page (le `h1`) est désormais « Mon calendrier », dans sa bulle ;
              dans la fenêtre de l'administration, le mois vient déjà sous le
              `h2` « Calendrier de … ». Mêmes styles globaux pour h1 et h2 :
              rien ne change à l'œil. */}
          <h2>{MOIS_LIBELLE[curseur.getMonth()]} {curseur.getFullYear()}</h2>
          <button type="button" className="calendrier-eleve__nav" onClick={moisSuivant} aria-label="Mois suivant">
            ›
          </button>
        </header>

        {/* PAS DE ZONE RENSEIGNÉE : ON LE DIT, ON NE LAISSE PAS UNE GRILLE
            SILENCIEUSEMENT VIDE DE VACANCES. */}
        {!zone && (
          <p className="calendrier-eleve__sans-zone">
            L'académie n'est pas renseignée : les périodes de vacances
            n'apparaissent pas encore ici.
          </p>
        )}

        <div className="calendrier-eleve__legende">
          <span>
            <span className="calendrier-eleve__pastille calendrier-eleve__pastille--vacances" />
            {' '}Vacances{zone && ` (${LIBELLE_ZONE[zone] ?? zone})`}
          </span>
          <span>
            <span className="calendrier-jour__coche calendrier-eleve__coche-legende"><Coche /></span>
            Cours effectué
          </span>
          <span>
            <span className="calendrier-jour__coche calendrier-jour__coche--evaluation calendrier-eleve__coche-legende">
              <IconeEvaluation />
            </span>
            Évaluation
          </span>
          <span>
            <span className="calendrier-jour__marque-controle calendrier-eleve__marque-legende">
              Contrôle
            </span>
            {' '}à venir
          </span>
        </div>

        <div className="calendrier-grille" role="grid">
          {JOURS_SEMAINE.map((j) => (
            <span key={j} className="calendrier-grille__entete-jour">{j}</span>
          ))}

          {jours.map(({ date, duMois }) => {
            const aujourdhui = memeJour(date, new Date());
            const seancesJour = duMois ? seancesDuJour(date) : [];
            const evalJour = duMois ? evaluationDuJour(date) : null;
            const vacancesJour = duMois && enVacances(date);
            const controleJour = duMois && controleDuJour(date);
            const controlePasse = controleJour && date < AUJOURDHUI_MINUIT;

            // TOUT JOUR DU MOIS EST CLIQUABLE — voulu par Camara le
            // 12/09/2026 : même un jour vide ouvre la fenêtre de détail,
            // avec le bouton « Ajouter un contrôle » dedans. Seuls les jours
            // hors mois (grisés, semaine incomplète) restent inertes.
            const ouvrir = () => { setJourDetail(date); setModeFormulaire(false); };

            return (
              <div
                key={date.toISOString()}
                role={duMois ? 'button' : undefined}
                tabIndex={duMois ? 0 : undefined}
                onClick={duMois ? ouvrir : undefined}
                onKeyDown={duMois ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(); }
                } : undefined}
                className={[
                  'calendrier-jour',
                  !duMois && 'calendrier-jour--hors-mois',
                  vacancesJour && 'calendrier-jour--vacances',
                  controleJour && !controlePasse && 'calendrier-jour--controle',
                  // Le jour même, le contraste monte d'un cran : ce n'est plus
                  // « ça arrive », c'est « c'est maintenant ».
                  controleJour && aujourdhui && 'calendrier-jour--controle-aujourdhui',
                  controlePasse && 'calendrier-jour--controle-passe',
                  aujourdhui && 'calendrier-jour--aujourdhui',
                  duMois && 'calendrier-jour--cliquable',
                ].filter(Boolean).join(' ')}
              >
                <span className="calendrier-jour__numero">{date.getDate()}</span>

                {/* LE MOT, PAS SEULEMENT LA COULEUR. Un fond orange ne dit
                    rien à qui ne connaît pas la légende — et rien du tout à
                    un lecteur d'écran. Le libellé se réduit à « Ctrl » sur
                    les petits écrans, mais il est toujours dans le DOM. */}
                {controleJour && (
                  <span
                    className="calendrier-jour__marque-controle"
                    title={`Contrôle — ${controlesDuJour(date).map((c) => c.matiereLibelle).join(', ')}`}
                  >
                    Contrôle
                  </span>
                )}

                {(seancesJour.length > 0 || evalJour) && (
                  <span className="calendrier-jour__pastilles">
                    {seancesJour.length > 0 && (
                      <span
                        className="calendrier-jour__coche"
                        title={seancesJour.length === 1
                          ? `Cours effectué — ${seancesJour[0].matiereLibelle}`
                          : `Cours effectués — ${seancesJour.map((s) => s.matiereLibelle).join(', ')}`}
                      >
                        <Coche />
                      </span>
                    )}
                    {evalJour && (
                      <span
                        className="calendrier-jour__coche calendrier-jour__coche--evaluation"
                        title={`Évaluation — ${evalJour.matiereLibelle}`}
                      >
                        <IconeEvaluation />
                      </span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PLUS DE LISTE « ÉVALUATIONS À VENIR » SOUS LE CALENDRIER — retirée
          par Camara le 15/09/2026. Une évaluation que le professeur reporte
          n'a pas de date : un élève qui la repousse à chaque séance la
          laissait affichée « dès le prochain cours » indéfiniment, une
          promesse que rien ne tenait. Le calendrier ne montre que ce qui a
          une date : séances, évaluations passées, contrôles. */}
    </>
  );
}

const JOURS_SEMAINE = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

const MOIS_LIBELLE = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Lundi = 0 … Dimanche = 6, contrairement à `Date.getDay()`. */
const jourSemaine = (date) => (date.getDay() + 6) % 7;

const memeJour = (a, b) =>
  a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate();

const heure = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const dateLongue = (date) =>
  date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/**
 * « 17 octobre », sans l'année : le décompte se lit dans les prochaines
 * semaines, jamais assez loin pour qu'elle soit nécessaire — et l'ajouter
 * l'alourdirait pour rien entre parenthèses.
 */
const dateCourte = (date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

const UN_JOUR_MS = 24 * 60 * 60 * 1000;

/** Le nombre de jours PLEINS entre deux dates, l'heure ignorée. */
const joursEntre = (a, b) => {
  const debut = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const fin = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((fin - debut) / UN_JOUR_MS);
};

/**
 * « Dans 3 semaines », « dans 9 jours », « demain » : l'unité change avec le
 * rapprochement de la date, pas seulement le nombre. Les semaines suffisent
 * de loin ; sous quatorze jours, l'enfant veut compter sur ses doigts.
 */
const delaiTexte = (jours) => {
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return 'demain';
  if (jours < 14) return `dans ${jours} jours`;

  const semaines = Math.round(jours / 7);
  return `dans ${semaines} semaine${semaines > 1 ? 's' : ''}`;
};

/**
 * Le décompte affiché sous « Retour » : avant des vacances, ou avant la
 * rentrée si l'enfant y est déjà.
 *
 * `prochaineVacances` VIENT DÉJÀ TRIÉE PAR LE SERVEUR : c'est la période en
 * cours si l'enfant y est, sinon la toute prochaine — jamais bornée au mois
 * affiché, pour que le décompte reste juste qu'on regarde septembre ou
 * décembre. Pas besoin de revérifier ici si on est dedans : il suffit de
 * regarder si son DÉBUT est déjà passé.
 *
 * RENDU EN DEUX MORCEAUX, PAS EN UNE PHRASE. Le composant met le délai en
 * évidence (couleur, graisse) — il lui faut donc sa propre chaîne, distincte
 * de ce qui l'introduit.
 */
const messageDecompte = (prochaineVacances) => {
  if (!prochaineVacances) return null;

  const aujourdhui = new Date();
  const debut = new Date(prochaineVacances.dateDebut);
  const fin = new Date(prochaineVacances.dateFin);

  const dejaCommencees = joursEntre(aujourdhui, debut) <= 0;

  if (dejaCommencees) {
    const reprise = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() + 1);
    return {
      intro: 'La rentrée est',
      delai: delaiTexte(joursEntre(aujourdhui, reprise)),
      // À PARTIR DE LA REPRISE, PAS DE LA FIN DES VACANCES.
      // C'est la date qui répond à « à partir de quand ? » pour une rentrée :
      // la veille ne dit rien de plus que « les vacances ne sont pas finies ».
      aPartirDe: dateCourte(reprise),
    };
  }

  // « Vacances de la Toussaint » devient « les vacances de la Toussaint » :
  // le libellé, tel qu'enregistré, est pensé pour ouvrir une phrase, pas
  // pour en poursuivre une.
  const libelle = prochaineVacances.libelle
    ? prochaineVacances.libelle.charAt(0).toLowerCase() + prochaineVacances.libelle.slice(1)
    : 'vacances';

  return {
    intro: `Les ${libelle} sont`,
    delai: delaiTexte(joursEntre(aujourdhui, debut)),
    aPartirDe: dateCourte(debut),
  };
};

/**
 * Le sablier du décompte — dessiné plutôt qu'un emoji, pour rester dans le
 * même style que la lune et le soleil du bouton de thème : un trait qui
 * porte sa propre couleur, plutôt qu'une image que le système impose.
 */
function IconeSablier() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 3h11M6.5 21h11" />
      <path d="M7.5 3c0 4.1 3 5.7 4.5 6.6.5.3.5 1 0 1.3-1.5.9-4.5 2.5-4.5 6.6M16.5 3c0 4.1-3 5.7-4.5 6.6-.5.3-.5 1 0 1.3 1.5.9 4.5 2.5 4.5 6.6" />
      <path d="M9 5.6h6M9 18.4h6" />
    </svg>
  );
}

/**
 * Le nom lisible d'une zone — celle de l'académie de l'enfant, affichée à
 * côté de « Vacances » dans la légende. Un code brut comme « CORSE » ou
 * « REUNION » ne parle à personne ; ce que le parent a choisi dans le
 * formulaire de l'enfant, si.
 */
const LIBELLE_ZONE = {
  A: 'Zone A',
  B: 'Zone B',
  C: 'Zone C',
  CORSE: 'Corse',
  GUADELOUPE: 'Guadeloupe',
  GUYANE: 'Guyane',
  MARTINIQUE: 'Martinique',
  MAYOTTE: 'Mayotte',
  REUNION: 'La Réunion',
};

/** La grille du mois : les jours du mois, entourés des jours voisins nécessaires
 * pour compléter des semaines entières — grisés, mais affichés, pour que la
 * grille ne saute jamais d'une semaine incomplète à l'autre. */
function grilleDuMois(annee, moisIndex0) {
  const premier = new Date(annee, moisIndex0, 1);
  const dernier = new Date(annee, moisIndex0 + 1, 0);

  const debut = new Date(premier);
  debut.setDate(debut.getDate() - jourSemaine(premier));

  const fin = new Date(dernier);
  fin.setDate(fin.getDate() + (6 - jourSemaine(dernier)));

  const jours = [];
  for (let d = new Date(debut); d <= fin; d.setDate(d.getDate() + 1)) {
    jours.push({ date: new Date(d), duMois: d.getMonth() === moisIndex0 });
  }
  return jours;
}

/**
 * La coche verte : « un cours a eu lieu ce jour-là », rien de plus.
 *
 * UNE SEULE COCHE, PAS UNE PASTILLE PAR MATIÈRE.
 * ------------------------------------------------
 * La grille avait d'abord une pastille par matière travaillée — mais un
 * jour testé huit fois dans la même matière (fréquent avec le compte de
 * démonstration) affichait huit pastilles identiques, illisible, et
 * choisir une teinte de légende posait le problème inverse : n'importe
 * quelle couleur fixe fait croire qu'elle désigne UNE matière (le sarcelle
 * de la légende EST la couleur des mathématiques). La coche règle les deux
 * à la fois : elle ne varie jamais, donc ne peut se confondre avec aucune
 * matière, et le détail — lesquelles, à quelle heure — reste entièrement
 * dans la fenêtre qui s'ouvre au clic.
 */
function Coche() {
  return (
    <svg
      className="calendrier-jour__coche-icone"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8.6 6.8 12 12.5 4.5" />
    </svg>
  );
}

/**
 * Le stylo : « une évaluation a eu lieu ce jour-là ».
 *
 * D'ABORD UNE COPIE ET UN STYLO — RETIRÉE À LA COPIE.
 * Le badge ne fait que quatorze pixels : une feuille avec ses lignes de
 * texte ET un stylo posé dessus s'y réduisait à une tache, illisible même
 * en plissant les yeux. Le stylo seul, en revanche, garde sa silhouette
 * reconnaissable à cette taille — c'est lui qui porte l'idée, la copie
 * n'ajoutait qu'un fond qui ne se voyait plus.
 */
function IconeEvaluation() {
  return (
    <svg
      className="calendrier-jour__coche-icone"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.3 12.7 4.1 9.5 10.4 3.2c.6-.6 1.6-.6 2.2 0 .6.6.6 1.6 0 2.2L6.3 11.7 3.3 12.7Z" />
      <path d="M9.2 4.4 11.4 6.6" />
    </svg>
  );
}
