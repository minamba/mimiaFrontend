import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ouvrirSession } from '../lib/api/sessionEleveApi';
import { accueilEleve, ouvrirSessionEleve } from '../lib/storage/sessionEleve';

/**
 * L'entrée des enfants : leur code, et rien d'autre.
 *
 * ÉCRIT POUR UN ENFANT DE HUIT ANS
 * -------------------------------
 * Pas de mot « identifiant », pas de « authentification », pas de mail. Un
 * champ, six cases, son prénom qui apparaît quand c'est bon. Le vocabulaire
 * d'un formulaire de connexion adulte le ferait renoncer avant d'essayer.
 *
 * LE CODE SE TAPE COMME IL EST ÉCRIT
 * ---------------------------------
 * « kut-49r », « KUT 49R », « kut49r » : les trois marchent. Le tiret est là
 * pour l'œil quand le parent recopie le code sur un papier, il ne fait pas
 * partie du code. Refuser l'une de ces trois formes n'apprendrait rien à
 * personne et ferait appeler un adulte.
 */
/**
 * Le code, réduit à ce qu'il est vraiment : six lettres et chiffres.
 *
 * Le tiret, les espaces, la casse ne font pas partie du code — ce sont des
 * façons de l'écrire. On les retire ici, une fois, plutôt que de les refuser à
 * l'enfant.
 */
const normaliser = (saisi) =>
  saisi.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);

/**
 * Le code tel qu'on l'écrit : coupé en deux par un tiret.
 *
 * C'est la forme que le parent a sous les yeux dans son espace, celle qu'il
 * recopie sur un papier, celle qu'il dicte à voix haute. Le champ de l'enfant
 * doit donc montrer exactement la même chose — sinon il compare deux écritures
 * différentes et croit s'être trompé.
 */
const presenter = (propre) =>
  propre.length > 3 ? `${propre.slice(0, 3)}-${propre.slice(3)}` : propre;

export default function EntreeEleve() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const champRef = useRef(null);

  useEffect(() => champRef.current?.focus(), []);

  const valider = async (evenement) => {
    evenement.preventDefault();
    if (envoi || code.length < 6) return;

    setEnvoi(true);
    setErreur(null);

    try {
      const { data } = await ouvrirSession(code);

      ouvrirSessionEleve(data);
      navigate(accueilEleve(data.eleve.id), { replace: true });
    } catch (e) {
      const statut = e?.response?.status;

      // Chaque refus dit ce qu'il faut FAIRE, pas ce qui s'est passé. « 403 »
      // et « accès suspendu » ne veulent rien dire pour un enfant ; « demande
      // à un parent » lui donne la marche à suivre.
      setErreur(
        statut === 403
          ? 'Tes cours sont en pause. Demande à un parent de les rouvrir.'
          : statut === 429
            ? 'Trop d’essais. Attends un quart d’heure, puis réessaie.'
            : 'Ce code ne marche pas. Vérifie-le avec un parent.',
      );

      setCode('');
      champRef.current?.focus();
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section className="page entree-eleve">
      <h1>Bonjour !</h1>
      <p className="entree-eleve__note">
        Tape le code que tes parents t’ont donné pour retrouver tes cours.
      </p>

      <form onSubmit={valider} className="entree-eleve__forme">
        <input
          ref={champRef}
          className="entree-eleve__code"
          // AFFICHÉ AVEC LE TIRET, EXACTEMENT COMME LE PARENT LE VOIT.
          //
          // Le parent lit « YAT-CAM » sur son écran ; le champ n'en acceptait
          // que six caractères et rognait le collage à « YAT-CA », puis
          // retirait le tiret : cinq caractères, et un code refusé sans que
          // rien n'explique pourquoi. Il fallait deviner qu'il fallait ôter le
          // tiret soi-même.
          //
          // Ce qu'on affiche et ce qu'on demande doivent être le même objet.
          value={presenter(code)}
          onChange={(e) => setCode(normaliser(e.target.value))}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck="false"
          // Sept, pas six : le tiret occupe une place à l'écran. Sans ça, le
          // navigateur tronque avant même que le code arrive à notre filtre.
          maxLength={7}
          aria-label="Ton code"
          placeholder="•••-•••"
        />

        {erreur && <p className="entree-eleve__erreur">{erreur}</p>}

        <button type="submit" className="btn btn--large" disabled={code.length < 6 || envoi}>
          {envoi ? 'Un instant…' : 'C’est parti'}
        </button>
      </form>

      <p className="entree-eleve__aide">
        Tu n’as pas de code ? Demande à tes parents : il est dans leur espace,
        sur ta fiche.
      </p>
    </section>
  );
}
