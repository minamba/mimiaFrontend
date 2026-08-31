import { useEffect, useRef, useState } from 'react';
import { chargerPieceJointe } from '../lib/api/chatApi';

/**
 * Ce que l'élève a le droit de choisir.
 *
 * La même liste que le serveur, et pour une raison précise : sur téléphone,
 * `accept` filtre ce que la galerie propose. Sans lui, l'enfant voit ses
 * vidéos, en choisit une, et se prend un refus après trente secondes d'envoi.
 */
export const TYPES_ACCEPTES = 'image/png,image/jpeg,image/gif,image/webp,application/pdf';

/** Le même plafond que le serveur, pour refuser AVANT de faire monter le fichier. */
export const TAILLE_MAX = 5 * 1024 * 1024;

/**
 * Côté le plus long d'une image, après réduction.
 *
 * Ce n'est pas un chiffre choisi au hasard : c'est la taille au-delà de
 * laquelle le modèle redimensionne lui-même avant de lire. Envoyer plus ne
 * rend donc RIEN plus lisible — ni pour la professeure, ni pour l'élève — et
 * ne fait que payer trois fois : à l'envoi depuis le téléphone, en base, puis
 * à chaque tour de la séance où le document repart vers le modèle.
 */
const COTE_MAX = 1568;

/**
 * POURQUOI RÉDUIRE ICI PLUTÔT QUE SUR LE SERVEUR
 * ---------------------------------------------
 * Parce que le maillon lent est le téléphone de l'élève, pas le serveur. Une
 * photo de trois mégaoctets sur le réseau d'un collège met plusieurs dizaines
 * de secondes à monter ; réduite à trois cents kilo-octets, elle part tout de
 * suite. Réduire côté serveur aurait fait voyager les trois mégaoctets quand
 * même.
 *
 * Et accessoirement : aucune bibliothèque à ajouter. Les deux candidates .NET
 * étaient soit porteuses d'une faille connue, soit sous licence conditionnelle
 * — pour décoder des fichiers envoyés par des enfants, ni l'une ni l'autre.
 *
 * Le serveur garde son plafond de cinq mégaoctets : un client qui ne réduirait
 * pas reste refusé. La réduction est une optimisation, pas un contrôle.
 */
async function reduire(fichier) {
  if (!fichier.type.startsWith('image/')) return fichier;

  // Un GIF peut être animé : le passer par un canvas n'en garderait que la
  // première image. On ne touche pas.
  if (fichier.type === 'image/gif') return fichier;

  try {
    const source = await createImageBitmap(fichier);
    const facteur = COTE_MAX / Math.max(source.width, source.height);

    // Déjà assez petite : la réencoder ne ferait que dégrader pour rien.
    if (facteur >= 1) {
      source.close?.();
      return fichier;
    }

    const toile = window.document.createElement('canvas');
    toile.width = Math.round(source.width * facteur);
    toile.height = Math.round(source.height * facteur);
    toile.getContext('2d').drawImage(source, 0, 0, toile.width, toile.height);
    source.close?.();

    const reduit = await new Promise((resoudre) => {
      toile.toBlob(resoudre, 'image/jpeg', 0.85);
    });

    if (!reduit || reduit.size >= fichier.size) return fichier;

    // Extension alignée sur le type réel : le serveur lit la signature des
    // octets, mais le nom reste affiché à l'élève et à la professeure.
    const nom = fichier.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([reduit], `${nom}.jpg`, { type: 'image/jpeg' });
  } catch {
    // Format exotique, canvas indisponible, image corrompue : on envoie
    // l'original. Le serveur tranchera — c'est lui qui décide, pas nous.
    return fichier;
  }
}

export { reduire };

const lisible = (octets) => {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
};

/**
 * Le trombone, à côté du micro.
 *
 * Un `<input type="file">` invisible piloté par un bouton : l'input natif ne
 * se met pas en forme, et il n'a pas de libellé accessible utilisable. On
 * garde donc l'input pour ce qu'il sait faire — ouvrir l'appareil photo ou la
 * galerie sur téléphone — et le bouton pour tout le reste.
 */
export function BoutonPieceJointe({ onFichier, disabled, libelle }) {
  const champRef = useRef(null);

  return (
    <>
      <input
        ref={champRef}
        type="file"
        accept={TYPES_ACCEPTES}
        className="piece-jointe__champ"
        tabIndex={-1}
        onChange={(evenement) => {
          const fichier = evenement.target.files?.[0];

          // On vide TOUJOURS l'input, même quand le fichier est refusé plus
          // loin : sans ça, rechoisir le même fichier ne déclenche aucun
          // `change`, et l'élève clique sans que rien ne se passe.
          evenement.target.value = '';

          if (fichier) onFichier(fichier);
        }}
      />

      {/* LE MÊME CHAMP DE FICHIER, DEUX APPARENCES.
          Le trombone de la barre de saisie se suffit d'une icône ; la copie
          de dictée, elle, a besoin d'un bouton qu'un enfant ne cherche pas —
          c'est le geste qui termine l'exercice, pas une option. */}
      <button
        type="button"
        className={libelle ? 'btn btn--compact piece-jointe__rendre' : 'piece-jointe__bouton'}
        onClick={() => champRef.current?.click()}
        disabled={disabled}
        title={libelle ?? 'Envoyer une photo ou un PDF'}
        aria-label={libelle ?? 'Envoyer une photo de ton exercice ou un PDF'}
      >
        <span aria-hidden="true">{libelle ? '📷' : '📎'}</span>
        {libelle && <span className="piece-jointe__libelle">{libelle}</span>}
      </button>
    </>
  );
}

/**
 * Le document accroché au message qu'on est en train d'écrire.
 *
 * Il s'affiche AU-DESSUS de la saisie, pas dans la conversation : tant que
 * l'élève n'a pas envoyé, il n'a rien dit. C'est ce qui lui laisse le temps
 * d'écrire ce qui le bloque — un document seul obligerait le professeur à
 * deviner s'il s'agit d'un exercice à faire, d'une leçon ou d'un contrôle.
 */
export function VignetteEnAttente({ fichier, apercu, enCours, erreur, onRetirer }) {
  if (!fichier && !erreur) return null;

  if (erreur) {
    return (
      <div className="piece-jointe piece-jointe--erreur" role="alert">
        <span className="piece-jointe__texte">{erreur}</span>
        <button
          type="button"
          className="piece-jointe__retirer"
          onClick={onRetirer}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    );
  }

  const estImage = fichier.type !== 'application/pdf';

  return (
    <div className={`piece-jointe ${enCours ? 'piece-jointe--envoi' : ''}`}>
      {estImage && apercu ? (
        <img src={apercu} alt="" className="piece-jointe__apercu" />
      ) : (
        <span className="piece-jointe__icone" aria-hidden="true">
          {estImage ? '🖼️' : '📄'}
        </span>
      )}

      <span className="piece-jointe__texte">
        <strong>{fichier.name}</strong>
        <small>{enCours ? 'Envoi en cours…' : lisible(fichier.size)}</small>
      </span>

      <button
        type="button"
        className="piece-jointe__retirer"
        onClick={onRetirer}
        aria-label="Retirer ce document"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Le document tel qu'il apparaît dans la conversation, une fois envoyé.
 *
 * L'image ne peut pas être posée dans un `<img src>` nu : la route exige le
 * jeton d'authentification, parce qu'il s'agit de la copie d'un enfant et
 * qu'une URL publique la rendrait lisible par n'importe qui. On la charge donc
 * en blob, et on relâche l'URL au démontage — sans quoi chaque ouverture de
 * conversation laisserait plusieurs mégaoctets accrochés à l'onglet.
 */
export function PieceJointeBulle({ conversationId, piece, onAgrandir }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    // Rien à charger si les octets ont été effacés : le serveur répondrait un
    // fichier vide, et l'image resterait cassée à l'écran.
    if (!piece?.estImage || !piece?.consultable) return undefined;

    let vivant = true;
    let cree = null;

    chargerPieceJointe(conversationId, piece.id)
      .then((adresse) => {
        // Le composant peut avoir disparu pendant le chargement : on relâche
        // immédiatement plutôt que de poser une URL que personne n'affichera.
        if (!vivant) {
          URL.revokeObjectURL(adresse);
          return;
        }

        cree = adresse;
        setUrl(adresse);
      })
      .catch(() => {});

    return () => {
      vivant = false;
      if (cree) URL.revokeObjectURL(cree);
    };
  }, [conversationId, piece]);

  if (!piece) return null;

  // Document expiré : les octets sont partis au bout de quelques jours, seul
  // le texte relevé subsiste côté serveur. On le dit plutôt que d'afficher un
  // cadre vide — l'élève doit comprendre que sa photo n'a pas été perdue par
  // accident, mais effacée exprès.
  if (!piece.consultable) {
    return (
      <span className="piece-bulle piece-bulle--pdf piece-bulle--expiree">
        <span aria-hidden="true">🗄️</span>
        <span>{piece.nomFichier} · document effacé, le professeur en garde le contenu</span>
      </span>
    );
  }

  if (!piece.estImage) {
    return (
      <span className="piece-bulle piece-bulle--pdf">
        <span aria-hidden="true">📄</span>
        <span>
          {piece.nomFichier}
          {piece.nombrePages > 0 && ` · ${piece.nombrePages} page${piece.nombrePages > 1 ? 's' : ''}`}
        </span>
      </span>
    );
  }

  if (!url) return <span className="piece-bulle piece-bulle--attente" aria-hidden="true" />;

  return (
    <button
      type="button"
      className="piece-bulle piece-bulle--image"
      onClick={() => onAgrandir?.(url, piece.nomFichier)}
      title="Voir en grand"
    >
      <img src={url} alt={piece.nomFichier ?? 'Document envoyé'} />
    </button>
  );
}
