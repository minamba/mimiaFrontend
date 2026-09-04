import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSerieVisites, getAbonnementsFenetre, getTunnel } from '../lib/api/adminApi';
import Graphique from './Graphique';

/**
 * La fréquentation du site, période par période.
 *
 * CE QUE CET ONGLET APPORTE ET QUE « STATISTIQUES » N'A PAS
 * --------------------------------------------------------
 * L'autre onglet montre une fenêtre GLISSANTE — les trente derniers jours, les
 * vingt-quatre derniers mois — et on ne peut pas en sortir. Celui-ci montre
 * une période CHOISIE, et on se déplace de l'une à l'autre. Ce ne sont pas les
 * mêmes questions : « comment ça évolue » d'un côté, « qu'est-ce qui s'est
 * passé ce jour-là » de l'autre.
 *
 * L'ÉCHELLE CHOISIT AUSSI LE DÉCOUPAGE, et c'est ce qui rend la navigation
 * lisible. Un jour se lit en heures, un mois en jours, une année en mois —
 * sinon « le mois d'août » tiendrait en un seul point, ce qui n'apprend rien.
 */

/**
 * Les quatre échelles, et pour chacune : le découpage interne demandé au
 * serveur, et comment on calcule la fenêtre pour un décalage donné.
 *
 * `decalage` vaut 0 pour la période en cours, -1 pour la précédente.
 */
const ECHELLES = {
  jour: {
    libelle: 'Jour',
    granularite: 'heure',
    fenetre: (d) => {
      const debut = new Date();
      debut.setHours(0, 0, 0, 0);
      debut.setDate(debut.getDate() + d);
      const fin = new Date(debut);
      fin.setDate(fin.getDate() + 1);
      return [debut, fin];
    },
    nommer: (debut) =>
      debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },

  semaine: {
    libelle: 'Semaine',
    granularite: 'jour',
    fenetre: (d) => {
      const debut = new Date();
      debut.setHours(0, 0, 0, 0);
      // Lundi : la semaine scolaire commence là, et `getDay` compte le
      // dimanche comme zéro. Le même calcul que côté serveur.
      debut.setDate(debut.getDate() - ((debut.getDay() + 6) % 7) + 7 * d);
      const fin = new Date(debut);
      fin.setDate(fin.getDate() + 7);
      return [debut, fin];
    },
    nommer: (debut) =>
      `Semaine du ${debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  },

  mois: {
    libelle: 'Mois',
    granularite: 'jour',
    fenetre: (d) => {
      const maintenant = new Date();
      const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() + d, 1);
      const fin = new Date(maintenant.getFullYear(), maintenant.getMonth() + d + 1, 1);
      return [debut, fin];
    },
    nommer: (debut) => {
      const nom = debut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      return nom.charAt(0).toUpperCase() + nom.slice(1);
    },
  },

  annee: {
    libelle: 'Année',
    granularite: 'mois',
    fenetre: (d) => {
      const an = new Date().getFullYear() + d;
      return [new Date(an, 0, 1), new Date(an + 1, 0, 1)];
    },
    nommer: (debut) => String(debut.getFullYear()),
  },
};

/**
 * La date telle que le serveur l'attend : un instant de calendrier, sans
 * fuseau.
 *
 * `toISOString()` convertirait en UTC et décalerait la fenêtre de deux heures
 * en été — le « 31 août » d'un parent parisien commencerait le 30 à 22 h. Tout
 * le tableau de bord raisonne en dates de calendrier ; celle-ci fait pareil.
 */
function pourLeServeur(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T00:00:00`;
}

/**
 * Une étape du tunnel, et ce qu'il en reste par rapport à la précédente.
 *
 * LE POURCENTAGE EST CELUI DU PASSAGE, pas celui du total. « 12 % » entre les
 * visiteurs et les essais dit combien de visiteurs ont essayé — pas combien de
 * visiteurs ont fini par payer. Rapporter tout au premier chiffre écraserait
 * la seconde marche sous la première, et c'est justement celle qu'on regarde
 * quand la première va bien.
 */
function Etape({ valeur, libelle, precedent }) {
  const taux = precedent > 0 ? Math.round((valeur / precedent) * 100) : null;

  return (
    <>
      {precedent !== undefined && (
        <div className="tunnel__passage">
          <span className="tunnel__taux">{taux === null ? '—' : `${taux} %`}</span>
          <span className="tunnel__fleche" aria-hidden="true">→</span>
        </div>
      )}

      <div className="tunnel__etape">
        <strong>{(valeur ?? 0).toLocaleString('fr-FR')}</strong>
        <span>{libelle}</span>
      </div>
    </>
  );
}

/** Un chiffre de tête, avec sa légende. */
function Chiffre({ valeur, libelle, ton }) {
  return (
    <div className={`frequentation__chiffre frequentation__chiffre--${ton}`}>
      <strong>{(valeur ?? 0).toLocaleString('fr-FR')}</strong>
      <span>{libelle}</span>
    </div>
  );
}

export default function Frequentation() {
  const [echelle, setEchelle] = useState('jour');
  const [decalage, setDecalage] = useState(0);

  const [tunnel, setTunnel] = useState(null);
  const [visites, setVisites] = useState([]);
  const [visiteurs, setVisiteurs] = useState(0);
  const [abonnements, setAbonnements] = useState([]);

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const reglage = ECHELLES[echelle];
  const [debut, fin] = useMemo(() => reglage.fenetre(decalage), [reglage, decalage]);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      // LES DEUX APPELS PARTENT ENSEMBLE, sur la MÊME fenêtre. Les enchaîner
      // doublerait l'attente, et les laisser dériver ferait afficher des
      // visites d'août à côté d'abonnements de septembre.
      const [v, a, t] = await Promise.all([
        getSerieVisites(reglage.granularite, pourLeServeur(debut), pourLeServeur(fin)),
        getAbonnementsFenetre(reglage.granularite, pourLeServeur(debut), pourLeServeur(fin)),
        getTunnel(reglage.granularite, pourLeServeur(debut), pourLeServeur(fin)),
      ]);

      setVisites(v.data?.points ?? []);
      setVisiteurs(v.data?.visiteurs ?? 0);
      setAbonnements(a.data ?? []);
      setTunnel(t.data ?? null);
    } catch {
      setErreur("La fréquentation n'a pas pu être chargée.");
    } finally {
      setChargement(false);
    }
  }, [reglage, debut, fin]);

  useEffect(() => { charger(); }, [charger]);

  const totaux = useMemo(() => ({
    essais: abonnements.reduce((t, p) => t + (p.essais ?? 0), 0),
    nouveaux: abonnements.reduce((t, p) => t + (p.nouveaux ?? 0), 0),
    demandes: abonnements.reduce((t, p) => t + (p.demandes ?? 0), 0),
    arrets: abonnements.reduce((t, p) => t + (p.arrets ?? 0), 0),
  }), [abonnements]);

  return (
    <div className="frequentation">
      <div className="frequentation__barre">
        <div className="segmente" role="group" aria-label="Échelle">
          {Object.entries(ECHELLES).map(([cle, e]) => (
            <button
              key={cle}
              type="button"
              className={echelle === cle ? 'actif' : ''}
              onClick={() => {
                // ON REVIENT À AUJOURD'HUI EN CHANGEANT D'ÉCHELLE. « Trois
                // périodes en arrière » ne veut pas dire la même chose en
                // jours qu'en années : garder le décalage enverrait l'admin en
                // 2023 pour avoir cliqué sur « Année ».
                setEchelle(cle);
                setDecalage(0);
              }}
            >
              {e.libelle}
            </button>
          ))}
        </div>

        <div className="frequentation__navigation">
          <button
            type="button"
            className="btn btn--fantome btn--compact"
            onClick={() => setDecalage((d) => d - 1)}
            aria-label="Période précédente"
          >
            ‹
          </button>

          <span className="frequentation__periode">{reglage.nommer(debut)}</span>

          {/* On ne va pas dans l'avenir : il n'y a rien à y voir, et une
              fenêtre future rendrait une série vide qu'on prendrait pour une
              panne. */}
          <button
            type="button"
            className="btn btn--fantome btn--compact"
            onClick={() => setDecalage((d) => Math.min(0, d + 1))}
            disabled={decalage >= 0}
            aria-label="Période suivante"
          >
            ›
          </button>

          <button
            type="button"
            className="btn btn--compact"
            onClick={() => setDecalage(0)}
            disabled={decalage === 0}
          >
            Aujourd’hui
          </button>
        </div>
      </div>

      {erreur && <div className="alert">{erreur}</div>}

      <h2 className="frequentation__titre">Tunnel de conversion</h2>

      <div className="tunnel">
        <Etape valeur={tunnel?.visiteurs} libelle="visiteurs" />
        <Etape valeur={tunnel?.essais} libelle="essais gratuits" precedent={tunnel?.visiteurs ?? 0} />
        <Etape valeur={tunnel?.convertis} libelle="ont pris une offre" precedent={tunnel?.essais ?? 0} />
      </div>

      <p className="frequentation__note">
        Les visiteurs et les essais sont datés dans la période. La conversion,
        elle, est comptée quand qu’elle arrive&nbsp;: un essai lancé cette
        semaine peut se transformer en abonnement le mois prochain, et ce
        chiffre montera encore. Une période récente est donc toujours
        sous-évaluée — c’est la nature d’un tunnel, pas une erreur de mesure.
      </p>

      <h2 className="frequentation__titre">Visiteurs</h2>

      <Chiffre valeur={visiteurs} libelle="visiteurs uniques sur la période" ton="visite" />

      <Graphique
        titre="Visiteurs du site"
        description={
          chargement
            ? 'Chargement…'
            : "Personnes distinctes venues sur la page d'accueil. Le total au-dessus n'est pas la somme des barres : quelqu'un venu deux jours compte une fois sur la semaine et deux fois dans le détail."
        }
        granularite={reglage.granularite}
        series={[{ nom: 'Visiteurs', cle: 'valeur' }]}
        donnees={visites}
        type="lignes"
        agregat="aucun"
      />

      <h2 className="frequentation__titre">Essais gratuits</h2>

      <Chiffre valeur={totaux.essais} libelle="essais lancés sur la période" ton="essai" />

      <Graphique
        titre="Essais gratuits lancés"
        description="Quand les essais démarrent. La même période et le même découpage que les autres graphiques — le bandeau du haut les commande tous."
        granularite={reglage.granularite}
        series={[{ nom: 'Essais', cle: 'essais' }]}
        donnees={abonnements}
        type="barres"
      />

      <h2 className="frequentation__titre">Abonnements / résiliations</h2>

      <div className="frequentation__chiffres">
        <Chiffre valeur={totaux.nouveaux} libelle="abonnements payants" ton="entree" />
        <Chiffre valeur={totaux.demandes} libelle="demandes de résiliation" ton="alerte" />
        <Chiffre valeur={totaux.arrets} libelle="résiliations effectives" ton="sortie" />
      </div>

      <Graphique
        titre="Entrées et sorties"
        description="Une demande de résiliation et l'arrêt qui en découle ne tombent pas dans la même période : l'écart entre les deux courbes, c'est le préavis."
        granularite={reglage.granularite}
        series={[
          { nom: 'Abonnements payants', cle: 'nouveaux' },
          { nom: 'Demandes de résiliation', cle: 'demandes' },
          { nom: 'Résiliations effectives', cle: 'arrets' },
        ]}
        donnees={abonnements}
        type="barres"
      />
    </div>
  );
}
