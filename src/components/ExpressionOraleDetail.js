/**
 * UNE CONVERSATION D'EXPRESSION ORALE, RELUE COMME UNE MESSAGERIE — voulu par
 * Camara le 18/09/2026 : « on aura juste la discussion entre l'élève et le
 * professeur affichée comme dans une messagerie classique comme WhatsApp…
 * avec le nom du prof et de l'élève en badge pour comprendre qui a dit quoi ».
 *
 * POURQUOI DEUX CÔTÉS ET NON UNE LISTE
 * ------------------------------------
 * Une conversation se lit à l'alternance : on voit d'un coup d'œil qui a parlé
 * le plus, qui a fait des phrases longues, où l'élève s'est lancé. Une liste
 * de lignes préfixées demanderait de lire chaque étiquette pour le savoir.
 *
 * L'ÉLÈVE À DROITE, comme partout : c'est lui qui relit, et dans toutes les
 * messageries du monde ses propres messages sont à droite. Mettre le
 * professeur à sa place inverserait une habitude que l'enfant a déjà.
 *
 * LES NOMS SONT EN PASTILLE AU-DESSUS DU PREMIER TOUR DE CHAQUE PRISE DE
 * PAROLE, pas sur chaque bulle : trois bulles d'affilée du même professeur
 * portant trois fois son prénom, c'est ce qui fait qu'on ne le lit plus.
 */
export default function ExpressionOraleDetail({ conversation, prenomEleve }) {
  if (!conversation) return null;

  const tours = conversation.echange ?? [];

  const nomProf = conversation.profPrenom || 'Le professeur';
  const nomEleve = prenomEleve || 'Moi';

  return (
    <div className="expr-detail">
      {tours.length === 0 ? (
        <p className="expr-detail__vide">
          Cette conversation n’a pas pu être relue.
        </p>
      ) : (
        <ol className="expr-fil">
          {tours.map((tour, index) => {
            const deLEleve = tour.qui === 'eleve';

            // Le nom ne s'affiche qu'au CHANGEMENT d'interlocuteur : trois
            // bulles d'affilée du même professeur n'ont pas à le répéter.
            const nouveau = index === 0 || tours[index - 1].qui !== tour.qui;

            return (
              <li
                // Le rang fait la clé : deux tours peuvent porter exactement le
                // même texte — « Yes! » deux fois — et rien d'autre ne les
                // distingue.
                key={`${index}-${tour.qui}`}
                className={`expr-tour ${deLEleve ? 'expr-tour--eleve' : 'expr-tour--prof'}`}
              >
                {nouveau && (
                  <span
                    className="expr-tour__nom"
                    style={!deLEleve && conversation.profCouleur
                      ? { '--teinte': conversation.profCouleur }
                      : undefined}
                  >
                    {deLEleve ? nomEleve : nomProf}
                  </span>
                )}

                <p className="expr-tour__bulle">{tour.texte}</p>
              </li>
            );
          })}
        </ol>
      )}

      {/* LE RETOUR DU PROFESSEUR EST HORS DE LA CONVERSATION, et en dessous :
          il n'a pas été dit pendant l'échange, il a été écrit après. Le glisser
          dans le fil ferait croire à l'enfant qu'on le lui a dit en anglais au
          milieu de la discussion. */}
      {conversation.remarque && (
        <section className="expr-detail__remarque">
          <h3>Ce que {nomProf} en retient</h3>
          <p>{conversation.remarque}</p>
        </section>
      )}
    </div>
  );
}
