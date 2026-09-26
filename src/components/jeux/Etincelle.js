/* L'étincelle jaune à quatre branches des écrans du défi. Décorative. */
export default function Etincelle({ grande }) {
  return (
    <svg
      className={`choix-mode__etincelle${grande ? ' choix-mode__etincelle--grande' : ''}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0c.9 6.4 3.6 9.6 12 12-8.4 2.4-11.1 5.6-12 12-.9-6.4-3.6-9.6-12-12 8.4-2.4 11.1-5.6 12-12z" />
    </svg>
  );
}
