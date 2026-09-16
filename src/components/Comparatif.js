/**
 * POURQUOI PAYER, PUISQUE CHATGPT EST GRATUIT ?
 *
 * C'est l'objection que se pose tout parent, et la page n'y répondait nulle
 * part. Voulu par Camara le 12/09/2026.
 *
 * CHAQUE LIGNE EST VRAIE, SINON ELLE N'EST PAS ICI. Un comparatif qui se
 * flatte se retourne au premier essai — et c'est justement le moment où le
 * parent décide. Les colonnes « professeur particulier » et « ChatGPT »
 * décrivent ce qu'ils font vraiment, pas une caricature : le professeur
 * particulier garde ses avantages, et ChatGPT les siens.
 */
const LIGNES = [
  { quoi: 'Disponible à 22 h, la veille du contrôle', prof: false, chat: true, mimia: true },
  { quoi: 'Le même professeur à chaque séance', prof: true, chat: false, mimia: true },
  { quoi: 'Se souvient des séances précédentes', prof: true, chat: 'partiel', mimia: true },
  { quoi: 'Refuse de donner la réponse toute faite', prof: true, chat: false, mimia: true },
  { quoi: 'Remonte aux lacunes des années passées', prof: true, chat: false, mimia: true },
  { quoi: 'Dictées corrigées et compréhension orale', prof: true, chat: 'partiel', mimia: true },
  { quoi: 'Bilan écrit aux parents chaque semaine', prof: 'partiel', chat: false, mimia: true },
  { quoi: 'Toutes les matières, du CP à la Terminale', prof: false, chat: true, mimia: true },
];

/** Une case : oui, non, ou « en partie ». Le texte porte le sens, pas la couleur. */
function Case({ valeur, colonne, quoi }) {
  const etat = valeur === true ? 'oui' : valeur === false ? 'non' : 'partiel';
  const dit = { oui: 'oui', non: 'non', partiel: 'en partie' }[etat];

  return (
    <td
      className={`comparatif__case comparatif__case--${etat}${colonne === 'Mimia' ? ' comparatif__case--nous' : ''}`}
      data-colonne={colonne}
    >
      <span aria-hidden="true">{etat === 'oui' ? '✓' : etat === 'non' ? '—' : '~'}</span>
      <span className="visuellement-cache">{`${colonne} : ${dit} — ${quoi}`}</span>
    </td>
  );
}

export default function Comparatif() {
  return (
    <section className="comparatif-section">
      <header className="section__entete">
        <span className="etiquette etiquette--sombre">La vraie question</span>
        <h2>Pourquoi pas simplement ChatGPT&nbsp;?</h2>
        <p className="section__intro">
          Parce qu’un professeur ne se contente pas de répondre. Il sait ce que
          votre enfant a compris la semaine dernière, et il refuse de faire le
          devoir à sa place.
        </p>
      </header>

      <div className="comparatif__cadre">
        <table className="comparatif">
          <thead>
            <tr>
              <th scope="col">
                <span className="visuellement-cache">Ce qui compte</span>
              </th>
              <th scope="col">Prof particulier</th>
              <th scope="col">ChatGPT</th>
              <th scope="col" className="comparatif__nous">Mimia</th>
            </tr>
          </thead>

          <tbody>
            {LIGNES.map((ligne) => (
              <tr key={ligne.quoi}>
                <th scope="row">{ligne.quoi}</th>
                <Case valeur={ligne.prof} colonne="Prof particulier" quoi={ligne.quoi} />
                <Case valeur={ligne.chat} colonne="ChatGPT" quoi={ligne.quoi} />
                <Case valeur={ligne.mimia} colonne="Mimia" quoi={ligne.quoi} />
              </tr>
            ))}

            <tr className="comparatif__prix">
              <th scope="row">Ce que ça coûte</th>
              <td data-colonne="Prof particulier">30 à 50 € l’heure</td>
              <td data-colonne="ChatGPT">gratuit, ou 20 €/mois</td>
              <td className="comparatif__nous" data-colonne="Mimia">
                39,90 €/mois
                <small>9 h de cours, soit 4,43 € l’heure</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
