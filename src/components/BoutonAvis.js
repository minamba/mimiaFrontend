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
 * orange aux étoiles, remplace l'étoile dessinée. Comme pour le thème, le
 * bouton s'efface derrière la pièce ronde (voir `.bouton-avis` dans App.css).
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
        {/* Décorative : l'intitulé du bouton dit déjà ce qu'il fait. */}
        <img className="bouton-avis__icone" src={iconeNote} alt="" />
      </button>

      {ouvert && <AvisModale onFermer={() => setOuvert(false)} />}
    </>
  );
}
