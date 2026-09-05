import { useCallback, useEffect, useState } from 'react';
import { getBannis, ajouterBanni, leverBanni } from '../lib/api/adminApi';

/**
 * LA LISTE DES ADRESSES BANNIES.
 *
 * POURQUOI ELLE EXISTE SÉPARÉMENT DU TABLEAU DES PARENTS
 * ------------------------------------------------------
 * Un bannissement survit au compte. Quelqu'un qu'on met dehors supprime
 * souvent le sien dans la foulée, puis revient le lendemain avec la même
 * adresse — et à ce moment-là, il n'y a plus aucune ligne dans le tableau des
 * parents où poser le geste inverse. Cette liste est le seul endroit d'où l'on
 * peut encore lever le bannissement.
 *
 * ELLE SIGNALE LES COMPTES DISPARUS, et c'est ce qui la rend lisible : une
 * adresse dont le compte tourne encore désigne quelqu'un qu'on a mis dehors
 * sans l'effacer ; une adresse orpheline désigne quelqu'un dont il ne reste
 * que cette ligne. Les deux situations n'appellent pas les mêmes gestes.
 *
 * L'AJOUT À LA MAIN N'EST PAS UN CONFORT. C'est le seul chemin pour fermer la
 * porte à quelqu'un qui n'a pas encore de compte — ou qui vient de supprimer
 * le sien avant qu'on ait eu le temps d'agir.
 */
export default function Bannis({ version }) {
  const [bannis, setBannis] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [ouvert, setOuvert] = useState(false);
  const [mail, setMail] = useState('');
  const [motif, setMotif] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(() => {
    setChargement(true);

    return getBannis()
      .then(({ data }) => setBannis(Array.isArray(data) ? data : []))
      .catch(() => setErreur("La liste n'a pas pu être chargée."))
      .finally(() => setChargement(false));
  }, []);

  // `version` est incrémenté par l'écran parent après un bannissement fait
  // depuis le tableau : c'est ce qui fait réapparaître la liste à jour sans
  // que les deux composants aient besoin de se connaître davantage.
  useEffect(() => { charger(); }, [charger, version]);

  const ajouter = async (e) => {
    e.preventDefault();

    setEnvoi(true);
    setErreur(null);

    try {
      await ajouterBanni(mail.trim(), motif.trim());

      setMail('');
      setMotif('');
      setOuvert(false);
      await charger();
    } catch (err) {
      setErreur(err?.response?.data?.message ?? "L'adresse n'a pas pu être bannie.");
    } finally {
      setEnvoi(false);
    }
  };

  const lever = async (adresse) => {
    setErreur(null);

    try {
      await leverBanni(adresse);
      await charger();
    } catch {
      setErreur("Le bannissement n'a pas pu être levé.");
    }
  };

  return (
    <details className="bannis" open={bannis.length > 0}>
      <summary className="bannis__titre">
        Adresses bannies
        <span className="bannis__compte">{chargement ? '…' : bannis.length}</span>
      </summary>

      <div className="bannis__corps">
        {erreur && <div className="alert">{erreur}</div>}

        <p className="bannis__note">
          Une adresse bannie ne peut ni se connecter, ni créer de compte — y
          compris par Google, et y compris si son compte existe encore. Le
          refus est appliqué par le serveur d’identité, avant toute session.
        </p>

        {bannis.length === 0 && !chargement ? (
          <p className="etat-vide">Aucune adresse bannie.</p>
        ) : (
          <ul className="bannis__liste">
            {bannis.map((b) => (
              <li key={b.id}>
                <div className="bannis__infos">
                  <strong>{b.mail}</strong>

                  <span className="bannis__meta">
                    {/* LE COMPTE DISPARU EST SIGNALÉ, pas déduit. C'est
                        l'information qui dit pourquoi cette ligne est le seul
                        endroit où l'adresse existe encore. */}
                    {b.compteExiste ? 'compte actif' : 'compte supprimé'}
                    {' · '}
                    {new Date(b.dateCreation).toLocaleDateString('fr-FR')}
                    {b.banniPar ? ` · par ${b.banniPar}` : ''}
                  </span>

                  {b.motif && <span className="bannis__motif">« {b.motif} »</span>}
                </div>

                <button
                  type="button"
                  className="btn-ghost btn-ghost--mini"
                  onClick={() => lever(b.mail)}
                >
                  Lever
                </button>
              </li>
            ))}
          </ul>
        )}

        {ouvert ? (
          <form className="bannis__ajout" onSubmit={ajouter}>
            <div className="champ">
              <label htmlFor="banni-mail">Adresse à bannir</label>
              <input
                id="banni-mail"
                type="email"
                required
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="adresse@exemple.fr"
              />
            </div>

            <div className="champ">
              <label htmlFor="banni-motif">Motif</label>
              <input
                id="banni-motif"
                maxLength={300}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Impayés répétés, comportement abusif…"
              />
              <span className="champ__aide">
                {/* Facultatif, et pourtant ce qui compte le plus longtemps :
                    une adresse seule, retrouvée dans six mois, ne dit pas si
                    elle a été bannie pour fraude ou par erreur. */}
                Facultatif, mais c’est lui qui rendra la décision révisable dans
                six mois.
              </span>
            </div>

            <div className="bannis__actions">
              <button type="submit" className="btn btn--compact" disabled={envoi}>
                {envoi ? 'Enregistrement…' : 'Bannir cette adresse'}
              </button>

              <button
                type="button"
                className="btn btn--compact btn--fantome"
                onClick={() => setOuvert(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="btn btn--compact btn--fantome"
            onClick={() => setOuvert(true)}
          >
            Bannir une adresse à la main
          </button>
        )}
      </div>
    </details>
  );
}
