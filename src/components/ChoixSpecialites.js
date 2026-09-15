import { basculerSpecialite } from '../lib/niveauxScolaires';

/**
 * Les spécialités de l'enfant, cochées par le parent.
 *
 * Voulu par Camara le 14/09/2026 : au bac général, les écrits de terminale
 * sont la philosophie et les deux spécialités gardées. Sans elles, la section
 * « Préparation au bac » ne peut rien dire de juste.
 *
 * N'EXISTE QU'EN PREMIÈRE ET EN TERMINALE GÉNÉRALES — le serveur le dit classe
 * par classe. Ailleurs, rien n'est affiché et rien n'est envoyé.
 */
export default function ChoixSpecialites({ id, nombre, possibles, valeur, onChange }) {
  if (!nombre || possibles.length === 0) return null;

  const cochees = valeur ?? [];
  const complet = cochees.length >= nombre;

  return (
    <fieldset className="champ specialites" aria-describedby={`${id}-aide`}>
      <legend>Ses spécialités</legend>

      <div className="specialites__liste">
        {possibles.map((s) => {
          const cochee = cochees.includes(s.code);

          return (
            <label key={s.code} className="case">
              <input
                type="checkbox"
                checked={cochee}
                disabled={!cochee && complet}
                onChange={() => onChange(basculerSpecialite(cochees, s.code, nombre))}
              />
              {/* Le sigle en tête pour toutes les spécialités de langue, le nom
                  officiel en petit dessous : on cherche « LLCER espagnol », on
                  le trouve, sans perdre ce que le sigle veut dire. */}
              <span className="specialites__texte">
                {s.libelle}
                {s.precision && <span className="specialites__precision">{s.precision}</span>}
              </span>
            </label>
          );
        })}
      </div>

      <span id={`${id}-aide`} className="champ__aide">
        {nombre === 3
          ? 'En première, coche ses trois spécialités.'
          : 'En terminale, coche les deux spécialités qu’il a gardées.'}{' '}
        {cochees.length} sur {nombre} cochée{cochees.length > 1 ? 's' : ''}. Elles décident des
        épreuves du bac qu’il prépare.
        {possibles.some((s) => s.code.startsWith('LLCER_') || s.code === 'AMC') && (
          <>
            {' '}Les LLCER sont des spécialités, différentes de la LVA et de la LVB : la LVB
            n’a pas d’épreuve finale au bac, la spécialité LLCER en a une.
          </>
        )}
      </span>
    </fieldset>
  );
}
