import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Choix d'un élève, avec recherche.
 *
 * Une liste déroulante native ne se cherche pas : passé une trentaine
 * d'élèves, retrouver « Zoé en 6e » demande de parcourir la liste à l'œil. Ce
 * composant garde l'apparence d'un champ de formulaire mais filtre à la
 * frappe, sur le prénom, le nom, la classe et le courriel du parent.
 *
 * Le clavier reste la voie normale : flèches pour parcourir, Entrée pour
 * choisir, Échap pour renoncer. Un administrateur qui filtre vingt fois de
 * suite ne doit pas avoir à lâcher son clavier.
 */

/**
 * Accents retirés, casse ramenée au bas.
 *
 * Sans ça, « zoe » ne trouve pas « Zoé » — et personne ne tape les accents
 * dans un champ de recherche.
 */
const normaliser = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .toLowerCase();

/**
 * Chaque mot tapé doit se retrouver quelque part, dans n'importe quel ordre.
 *
 * « bilal 3e » trouve donc Bilal en 3e, alors qu'une recherche en sous-chaîne
 * simple échouerait : la classe ne suit pas immédiatement le prénom dans le
 * libellé. C'est la manière dont on cherche réellement quelqu'un — un bout de
 * nom, un bout de classe — plutôt qu'en récitant une étiquette exacte.
 */
const correspond = (foin, requete) => {
  const mots = normaliser(requete).split(/\s+/).filter(Boolean);
  if (mots.length === 0) return true;

  return mots.every((mot) => foin.includes(mot));
};

const TOUS = { valeur: '', libelle: 'Tous les élèves', foin: 'tous les eleves' };

export default function ChoixEleve({ eleves, valeur, onChanger, libelle = 'Élève' }) {
  const [ouvert, setOuvert] = useState(false);
  const [requete, setRequete] = useState('');
  const [actif, setActif] = useState(0);

  const boiteRef = useRef(null);
  const listeRef = useRef(null);
  const champRef = useRef(null);

  const options = useMemo(
    () => [
      TOUS,
      ...eleves.map((e) => ({
        valeur: String(e.id),
        // Le nom rejoint le libellé : on demande de pouvoir chercher dessus,
        // il serait étrange de le trouver sans jamais le voir.
        libelle: `${e.prenom ?? ''} ${e.nom ?? ''}`.trim() +
          ` — ${e.niveauLibelle ?? '?'} (${e.parentMail ?? ''})`,
        foin: normaliser(
          `${e.prenom ?? ''} ${e.nom ?? ''} ${e.niveauLibelle ?? ''} ${e.parentMail ?? ''}`,
        ),
      })),
    ],
    [eleves],
  );

  const filtrees = useMemo(
    () => options.filter((o) => correspond(o.foin, requete)),
    [options, requete],
  );

  const selection = options.find((o) => o.valeur === String(valeur ?? '')) ?? TOUS;

  // Fermeture au clic à côté. Sans elle, une liste ouverte reste ouverte
  // par-dessus les graphiques qu'elle est censée filtrer.
  useEffect(() => {
    if (!ouvert) return undefined;

    const surClic = (evenement) => {
      if (boiteRef.current?.contains(evenement.target)) return;
      setOuvert(false);
      setRequete('');
    };

    document.addEventListener('mousedown', surClic);
    return () => document.removeEventListener('mousedown', surClic);
  }, [ouvert]);

  // L'option active suit les flèches jusque dans le défilement : sans ça, on
  // navigue à l'aveugle dès la huitième ligne.
  useEffect(() => {
    if (!ouvert) return;
    listeRef.current?.children[actif]?.scrollIntoView({ block: 'nearest' });
  }, [actif, ouvert]);

  const choisir = (option) => {
    onChanger(option.valeur);
    setOuvert(false);
    setRequete('');
    champRef.current?.blur();
  };

  const surTouche = (evenement) => {
    if (evenement.key === 'ArrowDown' || evenement.key === 'ArrowUp') {
      evenement.preventDefault();

      if (!ouvert) {
        setOuvert(true);
        setActif(0);
        return;
      }

      const pas = evenement.key === 'ArrowDown' ? 1 : -1;
      // On boucle plutôt que de buter : arrivé en bas, la flèche du bas
      // remonte en tête, ce qui évite un cul-de-sac silencieux.
      setActif((i) => (i + pas + filtrees.length) % Math.max(filtrees.length, 1));
      return;
    }

    if (evenement.key === 'Enter' && ouvert) {
      evenement.preventDefault();
      if (filtrees[actif]) choisir(filtrees[actif]);
      return;
    }

    if (evenement.key === 'Escape') {
      setOuvert(false);
      setRequete('');
    }
  };

  return (
    <div className="choix-eleve" ref={boiteRef}>
      <span className="choix-eleve__etiquette">{libelle}</span>

      <div className="choix-eleve__boite">
        <input
          ref={champRef}
          type="text"
          className="choix-eleve__champ"
          role="combobox"
          aria-expanded={ouvert}
          aria-controls="choix-eleve-liste"
          aria-autocomplete="list"
          // Le champ montre la sélection au repos et la frappe une fois
          // ouvert : deux zones distinctes obligeraient à lire à deux endroits
          // ce qui est une seule information.
          value={ouvert ? requete : selection.libelle}
          placeholder="Nom, prénom ou classe…"
          onChange={(evenement) => {
            setRequete(evenement.target.value);
            setActif(0);
            setOuvert(true);
          }}
          onFocus={() => {
            setOuvert(true);
            setRequete('');
            setActif(0);
          }}
          onKeyDown={surTouche}
        />

        <span className="choix-eleve__chevron" aria-hidden="true" />
      </div>

      {ouvert && (
        <ul className="choix-eleve__liste" id="choix-eleve-liste" role="listbox" ref={listeRef}>
          {filtrees.length === 0 && (
            <li className="choix-eleve__vide">Aucun élève ne correspond.</li>
          )}

          {filtrees.map((option, i) => (
            <li
              key={option.valeur || 'tous'}
              role="option"
              aria-selected={option.valeur === selection.valeur}
              className={`choix-eleve__option ${
                i === actif ? 'choix-eleve__option--actif' : ''
              } ${option.valeur === selection.valeur ? 'choix-eleve__option--choisi' : ''}`}
              // `mouseDown` et non `click` : le clic arriverait après le
              // `mousedown` qui referme la liste, et ne toucherait plus rien.
              onMouseDown={(evenement) => {
                evenement.preventDefault();
                choisir(option);
              }}
              onMouseEnter={() => setActif(i)}
            >
              {option.libelle}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
