import { useState } from 'react';
import iconeNote from '../assets/note.png';
import AvisModale from './AvisModale';

/**
 * Ouvre le formulaire d'avis depuis « Mes matières », le même réglage
 * partagé qu'ailleurs (voir `AvisModale.js`) — juste à côté de
 * `<BoutonTheme />`, sur cette page où le parent comme l'enfant passent
 * vraiment, contrairement à la page d'accueil publique ou « Mon compte ».
 *
 * UN MÉDAILLON ILLUSTRÉ DEPUIS LE 14/09/2026 — Camara : `note.png`, la boule
 * orange aux étoiles, remplace l'étoile dessinée.
 *
 * DANS UNE BULLE, AVEC SON TEXTE — Camara, le 07/11/2026 : « je veux que ce
 * soit dans une bulle avec un texte "Mon avis sur Mimia" », comme le bouton
 * « Signaler ». La boule seule ne disait pas ce qu'elle ouvrait.
 */
export default function BoutonAvis() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        type="button"
        className="bouton-avis"
        onClick={() => setOuvert(true)}
        aria-label="Donner votre avis sur Mimia"
        title="Donner votre avis sur Mimia"
      >
        {/* Décorative : le texte du bouton dit déjà ce qu'il fait. */}
        <img className="bouton-avis__icone" src={iconeNote} alt="" />
        <span className="bouton-avis__texte">Mon avis sur Mimia</span>
      </button>

      {ouvert && <AvisModale onFermer={() => setOuvert(false)} />}
    </>
  );
}
