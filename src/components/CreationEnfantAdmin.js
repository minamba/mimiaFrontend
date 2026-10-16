import { useState } from 'react';
import { useSelector } from 'react-redux';
import FenetreEditionEnfant, { Section } from './FenetreEditionEnfant';
import ChoixSpecialites from './ChoixSpecialites';
import ChoixFilierePro from './ChoixFilierePro';
import ChoixAcademie from './ChoixAcademie';
import { creerEnfantPourParent } from '../lib/api/adminApi';
import {
  grouperClasses, specialitesDeLaClasse, specialitesAEnvoyer, filiereDeLaClasse, filiereAEnvoyer,
  languesDeLaClasse, languesAEnvoyer, basculerLangue, serieAPreciser,
} from '../lib/niveauxScolaires';

const SEXES = [
  { valeur: '1', libelle: 'Une fille' },
  { valeur: '2', libelle: 'Un garçon' },
];

/**
 * Ce que dit le refus : le message du serveur, ou ceux de la validation
 * (`errors`, un tableau par champ), ou à défaut une phrase générale.
 */
function messageDErreur(ex) {
  const corps = ex?.response?.data;
  if (corps?.message) return corps.message;
  const champs = corps?.errors ? Object.values(corps.errors).flat().filter(Boolean) : [];
  if (champs.length > 0) return champs.join(' ');
  if (!ex?.response) return 'Le serveur ne répond pas. Vérifiez votre connexion et réessayez.';
  return 'Le profil n’a pas pu être créé. Réessayez.';
}

const VIDE = {
  prenom: '',
  nom: '',
  age: '',
  sexe: '',
  niveauScolaireId: '',
  academieId: '',
  lv2Espagnol: false,
  langues: [],
  specialites: [],
  filiere: { familleMetiers: '', specialitePro: '', specialiteProLibre: '' },
};

/**
 * CRÉER UN ENFANT POUR UN PARENT — Camara, le 16/10/2026 : « un bouton qui va
 * permettre de créer un enfant pour le parent sélectionné ; on a la popup de
 * création de l'enfant, rattaché au parent ».
 *
 * La fenêtre de « Modifier » de l'espace parent (`FenetreEditionEnfant`), avec
 * les champs de « Ajouter un enfant » : on retrouve le même formulaire des
 * deux côtés. Le nom de famille du parent est proposé d'office.
 *
 * SANS LES BESOINS PARTICULIERS, VOLONTAIREMENT : la case cochée par le parent
 * vaut son accord (donnée de santé) — l'administration ne peut pas le donner à
 * sa place. Le parent les coche ensuite dans son espace.
 *
 * Le serveur vérifie le droit « Création d'enfant » ; ni la colonne « Peut
 * ajouter » du parent ni sa formule n'arrêtent qui l'a. Un refus s'affiche au pied.
 */
export default function CreationEnfantAdmin({ parent, onFermer, onCree }) {
  const { niveaux, academies } = useSelector((state) => state.referentiel);
  const [champs, setChamps] = useState(() => ({ ...VIDE, nom: parent.nom ?? '' }));
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const set = (nom) => (e) => setChamps((p) => ({ ...p, [nom]: e.target.value }));

  const niveauChoisi = niveaux.find((n) => String(n.id) === String(champs.niveauScolaireId));
  const lv2Possible = Boolean(niveauChoisi?.lv2Possible);
  const specialitesClasse = specialitesDeLaClasse(niveaux, champs.niveauScolaireId);
  const languesClasse = languesDeLaClasse(niveaux, champs.niveauScolaireId);
  const filiereClasse = filiereDeLaClasse(niveaux, champs.niveauScolaireId);
  const aPreciser = serieAPreciser(niveaux, champs.niveauScolaireId);

  const nomParent = [parent.prenom, parent.nom].filter(Boolean).join(' ') || parent.mail;

  const soumettre = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const { data } = await creerEnfantPourParent(parent.id, {
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
      });
      onCree?.(data);
      onFermer();
    } catch (ex) {
      setErreur(messageDErreur(ex));
      setEnvoi(false);
    }
  };

  return (
    <FenetreEditionEnfant
      titre="Créer un enfant"
      sousTitre={`Rattaché à ${nomParent}`}
      initiale="+"
      onFermer={onFermer}
      onSoumettre={soumettre}
      saving={envoi}
      libelleBouton="Créer le profil"
      libelleEnCours="Création…"
      erreur={erreur}
    >

      <Section couleur="identite" titre="Identité" aide="Ce que le professeur saura de lui pour s'adresser à lui.">
        <div className="duo">
          <div className="champ">
            <label htmlFor="ce-prenom">Prénom</label>
            <input
              id="ce-prenom"
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
            <label htmlFor="ce-nom">Nom</label>
            <input id="ce-nom" value={champs.nom} onChange={set('nom')} required minLength={2} maxLength={100} />
          </div>
        </div>

        <div className="duo">
          <div className="champ">
            <label htmlFor="ce-age">Âge</label>
            <input id="ce-age" type="number" min={5} max={25} value={champs.age} onChange={set('age')} required />
          </div>

          <fieldset className="champ champ--choix">
            <legend>Fille ou garçon</legend>
            <div className="choix">
              {SEXES.map((option) => (
                <label
                  key={option.valeur}
                  className={`choix__option ${champs.sexe === option.valeur ? 'choix__option--actif' : ''}`}
                >
                  <input
                    type="radio"
                    name="ce-sexe"
                    value={option.valeur}
                    checked={champs.sexe === option.valeur}
                    onChange={set('sexe')}
                    required
                  />
                  {option.libelle}
                </label>
              ))}
            </div>
            <span className="champ__aide">Détermine les accords du professeur quand il lui parle.</span>
          </fieldset>
        </div>
      </Section>

      <Section couleur="scolarite" titre="Scolarité" aide="Sa classe décide de ses matières et de son programme.">
        <div className="champ">
          <label htmlFor="ce-niveau">Classe</label>
          <select id="ce-niveau" value={champs.niveauScolaireId} onChange={set('niveauScolaireId')} required>
            <option value="">Choisir une classe…</option>
            {grouperClasses(niveaux).map(([cycle, duCycle]) => (
              <optgroup key={cycle} label={cycle}>
                {duCycle.map((niveau) => (
                  <option key={niveau.id} value={niveau.id}>{niveau.libelle}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {aPreciser && (
            <span className="champ__aide champ__aide--alerte" role="alert">
              Précisez la série : sans elle, ses spécialités n’apparaissent pas.
            </span>
          )}
        </div>

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

          {languesClasse.map((langue) => (
            <label className="case" key={langue.code}>
              <input
                type="checkbox"
                checked={champs.langues.includes(langue.code)}
                onChange={() => setChamps((p) => ({ ...p, langues: basculerLangue(p.langues, langue.code) }))}
              />
              {langue.libelle} en LVB
            </label>
          ))}

          <ChoixSpecialites
            id="ce-specialites"
            nombre={specialitesClasse.nombre}
            possibles={specialitesClasse.possibles}
            valeur={champs.specialites}
            onChange={(specialites) => setChamps((p) => ({ ...p, specialites }))}
          />

          <ChoixFilierePro
            id="ce-filiere"
            filiere={filiereClasse}
            valeur={champs.filiere}
            onChange={(filiere) => setChamps((p) => ({ ...p, filiere }))}
          />
        </div>
      </Section>

      <Section couleur="lieu" titre="Où il étudie" aide="Son académie fixe ses vacances. Facultative.">
        <ChoixAcademie
          id="ce-academie"
          valeur={champs.academieId}
          onChange={(academieId) => setChamps((p) => ({ ...p, academieId }))}
          academies={academies}
        />
      </Section>
    </FenetreEditionEnfant>
  );
}
