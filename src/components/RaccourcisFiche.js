/**
 * LES RACCOURCIS DE LA FICHE DE L'ÉLÈVE — Camara, le 11/10/2026 : « quand il
 * y a beaucoup de données, on doit scroller trop longtemps ; mettre sous les
 * chiffres des boutons qui vont aux sections, et à chaque section les boutons
 * des autres, avec un bouton qui remonte tout en haut ».
 *
 * Sous les chiffres : toutes les sections. En tête d'une section (`courante`) :
 * « ↑ En haut », puis les autres. Des boutons et non des liens à ancre : la
 * fiche vit aussi dans une fenêtre, où une ancre ferait sauter la page
 * derrière elle ; `scrollIntoView` défile le bon conteneur.
 *
 * `sections` : [{ id, libelle, orientation? }], dans l'ordre de la page.
 * `id` : l'ancre de la section, posée sur la barre elle-même — elle est
 * AU-DESSUS du titre (Camara, le même jour), et un défilement qui viserait le
 * titre la cacherait sous l'en-tête.
 */
const aller = (id) => {
  document.getElementById(id)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
};

export default function RaccourcisFiche({ id = undefined, sections, courante = null }) {
  return (
    <nav
      id={id}
      className={`raccourcis-fiche${courante ? ' raccourcis-fiche--section' : ''}`}
      aria-label={courante ? 'Aller à une autre section' : 'Aller à une section'}
    >
      <span className="raccourcis-fiche__libelle" aria-hidden="true">Aller à</span>
      {courante && (
        <button type="button" className="raccourcis-fiche__haut" onClick={() => aller('fiche-haut')}>
          <span aria-hidden="true">↑ </span>En haut
        </button>
      )}
      {/* LA SECTION OÙ L'ON EST, ALLUMÉE — Camara, le 11/10/2026 : « que le
          bouton actif montre où on est dans la page ». Elle reste dans sa
          propre barre, en surbrillance, au lieu d'en être retirée. */}
      {sections.map((s) => {
        const actif = s.id === courante;
        return (
          <button
            key={s.id}
            type="button"
            className={[
              'raccourcis-fiche__lien',
              s.orientation && 'raccourcis-fiche__lien--orientation',
              actif && 'est-actif',
            ].filter(Boolean).join(' ')}
            aria-current={actif ? 'location' : undefined}
            onClick={() => aller(s.id)}
          >
            {s.libelle}
          </button>
        );
      })}
    </nav>
  );
}
