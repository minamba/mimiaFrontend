import { useCallback, useEffect, useState } from 'react';
import {
  getReglages,
  definirReglage,
  synchroniserCatalogueStripe,
  getFilesPlanches,
  viderFilesPlanches,
  getEtatBase,
} from '../lib/api/adminApi';
import { oublierReglages } from '../lib/storage/modeTest';
import Loader from './Loader';

/**
 * Les interrupteurs du produit.
 *
 * Un écran d'exploitation, pas de configuration : ce qu'on bascule ici change
 * immédiatement ce que voit un visiteur, y compris sur la page de connexion —
 * qui est servie par un autre serveur. D'où les notes sous chaque interrupteur :
 * un administrateur doit savoir jusqu'où porte son clic.
 */

/**
 * Un interrupteur et ce qu'il commande.
 *
 * Extrait dès le second : deux blocs recopiés divergent toujours — on corrige
 * la formulation de l'un, on oublie l'autre, et l'écran finit par se
 * contredire lui-même.
 */
function Interrupteur({ titre, actif, connu, occupe, onBasculer, description, effets, note }) {
  return (
    <div className="mode">
      <div className="mode__texte">
        <strong className="mode__titre">
          {titre}

          {/* « État inconnu » et non « Désactivé » quand la lecture a échoué :
              afficher un état qu'on n'a pas lu, c'est l'inventer. Un
              administrateur qui voit « désactivé » en conclut que c'est éteint,
              alors que ce peut très bien être allumé. */}
          <span className={`mode__etat ${connu && actif ? 'mode__etat--actif' : ''}`}>
            {!connu ? 'État inconnu' : actif ? 'Activé' : 'Désactivé'}
          </span>
        </strong>

        <p className="mode__description">{description}</p>

        {effets && (
          <ul className="mode__effets">
            {effets.map((effet) => <li key={effet}>{effet}</li>)}
          </ul>
        )}

        {note && <p className="mode__note">{note}</p>}
      </div>

      {/* Le même interrupteur que celui de la détection vocale : mêmes classes,
          même dessin. Un second modèle pour la même action rendrait
          l'application plus difficile à lire qu'à écrire. */}
      <button
        type="button"
        className={`bascule ${actif ? 'bascule--active' : ''}`}
        onClick={onBasculer}
        disabled={occupe || !connu}
        role="switch"
        aria-checked={actif}
        aria-label={titre}
      >
        <span className="bascule__piste">
          <span className="bascule__bouton" />
        </span>
      </button>
    </div>
  );
}

/**
 * La synchronisation du catalogue vers Stripe.
 *
 * POURQUOI UN BOUTON ET NON UN APPEL AU DÉMARRAGE
 * ----------------------------------------------
 * Créer des tarifs chez un prestataire de paiement est une écriture, pas une
 * lecture. Elle doit être voulue, et datée.
 *
 * QUAND S'EN SERVIR
 * -----------------
 * Une fois au passage en production — les identifiants de tarifs créés dans le
 * compte de test n'existent pas dans le compte réel, et un paiement les
 * réclamerait en vain. Puis à chaque changement de prix.
 *
 * Idempotente : un tarif déjà au bon montant est réutilisé. Chez Stripe un
 * tarif ne se modifie pas — c'est voulu, les abonnements en cours continuent
 * sur l'ancien montant — donc changer un prix crée un NOUVEAU tarif, et seuls
 * les nouveaux abonnés le paient.
 */
function CatalogueStripe() {
  const [envoi, setEnvoi] = useState(false);
  const [lignes, setLignes] = useState(null);
  const [erreur, setErreur] = useState(null);

  const lancer = async () => {
    setEnvoi(true);
    setErreur(null);
    setLignes(null);

    try {
      const { data } = await synchroniserCatalogueStripe();
      setLignes(data.lignes ?? []);
    } catch (e) {
      setErreur(
        e?.response?.data?.message
        ?? "Le catalogue n'a pas pu être synchronisé.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="catalogue-stripe">
      <h3 className="catalogue-stripe__titre">Catalogue Stripe</h3>

      <p className="catalogue-stripe__note">
        Crée chez Stripe les produits et tarifs de vos formules et recharges, et
        enregistre leurs identifiants. À lancer au passage en production, puis à
        chaque changement de prix. Relancer ne crée pas de doublon.
      </p>

      {erreur && <div className="alert">{erreur}</div>}

      <button type="button" className="btn btn--compact" disabled={envoi} onClick={lancer}>
        {envoi ? 'Synchronisation…' : 'Synchroniser le catalogue'}
      </button>

      {/* Le détail ligne par ligne, et non un simple « c'est fait » : c'est la
          seule occasion de voir ce qui a été créé chez un prestataire de
          paiement, et de repérer une formule oubliée. */}
      {lignes && (
        <ul className="catalogue-stripe__lignes">
          {lignes.map((l) => (
            <li key={l.code}>
              <strong>{l.libelle}</strong> — {l.etat}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * La place occupée par la base.
 *
 * POURQUOI CE BLOC EXISTE
 * -----------------------
 * La production tourne sur SQL Server Express : dix gigaoctets, et une base
 * pleine n'accepte plus une seule écriture — ce n'est pas une lenteur, c'est
 * l'application qui s'arrête. Le chiffre ne s'obtenait qu'en ouvrant un client
 * SQL sur la production, autant dire jamais.
 *
 * On affiche la part des DOCUMENTS à part, parce que c'est le seul poste qu'on
 * pilote : il vaut « dépôts par jour × jours de rétention », et la rétention
 * est une valeur de configuration. Le reste croît avec l'usage.
 */
function PlaceBase() {
  const [base, setBase] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;

    getEtatBase()
      .then(({ data }) => { if (vivant) setBase(data); })
      .catch(() => {
        if (vivant) setErreur("La place occupée n'a pas pu être lue.");
      });

    return () => { vivant = false; };
  }, []);

  if (erreur) return <div className="alert">{erreur}</div>;
  if (!base) return null;

  // ZÉRO MÉGAOCTET N'EXISTE PAS, DONC ON NE L'AFFICHE PAS.
  //
  // `sys.database_files` n'est lisible que si le compte de l'application y a
  // droit ; sinon la requête rend zéro ligne, sans erreur. Afficher « 0 Mo »
  // ferait conclure à une base vide et rassurerait à tort — c'est la même
  // règle que « État inconnu » sur les interrupteurs plus haut.
  const lu = base.donneesMo > 0;

  const plafond = base.plafondMo ?? null;
  const part = plafond ? Math.min(100, Math.round((base.donneesMo / plafond) * 100)) : null;

  // Les mêmes trois seuils que la consommation des familles : sous 50 %, il n'y
  // a rien à dire, et une échelle continue serait jolie sans rien signifier.
  const teinte = part === null || part < 50 ? 'normal' : part < 80 ? 'proche' : 'plein';

  return (
    <div className="place-base">
      <h3 className="place-base__titre">Place occupée</h3>

      {!lu && (
        <p className="place-base__note">
          La taille des fichiers n’a pas pu être lue — le compte SQL de
          l’application n’a probablement pas accès à <code>sys.database_files</code>.
          Le détail des documents ci-dessous reste exact.
        </p>
      )}

      {lu && (plafond ? (
        <div className="conso place-base__jauge">
          <span className="conso__jauge">
            <span
              className={`conso__part conso__part--${teinte}`}
              style={{ width: `${Math.max(part, 1)}%` }}
            />
          </span>
          <span className="conso__chiffre">{part} %</span>
        </div>
      ) : (
        <p className="place-base__note">
          Édition sans plafond de taille — il n’y a pas de jauge à afficher.
        </p>
      ))}

      <ul className="place-base__lignes">
        {lu && (
          <li>
            <span>Données occupées</span>
            <strong>
              {base.donneesMo} Mo{plafond ? ` / ${Math.round(plafond / 1024)} Go` : ''}
            </strong>
          </li>
        )}
        <li>
          <span>dont documents ({base.documentsNombre})</span>
          <strong>{base.documentsMo} Mo</strong>
        </li>

        {/* HORS PLAFOND, ET C'EST DIT. Le journal occupe du disque, souvent
            plusieurs fois les données, mais Express ne borne que le fichier de
            données. L'additionner ferait paniquer pour rien. */}
        {lu && (
          <li className="place-base__hors">
            <span>Journal des transactions</span>
            <strong>{base.journalMo} Mo</strong>
          </li>
        )}
      </ul>

      <p className="place-base__note">
        {base.edition}. Le poste qu’on pilote est celui des documents : il vaut
        « dépôts par jour × jours de rétention », et la rétention est de trois
        jours. Sous 50 %, il n’y a rien à faire.
      </p>
    </div>
  );
}

/** Une file et son contenu, repliée par défaut. */
function File({ titre, cout, planches }) {
  const [ouverte, setOuverte] = useState(false);
  const vide = planches.length === 0;

  return (
    <div className={`file ${vide ? 'file--vide' : ''}`}>
      <button
        type="button"
        className="file__entete"
        onClick={() => setOuverte((o) => !o)}
        disabled={vide}
        aria-expanded={ouverte}
      >
        <span className="file__nombre">{planches.length}</span>

        <span className="file__texte">
          <strong className="file__titre">{titre}</strong>
          <span className="file__cout">{cout}</span>
        </span>

        {!vide && <span className="file__chevron">{ouverte ? '▾' : '▸'}</span>}
      </button>

      {/* LA PLUS RÉCENTE EN HAUT, comme le worker les prend. La liste doit se
          lire comme l'ordre de traitement, sinon elle ne dit pas ce qui va
          être payé en premier. */}
      {ouverte && (
        <ul className="file__lignes">
          {planches.map((p) => (
            <li key={p.cle}>
              <code>{p.cle}</code>
              <span className="file__matiere">{p.matiereCode}</span>
              <span className="file__poids">{Math.round(p.taille / 1024)} Ko</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Ce qui attend d'être traité par le worker des planches.
 *
 * POURQUOI CET ÉCRAN EXISTE
 * -------------------------
 * Le journal des appels dit ce qui a été dépensé ; il ne dit jamais ce qu'il
 * RESTE à dépenser. La nuit où la facture est montée, il a fallu interroger la
 * base à la main pour savoir combien de planches attendaient derrière.
 *
 * Trois files et non un total : décrire coûte une lecture d'image, cartographier
 * en coûte une seconde, créditer interroge une base extérieure. Un chiffre
 * unique cacherait laquelle s'emballe.
 */
function FilesPlanches() {
  const [files, setFiles] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [vidage, setVidage] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);

    try {
      const { data } = await getFilesPlanches();
      setFiles({
        aDecrire: data?.aDecrire ?? [],
        aCartographier: data?.aCartographier ?? [],
        aCrediter: data?.aCrediter ?? [],
      });
    } catch {
      setErreur("Les files n'ont pas pu être lues.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const vider = async () => {
    setVidage(true);
    setErreur(null);

    try {
      await viderFilesPlanches();
      setConfirme(false);
      await charger();
    } catch {
      setErreur("Les files n'ont pas pu être vidées.");
    } finally {
      setVidage(false);
    }
  };

  const total = files
    ? files.aDecrire.length + files.aCartographier.length + files.aCrediter.length
    : 0;

  return (
    <div className="files-planches">
      <h3 className="files-planches__titre">Files des planches</h3>

      <p className="files-planches__note">
        Ce que le worker des planches traitera au prochain import. Il ne tourne
        pas au chronomètre : il dort jusqu’à ce qu’une planche soit importée,
        vide ses files, et se rendort. La plus récente d’abord.
      </p>

      {erreur && <div className="alert">{erreur}</div>}

      {chargement && !files ? (
        <Loader texte="Lecture des files…" />
      ) : files && (
        <>
          <div className="files-planches__liste">
            <File
              titre="À décrire"
              cout="Une lecture d’image par planche"
              planches={files.aDecrire}
            />
            <File
              titre="À cartographier"
              cout="Une seconde lecture, pour placer les repères"
              planches={files.aCartographier}
            />
            <File
              titre="À créditer"
              cout="Recherche de l’origine, sans lecture d’image"
              planches={files.aCrediter}
            />
          </div>

          <div className="files-planches__actions">
            <button
              type="button"
              className="btn btn--compact btn--fantome"
              onClick={charger}
              disabled={chargement || vidage}
            >
              {chargement ? 'Lecture…' : 'Rafraîchir'}
            </button>

            {/* DEUX CLICS, PAS UN. Vider marque définitivement des dizaines de
                planches comme non traitées : c'est réversible en les
                réimportant, mais ça ne doit pas partir d'un clic distrait. */}
            {total > 0 && (confirme ? (
              <>
                <button
                  type="button"
                  className="btn btn--compact btn--danger"
                  onClick={vider}
                  disabled={vidage}
                >
                  {vidage ? 'Vidage…' : `Confirmer : vider ${total} attente(s)`}
                </button>

                <button
                  type="button"
                  className="btn btn--compact btn--fantome"
                  onClick={() => setConfirme(false)}
                  disabled={vidage}
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn--compact btn--fantome"
                onClick={() => setConfirme(true)}
              >
                Vider les files
              </button>
            ))}
          </div>

          <p className="files-planches__avertissement">
            Vider n’appelle PAS le modèle et ne supprime aucune planche : chaque
            attente est marquée traitée, avec un contenu qui dit qu’elle ne l’a
            pas été. Les planches concernées s’afficheront toujours au tableau,
            mais sans repères cliquables. Réimporter une planche la remet dans
            la file.
          </p>
        </>
      )}
    </div>
  );
}

export default function Modes() {
  const [reglages, setReglages] = useState({
    modeTest: false,
    compteTest: true,
    essaisOuverts: true,
    tachesDeFond: true,
    maintenance: false,
  });
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(null);
  const [erreur, setErreur] = useState(null);

  // Les réglages ont-ils été LUS ? Distinct de « chargement terminé » : après
  // un échec, le chargement est fini mais on ne sait rien.
  const [lus, setLus] = useState(false);

  useEffect(() => {
    let vivant = true;

    getReglages()
      .then(({ data }) => {
        if (!vivant) return;

        setReglages({
          modeTest: Boolean(data?.modeTest),
          // Actif par défaut : le compte existe pour servir, et un
          // administrateur qui n'y a jamais touché s'attend à ce qu'il marche.
          compteTest: data?.compteTest !== false,

          // Ouverts par défaut, pour la même raison : ne jamais fermer une
          // porte parce qu'un réglage n'a pas encore été posé.
          essaisOuverts: data?.essaisOuverts !== false,
          tachesDeFond: data?.tachesDeFond !== false,

          // Éteinte par défaut : une lecture qui échoue ne doit jamais
          // conclure que le site est fermé.
          maintenance: Boolean(data?.maintenance),
        });

        setLus(true);
      })
      .catch(() => {
        if (vivant) setErreur("Les réglages n'ont pas pu être chargés.");
      })
      .finally(() => {
        if (vivant) setChargement(false);
      });

    return () => { vivant = false; };
  }, []);

  const basculer = async (cle, champ) => {
    const nouveau = !reglages[champ];

    setEnvoi(cle);
    setErreur(null);

    try {
      await definirReglage(cle, nouveau);
      setReglages((etat) => ({ ...etat, [champ]: nouveau }));

      // Les drapeaux publics sont retenus le temps d'une session : sans cet
      // oubli, la barre de navigation et l'accueil garderaient l'ancien état
      // jusqu'au rechargement. Vrai pour les deux réglages publics, pas
      // seulement le mode test — l'essai en fait partie depuis qu'il pilote
      // le bouton de l'accueil.
      if (cle === 'MODE_TEST' || cle === 'ESSAIS_OUVERTS' || cle === 'MAINTENANCE_ACTIVE') {
        oublierReglages();
      }
    } catch {
      setErreur("Le réglage n'a pas pu être enregistré.");
    } finally {
      setEnvoi(null);
    }
  };

  if (chargement) return <Loader texte="Chargement des réglages…" />;

  return (
    <div className="bloc-profil">
      {erreur && <div className="alert">{erreur}</div>}

      <div className="modes">
        {/* EN PREMIER, ET CE N'EST PAS DE LA MISE EN PAGE. C'est le seul
            interrupteur qui remplace le site entier par une autre page : le
            ranger au milieu des autres le ferait basculer par erreur, et le
            chercher sous la pression le ferait manquer. */}
        <Interrupteur
          titre="Maintenance"
          actif={reglages.maintenance}
          connu={lus}
          occupe={envoi === 'MAINTENANCE_ACTIVE'}
          onBasculer={() => basculer('MAINTENANCE_ACTIVE', 'maintenance')}
          description="Le rideau. Les visiteurs voient une page d’attente soignée au lieu du site ; vous, connecté en administrateur, continuez de le parcourir normalement."
          effets={[
            'Tout le site est remplacé par la page d’attente, barre de navigation et pied de page compris.',
            'Vous passez au travers tant que votre session administrateur est ouverte.',
            'La page d’attente porte un lien « Accès administrateur » : c’est par là qu’on rentre depuis un autre appareil, ou après expiration de session.',
            'Les élèves déjà en cours voient la page d’attente à leur prochaine navigation.',
          ]}
          note="C’EST UN RIDEAU, PAS UN VERROU. L’API continue de répondre derrière — sans quoi vous ne pourriez plus rien faire, pas même relever le rideau. Pour fermer vraiment le service, il faut arrêter l’API : c’est un autre geste. Ne comptez donc pas là-dessus pour protéger quoi que ce soit."
        />

        <Interrupteur
          titre="Mode test"
          actif={reglages.modeTest}
          connu={lus}
          occupe={envoi === 'MODE_TEST'}
          onBasculer={() => basculer('MODE_TEST', 'modeTest')}
          description="Le service passe en accès privé : personne ne peut créer de compte, et seuls les comptes déjà existants se connectent."
          effets={[
            'Le lien « Tarifs » disparaît de la barre de navigation.',
            'La connexion par Google est masquée.',
            'Le lien « Créer un compte parent » est masqué.',
            'Le lien « Mot de passe oublié ? » est masqué.',
            'La page de connexion affiche « Bêta test · accès privé ».',
          ]}
          note="La page de connexion est servie par le serveur d'identité : il relit ce réglage à chaque affichage, le changement est donc immédiat pour lui aussi."
        />

        <Interrupteur
          titre="Compte de démonstration"
          actif={reglages.compteTest}
          connu={lus}
          occupe={envoi === 'COMPTE_TEST_ACTIF'}
          onBasculer={() => basculer('COMPTE_TEST_ACTIF', 'compteTest')}
          description="Le compte test@mimia.fr, pour montrer le produit avec les yeux d'un parent ordinaire."
          effets={[
            'Éteint, la connexion est refusée comme si l’adresse n’existait pas.',
            'Le compte n’est jamais supprimé : historique, fiches et évaluations sont conservés.',
            'Le rallumer le rend utilisable immédiatement, avec tout son contenu.',
          ]}
          note="Le message d’erreur est volontairement le même que pour une adresse inconnue : dire « ce compte est désactivé » confirmerait qu’il existe, et donnerait une adresse valide à qui cherche."
        />

        <Interrupteur
          titre="Essai gratuit"
          actif={reglages.essaisOuverts}
          connu={lus}
          occupe={envoi === 'ESSAIS_OUVERTS'}
          onBasculer={() => basculer('ESSAIS_OUVERTS', 'essaisOuverts')}
          description="Les trente minutes offertes aux nouveaux venus. Fermées, le site continue de vendre normalement — seule la porte d’entrée gratuite disparaît."
          effets={[
            '« Commencer gratuitement » devient « S’inscrire maintenant » sur l’accueil.',
            'Le bloc « Essayez d’abord » disparaît de la page des tarifs.',
            'Plus aucun chemin n’ouvre d’essai, y compris en appelant l’API directement.',
            'Les essais DÉJÀ en cours continuent jusqu’à leur terme.',
          ]}
          note="Les essais en cours ne sont pas interrompus : couper un essai commencé reviendrait à retirer une promesse déjà faite. Le réglage ne ferme que la porte d’entrée."
        />

        <Interrupteur
          titre="Tâches de fond"
          actif={reglages.tachesDeFond}
          connu={lus}
          occupe={envoi === 'TACHES_DE_FOND_ACTIVES'}
          onBasculer={() => basculer('TACHES_DE_FOND_ACTIVES', 'tachesDeFond')}
          description="Le coupe-circuit de la facture. Les travaux automatiques qui appellent le modèle en dehors des cours : lire les planches importées, y placer les repères, archiver le texte des documents envoyés. Utiles, mais jamais urgents."
          effets={[
            'Les planches importées restent sans description ni repères tant que c’est éteint.',
            'Les documents envoyés par les élèves restent PARFAITEMENT lisibles : le professeur reçoit le document lui-même, pas une transcription.',
            'Seul son archivage attend — le texte relevé ne sert qu’après l’effacement du fichier, trois jours plus tard, si l’élève rouvre la vieille conversation.',
            'Rien n’est perdu : un document non transcrit n’est jamais effacé. Il occupe de la place, voilà tout.',
            'Aucun appel au modèle n’est fait hors des cours.',
          ]}
          note="Prend effet au prochain travail — pas besoin de redéployer. Plus rien ne tourne au chronomètre : les planches dorment jusqu’au prochain import, l’archivage des documents jusqu’au prochain envoi d’élève. Éteint, l’arriéré attend sans rien coûter, et repartira au prochain réveil."
        />
      </div>

      <PlaceBase />

      <FilesPlanches />

      <CatalogueStripe />
    </div>
  );
}
