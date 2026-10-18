import { useState } from 'react';
import { connecterBoite } from '../lib/api/adminApi';
import ChampMotDePasse from './ChampMotDePasse';

/**
 * CONNECTER SA BOÎTE MAIL — Camara, le 17/10/2026 : « la première fois que
 * l'utilisateur clique sur l'onglet mail, lui demander son mot de passe pour
 * récupérer sa boîte et qu'il puisse envoyer des emails ».
 *
 * L'adresse est proposée d'office quand le compte est au nom du site. Le mot de
 * passe est ESSAYÉ chez LWS avant d'être gardé (un mot de passe faux n'est
 * jamais enregistré), puis gardé chiffré sur le serveur.
 *
 * `code` : « a_configurer » (première fois), « illisible » (à ressaisir),
 * « cle_absente » (la clé manque sur le serveur : rien à saisir ici).
 */
export default function ConnexionBoite({ code, adresse = '', message = null, onConnectee }) {
  const [champs, setChamps] = useState({ adresse: adresse ?? '', motDePasse: '' });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  if (code === 'cle_absente') {
    return (
      <div className="connexion-boite">
        <h3>La messagerie n’est pas encore prête</h3>
        <p>{message ?? 'La clé de chiffrement des boîtes manque sur le serveur.'}</p>
        <p className="champ__aide">
          À poser une fois sur le serveur (variable <code>MIMIA_CLE_BOITES</code>, une longue phrase
          secrète), puis redémarrer l’API.
        </p>
      </div>
    );
  }

  const soumettre = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await connecterBoite(champs.adresse.trim(), champs.motDePasse);
      setChamps((c) => ({ ...c, motDePasse: '' }));
      onConnectee?.();
    } catch (ex) {
      setErreur(ex?.response?.data?.message ?? 'La boîte n’a pas pu être connectée. Réessayez.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form className="connexion-boite" onSubmit={soumettre}>
      <span className="connexion-boite__pastille" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      </span>
      <h3>{code === 'illisible' ? 'Ressaisissez le mot de passe de votre boîte' : 'Connectez votre boîte mail'}</h3>
      <p>
        Vos messages seront lus dans votre boîte et vos réponses partiront de votre adresse,
        avec votre signature. Le mot de passe est vérifié auprès de LWS, puis gardé chiffré.
      </p>

      {erreur && <div className="alert" role="alert">{erreur}</div>}

      <div className="champ">
        <label htmlFor="boite-adresse">Adresse de la boîte</label>
        <input
          id="boite-adresse"
          type="email"
          autoComplete="username"
          value={champs.adresse}
          onChange={(e) => setChamps({ ...champs, adresse: e.target.value })}
          placeholder="prenom@mimia.fr"
          required
        />
      </div>

      {/* L'ŒIL POUR VOIR CE QU'ON TAPE (Camara, le 17/10/2026) : le même champ
          que les mots de passe de « Mon compte ». */}
      <ChampMotDePasse
        id="boite-mdp"
        label="Mot de passe de la boîte"
        valeur={champs.motDePasse}
        onChanger={(v) => setChamps({ ...champs, motDePasse: v })}
        aide="Celui de votre boîte chez LWS, pas celui de votre compte Mimia."
      />

      <button type="submit" className="btn" disabled={envoi}>
        {envoi ? 'Vérification…' : 'Connecter ma boîte'}
      </button>
    </form>
  );
}
