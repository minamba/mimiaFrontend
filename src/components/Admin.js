import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  chargerAdmin,
  changerGranularite,
  filtrerParEleve,
  rechercher,
  reinitialiserFiltres,
  rechercherEleve,
  filtrerParParent,
  ouvrirFiche,
  fermerFiche,
  muter,
  changerPeriodeCout,
} from '../lib/actions/adminActions';
import {
  getHistoriqueEvaluations,
  getHistoriqueRapports,
  getCout,
  getHistoriqueHeures,
  definirAdministrateur,
  getRepartitionParents,
  bannirParent,
  getRapportEleve,
  getCopieEleve,
} from '../lib/api/adminApi';
import ChoixEleve from './ChoixEleve';
import FicheEleve from './FicheEleve';
import Graphique from './Graphique';
import Frequentation from './Frequentation';
import RelectureAvis from './RelectureAvis';
import Loader from './Loader';
import Modes from './Modes';
import Diffusion from './Diffusion';
import Messagerie from './Messagerie';
import MessageInformation from './MessageInformation';
import PromosAdmin from './PromosAdmin';
import Onglets from './Onglets';
import Bannis from './Bannis';
import Planches from './Planches';
import { ranger, suivant, annoncerTri } from '../lib/triTableau';

const GRANULARITES = [
  { cle: 'jour', libelle: 'Jour' },
  { cle: 'semaine', libelle: 'Semaine' },
  { cle: 'mois', libelle: 'Mois' },
  { cle: 'annee', libelle: 'Année' },
];

/**
 * Un en-tête de colonne qui range le tableau.
 *
 * Un BOUTON dans le `th`, pas un `th` cliquable : c'est le bouton qui rend
 * la colonne atteignable au clavier et annonçable par un lecteur d'écran.
 * `aria-sort` sur le `th` dit ensuite dans quel sens elle est rangée.
 */
function ColonneTriable({ libelle, colonne, tri, onTrier, aDroite = false }) {
  const actif = tri.colonne === colonne;

  return (
    <th scope="col" aria-sort={annoncerTri(tri, colonne)} className={aDroite ? 'num' : undefined}>
      <button
        type="button"
        className={`tri-colonne ${actif ? 'tri-colonne--actif' : ''}`}
        onClick={() => onTrier(colonne)}
      >
        {libelle}
        {/* La flèche n'apparaît que sur la colonne active : en afficher une
            partout ferait chercher laquelle est grise. */}
        <span className="tri-colonne__fleche" aria-hidden="true">
          {actif ? (tri.ascendant ? '↑' : '↓') : ''}
        </span>
      </button>
    </th>
  );
}

/** Valeurs de l'énumération Sexe côté serveur. */
const SEXES = { 0: '—', 1: 'Fille', 2: 'Garçon' };

/**
 * Champ de recherche à propagation différée.
 *
 * Une frappe recharge tout le tableau de bord — six requêtes. Taper « Emma »
 * en lancerait donc quatre séries pour un seul résultat utile. On attend que
 * la saisie se stabilise avant d'interroger le serveur.
 */
function useSaisieDifferee(appliquer, delai = 350, valeurInitiale = '') {
  // ELLE PART DE CE QUE LE STORE CONTIENT, ET C'EST TOUT LE CORRECTIF ICI.
  //
  // Le commentaire ci-dessous affirmait depuis toujours « au montage, la
  // valeur est déjà celle du store » — sauf qu'elle démarrait vide. Un filtre
  // survivant au démontage donnait donc un champ vierge devant une liste
  // filtrée : l'écran mentait sur son propre état, et rien ne permettait de
  // défaire ce qu'on ne voyait pas.
  const [valeur, setValeur] = useState(valeurInitiale);
  const premierRendu = useRef(true);
  const dernierApplique = useRef('');

  useEffect(() => {
    // Au montage, la valeur est déjà celle du store : la propager relancerait
    // un chargement identique à celui que le composant vient de déclencher.
    if (premierRendu.current) {
      premierRendu.current = false;
      return undefined;
    }

    // Ne relance rien si le terme finalement retenu est celui déjà appliqué :
    // vider un champ déjà vide ne doit pas recharger le tableau de bord.
    if (valeur === dernierApplique.current) return undefined;

    const minuteur = setTimeout(() => {
      dernierApplique.current = valeur;
      appliquer(valeur);
    }, delai);

    return () => clearTimeout(minuteur);
  }, [valeur]); // eslint-disable-line react-hooks/exhaustive-deps

  return [valeur, setValeur];
}

/** Chiffre de tête : pas de graphique pour une valeur unique. */
function Tuile({ libelle, valeur, precision }) {
  return (
    <div className="stat">
      <span className="stat__valeur">{(valeur ?? 0).toLocaleString('fr-FR')}</span>
      <span className="stat__libelle">{libelle}</span>
      {precision && <span className="stat__precision">{precision}</span>}
    </div>
  );
}

/**
 * Ce qu'une famille consomme de son forfait, sur la période en cours.
 *
 * POURQUOI CE CHIFFRE ET PAS LE NOMBRE DE REQUÊTES
 * ------------------------------------------------
 * Le prix d'une formule est calculé sur un pot d'heures. Tant qu'on ignore
 * quelle PART de ce pot est réellement consommée, la marge reste une
 * hypothèse : au pot plein elle vaut la moitié de ce qu'elle vaut à moitié
 * consommé. Le nombre de requêtes ne dit rien de ça — dix messages courts et
 * dix longues séances s'y ressemblent.
 *
 * LA BARRE CHANGE DE TON, ET SEULEMENT AUX SEUILS QUI COMPTENT
 * -----------------------------------------------------------
 * En dessous de 80 %, la famille est dans son forfait et il n'y a rien à
 * signaler — une couleur neutre. Au-delà, elle approche du pot : c'est le
 * moment où elle achètera des heures ou se sentira bridée. À 100 %, elle y
 * est. Trois teintes suffisent ; une échelle continue ferait joli et ne
 * dirait rien.
 *
 * SANS ABONNEMENT, ON ÉCRIT UN TIRET
 * ----------------------------------
 * Compte tout neuf, essai fini, résiliation : un « 0 % » s'y lirait comme
 * « cette famille n'utilise pas ce qu'elle paie », alors qu'elle ne paie rien.
 */
function Consommation({ parent }) {
  const { formule, minutesPot, minutesConsommees } = parent;

  if (!formule || !minutesPot) return <span className="conso__vide">—</span>;

  const part = Math.round((minutesConsommees / minutesPot) * 100);
  const ton = part >= 100 ? 'plein' : part >= 80 ? 'proche' : 'normal';

  return (
    <div className="conso" title={`${formule} — ${minutesConsommees} min sur ${minutesPot}`}>
      <div className="conso__jauge">
        {/* Bornée à 100 % : les recharges entrent dans le pot, donc dépasser
            est impossible — mais une barre qui sortirait de son cadre sur une
            donnée aberrante casserait la colonne entière. */}
        <span
          className={`conso__part conso__part--${ton}`}
          style={{ width: `${Math.min(part, 100)}%` }}
        />
      </div>

      {/* Le pourcentage ET les heures. Le premier situe dans le forfait, les
          secondes disent l'usage réel : 16 % ne pèse pas pareil sur un pot de
          neuf heures et sur un pot de vingt-quatre. */}
      <span className="conso__chiffre">
        {part} %
        <span className="conso__heures">
          {enHeures(minutesConsommees)} / {enHeures(minutesPot)}
        </span>
      </span>
    </div>
  );
}

/**
 * Ce qu'il reste dans le pot, en heures.
 *
 * POURQUOI UNE COLONNE À PART PLUTÔT QU'UN TROISIÈME CHIFFRE DANS LA JAUGE
 * -----------------------------------------------------------------------
 * La cellule voisine répond à « quelle part du forfait est utilisée » — une
 * question de rentabilité, celle de l'exploitant. Celle-ci répond à « combien
 * de temps de cours reste-t-il » — la question du parent, celle qu'il pose au
 * support. Deux lectures différentes, deux colonnes.
 *
 * C'est aussi le chiffre qu'on compare à ce que le parent voit sur son écran :
 * mélangé à un pourcentage et à un total, il aurait fallu le calculer de tête.
 */
function Restant({ parent }) {
  const { formule, minutesPot, minutesConsommees } = parent;

  if (!formule || !minutesPot) return <span className="conso__vide">—</span>;

  // Borné à zéro : un pot dépassé — ça n'arrive pas, les recharges entrent
  // dedans — afficherait « -20 min », ce qui ne veut rien dire pour personne.
  const reste = Math.max(0, minutesPot - (minutesConsommees ?? 0));

  // Les mêmes trois seuils que la jauge, lus dans l'autre sens : il reste peu
  // quand il est beaucoup consommé. Une famille à court d'heures est celle
  // qu'on appelle, ou à qui on propose une recharge.
  const part = minutesPot > 0 ? (reste / minutesPot) * 100 : 0;
  const ton = part <= 0 ? 'plein' : part <= 20 ? 'proche' : 'normal';

  return (
    <span className={`restant restant--${ton}`} title={`${reste} min restantes sur ${minutesPot}`}>
      {enHeures(reste)}
    </span>
  );
}

/**
 * Le taux de change euro/dollar.
 *
 * FIGÉ, ET C'EST UN CHOIX. Le chiffre sert à comparer un coût à un abonnement
 * encaissé en euros, pas à tenir une comptabilité. Un appel à un service de
 * change à chaque affichage du tableau ajouterait une dépendance réseau — et
 * un écran qui tombe en panne parce qu'un convertisseur ne répond pas — pour
 * une précision dont personne n'a besoin ici.
 *
 * À relire si l'euro bouge de plus de dix pour cent.
 */
const EURO_PAR_DOLLAR = 0.92;

/**
 * Ce qu'une famille a coûté depuis son inscription.
 *
 * LE DIALOGUE EST MESURÉ, LA VOIX EST ESTIMÉE
 * -------------------------------------------
 * Chaque tour de parole enregistre ses jetons — entrée, sortie, cache lu,
 * cache écrit — et le modèle qui les a produits. Le coût du dialogue est donc
 * un relevé, pas une moyenne. La synthèse vocale, elle, n'est mesurée nulle
 * part par famille : on la déduit des minutes de séance.
 *
 * Les deux sont additionnés parce que c'est le total qui répond à « suis-je
 * déficitaire ». Le détail reste lisible au survol, pour qu'on sache toujours
 * quelle part est relevée et quelle part est déduite.
 *
 * Les frais Stripe n'y sont pas : ils pèsent sur l'encaissement, pas sur
 * l'usage, et se lisent dans le tableau de bord Stripe.
 */
function Cout({ parent }) {
  const { coutDollars, coutDialogueDollars, prixMensuelCentimes } = parent;

  if (coutDollars === null || coutDollars === undefined) {
    return <span className="conso__vide">—</span>;
  }

  const euros = coutDollars * EURO_PAR_DOLLAR;
  const voix = coutDollars - (coutDialogueDollars ?? 0);
  const prix = (prixMensuelCentimes ?? 0) / 100;

  /**
   * LA COULEUR DIT LE RAPPORT AU PRIX PAYÉ, PAS LE MONTANT.
   *
   * « 22 € » ne veut rien dire seul : c'est excellent en face de 99 €,
   * catastrophique en face de 39,90 €. Colorer le montant selon sa taille
   * aurait donc coloré la mauvaise chose — et rassuré sur les familles
   * chères parce qu'elles paient beaucoup.
   *
   * Les seuils sont ceux où une décision change : au-delà de la moitié du
   * prix, la marge cesse d'être confortable ; aux deux tiers, la formule est
   * à revoir. En dessous, il n'y a rien à signaler et le montant reste en
   * encre ordinaire — colorer ce qui va bien apprend à ignorer la couleur.
   */
  const part = prix > 0 ? euros / prix : null;
  const ton = part === null ? 'neutre'
    : part >= 0.66 ? 'critique'
      : part >= 0.5 ? 'vigilant'
        : 'sain';

  const detail = [
    `dialogue ${(coutDialogueDollars ?? 0).toFixed(2)} $ (mesuré)`,
    `voix ~${voix.toFixed(2)} $ (estimée)`,
    prix > 0 ? `soit ${Math.round(part * 100)} % des ${prix.toFixed(2)} € payés` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="cout" title={detail}>
      <span className="cout__dollars">{coutDollars.toFixed(2)} $</span>
      <span className="cout__euros">
        {euros.toFixed(2).replace('.', ',')} €
        {part !== null && (
          <span className={`cout__part cout__part--${ton}`}>
            {' · '}{Math.round(part * 100)} % du prix
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * Ce que toutes les familles coûtent sur la période courante.
 *
 * COURANTE, ET NON GLISSANTE. « Mois » veut dire depuis le 1er, pas les trente
 * derniers jours : c'est ce qu'on compare à des abonnements encaissés au mois.
 * Une fenêtre glissante donnerait un chiffre qui ne correspond à aucune
 * recette.
 *
 * IL SE RECHARGE SEUL À CHAQUE CHANGEMENT DE PÉRIODE, et pas au montage
 * seulement : sans ça, passer de « jour » à « mois » afficherait l'ancien
 * chiffre sous le nouveau libellé — la pire des erreurs, celle qu'on ne
 * remarque pas.
 */
const PERIODES = [
  { cle: 'jour', libelle: 'Jour' },
  { cle: 'semaine', libelle: 'Semaine' },
  { cle: 'mois', libelle: 'Mois' },
  { cle: 'annee', libelle: 'Année' },
];

/**
 * Le libellé d'une période, construit sur les bornes RENVOYÉES PAR LE SERVEUR.
 *
 * Et non recalculées ici : lui seul sait où commence une semaine ou un mois, et
 * deux calendriers qui divergent d'un jour donneraient un titre qui ment sur
 * les chiffres affichés dessous.
 */
function libellePeriode(periode, debut) {
  if (!debut) return '—';

  const d = new Date(debut);

  if (periode === 'jour') {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  if (periode === 'semaine') {
    const fin = new Date(d);
    fin.setDate(fin.getDate() + 6);
    const court = { day: 'numeric', month: 'short' };
    return `${d.toLocaleDateString('fr-FR', court)} – ${fin.toLocaleDateString('fr-FR', court)}`;
  }

  if (periode === 'annee') return String(d.getFullYear());

  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

/** Des minutes en « 3 h 52 », parce qu'on ne compte pas un cours en minutes. */
function enHeures(minutes) {
  const m = Math.max(0, Math.round(minutes ?? 0));
  const h = Math.floor(m / 60);
  return h === 0 ? `${m} min` : `${h} h ${String(m % 60).padStart(2, '0')}`;
}

/**
 * Ce que toutes les familles coûtent, et le temps de cours, sur une période.
 *
 * LA PÉRIODE EST ENTIÈRE, PAS GLISSANTE. « Mois » va du 1er au dernier jour :
 * c'est ce qu'on compare à des abonnements encaissés au mois. Une fenêtre
 * glissante donnerait un chiffre qui ne correspond à aucune recette.
 *
 * LES CHEVRONS DÉPLACENT LA FENÊTRE D'UNE PÉRIODE, et le serveur seul calcule
 * les bornes — l'écran ne fait que demander « la précédente ». Celui de droite
 * s'éteint sur la période courante : on ne navigue pas dans un futur qui n'a
 * pas eu lieu.
 */
/**
 * Ce que chaque poste de fond veut dire, en français.
 *
 * Les clés sont celles écrites par l'API au moment de l'appel. Un poste
 * inconnu affiche sa clé brute plutôt que de disparaître : un coût sans nom
 * reste un coût, et le cacher rendrait le total à nouveau inexplicable.
 */
const LIBELLES_POSTES = {
  bilan: 'bilans envoyés aux familles',
  'reperes-planche': 'repères relevés sur les planches',
  'description-planche': 'descriptions de planches',
  'observation-competences': 'observations de séances',
  'transcription-document': 'transcriptions de documents',
};

/**
 * Où en est le fichier clients, en une bulle.
 *
 * SANS FENÊTRE, et c'est délibéré : le bandeau du dessus compte ce qui
 * s'est passé pendant une période, celui-ci dit ce qui EST. Le sélecteur
 * Jour/Semaine/Mois ne le concerne pas, et l'écrire sous le titre évite de
 * chercher pourquoi les chiffres ne bougent pas en changeant de période.
 *
 * LES CASES SONT EXHAUSTIVES : payants, essais, en pause, résiliés et
 * jamais abonnés retombent sur le total. Un parent est dans une case et
 * une seule — sans quoi le bloc laisserait croire à des départs qu'il
 * faudrait aller vérifier à la main.
 */
function FichierClients() {
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let vivant = true;

    getRepartitionParents()
      .then(({ data }) => { if (vivant) setDonnees(data); })
      .catch(() => { if (vivant) setErreur(true); });

    return () => { vivant = false; };
  }, []);

  if (erreur || !donnees) return null;

  const payants = (donnees.forfaits ?? []).reduce((n, f) => n + (f.total ?? 0), 0);

  const cases = [
    { cle: 'payants', libelle: 'abonnés payants', valeur: payants, fort: true },
    { cle: 'essais', libelle: 'en essai gratuit', valeur: donnees.essais ?? 0 },
    { cle: 'pause', libelle: 'en pause', valeur: donnees.enPause ?? 0 },
    { cle: 'resilies', libelle: 'désabonnés', valeur: donnees.resilies ?? 0 },
    { cle: 'jamais', libelle: 'jamais abonnés', valeur: donnees.jamaisAbonnes ?? 0 },
  ];

  return (
    <div className="fichier">
      <div className="fichier__entete">
        <h3 className="fichier__titre">Le fichier clients</h3>
        <span className="fichier__note">état du jour, indépendant de la période</span>
      </div>

      <div className="fichier__corps">
        <div className="fichier__total">
          <span className="fichier__total-valeur">{donnees.total ?? 0}</span>
          <span className="fichier__total-libelle">
            compte{(donnees.total ?? 0) > 1 ? 's' : ''} parent
            {(donnees.total ?? 0) > 1 ? 's' : ''}
          </span>
        </div>

        {/* Les cinq cases, dans le même ordre que le cycle de vie : on
            paie, on essaie, on suspend, on part, on n'est jamais venu. */}
        <ul className="fichier__cases">
          {cases.map((c) => (
            <li key={c.cle} className={c.fort ? 'fichier__case fichier__case--fort' : 'fichier__case'}>
              <strong>{c.valeur}</strong>
              <span>{c.libelle}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* LE DÉTAIL PAR FORMULE ET PAR RYTHME. Le mensuel et l'annuel ne se
          valent pas — un annuel encaisse onze mois d'avance et ne peut pas
          partir le mois prochain — et les additionner effacerait justement
          ce qui distingue les deux. */}
      {(donnees.forfaits ?? []).length > 0 && (
        <table className="fichier__forfaits">
          <thead>
            <tr>
              <th>Formule</th>
              <th>Mensuel</th>
              <th>Annuel</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {donnees.forfaits.map((f) => (
              <tr key={f.code}>
                <td>{f.libelle ?? f.code}</td>
                <td>{f.mensuel ?? 0}</td>
                <td>{f.annuel ?? 0}</td>
                <td className="fichier__forfaits-total">{f.total ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CoutTotal() {
  // LA FENÊTRE VIT DANS L'ÉTAT PARTAGÉ, pas ici. Le tableau du dessous en
  // dépend autant que ce bandeau : la garder locale afficherait un total de
  // juillet au-dessus de lignes d'août, sans que rien ne le signale.
  const dispatch = useDispatch();
  const { periodeCout: periode, decalageCout: decalage } =
    useSelector((state) => state.admin);

  const setPeriode = (p) => dispatch(changerPeriodeCout(p, 0));
  const setDecalage = (calculer) =>
    dispatch(changerPeriodeCout(periode, calculer(decalage)));

  const [cout, setCout] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;

    setChargement(true);
    setErreur(null);

    getCout(periode, decalage)
      .then(({ data }) => { if (vivant) setCout(data); })
      .catch(() => { if (vivant) setErreur("Le coût n'a pas pu être calculé."); })
      .finally(() => { if (vivant) setChargement(false); });

    return () => { vivant = false; };
  }, [periode, decalage]);

  const dollars = cout?.totalDollars ?? 0;
  const pale = chargement ? 'cout-total__pale' : '';

  // Ce que les familles consomment vraiment : le dialogue et la voix, et rien
  // d'autre. Le déduire du total plutôt que d'additionner les deux postes
  // laisserait les frais de fond dedans le jour où l'API en ajoute un.
  const famillesDollars = (cout?.dialogueDollars ?? 0) + (cout?.voixDollars ?? 0);

  const postes = cout?.postes ?? [];

  return (
    <div className="cout-total">
      <div className="cout-total__entete">
        <div className="cout-total__periodes">
          {PERIODES.map((p) => (
            <button
              key={p.cle}
              type="button"
              className={`onglet onglet--mini ${periode === p.cle ? 'onglet--actif' : ''}`}
              onClick={() => setPeriode(p.cle)}
            >
              {p.libelle}
            </button>
          ))}
        </div>

        <div className="cout-total__navigation">
          <button
            type="button"
            className="chevron"
            aria-label="Période précédente"
            onClick={() => setDecalage((d) => d - 1)}
          >
            ‹
          </button>

          <span className="cout-total__quand">{libellePeriode(periode, cout?.debut)}</span>

          <button
            type="button"
            className="chevron"
            aria-label="Période suivante"
            disabled={decalage >= 0}
            onClick={() => setDecalage((d) => Math.min(0, d + 1))}
          >
            ›
          </button>

          <button
            type="button"
            className="onglet onglet--mini"
            disabled={decalage === 0}
            onClick={() => setDecalage(() => 0)}
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {erreur && <div className="alert">{erreur}</div>}

      {!erreur && (
        <>
          <h3 className="cout-total__titre">Ce que le produit me coûte</h3>

          <div className="cout-total__corps">
            <div className="cout-total__montant">
              {/* Le chiffre reste affiché pendant le rechargement, en retrait :
                  le vider ferait clignoter la page à chaque clic, et un blanc
                  se lit comme « zéro ». */}
              <span className={pale}>{dollars.toFixed(2)} $</span>
              <span className="cout-total__euros">
                {(dollars * EURO_PAR_DOLLAR).toFixed(2).replace('.', ',')} €
              </span>
            </div>

            {/* DEUX BULLES, ET C'EST TOUTE LA CORRECTION.

                Le total mêlait ce que les familles consomment et ce que le
                produit dépense tout seul — bilans, planches, observations.
                On lisait donc « ce que les familles me coûtent : 0,04 $ »
                au-dessus d'un tableau où aucune famille n'avait rien
                dépensé, sans rien pour expliquer l'écart. Les postes de fond
                étaient déjà calculés par l'API et simplement jamais affichés.

                DEUX SURFACES PLUTÔT QUE DEUX TITRES : les deux groupes ne
                s'additionnent pas dans la même logique — l'un suit les
                familles, l'autre suit le produit — et une liste unique, même
                bien espacée, invite à les lire comme une seule colonne de
                chiffres. La séparation doit être visible, pas déduite. */}
            <div className="cout-total__groupes">
              <section className="cout-bulle">
                <header className="cout-bulle__entete">
                  <div className="cout-bulle__nom">
                    Consommé par les familles
                    <small>ce que les cours ont brûlé</small>
                  </div>
                  <strong className="cout-bulle__somme">
                    {famillesDollars.toFixed(2)} $
                  </strong>
                </header>

                <ul className="cout-bulle__lignes">
                  <li>
                    <span>
                      Dialogue
                      <small>mesuré sur {(cout?.tours ?? 0).toLocaleString('fr-FR')} tours de parole</small>
                    </span>
                    <strong>{(cout?.dialogueDollars ?? 0).toFixed(2)} $</strong>
                  </li>
                  <li>
                    <span>
                      Synthèse vocale
                      <small>estimée d'après ces mêmes tours</small>
                    </span>
                    <strong>{(cout?.voixDollars ?? 0).toFixed(2)} $</strong>
                  </li>
                </ul>
              </section>

              <section className="cout-bulle">
                <header className="cout-bulle__entete">
                  <div className="cout-bulle__nom">
                    Frais de fond
                    <small>hors forfait des familles</small>
                  </div>
                  <strong className="cout-bulle__somme">
                    {(cout?.tachesDeFondDollars ?? 0).toFixed(2)} $
                  </strong>
                </header>

                <ul className="cout-bulle__lignes">
                  {postes.length === 0 && (
                    <li className="cout-bulle__vide">
                      Aucun appel de fond sur la période.
                    </li>
                  )}
                  {postes.map((poste) => (
                    <li key={poste.origine}>
                      <span>
                        {LIBELLES_POSTES[poste.origine] ?? poste.origine}
                        <small>
                          {(poste.appels ?? 0).toLocaleString('fr-FR')} appel
                          {(poste.appels ?? 0) > 1 ? 's' : ''}
                        </small>
                      </span>
                      <strong>{(poste.dollars ?? 0).toFixed(2)} $</strong>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Le temps de cours, sous le coût : c'est ce qui le produit. Les
              deux se lisent ensemble — un coût qui monte sans que les heures
              suivent, c'est un problème ; les deux ensemble, c'est le produit
              qui marche. */}
          <div className="cout-total__heures">
            <span className={`cout-total__heures-valeur ${pale}`}>
              {enHeures(cout?.minutesTravaillees)}
            </span>
            <span className="cout-total__heures-note">
              de cours donnés sur la période, recalculés depuis les échanges —
              légèrement inférieurs au compteur des forfaits, dont les
              conversations purgées ont emporté la trace.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * L'historique du pot d'heures supplémentaires d'un compte.
 *
 * AFFICHÉ LÀ OÙ ON AJUSTE, et pas dans un écran à part : le moment où l'on a
 * besoin de savoir ce qui a déjà été donné est exactement celui où l'on
 * s'apprête à donner. Un historique rangé ailleurs ne serait pas consulté.
 */
function HistoriqueHeures({ parentId }) {
  const [lignes, setLignes] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;

    getHistoriqueHeures(parentId)
      .then(({ data }) => { if (vivant) setLignes(data ?? []); })
      .catch(() => { if (vivant) setErreur("L'historique n'a pas pu être chargé."); });

    return () => { vivant = false; };
  }, [parentId]);

  if (erreur) return <p className="modale__note">{erreur}</p>;
  if (!lignes) return <p className="modale__note">Chargement de l’historique…</p>;

  if (lignes.length === 0) {
    return <p className="modale__note">Aucune heure supplémentaire sur ce compte.</p>;
  }

  return (
    <div className="historique-heures">
      <h3 className="historique-heures__titre">Historique</h3>

      <ul className="historique-heures__lignes">
        {lignes.map((l, i) => (
          <li key={`${l.date}-${i}`} className={l.dateRemboursement ? 'est-repris' : ''}>
            <span className="historique-heures__quand">
              {new Date(l.date).toLocaleDateString('fr-FR')}
            </span>

            <span className={`historique-heures__minutes ${l.minutes < 0 ? 'est-retrait' : ''}`}>
              {l.minutes > 0 ? '+' : ''}{l.minutes} min
            </span>

            {/* Le motif pour un ajustement, le prix pour un achat : les deux
                répondent à « d'où viennent ces heures », jamais en même temps. */}
            {/* Le texte complet au survol : la mise en page le fait tenir dans
                tous les cas testés, mais un motif de deux cents caractères
                reste possible — le champ les autorise. Mieux vaut un recours
                qui ne sert jamais qu'un motif qu'on devine. */}
            <span className="historique-heures__motif" title={l.motif ?? undefined}>
              {l.motif
                ? l.motif
                : l.prixCentimes > 0
                  ? `Acheté ${(l.prixCentimes / 100).toFixed(2).replace('.', ',')}\u00A0€`
                  : 'Offert'}
            </span>

            {l.dateRemboursement && (
              <span className="historique-heures__repris">
                repris le {new Date(l.dateRemboursement).toLocaleDateString('fr-FR')}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* UNE RECHARGE NE SE REPORTE PAS. Sans ce rappel, on additionne les
          lignes de tête et on ne comprend pas pourquoi le pot ne correspond
          pas : seules celles de la période en cours comptent. */}
      <p className="modale__note">
        Seules les lignes de la période en cours alimentent le pot : les heures
        supplémentaires ne se reportent pas d’une période à l’autre.
      </p>
    </div>
  );
}

export default function Admin() {
  const dispatch = useDispatch();
  const {
    resume, serieRequetes, serieParents, serieEleves, serieAbonnements,
    parents, eleves, elevesTableau,
    granularite, eleveFiltre, recherche, rechercheEleve, parentFiltre, loading, muting, error,
    fiche, ficheLoading, ficheError,
  } = useSelector((state) => state.admin);

  // Les Modes ferment ou ouvrent le site pour tout le monde : ils restent au
  // super-administrateur. Cacher l onglet n est PAS l autorisation — l API
  // refuse ces routes de son côté ; c est seulement ne pas montrer une porte
  // qu on n ouvrira pas.
  const { estSuperAdmin } = useSelector((state) => state.auth);

  const [onglet, setOnglet] = useState('stats');

  // La messagerie d'abord : c'est celle qu'on ouvre tous les jours, alors
  // qu'une diffusion se prépare trois fois par an.
  const [sousOnglet, setSousOnglet] = useState('messagerie');
  const [edition, setEdition] = useState(null);

  // Le parent qu’on s’apprête à bannir, et le compteur qui fait relire la
  // liste après coup. Deux états plutôt qu’un couplage entre les deux
  // composants : le tableau n’a pas à connaître la liste, il annonce
  // seulement qu’elle a changé.
  const [aBannir, setABannir] = useState(null);
  const [versionBannis, setVersionBannis] = useState(0);

  // Son propre message d'erreur, et non celui de l'écran : `error` vient du
  // magasin Redux, il s'affiche tout en haut de la page — donc DERRIÈRE la
  // modale, invisible pour qui vient de cliquer.
  const [erreurBannissement, setErreurBannissement] = useState(null);

  /**
   * Le compte dont on est en train de changer le rôle.
   *
   * Un identifiant plutôt qu'un booléen : c'est ce qui permet de n'attendre que
   * sur la ligne cliquée, et pas sur toutes.
   */
  const [roleEnCours, setRoleEnCours] = useState(null);

  const basculerAdministrateur = async (parent) => {
    setRoleEnCours(parent.id);

    try {
      await definirAdministrateur(parent.id, !parent.estAdministrateur);

      // On recharge plutôt que de retoucher la ligne à la main : le tableau
      // porte une douzaine de chiffres dérivés, et en corriger un seul ferait
      // diverger l'affichage de la base au premier oubli.
      dispatch(chargerAdmin());
    } catch {
      // Silencieux à dessein : un droit non accordé se voit à la ligne qui n'a
      // pas changé, et l'erreur globale du tableau de bord dit le reste.
    } finally {
      setRoleEnCours(null);
    }
  };

  /**
   * Le rangement du tableau des élèves.
   *
   * ICI ET NON DANS LE STORE : c'est une préférence d'affichage du moment, qui
   * n'a pas à survivre à la visite — les filtres, eux, viennent tout juste
   * d'être remis à plat au départ pour cette raison exacte.
   *
   * Le tri est fait dans le NAVIGATEUR parce que la liste y est déjà entière :
   * la demander au serveur ajouterait un aller-retour pour ranger ce qu'on a
   * déjà sous la main.
   */
  const [triEleves, setTriEleves] = useState({ colonne: 'activite', ascendant: false });

  const elevesRanges = useMemo(
    () => ranger(elevesTableau, triEleves.colonne, triEleves.ascendant),
    [elevesTableau, triEleves],
  );

  const trierEleves = (colonne) => setTriEleves((actuel) => suivant(actuel, colonne));

  const [saisieParents, setSaisieParents] = useSaisieDifferee(
    (terme) => dispatch(rechercher(terme)), 350, recherche,
  );
  const [saisieEleves, setSaisieEleves] = useSaisieDifferee(
    (terme) => dispatch(rechercherEleve(terme)), 350, rechercheEleve,
  );

  useEffect(() => {
    dispatch(chargerAdmin());

    // ON REPART PROPRE À CHAQUE VISITE.
    //
    // Les filtres vivent dans le store et survivaient donc au démontage :
    // quitter l'administration avec « ceo » en recherche, revenir, et un seul
    // parent s'affichait — sans qu'aucun champ ne dise pourquoi.
    //
    // La remise à plat se fait AU DÉPART et non à l'arrivée : au montage, elle
    // relancerait un chargement par-dessus celui de la ligne du dessus.
    return () => { dispatch(reinitialiserFiltres()); };
  }, [dispatch]);

  /**
   * Bascule sur l'onglet élèves, restreint au compte cliqué.
   * La recherche en cours est levée : garder « Emma » en filtre donnerait
   * l'impression que ce parent n'a qu'un seul enfant.
   */
  const voirLesEnfants = (parent) => {
    setSaisieEleves('');
    dispatch(rechercherEleve(''));
    dispatch(
      filtrerParParent({
        id: parent.id,
        libelle: [parent.prenom, parent.nom].filter(Boolean).join(' ') || parent.mail,
      }),
    );
    setOnglet('eleves');
  };

  // `donnee` porte, pour un parent, son adresse : elle sert à effacer aussi son
  // compte de connexion, qui vit dans l'autre base. Le tableau est le seul
  // endroit à la connaître — l'API métier n'expose pas le `sub`.
  const confirmerSuppression = (operation, id, libelle, donnee) => {
    // Une suppression de parent emporte ses enfants et toutes leurs
    // conversations : elle mérite une confirmation explicite.
    if (window.confirm(`Supprimer ${libelle} ? Cette action est irréversible.`)) {
      dispatch(muter(operation, id, donnee));
    }
  };

  const enregistrer = (evenement) => {
    evenement.preventDefault();
    const { operation, id, ...donnees } = edition;
    dispatch(muter(operation, id, donnees));
    setEdition(null);
  };

  if (loading && !resume) return <Loader texte="Chargement du tableau de bord…" />;

  if (error && !resume) {
    return (
      <section className="page">
        <div className="alert">{error}</div>
      </section>
    );
  }

  // Les deux séries d'inscriptions sont fusionnées sur l'axe des périodes :
  // elles partagent la même granularité, donc les mêmes seaux.
  const serieComptes = serieParents.map((p, i) => ({
    periode: p.periode,
    parents: p.valeur,
    eleves: serieEleves[i]?.valeur ?? 0,
  }));

  // DEUX GRAPHIQUES ET NON UN SEUL, PARCE QU'IL Y A DEUX ÉCHELLES.
  //
  // Les abonnements actifs sont un STOCK : quelques dizaines, bientôt quelques
  // centaines. Les demandes d'arrêt et les résiliations sont des FLUX : zéro,
  // un, parfois trois. Sur un axe commun, les flux s'écrasent contre la ligne
  // du zéro et deviennent illisibles — or ce sont eux qu'on surveille.
  //
  // Deux axes sur un même graphique règlerait le problème d'affichage en en
  // créant un pire : deux échelles superposées se lisent comme une seule, et
  // on croit voir des courbes qui se croisent alors qu'elles ne partagent
  // rien. Deux graphiques disent la vérité.
  const serieAbonnesActifs = serieAbonnements.map((p) => ({
    periode: p.periode,
    actifs: p.actifs,
  }));

  const serieSorties = serieAbonnements.map((p) => ({
    periode: p.periode,
    demandes: p.demandes,
    arrets: p.arrets,
  }));

  // L'état à l'instant présent, c'est-à-dire le dernier point de la série.
  const dernierAbonnement = serieAbonnements[serieAbonnements.length - 1];

  // Les flux se lisent sur toute la fenêtre affichée, pas sur la dernière
  // période : « trois arrêts ce mois-ci » n'a de sens qu'additionné.
  const totalDemandes = serieAbonnements.reduce((n, p) => n + p.demandes, 0);
  const totalArrets = serieAbonnements.reduce((n, p) => n + p.arrets, 0);

  return (
    <section className="page page--large">
      <div className="page__entete">
        <div>
          <h1>Administration</h1>
          <p className="page__sous-titre">Comptes, usage et consommation.</p>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {/* HUIT SECTIONS : la rangée ne tient pas sur un téléphone. `Onglets`
          la replie en menu déroulant sous 760 px, en gardant le nom de la
          section courante sur le déclencheur — une barre d'onglets sert
          autant à se situer qu'à naviguer. */}
      <Onglets
        etiquette="Sections"
        actif={onglet}
        onChoisir={setOnglet}
        items={[
          { cle: 'stats', libelle: 'Statistiques' },
          { cle: 'frequentation', libelle: 'Fréquentation' },
          { cle: 'parents', libelle: `Parents (${parents.length})` },
          { cle: 'mails', libelle: 'Mails' },

          // JUSTE APRÈS LES MAILS, parce que c'est de là qu'il vient : ce
          // fut un sous-onglet du courrier, et c'est là que la main va le
          // chercher pendant quelques semaines. Un onglet déplacé à l'autre
          // bout de la barre se perd, même quand la nouvelle place est plus
          // juste.
          { cle: 'promos', libelle: 'Promos' },
          { cle: 'eleves', libelle: `Élèves (${eleves.length})` },
          { cle: 'avis', libelle: 'Avis' },
          ...(estSuperAdmin ? [{ cle: 'modes', libelle: 'Modes' }] : []),
          { cle: 'schemas', libelle: 'Schémas' },
        ]}
      />

      {/* ------------------------------------------------------ statistiques */}
      {onglet === 'stats' && (
        <>
          <div className="stats">
            <Tuile libelle="Comptes parents" valeur={resume?.nombreParents} />
            <Tuile libelle="Profils élèves" valeur={resume?.nombreEleves} />
            <Tuile libelle="Conversations" valeur={resume?.nombreConversations} />
            <Tuile
              libelle="Requêtes au total"
              valeur={resume?.nombreRequetes}
              precision={`${(resume?.requetesAujourdhui ?? 0).toLocaleString('fr-FR')} aujourd'hui`}
            />
            <Tuile
              libelle="Tokens en entrée"
              valeur={resume?.tokensEntree}
              precision={`dont ${(resume?.tokensCacheLecture ?? 0).toLocaleString('fr-FR')} lus en cache`}
            />
            <Tuile libelle="Tokens en sortie" valeur={resume?.tokensSortie} />

            {/* Les trois chiffres d'abonnement, à côté des graphiques qui les
                détaillent. La tuile donne l'état, la courbe donne la tendance —
                et un chiffre seul se lit plus vite qu'un point sur un axe. */}
            <Tuile
              libelle="Abonnements actifs"
              valeur={dernierAbonnement?.actifs}
              precision="à la fin de la période affichée"
            />
            <Tuile
              libelle="Demandes d’arrêt"
              valeur={totalDemandes}
              precision="sur la période affichée"
            />
            <Tuile
              libelle="Abonnements arrêtés"
              valeur={totalArrets}
              precision="sur la période affichée"
            />
          </div>

          {/* Les filtres tiennent sur une seule ligne, au-dessus des graphiques. */}
          <div className="filtres">
            <div className="segmente" role="group" aria-label="Granularité">
              {GRANULARITES.map((g) => (
                <button
                  key={g.cle}
                  type="button"
                  className={granularite === g.cle ? 'actif' : ''}
                  onClick={() => dispatch(changerGranularite(g.cle))}
                >
                  {g.libelle}
                </button>
              ))}
            </div>

            <ChoixEleve
              eleves={eleves}
              valeur={eleveFiltre}
              onChanger={(v) => dispatch(filtrerParEleve(v))}
            />
          </div>

          <Graphique
            titre="Requêtes envoyées au professeur"
            description={
              eleveFiltre
                ? 'Filtré sur un élève.'
                : 'Tous élèves confondus. Une requête = une réponse générée.'
            }
            granularite={granularite}
            series={[{ nom: 'Requêtes', cle: 'valeur' }]}
            donnees={serieRequetes}
            type="barres"
          />

          <Graphique
            titre="Nouveaux comptes par période"
            granularite={granularite}
            series={[
              { nom: 'Parents', cle: 'parents' },
              { nom: 'Élèves', cle: 'eleves' },
            ]}
            donnees={serieComptes}
            type="barres"
          />

          {/* « TOTAL CUMULÉ » A ÉTÉ RETIRÉ.
              Il redisait la même chose que « nouveaux comptes par période » :
              sur un produit où personne ne se désinscrit encore, la courbe
              cumulée est l addition des barres du dessus. Deux graphiques pour
              une seule information, et le second occupait la place sans jamais
              rien apprendre que le premier ne montrait déjà. */}

          <Graphique
            titre="Abonnements actifs"
            description={
              eleveFiltre
                ? "Contrat de la famille de cet élève — un abonnement appartient au parent."
                : "Abonnements en cours à la fin de chaque période. Une ligne, parce que c'est un état qui se suit, pas un volume qui se compare."
            }
            granularite={granularite}
            series={[{ nom: 'Actifs', cle: 'actifs' }]}
            donnees={serieAbonnesActifs}
            type="lignes"
          />

          <Graphique
            titre="Sorties d'abonnement"
            description="Résiliations demandées, et abonnements réellement arrivés à leur terme. L'écart entre les deux, c'est le délai de préavis : une demande de mars se traduit par un arrêt en avril."
            granularite={granularite}
            series={[
              { nom: 'Demandes d’arrêt', cle: 'demandes' },
              { nom: 'Arrêts effectifs', cle: 'arrets' },
            ]}
            donnees={serieSorties}
            type="barres"
          />
        </>
      )}

      {/* ----------------------------------------------------- fréquentation
          UN ONGLET À PART, ET PAS UNE SECTION DE PLUS DANS « STATISTIQUES ».

          Les deux ne se lisent pas de la même façon. L'autre montre une
          fenêtre GLISSANTE dont on ne peut pas sortir — les trente derniers
          jours, les vingt-quatre derniers mois — et répond à « comment ça
          évolue ». Celui-ci montre une période CHOISIE, dans laquelle on se
          déplace, et répond à « qu'est-ce qui s'est passé ce jour-là ». Les
          mêler obligerait à un jeu de filtres qui vaudrait pour l'un et pas
          pour l'autre. */}
      {onglet === 'frequentation' && <Frequentation />}

      {/* ------------------------------------------------------------- avis */}
      {onglet === 'avis' && <RelectureAvis />}

      {/* ------------------------------------------------------------ mails */}
      {onglet === 'mails' && (
        <>
          {/* SOUS-ONGLETS, ET NON DEUX ONGLETS DE PREMIER NIVEAU.
              Lire son courrier et écrire à tout le monde sont deux gestes
              très différents — l'un se fait tous les jours, l'autre trois
              fois par an — mais ils vivent au même endroit dans la tête :
              « mes mails ». Les séparer en haut ferait chercher. */}
          <Onglets
            mini
            etiquette="Courrier"
            actif={sousOnglet}
            onChoisir={setSousOnglet}
            items={[
              { cle: 'messagerie', libelle: 'Messagerie' },
              { cle: 'diffusion', libelle: 'Message de diffusion' },

              // TROISIÈME PARCE QUE C'EST LE PLUS RARE, mais au même
              // endroit que les deux autres : c'est une prise de parole,
              // pas un réglage. On la cherche là où on écrit aux gens.
              { cle: 'information', libelle: 'Message d’information' },

              // LE BANDEAU PROMO EST PARTI D'ICI, et c'était le bon geste.
              // Ces trois-là sont du COURRIER — des mots qu'on adresse à
              // quelqu'un. Une bibliothèque d'affiches de campagne n'en est
              // pas : on l'y rangeait par commodité, parce que les deux
              // servent à communiquer, et cette parenté-là est trop lâche
              // pour ranger quoi que ce soit. Elle a maintenant son onglet.
            ]}
          />

          {sousOnglet === 'messagerie' && <Messagerie />}
          {sousOnglet === 'diffusion' && <Diffusion nombreParents={parents.length} />}
          {sousOnglet === 'information' && <MessageInformation />}
        </>
      )}

      {/* ---------------------------------------------------------- parents */}
      {onglet === 'parents' && (
        <>
          <CoutTotal />

          <FichierClients />

          <Bannis version={versionBannis} />

          <div className="filtres">
            <input
              type="search"
              className="filtres__recherche"
              placeholder="Rechercher par email, nom ou prénom…"
              value={saisieParents}
              onChange={(e) => setSaisieParents(e.target.value)}
            />
          </div>

          <div className="tableau">
            <table>
              <thead>
                <tr>
                  {/* En tête de ligne : c'est la formule qui donne son sens à
                      tout le reste — un pot de 540 minutes et un pot de 1 440
                      ne se lisent pas de la même façon. */}
                  <th scope="col">Forfait</th>
                  <th scope="col">Email</th>
                  <th scope="col">Nom</th>
                  <th scope="col">Élèves</th>
                  {/* Entre les élèves et les requêtes : c'est le chiffre qui
                      dit si une formule gagne ou perd de l'argent, il mérite
                      d'être lu avant le volume brut de messages. */}
                  <th scope="col">Forfait consommé</th>
                  {/* Juste après la consommation : les deux se lisent
                      ensemble, et l'un est le complément de l'autre. */}
                  <th scope="col">Restantes</th>
                  <th scope="col">Ce qu'il a coûté</th>
                  <th scope="col">Requêtes</th>
                  <th scope="col">Inscrit le</th>
                  {/* DEUX COLONNES VOISINES QUI NE DISENT PAS LA MÊME CHOSE.
                      « Dernière connexion » est celle du PARENT ; « dernière
                      activité » celle de ses ENFANTS. Un enfant qui travaille
                      tous les jours pendant que son parent n a rien ouvert
                      depuis deux mois est un désabonnement qui se prépare, et
                      rien ne le montrait tant qu on ne lisait qu une colonne. */}
                  <th scope="col">Dernière connexion</th>
                  <th scope="col">Dernière activité</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {parents.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.formule
                        ? <span className="forfait">{p.formule}</span>
                        : <span className="conso__vide">—</span>}
                    </td>
                    <td>{p.mail}</td>
                    <td>{[p.prenom, p.nom].filter(Boolean).join(' ') || '—'}</td>
                    <td className="num">{p.nombreEleves}</td>
                    <td><Consommation parent={p} /></td>
                    <td className="num"><Restant parent={p} /></td>
                    <td><Cout parent={p} /></td>
                    <td className="num">{p.nombreRequetes.toLocaleString('fr-FR')}</td>
                    <td>{new Date(p.dateCreation).toLocaleDateString('fr-FR')}</td>
                    <td>
                      {/* Le tiret est la bonne réponse pour un parent qui n est
                          pas revenu depuis l ajout de la colonne : on n invente
                          pas un passé qu on n a pas mesuré. */}
                      {p.derniereConnexion
                        ? new Date(p.derniereConnexion).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td>
                      {p.derniereActivite
                        ? new Date(p.derniereActivite).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="actions">
                      {/* LE DROIT D'ADMINISTRER, ET SEUL LE SUPER-ADMINISTRATEUR
                          LE VOIT. Un administrateur qui pourrait promouvoir se
                          donnerait un successeur, puis pourrait être retiré sans
                          perdre la main. L'API refuse cette route de son côté :
                          l'absence du bouton n'est pas la protection.

                          Le changement ne prend effet qu'à la PROCHAINE
                          CONNEXION du parent — son rôle voyage dans un jeton
                          signé, qu'on ne réécrit pas à distance. */}
                      {/* LE COMPTE SUPER-ADMINISTRATEUR NE SE TOUCHE PAS.
                          Son rôle vient de la configuration du serveur, pas
                          de la base : il n'y a rien à basculer ici, et une
                          étiquette le dit mieux qu’un bouton grisé. */}
                      {estSuperAdmin && p.estSuperAdministrateur && (
                        <span className="badge badge--discret" title="Rôle défini dans la configuration du serveur.">
                          Super-admin
                        </span>
                      )}
                      {estSuperAdmin && !p.estSuperAdministrateur && (
                        <button
                          type="button"
                          className={`btn-ghost btn-ghost--mini ${
                            p.estAdministrateur ? 'btn-ghost--accent' : ''
                          }`}
                          disabled={roleEnCours === p.id}
                          onClick={() => basculerAdministrateur(p)}
                          title={
                            p.estAdministrateur
                              ? "Retirer l'accès à l'administration"
                              : "Donner l'accès à l'administration"
                          }
                        >
                          {roleEnCours === p.id
                            ? '…'
                            : p.estAdministrateur
                              ? 'Administrateur'
                              : 'Utilisateur'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini"
                        disabled={p.nombreEleves === 0}
                        onClick={() => voirLesEnfants(p)}
                      >
                        {p.nombreEleves === 0
                          ? 'Aucun enfant'
                          : `Voir ${p.nombreEleves === 1 ? "l'enfant" : 'les enfants'}`}
                      </button>
                      {/* Placé avant « Modifier » : c'est le geste le plus
                          fréquent des trois — dédommager, corriger, solder un
                          remboursement partiel. */}
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini"
                        disabled={!p.formule}
                        title={p.formule ? undefined : 'Ce compte n’a aucun forfait en cours.'}
                        onClick={() =>
                          setEdition({
                            operation: 'ajusterHeures',
                            id: p.id,
                            mail: p.mail,
                            minutes: 60,
                            motif: '',
                            prevenir: true,
                          })
                        }
                      >
                        Heures
                      </button>
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini"
                        disabled={p.estSuperAdministrateur}
                        title={
                          p.estSuperAdministrateur
                            ? "Le compte super-administrateur ne peut pas être modifié : son adresse porte le rôle."
                            : undefined
                        }
                        onClick={() =>
                          setEdition({
                            operation: 'modifierParent',
                            id: p.id,
                            prenom: p.prenom ?? '',
                            nom: p.nom ?? '',
                            mail: p.mail ?? '',
                          })
                        }
                      >
                        Modifier
                      </button>
                      {/* PAS DE BOUTON GRISÉ POUR LE SUPER-ADMINISTRATEUR : il
                          n'y a rien à lui expliquer, ce compte ne se supprime
                          jamais. Un bouton désactivé se lit comme une
                          permission manquante — donc comme quelque chose qu'on
                          pourrait obtenir — là où c'est une règle définitive.

                          L'API refuse cette route de son côté ; l'absence du
                          bouton ne fait que ne pas montrer une porte murée. */}
                      {/* BANNIR N’EST PAS SUPPRIMER, et les deux boutons se
                          suivent pour qu’on choisisse en connaissance de
                          cause. Bannir ferme la porte et se lève ;
                          supprimer efface et ne se reprend pas. */}
                      {!p.estSuperAdministrateur && (
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini"
                        disabled={muting}
                        onClick={() => setABannir({ id: p.id, mail: p.mail, motif: '' })}
                      >
                        Bannir
                      </button>
                      )}
                      {!p.estSuperAdministrateur && (
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini btn-ghost--danger"
                        disabled={muting}
                        onClick={() =>
                          confirmerSuppression(
                            'supprimerParent',
                            p.id,
                            `le compte ${p.mail} et ses ${p.nombreEleves} profil(s)${
                              p.formule
                                ? `, en résiliant son abonnement ${p.formule} chez Stripe`
                                : ''
                            }`,
                            p.mail,
                          )
                        }
                      >
                        Supprimer
                      </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {parents.length === 0 && <div className="vide">Aucun compte.</div>}
          </div>
        </>
      )}

      {/* ----------------------------------------------------------- élèves */}
      {onglet === 'eleves' && (
        <>
          <div className="filtres">
            <input
              type="search"
              className="filtres__recherche"
              placeholder="Rechercher par prénom, nom, âge, classe ou compte parent…"
              value={saisieEleves}
              onChange={(e) => setSaisieEleves(e.target.value)}
            />

            {/* Le filtre parent vient d'un clic dans l'autre onglet : sans
                rappel visible, on croirait la liste des élèves incomplète. */}
            {parentFiltre && (
              <button
                type="button"
                className="puce-filtre"
                onClick={() => dispatch(filtrerParParent(null))}
                title="Retirer le filtre"
              >
                Enfants de {parentFiltre.libelle}
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          <div className="tableau">
          <table>
            <thead>
              <tr>
                <th scope="col">Prénom</th>
                <th scope="col">Nom</th>
                <ColonneTriable libelle="Classe" colonne="classe" tri={triEleves} onTrier={trierEleves} />
                <ColonneTriable libelle="Âge" colonne="age" tri={triEleves} onTrier={trierEleves} aDroite />
                <ColonneTriable libelle="Fille / Garçon" colonne="sexe" tri={triEleves} onTrier={trierEleves} />
                <th scope="col">Compte parent</th>
                <ColonneTriable libelle="Requêtes" colonne="requetes" tri={triEleves} onTrier={trierEleves} aDroite />
                <ColonneTriable libelle="Dernière activité" colonne="activite" tri={triEleves} onTrier={trierEleves} />
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {elevesRanges.map((e) => (
                <tr key={e.id}>
                  <td>{e.prenom}</td>
                  <td>{e.nom || '—'}</td>
                  <td>{e.niveauLibelle}</td>
                  <td className="num">{e.age}</td>
                  <td>{SEXES[e.sexe] ?? SEXES[0]}</td>
                  <td>{e.parentMail}</td>
                  <td className="num">{e.nombreRequetes.toLocaleString('fr-FR')}</td>
                  <td>
                    {e.derniereActivite
                      ? new Date(e.derniereActivite).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini btn-ghost--accent"
                      onClick={() => dispatch(ouvrirFiche(e.id))}
                    >
                      Fiche
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini"
                      onClick={() =>
                        setEdition({
                          operation: 'modifierEleve',
                          id: e.id,
                          prenom: e.prenom ?? '',
                          nom: e.nom ?? '',
                          age: e.age,
                          sexe: e.sexe ?? 0,
                        })
                      }
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini btn-ghost--danger"
                      disabled={muting}
                      onClick={() =>
                        confirmerSuppression('supprimerEleve', e.id, `le profil de ${e.prenom}`)
                      }
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {elevesTableau.length === 0 && (
            <div className="vide">
              {rechercheEleve
                ? `Aucun profil ne correspond à « ${rechercheEleve} ».`
                : parentFiltre
                  ? `Ce compte n'a aucun profil enfant.`
                  : 'Aucun profil élève.'}
            </div>
          )}
          </div>
        </>
      )}

      {/* --------------------------------------------------------- édition */}
      {/* ------------------------------------------------------ fiche élève */}
      {(fiche || ficheLoading || ficheError) && (
        <FicheEleve
          fiche={fiche}
          chargement={ficheLoading}
          erreur={ficheError}
          onFermer={() => dispatch(fermerFiche())}
          avecApercuBilan
          chargerEvaluations={getHistoriqueEvaluations}
          chargerRapports={getHistoriqueRapports}
          chargerRapport={getRapportEleve}
          chargerCopie={getCopieEleve}
        />
      )}

      {/* UNE MODALE À PART, ET NON UN CAS DE PLUS DANS CELLE D’ÉDITION.
          Cette dernière est déjà une chaîne de ternaires sur trois
          opérations ; y greffer une quatrième branche aurait rendu les
          quatre illisibles pour économiser un composant. */}
      {aBannir && (
        <div className="modale" role="dialog" aria-modal="true">
          <form
            className="modale__boite"
            onSubmit={async (e) => {
              e.preventDefault();

              setErreurBannissement(null);

              try {
                await bannirParent(aBannir.id, aBannir.motif);
                setABannir(null);
                setVersionBannis((v) => v + 1);
              } catch (err) {
                // LA MODALE RESTE OUVERTE. La refermer sur un échec ferait
                // disparaître le motif qu’on vient de taper, et laisserait
                // croire que le bannissement est passé.
                setErreurBannissement(
                  err?.response?.data?.message
                  ?? "Le bannissement n’a pas pu être enregistré.",
                );
              }
            }}
          >
            <h2>Bannir {aBannir.mail}</h2>

            <div className="modale__corps">
              {erreurBannissement && (
                <div className="alert">{erreurBannissement}</div>
              )}

              <p className="modale__note">
                Son compte <strong>n’est pas supprimé</strong> : il reste en
                l’état, avec ses élèves et son abonnement. Mais il ne pourra
                plus se connecter, ni recréer de compte avec cette adresse
                s’il la supprime.
              </p>

              <p className="modale__note">
                Le bannissement se lève à tout moment depuis la liste des
                adresses bannies, en haut de cet onglet.
              </p>

              <div className="champ">
                <label htmlFor="bannir-motif">Motif</label>
                <input
                  id="bannir-motif"
                  maxLength={300}
                  value={aBannir.motif}
                  onChange={(e) => setABannir({ ...aBannir, motif: e.target.value })}
                  placeholder="Impayés répétés, comportement abusif…"
                />
                <span className="champ__aide">
                  Facultatif. C’est lui qui rendra la décision révisable dans
                  six mois, quand le compte aura disparu et qu’il ne restera
                  que l’adresse.
                </span>
              </div>
            </div>

            <div className="modale__actions">
              <button type="submit" className="btn btn--compact btn--danger">
                Bannir cette adresse
              </button>

              <button
                type="button"
                className="btn btn--compact btn--fantome"
                onClick={() => { setABannir(null); setErreurBannissement(null); }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {edition && (
        <div className="modale" role="dialog" aria-modal="true">
          <form className="modale__boite" onSubmit={enregistrer}>
            <h2>
              {edition.operation === 'ajusterHeures'
                ? 'Ajuster les heures'
                : edition.operation === 'modifierParent'
                  ? 'Modifier le compte'
                  : 'Modifier le profil'}
            </h2>

            {/* TROIS PARTIES : titre figé, corps qui défile, boutons figés.
                Une barre collante dans un conteneur qui défile laisse toujours
                du contenu affleurer dans le rembourrage sous elle — on voyait
                la bulle passer derrière les boutons. Ici le corps est le seul
                à défiler, et rien ne peut passer sous quoi que ce soit. */}
            <div className="modale__corps">

            {edition.operation === 'ajusterHeures' && (
              <>
                <HistoriqueHeures parentId={edition.id} />

                <p className="modale__note">
                  Compte <strong>{edition.mail}</strong>. Ces minutes s’ajoutent
                  au pot d’heures SUPPLÉMENTAIRES de la période en cours — le
                  forfait de la formule n’est jamais entamé, il est facturé.
                </p>

                <div className="champ">
                  <label htmlFor="ed-minutes">Minutes</label>
                  <input
                    id="ed-minutes"
                    type="number"
                    step={30}
                    value={edition.minutes}
                    onChange={(e) => setEdition({ ...edition, minutes: Number(e.target.value) })}
                  />
                  <span className="champ__aide">
                    Positif pour ajouter, négatif pour retirer. 60 = une heure.
                  </span>
                </div>

                <div className="champ">
                  <label htmlFor="ed-motif">Motif</label>
                  <input
                    id="ed-motif"
                    maxLength={200}
                    value={edition.motif}
                    onChange={(e) => setEdition({ ...edition, motif: e.target.value })}
                    placeholder="Remboursement partiel du 19/08, incident du 12/08…"
                  />
                  <span className="champ__aide">
                    {edition.prevenir
                      ? 'Obligatoire, et LU PAR LE PARENT : il devient le texte du courriel. Écrivez-le pour lui.'
                      : 'Obligatoire. Sans lui, cette ligne sera dans six mois un cadeau que personne ne s’explique.'}
                  </span>
                </div>

                {/* COCHÉE PAR DÉFAUT, ET C'EST LE SENS QUI COMPTE. Un solde qui
                    bouge sans explication ne se lit pas comme une
                    régularisation mais comme une panne — ou comme un
                    prélèvement qu'on n'a pas demandé. On la décoche pour les
                    corrections internes, pas l'inverse. */}
                {/* HORS DE LA CLASSE `champ`, ET C'EST NÉCESSAIRE. Elle impose
                    `width: 100%` et un padding de douze pixels à tout `input`
                    qu'elle contient : la case devenait un bloc pleine largeur
                    et chassait son propre libellé hors de la boîte. */}
                <label className={`case-bulle ${edition.prevenir ? 'est-active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={edition.prevenir}
                    onChange={(e) => setEdition({ ...edition, prevenir: e.target.checked })}
                  />

                  <span className="case-bulle__texte">
                    <strong>Prévenir le parent par courriel</strong>
                    <span className="case-bulle__aide">
                      {edition.prevenir
                        ? 'Le motif ci-dessus lui sera envoyé, avec son nouveau solde.'
                        : 'Aucun message ne partira. À réserver aux corrections internes — une erreur reprise dans la minute, que le parent n’a jamais vue.'}
                    </span>
                  </span>
                </label>
              </>
            )}

            {edition.operation !== 'ajusterHeures' && (
              <div className="champ">
                <label htmlFor="ed-prenom">Prénom</label>
                <input
                  id="ed-prenom"
                  value={edition.prenom}
                  onChange={(e) => setEdition({ ...edition, prenom: e.target.value })}
                />
              </div>
            )}

            {edition.operation === 'ajusterHeures' ? null : edition.operation === 'modifierParent' ? (
              <>
                <div className="champ">
                  <label htmlFor="ed-nom">Nom</label>
                  <input
                    id="ed-nom"
                    value={edition.nom}
                    onChange={(e) => setEdition({ ...edition, nom: e.target.value })}
                  />
                </div>
                <div className="champ">
                  <label htmlFor="ed-mail">Email</label>
                  <input
                    id="ed-mail"
                    type="email"
                    value={edition.mail}
                    onChange={(e) => setEdition({ ...edition, mail: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="champ">
                  <label htmlFor="ed-nom-eleve">Nom de famille</label>
                  <input
                    id="ed-nom-eleve"
                    value={edition.nom}
                    onChange={(e) => setEdition({ ...edition, nom: e.target.value })}
                  />
                </div>

                <div className="champ">
                  <label htmlFor="ed-age">Âge</label>
                  <input
                    id="ed-age"
                    type="number"
                    min={5}
                    max={25}
                    value={edition.age}
                    onChange={(e) => setEdition({ ...edition, age: Number(e.target.value) })}
                  />
                </div>

                <div className="champ">
                  <label htmlFor="ed-sexe">Fille ou garçon</label>
                  <select
                    id="ed-sexe"
                    value={edition.sexe ?? 0}
                    onChange={(e) => setEdition({ ...edition, sexe: Number(e.target.value) })}
                  >
                    <option value={0}>Non précisé</option>
                    <option value={1}>Fille</option>
                    <option value={2}>Garçon</option>
                  </select>
                  <span className="champ__aide">
                    Détermine les accords du professeur quand il lui parle.
                  </span>
                </div>
              </>
            )}

            </div>

            <div className="modale__actions">
              <button type="button" className="btn-ghost" onClick={() => setEdition(null)}>
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn--compact"
                disabled={
                  muting
                  || (edition.operation === 'ajusterHeures'
                      && (!edition.motif.trim() || !edition.minutes))
                }
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------------- promos */}
      {onglet === 'promos' && <PromosAdmin />}

      {onglet === 'modes' && <Modes />}

      {/* Les schémas : quelles figures sont importées, lesquelles restent au
          crayon du professeur. */}
      {onglet === 'schemas' && <Planches />}
    </section>
  );
}
