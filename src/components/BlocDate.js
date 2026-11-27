import { jourLocal } from '../lib/datesEpreuves';

/**
 * LE BLOC DE DATE — maquettes de Camara (25/11/2026) : à gauche le calendrier à feuillets (bandeau à la couleur de la
 * matière, deux anneaux, le jour en grand, le mois dessous), au centre la date et l'horaire, à droite les jours
 * restants. Le même pour les épreuves d'examen, les contrôles et les examens blancs (« je veux la même présentation »).
 *
 * @param {string} date    le jour (« 2027-06-24T00:00:00 » ou « 2027-06-24 ») : la feuille du calendrier
 * @param {string} [dateFin] un second jour possible (« le 16 ou le 17 ») : la feuille dit « 16-17 »
 * @param {string} titre   la date en toutes lettres
 * @param {string} [detail] l'horaire, la durée
 * @param {number|null} [jours] les jours restants ; rien n'est compté si null ou négatif
 */
export default function BlocDate({ date, dateFin = null, titre, detail = null, jours = null }) {
  const debut = jourLocal(date);
  if (!debut) return null;
  const fin = jourLocal(dateFin);

  const mois = debut.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
  const feuille = String(debut.getDate()).padStart(2, '0') + (fin ? `-${String(fin.getDate()).padStart(2, '0')}` : '');
  // Neutre au-delà d'un mois, ambre sous 30 jours, corail sous 7.
  const ton = jours === null || jours === undefined ? null : jours <= 7 ? 'proche' : jours <= 30 ? 'bientot' : 'loin';

  return (
    <div className="epreuve-date">
      <span className="epreuve-date__calendrier" aria-hidden="true">
        <span className={`epreuve-date__jour${fin ? ' est-double' : ''}`}>{feuille}</span>
        <span className="epreuve-date__mois">{mois}</span>
      </span>
      <span className="epreuve-date__corps">
        <strong className="epreuve-date__titre">{titre}</strong>
        {detail && (
          <span className="epreuve-date__horaire"><span aria-hidden="true">🕘</span> {detail}</span>
        )}
      </span>
      {ton && jours >= 0 && (
        <span className={`epreuve-date__rebours est-${ton}`}>
          {jours === 0 ? (
            <span className="epreuve-date__nombre">Aujourd’hui</span>
          ) : (
            <>
              <span className="epreuve-date__nombre">{jours}</span>
              <span className="epreuve-date__unite">jour{jours > 1 ? 's' : ''} restant{jours > 1 ? 's' : ''}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}

/** « 07:00:00 » → « 7 h 00 », comme sur la maquette ; null sans heure. */
export const heureBloc = (valeur) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(valeur ?? '');
  return m ? `${Number(m[1])} h ${m[2]}` : null;
};

/**
 * LA DATE D'UN CONTRÔLE (ou d'un examen blanc) DANS LE BLOC DES ÉPREUVES — Camara, le 25/11/2026 : « je veux la même
 * présentation ». « Jeudi 26 novembre » (sans l'année : un contrôle se prépare de près), l'heure, et les jours
 * restants. Ici et non dans MesControles : MesControles importe la carte d'examen blanc, qui en a besoin aussi.
 */
export function BlocDateControle({ date, heure, jours }) {
  const debut = jourLocal(date);
  if (!debut) return null;
  const jour = debut.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <BlocDate
      date={date}
      titre={jour.charAt(0).toUpperCase() + jour.slice(1)}
      detail={heureBloc(heure)}
      jours={typeof jours === 'number' ? Math.max(0, jours) : null}
    />
  );
}
