export default function Loader({ texte = 'Chargement…' }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__dot" />
      <span className="loader__dot" />
      <span className="loader__dot" />
      <span className="loader__texte">{texte}</span>
    </div>
  );
}
