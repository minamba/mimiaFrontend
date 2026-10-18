import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { submitEleve, resetEleve } from '../lib/actions/elevesActions';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import Loader from './Loader';
import {
  grouperClasses, specialitesDeLaClasse, specialitesAEnvoyer, filiereDeLaClasse, filiereAEnvoyer,
  languesDeLaClasse, languesAEnvoyer, basculerLangue,
} from '../lib/niveauxScolaires';
import ChoixSpecialites from './ChoixSpecialites';
import ChoixFilierePro from './ChoixFilierePro';
import ChoixBesoins from './ChoixBesoins';
import ChoixAcademie from './ChoixAcademie';
import { Section } from './FenetreEditionEnfant';
import { useBesoinsParticuliers } from '../lib/storage/modeTest';
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
    langues: [],
    // La filière professionnelle (15/10/2026), dans les seules classes pro.
    filiere: { familleMetiers: '', specialitePro: '', specialiteProLibre: '' },
    // Les besoins particuliers (11/10/2026) : aucun, écran adapté d'office.
    besoins: { besoins: [], ecranAdapte: true },
  });
  const besoinsActifs = useBesoinsParticuliers();

  // LA CASE LV2 N'EXISTE QUE DANS LES CLASSES QUI ONT UNE LV2 — le serveur le
  // dit classe par classe (`lv2Possible`). Ailleurs elle n'est ni montrée ni
  // envoyée cochée : un CE2 n'a pas de LV2.
  const niveauChoisi = niveaux.find((n) => String(n.id) === String(champs.niveauScolaireId));
  const lv2Possible = Boolean(niveauChoisi?.lv2Possible);
  const specialitesClasse = specialitesDeLaClasse(niveaux, champs.niveauScolaireId);
  const languesClasse = languesDeLaClasse(niveaux, champs.niveauScolaireId);
  const filiereClasse = filiereDeLaClasse(niveaux, champs.niveauScolaireId);

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
        langues: languesAEnvoyer(champs.langues, languesClasse),
        ...filiereAEnvoyer(champs.filiere, filiereClasse),
        // Envoyés seulement si le module est allumé : sinon rien n'est changé.
        ...(besoinsActifs ? {
          besoinsParticuliers: champs.besoins.besoins,
          ecranAdapte: champs.besoins.ecranAdapte,
        } : {}),
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
        <Link to="/eleves" className="lien-retour"><span aria-hidden="true">←</span> Mes enfants</Link>
        <h1>Ajouter un enfant</h1>
        <QuotaEnfants capacite={capacite} enPage />
      </section>
    );
  }

  // Regroupées par voie et par série : voir `grouperClasses`.
  const groupes = grouperClasses(niveaux);

  return (
    <section className="page page--etroite page--ajout-enfant">
      <Link to="/eleves" className="lien-retour"><span aria-hidden="true">←</span> Mes enfants</Link>

      {/* LE TITRE EN BANDEAU — Camara, le 17/10/2026 : « tu peux améliorer le
          titre ? ». Une vignette, un surtitre, le mot qui compte en couleur. */}
      <header className="ajout-enfant-entete">
        <span className="ajout-enfant-entete__vignette" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="8" r="4" />
            <path d="M3 21c0-4 3.1-6.5 7-6.5 1.6 0 3 .4 4.2 1.1" />
            <path d="M19 14v6M16 17h6" />
          </svg>
        </span>
        <div>
          <span className="ajout-enfant-entete__surtitre">Nouveau profil</span>
          <h1>Ajouter <span className="ajout-enfant-entete__accent">un enfant</span></h1>
          <p>Deux minutes, et son professeur est prêt.</p>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      {/* DANS UN ENCADRÉ — Camara, le 17/10/2026 : les champs flottaient sur la
          grille du fond, et « Créer le profil » collait au bloc des besoins. */}
      <form onSubmit={soumettre} className="formulaire-enfant">
        {/* EN TROIS SECTIONS, COMME LA FENÊTRE « MODIFIER » — Camara, le
            17/10/2026 : on retrouve le même formulaire à la création et à la
            modification. Voir `FenetreEditionEnfant`. */}
        <Section couleur="identite" titre="Identité" aide="Ce que le professeur saura de lui pour s'adresser à lui.">
          <div className="duo">
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
                // eslint-disable-next-line jsx-a11y/no-autofocus
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
            </div>
          </div>
          <span className="champ__aide">
            Le nom sert uniquement à retrouver le profil : le professeur l'appellera
            toujours par son prénom.
          </span>

          <div className="duo">
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
                Pour adapter le vocabulaire — il peut ne pas correspondre à la classe.
              </span>
            </div>

            {/* Le professeur parle : en français, tout s'accorde. Sans cette
                information, une élève s'entend dire « tu es prêt ? » à chaque
                séance, ce qui rappelle en continu qu'on ne la connaît pas. */}
            <fieldset className="champ champ--choix">
              <legend>Fille ou garçon</legend>
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
                Pour que le professeur accorde correctement quand il lui parle.
              </span>
            </fieldset>
          </div>
        </Section>

        <Section couleur="scolarite" titre="Scolarité" aide="Sa classe décide de ses matières et de son programme.">
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
              Au lycée technologique, choisissez la série : c'est elle qui donne les
              bonnes spécialités.
            </span>
          </div>

          {/* SES LANGUES, SES SPÉCIALITÉS ET SA FILIÈRE, sous la classe qui les
              décide. Rien ne s'affiche quand la classe n'en a pas. */}
          <div className="enfant-ligne__options">
            {lv2Possible && (
              <label className="case">
                <input
                  type="checkbox"
                  checked={champs.lv2Espagnol}
                  onChange={(e) => setChamps((p) => ({ ...p, lv2Espagnol: e.target.checked }))}
                />
                Espagnol en LVB
              </label>
            )}

            {/* LES AUTRES LANGUES VIVANTES B — une case par langue allumée. */}
            {languesClasse.map((langue) => (
              <label className="case" key={langue.code}>
                <input
                  type="checkbox"
                  checked={champs.langues.includes(langue.code)}
                  onChange={() => setChamps((p) => ({
                    ...p, langues: basculerLangue(p.langues, langue.code),
                  }))}
                />
                {langue.libelle} en LVB
              </label>
            ))}

            <ChoixSpecialites
              id="specialites"
              nombre={specialitesClasse.nombre}
              possibles={specialitesClasse.possibles}
              valeur={champs.specialites}
              onChange={(specialites) => setChamps((p) => ({ ...p, specialites }))}
            />

            <ChoixFilierePro
              id="filiere"
              filiere={filiereClasse}
              valeur={champs.filiere}
              onChange={(filiere) => setChamps((p) => ({ ...p, filiere }))}
            />
          </div>
          {(lv2Possible || languesClasse.length > 0) && (
            <span className="champ__aide">
              Cochez sa deuxième langue vivante (LVB, souvent encore appelée LV2) : son
              professeur apparaîtra dans ses matières. La spécialité LLCER, elle, se
              coche avec les spécialités.
            </span>
          )}
        </Section>

        {/* FACULTATIVE, VOLONTAIREMENT : sans académie, « Mon calendrier »
            affiche ses séances sans les vacances, jusqu'à ce qu'elle soit
            renseignée. */}
        <Section couleur="lieu" titre="Où il étudie" aide="Son académie fixe ses vacances dans « Mon calendrier ». Facultatif.">
          <ChoixAcademie
            id="academie"
            valeur={champs.academieId}
            onChange={(academieId) => setChamps((p) => ({ ...p, academieId }))}
            academies={academies}
          />
        </Section>

        {besoinsActifs && (
          <div className="edition-enfant__besoins">
            <ChoixBesoins
              valeur={champs.besoins}
              onChange={(besoins) => setChamps((p) => ({ ...p, besoins }))}
            />
          </div>
        )}

        <div className="formulaire-enfant__actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Création…' : 'Créer le profil'}
          </button>
        </div>
      </form>
    </section>
  );
}
