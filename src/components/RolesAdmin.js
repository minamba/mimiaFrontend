import { useCallback, useEffect, useState } from 'react';
import { getRoles, creerRole, modifierRole, supprimerRole } from '../lib/api/adminApi';
import { LIBELLES, BLOCS } from './DroitsAdmin';

/**
 * L'ONGLET « RÔLES » — Camara, le 17/10/2026 : « un nouvel onglet Rôles où je
 * crée des rôles utilisateur », que l'on attribue ensuite aux parents.
 *
 * UN RÔLE PORTE DES DROITS : ses onglets cochés s'ouvrent à qui le porte. Les
 * rôles système ont leurs règles :
 *  - Utilisateur : le rôle par défaut, sans droit — ne se modifie pas ;
 *  - Administrateur : ouvre toujours l'administration ; ses onglets se règlent,
 *    son nom non ;
 *  - Super-admin : affiché seulement (super-administrateur seul), il vient de
 *    la configuration du serveur et ne s'attribue à personne.
 *
 * Réservé au super-administrateur, comme le serveur le vérifie.
 */
const VIDE = { id: null, nom: '', onglets: [], code: null };

export default function RolesAdmin({ onChange = null }) {
  const [donnees, setDonnees] = useState({ roles: null, onglets: [] });
  const [erreur, setErreur] = useState(null);
  const [edition, setEdition] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data } = await getRoles();
      setDonnees({ roles: data.roles ?? [], onglets: data.onglets ?? [] });
    } catch {
      setErreur('Les rôles n’ont pas pu être chargés.');
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const basculer = (cle) => setEdition((e) => ({
    ...e,
    onglets: e.onglets.includes(cle) ? e.onglets.filter((c) => c !== cle) : [...e.onglets, cle],
  }));

  const enregistrer = async (ev) => {
    ev.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      if (edition.id) await modifierRole(edition.id, edition.nom.trim(), edition.onglets);
      else await creerRole(edition.nom.trim(), edition.onglets);
      setEdition(null);
      await charger();
      onChange?.();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Le rôle n’a pas pu être enregistré.');
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async (role) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Supprimer le rôle « ${role.nom} » ? ${role.nombreComptes > 0 ? `Ses ${role.nombreComptes} compte(s) redeviendront « Utilisateur ».` : ''}`)) return;
    setErreur(null);
    try {
      await supprimerRole(role.id);
      await charger();
      onChange?.();
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Le rôle n’a pas pu être supprimé.');
    }
  };

  const sections = donnees.onglets.filter((c) => !BLOCS.includes(c));
  const blocs = donnees.onglets.filter((c) => BLOCS.includes(c));

  if (donnees.roles === null) return erreur ? <div className="alert">{erreur}</div> : <p className="roles__attente">Lecture des rôles…</p>;

  return (
    <section className="roles">
      <header className="roles__entete">
        <div>
          <h2>Les rôles</h2>
          <p>
            Un rôle dit la fonction d’un compte parent et porte ses droits : les onglets cochés
            s’ouvrent à qui le porte. Il s’attribue dans l’onglet Parents, ou à la création du compte.
          </p>
        </div>
        {!edition && (
          <button type="button" className="btn btn--compact" onClick={() => setEdition(VIDE)}>
            + Nouveau rôle
          </button>
        )}
      </header>

      {erreur && <div className="alert" role="alert">{erreur}</div>}

      {edition && (
        <form className="roles__edition" onSubmit={enregistrer}>
          <h3>{edition.id ? `Modifier « ${edition.nom || 'le rôle'} »` : 'Nouveau rôle'}</h3>
          <div className="champ">
            <label htmlFor="role-nom">Nom du rôle</label>
            <input
              id="role-nom"
              value={edition.nom}
              onChange={(e) => setEdition({ ...edition, nom: e.target.value })}
              maxLength={60}
              required
              disabled={edition.code === 'administrateur'}
              placeholder="Commercial, Enseignant, Partenaire…"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            {edition.code === 'administrateur' && (
              <span className="champ__aide">Le nom d’un rôle système ne change pas ; ses droits, si.</span>
            )}
          </div>

          <fieldset className="roles__droits">
            <legend>Les onglets qu’il ouvre</legend>
            <div className="droits__liste">
              {sections.map((cle) => (
                <label key={cle} className="droits__case">
                  <input type="checkbox" checked={edition.onglets.includes(cle)} onChange={() => basculer(cle)} />
                  <span>{LIBELLES[cle] ?? cle}</span>
                </label>
              ))}
            </div>
            {blocs.length > 0 && (
              <>
                <h4 className="droits__sous-titre">Dans l’onglet Parents</h4>
                <div className="droits__liste">
                  {blocs.map((cle) => (
                    <label key={cle} className="droits__case">
                      <input type="checkbox" checked={edition.onglets.includes(cle)} onChange={() => basculer(cle)} />
                      <span>{LIBELLES[cle] ?? cle}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            <span className="champ__aide">
              {edition.code === 'administrateur'
                ? 'Administrateur ouvre toujours l’administration, même sans onglet coché.'
                : 'Sans onglet coché, le rôle ne donne aucun accès à l’administration : c’est une simple fonction.'}
            </span>
          </fieldset>

          <div className="modale__actions">
            <button type="button" className="btn-ghost" onClick={() => setEdition(null)}>Annuler</button>
            <button type="submit" className="btn btn--compact" disabled={envoi}>
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      <ul className="roles__liste">
        {donnees.roles.map((role) => (
          <li key={role.id} className={`roles__carte${role.code ? ' est-systeme' : ''}`}>
            <div className="roles__tete">
              <strong className="roles__nom">{role.nom}</strong>
              {role.code && <span className="roles__badge">Système</span>}
              {role.ouvreAdministration && <span className="roles__badge roles__badge--acces">Accès admin</span>}
              <span className="roles__compte">
                {role.code === 'super_admin'
                  ? 'Défini par la configuration'
                  : `${role.nombreComptes} compte${role.nombreComptes > 1 ? 's' : ''}`}
              </span>
            </div>

            <p className="roles__onglets">
              {role.code === 'super_admin' && 'Tous les onglets, toujours. Ne s’attribue pas.'}
              {role.code === 'utilisateur' && 'Aucun droit : le rôle de chaque nouveau compte.'}
              {role.code !== 'super_admin' && role.code !== 'utilisateur' && (role.onglets.length === 0
                ? 'Aucun onglet coché.'
                : role.onglets.map((c) => LIBELLES[c] ?? c).join(' · '))}
            </p>

            {role.code !== 'super_admin' && role.code !== 'utilisateur' && (
              <div className="roles__actions">
                <button
                  type="button"
                  className="btn-ghost btn-ghost--mini"
                  onClick={() => setEdition({ id: role.id, nom: role.nom, onglets: role.onglets, code: role.code })}
                >
                  Modifier
                </button>
                {!role.code && (
                  <button type="button" className="btn-ghost btn-ghost--mini btn-ghost--accent" onClick={() => supprimer(role)}>
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
