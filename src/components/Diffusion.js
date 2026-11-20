import { useEffect, useState } from 'react';
import {
  apercuDiffusion,
  apercuModeleMail,
  diffuserModeleMail,
  getDestinatairesDiffusion,
  getEtatDiffusion,
} from '../lib/api/adminApi';
import { useModeleMail } from '../lib/hooks/useModeleMail';
import BandeauModele from './BandeauModele';
import BarreOutilsTexte from './BarreOutilsTexte';
import BlocPieces from './BlocPieces';
import ColonneModeles from './ColonneModeles';
import LegendeVariables from './LegendeVariables';
import PlanificationModele from './PlanificationModele';
import CarteExpediteur from './CarteExpediteur';
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
 *
 * DEUX ONGLETS, DEUX USAGES — décision de Min's, le 20/11/2026
 * ------------------------------------------------------------
 * « Message de diffusion » (par défaut) : les informations de Mimia que Min's
 * envoie à TOUS les parents qui ont une adresse valide, qu'ils aient accepté
 * les offres ou non. Ni case à cocher, ni avertissement, ni lien de
 * désinscription. C'est aussi ici que se règlent les courriels automatiques.
 *
 * `mode="offres"` (onglet « Offres et promotions ») : le même écran, mais
 * envoyé SEULEMENT aux parents qui ont accepté les offres par e-mail, avec un
 * lien pour se désinscrire (obligation légale, art. L34-5 CPCE). C'est par là
 * que part une promotion (Black Friday…). Pas de courriels automatiques ici.
 */
/**
 * `{{lien_desinscription}}` (ou `{{lienDesinscription}}`), avec ou sans espaces, sans tenir compte de la casse : le
 * même motif que le serveur (`DiffusionService.ContientLienDesinscription`). Dans un message de diffusion, c'est la
 * marque d'un modèle d'offre (revue d'Omar, 20/11/2026) : on indique de l'envoyer par « Offres et promotions ».
 */
const MOTIF_LIEN_DESINSCRIPTION = /\{\{\s*(lien_desinscription|liendesinscription)\s*\}\}/i;

export default function Diffusion({ nombreParents, mode = 'information' }) {
  const offres = mode === 'offres';

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

  // À COMBIEN ÇA PART VRAIMENT : le nombre est relu au moment de confirmer, par la même requête que l'envoi — tous
  // les parents joignables pour un message de diffusion, les seuls consentants pour une offre. Dans « Offres et
  // promotions », il est lu dès l'ouverture : le cadre du haut l'affiche. null : en cours de lecture ; 'erreur' : illisible.
  const [destinataires, setDestinataires] = useState(null);

  useEffect(() => {
    if (!confirme && !offres) return undefined;

    let vivant = true;
    setDestinataires(null);
    (offres ? getDestinatairesDiffusion('offres') : getDestinatairesDiffusion())
      .then(({ data }) => { if (vivant) setDestinataires(Number.isFinite(data?.nombre) ? data.nombre : 'erreur'); })
      .catch(() => { if (vivant) setDestinataires('erreur'); });

    return () => { vivant = false; };
  }, [confirme, offres]);

  const nombreDestinataires = typeof destinataires === 'number' ? destinataires : null;
  const libelleDestinataires = nombreDestinataires === null ? '…' : nombreDestinataires;

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
        const { data } = await (offres ? apercuModeleMail(modele.id, { mode: 'offres' }) : apercuModeleMail(modele.id));
        ouvrirApercu(data);
      } else {
        const { data } = await (offres ? apercuDiffusion(composition, { mode: 'offres' }) : apercuDiffusion(composition));
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

  // Un message de diffusion qui porte le lien de désinscription : c'est un modèle d'offre, il part par « Offres et
  // promotions » (le serveur le refuse aussi).
  const lienDansInformation = !offres && [sujet, titre, texte].some((t) => MOTIF_LIEN_DESINSCRIPTION.test(t ?? ''));

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

      if (offres) await diffuserModeleMail(id, { mode: 'offres' });
      else await diffuserModeleMail(id);
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
                  : `${etat.mode === 'offres' ? 'Dernière offre' : 'Dernière diffusion'} : ${etat.envoyes} envoyé(s), ${etat.echecs} échec(s)`}
              </strong>

              {etat.sujet && <span className="diffusion__etat-sujet">« {etat.sujet} »</span>}

              {etat.erreur && <span className="diffusion__etat-erreur">{etat.erreur}</span>}
            </div>
          )}

          {/* « OFFRES ET PROMOTIONS » : à qui part une offre, et combien, avant même d'écrire. */}
          {offres && (
            <div className="diffusion__offres" role="note">
              <strong className="diffusion__offres-titre">
                Réservé aux offres&nbsp;: envoyé seulement aux parents qui ont accepté les offres
                ({destinataires === 'erreur' ? 'nombre illisible' : `${libelleDestinataires} parent${nombreDestinataires === 1 ? '' : 's'}`})
              </strong>
              <p>
                Chaque e-mail porte un lien pour se désinscrire. Pour une information à tous les
                parents, utilisez «&nbsp;Message de diffusion&nbsp;».
              </p>
            </div>
          )}

          <CarteExpediteur mode="diffusion" />

          <BandeauModele modele={modele} etat={etatModele} enregistreA={enregistreA} />

          {creationAuto && (
            <p className="diffusion__note-creation">
              <strong>Nouveau courriel automatique.</strong> Une fois créé, choisissez à qui il
              part et quand, dans « La programmation ».
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
                placeholder={offres ? 'Une offre pour les fêtes' : 'Une nouveauté sur Mimia'}
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
                Une ligne vide crée un paragraphe. <strong>**Ainsi**</strong> devient du gras.
                Une adresse comme <strong>https://mimia.fr</strong> devient un lien ; pour un lien avec
                un texte, écrivez <strong>[voir les formules](https://mimia.fr/tarifs)</strong>.
              </span>
            </div>

            {/* Le lien de désinscription n'existe que dans une offre : ailleurs, la variable n'est pas proposée. */}
            <LegendeVariables
              variables={offres || cadreAutomatique
                ? modele?.variables
                : modele?.variables?.filter((v) => v.cle !== 'lien_desinscription')}
              onInserer={insererTexte}
            />

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

          {/* ③ LA PROGRAMMATION — pour un courriel automatique seulement. Pendant
              la création, la section est annoncée : elle se règle une fois le
              courriel créé (Camara, le 17/10/2026 : « je n'ai pas le bloc »). */}
          {creationAuto && !estAutomatique && (
            <SectionMail
              numero="3"
              titre="La programmation"
              aide="À qui il part et quand, à l’heure de Paris."
              teinte="bleu"
            >
              <p className="planification__attente">
                Créez d’abord le courriel avec le bouton du bas : vous choisirez ensuite ici ses
                destinataires, sa fréquence, son jour et son heure.
              </p>
            </SectionMail>
          )}

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
            <div className="diffusion__avertissement">
              {lienDansInformation && (
                <p className="diffusion__lien-offre" role="alert">
                  Ce message contient <code>{'{{lien_desinscription}}'}</code>&nbsp;: c’est un modèle
                  d’offre. Envoyez-le depuis l’onglet «&nbsp;Offres et promotions&nbsp;», ou retirez
                  cette variable pour l’envoyer à tous.
                </p>
              )}
              <p>
                {destinataires === 'erreur' ? (
                  <>Le nombre de destinataires n’a pas pu être lu.</>
                ) : (
                  <>
                    Ce message partira à <strong>{libelleDestinataires} parent(s)</strong>
                    {Number.isFinite(nombreParents) && <> sur {nombreParents} compte(s)</>}, chacun
                    dans son propre courriel.
                  </>
                )}{' '}
                {offres && (
                  <>
                    Seuls les parents qui ont accepté de recevoir les offres et nouveautés par e-mail
                    le reçoivent, avec un lien pour se désinscrire.{' '}
                  </>
                )}
                <strong>Un envoi ne s’annule pas.</strong>{' '}
                Avez-vous relu l’aperçu ?
              </p>
            </div>
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
                  disabled={envoi || enCours || nombreDestinataires === null || nombreDestinataires === 0
                    || lienDansInformation}
                  onClick={envoyer}
                >
                  {envoi ? 'Lancement…' : `Confirmer l’envoi à ${libelleDestinataires} parent(s)`}
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
                {offres ? 'Envoyer aux parents inscrits aux offres' : 'Envoyer à tous les parents'}
              </button>
            ))}
          </div>
        </div>
      )}

      <ColonneModeles
        nature={nature}
        natureFixe={offres}
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
