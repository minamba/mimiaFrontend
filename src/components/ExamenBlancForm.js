import { useState } from 'react';
import { ajouterDocumentExamenBlanc, ajouterMatiereExamenBlanc } from '../lib/api/examensBlancsApi';
import ChoixHeure from './ChoixHeure';
import DocumentsExamenBlanc from './DocumentsExamenBlanc';
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
 * LA FENÊTRE D'UN EXAMEN BLANC — Camara, le 23/11/2026 : « comme la popup pour ajouter un contrôle, sauf qu'on n'a
 * pas de description : l'enfant choisit sa matière et envoie tous ses documents ».
 *
 * UNE MATIÈRE À LA FOIS. La date range la matière dans l'examen blanc de ce jour-là : s'il existe, elle le rejoint ;
 * sinon il est créé. Ouverte depuis la page d'un examen blanc (« + Ajouter une matière »), la date est déjà fixée
 * (`dateFixee`) et les matières déjà ajoutées ne sont plus proposées.
 *
 * Les documents attendent ici et partent juste après l'ajout de la matière (il faut son numéro). Un document refusé
 * garde la fenêtre ouverte, avec le motif : la matière est bien ajoutée, l'enfant voit ce qui n'est pas passé.
 */
export default function ExamenBlancForm({
  eleveId, matieres: toutes, libelle = 'Examen blanc', dateFixee = null, heureFixee = null, dejaLa = [],
  jour = null, onEnregistre, onAnnule,
}) {
  const matieres = (toutes ?? []).filter((m) => m.code !== 'ORIENTATION' && !dejaLa.includes(m.id));

  const [matiereId, setMatiereId] = useState('');
  const [date, setDate] = useState(dateFixee ? dateFixee.slice(0, 10) : jour ? versISODate(jour) : '');
  const [heure, setHeure] = useState(heureFixee?.slice(0, 5) ?? '');
  const [enAttente, setEnAttente] = useState([]);
  const [occupe, setOccupe] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [manquants, setManquants] = useState({});
  const [ajoute, setAjoute] = useState(null);

  const verifier = () => {
    const m = {};
    if (!matiereId) m.matiere = 'Choisis la matière.';
    if (!date) m.date = 'Choisis la date de ton examen blanc.';
    setManquants(m);
    return Object.keys(m).length === 0;
  };

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    if (ajoute) { onEnregistre(ajoute.examenBlancId); return; }
    if (!verifier()) return;

    setEnvoi(true);
    setErreur(null);

    try {
      const { data } = await ajouterMatiereExamenBlanc(eleveId, {
        matiereId: Number(matiereId),
        dateExamen: date,
        heureExamen: heure ? `${heure}:00` : null,
      });

      // LES DOCUMENTS PARTENT APRÈS LA MATIÈRE. Un refus garde la fenêtre ouverte : la matière est là.
      for (const fichier of enAttente) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await ajouterDocumentExamenBlanc(eleveId, data.examenBlancId, data.matiereLigneId, fichier);
        } catch (e) {
          setAjoute(data);
          setErreur(`La matière est ajoutée, mais « ${fichier.name} » n’est pas passé : `
            + `${e?.response?.data?.message ?? 'réessaie depuis la page de ton examen blanc.'}`);
          setEnvoi(false);
          return;
        }
      }

      onEnregistre(data.examenBlancId);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'La matière n’a pas pu être ajoutée. Tu peux réessayer ?');
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
          <strong className="controle-form__titre">{dateFixee ? 'Ajouter une matière' : libelle}</strong>
          <span className="controle-form__soustitre">
            Envoie tes cours : ton professeur en tirera un programme de révision.
          </span>
        </span>
        <button
          type="button"
          className="controle-form__fermer"
          aria-label="Fermer"
          onClick={ajoute ? () => onEnregistre(ajoute.examenBlancId) : onAnnule}
        >
          ×
        </button>
      </header>

      {erreur && <div className="alert">{erreur}</div>}

      <div className={`champ${manquants.matiere ? ' champ--manquant' : ''}`}>
        <label htmlFor="eb-matiere">Matière</label>
        <select
          id="eb-matiere"
          value={matiereId}
          disabled={Boolean(ajoute)}
          onChange={(e) => { setMatiereId(e.target.value); setManquants((m) => ({ ...m, matiere: undefined })); }}
          aria-invalid={Boolean(manquants.matiere)}
        >
          {!matiereId && <option value="">Choisis une matière…</option>}
          {matieres.length === 0 && <option value="">Aucune autre matière disponible</option>}
          {matieres.map((m) => (
            <option key={m.id} value={m.id}>{m.libelle}</option>
          ))}
        </select>
        {manquants.matiere && <span className="champ__erreur" role="alert">{manquants.matiere}</span>}
      </div>

      {!dateFixee && !jour && (
        <div className={`champ${manquants.date ? ' champ--manquant' : ''}`}>
          <label htmlFor="eb-date">Date de l’examen blanc</label>
          <input
            id="eb-date"
            type="date"
            value={date}
            min={versISODate(new Date())}
            disabled={Boolean(ajoute)}
            onChange={(e) => { setDate(e.target.value); setManquants((m) => ({ ...m, date: undefined })); }}
            aria-invalid={Boolean(manquants.date)}
          />
          {manquants.date && <span className="champ__erreur" role="alert">{manquants.date}</span>}
          <span className="champ__aide">
            Une autre matière à la même date rejoindra le même {libelle.toLowerCase()}.
          </span>
        </div>
      )}

      {!dateFixee && (
        <div className="champ">
          <span id="eb-heure-libelle" className="champ__libelle">
            Heure <span className="champ__option">(facultatif)</span>
          </span>
          <ChoixHeure id="eb-heure" valeur={heure} onChange={setHeure} labelledBy="eb-heure-libelle" />
        </div>
      )}

      {!ajoute && (
        <DocumentsExamenBlanc
          eleveId={eleveId}
          enAttente={enAttente}
          onEnAttente={setEnAttente}
          onOccupe={setOccupe}
          disabled={envoi}
        />
      )}

      <div className="modale__actions">
        <button type="button" className="btn-ghost" onClick={ajoute ? () => onEnregistre(ajoute.examenBlancId) : onAnnule}>
          Annuler
        </button>
        <button type="submit" className="btn btn--compact" disabled={envoi || occupe || matieres.length === 0}>
          {envoi ? 'Envoi…' : ajoute ? 'Terminer' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
