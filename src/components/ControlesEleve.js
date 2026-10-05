import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getControles, getMatieresEleve } from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import BoutonAjoutControle from './BoutonAjoutControle';
import ControleForm from './ControleForm';
import Loader from './Loader';
import Onglets from './Onglets';
import OuvertureSeance from './OuvertureSeance';
import { ControleCarte } from './MesControles';

/**
 * REGROUPÉS PAR MATIÈRE, ET C'EST LE PROFESSEUR QUI SIGNE LE GROUPE.
 *
 * Voulu par Camara le 13/09/2026 : la liste posait tous les contrôles à la
 * suite, dans l'ordre du serveur — matières mélangées. Un enfant qui a trois
 * contrôles cette semaine devait les distinguer un par un ; groupés, il voit
 * d'un coup d'œil « il m'en reste deux en maths, un en histoire ».
 *
 * L'ORDRE DES GROUPES SUIT L'URGENCE, PAS L'ALPHABET : la fonction ne trie
 * rien elle-même — elle garde l'ordre de PREMIÈRE RENCONTRE de chaque
 * matière. Comme `controles` arrive déjà trié par date (voir le dépôt), le
 * premier contrôle rencontré pour une matière est le sien le plus proche, et
 * c'est donc cette matière qui ouvre la liste des groupes.
 *
 * `matiereId`, PAS `matiereLibelle`, sert de clé : deux professeurs de la
 * même matière (les deux Yann) doivent rester deux groupes séparés.
 */
function grouperParMatiere(controles) {
  const groupes = new Map();

  controles.forEach((controle) => {
    if (!groupes.has(controle.matiereId)) {
      groupes.set(controle.matiereId, {
        matiereId: controle.matiereId,
        matiereLibelle: controle.matiereLibelle,
        controles: [],
      });
    }

    groupes.get(controle.matiereId).controles.push(controle);
  });

  return [...groupes.values()];
}

/**
 * La page « Mes contrôles » : tout ce qui est programmé, à venir et passé.
 *
 * LES CONTRÔLES PASSÉS NE SONT QU'UNE LISTE, pour l'instant. Leur donner une
 * suite — « comment ça s'est passé ? », la note obtenue — est prévu, mais
 * seulement une fois la préparation consolidée : c'est le point 11 du dossier,
 * volontairement laissé de côté.
 */
const ONGLETS = [
  { cle: 'avenir', libelle: 'À venir' },
  { cle: 'passes', libelle: 'Passés' },
];

export default function ControlesEleve() {
  const { eleveId } = useParams();
  const navigate = useNavigate();

  // L'ONGLET PEUT ÊTRE DEMANDÉ PAR L'ADRESSE — depuis le 20/09/2026, pour que
  // « Voir les contrôles passés » arrive directement sur les passés plutôt que
  // sur « À venir », laissant l'enfant chercher lui-même. Une valeur inconnue
  // retombe sur « À venir » : l'adresse ne décide pas de ce qui existe.
  const [parametres] = useSearchParams();
  const demande = parametres.get('onglet');

  const [onglet, setOnglet] = useState(
    ONGLETS.some((o) => o.cle === demande) ? demande : 'avenir',
  );
  const [controles, setControles] = useState(null);
  const [matieres, setMatieres] = useState([]);

  // Le contrôle et le mode de la séance qu'on s'apprête à ouvrir, le temps
  // de la durée et du casque.
  const [ouverture, setOuverture] = useState(null);
  const [formulaire, setFormulaire] = useState(false);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(() => {
    setControles(null);

    return getControles(eleveId, onglet, 50)
      .then(({ data }) => setControles(data ?? []))
      .catch(() => setErreur("Tes contrôles n'ont pas pu être chargés."));
  }, [eleveId, onglet]);

  useEffect(() => { charger(); }, [charger]);

  useEffect(() => {
    let vivant = true;

    getMatieresEleve(eleveId)
      .then(({ data }) => { if (vivant) setMatieres((data ?? []).filter((m) => m.active)); })
      .catch(() => { /* Le formulaire le dira lui-même. */ });

    return () => { vivant = false; };
  }, [eleveId]);

  // LE MODE VOYAGE AVEC LE CONTRÔLE : c'est lui qui dit au professeur de quoi
  // parler — préparer ce contrôle, ou en faire le point une fois passé.
  //
  // LES DEUX QUESTIONS D'AVANT COURS, COMME PARTOUT — Camara, le 26/09/2026 :
  // « faire le point » ouvrait le cours sans demander le casque. Une séance de
  // contrôle est une vraie séance, avec son minuteur et son micro : la durée,
  // puis le casque, comme depuis l'accueil.
  const preparer = (controle) => setOuverture({ controle, mode: 'controle' });

  const faireLePoint = (controle) => setOuverture({ controle, mode: 'bilan' });

  const groupes = controles !== null ? grouperParMatiere(controles) : [];

  return (
    <section className="page page--large">
      <Link to={`/eleves/${eleveId}/matieres#mes-controles`} className="lien-retour">← Retour</Link>

      {ouverture && (
        <OuvertureSeance
          matiere={matieres.find((m) => m.id === ouverture.controle.matiereId)
            ?? { id: ouverture.controle.matiereId, profPrenom: 'Ton professeur' }}
          onAnnuler={() => setOuverture(null)}
          onOuvrir={(duree, casque) => navigate(
            `/eleves/${eleveId}/matieres/${ouverture.controle.matiereId}/chat`
            + `?duree=${duree}&casque=${casque ? 1 : 0}`
            + `&mode=${ouverture.mode}&controleId=${ouverture.controle.id}`,
          )}
        />
      )}

      <header className="controles-page__entete">
        <h1>Mes contrôles</h1>
        <BoutonAjoutControle onClick={() => setFormulaire(true)} />
      </header>

      <Onglets items={ONGLETS} actif={onglet} onChoisir={setOnglet} etiquette="Mes contrôles" />

      {erreur && <div className="alert">{erreur}</div>}

      {controles === null && !erreur && <Loader texte="Chargement…" />}

      {controles !== null && controles.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">
            {onglet === 'avenir' ? 'Pas encore de contrôle prévu.' : 'Aucun contrôle passé.'}
          </p>
          <p>
            {onglet === 'avenir'
              ? 'Ajoute ton prochain contrôle pour que ton professeur t’aide à le préparer.'
              : 'Les contrôles que tu auras passés resteront ici, avec ce que tu avais travaillé.'}
          </p>
        </div>
      )}

      {groupes.map((groupe) => (
        <section
          key={groupe.matiereId}
          className="controles-groupe"
          style={styleMatiere({ matiereLibelle: groupe.matiereLibelle })}
        >
          <h2 className="controles-groupe__titre">
            <span className="controles-groupe__point" aria-hidden="true" />
            {groupe.matiereLibelle}
            <span className="controles-groupe__compte">{groupe.controles.length}</span>
          </h2>

          <ul className="controles-liste">
            {groupe.controles.map((controle) => (
              <ControleCarte
                key={controle.id}
                controle={{ ...controle, eleveId }}
                onPreparer={preparer}
                onBilan={faireLePoint}
                passe={onglet === 'passes'}
              />
            ))}
          </ul>
        </section>
      ))}

      {formulaire && (
        <div className="modale" role="dialog" aria-modal="true" aria-label="Ajouter un contrôle">
          <div className="modale__boite">
            <ControleForm
              eleveId={eleveId}
              matieres={matieres}
              jour={null}
              onEnregistre={() => { setFormulaire(false); charger(); }}
              onAnnule={() => setFormulaire(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
