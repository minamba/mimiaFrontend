import { useEffect, useState } from 'react';
import {
  apercuDiffusion,
  apercuModeleMail,
  diffuserModeleMail,
  getEtatDiffusion,
} from '../lib/api/adminApi';
import { useModeleMail } from '../lib/hooks/useModeleMail';
import BandeauModele from './BandeauModele';
import BarreOutilsTexte from './BarreOutilsTexte';
import BlocPieces from './BlocPieces';
import ColonneModeles from './ColonneModeles';
import LegendeVariables from './LegendeVariables';
import PlanificationModele from './PlanificationModele';
import SectionMail from './SectionMail';

/** Ouvre un courriel rendu dans un nouvel onglet. */
function ouvrirApercu(html) {
  // OUVERT DANS UN ONGLET, PAS DANS UNE FENÊTRE MODALE.
  //
  // Un courriel se lit en pleine largeur, avec les images et la mise en
  // page réelles. Le montrer dans une boîte de 420 pixels donnerait un
  // aperçu qui ne ressemble à rien de ce que le parent verra.
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');

  // L'adresse est révoquée après ouverture : sans ça, chaque aperçu
  // laisserait un objet en mémoire jusqu'au rechargement de la page.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Écrire à tous les parents — et régler les courriels automatiques.
 *
 * L'ÉCRAN LE PLUS DANGEREUX DE L'ADMINISTRATION
 * ---------------------------------------------
 * Un clic écrit à tous les clients, et un courriel parti ne se rattrape pas.
 * Toute la mise en page découle de là : l'aperçu avant l'envoi, le nombre de
 * destinataires écrit en toutes lettres dans la confirmation, et un bouton
 * d'envoi qui reste gris tant qu'on n'a pas relu.
 *
 * PAS D'ÉDITEUR ENRICHI, ET C'EST UN CHOIX
 * ----------------------------------------
 * Un éditeur visuel produit du HTML qu'on ne relit jamais, et qui casse dans
 * la moitié des messageries — celles-ci n'implémentent qu'un sous-ensemble du
 * HTML, différent pour chacune. Ici le texte est du texte, les paragraphes
 * viennent des lignes vides, `**gras**` et les images se placent avec un
 * marqueur (voir `useCompositionMessage`). Ce qu'on écrit est ce qui part.
 *
 * LES TEMPLATES, À DROITE — Camara, le 15/09/2026
 * -----------------------------------------------
 * Choisir un template remplit le formulaire et l'enregistre à chaque
 * modification (voir `useModeleMail`), nom et description compris. Un message
 * envoyé sans avoir été enregistré devient un template : ce qui est parti chez
 * tous les parents se retrouve toujours dans la liste.
 *
 * Un COURRIEL AUTOMATIQUE choisi s'édite au même endroit, mais ne s'envoie pas
 * d'ici : il se programme, et part tout seul. « Nouveau message » dans la liste
 * « Automatique » en crée un, qui naît sans règle d'envoi.
 *
 * TROIS CARTES, UNE BARRE D'ACTIONS — le template, le courriel, la
 * programmation ; les boutons restent à portée pendant qu'on écrit.
 */
export default function Diffusion({ nombreParents }) {
  const {
    nom, setNom,
    description, setDescription,
    sujet, setSujet,
    titre, setTitre,
    texte, setTexte,
    images, documents,
    zoneTexte,
    insererMarqueur, insererEmoji, insererGras, insererTexte,
    modele, etat: etatModele, enregistreA, revision, erreurPiece,
    enregistrer, selectionner, deselectionner, creer, ajouterPieces, retirerPiece,
    mettreAJourModele,
  } = useModeleMail();

  const [nature, setNature] = useState('Diffusion');

  // Un nouveau courriel automatique en cours d'écriture, pas encore créé.
  const [creationAuto, setCreationAuto] = useState(false);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);

  const [confirme, setConfirme] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [etat, setEtat] = useState(null);

  // Suit l'avancement pendant l'envoi. L'intervalle s'arrête dès que la
  // diffusion se termine : continuer à interroger une API pour un état qui ne
  // bougera plus est du bruit pur.
  useEffect(() => {
    let vivant = true;

    const lire = () => {
      getEtatDiffusion()
        .then(({ data }) => { if (vivant) setEtat(data); })
        .catch(() => {});
    };

    lire();
    const minuteur = setInterval(lire, 2000);

    return () => { vivant = false; clearInterval(minuteur); };
  }, []);

  const enCours = etat?.enCours === true;
  const estAutomatique = modele?.nature === 'Automatique';

  // Automatique, choisi ou en création : pas d'envoi d'ici.
  const cadreAutomatique = estAutomatique || creationAuto;

  // Les bilans se composent par enfant : on n'y règle que l'objet et un mot
  // d'introduction, placé au-dessus du bilan.
  const bilans = modele?.code === 'BILANS';

  const composition = { sujet, titre: titre || sujet, texte, images, documents };

  const voirApercu = async () => {
    setErreur(null);

    try {
      if (modele) {
        // Ce qui est tapé d'abord : l'aperçu montre ce qui est enregistré.
        await enregistrer();
        const { data } = await apercuModeleMail(modele.id);
        ouvrirApercu(data);
      } else {
        const { data } = await apercuDiffusion(composition);
        ouvrirApercu(data);
      }
    } catch {
      setErreur("L'aperçu n'a pas pu être généré.");
    }
  };

  const enregistrerTemplate = async () => {
    setErreur(null);
    setEnregistrementEnCours(true);

    try {
      await creer({ nature: creationAuto ? 'Automatique' : 'Diffusion' });
      setCreationAuto(false);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le template n'a pas pu être enregistré.");
    } finally {
      setEnregistrementEnCours(false);
    }
  };

  const envoyer = async () => {
    setEnvoi(true);
    setErreur(null);

    try {
      // UN MESSAGE ENVOYÉ EST TOUJOURS UN TEMPLATE — Camara, le 15/09/2026.
      // Sans template choisi, il est enregistré d'abord ; avec, ce qui vient
      // d'être tapé est enregistré avant de partir.
      let id = modele?.id;

      if (id) await enregistrer();
      else id = await creer();

      await diffuserModeleMail(id);
      setConfirme(false);

      const { data } = await getEtatDiffusion();
      setEtat(data);
    } catch (e) {
      setErreur(
        e?.response?.status === 409
          ? 'Une diffusion est déjà en cours. Attendez qu’elle se termine.'
          : e?.response?.data?.message ?? "La diffusion n'a pas pu être lancée.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  const choisir = (id) => {
    setErreur(null);
    setConfirme(false);
    setCreationAuto(false);
    selectionner(id).catch(() => setErreur("Le template n'a pas pu être ouvert."));
  };

  // « Nouveau message » : un formulaire vide — pour une diffusion, ou pour un
  // nouveau courriel automatique quand c'est la liste « Automatique ».
  const nouveau = () => {
    setConfirme(false);
    setErreur(null);
    deselectionner();
    setCreationAuto(nature === 'Automatique');
  };

  // Changer de liste quitte le template ouvert : un courriel automatique et
  // une diffusion ne se confondent pas dans le même formulaire.
  const changerNature = (cle) => {
    if (cle === nature) return;

    setConfirme(false);
    setErreur(null);
    setCreationAuto(false);
    if (modele) deselectionner();
    setNature(cle);
  };

  const pret = sujet.trim().length > 0 && texte.trim().length > 0;

  return (
    <div className="atelier-mails">
      {nature === 'Automatique' && !modele && !creationAuto ? (
        <div className="diffusion diffusion--attente">
          <p className="diffusion__vide-auto">
            Choisissez un courriel automatique dans la liste : son contenu et sa programmation
            s’afficheront ici. « Nouveau message » en crée un nouveau.
          </p>
        </div>
      ) : (
        <div className="diffusion">
          {erreur && <div className="alert">{erreur}</div>}

          {/* L'avancement d'abord : quand un envoi tourne, c'est la seule chose
              qu'on vient regarder. */}
          {!cadreAutomatique && etat && (etat.enCours || etat.fin) && (
            <div className={`diffusion__etat ${enCours ? 'est-active' : ''}`}>
              <strong>
                {enCours
                  ? `Envoi en cours — ${etat.traites} / ${etat.total}`
                  : `Dernière diffusion : ${etat.envoyes} envoyé(s), ${etat.echecs} échec(s)`}
              </strong>

              {etat.sujet && <span className="diffusion__etat-sujet">« {etat.sujet} »</span>}

              {etat.erreur && <span className="diffusion__etat-erreur">{etat.erreur}</span>}
            </div>
          )}

          <BandeauModele modele={modele} etat={etatModele} enregistreA={enregistreA} />

          {creationAuto && (
            <p className="diffusion__note-creation">
              <strong>Nouveau courriel automatique.</strong> Il sera créé sans règle d’envoi :
              modifiable, mais pas encore programmable.
            </p>
          )}

          {/* ① LE TEMPLATE — ce qu'on lit dans la liste de droite. */}
          <SectionMail
            numero="1"
            titre={cadreAutomatique ? 'Le courriel automatique' : 'Le template'}
            aide={modele
              ? 'Son nom et sa description, tels qu’ils apparaissent dans la liste de droite.'
              : 'Pour le retrouver dans la liste de droite. Sans nom, c’est l’objet qui le nomme.'}
            teinte="sarcelle"
          >
            <div className="champ">
              <label htmlFor="dif-nom">
                {cadreAutomatique ? 'Nom du courriel automatique' : 'Nom du template'}
              </label>
              <input
                id="dif-nom"
                maxLength={120}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder={cadreAutomatique
                  ? 'Relance après une semaine sans cours'
                  : (modele ? '' : '(l’objet, si vous le laissez vide)')}
              />
            </div>

            <div className="champ">
              <label htmlFor="dif-description">Description</label>
              <textarea
                id="dif-description"
                className="champ-description"
                rows={2}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="À quoi sert ce courriel, en une ou deux phrases."
              />
            </div>
          </SectionMail>

          {/* ② LE COURRIEL — ce que reçoivent les parents. */}
          <SectionMail
            numero="2"
            titre="Le courriel"
            aide={bilans
              ? 'L’objet et le mot d’introduction placé au-dessus du bilan de chaque enfant.'
              : 'Ce que reçoivent les parents : l’objet, le message, et ses images ou documents.'}
            teinte="corail"
          >
            <div className="champ">
              <label htmlFor="dif-sujet">Objet du courriel</label>
              <input
                id="dif-sujet"
                maxLength={150}
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                placeholder="Une nouveauté sur Mimia"
              />
              <span className="champ__aide">
                C’est la seule ligne que le parent lit avant de décider d’ouvrir.
              </span>
            </div>

            {!bilans && (
              <div className="champ">
                <label htmlFor="dif-titre">Titre affiché dans le message</label>
                <input
                  id="dif-titre"
                  maxLength={150}
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="(identique à l’objet si vous le laissez vide)"
                />
              </div>
            )}

            <div className="champ">
              <label htmlFor="dif-texte">{bilans ? 'Message d’introduction' : 'Message'}</label>
              <BarreOutilsTexte onGras={insererGras} onEmoji={insererEmoji} />
              <textarea
                id="dif-texte"
                ref={zoneTexte}
                rows={bilans ? 5 : 12}
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                placeholder={bilans
                  ? 'Quelques mots placés au-dessus du bilan de chaque enfant. Laissez vide pour n’en mettre aucun.'
                  : 'Bonjour,\n\nUne ligne vide sépare deux paragraphes.\n\nÀ bientôt,\nL’équipe Mimia'}
              />
              <span className="champ__aide">
                Une ligne vide crée un paragraphe. <strong>**Ainsi**</strong> devient du
                gras ; le reste du texte part tel quel.
              </span>
            </div>

            <LegendeVariables variables={modele?.variables} onInserer={insererTexte} />

            {!bilans && (
              <>
                <BlocPieces
                  titre="Images dans le message"
                  items={images}
                  onAjouter={(fichiers) => ajouterPieces('Image', fichiers)}
                  onRetirer={(i) => retirerPiece('Image', i)}
                  onInserer={insererMarqueur}
                  accept="image/*"
                  videTexte="Aucune image. Ajoutez-en une, puis cliquez sur « Insérer ici » pour la placer à l’endroit du curseur dans votre texte."
                  avecMarqueur
                />

                <BlocPieces
                  titre="Documents joints"
                  items={documents}
                  onAjouter={(fichiers) => ajouterPieces('Document', fichiers)}
                  onRetirer={(i) => retirerPiece('Document', i)}
                  videTexte="Aucun document. Ceux que vous ajoutez seront téléchargeables depuis le courriel, et listés à la fin du message."
                />

                {erreurPiece && <div className="alert">{erreurPiece}</div>}

                {/* CINQ MÉGAOCTETS, ET C'EST UNE LIMITE DE DÉLIVRABILITÉ.
                    Au-delà, beaucoup de messageries refusent le message ou le
                    classent en indésirable — le parent ne reçoit alors rien. */}
                <p className="diffusion__poids-total">
                  Poids total des pièces : <strong>{Math.round(
                    [...images, ...documents].reduce((n, f) => n + (f.size ?? 0), 0) / 1024,
                  ).toLocaleString('fr-FR')} Ko</strong> sur 5 120 Ko autorisés.
                </p>
              </>
            )}
          </SectionMail>

          {/* ③ LA PROGRAMMATION — pour un courriel automatique seulement. */}
          {estAutomatique && (
            <SectionMail
              numero="3"
              titre="La programmation"
              aide="Quand ce courriel part, à l’heure de Paris."
              teinte="bleu"
            >
              <PlanificationModele modele={modele} onPlanifie={mettreAJourModele} />
            </SectionMail>
          )}

          {confirme && !cadreAutomatique && (
            <p className="diffusion__avertissement">
              Ce message partira à <strong>{nombreParents} parent(s)</strong>, chacun
              dans son propre courriel. <strong>Un envoi ne s’annule pas.</strong>{' '}
              Avez-vous relu l’aperçu ?
            </p>
          )}

          {/* LA BARRE D'ACTIONS RESTE EN BAS DE L'ÉCRAN pendant qu'on écrit :
              relire, enregistrer ou envoyer sans redescendre sous le message. */}
          <div className="diffusion__actions diffusion__actions--barre">
            <button
              type="button"
              className="btn btn--compact btn--fantome"
              disabled={estAutomatique ? false : !pret}
              onClick={voirApercu}
            >
              Voir l’aperçu
            </button>

            {/* « ENREGISTRER LES MODIFICATIONS », EN PLUS DE L'ENREGISTREMENT
                AUTOMATIQUE — Camara, le 15/09/2026 : sans bouton, rien ne dit
                qu'on peut modifier un template sans l'envoyer. Actif tant qu'il
                reste quelque chose à enregistrer, et après un échec. */}
            {modele && (
              <button
                type="button"
                className="btn btn--compact btn--fantome"
                disabled={etatModele !== 'modifie' && etatModele !== 'erreur'}
                onClick={() => enregistrer()}
              >
                {etatModele === 'enregistrement' ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            )}

            {!modele && (
              <button
                type="button"
                className={`btn btn--compact ${creationAuto ? '' : 'btn--fantome'}`}
                disabled={(creationAuto ? nom.trim().length === 0 : !pret) || enregistrementEnCours}
                onClick={enregistrerTemplate}
              >
                {enregistrementEnCours && 'Enregistrement…'}
                {!enregistrementEnCours && (creationAuto ? 'Créer le courriel automatique' : 'Enregistrer le template')}
              </button>
            )}

            {!cadreAutomatique && (confirme ? (
              <>
                <button
                  type="button"
                  className="btn btn--compact btn--danger"
                  disabled={envoi || enCours}
                  onClick={envoyer}
                >
                  {envoi ? 'Lancement…' : `Confirmer l’envoi à ${nombreParents} parent(s)`}
                </button>

                <button
                  type="button"
                  className="btn btn--compact btn--fantome"
                  onClick={() => setConfirme(false)}
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn--compact diffusion__envoi"
                disabled={!pret || enCours}
                onClick={() => setConfirme(true)}
              >
                Envoyer à tous les parents
              </button>
            ))}
          </div>
        </div>
      )}

      <ColonneModeles
        nature={nature}
        onNature={changerNature}
        selectionId={modele?.id}
        onSelectionner={choisir}
        onNouveau={nouveau}
        onSupprime={(id) => { if (modele?.id === id) deselectionner({ sansEnregistrer: true }); }}
        revision={revision}
      />
    </div>
  );
}
