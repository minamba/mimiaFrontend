import { useEffect, useState } from 'react';
import { planifierModeleMail } from '../lib/api/adminApi';
import {
  JOURS_SEMAINE,
  formaterProchainEnvoi,
  resumerPlanification,
} from '../lib/storage/planificationMail';
import { Interrupteur } from './Modes';

const FREQUENCES = [
  { valeur: 'Jour', libelle: 'Tous les jours' },
  { valeur: 'Semaine', libelle: 'Chaque semaine' },
  { valeur: 'Mois', libelle: 'Chaque mois' },
];

const JOURS_MOIS = Array.from({ length: 31 }, (_, i) => i + 1);

const regleDe = (modele) => ({
  actif: Boolean(modele.actif),
  frequence: !modele.frequence || modele.frequence === 'Aucune'
    ? (modele.code === 'BILANS' ? 'Semaine' : 'Jour')
    : modele.frequence,
  heure: modele.heure ?? '09:00',
  jourSemaine: modele.jourSemaine ?? 1,
  jourMois: modele.jourMois ?? 1,
});

/**
 * QUAND UN COURRIEL AUTOMATIQUE PART — Camara, le 15/09/2026.
 *
 * Tous les jours (l'heure), chaque semaine (le jour et l'heure), chaque mois
 * (la date et l'heure : « le 5 à 13 h »). L'heure est celle de Paris.
 *
 * L'INTERRUPTEUR AGIT TOUT DE SUITE, LES CHAMPS AVEC LEUR BOUTON. Allumer ou
 * éteindre est un geste net, comme dans « Modes » ; changer une heure se
 * règle en plusieurs retouches, et un envoi ne doit pas se reprogrammer à
 * chaque chiffre tapé.
 */
export default function PlanificationModele({ modele, onPlanifie }) {
  const bilans = modele.code === 'BILANS';

  const [regle, setRegle] = useState(() => regleDe(modele));
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [enregistre, setEnregistre] = useState(false);

  // Un autre courriel choisi : ses propres réglages, pas ceux du précédent.
  useEffect(() => {
    setRegle(regleDe(modele));
    setErreur(null);
    setEnregistre(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modele.id]);

  if (modele.reglesADefinir) {
    return (
      <div className="planification planification--bloquee">
        <strong className="planification__titre">Programmation</strong>
        <p>
          Les règles de ce courriel ne sont pas encore définies : il ne peut pas être
          programmé, et rien n’est envoyé.
        </p>
      </div>
    );
  }

  const modifier = (champ, valeur) => {
    setRegle((r) => ({ ...r, [champ]: valeur }));
    setEnregistre(false);
  };

  const enregistrer = async (aEnregistrer) => {
    setOccupe(true);
    setErreur(null);

    try {
      const { data } = await planifierModeleMail(modele.id, {
        actif: aEnregistrer.actif,
        frequence: aEnregistrer.frequence,
        heure: aEnregistrer.heure,
        jourSemaine: Number(aEnregistrer.jourSemaine),
        jourMois: Number(aEnregistrer.jourMois),
      });

      setRegle(regleDe(data));
      setEnregistre(true);
      onPlanifie?.(data);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'La programmation n’a pas pu être enregistrée.');
    } finally {
      setOccupe(false);
    }
  };

  return (
    <div className="planification">
      <Interrupteur
        titre="Envoi programmé"
        actif={Boolean(modele.actif)}
        connu
        occupe={occupe}
        onBasculer={() => enregistrer({ ...regle, actif: !modele.actif })}
        description={modele.actif
          ? `${resumerPlanification(modele)} (heure de Paris).`
          : 'Ce courriel ne part pas tant qu’il n’est pas programmé.'}
        note={bilans
          ? 'Les bilans sont écrits pour une semaine : ils se programment chaque semaine, le jour et l’heure de votre choix.'
          : undefined}
      />

      <div className="planification__champs">
        {!bilans && (
          <div className="champ">
            <label htmlFor="plan-frequence">Fréquence</label>
            <select
              id="plan-frequence"
              value={regle.frequence}
              onChange={(e) => modifier('frequence', e.target.value)}
            >
              {FREQUENCES.map((f) => <option key={f.valeur} value={f.valeur}>{f.libelle}</option>)}
            </select>
          </div>
        )}

        {regle.frequence === 'Semaine' && (
          <div className="champ">
            <label htmlFor="plan-jour">Jour</label>
            <select
              id="plan-jour"
              value={regle.jourSemaine}
              onChange={(e) => modifier('jourSemaine', Number(e.target.value))}
            >
              {JOURS_SEMAINE.map((j) => <option key={j.valeur} value={j.valeur}>{j.libelle}</option>)}
            </select>
          </div>
        )}

        {regle.frequence === 'Mois' && (
          <div className="champ">
            <label htmlFor="plan-jour-mois">Jour du mois</label>
            <select
              id="plan-jour-mois"
              value={regle.jourMois}
              onChange={(e) => modifier('jourMois', Number(e.target.value))}
            >
              {JOURS_MOIS.map((j) => <option key={j} value={j}>{j === 1 ? '1er' : j}</option>)}
            </select>
            <span className="champ__aide">Un mois plus court prend son dernier jour.</span>
          </div>
        )}

        <div className="champ">
          <label htmlFor="plan-heure">Heure (Paris)</label>
          <input
            id="plan-heure"
            type="time"
            step="300"
            value={regle.heure}
            onChange={(e) => modifier('heure', e.target.value)}
          />
        </div>
      </div>

      <div className="planification__actions">
        <button
          type="button"
          className="btn btn--compact"
          disabled={occupe}
          onClick={() => enregistrer(regle)}
        >
          {occupe ? 'Enregistrement…' : 'Enregistrer la programmation'}
        </button>

        {enregistre && (
          <span className="etat-enregistrement etat-enregistrement--enregistre">
            Programmation enregistrée
          </span>
        )}
      </div>

      {erreur && <div className="alert">{erreur}</div>}

      <ul className="planification__infos">
        {modele.actif && modele.prochaineExecution && (
          <li>
            <strong>Prochain envoi :</strong> {formaterProchainEnvoi(modele.prochaineExecution)}
          </li>
        )}

        {modele.dernierEnvoiLe && (
          <li>
            <strong>Dernier envoi :</strong> {formaterProchainEnvoi(modele.dernierEnvoiLe)}
            {modele.dernierResultat ? ` — ${modele.dernierResultat}` : ''}
          </li>
        )}

        {!modele.dernierEnvoiLe && modele.dernierResultat && <li>{modele.dernierResultat}</li>}
      </ul>
    </div>
  );
}
