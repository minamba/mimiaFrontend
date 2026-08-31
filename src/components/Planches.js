import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPlanches,
  importerPlanche,
  supprimerPlanche,
  requalifierPlanches,
} from '../lib/api/adminApi';
import { catalogue, plancheRecommandee, urlPlanche } from '../lib/storage/schemas';
import { styleMatiere } from '../lib/couleurMatiere';
import Loader from './Loader';

/**
 * Les schémas, matière par matière.
 *
 * CE QUE CET ÉCRAN MONTRE VRAIMENT
 * -------------------------------
 * Le catalogue des figures vit dans le front — c'est lui que le professeur
 * reçoit dans sa consigne. Le serveur, lui, ne sait que ce qui a été importé.
 * L'écran croise les deux, et chaque ligne dit laquelle des deux sources
 * l'élève verra : la planche importée, ou le dessin du professeur.
 *
 * Il n'y a donc RIEN à synchroniser : ajouter une figure au catalogue la fait
 * apparaître ici automatiquement, en « dessiné », prête à recevoir une planche.
 */

/**
 * Les matières du catalogue.
 *
 * Une seule pour l'instant — la SVT. Les clés portent leur préfixe de matière,
 * et c'est ce préfixe qui sert de regroupement : le jour où la physique-chimie
 * aura ses figures, elles apparaîtront ici sans une ligne de code de plus.
 */
const MATIERES = {
  svt: { code: 'SVT', libelle: 'SVT' },
  pc: { code: 'PHYSIQUE_CHIMIE', libelle: 'Physique-Chimie' },
  math: { code: 'MATHS', libelle: 'Mathématiques' },
  fr: { code: 'FRANCAIS', libelle: 'Français' },
  hg: { code: 'HISTOIRE_GEO', libelle: 'Histoire-Géographie' },
  an: { code: 'ANGLAIS', libelle: 'Anglais' },
  sc: { code: 'SCIENCES', libelle: 'Sciences et technologie' },
};

const matiereDeLaCle = (cle) => MATIERES[cle.split('-')[0]] ?? { code: 'AUTRE', libelle: 'Autre' };

/** Formulaire d'import, ouvert sur une ligne précise. */
function Import({ figure, matiere, onFait, onAnnuler }) {
  const [fichier, setFichier] = useState(null);
  const [auteur, setAuteur] = useState('');
  const [source, setSource] = useState('');
  const [licence, setLicence] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  /**
   * La planche vient de nous — produite ou générée en interne.
   *
   * CE N'EST PAS QU'UN MASQUAGE DE CHAMPS. Un crédit vide veut dire deux choses
   * opposées : « personne ne l'a encore rempli » et « il n'y a rien à
   * remplir ». Le worker qui complète les crédits manquants ne voit que la
   * première, et attribuerait à un auteur Wikimedia une figure qui n'en vient
   * pas — une fausse attribution, affichée à un enfant, écrite par nous.
   *
   * La case dit la différence, et c'est elle qui met le worker de côté.
   */
  const [maison, setMaison] = useState(false);

  const envoyer = async (evenement) => {
    evenement.preventDefault();
    if (!fichier) return;

    setEnvoi(true);
    setErreur(null);

    try {
      const { data } = await importerPlanche({
        cle: figure.cle,
        matiereCode: matiere.code,
        fichier,
        auteur,
        source,
        licence,
        maison,
      });

      // La planche RELUE après lecture par le modèle : c'est elle qui porte
      // la description, et donc la seule information qui vaille la peine
      // d'être annoncée.
      onFait({ figure, planche: data });
    } catch (e) {
      setErreur(e?.response?.data?.message ?? "L'import a échoué.");
    } finally {
      setEnvoi(false);
    }
  };

  // Le nom sous lequel la planche sera enregistrée, quel que soit celui du
  // fichier choisi. Affiché pour que ce ne soit pas une surprise.
  const extension = fichier?.name?.match(/\.[^.]+$/)?.[0] ?? '.svg';

  return (
    <form className="planche-import" onSubmit={envoyer}>
      <label className="planche-import__champ">
        <span>Fichier</span>
        <input
          type="file"
          accept="image/svg+xml,image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
        />
      </label>

      <p className="planche-import__nom">
        Sera enregistré sous <code>{figure.cle}{extension}</code>
      </p>

      <label className="planche-import__maison">
        <input
          type="checkbox"
          checked={maison}
          onChange={(e) => setMaison(e.target.checked)}
        />
        <span>
          <strong>Figure produite par nous</strong>
          <small>
            Aucun auteur à créditer. Le remplissage automatique des crédits
            laissera cette planche tranquille.
          </small>
        </span>
      </label>

      {/* Les trois mentions qu'imposent CC BY et CC BY-SA. Rien ne les rend
          obligatoires techniquement — et c'est justement pourquoi elles sont
          demandées ici, au moment où on a la page de la source sous les yeux.

          Masquées pour une figure maison : les remplir n'aurait aucun sens, et
          les laisser visibles et vides ferait croire à un oubli. */}
      {!maison && (
        <>
          <label className="planche-import__champ">
            <span>Auteur</span>
            <input value={auteur} onChange={(e) => setAuteur(e.target.value)} placeholder="Patrick J. Lynch" />
          </label>

          <label className="planche-import__champ">
            <span>Source</span>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Wikimedia Commons" />
          </label>

          <label className="planche-import__champ">
            <span>Licence</span>
            <input value={licence} onChange={(e) => setLicence(e.target.value)} placeholder="CC BY-SA 4.0" />
          </label>
        </>
      )}

      {erreur && <p className="planche-import__erreur">{erreur}</p>}

      <div className="planche-import__actions">
        <button type="submit" className="btn btn--compact" disabled={!fichier || envoi}>
          {/* Le libellé annonce l'attente au lieu de la subir : le serveur fait
              LIRE la planche avant de rendre la main, pour que le professeur
              sache la commenter dès la seconde d'après. Quelques secondes. */}
          {envoi ? 'Import et lecture…' : 'Enregistrer'}
        </button>
        <button type="button" className="btn btn--fantome btn--compact" onClick={onAnnuler}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default function Planches() {
  const [importees, setImportees] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [ouverte, setOuverte] = useState(null);

  /**
   * Le compte rendu du dernier import, ou null.
   *
   * POURQUOI UNE CONFIRMATION ALORS QUE LA LIGNE PASSE AU VERT
   * ---------------------------------------------------------
   * Le formulaire se refermait et la liste se rafraîchissait : sans doute
   * était-ce passé. Sur trente-huit imports d'affilée, « sans doute » ne
   * suffit pas — on finit par ne plus regarder, et par croire terminé ce qui
   * ne l'est pas.
   *
   * Surtout, la ligne verte ne dit QUE la moitié de l'histoire. Une planche
   * peut être enregistrée sans que le modèle ait réussi à la lire : les
   * octets sont là, la ligne est verte, et le professeur affichera la figure
   * sans savoir la commenter. C'est le seul échec de cet écran qui ne se voit
   * pas — c'est donc lui que cette fenêtre existe pour dire.
   */
  const [confirmation, setConfirmation] = useState(null);

  /** Le réexamen des planches écartées est en cours. */
  const [requalification, setRequalification] = useState(false);

  /** Ce qu'il a donné, dit une fois puis oublié au rechargement suivant. */
  const [bilanRequalif, setBilanRequalif] = useState(null);

  // La matière ouverte, ou null pour la grille de cartes. Trente-huit lignes
  // d'une seule matière, c'est déjà long ; les sept matières d'un coup, ce
  // serait quelques centaines. On entre donc par une vue d'ensemble.
  const [matiereOuverte, setMatiereOuverte] = useState(null);

  /**
   * La planche affichée en grand, ou null.
   *
   * POURQUOI CET APERÇU EST INDISPENSABLE
   * ------------------------------------
   * Cet écran disait ce qui était importé, jamais QUOI. On y a laissé passer
   * un planisphère céleste allemand rangé sous « continents et océans » : la
   * ligne était verte, la licence bonne, le nom de fichier plausible. Il a
   * fallu extraire les octets de la base et les ouvrir à la main pour le voir.
   *
   * Un aperçu, c'est la seule relecture qui prend deux secondes.
   */
  const [apercu, setApercu] = useState(null);

  // Échap ferme l'aperçu : on en ouvre des dizaines à la suite quand on relit
  // un import, et viser la croix à chaque fois serait pénible.
  useEffect(() => {
    if (!apercu) return undefined;

    const auClavier = (e) => { if (e.key === 'Escape') setApercu(null); };
    document.addEventListener('keydown', auClavier);

    return () => document.removeEventListener('keydown', auClavier);
  }, [apercu]);

  // Le compte rendu se ferme des mêmes gestes que l'aperçu — Échap, ou un clic
  // à côté. Trente-huit imports d'affilée, c'est trente-huit fenêtres à
  // écarter : le geste doit être celui qu'on fait sans y penser.
  useEffect(() => {
    if (!confirmation) return undefined;

    const auClavier = (e) => { if (e.key === 'Escape') setConfirmation(null); };
    document.addEventListener('keydown', auClavier);

    return () => document.removeEventListener('keydown', auClavier);
  }, [confirmation]);

  const charger = useCallback(async () => {
    try {
      const { data } = await getPlanches();
      setImportees(data);
    } catch {
      setErreur("Impossible de charger l'état des schémas.");
      setImportees([]);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  /**
   * Le croisement catalogue × importées, pour TOUTES les matières.
   *
   * Les matières sans figure au catalogue y figurent aussi, avec zéro : c'est
   * une information, pas un vide. Elle dit exactement où le travail reste à
   * faire — aujourd'hui, six matières sur sept.
   */
  const groupes = useMemo(() => {
    const parCle = new Map((importees ?? []).map((p) => [p.cle, p]));

    const parMatiere = new Map(
      Object.values(MATIERES).map((matiere) => [matiere.code, { matiere, figures: [] }]),
    );

    for (const figure of catalogue()) {
      const matiere = matiereDeLaCle(figure.cle);
      if (!parMatiere.has(matiere.code)) parMatiere.set(matiere.code, { matiere, figures: [] });

      parMatiere.get(matiere.code).figures.push({
        ...figure,
        planche: parCle.get(figure.cle) ?? null,
        recommandee: plancheRecommandee(figure.cle),
      });
    }

    return [...parMatiere.values()];
  }, [importees]);

  const groupeOuvert = groupes.find((g) => g.matiere.code === matiereOuverte) ?? null;

  /**
   * Combien de planches le professeur refuse d'afficher pour cause de langue.
   *
   * Lu dans les planches IMPORTÉES et non dans le catalogue : c'est un état de
   * la base, pas une propriété des figures possibles.
   */
  const ecartees = useMemo(
    () => (importees ?? []).filter(
      (p) => p.contenu?.trimStart().startsWith('LANGUE ÉTRANGÈRE'),
    ).length,
    [importees],
  );

  const requalifier = async () => {
    setRequalification(true);
    setBilanRequalif(null);

    try {
      const { data } = await requalifierPlanches();

      setBilanRequalif(
        data.liberees > 0
          ? `${data.liberees} planche${data.liberees > 1 ? 's' : ''} sur ${data.examinees} `
            + `rendue${data.liberees > 1 ? 's' : ''} au professeur.`
          : `Les ${data.examinees} planches examinées sont bien dans une autre langue : `
            + 'aucune n\'a été rendue.',
      );

      await charger();
    } catch {
      setBilanRequalif("Le réexamen a échoué. Rien n'a été modifié.");
    } finally {
      setRequalification(false);
    }
  };

  const retirer = async (cle) => {
    if (!window.confirm('Retirer cette planche ? Le professeur redessinera à la main.')) return;
    await supprimerPlanche(cle);
    charger();
  };

  /**
   * La planche de l'aperçu, relue dans les données FRAÎCHES.
   *
   * `apercu` retient la figure telle qu'elle était au clic. Un remplacement
   * fait ensuite depuis l'aperçu recharge la liste, mais pas cet objet-là :
   * l'aperçu continuerait d'afficher l'ancienne date, donc l'ancienne image, et
   * l'ancien crédit. On le retrouve donc par sa clé à chaque rendu.
   */
  const plancheApercu = apercu
    ? (importees ?? []).find((p) => p.cle === apercu.cle) ?? apercu.planche
    : null;

  if (importees === null) return <Loader texte="Chargement des schémas…" />;

  return (
    <div className="planches">
      {erreur && <div className="alert">{erreur}</div>}

      <p className="planches__intro">
        En SVT, une figure sans planche est <strong>dessinée par le professeur</strong> au
        moment du cours ; la planche vient l'améliorer. Dans les six autres matières, la
        planche est la <strong>seule</strong> chose qui puisse s'afficher — tant qu'elle
        manque, le professeur n'entend jamais parler de la clé et improvise son tableau.
        C'est ce que dit la mention <em>à importer</em>.
      </p>

      {/* LA SECONDE CHANCE DES PLANCHES ÉCARTÉES.

          Le contrôle de langue s'est trompé deux fois, et dans les deux sens :
          il condamnait des planches entièrement françaises sur un
          « Erlenmeyer » ou un « Spoutnik », et refusait les planches d'anglais
          alors que l'anglais y est précisément attendu.

          Le bouton ne s'affiche que s'il y a quelque chose à re-juger : une
          action permanente pour un incident passé encombrerait l'écran, et
          inviterait à cliquer sans raison.

          Il ne relit AUCUNE image : le jugement se refait sur les légendes déjà
          en base. Réimporter, lui, repaierait une lecture par planche. */}
      {ecartees > 0 && (
        <div className="planches__requalif">
          <span>
            <strong>{ecartees}</strong>
            {ecartees > 1 ? ' planches écartées' : ' planche écartée'} pour cause de langue.
          </span>

          <button
            type="button"
            className="btn btn--compact"
            onClick={requalifier}
            disabled={requalification}
          >
            {requalification ? 'Réexamen…' : 'Les réexaminer'}
          </button>
        </div>
      )}

      {bilanRequalif && <div className="alert alert--info">{bilanRequalif}</div>}

      {/* La vue d'ensemble : une carte par matière, avec ce qui reste à faire.
          Une matière sans figure au catalogue reste affichée — savoir qu'il
          n'y a rien est une information, pas un vide à masquer. */}
      {!groupeOuvert && (
        <ul className="planches__cartes">
          {groupes.map(({ matiere, figures }) => {
            const importeesIci = figures.filter((f) => f.planche).length;

            // Ce qui reste à faire, dans l'ordre d'urgence : une figure sans
            // dessin ET sans planche n'existe pas du tout ; une figure de SVT
            // signalée existe déjà, en moins bien.
            const aImporter = figures.filter((f) => !f.planche && !f.dessinee).length;
            const conseillees = figures.filter((f) => f.recommandee && !f.planche).length;

            return (
              <li key={matiere.code}>
                <button
                  type="button"
                  className="planche-carte"
                  style={styleMatiere(matiere.libelle)}
                  onClick={() => setMatiereOuverte(matiere.code)}
                  disabled={figures.length === 0}
                >
                  <strong className="planche-carte__titre">{matiere.libelle}</strong>

                  {figures.length === 0 ? (
                    <span className="planche-carte__vide">aucune figure au catalogue</span>
                  ) : (
                    <>
                      <span className="planche-carte__compte">
                        {importeesIci} / {figures.length} importées
                      </span>
                      <span className="planche-carte__jauge" aria-hidden="true">
                        <span style={{ width: `${(importeesIci / figures.length) * 100}%` }} />
                      </span>
                      {aImporter > 0 && (
                        <span className="planche-carte__alerte">
                          {aImporter} à importer
                        </span>
                      )}
                      {aImporter === 0 && conseillees > 0 && (
                        <span className="planche-carte__alerte">
                          {conseillees} planche{conseillees > 1 ? 's' : ''} conseillée
                          {conseillees > 1 ? 's' : ''}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {groupeOuvert && (
        <section className="planches__matiere">
          <button
            type="button"
            className="btn btn--fantome btn--compact planches__retour"
            onClick={() => { setMatiereOuverte(null); setOuverte(null); }}
          >
            ← Toutes les matières
          </button>

          <h3 style={styleMatiere(groupeOuvert.matiere.libelle)} className="matiere-nom">
            {groupeOuvert.matiere.libelle}
            <span className="planches__compte">
              {groupeOuvert.figures.filter((f) => f.planche).length} / {groupeOuvert.figures.length} importées
            </span>
          </h3>

          <ul className="planches__liste">
            {groupeOuvert.figures.map((figure) => (
              <li key={figure.cle} className={figure.planche ? 'planches__ligne planches__ligne--ok' : 'planches__ligne'}>
                {/* La vignette d'abord : c'est ce qu'on vient vérifier. */}
                {figure.planche && (
                  <button
                    type="button"
                    className="planches__vignette"
                    onClick={() => setApercu(figure)}
                    title="Voir la planche en grand"
                  >
                    <img
                      src={urlPlanche(
                        figure.cle,
                        figure.planche.dateModification ?? figure.planche.dateCreation,
                      )}
                      alt=""
                      loading="lazy"
                    />
                  </button>
                )}

                <div className="planches__titre">
                  <strong>{figure.titre}</strong>
                  <code>{figure.cle}</code>
                  <span className="planches__niveau">{figure.niveau}</span>
                  {figure.recommandee && !figure.planche && (
                    <span className="planches__alerte" title="Le dessin au trait ne suffit pas ici">
                      planche conseillée
                    </span>
                  )}
                </div>

                <div className="planches__etat">
                  {figure.planche ? (
                    <>
                      <span className="planches__badge planches__badge--ok">
                        {figure.planche.maison ? 'maison' : 'importée'}
                      </span>
                      {/* Une planche maison n'affiche pas de licence vide : le
                          dire explicitement évite qu'on la prenne pour un
                          crédit oublié et qu'on aille le « corriger ». */}
                      {figure.planche.maison ? (
                        <span className="planches__licence">produite par nous</span>
                      ) : figure.planche.licence && (
                        <span className="planches__licence">{figure.planche.licence}</span>
                      )}
                      <button type="button" className="btn btn--fantome btn--compact"
                        onClick={() => setOuverte(figure.cle)}>
                        Remplacer
                      </button>
                      <button type="button" className="btn btn--fantome btn--compact"
                        onClick={() => retirer(figure.cle)}>
                        Retirer
                      </button>
                    </>
                  ) : (
                    <>
                      {/*
                        DEUX ABSENCES QUI NE SE VALENT PAS.

                        Une figure de SVT sans planche s'affiche quand même :
                        elle a son dessin. Un emplacement des autres matières,
                        lui, n'a rien — et le professeur n'en sera pas informé,
                        donc il improvisera. Confondre les deux ferait croire
                        que cent trente lignes sont couvertes alors qu'aucune
                        ne l'est.
                      */}
                      <span className={figure.dessinee
                        ? 'planches__badge'
                        : 'planches__badge planches__badge--vide'}>
                        {figure.dessinee
                          ? 'dessinée par le professeur'
                          : 'à importer'}
                      </span>
                      <button type="button" className="btn btn--compact"
                        onClick={() => setOuverte(figure.cle)}>
                        Ajouter
                      </button>
                    </>
                  )}
                </div>

                {/*
                  CE QUE LE PROFESSEUR SAIT DE LA PLANCHE.

                  Le titre du catalogue ne dit rien de la figure réellement
                  importée : deux « appareil respiratoire » ne portent pas les
                  mêmes légendes. Cette ligne est le relevé de celles de
                  l'image, et c'est exactement ce qui part dans le prompt —
                  la lire, c'est voir ce que le professeur pourra demander.
                */}
                {figure.planche && (() => {
                  const contenu = figure.planche.contenu;

                  // TROIS ÉTATS, ET LE TROISIÈME EST UNE ALERTE.
                  //
                  // Une planche légendée dans une autre langue est passée à
                  // travers tous les filtres de l'agent — l'appareil
                  // reproducteur masculin est arrivé en chinois, la cellule
                  // végétale en norvégien. Le professeur ne la montrera pas,
                  // mais l'emplacement reste vide tant que personne ne la
                  // remplace : il faut donc que ça se voie ici.
                  const etrangere = contenu?.trimStart().startsWith('LANGUE ÉTRANGÈRE');

                  if (!contenu) {
                    return (
                      <p className="planches__contenu planches__contenu--attente">
                        Lecture de la planche en cours — tant qu&apos;elle n&apos;est pas
                        faite, le professeur affiche la figure sans savoir ce qu&apos;elle porte.
                      </p>
                    );
                  }

                  if (etrangere) {
                    return (
                      <p className="planches__contenu planches__contenu--etrangere">
                        <strong>Légendes dans une autre langue</strong> — le professeur ne
                        l&apos;affichera pas. À remplacer par une planche en français.
                        <br />
                        {contenu.replace(/^LANGUE ÉTRANGÈRE\s*—\s*/, '')}
                      </p>
                    );
                  }

                  return (
                    <p className="planches__contenu">Le professeur y voit : {contenu}</p>
                  );
                })()}

                {ouverte === figure.cle && (
                  <Import
                    figure={figure}
                    matiere={groupeOuvert.matiere}
                    onAnnuler={() => setOuverte(null)}
                    // LA LISTE EST RECHARGÉE AVANT D'OUVRIR LE COMPTE RENDU,
                    // et l'ordre compte : la fenêtre lit la liste, pas la
                    // réponse de l'import. Dans l'autre sens elle s'ouvrirait
                    // sur des données d'avant l'import.
                    onFait={async (bilan) => {
                      setOuverte(null);
                      await charger();
                      setConfirmation(bilan);
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/*
        L'APERÇU EN GRAND.

        Le fond est cliquable pour fermer, comme partout. La planche est sur
        fond clair : ces documents sont imprimés en couleurs sur blanc, les
        poser sur du sombre les rendrait moins lisibles qu'ils ne le sont
        vraiment — et on vient justement juger de leur lisibilité.
      */}
      {apercu && (
        <div
          className="planche-apercu"
          role="presentation"
          onClick={() => setApercu(null)}
        >
          <figure
            className="planche-apercu__cadre"
            role="presentation"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={urlPlanche(
                apercu.cle,
                plancheApercu?.dateModification ?? plancheApercu?.dateCreation,
              )}
              alt={apercu.titre}
            />

            {/* CE QU'ON LIT SOUS LA PLANCHE, ET RIEN DE PLUS.
                Le titre et la clé sont déjà dans la ligne qu'on vient de
                cliquer pour ouvrir cet aperçu : les répéter ici encombre la
                seule chose qu'on est venu regarder, l'image. Ne reste que la
                mention — celle que l'élève verra, donc celle qu'on relit.

                Et RIEN quand il n'y a rien à dire : une légende vide dessine
                une bande sous l'image sans porter un mot.

                Pas de bouton « Fermer » non plus. Un clic hors du cadre ferme,
                Échap ferme — deux gestes déjà là, qu'on fait sans y penser
                quand on enchaîne vingt relectures. */}
            {(plancheApercu?.maison || plancheApercu?.licence) && (
              <figcaption>
                {plancheApercu.maison ? (
                  <span className="planches__licence">Propriété de mimia.fr</span>
                ) : (
                  <span className="planches__licence">
                    {plancheApercu.auteur} — {plancheApercu.licence}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      {/*
        LE COMPTE RENDU DE L'IMPORT.

        Deux messages possibles, et ils n'appellent pas la même réaction :
        la planche est lisible par le professeur, ou elle ne l'est pas encore.
        Un « Import réussi » unique aurait couvert les deux cas du même vernis
        rassurant.

        Le bouton « Voir la planche » est là parce que le second geste après un
        import est toujours le même : vérifier qu'on n'a pas déposé la mauvaise
        figure. C'est ainsi qu'un planisphère céleste allemand est resté rangé
        sous « continents et océans ».
      */}
      {confirmation && (() => {
        /*
          LA PLANCHE EST RELUE DANS LA LISTE FRAÎCHE, PAS DANS LA RÉPONSE DE
          L'IMPORT.

          Première version : la fenêtre affichait ce que l'appel d'import avait
          renvoyé. Elle a annoncé « illisible » sur des planches parfaitement
          décrites — la ligne juste derrière affichait la description en toutes
          lettres, la fenêtre disait le contraire. Deux sources pour un même
          fait, et c'est toujours la mauvaise qu'on montre.

          En lisant la liste, la fenêtre ne peut plus contredire ce que
          l'écran affiche : c'est le même octet.

          Le repli sur la réponse d'import ne sert qu'au cas où le rechargement
          échoue — mieux vaut une information de seconde main que rien.
        */
        const planche =
          (importees ?? []).find((p) => p.cle === confirmation.figure.cle)
          ?? confirmation.planche;

        const lisible = !!planche?.contenu;

        return (
        <div className="modale" role="presentation" onClick={() => setConfirmation(null)}>
          <div className="modale__boite" role="presentation" onClick={(e) => e.stopPropagation()}>
            <h2>
              {lisible ? 'Planche importée' : 'Planche importée, mais illisible'}
            </h2>

            <p className="modale__texte">
              <strong>{confirmation.figure.titre}</strong> est enregistrée sous{' '}
              <code>{planche?.nomFichier ?? confirmation.figure.cle}</code>.
            </p>

            {lisible ? (
              <p className="modale__texte">
                Le modèle a lu la figure : le professeur peut la montrer et la
                commenter dès la prochaine séance.
              </p>
            ) : (
              <p className="modale__note modale__note--alerte">
                Les octets sont bien en base, mais la lecture de l'image n'a
                rien donné. Le professeur affichera la figure sans savoir la
                commenter. Réimportez le même fichier pour relancer la lecture —
                à octets identiques, elle ne sera pas refacturée.
              </p>
            )}

            <div className="modale__actions">
              <button
                type="button"
                className="btn btn--fantome btn--compact"
                onClick={() => {
                  setApercu(confirmation.figure);
                  setConfirmation(null);
                }}
              >
                Voir la planche
              </button>
              <button
                type="button"
                className="btn btn--compact"
                onClick={() => setConfirmation(null)}
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
