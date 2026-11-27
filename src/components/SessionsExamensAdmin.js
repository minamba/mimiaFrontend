import { useCallback, useEffect, useState } from 'react';
import {
  getSessionsExamens, rejeterDateEpreuve, relireCalendrier, validerDateEpreuve,
} from '../lib/api/sessionsExamensApi';
import { dureeEpreuve, horaireEpreuve, jourEpreuve, jourLocal } from '../lib/datesEpreuves';
import Loader from './Loader';
import './sessionsExamens.css';

const dateCourte = (valeur) => {
  const d = jourLocal(valeur);
  return d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
};

/** La date d'une épreuve en une ligne : « Jeudi 24 juin 2027 · 8 h – 11 h 15 (3 h 15) ». */
function LigneDate({ date }) {
  if (!date) return <span className="sx-vide">Pas encore de date</span>;
  const horaire = horaireEpreuve(date);
  const duree = dureeEpreuve(date);
  return (
    <span>
      {jourEpreuve(date)}
      {horaire && <> · {horaire}</>}
      {duree && <span className="sx-duree"> ({duree})</span>}
    </span>
  );
}

/** Les liens des sources, CLIQUABLES — Camara : « pour que je puisse valider ». Ouverts dans un nouvel onglet. */
function Sources({ date }) {
  if (!date) return null;
  return (
    <span className="sx-sources">
      <a href={date.sourceUrl} target="_blank" rel="noopener noreferrer" title={date.sourceLibelle}>
        {date.sourceUrl.includes('/bo/') ? 'Note de service' : 'Page lue'} ↗
      </a>
      {date.annexeUrl && (
        <a href={date.annexeUrl} target="_blank" rel="noopener noreferrer">Annexe (horaires) ↗</a>
      )}
    </span>
  );
}

/**
 * L'ONGLET « SESSIONS D'EXAMENS » — Camara, le 25/11/2026. Les dates officielles de chaque épreuve (celles que voient
 * les familles), les PROPOSITIONS de la veille en tête, avec la phrase du texte officiel et ses liens, et les boutons
 * Valider / Rejeter. Rien n'est visible des familles avant la validation.
 */
export default function SessionsExamensAdmin() {
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(null);
  const [relecture, setRelecture] = useState(null);

  const charger = useCallback(async () => {
    try {
      const { data } = await getSessionsExamens();
      setDonnees(data);
      setErreur(null);
    } catch {
      setErreur('Les sessions d’examens n’ont pas pu être chargées.');
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const agir = async (action, id) => {
    setEnCours(id);
    try {
      await (action === 'valider' ? validerDateEpreuve(id) : rejeterDateEpreuve(id));
      await charger();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'L’action n’a pas abouti.');
    } finally {
      setEnCours(null);
    }
  };

  const relire = async () => {
    setEnCours('relire');
    setRelecture(null);
    try {
      const { data } = await relireCalendrier();
      setRelecture(data.pages ?? []);
      await charger();
    } catch {
      setErreur('La relecture du calendrier n’a pas abouti.');
    } finally {
      setEnCours(null);
    }
  };

  if (erreur && !donnees) return <div className="alert">{erreur}</div>;
  if (!donnees) return <Loader texte="Chargement…" />;

  const propositions = donnees.epreuves.filter((e) => e.proposee);

  return (
    <section className="sx">
      <header className="sx-tete">
        <div>
          <h2>Sessions d’examens</h2>
          <p>
            Les dates officielles de chaque épreuve, celles que voient les familles. Chaque nuit, la veille relit le
            calendrier officiel ; si une date change, elle vous la propose ici avec sa source. Rien n’est visible des
            familles avant votre validation.
          </p>
        </div>
        <button type="button" className="btn btn--compact" onClick={relire} disabled={enCours === 'relire'}>
          {enCours === 'relire' ? 'Lecture…' : 'Relire le calendrier maintenant'}
        </button>
      </header>

      {erreur && <div className="alert">{erreur}</div>}

      {relecture && (
        <ul className="sx-relecture">
          {relecture.map((p) => (
            <li key={p.url}>
              <a href={p.url} target="_blank" rel="noopener noreferrer">{p.url}</a> :{' '}
              {p.lue
                ? `lue${p.session ? ` (session ${p.session})` : ''}, ${p.proposees} nouvelle${p.proposees > 1 ? 's' : ''} proposition${p.proposees > 1 ? 's' : ''}.`
                : 'illisible pour l’instant (site indisponible ou sans copie à l’Internet Archive).'}
            </li>
          ))}
        </ul>
      )}

      <h3 className="sx-titre">
        À valider {propositions.length > 0 && <span className="sx-compte">{propositions.length}</span>}
      </h3>
      {propositions.length === 0 ? (
        <p className="sx-vide">Aucune proposition en attente : les dates en place sont à jour.</p>
      ) : (
        <ul className="sx-propositions">
          {propositions.map((e) => (
            <li key={e.code} className="sx-proposition">
              <p className="sx-epreuve">{e.examenLibelle} · <strong>{e.libelle}</strong></p>
              <div className="sx-comparaison">
                <div>
                  <span className="sx-etiquette">En place</span>
                  <LigneDate date={e.validee} />
                  {e.validee?.remplacementLe && <span className="sx-remplacement">Remplacement : {dateCourte(e.validee.remplacementLe)}</span>}
                </div>
                <div className="sx-nouvelle">
                  <span className="sx-etiquette">Proposée</span>
                  <LigneDate date={e.proposee} />
                  {e.proposee.remplacementLe && <span className="sx-remplacement">Remplacement : {dateCourte(e.proposee.remplacementLe)}</span>}
                </div>
              </div>
              {e.proposee.extrait && <blockquote className="sx-extrait">« {e.proposee.extrait} »</blockquote>}
              <p className="sx-provenance">
                {e.proposee.sourceLibelle} · <Sources date={e.proposee} />
              </p>
              <div className="sx-actions">
                <button type="button" className="btn btn--compact" disabled={enCours === e.proposee.id}
                  onClick={() => agir('valider', e.proposee.id)}>
                  Valider
                </button>
                <button type="button" className="btn-ghost" disabled={enCours === e.proposee.id}
                  onClick={() => agir('rejeter', e.proposee.id)}>
                  Rejeter
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3 className="sx-titre">Dates en place</h3>
      <div className="sx-tableau-defile">
        <table className="tableau sx-tableau">
          <thead>
            <tr>
              <th>Examen</th>
              <th>Épreuve</th>
              <th>Date</th>
              <th>Remplacement</th>
              <th>Sources</th>
            </tr>
          </thead>
          <tbody>
            {donnees.epreuves.map((e) => (
              <tr key={e.code}>
                <td>{e.examenLibelle} {e.session}</td>
                <td>{e.libelle}</td>
                <td><LigneDate date={e.validee} /></td>
                <td>{dateCourte(e.validee?.remplacementLe) ?? '—'}</td>
                <td><Sources date={e.validee} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="sx-titre">Pages surveillées</h3>
      <ul className="sx-pages">
        {donnees.pages.map((p) => (
          <li key={p.url}>
            <a href={p.url} target="_blank" rel="noopener noreferrer">{p.libelle} ↗</a>
            <span className="sx-vide">
              {p.jamaisLue ? ' · pas encore lue' : p.statut === 'changee' ? ' · a changé au dernier relevé' : ' · inchangée'}
              {p.copieDu && ` · lue sur la copie de l’Internet Archive du ${dateCourte(p.copieDu)}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
