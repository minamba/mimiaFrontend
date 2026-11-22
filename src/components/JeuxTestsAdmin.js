import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import banniere from '../assets/banban.webp';
import {
  ajouterLigneDeTest,
  ajouterTestAuJeu,
  changerStatutLigneDeTest,
  creerJeuTest,
  deplacerLigneDeTest,
  getCategoriesTests,
  getJeuTest,
  getJeuxTests,
  modifierJeuTest,
  modifierLigneDeTest,
  modifierTestDuJeu,
  supprimerJeuTest,
  supprimerLigneDeTest,
  supprimerTestDuJeu,
} from '../lib/api/jeuxTestsApi';
import { getMatieres, getNiveaux } from '../lib/api/referentielApi';
import { murMatiere, styleMatiere } from '../lib/couleurMatiere';
import {
  dateLisible, jourLisible, libelleSection, libelleStatut, lignesDuTest, positionApresDeplacement,
  SECTIONS, STATUTS_JEU, STATUTS_LIGNE, compteParStatut, regrouperParMatiere,
  CATEGORIE_MAX, CLASSE_GENERAUX, SECTION_GENERAUX, categoriesProposees, estGeneraux, sectionEtClasse,
} from '../lib/jeuxTests';
import { grouperClasses } from '../lib/niveauxScolaires';
import { exporterJeuTestEnPdf } from './JeuTestPdf';
import './jeuxTestsAdmin.css';
import { Corbeille, Crayon, Deplacer, Oeil } from './IconesActions';

/**
 * L'ONGLET « JEUX DE TESTS » — Camara, le 04/11/2026 : des carnets de test par section et
 * par classe.
 *
 * TROIS ÉTAGES : le JEU (section, classe, auteur), ses TESTS (un titre, une matière), et
 * leurs LIGNES, une par compétence à vérifier. « 5 » dans le nombre de tests crée cinq
 * lignes, chacune avec son statut, ses dates et son commentaire.
 *
 * LE STATUT D'UN JEU VIENT DU SERVEUR (`StatutsDeTest.DuJeu`) : l'écran le montre et ne le
 * calcule jamais. Chaque écriture rend le jeu relu, donc il suit tout seul.
 */

/** Le même plafond que le serveur. */
export const NOMBRE_MAX = 50;

const motifDe = (e, repli) => e?.response?.data?.message ?? repli;

/** Ce que `styleMatiere` et `murMatiere` savent lire : le code d'abord, le libellé en repli. */
const matiereDuTest = (test) => ({ matiereCode: test.matiereCode, matiereLibelle: test.matiere });

const IconeExport = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

const IconePlus = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none"
    stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Pointe vers le haut quand le bloc est ouvert (« Replier »), vers le bas quand il est replié. */
const IconeChevron = () => (
  <svg className="jeux-tests__chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none"
    stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 15l6-6 6 6" />
  </svg>
);

function BadgeJeu({ statut }) {
  return (
    <span className={`jeux-tests__badge jeux-tests__badge--${statut}`}>
      {STATUTS_JEU[statut] ?? statut}
    </span>
  );
}

function BoutonOeil({ libelle, onClick }) {
  return (
    <button type="button" className="idee-action idee-action--apercu" title="Aperçu" aria-label={libelle} onClick={onClick}>
      <Oeil />
    </button>
  );
}

function BoutonCrayon({ libelle, onClick }) {
  return (
    <button type="button" className="idee-action idee-action--modifier" title="Modifier" aria-label={libelle} onClick={onClick}>
      <Crayon />
    </button>
  );
}

/** « Déplacer » : un clic prend la ligne, un second clic y renonce. */
function BoutonDeplacer({ libelle, actif, onClick }) {
  return (
    <button
      type="button"
      className="idee-action jeux-tests__action-deplacer"
      title={actif ? 'Annuler le déplacement' : 'Déplacer'}
      aria-label={libelle}
      aria-pressed={actif}
      onClick={onClick}
    >
      <Deplacer />
    </button>
  );
}

/**
 * UN ENDROIT OÙ POSER LA LIGNE PRISE, entre deux lignes de son test. Rien juste au-dessus et juste en-dessous d'elle :
 * elle y est déjà. Au clic et non au glisser : ça marche pareil au doigt, et sur un long tableau.
 */
function Emplacement({
  depart, rang, occupe, onPlacer,
}) {
  if (depart < 0 || rang === depart || rang === depart + 1) return null;

  return (
    <tr className="jeux-tests__emplacement">
      <td colSpan={6}>
        <button
          type="button"
          className="jeux-tests__placer"
          disabled={occupe}
          onClick={() => onPlacer(positionApresDeplacement(depart, rang))}
        >
          Placer ici
        </button>
      </td>
    </tr>
  );
}

/**
 * UN LONG COMMENTAIRE NE DÉFORME PLUS LE TABLEAU — Camara, le 08/11/2026 : une colonne étroite et une ligne haute d'un
 * écran. Cinq lignes au plus ; « Lire tout » ouvre l'aperçu, seulement si le texte est vraiment coupé à cette largeur.
 */
function CommentaireCourt({ texte, libelle, onLire }) {
  const zone = useRef(null);
  const [coupe, setCoupe] = useState(false);

  useEffect(() => {
    const element = zone.current;
    if (!element) return undefined;

    const mesurer = () => setCoupe(element.scrollHeight > element.clientHeight + 1);
    mesurer();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(element);
    return () => observateur.disconnect();
  }, [texte]);

  return (
    <>
      <div ref={zone} className="jeux-tests__commentaire">{texte}</div>
      {coupe && (
        <button type="button" className="jeux-tests__lire-tout" aria-label={libelle} onClick={onLire}>
          Lire tout
        </button>
      )}
    </>
  );
}

/** Une corbeille, puis une confirmation : supprimer un jeu emporte ses tests et leurs lignes. */
function BoutonCorbeille({ libelle, occupe, onConfirmer }) {
  const [confirmer, setConfirmer] = useState(false);

  if (!confirmer) {
    return (
      <button
        type="button"
        className="idee-action idee-action--supprimer"
        title="Supprimer"
        aria-label={libelle}
        onClick={() => setConfirmer(true)}
      >
        <Corbeille />
      </button>
    );
  }

  return (
    <>
      {/* Des boutons pleins (06/11/2026) : sur la bannière illustrée, les boutons transparents disparaissaient
          dans l'image. */}
      <button
        type="button"
        className="jeux-tests__confirmer jeux-tests__confirmer--oui"
        disabled={occupe}
        onClick={onConfirmer}
      >
        Confirmer
      </button>
      <button type="button" className="jeux-tests__confirmer" onClick={() => setConfirmer(false)}>
        Annuler
      </button>
    </>
  );
}

/** Une fenêtre, fermée par Échap comme les autres. */
function Fenetre({
  titre, onFermer, enfants, pied, aDroite = null, sousTitre = null, variante = '',
}) {
  useEffect(() => {
    const surTouche = (e) => { if (e.key === 'Escape') onFermer(); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [onFermer]);

  return createPortal(
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="jeux-tests-fenetre-titre">
      <div className={`modale__boite jeux-tests__fenetre ${variante}`.trim()}>
        <div className="jeux-tests__fenetre-tete">
          <div className="jeux-tests__fenetre-ligne">
            <h3 id="jeux-tests-fenetre-titre" className="jeux-tests__fenetre-titre">{titre}</h3>
            {aDroite}
          </div>
          {sousTitre}
        </div>
        <div className="jeux-tests__fenetre-corps">{enfants}</div>
        <div className="modale__actions">{pied}</div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * LE NOM D'UN JEU DE TEST : son titre s'il en a un ; sinon, pour les jeux créés avant le
 * champ (05/11/2026), les titres de ses tests, comme la liste les montrait.
 */
export const nomDuJeu = (jeu) => (jeu?.titre?.trim()
  ? jeu.titre.trim()
  : (jeu?.titres ?? []).join(' · '));

/** « Un jeu de test » : son titre, la section, puis la classe de cette section. */
export function FormulaireJeu({
  jeu, niveaux, onEnregistre, onAnnule,
}) {
  const edition = Boolean(jeu);
  const courant = edition ? niveaux.find((n) => n.code === jeu.niveauCode) : null;

  const [titre, setTitre] = useState(jeu?.titre ?? '');
  const [section, setSection] = useState(jeu?.section ?? '');
  // TESTS GÉNÉRAUX (22/11/2026) : leur seule « classe » porte le code de la section.
  const [niveauId, setNiveauId] = useState(estGeneraux(jeu) ? SECTION_GENERAUX : (courant ? String(courant.id) : ''));
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const generaux = estGeneraux(section);
  const cycle = SECTIONS.find((s) => s.code === section)?.cycle;
  const groupes = generaux ? [] : grouperClasses(niveaux.filter((n) => n.cycle === cycle));

  const soumettre = async (evenement) => {
    evenement.preventDefault();
    setEnvoi(true);
    setErreur(null);

    // Les tests généraux n'ont pas de classe du référentiel : le serveur pose « Tests Généraux » lui-même.
    const arguments_ = generaux ? [0, titre.trim(), SECTION_GENERAUX] : [Number(niveauId), titre.trim()];

    try {
      const { data } = edition
        ? await modifierJeuTest(jeu.id, ...arguments_)
        : await creerJeuTest(...arguments_);

      onEnregistre(data);
    } catch (e) {
      setErreur(motifDe(e, "Le jeu de test n'a pas pu être enregistré."));
      setEnvoi(false);
    }
  };

  return (
    <form className="periodes-vacances__formulaire" onSubmit={soumettre}>
      <h3>{edition ? 'Modifier le jeu de test' : 'Nouveau jeu de test'}</h3>

      {erreur && <div className="alert">{erreur}</div>}

      <div className="champ">
        <label htmlFor="jeu-titre">Titre</label>
        <input
          id="jeu-titre"
          type="text"
          value={titre}
          required
          maxLength={200}
          placeholder="Par exemple : Grille de tests CP"
          onChange={(e) => setTitre(e.target.value)}
        />
      </div>

      <div className="champ">
        <label htmlFor="jeu-section">Section</label>
        <select
          id="jeu-section"
          value={section}
          required
          onChange={(e) => { setSection(e.target.value); setNiveauId(estGeneraux(e.target.value) ? SECTION_GENERAUX : ''); }}
        >
          <option value="">Choisir une section…</option>
          {SECTIONS.map((s) => <option key={s.code} value={s.code}>{s.libelle}</option>)}
        </select>
      </div>

      <div className="champ">
        <label htmlFor="jeu-classe">Classe</label>
        <select
          id="jeu-classe"
          value={niveauId}
          required
          disabled={!section}
          onChange={(e) => setNiveauId(e.target.value)}
        >
          {generaux
            ? <option value={SECTION_GENERAUX}>{CLASSE_GENERAUX}</option>
            : <option value="">{section ? 'Choisir une classe…' : 'Choisis d’abord une section'}</option>}
          {groupes.length === 1
            ? groupes[0][1].map((n) => <option key={n.id} value={n.id}>{n.libelle}</option>)
            : groupes.map(([groupe, classes]) => (
              <optgroup key={groupe} label={groupe}>
                {classes.map((n) => <option key={n.id} value={n.id}>{n.libelle}</option>)}
              </optgroup>
            ))}
        </select>
      </div>

      <div className="jeux-tests__boutons">
        <button type="submit" className="btn btn--compact" disabled={envoi || !niveauId || !titre.trim()}>
          {edition ? 'Enregistrer' : 'Créer le jeu de test'}
        </button>
        <button type="button" className="jeux-tests__bouton jeux-tests__bouton--annuler" onClick={onAnnule}>Annuler</button>
      </div>
    </form>
  );
}

/**
 * LA MATIÈRE AU PROGRAMME DE LA CLASSE : mêmes bornes que la grille de l'élève. Toutes, même
 * fermées, puisqu'on teste aussi ce qui n'est pas encore ouvert. Celle déjà choisie reste
 * proposée si la classe du jeu a changé depuis.
 */
export const matieresDeLaClasse = (matieres, niveau, codeCourant = null) => matieres
  .filter((m) => m.code === codeCourant
    || !niveau
    || (niveau.ordre >= m.niveauOrdreMin && niveau.ordre <= m.niveauOrdreMax))
  .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));

const NOUVELLE_CATEGORIE = '__nouvelle__';

/**
 * LA CATÉGORIE D'UN BLOC DES TESTS GÉNÉRAUX — Min's, le 22/11/2026 : « pas de matière (il n'y en a pas) mais des
 * catégories propres aux problèmes globaux (UX, Admin, Technique…) », avec un CHAMP DE SAISIE LIBRE pour en créer, et
 * les catégories créées reproposées ensuite. Une liste (exemples + catégories déjà employées) ; son dernier choix,
 * « Nouvelle catégorie… », ouvre la saisie libre.
 */
export function ChampCategorie({
  id, valeur, onChange, categories = [], courante = null,
}) {
  const proposees = categoriesProposees(categories, courante);
  const [libre, setLibre] = useState(false);

  return (
    <div className="champ jeux-tests__champ-categorie">
      <label htmlFor={id}>Catégorie</label>
      {libre ? (
        <>
          <input
            id={id}
            type="text"
            value={valeur}
            maxLength={CATEGORIE_MAX}
            required
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="Nouvelle catégorie, par exemple : Paiement"
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            className="jeux-tests__bouton jeux-tests__bouton--liste-categories"
            onClick={() => { setLibre(false); onChange(''); }}
          >
            Choisir dans la liste
          </button>
        </>
      ) : (
        <select
          id={id}
          value={valeur}
          required
          onChange={(e) => {
            if (e.target.value === NOUVELLE_CATEGORIE) {
              setLibre(true);
              onChange('');
            } else {
              onChange(e.target.value);
            }
          }}
        >
          <option value="">Choisir une catégorie…</option>
          {proposees.map((c) => <option key={c} value={c}>{c}</option>)}
          <option value={NOUVELLE_CATEGORIE}>+ Nouvelle catégorie…</option>
        </select>
      )}
    </div>
  );
}

/**
 * Le titre, la matière, et en création le nombre de lignes avec leurs compétences. Dans un jeu de TESTS GÉNÉRAUX
 * (`generale`), la matière laisse sa place à la catégorie.
 */
function FormulaireTest({
  test, matieres, niveau, onEnvoyer, onAnnule, generale = false, categories = [],
}) {
  const edition = Boolean(test);
  const courante = edition ? matieres.find((m) => m.code === test.matiereCode) : null;

  const [titre, setTitre] = useState(test?.titre ?? '');
  const [matiereId, setMatiereId] = useState(courante ? String(courante.id) : '');
  const [categorie, setCategorie] = useState(generale && edition ? test.matiere ?? '' : '');
  const [nombreSaisi, setNombreSaisi] = useState('1');
  const [competences, setCompetences] = useState(['']);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const proposees = matieresDeLaClasse(matieres, niveau, test?.matiereCode);

  // CE QUI EST ÉCRIT RESTE ÉCRIT quand le nombre change : passer de 5 à 3 puis revenir à 5
  // ne doit rien perdre tant que le test n'est pas créé.
  const changerNombre = (valeur) => {
    setNombreSaisi(valeur);

    const nombre = Number.parseInt(valeur, 10);
    if (nombre >= 1 && nombre <= NOMBRE_MAX) {
      setCompetences((liste) => (nombre > liste.length
        ? [...liste, ...Array(nombre - liste.length).fill('')]
        : liste));
    }
  };

  const nombre = Number.parseInt(nombreSaisi, 10);
  const nombreValide = nombre >= 1 && nombre <= NOMBRE_MAX;

  const soumettre = async (evenement) => {
    evenement.preventDefault();

    if (!edition && !nombreValide) {
      setErreur(`Le nombre de tests va de 1 à ${NOMBRE_MAX}.`);
      return;
    }
    if (generale && !categorie.trim()) {
      setErreur('Choisis une catégorie, ou écris-en une nouvelle.');
      return;
    }

    setEnvoi(true);
    setErreur(null);

    const classement = generale ? { categorie: categorie.trim() } : { matiereId: Number(matiereId) };

    try {
      await onEnvoyer(edition
        ? { titre: titre.trim(), ...classement }
        : {
          titre: titre.trim(),
          ...classement,
          nombre,
          competences: competences.slice(0, nombre).map((c) => c.trim()),
        });
    } catch (e) {
      setErreur(motifDe(e, "Le test n'a pas pu être enregistré."));
      setEnvoi(false);
    }
  };

  return (
    <form className="jeux-tests__formulaire" onSubmit={soumettre}>
      <h4 className="jeux-tests__formulaire-titre">{edition ? 'Modifier le test' : 'Nouveau test'}</h4>

      {erreur && <div className="alert">{erreur}</div>}

      <div className="jeux-tests__champs">
        <div className="champ">
          <label htmlFor="test-titre">Titre</label>
          <input
            id="test-titre"
            type="text"
            value={titre}
            maxLength={200}
            required
            onChange={(e) => setTitre(e.target.value)}
          />
        </div>

        {generale ? (
          <ChampCategorie
            id="test-categorie"
            valeur={categorie}
            onChange={setCategorie}
            categories={categories}
            courante={edition ? test.matiere : null}
          />
        ) : (
          <div className="champ">
            <label htmlFor="test-matiere">Matière</label>
            <select id="test-matiere" value={matiereId} required onChange={(e) => setMatiereId(e.target.value)}>
              <option value="">Choisir une matière…</option>
              {proposees.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}
            </select>
          </div>
        )}

        {!edition && (
          <div className="champ jeux-tests__champ-nombre">
            <label htmlFor="test-nombre">Nombre de tests à faire</label>
            <input
              id="test-nombre"
              type="number"
              min="1"
              max={NOMBRE_MAX}
              value={nombreSaisi}
              required
              onChange={(e) => changerNombre(e.target.value)}
            />
          </div>
        )}
      </div>

      {!edition && nombreValide && (
        <ol className="jeux-tests__competences">
          {competences.slice(0, nombre).map((competence, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index} className="champ">
              <input
                type="text"
                aria-label={`Compétence / test à réaliser ${index + 1}`}
                placeholder="Compétence / test à réaliser"
                value={competence}
                maxLength={1000}
                onChange={(e) => setCompetences((liste) => liste.map((c, i) => (i === index ? e.target.value : c)))}
              />
            </li>
          ))}
        </ol>
      )}

      {!edition && (
        <p className="champ__aide">Une compétence laissée vide se remplit ensuite depuis sa ligne.</p>
      )}

      <div className="jeux-tests__boutons">
        <button type="submit" className="btn btn--compact" disabled={envoi}>
          {edition ? 'Enregistrer' : (nombreValide ? `Créer ${lignesDuTest(nombre)}` : 'Créer')}
        </button>
        <button type="button" className="jeux-tests__bouton jeux-tests__bouton--annuler" onClick={onAnnule}>Annuler</button>
      </div>
    </form>
  );
}

/**
 * Les champs d'une ligne. PAS DE DATE ICI — Camara, le 08/11/2026 : le serveur pose le jour et l'heure dès qu'un élément
 * change.
 */
function FenetreLigne({ ligne, onEnvoyer, onFermer }) {
  const [competence, setCompetence] = useState(ligne.competence ?? '');
  const [statut, setStatut] = useState(ligne.statut);
  const [commentaire, setCommentaire] = useState(ligne.commentaire ?? '');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const soumettre = async () => {
    setEnvoi(true);
    setErreur(null);

    try {
      await onEnvoyer({
        competence: competence.trim(),
        statut,
        commentaire: commentaire.trim() || null,
      });
    } catch (e) {
      setErreur(motifDe(e, "La ligne n'a pas pu être enregistrée."));
      setEnvoi(false);
    }
  };

  return (
    <Fenetre
      titre="Modifier le test"
      variante="jeux-tests__fenetre--large"
      onFermer={onFermer}
      enfants={(
        <>
          {erreur && <div className="alert">{erreur}</div>}

          <div className="champ">
            <label htmlFor="ligne-competence">Compétence / test à réaliser</label>
            <textarea
              id="ligne-competence"
              rows={3}
              maxLength={1000}
              value={competence}
              onChange={(e) => setCompetence(e.target.value)}
            />
          </div>

          <div className="champ">
            <label htmlFor="ligne-statut">Statut</label>
            <select id="ligne-statut" value={statut} onChange={(e) => setStatut(e.target.value)}>
              {STATUTS_LIGNE.map((s) => <option key={s.code} value={s.code}>{s.libelle}</option>)}
            </select>
          </div>

          <p className="jeux-tests__mention">Créé le {dateLisible(ligne.dateCreation)}</p>

          <div className="champ">
            <label htmlFor="ligne-commentaire">Commentaire</label>
            <textarea
              id="ligne-commentaire"
              rows={4}
              maxLength={2000}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>
        </>
      )}
      pied={(
        <>
          <button type="button" className="jeux-tests__bouton jeux-tests__bouton--annuler" onClick={onFermer}>Annuler</button>
          <button type="button" className="btn btn--compact" disabled={envoi} onClick={soumettre}>Enregistrer</button>
        </>
      )}
    />
  );
}

/**
 * Le bouton en forme d'œil : voir un test sans risquer de le modifier.
 *
 * L'EN-TÊTE DIT CE QU'EST CE TEST, LE CORPS CE QU'ON EN SAIT — Camara, le 04/11/2026 : « que
 * l'aperçu soit plus propre ». Tout empilé en une colonne, un long commentaire noyait le
 * reste. Le statut, la matière et la classe restent donc visibles quand le corps défile.
 */
function FenetreApercu({
  jeu, test, ligne, onModifier, onFermer,
}) {
  return (
    <Fenetre
      titre={test.titre}
      variante="jeux-tests__fenetre--apercu"
      onFermer={onFermer}
      aDroite={<span className={`jeux-tests__puce jeux-tests__puce--${ligne.statut}`}>{libelleStatut(ligne.statut)}</span>}
      sousTitre={(
        <p className="jeux-tests__test-details" style={styleMatiere(matiereDuTest(test))}>
          <span className="jeux-tests__test-matiere">{test.matiere}</span>
          <span className="jeux-tests__test-compte">{sectionEtClasse(jeu)}</span>
        </p>
      )}
      enfants={(
        <div className="jeux-tests__apercu">
          <section className="jeux-tests__bloc jeux-tests__bloc--competence">
            <h4 className="jeux-tests__bloc-titre">Compétence / test à réaliser</h4>
            <p className="jeux-tests__texte">
              {ligne.competence || <em className="jeux-tests__a-remplir">À renseigner</em>}
            </p>
          </section>

          <div className="jeux-tests__dates">
            <section className="jeux-tests__bloc jeux-tests__bloc--creation">
              <h4 className="jeux-tests__bloc-titre">Créé le</h4>
              <p className="jeux-tests__texte">{dateLisible(ligne.dateCreation)}</p>
            </section>
            <section className="jeux-tests__bloc jeux-tests__bloc--effectue">
              <h4 className="jeux-tests__bloc-titre">Effectué le</h4>
              <p className="jeux-tests__texte">{jourLisible(ligne.dateEffectuee)}</p>
            </section>
          </div>

          <section className="jeux-tests__bloc jeux-tests__bloc--commentaire">
            <h4 className="jeux-tests__bloc-titre">Commentaire</h4>
            <p className="jeux-tests__texte">
              {ligne.commentaire || <em className="jeux-tests__a-remplir">Aucun commentaire</em>}
            </p>
          </section>
        </div>
      )}
      pied={(
        <>
          <button type="button" className="btn-ghost" onClick={onModifier}>Modifier</button>
          <button type="button" className="btn btn--compact" onClick={onFermer}>Fermer</button>
        </>
      )}
    />
  );
}

/** Un jeu ouvert : ses tests, et sur chaque ligne le statut, les dates et les actions. */
function FicheJeu({
  jeuId, niveaux, matieres, ajoutOuvert, onRetour, ligneCible = null,
}) {
  const [jeu, setJeu] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [ajout, setAjout] = useState(ajoutOuvert);
  const [testEdite, setTestEdite] = useState(null);
  const [occupe, setOccupe] = useState(null);
  const [exportEnCours, setExportEnCours] = useState(false);

  // Des identifiants et non des objets : la fenêtre suit ainsi le jeu relu.
  const [ligneEditee, setLigneEditee] = useState(null);
  const [ligneVue, setLigneVue] = useState(null);

  // LA LIGNE QU'ON DÉPLACE (08/11/2026) : Échap y renonce.
  const [ligneDeplacee, setLigneDeplacee] = useState(null);
  useEffect(() => {
    if (!ligneDeplacee) return undefined;
    const surTouche = (e) => { if (e.key === 'Escape') setLigneDeplacee(null); };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [ligneDeplacee]);

  // LES BLOCS REPLIÉS — Camara, le 05/11/2026 : « un bouton Déplier / Replier ; replié, on voit
  // juste le titre avec le nombre de lignes du bloc », et « par défaut c'est plié ». On garde donc
  // les blocs DÉPLIÉS : tout le reste est replié. Un bloc où l'on vient d'ajouter quelque chose
  // s'ouvre seul, sinon la nouvelle ligne serait cachée.
  const [deplies, setDeplies] = useState(() => new Set());
  const replie = (id) => !deplies.has(id);
  const basculerBloc = (id) => setDeplies((avant) => {
    const apres = new Set(avant);
    if (apres.has(id)) apres.delete(id); else apres.add(id);
    return apres;
  });
  const deplier = (id) => setDeplies((avant) => new Set(avant).add(id));

  useEffect(() => {
    let vivant = true;

    getJeuTest(jeuId)
      .then(({ data }) => { if (vivant) setJeu(data); })
      .catch((e) => { if (vivant) setErreur(motifDe(e, "Ce jeu de test n'a pas pu être chargé.")); });

    return () => { vivant = false; };
  }, [jeuId]);

  // LES CATÉGORIES DÉJÀ EMPLOYÉES (tests généraux, 22/11/2026), relues après chaque bloc ajouté ou modifié. Une panne
  // ne bloque rien : la liste garde ses exemples et la saisie libre.
  const [categories, setCategories] = useState([]);
  const generale = estGeneraux(jeu);
  const relireCategories = useCallback(() => getCategoriesTests()
    .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
    .catch(() => {}), []);
  useEffect(() => { if (generale) relireCategories(); }, [generale, relireCategories]);

  // LA LIGNE D'UN SIGNALEMENT (06/11/2026) : son bloc se déplie, l'écran descend jusqu'à elle, et elle reste
  // en évidence le temps de la repérer. Une seule fois, au premier chargement du jeu.
  const [ligneEnEvidence, setLigneEnEvidence] = useState(null);
  const cibleTraitee = useRef(false);
  useEffect(() => {
    if (!jeu || !ligneCible || cibleTraitee.current) return undefined;
    cibleTraitee.current = true;

    const test = jeu.tests.find((t) => t.lignes.some((l) => l.id === ligneCible));
    if (!test) return undefined;
    deplier(test.id);
    setLigneEnEvidence(ligneCible);

    let essais = 0;
    let fini = false;
    const viser = () => {
      if (fini) return;
      const rangee = document.getElementById(`jeux-tests-ligne-${ligneCible}`);
      if (!rangee) {
        essais += 1;
        if (essais < 60) window.requestAnimationFrame(viser);
        return;
      }
      const doux = !window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      rangee.scrollIntoView?.({ behavior: doux ? 'smooth' : 'auto', block: 'center' });
    };
    window.requestAnimationFrame(viser);

    return () => { fini = true; };
  }, [jeu, ligneCible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ligneEnEvidence) return undefined;
    const extinction = window.setTimeout(() => setLigneEnEvidence(null), 6000);
    return () => window.clearTimeout(extinction);
  }, [ligneEnEvidence]);

  /** Une écriture qui peut échouer sans fermer ce qui est ouvert : le motif s'affiche en haut. */
  const agir = async (cle, appel, repli) => {
    setOccupe(cle);
    setErreur(null);

    try {
      const { data } = await appel();
      setJeu(data);
    } catch (e) {
      setErreur(motifDe(e, repli));
    } finally {
      setOccupe(null);
    }
  };

  /** La ligne posée reste en évidence un instant : c'est elle qu'on cherche des yeux à sa nouvelle place. */
  const placer = (ligneId, position) => {
    setLigneDeplacee(null);
    setLigneEnEvidence(ligneId);
    return agir(`deplacer-${ligneId}`, () => deplacerLigneDeTest(jeu.id, ligneId, position), "La ligne n'a pas pu être déplacée.");
  };

  const exporter = async () => {
    setExportEnCours(true);
    setErreur(null);

    try {
      await exporterJeuTestEnPdf(jeu);
    } catch {
      setErreur("Le PDF n'a pas pu être créé. Tu peux réessayer ?");
    } finally {
      setExportEnCours(false);
    }
  };

  if (!jeu) {
    return (
      <div className="jeux-tests">
        <button type="button" className="jeux-tests__bouton jeux-tests__bouton--retour jeux-tests__retour" onClick={onRetour}>← Tous les jeux de test</button>
        {erreur ? <div className="alert">{erreur}</div> : <p className="etat-vide">Chargement…</p>}
      </div>
    );
  }

  const niveau = niveaux.find((n) => n.code === jeu.niveauCode);
  const trouver = (ligneId) => {
    const test = jeu.tests.find((t) => t.lignes.some((l) => l.id === ligneId));
    return test ? { test, ligne: test.lignes.find((l) => l.id === ligneId) } : null;
  };
  const enEdition = ligneEditee ? trouver(ligneEditee) : null;
  const enApercu = ligneVue ? trouver(ligneVue) : null;

  return (
    <div className="jeux-tests">
      <button type="button" className="jeux-tests__bouton jeux-tests__bouton--retour jeux-tests__retour" onClick={onRetour}>← Tous les jeux de test</button>

      <div className="jeux-tests__entete">
        <div>
          <h2 className="signalements__titre">{jeu.titre?.trim() || sectionEtClasse(jeu)}</h2>
          <p className="signalements__sous-titre">
            {jeu.titre?.trim() ? `${sectionEtClasse(jeu)} · ` : ''}{jeu.auteur} · créé le {dateLisible(jeu.dateCreation)} · {jeu.nombreOk} sur {lignesDuTest(jeu.nombreLignes)} OK
          </p>
        </div>
        <div className="jeux-tests__entete-droite">
          <button
            type="button"
            className="jeux-tests__bouton jeux-tests__bouton--export"
            disabled={exportEnCours || jeu.tests.length === 0}
            onClick={exporter}
          >
            <IconeExport />
            {exportEnCours ? 'Préparation…' : 'Exporter en PDF'}
          </button>
          <BadgeJeu statut={jeu.statut} />
        </div>
      </div>

      {erreur && <div className="alert">{erreur}</div>}

      {ajout ? (
        <FormulaireTest
          matieres={matieres}
          niveau={niveau}
          generale={generale}
          categories={categories}
          onAnnule={() => setAjout(false)}
          onEnvoyer={async (donnees) => {
            const avant = new Set(jeu.tests.map((t) => t.id));
            const { data } = await ajouterTestAuJeu(jeu.id, donnees);
            (data?.tests ?? []).filter((t) => !avant.has(t.id)).forEach((t) => deplier(t.id));
            setJeu(data);
            setAjout(false);
            if (generale) relireCategories();
          }}
        />
      ) : (
        <button type="button" className="btn btn--compact jeux-tests__ajouter" onClick={() => setAjout(true)}>
          Ajouter un test
        </button>
      )}

      {jeu.tests.length === 0 && !ajout && <p className="etat-vide">Aucun test dans ce jeu.</p>}

      {/* REGROUPÉS PAR MATIÈRE — Camara, le 07/11/2026. Un titre par matière, ses tests dessous. */}
      {regrouperParMatiere(jeu.tests).map((groupe) => (
        <div key={groupe.cle} className="jeux-tests__groupe">
          <h3 className="jeux-tests__groupe-titre" style={styleMatiere({ matiereCode: groupe.matiereCode, matiereLibelle: groupe.matiere })}>
            {groupe.matiere}
            <span className="jeux-tests__groupe-compte">{groupe.tests.length} test{groupe.tests.length > 1 ? 's' : ''}</span>
          </h3>
      {groupe.tests.map((test) => (
        <section key={test.id} className="jeux-tests__test" style={styleMatiere(matiereDuTest(test))}>
          {testEdite === test.id ? (
            <FormulaireTest
              test={test}
              matieres={matieres}
              niveau={niveau}
              generale={generale}
              categories={categories}
              onAnnule={() => setTestEdite(null)}
              onEnvoyer={async (donnees) => {
                const { data } = await modifierTestDuJeu(jeu.id, test.id, donnees);
                setJeu(data);
                setTestEdite(null);
                if (generale) relireCategories();
              }}
            />
          ) : (
            <div className="jeux-tests__banniere" data-mur={murMatiere(matiereDuTest(test))}>
              <div className="jeux-tests__test-nom">
                <h3 className="jeux-tests__test-titre">{test.titre}</h3>
                <p className="jeux-tests__test-details">
                  <span className="jeux-tests__test-matiere">{test.matiere}</span>
                  <span className="jeux-tests__test-compte">{lignesDuTest(test.lignes.length)}</span>
                  {test.lignes.length > 0 && (
                    <span className="jeux-tests__compte-statuts" aria-label="Lignes par statut">
                      {compteParStatut(test.lignes).map(({ code, libelle, nombre }) => (
                        <span
                          key={code}
                          className={`jeux-tests__compte-statut jeux-tests__puce--${code}${nombre === 0 ? ' jeux-tests__compte-statut--zero' : ''}`}
                          title={`${nombre} ${libelleStatut(code)}`}
                        >
                          {libelle} <strong>{nombre}</strong>
                        </span>
                      ))}
                    </span>
                  )}
                </p>
              </div>
              <div className="jeux-tests__actions">
                {test.lignes.length > 0 && (
                  <button
                    type="button"
                    className={`jeux-tests__bouton jeux-tests__bouton--replier${replie(test.id) ? ' jeux-tests__bouton--replie' : ''}`}
                    aria-expanded={!replie(test.id)}
                    aria-controls={`jeux-tests-lignes-${test.id}`}
                    aria-label={`${replie(test.id) ? 'Déplier' : 'Replier'} le test ${test.titre}`}
                    onClick={() => basculerBloc(test.id)}
                  >
                    <IconeChevron />
                    {replie(test.id) ? 'Déplier' : 'Replier'}
                  </button>
                )}
                <button
                  type="button"
                  className="jeux-tests__bouton jeux-tests__bouton--ajout"
                  disabled={occupe === `ajout-${test.id}`}
                  onClick={() => { deplier(test.id); agir(`ajout-${test.id}`, () => ajouterLigneDeTest(jeu.id, test.id), "La ligne n'a pas pu être ajoutée."); }}
                >
                  <IconePlus />
                  Ajouter une ligne
                </button>
                <BoutonCrayon libelle={`Modifier le test ${test.titre}`} onClick={() => setTestEdite(test.id)} />
                <BoutonCorbeille
                  libelle={`Supprimer le test ${test.titre}`}
                  occupe={occupe === `test-${test.id}`}
                  onConfirmer={() => agir(`test-${test.id}`, () => supprimerTestDuJeu(jeu.id, test.id), "Le test n'a pas pu être supprimé.")}
                />
              </div>
            </div>
          )}

          {test.lignes.length > 0 && !replie(test.id) && (
            <div className="tableau" id={`jeux-tests-lignes-${test.id}`}>
              <table className="jeux-tests__lignes">
                <thead>
                  <tr>
                    <th scope="col">Compétence / test à réaliser</th>
                    <th scope="col">Statut</th>
                    <th scope="col">Créé le</th>
                    <th scope="col">Effectué le</th>
                    <th scope="col">Commentaire</th>
                    <th scope="col"><span className="visuellement-cache">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {test.lignes.map((ligne, index) => {
                    const nom = ligne.competence || `ligne ${index + 1}`;
                    const classes = [
                      ligne.id === ligneEnEvidence && 'jeux-tests__ligne--ciblee',
                      ligne.id === ligneDeplacee && 'jeux-tests__ligne--deplacee',
                    ].filter(Boolean).join(' ');

                    return (
                      <Fragment key={ligne.id}>
                      <Emplacement
                        depart={test.lignes.findIndex((l) => l.id === ligneDeplacee)}
                        rang={index}
                        occupe={occupe !== null}
                        onPlacer={(position) => placer(ligneDeplacee, position)}
                      />
                      <tr
                        id={`jeux-tests-ligne-${ligne.id}`}
                        className={classes || undefined}
                      >
                        <td className="jeux-tests__cellule-competence">
                          {ligne.competence || <em className="jeux-tests__a-remplir">À renseigner</em>}
                        </td>
                        <td className="jeux-tests__cellule-statut">
                          <select
                            className={`jeux-tests__statut jeux-tests__statut--${ligne.statut}`}
                            aria-label={`Statut de ${nom}`}
                            value={ligne.statut}
                            disabled={occupe === `statut-${ligne.id}`}
                            onChange={(e) => agir(
                              `statut-${ligne.id}`,
                              () => changerStatutLigneDeTest(jeu.id, ligne.id, e.target.value),
                              "Le statut n'a pas pu être changé.",
                            )}
                          >
                            {STATUTS_LIGNE.map((s) => <option key={s.code} value={s.code}>{s.libelle}</option>)}
                          </select>
                        </td>
                        <td className="jeux-tests__cellule-date" data-libelle="Créé le">{dateLisible(ligne.dateCreation)}</td>
                        <td className="jeux-tests__cellule-date" data-libelle="Effectué le">{jourLisible(ligne.dateEffectuee)}</td>
                        <td className="jeux-tests__cellule-commentaire">
                          {ligne.commentaire && (
                            <CommentaireCourt
                              texte={ligne.commentaire}
                              libelle={`Lire tout le commentaire de ${nom}`}
                              onLire={() => setLigneVue(ligne.id)}
                            />
                          )}
                        </td>
                        <td className="jeux-tests__cellule-actions">
                          <div className="jeux-tests__actions">
                            <BoutonOeil libelle={`Aperçu de ${nom}`} onClick={() => setLigneVue(ligne.id)} />
                            {test.lignes.length > 1 && (
                              <BoutonDeplacer
                                libelle={`Déplacer ${nom}`}
                                actif={ligne.id === ligneDeplacee}
                                onClick={() => setLigneDeplacee((avant) => (avant === ligne.id ? null : ligne.id))}
                              />
                            )}
                            <BoutonCrayon libelle={`Modifier ${nom}`} onClick={() => setLigneEditee(ligne.id)} />
                            <BoutonCorbeille
                              libelle={`Supprimer ${nom}`}
                              occupe={occupe === `ligne-${ligne.id}`}
                              onConfirmer={() => agir(`ligne-${ligne.id}`, () => supprimerLigneDeTest(jeu.id, ligne.id), "La ligne n'a pas pu être supprimée.")}
                            />
                          </div>
                        </td>
                      </tr>
                      </Fragment>
                    );
                  })}
                  <Emplacement
                    depart={test.lignes.findIndex((l) => l.id === ligneDeplacee)}
                    rang={test.lignes.length}
                    occupe={occupe !== null}
                    onPlacer={(position) => placer(ligneDeplacee, position)}
                  />
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
        </div>
      ))}

      {enApercu && (
        <FenetreApercu
          jeu={jeu}
          test={enApercu.test}
          ligne={enApercu.ligne}
          onFermer={() => setLigneVue(null)}
          onModifier={() => { setLigneEditee(enApercu.ligne.id); setLigneVue(null); }}
        />
      )}

      {enEdition && (
        <FenetreLigne
          key={enEdition.ligne.id}
          ligne={enEdition.ligne}
          onFermer={() => setLigneEditee(null)}
          onEnvoyer={async (donnees) => {
            const { data } = await modifierLigneDeTest(jeu.id, enEdition.ligne.id, donnees);
            setJeu(data);
            setLigneEditee(null);
          }}
        />
      )}
    </div>
  );
}

/** La liste générale : section, classe, titres, auteur et statut de chaque jeu. */
export default function JeuxTestsAdmin({ cible = null, onCibleVue = null }) {
  const [jeux, setJeux] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [formulaire, setFormulaire] = useState(null);
  const [ouvert, setOuvert] = useState(null);
  const [occupe, setOccupe] = useState(null);
  const [enExport, setEnExport] = useState(null);

  const charger = useCallback(() => getJeuxTests()
    .then(({ data }) => setJeux(Array.isArray(data) ? data : []))
    .catch(() => setErreur("Les jeux de test n'ont pas pu être chargés."))
    .finally(() => setChargement(false)), []);

  useEffect(() => {
    charger();
    getNiveaux().then(({ data }) => setNiveaux(Array.isArray(data) ? data : [])).catch(() => {
      setErreur('Les classes n’ont pas pu être chargées.');
    });
    getMatieres().then(({ data }) => setMatieres(Array.isArray(data) ? data : [])).catch(() => {
      setErreur('Les matières n’ont pas pu être chargées.');
    });
  }, [charger]);

  // VENU D'UN SIGNALEMENT ADMIN (06/11/2026) : le jeu s'ouvre sur la ligne du signalement. La cible est rendue
  // aussitôt, pour que revenir plus tard sur l'onglet montre la liste.
  useEffect(() => {
    if (!cible?.jeuId) return;
    setFormulaire(null);
    setOuvert({ id: cible.jeuId, ligne: cible.ligneId ?? null, cle: cible.cle });
    onCibleVue?.();
  }, [cible]); // eslint-disable-line react-hooks/exhaustive-deps

  const supprimer = async (jeu) => {
    setOccupe(jeu.id);
    setErreur(null);

    try {
      await supprimerJeuTest(jeu.id);
      setJeux((liste) => liste.filter((j) => j.id !== jeu.id));
    } catch (e) {
      setErreur(motifDe(e, "Le jeu de test n'a pas pu être supprimé."));
    } finally {
      setOccupe(null);
    }
  };

  /** La liste ne porte pas le détail des tests : le jeu complet se relit au moment du clic. */
  const exporter = async (jeu) => {
    setEnExport(jeu.id);
    setErreur(null);

    try {
      const { data } = await getJeuTest(jeu.id);
      await exporterJeuTestEnPdf(data);
    } catch {
      setErreur("Le PDF n'a pas pu être créé. Tu peux réessayer ?");
    } finally {
      setEnExport(null);
    }
  };

  if (ouvert) {
    return (
      <FicheJeu
        key={`${ouvert.id}-${ouvert.cle ?? ''}`}
        jeuId={ouvert.id}
        ligneCible={ouvert.ligne ?? null}
        ajoutOuvert={ouvert.neuf}
        niveaux={niveaux}
        matieres={matieres}
        onRetour={() => { setOuvert(null); charger(); }}
      />
    );
  }

  if (formulaire) {
    const jeu = formulaire === 'nouveau' ? null : formulaire;

    return (
      <div className="jeux-tests">
        <button type="button" className="jeux-tests__bouton jeux-tests__bouton--retour jeux-tests__retour" onClick={() => setFormulaire(null)}>
          ← Tous les jeux de test
        </button>

        <FormulaireJeu
          jeu={jeu}
          niveaux={niveaux}
          onAnnule={() => setFormulaire(null)}
          onEnregistre={(enregistre) => {
            setFormulaire(null);

            // UN JEU NEUF S'OUVRE SUR L'AJOUT DE SON PREMIER TEST : c'est la suite du geste.
            if (jeu) charger();
            else setOuvert({ id: enregistre.id, neuf: true });
          }}
        />
      </div>
    );
  }

  return (
    <div className="jeux-tests">
      {/* LE TITRE EST DANS L'IMAGE : il reste écrit pour les lecteurs d'écran. */}
      <div className="jeux-tests__entete jeux-tests__entete--liste">
        <div className="jeux-tests__banniere-page">
          <img src={banniere} alt="" className="jeux-tests__banniere-image" />
          <h2 className="visuellement-cache">Jeux de tests</h2>
        </div>

        <div className="jeux-tests__entete-actions">
          <p className="signalements__sous-titre">
            {jeux.length === 0
              ? 'Aucun jeu de test pour le moment.'
              : `${jeux.length} jeu${jeux.length > 1 ? 'x' : ''} de test.`}
          </p>
          <button type="button" className="btn btn--compact" onClick={() => setFormulaire('nouveau')}>
            Ajouter un nouveau jeu de test
          </button>
        </div>
      </div>

      {erreur && <div className="alert">{erreur}</div>}

      {chargement && <p className="etat-vide">Chargement…</p>}

      {jeux.length > 0 && (
        <div className="tableau">
          <table className="jeux-tests__liste">
            <thead>
              <tr>
                <th scope="col">Section</th>
                <th scope="col">Classe</th>
                <th scope="col">Titre</th>
                <th scope="col">Auteur</th>
                <th scope="col">Créé le</th>
                <th scope="col">Statut</th>
                <th scope="col"><span className="visuellement-cache">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {jeux.map((jeu) => {
                const nom = estGeneraux(jeu) ? CLASSE_GENERAUX : `${libelleSection(jeu.section)} ${jeu.classe}`;

                return (
                  <tr key={jeu.id}>
                    <td className="jeux-tests__cellule-section">{libelleSection(jeu.section)}</td>
                    <td className="jeux-tests__cellule-classe">{jeu.classe}</td>
                    <td className="jeux-tests__cellule-titres">
                      {nomDuJeu(jeu)
                        ? nomDuJeu(jeu)
                        : <em className="jeux-tests__a-remplir">Sans titre</em>}
                    </td>
                    <td className="jeux-tests__cellule-auteur">{jeu.auteur}</td>
                    <td className="jeux-tests__cellule-date" data-libelle="Créé le">{dateLisible(jeu.dateCreation)}</td>
                    <td className="jeux-tests__cellule-badge"><BadgeJeu statut={jeu.statut} /></td>
                    <td className="jeux-tests__cellule-actions">
                      <div className="jeux-tests__actions">
                        <BoutonOeil libelle={`Ouvrir le jeu de test ${nom}`} onClick={() => setOuvert({ id: jeu.id, neuf: false })} />
                        <button
                          type="button"
                          className="idee-action jeux-tests__action-export"
                          title={jeu.titres.length === 0 ? 'Aucun test à exporter' : 'Exporter en PDF'}
                          aria-label={`Exporter en PDF le jeu de test ${nom}`}
                          aria-busy={enExport === jeu.id}
                          disabled={enExport !== null || jeu.titres.length === 0}
                          onClick={() => exporter(jeu)}
                        >
                          <IconeExport />
                        </button>
                        <BoutonCrayon libelle={`Modifier le jeu de test ${nom}`} onClick={() => setFormulaire(jeu)} />
                        <BoutonCorbeille
                          libelle={`Supprimer le jeu de test ${nom}`}
                          occupe={occupe === jeu.id}
                          onConfirmer={() => supprimer(jeu)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
