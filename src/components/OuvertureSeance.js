import { useState } from 'react';
import { useSelector } from 'react-redux';
import casquePng from '../assets/casque.webp';
import enceintePng from '../assets/enceinte.webp';
import { estIOS } from '../lib/storage/appareil';

/*
 * AVANT D'ENTRER EN SÉANCE : LA DURÉE, PUIS LE CASQUE.
 *
 * Sortis de `GrilleMatieres` le 26/09/2026 — Camara : « pour faire le point
 * sur un contrôle, on rentre directement dans le cours sans savoir si
 * l'enfant a un casque ». Seul l'accueil posait les deux questions ; la fiche
 * d'un contrôle et « Mes contrôles » ouvraient la séance sans rien demander.
 * Un seul endroit désormais, pour toutes les portes d'entrée d'une séance.
 */

/**
 * Durées de séance proposées avant d'entrer en cours.
 *
 * Un cours sans fin annoncée s'étire ou s'interrompt n'importe où. Fixer la
 * durée à l'avance donne un cadre : l'élève sait combien de temps il s'engage,
 * et le professeur sait quand conclure proprement.
 */
const DUREES = [
  { minutes: 15, libelle: 'Rapide', detail: 'Une notion, une question', ton: 1 },
  { minutes: 25, libelle: 'Court', detail: 'De quoi avancer sur un point', ton: 2 },
  { minutes: 35, libelle: 'Complet', detail: 'Le format habituel', ton: 3 },
  { minutes: 45, libelle: 'Long', detail: 'Pour un chapitre entier', ton: 4 },
];

/**
 * Cadran d'horloge dont le secteur rempli vaut la durée choisie.
 *
 * Un enfant lit « trois quarts de cadran » avant de lire « 45 » : le dessin
 * donne la durée relative que le nombre seul ne montre pas. On part de midi et
 * on tourne dans le sens des aiguilles, comme sur une vraie montre.
 */
function CadranDuree({ minutes }) {
  const R = 15;
  const angle = (minutes / 60) * 2 * Math.PI;
  const x = 24 + R * Math.sin(angle);
  const y = 24 - R * Math.cos(angle);
  const grandArc = minutes > 30 ? 1 : 0;

  return (
    <svg className="duree__cadran" viewBox="0 0 48 48" aria-hidden="true">
      {/* Boîtier : le cercle extérieur et les repères des quarts d'heure. */}
      <circle className="duree__boitier" cx="24" cy="24" r="19" />
      <path className="duree__repere" d="M24 3.5 v3 M44.5 24 h-3 M24 44.5 v-3 M3.5 24 h3" />

      {/* Secteur écoulé : c'est lui qui porte la couleur pleine. */}
      <path className="duree__secteur" d={`M24 24 L24 ${24 - R} A${R} ${R} 0 ${grandArc} 1 ${x} ${y} Z`} />

      {/* Aiguille des minutes, posée sur la fin du secteur. */}
      <path className="duree__aiguille" d={`M24 24 L${x} ${y}`} />
      <circle className="duree__axe" cx="24" cy="24" r="2" />
    </svg>
  );
}

/* ------------------------------------------ séances de test, administration
   Séances courtes servant à vérifier le comportement de FIN : la conclusion,
   le compte rendu, la fiche de révision. Tout cela ne se produit qu'au bout
   d'un cours, et personne ne vérifiera jamais rien si chaque essai coûte
   trente-cinq minutes.

   DEUX DURÉES, PARCE QU'ELLES NE SERVENT PAS À LA MÊME CHOSE.

   Une minute vérifie la MÉCANIQUE : la clôture part-elle, le compte rendu
   s'écrit-il, la fiche apparaît-elle ? On n'a rien à dire au professeur, on
   regarde ce qui se déclenche. Le dernier préavis tombe à trois secondes de la
   fin, la séance se déroule donc normalement, en accéléré.

   Six minutes vérifient le DÉROULÉ : il reste de quoi poser deux questions,
   voir la figure s'afficher, et juger si la conclusion arrive au bon moment
   plutôt que de constater qu'elle arrive.

   Elles NE DISPARAISSENT PAS en production : elles ne sont affichées qu'aux
   comptes administrateurs, ce qui les rend inoffensives et les garde là où
   elles servent. Les valeurs 1 et 6 restent donc aussi dans DUREES_VALIDES de
   Chat.js — les retirer casserait les séances de test elles-mêmes.

   Aucun risque côté quota : une séance plus courte consomme MOINS d'heures.
   Un parent qui devinerait le paramètre d'URL se priverait, il ne gagnerait
   rien.
   ---------------------------------------------------------------------- */
const DUREES_TEST = [
  {
    minutes: 1,
    detail: 'fin immédiate — pour vérifier la clôture et le compte rendu',
  },
  {
    minutes: 6,
    detail: 'assez long pour un vrai échange avant la fin',
  },
];

/**
 * La question du casque, posée juste avant d'entrer en cours.
 *
 * POURQUOI ELLE EXISTE
 * --------------------
 * Le micro reste ouvert pendant que le professeur parle — c’est ce qui
 * permet à l'élève de l'interrompre. Sur un haut-parleur, ce micro capte la
 * voix du professeur, la transcrit, et la lui renvoie comme une
 * interruption : le professeur se coupe lui-même, en boucle.
 *
 * ON NE PEUT PAS LE DEVINER DEPUIS LE NAVIGATEUR. Aucune interface web ne
 * dit si le son sort d'un casque ou d'un haut-parleur — l'annulation d'écho
 * du navigateur aide, mais elle échoue précisément dans le cas qui nous
 * occupe : une voix de synthèse jouée fort, à quelques centimètres du micro.
 * La seule source fiable est celle qui est assise devant.
 *
 * POSÉE À CHAQUE COURS, et pas une fois pour toutes : un enfant met son
 * casque le lundi et écoute sur la tablette du salon le mercredi. Une
 * réponse mémorisée serait fausse une fois sur deux, et fausse en silence.
 */
export function ChoixCasque({ matiere, onRepondre, onAnnuler }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-casque">
      <div className="modale__boite modale__boite--casque">
        <h2 id="titre-casque">Tu as un casque ou des écouteurs ?</h2>

        <p className="modale__texte">
          Avec un casque, tu peux couper la parole à {matiere.profPrenom} quand tu
          veux. Sans casque, ton micro entendrait sa voix et croirait que c’est
          toi qui parles.
        </p>

        {/* LE MODE SILENCIEUX D’IOS, ET POURQUOI L’AVERTISSEMENT EST ICI.

            Actif, il coupe le son du navigateur SANS RIEN AFFICHER dans la
            page : pas d’icône, pas d’erreur, aucun état lisible en
            JavaScript. Le professeur parle, le micro marche, le graphe
            audio tourne — et l’élève n’entend rien. Le symptôme ressemble
            trait pour trait à une panne de l’application.

            ON NE NOMME AUCUN BOUTON, ET C’EST VOULU. La première version
            disait « le petit bouton sur la tranche » — vrai jusqu’à
            l’iPhone 14, faux depuis : le 15 l’a remplacé par un bouton
            configurable, et le silencieux s’active aussi depuis le centre
            de contrôle ou un mode de concentration. Envoyer chercher un
            bouton qui n’existe pas fait douter de tout le reste du
            message. On nomme donc l’ÉTAT, que l’élève sait retrouver, et
            pas le chemin qui y mène, qui change avec le modèle.

            DANS CETTE POPUP ET PAS AILLEURS. C’est déjà le moment où on
            parle de son, c’est juste avant d’en avoir besoin, et surtout
            c’est le seul instant où l’élève a encore le téléphone en main
            pour vérifier. Un avertissement à la connexion serait lu vingt
            minutes trop tôt, puis oublié.

            SUR IOS SEULEMENT : aucun Android n’a ce bouton, et l’y envoyer
            chercher lui ferait douter du reste. */}
        {estIOS() && (
          <p className="modale__silence">
            <span aria-hidden="true">🔇</span>
            <span>
              <strong>Vérifie que ton téléphone n’est pas en silencieux.</strong>{' '}
              Sinon tu n’entendras pas {matiere.profPrenom}, même si tout le
              reste fonctionne.
            </span>
          </p>
        )}

        <div className="casque-choix">
          <button
            type="button"
            className="casque-option casque-option--oui"
            onClick={() => onRepondre(true)}
          >
            <span className="casque-option__icone" aria-hidden="true">
              <img src={casquePng} alt="" />
            </span>
            <span className="casque-option__titre">Oui, j’ai un casque</span>
            <span className="casque-option__detail">
              Je peux interrompre le prof en parlant
            </span>
          </button>

          <button
            type="button"
            className="casque-option"
            onClick={() => onRepondre(false)}
          >
            <span className="casque-option__icone" aria-hidden="true">
              <img src={enceintePng} alt="" />
            </span>
            <span className="casque-option__titre">Non, haut-parleur</span>
            <span className="casque-option__detail">
              J’attends que le prof ait fini pour parler
            </span>
          </button>
        </div>

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onAnnuler}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

/** Choix de la durée, avant d'entrer en cours. */
export function ChoixDuree({ matiere, onValider, onAnnuler, estAdmin }) {
  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="titre-duree">
      <div className="modale__boite modale__boite--duree">
        <h2 id="titre-duree">Combien de temps aujourd'hui ?</h2>

        <p className="modale__texte">
          {matiere.profPrenom} adaptera le cours à la durée choisie, et préviendra
          cinq minutes avant la fin.
        </p>

        <div className="durees">
          {DUREES.map((duree) => (
            <button
              key={duree.minutes}
              type="button"
              className="duree"
              style={{ '--ton': `var(--duree-${duree.ton})` }}
              onClick={() => onValider(duree.minutes)}
            >
              <CadranDuree minutes={duree.minutes} />
              <span className="duree__minutes">
                {duree.minutes}
                <span className="duree__unite">min</span>
              </span>
              <span className="duree__libelle">{duree.libelle}</span>
              <span className="duree__detail">{duree.detail}</span>
            </button>
          ))}
        </div>

        {/* Réservée à l'administration, et elle y reste.
            -------------------------------------------
            Elle devait disparaître avant la production ; elle est plus utile
            gardée. Vérifier le comportement de fin — préavis, conclusion,
            compte rendu, fiche — demande d'aller au bout d'une séance, et
            personne ne le fera si chaque essai coûte trente-cinq minutes.

            Un parent, lui, ne doit pas la voir : six minutes ne sont pas un
            cours, et proposer un format qui ne sert qu'à nous brouillerait le
            choix des quatre vraies durées. */}
        {estAdmin && DUREES_TEST.map((test) => (
          <button
            key={test.minutes}
            type="button"
            className="duree-test"
            onClick={() => onValider(test.minutes)}
          >
            Test · {test.minutes} minute{test.minutes > 1 ? 's' : ''}
            <span>{test.detail}</span>
          </button>
        ))}

        <div className="modale__actions">
          <button type="button" className="btn-ghost" onClick={onAnnuler}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}


/**
 * LES DEUX QUESTIONS À LA SUITE, puis l'ouverture — pour les portes d'entrée
 * qui n'ont pas à gérer les étapes elles-mêmes (fiche d'un contrôle, « Mes
 * contrôles »). DEUX ÉTAPES, ET LA DURÉE D'ABORD : la question du casque tient
 * à l'équipement, pas au cours ; la poser en premier ferait commencer par de
 * l'intendance quelqu'un qui vient travailler.
 *
 * `onOuvrir(duree, casque)` reçoit les deux réponses ; `onAnnuler` ferme tout.
 */
export default function OuvertureSeance({ matiere, onOuvrir, onAnnuler }) {
  const [duree, setDuree] = useState(null);

  // Les durées de test ne s'affichent qu'à l'administration — lu ici, pour
  // que les pages qui ouvrent une séance n'aient pas à le savoir.
  const estAdmin = useSelector((state) => state.auth?.estAdmin) ?? false;

  if (!matiere) return null;

  if (duree === null) {
    return (
      <ChoixDuree
        matiere={matiere}
        estAdmin={estAdmin}
        onValider={setDuree}
        onAnnuler={onAnnuler}
      />
    );
  }

  return (
    <ChoixCasque
      matiere={matiere}
      onRepondre={(casque) => onOuvrir(duree, casque)}
      onAnnuler={onAnnuler}
    />
  );
}
