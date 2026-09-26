import { useBlueSky } from '../lib/storage/modeTest';
import { useSalleDAttente } from '../lib/affluence/salleDAttente';
import logoFondClair from '../assets/logo-fond-clair.png';
import logoFondSombre from '../assets/logo-fond-sombre.png';

/**
 * L'écran de file d'attente.
 *
 * VOULU PAR CAMARA LE 25/09/2026 : « mettre les personnes dans une file
 * d'attente si le serveur ne supporte pas ». C'est la moitié visible du
 * dispositif ; l'autre est le plafond d'admission côté serveur, qui fait le
 * travail. Sans lui, cet écran serait une politesse sans effet.
 *
 * IL REPREND LE RIDEAU DE MAINTENANCE, classes comprises. Les deux disent la
 * même chose au même moment de la visite — « pas tout de suite, et voilà
 * pourquoi » — et un visiteur qui connaît l'un reconnaît l'autre. Recopier une
 * mise en page pour la faire dériver ensuite serait le seul résultat d'une
 * feuille séparée.
 *
 * TROIS CHOSES, ET DANS CET ORDRE
 * -------------------------------
 * 1. Son rang, en gros. C'est la seule question qu'on se pose dans une file.
 * 2. Que sa place est gardée. C'est ce qui empêche de recharger la page —
 *    or recharger est exactement ce qui allonge la file pour tout le monde.
 * 3. Que rien n'est cassé. Un parent qui croit le site en panne s'en va ;
 *    un parent qui voit une file attend.
 *
 * PAS DE COMPTE À REBOURS QUAND ON NE SAIT PAS. L'estimation n'apparaît que
 * lorsque le serveur a vu assez de gens sortir pour en calculer une. Annoncer
 * « environ 2 minutes » au jugé, c'est promettre — et une promesse ratée fait
 * partir celui qui serait resté.
 */
export default function SalleDAttente() {
  const blueSky = useBlueSky();
  const { rang, devant, attenteSecondes } = useSalleDAttente();

  return (
    <div className={`maintenance${blueSky ? ' maintenance--blue-sky' : ''}`}>
      <main className="maintenance__carte">
        {blueSky ? (
          <img src={logoFondSombre} alt="Mimia" className="maintenance__logo" />
        ) : (
          <>
            <img
              src={logoFondClair}
              alt="Mimia"
              className="maintenance__logo maintenance__logo--clair"
            />
            <img
              src={logoFondSombre}
              alt="Mimia"
              className="maintenance__logo maintenance__logo--sombre"
            />
          </>
        )}

        <p className="maintenance__badge">
          <span className="maintenance__badge-point" aria-hidden="true" />
          Beaucoup de monde en ce moment
        </p>

        <h1 className="maintenance__titre">Vous êtes en file d&apos;attente</h1>

        {/* LE RANG EST ANNONCÉ, PAS SEULEMENT AFFICHÉ. Un lecteur d'écran qui
            énoncerait « 347 » tout seul ne dirait rien ; la zone est donc
            polie (`aria-live="polite"`) pour que la progression se suive sans
            interrompre ce que la personne est en train de lire. */}
        <div className="salle__rang" aria-live="polite">
          <span className="salle__numero">{rang}</span>
          <span className="salle__legende">
            {devant === 0
              ? 'Vous êtes le prochain'
              : `${devant} personne${devant > 1 ? 's' : ''} devant vous`}
          </span>
        </div>

        <div className="salle__barre" aria-hidden="true"><span /></div>

        {attenteSecondes !== null && (
          <p className="maintenance__texte">
            Attente estimée&nbsp;: <strong>{formuler(attenteSecondes)}</strong>.
          </p>
        )}

        <p className="maintenance__texte">
          <strong>Ne fermez pas cette page</strong>&nbsp;: votre place est
          gardée et vous entrerez automatiquement à votre tour. Inutile de
          rafraîchir — cela ne fait pas avancer la file.
        </p>

        <p className="maintenance__texte maintenance__texte--doux">
          Rien n&apos;est en panne&nbsp;: nous limitons le nombre de personnes à
          la fois pour que les cours de ceux qui sont entrés se passent bien.
        </p>
      </main>
    </div>
  );
}

/**
 * L'attente, dite comme on la dirait à quelqu'un.
 *
 * ON NE DIT JAMAIS LES SECONDES. « 47 secondes » invite à les compter, et à
 * constater qu'elles ne tombent pas juste ; « moins d'une minute » dit la même
 * chose et ne se fait pas prendre en défaut.
 */
function formuler(secondes) {
  if (secondes < 60) return "moins d'une minute";

  const minutes = Math.ceil(secondes / 60);
  if (minutes < 60) return `environ ${minutes} minute${minutes > 1 ? 's' : ''}`;

  const heures = Math.ceil(minutes / 60);
  return `plus d'${heures > 1 ? `${heures} heures` : 'une heure'}`;
}
