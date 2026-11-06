import { createPortal } from 'react-dom';
import Avatar from '../Avatar';
import { styleMatiere, murMatiere } from '../../lib/couleurMatiere';
import pjPng from '../../assets/pj.png';
import cameraPng from '../../assets/camera.png';
import scannerPng from '../../assets/scanner.png';
import micFermePng from '../../assets/mic_b.png';
import hautParleurPng from '../../assets/haut_parleur.webp';
import '../pauseCours.css';

/**
 * LE COURS DE DÉMONSTRATION — validé par Camara le 02/11/2026.
 *
 * LE MÊME ÉCRAN QUE LE VRAI COURS, MAIS C'EST UN DESSIN. Il ne reprend que les
 * classes de `Chat.js`. Il n'appelle rien : ni le professeur, ni la voix, ni le
 * micro, ni le décompte. Un parent en essai n'a que trente minutes : le tutoriel
 * ne doit pas y toucher, et il n'y a ici aucun chemin par lequel il le pourrait.
 *
 * SI LES BOUTONS DU VRAI COURS CHANGENT, CET ÉCRAN NE SUIT PAS TOUT SEUL : c'est
 * le prix de cette garantie.
 *
 * DE VRAIS BOUTONS, SANS ACTION : les mêmes éléments que le cours, car ses styles
 * les supposent. Le voile du tutoriel les rend intouchables, sauf « Quitter ».
 */
export default function CoursDemonstration({ matiere, duree, onQuitter }) {
  const prof = matiere?.profPrenom ?? 'Ton professeur';
  const conversation = { matiereLibelle: matiere?.libelle, matiereCode: matiere?.code };

  return createPortal(
    <div className="tuto-demo" data-tuto-demo="">
      <div className="chat-espace">
        <section className="chat">
          <div
            className="chat__tete"
            data-mur={murMatiere(conversation)}
            style={styleMatiere(conversation)}
          >
            <header className="chat__entete">
              <div className="chat__prof-ligne">
                <span className="chat__prof">
                  <Avatar nom={matiere?.profAvatar} couleur={matiere?.profCouleur} taille={40} />
                  <span className="chat__titre">
                    {prof}
                    <span className="chat__eleve">{matiere?.libelle}</span>
                  </span>
                  <span className="chat__prof-chrono" data-tuto="demo-chrono">
                    {`${duree ?? 25}:00`}
                  </span>
                </span>
              </div>

              <span className="chat__gestes">
                <span className="chat__depart">
                  <button
                    type="button"
                    className="btn-quitter"
                    data-tuto="demo-quitter"
                    onClick={onQuitter}
                    aria-label="Quitter la démonstration"
                  >
                    Quitter
                  </button>
                  <button
                    type="button"
                    className="btn-pause-cours"
                    data-tuto="demo-pause"
                    tabIndex={-1}
                  >
                    <span className="btn-pause-cours__barres" aria-hidden="true" />
                    Pause
                  </button>
                </span>
              </span>

              <span className="chat__etat">
                <button type="button" className="chat__son" tabIndex={-1} aria-hidden="true">
                  <img className="chat__son-icone" src={hautParleurPng} alt="" />
                </button>
              </span>
            </header>
          </div>

          <div className="chat__fil">
            <div className="tour tour--prof">
              <div className="tour__corps">
                <div className="bulle bulle--agent">
                  Bonjour ! Moi, c’est {prof}. Dis-moi sur quoi tu veux qu’on travaille aujourd’hui.
                </div>
              </div>
            </div>

            <div className="tour tour--eleve">
              <div className="tour__corps">
                <div className="bulle bulle--eleve">
                  J’ai un exercice que je ne comprends pas.
                </div>
              </div>
            </div>

            <div className="tour tour--prof">
              <div className="tour__corps">
                <div className="bulle bulle--agent">
                  D’accord, montre-le-moi : prends-le en photo, et on le regarde ensemble au tableau.
                </div>
              </div>
            </div>
          </div>

          <div className="barre-vocale">
            <button
              type="button"
              className="bascule bascule--active"
              data-tuto="demo-detection"
              role="switch"
              aria-checked="true"
              tabIndex={-1}
            >
              <span className="bascule__piste" aria-hidden="true">
                <span className="bascule__bouton" />
              </span>
              Détection automatique de la voix
            </button>

            <span className="barre-vocale__aide">
              Parle quand tu veux, le micro se rouvre tout seul.
            </span>
          </div>

          <div className="chat__saisie">
            <button type="button" className="piece-jointe__bouton" data-tuto="demo-piece-jointe" tabIndex={-1} aria-label="Envoyer un document">
              <img src={pjPng} alt="" className="icone-png" />
            </button>

            <div className="camera-voix">
              <button type="button" className="camera-voix__bouton" data-tuto="demo-camera" tabIndex={-1} aria-label="Appareil photo">
                <img src={cameraPng} alt="" className="icone-png" />
              </button>
            </div>

            <button type="button" className="piece-jointe__bouton scanner-mobile__bouton" data-tuto="demo-scanner" tabIndex={-1} aria-label="Scanner">
              <img src={scannerPng} alt="" className="icone-png" />
            </button>

            <button type="button" className="micro" tabIndex={-1} aria-label="Micro">
              <img src={micFermePng} alt="" className="micro__icone" />
            </button>

            <textarea value="" readOnly tabIndex={-1} placeholder="Je t’écoute…" aria-hidden="true" />

            <button type="button" className="btn btn--compact" tabIndex={-1} aria-hidden="true">
              <span aria-hidden="true">➤</span>
              Envoyer
            </button>
          </div>
        </section>

        <aside className="ardoise" aria-label="Le tableau du professeur" data-tuto="demo-tableau">
          <header className="ardoise__entete">
            <span className="ardoise__titre">Le tableau</span>
            <span className="ardoise__prof">écrit par {prof}</span>
          </header>

          <div className="ardoise__surface">
            <p className="ardoise__vide">
              <span className="ardoise__craie" aria-hidden="true" />
              Ce que ton professeur écrit apparaîtra ici,
              <br />
              et y restera tant qu’il n’écrit pas autre chose.
            </p>
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  );
}
