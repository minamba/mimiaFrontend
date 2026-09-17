import { useEffect, useState } from 'react';
import { getOngletsAdmin, definirOngletsAdmin } from '../lib/api/adminApi';

/**
 * Les sections du tableau de bord ouvertes à un administrateur — voulu par
 * Camara le 17/09/2026.
 *
 * POURQUOI LA LISTE VIENT DU SERVEUR ET N'EST PAS ÉCRITE ICI
 * ---------------------------------------------------------
 * `Admin.js` connaît déjà la barre d'onglets, et on aurait pu la relire. Mais
 * l'autorisation, elle, vit côté serveur : c'est lui qui dit quelles clés
 * existent. Les tenir à deux endroits aurait fini par en laisser une de côté,
 * et une section oubliée ici serait invisible pour toujours — cochée nulle
 * part, donc jamais accordée à personne.
 *
 * Le serveur rend donc les deux listes dans le même appel : ce qui existe, et
 * ce qui est déjà accordé.
 *
 * RIEN N'EST ENREGISTRÉ AVANT LE BOUTON. Un droit d'accès qui se poserait à
 * chaque clic de case laisserait un état intermédiaire réel — trois sections
 * ouvertes pendant qu'on hésite sur la quatrième. On coche, on relit, on
 * valide.
 */
const LIBELLES = {
  stats: 'Statistiques',
  frequentation: 'Fréquentation',
  parents: 'Parents',
  mails: 'Mails',
  promos: 'Promos',
  eleves: 'Élèves',
  avis: 'Avis',
  schemas: 'Schémas',
  programme: 'Programme scolaire',
  periodes: 'Périodes scolaires',
  signalements: 'Signalements',
  idees: 'Idées',
  fournisseurs: 'Anthropic / OpenAI',
};

export default function DroitsAdmin({ parent, onFermer, onEnregistre }) {
  const [toutes, setToutes] = useState([]);
  const [cochees, setCochees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;

    (async () => {
      try {
        const { data } = await getOngletsAdmin(parent.id);
        if (!vivant) return;

        setToutes(data.toutes ?? []);
        setCochees(data.accordes ?? []);
      } catch {
        if (vivant) setErreur('Les droits de ce compte n’ont pas pu être lus.');
      } finally {
        if (vivant) setChargement(false);
      }
    })();

    return () => { vivant = false; };
  }, [parent.id]);

  // Échap ferme, comme partout ailleurs dans l'administration.
  useEffect(() => {
    const auClavier = (e) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', auClavier);

    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  const basculer = (cle) => setCochees((precedentes) => (
    precedentes.includes(cle)
      ? precedentes.filter((c) => c !== cle)
      : [...precedentes, cle]
  ));

  const enregistrer = async () => {
    setEnvoi(true);
    setErreur(null);

    try {
      await definirOngletsAdmin(parent.id, cochees);
      onEnregistre?.();
      onFermer();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Les droits n’ont pas pu être enregistrés.');
      setEnvoi(false);
    }
  };

  const nom = [parent.prenom, parent.nom].filter(Boolean).join(' ') || parent.mail;

  return (
    <div
      className="modale"
      role="dialog"
      aria-modal="true"
      aria-label={`Droits de ${nom}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}
    >
      <div className="modale__boite modale__boite--droits">
        <h3 className="modale__titre">Droits de {nom}</h3>

        <p className="droits__aide">
          Les sections cochées sont visibles dans son tableau de bord. Les autres
          n’apparaissent pas.
        </p>

        {erreur && <div className="alert">{erreur}</div>}

        {chargement ? (
          <p className="droits__attente">Lecture des droits…</p>
        ) : (
          <>
            <div className="droits__liste">
              {toutes.map((cle) => (
                <label key={cle} className="droits__case">
                  <input
                    type="checkbox"
                    checked={cochees.includes(cle)}
                    onChange={() => basculer(cle)}
                  />
                  <span>{LIBELLES[cle] ?? cle}</span>
                </label>
              ))}
            </div>

            {/* LE COMPTE VIDE SE DIT. Un administrateur sans aucune section
                voit un tableau de bord vide, et c'est exactement ce que veut
                Camara à la nomination — mais qui referme cette fenêtre sans
                rien cocher doit savoir ce qu'il vient de laisser. */}
            {cochees.length === 0 && (
              <p className="droits__vide">
                Aucune section cochée : son tableau de bord sera vide.
              </p>
            )}
          </>
        )}

        <div className="modale__actions">
          <button
            type="button"
            className="btn btn--compact"
            disabled={chargement || envoi}
            onClick={enregistrer}
          >
            {envoi ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button type="button" className="btn-ghost" onClick={onFermer}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
