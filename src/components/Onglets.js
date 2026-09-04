import { useEffect, useRef, useState } from 'react';

/**
 * UNE BARRE D'ONGLETS QUI TIENT AUSSI SUR UN TÉLÉPHONE.
 *
 * Huit onglets dans une rangée flex sans retour à la ligne : sur un écran de
 * 390 px, ils se compriment jusqu'à devenir illisibles et le dernier sort de
 * l'écran. En dessous de 760 px, la rangée devient donc un menu déroulant.
 *
 * LE DÉCLENCHEUR PORTE LE NOM DE L'ONGLET COURANT, PAS SEULEMENT UNE ICÔNE
 * ----------------------------------------------------------------------
 * C'est la seule différence avec un hamburger ordinaire, et elle compte : une
 * barre d'onglets sert autant à SE SITUER qu'à naviguer. Réduite à trois
 * barres, elle dit où aller mais plus où l'on est — et sur une administration
 * à huit sections, on se perd en deux clics. Le libellé reste, l'icône
 * annonce qu'il y a un menu derrière.
 *
 * POURQUOI PAS UN DÉFILEMENT HORIZONTAL
 * -------------------------------------
 * C'est la solution courante, et elle a deux défauts ici. Les onglets hors
 * champ n'existent pas pour qui ne pense pas à faire glisser — on ne cherche
 * pas ce qu'on ne soupçonne pas. Et rien n'indique combien il en reste.
 *
 * POURQUOI PAS UN `<select>` NATIF
 * --------------------------------
 * Il serait plus court à écrire, et c'est tentant. Mais il n'accepte aucune
 * mise en forme : ni l'onglet actif en corail, ni les compteurs alignés. Sur
 * iOS il ouvre en plus une roulette en bas d'écran, qui ne ressemble à rien
 * d'autre dans l'application.
 *
 * L'AFFICHAGE EST PILOTÉ PAR LE CSS, PAS PAR `matchMedia`
 * ------------------------------------------------------
 * Les deux formes sont toujours rendues ; la requête média en cache une. Lire
 * la largeur en JavaScript obligerait à un rendu de plus après le montage —
 * donc à un clignotement de la barre au chargement — et à écouter les
 * changements de taille pour une décision que le navigateur sait déjà prendre.
 *
 * `display: none` retire aussi les boutons cachés du parcours de tabulation :
 * la version repliée n'est pas seulement invisible, elle est absente.
 */
export default function Onglets({ items, actif, onChoisir, mini = false, etiquette }) {
  const [ouvert, setOuvert] = useState(false);
  const boite = useRef(null);

  const courant = items.find((o) => o.cle === actif) ?? items[0];

  useEffect(() => {
    if (!ouvert) return undefined;

    // ÉCHAP FERME, comme partout ailleurs dans l'application. Un menu qui ne
    // se ferme qu'en rechoisissant piège celui qui l'a ouvert par erreur.
    const auClavier = (e) => { if (e.key === 'Escape') setOuvert(false); };

    // UN CLIC AILLEURS FERME. Sans ça, le menu reste ouvert par-dessus le
    // contenu qu'on essaie de lire, et il faut viser le déclencheur pour s'en
    // débarrasser.
    const auClic = (e) => {
      if (!boite.current?.contains(e.target)) setOuvert(false);
    };

    document.addEventListener('keydown', auClavier);

    // En phase de capture : un bouton du contenu qui arrête la propagation
    // laisserait sinon le menu ouvert.
    document.addEventListener('mousedown', auClic, true);

    return () => {
      document.removeEventListener('keydown', auClavier);
      document.removeEventListener('mousedown', auClic, true);
    };
  }, [ouvert]);

  const choisir = (cle) => {
    onChoisir(cle);
    setOuvert(false);
  };

  return (
    <div
      ref={boite}
      className={[
        'onglets',
        mini ? 'onglets--secondaires' : '',
        ouvert ? 'onglets--ouvert' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="onglets__declencheur"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-label={`${etiquette ?? 'Sections'} — ${courant?.libelle ?? ''}`}
      >
        <span className="onglets__barres" aria-hidden="true" />
        <span className="onglets__courant">{courant?.libelle}</span>
        <span className="onglets__chevron" aria-hidden="true" />
      </button>

      <div className="onglets__liste" role="tablist">
        {items.map((o) => (
          <button
            key={o.cle}
            type="button"
            role="tab"
            aria-selected={actif === o.cle}
            className={[
              'onglet',
              mini ? 'onglet--mini' : '',
              actif === o.cle ? 'onglet--actif' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => choisir(o.cle)}
          >
            {o.libelle}
          </button>
        ))}
      </div>
    </div>
  );
}
