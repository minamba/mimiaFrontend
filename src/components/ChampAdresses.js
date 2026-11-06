import { useMemo, useRef, useState } from 'react';

/**
 * UN CHAMP D'ADRESSES, COMME SUR GMAIL — Camara, le 19/10/2026 : les copies
 * (Cc) et les copies cachées (Cci). Chaque adresse devient une pastille quand
 * on tape Entrée, une virgule, un point-virgule ou un espace, ou quand on
 * quitte le champ ; un collage de plusieurs adresses les sépare toutes.
 * Retour arrière dans le champ vide retire la dernière. Une adresse mal
 * écrite reste visible, en rouge, pour qu'on la corrige plutôt qu'elle se
 * perde.
 *
 * `suggestions` : [{ nom, mail, equipe }] — l'équipe (`equipe`) et les parents,
 * proposés par nom ou adresse dès la première lettre, l'équipe en premier.
 */
export const REGEX_ADRESSE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

const SEPARATEURS = /[\s,;]+/;

export function adressesValides(adresses) {
  return (adresses ?? []).every((a) => REGEX_ADRESSE.test(a));
}

/** « a@x.fr, b@y.fr » (un brouillon) → ['a@x.fr', 'b@y.fr']. */
export function lireAdresses(texte) {
  return (texte ?? '').split(SEPARATEURS).map((a) => a.trim()).filter(Boolean);
}

export default function ChampAdresses({
  id, libelle, valeur = [], onChange, suggestions = [], placeholder = 'Ajouter une adresse…', autoFocus = false,
}) {
  const [saisie, setSaisie] = useState('');
  const [ouvert, setOuvert] = useState(false);
  const champ = useRef(null);
  // Les valeurs du moment, lues par la sortie du champ qui part en différé.
  const courant = useRef({ saisie, valeur });
  courant.current = { saisie, valeur };

  const ajouter = (brut) => {
    const actuelles = courant.current.valeur;
    const nouvelles = lireAdresses(brut).filter((a) => !actuelles.some((v) => v.toLowerCase() === a.toLowerCase()));
    if (nouvelles.length > 0) onChange([...actuelles, ...nouvelles]);
    setSaisie('');
  };

  const retirer = (adresse) => onChange(valeur.filter((a) => a !== adresse));

  const proposees = useMemo(() => {
    const terme = saisie.trim().toLowerCase();
    if (terme.length < 1) return [];
    const vues = new Set(valeur.map((v) => v.toLowerCase()));
    return suggestions
      .filter((s) => s.mail && ((s.nom ?? '') + ' ' + s.mail).toLowerCase().includes(terme))
      .filter((s) => {
        const cle = s.mail.toLowerCase();
        if (vues.has(cle)) return false;
        vues.add(cle);
        return true;
      })
      .sort((a, b) => Number(Boolean(b.equipe)) - Number(Boolean(a.equipe)))
      .slice(0, 8);
  }, [saisie, suggestions, valeur]);

  return (
    <div className="champ champ-adresses">
      {libelle && <label htmlFor={id}>{libelle}</label>}
      {/* Un clic n'importe où dans la zone place le curseur dans le champ. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="champ-adresses__zone" onClick={() => champ.current?.focus()}>
        {valeur.map((adresse) => (
          <span
            key={adresse}
            className={`champ-adresses__pastille${REGEX_ADRESSE.test(adresse) ? '' : ' est-invalide'}`}
            title={REGEX_ADRESSE.test(adresse) ? adresse : 'Adresse mal écrite'}
          >
            {adresse}
            <button type="button" aria-label={`Retirer ${adresse}`} onClick={() => retirer(adresse)}>×</button>
          </span>
        ))}
        <input
          ref={champ}
          id={id}
          type="text"
          inputMode="email"
          autoComplete="off"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          value={saisie}
          placeholder={valeur.length === 0 ? placeholder : ''}
          onChange={(e) => {
            const texte = e.target.value;
            // Un séparateur tapé ou collé : ce qui précède devient une pastille.
            if (SEPARATEURS.test(texte)) {
              const morceaux = texte.split(SEPARATEURS);
              const reste = morceaux.pop() ?? '';
              ajouter(morceaux.join(' '));
              setSaisie(reste);
            } else {
              setSaisie(texte);
            }
            setOuvert(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && saisie.trim()) {
              e.preventDefault();
              ajouter(saisie);
            } else if (e.key === 'Backspace' && !saisie && valeur.length > 0) {
              retirer(valeur[valeur.length - 1]);
            }
          }}
          // Le délai laisse un clic sur une suggestion se produire d'abord.
          onBlur={() => setTimeout(() => {
            setOuvert(false);
            if (courant.current.saisie.trim()) ajouter(courant.current.saisie);
          }, 150)}
        />
      </div>

      {ouvert && proposees.length > 0 && (
        <ul className="champ-adresses__suggestions">
          {proposees.map((s) => (
            <li key={s.mail}>
              <button type="button" onMouseDown={() => { ajouter(s.mail); setOuvert(false); }}>
                <span className="champ-adresses__nom">
                  {s.nom || s.mail}
                  {s.equipe && <span className="champ-adresses__equipe">Équipe</span>}
                </span>
                {s.nom && <span className="champ-adresses__mail">{s.mail}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!adressesValides(valeur) && (
        <span className="champ__aide champ__aide--alerte">Une adresse en rouge est mal écrite : corrigez-la ou retirez-la.</span>
      )}
    </div>
  );
}
