import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitEleve, resetEleve } from '../lib/actions/elevesActions';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import Loader from './Loader';

/**
 * Onboarding d'un profil enfant.
 *
 * Le niveau et l'âge sont saisis séparément et volontairement :
 * le niveau pilote le contenu, l'âge pilote le ton de l'agent. Les déduire
 * l'un de l'autre traiterait mal tout élève en redoublement ou en avance.
 */
export default function FormulaireEleve() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { niveaux, loading: chargementReferentiel } = useSelector((state) => state.referentiel);
  const { submitting, success, error } = useSelector((state) => state.eleves);

  const [champs, setChamps] = useState({
    prenom: '',
    nom: '',
    age: '',
    niveauScolaireId: '',
    sexe: '',
  });

  const set = (nom) => (evenement) =>
    setChamps((precedent) => ({ ...precedent, [nom]: evenement.target.value }));

  useEffect(() => {
    if (niveaux.length === 0) dispatch(chargerReferentiel());
  }, [dispatch, niveaux.length]);

  useEffect(() => {
    if (success) {
      dispatch(resetEleve());
      navigate('/eleves', { replace: true });
    }
  }, [success, dispatch, navigate]);

  const soumettre = (evenement) => {
    evenement.preventDefault();
    dispatch(
      submitEleve({
        prenom: champs.prenom.trim(),
        nom: champs.nom.trim(),
        age: Number(champs.age),
        sexe: Number(champs.sexe),
        niveauScolaireId: Number(champs.niveauScolaireId),
      }),
    );
  };

  if (chargementReferentiel && niveaux.length === 0) {
    return <Loader texte="Chargement des niveaux…" />;
  }

  // Regroupement par cycle : une liste plate de 12 niveaux est illisible.
  const parCycle = niveaux.reduce((accumulateur, niveau) => {
    (accumulateur[niveau.cycle] ??= []).push(niveau);
    return accumulateur;
  }, {});

  return (
    <section className="page page--etroite">
      <h1>Ajouter un enfant</h1>
      <p className="page__sous-titre">Deux minutes, et son professeur est prêt.</p>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={soumettre}>
        <div className="champ">
          <label htmlFor="prenom">Prénom</label>
          <input
            id="prenom"
            type="text"
            value={champs.prenom}
            onChange={set('prenom')}
            required
            minLength={2}
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="champ">
          <label htmlFor="nom">Nom de famille</label>
          <input
            id="nom"
            type="text"
            value={champs.nom}
            onChange={set('nom')}
            required
            minLength={2}
            maxLength={100}
          />
          <span className="champ__aide">
            Sert uniquement à retrouver le profil. Le professeur, lui, l'appellera
            toujours par son prénom.
          </span>
        </div>

        <div className="champ">
          <label htmlFor="niveau">Classe</label>
          <select
            id="niveau"
            value={champs.niveauScolaireId}
            onChange={set('niveauScolaireId')}
            required
          >
            <option value="">Choisir une classe…</option>
            {Object.entries(parCycle).map(([cycle, niveauxDuCycle]) => (
              <optgroup key={cycle} label={cycle}>
                {niveauxDuCycle.map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.libelle}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="champ">
          <label htmlFor="age">Âge</label>
          <input
            id="age"
            type="number"
            value={champs.age}
            onChange={set('age')}
            required
            min={5}
            max={25}
          />
          <span className="champ__aide">
            Sert à adapter le vocabulaire — il peut ne pas correspondre à la classe.
          </span>
        </div>

        {/* Le professeur parle : en français, tout s'accorde. Sans cette
            information, une élève s'entend dire « tu es prêt ? » à chaque
            séance, ce qui rappelle en continu qu'on ne la connaît pas. */}
        <fieldset className="champ champ--choix">
          <legend>C'est une fille ou un garçon ?</legend>

          <div className="choix">
            {[
              { valeur: '1', libelle: 'Une fille' },
              { valeur: '2', libelle: 'Un garçon' },
            ].map((option) => (
              <label
                key={option.valeur}
                className={`choix__option ${champs.sexe === option.valeur ? 'choix__option--actif' : ''}`}
              >
                <input
                  type="radio"
                  name="sexe"
                  value={option.valeur}
                  checked={champs.sexe === option.valeur}
                  onChange={set('sexe')}
                  required
                />
                {option.libelle}
              </label>
            ))}
          </div>

          <span className="champ__aide">
            Uniquement pour que le professeur accorde correctement quand il lui parle.
          </span>
        </fieldset>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer le profil'}
        </button>
      </form>
    </section>
  );
}
