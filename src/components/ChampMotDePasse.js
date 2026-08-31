import { useState } from 'react';

/**
 * Un champ de mot de passe, avec l'œil qui le dévoile.
 *
 * Taper un mot de passe en aveugle sur un clavier de téléphone est la première
 * cause d'abandon d'un formulaire d'inscription : on se trompe, on efface, on
 * recommence, et rien ne dit où était la faute. Le montrer à la demande coûte
 * un bouton et supprime le problème.
 *
 * Le champ reste masqué par défaut : dévoiler d'office exposerait le mot de
 * passe à qui passe derrière l'épaule, ce qui est le cas exact d'un parent qui
 * remplit le formulaire à côté de son enfant.
 */
export default function ChampMotDePasse({
  id,
  label,
  valeur,
  onChanger,
  aide,
  autoComplete = 'current-password',
  minLength,
  required = true,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>

      <div className="champ-mdp">
        <input
          id={id}
          // `text` et non un attribut bricolé : c'est le seul moyen d'afficher
          // les caractères, et le gestionnaire de mots de passe du navigateur
          // continue de reconnaître le champ grâce à `autoComplete`.
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={valeur}
          onChange={(evenement) => onChanger(evenement.target.value)}
          required={required}
          minLength={minLength}
        />

        <button
          type="button"
          className="champ-mdp__oeil"
          onClick={() => setVisible((v) => !v)}
          // Le libellé change avec l'état : un lecteur d'écran annonce
          // l'action à faire, pas l'icône affichée.
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          aria-pressed={visible}
          // Hors du parcours de tabulation : entre deux champs, l'utilisateur
          // veut passer au suivant, pas s'arrêter sur un bouton d'affichage.
          // Il reste atteignable à la souris et au lecteur d'écran.
          tabIndex={-1}
          title={visible ? 'Masquer' : 'Afficher'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1.8 12S5.5 5.2 12 5.2 22.2 12 22.2 12 18.5 18.8 12 18.8 1.8 12 1.8 12z" />
            <circle cx="12" cy="12" r="3.1" />
            {/* La barre oblique n'apparaît que quand le mot de passe est
                visible : l'icône montre alors ce qu'un clic ferait — masquer. */}
            {visible && <path d="M4 20 20 4" />}
          </svg>
        </button>
      </div>

      {aide && <span className="champ__aide">{aide}</span>}
    </div>
  );
}
