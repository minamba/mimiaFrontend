/**
 * La justification d'un verdict de préparation, telle que le professeur l'a
 * écrite : en paragraphes.
 *
 * RELEVÉ PAR CAMARA LE 14/09/2026 : la revue du programme, domaine par
 * domaine, arrivait en un seul pavé. Le professeur écrit maintenant une phrase
 * d'ensemble puis un paragraphe par domaine (ou par notion pour un contrôle),
 * séparés par une ligne vide, chacun ouvert par son nom et un tiret long :
 * « Fonctions — en cours : tu confonds encore image et antécédent. »
 *
 * Ici, chaque paragraphe devient un `<p>`, et le nom qui l'ouvre passe en
 * gras. La signature (« — Nora, le 14 septembre ») suit le dernier.
 *
 * LES ANCIENNES JUSTIFICATIONS, écrites d'un bloc, s'affichent comme avant :
 * sans ligne vide, il n'y a qu'un paragraphe, et aucun gras n'est posé — un
 * « Tu es presque prêt — » en tête de phrase n'est pas un nom de domaine.
 */
const TETE_DE_PARAGRAPHE = /^(.{2,70}?)\s+—\s+([\s\S]+)$/;

export default function JustificationProfesseur({ texte, signature }) {
  const paragraphes = (texte ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphes.length === 0) return null;

  const plusieurs = paragraphes.length > 1;

  return (
    <div className="controle-pret__mot">
      {paragraphes.map((paragraphe, rang) => {
        const tete = plusieurs ? paragraphe.match(TETE_DE_PARAGRAPHE) : null;
        const dernier = rang === paragraphes.length - 1;

        return (
          // Le rang suffit comme clé : la liste ne se réordonne jamais.
          // eslint-disable-next-line react/no-array-index-key
          <p key={rang}>
            {tete ? (
              <>
                <strong className="controle-pret__domaine">{tete[1]}</strong>
                {' — '}
                {tete[2]}
              </>
            ) : paragraphe}

            {dernier && signature && <span className="controle-pret__date">{signature}</span>}
          </p>
        );
      })}
    </div>
  );
}
