import { useId, useState } from 'react';
import { BESOINS } from '../lib/besoins';

/**
 * LES BESOINS PARTICULIERS DANS LE PROFIL DE L'ENFANT — Camara, le 11/10/2026.
 *
 * UNE RUBRIQUE REPLIÉE, FACULTATIVE : la plupart des parents n'en ont pas
 * l'usage, et elle ne doit pas alourdir le formulaire. Elle s'ouvre d'elle-même
 * quand une case est déjà cochée.
 *
 * UN PANNEAU, PAS UNE LIGNE DE TEXTE — Camara, le même jour : « pas assez
 * visible, design trop plat ». Chaque besoin est une tuile qui dit ce que le
 * professeur change : le parent coche en sachant à quoi s'attendre.
 *
 * LA COCHE VAUT ACCORD (décision de Camara) : la phrase d'accord est écrite
 * sous les cases. L'ÉCRAN ADAPTÉ est allumé d'office ; le parent peut le couper.
 *
 * `valeur` : { besoins: [codes], ecranAdapte: bool } ; `onChange` reçoit la même forme.
 */
export default function ChoixBesoins({ valeur, onChange }) {
  const id = useId();
  const besoins = valeur?.besoins ?? [];
  const ecranAdapte = valeur?.ecranAdapte !== false;
  const [ouvert, setOuvert] = useState(besoins.length > 0);

  const basculer = (code) => {
    const suivants = besoins.includes(code)
      ? besoins.filter((c) => c !== code)
      : [...besoins, code];
    onChange({ besoins: suivants, ecranAdapte });
  };

  return (
    <fieldset className={`panneau-choix panneau-choix--besoins${ouvert ? ' est-ouvert' : ''}`}>
      <legend className="besoins__legende">
        <button
          type="button"
          className="panneau-choix__tete besoins__ouvrir"
          aria-expanded={ouvert}
          aria-controls={`${id}-corps`}
          onClick={() => setOuvert(!ouvert)}
        >
          <span className="panneau-choix__icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-4.4-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z" />
            </svg>
          </span>
          <span className="panneau-choix__titres">
            <span className="panneau-choix__titre">
              Besoins particuliers
              <span className="panneau-choix__etiquette">facultatif</span>
              {besoins.length > 0 && (
                <span className="panneau-choix__compte">{besoins.length}</span>
              )}
            </span>
            <span className="panneau-choix__sous-titre">
              Dyslexie, dyscalculie, TDAH : le professeur s’adapte
            </span>
          </span>
          <span className="besoins__chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </legend>

      {ouvert && (
        <div id={`${id}-corps`} className="besoins__corps">
          <div className="besoins__tuiles">
            {BESOINS.map((b) => {
              const coche = besoins.includes(b.code);
              return (
                <label className={`besoins__tuile${coche ? ' est-coche' : ''}`} key={b.code}>
                  <input
                    type="checkbox"
                    checked={coche}
                    onChange={() => basculer(b.code)}
                  />
                  <span className="besoins__nom">{b.libelle}</span>
                  <span className="besoins__effet">{b.effet}</span>
                </label>
              );
            })}
          </div>

          {besoins.length > 0 && (
            <label className="besoins__ecran">
              <input
                type="checkbox"
                role="switch"
                checked={ecranAdapte}
                onChange={(e) => onChange({ besoins, ecranAdapte: e.target.checked })}
              />
              <span className="besoins__interrupteur" aria-hidden="true" />
              Adapter aussi l’affichage (lecture plus aérée, mode calme)
            </label>
          )}

          <div className="besoins__confidentiel">
            <span className="besoins__cadenas" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            {/* COURT D'ABORD, LE DÉTAIL SUR DEMANDE — Camara, le 11/10/2026 : le
                bloc était juste mais trop dense. La phrase d'accord reste
                visible, hors du repli : on ne consent pas à ce qu'on ne voit pas. */}
            <div>
              <p className="besoins__prive">Ces informations restent privées.</p>
              <p>
                Elles servent uniquement à adapter les séances de ton enfant. Elles ne
                lui sont jamais affichées, et le professeur ne les mentionne jamais.
              </p>
              <details className="besoins__details">
                <summary>En savoir plus sur l’utilisation de ces données</summary>
                <ul>
                  <li>
                    Le professeur adapte sa manière d’expliquer ; si tu laisses
                    l’interrupteur allumé, l’affichage s’adapte aussi.
                  </li>
                  <li>
                    Toi seul les vois, ici. Elles sont transmises au professeur pendant
                    la séance (Anthropic), jamais dans les bilans, les e-mails ni
                    l’administration de Mimia.
                  </li>
                  <li>
                    Décocher les efface aussitôt, avec la date de ton accord.
                  </li>
                </ul>
                <a href="/confidentialite" target="_blank" rel="noreferrer">
                  Lire la politique de confidentialité
                </a>
              </details>
              <p className="besoins__accord">
                En cochant, tu acceptes que Mimia utilise ces informations pour adapter
                les séances de ton enfant.
              </p>
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
