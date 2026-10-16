import { useState } from 'react';
import {
  COULEURS_CATEGORIES, creerCategorie, modifierCategorie, supprimerCategorie,
} from '../../lib/api/espaceParentApi';

/**
 * LES CATÉGORIES DU PARENT — Camara, le 16/10/2026 : « le parent crée ses
 * propres catégories, contrairement aux enfants qui doivent sélectionner une
 * matière ; il les sélectionne ensuite pour que ses fiches soient classées ».
 *
 * Un nom et une couleur de la palette. Supprimer une catégorie ne supprime
 * aucune fiche : ses cours passent dans « Sans catégorie ».
 */

/** Les pastilles de couleur, au clavier comme à la souris. */
export function ChoixCouleur({ valeur, onChange, nom }) {
  return (
    <div className="mf-couleurs" role="radiogroup" aria-label="Couleur de la catégorie">
      {COULEURS_CATEGORIES.map((couleur) => (
        <label key={couleur} className={`mf-couleur${valeur === couleur ? ' est-choisie' : ''}`} style={{ '--pastille': couleur }}>
          <input
            type="radio"
            name={nom}
            value={couleur}
            checked={valeur === couleur}
            onChange={() => onChange(couleur)}
            aria-label={`Couleur ${couleur}`}
          />
        </label>
      ))}
    </div>
  );
}

/** Créer une catégorie : utilisé ici et dans la page de création d'une fiche. */
export function NouvelleCategorie({ onCreee, autoFocus = false }) {
  const [libelle, setLibelle] = useState('');
  const [couleur, setCouleur] = useState(COULEURS_CATEGORIES[0]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const creer = async (evenement) => {
    evenement.preventDefault();
    if (!libelle.trim()) return;
    setEnvoi(true);
    setErreur(null);
    try {
      const { data } = await creerCategorie(libelle.trim(), couleur);
      setLibelle('');
      onCreee(data);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'La catégorie n’a pas pu être créée.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form className="mf-categorie-nouvelle" onSubmit={creer}>
      <div className="mf-categorie-nouvelle__ligne">
        <label className="visuellement-cache" htmlFor="mf-categorie-nom">Nom de la nouvelle catégorie</label>
        <input
          id="mf-categorie-nom"
          value={libelle}
          maxLength={60}
          placeholder="Nouvelle catégorie (ex. Anglais pro, Code de la route…)"
          onChange={(e) => setLibelle(e.target.value)}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
        />
        <button type="submit" className="btn btn--compact" disabled={envoi || !libelle.trim()}>Créer</button>
      </div>
      <ChoixCouleur valeur={couleur} onChange={setCouleur} nom="mf-categorie-nouvelle-couleur" />
      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
    </form>
  );
}

function LigneCategorie({ categorie, onModifiee, onSupprimee }) {
  const [edition, setEdition] = useState(false);
  const [libelle, setLibelle] = useState(categorie.libelle);
  const [couleur, setCouleur] = useState(categorie.couleur);
  const [erreur, setErreur] = useState(null);

  const enregistrer = async (evenement) => {
    evenement.preventDefault();
    if (!libelle.trim()) return;
    setErreur(null);
    try {
      await modifierCategorie(categorie.id, libelle.trim(), couleur);
      onModifiee({ ...categorie, libelle: libelle.trim(), couleur });
      setEdition(false);
    } catch {
      setErreur('La catégorie n’a pas pu être modifiée.');
    }
  };

  const supprimer = async () => {
    const n = categorie.nombreCours ?? 0;
    const suite = n > 0 ? `\n\nSes ${n} cours et leurs fiches restent, « sans catégorie ».` : '';
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Supprimer la catégorie « ${categorie.libelle} » ?${suite}`)) return;
    try {
      await supprimerCategorie(categorie.id);
      onSupprimee(categorie.id);
    } catch {
      setErreur('La catégorie n’a pas pu être supprimée.');
    }
  };

  if (edition) {
    return (
      <li className="mf-categorie mf-categorie--edition">
        <form onSubmit={enregistrer}>
          <div className="mf-categorie-nouvelle__ligne">
            <label className="visuellement-cache" htmlFor={`mf-categorie-${categorie.id}`}>Nom de la catégorie</label>
            <input id={`mf-categorie-${categorie.id}`} value={libelle} maxLength={60} onChange={(e) => setLibelle(e.target.value)} />
            <button type="submit" className="btn btn--compact" disabled={!libelle.trim()}>Enregistrer</button>
            <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setEdition(false)}>Annuler</button>
          </div>
          <ChoixCouleur valeur={couleur} onChange={setCouleur} nom={`mf-categorie-couleur-${categorie.id}`} />
        </form>
        {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
      </li>
    );
  }

  return (
    <li className="mf-categorie" style={{ '--pastille': categorie.couleur }}>
      <span className="mf-categorie__pastille" aria-hidden="true" />
      <span className="mf-categorie__nom">{categorie.libelle}</span>
      <span className="mf-categorie__compte">{categorie.nombreCours ?? 0} cours</span>
      <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setEdition(true)}>Renommer</button>
      <button type="button" className="btn-ghost btn-ghost--mini btn-ghost--retirer" onClick={supprimer}>Supprimer</button>
      {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
    </li>
  );
}

export default function GestionCategories({ categories, onChange, onSupprimee }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <section className="mf-categories" aria-label="Mes catégories">
      <button
        type="button"
        className="mf-categories__ouvrir"
        aria-expanded={ouvert}
        onClick={() => setOuvert((o) => !o)}
      >
        Mes catégories <span className="mf-categories__nombre">{categories.length}</span>
        <span className="mf-categories__chevron" aria-hidden="true">{ouvert ? '▴' : '▾'}</span>
      </button>

      {ouvert && (
        <div className="mf-categories__corps">
          {categories.length === 0 && (
            <p className="champ__aide">Créez vos catégories pour ranger vos fiches à votre façon.</p>
          )}
          <ul className="mf-categories__liste">
            {categories.map((k) => (
              <LigneCategorie
                key={k.id}
                categorie={k}
                onModifiee={(m) => onChange(categories.map((c) => (c.id === m.id ? m : c)))}
                onSupprimee={onSupprimee}
              />
            ))}
          </ul>
          <NouvelleCategorie onCreee={(k) => onChange([...categories, k])} />
        </div>
      )}
    </section>
  );
}
