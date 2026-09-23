import { useEffect, useRef, useState } from 'react';

/**
 * LA CARTE DES NIVEAUX, en haut de « Mes jeux ».
 *
 * Camara, le 23/09/2026, planche à l'appui : une rangée de portails de pierre
 * reliés par un chemin lumineux, du CP à la terminale. Ceux qu'on a passés
 * brillent, celui de l'enfant est doré et porte son écriteau, ceux d'après
 * sont de pierre grise et fermés d'un cadenas.
 *
 * TOUT EST DESSINÉ, RIEN N'EST UNE IMAGE. Douze portails en PNG, c'est douze
 * fichiers à refaire au premier changement de couleur, et rien qui s'adapte à
 * la largeur d'un téléphone. L'arche, la gemme, le chemin et le cadenas sont
 * des formes CSS et SVG : elles suivent le thème et se redimensionnent.
 *
 * LE CADENAS RÉPOND AU LIEU DE SE TAIRE. Un bouton `disabled` ne reçoit ni
 * clic ni focus : l'enfant appuie, rien ne bouge, et il ne sait pas pourquoi.
 * Ces portails restent des boutons ordinaires, marqués `aria-disabled`, et le
 * clic affiche la raison — la demande même de Camara : « si il clique dessus
 * il faudra mettre un message ».
 *
 * TROIS ÉTATS, ET NON DEUX. Verrouillé n'est pas la même chose que vide : une
 * classe ouverte dont les jeux ne sont pas encore écrits garde son portail
 * ouvert, sa gemme simplement éteinte. Lui mettre un cadenas ferait croire à
 * un enfant de 3e qu'il n'a pas le niveau de sa propre année.
 */

/** La gemme au cœur du portail : un losange taillé, éclairé d'en haut à gauche. */
function Gemme() {
  return (
    <svg className="portail__gemme" viewBox="0 0 24 34" aria-hidden="true">
      <path className="portail__gemme-taille" d="M12 1 22 12 12 33 2 12Z" />
      <path className="portail__gemme-eclat" d="M12 1 22 12H2Z" />
      <path className="portail__gemme-arete" d="M2 12h20M12 1v32" />
    </svg>
  );
}

/** Le cadenas des classes encore fermées. */
function Cadenas({ classe }) {
  return (
    <svg className={classe} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" />
    </svg>
  );
}

export default function FriseDesClasses({ etapes, choisie, onChoisir }) {
  const [refus, setRefus] = useState(null);
  const sienne = useRef(null);

  // La carte défile sur les petits écrans : le portail de l'enfant est amené
  // sous ses yeux plutôt que laissé hors cadre, à droite.
  useEffect(() => {
    sienne.current?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  }, []);

  const choisir = (etape) => {
    if (etape.verrouillee) {
      setRefus(etape);
      return;
    }
    setRefus(null);
    onChoisir(etape.code);
  };

  return (
    <nav className="frise" aria-label="Choisir une classe">
      <ol className="frise__piste">
        {etapes.map((etape, rang) => {
          const active = etape.code === choisie;
          // Le chemin qui MÈNE à ce portail s'éteint dès que le précédent est
          // fermé : la lumière s'arrête où l'enfant s'arrête.
          const chemin = rang > 0 && !etapes[rang - 1].verrouillee && !etape.verrouillee;

          return (
            <li
              key={etape.code}
              className={`frise__case${chemin ? ' frise__case--chemin' : ''}`}
            >
              <button
                type="button"
                ref={etape.sienne ? sienne : null}
                className={[
                  'portail',
                  active ? 'est-choisi' : '',
                  etape.sienne ? 'est-sien' : '',
                  etape.verrouillee ? 'est-verrouille' : '',
                  !etape.verrouillee && !etape.desJeux ? 'est-eteint' : '',
                ].filter(Boolean).join(' ')}
                aria-current={active ? 'true' : undefined}
                aria-disabled={etape.verrouillee || undefined}
                onClick={() => choisir(etape)}
              >
                {/* L'ENSEIGNE DU PORTAIL OUVERT. L'anneau clair ne suffisait
                    pas : Camara, le 23/09/2026, a joué au CE1 sans voir où il
                    était. Une flèche qui saute au-dessus du portail se
                    remarque sans qu'on la cherche, et elle DIT ce qu'elle
                    marque au lieu de le suggérer par une couleur. */}
                {active && (
                  <span className="portail__curseur" aria-hidden="true">
                    <span className="portail__curseur-texte">Tu joues ici</span>
                    <span className="portail__curseur-fleche" />
                  </span>
                )}

                <span className="portail__arche" aria-hidden="true">
                  <span className="portail__voute" />
                  <Gemme />
                  {etape.verrouillee && <Cadenas classe="portail__cadenas" />}
                </span>

                <span className="portail__ecriteau">{etape.court}</span>

                {/* Le mot « Ma classe » plutôt qu'une couleur seule : la
                    couleur ne se lit pas quand on ne la distingue pas. */}
                {etape.sienne && <span className="portail__mienne">Ma classe</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Le message vit sous la carte, jamais dans une fenêtre : sur un
          téléphone, une alerte recouvre le portail qu'on vient de toucher.
          `role="status"` le fait annoncer aux lecteurs d'écran sans voler le
          focus à l'enfant. */}
      <p className="frise__refus" role="status">
        {refus && (
          <>
            <Cadenas classe="frise__refus-cadenas" />
            Tu n’as pas encore le niveau pour débloquer ces jeux.
            {' '}
            <span className="frise__refus-suite">
              Ceux de {refus.libelle} s’ouvriront quand tu y seras !
            </span>
          </>
        )}
      </p>
    </nav>
  );
}
