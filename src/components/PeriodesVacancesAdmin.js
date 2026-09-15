import { useEffect, useState } from 'react';
import {
  getPeriodesVacances,
  creerPeriodeVacances,
  modifierPeriodeVacances,
  supprimerPeriodeVacances,
} from '../lib/api/adminApi';

/**
 * LES PÉRIODES DE VACANCES SCOLAIRES, PAR ZONE.
 *
 * UN FILET, PAS LA SOURCE PRINCIPALE.
 * ------------------------------------
 * `CalendrierScolaireSyncWorker` resynchronise ces dates chaque jour depuis
 * le calendrier officiel du ministère — cet écran n'existe pas pour
 * remplacer ce travail, mais pour le corriger : la source officielle
 * elle-même contient parfois une coquille (relevé sur la Guadeloupe, Noël
 * 2026-2027 : une fin de vacances datée d'avant leur début), et un
 * administrateur doit pouvoir la réparer sans attendre que le ministère la
 * corrige de son côté.
 *
 * CE QUI SUIT : une correction faite ici tient jusqu'à la PROCHAINE
 * synchronisation, qui la réécrira si la source ne porte toujours pas la
 * bonne valeur — le worker ne sait pas qu'une ligne a été touchée à la main.
 * L'écran le dit, pour qu'on ne cherche pas pourquoi une correction « a
 * disparu » le lendemain.
 */

const ZONES = [
  { code: 'A', libelle: 'Zone A' },
  { code: 'B', libelle: 'Zone B' },
  { code: 'C', libelle: 'Zone C' },
  { code: 'CORSE', libelle: 'Corse' },
  { code: 'GUADELOUPE', libelle: 'Guadeloupe' },
  { code: 'GUYANE', libelle: 'Guyane' },
  { code: 'MARTINIQUE', libelle: 'Martinique' },
  { code: 'MAYOTTE', libelle: 'Mayotte' },
  { code: 'REUNION', libelle: 'La Réunion' },
];

const libelleZone = (code) => ZONES.find((z) => z.code === code)?.libelle ?? code;

/** ISO complet → « AAAA-MM-JJ », ce qu'attend un <input type="date">. */
const dateSaisie = (iso) => (iso ? iso.slice(0, 10) : '');

const dateLisible = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');

/** Le même formulaire pour créer et pour modifier — mêmes champs, mêmes règles. */
function Formulaire({ periode, onEnregistre, onAnnule }) {
  const edition = Boolean(periode);

  const [zone, setZone] = useState(periode?.zone ?? 'A');
  const [anneeScolaire, setAnneeScolaire] = useState(periode?.anneeScolaire ?? '');
  const [libelle, setLibelle] = useState(periode?.libelle ?? '');
  const [dateDebut, setDateDebut] = useState(dateSaisie(periode?.dateDebut));
  const [dateFin, setDateFin] = useState(dateSaisie(periode?.dateFin));
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    setEnvoi(true);
    setErreur(null);

    const donnees = {
      zone,
      anneeScolaire: anneeScolaire.trim(),
      libelle: libelle.trim(),
      dateDebut,
      dateFin,
    };

    try {
      if (edition) await modifierPeriodeVacances(periode.id, donnees);
      else await creerPeriodeVacances(donnees);
      onEnregistre();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "La période n'a pas pu être enregistrée.");
      setEnvoi(false);
    }
  };

  return (
    <form className="periodes-vacances__formulaire" onSubmit={soumettre}>
      <h3>{edition ? 'Modifier la période' : 'Ajouter une période'}</h3>

      {erreur && <div className="alert">{erreur}</div>}

      <div className="champ">
        <label htmlFor="pv-zone">Zone</label>
        <select id="pv-zone" value={zone} onChange={(e) => setZone(e.target.value)}>
          {ZONES.map((z) => (
            <option key={z.code} value={z.code}>{z.libelle}</option>
          ))}
        </select>
      </div>

      <div className="duo">
        <div className="champ">
          <label htmlFor="pv-annee">Année scolaire</label>
          <input
            id="pv-annee"
            value={anneeScolaire}
            onChange={(e) => setAnneeScolaire(e.target.value)}
            placeholder="2026-2027"
            required
          />
        </div>

        <div className="champ">
          <label htmlFor="pv-libelle">Libellé</label>
          <input
            id="pv-libelle"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            placeholder="Vacances de Noël"
            required
          />
        </div>
      </div>

      <div className="duo">
        <div className="champ">
          <label htmlFor="pv-debut">Début</label>
          <input
            id="pv-debut"
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>

        <div className="champ">
          <label htmlFor="pv-fin">Fin</label>
          <input
            id="pv-fin"
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="modale__actions">
        <button type="button" className="btn-ghost" onClick={onAnnule}>
          Annuler
        </button>
        <button type="submit" className="btn btn--compact" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

export default function PeriodesVacancesAdmin() {
  const [periodes, setPeriodes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // `null` = pas de formulaire ; `'nouveau'` = création ; un objet = édition.
  const [formulaire, setFormulaire] = useState(null);

  const [occupe, setOccupe] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);
  const [filtreZone, setFiltreZone] = useState('');

  const charger = () => {
    setChargement(true);

    return getPeriodesVacances()
      .then(({ data }) => setPeriodes(Array.isArray(data) ? data : []))
      .catch(() => setErreur("Les périodes n'ont pas pu être chargées."))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const supprimer = async (periode) => {
    setOccupe(periode.id);

    try {
      await supprimerPeriodeVacances(periode.id);
      setASupprimer(null);
      await charger();
    } catch {
      setErreur("La période n'a pas pu être supprimée.");
    } finally {
      setOccupe(null);
    }
  };

  if (chargement && periodes.length === 0) return <p className="etat-vide">Chargement…</p>;

  if (formulaire) {
    return (
      <Formulaire
        periode={formulaire === 'nouveau' ? null : formulaire}
        onAnnule={() => setFormulaire(null)}
        onEnregistre={() => { setFormulaire(null); charger(); }}
      />
    );
  }

  const affichees = filtreZone ? periodes.filter((p) => p.zone === filtreZone) : periodes;

  return (
    <div className="periodes-vacances">
      {erreur && <div className="alert">{erreur}</div>}

      <p className="periodes-vacances__note">
        Resynchronisées automatiquement chaque jour depuis le calendrier
        officiel du ministère. Une correction faite ici tient jusqu'à la
        prochaine synchronisation, qui la réécrira si la source ne porte
        toujours pas la bonne valeur.
      </p>

      <div className="filtres">
        <select value={filtreZone} onChange={(e) => setFiltreZone(e.target.value)}>
          <option value="">Toutes les zones</option>
          {ZONES.map((z) => (
            <option key={z.code} value={z.code}>{z.libelle}</option>
          ))}
        </select>

        <button type="button" className="btn btn--compact" onClick={() => setFormulaire('nouveau')}>
          Ajouter une période
        </button>
      </div>

      {affichees.length === 0 ? (
        <p className="etat-vide">Aucune période enregistrée.</p>
      ) : (
        <div className="tableau">
          <table>
            <thead>
              <tr>
                <th scope="col">Zone</th>
                <th scope="col">Année scolaire</th>
                <th scope="col">Période</th>
                <th scope="col">Début</th>
                <th scope="col">Fin</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {affichees.map((p) => (
                <tr key={p.id}>
                  <td>{libelleZone(p.zone)}</td>
                  <td>{p.anneeScolaire}</td>
                  <td>{p.libelle}</td>
                  <td>{dateLisible(p.dateDebut)}</td>
                  <td>{dateLisible(p.dateFin)}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn-ghost btn-ghost--mini"
                      onClick={() => setFormulaire(p)}
                    >
                      Modifier
                    </button>

                    {aSupprimer === p.id ? (
                      <>
                        <button
                          type="button"
                          className="btn-ghost btn-ghost--mini btn-ghost--danger"
                          disabled={occupe === p.id}
                          onClick={() => supprimer(p)}
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-ghost--mini"
                          onClick={() => setASupprimer(null)}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost btn-ghost--mini btn-ghost--danger"
                        onClick={() => setASupprimer(p.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
