import { useState } from 'react';
import { modifierExamenBlanc } from '../lib/api/examensBlancsApi';
import ChoixHeure from './ChoixHeure';
import { IconeControle } from './ControleForm';
import './controleFormIllustre.css';

/** Date locale (pas UTC) → « AAAA-MM-JJ ». */
const versISODate = (date) => {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
};

/**
 * MODIFIER UN EXAMEN BLANC — Camara, le 25/11/2026 : « il faudrait qu'on puisse le modifier comme pour les contrôles ».
 * Sa date et son heure : les matières, elles, s'ajoutent et se retirent une à une sur la page. Même fenêtre que
 * l'ajout d'une matière (`ExamenBlancForm`), même habillage.
 */
export default function ExamenBlancModification({ eleveId, examen, onEnregistre, onAnnule }) {
  const [date, setDate] = useState(examen.dateExamen?.slice(0, 10) ?? '');
  const [heure, setHeure] = useState(examen.heureExamen?.slice(0, 5) ?? '');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [manquant, setManquant] = useState(null);

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    if (!date) { setManquant('Choisis la date de ton examen blanc.'); return; }

    setEnvoi(true);
    setErreur(null);

    try {
      await modifierExamenBlanc(eleveId, examen.id, {
        dateExamen: date,
        // Toujours avec les secondes : le format .NET attendu côté serveur ne les rend pas facultatives.
        heureExamen: heure ? `${heure}:00` : null,
      });
      onEnregistre();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Ton examen blanc n’a pas pu être modifié. Tu peux réessayer ?');
      setEnvoi(false);
    }
  };

  return (
    <form className="controle-form" onSubmit={soumettre}>
      <header className="controle-form__entete">
        <span className="controle-form__pastille" aria-hidden="true">
          <IconeControle />
        </span>
        <span>
          <strong className="controle-form__titre">Modifier ton {examen.libelle.toLowerCase()}</strong>
          <span className="controle-form__soustitre">
            Sa date et son heure. Tes matières et tes documents ne bougent pas.
          </span>
        </span>
        <button type="button" className="controle-form__fermer" aria-label="Fermer" onClick={onAnnule}>
          ×
        </button>
      </header>

      {erreur && <div className="alert">{erreur}</div>}

      <div className={`champ${manquant ? ' champ--manquant' : ''}`}>
        <label htmlFor="ebm-date">Date de l’examen blanc</label>
        <input
          id="ebm-date"
          type="date"
          value={date}
          min={versISODate(new Date())}
          onChange={(e) => { setDate(e.target.value); setManquant(null); }}
          aria-invalid={Boolean(manquant)}
        />
        {manquant && <span className="champ__erreur" role="alert">{manquant}</span>}
      </div>

      <div className="champ">
        <span id="ebm-heure-libelle" className="champ__libelle">
          Heure <span className="champ__option">(facultatif)</span>
        </span>
        <ChoixHeure id="ebm-heure" valeur={heure} onChange={setHeure} labelledBy="ebm-heure-libelle" />
      </div>

      <div className="modale__actions">
        <button type="button" className="btn-ghost" onClick={onAnnule}>Annuler</button>
        <button type="submit" className="btn btn--compact" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
