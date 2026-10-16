import { useEffect, useRef, useState } from 'react';
import { chercherEtablissements } from '../lib/api/elevesApi';

/**
 * L'ÉTABLISSEMENT DE L'ENFANT — pour la conseillère d'orientation (Camara, le
 * 11/10/2026 : « en fonction du lycée, les parcours et les choix peuvent être
 * différents »).
 *
 * UN CHAMP DU FORMULAIRE, COMME LES AUTRES — Camara, le même jour : « il doit
 * être au-dessus du bouton ; une fois saisi et sélectionné, on enregistre ».
 * Choisir un établissement ne fait que le retenir ; c'est « Enregistrer » qui
 * l'envoie, avec le reste du profil (voir `MonProfil`).
 *
 * Le parent tape le nom du collège ou du lycée, ou sa ville, ou son code
 * postal ; la liste vient de l'Annuaire de l'éducation, par le serveur.
 *
 * FACULTATIF : sans lui, la conseillère parle du cadre national et propose de
 * le renseigner.
 *
 * `valeur` : { uai, nom, commune } ou null ; `onChange` reçoit la même forme.
 */
const ATTENTE_MS = 350;

export default function ChoixEtablissement({ id, valeur, onChange }) {
  const [texte, setTexte] = useState('');
  const [resultats, setResultats] = useState([]);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [enChangement, setEnChangement] = useState(!valeur);
  const derniere = useRef(0);

  // LA RECHERCHE ATTEND QUE LE PARENT AIT FINI DE TAPER, et seule la dernière
  // réponse compte : une réponse lente à « mar » ne doit pas écraser celle de
  // « mare carrée ».
  useEffect(() => {
    const q = texte.trim();
    if (q.length < 3) {
      setResultats([]);
      return undefined;
    }

    const numero = derniere.current + 1;
    derniere.current = numero;

    const minuteur = setTimeout(async () => {
      setRecherche(true);
      setErreur(null);
      try {
        const { data } = await chercherEtablissements(q);
        if (derniere.current === numero) setResultats(Array.isArray(data) ? data : []);
      } catch {
        if (derniere.current === numero) setErreur('L’annuaire officiel ne répond pas. Réessaie dans un instant.');
      } finally {
        if (derniere.current === numero) setRecherche(false);
      }
    }, ATTENTE_MS);

    return () => clearTimeout(minuteur);
  }, [texte]);

  const choisir = (etablissement) => {
    onChange({ uai: etablissement.uai, nom: etablissement.nom, commune: etablissement.commune });
    setEnChangement(false);
    setTexte('');
    setResultats([]);
  };

  const retirer = () => {
    onChange(null);
    setEnChangement(true);
  };

  return (
    <div className="panneau-choix panneau-choix--ecole">
      <div className="panneau-choix__tete">
        <span className="panneau-choix__icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 10 9-6 9 6" />
            <path d="M5 10v10h14V10" />
            <path d="M10 20v-5h4v5" />
          </svg>
        </span>
        <span className="panneau-choix__titres">
          <span className="panneau-choix__titre">
            Collège ou lycée
            <span className="panneau-choix__etiquette">facultatif</span>
          </span>
          <span className="panneau-choix__sous-titre">Pour la conseillère d’orientation</span>
        </span>
      </div>

      {valeur && !enChangement && (
        <div className="etablissement__actuel">
          <span className="etablissement__coche" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-10" />
            </svg>
          </span>
          <span className="etablissement__nom">
            <strong>{valeur.nom}</strong>
            {valeur.commune && <span>{valeur.commune}</span>}
          </span>
          <span className="etablissement__actions">
            <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setEnChangement(true)}>
              Changer
            </button>
            <button type="button" className="btn-ghost btn-ghost--mini" onClick={retirer}>
              Retirer
            </button>
          </span>
        </div>
      )}

      {(enChangement || !valeur) && (
        <>
          <div className="etablissement__recherche">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id={id}
              type="search"
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              // Entrée dans la recherche ne doit pas envoyer le formulaire.
              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              placeholder="Nom, ville ou code postal"
              autoComplete="off"
              aria-label="Collège ou lycée (facultatif)"
              aria-describedby={`${id}-aide`}
            />
          </div>
          {recherche && <span className="champ__aide">Recherche…</span>}
          {resultats.length > 0 && (
            <ul className="etablissement__liste" aria-label="Établissements trouvés">
              {resultats.map((r) => (
                <li key={r.uai}>
                  <button type="button" className="etablissement__choix" onClick={() => choisir(r)}>
                    <strong>{r.nom}</strong>
                    <span>{[r.commune, r.type, r.statut].filter(Boolean).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!recherche && texte.trim().length >= 3 && resultats.length === 0 && !erreur && (
            <span className="champ__aide">Aucun collège ni lycée trouvé.</span>
          )}
          {valeur && (
            <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setEnChangement(false)}>
              Annuler
            </button>
          )}
        </>
      )}

      {erreur && <span className="champ__aide champ__aide--alerte" role="alert">{erreur}</span>}

      <span className="panneau-choix__aide" id={`${id}-aide`}>
        Elle connaît alors ce que propose son lycée et les lycées autour
        (sources officielles : Onisep et Annuaire de l’éducation). Choisis-le,
        puis enregistre.
      </span>
    </div>
  );
}
