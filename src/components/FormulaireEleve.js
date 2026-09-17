import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitEleve, resetEleve } from '../lib/actions/elevesActions';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import Loader from './Loader';
import { grouperClasses, specialitesDeLaClasse, specialitesAEnvoyer } from '../lib/niveauxScolaires';
import ChoixSpecialites from './ChoixSpecialites';
import QuotaEnfants from './QuotaEnfants';
import { getCapaciteEnfants } from '../lib/api/abonnementApi';

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

  const { niveaux, academies, loading: chargementReferentiel } = useSelector((state) => state.referentiel);
  const { submitting, success, error } = useSelector((state) => state.eleves);

  const [champs, setChamps] = useState({
    prenom: '',
    nom: '',
    age: '',
    niveauScolaireId: '',
    sexe: '',
    academieId: '',
    lv2Espagnol: false,
    specialites: [],
  });

  // LA CASE LV2 N'EXISTE QUE DANS LES CLASSES QUI ONT UNE LV2 — le serveur le
  // dit classe par classe (`lv2Possible`). Ailleurs elle n'est ni montrée ni
  // envoyée cochée : un CE2 n'a pas de LV2.
  const niveauChoisi = niveaux.find((n) => String(n.id) === String(champs.niveauScolaireId));
  const lv2Possible = Boolean(niveauChoisi?.lv2Possible);
  const specialitesClasse = specialitesDeLaClasse(niveaux, champs.niveauScolaireId);

  const set = (nom) => (evenement) =>
    setChamps((precedent) => ({ ...precedent, [nom]: evenement.target.value }));

  useEffect(() => {
    if (niveaux.length === 0) dispatch(chargerReferentiel());
  }, [dispatch, niveaux.length]);

  /**
   * LE FORMULAIRE SE GARDE LUI-MÊME — Camara, le 18/09/2026.
   *
   * Les écrans qui y mènent cachent déjà leur bouton quand le compte ne peut
   * plus ajouter d'enfant. Ça ne suffit pas : cette page a une adresse, et
   * une adresse se tape, se met en favori, et traîne dans un historique. Sans
   * ce contrôle, on remplissait huit champs pour se voir refuser à l'envoi —
   * et le refus se lit alors comme une panne plutôt que comme une limite.
   *
   * `null` VEUT DIRE « ON NE SAIT PAS ENCORE », et on attend : afficher le
   * formulaire puis le remplacer par un refus serait pire que l'attente.
   *
   * UN ÉCHEC DE LA REQUÊTE LAISSE PASSER. Le serveur refusera de toute façon,
   * avec un message précis ; bloquer sur une requête ratée interdirait à un
   * parent parfaitement en droit de créer le profil de son enfant.
   */
  const [capacite, setCapacite] = useState(null);

  useEffect(() => {
    let vivant = true;

    getCapaciteEnfants()
      .then(({ data }) => { if (vivant) setCapacite(data); })
      .catch(() => { if (vivant) setCapacite({ peutAjouter: true }); });

    return () => { vivant = false; };
  }, []);

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
        academieId: champs.academieId ? Number(champs.academieId) : null,
        lv2Espagnol: lv2Possible && champs.lv2Espagnol,
        specialites: specialitesAEnvoyer(champs.specialites, specialitesClasse),
      }),
    );
  };

  if ((chargementReferentiel && niveaux.length === 0) || capacite === null) {
    return <Loader texte="Chargement des niveaux…" />;
  }

  // L'ENCADRÉ DIT LEQUEL DES DEUX REFUS s'applique — la formule pleine, ou le
  // droit retiré par l'administration. Le même composant que sur « Vos
  // enfants » et dans le compte : un texte recopié aurait dérivé au premier
  // changement de formulation.
  if (!capacite.peutAjouter) {
    return (
      <section className="page page--etroite">
        <h1>Ajouter un enfant</h1>
        <QuotaEnfants capacite={capacite} enPage />
      </section>
    );
  }

  // Regroupées par voie et par série : voir `grouperClasses`.
  const groupes = grouperClasses(niveaux);

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
            {groupes.map(([cycle, niveauxDuCycle]) => (
              <optgroup key={cycle} label={cycle}>
                {niveauxDuCycle.map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.libelle}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="champ__aide">
            Au lycée technologique, choisis la série : c'est ce qui donne à ton
            enfant les bonnes spécialités.
          </span>
        </div>

        {lv2Possible && (
          <div className="champ">
            <label className="case">
              <input
                type="checkbox"
                checked={champs.lv2Espagnol}
                onChange={(e) => setChamps((p) => ({ ...p, lv2Espagnol: e.target.checked }))}
              />
              Il a l’espagnol en LVB
            </label>
            <span className="champ__aide">
              Coche la case si l’espagnol est sa deuxième langue vivante, la LVB
              (souvent encore appelée LV2) : un professeur d’espagnol apparaîtra dans
              ses matières. La spécialité LLCER espagnol, elle, se coche avec les
              spécialités.
            </span>
          </div>
        )}

        <ChoixSpecialites
          id="specialites"
          nombre={specialitesClasse.nombre}
          possibles={specialitesClasse.possibles}
          valeur={champs.specialites}
          onChange={(specialites) => setChamps((p) => ({ ...p, specialites }))}
        />

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

        {/* FACULTATIF, VOLONTAIREMENT.
            Un parent qui ne connaît pas l'académie de son enfant, ou qui ne
            s'en soucie pas, ne doit pas être bloqué pour autant : sans elle,
            « Mon calendrier » affiche simplement ses séances sans les
            périodes de vacances, jusqu'à ce qu'elle soit renseignée. */}
        <div className="champ">
          <label htmlFor="academie">Académie (facultatif)</label>
          <select id="academie" value={champs.academieId} onChange={set('academieId')}>
            <option value="">Je ne sais pas / plus tard</option>
            <optgroup label="Zones A, B, C">
              {academies
                .filter((a) => ['A', 'B', 'C'].includes(a.zone))
                .map((a) => (
                  <option key={a.id} value={a.id}>{a.libelle}</option>
                ))}
            </optgroup>
            <optgroup label="Corse et outre-mer">
              {academies
                .filter((a) => !['A', 'B', 'C'].includes(a.zone))
                .map((a) => (
                  <option key={a.id} value={a.id}>{a.libelle}</option>
                ))}
            </optgroup>
          </select>
          <span className="champ__aide">
            Sert uniquement à afficher les périodes de vacances scolaires dans
            « Mon calendrier ».
          </span>
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer le profil'}
        </button>
      </form>
    </section>
  );
}
