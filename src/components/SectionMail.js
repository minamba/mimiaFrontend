/**
 * Un groupe du formulaire d'écriture d'un courriel : le template, le
 * destinataire, le courriel lui-même, la programmation.
 *
 * DES CARTES NUMÉROTÉES — Camara, le 15/09/2026 : « séparer les groupes
 * d'information ». Une seule colonne de quinze champs se lit comme un
 * formulaire administratif ; trois cartes qui disent chacune ce qu'elles
 * contiennent se lisent comme des étapes, dans l'ordre où on les remplit.
 *
 * `teinte` donne le liseré de la carte (sarcelle, bleu, corail) : on
 * reconnaît le groupe avant d'en lire le titre.
 */
export default function SectionMail({ numero, titre, aide, teinte, children }) {
  return (
    <section className={`section-mail${teinte ? ` section-mail--${teinte}` : ''}`}>
      <header className="section-mail__entete">
        {numero && <span className="section-mail__numero" aria-hidden="true">{numero}</span>}

        <div>
          <h3 className="section-mail__titre">{titre}</h3>
          {aide && <p className="section-mail__aide">{aide}</p>}
        </div>
      </header>

      <div className="section-mail__corps">{children}</div>
    </section>
  );
}
