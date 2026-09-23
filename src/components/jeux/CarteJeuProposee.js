import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { jeuxDeLaClasse } from '../../lib/jeux/catalogue';
import { rangDeLaClasse } from '../../lib/jeux/frise';
import { cycleDuNiveau } from '../../lib/niveauCycle';
import { useJeuxOuverts } from '../../lib/storage/modeTest';
import { sessionEleve } from '../../lib/storage/sessionEleve';

/**
 * LA CARTE DU JEU PROPOSÉ, sous la bulle du professeur.
 *
 * Camara, le 23/09/2026 : « les jeux seront une extension des cours ». Quand
 * la conclusion porte `[JEU]CE1/course-des-tables[/JEU]`, la balise disparaît
 * du texte et cette carte prend sa place : la couverture, le titre, la classe,
 * et un bouton qui ouvre le jeu directement — à cette classe-là.
 *
 * ELLE NE SE DESSINE QUE SI TOUT EST VRAI : le jeu existe à cette classe, la
 * classe n'est pas au-dessus de celle de l'enfant, et la porte des jeux est
 * ouverte pour son cycle. Le serveur a déjà vérifié tout ça avant de garder la
 * balise ; on le revérifie ici parce qu'un message reste dans l'historique des
 * semaines, et qu'un jeu peut avoir disparu entre-temps. Une carte vers un jeu
 * qui n'existe plus serait une promesse sans bouton — on préfère la phrase du
 * professeur seule.
 *
 * L'IDENTITÉ DE L'ENFANT suit les mêmes deux chemins que « Mes jeux » : la
 * liste des enfants quand c'est le parent qui regarde, la session quand c'est
 * l'enfant lui-même.
 */
export default function CarteJeuProposee({ classe, cle }) {
  const { eleveId } = useParams();
  const { liste } = useSelector((etat) => etat.eleves);

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const enfant = sessionEleve();
  const sien = String(enfant?.eleveId) === String(eleveId);

  const niveauCode = eleve?.niveauCode ?? (sien ? (enfant?.niveauCode || enfant?.niveau) : null);
  const cycle = eleve?.niveauCycle
    ?? (sien ? enfant?.cycle : null)
    ?? cycleDuNiveau(eleve?.niveauLibelle ?? (sien ? enfant?.niveau : null));

  const ouverte = useJeuxOuverts(cycle);

  const jeu = jeuxDeLaClasse(classe).find((j) => j.cle === cle);
  const rangSien = rangDeLaClasse(niveauCode);
  const rangDuJeu = rangDeLaClasse(classe);
  const accessible = rangSien !== null && rangDuJeu !== null && rangDuJeu <= rangSien;

  if (!ouverte || !jeu || !accessible) return null;

  return (
    <Link
      to={`/eleves/${eleveId}/jeux?classe=${encodeURIComponent(classe)}&jeu=${encodeURIComponent(cle)}`}
      className={`jeu-propose${jeu.image ? ' jeu-propose--illustre' : ''}`}
    >
      {jeu.image && (
        <span className="jeu-propose__couverture" aria-hidden="true">
          <img src={jeu.image} alt="" />
        </span>
      )}

      <span className="jeu-propose__corps">
        <span className="jeu-propose__sur">Un jeu pour t’entraîner</span>
        <strong className="jeu-propose__titre">{jeu.titre}</strong>
        <span className="jeu-propose__detail">
          <span className="jeu-propose__classe">{classe}</span>
          {jeu.accroche && <span className="jeu-propose__accroche">{jeu.accroche}</span>}
        </span>
      </span>

      <span className="jeu-propose__jouer">
        <span className="jeu-propose__triangle" aria-hidden="true" />
        Jouer
      </span>
    </Link>
  );
}
