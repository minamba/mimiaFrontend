/**
 * LA FILIÈRE PROFESSIONNELLE DE L'ENFANT — Camara, le 15/10/2026 : « un élève
 * en pro va s'y retrouver dans Mimia ? ».
 *
 * En SECONDE PRO, la famille de métiers (la spécialité ne se choisit qu'en fin
 * de seconde) — ou « hors famille » pour l'ASSP, la sécurité, l'animation… En
 * PREMIÈRE et TERMINALE PRO, la spécialité : les douze plus suivies, et « Une
 * autre spécialité » avec son nom écrit à la main.
 *
 * FACULTATIF : sans elle, rien ne manque à l'enfant. Avec elle, le professeur
 * prend ses exemples dans son métier, et la physique-chimie disparaît des
 * filières qui ne l'ont pas. N'existe que dans les classes pro : le serveur le
 * dit classe par classe (`filierePro`), et c'est lui qui filtre à l'arrivée.
 */
const HORS_FAMILLE = 'HORS_FAMILLE';
const AUTRE = 'AUTRE';

export default function ChoixFilierePro({ id, filiere, valeur, onChange }) {
  if (!filiere) return null;

  const { familleMetiers = '', specialitePro = '', specialiteProLibre = '' } = valeur ?? {};
  const changer = (modif) => onChange({ familleMetiers, specialitePro, specialiteProLibre, ...modif });

  const enSeconde = filiere.etape === 'famille';
  const horsFamille = familleMetiers === HORS_FAMILLE;
  // En seconde, la spécialité ne se demande que hors famille (ASSP, sécurité…) ;
  // en première et en terminale, toujours.
  const specialitesMontrees = enSeconde
    ? filiere.specialites.filter((s) => !s.precision)
    : filiere.specialites;
  const montrerSpecialite = !enSeconde || horsFamille;

  return (
    <fieldset className="champ filiere-pro" aria-describedby={`${id}-aide`}>
      <legend>Sa filière <span className="filiere-pro__facultatif">facultatif</span></legend>

      {enSeconde && (
        <div className="champ">
          <label htmlFor={`${id}-famille`}>Sa famille de métiers</label>
          <select
            id={`${id}-famille`}
            value={familleMetiers}
            onChange={(e) => changer({
              familleMetiers: e.target.value,
              // Hors famille, la spécialité se demande ; sinon elle n'a pas lieu d'être en seconde.
              ...(e.target.value === HORS_FAMILLE ? {} : { specialitePro: '', specialiteProLibre: '' }),
            })}
          >
            <option value="">Je ne sais pas / plus tard</option>
            {filiere.familles.map((f) => (
              <option key={f.code} value={f.code}>{f.libelle}</option>
            ))}
            <option value={HORS_FAMILLE}>Hors famille de métiers (ASSP, sécurité, animation…)</option>
          </select>
        </div>
      )}

      {montrerSpecialite && (
        <div className="champ">
          <label htmlFor={`${id}-specialite`}>Sa spécialité de bac pro</label>
          <select
            id={`${id}-specialite`}
            value={specialitePro}
            onChange={(e) => changer({
              specialitePro: e.target.value,
              ...(e.target.value === AUTRE ? {} : { specialiteProLibre: '' }),
            })}
          >
            <option value="">Je ne sais pas / plus tard</option>
            {specialitesMontrees.map((s) => (
              <option key={s.code} value={s.code}>{s.libelle}</option>
            ))}
          </select>
        </div>
      )}

      {montrerSpecialite && specialitePro === AUTRE && (
        <div className="champ">
          <label htmlFor={`${id}-libre`}>Laquelle ?</label>
          <input
            id={`${id}-libre`}
            type="text"
            maxLength={80}
            placeholder="Ex. : Optique lunetterie, Métiers de la coiffure…"
            value={specialiteProLibre}
            onChange={(e) => changer({ specialiteProLibre: e.target.value })}
          />
        </div>
      )}

      <span id={`${id}-aide`} className="champ__aide">
        Son professeur prendra ses exemples dans son métier : un devis, un client, une intervention…
      </span>
    </fieldset>
  );
}
