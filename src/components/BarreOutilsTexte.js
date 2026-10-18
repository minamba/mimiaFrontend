import { useEffect, useRef, useState } from 'react';

/**
 * TOUTES LES ÉMOTICÔNES, RANGÉES PAR FAMILLE — Camara, le 17/10/2026 :
 * « pourquoi je n'ai pas accès à toutes les émoticônes ? ». La barre n'en
 * proposait qu'une sélection courte de seize, pensée pour rester
 * professionnelle ; elle offre désormais un vrai choix, par onglets, avec les
 * dernières utilisées en tête. Pas de bibliothèque : des caractères Unicode,
 * affichés par la police du poste comme partout ailleurs dans le message.
 */
const FAMILLES = [
  {
    id: 'visages',
    icone: '😀',
    nom: 'Visages',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
      '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
      '😑', '😶', '😏', '😒', '🙄', '😬', '😌', '😔', '😪', '😴', '😷', '🤒', '🤕', '🤧', '🥵', '🥶',
      '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '😮', '😯', '😲', '😳', '🥺',
      '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
      '😡', '😠', '🤬', '😈', '💀', '🤡', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽',
    ],
  },
  {
    id: 'gestes',
    icone: '👍',
    nom: 'Gestes et personnes',
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
      '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
      '🧠', '👀', '👁️', '👂', '👃', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵', '👨‍🏫',
      '👩‍🏫', '🧑‍🏫', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍💻', '👩‍💻', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '🙋', '🙋‍♂️', '🙋‍♀️', '🤷', '🤦', '💁',
    ],
  },
  {
    id: 'ecole',
    icone: '📚',
    nom: 'École et travail',
    emojis: [
      '📚', '📖', '📕', '📗', '📘', '📙', '📓', '📒', '📔', '📝', '✏️', '🖊️', '🖋️', '✒️', '🖍️', '📐',
      '📏', '📎', '🖇️', '📌', '📍', '✂️', '🗂️', '📁', '📂', '📋', '📄', '📃', '📑', '🗒️', '🗓️', '📅',
      '📆', '⏰', '⏱️', '⌛', '⏳', '🎒', '🏫', '🎓', '🧮', '🔬', '🔭', '🧪', '🧫', '🧬', '🌍', '🗺️',
      '💻', '🖥️', '⌨️', '🖱️', '📱', '☎️', '📞', '✉️', '📧', '📨', '📩', '📤', '📥', '📮', '🔍', '💡',
    ],
  },
  {
    id: 'symboles',
    icone: '✅',
    nom: 'Symboles',
    emojis: [
      '✅', '☑️', '✔️', '❌', '❎', '⭕', '❗', '❕', '❓', '❔', '‼️', '⁉️', '⚠️', '🚫', '⛔', '🔔',
      '🔕', '📣', '📢', '💬', '💭', '🗨️', 'ℹ️', '🆕', '🆗', '🆒', '🆓', '🔝', '🔜', '➡️', '⬅️', '⬆️',
      '⬇️', '↗️', '↘️', '🔄', '🔁', '➕', '➖', '✖️', '➗', '💯', '🔢', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣',
      '3️⃣', '4️⃣', '5️⃣', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟥', '🟩', '🟦', '⭐', '🌟',
    ],
  },
  {
    id: 'coeurs',
    icone: '❤️',
    nom: 'Cœurs et fête',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💖', '💗', '💓', '💞', '💕', '💝', '💘',
      '❣️', '💔', '💌', '✨', '🎉', '🎊', '🥳', '🎈', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️',
      '👑', '💎', '🔥', '⚡', '💫', '🌈', '☀️', '🌙', '⭐', '🎂', '🍰', '🎄', '🎃', '🕯️', '🪅', '🎆',
    ],
  },
  {
    id: 'nature',
    icone: '🌿',
    nom: 'Nature et animaux',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🐧', '🐦', '🐤', '🦉', '🦋', '🐝', '🐞', '🐢', '🐍', '🐙', '🐠', '🐬', '🐳', '🦄', '🦖', '🐉',
      '🌸', '🌼', '🌻', '🌹', '🌷', '🌱', '🌿', '🍀', '🍁', '🍂', '🌳', '🌲', '🌵', '🌊', '❄️', '⛄',
    ],
  },
  {
    id: 'activites',
    icone: '⚽',
    nom: 'Activités et voyages',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '⛳', '🏊', '🚴', '🧗', '🏃',
      '🎨', '🎭', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎸', '🎻', '🎮', '🧩', '♟️', '🎯', '🎲', '🪁',
      '🚗', '🚌', '🚆', '✈️', '🚀', '🚲', '⛵', '🏖️', '🏔️', '🏕️', '🏠', '🏡', '🏛️', '🗼', '🎡', '🎢',
    ],
  },
  {
    id: 'cuisine',
    icone: '🍎',
    nom: 'Nourriture',
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥝', '🥕', '🌽',
      '🥐', '🥖', '🧀', '🥚', '🍳', '🥞', '🧇', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🍝', '🍜', '🍣',
      '🍪', '🍩', '🍫', '🍬', '🍭', '🍦', '🧁', '🥛', '☕', '🍵', '🧃', '🥤', '🍽️', '🥄', '🍴', '🧂',
    ],
  },
];

const CLE_RECENTS = 'mimia.emojis.recents';
const MAX_RECENTS = 16;

const lireRecents = () => {
  try {
    const liste = JSON.parse(localStorage.getItem(CLE_RECENTS) ?? '[]');
    return Array.isArray(liste) ? liste.slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
};

/**
 * Les deux raccourcis d'écriture communs à la diffusion et au message à un
 * parent : le gras (voir `useCompositionMessage`) et une émoticône, tous
 * deux insérés dans le texte brut — jamais un éditeur visuel séparé du
 * texte qu'on relit avant d'envoyer.
 */
export default function BarreOutilsTexte({ onGras, onEmoji }) {
  const [ouvert, setOuvert] = useState(false);
  const [recents, setRecents] = useState(lireRecents);
  const [famille, setFamille] = useState(() => (lireRecents().length > 0 ? 'recents' : FAMILLES[0].id));
  const conteneur = useRef(null);

  useEffect(() => {
    if (!ouvert) return undefined;

    const fermerSiExterieur = (evenement) => {
      if (!conteneur.current?.contains(evenement.target)) setOuvert(false);
    };
    const fermerAuClavier = (evenement) => { if (evenement.key === 'Escape') setOuvert(false); };

    document.addEventListener('mousedown', fermerSiExterieur);
    document.addEventListener('keydown', fermerAuClavier);
    return () => {
      document.removeEventListener('mousedown', fermerSiExterieur);
      document.removeEventListener('keydown', fermerAuClavier);
    };
  }, [ouvert]);

  // La palette reste ouverte : on enchaîne souvent deux ou trois émoticônes.
  const choisir = (emoji) => {
    onEmoji(emoji);
    setRecents((avant) => {
      const apres = [emoji, ...avant.filter((e) => e !== emoji)].slice(0, MAX_RECENTS);
      try { localStorage.setItem(CLE_RECENTS, JSON.stringify(apres)); } catch { /* navigation privée */ }
      return apres;
    });
  };

  const onglets = [
    ...(recents.length > 0 ? [{ id: 'recents', icone: '🕘', nom: 'Récentes', emojis: recents }] : []),
    ...FAMILLES,
  ];
  const courante = onglets.find((f) => f.id === famille) ?? onglets[0];

  return (
    <div className="barre-outils-texte" ref={conteneur}>
      <button
        type="button"
        className="barre-outils-texte__bouton"
        onClick={onGras}
        title="Mettre en gras"
      >
        <strong>G</strong>
      </button>

      <div className="barre-outils-texte__emoji">
        <button
          type="button"
          className="barre-outils-texte__bouton"
          onClick={() => setOuvert((v) => !v)}
          title="Insérer une émoticône"
          aria-expanded={ouvert}
        >
          🙂
        </button>

        {ouvert && (
          <div className="barre-outils-texte__palette" role="dialog" aria-label="Émoticônes">
            <div className="barre-outils-texte__familles" role="tablist">
              {onglets.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={courante.id === f.id}
                  title={f.nom}
                  aria-label={f.nom}
                  className={courante.id === f.id ? 'est-active' : ''}
                  onClick={() => setFamille(f.id)}
                >
                  {f.icone}
                </button>
              ))}
            </div>
            <p className="barre-outils-texte__famille-nom">{courante.nom}</p>
            <div className="barre-outils-texte__grille">
              {courante.emojis.map((emoji) => (
                <button key={emoji} type="button" onClick={() => choisir(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
