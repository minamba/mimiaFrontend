import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ajouterPieceSignalement, creerSignalementAdmin } from '../lib/api/adminApi';
import { ajouterTestAuJeu, getJeuTest, getJeuxTests } from '../lib/api/jeuxTestsApi';
import { getMatieres, getNiveaux } from '../lib/api/referentielApi';
import { CATEGORIES, IconeDrapeau } from './BoutonSignalement';
import ChoixPiecesSignalement from './ChoixPiecesSignalement';
// signaladmin.png de Camara (06/11/2026), réduite à 160 px comme les deux autres icônes de la bulle.
import iconeSignalAdmin from '../assets/icone-signaladmin-160.png';
import { FormulaireJeu, matieresDeLaClasse, nomDuJeu } from './JeuxTestsAdmin';

const LONGUEUR_MAX = 2000;
const SECTIONS = { elementaire: 'Élémentaire', college: 'Collège', lycee: 'Lycée' };

/** « Grille de tests CP — Élémentaire CP » : de quoi reconnaître un jeu dans la liste. */
const libelleJeu = (jeu) => [nomDuJeu(jeu) || 'Sans titre', [SECTIONS[jeu.section] ?? jeu.section, jeu.classe].filter(Boolean).join(' ')]
  .join(' — ');

/**
 * UN NOUVEAU JEU DE TEST, SANS QUITTER LE SIGNALEMENT — Camara, le 05/11/2026 : le formulaire de création du jeu,
 * puis « Ajouter un test » réduit au titre et à la matière, une seule ligne : c'est elle que le signalement remplit.
 */
export function FenetreNouveauJeu({ onTermine, onAnnule }) {
  const [niveaux, setNiveaux] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [jeu, setJeu] = useState(null);
  const [titre, setTitre] = useState('');
  const [matiereId, setMatiereId] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getNiveaux().then(({ data }) => setNiveaux(Array.isArray(data) ? data : [])).catch(() => setErreur('Les classes n’ont pas pu être chargées.'));
    getMatieres().then(({ data }) => setMatieres(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const niveau = jeu ? niveaux.find((n) => n.code === jeu.niveauCode) : null;
  const proposees = jeu ? matieresDeLaClasse(matieres, niveau) : [];

  const creerTest = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const avant = new Set((jeu.tests ?? []).map((t) => t.id));
      const { data } = await ajouterTestAuJeu(jeu.id, { titre: titre.trim(), matiereId: Number(matiereId), nombre: 1, competences: [''] });
      const test = (data?.tests ?? []).find((t) => !avant.has(t.id));
      onTermine(data, test ?? null);
    } catch (er) {
      setErreur(er?.response?.data?.message ?? 'Le test n’a pas pu être créé.');
      setEnvoi(false);
    }
  };

  return createPortal(
    <div className="modale signalement-admin-jeu" role="dialog" aria-modal="true" aria-label="Nouveau jeu de test">
      <div className="modale__boite modale__boite--signalement">
        <div className="modale__corps">
          {erreur && <div className="alert">{erreur}</div>}

          {!jeu ? (
            <FormulaireJeu
              jeu={null}
              niveaux={niveaux}
              onEnregistre={(cree) => setJeu({ ...cree, tests: cree?.tests ?? [] })}
              onAnnule={onAnnule}
            />
          ) : (
            <form className="periodes-vacances__formulaire" onSubmit={creerTest}>
              <h3>Ajouter un test</h3>
              <p className="champ__aide">Jeu « {nomDuJeu(jeu) || jeu.classe} » créé. Il lui faut un bloc : son titre et sa matière.</p>

              <div className="champ">
                <label htmlFor="nouveau-test-titre">Titre</label>
                <input id="nouveau-test-titre" type="text" value={titre} maxLength={200} required
                  placeholder="Par exemple : Test Français" onChange={(e) => setTitre(e.target.value)} />
              </div>

              <div className="champ">
                <label htmlFor="nouveau-test-matiere">Matière</label>
                <select id="nouveau-test-matiere" value={matiereId} required onChange={(e) => setMatiereId(e.target.value)}>
                  <option value="">Choisir une matière…</option>
                  {proposees.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                </select>
              </div>

              <div className="jeux-tests__boutons">
                <button type="submit" className="btn btn--compact" disabled={envoi || !titre.trim() || !matiereId}>Créer le test</button>
                <button type="button" className="jeux-tests__bouton jeux-tests__bouton--annuler" onClick={() => onTermine(jeu, null)}>Plus tard</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * LE SIGNALEMENT D'UN ADMINISTRATEUR — Camara, le 05/11/2026 : le bouton à côté du bouclier. Les mêmes catégories et
 * la même description que le « Signaler » des parents, et en plus de quoi le RATTACHER À UN JEU DE TEST : la
 * compétence, le jeu, puis son bloc. Enregistré, il pose une ligne « KO » dans ce bloc (compétence = le champ,
 * commentaire = la description). Il se retrouve dans l'onglet « Signalements Admin ».
 */
export default function BoutonSignalementAdmin() {
  const [ouvert, setOuvert] = useState(false);
  const [envoye, setEnvoye] = useState(null);
  const [categorie, setCategorie] = useState('TECHNIQUE');
  const [description, setDescription] = useState('');
  const [competence, setCompetence] = useState('');
  const [fichiers, setFichiers] = useState([]);
  const [jeux, setJeux] = useState([]);
  const [jeuId, setJeuId] = useState('');
  const [jeu, setJeu] = useState(null);
  const [testId, setTestId] = useState('');
  const [nouveauJeu, setNouveauJeu] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [nonJoints, setNonJoints] = useState([]);
  // Un premier clic sur « Enregistrer » a eu lieu : on dit alors ce qui manque.
  const [tente, setTente] = useState(false);

  const fermer = () => {
    setOuvert(false);
    setEnvoye(null);
    setCategorie('TECHNIQUE');
    setDescription('');
    setCompetence('');
    setFichiers([]);
    setJeuId('');
    setJeu(null);
    setTestId('');
    setErreur(null);
    setNonJoints([]);
    setTente(false);
  };

  useEffect(() => {
    if (!ouvert) return undefined;
    getJeuxTests().then(({ data }) => setJeux(Array.isArray(data) ? data : [])).catch(() => setJeux([]));
    const auClavier = (e) => { if (e.key === 'Escape' && !nouveauJeu) fermer(); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [ouvert, nouveauJeu]);

  // Le jeu choisi : ses blocs.
  useEffect(() => {
    if (!jeuId) { setJeu(null); return; }
    let actif = true;
    getJeuTest(Number(jeuId))
      .then(({ data }) => { if (actif) setJeu(data); })
      .catch(() => { if (actif) setErreur('Les blocs de ce jeu n’ont pas pu être chargés.'); });
    return () => { actif = false; };
  }, [jeuId]);

  const relie = Boolean(jeuId);

  // CE QUI MANQUE, DIT EN CLAIR — Camara, le 06/11/2026 : « impossible d'enregistrer ». Le bouton se grisait
  // sans dire pourquoi (la compétence était vide). Il reste cliquable : le clic dit ce qui manque et met le
  // curseur dans le champ.
  const aCorriger = (() => {
    if (!description.trim()) return { champ: 'signalement-admin-description', texte: 'Écris la description du problème.' };
    if (relie && !testId) return { champ: 'signalement-admin-bloc', texte: 'Choisis le bloc du jeu de test.' };
    if (relie && !competence.trim()) {
      return {
        champ: 'signalement-admin-competence',
        texte: 'Remplis « Compétence / test à réaliser » : c’est le texte de la ligne posée dans le jeu de test.',
      };
    }
    return null;
  })();
  const rappel = tente && aCorriger ? aCorriger : null;

  const soumettre = async (e) => {
    e.preventDefault();
    if (aCorriger) {
      setTente(true);
      const champ = document.getElementById(aCorriger.champ);
      champ?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      champ?.focus?.({ preventScroll: true });
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      const { data } = await creerSignalementAdmin({
        categorie,
        description: description.trim(),
        competence: competence.trim(),
        jeuId: relie ? Number(jeuId) : null,
        testId: relie ? Number(testId) : null,
      });
      const resultats = await Promise.allSettled(fichiers.map((f) => ajouterPieceSignalement(data?.id, f)));
      setNonJoints(fichiers.filter((_, i) => resultats[i].status === 'rejected').map((f) => f.name));
      const bloc = jeu?.tests?.find((t) => String(t.id) === String(testId));
      setEnvoye({ jeu: relie ? (nomDuJeu(jeu) || jeu?.classe) : null, bloc: bloc?.titre ?? null });
    } catch (er) {
      setErreur(er?.response?.data?.message ?? 'L’envoi a échoué. Réessaie dans un instant.');
    } finally {
      setEnvoi(false);
    }
  };

  const jeuCree = (cree, test) => {
    setNouveauJeu(false);
    if (!cree) return;
    setJeux((liste) => [cree, ...liste.filter((j) => j.id !== cree.id)]);
    setJeuId(String(cree.id));
    setJeu(cree);
    setTestId(test ? String(test.id) : '');
  };

  return (
    <>
      <button
        type="button"
        className="bouton-mails bouton-mails--signalement"
        aria-label="Signalement admin"
        title="Signalement admin, relié aux jeux de test"
        onClick={() => setOuvert(true)}
      >
        <img src={iconeSignalAdmin} alt="" width="64" height="64" />
      </button>

      {ouvert && createPortal(
        <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-signalement-admin">
          <div className="modale__boite modale__boite--signalement">
            {envoye ? (
              <div className="signalement-envoye">
                <h2 id="titre-signalement-admin">Signalement enregistré</h2>
                <p className="modale__texte">
                  {envoye.jeu
                    ? <>Il est dans l’onglet « Signalements Admin », et la ligne est ajoutée au jeu « {envoye.jeu} », bloc « {envoye.bloc} », en statut KO.</>
                    : <>Il est dans l’onglet « Signalements Admin ».</>}
                </p>
                {nonJoints.length > 0 && (
                  <div className="alert" role="alert">Ces fichiers n’ont pas pu être joints : {nonJoints.join(', ')}.</div>
                )}
                <div className="modale__actions">
                  <button type="button" className="btn" onClick={fermer}>Fermer</button>
                </div>
              </div>
            ) : (
              <form onSubmit={soumettre} className="signalement-modale__formulaire" noValidate>
                <header className="signalement-modale__entete">
                  <span className="signalement-modale__badge" aria-hidden="true"><IconeDrapeau /></span>
                  <div>
                    <h2 id="titre-signalement-admin" className="signalement-modale__titre">Signalement admin</h2>
                    <p className="modale__texte signalement-modale__intro">
                      Réservé aux administrateurs. Relie-le à un jeu de test pour qu’il y devienne une ligne à corriger.
                    </p>
                  </div>
                </header>

                <div className="modale__corps">
                  {erreur && <div className="alert">{erreur}</div>}

                  <span className="champ__intitule">Catégorie</span>
                  <div className="signalement-modale__categories">
                    {CATEGORIES.map(({ code, libelle, image }) => (
                      <button key={code} type="button"
                        className={['signalement-categorie', categorie === code ? 'signalement-categorie--active' : ''].filter(Boolean).join(' ')}
                        aria-pressed={categorie === code} onClick={() => setCategorie(code)}>
                        <img className="signalement-categorie__icone" src={image} alt="" />
                        <span className="signalement-categorie__libelle">{libelle}</span>
                      </button>
                    ))}
                  </div>

                  <div className="champ">
                    <label htmlFor="signalement-admin-description">Description</label>
                    <textarea id="signalement-admin-description" rows={4} maxLength={LONGUEUR_MAX} value={description}
                      onChange={(e) => setDescription(e.target.value)} placeholder="Décris le problème…" required />
                    <span className="champ__aide signalement-modale__compteur">{description.length}/{LONGUEUR_MAX}</span>
                  </div>

                  <ChoixPiecesSignalement fichiers={fichiers} onChange={setFichiers} />

                  <fieldset className="signalement-admin__jeu">
                    <legend>Rattacher à un jeu de test</legend>

                    <div className="champ">
                      <label htmlFor="signalement-admin-competence">Compétence / test à réaliser</label>
                      <textarea id="signalement-admin-competence" rows={2} maxLength={1000} value={competence}
                        onChange={(e) => setCompetence(e.target.value)} required={relie}
                        aria-invalid={rappel?.champ === 'signalement-admin-competence' || undefined}
                        placeholder="Par exemple : l’exercice de syllabes garde la syllabe choisie" />
                    </div>

                    <div className="champ">
                      <label htmlFor="signalement-admin-jeu">Jeu de test</label>
                      <select id="signalement-admin-jeu" value={jeuId} onChange={(e) => { setJeuId(e.target.value); setTestId(''); }}>
                        <option value="">Aucun : ne pas l’ajouter à un jeu de test</option>
                        {jeux.map((j) => <option key={j.id} value={j.id}>{libelleJeu(j)}</option>)}
                      </select>
                      <button type="button" className="jeux-tests__bouton jeux-tests__bouton--ajout signalement-admin__nouveau-jeu"
                        onClick={() => setNouveauJeu(true)}>
                        Créer un nouveau jeu de test
                      </button>
                    </div>

                    {relie && (
                      <div className="champ">
                        <label htmlFor="signalement-admin-bloc">Bloc</label>
                        <select id="signalement-admin-bloc" value={testId} required onChange={(e) => setTestId(e.target.value)}>
                          <option value="">{jeu ? 'Choisir un bloc…' : 'Chargement…'}</option>
                          {(jeu?.tests ?? []).map((t) => <option key={t.id} value={t.id}>{t.titre} · {t.matiere}</option>)}
                        </select>
                        {jeu && (jeu.tests ?? []).length === 0 && (
                          <span className="champ__aide">Ce jeu n’a encore aucun bloc : ajoute-lui un test depuis l’onglet « Jeux de tests ».</span>
                        )}
                      </div>
                    )}
                  </fieldset>
                </div>

                {rappel && <p className="signalement-admin__rappel" role="alert">{rappel.texte}</p>}

                <div className="modale__actions">
                  <button type="button" className="btn-ghost" onClick={fermer}>Annuler</button>
                  <button type="submit" className="btn" disabled={envoi}>
                    {envoi ? 'Envoi…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}

      {nouveauJeu && <FenetreNouveauJeu onTermine={jeuCree} onAnnule={() => setNouveauJeu(false)} />}
    </>
  );
}
