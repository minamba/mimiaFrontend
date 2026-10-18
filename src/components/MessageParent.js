import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  apercuDiffusion,
  apercuModeleMail,
  envoyerMailParent,
  envoyerModeleParent,
  enregistrerBrouillon,
  getBrouillonLibre,
  getPieceBrouillon,
  remplacerPiecesBrouillon,
  supprimerMessages,
} from '../lib/api/adminApi';
import { useModeleMail } from '../lib/hooks/useModeleMail';
import BandeauModele from './BandeauModele';
import BarreOutilsTexte from './BarreOutilsTexte';
import BlocPieces from './BlocPieces';
import CarteExpediteur from './CarteExpediteur';
import ColonneModeles from './ColonneModeles';
import SectionMail from './SectionMail';

const REGEX_MAIL = /^\S+@\S+\.\S+$/;

const correspond = (parent, terme) => {
  const cible = `${parent.mail ?? ''} ${parent.prenom ?? ''} ${parent.nom ?? ''}`.toLowerCase();
  return cible.includes(terme.toLowerCase());
};

const nomAffiche = (parent) => [parent.prenom, parent.nom].filter(Boolean).join(' ') || 'Sans nom';

/**
 * Écrire à UN parent — même mise en page que la diffusion, un seul
 * destinataire.
 *
 * LE CHAMP MAIL RESTE UN CHAMP, LA RECHERCHE N'EST QU'UN RACCOURCI.
 * -------------------------------------------------------------------
 * Choisir une ligne dans la liste remplit l'adresse, mais ne la verrouille
 * pas : on peut toujours l'écrire ou la corriger à la main, pour un parent
 * qui n'apparaît pas encore dans la liste ou une adresse ponctuelle.
 *
 * LES MÊMES TEMPLATES QUE LA DIFFUSION — Camara, le 15/09/2026
 * ------------------------------------------------------------
 * Un template choisi ici s'enregistre à chaque modification, comme dans la
 * diffusion : c'est le même objet. Seuls les templates de diffusion sont
 * proposés — un courriel automatique part tout seul. Un message envoyé à un
 * seul parent sans template n'en crée pas : ce serait remplir la liste de
 * réponses ponctuelles.
 *
 * TROIS CARTES — le template, le destinataire, le courriel — et une barre
 * d'actions qui reste à portée : les trois questions qu'on se pose dans cet
 * ordre, séparées plutôt qu'enfilées dans une seule colonne de champs.
 */
/**
 * LE BROUILLON — Camara, le 17/10/2026 : « tant qu'on ne l'a pas envoyé, qu'il
 * soit sauvegardé en tant que brouillon ». Sans template, le message (adresse,
 * objet, titre, texte) est enregistré au fil de la frappe dans « Ma boîte ›
 * Brouillons », d'où un clic le rouvre ici. Les images et documents ne sont pas
 * gardés : ce sont des fichiers. Avec un template, rien de tout cela : le
 * template s'enregistre déjà lui-même.
 */
/**
 * `boite` (17/10/2026) : « moi » — sa boîte, sa signature — ou « support » — la
 * boîte commune, support@mimia.fr, signé « L'équipe Mimia ». Les brouillons
 * sont rangés dans la boîte d'où le message partira.
 */
export default function MessageParent({
  parents, brouillonAReprendre = null, onBrouillonRepris = null, onConnecterBoite = null, boite = 'moi',
}) {
  const [recherche, setRecherche] = useState('');
  const [listeOuverte, setListeOuverte] = useState(false);
  const [destinataire, setDestinataire] = useState('');

  const {
    nom, setNom,
    description, setDescription,
    sujet, setSujet,
    titre, setTitre,
    texte, setTexte,
    images, documents, charger: chargerComposition,
    zoneTexte,
    insererMarqueur, insererEmoji, insererGras,
    modele, etat: etatModele, enregistreA, revision, erreurPiece,
    enregistrer, selectionner, deselectionner, creer, ajouterPieces, retirerPiece,
  } = useModeleMail();

  const [confirme, setConfirme] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [envoye, setEnvoye] = useState(null);
  // La confirmation s'efface seule : elle a dit ce qu'elle avait à dire.
  useEffect(() => {
    if (!envoye) return undefined;
    const minuteur = setTimeout(() => setEnvoye(null), 10000);
    return () => clearTimeout(minuteur);
  }, [envoye]);

  // ------------------------------------------------------------ brouillon
  const VIDE = JSON.stringify({ destinataire: '', sujet: '', titre: '', texte: '', avecPieces: false });
  const brouillonId = useRef(null);
  const dernierBrouillon = useRef(VIDE);
  const enAttente = useRef(null);
  const [etatBrouillon, setEtatBrouillon] = useState(null);

  const sauverBrouillon = useCallback(async (contenu) => {
    enAttente.current = null;
    const cle = JSON.stringify(contenu);
    if (cle === dernierBrouillon.current) return;
    dernierBrouillon.current = cle;

    setEtatBrouillon({ etat: 'enregistrement' });
    try {
      const { status, data } = await enregistrerBrouillon(
        { messageOrigine: null, id: brouillonId.current, ...contenu }, boite);
      brouillonId.current = status === 204 ? null : data?.id ?? brouillonId.current;
      setEtatBrouillon(status === 204 ? null : { etat: 'enregistre', heure: new Date() });
    } catch (e) {
      dernierBrouillon.current = null;
      setEtatBrouillon({ etat: 'erreur', boite: e?.response?.status === 409 });
    }
  }, [boite]);

  /** Ce qui attendait la pause de la frappe part tout de suite. */
  const sauverMaintenant = useCallback(
    () => (enAttente.current ? sauverBrouillon(enAttente.current) : Promise.resolve()),
    [sauverBrouillon],
  );

  // LES IMAGES ET DOCUMENTS DU BROUILLON — Camara, le 18/10/2026 : « en
  // rouvrant le brouillon je n'ai que le marqueur ». Ils sont envoyés au
  // serveur (rangés sur le disque, pas en base) à chaque ajout ou retrait, et
  // effacés quand le message part ou que le brouillon est supprimé.
  const clePieces = (imgs, docs) =>
    JSON.stringify([...imgs.map((f) => ['I', f.name, f.size]), ...docs.map((f) => ['D', f.name, f.size])]);
  const dernieresPieces = useRef(clePieces([], []));
  const actuel = useRef({});
  actuel.current = {
    contenu: { destinataire, sujet, titre, texte, avecPieces: images.length + documents.length > 0 },
    images,
    documents,
  };

  const sauverPieces = useCallback(async (imgs, docs) => {
    const cle = clePieces(imgs, docs);
    if (cle === dernieresPieces.current) return;

    // Il faut un brouillon pour y ranger des pièces : le texte d'abord.
    if (!brouillonId.current) await sauverBrouillon(actuel.current.contenu);
    if (!brouillonId.current) return;

    dernieresPieces.current = cle;
    setEtatBrouillon({ etat: 'enregistrement' });
    try {
      await remplacerPiecesBrouillon(brouillonId.current, imgs, docs, boite);
      setEtatBrouillon({ etat: 'enregistre', heure: new Date() });
    } catch (e) {
      dernieresPieces.current = null;
      setEtatBrouillon({ etat: 'erreur', message: e?.response?.data?.message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boite, sauverBrouillon]);

  useEffect(() => {
    if (modele) return undefined;
    if (clePieces(images, documents) === dernieresPieces.current) return undefined;

    const minuteur = setTimeout(() => sauverPieces(images, documents), 600);
    return () => clearTimeout(minuteur);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modele, images, documents, sauverPieces]);

  /** Le message suivant repart d'un brouillon neuf ; le précédent reste dans « Brouillons ». */
  const nouveauBrouillon = useCallback(async () => {
    await sauverMaintenant();
    if (!modele) await sauverPieces(actuel.current.images, actuel.current.documents);
    brouillonId.current = null;
    dernierBrouillon.current = VIDE;
    dernieresPieces.current = clePieces([], []);
    setEtatBrouillon(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sauverMaintenant, sauverPieces, modele]);

  useEffect(() => {
    if (modele) return undefined;

    const contenu = { destinataire, sujet, titre, texte, avecPieces: images.length + documents.length > 0 };
    if (JSON.stringify(contenu) === dernierBrouillon.current) return undefined;

    const vide = !destinataire.trim() && !sujet.trim() && !titre.trim() && !texte.trim() && !contenu.avecPieces;
    if (vide && !brouillonId.current) return undefined;

    enAttente.current = contenu;
    const minuteur = setTimeout(() => sauverBrouillon(contenu), 1500);
    return () => clearTimeout(minuteur);
  }, [modele, destinataire, sujet, titre, texte, images, documents, sauverBrouillon]);

  // En quittant l'onglet, ce qui restait à enregistrer part quand même.
  const sauverRef = useRef(null);
  sauverRef.current = async () => {
    await sauverMaintenant();
    if (!modele) await sauverPieces(actuel.current.images, actuel.current.documents);
  };
  useEffect(() => () => { sauverRef.current(); }, []);

  // UN BROUILLON CHOISI DANS « MA BOÎTE › BROUILLONS » se rouvre ici.
  useEffect(() => {
    if (!brouillonAReprendre?.identifiant) return;
    let annule = false;

    (async () => {
      try {
        const { data } = await getBrouillonLibre(brouillonAReprendre.identifiant, boite);
        if (annule) return;
        await nouveauBrouillon();
        await deselectionner();

        // Les pièces reviennent en vrais fichiers : l'envoi les reprend tels quels.
        const fichiers = await Promise.all((data.pieces ?? []).map(async (p) => {
          const { data: octets } = await getPieceBrouillon(data.id, p.id, boite);
          return { genre: p.genre, fichier: new File([octets], p.nomFichier, { type: p.typeMime }) };
        }));
        if (annule) return;
        const imgs = fichiers.filter((f) => f.genre === 'Image').map((f) => f.fichier);
        const docs = fichiers.filter((f) => f.genre === 'Document').map((f) => f.fichier);

        const contenu = {
          destinataire: data.destinataire ?? '',
          sujet: data.sujet ?? '',
          titre: data.titre ?? '',
          texte: data.texte ?? '',
          avecPieces: imgs.length + docs.length > 0,
        };
        brouillonId.current = data.id;
        dernierBrouillon.current = JSON.stringify(contenu);
        dernieresPieces.current = clePieces(imgs, docs);
        setDestinataire(contenu.destinataire);
        setRecherche(contenu.destinataire);
        setSujet(contenu.sujet);
        setTitre(contenu.titre);
        chargerComposition({ texte: contenu.texte, images: imgs, documents: docs });
        setConfirme(false);
        setEtatBrouillon({ etat: 'enregistre', heure: new Date(data.dateModification) });
      } catch {
        if (!annule) setErreur("Ce brouillon n'a pas pu être rouvert. Il a peut-être été supprimé.");
      } finally {
        if (!annule) onBrouillonRepris?.();
      }
    })();

    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brouillonAReprendre]);

  const resultats = useMemo(() => {
    const terme = recherche.trim();
    if (terme.length === 0) return [];
    return parents.filter((p) => correspond(p, terme)).slice(0, 8);
  }, [parents, recherche]);

  const choisirParent = (parent) => {
    setDestinataire(parent.mail ?? '');
    setRecherche(`${nomAffiche(parent)} — ${parent.mail ?? ''}`);
    setListeOuverte(false);
  };

  const composition = { sujet, titre: titre || sujet, texte, images, documents };
  const adresseValide = REGEX_MAIL.test(destinataire.trim());
  const contenuPret = sujet.trim().length > 0 && texte.trim().length > 0;
  const pret = adresseValide && contenuPret;

  const voirApercu = async () => {
    setErreur(null);

    try {
      let html;

      if (modele) {
        await enregistrer();
        ({ data: html } = await apercuModeleMail(modele.id, { signature: true, boite }));
      } else {
        ({ data: html } = await apercuDiffusion(composition, { signature: true, boite }));
      }

      // MÊME GESTE QUE LA DIFFUSION : un onglet plutôt qu'une modale, pour
      // voir le courriel à sa taille réelle.
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErreur("L'aperçu n'a pas pu être généré.");
    }
  };

  const enregistrerTemplate = async () => {
    setErreur(null);
    setEnregistrementEnCours(true);

    try {
      await creer();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le template n'a pas pu être enregistré.");
    } finally {
      setEnregistrementEnCours(false);
    }
  };

  const envoyer = async () => {
    setEnvoi(true);
    setErreur(null);
    setEnvoye(null);

    // Le brouillon en attente ne doit pas renaître après l'envoi.
    enAttente.current = null;
    const brouillonEnvoye = modele ? null : brouillonId.current;

    try {
      const adresse = destinataire.trim();

      let reponse;
      if (modele) {
        await enregistrer();
        reponse = await envoyerModeleParent(modele.id, adresse, boite);
      } else {
        reponse = await envoyerMailParent({ ...composition, destinataire: adresse }, boite);

        // Sans template, le formulaire se vide comme avant. Avec, il reste
        // ouvert : on écrit souvent le même message à plusieurs parents.
        await deselectionner();
      }

      // Le message est parti : son brouillon n'a plus lieu d'être.
      if (brouillonEnvoye) {
        brouillonId.current = null;
        dernierBrouillon.current = VIDE;
        dernieresPieces.current = clePieces([], []);
        setEtatBrouillon(null);
        supprimerMessages([brouillonEnvoye], boite, 'brouillons').catch(() => {});
      }

      // En développement, le serveur dit vers quelle adresse il a détourné l'envoi.
      setEnvoye({ adresse, redirection: reponse?.data?.redirection ?? null });
      setConfirme(false);
      setDestinataire('');
      setRecherche('');
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "Le message n'a pas pu être envoyé.");
    } finally {
      setEnvoi(false);
    }
  };

  const choisir = async (id) => {
    setErreur(null);
    setConfirme(false);
    await nouveauBrouillon();
    selectionner(id).catch(() => setErreur("Le template n'a pas pu être ouvert."));
  };

  return (
    <div className="atelier-mails">
      <div className="diffusion message-parent">
        {erreur && <div className="alert">{erreur}</div>}

        <CarteExpediteur mode={boite === 'support' ? 'support' : 'boite'} onConnecter={onConnecterBoite} />

        <BandeauModele modele={modele} etat={etatModele} enregistreA={enregistreA} />

        {/* ① LE TEMPLATE — ce qu'on lit dans la liste de droite. */}
        <SectionMail
          numero="1"
          titre="Le template"
          aide={modele
            ? 'Son nom et sa description, tels qu’ils apparaissent dans la liste de droite.'
            : 'Facultatif : pour retrouver ce message dans la liste si vous l’enregistrez.'}
          teinte="sarcelle"
        >
          <div className="champ">
            <label htmlFor="mp-nom">Nom du template</label>
            <input
              id="mp-nom"
              maxLength={120}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder={modele ? '' : '(l’objet, si vous le laissez vide)'}
            />
          </div>

          <div className="champ">
            <label htmlFor="mp-description">Description</label>
            <textarea
              id="mp-description"
              className="champ-description"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="À quoi sert ce message, en une ou deux phrases."
            />
          </div>
        </SectionMail>

        {/* ② LE DESTINATAIRE — qui va le recevoir. */}
        <SectionMail
          numero="2"
          titre="Le destinataire"
          aide="Cherchez un parent par son nom, ou tapez directement son adresse."
          teinte="bleu"
        >
          <div className="champ champ--recherche-parent">
            <label htmlFor="mp-recherche">Rechercher un parent</label>
            <input
              id="mp-recherche"
              autoComplete="off"
              value={recherche}
              onChange={(e) => { setRecherche(e.target.value); setListeOuverte(true); }}
              onFocus={() => setListeOuverte(true)}
              // Le délai laisse le clic sur une ligne se produire avant que la
              // liste ne se referme : sans lui, `onBlur` la ferme en premier et
              // le clic tombe dans le vide.
              onBlur={() => setTimeout(() => setListeOuverte(false), 150)}
              placeholder="Nom ou adresse e-mail…"
            />

            {listeOuverte && resultats.length > 0 && (
              <ul className="recherche-parent__liste">
                {resultats.map((p) => (
                  <li key={p.id}>
                    <button type="button" onMouseDown={() => choisirParent(p)}>
                      <span className="recherche-parent__nom">{nomAffiche(p)}</span>
                      <span className="recherche-parent__mail">{p.mail}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="champ">
            <label htmlFor="mp-mail">Adresse e-mail du destinataire</label>
            <input
              id="mp-mail"
              type="email"
              value={destinataire}
              onChange={(e) => setDestinataire(e.target.value)}
              placeholder="parent@exemple.fr"
            />
            <span className="champ__aide">
              Remplie automatiquement en choisissant une ligne ci-dessus, ou à taper
              directement.
            </span>
          </div>
        </SectionMail>

        {/* ③ LE COURRIEL — ce que le parent reçoit. */}
        <SectionMail
          numero="3"
          titre="Le courriel"
          aide="Ce que le parent reçoit : l’objet, le message, et ses images ou documents."
          teinte="corail"
        >
          <div className="champ">
            <label htmlFor="mp-sujet">Objet du courriel</label>
            <input
              id="mp-sujet"
              maxLength={150}
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Votre question sur Mimia"
            />
          </div>

          <div className="champ">
            <label htmlFor="mp-titre">Titre affiché dans le message</label>
            <input
              id="mp-titre"
              maxLength={150}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="(identique à l’objet si vous le laissez vide)"
            />
          </div>

          <div className="champ">
            <label htmlFor="mp-texte">Message</label>
            <BarreOutilsTexte onGras={insererGras} onEmoji={insererEmoji} />
            <textarea
              id="mp-texte"
              ref={zoneTexte}
              rows={12}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={'Bonjour,\n\nUne ligne vide sépare deux paragraphes.\n\nÀ bientôt,\nL’équipe Mimia'}
            />
            <span className="champ__aide">
              Une ligne vide crée un paragraphe. <strong>**Ainsi**</strong> devient du gras.
              Une adresse comme <strong>https://mimia.fr</strong> devient un lien ; pour un lien avec
              un texte, écrivez <strong>[voir les formules](https://mimia.fr/tarifs)</strong>.
            </span>
          </div>

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
            videTexte="Aucun document. Ceux que vous ajoutez seront téléchargeables depuis le courriel."
          />

          {erreurPiece && <div className="alert">{erreurPiece}</div>}

          <p className="diffusion__poids-total">
            Poids total des pièces : <strong>{Math.round(
              [...images, ...documents].reduce((n, f) => n + (f.size ?? 0), 0) / 1024,
            ).toLocaleString('fr-FR')} Ko</strong> sur 5 120 Ko autorisés.
          </p>
        </SectionMail>

        <div className="diffusion__actions diffusion__actions--barre">
          {!modele && etatBrouillon && (
            <span
              className={`message-parent__brouillon${etatBrouillon.etat === 'erreur' ? ' est-en-erreur' : ''}`}
              role="status"
            >
              {etatBrouillon.etat === 'enregistrement' && 'Enregistrement du brouillon…'}
              {etatBrouillon.etat === 'enregistre' && (
                <>
                  Brouillon enregistré à {etatBrouillon.heure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  {' '}· Messagerie › {boite === 'support' ? 'Support' : 'Ma boîte'} › Brouillons
                </>
              )}
              {etatBrouillon.etat === 'erreur' && (etatBrouillon.boite
                ? 'Brouillon non enregistré : connectez d’abord votre boîte (Messagerie › Ma boîte).'
                : etatBrouillon.message ?? 'Le brouillon n’a pas pu être enregistré.')}
            </span>
          )}

          <button
            type="button"
            className="btn btn--compact btn--fantome"
            disabled={!contenuPret}
            onClick={voirApercu}
          >
            Voir l’aperçu
          </button>

          {/* Le même bouton que la diffusion : un template se modifie sans
              être envoyé, et on doit pouvoir le voir. */}
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
              className="btn btn--compact btn--fantome"
              disabled={!contenuPret || enregistrementEnCours}
              onClick={enregistrerTemplate}
            >
              {enregistrementEnCours ? 'Enregistrement…' : 'Enregistrer le template'}
            </button>
          )}

          {confirme ? (
            <>
              <button
                type="button"
                className="btn btn--compact diffusion__envoi"
                disabled={envoi}
                onClick={envoyer}
              >
                {envoi ? 'Envoi…' : `Confirmer l’envoi à ${destinataire.trim()}`}
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
              disabled={!pret}
              onClick={() => setConfirme(true)}
            >
              Envoyer à ce parent
            </button>
          )}
        </div>
      </div>

      {/* LE RÉSULTAT DE L'ENVOI, LÀ OÙ L'ON CLIQUE — Camara, le 17/10/2026 : « je
          n'ai pas eu de message ». La confirmation et l'erreur s'affichaient en
          haut du formulaire, hors de vue quand on envoie depuis la barre du bas. */}
      {envoye && (
        <div className="admin-confirmation" role="status">
          <span className="admin-confirmation__coche" aria-hidden="true">✓</span>
          <span>
            Message envoyé à <strong>{envoye.adresse}</strong>.
            {envoye.redirection && (
              <span className="admin-confirmation__attention">
                En développement : parti en réalité vers {envoye.redirection}.
              </span>
            )}
          </span>
          <button type="button" className="admin-confirmation__fermer" aria-label="Fermer" onClick={() => setEnvoye(null)}>×</button>
        </div>
      )}
      {erreur && !envoye && (
        <div className="admin-confirmation admin-confirmation--erreur" role="alert">
          <span className="admin-confirmation__coche" aria-hidden="true">!</span>
          <span>{erreur}</span>
          <button type="button" className="admin-confirmation__fermer" aria-label="Fermer" onClick={() => setErreur(null)}>×</button>
        </div>
      )}

      <ColonneModeles
        nature="Diffusion"
        natureFixe
        selectionId={modele?.id}
        onSelectionner={choisir}
        onNouveau={async () => { setConfirme(false); await nouveauBrouillon(); deselectionner(); }}
        onSupprime={(id) => { if (modele?.id === id) deselectionner({ sansEnregistrer: true }); }}
        revision={revision}
      />
    </div>
  );
}
